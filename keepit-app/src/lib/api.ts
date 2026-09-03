import { AppState, GovernmentVoucher, SavingsGoal, Transaction } from "@/lib/types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || body.message || `Request failed (${response.status})`);
  }
  return body as T;
}

export function fetchHousehold(): Promise<{ state: AppState }> {
  return request("/api/household", { cache: "no-store" });
}

export function createTransaction(transaction: Omit<Transaction, "id">) {
  return request<{ transaction: Transaction; nudge?: unknown }>("/api/ledger", {
    method: "POST",
    body: JSON.stringify(transaction),
  });
}

export function redeemVoucher(voucherId: string, amount: number) {
  return request<{ voucher: GovernmentVoucher }>("/api/vouchers", {
    method: "POST",
    body: JSON.stringify({ action: "redeem", voucherId, amount }),
  });
}

export function claimVoucher(voucher: GovernmentVoucher) {
  return request<{ voucher: GovernmentVoucher }>("/api/vouchers", {
    method: "POST",
    body: JSON.stringify({ action: "claim", voucher }),
  });
}

export function saveGoal(memberId: string, goal: SavingsGoal) {
  return request("/api/savings-goals", {
    method: "POST",
    body: JSON.stringify({ action: "upsert", memberId, goal }),
  });
}

export function depositGoal(memberId: string, goalId: string, amount: number) {
  return request("/api/savings-goals", {
    method: "POST",
    body: JSON.stringify({ action: "deposit", memberId, goalId, amount }),
  });
}

export function addDependentMember(data: { name: string; age: number; personalBalance: number; savingsGoal?: Omit<SavingsGoal, "id"> }) {
  return request<{ state: AppState; memberId: string }>("/api/household", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

