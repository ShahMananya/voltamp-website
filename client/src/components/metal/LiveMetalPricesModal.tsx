import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calculator,
  ShieldCheck,
  FileText,
  Sparkles,
  Zap,
  Layers,
  ChevronRight,
  Download,
  AlertCircle,
  Check,
  Copy,
  Sliders,
  Percent,
  Coins,
  Info,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface LiveMetalPricesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestLockedQuote?: (metalDetails: string) => void;
}

export interface MetalData {
  id: string;
  name: string;
  symbol: string;
  exchange: "MCX" | "LME";
  priceInrPerKg: number;
  priceUsdPerMt: number;
  changeInr: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  unit: string;
  updatedAt: string;
  category: "Primary Conductor" | "Secondary & Sheathing";
  trend: number[];
}

export interface BasicPriceGradeInfo {
  id: string;
  name: string;
  category: "CC Wire Rod" | "Copper Cathode";
  spec: string;
  premiumUsd: number;
  differentialInrPmt: number;
  differentialNote: string;
  landedUsd: number;
  dutyAdjustedUsd: number;
  convertedInrPmt: number;
  basicPricePmt: number;
  basicPricePerKg: number;
}

const INITIAL_METALS: MetalData[] = [
  {
    id: "mcx-copper",
    name: "Copper Continuous (Grade A Cathode)",
    symbol: "Cu",
    exchange: "MCX",
    priceInrPerKg: 1398.95,
    priceUsdPerMt: 14050.00,
    changeInr: -5.00,
    changePercent: -0.36,
    high24h: 1400.80,
    low24h: 1392.60,
    unit: "₹ / kg",
    updatedAt: "Live tick",
    category: "Primary Conductor",
    trend: [1419, 1414, 1409, 1392.6, 1400.8, 1398.95]
  },
  {
    id: "lme-copper",
    name: "LME Copper Official Cash",
    symbol: "Cu-LME",
    exchange: "LME",
    priceInrPerKg: 1410.14,
    priceUsdPerMt: 14120.00,
    changeInr: -5.05,
    changePercent: -0.36,
    high24h: 14180.00,
    low24h: 14020.00,
    unit: "$ / MT",
    updatedAt: "Live tick",
    category: "Primary Conductor",
    trend: [13850, 13920, 13990, 14080, 14150, 14140, 14120]
  },
  {
    id: "mcx-aluminium",
    name: "EC Grade Aluminium Wire Rod",
    symbol: "Al",
    exchange: "MCX",
    priceInrPerKg: 316.20,
    priceUsdPerMt: 3448.00,
    changeInr: -4.05,
    changePercent: -1.26,
    high24h: 318.60,
    low24h: 315.45,
    unit: "₹ / kg",
    updatedAt: "Live tick",
    category: "Primary Conductor",
    trend: [328.3, 315.45, 320.3, 318.6, 316.2]
  },
  {
    id: "lme-aluminium",
    name: "LME Aluminium Primary 99.7%",
    symbol: "Al-LME",
    exchange: "LME",
    priceInrPerKg: 319.36,
    priceUsdPerMt: 3025.00,
    changeInr: -3.85,
    changePercent: -1.26,
    high24h: 3050.00,
    low24h: 2990.00,
    unit: "$ / MT",
    updatedAt: "Live tick",
    category: "Primary Conductor",
    trend: [2950, 2975, 2990, 3010, 3030, 3015, 3025]
  },
  {
    id: "mcx-lead",
    name: "Lead Ingot (Cable Sheathing Grade)",
    symbol: "Pb",
    exchange: "MCX",
    priceInrPerKg: 194.60,
    priceUsdPerMt: 2199.00,
    changeInr: 0.00,
    changePercent: 0.00,
    high24h: 194.95,
    low24h: 193.55,
    unit: "₹ / kg",
    updatedAt: "Today",
    category: "Secondary & Sheathing",
    trend: [188, 187, 188.5, 187.8, 187, 186.9, 194.6]
  },
  {
    id: "steel-armour",
    name: "Galvanized Steel Tape / Wire (Armouring Index)",
    symbol: "Fe-GI",
    exchange: "MCX",
    priceInrPerKg: 78.40,
    priceUsdPerMt: 890.00,
    changeInr: +0.30,
    changePercent: +0.39,
    high24h: 79.10,
    low24h: 77.80,
    unit: "₹ / kg",
    updatedAt: "Weekly baseline",
    category: "Secondary & Sheathing",
    trend: [77.5, 77.8, 78, 78.1, 78.2, 78.3, 78.4]
  }
];

