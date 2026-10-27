import React, { useState } from "react";
import { Link } from "wouter";
import {
  Globe,
  Ship,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Anchor,
  Box,
  CreditCard,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  Download,
  Award,
  Check,
} from "lucide-react";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import SeoHead from "@/components/seo/SeoHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ExportPage() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [dischargePort, setDischargePort] = useState("");
  const [incoterm, setIncoterm] = useState("FOB Mundra");
  const [requirements, setRequirements] = useState("");

  const handleExportRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !destinationCountry) {
      toast.error("Please fill in your email and destination country.");
      return;
    }
    toast.success("International Export RFQ Logged!", {
      description: `Our Global Sourcing Desk will send CIF / FOB pricing to ${email} within 24 hours.`,
    });
    setCompanyName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setDestinationCountry("");
    setDischargePort("");
    setRequirements("");
  };

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#0b1f33] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      <SeoHead
        title="Global Electrical & Cable Export Solutions | Volamp"
        description="International export of IEC/BS certified LT/HT power cables, 1500V solar cables & switchgear. Sea-worthy packing, FOB Mundra/Kandla & CIF terms."
        canonicalPath="/export"
      />

      <UniversalHeader currentPage="products" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf8f5] via-[#fdfbf9] to-white border-b border-[#ebd7c7] py-14 sm:py-20">
          <div className="market-container max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f7ede6] border border-[#ebd4c2] text-xs font-bold text-[#c56718] uppercase tracking-wider">
                  <Globe className="size-3.5 text-[#c56718]" />
                  <span>INTERNATIONAL EPC & OVERSEAS PROCUREMENT DESK</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#4d1217] leading-tight tracking-tight">
                  Global Industrial Cable &amp; Electrical Export from India
                </h1>

                <p className="text-sm sm:text-base text-[#5d4a4b] leading-relaxed max-w-2xl">
                  Supplying certified power transmission cables, 1500V solar PV cables, and protection switchgear directly from Gujarat's premier deep-water container ports (Mundra &amp; Kandla Port) to infrastructure projects across the Middle East, Africa, and Southeast Asia.
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white border border-[#ebd7c7] shadow-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block">Gateway Ports</span>
                    <strong className="text-sm font-bold text-[#4d1217]">Mundra &amp; Kandla</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#ebd7c7] shadow-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block">Packing Standard</span>
                    <strong className="text-sm font-bold text-[#c56718]">ISPM-15 Heat Treated</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#ebd7c7] shadow-xs col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">Inspection Partners</span>
                    <strong className="text-sm font-bold text-emerald-700">SGS / BV / TUV</strong>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-3">
                  <a
                    href="#export-rfq"
                    className="px-6 py-3 rounded-xl bg-[#c56718] hover:bg-[#b45309] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-amber-500/20 inline-flex items-center gap-2"
                  >
                    <span>Request International Quote</span>
                    <ArrowRight className="size-4" />
                  </a>
                  <a
                    href="https://wa.me/919512365582?text=Hello%20Volamp%2C%20I%20have%20an%20international%20export%20inquiry%20for%20cables"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-2"
                  >
                    <Phone className="size-4" />
                    <span>WhatsApp Export Desk</span>
                  </a>
                </div>
              </div>

              {/* International RFQ Form */}
              <div id="export-rfq" className="lg:col-span-5">
                <div className="bg-white rounded-2xl border border-[#ebd7c7] p-6 shadow-xl space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-[#c56718] text-xs font-bold uppercase tracking-wider">
                      <Ship className="size-4" />
                      <span>Overseas Buyer RFQ Portal</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#4d1217] mt-1">FOB / CIF Price Quotation</h3>
                    <p className="text-xs text-[#5d4a4b]">Guaranteed commercial proposals with freight calculations within 24 hours.</p>
                  </div>

                  <form onSubmit={handleExportRfq} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Company / Contractor Name</label>
                      <Input
                        required
                        placeholder="e.g. Al-Mansoor Contracting LLC"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="text-xs h-9 border-[#ebd7c7]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Contact Person</label>
                        <Input
                          required
                          placeholder="Full Name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className="text-xs h-9 border-[#ebd7c7]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Official Email</label>
                        <Input
                          required
                          type="email"
                          placeholder="procurement@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="text-xs h-9 border-[#ebd7c7]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Destination Country</label>
                        <Input
                          required
                          placeholder="e.g. UAE / Saudi / Kenya"
                          value={destinationCountry}
                          onChange={(e) => setDestinationCountry(e.target.value)}
                          className="text-xs h-9 border-[#ebd7c7]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Port of Discharge</label>
                        <Input
                          placeholder="e.g. Jebel Ali / Mombasa"
                          value={dischargePort}
                          onChange={(e) => setDischargePort(e.target.value)}
                          className="text-xs h-9 border-[#ebd7c7]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Preferred Incoterm</label>
                      <select
                        value={incoterm}
                        onChange={(e) => setIncoterm(e.target.value)}
                        className="w-full text-xs rounded-lg border border-[#ebd7c7] p-2 bg-white outline-none"
                      >
                        <option value="FOB Mundra">FOB Mundra Port, India</option>
                        <option value="FOB Kandla">FOB Kandla Port, India</option>
                        <option value="CIF">CIF (Cost, Insurance &amp; Freight)</option>
                        <option value="CFR">CFR (Cost &amp; Freight)</option>
                        <option value="Ex-Works">Ex-Works Aslali Warehouse, Ahmedabad</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Cable Specifications &amp; Quantities</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. 1.1kV XLPE 4C x 95 sqmm (5,000m), 1500V DC Solar 4 sqmm (25,000m)"
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        className="w-full text-xs rounded-lg border border-[#ebd7c7] p-2 focus:ring-1 focus:ring-[#c56718] outline-none"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-[#c56718] hover:bg-[#b45309] text-white font-bold text-xs h-10 shadow-md">
                      Request Export Price &amp; Container Plan
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars of Volamp Export */}
        <section className="market-container max-w-6xl py-12 sm:py-16 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[#4d1217]">
              Engineered for Overseas Turnkey Infrastructure &amp; Solar EPCs
            </h2>
            <p className="text-sm text-[#5d4a4b] leading-relaxed">
              Volamp Elektrikals bridges India's world-class electrical manufacturing base with global infrastructure projects. Here is why international buyers choose our export desk:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#ebd7c7] shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-[#f7ede6] text-[#c56718] flex items-center justify-center">
                <Anchor className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#4d1217]">Port Gateway Proximity</h3>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Direct highway access from our Aslali terminal to <strong>Mundra Port</strong> (India's largest commercial deep-water container terminal) and <strong>Kandla Port</strong>, reducing inland transit time to under 24 hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#ebd7c7] shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-[#f7ede6] text-[#c56718] flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#4d1217]">International Standards</h3>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Full compliance with <strong>IEC 60502-1, IEC 60502-2, BS 5467, EN 50618, and CE</strong> directives. Routine factory test certificates (MTC) supplied with every wooden drum.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#ebd7c7] shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-[#f7ede6] text-[#c56718] flex items-center justify-center">
                <Box className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#4d1217]">Sea-Worthy Export Packing</h3>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Heavy-duty <strong>ISPM-15 certified heat-treated wooden drums</strong>, bitumen moisture barrier wrap, PVC shrink wrapping, and steel arbor hole bushings for crane handling.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#ebd7c7] shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-[#f7ede6] text-[#c56718] flex items-center justify-center">
                <CreditCard className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#4d1217]">Bank-Grade Terms &amp; Inspection</h3>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                We accept <strong>Irrevocable Letter of Credit (LC at sight)</strong> and facilitate third-party pre-shipment inspections by <strong>SGS, Bureau Veritas, TUV, or Intertek</strong>.
              </p>
            </div>
          </div>

          {/* Regional Export Destinations */}
          <div className="bg-white rounded-3xl border border-[#ebd7c7] p-8 sm:p-12 shadow-xs space-y-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#4d1217]">
              Regional Corridors &amp; Typical Transit Schedules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#fbf8f5] border border-[#ebd7c7] space-y-2">
                <h4 className="text-sm font-bold text-[#c56718]">Middle East &amp; GCC</h4>
                <p className="text-xs text-slate-500 font-semibold">UAE, Saudi Arabia, Oman, Qatar, Kuwait</p>
                <p className="text-xs text-[#5d4a4b] leading-relaxed">
                  Sea transit: <strong>4 to 7 days</strong> from Mundra Port to Jebel Ali / Dammam. High demand for 1500V DC solar cables, 11kV/33kV HT cables, and Schneider switchgear.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#fbf8f5] border border-[#ebd7c7] space-y-2">
                <h4 className="text-sm font-bold text-[#c56718]">East &amp; West Africa</h4>
                <p className="text-xs text-slate-500 font-semibold">Kenya, Tanzania, Uganda, Nigeria, Ghana</p>
                <p className="text-xs text-[#5d4a4b] leading-relaxed">
                  Sea transit: <strong>12 to 18 days</strong> to Mombasa / Dar es Salaam / Lagos. Supplying rural electrification tenders, industrial manufacturing, and mining projects.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#fbf8f5] border border-[#ebd7c7] space-y-2">
                <h4 className="text-sm font-bold text-[#c56718]">SAARC &amp; Southeast Asia</h4>
                <p className="text-xs text-slate-500 font-semibold">Nepal, Bangladesh, Sri Lanka, Vietnam</p>
                <p className="text-xs text-[#5d4a4b] leading-relaxed">
                  Direct border container trailers to Nepal &amp; Bangladesh; container sea vessels to Colombo &amp; Chittagong within <strong>5 to 10 days</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <UniversalFooter />
    </div>
  );
}
