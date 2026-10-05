import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import UniversalFooter from "@/components/layout/UniversalFooter";
import {
  FileText,
  ShieldCheck,
  Building2,
  Scale,
  CreditCard,
  Truck,
  RotateCcw,
  Lock,
  Printer,
  ChevronDown,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface TermSection {
  id: string;
  title: string;
  badge: string;
  content: string[];
  keyPoints?: string[];
}

const SECTIONS: TermSection[] = [
  {
    id: "entity",
    title: "1. Legal Entity & Scope of Agreement",
    badge: "CORPORATE IDENTIFICATION",
    content: [
      "These Commercial Terms and Conditions ('Terms') govern all quotations, proforma invoices, sales orders, purchase contracts, and supply deliveries executed by VOLAMP ELEKTRIKALS PRIVATE LIMITED ('Volamp', 'Company', 'we', 'our', or 'us').",
      "Company Registration Details: Corporate Identity Number (CIN) U31900GJ2021PTC122730, registered in Gujarat, India. Goods & Services Tax Identification Number (GSTIN) 24AAICV0754B1ZO.",
      "By placing an order, accepting a commercial proforma invoice, or receiving materials from Volamp, the buyer ('Customer', 'Contractor', or 'Purchaser') agrees to be bound by these Terms to the exclusion of any conflicting buyer terms.",
    ],
    keyPoints: [
      "CIN: U31900GJ2021PTC122730 (RoC Ahmedabad)",
      "GSTIN: 24AAICV0754B1ZO (Gujarat State Code: 24)",
      "Registered Main Office: Khadia, Ahmedabad, Gujarat 380001",
    ],
  },
  {
    id: "pricing",
    title: "2. Quotations, Pricing & Validity",
    badge: "COMMERCIAL TERMS",
    content: [
      "All price quotations issued by our commercial desk are based on prevailing raw material base rates (electrolytic copper, aluminium, PVC/XLPE compounds) and manufacturer price lists at the time of quotation.",
      "Quotations are valid for seven (7) calendar days from the date of issue unless a specific project validity window is confirmed in writing.",
      "Prices are exclusive of applicable Goods and Services Tax (GST), transit insurance, and freight charges unless explicitly stated as 'Inclusive of GST & F.O.R. Site' on the proforma invoice.",
    ],
    keyPoints: [
      "Quotes valid for 7 calendar days unless specified otherwise",
      "Commodity rate adjustments apply on long-term procurement",
      "Applicable GST is invoiced under standard statutory HSN codes",
    ],
  },
  {
    id: "orders-payment",
    title: "3. Purchase Orders & Payment Terms",
    badge: "FINANCE & BILLING",
    content: [
      "Supply fulfillment commences upon receipt of an authorized Purchase Order (PO), signed proforma invoice, or advance payment confirmation.",
      "Payment modes: Accepted via direct RTGS / NEFT / Bank Transfer to our official Volamp corporate accounts, verified payment links, or approved institutional credit lines (Order & Pay Later facility).",
      "For credit accounts: Invoices must be cleared strictly within the approved credit period (typically 30 days). Overdue accounts are subject to commercial interest of 18% per annum from the due date until full realization.",
    ],
    keyPoints: [
      "Payments must be deposited only to authorized corporate accounts",
      "Formal tax invoices provided with every consignment",
      "Bank credit lines available for verified contractors and EPCs",
    ],
  },
  {
    id: "manufacturing-dispatch",
    title: "4. Facilities & Direct Manufacturing Supply Reach",
    badge: "SUPPLY CHAIN & LOGISTICS",
    content: [
      "Volamp operates two official physical facilities in Ahmedabad: our Corporate Main Office in Khadia (380001) for commercial contracting and billing, and our Central Fulfillment Center in Aslali (382427) on the NH-48 junction for high-tonnage storage and precision drum cutting.",
      "Direct Manufacturing Units: In addition to warehouse inventory, Volamp works directly with premier certified manufacturing units that can supply and dispatch products directly to any job site, project location, or regional depot across India.",
      "Every project dispatch is accompanied by official dispatch challans, e-Way bills, and manufacturer Material Test Certificates ( MTC ) certifying adherence to IS/IEC standards.",
    ],
    keyPoints: [
      "Main Office (Khadia) + Central Warehouse (Aslali)",
      "Direct factory-to-site supply to any location pan-India",
      "Factory Material Test Certificates ( MTC ) and routine test reports",
    ],
  },
  {
    id: "inspection-delivery",
    title: "5. Delivery, Inspection & Transit Risk",
    badge: "RECEIVING & TESTING",
    content: [
      "Consignments are staged via verified transport partners with GPS tracking and transit insurance coverage up to the destination unloading point.",
      "The purchaser is responsible for safe crane or mechanical offloading at their job site unless turnkey offloading was contracted in writing.",
      "The purchaser must inspect goods immediately upon receipt. Any visible transit damage, outer cable drum breakage, or seal tampering must be noted on the carrier's Lorry Receipt (LR) and reported to Volamp within 48 hours.",
    ],
    keyPoints: [
      "Mandatory LR endorsement for any transit discrepancy",
      "Shortage or transit damage notice required within 48 hours",
      "Crane offloading arrangements must be verified by site team",
    ],
  },
  {
    id: "warranty",
    title: "6. Warranty & Technical Compliance",
    badge: "QUALITY ASSURANCE",
    content: [
      "All cables, switchgears, and accessories supplied by Volamp adhere to BIS (IS 694, IS 7098 Part 1 & 2), CPRI type-testing, and applicable CE standards.",
      "Products are backed by standard manufacturer warranty against manufacturing defects for a period of twelve (12) months from date of invoice, or eighteen (18) months from date of dispatch, whichever is earlier.",
      "Warranty does not cover defects arising from improper cable sizing, inadequate derating, rough pulling, overloading, lightning surges, or external mechanical damage.",
    ],
    keyPoints: [
      "Standard 12-month manufacturer defect warranty",
      "IS / IEC / CPRI certified product specifications",
      "Technical guidance provided for proper sizing and derating",
    ],
  },
  {
    id: "returns-cancellation",
    title: "7. Return & Cancellation Policy",
    badge: "RETURNS & CANCELLATIONS",
    content: [
      "Returns and refunds are strictly governed by our Return & Refund Policy.",
      "Custom cut-length cables, coiled drums, and project-specific switchgear assemblies cannot be cancelled or returned once cutting or factory processing has commenced.",
      "Standard catalog goods in unopened, original factory packaging may be returned within seven (7) days of delivery subject to prior written approval and standard restocking inspection.",
    ],
    keyPoints: [
      "Custom cut-lengths are strictly non-returnable",
      "Standard sealed items subject to prior written Return Authorization",
      "Freight cost for approved non-defect returns is borne by the buyer",
    ],
  },
  {
    id: "force-majeure",
    title: "8. Force Majeure & Limitation of Liability",
    badge: "LIABILITY & CONTINGENCY",
    content: [
      "Neither party shall be liable for failure or delay in delivery caused by acts of God, flood, fire, transport strikes, raw material embargoes, state border closures, or unforeseen government regulatory actions beyond reasonable control.",
      "To the maximum extent permitted by law, Volamp's aggregate liability for any claim arising from order fulfillment shall be limited to the net invoice value of the specific product batch giving rise to the claim.",
      "Volamp shall not be liable for indirect, consequential, project delay penalties, or liquidated damages (LD) unless explicitly negotiated and agreed in a signed written contract.",
    ],
    keyPoints: [
      "Standard commercial force majeure protection",
      "Liability capped at invoice value of the affected batch",
      "Liquidated damages apply only if agreed in a formal contract",
    ],
  },
  {
    id: "jurisdiction",
    title: "9. Governing Law & Dispute Resolution",
    badge: "LEGAL JURISDICTION",
    content: [
      "These Terms and any commercial agreements between the parties shall be governed by and construed in accordance with the substantive laws of the Republic of India.",
      "In the event of any dispute, controversy, or claim arising out of or relating to commercial supplies, the parties shall first attempt amicable resolution. Customers may register formal disputes, transit damage, or shortage claims via the official Complaints & Cases Resolution Portal (/complaints-cases) for fast-track turnaround.",
      "Any legal proceedings or court actions shall be subject to the exclusive jurisdiction of the competent courts in Ahmedabad, Gujarat, India.",
    ],
    keyPoints: [
      "Governed by the laws of India",
      "Fast-track Grievance Cell at /complaints-cases",
      "Arbitration & conciliation prior to litigation",
      "Exclusive jurisdiction: Courts in Ahmedabad, Gujarat",
    ],
  },
];

export default function TermsConditions() {
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<string>("entity");

  const handlePrint = () => {
    window.print();
  };

  const copyClause = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Clause copied to clipboard", {
      description: title,
    });
  };

  return (
    <div className="policy-page min-h-screen bg-[#faf7f3] dark:bg-[#0c1520] text-[#3d2b2d] dark:text-[#f5f7f9] flex flex-col font-sans transition-colors">
      {/* 1. Policy Navbar */}
      <header className="policy-navbar">
        <div className="policy-nav-container">
          <div className="policy-nav-left">
            <Link href="/" className="policy-nav-brand">
              <img src="/volamp-logo.png" alt="VOLAMP Elektrikals" className="policy-brand-img" />
              <span className="policy-brand-badge">LEGAL & COMPLIANCE</span>
            </Link>
          </div>

          <div className="policy-nav-actions">
            {/* Policy Switcher Pills */}
            <div className="policy-switcher-pills">
              <Link href="/shipping-policy" className="policy-switch-pill">
                <Truck className="size-3.5" />
                <span>Shipping Policy</span>
              </Link>
              <Link href="/privacy-policy" className="policy-switch-pill">
                <Lock className="size-3.5" />
                <span>Privacy Policy</span>
              </Link>
              <Link href="/refund-policy" className="policy-switch-pill">
                <RotateCcw className="size-3.5" />
                <span>Refund Policy</span>
              </Link>
              <Link href="/terms-and-conditions" className="policy-switch-pill is-active">
                <Scale className="size-3.5" />
                <span>Terms & Conditions</span>
              </Link>
            </div>

            <button
              type="button"
              className="policy-action-btn"
              onClick={handlePrint}
              title="Print or save as PDF"
            >
              <Printer className="size-4" />
              <span>Print</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 2. Hero / Document Metadata Banner */}
      <section className="policy-hero-banner">
        <div className="policy-container">
          <div className="policy-hero-card">
            <div className="policy-hero-top">
              <div className="policy-hero-identity">
                <div
                  className="policy-doc-icon-box"
                  style={{ background: "linear-gradient(135deg, #4d1217, #c56718)" }}
                >
                  <Scale className="size-7 text-amber-300" />
                </div>
                <div>
                  <span className="policy-org-eyebrow">VOLAMP ELEKTRIKALS PRIVATE LIMITED</span>
                  <h1 className="policy-main-title">TERMS & CONDITIONS</h1>
                </div>
              </div>

              <div className="policy-status-pill">
                <span className="status-dot" />
                <span>OFFICIALLY ENFORCED · FY 2026</span>
              </div>
            </div>

            <div className="policy-meta-grid">
              <div className="policy-meta-item">
                <FileText className="size-4" />
                <div>
                  <small>DOCUMENT TYPE</small>
                  <strong>Commercial Supply Terms</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <ShieldCheck className="size-4" />
                <div>
                  <small>STATUTORY CIN</small>
                  <strong className="font-mono text-xs">U31900GJ2021PTC122730</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <CreditCard className="size-4" />
                <div>
                  <small>REGISTERED GSTIN</small>
                  <strong className="font-mono text-xs">24AAICV0754B1ZO</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <Building2 className="size-4" />
                <div>
                  <small>LEGAL JURISDICTION</small>
                  <strong>Ahmedabad, Gujarat, India</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Policy Content Layout */}
      <main className="policy-container py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Table of Contents Navigation (Sticky) */}
          <aside className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800/90 border border-[#ebd7c7] dark:border-slate-700 shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#c25e0a] dark:text-amber-400 block mb-3">
                TABLE OF CONTENTS
              </span>
              <nav className="space-y-1 text-xs">
                {SECTIONS.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => setActiveSection(sec.id)}
                    className={`block py-2 px-3 rounded-lg font-medium transition-colors ${
                      activeSection === sec.id
                        ? "bg-[#faf4ed] dark:bg-slate-700 text-[#c56718] dark:text-amber-300 font-bold border-l-2 border-[#c56718]"
                        : "text-slate-700 dark:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {sec.title}
                  </a>
                ))}
              </nav>
            </div>

            {/* Quick Sourcing Help Box */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#fff7ef] to-[#fbf5ee] dark:from-slate-800 dark:to-slate-850 border border-amber-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-[#c25e0a] dark:text-amber-400">
                <HelpCircle className="size-4" />
                <span className="text-xs font-bold uppercase tracking-wider">COMMERCIAL DESK</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Need enterprise contract terms, specialized billing, or manufacturer rate contract agreements?
              </p>
              <div className="pt-1 space-y-1.5 text-xs font-semibold">
                <a
                  href="tel:+919512365582"
                  className="flex items-center gap-2 text-[#4d1217] dark:text-white hover:text-[#c56718]"
                >
                  <Phone className="size-3.5 text-[#c56718]" />
                  <span>+91 9512365582</span>
                </a>
                <a
                  href="mailto:corporate@volamp.com"
                  className="flex items-center gap-2 text-[#4d1217] dark:text-white hover:text-[#c56718]"
                >
                  <Mail className="size-3.5 text-[#c56718]" />
                  <span>corporate@volamp.com</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Right Content Sections */}
          <div className="lg:col-span-8 space-y-8">
            {SECTIONS.map((sec) => (
              <section
                key={sec.id}
                id={sec.id}
                className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800/90 border border-[#ebd7c7] dark:border-slate-700 shadow-xs space-y-4 transition-all scroll-mt-24"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-slate-700/60 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#faf4ed] dark:bg-slate-700 text-[#c25e0a] dark:text-amber-300 border border-amber-200 dark:border-slate-600">
                    {sec.badge}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyClause(sec.content.join("\n\n"), sec.title)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-[#c56718] transition-colors"
                  >
                    Copy Clause
                  </button>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217] dark:text-white">
                  {sec.title}
                </h2>

                <div className="space-y-3 text-xs sm:text-sm text-[#5d4a4b] dark:text-slate-300 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                  {sec.content.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>

                {sec.keyPoints && sec.keyPoints.length > 0 && (
                  <div className="p-4 rounded-xl bg-[#faf7f3] dark:bg-slate-750 border border-[#ebd7c7]/80 dark:border-slate-700 space-y-2 mt-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#c25e0a] dark:text-amber-400 block">
                      KEY GOVERNANCE SUMMARY
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                      {sec.keyPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}

            {/* Bottom Support Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#4d1217] to-[#3a0d12] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
              <div className="space-y-1">
                <strong className="text-base font-bold font-['Plus_Jakarta_Sans',sans-serif] block">
                  Have Questions Regarding Enterprise Contract Terms?
                </strong>
                <p className="text-xs text-amber-100/80">
                  Our commercial legal desk is available to assist with vendor registration forms, tenders, and agreements.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate("/enquire")}
                  className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Contact Supply Desk
                </button>
                <a
                  href="https://wa.me/919512365582?text=Hello%20VOLAMP%20team%2C%20I%20have%20an%20inquiry%20regarding%20commercial%20terms."
                  target="_blank"
                  rel="noreferrer"
                  className="border border-white/20 hover:bg-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <UniversalFooter />
    </div>
  );
}
