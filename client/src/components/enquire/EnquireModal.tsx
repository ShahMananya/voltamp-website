import React, { useState, useEffect } from "react";
import {
  X,
  Headphones,
  CheckCircle2,
  Copy,
  MessageCircle,
  Building2,
  MapPin,
  Sparkles,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Phone,
  Mail,
  User,
  PackageSearch,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useUserLocation } from "@/contexts/LocationContext";

export interface EnquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
  initialProduct?: string;
}

const CATEGORY_OPTIONS = [
  "Wire Cables (LT / HT / Armoured / FRLS)",
  "Switch Gears (MCB / MCCB / ACB / DBs)",
  "Lugs & Cable Accessories",
  "Glands & Cable Management",
  "PVC Pipe & Heavy Conduits",
  "Wiring Device & Modular Accessories",
  "Earthing Wires & Chemical Electrodes",
  "Solar DC Cables & Structure Hardware",
  "Complete Project Bill of Materials (BOM)",
  "Custom Specification / Other",
];

const TIMELINE_OPTIONS = [
  "Immediate / Urgent (within 48-72 hours)",
  "Ready Stock (within 7 days)",
  "Standard Project Dispatch (2-3 weeks)",
  "Tender / Advance Planning Stage",
];

export function EnquireModal({
  isOpen,
  onClose,
  initialCategory,
  initialProduct,
}: EnquireModalProps) {
  const { location: detectedLocation } = useUserLocation();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState(initialCategory || "Wire Cables (LT / HT / Armoured / FRLS)");
  const [quantity, setQuantity] = useState("");
  const [urgency, setUrgency] = useState(TIMELINE_OPTIONS[1]);
  const [details, setDetails] = useState("");

  const [submittedData, setSubmittedData] = useState<{
    enquiryNumber: string;
    fullName: string;
    category: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync initial props
  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (initialProduct && !details) {
      setDetails(`Requirement for: ${initialProduct}\nSpecifications: `);
    }
  }, [initialCategory, initialProduct]);

  // Set default location from context if empty
  useEffect(() => {
    if (!location && detectedLocation) {
      setLocation(detectedLocation);
    }
  }, [detectedLocation, location]);

  const submitMutation = trpc.enquiry.submit.useMutation({
    onSuccess: (data) => {
      setSubmittedData({
        enquiryNumber: data.enquiryNumber,
        fullName,
        category,
      });
      toast.success("Enquiry submitted successfully!", {
        description: `Reference: ${data.enquiryNumber}. A technical specialist will follow up shortly.`,
      });
    },
    onError: (err) => {
      toast.error("Submission failed", {
        description: err.message || "Please check your inputs and try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid work email address.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      toast.error("Please enter a valid contact phone or WhatsApp number.");
      return;
    }
    if (!details.trim() || details.trim().length < 5) {
      toast.error("Please provide some details regarding your sourcing requirement.");
      return;
    }

    submitMutation.mutate({
      fullName: fullName.trim(),
      companyName: companyName.trim() || undefined,
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      location: location.trim() || undefined,
      category,
      quantity: quantity.trim() || undefined,
      urgency,
      details: details.trim(),
    });
  };

  const handleCopyRef = () => {
    if (submittedData?.enquiryNumber) {
      navigator.clipboard.writeText(submittedData.enquiryNumber);
      setCopied(true);
      toast.success("Reference number copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setSubmittedData(null);
    setFullName("");
    setCompanyName("");
    setEmail("");
    setPhone("");
    setQuantity("");
    setDetails("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[680px] max-h-[92vh] overflow-y-auto rounded-2xl bg-white text-[#102b42] border border-stone-200 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#0b1f33] text-white border-b border-[#1c3852]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#1d73b7] text-white flex items-center justify-center shadow-inner">
              <Headphones className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                  VOLAMP SUPPLY & EXPORT DESK
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-['Space_Grotesk'] text-white">
                Enquire Now · Direct RFQ
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close dialog"
          >
            <X className="size-4" />
          </button>
        </div>

        {submittedData ? (
          /* Success Screen */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="size-9" />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ENQUIRY REGISTERED SUCCESSFULLY
              </span>
              <h3 className="text-2xl font-bold text-[#102a40] font-['Space_Grotesk'] pt-1">
                Thank You, {submittedData.fullName}!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Your sourcing requirement has been logged directly with the Volamp technical sales & export desk in Ahmedabad.
              </p>
            </div>

            {/* Reference Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-stone-50 border border-stone-200/80 max-w-md mx-auto text-left space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Enquiry Reference:</span>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Under Review
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-lg sm:text-xl font-bold text-[#1d73b7]">
                  {submittedData.enquiryNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
                >
                  <Copy className="size-3.5" />
                  <span>{copied ? "Copied!" : "Copy Ref"}</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-500 pt-1">
                Category: <strong>{submittedData.category}</strong>
              </p>
            </div>

            {/* WhatsApp Priority Action */}
            <div className="p-4 rounded-xl bg-[#e8f7ee] border border-[#a6dfba] max-w-md mx-auto text-left space-y-3">
              <div className="flex items-start gap-2.5">
                <MessageCircle className="size-5 text-[#1da851] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="text-xs font-bold text-[#145a2b]">Need an expedited quotation?</strong>
                  <p className="text-[11px] text-[#236b3b] leading-relaxed">
                    Message our supply engineer directly on WhatsApp with your reference number for rapid turnaround.
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/919512365582?text=${encodeURIComponent(
                  `Hello Volamp Supply Desk, I have submitted project enquiry *${submittedData.enquiryNumber}* for *${submittedData.category}*. Please review and share formal quotation.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1da851] hover:bg-[#168a42] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <MessageCircle className="size-4" />
                <span>Expedite via WhatsApp (+91 95123 65582)</span>
                <ExternalLink className="size-3" />
              </a>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1d73b7] hover:bg-[#165a8f] text-white text-xs font-bold transition-colors shadow-xs"
              >
                Done / Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedData(null);
                  setDetails("");
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
              >
                Submit Another Enquiry
              </button>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">
            {/* Top Info Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f0f6fa] border border-[#d2e2ec] text-xs text-[#1e4869]">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#1d73b7] shrink-0" />
                <span>Direct Mill & Distributor Pricing · Fast Technical Spec Verification</span>
              </div>
              <span className="hidden sm:inline-block text-[11px] font-semibold text-[#1d73b7] bg-white px-2 py-0.5 rounded border border-[#bed4e4]">
                24h Response
              </span>
            </div>

            {/* Section 1: Contact Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
                <User className="size-4 text-[#ef7d19]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  1. Contact Information
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white text-stone-900 border border-stone-300 rounded-lg focus:border-[#1d73b7] focus:ring-1 focus:ring-[#1d73b7] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Company / Organization
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Metro EPC / Apex Infra"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white text-stone-900 border border-stone-300 rounded-lg focus:border-[#1d73b7] focus:ring-1 focus:ring-[#1d73b7] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rajesh@metroepc.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white text-stone-900 border border-stone-300 rounded-lg focus:border-[#1d73b7] focus:ring-1 focus:ring-[#1d73b7] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white text-stone-900 border border-stone-300 rounded-lg focus:border-[#1d73b7] focus:ring-1 focus:ring-[#1d73b7] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Requirement Details */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
                <PackageSearch className="size-4 text-[#ef7d19]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  2. Sourcing Requirement & Specs
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category of Interest <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-stone-900 border border-stone-300 rounded-lg focus:border-[#1d73b7] focus:ring-1 focus:ring-[#1d73b7] focus:outline-none transition-all"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-stone-700">
                      Project Location / Delivery City
                    </label>
                    {detectedLocation && location !== detectedLocation && (
                      <button
                        type="button"
                        onClick={() => setLocation(detectedLocation)}
                        className="text-[10px] text-[#1d73b7] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <MapPin className="size-3" />
                        Use detected
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Ahmedabad, Gujarat or International Destination"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white text-stone-900 border border-stone-300 rounded-lg focus:border-[#1d73b7] focus:ring-1 focus:ring-[#1d73b7] focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Estimated Quantity / Project Scope
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1500m / 50 rolls / Turnkey supply"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white text-stone-900 border border-stone-300 rounded-lg focus:border-[#1d73b7] focus:ring-1 focus:ring-[#1d73b7] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Procurement Timeline
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white text-stone-900 border border-stone-300 rounded-lg focus:border-[#1d73b7] focus:ring-1 focus:ring-[#1d73b7] focus:outline-none transition-all"
                    >
                      {TIMELINE_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Technical Specifications / Requirement Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Mention cable cross-section (e.g. 4C x 185 sqmm), conductor type (Copper/Aluminium), insulation (XLPE/PVC/FRLS), voltage class (1.1kV/11kV/33kV), approved brand preference (Polycab, Finolex, Schneider, KEI), or project specs."
                  className="w-full px-3 py-2 text-xs bg-white text-stone-900 border border-stone-300 rounded-lg focus:border-[#1d73b7] focus:ring-1 focus:ring-[#1d73b7] focus:outline-none transition-all resize-y"
                />
              </div>
            </div>

            {/* Trust Footnote */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-stone-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                <span>Confidential RFQ · Factory Mill Test Certificates (MTC) Guaranteed</span>
              </div>
              <span>Supply Desk: +91 95123 65582</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1d73b7] to-[#155b93] hover:from-[#17629c] hover:to-[#124d7d] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all disabled:opacity-75"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Submitting Enquiry...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Enquiry</span>
                    <ArrowRight className="size-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
