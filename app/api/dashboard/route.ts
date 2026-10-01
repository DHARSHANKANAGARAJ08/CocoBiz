import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateTreeRemaining,
  calculateTreeCompletionPercentage,
  calculateFarmerOutstanding,
  calculateNetProfit,
} from "@/lib/calculations";

export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Basic Counts
    const [totalOwners, totalFarms, treeBookings, allHarvests, allPurchases, allPayments] =
      await Promise.all([
        prisma.farmOwner.count(),
        prisma.farm.count(),
        prisma.treeBooking.findMany({
          select: { totalTreesBooked: true, id: true, status: true },
        }),
        prisma.harvestRecord.findMany({
          select: { treesHarvested: true, coconutCount: true, totalCoconutAmount: true, harvestDate: true },
        }),
        prisma.coconutPurchase.findMany({
          select: { totalAmount: true, purchaseDate: true },
        }),
        prisma.farmerPayment.findMany({
          select: { amount: true, paymentDate: true },
        }),
      ]);

    const totalTreesBooked = treeBookings.reduce((sum, b) => sum + b.totalTreesBooked, 0);
    const treesCompleted = allHarvests.reduce((sum, h) => sum + h.treesHarvested, 0);
    const treesRemaining = calculateTreeRemaining(totalTreesBooked, treesCompleted);
    const treeCompletionRate = calculateTreeCompletionPercentage(totalTreesBooked, treesCompleted);

    // 2. Inventory Stock Calculations (from transactions ledger)
    const inventoryTx = await prisma.inventoryTransaction.findMany();
    let coconutStock = 0;
    let huskStock = 0;
    let copraStock = 0;

    for (const tx of inventoryTx) {
      if (tx.product === "COCONUT") coconutStock += tx.quantity;
      else if (tx.product === "HUSK") huskStock += tx.quantity;
      else if (tx.product === "COPRA") copraStock += tx.quantity;
    }

    // 3. Farmer Balances
    const totalHarvestVal = allHarvests.reduce((sum, h) => sum + h.totalCoconutAmount, 0);
    const totalPurchaseVal = allPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaidToFarmers = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const farmerOutstanding = calculateFarmerOutstanding(totalHarvestVal + totalPurchaseVal, totalPaidToFarmers);

    // 4. Sales, Expenses, and P&L
    const [sales, salaryPayments, transportExpenses, otherExpenses, copraProcesses] = await Promise.all([
      prisma.sale.findMany({ select: { totalAmount: true, saleDate: true } }),
      prisma.salaryPayment.findMany({ select: { amount: true, paymentDate: true } }),
      prisma.transportExpense.findMany({ select: { amount: true, date: true } }),
      prisma.otherExpense.findMany({ select: { amount: true, date: true } }),
      prisma.copraProcessing.findMany({ select: { processingCost: true, date: true } }),
    ]);

    const todayPurchases = allPurchases
      .filter((p) => new Date(p.purchaseDate) >= startOfToday)
      .reduce((sum, p) => sum + p.totalAmount, 0);

    const todaySales = sales
      .filter((s) => new Date(s.saleDate) >= startOfToday)
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const todaySalary = salaryPayments
      .filter((s) => new Date(s.paymentDate) >= startOfToday)
      .reduce((sum, s) => sum + s.amount, 0);
    const todayTransport = transportExpenses
      .filter((t) => new Date(t.date) >= startOfToday)
      .reduce((sum, t) => sum + t.amount, 0);
    const todayOther = otherExpenses
      .filter((o) => new Date(o.date) >= startOfToday)
      .reduce((sum, o) => sum + o.amount, 0);

    const todayExpenses = todayPurchases + todaySalary + todayTransport + todayOther;
    const todayProfit = todaySales - todayExpenses;

    // Monthly
    const monthlySales = sales
      .filter((s) => new Date(s.saleDate) >= startOfMonth)
      .reduce((sum, s) => sum + s.totalAmount, 0);

    const monthlySalary = salaryPayments
      .filter((s) => new Date(s.paymentDate) >= startOfMonth)
      .reduce((sum, s) => sum + s.amount, 0);
    const monthlyTransport = transportExpenses
      .filter((t) => new Date(t.date) >= startOfMonth)
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyOther = otherExpenses
      .filter((o) => new Date(o.date) >= startOfMonth)
      .reduce((sum, o) => sum + o.amount, 0);
    const monthlyProcessing = copraProcesses
      .filter((c) => new Date(c.date) >= startOfMonth)
      .reduce((sum, c) => sum + c.processingCost, 0);

    const monthlyExpenses = monthlySalary + monthlyTransport + monthlyOther + monthlyProcessing;
    const monthlyProfit = calculateNetProfit(monthlySales, 0, monthlySalary, monthlyTransport, monthlyProcessing, monthlyOther);

    // 5. Recent Activity Timeline
    const [recentHarvests, recentPayments, recentSales, recentProcesses] = await Promise.all([
      prisma.harvestRecord.findMany({
        take: 3,
        orderBy: { harvestDate: "desc" },
        include: { farm: true, owner: true },
      }),
      prisma.farmerPayment.findMany({
        take: 3,
        orderBy: { paymentDate: "desc" },
        include: { owner: true },
      }),
      prisma.sale.findMany({
        take: 3,
        orderBy: { saleDate: "desc" },
        include: { customer: true },
      }),
      prisma.copraProcessing.findMany({
        take: 3,
        orderBy: { date: "desc" },
      }),
    ]);

    const timeline = [
      ...recentHarvests.map((h) => ({
        id: h.id,
        type: "HARVEST",
        title: "Harvest Record",
        description: `Harvested ${h.coconutCount.toLocaleString()} raw coconuts from ${h.treesHarvested} trees`,
        reference: h.farm.name,
        amount: `${h.coconutCount.toLocaleString()} Units`,
        status: "Completed",
        date: h.harvestDate,
      })),
      ...recentPayments.map((p) => ({
        id: p.id,
        type: "PAYMENT",
        title: "Farmer Payment",
        description: `Settled installment for ${p.owner.name}`,
        reference: p.owner.ownerCode || p.owner.name,
        amount: `₹${p.amount.toLocaleString("en-IN")}`,
        status: "Processed",
        date: p.paymentDate,
      })),
      ...recentSales.map((s) => ({
        id: s.id,
        type: "SALE",
        title: "Market Sale",
        description: `Bulk ${s.product.toLowerCase()} shipment to ${s.customer.name}`,
        reference: s.invoiceNumber || "Invoice",
        amount: `₹${s.totalAmount.toLocaleString("en-IN")}`,
        status: s.paymentStatus,
        date: s.saleDate,
      })),
      ...recentProcesses.map((cp) => ({
        id: cp.id,
        type: "PROCESSING",
        title: "Copra Processing",
        description: `Kiln drying: ${cp.coconutQtyUsed.toLocaleString()} nuts → ${cp.copraProducedKg} kg copra`,
        reference: cp.batchCode || "Processing Batch",
        amount: `${cp.copraProducedKg} kg`,
        status: "Completed",
        date: cp.date,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

    return NextResponse.json({
      success: true,
      data: {
        metrics: {
          totalOwners,
          totalFarms,
          totalTreesBooked,
          treesCompleted,
          treesRemaining,
          treeCompletionRate,
          coconutStock: Math.max(0, coconutStock),
          huskStock: Math.max(0, huskStock),
          copraStock: Math.max(0, copraStock),
          farmerOutstanding: Math.max(0, farmerOutstanding),
          todayPurchases,
          todaySales,
          todayExpenses,
          todayProfit,
          monthlySales,
          monthlyExpenses,
          monthlyProfit,
        },
        timeline,
      },
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard metrics" }, { status: 500 });
  }
}
