import React from "react";
import { ShieldCheck, Truck, Clock, Award, CheckCircle2, ChevronRight, FileCheck2, Building2, Play } from "lucide-react";

interface TrustMetricsBarProps {
  onOpenCertifications?: () => void;
  onOpenLocations?: () => void;
  onWatchVideo?: () => void;
}

export default function TrustMetricsBar({ onOpenCertifications, onOpenLocations, onWatchVideo }: TrustMetricsBarProps) {
  const metrics = [
    {
      label: "3,385+ Certified SKUs",
      sublabel: "IS / IEC / CE & CPRI Tested",
      detail: "Complete LT/HT, Solar & Switchgear catalog",
      icon: ShieldCheck,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-400/10",
      border: "hover:border-amber-400/50",
    },
    {
      label: "28 States Pan-India",
      sublabel: "12–48h Dispatch Corridors",
      detail: "Direct warehouse delivery to project sites",
      icon: Truck,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10 dark:bg-sky-400/10",
      border: "hover:border-sky-400/50",
    },
    {
      label: "< 2 Hours Turnaround",
      sublabel: "B2B Project RFQ Desk",
      detail: "Dedicated electrical engineers for BOM review",
      icon: Clock,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
      border: "hover:border-emerald-400/50",
    },
    {
      label: "40+ Years Heritage",
      sublabel: "Ahmedabad Central Supply Hub",
      detail: "Trusted by top EPCs & government contractors",
      icon: Award,
      color: "text-[#c56718] dark:text-amber-400",
      bg: "bg-orange-500/10 dark:bg-orange-400/10",
      border: "hover:border-orange-400/50",
    },
  ];

  return (
    <div className="w-full py-8 border-y border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-[#08131e] dark:via-[#0c1a29] dark:to-[#08131e]">
      <div className="market-container">
        {/* Live Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wide">
              LIVE DISPATCH HUB · AHMEDABAD WAREHOUSE ACTIVE
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {onWatchVideo && (
              <button
                type="button"
                onClick={onWatchVideo}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-[#c56718] dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
              >
                <Play className="size-3 fill-current" />
                <span>Watch Tour</span>
              </button>
            )}
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              100% Genuine Conductor Purity (MTC Assured)
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Building2 className="size-3.5 text-[#c56718] dark:text-amber-400" />
              Pan-India EPC Logistics
            </span>
          </div>
        </div>

        {/* 4 Interactive Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`group relative p-4.5 rounded-2xl bg-white dark:bg-[#0c2235] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md ${item.border} hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`size-11 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="size-5.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <strong className="block text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {item.label}
                    </strong>
                    <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
                      {item.sublabel}
                    </span>
                    <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-1 line-clamp-1">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Video Showcase Banner */}
        {onWatchVideo && (
          <div className="mt-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0e2439] to-slate-900 border border-amber-500/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full md:w-auto">
              <div
                className="relative size-14 sm:size-16 rounded-xl overflow-hidden bg-black shrink-0 border border-amber-400/40 shadow-sm cursor-pointer group"
                onClick={onWatchVideo}
                title="Click to watch full video tour"
              >
                <video
                  src="/videos/volamp-reel.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                  <Play className="size-5 text-amber-400 fill-amber-400" />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Operations Reel
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Facility Video
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mt-1">
                  Take a 60-Second Video Tour of Volamp's Central Fulfillment Hub
                </h4>
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                  See direct factory drum unloading, automated quality inspection, and heavy fleet dispatch across 28 states.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onWatchVideo}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#c56718] hover:from-amber-400 hover:to-amber-600 text-slate-950 font-extrabold text-xs transition-all shadow-md hover:shadow-amber-500/20 shrink-0 cursor-pointer"
            >
              <Play className="size-3.5 fill-current" />
              <span>Watch Facility Tour</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
