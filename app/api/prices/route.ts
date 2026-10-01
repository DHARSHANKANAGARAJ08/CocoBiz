import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const priceSchema = z.object({
  product: z.enum(["COCONUT", "HUSK", "COPRA"]),
  type: z.string().min(1, "Product type is required"),
  unit: z.string().min(1, "Unit of measurement is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than zero"),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const product = searchParams.get("product");

    const where: any = {};
    if (product && product !== "ALL") where.product = product;

    const prices = await prisma.dailyPrice.findMany({
      where,
      orderBy: { date: "desc" },
    });

    // Get current active price for each product
    const latestPrices: Record<string, any> = {};
    for (const p of prices) {
      const key = `${p.product}_${p.type}`;
      if (!latestPrices[key]) {
        latestPrices[key] = p;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        latest: Object.values(latestPrices),
        history: prices,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch price data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = priceSchema.parse(body);

    const price = await prisma.dailyPrice.create({
      data: {
        date: new Date(),
        product: validated.product,
        type: validated.type,
        unit: validated.unit,
        price: validated.price,
        notes: validated.notes,
      },
    });

    return NextResponse.json({ success: true, data: price });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to record daily price.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
