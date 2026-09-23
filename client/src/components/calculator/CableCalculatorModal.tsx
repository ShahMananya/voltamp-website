import React, { useState, useMemo } from "react";
import {
  X,
  Calculator,
  Zap,
  ShieldCheck,
  Building2,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  Percent,
  Layers,
  Scale,
  Sparkles,
  Sliders,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";

export interface CableCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuote?: (prefilledText?: string) => void;
}

// 1. Cable Categories & Specifications
export interface CableTypeOption {
  id: string;
  name: string;
  category: string;
  conductors: ("Copper" | "Aluminum")[];
  cores: string[];
  sizes: { size: string; copperBasePrice: number; aluBasePrice: number; approxWeightKgPerKm: number }[];
  standard: string;
  voltage: string;
}

export const CABLE_CATALOG: CableTypeOption[] = [
  {
    id: "lt-armored",
    name: "LT Armored Power Cable (XLPE/PVC)",
    category: "Power Cables",
    conductors: ["Aluminum", "Copper"],
    cores: ["2 Core", "3 Core", "3.5 Core", "4 Core"],
    sizes: [
      { size: "1.5 sq.mm", copperBasePrice: 85, aluBasePrice: 38, approxWeightKgPerKm: 280 },
      { size: "2.5 sq.mm", copperBasePrice: 125, aluBasePrice: 48, approxWeightKgPerKm: 340 },
      { size: "4.0 sq.mm", copperBasePrice: 175, aluBasePrice: 62, approxWeightKgPerKm: 420 },
      { size: "6.0 sq.mm", copperBasePrice: 245, aluBasePrice: 78, approxWeightKgPerKm: 510 },
      { size: "10 sq.mm", copperBasePrice: 390, aluBasePrice: 115, approxWeightKgPerKm: 680 },
      { size: "16 sq.mm", copperBasePrice: 580, aluBasePrice: 165, approxWeightKgPerKm: 920 },
      { size: "25 sq.mm", copperBasePrice: 890, aluBasePrice: 235, approxWeightKgPerKm: 1350 },
      { size: "35 sq.mm", copperBasePrice: 1220, aluBasePrice: 310, approxWeightKgPerKm: 1750 },
      { size: "50 sq.mm", copperBasePrice: 1680, aluBasePrice: 410, approxWeightKgPerKm: 2300 },
      { size: "70 sq.mm", copperBasePrice: 2380, aluBasePrice: 560, approxWeightKgPerKm: 3100 },
      { size: "95 sq.mm", copperBasePrice: 3250, aluBasePrice: 740, approxWeightKgPerKm: 4100 },
      { size: "120 sq.mm", copperBasePrice: 4100, aluBasePrice: 920, approxWeightKgPerKm: 5050 },
      { size: "150 sq.mm", copperBasePrice: 5100, aluBasePrice: 1140, approxWeightKgPerKm: 6200 },
      { size: "185 sq.mm", copperBasePrice: 6350, aluBasePrice: 1410, approxWeightKgPerKm: 7600 },
      { size: "240 sq.mm", copperBasePrice: 8300, aluBasePrice: 1820, approxWeightKgPerKm: 9750 },
      { size: "300 sq.mm", copperBasePrice: 10400, aluBasePrice: 2280, approxWeightKgPerKm: 12100 },
      { size: "400 sq.mm", copperBasePrice: 13800, aluBasePrice: 2950, approxWeightKgPerKm: 15800 },
    ],
    standard: "IS: 7098 (Part 1) / IEC 60502-1",
    voltage: "1.1 kV (1100 Volts)",
  },
  {
    id: "ht-armored-11kv",
    name: "HT 11kV Grade XLPE Armored Cable",
    category: "High Tension (HT)",
    conductors: ["Aluminum", "Copper"],
    cores: ["1 Core", "3 Core"],
    sizes: [
      { size: "35 sq.mm", copperBasePrice: 1850, aluBasePrice: 620, approxWeightKgPerKm: 2800 },
      { size: "50 sq.mm", copperBasePrice: 2450, aluBasePrice: 790, approxWeightKgPerKm: 3400 },
      { size: "70 sq.mm", copperBasePrice: 3350, aluBasePrice: 990, approxWeightKgPerKm: 4300 },
      { size: "95 sq.mm", copperBasePrice: 4450, aluBasePrice: 1280, approxWeightKgPerKm: 5500 },
      { size: "120 sq.mm", copperBasePrice: 5550, aluBasePrice: 1540, approxWeightKgPerKm: 6600 },
      { size: "150 sq.mm", copperBasePrice: 6800, aluBasePrice: 1860, approxWeightKgPerKm: 7900 },
      { size: "185 sq.mm", copperBasePrice: 8350, aluBasePrice: 2240, approxWeightKgPerKm: 9400 },
      { size: "240 sq.mm", copperBasePrice: 10800, aluBasePrice: 2820, approxWeightKgPerKm: 11800 },
      { size: "300 sq.mm", copperBasePrice: 13400, aluBasePrice: 3450, approxWeightKgPerKm: 14400 },
      { size: "400 sq.mm", copperBasePrice: 17600, aluBasePrice: 4450, approxWeightKgPerKm: 18600 },
    ],
    standard: "IS: 7098 (Part 2) / IEC 60502-2",
    voltage: "11 kV Earthed",
  },
  {
    id: "ht-armored-33kv",
    name: "HT 33kV Grade XLPE Heavy Cable",
    category: "High Tension (HT)",
    conductors: ["Aluminum", "Copper"],
    cores: ["1 Core", "3 Core"],
    sizes: [
      { size: "70 sq.mm", copperBasePrice: 5200, aluBasePrice: 1850, approxWeightKgPerKm: 6800 },
      { size: "95 sq.mm", copperBasePrice: 6600, aluBasePrice: 2280, approxWeightKgPerKm: 8200 },
      { size: "120 sq.mm", copperBasePrice: 8100, aluBasePrice: 2720, approxWeightKgPerKm: 9700 },
      { size: "150 sq.mm", copperBasePrice: 9750, aluBasePrice: 3200, approxWeightKgPerKm: 11400 },
      { size: "185 sq.mm", copperBasePrice: 11800, aluBasePrice: 3780, approxWeightKgPerKm: 13300 },
      { size: "240 sq.mm", copperBasePrice: 14900, aluBasePrice: 4650, approxWeightKgPerKm: 16500 },
      { size: "300 sq.mm", copperBasePrice: 18200, aluBasePrice: 5600, approxWeightKgPerKm: 19800 },
      { size: "400 sq.mm", copperBasePrice: 23600, aluBasePrice: 7100, approxWeightKgPerKm: 25100 },
    ],
    standard: "IS: 7098 (Part 2) / IEC 60502-2",
    voltage: "33 kV Earthed",
  },
  {
    id: "frls-house-wire",
    name: "FRLS Industrial & House Wire (Single Core)",
    category: "Building & House Wires",
    conductors: ["Copper"],
    cores: ["Single Core (Flexible)"],
    sizes: [
      { size: "0.75 sq.mm", copperBasePrice: 14, aluBasePrice: 0, approxWeightKgPerKm: 12 },
      { size: "1.0 sq.mm", copperBasePrice: 18, aluBasePrice: 0, approxWeightKgPerKm: 15 },
      { size: "1.5 sq.mm", copperBasePrice: 26, aluBasePrice: 0, approxWeightKgPerKm: 22 },
      { size: "2.5 sq.mm", copperBasePrice: 42, aluBasePrice: 0, approxWeightKgPerKm: 34 },
      { size: "4.0 sq.mm", copperBasePrice: 64, aluBasePrice: 0, approxWeightKgPerKm: 52 },
      { size: "6.0 sq.mm", copperBasePrice: 96, aluBasePrice: 0, approxWeightKgPerKm: 76 },
      { size: "10 sq.mm", copperBasePrice: 168, aluBasePrice: 0, approxWeightKgPerKm: 128 },
      { size: "16 sq.mm", copperBasePrice: 268, aluBasePrice: 0, approxWeightKgPerKm: 198 },
    ],
    standard: "IS: 694 / IEC 60227 Flame Retardant Low Smoke",
    voltage: "1100 Volts",
  },
  {
    id: "solar-dc-cable",
    name: "Solar DC Photovoltaic Cable (Crosslinked Polyolefin)",
    category: "Solar & Clean Energy",
    conductors: ["Copper"],
    cores: ["1 Core (Tinned Copper)"],
    sizes: [
      { size: "4.0 sq.mm", copperBasePrice: 52, aluBasePrice: 0, approxWeightKgPerKm: 65 },
      { size: "6.0 sq.mm", copperBasePrice: 76, aluBasePrice: 0, approxWeightKgPerKm: 88 },
      { size: "10 sq.mm", copperBasePrice: 128, aluBasePrice: 0, approxWeightKgPerKm: 142 },
      { size: "16 sq.mm", copperBasePrice: 198, aluBasePrice: 0, approxWeightKgPerKm: 215 },
    ],
    standard: "EN 50618 / IEC 62930 / TUV 2PfG 1169",
    voltage: "1500V DC rated (1800V max)",
  },
  {
    id: "submersible-flat",
    name: "3-Core Submersible Flat Pump Cable",
    category: "Agricultural & Submersible",
    conductors: ["Copper"],
    cores: ["3 Core Flat"],
    sizes: [
      { size: "1.5 sq.mm", copperBasePrice: 88, aluBasePrice: 0, approxWeightKgPerKm: 110 },
      { size: "2.5 sq.mm", copperBasePrice: 138, aluBasePrice: 0, approxWeightKgPerKm: 165 },
      { size: "4.0 sq.mm", copperBasePrice: 210, aluBasePrice: 0, approxWeightKgPerKm: 240 },
      { size: "6.0 sq.mm", copperBasePrice: 310, aluBasePrice: 0, approxWeightKgPerKm: 345 },
      { size: "10 sq.mm", copperBasePrice: 510, aluBasePrice: 0, approxWeightKgPerKm: 560 },
      { size: "16 sq.mm", copperBasePrice: 790, aluBasePrice: 0, approxWeightKgPerKm: 860 },
    ],
    standard: "IS: 694 Water-Resistant & Heavy Duty",
    voltage: "1100 Volts",
  },
];

