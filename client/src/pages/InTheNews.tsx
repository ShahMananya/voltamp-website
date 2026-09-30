import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import UniversalFooter from "@/components/layout/UniversalFooter";
import { useUserLocation } from "@/contexts/LocationContext";
import { useCart } from "@/contexts/CartContext";
import {
  Newspaper,
  Calendar,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Globe2,
  Building2,
  Share2,
  Menu,
  X,
  ShoppingCart,
  Phone,
  Mail,
  FileText,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

interface NewsArticle {
  id: string;
  title: string;
  source: string;
  sourceBadge: string;
  date: string;
  readTime: string;
  category: "press" | "dispatch" | "sustainability" | "corporate";
  summary: string;
  details: string[];
  link?: string;
  image?: string;
}

const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: "news-ahmedabad-mirror-2026",
    title: "Ahmedabad Mirror: Top 10 Inspiring Entrepreneurs in Ahmedabad to Watch in 2026 Features Naimil Vipul Patel (CEO, Volamp Elektrikals)",
    source: "Ahmedabad Mirror",
    sourceBadge: "AHMEDABAD MIRROR · REAL COVERAGE",
    date: "September 30, 2026",
    readTime: "3 min read",
    category: "press",
    summary:
      "Ahmedabad Mirror has named Naimil Vipul Patel, CEO and Director of Volamp Elektrikals Private Limited, among the Top 10 Inspiring Entrepreneurs in Ahmedabad to watch in 2026. The profile celebrates Volamp's transformation into a modern, technology-driven one-stop electrical distribution powerhouse across Gujarat and neighbouring markets, distributing leading brands including Polycab, KEI, and Finolex.",
    details: [
      "Recognized in Ahmedabad Mirror's prestigious 2026 business leadership list celebrating visionary entrepreneurs driving Gujarat's growth.",
      "Highlights Volamp's dependable one-stop multi-brand distribution serving contractors, infrastructure corporations, industries, dealers, and institutions.",
      "Spotlights Naimil Patel's vision: combining strong customer trust with technology-driven processes, efficient logistics, and data-based decision making.",
      "Affirms Volamp's commitment to sustainable expansion, verified manufacturer quality, competitive pricing, and prompt delivery across Western India.",
    ],
    link: "https://www.ahmedabadmirror.com/top-10-inspiring-entrepreneurs-in-ahmedabad-to-watch-in-2026/81922949.html",
    image: "/ahmedabad-mirror-top-10-entrepreneurs-2026.jpg",
  },
  {
    id: "news-metro-2025",
    title: "VOLAMP Elektrikals Dispatches 250km Specialized Armoured Power Cables for Metro Rail Expansion",
    source: "Infrastructure & EPC World Review",
    sourceBadge: "FEATURED STORY",
    date: "February 18, 2025",
    readTime: "4 min read",
    category: "dispatch",
    summary:
      "VOLAMP has successfully completed the expedited phase-1 delivery of over 250 route-kilometers of customized 33kV HT and 1.1kV LT XLPE flame-retardant armoured cables for a prominent metropolitan transit authority in Western India.",
    details: [
      "Custom drums manufactured to precise span lengths to eliminate on-site jointing.",
      "100% CPRI and ERDA type-tested reports verified prior to site offloading.",
      "Consignment dispatched in synchronized 48-hour batches to prevent site congestion.",
    ],
    image: "/products/cables.jpg",
  },
  {
    id: "news-global-export-2024",
    title: "VOLAMP Expands Global Electrical Supply Desk to Middle East & East Africa with 48h Turnaround",
    source: "Global Trade & Engineering Gazette",
    sourceBadge: "GLOBAL TRADE",
    date: "November 24, 2024",
    readTime: "3 min read",
    category: "corporate",
    summary:
      "With growing overseas infrastructure demand, Volamp Elektrikals has formalized its cross-border export desk, establishing dedicated logistics channels to the UAE, Saudi Arabia, Qatar, and Kenya.",
    details: [
      "Containerized sea-freight packing engineered with moisture-proof marine seals.",
      "Export documentation includes Chamber of Commerce legalization and MTC certification.",
      "Catering to multi-million dollar solar farms and industrial manufacturing plants.",
    ],
    image: "/products/solar.jpg",
  },
  {
    id: "news-zhfr-green-2024",
    title: "Eliminating Smoke Hazards: Why Commercial High-Rises Are Mandating Zero-Halogen Wiring",
    source: "Electrical India Magazine",
    sourceBadge: "SAFETY & TECH",
    date: "August 12, 2024",
    readTime: "5 min read",
    category: "sustainability",
    summary:
      "An in-depth technical analysis highlighting Volamp's advocacy for Zero-Halogen Flame-Retardant (ZHFR) wires in high-density hospitals, data centers, and IT tech parks, where smoke asphyxiation is the primary hazard during fires.",
    details: [
      "Zero toxic halogen acid gas generation (less than 0.5% compliance under IEC 60754-1).",
      "Over 80% light transmittance during fire conditions for safe emergency evacuation.",
      "Adopted by top tier EPC builders across Mumbai, NCR, and Bengaluru developments.",
    ],
    image: "/products/conduits.jpg",
  },
  {
    id: "news-digital-procurement-2024",
    title: "Four Generations of Trust: How Volamp is Digitalizing B2B Electrical Sourcing for Contractors",
    source: "The Economic Times - B2B Spotlight",
    sourceBadge: "MEDIA INTERVIEW",
    date: "April 05, 2024",
    readTime: "6 min read",
    category: "corporate",
    summary:
      "An exclusive feature on Volamp's four-decade legacy, tracing its growth from an Ahmedabad wire manufacturing pioneer to a technology-enabled turnkey electrical supply network with instant WhatsApp RFQs and automated cable calculators.",
    details: [
      "Serving over 4,500 electrical contractors, panel builders, and general EPCs.",
      "Introducing 30-day corporate credit lines to ease project contractor working capital.",
      "Multi-category product catalog spanning wires, switchgears, lugs, and conduits.",
    ],
    image: "/business-segments-hero.png?v=2",
  },
  {
    id: "news-solar-expansion-2023",
    title: "Industrial Clean Energy Transition: Solar DC Cables Gain 40% Surge in Volamp Sourcing",
    source: "Renewable Energy & Power Digest",
    sourceBadge: "GREEN ENERGY",
    date: "December 14, 2023",
    readTime: "4 min read",
    category: "sustainability",
    summary:
      "Volamp reports a record 40% uptick in UV-resistant solar DC cable requisitions and specialized DC switchgear orders across rooftop solar and utility-scale ground mount projects.",
    details: [
      "Cross-linked polyolefin insulated cables tested to EN 50618 and TUV standards.",
      "High thermal endurance (-40°C to +120°C) with guaranteed 25-year service life.",
      "Supplying turnkey BOS (Balance of System) packages for mega solar EPC tenders.",
    ],
    image: "/products/solar.jpg",
  },
  {
    id: "news-epc-credit-2023",
    title: "Bridging the Working Capital Gap: Volamp’s 30-Day Project Credit Model Empowers Builders",
    source: "Construction Week India",
    sourceBadge: "PROJECT FINANCING",
    date: "September 02, 2023",
    readTime: "3 min read",
    category: "press",
    summary:
      "A look into how Volamp's structured institutional credit facilities are enabling mid-market electrical contractors to bid and execute larger municipal, highway, and institutional tenders without cash-flow bottlenecks.",
    details: [
      "Direct bank tie-ups and invoice discounting support for approved contractors.",
      "Zero milestone supply delays, ensuring penalty-free project completion.",
      "Backed by audited financial health and verified manufacturer supply quotas.",
    ],
    image: "/products/switchgears.jpg",
  },
];

