import React, { useState } from "react";
import { useUserLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Zap,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  FileDown,
  MessageCircle,
  Building2,
  MapPin,
  Sparkles,
  Share2,
  ExternalLink,
  Copy,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  downloadQuickOrderPdf,
  generateQuickOrderPdf,
  QuickOrderItem,
} from "@/lib/quickOrderPdf";

interface QuickOrderRow {
  id: string;
  productId?: string;
  name: string;
  brand?: string;
  specification?: string;
  unitPrice?: number;
  quantity: number;
}

interface QuickOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: {
    productId?: string;
    name: string;
    brand?: string;
    specification?: string;
    unitPrice?: number;
    quantity?: number;
  } | null;
}

const productSuggestions = [
  "Finolex 1.5 Sqmm Wire",
  "Polycab 2.5 Sqmm Wire",
  "300 SQMM Copper Cable",
  "LT Aluminium Arm Cable",
  "HT Aluminium Arm Cable 11kV",
  "Multi Core Flexible Cable",
  "Single Core Flexible Wire",
  "Industrial MCB 63A",
  "Solar DC Cable 4 Sqmm",
  "Instrumentation Shielded Cable",
  "BMS Communication Cable",
  "Submersible Flat Cable",
];

const createEmptyRow = (): QuickOrderRow => ({
  id: `row-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: "",
  quantity: 1,
});

export function QuickOrderModal({ isOpen, onClose, initialProduct }: QuickOrderModalProps) {
  const { location } = useUserLocation();

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [projectLocation, setProjectLocation] = useState(location || "Ahmedabad, Gujarat, India");
  const [notes, setNotes] = useState("");

  // Product list state - starts with initialProduct or demo items
  const [rows, setRows] = useState<QuickOrderRow[]>(() => {
    if (initialProduct) {
      return [
        {
          id: "row-init-1",
          productId: initialProduct.productId,
          name: initialProduct.name,
          brand: initialProduct.brand,
          specification: initialProduct.specification,
          unitPrice: initialProduct.unitPrice,
          quantity: initialProduct.quantity || 100,
        },
      ];
    }
    return [
      { id: "row-1", productId: "CAB-000004", brand: "Polycab", name: "1.5 SQMM X 1 CORE Unarmoured Copper CABLE", quantity: 10 },
      { id: "row-2", productId: "CAB-000005", brand: "Polycab", name: "2.5 SQMM X 1 CORE Unarmoured Copper CABLE", quantity: 5 },
      { id: "row-3", productId: "SWG-000001", brand: "LK", name: "Power Contactors 3P 9A", quantity: 2 },
    ];
  });

  // When initialProduct changes, update rows
  React.useEffect(() => {
    if (initialProduct) {
      setRows([
        {
          id: `row-${Date.now()}`,
          productId: initialProduct.productId,
          name: initialProduct.name,
          brand: initialProduct.brand,
          specification: initialProduct.specification,
          unitPrice: initialProduct.unitPrice,
          quantity: initialProduct.quantity || 100,
        },
      ]);
    }
  }, [initialProduct]);

  // Query live products for datalist autocomplete
  const { data: liveCatalog } = trpc.products.list.useQuery({ limit: 50 }, { enabled: isOpen });

  // Submission / success state
  const [orderIdDraft] = useState(() => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return `QO-${year}-${randomNum}`;
  });
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [submittedItems, setSubmittedItems] = useState<QuickOrderItem[]>([]);
  const [lastWaUrl, setLastWaUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync detected location when opened if user hasn't overridden
  React.useEffect(() => {
    if (location && (!projectLocation || projectLocation === "Ahmedabad, Gujarat, India")) {
      setProjectLocation(location);
    }
  }, [location]);

  const submitMutation = trpc.quickOrder.submit.useMutation();

  // -------------------------------------------------------------------------
  // Product Row Management Handlers
  // -------------------------------------------------------------------------

  const handleAddProduct = () => {
    setRows((prev) => [...prev, createEmptyRow()]);
  };

  const handleRemoveProduct = (rowId: string) => {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== rowId);
      // Empty Form Handling: If the customer removes the only existing product,
      // display one fresh empty product row so they can continue using the form.
      if (filtered.length === 0) {
        return [createEmptyRow()];
      }
      return filtered;
    });
  };

  const handleUpdateName = (rowId: string, name: string) => {
    const match = liveCatalog?.products.find(
      (p) =>
        p.name.toLowerCase() === name.toLowerCase().trim() ||
        p.productId.toLowerCase() === name.toLowerCase().trim()
    );
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              name,
              productId: match ? match.productId : r.productId,
              brand: match ? match.brand : r.brand,
              specification: match ? (match.size || match.subcategory || undefined) : r.specification,
              unitPrice: match ? (match.numericPrice ?? undefined) : r.unitPrice,
            }
          : r
      )
    );
  };

  const handleUpdateQuantity = (rowId: string, quantity: number) => {
    const validQty = Math.max(1, isNaN(quantity) ? 1 : quantity);
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, quantity: validQty } : r))
    );
  };

  // -------------------------------------------------------------------------
  // Submission & WhatsApp Handler
  // -------------------------------------------------------------------------
  // Dynamic WhatsApp Requisition & Invoice Link (+91 9512365582)
  // -------------------------------------------------------------------------

  const validItems = React.useMemo(
    () =>
      rows
        .filter((r) => r.name.trim().length > 0 && r.quantity >= 1)
        .map((r) => ({
          productId: r.productId,
          name: r.name.trim(),
          brand: r.brand,
          specification: r.specification,
          unitPrice: r.unitPrice,
          quantity: r.quantity,
        })),
    [rows]
  );

  const formattedItemsForWhatsApp = React.useMemo(() => {
    if (validItems.length === 0) return "(No products added yet)";
    return validItems
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.productId ? `[${item.productId}] ` : ""}*${item.name}*${item.brand ? ` (${item.brand})` : ""} — Qty: *${item.quantity}*`
      )
      .join("\n");
  }, [validItems]);

  const businessPhone = "919512365582";

  const activeOrderId = submittedOrderId || orderIdDraft;

  const pdfUrl = React.useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    return `${origin}/api/quickorder/pdf/${activeOrderId}`;
  }, [activeOrderId]);

  const waInvoiceText = React.useMemo(() => {
    const cust = customerName.trim() || "[Customer Name]";
    const comp = companyName.trim() ? ` (${companyName.trim()})` : "";
    const ph = phone.trim() || "[Mobile / WhatsApp]";
    const loc = projectLocation.trim() || "India";
    const gst = gstin.trim() ? `\n*Company GSTIN:* ${gstin.trim()}` : "";
    const noteText = notes.trim() ? `\n*Billing / Project Notes:* ${notes.trim()}` : "";

    return `📄 *VOLAMP ELEKTRIKALS — QUICK ORDER INVOICE REQUISITION (PDF)*
*Invoice / Order ID:* ${activeOrderId}
*Customer Name:* ${cust}${comp}
*Contact Mobile:* ${ph}${gst}
*Delivery Location:* ${loc}

*Ordered Products for Invoice (${validItems.length}):*
${formattedItemsForWhatsApp}${noteText}

📥 *OFFICIAL STAMPED PDF INVOICE DOCUMENT:*
${pdfUrl}

_Please review the attached/linked PDF Invoice and confirm dispatch schedule._`;
  }, [
    customerName,
    companyName,
    phone,
    gstin,
    projectLocation,
    formattedItemsForWhatsApp,
    notes,
    activeOrderId,
    pdfUrl,
    validItems.length,
  ]);

  const waUrl = React.useMemo(() => {
    return `https://wa.me/${businessPhone}?text=${encodeURIComponent(waInvoiceText)}`;
  }, [waInvoiceText]);

  const handleDirectWhatsAppSend = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!customerName.trim()) {
      e.preventDefault();
      toast.error("Please enter your name before sending to WhatsApp.");
      return;
    }

    if (!phone.trim() || phone.trim().length < 6) {
      e.preventDefault();
      toast.error("Please enter a valid phone or WhatsApp number.");
      return;
    }

    if (validItems.length === 0) {
      e.preventDefault();
      toast.error("Please add at least one product with name and quantity.");
      return;
    }

    const activeId = activeOrderId;
    setSubmittedOrderId(activeId);
    setSubmittedItems(validItems);
    setLastWaUrl(waUrl);

    // 1. Save in backend database in background with exact activeId
    submitMutation.mutate({
      quickOrderId: activeId,
      customerName: customerName.trim(),
      companyName: companyName.trim() || undefined,
      phone: phone.trim(),
      email: email.trim() || undefined,
      location: projectLocation.trim() || undefined,
      items: validItems,
      notes: notes.trim() || undefined,
    });

    // 2. Client-side PDF generation & download
    try {
      downloadQuickOrderPdf({
        quickOrderId: activeId,
        customerName: customerName.trim(),
        companyName: companyName.trim() || undefined,
        phone: phone.trim(),
        email: email.trim() || undefined,
        location: projectLocation.trim() || undefined,
        gstin: gstin.trim() || undefined,
        items: validItems,
        notes: notes.trim() || undefined,
        date: new Date(),
      });
    } catch (err) {
      console.error("PDF generation error:", err);
    }

    toast.success("Opening WhatsApp (+91 9512365582)...", {
      description: `PDF Invoice compiled (${activeId}). Sending PDF link to WhatsApp!`,
    });
  };

  const handleShareFileDirectly = async () => {
    const activeId = submittedOrderId || activeOrderId;
    if (validItems.length === 0) {
      toast.error("Please add at least one product with name and quantity.");
      return;
    }
    try {
      const doc = generateQuickOrderPdf({
        quickOrderId: activeId,
        customerName: customerName.trim() || "Procurement Officer",
        companyName: companyName.trim() || undefined,
        phone: phone.trim() || "Contact Desk",
        email: email.trim() || undefined,
        location: projectLocation.trim() || undefined,
        gstin: gstin.trim() || undefined,
        items: validItems,
        notes: notes.trim() || undefined,
        date: new Date(),
      });
      const blob = doc.output("blob");
      const file = new File([blob], `VOLAMP_Invoice_${activeId}.pdf`, {
        type: "application/pdf",
      });

      if (
        typeof navigator !== "undefined" &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `VOLAMP Invoice ${activeId}`,
          text: `VOLAMP Quick Order Invoice Requisition (${activeId}) for ${customerName || "Customer"}`,
        });
        toast.success("Shared PDF document to WhatsApp!");
      } else {
        toast.info("Direct device file share not supported on this browser.", {
          description:
            "Use the WhatsApp link with the direct PDF URL, or attach the downloaded PDF file in WhatsApp.",
        });
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        toast.error("Share failed: " + err.message);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const linkEl = document.getElementById("qo-whatsapp-direct-link");
    if (linkEl) {
      linkEl.click();
    }
  };

  const handleReset = () => {
    setSubmittedOrderId(null);
    setSubmittedItems([]);
    setRows([createEmptyRow()]);
    onClose();
  };

  const handleDownloadExistingPdf = () => {
    if (!submittedOrderId || submittedItems.length === 0) return;
    downloadQuickOrderPdf({
      quickOrderId: submittedOrderId,
      customerName: customerName.trim(),
      companyName: companyName.trim() || undefined,
      phone: phone.trim(),
      email: email.trim() || undefined,
      location: projectLocation.trim() || undefined,
      items: submittedItems,
      notes: notes.trim() || undefined,
      date: new Date(),
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[720px] max-h-[92vh] overflow-y-auto rounded-2xl bg-white border border-[#d2e0e8] p-5 sm:p-7 shadow-2xl transition-all text-[#142b40]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Datalist for suggestions */}
        <datalist id="quick-order-product-suggestions">
          {productSuggestions.map((prod) => (
            <option key={prod} value={prod} />
          ))}
        </datalist>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close Quick Order modal"
        >
          <X className="size-5" />
        </button>

        {!submittedOrderId ? (
          <form onSubmit={handleFormSubmit}>
            {/* Header */}
            <div className="flex items-start gap-3.5 mb-5">
              <div className="size-12 rounded-xl bg-amber-500/10 text-[#d97818] flex items-center justify-center shrink-0">
                <Zap className="size-6 text-[#d97818]" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#c46b19] uppercase block">
                  VOLAMP QUICK ORDER & INVOICE DESK · WHATSAPP +91 9512365582
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] leading-tight">
                  Quick Order — Create WhatsApp Invoice
                </h2>
                <p className="text-xs text-[#5a6b78] mt-1">
                  Add products, adjust quantities, and instantly create an official B2B invoice & requisition on WhatsApp (+91 9512365582).
                </p>
              </div>
            </div>

            {/* PRODUCT ENTRY SECTION */}
            <div className="mb-6 rounded-xl border border-[#dce5eb] bg-[#f8fafc] p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold font-['Space_Grotesk'] text-[#102a40] uppercase tracking-wider">
                    Requisition Product List
                  </h3>
                  <p className="text-[11px] text-[#6b7c88]">
                    Enter product name, specify quantity, or remove any row.
                  </p>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#1d73b7] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {rows.length} {rows.length === 1 ? "Product" : "Products"}
                </span>
              </div>

              {/* Table Header */}
              <div className="hidden sm:grid grid-cols-[1fr_110px_90px] gap-2 pb-2 border-b border-[#e2ecf2] text-[11px] font-bold text-[#5a6b78] uppercase">
                <span>Product Name</span>
                <span className="text-right pr-2">Quantity</span>
                <span className="text-center">Action</span>
              </div>

              {/* Product Rows */}
              <div className="space-y-2.5 mt-2.5">
                {rows.map((row, index) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_110px_90px] gap-2 items-center bg-white p-2.5 rounded-lg border border-[#e2ecf2] shadow-xs"
                  >
                    {/* Product Name Input */}
                    <div>
                      <span className="sm:hidden text-[10px] font-bold text-[#5a6b78] block mb-1">
                        Product #{index + 1}
                      </span>
                      <Input
                        type="text"
                        list="quick-order-product-suggestions"
                        value={row.name}
                        onChange={(e) => handleUpdateName(row.id, e.target.value)}
                        placeholder="e.g. 2.5 SQMM Copper Cable or Power Contactors 3P 9A"
                        className="text-xs h-9 bg-white font-medium"
                        required
                      />
                      {(row.productId || row.brand) && (
                        <div className="flex items-center gap-1.5 mt-1">
                          {row.productId && (
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {row.productId}
                            </span>
                          )}
                          {row.brand && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              {row.brand}
                            </span>
                          )}
                          {row.unitPrice && (
                            <span className="text-[10px] text-slate-500 font-medium ml-auto">
                              Indicative: ₹{row.unitPrice}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity Input */}
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="sm:hidden text-[10px] font-bold text-[#5a6b78]">
                        Qty:
                      </span>
                      <Input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(row.id, parseInt(e.target.value, 10))
                        }
                        className="text-xs h-9 w-24 text-right font-semibold bg-white"
                        required
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="flex items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProduct(row.id)}
                        className="h-8 px-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto flex items-center justify-center gap-1"
                        title="Remove this product from the Quick Order"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Datalist for live product suggestions */}
              <datalist id="quick-order-product-suggestions">
                {liveCatalog?.products?.map((p) => (
                  <option key={p.productId} value={p.name}>
                    [{p.productId}] {p.brand} · {p.size || p.subcategory} · {p.price}
                  </option>
                ))}
                {productSuggestions.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>

              {/* + ADD PRODUCT BUTTON */}
              <div className="mt-3.5 pt-2 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddProduct}
                  className="text-xs font-bold border-dashed border-[#1d73b7] text-[#1d73b7] hover:bg-blue-50/60 h-9 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="size-4" />
                  <span>+ Add Product</span>
                </Button>

                <span className="text-[11px] text-[#6b7c88]">
                  No item limits · Add as many products as needed
                </span>
              </div>
            </div>

            {/* CUSTOMER INFORMATION SECTION */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-bold font-['Space_Grotesk'] text-[#102a40] uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="size-3.5 text-[#d97818]" />
                Customer & Delivery Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="qo-customer-name" className="text-xs font-semibold text-[#102a40]">
                    Your Name *
                  </Label>
                  <Input
                    id="qo-customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="text-xs h-9 mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="qo-phone" className="text-xs font-semibold text-[#102a40]">
                    WhatsApp / Mobile Phone *
                  </Label>
                  <Input
                    id="qo-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="text-xs h-9 mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="qo-company" className="text-xs font-semibold text-[#102a40]">
                    Company / Organization Name (Optional)
                  </Label>
                  <Input
                    id="qo-company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Mega Infra Ltd."
                    className="text-xs h-9 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="qo-gstin" className="text-xs font-semibold text-[#102a40]">
                    Company GSTIN / Tax ID (Optional for GST Invoice)
                  </Label>
                  <Input
                    id="qo-gstin"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g. 24AAAAA0000A1Z5"
                    className="text-xs h-9 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="qo-email" className="text-xs font-semibold text-[#102a40]">
                    Work Email (Optional)
                  </Label>
                  <Input
                    id="qo-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="procurement@company.com"
                    className="text-xs h-9 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="qo-location" className="text-xs font-semibold text-[#102a40] flex items-center gap-1">
                    <MapPin className="size-3 text-[#1d73b7]" /> Project Delivery Location
                  </Label>
                  <Input
                    id="qo-location"
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    placeholder="e.g. Ahmedabad, Gujarat, India"
                    className="text-xs h-9 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="qo-notes" className="text-xs font-semibold text-[#102a40]">
                  Project Notes / Cable Specifications (Optional)
                </Label>
                <textarea
                  id="qo-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mention delivery deadlines, drum lengths, insulation classes or technical requirements..."
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-3 border-t border-[#e8eff3] space-y-2">
              <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                {/* DIRECT WHATSAPP ANCHOR LINK */}
                <a
                  id="qo-whatsapp-direct-link"
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDirectWhatsAppSend}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs h-11 rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer no-underline transition-all select-none"
                >
                  <MessageCircle className="size-4" />
                  <span>Send to WhatsApp (+91 9512365582) & Create Invoice</span>
                </a>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="text-xs h-11 border-[#dce5eb] text-[#5a6b78]"
                >
                  Cancel
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-xs pt-1">
                <span className="text-[#6b7c88]">Direct WhatsApp Desk Link:</span>
                <a
                  href={`https://wa.me/919512365582`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="size-3.5" /> +91 9512365582
                </a>
                <span className="text-[#a0b0bb]">·</span>
                <span className="text-[#6b7c88]">Creates pre-formatted requisition & official PDF</span>
              </div>
            </div>
          </form>
        ) : (
          /* SUBMISSION SUCCESS VIEW */
          <div className="py-6 text-center">
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="size-10" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Quick Order PDF Invoice Created
            </span>
            <h3 className="text-2xl font-bold text-[#102a40] font-['Space_Grotesk'] mt-2">
              {submittedOrderId}
            </h3>
            <p className="text-xs text-[#5a6b78] mt-2 max-w-[500px] mx-auto leading-relaxed">
              Thank you, <strong>{customerName}</strong>. Your official PDF Invoice requisition for{" "}
              <strong>{submittedItems.length} product line(s)</strong> has been compiled, downloaded, and transmitted to WhatsApp desk (<strong>+91 9512365582</strong>).
            </p>

            {/* Live PDF Document Link Card */}
            <div className="my-4 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-left max-w-[500px] mx-auto text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#102a40] flex items-center gap-1.5">
                  <FileText className="size-4 text-[#1d73b7]" /> Stamped PDF Document Link:
                </span>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                  PDF FORMAT
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-200">
                <input
                  type="text"
                  readOnly
                  value={pdfUrl}
                  className="text-[11px] font-mono text-gray-700 bg-transparent flex-1 outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pdfUrl);
                    toast.success("PDF link copied to clipboard!");
                  }}
                  className="text-xs font-semibold text-[#1d73b7] hover:underline flex items-center gap-1 shrink-0"
                >
                  <Copy className="size-3" /> Copy
                </button>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-[#1d73b7] hover:underline flex items-center gap-1 shrink-0"
                >
                  <ExternalLink className="size-3" /> View
                </a>
              </div>
            </div>

            {/* Item summary box */}
            <div className="my-4 p-4 rounded-xl bg-[#f8fafc] border border-[#dce5eb] text-left max-w-[500px] mx-auto text-xs space-y-2">
              <strong className="block text-[11px] uppercase tracking-wider text-[#5a6b78] border-b border-[#e2ecf2] pb-1.5">
                Included Products in PDF ({submittedItems.length})
              </strong>
              {submittedItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-0.5">
                  <span className="font-semibold text-[#102a40]">{item.name}</span>
                  <span className="font-mono font-bold text-[#1d73b7]">Qty: {item.quantity}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-[#e2ecf2] flex justify-between text-[11px] text-[#5a6b78]">
                <span>Delivery: {projectLocation}</span>
                <span className="font-bold text-emerald-700">Official Stamped PDF Ready</span>
              </div>
            </div>

            {/* How to attach PDF in WhatsApp card */}
            <div className="my-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-left max-w-[500px] mx-auto text-[11px] text-[#784d14] space-y-1.5">
              <strong className="block font-bold text-xs text-[#8c5208] flex items-center gap-1.5">
                <FileDown className="size-4" /> PDF Attachment Guidance for WhatsApp:
              </strong>
              <p>
                1. <strong>Direct Link Sent:</strong> The WhatsApp message already includes the direct link to this official PDF for the supply desk.
              </p>
              <p>
                2. <strong>Attach File Directly:</strong> Your browser has also downloaded <strong>VOLAMP_Invoice_{submittedOrderId}.pdf</strong>. In WhatsApp, tap 📎 <em>(Attach) &gt; Document</em> to attach the file directly!
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 justify-center max-w-[500px] mx-auto pt-1">
              <Button
                type="button"
                onClick={handleDownloadExistingPdf}
                className="bg-[#1d73b7] hover:bg-[#155a90] text-white text-xs font-semibold h-10 rounded-lg flex items-center justify-center gap-1.5"
              >
                <FileDown className="size-4" /> Download PDF
              </Button>

              {lastWaUrl && (
                <a
                  href={lastWaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-10 px-4 rounded-lg inline-flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <MessageCircle className="size-4" /> Open WhatsApp (+91 9512365582)
                </a>
              )}

              {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                <Button
                  type="button"
                  onClick={handleShareFileDirectly}
                  variant="outline"
                  className="border-emerald-600/40 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold h-10 rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Share2 className="size-4" /> Share PDF File
                </Button>
              )}

              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                className="text-xs font-semibold h-10 rounded-lg border-[#dce5eb]"
              >
                Done / Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
