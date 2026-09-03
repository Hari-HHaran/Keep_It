import {
  AppState,
  GovernmentVoucher,
  Transaction,
} from "./types";

import {
  ALEX_STATE,
  INITIAL_APP_STATE,
  JIA_LE_STATE,
  MARCUS_GIG_STATE,
} from "./mockData";

import { checkOpportunityCostNudge } from "./calculations/nudgeEngine";

/*
 * Version 2 ensures old browser data does not override
 * Grandma's newly added goals.
 */
const STORAGE_KEY = "keepit_app_state_v2";

export function loadSavedState(
  personaId?: string
): AppState {
  if (typeof window === "undefined") {
    return INITIAL_APP_STATE;
  }

  const requestedPersona =
    personaId || "tan_family";

  try {
    const raw = localStorage.getItem(
      STORAGE_KEY
    );

    if (raw) {
      const parsed: AppState = JSON.parse(raw);

      if (
        parsed.currentPersonaId ===
        requestedPersona
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.error(
      "Error loading saved state:",
      error
    );
  }

  return getSeedStateForPersona(
    requestedPersona
  );
}

export function saveState(
  state: AppState
): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (error) {
    console.error(
      "Error saving state:",
      error
    );
  }
}

export function getSeedStateForPersona(
  personaId: string
): AppState {
  switch (personaId) {
    case "marcus_gig":
      return JSON.parse(
        JSON.stringify(MARCUS_GIG_STATE)
      );

    case "jia_le":
      return JSON.parse(
        JSON.stringify(JIA_LE_STATE)
      );

    case "alex_young_adult":
      return JSON.parse(
        JSON.stringify(ALEX_STATE)
      );

    case "tan_family":
    default:
      return JSON.parse(
        JSON.stringify(INITIAL_APP_STATE)
      );
  }
}

export function addTransactionToState(
  state: AppState,
  transaction: Omit<Transaction, "id">
): {
  state: AppState;
  opportunityNudge?: ReturnType<
    typeof checkOpportunityCostNudge
  >;
} {
  const newTransaction: Transaction = {
    ...transaction,
    id: `tx-${Date.now()}`,
  };

  const updatedTransactions = [
    newTransaction,
    ...state.transactions,
  ];

  const newHouseholdBalance =
    Math.round(
      (state.totalHouseholdBalance +
        newTransaction.amount) *
        100
    ) / 100;

  const newMonthSpend =
    newTransaction.amount < 0
      ? Math.round(
          (state.thisMonthsSpend +
            Math.abs(newTransaction.amount)) *
            100
        ) / 100
      : state.thisMonthsSpend;

  const nudge = checkOpportunityCostNudge(
    newTransaction,
    state.vouchers
  );

  const updatedNudges = nudge
    ? [nudge, ...state.nudges]
    : state.nudges;

  /*
   * Pocket money only increases personal balance.
   * It does not automatically increase savings.
   */
  let updatedMembers = [...state.members];

  if (newTransaction.recipientId) {
    updatedMembers = updatedMembers.map(
      (member) => {
        if (
          member.id !==
          newTransaction.recipientId
        ) {
          return member;
        }

        const updatedBalance =
          (member.personalBalance || 0) +
          Math.abs(newTransaction.amount);

        return {
          ...member,
          personalBalance:
            Math.round(
              updatedBalance * 100
            ) / 100,
        };
      }
    );
  }

  const nextState: AppState = {
    ...state,
    totalHouseholdBalance:
      newHouseholdBalance,
    thisMonthsSpend: newMonthSpend,
    transactions: updatedTransactions,
    nudges: updatedNudges,
    members: updatedMembers,
  };

  saveState(nextState);

  return {
    state: nextState,
    opportunityNudge: nudge || undefined,
  };
}

export function redeemVoucherInState(
  state: AppState,
  voucherId: string,
  amount: number
): AppState {
  const updatedVouchers =
    state.vouchers.map((voucher) => {
      if (voucher.id !== voucherId) {
        return voucher;
      }

      return {
        ...voucher,
        balance:
          Math.round(
            Math.max(
              0,
              voucher.balance - amount
            ) * 100
          ) / 100,
      };
    });

  const nextState: AppState = {
    ...state,
    vouchers: updatedVouchers,
  };

  saveState(nextState);

  return nextState;
}

export function claimNewVoucherInState(
  state: AppState,
  voucher: GovernmentVoucher
): AppState {
  const nextState: AppState = {
    ...state,
    vouchers: [
      voucher,
      ...state.vouchers,
    ],
  };

  saveState(nextState);

  return nextState;
}