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
}

export function normalizeCategory(c: string): string {
  const s = (c || "").toLowerCase().replace(/[-_&]/g, " ").replace(/\s+/g, " ").trim();
  if (s.includes("earth")) return "Earthing Wires";
  if (s.includes("wiring") || s.includes("device")) return "Wiring Devices";
  if (s.includes("switch")) return "Switchgear";
  if (s.includes("lug")) return "Lugs";
  if (s.includes("pipe") || s.includes("pvc") || s.includes("conduit")) return "PVC Pipe";
  if (s.includes("gland")) return "Glands";
  if (s.includes("solar")) return "Solar";
  if (s.includes("wire") || s.includes("cable")) return "Wires & Cables";
  return c.trim();
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

  let filtered = all.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) {
      return false;
    }

    if (catFilter) {
      const targetNorm = normalizeCategory(catFilter);
      const prodNorm = normalizeCategory(p.category);
      if (targetNorm !== prodNorm && !p.category.toLowerCase().includes(catFilter)) {
        return false;
      }
    }

    if (params.subcategories && params.subcategories.length > 0) {
      const lowerList = params.subcategories.map((s) => s.toLowerCase().trim());
      const pSub = (p.subcategory || "").toLowerCase().trim();
      const pName = p.name.toLowerCase();
      const match = lowerList.some(
        (target) =>
          (pSub && (pSub.includes(target) || target.includes(pSub))) ||
          pName.includes(target)
      );
      if (!match) return false;
    } else if (subCatFilter) {
      const cleanSubFilter = subCatFilter.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
      const pSub = (p.subcategory || "").replace(/[-_]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
      const pName = p.name.toLowerCase();
      
      const directMatch = pSub.includes(cleanSubFilter) || cleanSubFilter.includes(pSub);
      const words = cleanSubFilter.split(" ").filter((w) => w.length >= 3 && !["cable", "cables", "insulated", "and", "the", "for"].includes(w));
      const keywordMatch = words.length > 0 && words.some((w) => pSub.includes(w) || pName.includes(w));
      
      if (!directMatch && !keywordMatch) return false;
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

    if (searchLower) {
      const haystack = `${p.productId} ${p.sku} ${p.name} ${p.brand} ${p.category} ${p.subcategory || ""} ${p.size || ""} ${p.material || ""} ${p.specifications || ""}`.toLowerCase();
      const words = searchLower.split(/\s+/);
      return words.every((w) => haystack.includes(w));
    }

    return true;
  });

  // Sorting
  if (params.sortBy === "price_asc") {
    filtered.sort((a, b) => (a.numericPrice || 0) - (b.numericPrice || 0));
  } else if (params.sortBy === "price_desc") {
    filtered.sort((a, b) => (b.numericPrice || 0) - (a.numericPrice || 0));
  } else if (params.sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
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

export function getProductByProductId(productId: string): Product | undefined {
  const all = getCachedProducts();
  const normalized = productId.trim().toUpperCase();
  return all.find((p) => p.productId.toUpperCase() === normalized || p.sku.toUpperCase() === normalized);
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
