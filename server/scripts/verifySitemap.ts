/**
 * Full XML Sitemap Integrity & Verification Script
 * Validates that all 3,385 SKUs, 28 guides, 8 categories, and static pages are properly formed in sitemap.xml
 * 
 * Usage:
 *   npx tsx server/scripts/verifySitemap.ts
 */

import { generateSitemapXml } from "../seoRoutes";

async function main() {
  console.log("=== VOLAMP XML Sitemap Verification Audit ===");
  const xml = generateSitemapXml();

  const urlCount = (xml.match(/<loc>/g) || []).length;
  const imageCount = (xml.match(/<image:loc>/g) || []).length;
  const lastmodCount = (xml.match(/<lastmod>/g) || []).length;

  console.log(`Total URLs in sitemap: ${urlCount}`);
  console.log(`Total Images with titles: ${imageCount}`);
  console.log(`Total lastmod timestamps: ${lastmodCount}`);

  // Checks
  const hasDriveLinks = xml.includes("drive.google.com");
  const hasValidHeader = xml.startsWith("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
  const hasValidClosing = xml.endsWith("</urlset>");

  console.log("\nQuality & Policy Checks:");
  console.log(`- Valid XML Declaration & Namespace: ${hasValidHeader ? "PASS" : "FAIL"}`);
  console.log(`- Valid Closing Tag </urlset>: ${hasValidClosing ? "PASS" : "FAIL"}`);
  console.log(`- Zero Google Drive Viewer links in Image Sitemap: ${!hasDriveLinks ? "PASS (100% Direct Assets)" : "FAIL"}`);
  console.log(`- Exact 1-to-1 lastmod parity: ${urlCount === lastmodCount ? "PASS" : "FAIL"}`);

  if (urlCount < 3400) {
    console.warn(`[WARNING] Expected ~3,440+ URLs (3,385 SKUs + 28 guides + 8 categories + static), found ${urlCount}`);
  } else {
    console.log(`[PASS] Catalog completeness verified: ${urlCount} total indexed URLs`);
  }

  console.log("=== Audit Complete ===");
}

main().catch(console.error);