export default function LiveMetalPricesModal({
  isOpen,
  onClose,
  onRequestLockedQuote
}: LiveMetalPricesModalProps) {
  const [metals, setMetals] = useState<MetalData[]>(INITIAL_METALS);
  const [activeTab, setActiveTab] = useState<"live" | "formula" | "calculator">("live");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [marketAsOn, setMarketAsOn] = useState<string>("Live MCX Exchange Feed");
  const [copiedFormula, setCopiedFormula] = useState(false);

  // XE.com Live Currency Rate Transfer State
  const [xeCurrency, setXeCurrency] = useState<{
    source: string;
    usdToInr: number;
    inrToUsd: number;
    ttSellingRate: number;
    asOn: string;
  }>({
    source: "XE.com Live Currency Converter",
    usdToInr: 95.1064,
    inrToUsd: 0.010515,
    ttSellingRate: 95.11,
    asOn: "Live XE.com Feed"
  });
  const [isXeSynced, setIsXeSynced] = useState<boolean>(true);

  // Statutory Basic Price Formula Parameters (Editable)
  const [lmeCashUsd, setLmeCashUsd] = useState<number>(14120);
  const [ttSellingRate, setTtSellingRate] = useState<number>(95.11);
  const [multiplicationFactor, setMultiplicationFactor] = useState<number>(1.058);
  const [handlingChargesPmt, setHandlingChargesPmt] = useState<number>(3300);
  const [selectedGradeId, setSelectedGradeId] = useState<string>("cc-rod-8mm-std");

  // Calculator states
  const [calcMetal, setCalcMetal] = useState<"copper" | "aluminium">("copper");
  const [calcPriceSource, setCalcPriceSource] = useState<"mcx" | "basic-price">("basic-price");
  const [calcCores, setCalcCores] = useState<number>(4);
  const [calcSqmm, setCalcSqmm] = useState<number>(16);
  const [calcLength, setCalcLength] = useState<number>(500); // 500 metres default drum

  // Fetch real market rates from the backend API
  const fetchLiveExchangeData = async (force = false) => {
    try {
      const res = await fetch(`/api/metal-prices${force ? "?force=true" : ""}`, {
        cache: "no-store"
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && Array.isArray(data.metals)) {
        setMetals(data.metals);
        if (data.asOn) setMarketAsOn(data.asOn);
        setLastRefreshed(new Date(data.timestamp || Date.now()));

        // Sync LME Cash Copper price if available
        const lmeCu = data.metals.find((m: any) => m.id === "lme-copper");
        if (lmeCu?.priceUsdPerMt && !force) {
          setLmeCashUsd(lmeCu.priceUsdPerMt);
        }

        // Sync live XE.com currency transfer rates
        if (data.currencyRates) {
          setXeCurrency(data.currencyRates);
          if (isXeSynced && data.currencyRates.ttSellingRate) {
            setTtSellingRate(data.currencyRates.ttSellingRate);
          }
        }
        return data;
      }
    } catch (err) {
      console.warn("[LiveMetalPrices] Failed to fetch real data:", err);
    }
    return null;
  };

  // Compute the 5 Statutory Indian Cable Grades per User Specification:
  // Basic Price = [(LME + Premium) X Multiplication Factor 1.058 X TT Selling ] + Handling Charges Rs.3300/- PMT
  const gradesCalculation = useMemo(() => {
    const calcBase = (premiumUsd: number) => {
      const landedUsd = lmeCashUsd + premiumUsd;
      const dutyAdjustedUsd = landedUsd * multiplicationFactor;
      const convertedInrPmt = dutyAdjustedUsd * ttSellingRate;
      const basicPricePmt = convertedInrPmt + handlingChargesPmt;
      return { landedUsd, dutyAdjustedUsd, convertedInrPmt, basicPricePmt };
    };

    // 1. CC Rod 8mm Std (Premium USD 280)
    const g1Base = calcBase(280);
    const g1: BasicPriceGradeInfo = {
      id: "cc-rod-8mm-std",
      name: "CC Rod 8mm (Standard)",
      category: "CC Wire Rod",
      spec: "8.0 mm Dia Continuous Cast Wire Rod (Standard Cable Grade)",
      premiumUsd: 280,
      differentialInrPmt: 0,
      differentialNote: "Standard Base Cable Grade (Premium USD 280/MT)",
      landedUsd: g1Base.landedUsd,
      dutyAdjustedUsd: Math.round(g1Base.dutyAdjustedUsd * 100) / 100,
      convertedInrPmt: Math.round(g1Base.convertedInrPmt * 100) / 100,
      basicPricePmt: Math.round(g1Base.basicPricePmt * 100) / 100,
      basicPricePerKg: Math.round((g1Base.basicPricePmt / 1000) * 100) / 100
    };

    // 2. CC Rod 8mm Non Standard (Rs. 400/- PMT lower than CC Rod 8mm)
    const g2Pmt = g1Base.basicPricePmt - 400;
    const g2: BasicPriceGradeInfo = {
      id: "cc-rod-8mm-non-std",
      name: "CC Rod 8mm (Non Standard)",
      category: "CC Wire Rod",
      spec: "8.0 mm Dia Non Standard Coils / Off-spec lots",
      premiumUsd: 280,
      differentialInrPmt: -400,
      differentialNote: "Rs. 400/- PMT lower than CC Rod 8mm",
      landedUsd: g1Base.landedUsd,
      dutyAdjustedUsd: Math.round(g1Base.dutyAdjustedUsd * 100) / 100,
      convertedInrPmt: Math.round(g1Base.convertedInrPmt * 100) / 100,
      basicPricePmt: Math.round(g2Pmt * 100) / 100,
      basicPricePerKg: Math.round((g2Pmt / 1000) * 100) / 100
    };

    // 3. CC Rod 11/12.5mm, 16mm, 19mm (Premium USD 120)
    const g3Base = calcBase(120);
    const g3: BasicPriceGradeInfo = {
      id: "cc-rod-heavy",
      name: "CC Rod 11/12.5mm, 16mm, 19mm",
      category: "CC Wire Rod",
      spec: "Heavy Gauge Drawing & Busbar Continuous Cast Rods",
      premiumUsd: 120,
      differentialInrPmt: 0,
      differentialNote: "Heavy Gauge Rod (Premium USD 120/MT)",
      landedUsd: g3Base.landedUsd,
      dutyAdjustedUsd: Math.round(g3Base.dutyAdjustedUsd * 100) / 100,
      convertedInrPmt: Math.round(g3Base.convertedInrPmt * 100) / 100,
      basicPricePmt: Math.round(g3Base.basicPricePmt * 100) / 100,
      basicPricePerKg: Math.round((g3Base.basicPricePmt / 1000) * 100) / 100
    };

    // 4. Cathode (Full) (Premium USD 150)
    const g4Base = calcBase(150);
    const g4: BasicPriceGradeInfo = {
      id: "cathode-full",
      name: "Copper Cathode (Full Sheet)",
      category: "Copper Cathode",
      spec: "Grade A 99.99% Electrolytic Copper Cathode (Full Plate)",
      premiumUsd: 150,
      differentialInrPmt: 0,
      differentialNote: "Full Sheet Cathode (Premium USD 150/MT)",
      landedUsd: g4Base.landedUsd,
      dutyAdjustedUsd: Math.round(g4Base.dutyAdjustedUsd * 100) / 100,
      convertedInrPmt: Math.round(g4Base.convertedInrPmt * 100) / 100,
      basicPricePmt: Math.round(g4Base.basicPricePmt * 100) / 100,
      basicPricePerKg: Math.round((g4Base.basicPricePmt / 1000) * 100) / 100
    };

    // 5. Cathode (Cut) (Rs. 1500/- PMT higher than Cathode Full)
    const g5Pmt = g4Base.basicPricePmt + 1500;
    const g5: BasicPriceGradeInfo = {
      id: "cathode-cut",
      name: "Copper Cathode (Cut Pieces)",
      category: "Copper Cathode",
      spec: "Grade A Cathode cut / sheared for induction melting",
      premiumUsd: 150,
      differentialInrPmt: +1500,
      differentialNote: "Rs. 1,500/- PMT higher than Cathode (Full)",
      landedUsd: g4Base.landedUsd,
      dutyAdjustedUsd: Math.round(g4Base.dutyAdjustedUsd * 100) / 100,
      convertedInrPmt: Math.round(g4Base.convertedInrPmt * 100) / 100,
      basicPricePmt: Math.round(g5Pmt * 100) / 100,
      basicPricePerKg: Math.round((g5Pmt / 1000) * 100) / 100
    };

    return [g1, g2, g3, g4, g5];
  }, [lmeCashUsd, multiplicationFactor, ttSellingRate, handlingChargesPmt]);

  const activeGrade = useMemo(() => {
    return gradesCalculation.find((g) => g.id === selectedGradeId) || gradesCalculation[0];
  }, [gradesCalculation, selectedGradeId]);

  // Cable Conductor Weight & Cost Estimator
  const metalCalculation = useMemo(() => {
    const density = calcMetal === "copper" ? 8.89 : 2.70;
    const strandingFactor = 1.025;
    const kgPerKm = calcCores * calcSqmm * density * strandingFactor;
    const totalWeightKg = (kgPerKm * calcLength) / 1000;

    let appliedRatePerKg = 0;
    if (calcMetal === "copper") {
      if (calcPriceSource === "basic-price") {
        appliedRatePerKg = activeGrade.basicPricePerKg;
      } else {
        appliedRatePerKg = metals.find((m) => m.id === "mcx-copper")?.priceInrPerKg ?? 1398.95;
      }
    } else {
      appliedRatePerKg = metals.find((m) => m.id === "mcx-aluminium")?.priceInrPerKg ?? 316.20;
    }

    const metalCostTotal = totalWeightKg * appliedRatePerKg;
    const approxCableRetailEst = metalCostTotal * 1.35; // raw conductor metal is ~74% of manufacturing cost

    return {
      kgPerKm: Math.round(kgPerKm * 10) / 10,
      totalWeightKg: Math.round(totalWeightKg * 10) / 10,
      appliedRatePerKg,
      metalCostTotal: Math.round(metalCostTotal),
      approxCableRetailEst: Math.round(approxCableRetailEst),
      metalContributionPct: 74
    };
  }, [calcMetal, calcPriceSource, calcCores, calcSqmm, calcLength, metals, activeGrade]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Poll exchange data on open
  useEffect(() => {
    if (!isOpen) return;
    fetchLiveExchangeData(false);
    const interval = setInterval(() => {
      fetchLiveExchangeData(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const data = await fetchLiveExchangeData(true);
    setIsRefreshing(false);
    if (data?.success) {
      toast.success("MCX, LME & XE.com live feeds synchronized.", {
        description: data.asOn || "Live Tick Verified"
      });
    } else {
      toast.info("Using cached market baseline.");
    }
  };

  const handleCopyCircular = () => {
    const text = `VOLAMP ELEKTRIKALS - OFFICIAL BASIC PRICE CIRCULAR
Date: ${lastRefreshed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} | Ref: IEEMA / Hindalco Formula Standard
----------------------------------------------------------------------
FORMULA:
Basic Price = [(LME + Premium) X Multiplication Factor 1.058 X TT Selling ] + Handling Charges Rs.3300/- PMT

INPUT PARAMETERS & CURRENCY:
- LME Copper Cash: $${lmeCashUsd.toLocaleString("en-US")} / MT
- Customs Multiplication Factor: ${multiplicationFactor} (5% BCD + 10% SWS)
- TT Selling Rate (XE.com Live): ₹${ttSellingRate.toFixed(2)} / USD (1 INR = $${xeCurrency.inrToUsd})
- Domestic Handling Charges: ₹${handlingChargesPmt.toLocaleString("en-IN")}/- PMT

OFFICIAL BASIC PRICES BY GRADE:
1. CC Rod 8mm (Standard):
   - Premium: USD 280/MT
   - Basic Price: ₹${gradesCalculation[0].basicPricePmt.toLocaleString("en-IN")} PMT (₹${gradesCalculation[0].basicPricePerKg.toFixed(2)}/kg)

2. CC Rod 8mm (Non Standard):
   - Rate: Rs. 400/- PMT lower than CC Rod 8mm
   - Basic Price: ₹${gradesCalculation[1].basicPricePmt.toLocaleString("en-IN")} PMT (₹${gradesCalculation[1].basicPricePerKg.toFixed(2)}/kg)

3. CC Rod 11/12.5mm, 16mm, 19mm:
   - Premium: USD 120/MT
   - Basic Price: ₹${gradesCalculation[2].basicPricePmt.toLocaleString("en-IN")} PMT (₹${gradesCalculation[2].basicPricePerKg.toFixed(2)}/kg)

4. Copper Cathode (Full Sheet):
   - Premium: USD 150/MT
   - Basic Price: ₹${gradesCalculation[3].basicPricePmt.toLocaleString("en-IN")} PMT (₹${gradesCalculation[3].basicPricePerKg.toFixed(2)}/kg)

5. Copper Cathode (Cut Pieces):
   - Rate: Rs. 1,500/- PMT higher than Cathode (Full)
   - Basic Price: ₹${gradesCalculation[4].basicPricePmt.toLocaleString("en-IN")} PMT (₹${gradesCalculation[4].basicPricePerKg.toFixed(2)}/kg)
----------------------------------------------------------------------
VOLAMP ELEKTRIKALS Central Supply Desk: +91 9512365582`;

    navigator.clipboard.writeText(text);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2500);
    toast.success("Official Basic Price Circular copied to clipboard!");
  };

  const handleResetDefaults = () => {
    setLmeCashUsd(14120);
    setTtSellingRate(xeCurrency.ttSellingRate || 95.11);
    setIsXeSynced(true);
    setMultiplicationFactor(1.058);
    setHandlingChargesPmt(3300);
    toast.info("Formula parameters reset to statutory benchmark defaults.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      {/* Main Card Container with Signature Top Copper Highlight Line */}
      <div className="relative w-full max-w-5xl max-h-[94vh] flex flex-col bg-white dark:bg-[#0c2235] border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl shadow-slate-900/15 overflow-hidden text-slate-900 dark:text-white">
        
        {/* Top ambient brand highlight line (Matches the screenshot) */}
        <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-[#c56718] to-transparent rounded-t-3xl z-10" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#091a29] shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#c56718] dark:text-amber-400">
              <Zap className="size-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c56718] dark:text-amber-400 block">
                  Official Conductor Index
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE MCX / LME / XE
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 tracking-tight">
                Live Metal Rates & Statutory Basic Price
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className={`p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer ${
                isRefreshing ? "animate-spin text-[#c56718]" : ""
              }`}
              title="Refresh live exchange feeds"
            >
              <RefreshCw className="size-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Modern Pill Style Matching RFQ Form */}
        <div className="flex flex-wrap items-center gap-2 px-6 pt-3 pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "live"
                ? "bg-gradient-to-r from-[#c56718] via-[#d97706] to-[#b45309] text-white font-bold shadow-md shadow-orange-600/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            <TrendingUp className="size-3.5" />
            <span>Live Spot Tickers</span>
          </button>

          <button
            onClick={() => setActiveTab("formula")}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "formula"
                ? "bg-gradient-to-r from-[#c56718] via-[#d97706] to-[#b45309] text-white font-bold shadow-md shadow-orange-600/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            <Calculator className="size-3.5" />
            <span>Statutory Basic Price Formula</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
              activeTab === "formula" ? "bg-black/25 text-white" : "bg-amber-500/10 text-[#c56718] dark:text-amber-400"
            }`}>
              IEEMA
            </span>
          </button>

          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "calculator"
                ? "bg-gradient-to-r from-[#c56718] via-[#d97706] to-[#b45309] text-white font-bold shadow-md shadow-orange-600/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
            }`}
          >
            <Coins className="size-3.5" />
            <span>Cable Metal BOM Estimator</span>
          </button>

          <div className="ml-auto hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{marketAsOn}</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white dark:bg-[#0c2235]">

          {/* TAB 1: LIVE SPOT RATES */}
          {activeTab === "live" && (
            <>
              {/* Highlighted Banner for Statutory Basic Price Formula */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white dark:from-[#112d46] dark:to-[#0c2235] border border-amber-200/90 dark:border-amber-500/30 relative overflow-hidden shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c56718] dark:text-amber-400">
                        IEEMA & CABLE INDUSTRY STANDARD
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">• Landed Conductor Basic Price</span>
                    </div>
                    <div className="font-mono text-xs sm:text-sm text-[#c56718] dark:text-[#fbbf24] font-bold bg-white dark:bg-slate-950/80 px-3.5 py-2 rounded-xl border border-amber-200 dark:border-amber-500/30 inline-block shadow-2xs select-all">
                      Basic Price = [(LME + Premium) X Multiplication Factor 1.058 X TT Selling ] + Handling Charges Rs.3300/- PMT
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
                      <span>
                        CC Rod 8mm (Standard):{" "}
                        <strong className="text-slate-900 dark:text-white font-bold font-mono text-sm">
                          ₹{gradesCalculation[0].basicPricePmt.toLocaleString("en-IN")} PMT (₹{gradesCalculation[0].basicPricePerKg.toFixed(2)}/kg)
                        </strong>
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span>
                        XE.com TT Selling: <strong className="text-[#c56718] dark:text-amber-400 font-mono">₹{ttSellingRate.toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("formula")}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c56718] hover:text-[#b45309] dark:text-amber-400 cursor-pointer transition-colors bg-amber-500/10 px-4 py-2.5 rounded-xl border border-amber-500/20 self-start md:self-center"
                  >
                    <span>Open 5-Grade Formula</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Primary Conductor Metals Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c56718] dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="size-3.5" />
                    Primary Conductors (Copper & Aluminium)
                  </span>
                  <button
                    onClick={handleCopyCircular}
                    className="text-xs text-[#c56718] dark:text-amber-400 hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    <span>Copy Daily Circular</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metals.filter((m) => m.category === "Primary Conductor").map((metal) => {
                    const isPositive = metal.changePercent >= 0;
                    return (
                      <div
                        key={metal.id}
                        className="p-5 rounded-2xl bg-white dark:bg-[#0e2438] border border-slate-200 dark:border-slate-700/80 hover:border-[#c56718] dark:hover:border-amber-400 transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                              {metal.exchange}
                            </span>
                            <h5 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-1.5">
                              {metal.name}
                            </h5>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                              isPositive
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                : "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                            }`}
                          >
                            {isPositive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                            {isPositive ? "+" : ""}{metal.changePercent}%
                          </span>
                        </div>

                        {/* Prices & Units */}
                        <div className="flex items-baseline justify-between py-2.5 border-y border-slate-100 dark:border-slate-800 my-2">
                          <div>
                            <span className="text-2xl sm:text-3xl font-extrabold text-[#c56718] dark:text-amber-400 tracking-tight font-mono">
                              ₹{metal.priceInrPerKg.toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">/ kg</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 block">USD Equivalent</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
                              ${metal.priceUsdPerMt.toLocaleString("en-US")} / MT
                            </span>
                          </div>
                        </div>

                        {/* High/Low 24h & Trend */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2">
                          <div>
                            <span>24h Range: </span>
                            <strong className="text-slate-700 dark:text-slate-200 font-mono">
                              ₹{metal.low24h} - ₹{metal.high24h}
                            </strong>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Exchange:</span>
                            <span className="text-[#c56718] dark:text-amber-400 font-mono font-bold">{metal.exchange} Spot</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Secondary & Sheathing Metals Grid */}
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <Layers className="size-3.5" />
                  Secondary Cable Compounds & Armouring Metals
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metals.filter((m) => m.category === "Secondary & Sheathing").map((metal) => {
                    const isPositive = metal.changePercent >= 0;
                    return (
                      <div
                        key={metal.id}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                              {metal.symbol}
                            </span>
                            <h5 className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                              {metal.name}
                            </h5>
                          </div>
                          <div className="mt-1">
                            <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">
                              ₹{metal.priceInrPerKg.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-500 ml-1">/ kg</span>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${
                            isPositive ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                          }`}
                        >
                          {isPositive ? "+" : ""}{metal.changePercent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contractor Procurement Note */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertCircle className="size-5 text-[#c56718] dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <strong className="text-[#c56718] dark:text-amber-400 block mb-0.5 font-bold">Project Tender Rate Locking Guarantee:</strong>
                  Cable prices vary with daily MCX copper and aluminium movement. Volamp provides guaranteed forward metal booking for verified EPC contractors, ensuring zero cost overrun during project execution.
                </div>
              </div>
            </>
          )}

          {/* TAB 2: STATUTORY BASIC PRICE FORMULA */}
          {activeTab === "formula" && (
            <div className="space-y-6">
              
              {/* Formula Presentation Box */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white dark:from-[#112d46] dark:to-[#0c2235] border border-amber-200/90 dark:border-amber-500/30 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c56718] dark:text-amber-400 block">
                      Indian Cable Industry Statutory Formula
                    </span>
                    <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                      Conductor Landed Basic Price Formula
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetDefaults}
                      className="text-xs text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors cursor-pointer font-medium"
                    >
                      Reset Defaults
                    </button>
                    <button
                      onClick={handleCopyCircular}
                      className="text-xs font-bold text-white bg-gradient-to-r from-[#c56718] via-[#d97706] to-[#b45309] hover:from-[#d97706] hover:to-[#a04a0a] px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-orange-600/20"
                    >
                      {copiedFormula ? <Check className="size-3.5 text-white" /> : <Copy className="size-3.5" />}
                      <span>{copiedFormula ? "Copied!" : "Copy Circular"}</span>
                    </button>
                  </div>
                </div>

                {/* The User's Exact Formula Display */}
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-400/40 font-mono text-xs sm:text-sm text-[#fbbf24] font-bold leading-relaxed tracking-wide select-all overflow-x-auto shadow-inner">
                  Basic Price = [(LME + Premium) X Multiplication Factor 1.058 X TT Selling ] + Handling Charges Rs.3300/- PMT
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3.5 leading-relaxed">
                  <span className="text-[#c56718] dark:text-amber-400 font-bold">Statutory Grade Differential Rule: </span>
                  Where Premium is <strong>USD 280</strong>, <strong>120</strong> and <strong>150</strong> for CC Rod 8mm, 11/12.5mm, 16mm, 19mm and Cathode respectively, and CC Rod 8mm Non Standard is <strong>Rs.400/- PMT lower</strong> than CC Rod 8mm & Cathode (Cut) is <strong>Rs.1500/- PMT higher</strong> than Cathode (Full).
                </p>
              </div>

              {/* XE.com Live Currency Rate Transfer Feed Card */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-700/80 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-[#c56718] dark:text-amber-400 border border-amber-500/20">
                      <TrendingUp className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c56718] dark:text-amber-400 block">
                          XE.com Live Currency Rate Transfer Feed
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          XE.COM SYNCED
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Real-time foreign exchange benchmark for TT Selling & import rate transfers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTtSellingRate(xeCurrency.ttSellingRate);
                        setIsXeSynced(true);
                        toast.success(`TT Selling synchronized to XE.com Live Rate: ₹${xeCurrency.ttSellingRate}/USD`);
                      }}
                      className="text-xs font-bold text-[#c56718] dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="size-3" />
                      <span>Sync TT Selling (₹{xeCurrency.ttSellingRate})</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* USD to INR (TT Selling) */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2235] border border-amber-200 dark:border-amber-500/30 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        USD to INR (TT Selling Rate)
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-black text-[#c56718] dark:text-amber-400 font-mono">
                          1 USD = ₹{xeCurrency.usdToInr.toFixed(4)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        Formula settlement baseline: <strong className="text-slate-900 dark:text-white">₹{xeCurrency.ttSellingRate}/USD</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-[#c56718] dark:text-amber-400 border border-amber-500/20 font-mono">
                      Import TT
                    </span>
                  </div>

                  {/* INR to USD (Transfer Rate) */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2235] border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        INR to USD (Rate Transfer)
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono">
                          1 INR = ${xeCurrency.inrToUsd.toFixed(6)}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        Outward transfer rate from XE.com
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                      Transfer Rate
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Formula Parameters Bar */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#0e2438] border border-slate-200 dark:border-slate-700/80 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-[#c56718] dark:text-amber-400 flex items-center gap-1.5">
                    <Sliders className="size-4" />
                    Live Input Parameters (Adjustable)
                  </h5>
                  <span className="text-xs text-slate-400">
                    SBI / RBI / LME Trading Parameters
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* LME Cash USD */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>LME Copper Cash</span>
                      <span className="text-[10px] text-[#c56718] dark:text-amber-400 font-mono">USD / MT</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">$</span>
                      <Input
                        type="number"
                        step={10}
                        value={lmeCashUsd}
                        onChange={(e) => setLmeCashUsd(Number(e.target.value) || 0)}
                        className="pl-8 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:border-[#c56718] focus:ring-2 focus:ring-[#c56718]/30 rounded-xl"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">London Metal Exchange Cash</span>
                  </div>

                  {/* TT Selling Rate */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        TT Selling Rate
                      </label>
                      <button
                        onClick={() => {
                          setTtSellingRate(xeCurrency.ttSellingRate);
                          setIsXeSynced(true);
                          toast.success("TT Selling synchronized with XE.com live rate");
                        }}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-[#c56718] dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
                        title="Click to reset to XE.com live rate"
                      >
                        XE.com: ₹{xeCurrency.ttSellingRate}
                      </button>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">₹</span>
                      <Input
                        type="number"
                        step={0.05}
                        value={ttSellingRate}
                        onChange={(e) => {
                          setTtSellingRate(Number(e.target.value) || 0);
                          setIsXeSynced(false);
                        }}
                        className="pl-8 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:border-[#c56718] focus:ring-2 focus:ring-[#c56718]/30 rounded-xl"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {isXeSynced ? "✓ Live synced with XE.com" : "Manual override active"}
                    </span>
                  </div>

                  {/* Multiplication Factor (1.058) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Multiplication Factor</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">1.058</span>
                    </label>
                    <Input
                      type="number"
                      step={0.001}
                      value={multiplicationFactor}
                      onChange={(e) => setMultiplicationFactor(Number(e.target.value) || 1.058)}
                      className="bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:border-[#c56718] focus:ring-2 focus:ring-[#c56718]/30 rounded-xl"
                    />
                    <span className="text-[10px] text-slate-400 block">Statutory Customs Duty & SWS (5% + 10%)</span>
                  </div>

                  {/* Handling Charges (3300 PMT) */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Handling Charges</span>
                      <span className="text-[10px] text-[#c56718] dark:text-amber-400 font-mono">₹ / PMT</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">₹</span>
                      <Input
                        type="number"
                        step={100}
                        value={handlingChargesPmt}
                        onChange={(e) => setHandlingChargesPmt(Number(e.target.value) || 0)}
                        className="pl-8 bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:border-[#c56718] focus:ring-2 focus:ring-[#c56718]/30 rounded-xl"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">Port Clearance & Domestic Logistics</span>
                  </div>
                </div>
              </div>

              {/* 5 Statutory Product Grades Price Schedule Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c56718] dark:text-amber-400 flex items-center gap-1.5">
                    <Coins className="size-4" />
                    Official Conductor Grade Pricing Schedule (All 5 Grades)
                  </span>
                  <span className="text-xs text-slate-400">
                    Click any grade to view step-by-step math breakdown
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {gradesCalculation.map((grade) => {
                    const isSelected = grade.id === selectedGradeId;
                    return (
                      <div
                        key={grade.id}
                        onClick={() => setSelectedGradeId(grade.id)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isSelected
                            ? "bg-amber-50/70 dark:bg-[#133554] border-2 border-[#c56718] shadow-md shadow-orange-600/10 ring-1 ring-[#c56718]/30"
                            : "bg-white dark:bg-[#0c2235] border-slate-200 dark:border-slate-700/80 hover:border-amber-300 hover:bg-slate-50/60"
                        }`}
                      >
                        {/* Grade Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                              {grade.category}
                            </span>
                            {grade.differentialInrPmt !== 0 && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                                grade.differentialInrPmt < 0
                                  ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200"
                                  : "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200"
                              }`}>
                                {grade.differentialNote}
                              </span>
                            )}
                          </div>
                          <h6 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {grade.name}
                          </h6>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {grade.spec}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                            <span>Premium: <strong className="text-slate-900 dark:text-white">${grade.premiumUsd}/MT</strong></span>
                            <span>•</span>
                            <span>Factor: <strong className="text-slate-900 dark:text-white">{multiplicationFactor}</strong></span>
                            <span>•</span>
                            <span>Handling: <strong className="text-slate-900 dark:text-white">₹{handlingChargesPmt} PMT</strong></span>
                          </div>
                        </div>

                        {/* Calculated Output Badges */}
                        <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                              Basic Price Per MT
                            </span>
                            <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 font-mono">
                              ₹{grade.basicPricePmt.toLocaleString("en-IN")}
                            </span>
                            <span className="text-[10px] text-slate-400 block">/ Metric Ton</span>
                          </div>

                          <div className="text-right pl-4 border-l border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-[#c56718] dark:text-amber-400 uppercase font-bold block">
                              Basic Price Per Kg
                            </span>
                            <span className="text-xl sm:text-2xl font-black text-[#c56718] dark:text-amber-400 font-mono tracking-tight">
                              ₹{grade.basicPricePerKg.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">/ kg excl. GST</span>
                          </div>

                          <div className="hidden sm:block">
                            <Button
                              size="sm"
                              className={
                                isSelected
                                  ? "bg-gradient-to-r from-[#c56718] via-[#d97706] to-[#b45309] text-white font-bold text-xs"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs"
                              }
                            >
                              {isSelected ? "Active" : "Inspect"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step-by-Step Mathematical Proof Breakdown for Active Grade */}
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="size-4 text-[#c56718] dark:text-amber-400" />
                    Step-by-Step Formula Math: {activeGrade.name}
                  </h5>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-[#c56718] dark:text-amber-400 border border-slate-200 dark:border-slate-700">
                    LME ${lmeCashUsd} + Premium ${activeGrade.premiumUsd}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c2235] border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-[#c56718] dark:text-amber-400 block">
                      STEP 1: CIF Base (USD)
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      LME (${lmeCashUsd}) + Prem (${activeGrade.premiumUsd})
                    </p>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white font-mono block">
                      = ${activeGrade.landedUsd.toLocaleString("en-US")} / MT
                    </strong>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c2235] border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-[#c56718] dark:text-amber-400 block">
                      STEP 2: Duty Landed (USD)
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      Base (${activeGrade.landedUsd}) × {multiplicationFactor}
                    </p>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white font-mono block">
                      = ${activeGrade.dutyAdjustedUsd.toLocaleString("en-US")} / MT
                    </strong>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#0c2235] border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-[#c56718] dark:text-amber-400 block">
                      STEP 3: INR Converted (PMT)
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      Duty USD × TT (₹{ttSellingRate})
                    </p>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white font-mono block">
                      = ₹{activeGrade.convertedInrPmt.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 space-y-1">
                    <span className="text-[10px] font-bold text-[#c56718] dark:text-amber-400 block">
                      STEP 4: Final Basic Price
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                      INR PMT + ₹{handlingChargesPmt} {activeGrade.differentialInrPmt !== 0 ? `(${activeGrade.differentialInrPmt > 0 ? "+" : ""}${activeGrade.differentialInrPmt})` : ""}
                    </p>
                    <strong className="text-sm font-black text-[#c56718] dark:text-amber-400 font-mono block">
                      = ₹{activeGrade.basicPricePmt.toLocaleString("en-IN")} PMT
                    </strong>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <span>Effective Basic Price per Kilogram: </span>
                    <strong className="text-[#c56718] dark:text-amber-400 font-mono font-black text-base ml-1">
                      ₹{activeGrade.basicPricePerKg.toFixed(2)} / kg
                    </strong>
                    <span className="text-[11px] text-slate-400 ml-2">
                      (₹{activeGrade.basicPricePmt.toLocaleString("en-IN")} ÷ 1000)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        setCalcMetal("copper");
                        setCalcPriceSource("basic-price");
                        setActiveTab("calculator");
                        toast.success(`Loaded ${activeGrade.name} (₹${activeGrade.basicPricePerKg}/kg) into Cable Estimator!`);
                      }}
                      className="bg-gradient-to-r from-[#c56718] via-[#d97706] to-[#b45309] hover:from-[#d97706] hover:to-[#a04a0a] text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer shadow-md shadow-orange-600/20"
                    >
                      <span>Apply to Cable Estimator</span>
                      <ArrowRight className="size-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CABLE METAL BOM ESTIMATOR */}
          {activeTab === "calculator" && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c56718] dark:text-amber-400 block">
                      Cable Conductor Estimator
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      Estimate Conductor Metal Weight & Procurement Cost
                    </h4>
                  </div>

                  {/* Pricing Source Toggle */}
                  {calcMetal === "copper" && (
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                      <button
                        onClick={() => setCalcPriceSource("basic-price")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          calcPriceSource === "basic-price"
                            ? "bg-gradient-to-r from-[#c56718] to-[#ea580c] text-white shadow"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                        }`}
                      >
                        Basic Price (₹{activeGrade.basicPricePerKg}/kg)
                      </button>
                      <button
                        onClick={() => setCalcPriceSource("mcx")}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          calcPriceSource === "mcx"
                            ? "bg-gradient-to-r from-[#c56718] to-[#ea580c] text-white shadow"
                            : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                        }`}
                      >
                        MCX Spot (₹{metals[0].priceInrPerKg}/kg)
                      </button>
                    </div>
                  )}
                </div>

                {/* Input Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Conductor Metal
                    </label>
                    <select
                      value={calcMetal}
                      onChange={(e) => setCalcMetal(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold cursor-pointer focus:border-[#c56718]"
                    >
                      <option value="copper">Electrolytic Copper (99.97%)</option>
                      <option value="aluminium">EC Grade Aluminium Wire Rod</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Cores
                    </label>
                    <select
                      value={calcCores}
                      onChange={(e) => setCalcCores(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold cursor-pointer focus:border-[#c56718]"
                    >
                      <option value={1}>1 Core (Single Core)</option>
                      <option value={2}>2 Core</option>
                      <option value={3}>3 Core</option>
                      <option value={3.5}>3.5 Core</option>
                      <option value={4}>4 Core</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Conductor Size (sqmm)
                    </label>
                    <select
                      value={calcSqmm}
                      onChange={(e) => setCalcSqmm(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold cursor-pointer focus:border-[#c56718]"
                    >
                      <option value={4}>4 sqmm</option>
                      <option value={6}>6 sqmm</option>
                      <option value={10}>10 sqmm</option>
                      <option value={16}>16 sqmm</option>
                      <option value={25}>25 sqmm</option>
                      <option value={35}>35 sqmm</option>
                      <option value={50}>50 sqmm</option>
                      <option value={70}>70 sqmm</option>
                      <option value={95}>95 sqmm</option>
                      <option value={120}>120 sqmm</option>
                      <option value={150}>150 sqmm</option>
                      <option value={185}>185 sqmm</option>
                      <option value={240}>240 sqmm</option>
                      <option value={300}>300 sqmm</option>
                      <option value={400}>400 sqmm</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Required Drum Length (Metres)
                    </label>
                    <Input
                      type="number"
                      min={50}
                      step={50}
                      value={calcLength}
                      onChange={(e) => setCalcLength(Number(e.target.value) || 0)}
                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:border-[#c56718] rounded-xl"
                    />
                  </div>
                </div>

                {/* Calculation Output Card */}
                <div className="p-6 rounded-2xl bg-white dark:bg-[#0c2235] border border-amber-200 dark:border-amber-500/40 grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-sm">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      Conductor Metal Weight
                    </span>
                    <strong className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {metalCalculation.totalWeightKg.toLocaleString()} kg
                    </strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      ({metalCalculation.kgPerKm} kg per km length)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#c56718] dark:text-amber-400 uppercase tracking-wider block font-bold">
                      Pure Metal Value
                    </span>
                    <strong className="text-xl sm:text-2xl font-black text-[#c56718] dark:text-amber-400 font-mono">
                      ₹{metalCalculation.metalCostTotal.toLocaleString("en-IN")}
                    </strong>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      @ ₹{metalCalculation.appliedRatePerKg.toFixed(2)}/kg (
                      {calcPriceSource === "basic-price" && calcMetal === "copper" ? activeGrade.name : "Live Exchange Spot"}
                      )
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                      Indicative Cable Lot Value
                    </span>
                    <strong className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                      ₹{metalCalculation.approxCableRetailEst.toLocaleString("en-IN")}
                    </strong>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-semibold mt-0.5">
                      Raw Metal: ~{metalCalculation.metalContributionPct}% of manufacturing cost
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    const priceType = calcPriceSource === "basic-price" && calcMetal === "copper"
                      ? `Statutory Basic Price (${activeGrade.name}): ₹${metalCalculation.appliedRatePerKg}/kg`
                      : `Live Exchange Spot: ₹${metalCalculation.appliedRatePerKg}/kg`;

                    const spec = `${calcCores}C x ${calcSqmm} sqmm ${calcMetal.toUpperCase()} Cable (${calcLength}m) - Raw Metal Weight: ${metalCalculation.totalWeightKg}kg @ ${priceType}`;
                    if (onRequestLockedQuote) {
                      onRequestLockedQuote(spec);
                    } else {
                      toast.success("Metal cost parameters submitted to supply desk!");
                    }
                    onClose();
                  }}
                  className="w-full sm:w-auto py-3.5 px-7 rounded-xl bg-gradient-to-r from-[#c56718] via-[#d97706] to-[#b45309] hover:from-[#d97706] hover:to-[#a04a0a] text-white font-bold text-xs tracking-wide shadow-lg shadow-orange-600/25 hover:shadow-orange-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="size-4" />
                  <span>Lock-in Price Quote for this Drum Specification</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-[#091a29] text-xs text-slate-500 dark:text-slate-400 shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="line-clamp-1">
              Indexed to MCX, LME, XE.com & Standard IEEMA Conductor Pricing Circular
            </span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCopyCircular}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[#c56718] dark:text-amber-400 font-bold cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <Copy className="size-3.5" />
              <span>Copy Full Circular</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold cursor-pointer text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
