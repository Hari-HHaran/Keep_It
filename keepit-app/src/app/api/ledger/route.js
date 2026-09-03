import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

import { categoriseTransaction } from "@/lib/ledger/categoriseTransaction";


/*
 * ============================================================
 * HELPERS
 * ============================================================
 */


/*
 * Find the authenticated user's household membership.
 */
async function getMembership(userId, householdId) {
  const { data, error } = await supabaseAdmin
    .from("household_members")
    .select(`
      id,
      household_id,
      user_id,
      role,
      full_name,
      phone
    `)
    .eq("household_id", householdId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


/*
 * Make sure the requested account belongs to the
 * requested household/member.
 */
async function getAccount({
  accountId,
  householdId,
  memberId,
}) {
  let query = supabaseAdmin
    .from("bank_accounts")
    .select("*")
    .eq("id", accountId)
    .eq("household_id", householdId);

  if (memberId) {
    query = query.eq("member_id", memberId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


/*
 * Mask account numbers before returning them to the frontend.
 */
function maskAccountNumber(accountNumber) {
  if (!accountNumber) {
    return null;
  }

  const value = String(accountNumber);

  if (value.length <= 4) {
    return value;
  }

  return `****${value.slice(-4)}`;
}


/*
 * ============================================================
 * GET
 *
 * Used by the frontend to retrieve:
 *
 * - household members
 * - all accounts
 * - transaction history
 * - balances
 * - incoming money
 * - outgoing money
 *
 * Optional:
 *
 * ?householdId=...
 * ?memberId=...
 * ?accountId=...
 * ?from=...
 * ?to=...
 * ============================================================
 */

export async function GET(request) {
  try {
    /*
     * Authenticate user using Supabase cookies.
     */
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          status: "error",
          message: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }


    const { searchParams } = new URL(request.url);

    const householdId =
      searchParams.get("householdId");

    const requestedMemberId =
      searchParams.get("memberId");

    const accountId =
      searchParams.get("accountId");

    const from =
      searchParams.get("from");

    const to =
      searchParams.get("to");


    if (!householdId) {
      return NextResponse.json(
        {
          status: "error",
          message: "householdId is required",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * Verify that the logged-in user actually belongs
     * to this household.
     */
    const membership = await getMembership(
      user.id,
      householdId
    );


    if (!membership) {
      return NextResponse.json(
        {
          status: "error",
          message: "You do not have access to this household",
        },
        {
          status: 403,
        }
      );
    }


    /*
     * Dependants can only see their own information.
     *
     * Managers/co-managers can see the whole household.
     */
    const isDependent =
      membership.role === "dependent";


    const effectiveMemberId =
      isDependent
        ? membership.id
        : requestedMemberId;


    /*
     * --------------------------------------------------------
     * MEMBERS
     * --------------------------------------------------------
     */

    let membersQuery = supabaseAdmin
      .from("household_members")
      .select(`
        id,
        household_id,
        user_id,
        role,
        full_name,
        phone
      `)
      .eq("household_id", householdId);


    if (isDependent) {
      membersQuery =
        membersQuery.eq("id", membership.id);
    }


    const {
      data: members,
      error: membersError,
    } = await membersQuery;


    if (membersError) {
      throw new Error(membersError.message);
    }


    /*
     * --------------------------------------------------------
     * ACCOUNTS
     * --------------------------------------------------------
     */

    let accountsQuery = supabaseAdmin
      .from("bank_accounts")
      .select(`
        id,
        household_id,
        member_id,
        bank_name,
        account_number,
        account_type,
        balance,
        provider,
        provider_account_id,
        sync_status,
        sync_error,
        last_synced_at,
        currency,
        is_active
      `)
      .eq("household_id", householdId)
      .eq("is_active", true);


    if (effectiveMemberId) {
      accountsQuery =
        accountsQuery.eq("member_id", effectiveMemberId);
    }


    const {
      data: rawAccounts,
      error: accountsError,
    } = await accountsQuery;


    if (accountsError) {
      throw new Error(accountsError.message);
    }


    const accounts = (rawAccounts || []).map(
      (account) => ({
        ...account,

        account_number:
          maskAccountNumber(account.account_number),
      })
    );


    /*
     * --------------------------------------------------------
     * TRANSACTIONS
     * --------------------------------------------------------
     */

    let transactionsQuery = supabaseAdmin
      .from("ledger_transactions")
      .select(`
        id,
        household_id,
        member_id,
        account_id,
        recipient_member_id,
        transaction_date,
        description,
        merchant_name,
        merchant_address,
        google_place_id,
        google_primary_type,
        google_types,
        amount,
        direction,
        category,
        purpose,
        counterparty_name,
        source,
        source_reference,
        sync_status,
        fallback_source,
        categorisation_confidence,
        categorisation_method,
        receipt_storage_path,
        created_at
      `)
      .eq("household_id", householdId)
      .order("transaction_date", {
        ascending: false,
      });


    if (effectiveMemberId) {
      transactionsQuery =
        transactionsQuery.eq(
          "member_id",
          effectiveMemberId
        );
    }


    if (accountId) {
      transactionsQuery =
        transactionsQuery.eq(
          "account_id",
          accountId
        );
    }


    if (from) {
      transactionsQuery =
        transactionsQuery.gte(
          "transaction_date",
          from
        );
    }


    if (to) {
      transactionsQuery =
        transactionsQuery.lte(
          "transaction_date",
          to
        );
    }


    const {
      data: transactions,
      error: transactionsError,
    } = await transactionsQuery;


    if (transactionsError) {
      throw new Error(
        transactionsError.message
      );
    }


    /*
     * --------------------------------------------------------
     * CALCULATE HOUSEHOLD TOTALS
     * --------------------------------------------------------
     */

    const totalBalance =
      (rawAccounts || []).reduce(
        (total, account) =>
          total + Number(account.balance || 0),
        0
      );


    const totalIncome =
      (transactions || [])
        .filter(
          (transaction) =>
            transaction.direction === "income"
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount || 0),
          0
        );


    const totalExpenses =
      (transactions || [])
        .filter(
          (transaction) =>
            transaction.direction === "expense"
        )
        .reduce(
          (total, transaction) =>
            total + Number(transaction.amount || 0),
          0
        );


    return NextResponse.json({
      status: "success",

      householdId,

      members,

      accounts,

      transactions: transactions || [],

      summary: {
        totalBalance,
        totalIncome,
        totalExpenses,
        transactionCount:
          transactions?.length || 0,
      },
    });


  } catch (error) {
    console.error(
      "GET /api/ledger error:",
      error
    );

    return NextResponse.json(
      {
        status: "error",
        message:
          error.message ||
          "Failed to retrieve household ledger",
      },
      {
        status: 500,
      }
    );
  }
}


/*
 * ============================================================
 * POST
 *
 * Creates a real transaction in Supabase.
 *
 * This handles:
 *
 * - bank transactions
 * - card transactions
 * - PayNow
 * - PayLah
 * - OCR receipts
 * - manual fallback
 *
 * Google Maps merchant recognition happens here.
 * ============================================================
 */

export async function POST(request) {
  try {
    /*
     * Authenticate user.
     */
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();


    if (authError || !user) {
      return NextResponse.json(
        {
          status: "error",
          message: "Not authenticated",
        },
        {
          status: 401,
        }
      );
    }


    const body = await request.json();


    const {
      householdId,
      memberId,
      accountId,

      description,
      amount,
      direction,

      source,
      sourceReference,

      merchantName,
      merchantAddress,

      latitude,
      longitude,

      counterpartyName,

      recipientMemberId,

      category,
      purpose,

      fallbackSource,

      receiptStoragePath,

      rawData,
    } = body;


    /*
     * --------------------------------------------------------
     * VALIDATION
     * --------------------------------------------------------
     */

    if (!householdId) {
      return NextResponse.json(
        {
          status: "error",
          message: "householdId is required",
        },
        {
          status: 400,
        }
      );
    }


    if (!memberId) {
      return NextResponse.json(
        {
          status: "error",
          message: "memberId is required",
        },
        {
          status: 400,
        }
      );
    }


    if (!description) {
      return NextResponse.json(
        {
          status: "error",
          message: "description is required",
        },
        {
          status: 400,
        }
      );
    }


    const numericAmount =
      Number(amount);


    if (
      Number.isNaN(numericAmount) ||
      numericAmount < 0
    ) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid transaction amount",
        },
        {
          status: 400,
        }
      );
    }


    if (
      direction !== "income" &&
      direction !== "expense"
    ) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "direction must be income or expense",
        },
        {
          status: 400,
        }
      );
    }


    const allowedSources = [
      "bank",
      "card",
      "paynow",
      "paylah",
      "ocr",
      "manual",
    ];


    if (!allowedSources.includes(source)) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Invalid transaction source",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * Automatically synced transactions should have
     * a source reference so that duplicates can be detected.
     */
    const automaticSources = [
      "bank",
      "card",
      "paynow",
      "paylah",
    ];


    if (
      automaticSources.includes(source) &&
      !sourceReference
    ) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "sourceReference is required for automatically synced transactions",
        },
        {
          status: 400,
        }
      );
    }


    /*
     * --------------------------------------------------------
     * VERIFY HOUSEHOLD ACCESS
     * --------------------------------------------------------
     */

    const membership =
      await getMembership(
        user.id,
        householdId
      );


    if (!membership) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "You do not have access to this household",
        },
        {
          status: 403,
        }
      );
    }


    /*
     * Dependants cannot create transactions for another
     * household member.
     */
    if (
      membership.role === "dependent" &&
      memberId !== membership.id
    ) {
      return NextResponse.json(
        {
          status: "error",
          message:
            "Dependants can only create transactions for themselves",
        },
        {
          status: 403,
        }
      );
    }


    /*
     * --------------------------------------------------------
     * VERIFY ACCOUNT
     * --------------------------------------------------------
     */

    let account = null;


    if (accountId) {
      account =
        await getAccount({
          accountId,
          householdId,
          memberId,
        });


      if (!account) {
        return NextResponse.json(
          {
            status: "error",
            message:
              "Account does not belong to this household/member",
          },
          {
            status: 400,
          }
        );
      }
    }


    /*
     * --------------------------------------------------------
     * CATEGORISE TRANSACTION
     * --------------------------------------------------------
     *
     * If the frontend explicitly supplies a category,
     * respect it.
     *
     * Otherwise:
     *
     * 1. Financial rules
     * 2. Google Maps merchant recognition
     * 3. Transaction rules
     * 4. Uncategorised fallback
     */

    let categorisation;


    if (category) {
      categorisation = {
        category,
        purpose:
          purpose || null,
        confidence: 1,
        method: "user_selected",
        merchant: null,
      };
    } else {
      categorisation =
        await categoriseTransaction({
          description,

          merchantName:
            merchantName ||
            description,

          merchantAddress,

          latitude,
          longitude,

          counterpartyName,

          direction,

          source,
        });
    }


    /*
     * --------------------------------------------------------
     * PREPARE DATABASE RECORD
     * --------------------------------------------------------
     */

    const merchant =
      categorisation.merchant;


    const transactionRecord = {
      household_id:
        householdId,

      member_id:
        memberId,

      account_id:
        accountId || null,

      recipient_member_id:
        recipientMemberId || null,

      transaction_date:
        body.transactionDate
          ? new Date(body.transactionDate).toISOString()
          : new Date().toISOString(),

      description,

      merchant_name:
        merchant?.name ||
        merchantName ||
        null,

      merchant_address:
        merchant?.address ||
        merchantAddress ||
        null,

      google_place_id:
        merchant?.placeId ||
        null,

      google_primary_type:
        merchant?.primaryType ||
        null,

      google_types:
        merchant?.types ||
        [],

      amount:
        numericAmount,

      direction,

      category:
        categorisation.category,

      purpose:
        categorisation.purpose ||
        purpose ||
        null,

      counterparty_name:
        counterpartyName ||
        null,

      source,

      source_reference:
        sourceReference ||
        null,

      sync_status:
        source === "ocr" ||
        source === "manual"
          ? "fallback"
          : "complete",

      fallback_source:
        fallbackSource ||
        (
          source === "ocr" ||
          source === "manual"
            ? source
            : null
        ),

      categorisation_confidence:
        categorisation.confidence,

      categorisation_method:
        categorisation.method,

      receipt_storage_path:
        receiptStoragePath ||
        null,

      raw_data:
        rawData ||
        null,
    };


    /*
     * --------------------------------------------------------
     * INSERT
     * --------------------------------------------------------
     */

    const {
      data: transaction,
      error: insertError,
    } = await supabaseAdmin
      .from("ledger_transactions")
      .insert(transactionRecord)
      .select()
      .single();


    /*
     * Duplicate automatically synced transaction.
     */
    if (
      insertError &&
      insertError.code === "23505"
    ) {
      return NextResponse.json(
        {
          status: "duplicate",

          message:
            "This transaction has already been recorded",

          sourceReference,
        },
        {
          status: 200,
        }
      );
    }


    if (insertError) {
      throw new Error(
        insertError.message
      );
    }


    /*
     * --------------------------------------------------------
     * RETURN RESULT
     * --------------------------------------------------------
     */

    return NextResponse.json(
      {
        status: "success",

        transaction,

        categorisation: {
          category:
            categorisation.category,

          purpose:
            categorisation.purpose,

          confidence:
            categorisation.confidence,

          method:
            categorisation.method,
        },

        merchant:
          merchant || null,

        fallback:
          source === "ocr" ||
          source === "manual",
      },
      {
        status: 201,
      }
    );


  } catch (error) {
    console.error(
      "POST /api/ledger error:",
      error
    );

    return NextResponse.json(
      {
        status: "error",

        message:
          error.message ||
          "Failed to create transaction",
      },
      {
        status: 500,
      }
    );
  }
}