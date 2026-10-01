import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import {
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  Factory,
  Zap,
  FileText,
  Phone,
  Scale,
  Truck,
  ExternalLink,
  Download,
  Flame,
  Award,
  Medal,
  Calendar,
  X,
  ZoomIn,
  Clock,
  Briefcase,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RealCertificateItem {
  id: string;
  category: "manufacturer" | "leadership" | "pending";
  categoryLabel: string;
  badge: string;
  badgeColor: string;
  title: string;
  issuer: string;
  recipient: string;
  date: string;
  image: string | null;
  citation: string;
  highlights: string[];
  status: string;
}

export const REAL_CERTIFICATES: RealCertificateItem[] = [
  {
    id: "finolex-partner-2026",
    category: "manufacturer",
    categoryLabel: "Manufacturer Authorization",
    badge: "AUTHORISED CHANNEL PARTNER",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-700",
    title: "Finolex Cables Authorised Channel Partner Certificate",
    issuer: "Finolex Cables Limited",
    recipient: "VOLAMP ELEKTRIKALS PVT LTD",
    date: "Valid through 31st March 2026",
    image: "/certificates/finolex-channel-partner.jpg",
    citation: "Officially certified as an Authorised Channel Partner for the entire Finolex Range of Wire & Cables.",
    highlights: [
      "Official Authorised Channel Partner appointment",
      "Scope: Full Finolex Range of Industrial Wire & Cables",
      "Signed by Amit Mathur (President - Sales & Marketing)",
      "Direct factory procurement and authentic batch MTC delivery",
    ],
    status: "Active & Certified",
  },
  {
    id: "kei-star-dealer-2024",
    category: "manufacturer",
    categoryLabel: "Manufacturer Award",
    badge: "STAR DEALER MEET 2024",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    title: "KEI Wires & Cables Partner-in-Progress Award",
    issuer: "KEI Industries Ltd.",
    recipient: "VOLAMP ELEKTRIKALS PVT LTD, AHMEDABAD",
    date: "2nd February, 2024",
    image: "/certificates/kei-star-dealer-2024.jpg",
    citation: "With deep appreciation, this memento recognises your outstanding contribution & pivotal role as a partner-in-progress of KEI journey.",
    highlights: [
      "Star Dealer Meet 2024 Recognition",
      "Presented with compliments from Mr. Anil Gupta (CMD, KEI Industries Ltd.)",
      "Celebrates outstanding supply performance across major Gujarat projects",
      "Golden Star Dealer Memento and Partner-in-Progress citation",
    ],
    status: "Awarded & Honored",
  },
  {
    id: "kei-50-years-association",
    category: "manufacturer",
    categoryLabel: "Partnership Milestone",
    badge: "50 GLORIOUS YEARS TROPHY",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    title: "KEI 50 Glorious Years Continued Association Milestone",
    issuer: "KEI Wires & Cables",
    recipient: "Volamp Elektrikals, Ahmedabad",
    date: "19th May, 2018 (Since 1968)",
    image: "/certificates/kei-50-years-trophy.jpg",
    citation: "Celebrating 50 glorious years of industrial excellence. We applaud your continued association and partnership dedication.",
    highlights: [
      "Commemorating half a century of manufacturing leadership (Since 1968)",
      "Crystal diamond pedestal trophy awarded at Ahmedabad Partners Meet",
      "Recognizes multi-decade trust and continuous bulk volume contribution",
      "High-prestige industry association benchmark",
    ],
    status: "Historic Milestone",
  },
  {
    id: "unnati-mbm-naimil-patel",
    category: "leadership",
    categoryLabel: "Executive Leadership",
    badge: "MASTER OF BUSINESS MANAGEMENT",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-700",
    title: "Master of Business Management (CML Business Coaching)",
    issuer: "Unnati (Top 5 Business Coaches for SME in India)",
    recipient: "Naimil Patel (Volamp Elektrikals)",
    date: "April 2026",
    image: "/certificates/unnati-mbm-naimil-patel.jpg",
    citation: "Demonstrating exceptional commitment to entrepreneurial growth, strategic leadership, and the transformation of vision into enduring business excellence.",
    highlights: [
      "Rigorous and transformative CML Business Coaching program",
      "A Hands-on MBM Experience for Entrepreneurs",
      "Signed by Shyam Taneja, Anil Gupta, and Neeru Gupta",
      "Exploring Potential · Achieving Dreams leadership standard",
    ],
    status: "Completed with Distinction",
  },
  {
    id: "unnati-cha-leadership",
    category: "leadership",
    categoryLabel: "Leadership Excellence",
    badge: "ChA LEADERSHIP AWARD",
    badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-700",
    title: "ChA Leadership Award Trophy",
    issuer: "Unnati (I CAN · I WILL)",
    recipient: "Volamp Elektrikals",
    date: "Excellence Recognition",
    image: "/certificates/unnati-cha-leadership-award.jpg",
    citation: "Awarded for visionary entrepreneurial leadership, organizational resilience, and sustained commercial impact.",
    highlights: [
      "Prestigious golden acrylic pyramid trophy with beacon sphere",
      "Presented by Unnati leadership faculty",
      "Honors ethical supply chain orchestration and SME leadership",
      "Symbolizes transformative business drive and execution",
    ],
    status: "Conferred Award",
  },
  {
    id: "cml-orbit-shift-naimil-patel",
    category: "leadership",
    categoryLabel: "Executive Leadership",
    badge: "ORBIT SHIFT FOR GROWTH",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    title: "CML Orbit Shift for Growth Leadership Trophy",
    issuer: "Unnati · CML (Create · Manage · Lead)",
    recipient: "Naimil Patel (Volamp Elektrikals)",
    date: "April-2026",
    image: "/certificates/cml-orbit-shift-naimil-patel.jpg",
    citation: "Conferred to Naimil Patel for \"Orbit Shift for Growth\" under the CML (Create · Manage · Lead) Business Leadership Program.",
    highlights: [
      "Golden hand sculpture trophy symbolizing elevated enterprise vision and focus",
      "Presented by Unnati under the prestigious CML (Create · Manage · Lead) framework",
      "Pedestal Inscription: Orbit Shift for Growth · April-2026",
      "Celebrates strategic transformation and organizational scale",
    ],
    status: "Conferred Trophy",
  },
];

interface StandardItem {
  id: string;
  code: string;
  title: string;
  authority: string;
  badge: string;
  badgeColor: string;
  summary: string;
  coverage: string[];
  deliverables: string;
  icon: typeof ShieldCheck;
}

const QUALITY_STANDARDS: StandardItem[] = [
  {
    id: "bis-isi",
    code: "BIS / ISI Standards",
    title: "Bureau of Indian Standards Quality Certification",
    authority: "Bureau of Indian Standards, Government of India",
    badge: "STATUTORY STANDARD",
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-700",
    summary:
      "All cables and wires supplied by Volamp adhere to mandatory BIS standards, ensuring precise copper/aluminium conductor resistance, dielectric breakdown voltage, and insulation wall thickness.",
    coverage: [
      "IS 694: PVC Insulated Building & Flexible Wires (up to 1100V)",
      "IS 7098 Part 1: LT Cross-Linked Polyethylene (XLPE) Armoured Cables",
      "IS 7098 Part 2: HT XLPE Power Cables (3.3kV up to 33kV)",
      "IS 1554: PVC Insulated Heavy-Duty Power & Control Cables",
    ],
    deliverables: "Official ISI Mark on Every Cable Drum & Sheath",
    icon: ShieldCheck,
  },
  {
    id: "iso-9001",
    code: "ISO 9001:2015",
    title: "Quality Management System (QMS)",
    authority: "International Organization for Standardization (ISO)",
    badge: "GLOBAL QMS",
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
    summary:
      "Operational QMS protocol governing supplier qualification, warehouse storage, drum handling, cutting precision, and pre-dispatch testing procedures.",
    coverage: [
      "100% Conductor Raw Purity & Resistance Audits",
      "Traceable Batch Batching & Drum Identification",
      "Calibrated Testing Instruments for Insulation Resistance",
      "Standard Operating Procedures (SOP) at Aslali Warehouse",
    ],
    deliverables: "Verified Quality Audit & Traceability Records",
    icon: FileCheck,
  },
  {
    id: "cpri-type-tested",
    code: "CPRI Type-Tested",
    title: "Central Power Research Institute Reports",
    authority: "CPRI (Ministry of Power, Government of India)",
    badge: "TYPE-TESTED",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-700",
    summary:
      "Independent laboratory validation confirming that our power cables safely withstand severe short-circuit electromagnetic stresses, lightning impulses, and maximum continuous current loads.",
    coverage: [
      "Short Circuit Dynamic & Thermal Withstand Stress",
      "High-Voltage AC & DC Breakdown Voltage Tests",
      "Lightning Impulse Voltage Breakdown Certification",
      "Conductor Maximum Temperature Rise Limits",
    ],
    deliverables: "Third-Party Laboratory Test Reports for Project Tenders",
    icon: Zap,
  },
  {
    id: "erda-tested",
    code: "ERDA Certified",
    title: "Electrical Research & Development Association",
    authority: "ERDA Vadodara (NABL Accredited Laboratory)",
    badge: "FIRE & SMOKE SAFETY",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 border-red-300 dark:border-red-700",
    summary:
      "Rigorous flammability, smoke obscuration, and acid gas evaluations for Flame-Retardant Low-Smoke (FRLS) and Zero-Halogen (ZHFR) cables required in high-density public infrastructure.",
    coverage: [
      "Critical Oxygen Index & Temperature Index (ASTM D 2863)",
      "Smoke Density Chamber Rating (ASTM D 2843 / IEC 61034)",
      "Halogen Acid Gas Emission (IEC 60754-1: Max 0.5% for ZHFR)",
      "Bunched Cable Vertical Flame Spread Category C",
    ],
    deliverables: "NABL Laboratory Test Certificates for Metro & Airport Tenders",
    icon: Flame,
  },
  {
    id: "gem-registered",
    code: "GeM Registered Vendor",
    title: "Government e-Marketplace Supplier",
    authority: "Ministry of Commerce & Industry, Government of India",
    badge: "PUBLIC PROCUREMENT",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300 dark:border-orange-700",
    summary:
      "Fully verified and onboarded supplier for Indian Railways, CPWD, defense cantonments, state electricity DISCOMs, and central PSUs via the GeM procurement portal.",
    coverage: [
      "Class-I / Class-II Make in India (MII) Compliance",
      "Pre-Dispatch Third-Party Inspection (TPIA) Compatibility",
      "Consolidated Multi-Category BOM Bidding Support",
      "Fast-Track E-Invoice & Direct Consignment Dispatch",
    ],
    deliverables: "GeM Seller Credentials & Tender Support Authorizations",
    icon: Scale,
  },
  {
    id: "ce-rohs",
    code: "CE & RoHS Conformity",
    title: "International Environmental & Low Voltage Directives",
    authority: "European Conformity Directives (CE & RoHS)",
    badge: "GLOBAL EXPORT",
    badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-300 dark:border-teal-700",
    summary:
      "Compliance for overseas engineering exports ensuring zero banned heavy metals (Lead, Mercury, Cadmium, Hexavalent Chromium) and adherence to international low-voltage safety standards.",
    coverage: [
      "Restriction of Hazardous Substances (RoHS 2011/65/EU)",
      "European Low Voltage Directive (LVD 2014/35/EU)",
      "Non-Toxic Polymeric Compounds for Marine & Export Shipments",
      "Customs Compliant Packaging & Harmonized HS Code Billing",
    ],
    deliverables: "Certificate of Origin & Global Export Clearance Documentation",
    icon: Building2,
  },
];

export default function CertificationsAndAwards() {
  const [, navigate] = useLocation();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [activeModalCert, setActiveModalCert] = useState<RealCertificateItem | null>(null);

  const handleOpenRFQ = (standardName?: string) => {
    window.dispatchEvent(
      new CustomEvent("volamp:open-enquire", {
        detail: {
          category: "Technical Quality & MTC Dossier",
          product: standardName ? `Verification Request: ${standardName}` : "Full Project Quality & Certification Dossier",
        },
      })
    );
  };

  const filteredCerts =
    selectedFilter === "all"
      ? REAL_CERTIFICATES
      : REAL_CERTIFICATES.filter((c) => c.category === selectedFilter);

  return (
    <div className="volamp-marketplace min-h-screen bg-[#faf7f3] dark:bg-[#0c1520] text-[#3d2b2d] dark:text-[#f5f7f9] flex flex-col font-sans transition-colors">
      {/* 1. Universal Top Header */}
      <UniversalHeader currentPage="about" />

      {/* 2. Breadcrumb */}
      <div className="market-container py-3 text-xs text-[#71818c] dark:text-slate-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#4d1217] dark:hover:text-amber-300">
          Home
        </Link>
        <span className="text-stone-400">/</span>
        <Link href="/about-volamp" className="hover:text-[#4d1217] dark:hover:text-amber-300">
          About Volamp
        </Link>
        <span className="text-stone-400">/</span>
        <span className="font-semibold text-[#4d1217] dark:text-white">
          Certifications & Awards
        </span>
      </div>

      {/* 3. Hero Section (Warm Sand Gradient Matching Volamp Style) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff6ed] via-[#fffaf5] to-[#fcfaf7] dark:from-[#0f1f30] dark:via-[#0b1723] dark:to-[#081018] py-10 sm:py-14 border-b border-[#ebd7c7] dark:border-slate-800">
        <div className="market-container">
          <div className="max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[#c25e0a] dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Award className="size-3.5" />
              <span>OFFICIAL CORPORATE CREDENTIALS & INDUSTRY HONORS</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white tracking-tight leading-tight">
              Certifications & <span className="text-[#c56718] dark:text-amber-400">Industry Awards</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5d4a4b] dark:text-slate-300 font-['DM_Sans'] leading-relaxed max-w-2xl">
              Authentic authorisations from India's premier cable manufacturers (Finolex, KEI), longstanding dealer excellence trophies, and executive leadership honors awarded to VOLAMP ELEKTRIKALS PVT LTD.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
                <strong className="text-lg sm:text-xl font-bold text-[#4d1217] dark:text-white block font-['Space_Grotesk']">
                  Finolex
                </strong>
                <span className="text-[11px] text-slate-500">Authorised Channel Partner</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
                <strong className="text-lg sm:text-xl font-bold text-[#c56718] dark:text-amber-400 block font-['Space_Grotesk']">
                  KEI Star Dealer
                </strong>
                <span className="text-[11px] text-slate-500">Partner-in-Progress 2024</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
                <strong className="text-lg sm:text-xl font-bold text-[#4d1217] dark:text-white block font-['Space_Grotesk']">
                  50 Years
                </strong>
                <span className="text-[11px] text-slate-500">Continued Association</span>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
                <strong className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 block font-['Space_Grotesk']">
                  6 Credentials
                </strong>
                <span className="text-[11px] text-slate-500">100% Live & Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Statutory Identity Strip */}
      <section className="bg-white dark:bg-[#111e2e] border-b border-[#ebd7c7] dark:border-slate-800 py-3.5 shadow-2xs">
        <div className="market-container flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-[#5d4a4b] dark:text-slate-300">
            <span className="font-bold text-[#4d1217] dark:text-white">VOLAMP ELEKTRIKALS PVT. LTD.</span>
            <span>·</span>
            <span><strong>GSTIN:</strong> 24AAICV0754B1ZO</span>
            <span>·</span>
            <span><strong>CIN:</strong> U31900GJ2021PTC122730</span>
            <span>·</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">✓ Registered in Gujarat, India</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenRFQ("Company Statutory Credentials & GST Verification")}
              className="text-xs font-bold text-[#c56718] hover:text-[#b45309] hover:underline cursor-pointer"
            >
              Request Company Profile & GST Cert →
            </button>
          </div>
        </div>
      </section>

      {/* 5. Main Section: Real Certificates & Awards Gallery */}
      <main className="market-container py-8 sm:py-12 flex-1 space-y-12">
        {/* Section Header with Category Filter */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c56718] dark:text-amber-400 block font-['Space_Grotesk']">
                OFFICIAL PORTFOLIO · 6 CREDENTIALS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white mt-1">
                Real Certificates, Authorisations & Trophies
              </h2>
              <p className="text-xs sm:text-sm text-[#5d4a4b] dark:text-slate-300 mt-1 max-w-2xl">
                Click any certificate or award below to inspect the high-resolution documentation, signatories, and accreditation scope.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-xl border border-[#ebd7c7] dark:border-slate-700 shadow-2xs">
              <button
                type="button"
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === "all"
                    ? "bg-[#4d1217] text-white shadow-xs"
                    : "text-[#5d4a4b] dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-700"
                }`}
              >
                All (6)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("manufacturer")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === "manufacturer"
                    ? "bg-[#4d1217] text-white shadow-xs"
                    : "text-[#5d4a4b] dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-700"
                }`}
              >
                Manufacturer (3)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("leadership")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === "leadership"
                    ? "bg-[#4d1217] text-white shadow-xs"
                    : "text-[#5d4a4b] dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-700"
                }`}
              >
                Leadership & MBM (3)
              </button>
            </div>
          </div>
        </div>

        {/* 6 Real Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCerts.map((cert) => {
            const hasImage = Boolean(cert.image);

            return (
              <article
                key={cert.id}
                onClick={() => setActiveModalCert(cert)}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-[#ebd7c7] dark:border-slate-700 overflow-hidden shadow-xs hover:shadow-lg hover:border-[#c56718] dark:hover:border-amber-500 transition-all duration-300 flex flex-col cursor-pointer"
              >
                {/* Visual Certificate Card Frame */}
                <div className="relative aspect-[4/3] bg-gradient-to-br from-[#f8f2eb] to-[#eeddc9] dark:from-[#132235] dark:to-[#0a1420] overflow-hidden flex items-center justify-center border-b border-[#ebd7c7] dark:border-slate-700">
                  {hasImage ? (
                    <>
                      <img
                        src={cert.image!}
                        alt={cert.title}
                        loading="lazy"
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-[#4d1217]/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <span className="px-3.5 py-1.5 rounded-full bg-[#4d1217] text-white text-xs font-bold flex items-center gap-1.5 shadow-md">
                          <ZoomIn className="size-3.5" /> Inspect Certificate
                        </span>
                      </div>
                    </>
                  ) : (
                    /* Slot 6 Pending Placeholder Card */
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="size-16 rounded-2xl bg-amber-100/80 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-[#c56718] dark:text-amber-400">
                        <Clock className="size-8 animate-pulse" />
                      </div>
                      <div>
                        <strong className="text-sm font-bold text-[#4d1217] dark:text-white block font-['Space_Grotesk']">
                          Credential 6 of 6
                        </strong>
                        <span className="text-[11px] text-[#71818c] dark:text-slate-400 block mt-0.5">
                          Documentation under verification · Coming soon
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Top Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs ${cert.badgeColor}`}>
                      {cert.badge}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-[#4d1217] dark:text-amber-300 shadow-2xs border border-stone-200 dark:border-slate-700">
                      {cert.status}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#c56718] dark:text-amber-400 block">
                      {cert.issuer}
                    </span>
                    <h3 className="text-base font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white leading-snug group-hover:text-[#c56718] dark:group-hover:text-amber-400 transition-colors">
                      {cert.title}
                    </h3>
                    <p className="text-xs text-[#5d4a4b] dark:text-slate-300 font-['DM_Sans'] line-clamp-2 leading-relaxed">
                      {cert.citation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#ebd7c7]/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#71818c] dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="size-3 text-amber-500" /> {cert.date}
                    </span>
                    <span className="font-bold text-[#c56718] dark:text-amber-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>View</span>
                      <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* 6. Technical Quality & Compliance Standards (BIS, CPRI, ERDA, GeM) */}
        <section className="pt-6 border-t border-[#ebd7c7] dark:border-slate-800 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#c56718] dark:text-amber-400 block font-['Space_Grotesk']">
              ENGINEERING & EPC TENDER COMPLIANCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white">
              Mandatory Testing Standards & Statutory Compliance
            </h2>
            <p className="text-xs sm:text-sm text-[#5d4a4b] dark:text-slate-300 max-w-2xl">
              Strict statutory compliance under BIS/ISI benchmarks, independent CPRI & ERDA type-tested laboratory reports, and factory-verified Material Test Certificates ( MTC ) supplied with every consignment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUALITY_STANDARDS.map((std) => {
              const Icon = std.icon;
              return (
                <article
                  key={std.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-[#ebd7c7] dark:border-slate-700 p-5 sm:p-6 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${std.badgeColor}`}>
                        {std.badge}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> Verified
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="size-10 rounded-xl bg-amber-100/70 dark:bg-amber-950/60 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-800">
                        <Icon className="size-5 text-[#c56718] dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white leading-snug">
                          {std.code}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                          {std.title}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#5d4a4b] dark:text-slate-300 leading-relaxed font-['DM_Sans']">
                      {std.summary}
                    </p>

                    <div className="pt-2 border-t border-stone-100 dark:border-slate-700/60 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Scope of Standards:
                      </span>
                      <ul className="space-y-1">
                        {std.coverage.map((cov, idx) => (
                          <li key={idx} className="text-xs text-[#3d2b2d] dark:text-slate-200 flex items-start gap-1.5">
                            <span className="text-[#c56718] font-bold text-xs mt-0.5">✓</span>
                            <span className="text-[11px] leading-tight">{cov}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-stone-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold truncate max-w-[170px]">
                      {std.deliverables}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenRFQ(std.title)}
                      className="font-bold text-[#c56718] hover:text-[#b45309] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Request MTC</span>
                      <ArrowRight className="size-3" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 7. MTC Factory Test Assurance Banner */}
        <section className="rounded-2xl bg-gradient-to-r from-[#4d1217] via-[#5e1920] to-[#3a0d12] text-white p-6 sm:p-8 shadow-md">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block">
              MATERIAL TEST CERTIFICATE ( MTC ) GUARANTEE
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">
              Every Consignment Supplied with Factory-Stamped Quality Certificates
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/80 font-['DM_Sans'] leading-relaxed">
              We understand the compliance mandates of electrical inspectors, EPC auditors, and client PMCs. Every cable consignment is accompanied by factory-tested conductor resistance readings, high-voltage spark tests, and batch traceability documentation.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenRFQ("Project MTC & Compliance Dossier")}
              className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Request Project MTC Dossier →
            </button>
            <a
              href="tel:+919512365582"
              className="border border-white/20 hover:bg-white/10 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Phone className="size-3 text-amber-400" />
              <span>Call Quality Desk: 9512365582</span>
            </a>
          </div>
        </section>
      </main>

      {/* 8. Lightbox / Modal for Inspecting Certificates */}
      {activeModalCert && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveModalCert(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-[#ebd7c7] dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#ebd7c7] dark:border-slate-800 flex items-center justify-between gap-3 bg-[#fffaf5] dark:bg-slate-900/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${activeModalCert.badgeColor}`}>
                    {activeModalCert.badge}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {activeModalCert.date}
                  </span>
                </div>
                <h3 className="text-lg font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white leading-tight">
                  {activeModalCert.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalCert(null)}
                className="size-8 rounded-full bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {/* Image Preview */}
              {activeModalCert.image ? (
                <div className="rounded-xl overflow-hidden bg-stone-100 dark:bg-slate-950 border border-stone-200 dark:border-slate-800 max-h-[440px] flex items-center justify-center p-2">
                  <img
                    src={activeModalCert.image}
                    alt={activeModalCert.title}
                    className="max-h-[420px] w-auto object-contain rounded-lg shadow-sm"
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-8 text-center space-y-2">
                  <Clock className="size-10 text-[#c56718] dark:text-amber-400 mx-auto animate-pulse" />
                  <h4 className="text-base font-bold text-[#4d1217] dark:text-white">
                    6th Credential Under Final Archival
                  </h4>
                  <p className="text-xs text-[#5d4a4b] dark:text-slate-300 max-w-md mx-auto">
                    This official certificate is currently undergoing registry documentation and will be published once clearance is completed.
                  </p>
                </div>
              )}

              {/* Details & Scope */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-stone-50 dark:bg-slate-800/60 border border-stone-200 dark:border-slate-700 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#c56718] dark:text-amber-400 block">
                    OFFICIAL CITATION
                  </span>
                  <blockquote className="text-xs sm:text-sm text-[#3d2b2d] dark:text-slate-200 italic font-['DM_Sans'] leading-relaxed">
                    "{activeModalCert.citation}"
                  </blockquote>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Issuing Authority / Partner</span>
                    <strong className="text-xs sm:text-sm text-[#4d1217] dark:text-white font-['Space_Grotesk'] block mt-0.5">
                      {activeModalCert.issuer}
                    </strong>
                  </div>

                  <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Recognized Recipient</span>
                    <strong className="text-xs sm:text-sm text-[#4d1217] dark:text-white font-['Space_Grotesk'] block mt-0.5">
                      {activeModalCert.recipient}
                    </strong>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    KEY SCOPE & HIGHLIGHTS
                  </span>
                  <ul className="space-y-1.5">
                    {activeModalCert.highlights.map((h, idx) => (
                      <li key={idx} className="text-xs text-[#4d1217] dark:text-slate-200 flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 text-[#c56718] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#ebd7c7] dark:border-slate-800 bg-[#fffaf5] dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="size-4" />
                <span>Verified Corporate Credential</span>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    handleOpenRFQ(`Verification of ${activeModalCert.title}`);
                    setActiveModalCert(null);
                  }}
                  className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold"
                >
                  Request Verification Dossier
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveModalCert(null)}
                  className="text-xs border-[#ebd7c7] text-[#4d1217] dark:text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
