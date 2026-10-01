import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ownerSchema = z.object({
  name: z.string().min(2, "Owner name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  alternatePhone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  village: z.string().min(1, "Village is required"),
  taluk: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  ifsc: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { village: { contains: search } },
        { ownerCode: { contains: search } },
      ];
    }

    const owners = await prisma.farmOwner.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        farms: true,
        treeBookings: true,
        harvestRecords: true,
        purchases: true,
        payments: true,
      },
    });

    const formatted = owners.map((owner) => {
      const farmsCount = owner.farms.length;
      const treesBooked = owner.treeBookings.reduce((sum, b) => sum + b.totalTreesBooked, 0);
      const treesCompleted = owner.harvestRecords.reduce((sum, h) => sum + h.treesHarvested, 0);
      const totalPurchases =
        owner.harvestRecords.reduce((sum, h) => sum + h.totalCoconutAmount, 0) +
        owner.purchases.reduce((sum, p) => sum + p.totalAmount, 0);
      const totalPaid = owner.payments.reduce((sum, p) => sum + p.amount, 0);
      const outstandingBalance = Math.max(0, totalPurchases - totalPaid);

      return {
        id: owner.id,
        ownerCode: owner.ownerCode,
        name: owner.name,
        phone: owner.phone,
        alternatePhone: owner.alternatePhone,
        address: owner.address,
        village: owner.village,
        taluk: owner.taluk,
        district: owner.district,
        bankName: owner.bankName,
        accountNumber: owner.accountNumber,
        ifsc: owner.ifsc,
        notes: owner.notes,
        status: owner.status,
        createdAt: owner.createdAt,
        farmsCount,
        treesBooked,
        treesCompleted,
        totalPurchases,
        totalPaid,
        outstandingBalance,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error("Farm owners GET error:", error);
    return NextResponse.json({ success: false, error: "Failed to load farm owners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ownerSchema.parse(body);

    const count = await prisma.farmOwner.count();
    const ownerCode = `OWN-${1090 + count + 1}`;

    const newOwner = await prisma.farmOwner.create({
      data: {
        ownerCode,
        name: validated.name,
        phone: validated.phone,
        alternatePhone: validated.alternatePhone,
        address: validated.address,
        village: validated.village,
        taluk: validated.taluk,
        district: validated.district,
        bankName: validated.bankName,
        accountNumber: validated.accountNumber,
        ifsc: validated.ifsc,
        notes: validated.notes,
        status: validated.status,
      },
    });

    return NextResponse.json({ success: true, data: newOwner });
  } catch (error: any) {
    console.error("Farm owner create error:", error);
    const message = error.errors ? error.errors[0]?.message : "Unable to save farm owner.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
