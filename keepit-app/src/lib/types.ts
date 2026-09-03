export type RoleType = "manager" | "dependent";

export type WorkerType = "platform_worker" | "variable_income" | "regular_income" | "not_applicable";

export type VehicleType = "car_van_lorry" | "motorcycle_pmd" | "bicycle_walking_public" | "none";

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  categoryIcon: string;
  categoryName?: string;
  itemUrlOrPhoto?: string;
  notes?: string;
  isCompleted?: boolean;
  completedAt?: string;
}

export interface HouseholdMember {
  id: string;
  name: string;
  role: "manager" | "co_manager" | "dependent";
  age?: number;
  avatarBg?: string;
  avatarText?: string;
  workerType?: WorkerType;
  vehicleType?: VehicleType;
  dependentPin?: string;
  savingsGoal?: SavingsGoal;
  wishlistGoals?: SavingsGoal[];
  personalBalance?: number;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: "savings" | "current" | "wallet";
  balance: number;
  lastSynced: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number; // positive for income, negative for expense
  category: "Groceries" | "Hawker & Dining" | "Pocket Money" | "Transport" | "Utilities" | "Gig Payout" | "Voucher Redemption" | "Other";
  source: string;
  recipientId?: string; // e.g. Jia Le for pocket money
  memberId: string;
  accountId?: string;
  opportunityCostNote?: string;
  voucherApplicable?: string;
  isGigIncome?: boolean;
}

export interface GovernmentVoucher {
  id: string;
  name: string;
  category: "CDC_Supermarket" | "CDC_Hawker" | "Climate" | "SG60" | "Workfare_WIS";
  totalGranted: number;
  balance: number;
  expiryDate: string; // ISO date string or human readable
  daysRemaining: number;
  description: string;
  acceptedMerchants: string[];
  isExpiringSoon: boolean;
  recommendedWeeklyPace?: number;
}

export interface GigProfile {
  workerType: WorkerType;
  platformName: string; // e.g. "Lalamove", "GrabFood", "Foodpanda"
  vehicleType: VehicleType;
  fedaPercentage: number; // 60%, 35%, 20%
  grossWeeklyAverage: number;
  safeWeeklySalary: number;
  bufferSaved: number;
  monthlyWisEligible: boolean;
  wisMonthlyAmount: number;
  wisCashSplit: number; // 10%
  wisMedisaveSplit: number; // 90%
  wisPayoutStatus: {
    month: string;
    status: "received" | "missed" | "expected" | "pending";
    amount: number;
  }[];
}

export interface ContextualNudge {
  id: string;
  type: "opportunity_cost" | "voucher_expiry" | "gig_buffer" | "location_nearby";
  title: string;
  message: string;
  severity?: "alert" | "warning" | "info";
  actionText?: string;
  actionUrl?: string;
  relatedTransactionId?: string;
  timestamp?: string;
  amountLost?: number;
  actionVoucherId?: string;
  ctaText?: string;
}

export interface LocationMerchant {
  id: string;
  name: string;
  locationName: string; // e.g. "Bedok 85 Hawker Centre"
  acceptedVouchers: ("CDC_Supermarket" | "CDC_Hawker" | "Climate" | "SG60")[];
  distanceMeters: number;
  discountNote?: string;
}

export interface AppState {
  currentPersonaId: string;
  householdName: string;
  totalHouseholdBalance: number;
  thisMonthsSpend: number;
  members: HouseholdMember[];
  bankAccounts: BankAccount[];
  accounts?: BankAccount[];
  transactions: Transaction[];
  vouchers: GovernmentVoucher[];
  gigProfile?: GigProfile;
  nudges: ContextualNudge[];
  dismissedNudgeIds?: string[];
  currentSimulatedLocation?: LocationMerchant | null;
  backendMode?: "supabase" | "demo";
  householdId?: string;
  currentMemberId?: string;
}
