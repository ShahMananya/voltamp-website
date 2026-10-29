import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, Globe2, Menu, PhoneCall, X, User, LogIn, Boxes, Briefcase, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface UniversalHeaderProps {
  currentPage?: "home" | "about" | "segments" | "careers" | "collaborate" | "blog" | "enquire" | "calculator" | "pay" | "track" | "news" | "price-list" | "products" | "export";
  backUrl?: string;
  backText?: string;
  showUtilityBar?: boolean;
}

export default function UniversalHeader({
  currentPage,
  showUtilityBar = true,
}: UniversalHeaderProps) {
  const { user } = useAuth();
  const { openLanguagePicker, currentLanguageObj } = useLanguage();
  const [currentPath, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supportPhone = "9512365582";

  return (
    <>
      {/* Top Utility Strip (Warm Sand Bar Matching Home Palette) */}
      {showUtilityBar && (
        <div className="bg-[#f7ede6] text-[#5d4a4b] text-xs py-1.5 border-b border-[#ebd4c2] transition-colors">
          <div className="market-container flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <Globe2 className="size-3.5 text-[#c25e0a] shrink-0" />
              <span className="font-semibold text-[#4d1217] truncate text-[11px] sm:text-xs">
                Ahmedabad HQ · Global & Domestic Supply Network
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-xs shrink-0">
              <a
                href={`tel:+91${supportPhone}`}
                className="hover:text-[#c25e0a] transition-colors hidden sm:flex items-center gap-1.5 font-bold text-[#4d1217]"
              >
                <PhoneCall className="size-3 text-[#c25e0a]" />
                <span>+91 {supportPhone}</span>
              </a>
              <span className="text-[#ebd4c2] hidden sm:inline">|</span>
              <Link
                href="/collaborate"
                className="hover:text-[#c25e0a] transition-colors font-medium text-[#5d4a4b] text-[11px] sm:text-xs whitespace-nowrap"
              >
                Collaborate →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Warm Sand & Cream Navbar */}
      <header className="sticky top-0 z-40 bg-[#fdfbf9] border-b border-[#ebd7c7] text-[#4d1217] shadow-2xs transition-colors">
        <div className="market-container flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <Link href="/" className="flex items-center group" aria-label="VOLAMP home">
              <div className="brand-mark bg-white px-2.5 py-1.5 rounded-lg border border-[#ebd7c7] shadow-xs group-hover:border-[#c56718] transition-all flex items-center justify-center">
                <img
                  src="/volamp-logo.png?v=3"
                  alt="VOLAMP Elektrikals - Powering Growth"
                  className="h-8 sm:h-9 w-auto object-contain"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links (xl: 1280px+) */}
          <nav className="hidden xl:flex items-center gap-3.5 xl:gap-5 text-xs font-bold text-[#4d1217] whitespace-nowrap shrink-0">
            <Link
              href="/"
              className={`hover:text-[#c56718] transition-colors ${
                currentPage === "home" ? "text-[#c56718] border-b-2 border-[#c56718] pb-1" : ""
              }`}
            >
              Categories
            </Link>
            <Link
              href="/business-segments"
              className={`hover:text-[#c56718] transition-colors ${
                currentPage === "segments" ? "text-[#c56718] border-b-2 border-[#c56718] pb-1" : ""
              }`}
            >
              Solutions
            </Link>
            <Link
              href="/about-volamp"
              className={`hover:text-[#c56718] transition-colors ${
                currentPage === "about" ? "text-[#c56718] border-b-2 border-[#c56718] pb-1" : ""
              }`}
            >
              About Volamp
            </Link>
            <Link
              href="/careers"
              className={`hover:text-[#c56718] transition-colors ${
                currentPage === "careers" ? "text-[#c56718] border-b-2 border-[#c56718] pb-1" : ""
              }`}
            >
              Careers
            </Link>
            <Link
              href="/collaborate"
              className={`hover:text-[#c56718] transition-colors ${
                currentPage === "collaborate" ? "text-[#c56718] border-b-2 border-[#c56718] pb-1" : ""
              }`}
            >
              Collaborate
            </Link>
            <Link
              href="/in-the-news"
              className={`hover:text-[#c56718] transition-colors ${
                currentPage === "news" ? "text-[#c56718] border-b-2 border-[#c56718] pb-1" : ""
              }`}
            >
              In the News
            </Link>
            <Link
              href="/track"
              className={`hover:text-[#c56718] transition-colors ${
                currentPage === "track" ? "text-[#c56718] border-b-2 border-[#c56718] pb-1" : ""
              }`}
            >
              Track Order
            </Link>
            <Link
              href="/blog"
              className={`hover:text-[#c56718] transition-colors ${
                currentPage === "blog" ? "text-[#c56718] border-b-2 border-[#c56718] pb-1" : ""
              }`}
            >
              Journal
            </Link>
            <Link
              href="/export"
              className="hover:text-[#c56718] transition-colors inline-flex items-center gap-1 text-emerald-800 font-bold"
            >
              <Globe2 className="size-3 text-[#c56718]" />
              <span>Global Export</span>
            </Link>

            {/* Show only after login: Options 1 & 2 for Employees, or Check Stock for Customers */}
            {user && (
              user.accountType === "employee" ? (
                <div className="flex items-center gap-1.5 ml-1">
                  <a
                    href="https://script.google.com/macros/s/AKfycbwgYP4k3qFbgwxfsaXqcHzBIZyyOknjPDPqBoeT0FvEchs8sY8FMT-A_tcQ2TF_qTQF/exec"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-100 hover:bg-purple-200 text-purple-800 border border-purple-300 transition-colors shadow-2xs"
                    title="1) Go to Workspace (Official Google Apps Script)"
                  >
                    <Briefcase className="size-3 text-purple-700" />
                    <span>Workspace</span>
                    <ExternalLink className="size-2.5 opacity-70" />
                  </a>
                  <Link
                    href="/employee-portal"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 transition-colors shadow-2xs"
                    title="2) Website Maintenance (Product Prices, Add Products, Blogs, Newsletter, Price Lists)"
                  >
                    <Zap className="size-3" />
                    <span>Maintenance</span>
                  </Link>
                </div>
              ) : (
                <a
                  href="https://script.google.com/macros/s/AKfycby_LZjD_6KFK33CCaCrV4Xxgbav0HceiHg1YL0U1iVEnnHMHYbrdXIFhwRILa8VFuuV/exec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-cyan-50 hover:bg-cyan-100 text-[#0d6e6e] border border-cyan-300 transition-colors shadow-2xs ml-1"
                  title="Real-Time Factory & Warehouse Stock Availability"
                >
                  <Boxes className="size-3 text-[#0d6e6e]" />
                  <span>Check Stock</span>
                  <ExternalLink className="size-2.5 opacity-70" />
                </a>
              )
            )}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-nowrap">
            <button
              onClick={openLanguagePicker}
              className="flex items-center gap-1.5 text-xs font-bold text-[#4d1217] hover:text-[#c56718] px-2.5 py-1.5 rounded-lg border border-[#ebd7c7] bg-white hover:bg-[#f7ede6] transition-colors cursor-pointer shadow-2xs"
              title={`Translate Website Language (Current: ${currentLanguageObj.name} · ${currentLanguageObj.nativeName})`}
            >
              <span>{currentLanguageObj.flag}</span>
              <span className="hidden sm:inline uppercase text-[11px]">{currentLanguageObj.nativeName}</span>
            </button>
            <ThemeToggle />
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("volamp:open-profile"));
                }}
                className="text-xs font-bold border-[#ebd7c7] bg-white text-[#4d1217] hover:bg-[#f7ede6] flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="View & Edit Profile Details"
              >
                <div className="size-4 rounded-full bg-[#c56718] text-white flex items-center justify-center font-bold text-[9px]">
                  {(user.name || user.email || "V").charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate hidden sm:inline">
                  {user.name || user.email?.split("@")[0]}
                </span>
                <span className="text-[10px] text-slate-400 font-normal hidden md:inline">· Profile</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("volamp:open-auth")
                  );
                }}
                className="text-xs font-bold border-[#ebd7c7] bg-white text-[#4d1217] hover:bg-[#f7ede6] flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <LogIn className="size-3.5 text-[#c56718]" />
                <span className="hidden sm:inline">Sign In</span>
              </Button>
            )}
            <Button
              onClick={() => navigate("/enquire")}
              className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold px-2.5 sm:px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span className="hidden sm:inline">Request a Quote</span>
              <span className="sm:hidden">Quote</span>
              <ArrowRight className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden text-slate-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#ebd7c7] bg-[#fdfbf9] p-4 space-y-3 text-sm font-semibold text-[#4d1217]">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent("volamp:open-profile"));
                  }}
                  className="w-full text-left py-2 text-[#c56718] font-bold border-b border-[#ebd7c7] cursor-pointer flex items-center gap-2"
                >
                  <User className="size-4" />
                  <span>My Profile ({user.name || user.email?.split("@")[0]})</span>
                </button>
                {user.accountType === "employee" ? (
                  <>
                    <a
                      href="https://script.google.com/macros/s/AKfycbwgYP4k3qFbgwxfsaXqcHzBIZyyOknjPDPqBoeT0FvEchs8sY8FMT-A_tcQ2TF_qTQF/exec"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-purple-700 font-bold border-b border-[#ebd7c7] flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Briefcase className="size-4 text-purple-600" />
                        <span>1) Employee Workspace</span>
                      </span>
                      <ExternalLink className="size-3 opacity-70" />
                    </a>
                    <Link
                      href="/employee-portal"
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2 text-amber-700 font-bold border-b border-[#ebd7c7] flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2">
                        <Zap className="size-4 text-amber-600" />
                        <span>2) Website Maintenance</span>
                      </span>
                      <ArrowRight className="size-3.5 text-amber-600" />
                    </Link>
                  </>
                ) : (
                  <a
                    href="https://script.google.com/macros/s/AKfycby_LZjD_6KFK33CCaCrV4Xxgbav0HceiHg1YL0U1iVEnnHMHYbrdXIFhwRILa8VFuuV/exec"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-[#0d6e6e] font-bold border-b border-[#ebd7c7] flex items-center gap-2"
                  >
                    <Boxes className="size-4 text-[#0d6e6e]" />
                    <span>Check Live Stock</span>
                    <ExternalLink className="size-3 opacity-70" />
                  </a>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(
                    new CustomEvent("volamp:open-auth")
                  );
                }}
                className="w-full text-left py-2 text-[#c56718] font-bold border-b border-[#ebd7c7] cursor-pointer flex items-center gap-2"
              >
                <LogIn className="size-4" />
                <span>Sign In / Create Account</span>
              </button>
            )}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#4d1217] hover:text-[#c56718]"
            >
              Categories
            </Link>
            <Link
              href="/business-segments"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#4d1217] hover:text-[#c56718]"
            >
              Solutions / 10 Business Segments
            </Link>
            <Link
              href="/about-volamp"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#4d1217] hover:text-[#c56718]"
            >
              About Volamp
            </Link>
            <Link
              href="/careers"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#4d1217] hover:text-[#c56718]"
            >
              Careers & Openings
            </Link>
            <Link
              href="/collaborate"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#4d1217] hover:text-[#c56718]"
            >
              Collaborate with Us
            </Link>
            <Link
              href="/in-the-news"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#4d1217] hover:text-[#c56718]"
            >
              In the News & Press
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#4d1217] hover:text-[#c56718]"
            >
              Track My Order
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#4d1217] hover:text-[#c56718]"
            >
              Volamp Journal & Insights
            </Link>
            <Link
              href="/export"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 font-bold text-emerald-800 hover:text-[#c56718] flex items-center gap-1.5"
            >
              <Globe2 className="size-3.5 text-[#c56718]" />
              <span>Global Export (Mundra / Kandla)</span>
            </Link>
            <Link
              href="/price-list"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#c56718] font-bold flex items-center justify-between"
            >
              <span>Brand Price Lists & Catalogs</span>
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                8 Brands
              </span>
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
