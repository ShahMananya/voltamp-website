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
  Globe2,
  Share2,
  Menu,
  ShoppingCart,
  Phone,
  Mail,
  BadgeCheck,
  Building2,
  Check,
  Sparkles,
  ShieldCheck,
  Award,
} from "lucide-react";
import { toast } from "sonner";

export default function InTheNews() {
  const [, navigate] = useLocation();
  const { location, openLocationPicker, isDetecting } = useUserLocation();
  const { totalCount, openCart } = useCart();
  const [copied, setCopied] = useState(false);

  const articleUrl =
    "https://www.ahmedabadmirror.com/top-10-inspiring-entrepreneurs-in-ahmedabad-to-watch-in-2026/81922949.html";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    toast.success("Article Link Copied!", {
      description: "Direct link to Ahmedabad Mirror publication copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenRFQ = (subject?: string) => {
    window.dispatchEvent(
      new CustomEvent("volamp:open-enquire", {
        detail: {
          category: "Corporate & Media Inquiry",
          product: subject || "Media Relations Inquiry",
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
              Media relations & verified press coverage · Volamp Elektrikals
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
            <div
              className="brand-mark bg-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-[#ebd7c7] shadow-xs hover:border-[#c56718] transition-all flex items-center justify-center cursor-pointer"
              aria-label="VOLAMP home"
            >
              <img src="/volamp-logo.png" alt="VOLAMP Powering Growth" className="h-7 sm:h-8 w-auto object-contain" />
            </div>
          </Link>
          <nav className="market-nav">
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={() => navigate("/category/wire-cables")}>Categories</button>
            <button onClick={() => navigate("/about-volamp")}>About Volamp</button>
            <button onClick={() => navigate("/business-segments")}>Business Segments</button>
            <button onClick={() => navigate("/careers")} className="market-nav-link">Careers</button>
            <button onClick={() => navigate("/collaborate")} className="market-nav-link">Collaborate</button>
            <button onClick={() => navigate("/in-the-news")} className="market-nav-link text-[#c56718] font-bold">In the News</button>
          </nav>
          <div className="market-header-actions">
            <ThemeToggle />
            <button
              onClick={openCart}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:border-amber-400 transition-colors cursor-pointer"
            >
              <ShoppingCart className="size-4 text-[#c56718]" />
              <span>Cart ({totalCount})</span>
            </button>
            <button onClick={() => handleOpenRFQ()} className="market-quote">
              Request a quote <ArrowRight className="ml-2 size-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Breadcrumb Bar */}
      <div className="market-container py-3.5 flex items-center gap-2 text-xs text-stone-500 dark:text-slate-400 border-b border-stone-100 dark:border-slate-800">
        <Link href="/" className="hover:text-[#4d1217] dark:hover:text-amber-300">Home</Link>
        <ChevronDown className="size-3 -rotate-90 text-stone-400" />
        <Link href="/about-volamp" className="hover:text-[#4d1217] dark:hover:text-amber-300">About Volamp</Link>
        <ChevronDown className="size-3 -rotate-90 text-stone-400" />
        <span className="font-semibold text-[#4d1217] dark:text-white">In the News</span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff6ed] via-[#fffaf5] to-[#fcfaf7] dark:from-[#0f1f30] dark:via-[#0b1723] dark:to-[#081018] py-12 sm:py-16 border-b border-[#ebd7c7] dark:border-slate-800">
        <div className="market-container relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center justify-center bg-white px-3 py-1.5 rounded-xl border border-[#ebd7c7] shadow-xs">
                <img src="/volamp-logo.png" alt="VOLAMP Elektrikals" className="h-7 sm:h-8 w-auto object-contain" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-red-700 dark:text-red-300 text-xs font-bold tracking-wider uppercase">
                <Newspaper className="size-3.5 text-red-600 dark:text-red-400" />
                <span>VERIFIED EDITORIAL COVERAGE · 100% AUTHENTIC PRESS</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white tracking-tight leading-[1.1]">
              VOLAMP in the News. <br />
              <span className="text-[#c56718] dark:text-amber-400">Media & Executive Spotlight.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5d4a4b] dark:text-slate-300 leading-relaxed font-['DM_Sans']">
              Explore authentic media coverage and official press features celebrating Volamp Elektrikals' leadership, regional electrical distribution footprint, and commitment to powering infrastructure across Gujarat and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Headline Spotlight: Ahmedabad Mirror */}
      <section className="py-10 market-container">
        <div className="rounded-3xl bg-gradient-to-br from-[#2a080b] via-[#4d1217] to-[#731920] text-white p-7 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 border border-white/10">
          <div className="space-y-5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <img src="/ahmedabad-mirror-logo.svg" alt="Ahmedabad Mirror" className="h-3.5 invert brightness-200" />
                EXCLUSIVE PRESS FEATURE
              </span>
              <span className="text-xs text-amber-200 font-semibold flex items-center gap-1">
                <Calendar className="size-3.5" /> Published: September 30, 2026
              </span>
              <span className="text-xs text-stone-300 hidden sm:inline">·</span>
              <span className="text-xs text-stone-300 hidden sm:inline">Ahmedabad Mirror (Times Group Network)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Space_Grotesk'] leading-tight text-white">
              Ahmedabad Mirror: Naimil Vipul Patel Named Among Top 10 Inspiring Entrepreneurs in Ahmedabad to Watch in 2026
            </h2>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-['DM_Sans'] italic bg-white/5 p-4 rounded-xl border border-white/10">
              “Under his leadership, Volamp has built a strong presence in the electrical industry, specialising in the distribution of multi-brand wires and cables from leading brands such as KEI, Polycab and Finolex. His business approach combines strong customer relationships with technology-driven processes, efficient operations and data-based decision-making.”
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-stone-300">
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 font-semibold">
                <Award className="size-4 text-amber-400" /> Top 10 Inspiring Entrepreneurs 2026
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 font-semibold">
                <ShieldCheck className="size-4 text-emerald-400" /> Multi-Brand Cable Powerhouse
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 font-semibold">
                <Building2 className="size-4 text-sky-400" /> Technology-Driven B2B Operations
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 active:scale-95 transition-all cursor-pointer"
              >
                <span>Read Original Article on Ahmedabad Mirror</span>
                <ExternalLink className="size-4" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="size-4 text-emerald-400" /> : <Share2 className="size-4" />}
                <span>{copied ? "Link Copied" : "Share Feature"}</span>
              </button>
            </div>
          </div>

          {/* Photograph / Media Badge */}
          <div className="shrink-0 w-full lg:w-88 rounded-2xl overflow-hidden border border-white/20 bg-stone-900/70 shadow-2xl group">
            <div className="relative overflow-hidden">
              <img
                src="/ahmedabad-mirror-top-10-entrepreneurs-2026.jpg"
                alt="Ahmedabad Mirror Top 10 Inspiring Entrepreneurs in Ahmedabad 2026"
                className="w-full h-56 sm:h-64 object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                <BadgeCheck className="size-3 text-red-500" /> Authentic Media
              </span>
            </div>
            <div className="p-5 bg-stone-950/85 backdrop-blur-md space-y-3 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                <div className="flex items-center gap-2">
                  <img src="/ahmedabad-mirror-logo.svg" alt="Ahmedabad Mirror" className="h-3.5 invert brightness-200" />
                  <span>Ahmedabad Mirror Coverage</span>
                </div>
                <span>Sep 2026</span>
              </div>
              <p className="text-xs text-stone-300 leading-snug">
                Featuring Volamp Elektrikals CEO & Director <strong>Naimil Vipul Patel</strong> among Gujarat's leading next-generation business leaders.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-stone-400">Headquarters: Ahmedabad, Gujarat</span>
                <a
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <span>Verify Article</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* In-Depth Feature Transcript & Executive Breakdown */}
      <section className="py-12 market-container">
        <div className="bg-white dark:bg-slate-800/90 rounded-3xl border border-stone-200/90 dark:border-slate-700/80 p-6 sm:p-10 shadow-lg space-y-8">
          <div className="border-b border-stone-200 dark:border-slate-700 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c56718] dark:text-amber-400 block mb-1">
                FULL EDITORIAL COVERAGE
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white">
                Inside the Ahmedabad Mirror Feature
              </h3>
            </div>
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 text-xs font-bold text-stone-800 dark:text-white transition-colors shrink-0"
            >
              <span>Read on ahmedabadmirror.com</span>
              <ExternalLink className="size-3.5 text-red-600" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2 Cols: Editorial Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-slate-300 text-sm leading-relaxed space-y-4">
                <p className="font-semibold text-base text-[#4d1217] dark:text-amber-200 border-l-4 border-red-600 pl-4 py-1">
                  Naimil Vipul Patel — CEO and Director of Volamp Elektrikals Private Limited
                </p>

                <p>
                  Naimil Vipul Patel is the CEO and Director of Volamp Elektrikals Private Limited, an Ahmedabad-based electrical distribution company serving customers across Gujarat and neighbouring markets. Under his leadership, Volamp has built a strong presence in the electrical industry, specialising in the distribution of multi-brand wires and cables from leading brands such as <strong>KEI, Polycab and Finolex</strong>.
                </p>

                <p>
                  Naimil is focused on building Volamp as a dependable one-stop destination for electrical products, serving contractors, industries, infrastructure companies, dealers and institutional customers. His business approach combines strong customer relationships with technology-driven processes, efficient operations and data-based decision-making.
                </p>

                <p>
                  With a clear vision for regional expansion, Naimil is working towards creating a scalable and professionally managed electrical distribution enterprise. He believes that sustainable growth comes from reliable products, competitive pricing, timely delivery and long-term customer relationships. Through Volamp, he continues to build a modern organisation capable of meeting the growing electrical and infrastructure requirements of Gujarat and beyond.
                </p>
              </div>

              {/* 4 Pillars Grid */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-900/50 border border-stone-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#4d1217] dark:text-amber-300 font-bold text-xs">
                    <Sparkles className="size-4 text-[#c56718]" />
                    <span>Visionary Regional Leadership</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-slate-400">
                    Recognized among Ahmedabad's top 10 entrepreneurs driving enterprise creation, employment, and regional infrastructure growth.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-900/50 border border-stone-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#4d1217] dark:text-amber-300 font-bold text-xs">
                    <Building2 className="size-4 text-[#c56718]" />
                    <span>Multi-Brand Powerhouse</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-slate-400">
                    Distributing certified wires and cables from India's premier cable brands including Polycab, KEI, and Finolex.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-900/50 border border-stone-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#4d1217] dark:text-amber-300 font-bold text-xs">
                    <Globe2 className="size-4 text-[#c56718]" />
                    <span>Dependable One-Stop Supply</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-slate-400">
                    Direct supply corridor serving electrical contractors, EPC builders, industrial plants, dealers, and institutions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-slate-900/50 border border-stone-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#4d1217] dark:text-amber-300 font-bold text-xs">
                    <ShieldCheck className="size-4 text-[#c56718]" />
                    <span>Technology-Driven Operations</span>
                  </div>
                  <p className="text-xs text-stone-600 dark:text-slate-400">
                    Transparent online pricing, automated sizing tools, and certified batch barcode dispatches directly from Ahmedabad.
                  </p>
                </div>
              </div>
            </div>

            {/* 1 Col: Media Factsheet & Direct Citation */}
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#fff7f0] to-[#fff1e6] dark:from-slate-900 dark:to-slate-800/80 border border-[#ebd7c7] dark:border-slate-700 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c56718] dark:text-amber-400 block">
                  PUBLICATION CITATION
                </span>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-stone-500 dark:text-slate-400 block">Headline:</span>
                    <strong className="text-stone-900 dark:text-white">
                      Top 10 Inspiring Entrepreneurs in Ahmedabad to Watch in 2026
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-slate-400 block">Publisher:</span>
                    <strong className="text-stone-900 dark:text-white">
                      Ahmedabad Mirror
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-slate-400 block">Published Date:</span>
                    <strong className="text-stone-900 dark:text-white">
                      September 30, 2026
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-slate-400 block">Featured Executive:</span>
                    <strong className="text-stone-900 dark:text-white">
                      Naimil Vipul Patel (CEO & Director)
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-500 dark:text-slate-400 block">Enterprise:</span>
                    <strong className="text-stone-900 dark:text-white">
                      Volamp Elektrikals Private Limited
                    </strong>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <span>Open Live Article</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>

              {/* Authenticity Guarantee Card */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-2 text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>Editorial Authenticity Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
                  Volamp Elektrikals adheres to strict corporate transparency. We host only 100% verified, authentic media appearances published by recognized independent journalists and media publications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Press Inquiries / Media Contact */}
      <section className="py-12 market-container">
        <div className="rounded-3xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800/60 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c56718] dark:text-amber-400">
              <Mail className="size-3.5" />
              <span>MEDIA DESK</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white">
              Corporate & Press Relations Office
            </h3>
            <p className="text-xs text-stone-600 dark:text-slate-400 max-w-xl">
              For journalist inquiries, executive commentary, brand assets, or supply chain case studies, connect directly with the Volamp corporate media desk.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="mailto:press@volampelektrikals.com"
              className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-700 border border-stone-300 dark:border-slate-600 text-xs font-bold text-stone-800 dark:text-white hover:bg-stone-100 dark:hover:bg-slate-600 flex items-center gap-2 transition-colors shadow-xs"
            >
              <Mail className="size-4 text-[#c56718]" />
              <span>press@volampelektrikals.com</span>
            </a>
            <a
              href="tel:+919512365582"
              className="px-5 py-2.5 rounded-xl bg-[#4d1217] hover:bg-[#6b2024] text-xs font-bold text-white flex items-center gap-2 shadow-sm transition-colors"
            >
              <Phone className="size-4" />
              <span>+91 95123 65582</span>
            </a>
          </div>
        </div>
      </section>

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
