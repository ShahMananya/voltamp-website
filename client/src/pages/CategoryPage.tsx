import { useState, useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Cable,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Headphones,
  LayoutGrid,
  PackageSearch,
  Search,
  ShieldCheck,
  Table as TableIcon,
  Tag,
  X,
  Zap,
} from "lucide-react";
import { Link, useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/ThemeToggle";
import { CATEGORIES, findSubcategory, getCategoryBySlug, getProductImage, ICON_MAP } from "@/data/categories";
import { trpc } from "@/lib/trpc";
import { QuickOrderModal } from "@/components/quickorder/QuickOrderModal";
import { EnquireModal } from "@/components/enquire/EnquireModal";
import FloatingActions from "@/components/FloatingActions";
import { toast } from "sonner";

function BrandMark() {
  return (
    <div className="brand-mark" aria-label="VOLAMP home">
      <img src="/volamp-logo.png" alt="VOLAMP Powering Growth" />
    </div>
  );
}

function parseSpecs(raw: any) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug ?? "";

  // Check if slug matches a top-level Category
  const matchedCategory = getCategoryBySlug(slug);

  // Check if slug matches a Subcategory
  const matchedSub = !matchedCategory ? findSubcategory(slug) : undefined;

  const category = matchedCategory ?? matchedSub?.category;
  const urlSubcategory = matchedSub?.subcategory;

  const fallbackName = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const title = urlSubcategory ? urlSubcategory.name : category?.name ?? fallbackName ?? "Category";
  const kicker = urlSubcategory
    ? `${category?.name ?? "CATEGORY"} · SUBCATEGORY SPECIFICATIONS`
    : `VOLAMP INDUSTRIAL CATALOG · ${category?.code ?? "01"}`;
  const description = urlSubcategory
    ? urlSubcategory.detail || `Explore technical specifications, coil lengths and wholesale procurement for ${urlSubcategory.name}.`
    : category?.detail ?? "Explore the approved Volamp electrical supply catalog.";

  const IconComponent = category ? ICON_MAP[category.iconName] || Cable : Cable;

  // View Mode: TILES (default as requested by user) or Table
  const [viewMode, setViewMode] = useState<"tiles" | "table">("tiles");

  // Local Subcategory Filter (when browsing top-level category)
  const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null);

  // Filter & Pagination State
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick Order & Enquire Modal State
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);
  const [enquireOpen, setEnquireOpen] = useState(false);
  const [selectedProductForOrder, setSelectedProductForOrder] = useState<any>(null);

  // Determine active subcategory (from URL or from pill filter)
  const effectiveSubcategory = useMemo(() => {
    if (urlSubcategory) return urlSubcategory;
    if (activeSubFilter && category) {
      return category.subcategories.find(
        (s) => s.slug === activeSubFilter || s.name === activeSubFilter
      );
    }
    return undefined;
  }, [urlSubcategory, activeSubFilter, category]);

  // Query Params for Live Product Catalog (16 items per page for clean 4x4 tile grid)
  const categoryQueryParam = category?.name || slug;
  const pageSize = viewMode === "table" ? 20 : 16;

  const { data: productsData, isLoading: isProductsLoading } = trpc.products.list.useQuery({
    category: categoryQueryParam,
    subcategory: effectiveSubcategory?.name,
    subcategories:
      effectiveSubcategory?.items && effectiveSubcategory.items.length > 0
        ? effectiveSubcategory.items
        : undefined,
    brand: selectedBrand || undefined,
    search: searchQuery.trim() || undefined,
    page,
    limit: pageSize,
  });

  const { data: availableBrands } = trpc.products.getBrands.useQuery({
    category: categoryQueryParam,
  });

  const handleOpenQuickOrder = (prod?: any) => {
    if (prod) {
      setSelectedProductForOrder({
        productId: prod.productId,
        name: prod.name,
        brand: prod.brand,
        specification: prod.size || prod.subcategory || "",
        unitPrice: prod.numericPrice || 0,
        quantity: 100,
      });
    } else {
      setSelectedProductForOrder(null);
    }
    setQuickOrderOpen(true);
  };

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success(`Copied Product ID: ${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubcategoryPillClick = (subSlug: string | null) => {
    setActiveSubFilter(subSlug);
    setPage(1);
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `VOLAMP ${title}`,
    description: description,
    image: "https://volampelektrikals.com/volamp-logo.png",
    brand: {
      "@type": "Brand",
      name: "VOLAMP ELEKTRIKALS",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: "12.00",
      highPrice: "95000.00",
      offerCount: productsData?.total || 100,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "VOLAMP ELEKTRIKALS PVT. LTD.",
      },
    },
  };

  return (
    <div className="category-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {/* Header */}
      <header className="category-page-header">
        <Link href="/">
          <BrandMark />
        </Link>
        <nav>
          <Link href="/">Marketplace</Link>
          <Link href="/#categories">All Categories</Link>
          <Link href="/about-volamp">About Volamp</Link>
          <Link href="/portal">Customer Portal</Link>
          <Link
            href="/collaborate"
            className="category-collaborate-link text-xs font-semibold text-amber-500 hover:text-amber-600"
          >
            Collaborate With Us
          </Link>
        </nav>
        <div className="category-page-actions">
          <ThemeToggle />
          <Button onClick={() => handleOpenQuickOrder()}>
            <Zap className="mr-1.5 size-4 text-amber-300" /> Quick Order
          </Button>
          <Link href="/?surface=inquiry">
            <Button variant="outline">
              Request Quote <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="category-page-main">
        {/* Breadcrumb Navigation */}
        <div className="category-breadcrumb-nav flex items-center gap-2 mb-4 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="category-back inline-flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
            <ArrowLeft className="size-3.5" /> Marketplace
          </Link>
          <span>/</span>
          {category && (
            <Link
              href={`/category/${category.slug}`}
              className={`hover:text-blue-600 dark:hover:text-blue-400 ${
                !urlSubcategory ? "text-slate-900 dark:text-white font-semibold" : ""
              }`}
            >
              {category.name}
            </Link>
          )}
          {urlSubcategory && (
            <>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-semibold">{urlSubcategory.name}</span>
            </>
          )}
        </div>

        {/* Category Hero Section */}
        <section className="category-hero">
          <div>
            <span className="market-kicker">{kicker}</span>
            <h1>{title}</h1>
            <p>{description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-white/15 text-xs text-slate-200">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-amber-400" /> IS / IEC Certified
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-emerald-400" /> Mill Test Certificate (MTC)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="size-4 text-amber-400" /> Ex-Factory Wholesale Supply
              </span>
            </div>
            <div className="category-hero-actions">
              <Button onClick={() => handleOpenQuickOrder()} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold">
                <Zap className="mr-1.5 size-4" /> Quick Order Catalog
              </Button>
              <Link href="/?surface=inquiry">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Request Project RFQ <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
              <Link href="/?surface=chat" className="category-text-link">
                <Headphones className="size-4" /> Ask Vola AI
              </Link>
            </div>
          </div>
          <div className="category-hero-art">
            <IconComponent className="size-24" />
            <span>{category?.code ?? "VOLAMP"}</span>
          </div>
        </section>

        {/* Subcategory Interactive Filter Strip (when on parent category) */}
        {!urlSubcategory && category && category.subcategories && category.subcategories.length > 0 && (
          <section className="mt-8 mb-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                Browse Subcategory Range ({category.subcategories.length}):
              </span>
              {activeSubFilter && (
                <button
                  onClick={() => handleSubcategoryPillClick(null)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Show All Subcategories
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              <button
                onClick={() => handleSubcategoryPillClick(null)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeSubFilter === null
                    ? "bg-[#09233a] text-white dark:bg-blue-600 dark:text-white shadow-xs"
                    : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                All {category.name} ({productsData?.total ?? 0})
              </button>
              {category.subcategories.map((sub) => {
                const isActive = activeSubFilter === sub.slug || activeSubFilter === sub.name;
                return (
                  <button
                    key={sub.slug}
                    onClick={() => handleSubcategoryPillClick(isActive ? null : sub.slug)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#09233a] text-white dark:bg-blue-600 dark:text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Master Catalog Control Toolbar */}
        <section className="mt-6 mb-8">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by size, conductor, rating, or keyword..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 pr-8 text-xs h-9 bg-slate-50 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Brand Filter Tabs */}
              {availableBrands && availableBrands.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
                  <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                    <Tag className="size-3" /> Brand:
                  </span>
                  <button
                    onClick={() => {
                      setSelectedBrand(null);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                      selectedBrand === null
                        ? "bg-[#09233a] text-white dark:bg-blue-600 dark:text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    All
                  </button>
                  {availableBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBrand(selectedBrand === b ? null : b);
                        setPage(1);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                        selectedBrand === b
                          ? "bg-[#09233a] text-white dark:bg-blue-600 dark:text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}

              {/* View Toggle & Count */}
              <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {productsData?.total ?? 0} items
                </span>
                <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode("tiles")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === "tiles"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Product Tiles View"
                  >
                    <LayoutGrid className="size-3.5" />
                    <span>Tiles</span>
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === "table"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                    title="Specification Table View"
                  >
                    <TableIcon className="size-3.5" />
                    <span>Table</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Query Status Bar */}
          {(searchQuery || selectedBrand || activeSubFilter) && (
            <div className="flex items-center justify-between gap-2 mt-2 px-1 text-xs text-slate-500">
              <div className="flex items-center gap-2 flex-wrap">
                <span>Active Filters:</span>
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    Brand: {selectedBrand}
                    <button onClick={() => setSelectedBrand(null)} className="hover:text-red-500">
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {activeSubFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    Subcategory: {activeSubFilter}
                    <button onClick={() => setActiveSubFilter(null)} className="hover:text-red-500">
                      <X className="size-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    Query: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-red-500">
                      <X className="size-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedBrand(null);
                  setActiveSubFilter(null);
                  setSearchQuery("");
                  setPage(1);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer shrink-0 font-medium"
              >
                Reset All
              </button>
            </div>
          )}

          {/* PRODUCT DISPLAY AREA */}
          {isProductsLoading ? (
            <div className="volamp-tile-grid mt-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 animate-pulse"
                >
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg mb-3" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2 mb-4" />
                  <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg mb-4" />
                  <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : productsData && productsData.products.length > 0 ? (
            viewMode === "tiles" ? (
              /* ELEGANT B2B PRODUCT TILES GRID (DEFAULT VIEW) */
              <div className="volamp-tile-grid mt-4">
                {productsData.products.map((prod) => {
                  const specs = parseSpecs(prod.specifications);
                  const isCopied = copiedId === prod.productId;
                  const prodImg = getProductImage(prod, category?.name);

                  return (
                    <div key={prod.productId} className="volamp-product-tile group">
                      <div>
                        {/* Tile Product Image Showcase */}
                        <div className="volamp-tile-image-box">
                          {/* Top Badges */}
                          <div className="volamp-tile-image-top">
                            <span className="volamp-tile-brand-badge">
                              {prod.brand}
                            </span>
                            <span className="volamp-tile-stock-badge">
                              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {prod.availability || "In Stock"}
                            </span>
                          </div>

                          {/* Real Product Image */}
                          <div className="volamp-tile-img-wrap">
                            <img
                              src={prodImg}
                              alt={prod.name}
                              loading="lazy"
                              className="volamp-tile-img"
                            />
                          </div>

                          {/* Bottom ID pill */}
                          <div className="volamp-tile-id-pill">
                            <span>{prod.productId}</span>
                            <button
                              onClick={(e) => handleCopyId(e, prod.productId)}
                              className="hover:text-white cursor-pointer"
                              title="Copy Product ID"
                            >
                              {isCopied ? (
                                <Check className="size-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="size-2.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Product Title */}
                        <h3 className="volamp-tile-title" title={prod.name}>
                          {prod.name}
                        </h3>

                        {/* Structured Technical Spec Matrix (Clean 2x2 Grid) */}
                        <div className="volamp-tile-specs">
                          <div className="volamp-spec-cell">
                            <span className="volamp-spec-label">Size / Rating</span>
                            <strong className="volamp-spec-val">
                              {prod.size || "Standard"}
                            </strong>
                          </div>
                          <div className="volamp-spec-cell">
                            <span className="volamp-spec-label">Material</span>
                            <strong className="volamp-spec-val">
                              {prod.material || "Industrial Grade"}
                            </strong>
                          </div>
                          <div className="volamp-spec-cell">
                            <span className="volamp-spec-label">Cores / Poles</span>
                            <strong className="volamp-spec-val">
                              {specs.cores || specs.polesPhase || "1 Core"}
                            </strong>
                          </div>
                          <div className="volamp-spec-cell">
                            <span className="volamp-spec-label">Voltage</span>
                            <strong className="volamp-spec-val">
                              {specs.voltageRating || "1100V"}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Footer: Price + Quick Order Button */}
                      <div className="volamp-tile-footer">
                        <div className="volamp-tile-price-row">
                          <div>
                            <span className="volamp-tile-price-label">
                              Wholesale Rate
                            </span>
                            <div className="volamp-tile-price-val">
                              <span className="volamp-tile-price-num">
                                {prod.discountedPrice || prod.price}
                              </span>
                              <span className="volamp-tile-price-unit">
                                / {prod.unit ? prod.unit.replace("Per ", "") : "Meter"}
                              </span>
                            </div>
                          </div>
                          {prod.discountedPrice && prod.price && prod.price !== prod.discountedPrice && (
                            <span className="volamp-tile-save-badge">
                              Save {prod.discount || "Wholesale"}
                            </span>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleOpenQuickOrder(prod)}
                          className="volamp-tile-order-btn"
                        >
                          <Zap className="size-3.5 fill-current" />
                          Quick Order / Quote
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* SPECIFICATION TABLE VIEW (OPTIONAL TOGGLE) */
              <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                        <th className="py-3 px-4 w-32">Product ID</th>
                        <th className="py-3 px-3 w-28">Brand</th>
                        <th className="py-3 px-4 min-w-[240px]">Specification & Item Description</th>
                        <th className="py-3 px-3 w-28">Size / Rating</th>
                        <th className="py-3 px-3 w-28">Material</th>
                        <th className="py-3 px-4 w-32 text-right">Wholesale Rate</th>
                        <th className="py-3 px-3 w-28">Availability</th>
                        <th className="py-3 px-4 w-32 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {productsData.products.map((prod) => {
                        const specs = parseSpecs(prod.specifications);
                        const isCopied = copiedId === prod.productId;

                        return (
                          <tr
                            key={prod.productId}
                            className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors group"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                              <div className="flex items-center gap-1.5">
                                <span>{prod.productId}</span>
                                <button
                                  onClick={(e) => handleCopyId(e, prod.productId)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                  title="Copy Product ID"
                                >
                                  {isCopied ? (
                                    <Check className="size-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="size-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                                {prod.brand}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900 dark:text-white leading-snug">
                                {prod.name}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                                {prod.subcategory && <span>{prod.subcategory}</span>}
                                {specs.cores && <span>· {specs.cores}</span>}
                                {specs.voltageRating && <span>· {specs.voltageRating}</span>}
                              </div>
                            </td>
                            <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">
                              {prod.size || "Standard"}
                            </td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                              {prod.material || "Industrial Grade"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                                {prod.discountedPrice || prod.price}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {prod.unit || "Per Unit"}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                {prod.availability || "In Stock"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Button
                                size="sm"
                                onClick={() => handleOpenQuickOrder(prod)}
                                className="h-7 px-3 text-xs font-bold bg-[#d97818] hover:bg-[#c26710] text-white shadow-xs transition-all"
                              >
                                <Zap className="mr-1 size-3" />
                                Quick Order
                              </Button>
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
            <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-6 bg-white dark:bg-slate-900">
              <PackageSearch className="size-8 mx-auto text-slate-400 mb-2" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200">No matching products found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching for a different size, clear your brand filter, or contact the Volamp quote desk for custom manufacturing.
              </p>
              <div className="flex items-center justify-center gap-3 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedBrand(null);
                    setActiveSubFilter(null);
                    setSearchQuery("");
                    setPage(1);
                  }}
                  className="text-xs"
                >
                  Reset Filters
                </Button>
                <Link href="/?surface=inquiry">
                  <Button size="sm" className="text-xs">
                    Contact Quote Desk
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Clean Pagination Controls */}
          {productsData && productsData.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs mt-6">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Showing {productsData.products.length} of {productsData.total} products (Page {productsData.page} of {productsData.totalPages})
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 text-xs gap-1"
                >
                  <ChevronLeft className="size-3.5" /> Previous
                </Button>
                <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                  {page} / {productsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= productsData.totalPages}
                  onClick={() => setPage((p) => Math.min(productsData.totalPages, p + 1))}
                  className="h-8 text-xs gap-1"
                >
                  Next <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* All Categories Quick Navigation */}
        <section className="category-other-section mt-12 pt-6 border-t border-slate-200 dark:border-slate-800">
          <span className="market-kicker">EXPLORE OTHER VOLAMP CATEGORIES</span>
          <div className="category-pills-row mt-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`category-pill ${cat.id === category?.id ? "is-active" : ""}`}
              >
                <span>{cat.code}</span> {cat.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Support & RFQ Banner */}
        <section className="category-support mt-8">
          <div>
            <FileText className="size-5 text-blue-600" />
            <div>
              <strong>Need custom project manufacturing or bulk institutional supply?</strong>
              <span>
                Share your bill of materials (BOM), specifications, and target project delivery date with our supply desk.
              </span>
            </div>
          </div>
          <Button variant="outline" onClick={() => setEnquireOpen(true)}>
            Start an Enquiry <ArrowRight className="ml-2 size-4" />
          </Button>
        </section>
      </main>

      {/* Floating Action Buttons */}
      <FloatingActions onOpenChat={() => (window.location.href = "/?surface=chat")} />

      {/* QUICK ORDER MODAL INTEGRATION */}
      <QuickOrderModal
        isOpen={quickOrderOpen}
        onClose={() => setQuickOrderOpen(false)}
        initialProduct={selectedProductForOrder}
      />

      {/* ENQUIRE MODAL INTEGRATION */}
      <EnquireModal
        isOpen={enquireOpen}
        onClose={() => setEnquireOpen(false)}
        initialCategory={category?.name}
      />
    </div>
  );
}
