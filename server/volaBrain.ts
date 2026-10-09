import { createQuickOrder, getQuickOrderById } from "./db";
import {
  queryProducts,
  getProductByProductId,
  getCatalogCategories,
  getCachedProducts,
  parseItemSpecs,
  normalizeBrand,
  normalizeCategory,
  getProductHaystack,
} from "./services/productService";
import type { Product } from "../drizzle/schema";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface OrderExtracted {
  customerName?: string;
  phone?: string;
  location?: string;
  items: Array<{ name: string; quantity: number }>;
  companyName?: string;
  notes?: string;
}

/**
 * Intelligent parser to extract order parameters from conversation history.
 */
function extractOrderDetails(messages: ChatMessage[]): OrderExtracted {
  const fullText = messages.map((m) => m.content).join("\n");
  const extracted: OrderExtracted = { items: [] };

  // Phone number extraction (Indian 10-digit mobile or with +91)
  const phoneMatch = fullText.match(/(?:\+91[\s-]?)?([6-9]\d{4}[\s-]?\d{5})/);
  if (phoneMatch) {
    extracted.phone = phoneMatch[0].replace(/[\s-]/g, "");
  }

  // Name extraction
  const nameMatch =
    fullText.match(/(?:my name is|i am|name[:\s]+)([a-zA-Z\s]{2,30})(?:,|\s+phone|\s+mobile|\s+at|\s+delivery|\s+location|$)/i) ||
    fullText.match(/(?:call me|customer[:\s]+)([a-zA-Z\s]{2,30})(?:,|\s+phone|\s+mobile|\s+at|\s+delivery|\s+location|$)/i);
  if (nameMatch) {
    extracted.customerName = nameMatch[1].trim();
  }

  // Location extraction
  const locationMatch =
    fullText.match(/(?:deliver(?:y|ed)?\s+(?:to|at|in)|destination[:\s]+|shipping\s+(?:to|at|in)|location[:\s]+|city[:\s]+)([a-zA-Z\s]{2,25}(?:,\s*[a-zA-Z\s]{2,20})?)/i) ||
    fullText.match(/(?:to|in|at)\s+([a-zA-Z]{3,20}(?:,\s*[a-zA-Z]{2,20})?)/i);
  if (locationMatch) {
    const loc = locationMatch[1].trim();
    if (!["the", "our", "my", "this", "need", "want", "order", "buy"].includes(loc.toLowerCase())) {
      extracted.location = loc;
    }
  }

  // Check for Indian 6-digit pincode
  const pincodeMatch = fullText.match(/\b([1-9]\d{5})\b/);
  if (pincodeMatch) {
    extracted.location = extracted.location ? `${extracted.location} (${pincodeMatch[1]})` : pincodeMatch[1];
  }

  // Check for major cities if no location
  if (!extracted.location) {
    const cityMatch = fullText.match(/\b(Ahmedabad|Surat|Vadodara|Rajkot|Mumbai|Pune|Delhi|Jaipur|Bangalore|Bengaluru|Chennai|Hyderabad|Kolkata|Indore|Bhopal|Nagpur|Nashik|Vapi|Ankleshwar|Gandhinagar|Bhavnagar|Jamnagar|Morbi|Udaipur|Gurgaon|Noida)\b/i);
    if (cityMatch) {
      extracted.location = cityMatch[1];
    }
  }

  // Items extraction
  const itemRegex = /(\d+)\s*(?:m|meter|meters|metre|metres|coils?|rolls?|drums?|units?|nos?)?\s+(?:of\s+)?([a-zA-Z0-9\s\.\-\/]+(?:cable|wire|sqmm|conductor|switchgear|lug|gland|jointing|tray|mcb|mccb|rccb))/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRegex.exec(fullText)) !== null) {
    const qty = parseInt(match[1], 10);
    const itemName = match[2].trim();
    if (qty > 0 && itemName.length > 2) {
      extracted.items.push({
        name: `${match[0].trim()}`,
        quantity: qty,
      });
    }
  }

  if (extracted.items.length === 0) {
    const generalQtyMatch = fullText.match(/(\d+)\s*(?:m|meter|meters|metre|metres|coils?|rolls?|drums?)/i);
    const productKeywords = ["cable", "wire", "sqmm", "copper", "armoured", "unarmoured", "xlpe", "pvc", "submersible", "solar", "mcb", "mccb", "gland", "lug"];
    const hasProductKeyword = productKeywords.some((kw) => fullText.toLowerCase().includes(kw));

    if (generalQtyMatch && hasProductKeyword) {
      const qty = parseInt(generalQtyMatch[1], 10);
      extracted.items.push({
        name: "Industrial Cable / Electrical requirement",
        quantity: qty,
      });
    }
  }

  return extracted;
}

/**
 * Handle Math, Arithmetic & Electrical formulas
 */
function handleMathAndFormulas(query: string): string | null {
  const lower = query.toLowerCase().trim();

  // Percentage / GST calculation: e.g. "18% of 50000" or "GST on 25000"
  const gstMatch = lower.match(/(?:gst\s*(?:on|of)?|18%\s*(?:of|on)?)\s*(\d+(?:\.\d+)?)/i);
  if (gstMatch) {
    const base = parseFloat(gstMatch[1]);
    const gst = base * 0.18;
    const total = base + gst;
    return (
      `### 🧮 GST Commercial Breakdown (18% Statutory Electrical Rate):\n\n` +
      `• **Base Taxable Amount**: ₹${base.toLocaleString("en-IN")}\n` +
      `• **18% GST (CGST 9% + SGST 9% / IGST 18%)**: ₹${gst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}\n` +
      `• **Total Landed Invoice Amount**: **₹${total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}**\n\n` +
      `⚡ *Note: Every Volamp tax invoice includes 100% compliant GST input tax credit (ITC) with HSN codes.*`
    );
  }

  const percentMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|on)\s*(\d+(?:\.\d+)?)/i);
  if (percentMatch) {
    const p = parseFloat(percentMatch[1]);
    const val = parseFloat(percentMatch[2]);
    const res = (p / 100) * val;
    return `### 🧮 Calculation:\n**${p}% of ₹${val.toLocaleString("en-IN")}** = **₹${res.toLocaleString("en-IN", { maximumFractionDigits: 2 })}**`;
  }

  // Arithmetic: e.g. "25 * 40", "1500 / 12", "500 + 350", "1000 - 250"
  const mathMatch = lower.match(/(?:what is|calculate|solve)?\s*(\d+(?:\.\d+)?)\s*([\+\-\*\/x×÷\^])\s*(\d+(?:\.\d+)?)/i);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let result = 0;
    let opSymbol = op;

    if (op === "+") { result = a + b; opSymbol = "+"; }
    else if (op === "-") { result = a - b; opSymbol = "-"; }
    else if (op === "*" || op === "x" || op === "×") { result = a * b; opSymbol = "×"; }
    else if (op === "/" || op === "÷") {
      if (b === 0) return "Division by zero is undefined!";
      result = a / b;
      opSymbol = "÷";
    } else if (op === "^") {
      result = Math.pow(a, b);
      opSymbol = "^";
    }

    return `### 🧮 Math Result:\n**${a} ${opSymbol} ${b}** = **${result.toLocaleString("en-IN", { maximumFractionDigits: 4 })}**`;
  }

  // Power (Watts) = Volts * Amps
  const wattsMatch = lower.match(/(?:how many watts|power)\s*(?:is|for)?\s*(\d+)\s*(?:amps?|a)\s*(?:at|and)?\s*(\d+)\s*(?:volts?|v)/i);
  if (wattsMatch) {
    const amps = parseFloat(wattsMatch[1]);
    const volts = parseFloat(wattsMatch[2]);
    const watts = volts * amps;
    const kw = watts / 1000;
    return (
      `### ⚡ Electrical Power Calculation:\n\n` +
      `• **Formula**: $P = V \\times I$ (Single-phase at unity power factor)\n` +
      `• **Voltage ($V$)**: ${volts} V\n` +
      `• **Current ($I$)**: ${amps} A\n` +
      `• **Power**: **${watts.toLocaleString("en-IN")} Watts** (**${kw.toFixed(2)} kW**) (or **${(kw / 0.746).toFixed(2)} HP**)`
    );
  }

  return null;
}

/**
 * Format a Product database item into a clean markdown card with live pricing, discount, specs, and direct product detail link.
 */
function formatProductCard(p: any): string {
  let specsObj: Record<string, string> = {};
  if (p.specifications) {
    try {
      specsObj = typeof p.specifications === "string" ? JSON.parse(p.specifications) : p.specifications;
    } catch {}
  }
  const lines: string[] = [];
  lines.push(`• **${p.name}** (\`${p.sku || p.productId}\`)`);
  lines.push(`  - **Brand & Category**: ${p.brand} · ${p.category}${p.subcategory ? ` (${p.subcategory})` : ""}`);
  if (p.size || p.material) {
    lines.push(`  - **Conductor & Size**: ${p.size || "Standard"} ${p.material ? `· ${p.material}` : ""}`);
  }
  const hasDiscount = Boolean(
    p.discount &&
    p.discount !== "0" &&
    p.discount !== "0.0" &&
    p.discount !== "0 %" &&
    p.discount !== "0.0 %" &&
    p.discount !== "0%"
  );
  const priceDisplay = p.discountedPrice
    ? `**${p.discountedPrice}** ${p.unit || "per meter"}${hasDiscount ? ` *(List: ${p.price}, ${p.discount} OFF Contractor Discount)*` : ""}`
    : p.price || "Contact for Quote";
  lines.push(`  - **Live Contractor Price**: ${priceDisplay}`);

  const techSpecs: string[] = [];
  if (specsObj.voltageRating || specsObj.voltageRatingV) techSpecs.push(`Voltage: ${specsObj.voltageRating || specsObj.voltageRatingV}`);
  const rawRating = specsObj.currentRatingAmp || specsObj.currentRatingA;
  if (rawRating) {
    const cleanRating = String(rawRating).trim();
    techSpecs.push(`Rating: ${cleanRating.endsWith("A") || cleanRating.endsWith("a") ? cleanRating : cleanRating + "A"}`);
  }
  if (specsObj.cores) techSpecs.push(`Cores: ${specsObj.cores}`);
  if (specsObj.typeOfArmour) techSpecs.push(`Armour: ${specsObj.typeOfArmour}`);
  if (specsObj.insulationType) techSpecs.push(`Insulation: ${specsObj.insulationType}`);
  if (specsObj.standard) techSpecs.push(`Standard: ${specsObj.standard}`);
  if (techSpecs.length > 0) {
    lines.push(`  - **Technical Specs**: ${techSpecs.join(" | ")}`);
  }
  lines.push(`  - **Availability**: ${p.availability || "IN STOCK"} (Ahmedabad Central Depot) · MOQ: ${p.moq || "Standard"}`);
  lines.push(`  - [👉 View Full Product Specifications & Order Online](/product/${p.productId})`);
  return lines.join("\n");
}

