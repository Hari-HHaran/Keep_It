# Deployment & Live Demo Guide: KeepIt

## 🌐 Deploying to Vercel (1-Click Free Hosting)

KeepIt is a pure Next.js 15 zero-boilerplate app, designed to deploy directly to Vercel with zero additional configuration.

### Option 1: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Inside keepit-app directory:
cd C:\Users\dkuma\.gemini\antigravity\scratch\keepit-app
vercel
```
Follow the interactive prompts:
- Set up and deploy `keepit-app`? **Yes**
- Which scope? **Your Account**
- Link to existing project? **No**
- Project name? **keepit-app**
- Directory? `./`
- Modify settings? **No**

### Option 2: Push to GitHub & Link to Vercel UI
1. Create a new repository on GitHub (e.g. `keepit-hackathon-2026`).
2. Push your project:
   ```bash
   git init
   git add .
   git commit -m "feat: KeepIt full-stack hackathon prototype"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. Go to [https://vercel.com/new](https://vercel.com/new), select your repository, and click **Deploy**.

---

## 🗄️ Connecting to Cloud Supabase (Optional Post-Hackathon)

KeepIt comes pre-configured with local persistent data state. To connect to a live Supabase PostgreSQL instance:

1. Create a project on [https://supabase.com](https://supabase.com).
2. Create `.env.local` inside `keepit-app/`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Use the schema definitions in `src/lib/types.ts` to create the tables `households`, `members`, `transactions`, `vouchers`, and `gig_profiles`.

---

## 🎤 Step-by-Step Live Demo Flow (3 Minutes Pitch Script)

| Step | Persona | What to Show & Say |
|---|---|---|
| **1. Hook & Overview** | **Tan Family** | "Good afternoon. Meet Mei Ling from the Tan family. After Seedly discontinued in Dec 2025, Singapore families lost multi-bank visibility. KeepIt consolidates DBS, OCBC, and PayNow into one ledger, alongside $612 in CDC, Climate, and SG60 vouchers." |
| **2. Cash OCR & Nudge** | **Tan Family** | Click **Scan Receipt** $\rightarrow$ select FairPrice $24.50 receipt. "When Mei Ling pays cash at FairPrice, KeepIt's OCR instantly catches it and triggers an **Opportunity Cost Literacy Nudge**: *'You spent $24.50 cash when you have $85 in CDC vouchers expiring in 12 days!'*" |
| **3. Radar & Pacing** | **Tan Family** | Click **Radar** in header $\rightarrow$ "When near Tampines Mall, KeepIt surfaces accepted vouchers and calculates a **$14.15/week spend pace** so vouchers never forfeit silently." |
| **4. Two-Way Child View** | **Jia Le (Age 11)** | Switch to **Jia Le**. "Unlike restrictive parental surveillance, Jia Le gets his own dashboard. He can't see parents' bills or private debts; he only sees his **$47.50 balance**, saves for his **$60 New game** goal, and learns positive money habits." Click *Save $2.50* to trigger celebration confetti! |
| **5. Gig Resilience** | **Marcus (Lalamove)** | Switch to **Marcus**. "Under the 2025 Platform Workers Act, KeepIt applies a **35% FEDA deduction** and CPF, smooths erratic gig earnings into a **$540/week safe personal salary** with a **$310 buffer**, and tracks his **$180 monthly Workfare (WIS)** payout (10% cash / 90% MediSave) in the same scheme view." |
