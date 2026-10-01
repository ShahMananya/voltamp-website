import { useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Link, useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { AuthModal } from "@/components/auth/AuthModal";
import { BankCreditModal } from "@/components/credit/BankCreditModal";
import { QuickOrderModal } from "@/components/quickorder/QuickOrderModal";
import { WhatsAppInvoiceModal } from "@/components/invoice/WhatsAppInvoiceModal";
import { TrackOrderModal } from "@/components/track/TrackOrderModal";
import { EnquireModal } from "@/components/enquire/EnquireModal";
import { useUserLocation } from "@/contexts/LocationContext";
import { useCart } from "@/contexts/CartContext";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import NewsletterSection from "@/components/home/NewsletterSection";
import CableCalculatorModal from "@/components/calculator/CableCalculatorModal";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Cable, Calculator, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Database, ExternalLink, Facebook, FileText, Factory, Globe2, Handshake, Headphones, Instagram, Landmark, Linkedin, Menu, MessageCircle, MessageSquare, PackageSearch, PlugZap, Quote, Search, ShieldCheck, ShoppingCart, Sparkles, Truck, UserRound, X, Youtube, Zap } from "lucide-react";
import { CATEGORIES, ICON_MAP } from "@/data/categories";

type Product = { name: string; sku: string; category: string; detail: string; accent: "orange" | "brown" | "yellow"; icon: typeof Cable; price: number; unit: string; use: string };
const products: Product[] = [
  { name: "LV Power Cable", sku: "VLP-LV-001", category: "Wires & Cables", detail: "Low-voltage cable options for dependable building and plant distribution.", accent: "brown", icon: Cable, price: 118, unit: "per metre", use: "Buildings, plants and distribution panels" },
  { name: "Instrumentation Cable", sku: "VLP-IN-014", category: "Industrial Systems", detail: "Shielded signal cabling for control rooms and process environments.", accent: "orange", icon: Factory, price: 142, unit: "per metre", use: "Instrumentation and industrial automation" },
  { name: "Solar Cable", sku: "VLP-SL-022", category: "Renewable Energy", detail: "Purpose-built cable for solar installations and renewable-energy systems.", accent: "yellow", icon: Zap, price: 76, unit: "per metre", use: "Solar plants and rooftop installations" },
  { name: "Building Wire", sku: "VLP-BW-031", category: "Wires & Cables", detail: "Everyday wiring for residential, commercial and contractor requirements.", accent: "orange", icon: PlugZap, price: 42, unit: "per metre", use: "Homes, offices and general wiring" },
  { name: "Control & Data Cable", sku: "VLP-CD-048", category: "Automation & Control", detail: "Clear connections for CCTV, LAN, telephone and smart systems.", accent: "brown", icon: PlugZap, price: 68, unit: "per metre", use: "Communication and control networks" },
];
const categoryNavigation = CATEGORIES.map((category) => {
  const Icon = ICON_MAP[category.iconName] || Cable;
  return {
    name: category.name,
    shortName: category.shortName,
    code: category.code,
    slug: category.slug,
    detail: category.detail,
    image: category.image,
    icon: Icon,
    subcategories: category.subcategories,
    items: category.subcategories.map((s) => s.name),
  };
});
const categoryTiles = categoryNavigation;
const megaMenuGroups = CATEGORIES.map((category) => {
  const Icon = ICON_MAP[category.iconName] || Cable;
  return {
    ...category,
    icon: Icon,
    description: category.detail,
  };
});
const calculatorTree = CATEGORIES.map((category) => ({
  name: category.name,
  subcategories: category.subcategories.map((sub) => ({
    name: sub.name,
    details: sub.items.length ? sub.items : [sub.name],
  })),
}));

function BrandMark() { return <div className="brand-mark bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-[#ebd7c7] shadow-xs flex items-center justify-center" aria-label="VOLAMP home"><img src="/volamp-logo.png" alt="VOLAMP Powering Growth" className="h-7 sm:h-8 w-auto object-contain" /><span className="sr-only">VOLAMP Powering Growth</span></div>; }
function ProductIllustration({ product }: { product: Product }) { const Icon = product.icon; return <div className={`product-art art-${product.accent}`}><div className="wire-orbit" /><Icon className="relative z-10 size-12 stroke-[1.25]" /><span className="product-art-code">{product.category.slice(0, 3).toUpperCase()}</span></div>; }

