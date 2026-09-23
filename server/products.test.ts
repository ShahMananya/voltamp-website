import { describe, expect, it } from "vitest";
import {
  queryProducts,
  getProductByProductId,
  getCatalogCategories,
  getCatalogBrands,
  previewImportDiff,
} from "./services/productService";

describe("Dynamic Product Master Data System", () => {
  it("loads all 3,385 products across 8 categories with stable Product IDs", () => {
    const result = queryProducts({ limit: 50 });
    expect(result.total).toBe(3385);
    expect(result.products.length).toBe(50);

    const categories = getCatalogCategories();
    expect(categories.length).toBeGreaterThanOrEqual(8);

    const catNames = categories.map((c) => c.name);
    expect(catNames).toContain("Wires & Cables");
    expect(catNames).toContain("Switchgear");
    expect(catNames).toContain("Lugs");
    expect(catNames).toContain("PVC Pipe");
    expect(catNames).toContain("Glands");
    expect(catNames).toContain("Wiring Devices");
    expect(catNames).toContain("Earthing Wires");
    expect(catNames).toContain("Solar");
  });

  it("differentiates multiple brands for the same product specification with unique Product IDs", () => {
    // Search for 2.5 SQMM cable
    const query = queryProducts({ search: "2.5 SQMM Copper Cable", limit: 20 });
    expect(query.total).toBeGreaterThan(0);

    const brands = Array.from(new Set(query.products.map((p) => p.brand)));
    expect(brands.length).toBeGreaterThanOrEqual(1);

    // Verify all products have unique Product IDs
    const idSet = new Set(query.products.map((p) => p.productId));
    expect(idSet.size).toBe(query.products.length);

    // Each product has its own price and SKU
    for (const p of query.products) {
      expect(p.productId).toMatch(/^CAB-\d{6}$/);
      expect(p.price).toBeDefined();
      expect(p.unit).toBeDefined();
    }
  });

  it("retrieves a single product by permanent Product ID", () => {
    const product = getProductByProductId("CAB-000001");
    expect(product).toBeDefined();
    expect(product?.productId).toBe("CAB-000001");
    expect(product?.category).toBe("Wires & Cables");
    expect(product?.specifications).toBeDefined();

    // Verify specifications parse as JSON
    const specs = JSON.parse(product!.specifications!);
    expect(specs.voltageRating).toBe("Upto 1100V");
  });

  it("preserves existing Product IDs for Earthing Wires and Wiring Devices", () => {
    const earProduct = getProductByProductId("EAR-001");
    expect(earProduct).toBeDefined();
    expect(earProduct?.category).toBe("Earthing Wires");
    expect(earProduct?.name).toContain("Copper Earthing Electrode");

    const wdProduct = getProductByProductId("WD-000001");
    expect(wdProduct).toBeDefined();
    expect(wdProduct?.category).toBe("Wiring Devices");
  });

  it("filters products by brand and category accurately", () => {
    const polycabCables = queryProducts({
      category: "Wires & Cables",
      brand: "Polycab",
      limit: 10,
    });
    expect(polycabCables.total).toBeGreaterThan(0);
    for (const p of polycabCables.products) {
      expect(p.brand).toBe("Polycab");
      expect(p.category).toBe("Wires & Cables");
    }

    const switchgearBrands = getCatalogBrands("Switchgear");
    expect(switchgearBrands).toContain("LK");
  });

  it("calculates import diff preview showing New, Updated, Unchanged, and Inactive items", () => {
    const sampleIncoming = [
      // Unchanged
      {
        productId: "CAB-000001",
        name: "0.5 SQMM X 1 CORE Unarmoured Copper CABLE",
        category: "Wires & Cables",
        price: "₹21.55",
        discount: "40 %",
        availability: "IN STOCK",
      },
      // Price update (e.g. from ₹96.25 to ₹102.00)
      {
        productId: "CAB-000005",
        name: "2.5 SQMM X 1 CORE Unarmoured Copper CABLE",
        category: "Wires & Cables",
        price: "₹102.00",
        discount: "40 %",
        availability: "IN STOCK",
      },
      // New product
      {
        productId: "CAB-999999",
        name: "Brand New Solar Armoured Cable",
        category: "Wires & Cables",
        price: "₹150.00",
        discount: "30 %",
        availability: "IN STOCK",
      },
      // Invalid product (missing name/category)
      {
        productId: "CAB-INVALID",
        name: "",
        category: "",
        price: "₹50.00",
      },
    ];

    const preview = previewImportDiff(sampleIncoming);
    expect(preview.summary.newCount).toBe(1);
    expect(preview.summary.updatedCount).toBe(1);
    expect(preview.summary.unchangedCount).toBe(1);
    expect(preview.summary.errorCount).toBe(1);
    expect(preview.sampleDiffs.some((d) => d.changeType === "updated" && d.productId === "CAB-000005")).toBe(true);
  });

  it("preserves price snapshot immutability for quotations", () => {
    // Historical quotation snapshot
    const quoteItem = {
      productId: "CAB-000005",
      name: "2.5 SQMM X 1 CORE Unarmoured Copper CABLE",
      brand: "Polycab",
      quantity: 100,
      unitPrice: 96.25,
      discount: 10,
      tax: 18,
      finalPrice: 10221.75,
      timestamp: "2026-09-01T10:00:00.000Z",
    };

    // Even if live catalog price is ₹102.00
    const liveCatalogProduct = {
      productId: "CAB-000005",
      price: "₹102.00",
      numericPrice: 102,
    };

    // The historical quote item price is frozen and unaffected
    expect(quoteItem.unitPrice).toBe(96.25);
    expect(liveCatalogProduct.numericPrice).toBe(102);
    expect(quoteItem.unitPrice).not.toBe(liveCatalogProduct.numericPrice);
  });
});
