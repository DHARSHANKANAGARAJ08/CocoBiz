import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const transportSchema = z.object({
  date: z.string().optional(),
  vehicleNumber: z.string().min(2, "Vehicle number is required"),
  driverName: z.string().optional().nullable(),
  transportType: z.enum(["PICKUP_TRUCK", "TRACTOR", "LORRY", "AUTO"]).default("PICKUP_TRUCK"),
  fromLocation: z.string().min(1, "Origin is required"),
  toLocation: z.string().min(1, "Destination is required"),
  purpose: z.string().min(1, "Trip purpose is required"),
  amount: z.coerce.number().min(1, "Expense amount must be greater than zero"),
  notes: z.string().optional().nullable(),
});

const otherSchema = z.object({
  date: z.string().optional(),
  category: z.enum([
    "ELECTRICITY",
    "MAINTENANCE",
    "RENT",
    "PROCESSING",
    "PACKAGING",
    "FUEL",
    "OFFICE",
    "MISCELLANEOUS",
  ]),
  description: z.string().min(2, "Description is required"),
  amount: z.coerce.number().min(1, "Expense amount must be greater than zero"),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER"]).default("CASH"),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // transport or other

    if (type === "transport") {
      const transport = await prisma.transportExpense.findMany({
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ success: true, data: transport });
    } else if (type === "other") {
      const other = await prisma.otherExpense.findMany({
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ success: true, data: other });
    }

    const [transport, other] = await Promise.all([
      prisma.transportExpense.findMany({ orderBy: { date: "desc" } }),
      prisma.otherExpense.findMany({ orderBy: { date: "desc" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: { transport, other },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = body.type; // "transport" or "other"

    if (type === "transport") {
      const validated = transportSchema.parse(body);
      const count = await prisma.transportExpense.count();
      const year = new Date().getFullYear();
      const expenseCode = `TRN-${year}-${String(count + 1).padStart(3, "0")}`;
      const date = validated.date ? new Date(validated.date) : new Date();

      const expense = await prisma.transportExpense.create({
        data: {
          expenseCode,
          date,
          vehicleNumber: validated.vehicleNumber,
          driverName: validated.driverName,
          transportType: validated.transportType,
          fromLocation: validated.fromLocation,
          toLocation: validated.toLocation,
          purpose: validated.purpose,
          amount: validated.amount,
          notes: validated.notes,
        },
      });
      return NextResponse.json({ success: true, data: expense });
    } else {
      const validated = otherSchema.parse(body);
      const count = await prisma.otherExpense.count();
      const year = new Date().getFullYear();
      const expenseCode = `EXP-${year}-${String(count + 1).padStart(3, "0")}`;
      const date = validated.date ? new Date(validated.date) : new Date();

      const expense = await prisma.otherExpense.create({
        data: {
          expenseCode,
          date,
          category: validated.category,
          description: validated.description,
          amount: validated.amount,
          paymentMethod: validated.paymentMethod,
          notes: validated.notes,
        },
      });
      return NextResponse.json({ success: true, data: expense });
    }
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to record expense.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
