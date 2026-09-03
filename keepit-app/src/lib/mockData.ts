import {
  AppState,
  GovernmentVoucher,
  HouseholdMember,
  Transaction,
} from "./types";

/*
 * ========================================================
 * TAN FAMILY MEMBERS
 * ========================================================
 */

export const TAN_FAMILY_MEMBERS: HouseholdMember[] = [
  {
    id: "mem-meiling",
    name: "Mei Ling",
    role: "manager",
    avatarBg: "bg-emerald-600",
    avatarText: "ML",
  },
  {
    id: "mem-weihan",
    name: "Wei Han",
    role: "co_manager",
    avatarBg: "bg-blue-600",
    avatarText: "WH",
  },
  {
    id: "mem-jiale",
    name: "Jia Le",
    role: "dependent",
    age: 11,
    avatarBg: "bg-amber-600",
    avatarText: "JL",
    personalBalance: 57.5,

    savingsGoal: {
      id: "goal-jiale-game",
      title: "New Game",
      targetAmount: 60,
      currentAmount: 8,
      categoryIcon: "🎮",
      categoryName: "Gaming",
      notes: "A new game to play during the holidays",
      isCompleted: false,
    },

    wishlistGoals: [
      {
        id: "goal-jiale-basketball",
        title: "Wilson NCAA Basketball",
        targetAmount: 60,
        currentAmount: 0,
        categoryIcon: "🏀",
        categoryName: "Sports",
        notes: "For weekend games",
        isCompleted: false,
      },
      {
        id: "goal-jiale-shoes",
        title: "Nike Junior Running Shoes",
        targetAmount: 95,
        currentAmount: 0,
        categoryIcon: "👟",
        categoryName: "Sports",
        notes: "For track and PE class",
        isCompleted: false,
      },
    ],
  },
  {
    id: "mem-grandma",
    name: "Grandma Tan",
    role: "dependent",
    age: 72,
    avatarBg: "bg-purple-600",
    avatarText: "GT",
    personalBalance: 120,

    savingsGoal: {
      id: "goal-grandma-jade-bangle",
      title: "Jade Bangle",
      targetAmount: 120,
      currentAmount: 25,
      categoryIcon: "💚",
      categoryName: "Jewellery",
      notes: "A special jade bangle",
      isCompleted: false,
    },

    wishlistGoals: [
      {
        id: "goal-grandma-knitting-set",
        title: "Knitting Set",
        targetAmount: 45,
        currentAmount: 0,
        categoryIcon: "🧶",
        categoryName: "Hobbies",
        notes: "Knitting needles and colourful yarn",
        isCompleted: false,
      },
      {
        id: "goal-grandma-heated-blanket",
        title: "Heated Blanket",
        targetAmount: 80,
        currentAmount: 0,
        categoryIcon: "🛏️",
        categoryName: "Comfort",
        notes: "A warm and comfortable blanket",
        isCompleted: false,
      },
    ],
  },
];

/*
 * ========================================================
 * TAN FAMILY VOUCHERS
 * ========================================================
 */

export const TAN_FAMILY_VOUCHERS: GovernmentVoucher[] = [
  {
    id: "vouch-cdc-supermarket",
    name: "CDC Supermarket Vouchers",
    category: "CDC_Supermarket",
    totalGranted: 150,
    balance: 85,
    expiryDate: "31 Dec 2026",
    daysRemaining: 12,
    description:
      "Jan 2026 tranche for supermarket purchases.",
    acceptedMerchants: [
      "FairPrice",
      "Sheng Siong",
      "Giant",
      "Prime Supermarket",
    ],
    isExpiringSoon: true,
  },
  {
    id: "vouch-climate",
    name: "Climate Vouchers",
    category: "Climate",
    totalGranted: 300,
    balance: 310,
    expiryDate: "31 Dec 2027",
    daysRemaining: 485,
    description:
      "For eligible energy-efficient appliances and fittings.",
    acceptedMerchants: [
      "Courts",
      "Best Denki",
      "Gain City",
      "Harvey Norman",
    ],
    isExpiringSoon: false,
  },
  {
    id: "vouch-sg60",
    name: "SG60 Community Vouchers",
    category: "SG60",
    totalGranted: 300,
    balance: 217,
    expiryDate: "31 Dec 2026",
    daysRemaining: 120,
    description:
      "Vouchers for participating community merchants.",
    acceptedMerchants: [
      "Heartland Shops",
      "Community Clinics",
      "Neighbourhood Grocers",
    ],
    isExpiringSoon: false,
  },
];

