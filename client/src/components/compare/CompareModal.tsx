import React, { useState } from "react";
import {
  Scale,
  X,
  Trash2,
  ShoppingCart,
  FileText,
  Check,
  Info,
  ShieldCheck,
  Zap,
  Sliders,
} from "lucide-react";
import { useCompare, CompareProduct } from "@/contexts/CompareContext";
import { useCart } from "@/contexts/CartContext";
import { getProductImage, getCategoryFallbackImage } from "@/data/categories";
import { toast } from "sonner";

function parseSpecs(raw: any) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

interface SpecRowDef {
  label: string;
  categoryGroup?: string;
  getValue: (p: CompareProduct, specs: any) => string | React.ReactNode;
}

export function CompareModal() {
  const {
    isCompareOpen,
    closeCompare,
    compareItems,
    compareCategory,
    removeFromCompare,
    clearCompare,
  } = useCompare();

  const { addItem } = useCart();
  const [highlightDiffs, setHighlightDiffs] = useState(true);

  if (!isCompareOpen || compareItems.length === 0) return null;

  const handleAddToCart = (prod: CompareProduct) => {
    const prodImg = getProductImage(prod, prod.category);
    addItem({
      id: prod.productId,
      name: prod.name,
      category: prod.category,
      sku: prod.sku || prod.productId,
      detail: prod.size ? `Size: ${prod.size}` : prod.subcategory || undefined,
      price: prod.numericPrice || 0,
      unit: prod.unit ? prod.unit.replace("Per ", "") : "Unit",
      quantity: 1,
      image: prodImg,
    });
    toast.success("Added to Cart", {
      description: `${prod.name} added to your order.`,
    });
  };

  const handleRequestQuote = (prod: CompareProduct) => {
    window.dispatchEvent(
      new CustomEvent("volamp:open-enquire", {
        detail: {
          category: prod.category,
          product: `${prod.name} (SKU: ${prod.sku || prod.productId})`,
        },
      })
    );
  };

  // Determine row definitions based on active category
  const isCables = compareCategory === "Wires & Cables";
  const isSwitchgear = compareCategory === "Switchgear";
  const isLugs = compareCategory === "Lugs";

  const getRowDefinitions = (): SpecRowDef[] => {
    const baseRows: SpecRowDef[] = [
      {
        label: "Brand",
        getValue: (p) => p.brand || "VOLAMP",
      },
      {
        label: "Subcategory",
        getValue: (p) => p.subcategory || "-",
      },
      {
        label: "Availability / Stock",
        getValue: (p) => (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {p.availability || "In Stock"}
          </span>
        ),
      },
    ];

    if (isCables) {
      return [
        ...baseRows,
        {
          label: "Conductor Material",
          getValue: (p, s) => p.material || s.conductorMaterial || (/copper/i.test(p.name) ? "Copper" : /aluminium|aluminum/i.test(p.name) ? "Aluminium" : "-"),
        },
        {
          label: "Voltage Grade",
          getValue: (p, s) => s.voltageRating || (/1\.1\s*kv|1100v/i.test(p.name) ? "1.1 kV (1100V)" : /11\s*kv/i.test(p.name) ? "11 kV" : /33\s*kv/i.test(p.name) ? "33 kV" : "-"),
        },
        {
          label: "Number of Cores",
          getValue: (p, s) => s.cores || (/3\.5\s*core/i.test(p.name) ? "3.5 Core" : /1\s*core/i.test(p.name) ? "1 Core" : /2\s*core/i.test(p.name) ? "2 Core" : /3\s*core/i.test(p.name) ? "3 Core" : /4\s*core/i.test(p.name) ? "4 Core" : "-"),
        },
        {
          label: "Armour Type",
          getValue: (p, s) => s.typeOfArmour || (/unarmoured|unarmored/i.test(p.name) ? "Unarmoured" : /armoured|armored/i.test(p.name) ? "Armoured" : "-"),
        },
        {
          label: "Cross Section / Size",
          getValue: (p) => p.size || "-",
        },
        {
          label: "Insulation Material",
          getValue: (p, s) => s.insulationType || (/xlpe/i.test(p.name) ? "XLPE" : /pvc/i.test(p.name) ? "PVC" : "-"),
        },
        {
          label: "Conductor Construction",
          getValue: (p, s) => s.conductorConstruction || "-",
        },
        {
          label: "Current Rating (Amp)",
          getValue: (p, s) => s.currentRatingAmp ? `${s.currentRatingAmp} A` : "-",
        },
        {
          label: "Outer Sheath",
          getValue: (p, s) => s.outerSheathMaterial || "-",
        },
        {
          label: "Quality & Testing",
          getValue: () => "IS / IEC Certified + MTC Available",
        },
      ];
    }

    if (isSwitchgear) {
      return [
        ...baseRows,
        {
          label: "Poles / Phase",
          getValue: (p, s) => s.polesPhase || (/1p\b/i.test(p.name) ? "1P" : /2p\b/i.test(p.name) ? "2P" : /3p\b/i.test(p.name) ? "3P" : /4p\b/i.test(p.name) ? "4P" : "-"),
        },
        {
          label: "Rated Current",
          getValue: (p, s) => s.currentRatingA ? `${s.currentRatingA} A` : (/(\d+)\s*A\b/.exec(p.name)?.[0] || "-"),
        },
        {
          label: "Rated Voltage",
          getValue: (p, s) => s.voltageRatingV || (/415v/i.test(p.name) ? "415V AC" : /240v|230v/i.test(p.name) ? "240V AC" : "-"),
        },
        {
          label: "Breaking Capacity (kA)",
          getValue: (p, s) => s.breakingCapacityKa ? `${s.breakingCapacityKa} kA` : (/10ka/i.test(p.name) ? "10 kA" : /6ka/i.test(p.name) ? "6 kA" : "-"),
        },
        {
          label: "Trip Curve",
          getValue: (p, s) => s.tripCurve || (/c-curve|curve c/i.test(p.name) ? "C Curve" : /b-curve|curve b/i.test(p.name) ? "B Curve" : "-"),
        },
        {
          label: "Auxiliary Contacts",
          getValue: (p, s) => s.auxiliaryContacts || "-",
        },
        {
          label: "Frame Size",
          getValue: (p, s) => s.frameSize || "-",
        },
        {
          label: "Technical Standard",
          getValue: (p, s) => s.notesSpecifications || "IS/IEC 60898 / 60947",
        },
      ];
    }

    if (isLugs) {
      return [
        ...baseRows,
        {
          label: "Lug Material",
          getValue: (p, s) => p.material || s.material || (/copper/i.test(p.name) ? "Electrolytic Copper" : /aluminium|aluminum/i.test(p.name) ? "Aluminium" : "-"),
        },
        {
          label: "Lug Type",
          getValue: (p, s) => s.lugType || (/ring/i.test(p.name) ? "Ring Type" : /pin/i.test(p.name) ? "Pin Type" : /fork/i.test(p.name) ? "Fork Type" : /in-line|inline/i.test(p.name) ? "In-Line Connector" : "-"),
        },
        {
          label: "Barrel Style",
          getValue: (p, s) => s.barrelStyle || "Standard Heavy Duty",
        },
        {
          label: "Size Range",
          getValue: (p, s) => p.size || s.sizeRange || "All Sizes Available",
        },
        {
          label: "Manufacturing Standard",
          getValue: (p, s) => s.standard || "IS 8309 / DIN 46235",
        },
      ];
    }

    // Default for other categories (Solar, PVC Pipes, Glands, etc.)
    return [
      ...baseRows,
      {
        label: "Material",
        getValue: (p) => p.material || "-",
      },
      {
        label: "Size / Dimensions",
        getValue: (p) => p.size || "-",
      },
      {
        label: "Unit of Supply",
        getValue: (p) => p.unit || "Unit",
      },
    ];
  };

  const rows = getRowDefinitions();

  // Helper to check if a row differs across compared items
  const checkRowDiff = (rowDef: SpecRowDef): boolean => {
    if (compareItems.length <= 1) return false;
    const values = compareItems.map((p) => {
      const s = parseSpecs(p.specifications);
      const val = rowDef.getValue(p, s);
      return typeof val === "string" ? val : "";
    });
    return new Set(values).size > 1;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={closeCompare}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-[#1d73b7] text-white">
                <Scale className="size-4" />
              </span>
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Technical Specification Comparison
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-white">
                {compareCategory}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-['Space_Grotesk']">
              Comparing {compareItems.length} Products in {compareCategory}
            </h2>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Toggle Highlight Differences */}
            <button
              type="button"
              onClick={() => setHighlightDiffs(!highlightDiffs)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                highlightDiffs
                  ? "bg-[#1d73b7] text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Sliders className="size-3.5" />
              <span>{highlightDiffs ? "Highlight Differences ON" : "Highlight Differences"}</span>
            </button>

            <button
              type="button"
              onClick={clearCompare}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={closeCompare}
              className="size-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Comparison Table */}
        <div className="overflow-x-auto flex-1 p-6">
          <div className="min-w-[650px]">
            {/* Product Header Cards Row */}
            <div className="grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex flex-col justify-end text-xs font-bold text-slate-400 uppercase tracking-wider pb-2">
                Products
              </div>

              {compareItems.map((prod) => {
                const img = getProductImage(prod, prod.category);
                const priceFormatted =
                  prod.numericPrice && prod.numericPrice > 0
                    ? `₹${prod.numericPrice.toLocaleString("en-IN")}`
                    : prod.price || "Price on request";

                return (
                  <div
                    key={prod.productId}
                    className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col justify-between relative group"
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFromCompare(prod.productId)}
                      className="absolute top-2 right-2 size-6 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-rose-500 hover:text-white text-slate-500 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Remove product"
                    >
                      <X className="size-3.5" />
                    </button>

                    <div>
                      {/* Image */}
                      <div className="h-32 w-full bg-white dark:bg-slate-900 rounded-lg p-2 mb-3 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img
                          src={img}
                          alt={prod.name}
                          onError={(e) => {
                            e.currentTarget.src = getCategoryFallbackImage(prod.category);
                          }}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      {/* Brand */}
                      <span className="text-[11px] font-bold text-[#1d73b7] dark:text-sky-400 uppercase tracking-wider block mb-1">
                        {prod.brand || "VOLAMP"}
                      </span>

                      {/* Name */}
                      <h4
                        className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 min-h-[2rem]"
                        title={prod.name}
                      >
                        {prod.name}
                      </h4>

                      {/* SKU */}
                      <span className="text-[10px] text-slate-400 font-mono block mt-1">
                        SKU: {prod.sku || prod.productId}
                      </span>

                      {/* Price */}
                      <div className="mt-2 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                        {priceFormatted}
                        {prod.unit && (
                          <span className="text-[10px] font-normal text-slate-500 ml-1">
                            / {prod.unit.replace("Per ", "")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(prod)}
                        className="w-full py-1.5 rounded-lg bg-[#1d73b7] hover:bg-[#165a91] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <ShoppingCart className="size-3.5" />
                        <span>Add to Order</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRequestQuote(prod)}
                        className="w-full py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="size-3.5" />
                        <span>Request RFQ</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Specifications Comparison Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs mt-2">
              {rows.map((rowDef, idx) => {
                const isDiff = highlightDiffs && checkRowDiff(rowDef);

                return (
                  <div
                    key={rowDef.label}
                    className={`grid grid-cols-[180px_repeat(auto-fit,minmax(200px,1fr))] gap-4 py-3 items-center transition-colors ${
                      isDiff
                        ? "bg-amber-50/60 dark:bg-amber-950/20"
                        : idx % 2 === 0
                        ? "bg-slate-50/50 dark:bg-slate-800/30"
                        : "bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 pr-2">
                      {isDiff && (
                        <span className="size-1.5 rounded-full bg-amber-500 shrink-0" title="Values differ" />
                      )}
                      <span>{rowDef.label}</span>
                    </div>

                    {compareItems.map((prod) => {
                      const specs = parseSpecs(prod.specifications);
                      const val = rowDef.getValue(prod, specs);

                      return (
                        <div
                          key={`${prod.productId}-${rowDef.label}`}
                          className={`text-slate-800 dark:text-slate-200 px-2 ${
                            isDiff ? "font-semibold text-slate-900 dark:text-amber-200" : ""
                          }`}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/70 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>
              All compared products are verified against <strong>{compareCategory}</strong> Indian Standards (IS / IEC).
            </span>
          </div>
          <button
            type="button"
            onClick={closeCompare}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold transition-colors cursor-pointer"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
