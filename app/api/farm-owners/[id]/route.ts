import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const owner = await prisma.farmOwner.findUnique({
      where: { id },
      include: {
        farms: true,
        treeBookings: {
          include: { harvestRecords: true },
        },
        harvestRecords: {
          include: { farm: true },
          orderBy: { harvestDate: "desc" },
        },
        purchases: {
          include: { farm: true },
          orderBy: { purchaseDate: "desc" },
        },
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
    });

    if (!owner) {
      return NextResponse.json({ success: false, error: "Farm owner not found" }, { status: 404 });
    }

    const totalTreesBooked = owner.treeBookings.reduce((sum, b) => sum + b.totalTreesBooked, 0);
    const treesCompleted = owner.harvestRecords.reduce((sum, h) => sum + h.treesHarvested, 0);
    const treesRemaining = Math.max(0, totalTreesBooked - treesCompleted);
    const totalCoconuts = owner.harvestRecords.reduce((sum, h) => sum + h.coconutCount, 0);
    const totalHarvestVal = owner.harvestRecords.reduce((sum, h) => sum + h.totalCoconutAmount, 0);
    const totalPurchaseVal = owner.purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPurchaseValue = totalHarvestVal + totalPurchaseVal;
    const totalPaid = owner.payments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingBalance = Math.max(0, totalPurchaseValue - totalPaid);

    return NextResponse.json({
      success: true,
      data: {
        ...owner,
        totalTreesBooked,
        treesCompleted,
        treesRemaining,
        totalCoconuts,
        totalPurchaseValue,
        totalPaid,
        outstandingBalance,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch farm owner details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.farmOwner.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        alternatePhone: body.alternatePhone,
        address: body.address,
        village: body.village,
        taluk: body.taluk,
        district: body.district,
        bankName: body.bankName,
        accountNumber: body.accountNumber,
        ifsc: body.ifsc,
        notes: body.notes,
        status: body.status,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Unable to update farm owner" }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.farmOwner.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Farm owner deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to delete farm owner" }, { status: 400 });
  }
}
