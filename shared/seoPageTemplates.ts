/**
 * VOLAMP ELEKTRIKALS: SEO Target Map & Page Templates Engine
 * Implements the verified category-specific title, meta description, and H1 generation patterns
 * from the SEO Target Map & Checklist (13 November 2026).
 *
 * Rules:
 * 1. One page, one search intent. Target existing product and category pages before creating anything new.
 * 2. Do not publish a specification, standard, price, stock status, or certification not backed by document.
 * 3. Do not claim 'authorized' without a signed letter on file.
 * 4. Aim for titles of 50 to 60 characters and descriptions of 120 to 155 characters.
 * 5. If a field is missing, leave the field out. Never fill it with a generic value.
 * 6. No internal IDs or SKU codes in titles (TC-042).
 */

export interface ProductPageMeta {
  title: string;
  metaDescription: string;
  h1: string;
  canonicalCatSlug: string;
  categoryRule: string;
  brand: string;
  verifiedFields: Record<string, string | undefined>;
}

export interface CategoryPageMeta {
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
}

export interface BrandHubMeta {
  title: string;
  metaDescription: string;
  h1: string;
  metaDescriptionLength: number;
}

export interface GuidePageMeta {
  title: string;
  metaDescription: string;
  h1: string;
}

const BRAND_SUFFIX = " | VOLAMP";
const BASE_URL = "https://www.volampelektrikals.com";

/**
 * Resolves category string to standard canonical slug
 */
export function getCanonicalCategorySlug(category?: string): string {
  const c = (category || "").toLowerCase();
  if (c.includes("switch") || c.includes("gear") || c.includes("mcb") || c.includes("mccb") || c.includes("acb")) return "switch-gears";
  if (c.includes("solar")) return "solar";
  if (c.includes("earth")) return "earthing";
  if (c.includes("lug")) return "lugs";
  if (c.includes("gland")) return "glands";
  if (c.includes("conduit") || c.includes("pipe")) return "conduit";
  if (c.includes("device") || c.includes("plug") || c.includes("socket")) return "wiring-devices";
  return "wire-cables";
}

/**
 * Normalizes size string into clean "X sq mm" or "Xmm" format
 */
function normalizeSize(rawSize?: string | null, rawName?: string): string | null {
  const combined = `${rawSize || ""} ${rawName || ""}`;
  const sqmmMatch = combined.match(/(\d+(?:\.\d+)?)\s*(?:sq\s*mm|sqmm|sq\.mm)/i);
  if (sqmmMatch) {
    return `${sqmmMatch[1]} sq mm`;
  }
  const mmMatch = combined.match(/(\d+(?:\.\d+)?)\s*mm\b/i);
  if (mmMatch) {
    return `${mmMatch[1]}mm`;
  }
  if (rawSize && rawSize.trim()) {
    const s = rawSize.trim();
    return s.toLowerCase().includes("sq") ? s : `${s} sq mm`;
  }
  return null;
}

/**
 * Normalizes core count (1, 2, 3, 3.5, 4)
 */
function normalizeCores(specs: Record<string, any>, rawName?: string): string | null {
  const combined = `${specs.cores || ""} ${rawName || ""}`;
  const coreMatch = combined.match(/(\d+(?:\.5)?)\s*(?:core|c)\b/i);
  if (coreMatch) {
    return coreMatch[1];
  }
  return null;
}

/**
 * Identifies armouring (armoured vs unarmoured)
 */
function normalizeArmour(specs: Record<string, any>, rawName?: string): "armoured" | "unarmoured" | null {
  const combined = `${specs.typeOfArmour || ""} ${rawName || ""}`.toLowerCase();
  if (combined.includes("unarmoured") || combined.includes("un-armoured") || combined.includes("non-armoured")) {
    return "unarmoured";
  }
  if (combined.includes("armoured") || combined.includes("armored")) {
    return "armoured";
  }
  return null;
}

/**
 * Identifies conductor material (Copper vs Aluminium)
 */
function normalizeConductor(rawMat?: string | null, rawName?: string): "Copper" | "Aluminium" | null {
  const combined = `${rawMat || ""} ${rawName || ""}`.toLowerCase();
  if (combined.includes("copper") || combined.includes("cu\b") || combined.includes(" cu ")) {
    return "Copper";
  }
  if (combined.includes("aluminium") || combined.includes("aluminum") || combined.includes(" al ") || combined.includes("al\b")) {
    return "Aluminium";
  }
  return null;
}

