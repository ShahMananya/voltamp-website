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
  Compass,
  Clock,
  MapPin,
  Plane,
  ChevronRight,
  Layers,
  Sparkles,
} from "lucide-react";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import SeoHead from "@/components/seo/SeoHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ExportCorridor {
  id: string;
  region: string;
  continent: "North America" | "Africa" | "Middle East" | "Europe & UK" | "Asia & SAARC" | "Latin America" | "Oceania";
  badge: string;
  flag: string;
  countries: string;
  transitTime: string;
  gatewayPorts: string;
  cablesDemanded: string;
  standards: string;
  applicationHighlights: string;
}

const EXPORT_CORRIDORS: ExportCorridor[] = [
  {
    id: "north-america",
    region: "North America",
    continent: "North America",
    badge: "FAST EXPEDITE",
    flag: "🇺🇸 🇨🇦 🇲🇽",
    countries: "United States, Canada, Mexico",
    transitTime: "22 to 28 days sea transit from Mundra Port",
    gatewayPorts: "Port of Houston, Savannah, New York/NJ, Long Beach, Montreal, Vancouver",
    cablesDemanded: "UL 4703 2000V PV Wire, TC-ER Tray Cable, XHHW-2, DLO Locomotive & IEEE 1580 Marine Cables",
    standards: "UL 4703, UL 1277, CSA C22.2, IEEE 1580, NEC Compliant",
    applicationHighlights: "Utility-scale solar farms across Texas, California & Nevada; commercial data center distribution; industrial manufacturing plants and EPC projects.",
  },
  {
    id: "east-central-africa",
    region: "East & Central Africa",
    continent: "Africa",
    badge: "DIRECT ROUTE",
    flag: "🇰🇪 🇹🇿 🇺🇬 🇷🇼",
    countries: "Kenya, Tanzania, Uganda, Rwanda, DRC",
    transitTime: "12 to 16 days direct sea voyage from Mundra / Kandla",
    gatewayPorts: "Port of Mombasa (Kenya), Port of Dar es Salaam (Tanzania)",
    cablesDemanded: "11kV / 33kV Aerial Bundled Cables (ABC), ACSR Dog/Wolf/Rabbit Conductors, Armoured XLPE, Copper Earthing Tape",
    standards: "IEC 60502-1/2, BS 7870, KPLC & TANESCO Tender Specifications",
    applicationHighlights: "National grid expansion tenders (KPLC Kenya, TANESCO Tanzania, REA Uganda), rural solar mini-grids, industrial agro-processing, and cross-border interconnectors.",
  },
  {
    id: "west-southern-africa",
    region: "West, North & Southern Africa",
    continent: "Africa",
    badge: "HIGH CAPACITY",
    flag: "🇳🇬 🇬🇭 🇿🇦 🇪🇬",
    countries: "Nigeria, Ghana, South Africa, Egypt, Morocco, Zambia",
    transitTime: "18 to 24 days to Western & Southern African hubs",
    gatewayPorts: "Port of Durban, Cape Town, Lagos (Apapa/Tin Can), Tema, Alexandria",
    cablesDemanded: "SABS & SONCAP certified Armoured Power Cables, Heavy Mining Dragline Trailing Cables, LSZH Building Wires, Submersible Pump Cables",
    standards: "SABS 1507, SONCAP Approved, IEC 60502, BS 5467, BS 6724",
    applicationHighlights: "Deep-shaft copper mining in Zambia & South Africa, oil & gas refinery infrastructure in Nigeria/Ghana, municipal water distribution, and seaport upgrades.",
  },
  {
    id: "middle-east-gcc",
    region: "Middle East & GCC",
    continent: "Middle East",
    badge: "EXPRESS LANE (4-7 DAYS)",
    flag: "🇦🇪 🇸🇦 🇴🇲 🇶🇦",
    countries: "UAE, Saudi Arabia, Oman, Qatar, Kuwait, Bahrain",
    transitTime: "4 to 7 days direct sea shipping from Mundra to Gulf ports",
    gatewayPorts: "Jebel Ali (Dubai), Khalifa (Abu Dhabi), King Abdulaziz (Dammam), Jeddah Islamic Port, Sohar (Oman)",
    cablesDemanded: "1500V DC EN 50618 Solar PV Cables, 11kV/33kV XLPE Underground HT, Fire Survival CWZ Cables, ABB/Schneider MV Switchgear",
    standards: "EN 50618, IEC 60502-2, BS 6387 CWZ Fire Resistance, ADDC / DEWA / SEC Approved Specs",
    applicationHighlights: "Mega-scale solar projects (NEOM, Sudair, Mohammed bin Rashid Solar Park), luxury commercial towers, metro rail lines, and petrochemical refineries.",
  },
  {
    id: "europe-uk",
    region: "Europe & United Kingdom",
    continent: "Europe & UK",
    badge: "CPR EUROCLASS",
    flag: "🇬🇧 🇩🇪 🇳🇱 🇫🇷",
    countries: "United Kingdom, Germany, Netherlands, France, Poland, Italy",
    transitTime: "18 to 22 days to North Sea & Mediterranean ports",
    gatewayPorts: "Port of Rotterdam, Hamburg, Antwerp, Felixstowe, Southampton, Genoa",
    cablesDemanded: "CPR Euroclass (B2ca, Cca) Low Smoke Zero Halogen XLPE, BS 5467 Steel Wire Armoured (SWA), EN 50618 H1Z2Z2-K Solar Cables",
    standards: "EN 50575 CPR Euroclass, BS 5467, BS 6724, CE Directive, RoHS & REACH Compliant",
    applicationHighlights: "Wind farm collector grids, hyperscale data centers in Dublin & Frankfurt, commercial warehousing complexes, and electric vehicle charging hubs.",
  },
  {
    id: "saarc-southeast-asia",
    region: "SAARC & Southeast Asia",
    continent: "Asia & SAARC",
    badge: "OVERLAND & MARITIME",
    flag: "🇳🇵 🇧🇩 🇱🇰 🇻🇳",
    countries: "Nepal, Bangladesh, Sri Lanka, Vietnam, Indonesia",
    transitTime: "3 to 5 days overland border trailers / 5 to 10 days sea transit",
    gatewayPorts: "Raxaul/Birgunj & Petrapole/Benapole land borders; Port of Colombo, Chittagong, Hai Phong, Tanjung Priok",
    cablesDemanded: "Overhead ACSR / AAAC Conductors, 1.1kV LT Armoured Aluminum/Copper Cables, 33kV Substation Feeders, Submersible Flat Cables",
    standards: "IS 7098, IS 1554, IEC 60502, BREB Bangladesh & NEA Nepal Standards",
    applicationHighlights: "Cross-border river crossing transmission lines, export processing zones in Chittagong & Dhaka, hydropower evacuation lines in Nepal, and agricultural electrification.",
  },
  {
    id: "latin-america",
    region: "Latin America & Caribbean",
    continent: "Latin America",
    badge: "GLOBAL CORRIDOR",
    flag: "🇧🇷 🇨🇱 🇵🇦 🇨🇴",
    countries: "Brazil, Chile, Panama, Colombia, Guyana",
    transitTime: "28 to 35 days direct container routing across Atlantic & Pacific",
    gatewayPorts: "Port of Santos, Paranagua, Valparaiso, Callao, Colon / Balboa Free Zone",
    cablesDemanded: "High-altitude 1500V Solar DC PV Cables, Heavy-Duty Mining Rubber Cables, Overhead AAC/ACSR Conductors, Armoured Control Cables",
    standards: "IEC 60502, ICEA Standards, ABNT NBR (Brazil), SEC Chile Compliant",
    applicationHighlights: "Atacama Desert solar megaprojects, Andean copper and lithium extraction operations, deep-water offshore logistics hubs in Panama and Guyana.",
  },
  {
    id: "australia-oceania",
    region: "Australia & Oceania",
    continent: "Oceania",
    badge: "AS/NZS COMPLIANT",
    flag: "🇦🇺 🇳🇿 🇫🇯 🇵🇬",
    countries: "Australia, New Zealand, Papua New Guinea, Fiji",
    transitTime: "16 to 22 days sea transit from Western India ports",
    gatewayPorts: "Port Botany (Sydney), Melbourne, Brisbane, Fremantle (Perth), Auckland",
    cablesDemanded: "AS/NZS 5000.1 & AS/NZS 1429.1 certified XLPE cables, UV-stabilized heavy trailing rubber cables, Renewable Farm Collector Cables",
    standards: "AS/NZS 5000.1, AS/NZS 1429.1, AS/NZS 3008, RCM Mark Ready",
    applicationHighlights: "NEM renewable energy zone grid connections, Pilbara iron ore mining expansions, Pacific island micro-grid electrification and civil utility distribution.",
  },
];

