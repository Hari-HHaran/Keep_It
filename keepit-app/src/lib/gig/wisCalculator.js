/*
 * ============================================================
 * KEEPIT WIS / PCTS CALCULATOR
 * ============================================================
 *
 * IMPORTANT:
 * This produces an ESTIMATE / POTENTIAL ELIGIBILITY result.
 *
 * Final government eligibility is determined by the relevant
 * government agencies and may depend on additional criteria.
 *
 * ============================================================
 */


/*
 * Maximum annual WIS amounts from the project proposal:
 *
 * 30–34       $1,633
 * 35–44       $2,333
 * 45–59       $2,800
 * 60+         $3,267
 *
 * Split:
 *
 * 10% Cash
 * 90% MediSave
 */

const WIS_BANDS = [
    {
        minAge: 30,
        maxAge: 34,
        annualMaximum: 1633,
        label: "30–34",
    },

    {
        minAge: 35,
        maxAge: 44,
        annualMaximum: 2333,
        label: "35–44",
    },

    {
        minAge: 45,
        maxAge: 59,
        annualMaximum: 2800,
        label: "45–59",
    },

    {
        minAge: 60,
        maxAge: Infinity,
        annualMaximum: 3267,
        label: "60+",
    },
];


function roundMoney(value) {
    return Math.round(value * 100) / 100;
}


export function calculateWisEligibility({
    age,
    citizenship,
    isPlatformWorker,
    monthlyIncome,
}) {
    const numericAge =
        Number(age);

    const numericIncome =
        Number(monthlyIncome);


    /*
     * We only flag WIS for platform workers.
     */
    if (!isPlatformWorker) {
        return {
            scheme: "WIS",
            status: "not_applicable",
            potentiallyEligible: false,
            reason:
                "User is not classified as a platform worker.",
        };
    }


    /*
     * WIS requires Singapore citizenship.
     *
     * We don't mark PR users as eligible.
     */
    if (citizenship !== "singaporean") {
        return {
            scheme: "WIS",
            status: "not_eligible",
            potentiallyEligible: false,
            reason:
                "WIS eligibility requires Singapore citizenship.",
        };
    }


    /*
     * The proposal's WIS age bands begin at 30.
     */
    if (numericAge < 30) {
        return {
            scheme: "WIS",
            status: "not_eligible",
            potentiallyEligible: false,

            ageBand:
                "Under 30",

            monthlyTotal: 0,
            monthlyCash: 0,
            monthlyMediSave: 0,
            annualTotal: 0,

            reason:
                "Worker is below the WIS age band used by this KeepIt estimate.",
        };
    }


    /*
     * Proposal uses a $3,000 monthly income threshold.
     */
    if (numericIncome > 3000) {
        return {
            scheme: "WIS",
            status: "not_eligible",
            potentiallyEligible: false,

            ageBand:
                "Income above threshold",

            monthlyTotal: 0,
            monthlyCash: 0,
            monthlyMediSave: 0,
            annualTotal: 0,

            reason:
                "Estimated monthly income exceeds the $3,000 threshold used by this prototype.",
        };
    }


    const band =
        WIS_BANDS.find(
            (item) =>
                numericAge >= item.minAge &&
                numericAge <= item.maxAge
        );


    if (!band) {
        return {
            scheme: "WIS",
            status: "not_eligible",
            potentiallyEligible: false,
            reason:
                "No matching WIS age band.",
        };
    }


    const annualTotal =
        band.annualMaximum;


    const monthlyTotal =
        annualTotal / 12;


    const monthlyCash =
        monthlyTotal * 0.10;


    const monthlyMediSave =
        monthlyTotal * 0.90;


    return {
        scheme: "WIS",

        status: "potentially_eligible",

        potentiallyEligible: true,

        ageBand:
            band.label,

        annualTotal:
            roundMoney(annualTotal),

        monthlyTotal:
            roundMoney(monthlyTotal),

        monthlyCash:
            roundMoney(monthlyCash),

        monthlyMediSave:
            roundMoney(monthlyMediSave),

        reason:
            "Worker matches the basic platform-worker, citizenship, age and income checks used by this prototype.",
    };
}


/*
 * ============================================================
 * PCTS
 * ============================================================
 *
 * The proposal identifies PCTS as support for lower-income
 * platform workers during the transition to higher CPF
 * contributions.
 *
 * For the prototype we return POTENTIAL eligibility,
 * not a final government determination.
 * ============================================================
 */

export function calculatePctsEligibility({
    citizenship,
    isPlatformWorker,
    monthlyIncome,
}) {
    const numericIncome =
        Number(monthlyIncome);


    if (!isPlatformWorker) {
        return {
            scheme: "PCTS",
            status: "not_applicable",
            potentiallyEligible: false,
            reason:
                "User is not classified as a platform worker.",
        };
    }


    if (citizenship !== "singaporean") {
        return {
            scheme: "PCTS",
            status: "not_eligible",
            potentiallyEligible: false,
            reason:
                "This prototype only flags PCTS for Singapore citizen platform workers.",
        };
    }


    /*
     * The proposal describes the relevant income range
     * as approximately $2,500–$3,000/month.
     */
    if (numericIncome > 3000) {
        return {
            scheme: "PCTS",
            status: "not_eligible",
            potentiallyEligible: false,
            reason:
                "Estimated monthly income is above the prototype's PCTS income range.",
        };
    }


    return {
        scheme: "PCTS",

        status: "potentially_eligible",

        potentiallyEligible: true,

        offsetRate: 0.75,

        estimatedMonthlyIncome:
            roundMoney(numericIncome),

        reason:
            "Worker matches the basic platform-worker and income conditions used by this prototype. Final eligibility is determined automatically by the relevant government system.",
    };
}