/*
 * ========================================================
 * TAN FAMILY TRANSACTIONS
 * Includes different examples for Jia Le and Grandma.
 * ========================================================
 */

export const TAN_FAMILY_TRANSACTIONS: Transaction[] = [
  // Jia Le: pocket money received
  {
    id: "tx-jiale-pocket-money",
    date: "Today, 8:00 AM",
    description: "Pocket money from Mei Ling",
    amount: -10,
    category: "Pocket Money",
    source: "PayNow",
    recipientId: "mem-jiale",
    memberId: "mem-meiling",
  },

  // Jia Le: groceries
  {
    id: "tx-jiale-groceries",
    date: "Yesterday, 4:15 PM",
    description: "FairPrice snacks and juice",
    amount: -6.4,
    category: "Groceries",
    source: "Cash Receipt",
    memberId: "mem-jiale",
  },

  // Jia Le: hawker and dining
  {
    id: "tx-jiale-canteen",
    date: "Yesterday, 12:30 PM",
    description: "School canteen chicken rice",
    amount: -3.5,
    category: "Hawker & Dining",
    source: "Cash Receipt",
    memberId: "mem-jiale",
  },

  {
    id: "tx-jiale-bubble-tea",
    date: "2 days ago",
    description: "Bubble tea after school",
    amount: -4.2,
    category: "Hawker & Dining",
    source: "PayNow",
    memberId: "mem-jiale",
  },

  // Jia Le: transport
  {
    id: "tx-jiale-transport",
    date: "3 days ago",
    description: "SimplyGo bus fare",
    amount: -1.1,
    category: "Transport",
    source: "DBS",
    memberId: "mem-jiale",
  },

  // Jia Le: other
  {
    id: "tx-jiale-bookstore",
    date: "4 days ago",
    description: "School bookstore notebook",
    amount: -4.8,
    category: "Other",
    source: "Cash Receipt",
    memberId: "mem-jiale",
  },

  {
    id: "tx-jiale-birthday",
    date: "1 week ago",
    description: "Birthday money from Grandma",
    amount: 20,
    category: "Other",
    source: "Cash Receipt",
    memberId: "mem-jiale",
  },

  // Grandma: allowance received
  {
    id: "tx-grandma-allowance",
    date: "Today, 9:00 AM",
    description: "Household allowance from Mei Ling",
    amount: -30,
    category: "Pocket Money",
    source: "PayNow",
    recipientId: "mem-grandma",
    memberId: "mem-meiling",
  },

  // Grandma: groceries
  {
    id: "tx-grandma-sheng-siong",
    date: "Yesterday, 10:30 AM",
    description: "Sheng Siong groceries",
    amount: -28.6,
    category: "Groceries",
    source: "Cash Receipt",
    memberId: "mem-grandma",
  },

  {
    id: "tx-grandma-fairprice",
    date: "2 days ago",
    description: "FairPrice milk and fruit",
    amount: -12.4,
    category: "Groceries",
    source: "Cash Receipt",
    memberId: "mem-grandma",
  },

  // Grandma: hawker and dining
  {
    id: "tx-grandma-fish-soup",
    date: "3 days ago",
    description: "Fish soup at Bedok Hawker Centre",
    amount: -6.5,
    category: "Hawker & Dining",
    source: "Cash Receipt",
    memberId: "mem-grandma",
  },

  {
    id: "tx-grandma-kopi",
    date: "4 days ago",
    description: "Kopi and toast at the coffee shop",
    amount: -3.2,
    category: "Hawker & Dining",
    source: "Cash Receipt",
    memberId: "mem-grandma",
  },

  // Grandma: transport
  {
    id: "tx-grandma-transport",
    date: "5 days ago",
    description: "Senior concession card top-up",
    amount: -10,
    category: "Transport",
    source: "PayNow",
    memberId: "mem-grandma",
  },

  // Grandma: other
  {
    id: "tx-grandma-toiletries",
    date: "6 days ago",
    description: "Guardian toiletries",
    amount: -12.9,
    category: "Other",
    source: "PayNow",
    memberId: "mem-grandma",
  },

  {
    id: "tx-grandma-yarn",
    date: "1 week ago",
    description: "Yarn for knitting",
    amount: -8.5,
    category: "Other",
    source: "Cash Receipt",
    memberId: "mem-grandma",
  },

  // General manager transactions
  {
    id: "tx-household-fairprice",
    date: "Today, 11:30 AM",
    description: "FairPrice Supermarket (Tampines)",
    amount: -24.5,
    category: "Groceries",
    source: "Cash Receipt",
    memberId: "mem-meiling",
    opportunityCostNote:
      "CDC Supermarket vouchers could have covered this S$24.50 expense!",
  },

  {
    id: "tx-household-utilities",
    date: "2 days ago",
    description: "SP Group Utilities Bill",
    amount: -138.2,
    category: "Utilities",
    source: "DBS",
    memberId: "mem-weihan",
  },

  {
    id: "tx-household-hawker",
    date: "3 days ago",
    description: "Bedok 85 Hawker Dinner",
    amount: -16.8,
    category: "Hawker & Dining",
    source: "PayNow",
    memberId: "mem-meiling",
  },

  {
    id: "tx-household-salary",
    date: "4 days ago",
    description: "Salary Credit (Mei Ling)",
    amount: 2850,
    category: "Other",
    source: "DBS",
    memberId: "mem-meiling",
  },
];