/**
 * Intelligent parser to decompose user queries into electrical product search dimensions.
 */
export function parseProductQuery(q: string) {
  const lower = q.toLowerCase();
  const idMatch = lower.match(/\b(cab-\d+|swg-\d+|sol-\d+|ear-\d+|lug-\d+|gld-\d+|sku-[\w-]+)\b/i);
  const sizeMatch = lower.match(/\b(\d+(?:\.\d+)?)\s*(?:sqmm|sq\s*mm|sq|mm)\b/i);
  const coreMatch = lower.match(/\b(\d+(?:\.\d+)?)\s*(?:core|cores|c)\b/i);
  const currMatch = lower.match(/\b(\d+(?:\.\d+)?)\s*(?:a|amp|amps)\b/i);

  let voltage: string | null = null;
  if (/11\s*kv/i.test(lower)) voltage = "11kv";
  else if (/33\s*kv/i.test(lower)) voltage = "33kv";
  else if (/1\.1\s*kv|1100\s*v/i.test(lower)) voltage = "1.1kv";
  else if (/1500\s*v/i.test(lower)) voltage = "1500v";

  let brand: string | null = null;
  if (/polycab/i.test(lower)) brand = "polycab";
  else if (/kei/i.test(lower)) brand = "kei";
  else if (/finolex|finnolex/i.test(lower)) brand = "finnolex";
  else if (/schneider|schnieder/i.test(lower)) brand = "schnieder";
  else if (/legrand/i.test(lower)) brand = "legrand";
  else if (/lk|l&t|larsen/i.test(lower)) brand = "lk";
  else if (/(?:volamp|voltamp)\s+(?:products?|brand|cables?|wires?|switchgear|lugs?|glands?|earthing|conduits?)|brand\s*[:=]?\s*(?:volamp|voltamp)/i.test(lower)) brand = "volamp";

  let material: string | null = null;
  if (/copper|cu\b/i.test(lower)) material = "copper";
  else if (/aluminium|aluminum|al\b/i.test(lower)) material = "aluminium";

  let armour: string | null = null;
  if (/unarmour|unarmor/i.test(lower)) armour = "unarmoured";
  else if (/armour|armor/i.test(lower)) armour = "armoured";

  let category: string | null = null;
  if (/mcb|mccb|rccb|switchgear|contactor|isolator|breaker/i.test(lower)) category = "Switchgear";
  else if (/solar/i.test(lower)) category = "Solar";
  else if (/earth|ground/i.test(lower)) category = "Earthing Wires";
  else if (/gland/i.test(lower)) category = "Glands";
  else if (/lug/i.test(lower)) category = "Lugs";
  else if (/conduit|pvc\s*pipe|casing/i.test(lower)) category = "Conduit";
  else if (/wire|cable/i.test(lower)) category = "Wires & Cables";

  const stopWords = new Set([
    "what", "is", "the", "tell", "me", "show", "give", "price", "prices", "cost", "costs",
    "rate", "rates", "discount", "discounts", "of", "for", "in", "with", "and", "please", "do", "you",
    "have", "i", "need", "want", "to", "buy", "order", "can", "how", "much", "find", "search",
    "looking", "about", "any", "available", "product", "products", "item", "items", "details",
    "recommend", "suggest", "which", "are", "there", "list", "options", "give", "send"
  ]);
  const tokens = lower
    .replace(/[\?\,\!\:\;\(\)\"\'\*\#\$\@\%\^\&\=\+]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !stopWords.has(t));

  return {
    productId: idMatch ? idMatch[1].toLowerCase() : null,
    size: sizeMatch ? sizeMatch[1] : null,
    cores: coreMatch ? coreMatch[1] : null,
    voltage,
    brand,
    material,
    armour,
    currentRating: currMatch ? currMatch[1] : null,
    category,
    tokens,
  };
}

/**
 * Intelligent product finder that searches all 3,385+ live catalog products with multi-attribute scoring.
 */
function findMatchingProducts(query: string, limit = 4): Product[] {
  const all = getCachedProducts();
  const parsed = parseProductQuery(query);

  if (parsed.productId) {
    const exact = all.find(
      (p) =>
        p.productId.toLowerCase() === parsed.productId ||
        p.sku.toLowerCase() === parsed.productId ||
        p.sku.toLowerCase().includes(parsed.productId!)
    );
    if (exact) return [exact];
  }

  const scored = all.map((p) => {
    let score = 0;
    const haystack = getProductHaystack(p);

    if (parsed.size) {
      const pSize = (p.size || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (pSize.includes(`${parsed.size} sqmm`) || pName.includes(`${parsed.size} sqmm`)) score += 300;
      else if (pSize.includes(parsed.size) || pName.includes(parsed.size)) score += 100;
      else score -= 200;
    }

    if (parsed.cores) {
      const pSpecs = parseItemSpecs(p.specifications);
      const pCores = `${pSpecs.cores || ""} ${p.name}`.toLowerCase();
      if (pCores.includes(`${parsed.cores} core`) || pCores.includes(`${parsed.cores}core`) || pCores.includes(`${parsed.cores}c`)) score += 250;
      else score -= 150;
    }

    if (parsed.voltage) {
      const pSpecs = parseItemSpecs(p.specifications);
      const pVolt = `${pSpecs.voltageRating || ""} ${pSpecs.voltageRatingV || ""} ${p.name}`.toLowerCase();
      if (parsed.voltage === "11kv" && (pVolt.includes("11 kv") || pVolt.includes("11kv"))) score += 250;
      else if (parsed.voltage === "33kv" && (pVolt.includes("33 kv") || pVolt.includes("33kv"))) score += 250;
      else if (parsed.voltage === "1.1kv" && (pVolt.includes("1100") || pVolt.includes("1.1"))) score += 200;
      else if (parsed.voltage === "1500v" && pVolt.includes("1500")) score += 250;
      else score -= 80;
    }

    if (parsed.brand) {
      if (normalizeBrand(p.brand) === parsed.brand) score += 200;
      else score -= 100;
    }

    if (parsed.material) {
      const pMat = `${p.material || ""} ${p.name}`.toLowerCase();
      if (parsed.material === "copper" && (pMat.includes("copper") || pMat.includes("cu"))) score += 150;
      else if (parsed.material === "aluminium" && (pMat.includes("alumin") || pMat.includes("al"))) score += 150;
      else score -= 100;
    }

    if (parsed.armour) {
      const pSpecs = parseItemSpecs(p.specifications);
      const pArmour = `${pSpecs.typeOfArmour || ""} ${p.name}`.toLowerCase();
      if (parsed.armour === "armoured" && (pArmour.includes("armoured") || pArmour.includes("armored")) && !pArmour.includes("unarmoured")) score += 150;
      else if (parsed.armour === "unarmoured" && (pArmour.includes("unarmoured") || pArmour.includes("unarmored"))) score += 150;
      else score -= 80;
    }

    if (parsed.currentRating) {
      const pSpecs = parseItemSpecs(p.specifications);
      const pCurr = `${pSpecs.currentRatingA || ""} ${pSpecs.currentRatingAmp || ""} ${p.size || ""} ${p.name}`.toLowerCase();
      if (pCurr.includes(`${parsed.currentRating}a`) || pCurr.includes(`${parsed.currentRating}.0a`) || pCurr.includes(`${parsed.currentRating} a`)) score += 250;
      else score -= 120;
    }

    if (parsed.category) {
      if (normalizeCategory(p.category).toLowerCase() === parsed.category.toLowerCase()) score += 80;
    }

    for (const token of parsed.tokens) {
      if (haystack.includes(token)) score += 20;
    }

    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.product);
}

/**
 * Handle Pricing, Cost, Contractor Discounts, and GST Inquiries.
 */
function handlePricingCostsAndDiscounts(query: string): string | null {
  const lower = query.toLowerCase().trim();

  const isPricingOrDiscountQuery =
    /\b(?:prices?|costs?|discounts?|rates?|pricing|bhav|discount\s*slabs?|contractor\s*discounts?|wholesale|margins?|taxes|tax|gst\s*rates?|payment\s*terms?|moqs?|drum\s*costs?)\b/i.test(lower);

  if (!isPricingOrDiscountQuery) return null;

  // Check if they are asking generally about discounts/pricing policy
  const isGeneralDiscountQuery =
    /\b(?:contractor\s*discounts?|wholesale\s*rates?|discount\s*slabs?|payment\s*terms?)\b/i.test(lower) ||
    /\b(?:what|how\s*much|tell\s*me|explain|give|offer|share|any)\b.*\b(?:discounts?|pricing|rates?|slabs?|terms?|structure)\b/i.test(lower) ||
    /^(?:discounts?|prices?|pricing|costs?)$/i.test(lower.replace(/[?.!]/g, "").trim()) ||
    (/\b(?:discount|pricing|rates?|slabs?)\b/i.test(lower) && /\b(?:wires?|cables?|switchgear)\b/i.test(lower) && !/\b\d+\s*(?:sqmm|sq\s*mm|core|a|amp)\b/i.test(lower));

  // Check if specific product tokens exist (e.g. 4 sqmm, 2.5, mcb, mccb, 63a, 10mm, etc.)
  const hasSpecificProduct =
    /\b(?:\d+(?:\.\d+)?\s*(?:sqmm|sq\s*mm|core|a|amp|mm|kva|kw|hp)|copper|aluminium|polycab|kei|finolex|schneider|legrand|mcb|mccb|rccb|gland|lug|conduit|earthing|solar)\b/i.test(lower);

  if (hasSpecificProduct && !isGeneralDiscountQuery) {
    const matched = findMatchingProducts(lower, 4);
    if (matched.length > 0) {
      const productCards = matched.map(formatProductCard).join("\n\n");
      const cleanLabel = query.trim();

      return (
        `### 💰 Live Factory Pricing & Contractor Discounts for "${cleanLabel}":\n\n` +
        `${productCards}\n\n` +
        `---\n\n` +
        `### ⚡ Commercial Pricing Architecture at Volamp:\n` +
        `• **Contractor Discount**: Direct **40% OFF** applied from published manufacturer list prices across our catalog (Polycab, KEI, Finolex, Schneider Electric, Legrand, LK), exactly as listed on our website.\n` +
        `• **Statutory Tax**: 18% GST (CGST 9% + SGST 9% in Gujarat; IGST 18% interstate). Full GST input tax credit invoice issued on dispatch.\n` +
        `• **Packaging & Freight**: Coils (90m/180m/300m) or Continuous Heavy Wooden Drums (500m/1000m). Dispatched from our **Ahmedabad Fulfillment Hub within 24–48 hours** under Shipping Policy VEP/LOG/001.\n` +
        `• **Payment & Credit**: NEFT/RTGS, instant WhatsApp digital invoice, and **30-day corporate credit** for approved POs with active GSTIN.\n\n` +
        `**Want to lock in this stock?** Tell me your required length/quantity, customer name, contact phone number, and delivery city, and I'll generate your official **Volamp Order Reference ID** right now!`
      );
    }
  }

  // General Pricing & Discount Policy
  return (
    `### 💰 Volamp Commercial Pricing, Cost & Contractor Discount Architecture\n\n` +
    `At **Volamp Elektrikals Private Limited**, our direct-from-depot wholesale pricing structure is engineered specifically for electrical contractors, EPC infrastructure builders, panel fabricators, and industrial procurement desks:\n\n` +
    `---\n\n` +
    `#### 1. 🏷️ Contractor Discount (40% OFF Across Catalog):\n` +
    `We offer a flat **40% OFF** manufacturer list prices across all product categories, exactly as listed on our website:\n\n` +
    `• **Wires & Cables (2,856 Products)**:\n` +
    `  - **40% OFF** standard manufacturer list prices across Polycab, KEI, Finolex, and Volamp.\n` +
    `  - Covers Single Core House Wires (FR, FRLS, ZHFR), LT Armoured XLPE/PVC Power & Control Cables, Submersible Flat Cables, and 1500V DC Solar PV Cables.\n\n` +
    `• **Switchgear & Circuit Protection (221 Products)**:\n` +
    `  - **40% OFF** on Schneider Electric, LK (L&T), and Legrand.\n` +
    `  - Covers MCBs, RCCBs, MCCBs (16A to 1250A), Heavy Power Contactors, Overload Relays, and Distribution Boards.\n\n` +
    `• **Conduit & Cable Containment (93 Products)**:\n` +
    `  - **40% OFF** on Rigid uPVC Conduits (LMS, MMS, HMS conforming to IS 9537) and Casing & Capping.\n\n` +
    `• **Cable Glands & Terminals (104 Products)**:\n` +
    `  - **40% OFF** on Single & Double Compression Brass Glands and Heavy-Duty Tinned Copper / Bimetallic Crimping Lugs.\n\n` +
    `• **Earthing Systems & Solar Electrical (97 Products)**:\n` +
    `  - **40% OFF** on Copper-Bonded Rods, Chemical Electrodes, Backfill Compound, and Solar Accessories.\n\n` +
    `---\n\n` +
    `#### 2. 🧮 Tax & Cost Breakdown:\n` +
    `• **List Price / MRP**: Baseline published manufacturer price.\n` +
    `• **Wholesale Net**: List Price minus **40% Contractor Discount**.\n` +
    `• **18% GST**: Standard electrical statutory tax (CGST 9% + SGST 9% within Gujarat; IGST 18% interstate). 100% input tax credit (ITC) passed on every consignment.\n` +
    `• **Net Landed Price**: Net Taxable + 18% GST.\n\n` +
    `#### 3. 💳 Commercial Payment Terms & Dispatch:\n` +
    `• **Direct NEFT / RTGS**: Instant account settlement.\n` +
    `• **30-Day Corporate Credit**: Available for verified contractors, OEMs, and institutions upon submission of valid GST registration and approved Purchase Order (PO).\n` +
    `• **WhatsApp Instant Invoicing**: Digital proforma invoice sent straight to your phone with instant UPI/NEFT payment links.\n` +
    `• **Dispatch Speed (Policy VEP/LOG/001)**: Standard inventory dispatches within **24–48 hours** from our Central Fulfillment Hub in Aslali, Ahmedabad.\n\n` +
    `Would you like me to calculate the exact net cost for a specific cable size or switchgear rating? Tell me what you need!`
  );
}

/**
 * Handle Business Segments (All 10 Specialized Segments).
 */
function handleBusinessSegments(query: string): string | null {
  const lower = query.toLowerCase().trim();

  const isSegmentQuery =
    /\b(?:business\s*segment|segments|what\s+industries|sectors|epc|infrastructure|heavy\s*industry|manufacturing\s*plant|commercial\s*real\s*estate|solar\s*renewable|power\s*utilit|substation|panel\s*builder|oem|defense|railway|gem\s*supply|distribution\s*(?:&|and)\s*control|ev\s*charging|automation)\b/i.test(lower);

  if (!isSegmentQuery) return null;

  // EPC & Infrastructure
  if (/epc|infrastructure|highway|metro|airport|bridge|smart\s*city/i.test(lower)) {
    return (
      `### 🏗️ Segment 01: EPC & Infrastructure Electrification\n\n` +
      `**Target Clients**: Highways, Metro Rail Projects, Airports, Sea Ports, River Bridges & Smart City Electrification.\n\n` +
      `• **Flagship Supplies**:\n` +
      `  - 1.1kV & 11kV/33kV XLPE Armoured Power Cables (Aluminium A2XWY, Copper 2XWY) to IS 7098 (Part 1 & 2).\n` +
      `  - Heavy-Duty Hot-Dip Galvanized (GI) Perforated & Ladder Cable Trays and Raceways.\n` +
      `  - High-Fault Trefoil Cable Cleats for mechanical short-circuit containment.\n` +
      `  - Maintenance-Free Chemical Earthing Electrodes & ESE Lightning Arresters.\n` +
      `• **Engineering Standards**: IS 7098, CPRI / ERDA Type Tested, Original Material Test Certificate ( MTC ) accompanying every wooden drum.\n` +
      `• **Logistics**: Direct site dispatch across India from our Ahmedabad central fulfillment depot.`
    );
  }

  // Heavy Industry & Manufacturing
  if (/manufacturing|heavy\s*industry|steel\s*mill|chemical|pharma|cement|auto\s*plant/i.test(lower)) {
    return (
      `### 🏭 Segment 02: Heavy Industry & Manufacturing Plants\n\n` +
      `**Target Clients**: Chemical & Petrochemical Plants, Pharmaceutical Formulations, Steel Mills, Cement Plants, Auto OEMs.\n\n` +
      `• **Flagship Supplies**:\n` +
      `  - VFD Shielded Symmetrical Motor Power Cables (copper tape / braided shield) to suppress high-frequency PWM harmonics.\n` +
      `  - Heat-Resistant Silicon Rubber & Class F/H Insulated Wires.\n` +
      `  - Air Circuit Breakers (ACB) up to 4000A with microprocessor releases.\n` +
      `  - Motor Protection Circuit Breakers (MPCB) and Heavy-Duty Type 2 Coordinated Contactors.\n` +
      `• **Standards**: IS 1554 / IS 694, Flame-Retardant Low Smoke (FRLS), Class 5 high-flexibility electrolytic copper conductors.`
    );
  }

  // Commercial & Real Estate
  if (/commercial|real\s*estate|tower|high-rise|mall|it\s*park|township/i.test(lower)) {
    return (
      `### 🏢 Segment 03: Commercial High-Rise & Real Estate\n\n` +
      `**Target Clients**: Grade-A Commercial Towers, IT Parks, Shopping Malls, Luxury High-Rise Residential Townships.\n\n` +
      `• **Flagship Supplies**:\n` +
      `  - Zero-Halogen (ZHFR / LSZH) Building Wires (< 0.5% acid gas emission) conforming to National Building Code (NBC 2016).\n` +
      `  - SPN, TPN & Vertical Distribution Boards (IP43/IP54 rating).\n` +
      `  - Multi-Function Digital Energy & Power Quality Meters.\n` +
      `  - Underfloor Cable Trunking, Flush Floor Junction Boxes & Rigid uPVC Conduits.\n` +
      `• **Compliance**: NBC 2016 Compliant, IS 694 Certified, Green Building Council Approved.`
    );
  }

  // Solar & Renewable Energy
  if (/solar|renewable|pv\s*farm|rooftop|bess|inverter/i.test(lower)) {
    return (
      `### ☀️ Segment 04: Solar & Renewable Energy Infrastructure\n\n` +
      `**Target Clients**: Utility-Scale Solar PV Farms, Commercial Rooftops, Battery Energy Storage Systems (BESS).\n\n` +
      `• **Flagship Supplies**:\n` +
      `  - 1.5 kV DC Solar PV Cables (EN 50618 / TÜV 2 Pfg 1169 certified, electron-beam XLPO, tinned copper, 4/6/10 sqmm).\n` +
      `  - MC4 IP68 Connectors & Multi-Branch Splitters.\n` +
      `  - Array Junction Boxes (AJB / String Monitoring Boxes SMB) with 1000V/1500V DC fuses.\n` +
      `  - DC Isolators & Type 2 DC Surge Protective Devices (SPDs).\n` +
      `• **Specs**: UV & ozone resistant, withstands -40°C to +120°C, 25+ year outdoor operational life.`
    );
  }

  // Power Utilities & Substations
  if (/power\s*utilit|discom|substation|transmission|grid|transformer/i.test(lower)) {
    return (
      `### ⚡ Segment 05: Power Utilities & Grid Sub-stations\n\n` +
      `**Target Clients**: State Transmission Utilities (GETCO, MSETCL, etc.), DISCOMs, Step-Down Substations (11kV / 33kV / 66kV).\n\n` +
      `• **Flagship Supplies**:\n` +
      `  - Extra High Voltage (EHV) & HT Underground Power Feeders (11kV, 22kV, 33kV XLPE Aluminium A2XWY).\n` +
      `  - High-Conductivity Electrolytic Copper & Aluminium Busbars.\n` +
      `  - Current Transformers (CT) & Potential Transformers (PT).\n` +
      `  - Station-Class Lightning Arresters & Gang-Operated Air Break (GOAB) Switches.\n` +
      `• **Inspections**: Third-Party Inspection Agency (TPIA: RITES, SGS, TUV, BV) cleared.`
    );
  }

  // Panel Builders & OEMs
  if (/panel\s*builder|oem|switchboard|mcc\b|fabricat/i.test(lower)) {
    return (
      `### ⚙️ Segment 06: Panel Builders & OEM Fabricators\n\n` +
      `**Target Clients**: LV/MV Switchboard Fabricators, Motor Control Centers (MCC), Automation Panel Builders.\n\n` +
      `• **Flagship Supplies**:\n` +
      `  - Tri-Rated UL / CSA / BS Flexible Control Panel Wires (Class 5 fine copper strands).\n` +
      `  - Power Contactors (9A to 800A AC-3) & Thermal Overload Relays from Schneider Electric and LK (L&T).\n` +
      `  - 22.5mm Push Buttons, Selector Switches & High-Intensity LED Pilot Lights.\n` +
      `  - Feed-Through DIN-Rail Terminal Blocks, End Clamps, and Printed Ferrules.\n` +
      `• **Standards**: IS 13947 / IEC 60947, CE / UL component grades with batch-to-batch consistency.`
    );
  }

  // Government, Defense & PSUs (GeM)
  if (/defense|railway|gem|government|psu|cpwd|mes|rdso/i.test(lower)) {
    return (
      `### 🛡️ Segment 07: Government, Defense & Institutional Supplies (GeM)\n\n` +
      `**Target Clients**: Indian Railways, Central PWD (CPWD), Military Engineer Services (MES), Defense Projects, Government e-Marketplace (GeM).\n\n` +
      `• **Flagship Supplies**:\n` +
      `  - RDSO-Approved Railway Signaling & Trackside Power Cables.\n` +
      `  - Heavy-Duty Weatherproof Outdoor Feeder Pillars & Distribution Enclosures.\n` +
      `  - GeM-Registered Certified Distribution Boards & Industrial Switchgear.\n` +
      `  - Flameproof / Explosion-Proof Ex d IIC Junction Boxes.\n` +
      `• **Compliance**: Verified GeM OEM/Reseller, RDSO & MES Compliant, dedicated public tender bidding desk.`
    );
  }

  // General 10 Business Segments Overview
  return (
    `### ⚡ Volamp Elektrikals — 10 Specialized Business Segments\n\n` +
    `At **Volamp Elektrikals Private Limited**, we deliver an end-to-end engineered supply chain across **10 core industrial sectors**:\n\n` +
    `1. 🏗️ **EPC & Infrastructure**: 1.1kV & 11kV/33kV XLPE Armoured cables, perforated GI cable trays, trefoil cleats, chemical earthing (IS 7098).\n` +
    `2. 🏭 **Heavy Industry & Manufacturing**: VFD shielded cables, silicon rubber high-temp wires, ACBs up to 4000A, MPCBs for chemical, pharma & steel plants.\n` +
    `3. 🏢 **Commercial & Real Estate**: Zero-Halogen (ZHFR) building wires, SPN/TPN vertical DBs, multi-function digital energy meters (NBC 2016).\n` +
    `4. ☀️ **Solar & Renewable Energy**: 1.5 kV DC Solar PV Cables (EN 50618/TÜV), MC4 connectors, Array Junction Boxes (AJB), DC fuses & isolators.\n` +
    `5. ⚡ **Power Utilities & Sub-stations**: EHV & HT feeders (11kV to 33kV), electrolytic copper/alu busbars, CT/PTs, lightning arresters (TPIA cleared).\n` +
    `6. ⚙️ **Panel Builders & OEMs**: Tri-rated UL flexible wires, Schneider/LK power contactors, overload relays, push buttons, DIN-rail terminals.\n` +
    `7. 🛡️ **Government, Defense & PSUs (GeM)**: RDSO railway signaling cables, CPWD/MES supplies, GeM verified distribution enclosures.\n` +
    `8. 🔌 **Electrical Distribution & Control**: Busbar Trunking Systems (BBT), APFC power factor capacitor banks, Type 1+2 surge protective devices.\n` +
    `9. 🚗 **EV Charging Infrastructure**: High-ampacity charging cables, Type 2 connectors, dedicated EV sub-distribution boards, IP66 housings.\n` +
    `10. 🤖 **Electrical Panels & Automation**: Turnkey PCC, MCC, APFC, AMF/ATS automatic transfer panels, PLCs, Variable Frequency Drives (VFDs).\n\n` +
    `**One Accountable Partner. Complete Electrical Solutions.**\n` +
    `Which business segment matches your site? Tell me your load or required BOM, and I'll tailor the exact specs and quotation right away!`
  );
}

/**
 * Handle About Us, 4 Generations, Heritage, CEO Message, Team, and Headquarters.
 */
function handleAboutUsAndHeritage(query: string): string | null {
  const lower = query.toLowerCase().trim();

  const isAboutQuery =
    /\b(?:about\s*volamp|about\s*us|who\s*are\s*you|history|heritage|legacy|4\s*generation|four\s*generation|founder|origin|founded|soma\s*bhai|chaturbhai|vipulbhai|naimil|patel|ceo|quote|message|vision|team|headquarters|office|address|where\s*(?:are\s*you|is\s*volamp)|location|khadia|aslali|sanand|cin|gstin|gem\s*registration)\b/i.test(lower);

  if (!isAboutQuery) return null;

  const isHistoryOr4Gen = /\b(?:history|story|heritage|legacy|4\s*generation|four\s*generation|origin|founded|1964|soma\s*bhai)\b/i.test(lower);

  // CEO Message specifically: only if NOT asking about history or 4 generations
  if (!isHistoryOr4Gen && /\b(?:ceo|message|quote|vision|leader|director|naimil)\b/i.test(lower) && !lower.includes("price") && !lower.includes("order")) {
    return (
      `### 💬 CEO Message — Naimil Patel: *"Saath Milkar Growth Ki Ek Nayi Pehchaan Banayein"*\n\n` +
      `> *"Koi bhi company sirf products se nahi banti — company banti hai INSAN, unki mehnat, commitment aur customer ke trust se.*\n` +
      `> *Volamp Elektrikals ke safar mein hamara focus sirf business grow karna nahi, balki trust, quality aur strong relations build karna hai."*\n\n` +
      `**Core Pillars of Our Leadership Vision:**\n` +
      `• **Continuous Upgrades**: Relentless modernization of manufacturing specifications, testing procedures, and digital supply workflows.\n` +
      `• **Long-Term Partnerships**: Every contractor, EPC, and client is treated as a 20-year relationship, never a one-off transaction.\n` +
      `• **Ownership & Accountability**: Empowering every team member to take personal responsibility for zero-defect consignment delivery.\n` +
      `• **Motto**: *"Together, Let's Power the Growth. Together, Let's Build Volamp and India."*\n\n` +
      `**Key Leadership & Supply Desk Team:**\n` +
      `• **Naimil Patel** — Chief Executive Officer\n` +
      `• **Roshni Shroff, Pooja Thakor, Pooja Patel** — Sales & Client Solutions\n` +
      `• **Jinay Patel** — Switchgear Sourcing Specialist\n` +
      `• **Dhaval Rana** — Finance & Accounts Manager\n` +
      `• **Montu Patil** — Logistics & Operations Manager\n\n` +
      `Direct Supply Desk: **+91 9512365582** | sales@volampelektrikals.com`
    );
  }

  // Complete About Us & 4-Generation History
  return (
    `### 🏛️ Four Generations. 60+ Years of Legacy. One Vision for the Future.\n\n` +
    `The journey of **VOLAMP ELEKTRIKALS PRIVATE LIMITED** represents over six decades of family entrepreneurship, engineering discipline, and industrial trust rooted in Gujarat:\n\n` +
    `---\n\n` +
    `#### 1. 1964 — 1st Generation (Soma Bhai Khatubhai Patel)\n` +
    `An ITI-trained electrician from Panchmahal, Gujarat, who moved to Ahmedabad driven by entrepreneurial ambition. After working in textile and flour mills, he co-founded **S.P. Electric and Engineering Company** as a partnership firm in **June 1964** — sparking a multi-generational electrical legacy.\n\n` +
    `#### 2. 1970s–80s — 2nd Generation (Chaturbhai Somabhai Patel)\n` +
    `Carried the enterprise forward by expanding distribution across Gujarat's booming manufacturing corridors (Ahmedabad, Vadodara, Ankleshwar, Vapi), establishing decades of integrity and technical reliability.\n\n` +
    `#### 3. 1986 — 3rd Generation (Vipulbhai Chaturbhai Patel)\n` +
    `Entered the trade in 1986. Under his guidance, the business adapted to rapid infrastructure advancements, diversifying into modern switchgear, power cables, and multi-regional industrial contracts.\n\n` +
    `#### 4. 2008–Present — 4th Generation (Naimil Vipul Patel · CEO)\n` +
    `Having an innate passion for electrical cables from his school days, Naimil studied Electrical Engineering (2008–2012) while working from the ground up. In **2014**, he established **Volamp Power**, scaling nationwide supply partnerships. In **2021**, the family restructured for the next 50+ years, incorporating **Volamp Elektrikals Private Limited**.\n\n` +
    `---\n\n` +
    `### 🏢 Operational Infrastructure & Registrations:\n` +
    `• **Corporate Headquarters**: 1753, Khadia, Ahmedabad, Gujarat 380001\n` +
    `• **Central Logistics & Fulfillment Hub**: Aslali, Ahmedabad (24–48 hour rapid dispatch across India & overseas)\n` +
    `• **Quality Testing Facility**: Sanand & Ahmedabad (High-voltage spark testing, IS 7098 & IS 694 compliance)\n` +
    `• **Statutory Details**: CIN: **U31900GJ2021PTC122730** | GSTIN: **24AAICV0754B1ZO**\n` +
    `• **Institutional Registration**: Verified GeM (Government e-Marketplace) Supplier\n` +
    `• **Direct Supply Desk**: 📞 **+91 9512365582** | ✉️ **sales@volampelektrikals.com**\n\n` +
    `You can explore our interactive 3D global presence on our **[About Volamp Page](/about-volamp)** or tell me your site needs!`
  );
}

/**
 * Handle Technical Engineering Sizing, Voltage Drop & Cable Calculations.
 */
function handleTechnicalEngineeringAndSizing(query: string): string | null {
  const lower = query.toLowerCase().trim();

  const isCalculationOrSizing =
    /\b(?:calculat|cable\s*size|size\s*cable|sizing|voltage\s*drop|conductor\s*calc|kw\s*to\s*amp|amp\s*for|drop\s*calc|sizing\s*matrix|sizing\s*chart|breaker\s*rating)\b/i.test(lower);

  if (!isCalculationOrSizing) return null;

  // Specific load mentioned (e.g., 30 kw, 50 hp)
  const kwMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kw|kilo\s*watts?)/i);
  const hpMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hp|horse\s*power)/i);
  let kwVal = kwMatch ? parseFloat(kwMatch[1]) : hpMatch ? parseFloat(hpMatch[1]) * 0.746 : null;

  if (kwVal && kwVal > 0) {
    // 3-Phase 415V calculation with 0.85 PF
    const amps3P = Math.round((kwVal * 1000) / (1.732 * 415 * 0.85) * 10) / 10;
    let recSize = "2.5 sq.mm Copper / 4 sq.mm Aluminium";
    let breaker = "16A C-Curve MCB";
    if (amps3P > 15 && amps3P <= 25) { recSize = "4 sq.mm Copper / 6 sq.mm Aluminium"; breaker = "25A / 32A MCB"; }
    else if (amps3P > 25 && amps3P <= 35) { recSize = "6 sq.mm Copper / 10 sq.mm Aluminium"; breaker = "40A MCB"; }
    else if (amps3P > 35 && amps3P <= 50) { recSize = "10 sq.mm Copper / 16 sq.mm Aluminium"; breaker = "63A MCB / MCCB"; }
    else if (amps3P > 50 && amps3P <= 70) { recSize = "16 sq.mm Copper / 25 sq.mm Aluminium"; breaker = "80A / 100A MCCB"; }
    else if (amps3P > 70 && amps3P <= 95) { recSize = "25 sq.mm Copper / 35 sq.mm Aluminium"; breaker = "100A / 125A MCCB"; }
    else if (amps3P > 95 && amps3P <= 125) { recSize = "35 sq.mm Copper / 50 sq.mm Aluminium"; breaker = "125A / 160A MCCB"; }
    else if (amps3P > 125 && amps3P <= 160) { recSize = "50 sq.mm Copper / 70 sq.mm Aluminium"; breaker = "160A / 200A MCCB"; }
    else if (amps3P > 160 && amps3P <= 200) { recSize = "70 sq.mm Copper / 95 sq.mm Aluminium"; breaker = "200A / 250A MCCB"; }
    else if (amps3P > 200 && amps3P <= 250) { recSize = "95 sq.mm Copper / 120 sq.mm Aluminium"; breaker = "250A / 315A MCCB"; }
    else if (amps3P > 250 && amps3P <= 300) { recSize = "120 sq.mm Copper / 150 sq.mm Aluminium"; breaker = "315A / 400A MCCB"; }
    else if (amps3P > 300) { recSize = "185 sq.mm+ Copper / 240 sq.mm+ Aluminium"; breaker = "400A+ MCCB / ACB"; }

    return (
      `### ⚡ High-Precision Cable Sizing for **${kwVal.toFixed(1)} kW Load**\n\n` +
      `• **Full Load Current (3-Phase 415V, 0.85 PF)**: **${amps3P} Amperes**\n` +
      `• **Recommended Cable Cross-Section**: **${recSize}**\n` +
      `• **Recommended Circuit Breaker**: **${breaker}**\n` +
      `• **Governing Standards**: Conforms to **IS 7098 (Part 1/2)** for XLPE armoured cables and **IS 694** for flexible copper building wires.\n` +
      `• **Voltage Drop Rule**: For runs exceeding 80 meters, step up conductor size by one cross-section to guarantee voltage drop remains **≤ 3%**.\n\n` +
      `**Live Pricing & Brand Selection:**\n` +
      `👉 Launch our **[Interactive Cable Calculator & Estimator](/calculator)** to compare **Polycab, Finolex, KEI, and Volamp OEM** discounts, compute drum weights, and generate an official project BOQ!`
    );
  }

  // General Sizing Matrix & Calculator Guide
  return (
    `### ⚡ Volamp Engineering Sizing Matrix & Cable Calculator\n\n` +
    `Here is the official quick reference sizing matrix based on **IS 7098 Part 1 (XLPE)** and **IS 694** for 3-Phase 415V electrical loads:\n\n` +
    `| Load (kW / HP) | Current (415V, 0.85 PF) | Recommended Copper | Recommended Aluminium | Recommended Breaker |\n` +
    `| :--- | :--- | :--- | :--- | :--- |\n` +
    `| **3.7 kW (5 HP)** | 7.2 A | **2.5 sq.mm** | **4 sq.mm** | 16A MCB |\n` +
    `| **7.5 kW (10 HP)** | 14.1 A | **4 sq.mm** | **10 sq.mm** | 25A MCB |\n` +
    `| **15 kW (20 HP)** | 27.5 A | **10 sq.mm** | **16 sq.mm** | 40A MCB |\n` +
    `| **22 kW (30 HP)** | 40.0 A | **16 sq.mm** | **25 sq.mm** | 63A MCB |\n` +
    `| **30 kW (40 HP)** | 54.5 A | **25 sq.mm** | **35 sq.mm** | 80A MCCB |\n` +
    `| **45 kW (60 HP)** | 81.5 A | **35 sq.mm** | **70 sq.mm** | 125A MCCB |\n` +
    `| **75 kW (100 HP)** | 135.0 A | **70 sq.mm** | **120 sq.mm** | 200A MCCB |\n` +
    `| **110 kW (150 HP)** | 196.0 A | **120 sq.mm** | **185 sq.mm** | 315A MCCB |\n` +
    `| **160 kW (215 HP)** | 284.0 A | **185 sq.mm** | **300 sq.mm** | 400A MCCB / ACB |\n\n` +
    `• **Voltage Drop Limit**: Maximum allowable voltage drop is **3% for domestic/lighting** and **5% for industrial power feeders**.\n` +
    `• **Direct Calculator Tool**: Open our **[Cable Calculator Page](/calculator)** for instant voltage drop analysis, contractor discount simulation, and PDF export!`
  );
}

