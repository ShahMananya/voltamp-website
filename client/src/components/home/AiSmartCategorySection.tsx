import React, { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Sparkles,
  Search,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cable,
  Wrench,
  Layers,
  PlugZap,
  SunMedium,
  Cpu,
  Info,
  Maximize2,
  X,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Check,
  PackageCheck,
  Flame,
  Gauge,
  Factory,
  Radio,
  Sliders,
  ExternalLink
} from "lucide-react";
import { CATEGORIES, type Category } from "@/data/categories";
import { Button } from "@/components/ui/button";

interface ProjectPreset {
  id: string;
  name: string;
  icon: string;
  query: string;
  description: string;
  matchedCategoryIds: string[];
  suggestedPackage: {
    title: string;
    items: string[];
    specs: string;
    standards: string[];
  };
}

const PROJECT_PRESETS: ProjectPreset[] = [
  {
    id: "solar-utility",
    name: "500kW Utility Solar Farm",
    icon: "☀️",
    query: "solar farm cabling with inverter feeds, glands & earthing",
    description: "Complete PV array DC strings, combiner boxes, inverter AC feeds & earth lattice.",
    matchedCategoryIds: ["solar", "wire-cables", "glands", "earthing-material"],
    suggestedPackage: {
      title: "Utility Solar Array Package",
      items: [
        "1C x 4/6 sqmm Solar DC Cable (H1Z2Z2-K UV Resistant)",
        "3.5C x 185 sqmm Aluminium XLPE Armoured Inverter Feeder",
        "Nickel Plated Brass Double Compression Weatherproof Glands (IP68)",
        "Pure Copper Bonded Earth Rods & Chemical Backfill Compound",
      ],
      specs: "1500V DC rated · UV & Ozone Resistant · TUV / IS 17082 Certified",
      standards: ["IS 17082", "EN 50618", "IEC 60502-1", "IEEE 80"],
    },
  },
  {
    id: "factory-panel",
    name: "400A Industrial Substation Panel",
    icon: "🏭",
    query: "400A main LT distribution panel switchgear with armoured feeder",
    description: "Main incomer MCCBs, motor contactors, copper busbars & heavy feed cables.",
    matchedCategoryIds: ["switch-gears", "wire-cables", "lugs", "glands"],
    suggestedPackage: {
      title: "Heavy LT Switchgear Feeder Package",
      items: [
        "4-Pole 400A 50kA Microprocessor ETU MCCB Incomer",
        "3.5C x 300 sqmm Aluminium XLPE Armoured Cable (A2XWY)",
        "Heavy-Duty Pure Copper Tubular Compression Lugs (DIN 46235)",
        "Flameproof & Weatherproof Brass Double Compression Cable Glands",
      ],
      specs: "50kA Breaking Capacity · 99.97% ETP Copper · IS 13947-2 Certified",
      standards: ["IS/IEC 60947-2", "IS 7098 Pt 1", "DIN 46235", "BS 6121"],
    },
  },
  {
    id: "commercial-frls",
    name: "Commercial Building FRLS & DB",
    icon: "🏢",
    query: "high-rise commercial building FRLS copper wiring and conduits",
    description: "Flame Retardant Low Smoke copper wiring, modular DBs, and rigid conduits.",
    matchedCategoryIds: ["wire-cables", "conduit", "switch-gears", "wiring-device"],
    suggestedPackage: {
      title: "Commercial Fire-Safe Infrastructure Package",
      items: [
        "Single Core Flexible FRLS Copper Building Wires (1.5 to 10 sqmm)",
        "Heavy Mechanical Stress (HMS) ISI Rigid PVC Conduits",
        "10kA C-Curve Modular MCBs & 30mA RCCB Shock Protection",
        "Industrial Weatherproof Modular Switches & Socket Assemblies",
      ],
      specs: "Zero Toxic Halogen · Self-Extinguishing · IS 694 / IS 9537 Compliant",
      standards: ["IS 694", "IS 9537 Pt 3", "IS/IEC 60898-1", "RoHS"],
    },
  },
  {
    id: "borewell-pump",
    name: "Submersible Pump & Borewell",
    icon: "💧",
    query: "3-core flat submersible cable with motor starter and earthing",
    description: "Deep-well submersible continuous duty cable with dedicated motor starter.",
    matchedCategoryIds: ["wire-cables", "switch-gears", "earthing-material"],
    suggestedPackage: {
      title: "Submersible Borewell Power Package",
      items: [
        "3-Core Flat Flexible Submersible PVC Power Cable (3 x 4 / 6 sqmm)",
        "Direct-On-Line (DOL) Submersible Motor Control Panel",
        "GI Pipe-in-Pipe Maintenance Free Earthing Electrode",
      ],
      specs: "Continuous Water Submersion · Abrasion Resistant · IS 694 Certified",
      standards: ["IS 694", "IS 13947-4", "IS 3043"],
    },
  },
];

