export interface CatalogItem {
  id: string;
  brand: string;
  title: string;
  category: "power-cables" | "flexible-wires" | "switchgear" | "solar" | "accessories";
  docType: "Master Price List" | "Discount Circular" | "Technical Catalog" | "Specification Guide";
  effectiveDate: string;
  circularNo?: string;
  discountNote: string;
  fileFormat: "PDF" | "XLSX";
  fileSize: string;
  pages?: number;
  downloadUrl: string;
  isCustom?: boolean;
  uploadedAt?: string;
  description: string;
}

export interface BrandInfo {
  name: string;
  fullName: string;
  badge: string;
  accent: string;
  bgLight: string;
  border: string;
  tagline: string;
}

export const BRAND_DATA: BrandInfo[] = [
  {
    name: "Polycab",
    fullName: "Polycab India Ltd.",
    badge: "Master Distributor",
    accent: "#c56718",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-900/50",
    tagline: "India's #1 Wires & Cables Manufacturer",
  },
  {
    name: "Havells",
    fullName: "Havells India Ltd.",
    badge: "Authorized Partner",
    accent: "#b91c1c",
    bgLight: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-900/50",
    tagline: "Premier Switchgear, DBs & Industrial Flexibles",
  },
  {
    name: "RR Kabel",
    fullName: "RR Kabel Ltd.",
    badge: "Authorized Distributor",
    accent: "#d97706",
    bgLight: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-200 dark:border-orange-900/50",
    tagline: "Pioneers of Firex & LSOH German Engineering",
  },
  {
    name: "KEI Industries",
    fullName: "KEI Industries Ltd.",
    badge: "Industrial Partner",
    accent: "#0284c7",
    bgLight: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-900/50",
    tagline: "Global Power & Extra High Voltage (EHV) Specialist",
  },
  {
    name: "Finolex",
    fullName: "Finolex Cables Ltd.",
    badge: "Authorized Stockist",
    accent: "#059669",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-900/50",
    tagline: "Pure Electrolytic Copper House & Industrial Wires",
  },
  {
    name: "Schneider Electric",
    fullName: "Schneider Electric India",
    badge: "Direct Distribution",
    accent: "#16a34a",
    bgLight: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-900/50",
    tagline: "World-Class Acti9, EasyPact MCCBs & Automation",
  },
  {
    name: "L&T (Lauritz Knudsen)",
    fullName: "Lauritz Knudsen by Schneider",
    badge: "Certified Partner",
    accent: "#4338ca",
    bgLight: "bg-indigo-50 dark:bg-indigo-950/30",
    border: "border-indigo-200 dark:border-indigo-900/50",
    tagline: "Iconic Omega, dsine MCCBs & Heavy Motor Starters",
  },
  {
    name: "Volamp OEM & Dowells",
    fullName: "Volamp OEM & Dowells Accessories",
    badge: "In-House & Exclusive",
    accent: "#7c2d12",
    bgLight: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-800",
    tagline: "Tested Heavy Conductor Cables, Lugs & Earthing",
  },
];

