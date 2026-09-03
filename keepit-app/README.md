# KeepIt

**One household ledger for every dollar you earn, spend, and are owed.**

KeepIt consolidates bank accounts, PayNow, cash, gig income, and Singapore
government voucher schemes (CDC, Climate, SG60) plus Workfare Income Supplement
into a single view — with role-based access so a manager sees the whole
household and a dependent sees only their own money.

Next.js 15 (App Router) · TypeScript · Supabase (Postgres + Auth) · Tailwind CSS

---

## Quick start

```bash
cd keepit-app
npm install
cp .env.example .env.local     # then fill in your Supabase keys (step 2 below)
npm run dev
```

Open http://localhost:3000

---

## Setup

### 1. Create the database

1. Create a free project at [supabase.com](https://supabase.com). Choose the
   **Southeast Asia (Singapore)** region.
2. Open **SQL Editor → New query**, paste the entire contents of
   `supabase/schema.sql`, and click **Run**.
   It is one file covering all three sections (core, gig, ledger) and is safe
   to re-run.
3. Go to **Authentication → Sign In / Providers → Email** and turn
   **Confirm email OFF**. With it on, signup returns no session and the flow
   dead-ends at the registration screen. Turn it back on for production.

### 2. Add your keys

**Project Settings → API**, then fill `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
```

Newer Supabase projects label these *publishable* and *secret*; older ones say
*anon* and *service_role*. Same thing.

Restart the dev server after editing — Next.js only reads env files at startup.

### 3. Run

```bash
npm run dev
```

---

## Using the app

The flow is **register → onboarding → dashboard**, and it is enforced by
middleware: any unauthenticated request to a protected page redirects to
`/login`.

1. **`/register`** — create an account. The form collects your name, phone,
   age, citizenship, and employment type in one pass, then calls
   `/api/auth/signup` followed by `/api/onboarding`, which creates your
   household, your manager record, your linked accounts, and any dependents.
2. **Employment type matters.** Choosing **platform worker** unlocks the gig
   tab: the FEDA → CPF → spendable breakdown and the Workfare payout tracker.
   Choosing regular or variable income hides them, because those schemes
   legally do not apply.
3. **`/`** — the dashboard. Tabs across the bottom: Home, Ledger, Schemes,
   Family, Gig (platform workers only), Goals.
4. **Add a dependent** from the Family tab. Dependents get their own simplified
   view showing only their balance, savings goal, and activity.
5. **`/login`** — returning users. Logging out is in the header dropdown.

### What to show in a demo

- **Log a cash purchase** in a grocery category. The nudge fires from live
  voucher balances, showing what an expiring voucher could have covered.
- **The gig tab**, if registered as a platform worker: gross → FEDA → CPF →
  spendable, plus which Workfare months landed and which were missed.
- **Switch to a dependent's view** from the Family tab to show the
  transparency contrast.

---

## Verifying the backend is connected

```bash
npm run verify:backend
```

Or check by hand:

```bash
curl http://localhost:3000/api/health
```

| Response | Meaning |
|---|---|
| `"database": "connected"` | Supabase is live |
| `"database": "not-configured"` | `.env.local` missing or not loaded |

**In the browser**, logged in, open DevTools console:

```js
await (await fetch('/api/household')).json()
```

That returns your entire dashboard payload straight from Postgres. If you see
your real household name and members, the frontend is genuinely reading from
the backend.

**In Supabase**, open **Table Editor** and check `household_members`,
`transactions`, `government_vouchers`, and `savings_goals` for your rows. Add a
transaction in the app, refresh the table, and watch the row appear.

### Common problems

| Symptom | Cause |
|---|---|
| Redirected to `/login` in a loop | Email confirmation is still ON in Supabase |
| `"Supabase is not configured"` | `.env.local` missing, misnamed, or server not restarted |
| `infinite recursion detected in policy` | Old policies still present — re-run `supabase/schema.sql` in full |
| Empty dashboard after registering | Onboarding didn't complete; check the browser Network tab for the `/api/onboarding` response |

---

## API

Every route is a Next.js Route Handler under `src/app/api/`. They read the
Supabase session from an HTTP-only cookie, so `curl` without a session returns
401 by design — test from the browser console while logged in.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/health` | Connection check |
| POST | `/api/onboarding` | Create household, manager, accounts, dependents |
| GET | `/api/household` | **Main endpoint** — full dashboard state |
| POST | `/api/ledger` | Add a transaction, categorise, evaluate nudge |
| POST | `/api/vouchers` | `claim` or `redeem` a voucher |
| POST | `/api/savings-goals` | `upsert` or `deposit` on a goal |
| POST | `/api/gig` | FEDA / CPF / WIS calculations |
| GET | `/api/location-pacing` | Voucher spend pacing |
| POST | `/api/nudge` | Mark a nudge acted on |
| POST | `/api/ocr` | Receipt parsing (stubbed) |

---

## How data flows

```
Browser (src/app/page.tsx)
  → src/lib/api.ts          typed fetch wrappers
    → /api/household        route handler
      → src/lib/backend/household.ts
        → Supabase client carrying the user's session cookie
          → Postgres, filtered by Row Level Security
```

Writes go through `/api/ledger`, `/api/vouchers`, and `/api/savings-goals`,
each followed by a refresh so the UI always reflects committed database state.

## Role-gating is enforced in the database

`supabase/schema.sql` defines RLS policies so a dependent's session cannot read
household totals or other members' rows. It is not filtered in the UI.

The `security definer` helper functions (`is_household_member`,
`is_household_manager`, `is_own_member`) exist because a policy on
`household_members` that itself queries `household_members` causes
`infinite recursion detected in policy`. Running that check inside a
`security definer` function bypasses RLS internally and breaks the loop.

## Business logic lives on the server

- `src/lib/calculations/gigCalculator.ts` — FEDA rates (60% car/van/lorry,
  35% motorcycle/PMD, 20% bicycle/walk/transit), CPF on post-FEDA earnings
- `src/lib/calculations/wisCalculator.ts` — WIS eligibility, income cap,
  cash/MediSave split by age band
- `src/lib/calculations/pacingEngine.ts` — voucher spend pacing
- `src/lib/calculations/nudgeEngine.ts` — opportunity-cost detection
- `src/lib/gig/` — payout history and rolling income used by `/api/gig`

On FEDA: it is a statutory assumption about work expenses used to derive the
earnings CPF is levied on, not money the platform withholds. The calculator
returns both `cashReceived` (gross − CPF, what lands in the bank) and
`takeHomeDisposable` (gross − FEDA − CPF, what's left after work expenses).
The waterfall ends on the latter.

## What's mocked vs. real

**Real:** authentication, the database and all persistence, RLS role-gating,
every calculation, nudge triggering, voucher balances and expiry.

**Mocked:** bank and PayNow syncing (no licensed aggregator or SGFinDex
access), OCR receipt parsing (`/api/ocr` returns realistic stub data), and
merchant location data for the map.

---

## Project structure

```
keepit-app/
├── src/
│   ├── app/
│   │   ├── page.tsx          # dashboard shell
│   │   ├── login/  register/ # auth pages
│   │   └── api/              # all backend route handlers
│   ├── components/           # UI grouped by feature
│   ├── lib/
│   │   ├── api.ts            # typed fetch wrappers
│   │   ├── backend/          # server-side household queries
│   │   ├── calculations/     # FEDA, CPF, WIS, pacing, nudge
│   │   └── supabase/         # browser, server, admin clients
│   └── middleware.ts         # route protection
├── supabase/schema.sql       # complete schema + RLS. Run this first.
└── scripts/verify-backend.mjs
```

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run verify:backend` | Check the Supabase connection |

## Deploying

Push to GitHub, import to Vercel, add the three environment variables under
**Settings → Environment Variables**, deploy.
