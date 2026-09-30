import React from "react";
import { Link, useLocation } from "wouter";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import ProjectTilesDirectory from "@/components/footprint/ProjectTilesDirectory";
import {
  ArrowRight,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  Download,
  ExternalLink,
  Factory,
  Globe2,
  HardHat,
  Headphones,
  Landmark,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Truck,
  Zap,
} from "lucide-react";

export default function WhereVolampContributed() {
  const [, navigate] = useLocation();

  const handleOpenRFQ = () => {
    window.dispatchEvent(
      new CustomEvent("volamp:open-enquire", {
        detail: {
          category: "Turnkey Project Sourcing",
          product: "Landmark Project Engineering Supply",
        },
      })
    );
  };

  return (
    <div className="volamp-marketplace min-h-screen bg-[#faf7f3] dark:bg-[#0c1520] text-[#3d2b2d] dark:text-[#f5f7f9] flex flex-col font-sans transition-colors">
      {/* 1. Universal Top Header (Warm Sand Utility Strip + Clean White Navbar) */}
      <UniversalHeader currentPage="about" />

      {/* 2. Breadcrumb */}
      <div className="market-container py-3 text-xs text-[#71818c] dark:text-slate-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#4d1217] dark:hover:text-amber-300">
          Home
        </Link>
        <span className="text-stone-400">/</span>
        <Link href="/about-volamp" className="hover:text-[#4d1217] dark:hover:text-amber-300">
          About Volamp
        </Link>
        <span className="text-stone-400">/</span>
        <span className="font-semibold text-[#4d1217] dark:text-white">
          Where Volamp Contributed
        </span>
      </div>

      {/* 3. Visual Hero Section (Warm Sandstone & Gold Theme) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff6ed] via-[#fffaf5] to-[#fcfaf7] dark:from-[#0f1f30] dark:via-[#0b1723] dark:to-[#081018] py-8 sm:py-14 border-b border-[#ebd7c7] dark:border-slate-800">
        <div className="market-container">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[#c25e0a] dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="size-3.5" />
                <span>Nation-Building Infrastructure · 28 States & UTs</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white tracking-tight leading-tight">
                Where Volamp <span className="text-[#c56718] dark:text-amber-400">Contributed</span>
              </h1>

              <p className="text-sm sm:text-base text-[#5d4a4b] dark:text-slate-300 font-['DM_Sans'] leading-relaxed">
                Four generations of heavy electrical transmission, flame-retardant low-smoke cabling, hazardous-area certified cable glands, and copper earthing networks powering iconic infrastructure across India. Explore our verified real-world installations below.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#projects-directory"
                  className="inline-flex items-center gap-2 bg-[#c56718] hover:bg-[#b45309] text-white px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all"
                >
                  <span>Explore 46+ Landmark Sites</span>
                  <ArrowRight className="size-4" />
                </a>

                <Link
                  href="/about-volamp#footprint"
                  className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 text-[#4d1217] dark:text-white hover:border-[#c56718] px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-all"
                >
                  <Globe2 className="size-4 text-[#c56718]" />
                  <span>Interactive 3D Globe</span>
                </Link>

                <button
                  type="button"
                  onClick={handleOpenRFQ}
                  className="inline-flex items-center gap-2 bg-[#f7ede6] hover:bg-[#ebd4c2] text-[#4d1217] border border-[#ebd4c2] px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  <Zap className="size-4 text-[#c56718]" />
                  <span>Request Project RFQ</span>
                </button>
              </div>
            </div>

            {/* Visual Metrics Badges (Matching Business Segments Warm Styling) */}
            <div className="grid grid-cols-2 gap-3 shrink-0 w-full lg:w-80">
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
                <span className="block text-2xl sm:text-3xl font-bold text-[#c56718] dark:text-amber-400 font-['Space_Grotesk']">
                  46+
                </span>
                <strong className="text-xs font-bold text-[#4d1217] dark:text-white block mt-0.5">
                  Landmark Projects
                </strong>
                <small className="text-[11px] text-slate-500">Airports, Refineries, Temples</small>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
                <span className="block text-2xl sm:text-3xl font-bold text-[#c56718] dark:text-amber-400 font-['Space_Grotesk']">
                  28
                </span>
                <strong className="text-xs font-bold text-[#4d1217] dark:text-white block mt-0.5">
                  States & UTs
                </strong>
                <small className="text-[11px] text-slate-500">Pan-India Footprint</small>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
                <span className="block text-2xl sm:text-3xl font-bold text-[#c56718] dark:text-amber-400 font-['Space_Grotesk']">
                  300+ km
                </span>
                <strong className="text-xs font-bold text-[#4d1217] dark:text-white block mt-0.5">
                  Solar & HT Feeds
                </strong>
                <small className="text-[11px] text-slate-500">Grid Interties & Parks</small>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
                <span className="block text-2xl sm:text-3xl font-bold text-[#c56718] dark:text-amber-400 font-['Space_Grotesk']">
                  100%
                </span>
                <strong className="text-xs font-bold text-[#4d1217] dark:text-white block mt-0.5">
                  MTC Certified
                </strong>
                <small className="text-[11px] text-slate-500">Mill Test Traceability</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Main Interactive Projects Directory */}
      <main id="projects-directory" className="flex-1 market-container py-10 w-full">
        <ProjectTilesDirectory showHeader={true} />
      </main>

      {/* 5. Corporate Supply Assurance Strip */}
      <section className="bg-white dark:bg-slate-900 border-t border-[#ebd7c7] dark:border-slate-800 py-12">
        <div className="market-container">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#c25e0a] dark:text-amber-400">
              PROCUREMENT BENCHMARKS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#4d1217] dark:text-white font-['Space_Grotesk'] mt-1">
              Engineered for Critical Infrastructure
            </h2>
            <p className="text-[#5d4a4b] dark:text-slate-400 text-xs sm:text-sm mt-2">
              Every shipment leaving our Ahmedabad depot carries complete manufacturing traceability, batch testing, and certified third-party acceptance protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-[#fffaf5] dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
              <ShieldCheck className="size-7 text-[#c56718] mb-3" />
              <h3 className="text-sm font-bold text-[#4d1217] dark:text-white mb-1.5">
                Authentic MTC & Specification Clarity
              </h3>
              <p className="text-xs text-[#5d4a4b] dark:text-slate-300 leading-relaxed">
                Authentic Mill Test Certificates (MTC), CPRI / ERDA type test reports, and complete metallurgical analysis provided for every reel and panel.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#fffaf5] dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
              <Truck className="size-7 text-[#c56718] mb-3" />
              <h3 className="text-sm font-bold text-[#4d1217] dark:text-white mb-1.5">
                24-48 Hour Pan-India Dispatch
              </h3>
              <p className="text-xs text-[#5d4a4b] dark:text-slate-300 leading-relaxed">
                Direct dispatch from our central Ahmedabad inventory hub across 28 states, high-altitude border airfields, and maritime port zones.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-[#fffaf5] dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
              <Headphones className="size-7 text-[#c56718] mb-3" />
              <h3 className="text-sm font-bold text-[#4d1217] dark:text-white mb-1.5">
                Dedicated Technical Engineering Desk
              </h3>
              <p className="text-xs text-[#5d4a4b] dark:text-slate-300 leading-relaxed">
                Direct consultation with experienced electrical engineers on cable sizing, voltage drop mitigation, short-circuit withstand, and hazardous-area compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
