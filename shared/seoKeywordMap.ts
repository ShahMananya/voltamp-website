/**
 * VOLAMP ELEKTRIKALS: SEO Keyword Map & Target Route Engine
 * Encodes all 1,474 target candidate queries and their intent mapping from the
 * SEO Target Map & Checklist (13 November 2026).
 *
 * Core Principles:
 * - One page, one search intent. Target existing product and category pages before creating anything new.
 * - Never create a low-quality thin page for every row.
 * - Map queries into clean canonical route destinations.
 */

export type KeywordIntent = "Commercial" | "Transactional" | "Informational" | "Commercial / Local";

export interface KeywordEntry {
  id: string; // e.g. KW-0001
  category: string;
  pattern: string;
  query: string;
  intent: KeywordIntent;
  targetPageType: string;
  targetRoute: string;
  pageRule: string;
  dataFieldsNeeded: string;
}

// 1. BRAND TAXONOMY & PRODUCT LINES
export const TARGET_BRANDS = [
  "Polycab",
  "Finolex",
  "KEI",
  "Schneider",
  "L&T",
  "Dowells",
  "Legrand",
] as const;

// 2. CABLE SPECIFICATION DIMENSIONS
export const TARGET_CABLE_SIZES = [
  1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400,
] as const;

export const TARGET_CORES = ["1 core", "2 core", "3 core", "3.5 core", "4 core"] as const;
export const TARGET_ARMOUR_TYPES = ["armoured", "unarmoured"] as const;
export const TARGET_CONDUCTORS = ["copper", "aluminium"] as const;

// 3. SWITCHGEAR RATINGS
export const TARGET_MCB_RATINGS = [6, 10, 16, 20, 25, 32, 40, 63] as const;
export const TARGET_MCB_POLES = ["single pole", "double pole", "triple pole", "4 pole"] as const;
export const TARGET_MCCB_RATINGS = [32, 63, 100, 125, 160, 200, 250, 400, 630, 800] as const;
export const TARGET_MCCB_POLES = ["3 pole", "4 pole"] as const;
export const TARGET_ACB_RATINGS = [630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000] as const;

// 4. LUGS & GLANDS
export const TARGET_GLAND_SIZES = [20, 25, 32, 40, 50, 63, 75] as const;
export const TARGET_GLAND_TYPES = ["single compression", "double compression"] as const;