/**
 * Handle Electrical & Science Q&A (Non-AI, authoritative tone).
 */
function handleScienceAndElectrical(query: string): string | null {
  const lower = query.toLowerCase().trim();

  // What is electricity
  if (/what\s+is\s+electricity|how\s+does\s+electricity\s+work/i.test(lower)) {
    return (
      `### ⚡ What is Electricity?\n\n` +
      `**Electricity** is the flow of electric charge, primarily the movement of free electrons through a conductive metal lattice (like electrolytic copper or aluminium).\n\n` +
      `• **Voltage ($V$)**: The electrical potential difference or "pressure" pushing charges through the circuit (Volts).\n` +
      `• **Current ($I$)**: The rate of electrical charge flow past a specific point (Amperes).\n` +
      `• **Resistance ($R$)**: The opposition a material offers to charge flow (Ohms, $\\Omega$).\n` +
      `• **Ohm's Law**: $V = I \\times R$.\n\n` +
      `In electrical cables, higher purity conductors (like Volamp's 99.97% electrolytic copper) minimize resistance, preventing dangerous heat buildup and energy loss.`
    );
  }

  // AC vs DC
  if (/ac\s*(?:vs|or|and)\s*dc|alternating\s*current|direct\s*current/i.test(lower)) {
    return (
      `### ⚡ AC (Alternating Current) vs. DC (Direct Current):\n\n` +
      `• **AC (Alternating Current)**:\n` +
      `  - Reverses direction periodically (in India, **50 Hz**, reversing 50 times per second).\n` +
      `  - **Advantage**: Stepped up/down easily using transformers, enabling hyper-efficient transmission over long-distance power grids.\n` +
      `  - **Uses**: Wall sockets, grid infrastructure, induction motors.\n\n` +
      `• **DC (Direct Current)**:\n` +
      `  - Flows unidirectionally with constant polarity.\n` +
      `  - **Uses**: Solar PV systems, batteries, electronics, Electric Vehicles (EVs).\n\n` +
      `Volamp stocks both AC industrial power cables and specialized 1.5 kV DC Solar PV cables!`
    );
  }

  // Transformer
  if (/how\s+does\s+a\s+transformer\s+work|what\s+is\s+a\s+transformer/i.test(lower)) {
    return (
      `### ⚡ How a Transformer Works:\n\n` +
      `A **transformer** transfers electrical power between circuits through **electromagnetic induction** at constant frequency:\n\n` +
      `1. **Primary Winding**: AC current produces an alternating magnetic flux in the laminated iron core.\n` +
      `2. **Laminated Core**: Channels magnetic flux to the secondary winding with minimal eddy current losses.\n` +
      `3. **Secondary Winding**: Induces an AC voltage proportional to the turns ratio (Faraday's Law).\n\n` +
      `• **Step-Up**: More secondary turns $\\rightarrow$ boosts voltage for high-voltage grid transmission.\n` +
      `• **Step-Down**: Fewer secondary turns $\\rightarrow$ steps down 11kV or 415V to 230V for safe usage.`
    );
  }

  // Earthing / Grounding
  if (/earthing|grounding|why\s+is\s+earthing\s+important|how\s+does\s+earthing\s+work/i.test(lower)) {
    return (
      `### 🌍 Why Earthing (Grounding) is Critical (IS 3043:2018):\n\n` +
      `**Earthing** establishes an immediate, low-resistance path to discharge fault currents safely into the mass of the earth.\n\n` +
      `1. **Human Shock Protection**: When equipment insulation fails, the metal body becomes live. Proper earthing creates a low-resistance path that triggers the MCB/RCCB within milliseconds, averting fatal electrocution.\n` +
      `2. **Surge & Lightning Protection**: Safely diverts direct atmospheric lightning and grid switching surges.\n` +
      `3. **Neutral Reference**: Maintains voltage stabilization across 3-phase circuits.\n\n` +
      `Volamp supplies **copper-bonded rods (100–250 microns), pipe-in-pipe chemical electrodes, carbonaceous compound (< 0.2 Ω·m), and GI/copper earthing strips**.`
    );
  }

  // MCB vs MCCB vs RCCB
  if (/mcb|mccb|rccb|elcb|circuit\s*breaker/i.test(lower)) {
    return (
      `### 🛡️ Circuit Breakers Explained (MCB, MCCB, RCCB):\n\n` +
      `• **MCB (Miniature Circuit Breaker)**: Rated 0.5A to 63A. Trips on thermal overload (bimetallic strip) and short circuit (magnetic solenoid). Breaking capacity 6kA / 10kA (IS/IEC 60898).\n` +
      `• **MCCB (Moulded Case Circuit Breaker)**: Rated 16A to 1250A. Adjustable thermal-magnetic or microprocessor trip units with 25kA, 36kA, 50kA breaking capacity for main industrial feeders.\n` +
      `• **RCCB / RCBO (Residual Current Circuit Breaker)**: Detects earth leakage current (30mA for human shock protection; 100mA/300mA for fire protection). Essential for safety!`
    );
  }

  // Copper vs Aluminium
  if (/copper\s*(?:vs|or)\s*alumin/i.test(lower) || /alumin\s*(?:vs|or)\s*copper/i.test(lower)) {
    return (
      `### ⚡ Copper vs. Aluminium Conductors: Technical Comparison\n\n` +
      `• **Conductivity**: Copper = 100% IACS. Aluminium = ~61% IACS. Aluminium requires **~1.6x the cross-sectional area** of Copper to carry equal current.\n` +
      `• **Tensile Strength & Creep**: Copper has double the tensile strength and does not suffer from loose terminal joints. Aluminium expands/contracts rapidly under thermal cycles and oxidizes upon air contact (always terminate with bimetallic lugs and anti-oxidant paste).\n` +
      `• **Weight & Cost**: Aluminium is ~3x lighter and dramatically cheaper per kg. For heavy distribution cables (16 sqmm to 630 sqmm), Aluminium provides unbeatable cost savings. Copper is preferred for house wires, control panels, and tight spaces.`
    );
  }

  // XLPE vs PVC
  if (/xlpe\s*(?:vs|or)\s*pvc|pvc\s*(?:vs|or)\s*xlpe/i.test(lower)) {
    return (
      `### ⚡ XLPE vs. PVC Insulation:\n\n` +
      `• **Continuous Temperature**: XLPE = **90°C** continuous (250°C short circuit). PVC = **70°C** continuous (160°C short circuit).\n` +
      `• **Current Carrying Capacity**: XLPE handles higher operating temperatures, carrying **15% to 25% more current** than identical-sized PVC conductors.\n` +
      `• **Dielectric & Moisture Strength**: XLPE has virtually zero moisture absorption and superior dielectric resistance, making it the modern standard for power cables (IS 7098).\n` +
      `• **PVC Advantages**: Higher mechanical flexibility and lower cost for building wires (IS 694).`
    );
  }

  // FR vs FRLS vs ZHFR
  if (/fr\s*(?:vs|or)\s*frls|frls\s*(?:vs|or)\s*zhfr|lszh\s*(?:vs|or)\s*frls/i.test(lower)) {
    return (
      `### 🔥 FR vs. FRLS vs. ZHFR (Flame Retardant Grades):\n\n` +
      `• **FR (Flame Retardant)**: Oxygen index > 29%. Restricts flame propagation along the cable run, but emits dense black smoke and acidic HCl gas.\n` +
      `• **FRLS (Flame Retardant Low Smoke)**: Restricts fire spread + smoke density < 60% and acid gas < 20%. Improves visibility during building evacuations.\n` +
      `• **ZHFR / LSZH (Zero Halogen Flame Retardant)**: Emits **zero toxic halogen gases** (acid gas < 0.5%). Generates clean water-vapor smoke that does not choke occupants or corrode electronic servers. Mandatory for metro rail, airports, hospitals, and high-rise towers (NBC 2016).`
    );
  }

  return null;
}

