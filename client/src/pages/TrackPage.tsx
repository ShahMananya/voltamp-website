import React from "react";
import { Link } from "wouter";
import { Truck } from "lucide-react";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import LogisticsDashboardView from "@/components/track/LogisticsDashboardView";

export default function TrackPage() {
  // Parse order ID from URL query if present (e.g. /track?id=639081 or /track?id=ORD-IND-5412)
  const initialParam =
    new URLSearchParams(window.location.search).get("id") ||
    new URLSearchParams(window.location.search).get("order") ||
    "";

  return (
    <div className="volamp-marketplace min-h-screen bg-[#faf7f3] text-[#3d2b2d] flex flex-col font-sans">
      {/* Universal Clean Header */}
      <UniversalHeader currentPage="track" />

      {/* Breadcrumb Bar */}
      <div className="market-container py-3 text-xs text-[#71818c] flex items-center gap-1.5 border-b border-[#ebd7c7]">
        <Link href="/" className="hover:text-[#4d1217]">
          Home
        </Link>
        <span className="text-stone-400">/</span>
        <span className="font-semibold text-[#4d1217]">Track My Order</span>
      </div>

      {/* Hero Header Section */}
      <section className="bg-gradient-to-b from-[#fbf8f5] to-[#faf7f3] border-b border-[#ebd7c7] py-8 sm:py-10">
        <div className="market-container text-center max-w-3xl space-y-3">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center justify-center bg-white px-3 py-1.5 rounded-xl border border-[#ebd7c7] shadow-xs">
              <img src="/volamp-logo.png" alt="VOLAMP Elektrikals" className="h-7 sm:h-8 w-auto object-contain" />
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f7ede6] border border-[#ebd4c2] shadow-xs text-xs font-bold text-[#c25e0a] uppercase tracking-wider">
              <Truck className="size-3.5 text-[#c56718]" />
              <span>LIVE LOGISTICS & CONSIGNMENT TRACKING</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-['Space_Grotesk'] text-[#4d1217] tracking-tight">
            Track Your <span className="text-[#c56718]">VOLAMP</span> Consignment
          </h1>

          <p className="text-xs sm:text-sm text-[#5d4a4b] max-w-xl mx-auto leading-relaxed">
            Real-time GPS transit monitoring, carrier LR dockets, and verified Material Test Certificate ( MTC ) clearance direct from Ahmedabad Central Depot.
          </p>
        </div>
      </section>

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto flex flex-col overflow-hidden p-2 sm:p-4 lg:p-6 pb-12">
        <div className="flex-1 w-full h-full min-h-[720px]">
          <LogisticsDashboardView initialOrderId={initialParam} isModal={false} />
        </div>
      </main>

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
