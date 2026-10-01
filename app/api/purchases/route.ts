import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const purchaseSchema = z.object({
  ownerId: z.string().min(1, "Please select an owner"),
  farmId: z.string().min(1, "Please select a farm"),
  bookingId: z.string().optional().nullable(),
  purchaseDate: z.string().optional(),
  coconutType: z.string().default("WITH_HUSK"),
  quantity: z.coerce.number().min(1, "Quantity must be greater than zero"),
  pricePerCoconut: z.coerce.number().min(0.01, "Price must be greater than zero"),
  paymentStatus: z.enum(["UNPAID", "PARTIALLY_PAID", "PAID"]).default("UNPAID"),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const purchases = await prisma.coconutPurchase.findMany({
      orderBy: { purchaseDate: "desc" },
      include: {
        owner: true,
        farm: true,
        booking: true,
      },
    });

    return NextResponse.json({ success: true, data: purchases });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = purchaseSchema.parse(body);

    const totalAmount = validated.quantity * validated.pricePerCoconut;
    const count = await prisma.coconutPurchase.count();
    const year = new Date().getFullYear();
    const purchaseCode = `PUR-${year}-${String(count + 1).padStart(3, "0")}`;
    const purchaseDate = validated.purchaseDate ? new Date(validated.purchaseDate) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const purchase = await tx.coconutPurchase.create({
        data: {
          purchaseCode,
          ownerId: validated.ownerId,
          farmId: validated.farmId,
          bookingId: validated.bookingId || null,
          purchaseDate,
          coconutType: validated.coconutType,
          quantity: validated.quantity,
          pricePerCoconut: validated.pricePerCoconut,
          totalAmount,
          paymentStatus: validated.paymentStatus,
          notes: validated.notes,
        },
        include: { owner: true, farm: true },
      });

      // Add to inventory ledger
      await tx.inventoryTransaction.create({
        data: {
          date: purchaseDate,
          product: "COCONUT",
          transactionType: "PURCHASE",
          quantity: validated.quantity,
          referenceType: "PURCHASE",
          referenceId: purchase.id,
          notes: `Procurement from ${purchase.owner.name} (${purchase.coconutType})`,
        },
      });

      return purchase;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to record purchase.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
