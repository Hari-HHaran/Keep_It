import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const supabase =
      await createSupabaseServerClient();

    /*
     * --------------------------------------------------
     * 1. Identify the authenticated user
     * --------------------------------------------------
     */

    const {
      data: {
        user,
      },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error:
            "You must be authenticated before creating a household.",
        },
        { status: 401 },
      );
    }

    /*
     * --------------------------------------------------
     * 2. Read manager information
     * --------------------------------------------------
     */

    const manager =
      body.managerProfile;

    if (!manager) {
      return NextResponse.json(
        {
          error:
            "Manager profile is required.",
        },
        { status: 400 },
      );
    }

    /*
     * --------------------------------------------------
     * 3. Create profile
     * --------------------------------------------------
     */

    const {
      error: profileError,
    } = await supabase
      .from("profiles")
      .insert({
        id: user.id,

        full_name:
          manager.fullName,

        phone_number:
          manager.phoneNumber,

        email:
          manager.email ??
          user.email ??
          null,

        age:
          manager.age,

        citizenship:
          manager.citizenship,

        employment_type:
          manager.employmentType ??
          null,

        is_platform_worker:
          manager.isPlatformWorker ??
          false,
      });

    if (profileError) {
      throw new Error(
        `Profile creation failed: ${profileError.message}`,
      );
    }

    /*
     * --------------------------------------------------
     * 4. Create household
     * --------------------------------------------------
     */

    const {
      data: household,
      error: householdError,
    } = await supabase
      .from("households")
      .insert({
        name:
          body.householdName ??
          `${manager.fullName}'s Household`,

        created_by:
          user.id,
      })
      .select()
      .single();

    if (householdError || !household) {
      throw new Error(
        householdError?.message ??
          "Household creation failed.",
      );
    }

    /*
     * --------------------------------------------------
     * 5. Create manager member
     * --------------------------------------------------
     */

    const {
      data: managerMember,
      error: memberError,
    } = await supabase
      .from("household_members")
      .insert({
        household_id:
          household.id,

        user_id:
          user.id,

        full_name:
          manager.fullName,

        role:
          "manager",

        phone_number:
          manager.phoneNumber,

        email:
          manager.email ??
          user.email ??
          null,

        age:
          manager.age,

        citizenship:
          manager.citizenship,

        employment_type:
          manager.employmentType ??
          null,

        is_platform_worker:
          manager.isPlatformWorker ??
          false,
      })
      .select()
      .single();

    if (memberError || !managerMember) {
      throw new Error(
        memberError?.message ??
          "Manager member creation failed.",
      );
    }

    /*
     * --------------------------------------------------
     * 6. Create manager bank accounts
     * --------------------------------------------------
     */

    if (
      Array.isArray(body.accounts) &&
      body.accounts.length > 0
    ) {
      const accounts =
        body.accounts.map(
          (account) => ({
            household_id:
              household.id,

            member_id:
              managerMember.id,

            bank_name:
              account.bankName,

            account_number:
              account.accountNumber,

            account_type:
              account.accountType ??
              "savings",

            balance:
              Number(account.balance) || 0,

            last_synced_at:
              new Date().toISOString(),
          }),
        );

      const {
        error: accountError,
      } = await supabase
        .from("bank_accounts")
        .insert(accounts);

      if (accountError) {
        throw new Error(
          `Account creation failed: ${accountError.message}`,
        );
      }
    }

    /*
     * --------------------------------------------------
     * 7. Create manager savings goal
     * --------------------------------------------------
     */

    if (
      body.managerSavingsGoal
    ) {
      const goal =
        body.managerSavingsGoal;

      const {
        error: goalError,
      } = await supabase
        .from("savings_goals")
        .insert({
          household_id:
            household.id,

          member_id:
            managerMember.id,

          title:
            goal.title,

          target_amount:
            Number(goal.targetAmount),

          current_amount:
            Number(
              goal.currentAmount ?? 0,
            ),

          category_name:
            goal.categoryName ??
            null,

          category_icon:
            goal.categoryIcon ??
            null,

          item_url_or_photo:
            goal.itemUrlOrPhoto ??
            null,

          notes:
            goal.notes ??
            null,

          is_completed:
            Number(
              goal.currentAmount ?? 0,
            ) >=
            Number(
              goal.targetAmount,
            ),
        });

      if (goalError) {
        throw new Error(
          `Savings goal creation failed: ${goalError.message}`,
        );
      }
    }

    /*
     * --------------------------------------------------
     * 8. Create dependants
     * --------------------------------------------------
     */

    if (
      Array.isArray(body.dependents)
    ) {
      for (
        const dependent of body.dependents
      ) {
        const {
          data:
            dependentMember,
          error:
            dependentError,
        } = await supabase
          .from("household_members")
          .insert({
            household_id:
              household.id,

            user_id:
              null,

            full_name:
              dependent.name,

            role:
              "dependent",

            phone_number:
              dependent.phoneNumber ??
              null,

            email:
              dependent.email ??
              null,

            age:
              dependent.age ??
              null,

            citizenship:
              dependent.citizenship ??
              null,

            employment_type:
              dependent.workerType ??
              null,

            is_platform_worker:
              dependent.isPlatformWorker ??
              false,

            personal_balance:
              Number(
                dependent.personalBalance ??
                  0,
              ),
          })
          .select()
          .single();

        if (
          dependentError ||
          !dependentMember
        ) {
          throw new Error(
            dependentError?.message ??
              "Dependent creation failed.",
          );
        }

        /*
         * ------------------------------------------------
         * Dependent account
         * ------------------------------------------------
         */

        if (
          dependent.account
        ) {
          const {
            error:
              accountError,
          } = await supabase
            .from("bank_accounts")
            .insert({
              household_id:
                household.id,

              member_id:
                dependentMember.id,

              bank_name:
                dependent.account.bankName,

              account_number:
                dependent.account.accountNumber,

              account_type:
                dependent.account.accountType ??
                "savings",

              balance:
                Number(
                  dependent.account.balance ??
                    0,
                ),

              last_synced_at:
                new Date().toISOString(),
            });

          if (accountError) {
            throw new Error(
              `Dependent account creation failed: ${accountError.message}`,
            );
          }
        }

        /*
         * ------------------------------------------------
         * Dependent savings goal
         * ------------------------------------------------
         */

        if (
          dependent.savingsGoal
        ) {
          const goal =
            dependent.savingsGoal;

          const {
            error:
              goalError,
          } = await supabase
            .from("savings_goals")
            .insert({
              household_id:
                household.id,

              member_id:
                dependentMember.id,

              title:
                goal.title,

              target_amount:
                Number(
                  goal.targetAmount,
                ),

              current_amount:
                Number(
                  goal.currentAmount ??
                    0,
                ),

              category_name:
                goal.categoryName ??
                null,

              category_icon:
                goal.categoryIcon ??
                null,

              notes:
                goal.notes ??
                null,

              is_completed:
                Number(
                  goal.currentAmount ??
                    0,
                ) >=
                Number(
                  goal.targetAmount,
                ),
            });

          if (goalError) {
            throw new Error(
              `Dependent savings goal creation failed: ${goalError.message}`,
            );
          }
        }
      }
    }

    /*
     * --------------------------------------------------
     * 9. Return household ID
     * --------------------------------------------------
     */

    return NextResponse.json({
      success: true,

      householdId:
        household.id,

      managerMemberId:
        managerMember.id,
    });
  } catch (error) {
    console.error(
      "Onboarding error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Registration failed.",
      },
      { status: 500 },
    );
  }
}