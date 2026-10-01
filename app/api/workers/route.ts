import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const workerSchema = z.object({
  name: z.string().min(2, "Worker name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().optional().nullable(),
  jobRole: z.string().min(1, "Job role is required"),
  joiningDate: z.string().optional(),
  salaryType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "PER_TASK"]).default("MONTHLY"),
  salaryAmount: z.coerce.number().min(1, "Salary amount must be greater than zero"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const workers = await prisma.worker.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        salaries: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    const formatted = workers.map((w) => {
      const totalPaid = w.salaries.reduce((sum, s) => sum + s.amount, 0);
      return {
        ...w,
        totalSalaryPaid: totalPaid,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch workers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = workerSchema.parse(body);

    const count = await prisma.worker.count();
    const workerCode = `WRK-${100 + count + 1}`;

    const worker = await prisma.worker.create({
      data: {
        workerCode,
        name: validated.name,
        phone: validated.phone,
        address: validated.address,
        jobRole: validated.jobRole,
        joiningDate: validated.joiningDate ? new Date(validated.joiningDate) : new Date(),
        salaryType: validated.salaryType,
        salaryAmount: validated.salaryAmount,
        status: validated.status,
        notes: validated.notes,
      },
    });

    return NextResponse.json({ success: true, data: worker });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to save worker.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