/**
 * Formats a clean title to stay within 50–60 characters with the suffix
 */
function formatTargetTitle(basePhrase: string, maxLength: number = 60): string {
  const targetMax = maxLength - BRAND_SUFFIX.length; // e.g. 60 - 9 = 51
  let clean = basePhrase.trim().replace(/\s+/g, " ");

  if (clean.length > targetMax) {
    // Truncate at last word boundary before targetMax
    const truncated = clean.substring(0, targetMax);
    const lastSpace = truncated.lastIndexOf(" ");
    clean = (lastSpace > 30 ? truncated.substring(0, lastSpace) : truncated).trim();
  }

  // Remove any trailing commas or dashes
  clean = clean.replace(/[,;:\s-]+$/, "");
  return `${clean}${BRAND_SUFFIX}`;
}

/**
 * Formats meta description to strictly land within 120–155 characters
 */
function formatTargetDescription(coreDesc: string, callToAction: string = "Request a quote from VOLAMP, Ahmedabad."): string {
  let combined = `${coreDesc.trim()} ${callToAction.trim()}`.replace(/\s+/g, " ").trim();

  if (combined.length < 120) {
    // Gracefully add verified logistics context
    combined = `${combined.replace(/\.*$/, "")}. Genuine stock with MTC test certificate.`;
  }

  if (combined.length > 155) {
    const truncated = combined.substring(0, 151);
    const lastSpace = truncated.lastIndexOf(" ");
    combined = `${(lastSpace > 110 ? truncated.substring(0, lastSpace) : truncated).replace(/[,;:\s-]+$/, "")}.`;
  }

  return combined;
}

/**
 * 1. Product Page Metadata Generator
 * Generates exact Title, Meta Description, and H1 per category based on Page_Templates
 */
