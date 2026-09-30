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
  PlugZap,
  Wrench,
  SunMedium,
  Cable,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
import {
  CALCULATOR_CATEGORIES,
  CategoryProductItem,
  getSubcategoriesForCategory,
  getBrandsForCategory,
  getProductsForCategory,
  getCategoryProductById,
} from "@/data/allCategoriesCalculatorData";

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
  // Active Category (default 'cables')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("cables");
  const selectedCategoryMeta = useMemo(() => {
    return CALCULATOR_CATEGORIES.find((c) => c.id === selectedCategoryId) ?? CALCULATOR_CATEGORIES[0];
  }, [selectedCategoryId]);

  const isCable = selectedCategoryId === "cables";

  // Mode selection: 'cost' or 'sizing'
  const [activeTab, setActiveTab] = useState<"cost" | "sizing">("cost");

  // Cable Selection states
  const [selectedCableId, setSelectedCableId] = useState<string>("lt-armored");
  const [conductor, setConductor] = useState<"Copper" | "Aluminum">("Copper");
  const [selectedCore, setSelectedCore] = useState<string>("3.5 Core");
  const [selectedSize, setSelectedSize] = useState<string>("50 sq.mm");
  const [selectedBrand, setSelectedBrand] = useState<string>("Polycab");
  const [quantityMeters, setQuantityMeters] = useState<number>(500);

  // Non-Cable Selection states
  const availableSubcats = useMemo(() => {
    return getSubcategoriesForCategory(selectedCategoryId);
  }, [selectedCategoryId]);

  const [nonCableSubcat, setNonCableSubcat] = useState<string>("");
  const activeSubcat = nonCableSubcat && availableSubcats.includes(nonCableSubcat) ? nonCableSubcat : (availableSubcats[0] || "");

  const availableBrands = useMemo(() => {
    return getBrandsForCategory(selectedCategoryId, activeSubcat);
  }, [selectedCategoryId, activeSubcat]);

  const [nonCableBrand, setNonCableBrand] = useState<string>("");
  const activeBrand = nonCableBrand && availableBrands.includes(nonCableBrand) ? nonCableBrand : (availableBrands[0] || "");

  const availableProducts = useMemo(() => {
    return getProductsForCategory(selectedCategoryId, activeSubcat, activeBrand || undefined);
  }, [selectedCategoryId, activeSubcat, activeBrand]);

  const [nonCableProductId, setNonCableProductId] = useState<string>("");
  const activeNonCableProduct = useMemo(() => {
    return availableProducts.find((p) => p.id === nonCableProductId) ?? availableProducts[0];
  }, [availableProducts, nonCableProductId]);

  const [nonCableQuantity, setNonCableQuantity] = useState<number>(10);

  // Common Commercial states
  const [contractorDiscount, setContractorDiscount] = useState<number>(12);
  const [includeGst, setIncludeGst] = useState<boolean>(true);

  // Cable Sizing Calculator states (ONLY FOR WIRES & CABLES)
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

    setSelectedCategoryId("cables");
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
    setSelectedCategoryId("cables");
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
  const currentCore = activeCableType.cores.includes(selectedCore) ? selectedCore : activeCableType.cores[0];
  const currentSizeObj =
    activeCableType.sizes.find((s) => s.size === selectedSize) ?? activeCableType.sizes[0];
  const currentBrandObj =
    BRAND_MULTIPLIERS.find((b) => b.name === selectedBrand) ?? BRAND_MULTIPLIERS[0];

  // Authentic real product lookup for cables
  const realCableProduct: RealWireProduct = useMemo(() => {
    return findRealWireProduct({
      brand: selectedBrand,
      catId: selectedCableId,
      material: currentConductor,
      cores: currentCore,
      size: currentSizeObj.size,
    });
  }, [selectedBrand, selectedCableId, currentConductor, currentCore, currentSizeObj]);

  // Unified active product properties
  const activeProductName = isCable
    ? realCableProduct.name || `${selectedBrand} ${activeCableType.name}`
    : activeNonCableProduct?.name || "Product";

  const activeProductSku = isCable
    ? realCableProduct.sku
    : activeNonCableProduct?.sku || "SKU-PROD";

  const activeBrandName = isCable ? selectedBrand : (activeNonCableProduct?.brand || "Volamp");

  const activeCategoryName = isCable
    ? activeCableType.category
    : activeNonCableProduct?.category || selectedCategoryMeta.name;

  const activeSpecSummary = isCable
    ? `${currentCore} x ${currentSizeObj.size} (${currentConductor})`
    : activeNonCableProduct?.spec || activeNonCableProduct?.subcategory || "";

  const activeUnitLabel = isCable
    ? "Meter"
    : activeNonCableProduct?.unit || selectedCategoryMeta.unit;

  const activeQuantity = isCable ? quantityMeters : (nonCableQuantity || 1);

  // Unit rate calculations (MRP, Discount, Net Rate)
  const unitListPrice = isCable
    ? realCableProduct.listPrice
    : (activeNonCableProduct?.listPrice || 0);

  const websiteDiscountPct = isCable
    ? realCableProduct.discountPct
    : (activeNonCableProduct?.discountPct || 0);

  const unitDiscountAmount = Math.round(unitListPrice * (websiteDiscountPct / 100));

  const unitNetPrice = isCable
    ? realCableProduct.netPrice
    : (activeNonCableProduct?.netPrice || 0);

  // Project commercial totals
  const listTotal = unitListPrice * activeQuantity;
  const websiteDiscountTotal = Math.round(listTotal * (websiteDiscountPct / 100));
  const websiteNetSubtotal = listTotal - websiteDiscountTotal;

  // Optional contractor / volume slab discount
  const contractorDiscountAmount = Math.round(websiteNetSubtotal * (contractorDiscount / 100));
  const taxableSubtotal = websiteNetSubtotal - contractorDiscountAmount;
  const totalSavings = websiteDiscountTotal + contractorDiscountAmount;

  const gstAmount = Math.round(taxableSubtotal * 0.18);
  const finalTotal = includeGst ? taxableSubtotal + gstAmount : taxableSubtotal;

  const totalWeightKg = isCable
    ? Math.round((currentSizeObj.approxWeightKgPerKm * quantityMeters) / 1000)
    : 0;

  const drumType = isCable
    ? quantityMeters > 500
      ? "Standard Wooden Cable Drum (1.2m – 1.6m Flange)"
      : quantityMeters >= 100
      ? "Compact Wooden Reel / Steel Banded"
      : "Standard Shrink-Wrapped Coils"
    : "Standard Packaging";

  // Actions
  const handleCopySummary = () => {
    const summary = `VOLAMP ESTIMATE SUMMARY:
Category: ${activeCategoryName}
Brand: ${activeBrandName}
Product: ${activeProductName}
Catalog SKU: ${activeProductSku}
Spec: ${activeSpecSummary}
Quantity: ${activeQuantity.toLocaleString("en-IN")} ${activeUnitLabel}s
Gross List Price (MRP): ₹${unitListPrice.toLocaleString("en-IN")}/${activeUnitLabel} (Gross Total: ₹${listTotal.toLocaleString("en-IN")})
Website Discount (${websiteDiscountPct}% OFF): -₹${websiteDiscountTotal.toLocaleString("en-IN")}
Net Rate: ₹${unitNetPrice.toLocaleString("en-IN")}/${activeUnitLabel}
${contractorDiscount > 0 ? `Additional Contractor Rebate (${contractorDiscount}%): -₹${contractorDiscountAmount.toLocaleString("en-IN")}\n` : ""}Taxable Subtotal: ₹${taxableSubtotal.toLocaleString("en-IN")}
18% GST: ₹${gstAmount.toLocaleString("en-IN")}
Final Payable Estimate: ₹${finalTotal.toLocaleString("en-IN")} (Total Savings: ₹${totalSavings.toLocaleString("en-IN")})
${isCable ? `Est. Weight: ~${totalWeightKg.toLocaleString("en-IN")} kg (${drumType})\n` : ""}
Generated via Volamp Online Estimation Desk: https://volampelektrikals.com/calculator`;

    navigator.clipboard.writeText(summary);
    toast.success("Estimate Copied to Clipboard!", {
      description: "You can now paste this bill of materials directly into your RFQ or email.",
    });
  };

  const handleWhatsAppQuote = () => {
    const msg = `Hello VOLAMP Supply Desk, I generated an estimate on your calculator:\n\n` +
      `• Category: ${activeCategoryName}\n` +
      `• Brand: ${activeBrandName}\n` +
      `• Product: ${activeProductName}\n` +
      `• Catalog SKU: ${activeProductSku}\n` +
      `• Spec: ${activeSpecSummary}\n` +
      `• Quantity: ${activeQuantity.toLocaleString("en-IN")} ${activeUnitLabel}s\n` +
      `• Gross List (MRP): ₹${unitListPrice.toLocaleString("en-IN")}/${activeUnitLabel}\n` +
      `• Website Discount: ${websiteDiscountPct}% OFF\n` +
      `• Net Rate: ₹${unitNetPrice.toLocaleString("en-IN")}/${activeUnitLabel}\n` +
      `• Est. Total: ₹${finalTotal.toLocaleString("en-IN")} (incl. 18% GST)\n\n` +
      `Please confirm stock availability and dispatch schedule from Ahmedabad.`;

    window.open(`https://wa.me/919512365582?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleTurnIntoQuote = () => {
    const summaryText = `${activeBrandName} ${activeProductName}, ${activeSpecSummary} - ${activeQuantity} ${activeUnitLabel}s. Est: ₹${finalTotal.toLocaleString("en-IN")}`;
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
                  Live Master Catalog Feed
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-[#4d1217] font-['Space_Grotesk'] leading-tight">
                Industrial Products & Project Cost Calculator
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
                1. {isCable ? "Cable Cost Estimator" : `${selectedCategoryMeta.shortName} Estimator`}
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "sizing"
                    ? "bg-white text-[#4d1217] shadow-sm font-bold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
                onClick={() => setActiveTab("sizing")}
              >
                <span>2. Load / Sizing Guide</span>
                {!isCable && (
                  <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 font-bold">
                    Cables Only
                  </span>
                )}
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

        {/* Category Switcher Bar */}
        <div className="bg-stone-100/80 border-b border-[#ebd8ca] px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none flex items-center gap-2">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Category:
          </span>
          {CALCULATOR_CATEGORIES.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryId(cat.id);
                  if (cat.id !== "cables" && activeTab === "sizing") {
                    // keep on sizing to show notice, or user can toggle
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-[#4d1217] text-white shadow-sm ring-1 ring-[#4d1217]"
                    : "bg-white text-stone-700 hover:bg-stone-50 border border-stone-200"
                }`}
              >
                <span>{cat.shortName}</span>
                {cat.hasSizingGuide && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-extrabold uppercase ${
                      isSelected ? "bg-amber-400 text-stone-900" : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    Sizing
                  </span>
                )}
              </button>
            );
          })}
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
            {isCable ? "Cost Estimator" : `${selectedCategoryMeta.shortName} Estimator`}
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg text-center font-bold flex items-center justify-center gap-1 ${
              activeTab === "sizing" ? "bg-white text-[#4d1217] shadow-sm" : "text-stone-600"
            }`}
            onClick={() => setActiveTab("sizing")}
          >
            <span>Load / Sizing</span>
            {!isCable && (
              <span className="text-[9px] px-1 rounded bg-amber-100 text-amber-800 font-bold">
                Cables
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Cost Estimator (Works for ALL categories) */}
        {activeTab === "cost" && (
          <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Configuration Controls (7 Cols) */}
            <div className="lg:col-span-7 space-y-5">
              {isCable ? (
                /* WIRES & CABLES 4-STEP CONFIGURATION */
                <>
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
                </>
              ) : (
                /* NON-CABLE CATEGORY 3-STEP CONFIGURATION */
                <>
                  {/* Step 1: Subcategory & Brand */}
                  <div className="bg-white rounded-xl p-4 border border-[#ebd7c7] shadow-sm space-y-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#c25e0a]">
                        Step 1: Product Subcategory & Brand
                      </label>
                      <span className="text-[11px] text-stone-500 font-semibold">{selectedCategoryMeta.name}</span>
                    </div>

                    {/* Subcategory Pills */}
                    <div>
                      <span className="text-xs font-semibold text-stone-700 block mb-1.5">
                        Select Subcategory:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {availableSubcats.map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              setNonCableSubcat(sub);
                              const prods = getProductsForCategory(selectedCategoryId, sub);
                              if (prods.length > 0) setNonCableProductId(prods[0].id);
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                              activeSubcat === sub
                                ? "border-[#ef7d19] bg-orange-50 text-[#4d1217] font-bold shadow-xs"
                                : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Brand Selector */}
                    {availableBrands.length > 1 && (
                      <div className="pt-2 border-t border-stone-100">
                        <span className="text-xs font-semibold text-stone-700 block mb-1.5">
                          Manufacturer Brand:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {availableBrands.map((b) => (
                            <button
                              key={b}
                              type="button"
                              onClick={() => {
                                setNonCableBrand(b);
                                const prods = getProductsForCategory(selectedCategoryId, activeSubcat, b);
                                if (prods.length > 0) setNonCableProductId(prods[0].id);
                              }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                activeBrand === b
                                  ? "border-[#4d1217] bg-[#4d1217] text-white shadow-xs"
                                  : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Product Model & Specification Selector */}
                  <div className="bg-white rounded-xl p-4 border border-[#ebd7c7] shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#c25e0a]">
                        Step 2: Model & Specification
                      </label>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {availableProducts.length} items available
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {availableProducts.map((p) => {
                        const isSelected = activeNonCableProduct?.id === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setNonCableProductId(p.id)}
                            className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between gap-3 ${
                              isSelected
                                ? "border-[#ef7d19] bg-orange-50/70 text-[#4d1217] font-bold shadow-xs"
                                : "border-stone-200 hover:border-stone-300 bg-white text-stone-700"
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-xs block truncate">{p.name}</span>
                              <span className="text-[10px] text-stone-500 block truncate mt-0.5 font-mono">
                                SKU: {p.sku} {p.spec ? `· ${p.spec}` : ""}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[11px] text-stone-400 line-through block">
                                ₹{p.listPrice.toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs font-extrabold text-emerald-600 block">
                                ₹{p.netPrice.toLocaleString("en-IN")}/{p.unit}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Quantity & Discount */}
                  <div className="bg-white rounded-xl p-4 border border-[#ebd7c7] shadow-sm space-y-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#c25e0a] block">
                      Step 3: Procurement Quantity & Wholesale Slab
                    </label>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-700">Quantity Required:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="50000"
                            value={nonCableQuantity}
                            onChange={(e) => setNonCableQuantity(Math.max(1, Number(e.target.value)))}
                            className="w-24 h-8 px-2 text-right border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#ef7d19]"
                          />
                          <span className="font-bold text-stone-600">{activeUnitLabel}s</span>
                        </div>
                      </div>

                      {/* Quick Quantity Chips */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {[5, 10, 25, 50, 100, 250, 500].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setNonCableQuantity(q)}
                            className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                              nonCableQuantity === q
                                ? "bg-[#4d1217] text-white border-[#4d1217]"
                                : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                            }`}
                          >
                            {q} {activeUnitLabel}s
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Contractor Discount Slider */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-700">
                          Additional Trade / Bulk Rebate:
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
                </>
              )}
            </div>

            {/* Right Column: Live Bill of Materials & Estimate Docket (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
              {/* Specification Card */}
              <div className="bg-white rounded-xl p-5 border border-[#ebd7c7] shadow-sm space-y-4">
                <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-[#c25e0a] uppercase tracking-wider">
                      SPECIFICATION SUMMARY
                    </span>
                    <h3 className="text-base font-bold text-[#4d1217] font-['Space_Grotesk'] leading-tight">
                      {activeBrandName} — {activeProductName}
                    </h3>
                  </div>
                  <div className="p-2 rounded-lg bg-orange-50 text-[#ef7d19] border border-orange-200 shrink-0">
                    <Layers className="size-4" />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-stone-500">Category:</span>
                    <strong className="text-stone-900">{activeCategoryName}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-stone-500">Specification:</span>
                    <strong className="text-stone-900 text-right truncate max-w-[200px]">
                      {activeSpecSummary}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-stone-500">Quantity:</span>
                    <strong className="text-stone-900">
                      {activeQuantity.toLocaleString("en-IN")} {activeUnitLabel}s
                    </strong>
                  </div>

                  {/* MRP Gross List Price with Strikethrough */}
                  <div className="flex justify-between py-1 border-b border-stone-50">
                    <span className="text-stone-500">List Price (Pricelist MRP):</span>
                    <span className="font-semibold text-stone-400 line-through">
                      ₹{unitListPrice.toLocaleString("en-IN")}/{activeUnitLabel}
                    </span>
                  </div>

                  {/* Website Discount Badge */}
                  <div className="flex justify-between py-1 border-b border-stone-50 items-center">
                    <span className="text-stone-500">Website Discount:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                      {websiteDiscountPct}% OFF (-₹{unitDiscountAmount.toLocaleString("en-IN")}/{activeUnitLabel})
                    </span>
                  </div>

                  {/* Volamp Online Rate */}
                  <div className="flex justify-between py-1 border-b border-stone-50 items-center">
                    <span className="text-stone-500">Volamp Online Rate:</span>
                    <strong className="text-emerald-700 text-sm font-bold">
                      ₹{unitNetPrice.toLocaleString("en-IN")} / {activeUnitLabel}
                    </strong>
                  </div>

                  <div className="flex justify-between py-1 border-b border-stone-50 text-[11px]">
                    <span className="text-stone-500">Catalog SKU:</span>
                    <span className="font-mono text-stone-800 font-semibold">{activeProductSku}</span>
                  </div>
                </div>

                {/* Packaging & Logistics Note */}
                <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-stone-800">
                    <ShieldCheck className="size-3.5 text-emerald-600" />
                    <span>Direct Factory Dispatched from Ahmedabad</span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    All materials supplied with standard manufacturer test certificate and genuine batch barcode.
                  </p>
                </div>
              </div>

              {/* Commercial Estimate Docket */}
              <div className="bg-[#4d1217] text-white rounded-xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-200">
                    COMMERCIAL ESTIMATE DOCKET
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    <Percent className="size-3" />
                    <span>{websiteDiscountPct}% OFF MRP</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Gross Total at MRP */}
                  <div className="flex justify-between text-stone-300">
                    <span>Gross List Total (MRP):</span>
                    <span className="line-through text-stone-400">
                      ₹{listTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Website Discount */}
                  <div className="flex justify-between text-amber-300 font-medium">
                    <span>Website Catalog Discount ({websiteDiscountPct}%):</span>
                    <span>-₹{websiteDiscountTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Contractor Slab */}
                  {contractorDiscount > 0 && (
                    <div className="flex justify-between text-emerald-300 font-medium">
                      <span>Contractor / Volume Slab ({contractorDiscount}%):</span>
                      <span>-₹{contractorDiscountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  {/* Net Taxable */}
                  <div className="flex justify-between text-white font-bold pt-1 border-t border-white/10">
                    <span>Net Taxable Subtotal:</span>
                    <span>₹{taxableSubtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {/* GST */}
                  <div className="flex justify-between text-stone-300">
                    <span>GST (18% HSN):</span>
                    <span>₹{gstAmount.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Total Savings Pill */}
                  <div className="p-2 rounded-lg bg-emerald-900/40 border border-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center justify-between">
                    <span>Total Procurement Savings:</span>
                    <span className="text-emerald-300 text-sm">₹{totalSavings.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Final Total */}
                  <div className="pt-2 border-t border-white/20 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-orange-200 block">Final Estimated Payable</span>
                      <span className="text-[10px] text-stone-400">Incl. 18% GST & Online Pricing</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-white font-['Space_Grotesk']">
                        ₹{finalTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="w-full py-2.5 px-3 rounded-xl bg-white text-[#4d1217] hover:bg-stone-100 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Copy className="size-3.5" />
                    <span>Copy Commercial Docket</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleWhatsAppQuote}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <MessageCircle className="size-3.5" />
                      <span>WhatsApp RFQ</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTurnIntoQuote}
                      className="py-2.5 px-3 rounded-xl bg-[#ef7d19] hover:bg-[#d96c14] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Formal Quote</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Load / Sizing Guide (ONLY FOR WIRES & CABLES) */}
        {activeTab === "sizing" && (
          <div className="p-5 sm:p-7">
            {isCable ? (
              /* WIRES & CABLES ELECTRICAL LOAD SIZING ENGINE */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Sizing Parameters (6 Cols) */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="bg-white rounded-xl p-5 border border-[#ebd7c7] shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#c25e0a]">
                        Electrical Load Parameters (IS 7098 / IS 694)
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1d73b7] border border-blue-200">
                        {voltagePhase === "415V_3P" ? "3-Phase 415V" : "1-Phase 230V"}
                      </span>
                    </div>

                    {/* Load Input (kW) */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-stone-700">Total Connected Load:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            max="2000"
                            value={loadKw}
                            onChange={(e) => setLoadKw(Math.max(1, Number(e.target.value)))}
                            className="w-20 h-8 px-2 text-right border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#ef7d19]"
                          />
                          <span className="font-bold text-stone-600">kW</span>
                          <span className="text-stone-400 text-[11px]">
                            (~{Math.round(loadKw / 0.7457)} HP)
                          </span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="250"
                        value={loadKw}
                        onChange={(e) => setLoadKw(Number(e.target.value))}
                        className="w-full accent-[#ef7d19]"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400">
                        <span>5 kW (Small Motor)</span>
                        <span>30 kW (Std Industrial)</span>
                        <span>100 kW</span>
                        <span>250 kW</span>
                      </div>
                    </div>

                    {/* Voltage System Selection */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-100">
                      <span className="text-xs font-semibold text-stone-700 block">Voltage System:</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setVoltagePhase("415V_3P")}
                          className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                            voltagePhase === "415V_3P"
                              ? "border-[#4d1217] bg-[#4d1217] text-white shadow-xs"
                              : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                          }`}
                        >
                          415V 3-Phase (Industrial / Commercial)
                        </button>
                        <button
                          type="button"
                          onClick={() => setVoltagePhase("230V_1P")}
                          className={`py-2 px-3 rounded-lg border text-xs font-bold transition-all text-center ${
                            voltagePhase === "230V_1P"
                              ? "border-[#4d1217] bg-[#4d1217] text-white shadow-xs"
                              : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                          }`}
                        >
                          230V Single-Phase (Domestic / Light)
                        </button>
                      </div>
                    </div>

                    {/* Distance in Metres */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-100">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-stone-700">Route Cable Run Distance:</span>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="5"
                            max="2000"
                            value={runDistanceMeters}
                            onChange={(e) => setRunDistanceMeters(Math.max(5, Number(e.target.value)))}
                            className="w-20 h-8 px-2 text-right border border-stone-300 rounded-lg text-xs font-bold text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#ef7d19]"
                          />
                          <span className="font-bold text-stone-600">Metres</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="500"
                        step="10"
                        value={runDistanceMeters}
                        onChange={(e) => setRunDistanceMeters(Number(e.target.value))}
                        className="w-full accent-[#ef7d19]"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400">
                        <span>20m</span>
                        <span>80m (Standard Factory Run)</span>
                        <span>200m</span>
                        <span>500m</span>
                      </div>
                    </div>

                    {/* Installation Environment & Power Factor */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                      <div>
                        <span className="text-xs font-semibold text-stone-700 block mb-1">
                          Laying Medium:
                        </span>
                        <select
                          value={installation}
                          onChange={(e) => setInstallation(e.target.value as "Air" | "Ground")}
                          className="w-full h-8 px-2 border border-stone-300 rounded-lg text-xs font-medium text-stone-800 bg-white"
                        >
                          <option value="Air">In Air / Perforated Cable Tray</option>
                          <option value="Ground">Directly Buried in Ground / Trench</option>
                        </select>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-stone-700 block mb-1">
                          Operating Power Factor:
                        </span>
                        <select
                          value={powerFactor}
                          onChange={(e) => setPowerFactor(Number(e.target.value))}
                          className="w-full h-8 px-2 border border-stone-300 rounded-lg text-xs font-medium text-stone-800 bg-white"
                        >
                          <option value="0.80">0.80 (Standard Induction Motors)</option>
                          <option value="0.85">0.85 (Industrial Plant Average)</option>
                          <option value="0.90">0.90 (High Efficiency Drives)</option>
                          <option value="0.95">0.95 (APFC Corrected Bus)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Calculated Engineering Summary Card */}
                  <div className="bg-orange-50/70 rounded-xl p-4 border border-orange-200 space-y-2 text-xs">
                    <div className="flex items-center gap-2 font-bold text-[#c25e0a]">
                      <Sparkles className="size-4" />
                      <span>Calculated Full Load Continuous Current</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-stone-600">Rated Design Current (FLC):</span>
                      <strong className="text-2xl font-black text-[#4d1217] font-['Space_Grotesk']">
                        {sizingResult.calculatedAmps} A
                      </strong>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Formula applied: I = P(kW) × 1000 / (√3 × {voltagePhase === "415V_3P" ? "415V" : "230V"} × {powerFactor})
                    </p>
                  </div>
                </div>

                {/* Right Column: Engineering Recommendation & Action (6 Cols) */}
                <div className="lg:col-span-6 space-y-5">
                  {/* Conductor Toggle for Sizing */}
                  <div className="bg-white rounded-xl p-4 border border-[#ebd7c7] shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">Target Conductor Metal</span>
                      <span className="text-[11px] text-stone-500">Compare Aluminium vs Copper sizing</span>
                    </div>
                    <div className="flex gap-1.5 bg-stone-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setSizingConductor("Aluminum")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                          sizingConductor === "Aluminum"
                            ? "bg-[#4d1217] text-white shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        Aluminium
                      </button>
                      <button
                        type="button"
                        onClick={() => setSizingConductor("Copper")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                          sizingConductor === "Copper"
                            ? "bg-[#4d1217] text-white shadow-xs"
                            : "text-stone-600 hover:text-stone-900"
                        }`}
                      >
                        Copper
                      </button>
                    </div>
                  </div>

                  {/* Primary Recommendation Card */}
                  <div className="bg-white rounded-xl p-5 border-2 border-[#ef7d19] shadow-md space-y-4">
                    <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
                          ENGINEERED IS 7098 RECOMMENDATION
                        </span>
                        <h3 className="text-xl font-bold text-[#4d1217] font-['Space_Grotesk'] mt-1">
                          {activeRecommendation.runs > 1 ? `${activeRecommendation.runs} Runs × ` : ""}
                          {activeRecommendation.sizeLabel} ({sizingConductor})
                        </h3>
                        <span className="text-xs text-stone-500">
                          3.5 Core XLPE Insulated Armoured Cable ({sizingConductor})
                        </span>
                      </div>
                      <div className="size-10 rounded-xl bg-orange-50 text-[#ef7d19] border border-orange-200 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="size-5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
                        <span className="text-stone-500 text-[10px] block">Ampacity Limit:</span>
                        <strong className="text-stone-900 text-sm">
                          {activeRecommendation.safeAmpacityTotal} A
                        </strong>
                        <span className="text-[10px] text-emerald-600 block mt-0.5">
                          ✓ Safe for {sizingResult.calculatedAmps} A load
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/80">
                        <span className="text-stone-500 text-[10px] block">Voltage Drop ({runDistanceMeters}m):</span>
                        <strong className="text-stone-900 text-sm">
                          {activeRecommendation.voltageDropPct}% ({activeRecommendation.voltageDropVolts} V)
                        </strong>
                        <span className={`text-[10px] block mt-0.5 ${activeRecommendation.isDropCompliant ? "text-emerald-600 font-semibold" : "text-amber-600"}`}>
                          {activeRecommendation.isDropCompliant ? "✓ Under 3% IS 7098 limit" : "Exceeds standard 3%"}
                        </span>
                      </div>
                    </div>

                    {/* Sizing Compliance Note */}
                    <div className="text-[11px] text-stone-600 rounded-lg bg-stone-50 p-3 border border-stone-200 space-y-1">
                      <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-emerald-600" />
                        <span>IS 7098 Part 1 & IS 694 Verified</span>
                      </div>
                      <p className="text-[10px] text-stone-500">
                        Recommended cable size accounts for derating factors, continuous thermal dissipation in {installation === "Air" ? "ambient air" : "direct trench burial"}, and {activeRecommendation.runs > 1 ? "parallel load distribution" : "single run delivery"}.
                      </p>
                    </div>

                    {/* Apply to Cost Estimator Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleApplySizedCable(sizingConductor === "Aluminum")}
                        className="w-full py-3 px-4 rounded-xl bg-[#ef7d19] hover:bg-[#d96c14] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Sliders className="size-4" />
                        <span>Apply Sized Cable to Cost Estimator ({activeRecommendation.sizeLabel})</span>
                      </button>
                    </div>
                  </div>

                  {/* Alternative Conductor Comparison */}
                  <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-stone-700 block">
                        Alternative in {sizingConductor === "Aluminum" ? "Copper" : "Aluminium"}:
                      </span>
                      <strong className="text-stone-900">
                        {alternativeRecommendation.runs > 1 ? `${alternativeRecommendation.runs} Runs × ` : ""}
                        {alternativeRecommendation.sizeLabel} ({alternativeRecommendation.safeAmpacityTotal}A limit, {alternativeRecommendation.voltageDropPct}% drop)
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplySizedCable(sizingConductor !== "Aluminum")}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 hover:border-[#4d1217] bg-white text-[#4d1217] font-bold text-xs transition-colors shrink-0"
                    >
                      Use {sizingConductor === "Aluminum" ? "Copper" : "Aluminium"}
                    </button>
                  </div>

                  {/* 11kV Substation Alternative if heavy load */}
                  {sizingResult.htFeederAlternative && (
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <AlertTriangle className="size-4 text-amber-600" />
                        <span>High Power Feeder Notice</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        {sizingResult.htFeederAlternative.rationale}
                      </p>
                      <button
                        type="button"
                        onClick={handleApplyHTFeeder}
                        className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                      >
                        Switch to 11kV Substation Cable Feeder
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* DEDICATED GUIDANCE CARD WHEN USER SELECTS SIZING ON A NON-CABLE CATEGORY */
              <div className="p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4">
                <div className="size-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
                  <Zap className="size-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-[#ef7d19]">
                    ELECTRICAL ENGINEERING NOTICE
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#4d1217] font-['Space_Grotesk']">
                    Load & Cable Sizing Guide is Exclusively for Wires & Cables
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    Ampacity, full load continuous current (FLC), voltage drop percentage, and conductor cross-section calculations (per IS 7098 & IS 694) are specifically calibrated for electrical power transmission cables.
                  </p>
                  <p className="text-xs text-stone-500">
                    You have selected <strong className="text-stone-800">{selectedCategoryMeta.name}</strong>. Use the Cost Estimator tab to configure product models, manufacturer list prices (MRP), website discounts, and complete procurement bills of materials.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId("cables");
                    }}
                    className="bg-[#ef7d19] hover:bg-[#d96c14] text-white font-bold text-xs"
                  >
                    <Cable className="size-3.5 mr-1.5" />
                    Switch to Wires & Cables for Sizing
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("cost")}
                    className="border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold"
                  >
                    Go to {selectedCategoryMeta.shortName} Estimator &rarr;
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