export const BRAND_MULTIPLIERS: { name: string; multiplier: number; badge: string }[] = [
  { name: "Polycab", multiplier: 1.0, badge: "Master Distributor" },
  { name: "Finolex", multiplier: 1.02, badge: "Direct Partner" },
  { name: "KEI Industries", multiplier: 0.99, badge: "EPC Partner" },
  { name: "Havells", multiplier: 1.03, badge: "Authorized" },
  { name: "RR Kabel", multiplier: 0.98, badge: "Direct Partner" },
  { name: "Volamp Industrial OEM", multiplier: 0.94, badge: "Direct Factory" },
];

export default function CableCalculatorModal({
  isOpen,
  onClose,
  onQuote,
}: CableCalculatorModalProps) {
  // Mode selection: 'cost' or 'sizing'
  const [activeTab, setActiveTab] = useState<"cost" | "sizing">("cost");

  // Selection states
  const [selectedCableId, setSelectedCableId] = useState<string>("lt-armored");
  const [conductor, setConductor] = useState<"Copper" | "Aluminum">("Copper");
  const [selectedCore, setSelectedCore] = useState<string>("3.5 Core");
  const [selectedSize, setSelectedSize] = useState<string>("50 sq.mm");
  const [selectedBrand, setSelectedBrand] = useState<string>("Polycab");
  const [quantityMeters, setQuantityMeters] = useState<number>(500);
  const [contractorDiscount, setContractorDiscount] = useState<number>(12);
  const [includeGst, setIncludeGst] = useState<boolean>(true);

  // Sizing Calculator states
  const [loadKw, setLoadKw] = useState<number>(30);
  const [voltagePhase, setVoltagePhase] = useState<"415V_3P" | "230V_1P">("415V_3P");
  const [runDistanceMeters, setRunDistanceMeters] = useState<number>(80);
  const [powerFactor, setPowerFactor] = useState<number>(0.85);

  const activeCableType = useMemo(() => {
    return CABLE_CATALOG.find((c) => c.id === selectedCableId) ?? CABLE_CATALOG[0];
  }, [selectedCableId]);

  // Adjust conductor when switching cable types
  const availableConductors = activeCableType.conductors;
  const currentConductor = availableConductors.includes(conductor) ? conductor : availableConductors[0];

  // Adjust cores
  const currentCore = activeCableType.cores.includes(selectedCore) ? selectedCore : activeCableType.cores[0];

  // Adjust size
  const currentSizeObj =
    activeCableType.sizes.find((s) => s.size === selectedSize) ?? activeCableType.sizes[0];

  const currentBrandObj =
    BRAND_MULTIPLIERS.find((b) => b.name === selectedBrand) ?? BRAND_MULTIPLIERS[0];

  // Price calculations
  const rawUnitPrice = useMemo(() => {
    const base =
      currentConductor === "Copper"
        ? currentSizeObj.copperBasePrice
        : currentSizeObj.aluBasePrice;

    // Core multiplier adjustment for multi-core cables
    let coreFactor = 1.0;
    if (currentCore.includes("2 Core")) coreFactor = 0.65;
    else if (currentCore.includes("3 Core")) coreFactor = 0.9;
    else if (currentCore.includes("3.5 Core")) coreFactor = 1.0;
    else if (currentCore.includes("4 Core")) coreFactor = 1.15;

    return Math.round(base * coreFactor * currentBrandObj.multiplier);
  }, [currentConductor, currentSizeObj, currentCore, currentBrandObj]);

  const listTotal = rawUnitPrice * quantityMeters;
  const discountAmount = Math.round(listTotal * (contractorDiscount / 100));
  const taxableSubtotal = listTotal - discountAmount;
  const gstAmount = Math.round(taxableSubtotal * 0.18);
  const finalTotal = includeGst ? taxableSubtotal + gstAmount : taxableSubtotal;

  const totalWeightKg = Math.round((currentSizeObj.approxWeightKgPerKm * quantityMeters) / 1000);
  const drumType =
    quantityMeters > 500
      ? "Standard Wooden Cable Drum (1.2m – 1.6m Flange)"
      : quantityMeters >= 100
      ? "Compact Wooden Reel / Steel Banded"
      : "Standard Shrink-Wrapped Coils";

  // Sizing calculation
  const calculatedAmps = useMemo(() => {
    if (voltagePhase === "415V_3P") {
      // I = P (kW) * 1000 / (sqrt(3) * V * PF)
      return Math.round((loadKw * 1000) / (1.732 * 415 * powerFactor) * 10) / 10;
    } else {
      // I = P (kW) * 1000 / (V * PF)
      return Math.round((loadKw * 1000) / (230 * powerFactor) * 10) / 10;
    }
  }, [loadKw, voltagePhase, powerFactor]);

  const recommendedCableSize = useMemo(() => {
    const amps = calculatedAmps;
    if (amps <= 15) return "2.5 sq.mm Copper / 4 sq.mm Aluminum";
    if (amps <= 25) return "4 sq.mm Copper / 6 sq.mm Aluminum";
    if (amps <= 35) return "6 sq.mm Copper / 10 sq.mm Aluminum";
    if (amps <= 50) return "10 sq.mm Copper / 16 sq.mm Aluminum";
    if (amps <= 70) return "16 sq.mm Copper / 25 sq.mm Aluminum";
    if (amps <= 95) return "25 sq.mm Copper / 35 sq.mm Aluminum";
    if (amps <= 125) return "35 sq.mm Copper / 50 sq.mm Aluminum";
    if (amps <= 160) return "50 sq.mm Copper / 70 sq.mm Aluminum";
    if (amps <= 200) return "70 sq.mm Copper / 95 sq.mm Aluminum";
    if (amps <= 245) return "95 sq.mm Copper / 120 sq.mm Aluminum";
    if (amps <= 290) return "120 sq.mm Copper / 150 sq.mm Aluminum";
    if (amps <= 340) return "150 sq.mm Copper / 185 sq.mm Aluminum";
    if (amps <= 400) return "185 sq.mm Copper / 240 sq.mm Aluminum";
    return "240 sq.mm+ (Parallel runs recommended)";
  }, [calculatedAmps]);

  // Actions
  const handleCopySummary = () => {
    const summary = `VOLAMP ESTIMATE SUMMARY:
Product: ${selectedBrand} - ${activeCableType.name}
Spec: ${currentCore} x ${currentSizeObj.size} (${currentConductor})
Standard: ${activeCableType.standard} (${activeCableType.voltage})
Quantity: ${quantityMeters.toLocaleString("en-IN")} Metres
Indicative Rate: ₹${rawUnitPrice.toLocaleString("en-IN")}/m
Contractor Discount: ${contractorDiscount}% (-₹${discountAmount.toLocaleString("en-IN")})
Taxable Subtotal: ₹${taxableSubtotal.toLocaleString("en-IN")}
GST (18%): ₹${gstAmount.toLocaleString("en-IN")}
Estimated Net Total: ₹${finalTotal.toLocaleString("en-IN")}
Est. Weight: ~${totalWeightKg.toLocaleString("en-IN")} kg (${drumType})

Shared via Volamp Elektrikals Quick Order Estimator.`;

    navigator.clipboard.writeText(summary);
    toast.success("Estimate Copied to Clipboard!", {
      description: "You can now paste this bill of materials directly into your RFQ or email.",
    });
  };

  const handleWhatsAppQuote = () => {
    const msg = `Hello VOLAMP Supply Desk, I used the Cable Project Estimator and would like an official quote for:\n\n` +
      `• Brand: ${selectedBrand}\n` +
      `• Cable: ${activeCableType.name}\n` +
      `• Spec: ${currentCore} x ${currentSizeObj.size} (${currentConductor})\n` +
      `• Quantity: ${quantityMeters.toLocaleString("en-IN")} Metres\n` +
      `• Est. Total: ₹${finalTotal.toLocaleString("en-IN")} (incl. GST)\n\n` +
      `Please confirm stock availability, latest factory discount, and dispatch timeline.`;

    window.open(`https://wa.me/919512365582?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleTurnIntoQuote = () => {
    const summaryText = `${selectedBrand} ${activeCableType.name}, ${currentCore} x ${currentSizeObj.size} (${currentConductor}) - ${quantityMeters} Metres. Est: ₹${finalTotal.toLocaleString("en-IN")}`;
    onClose();
    if (onQuote) {
      onQuote(summaryText);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Volamp Electrical Project Calculator"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#fdfbf9] text-[#2c1d1f] shadow-2xl border border-[#ebd8ca] flex flex-col font-['Inter',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#ebd8ca] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-orange-50 text-[#ef7d19] border border-orange-200 flex items-center justify-center">
              <Calculator className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ef7d19]">
                  VOLAMP ENGINEERING TOOL
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live 2026 Price Index
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#4d1217] font-['Space_Grotesk'] leading-tight">
                Electrical Cable & Project Cost Calculator
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="hidden sm:flex bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "cost"
                    ? "bg-white text-[#4d1217] shadow-sm font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                onClick={() => setActiveTab("cost")}
              >
                1. Cable Cost Estimator
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "sizing"
                    ? "bg-white text-[#4d1217] shadow-sm font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                onClick={() => setActiveTab("sizing")}
              >
                2. Load / Sizing Guide
              </button>
            </div>

            <button
              onClick={onClose}
              className="size-9 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
              aria-label="Close calculator"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="sm:hidden flex border-b border-stone-200 bg-stone-100 p-1 text-xs">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg text-center font-bold ${
              activeTab === "cost" ? "bg-white text-[#4d1217] shadow-sm" : "text-stone-600"
            }`}
            onClick={() => setActiveTab("cost")}
          >
            Cost Estimator
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg text-center font-bold ${
              activeTab === "sizing" ? "bg-white text-[#4d1217] shadow-sm" : "text-stone-600"
            }`}
            onClick={() => setActiveTab("sizing")}
          >
            Load / Sizing Guide
          </button>
        </div>

        {/* Tab 1: Cable Cost Estimator */}
        {activeTab === "cost" && (
          <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Configuration Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Step 1: Cable Category & Type */}
              <div className="bg-white rounded-xl p-4 border border-[#ebd7c7] shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#c25e0a]">
                    Step 1: Cable Type & Grade
                  </label>
                  <span className="text-[11px] text-stone-500">{activeCableType.category}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CABLE_CATALOG.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedCableId(item.id);
                        if (!item.conductors.includes(conductor)) setConductor(item.conductors[0]);
                        if (!item.cores.includes(selectedCore)) setSelectedCore(item.cores[0]);
                        if (!item.sizes.some((s) => s.size === selectedSize))
                          setSelectedSize(item.sizes[0].size);
                      }}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col justify-between ${
                        selectedCableId === item.id
                          ? "border-[#ef7d19] bg-orange-50/50 text-[#4d1217] font-bold shadow-sm"
                          : "border-stone-200 hover:border-stone-300 bg-white text-stone-700"
                      }`}
                    >
                      <span className="font-bold text-xs">{item.name}</span>
                      <span className="text-[10px] text-stone-500 mt-1">{item.voltage}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Conductor, Cores & Brand */}
              <div className="bg-white rounded-xl p-4 border border-[#ebd7c7] shadow-sm space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-[#c25e0a] block">
                  Step 2: Conductor & Core Configuration
                </label>

                {/* Conductor Toggle */}
                <div>
                  <span className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Conductor Metal:
                  </span>
                  <div className="flex gap-2">
                    {availableConductors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setConductor(c)}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          currentConductor === c
                            ? "border-[#4d1217] bg-[#4d1217] text-white shadow-sm"
                            : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                        }`}
                      >
                        <Zap className="size-3.5 text-[#f5bf21]" />
                        <span>{c} Conductor</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cores Chips */}
                <div>
                  <span className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Number of Cores:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeCableType.cores.map((core) => (
                      <button
                        key={core}
                        type="button"
                        onClick={() => setSelectedCore(core)}
                        className={`py-1.5 px-3 rounded-lg border text-xs transition-all font-semibold ${
                          currentCore === core
                            ? "border-[#ef7d19] bg-[#ef7d19] text-white shadow-sm"
                            : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300"
                        }`}
                      >
                        {core}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand Selector */}
                <div>
                  <span className="text-xs font-semibold text-stone-700 block mb-1.5">
                    Preferred Manufacturer Brand:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BRAND_MULTIPLIERS.map((brand) => (
                      <button
                        key={brand.name}
                        type="button"
                        onClick={() => setSelectedBrand(brand.name)}
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${
                          selectedBrand === brand.name
                            ? "border-[#4d1217] bg-stone-100 font-bold text-[#4d1217]"
                            : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                        }`}
                      >
                        <span className="block font-bold">{brand.name}</span>
                        <span className="text-[10px] text-[#ef7d19]">{brand.badge}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 3: Cable Cross-Sectional Size (sq.mm) */}
              <div className="bg-white rounded-xl p-4 border border-[#ebd7c7] shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#c25e0a]">
                    Step 3: Conductor Cross-Section (sq.mm)
                  </label>
                  <span className="text-[11px] font-semibold text-stone-600">
                    Selected: <strong>{currentSizeObj.size}</strong>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {activeCableType.sizes.map((s) => (
                    <button
                      key={s.size}
                      type="button"
                      onClick={() => setSelectedSize(s.size)}
                      className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        currentSizeObj.size === s.size
                          ? "border-[#ef7d19] bg-[#ef7d19] text-white shadow-sm"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Length & Discount Sliders */}
              <div className="bg-white rounded-xl p-4 border border-[#ebd7c7] shadow-sm space-y-4">
                <label className="text-xs font-bold uppercase tracking-wider text-[#c25e0a] block">
                  Step 4: Quantity & Wholesale Discount
                </label>

                {/* Length Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700">Length Required:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="50000"
                        value={quantityMeters}
                        onChange={(e) => setQuantityMeters(Math.max(1, Number(e.target.value)))}
                        className="w-24 h-8 px-2 text-right border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#ef7d19]"
                      />
                      <span className="font-bold text-stone-600">Metres</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="5000"
                    step="10"
                    value={quantityMeters}
                    onChange={(e) => setQuantityMeters(Number(e.target.value))}
                    className="w-full accent-[#ef7d19]"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>10m</span>
                    <span>500m (Standard Drum)</span>
                    <span>1,000m</span>
                    <span>5,000m</span>
                  </div>
                </div>

                {/* Contractor Discount Slider */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-700">
                      Contractor Wholesale Discount:
                    </span>
                    <span className="font-bold text-[#ef7d19]">{contractorDiscount}% Applied</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="1"
                    value={contractorDiscount}
                    onChange={(e) => setContractorDiscount(Number(e.target.value))}
                    className="w-full accent-[#4d1217]"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400">
                    <span>0% (Retail)</span>
                    <span>10% (Trade)</span>
                    <span>20% (Bulk Project)</span>
                    <span>30% (Max Wholesale)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Bill of Materials & Estimate (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
              {/* Specification Card */}
              <div className="bg-white rounded-xl p-5 border border-[#ebd7c7] shadow-sm space-y-4">
                <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#c25e0a] uppercase tracking-wider">
                      SPECIFICATION SUMMARY
                    </span>
                    <h3 className="text-base font-bold text-[#4d1217] font-['Space_Grotesk']">
                      {selectedBrand} {activeCableType.name}
                    </h3>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-50 text-[#ef7d19] border border-orange-200">
                    <Layers className="size-4" />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-stone-500">Core & Size:</span>
                    <strong className="text-stone-900">
                      {currentCore} x {currentSizeObj.size}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-stone-500">Conductor:</span>
                    <strong className="text-stone-900">{currentConductor}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-stone-500">Standard:</span>
                    <span className="text-stone-800 text-[11px]">{activeCableType.standard}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-stone-500">Voltage Rating:</span>
                    <span className="text-stone-800">{activeCableType.voltage}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-stone-500">Indicative Rate:</span>
                    <strong className="text-[#c25e0a]">₹{rawUnitPrice.toLocaleString("en-IN")} / metre</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-stone-500">Est. Total Weight:</span>
                    <span className="text-stone-800">~{totalWeightKg.toLocaleString("en-IN")} kg</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-stone-500">Packaging / Drum:</span>
                    <span className="text-stone-800 text-[11px] text-right max-w-[200px]">{drumType}</span>
                  </div>
                </div>
              </div>

              {/* Commercial Price Breakdown Box */}
              <div className="bg-gradient-to-br from-[#fbf8f5] to-[#f7ede6] rounded-2xl p-5 border border-[#ebd7c7] shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-[#e5d0be] pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4d1217]">
                    COMMERCIAL ESTIMATE
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-xs text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeGst}
                      onChange={(e) => setIncludeGst(e.target.checked)}
                      className="rounded accent-[#ef7d19]"
                    />
                    <span>Include 18% GST</span>
                  </label>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>
                      List Price ({quantityMeters}m @ ₹{rawUnitPrice}/m):
                    </span>
                    <span>₹{listTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {contractorDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Contractor Discount ({contractorDiscount}%):</span>
                      <span>- ₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-800 font-semibold pt-1 border-t border-[#ebd8ca]">
                    <span>Taxable Subtotal:</span>
                    <span>₹{taxableSubtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {includeGst && (
                    <div className="flex justify-between text-stone-600">
                      <span>GST @ 18%:</span>
                      <span>+ ₹{gstAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t-2 border-[#e0c4ae] flex items-end justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-600 block">
                        Estimated Net Total:
                      </span>
                      <small className="text-[10px] text-stone-500">
                        {includeGst ? "Inclusive of all taxes" : "Before GST"}
                      </small>
                    </div>
                    <div className="text-right">
                      <strong className="text-2xl sm:text-3xl font-bold text-[#4d1217] font-['Space_Grotesk'] leading-none">
                        ₹{finalTotal.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="pt-3 space-y-2">
                  <button
                    type="button"
                    onClick={handleTurnIntoQuote}
                    className="w-full h-11 rounded-xl bg-gradient-to-r from-[#ef7d19] to-[#ea580c] hover:brightness-105 active:brightness-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all"
                  >
                    <span>Turn into Official Quotation</span>
                    <ArrowRight className="size-4" />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppQuote}
                      className="h-10 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa52] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <MessageCircle className="size-4" />
                      <span>WhatsApp Quote</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="h-10 rounded-xl bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy className="size-3.5" />
                      <span>Copy Estimate</span>
                    </button>
                  </div>
                </div>

                {/* Micro note */}
                <p className="text-[10px] text-stone-500 text-center leading-tight">
                  *Indicative contractor pricing subject to raw copper/aluminum market movements. Final rates confirmed via official Proforma Invoice.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Load to Cable Sizing Guide */}
        {activeTab === "sizing" && (
          <div className="p-5 sm:p-8 space-y-6">
            <div className="max-w-2xl mx-auto text-center space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ef7d19]">
                ENGINEERING LOAD ASSISTANT
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#4d1217] font-['Space_Grotesk']">
                Recommend Cable Size Based on Connected Load
              </h3>
              <p className="text-xs sm:text-sm text-stone-600">
                Input your electrical machinery or connected building load to determine the safe recommended conductor size and current-carrying capacity.
              </p>
            </div>

            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Input Card */}
              <div className="bg-white rounded-2xl p-6 border border-[#ebd7c7] shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#c25e0a]">
                  1. Load Parameters
                </h4>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Connected Load (kW):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={loadKw}
                      onChange={(e) => setLoadKw(Math.max(1, Number(e.target.value)))}
                      className="w-28 h-10 px-3 rounded-lg border border-stone-300 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-[#ef7d19]"
                    />
                    <span className="text-xs text-stone-500">
                      ≈ {Math.round(loadKw * 1.341)} HP (Horsepower)
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Supply Voltage & Phase:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVoltagePhase("415V_3P")}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        voltagePhase === "415V_3P"
                          ? "border-[#4d1217] bg-[#4d1217] text-white"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      415V 3-Phase (Industrial)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVoltagePhase("230V_1P")}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        voltagePhase === "230V_1P"
                          ? "border-[#4d1217] bg-[#4d1217] text-white"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      230V 1-Phase (Commercial)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Estimated Run Distance (Metres):
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="2000"
                    value={runDistanceMeters}
                    onChange={(e) => setRunDistanceMeters(Math.max(1, Number(e.target.value)))}
                    className="w-full h-10 px-3 rounded-lg border border-stone-300 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-[#ef7d19]"
                  />
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="bg-gradient-to-br from-[#fbf8f5] to-[#f7ede6] rounded-2xl p-6 border border-[#ebd7c7] shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4d1217]">
                    2. Calculated Result
                  </h4>

                  <div className="p-4 rounded-xl bg-white border border-[#e5d0be] space-y-2">
                    <span className="text-xs text-stone-500 block">Calculated Full Load Current:</span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-3xl font-bold text-[#4d1217] font-['Space_Grotesk']">
                        {calculatedAmps} Amps
                      </strong>
                      <span className="text-xs font-semibold text-stone-600">continuous load</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-[#e5d0be] space-y-1.5">
                    <span className="text-xs text-stone-500 block">Recommended Cable Size:</span>
                    <strong className="text-base font-bold text-[#ef7d19] block">
                      {recommendedCableSize}
                    </strong>
                    <small className="text-[10px] text-stone-500 block">
                      Based on 70°C / 90°C thermal rating under standard Indian soil / ambient conditions.
                    </small>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("cost");
                    // Preselect size if matched
                    const match = recommendedCableSize.split(" ")[0];
                    const found = activeCableType.sizes.find((s) => s.size.startsWith(match));
                    if (found) setSelectedSize(found.size);
                    setQuantityMeters(runDistanceMeters);
                  }}
                  className="w-full h-11 rounded-xl bg-[#4d1217] hover:bg-[#3d0e12] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <Sliders className="size-4 text-[#ef7d19]" />
                  <span>Configure This Size in Cost Estimator</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-[#ebd8ca] flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              <ShieldCheck className="size-3.5 text-[#ef7d19]" />
              <span>IS: 7098 & IS: 694 Certified</span>
            </span>
            <span>·</span>
            <span>Direct Manufacturer Pricing</span>
          </div>

          <div>
            <span>Need project assistance? Call Accounts & Billing: </span>
            <a href="tel:+919512365582" className="font-bold text-[#4d1217] hover:underline">
              +91 9512365582
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
