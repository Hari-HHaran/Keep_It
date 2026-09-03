/*
 * ============================================================
 * KEEPIT GIG INCOME CALCULATOR
 * ============================================================
 *
 * Gross payout
 *      ↓
 * FEDA deduction
 *      ↓
 * Net earnings after FEDA
 *      ↓
 * CPF deduction
 *      ↓
 * Available cash
 *
 * FEDA:
 *
 * Car / Van / Lorry              60%
 * Motorcycle / PMD               35%
 * Bicycle / Walking / Public     20%
 * ============================================================
 */


export const FEDA_RATES = {
    car_van_lorry: 0.60,
    motorcycle_pmd: 0.35,
    bicycle_walking_public: 0.20,
};


function roundMoney(value) {
    return Math.round(value * 100) / 100;
}


/*
 * Calculate income for ONE payout.
 */
export function calculateGigPayout(
    grossPayout,
    vehicleType,
    cpfRate
) {
    const gross = Number(grossPayout);
    const cpf = Number(cpfRate);

    if (!Number.isFinite(gross) || gross < 0) {
        throw new Error("Invalid gross payout.");
    }

    if (!FEDA_RATES[vehicleType]) {
        throw new Error("Invalid vehicle type.");
    }

    if (!Number.isFinite(cpf) || cpf < 0 || cpf > 1) {
        throw new Error("Invalid CPF rate.");
    }

    const fedaRate = FEDA_RATES[vehicleType];

    const fedaDeduction = gross * fedaRate;

    const netAfterFeda = gross - fedaDeduction;

    const cpfDeduction = netAfterFeda * cpf;

    const takeHomeCash = netAfterFeda - cpfDeduction;

    return {
        grossPayout: roundMoney(gross),

        fedaRate,

        fedaDeduction:
            roundMoney(fedaDeduction),

        netAfterFeda:
            roundMoney(netAfterFeda),

        cpfRate: cpf,

        cpfDeduction:
            roundMoney(cpfDeduction),

        takeHomeCash:
            roundMoney(takeHomeCash),
    };
}


/*
 * Calculate every payout in the worker's history.
 */
export function calculatePayoutHistory(
    payouts,
    vehicleType,
    cpfRate
) {
    return payouts.map((payout) => {
        const calculation = calculateGigPayout(
            payout.gross_payout,
            vehicleType,
            cpfRate
        );

        return {
            ...payout,
            ...calculation,
        };
    });
}


/*
 * ============================================================
 * ROLLING INCOME
 * ============================================================
 *
 * We use actual payout history from Supabase.
 *
 * The proposal calls for analysing 3–6 months of history.
 * ============================================================
 */

export function calculateRollingIncome(
    calculatedPayouts
) {
    if (!calculatedPayouts.length) {
        return {
            averageWeeklyGross: 0,
            averageWeeklyTakeHome: 0,
            totalGross: 0,
            totalTakeHome: 0,
            weeksCovered: 0,
        };
    }


    const totalGross =
        calculatedPayouts.reduce(
            (sum, payout) =>
                sum + Number(
                    payout.grossPayout || 0
                ),
            0
        );


    const totalTakeHome =
        calculatedPayouts.reduce(
            (sum, payout) =>
                sum + Number(
                    payout.takeHomeCash || 0
                ),
            0
        );


    const dates =
        calculatedPayouts
            .map((payout) =>
                new Date(payout.payout_date)
            )
            .filter((date) =>
                !Number.isNaN(date.getTime())
            );


    let weeksCovered = 1;


    if (dates.length > 1) {
        const earliest =
            Math.min(
                ...dates.map((date) =>
                    date.getTime()
                )
            );

        const latest =
            Math.max(
                ...dates.map((date) =>
                    date.getTime()
                )
            );


        const millisecondsPerWeek =
            7 * 24 * 60 * 60 * 1000;


        weeksCovered =
            Math.max(
                1,
                Math.ceil(
                    (latest - earliest) /
                    millisecondsPerWeek
                ) + 1
            );
    }


    return {
        averageWeeklyGross:
            roundMoney(
                totalGross / weeksCovered
            ),

        averageWeeklyTakeHome:
            roundMoney(
                totalTakeHome / weeksCovered
            ),

        totalGross:
            roundMoney(totalGross),

        totalTakeHome:
            roundMoney(totalTakeHome),

        weeksCovered,
    };
}


/*
 * ============================================================
 * SAFE WEEKLY PERSONAL SALARY
 * ============================================================
 *
 * We deliberately use the TAKE-HOME income rather than
 * gross bank inflow.
 *
 * The suggested salary is conservative so that good weeks
 * build a buffer instead of becoming normal spending.
 * ============================================================
 */

export function calculateSafeWeeklySalary(
    calculatedPayouts
) {
    const rolling =
        calculateRollingIncome(
            calculatedPayouts
        );


    if (
        rolling.averageWeeklyTakeHome <= 0
    ) {
        return {
            suggestedWeeklySalary: 0,

            averageWeeklyTakeHome: 0,

            latestWeekTakeHome: 0,

            surplusFromLatestWeek: 0,

            bufferRecommendation: 0,

            weeksCovered:
                rolling.weeksCovered,
        };
    }


    /*
     * Conservative 72% of rolling take-home.
     *
     * This keeps part of good weeks available for
     * lean weeks and resilience.
     */
    const suggested =
        rolling.averageWeeklyTakeHome *
        0.72;


    const suggestedWeeklySalary =
        Math.round(
            suggested / 10
        ) * 10;


    /*
     * Work out the latest week's take-home.
     */
    const latestDate =
        calculatedPayouts.reduce(
            (latest, payout) => {
                const date =
                    new Date(
                        payout.payout_date
                    );

                if (!latest) {
                    return date;
                }

                return date > latest
                    ? date
                    : latest;
            },
            null
        );


    let latestWeekTakeHome = 0;


    if (latestDate) {
        const latestWeekStart =
            new Date(latestDate);

        latestWeekStart.setDate(
            latestWeekStart.getDate() - 6
        );


        latestWeekTakeHome =
            calculatedPayouts
                .filter((payout) => {
                    const date =
                        new Date(
                            payout.payout_date
                        );

                    return (
                        date >= latestWeekStart &&
                        date <= latestDate
                    );
                })
                .reduce(
                    (sum, payout) =>
                        sum +
                        Number(
                            payout.takeHomeCash ||
                            0
                        ),
                    0
                );
    }


    const surplusFromLatestWeek =
        Math.max(
            0,
            latestWeekTakeHome -
            suggestedWeeklySalary
        );


    return {
        suggestedWeeklySalary,

        averageWeeklyTakeHome:
            rolling.averageWeeklyTakeHome,

        latestWeekTakeHome:
            roundMoney(
                latestWeekTakeHome
            ),

        surplusFromLatestWeek:
            roundMoney(
                surplusFromLatestWeek
            ),

        bufferRecommendation:
            roundMoney(
                surplusFromLatestWeek
            ),

        weeksCovered:
            rolling.weeksCovered,
    };
}