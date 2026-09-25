import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Handshake,
  Building2,
  Users,
  TrendingUp,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  PhoneCall,
  MessageCircle,
  Clock,
  Sparkles,
  HelpCircle,
  FileCheck2,
  ChevronDown,
  Layers,
  Send,
  ExternalLink,
  Award,
  Factory,
  Check,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useUserLocation } from "@/contexts/LocationContext";

const BUSINESS_TYPES = [
  "Distributor / Dealer",
  "EPC / Contractor",
  "Project / Infrastructure Company",
  "Manufacturer / OEM",
  "Importer / Exporter",
  "Retailer",
  "Consultant",
  "Other",
];

const COLLABORATION_TYPES = [
  { id: "distribution", label: "Distribution / Dealership", desc: "Regional territory distribution & stockist rights" },
  { id: "epc", label: "Project / EPC Partnership", desc: "Tender supply, technical approvals & site dispatches" },
  { id: "oem", label: "OEM / Private Label", desc: "Custom cable engineering, extrusion & private labeling" },
  { id: "export", label: "Export Partnership", desc: "Cross-border distribution, CIF/FOB global shipments" },
  { id: "supply", label: "Supply / Procurement", desc: "Institutional bulk procurement contracts" },
  { id: "mfg", label: "Manufacturing / Technical", desc: "Co-development & specialized insulation compounding" },
  { id: "strategic", label: "Strategic / Business", desc: "Joint ventures, consortiums & market expansion" },
  { id: "other", label: "Other Collaboration", desc: "Custom business opportunities" },
];

const PARTNERSHIP_STRENGTHS = [
  "Existing Customer / Dealer Network",
  "Market / Territory Access",
  "Existing Projects",
  "Sales & Distribution Capability",
  "Manufacturing Capability",
  "Technical Expertise",
  "Export Network",
  "Investment / Capital",
  "Industry Relationships",
  "Technology / Innovation",
  "Other",
];

const BUSINESS_POTENTIALS = [
  "Below ₹10 Lakh",
  "₹10 - 50 Lakh",
  "₹50 Lakh - 1 Crore",
  "₹1 - 5 Crore",
  "₹5 Crore+",
  "Yet to be determined",
];

const TIMELINES = [
  "Immediate / Within 30 days",
  "1 - 3 months",
  "3 - 6 months",
  "6 - 12 months",
  "Long-term",
  "Yet to be determined",
];

const FAQS = [
  {
    q: "What is the typical review timeline for a collaboration proposal?",
    a: "Our Executive Partnerships Desk reviews every submission within 24 to 48 business hours. An assigned Volamp partnership manager will reach out via Phone or WhatsApp with initial feedback and schedule a discovery meeting.",
  },
  {
    q: "What are the requirements to become an Authorized Volamp Dealer or Distributor?",
    a: "We evaluate distributors based on active regional territory presence, existing contractor or retail relationships, working capital capacity, and commitment to maintaining stock of certified electrical cables. We provide competitive trade discounts, marketing collateral, and exclusive territory protections.",
  },
  {
    q: "Can Volamp provide Mill Test Certificates (MTC) and CPRI / ERDA test reports for EPC tenders?",
    a: "Yes. Every industrial cable consignment dispatched from our Ahmedabad manufacturing and distribution hub is accompanied by Type Test reports, MTCs, and routine factory inspection certificates compliant with IS 694, IS 1554, and IS 7098 standards.",
  },
  {
    q: "Do you offer OEM and private label manufacturing?",
    a: "Yes. We support custom cable manufacturing for OEMs, solar panel integrators, control panel builders, and international clients with tailored conductor stranding, custom insulation colors, and customer-branded outer sheaths.",
  },
  {
    q: "Can international partners submit export inquiries here?",
    a: "Absolutely. Our dedicated Global Export Desk manages multi-currency pricing (USD, EUR, AED), export packaging, sea and air freight logistics, and customs documentation for international infrastructure projects across the Middle East, Africa, Europe, and Asia.",
  },
];