const CONTINENT_FILTERS = [
  "All Continents (8)",
  "North America",
  "Africa",
  "Middle East",
  "Europe & UK",
  "Asia & SAARC",
  "Latin America",
  "Oceania",
] as const;

const QUICK_COUNTRIES = [
  { name: "United States", port: "Houston / Savannah", flag: "🇺🇸" },
  { name: "Canada", port: "Montreal / Vancouver", flag: "🇨🇦" },
  { name: "Kenya", port: "Mombasa", flag: "🇰🇪" },
  { name: "Tanzania", port: "Dar es Salaam", flag: "🇹🇿" },
  { name: "Nigeria", port: "Lagos (Apapa)", flag: "🇳🇬" },
  { name: "South Africa", port: "Durban", flag: "🇿🇦" },
  { name: "United Arab Emirates", port: "Jebel Ali, Dubai", flag: "🇦🇪" },
  { name: "Saudi Arabia", port: "Dammam / Jeddah", flag: "🇸🇦" },
  { name: "United Kingdom", port: "Felixstowe / Southampton", flag: "🇬🇧" },
  { name: "Germany", port: "Hamburg", flag: "🇩🇪" },
  { name: "Australia", port: "Sydney / Melbourne", flag: "🇦🇺" },
  { name: "Brazil", port: "Port of Santos", flag: "🇧🇷" },
];

