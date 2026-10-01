import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { calculateTreeRemaining, calculateTreeCompletionPercentage } from "@/lib/calculations";

const bookingSchema = z.object({
  ownerId: z.string().min(1, "Please select an owner"),
  farmId: z.string().min(1, "Please select a farm"),
  bookingDate: z.string().optional(),
  totalTreesBooked: z.coerce.number().min(1, "Total trees must be at least 1"),
  pricePerTree: z.coerce.number().min(0, "Price per tree cannot be negative").optional(),
  expectedHarvestDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["BOOKED", "IN_PROGRESS", "PARTIALLY_COMPLETED", "COMPLETED", "CANCELLED"]).default("BOOKED"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const farmId = searchParams.get("farmId");
    const ownerId = searchParams.get("ownerId");
    const status = searchParams.get("status");

    const where: any = {};
    if (farmId) where.farmId = farmId;
    if (ownerId) where.ownerId = ownerId;
    if (status && status !== "ALL") where.status = status;

    const bookings = await prisma.treeBooking.findMany({
      where,
      orderBy: { bookingDate: "desc" },
      include: {
        owner: true,
        farm: true,
        harvestRecords: true,
      },
    });

    const formatted = bookings.map((b) => {
      const treesCompleted = b.harvestRecords.reduce((sum, h) => sum + h.treesHarvested, 0);
      const treesRemaining = calculateTreeRemaining(b.totalTreesBooked, treesCompleted);
      const completionPercentage = calculateTreeCompletionPercentage(b.totalTreesBooked, treesCompleted);

      // Auto update status if all trees completed and not cancelled
      let currentStatus = b.status;
      if (b.status !== "CANCELLED") {
        if (treesCompleted >= b.totalTreesBooked) {
          currentStatus = "COMPLETED";
        } else if (treesCompleted > 0) {
          currentStatus = "IN_PROGRESS";
        }
      }

      return {
        id: b.id,
        bookingCode: b.bookingCode,
        ownerId: b.ownerId,
        ownerName: b.owner.name,
        farmId: b.farmId,
        farmName: b.farm.name,
        bookingDate: b.bookingDate,
        totalTreesBooked: b.totalTreesBooked,
        pricePerTree: b.pricePerTree,
        expectedHarvestDate: b.expectedHarvestDate,
        notes: b.notes,
        status: currentStatus,
        createdAt: b.createdAt,
        treesCompleted,
        treesRemaining,
        completionPercentage,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch tree bookings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = bookingSchema.parse(body);

    const count = await prisma.treeBooking.count();
    const year = new Date().getFullYear();
    const bookingCode = `TB-${year}-${String(count + 1).padStart(3, "0")}`;

    const newBooking = await prisma.treeBooking.create({
      data: {
        bookingCode,
        ownerId: validated.ownerId,
        farmId: validated.farmId,
        bookingDate: validated.bookingDate ? new Date(validated.bookingDate) : new Date(),
        totalTreesBooked: validated.totalTreesBooked,
        pricePerTree: validated.pricePerTree ?? 0,
        expectedHarvestDate: validated.expectedHarvestDate ? new Date(validated.expectedHarvestDate) : null,
        notes: validated.notes,
        status: validated.status,
      },
    });

    return NextResponse.json({ success: true, data: newBooking });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to save tree booking.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
