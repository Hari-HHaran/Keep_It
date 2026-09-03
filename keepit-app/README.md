# KeepIt — Singapore Household Finance & Scheme Tracker
> **Ellipsis Tech Series 2026** | Team Technical Difficulties  
> **Team Members**: Dhandapani Kumaran (Leader), Senthilkumar Hariharan, Arumugam Sree Sanjana, Tarunikaa Saravanan Vijayadhanalakshmi

KeepIt is a single, unified household financial ledger designed for Singapore's unique financial ecosystem. It solves account fragmentation, prevents silent government voucher forfeiture (CDC, Climate, SG60), calculates Platform Workers Act 2025 gig income resilience (FEDA & WIS), provides contextual opportunity cost literacy nudges, and delivers genuine two-way manager/dependent transparency.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node v24)
- **npm**: v9.0.0 or later

### 2. Installation & Run
```bash
# Navigate to project directory
cd C:\Users\dkuma\.gemini\antigravity\scratch\keepit-app

# Run development server
npm run dev
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🌟 6 Core Features Implemented

1. **Automatic Household Ledger (Feature 1)**:
   - Consolidated view across multi-bank accounts (DBS, OCBC) and PayNow/PayLah activity.
   - Intelligent OCR Receipt Scanner with presets for NTUC FairPrice, Sheng Siong, and Kopitiam.
   - Single-tap manual transaction fallback.

2. **Gig Income & CPF Resilience Engine (Feature 2)**:
   - Platform Workers Act 2025 Fixed Expense Deduction Amount (FEDA: 60% car/van, 35% motorcycle, 20% bicycle/walking).
   - Rolling safe weekly "Personal Salary" algorithm ($540/week baseline) with surplus buffer savings ($310).
   - Monthly Workfare Income Supplement (WIS / PCTS) tracker with 10% Cash / 90% MediSave statutory split and payment calendar.

3. **Government Voucher & Scheme Tracker (Feature 3)**:
   - Unified dashboard for CDC Vouchers (Tranche 1 & 2), Climate Vouchers, and SG60 Vouchers.
   - Real-time countdowns and expiry urgency alerts.
   - Instant SMS claim link integration simulation.

4. **Contextual Literacy Nudge (Feature 4)**:
   - Live transaction evaluator that flags opportunity costs (e.g. paying cash for groceries when CDC vouchers are expiring in 12 days).

5. **Two-Way Manager vs. Dependent Dashboards (Feature 5)**:
   - **Manager View (Mei Ling / Marcus)**: Full visibility into household balance ($4,285), accounts, schemes, and allowances.
   - **Dependent View (Jia Le, Age 11)**: Dedicated child dashboard showing personal balance ($47.50), active savings goal for a "New game" with progress animation, and canteen expenses—without exposing parents' private bank accounts or debt.

6. **Location-Based Voucher Nudges & Spend Pacing (Feature 6)**:
   - **Interactive Location Radar**: Simulate being near NTUC FairPrice Tampines Mall, Bedok Hawker Centre, or Courts Megastore to trigger real-time voucher acceptance alerts.
   - **Spend Pacing Calculator**: Computes safe weekly burn rates ($\text{Balance} / \text{Weeks Left}$) with color-coded status badges (*On Track*, *Behind Pace*, *Critical*).

---

## 🎭 Interactive Demo Personas

Switch between personas in 1-click using the top persona switcher bar:
- 👨‍👩‍👧 **The Tan Family (Manager)**: Mei Ling & Wei Han + Child Jia Le ($612 Vouchers, Multi-bank ledger, PayNow allowance).
- 🛵 **Marcus (Platform Gig Worker)**: 24yo Lalamove rider (35% FEDA, Safe salary smoothing, monthly WIS tracker).
- 🎒 **Jia Le (Child Dependent, Age 11)**: Child personal balance ($47.50), savings goal ($47.50 of $60), pocket money stream.
- 🧑 **Alex (Young Adult)**: First job solo earner.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide React, Framer Motion, Canvas Confetti
- **Storage**: Local persistent state with Supabase-compatible data schema
- **APIs**:
  - `/api/ledger` — Transaction streams & multi-account sync
  - `/api/vouchers` — Scheme tracking & claim link processing
  - `/api/gig` — FEDA, CPF, and WIS calculation engine
  - `/api/nudge` — Opportunity cost literacy engine
  - `/api/ocr` — Singapore merchant receipt parser
  - `/api/location-pacing` — Merchant proximity & burn-rate calculations
