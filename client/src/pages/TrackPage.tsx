import React from "react";
import { Link, useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowLeft, PhoneCall, MessageCircle } from "lucide-react";
import LogisticsDashboardView from "@/components/track/LogisticsDashboardView";

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="VOLAMP home">
      <img src="/volamp-logo.png" alt="VOLAMP Powering Growth" className="h-8 w-auto object-contain" />
    </div>
  );
}

export default function TrackPage() {
  // Parse order ID from URL query if present (e.g. /track?id=639081 or /track?id=ORD-IND-5412)
  const initialParam =
    new URLSearchParams(window.location.search).get("id") ||
    new URLSearchParams(window.location.search).get("order") ||
    "";

  return (
    <div className="min-h-screen bg-[#edf0f5] text-slate-900 flex flex-col p-2 sm:p-4 lg:p-6 font-sans">
      {/* Top Header Bar */}
      <header className="max-w-[1400px] w-full mx-auto flex items-center justify-between gap-4 mb-4 px-2">
        <div className="flex items-center gap-4">
          <Link href="/">
            <BrandMark />
          </Link>
          <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-slate-400 border-l border-slate-300 pl-4">
            Live Fleet & Consignment Tracking
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/919512365582?text=Hello%20VOLAMP%20Logistics%20Desk%2C%20inquiring%20about%20my%20consignment"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <MessageCircle className="size-3.5" />
            <span>Dispatch Desk</span>
          </a>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-sm border border-slate-200 transition-colors"
          >
            <ArrowLeft className="size-3.5 text-[#e05244]" />
            <span>Back to Store</span>
          </Link>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col overflow-hidden pb-4">
        <div className="flex-1 w-full h-full min-h-[720px]">
          <LogisticsDashboardView initialOrderId={initialParam} isModal={false} />
        </div>
      </main>
    </div>
  );
}
