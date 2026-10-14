import React, { useState, useMemo } from "react";
import {
  useLanguage,
  SUPPORTED_LANGUAGES,
  LanguageOption,
} from "@/contexts/LanguageContext";
import {
  Globe2,
  X,
  Check,
  Search,
  Sparkles,
  ArrowRight,
  Languages,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LanguageModal() {
  const {
    currentLanguage,
    currentLanguageObj,
    setLanguage,
    isLanguageModalOpen,
    setIsLanguageModalOpen,
  } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "india" | "international">("all");

  const filteredLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter((lang) => {
      if (activeTab !== "all" && lang.group !== activeTab) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        lang.name.toLowerCase().includes(q) ||
        lang.nativeName.toLowerCase().includes(q) ||
        lang.code.toLowerCase().includes(q) ||
        lang.region.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, activeTab]);

  if (!isLanguageModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={() => setIsLanguageModalOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#0c2235] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-amber-50/30 dark:from-[#0a1a29] dark:via-[#0c2235] dark:to-[#112a40]">
          <div className="flex items-start gap-3.5">
            <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Languages className="size-6 text-[#c56718] dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#c56718] dark:text-amber-400">
                  Global & Regional Multi-Language Hub
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Live Translate
                </span>
              </div>
              <h2
                id="language-modal-title"
                className="text-xl sm:text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#0b1f33] dark:text-white mt-0.5"
              >
                Select Website Language
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose any domestic or export language to translate the entire Volamp catalog, specifications, and portal.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLanguageModalOpen(false)}
            className="size-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close language selector"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Current Selected Language Banner */}
        <div className="px-5 py-2.5 bg-amber-500/10 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-800/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{currentLanguageObj.flag}</span>
            <span className="text-slate-700 dark:text-slate-300">
              Currently active:{" "}
              <strong className="text-[#c56718] dark:text-amber-400 font-bold">
                {currentLanguageObj.name} ({currentLanguageObj.nativeName})
              </strong>
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
            ISO: {currentLanguageObj.code}
          </span>
        </div>

        {/* Search & Tabs Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by language (e.g. Hindi, Gujarati, Arabic, Spanish, French)..."
              className="pl-10 text-xs sm:text-sm h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-[#c56718] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All Languages ({SUPPORTED_LANGUAGES.length})
            </button>
            <button
              onClick={() => setActiveTab("india")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "india"
                  ? "bg-[#c56718] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              🇮🇳 Indian Domestic Desk ({SUPPORTED_LANGUAGES.filter((l) => l.group === "india").length})
            </button>
            <button
              onClick={() => setActiveTab("international")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "international"
                  ? "bg-[#c56718] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              🌐 Global Export Corridors ({SUPPORTED_LANGUAGES.filter((l) => l.group === "international").length})
            </button>
          </div>
        </div>

        {/* Language Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[50vh] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredLanguages.length > 0 ? (
            filteredLanguages.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsLanguageModalOpen(false);
                  }}
                  className={`group text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? "border-[#c56718] bg-amber-500/10 dark:bg-amber-950/30 text-[#0b1f33] dark:text-white shadow-xs ring-1 ring-[#c56718]"
                      : "border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0 leading-none">{lang.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm font-bold truncate group-hover:text-[#c56718] dark:group-hover:text-amber-400 transition-colors">
                          {lang.nativeName}
                        </strong>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({lang.name})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {lang.region}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {isSelected ? (
                      <div className="size-6 rounded-full bg-[#c56718] text-white flex items-center justify-center">
                        <Check className="size-3.5" />
                      </div>
                    ) : (
                      <div className="size-6 rounded-full border border-slate-300 dark:border-slate-700 group-hover:border-amber-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="size-3 text-amber-500" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-slate-400">
              <p className="text-xs">No languages matched "{searchQuery}".</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-3 text-xs"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Automatic neural translation powered across all technical pages.</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsLanguageModalOpen(false)}
            className="text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
