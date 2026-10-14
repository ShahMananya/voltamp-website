import React, { useState, useMemo } from "react";
import { Calculator, Zap, ShieldCheck, ArrowRight, ShoppingCart, FileText, CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ContractorSizingEstimatorProps {
  onQuote: (category: string, product: string, details?: string) => void;
  onAddToCart: (item: {
    id: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    unit: string;
    quantity: number;
  }) => void;
  onOpenFullCalculator: () => void;
}

export default function ContractorSizingEstimator({
  onQuote,
  onAddToCart,
  onOpenFullCalculator,
}: ContractorSizingEstimatorProps) {
  const [application, setApplication] = useState<string>("lt-industrial");
  const [distance, setDistance] = useState<number>(150); // meters
  const [current, setCurrent] = useState<number>(125); // Amperes
  const [conductor, setConductor] = useState<"Aluminium" | "Copper">("Aluminium");

  // Approximate kW estimation for 3-phase 415V at 0.8 PF
  const approxKw = Math.round((Math.sqrt(3) * 415 * current * 0.8) / 1000);

  // Sizing matrix based on IS:7098 standards
  const calculation = useMemo(() => {
    let sizeStr = "";
    let ratePerMetre = 0;
    let resistancePerKm = 0; // Ohms/km

    if (conductor === "Aluminium") {
      if (current <= 35) {
        sizeStr = "4C x 6 sqmm Al XLPE Armoured";
        ratePerMetre = 72;
        resistancePerKm = 5.88;
      } else if (current <= 55) {
        sizeStr = "4C x 16 sqmm Al XLPE Armoured";
        ratePerMetre = 145;
        resistancePerKm = 2.21;
      } else if (current <= 80) {
        sizeStr = "4C x 25 sqmm Al XLPE Armoured";
        ratePerMetre = 198;
        resistancePerKm = 1.41;
      } else if (current <= 110) {
        sizeStr = "4C x 35 sqmm Al XLPE Armoured";
        ratePerMetre = 255;
        resistancePerKm = 1.01;
      } else if (current <= 150) {
        sizeStr = "3.5C x 50 sqmm Al XLPE Armoured";
        ratePerMetre = 330;
        resistancePerKm = 0.727;
      } else if (current <= 190) {
        sizeStr = "3.5C x 70 sqmm Al XLPE Armoured";
        ratePerMetre = 440;
        resistancePerKm = 0.518;
      } else if (current <= 230) {
        sizeStr = "3.5C x 95 sqmm Al XLPE Armoured";
        ratePerMetre = 540;
        resistancePerKm = 0.380;
      } else if (current <= 270) {
        sizeStr = "3.5C x 120 sqmm Al XLPE Armoured";
        ratePerMetre = 660;
        resistancePerKm = 0.301;
      } else if (current <= 320) {
        sizeStr = "3.5C x 150 sqmm Al XLPE Armoured";
        ratePerMetre = 780;
        resistancePerKm = 0.245;
      } else if (current <= 380) {
        sizeStr = "3.5C x 185 sqmm Al XLPE Armoured";
        ratePerMetre = 940;
        resistancePerKm = 0.201;
      } else if (current <= 450) {
        sizeStr = "3.5C x 240 sqmm Al XLPE Armoured";
        ratePerMetre = 1180;
        resistancePerKm = 0.153;
      } else if (current <= 520) {
        sizeStr = "3.5C x 300 sqmm Al XLPE Armoured";
        ratePerMetre = 1450;
        resistancePerKm = 0.125;
      } else {
        sizeStr = "3.5C x 400 sqmm Al XLPE Armoured";
        ratePerMetre = 1880;
        resistancePerKm = 0.098;
      }
    } else {
      // Copper
      if (current <= 35) {
        sizeStr = "4C x 4 sqmm Cu XLPE Armoured";
        ratePerMetre = 210;
        resistancePerKm = 4.61;
      } else if (current <= 55) {
        sizeStr = "4C x 10 sqmm Cu XLPE Armoured";
        ratePerMetre = 420;
        resistancePerKm = 1.83;
      } else if (current <= 85) {
        sizeStr = "4C x 16 sqmm Cu XLPE Armoured";
        ratePerMetre = 580;
        resistancePerKm = 1.15;
      } else if (current <= 120) {
        sizeStr = "4C x 25 sqmm Cu XLPE Armoured";
        ratePerMetre = 860;
        resistancePerKm = 0.727;
      } else if (current <= 160) {
        sizeStr = "4C x 35 sqmm Cu XLPE Armoured";
        ratePerMetre = 1180;
        resistancePerKm = 0.524;
      } else if (current <= 200) {
        sizeStr = "3.5C x 50 sqmm Cu XLPE Armoured";
        ratePerMetre = 1620;
        resistancePerKm = 0.387;
      } else if (current <= 250) {
        sizeStr = "3.5C x 70 sqmm Cu XLPE Armoured";
        ratePerMetre = 2240;
        resistancePerKm = 0.268;
      } else if (current <= 300) {
        sizeStr = "3.5C x 95 sqmm Cu XLPE Armoured";
        ratePerMetre = 2980;
        resistancePerKm = 0.193;
      } else if (current <= 360) {
        sizeStr = "3.5C x 120 sqmm Cu XLPE Armoured";
        ratePerMetre = 3720;
        resistancePerKm = 0.153;
      } else if (current <= 420) {
        sizeStr = "3.5C x 150 sqmm Cu XLPE Armoured";
        ratePerMetre = 4550;
        resistancePerKm = 0.124;
      } else {
        sizeStr = "3.5C x 185 sqmm Cu XLPE Armoured";
        ratePerMetre = 5600;
        resistancePerKm = 0.099;
      }
    }

    // Voltage Drop calculation: Vd = sqrt(3) * I * R * L / 1000
    const voltDrop = (Math.sqrt(3) * current * resistancePerKm * (distance / 1000));
    const voltDropPercent = Number(((voltDrop / 415) * 100).toFixed(2));
    const isCompliant = voltDropPercent <= 3.0;
    const totalEst = distance * ratePerMetre;

    return {
      size: sizeStr,
      rate: ratePerMetre,
      voltDropPercent,
      isCompliant,
      totalEst,
    };
  }, [conductor, current, distance]);

  const handleApplyToQuote = () => {
    const detailSummary = `Application: ${application}, Distance: ${distance}m, Load: ${current}A (~${approxKw} kW), Conductor: ${conductor}, Recommended: ${calculation.size}, Est. V-Drop: ${calculation.voltDropPercent}%`;
    onQuote("Wires & Cables", calculation.size, detailSummary);
  };

  const handleApplyToCart = () => {
    onAddToCart({
      id: `EST-${conductor.toLowerCase()}-${current}a-${distance}m`,
      sku: `VOL-EST-${conductor.slice(0, 2).toUpperCase()}-${current}`,
      name: `Volamp Certified ${calculation.size}`,
      category: "Wires & Cables",
      price: calculation.rate,
      unit: "per metre",
      quantity: distance,
    });
    toast.success(`Added ${distance} metres of ${calculation.size} to Cart!`);
  };

  return (
    <section className="py-14 sm:py-18 bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#ffffff] dark:from-[#07131e] dark:via-[#091a29] dark:to-[#061019] border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-0 right-10 -translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 translate-y-1/2 w-80 h-80 bg-blue-600/10 dark:bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="market-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Interactive Input Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-[#c56718] dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Calculator className="size-3.5" />
                <span>Live Contractor Engineering Tool</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b1f33] dark:text-white tracking-tight">
                Interactive Cable Sizing & Load Estimator
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                Test your feeder distance and electrical load in real-time. Instantly calculates IS:7098 compliant conductor sizing, voltage drop, and wholesale BOM budget.
              </p>
            </div>

            {/* Application selector buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                1. Select Installation Application
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "lt-industrial", label: "🏭 Industrial Feeder" },
                  { id: "commercial", label: "🏢 Building Main" },
                  { id: "solar-pv", label: "☀️ Solar String" },
                  { id: "pump-motor", label: "⚡ Motor / Pump" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setApplication(item.id)}
                    className={`p-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                      application === item.id
                        ? "bg-[#c56718] text-white shadow-xs"
                        : "bg-white dark:bg-[#0c2235] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#c56718]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 1: Distance */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2235] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  2. Feeder Cable Run Distance (Metres)
                </label>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  <strong className="text-sm font-black text-[#c56718] dark:text-amber-400">
                    {distance}
                  </strong>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">m</span>
                </div>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="w-full accent-[#c56718] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                <span>20m (Panel switchboard)</span>
                <span>250m (Plant run)</span>
                <span>500m (Long yard)</span>
              </div>
            </div>

            {/* Slider 2: Current / Load */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c2235] border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    3. Connected Current / Full Load Amps (FLA)
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Approx. connected power: <strong className="text-slate-700 dark:text-slate-300">{approxKw} kW</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  <strong className="text-sm font-black text-[#c56718] dark:text-amber-400">
                    {current}
                  </strong>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Amps</span>
                </div>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="5"
                value={current}
                onChange={(e) => setCurrent(Number(e.target.value))}
                className="w-full accent-[#c56718] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                <span>20A (Small motor)</span>
                <span>250A (Main MCC)</span>
                <span>500A (Transformer incomer)</span>
              </div>
            </div>

            {/* Conductor Material Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                4. Conductor Material
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConductor("Aluminium")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    conductor === "Aluminium"
                      ? "bg-amber-500/10 dark:bg-amber-400/10 border-[#c56718] dark:border-amber-400"
                      : "bg-white dark:bg-[#0c2235] border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div>
                    <strong className="block text-xs font-bold text-slate-900 dark:text-white">
                      Aluminium (EC Grade)
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Standard for plant LT & underground
                    </span>
                  </div>
                  {conductor === "Aluminium" && (
                    <CheckCircle2 className="size-4 text-[#c56718] dark:text-amber-400 shrink-0" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setConductor("Copper")}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    conductor === "Copper"
                      ? "bg-amber-500/10 dark:bg-amber-400/10 border-[#c56718] dark:border-amber-400"
                      : "bg-white dark:bg-[#0c2235] border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div>
                    <strong className="block text-xs font-bold text-slate-900 dark:text-white">
                      Electrolytic Copper
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      High conductivity, compact cross-section
                    </span>
                  </div>
                  {conductor === "Copper" && (
                    <CheckCircle2 className="size-4 text-[#c56718] dark:text-amber-400 shrink-0" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Calculation Results Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-white dark:bg-[#0c2235] p-6 sm:p-8 shadow-2xl border border-slate-200/90 dark:border-slate-700/80 backdrop-blur-xl">
              {/* Highlight ribbon */}
              <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-[#c56718] via-amber-400 to-[#c56718] rounded-t-3xl" />

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-amber-500/10 text-[#c56718] dark:text-amber-400 flex items-center justify-center font-bold">
                    <Zap className="size-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c56718] dark:text-amber-400 block">
                      IS:7098 Recommendation
                    </span>
                    <strong className="text-sm font-bold text-slate-900 dark:text-white">
                      Calculated Engineering Result
                    </strong>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    calculation.isCompliant
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}
                >
                  {calculation.isCompliant ? "Safe (< 3% Drop)" : "Review sizing"}
                </span>
              </div>

              {/* Highlighted Sizing Box */}
              <div className="my-5 p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Optimal Cable Specification
                </span>
                <strong className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white block">
                  {calculation.size}
                </strong>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cross-linked polyethylene insulated, galvanized flat strip armoured, 1.1kV grade heavy-duty feeder.
                </p>
              </div>

              {/* Technical Metrics Breakdown */}
              <div className="space-y-3 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Run Length</span>
                  <strong className="font-bold text-slate-800 dark:text-slate-200">{distance} Metres</strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Full Load Rating</span>
                  <strong className="font-bold text-slate-800 dark:text-slate-200">{current}A (~{approxKw} kW)</strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Calculated Voltage Drop</span>
                  <strong
                    className={`font-bold ${
                      calculation.isCompliant ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {calculation.voltDropPercent}% (Standard max 3%)
                  </strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Indicative Wholesale Rate</span>
                  <strong className="font-bold text-slate-800 dark:text-slate-200">₹{calculation.rate}/m</strong>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Estimated Total Cable Budget</span>
                  <strong className="text-base font-black text-[#c56718] dark:text-amber-400">
                    ₹{calculation.totalEst.toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              {/* Interactive Action CTAs */}
              <div className="mt-5 space-y-2.5">
                <Button
                  type="button"
                  onClick={handleApplyToQuote}
                  className="w-full bg-[#c56718] hover:bg-[#b45309] text-white font-bold text-xs sm:text-sm h-11 rounded-xl cursor-pointer shadow-md shadow-orange-600/20 gap-2"
                >
                  <FileText className="size-4" />
                  Request Project Quote with this Sizing
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyToCart}
                    className="flex-1 text-xs font-bold h-10 rounded-xl cursor-pointer gap-1.5"
                  >
                    <ShoppingCart className="size-3.5" />
                    Add to Cart ({distance}m)
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onOpenFullCalculator}
                    className="flex-1 text-xs font-bold h-10 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    Multi-Core Sizer →
                  </Button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>Certified Indian Standard test reports & MTC included with all consignments.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
