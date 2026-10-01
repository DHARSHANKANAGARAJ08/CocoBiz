import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateTreeRemaining,
  calculateTreeCompletionPercentage,
  calculateAverageCoconutsPerTree,
  calculateFarmerOutstanding,
  calculateGrossProfit,
  calculateNetProfit,
} from "@/lib/calculations";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "pnl";
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let dateFilter: any = {};
    if (startDateParam || endDateParam) {
      dateFilter = {};
      if (startDateParam) dateFilter.gte = new Date(startDateParam);
      if (endDateParam) {
        const end = new Date(endDateParam);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
    }

    if (type === "purchases") {
      const records = await prisma.coconutPurchase.findMany({
        where: Object.keys(dateFilter).length > 0 ? { purchaseDate: dateFilter } : undefined,
        orderBy: { purchaseDate: "desc" },
        include: { owner: true, farm: true },
      });
      return NextResponse.json({ success: true, data: records });
    }

    if (type === "sales") {
      const records = await prisma.sale.findMany({
        where: Object.keys(dateFilter).length > 0 ? { saleDate: dateFilter } : undefined,
        orderBy: { saleDate: "desc" },
        include: { customer: true },
      });
      return NextResponse.json({ success: true, data: records });
    }

    if (type === "inventory-coconut" || type === "inventory-husk" || type === "inventory-copra") {
      const prod = type === "inventory-coconut" ? "COCONUT" : type === "inventory-husk" ? "HUSK" : "COPRA";
      const records = await prisma.inventoryTransaction.findMany({
        where: {
          product: prod,
          ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        },
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ success: true, data: records });
    }

    if (type === "farmer-balance") {
      const owners = await prisma.farmOwner.findMany({
        include: {
          harvestRecords: true,
          purchases: true,
          payments: true,
          farms: true,
        },
      });
      const data = owners.map((o) => {
        const harvestVal = o.harvestRecords.reduce((sum, h) => sum + h.totalCoconutAmount, 0);
        const purchaseVal = o.purchases.reduce((sum, p) => sum + p.totalAmount, 0);
        const totalPurchases = harvestVal + purchaseVal;
        const totalPaid = o.payments.reduce((sum, p) => sum + p.amount, 0);
        const outstanding = calculateFarmerOutstanding(totalPurchases, totalPaid);
        return {
          id: o.id,
          ownerCode: o.ownerCode,
          name: o.name,
          phone: o.phone,
          village: o.village,
          farmsCount: o.farms.length,
          totalPurchases,
          totalPaid,
          outstanding,
          status: o.status,
        };
      });
      return NextResponse.json({ success: true, data });
    }

    if (type === "farmer-payments") {
      const records = await prisma.farmerPayment.findMany({
        where: Object.keys(dateFilter).length > 0 ? { paymentDate: dateFilter } : undefined,
        orderBy: { paymentDate: "desc" },
        include: { owner: true },
      });
      return NextResponse.json({ success: true, data: records });
    }

    if (type === "tree-bookings") {
      const records = await prisma.treeBooking.findMany({
        where: Object.keys(dateFilter).length > 0 ? { bookingDate: dateFilter } : undefined,
        orderBy: { bookingDate: "desc" },
        include: { owner: true, farm: true, harvestRecords: true },
      });
      const data = records.map((b) => {
        const treesCompleted = b.harvestRecords.reduce((sum, h) => sum + h.treesHarvested, 0);
        return {
          ...b,
          treesCompleted,
          treesRemaining: calculateTreeRemaining(b.totalTreesBooked, treesCompleted),
          completionPercentage: calculateTreeCompletionPercentage(b.totalTreesBooked, treesCompleted),
        };
      });
      return NextResponse.json({ success: true, data });
    }

    if (type === "harvests") {
      const records = await prisma.harvestRecord.findMany({
        where: Object.keys(dateFilter).length > 0 ? { harvestDate: dateFilter } : undefined,
        orderBy: { harvestDate: "desc" },
        include: { owner: true, farm: true, booking: true },
      });
      return NextResponse.json({ success: true, data: records });
    }

    if (type === "yield" || type === "farm-trees") {
      const farms = await prisma.farm.findMany({
        include: {
          owner: true,
          treeBookings: true,
          harvestRecords: true,
        },
      });
      const data = farms.map((f) => {
        const treesBooked = f.treeBookings.reduce((sum, b) => sum + b.totalTreesBooked, 0);
        const treesCompleted = f.harvestRecords.reduce((sum, h) => sum + h.treesHarvested, 0);
        const coconuts = f.harvestRecords.reduce((sum, h) => sum + h.coconutCount, 0);
        return {
          id: f.id,
          farmCode: f.farmCode,
          name: f.name,
          ownerName: f.owner.name,
          village: f.village,
          totalTrees: f.totalTrees,
          treesBooked,
          treesCompleted,
          treesRemaining: calculateTreeRemaining(treesBooked, treesCompleted),
          completionRate: calculateTreeCompletionPercentage(treesBooked, treesCompleted),
          coconutsCollected: coconuts,
          averageYield: calculateAverageCoconutsPerTree(coconuts, treesCompleted),
        };
      });
      return NextResponse.json({ success: true, data });
    }

    if (type === "copra-production") {
      const records = await prisma.copraProcessing.findMany({
        where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ success: true, data: records });
    }

    if (type === "salaries") {
      const records = await prisma.salaryPayment.findMany({
        where: Object.keys(dateFilter).length > 0 ? { paymentDate: dateFilter } : undefined,
        orderBy: { paymentDate: "desc" },
        include: { worker: true },
      });
      return NextResponse.json({ success: true, data: records });
    }

    if (type === "transport") {
      const records = await prisma.transportExpense.findMany({
        where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ success: true, data: records });
    }

    if (type === "other-expenses") {
      const records = await prisma.otherExpense.findMany({
        where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ success: true, data: records });
    }

    if (type === "prices") {
      const records = await prisma.dailyPrice.findMany({
        where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ success: true, data: records });
    }

    // Default: Comprehensive Profit & Loss (P&L) Report
    const [sales, harvests, purchases, salaries, transport, otherExpenses, copraBatches] = await Promise.all([
      prisma.sale.findMany({
        where: Object.keys(dateFilter).length > 0 ? { saleDate: dateFilter } : undefined,
      }),
      prisma.harvestRecord.findMany({
        where: Object.keys(dateFilter).length > 0 ? { harvestDate: dateFilter } : undefined,
      }),
      prisma.coconutPurchase.findMany({
        where: Object.keys(dateFilter).length > 0 ? { purchaseDate: dateFilter } : undefined,
      }),
      prisma.salaryPayment.findMany({
        where: Object.keys(dateFilter).length > 0 ? { paymentDate: dateFilter } : undefined,
      }),
      prisma.transportExpense.findMany({
        where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
      }),
      prisma.otherExpense.findMany({
        where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
      }),
      prisma.copraProcessing.findMany({
        where: Object.keys(dateFilter).length > 0 ? { date: dateFilter } : undefined,
      }),
    ]);

    const revenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const coconutSales = sales.filter((s) => s.product === "COCONUT").reduce((sum, s) => sum + s.totalAmount, 0);
    const huskSales = sales.filter((s) => s.product === "HUSK").reduce((sum, s) => sum + s.totalAmount, 0);
    const copraSales = sales.filter((s) => s.product === "COPRA").reduce((sum, s) => sum + s.totalAmount, 0);

    const procurementCost =
      harvests.reduce((sum, h) => sum + h.totalCoconutAmount, 0) +
      purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const cogs = procurementCost; // COGS derived safely from procurement transactions

    const grossProfit = calculateGrossProfit(revenue, cogs);

    const workerSalary = salaries.reduce((sum, s) => sum + s.amount, 0);
    const transportCost = transport.reduce((sum, t) => sum + t.amount, 0);
    const processingCost = copraBatches.reduce((sum, c) => sum + c.processingCost, 0);
    const otherCost = otherExpenses.reduce((sum, o) => sum + o.amount, 0);

    const operatingExpenses = workerSalary + transportCost + processingCost + otherCost;
    const netProfit = calculateNetProfit(revenue, cogs, workerSalary, transportCost, processingCost, otherCost);
    const netMargin = revenue > 0 ? Math.round((netProfit / revenue) * 1000) / 10 : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          revenue,
          coconutSales,
          huskSales,
          copraSales,
          cogs,
          grossProfit,
          workerSalary,
          transportCost,
          processingCost,
          otherCost,
          operatingExpenses,
          netProfit,
          netMargin,
        },
        breakdowns: {
          salesCount: sales.length,
          harvestsCount: harvests.length,
          purchasesCount: purchases.length,
          salariesCount: salaries.length,
          transportTripsCount: transport.length,
        },
      },
    });
  } catch (error: any) {
    console.error("Reports API error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate report" }, { status: 500 });
  }
}
