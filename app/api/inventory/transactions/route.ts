import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const product = searchParams.get("product");
    const transactionType = searchParams.get("transactionType");

    const where: any = {};
    if (product && product !== "ALL") where.product = product;
    if (transactionType && transactionType !== "ALL") where.transactionType = transactionType;

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      orderBy: { date: "desc" },
      take: 200,
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch inventory transactions" }, { status: 500 });
  }
}
