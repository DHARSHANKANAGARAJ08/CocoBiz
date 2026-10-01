import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const huskRemovalSchema = z.object({
  date: z.string().optional(),
  coconutQtyUsed: z.coerce.number().min(1, "Coconut quantity used must be at least 1"),
  huskGenerated: z.coerce.number().min(1, "Husk generated count must be at least 1"),
  huskWeightKg: z.coerce.number().min(0, "Husk weight cannot be negative").default(0),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const batches = await prisma.huskRemoval.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, data: batches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch husk removal batches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = huskRemovalSchema.parse(body);

    // 1. Verify Coconut Stock Availability
    const txs = await prisma.inventoryTransaction.findMany({
      where: { product: "COCONUT" },
    });
    const currentCoconutStock = txs.reduce((sum, t) => sum + t.quantity, 0);

    if (currentCoconutStock < validated.coconutQtyUsed) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient coconut stock. Available: ${currentCoconutStock.toLocaleString()} nuts, requested: ${validated.coconutQtyUsed.toLocaleString()} nuts.`,
        },
        { status: 400 }
      );
    }

    const count = await prisma.huskRemoval.count();
    const year = new Date().getFullYear();
    const batchCode = `HR-${year}-${String(count + 1).padStart(3, "0")}`;
    const date = validated.date ? new Date(validated.date) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const batch = await tx.huskRemoval.create({
        data: {
          batchCode,
          date,
          coconutQtyUsed: validated.coconutQtyUsed,
          huskGenerated: validated.huskGenerated,
          huskWeightKg: validated.huskWeightKg,
          notes: validated.notes,
        },
      });

      // Deduct raw coconuts
      await tx.inventoryTransaction.create({
        data: {
          date,
          product: "COCONUT",
          transactionType: "HUSK_REMOVAL",
          quantity: -validated.coconutQtyUsed,
          referenceType: "HUSK_REMOVAL",
          referenceId: batch.id,
          notes: `Batch ${batchCode} peeling: -${validated.coconutQtyUsed} nuts`,
        },
      });

      // Add husk inventory
      await tx.inventoryTransaction.create({
        data: {
          date,
          product: "HUSK",
          transactionType: "HUSK_REMOVAL",
          quantity: validated.huskGenerated,
          referenceType: "HUSK_REMOVAL",
          referenceId: batch.id,
          notes: `Batch ${batchCode} peeling: +${validated.huskGenerated} husks (${validated.huskWeightKg} kg)`,
        },
      });

      return batch;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to record husk removal.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
