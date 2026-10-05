import React from "react";
import { AlertTriangle, ArrowRight, X, Layers, CheckCircle2 } from "lucide-react";
import { useCompare } from "@/contexts/CompareContext";
import { Button } from "@/components/ui/button";

export function CategoryMismatchModal() {
  const {
    compareCategory,
    pendingMismatchProduct,
    setPendingMismatchProduct,
    switchCategoryAndAdd,
  } = useCompare();

  if (!pendingMismatchProduct) return null;

  const handleSwitch = () => {
    switchCategoryAndAdd(pendingMismatchProduct);
  };

  const handleCancel = () => {
    setPendingMismatchProduct(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={handleCancel}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Warning Icon */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
                Category Mismatch
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif] leading-snug">
                Compare Only Same Category
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Explanation */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          Product comparison requires items from the <strong>same technical category</strong> so engineering specifications (such as Cores, Voltage Grade, Armouring, or Stud Size) align accurately.
        </p>

        {/* Comparison Details Box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Current Shortlist:</span>
            <span className="px-2 py-0.5 rounded-full font-bold bg-[#1d73b7]/10 text-[#1d73b7] dark:text-sky-400">
              {compareCategory}
            </span>
          </div>

          <div className="flex items-center gap-2 justify-center text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Cannot mix with</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Selected Product:</span>
            <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
              {pendingMismatchProduct.category}
            </span>
          </div>

          <div className="pt-1 text-slate-700 dark:text-slate-200 font-semibold text-xs border-t border-slate-200 dark:border-slate-700/60">
            {pendingMismatchProduct.name}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Keep Current ({compareCategory})
          </button>
          <button
            type="button"
            onClick={handleSwitch}
            className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-[#1d73b7] hover:bg-[#165a91] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>Switch to {pendingMismatchProduct.category}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
