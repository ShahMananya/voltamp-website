import React from "react";
import { Link } from "wouter";
import {
  PhoneCall,
  MessageCircle,
  ShieldCheck,
  Building2,
  FileCheck2,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Lock,
  Headphones,
  FileText,
  BadgeCheck,
  CreditCard,
  Send,
  HelpCircle,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";

export default function PayInvoice() {
  const supportPhone = "9512365582";
  const whatsappUrl =
    "https://wa.me/919512365582?text=Hello%20VOLAMP%20Billing%20Desk%2C%20I%20would%20like%20to%20make%20a%20payment%20for%20my%20invoice.%20Please%20guide%20me%20with%20verified%20bank%20transfer%20details.";

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#0b1f33] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      {/* Universal Header (Matching Home Page White Palette) */}
      <UniversalHeader currentPage="pay" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-[#fbf8f5] to-[#fdfbf9] text-[#0b1f33] border-b border-[#ebd7c7] py-14 sm:py-18 transition-colors">
          <div className="market-container max-w-4xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f7ede6] text-[#c25e0a] text-xs font-bold uppercase tracking-wider border border-[#ebd4c2]">
              <Building2 className="size-3.5 text-[#ef7d19]" />
              <span>OFFICIAL BILLING & PAYMENT DESK</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif] leading-tight">
              Pay Your Volamp Invoice Over Call & Direct Bank Transfer
            </h1>

            <p className="text-sm sm:text-base text-[#5d4a4b] max-w-2xl mx-auto leading-relaxed">
              To protect our wholesale buyers from credit card surcharges, gateway delays, and online payment fraud on high-value electrical orders, Volamp does not use unverified third-party online checkout gateways. Instead, all payments are guided directly over call via verified institutional RTGS / NEFT / IMPS.
            </p>

            {/* Security Notice Pill */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f7ede6] border border-[#ebd4c2] text-[#c56718] text-xs font-semibold">
                <ShieldCheck className="size-4 text-[#c56718] flex-none" />
                <span>Zero Gateway Surcharges · 100% Verified Corporate Bank Accounts · Same-Day Dispatch Release</span>
              </div>
            </div>
          </div>
        </section>

        {/* Action Hotline Cards */}
        <section className="market-container max-w-5xl -mt-6 sm:-mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Call Hotline Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#ebd7c7] shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="size-12 rounded-xl bg-[#f7ede6] text-[#c56718] border border-[#ebd4c2] flex items-center justify-center">
                  <PhoneCall className="size-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#c25e0a] uppercase tracking-wider block">
                    Option 1: Call Us Directly (Recommended)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
                    Speak with our Billing Officer
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#5d4a4b] leading-relaxed">
                  Call our dedicated accounts helpline. Keep your <strong>Invoice Number</strong> or <strong>Quotation ID</strong> handy. Our representative will verify your order, confirm applicable contractor discounts, and share the official RTGS/NEFT coordinates.
                </p>
              </div>

              <div className="pt-2 border-t border-[#ebd7c7] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#5d4a4b]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-[#c56718]" />
                    <span>Mon – Sat: 9:30 AM – 7:00 PM IST</span>
                  </span>
                  <span className="font-semibold text-emerald-600">Helpline Active</span>
                </div>
                <a
                  href={`tel:+91${supportPhone}`}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#c56718] via-[#d97706] to-[#b45309] hover:brightness-105 active:brightness-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-900/10 transition-all"
                >
                  <PhoneCall className="size-4" />
                  <span>Call +91 {supportPhone} Now</span>
                </a>
              </div>
            </div>

            {/* WhatsApp Accounts Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#ebd7c7] shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="size-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                  <MessageCircle className="size-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                    Option 2: Instant WhatsApp Support
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
                    Chat on WhatsApp with Accounts
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#5d4a4b] leading-relaxed">
                  Prefer messaging? Send your invoice PDF or photo directly on our verified WhatsApp business channel. We will immediately verify the payable balance and provide secure bank transfer details.
                </p>
              </div>

              <div className="pt-2 border-t border-[#ebd7c7] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#5d4a4b]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    <span>Average reply time: under 5 minutes</span>
                  </span>
                  <span className="font-semibold text-emerald-600">Instant Chat</span>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1caa52] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <MessageCircle className="size-4" />
                  <span>WhatsApp Accounts Desk</span>
                </a>
              </div>
            </div>
          </div>

          {/* Option 3: Request a Call Back Form */}
          <div className="mt-6 bg-white rounded-2xl p-6 sm:p-8 border border-[#ebd7c7] shadow-xs">
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-[#c25e0a] uppercase tracking-wider">
                  Option 3: Prefer We Call You?
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
                  Request a Priority Billing Callback
                </h3>
                <p className="text-xs sm:text-sm text-[#5d4a4b]">
                  Leave your invoice number and phone number. Our accounts officer will call you back within 15 minutes.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const name = (form.elements.namedItem("customerName") as HTMLInputElement)?.value;
                  const phone = (form.elements.namedItem("customerPhone") as HTMLInputElement)?.value;
                  const invoice = (form.elements.namedItem("invoiceNo") as HTMLInputElement)?.value;
                  const note = (form.elements.namedItem("notes") as HTMLInputElement)?.value;

                  const text = `Hello VOLAMP Billing Desk, I would like to request a callback to pay my invoice.\n\nName: ${name}\nPhone: ${phone}\nInvoice/Quote: ${invoice || "Pending"}\nNote: ${note || "None"}`;
                  window.open(`https://wa.me/91${supportPhone}?text=${encodeURIComponent(text)}`, "_blank");
                  form.reset();
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-xs font-bold text-[#4d1217] mb-1">
                    Your Name / Company *
                  </label>
                  <input
                    name="customerName"
                    type="text"
                    required
                    placeholder="e.g. Rajesh Kumar (Apex Electricals)"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#ebd7c7] text-xs text-[#0b1f33] focus:outline-none focus:ring-2 focus:ring-[#c56718] focus:border-transparent bg-[#fdfbf9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4d1217] mb-1">
                    Phone / Mobile Number *
                  </label>
                  <input
                    name="customerPhone"
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#ebd7c7] text-xs text-[#0b1f33] focus:outline-none focus:ring-2 focus:ring-[#c56718] focus:border-transparent bg-[#fdfbf9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4d1217] mb-1">
                    Invoice or Quotation Number (Optional)
                  </label>
                  <input
                    name="invoiceNo"
                    type="text"
                    placeholder="e.g. VOL-2026-8821"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#ebd7c7] text-xs text-[#0b1f33] focus:outline-none focus:ring-2 focus:ring-[#c56718] focus:border-transparent bg-[#fdfbf9]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4d1217] mb-1">
                    Preferred Time / Notes (Optional)
                  </label>
                  <input
                    name="notes"
                    type="text"
                    placeholder="e.g. Call before 4 PM / Polycab cables order"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#ebd7c7] text-xs text-[#0b1f33] focus:outline-none focus:ring-2 focus:ring-[#c56718] focus:border-transparent bg-[#fdfbf9]"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="w-full h-11 rounded-xl bg-[#c56718] hover:bg-[#b45309] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Headphones className="size-4 text-white" />
                    <span>Submit Callback Request</span>
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Step-by-Step Payment Process */}
        <section className="market-container max-w-5xl py-14 sm:py-20 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-[#c25e0a] uppercase tracking-wider">
              HOW IT WORKS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
              Simple 4-Step Payment & Dispatch Process
            </h2>
            <p className="text-xs sm:text-sm text-[#5d4a4b] max-w-xl mx-auto">
              Follow these simple steps to ensure your payment is verified and your electrical supplies are dispatched without delay.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-xl p-5 border border-[#ebd7c7] shadow-xs relative space-y-3">
              <div className="size-9 rounded-lg bg-[#f7ede6] text-[#c56718] font-bold font-['Plus_Jakarta_Sans',sans-serif] flex items-center justify-center text-sm border border-[#ebd4c2]">
                01
              </div>
              <h4 className="font-bold text-[#4d1217] text-sm">Have Invoice Ready</h4>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Locate your official Volamp Tax Invoice or Proforma Invoice (PI) number and order total before calling.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-xl p-5 border border-[#ebd7c7] shadow-xs relative space-y-3">
              <div className="size-9 rounded-lg bg-[#c56718] text-white font-bold font-['Plus_Jakarta_Sans',sans-serif] flex items-center justify-center text-sm">
                02
              </div>
              <h4 className="font-bold text-[#4d1217] text-sm">Call or WhatsApp</h4>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Contact our accounts desk at +91 9512365582 to verify your invoice and receive verified bank transfer coordinates.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-xl p-5 border border-[#ebd7c7] shadow-xs relative space-y-3">
              <div className="size-9 rounded-lg bg-emerald-600 text-white font-bold font-['Plus_Jakarta_Sans',sans-serif] flex items-center justify-center text-sm">
                03
              </div>
              <h4 className="font-bold text-[#4d1217] text-sm">Execute Transfer</h4>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Make direct transfer via RTGS / NEFT / IMPS from your corporate or trade bank account to Volamp Elektrikals.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-xl p-5 border border-[#ebd7c7] shadow-xs relative space-y-3">
              <div className="size-9 rounded-lg bg-[#c56718] text-white font-bold font-['Plus_Jakarta_Sans',sans-serif] flex items-center justify-center text-sm">
                04
              </div>
              <h4 className="font-bold text-[#4d1217] text-sm">Share UTR for Dispatch</h4>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Share the transaction UTR number. We reconcile payment instantly and release goods for warehouse dispatch.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Anti-Fraud Advisory */}
        <section className="market-container max-w-5xl pb-14">
          <div className="bg-[#f7ede6] border border-[#ebd4c2] rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-6 text-[#c56718] flex-none mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
                  Important Security & Anti-Fraud Advisory
                </h3>
                <p className="text-xs sm:text-sm text-[#5d4a4b] leading-relaxed">
                  To protect your funds against cyber fraud and unauthorized intermediaries, please strictly adhere to the following:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-[#ebd7c7] space-y-1">
                <strong className="block text-[#4d1217] font-bold">1. Verified Corporate Name</strong>
                <p className="text-[#5d4a4b]">
                  Ensure the beneficiary account name is strictly <strong>VOLAMP ELEKTRIKALS PRIVATE LIMITED</strong>. Never transfer to any individual savings account.
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-[#ebd7c7] space-y-1">
                <strong className="block text-[#4d1217] font-bold">2. Official Communication Only</strong>
                <p className="text-[#5d4a4b]">
                  Only accept bank details shared from our official support line <strong>+91 9512365582</strong> or official company email (<strong>@volampelektrikals.com</strong>).
                </p>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-[#ebd7c7] space-y-1">
                <strong className="block text-[#4d1217] font-bold">3. Match GST & PI Details</strong>
                <p className="text-[#5d4a4b]">
                  Always confirm the invoice number, GSTIN, and company address match your official Volamp Purchase Order before making payment.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="bg-[#fbf8f5] border-t border-[#ebd7c7] py-14 sm:py-20">
          <div className="market-container max-w-4xl space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-[#c25e0a] uppercase tracking-wider">
                COMMON QUESTIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#4d1217] font-['Plus_Jakarta_Sans',sans-serif]">
                Frequently Asked Questions Regarding Invoice Payments
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-xl border border-[#ebd7c7] bg-white space-y-2 shadow-xs">
                <h4 className="font-bold text-[#4d1217] text-sm">
                  Why doesn't Volamp accept generic debit/credit cards on the website?
                </h4>
                <p className="text-xs sm:text-sm text-[#5d4a4b] leading-relaxed">
                  Electrical cables and switchgears are high-value B2B purchases ranging from ₹20,000 to over ₹50,00,000. Standard payment gateways impose a 2%–3% surcharge, payment limits, and settlement delays. By handling payments directly through institutional RTGS/NEFT over call, we pass 100% of these savings back to contractors in the form of factory wholesale discounts.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[#ebd7c7] bg-white space-y-2 shadow-xs">
                <h4 className="font-bold text-[#4d1217] text-sm">
                  Can I pay via RTGS, NEFT, or IMPS from any bank in India?
                </h4>
                <p className="text-xs sm:text-sm text-[#5d4a4b] leading-relaxed">
                  Yes, we accept RTGS, NEFT, and IMPS from all nationalized and private banks (HDFC, ICICI, SBI, Axis, Kotak, PNB, Bank of Baroda, etc.). Once you transfer, simply share the UTR reference number with our team.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[#ebd7c7] bg-white space-y-2 shadow-xs">
                <h4 className="font-bold text-[#4d1217] text-sm">
                  Can I get an institutional credit line (Order Now, Pay Later)?
                </h4>
                <p className="text-xs sm:text-sm text-[#5d4a4b] leading-relaxed">
                  Yes! We have pre-approved institutional bank tie-ups for verified contractors, builders, and panel makers. If you require 30 to 90 days credit terms, ask the billing desk or explore our <strong>Bank Tie-Up · Order & Pay Later</strong> program on the home page.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-[#ebd7c7] bg-white space-y-2 shadow-xs">
                <h4 className="font-bold text-[#4d1217] text-sm">
                  How fast will my material be dispatched after payment?
                </h4>
                <p className="text-xs sm:text-sm text-[#5d4a4b] leading-relaxed">
                  As soon as the UTR is received and verified by our accounts desk (usually within 15–30 minutes during working hours), your order status updates to "Payment Verified" and the warehouse initiates cutting, packing, and dispatch.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Footer */}
      <UniversalFooter />
    </div>
  );
}
