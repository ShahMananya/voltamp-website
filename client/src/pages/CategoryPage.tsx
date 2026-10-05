import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileSpreadsheet,
  FileText,
  Filter,
  Grid,
  Headphones,
  LayoutGrid,
  List,
  Menu,
  PackageSearch,
  Phone,
  Scale,
  Search,
  Send,
  Share2,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Table as TableIcon,
  Tag,
  Truck,
  UserRound,
  X,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import { CATEGORIES, findSubcategory, getCategoryBySlug, getProductImage, getCategoryFallbackImage, ICON_MAP } from "@/data/categories";
import { trpc } from "@/lib/trpc";
import { QuickOrderModal } from "@/components/quickorder/QuickOrderModal";
import { EnquireModal } from "@/components/enquire/EnquireModal";
import UniversalFooter from "@/components/layout/UniversalFooter";
import { useCart } from "@/contexts/CartContext";
import { useCompare } from "@/contexts/CompareContext";
import { toast } from "sonner";

function parseSpecs(raw: any) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Robust price formatter ensuring Indian Rupee symbol '₹' and comma grouping,
 * preventing any broken character encodings.
 */
function formatProductPrice(prod: any): string {
  if (typeof prod?.numericPrice === "number" && prod.numericPrice > 0) {
    return `₹${prod.numericPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (prod?.discountedPrice && typeof prod.discountedPrice === "string") {
    const clean = prod.discountedPrice.replace(/[^0-9.]/g, "");
    const num = parseFloat(clean);
    if (!isNaN(num) && num > 0) {
      return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }
  if (prod?.price && typeof prod.price === "string") {
    const clean = prod.price.replace(/[^0-9.]/g, "");
    const num = parseFloat(clean);
    if (!isNaN(num) && num > 0) {
      return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  }
  return "₹1,250.00";
}

function formatListPrice(rawPrice?: string | null): string | null {
  if (!rawPrice || typeof rawPrice !== "string") return null;
  const clean = rawPrice.replace(/[^0-9.]/g, "");
  const num = parseFloat(clean);
  if (!isNaN(num) && num > 0) {
    return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return null;
}

export default function CategoryPage() {
  const [isCategoryRoute, params] = useRoute("/category/:slug");
  const [, navigate] = useLocation();
  const slug = isCategoryRoute ? params?.slug : undefined;

  const { addItem, totalCount, openCart } = useCart();

  // Match category or subcategory
  const matchedCategory = slug ? getCategoryBySlug(slug) : undefined;
  const matchedSub = slug && !matchedCategory ? findSubcategory(slug) : undefined;
  const category = matchedCategory ?? matchedSub?.category;
  const urlSubcategory = matchedSub?.subcategory;

  const fallbackName = slug
    ? slug
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    : "Electrical Products";

  const categoryTitle = urlSubcategory ? urlSubcategory.name : category?.name ?? fallbackName;

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedMainCat, setSelectedMainCat] = useState<string | null>(category?.name ?? null);
  const [selectedSubCat, setSelectedSubCat] = useState<string | null>(urlSubcategory?.name ?? null);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedVoltage, setSelectedVoltage] = useState<string | null>(null);
  const [selectedCores, setSelectedCores] = useState<string | null>(null);
  const [selectedArmor, setSelectedArmor] = useState<string | null>(null);
  const [selectedPoles, setSelectedPoles] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedInsulation, setSelectedInsulation] = useState<string | null>(null);
  const [selectedShielding, setSelectedShielding] = useState<string | null>(null);
  const [selectedInnerSheath, setSelectedInnerSheath] = useState<string | null>(null);
  const [selectedOuterSheath, setSelectedOuterSheath] = useState<string | null>(null);
  const [selectedConductorClass, setSelectedConductorClass] = useState<string | null>(null);

  // Sync state if slug changes
  useEffect(() => {
    setSelectedMainCat(category?.name ?? null);
    setSelectedSubCat(urlSubcategory?.name ?? null);
    setPage(1);
  }, [slug]);

  // Sorting: relevance, price_asc, price_desc, name
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "name">("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { compareItems, compareCategory, toggleCompare, isProductInCompare } = useCompare();

  // Accordion expansion states matching exact order from ss2
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    stock: true,
    mainCat: false,
    brand: true,
    subCat: true,
    color: false,
    size: true,
    cores: true,
    material: true,
    insulation: false,
    shielding: false,
    innerSheath: false,
    armor: true,
    conductorClass: false,
    outerSheath: false,
    voltage: true,
    poles: true,
    ratings: true,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper: When selecting any cable-specific filter
  const handleSelectCableFilter = (
    setter: React.Dispatch<React.SetStateAction<string | null>>,
    value: string
  ) => {
    setter((prev) => (prev === value ? null : value));
    setPage(1);
  };

  // Helper: When selecting Switchgear filter
  const handleSelectSwitchgearFilter = (
    setter: React.Dispatch<React.SetStateAction<string | null>>,
    value: string
  ) => {
    setter((prev) => (prev === value ? null : value));
    setPage(1);
  };

  // Quick Order, Enquire & Specs Modals
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<any>(null);
  const [viewProductSpecs, setViewProductSpecs] = useState<any>(null);

  const categoryQueryParam =
    selectedMainCat === "ALL" ? undefined : (selectedMainCat || category?.name || undefined);
  const pageSize = 16;

  // tRPC query to load real products with full backend filtering
  const { data: productsData, isLoading: isProductsLoading } = trpc.products.list.useQuery({
    category: categoryQueryParam,
    subcategory: selectedSubCat || undefined,
    brand: selectedBrand || undefined,
    search: searchQuery.trim() || undefined,
    sortBy,
    material: selectedMaterial || undefined,
    voltage: selectedVoltage || undefined,
    cores: selectedCores || undefined,
    armorType: selectedArmor || undefined,
    stock: selectedStock || undefined,
    poles: selectedPoles || undefined,
    rating: selectedRating || undefined,
    color: selectedColor || undefined,
    sizeSqMm: selectedSize || undefined,
    insulationType: selectedInsulation || undefined,
    shieldingType: selectedShielding || undefined,
    innerSheath: selectedInnerSheath || undefined,
    outerSheath: selectedOuterSheath || undefined,
    conductorClass: selectedConductorClass || undefined,
    page,
    limit: pageSize,
  });

  const { data: availableBrands } = trpc.products.getBrands.useQuery({
    category: categoryQueryParam,
  });

  const { data: filterStats } = trpc.products.getFilterStats.useQuery({
    category: categoryQueryParam,
    subcategory: selectedSubCat || undefined,
  });

  // Direct reference to server paginated and filtered products
  const displayProducts = productsData?.products || [];

  const handleAddToCart = (e: React.MouseEvent, prod: any) => {
    e.stopPropagation();
    const prodImg = getProductImage(prod, category?.name);
    addItem({
      id: prod.productId,
      name: prod.name,
      category: prod.category || category?.name,
      sku: prod.sku || prod.productId,
      detail: prod.size ? `Size: ${prod.size}` : prod.subcategory || undefined,
      price: prod.numericPrice || 0,
      unit: prod.unit ? prod.unit.replace("Per ", "") : "Meter",
      quantity: 1,
      image: prodImg,
    });
    toast.success("Added to Cart", {
      description: `${prod.name} added to your supply order.`,
    });
  };

  const handleToggleCompare = (e: React.MouseEvent, prod: any) => {
    e.stopPropagation();
    const prodImg = getProductImage(prod, prod.category || category?.name);
    toggleCompare({
      productId: prod.productId,
      name: prod.name,
      category: prod.category || category?.name || "Wires & Cables",
      subcategory: prod.subcategory,
      brand: prod.brand,
      sku: prod.sku,
      price: prod.price,
      numericPrice: prod.numericPrice,
      discount: prod.discount,
      availability: prod.availability,
      size: prod.size,
      material: prod.material,
      unit: prod.unit,
      image: prodImg,
      specifications: prod.specifications,
    });
  };

  const handleResetFilters = () => {
    setSelectedBrand(null);
    setSelectedMainCat(category?.name ?? null);
    setSelectedSubCat(null);
    setSelectedStock(null);
    setSelectedMaterial(null);
    setSelectedVoltage(null);
    setSelectedCores(null);
    setSelectedArmor(null);
    setSelectedPoles(null);
    setSelectedRating(null);
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedInsulation(null);
    setSelectedShielding(null);
    setSelectedInnerSheath(null);
    setSelectedOuterSheath(null);
    setSelectedConductorClass(null);
    setSearchQuery("");
    setPage(1);
  };

  const isCatChanged = selectedMainCat !== null && selectedMainCat !== (category?.name ?? null);

  const hasActiveFilters =
    Boolean(selectedBrand) ||
    Boolean(selectedSubCat) ||
    Boolean(selectedStock) ||
    Boolean(selectedMaterial) ||
    Boolean(selectedVoltage) ||
    Boolean(selectedCores) ||
    Boolean(selectedArmor) ||
    Boolean(selectedPoles) ||
    Boolean(selectedRating) ||
    Boolean(selectedColor) ||
    Boolean(selectedSize) ||
    Boolean(selectedInsulation) ||
    Boolean(selectedShielding) ||
    Boolean(selectedInnerSheath) ||
    Boolean(selectedOuterSheath) ||
    Boolean(selectedConductorClass) ||
    Boolean(searchQuery) ||
    isCatChanged;

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0c1520] text-[#1e293b] dark:text-[#f1f5f9] flex flex-col font-sans transition-colors">
      {/* 1. TOP NAVBAR (Matching Vashi Layout with VOLAMP Branding) */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#111e2e] border-b border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Direct Links */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/volamp-logo.png"
                alt="VOLAMP Elektrikals"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <Link href="/" className="hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors">
                Home
              </Link>
              <Link href="/about-volamp" className="hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors">
                About Us
              </Link>
              <Link href="/enquire" className="hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors">
                Contact Us
              </Link>
              <Link href="/branch-locations" className="hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors">
                Find a branch
              </Link>
              <Link href="/business-segments" className="hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors">
                Business Segments
              </Link>
            </nav>
          </div>

          {/* Right Header: Theme & Auth */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/portal"
              className="px-4 py-2 rounded-lg bg-[#1d73b7] hover:bg-[#165a91] text-white text-xs font-bold transition-all shadow-xs"
            >
              Login / Register
            </Link>
          </div>
        </div>
      </header>

      {/* 2. SECONDARY SEARCH & QUICK ACTION BAR (Exact Vashi Layout) */}
      <section className="bg-white dark:bg-[#0e1927] border-b border-slate-200 dark:border-slate-800 py-3 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Categories Menu Button + Search Bar */}
          <div className="flex-1 flex items-center gap-2 sm:gap-3 max-w-3xl">
            {/* Categories Dropdown Toggle */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer transition-colors"
              >
                <Menu className="size-4 text-[#1d73b7]" />
                <span className="hidden sm:inline">Categories</span>
                <ChevronDown className="size-3.5 text-slate-500" />
              </button>

              {/* Categories Floating Menu */}
              {categoriesDropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-2 w-64 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 text-xs"
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                >
                  <span className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Product Categories
                  </span>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedMainCat(cat.name);
                        setCategoriesDropdownOpen(false);
                        navigate(`/category/${cat.slug}`);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <span className="font-semibold">{cat.name}</span>
                      <ArrowRight className="size-3 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pill Search Input with Integrated Blue Search Button */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter product name or SKU"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full h-11 pl-4 pr-12 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1d73b7]/30 focus:border-[#1d73b7]"
              />
              <button
                type="button"
                className="absolute right-1 top-1 bottom-1 px-3.5 rounded-md bg-[#1d73b7] hover:bg-[#165a91] text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Search"
              >
                <Search className="size-4" />
              </button>
            </div>
          </div>

          {/* Right: Quick Actions Strip (Track Order, Upload PO, Quick Order, Cart) */}
          <div className="flex items-center justify-around sm:justify-end gap-3 sm:gap-6 shrink-0 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            {/* Track Order */}
            <Link
              href="/track"
              className="flex items-center gap-1.5 hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors cursor-pointer group"
            >
              <Send className="size-4 text-[#1d73b7] group-hover:-translate-y-0.5 transition-transform" />
              <span className="hidden sm:inline">Track Order</span>
            </Link>

            {/* Upload PO / Request Quote */}
            <button
              type="button"
              onClick={() => setEnquireOpen(true)}
              className="flex items-center gap-1.5 hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors cursor-pointer group"
            >
              <FileText className="size-4 text-[#1d73b7] group-hover:-translate-y-0.5 transition-transform" />
              <span>Upload PO</span>
            </button>

            {/* Quick Order */}
            <button
              type="button"
              onClick={() => setQuickOrderOpen(true)}
              className="flex items-center gap-1.5 hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors cursor-pointer group"
            >
              <Zap className="size-4 text-[#c56718] group-hover:scale-110 transition-transform" />
              <span>Quick Order</span>
            </button>

            {/* Cart with Counter */}
            <button
              type="button"
              onClick={openCart}
              className="flex items-center gap-1.5 hover:text-[#1d73b7] dark:hover:text-sky-400 transition-colors cursor-pointer relative"
            >
              <div className="relative">
                <ShoppingCart className="size-5 text-[#1d73b7]" />
                {totalCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 size-4 bg-[#c56718] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Cart</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. MAIN CATALOG & FILTER WORKSPACE (Exact Vashi 2-Column Structure) */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            <SlidersHorizontal className="size-4 text-[#1d73b7]" />
            <span>Filters {hasActiveFilters && "•"}</span>
          </button>

          <span className="text-xs text-slate-500 font-medium">
            Showing {displayProducts.length} of {productsData?.total ?? 0}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================================= */}
          {/* LEFT SIDEBAR: FILTERS ACCORDION (W-64 / W-72 Matching Vashi Filters List) */}
          {/* ========================================================================= */}
          <aside
            className={`${
              mobileFilterOpen ? "block" : "hidden"
            } lg:block lg:col-span-3 bg-white dark:bg-[#111e2e] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto space-y-4`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif] flex items-center gap-2">
                <Filter className="size-4 text-[#1d73b7]" />
                Filters
              </h2>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-[#1d73b7] hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Accordion 1: Stock Availability */}
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <button
                type="button"
                onClick={() => toggleAccordion("stock")}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
              >
                <span>Stock Availability</span>
                <ChevronDown
                  className={`size-3.5 text-slate-400 transition-transform ${
                    openAccordions.stock ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordions.stock && (
                <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedStock(null);
                      setPage(1);
                    }}
                    className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="stock"
                        checked={selectedStock === null}
                        readOnly
                        className="pointer-events-none text-[#1d73b7]"
                      />
                      <span className={selectedStock === null ? "font-bold text-[#1d73b7]" : ""}>All Availability</span>
                    </div>
                    {filterStats?.stock?.all !== undefined && (
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                        ({filterStats.stock.all})
                      </span>
                    )}
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedStock((prev) => (prev === "in_stock" ? null : "in_stock"));
                      setPage(1);
                    }}
                    className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="stock"
                        checked={selectedStock === "in_stock"}
                        readOnly
                        className="pointer-events-none text-[#1d73b7]"
                      />
                      <span className={selectedStock === "in_stock" ? "font-bold text-[#1d73b7]" : ""}>In Stock (Ready)</span>
                    </div>
                    {filterStats?.stock?.in_stock !== undefined && (
                      <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                        ({filterStats.stock.in_stock})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Main Category */}
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <button
                type="button"
                onClick={() => toggleAccordion("mainCat")}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
              >
                <span>Main Category</span>
                <ChevronDown
                  className={`size-3.5 text-slate-400 transition-transform ${
                    openAccordions.mainCat ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordions.mainCat && (
                <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto pr-1">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedMainCat("ALL");
                      setSelectedSubCat(null);
                      setPage(1);
                    }}
                    className="flex items-center gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 select-none"
                  >
                    <input
                      type="radio"
                      name="mainCat"
                      checked={selectedMainCat === "ALL" || (!selectedMainCat && !category?.name)}
                      readOnly
                      className="pointer-events-none text-[#1d73b7]"
                    />
                    <span className={selectedMainCat === "ALL" || (!selectedMainCat && !category?.name) ? "font-bold text-[#1d73b7]" : ""}>
                      All Categories
                    </span>
                  </div>
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedMainCat === cat.name || (!selectedMainCat && category?.name === cat.name);
                    return (
                      <div
                        key={cat.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedMainCat((prev) => (prev === cat.name ? "ALL" : cat.name));
                          setSelectedSubCat(null);
                          setPage(1);
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 select-none"
                      >
                        <input
                          type="radio"
                          name="mainCat"
                          checked={isSelected}
                          readOnly
                          className="pointer-events-none text-[#1d73b7]"
                        />
                        <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{cat.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accordion 3: Brand */}
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <button
                type="button"
                onClick={() => toggleAccordion("brand")}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
              >
                <span>Brand</span>
                <ChevronDown
                  className={`size-3.5 text-slate-400 transition-transform ${
                    openAccordions.brand ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordions.brand && (
                <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto pr-1">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedBrand(null);
                      setPage(1);
                    }}
                    className="flex items-center gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 select-none"
                  >
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrand === null}
                      readOnly
                      className="pointer-events-none text-[#1d73b7]"
                    />
                    <span className={selectedBrand === null ? "font-bold text-[#1d73b7]" : ""}>All Brands</span>
                  </div>
                  {availableBrands?.map((brand) => {
                    const isSelected = selectedBrand === brand;
                    return (
                      <div
                        key={brand}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSelectedBrand((prev) => (prev === brand ? null : brand));
                          setPage(1);
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 select-none"
                      >
                        <input
                          type="radio"
                          name="brand"
                          checked={isSelected}
                          readOnly
                          className="pointer-events-none text-[#1d73b7]"
                        />
                        <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{brand}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Accordion 4: Sub Categories */}
            {category?.subcategories && category.subcategories.length > 0 && (
              <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <button
                  type="button"
                  onClick={() => toggleAccordion("subCat")}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                >
                  <span>Sub Categories</span>
                  <ChevronDown
                    className={`size-3.5 text-slate-400 transition-transform ${
                      openAccordions.subCat ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openAccordions.subCat && (
                  <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto pr-1">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedSubCat(null);
                        setPage(1);
                      }}
                      className="flex items-center gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 select-none"
                    >
                      <input
                        type="radio"
                        name="subCat"
                        checked={selectedSubCat === null}
                        readOnly
                        className="pointer-events-none text-[#1d73b7]"
                      />
                      <span className={selectedSubCat === null ? "font-bold text-[#1d73b7]" : ""}>All Subcategories</span>
                    </div>
                    {category.subcategories.map((sub) => {
                      const isSelected = selectedSubCat === sub.name;
                      return (
                        <div
                          key={sub.slug}
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedSubCat((prev) => (prev === sub.name ? null : sub.name));
                            setPage(1);
                          }}
                          className="flex items-center gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 select-none"
                        >
                          <input
                            type="radio"
                            name="subCat"
                            checked={isSelected}
                            readOnly
                            className="pointer-events-none text-[#1d73b7]"
                          />
                          <span className={`truncate ${isSelected ? "font-bold text-[#1d73b7]" : ""}`}>{sub.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Technical Accordions based on Category */}
            {selectedMainCat === "Switchgear" ? (
              <>
                {/* Switchgear Accordion 1: Poles / Phase */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("poles")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Poles / Phase</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.poles ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.poles && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {["1P", "2P", "3P", "4P"].map((pol) => {
                        const count = filterStats?.poles?.[pol];
                        const isSelected = selectedPoles === pol;
                        return (
                          <div
                            key={pol}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectSwitchgearFilter(setSelectedPoles, pol)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="poles"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{pol}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Switchgear Accordion 2: Rated Current */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleAccordion("ratings")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Current Rating</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.ratings ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.ratings && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto pr-1">
                      {["6A", "10A", "16A", "25A", "32A", "40A", "63A", "100A"].map((rt) => {
                        const count = filterStats?.ratings?.[rt];
                        const isSelected = selectedRating === rt;
                        return (
                          <div
                            key={rt}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectSwitchgearFilter(setSelectedRating, rt)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="rating"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{rt}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Accordion 5: Color (from ss2) */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("color")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Color</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.color ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.color && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {["BLACK", "RED", "BLUE", "YELLOW", "GREEN", "GREY", "ORANGE", "Transparent"].map((col) => {
                        const count = filterStats?.colors?.[col];
                        const isSelected = selectedColor === col;
                        return (
                          <div
                            key={col}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectCableFilter(setSelectedColor, col)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="color"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{col}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accordion 6: Size - Sq Mm (from ss2) */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("size")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Size - Sq Mm</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.size ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.size && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto pr-1">
                      {[
                        "0.5 SQMM", "0.75 SQMM", "1 SQMM", "1.5 SQMM", "2.5 SQMM",
                        "4 SQMM", "6 SQMM", "10 SQMM", "16 SQMM", "25 SQMM",
                        "35 SQMM", "50 SQMM", "70 SQMM", "95 SQMM", "120 SQMM",
                        "150 SQMM", "185 SQMM", "240 SQMM", "300 SQMM", "400 SQMM",
                      ].map((sz) => {
                        const count = filterStats?.sizes?.[sz];
                        const isSelected = selectedSize === sz;
                        return (
                          <div
                            key={sz}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectCableFilter(setSelectedSize, sz)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="sizeSqMm"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{sz}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accordion 7: Core - Pair - Triad - Quad (from ss2) */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("cores")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Core - Pair - Triad - Quad</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.cores ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.cores && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto pr-1">
                      {["1 Core", "2 Core", "3 Core", "3.5 Core", "4 Core", "Multi Core", "Pair", "Triad", "Quad"].map((core) => {
                        const count = filterStats?.cores?.[core];
                        const isSelected = selectedCores === core;
                        return (
                          <div
                            key={core}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectCableFilter(setSelectedCores, core)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="cores"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{core}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accordion 8: Conductor Material (from ss2) */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("material")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Conductor Material</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.material ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.material && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {["Copper", "Aluminium"].map((mat) => {
                        const count = filterStats?.materials?.[mat];
                        const isSelected = selectedMaterial === mat;
                        return (
                          <div
                            key={mat}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectCableFilter(setSelectedMaterial, mat)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="material"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{mat}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accordion 9: Insulation Type (from ss2) */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("insulation")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Insulation Type</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.insulation ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.insulation && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {["PVC", "XLPE", "FRLSH", "FR"].map((ins) => {
                        const count = filterStats?.insulation?.[ins];
                        const isSelected = selectedInsulation === ins;
                        return (
                          <div
                            key={ins}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectCableFilter(setSelectedInsulation, ins)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="insulation"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{ins}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accordion 10: Sheilding Type (from ss2) */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("shielding")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Sheilding Type</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.shielding ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.shielding && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {["Unshielded", "Overall Shielded", "Braided Screen", "Foiled Shielded"].map((sh) => {
                        const count = filterStats?.shielding?.[sh];
                        const isSelected = selectedShielding === sh;
                        return (
                          <div
                            key={sh}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectCableFilter(setSelectedShielding, sh)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="shielding"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{sh}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accordion 11: Inner Sheath Material (from ss2) */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("innerSheath")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Inner Sheath Material</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.innerSheath ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.innerSheath && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {["PVC", "FRLSH", "FR", "Jelly Filled"].map((isM) => {
                        const count = filterStats?.innerSheath?.[isM];
                        const isSelected = selectedInnerSheath === isM;
                        return (
                          <div
                            key={isM}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectCableFilter(setSelectedInnerSheath, isM)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="innerSheath"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{isM}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accordion 12: Type of Armour (from ss2) */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("armor")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Type of Armour</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.armor ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.armor && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {["Armoured", "Unarmoured"].map((arm) => {
                        const count = filterStats?.armour?.[arm];
                        const isSelected = selectedArmor === arm;
                        return (
                          <div
                            key={arm}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectCableFilter(setSelectedArmor, arm)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="armor"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{arm}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accordion 13: Conductor Class (from ss2) */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("conductorClass")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Conductor Class</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.conductorClass ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.conductorClass && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {["Class 2 (Stranded)", "Class 5 (Flexible)"].map((cc) => {
                        const count = filterStats?.conductorClass?.[cc];
                        const isSelected = selectedConductorClass === cc;
                        return (
                          <div
                            key={cc}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectCableFilter(setSelectedConductorClass, cc)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="conductorClass"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{cc}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accordion 14: Outer Sheath Material (from ss2) */}
                <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                  <button
                    type="button"
                    onClick={() => toggleAccordion("outerSheath")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Outer Sheath Material</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.outerSheath ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.outerSheath && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {["PVC", "FRLSH", "FR"].map((osM) => {
                        const count = filterStats?.outerSheath?.[osM];
                        const isSelected = selectedOuterSheath === osM;
                        return (
                          <div
                            key={osM}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectCableFilter(setSelectedOuterSheath, osM)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="outerSheath"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{osM}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Accordion 15: Voltage Rating (from ss2) */}
                <div className={selectedMainCat === "ALL" ? "border-b border-slate-100 dark:border-slate-800/80 pb-3" : ""}>
                  <button
                    type="button"
                    onClick={() => toggleAccordion("voltage")}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                  >
                    <span>Voltage Rating</span>
                    <ChevronDown
                      className={`size-3.5 text-slate-400 transition-transform ${
                        openAccordions.voltage ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.voltage && (
                    <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      {["1100V", "1.1 kV", "11 kV", "33 kV", "1500V DC"].map((volt) => {
                        const count = filterStats?.voltages?.[volt];
                        const isSelected = selectedVoltage === volt;
                        return (
                          <div
                            key={volt}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectCableFilter(setSelectedVoltage, volt)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="voltage"
                                checked={isSelected}
                                readOnly
                                className="pointer-events-none text-[#1d73b7]"
                              />
                              <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{volt}</span>
                            </div>
                            {count !== undefined && count > 0 && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                ({count})
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Switchgear Poles & Current Rating also available under All Categories */}
                {selectedMainCat === "ALL" && (
                  <>
                    <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
                      <button
                        type="button"
                        onClick={() => toggleAccordion("poles")}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                      >
                        <span>Poles / Phase</span>
                        <ChevronDown
                          className={`size-3.5 text-slate-400 transition-transform ${
                            openAccordions.poles ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openAccordions.poles && (
                        <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          {["1P", "2P", "3P", "4P"].map((pol) => {
                            const count = filterStats?.poles?.[pol];
                            const isSelected = selectedPoles === pol;
                            return (
                              <div
                                key={pol}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleSelectSwitchgearFilter(setSelectedPoles, pol)}
                                className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="poles"
                                    checked={isSelected}
                                    readOnly
                                    className="pointer-events-none text-[#1d73b7]"
                                  />
                                  <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{pol}</span>
                                </div>
                                {count !== undefined && count > 0 && (
                                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                    ({count})
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => toggleAccordion("ratings")}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 py-1"
                      >
                        <span>Current Rating</span>
                        <ChevronDown
                          className={`size-3.5 text-slate-400 transition-transform ${
                            openAccordions.ratings ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openAccordions.ratings && (
                        <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300 max-h-48 overflow-y-auto pr-1">
                          {["6A", "10A", "16A", "25A", "32A", "40A", "63A", "100A"].map((rt) => {
                            const count = filterStats?.ratings?.[rt];
                            const isSelected = selectedRating === rt;
                            return (
                              <div
                                key={rt}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleSelectSwitchgearFilter(setSelectedRating, rt)}
                                className="flex items-center justify-between gap-2 cursor-pointer hover:text-[#1d73b7] py-0.5 group select-none"
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="rating"
                                    checked={isSelected}
                                    readOnly
                                    className="pointer-events-none text-[#1d73b7]"
                                  />
                                  <span className={isSelected ? "font-bold text-[#1d73b7]" : ""}>{rt}</span>
                                </div>
                                {count !== undefined && count > 0 && (
                                  <span className="text-[10px] text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 font-mono">
                                    ({count})
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </aside>

          {/* ========================================================================= */}
          {/* RIGHT MAIN SHOWCASE: SORTING & 4-COLUMN PRODUCT GRID (Matching Image 1)  */}
          {/* ========================================================================= */}
          <section className="lg:col-span-9 space-y-4">
            {/* Top Results Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                Showing {productsData?.total ? `${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, productsData.total)} of ${productsData.total}` : "0"} Products
              </span>

              <div className="flex items-center gap-3">
                {/* Sort By Dropdown */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name">Product Name (A-Z)</option>
                  </select>
                </div>

                {/* View Mode Toggle: Grid vs List (Matching Image 1 icons) */}
                <div className="flex items-center p-0.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-[#1d73b7] text-white"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                    title="4-Column Grid View"
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded transition-all cursor-pointer ${
                      viewMode === "list"
                        ? "bg-[#1d73b7] text-white"
                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                    title="List Table View"
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 font-medium">Active:</span>
                {selectedBrand && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Brand: {selectedBrand}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedBrand(null); setPage(1); }} />
                  </span>
                )}
                {selectedSubCat && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    {selectedSubCat}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedSubCat(null); setPage(1); }} />
                  </span>
                )}
                {selectedColor && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Color: {selectedColor}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedColor(null); setPage(1); }} />
                  </span>
                )}
                {selectedSize && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Size: {selectedSize}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedSize(null); setPage(1); }} />
                  </span>
                )}
                {selectedInsulation && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Insulation: {selectedInsulation}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedInsulation(null); setPage(1); }} />
                  </span>
                )}
                {selectedShielding && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Shielding: {selectedShielding}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedShielding(null); setPage(1); }} />
                  </span>
                )}
                {selectedInnerSheath && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Inner Sheath: {selectedInnerSheath}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedInnerSheath(null); setPage(1); }} />
                  </span>
                )}
                {selectedOuterSheath && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Outer Sheath: {selectedOuterSheath}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedOuterSheath(null); setPage(1); }} />
                  </span>
                )}
                {selectedConductorClass && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Class: {selectedConductorClass}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedConductorClass(null); setPage(1); }} />
                  </span>
                )}
                {selectedMaterial && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Material: {selectedMaterial}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedMaterial(null); setPage(1); }} />
                  </span>
                )}
                {selectedVoltage && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Voltage: {selectedVoltage}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedVoltage(null); setPage(1); }} />
                  </span>
                )}
                {selectedCores && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Cores: {selectedCores}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedCores(null); setPage(1); }} />
                  </span>
                )}
                {selectedArmor && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Armour: {selectedArmor}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedArmor(null); setPage(1); }} />
                  </span>
                )}
                {selectedPoles && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Poles: {selectedPoles}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedPoles(null); setPage(1); }} />
                  </span>
                )}
                {selectedRating && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    Rating: {selectedRating}
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedRating(null); setPage(1); }} />
                  </span>
                )}
                {selectedStock === "in_stock" && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    In Stock
                    <X className="size-3 cursor-pointer" onClick={() => { setSelectedStock(null); setPage(1); }} />
                  </span>
                )}
                {searchQuery && (
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-[#1d73b7] font-semibold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    "{searchQuery}"
                    <X className="size-3 cursor-pointer" onClick={() => { setSearchQuery(""); setPage(1); }} />
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-red-500 hover:underline font-semibold ml-1 cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {isProductsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="h-80 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 animate-pulse space-y-3"
                  >
                    <div className="h-40 bg-slate-100 dark:bg-slate-700 rounded-lg" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                    <div className="h-8 bg-slate-100 dark:bg-slate-700 rounded mt-2" />
                  </div>
                ))}
              </div>
            ) : displayProducts.length > 0 ? (
              viewMode === "grid" ? (
                /* ========================================================================= */
                /* 4-COLUMN PRODUCT GRID (Exact Visual Styling of Vashi Marketplace Image 1) */
                /* ========================================================================= */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pt-2">
                  {displayProducts.map((prod) => {
                    const prodImg = getProductImage(prod, category?.name);
                    const isCompared = isProductInCompare(prod.productId);
                    const sku = prod.sku || prod.productId;
                    const priceFormatted = formatProductPrice(prod);
                    const listPrice = formatListPrice(prod.price);
                    const specs = parseSpecs(prod.specifications);

                    return (
                      <div
                        key={prod.productId}
                        onClick={() => navigate(`/product/${prod.productId}`)}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex flex-col justify-between hover:shadow-lg hover:border-[#1d73b7] dark:hover:border-sky-500 transition-all group relative cursor-pointer"
                      >
                        <div>
                          {/* Top-Right Compare / Availability */}
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                              {prod.availability || "In Stock"}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleToggleCompare(e, prod)}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                isCompared
                                  ? "bg-[#1d73b7] text-white shadow-xs"
                                  : "text-slate-400 hover:text-[#1d73b7] hover:bg-slate-100 dark:hover:bg-slate-700/60"
                              }`}
                              title={
                                isCompared
                                  ? "Remove from comparison"
                                  : compareCategory && compareCategory !== (prod.category || category?.name)
                                  ? `Cannot compare ${prod.category || category?.name} with ${compareCategory}`
                                  : "Add to compare"
                              }
                            >
                              <Scale className="size-3" />
                              <span>{isCompared ? "Compared" : "Compare"}</span>
                            </button>
                          </div>

                          {/* Centered Product Image with Official 3D Render & Fallback */}
                          <div className="h-40 sm:h-44 w-full flex items-center justify-center p-2 bg-white dark:bg-slate-800 rounded-lg mb-2 overflow-hidden">
                            <img
                              src={prodImg}
                              alt={prod.name}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = getCategoryFallbackImage(prod.category || category?.name);
                              }}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          {/* Brand Name in Blue/Teal */}
                          <span className="text-[11px] font-bold text-[#1d73b7] dark:text-sky-400 uppercase tracking-wider block mb-1">
                            {prod.brand || "VOLAMP"}
                          </span>

                          {/* Product Title (2-3 lines clean) */}
                          <h3
                            className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-2 min-h-[2.5rem] leading-snug group-hover:text-[#1d73b7] transition-colors"
                            title={prod.name}
                          >
                            {prod.name}
                          </h3>

                          {/* Technical Specification Badges */}
                          <div className="flex flex-wrap gap-1 mt-1.5 min-h-[1.5rem]">
                            {prod.size && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                                {prod.size}
                              </span>
                            )}
                            {specs.cores && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                                {specs.cores}
                              </span>
                            )}
                            {specs.voltageRating && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                                {specs.voltageRating}
                              </span>
                            )}
                            {specs.typeOfArmour && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                                {specs.typeOfArmour}
                              </span>
                            )}
                            {prod.material && (
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                                {prod.material}
                              </span>
                            )}
                          </div>

                          {/* Mfg SKU */}
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1.5 block truncate">
                            Mfg SKU: {sku}
                          </span>

                          {/* Price in Bold Green with MRP Strikethrough & Discount */}
                          <div className="mt-2.5">
                            {listPrice && prod.discount && prod.discount !== "0 %" && (
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 line-through">
                                  MRP: {listPrice}
                                </span>
                                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                  {prod.discount} OFF
                                </span>
                              </div>
                            )}
                            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block font-['Plus_Jakarta_Sans',sans-serif]">
                              {priceFormatted}{" "}
                              <small className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                (incl GST)
                              </small>
                            </span>
                          </div>
                        </div>

                        {/* Dual Action Buttons: View Details & Add To Cart */}
                        <div className="mt-3 pt-2 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/product/${prod.productId}`);
                            }}
                            className="py-1.5 px-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all text-center cursor-pointer"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(e, prod)}
                            className="py-1.5 px-2 rounded-lg border border-[#1d73b7] bg-white dark:bg-transparent text-[#1d73b7] hover:bg-[#1d73b7] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs active:scale-[0.98]"
                          >
                            <ShoppingCart className="size-3" />
                            <span>Add To Cart</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* ========================================================================= */
                /* LIST / TABLE VIEW (Enriched with Specs, MRP & Discounts)                   */
                /* ========================================================================= */
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-bold uppercase text-[11px]">
                          <th className="py-3 px-3">Item</th>
                          <th className="py-3 px-4">Product Name & Specifications</th>
                          <th className="py-3 px-3">Brand</th>
                          <th className="py-3 px-3">SKU</th>
                          <th className="py-3 px-3 text-right">MRP / Discount</th>
                          <th className="py-3 px-3 text-right">Net Price (incl GST)</th>
                          <th className="py-3 px-4 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {displayProducts.map((prod) => {
                          const prodImg = getProductImage(prod, category?.name);
                          const specs = parseSpecs(prod.specifications);
                          const priceFormatted = formatProductPrice(prod);
                          const listPrice = formatListPrice(prod.price);

                          return (
                            <tr
                              key={prod.productId}
                              onClick={() => navigate(`/product/${prod.productId}`)}
                              className="hover:bg-blue-50/30 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                            >
                              <td className="py-2.5 px-3">
                                <div className="size-12 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={prodImg}
                                    alt={prod.name}
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.src = getCategoryFallbackImage(prod.category || category?.name);
                                    }}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="font-semibold text-slate-900 dark:text-white block hover:text-[#1d73b7]">
                                  {prod.name}
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {prod.size && (
                                    <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                      {prod.size}
                                    </span>
                                  )}
                                  {specs.voltageRating && (
                                    <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                      {specs.voltageRating}
                                    </span>
                                  )}
                                  {specs.cores && (
                                    <span className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                      {specs.cores}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-[#1d73b7] font-bold">
                                {prod.brand || "VOLAMP"}
                              </td>
                              <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                                {prod.sku || prod.productId}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {listPrice ? (
                                  <div>
                                    <span className="text-[11px] text-slate-400 line-through block">
                                      {listPrice}
                                    </span>
                                    {prod.discount && prod.discount !== "0 %" && (
                                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                        {prod.discount} OFF
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-[11px]">-</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                {priceFormatted}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleCompare(e, prod)}
                                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                                      isProductInCompare(prod.productId)
                                        ? "bg-[#1d73b7] border-[#1d73b7] text-white"
                                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
                                    }`}
                                    title="Compare Product (Same category only)"
                                  >
                                    <Scale className="size-3" />
                                    <span className="hidden sm:inline">
                                      {isProductInCompare(prod.productId) ? "Compared" : "Compare"}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/product/${prod.productId}`);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                                  >
                                    Details
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleAddToCart(e, prod)}
                                    className="px-3 py-1.5 rounded-lg bg-[#1d73b7] hover:bg-[#165a91] text-white text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Add
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : (
              /* Empty Results State */
              <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl my-4 bg-white dark:bg-slate-800">
                <PackageSearch className="size-10 mx-auto text-slate-400 mb-2" />
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  No matching products found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try clearing your active filters or search with a different keyword.
                </p>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button variant="outline" size="sm" onClick={handleResetFilters} className="text-xs">
                    Clear Filters
                  </Button>
                  <Button size="sm" onClick={() => setEnquireOpen(true)} className="text-xs bg-[#1d73b7]">
                    Request Custom Quote
                  </Button>
                </div>
              </div>
            )}

            {/* Clean Pagination Bar */}
            {productsData && productsData.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Page {productsData.page} of {productsData.totalPages} ({productsData.total} products)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="size-3.5" /> Previous
                  </button>
                  <span className="px-3 py-1 rounded font-bold bg-[#1d73b7] text-white">
                    {page}
                  </span>
                  <button
                    type="button"
                    disabled={page >= productsData.totalPages}
                    onClick={() => setPage((p) => Math.min(productsData.totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    Next <ChevronRight className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 4. Turnkey Project & MTC Verification Banner */}
      <section className="bg-white dark:bg-[#111e2e] border-t border-slate-200 dark:border-slate-800 py-6 mt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <strong className="text-sm sm:text-base font-bold text-slate-900 dark:text-white block font-['Plus_Jakarta_Sans',sans-serif]">
              Supplying a Project or Large Commercial BOQ?
            </strong>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get bulk contract pricing, factory Material Test Certificates ( MTC ), and direct site delivery across India.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setEnquireOpen(true)}
              className="px-4 py-2.5 rounded-lg bg-[#1d73b7] hover:bg-[#165a91] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Upload Project BOQ →
            </button>
            <a
              href="tel:+919512365582"
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
            >
              Call 9512365582
            </a>
          </div>
        </div>
      </section>

      {/* Universal Footer */}
      <UniversalFooter />

      {/* Modals */}
      <QuickOrderModal
        isOpen={quickOrderOpen}
        onClose={() => setQuickOrderOpen(false)}
        initialProduct={selectedProductForOrder}
      />

      <EnquireModal
        isOpen={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        initialCategory={categoryTitle}
      />

      {/* Technical Specifications Datasheet Modal */}
      {viewProductSpecs && (() => {
        const prod = viewProductSpecs;
        const specs = parseSpecs(prod.specifications);
        const prodImg = getProductImage(prod, prod.category);
        const priceFormatted = formatProductPrice(prod);
        const listPrice = formatListPrice(prod.price);

        return (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setViewProductSpecs(null)}
          >
            <div
              className="bg-white dark:bg-[#111e2e] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-[#1d73b7] dark:text-sky-400 uppercase tracking-wider">
                      {prod.brand || "VOLAMP"}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {prod.category} {prod.subcategory ? `· ${prod.subcategory}` : ""}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      {prod.availability || "IN STOCK"}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans',sans-serif] leading-snug">
                    {prod.name}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono mt-0.5 block">
                    Mfg SKU: {prod.sku || prod.productId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setViewProductSpecs(null)}
                  className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Main Content: Image & Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                {/* 3D Product Image */}
                <div className="sm:col-span-5 h-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-center overflow-hidden">
                  <img
                    src={prodImg}
                    alt={prod.name}
                    onError={(e) => {
                      e.currentTarget.src = getCategoryFallbackImage(prod.category);
                    }}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                {/* Pricing & Commercial Terms */}
                <div className="sm:col-span-7 space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500 font-medium block mb-1">
                      Direct Wholesale Rate
                    </span>
                    {listPrice && prod.discount && prod.discount !== "0 %" && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-400 line-through">
                          MRP: {listPrice}
                        </span>
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                          {prod.discount} OFF
                        </span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-['Plus_Jakarta_Sans',sans-serif]">
                        {priceFormatted}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {prod.unit ? `/${prod.unit.replace("Per ", "")}` : "/Meter"} (incl GST)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Minimum Order (MOQ)</span>
                      <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                        {prod.moq || "100 Meters / Standard Coil"}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-400 block text-[11px]">Dispatch Lead Time</span>
                      <strong className="text-slate-700 dark:text-slate-200 font-semibold">
                        24 to 48 Hours Across India
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Technical Specifications Grid from Master Sheet */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-[#1d73b7]" />
                  Master Technical Specifications
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {prod.material && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Conductor Material</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{prod.material}</span>
                    </div>
                  )}
                  {prod.size && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Cross Section (Size)</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{prod.size}</span>
                    </div>
                  )}
                  {specs.cores && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Cores / Configuration</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{specs.cores}</span>
                    </div>
                  )}
                  {specs.voltageRating && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Voltage Grade</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{specs.voltageRating}</span>
                    </div>
                  )}
                  {specs.currentRatingAmp && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Current Rating</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{specs.currentRatingAmp} Amp</span>
                    </div>
                  )}
                  {specs.conductorConstruction && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Conductor Construction</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{specs.conductorConstruction}</span>
                    </div>
                  )}
                  {specs.typeOfArmour && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Type of Armour</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{specs.typeOfArmour}</span>
                    </div>
                  )}
                  {specs.conductorClass && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Conductor Class</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{specs.conductorClass}</span>
                    </div>
                  )}
                  {specs.insulationType && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Insulation Type</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{specs.insulationType}</span>
                    </div>
                  )}
                  {specs.outerSheathMaterial && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Outer Sheath</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{specs.outerSheathMaterial}</span>
                    </div>
                  )}
                  {specs.color && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Color</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{specs.color}</span>
                    </div>
                  )}
                  {specs.warranty && (
                    <div className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Warranty / Standard</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{specs.warranty} · IS/IEC Certified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setViewProductSpecs(null);
                    setSelectedProductForOrder(prod);
                    setQuickOrderOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-[#c56718] text-[#c56718] hover:bg-[#c56718] hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Zap className="size-4" />
                  <span>Quick WhatsApp Order</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      handleToggleCompare(e, prod);
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      isProductInCompare(prod.productId)
                        ? "bg-[#1d73b7] border-[#1d73b7] text-white"
                        : "border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <Scale className="size-3.5" />
                    <span>{isProductInCompare(prod.productId) ? "In Comparison" : "Compare Product"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewProductSpecs(null);
                      setEnquireOpen(true);
                    }}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Request Project Quote
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      handleAddToCart(e, prod);
                      setViewProductSpecs(null);
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-[#1d73b7] hover:bg-[#165a91] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <ShoppingCart className="size-4" />
                    <span>Add To Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
