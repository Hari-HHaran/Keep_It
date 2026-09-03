"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import { getSeedStateForPersona, saveState } from "@/lib/storage";
import { calculateSafeWeeklySalary, getFedaPercentage } from "@/lib/calculations/gigCalculator";
import { calculateWisEligibility } from "@/lib/calculations/wisCalculator";
import { VehicleType } from "@/lib/types";

type Persona = "manager" | "gig" | "single";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: "Mei Ling Tan",
    email: "",
    password: "",
    phone: "+65 9123 4567",
    householdName: "Tan Household",
    age: "38",
    citizenship: "singaporean",
    persona: "manager" as Persona,
    bank: "DBS",
    startingBalance: "3420",
    includePayNow: true,
    payNowBalance: "240",
    vehicleType: "motorcycle_pmd" as VehicleType,
    weeklyGross: "850",
    claimCdc: true,
    claimClimate: true,
    claimSg60: true,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(form.fullName.trim() && form.phone.trim() && form.householdName.trim());
    if (step === 3) return Number(form.startingBalance) >= 0;
    return true;
  }, [form, step]);

  function buildPayload() {
    const isGig = form.persona === "gig";
    const feda = getFedaPercentage(form.vehicleType) * 100;
    const gross = Number(form.weeklyGross || 0);
    const smoothing = calculateSafeWeeklySalary([gross * 0.82, gross * 1.05, gross * 1.12, gross * 0.9, gross]);
    const wis = calculateWisEligibility(Number(form.age), gross * 4, isGig);
    const twelveDaysFromNow = new Date(Date.now() + 12 * 86_400_000).toISOString().slice(0, 10);
    const vouchers = [];
    if (form.claimCdc) vouchers.push({
      name: "CDC Supermarket Vouchers",
      category: "CDC_Supermarket",
      totalGranted: 500,
      balance: 240,
      expiryDate: twelveDaysFromNow,
      description: "Household supermarket and heartland support",
      acceptedMerchants: ["FairPrice", "Sheng Siong", "Giant", "Prime"],
    });
    if (form.claimClimate) vouchers.push({
      name: "Climate Vouchers",
      category: "Climate",
      totalGranted: 300,
      balance: 300,
      expiryDate: "2027-12-31",
      description: "Eligible energy and water-saving products",
      acceptedMerchants: ["Courts", "Best Denki", "Gain City"],
    });
    if (form.claimSg60) vouchers.push({
      name: "SG60 Community Vouchers",
      category: "SG60",
      totalGranted: 300,
      balance: 217,
      expiryDate: "2026-12-31",
      description: "Community and heartland merchant support",
      acceptedMerchants: ["Heartland Shops", "Community Clinics"],
    });

    return {
      householdName: form.householdName.trim(),
      managerProfile: {
        fullName: form.fullName.trim(),
        phoneNumber: form.phone.trim(),
        age: Number(form.age || 21),
        citizenship: form.citizenship,
        employmentType: isGig ? "platform_worker" : "regular_income",
        vehicleType: isGig ? form.vehicleType : "none",
      },
      accounts: [
        {
          bankName: `${form.bank} Savings Account`,
          accountNumber: "•••-48291",
          accountType: "savings",
          balance: Number(form.startingBalance || 0),
        },
        ...(form.includePayNow
          ? [{
              bankName: "PayNow / PayLah! Wallet",
              accountNumber: form.phone.trim(),
              accountType: "wallet",
              balance: Number(form.payNowBalance || 0),
            }]
          : []),
      ],
      vouchers,
      dependents: form.persona === "manager"
        ? [{
            name: "Jia Le",
            age: 11,
            personalBalance: 47.5,
            savingsGoal: {
              title: "New game",
              targetAmount: 60,
              currentAmount: 47.5,
              categoryIcon: "🎮",
              notes: "Learning to save from weekly pocket money",
            },
          }]
        : [],
      gigProfile: isGig
        ? {
            platformName: "Lalamove",
            fedaPercentage: feda,
            grossWeeklyAverage: gross,
            safeWeeklySalary: smoothing.suggestedWeeklySalary,
            bufferSaved: smoothing.currentBufferTotal,
            monthlyWisEligible: wis.isEligible,
            wisMonthlyAmount: wis.monthlyTotal,
            wisCashSplit: wis.monthlyCash,
            wisMedisaveSplit: wis.monthlyMediSave,
            wisPayoutStatus: [],
          }
        : null,
    };
  }

  async function registerWithBackend() {
    setError("");
    setMessage("");
    if (!form.email || form.password.length < 8) {
      setError("Enter a valid email and a password of at least 8 characters.");
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      const signup = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const signupBody = await signup.json();
      if (!signup.ok) throw new Error(signupBody.error || "Unable to create account.");
      if (!signupBody.sessionCreated) {
        localStorage.setItem("keepit_pending_onboarding", JSON.stringify(buildPayload()));
        setMessage("Account created. Verify your email, then use the sign-in page to continue.");
        return;
      }

      const onboarding = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const onboardingBody = await onboarding.json();
      if (!onboarding.ok) throw new Error(onboardingBody.error || "Unable to create household.");
      localStorage.removeItem("keepit_pending_onboarding");
      localStorage.removeItem("keepit_demo_mode");
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Registration failed.");
    } finally {
      setSaving(false);
    }
  }

  function launchDemo() {
    const seedId = form.persona === "gig" ? "marcus_gig" : form.persona === "single" ? "alex_young_adult" : "tan_family";
    const state = getSeedStateForPersona(seedId);
    state.householdName = form.householdName || state.householdName;
    state.backendMode = "demo";
    saveState(state);
    localStorage.setItem("keepit_demo_mode", "true");
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#EDE4D6] px-4 py-8 text-[#1B1815]">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[32px] border border-[#D6C9B4] bg-[#FFFDF8] shadow-xl">
        <div className="bg-[#0F4635] p-6 text-[#FBF6EC]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black">KeepIt</div>
              <p className="mt-1 text-xs text-[#BBD0C6]">Create one household view for money, schemes and irregular income.</p>
            </div>
            <span className="rounded-full bg-[#E8A02C] px-3 py-1 text-xs font-bold text-[#1B1815]">{step} / 4</span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#1B5A47]">
            <div className="h-full rounded-full bg-[#E8A02C] transition-all" style={{ width: `${step * 25}%` }} />
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {step === 1 && (
            <section className="space-y-4">
              <StepHeading title="Tell us about you" detail="These details create your secure household profile." />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name" value={form.fullName} onChange={(v) => update("fullName", v)} />
                <Field label="Household name" value={form.householdName} onChange={(v) => update("householdName", v)} />
                <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="you@example.com" />
                <Field label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} placeholder="At least 8 characters" />
                <Field label="Mobile number" value={form.phone} onChange={(v) => update("phone", v)} />
                <Field label="Age" type="number" value={form.age} onChange={(v) => update("age", v)} />
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <StepHeading title="Choose your financial situation" detail="KeepIt adapts the dashboard and calculations to you." />
              <div className="grid gap-3">
                {[
                  ["manager", "👨‍👩‍👧 Household manager", "Shared ledger, dependents and household schemes"],
                  ["gig", "🛵 Platform worker", "FEDA, CPF, income smoothing and Workfare tracking"],
                  ["single", "👤 Young adult", "Personal ledger, first-job savings and scheme pacing"],
                ].map(([value, title, detail]) => (
                  <button key={value} type="button" onClick={() => update("persona", value)} className={`rounded-2xl border p-4 text-left transition ${form.persona === value ? "border-[#0F4635] bg-[#DDE8E1] ring-1 ring-[#0F4635]" : "border-[#E0D4BF] bg-white hover:border-[#0F4635]"}`}>
                    <div className="flex items-center justify-between">
                      <div><div className="font-bold">{title}</div><div className="mt-1 text-xs text-[#6B6259]">{detail}</div></div>
                      {form.persona === value && <Check className="h-5 w-5 text-[#0F4635]" />}
                    </div>
                  </button>
                ))}
              </div>
              {form.persona === "gig" && (
                <div className="rounded-2xl bg-[#F5EAD6] p-4">
                  <label className="text-xs font-bold">Delivery mode</label>
                  <select value={form.vehicleType} onChange={(e) => update("vehicleType", e.target.value)} className="mt-2 w-full rounded-xl border border-[#D6C9B4] bg-white p-3 text-sm">
                    <option value="motorcycle_pmd">Motorcycle / PMD — 35% FEDA</option>
                    <option value="car_van_lorry">Car / van / lorry — 60% FEDA</option>
                    <option value="bicycle_walking_public">Bicycle / walking / public transport — 20% FEDA</option>
                  </select>
                  <div className="mt-3"><Field label="Estimated weekly gross income" type="number" value={form.weeklyGross} onChange={(v) => update("weeklyGross", v)} /></div>
                </div>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <StepHeading title="Add money sources" detail="Bank linking is simulated for the hackathon; balances are stored securely in Supabase." />
              <div className="grid grid-cols-4 gap-2">
                {["DBS", "OCBC", "UOB", "POSB"].map((bank) => (
                  <button key={bank} type="button" onClick={() => update("bank", bank)} className={`rounded-xl border p-3 text-xs font-bold ${form.bank === bank ? "border-[#0F4635] bg-[#0F4635] text-white" : "border-[#E0D4BF]"}`}>{bank}</button>
                ))}
              </div>
              <Field label="Starting bank balance (S$)" type="number" value={form.startingBalance} onChange={(v) => update("startingBalance", v)} />
              <label className="flex items-center justify-between rounded-2xl border border-[#E0D4BF] bg-[#FBF6EC] p-4 text-sm font-semibold">
                Include PayNow / PayLah! wallet
                <input type="checkbox" checked={form.includePayNow} onChange={(e) => update("includePayNow", e.target.checked)} className="h-4 w-4 accent-[#0F4635]" />
              </label>
              {form.includePayNow && <Field label="Wallet balance (S$)" type="number" value={form.payNowBalance} onChange={(v) => update("payNowBalance", v)} />}
            </section>
          )}

          {step === 4 && (
            <section className="space-y-4">
              <StepHeading title="Add eligible support" detail="For the prototype, choose the schemes to demonstrate in your unified dashboard." />
              {[
                ["claimCdc", form.claimCdc, "CDC Vouchers", "S$240 unspent • supermarkets and hawkers"],
                ["claimClimate", form.claimClimate, "Climate Vouchers", "S$300 • efficient appliances and fittings"],
                ["claimSg60", form.claimSg60, "SG60 Community Vouchers", "S$217 unspent • heartland merchants"],
              ].map(([key, checked, title, detail]) => (
                <label key={String(key)} className="flex items-center justify-between rounded-2xl border border-[#E0D4BF] bg-[#FBF6EC] p-4">
                  <div><div className="text-sm font-bold">{title}</div><div className="text-xs text-[#6B6259]">{detail}</div></div>
                  <input type="checkbox" checked={Boolean(checked)} onChange={(e) => update(String(key), e.target.checked)} className="h-4 w-4 accent-[#0F4635]" />
                </label>
              ))}
              <div className="rounded-2xl bg-[#DDE8E1] p-4 text-xs text-[#0F4635]">
                <ShieldCheck className="mr-1 inline h-4 w-4" /> Real mode stores this household in Supabase. Demo mode stays in this browser as a presentation backup.
              </div>
            </section>
          )}

          {(error || message) && <div className={`mt-5 rounded-xl p-3 text-sm ${error ? "bg-[#FAE3DD] text-[#8F2A17]" : "bg-[#DDE8E1] text-[#0F4635]"}`}>{error || message}</div>}

          <div className="mt-7 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((value) => value - 1)} className="flex items-center gap-1 rounded-xl border border-[#D6C9B4] px-4 py-3 text-xs font-bold"><ChevronLeft className="h-4 w-4" /> Back</button>
            ) : <Link href="/login" className="text-xs font-bold text-[#0F4635] underline">Already registered?</Link>}
            {step < 4 ? (
              <button type="button" disabled={!canContinue} onClick={() => setStep((value) => value + 1)} className="ml-auto flex items-center gap-1 rounded-xl bg-[#0F4635] px-5 py-3 text-xs font-bold text-white disabled:opacity-40">Continue <ChevronRight className="h-4 w-4" /></button>
            ) : (
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={launchDemo} className="rounded-xl border border-[#0F4635] px-4 py-3 text-xs font-bold text-[#0F4635]"><Sparkles className="mr-1 inline h-4 w-4" /> Demo fallback</button>
                <button type="button" disabled={saving} onClick={registerWithBackend} className="rounded-xl bg-[#0F4635] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">{saving ? "Creating…" : "Create household"}</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StepHeading({ title, detail }: { title: string; detail: string }) {
  return <div><h1 className="text-xl font-black">{title}</h1><p className="mt-1 text-sm text-[#6B6259]">{detail}</p></div>;
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="block text-xs font-bold text-[#584F45]">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-1.5 w-full rounded-xl border border-[#D6C9B4] bg-white px-3.5 py-3 text-sm text-[#1B1815] outline-none focus:border-[#0F4635]" /></label>;
}
