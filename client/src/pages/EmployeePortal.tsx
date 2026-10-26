import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import SeoHead from "@/components/seo/SeoHead";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileDown,
  FileText,
  Headphones,
  Loader2,
  LogOut,
  MessageCircle,
  PackageSearch,
  ShieldCheck,
  UserCheck,
  Users,
  Zap,
  Database,
  RefreshCw,
  Layers,
  Tag,
  Search,
  X,
  Plus,
  Send,
  Trash2,
  Edit3,
  Wrench,
  BookOpen,
  Mail,
  FileSpreadsheet,
  Check,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { downloadQuickOrderPdf, QuickOrderItem } from "@/lib/quickOrderPdf";
import { WhatsAppInvoiceModal } from "@/components/invoice/WhatsAppInvoiceModal";

const WORKSPACE_URL = "https://script.google.com/macros/s/AKfycbwgYP4k3qFbgwxfsaXqcHzBIZyyOknjPDPqBoeT0FvEchs8sY8FMT-A_tcQ2TF_qTQF/exec";

export default function EmployeePortal() {
  const [, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"options" | "maintenance" | "pricing" | "blogs" | "newsletters" | "pricelists" | "queues">("options");
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceDefaults, setInvoiceDefaults] = useState({
    customer: "",
    company: "",
    reference: "",
  });

  // Product Pricing & Catalog State
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editDiscountedPrice, setEditDiscountedPrice] = useState("");
  const [editDiscount, setEditDiscount] = useState("");
  const [editStatus, setEditStatus] = useState<"Active" | "Inactive" | "Out of Stock" | "Discontinued">("Active");

  // Add Product Modal State
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Wires & Cables");
  const [newProdSubcategory, setNewProdSubcategory] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("Polycab");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdDiscountedPrice, setNewProdDiscountedPrice] = useState("");
  const [newProdDiscount, setNewProdDiscount] = useState("40% OFF");
  const [newProdUnit, setNewProdUnit] = useState("Per Metre");
  const [newProdSize, setNewProdSize] = useState("");
  const [newProdMaterial, setNewProdMaterial] = useState("Copper");
  const [newProdDescription, setNewProdDescription] = useState("");
  const [newProdStatus, setNewProdStatus] = useState<"Active" | "Inactive">("Active");

  // Blog Publishing State
  const [blogTitle, setBlogTitle] = useState("");
  const [blogCategory, setBlogCategory] = useState("Technical Engineering");
  const [blogAuthor, setBlogAuthor] = useState("");
  const [blogReadTime, setBlogReadTime] = useState("5 min read");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogTags, setBlogTags] = useState("");
  const [blogImage, setBlogImage] = useState("/products/cables.jpg");

  // Newsletter Publishing State
  const [newsletterTitle, setNewsletterTitle] = useState("");
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [newsletterAudience, setNewsletterAudience] = useState("All Verified Subscribers & Contractors");
  const [newsletterContent, setNewsletterContent] = useState("");

  // Price List Push State
  const [plBrand, setPlBrand] = useState("Polycab");
  const [plTitle, setPlTitle] = useState("");
  const [plCategory, setPlCategory] = useState<"power-cables" | "flexible-wires" | "switchgear" | "solar" | "accessories">("power-cables");
  const [plDocType, setPlDocType] = useState<"Master Price List" | "Discount Circular" | "Technical Catalog" | "Specification Guide">("Master Price List");
  const [plEffectiveDate, setPlEffectiveDate] = useState("W.E.F. November 2026");
  const [plCircularNo, setPlCircularNo] = useState("");
  const [plDiscountNote, setPlDiscountNote] = useState("Standard Contractor Discount: 42% OFF");
  const [plFormat, setPlFormat] = useState<"PDF" | "XLSX">("PDF");
  const [plDownloadUrl, setPlDownloadUrl] = useState("");
  const [plDescription, setPlDescription] = useState("");

  const [previewDiffData, setPreviewDiffData] = useState<any>(null);

  // Queries
  const categoriesQuery = trpc.products.getCategories.useQuery();
  const productsListQuery = trpc.products.list.useQuery({
    search: productSearch || undefined,
    category: selectedProductCategory || undefined,
    limit: 20,
  });
  const blogsQuery = trpc.blogs.list.useQuery();
  const newslettersQuery = trpc.newsletter.listDispatches.useQuery(undefined, {
    enabled: Boolean(user && user.accountType === "employee"),
  });
  const pushedPriceListsQuery = trpc.priceLists.list.useQuery();
  const dashboardQuery = trpc.employee.dashboard.useQuery(undefined, {
    enabled: Boolean(user && user.accountType === "employee"),
  });

  // Mutations
  const updatePriceMutation = trpc.products.updatePrice.useMutation({
    onSuccess: () => {
      toast.success("Price Updated Successfully!", {
        description: `Product prices committed to live database.`,
      });
      setEditingProduct(null);
      productsListQuery.refetch();
    },
    onError: (err) => {
      toast.error("Failed to update price", { description: err.message });
    },
  });

  const addProductMutation = trpc.products.addProduct.useMutation({
    onSuccess: (res) => {
      toast.success("Product Added to Live Catalog!", {
        description: `Added "${res.product.name}" (${res.product.productId}).`,
      });
      setAddProductModalOpen(false);
      setNewProdName("");
      setNewProdPrice("");
      setNewProdDescription("");
      productsListQuery.refetch();
      categoriesQuery.refetch();
    },
    onError: (err) => {
      toast.error("Failed to add product", { description: err.message });
    },
  });

  const publishBlogMutation = trpc.blogs.create.useMutation({
    onSuccess: () => {
      toast.success("Blog Published to Volamp Journal!", {
        description: "Article is now live on the website for all visitors.",
      });
      setBlogTitle("");
      setBlogExcerpt("");
      setBlogContent("");
      setBlogTags("");
      blogsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Failed to publish blog", { description: err.message });
    },
  });

  const deleteBlogMutation = trpc.blogs.delete.useMutation({
    onSuccess: () => {
      toast.success("Blog Post Deleted");
      blogsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const publishNewsletterMutation = trpc.newsletter.publish.useMutation({
    onSuccess: () => {
      toast.success("Newsletter Dispatched & Published!", {
        description: "Sent to verified subscribers and recorded in portal archives.",
      });
      setNewsletterTitle("");
      setNewsletterSubject("");
      setNewsletterContent("");
      newslettersQuery.refetch();
    },
    onError: (err) => {
      toast.error("Failed to publish newsletter", { description: err.message });
    },
  });

  const pushPriceListMutation = trpc.priceLists.push.useMutation({
    onSuccess: (res) => {
      toast.success("Price List Pushed Live!", {
        description: `"${res.item.title}" is now available on /price-list.`,
      });
      setPlTitle("");
      setPlCircularNo("");
      setPlDescription("");
      pushedPriceListsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Failed to push price list", { description: err.message });
    },
  });

  const deletePriceListMutation = trpc.priceLists.delete.useMutation({
    onSuccess: () => {
      toast.success("Price List Removed");
      pushedPriceListsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const approveMutation = trpc.employee.approveEmployee.useMutation({
    onSuccess: () => {
      toast.success("Employee Approved", {
        description: "The employee account has been granted official access.",
      });
      dashboardQuery.refetch();
    },
    onError: (err) => {
      toast.error("Approval Failed", { description: err.message });
    },
  });

  const handleApprove = (userId: number) => {
    setApprovingId(userId);
    approveMutation.mutate({ userId });
  };

  const handleLogout = async () => {
    await logout();
    toast.info("Logged Out", { description: "You have securely signed out." });
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf9] dark:bg-[#071b2d]">
        <Loader2 className="animate-spin text-[#c56718] size-8" />
      </div>
    );
  }

  // Strict employee access check
  if (!user || user.accountType !== "employee") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#fdfbf9] dark:bg-[#071b2d]">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-[#102b42] border border-[#d2e0e8] dark:border-[#29465b] text-center shadow-xl">
          <div className="size-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="size-7" />
          </div>
          <h1 className="text-xl font-bold text-[#102a40] dark:text-white font-['Plus_Jakarta_Sans',sans-serif]">
            Employee Portal Restricted
          </h1>
          <p className="text-xs text-[#6e808b] dark:text-[#b6c8d3] mt-2 mb-6 leading-relaxed">
            This workspace is strictly reserved for verified VOLAMP employees. Please sign in with your official employee account.
          </p>
          <Link href="/">
            <Button className="w-full bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-semibold py-2.5">
              Back to Homepage <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const data = dashboardQuery.data;
  const pendingEmployees = data?.pendingEmployees ?? [];
  const quotations = data?.quotations ?? [];
  const orders = data?.orders ?? [];

  return (
    <div className="min-h-screen bg-[#fdfbf9] dark:bg-[#071b2d] text-[#142b40] dark:text-slate-100 transition-colors">
      <SeoHead
        title="VOLAMP Employee Operations & Website Maintenance Portal"
        description="Internal employee operations, workspace access, product pricing, blog editorial desk, and price list management."
        noindex={true}
      />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-[#0c2438] border-b border-[#ebd7c7] dark:border-white/10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-[#c56718] hover:underline"
            >
              <ArrowLeft className="size-4" /> VOLAMP Site
            </Link>
            <span className="text-xs font-mono text-slate-400 border-l border-slate-300 dark:border-slate-700 pl-3 hidden sm:inline">
              EMPLOYEE PORTAL
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href={WORKSPACE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-xs"
              title="Open Official Google Apps Script Workspace"
            >
              <Briefcase className="size-3.5" />
              <span>Workspace</span>
              <ExternalLink className="size-3 opacity-80" />
            </a>

            <ThemeToggle />

            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold hidden sm:inline">{user.name || user.email?.split("@")[0]}</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-[#c56718]">
                Staff
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1"
            >
              <LogOut className="size-3.5" /> <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* =========================================================================
            CRITICAL REQUIREMENT: 2 PRIMARY OPTIONS FOR EMPLOYEES UPON LOGIN
            1) Go to Workspace (Shared Google Apps Script Link)
            2) Website Maintenance
            ========================================================================= */}
        <section className="bg-gradient-to-br from-white to-[#f7ede6]/40 dark:from-[#0d263c] dark:to-[#081827] rounded-3xl p-6 sm:p-8 border border-[#ebd7c7] dark:border-white/10 shadow-sm">
          <div className="max-w-3xl mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-[#c56718] dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="size-3.5" /> Verified Staff Access Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4d1217] dark:text-white font-['Plus_Jakarta_Sans',sans-serif]">
              Welcome, {user.name || "VOLAMP Team Member"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Select one of the two core operational destinations below to proceed:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* OPTION 1: GO TO WORKSPACE */}
            <div className="group relative rounded-2xl bg-white dark:bg-[#102b42] border-2 border-purple-300/80 dark:border-purple-500/40 p-6 flex flex-col justify-between hover:border-purple-500 hover:shadow-xl transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                    <Briefcase className="size-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 tracking-wider">
                    Option 1 · Official ERP
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    1) Go to Official Workspace
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Access the central Google Apps Script Commercial ERP to manage factory stock availability, warehouse bookings, contractor rate sheets, and live logistics orders.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={WORKSPACE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md group-hover:scale-[1.01]"
                >
                  <span>Launch Official Workspace</span>
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>

            {/* OPTION 2: WEBSITE MAINTENANCE */}
            <div className="group relative rounded-2xl bg-white dark:bg-[#102b42] border-2 border-amber-300/80 dark:border-amber-500/40 p-6 flex flex-col justify-between hover:border-amber-500 hover:shadow-xl transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="size-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-[#c56718] dark:text-amber-400 flex items-center justify-center font-bold">
                    <Wrench className="size-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 tracking-wider">
                    Option 2 · Live CMS
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#c56718] dark:group-hover:text-amber-400 transition-colors">
                    2) Website Maintenance
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Update product prices, add new cables and switchgear to the live catalog, publish blog technical guides to Volamp Journal, dispatch newsletters, and push manufacturer price lists.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setActiveTab("pricing");
                    const el = document.getElementById("maintenance-workbench");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#c56718] hover:bg-[#b45309] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md group-hover:scale-[1.01] cursor-pointer"
                >
                  <Wrench className="size-4" />
                  <span>Enter Website Maintenance</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            WEBSITE MAINTENANCE WORKBENCH (INTERNAL EMPLOYEE CMS)
            ========================================================================= */}
        <div id="maintenance-workbench" className="space-y-6">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-[#102b42] border border-[#ebd7c7] dark:border-white/10 shadow-xs">
            <button
              onClick={() => setActiveTab("pricing")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "pricing"
                  ? "bg-[#c56718] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Tag className="size-4" />
              <span>Update Price & Add Products</span>
            </button>

            <button
              onClick={() => setActiveTab("blogs")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "blogs"
                  ? "bg-[#c56718] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <BookOpen className="size-4" />
              <span>Publish Blogs (Journal)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                {blogsQuery.data?.length ?? 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("newsletters")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "newsletters"
                  ? "bg-[#c56718] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Mail className="size-4" />
              <span>Publish Newsletters</span>
            </button>

            <button
              onClick={() => setActiveTab("pricelists")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "pricelists"
                  ? "bg-[#c56718] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <FileSpreadsheet className="size-4" />
              <span>Push Price Lists</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                {pushedPriceListsQuery.data?.length ?? 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("queues")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ml-auto ${
                activeTab === "queues"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Users className="size-4" />
              <span>Commercial Queues</span>
              {pendingEmployees.length > 0 && (
                <span className="size-2 rounded-full bg-red-500 animate-ping" />
              )}
            </button>
          </div>

          {/* TAB 1: PRODUCT PRICING & ADD PRODUCTS */}
          {activeTab === "pricing" && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#ebd7c7] dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Tag className="size-5 text-[#c56718]" />
                    Product Pricing & Live Catalog Control
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Search any SKU or product name to update rates, or add brand new products into the live store.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setAddProductModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="size-4" /> Add More Products
                  </Button>
                </div>
              </div>

              {/* Price Editor Quick Modal / Drawer */}
              {editingProduct && (
                <div className="p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-600 shadow-md space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#c56718] dark:text-amber-400">
                        Editing Price for SKU: {editingProduct.sku || editingProduct.productId}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {editingProduct.name} ({editingProduct.brand})
                      </h3>
                      <span className="text-xs text-slate-500">Category: {editingProduct.category} · {editingProduct.unit}</span>
                    </div>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="p-1 rounded-full hover:bg-black/10 cursor-pointer"
                    >
                      <X className="size-4 text-slate-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Master List Price (₹)</Label>
                      <Input
                        type="text"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="e.g. 142 or ₹142"
                        className="mt-1 text-xs bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Net Wholesale Price (₹)</Label>
                      <Input
                        type="text"
                        value={editDiscountedPrice}
                        onChange={(e) => setEditDiscountedPrice(e.target.value)}
                        placeholder="e.g. 85 or ₹85"
                        className="mt-1 text-xs bg-white dark:bg-slate-900 font-mono font-bold text-emerald-600"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contractor Discount %</Label>
                      <Input
                        type="text"
                        value={editDiscount}
                        onChange={(e) => setEditDiscount(e.target.value)}
                        placeholder="e.g. 40% OFF"
                        className="mt-1 text-xs bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">Status</Label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as any)}
                        className="mt-1 w-full text-xs h-9 px-3 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                      >
                        <option value="Active">Active (In Stock)</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Discontinued">Discontinued</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(null)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={updatePriceMutation.isPending}
                      onClick={() => {
                        const numeric = parseFloat(editPrice.replace(/[^0-9.]/g, "")) || undefined;
                        updatePriceMutation.mutate({
                          productId: editingProduct.productId,
                          price: editPrice,
                          numericPrice: numeric,
                          discountedPrice: editDiscountedPrice,
                          discount: editDiscount,
                          status: editStatus,
                        });
                      }}
                      className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold"
                    >
                      {updatePriceMutation.isPending ? "Saving..." : "Save & Commit New Price"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Product Catalog Search & Table */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#ebd7c7] dark:border-white/10 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search 3,385+ products by SKU, name, or size..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-8 text-xs h-9 bg-white dark:bg-slate-900"
                    />
                    {productSearch && (
                      <button
                        onClick={() => setProductSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">
                    Showing {productsListQuery.data?.products?.length ?? 0} items
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                        <th className="py-2.5 px-3">Product ID</th>
                        <th className="py-2.5 px-3">Brand</th>
                        <th className="py-2.5 px-3">Product Name & Size</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Master Rate</th>
                        <th className="py-2.5 px-3 text-right">Wholesale Rate</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {(productsListQuery.data?.products ?? []).map((p) => (
                        <tr key={p.productId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#c56718]">{p.productId}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">{p.brand}</td>
                          <td className="py-2.5 px-3">
                            <strong className="block text-slate-900 dark:text-white">{p.name}</strong>
                            <span className="text-[10px] text-slate-400">{p.size || p.subcategory} · {p.material}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-500">{p.price}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                            {p.discountedPrice || p.price}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingProduct(p);
                                setEditPrice(p.price || "");
                                setEditDiscountedPrice(p.discountedPrice || "");
                                setEditDiscount(p.discount || "");
                                setEditStatus((p.status as any) || "Active");
                              }}
                              className="h-7 text-xs gap-1 border-amber-300 hover:bg-amber-50 text-[#c56718] cursor-pointer"
                            >
                              <Edit3 className="size-3" /> Update Price
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PUBLISH BLOGS (JOURNAL) */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              {/* Form to Publish New Blog */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#102b42] border border-[#ebd7c7] dark:border-white/10 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="size-5 text-[#c56718]" />
                      Publish New Blog Post to Volamp Journal
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Articles published here are immediately displayed on <strong>/blog</strong> for contractors, engineers, and website visitors.
                    </p>
                  </div>
                  <Link href="/blog" target="_blank" className="text-xs font-bold text-[#c56718] hover:underline flex items-center gap-1">
                    View Public Blog <ExternalLink className="size-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-bold">Article Title</Label>
                    <Input
                      type="text"
                      placeholder="e.g. 1.1kV HT XLPE Cable Installation Standards & Trench Sizing"
                      value={blogTitle}
                      onChange={(e) => setBlogTitle(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold">Category</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Technical Engineering, Market Trends, Compliance"
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold">Author</Label>
                    <Input
                      type="text"
                      placeholder={user.name || "VOLAMP Engineering Team"}
                      value={blogAuthor}
                      onChange={(e) => setBlogAuthor(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold">Estimated Read Time</Label>
                    <Input
                      type="text"
                      placeholder="e.g. 5 min read"
                      value={blogReadTime}
                      onChange={(e) => setBlogReadTime(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold">Tags (Comma-separated)</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Power Cable, Sizing, IS 7098, Copper"
                      value={blogTags}
                      onChange={(e) => setBlogTags(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-bold">Short Excerpt / Summary</Label>
                    <Textarea
                      rows={2}
                      placeholder="Concise overview highlighting key takeaway for contractors..."
                      value={blogExcerpt}
                      onChange={(e) => setBlogExcerpt(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-bold">Full Article Content (Markdown or Text)</Label>
                    <Textarea
                      rows={8}
                      placeholder="Write the full technical content, standards, calculation tables, or guidelines here..."
                      value={blogContent}
                      onChange={(e) => setBlogContent(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    disabled={publishBlogMutation.isPending || !blogTitle.trim() || !blogContent.trim()}
                    onClick={() => {
                      const tagsArray = blogTags.split(",").map((t) => t.trim()).filter(Boolean);
                      publishBlogMutation.mutate({
                        title: blogTitle.trim(),
                        category: blogCategory.trim(),
                        author: blogAuthor.trim() || user.name || "VOLAMP Editorial Desk",
                        readTime: blogReadTime.trim(),
                        excerpt: blogExcerpt.trim() || blogTitle.trim(),
                        content: blogContent.trim(),
                        tags: tagsArray.length ? tagsArray : ["Electrical", "Volamp"],
                        imageUrl: blogImage,
                      });
                    }}
                    className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold gap-2 px-5 py-2.5 cursor-pointer shadow-sm"
                  >
                    <Send className="size-4" />
                    {publishBlogMutation.isPending ? "Publishing..." : "Publish Article to Volamp Journal"}
                  </Button>
                </div>
              </div>

              {/* Published Blogs Archive */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#ebd7c7] dark:border-white/10 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Currently Published Articles ({blogsQuery.data?.length ?? 0})
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(blogsQuery.data ?? []).map((blog) => (
                    <div key={blog.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-[#c56718]">
                            {blog.category}
                          </span>
                          <span className="text-xs text-slate-400">{blog.date} · {blog.readTime}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{blog.title}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{blog.excerpt}</p>
                        <span className="text-[11px] text-slate-400">By <strong>{blog.author}</strong></span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/blog#${blog.slug}`} target="_blank">
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                            <ExternalLink className="size-3" /> View
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm(`Delete blog post "${blog.title}"?`)) {
                              deleteBlogMutation.mutate({ id: blog.id });
                            }
                          }}
                          className="h-7 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PUBLISH NEWSLETTERS */}
          {activeTab === "newsletters" && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#102b42] border border-[#ebd7c7] dark:border-white/10 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Mail className="size-5 text-[#c56718]" />
                      Compose & Dispatch Official Newsletter
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Publish weekly / monthly market digests and circular announcements to verified subscribers.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Subscriber Base</span>
                    <strong className="text-base font-extrabold text-[#c56718]">240+ Registered</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold">Newsletter Issue Title</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Volamp Weekly Industrial Pulse #43"
                      value={newsletterTitle}
                      onChange={(e) => setNewsletterTitle(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold">Email Subject Line</Label>
                    <Input
                      type="text"
                      placeholder="e.g. New Polycab Rate Circulars & Live LME Metal Fluctuations"
                      value={newsletterSubject}
                      onChange={(e) => setNewsletterSubject(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-bold">Target Audience Segment</Label>
                    <select
                      value={newsletterAudience}
                      onChange={(e) => setNewsletterAudience(e.target.value)}
                      className="mt-1 w-full text-xs h-9 px-3 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      <option value="All Verified Subscribers & Contractors">All Verified Subscribers & Contractors (Default)</option>
                      <option value="EPC Contractors & Project Engineers">EPC Contractors & Project Engineers</option>
                      <option value="Industrial Dealers & Wholesalers">Industrial Dealers & Wholesalers</option>
                      <option value="Solar Developers & Renewable Clients">Solar Developers & Renewable Clients</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-bold">Newsletter Content / Market Digest</Label>
                    <Textarea
                      rows={6}
                      placeholder="Compose the newsletter digest, new stock arrivals at Aslali hub, price circular changes, copper trends..."
                      value={newsletterContent}
                      onChange={(e) => setNewsletterContent(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    disabled={publishNewsletterMutation.isPending || !newsletterTitle.trim() || !newsletterContent.trim()}
                    onClick={() => {
                      publishNewsletterMutation.mutate({
                        title: newsletterTitle.trim(),
                        subject: newsletterSubject.trim() || newsletterTitle.trim(),
                        targetAudience: newsletterAudience,
                        content: newsletterContent.trim(),
                      });
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2 px-5 py-2.5 cursor-pointer shadow-sm"
                  >
                    <Send className="size-4" />
                    {publishNewsletterMutation.isPending ? "Dispatching..." : "Publish & Dispatch Newsletter"}
                  </Button>
                </div>
              </div>

              {/* Newsletter Archives */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#ebd7c7] dark:border-white/10 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Past Newsletter Dispatches ({newslettersQuery.data?.length ?? 0})
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(newslettersQuery.data ?? []).map((nl) => (
                    <div key={nl.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <strong className="block font-bold text-slate-900 dark:text-white">{nl.title}</strong>
                        <span className="text-slate-500">Subject: {nl.subject}</span>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span>Audience: <strong>{nl.targetAudience}</strong></span>
                          <span>•</span>
                          <span>Recipients: <strong>{nl.recipientCount}</strong></span>
                          <span>•</span>
                          <span>Date: {new Date(nl.dispatchedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] self-start sm:self-auto">
                        DISPATCHED
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PUSH PRICE LISTS */}
          {activeTab === "pricelists" && (
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#102b42] border border-[#ebd7c7] dark:border-white/10 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileSpreadsheet className="size-5 text-[#c56718]" />
                      Push Manufacturer Price List to Live Site
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      New price lists pushed here immediately show up on <strong>/price-list</strong> with one-click PDF downloads and contractor discount structures.
                    </p>
                  </div>
                  <Link href="/price-list" target="_blank" className="text-xs font-bold text-[#c56718] hover:underline flex items-center gap-1">
                    View Live /price-list <ExternalLink className="size-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-bold">Brand</Label>
                    <select
                      value={plBrand}
                      onChange={(e) => setPlBrand(e.target.value)}
                      className="mt-1 w-full text-xs h-9 px-3 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      <option value="Polycab">Polycab India Ltd.</option>
                      <option value="Havells">Havells India Ltd.</option>
                      <option value="RR Kabel">RR Kabel Ltd.</option>
                      <option value="KEI Industries">KEI Industries Ltd.</option>
                      <option value="Finolex">Finolex Cables Ltd.</option>
                      <option value="Schneider Electric">Schneider Electric</option>
                      <option value="L&T / LK">L&T / LK Switchgear</option>
                      <option value="Dowells">Dowells (Lugs & Glands)</option>
                      <option value="Volamp OEM">Volamp OEM Systems</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs font-bold">Category</Label>
                    <select
                      value={plCategory}
                      onChange={(e) => setPlCategory(e.target.value as any)}
                      className="mt-1 w-full text-xs h-9 px-3 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      <option value="power-cables">Power & Armoured Cables</option>
                      <option value="flexible-wires">Flexible Building Wires</option>
                      <option value="switchgear">Switchgear & Distribution</option>
                      <option value="solar">Solar Photovoltaic Cables</option>
                      <option value="accessories">Lugs, Glands & Earthing</option>
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs font-bold">Document Type</Label>
                    <select
                      value={plDocType}
                      onChange={(e) => setPlDocType(e.target.value as any)}
                      className="mt-1 w-full text-xs h-9 px-3 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                    >
                      <option value="Master Price List">Master Price List</option>
                      <option value="Discount Circular">Discount Circular</option>
                      <option value="Technical Catalog">Technical Catalog</option>
                      <option value="Specification Guide">Specification Guide</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-bold">Document Title</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Polycab HT XLPE Power Cables Official Price List 2026-Q4"
                      value={plTitle}
                      onChange={(e) => setPlTitle(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold">Effective Date</Label>
                    <Input
                      type="text"
                      placeholder="e.g. W.E.F. November 2026"
                      value={plEffectiveDate}
                      onChange={(e) => setPlEffectiveDate(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold">Circular Reference Number</Label>
                    <Input
                      type="text"
                      placeholder="e.g. POL/HT/2026-Q4/12"
                      value={plCircularNo}
                      onChange={(e) => setPlCircularNo(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold">Contractor Discount Note</Label>
                    <Input
                      type="text"
                      placeholder="e.g. Contractor Direct Discount: 44.5% OFF List"
                      value={plDiscountNote}
                      onChange={(e) => setPlDiscountNote(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900 font-bold text-amber-600"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold">Format & File Size</Label>
                    <div className="flex gap-2 mt-1">
                      <select
                        value={plFormat}
                        onChange={(e) => setPlFormat(e.target.value as any)}
                        className="text-xs h-9 px-2 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                      >
                        <option value="PDF">PDF</option>
                        <option value="XLSX">XLSX</option>
                      </select>
                      <Input
                        type="text"
                        placeholder="e.g. /catalogs/polycab-ht.pdf"
                        value={plDownloadUrl}
                        onChange={(e) => setPlDownloadUrl(e.target.value)}
                        className="text-xs bg-white dark:bg-slate-900 flex-1"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <Label className="text-xs font-bold">Description & Technical Summary</Label>
                    <Textarea
                      rows={2}
                      placeholder="Comprehensive overview of voltages, conductor specs, and contractor order minimums..."
                      value={plDescription}
                      onChange={(e) => setPlDescription(e.target.value)}
                      className="mt-1 text-xs bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    disabled={pushPriceListMutation.isPending || !plTitle.trim()}
                    onClick={() => {
                      pushPriceListMutation.mutate({
                        brand: plBrand,
                        title: plTitle.trim(),
                        category: plCategory,
                        docType: plDocType,
                        effectiveDate: plEffectiveDate.trim(),
                        circularNo: plCircularNo.trim(),
                        discountNote: plDiscountNote.trim(),
                        fileFormat: plFormat,
                        downloadUrl: plDownloadUrl.trim() || `/catalogs/${plBrand.toLowerCase()}-price-list.pdf`,
                        description: plDescription.trim() || `Official ${plBrand} price list published by Volamp Elektrikals.`,
                      });
                    }}
                    className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold gap-2 px-5 py-2.5 cursor-pointer shadow-sm"
                  >
                    <FileSpreadsheet className="size-4" />
                    {pushPriceListMutation.isPending ? "Pushing..." : "Push Price List to Live Site"}
                  </Button>
                </div>
              </div>

              {/* Pushed Price Lists List */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#ebd7c7] dark:border-white/10 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Custom Pushed Price Lists ({pushedPriceListsQuery.data?.length ?? 0})
                </h3>

                {((pushedPriceListsQuery.data ?? []).length === 0) ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No custom price lists pushed yet. Use the form above to publish manufacturer circulars directly to the live site.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(pushedPriceListsQuery.data ?? []).map((pl) => (
                      <div key={pl.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#c56718]">{pl.brand}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{pl.docType}</span>
                            <span className="text-[10px] text-slate-400">{pl.effectiveDate}</span>
                          </div>
                          <strong className="block text-slate-900 dark:text-white mt-0.5">{pl.title}</strong>
                          <span className="text-emerald-600 font-semibold text-[11px]">{pl.discountNote}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href="/price-list" target="_blank">
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                              <ExternalLink className="size-3" /> View on Page
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              if (confirm(`Remove price list "${pl.title}"?`)) {
                                deletePriceListMutation.mutate({ id: pl.id });
                              }
                            }}
                            className="h-7 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: COMMERCIAL QUEUES */}
          {activeTab === "queues" && (
            <div className="space-y-6">
              {/* Section 1: Employee Registrations & Approvals */}
              <section className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#d2e0e8] dark:border-[#29465b] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="size-5 text-[#c56718]" />
                    <h2 className="text-base font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                      Pending Employee Registrations
                    </h2>
                  </div>
                  <span className="text-xs text-[#6e808b] dark:text-[#b6c8d3]">
                    Official domain: <strong>@volampelektrikals.com</strong>
                  </span>
                </div>

                {dashboardQuery.isLoading ? (
                  <div className="py-8 flex justify-center">
                    <Loader2 className="animate-spin text-[#c56718] size-6" />
                  </div>
                ) : pendingEmployees.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-[#d2e0e8] dark:border-[#29465b] text-center">
                    <UserCheck className="size-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="text-xs font-semibold text-[#102a40] dark:text-white">
                      All employee accounts are reviewed
                    </p>
                    <span className="text-[11px] text-[#6e808b] dark:text-[#b6c8d3] block mt-0.5">
                      When new staff register with their @volampelektrikals.com email, their authorization requests will appear here.
                    </span>
                  </div>
                ) : (
                  <div className="divide-y divide-[#edf1f4] dark:divide-[#254259]">
                    {pendingEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-bold">{emp.name}</strong>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Pending Admin Approval
                            </span>
                          </div>
                          <span className="text-xs text-[#6e808b] dark:text-[#b6c8d3] font-mono">
                            {emp.email}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          disabled={approvingId === emp.id && approveMutation.isPending}
                          onClick={() => handleApprove(emp.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold self-start sm:self-center cursor-pointer"
                        >
                          {approvingId === emp.id && approveMutation.isPending
                            ? "Approving..."
                            : "Approve Employee Access"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Operational Queues */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quotations Queue */}
                <section className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#d2e0e8] dark:border-[#29465b] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="size-5 text-[#d97818]" />
                      <h2 className="text-base font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                        Customer Quotations Queue
                      </h2>
                    </div>
                    <span className="text-xs font-semibold text-[#d97818]">
                      {quotations.length} Active
                    </span>
                  </div>

                  {quotations.length === 0 ? (
                    <p className="text-xs text-[#6e808b] dark:text-[#b6c8d3] py-4 text-center">
                      No active quotation requests.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {quotations.slice(0, 5).map((q: any) => (
                        <div
                          key={q.id}
                          className="p-3.5 rounded-xl bg-[#f8fafc] dark:bg-[#15344d] border border-[#e2ecf2] dark:border-[#254259] flex items-center justify-between text-xs"
                        >
                          <div>
                            <strong className="block font-bold">{q.productName}</strong>
                            <span className="text-[#6e808b] dark:text-[#b6c8d3] text-[11px]">
                              Ref: {q.reference} · Qty: {q.quantity}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setInvoiceDefaults({
                                  customer: "",
                                  company: "",
                                  reference: q.reference,
                                });
                                setInvoiceModalOpen(true);
                              }}
                              className="h-7 text-[11px] px-2 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            >
                              <MessageCircle className="size-3 mr-1" /> Invoice
                            </Button>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              {q.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Orders Dispatch Queue */}
                <section className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#d2e0e8] dark:border-[#29465b] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <PackageSearch className="size-5 text-[#c56718]" />
                      <h2 className="text-base font-bold font-['Plus_Jakarta_Sans',sans-serif]">
                        Order Dispatch & Tracking
                      </h2>
                    </div>
                    <span className="text-xs font-semibold text-[#c56718]">
                      {orders.length} Active
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    <p className="text-xs text-[#6e808b] dark:text-[#b6c8d3] py-4 text-center">
                      No orders currently in fulfillment.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((o: any) => (
                        <div
                          key={o.id}
                          className="p-3.5 rounded-xl bg-[#f8fafc] dark:bg-[#15344d] border border-[#e2ecf2] dark:border-[#254259] flex items-center justify-between text-xs"
                        >
                          <div>
                            <strong className="block font-bold">{o.orderNumber}</strong>
                            <span className="text-[#6e808b] dark:text-[#b6c8d3] text-[11px]">
                              Tracking: {o.trackingNumber || "Pending Dispatch"}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {o.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================================
          ADD PRODUCT MODAL (FOR EMPLOYEES)
          ========================================================================= */}
      {addProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-[#102b42] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Plus className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Product to Live Catalog</h3>
                  <span className="text-xs text-slate-500">Instant commit to search & category pages</span>
                </div>
              </div>
              <button
                onClick={() => setAddProductModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="size-5 text-slate-500" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div>
                <Label className="text-xs font-bold">Product Full Name *</Label>
                <Input
                  type="text"
                  placeholder="e.g. 1.1kV 4 Core 300 sqmm Copper Armoured Power Cable"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold">Category *</Label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="mt-1 w-full text-xs h-9 px-3 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="Wires & Cables">Wires & Cables</option>
                    <option value="Switchgear">Switchgear & Protection</option>
                    <option value="Solar">Solar DC & Renewables</option>
                    <option value="Lugs">Lugs & Terminals</option>
                    <option value="Conduit">Conduit & Pipes</option>
                    <option value="Glands">Cable Glands</option>
                    <option value="Earthing Wires">Earthing Materials</option>
                    <option value="Wiring Devices">Wiring Devices</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-bold">Brand *</Label>
                  <select
                    value={newProdBrand}
                    onChange={(e) => setNewProdBrand(e.target.value)}
                    className="mt-1 w-full text-xs h-9 px-3 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-semibold"
                  >
                    <option value="Polycab">Polycab</option>
                    <option value="Havells">Havells</option>
                    <option value="RR Kabel">RR Kabel</option>
                    <option value="KEI">KEI</option>
                    <option value="Finolex">Finolex</option>
                    <option value="Schneider Electric">Schneider Electric</option>
                    <option value="L&T / LK">L&T / LK</option>
                    <option value="Volamp">Volamp OEM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold">Master List Price (₹) *</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 245"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold">Wholesale Price (₹)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 147"
                    value={newProdDiscountedPrice}
                    onChange={(e) => setNewProdDiscountedPrice(e.target.value)}
                    className="mt-1 text-xs text-emerald-600 font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold">Contractor Discount</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 40% OFF"
                    value={newProdDiscount}
                    onChange={(e) => setNewProdDiscount(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-bold">Unit</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Per Metre"
                    value={newProdUnit}
                    onChange={(e) => setNewProdUnit(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold">Size / Cross Section</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 300 sqmm"
                    value={newProdSize}
                    onChange={(e) => setNewProdSize(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold">Conductor Material</Label>
                  <Input
                    type="text"
                    placeholder="e.g. Copper or Aluminium"
                    value={newProdMaterial}
                    onChange={(e) => setNewProdMaterial(e.target.value)}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold">Technical Specifications & Application</Label>
                <Textarea
                  rows={3}
                  placeholder="Enter insulation rating, standards (IS 7098 / IEC), voltage, outer sheath details..."
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddProductModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={addProductMutation.isPending || !newProdName.trim() || !newProdPrice.trim()}
                onClick={() => {
                  const numPrice = parseFloat(newProdPrice.replace(/[^0-9.]/g, "")) || undefined;
                  addProductMutation.mutate({
                    name: newProdName.trim(),
                    category: newProdCategory,
                    subcategory: newProdSubcategory.trim() || undefined,
                    brand: newProdBrand,
                    price: newProdPrice.trim(),
                    numericPrice: numPrice,
                    discountedPrice: newProdDiscountedPrice.trim() || undefined,
                    discount: newProdDiscount.trim() || undefined,
                    unit: newProdUnit.trim() || "Per Metre",
                    size: newProdSize.trim() || undefined,
                    material: newProdMaterial.trim() || undefined,
                    description: newProdDescription.trim() || undefined,
                    status: newProdStatus,
                  });
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                {addProductMutation.isPending ? "Adding Product..." : "Save & Add to Live Catalog"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal for Operations Desk */}
      <WhatsAppInvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        defaultCustomer={invoiceDefaults.customer}
        defaultCompany={invoiceDefaults.company}
        defaultRef={invoiceDefaults.reference}
      />
    </div>
  );
}
