import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KeepIt | Singapore Household Finance & Scheme Tracker",
  description: "One unified household ledger with government voucher tracking, gig income resilience, and contextual literacy nudges.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070b10] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
