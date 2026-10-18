import React, { useState, useMemo } from "react";
import {
  Cable,
  ShieldCheck,
  PlugZap,
  Zap,
  SunMedium,
  Layers,
  ArrowRight,
  FileText,
  CheckCircle2,
  Bot,
  SlidersHorizontal,
  Sparkles,
  Clock,
  Truck,
  Download,
  Info,
  ChevronRight,
} from "lucide-react";
import { AiElectricalViewerAssistant } from "./AiElectricalViewerAssistant";

interface ModernCategoryShowcaseProps {
  onNavigate: (slug: string) => void;
  onOpenARModal?: (cat: any) => void;
  onOpenShowroomLab?: (catId: string) => void;
}

interface CategoryDivision {
  id: string;
  slug: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  realImage: string;
  icon: any;
  accentColor: string;
  stockCount: string;
  dispatchTime: string;
  standards: string[];
  keySpecs: Array<{ label: string; value: string }>;
  subcategories: Array<{ name: string; slug: string; tag?: string }>;
}

export function ModernCategoryShowcase({
  onNavigate,
  onOpenARModal,
  onOpenShowroomLab,
}: ModernCategoryShowcaseProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [activeModelForAi, setActiveModelForAi] = useState<{ name: string; slug: string }>({
    name: "1.1kV XLPE Armoured Power Cables",
    slug: "wire-cables",
  });

  const divisions: CategoryDivision[] = useMemo(
    () => [
      {
        id: "wire-cables",
        slug: "wire-cables",
        code: "DIV-01",
        title: "Wire & Power Cables",
        subtitle: "LT / HT Armoured, Flexible FRLS & Control Cables",
        description:
          "Heavy-duty underground power transmission, motor feeder, and plant automation cables engineered for continuous operation under severe industrial thermal loads.",
        badge: "IS 7098 / IEC 60502-1",
        realImage: "/products/cable-cross-section.jpg",
        icon: Cable,
        accentColor: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400",
        stockCount: "12,500+ Mtrs in Stock",
        dispatchTime: "Same-Day Dispatch",
        standards: ["IS 7098 Part 1", "IEC 60502-1", "BS 5467", "FRLS / Zero Halogen"],
        keySpecs: [
          { label: "Voltage Grade", value: "1.1kV to 33kV" },
          { label: "Conductor Grade", value: "99.97% ETP Copper / EC Aluminium" },
          { label: "Armour Type", value: "Galvanized Steel Wire (GSWA) / Strip" },
          { label: "Continuous Temp", value: "90°C XLPE (250°C Short Circuit)" },
        ],
        subcategories: [
          { name: "Aluminium Armoured (A2XWY)", slug: "wire-cables", tag: "Heavy Feeder" },
          { name: "Copper Armoured (2XWY)", slug: "wire-cables", tag: "High Ampacity" },
          { name: "Industrial Flexible (FRLS)", slug: "wire-cables", tag: "Control/Panel" },
          { name: "HT 11kV & 33kV XLPE", slug: "wire-cables", tag: "Substation" },
          { name: "Cat-6 & Instrumentation", slug: "wire-cables", tag: "BMS / SCADA" },
        ],
      },
      {
        id: "lugs",
        slug: "lugs",
        code: "DIV-02",
        title: "Lugs, Terminals & Brass Glands",
        subtitle: "DIN 46235 Pure Copper Lugs & BS 6121 Double Compression Glands",
        description:
          "Heavy-duty tubular crimp lugs and precision threaded naval brass double-compression cable glands providing gas-tight seals and zero-resistance terminal joints.",
        badge: "DIN 46235 / BS 6121",
        realImage: "/products/cable-lugs-macro.jpg",
        icon: PlugZap,
        accentColor: "from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-400",
        stockCount: "18,400+ Units Ready",
        dispatchTime: "Immediate Packaging",
        standards: ["DIN 46235", "IS 8309", "BS 6121 Part 1", "IS 12943"],
        keySpecs: [
          { label: "Lug Material", value: "99.97% Electrolytic Copper (15µm Tin)" },
          { label: "Gland Material", value: "Naval Brass CZ121 (Nickel Plated Option)" },
          { label: "Ingress Rating", value: "IP66 / IP68 Gas-Tight & Dust-Tight" },
          { label: "Crimp Pressure", value: "Up to 120 kN Hexagonal Die" },
        ],
        subcategories: [
          { name: "DIN 46235 Copper Lugs", slug: "lugs", tag: "Busbar Joint" },
          { name: "Double Compression Brass Glands", slug: "lugs", tag: "Armour Grip" },
          { name: "Aluminium Tubular Lugs", slug: "lugs", tag: "Utility Incomer" },
          { name: "Brass Earth Bonding Tags", slug: "lugs", tag: "Grounding" },
        ],
      },
      {
        id: "switch-gears",
        slug: "switch-gears",
        code: "DIV-03",
        title: "Industrial Switchgear & MCCB",
        subtitle: "4-Pole Incomer MCCBs, Contactors & Distribution Panels",
        description:
          "Circuit protection and powergear systems designed to isolate destructive short circuits in milliseconds while maintaining continuous full-load uptime.",
        badge: "IEC 60947-2 / IS 13947",
        realImage: "/products/mcc-panel-real.jpg",
        icon: ShieldCheck,
        accentColor: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-400",
        stockCount: "220+ Units Ready",
        dispatchTime: "Factory Tested",
        standards: ["IEC 60947-2", "IS/IEC 60947-4", "CE Certified", "IS 8623"],
        keySpecs: [
          { label: "Current Range", value: "16A to 1250A Continuous" },
          { label: "Breaking Capacity", value: "36kA / 50kA / 70kA @ 415V" },
          { label: "Poles Available", value: "3-Pole & 4-Pole" },
          { label: "Trip Unit Type", value: "Microprocessor ETU / Thermal-Mag" },
        ],
        subcategories: [
          { name: "Molded Case Circuit Breakers (MCCB)", slug: "switch-gears", tag: "Up to 800A" },
          { name: "Motor Power Contactors", slug: "switch-gears", tag: "AC-3 Duty" },
          { name: "Automatic Changeover Switches", slug: "switch-gears", tag: "Dual Incomer" },
          { name: "MCB & RCCB Final DBs", slug: "switch-gears", tag: "Sub-circuit" },
        ],
      },
      {
        id: "earthing",
        slug: "earthing",
        code: "DIV-04",
        title: "Earthing & Lightning Protection",
        subtitle: "Pure Copper-Bonded Steel Earth Rods & Earth Pits",
        description:
          "Low-impedance earth electrodes engineered with high-strength carbon steel and molecularly bonded 254-micron electrolytic copper for 30+ year soil service life.",
        badge: "IS 3043 / IEEE 80 / UL 467",
        realImage: "/products/earthing-rods.png",
        icon: Zap,
        accentColor: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
        stockCount: "3,200+ Rods in Stock",
        dispatchTime: "Ready to Ship",
        standards: ["IS 3043:2018", "IEEE 80", "UL 467 Certified", "IEC 62561-2"],
        keySpecs: [
          { label: "Copper Coating", value: "254 Microns (Molecularly Bonded)" },
          { label: "Electrode Rod Dia", value: "14.2mm, 17.2mm, 19mm" },
          { label: "Earth Compound", value: "Carbonaceous Backfill (< 0.2 Ω·m)" },
          { label: "Fault Current", value: "Tested up to 40kA / 1 sec" },
        ],
        subcategories: [
          { name: "Copper-Bonded Earth Rods", slug: "earthing", tag: "254 Micron" },
          { name: "Chemical Earth Electrodes", slug: "earthing", tag: "Low-Resistivity" },
          { name: "Lightning Arresters (ESE)", slug: "earthing", tag: "NF C 17-102" },
          { name: "GI & Copper Earth Strips", slug: "earthing", tag: "25x3 to 50x6" },
        ],
      },
      {
        id: "solar-cables",
        slug: "solar-cables",
        code: "DIV-05",
        title: "Solar DC Cables & PV Systems",
        subtitle: "1500V DC TUV Certified Cross-Linked Solar Cables",
        description:
          "Tinned copper photovoltaic feeder cables with electron-beam cross-linked halogen-free copolymer insulation engineered for 25-year direct solar UV and heat exposure.",
        badge: "EN 50618 / TUV 2 PFG 1169",
        realImage: "/products/solar-panel.jpg",
        icon: SunMedium,
        accentColor: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-400",
        stockCount: "16,000+ Mtrs in Stock",
        dispatchTime: "Same-Day Dispatch",
        standards: ["EN 50618", "TUV Rheinland", "IEC 62930", "IS 17293"],
        keySpecs: [
          { label: "Voltage Rating", value: "1500V DC (1800V Max)" },
          { label: "Conductor", value: "Class 5 Flexible Tinned Copper" },
          { label: "Temperature Range", value: "-40°C to +120°C" },
          { label: "Life Expectancy", value: "25 Years UV & Ozone Proof" },
        ],
        subcategories: [
          { name: "4 sq.mm Solar DC Cable", slug: "solar-cables", tag: "Rooftop PV" },
          { name: "6 sq.mm Solar DC Cable", slug: "solar-cables", tag: "Utility Scale" },
          { name: "MC4 Connectors (1500V)", slug: "solar-cables", tag: "IP68 Mating" },
          { name: "Solar Combiner Boxes (DCDB)", slug: "solar-cables", tag: "Surge Protection" },
        ],
      },
      {
        id: "conduits",
        slug: "conduits",
        code: "DIV-06",
        title: "Pipes, Conduits & Cable Trays",
        subtitle: "Perforated GI Ladder Trays, Rigid PVC & Flexible Metal Conduits",
        description:
          "Mechanical cable containment systems manufactured from pre-galvanized / hot-dip galvanized steel and high-impact rigid PVC for industrial routing.",
        badge: "IS 9537 / IS 2629",
        realImage: "/products/pvc-pipe.jpg",
        icon: Layers,
        accentColor: "from-slate-500/20 to-zinc-500/10 border-slate-500/30 text-slate-300",
        stockCount: "4,500+ Mtrs in Stock",
        dispatchTime: "Warehouse Ready",
        standards: ["IS 9537 Part 3", "IS 2629 (Hot-Dip)", "NEMA VE-1", "BS 4607"],
        keySpecs: [
          { label: "Tray Material", value: "Hot-Dip Galvanized Steel (80µm Zinc)" },
          { label: "Conduit Material", value: "High-Impact Flame-Retardant PVC" },
          { label: "Sizes Available", value: "50mm to 1000mm Widths" },
          { label: "Accessories", value: "Bends, Reducers, Tees, Couplers" },
        ],
        subcategories: [
          { name: "Perforated GI Cable Trays", slug: "conduits", tag: "Heavy Ladder" },
          { name: "Rigid FRLS PVC Conduits", slug: "conduits", tag: "Wall/Slab" },
          { name: "Flexible Steel Conduits", slug: "conduits", tag: "Motor Feeder" },
          { name: "Tray Couplers & Hardware", slug: "conduits", tag: "Galvanized" },
        ],
      },
    ],
    []
  );

  const filteredDivisions = useMemo(() => {
    if (selectedFilter === "all") return divisions;
    return divisions.filter((d) => d.id === selectedFilter);
  }, [divisions, selectedFilter]);

  return (
    <div className="relative w-full bg-[#090d16] text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Industrial Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#ec6437_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-br from-[#ec6437]/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto space-y-10 sm:space-y-12">
        {/* HEADER SECTION */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 border-b border-white/10 pb-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ec6437]/15 border border-[#ec6437]/35 text-[#ec6437] text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="size-3.5" />
              <span>INDUSTRIAL ELECTRICAL CATALOG · VOLAMP ELEKTRIKALS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Engineered for Heavy Power, Control & Infrastructure
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              Explore 3,400+ certified products across 6 core electrical divisions —
              manufactured, tested, and stocked in our Ahmedabad central distribution facility for same-day dispatch.
            </p>
          </div>

          {/* Quick Utility Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveModelForAi({
                  name: "Industrial Electrical Sizer",
                  slug: "wire-cables",
                });
                setIsAiAssistantOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:scale-[1.02]"
            >
              <Bot className="size-4 text-emerald-400" />
              <span>AI CABLE SIZER & RFQ</span>
            </button>

            {onOpenShowroomLab && (
              <button
                onClick={() => onOpenShowroomLab("cables")}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:border-[#ec6437]"
              >
                <Zap className="size-4 text-amber-400" />
                <span>360° AR LAB</span>
              </button>
            )}
          </div>
        </div>

        {/* DIVISION FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer border ${
              selectedFilter === "all"
                ? "bg-[#ec6437] text-white border-[#ec6437] shadow-lg shadow-[#ec6437]/30"
                : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10"
            }`}
          >
            ALL 6 DIVISIONS
          </button>
          {divisions.map((div) => {
            const Icon = div.icon;
            const isSelected = selectedFilter === div.id;
            return (
              <button
                key={div.id}
                onClick={() => setSelectedFilter(div.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer border flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#ec6437] text-white border-[#ec6437] shadow-lg shadow-[#ec6437]/30"
                    : "bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border-white/10"
                }`}
              >
                <Icon className="size-3.5" />
                <span>{div.title}</span>
              </button>
            );
          })}
        </div>

        {/* DIVISION SHOWCASE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDivisions.map((division) => {
            const Icon = division.icon;

            return (
              <div
                key={division.id}
                className="group relative flex flex-col justify-between rounded-3xl bg-[#0c121e] border border-white/10 hover:border-[#ec6437]/60 transition-all duration-300 hover:shadow-2xl hover:shadow-[#ec6437]/15 overflow-hidden"
              >
                {/* CARD TOP: REAL PRODUCT PHOTOGRAPHY */}
                <div className="relative h-60 sm:h-64 w-full overflow-hidden bg-slate-900">
                  <img
                    src={division.realImage}
                    alt={division.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Image Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c121e] via-[#0c121e]/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-4 inset-x-4 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/20 text-[10px] font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-[#ec6437]" />
                      <span>{division.code}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-[#ec6437]/90 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
                      {division.badge}
                    </span>
                  </div>

                  {/* Stock & Dispatch Pill at bottom of image */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-emerald-500/40 text-emerald-400 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="size-3" />
                      <span>{division.stockCount}</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-slate-300 flex items-center gap-1.5">
                      <Clock className="size-3 text-amber-400" />
                      <span>{division.dispatchTime}</span>
                    </span>
                  </div>
                </div>

                {/* CARD BODY: TECHNICAL DETAILS & SPECS */}
                <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-[#ec6437] transition-colors flex items-center justify-between">
                        <span>{division.title}</span>
                        <div className="p-2 rounded-xl bg-white/5 group-hover:bg-[#ec6437]/20 text-slate-400 group-hover:text-[#ec6437] transition-all">
                          <Icon className="size-4" />
                        </div>
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        {division.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {division.description}
                    </p>

                    {/* Technical Specs Key-Value Matrix */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-[11px] font-mono">
                      {division.keySpecs.map((spec, i) => (
                        <div key={i} className="p-2 rounded-xl bg-white/5 border border-white/5">
                          <span className="text-[10px] text-slate-400 block truncate">
                            {spec.label}
                          </span>
                          <span className="font-bold text-slate-200 block truncate">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Subcategories Chips */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                        Popular Configurations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {division.subcategories.map((sub, idx) => (
                          <button
                            key={idx}
                            onClick={() => onNavigate(division.slug)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 group/chip"
                          >
                            <span>{sub.name}</span>
                            {sub.tag && (
                              <span className="text-[9px] font-mono text-[#ec6437] font-bold">
                                · {sub.tag}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CARD ACTIONS */}
                  <div className="pt-5 border-t border-white/10 flex items-center gap-2">
                    <button
                      onClick={() => onNavigate(division.slug)}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#ec6437] hover:bg-[#d94819] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ec6437]/25 hover:scale-[1.01]"
                    >
                      <span>EXPLORE CATALOG</span>
                      <ArrowRight className="size-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setActiveModelForAi({
                          name: division.title,
                          slug: division.slug,
                        });
                        setIsAiAssistantOpen(true);
                      }}
                      className="p-3 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer"
                      title="Calculate Cable & Hardware Specs with AI"
                    >
                      <Bot className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ENGINEERING BANNER */}
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-[#0c121e] to-slate-900 border border-white/15 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono font-bold text-amber-400">
              <Truck className="size-4" />
              <span>CENTRAL WAREHOUSE IN AHMEDABAD, GUJARAT</span>
            </div>
            <h4 className="text-xl sm:text-2xl font-black text-white">
              Need custom cut lengths, test certificates, or bulk contractor pricing?
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our engineering sales team provides IS/IEC type test reports, drum cut-to-length services, and same-day dispatch across India.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveModelForAi({
                  name: "Bulk Technical Specification",
                  slug: "wire-cables",
                });
                setIsAiAssistantOpen(true);
              }}
              className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/30"
            >
              <Bot className="size-4" />
              <span>ASK AI SIZER DESK</span>
            </button>

            <button
              onClick={() => onNavigate("wire-cables")}
              className="py-3 px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <span>VIEW FULL PRICELIST</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI ELECTRICAL ASSISTANT MODAL */}
      <AiElectricalViewerAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        activeModelName={activeModelForAi.name}
        activeModelSlug={activeModelForAi.slug}
        onNavigateCategory={onNavigate}
        onOpenARModal={onOpenARModal}
      />
    </div>
  );
}
