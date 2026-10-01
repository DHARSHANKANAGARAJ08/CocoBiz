import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const adjustmentSchema = z.object({
  product: z.enum(["COCONUT", "HUSK", "COPRA"]),
  quantity: z.coerce.number(), // positive or negative
  notes: z.string().min(2, "Reason for stock adjustment is required"),
});

export async function GET() {
  try {
    const transactions = await prisma.inventoryTransaction.findMany({
      orderBy: { date: "desc" },
    });

    let coconutStock = 0;
    let huskStock = 0;
    let copraStock = 0;

    for (const tx of transactions) {
      if (tx.product === "COCONUT") coconutStock += tx.quantity;
      else if (tx.product === "HUSK") huskStock += tx.quantity;
      else if (tx.product === "COPRA") copraStock += tx.quantity;
    }

    return NextResponse.json({
      success: true,
      data: {
        balances: {
          COCONUT: Math.max(0, coconutStock),
          HUSK: Math.max(0, huskStock),
          COPRA: Math.max(0, copraStock),
        },
        transactions: transactions.slice(0, 100),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch inventory balances" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = adjustmentSchema.parse(body);

    // Check that adjustment does not drive inventory below zero
    const txs = await prisma.inventoryTransaction.findMany({
      where: { product: validated.product },
    });
    const currentStock = txs.reduce((sum, t) => sum + t.quantity, 0);

    if (currentStock + validated.quantity < 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Adjustment would result in negative stock. Current stock: ${currentStock}, adjustment: ${validated.quantity}.`,
        },
        { status: 400 }
      );
    }

    const tx = await prisma.inventoryTransaction.create({
      data: {
        date: new Date(),
        product: validated.product,
        transactionType: "ADJUSTMENT",
        quantity: validated.quantity,
        referenceType: "MANUAL",
        notes: validated.notes,
      },
    });

    return NextResponse.json({ success: true, data: tx });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to record inventory adjustment.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
