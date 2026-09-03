"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Sign in failed.");

      const pendingRaw = localStorage.getItem("keepit_pending_onboarding");
      if (pendingRaw) {
        const onboarding = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: pendingRaw,
        });
        const onboardingBody = await onboarding.json();
        if (!onboarding.ok && onboarding.status !== 409) {
          throw new Error(onboardingBody.error || "Signed in, but household setup failed.");
        }
        localStorage.removeItem("keepit_pending_onboarding");
      }
      localStorage.removeItem("keepit_demo_mode");
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EDE4D6] p-4 text-[#1B1815]">
      <form onSubmit={login} className="w-full max-w-md rounded-[30px] border border-[#D6C9B4] bg-[#FFFDF8] p-7 shadow-xl">
        <div className="mb-6"><div className="text-2xl font-black text-[#0F4635]">KeepIt</div><h1 className="mt-4 text-xl font-black">Welcome back</h1><p className="mt-1 text-sm text-[#6B6259]">Sign in to load your household from the backend.</p></div>
        <label className="block text-xs font-bold">Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#D6C9B4] bg-white p-3 text-sm outline-none focus:border-[#0F4635]" /></label>
        <label className="mt-4 block text-xs font-bold">Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[#D6C9B4] bg-white p-3 text-sm outline-none focus:border-[#0F4635]" /></label>
        {error && <div className="mt-4 rounded-xl bg-[#FAE3DD] p-3 text-xs text-[#8F2A17]">{error}</div>}
        <button disabled={loading} className="mt-5 w-full rounded-xl bg-[#0F4635] py-3 text-sm font-bold text-white disabled:opacity-50">{loading ? "Signing in…" : "Sign in"}</button>
        <div className="mt-5 flex justify-between text-xs"><Link href="/register" className="font-bold text-[#0F4635] underline">Create account</Link><Link href="/register" className="text-[#6B6259]">Use demo fallback</Link></div>
      </form>
    </main>
  );
}
