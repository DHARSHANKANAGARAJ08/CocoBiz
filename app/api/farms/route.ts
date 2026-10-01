import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const farmSchema = z.object({
  name: z.string().min(2, "Farm name must be at least 2 characters"),
  ownerId: z.string().min(1, "Please select a farm owner"),
  location: z.string().optional().nullable(),
  village: z.string().min(1, "Village is required"),
  taluk: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  totalTrees: z.coerce.number().min(1, "Total trees must be greater than zero"),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerId = searchParams.get("ownerId");
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (ownerId) where.ownerId = ownerId;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { village: { contains: search } },
        { farmCode: { contains: search } },
        { owner: { name: { contains: search } } },
      ];
    }

    const farms = await prisma.farm.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        owner: true,
        treeBookings: true,
        harvestRecords: true,
      },
    });

    const formatted = farms.map((farm) => {
      const treesBooked = farm.treeBookings.reduce((sum, b) => sum + b.totalTreesBooked, 0);
      const treesCompleted = farm.harvestRecords.reduce((sum, h) => sum + h.treesHarvested, 0);
      const treesRemaining = Math.max(0, treesBooked - treesCompleted);
      const totalHarvestedCoconuts = farm.harvestRecords.reduce((sum, h) => sum + h.coconutCount, 0);
      const avgCoconutsPerTree =
        treesCompleted > 0 ? Math.round((totalHarvestedCoconuts / treesCompleted) * 100) / 100 : 0;
      const completionRate =
        treesBooked > 0 ? Math.min(100, Math.round((treesCompleted / treesBooked) * 1000) / 10) : 0;

      return {
        id: farm.id,
        farmCode: farm.farmCode,
        name: farm.name,
        ownerId: farm.ownerId,
        ownerName: farm.owner.name,
        location: farm.location,
        village: farm.village,
        taluk: farm.taluk,
        district: farm.district,
        totalTrees: farm.totalTrees,
        notes: farm.notes,
        status: farm.status,
        createdAt: farm.createdAt,
        treesBooked,
        treesCompleted,
        treesRemaining,
        totalHarvestedCoconuts,
        avgCoconutsPerTree,
        completionRate,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Failed to fetch farms" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = farmSchema.parse(body);

    const count = await prisma.farm.count();
    const farmCode = `FRM-${100 + count + 1}`;

    const newFarm = await prisma.farm.create({
      data: {
        farmCode,
        name: validated.name,
        ownerId: validated.ownerId,
        location: validated.location,
        village: validated.village,
        taluk: validated.taluk,
        district: validated.district,
        totalTrees: validated.totalTrees,
        notes: validated.notes,
        status: validated.status,
      },
    });

    return NextResponse.json({ success: true, data: newFarm });
  } catch (error: any) {
    const message = error.errors ? error.errors[0]?.message : "Unable to save farm.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
