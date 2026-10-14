import { getCachedProducts, normalizeBrand, parseItemSpecs } from "./productService";
import type { Product } from "../../drizzle/schema";

export interface ParsedVoiceItem {
  id: string;
  originalSegment: string;
  detectedQuantity: number;
  detectedUnit?: string;
  detectedBrand?: string;
  detectedSize?: string;
  cleanedQuery: string;
  matchedProduct: {
    productId: string;
    sku: string;
    name: string;
    brand: string;
    category: string;
    size?: string;
    price: string;
    numericPrice: number;
    unit: string;
  } | null;
  candidates: Array<{
    productId: string;
    sku: string;
    name: string;
    brand: string;
    price: string;
    numericPrice: number;
    category: string;
    size?: string;
  }>;
  confidence: "high" | "medium" | "low" | "none";
  warning?: string;
}

// Word number maps across English, Hindi, and Gujarati
const NUMBER_WORDS: Record<string, number> = {
  // English
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100,

  // Hindi (transliterated & devanagari)
  ek: 1, do: 2, teen: 3, char: 4, paanch: 5, panch: 5, chhah: 6, che: 6, saat: 7, aath: 8, nau: 9, das: 10,
  gyarah: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16, satrah: 17, atharah: 18, unnis: 19, bees: 20,
  tees: 30, chalis: 40, pachas: 50, sath: 60, sattar: 70, assi: 80, nabbe: 90, sau: 100,
  "एक": 1, "दो": 2, "तीन": 3, "चार": 4, "पांच": 5, "पाँच": 5, "छह": 6, "सात": 7, "आठ": 8, "नौ": 9, "दस": 10,
  "ग्यारह": 11, "बारह": 12, "तेरह": 13, "चौदह": 14, "पंद्रह": 15, "सोलह": 16, "सत्रह": 17, "अठारह": 18, "उन्नीस": 19, "बीस": 20,
  "तीस": 30, "चालीस": 40, "पचास": 50, "साठ": 60, "सत्तर": 70, "अस्सी": 80, "नब्बे": 90, "सौ": 100,

  // Gujarati (transliterated & gujarati script)
  be: 2, tran: 3, chaar: 4, chha: 6, aat: 8, nav: 9, dasa: 10,
  "એક": 1, "બે": 2, "ત્રણ": 3, "ચાર": 4, "પાંચ": 5, "છ": 6, "સાત": 7, "આઠ": 8, "નવ": 9, "દસ": 10,
  "અગિયાર": 11, "બાર": 12, "તેર": 13, "ચૌદ": 14, "પંદર": 15, "સોળ": 16, "સત્તર": 17, "અઢાર": 18, "ઓગણીસ": 19, "વીસ": 20,
  "ત્રીસ": 30, "ચાલીસ": 40, "પચાસ": 50, "સાઈઠ": 60, "સિત્તેર": 70, "એંસી": 80, "નેવું": 90, "સો": 100,
};

// Common brand names
const KNOWN_BRANDS = [
  { name: "Polycab", aliases: ["polycab", "poly cab", "પોલીકેબ", "पॉलीकैब"] },
  { name: "Finolex", aliases: ["finolex", "fino lex", "ફિનોલેક્સ", "फिनोलेक्स"] },
  { name: "KEI", aliases: ["kei", "k e i", "કેઈઆઈ", "केईआई"] },
  { name: "LK", aliases: ["lk", "l&t", "l & t", "larsen & toubro", "larsen and toubro", "एलके", "एल एंड टी", "એલકે", "એલ એન્ડ ટી"] },
  { name: "Schneider", aliases: ["schneider", "schneider electric", "स्नाइडर", "સ્નાઈડર"] },
  { name: "Legrand", aliases: ["legrand", "लेग्रांड", "લેગ્રાન્ડ"] },
  { name: "Havells", aliases: ["havells", "havels", "હેવેલ્સ", "हैवेल्स"] },
];

/**
 * Normalizes transcript text across languages (Hindi, Gujarati, English).
 */
