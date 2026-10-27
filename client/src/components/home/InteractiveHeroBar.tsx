import React from "react";
import { FileText, Zap, Calculator, PackageSearch, ArrowRight, Sparkles, TrendingUp } from "lucide-react";

interface InteractiveHeroBarProps {
  onQuote: () => void;
  onQuickOrder: () => void;
  onOpenCalculator: () => void;
  onTrackOrder: () => void;
  onSelectSearchTag?: (tag: string) => void;
}

export default function InteractiveHeroBar({
  onQuote,
  onQuickOrder,
  onOpenCalculator,
  onTrackOrder,
  onSelectSearchTag,
}: InteractiveHeroBarProps) {
  const trendingTags = [
    "1.1kV XLPE Armoured",
    "10kA C-Curve MCB",
    "4 sqmm Solar DC Cable",
    "Copper Lugs 185 sqmm",
    "FR/FRLS House Wire",
    "Double Compression Glands",
    "Submersible Flat 3C",
  ];

  const actionCards = [
    {
      title: "Project Quote Desk",
      subtitle: "Instant wholesale B2B pricing",
      badge: "Turnaround < 2h",
      icon: FileText,
      accent: "from-amber-500/10 to-orange-500/10 text-[#c56718] dark:text-amber-400 border-amber-300/60 dark:border-amber-500/30",
      btnText: "Request RFQ",
      onClick: onQuote,
    },
    {
      title: "Express WhatsApp Order",
      subtitle: "Send PO or cable list directly",
      badge: "Same-Day Dispatch",
      icon: Zap,
      accent: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300/60 dark:border-emerald-500/30",
      btnText: "Quick Order",
      onClick: onQuickOrder,
    },
    {
      title: "Cable Sizing & Sizer",
      subtitle: "Calculate drop, amps & conductor size",
      badge: "IS:7098 Compliant",
      icon: Calculator,
      accent: "from-blue-500/10 to-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-300/60 dark:border-sky-500/30",
      btnText: "Open Sizer",
      onClick: onOpenCalculator,
    },
    {
      title: "Live Order Tracking",
      subtitle: "Check consignment & LR status",
      badge: "Pan-India 28 States",
      icon: PackageSearch,
      accent: "from-purple-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-300/60 dark:border-indigo-500/30",
      btnText: "Track Now",
      onClick: onTrackOrder,
    },
  ];

  return (
    <div className="w-full mt-4 sm:mt-6 mb-8">
      {/* 4 Interactive Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {actionCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.title}
              type="button"
              onClick={card.onClick}
              className={`group text-left p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#0c2235] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative overflow-hidden cursor-pointer flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between gap-2 w-full mb-3">
                <div
                  className={`size-10 sm:size-11 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center border group-hover:scale-110 transition-transform duration-200`}
                >
                  <Icon className="size-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {card.badge}
                </span>
              </div>

              <div>
                <strong className="block text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#c56718] dark:group-hover:text-amber-400 transition-colors">
                  {card.title}
                </strong>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {card.subtitle}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-[#c56718] dark:text-amber-400">
                <span>{card.btnText}</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Trending Search Tags Bar */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 shrink-0">
          <TrendingUp className="size-3.5 text-[#c56718] dark:text-amber-400" />
          <span>Trending Contractor Searches:</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {trendingTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectSearchTag?.(tag)}
              className="px-2.5 py-1 rounded-lg bg-white/90 dark:bg-[#0c2235]/90 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:border-[#c56718] hover:text-[#c56718] dark:hover:border-amber-400 dark:hover:text-amber-400 hover:shadow-xs transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
