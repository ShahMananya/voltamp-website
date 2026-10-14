import React, { useState } from "react";
import { useLocation } from "wouter";
import { Cable, Zap, ShieldCheck, Factory, PlugZap, ShoppingCart, ArrowRight, Plus, Minus, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShowcaseItem {
  id: string;
  sku: string;
  name: string;
  tab: "popular" | "cables" | "solar" | "switchgear";
  spec: string;
  price: number;
  unit: string;
  originalPrice: number;
  discount: string;
  badge: string;
  delivery: string;
  image: string;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "CAB-ARM-4C185",
    sku: "CAB-000001",
    name: "1.1kV XLPE Aluminium Armoured Cable (3.5C x 185 sqmm)",
    tab: "popular",
    spec: "Grade EC Aluminium, Galvanized Steel Flat Strip Armour, IS:7098 (Part 1)",
    price: 685,
    originalPrice: 1140,
    discount: "40% OFF",
    unit: "per metre",
    badge: "B2B Fast-Mover",
    delivery: "Ready for 24h dispatch",
    image: "/products/cables.jpg?v=4",
  },
  {
    id: "SOL-DC-1C4",
    sku: "SOL-000001",
    name: "Solar DC Cable 1C x 4 sqmm (H1Z2Z2-K / EN 50618)",
    tab: "solar",
    spec: "Tinned Electrolytic Copper, Cross-linked Halogen-Free Flame Retardant",
    price: 76,
    originalPrice: 125,
    discount: "39% OFF",
    unit: "per metre",
    badge: "TUV Certified",
    delivery: "Ready for 24h dispatch",
    image: "/products/solar-panel.jpg?v=3",
  },
  {
    id: "SWG-MCB-63A",
    sku: "SWG-000001",
    name: "10kA C-Curve Miniature Circuit Breaker (MCB) 4-Pole 63A",
    tab: "switchgear",
    spec: "IS/IEC 60898-1 Certified, Bi-connect Terminals, 415V AC Rating",
    price: 890,
    originalPrice: 1480,
    discount: "40% OFF",
    unit: "per piece",
    badge: "IS/IEC 60898",
    delivery: "Same-Day Dispatch",
    image: "/products/switchgear.jpg?v=3",
  },
  {
    id: "CAB-CU-4C16",
    sku: "CAB-000002",
    name: "1.1kV Copper Armoured Power Cable (4C x 16 sqmm)",
    tab: "cables",
    spec: "100% Electrolytic Copper Conductor, Heavy-Duty Extruded PVC Sheath",
    price: 520,
    originalPrice: 865,
    discount: "40% OFF",
    unit: "per metre",
    badge: "100% Electrolytic Cu",
    delivery: "Ready for 24h dispatch",
    image: "/products/cables.jpg?v=4",
  },
  {
    id: "CAB-HT-3C95",
    sku: "CAB-000003",
    name: "11kV HT XLPE Aluminium Armoured Cable (3C x 95 sqmm)",
    tab: "cables",
    spec: "Triple Extruded Dry Cured XLPE, Screened Semi-Conducting Layer, IS:7098-II",
    price: 1240,
    originalPrice: 2060,
    discount: "40% OFF",
    unit: "per metre",
    badge: "Substation Grade",
    delivery: "Direct Factory Drum",
    image: "/products/cables.jpg?v=4",
  },
  {
    id: "SOL-DC-1C6",
    sku: "SOL-000002",
    name: "Solar DC Cable 1C x 6 sqmm (1500V Heavy Duty)",
    tab: "solar",
    spec: "Dual Certified IEC 62930 & EN 50618, UV Resistant, Rooftop & Ground-Mount",
    price: 104,
    originalPrice: 172,
    discount: "40% OFF",
    unit: "per metre",
    badge: "1500V DC Rated",
    delivery: "Ready for 24h dispatch",
    image: "/products/solar-panel.jpg?v=3",
  },
  {
    id: "SWG-MCCB-250A",
    sku: "SWG-000002",
    name: "Moulded Case Circuit Breaker (MCCB) 4P 250A 36kA",
    tab: "switchgear",
    spec: "IEC 60947-2 Certified, Adjustable Thermal Magnetic Trip Unit",
    price: 6850,
    originalPrice: 11400,
    discount: "40% OFF",
    unit: "per piece",
    badge: "Heavy Distribution",
    delivery: "Ready for dispatch",
    image: "/products/switchgear.jpg?v=3",
  },
  {
    id: "CAB-FRLS-4SQ",
    sku: "CAB-000004",
    name: "Flexible FRLS Single Core Building Wire (4 sqmm Cu)",
    tab: "popular",
    spec: "Flame Retardant Low Smoke, 100% Pure Copper Multi-Strand Wire, IS:694",
    price: 42,
    originalPrice: 70,
    discount: "40% OFF",
    unit: "per metre",
    badge: "IS:694 Certified",
    delivery: "90m & 180m Coils",
    image: "/products/cables.jpg?v=4",
  },
];

