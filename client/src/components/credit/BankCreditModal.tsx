import React, { useState } from "react";
import { useUserLocation } from "@/contexts/LocationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Landmark,
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  PhoneCall,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";

interface BankCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BankCreditModal({ isOpen, onClose }: BankCreditModalProps) {
  const { location, country } = useUserLocation();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");
  const [estimatedCredit, setEstimatedCredit] = useState("₹25 - ₹50 Lakhs");
  const [projectNotes, setProjectNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !phoneOrEmail.trim()) {
      toast.error("Please fill in your company name, contact person, and phone/email.");
      return;
    }

    setIsSubmitted(true);
    toast.success("Bank Credit Application Submitted!", {
      description:
        "A VOLAMP credit desk specialist and banking partner coordinator will contact you within 2 business hours.",
    });
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="account-modal relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-[#d2e0e8] p-6 sm:p-7 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Close credit program modal"
        >
          <X className="size-5" />
        </button>

        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="flex items-start gap-3.5 mb-4">
              <div className="size-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <Landmark className="size-6 text-[#c46b19]" />
              </div>
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#c46b19] uppercase block">
                  BANK TIE-UP · PROJECT CREDIT PROGRAM
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#102a40] font-['Space_Grotesk'] leading-tight">
                  Order Now, Pay Later
                </h2>
                <p className="text-xs text-[#5a6b78] mt-1">
                  Tie-ups with leading banks to unlock institutional project credit lines, flexible payment plans, and zero procurement delays for {country}.
                </p>
              </div>
            </div>

            {/* Program Value Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#dce5eb] text-center">
                <ShieldCheck className="size-4 text-[#c46b19] mx-auto mb-1" />
                <strong className="text-[11px] font-bold text-[#102a40] block">Bank Backed</strong>
                <span className="text-[9px] text-[#5a6b78] leading-tight block mt-0.5">
                  Institutional tie-ups
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#dce5eb] text-center">
                <Clock className="size-4 text-[#1d73b7] mx-auto mb-1" />
                <strong className="text-[11px] font-bold text-[#102a40] block">Flexible Plans</strong>
                <span className="text-[9px] text-[#5a6b78] leading-tight block mt-0.5">
                  Tailored pay cycles
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#dce5eb] text-center">
                <TrendingUp className="size-4 text-emerald-600 mx-auto mb-1" />
                <strong className="text-[11px] font-bold text-[#102a40] block">Zero Delay</strong>
                <span className="text-[9px] text-[#5a6b78] leading-tight block mt-0.5">
                  Instant dispatch
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#f8fafc] border border-[#dce5eb] text-center">
                <FileCheck className="size-4 text-purple-600 mx-auto mb-1" />
                <strong className="text-[11px] font-bold text-[#102a40] block">Quick Approval</strong>
                <span className="text-[9px] text-[#5a6b78] leading-tight block mt-0.5">
                  Digital KYC & GSTIN
                </span>
              </div>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="credit-company" className="text-xs font-semibold text-[#102a40]">
                    Company / Organization Name *
                  </Label>
                  <Input
                    id="credit-company"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Mega Infra Ltd."
                    className="text-xs h-9 mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="credit-contact" className="text-xs font-semibold text-[#102a40]">
                    Authorized Contact Person *
                  </Label>
                  <Input
                    id="credit-contact"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="text-xs h-9 mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="credit-phone" className="text-xs font-semibold text-[#102a40]">
                    Phone or Work Email *
                  </Label>
                  <Input
                    id="credit-phone"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="e.g. +91 98765 43210 or procurement@company.com"
                    className="text-xs h-9 mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="credit-estimate" className="text-xs font-semibold text-[#102a40]">
                    Estimated Project Credit Requirement
                  </Label>
                  <select
                    id="credit-estimate"
                    value={estimatedCredit}
                    onChange={(e) => setEstimatedCredit(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                  >
                    <option value="₹10 - ₹25 Lakhs">₹10 - ₹25 Lakhs</option>
                    <option value="₹25 - ₹50 Lakhs">₹25 - ₹50 Lakhs</option>
                    <option value="₹50 Lakhs - ₹1 Crore">₹50 Lakhs - ₹1 Crore</option>
                    <option value="₹1 Crore - ₹5 Crores+">₹1 Crore - ₹5 Crores+</option>
                    <option value="USD $50,000 - $250,000 (Export LC)">USD $50,000 - $250,000 (Export LC)</option>
                    <option value="USD $250,000+ (Export LC)">USD $250,000+ (Export LC)</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="credit-location" className="text-xs font-semibold text-[#102a40]">
                  Project / Delivery Location
                </Label>
                <Input
                  id="credit-location"
                  value={location}
                  disabled
                  className="text-xs h-9 mt-1 bg-gray-50 font-medium text-[#102a40]"
                />
              </div>

              <div>
                <Label htmlFor="credit-notes" className="text-xs font-semibold text-[#102a40]">
                  Project Scope / Cable Requirement (Optional)
                </Label>
                <textarea
                  id="credit-notes"
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  placeholder="Mention cable categories (e.g. LT Aluminium Arm Cable, Solar Cable) and project timeline..."
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-[#d97818] hover:bg-[#c06812] text-white font-bold text-xs h-10 rounded-lg shadow-md flex items-center justify-center gap-1.5"
                >
                  Apply for Bank Project Credit <ArrowRight className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="text-xs h-10 border-[#dce5eb] text-[#5a6b78]"
                >
                  Cancel
                </Button>
              </div>
            </form>

            {/* Support footer */}
            <div className="mt-4 pt-3 border-t border-[#e8eff3] flex items-center justify-between text-[11px] text-[#5a6b78]">
              <span className="flex items-center gap-1">
                <PhoneCall className="size-3 text-[#1d73b7]" /> Direct Credit Desk:{" "}
                <a href="tel:+919512365582" className="font-bold text-[#102a40] hover:underline">
                  9512365582
                </a>
              </span>
              <span>Available for Pan-India & Global Export</span>
            </div>
          </>
        ) : (
          /* Submission Confirmation View */
          <div className="py-6 text-center">
            <div className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="size-10" />
            </div>
            <h3 className="text-xl font-bold text-[#102a40] font-['Space_Grotesk']">
              Application Received
            </h3>
            <p className="text-xs text-[#5a6b78] mt-2 max-w-[420px] mx-auto leading-relaxed">
              Thank you, <strong>{contactName}</strong>. Your project credit inquiry for{" "}
              <strong>{companyName}</strong> has been logged with the VOLAMP Banking & Finance Desk.
            </p>
            <div className="my-5 p-4 rounded-xl bg-[#f8fafc] border border-[#dce5eb] text-left max-w-[440px] mx-auto text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#5a6b78]">Assigned Officer:</span>
                <strong className="text-[#102a40]">Senior Credit Partner Desk</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a6b78]">Indicative Limit:</span>
                <strong className="text-[#c46b19] font-bold">{estimatedCredit}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a6b78]">Project Region:</span>
                <strong className="text-[#102a40]">{location}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5a6b78]">Expected TAT:</span>
                <strong className="text-emerald-700 font-bold">Within 2 Business Hours</strong>
              </div>
            </div>
            <Button
              onClick={handleReset}
              className="bg-[#102a40] hover:bg-[#09233a] text-white text-xs font-semibold px-6 h-10 rounded-lg"
            >
              Return to Marketplace
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
