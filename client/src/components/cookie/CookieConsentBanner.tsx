import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  Cookie,
  X,
  Check,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Lock,
  Clock,
  ShoppingCart,
  ShieldAlert,
  Server,
  FileCheck2,
  BarChart3,
  Megaphone,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const COOKIE_STORAGE_KEY = "volamp_cookie_consent_status";

interface CookiePreferences {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export default function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Non-essential cookie toggles
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [preferences, setPreferences] = useState(true);

  useEffect(() => {
    let triggered = false;

    // Show cookies after the 1.5-second welcome popup finishes
    const handleWelcomeFinished = () => {
      if (triggered) return;
      triggered = true;
      setTimeout(() => {
        setIsOpen(true);
      }, 100);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("volamp:welcome-finished", handleWelcomeFinished);
    }

    // Safety fallback: guaranteed to appear after 1.6s
    const fallbackTimer = setTimeout(() => {
      handleWelcomeFinished();
    }, 1600);

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("volamp:welcome-finished", handleWelcomeFinished);
      }
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Save choice to localStorage and close
  const saveConsent = (status: "all" | "essential" | "custom", prefs?: CookiePreferences) => {
    try {
      const data = {
        status,
        timestamp: new Date().toISOString(),
        preferences: prefs || {
          essential: true,
          analytics: status === "all",
          marketing: status === "all",
          preferences: status === "all" || status === "custom" ? preferences : false,
        },
      };
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(data));
    } catch {}
    setIsOpen(false);
  };

  // Option 1: Accept All
  const handleAcceptAll = () => {
    saveConsent("all", {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true,
    });
  };

