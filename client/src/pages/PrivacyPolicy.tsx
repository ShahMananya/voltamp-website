import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  Database,
  Eye,
  FileCheck,
  FileText,
  Lock,
  Phone,
  Printer,
  Search,
  ShieldCheck,
  UserCheck,
  Truck,
  RotateCcw
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";

interface PrivacySection {
  number: number;
  title: string;
  lead?: string;
  paragraphs: string[];
  subsections?: {
    subtitle: string;
    text: string;
  }[];
  bullets?: string[];
  callout?: string;
}

const privacySections: PrivacySection[] = [
  {
    number: 1,
    title: "Information We Collect",
    lead: "We collect personal and commercial information necessary to process orders and provide electrical wire distribution services, including:",
    paragraphs: [],
    subsections: [
      {
        subtitle: "Contact & Business Details",
        text: "Name, company name, tax registration / GST ID, billing address, shipping address, email address, and primary phone number."
      },
      {
        subtitle: "Transaction & Order Data",
        text: "Order history, wire specifications/quantities, payment records, bank transfer confirmations, and delivery acknowledgements."
      },
      {
        subtitle: "Technical Data",
        text: "IP address, browser type, device information, and site usage metrics collected when accessing our customer web portal."
      }
    ]
  },
  {
    number: 2,
    title: "How We Use Your Information",
    lead: "Your information is used strictly for core business operations:",
    paragraphs: [],
    bullets: [
      "Processing, fulfilling, and delivering wire and cable orders to your job site or warehouse.",
      "Issuing Tax Invoices, Delivery Challans, E-Way bills, tax receipts, and order milestone updates.",
      "Managing customer accounts, credit records, and providing technical support.",
      "Complying with statutory, regulatory, and GST/tax compliance obligations under Indian law."
    ]
  },
  {
    number: 3,
    title: "Data Sharing & Disclosure",
    lead: "We do not sell, trade, or rent your personal or commercial data. Information is shared strictly on a need-to-know basis with authorized entities:",
    paragraphs: [],
    callout: "VOLAMP adheres to a strict zero-monetization data policy: your commercial data, specifications, and project purchases are never sold or marketed to third parties.",
    bullets: [
      "Freight partners, dedicated transporters, and logistics couriers to execute and coordinate deliveries.",
      "Payment processors and banking institutions to securely handle financial transactions (NEFT / RTGS / payment gateways).",
      "Regulatory, statutory, or law enforcement bodies when mandated by applicable law, court order, or tax audit."
    ]
  },
  {
    number: 4,
    title: "Data Security & Retention",
    lead: "We maintain physical, technical, and administrative security measures to protect your information against unauthorized access, alteration, or loss.",
    paragraphs: [
      "All digital transactions, quote records, and customer accounts are guarded behind role-based access controls and encrypted databases.",
      "Commercial and tax records are retained only as long as necessary to fulfill operational business purposes and meet statutory record-keeping periods under Indian tax and corporate laws."
    ]
  },
  {
    number: 5,
    title: "Your Rights & Account Control",
    lead: "You retain full control over your business and personal contact details stored in our systems:",
    paragraphs: [
      "You may contact our operations and billing desk at any time to request access to, updates for, or correction of your contact, address, or GST information.",
      "To update registered recipient details for consignment tracking or invoice dispatch, contact our support desk in writing."
    ],
    bullets: [
      "Request a copy of your historical orders and invoice records.",
      "Update company billing address, delivery site addresses, or authorized contact persons.",
      "Correct tax identification or GST details for upcoming billing cycles."
    ]
  }
];

