import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Calculator,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  Sparkles,
  Zap,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  Percent,
  Layers,
  Scale,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Download,
  ShoppingCart,
  RotateCcw,
  Truck,
  Phone,
  Search,
  ExternalLink,
  Cable,
  PlugZap,
  Wrench,
  SunMedium,
} from "lucide-react";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import jsPDF from "jspdf";
import {
  CABLE_CATALOG,
  BRAND_MULTIPLIERS,
  CableTypeOption,
} from "@/components/calculator/CableCalculatorModal";
import { calculateRealCableSizing } from "@/data/realWireData";
import { findRealWireProduct, type RealWireProduct } from "@/data/realWireProductsCatalog";
import {
  CALCULATOR_CATEGORIES,
  CategoryProductItem,
  getSubcategoriesForCategory,
  getBrandsForCategory,
  getProductsForCategory,
  getCategoryProductById,
} from "@/data/allCategoriesCalculatorData";

// Quick Sizing Reference Matrix based on IS 7098 / IS 694
const SIZING_REFERENCE_TABLE = [
  { kw: 3.7, hp: 5, amps: 7.2, copper: "2.5 sq.mm", alu: "4 sq.mm", maxDist: "120m", breaker: "16A" },
  { kw: 5.5, hp: 7.5, amps: 10.4, copper: "4 sq.mm", alu: "6 sq.mm", maxDist: "110m", breaker: "20A" },
  { kw: 7.5, hp: 10, amps: 14.1, copper: "4 sq.mm", alu: "10 sq.mm", maxDist: "95m", breaker: "25A" },
  { kw: 11, hp: 15, amps: 20.5, copper: "6 sq.mm", alu: "10 sq.mm", maxDist: "85m", breaker: "32A" },
  { kw: 15, hp: 20, amps: 27.5, copper: "10 sq.mm", alu: "16 sq.mm", maxDist: "90m", breaker: "40A" },
  { kw: 18.5, hp: 25, amps: 34.0, copper: "10 sq.mm", alu: "25 sq.mm", maxDist: "80m", breaker: "50A" },
  { kw: 22, hp: 30, amps: 40.0, copper: "16 sq.mm", alu: "25 sq.mm", maxDist: "95m", breaker: "63A" },
  { kw: 30, hp: 40, amps: 54.5, copper: "25 sq.mm", alu: "35 sq.mm", maxDist: "90m", breaker: "80A" },
  { kw: 37, hp: 50, amps: 67.0, copper: "25 sq.mm", alu: "50 sq.mm", maxDist: "80m", breaker: "100A" },
  { kw: 45, hp: 60, amps: 81.5, copper: "35 sq.mm", alu: "70 sq.mm", maxDist: "85m", breaker: "125A" },
  { kw: 55, hp: 75, amps: 99.0, copper: "50 sq.mm", alu: "95 sq.mm", maxDist: "90m", breaker: "160A" },
  { kw: 75, hp: 100, amps: 135.0, copper: "70 sq.mm", alu: "120 sq.mm", maxDist: "85m", breaker: "200A" },
  { kw: 90, hp: 120, amps: 161.0, copper: "95 sq.mm", alu: "150 sq.mm", maxDist: "80m", breaker: "250A" },
  { kw: 110, hp: 150, amps: 196.0, copper: "120 sq.mm", alu: "185 sq.mm", maxDist: "85m", breaker: "315A" },
  { kw: 132, hp: 180, amps: 235.0, copper: "150 sq.mm", alu: "240 sq.mm", maxDist: "80m", breaker: "400A" },
  { kw: 160, hp: 215, amps: 284.0, copper: "185 sq.mm", alu: "300 sq.mm", maxDist: "85m", breaker: "400A" },
  { kw: 200, hp: 270, amps: 355.0, copper: "240 sq.mm", alu: "400 sq.mm", maxDist: "80m", breaker: "500A" },
  { kw: 250, hp: 335, amps: 444.0, copper: "300 sq.mm", alu: "2 Runs x 240 sq.mm", maxDist: "80m", breaker: "630A" },
  { kw: 315, hp: 420, amps: 559.0, copper: "2 Runs x 240 sq.mm", alu: "2 Runs x 300 sq.mm", maxDist: "80m", breaker: "800A" },
  { kw: 500, hp: 670, amps: 887.0, copper: "2 Runs x 400 sq.mm", alu: "3 Runs x 400 sq.mm", maxDist: "80m", breaker: "1250A" },
  { kw: 1140, hp: 1529, amps: 1865.9, copper: "4 Runs x 400 sq.mm", alu: "6 Runs x 400 sq.mm", maxDist: "80m", breaker: "2500A (or 11kV Substation)" },
];