interface FastMovingShowcaseProps {
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

export default function FastMovingShowcase({ onAddToCart, onQuote }: FastMovingShowcaseProps) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"popular" | "cables" | "solar" | "switchgear">("popular");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const filtered = SHOWCASE_ITEMS.filter((item) => {
    if (activeTab === "popular") return true;
    return item.tab === activeTab;
  });

  const getQty = (id: string, unit: string) => {
    if (quantities[id]) return quantities[id];
    return unit.includes("piece") ? 1 : 100;
  };

  const handleQtyChange = (id: string, delta: number, step: number) => {
    setQuantities((prev) => {
      const cur = prev[id] || step;
      return { ...prev, [id]: Math.max(step, cur + delta * step) };
    });
  };

  return (
    <section className="py-14 sm:py-18 bg-white dark:bg-[#081523] border-b border-slate-200/80 dark:border-slate-800">
      <div className="market-container">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-[#c56718] dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="size-3.5" />
              <span>Fast-Moving Project Essentials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b1f33] dark:text-white tracking-tight">
              Contractor High-Demand Catalog
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Pre-negotiated wholesale rates for EPC contractors and commercial projects with immediate warehouse dispatch.
            </p>
          </div>

          {/* Interactive Category Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#0c2235] border border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
            {[
              { id: "popular", label: "🔥 All Essentials" },
              { id: "cables", label: "⚡ Power Cables" },
              { id: "solar", label: "☀️ Solar PV" },
              { id: "switchgear", label: "🛡️ Switchgear" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-800 text-[#c56718] dark:text-amber-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4.5">
          {filtered.map((item) => {
            const isPiece = item.unit.includes("piece");
            const step = isPiece ? 1 : 100;
            const currentQty = getQty(item.id, item.unit);

            return (
              <div
                key={item.id}
                className="group relative p-4.5 rounded-2xl bg-white dark:bg-[#0c2235] border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-amber-400/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1 mb-2.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-[#c56718] dark:text-amber-400 border border-amber-500/20">
                      {item.badge}
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      {item.discount}
                    </span>
                  </div>

                  {/* Real Product Photo Thumbnail */}
                  <div className="h-28 w-full flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 mb-2.5 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/products/cables.jpg";
                      }}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title & SKU */}
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#c56718] dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 block mt-0.5">
                    SKU: {item.sku}
                  </span>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                    {item.spec}
                  </p>

                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{item.delivery}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {/* Price */}
                  <div className="flex items-baseline justify-between mb-2.5">
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 line-through mr-1.5">
                        ₹{item.originalPrice}
                      </span>
                      <strong className="text-base font-black text-slate-900 dark:text-white">
                        ₹{item.price}
                      </strong>
                      <span className="text-xs text-slate-500 dark:text-slate-400">/{isPiece ? "pc" : "m"}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[#c56718] dark:text-amber-400 font-mono">
                      ₹{(currentQty * item.price).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Quantity and Add to Cart */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/60 p-0.5">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, -1, step)}
                        className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                        {currentQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.id, 1, step)}
                        className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        onAddToCart({
                          id: item.id,
                          sku: item.sku,
                          name: item.name,
                          category: item.tab === "solar" ? "Solar" : item.tab === "switchgear" ? "Switchgear" : "Wires & Cables",
                          price: item.price,
                          unit: item.unit,
                          quantity: currentQty,
                        });
                        toast.success(`Added ${currentQty} to Cart!`, { description: item.name });
                      }}
                      className="flex-1 bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold h-8 rounded-lg cursor-pointer"
                    >
                      <ShoppingCart className="size-3 mr-1" /> Add
                    </Button>
                  </div>

                  {/* Bottom links */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <button
                      type="button"
                      onClick={() => onQuote(item.tab === "solar" ? "Solar" : "Wires & Cables", item.name)}
                      className="font-bold text-[#c56718] dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      BOM RFQ
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/product/${item.sku}`)}
                      className="hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      Details <ArrowRight className="size-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
