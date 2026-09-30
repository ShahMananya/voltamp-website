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
  AlertTriangle,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export interface CableCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuote?: (prefilledText?: string) => void;
}

import {
  REAL_CABLE_CATALOG,
  calculateRealCableSizing,
  type CableSizePrice,
  type RealCableCatalogItem,
  type CableSizingResult,
} from "@/data/realWireData";
import { findRealWireProduct, type RealWireProduct } from "@/data/realWireProductsCatalog";

export type CableTypeOption = RealCableCatalogItem;
export const CABLE_CATALOG: CableTypeOption[] = REAL_CABLE_CATALOG;

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
  const [sizingConductor, setSizingConductor] = useState<"Aluminum" | "Copper">("Aluminum");
  const [installation, setInstallation] = useState<"Air" | "Ground">("Air");

  // Real wire engineering sizing engine (IS 7098 & IS 694)
  const sizingResult: CableSizingResult = useMemo(() => {
    return calculateRealCableSizing(
      loadKw,
      voltagePhase,
      runDistanceMeters,
      powerFactor,
      installation
    );
  }, [loadKw, voltagePhase, runDistanceMeters, powerFactor, installation]);

  const activeRecommendation = useMemo(() => {
    return sizingConductor === "Aluminum" ? sizingResult.alRecommendation : sizingResult.cuRecommendation;
  }, [sizingConductor, sizingResult]);

  const alternativeRecommendation = useMemo(() => {
    return sizingConductor === "Aluminum" ? sizingResult.cuRecommendation : sizingResult.alRecommendation;
  }, [sizingConductor, sizingResult]);

  const handleApplySizedCable = (useAluminium: boolean = sizingConductor === "Aluminum") => {
    const rec = useAluminium ? sizingResult.alRecommendation : sizingResult.cuRecommendation;
    const condName: "Aluminum" | "Copper" = useAluminium ? "Aluminum" : "Copper";

    setSelectedCableId("lt-armored");
    setConductor(condName);
    setSelectedCore("3.5 Core");

    const ltItem = REAL_CABLE_CATALOG.find((c) => c.id === "lt-armored");
    if (ltItem) {
      const match = ltItem.sizes.find((s) => s.size === rec.sizeLabel);
      if (match) setSelectedSize(match.size);
    }

    const totalMeters = runDistanceMeters * rec.runs;
    setQuantityMeters(totalMeters);
    setActiveTab("cost");

    toast.success("Engineered Cable Sizing Applied!", {
      description: `Configured ${rec.runs > 1 ? `${rec.runs} runs × ` : ""}3.5C ${rec.sizeLabel} (${condName}) for total ${totalMeters}m in Cost Estimator.`,
    });
  };

  const handleApplyHTFeeder = () => {
    if (!sizingResult.htFeederAlternative) return;
    setSelectedCableId("ht-armored-11kv");
    setConductor("Aluminum");
    setSelectedCore("3 Core (Strip / Round Wire Armoured)");

    const htItem = REAL_CABLE_CATALOG.find((c) => c.id === "ht-armored-11kv");
    if (htItem) {
      const match = htItem.sizes.find((s) => sizingResult.htFeederAlternative?.recommendedCable.includes(s.size));
      if (match) setSelectedSize(match.size);
    }
    setQuantityMeters(runDistanceMeters);
    setActiveTab("cost");

    toast.success("11kV HT Substation Cable Applied!", {
      description: `Configured 11kV Substation Feed (${runDistanceMeters}m) with live EPC pricing.`,
    });
  };

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

  // Authentic real product lookup from website catalog (products_db.json)
  const realProduct: RealWireProduct = useMemo(() => {
    return findRealWireProduct({
      brand: selectedBrand,
      catId: selectedCableId,
      material: currentConductor,
      cores: currentCore,
      size: currentSizeObj.size,
    });
  }, [selectedBrand, selectedCableId, currentConductor, currentCore, currentSizeObj]);

  // Unit rate calculations
  const unitListPrice = realProduct.listPrice;
  const websiteDiscountPct = realProduct.discountPct; // e.g. 40%
  const unitDiscountAmount = Math.round(unitListPrice * (websiteDiscountPct / 100));
  const unitNetPrice = realProduct.netPrice;

  // Project totals
  const listTotal = unitListPrice * quantityMeters;
  const websiteDiscountTotal = Math.round(listTotal * (websiteDiscountPct / 100));
  const websiteNetSubtotal = listTotal - websiteDiscountTotal;

  // Optional contractor / volume slab discount
  const contractorDiscountAmount = Math.round(websiteNetSubtotal * (contractorDiscount / 100));
  const taxableSubtotal = websiteNetSubtotal - contractorDiscountAmount;
  const totalSavings = websiteDiscountTotal + contractorDiscountAmount;

  const gstAmount = Math.round(taxableSubtotal * 0.18);
  const finalTotal = includeGst ? taxableSubtotal + gstAmount : taxableSubtotal;

  const totalWeightKg = Math.round((currentSizeObj.approxWeightKgPerKm * quantityMeters) / 1000);
  const drumType =
    quantityMeters > 500
      ? "Standard Wooden Cable Drum (1.2m – 1.6m Flange)"
      : quantityMeters >= 100
      ? "Compact Wooden Reel / Steel Banded"
      : "Standard Shrink-Wrapped Coils";

  // Actions
  const handleCopySummary = () => {
    const summary = `VOLAMP ESTIMATE SUMMARY:
Brand: ${selectedBrand}
Product: ${realProduct.name}
Catalog SKU: ${realProduct.sku}
Spec: ${currentCore} x ${currentSizeObj.size} (${currentConductor})
Standard: ${activeCableType.standard} (${activeCableType.voltage})
Quantity: ${quantityMeters.toLocaleString("en-IN")} Metres
Gross List Price (MRP): ₹${unitListPrice.toLocaleString("en-IN")}/m (Gross Total: ₹${listTotal.toLocaleString("en-IN")})
Website Discount (${websiteDiscountPct}% OFF): -₹${websiteDiscountTotal.toLocaleString("en-IN")}
Net Rate: ₹${unitNetPrice.toLocaleString("en-IN")}/m
${contractorDiscount > 0 ? `Additional Contractor Rebate (${contractorDiscount}%): -₹${contractorDiscountAmount.toLocaleString("en-IN")}\n` : ""}Taxable Subtotal: ₹${taxableSubtotal.toLocaleString("en-IN")}
18% GST: ₹${gstAmount.toLocaleString("en-IN")}
Final Payable Estimate: ₹${finalTotal.toLocaleString("en-IN")} (Total Savings: ₹${totalSavings.toLocaleString("en-IN")})
Est. Weight: ~${totalWeightKg.toLocaleString("en-IN")} kg (${drumType})

Generated via Volamp Online Estimation Desk: https://volampelektrikals.com/calculator`;

    navigator.clipboard.writeText(summary);
    toast.success("Estimate Copied to Clipboard!", {
      description: "You can now paste this bill of materials directly into your RFQ or email.",
    });
  };

  const handleWhatsAppQuote = () => {
    const msg = `Hello VOLAMP Supply Desk, I generated a cable project estimate on your calculator:\n\n` +
      `• Brand: ${selectedBrand}\n` +
      `• Product: ${realProduct.name}\n` +
      `• Catalog SKU: ${realProduct.sku}\n` +
      `• Spec: ${currentCore} x ${currentSizeObj.size} (${currentConductor})\n` +
      `• Quantity: ${quantityMeters.toLocaleString("en-IN")} Metres\n` +
      `• Gross List (MRP): ₹${unitListPrice.toLocaleString("en-IN")}/m\n` +
      `• Website Discount: ${websiteDiscountPct}% OFF\n` +
      `• Net Rate: ₹${unitNetPrice.toLocaleString("en-IN")}/m\n` +
      `• Est. Total: ₹${finalTotal.toLocaleString("en-IN")} (incl. 18% GST)\n\n` +
      `Please confirm stock availability and dispatch schedule from Ahmedabad.`;

    window.open(`https://wa.me/919512365582?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleTurnIntoQuote = () => {
    const summaryText = `${selectedBrand} ${realProduct.name}, ${currentCore} x ${currentSizeObj.size} (${currentConductor}) - ${quantityMeters} Metres. Est: ₹${finalTotal.toLocaleString("en-IN")}`;
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
                    <span className="text-stone-500">List Price (Pricelist MRP):</span>
                    <span className="font-semibold text-stone-400 line-through">₹{unitListPrice.toLocaleString("en-IN")}/m</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50 items-center">
                    <span className="text-stone-500">Website Discount:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                      {websiteDiscountPct}% OFF (-₹{unitDiscountAmount.toLocaleString("en-IN")}/m)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50 items-center">
                    <span className="text-stone-500">Volamp Online Rate:</span>
                    <strong className="text-emerald-700 text-sm font-bold">₹{unitNetPrice.toLocaleString("en-IN")} / metre</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50 text-[11px]">
                    <span className="text-stone-500">Catalog SKU:</span>
                    <span className="font-mono text-stone-800 font-semibold">{realProduct.sku}</span>
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
                      Gross List Price ({quantityMeters}m @ ₹{unitListPrice}/m):
                    </span>
                    <span className="font-medium text-stone-800">₹{listTotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between text-amber-700 font-semibold">
                    <span>Website Discount ({websiteDiscountPct}% OFF):</span>
                    <span>- ₹{websiteDiscountTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {contractorDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Additional Contractor Slab ({contractorDiscount}%):</span>
                      <span>- ₹{contractorDiscountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-800 font-semibold pt-1 border-t border-[#ebd8ca]">
                    <span>Net Taxable Subtotal:</span>
                    <span className="font-bold text-sm">₹{taxableSubtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {includeGst && (
                    <div className="flex justify-between text-stone-600">
                      <span>GST @ 18%:</span>
                      <span>+ ₹{gstAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {/* Savings Indicator */}
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" /> Total Savings:
                    </span>
                    <span className="font-extrabold text-emerald-700 font-mono">
                      ₹{totalSavings.toLocaleString("en-IN")} ({websiteDiscountPct + (contractorDiscount > 0 ? contractorDiscount : 0)}% off MRP)
                    </span>
                  </div>

                  <div className="pt-3 border-t-2 border-[#e0c4ae] flex items-end justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-600 block">
                        Estimated Net Total:
                      </span>
                      <small className="text-[10px] text-stone-500">
                        {includeGst ? "Inclusive of 18% GST" : "Before GST"}
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
                Calculated strictly in accordance with Indian Standards (IS: 7098 Part 1 & 2, IS: 694, IS: 1255) and authentic Volamp product specifications.
              </p>
            </div>

            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Input Card (5 Cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#ebd7c7] shadow-sm space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#c25e0a]">
                  1. Load & Route Parameters
                </h4>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Connected Load (kW):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={loadKw}
                      onChange={(e) => setLoadKw(Math.max(1, Number(e.target.value)))}
                      className="w-32 h-10 px-3 rounded-lg border border-stone-300 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-[#ef7d19]"
                    />
                    <span className="text-xs font-medium text-stone-500">
                      ≈ {Math.round(loadKw * 1.341).toLocaleString("en-IN")} HP
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
                          ? "border-[#4d1217] bg-[#4d1217] text-white shadow-sm"
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
                          ? "border-[#4d1217] bg-[#4d1217] text-white shadow-sm"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      230V 1-Phase (Commercial)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Conductor Metal Preference:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSizingConductor("Aluminum")}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all text-center ${
                        sizingConductor === "Aluminum"
                          ? "border-[#ef7d19] bg-orange-50 text-[#ef7d19]"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      Aluminium (EPC Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSizingConductor("Copper")}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all text-center ${
                        sizingConductor === "Copper"
                          ? "border-[#ef7d19] bg-orange-50 text-[#ef7d19]"
                          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                      }`}
                    >
                      Copper (High Efficiency)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Installation Environment:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInstallation("Air")}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all text-center ${
                        installation === "Air"
                          ? "border-stone-800 bg-stone-100 text-stone-900"
                          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      In Air / Cable Trays
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstallation("Ground")}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all text-center ${
                        installation === "Ground"
                          ? "border-stone-800 bg-stone-100 text-stone-900"
                          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      Underground / Trench
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
                    max="10000"
                    value={runDistanceMeters}
                    onChange={(e) => setRunDistanceMeters(Math.max(1, Number(e.target.value)))}
                    className="w-full h-10 px-3 rounded-lg border border-stone-300 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-[#ef7d19]"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                    <span>50m (Factory internal)</span>
                    <span>200m (Campus)</span>
                    <span>1,000m+ (Intertie)</span>
                  </div>
                </div>
              </div>

              {/* Recommendation Card (7 Cols) */}
              <div className="lg:col-span-7 bg-gradient-to-br from-[#fbf8f5] to-[#f7ede6] rounded-2xl p-6 border border-[#ebd7c7] shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#4d1217]">
                      2. Engineered Sizing Results
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#c25e0a] border border-orange-200">
                      IS: 7098 / IS: 1255
                    </span>
                  </div>

                  {/* Discom Advisory Alert */}
                  {sizingResult.discomWarning && (
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-amber-800">
                        <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                        <span>Indian Discom Regulatory Notice</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900">
                        {sizingResult.discomWarning}
                      </p>
                      <button
                        type="button"
                        onClick={() => setVoltagePhase("415V_3P")}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] transition-all"
                      >
                        <span>Switch to 415V 3-Phase</span>
                        <ArrowRight className="size-3" />
                      </button>
                    </div>
                  )}

                  {/* Current Rating */}
                  <div className="p-4 rounded-xl bg-white border border-[#e5d0be] space-y-1">
                    <span className="text-xs text-stone-500 block">Calculated Full Load Continuous Current:</span>
                    <div className="flex items-baseline gap-2">
                      <strong className="text-3xl font-bold text-[#4d1217] font-['Space_Grotesk']">
                        {sizingResult.calculatedAmps.toLocaleString("en-IN")} Amps
                      </strong>
                      <span className="text-xs font-semibold text-stone-600">
                        continuous load ({voltagePhase === "415V_3P" ? "415V 3-Phase" : "230V 1-Phase"}, PF {powerFactor})
                      </span>
                    </div>
                  </div>

                  {/* Primary Recommended Cable */}
                  <div className="p-4 rounded-xl bg-white border border-[#e5d0be] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-500 font-medium">Recommended Conductor & Parallel Runs:</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Thermal Verified
                      </span>
                    </div>

                    <div>
                      <strong className="text-lg font-bold text-[#c25e0a] font-['Space_Grotesk'] block leading-snug">
                        {activeRecommendation.runs > 1
                          ? `${activeRecommendation.runs} Parallel Runs × 3.5C ${activeRecommendation.sizeLabel}`
                          : `1 Run × 3.5C ${activeRecommendation.sizeLabel}`}{" "}
                        {sizingConductor} Armoured XLPE Cable
                      </strong>
                      <span className="text-[11px] text-stone-500">
                        Combined continuous safe capacity: <strong>{activeRecommendation.safeAmpacityTotal.toLocaleString("en-IN")} A</strong> (derated for {installation.toLowerCase()} bundling)
                      </span>
                    </div>

                    {/* Voltage Drop Metric */}
                    <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-stone-500 block text-[11px]">Voltage Drop over {runDistanceMeters}m:</span>
                        <strong className="text-stone-800">
                          {activeRecommendation.voltageDropVolts} V ({activeRecommendation.voltageDropPct}%)
                        </strong>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                          activeRecommendation.isDropCompliant
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {activeRecommendation.isDropCompliant
                          ? "✓ Compliant with IS 1255 (< 5% Drop)"
                          : "⚠️ Voltage Drop Exceeds 5% (Sized Up)"}
                      </span>
                    </div>
                  </div>

                  {/* Alternative Metal Option Pill */}
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-500 text-[11px] block">
                        Alternative in {sizingConductor === "Aluminum" ? "Copper" : "Aluminium"}:
                      </span>
                      <strong className="text-stone-800">
                        {alternativeRecommendation.runs > 1 ? `${alternativeRecommendation.runs} Runs × ` : "1 Run × "}
                        3.5C {alternativeRecommendation.sizeLabel} ({sizingConductor === "Aluminum" ? "Copper" : "Aluminium"})
                      </strong>
                      <span className="text-stone-500 text-[10px] ml-1.5">
                        (Drop: {alternativeRecommendation.voltageDropPct}%)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSizingConductor(sizingConductor === "Aluminum" ? "Copper" : "Aluminum")}
                      className="px-2.5 py-1 text-[11px] font-bold text-[#ef7d19] hover:underline"
                    >
                      Compare {sizingConductor === "Aluminum" ? "Copper" : "Aluminium"}
                    </button>
                  </div>

                  {/* High Tension (11kV Substation Alternative) for Loads >= 150 kW */}
                  {sizingResult.htFeederAlternative && (
                    <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-900">
                          <Zap className="size-3.5 text-purple-600" />
                          <span>HT 11kV Substation Alternative (Recommended for Mega Loads)</span>
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          High Efficiency
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-900 leading-relaxed">
                        At 11kV HT voltage, continuous current drops to just <strong>{sizingResult.htFeederAlternative.amps11kV} A</strong>. A single run of <strong>{sizingResult.htFeederAlternative.recommendedCable}</strong> evacuates the entire {loadKw} kW load with negligible voltage drop ({sizingResult.htFeederAlternative.voltageDropPct}%), saving massive LT trench and busbar costs.
                      </p>
                      <button
                        type="button"
                        onClick={handleApplyHTFeeder}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-bold text-[11px] transition-all"
                      >
                        <Sliders className="size-3 text-purple-200" />
                        <span>Configure 11kV HT Substation Cable in Estimator</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleApplySizedCable()}
                  className="w-full h-11 rounded-xl bg-[#4d1217] hover:bg-[#3d0e12] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Sliders className="size-4 text-[#ef7d19]" />
                  <span>
                    Configure This Sized Cable ({activeRecommendation.runs > 1 ? `${activeRecommendation.runs} Runs × ` : ""}{activeRecommendation.sizeLabel}) in Cost Estimator
                  </span>
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
