import React from "react";
import { Link } from "wouter";
import { ArrowRight, Globe, ShieldCheck } from "lucide-react";
import NewsletterSection from "@/components/home/NewsletterSection";
import SocialMediaLinks from "./SocialMediaLinks";
import MetalPriceTrendFooterWidget from "@/components/metal/MetalPriceTrendFooterWidget";

interface UniversalFooterProps {
  showNewsletter?: boolean;
  showJournalBar?: boolean;
  forceLight?: boolean;
}

export default function UniversalFooter({
  showNewsletter = true,
  showJournalBar = true,
  forceLight = true,
}: UniversalFooterProps) {
  const supportPhone = "9512365582";

  return (
    <footer
      className={`site-footer ${forceLight ? "force-light" : ""} w-full !bg-[#faf7f3] !text-[#3d2b2d] !border-t !border-[#ebd7c7] transition-colors`}
      style={{ backgroundColor: "#faf7f3", color: "#3d2b2d" }}
    >
      {/* 1. Optional Newsletter Section (Matching Home Page) */}
      {showNewsletter && <NewsletterSection />}

      {/* 2. Copper & Aluminium Live Price Trend Graph */}
      <MetalPriceTrendFooterWidget />

      {/* 3. Optional Volamp Journal Strip */}
      {showJournalBar && (
        <div className="footer-blog-bar border-b border-[#ebd4c2] dark:border-[#3a1014] bg-[#f7ede6] dark:bg-[#200609] transition-colors">
          <div className="market-container footer-blog-inner py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="footer-eyebrow text-[#c25e0a] dark:text-[#ef7d19] font-black text-[11px] tracking-widest uppercase block">
                VOLAMP JOURNAL &amp; KNOWLEDGE DESK
              </span>
              <strong className="text-[#4d1217] dark:text-white font-['Plus_Jakarta_Sans',sans-serif] text-lg sm:text-xl font-bold block">
                Authoritative cable sizing guides, standards comparisons, and market intelligence.
              </strong>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 border border-[#c25e0a] dark:border-[#ef7d19] rounded-md bg-white dark:bg-[#300a0e] px-4 py-2.5 text-[#4d1217] dark:text-amber-300 hover:bg-[#ef7d19] hover:border-[#ef7d19] hover:text-white dark:hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              <span>Visit the Knowledge Hub</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 4. Main 5-Column Navigation Grid */}
      <div className="market-container footer-columns py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 text-xs border-b border-[#ebd7c7] dark:border-[#3a1014]">
        {/* Column 1: About Volamp & Logo */}
        <div className="footer-column footer-company space-y-3">
          <div className="brand-mark bg-white p-2 rounded-md border border-[#ebd7c7] dark:border-white/20 inline-block shadow-xs">
            <img src="/volamp-logo.png" alt="VOLAMP Elektrikals" className="h-8 w-auto object-contain" />
          </div>
          <span className="footer-column-title text-[#c25e0a] dark:text-[#ef7d19] font-bold text-xs uppercase tracking-wider block">
            ABOUT VOLAMP
          </span>
          <div className="flex flex-col space-y-2">
            <Link href="/about-volamp" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              About Us (60+ Years Legacy)
            </Link>
            <Link href="/where-volamp-contributed" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Where Volamp Contributed
            </Link>
            <Link href="/business-segments" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Business Segments &amp; Sectors
            </Link>
            <Link href="/careers" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Careers at Volamp
            </Link>
            <Link href="/collaborate" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline font-semibold">
              Contractor Collaboration
            </Link>
            <Link href="/certifications-and-awards" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Certifications &amp; BIS Standards
            </Link>
            <Link href="/in-the-news" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Industry News &amp; Circulars
            </Link>
          </div>
        </div>

        {/* Column 2: Authorized Brand Dealers & Locations */}
        <div className="footer-column space-y-2">
          <span className="footer-column-title text-[#c25e0a] dark:text-[#ef7d19] font-bold text-xs uppercase tracking-wider block mb-2">
            DEALERS &amp; HUBS
          </span>
          <div className="flex flex-col space-y-2">
            <Link href="/dealers/polycab-ahmedabad" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Polycab Dealer Ahmedabad
            </Link>
            <Link href="/dealers/finolex-cables-ahmedabad" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Finolex Distributor Ahmedabad
            </Link>
            <Link href="/dealers/kei-cables-gujarat" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              KEI Cable Dealer Gujarat
            </Link>
            <Link href="/dealers/schneider-electric-ahmedabad" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Schneider Switchgear Distributor
            </Link>
            <Link href="/locations/industrial-gidc-hubs" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline font-semibold text-[#c25e0a]">
              Sanand &amp; Vatva GIDC Supply
            </Link>
            <Link href="/export" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline font-bold text-emerald-700 flex items-center gap-1">
              <Globe className="size-3" /> Global Export (Mundra/Kandla)
            </Link>
          </div>
        </div>

        {/* Column 3: Shop Categories */}
        <div className="footer-column space-y-2">
          <span className="footer-column-title text-[#c25e0a] dark:text-[#ef7d19] font-bold text-xs uppercase tracking-wider block mb-2">
            SHOP CATEGORIES
          </span>
          <div className="flex flex-col space-y-2">
            <Link href="/category/wire-cables" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Wires &amp; Cables (LT / HT)
            </Link>
            <Link href="/category/switch-gears" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Switchgear &amp; Protection
            </Link>
            <Link href="/category/solar" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Solar DC Cables (1500V)
            </Link>
            <Link href="/category/lugs" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Dowells Cable Lugs
            </Link>
            <Link href="/category/glands" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Brass Cable Glands
            </Link>
            <Link href="/category/earthing-material" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Earthing &amp; Lightning Material
            </Link>
            <Link href="/calculator" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline font-medium text-[#c56718]">
              Cable Sizing Calculator
            </Link>
          </div>
        </div>

        {/* Column 4: Help & Policy Links */}
        <div className="footer-column space-y-2">
          <span className="footer-column-title text-[#c25e0a] dark:text-[#ef7d19] font-bold text-xs uppercase tracking-wider block mb-2">
            HELP &amp; SUPPORT
          </span>
          <div className="flex flex-col space-y-2">
            <Link href="/enquire" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Project RFQ &amp; Quotation
            </Link>
            <Link href="/branch-locations" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Branch &amp; Stockyard Locations
            </Link>
            <Link href="/shipping-policy" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Shipping &amp; Freight Policy
            </Link>
            <Link href="/refund-policy" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Return &amp; Refund Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy-policy" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Privacy Policy
            </Link>
            <Link href="/price-list" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline">
              Manufacturer Price Lists 2026
            </Link>
          </div>
        </div>

        {/* Column 5: Order Support & Social */}
        <div className="footer-column footer-order-support space-y-2">
          <span className="footer-column-title text-[#c25e0a] dark:text-[#ef7d19] font-bold text-xs uppercase tracking-wider block mb-1">
            SALES &amp; SUPPORT
          </span>
          <div className="footer-support-phone border-b border-[#ebd7c7] dark:border-[#3a1014] pb-2 space-y-0.5">
            <span className="text-[10px] text-[#c25e0a] dark:text-[#ef7d19] font-black tracking-wider uppercase block">
              TOLL-FREE / WHATSAPP HELPLINE
            </span>
            <a
              href={`tel:+91${supportPhone}`}
              className="text-[#4d1217] dark:text-white font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold hover:text-[#ef7d19] transition-colors block"
            >
              +91 {supportPhone}
            </a>
            <small className="text-[#736061] dark:text-[#9e8b8d] text-[11px] block">
              sales@volampelektrikals.com
            </small>
          </div>

          <div className="space-y-1.5 pt-1">
            <Link href="/track" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline block">
              Track Consignment LR
            </Link>
            <Link href="/pay-invoice" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline block">
              Pay Invoice Online
            </Link>
            <Link href="/complaints-cases" className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline block">
              Grievance &amp; Discrepancy Cell
            </Link>
          </div>

          <div className="pt-2">
            <span className="footer-column-title text-[#c25e0a] dark:text-[#ef7d19] font-bold text-xs uppercase tracking-wider block mb-1.5">
              SOCIAL &amp; CREDENTIALS
            </span>
            <SocialMediaLinks />
            <div className="pt-2">
              <a
                href="https://gem.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="footer-gem-mark inline-block p-1.5 rounded-md bg-white border border-[#d8c2b0] hover:border-[#ef7d19] transition-all shadow-xs"
                title="Government e Marketplace GeM Registered Supplier"
              >
                <img src="/gem-marketplace-logo.png?v=2" alt="Government e Marketplace GeM" className="h-8 w-auto object-contain" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Entity Details Strip */}
      <div className="market-container py-4 text-[11px] text-slate-500 border-b border-[#ebd7c7] flex flex-wrap justify-between items-center gap-2">
        <div>
          <strong>VOLAMP ELEKTRIKALS PRIVATE LIMITED</strong> | CIN: U31900GJ2021PTC122730 | GSTIN: 24AAICV0754B1ZO | GeM Verified OEM &amp; Distributor
        </div>
        <div>
          Corporate Office: Khadia, Ahmedabad 380001 | Central Stockyard: Aslali Highway, Ahmedabad 382427
        </div>
      </div>
    </footer>
  );
}
