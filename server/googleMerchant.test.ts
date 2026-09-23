import { describe, expect, it } from "vitest";
import { generateGoogleMerchantXml, GOOGLE_MERCHANT_PRODUCTS } from "./googleMerchantFeed";

describe("Google Merchant Center Integration", () => {
  it("has a non-empty product catalog for Google Merchant Center", () => {
    expect(GOOGLE_MERCHANT_PRODUCTS.length).toBeGreaterThan(10);
  });

  it("ensures all products have required Google Merchant fields", () => {
    for (const prod of GOOGLE_MERCHANT_PRODUCTS) {
      expect(prod.id).toBeTruthy();
      expect(prod.title).toBeTruthy();
      expect(prod.description).toBeTruthy();
      expect(prod.link).toMatch(/^https:\/\/volampelektrikals\.com\//);
      expect(prod.imageLink).toBeTruthy();
      expect(prod.price).toMatch(/\d+(\.\d{2})?\sINR/);
      expect(prod.availability).toBe("in_stock");
      expect(prod.condition).toBe("new");
      expect(prod.brand).toBe("VOLAMP ELEKTRIKALS");
      expect(prod.googleProductCategory).toBeTruthy();
      expect(prod.mpn).toBeTruthy();
    }
  });

  it("generates valid RSS 2.0 XML with Google Merchant namespace", () => {
    const xml = generateGoogleMerchantXml();
    expect(xml).toContain('xmlns:g="http://base.google.com/ns/1.0"');
    expect(xml).toContain("<rss");
    expect(xml).toContain("</rss>");
    expect(xml).toContain("<channel>");
    expect(xml).toContain("</channel>");
    expect(xml).toContain("<title>VOLAMP ELEKTRIKALS PVT. LTD. - Google Merchant Product Feed</title>");
    expect(xml).toContain("<g:id>VLP-LV-001</g:id>");
    expect(xml).toContain("<g:price>118.00 INR</g:price>");
    expect(xml).toContain("<g:availability>in_stock</g:availability>");
    expect(xml).toContain("<g:brand>VOLAMP ELEKTRIKALS</g:brand>");
  });
});
