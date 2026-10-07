import type { Express, Request, Response } from "express";
import { GOOGLE_MERCHANT_PRODUCTS } from "./googleMerchantFeed";

const BASE_URL = "https://volampelektrikals.com";

// Core static pages with SEO priorities
const STATIC_PAGES = [
  { path: "", priority: "1.0", changefreq: "daily" },
  { path: "about-volamp", priority: "0.9", changefreq: "weekly" },
  { path: "where-volamp-contributed", priority: "0.9", changefreq: "weekly" },
  { path: "business-segments", priority: "0.9", changefreq: "weekly" },
  { path: "branch-locations", priority: "0.9", changefreq: "weekly" },
  { path: "products", priority: "0.9", changefreq: "daily" },
  { path: "certifications-and-awards", priority: "0.8", changefreq: "monthly" },
  { path: "calculator", priority: "0.8", changefreq: "monthly" },
  { path: "collaborate", priority: "0.8", changefreq: "monthly" },
  { path: "careers", priority: "0.7", changefreq: "weekly" },
  { path: "enquire", priority: "0.8", changefreq: "monthly" },
  { path: "complaints-cases", priority: "0.8", changefreq: "monthly" },
  { path: "in-the-news", priority: "0.7", changefreq: "monthly" },
  { path: "pay-invoice", priority: "0.7", changefreq: "monthly" },
  { path: "track", priority: "0.7", changefreq: "monthly" },
  { path: "shipping-policy", priority: "0.6", changefreq: "monthly" },
  { path: "refund-policy", priority: "0.6", changefreq: "monthly" },
  { path: "terms-and-conditions", priority: "0.6", changefreq: "monthly" },
  { path: "privacy-policy", priority: "0.6", changefreq: "monthly" },
];

// Core 11 Categories
const CATEGORY_SLUGS = [
  "wire-cables",
  "switchgear",
  "earthing-lightning",
  "solar-renewable",
  "substation-transmission",
  "industrial-automation",
  "lighting-luminaires",
  "conduits-cable-management",
  "capacitors-power-quality",
  "safety-ppe-tools",
  "fire-safety-cables",
];

