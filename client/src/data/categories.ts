import { Cable, ShieldCheck, Zap, PlugZap, Wrench, SunMedium, Layers, Radio } from "lucide-react";

export interface SubCategory {
  name: string;
  slug: string;
  detail?: string;
  items: string[]; // Sub-sub categories
}

export interface Category {
  id: string;
  name: string;
  shortName: string;
  code: string;
  slug: string;
  detail: string;
  iconName: "Cable" | "ShieldCheck" | "Zap" | "PlugZap" | "Wrench" | "SunMedium" | "Layers" | "Radio";
  image?: string;
  subcategories: SubCategory[];
}

export const CATEGORIES: Category[] = [
  {
    id: "wire-cables",
    name: "WIRE CABLES",
    shortName: "WC",
    code: "01",
    slug: "wire-cables",
    detail: "Industrial, building, power, control, communication & HT armoured cables",
    iconName: "Cable",
    image: "/products/cables.jpg",
    subcategories: [
      {
        name: "Industrial Flexible (FRLS) Insulated Cable",
        slug: "industrial-flexible-frls-insulated-cable",
        detail: "Flame retardant low smoke flexible insulated cables for industrial wiring",
        items: ["Flexible (FRLS) Insulated Cable", "(FRLS) Insulated Cable"],
      },
      {
        name: "3 Core Flat Submersible Cable",
        slug: "3-core-flat-submersible-cable",
        detail: "Continuous submerged pump power cable with high water resistance",
        items: ["SUBMERSIBLE CABLE"],
      },
      {
        name: "CCTV Cable",
        slug: "cctv-cable",
        detail: "High-grade composite surveillance cables for clear visual transmission",
        items: ["90 Mtrs Coil", "180 Mtrs Coil", "300 Mtrs Coil", "CCTV CABLE"],
      },
      {
        name: "Co-Axial Cable",
        slug: "co-axial-cable",
        detail: "Low-loss coaxial cables for RF, CATV, and satellite signal delivery",
        items: ["RG-59", "RG-6", "RG-11", "RG-6 CCS", "RG-11 CCS"],
      },
      {
        name: "Industrial Braided-Unarmoured Screen Cable",
        slug: "industrial-braided-unarmoured-screen-cable",
        detail: "Screened braided instrumentation and control cables for EMI-sensitive plants",
        items: ["Industrial Braided-Unarmoured Screen Cable"],
      },
      {
        name: "Industrial Cable (Multistrand)",
        slug: "industrial-cable-multistrand",
        detail: "Multistrand heavy-duty flexible industrial power and control cables",
        items: ["Industrial Cable"],
      },
      {
        name: "Jellyfilled Telephone Cable",
        slug: "jellyfilled-telephone-cable",
        detail: "Moisture-resistant petroleum jelly-filled underground communication cables",
        items: ["Unarmoured (0.50mm)", "Armoured (0.50mm)"],
      },
      {
        name: "LAN (Computer) Cable",
        slug: "lan-computer-cable",
        detail: "High-speed Ethernet networking cables for enterprise infrastructure",
        items: [
          "CAT-5E - UTP Unarmoured",
          "CAT-5E - UTP Armoured",
          "CAT-5E - FTP Unarmoured",
          "CAT-5E - FTP Armoured",
          "CAT-6 - UTP Unarmoured",
          "CAT-6 - UTP Armoured",
          "CAT-6 - FTP Unarmoured",
          "CAT-6 - FTP Armoured",
          "CAT 6-A (GOLD) - UTP Unarmoured",
          "CAT 6-A (GOLD) - UTP Armoured",
          "CAT 6-A (GOLD) - FTP Unarmoured",
          "CAT 6-A (GOLD) - FTP Armoured",
        ],
      },
      {
        name: "Service Cable",
        slug: "service-cable",
        detail: "Overhead and service drop cables for utility connection points",
        items: ["Service"],
      },
      {
        name: "Telephone & Switchboard Cable",
        slug: "telephone-switchboard-cable",
        detail: "Intercom, PBX, and telecom switchboard wiring cables",
        items: ["Unarmoured (0.50mm)", "Unarmoured (0.40mm)", "Armoured (0.50mm)"],
      },
      {
        name: "Welding Cable",
        slug: "welding-cable",
        detail: "Highly flexible heat and oil resistant heavy duty arc welding cables",
        items: ["WEILDING CABLE"],
      },
      {
        name: "Building Management System (BMS) Cable",
        slug: "building-management-system-bms-cable",
        detail: "Specialized low-capacitance cables for smart BMS building automation",
        items: ["BMS CABLE"],
      },
      {
        name: "Pair Cable - Overall Shielded-Armoured Instrumentation Cable",
        slug: "pair-cable-instrumentation",
        detail: "Individually/overall shielded paired instrumentation cables for process control",
        items: ["PAIR CABLE"],
      },
      {
        name: "Quad Cable - Overall Shielded-Armoured Instrumentation Cable",
        slug: "quad-cable-instrumentation",
        detail: "Precision quad-shielded cables for high accuracy data and control systems",
        items: ["QUAD CABLE"],
      },
      {
        name: "Triad Cable - Overall Shielded-Armoured Instrumentation Cable",
        slug: "triad-cable-instrumentation",
        detail: "Triad shielded armoured instrumentation cables for RTD and sensor signals",
        items: ["TRIAD CABLE"],
      },
      {
        name: "Aluminium Armoured Cable - A2XWY / A2XFY",
        slug: "aluminium-armoured-cable-a2xwy-a2xfy",
        detail: "Standard cross section LT XLPE aluminium armoured underground power cables",
        items: ["Aluminium Armoured Cable"],
      },
      {
        name: "Aluminium Armoured Cable - Extended Cross Section",
        slug: "aluminium-armoured-cable-extended-cross-section",
        detail: "Extended heavy cross-section aluminium armoured power feeder cables",
        items: ["Aluminium Armoured Cable Extended"],
      },
      {
        name: "Copper Armoured Cable - 2XWY / 2XFY",
        slug: "copper-armoured-cable-2xwy-2xfy",
        detail: "High-conductivity copper conductor XLPE armoured underground power cables",
        items: ["Copper Armoured Cable"],
      },
      {
        name: "H.T. XLPE Armoured Aluminium Cable",
        slug: "ht-xlpe-armoured-aluminium-cable",
        detail: "High-tension 6.6KV to 33KV underground power transmission cables",
        items: [
          "6.6 KV (UE) / 11 KV (E)",
          "6.6 KV (UE) / 11 KV (E) - Round Wire",
          "22 KV (E)",
          "22 KV (E) - Round Wire",
          "33 KV (E)",
          "33 KV (E) - Round Wire",
        ],
      },
    ],
  },
  {
    id: "switch-gears",
    name: "SWITCH GEARS",
    shortName: "SG",
    code: "02",
    slug: "switch-gears",
    detail: "Switching & control, powergear and final distribution protection",
    iconName: "ShieldCheck",
    image: "/products/switchgear.jpg",
    subcategories: [
      {
        name: "Switching & Control",
        slug: "switching-and-control",
        detail: "Heavy-duty contactors and motor switching controls",
        items: ["Power Contactors"],
      },
      {
        name: "Powergear",
        slug: "powergear",
        detail: "Industrial circuit isolation, fuse gear and MCCB systems",
        items: [
          "Changeover Switches",
          "HRC Fuses",
          "Switch Disconnector Fuses",
          "Moulded Case Circuit Breakers",
          "MCCB Enclosures",
        ],
      },
      {
        name: "Final Distribution Products",
        slug: "final-distribution-products",
        detail: "Modular protection devices, DBs and industrial sockets",
        items: [
          "Miniature Circuit Breakers",
          "Isolators",
          "Residual Current Circuit Breakers",
          "Residual Current Breakers with Overcurrent",
          "Industrial Plugs & Sockets",
          "Distribution Boards & Accessories",
        ],
      },
    ],
  },
  {
    id: "lugs",
    name: "LUGS",
    shortName: "LUG",
    code: "03",
    slug: "lugs",
    detail: "Ring, pin and tubular heavy-duty cable terminations",
    iconName: "PlugZap",
    image: "/products/cable-lugs.jpg",
    subcategories: [
      {
        name: "Ring",
        slug: "ring-lugs",
        detail: "Ring type electrical crimping terminals",
        items: ["Standard"],
      },
      {
        name: "Pin",
        slug: "pin-lugs",
        detail: "Pin type electrical crimping terminals",
        items: ["Standard"],
      },
      {
        name: "Tubular",
        slug: "tubular-lugs",
        detail: "Heavy-duty tubular copper and aluminium cable terminal lugs",
        items: [
          "Long Barrel Ring",
          "Long Barrel Pin",
          "Short Barrel Ring",
          "Short Barrel Pin",
        ],
      },
    ],
  },
  {
    id: "pvc-pipe",
    name: "PVC PIPE",
    shortName: "PVC",
    code: "04",
    slug: "pvc-pipe",
    detail: "LMS, MMS, HMS conduits, casing capping & corrugated pipes",
    iconName: "Layers",
    image: "/products/pvc-pipe.jpg",
    subcategories: [
      {
        name: "LMS (Light Mechanical Stress)",
        slug: "lms-light-mechanical-stress",
        detail: "Light duty PVC electrical conduit for concealed building wiring",
        items: ["LMS (Light Mechanical Stress)"],
      },
      {
        name: "MMS (Medium Mechanical Stress)",
        slug: "mms-medium-mechanical-stress",
        detail: "Medium duty PVC electrical conduit for standard commercial installations",
        items: ["MMS (Medium Mechanical Stress)"],
      },
      {
        name: "HMS (Heavy Mechanical Stress)",
        slug: "hms-heavy-mechanical-stress",
        detail: "Heavy duty PVC conduit for industrial, exposed and slab casting applications",
        items: ["HMS (Heavy Mechanical Stress)"],
      },
      {
        name: "Non-IS LMS",
        slug: "non-is-lms",
        detail: "Economy light mechanical stress conduit pipes",
        items: ["Non-IS LMS"],
      },
      {
        name: "Non-IS MMS",
        slug: "non-is-mms",
        detail: "Economy medium mechanical stress conduit pipes",
        items: ["Non-IS MMS"],
      },
      {
        name: "Non-IS HMS",
        slug: "non-is-hms",
        detail: "Economy heavy mechanical stress conduit pipes",
        items: ["Non-IS HMS"],
      },
      {
        name: "Non-IS 25 Classic",
        slug: "non-is-25-classic",
        detail: "25mm classic grade utility conduit pipes",
        items: ["Non-IS 25 Classic"],
      },
      {
        name: "Non-IS 25 Super",
        slug: "non-is-25-super",
        detail: "25mm super grade durable utility conduit pipes",
        items: ["Non-IS 25 Super"],
      },
      {
        name: "Casing & Capping",
        slug: "casing-and-capping",
        detail: "Surface wiring trunking, casing and capping profile channels",
        items: ["Casing & Capping"],
      },
      {
        name: "PP Corrugated Flexible Conduit",
        slug: "pp-corrugated-flexible-conduit",
        detail: "Flexible polypropylene corrugated pipes for routing and protection",
        items: ["PP Corrugated Flexible Conduit"],
      },
    ],
  },
  {
    id: "glands",
    name: "GLANDS",
    shortName: "GLD",
    code: "05",
    slug: "glands",
    detail: "Single, double compression, weatherproof & flameproof cable glands",
    iconName: "Wrench",
    image: "/products/cable-gland.jpg",
    subcategories: [
      {
        name: "Single Compression",
        slug: "single-compression-glands",
        detail: "Standard single compression brass cable glands for unarmoured/light cables",
        items: ["Single Compression"],
      },
      {
        name: "Double Compression MD",
        slug: "double-compression-md-glands",
        detail: "Medium duty double compression cable glands for armoured cables",
        items: ["Double Compression MD"],
      },
      {
        name: "Weatherproof HMI-W",
        slug: "weatherproof-hmi-w-glands",
        detail: "Outdoor weatherproof IP-rated heavy mechanical industrial glands",
        items: ["Weatherproof HMI-W"],
      },
      {
        name: "Flameproof HMI-F",
        slug: "flameproof-hmi-f-glands",
        detail: "Hazardous area flameproof certified brass and nickel-plated glands",
        items: ["Flameproof HMI-F"],
      },
    ],
  },
  {
    id: "wiring-device",
    name: "WIRING DEVICE",
    shortName: "WD",
    code: "06",
    slug: "wiring-device",
    detail: "Switches, plugs, junction boxes, accessories, tools & safety gear",
    iconName: "PlugZap",
    image: "/products/wiring-devices.jpg",
    subcategories: [
      {
        name: "Insulation Tape",
        slug: "insulation-tape",
        detail: "High-adhesion electrical PVC insulation tapes in standard colors",
        items: ["Insulation Tape"],
      },
      {
        name: "Wiring Accessory",
        slug: "wiring-accessory",
        detail: "Essential clips, ties, saddles, and wiring mounting hardware",
        items: ["Wiring Accessory"],
      },
      {
        name: "Electrical Switch",
        slug: "electrical-switch",
        detail: "Modular and non-modular electrical switches and control keys",
        items: ["Electrical Switch"],
      },
      {
        name: "Wiring Device",
        slug: "wiring-device-items",
        detail: "Appliance connectors, regulators, and modular grid frames",
        items: ["Wiring Device"],
      },
      {
        name: "Electrical Plug",
        slug: "electrical-plug",
        detail: "Industrial and commercial 2-pin, 3-pin and heavy-duty plugs",
        items: ["Electrical Plug"],
      },
      {
        name: "Junction Box",
        slug: "junction-box",
        detail: "Surface and flush mounted electrical junction and terminal boxes",
        items: ["Junction Box"],
      },
      {
        name: "Hammer",
        slug: "hammer",
        detail: "Durable electrician claw and ball-peen hammers",
        items: ["Hammer"],
      },
      {
        name: "Screwdriver",
        slug: "screwdriver",
        detail: "Insulated 1000V rated screwdrivers and multi-bit sets",
        items: ["Screwdriver"],
      },
      {
        name: "Pliers",
        slug: "pliers",
        detail: "Combination pliers, wire strippers, and side cutting pliers",
        items: ["Pliers"],
      },
      {
        name: "Measuring Tape",
        slug: "measuring-tape",
        detail: "Heavy-duty steel measuring tapes for onsite cable measurement",
        items: ["Measuring Tape"],
      },
      {
        name: "Utility Knife",
        slug: "utility-knife",
        detail: "Retractable heavy-duty utility and cable stripping knives",
        items: ["Utility Knife"],
      },
      {
        name: "Spanner",
        slug: "spanner",
        detail: "Ring and open-ended spanner sets for gland and panel installation",
        items: ["Spanner"],
      },
      {
        name: "Safety Helmet",
        slug: "safety-helmet",
        detail: "ISI-certified industrial electrical safety hard hats",
        items: ["Safety Helmet"],
      },
      {
        name: "Safety Gloves",
        slug: "safety-gloves",
        detail: "High-voltage insulating and cut-resistant electrical safety gloves",
        items: ["Safety Gloves"],
      },
      {
        name: "Extension Cord",
        slug: "extension-cord",
        detail: "Heavy-duty surge-protected power strips and extension reels",
        items: ["Extension Cord"],
      },
      {
        name: "LED Bulb",
        slug: "led-bulb",
        detail: "Energy-efficient commercial and project LED lamps and fixtures",
        items: ["LED Bulb"],
      },
    ],
  },
  {
    id: "earthing-wires",
    name: "EARTHING WIRES",
    shortName: "EW",
    code: "07",
    slug: "earthing-wires",
    detail: "Electrodes, pit covers, chemicals, copper, GI & aluminium materials",
    iconName: "ShieldCheck",
    image: "/products/earthing-rods.png",
    subcategories: [
      {
        name: "Earthing Electrodes",
        slug: "earthing-electrodes",
        detail: "High dissipation earthing rods and chemical electrodes",
        items: [
          "Copper / Copper Bonded",
          "Copper Bonded",
          "Pipe in Pipe",
          "Chemical Earthing",
          "GI",
          "Maintenance Free",
        ],
      },
      {
        name: "Earthing Pit Covers",
        slug: "earthing-pit-covers",
        detail: "Protective chambers and inspection pit covers",
        items: ["RCC", "FRP", "PVC / FRP", "Cast Iron"],
      },
      {
        name: "Earthing Chemicals",
        slug: "earthing-chemicals",
        detail: "Soil resistivity lowering compounds and backfill materials",
        items: ["Bentonite", "Charcoal", "Salt"],
      },
      {
        name: "Copper Earthing Materials",
        slug: "copper-earthing-materials",
        detail: "Pure electrolytic copper conductors, plates, and busbars",
        items: [
          "Copper Plate",
          "Copper Pipe",
          "Copper Wire",
          "Flexible Jumper",
          "Copper Sheet",
          "Braided Strip",
          "Busbar",
          "Copper Flat",
          "Copper Rod",
        ],
      },
      {
        name: "GI Earthing Materials",
        slug: "gi-earthing-materials",
        detail: "Hot-dip galvanized iron earthing strips, pipes, and conductors",
        items: ["GI Pipe", "GI Wire", "GI Strip", "GI Rod", "Earthing Pipe"],
      },
      {
        name: "Aluminium Earthing Materials",
        slug: "aluminium-earthing-materials",
        detail: "Aluminium conductors and busbars for lightweight grounding systems",
        items: ["Aluminium Busbar", "Aluminium Conductor"],
      },
      {
        name: "Solar & Lightning Earthing",
        slug: "solar-lightning-earthing",
        detail: "Dedicated solar farm grounding and lightning arrester protection systems",
        items: ["Solar Earthing", "Lightning Protection"],
      },
    ],
  },
  {
    id: "solar",
    name: "SOLAR",
    shortName: "SOL",
    code: "08",
    slug: "solar",
    detail: "Solar cables, TOPCon/bifacial solar panels & inverters",
    iconName: "SunMedium",
    image: "/products/solar-panel.jpg",
    subcategories: [
      {
        name: "Solar Cable",
        slug: "solar-cable",
        detail: "UV and ozone resistant crosslinked halogen-free PV cables",
        items: ["PV1-F", "H1Z2Z2-K", "2XY"],
      },
      {
        name: "Solar Panel",
        slug: "solar-panel",
        detail: "High-efficiency TOPCon, HJT and Mono PERC solar PV modules",
        items: [
          "N-Type TOPCon Bifacial, 16BB",
          "HJT Dual-Glass Bifacial",
          "N-Type TOPCon G12R Dual Glass Bifacial",
          "Back Contact",
          "N-Type TOPCon / Mono PERC Halfcut Bifacial Dual Glass",
          "Mono PERC (DCR)",
          "N-Type TOPCon Bifacial (Non-DCR)",
          "N-Type TOPCon Bifacial",
          "Monocrystalline TOPCon (TP540HG10 family)",
          "N-Type TOPCon (DCR)",
          "Mono PERC (Somera Series)",
          "N-Type TOPCon Bifacial (Somera Series)",
        ],
      },
      {
        name: "Solar Inverter",
        slug: "solar-inverter",
        detail: "On-grid, off-grid, and hybrid solar power inverters",
        items: ["Coming Soon"],
      },
    ],
  },
];