export function normalizeTranscript(text: string): string {
  let clean = text.trim();

  // Normalize punctuation and multi-language connector words
  clean = clean
    .replace(/[।|]/g, " , ")
    // Multilingual connector words into commas: and, aur, ane, तथा, और, અને, etc.
    .replace(/(?:^|[^\p{L}\p{N}])(?:and also|aur sath me|sathe ane|tatha|aur|ane|ne|और|અને|તથા)(?:[^\p{L}\p{N}]|$)/giu, " , ")
    // Polite phrases / conversational fillers
    .replace(/(?:^|[^\p{L}\p{N}])(?:i need|i want|please provide|please add|mujhe chahiye|chahiye|joiye che|joiye|humko chahiye|give me|જોઈએ છે|જોઈએ|ચહિયે|चाहिए)(?:[^\p{L}\p{N}]|$)/giu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return clean;
}

/**
 * Splits customer voice transcript into individual product clauses.
 */
export function splitIntoProductSegments(rawTranscript: string): string[] {
  const normalized = normalizeTranscript(rawTranscript);

  // Look for splits by comma, semicolon, "and", or newlines
  const rawSplits = normalized
    .split(/[,;\n]+|(?:^|[^\p{L}\p{N}])(?:and|aur|ane|और|અને)(?:[^\p{L}\p{N}]|$)/iu)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const segments: string[] = [];

  for (const seg of rawSplits) {
    // If a segment contains multiple quantity markers (e.g. "10 pieces of Polycab... 5 pieces of..."),
    // split further at quantity boundaries
    const qtyBoundaryRegex = /(?:^|\s)(\d+|one|two|three|four|five|six|seven|eight|nine|ten|ek|do|teen|char|paanch|be|tran|chaar|એક|બે|ત્રણ|ચાર|પાંચ|छ|सात|आठ|नौ|दस)\s*(?:pieces|piece|pcs|nos|no|units|unit|meters|meter|mtrs|m|coils|coil|rolls|નંગ|પીસ)/gi;
    const matches = Array.from(seg.matchAll(qtyBoundaryRegex));

    if (matches.length > 1) {
      let lastIndex = 0;
      for (let i = 1; i < matches.length; i++) {
        const curMatch = matches[i];
        if (curMatch.index !== undefined && curMatch.index > lastIndex) {
          const part = seg.substring(lastIndex, curMatch.index).trim();
          if (part) segments.push(part);
          lastIndex = curMatch.index;
        }
      }
      const remaining = seg.substring(lastIndex).trim();
      if (remaining) segments.push(remaining);
    } else {
      segments.push(seg);
    }
  }

  return segments.filter((s) => s.length > 2);
}

/**
 * Parses quantity from a text segment.
 */
function extractQuantity(segment: string): { quantity: number; unit?: string; remainingText: string } {
  let text = segment;

  // 1. Check for digit quantity with explicit unit: e.g. "10 pieces", "5 pcs", "2 nos", "100 meters"
  const explicitUnitMatch = text.match(
    /\b(\d+)\s*(pieces|piece|pcs|nos|units|unit|meters|meter|mtrs|mtr|coils|coil|rolls|roll|drums|drum|નંગ|પીસ)\b/i
  );
  if (explicitUnitMatch) {
    const qty = parseInt(explicitUnitMatch[1], 10);
    const unit = explicitUnitMatch[2];
    text = text.replace(explicitUnitMatch[0], " ").trim();
    return { quantity: qty > 0 ? qty : 1, unit, remainingText: text };
  }

  // 2. Check for word numbers: e.g. "ten pieces", "two contactors", "दस पीस", "પાંચ નંગ"
  const words = text.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const w = words[i].toLowerCase().replace(/[^\w\u0900-\u097F\u0A80-\u0AFF]/g, "");
    if (NUMBER_WORDS[w]) {
      const qty = NUMBER_WORDS[w];
      let unit: string | undefined;
      // Check if next word is a unit
      if (i + 1 < words.length) {
        const nextW = words[i + 1].toLowerCase();
        if (
          ["pieces", "piece", "pcs", "nos", "units", "meters", "meter", "m", "coils", "rolls", "નંગ", "પીસ"].includes(
            nextW
          )
        ) {
          unit = nextW;
          words.splice(i, 2);
        } else {
          words.splice(i, 1);
        }
      } else {
        words.splice(i, 1);
      }
      return { quantity: qty, unit, remainingText: words.join(" ").trim() };
    }
  }

  // 3. Standalone leading digit, e.g. "2 LK contactors", "5 Polycab cables"
  // Must NOT be a decimal (e.g. "1.5"), and NOT followed by electrical units (sq mm, core, pole, amp, etc.)
  const standaloneMatch = text.match(
    /(?:^|\s)(\d+)(?!\.\d)\s+(?!(?:sq\s*mm|sqmm|sq|core|cores|c\b|pole|poles|p\b|amp|amps|a\b|v\b|volt|volts|kv|hp|kw|hz|phase)\b)/i
  );
  if (standaloneMatch) {
    const qty = parseInt(standaloneMatch[1], 10);
    if (qty > 0) {
      text = text.replace(standaloneMatch[0], " ").trim();
      return { quantity: qty, remainingText: text };
    }
  }

  return { quantity: 1, remainingText: text };
}

