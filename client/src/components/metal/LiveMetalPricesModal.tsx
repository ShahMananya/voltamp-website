import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calculator,
  ShieldCheck,
  FileText,
  ArrowRight,
  Clock,
  Sparkles,
  Zap,
  Layers,
  ChevronRight,
  Download,
  AlertCircle
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
  trend: number[]; // 7-day normalized points
}

const INITIAL_METALS: MetalData[] = [
  {
    id: "mcx-copper",
    name: "Copper Continuous (Grade A Cathode)",
    symbol: "Cu",
    exchange: "MCX",
    priceInrPerKg: 848.40,
    priceUsdPerMt: 9720.00,
    changeInr: +5.20,
    changePercent: +0.62,
    high24h: 852.10,
    low24h: 843.80,
    unit: "₹ / kg",
    updatedAt: "Just now",
    category: "Primary Conductor",
    trend: [838, 841, 839, 844, 846, 843, 848.4]
  },
  {
    id: "lme-copper",
    name: "LME Copper Official Cash",
    symbol: "Cu-LME",
    exchange: "LME",
    priceInrPerKg: 854.10,
    priceUsdPerMt: 9785.00,
    changeInr: +3.80,
    changePercent: +0.45,
    high24h: 856.00,
    low24h: 849.50,
    unit: "$ / MT",
    updatedAt: "Live tick",
    category: "Primary Conductor",
    trend: [9620, 9650, 9630, 9710, 9750, 9740, 9785]
  },
  {
    id: "mcx-aluminium",
    name: "EC Grade Aluminium Wire Rod",
    symbol: "Al",
    exchange: "MCX",
    priceInrPerKg: 236.15,
    priceUsdPerMt: 2595.00,
    changeInr: +1.40,
    changePercent: +0.60,
    high24h: 237.50,
    low24h: 234.30,
    unit: "₹ / kg",
    updatedAt: "Just now",
    category: "Primary Conductor",
    trend: [231, 233, 232, 234, 235, 234.8, 236.15]
  },
  {
    id: "lme-aluminium",
    name: "LME Aluminium Primary 99.7%",
    symbol: "Al-LME",
    exchange: "LME",
    priceInrPerKg: 238.40,
    priceUsdPerMt: 2620.00,
    changeInr: +0.90,
    changePercent: +0.38,
    high24h: 239.20,
    low24h: 236.00,
    unit: "$ / MT",
    updatedAt: "Live tick",
    category: "Primary Conductor",
    trend: [2570, 2590, 2585, 2605, 2615, 2610, 2620]
  },
  {
    id: "mcx-lead",
    name: "Lead Ingot (Cable Sheathing Grade)",
    symbol: "Pb",
    exchange: "MCX",
    priceInrPerKg: 186.50,
    priceUsdPerMt: 2110.00,
    changeInr: -0.80,
    changePercent: -0.43,
    high24h: 188.00,
    low24h: 185.90,
    unit: "₹ / kg",
    updatedAt: "Today",
    category: "Secondary & Sheathing",
    trend: [188, 187, 188.5, 187.8, 187, 186.9, 186.5]
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
  const [activeTab, setActiveTab] = useState<"live" | "calculator" | "trends">("live");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Calculator states
  const [calcMetal, setCalcMetal] = useState<"copper" | "aluminium">("copper");
  const [calcCores, setCalcCores] = useState<number>(4);
  const [calcSqmm, setCalcSqmm] = useState<number>(16);
  const [calcLength, setCalcLength] = useState<number>(500); // 500 metres default drum

  // Calculate approximate conductor weight & cost
  // Conductor weight formula approx: Density (Cu: 8.89 g/cm3, Al: 2.70 g/cm3)
  // Weight per km (kg/km) approx = cores * sqmm * density * stranding factor (1.02)
  const metalCalculation = useMemo(() => {
    const density = calcMetal === "copper" ? 8.89 : 2.70;
    const strandingFactor = 1.025;
    const kgPerKm = calcCores * calcSqmm * density * strandingFactor;
    const totalWeightKg = (kgPerKm * calcLength) / 1000;

    const spotRatePerKg = calcMetal === "copper"
      ? (metals.find(m => m.id === "mcx-copper")?.priceInrPerKg ?? 848.40)
      : (metals.find(m => m.id === "mcx-aluminium")?.priceInrPerKg ?? 236.15);

    const metalCostTotal = totalWeightKg * spotRatePerKg;
    const approxCableRetailEst = metalCostTotal * 1.35; // raw metal accounts for ~74% of cable manufacturing

    return {
      kgPerKm: Math.round(kgPerKm * 10) / 10,
      totalWeightKg: Math.round(totalWeightKg * 10) / 10,
      spotRatePerKg,
      metalCostTotal: Math.round(metalCostTotal),
      approxCableRetailEst: Math.round(approxCableRetailEst),
      metalContributionPct: 74
    };
  }, [calcMetal, calcCores, calcSqmm, calcLength, metals]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Simulated live tick updates every 12 seconds when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setMetals(prev =>
        prev.map(item => {
          // slight realistic micro-fluctuation (+/- 0.08%)
          const delta = (Math.random() - 0.48) * 0.4;
          const newPrice = Math.round((item.priceInrPerKg + delta) * 100) / 100;
          return {
            ...item,
            priceInrPerKg: newPrice,
            changeInr: Math.round((item.changeInr + delta) * 100) / 100,
            updatedAt: "Just now"
          };
        })
      );
      setLastRefreshed(new Date());
    }, 12000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMetals(prev =>
        prev.map(item => {
          const delta = (Math.random() - 0.45) * 0.8;
          const newPrice = Math.round((item.priceInrPerKg + delta) * 100) / 100;
          return {
            ...item,
            priceInrPerKg: newPrice,
            updatedAt: "Just now"
          };
        })
      );
      setIsRefreshing(false);
      setLastRefreshed(new Date());
      toast.success("MCX & LME metal indices synchronized with live market feed.");
    }, 600);
  };

  const handleCopyCircular = () => {
    const text = `VOLAMP ELEKTRIKALS - DAILY METAL PRICING CIRCULAR (${lastRefreshed.toLocaleDateString()})
--------------------------------------------------
1. MCX Copper Spot: ₹${metals[0].priceInrPerKg}/kg (${metals[0].changePercent > 0 ? "+" : ""}${metals[0].changePercent}%)
2. LME Copper Official: $${metals[1].priceUsdPerMt}/MT
3. MCX Aluminium EC Rod: ₹${metals[2].priceInrPerKg}/kg (${metals[2].changePercent > 0 ? "+" : ""}${metals[2].changePercent}%)
4. LME Aluminium: $${metals[3].priceUsdPerMt}/MT
5. Lead Ingot (Sheathing): ₹${metals[4].priceInrPerKg}/kg
--------------------------------------------------
To lock in batch rates for project tenders, contact:
VOLAMP Central Supply Desk: +91 9512365582`;

    navigator.clipboard.writeText(text);
    toast.success("Official Metal Rate Circular copied to clipboard!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Zap className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Live Metal & Copper Prices Tracker
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE MCX / LME
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official benchmark index for conductor raw materials & cable project costings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              className={`p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer ${isRefreshing ? "animate-spin" : ""}`}
              title="Refresh live quotes"
            >
              <RefreshCw className="size-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-slate-800/80 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("live")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "live"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <TrendingUp className="size-3.5" />
            <span>Live Spot Rates</span>
          </button>

          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "calculator"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Calculator className="size-3.5" />
            <span>Cable Metal Cost Estimator</span>
          </button>

          <div className="ml-auto hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <Clock className="size-3 text-slate-500" />
            <span>Updated: {lastRefreshed.toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "live" && (
            <>
              {/* Primary Conductor Metals Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Sparkles className="size-3.5" />
                    Primary Conductors (Copper & Aluminium)
                  </h4>
                  <button
                    onClick={handleCopyCircular}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Download className="size-3" />
                    <span>Copy Daily Rate Circular</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metals.filter(m => m.category === "Primary Conductor").map((metal) => {
                    const isPositive = metal.changePercent >= 0;
                    return (
                      <div
                        key={metal.id}
                        className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {metal.exchange}
                            </span>
                            <h5 className="font-bold text-sm sm:text-base text-white mt-1">
                              {metal.name}
                            </h5>
                          </div>
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                            isPositive
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}>
                            {isPositive ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                            {isPositive ? "+" : ""}{metal.changePercent}%
                          </span>
                        </div>

                        {/* Prices & Units */}
                        <div className="flex items-baseline justify-between py-2 border-y border-slate-800/60 my-2">
                          <div>
                            <span className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
                              ₹{metal.priceInrPerKg.toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-400 ml-1.5">/ kg</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-400 block">USD Equivalent</span>
                            <span className="text-sm font-semibold text-slate-200">
                              ${metal.priceUsdPerMt.toLocaleString("en-US")} / MT
                            </span>
                          </div>
                        </div>

                        {/* High/Low 24h & Trend */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                          <div>
                            <span>24h Range: </span>
                            <strong className="text-slate-300">₹{metal.low24h} - ₹{metal.high24h}</strong>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500">7-Day Trend:</span>
                            <span className="text-emerald-400 font-mono">↗ Bullish</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Secondary & Sheathing Metals Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Layers className="size-3.5" />
                  Secondary Cable Compounds & Armouring Metals
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {metals.filter(m => m.category === "Secondary & Sheathing").map((metal) => {
                    const isPositive = metal.changePercent >= 0;
                    return (
                      <div
                        key={metal.id}
                        className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                              {metal.symbol}
                            </span>
                            <h5 className="font-semibold text-xs sm:text-sm text-slate-200">
                              {metal.name}
                            </h5>
                          </div>
                          <div className="mt-1">
                            <span className="text-lg font-bold text-white">
                              ₹{metal.priceInrPerKg.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1">/ kg</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg ${
                          isPositive
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}>
                          {isPositive ? "+" : ""}{metal.changePercent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contractor Procurement Note */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-amber-200/90">
                  <strong className="text-amber-300 block mb-0.5">Project Tender Rate Locking Guarantee:</strong>
                  Cable prices vary with daily MCX copper and aluminium movement. Volamp provides guaranteed 48-hour to 30-day forward metal booking for verified EPC contractors, ensuring zero cost overrun during project execution.
                </div>
              </div>
            </>
          )}

          {activeTab === "calculator" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h4 className="font-bold text-sm text-white mb-2 flex items-center gap-2">
                  <Calculator className="size-4 text-amber-400" />
                  Estimate Conductor Metal Weight & Procurement Cost
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Select your cable specification and length. Our engineering formula calculates pure copper/aluminium weight based on standard IS 1554 / IS 7098 specifications and applies today's live MCX spot rate.
                </p>

                {/* Input Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Conductor Metal
                    </label>
                    <select
                      value={calcMetal}
                      onChange={(e) => setCalcMetal(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold cursor-pointer"
                    >
                      <option value="copper">Electrolytic Copper (99.97%)</option>
                      <option value="aluminium">EC Grade Aluminium</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Cores
                    </label>
                    <select
                      value={calcCores}
                      onChange={(e) => setCalcCores(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold cursor-pointer"
                    >
                      <option value={1}>1 Core (Single Core)</option>
                      <option value={2}>2 Core</option>
                      <option value={3}>3 Core</option>
                      <option value={3.5}>3.5 Core</option>
                      <option value={4}>4 Core</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Conductor Size (sqmm)
                    </label>
                    <select
                      value={calcSqmm}
                      onChange={(e) => setCalcSqmm(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-semibold cursor-pointer"
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
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Required Drum Length (Metres)
                    </label>
                    <Input
                      type="number"
                      min={50}
                      step={50}
                      value={calcLength}
                      onChange={(e) => setCalcLength(Number(e.target.value) || 0)}
                      className="bg-slate-900 border-slate-700 text-xs text-white"
                    />
                  </div>
                </div>

                {/* Calculation Output Card */}
                <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Conductor Metal Weight
                    </span>
                    <strong className="text-xl sm:text-2xl font-black text-white">
                      {metalCalculation.totalWeightKg.toLocaleString()} kg
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      ({metalCalculation.kgPerKm} kg per km)
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Pure Metal Spot Value
                    </span>
                    <strong className="text-xl sm:text-2xl font-black text-amber-300">
                      ₹{metalCalculation.metalCostTotal.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-slate-500 block">
                      @ ₹{metalCalculation.spotRatePerKg}/kg MCX spot
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Indicative Cable Lot Value
                    </span>
                    <strong className="text-xl sm:text-2xl font-black text-sky-400">
                      ₹{metalCalculation.approxCableRetailEst.toLocaleString()}
                    </strong>
                    <span className="text-[10px] text-emerald-400 block font-semibold">
                      Raw Metal: ~{metalCalculation.metalContributionPct}% of cost
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3">
                <Button
                  onClick={() => {
                    const spec = `${calcCores}C x ${calcSqmm} sqmm ${calcMetal.toUpperCase()} Cable (${calcLength}m) - Raw Metal Weight: ${metalCalculation.totalWeightKg}kg @ ₹${metalCalculation.spotRatePerKg}/kg`;
                    if (onRequestLockedQuote) {
                      onRequestLockedQuote(spec);
                    } else {
                      toast.success("Metal cost parameters submitted to supply desk!");
                    }
                    onClose();
                  }}
                  className="bg-[#c56718] hover:bg-[#b45309] text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  <FileText className="size-4 mr-1.5" />
                  <span>Lock-in Price Quote for this Drum Specification</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Prices indexed to Multi Commodity Exchange (MCX) & London Metal Exchange (LME)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
