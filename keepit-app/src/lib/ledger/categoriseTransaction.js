import { findMerchantOnGoogleMaps } from "./googlePlaces";


/*
 * ============================================================
 * GOOGLE PLACE TYPES
 * ============================================================
 */

const FOOD_TYPES = new Set([
  "restaurant",
  "cafe",
  "bakery",
  "meal_takeaway",
  "meal_delivery",
  "fast_food_restaurant",

  "chinese_restaurant",
  "japanese_restaurant",
  "korean_restaurant",
  "indian_restaurant",
  "italian_restaurant",
  "thai_restaurant",
  "vietnamese_restaurant",
  "mexican_restaurant",

  "seafood_restaurant",
  "steak_house",
  "hamburger_restaurant",
  "pizza_restaurant",
  "sandwich_shop",
  "ice_cream_shop",
]);


const GROCERY_TYPES = new Set([
  "grocery_store",
  "supermarket",
  "convenience_store",
  "food_store",
]);


/*
 * ============================================================
 * FINANCIAL KEYWORDS
 *
 * These are used for transactions that are NOT merchants.
 * ============================================================
 */

const POCKET_MONEY_KEYWORDS = [
  "pocket money",
  "allowance",
  "allowence",
];

const FRIEND_REPAYMENT_KEYWORDS = [
  "repay",
  "repayment",
  "pay back",
  "payback",
  "split bill",
  "settlement",
  "settle",
];

const SALARY_KEYWORDS = [
  "salary",
  "payroll",
  "monthly salary",
  "wages",
];

const GIG_INCOME_KEYWORDS = [
  "grab",
  "foodpanda",
  "deliveroo",
  "gojek",
  "lalamove",
  "freelance",
  "gig income",
  "delivery income",
];

const UTILITY_KEYWORDS = [
  "sp services",
  "singtel",
  "starhub",
  "m1",
  "utility",
  "electricity",
  "water bill",
  "internet bill",
  "phone bill",
];

const RENT_KEYWORDS = [
  "rent",
  "rental",
  "landlord",
];

const HEALTHCARE_KEYWORDS = [
  "clinic",
  "hospital",
  "pharmacy",
  "medical",
  "dentist",
];

const EDUCATION_KEYWORDS = [
  "school",
  "tuition",
  "polytechnic",
  "university",
  "course",
  "education",
];


/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

function normaliseText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


function containsKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}


/*
 * ============================================================
 * MAIN CATEGORISATION FUNCTION
 * ============================================================
 */

