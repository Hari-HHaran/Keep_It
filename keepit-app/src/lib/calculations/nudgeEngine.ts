import { ContextualNudge, GovernmentVoucher, Transaction } from "../types";

/**
 * Contextual Literacy Nudge Engine
 * Evaluates a newly added or existing transaction against unspent government vouchers.
 * When a user spends cash/debit on a category where they hold an active expiring voucher,
 * it generates an actionable opportunity cost alert.
 */
export function checkOpportunityCostNudge(
  transaction: Transaction,
  vouchers: GovernmentVoucher[]
): ContextualNudge | null {
  // Only trigger for outflow expenses (amount < 0) and non-voucher payment sources
  if (transaction.amount >= 0 || transaction.source === "Voucher") {
    return null;
  }

  const spendAmount = Math.abs(transaction.amount);

  // Check Groceries against CDC Supermarket Vouchers
  if (transaction.category === "Groceries") {
    const cdcVoucher = vouchers.find(
      (v) => v.category === "CDC_Supermarket" && v.balance > 0
    );
    if (cdcVoucher) {
      return {
        id: `nudge-${Date.now()}`,
        type: "opportunity_cost",
        title: "Opportunity Cost Alert: Unused CDC Vouchers",
        message: `You spent $${spendAmount.toFixed(2)} on groceries via ${transaction.source}, but you have $${cdcVoucher.balance.toFixed(2)} in CDC Supermarket vouchers expiring in ${cdcVoucher.daysRemaining} days! Using vouchers saves real cash.`,
        severity: cdcVoucher.daysRemaining <= 14 ? "alert" : "warning",
        actionText: "Redeem CDC Voucher Instead",
        actionUrl: "#vouchers",
        relatedTransactionId: transaction.id,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Check Hawker & Dining against CDC Hawker Vouchers
  if (transaction.category === "Hawker & Dining") {
    const hawkerVoucher = vouchers.find(
      (v) => v.category === "CDC_Hawker" && v.balance > 0
    );
    if (hawkerVoucher) {
      return {
        id: `nudge-${Date.now()}`,
        type: "opportunity_cost",
        title: "Opportunity Cost Alert: CDC Hawker Vouchers Available",
        message: `You paid $${spendAmount.toFixed(2)} cash/PayNow for meals. You have $${hawkerVoucher.balance.toFixed(2)} in CDC Hawker vouchers available.`,
        severity: "warning",
        actionText: "View Hawker Vouchers",
        actionUrl: "#vouchers",
        relatedTransactionId: transaction.id,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Check Utilities against Climate Vouchers
  if (transaction.category === "Utilities" && spendAmount > 50) {
    const climateVoucher = vouchers.find(
      (v) => v.category === "Climate" && v.balance > 0
    );
    if (climateVoucher) {
      return {
        id: `nudge-${Date.now()}`,
        type: "opportunity_cost",
        title: "Climate Vouchers Applicable",
        message: `Did you know your $${climateVoucher.balance.toFixed(2)} Climate Vouchers can be used at participating electronics/appliance retailers for energy-efficient products?`,
        severity: "info",
        actionText: "View Climate Scheme",
        actionUrl: "#vouchers",
        relatedTransactionId: transaction.id,
        timestamp: new Date().toISOString(),
      };
    }
  }

  return null;
}