/*
 * ========================================================
 * TAN FAMILY STATE
 * ========================================================
 */

export const INITIAL_APP_STATE: AppState = {
  currentPersonaId: "tan_family",
  householdName: "Tan Household",
  totalHouseholdBalance: 4285,
  thisMonthsSpend: 1940,
  members: TAN_FAMILY_MEMBERS,

  bankAccounts: [
    {
      id: "acc-dbs",
      bankName: "DBS Savings Plus",
      accountNumber: "•••-48291",
      accountType: "savings",
      balance: 3420,
      lastSynced: "Just now (Automated Sync)",
      icon: "Building2",
    },
    {
      id: "acc-ocbc",
      bankName: "OCBC 360 Account",
      accountNumber: "•••-91823",
      accountType: "current",
      balance: 865,
      lastSynced: "4 mins ago",
      icon: "Building2",
    },
    {
      id: "acc-paynow",
      bankName: "PayNow / PayLah! Linked Wallet",
      accountNumber: "+65 9123 4567",
      accountType: "wallet",
      balance: 240,
      lastSynced: "Real-time",
      icon: "Smartphone",
    },
  ],

  accounts: [
    {
      id: "acc-dbs",
      bankName: "DBS Savings Plus",
      accountNumber: "•••-48291",
      accountType: "savings",
      balance: 3420,
      lastSynced: "Just now (Automated Sync)",
      icon: "Building2",
    },
    {
      id: "acc-ocbc",
      bankName: "OCBC 360 Account",
      accountNumber: "•••-91823",
      accountType: "current",
      balance: 865,
      lastSynced: "4 mins ago",
      icon: "Building2",
    },
    {
      id: "acc-paynow",
      bankName: "PayNow / PayLah! Linked Wallet",
      accountNumber: "+65 9123 4567",
      accountType: "wallet",
      balance: 240,
      lastSynced: "Real-time",
      icon: "Smartphone",
    },
  ],

  transactions: TAN_FAMILY_TRANSACTIONS,
  vouchers: TAN_FAMILY_VOUCHERS,

  nudges: [
    {
      id: "nudge-init-1",
      type: "opportunity_cost",
      title:
        "Opportunity Cost Alert: Expiring CDC Vouchers",
      message:
        "You spent S$24.50 in cash at FairPrice, but you have S$85 in CDC vouchers expiring soon.",
      severity: "alert",
      actionText: "View Expiring Vouchers",
      actionUrl: "#vouchers",
      timestamp: "Today",
    },
  ],

  currentSimulatedLocation: {
    id: "loc-fairprice",
    name: "NTUC FairPrice (Tampines Mall)",
    locationName: "Tampines Central",
    acceptedVouchers: ["CDC_Supermarket"],
    distanceMeters: 85,
    discountNote:
      "Accepts CDC Supermarket Vouchers",
  },
};

