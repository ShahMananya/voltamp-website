import React, { useState } from "react";
import { Scale, X, Trash2, ArrowRight, ChevronUp, ChevronDown, Check, Plus } from "lucide-react";
import { useCompare, CompareProduct } from "@/contexts/CompareContext";
import { getProductImage, getCategoryFallbackImage } from "@/data/categories";

export function CompareBar() {
  const {
    compareItems,
    compareCategory,
    removeFromCompare,
    clearCompare,
    openCompare,
  } = useCompare();

  const [isCollapsed, setIsCollapsed] = useState(false);

  if (compareItems.length === 0) return null;

  const maxItems = 4;
  const emptySlotsCount = Math.max(0, maxItems - compareItems.length);

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pointer-events-none">
      <div className="max-w-5xl mx-auto pointer-events-auto">
        {/* Floating Bar Container */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300">
          {/* Header Bar */}
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-[#1d73b7] text-white">
                <Scale className="size-3.5" />
              </span>
              <span className="font-bold tracking-wider text-[11px] uppercase text-sky-300">
                Comparing {compareCategory}:
              </span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                {compareItems.length} of {maxItems} items
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCompare}
                className="text-slate-400 hover:text-rose-400 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title="Clear comparison shortlist"
              >
                <Trash2 className="size-3" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                title={isCollapsed ? "Expand compare dock" : "Minimize compare dock"}
              >
                {isCollapsed ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>
            </div>
          </div>

          {/* Body Content (collapsible) */}
          {!isCollapsed && (
            <div className="p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Product Cards Row */}
              <div className="flex items-center gap-2.5 overflow-x-auto w-full sm:w-auto py-1">
                {compareItems.map((prod) => {
                  const img = getProductImage(prod, prod.category);
                  const priceStr =
                    prod.numericPrice && prod.numericPrice > 0
                      ? `₹${prod.numericPrice.toLocaleString("en-IN")}`
                      : prod.price || "On request";

                  return (
                    <div
                      key={prod.productId}
                      className="relative shrink-0 w-44 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-center gap-2 group hover:border-[#1d73b7] transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => removeFromCompare(prod.productId)}
                        className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-slate-700 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] shadow cursor-pointer transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="size-3" />
                      </button>

                      <div className="size-11 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={img}
                          alt={prod.name}
                          onError={(e) => {
                            e.currentTarget.src = getCategoryFallbackImage(prod.category);
                          }}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-[#1d73b7] dark:text-sky-400 uppercase truncate block">
                          {prod.brand || "VOLAMP"}
                        </span>
                        <h4
                          className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 truncate"
                          title={prod.name}
                        >
                          {prod.name}
                        </h4>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                          {priceStr}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Empty Slots */}
                {Array.from({ length: emptySlotsCount }).map((_, idx) => (
                  <div
                    key={`empty-${idx}`}
                    className="shrink-0 w-32 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-2 hidden md:flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 py-3"
                  >
                    <Plus className="size-4 mb-0.5 opacity-60" />
                    <span className="text-[10px] font-medium">Add {compareCategory}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="w-full sm:w-auto shrink-0 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={openCompare}
                  disabled={compareItems.length < 2}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow transition-all cursor-pointer ${
                    compareItems.length >= 2
                      ? "bg-[#1d73b7] hover:bg-[#165a91] text-white"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <Scale className="size-4" />
                  <span>
                    {compareItems.length >= 2
                      ? `Compare Side-by-Side (${compareItems.length})`
                      : "Select 1 More to Compare"}
                  </span>
                  {compareItems.length >= 2 && <ArrowRight className="size-3.5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
