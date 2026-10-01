export interface FarmOwnerWithStats {
  id: string;
  ownerCode: string | null;
  name: string;
  phone: string;
  alternatePhone: string | null;
  address: string | null;
  village: string;
  taluk: string | null;
  district: string | null;
  bankName: string | null;
  accountNumber: string | null;
  ifsc: string | null;
  notes: string | null;
  status: string;
  createdAt: string | Date;
  farmsCount?: number;
  treesBooked?: number;
  treesCompleted?: number;
  treesRemaining?: number;
  totalPurchases?: number;
  totalPaid?: number;
  outstandingBalance?: number;
}

export interface FarmWithDetails {
  id: string;
  farmCode: string | null;
  name: string;
  ownerId: string;
  location: string | null;
  village: string;
  taluk: string | null;
  district: string | null;
  totalTrees: number;
  notes: string | null;
  status: string;
  ownerName?: string;
  treesBooked?: number;
  treesCompleted?: number;
  treesRemaining?: number;
  completionRate?: number;
  totalHarvestedCoconuts?: number;
  avgCoconutsPerTree?: number;
}

export interface TreeBookingWithStats {
  id: string;
  bookingCode: string | null;
  ownerId: string;
  farmId: string;
  bookingDate: string | Date;
  totalTreesBooked: number;
  pricePerTree: number | null;
  expectedHarvestDate: string | Date | null;
  notes: string | null;
  status: string;
  ownerName?: string;
  farmName?: string;
  treesCompleted: number;
  treesRemaining: number;
  completionPercentage: number;
}

export interface DashboardMetrics {
  totalOwners: number;
  totalFarms: number;
  totalTreesBooked: number;
  treesCompleted: number;
  treesRemaining: number;
  treeCompletionRate: number;
  coconutStock: number;
  huskStock: number;
  copraStock: number;
  farmerOutstanding: number;
  todayPurchases: number;
  todaySales: number;
  todayExpenses: number;
  todayProfit: number;
  monthlySales: number;
  monthlyExpenses: number;
  monthlyProfit: number;
}
