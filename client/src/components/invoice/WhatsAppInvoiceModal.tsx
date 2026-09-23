import React, { useState } from "react";
import { useUserLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  MessageCircle,
  X,
  PhoneCall,
  CheckCircle2,
  Building2,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

interface WhatsAppInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRef?: string;
  defaultCustomer?: string;
  defaultCompany?: string;
}

export function WhatsAppInvoiceModal({
  isOpen,
  onClose,
  defaultRef = "",
  defaultCustomer = "",
  defaultCompany = "",
}: WhatsAppInvoiceModalProps) {
  const { location } = useUserLocation();

  const [customerName, setCustomerName] = useState(defaultCustomer);
  const [companyName, setCompanyName] = useState(defaultCompany);
  const [phone, setPhone] = useState("");
  const [referenceId, setReferenceId] = useState(defaultRef);
  const [gstin, setGstin] = useState("");
  const [amount, setAmount] = useState("");
  const [invoiceType, setInvoiceType] = useState("Tax Invoice (GST)");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (defaultRef) setReferenceId(defaultRef);
    if (defaultCustomer) setCustomerName(defaultCustomer);
    if (defaultCompany) setCompanyName(defaultCompany);
  }, [defaultRef, defaultCustomer, defaultCompany]);

  if (!isOpen) return null;

  const billingDeskNumber = "919512365582";
  const formattedDisplayNumber = "+91 9512365582";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() && !companyName.trim()) {
      toast.error("Please provide your name or company name.");
      return;
    }

    const messageLines = [
      "*VOLAMP ELEKTRIKALS — INVOICE GENERATION REQUEST*",
      `*Official Billing Desk:* ${formattedDisplayNumber}`,
      `*Date:* ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`,
      "",
      `*Customer / Contact:* ${customerName.trim() || "Procurement Desk"}`,
      companyName.trim() ? `*Company Name:* ${companyName.trim()}` : "",
      gstin.trim() ? `*GSTIN:* ${gstin.trim().toUpperCase()}` : "",
      phone.trim() ? `*Contact Mobile:* ${phone.trim()}` : "",
      referenceId.trim() ? `*Reference / Order / PO #:* ${referenceId.trim()}` : "",
      amount.trim() ? `*Billing Amount:* ₹${amount.trim()}` : "",
      `*Invoice Type:* ${invoiceType}`,
      location ? `*Delivery / Project Location:* ${location}` : "",
      "",
      notes.trim() ? `*Special Notes / Instructions:*\n${notes.trim()}\n` : "",
      "Please review the above details, generate the official invoice with VOLAMP bank RTGS credentials, and share the PDF copy on this WhatsApp chat.",
    ].filter(Boolean);

    const fullMessage = messageLines.join("\n");
    const waUrl = `https://wa.me/${billingDeskNumber}?text=${encodeURIComponent(fullMessage)}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
    setSubmitted(true);
    toast.success("Opening WhatsApp Billing Desk", {
      description: `Connecting with ${formattedDisplayNumber} to generate your invoice.`,
    });
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[580px] max-h-[92vh] overflow-y-auto rounded-2xl bg-white border border-[#d2e0e8] p-5 sm:p-7 shadow-2xl transition-all text-[#142b40]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close invoice modal"
        >
          <X className="size-5" />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3.5 mb-2">
              <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Receipt className="size-6 text-emerald-600" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#c46b19] uppercase block">
                  VOLAMP OFFICIAL BILLING DESK
                </span>
                <h2 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] leading-tight text-[#102a40]">
                  Create Invoice on WhatsApp
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <MessageCircle className="size-3.5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">
                    Official WhatsApp: {formattedDisplayNumber}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#5a6b78] leading-relaxed">
              Generate an official GST Tax Invoice, Proforma Invoice, or payment link directly through the VOLAMP accounts desk on WhatsApp.
            </p>

            {/* Form Fields */}
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="inv-customer-name" className="text-xs font-semibold text-[#102a40]">
                    Contact Person Name *
                  </Label>
                  <Input
                    id="inv-customer-name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="text-xs h-9 mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="inv-company-name" className="text-xs font-semibold text-[#102a40]">
                    Company / Entity Name
                  </Label>
                  <Input
                    id="inv-company-name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Mega Infra Pvt. Ltd."
                    className="text-xs h-9 mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="inv-phone" className="text-xs font-semibold text-[#102a40]">
                    Your WhatsApp Mobile
                  </Label>
                  <Input
                    id="inv-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="text-xs h-9 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="inv-gstin" className="text-xs font-semibold text-[#102a40]">
                    Company GSTIN (For Tax Credit)
                  </Label>
                  <Input
                    id="inv-gstin"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="24AAACV1234F1Z5"
                    className="text-xs h-9 mt-1 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="inv-reference" className="text-xs font-semibold text-[#102a40]">
                    Order / Quotation Ref #
                  </Label>
                  <Input
                    id="inv-reference"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="e.g. QO-2026-10492 or ORD-5412"
                    className="text-xs h-9 mt-1 font-mono"
                  />
                </div>

                <div>
                  <Label htmlFor="inv-amount" className="text-xs font-semibold text-[#102a40]">
                    Estimated Amount (₹ Optional)
                  </Label>
                  <Input
                    id="inv-amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 150000"
                    className="text-xs h-9 mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="inv-type" className="text-xs font-semibold text-[#102a40]">
                  Invoice Document Type
                </Label>
                <select
                  id="inv-type"
                  value={invoiceType}
                  onChange={(e) => setInvoiceType(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                >
                  <option value="Tax Invoice (GST)">Tax Invoice (Official GST Invoice with HSN & E-way)</option>
                  <option value="Proforma Invoice (PI)">Proforma Invoice (For internal PO approval & budget)</option>
                  <option value="Advance Payment Receipt">Advance / Milestone Payment Receipt</option>
                  <option value="Commercial Export Invoice">Commercial Export Invoice (USD / LC Terms)</option>
                </select>
              </div>

              <div>
                <Label htmlFor="inv-notes" className="text-xs font-semibold text-[#102a40]">
                  Special Billing / Payment Instructions (Optional)
                </Label>
                <textarea
                  id="inv-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Need bank RTGS/NEFT details, mention project PO number on invoice, separate freight charges, etc."
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#e8eff3] flex flex-col sm:flex-row gap-2.5">
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="size-4" />
                <span>Create Invoice via WhatsApp ({formattedDisplayNumber})</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="text-xs h-11 border-[#dce5eb] text-[#5a6b78]"
              >
                Cancel
              </Button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#71818c] pt-1">
              <span>Direct Call: <a href="tel:+919512365582" className="font-bold text-[#102a40] hover:underline">{formattedDisplayNumber}</a></span>
              <span>Official GST Registered Firm</span>
            </div>
          </form>
        ) : (
          /* Confirmation State */
          <div className="py-6 text-center">
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="size-10" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              WhatsApp Chat Initialized
            </span>
            <h3 className="text-2xl font-bold text-[#102a40] font-['Space_Grotesk'] mt-2">
              Invoice Desk Connected
            </h3>
            <p className="text-xs text-[#5a6b78] mt-2 max-w-[420px] mx-auto leading-relaxed">
              Your invoice generation request has been prepared for the VOLAMP accounts team on WhatsApp at{" "}
              <strong>{formattedDisplayNumber}</strong>.
            </p>

            <div className="my-5 p-4 rounded-xl bg-[#f8fafc] border border-[#dce5eb] text-left max-w-[440px] mx-auto text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#5a6b78]">Billing Desk:</span>
                <strong className="text-emerald-700 font-bold">{formattedDisplayNumber}</strong>
              </div>
              {referenceId && (
                <div className="flex justify-between">
                  <span className="text-[#5a6b78]">Reference:</span>
                  <strong className="font-mono text-[#1d73b7]">{referenceId}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#5a6b78]">Document Requested:</span>
                <strong className="text-[#102a40]">{invoiceType}</strong>
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                onClick={handleReset}
                className="bg-[#102a40] hover:bg-[#081d2f] text-white text-xs font-semibold px-6 h-10 rounded-lg"
              >
                Close Window
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
