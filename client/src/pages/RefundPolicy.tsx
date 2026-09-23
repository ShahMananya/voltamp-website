import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck,
  FileText,
  Lock,
  PackageX,
  Phone,
  Printer,
  RotateCcw,
  Scissors,
  Search,
  ShieldAlert,
  ShieldCheck,
  Truck
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";

interface RefundSection {
  number: number;
  title: string;
  lead?: string;
  paragraphs: string[];
  subsections?: {
    subtitle: string;
    text: string;
    tag?: string;
  }[];
  bullets?: string[];
  alert?: {
    title: string;
    text: string;
    type: "warning" | "info" | "success";
  };
}

const refundSections: RefundSection[] = [
  {
    number: 1,
    title: "All Sales Are Final",
    lead: "Due to the custom nature of spooled, measured, and cut electrical wire and cables, all sales are final.",
    paragraphs: [
      "We do not accept returns, offer refunds, or issue exchanges for changes of mind, inaccurate measurements provided by the buyer, or incorrect product or gauge selection.",
      "Custom electrical cabling is precision-measured and cut specifically to customer technical requirements and project specifications; once cut from manufacturer master reels, it cannot be restocked or resold."
    ],
    alert: {
      title: "Custom Cut & Spooled Material Notice",
      text: "Please verify all wire gauges, core specifications, insulation ratings, and required length calculations with your electrical engineer or contractor prior to confirming your Purchase Order.",
      type: "warning"
    }
  },
  {
    number: 2,
    title: "Order Cancellations & Changes",
    lead: "Order cancellation or modification policies depend strictly on the production status of your order:",
    paragraphs: [],
    subsections: [
      {
        subtitle: "Prior to Processing (Within 24 Hours)",
        tag: "Cancellation Permitted",
        text: "Order cancellations or alterations are accepted within 24 hours of order placement, provided the wire has not yet been cut, spooled, or dispatched from our central warehouse."
      },
      {
        subtitle: "After Processing & Cutting",
        tag: "Non-Cancellable",
        text: "Once wire has been cut to specified lengths, spooled on customized drums, or loaded for shipment, the order cannot be canceled, refunded, or modified under any circumstances."
      }
    ]
  },
  {
    number: 3,
    title: "Damaged, Defective, or Incorrect Shipments",
    lead: "Exceptions to our no-refund policy apply exclusively to verified manufacturing defects, incorrect items sent by us, or verified transit damage:",
    paragraphs: [],
    subsections: [
      {
        subtitle: "Delivery Inspection",
        text: "You must inspect all shipments immediately upon receipt before signing the LR (Lorry Receipt), POD (Proof of Delivery), or delivery confirmation document."
      },
      {
        subtitle: "48-Hour Reporting Window",
        text: "Damaged goods, defective materials, or discrepancies in wire length/gauge must be reported in writing to VOLAMP ELEKTRIKALS within 48 hours of delivery."
      },
      {
        subtitle: "Claim Verification Requirements",
        text: "Clear high-resolution photos or videos of the damage, defect, or label discrepancy, alongside pictures of the original packaging and signed delivery document, must accompany the claim."
      },
      {
        subtitle: "Resolution & Replacements",
        text: "Upon verification, we will replace the defective or incorrect items at no additional cost or issue a store credit. Returns will not be accepted without prior written Return Material Authorization (RMA)."
      }
    ]
  },
  {
    number: 4,
    title: "Shipping & Handling Costs",
    lead: "Logistics and freight cost allocations for returns and replacements are governed by the following stipulations:",
    paragraphs: [
      "Freight charges on approved replacement items for verified defective or incorrect orders will be fully covered by VOLAMP ELEKTRIKALS PRIVATE LIMITED.",
      "Freight charges for unauthorized returns, rejected deliveries without prior authorization, or items returned without an approved RMA will not be refunded, reimbursed, or accepted at our facilities."
    ],
    bullets: [
      "Approved warranty/defect replacements: Volamp bears 100% of return freight and replacement shipping.",
      "Unauthorized returns or customer measurement errors: Customer remains liable for all transport, detention, and storage costs."
    ]
  }
];

