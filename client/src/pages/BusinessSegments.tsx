import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { EnquireModal } from "@/components/enquire/EnquireModal";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Cpu,
  Factory,
  FileSpreadsheet,
  HardHat,
  Phone,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Truck,
  Zap,
} from "lucide-react";

export type VisualSegment = {
  id: string;
  number: string;
  title: string;
  tagline: string;
  image: string;
  icon: typeof HardHat;
  supplies: string[];
  specs: string[];
  badgeColor: string;
};

export const visualSegments: VisualSegment[] = [
  {
    id: "epc-infrastructure",
    number: "01",
    title: "EPC & Infrastructure",
    tagline: "Highways, Metros, Airports, Bridges & Smart Cities",
    image: "/segments/epc-infra.jpg",
    icon: HardHat,
    supplies: [
      "1.1kV & 11kV/33kV XLPE Armoured Cables",
      "Perforated GI Cable Trays & Raceways",
      "High-Fault Trefoil Cable Cleats",
      "Chemical Earthing & Lightning Arresters",
    ],
    specs: ["IS 7098 (Part 1 & 2)", "CPRI / ERDA Tested", "MTC with Every Drum"],
    badgeColor: "#1d73b7",
  },
  {
    id: "manufacturing-plants",
    number: "02",
    title: "Heavy Industry & Manufacturing",
    tagline: "Chemicals, Pharma, Steel Mills, Cement & Auto Plants",
    image: "/segments/manufacturing.jpg",
    icon: Factory,
    supplies: [
      "VFD Shielded Motor Power Cables",
      "Heat-Resistant Silicon Rubber Wires",
      "Heavy-Duty Air Circuit Breakers (ACB)",
      "Motor Protection Breakers (MPCB)",
    ],
    specs: ["IS 1554 / IS 694", "Flame-Retardant Low Smoke (FRLS)", "Class 5 Copper"],
    badgeColor: "#d97818",
  },
  {
    id: "commercial-real-estate",
    number: "03",
    title: "Commercial & Real Estate",
    tagline: "Commercial Towers, IT Parks, Malls & High-Rise Living",
    image: "/segments/commercial.jpg",
    icon: Building2,
    supplies: [
      "Zero-Halogen (ZHFR) Building Wires",
      "Distribution Boards (SPN, TPN & Vertical DBs)",
      "Multi-Function Digital Energy Meters",
      "Underfloor Trunking & Cable Ducts",
    ],
    specs: ["NBC 2016 Compliant", "IS 694 Certified", "Green Building Approved"],
    badgeColor: "#0b2b46",
  },
  {
    id: "solar-renewables",
    number: "04",
    title: "Solar & Renewable Energy",
    tagline: "Utility Solar Farms, Commercial Rooftops & BESS",
    image: "/segments/solar.jpg",
    icon: SunMedium,
    supplies: [
      "1.5 kV DC Solar Cables (EN 50618 / TUV)",
      "MC4 Connectors & Branch Splitters",
      "Array Junction Boxes (AJB / SMB)",
      "1000V/1500V DC Isolators & SPDs",
    ],
    specs: ["EN 50618 / TUV", "UV & Ozone Resistant", "Tinned Copper"],
    badgeColor: "#c56718",
  },
  {
    id: "power-utilities",
    number: "05",
    title: "Power Utilities & Sub-stations",
    tagline: "Transmission Grids, Sub-stations & DISCOM Distribution",
    image: "/segments/utilities.jpg",
    icon: Zap,
    supplies: [
      "EHV & HT Underground Power Feeders",
      "Electrolytic Copper & Aluminium Busbars",
      "Current & Potential Transformers (CT/PT)",
      "Lightning Arresters & GOAB Switches",
    ],
    specs: ["IS 7098 Part 2", "IEC 60502", "TPIA Inspection Cleared"],
    badgeColor: "#1d73b7",
  },
  {
    id: "panel-builders",
    number: "06",
    title: "Panel Builders & OEMs",
    tagline: "LV/MV Switchboard Fabricators, MCCs & Automation",
    image: "/segments/panel-builders.jpg",
    icon: Cpu,
    supplies: [
      "Flexible Tri-Rated / UL Control Panel Wires",
      "Power Contactors & Thermal Overload Relays",
      "Push Buttons, Selectors & LED Indicators",
      "DIN-Rail Terminals & Printed Ferrules",
    ],
    specs: ["IS 13947 / IEC 60947", "CE / UL Component Grades", "Batch-to-Batch Quality"],
    badgeColor: "#0b2b46",
  },
  {
    id: "government-defense",
    number: "07",
    title: "Government, Defense & PSUs",
    tagline: "Indian Railways, CPWD, Defense Projects & GeM Supply",
    image: "/segments/government.jpg",
    icon: ShieldCheck,
    supplies: [
      "RDSO Railway Signaling & Power Cables",
      "Heavy-Duty Weatherproof Feeder Pillars",
      "GeM Approved Distribution Enclosures",
      "Flameproof Industrial Junction Boxes",
    ],
    specs: ["GeM Verified Reseller / OEM", "RDSO & MES Compliant", "Tender Bid Support"],
    badgeColor: "#d97818",
  },
];