/*
 * ========================================================
 * MARCUS — GIG WORKER
 * ========================================================
 */

export const MARCUS_GIG_STATE: AppState = {
  currentPersonaId: "marcus_gig",
  householdName: "Marcus (Platform Worker)",
  totalHouseholdBalance: 2170,
  thisMonthsSpend: 1120,

  members: [
    {
      id: "mem-marcus",
      name: "Marcus",
      role: "manager",
      age: 24,
      avatarBg: "bg-indigo-600",
      avatarText: "M",
      workerType: "platform_worker",
      vehicleType: "motorcycle_pmd",
    },
  ],

  bankAccounts: [
    {
      id: "acc-posb",
      bankName: "POSB eMySavings",
      accountNumber: "•••-19283",
      accountType: "savings",
      balance: 1850,
      lastSynced: "10 mins ago",
      icon: "Building2",
    },
    {
      id: "acc-paynow-m",
      bankName: "PayNow / GrabPay Wallet",
      accountNumber: "+65 8234 5678",
      accountType: "wallet",
      balance: 320,
      lastSynced: "Real-time",
      icon: "Smartphone",
    },
  ],

  accounts: [
    {
      id: "acc-posb",
      bankName: "POSB eMySavings",
      accountNumber: "•••-19283",
      accountType: "savings",
      balance: 1850,
      lastSynced: "10 mins ago",
      icon: "Building2",
    },
    {
      id: "acc-paynow-m",
      bankName: "PayNow / GrabPay Wallet",
      accountNumber: "+65 8234 5678",
      accountType: "wallet",
      balance: 320,
      lastSynced: "Real-time",
      icon: "Smartphone",
    },
  ],

  gigProfile: {
    workerType: "platform_worker",
    platformName: "Lalamove & GrabFood",
    vehicleType: "motorcycle_pmd",
    fedaPercentage: 35,
    grossWeeklyAverage: 820,
    safeWeeklySalary: 540,
    bufferSaved: 310,
    monthlyWisEligible: true,
    wisMonthlyAmount: 180,
    wisCashSplit: 18,
    wisMedisaveSplit: 162,

    wisPayoutStatus: [
      {
        month: "Jan 2026",
        status: "received",
        amount: 180,
      },
      {
        month: "Feb 2026",
        status: "received",
        amount: 180,
      },
      {
        month: "Mar 2026",
        status: "expected",
        amount: 180,
      },
      {
        month: "Apr 2026",
        status: "pending",
        amount: 180,
      },
    ],
  },

  transactions: [
    {
      id: "tx-m1",
      date: "Today, 2:00 PM",
      description: "Lalamove Weekly Payout",
      amount: 890,
      category: "Gig Payout",
      source: "PayNow",
      memberId: "mem-marcus",
      isGigIncome: true,
    },
    {
      id: "tx-m2",
      date: "Yesterday",
      description: "Esso Motorcycle Refuel",
      amount: -22,
      category: "Transport",
      source: "PayNow",
      memberId: "mem-marcus",
    },
    {
      id: "tx-m3",
      date: "3 days ago",
      description: "Kopitiam Chicken Rice",
      amount: -6.5,
      category: "Hawker & Dining",
      source: "Cash Receipt",
      memberId: "mem-marcus",
    },
  ],

  vouchers: [
    {
      id: "vouch-wis-monthly",
      name: "Workfare Income Supplement",
      category: "Workfare_WIS",
      totalGranted: 2160,
      balance: 180,
      expiryDate: "Monthly Payout",
      daysRemaining: 18,
      description:
        "S$18 cash and S$162 MediSave.",
      acceptedMerchants: ["Direct Bank Deposit"],
      isExpiringSoon: false,
    },
    {
      id: "vouch-marcus-cdc",
      name: "CDC Vouchers",
      category: "CDC_Supermarket",
      totalGranted: 300,
      balance: 120,
      expiryDate: "31 Dec 2026",
      daysRemaining: 120,
      description: "CDC Supermarket vouchers.",
      acceptedMerchants: [
        "FairPrice",
        "Sheng Siong",
      ],
      isExpiringSoon: false,
    },
  ],

  nudges: [
    {
      id: "nudge-m-1",
      type: "gig_buffer",
      title: "Weekly Income Smoothed",
      message:
        "Your surplus was added to your lean-week buffer.",
      severity: "info",
      timestamp: "Today",
    },
  ],

  currentSimulatedLocation: null,
};

