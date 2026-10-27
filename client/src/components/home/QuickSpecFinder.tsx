import React, { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Cable, Zap, ShieldCheck, Factory, PlugZap, Search, ShoppingCart, ArrowRight, Check, Sparkles, Filter, RotateCcw, Plus, Minus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface SpecFinderProduct {
  id: string;
  sku: string;
  name: string;
  category: "Wires & Cables" | "Switchgear" | "Solar" | "Lugs & Glands" | "Earthing Material";
  conductor: "Copper" | "Aluminium" | "NA";
  voltage: "1.1kV" | "11kV" | "33kV" | "1500V" | "415V";
  cores: "1C" | "2C" | "3C" | "3.5C" | "4C" | "NA";
  price: number;
  unit: string;
  standards: string;
  stock: string;
  description: string;
  image?: string;
}

const SPEC_PRODUCTS: SpecFinderProduct[] = [
  {
    id: "CAB-000001",
    sku: "CAB-000001",
    name: "1.1kV XLPE Aluminium Armoured Cable (3.5C x 185 sqmm)",
    category: "Wires & Cables",
    conductor: "Aluminium",
    voltage: "1.1kV",
    cores: "3.5C",
    price: 685,
    unit: "metre",
    standards: "IS:7098 (Part 1)",
    stock: "2,400m in stock",
    description: "Heavy-duty cross-linked underground power feeder with galvanized steel flat strip armour.",
    image: "/products/cables.jpg?v=4",
  },
  {
    id: "CAB-000002",
    sku: "CAB-000002",
    name: "1.1kV Copper Armoured Power Cable (4C x 16 sqmm)",
    category: "Wires & Cables",
    conductor: "Copper",
    voltage: "1.1kV",
    cores: "4C",
    price: 520,
    unit: "metre",
    standards: "IS:7098 / IS:1554",
    stock: "1,800m in stock",
    description: "High-conductivity electrolytic copper conductors for critical commercial distribution.",
    image: "/products/cables.jpg?v=4",
  },
  {
    id: "CAB-000003",
    sku: "CAB-000003",
    name: "11kV HT XLPE 3-Core Aluminium Armoured Cable (3C x 95 sqmm)",
    category: "Wires & Cables",
    conductor: "Aluminium",
    voltage: "11kV",
    cores: "3C",
    price: 1240,
    unit: "metre",
    standards: "IS:7098 (Part 2)",
    stock: "1,150m in stock",
    description: "High tension screened underground power transmission cable for industrial substations.",
    image: "/products/cables.jpg?v=4",
  },
  {
    id: "SOL-000001",
    sku: "SOL-000001",
    name: "Solar DC Cable 1C x 4 sqmm (EN 50618 H1Z2Z2-K)",
    category: "Solar",
    conductor: "Copper",
    voltage: "1500V",
    cores: "1C",
    price: 76,
    unit: "metre",
    standards: "TUV / EN 50618",
    stock: "8,500m in stock",
    description: "Tinned copper flexible conductor, cross-linked halogen-free polyolefin UV & ozone resistant.",
    image: "/products/cables.jpg?v=4",
  },
  {
    id: "SOL-000002",
    sku: "SOL-000002",
    name: "Solar DC Cable 1C x 6 sqmm (1500V Dual Certified)",
    category: "Solar",
    conductor: "Copper",
    voltage: "1500V",
    cores: "1C",
    price: 104,
    unit: "metre",
    standards: "TUV / IEC 62930",
    stock: "6,200m in stock",
    description: "Heavy-duty outdoor string connection cable for utility and commercial rooftop solar.",
    image: "/products/cables.jpg?v=4",
  },
  {
    id: "CAB-000004",
    sku: "CAB-000004",
    name: "Flexible FRLS Single Core Building Wire (4 sqmm Cu)",
    category: "Wires & Cables",
    conductor: "Copper",
    voltage: "1.1kV",
    cores: "1C",
    price: 42,
    unit: "metre",
    standards: "IS:694 FRLS",
    stock: "15,000m in stock",
    description: "Flame Retardant Low Smoke electrolytic copper multi-strand building wire.",
    image: "/products/cables.jpg?v=4",
  },
  {
    id: "SWG-000001",
    sku: "SWG-000001",
    name: "10kA C-Curve Miniature Circuit Breaker (MCB) 4-Pole 63A",
    category: "Switchgear",
    conductor: "NA",
    voltage: "415V",
    cores: "NA",
    price: 890,
    unit: "piece",
    standards: "IS/IEC 60898-1",
    stock: "420 pcs in stock",
    description: "High breaking capacity DIN-rail mounting MCB with bi-connect terminals.",
    image: "/products/switchgear.jpg?v=3",
  },
  {
    id: "SWG-000002",
    sku: "SWG-000002",
    name: "Moulded Case Circuit Breaker (MCCB) 4P 250A 36kA",
    category: "Switchgear",
    conductor: "NA",
    voltage: "415V",
    cores: "NA",
    price: 6850,
    unit: "piece",
    standards: "IEC 60947-2",
    stock: "85 pcs in stock",
    description: "Adjustable thermal-magnetic release MCCB for LT distribution panels.",
    image: "/products/switchgear.jpg?v=3",
  },
  {
    id: "LUG-000001",
    sku: "LUG-000001",
    name: "Heavy Duty Copper Tubular Terminal Ends (Lugs) 185 sqmm",
    category: "Lugs & Glands",
    conductor: "Copper",
    voltage: "1.1kV",
    cores: "NA",
    price: 135,
    unit: "piece",
    standards: "IS:8309 / DIN 46235",
    stock: "1,200 pcs in stock",
    description: "Electrolytic tinned copper compression terminal with inspection hole.",
    image: "/products/cable-lugs.jpg?v=3",
  },
];

interface QuickSpecFinderProps {
  onAddToCart: (item: {
    id: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    unit: string;
    quantity: number;
  }) => void;
  onQuote: (category: string, product: string) => void;
}

export default function QuickSpecFinder({ onAddToCart, onQuote }: QuickSpecFinderProps) {
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedConductor, setSelectedConductor] = useState<string>("All");
  const [selectedVoltage, setSelectedVoltage] = useState<string>("All");
  const [selectedCores, setSelectedCores] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const categories = ["All", "Wires & Cables", "Switchgear", "Solar", "Lugs & Glands"];
  const conductors = ["All", "Copper", "Aluminium"];
  const voltages = ["All", "1.1kV", "11kV", "1500V", "415V"];
  const coresList = ["All", "1C", "2C", "3C", "3.5C", "4C"];

  const filteredProducts = useMemo(() => {
    return SPEC_PRODUCTS.filter((prod) => {
      if (selectedCategory !== "All" && prod.category !== selectedCategory) return false;
      if (selectedConductor !== "All" && prod.conductor !== selectedConductor) return false;
      if (selectedVoltage !== "All" && prod.voltage !== selectedVoltage) return false;
      if (selectedCores !== "All" && prod.cores !== selectedCores) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          prod.name.toLowerCase().includes(q) ||
          prod.sku.toLowerCase().includes(q) ||
          prod.standards.toLowerCase().includes(q) ||
          prod.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [selectedCategory, selectedConductor, selectedVoltage, selectedCores, searchQuery]);

  const handleQtyChange = (id: string, delta: number, baseStep: number) => {
    setQuantities((prev) => {
      const current = prev[id] || (baseStep === 1 ? 1 : 100);
      const updated = Math.max(baseStep, current + delta * baseStep);
      return { ...prev, [id]: updated };
    });
  };

  const getQty = (id: string, unit: string) => {
    if (quantities[id]) return quantities[id];
    return unit === "piece" ? 1 : 100;
  };

  const resetFilters = () => {
    setSelectedCategory("All");
    setSelectedConductor("All");
    setSelectedVoltage("All");
    setSelectedCores("All");
    setSearchQuery("");
  };

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-[#081523] border-b border-slate-200/80 dark:border-slate-800">
      <div className="market-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-[#c56718] dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="size-3.5" />
              <span>Interactive Spec & Sizing Finder</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b1f33] dark:text-white tracking-tight">
              Instant Power Spec & Sizing Quick Finder
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Filter by Voltage, Conductor, Core Configuration, and IS/IEC certification. Get instant contractor pricing and direct dispatch availability.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="text-xs font-semibold cursor-pointer gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Reset Filters
            </Button>
            <Button
              size="sm"
              onClick={() => onQuote("General", "Spec Finder Custom RFQ")}
              className="text-xs font-semibold bg-[#c56718] hover:bg-[#b45309] text-white cursor-pointer"
            >
              Direct Project RFQ <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Interactive Filter Control Panel */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-[#0c2235]/90 border border-slate-200/90 dark:border-slate-800 shadow-xs mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-slate-200/70 dark:border-slate-800/80 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? "bg-[#c56718] text-white shadow-xs"
                    : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-[#c56718]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sub-Filters: Conductor, Voltage, Cores & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-3.5 pt-1">
            {/* Conductor Chip Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Conductor
              </label>
              <div className="flex flex-wrap gap-1.5">
                {conductors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedConductor(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedConductor === c
                        ? "bg-[#0b1f33] dark:bg-amber-500 text-white dark:text-slate-950 font-bold"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Voltage Rating Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Voltage Rating
              </label>
              <div className="flex flex-wrap gap-1.5">
                {voltages.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVoltage(v)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedVoltage === v
                        ? "bg-[#0b1f33] dark:bg-amber-500 text-white dark:text-slate-950 font-bold"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Cores Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cores Configuration
              </label>
              <div className="flex flex-wrap gap-1.5">
                {coresList.map((cores) => (
                  <button
                    key={cores}
                    type="button"
                    onClick={() => setSelectedCores(cores)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCores === cores
                        ? "bg-[#0b1f33] dark:bg-amber-500 text-white dark:text-slate-950 font-bold"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {cores}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Keyword Filter Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Search SKU / Size / Spec
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 185 sqmm, Armoured..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#c56718]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((prod) => {
            const step = prod.unit === "piece" ? 1 : 100;
            const currentQty = getQty(prod.id, prod.unit);
            const estTotal = currentQty * prod.price;

            return (
              <div
                key={prod.id}
                className="group relative p-5 rounded-2xl bg-white dark:bg-[#0c2235] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-400/60 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-[#c56718] dark:text-amber-400 border border-amber-500/20">
                      {prod.standards}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {prod.stock}
                    </span>
                  </div>

                  {/* Real Product Photo Thumbnail */}
                  <div className="h-28 w-full flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 mb-2.5 overflow-hidden">
                    <img
                      src={prod.image || "/products/cables.jpg"}
                      alt={prod.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/products/cables.jpg";
                      }}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title & SKU */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#c56718] dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                    <Link href={`/product/${prod.sku}`}>{prod.name}</Link>
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>SKU: {prod.sku}</span>
                    <span>•</span>
                    <span>{prod.category}</span>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                    {prod.description}
                  </p>

                  {/* Spec Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {prod.conductor !== "NA" && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {prod.conductor} Conductor
                      </span>
                    )}
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {prod.voltage}
                    </span>
                    {prod.cores !== "NA" && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {prod.cores}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price & Interactive Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Wholesale Rate
                      </span>
                      <div className="flex items-baseline gap-1">
                        <strong className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{prod.price.toLocaleString("en-IN")}
                        </strong>
                        <span className="text-xs text-slate-500 dark:text-slate-400">/{prod.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                        Est. for {currentQty} {prod.unit}s
                      </span>
                      <span className="text-xs font-bold text-[#c56718] dark:text-amber-400 font-mono">
                        ₹{estTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Add To Cart Button */}
                  <div className="flex items-center gap-2 mb-2">
                    {/* Stepper */}
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/60 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(prod.id, -1, step)}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                        title={`Decrease by ${step}`}
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-12 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {currentQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(prod.id, 1, step)}
                        className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                        title={`Increase by ${step}`}
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    {/* Add to Cart */}
                    <Button
                      type="button"
                      onClick={() => {
                        onAddToCart({
                          id: prod.id,
                          sku: prod.sku,
                          name: prod.name,
                          category: prod.category,
                          price: prod.price,
                          unit: `per ${prod.unit}`,
                          quantity: currentQty,
                        });
                        toast.success(`Added ${currentQty} ${prod.unit}s to Cart!`, {
                          description: prod.name,
                        });
                      }}
                      className="flex-1 bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold h-9 rounded-xl cursor-pointer shadow-xs gap-1.5"
                    >
                      <ShoppingCart className="size-3.5" />
                      Add to Cart
                    </Button>
                  </div>

                  {/* Quick RFQ link & Product Detail link */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 dark:text-slate-400">
                    <button
                      type="button"
                      onClick={() => onQuote(prod.category, prod.name)}
                      className="font-bold text-[#c56718] dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="size-3" /> Project RFQ
                    </button>
                    <Link
                      href={`/product/${prod.sku}`}
                      className="hover:text-slate-900 dark:hover:text-white hover:underline cursor-pointer flex items-center gap-1"
                    >
                      View Full Specs <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700">
            <Filter className="size-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No matching specifications found
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-4">
              We supply over 3,385+ items across LT/HT, Solar, and Switchgear. Our technical supply desk can quote custom conductor sizes, drum lengths, and armored variants.
            </p>
            <div className="flex justify-center gap-3">
              <Button size="sm" variant="outline" onClick={resetFilters} className="text-xs cursor-pointer">
                Reset Filters
              </Button>
              <Button
                size="sm"
                onClick={() => onQuote("General", `Custom Spec: ${searchQuery}`)}
                className="text-xs bg-[#c56718] hover:bg-[#b45309] text-white cursor-pointer"
              >
                Inquire with Supply Desk
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
