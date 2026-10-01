import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const salarySchema = z.object({
  workerId: z.string().min(1, "Please select a worker"),
  paymentDate: z.string().optional(),
  salaryPeriod: z.string().min(1, "Salary period is required (e.g. October 2024)"),
  amount: z.coerce.number().min(1, "Payment amount must be greater than zero"),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER"]).default("CASH"),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const salaries = await prisma.salaryPayment.findMany({
      orderBy: { paymentDate: "desc" },
      include: { worker: true },
    });
    return NextResponse.json({ success: true, data: salaries });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch salary payments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = salarySchema.parse(body);

    const count = await prisma.salaryPayment.count();
    const year = new Date().getFullYear();
    const paymentCode = `SAL-${year}-${String(count + 1).padStart(3, "0")}`;
    const paymentDate = validated.paymentDate ? new Date(validated.paymentDate) : new Date();

    const payment = await prisma.salaryPayment.create({
      data: {
        paymentCode,
        workerId: validated.workerId,
        salaryPeriod: validated.salaryPeriod,
        amount: validated.amount,
        paymentDate,
        paymentMethod: validated.paymentMethod,
        notes: validated.notes,
      },
      include: { worker: true },
    });

    return NextResponse.json({ success: true, data: payment });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to record salary payment.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