export const ICON_MAP = {
  Cable,
  ShieldCheck,
  Zap,
  PlugZap,
  Wrench,
  SunMedium,
  Layers,
  Radio,
};

export function getCategoryBySlug(slug: string): Category | undefined {
  const normalized = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return CATEGORIES.find(
    (c) =>
      c.slug === normalized ||
      c.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === normalized
  );
}

export function findSubcategory(slugOrName: string): { category: Category; subcategory: SubCategory } | undefined {
  const normalized = slugOrName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  for (const cat of CATEGORIES) {
    for (const sub of cat.subcategories) {
      if (
        sub.slug === normalized ||
        sub.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === normalized
      ) {
        return { category: cat, subcategory: sub };
      }
    }
  }
  return undefined;
}

export function getProductImage(prod?: any, categorySlugOrName?: string): string {
  if (
    prod?.imageUrl &&
    typeof prod.imageUrl === "string" &&
    !prod.imageUrl.includes("drive.google.com") &&
    (prod.imageUrl.startsWith("/") || prod.imageUrl.startsWith("http"))
  ) {
    return prod.imageUrl;
  }

  const text = `${prod?.name || ""} ${prod?.subcategory || ""} ${prod?.category || ""} ${categorySlugOrName || ""}`.toLowerCase();

  // Solar modules & panels
  if (text.includes("solar") || text.includes("pv") || text.includes("topcon") || text.includes("bifacial") || text.includes("inverter")) {
    if (text.includes("solar cable") || text.includes("pv1-f") || text.includes("h1z2z2")) {
      return "/products/cables.jpg";
    }
    return "/products/solar-panel.jpg";
  }

  // Earthing & Lightning Protection
  if (text.includes("earth") || text.includes("electrode") || text.includes("pit") || text.includes("chemical") || text.includes("copper flat") || text.includes("gi rod") || text.includes("busbar")) {
    return "/products/earthing-rods.png";
  }

  // Cable Glands
  if (text.includes("gland") || text.includes("compression") || text.includes("flameproof") || text.includes("weatherproof")) {
    return "/products/cable-gland.jpg";
  }

  // Cable Lugs & Terminals
  if (text.includes("lug") || text.includes("terminal") || text.includes("crimp") || text.includes("barrel") || text.includes("tubular")) {
    return "/products/cable-lugs.jpg";
  }

  // Switchgear & Distribution
  if (text.includes("switch gear") || text.includes("switchgear") || text.includes("mcb") || text.includes("mccb") || text.includes("contactor") || text.includes("isolator") || text.includes("fuse") || text.includes("distribution board") || text.includes("breaker") || text.includes("powergear")) {
    return "/products/switchgear.jpg";
  }

  // PVC Pipe & Conduits
  if (text.includes("pvc") || text.includes("pipe") || text.includes("conduit") || text.includes("casing") || text.includes("corrugated") || text.includes("lms") || text.includes("mms") || text.includes("hms")) {
    return "/products/pvc-pipe.jpg";
  }

  // Wiring Devices, Switches, Tools
  if (text.includes("wiring device") || text.includes("switch") || text.includes("plug") || text.includes("tape") || text.includes("socket") || text.includes("junction") || text.includes("helmet") || text.includes("screwdriver") || text.includes("pliers")) {
    return "/products/wiring-devices.jpg";
  }

  // Default to Cables
  return "/products/cables.jpg";
}
