export interface ParsedReceipt {
  merchantName: string;
  totalAmount: number;
  date: string;
  category: "Groceries" | "Hawker & Dining" | "Transport" | "Utilities" | "Other";
  suggestedVoucherCategory?: "CDC_Supermarket" | "CDC_Hawker" | "Climate" | "SG60";
  items: { name: string; price: number }[];
  rawText: string;
  confidence: number;
}

export const SAMPLE_RECEIPTS: { id: string; label: string; data: ParsedReceipt }[] = [
  {
    id: "rcpt-fairprice",
    label: "NTUC FairPrice Supermarket Receipt ($24.50)",
    data: {
      merchantName: "NTUC FairPrice (Tampines Mall)",
      totalAmount: 24.50,
      date: new Date().toLocaleDateString("en-SG"),
      category: "Groceries",
      suggestedVoucherCategory: "CDC_Supermarket",
      items: [
        { name: "Fresh Milk 1L", price: 3.65 },
        { name: "White Rice 5kg", price: 11.50 },
        { name: "Farm Fresh Eggs 10s", price: 3.45 },
        { name: "Canola Cooking Oil 2L", price: 5.90 },
      ],
      rawText: "NTUC FAIRPRICE CO-OPERATIVE LTD\nTAMPINES MALL #B1-01\nTAX INVOICE / RECEIPT\n1x FRESH MILK 1L - $3.65\n1x WHITE RICE 5KG - $11.50\n1x FARM EGGS 10S - $3.45\n1x CANOLA OIL 2L - $5.90\nTOTAL: $24.50\nPAID BY: CASH",
      confidence: 0.98,
    },
  },
  {
    id: "rcpt-sheng-siong",
    label: "Sheng Siong Supermarket Receipt ($38.20)",
    data: {
      merchantName: "Sheng Siong Supermarket (Bedok)",
      totalAmount: 38.20,
      date: new Date().toLocaleDateString("en-SG"),
      category: "Groceries",
      suggestedVoucherCategory: "CDC_Supermarket",
      items: [
        { name: "Frozen Chicken Breast 2kg", price: 14.80 },
        { name: "Fresh Salmon Fillet", price: 12.50 },
        { name: "Bok Choy & Chye Sim", price: 4.20 },
        { name: "Tiger Balm Red", price: 6.70 },
      ],
      rawText: "SHENG SIONG SUPERMARKET\nBEDOK CENTRAL #01-18\nTAX INVOICE\nTOTAL: $38.20\nPAID: CASH",
      confidence: 0.96,
    },
  },
  {
    id: "rcpt-kopitiam",
    label: "Kopitiam Food Court Receipt ($8.50)",
    data: {
      merchantName: "Kopitiam @ Tampines",
      totalAmount: 8.50,
      date: new Date().toLocaleDateString("en-SG"),
      category: "Hawker & Dining",
      suggestedVoucherCategory: "CDC_Hawker",
      items: [
        { name: "Roasted Chicken Rice Set", price: 6.50 },
        { name: "Kopi O Kosong Peng", price: 2.00 },
      ],
      rawText: "KOPITIAM FOOD COURT\nSTALL #04 HAINANESE CHICKEN RICE\nCHICKEN RICE SET: $6.50\nDRINKS: $2.00\nTOTAL: $8.50\nPAID: CASH",
      confidence: 0.95,
    },
  },
];

/**
 * Intelligent Receipt Parser that handles text or uploaded mock receipts
 */
export function parseReceiptText(text: string): ParsedReceipt {
  const lower = text.toLowerCase();
  
  let merchantName = "Unknown Merchant";
  let category: "Groceries" | "Hawker & Dining" | "Transport" | "Utilities" | "Other" = "Other";
  let suggestedVoucherCategory: "CDC_Supermarket" | "CDC_Hawker" | "Climate" | "SG60" | undefined = undefined;

  if (lower.includes("fairprice") || lower.includes("ntuc") || lower.includes("sheng siong") || lower.includes("giant") || lower.includes("cold storage") || lower.includes("prime")) {
    merchantName = lower.includes("fairprice") ? "NTUC FairPrice" : lower.includes("sheng siong") ? "Sheng Siong" : "Supermarket";
    category = "Groceries";
    suggestedVoucherCategory = "CDC_Supermarket";
  } else if (lower.includes("kopitiam") || lower.includes("hawker") || lower.includes("foodfare") || lower.includes("chicken rice") || lower.includes("milo") || lower.includes("coffee")) {
    merchantName = "Heartland Hawker / Food Court";
    category = "Hawker & Dining";
    suggestedVoucherCategory = "CDC_Hawker";
  } else if (lower.includes("sp group") || lower.includes("utilities") || lower.includes("best denki") || lower.includes("courts") || lower.includes("refrigerator")) {
    merchantName = "Appliance / Utilities";
    category = "Utilities";
    suggestedVoucherCategory = "Climate";
  } else if (lower.includes("petrol") || lower.includes("esso") || lower.includes("shell") || lower.includes("spc") || lower.includes("grab")) {
    merchantName = "Transport / Fuel";
    category = "Transport";
  }

  // Extract dollar amount: matches "$XX.XX" or "TOTAL: XX.XX"
  const amountMatch = text.match(/(?:total|amount|sgd|\$)\s*:?\s*\$?(\d+(?:\.\d{1,2})?)/i) || text.match(/\$(\d+\.\d{2})/);
  const totalAmount = amountMatch ? parseFloat(amountMatch[1]) : 15.00;

  return {
    merchantName,
    totalAmount,
    date: new Date().toLocaleDateString("en-SG"),
    category,
    suggestedVoucherCategory,
    items: [{ name: "Scanned Receipt Item(s)", price: totalAmount }],
    rawText: text,
    confidence: 0.92,
  };
}