interface CategoryAnatomy {
  categoryId: string;
  headline: string;
  highResImage: string;
  badge: string;
  hotspots: {
    id: string;
    title: string;
    label: string;
    spec: string;
    x: number; // percentage
    y: number; // percentage
  }[];
  specGrid: { label: string; value: string }[];
  companionCategoryIds: string[];
  simulationOptions?: {
    powerKW: number;
    currentAmps: number;
    recommendedCable: string;
    recommendedBreaker: string;
    recommendedLug: string;
    recommendedGland: string;
  }[];
}

const CATEGORY_ANATOMY_DATA: Record<string, CategoryAnatomy> = {
  "wire-cables": {
    categoryId: "wire-cables",
    headline: "1.1kV XLPE Multi-Core Heavy Armoured Industrial Power Cable",
    badge: "DIV-01 · IS 7098 PT 1 / IEC 60502-1",
    highResImage: "/products/cable-cross-section.jpg",
    hotspots: [
      { id: "h1", title: "Conductor Core", label: "99.97% ETP Annealed Copper / Grade H4 Aluminium", spec: "IS 8130 Class 2 Stranded", x: 48, y: 52 },
      { id: "h2", title: "Primary Insulation", label: "Cross-Linked Polyethylene (XLPE)", spec: "Continuous 90°C · 250°C Short-Circuit", x: 38, y: 38 },
      { id: "h3", title: "Inner Sheathing", label: "Extruded Thermoplastic Compound", spec: "Moisture & Vapour Resistant Barrier", x: 62, y: 35 },
      { id: "h4", title: "Armour Layer", label: "Galvanized Steel Strip / Wire (GSFA/GSWA)", spec: "High Tensile Mechanical Crush Protection", x: 74, y: 48 },
      { id: "h5", title: "Outer Jacket", label: "Heavy Duty FRLS Anti-Rodent / UV Compound", spec: "Zero Toxic Gas · Oxygen Index > 29%", x: 86, y: 62 },
    ],
    specGrid: [
      { label: "Governing Standard", value: "IS 7098 (Part 1) / IEC 60502-1" },
      { label: "Voltage Grade", value: "650V / 1100V (LT) up to 33kV (HT)" },
      { label: "Conductor Purity", value: "99.97% Electrolytic Copper" },
      { label: "Dielectric Strength", value: "3.5 kV for 5 minutes" },
      { label: "Stock Availability", value: "12,500+ Mtrs Ready in Ahmedabad" },
    ],
    companionCategoryIds: ["lugs", "glands", "switch-gears", "conduit"],
    simulationOptions: [
      { powerKW: 15, currentAmps: 27, recommendedCable: "3.5C x 16 sqmm Al XLPE", recommendedBreaker: "40A 3P MCB", recommendedLug: "16 sqmm Pin/Ring Lug", recommendedGland: "MD-20 Brass Gland" },
      { powerKW: 45, currentAmps: 81, recommendedCable: "3.5C x 70 sqmm Al XLPE", recommendedBreaker: "125A 36kA MCCB", recommendedLug: "70 sqmm DIN Tubular Lug", recommendedGland: "MD-32 Brass Gland" },
      { powerKW: 110, currentAmps: 196, recommendedCable: "3.5C x 185 sqmm Al XLPE", recommendedBreaker: "315A 50kA MCCB", recommendedLug: "185 sqmm Heavy Palm Lug", recommendedGland: "MD-50 Double Comp Gland" },
      { powerKW: 200, currentAmps: 356, recommendedCable: "3.5C x 300 sqmm Al XLPE", recommendedBreaker: "400A 70kA ETU MCCB", recommendedLug: "300 sqmm Heavy Duty Lug", recommendedGland: "MD-63 Flameproof Gland" },
    ],
  },
  "switch-gears": {
    categoryId: "switch-gears",
    headline: "Industrial 4-Pole Moulded Case Circuit Breaker (MCCB) & Contactors",
    badge: "DIV-02 · IS/IEC 60947-2 / IS 13947",
    highResImage: "/products/mcc-panel-real.jpg",
    hotspots: [
      { id: "h1", title: "Microprocessor ETU", label: "Adjustable Overload & Short Circuit Release", spec: "0.4 to 1.0 x In True RMS Sensing", x: 50, y: 40 },
      { id: "h2", title: "Arc Chute Chamber", label: "Magnetic De-ion Arc Quenching Grids", spec: "Extinguishes high fault currents < 10ms", x: 35, y: 50 },
      { id: "h3", title: "Silver-Alloy Contacts", label: "High Endurance Solid Silver-Nickel Alloy", spec: "10,000+ Mechanical Cycles at Rated Load", x: 65, y: 55 },
      { id: "h4", title: "Heavy Copper Terminals", label: "Tin-Plated High Conductivity Bus Connection", spec: "Torque-Rated M10/M12 Hex Bolts", x: 50, y: 75 },
    ],
    specGrid: [
      { label: "Governing Standard", value: "IS/IEC 60947-2 & IS 13947" },
      { label: "Current Range", value: "16A to 1250A Frame Sizes" },
      { label: "Breaking Capacity", value: "36kA / 50kA / 70kA @ 415V AC" },
      { label: "Poles Available", value: "3-Pole (3P) & 4-Pole (4P)" },
      { label: "Stock Availability", value: "220+ Units Factory Tested" },
    ],
    companionCategoryIds: ["wire-cables", "lugs", "glands"],
  },
  "lugs": {
    categoryId: "lugs",
    headline: "Pure Electrolytic Copper Heavy-Duty Tubular Terminal Lugs",
    badge: "DIV-03 · DIN 46235 / BS 6121",
    highResImage: "/products/cable-lugs-macro.jpg",
    hotspots: [
      { id: "h1", title: "Bell Mouth Entry", label: "Smooth Chamfered Cable Entry", spec: "Prevents conductor strand shearing during insertion", x: 30, y: 70 },
      { id: "h2", title: "Electro-Tinned Finish", label: "Pure Matte Tin Plating (> 10 Microns)", spec: "Prevents galvanic corrosion & oxidation", x: 50, y: 50 },
      { id: "h3", title: "Inspection Sight Hole", label: "Visual Insertion Verification Port", spec: "Ensures 100% full conductor barrel penetration", x: 60, y: 38 },
      { id: "h4", title: "Forged Palm", label: "Heavy Duty Flat Mounting Pad", spec: "Seamless Contact Area for M6 to M20 Studs", x: 75, y: 25 },
    ],
    specGrid: [
      { label: "Governing Standard", value: "DIN 46235 / BS 6121 / IS 8337" },
      { label: "Raw Material", value: "99.97% ETP Copper (CW024A)" },
      { label: "Cross-Section Range", value: "1.5 sqmm to 1000 sqmm" },
      { label: "Max Crimp Pressure", value: "Up to 120 kN Hexagonal Die" },
      { label: "Stock Availability", value: "18,400+ Units Ready for Packing" },
    ],
    companionCategoryIds: ["wire-cables", "glands"],
  },
  "conduit": {
    categoryId: "conduit",
    headline: "Heavy Mechanical Stress (HMS) ISI Rigid PVC Electrical Conduits",
    badge: "DIV-04 · IS 9537 PT 3 (ISI Marked)",
    highResImage: "/products/pvc-pipe.jpg?v=3",
    hotspots: [
      { id: "h1", title: "Impact-Modified PVC", label: "High Compressive Strength Virgin Resin", spec: "Withstands slab casting & mechanical crushing", x: 45, y: 40 },
      { id: "h2", title: "Smooth Inner Bore", label: "Ultra-Low Friction Internal Wall", spec: "Enables fast multi-core cable pulling without jacket wear", x: 60, y: 55 },
      { id: "h3", title: "Flame Retardant Matrix", label: "Self-Extinguishing Fire Retardant", spec: "UL94 V-0 Flammability Rating", x: 35, y: 65 },
    ],
    specGrid: [
      { label: "Governing Standard", value: "IS 9537 (Part 3) with ISI Mark" },
      { label: "Stress Grade", value: "HMS (Heavy) / MMS (Medium) / LMS (Light)" },
      { label: "Nominal Diameters", value: "19mm, 20mm, 25mm, 32mm, 40mm, 50mm" },
      { label: "Temperature Rating", value: "-5°C to +60°C Operating Range" },
      { label: "Stock Availability", value: "8,500+ Pipes In-Warehouse" },
    ],
    companionCategoryIds: ["wire-cables", "wiring-device"],
  },
  "glands": {
    categoryId: "glands",
    headline: "Flameproof & Weatherproof Brass Double Compression Cable Glands",
    badge: "DIV-05 · BS 6121 / EN 62444 / IP68",
    highResImage: "/products/gland-exploded.jpg",
    hotspots: [
      { id: "h1", title: "Entry Body & Thread", label: "Naval Brass CZ121 / Nickel-Plated", spec: "Metric (M20-M100) or NPT/ET Thread Options", x: 25, y: 50 },
      { id: "h2", title: "Inner Sealing Ring", label: "High-Grade Nitrile / Neoprene Ring", spec: "Gas-tight inner sheath seal (IP66/IP68)", x: 45, y: 50 },
      { id: "h3", title: "Armor Clamping Cone", label: "Two-Part Precision Armor Grip Ring", spec: "Provides 360° earth continuity & mechanical pull-out lock", x: 65, y: 50 },
      { id: "h4", title: "Outer Compression Seal", label: "Outer Weatherproof Environmental Jacket Seal", spec: "Protects against jetting water, oils & harsh dust", x: 82, y: 50 },
    ],
    specGrid: [
      { label: "Governing Standard", value: "BS 6121 / EN 62444 / IS/IEC 60079-1" },
      { label: "Ingress Protection", value: "IP66 & IP68 (Tested to 10m head)" },
      { label: "Flameproof Rating", value: "Zone 1, Zone 2 Gas Groups IIC/IIB" },
      { label: "Operating Temp", value: "-40°C to +110°C Continuous" },
      { label: "Stock Availability", value: "4,600+ Sets Packed & Ready" },
    ],
    companionCategoryIds: ["wire-cables", "lugs", "switch-gears"],
  },
  "wiring-device": {
    categoryId: "wiring-device",
    headline: "Industrial Heavy Duty Wiring Accessories & Interlocked Outlets",
    badge: "DIV-06 · IS 1293 / IEC 60309-1",
    highResImage: "/products/wiring-devices.jpg?v=4",
    hotspots: [
      { id: "h1", title: "Polycarbonate Housing", label: "UV-Stabilized High Impact Polycarbonate", spec: "IK08 Impact Resistance · Zero Discoloration", x: 45, y: 40 },
      { id: "h2", title: "Interlocked Safety Switch", label: "Mechanical Plug Interlock Mechanism", spec: "Cannot energize until plug is fully seated", x: 60, y: 60 },
      { id: "h3", title: "Brass Terminal Inserts", label: "Nickel-Plated Phosphor Bronze Receptacles", spec: "High Contact Spring Force & Low Thermal Rise", x: 35, y: 70 },
    ],
    specGrid: [
      { label: "Governing Standard", value: "IS 1293 / IEC 60309-1 / IEC 60669" },
      { label: "Current Ratings", value: "16A, 32A, 63A, 125A 3P+N+E" },
      { label: "Ingress Protection", value: "IP44 / IP54 / IP67 Water Sealed" },
      { label: "Voltage Ratings", value: "230V Single Phase / 415V Three Phase" },
      { label: "Stock Availability", value: "1,200+ Assemblies In-Stock" },
    ],
    companionCategoryIds: ["conduit", "wire-cables"],
  },
  "earthing-material": {
    categoryId: "earthing-material",
    headline: "Pure Copper-Bonded Steel Earth Rods & Chemical Electrodes",
    badge: "DIV-07 · IS 3043 / IEEE 80 / UL 467",
    highResImage: "/products/earthing-rods.png?v=3",
    hotspots: [
      { id: "h1", title: "Copper Bonding Layer", label: "99.9% Electrolytic Copper Electro-Plated (> 250 Microns)", spec: "Molecular bond prevents peeling or corrosion", x: 50, y: 35 },
      { id: "h2", title: "High-Tensile Steel Core", label: "Cold Drawn Grade 1018 Steel Core", spec: "High driving strength into dense rocky terrain", x: 50, y: 55 },
      { id: "h3", title: "Chamfered / Threaded Ends", label: "Precision Rolled Unified Threads", spec: "Enables multiple rod couplings for deep earth wells", x: 50, y: 80 },
    ],
    specGrid: [
      { label: "Governing Standard", value: "IS 3043 / IEEE 80 / UL 467" },
      { label: "Copper Coating Thickness", value: "254 Microns (Tested with Magnetic Gauge)" },
      { label: "Electrode Diameters", value: "14.2mm, 17.2mm, 25mm, 40mm, 50mm" },
      { label: "Earth Fault Current", value: "Up to 40kA for 1.0 second withstand" },
      { label: "Stock Availability", value: "1,800+ Rods & 15 Tons Compound Ready" },
    ],
    companionCategoryIds: ["wire-cables", "solar", "switch-gears"],
  },
  "solar": {
    categoryId: "solar",
    headline: "Solar DC Photovoltaic Cables (1500V DC) & Solar Array Hardware",
    badge: "DIV-08 · IS 17082 / EN 50618 (H1Z2Z2-K)",
    highResImage: "/products/solar-panel.jpg?v=3",
    hotspots: [
      { id: "h1", title: "Tinned Copper Conductor", label: "Class 5 Fine Stranded Tinned Copper", spec: "Zero oxidation in high-humidity solar fields", x: 45, y: 45 },
      { id: "h2", title: "Crosslinked Polyolefin (XLPO)", label: "Halogen-Free Dual Insulation Layer", spec: "Thermal endurance up to 120°C for 20,000 hrs", x: 55, y: 55 },
      { id: "h3", title: "UV & Ozone Resistant Jacket", label: "Black UV-Protected Outer Sheath", spec: "25-Year Outdoor Direct Sunlight Service Life", x: 65, y: 65 },
    ],
    specGrid: [
      { label: "Governing Standard", value: "IS 17082 / EN 50618 (H1Z2Z2-K)" },
      { label: "Voltage Rating", value: "1.5kV DC (Max 1.8kV DC continuous)" },
      { label: "Temperature Rating", value: "-40°C to +90°C (Max Conductor 120°C)" },
      { label: "Halogen Free Standard", value: "IEC 60754-1 (Zero Toxic Gas Emission)" },
      { label: "Stock Availability", value: "45,000+ Mtrs Ready on Wooden Drums" },
    ],
    companionCategoryIds: ["wire-cables", "glands", "earthing-material"],
  },
};