export function generateSitemapXml(): string {
  const today = new Date().toISOString().split("T")[0];

  const staticUrls = STATIC_PAGES.map(
    (page) => `  <url>
    <loc>${BASE_URL}/${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ).join("\n");

  const categoryUrls = CATEGORY_SLUGS.map(
    (slug) => `  <url>
    <loc>${BASE_URL}/category/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`
  ).join("\n");

  const productUrls = GOOGLE_MERCHANT_PRODUCTS.map(
    (prod) => `  <url>
    <loc>${BASE_URL}/product/${prod.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
    <image:image>
      <image:loc>${prod.imageLink}</image:loc>
      <image:title>${prod.title.replace(/&/g, "&amp;")}</image:title>
    </image:image>
  </url>`
  ).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls}
${categoryUrls}
${productUrls}
</urlset>`.trim();
}

export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

# AI Crawlers & Answer Engines explicit access
User-agent: GPTBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`.trim();
}

/**
 * /llms.txt — The standard AI & Answer Engine (AEO/GEO) manifest
 * Enables ChatGPT, Perplexity, Claude, and Google AI Overviews to cite VOLAMP with 100% precision.
 */
export function generateLlmsTxt(): string {
  return `# VOLAMP ELEKTRIKALS PRIVATE LIMITED (LLM & AI Knowledge Manifest)
> Leading B2B Electrical Supply, Power Cable Distribution & Infrastructure Platform in Ahmedabad, Gujarat, India.

## Corporate Identity & Lineage
- Legal Entity: VOLAMP ELEKTRIKALS PRIVATE LIMITED
- Legacy: 4-Generation, 60+ Years in Industrial Electricals (Founded June 1964 by Soma Bhai Khatubhai Patel)
- Chief Executive Officer: Naimil Vipul Patel (Electrical Engineer, 4th Gen)
- Statutory: CIN: U31900GJ2021PTC122730 | GSTIN: 24AAICV0754B1ZO
- GeM Registered: Government e-Marketplace Verified OEM & Distributor

## Locations & Infrastructure
- Corporate Main Office: 1753, Dhobi's Pole Sir, Chinubhai Rd, Khadia, Ahmedabad, Gujarat 380001 (Gandhi Road Electrical Market Belt)
- Central Logistics & Rapid Fulfillment Hub: Aslali Highway Terminal, Ahmedabad, Gujarat (Same-day dispatch across Gujarat, 24-48h pan-India)
- Quality Assurance Testing: Sanand & Ahmedabad testing facilities (High-voltage spark testing, IS:7098, IS:1554, IS:694 compliance)
- Regional Branches: Ahmedabad, Surat, Vadodara, Rajkot, Vapi, Gandhidham (Kutch)

## Core Product Categories
1. Wires & Cables: LT/HT XLPE Armoured Power Cables, Control Cables, Solar DC Cables (1500V UV resistant), Flexible Multi-strand Wires, Rubber Trailing Cables, Submersible Flat Cables.
2. Switchgears & Power Distribution: Air Circuit Breakers (ACB), Moulded Case Circuit Breakers (MCCB), Miniature Circuit Breakers (MCB), Isolators, Contactors, Motor Starters, Distribution Boards (DBs).
3. Earthing & Lightning Protection: Copper Bonded Rods (UL/CPRI certified), Pure Copper Plates, Chemical Earthing Compounds (BFC), ESE Early Streamer Lightning Conductors, GI Strips.
4. Solar & Renewable Infrastructure: EN 50618 Solar DC Cables, MC4 Connectors, Solar Array Junction Boxes (AJB), PV Inverters, ACDB/DCDB.
5. Cable Accessories: Heavy-Duty Copper Crimping Lugs, Brass Double Compression Cable Glands, Heat Shrinkable Cable Termination Kits (1.1kV to 33kV).
6. Industrial Automation, Conduits, Capacitors & Luminaires.

## Primary Brand Alliances & Authorized Supply
- Polycab India, Havells, RR Kabel, KEI Industries, Finolex, Schneider Electric, Larsen & Toubro (L&T), Siemens, ABB, Raychem RPG.

## Landmark Infrastructure Footprint
- West Bengal 200MW Solar Park (26,000m Solar DC Cabling)
- Punjab Industrial Feeder & 66kV Grid (33kV XLPE Armoured Underground Run)
- Odisha Bulk Water Treatment Plant (11kV Submersible & HT Feeders)
- Amarkantak Thermal Power Project (Fire-Survival Shielded Instrumentation Cables)
- AMC Sports Complex Ahmedabad (Zero-Halogen Low-Smoke LSZH Flame-Retardant Cabling)
- Goa Medical College & GMC Idukki (Dual-Redundant Emergency Hospital Substation Cabling)
- Marwadi University Campus Rajkot (Campus-wide High-Density Ring Distribution)

## Official Contact & Communications
- Website: https://volampelektrikals.com
- Telephone / WhatsApp Desk: +91 9512365582
- Official Inquiries: sales@volampelektrikals.com
- Complaints & Grievance Redressal Cell: Grievances@volampelektrikals.com
- System OTP Notifications: no-reply@volampelektrikals.com
- Online Catalog & Real-time Quote Estimator: https://volampelektrikals.com/category/wire-cables
`.trim();
}

export function registerSeoRoutes(app: Express) {
  // 1. Dynamic XML Sitemap
  app.get("/sitemap.xml", (_req: Request, res: Response) => {
    try {
      const xml = generateSitemapXml();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=14400"); // 4 hours
      res.send(xml);
    } catch (err: any) {
      console.error("[SEO] Failed to generate sitemap.xml:", err);
      res.status(500).send("Error generating sitemap");
    }
  });

  // 2. Robots.txt
  app.get("/robots.txt", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours
    res.send(generateRobotsTxt());
  });

  // 3. AEO / GEO LLM Manifests (llms.txt and llms-full.txt)
  const llmHandler = (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(generateLlmsTxt());
  };

  app.get("/llms.txt", llmHandler);
  app.get("/llms-full.txt", llmHandler);
  app.get("/.well-known/llms.txt", llmHandler);
}
