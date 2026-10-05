import React, { useState, useEffect, useRef } from "react";
import { useUserLocation, DEFAULT_LOCATION } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  X,
  Check,
  Search,
  Navigation,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
  Zap,
  Globe2,
  Ship,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

const GLOBAL_EXPORT_HUBS = [
  { city: "Dubai", region: "United Arab Emirates", badge: "Middle East", label: "Dubai · UAE" },
  { city: "London", region: "United Kingdom", badge: "Europe", label: "London · UK" },
  { city: "New York", region: "United States", badge: "Americas", label: "New York · USA" },
  { city: "Singapore", region: "Singapore", badge: "APAC", label: "Singapore · APAC" },
  { city: "Riyadh", region: "Saudi Arabia", badge: "GCC", label: "Riyadh · Saudi Arabia" },
  { city: "Frankfurt", region: "Germany", badge: "Europe", label: "Frankfurt · Germany" },
  { city: "Doha", region: "Qatar", badge: "GCC", label: "Doha · Qatar" },
  { city: "Abu Dhabi", region: "United Arab Emirates", badge: "Middle East", label: "Abu Dhabi · UAE" },
  { city: "Sydney", region: "Australia", badge: "Oceania", label: "Sydney · Australia" },
  { city: "Toronto", region: "Canada", badge: "Americas", label: "Toronto · Canada" },
  { city: "Paris", region: "France", badge: "Europe", label: "Paris · France" },
  { city: "Nairobi", region: "Kenya", badge: "East Africa", label: "Nairobi · Kenya" },
  { city: "Johannesburg", region: "South Africa", badge: "Africa", label: "Johannesburg · South Africa" },
  { city: "Tokyo", region: "Japan", badge: "East Asia", label: "Tokyo · Japan" },
  { city: "Melbourne", region: "Australia", badge: "Oceania", label: "Melbourne · Australia" },
  { city: "São Paulo", region: "Brazil", badge: "Americas", label: "São Paulo · Brazil" },
];

const INDIA_HUBS = [
  { city: "Ahmedabad", state: "Gujarat", badge: "HQ & Factory", label: "Ahmedabad · Gujarat (HQ)" },
  { city: "Mumbai", state: "Maharashtra", badge: "Commercial Hub", label: "Mumbai · Maharashtra" },
  { city: "Delhi NCR", state: "Delhi", badge: "Northern Hub", label: "Delhi NCR" },
  { city: "Bengaluru", state: "Karnataka", badge: "Tech & Infra", label: "Bengaluru · Karnataka" },
  { city: "Pune", state: "Maharashtra", badge: "Industrial Hub", label: "Pune · Maharashtra" },
  { city: "Hyderabad", state: "Telangana", badge: "Infra Hub", label: "Hyderabad · Telangana" },
  { city: "Chennai", state: "Tamil Nadu", badge: "Southern Hub", label: "Chennai · Tamil Nadu" },
  { city: "Kolkata", state: "West Bengal", badge: "Eastern Hub", label: "Kolkata · West Bengal" },
  { city: "Surat", state: "Gujarat", badge: "Industrial", label: "Surat · Gujarat" },
  { city: "Vadodara", state: "Gujarat", badge: "Power Hub", label: "Vadodara · Gujarat" },
  { city: "Jaipur", state: "Rajasthan", badge: "North-West", label: "Jaipur · Rajasthan" },
  { city: "Indore", state: "Madhya Pradesh", badge: "Central Hub", label: "Indore · Madhya Pradesh" },
];

interface LocationModalProps {
  onQuoteClick?: () => void;
}

