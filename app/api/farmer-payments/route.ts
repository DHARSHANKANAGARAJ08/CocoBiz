import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateFarmerOutstanding } from "@/lib/calculations";

const paymentSchema = z.object({
  ownerId: z.string().min(1, "Please select a farm owner"),
  amount: z.coerce.number().min(1, "Payment amount must be greater than zero"),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"]).default("CASH"),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  isAdvance: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");

    const where: any = {};
    if (ownerId) where.ownerId = ownerId;

    const payments = await prisma.farmerPayment.findMany({
      where,
      orderBy: { paymentDate: "desc" },
      include: { owner: true },
    });

    return NextResponse.json({ success: true, data: payments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = paymentSchema.parse(body);

    // 1. Fetch farmer outstanding balance
    const [harvests, purchases, priorPayments] = await Promise.all([
      prisma.harvestRecord.findMany({
        where: { ownerId: validated.ownerId },
        select: { totalCoconutAmount: true },
      }),
      prisma.coconutPurchase.findMany({
        where: { ownerId: validated.ownerId },
        select: { totalAmount: true },
      }),
      prisma.farmerPayment.findMany({
        where: { ownerId: validated.ownerId },
        select: { amount: true },
      }),
    ]);

    const totalPayable =
      harvests.reduce((sum, h) => sum + h.totalCoconutAmount, 0) +
      purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalAlreadyPaid = priorPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = calculateFarmerOutstanding(totalPayable, totalAlreadyPaid);

    // 2. Validate Payment vs Outstanding unless marked as advance (PAYMENT VALIDATION!)
    if (!validated.isAdvance && validated.amount > outstanding) {
      return NextResponse.json(
        {
          success: false,
          error: `Payment amount (₹${validated.amount}) exceeds outstanding balance (₹${outstanding}). Mark as advance payment if intended.`,
        },
        { status: 400 }
      );
    }

    const count = await prisma.farmerPayment.count();
    const year = new Date().getFullYear();
    const paymentCode = `PAY-${year}-${String(count + 1).padStart(3, "0")}`;
    const paymentDate = validated.paymentDate ? new Date(validated.paymentDate) : new Date();

    const payment = await prisma.farmerPayment.create({
      data: {
        paymentCode,
        ownerId: validated.ownerId,
        amount: validated.amount,
        paymentDate,
        paymentMethod: validated.paymentMethod,
        referenceNumber: validated.referenceNumber,
        notes: validated.notes,
        isAdvance: validated.isAdvance,
      },
      include: { owner: true },
    });

    return NextResponse.json({ success: true, data: payment });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to record payment.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
