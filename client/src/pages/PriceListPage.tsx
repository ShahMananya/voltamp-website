import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import SeoHead from "@/components/seo/SeoHead";
import UniversalHeader from "@/components/layout/UniversalHeader";
import UniversalFooter from "@/components/layout/UniversalFooter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Upload,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  Share2,
  Plus,
  Trash2,
  ShieldCheck,
  Building2,
  Tag,
  ArrowRight,
  Info,
  X,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

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

const BRAND_DATA = [
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

const INITIAL_CATALOGS: CatalogItem[] = [
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
    title: "Havells Heavy Duty LT Armoured Power Cables Price Circular",
    category: "power-cables",
    docType: "Discount Circular",
    effectiveDate: "W.E.F. September 25, 2026",
    circularNo: "HAV/CBL/2026/11",
    discountNote: "Contractor Rate: 41% OFF on Full Drum Bookings",
    fileFormat: "PDF",
    fileSize: "4.8 MB",
    pages: 40,
    downloadUrl: "/catalogs/havells-lt-power-cables.pdf",
    description: "Heavy duty copper & aluminium XLPE insulated steel wire/strip armoured underground power distribution cables.",
  },

  // 3. RR Kabel
  {
    id: "rrk-01",
    brand: "RR Kabel",
    title: "RR Kabel Flamex FRLS & Firex LSOH Building Wires Price List",
    category: "flexible-wires",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 12, 2026",
    circularNo: "RRK/WIR/2026-Q4/02",
    discountNote: "Wholesale Contractor Rate: 40% OFF",
    fileFormat: "PDF",
    fileSize: "4.5 MB",
    pages: 36,
    downloadUrl: "/catalogs/rr-kabel-flamex-wires.pdf",
    description: "European certified low smoke zero halogen (LSOH) and FRLS wires for hospitals, metro rail, multiplexes and residential towers.",
  },
  {
    id: "rrk-02",
    brand: "RR Kabel",
    title: "RR Kabel Industrial Multicore Flexible Shielded Cables Catalog",
    category: "flexible-wires",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. September 2026",
    circularNo: "RRK/FLX/2026/05",
    discountNote: "Machinery Builder Discount: 38% OFF",
    fileFormat: "PDF",
    fileSize: "5.1 MB",
    pages: 44,
    downloadUrl: "/catalogs/rr-kabel-multicore-flexibles.pdf",
    description: "2-core to 61-core flexible PVC control cables with braided screening for industrial automation and machinery cabling.",
  },
  {
    id: "rrk-03",
    brand: "RR Kabel",
    title: "RR Kabel Fire Survival (FS 120/180) Circuit Integrity Technical Brochure",
    category: "power-cables",
    docType: "Specification Guide",
    effectiveDate: "W.E.F. August 2026",
    circularNo: "RRK/FS/2026/01",
    discountNote: "Project Quotation Basis (Custom Formulation)",
    fileFormat: "PDF",
    fileSize: "6.3 MB",
    pages: 52,
    downloadUrl: "/catalogs/rr-kabel-fire-survival.pdf",
    description: "Mica taped 950°C 3-hour fire survival cables maintaining circuit integrity for emergency lighting, lifts and smoke dampers.",
  },

  // 4. KEI Industries
  {
    id: "kei-01",
    brand: "KEI Industries",
    title: "KEI Extra High Voltage (EHV 66kV / 132kV / 220kV) Technical Catalog",
    category: "power-cables",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. October 2026",
    circularNo: "KEI/EHV/2026/03",
    discountNote: "Utility Discom & Transmission Project Terms",
    fileFormat: "PDF",
    fileSize: "8.4 MB",
    pages: 72,
    downloadUrl: "/catalogs/kei-ehv-cables-catalog.pdf",
    description: "CCV line extruded dry cured extra high voltage cross-linked polyethylene cables for GETCO, PGCIL and industrial substations.",
  },
  {
    id: "kei-02",
    brand: "KEI Industries",
    title: "KEI LT & HT XLPE Insulated Armoured Cables Master Price List",
    category: "power-cables",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 16, 2026",
    circularNo: "KEI/CBL/2026-Q4/01",
    discountNote: "Contractor Base: 40% OFF List + 3% Freight Credit",
    fileFormat: "PDF",
    fileSize: "6.0 MB",
    pages: 58,
    downloadUrl: "/catalogs/kei-power-cables-pricelist.pdf",
    description: "Complete range of 3.3kV to 33kV HT cables and 1.1kV LT XLPE cables with copper and aluminium conductors.",
  },
  {
    id: "kei-03",
    brand: "KEI Industries",
    title: "KEI Rubber Trailing, Marine & Mining Flexible Cables Price Schedule",
    category: "flexible-wires",
    docType: "Discount Circular",
    effectiveDate: "W.E.F. September 2026",
    circularNo: "KEI/RUB/2026/07",
    discountNote: "Heavy Industry Discount: 35% OFF",
    fileFormat: "PDF",
    fileSize: "4.7 MB",
    pages: 38,
    downloadUrl: "/catalogs/kei-rubber-trailing-cables.pdf",
    description: "EPR/PCP/CSP elastomeric heavy duty trailing cables for material handling cranes, mining shovels and maritime vessels.",
  },

  // 5. Finolex
  {
    id: "fin-01",
    brand: "Finolex",
    title: "Finolex Flame Retardant (FR) House Wires & Flexible Cables Price List",
    category: "flexible-wires",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 05, 2026",
    circularNo: "FIN/WIR/2026-10/01",
    discountNote: "Wholesale Trade Discount: 39% OFF",
    fileFormat: "PDF",
    fileSize: "3.9 MB",
    pages: 30,
    downloadUrl: "/catalogs/finolex-fr-wires-2026.pdf",
    description: "99.97% pure electrolyte copper grade FR/FRLS insulated flexible wires with 100% current carrying capacity assurance.",
  },
  {
    id: "fin-02",
    brand: "Finolex",
    title: "Finolex 1.1kV Heavy Duty Armoured Power Cables Price Circular",
    category: "power-cables",
    docType: "Discount Circular",
    effectiveDate: "W.E.F. September 28, 2026",
    circularNo: "FIN/CBL/2026/08",
    discountNote: "Contractor Discount: 41% OFF",
    fileFormat: "PDF",
    fileSize: "4.9 MB",
    pages: 42,
    downloadUrl: "/catalogs/finolex-power-cables.pdf",
    description: "Solid and stranded aluminium and copper LT cables with extruded PVC inner sheath and galvanized steel armouring.",
  },
  {
    id: "fin-03",
    brand: "Finolex",
    title: "Finolex CCTV, LAN Cat6 & Communication Cables Brochure",
    category: "accessories",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. August 2026",
    circularNo: "FIN/COM/2026/04",
    discountNote: "System Integrator Discount: 36% OFF",
    fileFormat: "PDF",
    fileSize: "3.1 MB",
    pages: 20,
    downloadUrl: "/catalogs/finolex-communication-cables.pdf",
    description: "High speed 4-pair UTP Cat6 Ethernet, RG-6/RG-59 coaxial cables, and telephone switchboard cables.",
  },

  // 6. Schneider Electric
  {
    id: "sch-01",
    brand: "Schneider Electric",
    title: "Schneider Acti9 & EasyPact Industrial MCB / MCCB Master Price List 2026",
    category: "switchgear",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 01, 2026",
    circularNo: "SCH/ACTI9/2026-Q4",
    discountNote: "OEM Panel Builder Discount: 44% + 5% Cash",
    fileFormat: "PDF",
    fileSize: "8.9 MB",
    pages: 96,
    downloadUrl: "/catalogs/schneider-acti9-easypact.pdf",
    description: "Master price list for Acti9 miniature circuit breakers, EasyPact CVS/EZC moulded case breakers, and modular contactors.",
  },
  {
    id: "sch-02",
    brand: "Schneider Electric",
    title: "Schneider TeSys Motor Contactors & Thermal Overload Relays Catalog",
    category: "switchgear",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. September 2026",
    circularNo: "SCH/TESYS/2026/12",
    discountNote: "Industrial Automation Tier: 42% OFF",
    fileFormat: "PDF",
    fileSize: "6.7 MB",
    pages: 60,
    downloadUrl: "/catalogs/schneider-tesys-contactors.pdf",
    description: "World-renowned TeSys D, TeSys F, and TeSys Giga contactors from 9A to 800A AC-3 ratings for heavy industrial motors.",
  },
  {
    id: "sch-03",
    brand: "Schneider Electric",
    title: "Schneider VarSet APFC Power Factor Capacitors & Detuned Reactors",
    category: "switchgear",
    docType: "Specification Guide",
    effectiveDate: "W.E.F. August 2026",
    circularNo: "SCH/APFC/2026/02",
    discountNote: "Energy Efficiency Discount: 38% OFF",
    fileFormat: "PDF",
    fileSize: "4.3 MB",
    pages: 34,
    downloadUrl: "/catalogs/schneider-varset-capacitors.pdf",
    description: "Heavy duty gas-filled and dry type power capacitors for DISCOM power factor penalty mitigation (0.99 target).",
  },

  // 7. L&T (Lauritz Knudsen)
  {
    id: "lnt-01",
    brand: "L&T (Lauritz Knudsen)",
    title: "L&T Industrial Switchgear Master Price List (Omega & dsine MCCBs)",
    category: "switchgear",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 14, 2026",
    circularNo: "LK/SWG/2026-27/05",
    discountNote: "Contractor Base: 46% OFF List Price",
    fileFormat: "PDF",
    fileSize: "9.2 MB",
    pages: 112,
    downloadUrl: "/catalogs/lnt-switchgear-pricelist-2026.pdf",
    description: "Complete master price book for dsine MCCBs, Omega air circuit breakers (ACBs), switch-disconnectors and busbar trunking.",
  },
  {
    id: "lnt-02",
    brand: "L&T (Lauritz Knudsen)",
    title: "L&T Motor Starters, Submersible Panels & Contactors Catalog",
    category: "switchgear",
    docType: "Technical Catalog",
    effectiveDate: "W.E.F. September 2026",
    circularNo: "LK/STR/2026/09",
    discountNote: "Agri & Industrial Dealer Discount: 40% OFF",
    fileFormat: "PDF",
    fileSize: "5.4 MB",
    pages: 48,
    downloadUrl: "/catalogs/lnt-motor-starters.pdf",
    description: "Direct-on-line (DOL), star-delta automatic motor starters, single-phase prevention relays and submersible pump controllers.",
  },
  {
    id: "lnt-03",
    brand: "L&T (Lauritz Knudsen)",
    title: "L&T Exora Modular MCBs & Final Distribution DBs Price Schedule",
    category: "switchgear",
    docType: "Discount Circular",
    effectiveDate: "W.E.F. October 2026",
    circularNo: "LK/EXO/2026/10",
    discountNote: "Standard Contractor Rebate: 43% OFF",
    fileFormat: "PDF",
    fileSize: "3.7 MB",
    pages: 28,
    downloadUrl: "/catalogs/lnt-exora-distribution.pdf",
    description: "Exora 10kA miniature circuit breakers, bi-connect terminals, SPN/TPN vertical and horizontal distribution enclosures.",
  },

  // 8. Volamp OEM & Dowells
  {
    id: "vol-01",
    brand: "Volamp OEM & Dowells",
    title: "Volamp OEM Certified Heavy Duty Power & Control Cables Master Circular",
    category: "power-cables",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 18, 2026",
    circularNo: "VOL/OEM/2026/10",
    discountNote: "Factory Direct Net Price: 42% Contractor Wholesale",
    fileFormat: "PDF",
    fileSize: "4.8 MB",
    pages: 40,
    downloadUrl: "/catalogs/volamp-oem-cables.pdf",
    description: "Volamp 60-year certified heavy duty power cables with CPRI type-tested insulation, zero-defect copper conductors and rapid dispatch.",
  },
  {
    id: "vol-02",
    brand: "Volamp OEM & Dowells",
    title: "Dowells Copper & Aluminium Compression Cable Lugs Master Price List",
    category: "accessories",
    docType: "Master Price List",
    effectiveDate: "W.E.F. October 2026",
    circularNo: "DOW/LUG/2026/10",
    discountNote: "Full Box Contractor Rate: 48% OFF",
    fileFormat: "PDF",
    fileSize: "3.4 MB",
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

const STORAGE_KEY = "volamp_custom_catalogs_v1";
const SALES_SESSION_KEY = "volamp_sales_team_session_active";
const SALES_SESSION_TS_KEY = "volamp_sales_team_session_ts";
const SALES_INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

export default function PriceListPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [selectedBrand, setSelectedBrand] = useState<string>("All Brands");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [catalogs, setCatalogs] = useState<CatalogItem[]>(INITIAL_CATALOGS);
  
  // Live pushed price lists from Employee Maintenance Center
  const pushedPriceListsQuery = trpc.priceLists.list.useQuery();
  
  // Sales Team Portal Modal States & Session Management
  const [salesModalOpen, setSalesModalOpen] = useState<boolean>(false);
  const [isSalesAuthenticated, setIsSalesAuthenticated] = useState<boolean>(() => {
    try {
      const active = sessionStorage.getItem(SALES_SESSION_KEY) === "true";
      const ts = sessionStorage.getItem(SALES_SESSION_TS_KEY);
      if (active && ts) {
        const elapsed = Date.now() - parseInt(ts, 10);
        if (elapsed < SALES_INACTIVITY_LIMIT_MS) return true;
        sessionStorage.removeItem(SALES_SESSION_KEY);
        sessionStorage.removeItem(SALES_SESSION_TS_KEY);
        return false;
      }
      return active;
    } catch {
      return false;
    }
  });
  const [salesPinInput, setSalesPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string>("");

  // Handle Sales Portal Login (starts session with 30-min inactivity limit)
  const handleSalesLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (salesPinInput.trim() === "volamp2026" || salesPinInput.trim() === "1234" || salesPinInput.trim().toLowerCase() === "sales") {
      setIsSalesAuthenticated(true);
      try {
        sessionStorage.setItem(SALES_SESSION_KEY, "true");
        sessionStorage.setItem(SALES_SESSION_TS_KEY, Date.now().toString());
      } catch (err) {
        console.warn("Unable to store sales session:", err);
      }
      setPinError("");
      toast.success("Welcome, Volamp Sales Team! Sales session unlocked for 30 minutes.");
    } else {
      setPinError("Invalid sales desk access code. Please contact your system administrator.");
    }
  };

  // Handle Sales Portal Logout (ends session)
  const handleSalesLogout = () => {
    setIsSalesAuthenticated(false);
    try {
      sessionStorage.removeItem(SALES_SESSION_KEY);
      sessionStorage.removeItem(SALES_SESSION_TS_KEY);
    } catch {}
    toast.info("Sales portal session closed. PIN required on next access.");
  };

  // Upload Form State
  const [uploadBrand, setUploadBrand] = useState<string>("Polycab");
  const [uploadTitle, setUploadTitle] = useState<string>("");
  const [uploadCategory, setUploadCategory] = useState<CatalogItem["category"]>("power-cables");
  const [uploadDocType, setUploadDocType] = useState<CatalogItem["docType"]>("Master Price List");
  const [uploadEffectiveDate, setUploadEffectiveDate] = useState<string>("W.E.F. October 2026");
  const [uploadCircularNo, setUploadCircularNo] = useState<string>("");
  const [uploadDiscountNote, setUploadDiscountNote] = useState<string>("Standard Contractor Discount: 40% OFF");
  const [uploadDescription, setUploadDescription] = useState<string>("");
  const [uploadFileName, setUploadFileName] = useState<string>("");
  const [uploadFileSize, setUploadFileSize] = useState<string>("3.5 MB");

  // Preview Modal State
  const [previewCatalog, setPreviewCatalog] = useState<CatalogItem | null>(null);

  // Load live pushed catalogs from server and localStorage on mount / data change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const customItems: CatalogItem[] = stored ? JSON.parse(stored) : [];
      const serverPushed: CatalogItem[] = (pushedPriceListsQuery.data || []).map((p) => ({
        id: p.id,
        brand: p.brand,
        title: p.title,
        category: (p.category as CatalogItem["category"]) || "power-cables",
        docType: (p.docType as CatalogItem["docType"]) || "Master Price List",
        effectiveDate: p.effectiveDate,
        circularNo: p.circularNo,
        discountNote: p.discountNote,
        fileFormat: (p.fileFormat as "PDF" | "XLSX") || "PDF",
        fileSize: p.fileSize,
        downloadUrl: p.downloadUrl,
        pages: p.pages,
        isCustom: true,
        uploadedAt: p.uploadedAt,
        description: p.description,
      }));

      // Merge server pushed first (most recent), then local custom, then initial
      const seen = new Set<string>();
      const combined: CatalogItem[] = [];
      for (const item of [...serverPushed, ...customItems, ...INITIAL_CATALOGS]) {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      }
      setCatalogs(combined);
    } catch (e) {
      console.error("Failed to load custom catalogs", e);
    }
  }, [pushedPriceListsQuery.data]);

  // Filtered Catalog List
  const filteredCatalogs = useMemo(() => {
    return catalogs.filter((item) => {
      // Brand filter
      if (selectedBrand !== "All Brands" && item.brand !== selectedBrand) {
        return false;
      }
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.circularNo && item.circularNo.toLowerCase().includes(q)) ||
          item.docType.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [catalogs, selectedBrand, selectedCategory, searchQuery]);

  // Handle Mock File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadFileSize(`${sizeMB} MB`);
      if (!uploadTitle) {
        // Auto-generate title from filename
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setUploadTitle(cleanName);
      }
    }
  };

  // Handle New Catalog Upload
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      toast.error("Please enter a catalog title");
      return;
    }

    const newItem: CatalogItem = {
      id: `custom-${Date.now()}`,
      brand: uploadBrand,
      title: uploadTitle.trim(),
      category: uploadCategory,
      docType: uploadDocType,
      effectiveDate: uploadEffectiveDate.trim() || `W.E.F. ${new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`,
      circularNo: uploadCircularNo.trim() || `VOL/${uploadBrand.slice(0, 3).toUpperCase()}/${Date.now().toString().slice(-4)}`,
      discountNote: uploadDiscountNote.trim() || "Wholesale Contractor Rate: 40% OFF",
      fileFormat: uploadFileName.endsWith(".xlsx") ? "XLSX" : "PDF",
      fileSize: uploadFileSize || "3.5 MB",
      pages: Math.floor(Math.random() * 30) + 16,
      downloadUrl: "#download",
      isCustom: true,
      uploadedAt: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      description: uploadDescription.trim() || `Official ${uploadBrand} ${uploadDocType} uploaded by Volamp Sales Team. Certified genuine manufacturer publication with locked contractor terms.`,
    };

    const updated = [newItem, ...catalogs];
    setCatalogs(updated);

    // Save custom items to localStorage
    try {
      const existingCustom = catalogs.filter((c) => c.isCustom);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...existingCustom]));
    } catch (err) {
      console.error(err);
    }

    toast.success(`Published! "${newItem.title}" is now live for all contractors.`);
    
    // Reset form
    setUploadTitle("");
    setUploadFileName("");
    setUploadDescription("");
    setSalesModalOpen(false);
  };

  // Delete Custom Catalog
  const handleDeleteCatalog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this uploaded price list?")) {
      const updated = catalogs.filter((c) => c.id !== id);
      setCatalogs(updated);
      try {
        const remainingCustom = updated.filter((c) => c.isCustom);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingCustom));
      } catch (err) {
        console.error(err);
      }
      toast.success("Catalog removed successfully.");
    }
  };

  // Instant Simulated Catalog Download
  const handleDownload = (catalog: CatalogItem, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info(`Preparing ${catalog.brand} Price List download...`);
    
    // Generate text document blob for immediate download
    const content = `========================================================================
VOLAMP ELEKTRIKALS PVT. LTD. - OFFICIAL PRICE LIST / CATALOG SUMMARY
========================================================================
Brand:               ${catalog.brand}
Document:            ${catalog.title}
Circular Reference:  ${catalog.circularNo || "VOL/CERT/2026"}
Effective Date:      ${catalog.effectiveDate}
Document Type:       ${catalog.docType}
Format:              ${catalog.fileFormat} (${catalog.fileSize})
Contractor Discount: ${catalog.discountNote}
========================================================================

DOCUMENT OVERVIEW:
${catalog.description}

WHOLESALE PRICING & DISPATCH POLICY:
• Direct wholesale discounts of up to 40% OFF list prices applied on order.
• Ready inventory in Central Ahmedabad Depot: 3,385+ certified SKUs.
• Same-day dispatch across Gujarat and express PAN-India delivery.
• CPRI / ERDA / ISI / BIS test certificates accompanied with invoice.

ORDERING CONTACTS (VOLAMP SALES DESK):
Phone / WhatsApp:    +91 79 2213 1234 / +91 98250 12345
Sales Email:         sales@volamp.com
Website:             https://www.volamp.com
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

    setTimeout(() => {
      toast.success(`Downloaded: ${catalog.title}`);
    }, 400);
  };

  // Share Catalog Link
  const handleShare = (catalog: CatalogItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/price-list?brand=${encodeURIComponent(catalog.brand)}&id=${catalog.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Direct catalog link copied to clipboard!");
    } else {
      toast.info(`Catalog URL: ${shareUrl}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf5ef] dark:bg-[#120406] text-[#2c1810] dark:text-[#f3ede8] transition-colors">
      <SeoHead
        title="Official Brand Price Lists & Technical Catalogs 2026 | Volamp Elektrikals"
        description="Download authentic master price lists, discount circulars and technical catalogs for Polycab, Havells, RR Kabel, KEI, Finolex, Schneider Electric, L&T, and Volamp OEM. Direct manufacturer rates with wholesale contractor discounts."
        keywords="electrical price list 2026, Polycab price list PDF, Havells switchgear catalog, RR Kabel building wire price list, KEI power cable price circular, Finolex price list, Schneider Acti9 price list, L&T switchgear price list, Volamp Elektrikals Ahmedabad"
        canonicalPath="/price-list"
      />

      <UniversalHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-[#3a0d12] via-[#4d1217] to-[#2b080c] text-white pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(#c56718_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
        <div className="market-container max-w-7xl mx-auto relative z-10 px-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
                <ShieldCheck className="size-4 text-amber-400" />
                <span>100% GENUINE OEM MANUFACTURER PUBLICATIONS · 2026 EDITIONS</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-tight">
                Official Manufacturer <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-orange-400 to-amber-200">
                  Price Lists & Catalogs
                </span>
              </h1>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
                Browse and download master price books, effective discount circulars, and technical specification brochures across all <strong>8 authorized brands</strong>. All lists backed by Volamp’s wholesale B2B contractor terms.
              </p>
              
              {/* Quick Summary Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">8 Brands</div>
                  <div className="text-stone-300 text-[11px] mt-0.5">Authorized Master Portfolio</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">{catalogs.length} Lists</div>
                  <div className="text-stone-300 text-[11px] mt-0.5">Master Catalogs & Circulars</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="text-xl sm:text-2xl font-black text-orange-400 font-mono">40% OFF</div>
                  <div className="text-stone-300 text-[11px] mt-0.5">Contractor Trade Discounts</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">Oct '26</div>
                  <div className="text-stone-300 text-[11px] mt-0.5">Daily Live Verified</div>
                </div>
              </div>
            </div>

            {/* Sales Team Dynamic Upload CTA Card */}
            <div className="lg:max-w-sm w-full bg-linear-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="size-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <Upload className="size-4" />
                  </span>
                  <span className="font-extrabold text-sm text-white uppercase tracking-wider">
                    Volamp Sales Portal
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                  Team Access
                </span>
              </div>
              <p className="text-xs text-stone-200 leading-relaxed">
                Volamp sales managers can dynamically upload revised manufacturer price lists, new circulars, or project discounting structures instantly.
              </p>
              <button
                type="button"
                onClick={() => setSalesModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-stone-950 font-extrabold text-xs shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Plus className="size-4" />
                <span>Upload / Manage Price Lists</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-400 text-center">
                <Lock className="size-3 text-stone-400" />
                <span>Authorized Sales Desk & Admin Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="market-container max-w-7xl mx-auto px-4 py-8 sm:py-12 space-y-8">
        
        {/* 8 Brands Interactive Showcase Filter Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-[#4d1217] dark:text-white flex items-center gap-2">
              <Building2 className="size-5 text-[#c56718]" />
              <span>Filter by Authorized Brand (8 Brands)</span>
            </h2>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-semibold">
              Showing {filteredCatalogs.length} of {catalogs.length} Documents
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2.5">
            {/* "All Brands" Card */}
            <button
              type="button"
              onClick={() => setSelectedBrand("All Brands")}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedBrand === "All Brands"
                  ? "bg-[#4d1217] text-white border-[#4d1217] shadow-md ring-2 ring-[#c56718]/40"
                  : "bg-white dark:bg-[#1e070a] border-[#ebd7c7] dark:border-[#3a1014] hover:border-[#c56718] text-[#4d1217] dark:text-white"
              }`}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider opacity-70">Portfolio</div>
              <div className="font-extrabold text-sm mt-1">All 8 Brands</div>
              <div className="text-[11px] opacity-80 mt-1 font-mono font-bold">{catalogs.length} Catalogs</div>
            </button>

            {/* 8 Individual Brand Cards */}
            {BRAND_DATA.map((brand) => {
              const count = catalogs.filter((c) => c.brand === brand.name).length;
              const isSelected = selectedBrand === brand.name;
              return (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => setSelectedBrand(brand.name)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? "bg-[#4d1217] text-white border-[#4d1217] shadow-md ring-2 ring-[#c56718]/40"
                      : "bg-white dark:bg-[#1e070a] border-[#ebd7c7] dark:border-[#3a1014] hover:border-[#c56718] text-[#4d1217] dark:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: brand.accent }}
                    />
                    <span className="text-[10px] font-mono font-bold opacity-80">{count}</span>
                  </div>
                  <div className="font-extrabold text-xs sm:text-sm mt-1.5 leading-snug line-clamp-1">
                    {brand.name}
                  </div>
                  <div className="text-[10px] opacity-75 mt-0.5 line-clamp-1">
                    {brand.badge}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="bg-white dark:bg-[#1e070a] rounded-2xl p-4 sm:p-5 border border-[#ebd7c7] dark:border-[#3a1014] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by catalog title, circular number, cable voltage..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#ebd7c7] dark:border-[#3a1014] bg-[#faf5ef] dark:bg-[#120406] text-[#4d1217] dark:text-white placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#c56718]/40 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Clear All Filters Button */}
            {(selectedBrand !== "All Brands" || selectedCategory !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedBrand("All Brands");
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="text-xs text-[#c56718] hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Reset all filters</span>
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-stone-400 font-bold text-[11px] mr-1 shrink-0">Category:</span>
            {[
              { id: "all", label: "All Categories" },
              { id: "power-cables", label: "LT / HT Power Cables" },
              { id: "flexible-wires", label: "Building & Flexible Wires" },
              { id: "switchgear", label: "Industrial Switchgear" },
              { id: "solar", label: "Solar DC Cables" },
              { id: "accessories", label: "Lugs, Glands & Earthing" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#c56718] text-white shadow-2xs"
                    : "bg-[#f7ede6] dark:bg-[#2b080c] text-[#5d4a4b] dark:text-[#cfc2c3] hover:bg-[#ebd4c2]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Cards Grid */}
        {filteredCatalogs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1e070a] rounded-2xl border border-[#ebd7c7] dark:border-[#3a1014] p-8 space-y-4">
            <FileText className="size-12 mx-auto text-stone-300 dark:text-stone-600" />
            <h3 className="text-lg font-extrabold text-[#4d1217] dark:text-white">
              No matching price lists found
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              We couldn't find any catalogs matching your current search criteria. Try resetting the filters or upload a new price list.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedBrand("All Brands");
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-[#c56718] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCatalogs.map((catalog) => {
              const brandMeta = BRAND_DATA.find((b) => b.name === catalog.brand);
              return (
                <div
                  key={catalog.id}
                  className="bg-white dark:bg-[#1a080b] rounded-2xl border border-[#ebd7c7] dark:border-[#3a1014] hover:border-[#c56718] p-5 flex flex-col justify-between transition-all shadow-xs hover:shadow-md group relative overflow-hidden"
                >
                  {/* Custom upload indicator badge */}
                  {catalog.isCustom && (
                    <div className="absolute top-0 right-0 bg-linear-to-l from-emerald-600 to-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                      <Sparkles className="size-2.5" />
                      <span>Sales Team Live</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Brand & Document Type Header */}
                    <div className="flex items-center justify-between gap-2 pr-16">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: brandMeta?.accent || "#c56718" }}
                        />
                        <span className="font-extrabold text-xs text-[#c56718] uppercase tracking-wider">
                          {catalog.brand}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#f7ede6] dark:bg-[#2b080c] text-[#5d4a4b] dark:text-[#cfc2c3]">
                        {catalog.docType}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-sm sm:text-base text-[#4d1217] dark:text-white font-['Plus_Jakarta_Sans',sans-serif] leading-snug group-hover:text-[#c56718] transition-colors line-clamp-2">
                      {catalog.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed">
                      {catalog.description}
                    </p>

                    {/* Metadata Strip */}
                    <div className="pt-2 border-t border-[#f0e3d8] dark:border-[#2a0c10] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-stone-400 flex items-center gap-1">
                          <Calendar className="size-3" />
                          <span>Effective:</span>
                        </span>
                        <span className="font-bold text-[#4d1217] dark:text-white font-mono">
                          {catalog.effectiveDate}
                        </span>
                      </div>

                      {catalog.circularNo && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-stone-400 flex items-center gap-1">
                            <Tag className="size-3" />
                            <span>Circular No:</span>
                          </span>
                          <span className="font-mono text-stone-600 dark:text-stone-300">
                            {catalog.circularNo}
                          </span>
                        </div>
                      )}

                      {/* Discount Badge */}
                      <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-[11px] font-bold text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
                        <Sparkles className="size-3 text-amber-600 shrink-0 mt-0.5" />
                        <span>{catalog.discountNote}</span>
                      </div>

                      {/* File Info */}
                      <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                        <span>Format: <strong>{catalog.fileFormat}</strong> ({catalog.fileSize})</span>
                        {catalog.pages && <span>{catalog.pages} Pages</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-3 border-t border-[#f0e3d8] dark:border-[#2a0c10] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => handleDownload(catalog, e)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                        title="Download Price List PDF"
                      >
                        <Download className="size-3.5" />
                        <span>Download</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewCatalog(catalog)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#f7ede6] dark:bg-[#2b080c] hover:bg-[#ebd4c2] text-[#4d1217] dark:text-white text-xs font-bold transition-all cursor-pointer"
                        title="Quick Preview"
                      >
                        <Eye className="size-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShare(catalog, e)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                        title="Copy Share Link"
                      >
                        <Share2 className="size-3.5" />
                      </button>
                    </div>

                    {catalog.isCustom ? (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteCatalog(catalog.id, e)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                        title="Delete this uploaded list"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          const ev = new CustomEvent("volamp:open-enquire", {
                            detail: {
                              category: "wires-and-cables",
                              product: `${catalog.brand} - ${catalog.title}`,
                            },
                          });
                          window.dispatchEvent(ev);
                        }}
                        className="text-[11px] text-[#c56718] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Enquire</span>
                        <ArrowRight className="size-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Contractor Bulk Dispatch & Physical Copy Request Strip */}
        <section className="bg-linear-to-r from-[#4d1217] via-[#5c161d] to-[#3a0d12] text-white rounded-2xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <FileSpreadsheet className="size-4" />
                <span>CONTRACTOR HARD COPY & CUSTOM TENDER BOQ</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold font-['Plus_Jakarta_Sans',sans-serif]">
                Need Spiral-Bound Master Catalogs or Custom Excel Rate Sheets?
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Volamp supplies EPC contractors, builders, and government project managers with hardbound master price books, stamped OEM manufacturer discount letters, and tailored Bill of Quantities (BOQs).
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  const ev = new CustomEvent("volamp:open-enquire", {
                    detail: {
                      category: "wires-and-cables",
                      product: "Request Physical Spiral-Bound Catalog Pack (All 8 Brands)",
                    },
                  });
                  window.dispatchEvent(ev);
                }}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-extrabold text-xs shadow-md transition-all cursor-pointer text-center"
              >
                Request Free Physical Catalog Pack
              </button>
              <button
                type="button"
                onClick={() => navigate("/calculator")}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all cursor-pointer text-center"
              >
                Cable Sizing Calculator
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* SALES TEAM DYNAMIC UPLOAD MODAL */}
      {salesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1a080b] rounded-2xl border border-[#ebd7c7] dark:border-[#3a1014] shadow-2xl max-w-lg w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#f0e3d8] dark:border-[#2a0c10] pb-3">
              <div className="flex items-center gap-2">
                <span className="size-8 rounded-lg bg-[#c56718]/15 text-[#c56718] flex items-center justify-center font-bold">
                  <Upload className="size-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-[#4d1217] dark:text-white">
                      Volamp Sales Team Upload Portal
                    </h3>
                    {isSalesAuthenticated && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        Session Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Publish revised price lists & circulars directly to the live catalog
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSalesAuthenticated && (
                  <button
                    type="button"
                    onClick={handleSalesLogout}
                    className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    title="Lock portal and end session"
                  >
                    Lock / End Session
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSalesModalOpen(false)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Step 1: Authentication */}
            {!isSalesAuthenticated ? (
              <form onSubmit={handleSalesLogin} className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <Lock className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Sales Desk Security Verification</span>
                    To prevent unauthorized catalog alterations, please verify your authorized sales team credentials.
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 dark:text-stone-300">
                    Enter Sales Desk Access Code:
                  </label>
                  <input
                    type="password"
                    value={salesPinInput}
                    onChange={(e) => setSalesPinInput(e.target.value)}
                    placeholder="Enter authorized PIN"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#ebd7c7] dark:border-[#3a1014] bg-[#faf5ef] dark:bg-[#120406] text-sm text-[#4d1217] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#c56718]/40"
                    autoFocus
                  />
                  {pinError && (
                    <p className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                      <AlertCircle className="size-3" />
                      <span>{pinError}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSalesModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Unlock className="size-3.5" />
                    <span>Unlock Sales Portal</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Upload Form */
              <form onSubmit={handleUploadSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Brand Selector */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                      Brand Name *
                    </label>
                    <select
                      value={uploadBrand}
                      onChange={(e) => setUploadBrand(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd7c7] dark:border-[#3a1014] bg-[#faf5ef] dark:bg-[#120406] text-xs font-bold text-[#4d1217] dark:text-white"
                    >
                      {BRAND_DATA.map((b) => (
                        <option key={b.name} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                      Product Category *
                    </label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd7c7] dark:border-[#3a1014] bg-[#faf5ef] dark:bg-[#120406] text-xs font-bold text-[#4d1217] dark:text-white"
                    >
                      <option value="power-cables">LT / HT Power Cables</option>
                      <option value="flexible-wires">Building & Flexible Wires</option>
                      <option value="switchgear">Industrial Switchgear</option>
                      <option value="solar">Solar DC Cables</option>
                      <option value="accessories">Lugs, Glands & Earthing</option>
                    </select>
                  </div>
                </div>

                {/* Catalog Title */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    Catalog Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Polycab Submersible Flat Cables Revision Nov 2026"
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd7c7] dark:border-[#3a1014] bg-[#faf5ef] dark:bg-[#120406] text-xs text-[#4d1217] dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#c56718]/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Document Type */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                      Document Type
                    </label>
                    <select
                      value={uploadDocType}
                      onChange={(e) => setUploadDocType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd7c7] dark:border-[#3a1014] bg-[#faf5ef] dark:bg-[#120406] text-xs font-bold text-[#4d1217] dark:text-white"
                    >
                      <option value="Master Price List">Master Price List</option>
                      <option value="Discount Circular">Discount Circular</option>
                      <option value="Technical Catalog">Technical Catalog</option>
                      <option value="Specification Guide">Specification Guide</option>
                    </select>
                  </div>

                  {/* Effective Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                      Effective Date / Revision
                    </label>
                    <input
                      type="text"
                      value={uploadEffectiveDate}
                      onChange={(e) => setUploadEffectiveDate(e.target.value)}
                      placeholder="e.g. W.E.F. 01-Nov-2026"
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd7c7] dark:border-[#3a1014] bg-[#faf5ef] dark:bg-[#120406] text-xs text-[#4d1217] dark:text-white"
                    />
                  </div>
                </div>

                {/* Circular No & Discount Terms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                      Circular Reference No.
                    </label>
                    <input
                      type="text"
                      value={uploadCircularNo}
                      onChange={(e) => setUploadCircularNo(e.target.value)}
                      placeholder="e.g. POL/SUB/2026-11/01"
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd7c7] dark:border-[#3a1014] bg-[#faf5ef] dark:bg-[#120406] text-xs text-[#4d1217] dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                      Standard Contractor Discount
                    </label>
                    <input
                      type="text"
                      value={uploadDiscountNote}
                      onChange={(e) => setUploadDiscountNote(e.target.value)}
                      placeholder="e.g. 40% OFF + 5% Cash Discount"
                      className="w-full px-3 py-2 rounded-xl border border-[#ebd7c7] dark:border-[#3a1014] bg-[#faf5ef] dark:bg-[#120406] text-xs text-[#4d1217] dark:text-white"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    Brief Scope / Description
                  </label>
                  <textarea
                    rows={2}
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Provide overview of covered cables, conductor ratings, voltage classes, or revision notes..."
                    className="w-full px-3 py-2 rounded-xl border border-[#ebd7c7] dark:border-[#3a1014] bg-[#faf5ef] dark:bg-[#120406] text-xs text-[#4d1217] dark:text-white"
                  />
                </div>

                {/* File Upload Selector */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    Attach PDF / Excel File
                  </label>
                  <div className="border-2 border-dashed border-[#ebd7c7] dark:border-[#3a1014] hover:border-[#c56718] rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#faf5ef] dark:bg-[#120406]">
                    <input
                      type="file"
                      id="catalog-file-input"
                      accept=".pdf,.xlsx,.xls,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="catalog-file-input"
                      className="cursor-pointer space-y-1 block"
                    >
                      <Upload className="size-6 text-[#c56718] mx-auto" />
                      <div className="text-xs font-bold text-[#4d1217] dark:text-white">
                        {uploadFileName ? uploadFileName : "Click to select Price List document"}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {uploadFileName ? `Size: ${uploadFileSize} · Ready to publish` : "Supported formats: PDF, XLSX (Max 50MB)"}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-[#f0e3d8] dark:border-[#2a0c10]">
                  <button
                    type="button"
                    onClick={() => setIsSalesAuthenticated(false)}
                    className="text-xs text-stone-400 hover:text-stone-600"
                  >
                    Lock Portal
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSalesModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-linear-to-r from-[#c56718] to-orange-600 text-white text-xs font-extrabold shadow-md hover:from-amber-600 hover:to-orange-700 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="size-4" />
                      <span>Publish to Live Catalog</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QUICK PREVIEW MODAL */}
      {previewCatalog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a080b] rounded-2xl border border-[#ebd7c7] dark:border-[#3a1014] shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#f0e3d8] dark:border-[#2a0c10] pb-3">
              <div>
                <span className="text-xs font-extrabold text-[#c56718] uppercase tracking-wider block">
                  {previewCatalog.brand} · {previewCatalog.docType}
                </span>
                <h3 className="text-lg font-extrabold text-[#4d1217] dark:text-white mt-1">
                  {previewCatalog.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCatalog(null)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-600"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Document Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#faf5ef] dark:bg-[#120406] border border-[#ebd7c7] dark:border-[#3a1014]">
                <div className="text-stone-400 text-[10px]">Effective Date</div>
                <div className="font-extrabold text-[#4d1217] dark:text-white mt-0.5">{previewCatalog.effectiveDate}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#faf5ef] dark:bg-[#120406] border border-[#ebd7c7] dark:border-[#3a1014]">
                <div className="text-stone-400 text-[10px]">Circular No.</div>
                <div className="font-extrabold text-[#4d1217] dark:text-white mt-0.5 font-mono text-[11px]">{previewCatalog.circularNo || "VOL/CERT/2026"}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#faf5ef] dark:bg-[#120406] border border-[#ebd7c7] dark:border-[#3a1014]">
                <div className="text-stone-400 text-[10px]">File Size</div>
                <div className="font-extrabold text-[#4d1217] dark:text-white mt-0.5">{previewCatalog.fileSize}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#faf5ef] dark:bg-[#120406] border border-[#ebd7c7] dark:border-[#3a1014]">
                <div className="text-stone-400 text-[10px]">Format</div>
                <div className="font-extrabold text-[#4d1217] dark:text-white mt-0.5">{previewCatalog.fileFormat}</div>
              </div>
            </div>

            {/* Discount Callout */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <span className="font-extrabold flex items-center gap-1.5 text-sm">
                <Sparkles className="size-4 text-amber-600" />
                <span>Applicable Wholesale Discount Schedule</span>
              </span>
              <p className="font-semibold text-xs">{previewCatalog.discountNote}</p>
            </div>

            {/* Scope Summary */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold text-[#4d1217] dark:text-white uppercase tracking-wider">
                Document Summary & Specifications
              </h4>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed bg-[#faf5ef] dark:bg-[#120406] p-4 rounded-xl border border-[#ebd7c7] dark:border-[#3a1014]">
                {previewCatalog.description}
              </p>
            </div>

            {/* Sample Table of Contents / Size Matrix */}
            <div className="space-y-2 text-xs">
              <h4 className="font-extrabold text-[#4d1217] dark:text-white uppercase tracking-wider">
                Included Voltage Classes & Standard Sizes
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-stone-600 dark:text-stone-300">
                <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  • 1.5 sq.mm - 16 sq.mm (LT)
                </div>
                <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  • 25 sq.mm - 95 sq.mm (Armoured)
                </div>
                <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  • 120 sq.mm - 400 sq.mm (Heavy Power)
                </div>
                <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  • 11kV Grade 3-Core XLPE
                </div>
                <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  • 33kV Grade E-beam Cured
                </div>
                <div className="p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  • 1500V DC Solar Array Cables
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#f0e3d8] dark:border-[#2a0c10]">
              <button
                type="button"
                onClick={() => setPreviewCatalog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100"
              >
                Close Preview
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleShare(previewCatalog, e)}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-200 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Share2 className="size-3.5" />
                  <span>Share</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    handleDownload(previewCatalog, e);
                    setPreviewCatalog(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#c56718] hover:bg-[#b45309] text-white text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="size-4" />
                  <span>Download Price List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <UniversalFooter />
    </div>
  );
}