export async function categoriseTransaction(transaction) {
  const description = normaliseText(transaction.description);

  const merchantName = normaliseText(
    transaction.merchantName
  );

  const counterpartyName = normaliseText(
    transaction.counterpartyName
  );

  const combinedText = [
    description,
    merchantName,
    counterpartyName,
  ]
    .filter(Boolean)
    .join(" ");


  /*
   * ----------------------------------------------------------
   * STEP 1
   * Financial transactions that should NOT be sent to
   * Google Maps as merchant searches.
   * ----------------------------------------------------------
   */

  if (containsKeyword(combinedText, POCKET_MONEY_KEYWORDS)) {
    return {
      category: "pocket_money",
      purpose: "Pocket money to dependent",
      confidence: 0.98,
      method: "financial_rules",
      merchant: null,
    };
  }


  if (containsKeyword(combinedText, FRIEND_REPAYMENT_KEYWORDS)) {
    return {
      category: "friend_repayment",
      purpose: "Repayment to friend",
      confidence: 0.95,
      method: "financial_rules",
      merchant: null,
    };
  }


  if (
    transaction.direction === "income" &&
    containsKeyword(combinedText, SALARY_KEYWORDS)
  ) {
    return {
      category: "salary",
      purpose: "Salary income",
      confidence: 0.98,
      method: "financial_rules",
      merchant: null,
    };
  }


  if (
    transaction.direction === "income" &&
    containsKeyword(combinedText, GIG_INCOME_KEYWORDS)
  ) {
    return {
      category: "gig_income",
      purpose: "Gig work income",
      confidence: 0.92,
      method: "financial_rules",
      merchant: null,
    };
  }


  if (containsKeyword(combinedText, UTILITY_KEYWORDS)) {
    return {
      category: "utilities",
      purpose: "Utilities and telecommunications",
      confidence: 0.93,
      method: "financial_rules",
      merchant: null,
    };
  }


  if (containsKeyword(combinedText, RENT_KEYWORDS)) {
    return {
      category: "rent",
      purpose: "Housing rent",
      confidence: 0.95,
      method: "financial_rules",
      merchant: null,
    };
  }


  if (containsKeyword(combinedText, HEALTHCARE_KEYWORDS)) {
    return {
      category: "healthcare",
      purpose: "Healthcare",
      confidence: 0.90,
      method: "financial_rules",
      merchant: null,
    };
  }


  if (containsKeyword(combinedText, EDUCATION_KEYWORDS)) {
    return {
      category: "education",
      purpose: "Education",
      confidence: 0.90,
      method: "financial_rules",
      merchant: null,
    };
  }


  /*
   * ----------------------------------------------------------
   * STEP 2
   * Google Maps merchant recognition.
   *
   * Example:
   *
   * "Eng's Wantan Noodle"
   * "Sheng Siong"
   * "Cold Storage"
   * "The Soup Spoon"
   *
   * We don't need "restaurant" or "supermarket" in the name.
   * ----------------------------------------------------------
   */

  let merchant = null;

  try {
    merchant = await findMerchantOnGoogleMaps({
      merchantName:
        transaction.merchantName ||
        transaction.description ||
        transaction.counterpartyName,

      address: transaction.merchantAddress,

      latitude: transaction.latitude,

      longitude: transaction.longitude,
    });
  } catch (error) {
    console.error(
      "Google Places merchant lookup failed:",
      error.message
    );
  }


  /*
   * ----------------------------------------------------------
   * STEP 3
   * Convert Google place types into KeepIt's categories.
   * ----------------------------------------------------------
   */

  if (merchant) {
    const types = new Set([
      ...(merchant.types || []),
      merchant.primaryType,
    ]);


    /*
     * Grocery gets checked first.
     *
     * This is important because supermarkets can also
     * have generic food-related types.
     */

    const isGrocery = [...types].some((type) =>
      GROCERY_TYPES.has(type)
    );


    if (isGrocery) {
      return {
        category: "groceries",
        purpose: "Household groceries",
        confidence: 0.95,
        method: "google_places",
        merchant,
      };
    }


    const isFood = [...types].some((type) =>
      FOOD_TYPES.has(type)
    );


    if (isFood) {
      return {
        category: "food",
        purpose: "Food and dining",
        confidence: 0.95,
        method: "google_places",
        merchant,
      };
    }
  }


  /*
   * ----------------------------------------------------------
   * STEP 4
   * Generic transfer detection.
   * ----------------------------------------------------------
   */

  if (
    transaction.direction === "income" &&
    (
      transaction.source === "paynow" ||
      transaction.source === "paylah"
    )
  ) {
    return {
      category: "transfer",
      purpose: "Incoming transfer",
      confidence: 0.70,
      method: "transaction_rules",
      merchant,
    };
  }


  if (
    transaction.direction === "expense" &&
    (
      transaction.source === "paynow" ||
      transaction.source === "paylah"
    )
  ) {
    return {
      category: "transfer",
      purpose: "Outgoing transfer",
      confidence: 0.70,
      method: "transaction_rules",
      merchant,
    };
  }


  /*
   * ----------------------------------------------------------
   * STEP 5
   * If nothing can confidently identify the transaction,
   * don't guess.
   *
   * The transaction remains visible and can later be
   * categorised manually.
   * ----------------------------------------------------------
   */

  return {
    category: "uncategorised",

    purpose: null,

    confidence: 0,

    method: merchant
      ? "google_places_no_category"
      : "merchant_not_found",

    merchant,
  };
}