export default function InTheNews() {
  const [, navigate] = useLocation();
  const { location, openLocationPicker, isDetecting } = useUserLocation();
  const { totalCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredArticles =
    selectedFilter === "all"
      ? NEWS_ARTICLES
      : NEWS_ARTICLES.filter((article) => article.category === selectedFilter);

  const handleOpenRFQ = (articleTitle?: string) => {
    window.dispatchEvent(
      new CustomEvent("volamp:open-enquire", {
        detail: {
          category: "Complete Project Bill of Materials (BOM)",
          product: articleTitle ? `Press / Media Inquiry: ${articleTitle}` : "General Media / Supply Desk Inquiry",
        },
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] dark:bg-[#0b1723] text-[#142b40] dark:text-slate-100 transition-colors">
      {/* Top Utility Bar */}
      <div className="market-utility">
        <div className="market-container utility-inner">
          <button
            onClick={openLocationPicker}
            className="flex items-center gap-2 text-left text-[#c56718] dark:text-amber-300 hover:text-[#b45309] dark:hover:text-amber-400 transition-colors group cursor-pointer"
            title="Click to view or change your detected project location"
          >
            <span className={`status-dot ${isDetecting ? "animate-ping" : ""}`} />
            <Globe2 className="size-3.5 text-[#c56718] dark:text-amber-400 shrink-0" />
            <span className="font-semibold text-[#4d1217] dark:text-white group-hover:underline">
              {isDetecting && !location ? "Detecting location..." : location}
            </span>
            <ChevronDown className="inline size-3 text-[#c56718] dark:text-amber-400 opacity-80 group-hover:translate-y-0.5 transition-transform" />
          </button>
          <div>
            <span className="desktop-only text-[#5d4a4b] dark:text-slate-300">
              Media relations & corporate news desk · Volamp Elektrikals
            </span>
            <button onClick={() => navigate("/collaborate")} className="utility-collaborate">
              Collaborate with us <ArrowRight className="inline size-3" />
            </button>
            <button onClick={() => handleOpenRFQ()} className="font-semibold hover:underline">
              Contact press desk <ArrowRight className="inline size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="market-header">
        <div className="market-container market-header-top">
          <Link href="/">
            <div className="brand-mark cursor-pointer" aria-label="VOLAMP home">
              <img src="/volamp-logo.png" alt="VOLAMP Powering Growth" />
            </div>
          </Link>
          <nav className="market-nav">
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/category/wire-cables")}>Categories</button>
            <button onClick={() => navigate("/about-volamp")}>About Volamp</button>
            <button onClick={() => navigate("/business-segments")}>Business Segments</button>
            <button onClick={() => navigate("/careers")} className="market-nav-link">Careers</button>
            <button onClick={() => navigate("/collaborate")} className="market-nav-link">Collaborate</button>
          </nav>
          <div className="market-header-actions">
            <ThemeToggle />
            <button onClick={openCart} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:border-amber-400 transition-colors cursor-pointer">
              <ShoppingCart className="size-4 text-[#c56718]" />
              <span>Cart ({totalCount})</span>
            </button>
            <button onClick={() => handleOpenRFQ()} className="market-quote">
              Request a quote <ArrowRight className="ml-2 size-4" />
            </button>
            <button className="market-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="market-mobile-nav">
          <button onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button>
          <button onClick={() => { setMobileOpen(false); navigate("/"); }}>Home</button>
          <button onClick={() => { setMobileOpen(false); navigate("/about-volamp"); }}>About Volamp</button>
          <button onClick={() => { setMobileOpen(false); navigate("/business-segments"); }}>Business Segments</button>
          <button onClick={() => { setMobileOpen(false); navigate("/careers"); }}>Careers</button>
          <button onClick={() => { setMobileOpen(false); navigate("/collaborate"); }}>Collaborate with Us</button>
          <button onClick={() => { setMobileOpen(false); navigate("/certifications-and-awards"); }}>Certifications & Quality</button>
          <button onClick={() => { setMobileOpen(false); openCart(); }}>Shopping Cart ({totalCount})</button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="market-container py-3 text-xs text-[#71818c] dark:text-slate-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#4d1217] dark:hover:text-amber-300">Home</Link>
        <ChevronDown className="size-3 -rotate-90 text-stone-400" />
        <Link href="/about-volamp" className="hover:text-[#4d1217] dark:hover:text-amber-300">About Volamp</Link>
        <ChevronDown className="size-3 -rotate-90 text-stone-400" />
        <span className="font-semibold text-[#4d1217] dark:text-white">In the News</span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff6ed] via-[#fffaf5] to-[#fcfaf7] dark:from-[#0f1f30] dark:via-[#0b1723] dark:to-[#081018] py-14 sm:py-20 border-b border-[#ebd7c7] dark:border-slate-800">
        <div className="market-container relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-bold tracking-wider uppercase">
              <Newspaper className="size-3.5 text-[#c56718] dark:text-amber-400" />
              <span>MEDIA & PRESS COVERAGE</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white tracking-tight leading-[1.1]">
              VOLAMP in the News. <br />
              <span className="text-[#c56718] dark:text-amber-400">Milestones & Press Coverage.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5d4a4b] dark:text-slate-300 leading-relaxed font-['DM_Sans']">
              Explore media reports, major EPC project dispatches, sustainability initiatives, and corporate announcements from VOLAMP Elektrikals as we power critical civil, industrial, and clean-energy infrastructure across India and overseas.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleOpenRFQ("Press & Media Feature")}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c56718] to-[#b45309] hover:from-[#d97706] hover:to-[#c56718] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-900/20 active:scale-[0.98] transition-all cursor-pointer"
              >
                <Mail className="size-4" />
                <span>Contact Press Desk</span>
              </button>
              <button
                onClick={() => navigate("/blog")}
                className="px-5 py-3 rounded-xl border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-stone-50 text-xs font-bold text-stone-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Visit Engineering Blog <ArrowRight className="inline size-3.5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Headline Spotlight */}
      <section className="py-10 market-container">
        <div className="rounded-3xl bg-gradient-to-br from-[#2a080b] via-[#4d1217] to-[#731920] text-white p-7 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <img src="/ahmedabad-mirror-logo.svg" alt="Ahmedabad Mirror" className="h-3.5 invert brightness-200" />
                OFFICIAL PRESS FEATURE
              </span>
              <span className="text-xs text-amber-200 font-semibold">
                Ahmedabad Mirror · September 30, 2026
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Space_Grotesk'] leading-tight text-white">
              Ahmedabad Mirror: Naimil Vipul Patel Named Among Top 10 Inspiring Entrepreneurs in Ahmedabad to Watch in 2026
            </h2>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-['DM_Sans']">
              Under Naimil Patel's leadership as CEO & Director, Volamp Elektrikals has built a strong presence in the electrical distribution industry, specialising in multi-brand wires and cables from leading brands including KEI, Polycab, and Finolex. His business approach combines strong customer relationships with technology-driven processes, efficient operations, and data-based decision making.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-300">
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 font-medium">
                <BadgeCheck className="size-4 text-emerald-400" /> Top 10 Inspiring Entrepreneurs 2026
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 font-medium">
                <BadgeCheck className="size-4 text-emerald-400" /> Multi-Brand Cable Powerhouse
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 font-medium">
                <BadgeCheck className="size-4 text-emerald-400" /> Tech-Enabled B2B Supply Desk
              </span>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <a
                href="https://www.ahmedabadmirror.com/top-10-inspiring-entrepreneurs-in-ahmedabad-to-watch-in-2026/81922949.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 active:scale-95 transition-all cursor-pointer"
              >
                <span>Read Full Article on Ahmedabad Mirror</span>
                <ExternalLink className="size-4" />
              </a>
              <button
                onClick={() => handleOpenRFQ("Ahmedabad Mirror Feature Inquiry")}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Connect with Volamp Leadership
              </button>
            </div>
          </div>

          <div className="shrink-0 w-full lg:w-80 rounded-2xl overflow-hidden border border-white/20 bg-stone-900/60 shadow-2xl group">
            <img
              src="/ahmedabad-mirror-top-10-entrepreneurs-2026.jpg"
              alt="Ahmedabad Mirror Top 10 Inspiring Entrepreneurs in Ahmedabad 2026"
              className="w-full h-48 sm:h-56 object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
            <div className="p-4 bg-stone-950/80 backdrop-blur-md space-y-2 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                <div className="flex items-center gap-1.5">
                  <img src="/ahmedabad-mirror-logo.svg" alt="Ahmedabad Mirror" className="h-3 invert brightness-200" />
                  <span>Ahmedabad Mirror</span>
                </div>
                <span>Sep 2026</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-snug">
                Featuring Volamp Elektrikals CEO & Director Naimil Patel among Gujarat's top visionary leaders.
              </p>
              <a
                href="https://www.ahmedabadmirror.com/top-10-inspiring-entrepreneurs-in-ahmedabad-to-watch-in-2026/81922949.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 pt-1"
              >
                <span>View Live Publication</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-4 border-y border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-xs">
        <div className="market-container flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            {[
              { id: "all", label: "All News" },
              { id: "dispatch", label: "Project Dispatches" },
              { id: "corporate", label: "Corporate Updates" },
              { id: "sustainability", label: "Sustainability & Safety" },
              { id: "press", label: "Press Releases" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedFilter === tab.id
                    ? "bg-[#4d1217] text-white shadow-xs"
                    : "bg-stone-100 dark:bg-slate-800 text-stone-600 dark:text-slate-300 hover:bg-stone-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-stone-500 dark:text-slate-400 shrink-0 hidden sm:inline-block">
            Showing {filteredArticles.length} publications
          </span>
        </div>
      </section>

      {/* News Articles Grid */}
      <section className="py-14 sm:py-20 market-container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="rounded-2xl bg-white dark:bg-slate-800/90 border border-stone-200/90 dark:border-slate-700/80 p-6 flex flex-col justify-between hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-500/50 transition-all group overflow-hidden"
            >
              <div>
                {article.image && (
                  <div className="relative -mx-6 -mt-6 mb-4 h-48 overflow-hidden rounded-t-2xl bg-stone-100 dark:bg-slate-900 border-b border-stone-200 dark:border-slate-700">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    {article.link && (
                      <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                        <ExternalLink className="size-2.5" /> Official Press
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-[#c56718] dark:text-amber-400 border border-amber-500/30">
                    {article.sourceBadge}
                  </span>
                  <span className="text-[11px] text-stone-400 dark:text-slate-500">
                    {article.readTime}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-slate-400 mb-2">
                  <Calendar className="size-3.5 text-[#c56718]" />
                  <span>{article.date}</span>
                  <span className="mx-1">·</span>
                  <strong className="text-stone-700 dark:text-slate-300 font-semibold truncate">
                    {article.source}
                  </strong>
                </div>

                <h3 className="text-base sm:text-lg font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white leading-snug group-hover:text-[#c56718] transition-colors">
                  {article.title}
                </h3>

                <p className="text-xs text-stone-600 dark:text-slate-400 mt-3 leading-relaxed">
                  {article.summary}
                </p>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-slate-700/50 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-slate-500 block">
                    Key Highlights:
                  </span>
                  {article.details.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-stone-700 dark:text-slate-300">
                      <span className="text-[#c56718] font-bold text-xs leading-tight">&bull;</span>
                      <span className="text-[11px] leading-tight">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200 dark:border-slate-700 flex items-center justify-between">
                {article.link ? (
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Read Full Article on {article.source}</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => handleOpenRFQ(article.title)}
                    className="text-xs font-bold text-[#c56718] dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Request Full Press Release</span>
                    <ArrowRight className="size-3" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Press Inquiries / Media Contact */}
      <section className="py-14 market-container">
        <div className="rounded-2xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800/60 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white">
              Media & Press Relations Contact
            </h3>
            <p className="text-xs text-stone-600 dark:text-slate-400 max-w-xl">
              For journalist inquiries, executive commentary, high-resolution photography, or project case studies, connect directly with our corporate media office.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="mailto:press@volamp.com"
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-stone-300 dark:border-slate-600 text-xs font-bold text-stone-800 dark:text-white hover:bg-stone-100 flex items-center gap-2 transition-colors"
            >
              <Mail className="size-4 text-[#c56718]" />
              <span>press@volamp.com</span>
            </a>
            <a
              href="tel:+919512365582"
              className="px-5 py-2.5 rounded-xl bg-[#c56718] hover:bg-[#b45309] text-xs font-bold text-white flex items-center gap-2 shadow-sm transition-colors"
            >
              <Phone className="size-4" />
              <span>Call Media Desk</span>
            </a>
          </div>
        </div>
      </section>

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
