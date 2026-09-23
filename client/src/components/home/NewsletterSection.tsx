import React, { useState } from "react";
import {
  Mail,
  ArrowRight,
  CheckCircle2,
  Tag,
  FileSpreadsheet,
  Zap,
  ShieldCheck,
  MessageSquare,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const subscribeMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setIsSubmitted(true);
      toast.success("Subscribed successfully!", {
        description: `You'll receive electrical price updates and exclusive offers at ${data.email}.`,
      });
    },
    onError: (err) => {
      toast.error("Subscription failed", {
        description: err.message || "Please enter a valid email address.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      toast.error("Please enter a valid business email address.");
      return;
    }
    subscribeMutation.mutate({
      email: cleanEmail,
      phone: phone.trim() || undefined,
    });
  };

  return (
    <section className="w-full bg-[#fdfbf9] border-t-2 border-[#ef7d19] border-b border-[#ebd8ca] py-10 sm:py-12">
      <div className="market-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Clear Value Proposition */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#c25e0a] text-xs font-bold uppercase tracking-wider border border-orange-200/80">
              <Sparkles className="size-3.5 text-[#ef7d19]" />
              <span>VOLAMP NEWSLETTER & OFFERS</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#4d1217] font-['Space_Grotesk'] leading-snug">
              Stay updated on electrical price drops & new arrivals.
            </h3>

            <p className="text-sm text-stone-600 max-w-xl leading-relaxed">
              Get monthly manufacturer discount sheets (Polycab, Finolex, Schneider, KEI), exclusive bulk contractor pricing, and new electrical stock alerts delivered directly to your inbox.
            </p>

            {/* Clear Benefits Badges */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-stone-700">
              <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm font-medium">
                <Tag className="size-3.5 text-[#ef7d19]" />
                <span>Contractor Discounts</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm font-medium">
                <FileSpreadsheet className="size-3.5 text-[#c25e0a]" />
                <span>Latest Brand Price Lists</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm font-medium">
                <Zap className="size-3.5 text-amber-500" />
                <span>New Stock Alerts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sleek, Integrated Subscription Form */}
          <div className="lg:col-span-5">
            {isSubmitted ? (
              <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col items-center text-center space-y-3">
                <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="size-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#4d1217]">You're on the list!</h4>
                  <p className="text-xs text-stone-600 mt-1">
                    We've added <strong>{email}</strong>. Look out for our next price list update and exclusive contractor deals.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                    setPhone("");
                  }}
                  className="text-xs text-[#c25e0a] hover:text-[#4d1217] font-semibold underline transition-colors pt-1"
                >
                  Subscribe another email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-3.5 py-3 text-sm bg-white text-stone-900 placeholder-stone-400 rounded-xl border border-stone-300 focus:border-[#ef7d19] focus:ring-2 focus:ring-[#ef7d19]/20 focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={subscribeMutation.isPending}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ef7d19] to-[#ea580c] hover:from-[#d96608] hover:to-[#c2410c] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all flex-none disabled:opacity-75"
                  >
                    {subscribeMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Subscribing...</span>
                      </>
                    ) : (
                      <>
                        <span>Subscribe</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Optional WhatsApp Number Toggle */}
                {showPhone ? (
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="WhatsApp Mobile Number for instant alerts (Optional)"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white text-stone-900 placeholder-stone-400 rounded-xl border border-stone-300 focus:border-[#ef7d19] focus:ring-1 focus:ring-[#ef7d19] focus:outline-none transition-all shadow-sm"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPhone(true)}
                    className="text-xs text-[#c25e0a] hover:text-[#4d1217] font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    <span>+ Add WhatsApp number for mobile updates</span>
                  </button>
                )}

                <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-0.5">
                  <ShieldCheck className="size-3.5 text-emerald-600 flex-none" />
                  <span>No spam ever. Unsubscribe anytime with 1 click.</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