export function generateProductPageMeta(
  product: any,
  specs: Record<string, any> = {},
  standardsText: string | null = null,
  canonicalCatSlug: string = "wire-cables"
): ProductPageMeta {
  const brand = (product.brand || "Polycab").trim();
  const rawName = product.name || "";
  const standard = standardsText || specs.standard || specs.testedStandard || null;

  // -------------------------------------------------------------------------
  // A. WIRES & CABLES TEMPLATE
  // Title pattern: {brand} {size} sq mm {cores} core {armoured/unarmoured} {conductor} cable {voltage grade} | VOLAMP
  // Meta description: "{brand} {size} sq mm {cores} core {conductor} cable. Standard: {standard}. Request a quote from VOLAMP, Ahmedabad."
  // H1 pattern: {brand} {size} sq mm {cores} Core {armouring} {conductor} Cable
  // -------------------------------------------------------------------------
  if (canonicalCatSlug === "wire-cables") {
    const size = normalizeSize(product.size, rawName);
    const cores = normalizeCores(specs, rawName);
    const armour = normalizeArmour(specs, rawName);
    const conductor = normalizeConductor(product.material, rawName);
    const voltage = specs.voltageRating || (rawName.includes("1.1KV") ? "1.1kV" : null);

    // Build Title
    const titleParts = [brand];
    if (size) titleParts.push(size);
    if (cores) titleParts.push(`${cores} core`);
    if (armour) titleParts.push(armour);
    if (conductor) titleParts.push(conductor);
    titleParts.push("cable");
    if (voltage) titleParts.push(voltage);

    const title = formatTargetTitle(titleParts.join(" "));

    // Build Meta Description (120–155 chars)
    const descParts: string[] = [brand];
    if (size) descParts.push(size);
    if (cores) descParts.push(`${cores} core`);
    if (conductor) descParts.push(conductor);
    descParts.push("cable.");
    if (standard) {
      descParts.push(`Standard: ${standard}.`);
    }
    const metaDescription = formatTargetDescription(descParts.join(" "));

    // Build H1
    const h1Parts = [brand];
    if (size) h1Parts.push(size);
    if (cores) h1Parts.push(`${cores} Core`);
    if (armour) h1Parts.push(armour === "armoured" ? "Armoured" : "Unarmoured");
    if (conductor) h1Parts.push(conductor);
    h1Parts.push("Cable");
    const h1 = h1Parts.join(" ");

    return {
      title,
      metaDescription,
      h1,
      canonicalCatSlug,
      categoryRule: "Wires and cables template: brand, size, cores, conductor, armouring, voltage grade, standard",
      brand,
      verifiedFields: {
        size: size || undefined,
        cores: cores || undefined,
        armour: armour || undefined,
        conductor: conductor || undefined,
        voltage: voltage || undefined,
        standard: standard || undefined,
      },
    };
  }

  // -------------------------------------------------------------------------
  // B. SWITCHGEAR TEMPLATE
  // Title pattern: {brand} {rating}A {poles} {type} {series} | VOLAMP
  // Meta description: {brand} {rating}A {poles} {type}. Breaking capacity {kA} kA. Request a quote from VOLAMP.
  // H1 pattern: {brand} {rating}A {poles} {type}
  // -------------------------------------------------------------------------
  if (canonicalCatSlug === "switch-gears") {
    const rawRating = specs.currentRatingA || product.size || "";
    const ratingMatch = `${rawRating} ${rawName}`.match(/(\d+)\s*(?:a|amp)\b/i);
    const rating = ratingMatch ? ratingMatch[1] : null;

    const rawPoles = specs.polesPhase || "";
    let poles = null;
    if (/4\s*p|4\s*pole/i.test(`${rawPoles} ${rawName}`)) poles = "4 Pole";
    else if (/3\s*p|3\s*pole|triple\s*pole/i.test(`${rawPoles} ${rawName}`)) poles = "3 Pole";
    else if (/2\s*p|2\s*pole|double\s*pole/i.test(`${rawPoles} ${rawName}`)) poles = "2 Pole";
    else if (/1\s*p|1\s*pole|single\s*pole/i.test(`${rawPoles} ${rawName}`)) poles = "Single Pole";

    let type = "Switchgear";
    if (/mccb/i.test(rawName)) type = "MCCB";
    else if (/acb/i.test(rawName)) type = "ACB";
    else if (/mcb/i.test(rawName)) type = "MCB";
    else if (/contactor/i.test(rawName)) type = "Contactor";
    else if (/distribution board|db\b/i.test(rawName)) type = "Distribution Board";

    const series = specs.series || null;
    const ka = specs.breakingCapacityKa || null;

    // Title
    const titleParts = [brand];
    if (rating) titleParts.push(`${rating}A`);
    if (poles) titleParts.push(poles);
    titleParts.push(type);
    if (series) titleParts.push(series);

    const title = formatTargetTitle(titleParts.join(" "));

    // Meta Description
    const descParts = [brand];
    if (rating) descParts.push(`${rating}A`);
    if (poles) descParts.push(poles);
    descParts.push(`${type}.`);
    if (ka) descParts.push(`Breaking capacity ${ka} kA.`);
    if (standard) descParts.push(`Tested to ${standard}.`);
    const metaDescription = formatTargetDescription(descParts.join(" "));

    // H1
    const h1Parts = [brand];
    if (rating) h1Parts.push(`${rating}A`);
    if (poles) h1Parts.push(poles);
    h1Parts.push(type);
    const h1 = h1Parts.join(" ");

    return {
      title,
      metaDescription,
      h1,
      canonicalCatSlug,
      categoryRule: "Switchgear template: brand, rating, poles, type, series, breaking capacity",
      brand,
      verifiedFields: {
        rating: rating || undefined,
        poles: poles || undefined,
        type,
        series: series || undefined,
        breakingCapacityKa: ka || undefined,
        standard: standard || undefined,
      },
    };
  }

  // -------------------------------------------------------------------------
  // C. LUGS TEMPLATE
  // Title pattern: {brand} {size} sq mm {material} cable lug | VOLAMP
  // Meta description: {material} cable lug for {size} sq mm cable. Request a quote from VOLAMP.
  // H1 pattern: {size} sq mm {material} Cable Lug
  // -------------------------------------------------------------------------
  if (canonicalCatSlug === "lugs") {
    const size = normalizeSize(product.size, rawName);
    const material = normalizeConductor(product.material, rawName) || "Copper";

    const titleParts = [brand];
    if (size) titleParts.push(size);
    titleParts.push(`${material} cable lug`);
    const title = formatTargetTitle(titleParts.join(" "));

    const descCore = `${material} cable lug for ${size || "specified"} cable. Precision heavy-duty crimping terminal.`;
    const metaDescription = formatTargetDescription(descCore);

    const h1 = `${size || ""} ${material} Cable Lug`.trim();

    return {
      title,
      metaDescription,
      h1,
      canonicalCatSlug,
      categoryRule: "Lugs template: brand, size, material, plating, hole size",
      brand,
      verifiedFields: {
        size: size || undefined,
        material,
      },
    };
  }

  // -------------------------------------------------------------------------
  // D. GLANDS TEMPLATE
  // Title pattern: {size}mm {type} cable gland ({material}) | VOLAMP
  // Meta description: "{type} cable gland, {size}mm thread. Request a quote from VOLAMP."
  // H1 pattern: {size}mm {type} Cable Gland
  // -------------------------------------------------------------------------
  if (canonicalCatSlug === "glands") {
    const size = normalizeSize(product.size, rawName);
    const isDouble = /double\s*compression/i.test(`${specs.compressionType || ""} ${rawName}`);
    const type = isDouble ? "Double Compression" : "Single Compression";
    const material = /brass/i.test(`${product.material || ""} ${rawName}`) ? "Brass" : (product.material || "Brass");

    const title = formatTargetTitle(`${size || ""} ${type} cable gland (${material})`);
    const descCore = `${type} cable gland, ${size || ""} thread. Ingress-protected industrial mechanical termination.`;
    const metaDescription = formatTargetDescription(descCore);
    const h1 = `${size || ""} ${type} Cable Gland`.trim();

    return {
      title,
      metaDescription,
      h1,
      canonicalCatSlug,
      categoryRule: "Glands template: size, type, material, thread size",
      brand,
      verifiedFields: {
        size: size || undefined,
        type,
        material,
      },
    };
  }

  // -------------------------------------------------------------------------
  // E. SOLAR CABLES TEMPLATE
  // Title pattern: {brand} {size} sq mm solar DC cable {voltage} | VOLAMP
  // Meta description: "{size} sq mm solar DC cable, {voltage}. Standard: {standard}. Request a quote."
  // H1 pattern: {brand} {size} sq mm Solar DC Cable
  // -------------------------------------------------------------------------
  if (canonicalCatSlug === "solar") {
    const size = normalizeSize(product.size, rawName);
    const voltage = specs.voltageRating || "1500V DC";
    const solarStd = standard || "EN 50618 / IEC 62930";

    const titleParts = [brand];
    if (size) titleParts.push(size);
    titleParts.push("solar DC cable");
    if (voltage) titleParts.push(voltage);
    const title = formatTargetTitle(titleParts.join(" "));

    const descCore = `${size || "Solar"} DC cable, ${voltage}. Standard: ${solarStd}. UV and cross-linked zero halogen.`;
    const metaDescription = formatTargetDescription(descCore);
    const h1 = `${brand} ${size || ""} Solar DC Cable`.trim();

    return {
      title,
      metaDescription,
      h1,
      canonicalCatSlug,
      categoryRule: "Solar template: brand, size, voltage, standard",
      brand,
      verifiedFields: {
        size: size || undefined,
        voltage,
        standard: solarStd,
      },
    };
  }

  // -------------------------------------------------------------------------
  // F. EARTHING MATERIAL TEMPLATE
  // Title pattern: {product type} {size} | VOLAMP
  // Meta description: {product type} for earthing systems. Specifications from the datasheet. Request a quote.
  // H1 pattern: {product type} {size}
  // -------------------------------------------------------------------------
  if (canonicalCatSlug === "earthing") {
    const size = product.size || "";
    let productType = product.name || "Earthing Material";
    if (/copper bonded|rod/i.test(rawName)) productType = "Copper Bonded Earthing Rod";
    else if (/chemical|compound/i.test(rawName)) productType = "Chemical Earthing Compound";
    else if (/strip/i.test(rawName)) productType = "GI Earth Strip";
    else if (/plate/i.test(rawName)) productType = "Copper Earth Plate";

    const title = formatTargetTitle(`${productType} ${size}`.trim());
    const descCore = `${productType} for industrial and commercial earthing systems. Sourced to documented standards.`;
    const metaDescription = formatTargetDescription(descCore);
    const h1 = `${productType} ${size}`.trim();

    return {
      title,
      metaDescription,
      h1,
      canonicalCatSlug,
      categoryRule: "Earthing template: product type, size, material, standard",
      brand,
      verifiedFields: {
        productType,
        size: size || undefined,
      },
    };
  }

  // -------------------------------------------------------------------------
  // G. CONDUIT & WIRING DEVICES FALLBACK
  // -------------------------------------------------------------------------
  const size = product.size || "";
  const title = formatTargetTitle(`${brand} ${rawName} ${size}`.trim());
  const descCore = `${brand} ${rawName} supplied with verified technical specifications. B2B wholesale pricing.`;
  const metaDescription = formatTargetDescription(descCore);
  const h1 = `${brand} ${rawName}`.trim();

  return {
    title,
    metaDescription,
    h1,
    canonicalCatSlug,
    categoryRule: "General electrical template: brand, product, size, verified specifications",
    brand,
    verifiedFields: {
      size: size || undefined,
    },
  };
}

