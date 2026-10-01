import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import ThemeToggle from "@/components/ThemeToggle";
import UniversalFooter from "@/components/layout/UniversalFooter";
import { useUserLocation } from "@/contexts/LocationContext";
import { useCart } from "@/contexts/CartContext";
import {
  MapPin,
  Building2,
  Warehouse,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ArrowRight,
  Copy,
  ChevronDown,
  Globe2,
  ShoppingCart,
  Menu,
  X,
  Check,
  Navigation,
  Factory,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

interface LocationInfo {
  id: string;
  name: string;
  type: string;
  badgeColor: string;
  purpose: string;
  address: string;
  pincode: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbedUrl: string;
  directMapUrl: string;
}

const LOCATIONS: LocationInfo[] = [
  {
    id: "khadia",
    name: "Corporate Main Office (Khadia)",
    type: "Corporate & Sales",
    badgeColor: "bg-[#4d1217] text-white",
    purpose: "Commercial desk, accounts, billing, contractor rate contracts & brand sourcing",
    address: "1753, Dhobi's Pole Sir, Chinubhai Rd, Old City, Khadia, Ahmedabad, Gujarat",
    pincode: "380001",
    phone: "+91 9512365582",
    email: "sales@volampelektrikals.com",
    hours: "Mon – Sat: 9:30 AM – 7:30 PM",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=1753,+VOLAMP+ELEKTRIKALS+PRIVATE+LIMITED,+Dhobi's+Pole+Sir,+Chinubhai+Rd,+Old+City,+Khadia,+Ahmedabad,+Gujarat+380001&t=&z=16&ie=UTF8&iwloc=&output=embed",
    directMapUrl: "https://maps.app.goo.gl/FPiAvDJEKCsxTLgT8?g_st=iw",
  },
  {
    id: "aslali",
    name: "Central Fulfillment Center (Aslali)",
    type: "Warehouse & Depot",
    badgeColor: "bg-[#c56718] text-white",
    purpose: "Mother stockyard, drum cutting, coiling machines & pan-India freight terminal",
    address: "VOLAMP ASLALI WAREHOUSE, Near NH-48 & SP Ring Road Junction, Aslali, Ahmedabad, Gujarat",
    pincode: "382427",
    phone: "+91 9512365582",
    email: "logistics@volampelektrikals.com",
    hours: "Mon – Sat: 8:00 AM – 8:00 PM (24/7 Logistics Staging)",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=VOLAMP+ELEKTRIKALS+ASLALI+WAREHOUSE,@22.9064417,72.5877551&t=&z=15&ie=UTF8&iwloc=&output=embed",
    directMapUrl: "https://maps.app.goo.gl/WgS6fp3TaEsH2GBU7",
  },
];

const CORPORATE_INFO = {
  company: "VOLAMP ELEKTRIKALS PRIVATE LIMITED",
  gst: "24AAICV0754B1ZO",
  cin: "U31900GJ2021PTC122730",
};

export default function BranchLocations() {
  const [, navigate] = useLocation();
  const { location, openLocationPicker, isDetecting } = useUserLocation();
  const { totalCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    toast.success(`${label} copied to clipboard!`, {
      description: text,
    });
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleOpenRFQ = (context?: string) => {
    window.dispatchEvent(
      new CustomEvent("volamp:open-enquire", {
        detail: {
          category: "BRANCH LOGISTICS & DISPATCH",
          product: context ? `Inquiry regarding ${context}` : undefined,
        },
      })
    );
  };

  return (
    <div className="volamp-marketplace min-h-screen bg-[#faf7f3] dark:bg-[#0c1520] text-[#3d2b2d] dark:text-[#f5f7f9] flex flex-col font-sans transition-colors">
      {/* 1. Top Utility Bar (Exact Home Page Component) */}
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
              {isDetecting && !location ? "Detecting location..." : location || "Ahmedabad, Gujarat"}
            </span>
            <ChevronDown className="inline size-3 text-[#c56718] dark:text-amber-400 opacity-80 group-hover:translate-y-0.5 transition-transform" />
          </button>
          <div>
            <span className="desktop-only text-[#5d4a4b] dark:text-slate-300">
              Global electrical supply & export desk
            </span>
            <button onClick={() => navigate("/collaborate")} className="utility-collaborate">
              Collaborate with us <ArrowRight className="inline size-3" />
            </button>
            <button onClick={() => handleOpenRFQ("Supply Desk")} className="font-semibold hover:underline">
              Talk to supply desk <ArrowRight className="inline size-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Header (Exact Home Page Component) */}
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
            <button onClick={() => navigate("/business-segments")}>Solutions</button>
            <button onClick={() => navigate("/about-volamp")}>About Volamp</button>
            <button onClick={() => navigate("/careers")} className="market-nav-link">Careers</button>
            <button onClick={() => navigate("/collaborate")} className="market-nav-link">Collaborate</button>
            <button onClick={() => navigate("/certifications-and-awards")} className="market-nav-link">Certifications & Quality</button>
            <span className="text-[#c56718] font-bold pb-0.5 border-b-2 border-[#c56718]">Locations</span>
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
          <button onClick={() => { setMobileOpen(false); navigate("/category/wire-cables"); }}>Categories</button>
          <button onClick={() => { setMobileOpen(false); navigate("/business-segments"); }}>Solutions</button>
          <button onClick={() => { setMobileOpen(false); navigate("/about-volamp"); }}>About Volamp</button>
          <button onClick={() => { setMobileOpen(false); navigate("/careers"); }}>Careers</button>
          <button onClick={() => { setMobileOpen(false); navigate("/collaborate"); }}>Collaborate with Us</button>
          <button onClick={() => { setMobileOpen(false); navigate("/certifications-and-awards"); }}>Certifications & Quality</button>
          <button onClick={() => { setMobileOpen(false); openCart(); }}>Shopping Cart ({totalCount})</button>
        </div>
      )}

      {/* 3. Breadcrumb */}
      <div className="market-container py-3 text-xs text-[#71818c] dark:text-slate-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#4d1217] dark:hover:text-amber-300">Home</Link>
        <ChevronDown className="size-3 -rotate-90 text-stone-400" />
        <span className="font-semibold text-[#4d1217] dark:text-white">Branch Locations</span>
      </div>

      {/* 4. Hero Section (Warm Sand Gradient Matching Home Page & Other Pages) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff6ed] via-[#fffaf5] to-[#fcfaf7] dark:from-[#0f1f30] dark:via-[#0b1723] dark:to-[#081018] py-10 sm:py-14 border-b border-[#ebd7c7] dark:border-slate-800">
        <div className="market-container relative z-10">
          <div className="max-w-3xl space-y-3">
            <span className="market-kicker text-[#c25e0a] font-bold text-xs uppercase tracking-wider block">
              OFFICIAL PREMISES & DIRECT SUPPLY
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white tracking-tight leading-tight">
              Branch Locations & <span className="text-[#c56718] dark:text-amber-400">Supply Network</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5d4a4b] dark:text-slate-300 font-['DM_Sans'] leading-relaxed max-w-2xl">
              Main Office & Warehouse based in Ahmedabad, Gujarat. We also work with manufacturing units that can supply products directly to any location across India.
            </p>

            {/* Statutory Registrations Pills (Matching Home Cards Style) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => copyToClipboard(CORPORATE_INFO.gst, "GSTIN", "gst")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs text-xs text-[#3d2b2d] dark:text-slate-200 hover:border-[#c56718] transition-colors cursor-pointer"
                title="Click to copy GST number"
              >
                <span className="text-[#c56718] dark:text-amber-400 font-bold text-[10px] uppercase">GST</span>
                <span className="font-mono text-xs font-semibold">{CORPORATE_INFO.gst}</span>
                {copiedId === "gst" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3 text-slate-400" />}
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(CORPORATE_INFO.cin, "CIN", "cin")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs text-xs text-[#3d2b2d] dark:text-slate-200 hover:border-[#c56718] transition-colors cursor-pointer"
                title="Click to copy CIN number"
              >
                <span className="text-[#c56718] dark:text-amber-400 font-bold text-[10px] uppercase">CIN</span>
                <span className="font-mono text-xs font-semibold">{CORPORATE_INFO.cin}</span>
                {copiedId === "cin" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3 text-slate-400" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Main Content: 2 Clean Location Cards */}
      <main className="market-container py-8 sm:py-12 flex-1 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {LOCATIONS.map((loc) => {
            const isOffice = loc.id === "khadia";
            return (
              <div
                key={loc.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-[#ebd7c7] dark:border-slate-700 hover:border-amber-400 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-[#f0e4d8] dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${loc.badgeColor}`}
                    >
                      {loc.type}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      PIN: <strong className="font-mono text-slate-800 dark:text-slate-200">{loc.pincode}</strong>
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white flex items-center gap-2">
                    {isOffice ? (
                      <Building2 className="size-5 text-[#c56718] shrink-0" />
                    ) : (
                      <Warehouse className="size-5 text-amber-600 shrink-0" />
                    )}
                    <span>{loc.name}</span>
                  </h2>

                  <p className="text-xs text-[#5d4a4b] dark:text-slate-300 font-['DM_Sans']">
                    {loc.purpose}
                  </p>
                </div>

                {/* Card Details */}
                <div className="p-6 space-y-4 text-xs font-['DM_Sans']">
                  {/* Address */}
                  <div className="flex items-start gap-2.5">
                    <MapPin className="size-4 text-[#c56718] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Address
                      </span>
                      <p className="text-[#3d2b2d] dark:text-slate-200 font-medium leading-relaxed">
                        {loc.address} – {loc.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-2.5">
                    <Clock className="size-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Operating Hours
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">
                        {loc.hours}
                      </p>
                    </div>
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${loc.phone.replace(/[^0-9+]/g, "")}`}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-[#faf4ed] dark:bg-slate-750 hover:bg-amber-100/80 dark:hover:bg-slate-700 text-[#4d1217] dark:text-white font-semibold transition-colors"
                    >
                      <Phone className="size-3.5 text-[#c56718] shrink-0" />
                      <span className="font-mono text-xs">{loc.phone}</span>
                    </a>

                    <a
                      href={`mailto:${loc.email}`}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-[#faf4ed] dark:bg-slate-750 hover:bg-amber-100/80 dark:hover:bg-slate-700 text-[#4d1217] dark:text-white font-semibold transition-colors"
                    >
                      <Mail className="size-3.5 text-[#c56718] shrink-0" />
                      <span className="truncate text-xs">{loc.email}</span>
                    </a>
                  </div>

                  {/* Google Maps Preview */}
                  <div className="pt-2">
                    <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner bg-slate-100 dark:bg-slate-900">
                      <iframe
                        title={`Map of ${loc.name}`}
                        src={loc.mapEmbedUrl}
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-[#faf7f3] dark:bg-slate-850 border-t border-[#f0e4d8] dark:border-slate-700/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        `${loc.name}\n${loc.address} – ${loc.pincode}\nPhone: ${loc.phone}\nGoogle Maps: ${loc.directMapUrl}`,
                        "Address",
                        loc.id
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-[#d8c2b0] dark:border-slate-700 text-xs font-semibold hover:bg-amber-50 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedId === loc.id ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5 text-slate-500" />
                    )}
                    <span>{copiedId === loc.id ? "Copied" : "Copy Address"}</span>
                  </button>

                  <a
                    href={loc.directMapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Navigation className="size-3.5" />
                    <span>Open in Maps</span>
                    <ExternalLink className="size-3 ml-0.5 opacity-80" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* 6. Direct Factory Supply to Any Location (Matching Home Page Banner) */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#fff7ef] to-[#fdf9f4] dark:from-slate-800 dark:to-slate-850 border border-[#ebd7c7] dark:border-slate-700 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-[#4d1217] text-white shrink-0 mt-0.5">
              <Factory className="size-6 text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#c25e0a] dark:text-amber-400">
                  DIRECT FACTORY-TO-SITE SUPPLY
                </span>
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pan-India Reach</span>
              </div>
              <strong className="text-base sm:text-lg font-bold font-['Space_Grotesk'] text-[#4d1217] dark:text-white block">
                We work with manufacturing units that can supply products at any location.
              </strong>
              <p className="text-xs text-[#5d4a4b] dark:text-slate-300 max-w-2xl leading-relaxed font-['DM_Sans']">
                Need material delivered straight to your job site or remote industrial project? Our manufacturing partner network dispatches directly to any destination with factory Material Test Certificates ( MTC ).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleOpenRFQ("Factory Direct Supply")}
              className="flex-1 sm:flex-initial bg-[#c56718] hover:bg-[#b45309] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Request Site Delivery
            </button>
            <a
              href="https://wa.me/919512365582?text=Hello%20VOLAMP%20team%2C%20I%20need%20factory%20dispatch%20to%20my%20project%20location."
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial text-center border border-[#c56718] text-[#c56718] hover:bg-[#c56718] hover:text-white px-4 py-2.5 rounded-lg text-xs font-bold transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </main>

      {/* 7. Footer (Universal Footer Matching Home Page Exactly) */}
      <UniversalFooter />
    </div>
  );
}