/**
 * Handle Product and Catalog Inquiries across all 3,385+ products and 8 categories.
 */
function handleProductAndCatalogQuery(query: string): string | null {
  const lower = query.toLowerCase().trim();

  // Avoid capturing pure technical sizing calculations, heritage/story, or business segments
  if (/\b(?:calculate\s+(?:cable\s+)?size|cable\s+sizing|sizing\s+for|how\s+many\s+sqmm\s+for)\b/i.test(lower)) return null;
  if (/\b(?:history|heritage|4\s*generations?|four\s*generations?|founder|story|ceo|who\s+founded|who\s+started|journey)\b/i.test(lower)) return null;
  if (/\b(?:business\s*segment|segments|what\s+industries|sectors|what\s+sectors|industries\s+do\s+you\s+serve)\b/i.test(lower)) return null;
  if (/\b(?:contractor\s*discounts?|discount\s*slabs?|what\s+discounts?|pricing\s*architecture)\b/i.test(lower) && !/\b\d+\s*(?:sqmm|sq\s*mm|core|a|amp|kv)\b/i.test(lower)) return null;

  // 1. DIRECT PRODUCT ID / SKU LOOKUP (e.g. CAB-000001, SWG-000012, SOL-000003, SKU-CAB-...)
  const skuMatch = lower.match(/\b(cab-\d+|swg-\d+|sol-\d+|ear-\d+|lug-\d+|gld-\d+|sku-[\w-]+)\b/i);
  if (skuMatch) {
    const targetId = skuMatch[1].toUpperCase();
    const all = getCachedProducts();
    const prod =
      getProductByProductId(targetId) ||
      all.find(
        (p) =>
          p.productId.toUpperCase() === targetId ||
          p.sku.toUpperCase() === targetId ||
          p.sku.toLowerCase().includes(skuMatch[1].toLowerCase())
      );
    if (prod) {
      return (
        `### ⚡ Verified Product Specification & Live Pricing:\n\n` +
        `${formatProductCard(prod)}\n\n` +
        `---\n\n` +
        `**Commercial Ordering & Fast Dispatch:**\n` +
        `• **Contractor Discount**: Direct **40% OFF** manufacturer list price already applied.\n` +
        `• **Stock Depot**: Allotted from Ahmedabad Central Hub (24–48h Dispatch under Policy VEP/LOG/001).\n` +
        `• **Tax Invoice**: 18% GST invoice with full ITC passed on dispatch.\n\n` +
        `**Ready to book this item?** Tell me your required quantity/meters, customer name, phone number, and delivery city!`
      );
    }
  }

  // 2. MASTER CATALOG DIRECTORY / "what products do you have" / "show catalog"
  const isMasterCatalogQuery =
    /teach\s*(?:vola|me)?\s*(?:about)?\s*(?:each|all)?\s*product/i.test(lower) ||
    /everything\s+on\s+(?:our\s+)?website/i.test(lower) ||
    /^(?:what\s+products\s+do\s+you\s+(?:have|sell|offer|deal\s+in|carry)|show\s+(?:me\s+)?(?:all\s+)?products|list\s+products|product\s*catalog|catalog|categories|all\s+categories)\b/i.test(lower) ||
    (/(?:all|list|show|browse|what)\s+(?:the\s+)?(?:products|categories|catalog|items|inventory)\b/i.test(lower) &&
      !/\b\d+\s*(?:sqmm|sq\s*mm|core|a|amp|kv)\b/i.test(lower));

  if (isMasterCatalogQuery) {
    const featured = findMatchingProducts("4 sqmm copper", 3);
    const featuredCards = featured.map(formatProductCard).join("\n\n");
    return (
      `### ⚡ Complete Volamp Product Catalog Directory (3,385+ Certified Products Across 8 Categories)\n\n` +
      `Welcome to **Volamp Elektrikals**! We distribute 3,385+ industrial-grade electrical materials with factory-direct **40% Contractor Discount** from our Ahmedabad fulfillment depot:\n\n` +
      `---\n\n` +
      `#### 1. 🔌 [Wires & Cables (2,856 Products in Database)](/category/wire-cables)\n` +
      `• **Authorized Brands**: Polycab, KEI, Finolex, Volamp\n` +
      `• **Offerings**: Single Core Flexible Building Wires (FR, FRLS, ZHFR), Armoured LT & HT XLPE/PVC Power Cables (1.1kV, 11kV, 33kV), Submersible Flat Cables, LAN Cat6, CCTV Cables.\n` +
      `• [👉 Browse Full Wires & Cables Catalog](/category/wire-cables)\n\n` +
      `#### 2. 🛡️ [Switchgear & Circuit Protection (221 Products in Database)](/category/switchgear)\n` +
      `• **Authorized Brands**: Schneider Electric, LK (L&T), Legrand, Volamp\n` +
      `• **Offerings**: MCBs (0.5A to 63A; 6kA/10kA), MCCBs (16A to 1250A), RCCBs, Contactors, Overload Relays, Distribution Boards.\n` +
      `• [👉 Browse Full Switchgear Catalog](/category/switchgear)\n\n` +
      `#### 3. ☀️ [Solar Electrical Solutions (60 Products in Database)](/category/solar)\n` +
      `• **Authorized Brands**: Polycab, KEI, Volamp, Waaree\n` +
      `• **Offerings**: 1500V DC Solar PV Cables (TÜV/EN 50618 certified, 4/6/10 sqmm), Solar PV Panels, Inverters, MC4 Connectors, Array Junction Boxes.\n` +
      `• [👉 Browse Full Solar Solutions](/category/solar)\n\n` +
      `#### 4. 🌍 [Earthing & Grounding Systems (37 Products in Database)](/category/earthing-material)\n` +
      `• **Authorized Brands**: Volamp, True Power, Ashlok\n` +
      `• **Offerings**: Copper-Bonded Earthing Rods (100–250 microns molecular copper), Pipe-in-Pipe Chemical Electrodes, Backfill Compound (IS 3043), GI & Copper Strips.\n` +
      `• [👉 Browse Earthing Systems](/category/earthing-material)\n\n` +
      `#### 5. 🔩 [Cable Glands & Terminations (90 Products in Database)](/category/glands)\n` +
      `• **Authorized Brands**: Volamp, Comet, Raychem\n` +
      `• **Offerings**: Single Compression Brass Glands, Weatherproof IP67 MD Double Compression Glands, Flameproof Ex d IIC Glands.\n` +
      `• [👉 Browse Cable Glands](/category/glands)\n\n` +
      `#### 6. 🧲 [Lugs & Cable Terminals (14 Products in Database)](/category/lugs)\n` +
      `• **Authorized Brands**: Volamp, Dowells, Comet\n` +
      `• **Offerings**: Tinned Electrolytic Copper & Aluminium Ring, Pin, and Tubular Barrel Lugs (1.5 to 630 sqmm), Bimetallic Cu-Al Lugs.\n` +
      `• [👉 Browse Crimping Lugs](/category/lugs)\n\n` +
      `#### 7. 🧱 [Conduit & Cable Management (93 Products in Database)](/category/conduit)\n` +
      `• **Authorized Brands**: Volamp, Precision, VIP\n` +
      `• **Offerings**: Rigid uPVC Conduits (LMS, MMS, HMS conforming to IS 9537 Part 3), Casing & Capping, PP Corrugated Flexible Pipes.\n` +
      `• [👉 Browse Conduits & Pipes](/category/conduit)\n\n` +
      `#### 8. 💡 [Wiring Devices & Safety Gear (14 Products in Database)](/category/wiring-device)\n` +
      `• **Authorized Brands**: Legrand, Schneider Electric, Anchor, Volamp\n` +
      `• **Offerings**: Modular Switches & Sockets, Industrial Plugs (16A–63A IP44/67), Insulation Tapes, HT Safety Gloves, Testing Instruments.\n` +
      `• [👉 Browse Wiring Devices](/category/wiring-device)\n\n` +
      `---\n\n` +
      `🔥 **Featured Fast-Moving Products in Stock:**\n\n` +
      `${featuredCards}\n\n` +
      `Tell me any cable size, switchgear rating, or brand, and I will pull exact live specifications, net prices, and stock for you!`
    );
  }

  // 3. SPECIFIC DYNAMIC PRODUCT SEARCH (Supports any combination of Size, Core, Voltage, Brand, Material, Armour, Current, Category)
  const matched = findMatchingProducts(lower, 4);
  if (matched.length > 0) {
    const productList = matched.map(formatProductCard).join("\n\n");
    return (
      `### ⚡ Live Catalog Matches for "${query.trim()}" (${matched.length} items in stock):\n\n` +
      `${productList}\n\n` +
      `---\n\n` +
      `### ⚡ Commercial Pricing Architecture:\n` +
      `• **Contractor Discount**: Direct **40% OFF** applied from published manufacturer list prices.\n` +
      `• **Statutory Tax**: 18% GST with 100% compliant input tax credit (ITC) on all consignments.\n` +
      `• **Ahmedabad Fulfillment**: Dispatched within 24–48 hours under Shipping Policy VEP/LOG/001.\n\n` +
      `**Ready to place an order or lock in stock?**\n` +
      `Tell me your required quantity/meters, customer name, contact phone number, and delivery city, and I'll generate your official **Volamp Order Reference ID** right now!`
    );
  }

  // 4. BRAND-ONLY INQUIRY (e.g. "tell me about polycab", "schneider products")
  const brandKeywords = [
    { key: "polycab", name: "Polycab" },
    { key: "kei", name: "Kei" },
    { key: "finolex", name: "Finnolex" },
    { key: "finnolex", name: "Finnolex" },
    { key: "schneider", name: "SCHNIEDER" },
    { key: "schnieder", name: "SCHNIEDER" },
    { key: "legrand", name: "LEGRAND" },
    { key: "lk", name: "LK" },
    { key: "l&t", name: "LK" },
  ];

  for (const b of brandKeywords) {
    if (new RegExp(`\\b${b.key}\\b`, "i").test(lower)) {
      const prods = queryProducts({ brand: b.name, limit: 3 });
      if (prods.products.length > 0) {
        const productList = prods.products.map(formatProductCard).join("\n\n");
        return (
          `### ⚡ Authorized ${prods.products[0].brand} Products at Volamp (${prods.total} items available)\n\n` +
          `Volamp is a primary distributor for **${prods.products[0].brand}**, supplying factory-direct materials with original Material Test Certificates ( MTC ) and flat **40% OFF** contractor discounts:\n\n` +
          `${productList}\n\n` +
          `Looking for a specific gauge or rating in ${prods.products[0].brand}? Tell me what size or coil length you need!`
        );
      }
    }
  }

  // 5. CATEGORY-ONLY INQUIRY (without specific specs)
  if (/\b(?:wires?\s*(?:&|and)?\s*cables?|house\s*wires?|building\s*wires?|industrial\s*cables?)\b/i.test(lower)) {
    const prods = queryProducts({ category: "Wires & Cables", limit: 3 });
    const productList = prods.products.map(formatProductCard).join("\n\n");
    return (
      `### 🔌 Volamp Wires & Cables Portfolio (2,856 Products)\n\n` +
      `We distribute certified cables from **Polycab, KEI, Finolex, and Volamp** across all voltage grades with flat **40% OFF** contractor pricing:\n\n` +
      `• **Single Core Flexible House Wires (FR / FRLS / ZHFR)**: 0.5 sqmm to 16 sqmm (IS 694).\n` +
      `• **Multicore Flexible Industrial Cables**: 2-Core up to 24-Core for machine and panel wiring.\n` +
      `• **Armoured LT & HT Power Cables**: XLPE/PVC insulated, Copper & Aluminium conductors (IS 7098 & IS 1554).\n` +
      `• **Submersible Flat 3-Core Cables**: 1.5 sqmm to 35 sqmm for agricultural pumps.\n` +
      `• **Communication & Coaxial**: CCTV 3+1/4+1, RG-59, RG-6, and Cat6 LAN.\n\n` +
      `[👉 Browse Complete Wires & Cables Catalog](/category/wire-cables)\n\n` +
      `**Featured Wires & Cables in Stock:**\n\n` +
      `${productList}\n\n` +
      `Looking for a specific gauge or brand? Just tell me what size you need!`
    );
  }

  if (/\b(?:switchgear|mcb|mccb|rccb|rcbo|contactor|isolator|changeover)\b/i.test(lower)) {
    const prods = queryProducts({ category: "Switchgear", limit: 3 });
    const productList = prods.products.map(formatProductCard).join("\n\n");
    return (
      `### 🛡️ Volamp Switchgear & Protection Portfolio (221 Products)\n\n` +
      `We carry leading switchgear brands including **Schneider Electric, LK (L&T), Legrand, and Volamp** with flat **40% OFF** contractor pricing:\n\n` +
      `• **MCBs (Miniature Circuit Breakers)**: 0.5A to 63A, 6kA & 10kA breaking capacity (IS/IEC 60898).\n` +
      `• **MCCBs (Moulded Case Circuit Breakers)**: 16A to 1250A, 25kA/36kA/50kA, 3-Pole & 4-Pole.\n` +
      `• **RCCBs & RCBOs**: Human safety (30mA) & fire protection (100mA/300mA).\n` +
      `• **Contactors & Relays**: 9A to 800A AC-3 heavy motor duty.\n` +
      `• **Distribution Boards (DB)**: SPN, TPN, Vertical DBs with IP43/IP54 rating.\n\n` +
      `[👉 Browse Complete Switchgear Catalog](/category/switchgear)\n\n` +
      `**Featured Products in Stock:**\n\n` +
      `${productList}\n\n` +
      `Tell me your load or required breaking capacity, and I'll pull the exact model for you!`
    );
  }

  return null;
}

