import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
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
  ArrowLeft,
  Phone,
  Mail,
  User,
  PackageSearch,
  Clock,
  ExternalLink,
  Factory,
  Globe2,
  FileCheck2,
  Award,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useUserLocation } from "@/contexts/LocationContext";

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

export default function EnquirePage() {
  const [, navigate] = useLocation();
  const { location: detectedLocation } = useUserLocation();

  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [quantity, setQuantity] = useState("");
  const [urgency, setUrgency] = useState(TIMELINE_OPTIONS[1]);
  const [details, setDetails] = useState("");

  const [submittedData, setSubmittedData] = useState<{
    enquiryNumber: string;
    fullName: string;
    category: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

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
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#142b40] flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <img
                src="/volamp-logo.png"
                alt="VOLAMP Elektrikals"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <span className="hidden sm:inline-block text-stone-300">|</span>
            <span className="hidden sm:inline-block text-xs font-semibold text-stone-600 uppercase tracking-wider">
              Enquiry & Quotation Desk
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#ef7d19] px-3 py-1.5 rounded-lg border border-stone-200 hover:border-orange-300 transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb & Hero */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1d73b7] text-xs font-bold uppercase tracking-wider border border-blue-200/80 mb-3">
              <Headphones className="size-3.5 text-[#1d73b7]" />
              <span>VOLAMP SUPPLY & EXPORT DESK</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#102a40] font-['Space_Grotesk'] tracking-tight">
              Tell us what you need to source.
            </h1>
            <p className="mt-3 text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
              Get direct manufacturer pricing, verified mill specifications, and prompt technical quotations for industrial, EPC, and export projects.
            </p>
          </div>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Sourcing Desk Info & Trust */}
            <div className="lg:col-span-5 space-y-6">
              {/* Contact Card */}
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-5">
                <h2 className="text-base font-bold text-[#102a40] font-['Space_Grotesk'] flex items-center gap-2">
                  <Factory className="size-4 text-[#ef7d19]" />
                  <span>Central Supply & Export Desk</span>
                </h2>

                <div className="space-y-3.5 text-xs text-stone-700">
                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-[#1d73b7] shrink-0 mt-0.5" />
                    <div>
                      <strong>Headquarters & Central Depot:</strong>
                      <p className="text-stone-600 mt-0.5 leading-relaxed">
                        Volamp Elektrikals, Ahmedabad, Gujarat, India.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="size-4 text-[#1d73b7] shrink-0 mt-0.5" />
                    <div>
                      <strong>Direct Supply Phone:</strong>
                      <p className="text-stone-600 mt-0.5">
                        <a href="tel:+919512365582" className="text-[#1d73b7] font-semibold hover:underline">
                          +91 95123 65582
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="size-4 text-[#1d73b7] shrink-0 mt-0.5" />
                    <div>
                      <strong>Official RFQ Email:</strong>
                      <p className="text-stone-600 mt-0.5">
                        <a href="mailto:contact@volampelektrikals.com" className="text-[#1d73b7] font-semibold hover:underline">
                          contact@volampelektrikals.com
                        </a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="size-4 text-[#1d73b7] shrink-0 mt-0.5" />
                    <div>
                      <strong>Desk Hours:</strong>
                      <p className="text-stone-600 mt-0.5">
                        Mon – Sat: 9:00 AM – 7:30 PM IST (WhatsApp: 24/7)
                      </p>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Quick Tab */}
                <div className="pt-2">
                  <a
                    href="https://wa.me/919512365582?text=Hello%20Volamp%20Supply%20Desk%2C%20I%20would%20like%20to%20request%20a%20project%20quotation."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1da851] hover:bg-[#158641] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <MessageCircle className="size-4" />
                    <span>Quick Chat on WhatsApp (+91 95123 65582)</span>
                    <ExternalLink className="size-3 ml-auto opacity-75" />
                  </a>
                </div>
              </div>

              {/* Guarantees Strip */}
              <div className="p-6 rounded-2xl bg-[#0b1f33] text-white space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                  VOLAMP ASSURANCE
                </span>
                <h3 className="text-lg font-bold font-['Space_Grotesk'] text-white">
                  Why Leading EPCs & Contractors Source With Us
                </h3>
                <div className="space-y-3 text-xs text-stone-300">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>100% Genuine Certified Goods:</strong> Direct from Polycab, Finolex, KEI, Schneider, Havells & Volamp certified mills.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <FileCheck2 className="size-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Mill Test Certificates (MTC):</strong> Original factory test reports supplied with every cable drum and consignment.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Globe2 className="size-4 text-sky-400 shrink-0 mt-0.5" />
                    <span><strong>Pan-India & Global Supply:</strong> Verified project delivery in 28 states and export handling via Mundra & Nhava Sheva ports.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Award className="size-4 text-orange-400 shrink-0 mt-0.5" />
                    <span><strong>Government GeM Registered:</strong> Approved supplier on Government e-Marketplace for public and defence tenders.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Form or Success Card */}
            <div className="lg:col-span-7">
              {submittedData ? (
                /* Success State */
                <div className="p-8 sm:p-10 rounded-2xl bg-white border border-stone-200 shadow-sm text-center space-y-6">
                  <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="size-9" />
                  </div>

                  <div className="space-y-2 max-w-lg mx-auto">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      ENQUIRY LOGGED SUCCESSFULLY
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-[#102a40] font-['Space_Grotesk'] pt-1">
                      Thank You, {submittedData.fullName}!
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Your sourcing requirement has been received by our engineering sales desk. A dedicated representative will review your specifications and get in touch with you shortly.
                    </p>
                  </div>

                  {/* Reference Box */}
                  <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 max-w-md mx-auto text-left space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Enquiry Reference:</span>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Under Review
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-xl sm:text-2xl font-bold text-[#1d73b7]">
                        {submittedData.enquiryNumber}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyRef}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors shadow-xs"
                      >
                        <Copy className="size-3.5" />
                        <span>{copied ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500 pt-1">
                      Category: <strong>{submittedData.category}</strong>
                    </p>
                  </div>

                  {/* WhatsApp Priority Action */}
                  <div className="p-5 rounded-xl bg-[#e8f7ee] border border-[#a6dfba] max-w-md mx-auto text-left space-y-3">
                    <div className="flex items-start gap-2.5">
                      <MessageCircle className="size-5 text-[#1da851] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="text-xs font-bold text-[#145a2b]">Need fast turnaround?</strong>
                        <p className="text-[11px] text-[#236b3b] leading-relaxed">
                          Click below to forward your reference number to our sales engineering desk on WhatsApp for priority quotation.
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
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#1d73b7] hover:bg-[#165a8f] text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      Return to Homepage
                    </button>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
                    >
                      Submit Another Requirement
                    </button>
                  </div>
                </div>
              ) : (
                /* Form Card */
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-stone-200 shadow-sm">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1 pb-2 border-b border-stone-100">
                      <h3 className="text-lg font-bold text-[#102a40] font-['Space_Grotesk']">
                        Direct Sourcing Form
                      </h3>
                      <p className="text-xs text-stone-500">
                        Fill in your requirements below. Required fields are marked with <span className="text-red-500">*</span>.
                      </p>
                    </div>

                    {/* Section 1 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
                        <User className="size-4 text-[#ef7d19]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                          1. Your Information
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

                    {/* Section 2 */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
                        <PackageSearch className="size-4 text-[#ef7d19]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                          2. Requirement Specifications
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Product Category <span className="text-red-500">*</span>
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
                              placeholder="e.g. Surat, Gujarat or Pan-India"
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
                            Estimated Quantity / Scope
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 1500m / 50 drums / Commercial Building"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white text-stone-900 border border-stone-300 rounded-lg focus:border-[#1d73b7] focus:ring-1 focus:ring-[#1d73b7] focus:outline-none transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Procurement Urgency
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
                          Requirement Details & Technical Specifications <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={4}
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          placeholder="Provide details about required sizes, conductor (Copper/Aluminium), cores, insulation (XLPE/FRLS), brands (Polycab, Finolex, Schneider, KEI), or paste your Bill of Materials."
                          className="w-full px-3 py-2 text-xs bg-white text-stone-900 border border-stone-300 rounded-lg focus:border-[#1d73b7] focus:ring-1 focus:ring-[#1d73b7] focus:outline-none transition-all resize-y"
                        />
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1d73b7] to-[#155b93] hover:from-[#17629c] hover:to-[#124d7d] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-all disabled:opacity-75"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            <span>Submitting Enquiry...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Enquiry to Supply Desk</span>
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