export default function Home() {
  const { user } = useAuth();
  const { location, country, openLocationPicker, isDetecting } = useUserLocation();
  const { totalCount, openCart, addItem } = useCart();
  const [, navigate] = useLocation();
  const categoryPath = (name: string) => `/category/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`;
  const previewSurface = new URLSearchParams(window.location.search).get("surface");
  const [activeMegaCategory, setActiveMegaCategory] = useState<string | null>(() => previewSurface === "menu" || previewSurface === "keyboard" ? "WIRE CABLES" : previewSurface === "ldc" || previewSurface === "keyboard-ldc" ? "WIRE CABLES" : previewSurface === "switchgear" ? "SWITCH GEARS" : null);
  const [activeMegaSubcategory, setActiveMegaSubcategory] = useState<string | null>(() => previewSurface === "menu" || previewSurface === "keyboard" ? "Industrial Flexible (FRLS) Insulated Cable" : previewSurface === "ldc" || previewSurface === "keyboard-ldc" ? "LAN (Computer) Cable" : null);
  const activeCategoryObj = CATEGORIES.find((c) => c.name === activeMegaCategory) ?? CATEGORIES[0];
  const activeSubcategoryObj = activeCategoryObj.subcategories.find((s) => s.name === activeMegaSubcategory) ?? activeCategoryObj.subcategories[0];
  const [inquiryOpen, setInquiryOpen] = useState(() => previewSurface === "inquiry");
  const [enquiryInitialCategory, setEnquiryInitialCategory] = useState<string | undefined>();
  const [enquiryInitialProduct, setEnquiryInitialProduct] = useState<string | undefined>();
  const [inlineName, setInlineName] = useState("");
  const [inlineContact, setInlineContact] = useState("");
  const [inlineRequirement, setInlineRequirement] = useState("");

  const inlineEnquiryMutation = trpc.enquiry.submit.useMutation({
    onSuccess: (data) => {
      toast.success("Enquiry registered successfully!", {
        description: `Reference: ${data.enquiryNumber}. A Volamp technical specialist will contact you shortly.`,
      });
      setInlineName("");
      setInlineContact("");
      setInlineRequirement("");
    },
    onError: (err) => {
      toast.error("Submission failed", {
        description: err.message || "Please check your inputs and try again.",
      });
    },
  });

  const [creditOpen, setCreditOpen] = useState(false);
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [trackOrderOpen, setTrackOrderOpen] = useState(() => previewSurface === "track");
  const [trackedOrderId, setTrackedOrderId] = useState<string>("");
  const whatsappBusinessUrl = import.meta.env.VITE_WHATSAPP_BUSINESS_URL || "";
  const [mobileOpen, setMobileOpen] = useState(false); const [accountOpen, setAccountOpen] = useState(() => previewSurface === "account"); const [calculatorOpen, setCalculatorOpen] = useState(() => previewSurface === "calculator"); const [calculatorCategory, setCalculatorCategory] = useState<string | null>(null); const [calculatorSubcategory, setCalculatorSubcategory] = useState<string | null>(null); const [calculatorDetail, setCalculatorDetail] = useState<string | null>(null); const [selectedDetail, setSelectedDetail] = useState<Product | null>(() => previewSurface === "product" ? products[0] : null); const [compareList, setCompareList] = useState<string[]>([]); const [search, setSearch] = useState(() => new URLSearchParams(window.location.search).get("q") ?? ""); const [quantity, setQuantity] = useState(100); const [selectedProduct, setSelectedProduct] = useState(products[0]); const [discount, setDiscount] = useState(5);
  const liveSearch = trpc.products.list.useQuery(
    { search: search.trim(), limit: 6 },
    { enabled: search.trim().length >= 2 }
  );
  const searchResults: Product[] = useMemo(() => {
    if (liveSearch.data?.products && liveSearch.data.products.length > 0) {
      return liveSearch.data.products.map((p) => ({
        name: p.name,
        sku: p.productId,
        category: `${p.brand} · ${p.category}`,
        detail: p.description || p.size || "",
        price: p.numericPrice || 0,
        unit: p.unit || "per unit",
        use: p.description || p.category,
        accent: "orange" as const,
        icon: Cable,
      }));
    }
    return products.filter((product) => `${product.name} ${product.sku} ${product.category} ${product.detail}`.toLowerCase().includes(search.toLowerCase())).slice(0, 4);
  }, [search, liveSearch.data]);
  const selectedCalculatorCategory = calculatorTree.find((category) => category.name === calculatorCategory);
  const selectedCalculatorSubcategory = selectedCalculatorCategory?.subcategories.find((subcategory) => subcategory.name === calculatorSubcategory);
  const openCalculator = () => { setMobileOpen(false); setCalculatorOpen(true); };
  const jump = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileOpen(false); };
  const handleQuote = (initialCatOrEvent?: string | React.MouseEvent, initialProd?: string) => {
    setMobileOpen(false);
    setActiveMegaCategory(null);
    const cat = typeof initialCatOrEvent === "string" ? initialCatOrEvent : undefined;
    if (cat) setEnquiryInitialCategory(cat);
    if (initialProd) setEnquiryInitialProduct(initialProd);
    setInquiryOpen(true);
  };

  useEffect(() => {
    const handleGlobalEnquire = (e: any) => {
      handleQuote(e?.detail?.category, e?.detail?.product);
    };
    window.addEventListener("volamp:open-enquire", handleGlobalEnquire);
    return () => window.removeEventListener("volamp:open-enquire", handleGlobalEnquire);
  }, []);

  const toggleCompare = (name: string) => setCompareList((current) => current.includes(name) ? current.filter((item) => item !== name) : current.length < 3 ? [...current, name] : current);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    duration: 32,
  });
  const [currentCampaignSlide, setCurrentCampaignSlide] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  const campaignSlides = useMemo(() => [
    {
      id: "segments",
      eyebrow: "SOLUTIONS FOR INDUSTRY",
      tagline: "CONTRACTORS · EPC · INFRA",
      heading: "Heavy-Duty Cable Distribution for Industrial EPCs",
      description: "Direct factory dispatches of certified HT/LT power cables, control cables, and switchgears with complete Mill Test Certificates (MTC) and consolidated project billing.",
      badges: ["Pan-India Site Delivery", "GeM Registered Supplier", "IS / IEC Certified"],
      cta: "Explore Business Segments",
      secondaryCta: "Request Project BOQ",
      image: "/business-segments-hero.png?v=2",
      themeClass: "campaign-slide-segments",
      onClick: () => navigate("/business-segments"),
      onSecondaryClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        handleQuote();
      },
    },
    {
      id: "credit",
      eyebrow: "INSTITUTIONAL FINANCING",
      tagline: "PRE-APPROVED WORKING CAPITAL",
      heading: "Order & Pay Later on Approved Bank Credit",
      description: "Keep site operations moving without cash flow bottlenecks. Access 30 to 90 days institutional credit backed by premier banking partners for registered contractors.",
      badges: ["30–90 Days Terms", "Zero Hidden Charges", "Fast Digital Clearance"],
      cta: "Apply for Bank Credit",
      secondaryCta: "Pay an Invoice",
      image: "/order-pay-later-3d.jpg",
      themeClass: "campaign-slide-financing",
      onClick: () => setCreditOpen(true),
      onSecondaryClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate("/pay-invoice");
      },
    },
    {
      id: "workspace",
      eyebrow: "LOGISTICS COMMAND DESK",
      tagline: "REAL-TIME TELEMETRY & TRACKING",
      heading: "Project Workspace & Live Consignment Tracking",
      description: "Real-time GPS transit monitoring, carrier LR docket downloads, approved test certificates, and one-click repeat ordering from Ahmedabad Central Depot.",
      badges: ["Live GPS Dockets", "Verified Mill MTCs", "Dedicated Export Desk"],
      cta: "Open Project Workspace",
      secondaryCta: "Track My Consignment",
      image: "/workspace-portal-hero.jpg",
      themeClass: "campaign-slide-portal",
      onClick: () => setAccountOpen(true),
      onSecondaryClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate("/track");
      },
    },
  ], [navigate]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCurrentCampaignSlide(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || isSliderHovered) return;
    const timer = setInterval(() => {
      emblaApi.scrollNext();
    }, 5500);
    return () => clearInterval(timer);
  }, [emblaApi, isSliderHovered]);

  const handlePrevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    emblaApi?.scrollPrev();
  };

  const handleNextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    emblaApi?.scrollNext();
  };

  return <div className="volamp-marketplace">
    <div className="market-utility"><div className="market-container utility-inner"><button onClick={openLocationPicker} className="flex items-center gap-2 text-left text-[#c56718] dark:text-amber-300 hover:text-[#b45309] dark:hover:text-amber-400 transition-colors group cursor-pointer" title="Click to view or change your detected project location (Global & Domestic)"><span className={`status-dot ${isDetecting ? "animate-ping" : ""}`} /><Globe2 className="size-3.5 text-[#c56718] dark:text-amber-400 shrink-0" /><span className="font-semibold text-[#4d1217] dark:text-white group-hover:underline">{isDetecting && !location ? "Detecting location..." : location}</span><ChevronDown className="inline size-3 text-[#c56718] dark:text-amber-400 opacity-80 group-hover:translate-y-0.5 transition-transform" /></button><div><span className="desktop-only text-[#5d4a4b] dark:text-slate-300">Global electrical supply & export desk</span><button onClick={() => navigate("/collaborate")} className="utility-collaborate">Collaborate with us <ArrowRight className="inline size-3" /></button><button onClick={handleQuote}>Talk to supply desk <ArrowRight className="inline size-3" /></button></div></div></div>
    <header className="market-header"><div className="market-container market-header-top"><a href="#top"><BrandMark /></a><nav className="market-nav"><button onClick={() => jump("categories")}>Categories</button><button onClick={() => jump("solutions")}>Solutions</button><button onClick={() => navigate("/about-volamp")}>About Volamp</button><button onClick={() => navigate("/careers")} className="market-nav-link">Careers</button><button onClick={() => navigate("/collaborate")} className="market-nav-link">Collaborate with us</button></nav><div className="market-header-actions"><ThemeToggle /><button onClick={() => { if (user) { navigate(user.accountType === "employee" ? "/employee-portal" : "/portal"); } else { setAccountOpen(true); } }}><UserRound className="size-4" /> {user ? (user.accountType === "employee" ? "Employee portal" : "My portal") : "Login / Register"}</button><Button onClick={handleQuote} className="market-quote">Request a quote <ArrowRight className="ml-2 size-4" /></Button><Button variant="ghost" size="icon" className="market-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></Button></div></div><div className="market-search-row market-container"><div className="category-menu-wrap" onMouseLeave={() => setActiveMegaCategory(null)}><button className="category-menu" onMouseEnter={() => { if (!activeMegaCategory) { setActiveMegaCategory("WIRE CABLES"); setActiveMegaSubcategory(CATEGORIES[0]?.subcategories[0]?.name ?? null); } }} onFocus={() => { if (!activeMegaCategory) { setActiveMegaCategory("WIRE CABLES"); setActiveMegaSubcategory(CATEGORIES[0]?.subcategories[0]?.name ?? null); } }} onClick={() => { setActiveMegaCategory(activeMegaCategory ? null : "WIRE CABLES"); jump("categories"); }}><Menu className="size-4" /> Categories <ChevronDown className="ml-auto size-4" /></button>{activeMegaCategory && <div className="mega-menu mega-menu-cascading" onMouseEnter={() => { if (!activeMegaCategory) setActiveMegaCategory("WIRE CABLES"); }}><div className="mega-menu-main-list">{megaMenuGroups.map((group) => { const Icon = group.icon; return <button key={group.name} className={`mega-menu-main-item ${activeMegaCategory === group.name ? "is-active" : ""}`} onMouseEnter={() => { setActiveMegaCategory(group.name); setActiveMegaSubcategory(group.subcategories[0]?.name ?? null); }} onFocus={() => { setActiveMegaCategory(group.name); setActiveMegaSubcategory(group.subcategories[0]?.name ?? null); }} onClick={() => { navigate(`/category/${group.slug}`); setActiveMegaCategory(null); }}><span className="mega-menu-cat-num">{group.code}</span><Icon className="size-4 shrink-0" /><span className="mega-menu-cat-name">{group.name}</span><ArrowRight className="ml-auto size-3.5 opacity-60" /></button>; })}</div><div className="mega-menu-sub-list"><div className="mega-menu-sub-list-head"><span className="market-kicker">{activeCategoryObj.shortName} · SUBCATEGORIES ({activeCategoryObj.subcategories.length})</span><h4>{activeCategoryObj.name}</h4></div><div className="mega-menu-sub-items">{activeCategoryObj.subcategories.map((sub) => <button key={sub.name} className={`mega-menu-sub-item ${activeSubcategoryObj?.name === sub.name ? "is-active" : ""}`} onMouseEnter={() => setActiveMegaSubcategory(sub.name)} onFocus={() => setActiveMegaSubcategory(sub.name)} onClick={() => { navigate(`/category/${sub.slug}`); setActiveMegaCategory(null); }}><span className="mega-menu-sub-name">{sub.name}</span><span className="mega-menu-sub-count">{sub.items.length}</span><ArrowRight className="size-3 shrink-0 opacity-40 ml-1" /></button>)}</div></div><div className="mega-menu-sub-sub-panel"><div><div className="mega-menu-sub-sub-header"><div className="flex items-center justify-between gap-2"><span className="market-kicker">{activeCategoryObj.name} · {activeSubcategoryObj?.name}</span><span className="mega-menu-badge">VERIFIED SPEC</span></div><h3>{activeSubcategoryObj?.name ?? activeCategoryObj.name}</h3><p>{activeSubcategoryObj?.detail ?? activeCategoryObj.detail}</p></div><div className="mega-menu-specs-strip"><div className="mega-menu-spec-item"><ShieldCheck className="size-3.5 text-amber-500 shrink-0" /><div><small>STANDARDS</small><strong>IS / IEC / CE Certified</strong></div></div><div className="mega-menu-spec-item"><Zap className="size-3.5 text-amber-500 shrink-0" /><div><small>CONDUCTOR</small><strong>100% Electrolytic Copper/Al</strong></div></div><div className="mega-menu-spec-item"><PackageSearch className="size-3.5 text-amber-500 shrink-0" /><div><small>SUPPLY</small><strong>Coils & Custom Drums</strong></div></div></div><div className="mega-menu-sub-sub-body"><div className="flex items-center justify-between mb-2"><span className="mega-menu-sub-sub-title">Available Types / Sizes ({activeSubcategoryObj?.items.length ?? 0}):</span><small className="text-[11px] text-slate-400">Click to discover or quote</small></div><div className="mega-menu-sub-sub-grid">{activeSubcategoryObj?.items.map((item) => <button key={item} className="mega-menu-variant-card" onClick={() => { if (activeSubcategoryObj) { navigate(`/category/${activeSubcategoryObj.slug}`); } setActiveMegaCategory(null); }} title={`Browse ${item}`}><div className="mega-menu-variant-icon"><Check className="size-3.5 text-amber-500" /></div><div className="mega-menu-variant-text"><strong>{item}</strong><small>Industrial & project grade</small></div><ArrowRight className="size-3.5 text-slate-400 shrink-0 ml-auto" /></button>)}</div></div><div className="mega-menu-procure-box"><div className="flex items-center gap-2"><Sparkles className="size-4 text-amber-500 shrink-0" /><div><strong>Wholesale & EPC Supply Support</strong><p>Direct manufacturer pricing, Mill Test Certificates (MTC), and pan-India project dispatch.</p></div></div></div></div><div className="mega-menu-actions"><button className="mega-menu-btn-primary" onClick={() => { if (activeSubcategoryObj) { navigate(`/category/${activeSubcategoryObj.slug}`); } else { navigate(`/category/${activeCategoryObj.slug}`); } setActiveMegaCategory(null); }}>Explore Full Category <ArrowRight className="size-3.5 ml-1" /></button><button className="mega-menu-btn-secondary" onClick={() => { setActiveMegaCategory(null); handleQuote(); }}>Request Project RFQ</button><button className="mega-menu-btn-ghost" onClick={() => { setActiveMegaCategory(null); setQuickOrderOpen(true); }}>Quick Order (WhatsApp)</button></div></div></div>}</div><div className="market-search"><Search className="size-5" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter product name, category or SKU" aria-label="Search products" />{search && <button onClick={() => setSearch("")} aria-label="Clear search"><X className="size-4" /></button>}{search && <div className="search-results">{searchResults.length ? searchResults.map((product) => <button key={product.name} onClick={() => { setSelectedDetail(product); setSearch(""); }}><ProductIllustration product={product} /><span><strong>{product.name}</strong><small>{product.sku} · {product.category} · indicative from ₹{product.price}/m</small></span><ArrowRight className="ml-auto size-4" /></button>) : <p>No matching published category. Ask Vola or contact the supply desk.</p>}</div>}</div><div className="quick-actions"><button onClick={() => { setTrackedOrderId(""); setTrackOrderOpen(true); }}><PackageSearch /><span>Track order</span></button><button onClick={openCalculator} aria-label="Open calculator"><Calculator /><span>Calculator</span></button><button onClick={handleQuote}><FileText /><span>PO / enquiry</span></button><button onClick={() => setQuickOrderOpen(true)}><Zap /><span>Quick order</span></button><button onClick={handleQuote}><Quote /><span>Quote desk</span></button><button onClick={openCart} className="relative cursor-pointer" aria-label="Open supply cart"><div className="relative flex items-center justify-center"><ShoppingCart className="size-5" />{totalCount > 0 && <span className="absolute -top-1.5 -right-2 size-4 bg-[#c56718] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs">{totalCount}</span>}</div><span>Cart</span></button></div></div>{mobileOpen && <div className="market-mobile-nav"><button onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button><button onClick={() => jump("categories")}>Categories</button><button onClick={() => jump("solutions")}>Solutions</button><button onClick={() => navigate("/about-volamp")}>About Volamp</button><button onClick={() => { setMobileOpen(false); navigate("/careers"); }} className="market-mobile-link">Careers</button><button onClick={() => { setMobileOpen(false); openCart(); }} className="market-mobile-link flex items-center gap-2"><ShoppingCart className="size-4" /> Cart ({totalCount})</button><button onClick={() => { setMobileOpen(false); setTrackedOrderId(""); setTrackOrderOpen(true); }}>Track My Order</button><button onClick={() => { setMobileOpen(false); navigate("/collaborate"); }} className="market-mobile-link">Collaborate with us</button><ThemeToggle /><button onClick={() => { setMobileOpen(false); if (user) { navigate(user.accountType === "employee" ? "/employee-portal" : "/portal"); } else { setAccountOpen(true); } }}>{user ? (user.accountType === "employee" ? "Open employee portal" : "Open my portal") : "Login / Register"}</button></div>}</header>

    <main id="top"><div className="market-container market-breadcrumb">Home <ChevronDown className="size-3 -rotate-90" /> <span>Let's Build {country} Together</span></div>
      <section
        className="market-hero-slider market-container"
        ref={emblaRef}
        aria-label="Key Solutions and Portals Rotating Showcase"
        onMouseEnter={() => setIsSliderHovered(true)}
        onMouseLeave={() => setIsSliderHovered(false)}
      >
        <div className="market-hero-slider-track">
          {campaignSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`market-hero-slide ${slide.themeClass}`}
              onClick={slide.onClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  slide.onClick();
                }
              }}
            >
              <div className="market-hero-slide-split">
                <div className="market-hero-slide-content">
                  <div className="market-hero-slide-meta">
                    <span className="market-hero-slide-eyebrow">
                      <span className="market-hero-pulse-dot" />
                      {slide.eyebrow}
                    </span>
                    <span className="market-hero-slide-tagline">{slide.tagline}</span>
                  </div>

                  <h2 className="market-hero-slide-heading">{slide.heading}</h2>
                  <p className="market-hero-slide-description">{slide.description}</p>

                  <div className="market-hero-slide-badges">
                    {slide.badges.map((badge, bIdx) => (
                      <span key={bIdx} className="market-hero-slide-badge">
                        <Check className="size-3 text-amber-400 shrink-0" />
                        <span>{badge}</span>
                      </span>
                    ))}
                  </div>

                  <div className="market-hero-slide-actions">
                    <button
                      type="button"
                      className="market-hero-slide-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        slide.onClick();
                      }}
                    >
                      <span>{slide.cta}</span>
                      <ArrowRight className="size-4 market-hero-slide-arrow" />
                    </button>
                    {slide.secondaryCta && (
                      <button
                        type="button"
                        className="market-hero-slide-secondary"
                        onClick={slide.onSecondaryClick}
                      >
                        <span>{slide.secondaryCta}</span>
                        <ArrowRight className="size-3.5 opacity-70" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="market-hero-slide-visual">
                  <div className="market-hero-visual-glow" />
                  <img
                    src={slide.image}
                    alt={slide.heading}
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Prev / Next Navigation Controls */}
        <button
          type="button"
          className="market-hero-slider-btn prev"
          onClick={handlePrevSlide}
          aria-label="Previous Slide"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          className="market-hero-slider-btn next"
          onClick={handleNextSlide}
          aria-label="Next Slide"
        >
          <ChevronRight className="size-5" />
        </button>

        {/* Slide Indicators / Tabs */}
        <div className="market-hero-slider-dots">
          {campaignSlides.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              className={`market-hero-dot ${idx === currentCampaignSlide ? "is-active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                emblaApi?.scrollTo(idx);
              }}
              aria-label={`Go to slide ${idx + 1}: ${slide.heading}`}
            >
              <span className="dot-label">{slide.id === "segments" ? "Business Segments" : slide.id === "credit" ? "Order & Pay Later" : "Project Workspace"}</span>
              <span className="dot-bar" />
            </button>
          ))}
        </div>
      </section>

      <section id="categories" className="market-section">
        <div className="market-container">
          <div className="market-section-head">
            <div>
              <span className="market-kicker">BROWSE THE SUPPLY SYSTEM</span>
              <h1>Explore categories</h1>
            </div>
          </div>
          <div className="category-grid">
            {categoryTiles.map(({ name, code, image }) => (
              <button
                key={name}
                className="category-tile group"
                onClick={() => { navigate(categoryPath(name)); }}
              >
                <div className="category-tile-photo-wrap">
                  <img
                    src={image || "/products/cables.jpg"}
                    alt={name}
                    className="category-tile-photo"
                    loading="lazy"
                  />
                </div>
                <div className="category-tile-footer">
                  <strong className="category-tile-name">{name}</strong>
                  <div className="category-tile-arrow-circle">
                    <ArrowRight className="size-3.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="market-section market-section-muted"><div className="market-container"><div className="market-section-head"><div><span className="market-kicker">BUILT FOR REAL PROCUREMENT</span><h2>Electrical supply & project procurement</h2></div></div><div className="market-trust-grid"><div><ShieldCheck /><strong>Specification Clarity</strong><span>IS, IEC & CE certified cables with authentic Mill Test Certificates (MTC).</span></div><div><Truck /><strong>Global & Pan-India Fulfilment</strong><span>48-hour dispatch corridors across 28 states and international export ports.</span></div><div><Headphones /><strong>Technical Sourcing Desk</strong><span>Direct assistance from electrical engineers and commercial specialists.</span></div></div></div></section>


      {compareList.length > 0 && <section className="compare-section"><div className="market-container"><div className="compare-head"><div><div className="market-kicker">PROJECT SHORTLIST</div><h2>Compare before you request.</h2></div><button className="clear-link" onClick={() => setCompareList([])}>Clear shortlist</button></div><div className="compare-table"><div className="compare-labels"><strong>Product</strong><span>Application</span><span>Unit price</span><span>Estimate at {quantity} m</span></div>{products.filter((product) => compareList.includes(product.name)).map((product) => <div className="compare-product" key={product.name}><div className="compare-product-name"><strong>{product.name}</strong><span>{product.category}</span></div><span>{product.use}</span><span>₹{product.price} / m</span><strong className="estimate-accent">₹{Math.round(quantity * product.price * (1 - discount / 100)).toLocaleString("en-IN")}</strong></div>)}</div></div></section>}

      <section id="quote" className="market-section contact-block"><div className="market-container contact-grid"><div><span className="market-kicker">ENQUIRE WITH THE SUPPLY DESK</span><h2>Tell us what<br /><em>you need to source.</em></h2><div className="contact-facts"><span><Factory /> Manufacturing HQ: Ahmedabad</span><span><Globe2 className="size-3.5 inline text-amber-500" /> Global & Domestic Supply</span><span><Headphones /> Dedicated Export Desk</span><span><Handshake className="size-3.5 inline text-amber-500" /> Looking to partner? <button onClick={() => navigate("/collaborate")} className="underline font-bold text-amber-600 hover:text-amber-700 ml-1">Collaborate with us</button></span></div></div><form onSubmit={(e) => { e.preventDefault(); if (!inlineName.trim()) { toast.error("Please enter your name."); return; } if (!inlineContact.trim()) { toast.error("Please enter your work email or phone."); return; } if (!inlineRequirement.trim()) { toast.error("Please tell us what you are sourcing."); return; } const isEmail = inlineContact.includes("@"); inlineEnquiryMutation.mutate({ fullName: inlineName.trim(), email: isEmail ? inlineContact.trim().toLowerCase() : `${inlineName.toLowerCase().replace(/[^a-z0-9]/g, "") || "user"}@volamp-inquiry.com`, phone: isEmail ? "+91 95123 65582" : inlineContact.trim(), details: inlineRequirement.trim() }); }} className="inquiry-panel"><div className="flex items-center justify-between mb-2"><span className="panel-label">START AN INQUIRY</span><button type="button" onClick={() => handleQuote()} className="text-[11px] font-bold text-[#1d73b7] hover:underline">Open Full RFQ Form →</button></div><Input placeholder="Your name *" value={inlineName} onChange={(e) => setInlineName(e.target.value)} aria-label="Your name" required /><Input placeholder="Work email or mobile number *" value={inlineContact} onChange={(e) => setInlineContact(e.target.value)} aria-label="Work email or phone" required /><Input placeholder="What are you sourcing? (e.g. 1.1kV 4C x 240 sqmm Cable) *" value={inlineRequirement} onChange={(e) => setInlineRequirement(e.target.value)} aria-label="What are you sourcing" required /><Button type="submit" disabled={inlineEnquiryMutation.isPending} className="primary-cta wide">{inlineEnquiryMutation.isPending ? "Submitting..." : "Send inquiry"} <ArrowRight className="ml-2 size-4" /></Button></form></div></section>
    </main>

    <footer className="site-footer"><NewsletterSection /><div className="footer-blog-bar"><div className="market-container footer-blog-inner"><div><span className="footer-eyebrow">VOLAMP JOURNAL</span><strong>Read the latest from our supply desk.</strong></div><button onClick={() => navigate("/blog")}>Visit the blog <ArrowRight className="size-4" /></button></div></div><div className="market-container footer-columns"><div className="footer-column footer-company"><BrandMark /><span className="footer-column-title">ABOUT VOLAMP</span><button onClick={() => navigate("/about-volamp")}>About Us</button><button onClick={() => navigate("/where-volamp-contributed")}>Where Volamp Contributed</button><button onClick={() => navigate("/business-segments")}>Business Segments</button><button onClick={() => navigate("/careers")}>Careers</button><button onClick={() => navigate("/collaborate")} className="footer-collaborate-link">Collaborate with Us</button><button onClick={() => navigate("/certifications-and-awards")}>Certifications & Quality</button><button onClick={() => navigate("/in-the-news")}>In the News</button></div><div className="footer-column"><span className="footer-column-title">SHOP CATEGORIES</span>{categoryNavigation.map((category) => <button key={category.name} onClick={() => navigate(categoryPath(category.slug || category.name))}>{category.name}<ArrowRight className="footer-link-arrow" /></button>)}</div><div className="footer-column"><span className="footer-column-title">HELP</span><button onClick={handleQuote}>Contact Us</button><button onClick={() => navigate("/branch-locations")}>Branch Location</button><button onClick={() => navigate("/refund-policy")}>Return & Refund Policy</button><button onClick={() => navigate("/shipping-policy")}>Shipping Policy</button><button onClick={() => navigate("/terms-and-conditions")}>Terms & Conditions</button><button onClick={() => navigate("/privacy-policy")}>Privacy Policy</button></div><div className="footer-column footer-order-support"><span className="footer-column-title">ORDER SUPPORT</span><div className="footer-support-phone"><span>SUPPORT PHONE</span><a className="footer-support-phone-link" href="tel:+919512365582" aria-label="Call VOLAMP support at 9512365582"><strong>9512365582</strong></a><small>Call Volamp support</small></div><button onClick={() => { setTrackedOrderId(""); setTrackOrderOpen(true); }}>Track My Order</button><button onClick={() => setQuickOrderOpen(true)}>Quick Order (WhatsApp Invoice)</button><a href="https://www.google.com/shopping?q=VOLAMP+ELEKTRIKALS" target="_blank" rel="noreferrer" className="text-left text-xs text-slate-400 hover:text-white transition-colors">Google Shopping Store</a><a href="/api/google-merchant-feed.xml" target="_blank" rel="noreferrer" className="text-left text-xs text-slate-400 hover:text-white transition-colors">Google Merchant Feed (XML)</a><button onClick={() => navigate("/pay-invoice")}>Pay an Invoice Online</button><button onClick={() => toast.info("Price List", { description: "The latest approved price list will be shared by the supply desk." })}>Price List</button><button onClick={() => navigate("/complaints-cases")}>Complaints/Cases</button></div><div className="footer-column footer-social-column"><span className="footer-column-title">SOCIAL MEDIA LINKS</span><div className="footer-social-links"><a href="https://www.linkedin.com/company/volampelektrikals/" target="_blank" rel="noreferrer" aria-label="VOLAMP on LinkedIn"><Linkedin /></a><a href="https://www.facebook.com/profile.php?id=61587485305483#" target="_blank" rel="noreferrer" aria-label="VOLAMP on Facebook"><Facebook /></a><a href="https://www.instagram.com/volampp?stkn=dGtjZDA1enF5OWN6" target="_blank" rel="noreferrer" aria-label="VOLAMP on Instagram"><Instagram /></a><a href="https://m.youtube.com/%40cablezone?fbclid=PAb21jcAULDaJwZG9mAmV4dG4DYWVtAjExAHNydGMGYXBwX2lkDzU2NzA2NzM0MzM1MjQyNwABp_5WEnDviGukN9mL21-2fjF4DbFkf5y0n9RRUsyelrQ99hNGnJuhAHjQu3rn_aem_D1TnOePIE0SqTZXUbdcebg" target="_blank" rel="noreferrer" aria-label="VOLAMP on YouTube"><Youtube /></a></div><a className="footer-gem-mark" href="https://gem.gov.in/" target="_blank" rel="noreferrer" aria-label="VOLAMP on Government e Marketplace"><img src="/gem-marketplace-logo.png?v=2" alt="Government e Marketplace GeM" /></a></div></div><div className="market-container footer-bottom"><span>Volamp Elektrikals © 2026. All rights reserved.</span><span>Global & Domestic electrical supply and export network.</span></div></footer>

    <CableCalculatorModal
      isOpen={calculatorOpen}
      onClose={() => setCalculatorOpen(false)}
      onQuote={(prefill) => {
        handleQuote();
        if (prefill) toast.info("BOM Specification Noted", { description: prefill });
      }}
    />

    <EnquireModal
      isOpen={inquiryOpen}
      onClose={() => {
        setInquiryOpen(false);
        setEnquiryInitialCategory(undefined);
        setEnquiryInitialProduct(undefined);
      }}
      initialCategory={enquiryInitialCategory}
      initialProduct={enquiryInitialProduct}
    />
    {selectedDetail && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${selectedDetail.name} details`} onClick={() => setSelectedDetail(null)}><div className="product-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedDetail(null)} aria-label="Close details"><X /></button><ProductIllustration product={selectedDetail} /><div className="market-kicker">{selectedDetail.category}</div><h2>{selectedDetail.name}</h2><p>{selectedDetail.detail}</p><div className="modal-application"><strong>Typical application</strong><span>{selectedDetail.use}</span></div><div className="flex items-center gap-2 w-full mt-3"><Button onClick={() => { addItem({ id: selectedDetail.sku || selectedDetail.name, name: selectedDetail.name, category: selectedDetail.category, detail: selectedDetail.detail, price: selectedDetail.price, unit: selectedDetail.unit }); setSelectedDetail(null); openCart(); }} className="flex-1 bg-[#c56718] hover:bg-[#b45309] text-white cursor-pointer"><ShoppingCart className="size-4 mr-1.5" /> Add to Cart</Button><Button onClick={() => { const cat = selectedDetail.category; const name = selectedDetail.name; setSelectedDetail(null); handleQuote(cat, name); }} className="flex-1 cursor-pointer" variant="outline">Request RFQ <ArrowRight className="ml-1.5 size-4" /></Button></div></div></div>}
    <AuthModal isOpen={accountOpen} onClose={() => setAccountOpen(false)} />
    <BankCreditModal isOpen={creditOpen} onClose={() => setCreditOpen(false)} />
    <QuickOrderModal isOpen={quickOrderOpen} onClose={() => setQuickOrderOpen(false)} />
    <WhatsAppInvoiceModal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} />
    <TrackOrderModal open={trackOrderOpen} onOpenChange={setTrackOrderOpen} initialOrderId={trackedOrderId} />
  </div>;
}
