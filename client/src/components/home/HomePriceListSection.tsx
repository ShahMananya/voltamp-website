import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  FileText,
  Download,
  Eye,
  Search,
  Upload,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Share2,
  Plus,
  Trash2,
  ShieldCheck,
  Tag,
  ArrowRight,
  X,
  Clock,
  Layers,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  BRAND_DATA,
  INITIAL_CATALOGS,
  STORAGE_KEY,
  downloadPriceListBlob,
  type CatalogItem,
} from "@/data/priceListsData";

export default function HomePriceListSection() {
  const [, navigate] = useLocation();
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [catalogs, setCatalogs] = useState<CatalogItem[]>(INITIAL_CATALOGS);

  // Sales Portal Modal
  const [salesModalOpen, setSalesModalOpen] = useState<boolean>(false);
  const [isSalesAuthenticated, setIsSalesAuthenticated] = useState<boolean>(false);
  const [salesPinInput, setSalesPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  // Upload Form Fields
  const [uploadBrand, setUploadBrand] = useState<string>("Polycab");
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploadCategory, setUploadCategory] = useState<CatalogItem["category"]>("power-cables");
  const [uploadDocType, setUploadDocType] = useState<CatalogItem["docType"]>("Master Price List");
  const [uploadEffectiveDate, setUploadEffectiveDate] = useState<string>("W.E.F. October 2026");
  const [uploadCircularNo, setUploadCircularNo] = useState<string>("");
  const [uploadDiscountNote, setUploadDiscountNote] = useState<string>("Standard Contractor Discount: 40% OFF");
  const [uploadDescription, setUploadDescription] = useState<string>("");
  const [uploadFileName, setUploadFileName] = useState<string>("");
  const [uploadFileSize, setUploadFileSize] = useState<string>("3.5 MB");

  // Preview Modal
  const [previewCatalog, setPreviewCatalog] = useState<CatalogItem | null>(null);

  // Sync with localStorage on mount & listen for storage changes
  useEffect(() => {
    const syncCatalogs = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const customItems: CatalogItem[] = JSON.parse(stored);
          if (Array.isArray(customItems) && customItems.length > 0) {
            setCatalogs([...customItems, ...INITIAL_CATALOGS]);
            return;
          }
        }
        setCatalogs(INITIAL_CATALOGS);
      } catch (e) {
        console.error("Failed to load custom catalogs", e);
      }
    };

    syncCatalogs();
    window.addEventListener("storage", syncCatalogs);
    return () => window.removeEventListener("storage", syncCatalogs);
  }, []);

  // Filter catalogs
  const filteredCatalogs = useMemo(() => {
    return catalogs.filter((item) => {
      if (selectedBrand !== "All Brands" && item.brand !== selectedBrand) {
        return false;
      }
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.circularNo && item.circularNo.toLowerCase().includes(q)) ||
          item.docType.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [catalogs, selectedBrand, selectedCategory, searchQuery]);

  // Brand item counts for badges
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = { "All Brands": catalogs.length };
    BRAND_DATA.forEach((b) => {
      counts[b.name] = catalogs.filter((c) => c.brand === b.name).length;
    });
    return counts;
  }, [catalogs]);

  // PIN Login
  const handleSalesLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (salesPinInput.trim() === "volamp2026") {
      setIsSalesAuthenticated(true);
      setPinError("");
      toast.success("Welcome, Volamp Sales Team! Sales Upload Portal unlocked.");
    } else {
      setPinError("Invalid sales access code. Please contact your system administrator.");
    }
  };

  // Upload Form Submit
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      toast.error("Please enter a catalog title");
      return;
    }

    const newItem: CatalogItem = {
      id: `custom-${Date.now()}`,
      brand: uploadBrand,
      title: uploadTitle.trim(),
      category: uploadCategory,
      docType: uploadDocType,
      effectiveDate:
        uploadEffectiveDate.trim() ||
        `W.E.F. ${new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`,
      circularNo:
        uploadCircularNo.trim() ||
        `VOL/${uploadBrand.slice(0, 3).toUpperCase()}/${Date.now().toString().slice(-4)}`,
      discountNote: uploadDiscountNote.trim() || "Wholesale Contractor Rate: 40% OFF",
      fileFormat: uploadFileName.endsWith(".xlsx") ? "XLSX" : "PDF",
      fileSize: uploadFileSize || "3.5 MB",
      pages: Math.floor(Math.random() * 30) + 16,
      downloadUrl: "#download",
      isCustom: true,
      uploadedAt: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      description:
        uploadDescription.trim() ||
        `Official ${uploadBrand} ${uploadDocType} uploaded by Volamp Sales Team. Certified genuine manufacturer publication with locked contractor terms.`,
    };

    const updated = [newItem, ...catalogs];
    setCatalogs(updated);

    try {
      const existingCustom = catalogs.filter((c) => c.isCustom);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...existingCustom]));
    } catch (err) {
      console.error(err);
    }

    toast.success(`Published! "${newItem.title}" is now live on the catalog front-end.`);
    setUploadTitle("");
    setUploadFileName("");
    setUploadDescription("");
    setSalesModalOpen(false);
  };

  const handleDownload = (catalog: CatalogItem, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(`Downloading ${catalog.brand} official price list...`);
    downloadPriceListBlob(catalog);
    setTimeout(() => {
      toast.success(`Downloaded: ${catalog.title}`);
    }, 300);
  };

  const handleShare = (catalog: CatalogItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/price-list?brand=${encodeURIComponent(
      catalog.brand
    )}&id=${catalog.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Direct catalog link copied to clipboard!");
    } else {
      toast.info(`Catalog URL: ${shareUrl}`);
    }
  };

  const handleDeleteCatalog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this uploaded price list?")) {
      const updated = catalogs.filter((c) => c.id !== id);
      setCatalogs(updated);
      try {
        const remainingCustom = updated.filter((c) => c.isCustom);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingCustom));
      } catch (err) {
        console.error(err);
      }
      toast.success("Catalog removed successfully.");
    }
  };

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-stone-50 via-amber-50/20 to-white dark:from-[#0d0406] dark:via-[#16060a] dark:to-[#120406] border-y border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 pb-8 border-b border-stone-200/80 dark:border-stone-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#c56718]/10 text-[#c56718] dark:bg-amber-500/20 dark:text-amber-300 border border-[#c56718]/25 mb-3">
              <ShieldCheck className="size-3.5" />
              <span>AUTHORIZED DISTRIBUTOR PORTAL · 2026 REVISIONS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              Manufacturer Price Lists & Technical Catalogs
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-2xl">
              Instant access to authentic 2026 price circulars, wholesale discount schedules, and specification guides for India's top 8 electrical brands.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/price-list")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 font-bold text-xs uppercase tracking-wider border border-stone-300 dark:border-stone-700 hover:border-[#c56718] hover:text-[#c56718] shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <FileText className="size-3.5 text-[#c56718]" />
              <span>Manufacturer Price Lists</span>
            </button>

            <button
              onClick={() => navigate("/price-list")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c56718] hover:bg-[#a35210] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-orange-700/20 hover:shadow-orange-700/35 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Explore All {catalogs.length} Documents</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* 8 Authorized Brands Quick Selector Bar */}
        <div className="pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Filter by Authorized Brand (8 Configured Manufacturers):
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              Showing {filteredCatalogs.length} of {catalogs.length} catalogs
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedBrand("All Brands")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedBrand === "All Brands"
                  ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-md scale-102"
                  : "bg-stone-100 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              <span>All Brands</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-black/20">
                {brandCounts["All Brands"]}
              </span>
            </button>

            {BRAND_DATA.map((brand) => {
              const isSelected = selectedBrand === brand.name;
              const count = brandCounts[brand.name] || 0;
              return (
                <button
                  key={brand.name}
                  onClick={() => setSelectedBrand(brand.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                    isSelected
                      ? "bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-md ring-2 ring-[#c56718] border-transparent scale-102"
                      : "bg-white/80 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:border-stone-400"
                  }`}
                >
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: brand.accent }}
                  />
                  <span>{brand.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-[#c56718]/15 text-[#c56718] dark:text-amber-300 font-extrabold"
                        : "bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mt-2 mb-8 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Bar */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search circulars (e.g. Polycab 1.1kV, Havells MCB, Solar DC, Dowells lugs)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c56718]/40 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="md:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "All Categories" },
              { id: "power-cables", label: "Power Cables" },
              { id: "flexible-wires", label: "Building Wires" },
              { id: "switchgear", label: "Switchgear" },
              { id: "solar", label: "Solar DC" },
              { id: "accessories", label: "Glands & Lugs" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat.id
                    ? "bg-[#c56718]/15 text-[#c56718] dark:bg-amber-500/20 dark:text-amber-300 font-bold border border-[#c56718]/30"
                    : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalogs Grid */}
        {filteredCatalogs.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
            <Filter className="size-10 text-stone-400 mx-auto mb-3 opacity-60" />
            <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">
              No matching price lists found
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the selected brand/category filter.
            </p>
            <button
              onClick={() => {
                setSelectedBrand("All Brands");
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#c56718] text-white cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalogs.slice(0, 6).map((item) => {
              const brand = BRAND_DATA.find((b) => b.name === item.brand) || {
                name: item.brand,
                accent: "#c56718",
                bgLight: "bg-amber-50",
                badge: "Authorized",
              };

              return (
                <div
                  key={item.id}
                  onClick={() => setPreviewCatalog(item)}
                  className="group relative bg-white dark:bg-[#1a0a0d] rounded-2xl border border-stone-200 dark:border-stone-800/80 p-5 shadow-xs hover:shadow-xl hover:border-[#c56718]/50 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: brand.accent }}
                        />
                        <span className="font-extrabold text-xs tracking-wide uppercase text-stone-900 dark:text-stone-100">
                          {item.brand}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {item.docType}
                        </span>
                      </div>

                      {item.isCustom ? (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 shrink-0">
                          Sales Team Live
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 shrink-0">
                          {item.fileSize}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-[#c56718] dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Footer Details & Actions */}
                  <div className="mt-4 pt-3.5 border-t border-stone-100 dark:border-stone-800/80 space-y-3">
                    <div className="flex flex-col gap-1 text-[11px]">
                      <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3 text-[#c56718]" />
                          <span>{item.effectiveDate}</span>
                        </span>
                        {item.circularNo && (
                          <span className="font-mono text-[10px] text-stone-400 truncate max-w-[140px]">
                            {item.circularNo}
                          </span>
                        )}
                      </div>

                      {/* Discount Schedule Pill */}
                      <div className="px-2.5 py-1 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-[#c56718] dark:text-amber-300 font-bold text-[11px] truncate">
                        🏷️ {item.discountNote}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewCatalog(item);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="size-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDownload(item, e)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#c56718] hover:bg-[#a35210] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        <span>Download</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShare(item, e)}
                        className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                        title="Copy direct share link"
                      >
                        <Share2 className="size-3.5" />
                      </button>

                      {item.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCatalog(item.id, e)}
                          className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                          title="Delete uploaded catalog"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Banner to Full Price List Directory */}
        <div className="mt-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-stone-800">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-[#c56718]/20 border border-[#c56718]/40 flex items-center justify-center shrink-0">
              <FileText className="size-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-white">
                Looking for all 28+ Brand Catalogs & Full Specifications?
              </h4>
              <p className="text-xs sm:text-sm text-stone-300">
                Browse every series, download bulk ZIP archives, or verify your contractor discount terms.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => navigate("/price-list")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#c56718] hover:bg-[#a35210] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-orange-950/50"
            >
              <span>View All Price Lists</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Preview Modal */}
      {previewCatalog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setPreviewCatalog(null)}
        >
          <div
            className="relative w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewCatalog(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-[#c56718]/15 text-[#c56718] dark:text-amber-300">
                {previewCatalog.brand}
              </span>
              <span className="text-xs font-medium text-stone-400">
                {previewCatalog.docType}
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
              {previewCatalog.title}
            </h3>

            <div className="mt-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Effective Date:</span>
                <span className="font-semibold text-stone-900 dark:text-white">
                  {previewCatalog.effectiveDate}
                </span>
              </div>
              {previewCatalog.circularNo && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Circular No:</span>
                  <span className="font-mono text-stone-900 dark:text-white">
                    {previewCatalog.circularNo}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-stone-500">Document Format:</span>
                <span className="font-semibold text-stone-900 dark:text-white">
                  {previewCatalog.fileFormat} ({previewCatalog.fileSize})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Wholesale Terms:</span>
                <span className="font-bold text-[#c56718] dark:text-amber-300">
                  {previewCatalog.discountNote}
                </span>
              </div>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {previewCatalog.description}
            </p>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={(e) => handleDownload(previewCatalog, e)}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#c56718] hover:bg-[#a35210] text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                <Download className="size-4" />
                <span>Download Price Document</span>
              </button>
              <button
                onClick={() => {
                  setPreviewCatalog(null);
                  navigate("/price-list");
                }}
                className="inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <span>Full Directory</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Team Upload Modal */}
      {salesModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSalesModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-7 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSalesModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {!isSalesAuthenticated ? (
              /* PIN Challenge Screen */
              <form onSubmit={handleSalesLogin} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-amber-500/10 text-[#c56718] flex items-center justify-center shrink-0">
                    <Lock className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                      Volamp Sales Team Access
                    </h3>
                    <p className="text-xs text-stone-500">
                      Enter authorized sales PIN to publish live manufacturer price lists.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Sales Access Code:
                  </label>
                  <input
                    type="password"
                    autoFocus
                    placeholder="Enter authorized sales PIN"
                    value={salesPinInput}
                    onChange={(e) => {
                      setSalesPinInput(e.target.value);
                      setPinError("");
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c56718]/40"
                  />
                  {pinError && (
                    <p className="mt-1.5 text-xs text-rose-600 font-medium">{pinError}</p>
                  )}
                  <p className="mt-2 text-[11px] text-stone-400">
                    Authorized Volamp sales personnel access only.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#c56718] hover:bg-[#a35210] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                >
                  Unlock Sales Portal
                </button>
              </form>
            ) : (
              /* Upload / Publish Form */
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                  <div className="flex items-center gap-2">
                    <Unlock className="size-4 text-emerald-600" />
                    <h3 className="text-base font-bold text-stone-900 dark:text-white">
                      Publish New Price List to Live Site
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    Authenticated
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Manufacturer / Brand:
                  </label>
                  <select
                    value={uploadBrand}
                    onChange={(e) => setUploadBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#c56718]/40"
                  >
                    {BRAND_DATA.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name} ({b.badge})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Catalog / Price List Title:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Polycab Extra Flexible Copper Wires Tariff Q4"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#c56718]/40"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                      Category:
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) =>
                        setUploadCategory(e.target.value as CatalogItem["category"])
                      }
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white"
                    >
                      <option value="power-cables">Power Cables</option>
                      <option value="flexible-wires">Flexible Wires</option>
                      <option value="switchgear">Switchgear</option>
                      <option value="solar">Solar DC</option>
                      <option value="accessories">Accessories / Lugs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                      Document Type:
                    </label>
                    <select
                      value={uploadDocType}
                      onChange={(e) =>
                        setUploadDocType(e.target.value as CatalogItem["docType"])
                      }
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white"
                    >
                      <option value="Master Price List">Master Price List</option>
                      <option value="Discount Circular">Discount Circular</option>
                      <option value="Technical Catalog">Technical Catalog</option>
                      <option value="Specification Guide">Specification Guide</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                      Effective Date:
                    </label>
                    <input
                      type="text"
                      placeholder="W.E.F. October 2026"
                      value={uploadEffectiveDate}
                      onChange={(e) => setUploadEffectiveDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                      Circular Ref:
                    </label>
                    <input
                      type="text"
                      placeholder="POL/2026/Q4"
                      value={uploadCircularNo}
                      onChange={(e) => setUploadCircularNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Contractor Wholesale Discount Schedule:
                  </label>
                  <input
                    type="text"
                    placeholder="Standard Contractor Rate: 40% OFF"
                    value={uploadDiscountNote}
                    onChange={(e) => setUploadDiscountNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 dark:text-stone-300 mb-1">
                    Select Document (PDF / Excel):
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.xlsx,.xls"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadFileName(file.name);
                        setUploadFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
                        if (!uploadTitle) {
                          setUploadTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
                        }
                      }
                    }}
                    className="w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#c56718]/15 file:text-[#c56718] hover:file:bg-[#c56718]/25 cursor-pointer"
                  />
                  {uploadFileName && (
                    <span className="text-[11px] text-emerald-600 font-medium block mt-1">
                      ✓ Attached: {uploadFileName} ({uploadFileSize})
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-[#c56718] hover:bg-[#a35210] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md mt-2"
                >
                  Publish to Live Catalog
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
