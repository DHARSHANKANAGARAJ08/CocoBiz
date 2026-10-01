import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateAverageCoconutsPerTree } from "@/lib/calculations";

const harvestSchema = z.object({
  bookingId: z.string().min(1, "Please select a booking"),
  harvestDate: z.string().optional(),
  treesHarvested: z.coerce.number().min(1, "Harvested trees must be at least 1"),
  coconutCount: z.coerce.number().min(1, "Coconut count must be greater than zero"),
  coconutPrice: z.coerce.number().min(0, "Price per coconut cannot be negative"),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const ownerId = searchParams.get("ownerId");

    const where: any = {};
    if (bookingId) where.bookingId = bookingId;
    if (ownerId) where.ownerId = ownerId;

    const harvests = await prisma.harvestRecord.findMany({
      where,
      orderBy: { harvestDate: "desc" },
      include: {
        booking: true,
        farm: true,
        owner: true,
      },
    });

    return NextResponse.json({ success: true, data: harvests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch harvest records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = harvestSchema.parse(body);

    // 1. Fetch booking with existing harvests
    const booking = await prisma.treeBooking.findUnique({
      where: { id: validated.bookingId },
      include: { harvestRecords: true, farm: true, owner: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: "Selected tree booking does not exist." }, { status: 404 });
    }

    // 2. Validate tree booking limits (CRITICAL BUSINESS VALIDATION!)
    const previouslyHarvested = booking.harvestRecords.reduce((sum, h) => sum + h.treesHarvested, 0);
    const remainingTrees = booking.totalTreesBooked - previouslyHarvested;

    if (validated.treesHarvested > remainingTrees) {
      return NextResponse.json(
        {
          success: false,
          error: `Trees harvested (${validated.treesHarvested}) cannot exceed remaining booked trees (${remainingTrees}).`,
        },
        { status: 400 }
      );
    }

    // 3. Perform calculations
    const avgCoconutsPerTree = calculateAverageCoconutsPerTree(validated.coconutCount, validated.treesHarvested);
    const totalCoconutAmount = validated.coconutCount * validated.coconutPrice;

    const count = await prisma.harvestRecord.count();
    const year = new Date().getFullYear();
    const harvestCode = `HARV-${year}-${String(count + 1).padStart(3, "0")}`;
    const harvestDate = validated.harvestDate ? new Date(validated.harvestDate) : new Date();

    // 4. Prisma database transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create harvest record
      const harvest = await tx.harvestRecord.create({
        data: {
          harvestCode,
          bookingId: booking.id,
          ownerId: booking.ownerId,
          farmId: booking.farmId,
          harvestDate,
          treesHarvested: validated.treesHarvested,
          coconutCount: validated.coconutCount,
          avgCoconutsPerTree,
          coconutPrice: validated.coconutPrice,
          totalCoconutAmount,
          notes: validated.notes,
        },
      });

      // Add to coconut inventory via ledger transaction
      await tx.inventoryTransaction.create({
        data: {
          date: harvestDate,
          product: "COCONUT",
          transactionType: "HARVEST",
          quantity: validated.coconutCount,
          referenceType: "HARVEST",
          referenceId: harvest.id,
          notes: `Harvest lot from ${booking.farm.name} (${booking.bookingCode})`,
        },
      });

      // Update tree booking status
      const totalNowHarvested = previouslyHarvested + validated.treesHarvested;
      const newStatus = totalNowHarvested >= booking.totalTreesBooked ? "COMPLETED" : "IN_PROGRESS";
      await tx.treeBooking.update({
        where: { id: booking.id },
        data: { status: newStatus },
      });

      return harvest;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : (error.message || "Failed to record harvest.");
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