/**
 * Extracts brand from text using Unicode-safe boundary matching.
 */
function extractBrand(segment: string): { brand?: string; remainingText: string } {
  let text = segment;

  for (const b of KNOWN_BRANDS) {
    for (const alias of b.aliases) {
      const escaped = alias.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
      const regex = new RegExp(`(?:^|[^\\p{L}\\p{N}])(${escaped})(?:[^\\p{L}\\p{N}]|$)`, "iu");
      const match = text.match(regex);
      if (match) {
        text = text.replace(regex, " ").trim();
        return { brand: b.name, remainingText: text };
      }
    }
  }

  return { remainingText: text };
}

/**
 * Extracts size and core/pole specs from text.
 */
function extractSpecs(segment: string) {
  let size: string | undefined;
  let cores: string | undefined;
  let poles: string | undefined;
  let armour: string | undefined;
  let rating: string | undefined;

  // Sqmm detection: e.g. "1.5 sq mm", "1.5 sqmm", "2.5 sq mm", "2.5 square mm", "1.5 સ્ક્વેર એમએમ"
  const sqmmMatch = segment.match(/(\d+(?:\.\d+)?)\s*(?:sq\s*mm|sqmm|sq\.\s*mm|square\s*mm|સ્ક્વેર\s*એમએમ|स्क्वायर\s*एमएम)/i);
  if (sqmmMatch) {
    size = `${sqmmMatch[1]} SQMM`;
  }

  // Core detection: e.g. "single-core", "single core", "1 core", "2 core", "3 core", "3.5 core", "4 core"
  if (/single[- ]core|1[- ]core|सिंगल[- ]कोर|સિંગલ[- ]કોર/i.test(segment)) {
    cores = "1 CORE";
  } else if (/2[- ]core|2[- ]कोर|2[- ]કોર/i.test(segment)) {
    cores = "2 CORE";
  } else if (/3\.5[- ]core|3\.5[- ]कोर|3\.5[- ]કોર/i.test(segment)) {
    cores = "3.5 CORE";
  } else if (/3[- ]core|3[- ]कोर|3[- ]કોર/i.test(segment)) {
    cores = "3 CORE";
  } else if (/4[- ]core|4[- ]कोर|4[- ]કોર/i.test(segment)) {
    cores = "4 CORE";
  }

  // Pole detection (Switchgear): e.g. "3 pole", "3-pole", "3p", "4 pole", "4p", "3 पोल", "3 પોલ"
  const poleMatch = segment.match(/(?:^|[^\p{L}\p{N}])([1-4])\s*(?:pole|p|पोल|પોલ)(?:[^\p{L}\p{N}]|$)/iu);
  if (poleMatch) {
    poles = `${poleMatch[1]}P`;
  }

  // Current / Ampere rating: e.g. "9 amp", "9a", "16 amp", "25a", "63 amp", "9 एम्प", "9 એમ્પ"
  const ampMatch = segment.match(/(?:^|[^\p{L}\p{N}])(\d+(?:\.\d+)?)\s*(?:amp|amps|amperes|a|एम्प|એમ્પ)(?:[^\p{L}\p{N}]|$)/iu);
  if (ampMatch) {
    rating = `${ampMatch[1]}A`;
  }

  // Armour detection
  if (/unarmou?red|un-armou?red|अनआर्मर्ड|અનઆર્મર્ડ/i.test(segment)) {
    armour = "Unarmoured";
  } else if (/armou?red|आर्मर्ड|આર્મર્ડ/i.test(segment)) {
    armour = "Armoured";
  }

  return { size, cores, poles, rating, armour };
}