/**
 * Handle Casual Chit-Chat, Jokes, Poems & Everyday Life (Non-AI, Authentic Voice).
 */
function handleGeneralKnowledgeAndChitChat(query: string): string | null {
  const lower = query.toLowerCase().trim();

  // Jokes
  if (/joke|make\s+me\s+laugh|funny|tell\s+me\s+something\s+funny/i.test(lower)) {
    const jokes = [
      "Why did the light bulb fail its exam? 💡\nBecause it wasn't very bright! 😂",
      "What is an electrician's favorite ice cream flavor? 🍦\nShock-o-late! ⚡",
      "Why do electrical engineers love coffee? ☕\nBecause it keeps their circuits grounded! 😄",
      "What did the capacitor say to the resistor? ⚡\n'I can't resist you, and you've got so much potential!' 😆",
      "Why did the electrician go to therapy? 🛋️\nHe had too many unresolved issues with his current relationship! 😂",
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Poems / Creative
  if (/poem|poetry|rhyme|write\s+a\s+poem/i.test(lower)) {
    return (
      `### ⚡ The Pulse of Progress (Dedicated to Volamp's 60-Year Legacy)\n\n` +
      `*Beneath the ground, within the wall,*\n` +
      `*A silent current answers all.*\n` +
      `*Through copper strands and armoured steel,*\n` +
      `*The dreams of industry turn real.*\n\n` +
      `*From Ahmedabad's determined start,*\n` +
      `*Four generations, one true heart.*\n` +
      `*Not just the wire, but the trust we weave,*\n` +
      `*In every circuit we believe!* ⚡✨`
    );
  }

  // Who made you / Who are you
  if (/who\s+are\s+you|who\s+made\s+you|what\s+is\s+your\s+name|who\s+created\s+you/i.test(lower)) {
    return (
      `⚡ **VOLA here — Senior Technical Advisor & Supply Desk Lead at VOLAMP ELEKTRIKALS PRIVATE LIMITED (Ahmedabad HQ)!**\n\n` +
      `I have complete knowledge of our 3,385+ electrical products across Wires & Cables, Switchgear, Lugs, Conduits, Glands, Earthing, and Solar, as well as live factory discounts, cable sizing formulas, and nationwide dispatch logistics.\n\n` +
      `Whether you need electrical sizing, a wholesale contractor quotation, or want to dispatch an order to your site within 24–48 hours, I'm right here. How can I help you right now?`
    );
  }

  // Ceiling fan wiring guide
  if (/ceiling\s*fan|fan\s*wiring|home\s*wiring|house\s*wiring/i.test(lower)) {
    return (
      `### 🏠 Ceiling Fan & House Wiring Guide:\n\n` +
      `• **Ceiling Fan Connections**:\n` +
      `  - **Phase (Live)**: Passes through wall switch $\\rightarrow$ regulator $\\rightarrow$ fan running winding.\n` +
      `  - **Neutral**: Direct connection to fan common terminal.\n` +
      `  - **Earth (Green)**: Must be securely grounded to ceiling metal hook for human safety.\n` +
      `  - **Capacitor (2.25 to 2.5 $\\mu$F)**: Provides phase shift for motor start.\n\n` +
      `• **Recommended Wire Sizes**:\n` +
      `  - Lighting points & ceiling fans: **1.5 sqmm Single-Core Copper FR/FRLS**.\n` +
      `  - 16A Power sockets & 1.5-ton ACs: **2.5 sqmm or 4.0 sqmm**.\n\n` +
      `*Safety Rule*: Always isolate the main MCB before working on live electrical lines!`
    );
  }

  // Thank you
  if (/thank\s*you|thanks|thx|shukriya|dhanyawad|great\s*job|awesome|superb|nice/i.test(lower)) {
    return (
      `My absolute pleasure! ⚡ That's what the Volamp supply desk is here for.\n\n` +
      `Whenever you need technical calculations, live contractor pricing, or urgent site dispatch, just hit me up. Let's keep your project moving!`
    );
  }

  // Headquarters / Location / Weather in Ahmedabad
  if (/weather|where\s+are\s+you\s+located|where\s+is\s+volamp|where\s+is\s+your\s+office/i.test(lower)) {
    return (
      `🏭 **VOLAMP ELEKTRIKALS PRIVATE LIMITED** is proudly headquartered in **Ahmedabad, Gujarat, India**!\n\n` +
      `• **Corporate Main Office**: 1753, Khadia, Ahmedabad, Gujarat 380001\n` +
      `• **Central Logistics & Fulfillment Hub**: Aslali, Ahmedabad\n` +
      `• **Direct Phone & WhatsApp**: **+91 9512365582**\n\n` +
      `From Ahmedabad, we operate rapid 24–48 hour dispatch across all 28 Indian states, backed by standard transit insurance and dedicated global export capabilities.`
    );
  }

  // Light bulb invention
  if (/who\s+invented\s+(?:the\s+)?light\s*bulb/i.test(lower)) {
    return (
      `### 💡 Who Invented the Light Bulb?\n\n` +
      `While **Thomas Edison** patented the first commercially viable incandescent bulb in **1879**, electric lighting was an evolutionary triumph:\n\n` +
      `• **Humphry Davy (1802)**: Demonstrated the electric carbon arc lamp.\n` +
      `• **Warren de la Rue (1840)**: Built an early platinum filament lamp in vacuum.\n` +
      `• **Joseph Swan (1878)**: Demonstrated carbon-filament lamps in England.\n` +
      `• **Thomas Edison (1879)**: Discovered carbonized bamboo filaments operating in a high-vacuum globe for over 1,200 continuous hours, giving birth to modern commercial power utilities!`
    );
  }

  return null;
}

/**
 * Fallback synthesizer that analyzes open-ended questions with intense, sharp engineering authority.
 */
function synthesizeOpenEndedResponse(query: string): string {
  const trimmed = query.trim();

  return (
    `### ⚡ Regarding: *"${trimmed}"*\n\n` +
    `In electrical engineering and industrial infrastructure, precision and safety are non-negotiable.\n\n` +
    `Whether you're specifying conductor ampacity, insulation dielectric ratings (XLPE vs PVC), circuit protection breaking capacity (6kA to 50kA), or project procurement schedules, every variable matters to prevent thermal overload and costly downtime.\n\n` +
    `At **Volamp Elektrikals**, we bring over **60 years and 4 generations** of industrial electrical experience from our Ahmedabad headquarters to deliver factory-direct, certified materials across all 10 business segments.\n\n` +
    `Tell me your exact load, project parameters, or what you need to order, and I'll give you the technical sizing and direct contractor pricing right away!`
  );
}

/**
 * Vola's advanced conversational brain.
 * Guarantees an intense, responsive, non-AI answer to ANY question asked.
 */
export async function generateVolaResponse(
  messages: ChatMessage[],
  userId?: number | null
): Promise<string> {
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const lower = lastUserMsg.toLowerCase().trim();

  // 1. ORDER TRACKING ("track QO-...", "status of QO-...", "track order", "where is my order")
  const trackMatch = lower.match(/(?:track|status\s+of|check\s+order)\s*(?:order\s*)?(QO-\d{4}-\d{5})/i);
  if (trackMatch) {
    const orderId = trackMatch[1].toUpperCase();
    try {
      const order = await getQuickOrderById(orderId);
      if (order) {
        let parsedItems: any[] = [];
        try {
          parsedItems = JSON.parse(order.items);
        } catch {
          parsedItems = [];
        }

        const statusDescriptions: Record<string, string> = {
          submitted: "Received & Under Stock Allotment at our Ahmedabad fulfillment depot.",
          under_review: "Being inspected by our technical team for immediate stock dispatch.",
          priced: "Quotation & tax invoice generated; awaiting customer confirmation.",
          quoted: "Formal proforma quote dispatched to customer mobile.",
          closed: "Dispatched or completed.",
        };

        const statusText = statusDescriptions[order.status] || order.status;

        return (
          `### 📦 Consignment Status: \`${order.quickOrderId}\`\n\n` +
          `• **Customer**: ${order.customerName} ${order.phone ? `(📞 ${order.phone})` : ""}\n` +
          `• **Delivery Destination**: ${order.location || "Ahmedabad Central Depot"}\n` +
          `• **Current Status**: **${order.status.toUpperCase()}** — *${statusText}*\n\n` +
          `**Items in Consignment:**\n` +
          parsedItems.map((i) => `- ${i.name} (Qty: **${i.quantity}**)`).join("\n") +
          `\n\nNeed immediate truck dispatch updates? [💬 Connect on WhatsApp with Order ID](https://wa.me/919512365582?text=Hello%20Volamp,%20checking%20status%20for%20order%20${order.quickOrderId})`
        );
      } else {
        return `I searched our live system but couldn't locate an active order with Reference ID \`${orderId}\`. Please re-check the ID or connect directly with our logistics team at **+91 9512365582**!`;
      }
    } catch {
      // fallback
    }
  }

  // 2. ORDER TAKING & DIRECT PLACEMENT
  const orderIntent =
    /\b(?:place\s*(?:an\s*)?order|want\s+to\s+order|buy|purchase|chahiye|need\s+to\s+order|book\s*(?:an\s*)?order|order\s+karna)\b/i.test(
      lower
    ) ||
    /(\d+)\s*(?:m|meter|meters|metre|metres|coils?|rolls?|drums?)\s+(?:of\s+)?([a-zA-Z0-9\s\.\-]+(?:cable|wire|sqmm))/i.test(
      lower
    );

  if (orderIntent) {
    const details = extractOrderDetails(messages);

    const hasItems = details.items.length > 0;
    const hasName = Boolean(details.customerName);
    const hasPhone = Boolean(details.phone);
    const hasLocation = Boolean(details.location);

    if (hasItems && hasName && hasPhone && hasLocation) {
      try {
        const newOrder = await createQuickOrder({
          userId: userId ?? null,
          customerName: details.customerName!,
          phone: details.phone!,
          location: details.location!,
          companyName: details.companyName ?? null,
          items: details.items,
          notes: "Placed via Vola Technical & Supply Desk",
        });

        const itemsTable = details.items
          .map((item) => `| ${item.name} | **${item.quantity}** |`)
          .join("\n");

        return (
          `### ⚡ Order Successfully Placed with Volamp Elektrikals!\n\n` +
          `Your order has been registered in the Volamp system with Reference ID: **\`${newOrder.quickOrderId}\`**.\n\n` +
          `| Item Description | Quantity |\n` +
          `| :--- | :--- |\n` +
          `${itemsTable}\n\n` +
          `• **Customer Name**: ${newOrder.customerName} | 📞 ${newOrder.phone}\n` +
          `• **Delivery Destination**: ${newOrder.location}\n\n` +
          `**Next Steps & Dispatch:**\n` +
          `1. **Stock Allotment**: Our Ahmedabad central warehouse is allotting your stock right now.\n` +
          `2. **Dispatch Window**: Dispatches within 24–48 hours under Shipping Policy VEP/LOG/001.\n` +
          `3. **Invoice & POD**: A verified GST tax invoice and transporter LR number will be sent to your phone via WhatsApp.\n\n` +
          `[👉 Open WhatsApp with Order ID](https://wa.me/919512365582?text=Hello%20Volamp,%20I%20have%20placed%20Order%20${newOrder.quickOrderId}%20via%20Vola)`
        );
      } catch (err: any) {
        return `I noted your order details, but encountered an error saving it: ${err.message}. Please connect directly with our sales desk at **+91 9512365582**!`;
      }
    } else {
      const missing: string[] = [];
      if (!hasItems) missing.push("• **Product specifications & quantity** (e.g., *500m of 4 sqmm 3-core copper armored cable* or *10 coils of 2.5 sqmm house wire*)");
      if (!hasName) missing.push("• **Your full name**");
      if (!hasPhone) missing.push("• **Contact phone number** (for WhatsApp invoice & dispatch updates)");
      if (!hasLocation) missing.push("• **Delivery destination city / pincode**");

      return (
        `I'm ready to book your order directly with our Ahmedabad fulfillment depot! ⚡\n\n` +
        `To generate your official **Order Reference ID**, please share:\n\n` +
        missing.join("\n") +
        `\n\n*(Note: Users must log in or create a contractor account at our **[Customer Portal](/portal)** to track dispatches and access GST tax invoices).*`
      );
    }
  }

  // 3. CASUAL GREETINGS & CHIT-CHAT (Intense, warm, non-AI)
  const isGreeting =
    /^(?:hey|hi|hello|hola|namaste|pranam|kem cho|good\s*(?:morning|afternoon|evening|day)|yo|sup)\b/i.test(lower) ||
    /how\s*(?:are|r)\s*(?:you|u|uh)\b/i.test(lower) ||
    /how('?s|\s+is)\s+it\s+going\b/i.test(lower) ||
    /kaise\s*ho\b/i.test(lower) ||
    /kya\s*(?:haal|hal|chal\s*raha)\b/i.test(lower) ||
    /what('?s|\s+is)\s+up\b/i.test(lower) ||
    /kaisa\s*hai\b/i.test(lower);

  if (isGreeting && !lower.includes("order") && !lower.includes("price") && !lower.includes("buy")) {
    if (/kem\s*cho/i.test(lower)) {
      return (
        "Majama! 😊 Kem cho tame? Hu chu **Vola**, Volamp Elektrikals Ahmedabad supply desk thi! ⚡\n\n" +
        "Tamare koi pan electrical cables, contractor discounts, technical sizing ke direct order dispatch maate madat joiye to mane kaho. Aaje tame kaya project par kaam kari rahya cho?"
      );
    }

    if (/kaise\s*ho|kya\s*(?:haal|hal|chal)|sab\s*badhiya/i.test(lower)) {
      return (
        "Main ekdum first-class hoon! 😊 Aap bataiye, aapka kaam kaisa chal raha hai? ⚡\n\n" +
        "Main hoon **Vola**, Volamp Elektrikals Ahmedabad supply desk se aapka technical & procurement lead! Chahe aapko cable sizing calculate karni ho, live contractor discounts check karne hon, ya site ke liye direct consignment book karni ho — bataiye, aaje kis requirement par baat karein?"
      );
    }

    const greetings = [
      "Hey there! 😊 Doing fantastic and ready to roll! How are you doing today? ⚡\n\n" +
        "I'm **Vola**, Senior Technical Advisor & Supply Desk Lead at **Volamp Elektrikals** (Ahmedabad HQ). We have 3,385+ products in stock across Wires & Cables, Switchgear, Lugs, Conduits, Glands, Earthing, and Solar with direct contractor discount pricing. What project are you working on today?",
      "Hello! 😊 Full voltage and ready to help! How's your day going? ⚡\n\n" +
        "I'm **Vola** from the Volamp Elektrikals supply desk. Whether you need cable sizing calculations, brand price comparisons (Polycab, Finolex, KEI, Schneider), or want to dispatch an order to your site, I'm right here. What can I do for you?",
      "Hey! Wonderful to connect with you! 😊 ⚡\n\n" +
        "I'm **Vola** from the Volamp headquarters in Ahmedabad. Tell me — are you sizing cables for a project, looking for contractor discounts, or ready to place an order?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 4. PRODUCT CATALOG & SPECIFICATION INTELLIGENCE (3,385+ items across 8 categories)
  const productResponse = handleProductAndCatalogQuery(lastUserMsg);
  if (productResponse) {
    return productResponse;
  }

  // 5. PRICING, COSTS, CONTRACTOR DISCOUNTS & TAXES
  const pricingResponse = handlePricingCostsAndDiscounts(lastUserMsg);
  if (pricingResponse) {
    return pricingResponse;
  }

  // 6. TECHNICAL SIZING & ELECTRICAL FORMULAS
  const sizingResponse = handleTechnicalEngineeringAndSizing(lastUserMsg);
  if (sizingResponse) {
    return sizingResponse;
  }

  // 7. BUSINESS SEGMENTS (All 10 Specialized Segments)
  const segmentResponse = handleBusinessSegments(lastUserMsg);
  if (segmentResponse) {
    return segmentResponse;
  }

  // 8. ABOUT US, 4 GENERATIONS, HERITAGE, CEO MESSAGE & TEAM
  const aboutResponse = handleAboutUsAndHeritage(lastUserMsg);
  if (aboutResponse) {
    return aboutResponse;
  }

  // 9. MATH & GST FORMULAS
  const mathResponse = handleMathAndFormulas(lastUserMsg);
  if (mathResponse) {
    return mathResponse;
  }

  // 10. ELECTRICAL SCIENCE & TECHNICAL COMPARISONS
  const scienceResponse = handleScienceAndElectrical(lastUserMsg);
  if (scienceResponse) {
    return scienceResponse;
  }

  // 11. GENERAL KNOWLEDGE, JOKES, POEMS & CHIT-CHAT
  const generalResponse = handleGeneralKnowledgeAndChitChat(lastUserMsg);
  if (generalResponse) {
    return generalResponse;
  }

  // 12. HIGH-VOLTAGE OPEN-ENDED TOPIC SYNTHESIZER
  return synthesizeOpenEndedResponse(lastUserMsg);
}
