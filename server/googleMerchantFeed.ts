import type { Express, Request, Response } from "express";
import { loadProductsFromDisk } from "./services/productService";

const BASE_URL = "https://volampelektrikals.com";

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateGoogleMerchantXml(): string {
  const products = loadProductsFromDisk();
  // Filter valid products from real catalogue
  const validProducts = products.filter((p) => p.productId && p.name);

  const itemsXml = validProducts
    .map((prod) => {
      const rawPrice =
        prod.numericPrice ||
        (typeof prod.price === "string" ? parseFloat(prod.price.replace(/[^0-9.]/g, "")) : 0) ||
        100;
      const priceFormatted = `${rawPrice.toFixed(2)} INR`;
      const productLink = `${BASE_URL}/product/${encodeURIComponent(prod.productId)}`;
      const imageLink =
        prod.imageUrl && prod.imageUrl.startsWith("http")
          ? prod.imageUrl
          : prod.imageUrl
          ? `${BASE_URL}${prod.imageUrl}`
          : `${BASE_URL}/products/default.jpg`;
      const brand = prod.brand || "Polycab";
      const category = prod.category || "Wires & Cables";

      return `    <item>
      <g:id>${escapeXml(prod.productId)}</g:id>
      <g:title>${escapeXml(prod.name)}</g:title>
      <g:description>${escapeXml(
        prod.description ||
          `${prod.name} - genuine certified industrial electrical supply with manufacturer test certificate (MTC) from Volamp Elektrikals.`
      )}</g:description>
      <g:link>${escapeXml(productLink)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${prod.availability === "OUT OF STOCK" ? "out_of_stock" : "in_stock"}</g:availability>
      <g:price>${escapeXml(priceFormatted)}</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:google_product_category>Hardware &gt; Electrical Supplies &gt; Wire &amp; Cable</g:google_product_category>
      <g:product_type>${escapeXml(category)}</g:product_type>
      <g:mpn>${escapeXml(prod.sku || prod.productId)}</g:mpn>
      <g:identifier_exists>yes</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Insured Project Freight</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>VOLAMP ELEKTRIKALS PVT. LTD. - Official Google Merchant Product Feed</title>
    <link>${BASE_URL}/</link>
    <description>Official verified product catalog for Google Merchant Center and Google Shopping. Genuine industrial power cables, switchgear, and earthing supplies from Ahmedabad, Gujarat.</description>
${itemsXml}
  </channel>
</rss>`;
}

export function registerGoogleMerchantRoutes(app: Express) {
  // Google Merchant Center XML Product Feed (Official RSS 2.0 with g: namespace)
  const feedHandler = (_req: Request, res: Response) => {
    try {
      const xml = generateGoogleMerchantXml();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=14400"); // 4 hours
      res.send(xml);
    } catch (err: any) {
      console.error("Failed to generate Google Merchant XML feed:", err);
      res.status(500).send("Error generating Google Merchant feed");
    }
  };

  app.get("/api/google-merchant-feed.xml", feedHandler);
  app.get("/feed/google-shopping.xml", feedHandler);
  app.get("/google-merchant-feed.xml", feedHandler);

  // Status & JSON endpoint for diagnostics
  app.get("/api/google-merchant/status", (_req: Request, res: Response) => {
    const products = loadProductsFromDisk();
    res.json({
      status: "active",
      storeName: "VOLAMP ELEKTRIKALS PVT. LTD.",
      domain: BASE_URL,
      feedUrls: {
        apiFeed: `${BASE_URL}/api/google-merchant-feed.xml`,
        rootFeed: `${BASE_URL}/google-merchant-feed.xml`,
      },
      itemCount: products.length,
      merchantCenterUrl: "https://merchants.google.com/",
    });
  });
}
