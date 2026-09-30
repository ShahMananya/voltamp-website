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

  // Mode selection: 'cost' or 'sizing' or 'chart'
  const [activeTab, setActiveTab] = useState<"cost" | "sizing" | "chart">("cost");

  // Cost Estimator state
  const [selectedCableId, setSelectedCableId] = useState<string>("lt-armored");
  const [conductor, setConductor] = useState<"Copper" | "Aluminum">("Copper");
  const [selectedCore, setSelectedCore] = useState<string>("3.5 Core");
  const [selectedSize, setSelectedSize] = useState<string>("50 sq.mm");
  const [selectedBrand, setSelectedBrand] = useState<string>("Polycab");
  const [quantityMeters, setQuantityMeters] = useState<number>(500);
  const [contractorDiscount, setContractorDiscount] = useState<number>(12);
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Sizing Calculator state
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

  // Sizing calculations
  const effectiveKw = useMemo(() => {
    return loadInputMode === "kW" ? loadKw : Math.round(loadHp * 0.7457 * 10) / 10;
  }, [loadInputMode, loadKw, loadHp]);

  const calculatedAmps = useMemo(() => {
    if (voltagePhase === "415V_3P") {
      // I = P (kW) * 1000 / (sqrt(3) * V * PF)
      return Math.round((effectiveKw * 1000) / (1.732 * 415 * powerFactor) * 10) / 10;
    } else {
      // I = P (kW) * 1000 / (V * PF)
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
      id: realProduct.productId || `CALC-${selectedCableId}-${currentSizeObj.size}-${conductor}`,
      name: realProduct.name || `${selectedBrand} ${activeCableType.name}`,
      category: activeCableType.category,
      sku: realProduct.sku,
      detail: `${currentCore} · ${currentSizeObj.size} · ${conductor}`,
      price: Math.round(taxableSubtotal / quantityMeters),
      unit: "Meter",
      quantity: quantityMeters,
      image: "/products/cables.jpg",
    });
    toast.success("Added Estimate to Cart", {
      description: `${quantityMeters}m of ${selectedBrand} ${currentSizeObj.size} (${realProduct.sku}) added to procurement cart.`,
    });
  };

  // Copy Summary
  const handleCopySummary = () => {
    const summary = `VOLAMP ESTIMATE SUMMARY:
Brand: ${selectedBrand} (${currentBrandObj.badge})
Product: ${realProduct.name}
Catalog SKU: ${realProduct.sku}
Spec: ${currentCore} x ${currentSizeObj.size} (${currentConductor})
Standard: ${activeCableType.standard} (${activeCableType.voltage})
Quantity: ${quantityMeters.toLocaleString("en-IN")} Metres
Gross List Price (MRP): ₹${unitListPrice.toLocaleString("en-IN")}/m (Gross Total: ₹${listTotal.toLocaleString("en-IN")})
Website Discount (${websiteDiscountPct}% OFF): -₹${websiteDiscountTotal.toLocaleString("en-IN")}
Net Rate: ₹${unitNetPrice.toLocaleString("en-IN")}/m
${contractorDiscount > 0 ? `Additional Contractor Slab (${contractorDiscount}%): -₹${contractorDiscountAmount.toLocaleString("en-IN")}\n` : ""}Net Taxable Subtotal: ₹${taxableSubtotal.toLocaleString("en-IN")}
18% GST: ₹${gstAmount.toLocaleString("en-IN")}
Final Payable Estimate: ₹${finalTotal.toLocaleString("en-IN")} (Total Savings: ₹${totalSavings.toLocaleString("en-IN")})
Approx Gross Weight: ~${totalWeightKg.toLocaleString("en-IN")} kg (${drumType})
Generated on Volamp Online Estimation Desk: https://volampelektrikals.com/calculator`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Estimation copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  // WhatsApp Quote
  const handleWhatsAppQuote = () => {
    const text = `Hello Volamp Supply Desk, I generated a project estimation on your calculator:
*Brand:* ${selectedBrand}
*Product:* ${realProduct.name}
*Catalog SKU:* ${realProduct.sku}
*Specification:* ${currentCore} x ${currentSizeObj.size} (${currentConductor})
*Quantity:* ${quantityMeters} Metres
*Gross List (MRP):* ₹${unitListPrice.toLocaleString("en-IN")}/m
*Website Discount:* ${websiteDiscountPct}% OFF
*Net Rate:* ₹${unitNetPrice.toLocaleString("en-IN")}/m
*Estimated Total:* ₹${finalTotal.toLocaleString("en-IN")} (incl. 18% GST)
*Weight:* ~${totalWeightKg} kg
Please confirm availability and dispatch schedule from Ahmedabad.`;

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
      doc.text(`${selectedBrand.toUpperCase()} — ${realProduct.name.toUpperCase()}`, 18, 48);

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.text(`Catalog SKU: ${realProduct.sku} · Spec: ${currentCore} x ${currentSizeObj.size} (${currentConductor})`, 18, 56);
      doc.text(`Standard: ${activeCableType.standard} · Rated Voltage: ${activeCableType.voltage}`, 18, 64);

      // Financials
      let yPos = 82;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("COMMERCIAL & FINANCIAL BREAKDOWN", 14, yPos);
      yPos += 8;

      const rows = [
        ["Total Procurement Quantity", `${quantityMeters.toLocaleString("en-IN")} Metres`],
        ["Gross List Price (Pricelist MRP)", `Rs. ${unitListPrice.toLocaleString("en-IN")} / Metre`],
        ["Gross List Value", `Rs. ${listTotal.toLocaleString("en-IN")}`],
        [`Website Discount (${websiteDiscountPct}% OFF)`, `- Rs. ${websiteDiscountTotal.toLocaleString("en-IN")}`],
        ...(contractorDiscount > 0 ? [[`Contractor Discount (${contractorDiscount}%)`, `- Rs. ${contractorDiscountAmount.toLocaleString("en-IN")}`]] : []),
        ["Net Taxable Subtotal", `Rs. ${taxableSubtotal.toLocaleString("en-IN")}`],
        ["Applicable 18% GST", `Rs. ${gstAmount.toLocaleString("en-IN")}`],
        ["Total Estimated Project Cost", `Rs. ${finalTotal.toLocaleString("en-IN")}`],
        ["Approximate Dispatch Weight", `~ ${totalWeightKg.toLocaleString("en-IN")} kg`],
        ["Packaging Form", drumType],
      ];

      rows.forEach(([lbl, val], idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, yPos - 4.5, 182, 7.5, "F");
        }
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

      // Engineering Sizing notes
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

      // Footer
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text("Volamp Elektrikals · GIDC Estate, Vatva, Ahmedabad, Gujarat · Phone: +91 9512365582 · sales@volampelektrikals.com", 14, 285);

      doc.save(`VOLAMP_Estimation_${selectedBrand}_${currentSizeObj.size.replace(/\s+/g, "_")}.pdf`);
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
            <span>ONLINE ELECTRICAL SIZING & ESTIMATION DESK</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-['Space_Grotesk'] leading-tight">
            Electrical Cable & Project Cost Estimator
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Engineered for electrical contractors, EPC consultants, and industrial procurement teams. Calculate continuous current ratings, voltage drops, recommended conductor cross-sections, and real manufacturer project costs with 18% GST.
          </p>

          {/* Quick Stats Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" /> IS 7098 & IS 694 Conforming
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="size-4 text-[#1d73b7] dark:text-sky-400" /> 6 Approved Brand Multipliers
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 text-amber-500" /> Pan-India Drum Dispatch Weights
            </span>
          </div>
        </div>
      </section>

      {/* Main Interactive Calculator Area */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-8">
        
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
            <span>1. Project Cost & Brand Estimator</span>
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
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PROJECT COST & BRAND ESTIMATOR                                     */}
        {/* ========================================================================= */}
        {activeTab === "cost" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            
            {/* Left 7 Cols: Configuration Controls */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              
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

              {/* Contractor Discount Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Percent className="size-3.5 text-[#1d73b7]" /> Contractor / Wholesale Discount
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
                  {selectedBrand} {realProduct.name || activeCableType.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {currentCore} · {currentSizeObj.size} ({currentConductor})
                  </span>
                  <span>·</span>
                  <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-bold text-slate-600 dark:text-slate-300">
                    {realProduct.sku}
                  </span>
                </div>
              </div>

              {/* Price Breakdown Docket */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 text-xs overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
                <div className="p-3 flex justify-between items-center">
                  <span className="text-slate-500">List Price (Pricelist MRP)</span>
                  <span className="font-semibold text-slate-400 line-through">
                    ₹{unitListPrice.toLocaleString("en-IN")}/m
                  </span>
                </div>
                <div className="p-3 flex justify-between items-center bg-amber-50/40 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                  <span className="font-bold flex items-center gap-1.5">
                    Website Discount
                  </span>
                  <span className="font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[11px]">
                    {websiteDiscountPct}% OFF (-₹{unitDiscountAmount.toLocaleString("en-IN")}/m)
                  </span>
                </div>
                <div className="p-3 flex justify-between items-center bg-emerald-50/30 dark:bg-emerald-950/20">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Volamp Online Rate</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{unitNetPrice.toLocaleString("en-IN")}/m
                  </span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-slate-500">Procurement Quantity</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {quantityMeters.toLocaleString("en-IN")} Metres
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

              {/* Packaging & Weight Details */}
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

              {/* Actions Grid */}
              <div className="space-y-2.5">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-[#1d73b7] hover:bg-[#155a8f] text-white font-black text-xs h-12 rounded-2xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="size-4" />
                  <span>Add Sized Cable to Cart (₹{finalTotal.toLocaleString("en-IN")})</span>
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
                  href="/category/wires-cables"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#1d73b7] dark:text-sky-400 hover:underline"
                >
                  <span>Browse 1,200+ Wires & Cables in Catalog</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-200">
            
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
                  Operating Potential & Phase
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVoltagePhase("415V_3P")}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      voltagePhase === "415V_3P"
                        ? "border-[#1d73b7] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1d73b7]/20"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span className="block text-xs font-black text-slate-900 dark:text-white">
                      415V 3-Phase (LT Industrial)
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Factories, motors, distribution panels
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVoltagePhase("230V_1P")}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                      voltagePhase === "230V_1P"
                        ? "border-[#1d73b7] bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-[#1d73b7]/20"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <span className="block text-xs font-black text-slate-900 dark:text-white">
                      230V 1-Phase (Commercial/Domestic)
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      Offices, light loads, residential (≤ 7.5 kW)
                    </span>
                  </button>
                </div>
              </div>

              {/* Conductor & Installation Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Conductor Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSizingConductor("Aluminum")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        sizingConductor === "Aluminum"
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xs"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Aluminium (IS 7098)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSizingConductor("Copper")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        sizingConductor === "Copper"
                          ? "bg-[#c2410c] text-white border-[#c2410c] shadow-xs"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Copper (IS 7098)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Installation Method
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInstallation("Air")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        installation === "Air"
                          ? "bg-[#1d73b7] text-white border-[#1d73b7] shadow-xs"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      In Air / Trays (40°C)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInstallation("Ground")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        installation === "Ground"
                          ? "bg-[#1d73b7] text-white border-[#1d73b7] shadow-xs"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      Buried in Ground (30°C)
                    </button>
                  </div>
                </div>
              </div>

              {/* Cable Run Distance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Estimated Run Distance from Source
                  </label>
                  <span className="text-sm font-black text-[#1d73b7] dark:text-sky-400">
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
                  <span>10m (Panel next to transformer)</span>
                  <span>100m (Plant shed)</span>
                  <span>500m (Remote pump)</span>
                  <span>1,000m (Long yard)</span>
                </div>
              </div>

              {/* Power Factor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Assumed Load Power Factor (cos φ)
                  </label>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {powerFactor}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0.8, 0.85, 0.9, 0.95].map((pf) => (
                    <button
                      key={pf}
                      type="button"
                      onClick={() => setPowerFactor(pf)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                        powerFactor === pf
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {pf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Docket */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-black/50 space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block mb-1">
                    IS 7098 & IS 1255 CERTIFIED ENGINEERING OUTPUT
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                    Recommended Cable Cross-Sections
                  </h3>
                </div>

                {/* Big Amp Rating Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold block">
                      Continuous Full Load Current:
                    </span>
                    <span className="text-3xl font-black text-[#1d73b7] dark:text-sky-400 font-['Space_Grotesk']">
                      {realSizing.calculatedAmps.toLocaleString("en-IN")} Amps
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      at {voltagePhase === "415V_3P" ? "415V 3-Phase" : "230V 1-Phase"}, cos φ = {powerFactor}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                    {effectiveKw} kW ({loadHp} HP)
                  </span>
                </div>

                {/* Primary Engineered Recommendation Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#1d73b7] dark:text-sky-400">
                      Primary Recommendation ({sizingConductor})
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-[#1d73b7] dark:text-sky-300 font-bold">
                      {activeRec.runs > 1 ? `${activeRec.runs} Parallel Runs` : "Single Run"}
                    </span>
                  </div>

                  <div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                      {activeRec.runs > 1 && (
                        <span className="text-[#1d73b7] dark:text-sky-400 mr-2">
                          {activeRec.runs} Runs ×
                        </span>
                      )}
                      3.5C {activeRec.sizeLabel}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Safe Derated Continuous Capacity: <strong className="text-slate-900 dark:text-white">{activeRec.safeAmpacityTotal} Amps</strong> (IS 1255 thermal & grouping derating applied)
                    </p>
                  </div>

                  {/* Alternative Conductor Quick Toggle */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Alternative {sizingConductor === "Aluminum" ? "Copper" : "Aluminium"}:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSizingConductor(sizingConductor === "Aluminum" ? "Copper" : "Aluminum")}
                      className="font-bold text-[#1d73b7] dark:text-sky-400 hover:underline cursor-pointer"
                    >
                      {altRec.runs > 1 ? `${altRec.runs} Runs × ` : ""}3.5C {altRec.sizeLabel} (Switch Conductor →)
                    </button>
                  </div>
                </div>

                {/* Voltage Drop Result */}
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    activeRec.isDropCompliant
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-300"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      {activeRec.isDropCompliant ? (
                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                      ) : (
                        <AlertTriangle className="size-4 text-rose-500 shrink-0" />
                      )}
                      Calculated Voltage Drop over {runDistanceMeters}m:
                    </span>
                    <span className="text-lg font-black font-['Space_Grotesk']">
                      {activeRec.voltageDropPct}% ({activeRec.voltageDropVolts} V)
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {activeRec.isDropCompliant
                      ? "✓ Safe! Conforms to statutory 5% motor/power limits prescribed by IS 7098 / IS 1255 standards."
                      : "⚠️ Excessive drop! Sizing automatically stepped up to adhere to standard limits."}
                  </p>
                </div>

                {/* 11kV HT Substation Card for Mega Loads (>= 150 kW) */}
                {realSizing.htFeederAlternative && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-800 dark:text-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                        <Zap className="size-4" /> HT 11kV Substation Engineering Feeder Option
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        {realSizing.htFeederAlternative.amps11kV} Amps at 11kV
                      </span>
                    </div>
                    <p className="text-xs">
                      For large loads (≥ 150 kW), stepping up to 11kV reduces current to <strong>{realSizing.htFeederAlternative.amps11kV} Amps</strong>, enabling a single <strong>{realSizing.htFeederAlternative.recommendedCable}</strong> with merely <strong>{realSizing.htFeederAlternative.voltageDropPct}%</strong> voltage drop over {runDistanceMeters}m.
                    </p>
                    <button
                      type="button"
                      onClick={handleApplyHTFeeder}
                      className="text-xs font-bold text-amber-700 dark:text-amber-300 underline hover:no-underline cursor-pointer"
                    >
                      → Configure 11kV HT Substation Cable in Cost Estimator
                    </button>
                  </div>
                )}

                {/* Apply Button */}
                <Button
                  onClick={() => applySizingToCost(sizingConductor === "Aluminum")}
                  className="w-full bg-[#1d73b7] hover:bg-[#155a8f] text-white font-bold text-xs h-12 rounded-2xl shadow-lg shadow-sky-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="size-4" />
                  <span>
                    Configure {activeRec.runs > 1 ? `${activeRec.runs} Runs × ` : ""}3.5C {activeRec.sizeLabel} in Cost Estimator →
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: IS STANDARD SIZING & AMPACITY REFERENCE MATRIX                     */}
        {/* ========================================================================= */}
        {activeTab === "chart" && (
          <div className="bg-white dark:bg-[#0e1726] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1d73b7] dark:text-sky-400 block mb-1">
                  IS: 7098 (PART 1/2) & IS: 694 STANDARD MATRIX
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-['Space_Grotesk']">
                  Quick Load to Cable Sizing Reference Chart
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  415V 3-Phase 50Hz standard Indian industrial continuous full load ampacity table.
                </p>
              </div>

              {/* Search in chart */}
              <div className="relative max-w-xs w-full">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Filter by kW, HP, or size..."
                  value={chartSearch}
                  onChange={(e) => setChartSearch(e.target.value)}
                  className="h-9 text-xs pl-8 rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-[11px] font-black text-slate-700 dark:text-slate-300">
                    <th className="p-3.5">Motor / Load (kW)</th>
                    <th className="p-3.5">Horsepower (HP)</th>
                    <th className="p-3.5">Full Load Amps (A)</th>
                    <th className="p-3.5">Rec. Copper Size</th>
                    <th className="p-3.5">Rec. Aluminium Size</th>
                    <th className="p-3.5">Max Dist (&lt;3% Drop)</th>
                    <th className="p-3.5">Rec. Breaker (MCB/MCCB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredReferenceTable.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-black text-slate-900 dark:text-white">
                        {row.kw} kW
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400 font-semibold">
                        {row.hp} HP
                      </td>
                      <td className="p-3.5 font-bold text-[#1d73b7] dark:text-sky-400">
                        {row.amps} A
                      </td>
                      <td className="p-3.5 font-bold text-amber-700 dark:text-amber-400">
                        {row.copper}
                      </td>
                      <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">
                        {row.alu}
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono">
                        {row.maxDist}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-700 dark:text-slate-300">
                          {row.breaker}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <UniversalFooter />
    </div>
  );
}