interface AiSmartCategorySectionProps {
  onQuoteRequested?: (category?: string, product?: string, details?: string) => void;
}

export function AiSmartCategorySection({ onQuoteRequested }: AiSmartCategorySectionProps) {
  const [, navigate] = useLocation();

  // State
  const [projectedCategoryId, setProjectedCategoryId] = useState<string>("wire-cables");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePreset, setActivePreset] = useState<ProjectPreset | null>(null);
  const [activeHotspotId, setActiveHotspotId] = useState<string>("h1");
  const [simulationIndex, setSimulationIndex] = useState<number>(1); // 45kW default

  // Active Category Data for Projection
  const activeCategory = useMemo(() => {
    return CATEGORIES.find((c) => c.id === projectedCategoryId) || CATEGORIES[0];
  }, [projectedCategoryId]);

  const activeAnatomy = useMemo(() => {
    return CATEGORY_ANATOMY_DATA[projectedCategoryId] || CATEGORY_ANATOMY_DATA["wire-cables"];
  }, [projectedCategoryId]);

  // Highlighted IDs from search/presets
  const highlightedCategoryIds = useMemo(() => {
    if (activePreset) {
      return new Set(activePreset.matchedCategoryIds);
    }
    if (searchQuery.trim().length >= 2) {
      const q = searchQuery.toLowerCase();
      const matches = new Set<string>();
      CATEGORIES.forEach((cat) => {
        if (
          cat.name.toLowerCase().includes(q) ||
          cat.detail.toLowerCase().includes(q) ||
          cat.featuredPills.some((p) => p.toLowerCase().includes(q))
        ) {
          matches.add(cat.id);
        }
      });
      if (q.includes("solar") || q.includes("pv")) {
        matches.add("solar");
        matches.add("wire-cables");
      }
      if (q.includes("panel") || q.includes("mccb") || q.includes("switchgear")) {
        matches.add("switch-gears");
        matches.add("wire-cables");
      }
      return matches;
    }
    return new Set<string>();
  }, [searchQuery, activePreset]);

  // Handler for category switch
  const handleSelectCategory = (catId: string) => {
    setProjectedCategoryId(catId);
    const data = CATEGORY_ANATOMY_DATA[catId];
    if (data && data.hotspots.length > 0) {
      setActiveHotspotId(data.hotspots[0].id);
    }
  };

  const currentSimulation = activeAnatomy.simulationOptions ? activeAnatomy.simulationOptions[simulationIndex] : null;

  return (
    <section id="categories" className="py-14 sm:py-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-[#071523] via-[#091b2c] to-[#06121e] text-white relative overflow-hidden">
      {/* Laser grid matrix ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(#c56718_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="market-container relative z-10">
        {/* ============================================================== */}
        {/* SECTION HEADER                                                 */}
        {/* ============================================================== */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="size-3.5 animate-pulse text-amber-400" />
              <span>AI CATEGORY PROJECTION STAGE · 8 MASTER DIVISIONS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Interactive Division Projections
            </h2>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Select any division below to project its certified engineering layers, factory testing parameters, and live AI load-sizing calculations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold cursor-pointer border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white"
              onClick={() => navigate("/products")}
            >
              Full Catalog ({CATEGORIES.reduce((acc, c) => acc + c.productCount, 0).toLocaleString("en-IN")}+ SKUs)
              <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 1. DIVISION SELECTOR DECK (8 MASTER DIVISIONS)                 */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          {CATEGORIES.map((cat) => {
            const isSelected = cat.id === projectedCategoryId;
            const isMatched = highlightedCategoryIds.has(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group ${
                  isSelected
                    ? "bg-gradient-to-b from-[#c56718] to-[#994708] border-amber-300 shadow-[0_0_20px_rgba(197,103,24,0.45)] scale-[1.03] z-10"
                    : isMatched
                    ? "bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50"
                    : "bg-[#0c2235]/80 hover:bg-[#122e47] border-slate-700/80 hover:border-slate-600"
                }`}
              >
                {/* Glow bar indicator */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white animate-pulse" />
                )}

                <div className="flex items-center justify-between gap-1 w-full mb-1.5">
                  <span className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-amber-400"
                  }`}>
                    DIV-{cat.code}
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">{cat.productCount}+</span>
                </div>

                <strong className="text-xs font-bold leading-tight line-clamp-1 block text-white group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </strong>
              </button>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* 2. MAIN CINEMATIC AI PROJECTION STAGE (CENTERPIECE)            */}
        {/* ============================================================== */}
        <div className="rounded-3xl bg-[#091b2c] border border-amber-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden mb-10 relative">
          {/* Top Stage Bar */}
          <div className="px-5 py-3.5 bg-[#061421] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                AI PROJECTION ACTIVE
              </span>
              <span className="text-slate-600">|</span>
              <span className="font-mono text-slate-300">
                STATION: AHMEDABAD_HQ_CENTRAL_DEPOT
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-[11px] font-bold">
                {activeAnatomy.badge}
              </span>
              <button
                onClick={() => navigate(`/category/${activeCategory.slug}`)}
                className="text-slate-300 hover:text-white flex items-center gap-1 font-semibold ml-2 transition-colors cursor-pointer"
              >
                Browse Full Division <ExternalLink className="size-3" />
              </button>
            </div>
          </div>

          {/* Center Stage Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            {/* Visual Viewport (7 Cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between relative bg-radial from-[#0e273f] to-[#071523] border-b lg:border-b-0 lg:border-r border-slate-800">
              {/* Telemetry Corner HUD Brackets */}
              <div className="absolute top-4 left-4 font-mono text-[10px] text-amber-400/70 pointer-events-none">
                [ LAYER_SCAN_FREQ: 60Hz // CPRI_MTC_VERIFIED ]
              </div>
              <div className="absolute top-4 right-4 font-mono text-[10px] text-slate-500 pointer-events-none">
                RESOLUTION: 8K MACRO
              </div>

              {/* Central Holographic Image Stage */}
              <div className="relative my-4 aspect-16/10 rounded-2xl overflow-hidden bg-black/40 border border-slate-700/80 shadow-2xl flex items-center justify-center group">
                {/* Laser Scanning Line Animation */}
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[2px] opacity-75 z-20 pointer-events-none animate-bounce" style={{ animationDuration: "3s" }} />

                <img
                  src={activeAnatomy.highResImage}
                  alt={activeCategory.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Hotspot Markers */}
                {activeAnatomy.hotspots.map((h) => {
                  const isCurrent = activeHotspotId === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => setActiveHotspotId(h.id)}
                      style={{ left: `${h.x}%`, top: `${h.y}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 size-7 rounded-full flex items-center justify-center cursor-pointer transition-all z-30 ${
                        isCurrent
                          ? "bg-amber-400 text-slate-950 scale-125 ring-4 ring-amber-400/50 shadow-[0_0_20px_#f59e0b]"
                          : "bg-black/80 border border-white/60 text-white hover:scale-110"
                      }`}
                      title={`${h.title}: ${h.label}`}
                    >
                      <span className="size-2 rounded-full bg-current" />
                    </button>
                  );
                })}

                {/* Active Hotspot Bottom Readout */}
                {activeHotspotId && (() => {
                  const h = activeAnatomy.hotspots.find((s) => s.id === activeHotspotId);
                  if (!h) return null;
                  return (
                    <div className="absolute bottom-3 inset-x-3 p-3 rounded-xl bg-[#091b2c]/95 border border-amber-500/40 backdrop-blur-md flex items-start gap-3 z-30 animate-in fade-in duration-200">
                      <div className="size-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                        <Zap className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <strong className="text-xs sm:text-sm font-bold text-white truncate">
                            {h.title}
                          </strong>
                          <span className="text-[10px] font-mono text-amber-400 font-semibold shrink-0">
                            {h.spec}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">
                          {h.label}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Sizing & Ampacity Simulation Strip (if available) */}
              {activeAnatomy.simulationOptions && currentSimulation && (
                <div className="mt-2 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Sliders className="size-3.5 text-amber-400" />
                      Live AI Load Sizing Projection:
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {currentSimulation.powerKW} kW ({currentSimulation.currentAmps}A Full Load)
                    </span>
                  </div>

                  {/* Slider Control */}
                  <input
                    type="range"
                    min="0"
                    max={activeAnatomy.simulationOptions.length - 1}
                    step="1"
                    value={simulationIndex}
                    onChange={(e) => setSimulationIndex(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer mb-3"
                  />

                  {/* Projected Specs Result Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-[#0c2235] border border-slate-800">
                      <small className="text-slate-400 block text-[9px] uppercase font-bold">Cable Gauge</small>
                      <strong className="text-white font-semibold truncate block">{currentSimulation.recommendedCable}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0c2235] border border-slate-800">
                      <small className="text-slate-400 block text-[9px] uppercase font-bold">MCCB Breaker</small>
                      <strong className="text-white font-semibold truncate block">{currentSimulation.recommendedBreaker}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0c2235] border border-slate-800">
                      <small className="text-slate-400 block text-[9px] uppercase font-bold">Matched Lugs</small>
                      <strong className="text-white font-semibold truncate block">{currentSimulation.recommendedLug}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0c2235] border border-slate-800">
                      <small className="text-slate-400 block text-[9px] uppercase font-bold">Matched Gland</small>
                      <strong className="text-white font-semibold truncate block">{currentSimulation.recommendedGland}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Telemetry & Specifications Panel (5 Cols) */}
            <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-[#081827]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    DIV-{activeCategory.code}
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400">
                    {activeCategory.productCount}+ Certified SKUs
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {activeCategory.name}
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {activeCategory.detail}
                </p>

                {/* Verified Specs Matrix */}
                <div className="mt-5 space-y-2 border-t border-slate-800 pt-4">
                  <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-amber-400" />
                    Verified Factory Parameters
                  </h4>

                  {activeAnatomy.specGrid.map((spec, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">{spec.label}</span>
                      <strong className="font-mono text-white text-right">{spec.value}</strong>
                    </div>
                  ))}
                </div>

                {/* Popular Configurations Pills */}
                <div className="mt-4 pt-2">
                  <small className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1.5">
                    Common Industrial Configurations:
                  </small>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCategory.featuredPills.map((pill) => (
                      <span key={pill} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                        {pill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800 space-y-2.5">
                <Button
                  className="w-full bg-[#c56718] hover:bg-[#b05810] text-white text-xs font-bold py-2.5 shadow-md cursor-pointer flex items-center justify-center gap-2"
                  onClick={() => navigate(`/category/${activeCategory.slug}`)}
                >
                  <span>Explore All {activeCategory.name} SKUs</span>
                  <ArrowRight className="size-3.5" />
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 cursor-pointer"
                    onClick={() => {
                      if (onQuoteRequested) {
                        onQuoteRequested(activeCategory.name, activeAnatomy.headline, "Requesting instant technical RFQ based on AI projection specs.");
                      }
                    }}
                  >
                    <FileText className="size-3 mr-1 text-amber-400" />
                    Request RFQ
                  </Button>

                  <a
                    href={`https://wa.me/919512365582?text=${encodeURIComponent(
                      `Hello Volamp, I am reviewing the AI projection for ${activeCategory.name} (${activeAnatomy.headline}) and would like direct contractor pricing.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center text-xs px-3 py-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold transition-colors text-center"
                  >
                    WhatsApp Supply
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. AI PROJECT SPEC SEARCH & NATURAL-LANGUAGE PRESETS           */}
        {/* ============================================================== */}
        <div className="mb-10 p-5 rounded-2xl bg-[#091b2c] border border-slate-800 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg bg-gradient-to-br from-amber-500 to-[#c56718] text-white flex items-center justify-center">
                <Cpu className="size-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  Natural-Language Project Matcher
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    LIVE INTEL
                  </span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Search requirements or click presets to project matching companion hardware.
                </p>
              </div>
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 self-end md:self-auto cursor-pointer"
              >
                <X className="size-3" /> Clear Filter
              </button>
            )}
          </div>

          <div className="relative mt-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., 250kW solar farm DC cabling with lugs & IP68 glands, or 400A factory main panel..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06121e] border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
            />
          </div>

          {/* Quick 1-Click Presets */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0">Fast Presets:</span>
            {PROJECT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setSearchQuery(preset.query);
                  if (preset.matchedCategoryIds.length > 0) {
                    setProjectedCategoryId(preset.matchedCategoryIds[0]);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