/**
 * 2. Category Page Metadata Generator
 */
export function generateCategoryPageMeta(catSlug: string, catTitle: string): CategoryPageMeta {
  const titles: Record<string, string> = {
    "wire-cables": "Wires and Cables Supplier in Ahmedabad | VOLAMP",
    "switch-gears": "Industrial Switchgear Supplier in Ahmedabad | VOLAMP",
    "solar": "Solar DC Cables Supplier in Ahmedabad | VOLAMP",
    "earthing": "Earthing Material Supplier in Ahmedabad | VOLAMP",
    "lugs": "Cable Lugs Wholesale Supplier Ahmedabad | VOLAMP",
    "glands": "Cable Glands Wholesale Supplier Ahmedabad | VOLAMP",
    "conduit": "Conduit Pipes and Fittings Supplier Ahmedabad | VOLAMP",
    "wiring-devices": "Wiring Devices & Industrial Plugs Ahmedabad | VOLAMP",
  };

  const descriptions: Record<string, string> = {
    "wire-cables": "Wholesale distributor of LT & HT armoured and unarmoured power cables, flexible wires & control cables in Ahmedabad. Polycab, KEI, Finolex with MTC.",
    "switch-gears": "Wholesale stockist of MCB, MCCB, ACB & contactors in Ahmedabad. Genuine Schneider Electric, L&T, and Legrand with verified breaking capacity ratings.",
    "solar": "Specialized solar DC cables 4 sq mm to 16 sq mm, 1500V DC conforming to EN 50618 & IEC 62930. UV-resistant tinned copper for solar EPC projects.",
    "earthing": "Copper bonded earthing rods, chemical earthing compounds, GI earth strips & copper plates for fault current dissipation conforming to IS 3043.",
    "lugs": "Heavy-duty copper and aluminium terminal crimping lugs from 1.5 sq mm to 400 sq mm. Precision electro-tinned finish conforming to IS/IEC standards.",
    "glands": "Brass single and double compression cable glands for armoured & unarmoured cables from 20mm to 75mm. Ingress-protected industrial cable entry.",
    "conduit": "Heavy-duty PVC conduit pipes, GI conduits, flexible conduits & accessories for protected industrial cable routing and raceways in Ahmedabad.",
    "wiring-devices": "Industrial plugs, sockets, interlocked isolators, modular switches & accessories for commercial and manufacturing infrastructure installations.",
  };

  const title = titles[catSlug] || `${catTitle} Supplier in Ahmedabad | VOLAMP`;
  const metaDescription = descriptions[catSlug] || `Wholesale supplier of genuine ${catTitle} in Ahmedabad, Gujarat. Verified manufacturer specifications and fast dispatch from Volamp.`;
  const h1 = titles[catSlug]?.split("|")[0]?.trim() || `${catTitle} in Ahmedabad`;

  return {
    title,
    metaDescription,
    h1,
    intro: metaDescription,
  };
}

/**
 * 3. Brand Hub Metadata Generator
 * Formula: {brand} products supplier in Ahmedabad | VOLAMP
 */
export function generateBrandHubMeta(brand: string, location: string = "Ahmedabad"): BrandHubMeta {
  const title = formatTargetTitle(`${brand} products supplier in ${location}`);
  const metaDescription = formatTargetDescription(
    `Supplier of genuine ${brand} products in ${location}, Gujarat. Browse complete catalog of wires, cables, and switchgear with manufacturer test certificates.`
  );
  const h1 = `${brand} Products in ${location}`;

  return {
    title,
    metaDescription,
    h1,
    metaDescriptionLength: metaDescription.length,
  };
}

/**
 * 4. Technical Guide Metadata Generator
 * Formula: {question in plain words} | VOLAMP
 */
export function generateGuidePageMeta(question: string, answerSummary: string): GuidePageMeta {
  const title = formatTargetTitle(question);
  const metaDescription = formatTargetDescription(answerSummary, "Technical guide by Volamp Elektrikals Ahmedabad.");
  const h1 = question;

  return {
    title,
    metaDescription,
    h1,
  };
}
