"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink, 
  Link2, 
  RefreshCw, 
  CheckCircle2, 
  Ticket 
} from "lucide-react";
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
  const [syncingVoucher, setSyncingVoucher] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    householdName: "",
    age: "25",
    citizenship: "singaporean",
    persona: "single" as Persona,
    hasDependent: false,
    dependentName: "Jia Le",
    dependentAge: "11",
    dependentBalance: "47.50",
    dependentGoalTitle: "New game",
    dependentGoalTarget: "60",
    bank: "DBS",
    startingBalance: "",
    includePayNow: false,
    payNowBalance: "",
    vehicleType: "motorcycle_pmd" as VehicleType,
    weeklyGross: "850",
    claimCdc: false,
    cdcSmsLink: "",
    cdcVerifiedBalance: 240,
    cdcVerified: false,
    claimClimate: false,
    climateSmsLink: "",
    climateVerifiedBalance: 300,
    climateVerified: false,
    claimSg60: false,
    sg60SmsLink: "",
    sg60VerifiedBalance: 217,
    sg60Verified: false,
  });

  const update = (field: string, value: string | boolean | number) =>
    setForm((current) => ({ ...current, [field]: value }));

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(form.fullName.trim() && form.phone.trim() && form.householdName.trim());
    if (step === 3) return form.startingBalance !== "" && Number(form.startingBalance) >= 0;
    return true;
  }, [form, step]);

  const handleVerifySmsLink = (scheme: "cdc" | "climate" | "sg60") => {
    setSyncingVoucher(scheme);
    setTimeout(() => {
      if (scheme === "cdc") {
        setForm((prev) => ({
          ...prev,
          cdcSmsLink: prev.cdcSmsLink || "https://voucher.redeem.gov.sg/c/cdc-2026-sms-synced",
          cdcVerifiedBalance: prev.cdcVerifiedBalance || 240,
          cdcVerified: true,
        }));
      } else if (scheme === "climate") {
        setForm((prev) => ({
          ...prev,
          climateSmsLink: prev.climateSmsLink || "https://voucher.redeem.gov.sg/c/climate-2026-sms-synced",
          climateVerifiedBalance: prev.climateVerifiedBalance || 300,
          climateVerified: true,
        }));
      } else if (scheme === "sg60") {
        setForm((prev) => ({
          ...prev,
          sg60SmsLink: prev.sg60SmsLink || "https://voucher.redeem.gov.sg/c/sg60-2026-sms-synced",
          sg60VerifiedBalance: prev.sg60VerifiedBalance || 217,
          sg60Verified: true,
        }));
      }
      setSyncingVoucher(null);
    }, 900);
  };

  function autofillSample(personaType: Persona) {
    if (personaType === "single") {
      setForm((prev) => ({
        ...prev,
        persona: "single",
        fullName: "Alex",
        email: "alex@example.com",
        password: "password123",
        phone: "+65 9234 5678",
        householdName: "Alex's Place",
        age: "26",
        citizenship: "singaporean",
        hasDependent: false,
        bank: "OCBC",
        startingBalance: "3420",
        includePayNow: true,
        payNowBalance: "240",
        claimCdc: true,
        cdcSmsLink: "https://voucher.redeem.gov.sg/c/cdc-alex-9234",
        cdcVerifiedBalance: 240,
        cdcVerified: true,
        claimClimate: false,
        claimSg60: true,
        sg60SmsLink: "https://voucher.redeem.gov.sg/c/sg60-alex-9234",
        sg60VerifiedBalance: 217,
        sg60Verified: true,
      }));
    } else if (personaType === "gig") {
      setForm((prev) => ({
        ...prev,
        persona: "gig",
        fullName: "Marcus Lim",
        email: "marcus@example.com",
        password: "password123",
        phone: "+65 9876 5432",
        householdName: "Marcus Household",
        age: "34",
        citizenship: "singaporean",
        hasDependent: false,
        bank: "POSB",
        startingBalance: "1850",
        includePayNow: true,
        payNowBalance: "450",
        vehicleType: "motorcycle_pmd",
        weeklyGross: "920",
        claimCdc: true,
        cdcSmsLink: "https://voucher.redeem.gov.sg/c/cdc-marcus-9876",
        cdcVerifiedBalance: 300,
        cdcVerified: true,
        claimClimate: true,
        climateSmsLink: "https://voucher.redeem.gov.sg/c/climate-marcus-9876",
        climateVerifiedBalance: 300,
        climateVerified: true,
        claimSg60: true,
        sg60SmsLink: "https://voucher.redeem.gov.sg/c/sg60-marcus-9876",
        sg60VerifiedBalance: 217,
        sg60Verified: true,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        persona: "manager",
        fullName: "Mei Ling Tan",
        email: "meiling@example.com",
        password: "password123",
        phone: "+65 9123 4567",
        householdName: "Tan Family",
        age: "38",
        citizenship: "singaporean",
        hasDependent: true,
        dependentName: "Jia Le",
        dependentAge: "11",
        dependentBalance: "47.50",
        bank: "DBS",
        startingBalance: "3420",
        includePayNow: true,
        payNowBalance: "240",
        claimCdc: true,
        cdcSmsLink: "https://voucher.redeem.gov.sg/c/cdc-tan-9123",
        cdcVerifiedBalance: 240,
        cdcVerified: true,
        claimClimate: true,
        climateSmsLink: "https://voucher.redeem.gov.sg/c/climate-tan-9123",
        climateVerifiedBalance: 300,
        climateVerified: true,
        claimSg60: true,
        sg60SmsLink: "https://voucher.redeem.gov.sg/c/sg60-tan-9123",
        sg60VerifiedBalance: 217,
        sg60Verified: true,
      }));
    }
  }

  function buildPayload() {
    const isGig = form.persona === "gig";
    const feda = getFedaPercentage(form.vehicleType) * 100;
    const gross = Number(form.weeklyGross || 0);
    const smoothing = calculateSafeWeeklySalary([gross * 0.82, gross * 1.05, gross * 1.12, gross * 0.9, gross]);
    const wis = calculateWisEligibility(Number(form.age), gross * 4, isGig);
    const twelveDaysFromNow = new Date(Date.now() + 12 * 86_400_000).toISOString().slice(0, 10);
    
    const vouchers = [];
    if (form.claimCdc) vouchers.push({
      name: "CDC Supermarket & Hawker Vouchers",
      category: "CDC_Supermarket",
      totalGranted: 500,
      balance: Number(form.cdcVerifiedBalance || 240),
      expiryDate: twelveDaysFromNow,
      description: "Gov.sg SMS Claimed • Supermarket & Heartland hawkers",
      acceptedMerchants: ["FairPrice", "Sheng Siong", "Giant", "Prime", "Hawker Centres"],
    });
    if (form.claimClimate) vouchers.push({
      name: "Climate Vouchers",
      category: "Climate",
      totalGranted: 300,
      balance: Number(form.climateVerifiedBalance || 300),
      expiryDate: "2027-12-31",
      description: "Gov.sg SMS Claimed • Energy and water-saving appliances",
      acceptedMerchants: ["Courts", "Best Denki", "Gain City"],
    });
    if (form.claimSg60) vouchers.push({
      name: "SG60 Community Vouchers",
      category: "SG60",
      totalGranted: 300,
      balance: Number(form.sg60VerifiedBalance || 217),
      expiryDate: "2026-12-31",
      description: "Gov.sg SMS Claimed • Heartland shops and clinics",
      acceptedMerchants: ["Heartland Shops", "Community Clinics"],
    });

    // Only add dependents if explicitly checked or configured
    const dependents = [];
    if (form.hasDependent && form.dependentName.trim()) {
      dependents.push({
        name: form.dependentName.trim(),
        age: Number(form.dependentAge || 11),
        personalBalance: Number(form.dependentBalance || 0),
        savingsGoal: {
          title: form.dependentGoalTitle || "New game",
          targetAmount: Number(form.dependentGoalTarget || 60),
          currentAmount: Number(form.dependentBalance || 0),
          categoryIcon: "🎮",
          notes: "Pocket money savings",
        },
      });
    }

    return {
      householdName: form.householdName.trim(),
      managerProfile: {
        fullName: form.fullName.trim(),
        phoneNumber: form.phone.trim(),
        age: Number(form.age || 25),
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
              accountNumber: form.phone.trim() || "+65 9000 0000",
              accountType: "wallet",
              balance: Number(form.payNowBalance || 0),
            }]
          : []),
      ],
      vouchers,
      dependents,
      gigProfile: isGig
        ? {
            platformName: "Lalamove / Grab",
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
    const isGig = form.persona === "gig";
    setSaving(true);
    try {
      const signup = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phoneNumber: form.phone,
          age: form.age,
          citizenship: form.citizenship,
          isPlatformWorker: isGig,
        }),
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
    const payload = buildPayload();
    const isGig = form.persona === "gig";
    const seedId = isGig ? "marcus_gig" : form.persona === "single" ? "alex_young_adult" : "tan_family";
    const state = getSeedStateForPersona(seedId);
    
    // Override state with user's actual entered data
    state.householdName = payload.householdName || "My Household";
    state.backendMode = "demo";
    state.bankAccounts = payload.accounts.map((acc, idx) => ({
      id: `acc-custom-${idx}`,
      bankName: acc.bankName,
      accountNumber: acc.accountNumber,
      accountType: acc.accountType as any,
      balance: acc.balance,
      lastSynced: "Just now",
    }));
    state.totalHouseholdBalance = payload.accounts.reduce((s, a) => s + a.balance, 0);
    state.members = [
      {
        id: "mem-self",
        name: payload.managerProfile.fullName || "User",
        role: "manager",
        age: payload.managerProfile.age,
        workerType: payload.managerProfile.employmentType as any,
        vehicleType: payload.managerProfile.vehicleType as any,
        personalBalance: state.totalHouseholdBalance,
        avatarText: (payload.managerProfile.fullName || "U").slice(0, 1).toUpperCase(),
      },
      ...payload.dependents.map((dep, idx) => ({
        id: `dep-custom-${idx}`,
        name: dep.name,
        role: "dependent" as const,
        age: dep.age,
        personalBalance: dep.personalBalance,
        avatarText: dep.name.slice(0, 1).toUpperCase(),
        savingsGoal: {
          id: `goal-custom-${idx}`,
          title: dep.savingsGoal.title,
          targetAmount: dep.savingsGoal.targetAmount,
          currentAmount: dep.savingsGoal.currentAmount,
          categoryIcon: dep.savingsGoal.categoryIcon,
        },
      })),
    ];
    
    if (payload.vouchers.length) {
      state.vouchers = payload.vouchers.map((v, idx) => ({
        id: `v-custom-${idx}`,
        name: v.name,
        category: v.category as any,
        totalGranted: v.totalGranted,
        balance: v.balance,
        expiryDate: v.expiryDate,
        daysRemaining: 12,
        description: v.description,
        acceptedMerchants: v.acceptedMerchants,
        isExpiringSoon: true,
      }));
    }

    saveState(state);
    localStorage.setItem("keepit_demo_mode", "true");
    document.cookie = "keepit_demo_mode=true; path=/; max-age=86400; SameSite=Lax";
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-[#EDE4D6] px-4 py-8 text-[#1B1815] font-sans">
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[32px] border border-[#D6C9B4] bg-[#FFFDF8] shadow-xl">
        {/* Header */}
        <div className="bg-[#0F4635] p-6 text-[#FBF6EC]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black font-display">KeepIt</div>
              <p className="mt-1 text-xs text-[#DDE8E1]">Create your personalized household ledger.</p>
            </div>
            <div className="rounded-full bg-[#E8A02C] px-3 py-1 font-mono-custom text-xs font-bold text-[#1B1815]">
              {step} / 4
            </div>
          </div>
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#0A3227]">
            <div className="h-full bg-[#E8A02C] transition-all" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          {/* Persona Autofill Quick Pills */}
          <div className="mb-6 pb-4 border-b border-[#EDE4D6] flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-[#8A8075] font-semibold">Quick Sample Autofill:</span>
            <div className="flex gap-1.5">
              <button 
                type="button" 
                onClick={() => autofillSample("single")} 
                className="px-2.5 py-1 rounded-lg bg-[#EDE4D6] hover:bg-[#D6C9B4] text-[11px] font-bold text-[#1B1815] transition"
              >
                Single Young Adult
              </button>
              <button 
                type="button" 
                onClick={() => autofillSample("gig")} 
                className="px-2.5 py-1 rounded-lg bg-[#EDE4D6] hover:bg-[#D6C9B4] text-[11px] font-bold text-[#1B1815] transition"
              >
                Platform Worker
              </button>
              <button 
                type="button" 
                onClick={() => autofillSample("manager")} 
                className="px-2.5 py-1 rounded-lg bg-[#EDE4D6] hover:bg-[#D6C9B4] text-[11px] font-bold text-[#1B1815] transition"
              >
                Family Household
              </button>
            </div>
          </div>

          {step === 1 && (
            <section className="space-y-4">
              <StepHeading title="Create your profile" detail="Enter your name, Singpass phone number and household account credentials." />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Full Name" placeholder="e.g. Alex Tan" value={form.fullName} onChange={(v) => update("fullName", v)} required />
                <Field label="Phone number" placeholder="+65 9123 4567" value={form.phone} onChange={(v) => update("phone", v)} required />
              </div>
              <Field label="Household Display Name" placeholder="e.g. Alex's Place" value={form.householdName} onChange={(v) => update("householdName", v)} required />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email" type="email" placeholder="name@example.com" value={form.email} onChange={(v) => update("email", v)} required />
                <Field label="Password (min 8 characters)" type="password" placeholder="••••••••" value={form.password} onChange={(v) => update("password", v)} required />
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <StepHeading title="Choose your profile type" detail="Tailors statutory Platform Workers Act 2025 calculations and household oversight." />
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  ["single", "Single Earner", "Young Adult"],
                  ["gig", "Platform Worker", "FEDA & WIS"],
                  ["manager", "Family Manager", "Multi-Member"],
                ].map(([id, title, detail]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => update("persona", id)}
                    className={`rounded-2xl border p-4 text-left transition ${
                      form.persona === id ? "border-[#0F4635] bg-[#DDE8E1] text-[#0F4635] shadow-xs" : "border-[#E0D4BF] bg-[#FFFDF8] hover:bg-[#F5F1E7]"
                    }`}
                  >
                    <div className="text-xs font-bold font-display">{title}</div>
                    <div className="text-[10px] text-[#6B6259] mt-0.5">{detail}</div>
                  </button>
                ))}
              </div>

              {form.persona === "gig" && (
                <div className="rounded-2xl border border-[#D6C9B4] bg-[#FBF6EC] p-4 space-y-3 animate-fadeIn">
                  <div className="text-xs font-bold text-[#0F4635]">Platform Worker 2025 Setup</div>
                  <label className="block text-xs font-semibold">
                    Delivery / Ride Vehicle Type
                    <select
                      value={form.vehicleType}
                      onChange={(e) => update("vehicleType", e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#D6C9B4] bg-white p-2.5 text-xs outline-none focus:border-[#0F4635]"
                    >
                      <option value="car_van_lorry">Car / Van / Lorry (60% FEDA deduction)</option>
                      <option value="motorcycle_pmd">Motorcycle / PMD (35% FEDA deduction)</option>
                      <option value="bicycle_walking_public">Bicycle / Walking (20% FEDA deduction)</option>
                    </select>
                  </label>
                  <Field label="Estimated weekly gross income (S$)" type="number" placeholder="850" value={form.weeklyGross} onChange={(v) => update("weeklyGross", v)} />
                </div>
              )}

              {form.persona === "manager" && (
                <div className="rounded-2xl border border-[#D6C9B4] bg-[#FBF6EC] p-4 space-y-3 animate-fadeIn">
                  <label className="flex items-center justify-between text-xs font-bold text-[#0F4635] cursor-pointer">
                    <span>Include dependent child (e.g. Jia Le)</span>
                    <input 
                      type="checkbox" 
                      checked={form.hasDependent} 
                      onChange={(e) => update("hasDependent", e.target.checked)} 
                      className="h-4 w-4 accent-[#0F4635]"
                    />
                  </label>
                  {form.hasDependent && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#EDE4D6]">
                      <Field label="Dependent Name" value={form.dependentName} onChange={(v) => update("dependentName", v)} />
                      <Field label="Starting Allowance (S$)" type="number" value={form.dependentBalance} onChange={(v) => update("dependentBalance", v)} />
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4">
              <StepHeading title="Add money sources" detail="Connect your primary bank account and optional digital wallets." />
              <div className="text-xs font-bold text-[#1B1815]">Select Primary Bank (SGFinDex)</div>
              <div className="grid grid-cols-4 gap-2">
                {["DBS", "OCBC", "UOB", "POSB"].map((bank) => (
                  <button 
                    key={bank} 
                    type="button" 
                    onClick={() => update("bank", bank)} 
                    className={`rounded-xl border p-3 text-xs font-bold transition ${
                      form.bank === bank ? "border-[#0F4635] bg-[#0F4635] text-white" : "border-[#E0D4BF] hover:bg-[#F5F1E7]"
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>
              <Field label="Starting bank balance (S$)" type="number" placeholder="e.g. 3420" value={form.startingBalance} onChange={(v) => update("startingBalance", v)} required />
              
              <label className="flex items-center justify-between rounded-2xl border border-[#E0D4BF] bg-[#FBF6EC] p-4 text-sm font-semibold cursor-pointer">
                <span>Include PayNow / PayLah! wallet</span>
                <input type="checkbox" checked={form.includePayNow} onChange={(e) => update("includePayNow", e.target.checked)} className="h-4 w-4 accent-[#0F4635]" />
              </label>
              {form.includePayNow && <Field label="Wallet balance (S$)" type="number" placeholder="e.g. 240" value={form.payNowBalance} onChange={(v) => update("payNowBalance", v)} />}
            </section>
          )}

          {step === 4 && (
            <section className="space-y-4">
              <StepHeading 
                title="Add & Sync Government Vouchers" 
                detail="Follow the Gov.sg RedeemSG workflow to link and automatically sync your live unspent voucher balances." 
              />

              {/* 1. CDC Vouchers */}
              <div className={`rounded-2xl border transition p-4 space-y-3 ${form.claimCdc ? "border-[#0F4635] bg-[#FFFDF8] shadow-xs" : "border-[#E0D4BF] bg-[#FBF6EC]"}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0F4635] text-[#FBF6EC] flex items-center justify-center font-bold text-xs">
                      CDC
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1B1815]">CDC Vouchers 2026</div>
                      <div className="text-xs text-[#6B6259]">Supermarket (S$250) + Heartland Hawkers (S$250)</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={form.claimCdc} 
                    onChange={(e) => update("claimCdc", e.target.checked)} 
                    className="h-4 w-4 accent-[#0F4635]" 
                  />
                </label>

                {form.claimCdc && (
                  <div className="pt-3 border-t border-[#EDE4D6] space-y-2.5 text-xs animate-fadeIn">
                    <div className="flex items-center justify-between text-[#0F4635] font-semibold">
                      <span>Step 1: Get official Gov.sg SMS</span>
                      <a 
                        href="https://vouchers.cdc.gov.sg" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-[11px] underline hover:text-[#0A3227]"
                      >
                        Claim on go.gov.sg/cdc <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div>
                      <span className="font-semibold text-[#1B1815]">Step 2: Paste Gov.sg SMS Claim Link</span>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="url"
                          placeholder="https://voucher.redeem.gov.sg/claim/cdc-xxxx"
                          value={form.cdcSmsLink}
                          onChange={(e) => update("cdcSmsLink", e.target.value)}
                          className="flex-1 rounded-xl border border-[#D6C9B4] bg-white p-2 text-xs outline-none focus:border-[#0F4635]"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifySmsLink("cdc")}
                          disabled={syncingVoucher === "cdc"}
                          className="px-3 py-2 rounded-xl bg-[#0F4635] text-[#FBF6EC] font-bold text-xs flex items-center gap-1 shrink-0 hover:bg-[#0A3227] disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingVoucher === "cdc" ? "animate-spin" : ""}`} />
                          <span>{form.cdcVerified ? "Re-sync" : "Verify & Sync"}</span>
                        </button>
                      </div>
                    </div>

                    {form.cdcVerified && (
                      <div className="p-2.5 rounded-xl bg-[#DDE8E1] text-[#0F4635] flex items-center justify-between font-semibold animate-fadeIn">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0F4635]" /> RedeemSG Balance Synced:
                        </span>
                        <span className="font-display font-black text-sm">S${form.cdcVerifiedBalance}.00</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Climate Vouchers */}
              <div className={`rounded-2xl border transition p-4 space-y-3 ${form.claimClimate ? "border-[#0F4635] bg-[#FFFDF8] shadow-xs" : "border-[#E0D4BF] bg-[#FBF6EC]"}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0F4635] text-[#FBF6EC] flex items-center justify-center font-bold text-xs">
                      CFH
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1B1815]">Climate Vouchers (S$300)</div>
                      <div className="text-xs text-[#6B6259]">Energy & water-saving appliances (Courts, Best Denki, Gain City)</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={form.claimClimate} 
                    onChange={(e) => update("claimClimate", e.target.checked)} 
                    className="h-4 w-4 accent-[#0F4635]" 
                  />
                </label>

                {form.claimClimate && (
                  <div className="pt-3 border-t border-[#EDE4D6] space-y-2.5 text-xs animate-fadeIn">
                    <div className="flex items-center justify-between text-[#0F4635] font-semibold">
                      <span>Step 1: Get official Gov.sg SMS</span>
                      <a 
                        href="https://climate-friendly-households.gov.sg" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-[11px] underline hover:text-[#0A3227]"
                      >
                        Claim on go.gov.sg/climate <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div>
                      <span className="font-semibold text-[#1B1815]">Step 2: Paste Gov.sg SMS Claim Link</span>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="url"
                          placeholder="https://voucher.redeem.gov.sg/claim/climate-xxxx"
                          value={form.climateSmsLink}
                          onChange={(e) => update("climateSmsLink", e.target.value)}
                          className="flex-1 rounded-xl border border-[#D6C9B4] bg-white p-2 text-xs outline-none focus:border-[#0F4635]"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifySmsLink("climate")}
                          disabled={syncingVoucher === "climate"}
                          className="px-3 py-2 rounded-xl bg-[#0F4635] text-[#FBF6EC] font-bold text-xs flex items-center gap-1 shrink-0 hover:bg-[#0A3227] disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingVoucher === "climate" ? "animate-spin" : ""}`} />
                          <span>{form.climateVerified ? "Re-sync" : "Verify & Sync"}</span>
                        </button>
                      </div>
                    </div>

                    {form.climateVerified && (
                      <div className="p-2.5 rounded-xl bg-[#DDE8E1] text-[#0F4635] flex items-center justify-between font-semibold animate-fadeIn">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0F4635]" /> RedeemSG Balance Synced:
                        </span>
                        <span className="font-display font-black text-sm">S${form.climateVerifiedBalance}.00</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. SG60 Community Vouchers */}
              <div className={`rounded-2xl border transition p-4 space-y-3 ${form.claimSg60 ? "border-[#0F4635] bg-[#FFFDF8] shadow-xs" : "border-[#E0D4BF] bg-[#FBF6EC]"}`}>
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#0F4635] text-[#FBF6EC] flex items-center justify-center font-bold text-xs">
                      SG60
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#1B1815]">SG60 Community Vouchers (S$300)</div>
                      <div className="text-xs text-[#6B6259]">Heartland merchants, traditional coffee shops & clinics</div>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={form.claimSg60} 
                    onChange={(e) => update("claimSg60", e.target.checked)} 
                    className="h-4 w-4 accent-[#0F4635]" 
                  />
                </label>

                {form.claimSg60 && (
                  <div className="pt-3 border-t border-[#EDE4D6] space-y-2.5 text-xs animate-fadeIn">
                    <div className="flex items-center justify-between text-[#0F4635] font-semibold">
                      <span>Step 1: Get official Gov.sg SMS</span>
                      <a 
                        href="https://gov.sg" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-1 text-[11px] underline hover:text-[#0A3227]"
                      >
                        Claim on go.gov.sg/sg60 <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div>
                      <span className="font-semibold text-[#1B1815]">Step 2: Paste Gov.sg SMS Claim Link</span>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="url"
                          placeholder="https://voucher.redeem.gov.sg/claim/sg60-xxxx"
                          value={form.sg60SmsLink}
                          onChange={(e) => update("sg60SmsLink", e.target.value)}
                          className="flex-1 rounded-xl border border-[#D6C9B4] bg-white p-2 text-xs outline-none focus:border-[#0F4635]"
                        />
                        <button
                          type="button"
                          onClick={() => handleVerifySmsLink("sg60")}
                          disabled={syncingVoucher === "sg60"}
                          className="px-3 py-2 rounded-xl bg-[#0F4635] text-[#FBF6EC] font-bold text-xs flex items-center gap-1 shrink-0 hover:bg-[#0A3227] disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingVoucher === "sg60" ? "animate-spin" : ""}`} />
                          <span>{form.sg60Verified ? "Re-sync" : "Verify & Sync"}</span>
                        </button>
                      </div>
                    </div>

                    {form.sg60Verified && (
                      <div className="p-2.5 rounded-xl bg-[#DDE8E1] text-[#0F4635] flex items-center justify-between font-semibold animate-fadeIn">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#0F4635]" /> RedeemSG Balance Synced:
                        </span>
                        <span className="font-display font-black text-sm">S${form.sg60VerifiedBalance}.00</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-[#DDE8E1] p-4 text-xs text-[#0F4635]">
                <ShieldCheck className="mr-1 inline h-4 w-4" /> Live mode connects to Supabase database. Demo fallback runs instantly in this browser.
              </div>
            </section>
          )}

          {(error || message) && (
            <div className={`mt-5 rounded-xl p-3 text-sm ${error ? "bg-[#FAE3DD] text-[#8F2A17]" : "bg-[#DDE8E1] text-[#0F4635]"}`}>
              {error || message}
            </div>
          )}

          <div className="mt-7 flex items-center justify-between gap-3">
            {step > 1 ? (
              <button 
                type="button" 
                onClick={() => setStep((value) => value - 1)} 
                className="flex items-center gap-1 rounded-xl border border-[#D6C9B4] px-4 py-3 text-xs font-bold hover:bg-[#F5F1E7] transition"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <Link href="/login" className="text-xs font-bold text-[#0F4635] underline">Already registered?</Link>
            )}

            {step < 4 ? (
              <button 
                type="button" 
                disabled={!canContinue} 
                onClick={() => setStep((value) => value + 1)} 
                className="ml-auto flex items-center gap-1 rounded-xl bg-[#0F4635] px-5 py-3 text-xs font-bold text-white disabled:opacity-40 hover:bg-[#0A3227] transition"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="ml-auto flex gap-2">
                <button 
                  type="button" 
                  onClick={launchDemo} 
                  className="rounded-xl border border-[#0F4635] px-4 py-3 text-xs font-bold text-[#0F4635] hover:bg-[#DDE8E1] transition"
                >
                  <Sparkles className="mr-1 inline h-4 w-4" /> Demo fallback
                </button>
                <button 
                  type="button" 
                  disabled={saving} 
                  onClick={registerWithBackend} 
                  className="rounded-xl bg-[#0F4635] px-5 py-3 text-xs font-bold text-white disabled:opacity-50 hover:bg-[#0A3227] transition"
                >
                  {saving ? "Creating…" : "Create household"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StepHeading({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-bold font-display text-[#1B1815]">{title}</h2>
      <p className="mt-1 text-xs text-[#6B6259]">{detail}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-bold text-[#1B1815]">
      {label}
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-[#D6C9B4] bg-white p-3 text-sm font-normal text-[#1B1815] outline-none transition focus:border-[#0F4635]"
      />
    </label>
  );
}