export const INITIAL_CATALOGS: CatalogItem[] = [
  // 1. Polycab
  {
    id: "poly-01",
    brand: "Polycab",
    title: "Polycab Industrial Power & Control Cables Master Price List 2026",
    category: "power-cables",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 15, 2026",
    circularNo: "POL/CBL/2026-Q4/01",
    discountNote: "Standard Contractor Discount: 40% OFF + 5% Cash Discount",
    fileFormat: "PDF",
    fileSize: "5.8 MB",
    pages: 64,
    downloadUrl: "/catalogs/polycab-industrial-cables-2026.pdf",
    description: "Complete price list for 1.1kV LT XLPE/PVC Armoured & Unarmoured Aluminium/Copper cables, plus 11kV/33kV HT cables.",
  },
  {
    id: "poly-02",
    brand: "Polycab",
    title: "Polycab Green Wire FRLS-H Domestic & Building Wires Price Schedule",
    category: "flexible-wires",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 01, 2026",
    circularNo: "POL/WIR/2026-10/42",
    discountNote: "Contractor Base: 38% OFF List Price",
    fileFormat: "PDF",
    fileSize: "3.2 MB",
    pages: 32,
    downloadUrl: "/catalogs/polycab-green-wire-frlsh-2026.pdf",
    description: "Flame retardant low smoke and halogen single-core building wires from 0.75 sq.mm to 16 sq.mm with 90m and 180m reels.",
  },
  {
    id: "poly-03",
    brand: "Polycab",
    title: "Polycab 1500V DC Solar Photovoltaic Cables Technical Catalog",
    category: "solar",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. September 2026",
    circularNo: "POL/SOL/2026/09",
    discountNote: "Commercial Solar Project Tier Discount: 42% OFF",
    fileFormat: "PDF",
    fileSize: "4.1 MB",
    pages: 28,
    downloadUrl: "/catalogs/polycab-solar-dc-cables.pdf",
    description: "TUV Rhineland certified 1500V DC cross-linked polyolefin solar cables, UV and ozone resistant for utility and rooftop arrays.",
  },
  {
    id: "poly-04",
    brand: "Polycab",
    title: "Polycab Submersible Flat 3-Core Cables Price Circular",
    category: "power-cables",
    docType: "Discount Circular",
    effectiveDate: "W.E.F. October 2026",
    circularNo: "POL/SUB/2026/08",
    discountNote: "Agriculture & Borewell Special: 37% OFF",
    fileFormat: "PDF",
    fileSize: "2.4 MB",
    pages: 16,
    downloadUrl: "/catalogs/polycab-submersible-cables.pdf",
    description: "Waterproof tough PVC sheathed flat 3-core cables engineered for deep borewells, agricultural pumps and irrigation networks.",
  },

  // 2. Havells
  {
    id: "hav-01",
    brand: "Havells",
    title: "Havells Industrial Switchgear & Distribution Boards Master Price List",
    category: "switchgear",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 10, 2026",
    circularNo: "HAV/SWG/2026-27/04",
    discountNote: "OEM & Panel Builder Discount: 45% + 7.5% Off",
    fileFormat: "PDF",
    fileSize: "7.2 MB",
    pages: 88,
    downloadUrl: "/catalogs/havells-switchgear-pricelist-2026.pdf",
    description: "Complete catalog for Euroline MCBs, RCCBs, Isolators, MCCBs up to 800A, Air Circuit Breakers (ACBs) & modular DBs.",
  },
  {
    id: "hav-02",
    brand: "Havells",
    title: "Havells LifeLine Plus S3 HRFR Industrial Flexible Wires List",
    category: "flexible-wires",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 01, 2026",
    circularNo: "HAV/WIR/2026/19",
    discountNote: "Standard Contractor Rebate: 39% OFF",
    fileFormat: "PDF",
    fileSize: "3.6 MB",
    pages: 24,
    downloadUrl: "/catalogs/havells-lifeline-plus-wires.pdf",
    description: "Heat resistant flame retardant 100% pure copper multi-strand building and panel wires engineered for high thermal loads.",
  },
  {
    id: "hav-03",
    brand: "Havells",
    title: "Havells Heavy Duty LT XLPE Power Cables Tariff Circular",
    category: "power-cables",
    docType: "Discount Circular",
    effectiveDate: "W.E.F. September 2026",
    circularNo: "HAV/CBL/2026-09/11",
    discountNote: "Volume Project Tier: 41% OFF + Site Delivery",
    fileFormat: "PDF",
    fileSize: "4.8 MB",
    pages: 40,
    downloadUrl: "/catalogs/havells-lt-power-cables.pdf",
    description: "Aluminium and Copper conductor armoured power cables certified to IS:7098 (Part 1) with anti-rodent and anti-termite outer sheaths.",
  },

  // 3. RR Kabel
  {
    id: "rr-01",
    brand: "RR Kabel",
    title: "RR Kabel Firex LSOH & Superex Industrial Wires Master Price List",
    category: "flexible-wires",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 01, 2026",
    circularNo: "RRK/DOM/2026/10",
    discountNote: "Trade Discount: 38% OFF List",
    fileFormat: "PDF",
    fileSize: "4.5 MB",
    pages: 36,
    downloadUrl: "/catalogs/rr-kabel-firex-pricelist.pdf",
    description: "German-engineered low smoke zero halogen flame retardant cables compliant with REACH and RoHS European environmental directives.",
  },
  {
    id: "rr-02",
    brand: "RR Kabel",
    title: "RR Kabel Ratnaflex Control & Multi-Core Flexible Cables Catalog",
    category: "power-cables",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. September 15, 2026",
    circularNo: "RRK/IND/2026/05",
    discountNote: "Panel Builder Special: 42% OFF",
    fileFormat: "PDF",
    fileSize: "5.1 MB",
    pages: 48,
    downloadUrl: "/catalogs/rr-kabel-ratnaflex-control.pdf",
    description: "Flexible copper conductor control cables from 2-core to 61-core with PVC and braided screening for industrial machine tooling.",
  },
  {
    id: "rr-03",
    brand: "RR Kabel",
    title: "RR Kabel Solar DC Cable 1.5kV Photovoltaic Specification",
    category: "solar",
    docType: "Specification Guide",
    effectiveDate: "W.E.F. August 2026",
    circularNo: "RRK/SOL/2026/03",
    discountNote: "Solar EPC Bulk Tier: 43.5% OFF",
    fileFormat: "PDF",
    fileSize: "2.8 MB",
    pages: 20,
    downloadUrl: "/catalogs/rr-kabel-solar-cables.pdf",
    description: "Electron beam cross-linked halogen-free solar cables engineered for 25+ years operating life in harsh weather and desert climates.",
  },

  // 4. KEI Industries
  {
    id: "kei-01",
    brand: "KEI Industries",
    title: "KEI Extra High Voltage (EHV) & HT XLPE Power Cables Technical Guide",
    category: "power-cables",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. October 2026",
    circularNo: "KEI/EHV/2026-Q4/02",
    discountNote: "Turnkey EPC Tender Rebate: 36% OFF",
    fileFormat: "PDF",
    fileSize: "8.5 MB",
    pages: 96,
    downloadUrl: "/catalogs/kei-ehv-ht-cables.pdf",
    description: "11kV, 33kV, 66kV, 132kV and 220kV XLPE insulated heavy underground power transmission cables with CCV extrusion line purity.",
  },
  {
    id: "kei-02",
    brand: "KEI Industries",
    title: "KEI LT Armoured Aluminium & Copper Power Cables Price List",
    category: "power-cables",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 12, 2026",
    circularNo: "KEI/LT/2026/10",
    discountNote: "Standard Contractor Discount: 41% OFF",
    fileFormat: "PDF",
    fileSize: "6.2 MB",
    pages: 52,
    downloadUrl: "/catalogs/kei-lt-armoured-cables.pdf",
    description: "Complete list of 1.1kV crosslinked polyethylene aluminium and copper conductor cables with galvanized steel round wire and strip armour.",
  },
  {
    id: "kei-03",
    brand: "KEI Industries",
    title: "KEI Homecab & Banfire FR-LSH House Wires Schedule",
    category: "flexible-wires",
    docType: "Discount Circular",
    effectiveDate: "W.E.F. October 01, 2026",
    circularNo: "KEI/DOM/2026/09",
    discountNote: "Electrician & Retailer Rate: 39% OFF",
    fileFormat: "PDF",
    fileSize: "3.1 MB",
    pages: 22,
    downloadUrl: "/catalogs/kei-homecab-wires.pdf",
    description: "Zero toxin flame-retardant house wires with high oxygen index for modern high-rise residential towers and commercial complexes.",
  },

  // 5. Finolex
  {
    id: "fin-01",
    brand: "Finolex",
    title: "Finolex Pure Electrolytic Copper Wires & Flexible Cables Price List",
    category: "flexible-wires",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 01, 2026",
    circularNo: "FIN/WIR/2026-10/01",
    discountNote: "Official Distributor Price: 37.5% OFF List",
    fileFormat: "PDF",
    fileSize: "4.9 MB",
    pages: 44,
    downloadUrl: "/catalogs/finolex-cables-master-pricelist.pdf",
    description: "India's trusted 99.97% bright annealed electrolytic grade copper wires with FR and FRLSH insulation for residential and commercial loads.",
  },
  {
    id: "fin-02",
    brand: "Finolex",
    title: "Finolex Industrial Submersible & 3-Core Flat Cable Circular",
    category: "power-cables",
    docType: "Discount Circular",
    effectiveDate: "W.E.F. September 2026",
    circularNo: "FIN/SUB/2026/07",
    discountNote: "Borewell & Agro Rate: 38% OFF",
    fileFormat: "PDF",
    fileSize: "2.7 MB",
    pages: 18,
    downloadUrl: "/catalogs/finolex-submersible-cables.pdf",
    description: "Water-impervious PVC jacketed 3-core flat cables manufactured specifically to power agricultural submersible motors in deep wells.",
  },
  {
    id: "fin-03",
    brand: "Finolex",
    title: "Finolex Coaxial, LAN & Telephone Communication Cables Guide",
    category: "accessories",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. August 2026",
    circularNo: "FIN/TEL/2026/04",
    discountNote: "Networking Bulk Rate: 42% OFF",
    fileFormat: "PDF",
    fileSize: "3.4 MB",
    pages: 26,
    downloadUrl: "/catalogs/finolex-lan-coaxial-cables.pdf",
    description: "High speed Cat6, Cat6A UTP LAN cables, RG-6 coaxial cables, and multi-pair telecommunication cables with high cross-talk suppression.",
  },

  // 6. Schneider Electric
  {
    id: "sch-01",
    brand: "Schneider Electric",
    title: "Schneider Electric Acti9 Final Distribution & EasyPact Master Price List 2026",
    category: "switchgear",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 15, 2026",
    circularNo: "SCH/FD/2026-27/02",
    discountNote: "Panel Builder / OEM Rate: 46% + 5% OFF",
    fileFormat: "PDF",
    fileSize: "9.1 MB",
    pages: 112,
    downloadUrl: "/catalogs/schneider-acti9-easypact-2026.pdf",
    description: "Industry benchmark Acti9 xC60 MCBs, Vigi RCCBs, EasyPact CVS/EZC moulded case circuit breakers from 16A to 630A, plus Prisma iPM DBs.",
  },
  {
    id: "sch-02",
    brand: "Schneider Electric",
    title: "Schneider TeSys Motor Starters, Contactors & Overload Relays Catalog",
    category: "switchgear",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. September 2026",
    circularNo: "SCH/MOT/2026/08",
    discountNote: "Industrial Automation Tier: 44% OFF",
    fileFormat: "PDF",
    fileSize: "6.8 MB",
    pages: 76,
    downloadUrl: "/catalogs/schneider-tesys-starters.pdf",
    description: "TeSys D, TeSys K and TeSys F AC-3 rated power contactors, thermal-magnetic circuit breakers (MPCBs) and electronic protection relays.",
  },
  {
    id: "sch-03",
    brand: "Schneider Electric",
    title: "Schneider EasyPact MVS Air Circuit Breakers (ACB) 800A - 4000A Schedule",
    category: "switchgear",
    docType: "Discount Circular",
    effectiveDate: "W.E.F. October 2026",
    circularNo: "SCH/ACB/2026/05",
    discountNote: "Substation Project Tier: 48% OFF",
    fileFormat: "PDF",
    fileSize: "5.5 MB",
    pages: 42,
    downloadUrl: "/catalogs/schneider-easypact-mvs-acb.pdf",
    description: "Drawout and fixed type 3-pole and 4-pole ACBs with micro-processor based trip units, certified for electrical utility incomer panels.",
  },

  // 7. L&T (Lauritz Knudsen)
  {
    id: "lnt-01",
    brand: "L&T (Lauritz Knudsen)",
    title: "Lauritz Knudsen (L&T) Omega & dsine MCCB / Switchgear Master Price List",
    category: "switchgear",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 01, 2026",
    circularNo: "LK/SWG/2026-10/01",
    discountNote: "Authorized Switchgear Partner: 44% + 6% OFF",
    fileFormat: "PDF",
    fileSize: "8.2 MB",
    pages: 104,
    downloadUrl: "/catalogs/lk-lt-switchgear-pricelist-2026.pdf",
    description: "Complete Lauritz Knudsen switchgear price list: dsine MCCBs, Omega Air Circuit Breakers, changeover switches, and industrial switchboards.",
  },
  {
    id: "lnt-02",
    brand: "L&T (Lauritz Knudsen)",
    title: "Lauritz Knudsen (L&T) MK1 & ML Motor Starters / Submersible Starters",
    category: "switchgear",
    docType: "Master Price List",
    effectiveDate: "W.E.F. September 2026",
    circularNo: "LK/MOT/2026/09",
    discountNote: "Agricultural & Industrial: 42% OFF",
    fileFormat: "PDF",
    fileSize: "4.3 MB",
    pages: 36,
    downloadUrl: "/catalogs/lk-motor-starters.pdf",
    description: "India's highest selling MK1 direct-on-line (DOL) and star-delta starters, relay units, contactors, and automatic motor pump controllers.",
  },
  {
    id: "lnt-03",
    brand: "L&T (Lauritz Knudsen)",
    title: "Lauritz Knudsen AU Series Modular MCBs & RCCBs Technical Catalog",
    category: "switchgear",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. October 2026",
    circularNo: "LK/MCB/2026/04",
    discountNote: "Residential & Commercial Rate: 40% OFF",
    fileFormat: "PDF",
    fileSize: "3.9 MB",
    pages: 30,
    downloadUrl: "/catalogs/lk-au-series-mcb.pdf",
    description: "10kA breaking capacity C-curve and D-curve miniature circuit breakers, bi-connect terminals, and earth leakage protection devices.",
  },

  // 8. Volamp OEM & Dowells
  {
    id: "vol-01",
    brand: "Volamp OEM & Dowells",
    title: "Volamp Heavy-Duty Tested XLPE Power & Control Cables OEM Tariff 2026",
    category: "power-cables",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 15, 2026",
    circularNo: "VOL/OEM/2026-Q4/01",
    discountNote: "Factory Direct Pricing: 42% OFF List + Express Gujarat Dispatch",
    fileFormat: "PDF",
    fileSize: "6.4 MB",
    pages: 58,
    downloadUrl: "/catalogs/volamp-oem-power-cables-2026.pdf",
    description: "Volamp factory direct 1.1kV XLPE/PVC Aluminium Armoured cables, copper control cables, and flexible wires with batch test certificates.",
  },
  {
    id: "vol-02",
    brand: "Volamp OEM & Dowells",
    title: "Dowells Copper & Aluminium Compression Cable Lugs Master Price List",
    category: "accessories",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 01, 2026",
    circularNo: "DOW/LUG/2026/10",
    discountNote: "Direct Electrical Contractor Rebate: 48% OFF",
    fileFormat: "PDF",
    fileSize: "3.7 MB",
    pages: 32,
    downloadUrl: "/catalogs/dowells-cable-lugs-pricelist.pdf",
    description: "Heavy duty electro-tinned tubular copper lugs, aluminium terminal ends, inline connectors and bi-metallic friction welded lugs.",
  },
  {
    id: "vol-03",
    brand: "Volamp OEM & Dowells",
    title: "Dowells Weatherproof Double Compression Brass Cable Glands Catalog",
    category: "accessories",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. September 2026",
    circularNo: "DOW/GLD/2026/06",
    discountNote: "Bulk Order Rate: 45% OFF",
    fileFormat: "PDF",
    fileSize: "2.9 MB",
    pages: 24,
    downloadUrl: "/catalogs/dowells-brass-glands.pdf",
    description: "Flameproof (Ex-d) and weatherproof double compression brass nickel-plated cable glands certified for hazardous zone 1 & 2.",
  },
  {
    id: "vol-04",
    brand: "Volamp OEM & Dowells",
    title: "Volamp Maintenance-Free Chemical Earthing Electrodes & BFC Schedule",
    category: "accessories",
    docType: "Discount Circular",
    effectiveDate: "W.E.F. October 2026",
    circularNo: "VOL/ERT/2026/10",
    discountNote: "Contractor Direct: 40% OFF with Test Report",
    fileFormat: "PDF",
    fileSize: "2.1 MB",
    pages: 18,
    downloadUrl: "/catalogs/volamp-chemical-earthing.pdf",
    description: "Pure copper bonded and GI pipe-in-pipe chemical earthing electrodes with carbon-based backfill ground enhancement compound.",
  },
];