export function LocationModal({ onQuoteClick }: LocationModalProps) {
  const {
    location,
    setLocation,
    isLocationModalOpen,
    setIsLocationModalOpen,
    welcomeLocation,
    setWelcomeLocation,
    autoDetectLocation,
  } = useUserLocation();

  const [activeTab, setActiveTab] = useState<"global" | "india">("global");
  const [customInput, setCustomInput] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [isInteracted, setIsInteracted] = useState(false);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dismissWelcome = () => {
    setWelcomeLocation(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("volamp:welcome-finished"));
    }
  };

  // Auto-close welcome popup after 1.5 seconds if user does not press it
  useEffect(() => {
    if (welcomeLocation) {
      setIsInteracted(false);
      autoCloseTimerRef.current = setTimeout(() => {
        dismissWelcome();
      }, 1500);
    }

    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }
    };
  }, [welcomeLocation]);

  const handleUserPress = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    setIsInteracted(true);
  };

  // Check if location is an international/global location
  const isGlobalLocation = (loc: string) => {
    const lower = loc.toLowerCase();
    const isIndia =
      lower.includes("india") ||
      lower.includes("gujarat") ||
      lower.includes("maharashtra") ||
      lower.includes("delhi") ||
      lower.includes("karnataka") ||
      lower.includes("tamil nadu") ||
      lower.includes("telangana") ||
      lower.includes("west bengal") ||
      lower.includes("rajasthan") ||
      lower.includes("madhya pradesh") ||
      lower.includes("punjab") ||
      lower.includes("uttar pradesh") ||
      lower.includes("haryana");
    return !isIndia;
  };

  // Handle location selection
  const handleSelectLocation = (locName: string) => {
    setLocation(locName);
    setIsLocationModalOpen(false);
    setWelcomeLocation(locName);
    toast.success(`Project location updated to ${locName}`);
  };

  // Handle custom text submit
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const selected = customInput.trim();
    setCustomInput("");
    handleSelectLocation(selected);
  };

  // Worldwide Geolocation detector with seamless IP fallback
  const handleDetectLocation = async () => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
            );
            if (res.ok) {
              const data = await res.json();
              const city = data.city || data.locality || data.principalSubdivision;
              const subdivision = data.principalSubdivision;
              const country = data.countryName;
              const code = data.countryCode;
              if (city && country) {
                const formatted =
                  code === "IN" && subdivision
                    ? `${city} · ${subdivision} · India`
                    : `${city} · ${country}`;
                handleSelectLocation(formatted);
                setIsDetecting(false);
                return;
              }
            }
          } catch {
            // fallback below
          }
          const fallbackLoc = await autoDetectLocation();
          handleSelectLocation(fallbackLoc);
          setIsDetecting(false);
        },
        async () => {
          // If browser permission denied or timed out, seamlessly detect via IP!
          const fallbackLoc = await autoDetectLocation();
          handleSelectLocation(fallbackLoc);
          setIsDetecting(false);
        },
        { timeout: 5000 }
      );
    } else {
      const fallbackLoc = await autoDetectLocation();
      handleSelectLocation(fallbackLoc);
      setIsDetecting(false);
    }
  };

  const isInternational = welcomeLocation ? isGlobalLocation(welcomeLocation) : false;
  const cityName = welcomeLocation
    ? welcomeLocation.split(/[·,.]/)[0].trim() || welcomeLocation
    : "your region";

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* 1. LOCATION SELECTION MODAL                                  */}
      {/* ------------------------------------------------------------- */}
      {isLocationModalOpen && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsLocationModalOpen(false)}
        >
          <div
            className="account-modal relative w-full max-w-[580px] rounded-2xl bg-white border border-[#d2e0e8] p-6 sm:p-7 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Close location selector"
            >
              <X className="size-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <div className="size-11 rounded-xl bg-white border border-[#ebd7c7] p-1.5 flex items-center justify-center shadow-xs shrink-0">
                <img src="/volamp-logo.png" alt="VOLAMP" className="h-7 w-auto object-contain" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#c46b19] uppercase block">
                  WORLDWIDE PROJECT SUPPLY & EXPORT
                </span>
                <h2 className="text-xl font-bold text-[#102a40] font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
                  Choose Your Project Location
                </h2>
              </div>
            </div>

            <p className="text-xs text-[#5a6b78] mt-1 mb-4">
              Select or enter your city or country to configure regional dispatch estimates, international certifications, and supply desk support.
            </p>

            {/* Current Active Location Badge */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f5f8fa] border border-[#dce5eb] mb-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[#5a6b78]">Current Active:</span>
                <strong className="text-[#102a40] font-bold">{location}</strong>
              </div>
              {location !== DEFAULT_LOCATION && (
                <button
                  onClick={() => handleSelectLocation(DEFAULT_LOCATION)}
                  className="text-[11px] text-[#1d73b7] font-semibold hover:underline"
                >
                  Reset to HQ
                </button>
              )}
            </div>

            {/* Custom Input Form - Worldwide Search */}
            <form onSubmit={handleCustomSubmit} className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Type any city or country worldwide (e.g. Dubai, London, New York, Mumbai...)"
                  className="pl-9 text-xs h-10"
                />
              </div>
              <Button
                type="submit"
                disabled={!customInput.trim()}
                className="bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold px-4 h-10 rounded-lg shrink-0"
              >
                Set Location
              </Button>
            </form>

            {/* Auto Detect Button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="flex items-center gap-2 text-xs font-semibold text-[#1d73b7] hover:underline mb-4"
            >
              <Navigation className="size-3.5" />
              {isDetecting ? "Detecting global location..." : "Auto-detect my current device location"}
            </button>

            {/* Hub Selector Tabs */}
            <div className="border-t border-[#e2ecf2] pt-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 p-1 bg-[#f0f4f8] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab("global")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      activeTab === "global"
                        ? "bg-white text-[#102a40] shadow-xs"
                        : "text-[#5a6b78] hover:text-[#102a40]"
                    }`}
                  >
                    🌍 Global Export Hubs
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("india")}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      activeTab === "india"
                        ? "bg-white text-[#102a40] shadow-xs"
                        : "text-[#5a6b78] hover:text-[#102a40]"
                    }`}
                  >
                    🇮🇳 India Domestic Hubs
                  </button>
                </div>
                <span className="text-[10px] text-[#5a6b78] hidden sm:inline">
                  {activeTab === "global" ? "12 International Hubs" : "12 Domestic Hubs"}
                </span>
              </div>

              {/* Hubs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[190px] overflow-y-auto pr-1">
                {(activeTab === "global" ? GLOBAL_EXPORT_HUBS : INDIA_HUBS).map((hub) => {
                  const isSelected = location.toLowerCase().includes(hub.city.toLowerCase());
                  return (
                    <button
                      key={hub.label}
                      onClick={() => handleSelectLocation(hub.label)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                        isSelected
                          ? "border-[#c46b19] bg-amber-500/10 font-bold text-[#c46b19]"
                          : "border-[#dce5eb] hover:border-[#1d73b7] bg-white text-[#102a40] hover:bg-[#f8fafc]"
                      }`}
                    >
                      <span className="truncate">{hub.city}</span>
                      {hub.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 ml-1 shrink-0">
                          {hub.badge}
                        </span>
                      )}
                      {isSelected && <Check className="size-3 text-[#c46b19] ml-1 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. PERSONALIZED WELCOME CELEBRATION POPUP                     */}
      {/* ------------------------------------------------------------- */}
      {welcomeLocation && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
          onClick={() => dismissWelcome()}
        >
          <div
            className="account-modal relative w-full max-w-[520px] rounded-2xl bg-white border border-[#d2e0e8] p-7 shadow-2xl text-center overflow-hidden"
            onClick={(e) => {
              e.stopPropagation();
              handleUserPress();
            }}
            onMouseDown={handleUserPress}
            onTouchStart={handleUserPress}
          >
            {/* 1.5s Auto-dismiss timer indicator */}
            {!isInteracted && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-100 overflow-hidden rounded-t-2xl">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#c46b19]"
                  style={{
                    animation: "volampAutoDismiss 1500ms linear forwards",
                  }}
                />
              </div>
            )}
            <style>{`
              @keyframes volampAutoDismiss {
                0% { width: 100%; }
                100% { width: 0%; }
              }
            `}</style>

            {/* Close Button */}
            <button
              onClick={() => dismissWelcome()}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              aria-label="Close welcome popup"
            >
              <X className="size-5" />
            </button>

            {/* VOLAMP Brand Logo */}
            <div className="relative mx-auto mb-4 flex items-center justify-center">
              <div className="relative px-6 py-2.5 rounded-2xl bg-white border border-[#ebd7c7] shadow-lg shadow-amber-900/5 flex items-center justify-center">
                <img
                  src="/volamp-logo.png"
                  alt="VOLAMP Elektrikals"
                  className="h-11 sm:h-12 w-auto object-contain"
                />
              </div>
            </div>

            {/* Kicker */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold mb-2">
              <Sparkles className="size-3 text-[#c46b19]" />
              {isInternational ? "GLOBAL ELECTRICAL SUPPLY & EXPORT NETWORK" : "PAN-INDIA & GLOBAL SUPPLY NETWORK"}
            </div>

            {/* Main Welcome Title */}
            <h2 className="text-2xl sm:text-[26px] font-bold text-[#102a40] font-['Plus_Jakarta_Sans',sans-serif] leading-snug">
              Welcome to <span className="text-[#c46b19]">VOLAMP</span> from{" "}
              <span className="text-[#1d73b7] underline decoration-amber-400 decoration-2 underline-offset-4">
                {cityName}
              </span>
              !
            </h2>

            {/* The requested "very good line" */}
            <p className="text-sm font-medium text-[#102a40] mt-3 mb-5 px-2 leading-relaxed">
              {isInternational ? (
                <>
                  Powering world-class infrastructure in{" "}
                  <strong className="text-[#c46b19]">{welcomeLocation}</strong> with certified,
                  precision-engineered cables and trusted global export logistics.
                </>
              ) : (
                <>
                  Powering your infrastructure projects in{" "}
                  <strong className="text-[#c46b19]">{welcomeLocation}</strong> with certified,
                  precision-engineered cables and dependable India-wide & global dispatch.
                </>
              )}
            </p>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6 text-left">
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#dce5eb]">
                <ShieldCheck className="size-4 text-[#c46b19] mb-1.5" />
                <strong className="text-xs font-bold text-[#102a40] block">
                  Global Standards
                </strong>
                <span className="text-[10px] text-[#5a6b78] leading-tight block mt-0.5">
                  IEC, BS, UL, CE & ISI compliant specifications.
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#dce5eb]">
                {isInternational ? (
                  <Ship className="size-4 text-[#1d73b7] mb-1.5" />
                ) : (
                  <Truck className="size-4 text-[#1d73b7] mb-1.5" />
                )}
                <strong className="text-xs font-bold text-[#102a40] block">
                  {isInternational ? "Global Logistics" : "Fast Regional Logistics"}
                </strong>
                <span className="text-[10px] text-[#5a6b78] leading-tight block mt-0.5">
                  {isInternational
                    ? `Air & sea freight with direct customs clearance to ${cityName}.`
                    : `Direct dispatch from factory to ${cityName}.`}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#dce5eb]">
                <FileCheck className="size-4 text-emerald-600 mb-1.5" />
                <strong className="text-xs font-bold text-[#102a40] block">
                  {isInternational ? "Export Desk" : "Direct Supply"}
                </strong>
                <span className="text-[10px] text-[#5a6b78] leading-tight block mt-0.5">
                  Multi-currency quotes & verified project assistance.
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-2">
              <Button
                onClick={() => {
                  dismissWelcome();
                  const el = document.getElementById("categories") || document.getElementById("products");
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = "/#categories";
                  }
                }}
                className="w-full sm:flex-1 bg-[#c46b19] hover:bg-[#b05d12] text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/10 cursor-pointer"
              >
                Explore Cable Catalog for {cityName} <ArrowRight className="size-3.5" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  dismissWelcome();
                  if (onQuoteClick) {
                    onQuoteClick();
                  } else {
                    const quoteEl = document.getElementById("quote");
                    if (quoteEl) {
                      quoteEl.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.location.href = "/enquire";
                    }
                  }
                }}
                className="w-full sm:w-auto border-[#dce5eb] text-[#102a40] hover:bg-[#f8fafc] text-xs font-semibold py-2.5 px-3 rounded-lg shrink-0 cursor-pointer"
              >
                {isInternational ? "Contact Export Desk" : "Talk to Supply Desk"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
