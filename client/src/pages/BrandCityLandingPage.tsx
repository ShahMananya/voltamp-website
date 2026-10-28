import React, { useState } from "react";
import { Link, useRoute } from "wouter";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  FileCheck,
  Building2,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Download,
  FileText,
  BadgePercent,
  Warehouse,
  Award,
  Clock,
  Sparkles,
  Search,
  ShoppingCart,
} from "lucide-react";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import SeoHead from "@/components/seo/SeoHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface BrandHubData {
  slug: string;
  brand: string;
  categoryTag: string;
  location: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  heroHighlights: string[];
  authorizedStatus: string;
  stockCount: string;
  dispatchTime: string;
  overview: string;
  popularProducts: Array<{
    name: string;
    sku: string;
    spec: string;
    application: string;
  }>;
  complianceStandards: string[];
  faq: Array<{ q: string; a: string }>;
}

const BRAND_HUBS: Record<string, BrandHubData> = {
  "polycab-ahmedabad": {
    slug: "polycab-ahmedabad",
    brand: "Polycab India",
    categoryTag: "LT & HT Armoured, Flexible & Solar Cables",
    location: "Ahmedabad, Gujarat",
    metaTitle: "Polycab Dealer & Cable Distributor in Ahmedabad | Volamp",
    metaDescription:
      "Authorized Polycab dealer in Ahmedabad, Gujarat. Wholesale stockist of Polycab LT/HT armoured cables, FRLS flexible wires & solar cables with test certificates.",
    h1: "Polycab Dealer & Authorized Cable Distributor in Ahmedabad",
    subtitle:
      "Gujarat's trusted wholesale stockist of genuine Polycab industrial power cables, flexible building wires, and 1500V solar DC cables with guaranteed Manufacturer Test Certificates (MTC).",
    heroHighlights: [
      "Master Stockist with 2,800+ Polycab SKUs in Ready Inventory",
      "Official 2026 Price Circulars with Maximum Contractor Discount",
      "Same-Day Dispatch to Vatva, Sanand, Naroda, & Changodar GIDC",
      "Full Routine Spark & Conductor Resistance MTC with Every Drum",
    ],
    authorizedStatus: "Authorized Master Stockist & Project Distributor",
    stockCount: "2,850+ SKUs Ready",
    dispatchTime: "Same-Day / Within 24h",
    overview:
      "Volamp Elektrikals Private Limited is the leading Polycab cable distributor in Ahmedabad, Gujarat. Operating from our central logistics facility at Aslali Highway Terminal, we supply complete turnkey drum orders to EPC contractors, solar power developers, manufacturing facilities, and electrical panel builders across Gujarat and all 28 Indian states.",
    popularProducts: [
      {
        name: "1.1kV XLPE Aluminium Armoured Cable (3.5C x 185 sqmm)",
        sku: "CAB-000001",
        spec: "Grade EC Aluminium, Galvanized Steel Flat Strip Armour, IS:7098 (Part 1)",
        application: "Main Plant Feeder / PCC Distribution",
      },
      {
        name: "1.1kV XLPE Aluminium Armoured Cable (3.5C x 240 sqmm)",
        sku: "CAB-000002",
        spec: "Grade EC Aluminium, Strip Armoured, Flame Retardant Outer Jacket",
        application: "Heavy Transformer Incomers & MCC Panels",
      },
      {
        name: "1500V DC Solar Photovoltaic Cable (1C x 4 sqmm)",
        sku: "SOL-000001",
        spec: "Tinned Electrolytic Copper, Cross-linked Halogen-Free Flame Retardant (EN 50618 / IEC 62930)",
        application: "Rooftop & Ground-Mount Solar PV Strings",
      },
      {
        name: "Industrial Flexible Copper Wire (1C x 2.5 sqmm) 90m",
        sku: "CAB-000003",
        spec: "Electrolytic Copper Multi-Strand, FRLS Insulation, IS:694 Certified",
        application: "Industrial Control Panels & Commercial Wiring",
      },
    ],
    complianceStandards: [
      "IS 7098 (Part 1): LT XLPE Cables up to 1.1kV",
      "IS 7098 (Part 2): HT XLPE Cables 3.3kV to 33kV",
      "IS 694: PVC Insulated Flexible Copper Building Wires",
      "EN 50618 & IEC 62930: 1500V Solar DC PV Cables",
      "IS 8130: Conductor Specifications for Insulated Cables",
    ],
    faq: [
      {
        q: "Where is the Polycab warehouse of Volamp located in Ahmedabad?",
        a: "Our central fulfillment stockyard is strategically located at Aslali Highway Terminal (NH-48 & SP Ring Road Junction, Ahmedabad 382427) with our corporate sales office in Khadia, Ahmedabad 380001.",
      },
      {
        q: "Do you supply original Polycab Manufacturer Test Certificates (MTC)?",
        a: "Yes. Every cable consignment is accompanied by the official Polycab factory routine test report covering conductor resistance, insulation spark test, armour coverage, and tensile properties.",
      },
      {
        q: "What discount structure is offered on Polycab 2026 price lists?",
        a: "We offer direct master distributor discounts on the latest Polycab 2026 price circulars, tailored to order volume, delivery schedule, and contractor payment terms.",
      },
    ],
  },
  "finolex-cables-ahmedabad": {
    slug: "finolex-cables-ahmedabad",
    brand: "Finolex Cables",
    categoryTag: "Pure Electrolytic Copper Wires, Submersible & Communication",
    location: "Ahmedabad, Gujarat",
    metaTitle: "Finolex Cable Distributor in Ahmedabad, Gujarat | Volamp",
    metaDescription:
      "Leading Finolex cable distributor in Ahmedabad. 100% genuine Finolex copper flexible wires, 3-core submersible flat cables & LAN cables at wholesale prices.",
    h1: "Finolex Cable Distributor & Stockist in Ahmedabad",
    subtitle:
      "Authorized wholesale stockist of genuine Finolex pure electrolytic copper wires, FRLS building cables, and submersible pump cables for residential, commercial, and industrial projects.",
    heroHighlights: [
      "100% Genuine Certified Finolex Coils with Holographic Verification",
      "High-Purity 99.97% Electrolytic Copper Conductors per IS:8130",
      "Full Range of 3-Core Flat Submersible & CCTV/LAN Coaxial Cables",
      "Wholesale Bulk Pack Rates for Electrical Contractors & Panel Builders",
    ],
    authorizedStatus: "Certified Wholesale Stockist & Regional Supply Partner",
    stockCount: "1,200+ Finolex Items",
    dispatchTime: "Same-Day Dispatch",
    overview:
      "Finolex Cables is India's most trusted name in pure electrolytic copper conductors. Volamp Elektrikals maintains exhaustive warehouse inventory of Finolex Flame Guard (FRLS) wires, multi-core flexible industrial cords, 3-core flat submersible cables, and communication wiring in Ahmedabad, ensuring rapid delivery to projects across Gujarat.",
    popularProducts: [
      {
        name: "Finolex Flame Guard FRLS 1C x 1.5 sqmm (90m Coil)",
        sku: "FIN-FG-1.5",
        spec: "99.97% Bright Annealed Bare Electrolytic Copper, Flame Retardant Low Smoke PVC",
        application: "Commercial & High-Rise Electrical Circuits",
      },
      {
        name: "Finolex Flame Guard FRLS 1C x 2.5 sqmm (90m Coil)",
        sku: "FIN-FG-2.5",
        spec: "High Oxygen Index PVC (>29%), Low Smoke Generation (<60%), IS:694 Certified",
        application: "Power Socket Circuits & Air Conditioning Feeds",
      },
      {
        name: "Finolex 3 Core Flat Submersible Cable (3C x 4.0 sqmm)",
        sku: "FIN-SUB-3C4",
        spec: "Water-Resistant Tough Outer Sheath, Electrolytic Copper, IS:694",
        application: "Continuous Deep Borewell & Agricultural Submersible Pumps",
      },
      {
        name: "Finolex Cat-6 UTP 4-Pair LAN Cable (305m Box)",
        sku: "FIN-LAN-CAT6",
        spec: "Solid Bare Electrolytic Copper Conductor, 250 MHz Bandwidth, TIA/EIA 568-C.2",
        application: "High-Speed Commercial Data Networking & CCTV IP Cameras",
      },
    ],
    complianceStandards: [
      "IS 694: PVC Insulated Cables for Working Voltages up to 1100V",
      "IS 8130: Conductors for Insulated Electric Cables",
      "IS 5831: PVC Insulation and Sheath of Electric Cables",
      "FIA & TAC Approved for Fire Safety Installations",
    ],
    faq: [
      {
        q: "How can I verify the authenticity of Finolex cables supplied by Volamp?",
        a: "Every Finolex coil supplied by Volamp features official brand security holograms, manufacturer batch codes, meter marking on the outer jacket, and is supplied with authentic GST billing.",
      },
      {
        q: "What lengths are Finolex wires available in?",
        a: "Standard building wires are stocked in 90-metre and 180-metre coils. Industrial multi-core flexible cables can be supplied in 100m, 500m, or 1000m drums.",
      },
    ],
  },
  "kei-cables-gujarat": {
    slug: "kei-cables-gujarat",
    brand: "KEI Industries",
    categoryTag: "Extra High Voltage (EHV), HT XLPE & Heavy Industrial Cables",
    location: "Gujarat & Pan-India",
    metaTitle: "KEI Cable Dealer & Stockist in Gujarat | Volamp Elektrikals",
    metaDescription:
      "Authorized KEI cable dealer in Gujarat. Stockist of KEI 11kV/33kV HT XLPE power cables, rubber trailing cables, control cables & fire survival cables.",
    h1: "KEI Cable Dealer & Industrial Stockist in Gujarat",
    subtitle:
      "Premier sourcing partner for KEI Industries heavy industrial cables, medium and high-voltage distribution lines, and specialized rubber trailing cables across Gujarat industrial corridors.",
    heroHighlights: [
      "Heavy HT/LT Drum Allocation Direct from Factory & Aslali Stockyard",
      "11kV & 33kV Triple Extruded XLPE Power Cables with CPRI Test Reports",
      "Specialty EPR / Silicon Rubber Trailing Cables for Cranes & Mining",
      "Complete Engineering Project Sourcing with Transporter LR Tracking",
    ],
    authorizedStatus: "Industrial Project Partner & Stockist",
    stockCount: "1,500+ KEI SKUs",
    dispatchTime: "Same-Day to 24h (GIDC) / 48-72h (Pan-India)",
    overview:
      "KEI Industries is celebrated for high-reliability heavy power distribution and extra-high voltage transmission. Volamp Elektrikals partners with electrical utilities, EPC contractors, and chemical/refinery infrastructure projects across Dahej, Ankleshwar, Hazira, and Sanand to deliver certified KEI cables on project schedule.",
    popularProducts: [
      {
        name: "KEI 11kV (E) 3C x 300 sqmm Aluminium XLPE Armoured Cable",
        sku: "KEI-HT-11KV-300",
        spec: "Screened, Conductor & Insulation Screen Triple Extruded, Strip Armoured, IS:7098 (Part 2)",
        application: "Utility Substation Feeders & Industrial Primary Distribution",
      },
      {
        name: "KEI 33kV (E) 3C x 400 sqmm Aluminium XLPE Armoured Cable",
        sku: "KEI-HT-33KV-400",
        spec: "Cross-linked Polyethylene, Semi-conducting Screen, Round Wire Armour, Heavy Duty",
        application: "Grid Substation Interconnections & 200MW Solar Park Lines",
      },
      {
        name: "KEI Flexible Rubber Trailing Cable (3C x 35 sqmm)",
        sku: "KEI-RUB-3C35",
        spec: "Tinned Copper Conductor, EPR Insulation, Tough Chloroprene (PCP) Heavy Duty Sheath",
        application: "Overhead Gantry Cranes, Hoists & Marine Port Equipment",
      },
    ],
    complianceStandards: [
      "IS 7098 (Part 2): Cross-linked Polyethylene Insulated Cables for Working Voltages from 3.3kV up to 33kV",
      "IS 9968 (Part 1 & 2): Elastomer Insulated Cables (Rubber)",
      "IEC 60502-2: Power Cables with Extruded Insulation for Rated Voltages from 6kV to 30kV",
    ],
    faq: [
      {
        q: "Can Volamp supply custom cut lengths for KEI HT cables?",
        a: "Yes. For project requirements, we can provide cut-to-length drums or arrange custom factory drum lengths direct from KEI manufacturing plants.",
      },
    ],
  },
  "schneider-electric-ahmedabad": {
    slug: "schneider-electric-ahmedabad",
    brand: "Schneider Electric",
    categoryTag: "Air Circuit Breakers (ACB), MCCB, MCB & TeSys Contactors",
    location: "Ahmedabad, Gujarat",
    metaTitle: "Schneider Electric Switchgear Distributor Ahmedabad | Volamp",
    metaDescription:
      "Authorized Schneider Electric distributor in Ahmedabad. Acti9 MCBs, EasyPact MCCBs, TeSys contactors, motor starters & power distribution enclosures.",
    h1: "Schneider Electric Switchgear Distributor in Ahmedabad",
    subtitle:
      "Authorized wholesale channel partner for Schneider Electric power distribution, circuit protection, motor control, and industrial automation equipment in Gujarat.",
    heroHighlights: [
      "Complete Range: Acti9, EasyPact CVS/EZC, TeSys D & Compact NSX",
      "Short-Circuit Protection Ratings from 10kA to 100kA Certified",
      "Genuine Factory Warranties & Technical Sizing Support by Engineers",
      "Rapid Dispatch to Panel Builders & Manufacturing Plants",
    ],
    authorizedStatus: "Authorized Industrial Channel Partner",
    stockCount: "800+ Switchgear Items",
    dispatchTime: "Same-Day Dispatch",
    overview:
      "Schneider Electric is the global benchmark in electrical protection, digital energy management, and industrial safety. Volamp Elektrikals stocks the complete portfolio of low-voltage switchgear for switchboard manufacturers, automation contractors, and industrial plants throughout Ahmedabad and Gujarat.",
    popularProducts: [
      {
        name: "Schneider EasyPact CVS 4-Pole 250A 36kA MCCB",
        sku: "SCH-CVS-250A",
        spec: "Thermal-Magnetic Trip Unit (TMD), Adjustable Overload (0.7-1.0x In), IEC 60947-2",
        application: "Main Distribution Board Incomer Protection",
      },
      {
        name: "Schneider Acti9 iC60N 4-Pole 63A C-Curve MCB",
        sku: "SWG-000001",
        spec: "10kA Breaking Capacity, VisiTrip & VisiSafe Indicators, Bi-connect Terminals",
        application: "Motor & Lighting Sub-distribution Protection",
      },
      {
        name: "Schneider TeSys D 3-Pole 32A AC-3 Contactor (220V Coil)",
        sku: "SCH-LC1D32",
        spec: "EverLink Biconnect Terminals, Built-in 1NO + 1NC Auxiliary Contacts, High Mechanical Life",
        application: "Direct-On-Line (DOL) & Star-Delta Motor Starters",
      },
    ],
    complianceStandards: [
      "IEC / EN 60947-2: Low-Voltage Circuit Breakers (MCCB / ACB)",
      "IS / IEC 60898-1: Electrical Accessories - Circuit-breakers for Household and Similar Installations (MCB)",
      "IEC 60947-4-1: Contactors and Motor-starters",
    ],
    faq: [
      {
        q: "Are the Schneider Electric switchgear products covered by warranty?",
        a: "Yes. All Schneider Electric products sold by Volamp Elektrikals come with full official manufacturer warranties and test certificates.",
      },
    ],
  },
  "industrial-gidc-hubs": {
    slug: "industrial-gidc-hubs",
    brand: "Volamp Regional Logistics",
    categoryTag: "Express Supply to Vatva, Sanand, Naroda, Changodar, Dahej & Ankleshwar",
    location: "Gujarat GIDC Industrial Corridors",
    metaTitle: "Electrical Supplier for Sanand, Vatva & Naroda GIDC | Volamp",
    metaDescription:
      "Dedicated electrical & cable supplier for Sanand, Vatva, Naroda, Changodar, Dahej & Ankleshwar GIDC. Same-day emergency delivery & wholesale pricing.",
    h1: "Electrical Supplier for Sanand, Vatva & Naroda GIDC Zones",
    subtitle:
      "Dedicated logistics corridors delivering genuine industrial power cables, switchgear, and earthing supplies directly to factory gates across Gujarat GIDC industrial estates.",
    heroHighlights: [
      "Strategic Aslali Stockyard Situated Directly on NH-48 & SP Ring Road",
      "Same-Day Urgent Dispatch for Plant Maintenance & Breakdown Emergencies",
      "Authorized Dealer for Polycab, Finolex, KEI, Schneider & Dowells",
      "GST-Compliant E-Way Bill Generation & Transporter Vehicle Tracking",
    ],
    authorizedStatus: "Regional Logistics Hub & Master Distributor",
    stockCount: "3,385+ SKUs in Stock",
    dispatchTime: "Same-Day / Within 4-6 Hours",
    overview:
      "Gujarat's industrial growth is powered by its premier GIDC manufacturing clusters: the automotive corridor of Sanand, the chemical and pharmaceutical estates of Vatva and Naroda, the engineering hubs of Changodar, and the petroleum/chemical complexes of Dahej and Ankleshwar. Volamp Elektrikals acts as the vital electrical backbone for these zones.",
    popularProducts: [
      {
        name: "Chemical Resistant 1.1kV XLPE Armoured Power Cables",
        sku: "CAB-000001",
        spec: "Tough Outer PVC / FRLS Sheath Resistant to Corrosive Chemical Fumes (IS:7098)",
        application: "Vatva & Ankleshwar Chemical Plants",
      },
      {
        name: "Motor Control Switchgear & Heavy Duty Starters",
        sku: "SWG-000001",
        spec: "10kA to 50kA Breakers with TeSys Contactors for Continuous Production Lines",
        application: "Sanand Auto OEMs & Engineering Facilities",
      },
      {
        name: "CPRI Certified Maintenance-Free Chemical Earthing Electrodes",
        sku: "EAR-001",
        spec: "Pure Copper Bonded Rods (250 Microns) with Bentonite Backfill Compound",
        application: "Plant Transformer Yards & Sensitive PLC Earthing",
      },
    ],
    complianceStandards: [
      "CEA Safety Regulations for Industrial Electrical Installations",
      "IS 3043: Code of Practice for Earthing",
      "IS 7098 & IS 1554: Factory Power Distribution Compliance",
    ],
    faq: [
      {
        q: "How fast can Volamp deliver to Sanand or Vatva GIDC during an emergency breakdown?",
        a: "From our Aslali highway hub, we can dispatch urgent stock cables, lugs, or replacement switchgear within 2 to 4 hours directly to your plant gate via dedicated express transport.",
      },
    ],
  },
};