export default function PrivacyPolicy() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<number | null>(null);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return privacySections;
    const q = searchQuery.toLowerCase();
    return privacySections.filter(
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
    const url = `${window.location.origin}/privacy-policy#section-${secNum}`;
    navigator.clipboard.writeText(url);
    toast.success("Section link copied to clipboard", {
      description: `Link for Section ${secNum}: ${privacySections.find((s) => s.number === secNum)?.title}`
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
              <span className="policy-brand-badge">LEGAL & PRIVACY</span>
            </div>
          </div>

          <div className="policy-nav-actions">
            {/* Policy Switcher */}
            <div className="policy-switcher-pills">
              <Link href="/shipping-policy" className="policy-switch-pill">
                <Truck className="size-3.5" />
                <span>Shipping Policy</span>
              </Link>
              <Link href="/privacy-policy" className="policy-switch-pill is-active">
                <Lock className="size-3.5" />
                <span>Privacy Policy</span>
              </Link>
              <Link href="/refund-policy" className="policy-switch-pill">
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
                <div className="policy-doc-icon-box" style={{ background: "linear-gradient(135deg, #0c2b44, #0e4e7e)" }}>
                  <Lock className="size-7" />
                </div>
                <div>
                  <span className="policy-org-eyebrow">VOLAMP ELEKTRIKALS PRIVATE LIMITED</span>
                  <h1 className="policy-main-title">PRIVACY POLICY</h1>
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
                  <small>DOCUMENT CLASSIFICATION</small>
                  <strong>Commercial Privacy Policy</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <FileCheck className="size-4" />
                <div>
                  <small>DATA GOVERNANCE</small>
                  <strong>Zero-Monetization Standard</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <Calendar className="size-4" />
                <div>
                  <small>LAST UPDATED</small>
                  <strong>September 2026</strong>
                </div>
              </div>

              <div className="policy-meta-item">
                <ShieldCheck className="size-4" />
                <div>
                  <small>COMPLIANCE</small>
                  <strong>Statutory & Tax Law</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Privacy Highlights */}
      <section className="policy-summary-strip">
        <div className="policy-container">
          <div className="policy-summary-grid">
            <div className="policy-summary-card">
              <div className="summary-card-icon">
                <Database className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>Operational Data Only</h4>
                <p>We collect only contact, tax/GST ID, and order details strictly needed to fulfill wire shipments.</p>
              </div>
            </div>

            <div className="policy-summary-card">
              <div className="summary-card-icon">
                <Eye className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>No Data Selling</h4>
                <p>We never sell, rent, or trade your commercial information or purchase history with third parties.</p>
              </div>
            </div>

            <div className="policy-summary-card">
              <div className="summary-card-icon">
                <ShieldCheck className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>Encrypted & Protected</h4>
                <p>Role-based access controls and encrypted storage safeguard your commercial documents and invoices.</p>
              </div>
            </div>

            <div className="policy-summary-card">
              <div className="summary-card-icon">
                <UserCheck className="size-5" />
              </div>
              <div className="summary-card-content">
                <h4>Full Account Control</h4>
                <p>Request updates, address changes, or billing corrections at any time via the supply desk.</p>
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
                <span className="toc-count">{privacySections.length} Sections</span>
              </div>

              {/* Search */}
              <div className="policy-search-box">
                <Search className="size-3.5 policy-search-icon" />
                <input
                  type="text"
                  placeholder="Filter privacy terms..."
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

              <nav className="policy-toc-nav" aria-label="Privacy Sections">
                {privacySections.map((sec) => {
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
                  <strong>Privacy & Records Desk</strong>
                </div>
                <p>Need to update company GST records, shipping addresses, or request invoice archives?</p>
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
                  <div className="clause-number-badge">
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

                  {sec.subsections && (
                    <div className="space-y-3 my-2">
                      {sec.subsections.map((sub, sIdx) => (
                        <div key={sIdx} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                          <strong className="block text-sm font-bold text-sky-900 dark:text-sky-300 mb-1">
                            {sub.subtitle}
                          </strong>
                          <p className="text-sm text-slate-600 dark:text-slate-300 m-0 leading-relaxed">
                            {sub.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.callout && (
                    <div className="p-3.5 my-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 text-sm font-medium">
                      {sec.callout}
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
                <span className="signoff-for">OFFICIAL DECLARATION</span>
                <h3>For VOLAMP ELEKTRIKALS PRIVATE LIMITED</h3>
                <p>
                  This Privacy Policy sets forth our institutional commitments to protecting client data, commercial
                  integrity, and statutory tax compliance. For any privacy queries or data correction requests, please
                  contact our registered office in Ahmedabad, Gujarat.
                </p>
                <div className="signoff-meta">
                  <span>Registered Office: Ahmedabad, Gujarat</span>
                  <span>·</span>
                  <span>Support: +91 9512365582</span>
                  <span>·</span>
                  <span>GST & Commercial Records Compliant</span>
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
            <Link href="/refund-policy" className="footer-link">
              Refund Policy
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
