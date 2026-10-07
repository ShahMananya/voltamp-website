import fs from "fs";
import path from "path";
import { Product, InsertProduct, QuotedProductSnapshot } from "../../drizzle/schema";

const DB_PATH = path.resolve(process.cwd(), "server/data/products_db.json");

// In-memory cache for ultra-fast query performance
let _productsCache: Product[] | null = null;

export function loadProductsFromDisk(): Product[] {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      _productsCache = parsed.map((item: any, idx: number) => ({
        id: item.id || idx + 1,
        productId: item.productId,
        sku: item.sku || `SKU-${item.productId}`,
        name: item.name,
        brand: item.brand || "Volamp",
        category: item.category,
        subcategory: item.subcategory || null,
        description: item.description || null,
        size: item.size || null,
        material: item.material || null,
        unit: item.unit || "Per Unit",
        price: item.price || "On Request",
        numericPrice: item.numericPrice ?? null,
        discount: item.discount || null,
        discountedPrice: item.discountedPrice || null,
        currency: item.currency || "INR",
        availability: item.availability || "IN STOCK",
        moq: item.moq || null,
        imageUrl: item.imageUrl || null,
        threeDImageUrl: item.threeDImageUrl || null,
        productUrl: item.productUrl || null,
        status: (item.status || "Active") as "Active" | "Inactive" | "Out of Stock" | "Discontinued",
        specifications: typeof item.specifications === "string" ? item.specifications : JSON.stringify(item.specifications || {}),
        sheetSource: item.sheetSource || null,
        lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : new Date(),
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      }));
      return _productsCache!;
    }
  } catch (err) {
    console.error("[ProductService] Error loading products from disk:", err);
  }
  return [];
}

export function getCachedProducts(): Product[] {
  if (!_productsCache) {
    return loadProductsFromDisk();
  }
  return _productsCache;
}

export interface ProductFilterParams {
  category?: string;
  subcategory?: string;
  subcategories?: string[];
  brand?: string;
  search?: string;
  status?: "Active" | "Inactive" | "Out of Stock" | "Discontinued" | "all";
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: "price_asc" | "price_desc" | "name" | "relevance";
  material?: string;
  voltage?: string;
  cores?: string;
  armorType?: string;
  stock?: string;
  poles?: string;
  rating?: string;
  color?: string;
  sizeSqMm?: string;
  insulationType?: string;
  shieldingType?: string;
  innerSheath?: string;
  outerSheath?: string;
  conductorClass?: string;
}

export function normalizeCategory(c: string): string {
  const s = (c || "").toLowerCase().replace(/[-_&]/g, " ").replace(/\s+/g, " ").trim();
  if (s.includes("earth") || s.includes("fastn") || s.includes("fasten")) return "Earthing Wires";
  if (s.includes("wiring") || s.includes("device")) return "Wiring Devices";
  if (s.includes("switch")) return "Switchgear";
  if (s.includes("lug")) return "Lugs";
  if (s.includes("pipe") || s.includes("pvc") || s.includes("conduit")) return "Conduit";
  if (s.includes("gland")) return "Glands";
  if (s.includes("solar")) return "Solar";
  if (s.includes("wire") || s.includes("cable")) return "Wires & Cables";
  return (c || "").trim();
}

function parseItemSpecs(specifications: any): Record<string, string> {
  if (!specifications) return {};
  if (typeof specifications === "object") return specifications;
  try {
    return JSON.parse(specifications);
  } catch {
    return {};
  }
}

