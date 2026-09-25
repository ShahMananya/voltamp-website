import { useState } from "react";
import { Link, useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { EnquireModal } from "@/components/enquire/EnquireModal";
import FloatingActions from "@/components/FloatingActions";
import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Building2,
  Cable,
  Check,
  ChevronDown,
  Cpu,
  ExternalLink,
  Factory,
  Headphones,
  Layers,
  MessageCircle,
  MessageSquare,
  ShieldCheck,
  Sliders,
  Sparkles,
  SunMedium,
  X,
  Zap,
} from "lucide-react";

export type SegmentItem = {
  id: string;
  number: string;
  title: string;
  icon: typeof Cable;
  tagline: string;
  lead: string;
  paragraphs: string[];
  keyProducts: string[];
  targetAudience: string[];
  badgeColor: string;
};

export const businessSegmentsData: SegmentItem[] = [
  {
    id: "wires-and-cables",
    number: "01",
    title: "Wires & Cables",
    icon: Cable,
    tagline: "The Core of Modern Electrification",
    lead: "Wires and cables are at the core of our business. We offer a broad range of electrical cables for residential, commercial, industrial, infrastructure and specialised applications.",
    paragraphs: [
      "Our portfolio includes building wires, flexible cables, LT cables, armoured and unarmoured cables, copper and aluminium cables, industrial cables, solar cables, instrumentation cables, communication cables and other specialised cable solutions.",
      "We work with leading electrical brands and our own certified manufacturing setups to provide customers with dependable products, competitive pricing and efficient availability.",
    ],
    keyProducts: [
      "Building Wires & House Wires (IS 694)",
      "Single & Multi-Core Flexible Cables",
      "LT Aluminium & Copper Armoured Cables (IS 7098)",
      "HT Power & Distribution Cables (up to 33 kV)",
      "Instrumentation & Shielded Control Cables",
      "Fire-Survival & Zero-Halogen (FRLS / ZHFR) Cables",
    ],
    targetAudience: ["Contractors", "Builders", "Industrial Plants", "Utilities"],
    badgeColor: "#1d73b7",
  },
  {
    id: "switchgear-protection",
    number: "02",
    title: "Switchgear & Electrical Protection",
    icon: ShieldCheck,
    tagline: "Safety, Reliability & Fault Containment",
    lead: "Our switchgear business provides essential products for electrical protection, control and distribution across low, medium and industrial voltage levels.",
    paragraphs: [
      "Our portfolio includes MCBs, MCCBs, RCCBs, RCBOs, isolators, contactors, relays, changeover solutions, distribution boards and related electrical protection products.",
      "We serve residential, commercial and industrial requirements with products designed to support safe, reliable and efficient electrical systems that trip accurately under fault conditions.",
    ],
    keyProducts: [
      "Miniature Circuit Breakers (MCB - up to 63A/100A)",
      "Molded Case Circuit Breakers (MCCB - up to 2500A)",
      "Residual Current Circuit Breakers (RCCB & RCBO)",
      "Air Circuit Breakers (ACB) & Manual/Auto Changeovers",
      "Industrial Power Contactors & Thermal Overload Relays",
      "Distribution Boards (SPN, TPN & Vertical DBs)",
    ],
    targetAudience: ["Panel Builders", "Commercial Facilities", "EPC Contractors", "Maintenance Teams"],
    badgeColor: "#d97818",
  },
  {
    id: "distribution-control",
    number: "03",
    title: "Electrical Distribution & Control",
    icon: Cpu,
    tagline: "Integrated Power Management from Source to Load",
    lead: "Volamp supplies products required for the distribution and control of electrical power across commercial and industrial installations.",
    paragraphs: [
      "Our offering includes distribution boards, electrical control components, protection devices, panel components, metering products and allied electrical equipment.",
      "By combining cables, switchgear and distribution products, we enable customers to consolidate a larger portion of their electrical procurement through a single supply partner.",
    ],
    keyProducts: [
      "Sub-Distribution Panels & Enclosures",
      "Energy Meters & Digital Multifunction Power Monitors",
      "Busbar Chambers & Copper/Aluminium Busbars",
      "Selector Switches, Push Buttons & Indicating Lamps",
      "Current Transformers (CT) & Potential Transformers (PT)",
      "Surge Protective Devices (SPD Type 1 + 2)",
    ],
    targetAudience: ["Commercial Complexes", "Industrial Plants", "Hospitals & Institutions", "EPCs"],
    badgeColor: "#0b2b46",
  },
  {
    id: "industrial-electricals",
    number: "04",
    title: "Industrial Electricals",
    icon: Factory,
    tagline: "Rugged Components for Continuous Operations",
    lead: "We cater to the electrical requirements of manufacturing facilities, factories, infrastructure companies and industrial projects.",
    paragraphs: [
      "Our industrial portfolio covers power and control cables, instrumentation products, industrial connectivity, protection equipment, electrical components and other products used across industrial electrical systems.",
      "Our focus is on providing reliable product availability, technical product understanding and responsive supply to industrial customers.",
    ],
    keyProducts: [
      "Heavy-Duty Industrial Connectors & Plugs/Sockets",
      "Variable Frequency Drive (VFD) Shielded Cables",
      "Industrial Limit Switches & Proximity Sensors",
      "Motor Protection Circuit Breakers (MPCB)",
      "Harmonic Filters & Power Factor Correction Units",
      "High-Temperature & Silicon Rubber Cables",
    ],
    targetAudience: ["Chemical & Pharma Plants", "Textile & Steel Mills", "OEM Manufacturers", "Heavy Industries"],
    badgeColor: "#1d73b7",
  },
  {
    id: "cable-management",
    number: "05",
    title: "Cable Management & Electrical Accessories",
    icon: Layers,
    tagline: "Clean, Organized & Protected Cable Routing",
    lead: "A reliable electrical installation requires more than cables and switchgear. Proper cable management protects the physical integrity of your conductors.",
    paragraphs: [
      "Volamp is expanding its portfolio of cable management and allied electrical accessories, including cable glands, cable lugs, termination accessories, cable trays, cable ladders, trunking, clamps, connectors and related installation products.",
      "These products complement our core cable business and help customers source multiple electrical requirements from one platform.",
    ],
    keyProducts: [
      "Brass Cable Glands (Single & Double Compression, Weatherproof/Flameproof)",
      "Heavy-Duty Copper & Aluminium Cable Lugs & Ferrules (Crimping Type)",
      "Perforated & Ladder-Type Cable Trays (GI, Powder-Coated, Stainless Steel)",
      "Cable Ties, Heat Shrinkable Sleeves & Insulation Tapes",
      "PVC & Metal Raceways, Trunking & Floor Ducts",
      "Trefoil Clamps & Cable Cleats for High-Fault Cables",
    ],
    targetAudience: ["Cable Pulling Teams", "Electrical Contractors", "Data Centers", "Substation Builders"],
    badgeColor: "#d97818",
  },
  {
    id: "earthing-lightning",
    number: "06",
    title: "Earthing & Lightning Protection",
    icon: Zap,
    tagline: "Zero-Compromise Life & Equipment Safety",
    lead: "Electrical safety and system protection are critical components of every electrical installation. Low-resistance earth paths protect lives and expensive electronic machinery.",
    paragraphs: [
      "Our earthing and protection portfolio includes earthing products, electrodes, strips, clamps, connection accessories and related electrical safety products.",
      "We support contractors, industries and project customers with products required for safe and dependable electrical installations.",
    ],
    keyProducts: [
      "Copper-Bonded & Pure Copper Earth Rods (UL/IS Certified)",
      "Chemical Earthing Electrodes & Conductive Backfill Compounds",
      "GI & Copper Earthing Strips / Flats (All standard widths)",
      "Early Streamer Emission (ESE) Lightning Arresters & Conventional Spikes",
      "Exothermic Welding Molds, Powders & Clamps",
      "Earth Pit Chambers & Heavy-Duty Concrete Inspection Covers",
    ],
    targetAudience: ["Solar Farms", "Substations", "Commercial Towers", "Telecom & Data Centers"],
    badgeColor: "#0b2b46",
  },
  {
    id: "solar-electrical",
    number: "07",
    title: "Solar Electrical Solutions",
    icon: SunMedium,
    tagline: "Balance of System (BOS) for Renewable Energy",
    lead: "As renewable energy adoption continues to grow, Volamp is developing capabilities to serve the complete electrical requirements of solar projects.",
    paragraphs: [
      "Our solar electrical portfolio includes solar cables, DC and AC protection products, connectors, distribution equipment, earthing products and other Balance of System (BOS) components.",
      "We aim to support solar EPCs, installers, contractors and project developers with dependable electrical products and efficient supply.",
    ],
    keyProducts: [
      "Electron-Beam Cross-Linked Solar DC Cables (1.5 kV DC, EN 50618 / TUV)",
      "MC4 Connectors, Branch Connectors & Crimping Tools",
      "Solar Array Junction Boxes (AJB) & String Monitoring Boxes (SMB)",
      "DC Isolators, DC Fuses & DC Surge Protection Devices (SPD 1000V/1500V)",
      "AC Distribution Boxes (ACDB) & LT Panels for Inverters",
      "Solar Earthing Flats & Dedicated Chemical Earthing Kits",
    ],
    targetAudience: ["Solar EPCs", "Rooftop Installers", "Utility-Scale Developers", "Green Energy Contractors"],
    badgeColor: "#d97818",
  },
  {
    id: "ev-charging-infra",
    number: "08",
    title: "EV Charging Infrastructure",
    icon: BatteryCharging,
    tagline: "Powering the Transition to Electric Mobility",
    lead: "The transition towards electric mobility is creating new requirements across electrical distribution and charging infrastructure.",
    paragraphs: [
      "Volamp is developing its EV electrical portfolio across charging-related cables, protection equipment, distribution products, connectors and allied electrical components.",
      "Our objective is to support businesses, infrastructure developers and EV ecosystem partners with the electrical products required to build reliable charging infrastructure.",
    ],
    keyProducts: [
      "EV Charging Station Supply Cables (High-Ampacity Heavy-Duty Cu/Al)",
      "Type 2 EV Charging Gun Assemblies & Charging Cables",
      "Dedicated EV Distribution Boards with Built-in Residual Current & Surge Units",
      "Smart Metering Units & Energy Management Interfaces",
      "Dynamic Load Balancing Compatible Circuit Breakers",
      "Weatherproof Outdoor Enclosures (IP65/IP66 Rating)",
    ],
    targetAudience: ["Fleet Operators", "EV Charging Station Developers", "Commercial Hubs", "Municipalities"],
    badgeColor: "#1d73b7",
  },
  {
    id: "panels-automation",
    number: "09",
    title: "Electrical Panels & Automation",
    icon: Sliders,
    tagline: "Custom Built Control for Smart Industrial Systems",
    lead: "As our capabilities evolve, Volamp is expanding towards electrical panels, control systems and industrial automation products.",
    paragraphs: [
      "This segment can include LT panels, PCC, MCC, APFC, AMF, ATS, control panels, PLCs, VFDs, industrial control components and related automation products.",
      "By combining products from multiple electrical categories, we aim to provide customers with more integrated solutions for industrial and commercial applications.",
    ],
    keyProducts: [
      "Power Control Centers (PCC) & Motor Control Centers (MCC)",
      "Automatic Power Factor Correction (APFC) Panels with Detuned Reactors",
      "Auto Mains Failure (AMF) & Automatic Transfer Switch (ATS) Panels",
      "Programmable Logic Controllers (PLC) & Human Machine Interfaces (HMI)",
      "Variable Frequency Drives (VFD) for Precision Motor Speed Control",
      "Custom PLC Automation & Remote SCADA Enclosures",
    ],
    targetAudience: ["Industrial Automation Engineers", "Process Plants", "HVAC Contractors", "Facility Managers"],
    badgeColor: "#0b2b46",
  },
  {
    id: "project-institutional-supply",
    number: "10",
    title: "Project & Institutional Electrical Supply",
    icon: Building2,
    tagline: "End-to-End Turnkey Procurement for Large Projects",
    lead: "Volamp serves the electrical procurement requirements of contractors, EPC companies, industries, infrastructure developers, government contractors, builders and institutional customers.",
    paragraphs: [
      "Our multi-category product portfolio enables us to supply electrical materials across different stages of a project — from cables and switchgear to accessories, protection, distribution and allied products.",
      "Our focus is on product availability, competitive commercial terms, responsive service and dependable delivery.",
    ],
    keyProducts: [
      "Consolidated Multi-Category Bill of Materials (BOM) Supply",
      "30-Day Institutional Credit Lines & Bank Tie-Up Financing",
      "Manufacturer Test Certificates (MTC) & Type Test Reports for All Supplies",
      "Dedicated Project Account Manager & Fast-Track Logistics",
      "Phased On-Site Delivery Synchronized with Construction Milestones",
      "Specialized Government Tender & GeM Portal Supply Fulfillment",
    ],
    targetAudience: ["Infrastructure Developers", "Government Contractors", "General EPCs", "Turnkey Builders"],
    badgeColor: "#1d73b7",
  },
];

