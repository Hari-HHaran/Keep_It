import { AppState, GovernmentVoucher, Transaction } from "./types";
import { INITIAL_APP_STATE, MARCUS_GIG_STATE, JIA_LE_STATE, ALEX_STATE } from "./mockData";
import { checkOpportunityCostNudge } from "./calculations/nudgeEngine";

const STORAGE_KEY = "keepit_app_state_v1";

export function loadSavedState(personaId?: string): AppState {
  if (typeof window === "undefined") {
    return INITIAL_APP_STATE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: AppState = JSON.parse(raw);
      if (!personaId || parsed.currentPersonaId === personaId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error loading saved state", e);
  }

  // Return seed based on persona
  return getSeedStateForPersona(personaId || "tan_family");
}

export function saveState(state: AppState): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Error saving state", e);
    }
  }
}

export function getSeedStateForPersona(personaId: string): AppState {
  switch (personaId) {
    case "marcus_gig":
      return JSON.parse(JSON.stringify(MARCUS_GIG_STATE));
    case "jia_le":
      return JSON.parse(JSON.stringify(JIA_LE_STATE));
    case "alex_young_adult":
      return JSON.parse(JSON.stringify(ALEX_STATE));
    case "tan_family":
    default:
      return JSON.parse(JSON.stringify(INITIAL_APP_STATE));
  }
}

export function addTransactionToState(state: AppState, tx: Omit<Transaction, "id">): { state: AppState; opportunityNudge?: any } {
  const newTx: Transaction = {
    ...tx,
    id: `tx-${Date.now()}`,
  };

  const updatedTransactions = [newTx, ...state.transactions];
  
  // Recalculate balance and spend
  const balanceDelta = newTx.amount;
  const newHouseholdBalance = Math.round((state.totalHouseholdBalance + balanceDelta) * 100) / 100;
  const newMonthSpend = newTx.amount < 0 
    ? Math.round((state.thisMonthsSpend + Math.abs(newTx.amount)) * 100) / 100 
    : state.thisMonthsSpend;

  // Check opportunity cost nudge
  const nudge = checkOpportunityCostNudge(newTx, state.vouchers);
  const updatedNudges = nudge ? [nudge, ...state.nudges] : state.nudges;

  // If this transaction was pocket money to Jia Le, update Jia Le's balance
  let updatedMembers = [...state.members];
  if (newTx.recipientId) {
    updatedMembers = updatedMembers.map((m) => {
      if (m.id === newTx.recipientId) {
        const newBal = (m.personalBalance || 0) + Math.abs(newTx.amount);
        let updatedGoal = m.savingsGoal;
        if (updatedGoal) {
          updatedGoal = {
            ...updatedGoal,
            currentAmount: Math.min(updatedGoal.targetAmount, updatedGoal.currentAmount + Math.abs(newTx.amount)),
          };
        }
        return {
          ...m,
          personalBalance: Math.round(newBal * 100) / 100,
          savingsGoal: updatedGoal,
        };
      }
      return m;
    });
  }

  const nextState: AppState = {
    ...state,
    totalHouseholdBalance: newHouseholdBalance,
    thisMonthsSpend: newMonthSpend,
    transactions: updatedTransactions,
    nudges: updatedNudges,
    members: updatedMembers,
  };

  saveState(nextState);
  return { state: nextState, opportunityNudge: nudge };
}

export function redeemVoucherInState(state: AppState, voucherId: string, amount: number): AppState {
  const updatedVouchers = state.vouchers.map((v) => {
    if (v.id === voucherId) {
      const newBal = Math.max(0, v.balance - amount);
      return {
        ...v,
        balance: Math.round(newBal * 100) / 100,
      };
    }
    return v;
  });

  const nextState: AppState = {
    ...state,
    vouchers: updatedVouchers,
  };

  saveState(nextState);
  return nextState;
}

export function claimNewVoucherInState(state: AppState, voucher: GovernmentVoucher): AppState {
  const nextState: AppState = {
    ...state,
    vouchers: [voucher, ...state.vouchers],
  };
  saveState(nextState);
  return nextState;
}