export default function CollaboratePage() {
  const [, navigate] = useLocation();
  const { location: userLocation } = useUserLocation();
  const supportPhone = "9512365582";

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [designation, setDesignation] = useState("");
  const [businessType, setBusinessType] = useState("Distributor / Dealer");
  const [selectedCollabTypes, setSelectedCollabTypes] = useState<string[]>([
    "Distribution / Dealership",
  ]);
  const [opportunityDetails, setOpportunityDetails] = useState("");
  const [selectedStrengths, setSelectedStrengths] = useState<string[]>([
    "Existing Customer / Dealer Network",
  ]);
  const [expectedBusinessPotential, setExpectedBusinessPotential] = useState("10-50 Lakh");
  const [expectedTimeline, setExpectedTimeline] = useState("Immediate / Within 30 days");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [cityCountry, setCityCountry] = useState(userLocation || "Ahmedabad, Gujarat, India");
  const [notes, setNotes] = useState("");

  // UI state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [submittedData, setSubmittedData] = useState<{
    applicationId: string;
    companyName: string;
    contactName: string;
  } | null>(null);

  // tRPC Mutation
  const submitMutation = trpc.collaborate.submit.useMutation({
    onSuccess: (res) => {
      setSubmittedData({
        applicationId: res.applicationId,
        companyName: res.submission.companyName,
        contactName: res.submission.contactName,
      });
      toast.success("Partnership proposal submitted successfully!", {
        description: `Application Reference: ${res.applicationId}`,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onError: (err) => {
      toast.error("Submission failed", {
        description: err.message || "Please check your inputs and try again.",
      });
    },
  });

  const toggleCollabType = (label: string) => {
    setSelectedCollabTypes((prev) =>
      prev.includes(label)
        ? prev.length > 1
          ? prev.filter((t) => t !== label)
          : prev
        : [...prev, label]
    );
  };

  const toggleStrength = (label: string) => {
    setSelectedStrengths((prev) =>
      prev.includes(label)
        ? prev.length > 1
          ? prev.filter((s) => s !== label)
          : prev
        : [...prev, label]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast.error("Please enter your Company or Organization Name");
      return;
    }
    if (!contactName.trim()) {
      toast.error("Please enter your Full Name");
      return;
    }
    if (!designation.trim()) {
      toast.error("Please enter your Designation / Role");
      return;
    }
    if (!mobile.trim() || mobile.trim().length < 8) {
      toast.error("Please enter a valid Mobile / WhatsApp Number");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid Email Address");
      return;
    }
    if (!cityCountry.trim()) {
      toast.error("Please specify your City & Country");
      return;
    }
    if (!opportunityDetails.trim() || opportunityDetails.trim().length < 5) {
      toast.error("Please share what opportunity you see for Volamp");
      return;
    }
    if (selectedCollabTypes.length === 0) {
      toast.error("Please select at least one collaboration type");
      return;
    }
    if (selectedStrengths.length === 0) {
      toast.error("Please select at least one capability or strength");
      return;
    }

    submitMutation.mutate({
      companyName,
      contactName,
      designation,
      businessType,
      collaborationTypes: selectedCollabTypes,
      opportunityDetails,
      partnershipStrengths: selectedStrengths,
      expectedBusinessPotential,
      expectedTimeline,
      mobile,
      email,
      cityCountry,
      notes: notes.trim() || undefined,
    });
  };

  const handleReset = () => {
    setSubmittedData(null);
    setCompanyName("");
    setContactName("");
    setDesignation("");
    setOpportunityDetails("");
    setNotes("");
    setMobile("");
    setEmail("");
  };

  const whatsappUrl = submittedData
    ? `https://wa.me/919512365582?text=${encodeURIComponent(
        `Hello VOLAMP Partnerships Desk, I have submitted a collaboration proposal (Ref: ${submittedData.applicationId}) for ${submittedData.companyName}. Looking forward to discussing next steps.`
      )}`
    : `https://wa.me/919512365582?text=${encodeURIComponent(
        `Hello VOLAMP Partnerships Desk, I would like to explore a business collaboration with Volamp Elektrikals.`
      )}`;

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#102a40] font-['Inter',sans-serif] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ebd8ca]">
        <div className="market-container flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#c46b19] transition-colors py-1.5 px-2.5 rounded-lg hover:bg-stone-100"
            >
              <ArrowLeft className="size-4" />
              <span>Back to Marketplace</span>
            </Link>

            <div className="h-5 w-px bg-stone-200 hidden sm:block" />

            <Link href="/" className="flex items-center gap-2">
              <img
                src="/volamp-logo.png"
                alt="VOLAMP Elektrikals"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href={`tel:+91${supportPhone}`}
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[#c46b19] text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              <PhoneCall className="size-3.5" />
              <span>Partnership Desk: +91 {supportPhone}</span>
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              <MessageCircle className="size-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf4ee] via-[#faf6f2] to-[#fcfaf7] border-b border-[#ebd7c7] py-12 sm:py-16">
          <div className="market-container max-w-4xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5d2c2] shadow-sm text-xs font-bold text-[#c46b19] uppercase tracking-wider">
              <Handshake className="size-3.5 text-[#c46b19]" />
              <span>STRATEGIC PARTNERSHIPS & EXPANSION DESK</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#102a40] font-['Space_Grotesk'] leading-tight">
              Collaborate With <span className="text-[#c46b19]">VOLAMP</span>
            </h1>

            <p className="text-sm sm:text-base text-[#4a5f6e] max-w-2xl mx-auto leading-relaxed">
              Let's build the next opportunity together. Volamp Elektrikals is open to meaningful partnerships across distribution, project execution, exports, OEM manufacturing, technology integration, and strategic ventures.
            </p>

            {/* Value Badges Strip */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs font-medium text-[#2d4353]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#e2d6ca] shadow-2xs">
                <Factory className="size-3.5 text-[#c46b19]" /> 60-Year Electrical Heritage
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#e2d6ca] shadow-2xs">
                <Globe2 className="size-3.5 text-[#1d73b7]" /> Pan-India & Global Supply
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#e2d6ca] shadow-2xs">
                <ShieldCheck className="size-3.5 text-emerald-600" /> IS / IEC / CE Certified Cables
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#e2d6ca] shadow-2xs">
                <Clock className="size-3.5 text-amber-600" /> 24–48h Review SLA
              </span>
            </div>
          </div>
        </section>

        {/* 4 Strategic Pillars */}
        <section className="market-container max-w-5xl py-8 sm:py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#e8dcd0] shadow-sm hover:border-amber-300 hover:shadow-md transition-all">
              <div className="size-10 rounded-xl bg-amber-50 text-[#c46b19] border border-amber-200 flex items-center justify-center mb-3">
                <Building2 className="size-5" />
              </div>
              <h3 className="font-bold text-sm text-[#102a40] mb-1 font-['Space_Grotesk']">
                Distribution & Dealership
              </h3>
              <p className="text-xs text-[#5a6e7c] leading-relaxed">
                Exclusive territory rights, factory-direct margins, and ready inventories across House Wires & Industrial Cables.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#e8dcd0] shadow-sm hover:border-blue-300 hover:shadow-md transition-all">
              <div className="size-10 rounded-xl bg-blue-50 text-[#1d73b7] border border-blue-200 flex items-center justify-center mb-3">
                <FileCheck2 className="size-5" />
              </div>
              <h3 className="font-bold text-sm text-[#102a40] mb-1 font-['Space_Grotesk']">
                EPC & Tender Supply
              </h3>
              <p className="text-xs text-[#5a6e7c] leading-relaxed">
                Tender-grade specifications, Mill Test Certificates (MTC), CPRI/ERDA compliance, and on-time site dispatches.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#e8dcd0] shadow-sm hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mb-3">
                <Layers className="size-5" />
              </div>
              <h3 className="font-bold text-sm text-[#102a40] mb-1 font-['Space_Grotesk']">
                OEM & Custom Label
              </h3>
              <p className="text-xs text-[#5a6e7c] leading-relaxed">
                Tailored conductor geometries, specialized polymers (FRLS, ZHFR, XLPE), and private label extrusion.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#e8dcd0] shadow-sm hover:border-purple-300 hover:shadow-md transition-all">
              <div className="size-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mb-3">
                <Globe2 className="size-5" />
              </div>
              <h3 className="font-bold text-sm text-[#102a40] mb-1 font-['Space_Grotesk']">
                Global Export Desk
              </h3>
              <p className="text-xs text-[#5a6e7c] leading-relaxed">
                Cross-border supply to UAE, Middle East, Africa & Southeast Asia with sea/air freight CIF/FOB terms.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content: Form or Success View */}
        <section className="market-container max-w-4xl pb-16">
          {submittedData ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#dfd4c7] shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="size-18 sm:size-20 rounded-full bg-emerald-100 text-emerald-600 border-4 border-emerald-50 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="size-10 sm:size-12" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Application Received
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#102a40] font-['Space_Grotesk']">
                  Thank You, {submittedData.contactName}!
                </h2>
                <p className="text-sm text-[#5a6e7c] max-w-lg mx-auto">
                  Your collaboration proposal for <strong>{submittedData.companyName}</strong> has been logged into our executive review queue.
                </p>
              </div>

              {/* Application Details Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-[#faf7f3] border border-[#e5dcd1] max-w-md mx-auto text-left space-y-3">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-[#e5dcd1]">
                  <span className="text-[#6d7e8b]">Application Reference:</span>
                  <span className="font-mono font-bold text-[#c46b19] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {submittedData.applicationId}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6d7e8b]">Review Status:</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" /> Under Executive Review
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6d7e8b]">Expected SLA:</span>
                  <span className="font-medium text-[#102a40]">24 to 48 business hours</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
                >
                  <MessageCircle className="size-4" />
                  <span>Connect on WhatsApp Now</span>
                </a>

                <a
                  href={`tel:+91${supportPhone}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#102a40] hover:bg-[#1a3d5a] text-white font-bold text-sm transition-all"
                >
                  <PhoneCall className="size-4" />
                  <span>Call Partnerships Lead</span>
                </a>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-sm transition-colors"
                >
                  Submit Another Proposal
                </button>
              </div>
            </div>
          ) : (
            /* THE CODED FORM */
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-6 sm:p-10 border border-[#dfd4c7] shadow-xl space-y-8"
            >
              <div className="border-b border-[#eee3d7] pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#102a40] font-['Space_Grotesk']">
                    Partnership Discovery Form
                  </h2>
                  <p className="text-xs sm:text-sm text-[#617482] mt-0.5">
                    Tell us about your organization and the opportunity you envision with Volamp Elektrikals. (Approx. 2 mins)
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-[#c46b19] border border-amber-200 text-xs font-bold">
                  <Sparkles className="size-3.5" /> Direct to Leadership
                </span>
              </div>

              {/* Section 1: Organization & Contact Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#c46b19] uppercase tracking-wider">
                  <span className="size-5 rounded-full bg-amber-100 text-[#c46b19] flex items-center justify-center text-[11px]">1</span>
                  <span>Company & Contact Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#102a40] block">
                      Company / Organization Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Acme Infra & Power Solutions Pvt Ltd"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="rounded-xl border-[#dcd0c4] bg-[#fbf9f6] focus:bg-white text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#102a40] block">
                      Your Full Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Rajesh Sharma"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="rounded-xl border-[#dcd0c4] bg-[#fbf9f6] focus:bg-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#102a40] block">
                      Designation / Role <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Managing Director / Procurement Head"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="rounded-xl border-[#dcd0c4] bg-[#fbf9f6] focus:bg-white text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#102a40] block">
                      City, State & Country <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. Ahmedabad, Gujarat, India"
                      value={cityCountry}
                      onChange={(e) => setCityCountry(e.target.value)}
                      className="rounded-xl border-[#dcd0c4] bg-[#fbf9f6] focus:bg-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#102a40] block">
                      Mobile / WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="rounded-xl border-[#dcd0c4] bg-[#fbf9f6] focus:bg-white text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#102a40] block">
                      Work Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      placeholder="e.g. rajesh@acmeinfra.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-xl border-[#dcd0c4] bg-[#fbf9f6] focus:bg-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Business Profile */}
              <div className="space-y-4 pt-2 border-t border-[#eee3d7]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#c46b19] uppercase tracking-wider">
                  <span className="size-5 rounded-full bg-amber-100 text-[#c46b19] flex items-center justify-center text-[11px]">2</span>
                  <span>Business Profile & Collaboration Track</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#102a40] block">
                    Select Your Primary Business Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BUSINESS_TYPES.map((type) => {
                      const selected = businessType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setBusinessType(type)}
                          className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all ${
                            selected
                              ? "bg-amber-500/10 border-amber-600 text-amber-900 shadow-2xs font-bold ring-1 ring-amber-500"
                              : "bg-[#fbf9f6] border-[#e2d6ca] text-[#3e5361] hover:bg-white hover:border-amber-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{type}</span>
                            {selected && <Check className="size-3.5 text-amber-600 shrink-0 ml-1" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-[#102a40] block">
                    How would you like to collaborate with Volamp? (Select all that apply) <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {COLLABORATION_TYPES.map((collab) => {
                      const selected = selectedCollabTypes.includes(collab.label);
                      return (
                        <button
                          key={collab.id}
                          type="button"
                          onClick={() => toggleCollabType(collab.label)}
                          className={`p-3 rounded-xl text-left border transition-all ${
                            selected
                              ? "bg-amber-50 border-amber-500 text-amber-950 ring-1 ring-amber-400 shadow-2xs"
                              : "bg-[#fbf9f6] border-[#e2d6ca] text-[#3e5361] hover:bg-white hover:border-stone-400"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <strong className="text-xs font-bold block text-[#102a40]">
                                {collab.label}
                              </strong>
                              <span className="text-[11px] text-[#6d7e8b] block mt-0.5">
                                {collab.desc}
                              </span>
                            </div>
                            <div
                              className={`size-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                                selected
                                  ? "bg-[#c46b19] border-[#c46b19] text-white"
                                  : "border-stone-300 bg-white"
                              }`}
                            >
                              {selected && <Check className="size-3" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 3: Capabilities & Value Brought */}
              <div className="space-y-4 pt-2 border-t border-[#eee3d7]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#c46b19] uppercase tracking-wider">
                  <span className="size-5 rounded-full bg-amber-100 text-[#c46b19] flex items-center justify-center text-[11px]">3</span>
                  <span>Capabilities You Bring to the Partnership</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#102a40] block">
                    What can you bring to the partnership? (Select all that apply) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PARTNERSHIP_STRENGTHS.map((strength) => {
                      const selected = selectedStrengths.includes(strength);
                      return (
                        <button
                          key={strength}
                          type="button"
                          onClick={() => toggleStrength(strength)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            selected
                              ? "bg-[#102a40] border-[#102a40] text-white font-semibold shadow-xs"
                              : "bg-[#fbf9f6] border-[#dcd0c4] text-[#3e5361] hover:bg-white hover:border-stone-400"
                          }`}
                        >
                          {selected ? `✓ ${strength}` : `+ ${strength}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 4: Opportunity Details & Scale */}
              <div className="space-y-4 pt-2 border-t border-[#eee3d7]">
                <div className="flex items-center gap-2 text-xs font-bold text-[#c46b19] uppercase tracking-wider">
                  <span className="size-5 rounded-full bg-amber-100 text-[#c46b19] flex items-center justify-center text-[11px]">4</span>
                  <span>Opportunity Scale & Timeline</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#102a40] block">
                    What opportunity do you see for Volamp? <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Tell us about the project, target territory, tender requirement, estimated demand, or how our combined capabilities can win in your market..."
                    value={opportunityDetails}
                    onChange={(e) => setOpportunityDetails(e.target.value)}
                    className="rounded-xl border-[#dcd0c4] bg-[#fbf9f6] focus:bg-white text-sm resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#102a40] block">
                      Expected Annual / Project Business Potential <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={expectedBusinessPotential}
                      onChange={(e) => setExpectedBusinessPotential(e.target.value)}
                      className="w-full rounded-xl border border-[#dcd0c4] bg-[#fbf9f6] px-3 py-2.5 text-xs sm:text-sm font-medium text-[#102a40] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {BUSINESS_POTENTIALS.map((pot) => (
                        <option key={pot} value={pot}>
                          {pot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#102a40] block">
                      Expected Timeline <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={expectedTimeline}
                      onChange={(e) => setExpectedTimeline(e.target.value)}
                      className="w-full rounded-xl border border-[#dcd0c4] bg-[#fbf9f6] px-3 py-2.5 text-xs sm:text-sm font-medium text-[#102a40] focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {TIMELINES.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#102a40] block">
                    Additional Comments or Links (Optional)
                  </label>
                  <Input
                    placeholder="Website link, tender ref number, or specific technical notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="rounded-xl border-[#dcd0c4] bg-[#fbf9f6] focus:bg-white text-sm"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#eee3d7] space-y-3">
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full py-4 text-base font-bold bg-[#c46b19] hover:bg-[#b05d12] text-white rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {submitMutation.isPending ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Proposal to Leadership...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>Submit Collaboration Proposal</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-[#788a97]">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  <span>Confidential proposal. Handled directly by Volamp executive leadership.</span>
                </div>
              </div>
            </form>
          )}
        </section>

        {/* FAQ Section */}
        <section className="bg-white border-t border-[#e8ded3] py-12 sm:py-16">
          <div className="market-container max-w-3xl space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#c46b19] uppercase tracking-wider">
                COMMON QUESTIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#102a40] font-['Space_Grotesk']">
                Frequently Asked Partnership Questions
              </h2>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl border border-[#ebdcd0] bg-[#faf7f3] overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-[#102a40] hover:text-[#c46b19]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`size-4 shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-[#c46b19]" : "text-stone-400"
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#5a6e7c] leading-relaxed border-t border-[#f0e6dd] bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer bg-[#0d2233] text-white">
        <div className="market-container py-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <img src="/volamp-logo.png" alt="VOLAMP Elektrikals" className="h-6 w-auto brightness-200" />
            <span>Volamp Elektrikals © 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/about-volamp" className="hover:text-amber-400 transition-colors">
              About Volamp
            </Link>
            <Link href="/business-segments" className="hover:text-amber-400 transition-colors">
              Business Segments
            </Link>
            <Link href="/pay-invoice" className="hover:text-amber-400 transition-colors">
              Billing Desk
            </Link>
            <a href={`tel:+91${supportPhone}`} className="hover:text-amber-400 transition-colors">
              Support: {supportPhone}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