export default function RefundPolicy() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return refundSections;
    const q = searchQuery.toLowerCase();
    return refundSections.filter(
      (s) =>
        s.number.toString().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.lead?.toLowerCase().includes(q) ||
        s.paragraphs.some((p) => p.toLowerCase().includes(q)) ||
        s.subsections?.some((sub) => sub.subtitle.toLowerCase().includes(q) || sub.text.toLowerCase().includes(q)) ||
        s.bullets?.some((b) => b.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = (secNum: number) => {
    const url = `${window.location.origin}/refund-policy#section-${secNum}`;
    navigator.clipboard.writeText(url);
    toast.success("Section link copied to clipboard", {
      description: `Link for Section ${secNum}: ${refundSections.find((s) => s.number === secNum)?.title}`
    });
  };

  return (
    <div className="policy-page">
      {/* Top Navbar */}
      <header className="policy-navbar">
        <div className="policy-nav-container">
          <div className="policy-nav-left">
            <Link href="/" className="policy-back-btn">
              <ArrowLeft className="size-4" />
              <span>Back to Marketplace</span>
            </Link>
            <div className="policy-nav-brand">
              <img src="/volamp-logo.png" alt="VOLAMP" className="policy-brand-img" />
              <span className="policy-brand-badge">RETURNS & REFUNDS</span>
            </div>
          </div>

          <div className="policy-nav-actions">
            {/* Policy Switcher */}
            <div className="policy-switcher-pills">
              <Link href="/shipping-policy" className="policy-switch-pill">
                <Truck className="size-3.5" />
                <span>Shipping Policy</span>
              </Link>
              <Link href="/privacy-policy" className="policy-switch-pill">
                <Lock className="size-3.5" />
                <span>Privacy Policy</span>
              </Link>
              <Link href="/refund-policy" className="policy-switch-pill is-active">
                <RotateCcw className="size-3.5" />
                <span>Refund Policy</span>
              </Link>
            </div>

            <button type="button" className="policy-action-btn" onClick={handlePrint} title="Print or save as PDF">
              <Printer className="size-4" />
              <span>Print</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero / Document Metadata Banner */}
      <section className="policy-hero-banner">
        <div className="policy-container">
          <div className="policy-hero-card">
            <div className="policy-hero-top">
              <div className="policy-hero-identity">
                <div className="policy-doc-icon-box" style={{ background: "linear-gradient(135deg, #0c2b44, #a86214)" }}>
                  <RotateCcw className="size-7" />
                </div>
                <div>
                  <span className="policy-org-eyebrow">VOLAMP ELEKTRIKALS PRIVATE LIMITED</span>
                  <h1 className="policy-main-title">NO REFUND AND RETURN POLICY</h1>
                </div>
              </div>

              <div className="policy-status-pill">
                <span className="status-dot" />
                <span>OFFICIALLY ENFORCED</span>
              </div>
            </div>

            <div className="policy-meta-grid">
              <div className="policy-meta-item">
                <FileText className="size-4" />
                <div>
                  <small>POLICY CLASSIFICATION</small>
                  <strong>Custom Cut Wire & Cable Policy</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <Scissors className="size-4" />
                <div>
                  <small>PRODUCT STATUS</small>
                  <strong>All Custom Cut Sales Final</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <Clock className="size-4" />
                <div>
                  <small>DEFECT REPORTING</small>
                  <strong>Strict 48-Hour Window</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <ShieldCheck className="size-4" />
                <div>
                  <small>WARRANTY DEFECTS</small>
                  <strong>100% Free Replacement</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Summary Strip */}
      <section className="policy-summary-strip">
        <div className="policy-container">
          <div className="policy-summary-grid">
            <div className="policy-summary-card">
              <div className="summary-card-icon" style={{ background: "#fdf6ea", color: "#b36b17" }}>
                <Scissors className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>All Sales Final</h4>
                <p>Custom measured, spooled, and cut wire cannot be returned or exchanged for change of mind.</p>
              </div>
            </div>

            <div className="policy-summary-card">
              <div className="summary-card-icon" style={{ background: "#eef5fa", color: "#1d73b7" }}>
                <Clock className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>24h Cancellation Window</h4>
                <p>Cancellations accepted within 24 hours only if cutting, spooling, or dispatch has not commenced.</p>
              </div>
            </div>

            <div className="policy-summary-card">
              <div className="summary-card-icon" style={{ background: "#fdf6ea", color: "#b36b17" }}>
                <AlertCircle className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>48h Inspection Window</h4>
                <p>Transit damage, defects, or length discrepancies must be reported in writing within 48 hours.</p>
              </div>
            </div>

            <div className="policy-summary-card">
              <div className="summary-card-icon" style={{ background: "#eef5fa", color: "#1d73b7" }}>
                <Truck className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>Replacement Freight Paid</h4>
                <p>Volamp covers 100% of freight on verified manufacturing defects or shipping error replacements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="policy-body-section">
        <div className="policy-container policy-layout-split">
          {/* Sticky Table of Contents */}
          <aside className="policy-toc-sidebar">
            <div className="policy-toc-card">
              <div className="policy-toc-header">
                <h3>Table of Contents</h3>
                <span className="toc-count">{refundSections.length} Sections</span>
              </div>

              {/* Search */}
              <div className="policy-search-box">
                <Search className="size-3.5 policy-search-icon" />
                <input
                  type="text"
                  placeholder="Filter return terms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="policy-search-input"
                />
                {searchQuery && (
                  <button type="button" className="policy-search-clear" onClick={() => setSearchQuery("")}>
                    ×
                  </button>
                )}
              </div>

              <nav className="policy-toc-nav" aria-label="Refund Sections">
                {refundSections.map((sec) => {
                  const isMatch = filteredSections.some((fs) => fs.number === sec.number);
                  return (
                    <a
                      key={sec.number}
                      href={`#section-${sec.number}`}
                      className={`policy-toc-link ${!isMatch ? "is-dimmed" : ""} ${activeSection === sec.number ? "is-active" : ""}`}
                      onClick={() => setActiveSection(sec.number)}
                    >
                      <span className="toc-num">{sec.number.toString().padStart(2, "0")}</span>
                      <span className="toc-title">{sec.title}</span>
                    </a>
                  );
                })}
              </nav>

              <div className="policy-help-box">
                <div className="help-box-top">
                  <Phone className="size-4" />
                  <strong>Claims & Operations Desk</strong>
                </div>
                <p>Have an active delivery discrepancy or need to report transit damage within the 48-hour window?</p>
                <a href="tel:+919512365582" className="help-phone-btn">
                  Call +91 9512365582
                </a>
              </div>
            </div>
          </aside>

          {/* Sections List */}
          <section className="policy-clauses-container">
            {filteredSections.map((sec) => (
              <article
                key={sec.number}
                id={`section-${sec.number}`}
                className={`policy-clause-card ${activeSection === sec.number ? "is-highlighted" : ""}`}
              >
                <div className="clause-header">
                  <div className="clause-number-badge" style={{ background: "#0c2b44", color: "#f2b84b" }}>
                    <span>{sec.number.toString().padStart(2, "0")}</span>
                  </div>
                  <h2 className="clause-title">{sec.title}</h2>

                  <button
                    type="button"
                    className="clause-copy-btn"
                    onClick={() => handleCopyLink(sec.number)}
                    title="Copy link to this section"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>

                <div className="clause-body">
                  {sec.lead && <p className="clause-paragraph font-medium">{sec.lead}</p>}

                  {sec.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="clause-paragraph">
                      {p}
                    </p>
                  ))}

                  {sec.alert && (
                    <div className="p-4 my-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-2 font-bold text-sm mb-1">
                        <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                        <span>{sec.alert.title}</span>
                      </div>
                      <p className="text-sm m-0 leading-relaxed text-amber-800 dark:text-amber-300">
                        {sec.alert.text}
                      </p>
                    </div>
                  )}

                  {sec.subsections && (
                    <div className="space-y-3 my-2">
                      {sec.subsections.map((sub, sIdx) => (
                        <div key={sIdx} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                          <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
                            <strong className="text-sm font-bold text-sky-900 dark:text-sky-300">
                              {sub.subtitle}
                            </strong>
                            {sub.tag && (
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {sub.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-300 m-0 leading-relaxed">
                            {sub.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.bullets && (
                    <ul className="clause-bullet-list">
                      {sec.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="clause-bullet-item">
                          <CheckCircle2 className="size-4 bullet-icon" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}

            {/* Official Declaration Card */}
            <div className="policy-signoff-card">
              <div className="signoff-seal">
                <ShieldCheck className="size-8" />
              </div>
              <div className="signoff-text">
                <span className="signoff-for">OFFICIAL RETURN STIPULATION</span>
                <h3>For VOLAMP ELEKTRIKALS PRIVATE LIMITED</h3>
                <p>
                  This No Refund and Return Policy is binding on all sales, purchase orders, and commercial transactions
                  for custom measured and spooled wire products. Claims for transit damage or manufacturing defects must
                  be lodged in writing within 48 hours of receipt.
                </p>
                <div className="signoff-meta">
                  <span>Claims Desk: +91 9512365582</span>
                  <span>·</span>
                  <span>Reporting Window: 48 Hours Post-Delivery</span>
                  <span>·</span>
                  <span>RMA Required for Authorization</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="policy-footer">
        <div className="policy-container policy-footer-inner">
          <div className="policy-footer-left">
            <strong>VOLAMP ELEKTRIKALS PRIVATE LIMITED</strong>
            <small>Ahmedabad, Gujarat, India · Global & Domestic Electrical Supply Network</small>
          </div>

          <div className="policy-footer-right">
            <Link href="/" className="footer-link">
              Marketplace
            </Link>
            <span className="footer-dot">·</span>
            <Link href="/shipping-policy" className="footer-link">
              Shipping Policy
            </Link>
            <span className="footer-dot">·</span>
            <Link href="/privacy-policy" className="footer-link">
              Privacy Policy
            </Link>
            <span className="footer-dot">·</span>
            <a href="https://wa.me/919512365582" target="_blank" rel="noreferrer" className="footer-link">
              WhatsApp Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