/*
 * ========================================================
 * JIA LE — DEPENDENT PERSONA
 * ========================================================
 */

export const JIA_LE_STATE: AppState = {
  currentPersonaId: "jia_le",
  householdName: "Jia Le's Pocket Ledger",
  totalHouseholdBalance: 57.5,
  thisMonthsSpend: 20,

  members: [
    {
      id: "mem-jiale",
      name: "Jia Le",
      role: "dependent",
      age: 11,
      avatarBg: "bg-amber-600",
      avatarText: "JL",
      personalBalance: 57.5,

      savingsGoal: {
        id: "goal-jiale-game",
        title: "New Game",
        targetAmount: 60,
        currentAmount: 8,
        categoryIcon: "🎮",
        categoryName: "Gaming",
        notes:
          "A new game to play during the holidays",
        isCompleted: false,
      },

      wishlistGoals: [
        {
          id: "goal-jiale-basketball",
          title: "Wilson NCAA Basketball",
          targetAmount: 60,
          currentAmount: 0,
          categoryIcon: "🏀",
          categoryName: "Sports",
          notes: "For weekend games",
          isCompleted: false,
        },
        {
          id: "goal-jiale-shoes",
          title: "Nike Junior Running Shoes",
          targetAmount: 95,
          currentAmount: 0,
          categoryIcon: "👟",
          categoryName: "Sports",
          notes: "For track and PE class",
          isCompleted: false,
        },
      ],
    },
  ],

  bankAccounts: [
    {
      id: "acc-smart-buddy",
      bankName: "My Pocket Money",
      accountNumber: "JL-8291",
      accountType: "wallet",
      balance: 57.5,
      lastSynced: "Real-time",
      icon: "CreditCard",
    },
  ],

  accounts: [
    {
      id: "acc-smart-buddy",
      bankName: "My Pocket Money",
      accountNumber: "JL-8291",
      accountType: "wallet",
      balance: 57.5,
      lastSynced: "Real-time",
      icon: "CreditCard",
    },
  ],

  transactions: [
    {
      id: "tx-jl-1",
      date: "Today, 8:00 AM",
      description: "Pocket money from Mei Ling",
      amount: 10,
      category: "Pocket Money",
      source: "PayNow",
      memberId: "mem-jiale",
    },
    {
      id: "tx-jl-2",
      date: "Yesterday, 4:15 PM",
      description: "FairPrice snacks and juice",
      amount: -6.4,
      category: "Groceries",
      source: "Cash Receipt",
      memberId: "mem-jiale",
    },
    {
      id: "tx-jl-3",
      date: "Yesterday, 12:30 PM",
      description: "School canteen chicken rice",
      amount: -3.5,
      category: "Hawker & Dining",
      source: "Cash Receipt",
      memberId: "mem-jiale",
    },
    {
      id: "tx-jl-4",
      date: "2 days ago",
      description: "Bubble tea after school",
      amount: -4.2,
      category: "Hawker & Dining",
      source: "PayNow",
      memberId: "mem-jiale",
    },
    {
      id: "tx-jl-5",
      date: "3 days ago",
      description: "SimplyGo bus fare",
      amount: -1.1,
      category: "Transport",
      source: "DBS",
      memberId: "mem-jiale",
    },
    {
      id: "tx-jl-6",
      date: "4 days ago",
      description: "School bookstore notebook",
      amount: -4.8,
      category: "Other",
      source: "Cash Receipt",
      memberId: "mem-jiale",
    },
    {
      id: "tx-jl-7",
      date: "1 week ago",
      description: "Birthday money from Grandma",
      amount: 20,
      category: "Other",
      source: "Cash Receipt",
      memberId: "mem-jiale",
    },
  ],

  vouchers: [],

  nudges: [
    {
      id: "nudge-jl-1",
      type: "opportunity_cost",
      title: "Keep saving!",
      message:
        "You are making progress towards your New Game goal.",
      severity: "info",
      timestamp: "Today",
    },
  ],

  currentSimulatedLocation: null,
};