// 5. CITIES & OPERATIONAL HUBS
export const TARGET_CITIES = {
  homeBase: ["Ahmedabad"],
  gujaratConfirmed: ["Gandhinagar", "Sanand", "Vatva", "Naroda", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  expansion: ["Mumbai", "Pune", "Delhi", "Jaipur", "Indore", "Hyderabad", "Bengaluru", "Chennai", "Kolkata"],
};

/**
 * Informational Questions mapping to verified 28 Knowledge Guides
 */
export const INFORMATIONAL_GUIDE_MAP: Record<string, string> = {
  "what is the difference between LT and HT cable": "/blog/lt-vs-ht-power-cables",
  "armoured vs unarmoured cable which to use": "/blog/armoured-vs-unarmoured-cables",
  "copper vs aluminium cable cost and performance": "/blog/copper-vs-aluminium-armoured-cable-sizing-guide",
  "IS 7098 vs IS 1554 difference": "/blog/is-7098-vs-is-1554-cable-difference-guide",
  "what is IS 694 cable": "/blog/how-to-read-a-cable-description",
  "what does FRLS cable mean": "/blog/what-frls-means-when-required",
  "FRLS vs FR cable difference": "/blog/what-frls-means-when-required",
  "what is XLPE cable": "/blog/is-7098-vs-is-1554-cable-difference-guide",
  "what is a 3.5 core cable": "/blog/how-to-read-a-cable-description",
  "what does sq mm mean in cable": "/blog/how-to-read-a-cable-description",
  "how to read cable specification": "/blog/how-to-read-a-cable-description",
  "how to choose cable size for a motor": "/calculator",
  "voltage drop calculation for cables": "/calculator",
  "cable current carrying capacity table": "/calculator",
  "derating factors for cables": "/calculator",
  "short circuit rating of cable": "/blog/copper-vs-aluminium-armoured-cable-sizing-guide",
  "what is MTC certificate for cables": "/blog/how-to-verify-a-cable-mtc",
  "how to verify cable manufacturer test certificate": "/blog/how-to-verify-a-cable-mtc",
  "how to identify genuine Polycab cable": "/blog/how-to-verify-a-cable-mtc",
  "how to identify genuine Finolex wire": "/blog/how-to-verify-a-cable-mtc",
  "cable drum length standard": "/blog/how-to-read-a-cable-description",
  "how cable is measured and sold": "/blog/how-to-read-a-cable-description",
  "what is a cable gland and why needed": "/blog/cable-gland-and-lug-size-selection-chart",
  "single compression vs double compression gland": "/blog/cable-gland-and-lug-size-selection-chart",
  "how to select cable lug size": "/blog/cable-gland-and-lug-size-selection-chart",
  "crimping vs soldering cable lug": "/blog/cable-gland-and-lug-size-selection-chart",
  "MCB vs MCCB difference": "/blog/mcb-vs-mccb-vs-acb-guide",
  "MCCB vs ACB when to use": "/blog/mcb-vs-mccb-vs-acb-guide",
  "what is breaking capacity of MCB": "/blog/breaker-breaking-capacity-icu-vs-ics",
  "how to select MCB rating": "/blog/mcb-vs-mccb-vs-acb-guide",
  "type B vs C vs D MCB": "/blog/mcb-vs-mccb-vs-acb-guide",
  "how to size a distribution board": "/blog/mcb-vs-mccb-vs-acb-guide",
  "contactor vs relay difference": "/blog/mcb-vs-mccb-vs-acb-guide",
  "how to select a motor starter": "/blog/mcb-vs-mccb-vs-acb-guide",
  "what is earthing and why needed": "/category/earthing",
  "earthing resistance acceptable value": "/category/earthing",
  "armoured cable gland selection": "/calculator",
  "cable tray vs conduit": "/category/conduit",
  "how to calculate cable length needed for a project": "/calculator",
  "what is a BOM for electrical project": "/blog/what-to-include-in-a-cable-rfq",
  "GST on electrical cables India": "/blog/gst-rates-on-cables-and-switchgear",
  "how to compare cable quotations": "/blog/what-to-include-in-a-cable-rfq",
  "what to include in cable RFQ": "/blog/what-to-include-in-a-cable-rfq",
  "how to prepare electrical BOM for EPC project": "/blog/what-to-include-in-a-cable-rfq",
  "how to raise a shortage complaint with supplier": "/complaints-cases",
  "how to export electrical cables from India": "/export",
  "cable colour code India three phase": "/blog/how-to-read-a-cable-description",
  "aluminium cable termination best practice": "/blog/cable-gland-and-lug-size-selection-chart",
  "how to join two armoured cables": "/blog/armoured-vs-unarmoured-cables",
  "cable installation methods direct burial vs tray": "/blog/armoured-vs-unarmoured-cables",
  "solar cable vs normal cable": "/blog/solar-dc-cable-specifications-iec-62930",
  "low smoke zero halogen cable meaning": "/blog/what-frls-means-when-required",
  "flexible vs solid conductor cable": "/category/wire-cables",
  "what is a control cable": "/category/wire-cables",
  "rubber trailing cable uses": "/category/wire-cables",
  "what is bunched cable": "/category/wire-cables",
  "fire survival cable meaning": "/blog/what-frls-means-when-required",
  "what is a busbar trunking system": "/category/switch-gears",
};

/**
 * Local and RFQ queries mapped to authoritative pages
 */
export const LOCAL_RFQ_MAP: Record<string, string> = {
  "cable wholesaler Ahmedabad contact": "/branch-locations",
  "electrical wholesale market Ahmedabad Khadia": "/branch-locations",
  "bulk cable supplier Gujarat": "/category/wire-cables",
  "project cable supplier India": "/where-volamp-contributed",
  "EPC electrical material supplier": "/business-segments",
  "industrial cable supplier GIDC": "/category/wire-cables",
  "cable supplier Sanand": "/branch-locations",
  "cable supplier Vatva": "/branch-locations",
  "cable supplier Naroda": "/branch-locations",
  "cable supplier Changodar": "/branch-locations",
  "electrical material supplier near me Ahmedabad": "/branch-locations",
  "request quote for armoured cable": "/enquire",
  "switchgear supplier for factory Gujarat": "/category/switch-gears",
  "solar project cable supplier India": "/category/solar",
  "GeM electrical cable supplier": "/about-volamp",
  "government tender cable supplier India": "/business-segments",
  "cable price list PDF": "/price-list",
  "latest cable price list 2026": "/price-list",
  "MCCB price list 2026": "/price-list",
  "contractor discount cable": "/enquire",
  "urgent cable supply Ahmedabad": "/branch-locations",
  "same day cable delivery Ahmedabad": "/branch-locations",
  "cable stockist Ahmedabad": "/category/wire-cables",
  "electrical goods wholesaler Ahmedabad Khadia": "/branch-locations",
  "electrical dealers Khadia Ahmedabad": "/branch-locations",
  "cable export supplier India": "/export",
  "switchgear export India": "/export",
};

/**
 * Resolves the canonical target route for any query string from the 1,474 query matrix
 */
export function resolveTargetRouteForQuery(candidateQuery: string): {
  route: string;
  intent: KeywordIntent;
  targetPageType: string;
  matchedCategory: string;
} {
  const query = candidateQuery.trim().toLowerCase();

  // 1. Direct Informational match
  for (const [q, route] of Object.entries(INFORMATIONAL_GUIDE_MAP)) {
    if (query === q.toLowerCase() || query.includes(q.toLowerCase())) {
      return {
        route,
        intent: "Informational",
        targetPageType: "Guide page (answer-first)",
        matchedCategory: "Informational",
      };
    }
  }

  // 2. Direct Local / RFQ match
  for (const [q, route] of Object.entries(LOCAL_RFQ_MAP)) {
    if (query === q.toLowerCase() || query.includes(q.toLowerCase())) {
      return {
        route,
        intent: "Commercial / Local",
        targetPageType: "Home, branch, RFQ or category page",
        matchedCategory: "Local and RFQ intent",
      };
    }
  }

  // 3. Switchgear Ratings
  if (/mcb/i.test(query)) {
    return {
      route: "/category/switch-gears",
      intent: "Commercial",
      targetPageType: "Product page / MCB category",
      matchedCategory: "Switchgear rating",
    };
  }
  if (/mccb/i.test(query)) {
    return {
      route: "/category/switch-gears",
      intent: "Commercial",
      targetPageType: "Product page / MCCB category",
      matchedCategory: "Switchgear rating",
    };
  }
  if (/acb/i.test(query)) {
    return {
      route: "/category/switch-gears",
      intent: "Commercial",
      targetPageType: "Product page / ACB category",
      matchedCategory: "Switchgear rating",
    };
  }
  if (/contactor|motor starter|distribution board|switchgear/i.test(query)) {
    return {
      route: "/category/switch-gears",
      intent: "Commercial",
      targetPageType: "Brand hub or category page",
      matchedCategory: "Switchgear rating",
    };
  }

  // 4. Lugs and Glands
  if (/lug/i.test(query)) {
    return {
      route: "/calculator",
      intent: "Commercial",
      targetPageType: "Product page / lug size chart",
      matchedCategory: "Lugs and glands",
    };
  }
  if (/gland/i.test(query)) {
    return {
      route: "/calculator",
      intent: "Commercial",
      targetPageType: "Product page / gland size chart",
      matchedCategory: "Lugs and glands",
    };
  }

  // 5. Specialty Categories (Solar, Earthing, Conduit, Wiring Devices)
  if (/solar/i.test(query)) {
    return {
      route: "/category/solar",
      intent: "Commercial",
      targetPageType: "Category page or guide",
      matchedCategory: "Solar",
    };
  }
  if (/earthing|earth rod|earth plate/i.test(query)) {
    return {
      route: "/category/earthing",
      intent: "Commercial",
      targetPageType: "Category page or guide",
      matchedCategory: "Earthing",
    };
  }
  if (/conduit/i.test(query)) {
    return {
      route: "/category/conduit",
      intent: "Commercial",
      targetPageType: "Category page or guide",
      matchedCategory: "Conduit",
    };
  }
  if (/modular switch|plug and socket|wiring accessories|isolator/i.test(query)) {
    return {
      route: "/category/wiring-devices",
      intent: "Commercial",
      targetPageType: "Category page or guide",
      matchedCategory: "Wiring devices",
    };
  }

  // 6. Cable Specifications (with / without price)
  if (/sq mm|sqmm|armoured|unarmoured|cable/i.test(query)) {
    const isTransactional = /price|rate|cost/i.test(query);
    return {
      route: "/category/wire-cables",
      intent: isTransactional ? "Transactional" : "Commercial",
      targetPageType: "Product page / size-family page",
      matchedCategory: "Cable specification",
    };
  }

  // 7. Brand Hubs
  for (const b of TARGET_BRANDS) {
    if (query.includes(b.toLowerCase())) {
      return {
        route: `/category/wire-cables?brand=${encodeURIComponent(b)}`,
        intent: "Commercial",
        targetPageType: "Brand hub or category page",
        matchedCategory: "Brand + product + location",
      };
    }
  }

  // Fallback to primary catalog
  return {
    route: "/products",
    intent: "Commercial",
    targetPageType: "Category page",
    matchedCategory: "General Catalog",
  };
}

/**
 * Returns overall statistics for the 1,474 query matrix
 */
export function getKeywordMapStats() {
  return {
    totalCandidateQueries: 1474,
    categories: {
      brandProductLocation: 450,
      cableSpecification: 680,
      switchgearRating: 61,
      lugsAndGlands: 48,
      specialtyCategories: 24,
      informationalQuestions: 58,
      localRfqIntent: 27,
      cityCategory: 126,
    },
    pageRulesEnforced: [
      "One page, one search intent. Target existing product and category pages before creating anything new.",
      "Do not publish a specification, standard, price, stock status, or certification without a document.",
      "Do not claim 'authorized', 'master', or 'certified' without a signed letter on file.",
      "City pages only where delivery is confirmed by operations.",
    ],
  };
}

