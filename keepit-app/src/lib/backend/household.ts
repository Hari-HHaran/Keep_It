import { AppState, GovernmentVoucher, HouseholdMember, Transaction } from "@/lib/types";

export async function getAuthenticatedUser(supabase: any) {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}

export async function getCurrentMembership(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("household_members")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

function displayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export async function loadHouseholdState(
  supabase: any,
  userId: string,
): Promise<AppState | null> {
  const membership = await getCurrentMembership(supabase, userId);
  if (!membership) return null;

  const householdId = membership.household_id;
  const [
    householdResult,
    membersResult,
    accountsResult,
    goalsResult,
    transactionsResult,
    vouchersResult,
    gigResult,
    nudgesResult,
  ] = await Promise.all([
    supabase.from("households").select("*").eq("id", householdId).single(),
    supabase.from("household_members").select("*").eq("household_id", householdId).order("created_at"),
    supabase.from("bank_accounts").select("*").eq("household_id", householdId).order("created_at"),
    supabase.from("savings_goals").select("*").eq("household_id", householdId).order("created_at"),
    supabase.from("transactions").select("*").eq("household_id", householdId).order("occurred_at", { ascending: false }).limit(100),
    supabase.from("government_vouchers").select("*").eq("household_id", householdId).order("expiry_date"),
    supabase.from("gig_profiles").select("*").eq("member_id", membership.id).maybeSingle(),
    supabase.from("nudges").select("*").eq("household_id", householdId).order("created_at", { ascending: false }).limit(30),
  ]);

  const firstError = [
    householdResult,
    membersResult,
    accountsResult,
    goalsResult,
    transactionsResult,
    vouchersResult,
    gigResult,
    nudgesResult,
  ].find((result) => result.error)?.error;

  if (firstError) throw new Error(firstError.message);

  const goalsByMember = new Map(
    (goalsResult.data || []).map((goal: any) => [goal.member_id, goal]),
  );

  const members: HouseholdMember[] = (membersResult.data || []).map((member: any) => {
    const goal: any = goalsByMember.get(member.id);
    return {
      id: member.id,
      name: member.full_name,
      role: member.role,
      age: member.age ?? undefined,
      workerType: member.employment_type ?? undefined,
      vehicleType: member.vehicle_type ?? undefined,
      personalBalance: Number(member.personal_balance || 0),
      avatarText: member.full_name
        .split(/\s+/)
        .map((part: string) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      savingsGoal: goal
        ? {
            id: goal.id,
            title: goal.title,
            targetAmount: Number(goal.target_amount),
            currentAmount: Number(goal.current_amount),
            categoryIcon: goal.category_icon || "🎯",
            categoryName: goal.category_name || undefined,
            notes: goal.notes || undefined,
            isCompleted: goal.is_completed,
          }
        : undefined,
    };
  });

  const transactions: Transaction[] = (transactionsResult.data || []).map((tx: any) => ({
    id: tx.id,
    date: displayDate(tx.occurred_at),
    description: tx.description,
    amount: Number(tx.amount),
    category: tx.category,
    source: tx.source,
    memberId: tx.member_id,
    accountId: tx.account_id || undefined,
    recipientId: tx.recipient_id || undefined,
    opportunityCostNote: tx.opportunity_cost_note || undefined,
    voucherApplicable: tx.voucher_applicable || undefined,
    isGigIncome: tx.is_gig_income,
  }));

  const today = new Date();
  const vouchers: GovernmentVoucher[] = (vouchersResult.data || []).map((voucher: any) => {
    const expiry = new Date(`${voucher.expiry_date}T23:59:59`);
    const daysRemaining = Math.max(
      0,
      Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000),
    );
    return {
      id: voucher.id,
      name: voucher.name,
      category: voucher.category,
      totalGranted: Number(voucher.total_granted),
      balance: Number(voucher.balance),
      expiryDate: expiry.toLocaleDateString("en-SG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      daysRemaining,
      description: voucher.description || "Government support balance",
      acceptedMerchants: voucher.accepted_merchants || [],
      isExpiringSoon: daysRemaining <= 30,
    };
  });

  const gig = gigResult.data;
  const household = householdResult.data;
  const accountRows = accountsResult.data || [];
  const totalAccounts = accountRows.reduce(
    (sum: number, account: any) => sum + Number(account.balance || 0),
    0,
  );
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthsSpend = transactionsResult.data
    .filter((tx: any) => new Date(tx.occurred_at) >= monthStart && Number(tx.amount) < 0)
    .reduce((sum: number, tx: any) => sum + Math.abs(Number(tx.amount)), 0);

  return {
    currentPersonaId: userId,
    householdId,
    currentMemberId: membership.id,
    backendMode: "supabase",
    householdName: household.name,
    totalHouseholdBalance: totalAccounts + Number(household.cash_balance || 0),
    thisMonthsSpend,
    members,
    bankAccounts: accountRows.map((account: any) => ({
      id: account.id,
      bankName: account.bank_name,
      accountNumber: account.account_number,
      accountType: account.account_type,
      balance: Number(account.balance),
      lastSynced: account.last_synced_at
        ? displayDate(account.last_synced_at)
        : "Manual account",
    })),
    transactions,
    vouchers,
    gigProfile: gig
      ? {
          workerType: "platform_worker",
          platformName: gig.platform_name,
          vehicleType: gig.vehicle_type,
          fedaPercentage: Number(gig.feda_percentage),
          grossWeeklyAverage: Number(gig.gross_weekly_average),
          safeWeeklySalary: Number(gig.safe_weekly_salary),
          bufferSaved: Number(gig.buffer_saved),
          monthlyWisEligible: gig.monthly_wis_eligible,
          wisMonthlyAmount: Number(gig.wis_monthly_amount),
          wisCashSplit: Number(gig.wis_cash_split),
          wisMedisaveSplit: Number(gig.wis_medisave_split),
          wisPayoutStatus: gig.wis_payout_status || [],
        }
      : undefined,
    nudges: (nudgesResult.data || []).map((nudge: any) => ({
      id: nudge.id,
      type: nudge.type,
      title: nudge.title,
      message: nudge.message,
      severity: nudge.severity,
      actionText: nudge.action_text || undefined,
      relatedTransactionId: nudge.related_transaction_id || undefined,
      timestamp: nudge.created_at,
    })),
    dismissedNudgeIds: (nudgesResult.data || [])
      .filter((nudge: any) => nudge.dismissed)
      .map((nudge: any) => nudge.id),
  };
}