export default function CalculatorPage() {
  const { addItem } = useCart();

  // Active Category (default 'cables')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("cables");
  const selectedCategoryMeta = useMemo(() => {
    return CALCULATOR_CATEGORIES.find((c) => c.id === selectedCategoryId) ?? CALCULATOR_CATEGORIES[0];
  }, [selectedCategoryId]);

  const isCable = selectedCategoryId === "cables";

  // Mode selection: 'cost' or 'sizing' or 'chart'
  const [activeTab, setActiveTab] = useState<"cost" | "sizing" | "chart">("cost");

  // Cost Estimator state - Cables
  const [selectedCableId, setSelectedCableId] = useState<string>("lt-armored");
  const [conductor, setConductor] = useState<"Copper" | "Aluminum">("Copper");
  const [selectedCore, setSelectedCore] = useState<string>("3.5 Core");
  const [selectedSize, setSelectedSize] = useState<string>("50 sq.mm");
  const [selectedBrand, setSelectedBrand] = useState<string>("Polycab");
  const [quantityMeters, setQuantityMeters] = useState<number>(500);

  // Cost Estimator state - Non-Cable Categories
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

  // Commercial Common states
  const [contractorDiscount, setContractorDiscount] = useState<number>(12);
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Sizing Calculator state (ONLY FOR CABLES)
  const [loadKw, setLoadKw] = useState<number>(30);
  const [loadHp, setLoadHp] = useState<number>(40);
  const [loadInputMode, setLoadInputMode] = useState<"kW" | "HP">("kW");
  const [voltagePhase, setVoltagePhase] = useState<"415V_3P" | "230V_1P">("415V_3P");
  const [runDistanceMeters, setRunDistanceMeters] = useState<number>(80);
  const [powerFactor, setPowerFactor] = useState<number>(0.85);
  const [chartSearch, setChartSearch] = useState<string>("");

  const activeCableType = useMemo(() => {
    return CABLE_CATALOG.find((c) => c.id === selectedCableId) ?? CABLE_CATALOG[0];
  }, [selectedCableId]);

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

  // Unified Product Properties
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
    ? `${currentCore} · ${currentSizeObj.size} (${currentConductor})`
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

  // Project totals
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
    : "Standard Export Carton / Box";

  // Sizing calculations (Wires & Cables only)
  const effectiveKw = useMemo(() => {
    return loadInputMode === "kW" ? loadKw : Math.round(loadHp * 0.7457 * 10) / 10;
  }, [loadInputMode, loadKw, loadHp]);

  const calculatedAmps = useMemo(() => {
    if (voltagePhase === "415V_3P") {
      return Math.round((effectiveKw * 1000) / (1.732 * 415 * powerFactor) * 10) / 10;
    } else {
      return Math.round((effectiveKw * 1000) / (230 * powerFactor) * 10) / 10;
    }
  }, [effectiveKw, voltagePhase, powerFactor]);

  // Real wire engineering sizing engine state
  const [sizingConductor, setSizingConductor] = useState<"Aluminum" | "Copper">("Aluminum");
  const [installation, setInstallation] = useState<"Air" | "Ground">("Air");

  // Real wire engineering calculation
  const realSizing = useMemo(() => {
    return calculateRealCableSizing(
      effectiveKw,
      voltagePhase,
      runDistanceMeters,
      powerFactor,
      installation
    );
  }, [effectiveKw, voltagePhase, runDistanceMeters, powerFactor, installation]);

  const activeRec = sizingConductor === "Aluminum" ? realSizing.alRecommendation : realSizing.cuRecommendation;
  const altRec = sizingConductor === "Aluminum" ? realSizing.cuRecommendation : realSizing.alRecommendation;

  // Apply sized cable directly to Cost Estimator
  const applySizingToCost = (useAlu: boolean = sizingConductor === "Aluminum") => {
    const rec = useAlu ? realSizing.alRecommendation : realSizing.cuRecommendation;
    const condName: "Aluminum" | "Copper" = useAlu ? "Aluminum" : "Copper";

    setSelectedCategoryId("cables");
    setSelectedCableId("lt-armored");
    setConductor(condName);
    setSelectedCore("3.5 Core");

    const ltItem = CABLE_CATALOG.find((c) => c.id === "lt-armored");
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
    if (!realSizing.htFeederAlternative) return;
    setSelectedCategoryId("cables");
    setSelectedCableId("ht-armored-11kv");
    setConductor("Aluminum");
    setSelectedCore("3 Core (Round Wire Armoured)");

    const htItem = CABLE_CATALOG.find((c) => c.id === "ht-armored-11kv");
    if (htItem) {
      const match = htItem.sizes.find((s) => realSizing.htFeederAlternative?.recommendedCable.includes(s.size));
      if (match) setSelectedSize(match.size);
    }
    setQuantityMeters(runDistanceMeters);
    setActiveTab("cost");

    toast.success("11kV HT Substation Cable Applied!", {
      description: `Configured 11kV Substation Feed (${runDistanceMeters}m) with live EPC pricing.`,
    });
  };

  // Add to Cart
  const handleAddToCart = () => {
    addItem({
      id: isCable
        ? (realCableProduct.productId || `CALC-${selectedCableId}-${currentSizeObj.size}-${conductor}`)
        : (activeNonCableProduct?.id || `CALC-${activeProductSku}`),
      name: activeProductName,
      category: activeCategoryName,
      sku: activeProductSku,
      detail: activeSpecSummary,
      price: Math.round(taxableSubtotal / activeQuantity),
      unit: activeUnitLabel,
      quantity: activeQuantity,
      image: isCable ? "/products/cables.jpg" : undefined,
    });
    toast.success("Added Estimate to Cart", {
      description: `${activeQuantity} ${activeUnitLabel}s of ${activeBrandName} (${activeProductSku}) added to procurement cart.`,
    });
  };

  // Copy Summary
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
${contractorDiscount > 0 ? `Additional Contractor Slab (${contractorDiscount}%): -₹${contractorDiscountAmount.toLocaleString("en-IN")}\n` : ""}Net Taxable Subtotal: ₹${taxableSubtotal.toLocaleString("en-IN")}
18% GST: ₹${gstAmount.toLocaleString("en-IN")}
Final Payable Estimate: ₹${finalTotal.toLocaleString("en-IN")} (Total Savings: ₹${totalSavings.toLocaleString("en-IN")})
${isCable ? `Approx Gross Weight: ~${totalWeightKg.toLocaleString("en-IN")} kg (${drumType})\n` : ""}Generated on Volamp Online Estimation Desk: https://volampelektrikals.com/calculator`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Estimation copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp Quote
  const handleWhatsAppQuote = () => {
    const text = `Hello Volamp Supply Desk, I generated a project estimation on your calculator:
*Category:* ${activeCategoryName}
*Brand:* ${activeBrandName}
*Product:* ${activeProductName}
*Catalog SKU:* ${activeProductSku}
*Specification:* ${activeSpecSummary}
*Quantity:* ${activeQuantity} ${activeUnitLabel}s
*Gross List (MRP):* ₹${unitListPrice.toLocaleString("en-IN")}/${activeUnitLabel}
*Website Discount:* ${websiteDiscountPct}% OFF
*Net Rate:* ₹${unitNetPrice.toLocaleString("en-IN")}/${activeUnitLabel}
*Estimated Total:* ₹${finalTotal.toLocaleString("en-IN")} (incl. 18% GST)
${isCable ? `*Weight:* ~${totalWeightKg} kg\n` : ""}Please confirm availability and dispatch schedule from Ahmedabad.`;

    window.open(`https://wa.me/919512365582?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Download PDF
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(29, 115, 183);
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("VOLAMP ELEKTRIKALS · ELECTRICAL PROJECT ESTIMATION", 14, 16);

      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text("Official Technical Sizing & Cost Breakdown · ISO 9001:2015 · IS/IEC Certified", 14, 32);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 150, 32);

      // Box
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 38, 182, 34, 2, 2, "FD");

      doc.setTextColor(29, 115, 183);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${activeBrandName.toUpperCase()} — ${activeProductName.toUpperCase()}`, 18, 48);

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(`Catalog SKU: ${activeProductSku} · Category: ${activeCategoryName}`, 18, 56);
      doc.text(`Specification: ${activeSpecSummary}`, 18, 64);

      // Financials
      let yPos = 82;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("COMMERCIAL & FINANCIAL BREAKDOWN", 14, yPos);
      yPos += 8;

      const lines = [
        ["Product Specification & Model", `${activeProductName} (${activeSpecSummary})`],
        ["Catalog Manufacturer SKU", activeProductSku],
        ["Procurement Quantity", `${activeQuantity.toLocaleString("en-IN")} ${activeUnitLabel}s`],
        ["Gross Unit List Price (Pricelist MRP)", `Rs. ${unitListPrice.toLocaleString("en-IN")}/${activeUnitLabel}`],
        ["Website Catalog Discount", `${websiteDiscountPct}% OFF (-Rs. ${unitDiscountAmount.toLocaleString("en-IN")}/${activeUnitLabel})`],
        ["Volamp Online Net Rate", `Rs. ${unitNetPrice.toLocaleString("en-IN")}/${activeUnitLabel}`],
        ["Gross List Total (Unchecked MRP)", `Rs. ${listTotal.toLocaleString("en-IN")}`],
        [`Total Website Discount (${websiteDiscountPct}%)`, `- Rs. ${websiteDiscountTotal.toLocaleString("en-IN")}`],
        [`Contractor Wholesale Rebate (${contractorDiscount}%)`, `- Rs. ${contractorDiscountAmount.toLocaleString("en-IN")}`],
        ["Net Taxable Subtotal", `Rs. ${taxableSubtotal.toLocaleString("en-IN")}`],
        ["Goods & Services Tax (GST 18%)", `Rs. ${gstAmount.toLocaleString("en-IN")}`],
        ["Total Estimated Procurement Value", `Rs. ${finalTotal.toLocaleString("en-IN")}`],
        ["Total Project Cost Savings", `Rs. ${totalSavings.toLocaleString("en-IN")} (${websiteDiscountPct + contractorDiscount}% off MRP)`],
      ];

      lines.forEach(([lbl, val]) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(lbl, 18, yPos);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(15, 23, 42);
        doc.text(val, 110, yPos);

        doc.setDrawColor(241, 245, 249);
        doc.line(14, yPos + 3, 196, yPos + 3);
        yPos += 7.5;
      });

      // Engineering Sizing notes (if cables)
      if (isCable) {
        yPos += 10;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(3, 105, 161);
        doc.text("ENGINEERING COMPLIANCE & VOLTAGE DROP SUMMARY", 14, yPos);
        yPos += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(51, 65, 85);
        doc.text(
          `Calculated Full Load Current: ${realSizing.calculatedAmps} A (${effectiveKw} kW / ${loadHp} HP at ${voltagePhase === "415V_3P" ? "415V 3-Phase" : "230V 1-Phase"})\n` +
          `Recommended Minimum Sizing: ${realSizing.cuRecommendation.runs > 1 ? `${realSizing.cuRecommendation.runs} Runs × ` : ""}${realSizing.cuRecommendation.sizeLabel} (Copper) or ${realSizing.alRecommendation.runs > 1 ? `${realSizing.alRecommendation.runs} Runs × ` : ""}${realSizing.alRecommendation.sizeLabel} (Aluminium)\n` +
          `Estimated Voltage Drop over ${runDistanceMeters}m: ${activeRec.voltageDropVolts} V (${activeRec.voltageDropPct}% drop - ${activeRec.isDropCompliant ? "Conforms to IS 7098" : "Stepped up for IS 7098"})`,
          14,
          yPos
        );
      }

      // Footer
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text("Volamp Elektrikals · GIDC Estate, Vatva, Ahmedabad, Gujarat · Phone: +91 9512365582 · sales@volampelektrikals.com", 14, 285);

      doc.save(`VOLAMP_Estimation_${activeBrandName}_${activeProductSku}.pdf`);
      toast.success("PDF Estimation Saved!");
    } catch (e: any) {
      toast.error("Failed to generate PDF", { description: e.message });
    }
  };

  // Filtered reference table
  const filteredReferenceTable = useMemo(() => {
    if (!chartSearch.trim()) return SIZING_REFERENCE_TABLE;
    const q = chartSearch.toLowerCase();
    return SIZING_REFERENCE_TABLE.filter(
      (r) =>
        String(r.kw).includes(q) ||
        String(r.hp).includes(q) ||
        r.copper.toLowerCase().includes(q) ||
        r.alu.toLowerCase().includes(q) ||
        r.breaker.toLowerCase().includes(q)
    );
  }, [chartSearch]);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090f17] text-[#1e293b] dark:text-[#f1f5f9] font-sans flex flex-col transition-colors">
      <UniversalHeader currentPage="calculator" />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-sky-50/30 to-[#f8fafc] dark:from-[#0c1522] dark:via-[#090f17] dark:to-[#090f17] border-b border-slate-200/80 dark:border-slate-800/80 py-10 sm:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-[#1d73b7] dark:text-sky-400 tracking-wider uppercase backdrop-blur-sm">
            <Calculator className="size-3.5" />
            <span>ONLINE INDUSTRIAL PRODUCTS & SIZING CALCULATOR</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-['Space_Grotesk'] leading-tight">
            Industrial Products & Project Cost Estimator
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Engineered for electrical contractors, EPC consultants, and industrial procurement teams. Configure products across all 8 categories with live manufacturer MRP list prices, website discounts, and dedicated cable load sizing.
          </p>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" /> IS 7098 & IS 694 Conforming
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="size-4 text-[#1d73b7] dark:text-sky-400" /> 8 Full Product Categories
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 text-amber-500" /> Pan-India Direct Warehouse Dispatch
            </span>
          </div>
        </div>
      </section>

      {/* Main Interactive Calculator Area */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        
        {/* Category Switcher Bar (All 8 Categories) */}
        <div className="bg-white dark:bg-[#0e1726] rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="size-4 text-[#1d73b7] dark:text-sky-400" />
              Select Product Category:
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50">
              Live Master Catalog Feed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
            {CALCULATOR_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "border-[#1d73b7] bg-blue-50/70 dark:bg-sky-950/50 text-[#1d73b7] dark:text-sky-300 font-bold shadow-xs ring-1 ring-[#1d73b7]/30"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate">{cat.shortName}</span>
                    {cat.hasSizingGuide && (
                      <span className="text-[9px] px-1 py-0.2 rounded font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Sizing
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {cat.unit}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center justify-center sm:justify-start gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("cost")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "cost"
                ? "bg-[#1d73b7] text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <FileSpreadsheet className="size-4" />
            <span>1. {isCable ? "Project Cost & Brand Estimator" : `${selectedCategoryMeta.shortName} Cost Estimator`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sizing")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "sizing"
                ? "bg-[#1d73b7] text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Zap className="size-4" />
            <span>2. Conductor Load & Voltage Drop</span>
            {!isCable && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                Cables Only
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("chart")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "chart"
                ? "bg-[#1d73b7] text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Layers className="size-4" />
            <span>3. IS Standard Sizing Chart</span>
            {!isCable && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                Cables Only
              </span>
            )}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PROJECT COST & BRAND ESTIMATOR (ALL CATEGORIES)                    */}
        {/* ========================================================================= */}
        {activeTab === "cost" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            
            {/* Left 7 Cols: Configuration Controls */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
              {isCable ? (
                /* WIRES & CABLES CONTROLS */
                <>
                  {/* Brand Multiplier Selector */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Select Manufacturer Brand
                      </label>
                      <span className="text-[11px] text-[#1d73b7] dark:text-sky-400 font-bold">
                        Official Discount Index
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {BRAND_MULTIPLIERS.map((b) => (
                        <button
                          key={b.name}
                          type="button"
                          onClick={() => setSelectedBrand(b.name)}
                          className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                            selectedBrand === b.name
                              ? "border-[#1d73b7] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1d73b7]/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-[#0c1522]"
                          }`}
                        >
                          <span className="block text-xs font-black text-slate-900 dark:text-white">
                            {b.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            {b.badge}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cable Type Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Cable Category & Insulation Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {CABLE_CATALOG.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedCableId(c.id)}
                          className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                            selectedCableId === c.id
                              ? "border-[#1d73b7] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1d73b7]/20"
                              : "border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-[#0c1522]"
                          }`}
                        >
                          <span className="block text-xs font-black text-slate-900 dark:text-white">
                            {c.name}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            {c.voltage} · {c.standard}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Conductor & Core Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Conductor Metal
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableConductors.map((cond) => (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => setConductor(cond as any)}
                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                              conductor === cond
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs"
                                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                            }`}
                          >
                            {cond}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Core Configuration
                      </label>
                      <select
                        value={currentCore}
                        onChange={(e) => setSelectedCore(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1522] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1d73b7]"
                      >
                        {activeCableType.cores.map((core) => (
                          <option key={core} value={core}>
                            {core}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Conductor Cross Section Size */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Conductor Size (sq.mm)
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Weight: ~{currentSizeObj.approxWeightKgPerKm} kg/km
                      </span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {activeCableType.sizes.map((s) => (
                        <button
                          key={s.size}
                          type="button"
                          onClick={() => setSelectedSize(s.size)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            selectedSize === s.size
                              ? "bg-[#1d73b7] text-white border-[#1d73b7] shadow-sm"
                              : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 bg-white dark:bg-[#0c1522]"
                          }`}
                        >
                          {s.size.replace(" sq.mm", "")}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity Slider & Input */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Procurement Quantity (Metres)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={10}
                          max={50000}
                          step={50}
                          value={quantityMeters}
                          onChange={(e) => setQuantityMeters(Math.max(10, parseInt(e.target.value, 10) || 10))}
                          className="w-24 h-8 text-xs font-bold text-center rounded-xl"
                        />
                        <span className="text-xs font-semibold text-slate-400">Mtrs</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={5000}
                      step={50}
                      value={quantityMeters}
                      onChange={(e) => setQuantityMeters(parseInt(e.target.value, 10))}
                      className="w-full accent-[#1d73b7] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>50m (Sample)</span>
                      <span>500m (Std Drum)</span>
                      <span>1,000m (Reel)</span>
                      <span>5,000m (Bulk)</span>
                    </div>
                  </div>
                </>
              ) : (
                /* NON-CABLE CATEGORY CONFIGURATION */
                <>
                  {/* Step 1: Subcategory & Brand */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Subcategory & Brand ({selectedCategoryMeta.name})
                      </label>
                      <span className="text-[11px] text-[#1d73b7] dark:text-sky-400 font-bold">
                        {availableSubcats.length} Subcategories
                      </span>
                    </div>

                    {/* Subcategory Chips */}
                    <div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Select Subcategory:
                      </span>
                      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                        {availableSubcats.map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => {
                              setNonCableSubcat(sub);
                              const prods = getProductsForCategory(selectedCategoryId, sub);
                              if (prods.length > 0) setNonCableProductId(prods[0].id);
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              activeSubcat === sub
                                ? "bg-[#1d73b7] text-white border-[#1d73b7] shadow-xs"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1522] text-slate-700 dark:text-slate-300 hover:border-slate-400"
                            }`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Brand Chips */}
                    {availableBrands.length > 1 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
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
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                activeBrand === b
                                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs"
                                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1522] text-slate-700 dark:text-slate-300 hover:border-slate-400"
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Product Model Selection */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Select Model & Specification
                      </label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {availableProducts.length} items in catalog
                      </span>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {availableProducts.map((p) => {
                        const isSelected = activeNonCableProduct?.id === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setNonCableProductId(p.id)}
                            className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? "border-[#1d73b7] bg-blue-50/70 dark:bg-sky-950/40 ring-1 ring-[#1d73b7]/30 text-slate-900 dark:text-white"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-[#0c1522] text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="block text-xs font-bold truncate">{p.name}</span>
                              <span className="block text-[10px] text-slate-400 mt-0.5 truncate font-mono">
                                SKU: {p.sku} {p.spec ? `· ${p.spec}` : ""}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[11px] text-slate-400 line-through block">
                                ₹{p.listPrice.toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 block font-mono">
                                ₹{p.netPrice.toLocaleString("en-IN")}/{p.unit}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 3: Quantity */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Procurement Quantity ({activeUnitLabel}s)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={1}
                          max={50000}
                          value={nonCableQuantity}
                          onChange={(e) => setNonCableQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-24 h-8 text-xs font-bold text-center rounded-xl"
                        />
                        <span className="text-xs font-semibold text-slate-400">{activeUnitLabel}s</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 25, 50, 100, 250, 500].map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setNonCableQuantity(q)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            nonCableQuantity === q
                              ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1522] text-slate-700 dark:text-slate-300 hover:border-slate-400"
                          }`}
                        >
                          {q} {activeUnitLabel}s
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Contractor Discount Slider */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Percent className="size-3.5 text-[#1d73b7]" /> Contractor / Trade Slab Rebate
                  </label>
                  <span className="text-xs font-bold text-[#1d73b7] dark:text-sky-400">
                    {contractorDiscount}% Approved Slab
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={1}
                  value={contractorDiscount}
                  onChange={(e) => setContractorDiscount(parseInt(e.target.value, 10))}
                  className="w-full accent-[#1d73b7] cursor-pointer"
                />
              </div>

              {/* GST Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Include 18% GST in Total Project Estimate
                </span>
                <button
                  type="button"
                  onClick={() => setIncludeGst(!includeGst)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    includeGst ? "bg-[#1d73b7]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`size-4 rounded-full bg-white absolute top-1 transition-transform ${
                      includeGst ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Right 5 Cols: Live Commercial Quotation Card */}
            <div className="lg:col-span-5 bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/50 space-y-6 lg:sticky lg:top-20">
              
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1d73b7] dark:text-sky-400 block mb-1">
                  ESTIMATED COMMERCIAL QUOTATION
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-['Space_Grotesk'] leading-snug">
                  {activeBrandName} — {activeProductName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {activeCategoryName} · {activeSpecSummary}
                  </span>
                  <span>·</span>
                  <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-600 dark:text-slate-300">
                    {activeProductSku}
                  </span>
                </div>
              </div>

              {/* Price Breakdown Docket */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 text-xs overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
                <div className="p-3 flex justify-between items-center">
                  <span className="text-slate-500">List Price (Pricelist MRP)</span>
                  <span className="font-semibold text-slate-400 line-through">
                    ₹{unitListPrice.toLocaleString("en-IN")}/{activeUnitLabel}
                  </span>
                </div>
                <div className="p-3 flex justify-between items-center bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                  <span className="font-bold flex items-center gap-1.5">
                    Website Discount
                  </span>
                  <span className="font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[11px]">
                    {websiteDiscountPct}% OFF (-₹{unitDiscountAmount.toLocaleString("en-IN")}/{activeUnitLabel})
                  </span>
                </div>
                <div className="p-3 flex justify-between items-center bg-emerald-50/30 dark:bg-emerald-950/20">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Volamp Online Rate</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{unitNetPrice.toLocaleString("en-IN")}/{activeUnitLabel}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Procurement Quantity</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activeQuantity.toLocaleString("en-IN")} {activeUnitLabel}s
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Gross List Total</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{listTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-3 flex justify-between text-amber-700 dark:text-amber-400 font-semibold">
                  <span>Total Website Discount ({websiteDiscountPct}%)</span>
                  <span>-₹{websiteDiscountTotal.toLocaleString("en-IN")}</span>
                </div>
                {contractorDiscount > 0 && (
                  <div className="p-3 flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Additional Contractor Slab ({contractorDiscount}%)</span>
                    <span className="font-bold">-₹{contractorDiscountAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Net Taxable Subtotal</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{taxableSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">GST @ 18%</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {includeGst ? `₹${gstAmount.toLocaleString("en-IN")}` : "Excl."}
                  </span>
                </div>
                {/* Total Savings Pill */}
                <div className="p-3 bg-emerald-500/10 flex justify-between items-center text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-500" /> Total Discount Savings:
                  </span>
                  <span className="font-extrabold text-sm">
                    ₹{totalSavings.toLocaleString("en-IN")} ({websiteDiscountPct + (contractorDiscount > 0 ? contractorDiscount : 0)}% off MRP)
                  </span>
                </div>
                <div className="p-4 flex items-baseline justify-between bg-blue-500/10 border-t border-blue-500/20">
                  <span className="text-xs font-black text-slate-900 dark:text-white">
                    {includeGst ? "Total Project Estimate (incl. GST):" : "Net Taxable Estimate:"}
                  </span>
                  <span className="text-2xl font-black text-[#1d73b7] dark:text-sky-400 font-['Space_Grotesk']">
                    ₹{finalTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Packaging Details */}
              {isCable && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-xs space-y-1">
                  <div className="flex justify-between font-medium text-slate-600 dark:text-slate-400">
                    <span>Approx Gross Weight:</span>
                    <strong className="text-slate-900 dark:text-white">~{totalWeightKg.toLocaleString("en-IN")} kg</strong>
                  </div>
                  <div className="flex justify-between font-medium text-slate-600 dark:text-slate-400">
                    <span>Drum Packaging:</span>
                    <span className="text-slate-900 dark:text-white text-right max-w-xs">{drumType}</span>
                  </div>
                </div>
              )}

              {/* Actions Grid */}
              <div className="space-y-2.5">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-[#1d73b7] hover:bg-[#155a8f] text-white font-black text-xs h-12 rounded-2xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="size-4" />
                  <span>Add Sized Product to Cart (₹{finalTotal.toLocaleString("en-IN")})</span>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={handleWhatsAppQuote}
                    className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold text-xs h-10 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="size-4" />
                    <span>WhatsApp RFQ</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleDownloadPDF}
                    className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs h-10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="size-4" />
                    <span>Export PDF</span>
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                  <span>{copied ? "Estimate Copied!" : "Copy Specification Text"}</span>
                </button>
              </div>

              {/* Direct Link to Category Catalog */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                <Link
                  href={isCable ? "/category/wires-cables" : `/category/${selectedCategoryMeta.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1d73b7] dark:text-sky-400 hover:underline"
                >
                  <span>Explore full {selectedCategoryMeta.name} catalog</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CONDUCTOR SIZING & VOLTAGE DROP CALCULATOR                         */}
        {/* ========================================================================= */}
        {activeTab === "sizing" && (
          <div className="animate-in fade-in duration-200">
            {isCable ? (
              /* WIRES & CABLES ELECTRICAL LOAD SIZING ENGINE */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Input Controls */}
                <div className="lg:col-span-6 bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1d73b7] dark:text-sky-400 block mb-1">
                      AUTHENTIC IS 7098 / IS 694 SIZING ENGINE
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                      Electrical Load & Distance Parameters
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Engineered with authentic manufacturer ampacity ratings (Polycab, KEI, Finolex, Volamp OEM), IS 1255 parallel grouping derating, and CEA Discom grid compliance.
                    </p>
                  </div>

                  {/* CEA Discom Regulatory Banner */}
                  {realSizing.discomWarning && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] leading-relaxed">{realSizing.discomWarning}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVoltagePhase("415V_3P")}
                        className="text-[11px] font-bold underline hover:no-underline text-[#1d73b7] dark:text-sky-400 cursor-pointer block pl-6"
                      >
                        → Switch instantly to 415V 3-Phase (Recommended Industrial Standard)
                      </button>
                    </div>
                  )}

                  {/* Load Input (kW or HP) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Connected Load
                      </label>
                      <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-900 text-xs">
                        <button
                          type="button"
                          onClick={() => setLoadInputMode("kW")}
                          className={`px-3 py-1 rounded-md font-bold transition-all ${
                            loadInputMode === "kW" ? "bg-[#1d73b7] text-white shadow-xs" : "text-slate-500"
                          }`}
                        >
                          kW
                        </button>
                        <button
                          type="button"
                          onClick={() => setLoadInputMode("HP")}
                          className={`px-3 py-1 rounded-md font-bold transition-all ${
                            loadInputMode === "HP" ? "bg-[#1d73b7] text-white shadow-xs" : "text-slate-500"
                          }`}
                        >
                          HP
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min={0.5}
                        max={10000}
                        step={1}
                        value={loadInputMode === "kW" ? loadKw : loadHp}
                        onChange={(e) => {
                          const val = Math.max(0.5, parseFloat(e.target.value) || 1);
                          if (loadInputMode === "kW") {
                            setLoadKw(val);
                            setLoadHp(Math.round((val / 0.7457) * 10) / 10);
                          } else {
                            setLoadHp(val);
                            setLoadKw(Math.round(val * 0.7457 * 10) / 10);
                          }
                        }}
                        className="h-11 text-base font-black rounded-xl"
                      />
                      <span className="text-sm font-bold text-slate-500 shrink-0">
                        {loadInputMode === "kW" ? `(${loadHp} HP equivalent)` : `(${loadKw} kW equivalent)`}
                      </span>
                    </div>
                  </div>

                  {/* Voltage & Phase */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Supply System & Voltage
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setVoltagePhase("415V_3P")}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          voltagePhase === "415V_3P"
                            ? "border-[#1d73b7] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1d73b7]/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-[#0c1522]"
                        }`}
                      >
                        <span className="block text-xs font-black text-slate-900 dark:text-white">
                          415V 3-Phase AC
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Industrial / Commercial Motors
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVoltagePhase("230V_1P")}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          voltagePhase === "230V_1P"
                            ? "border-[#1d73b7] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1d73b7]/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-400 bg-white dark:bg-[#0c1522]"
                        }`}
                      >
                        <span className="block text-xs font-black text-slate-900 dark:text-white">
                          230V 1-Phase AC
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Residential / Light Commercial
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Run Distance (Metres) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Cable Route Distance (One-Way)
                      </label>
                      <span className="text-xs font-bold text-[#1d73b7] dark:text-sky-400">
                        {runDistanceMeters} Metres
                      </span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={1000}
                      step={5}
                      value={runDistanceMeters}
                      onChange={(e) => setRunDistanceMeters(parseInt(e.target.value, 10))}
                      className="w-full accent-[#1d73b7] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>10m</span>
                      <span>80m (Avg Plant)</span>
                      <span>250m</span>
                      <span>500m</span>
                      <span>1,000m</span>
                    </div>
                  </div>

                  {/* Installation Medium & Power Factor */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Installation Laying
                      </label>
                      <select
                        value={installation}
                        onChange={(e) => setInstallation(e.target.value as "Air" | "Ground")}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1522] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1d73b7]"
                      >
                        <option value="Air">In Air / Perforated Cable Tray</option>
                        <option value="Ground">Direct Buried in Ground / Trench</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                        Power Factor (cos φ)
                      </label>
                      <select
                        value={powerFactor}
                        onChange={(e) => setPowerFactor(parseFloat(e.target.value))}
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1522] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1d73b7]"
                      >
                        <option value={0.8}>0.80 (Standard Induction Motors)</option>
                        <option value={0.85}>0.85 (Industrial Factory Average)</option>
                        <option value={0.9}>0.90 (High Efficiency Plant)</option>
                        <option value={0.95}>0.95 (APFC Panel Corrected)</option>
                        <option value={1.0}>1.00 (Pure Resistive / Heating)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right 6 Cols: Engineered Recommendation */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Conductor Toggle for Sizing */}
                  <div className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white block">
                        Target Sizing Conductor
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Compare Aluminium vs Copper continuous performance
                      </span>
                    </div>
                    <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSizingConductor("Aluminum")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          sizingConductor === "Aluminum"
                            ? "bg-[#1d73b7] text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        Aluminium
                      </button>
                      <button
                        type="button"
                        onClick={() => setSizingConductor("Copper")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          sizingConductor === "Copper"
                            ? "bg-[#1d73b7] text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        Copper
                      </button>
                    </div>
                  </div>

                  {/* Primary Recommendation Card */}
                  <div className="bg-gradient-to-br from-blue-50/80 via-white to-sky-50/50 dark:from-[#0c1c30] dark:via-[#0e1726] dark:to-[#0e1726] border-2 border-[#1d73b7] dark:border-sky-500/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-500/10 space-y-6">
                    <div className="flex items-start justify-between border-b border-blue-100 dark:border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#1d73b7] dark:text-sky-400 block mb-1">
                          RECOMMENDED CONTINUOUS SIZING (IS 7098)
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk'] leading-tight">
                          {activeRec.runs > 1 ? `${activeRec.runs} Runs × ` : ""}
                          {activeRec.sizeLabel} ({sizingConductor})
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          3.5 Core XLPE Insulated Heavy Duty Armoured Cable ({sizingConductor})
                        </p>
                      </div>
                      <div className="size-12 rounded-2xl bg-[#1d73b7] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/30">
                        <CheckCircle2 className="size-6" />
                      </div>
                    </div>

                    {/* Technical KPIs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Calculated FLC:</span>
                        <strong className="text-slate-900 dark:text-white text-base font-black">
                          {realSizing.calculatedAmps} A
                        </strong>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Ampacity Limit:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 text-base font-black">
                          {activeRec.safeAmpacityTotal} A
                        </strong>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Voltage Drop:</span>
                        <strong className="text-slate-900 dark:text-white text-base font-black">
                          {activeRec.voltageDropPct}%
                        </strong>
                      </div>
                      <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Volts Drop:</span>
                        <strong className="text-slate-900 dark:text-white text-base font-black">
                          {activeRec.voltageDropVolts} V
                        </strong>
                      </div>
                    </div>

                    {/* Sizing Compliance Banner */}
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                      <div className="flex items-center gap-2 font-bold">
                        <ShieldCheck className="size-4 text-emerald-500" />
                        <span>IS 7098 Part 1 & IS 1255 Voltage Drop Compliant</span>
                      </div>
                      <p className="text-[11px] text-emerald-800/90 dark:text-emerald-300/80 leading-relaxed">
                        Continuous ampacity derated for {installation === "Air" ? "tray ambient air dissipation" : "direct trench burial"}. Recommended breaker rating: <strong>{realSizing.calculatedAmps > 0 ? `${Math.ceil(realSizing.calculatedAmps * 1.25 / 10) * 10}A` : "Standard Breaker"}</strong>.
                      </p>
                    </div>

                    {/* Action: Apply directly to Cost Estimator */}
                    <Button
                      onClick={() => applySizingToCost(sizingConductor === "Aluminum")}
                      className="w-full bg-[#1d73b7] hover:bg-[#155a8f] text-white font-black text-xs h-12 rounded-2xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sliders className="size-4" />
                      <span>Configure Cable in Cost Estimator ({activeRec.runs > 1 ? `${activeRec.runs}x` : ""}{activeRec.sizeLabel})</span>
                    </Button>
                  </div>

                  {/* Alternative Material Card */}
                  <div className="p-4 rounded-3xl bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block uppercase font-bold">
                        Alternative Material Solution:
                      </span>
                      <strong className="text-slate-900 dark:text-white text-sm">
                        {altRec.runs > 1 ? `${altRec.runs} Runs × ` : ""}{altRec.sizeLabel} ({sizingConductor === "Aluminum" ? "Copper" : "Aluminium"})
                      </strong>
                      <span className="text-slate-500 block text-[11px]">
                        Ampacity: {altRec.safeAmpacityTotal} A · Voltage Drop: {altRec.voltageDropPct}%
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => applySizingToCost(sizingConductor !== "Aluminum")}
                      className="border-[#1d73b7] text-[#1d73b7] dark:text-sky-400 font-bold text-xs rounded-xl"
                    >
                      Use {sizingConductor === "Aluminum" ? "Copper" : "Aluminium"}
                    </Button>
                  </div>

                  {/* 11kV Feeder Alert for Large Industrial Loads */}
                  {realSizing.htFeederAlternative && (
                    <div className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 text-xs text-amber-900 dark:text-amber-200 space-y-3">
                      <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                        <span>High Power Feeder Warning (Mega Industrial Load)</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        {realSizing.htFeederAlternative.rationale}
                      </p>
                      <Button
                        onClick={handleApplyHTFeeder}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl"
                      >
                        Switch to 11kV Substation XLPE Armoured Feeder
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* DEDICATED GUIDANCE CARD WHEN USER SELECTS SIZING ON A NON-CABLE CATEGORY */
              <div className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-5 shadow-sm">
                <div className="size-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto shadow-sm">
                  <Zap className="size-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-[#1d73b7] dark:text-sky-400">
                    ELECTRICAL ENGINEERING NOTICE
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Load & Cable Sizing Guide is Exclusively for Wires & Cables
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Ampacity, full load continuous current (FLC), voltage drop percentage, and conductor cross-section calculations (per IS 7098 & IS 694) are specifically calibrated for electrical power transmission cables.
                  </p>
                  <p className="text-xs text-slate-500">
                    You have selected <strong className="text-slate-800 dark:text-slate-200">{selectedCategoryMeta.name}</strong>. Use the Cost Estimator tab to configure product models, manufacturer list prices (MRP), website discounts, and complete procurement bills of materials.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId("cables");
                    }}
                    className="bg-[#1d73b7] hover:bg-[#155a8f] text-white font-bold text-xs"
                  >
                    <Cable className="size-3.5 mr-1.5" />
                    Switch to Wires & Cables for Sizing
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("cost")}
                    className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold"
                  >
                    Go to {selectedCategoryMeta.shortName} Estimator &rarr;
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: IS STANDARD CABLE SIZING REFERENCE MATRIX                          */}
        {/* ========================================================================= */}
        {activeTab === "chart" && (
          <div className="animate-in fade-in duration-200">
            {isCable ? (
              <div className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1d73b7] dark:text-sky-400 block mb-1">
                      QUICK SELECTION MATRIX (IS 7098 / IS 694)
                    </span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                      Motor kW & HP vs Recommended Conductor Cross-Section
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Reference standards for 415V 3-Phase continuous industrial duties up to 3% voltage drop.
                    </p>
                  </div>

                  <div className="w-full sm:w-64">
                    <Input
                      type="text"
                      placeholder="Search kW, HP or cable size..."
                      value={chartSearch}
                      onChange={(e) => setChartSearch(e.target.value)}
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3.5">Motor Load</th>
                        <th className="p-3.5">Rated FLC (415V)</th>
                        <th className="p-3.5">Copper Recommended</th>
                        <th className="p-3.5">Aluminium Recommended</th>
                        <th className="p-3.5">Max Run Distance</th>
                        <th className="p-3.5">Breaker Rating</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                      {filteredReferenceTable.map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-blue-50/40 dark:hover:bg-sky-950/20 transition-colors"
                        >
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                            {row.kw} kW ({row.hp} HP)
                          </td>
                          <td className="p-3.5 font-mono">{row.amps} A</td>
                          <td className="p-3.5">
                            <span className="font-bold text-amber-700 dark:text-amber-400">
                              {row.copper}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {row.alu}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-500">{row.maxDist}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[10px] font-bold">
                              {row.breaker}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setLoadKw(row.kw);
                                setLoadHp(row.hp);
                                setActiveTab("sizing");
                              }}
                              className="text-xs font-bold text-[#1d73b7] dark:text-sky-400 hover:underline cursor-pointer"
                            >
                              Size in Engine →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* NOTICE WHEN NON-CABLE IS SELECTED IN TAB 3 */
              <div className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-10 sm:p-14 text-center max-w-2xl mx-auto space-y-5 shadow-sm">
                <div className="size-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center mx-auto shadow-sm">
                  <Layers className="size-8" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-widest text-[#1d73b7] dark:text-sky-400">
                    CABLE REFERENCE MATRIX
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                    IS 7098 / IS 694 Sizing Matrix is for Wires & Cables
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    The quick sizing matrix provides standard conductor cross-sections for electric motor drives up to 500 kW. To view this matrix, switch to the <strong>Wires & Cables</strong> category.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <Button
                    type="button"
                    onClick={() => setSelectedCategoryId("cables")}
                    className="bg-[#1d73b7] hover:bg-[#155a8f] text-white font-bold text-xs"
                  >
                    <Cable className="size-3.5 mr-1.5" />
                    Switch to Wires & Cables Matrix
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("cost")}
                    className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-bold"
                  >
                    Go to {selectedCategoryMeta.shortName} Estimator &rarr;
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <UniversalFooter />
    </div>
  );
}
