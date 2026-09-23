import React, { useState, useMemo } from "react";
import {
  Search,
  Package,
  Navigation,
  Clock,
  Phone,
  MessageSquare,
  MapPin,
  Building2,
  Truck,
  ShieldCheck,
  FileCheck,
  X,
  Copy,
  Check,
  AlertCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import GoogleMapsTrackingView from "./GoogleMapsTrackingView";

interface LogisticsDashboardViewProps {
  initialOrderId?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export default function LogisticsDashboardView({
  initialOrderId = "",
  onClose,
  isModal = false,
}: LogisticsDashboardViewProps) {
  const { user } = useAuth();
  const [searchInput, setSearchInput] = useState(initialOrderId);
  const [activeOrderId, setActiveOrderId] = useState(initialOrderId);
  const [copied, setCopied] = useState(false);

  // Fetch customer's own real orders if logged in
  const portalQuery = trpc.customer.portal.useQuery(undefined, {
    enabled: Boolean(user),
  });
  const myOrders = portalQuery.data?.orders || [];

  // Fetch real order tracking data from backend tRPC
  const trackingQuery = trpc.tracking.byQuery.useQuery(
    { query: activeOrderId },
    {
      enabled: Boolean(activeOrderId.trim()),
      staleTime: 1000 * 30,
    }
  );

  const activeOrder = trackingQuery.data;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (!clean) {
      toast.error("Please enter an Order ID or registered Phone Number");
      return;
    }
    setActiveOrderId(clean);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard", { description: text });
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = activeOrder
    ? `https://wa.me/919512365582?text=${encodeURIComponent(
        `Hello VOLAMP Support, I am tracking consignment ${activeOrder.orderNumber} (${activeOrder.statusLabel}). Destination: ${activeOrder.destination}. Could you share live dispatch update?`
      )}`
    : `https://wa.me/919512365582?text=${encodeURIComponent(
        `Hello VOLAMP Support, I would like to inquire about my order delivery status.`
      )}`;

  const isDispatched =
    activeOrder?.status === "dispatched" ||
    activeOrder?.status === "in_transit" ||
    activeOrder?.status === "delivered";

  return (
    <div className="w-full bg-white dark:bg-[#0b1f33] text-slate-900 dark:text-slate-100 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
      {/* 1. TOP HEADER & SEARCH STRIP */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-[#0b1f33] via-[#102e48] to-[#143d60] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 relative">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <Package className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Consignment & Order Tracking
              </h2>
              {activeOrder?.found && (
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  {isDispatched ? "LIVE GPS" : "DEPOT QUEUE"}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300">
              Real-time transit updates, transporter LR, and Mill Test Certificate (MTC) clearance.
            </p>
          </div>
        </div>

        {/* Search Bar + Close Button */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 size-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Order ID / Phone (e.g. QO-2026-10492)"
              className="w-56 sm:w-72 pl-8 pr-16 py-1.5 text-xs bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder-slate-300 focus:placeholder-slate-400 rounded-xl border border-white/20 focus:border-white focus:outline-none transition-all font-mono"
            />
            <button
              type="submit"
              className="absolute right-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg transition-colors shadow-sm"
            >
              Track
            </button>
          </form>

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-1"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Real Logged-in Customer Orders Bar (if user has orders) */}
      {myOrders.length > 0 && (
        <div className="px-4 sm:px-6 py-2 bg-slate-50 dark:bg-[#081726] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400 font-medium text-[11px]">Your Orders:</span>
            {myOrders.map((o: any) => (
              <button
                key={o.id}
                onClick={() => {
                  setSearchInput(o.orderNumber);
                  setActiveOrderId(o.orderNumber);
                }}
                className={`px-2.5 py-0.5 rounded-md font-mono text-[11px] transition-colors flex items-center gap-1.5 ${
                  activeOrderId === o.orderNumber
                    ? "bg-[#1d73b7] text-white font-bold"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400"
                }`}
              >
                <span>{o.orderNumber}</span>
                <span className="text-[10px] opacity-75 uppercase">({o.status})</span>
              </button>
            ))}
          </div>

          {activeOrder?.found && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Consignee:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                {activeOrder.companyName || activeOrder.customerName}
              </strong>
            </div>
          )}
        </div>
      )}

      {/* 2. BODY CONTENT: DIFFERENT STATES */}

      {/* STATE 1: NO ORDER SEARCHED YET */}
      {!activeOrderId.trim() && (
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
          <div className="size-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-sm">
            <Search className="size-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Track Your VOLAMP Consignment
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your <strong>Order ID</strong> (from your invoice or confirmation email) or registered <strong>Phone Number</strong> above to view real-time transit status, transporter docket, and Mill Test Certificate (MTC).
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full text-left pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Truck className="size-4 text-[#1d73b7]" />
                <span>Highway Transit</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Direct dispatch from VOLAMP Central Depot, Sanand GIDC, Ahmedabad.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>MTC Clearance</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Verified Mill Test Certificate and batch test reports stamped before transit.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <MessageSquare className="size-4 text-emerald-600" />
                <span>Dispatch Support</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Direct WhatsApp line to our logistics desk (+91 95123 65582) for instant updates.
              </p>
            </div>
          </div>

          {/* WhatsApp Support CTA */}
          <div className="pt-2">
            <a
              href="https://wa.me/919512365582?text=Hello%20VOLAMP%20Dispatch%20Desk%2C%20I%20would%20like%20to%20track%20my%20order"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors"
            >
              <MessageSquare className="size-3.5" />
              <span>Contact Dispatch Desk on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* STATE 2: LOADING */}
      {activeOrderId.trim() && trackingQuery.isLoading && (
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-3 min-h-[360px]">
          <Loader2 className="size-8 text-[#1d73b7] animate-spin" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Querying consignment records for "{activeOrderId}"...
          </p>
          <p className="text-xs text-slate-400">
            Checking Ahmedabad Central Depot dispatch queue and carrier dockets.
          </p>
        </div>
      )}

      {/* STATE 3: ORDER NOT FOUND */}
      {activeOrderId.trim() && !trackingQuery.isLoading && activeOrder && !activeOrder.found && (
        <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-5 min-h-[380px]">
          <div className="size-14 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 flex items-center justify-center shadow-sm">
            <AlertCircle className="size-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              No Consignment Found for "{activeOrderId}"
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We could not find an active order matching this Order ID or registered Phone Number. Please verify your Order Number from your purchase order, invoice, or WhatsApp confirmation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveOrderId("");
                setSearchInput("");
              }}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs transition-colors"
            >
              Search Again
            </button>

            <a
              href={`https://wa.me/919512365582?text=${encodeURIComponent(
                `Hello VOLAMP Support, I tried tracking order "${activeOrderId}" on the website but it was not found. Could you please help locate my consignment?`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm transition-colors"
            >
              <MessageSquare className="size-3.5" />
              <span>Ask Dispatch Desk on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* STATE 4: REAL ORDER FOUND - FULL DASHBOARD */}
      {activeOrderId.trim() && !trackingQuery.isLoading && activeOrder && activeOrder.found && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 sm:p-6">
          {/* =================================================================== */}
          {/* LEFT COLUMN: ORDER DETAILS, MILESTONES & MANIFEST (5 Cols) */}
          {/* =================================================================== */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Order Header Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {activeOrder.orderNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {activeOrder.statusLabel}
                  </span>
                </div>

                {activeOrder.totalWeight && (
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                    {activeOrder.totalWeight}
                  </span>
                )}
              </div>

              {/* Estimated Arrival Banner */}
              <div className="p-3 rounded-xl bg-white dark:bg-[#122c42] border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    ESTIMATED SITE ARRIVAL
                  </span>
                  <strong className="text-xs font-bold text-slate-900 dark:text-white">
                    {activeOrder.estimatedDelivery}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    DISPATCH DEPOT
                  </span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {activeOrder.origin?.split(",")[0] || "Ahmedabad, Gujarat"}
                  </span>
                </div>
              </div>

              {/* Transporter & LR Number */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Transporter:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-medium">
                    {activeOrder.transporter || "VOLAMP Logistics Desk"}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Docket / LR Number:</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-slate-900 dark:text-white">
                    <span>{activeOrder.lrNumber || "SCHEDULED"}</span>
                    {activeOrder.lrNumber && (
                      <button
                        onClick={() => handleCopy(activeOrder.lrNumber!)}
                        className="text-slate-400 hover:text-amber-500 transition-colors"
                        title="Copy LR"
                      >
                        {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Consignment Milestones Stepper */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0e2438] border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                CONSIGNMENT MILESTONES
              </span>

              <div className="space-y-3">
                {activeOrder.milestones.map((m: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {/* Connecting Line */}
                    {idx < activeOrder.milestones.length - 1 && (
                      <div
                        className={`absolute left-3 top-6 bottom-0 w-0.5 -ml-px ${
                          m.completed ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    )}

                    {/* Icon Indicator */}
                    <div className="shrink-0 mt-0.5">
                      {m.completed && !m.current ? (
                        <div className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      ) : m.current ? (
                        <div className="size-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center animate-pulse shadow-md shadow-amber-500/30">
                          <Truck className="size-3" />
                        </div>
                      ) : (
                        <div className="size-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] font-mono">
                          {`0${idx + 1}`}
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between gap-2">
                        <strong
                          className={`text-xs ${
                            m.current
                              ? "text-amber-600 dark:text-amber-400 font-bold"
                              : m.completed
                              ? "text-slate-900 dark:text-white font-semibold"
                              : "text-slate-400 font-normal"
                          }`}
                        >
                          {m.title}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {m.time}
                        </span>
                      </div>
                      {m.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                          {m.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment Items Manifest */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SHIPMENT ITEMS ({activeOrder.items.length})
                </span>
                {activeOrder.mtcNumber && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <FileCheck className="size-3.5" /> MTC Certified: {activeOrder.mtcNumber}
                  </span>
                )}
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {activeOrder.items.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-white dark:bg-[#122c42] border border-slate-200/80 dark:border-slate-700/80"
                  >
                    <div className="truncate mr-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {item.name}
                      </span>
                      {item.spec && (
                        <span className="text-[10px] text-slate-400 block truncate">
                          {item.spec}
                        </span>
                      )}
                    </div>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                      {item.quantity} {item.unit || "units"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:flex-1 h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <MessageSquare className="size-3.5" />
                <span>Live Update on WhatsApp</span>
              </a>

              <a
                href="tel:+919512365582"
                className="w-full sm:w-auto h-10 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Phone className="size-3.5" />
                <span>Call Dispatch Desk</span>
              </a>
            </div>
          </div>

          {/* =================================================================== */}
          {/* RIGHT COLUMN: GOOGLE MAPS ROUTE & DISPATCH STATUS (7 Cols) */}
          {/* =================================================================== */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Top Operational Status Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  ORIGIN DEPOT
                </span>
                <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                  Sanand GIDC, Ahmedabad
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  DELIVERY SITE
                </span>
                <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                  {activeOrder.destination}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  ORDER STATUS
                </span>
                <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                  {activeOrder.statusLabel}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  ESTIMATED ARRIVAL
                </span>
                <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate mt-0.5">
                  {activeOrder.estimatedDelivery}
                </strong>
              </div>
            </div>

            {/* Genuine Google Maps Route & Live GPS Canvas */}
            <div className="flex-1 min-h-[440px] flex flex-col">
              <GoogleMapsTrackingView
                origin={activeOrder.origin || "Sanand GIDC, Ahmedabad, Gujarat, India"}
                destination={activeOrder.destination || "Gujarat, India"}
                currentLocation={activeOrder.currentLocation || "Sanand GIDC, Ahmedabad, Gujarat"}
                orderNumber={activeOrder.orderNumber}
              />
            </div>

            {/* Carrier / Depot Operational Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0e2438] border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-[#1d73b7]/15 text-[#1d73b7] flex items-center justify-center font-bold text-xs">
                  {isDispatched ? <Truck className="size-4" /> : <Building2 className="size-4" />}
                </div>
                <div>
                  <strong className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                    {isDispatched
                      ? activeOrder.transporter || "VOLAMP Logistics Desk"
                      : "VOLAMP Central Sourcing & Quality Clearance Desk"}
                  </strong>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {isDispatched
                      ? `Consignment en route to ${activeOrder.destination}`
                      : "Goods verified and prepared at Sanand GIDC Depot, Ahmedabad"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeOrder.lrNumber && isDispatched && (
                  <div className="px-3 py-1 rounded-lg bg-white dark:bg-[#122c42] border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    LR: {activeOrder.lrNumber}
                  </div>
                )}

                <a
                  href="https://wa.me/919512365582"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-[#1d73b7] hover:bg-[#155a90] text-white font-semibold text-[11px] transition-colors flex items-center gap-1"
                >
                  <MessageSquare className="size-3" />
                  <span>Logistics Help</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