export default function BusinessSegments() {
  const [, navigate] = useLocation();
  const [selectedSegment, setSelectedSegment] = useState<string>("all");
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [inquiryCategory, setInquiryCategory] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");

  const handleOpenInquiry = (categoryName: string) => {
    setInquiryCategory(categoryName);
    setInquiryModalOpen(true);
  };

  const handleSendInquiry = () => {
    if (!customerContact) {
      toast.error("Contact details required", {
        description: "Please share your phone number or email so our supply desk can respond.",
      });
      return;
    }
    toast.success("Enquiry noted with Supply Desk", {
      description: `Requirement for ${inquiryCategory || "Business Segments"} received. A Volamp specialist will reach out shortly.`,
    });
    setInquiryModalOpen(false);
    setCustomerName("");
    setCustomerContact("");
    setCustomerNotes("");
  };

  const filteredSegments =
    selectedSegment === "all"
      ? businessSegmentsData
      : businessSegmentsData.filter((s) => s.id === selectedSegment);

  return (
    <div className="business-segments-page">
      {/* Top Navbar */}
      <header className="segments-navbar">
        <div className="segments-nav-inner">
          <div className="segments-nav-left">
            <Link href="/" className="segments-back-btn">
              <ArrowLeft className="size-4" /> Back to Home
            </Link>
            <div className="segments-brand">
              <img src="/volamp-logo.png" alt="VOLAMP Elektrikals" />
            </div>
          </div>
          <div className="segments-nav-right">
            <ThemeToggle />
            <Link
              href="/collaborate"
              className="segments-collab-link"
            >
              Collaborate with us <ArrowRight className="size-3.5" />
            </Link>
            <Button
              onClick={() => handleOpenInquiry("General Business Segments")}
              className="segments-quote-btn"
            >
              Request a Quote <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="segments-hero">
        <div className="segments-container">
          <div className="segments-hero-badge">
            <Sparkles className="size-3.5 text-amber-400" />
            <span>POWERING BUSINESSES WITH COMPLETE ELECTRICAL SOLUTIONS</span>
          </div>
          <h1>Our Business Segments</h1>
          <p className="segments-hero-lead">
            At <strong>Volamp Elektrikals Private Limited</strong>, we are building a comprehensive
            electrical distribution and solutions platform serving industries, contractors,
            infrastructure companies, EPCs, institutions and commercial businesses.
          </p>
          <p className="segments-hero-sub">
            With a strong foundation in wires and cables, our portfolio is expanding across
            switchgear, electrical distribution, industrial electricals and allied products. Our
            objective is simple — to make electrical procurement faster, more reliable and more
            efficient for our customers.
          </p>

          {/* Quick Metrics Bar */}
          <div className="segments-metrics-grid">
            <div className="metric-pill">
              <strong>10</strong>
              <span>Specialized Segments</span>
            </div>
            <div className="metric-pill">
              <strong>60+</strong>
              <span>Years Legacy</span>
            </div>
            <div className="metric-pill">
              <strong>28+</strong>
              <span>States Covered</span>
            </div>
            <div className="metric-pill">
              <strong>1</strong>
              <span>Single Supply Partner</span>
            </div>
          </div>

          {/* Segment Jump / Filter Tabs */}
          <div className="segments-jump-bar">
            <span className="jump-label">Filter or Jump to Segment:</span>
            <div className="jump-pills">
              <button
                className={`jump-btn ${selectedSegment === "all" ? "active" : ""}`}
                onClick={() => setSelectedSegment("all")}
              >
                All 10 Segments
              </button>
              {businessSegmentsData.map((seg) => (
                <button
                  key={seg.id}
                  className={`jump-btn ${selectedSegment === seg.id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedSegment(seg.id);
                    document.getElementById(seg.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {seg.number}. {seg.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Segments Content Showcase */}
      <main className="segments-main">
        <div className="segments-container">
          <div className="segments-cards-stack">
            {filteredSegments.map((segment) => {
              const Icon = segment.icon;
              return (
                <article
                  key={segment.id}
                  id={segment.id}
                  className="segment-card"
                >
                  <div className="segment-card-header">
                    <div className="segment-num-wrap">
                      <span className="segment-num">{segment.number}</span>
                      <div className="segment-icon-box">
                        <Icon className="size-6 text-amber-500" />
                      </div>
                    </div>
                    <div className="segment-title-wrap">
                      <span className="segment-tagline">{segment.tagline}</span>
                      <h2>{segment.title}</h2>
                    </div>
                    <Button
                      onClick={() => handleOpenInquiry(segment.title)}
                      className="segment-enquire-btn ml-auto"
                    >
                      Enquire for this Segment <ArrowRight className="ml-1.5 size-4" />
                    </Button>
                  </div>

                  <div className="segment-body-grid">
                    <div className="segment-text-column">
                      <p className="segment-lead">{segment.lead}</p>
                      {segment.paragraphs.map((para, i) => (
                        <p key={i} className="segment-para">
                          {para}
                        </p>
                      ))}

                      <div className="segment-target-box">
                        <span className="target-label">Target Segments & Applications:</span>
                        <div className="target-pills">
                          {segment.targetAudience.map((aud) => (
                            <span key={aud} className="target-pill">
                              <Check className="size-3 text-emerald-500 inline mr-1" />
                              {aud}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="segment-products-column">
                      <h3>Core Products & Capabilities</h3>
                      <ul className="product-list">
                        {segment.keyProducts.map((prod, idx) => (
                          <li key={idx}>
                            <span className="prod-bullet" />
                            <span>{prod}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="segment-collab-cta">
                        <span>Need project-specific sizing or bulk pricing?</span>
                        <button
                          onClick={() => handleOpenInquiry(segment.title)}
                          className="text-amber-500 hover:text-amber-600 font-bold inline-flex items-center gap-1 text-sm mt-1"
                        >
                          Request Technical Sheet & Quote <ArrowRight className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      {/* Vision & Single Partner Banner */}
      <section className="segments-vision-section">
        <div className="segments-container">
          <div className="vision-card">
            <span className="market-kicker">OUR LONG-TERM VISION</span>
            <h2>One Partner. Multiple Electrical Requirements.</h2>
            <p>
              Our long-term vision is to evolve from a traditional electrical distributor into a
              comprehensive electrical products and solutions partner.
            </p>
            <p>
              By bringing together <strong>Wires & Cables</strong>, <strong>Switchgear</strong>,{" "}
              <strong>Electrical Distribution</strong>, <strong>Industrial Electricals</strong>,{" "}
              <strong>Cable Management</strong>, <strong>Earthing & Protection</strong>,{" "}
              <strong>Solar BOS</strong>, <strong>EV Infrastructure</strong>,{" "}
              <strong>Automation Panels</strong> and <strong>Turnkey Project Supply</strong>, Volamp
              aims to simplify electrical procurement for customers across multiple industries.
            </p>
            <div className="vision-brand-quote">
              <strong>Volamp Elektrikals</strong>
              <small>Connecting Products. Powering Businesses. Building Partnerships.</small>
            </div>
            <div className="vision-actions">
              <Link
                href="/collaborate"
                className="vision-collab-btn"
              >
                Collaborate with us <ArrowRight className="size-4" />
              </Link>
              <Button
                onClick={() => handleOpenInquiry("Turnkey Supply Partnership")}
                className="vision-quote-btn"
              >
                Talk to Supply Desk <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Action Buttons */}
      <FloatingActions onOpenChat={() => (window.location.href = "/?surface=chat")} />

      {/* Inquiry Modal */}
      <EnquireModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        initialCategory={inquiryCategory}
      />

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="market-container footer-columns">
          <div className="footer-column footer-company">
            <div className="segments-brand-footer">
              <img src="/volamp-logo.png" alt="VOLAMP Elektrikals" />
            </div>
            <span className="footer-column-title">ABOUT VOLAMP</span>
            <Link href="/about-volamp">About Us</Link>
            <Link href="/business-segments">Business Segments</Link>
            <Link href="/collaborate">
              Collaborate with Us
            </Link>
            <Link href="/shipping-policy">Shipping Policy</Link>
            <Link href="/refund-policy">Return & Refund Policy</Link>
          </div>
          <div className="footer-column">
            <span className="footer-column-title">OUR 10 SEGMENTS</span>
            {businessSegmentsData.slice(0, 5).map((seg) => (
              <button
                key={seg.id}
                onClick={() => {
                  setSelectedSegment(seg.id);
                  document.getElementById(seg.id)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {seg.number}. {seg.title}
              </button>
            ))}
          </div>
          <div className="footer-column">
            <span className="footer-column-title">FUTURE INFRASTRUCTURE</span>
            {businessSegmentsData.slice(5).map((seg) => (
              <button
                key={seg.id}
                onClick={() => {
                  setSelectedSegment(seg.id);
                  document.getElementById(seg.id)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {seg.number}. {seg.title}
              </button>
            ))}
          </div>
          <div className="footer-column footer-order-support">
            <span className="footer-column-title">SUPPLY DESK CONTACT</span>
            <div className="footer-support-phone">
              <span>HEADQUARTERS</span>
              <strong>Ahmedabad, Gujarat</strong>
              <small>Pan-India & International Export</small>
            </div>
            <div className="footer-support-phone">
              <span>PHONE & WHATSAPP</span>
              <a href="tel:+919512365582" className="footer-support-phone-link">
                <strong>+91 9512365582</strong>
              </a>
              <small>Direct desk response</small>
            </div>
          </div>
        </div>
        <div className="market-container footer-bottom">
          <span>Volamp Elektrikals Private Limited © 2026. All rights reserved.</span>
          <span>Connecting Products. Powering Businesses. Building Partnerships.</span>
        </div>
      </footer>
    </div>
  );
}