/**
 * Searches the catalog with precision scoring and ranking.
 */
function matchProductInCatalog(
  rawQuery: string,
  brand?: string,
  specs?: { size?: string; cores?: string; poles?: string; rating?: string; armour?: string }
): {
  matched: Product | null;
  candidates: Product[];
  confidence: "high" | "medium" | "low" | "none";
} {
  const allProducts = getCachedProducts();
  const lowerQuery = rawQuery.toLowerCase();

  // Keyword tokens
  const stopWords = new Set(["i", "need", "want", "please", "pieces", "piece", "pcs", "of", "and", "the", "for", "with"]);
  const tokens = lowerQuery
    .replace(/[^\w\s\.]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !stopWords.has(t));

  const scored: Array<{ product: Product; score: number }> = [];

  for (const p of allProducts) {
    let score = 0;
    const pName = p.name.toLowerCase();
    const pSub = (p.subcategory || "").toLowerCase();
    const pDesc = (p.description || "").toLowerCase();
    const pSpecs = parseItemSpecs(p.specifications);

    // 1. Brand matching
    if (brand) {
      const bNorm = normalizeBrand(brand);
      const pbNorm = normalizeBrand(p.brand);
      if (bNorm === pbNorm) {
        score += 35;
      } else {
        // If user specified brand and this product is a different brand, strongly penalize
        score -= 30;
      }
    }

    // 2. Size matching (critical for cables & wires)
    if (specs?.size) {
      const sNorm = specs.size.toLowerCase(); // e.g. "1.5 sqmm"
      const pSize = (p.size || "").toLowerCase();
      if (pSize === sNorm || pName.includes(sNorm)) {
        score += 45;
      } else {
        // If user explicitly asked for 1.5 SQMM and this is 2.5 SQMM or 4 SQMM, disqualify
        if (pSize && pSize.includes("sqmm") && pSize !== sNorm) {
          continue;
        }
      }
    }

    // 3. Cores matching (e.g. 1 CORE vs 2 CORE vs 3 CORE)
    if (specs?.cores) {
      const cNorm = specs.cores.toLowerCase(); // e.g. "1 core"
      const pCores = (pSpecs.cores || "").toLowerCase();
      if (pName.includes(cNorm) || pCores.includes(cNorm)) {
        // Standard naming pattern "1.5 SQMM X 1 CORE"
        score += 35;
      } else if (specs.cores === "1 CORE" && (pName.includes("single core") || pName.includes("single-core") || pCores.includes("single core"))) {
        score += 25;
      } else if (pCores && !pCores.includes(cNorm)) {
        score -= 25;
      }
    }

    // 4. Poles matching (e.g. 3P, 3 Pole)
    if (specs?.poles) {
      const pPoleTarget = specs.poles.toLowerCase(); // "3p"
      const pPoles = (pSpecs.polesPhase || "").toLowerCase();
      if (pPoles.includes(pPoleTarget) || pName.includes(pPoleTarget) || pName.includes("3 pole")) {
        score += 40;
      } else if (pPoles && !pPoles.includes(pPoleTarget)) {
        continue;
      }
    }

    // 5. Rating matching (e.g. 9A, 9 amp)
    if (specs?.rating) {
      const rNum = specs.rating.replace(/\D/g, ""); // "9"
      const pRating = (pSpecs.currentRatingA || pSpecs.currentRatingAmp || p.size || "").toLowerCase();
      if (pRating.includes(rNum) || pName.includes(`${rNum}a`) || pName.includes(`${rNum} a`)) {
        score += 35;
      }
    }

    // 6. Armour matching
    if (specs?.armour) {
      const isUnarmouredTarget = specs.armour.toLowerCase() === "unarmoured";
      const isPUnarmoured =
        pName.includes("unarmoured") ||
        (pSpecs.typeOfArmour || "").toLowerCase().includes("unarmoured") ||
        pSub.includes("unarmoured");
      const isPArmoured =
        !isPUnarmoured &&
        (pName.includes("armoured") || (pSpecs.typeOfArmour || "").toLowerCase().includes("armoured"));

      if (isUnarmouredTarget && isPUnarmoured) {
        score += 30;
      } else if (!isUnarmouredTarget && isPArmoured) {
        score += 30;
      } else if (isUnarmouredTarget && isPArmoured) {
        // Strict mismatch: user wants unarmoured, product is armoured
        continue;
      }
    }

    // 7. Standard catalog bonus: "Per Meter" standard industrial wire products (CAB-000004/000005)
    if (p.unit === "Per Meter" || p.unit === "Per Unit") {
      score += 10;
    }

    // 8. General token matches
    for (const token of tokens) {
      if (token === "cable" || token === "wire" || token === "contactor" || token === "contactors") {
        if (pName.includes(token) || pSub.includes(token) || pDesc.includes(token)) {
          score += 15;
        }
      } else if (pName.includes(token)) {
        score += 8;
      } else if (pDesc.includes(token) || pSub.includes(token)) {
        score += 4;
      }
    }

    if (score > 20) {
      scored.push({ product: p, score });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return { matched: null, candidates: [], confidence: "none" };
  }

  const top = scored[0];
  const candidates = scored.slice(0, 5).map((s) => s.product);

  // Determine confidence
  let confidence: "high" | "medium" | "low" = "low";
  if (top.score >= 70) {
    if (scored.length === 1 || top.score - scored[1].score >= 10) {
      confidence = "high";
    } else {
      confidence = "medium";
    }
  } else if (top.score >= 40) {
    confidence = "medium";
  }

  return {
    matched: confidence === "high" || confidence === "medium" ? top.product : null,
    candidates,
    confidence,
  };
}

/**
 * Main parser entry point: Parses voice transcript into structured requisition items.
 */
export function parseVoiceOrderText(
  transcript: string,
  _language?: string
): {
  success: boolean;
  transcript: string;
  items: ParsedVoiceItem[];
  totalItemsDetected: number;
} {
  const segments = splitIntoProductSegments(transcript);
  const items: ParsedVoiceItem[] = [];

  for (let i = 0; i < segments.length; i++) {
    const rawSeg = segments[i];
    const { quantity, unit, remainingText: afterQty } = extractQuantity(rawSeg);
    const { brand, remainingText: afterBrand } = extractBrand(afterQty);
    const specs = extractSpecs(afterBrand);

    const { matched, candidates, confidence } = matchProductInCatalog(afterBrand, brand, specs);

    items.push({
      id: `voice-item-${Date.now()}-${i}`,
      originalSegment: rawSeg,
      detectedQuantity: quantity,
      detectedUnit: unit,
      detectedBrand: brand,
      detectedSize: specs.size,
      cleanedQuery: afterBrand.trim(),
      matchedProduct: matched
        ? {
            productId: matched.productId,
            sku: matched.sku,
            name: matched.name,
            brand: matched.brand,
            category: matched.category,
            size: matched.size || undefined,
            price: matched.price || "₹0.00",
            numericPrice: matched.numericPrice || 0,
            unit: matched.unit || "Per Unit",
          }
        : null,
      candidates: candidates.map((c) => ({
        productId: c.productId,
        sku: c.sku,
        name: c.name,
        brand: c.brand,
        price: c.price || "₹0.00",
        numericPrice: c.numericPrice || 0,
        category: c.category,
        size: c.size || undefined,
      })),
      confidence,
      warning:
        confidence === "none"
          ? "No exact inventory match found. Please verify product name or select from catalog."
          : confidence === "medium"
          ? "Multiple close matches found. Please confirm the exact product SKU."
          : undefined,
    });
  }

  return {
    success: true,
    transcript,
    items,
    totalItemsDetected: items.length,
  };
}