  // Option 2: Essential Only
  const handleEssentialOnly = () => {
    saveConsent("essential", {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  // Option 3: Custom Save
  const handleSaveCustom = () => {
    saveConsent("custom", {
      essential: true,
      analytics,
      marketing,
      preferences,
    });
  };

  // Close X
  const handleClose = () => {
    saveConsent("essential", {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Cookie and Privacy Preferences"
      className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-50 w-[calc(100%-2rem)] sm:w-[420px] max-w-[420px] pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-300 select-none"
    >
      <div className="relative bg-white/98 backdrop-blur-md rounded-2xl border border-[#ebd7c7] shadow-[0_16px_44px_rgba(16,42,64,0.14)] p-5 sm:p-5.5 text-[#0b1f33] max-h-[85vh] overflow-y-auto">
        {/* Subtle top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-[#c56718] to-amber-600 rounded-t-2xl" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close cookie notice"
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-[#4d1217] hover:bg-[#fbf4ee] transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Header Row */}
        <div className="flex items-center gap-3 mb-2.5 pr-6">
          <div className="size-10 rounded-xl bg-gradient-to-br from-[#fbf4ee] to-[#f7ede6] border border-[#ebd4c2] flex items-center justify-center text-[#c56718] shrink-0 shadow-xs">
            <Cookie className="size-5" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1 text-[10px] font-black tracking-widest text-[#c56718] uppercase">
              <Sparkles className="size-2.5 text-[#c56718]" />
              <span>PRIVACY & COOKIES</span>
            </div>
            <h3 className="text-base font-bold text-[#102a40] font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
              We value your privacy
            </h3>
          </div>
        </div>

        {/* Short Summary Description */}
        <p className="text-xs text-[#5d4a4b] leading-relaxed mb-3.5">
          VOLAMP uses <strong className="text-[#102a40] font-semibold">Core Essential Cookies</strong> to keep our site secure, fast, and operational. Non-essential cookies for analytics, marketing, and preferences require your consent.
        </p>

        {/* Expandable Preferences Drawer Button */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="group flex items-center justify-between w-full p-2.5 rounded-xl bg-[#fbf8f5] hover:bg-[#f7ede6] border border-[#ebd7c7] text-left text-xs font-semibold text-[#102a40] mb-3.5 transition-all cursor-pointer shadow-2xs"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="size-3.5 text-[#c56718] group-hover:rotate-45 transition-transform duration-200" />
            <span>{isExpanded ? "Hide Category Details" : "View Core Essential vs Non-Essential"}</span>
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-[#8c6d62]">
            <span className="hidden sm:inline">6 Core · 3 Opt</span>
            {isExpanded ? <ChevronUp className="size-4 text-stone-400" /> : <ChevronDown className="size-4 text-stone-400" />}
          </div>
        </button>

        {/* Detailed Breakdown Accordion */}
        {isExpanded && (
          <div className="space-y-3.5 mb-4 border-t border-b border-[#ebd7c7] py-3 text-xs animate-in fade-in duration-200">
            {/* 1. Core Essential Cookies */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-[#c56718] text-[11px] uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  Core Essential Cookies (Always Active)
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Required
                </span>
              </div>
              <p className="text-[11px] text-[#5d4a4b] mb-2 leading-relaxed">
                These cookies are technical necessities for security, authentication, and speed. They cannot be turned off.
              </p>

              <div className="space-y-2 bg-[#fdfbf9] border border-[#ebd7c7] rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <Lock className="size-3.5 text-[#c56718] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#102a40] font-semibold block text-[11px]">
                      Authentication Cookies
                    </strong>
                    <span className="text-[#5d4a4b] text-[11px] leading-tight block">
                      Keep a user logged in as they navigate from page to page. Without them, the user logs out on every click.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="size-3.5 text-[#c56718] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#102a40] font-semibold block text-[11px]">
                      Session ID Cookies
                    </strong>
                    <span className="text-[#5d4a4b] text-[11px] leading-tight block">
                      Track a temporary browsing session. They delete automatically when the user closes the browser.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ShoppingCart className="size-3.5 text-[#c56718] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#102a40] font-semibold block text-[11px]">
                      Shopping Cart Cookies
                    </strong>
                    <span className="text-[#5d4a4b] text-[11px] leading-tight block">
                      Remember items added to an e-commerce cart or BOM estimation during a shopping session.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ShieldAlert className="size-3.5 text-[#c56718] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#102a40] font-semibold block text-[11px]">
                      Security Cookies
                    </strong>
                    <span className="text-[#5d4a4b] text-[11px] leading-tight block">
                      Detect threats and prevent attacks like Cross-Site Request Forgery (CSRF) or fake logins.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Server className="size-3.5 text-[#c56718] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#102a40] font-semibold block text-[11px]">
                      Load-Balancing Cookies
                    </strong>
                    <span className="text-[#5d4a4b] text-[11px] leading-tight block">
                      Spread site traffic across servers to keep the website fast and stable.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <FileCheck2 className="size-3.5 text-[#c56718] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#102a40] font-semibold block text-[11px]">
                      Consent Management Cookies
                    </strong>
                    <span className="text-[#5d4a4b] text-[11px] leading-tight block">
                      Remember a user's cookie privacy choices so the banner does not reappear on every page load.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. What is NOT Essential */}
            <div>
              <span className="font-bold text-[#102a40] text-[11px] uppercase tracking-wider block mb-1">
                What is NOT Essential (Optional Consent)
              </span>
              <p className="text-[11px] text-[#5d4a4b] mb-2 leading-relaxed">
                These cookies are not technical necessities and are only enabled with your active permission:
              </p>

              <div className="space-y-2.5 bg-[#fdfbf9] border border-[#ebd7c7] rounded-xl p-3">
                {/* Analytics */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2 flex-1">
                    <BarChart3 className="size-3.5 text-[#1d73b7] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#102a40] font-semibold block text-[11px]">
                        Analytics Cookies
                      </strong>
                      <span className="text-[#5d4a4b] text-[11px] leading-tight block">
                        Tracking tools like Google Analytics require active consent.
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={analytics}
                    onCheckedChange={setAnalytics}
                    aria-label="Toggle Analytics Cookies"
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#f0e3d8]">
                  <div className="flex items-start gap-2 flex-1">
                    <Megaphone className="size-3.5 text-[#c56718] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#102a40] font-semibold block text-[11px]">
                        Marketing & Pixels
                      </strong>
                      <span className="text-[#5d4a4b] text-[11px] leading-tight block">
                        Ad pixels and retargeting tools are never essential.
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={marketing}
                    onCheckedChange={setMarketing}
                    aria-label="Toggle Marketing Cookies"
                  />
                </div>

                {/* Preferences */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#f0e3d8]">
                  <div className="flex items-start gap-2 flex-1">
                    <SlidersHorizontal className="size-3.5 text-stone-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-[#102a40] font-semibold block text-[11px]">
                        User Preferences
                      </strong>
                      <span className="text-[#5d4a4b] text-[11px] leading-tight block">
                        Dark mode or non-critical styling choices are user conveniences, not technical necessities.
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={preferences}
                    onCheckedChange={setPreferences}
                    aria-label="Toggle Preferences Cookies"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            {/* Option 1: Accept All */}
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-gradient-to-r from-[#c56718] to-[#b45309] hover:from-[#b45309] hover:to-[#9a4205] text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="size-3.5" />
              <span>Accept All Cookies</span>
            </Button>

            {/* Option 2: Essential Only */}
            <Button
              variant="outline"
              onClick={handleEssentialOnly}
              className="border-[#ebd7c7] text-[#4d1217] hover:bg-[#fbf4ee] hover:text-[#102a40] text-xs font-semibold py-2.5 px-3 rounded-xl cursor-pointer transition-all whitespace-nowrap"
            >
              Essential Only
            </Button>
          </div>

          {/* Sub Row: Save Choices (if expanded) and Privacy Policy */}
          <div className="flex items-center justify-between pt-1 text-[11px]">
            {isExpanded ? (
              <Button
                size="sm"
                onClick={handleSaveCustom}
                className="bg-[#102a40] hover:bg-[#1a3d5b] text-white text-[11px] font-semibold py-1.5 px-3 rounded-lg cursor-pointer h-7"
              >
                Save My Preferences
              </Button>
            ) : (
              <span className="text-[#8c6d62]">Zero monetization standard</span>
            )}

            <Link
              href="/privacy-policy"
              onClick={() => setIsOpen(false)}
              className="font-semibold text-[#1d73b7] hover:underline hover:text-[#155a90] ml-auto"
            >
              Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
