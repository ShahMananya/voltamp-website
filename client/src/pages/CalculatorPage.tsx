import React, { useState } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Calculator,
  PhoneCall,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import CableCalculatorModal from "@/components/calculator/CableCalculatorModal";

export default function CalculatorPage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#2c1d1f] font-['Inter',sans-serif] flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#ebd8ca]">
        <div className="market-container flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#4d1217] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-stone-100"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Marketplace</span>
            </Link>

            <div className="h-5 w-px bg-stone-200 hidden sm:block" />

            <Link href="/" className="flex items-center gap-2">
              <img
                src="/volamp-logo.png"
                alt="VOLAMP Elektrikals"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:+919512365582"
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#c25e0a] text-xs font-bold hover:bg-orange-100 transition-colors"
            >
              <PhoneCall className="size-3.5" />
              <span>Accounts Desk: +91 9512365582</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#f7ede6] via-[#fbf8f5] to-[#fbf9f6] border-b border-[#ebd7c7] py-12 sm:py-16">
          <div className="market-container max-w-4xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5d2c2] shadow-sm text-xs font-bold text-[#c25e0a] uppercase tracking-wider">
              <Calculator className="size-3.5 text-[#ef7d19]" />
              <span>ONLINE ELECTRICAL ESTIMATION DESK</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#4d1217] font-['Space_Grotesk'] leading-tight">
              Electrical Cable & Project Cost Estimator
            </h1>

            <p className="text-sm sm:text-base text-[#5d4a4b] max-w-2xl mx-auto leading-relaxed">
              Calculate indicative project budgets, conductor sizes, contractor volume discounts, and 18% GST for high-grade industrial cables (Polycab, Finolex, KEI, Havells, Volamp OEM).
            </p>

            <div className="pt-2">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ef7d19] to-[#ea580c] text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:brightness-105 active:brightness-95 transition-all"
              >
                <Calculator className="size-4" />
                <span>Launch Interactive Cable Calculator</span>
              </button>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="market-container max-w-5xl py-14 sm:py-20 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#c25e0a] uppercase tracking-wider">
              POWERFUL FEATURES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#4d1217] font-['Space_Grotesk']">
              Engineered for Electrical Contractors & Procurement Heads
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-[#ebd7c7] shadow-sm space-y-3">
              <div className="size-11 rounded-xl bg-orange-50 text-[#ef7d19] border border-orange-200 flex items-center justify-center">
                <FileSpreadsheet className="size-5" />
              </div>
              <h3 className="font-bold text-[#4d1217] text-base font-['Space_Grotesk']">
                Live Factory Price Indexes
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Reflects approved wholesale discount slabs across Polycab, Finolex, KEI, Havells, and RR Kabel with transparent 18% GST breakdowns.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#ebd7c7] shadow-sm space-y-3">
              <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="font-bold text-[#4d1217] text-base font-['Space_Grotesk']">
                Conductor Load Sizing
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Input your electrical load in kW or HP (415V 3-phase or 230V 1-phase) to receive exact recommended cable cross-sections and continuous current ratings.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-[#ebd7c7] shadow-sm space-y-3">
              <div className="size-11 rounded-xl bg-amber-50 text-[#c25e0a] border border-amber-200 flex items-center justify-center">
                <Sparkles className="size-5" />
              </div>
              <h3 className="font-bold text-[#4d1217] text-base font-['Space_Grotesk']">
                One-Click Quotation & WhatsApp
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Export calculated estimates directly to an official Volamp RFQ or dispatch a pre-formatted Bill of Materials directly on WhatsApp.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="market-container footer-bottom">
          <span>Volamp Elektrikals © 2026. All rights reserved.</span>
          <span>Official Billing & Accounts Helpdesk: +91 9512365582</span>
        </div>
      </footer>

      {/* Embedded Calculator Modal */}
      <CableCalculatorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onQuote={(text) => {
          // If redirected, open inquiry desk
          window.location.href = `/?quote=true&prefill=${encodeURIComponent(text ?? "")}`;
        }}
      />
    </div>
  );
}