export const STORAGE_KEY = "volamp_custom_catalogs_v1";

/**
 * Downloads a structured reference text document blob simulating the real PDF/price list.
 */
export function downloadPriceListBlob(catalog: CatalogItem) {
  const content = `========================================================================
VOLAMP ELEKTRIKALS PVT. LTD. - OFFICIAL PRICE LIST / CATALOG SUMMARY
========================================================================
Brand:               ${catalog.brand}
Document:            ${catalog.title}
Circular Reference:  ${catalog.circularNo || "VOL/CERT/2026"}
Effective Date:      ${catalog.effectiveDate}
Document Type:       ${catalog.docType}
Category:            ${catalog.category.toUpperCase().replace("-", " ")}
Format:              ${catalog.fileFormat} (${catalog.fileSize})
Contractor Discount: ${catalog.discountNote}
========================================================================

DOCUMENT OVERVIEW:
${catalog.description}

WHOLESALE PRICING & DISPATCH POLICY:
• Direct wholesale discounts of up to 48% OFF list prices applied on order.
• Ready inventory in Central Ahmedabad Depot: 3,385+ certified SKUs.
• Same-day dispatch across Gujarat and express PAN-India delivery.
• CPRI / ERDA / ISI / BIS test certificates accompanied with invoice.
• GST Input Tax Credit (ITC) compliant B2B tax invoicing.

ORDERING CONTACTS (VOLAMP SALES DESK):
Phone / Mobile:      +91 95123 65582
Sales Desk WhatsApp: +91 95123 65582
Sales Email:         sales@volamp.com / quotes@volamp.com
Website:             https://www.volamp.com / https://www.volamp.com/price-list
Central Depot:       Ahmedabad - Aslali Express Bypass, Gujarat, India
========================================================================`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${catalog.brand.replace(/\s+/g, "_")}_${catalog.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}_PriceList.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
