import { Express, Request, Response } from "express";
import {
  queryProducts,
  getProductByProductId,
  getCatalogCategories,
  getCatalogBrands,
  previewImportDiff,
  loadProductsFromDisk,
} from "./services/productService";

export function registerProductRestRoutes(app: Express) {
  // GET /api/products
  // Supports ?category=...&subcategory=...&brand=...&search=...&page=1&limit=24&status=Active
  app.get("/api/products", (req: Request, res: Response) => {
    try {
      const { category, subcategory, brand, search, status, page, limit, sortBy, minPrice, maxPrice } = req.query;

      const result = queryProducts({
        category: category ? String(category) : undefined,
        subcategory: subcategory ? String(subcategory) : undefined,
        brand: brand ? String(brand) : undefined,
        search: search ? String(search) : undefined,
        status: status as any,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 24,
        sortBy: sortBy as any,
        minPrice: minPrice ? parseFloat(String(minPrice)) : undefined,
        maxPrice: maxPrice ? parseFloat(String(maxPrice)) : undefined,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error("[API Products] Error:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to query products" });
    }
  });

  // GET /api/products/meta/categories
  app.get("/api/products/meta/categories", (_req: Request, res: Response) => {
    try {
      const categories = getCatalogCategories();
      return res.json({ success: true, data: categories });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/products/meta/brands
  app.get("/api/products/meta/brands", (req: Request, res: Response) => {
    try {
      const { category } = req.query;
      const brands = getCatalogBrands(category ? String(category) : undefined);
      return res.json({ success: true, data: brands });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/products/:productId
  app.get("/api/products/:productId", (req: Request, res: Response) => {
    try {
      const { productId } = req.params;
      const product = getProductByProductId(productId);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product '${productId}' not found` });
      }
      return res.json({ success: true, data: product });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // POST /api/products/sync-preview
  app.post("/api/products/sync-preview", (_req: Request, res: Response) => {
    try {
      const current = loadProductsFromDisk();
      const preview = previewImportDiff(current);
      return res.json({ success: true, data: preview });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
}
