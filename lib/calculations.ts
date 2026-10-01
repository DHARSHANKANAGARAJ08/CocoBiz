/**
 * Business Calculation Engine for CocoBiz
 * Enforces business logic and avoids duplicate calculations
 */

export function calculateTreeRemaining(booked: number, completed: number): number {
  const remaining = Math.max(0, booked - completed);
  return remaining;
}

export function calculateTreeCompletionPercentage(booked: number, completed: number): number {
  if (!booked || booked <= 0) return 0;
  const pct = (completed / booked) * 100;
  return Math.min(100, Math.round(pct * 10) / 10);
}

export function calculateAverageCoconutsPerTree(coconutCount: number, treesHarvested: number): number {
  if (!treesHarvested || treesHarvested <= 0) return 0;
  return Math.round((coconutCount / treesHarvested) * 100) / 100;
}

export function calculateFarmerOutstanding(totalPurchases: number, totalPaid: number): number {
  return Math.round((totalPurchases - totalPaid) * 100) / 100;
}

export function calculateCopraConversionRatio(coconutsUsed: number, copraProducedKg: number): number {
  if (!coconutsUsed || coconutsUsed <= 0) return 0;
  // kg of copra per 100 coconuts
  return Math.round((copraProducedKg / coconutsUsed) * 100 * 100) / 100;
}

export function calculateGrossProfit(revenue: number, cogs: number): number {
  return Math.round((revenue - cogs) * 100) / 100;
}

export function calculateNetProfit(
  revenue: number,
  cogs: number,
  workerSalary: number,
  transportExpenses: number,
  processingCosts: number,
  otherExpenses: number
): number {
  const operatingExpenses = workerSalary + transportExpenses + processingCosts + otherExpenses;
  const gross = calculateGrossProfit(revenue, cogs);
  return Math.round((gross - operatingExpenses) * 100) / 100;
}
