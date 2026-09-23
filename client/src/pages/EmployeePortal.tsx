import { useState } from "react";
import { Link, useLocation } from "wouter";
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
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { downloadQuickOrderPdf, QuickOrderItem } from "@/lib/quickOrderPdf";
import { WhatsAppInvoiceModal } from "@/components/invoice/WhatsAppInvoiceModal";

export default function EmployeePortal() {
  const [, setLocation] = useLocation();
  const { user, loading, logout } = useAuth();
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceDefaults, setInvoiceDefaults] = useState({
    customer: "",
    company: "",
    reference: "",
  });

  const [productSearch, setProductSearch] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState<string | null>(null);
  const [previewDiffData, setPreviewDiffData] = useState<any>(null);

  const categoriesQuery = trpc.products.getCategories.useQuery();
  const productsListQuery = trpc.products.list.useQuery({
    search: productSearch || undefined,
    category: selectedProductCategory || undefined,
    limit: 12,
  });

  const previewMutation = trpc.products.previewImport.useMutation({
    onSuccess: (res) => {
      setPreviewDiffData(res);
      toast.success("Validation & Diff Analysis Complete", {
        description: `New: ${res.summary.newCount} | Updated: ${res.summary.updatedCount} | Unchanged: ${res.summary.unchangedCount} | Errors: ${res.summary.errorCount}`,
      });
    },
    onError: (err) => {
      toast.error("Validation Failed", { description: err.message });
    },
  });

  const confirmMutation = trpc.products.confirmImport.useMutation({
    onSuccess: (res) => {
      toast.success("Product Master Synchronized!", {
        description: `${res.totalProducts} verified products are live on the website.`,
      });
      setPreviewDiffData(null);
      productsListQuery.refetch();
      categoriesQuery.refetch();
    },
    onError: (err) => {
      toast.error("Import Failed", { description: err.message });
    },
  });

  const dashboardQuery = trpc.employee.dashboard.useQuery(undefined, {
    enabled: Boolean(user && user.accountType === "employee"),
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
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb] dark:bg-[#071b2d]">
        <Loader2 className="animate-spin text-[#1d73b7] size-8" />
      </div>
    );
  }

  if (!user || user.accountType !== "employee") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f9fb] dark:bg-[#071b2d]">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-[#102b42] border border-[#d2e0e8] dark:border-[#29465b] text-center shadow-xl">
          <div className="size-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="size-7" />
          </div>
          <h1 className="text-xl font-bold text-[#102a40] dark:text-white font-['Space_Grotesk']">
            Employee Portal Restricted
          </h1>
          <p className="text-xs text-[#6e808b] dark:text-[#b6c8d3] mt-2 mb-6 leading-relaxed">
            This workspace is strictly reserved for verified VOLAMP employees. Please sign in with an approved official account.
          </p>
          <Link href="/">
            <Button className="w-full bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold py-2.5">
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
  const tickets = data?.tickets ?? [];

  return (
    <div className="min-h-screen bg-[#f7f9fb] dark:bg-[#071b2d] text-[#142b40] dark:text-[#eaf1f5] transition-colors">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-[#09233a] border-b border-[#dce4ea] dark:border-[#29465b]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold text-[#1d73b7] hover:underline"
            >
              <ArrowLeft className="size-4" /> VOLAMP Marketplace
            </Link>
            <span className="hidden sm:inline-block text-xs font-mono text-[#6e808b] dark:text-[#b6c8d3] border-l border-[#dce4ea] dark:border-[#29465b] pl-4">
              INTERNAL OPERATIONS
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f0f4f8] dark:bg-[#102b42] text-xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">{user.name || user.email}</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#1d73b7]/10 text-[#1d73b7] ml-1">
                {user.role === "admin" ? "Admin" : "Staff"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1.5"
            >
              <LogOut className="size-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#102b42] border border-[#d2e0e8] dark:border-[#29465b] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 rounded bg-[#1d73b7]/10 text-[#1d73b7]">
                <ShieldCheck className="size-4" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-[#1d73b7] uppercase">
                VOLAMP OPERATIONS DESK
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-['Space_Grotesk']">
              Employee Control Center
            </h1>
            <p className="text-xs text-[#6e808b] dark:text-[#b6c8d3] mt-1 max-w-xl">
              Internal commercial queues, logistics dispatch tracking, customer support escalation, and employee account management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                setInvoiceDefaults({ customer: "", company: "", reference: "" });
                setInvoiceModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm h-auto py-2.5 px-3.5 rounded-xl"
            >
              <MessageCircle className="size-4" /> Create Invoice (WhatsApp +91 9512365582)
            </Button>
            <div className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#173b56] border border-[#e2ecf2] dark:border-[#2b4c68] text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-[#6e808b] dark:text-[#b6c8d3] uppercase block">
                MFA STATUS
              </span>
              <strong className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle2 className="size-3.5" /> Required & Active
              </strong>
            </div>
            <div className="p-3 rounded-xl bg-[#f8fafc] dark:bg-[#173b56] border border-[#e2ecf2] dark:border-[#2b4c68] text-center min-w-[110px]">
              <span className="text-[10px] font-bold text-[#6e808b] dark:text-[#b6c8d3] uppercase block">
                PENDING APPROVALS
              </span>
              <strong className="text-lg font-bold text-[#c46b19]">
                {pendingEmployees.length}
              </strong>
            </div>
          </div>
        </section>

        {/* Section 1: Employee Registrations & Approvals */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#d2e0e8] dark:border-[#29465b] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-[#1d73b7]" />
              <h2 className="text-base font-bold font-['Space_Grotesk']">
                Pending Employee Registrations
              </h2>
            </div>
            <span className="text-xs text-[#6e808b] dark:text-[#b6c8d3]">
              Official domain: <strong>@volampelektrikals.com</strong>
            </span>
          </div>

          {dashboardQuery.isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="animate-spin text-[#1d73b7] size-6" />
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
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold self-start sm:self-center"
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

        {/* Section 2: Operational Queues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quotations Queue */}
          <section className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#d2e0e8] dark:border-[#29465b] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-[#d97818]" />
                <h2 className="text-base font-bold font-['Space_Grotesk']">
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
                <PackageSearch className="size-5 text-[#1d73b7]" />
                <h2 className="text-base font-bold font-['Space_Grotesk']">
                  Order Dispatch & Tracking
                </h2>
              </div>
              <span className="text-xs font-semibold text-[#1d73b7]">
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

        {/* Section 3: Quick Orders & Instant Requisitions Queue */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#d2e0e8] dark:border-[#29465b] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-amber-500/10 text-[#d97818] flex items-center justify-center">
                <Zap className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-bold font-['Space_Grotesk']">
                  Quick Orders & Direct Requisitions
                </h2>
                <p className="text-xs text-[#6e808b] dark:text-[#b6c8d3]">
                  Incoming multi-product requests submitted via Quick Order & WhatsApp.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 self-start sm:self-auto">
              {((data as any)?.quickOrders ?? []).length} Requisitions
            </span>
          </div>

          {((data as any)?.quickOrders ?? []).length === 0 ? (
            <p className="text-xs text-[#6e808b] dark:text-[#b6c8d3] py-6 text-center">
              No Quick Orders submitted yet.
            </p>
          ) : (
            <div className="space-y-4">
              {((data as any)?.quickOrders ?? []).map((qo: any) => {
                let parsedItems: QuickOrderItem[] = [];
                try {
                  parsedItems = Array.isArray(qo.items) ? qo.items : JSON.parse(qo.items || "[]");
                } catch {
                  parsedItems = [];
                }

                const handleDownload = () => {
                  downloadQuickOrderPdf({
                    quickOrderId: qo.quickOrderId,
                    customerName: qo.customerName,
                    companyName: qo.companyName,
                    phone: qo.phone,
                    email: qo.email,
                    location: qo.location,
                    items: parsedItems,
                    notes: qo.notes,
                    date: new Date(qo.createdAt),
                  });
                };

                const cleanPhone = qo.phone.replace(/[^0-9]/g, "");

                return (
                  <div
                    key={qo.id || qo.quickOrderId}
                    className="p-4 rounded-xl bg-[#f8fafc] dark:bg-[#15344d] border border-[#e2ecf2] dark:border-[#254259] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-xs font-mono font-bold text-[#1d73b7] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900">
                          {qo.quickOrderId}
                        </strong>
                        <strong className="font-bold text-[#102a40] dark:text-white">
                          {qo.customerName}
                        </strong>
                        {qo.companyName && (
                          <span className="text-[#6e808b] dark:text-[#b6c8d3]">
                            ({qo.companyName})
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 ml-auto md:ml-0">
                          {qo.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6e808b] dark:text-[#b6c8d3]">
                        <span>
                          Phone:{" "}
                          <strong className="text-[#102a40] dark:text-white">{qo.phone}</strong>
                        </span>
                        {qo.location && <span>Location: {qo.location}</span>}
                        <span>
                          Date: {new Date(qo.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                      </div>

                      {/* Included Products List */}
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase text-[#5a6b78] dark:text-[#a0b4c2] block mb-1">
                          Included Products ({parsedItems.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {parsedItems.map((item, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white dark:bg-[#1c405e] border border-[#dce5eb] dark:border-[#2b4c68] text-[11px]"
                            >
                              <span className="font-medium text-[#102a40] dark:text-white">
                                {item.name}
                              </span>
                              <strong className="text-[#c46b19] font-mono">
                                × {item.quantity}
                              </strong>
                            </span>
                          ))}
                        </div>
                      </div>

                      {qo.notes && (
                        <p className="text-[11px] text-[#71818c] dark:text-[#9bb1c0] italic pt-1">
                          Notes: "{qo.notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-2 shrink-0 justify-end">
                      <Button
                        size="sm"
                        onClick={handleDownload}
                        className="bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold h-8 px-3 flex items-center gap-1.5"
                      >
                        <FileDown className="size-3.5" /> Download PDF
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setInvoiceDefaults({
                            customer: qo.customerName || "",
                            company: qo.companyName || "",
                            reference: qo.quickOrderId || "",
                          });
                          setInvoiceModalOpen(true);
                        }}
                        className="border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-xs font-semibold h-8 px-3 flex items-center gap-1.5"
                      >
                        <MessageCircle className="size-3.5" /> Invoice (+91 9512365582)
                      </Button>

                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                        >
                          <MessageCircle className="size-3.5" /> Reply WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 4: Product Master Data & Dynamic Synchronization */}
        <section className="p-6 rounded-2xl bg-white dark:bg-[#102b42] border border-[#d2e0e8] dark:border-[#29465b] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-blue-500/10 text-[#1d73b7] flex items-center justify-center">
                <Database className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-bold font-['Space_Grotesk']">
                  VOLAMP Product Master Data & Live Synchronization
                </h2>
                <p className="text-xs text-[#6e808b] dark:text-[#b6c8d3]">
                  Dynamic product catalog across 8 categories (3,385 products). Master Excel sync with diff validation.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => previewMutation.mutate()}
                disabled={previewMutation.isPending}
                className="text-xs h-8 gap-1.5 border-[#1d73b7] text-[#1d73b7] hover:bg-blue-50/60"
              >
                <RefreshCw className={`size-3.5 ${previewMutation.isPending ? "animate-spin" : ""}`} />
                {previewMutation.isPending ? "Validating Diff..." : "Run Excel Sync Preview"}
              </Button>
            </div>
          </div>

          {/* Category Count Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
            {(categoriesQuery.data ?? []).map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedProductCategory(selectedProductCategory === cat.name ? null : cat.name);
                }}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                  selectedProductCategory === cat.name
                    ? "border-amber-400 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-400/40"
                    : "border-[#e2ecf2] dark:border-[#254259] bg-[#f8fafc] dark:bg-[#15344d] hover:border-slate-300"
                }`}
              >
                <span className="text-[10px] font-bold text-slate-500 block truncate">{cat.name}</span>
                <strong className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                  {cat.total.toLocaleString("en-IN")}
                </strong>
                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-semibold block">
                  {cat.brands.length} {cat.brands.length === 1 ? "Brand" : "Brands"}
                </span>
              </button>
            ))}
          </div>

          {/* Sync Diff Preview Result (Requirement 8) */}
          {previewDiffData && (
            <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-amber-300/80 dark:border-amber-700/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                  <strong className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Excel Import Validation & Diff Summary
                  </strong>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => confirmMutation.mutate()}
                    disabled={confirmMutation.isPending}
                    className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle2 className="size-3.5 mr-1" />
                    {confirmMutation.isPending ? "Synchronizing..." : "Confirm & Commit to Live Database"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewDiffData(null)}
                    className="h-8 text-xs text-slate-500"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-3 text-center">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">New Products</span>
                  <strong className="text-lg font-black text-emerald-700 dark:text-emerald-400">{previewDiffData.summary.newCount}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                  <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 block uppercase">Updated Rates/Info</span>
                  <strong className="text-lg font-black text-amber-700 dark:text-amber-400">{previewDiffData.summary.updatedCount}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                  <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 block uppercase">Unchanged</span>
                  <strong className="text-lg font-black text-blue-700 dark:text-blue-400">{previewDiffData.summary.unchangedCount}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800">
                  <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 block uppercase">Inactive Products</span>
                  <strong className="text-lg font-black text-purple-700 dark:text-purple-400">{previewDiffData.summary.inactiveCount}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800">
                  <span className="text-[10px] font-bold text-red-800 dark:text-red-300 block uppercase">Data Errors</span>
                  <strong className="text-lg font-black text-red-700 dark:text-red-400">{previewDiffData.summary.errorCount}</strong>
                </div>
              </div>

              {previewDiffData.sampleDiffs.length > 0 && (
                <div className="mt-2 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Detected Variations Preview:</span>
                  <div className="max-h-40 overflow-y-auto space-y-1 bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                    {previewDiffData.sampleDiffs.map((d: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-900 last:border-0">
                        <span className="text-[#1d73b7] font-bold">[{d.productId}] {d.name} ({d.brand})</span>
                        <span className="text-amber-600 font-semibold">
                          {d.diffs.map((df: any) => `${df.field}: ${df.oldVal} → ${df.newVal}`).join(" | ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search & Live Products Explorer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search master data by Product ID, SKU, Brand, or Specification..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="pl-8 text-xs h-8.5 bg-white dark:bg-slate-900"
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
              Showing top {productsListQuery.data?.products?.length ?? 0} of {productsListQuery.data?.total ?? 0} records
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold">
                  <th className="py-2.5 px-3">Product ID</th>
                  <th className="py-2.5 px-3">Brand</th>
                  <th className="py-2.5 px-3">Product Name & Specifications</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Master Rate</th>
                  <th className="py-2.5 px-3 text-right">Net Wholesale</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {(productsListQuery.data?.products ?? []).map((p) => (
                  <tr key={p.productId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono font-bold text-[#1d73b7]">{p.productId}</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded font-bold text-[10px] bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">
                        {p.brand}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <strong className="text-slate-900 dark:text-white block">{p.name}</strong>
                      <span className="text-[10px] text-slate-500">{p.size || p.subcategory} · {p.material}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                    <td className="py-2 px-3 text-right font-medium text-slate-500">{p.price}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {p.discountedPrice || p.price}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

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