export default function ExportPage() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");
  const [dischargePort, setDischargePort] = useState("");
  const [incoterm, setIncoterm] = useState("FOB Mundra");
  const [requirements, setRequirements] = useState("");
  const [selectedContinent, setSelectedContinent] = useState<string>("All Continents (8)");

  const handleSelectQuickCountry = (country: { name: string; port: string }) => {
    setDestinationCountry(country.name);
    setDischargePort(country.port);
    toast.info(`Destination pre-filled: ${country.name}`, {
      description: `Discharge port set to ${country.port}. Complete your specifications below.`,
    });
  };

  const handleExportRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !destinationCountry) {
      toast.error("Please fill in your email and destination country.");
      return;
    }
    toast.success("International Export RFQ Logged!", {
      description: `Our Global Sourcing Desk will send CIF / FOB pricing for ${destinationCountry} to ${email} within 24 hours.`,
    });
    setCompanyName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setDestinationCountry("");
    setDischargePort("");
    setRequirements("");
  };

  const filteredCorridors = EXPORT_CORRIDORS.filter((corridor) => {
    if (selectedContinent === "All Continents (8)") return true;
    if (selectedContinent === "Africa") {
      return corridor.continent === "Africa";
    }
    return corridor.continent === selectedContinent;
  });

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#0b1f33] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      <SeoHead
        title="Global Electrical & Cable Export Solutions | Doing Business Around the World | Volamp"
        description="International export of IEC, UL, BS & SABS certified LT/HT power cables, 1500V solar cables & switchgear to North America, Africa, Middle East, Europe & worldwide. Sea-worthy packing, FOB Mundra & CIF terms."
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
                  <span>DOING BUSINESS AROUND THE WORLD · GLOBAL EXPORT DESK</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#4d1217] leading-tight tracking-tight">
                  Global Industrial Cable &amp; Electrical Export from India
                </h1>

                <p className="text-sm sm:text-base text-[#5d4a4b] leading-relaxed max-w-2xl">
                  Supplying certified power transmission cables, 1500V solar PV cables, and protection switchgear directly from Gujarat&apos;s premier deep-water container ports (Mundra &amp; Kandla Port) to infrastructure projects across <strong>North America, Africa, the Middle East, Europe, SAARC, Latin America, and Oceania</strong>.
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white border border-[#ebd7c7] shadow-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block">Global Reach</span>
                    <strong className="text-sm font-bold text-[#4d1217]">40+ Countries</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#ebd7c7] shadow-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block">Gateway Ports</span>
                    <strong className="text-sm font-bold text-[#4d1217]">Mundra &amp; Kandla</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#ebd7c7] shadow-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block">Export Packing</span>
                    <strong className="text-sm font-bold text-[#c56718]">ISPM-15 Heat Treated</strong>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-[#ebd7c7] shadow-xs">
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
                    href="#regional-corridors"
                    className="px-6 py-3 rounded-xl bg-[#4d1217] hover:bg-[#3a0d11] text-white text-xs sm:text-sm font-bold transition-all shadow-md inline-flex items-center gap-2"
                  >
                    <Compass className="size-4" />
                    <span>View Worldwide Corridors</span>
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
                    <p className="text-xs text-[#5d4a4b]">Guaranteed commercial proposals with container freight calculations within 24 hours.</p>
                  </div>

                  {/* Quick destination country pills */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                      Quick Select Destination Country:
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {QUICK_COUNTRIES.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleSelectQuickCountry(c)}
                          className={`text-[11px] px-2.5 py-1 rounded-full border transition-all inline-flex items-center gap-1 ${
                            destinationCountry === c.name
                              ? "bg-[#c56718] text-white border-[#c56718] font-bold shadow-xs"
                              : "bg-[#fbf8f5] hover:bg-[#f7ede6] text-[#4d1217] border-[#ebd7c7]"
                          }`}
                        >
                          <span>{c.flag}</span>
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleExportRfq} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Company / Contractor Name</label>
                      <Input
                        required
                        placeholder="e.g. Continental Energy EPC LLC"
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
                          placeholder="e.g. USA / Kenya / UAE"
                          value={destinationCountry}
                          onChange={(e) => setDestinationCountry(e.target.value)}
                          className="text-xs h-9 border-[#ebd7c7]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">Port of Discharge</label>
                        <Input
                          placeholder="e.g. Houston / Mombasa / Jebel Ali"
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
                        <option value="Ex-Works">Ex-Works Aslali Central Hub, Ahmedabad</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Cable Specifications &amp; Quantities</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. 1.1kV XLPE 4C x 95 sqmm (5,000m), 2000V UL 4703 PV Wire (15,000m)"
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
              Volamp Elektrikals bridges India&apos;s world-class electrical manufacturing base with global infrastructure projects. Here is why international buyers choose our export desk:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#ebd7c7] shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-[#f7ede6] text-[#c56718] flex items-center justify-center">
                <Anchor className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#4d1217]">Port Gateway Proximity</h3>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Direct highway access from our Aslali terminal to <strong>Mundra Port</strong> (India&apos;s largest commercial deep-water container terminal) and <strong>Kandla Port</strong>, reducing inland transit time to under 24 hours.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#ebd7c7] shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-[#f7ede6] text-[#c56718] flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#4d1217]">International Standards</h3>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Full compliance with <strong>UL 4703, IEC 60502-1/2, BS 5467, EN 50618, SABS, and CE</strong> directives. Routine factory test certificates (MTC) supplied with every wooden drum.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#ebd7c7] shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-[#f7ede6] text-[#c56718] flex items-center justify-center">
                <Box className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#4d1217]">Sea-Worthy Export Packing</h3>
              <p className="text-xs text-[#5d4a4b] leading-relaxed">
                Heavy-duty <strong>ISPM-15 certified heat-treated wooden drums</strong>, bitumen moisture barrier wrap, PVC shrink wrapping, and steel arbor hole bushings for container and crane handling.
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

          {/* Regional Export Destinations - Doing Business Around the World */}
          <div id="regional-corridors" className="bg-white rounded-3xl border border-[#ebd7c7] p-6 sm:p-10 lg:p-12 shadow-xs space-y-8 scroll-mt-24">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f7ede6] border border-[#ebd4c2] text-xs font-bold text-[#c56718] uppercase tracking-wider">
                <Globe className="size-3.5" />
                <span>DOING BUSINESS AROUND THE WORLD · 8 STRATEGIC TRADE CORRIDORS</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#4d1217]">
                    Regional Corridors &amp; Typical Transit Schedules
                  </h3>
                  <p className="text-xs sm:text-sm text-[#5d4a4b] mt-1 max-w-2xl">
                    Direct regular container sailings and multimodal freight links connecting Volamp&apos;s Gujarat manufacturing hub to project destinations across North America, Africa, the Middle East, Europe, and beyond.
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#fbf8f5] border border-[#ebd7c7] text-[#4d1217] whitespace-nowrap self-start md:self-auto">
                  Showing {filteredCorridors.length} of {EXPORT_CORRIDORS.length} Global Corridors
                </span>
              </div>

              {/* Continent Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-3 border-b border-slate-100 no-scrollbar">
                {CONTINENT_FILTERS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setSelectedContinent(tab)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedContinent === tab
                        ? "bg-[#4d1217] text-white shadow-sm"
                        : "bg-[#fbf8f5] hover:bg-[#f7ede6] text-[#5d4a4b] border border-[#ebd7c7]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Corridor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCorridors.map((corridor) => (
                <div
                  key={corridor.id}
                  className="p-6 rounded-2xl bg-[#fbf8f5] border border-[#ebd7c7] hover:border-[#c56718] transition-all flex flex-col justify-between space-y-4 hover:shadow-md group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{corridor.flag}</span>
                        <h4 className="text-base font-bold text-[#4d1217] group-hover:text-[#c56718] transition-colors">
                          {corridor.region}
                        </h4>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#ebd7c7]/50 text-[#4d1217] uppercase tracking-wider">
                        {corridor.badge}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Key Destinations
                        </span>
                        <p className="font-semibold text-slate-800">{corridor.countries}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-[#ebd7c7]/60 space-y-1">
                        <div className="flex items-center gap-1.5 text-[#c56718] font-bold text-[11px]">
                          <Clock className="size-3.5" />
                          <span>Transit Schedule</span>
                        </div>
                        <p className="text-[#5d4a4b] text-[11px] leading-relaxed">
                          {corridor.transitTime}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Discharge Seaports
                        </span>
                        <p className="text-[#5d4a4b] text-[11px]">{corridor.gatewayPorts}</p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Key Product Demands
                        </span>
                        <p className="text-[#4d1217] font-semibold text-[11px] leading-relaxed">
                          {corridor.cablesDemanded}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Compliance &amp; Standards
                        </span>
                        <p className="text-emerald-700 font-bold text-[11px]">
                          {corridor.standards}
                        </p>
                      </div>

                      <p className="text-[11px] text-[#5d4a4b] leading-relaxed pt-1 border-t border-[#ebd7c7]/40">
                        {corridor.applicationHighlights}
                      </p>
                    </div>
                  </div>

                  <a
                    href="#export-rfq"
                    onClick={() => {
                      setDestinationCountry(corridor.region);
                      setDischargePort(corridor.gatewayPorts.split(",")[0]);
                    }}
                    className="pt-2 text-xs font-bold text-[#c56718] hover:text-[#b45309] inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Request corridor rate card</span>
                    <ArrowRight className="size-3.5" />
                  </a>
                </div>
              ))}
            </div>

            {/* Bottom summary banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#4d1217] to-[#731f26] text-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="text-base font-bold flex items-center justify-center md:justify-start gap-2">
                  <Sparkles className="size-4 text-amber-400" />
                  <span>Looking for a Port or Corridor Not Listed Here?</span>
                </h4>
                <p className="text-xs text-white/80 max-w-xl">
                  Volamp Elektrikals handles custom container loading (20ft FCL, 40ft High-Cube &amp; Breakbulk break-bulk vessels) to any designated international customs port worldwide.
                </p>
              </div>
              <a
                href="https://wa.me/919512365582?text=Hello%20Volamp%2C%20I%20need%20freight%20and%20cable%20quotation%20for%20a%20custom%20international%20destination"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#4d1217] font-bold text-xs whitespace-nowrap shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Consult Shipping Specialist</span>
                <ArrowRight className="size-3.5" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <UniversalFooter />
    </div>
  );
}
