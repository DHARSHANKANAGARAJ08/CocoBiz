import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const saleSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  saleDate: z.string().optional(),
  product: z.enum(["COCONUT", "HUSK", "COPRA"]),
  quantity: z.coerce.number().min(1, "Quantity must be greater than zero"),
  unitPrice: z.coerce.number().min(0.01, "Unit price must be greater than zero"),
  paymentStatus: z.enum(["PAID", "PARTIALLY_PAID", "UNPAID"]).default("PAID"),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"]).default("CASH"),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const product = searchParams.get("product");

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (product && product !== "ALL") where.product = product;

    const sales = await prisma.sale.findMany({
      where,
      orderBy: { saleDate: "desc" },
      include: { customer: true },
    });

    return NextResponse.json({ success: true, data: sales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = saleSchema.parse(body);

    // 1. Verify Available Inventory for Product (INVENTORY VALIDATION!)
    const txs = await prisma.inventoryTransaction.findMany({
      where: { product: validated.product },
    });
    const currentStock = txs.reduce((sum, t) => sum + t.quantity, 0);

    if (currentStock < validated.quantity) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient ${validated.product.toLowerCase()} stock. Available: ${currentStock.toLocaleString()}, requested: ${validated.quantity.toLocaleString()}.`,
        },
        { status: 400 }
      );
    }

    const totalAmount = validated.quantity * validated.unitPrice;
    const count = await prisma.sale.count();
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(3, "0")}`;
    const saleDate = validated.saleDate ? new Date(validated.saleDate) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          saleDate,
          customerId: validated.customerId,
          product: validated.product,
          quantity: validated.quantity,
          unitPrice: validated.unitPrice,
          totalAmount,
          paymentStatus: validated.paymentStatus,
          paymentMethod: validated.paymentMethod,
          notes: validated.notes,
        },
        include: { customer: true },
      });

      // Reduce inventory in ledger
      await tx.inventoryTransaction.create({
        data: {
          date: saleDate,
          product: validated.product,
          transactionType: "SALE",
          quantity: -validated.quantity,
          referenceType: "SALE",
          referenceId: sale.id,
          notes: `Sale ${invoiceNumber} to ${sale.customer.name}`,
        },
      });

      return sale;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to record sale.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
