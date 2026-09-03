import { NextResponse } from "next/server";

import {
    createSupabaseServerClient,
} from "@/lib/supabase/server";

import {
    supabaseAdmin,
} from "@/lib/supabase/admin";

import {
    calculatePayoutHistory,
    calculateSafeWeeklySalary,
} from "@/lib/gig/gigCalculator";

import {
    calculateWisEligibility,
    calculatePctsEligibility,
} from "@/lib/gig/wisCalculator";


/*
 * ============================================================
 * HELPER
 * ============================================================
 */

async function getHouseholdMembership(
    userId,
    householdId
) {
    const {
        data,
        error,
    } = await supabaseAdmin
        .from("household_members")
        .select(`
            id,
            household_id,
            user_id,
            full_name,
            role,
            age,
            citizenship,
            employment_type,
            is_platform_worker
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
 * ============================================================
 * GET
 *
 * GET /api/gig?householdId=...
 *
 * Returns REAL gig data from Supabase.
 * ============================================================
 */

export async function GET(request) {
    try {
        /*
         * Authenticate the user.
         */
        const supabase =
            await createSupabaseServerClient();


        const {
            data: {
                user,
            },
            error: authError,
        } =
            await supabase.auth.getUser();


        if (authError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Not authenticated.",
                },
                {
                    status: 401,
                }
            );
        }


        const {
            searchParams,
        } = new URL(request.url);


        const householdId =
            searchParams.get(
                "householdId"
            );


        if (!householdId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "householdId is required.",
                },
                {
                    status: 400,
                }
            );
        }


        /*
         * Make sure this user belongs to the household.
         */
        const membership =
            await getHouseholdMembership(
                user.id,
                householdId
            );


        if (!membership) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "You do not have access to this household.",
                },
                {
                    status: 403,
                }
            );
        }


        /*
         * This feature is specifically for the manager.
         */
        if (
            membership.role !== "manager" &&
            membership.role !== "co_manager"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Gig resilience is only available to managers.",
                },
                {
                    status: 403,
                }
            );
        }


        /*
         * Check whether the manager is actually classified
         * as a platform worker.
         */
        if (
            !membership.is_platform_worker
        ) {
            return NextResponse.json({
                success: true,

                platformWorker: false,

                message:
                    "Manager is not classified as a platform worker.",

                gig: null,

                wis: null,

                pcts: null,
            });
        }


        /*
         * ----------------------------------------------------
         * GET GIG PROFILE
         * ----------------------------------------------------
         */

        const {
            data: gigProfile,
            error: gigProfileError,
        } =
            await supabaseAdmin
                .from("gig_profiles")
                .select("*")
                .eq(
                    "household_id",
                    householdId
                )
                .eq(
                    "member_id",
                    membership.id
                )
                .maybeSingle();


        if (gigProfileError) {
            throw new Error(
                gigProfileError.message
            );
        }


        /*
         * If the worker has not configured their gig
         * profile yet, tell the frontend to do so.
         */
        if (!gigProfile) {
            return NextResponse.json({
                success: true,

                platformWorker: true,

                setupRequired: true,

                message:
                    "Gig worker profile has not been configured yet.",

                wis: null,

                pcts: null,

                gig: null,
            });
        }


        /*
         * ----------------------------------------------------
         * GET REAL PAYOUT HISTORY
         * ----------------------------------------------------
         *
         * Six months of actual payout records.
         */

        const sixMonthsAgo =
            new Date();

        sixMonthsAgo.setMonth(
            sixMonthsAgo.getMonth() - 6
        );


        const {
            data: payouts,
            error: payoutsError,
        } =
            await supabaseAdmin
                .from("gig_payouts")
                .select(`
                    id,
                    household_id,
                    member_id,
                    platform_name,
                    gross_payout,
                    payout_date,
                    source,
                    source_reference,
                    created_at
                `)
                .eq(
                    "household_id",
                    householdId
                )
                .eq(
                    "member_id",
                    membership.id
                )
                .gte(
                    "payout_date",
                    sixMonthsAgo
                        .toISOString()
                        .split("T")[0]
                )
                .order(
                    "payout_date",
                    {
                        ascending: true,
                    }
                );


        if (payoutsError) {
            throw new Error(
                payoutsError.message
            );
        }


        /*
         * ----------------------------------------------------
         * CALCULATE EVERY PAYOUT
         * ----------------------------------------------------
         */

        const calculatedPayouts =
            calculatePayoutHistory(
                payouts || [],
                gigProfile.vehicle_type,
                gigProfile.cpf_rate
            );


        /*
         * ----------------------------------------------------
         * ROLLING SAFE SALARY
         * ----------------------------------------------------
         */

        const smoothing =
            calculateSafeWeeklySalary(
                calculatedPayouts
            );


        /*
         * ----------------------------------------------------
         * MONTHLY TAKE-HOME INCOME
         *
         * Used for WIS/PCTS estimation.
         * ----------------------------------------------------
         */

        const totalTakeHome =
            calculatedPayouts.reduce(
                (sum, payout) =>
                    sum +
                    Number(
                        payout.takeHomeCash || 0
                    ),
                0
            );


        /*
         * Six months → approximate monthly average.
         */
        const monthlyTakeHome =
            calculatedPayouts.length
                ? totalTakeHome / 6
                : 0;


        /*
         * ----------------------------------------------------
         * WIS
         * ----------------------------------------------------
         */

        const wis =
            calculateWisEligibility({
                age:
                    membership.age,

                citizenship:
                    membership.citizenship,

                isPlatformWorker:
                    membership.is_platform_worker,

                monthlyIncome:
                    monthlyTakeHome,
            });


        /*
         * ----------------------------------------------------
         * PCTS
         * ----------------------------------------------------
         */

        const pcts =
            calculatePctsEligibility({
                citizenship:
                    membership.citizenship,

                isPlatformWorker:
                    membership.is_platform_worker,

                monthlyIncome:
                    monthlyTakeHome,
            });


        /*
         * ----------------------------------------------------
         * RETURN EVERYTHING
         * ----------------------------------------------------
         */

        return NextResponse.json({
            success: true,

            platformWorker: true,

            setupRequired: false,

            worker: {
                memberId:
                    membership.id,

                name:
                    membership.full_name,

                age:
                    membership.age,

                citizenship:
                    membership.citizenship,

                vehicleType:
                    gigProfile.vehicle_type,

                cpfRate:
                    gigProfile.cpf_rate,
            },

            income: {
                payoutCount:
                    calculatedPayouts.length,

                sixMonthGross:
                    calculatedPayouts.reduce(
                        (sum, payout) =>
                            sum +
                            Number(
                                payout.grossPayout ||
                                0
                            ),
                        0
                    ),

                sixMonthTakeHome:
                    totalTakeHome,

                estimatedMonthlyTakeHome:
                    Math.round(
                        monthlyTakeHome * 100
                    ) / 100,
            },

            payouts:
                calculatedPayouts,

            smoothing,

            buffer: {
                current:
                    Number(
                        gigProfile.buffer_balance ||
                        0
                    ),

                recommendedAddition:
                    smoothing.bufferRecommendation,
            },

            wis,

            pcts,
        });


    } catch (error) {
        console.error(
            "GET /api/gig error:",
            error
        );


        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to calculate gig statistics.",
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
 * Two operations:
 *
 * 1. setup
 *    Creates/updates the gig worker profile.
 *
 * 2. payout
 *    Records a real gig payout into Supabase.
 *
 * The calculations are then based on the database history.
 * ============================================================
 */

export async function POST(request) {
    try {
        /*
         * Authenticate.
         */
        const supabase =
            await createSupabaseServerClient();


        const {
            data: {
                user,
            },
            error: authError,
        } =
            await supabase.auth.getUser();


        if (authError || !user) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Not authenticated.",
                },
                {
                    status: 401,
                }
            );
        }


        const body =
            await request.json();


        const householdId =
            body.householdId;


        if (!householdId) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "householdId is required.",
                },
                {
                    status: 400,
                }
            );
        }


        /*
         * Verify household membership.
         */
        const membership =
            await getHouseholdMembership(
                user.id,
                householdId
            );


        if (!membership) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "You do not have access to this household.",
                },
                {
                    status: 403,
                }
            );
        }


        if (
            membership.role !== "manager" &&
            membership.role !== "co_manager"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error:
                        "Only managers can manage gig income data.",
                },
                {
                    status: 403,
                }
            );
        }


        const operation =
            body.operation;


        /*
         * ====================================================
         * OPERATION 1 — SETUP
         * ====================================================
         */

        if (operation === "setup") {
            const vehicleType =
                body.vehicleType;


            const allowedVehicles = [
                "car_van_lorry",
                "motorcycle_pmd",
                "bicycle_walking_public",
            ];


            if (
                !allowedVehicles.includes(
                    vehicleType
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Invalid vehicle type.",
                    },
                    {
                        status: 400,
                    }
                );
            }


            /*
             * If supplied, use the worker's actual CPF
             * contribution rate.
             *
             * Otherwise use the current prototype
             * configuration already used by the project.
             */
            const cpfRate =
                body.cpfRate !== undefined
                    ? Number(body.cpfRate)
                    : 0.13;


            if (
                !Number.isFinite(cpfRate) ||
                cpfRate < 0 ||
                cpfRate > 1
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Invalid CPF rate.",
                    },
                    {
                        status: 400
                    }
                );
            }


            const {
                data,
                error,
            } =
                await supabaseAdmin
                    .from("gig_profiles")
                    .upsert(
                        {
                            household_id:
                                householdId,

                            member_id:
                                membership.id,

                            vehicle_type:
                                vehicleType,

                            cpf_rate:
                                cpfRate,
                        },
                        {
                            onConflict:
                                "household_id,member_id",
                        }
                    )
                    .select()
                    .single();


            if (error) {
                throw new Error(
                    error.message
                );
            }


            return NextResponse.json({
                success: true,

                operation: "setup",

                gigProfile: data,

                message:
                    "Gig worker profile saved successfully.",
            });
        }


        /*
         * ====================================================
         * OPERATION 2 — ADD PAYOUT
         * ====================================================
         */

        if (operation === "payout") {
            const platformName =
                typeof body.platformName === "string"
                    ? body.platformName.trim()
                    : "";


            const grossPayout =
                Number(
                    body.grossPayout
                );


            const payoutDate =
                body.payoutDate;


            const source =
                body.source ||
                "manual";


            const sourceReference =
                body.sourceReference ||
                null;


            if (!platformName) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "platformName is required.",
                    },
                    {
                        status: 400,
                    }
                );
            }


            if (
                !Number.isFinite(
                    grossPayout
                ) ||
                grossPayout < 0
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Invalid gross payout.",
                    },
                    {
                        status: 400,
                    }
                );
            }


            if (!payoutDate) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "payoutDate is required.",
                    },
                    {
                        status: 400,
                    }
                );
            }


            const allowedSources = [
                "bank",
                "paynow",
                "paylah",
                "manual",
            ];


            if (
                !allowedSources.includes(
                    source
                )
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Invalid payout source.",
                    },
                    {
                        status: 400,
                    }
                );
            }


            /*
             * Automatically synced payouts need a unique
             * provider reference.
             */
            if (
                (
                    source === "bank" ||
                    source === "paynow" ||
                    source === "paylah"
                ) &&
                !sourceReference
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "sourceReference is required for automatically synced payouts.",
                    },
                    {
                        status: 400,
                    }
                );
            }


            /*
             * Get gig profile.
             */
            const {
                data: gigProfile,
                error: profileError,
            } =
                await supabaseAdmin
                    .from("gig_profiles")
                    .select("*")
                    .eq(
                        "household_id",
                        householdId
                    )
                    .eq(
                        "member_id",
                        membership.id
                    )
                    .maybeSingle();


            if (profileError) {
                throw new Error(
                    profileError.message
                );
            }


            if (!gigProfile) {
                return NextResponse.json(
                    {
                        success: false,
                        error:
                            "Set up the gig worker profile before recording payouts.",
                    },
                    {
                        status: 400,
                    }
                );
            }


            /*
             * Calculate this payout immediately.
             */
            const fedaRate =
                gigProfile.vehicle_type ===
                "car_van_lorry"
                    ? 0.60
                    : gigProfile.vehicle_type ===
                      "motorcycle_pmd"
                        ? 0.35
                        : 0.20;


            const fedaDeduction =
                grossPayout *
                fedaRate;


            const netAfterFeda =
                grossPayout -
                fedaDeduction;


            const cpfDeduction =
                netAfterFeda *
                Number(
                    gigProfile.cpf_rate
                );


            const takeHomeCash =
                netAfterFeda -
                cpfDeduction;


            /*
             * Save the REAL payout.
             */
            const {
                data: payout,
                error: insertError,
            } =
                await supabaseAdmin
                    .from("gig_payouts")
                    .insert({
                        household_id:
                            householdId,

                        member_id:
                            membership.id,

                        platform_name:
                            platformName,

                        gross_payout:
                            grossPayout,

                        payout_date:
                            payoutDate,

                        source,

                        source_reference:
                            sourceReference,
                    })
                    .select()
                    .single();


            if (
                insertError &&
                insertError.code === "23505"
            ) {
                return NextResponse.json(
                    {
                        success: true,

                        duplicate: true,

                        message:
                            "This payout has already been recorded.",
                    }
                );
            }


            if (insertError) {
                throw new Error(
                    insertError.message
                );
            }


            /*
             * Update the buffer.
             *
             * We use the safe salary calculation after
             * retrieving the worker's complete history.
             */

            const {
                data: allPayouts,
                error: historyError,
            } =
                await supabaseAdmin
                    .from("gig_payouts")
                    .select("*")
                    .eq(
                        "household_id",
                        householdId
                    )
                    .eq(
                        "member_id",
                        membership.id
                    )
                    .order(
                        "payout_date",
                        {
                            ascending: true,
                        }
                    );


            if (historyError) {
                throw new Error(
                    historyError.message
                );
            }


            const calculatedHistory =
                calculatePayoutHistory(
                    allPayouts || [],
                    gigProfile.vehicle_type,
                    gigProfile.cpf_rate
                );


            const smoothing =
                calculateSafeWeeklySalary(
                    calculatedHistory
                );


            /*
             * Add the latest surplus to the buffer.
             */
            let updatedBuffer =
                Number(
                    gigProfile.buffer_balance ||
                    0
                );


            const surplus =
                Number(
                    smoothing.bufferRecommendation ||
                    0
                );


            if (surplus > 0) {
                updatedBuffer += surplus;
            }


            const {
                error: bufferError,
            } =
                await supabaseAdmin
                    .from("gig_profiles")
                    .update({
                        buffer_balance:
                            Math.round(
                                updatedBuffer *
                                100
                            ) / 100,
                    })
                    .eq(
                        "id",
                        gigProfile.id
                    );


            if (bufferError) {
                throw new Error(
                    bufferError.message
                );
            }


            return NextResponse.json(
                {
                    success: true,

                    operation: "payout",

                    payout,

                    calculation: {
                        grossPayout:
                            Math.round(
                                grossPayout *
                                100
                            ) / 100,

                        fedaRate,

                        fedaDeduction:
                            Math.round(
                                fedaDeduction *
                                100
                            ) / 100,

                        netAfterFeda:
                            Math.round(
                                netAfterFeda *
                                100
                            ) / 100,

                        cpfRate:
                            Number(
                                gigProfile.cpf_rate
                            ),

                        cpfDeduction:
                            Math.round(
                                cpfDeduction *
                                100
                            ) / 100,

                        takeHomeCash:
                            Math.round(
                                takeHomeCash *
                                100
                            ) / 100,
                    },

                    resilience: {
                        suggestedWeeklySalary:
                            smoothing
                                .suggestedWeeklySalary,

                        surplusAddedToBuffer:
                            surplus,

                        newBufferBalance:
                            Math.round(
                                updatedBuffer *
                                100
                            ) / 100,
                    },

                    message:
                        "Gig payout recorded and resilience calculation updated.",
                },
                {
                    status: 201,
                }
            );
        }


        /*
         * Unknown operation.
         */
        return NextResponse.json(
            {
                success: false,

                error:
                    "operation must be either 'setup' or 'payout'.",
            },
            {
                status: 400,
            }
        );


    } catch (error) {
        console.error(
            "POST /api/gig error:",
            error
        );


        return NextResponse.json(
            {
                success: false,

                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to process gig income.",
            },
            {
                status: 500,
            }
        );
    }
}