export default function BrandCityLandingPage() {
  const [, params] = useRoute("/dealers/:slug");
  const [, locationParams] = useRoute("/locations/:slug");

  const slug = params?.slug || locationParams?.slug || "polycab-ahmedabad";
  const data = BRAND_HUBS[slug] || BRAND_HUBS["polycab-ahmedabad"];

  const [rfqName, setRfqName] = useState("");
  const [rfqEmail, setRfqEmail] = useState("");
  const [rfqPhone, setRfqPhone] = useState("");
  const [rfqNotes, setRfqNotes] = useState("");

  const handleQuickQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqEmail || !rfqPhone) {
      toast.error("Please provide your email and phone number.");
      return;
    }
    toast.success("RFQ Submitted Successfully!", {
      description: `Our ${data.brand} engineering desk will send quotation to ${rfqEmail} within 2 hours.`,
    });
    setRfqName("");
    setRfqEmail("");
    setRfqPhone("");
    setRfqNotes("");
  };

  return (
    <div className="min-h-screen bg-[#fdfbf9] text-[#0b1f33] font-['Plus_Jakarta_Sans',sans-serif] flex flex-col">
      <SeoHead
        title={data.metaTitle}
        description={data.metaDescription}
        canonicalPath={`/dealers/${data.slug}`}
      />

      <UniversalHeader currentPage="products" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf8f5] via-[#fdfbf9] to-white border-b border-[#ebd7c7] py-14 sm:py-20">
          <div className="market-container max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f7ede6] border border-[#ebd4c2] text-xs font-bold text-[#c56718] uppercase tracking-wider">
                  <Award className="size-3.5 text-[#c56718]" />
                  <span>{data.authorizedStatus}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#4d1217] leading-tight tracking-tight">
                  {data.h1}
                </h1>

                <p className="text-sm sm:text-base text-[#5d4a4b] leading-relaxed max-w-2xl">
                  {data.subtitle}
                </p>

                {/* Key Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white border border-[#ebd7c7] shadow-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block">Inventory Depth</span>
                    <strong className="text-sm font-bold text-[#4d1217]">{data.stockCount}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#ebd7c7] shadow-xs">
                    <span className="text-[11px] font-semibold text-slate-500 block">Dispatch Window</span>
                    <strong className="text-sm font-bold text-[#c56718]">{data.dispatchTime}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-[#ebd7c7] shadow-xs col-span-2 sm:col-span-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">Test Certification</span>
                    <strong className="text-sm font-bold text-emerald-700">100% Genuine MTC</strong>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-3">
                  <Link
                    href="/enquire"
                    className="px-6 py-3 rounded-xl bg-[#c56718] hover:bg-[#b45309] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-amber-500/20 inline-flex items-center gap-2"
                  >
                    <span>Request Bulk {data.brand} Quote</span>
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/price-list"
                    className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-[#ebd7c7] text-[#4d1217] text-xs sm:text-sm font-bold transition-all inline-flex items-center gap-2"
                  >
                    <Download className="size-4 text-[#c56718]" />
                    <span>Download 2026 Price List</span>
                  </Link>
                </div>
              </div>

              {/* Quick RFQ Box */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl border border-[#ebd7c7] p-6 shadow-xl space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-[#c56718] text-xs font-bold uppercase tracking-wider">
                      <FileText className="size-4" />
                      <span>Direct Project Sourcing Desk</span>
                    </div>
                    <h3 className="text-lg font-bold text-[#4d1217] mt-1">Get Instant {data.brand} BOQ Price</h3>
                    <p className="text-xs text-[#5d4a4b]">Guaranteed wholesale contractor discounts within 2 business hours.</p>
                  </div>

                  <form onSubmit={handleQuickQuote} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Contact Name / Company</label>
                      <Input
                        required
                        placeholder="e.g. Ramesh Patel (Apex Infra)"
                        value={rfqName}
                        onChange={(e) => setRfqName(e.target.value)}
                        className="text-xs h-9 border-[#ebd7c7]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Work Email</label>
                      <Input
                        required
                        type="email"
                        placeholder="procurement@company.com"
                        value={rfqEmail}
                        onChange={(e) => setRfqEmail(e.target.value)}
                        className="text-xs h-9 border-[#ebd7c7]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mobile / WhatsApp</label>
                      <Input
                        required
                        placeholder="+91 98765 43210"
                        value={rfqPhone}
                        onChange={(e) => setRfqPhone(e.target.value)}
                        className="text-xs h-9 border-[#ebd7c7]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">Cable Sizes & Quantities Needed</label>
                      <textarea
                        rows={2}
                        placeholder="e.g. 3.5C x 185 sqmm (1,200m), 4C x 16 sqmm (500m)"
                        value={rfqNotes}
                        onChange={(e) => setRfqNotes(e.target.value)}
                        className="w-full text-xs rounded-lg border border-[#ebd7c7] p-2 focus:ring-1 focus:ring-[#c56718] outline-none"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-[#c56718] hover:bg-[#b45309] text-white font-bold text-xs h-10 shadow-md">
                      Submit RFQ for Priority Discount
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview & Key Capabilities */}
        <section className="market-container max-w-6xl py-12 sm:py-16 space-y-12">
          <div className="bg-white rounded-2xl border border-[#ebd7c7] p-6 sm:p-10 shadow-xs space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#4d1217]">
              Authorized Distribution Credentials & Infrastructure Footprint
            </h2>
            <p className="text-sm text-[#5d4a4b] leading-relaxed">
              {data.overview}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {data.heroHighlights.map((highlight, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#fbf8f5] border border-[#ebd7c7] space-y-2">
                  <CheckCircle2 className="size-5 text-[#c56718]" />
                  <p className="text-xs font-semibold text-[#4d1217] leading-snug">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Products in this Line */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#4d1217]">
                  Fast-Moving {data.brand} Items in Aslali Stockyard
                </h2>
                <p className="text-xs sm:text-sm text-[#5d4a4b]">
                  Ready for immediate drum allocation or dispatch within 24 hours.
                </p>
              </div>
              <Link
                href={`/products?search=${encodeURIComponent(data.brand)}`}
                className="text-xs font-bold text-[#c56718] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
              >
                <span>Browse All {data.brand} Products</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.popularProducts.map((prod, idx) => (
                <div key={idx} className="bg-white p-5 rounded-2xl border border-[#ebd7c7] shadow-xs space-y-3 hover:border-[#c56718] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#c56718] uppercase bg-[#f7ede6] px-2 py-0.5 rounded">
                        SKU: {prod.sku}
                      </span>
                      <h4 className="text-sm font-bold text-[#4d1217] mt-1.5 leading-snug">
                        <Link href={`/product/${prod.sku}`} className="hover:text-[#c56718]">
                          {prod.name}
                        </Link>
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{prod.spec}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500 font-medium">Application: <strong className="text-slate-700">{prod.application}</strong></span>
                    <Link
                      href={`/product/${prod.sku}`}
                      className="font-bold text-[#c56718] hover:underline"
                    >
                      View Specs &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Standards Section */}
          <div className="bg-[#f7ede6] rounded-2xl border border-[#ebd4c2] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-[#c56718] font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="size-4" />
              <span>Tested & Certified Compliance Standards</span>
            </div>
            <h3 className="text-lg font-bold text-[#4d1217]">
              Strict Adherence to Bureau of Indian Standards (BIS) & IEC Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {data.complianceStandards.map((std, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[#5d4a4b] bg-white p-3 rounded-lg border border-[#ebd7c7]">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span>{std}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-[#4d1217]">
              Frequently Asked Questions: {data.brand} Supply in {data.location}
            </h3>
            <div className="space-y-3">
              {data.faq.map((item, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-[#ebd7c7] p-5 shadow-xs space-y-2">
                  <h4 className="text-sm font-bold text-[#4d1217]">{item.q}</h4>
                  <p className="text-xs text-[#5d4a4b] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <UniversalFooter />
    </div>
  );
}
