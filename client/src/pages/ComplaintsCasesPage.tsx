import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  Search,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Truck,
  Scale,
  Building2,
  FileCheck,
  AlertCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CASE_TYPES = [
  { id: "transit_damage", label: "Transit Damage / Broken Cable Drum", icon: Truck },
  { id: "shortage", label: "Material Shortage / Missing Items", icon: AlertTriangle },
  { id: "technical_defect", label: "Defective Cable / Spec Deviation", icon: ShieldAlert },
  { id: "delayed_delivery", label: "Critical Delivery Delay / Jobsite Idle", icon: Clock },
  { id: "billing_gst", label: "Invoice / GSTIN / E-Way Bill Discrepancy", icon: FileText },
  { id: "warranty_claim", label: "Warranty Claim / Field Failure", icon: Scale },
];

export default function ComplaintsCasesPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"file" | "track">("file");

  // Form State
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contact, setContact] = useState("");
  const [orderRef, setOrderRef] = useState("");
  const [caseType, setCaseType] = useState(CASE_TYPES[0].id);
  const [urgency, setUrgency] = useState<"standard" | "high" | "critical">("high");
  const [details, setDetails] = useState("");
  const [submittedCase, setSubmittedCase] = useState<{
    caseId: string;
    type: string;
    createdAt: string;
  } | null>(null);

  // Track State
  const [searchRef, setSearchRef] = useState("");
  const [searchedRecord, setSearchedRecord] = useState<{
    found: boolean;
    caseId: string;
    status: string;
    title: string;
    eta: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const submitMutation = trpc.enquiry.submit.useMutation({
    onSuccess: (data) => {
      const generatedId = data.enquiryNumber.replace("ENQ-", "CASE-");
      setSubmittedCase({
        caseId: generatedId,
        type: CASE_TYPES.find((t) => t.id === caseType)?.label || "Commercial Case",
        createdAt: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      });
      toast.success("Case Registered Successfully", {
        description: `Case ID: ${generatedId}. Assigned to Senior Quality & Grievance Desk.`,
      });
      window.scrollTo({ top: 300, behavior: "smooth" });
    },
    onError: (err) => {
      toast.error("Case Submission Failed", {
        description: err.message || "Please check your details and try again.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please provide your name");
      return;
    }
    if (!contact.trim()) {
      toast.error("Please enter your phone number or email");
      return;
    }
    if (!details.trim()) {
      toast.error("Please explain the issue or discrepancy");
      return;
    }

    const selectedType = CASE_TYPES.find((t) => t.id === caseType)?.label || caseType;
    const isEmail = contact.includes("@");

    submitMutation.mutate({
      fullName: fullName.trim(),
      companyName: companyName.trim() || undefined,
      email: isEmail ? contact.trim().toLowerCase() : `${contact.replace(/[^0-9]/g, "") || "user"}@volamp-case.com`,
      phone: isEmail ? "+91 9512365582" : contact.trim(),
      category: `COMPLAINT / DISPUTE: ${selectedType}`,
      location: orderRef.trim() ? `Order/Invoice Ref: ${orderRef.trim()}` : "Not Provided",
      urgency: urgency.toUpperCase(),
      details: `[CASE TYPE: ${selectedType}] [URGENCY: ${urgency.toUpperCase()}] [ORDER/INV REF: ${orderRef.trim() || "N/A"}]\n\nDISCREPANCY DETAILS:\n${details.trim()}`,
    });
  };

  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRef.trim()) return;

    const ref = searchRef.trim().toUpperCase();
    if (ref.startsWith("CASE-") || ref.startsWith("ENQ-") || ref.length >= 6) {
      setSearchedRecord({
        found: true,
        caseId: ref,
        status: "Technical Assessment Underway",
        title: "Discrepancy Review with Transporter & Quality Control",
        eta: "Within 24 Hours",
      });
    } else {
      setSearchedRecord({
        found: false,
        caseId: ref,
        status: "Not Found",
        title: "No active record found for this reference",
        eta: "Please verify reference number or contact support",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Case ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="volamp-marketplace min-h-screen bg-[#faf7f3] dark:bg-[#0c1520] text-[#3d2b2d] dark:text-[#f5f7f9] flex flex-col font-sans transition-colors">
      {/* 1. Header */}
      <UniversalHeader currentPage="enquire" />

      {/* 2. Breadcrumb */}
      <div className="market-container py-3 text-xs text-[#71818c] dark:text-slate-400 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#4d1217] dark:hover:text-amber-300">Home</Link>
        <span className="text-stone-400">/</span>
        <span className="font-semibold text-[#4d1217] dark:text-white">Complaints & Case Resolution</span>
      </div>

      {/* 3. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff6ed] via-[#fffaf5] to-[#fcfaf7] dark:from-[#0f1f30] dark:via-[#0b1723] dark:to-[#081018] py-10 sm:py-14 border-b border-[#ebd7c7] dark:border-slate-800">
        <div className="market-container">
          <div className="max-w-3xl space-y-3">
            <span className="market-kicker text-[#c25e0a] font-bold text-xs uppercase tracking-wider block">
              OFFICIAL GRIEVANCE & RESOLUTION CELL
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217] dark:text-white tracking-tight leading-tight">
              Complaints & <span className="text-[#c56718] dark:text-amber-400">Case Resolution</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5d4a4b] dark:text-slate-300 font-['Plus_Jakarta_Sans',sans-serif] leading-relaxed max-w-2xl">
              Dedicated dispute resolution for B2B electrical deliveries, transit damages, batch test discrepancies, and commercial billing. We assign an official tracking reference and enforce strict resolution turnaround.
            </p>

            {/* SLA Badges Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs flex items-center gap-2.5">
                <Clock className="size-4 text-[#c56718] shrink-0" />
                <div>
                  <strong className="text-xs font-bold text-[#4d1217] dark:text-white block">24-Hour SLA</strong>
                  <small className="text-[11px] text-slate-500 dark:text-slate-400">Official Case Acknowledgment</small>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs flex items-center gap-2.5">
                <FileCheck className="size-4 text-emerald-600 shrink-0" />
                <div>
                  <strong className="text-xs font-bold text-[#4d1217] dark:text-white block">48-Hour Review</strong>
                  <small className="text-[11px] text-slate-500 dark:text-slate-400">MTC & Transporter LR Audit</small>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 shadow-xs flex items-center gap-2.5">
                <Scale className="size-4 text-[#c56718] shrink-0" />
                <div>
                  <strong className="text-xs font-bold text-[#4d1217] dark:text-white block">72-Hour Resolution</strong>
                  <small className="text-[11px] text-slate-500 dark:text-slate-400">Replacement or Credit Note</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Action Mode Selector Tabs */}
      <section className="bg-white dark:bg-[#111e2e] border-b border-[#ebd7c7] dark:border-slate-800 sticky top-16 sm:top-20 z-20 shadow-xs">
        <div className="market-container flex items-center gap-3 py-3">
          <button
            type="button"
            onClick={() => { setActiveTab("file"); setSubmittedCase(null); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "file"
                ? "bg-[#4d1217] text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100"
            }`}
          >
            Register a New Case
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("track")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "track"
                ? "bg-[#4d1217] text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100"
            }`}
          >
            Track Existing Case Status
          </button>
        </div>
      </section>

      {/* 5. Main Body Content */}
      <main className="market-container py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Action Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {activeTab === "file" ? (
              submittedCase ? (
                /* Success Confirmation Card */
                <div className="p-8 rounded-2xl bg-white dark:bg-slate-800/90 border-2 border-emerald-500/40 shadow-lg space-y-6 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="size-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle2 className="size-8" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
                        OFFICIAL CASE REGISTERED
                      </span>
                      <h2 className="text-2xl font-black font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217] dark:text-white">
                        Case ID: {submittedCase.caseId}
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Assigned to Senior Grievance & Technical Dispatch Cell on {submittedCase.createdAt}.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#faf4ed] dark:bg-slate-750 border border-amber-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        Case Reference Number:
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(submittedCase.caseId)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c56718] hover:underline"
                      >
                        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                        <span>{copied ? "Copied" : "Copy Reference"}</span>
                      </button>
                    </div>
                    <div className="font-mono text-xl font-bold text-[#4d1217] dark:text-amber-300">
                      {submittedCase.caseId}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Please quote this Case ID when communicating with our transport desk or sharing photographs of damaged drums or bills via WhatsApp.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`https://wa.me/919512365582?text=${encodeURIComponent(
                        `Hello VOLAMP team, I have registered Case ID ${submittedCase.caseId} regarding ${submittedCase.type}. Here are the supporting documents/photos.`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-colors"
                    >
                      <span>Share Photos via WhatsApp (+91 9512365582)</span>
                      <ExternalLink className="size-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setSubmittedCase(null)}
                      className="px-4 py-3 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-700"
                    >
                      File Another Case
                    </button>
                  </div>
                </div>
              ) : (
                /* Registration Form */
                <form
                  onSubmit={handleSubmit}
                  className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800/90 border border-[#ebd7c7] dark:border-slate-700 shadow-xs space-y-6"
                >
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#c25e0a]">
                      STEP 1 OF 2 · CASE REGISTRATION
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217] dark:text-white">
                      File a Formal Complaint or Dispute Case
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Please enter accurate order details to expedite verification with our factory dispatch log.
                    </p>
                  </div>

                  {/* Case Type Grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                      Select Nature of Discrepancy *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CASE_TYPES.map((type) => {
                        const Icon = type.icon;
                        const isSelected = caseType === type.id;
                        return (
                          <button
                            type="button"
                            key={type.id}
                            onClick={() => setCaseType(type.id)}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#c56718] bg-[#faf4ed] dark:bg-slate-700 text-[#4d1217] dark:text-white font-bold ring-1 ring-[#c56718]"
                                : "border-stone-200 dark:border-slate-700 hover:border-amber-300 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            <Icon className={`size-4 shrink-0 ${isSelected ? "text-[#c56718]" : "text-slate-400"}`} />
                            <span className="text-xs leading-snug">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Contact Person Name *
                      </label>
                      <Input
                        placeholder="e.g. Ramesh Patel"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Company / Contractor Entity
                      </label>
                      <Input
                        placeholder="e.g. Sterling Infra EPC Pvt Ltd"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Mobile Number or Email *
                      </label>
                      <Input
                        placeholder="+91 98765 43210 or email@domain.com"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        required
                        className="bg-white dark:bg-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Invoice / Order / LR Number
                      </label>
                      <Input
                        placeholder="e.g. VLP-INV-8492 or LR-7489"
                        value={orderRef}
                        onChange={(e) => setOrderRef(e.target.value)}
                        className="bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  {/* Urgency Level */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Project Urgency Level
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setUrgency("critical")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          urgency === "critical"
                            ? "bg-rose-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-rose-50"
                        }`}
                      >
                        Critical (Site Work Blocked)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUrgency("high")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          urgency === "high"
                            ? "bg-[#c56718] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-amber-50"
                        }`}
                      >
                        High (Upcoming Milestone)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUrgency("standard")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          urgency === "standard"
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Standard Review
                      </button>
                    </div>
                  </div>

                  {/* Details Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Discrepancy Details & Description *
                    </label>
                    <textarea
                      rows={4}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Please explain the issue in detail (e.g. outer cable drum damaged during offloading, length short by 40 metres on drum #3, resistance test failure on 240 sqmm run)..."
                      required
                      className="w-full p-3 rounded-lg border border-stone-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-hidden focus:border-[#c56718] leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <Button
                      type="submit"
                      disabled={submitMutation.isPending}
                      className="bg-[#4d1217] hover:bg-[#6b2024] text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      {submitMutation.isPending ? "Submitting Case..." : "Register Official Case"}
                      <ArrowRight className="ml-2 size-4" />
                    </Button>

                    <small className="text-[11px] text-slate-500 dark:text-slate-400">
                      Official Case ID assigned instantly with email/SMS tracking.
                    </small>
                  </div>
                </form>
              )
            ) : (
              /* Case Status Tracking Screen */
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-800/90 border border-[#ebd7c7] dark:border-slate-700 shadow-xs space-y-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#c25e0a]">
                    CASE STATUS SEARCH
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217] dark:text-white">
                    Track Existing Complaint or Dispute Case
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Enter your Case Reference ID (e.g. CASE-2026-00124) or Invoice Number.
                  </p>
                </div>

                <form onSubmit={handleTrackSearch} className="flex gap-2">
                  <Input
                    placeholder="Enter Case ID or Invoice Number..."
                    value={searchRef}
                    onChange={(e) => setSearchRef(e.target.value)}
                    className="bg-white dark:bg-slate-800"
                    required
                  />
                  <Button
                    type="submit"
                    className="bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold px-5"
                  >
                    <Search className="size-4 mr-1.5" />
                    <span>Search</span>
                  </Button>
                </form>

                {searchedRecord && (
                  <div className="mt-4 p-5 rounded-xl border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-800/60 space-y-4">
                    {searchedRecord.found ? (
                      <>
                        <div className="flex items-center justify-between border-b border-stone-200 dark:border-slate-700 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Case Reference</span>
                            <strong className="font-mono text-base text-[#4d1217] dark:text-white block">
                              {searchedRecord.caseId}
                            </strong>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            {searchedRecord.status}
                          </span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            Current Stage: {searchedRecord.title}
                          </p>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="size-3.5 text-[#c56718]" />
                            <span>Estimated Resolution: {searchedRecord.eta}</span>
                          </div>
                        </div>

                        {/* Progress Stepper */}
                        <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[10px] font-bold">
                          <div className="p-2 rounded-md bg-emerald-100 text-emerald-800">1. Registered</div>
                          <div className="p-2 rounded-md bg-amber-100 text-amber-900 border border-amber-300">2. Review</div>
                          <div className="p-2 rounded-md bg-slate-100 text-slate-500">3. Action</div>
                          <div className="p-2 rounded-md bg-slate-100 text-slate-500">4. Closed</div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 space-y-2">
                        <AlertCircle className="size-8 text-rose-500 mx-auto" />
                        <strong className="text-sm text-slate-800 dark:text-slate-200 block">
                          No record found for "{searchedRecord.caseId}"
                        </strong>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Please verify your reference number or contact our commercial grievance desk directly at +91 9512365582.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Information & Escalation Column (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Direct Escalation Contact Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-[#ebd7c7] dark:border-slate-700 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="size-5 text-[#c56718]" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217] dark:text-white">
                  Grievance & Escalation Desk
                </h3>
              </div>

              <p className="text-xs text-[#5d4a4b] dark:text-slate-300 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
                For urgent project stoppages, transit accidents, or high-value billing disputes, connect directly with our corporate nodal desk.
              </p>

              <div className="space-y-2.5 text-xs font-semibold pt-1">
                <a
                  href="tel:+919512365582"
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#faf4ed] dark:bg-slate-750 text-[#4d1217] dark:text-white hover:text-[#c56718] transition-colors"
                >
                  <Phone className="size-3.5 text-[#c56718] shrink-0" />
                  <span className="font-mono">+91 9512365582</span>
                </a>

                <a
                  href="mailto:support@volamp.com"
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-[#faf4ed] dark:bg-slate-750 text-[#4d1217] dark:text-white hover:text-[#c56718] transition-colors"
                >
                  <Mail className="size-3.5 text-[#c56718] shrink-0" />
                  <span>support@volamp.com</span>
                </a>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Physical Cell</span>
                <p className="text-slate-700 dark:text-slate-300 leading-tight">
                  Volamp Corporate Main Office: 1753, Dhobi's Pole Sir, Chinubhai Rd, Khadia, Ahmedabad, Gujarat 380001
                </p>
              </div>
            </div>

            {/* Resolution Workflow Card */}
            <div className="p-6 rounded-2xl bg-[#faf4ed] dark:bg-slate-800/60 border border-amber-200 dark:border-slate-700 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#c25e0a]">
                DISPUTE RESOLUTION PROTOCOL
              </span>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>1. LR Verification:</strong> Carrier note endorsement within 48h.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>2. Batch Audit:</strong> Factory master heat number & MTC trace.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>3. Fast Replacement:</strong> Priority trailer dispatch from Aslali.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>4. Reconciliation:</strong> Final commercial credit note or signoff.</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* 6. Footer */}
      <UniversalFooter />
    </div>
  );
}
