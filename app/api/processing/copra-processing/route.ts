import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const copraSchema = z.object({
  date: z.string().optional(),
  coconutQtyUsed: z.coerce.number().min(1, "Coconut quantity used must be at least 1"),
  copraProducedKg: z.coerce.number().min(0.1, "Copra produced must be greater than zero"),
  processingCost: z.coerce.number().min(0, "Processing cost cannot be negative").default(0),
  notes: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const batches = await prisma.copraProcessing.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json({ success: true, data: batches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch copra processing records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = copraSchema.parse(body);

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

    const count = await prisma.copraProcessing.count();
    const year = new Date().getFullYear();
    const batchCode = `CP-${year}-${String(count + 1).padStart(3, "0")}`;
    const date = validated.date ? new Date(validated.date) : new Date();

    const result = await prisma.$transaction(async (tx) => {
      const batch = await tx.copraProcessing.create({
        data: {
          batchCode,
          date,
          coconutQtyUsed: validated.coconutQtyUsed,
          copraProducedKg: validated.copraProducedKg,
          processingCost: validated.processingCost,
          notes: validated.notes,
        },
      });

      // Deduct raw coconuts
      await tx.inventoryTransaction.create({
        data: {
          date,
          product: "COCONUT",
          transactionType: "COPRA_PROCESSING",
          quantity: -validated.coconutQtyUsed,
          referenceType: "COPRA_PROCESSING",
          referenceId: batch.id,
          notes: `Copra run ${batchCode}: -${validated.coconutQtyUsed} nuts`,
        },
      });

      // Add copra inventory
      await tx.inventoryTransaction.create({
        data: {
          date,
          product: "COPRA",
          transactionType: "COPRA_PROCESSING",
          quantity: validated.copraProducedKg,
          referenceType: "COPRA_PROCESSING",
          referenceId: batch.id,
          notes: `Copra run ${batchCode}: +${validated.copraProducedKg} kg copra`,
        },
      });

      return batch;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to record copra processing.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
