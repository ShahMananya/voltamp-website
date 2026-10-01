import React from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, Facebook, Instagram, Linkedin, PhoneCall, Youtube } from "lucide-react";
import { toast } from "sonner";
import NewsletterSection from "@/components/home/NewsletterSection";

interface UniversalFooterProps {
  showNewsletter?: boolean;
  showJournalBar?: boolean;
}

export default function UniversalFooter({
  showNewsletter = true,
  showJournalBar = true,
}: UniversalFooterProps) {
  const [, navigate] = useLocation();
  const supportPhone = "9512365582";

  return (
    <footer className="site-footer w-full bg-[#fbf8f5] dark:bg-[#160406] text-[#3d2b2d] dark:text-[#f0e4e6] border-t border-[#ebd7c7] dark:border-[#3a1014] transition-colors">
      {/* 1. Optional Newsletter Section (Matching Home Page) */}
      {showNewsletter && <NewsletterSection />}

      {/* 2. Optional Volamp Journal Strip */}
      {showJournalBar && (
        <div className="footer-blog-bar border-b border-[#ebd4c2] dark:border-[#3a1014] bg-[#f7ede6] dark:bg-[#200609] transition-colors">
          <div className="market-container footer-blog-inner py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="footer-eyebrow text-[#c25e0a] dark:text-[#ef7d19] font-black text-[11px] tracking-widest uppercase block">
                VOLAMP JOURNAL
              </span>
              <strong className="text-[#4d1217] dark:text-white font-['Space_Grotesk'] text-lg sm:text-xl font-bold block">
                Read the latest from our supply desk.
              </strong>
            </div>
            <button
              type="button"
              onClick={() => navigate("/blog")}
              className="inline-flex items-center gap-2 border border-[#c25e0a] dark:border-[#ef7d19] rounded-md bg-white dark:bg-[#300a0e] px-4 py-2.5 text-[#4d1217] dark:text-amber-300 hover:bg-[#ef7d19] hover:border-[#ef7d19] hover:text-white dark:hover:text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              <span>Visit the blog</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Main 5-Column Navigation Grid (Matching Shared Screenshot) */}
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
            <button type="button" onClick={() => navigate("/about-volamp")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer">
              About Us
            </button>
            <button type="button" onClick={() => navigate("/where-volamp-contributed")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer">
              Where Volamp Contributed
            </button>
            <button type="button" onClick={() => navigate("/business-segments")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer">
              Business Segments
            </button>
            <button type="button" onClick={() => navigate("/careers")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer">
              Careers
            </button>
            <button type="button" onClick={() => navigate("/collaborate")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer font-semibold">
              Collaborate with us
            </button>
            <button type="button" onClick={() => navigate("/certifications-and-awards")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer">
              Certifications & Quality
            </button>
            <button type="button" onClick={() => navigate("/in-the-news")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer">
              In the News
            </button>
          </div>
        </div>

        {/* Column 2: Shop Categories */}
        <div className="footer-column space-y-2">
          <span className="footer-column-title text-[#c25e0a] dark:text-[#ef7d19] font-bold text-xs uppercase tracking-wider block mb-2">
            SHOP CATEGORIES
          </span>
          <button type="button" onClick={() => navigate("/category/wire-cables")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            WIRE CABLES
          </button>
          <button type="button" onClick={() => navigate("/category/switchgears")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            SWITCH GEARS
          </button>
          <button type="button" onClick={() => navigate("/category/wire-cables")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            LUGS
          </button>
          <button type="button" onClick={() => navigate("/category/conduits")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            CONDUIT
          </button>
          <button type="button" onClick={() => navigate("/category/conduits")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            GLANDS
          </button>
          <button type="button" onClick={() => navigate("/category/lightings")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            WIRING DEVICE
          </button>
          <button type="button" onClick={() => navigate("/category/conduits")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            EARTHING WIRES
          </button>
          <button type="button" onClick={() => navigate("/category/solar")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            SOLAR
          </button>
        </div>

        {/* Column 3: Help */}
        <div className="footer-column space-y-2">
          <span className="footer-column-title text-[#c25e0a] dark:text-[#ef7d19] font-bold text-xs uppercase tracking-wider block mb-2">
            HELP
          </span>
          <button type="button" onClick={() => navigate("/enquire")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            Contact Us
          </button>
          <button type="button" onClick={() => navigate("/branch-locations")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            Branch Location
          </button>
          <button type="button" onClick={() => navigate("/refund-policy")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            Return & Refund Policy
          </button>
          <button type="button" onClick={() => navigate("/shipping-policy")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            Shipping Policy
          </button>
          <button type="button" onClick={() => navigate("/terms-and-conditions")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            Terms & Conditions
          </button>
          <button type="button" onClick={() => navigate("/privacy-policy")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
            Privacy Policy
          </button>
        </div>

        {/* Column 4: Order Support */}
        <div className="footer-column footer-order-support space-y-2">
          <span className="footer-column-title text-[#c25e0a] dark:text-[#ef7d19] font-bold text-xs uppercase tracking-wider block mb-1">
            ORDER SUPPORT
          </span>
          <div className="footer-support-phone border-b border-[#ebd7c7] dark:border-[#3a1014] pb-2 space-y-0.5">
            <span className="text-[10px] text-[#c25e0a] dark:text-[#ef7d19] font-black tracking-wider uppercase block">
              SUPPORT PHONE
            </span>
            <a
              href={`tel:+91${supportPhone}`}
              className="text-[#4d1217] dark:text-white font-['Space_Grotesk'] text-lg font-bold hover:text-[#ef7d19] transition-colors block"
            >
              {supportPhone}
            </a>
            <small className="text-[#736061] dark:text-[#9e8b8d] text-[11px] block">
              Call Volamp support
            </small>
          </div>

          <div className="space-y-1.5 pt-1">
            <button type="button" onClick={() => navigate("/track")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
              Track My Order
            </button>
            <button type="button" onClick={() => window.open("https://wa.me/919512365582?text=Hello%20VOLAMP%20team%2C%20I%20would%20like%20to%20place%20a%20Quick%20Order.", "_blank")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
              Quick Order (WhatsApp Invoice)
            </button>
            <a
              href="https://www.google.com/shopping?q=VOLAMP+ELEKTRIKALS"
              target="_blank"
              rel="noreferrer"
              className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline block"
            >
              Google Shopping Store
            </a>
            <a
              href="/api/google-merchant-feed.xml"
              target="_blank"
              rel="noreferrer"
              className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline block"
            >
              Google Merchant Feed (XML)
            </a>
            <button type="button" onClick={() => navigate("/pay-invoice")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
              Pay an Invoice Online
            </button>
            <button type="button" onClick={() => toast.info("Price List", { description: "The latest approved price list will be shared by the supply desk." })} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
              Price List
            </button>
            <button type="button" onClick={() => navigate("/complaints-cases")} className="text-left text-[#5d4a4b] dark:text-[#cfc2c3] hover:text-[#c25e0a] dark:hover:text-[#ef7d19] hover:underline cursor-pointer block">
              Complaints/Cases
            </button>
          </div>
        </div>

        {/* Column 5: Social Media Links & GeM Badge */}
        <div className="footer-column footer-social-column space-y-3">
          <span className="footer-column-title text-[#c25e0a] dark:text-[#ef7d19] font-bold text-xs uppercase tracking-wider block mb-1.5">
            SOCIAL MEDIA LINKS
          </span>
          <div className="footer-social-links flex items-center gap-2">
            <a
              href="https://www.linkedin.com/company/volampelektrikals/"
              target="_blank"
              rel="noreferrer"
              aria-label="VOLAMP on LinkedIn"
              className="size-8 rounded-full bg-white border border-[#d8c2b0] dark:border-white/20 flex items-center justify-center text-[#4d1217] hover:bg-[#ef7d19] hover:border-[#ef7d19] hover:text-white transition-colors shadow-xs"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61587485305483#"
              target="_blank"
              rel="noreferrer"
              aria-label="VOLAMP on Facebook"
              className="size-8 rounded-full bg-white border border-[#d8c2b0] dark:border-white/20 flex items-center justify-center text-[#4d1217] hover:bg-[#ef7d19] hover:border-[#ef7d19] hover:text-white transition-colors shadow-xs"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="https://www.instagram.com/volampp?stkn=dGtjZDA1enF5OWN6"
              target="_blank"
              rel="noreferrer"
              aria-label="VOLAMP on Instagram"
              className="size-8 rounded-full bg-white border border-[#d8c2b0] dark:border-white/20 flex items-center justify-center text-[#4d1217] hover:bg-[#ef7d19] hover:border-[#ef7d19] hover:text-white transition-colors shadow-xs"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="https://m.youtube.com/%40cablezone"
              target="_blank"
              rel="noreferrer"
              aria-label="VOLAMP on YouTube"
              className="size-8 rounded-full bg-white border border-[#d8c2b0] dark:border-white/20 flex items-center justify-center text-[#4d1217] hover:bg-[#ef7d19] hover:border-[#ef7d19] hover:text-white transition-colors shadow-xs"
            >
              <Youtube className="size-4" />
            </a>
          </div>

          <div className="pt-2">
            <a
              href="https://gem.gov.in/"
              target="_blank"
              rel="noreferrer"
              className="footer-gem-mark inline-block p-2 rounded-md bg-white border border-[#d8c2b0] dark:border-white/20 hover:border-[#ef7d19] transition-all shadow-xs"
              title="Government e Marketplace GeM Registered Supplier"
            >
              <img src="/gem-marketplace-logo.png?v=2" alt="Government e Marketplace GeM" className="h-10 w-auto object-contain" />
            </a>
          </div>
        </div>
      </div>

      {/* 4. Bottom Copyright Bar (Matching Shared Screenshot) */}
      <div className="market-container footer-bottom py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#736061] dark:text-[#9e8b8d]">
        <span>VOLAMP ELEKTRIKALS PVT. LTD. © 2026. (GST: 24AAICV0754B1ZO · CIN: U31900GJ2021PTC122730)</span>
        <span>Office: Khadia · Warehouse: Aslali · Factory supply to any location across India.</span>
      </div>
    </footer>
  );
}