export default function BusinessSegments() {
  const [, navigate] = useLocation();
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryCategory, setInquiryCategory] = useState<string>("");

  const handleOpenInquiry = (categoryName: string) => {
    setInquiryCategory(categoryName);
    setInquiryModalOpen(true);
  };

  useEffect(() => {
    const handleGlobalEnquire = (e: any) => {
      setInquiryCategory(e?.detail?.category || "Turnkey Project Sourcing");
      setInquiryModalOpen(true);
    };
    window.addEventListener("volamp:open-enquire", handleGlobalEnquire);
    return () => window.removeEventListener("volamp:open-enquire", handleGlobalEnquire);
  }, []);

  const filtered =
    selectedSegment === "all"
      ? visualSegments
      : visualSegments.filter((s) => s.id === selectedSegment);

  return (
    <div className="volamp-marketplace min-h-screen bg-[#faf7f3] dark:bg-[#0c1520] text-[#3d2b2d] dark:text-[#f5f7f9] flex flex-col font-sans transition-colors">
      {/* 1. Header */}
      <UniversalHeader currentPage="segments" />

      {/* 2. Breadcrumb */}
      <div className="market-container py-3 text-xs text-[#71818c] dark:text-slate-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#4d1217] dark:hover:text-amber-300">
          Home
        </Link>
        <span className="text-stone-400">/</span>
        <span className="font-semibold text-[#4d1217] dark:text-white">
          Business Segments & Industry Verticals
        </span>
      </div>

      {/* 3. Visual Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff6ed] via-[#fffaf5] to-[#fcfaf7] dark:from-[#0f1f30] dark:via-[#0b1723] dark:to-[#081018] py-8 sm:py-12 border-b border-[#ebd7c7] dark:border-slate-800">
        <div className="market-container">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[#c25e0a] dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="size-3.5" />
                <span>Industry Sectors & Turnkey Supply</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white tracking-tight leading-tight">
                Business <span className="text-[#c56718] dark:text-amber-400">Segments</span>
              </h1>

              <p className="text-sm sm:text-base text-[#5d4a4b] dark:text-slate-300 font-['DM_Sans'] leading-snug">
                Certified electrical packages engineered for India’s core industrial sectors. Direct manufacturer dispatch to any jobsite nationwide.
              </p>
            </div>

            {/* Visual Highlights Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 shrink-0 w-full lg:w-auto">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs flex items-center gap-2.5">
                <Truck className="size-5 text-[#c56718] shrink-0" />
                <div>
                  <strong className="text-xs font-bold text-[#4d1217] dark:text-white block">Pan-India</strong>
                  <small className="text-[11px] text-slate-500">Jobsite Dispatch</small>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs flex items-center gap-2.5">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-xs font-bold text-[#4d1217] dark:text-white block">100% Certified</strong>
                  <small className="text-[11px] text-slate-500">MTC & CPRI Reports</small>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs flex items-center gap-2.5">
                <ShieldCheck className="size-5 text-[#c56718] shrink-0" />
                <div>
                  <strong className="text-xs font-bold text-[#4d1217] dark:text-white block">GeM Registered</strong>
                  <small className="text-[11px] text-slate-500">Tender Compliant</small>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs flex items-center gap-2.5">
                <FileSpreadsheet className="size-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-xs font-bold text-[#4d1217] dark:text-white block">Consolidated BOQ</strong>
                  <small className="text-[11px] text-slate-500">Fast Quotations</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Visual Filter Pills */}
      <section className="bg-white dark:bg-[#111e2e] border-b border-[#ebd7c7] dark:border-slate-800 sticky top-16 sm:top-20 z-20 shadow-xs">
        <div className="market-container py-2.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedSegment("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedSegment === "all"
                  ? "bg-[#4d1217] text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100"
              }`}
            >
              All Verticals ({visualSegments.length})
            </button>
            {visualSegments.map((seg) => (
              <button
                key={seg.id}
                type="button"
                onClick={() => setSelectedSegment(seg.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSegment === seg.id
                    ? "bg-[#4d1217] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100"
                }`}
              >
                {seg.number}. {seg.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Visual Cards Grid (Reduced Text, Maximum Visual Impact) */}
      <main className="market-container py-8 sm:py-10 flex-1">
        {/* Logistics Notice Strip */}
        <div className="mb-6 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-[#c56718] shrink-0" />
            <span className="text-[#4d1217] dark:text-amber-200 font-medium">
              <strong>Direct Manufacturing Dispatch:</strong> We supply certified electrical materials directly to any project location across India.
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleOpenInquiry("Turnkey Project BOQ")}
            className="font-bold text-[#c56718] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Submit Project BOQ →
          </button>
        </div>

        {/* 2-Column Visual Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((segment) => {
            const Icon = segment.icon;
            return (
              <article
                key={segment.id}
                id={segment.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-[#ebd7c7] dark:border-slate-700 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group"
              >
                {/* Visual Image Banner */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-900">
                  <img
                    src={segment.image}
                    alt={segment.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md bg-[#4d1217]/90 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                      SEGMENT {segment.number}
                    </span>
                    <div className="size-8 rounded-full bg-white/90 dark:bg-slate-900/90 flex items-center justify-center shadow-xs backdrop-blur-xs">
                      <Icon className="size-4 text-[#c56718]" />
                    </div>
                  </div>

                  {/* Bottom Image Caption */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] tracking-tight drop-shadow-sm leading-tight">
                      {segment.title}
                    </h2>
                    <p className="text-xs text-amber-200/90 font-medium truncate mt-0.5">
                      {segment.tagline}
                    </p>
                  </div>
                </div>

                {/* Card Body: Punchy Visual Lists */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Core Supplies Tags */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-2">
                      CORE MATERIALS SUPPLIED:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {segment.supplies.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-slate-700/60 text-[#3d2b2d] dark:text-slate-200 text-xs font-medium border border-stone-200/60 dark:border-slate-600/50"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Standards Badges Ribbon */}
                  <div className="pt-2 border-t border-stone-200/80 dark:border-slate-700 flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex-wrap">
                    {segment.specs.map((spec, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        <span>{spec}</span>
                        {i < segment.specs.length - 1 && <span className="text-stone-300 mx-1">·</span>}
                      </span>
                    ))}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <Button
                      onClick={() => handleOpenInquiry(segment.title)}
                      className="flex-1 bg-[#4d1217] hover:bg-[#6e1a21] text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                    >
                      Enquire for this Segment <ArrowRight className="ml-1 size-3.5" />
                    </Button>
                    <a
                      href="tel:+919512365582"
                      className="px-3 py-2 rounded-lg border border-stone-300 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5"
                      title="Call Supply Desk"
                    >
                      <Phone className="size-3.5 text-[#c56718]" />
                      <span className="hidden sm:inline">Call</span>
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* 6. Turnkey BOQ Quick Upload Banner */}
      <section className="market-container pb-12">
        <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#4d1217] via-[#5e1920] to-[#3a0d12] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-md">
          <div className="space-y-1 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
              HAVE A COMPLETE PROJECT SCHEDULE?
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">
              Send Your Bill of Quantities (BOQ)
            </h2>
            <p className="text-xs text-amber-100/80 font-['DM_Sans']">
              Get consolidated pricing, manufacturer test certificates (MTC), and scheduled site delivery across India.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenInquiry("Consolidated Project BOQ")}
              className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Submit Project BOQ →
            </button>
            <a
              href="https://wa.me/919512365582?text=Hello%20VOLAMP%20team%2C%20I%20have%20an%20inquiry%20regarding%20turnkey%20project%20sourcing."
              target="_blank"
              rel="noreferrer"
              className="border border-white/20 hover:bg-white/10 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 7. Enquiry Modal */}
      <EnquireModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        initialCategory={inquiryCategory}
      />

      {/* 8. Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
