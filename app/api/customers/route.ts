import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(2, "Customer name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().optional().nullable(),
  businessName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { businessName: { contains: search } },
        { customerCode: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        sales: {
          orderBy: { saleDate: "desc" },
        },
      },
    });

    const formatted = customers.map((c) => {
      const totalPurchases = c.sales.length;
      const totalAmount = c.sales.reduce((sum, s) => sum + s.totalAmount, 0);
      const paidAmount = c.sales
        .filter((s) => s.paymentStatus === "PAID")
        .reduce((sum, s) => sum + s.totalAmount, 0);
      const outstandingAmount = Math.max(0, totalAmount - paidAmount);

      return {
        id: c.id,
        customerCode: c.customerCode,
        name: c.name,
        phone: c.phone,
        address: c.address,
        businessName: c.businessName,
        notes: c.notes,
        status: c.status,
        createdAt: c.createdAt,
        totalPurchases,
        totalAmount,
        paidAmount,
        outstandingAmount,
        sales: c.sales,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = customerSchema.parse(body);

    const count = await prisma.customer.count();
    const customerCode = `CUST-${100 + count + 1}`;

    const newCustomer = await prisma.customer.create({
      data: {
        customerCode,
        name: validated.name,
        phone: validated.phone,
        address: validated.address,
        businessName: validated.businessName,
        notes: validated.notes,
        status: validated.status,
      },
    });

    return NextResponse.json({ success: true, data: newCustomer });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to save customer.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
