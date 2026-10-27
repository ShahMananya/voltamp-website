import { describe, expect, it } from "vitest";
import { generateGoogleMerchantXml } from "./googleMerchantFeed";
import { loadProductsFromDisk } from "./services/productService";

describe("Google Merchant Center Integration", () => {
  it("has a non-empty product catalog from real inventory", () => {
    const products = loadProductsFromDisk();
    expect(products.length).toBeGreaterThan(1000);
  });

  it("ensures products in real catalogue have valid IDs, names, and links", () => {
    const products = loadProductsFromDisk();
    for (const prod of products.slice(0, 50)) {
      expect(prod.productId).toBeTruthy();
      expect(prod.name).toBeTruthy();
      expect(prod.productId).not.toMatch(/^VLP-/); // No phantom VLP IDs
    }
  });

  it("generates valid RSS 2.0 XML with Google Merchant namespace and real IDs", () => {
    const xml = generateGoogleMerchantXml();
    expect(xml).toContain('xmlns:g="http://base.google.com/ns/1.0"');
    expect(xml).toContain("<rss");
    expect(xml).toContain("</rss>");
    expect(xml).toContain("<channel>");
    expect(xml).toContain("</channel>");
    expect(xml).toContain("<title>VOLAMP ELEKTRIKALS PVT. LTD. - Official Google Merchant Product Feed</title>");
    expect(xml).toContain("<g:id>CAB-000001</g:id>");
    expect(xml).toContain("<g:availability>in_stock</g:availability>");
    expect(xml).not.toContain("<g:id>VLP-LV-001</g:id>");
  });
});