/*
 * ========================================================
 * ALEX — YOUNG ADULT
 * ========================================================
 */

export const ALEX_STATE: AppState = {
  currentPersonaId: "alex_young_adult",
  householdName: "Alex (Young Adult)",
  totalHouseholdBalance: 5200,
  thisMonthsSpend: 1450,

  members: [
    {
      id: "mem-alex",
      name: "Alex",
      role: "manager",
      age: 26,
      avatarBg: "bg-teal-600",
      avatarText: "A",
      workerType: "regular_income",
    },
  ],

  bankAccounts: [
    {
      id: "acc-posb-alex",
      bankName: "POSB Savings Account",
      accountNumber: "•••-55412",
      accountType: "savings",
      balance: 5200,
      lastSynced: "Automated Sync",
      icon: "Building2",
    },
  ],

  accounts: [
    {
      id: "acc-posb-alex",
      bankName: "POSB Savings Account",
      accountNumber: "•••-55412",
      accountType: "savings",
      balance: 5200,
      lastSynced: "Automated Sync",
      icon: "Building2",
    },
  ],

  transactions: [
    {
      id: "tx-a1",
      date: "Today, 1:15 PM",
      description: "Cold Storage Groceries",
      amount: -34.8,
      category: "Groceries",
      source: "DBS",
      memberId: "mem-alex",
    },
    {
      id: "tx-a2",
      date: "2 days ago",
      description: "MRT and Bus Fare",
      amount: -18.2,
      category: "Transport",
      source: "DBS",
      memberId: "mem-alex",
    },
    {
      id: "tx-a3",
      date: "5 days ago",
      description: "Monthly Salary Credit",
      amount: 3800,
      category: "Other",
      source: "DBS",
      memberId: "mem-alex",
    },
  ],

  vouchers: [
    {
      id: "vouch-alex-cdc",
      name: "CDC Vouchers 2026",
      category: "CDC_Supermarket",
      totalGranted: 300,
      balance: 150,
      expiryDate: "31 Dec 2026",
      daysRemaining: 120,
      description:
        "CDC Supermarket and Hawker voucher tranche.",
      acceptedMerchants: [
        "FairPrice",
        "Sheng Siong",
        "Hawkers",
      ],
      isExpiringSoon: false,
    },
  ],

  nudges: [],
  currentSimulatedLocation: null,
};