export function queryProducts(params: ProductFilterParams = {}) {
  const all = getCachedProducts();
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 24));
  const searchLower = (params.search || "").toLowerCase().trim();
  const catFilter = (params.category || "").toLowerCase().trim();
  const subCatFilter = (params.subcategory || "").toLowerCase().trim();
  const brandFilter = (params.brand || "").toLowerCase().trim();
  const statusFilter = params.status || "Active";

  // Check if user is asking for cable-exclusive filters
  const hasCableExclusiveFilter = Boolean(
    params.cores ||
    params.armorType ||
    params.color ||
    params.sizeSqMm ||
    params.insulationType ||
    params.shieldingType ||
    params.innerSheath ||
    params.outerSheath ||
    params.conductorClass
  );

  let filtered = all.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) {
      return false;
    }

    if (catFilter) {
      const targetNorm = normalizeCategory(catFilter);
      const prodNorm = normalizeCategory(p.category);

      // If user selected cable-exclusive filters (like 3 Core or Armoured),
      // allow matching Wires & Cables even if catFilter was previously set to another category
      if (hasCableExclusiveFilter && targetNorm !== "Wires & Cables") {
        if (prodNorm !== "Wires & Cables") {
          return false;
        }
      } else if (targetNorm !== prodNorm && !p.category.toLowerCase().includes(catFilter)) {
        return false;
      }
    }

    if (params.subcategories && params.subcategories.length > 0) {
      const lowerList = params.subcategories.map((s) => s.toLowerCase().trim());
      const pSub = (p.subcategory || "").toLowerCase().trim();
      const pName = p.name.toLowerCase();
      const match = lowerList.some(
        (target) =>
          (pSub && (pSub === target || pSub.includes(target) || target.includes(pSub))) ||
          pName.includes(target)
      );
      if (!match) return false;
    } else if (subCatFilter) {
      const cleanSubFilter = subCatFilter.replace(/[-_()]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
      const pSub = (p.subcategory || "").replace(/[-_()]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
      const pName = p.name.toLowerCase();
      const pDesc = (p.description || "").toLowerCase();

      const directMatch = pSub === cleanSubFilter || pSub.includes(cleanSubFilter) || cleanSubFilter.includes(pSub);
      if (!directMatch) {
        const stopWords = new Set(["cable", "cables", "insulated", "wire", "wires", "and", "the", "for", "with", "type", "core", "flat"]);
        const targetKeywords = cleanSubFilter.split(" ").filter((w) => w.length >= 3 && !stopWords.has(w));
        const keywordMatch = targetKeywords.length > 0 && targetKeywords.every((w) => pSub.includes(w) || pName.includes(w) || pDesc.includes(w));
        if (!keywordMatch) return false;
      }
    }

    if (brandFilter) {
      if (p.brand.toLowerCase() !== brandFilter) {
        return false;
      }
    }

    if (params.minPrice !== undefined && (p.numericPrice || 0) < params.minPrice) {
      return false;
    }
    if (params.maxPrice !== undefined && (p.numericPrice || 0) > params.maxPrice) {
      return false;
    }

    // Technical Filter: Conductor Material
    if (params.material) {
      const mTarget = params.material.toLowerCase().trim();
      const pMat = (p.material || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (!pMat.includes(mTarget) && !pName.includes(mTarget)) {
        return false;
      }
    }

    // Technical Filter: Voltage Grade
    if (params.voltage) {
      const vTarget = params.voltage.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const voltRating = (specs.voltageRating || "").toLowerCase();
      const pName = p.name.toLowerCase();

      if (vTarget === "1.1 kv" || vTarget === "1100v" || vTarget === "1.1kv") {
        const isHighVolt11kv = (voltRating.includes("11 kv") || voltRating.includes("11kv") || pName.includes("11 kv") || pName.includes("11kv")) && !voltRating.includes("1100");
        if (isHighVolt11kv) return false;
        const matches1100 = voltRating.includes("1100") || voltRating.includes("1.1") || pName.includes("1100") || pName.includes("1.1 kv") || pName.includes("1.1kv");
        if (!matches1100) return false;
      } else if (vTarget === "11 kv" || vTarget === "11kv") {
        const matches11kv = (voltRating.includes("11 kv") || voltRating.includes("11kv") || pName.includes("11 kv") || pName.includes("11kv")) && !voltRating.includes("1100");
        if (!matches11kv) return false;
      } else if (vTarget === "33 kv" || vTarget === "33kv") {
        const matches33kv = voltRating.includes("33") || pName.includes("33 kv") || pName.includes("33kv");
        if (!matches33kv) return false;
      } else if (vTarget.includes("1500")) {
        const matches1500 = voltRating.includes("1500") || pName.includes("1500");
        if (!matches1500) return false;
      } else {
        if (!voltRating.includes(vTarget) && !pName.includes(vTarget)) {
          return false;
        }
      }
    }

    // Technical Filter: Cores / Phase
    if (params.cores) {
      const cTarget = params.cores.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const pCores = (specs.cores || "").toLowerCase();
      const pName = p.name.toLowerCase();

      if (cTarget === "3.5 core" || cTarget === "3.5") {
        const r35 = /(?:^|\b|\s)3\.5\s*core(?:$|\b|\s)/i;
        if (!r35.test(pCores) && !r35.test(pName)) return false;
      } else if (cTarget === "1 core" || cTarget === "1") {
        const r1 = /(?:^|\b|\s)1\s*core(?:$|\b|\s)/i;
        const isSingle = pCores.includes("single core") || pName.includes("single core");
        if (!r1.test(pCores) && !r1.test(pName) && !isSingle) return false;
      } else if (cTarget === "2 core" || cTarget === "2") {
        const r2 = /(?:^|\b|\s)2\s*core(?:$|\b|\s)/i;
        if (!r2.test(pCores) && !r2.test(pName)) return false;
      } else if (cTarget === "3 core" || cTarget === "3") {
        const r35 = /(?:^|\b|\s)3\.5\s*core(?:$|\b|\s)/i;
        if (r35.test(pCores) || r35.test(pName)) return false;
        const r3 = /(?:^|\b|\s)3\s*core(?:$|\b|\s)/i;
        if (!r3.test(pCores) && !r3.test(pName)) return false;
      } else if (cTarget === "4 core" || cTarget === "4") {
        const r4 = /(?:^|\b|\s)4\s*core(?:$|\b|\s)/i;
        if (!r4.test(pCores) && !r4.test(pName)) return false;
      } else {
        if (!pCores.includes(cTarget) && !pName.includes(cTarget)) return false;
      }
    }

    // Technical Filter: Armour Type
    if (params.armorType) {
      const aTarget = params.armorType.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const pArmour = (specs.typeOfArmour || "").toLowerCase();
      const pName = p.name.toLowerCase();
      const pSub = (p.subcategory || "").toLowerCase();

      if (aTarget === "armoured" || aTarget === "armored") {
        const isUn = pArmour.includes("unarmoured") || pName.includes("unarmoured") || pSub.includes("unarmoured");
        const isArm = pArmour.includes("armoured") || pName.includes("armoured") || pSub.includes("armoured") || pName.includes("2xwy") || pName.includes("a2xwy");
        if (isUn || !isArm) return false;
      } else if (aTarget === "unarmoured" || aTarget === "unarmored") {
        const isUn = pArmour.includes("unarmoured") || pName.includes("unarmoured") || pSub.includes("unarmoured");
        const isArmOnly = !isUn && (pArmour.includes("armoured") || pName.includes("armoured"));
        if (isArmOnly) return false;
      }
    }

    // Technical Filter: Color
    if (params.color) {
      const colTarget = params.color.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const col = (specs.color || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (!col.includes(colTarget) && !pName.includes(colTarget)) {
        return false;
      }
    }

    // Technical Filter: Size - Sq Mm
    if (params.sizeSqMm) {
      const sTarget = params.sizeSqMm.toLowerCase().replace(/sqmm|sq\s*mm/i, "").trim();
      const pSize = (p.size || "").toLowerCase().replace(/sqmm|sq\s*mm/i, "").trim();
      const pName = p.name.toLowerCase();
      const numPattern = new RegExp(`(?:^|\\b|\\s)${sTarget.replace('.', '\\.')}\\s*(?:sqmm|sq\\s*mm|sq|mm)?(?:$|\\b|\\s)`, "i");
      const matchesSize = pSize === sTarget || numPattern.test(p.size || "") || numPattern.test(pName);
      if (!matchesSize) {
        return false;
      }
    }

    // Technical Filter: Insulation Type
    if (params.insulationType) {
      const insTarget = params.insulationType.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const ins = (specs.insulationType || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (!ins.includes(insTarget) && !pName.includes(insTarget)) {
        return false;
      }
    }

    // Technical Filter: Shielding Type
    if (params.shieldingType) {
      const shTarget = params.shieldingType.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const sh = (specs.shieldingType || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (shTarget.includes("unshield")) {
        if (!sh.includes("unshield") && !pName.includes("unshield")) return false;
      } else if (shTarget.includes("overall")) {
        const isOverall = sh.includes("overall") || sh.includes("aluminum mylar") || pName.includes("overall");
        if (!isOverall) return false;
      } else if (shTarget.includes("braid")) {
        if (!sh.includes("braid") && !pName.includes("braid")) return false;
      } else if (shTarget.includes("foil")) {
        if (!sh.includes("foil") && !pName.includes("foil")) return false;
      } else if (!sh.includes(shTarget) && !pName.includes(shTarget)) {
        return false;
      }
    }

    // Technical Filter: Inner Sheath Material
    if (params.innerSheath) {
      const isTarget = params.innerSheath.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const isMat = (specs.innerSheathMaterial || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (isTarget.includes("jelly")) {
        if (!isMat.includes("jelly") && !pName.includes("jelly")) return false;
      } else if (isTarget === "frlsh") {
        if (!isMat.includes("frlsh") && !pName.includes("frlsh")) return false;
      } else if (isTarget === "fr") {
        if ((!isMat.includes("fr") && !pName.includes("fr")) || isMat.includes("frlsh")) return false;
      } else if (!isMat.includes(isTarget) && !pName.includes(isTarget)) {
        return false;
      }
    }

    // Technical Filter: Outer Sheath Material
    if (params.outerSheath) {
      const osTarget = params.outerSheath.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const osMat = (specs.outerSheathMaterial || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (osTarget === "frlsh") {
        if (!osMat.includes("frlsh") && !pName.includes("frlsh")) return false;
      } else if (osTarget === "fr") {
        if ((!osMat.includes("fr") && !pName.includes("fr")) || osMat.includes("frlsh")) return false;
      } else if (!osMat.includes(osTarget) && !pName.includes(osTarget)) {
        return false;
      }
    }

    // Technical Filter: Conductor Class
    if (params.conductorClass) {
      const ccTarget = params.conductorClass.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const cc = (specs.conductorClass || "").toLowerCase();
      const pName = p.name.toLowerCase();
      const isClass5 = ccTarget.includes("class 5") || ccTarget.includes("flexible") || ccTarget.includes("5");
      const isClass2 = ccTarget.includes("class 2") || ccTarget.includes("stranded") || ccTarget.includes("2");
      if (isClass5 && !cc.includes("5") && !cc.includes("flex") && !pName.includes("flex")) return false;
      if (isClass2 && !cc.includes("2") && !cc.includes("strand") && !pName.includes("strand")) return false;
      if (!isClass5 && !isClass2 && !cc.includes(ccTarget) && !pName.includes(ccTarget)) return false;
    }

    // Technical Filter: Poles / Phase (Switchgear)
    if (params.poles) {
      const pTarget = params.poles.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const pol = (specs.polesPhase || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (!pol.includes(pTarget) && !pName.includes(pTarget)) {
        return false;
      }
    }

    // Technical Filter: Current Rating (Switchgear)
    if (params.rating) {
      const rTarget = params.rating.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const curr = (specs.currentRatingA || "").toLowerCase();
      const pName = p.name.toLowerCase();
      const cleanTarget = rTarget.replace("a", "");
      if (!curr.includes(rTarget) && !curr.includes(cleanTarget) && !pName.includes(rTarget)) {
        return false;
      }
    }

    // Stock Filter
    if (params.stock === "in_stock") {
      const avail = (p.availability || "in stock").toLowerCase();
      if (!avail.includes("stock")) return false;
    }

    if (searchLower) {
      const haystack = `${p.productId} ${p.sku} ${p.name} ${p.brand} ${p.category} ${p.subcategory || ""} ${p.size || ""} ${p.material || ""} ${p.specifications || ""}`.toLowerCase();
      const words = searchLower.split(/\s+/);
      return words.every((w) => haystack.includes(w));
    }

    return true;
  });

  // Sorting
  if (params.sortBy === "price_asc") {
    filtered.sort((a, b) => {
      const pa = (a.numericPrice && a.numericPrice > 0) ? a.numericPrice : Number.MAX_VALUE;
      const pb = (b.numericPrice && b.numericPrice > 0) ? b.numericPrice : Number.MAX_VALUE;
      return pa - pb;
    });
  } else if (params.sortBy === "price_desc") {
    filtered.sort((a, b) => (b.numericPrice || 0) - (a.numericPrice || 0));
  } else if (params.sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    products: paginated,
    total,
    page,
    limit,
    totalPages,
  };
}

const LEGACY_VLP_ALIASES: Record<string, string> = {
  "VLP-AL-001": "CAB-000001",
  "VLP-IN-014": "CAB-000002",
  "VLP-SL-022": "SOL-000001",
  "VLP-BW-031": "CAB-000003",
  "VLP-SG-048": "SWG-000001",
};

export function getProductByProductId(productId: string): Product | undefined {
  if (!productId || typeof productId !== "string") return undefined;
  const all = getCachedProducts();
  const rawClean = productId.trim();
  const normalized = rawClean.toUpperCase();

  // 1. Direct legacy alias match
  if (LEGACY_VLP_ALIASES[normalized]) {
    const aliasedId = LEGACY_VLP_ALIASES[normalized];
    const match = all.find((p) => p.productId.toUpperCase() === aliasedId);
    if (match) return match;
  }

  // 2. Direct exact match by productId or SKU
  const direct = all.find((p) => p.productId.toUpperCase() === normalized || p.sku.toUpperCase() === normalized);
  if (direct) return direct;

  // 3. Prefix match (e.g. CAB-000001 with extra slug)
  const prefixMatch = all.find((p) => normalized.startsWith(p.productId.toUpperCase()));
  if (prefixMatch) return prefixMatch;

  // 4. Numeric ID match (e.g. "1" -> id: 1)
  const num = parseInt(productId, 10);
  if (!isNaN(num)) {
    const byNum = all.find((p) => p.id === num);
    if (byNum) return byNum;
  }

  // 5. Slugified name match (e.g. "0-5-sqmm-x-1-core-unarmoured-copper-cable")
  const slugifiedInput = rawClean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (slugifiedInput) {
    const bySlug = all.find((p) => {
      const pSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return pSlug === slugifiedInput || pSlug.startsWith(slugifiedInput);
    });
    if (bySlug) return bySlug;
  }

  // 6. Partial SKU or case-insensitive search
  const partial = all.find((p) => p.sku.toUpperCase().includes(normalized) || p.productId.toUpperCase().includes(normalized));
  if (partial) return partial;

  return undefined;
}

export function getCatalogCategories() {
  const all = getCachedProducts();
  const catMap: Record<
    string,
    { name: string; total: number; subcategories: Record<string, number>; brands: Set<string> }
  > = {};

  for (const p of all) {
    const canonical = normalizeCategory(p.category);
    if (!catMap[canonical]) {
      catMap[canonical] = { name: canonical, total: 0, subcategories: {}, brands: new Set() };
    }
    catMap[canonical].total += 1;
    if (p.brand) catMap[canonical].brands.add(p.brand);
    if (p.subcategory) {
      catMap[canonical].subcategories[p.subcategory] = (catMap[canonical].subcategories[p.subcategory] || 0) + 1;
    }
  }

  return Object.values(catMap).map((c) => ({
    name: c.name,
    total: c.total,
    brands: Array.from(c.brands),
    subcategories: Object.entries(c.subcategories).map(([name, count]) => ({ name, count })),
  }));
}

export function getCatalogBrands(category?: string) {
  const all = getCachedProducts();
  const brands = new Set<string>();
  const targetCategory = category ? normalizeCategory(category) : null;

  for (const p of all) {
    if (targetCategory && normalizeCategory(p.category) !== targetCategory) {
      continue;
    }
    if (p.brand) {
      brands.add(p.brand);
    }
  }

  return Array.from(brands).sort();
}

export function getCategoryFilterStats(category?: string, subcategory?: string) {
  const all = getCachedProducts();
  const catFilter = (category || "").toLowerCase().trim();
  const subCatFilter = (subcategory || "").toLowerCase().trim();

  const relevant = all.filter((p) => {
    if (p.status !== "Active") return false;
    if (catFilter) {
      const targetNorm = normalizeCategory(catFilter);
      const prodNorm = normalizeCategory(p.category);
      if (targetNorm !== prodNorm && !p.category.toLowerCase().includes(catFilter)) {
        return false;
      }
    }
    if (subCatFilter) {
      const cleanSubFilter = subCatFilter.replace(/[-_()]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
      const pSub = (p.subcategory || "").replace(/[-_()]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
      const pName = p.name.toLowerCase();
      const directMatch = pSub === cleanSubFilter || pSub.includes(cleanSubFilter) || cleanSubFilter.includes(pSub);
      if (!directMatch && !pName.includes(cleanSubFilter)) return false;
    }
    return true;
  });

  const r1 = /(?:^|\b|\s)1\s*core(?:$|\b|\s)/i;
  const r2 = /(?:^|\b|\s)2\s*core(?:$|\b|\s)/i;
  const r3 = /(?:^|\b|\s)3\s*core(?:$|\b|\s)/i;
  const r35 = /(?:^|\b|\s)3\.5\s*core(?:$|\b|\s)/i;
  const r4 = /(?:^|\b|\s)4\s*core(?:$|\b|\s)/i;

  const counts = {
    materials: { Copper: 0, Aluminium: 0 } as Record<string, number>,
    voltages: { "1100V": 0, "1.1 kV": 0, "11 kV": 0, "33 kV": 0, "1500V DC": 0 } as Record<string, number>,
    cores: { "1 Core": 0, "2 Core": 0, "3 Core": 0, "3.5 Core": 0, "4 Core": 0, "Multi Core": 0, "Pair": 0, "Triad": 0, "Quad": 0 } as Record<string, number>,
    armour: { Armoured: 0, Unarmoured: 0 } as Record<string, number>,
    colors: { BLACK: 0, RED: 0, BLUE: 0, YELLOW: 0, GREEN: 0, GREY: 0, ORANGE: 0, Transparent: 0 } as Record<string, number>,
    sizes: {
      "0.5 SQMM": 0, "0.75 SQMM": 0, "1 SQMM": 0, "1.5 SQMM": 0, "2.5 SQMM": 0,
      "4 SQMM": 0, "6 SQMM": 0, "10 SQMM": 0, "16 SQMM": 0, "25 SQMM": 0,
      "35 SQMM": 0, "50 SQMM": 0, "70 SQMM": 0, "95 SQMM": 0, "120 SQMM": 0,
      "150 SQMM": 0, "185 SQMM": 0, "240 SQMM": 0, "300 SQMM": 0, "400 SQMM": 0,
    } as Record<string, number>,
    insulation: { PVC: 0, XLPE: 0, FRLSH: 0, FR: 0 } as Record<string, number>,
    shielding: { "Unshielded": 0, "Overall Shielded": 0, "Braided Screen": 0, "Foiled Shielded": 0 } as Record<string, number>,
    innerSheath: { PVC: 0, FRLSH: 0, FR: 0, "Jelly Filled": 0 } as Record<string, number>,
    outerSheath: { PVC: 0, FRLSH: 0, FR: 0 } as Record<string, number>,
    conductorClass: { "Class 2 (Stranded)": 0, "Class 5 (Flexible)": 0 } as Record<string, number>,
    poles: { "1P": 0, "2P": 0, "3P": 0, "4P": 0 } as Record<string, number>,
    ratings: { "6A": 0, "10A": 0, "16A": 0, "25A": 0, "32A": 0, "40A": 0, "63A": 0, "100A": 0 } as Record<string, number>,
    stock: { in_stock: 0, all: relevant.length } as Record<string, number>,
  };

  for (const p of relevant) {
    const specs = parseItemSpecs(p.specifications);
    const volt = (specs.voltageRating || "").toLowerCase();
    const cores = (specs.cores || "").toLowerCase();
    const armour = (specs.typeOfArmour || "").toLowerCase();
    const pol = (specs.polesPhase || "").toLowerCase();
    const curr = (specs.currentRatingA || "").toLowerCase();
    const mat = (p.material || "").toLowerCase();
    const name = p.name.toLowerCase();
    const sub = (p.subcategory || "").toLowerCase();
    const avail = (p.availability || "in stock").toLowerCase();
    const isCable = p.category.toLowerCase().includes("wire") || p.category.toLowerCase().includes("cable");
    const isSwitchgear = p.category.toLowerCase().includes("switch");

    // Material (Cables & Conductors)
    if (mat.includes("copper") || name.includes("copper")) counts.materials.Copper++;
    if (mat.includes("aluminium") || name.includes("aluminium")) counts.materials.Aluminium++;

    // Voltage (Cables)
    if (isCable) {
      const is11kv = (volt.includes("11 kv") || volt.includes("11kv") || name.includes("11 kv") || name.includes("11kv")) && !volt.includes("1100");
      const matches1100 = volt.includes("1100") || volt.includes("1.1") || name.includes("1100") || name.includes("1.1 kv") || name.includes("1.1kv");

      if (!is11kv && matches1100) {
        counts.voltages["1100V"]++;
        counts.voltages["1.1 kV"]++;
      }
      if (is11kv) counts.voltages["11 kV"]++;
      if (volt.includes("33") || name.includes("33 kv") || name.includes("33kv")) counts.voltages["33 kV"]++;
      if (volt.includes("1500") || name.includes("1500")) counts.voltages["1500V DC"]++;

      // Cores (Cables)
      if (cores.includes("pair") || name.includes("pair")) {
        counts.cores["Pair"]++;
      } else if (cores.includes("triad") || name.includes("triad")) {
        counts.cores["Triad"]++;
      } else if (cores.includes("quad") || name.includes("quad")) {
        counts.cores["Quad"]++;
      } else if (r35.test(cores) || r35.test(name)) {
        counts.cores["3.5 Core"]++;
      } else if (r1.test(cores) || r1.test(name) || cores.includes("single core") || name.includes("single core")) {
        counts.cores["1 Core"]++;
      } else if (r2.test(cores) || r2.test(name)) {
        counts.cores["2 Core"]++;
      } else if (r3.test(cores) || r3.test(name)) {
        counts.cores["3 Core"]++;
      } else if (r4.test(cores) || r4.test(name)) {
        counts.cores["4 Core"]++;
      } else if (/(?:5|6|7|8|10|12|14|16|19|24|27|30|37)\s*core/i.test(cores) || /(?:5|6|7|8|10|12|14|16|19|24|27|30|37)\s*core/i.test(name)) {
        counts.cores["Multi Core"]++;
      }

      // Armour (Cables)
      const isUn = armour.includes("unarmoured") || name.includes("unarmoured") || sub.includes("unarmoured");
      const isArm = armour.includes("armoured") || name.includes("armoured") || sub.includes("armoured") || name.includes("2xwy") || name.includes("a2xwy");
      if (!isUn && isArm) counts.armour.Armoured++;
      if (isUn) counts.armour.Unarmoured++;

      // Color (Cables)
      const c = (specs.color || "").toUpperCase();
      if (c in counts.colors) counts.colors[c]++;

      // Size - Sq Mm (Cables)
      const s = (p.size || "").toUpperCase().trim();
      if (s in counts.sizes) counts.sizes[s]++;

      // Insulation (Cables)
      const ins = (specs.insulationType || "").toUpperCase();
      if (ins.includes("XLPE")) counts.insulation.XLPE++;
      if (ins.includes("PVC")) counts.insulation.PVC++;
      if (ins.includes("FRLSH")) counts.insulation.FRLSH++;
      else if (ins.includes("FR")) counts.insulation.FR++;

      // Shielding (Cables)
      const sh = (specs.shieldingType || "").toLowerCase();
      if (sh.includes("unshield")) counts.shielding["Unshielded"]++;
      if (sh.includes("overall") || sh.includes("aluminum mylar")) counts.shielding["Overall Shielded"]++;
      if (sh.includes("braid")) counts.shielding["Braided Screen"]++;
      if (sh.includes("foil")) counts.shielding["Foiled Shielded"]++;

      // Inner Sheath (Cables)
      const isM = (specs.innerSheathMaterial || "").toUpperCase();
      if (isM.includes("PVC")) counts.innerSheath.PVC++;
      if (isM.includes("FRLSH")) counts.innerSheath.FRLSH++;
      else if (isM.includes("FR")) counts.innerSheath.FR++;
      if (isM.includes("JELLY")) counts.innerSheath["Jelly Filled"]++;

      // Outer Sheath (Cables)
      const osM = (specs.outerSheathMaterial || "").toUpperCase();
      if (osM.includes("PVC")) counts.outerSheath.PVC++;
      if (osM.includes("FRLSH")) counts.outerSheath.FRLSH++;
      else if (osM.includes("FR")) counts.outerSheath.FR++;

      // Conductor Class (Cables)
      const cc = (specs.conductorClass || "").toLowerCase();
      if (cc.includes("5") || cc.includes("flex")) counts.conductorClass["Class 5 (Flexible)"]++;
      if (cc.includes("2") || cc.includes("strand")) counts.conductorClass["Class 2 (Stranded)"]++;
    }

    // Poles & Current Rating (Switchgear)
    if (isSwitchgear) {
      if (pol.includes("1p") || pol.includes("sp")) counts.poles["1P"]++;
      if (pol.includes("2p") || pol.includes("dp")) counts.poles["2P"]++;
      if (pol.includes("3p") || pol.includes("tp")) counts.poles["3P"]++;
      if (pol.includes("4p") || pol.includes("fp")) counts.poles["4P"]++;

      ["6A", "10A", "16A", "25A", "32A", "40A", "63A", "100A"].forEach((rt) => {
        const val = rt.replace("A", "");
        if (curr.includes(rt.toLowerCase()) || curr === val || curr.startsWith(val + ".") || name.includes(rt.toLowerCase())) {
          counts.ratings[rt]++;
        }
      });
    }

    // Stock
    if (avail.includes("stock")) counts.stock.in_stock++;
  }

  return counts;
}

export interface ImportPreviewResult {
  summary: {
    newCount: number;
    updatedCount: number;
    unchangedCount: number;
    inactiveCount: number;
    errorCount: number;
    totalInFile: number;
  };
  sampleDiffs: Array<{
    productId: string;
    name: string;
    brand: string;
    changeType: "new" | "updated" | "unchanged" | "error";
    diffs: Array<{ field: string; oldVal: any; newVal: any }>;
  }>;
  errors: Array<{ row: number; sheet: string; reason: string }>;
  timestamp: string;
}

export function previewImportDiff(incomingProducts: any[]): ImportPreviewResult {
  const current = getCachedProducts();
  const currentMap = new Map<string, Product>();
  for (const p of current) {
    currentMap.set(p.productId, p);
  }

  let newCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;
  let errorCount = 0;
  const sampleDiffs: ImportPreviewResult["sampleDiffs"] = [];
  const errors: ImportPreviewResult["errors"] = [];
  const incomingIds = new Set<string>();

  for (let i = 0; i < incomingProducts.length; i++) {
    const item = incomingProducts[i];
    if (!item.productId || !item.name || !item.category) {
      errorCount++;
      errors.push({ row: i + 1, sheet: item.sheetSource || "Unknown", reason: "Missing productId, name, or category" });
      continue;
    }

    incomingIds.add(item.productId);
    const existing = currentMap.get(item.productId);

    if (!existing) {
      newCount++;
      if (sampleDiffs.length < 15) {
        sampleDiffs.push({
          productId: item.productId,
          name: item.name,
          brand: item.brand || "Volamp",
          changeType: "new",
          diffs: [{ field: "status", oldVal: null, newVal: "NEW PRODUCT" }],
        });
      }
    } else {
      // Check for updates in price, name, discount, availability
      const fieldDiffs: Array<{ field: string; oldVal: any; newVal: any }> = [];
      if (existing.price !== item.price) {
        fieldDiffs.push({ field: "price", oldVal: existing.price, newVal: item.price });
      }
      if (existing.name !== item.name) {
        fieldDiffs.push({ field: "name", oldVal: existing.name, newVal: item.name });
      }
      if (existing.discount !== item.discount) {
        fieldDiffs.push({ field: "discount", oldVal: existing.discount, newVal: item.discount });
      }
      if (existing.availability !== item.availability) {
        fieldDiffs.push({ field: "availability", oldVal: existing.availability, newVal: item.availability });
      }

      if (fieldDiffs.length > 0) {
        updatedCount++;
        if (sampleDiffs.length < 15) {
          sampleDiffs.push({
            productId: item.productId,
            name: item.name,
            brand: item.brand || existing.brand,
            changeType: "updated",
            diffs: fieldDiffs,
          });
        }
      } else {
        unchangedCount++;
      }
    }
  }

  // Count items present in DB but missing from incoming
  let inactiveCount = 0;
  for (const p of current) {
    if (p.status === "Active" && !incomingIds.has(p.productId)) {
      inactiveCount++;
    }
  }

  return {
    summary: {
      newCount,
      updatedCount,
      unchangedCount,
      inactiveCount,
      errorCount,
      totalInFile: incomingProducts.length,
    },
    sampleDiffs,
    errors: errors.slice(0, 20),
    timestamp: new Date().toISOString(),
  };
}

export function commitProducts(updatedList: any[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(updatedList, null, 2), "utf-8");
  _productsCache = null; // Flush cache
  return loadProductsFromDisk();
}
