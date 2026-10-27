import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import { useUserLocation } from "@/contexts/LocationContext";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Newspaper,
  Calendar,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  Globe2,
  Share2,
  Phone,
  Mail,
  BadgeCheck,
  Building2,
  Check,
  Sparkles,
  ShieldCheck,
  Award,
  Send,
  CheckCircle2,
  Copy,
  Clock,
  FileText,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function InTheNews() {
  const [, navigate] = useLocation();
  const [copied, setCopied] = useState(false);

  // Press Inquiry Form State
  const [isPressModalOpen, setIsPressModalOpen] = useState(false);
  const [journalistName, setJournalistName] = useState("");
  const [mediaOutlet, setMediaOutlet] = useState("");
  const [pressEmail, setPressEmail] = useState("");
  const [pressPhone, setPressPhone] = useState("");
  const [inquiryType, setInquiryType] = useState("Executive Commentary / Interview");
  const [deadline, setDeadline] = useState("Today (Within 6-8 Hours)");
  const [pressDetails, setPressDetails] = useState("");
  const [submittedPressTicket, setSubmittedPressTicket] = useState<{
    pressTicketId: string;
    mediaOutlet: string;
    email: string;
    createdAt: string;
  } | null>(null);
  const [pressTicketCopied, setPressTicketCopied] = useState(false);

  const pressMutation = trpc.press.submit.useMutation({
    onSuccess: (res) => {
      setSubmittedPressTicket({
        pressTicketId: res.pressTicketId,
        mediaOutlet: res.inquiry.mediaOutlet,
        email: res.inquiry.email,
        createdAt: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      });
      toast.success("Media Inquiry Registered Successfully!", {
        description: `Ticket Reference: ${res.pressTicketId}. Dropped to pr@volampelektrikals.com & confirmation emailed to ${res.inquiry.email}.`,
      });
    },
    onError: (err) => {
      toast.error("Inquiry Submission Failed", {
        description: err.message || "Please check your inputs and try again.",
      });
    },
  });

  const handlePressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalistName.trim()) {
      toast.error("Please provide your name");
      return;
    }
    if (!mediaOutlet.trim()) {
      toast.error("Please provide your media publication or news outlet");
      return;
    }
    if (!pressEmail.trim() || !pressEmail.includes("@")) {
      toast.error("Please enter a valid work email address");
      return;
    }
    if (!pressPhone.trim()) {
      toast.error("Please enter your phone or WhatsApp number");
      return;
    }
    if (!pressDetails.trim()) {
      toast.error("Please share the details of your inquiry or story questions");
      return;
    }

    pressMutation.mutate({
      journalistName: journalistName.trim(),
      mediaOutlet: mediaOutlet.trim(),
      email: pressEmail.trim().toLowerCase(),
      phone: pressPhone.trim(),
      inquiryType,
      deadline,
      details: pressDetails.trim(),
    });
  };

  const copyPressTicket = (ticketId: string) => {
    navigator.clipboard.writeText(ticketId);
    setPressTicketCopied(true);
    toast.success("Press Ticket ID copied to clipboard!");
    setTimeout(() => setPressTicketCopied(false), 2000);
  };

  const handleResetPressModal = () => {
    setSubmittedPressTicket(null);
    setJournalistName("");
    setMediaOutlet("");
    setPressEmail("");
    setPressPhone("");
    setPressDetails("");
  };

  const articleUrl =
    "https://www.ahmedabadmirror.com/top-10-inspiring-entrepreneurs-in-ahmedabad-to-watch-in-2026/81922949.html";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(articleUrl);
    setCopied(true);
    toast.success("Article Link Copied!", {
      description: "Direct link to Ahmedabad Mirror publication copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="volamp-marketplace min-h-screen bg-[#faf7f3] text-[#3d2b2d] transition-colors">
      {/* Universal Header (Consistent Warm Sand & Cream Theme) */}
      <UniversalHeader currentPage="news" />

      {/* Breadcrumb Bar */}
      <div className="market-container py-3.5 flex items-center gap-2 text-xs text-[#5d4a4b] border-b border-[#ebd7c7]">
        <Link href="/" className="hover:text-[#4d1217] transition-colors">Home</Link>
        <ChevronDown className="size-3 -rotate-90 text-[#ebd4c2]" />
        <Link href="/about-volamp" className="hover:text-[#4d1217] transition-colors">About Volamp</Link>
        <ChevronDown className="size-3 -rotate-90 text-[#ebd4c2]" />
        <span className="font-semibold text-[#4d1217]">In the News</span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf8f5] to-[#faf7f3] py-12 sm:py-16 border-b border-[#ebd7c7]">
        <div className="market-container relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center justify-center bg-white px-3 py-1.5 rounded-xl border border-[#ebd7c7] shadow-xs">
                <img src="/volamp-logo.png" alt="VOLAMP Elektrikals" className="h-7 sm:h-8 w-auto object-contain" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7ede6] border border-[#ebd4c2] text-[#c56718] text-xs font-bold tracking-wider uppercase shadow-xs">
                <Newspaper className="size-3.5 text-[#ef7d19]" />
                <span>VERIFIED EDITORIAL COVERAGE · 100% AUTHENTIC PRESS</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217] tracking-tight leading-[1.1]">
              VOLAMP in the News. <br />
              <span className="text-[#c56718]">Media & Executive Spotlight.</span>
            </h1>

            <p className="text-sm sm:text-base text-[#5d4a4b] leading-relaxed font-['Plus_Jakarta_Sans',sans-serif]">
              Explore authentic media coverage and official press features celebrating Volamp Elektrikals' leadership, regional electrical distribution footprint, and commitment to powering infrastructure across Gujarat and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Headline Spotlight: Ahmedabad Mirror */}
      <section className="py-10 market-container">
        <div className="rounded-3xl bg-gradient-to-br from-[#2a080b] via-[#4d1217] to-[#731920] text-white p-7 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 border border-white/10">
          <div className="space-y-5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <img src="/ahmedabad-mirror-logo.svg" alt="Ahmedabad Mirror" className="h-3.5 invert brightness-200" />
                EXCLUSIVE PRESS FEATURE
              </span>
              <span className="text-xs text-amber-200 font-semibold flex items-center gap-1">
                <Calendar className="size-3.5" /> Published: September 30, 2026
              </span>
              <span className="text-xs text-stone-300 hidden sm:inline">·</span>
              <span className="text-xs text-stone-300 hidden sm:inline">Ahmedabad Mirror (Times Group Network)</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Plus_Jakarta_Sans',sans-serif] leading-tight text-white">
              Ahmedabad Mirror: Naimil Vipul Patel Named Among Top 10 Inspiring Entrepreneurs in Ahmedabad to Watch in 2026
            </h2>

            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-['Plus_Jakarta_Sans',sans-serif] italic bg-white/5 p-4 rounded-xl border border-white/10">
              “Under his leadership, Volamp has built a strong presence in the electrical industry, specialising in the distribution of multi-brand wires and cables from leading brands such as KEI, Polycab and Finolex. His business approach combines strong customer relationships with technology-driven processes, efficient operations and data-based decision-making.”
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-stone-300">
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 font-semibold">
                <Award className="size-4 text-amber-400" /> Top 10 Inspiring Entrepreneurs 2026
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 font-semibold">
                <ShieldCheck className="size-4 text-emerald-400" /> Multi-Brand Cable Powerhouse
              </span>
              <span className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/10 font-semibold">
                <Building2 className="size-4 text-sky-400" /> Technology-Driven B2B Operations
              </span>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-[#ef7d19] hover:bg-[#d96a0d] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 active:scale-95 transition-all cursor-pointer"
              >
                <span>Read Original Article on Ahmedabad Mirror</span>
                <ExternalLink className="size-4" />
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                {copied ? <Check className="size-4 text-emerald-400" /> : <Share2 className="size-4" />}
                <span>{copied ? "Link Copied" : "Share Feature"}</span>
              </button>
            </div>
          </div>

          {/* Photograph / Media Badge */}
          <div className="shrink-0 w-full lg:w-96 xl:w-[28rem] rounded-2xl overflow-hidden border border-white/20 bg-stone-900/70 shadow-2xl group">
            <div className="relative overflow-hidden bg-slate-900">
              <img
                src="/ahmedabad-mirror-top-10-entrepreneurs-2026.png?v=3"
                alt="Ahmedabad Mirror Top 10 Inspiring Entrepreneurs in Ahmedabad 2026 - Featuring Naimil Vipul Patel, CEO & Director Volamp Elektrikals"
                className="w-full h-auto object-contain group-hover:scale-102 transition-transform duration-300"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 z-10">
                <BadgeCheck className="size-3 text-red-500" /> Authentic Media
              </span>
            </div>
            <div className="p-5 bg-stone-950/85 backdrop-blur-md space-y-3 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
                <div className="flex items-center gap-2">
                  <img src="/ahmedabad-mirror-logo.svg" alt="Ahmedabad Mirror" className="h-3.5 invert brightness-200" />
                  <span>Ahmedabad Mirror Coverage</span>
                </div>
                <span>Sep 2026</span>
              </div>
              <p className="text-xs text-stone-300 leading-snug">
                Featuring Volamp Elektrikals CEO & Director <strong>Naimil Vipul Patel</strong> among Gujarat's leading next-generation business leaders.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                <span className="text-stone-400">Headquarters: Ahmedabad, Gujarat</span>
                <a
                  href={articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
                >
                  <span>Verify Article</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* In-Depth Feature Transcript & Executive Breakdown */}
      <section className="py-12 market-container">
        <div className="bg-white rounded-3xl border border-[#ebd7c7] p-6 sm:p-10 shadow-lg space-y-8">
          <div className="border-b border-[#ebd7c7] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#c56718] block mb-1">
                FULL EDITORIAL COVERAGE
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217]">
                Inside the Ahmedabad Mirror Feature
              </h3>
            </div>
            <a
              href={articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#faf7f3] border border-[#ebd7c7] hover:bg-[#f7ede6] text-xs font-bold text-[#4d1217] transition-colors shrink-0"
            >
              <span>Read on ahmedabadmirror.com</span>
              <ExternalLink className="size-3.5 text-[#c56718]" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2 Cols: Editorial Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="prose max-w-none text-[#3d2b2d] text-sm leading-relaxed space-y-4">
                <p className="font-semibold text-base text-[#4d1217] border-l-4 border-[#c56718] pl-4 py-1">
                  Naimil Vipul Patel — CEO and Director of Volamp Elektrikals Private Limited
                </p>

                <p>
                  Naimil Vipul Patel is the CEO and Director of Volamp Elektrikals Private Limited, an Ahmedabad-based electrical distribution company serving customers across Gujarat and neighbouring markets. Under his leadership, Volamp has built a strong presence in the electrical industry, specialising in the distribution of multi-brand wires and cables from leading brands such as <strong>KEI, Polycab and Finolex</strong>.
                </p>

                <p>
                  Naimil is focused on building Volamp as a dependable one-stop destination for electrical products, serving contractors, industries, infrastructure companies, dealers and institutional customers. His business approach combines strong customer relationships with technology-driven processes, efficient operations and data-based decision-making.
                </p>

                <p>
                  With a clear vision for regional expansion, Naimil is working towards creating a scalable and professionally managed electrical distribution enterprise. He believes that sustainable growth comes from reliable products, competitive pricing, timely delivery and long-term customer relationships. Through Volamp, he continues to build a modern organisation capable of meeting the growing electrical and infrastructure requirements of Gujarat and beyond.
                </p>
              </div>

              {/* 4 Pillars Grid */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#faf7f3] border border-[#ebd7c7] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#4d1217] font-bold text-xs">
                    <Sparkles className="size-4 text-[#c56718]" />
                    <span>Visionary Regional Leadership</span>
                  </div>
                  <p className="text-xs text-[#5d4a4b]">
                    Recognized among Ahmedabad's top 10 entrepreneurs driving enterprise creation, employment, and regional infrastructure growth.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf7f3] border border-[#ebd7c7] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#4d1217] font-bold text-xs">
                    <Building2 className="size-4 text-[#c56718]" />
                    <span>Multi-Brand Powerhouse</span>
                  </div>
                  <p className="text-xs text-[#5d4a4b]">
                    Distributing certified wires and cables from India's premier cable brands including Polycab, KEI, and Finolex.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf7f3] border border-[#ebd7c7] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#4d1217] font-bold text-xs">
                    <Globe2 className="size-4 text-[#c56718]" />
                    <span>Dependable One-Stop Supply</span>
                  </div>
                  <p className="text-xs text-[#5d4a4b]">
                    Direct supply corridor serving electrical contractors, EPC builders, industrial plants, dealers, and institutions.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf7f3] border border-[#ebd7c7] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#4d1217] font-bold text-xs">
                    <ShieldCheck className="size-4 text-[#c56718]" />
                    <span>Technology-Driven Operations</span>
                  </div>
                  <p className="text-xs text-[#5d4a4b]">
                    Transparent online pricing, automated sizing tools, and certified batch barcode dispatches directly from Ahmedabad.
                  </p>
                </div>
              </div>
            </div>

            {/* 1 Col: Media Factsheet & Direct Citation */}
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#fbf8f5] to-[#f7ede6] border border-[#ebd7c7] space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#c56718] block">
                  PUBLICATION CITATION
                </span>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[#5d4a4b] block">Headline:</span>
                    <strong className="text-[#3d2b2d]">
                      Top 10 Inspiring Entrepreneurs in Ahmedabad to Watch in 2026
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#5d4a4b] block">Publisher:</span>
                    <strong className="text-[#3d2b2d]">
                      Ahmedabad Mirror
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#5d4a4b] block">Published Date:</span>
                    <strong className="text-[#3d2b2d]">
                      September 30, 2026
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#5d4a4b] block">Featured Executive:</span>
                    <strong className="text-[#3d2b2d]">
                      Naimil Vipul Patel (CEO & Director)
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#5d4a4b] block">Enterprise:</span>
                    <strong className="text-[#3d2b2d]">
                      Volamp Elektrikals Private Limited
                    </strong>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#c56718] hover:bg-[#b05d12] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <span>Open Live Article</span>
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>

              {/* Authenticity Guarantee Card */}
              <div className="p-5 rounded-2xl bg-[#f7ede6] border border-[#ebd4c2] text-xs space-y-2 text-[#4d1217]">
                <div className="flex items-center gap-2 font-bold text-[#4d1217]">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>Editorial Authenticity Guarantee</span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#5d4a4b]">
                  Volamp Elektrikals adheres to strict corporate transparency. We host only 100% verified, authentic media appearances published by recognized independent journalists and media publications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Press Inquiries / Media Contact */}
      <section className="py-12 market-container">
        <div className="rounded-3xl border border-[#ebd7c7] bg-[#fbf8f5] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c56718]">
              <Mail className="size-3.5" />
              <span>MEDIA DESK</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-[#4d1217]">
              Corporate & Press Relations Office
            </h3>
            <p className="text-xs text-[#5d4a4b] max-w-xl">
              For journalist inquiries, executive commentary, brand assets, or supply chain case studies, connect directly with the Volamp corporate media desk.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                handleResetPressModal();
                setIsPressModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#c56718] hover:bg-[#a9540e] text-xs font-bold text-white flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="size-4" />
              <span>Submit Media Inquiry</span>
            </button>
            <a
              href="mailto:pr@volampelektrikals.com"
              className="px-5 py-2.5 rounded-xl bg-white border border-[#ebd7c7] text-xs font-bold text-[#3d2b2d] hover:bg-[#faf7f3] flex items-center gap-2 transition-colors shadow-xs"
            >
              <Mail className="size-4 text-[#c56718]" />
              <span>pr@volampelektrikals.com</span>
            </a>
            <a
              href="tel:+919512365582"
              className="px-5 py-2.5 rounded-xl bg-[#4d1217] hover:bg-[#681820] text-xs font-bold text-white flex items-center gap-2 shadow-xs transition-colors"
            >
              <Phone className="size-4" />
              <span>+91 95123 65582</span>
            </a>
          </div>
        </div>
      </section>

      {/* Press Inquiry Modal Dialog */}
      <Dialog open={isPressModalOpen} onOpenChange={setIsPressModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-[#ebd7c7] dark:border-slate-800 p-0 overflow-hidden rounded-3xl">
          <DialogHeader className="p-6 sm:p-8 bg-gradient-to-r from-[#102a40] to-[#1e3a5f] text-white">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#f59e0b] mb-1">
              <Mail className="size-3.5" />
              <span>Volamp Corporate Communications & Media Desk</span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] text-white">
              {submittedPressTicket ? "Media Inquiry Logged" : "Submit Media & Press Inquiry"}
            </DialogTitle>
            <DialogDescription className="text-xs text-[#cbdbe7]">
              {submittedPressTicket
                ? "Your official media inquiry has been assigned to our corporate relations lead."
                : "Submit your editorial request, interview questions, or asset inquiry. Direct dispatch to pr@volampelektrikals.com with automated ticket generation."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
            {submittedPressTicket ? (
              <div className="space-y-6 text-center">
                <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="size-9" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Official Press Ticket Issued
                  </span>
                  <h3 className="text-2xl font-bold text-[#102a40] dark:text-white">
                    {submittedPressTicket.pressTicketId}
                  </h3>
                  <p className="text-xs text-[#5d4a4b] dark:text-slate-300 max-w-md mx-auto">
                    Inquiry registered for <strong>{submittedPressTicket.mediaOutlet}</strong>. Dropped directly to <span className="font-semibold text-[#102a40] dark:text-amber-300">pr@volampelektrikals.com</span>.
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    ✓ A confirmation ticket has been dispatched to <strong>{submittedPressTicket.email}</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf7f3] dark:bg-slate-800 border border-[#ebd7c7] dark:border-slate-700 text-left space-y-2 max-w-md mx-auto text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#ebd7c7] dark:border-slate-700">
                    <span className="text-slate-500">Ticket Reference:</span>
                    <button
                      type="button"
                      onClick={() => copyPressTicket(submittedPressTicket.pressTicketId)}
                      className="font-mono font-bold text-[#c56718] flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {pressTicketCopied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                      <span>{submittedPressTicket.pressTicketId}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Registered Date:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{submittedPressTicket.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Editorial Turnaround:</span>
                    <span className="font-semibold text-emerald-700">Prioritized by deadline</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <a
                    href={`mailto:pr@volampelektrikals.com?subject=${encodeURIComponent(
                      `[PRESS TICKET ${submittedPressTicket.pressTicketId}] Follow up - ${submittedPressTicket.mediaOutlet}`
                    )}`}
                    className="px-5 py-2.5 rounded-xl bg-[#102a40] hover:bg-[#1a3e5c] text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Email Media Desk
                  </a>
                  <a
                    href="https://wa.me/919512365582"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle className="size-4" />
                    <span>WhatsApp PR Desk</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsPressModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-stone-100 cursor-pointer"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePressSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Journalist / Contributor Name *
                    </label>
                    <Input
                      placeholder="e.g. Rahul Mehta"
                      value={journalistName}
                      onChange={(e) => setJournalistName(e.target.value)}
                      required
                      className="bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Media Outlet / Publication *
                    </label>
                    <Input
                      placeholder="e.g. Economic Times, Livemint, CNBC"
                      value={mediaOutlet}
                      onChange={(e) => setMediaOutlet(e.target.value)}
                      required
                      className="bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Work Email (receives confirmation ticket) *
                    </label>
                    <Input
                      type="email"
                      placeholder="rahul@publication.com"
                      value={pressEmail}
                      onChange={(e) => setPressEmail(e.target.value)}
                      required
                      className="bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Phone / WhatsApp Number *
                    </label>
                    <Input
                      placeholder="+91 98765 43210"
                      value={pressPhone}
                      onChange={(e) => setPressPhone(e.target.value)}
                      required
                      className="bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Inquiry Focus / Topic *
                    </label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full text-xs rounded-md border border-input bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="Executive Commentary / Interview">Executive Commentary / Interview</option>
                      <option value="Industry & Market Analysis (Wires/Cables)">Industry & Market Analysis (Wires/Cables)</option>
                      <option value="Company Performance & Expansion Story">Company Performance & Expansion Story</option>
                      <option value="Brand Assets, Logos & Executive Bios">Brand Assets, Logos & Executive Bios</option>
                      <option value="General Editorial Inquiry">General Editorial Inquiry</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Editorial Deadline *
                    </label>
                    <select
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full text-xs rounded-md border border-input bg-white dark:bg-slate-800 px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="Urgent (Within 4-6 Hours)">Urgent (Within 4-6 Hours)</option>
                      <option value="Today by 6:00 PM IST">Today by 6:00 PM IST</option>
                      <option value="Within 24 Hours">Within 24 Hours</option>
                      <option value="Within 48 Hours">Within 48 Hours</option>
                      <option value="Flexible / Feature Story">Flexible / Feature Story</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Inquiry Details & Questions *
                  </label>
                  <Textarea
                    placeholder="Please specify your questions, requested quotes, or story background..."
                    value={pressDetails}
                    onChange={(e) => setPressDetails(e.target.value)}
                    rows={4}
                    required
                    className="bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-[11px] text-slate-500">
                    Routed to <strong className="text-[#102a40] dark:text-slate-300">pr@volampelektrikals.com</strong>
                  </p>
                  <button
                    type="submit"
                    disabled={pressMutation.isPending}
                    className="px-6 py-2.5 rounded-xl bg-[#c56718] hover:bg-[#a9540e] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="size-3.5" />
                    <span>{pressMutation.isPending ? "Transmitting..." : "Submit Inquiry"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Universal Footer (Matching Shared Screenshot Layout) */}
      <UniversalFooter showNewsletter={false} showJournalBar={false} forceLight={true} />
    </div>
  );
}
