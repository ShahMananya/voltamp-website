import fs from "fs";
import path from "path";
import type { Express, Request, Response } from "express";
import { loadProductsFromDisk } from "./services/productService";
import { BLOG_POSTS_DATA } from "../shared/blogData";

const BASE_URL = "https://www.volampelektrikals.com";

// Core static canonical pages for XML Sitemap
const STATIC_PAGES = [
  { path: "" },
  { path: "about-volamp" },
  { path: "where-volamp-contributed" },
  { path: "business-segments" },
  { path: "branch-locations" },
  { path: "products" },
  { path: "price-list" },
  { path: "certifications-and-awards" },
  { path: "calculator" },
  { path: "collaborate" },
  { path: "careers" },
  { path: "enquire" },
  { path: "in-the-news" },
  { path: "blog" },
  { path: "export" },
  { path: "dealers/polycab-ahmedabad" },
  { path: "dealers/finolex-cables-ahmedabad" },
  { path: "dealers/kei-cables-gujarat" },
  { path: "dealers/schneider-electric-ahmedabad" },
  { path: "locations/industrial-gidc-hubs" },
  { path: "shipping-policy" },
  { path: "terms-and-conditions" },
  { path: "privacy-policy" },
];

const BLOG_SLUGS = BLOG_POSTS_DATA.map((post) => post.slug);

// 8 Verified Active Master Categories
const CATEGORY_SLUGS = [
  "wire-cables",
  "switch-gears",
  "lugs",
  "conduit",
  "glands",
  "wiring-device",
  "earthing-material",
  "solar",
];

export function generateSitemapXml(): string {
  const lastModDate = "2026-11-12";

  const staticUrls = STATIC_PAGES.map(
    (page) => `  <url>
    <loc>${BASE_URL}/${page.path}</loc>
    <lastmod>${lastModDate}</lastmod>
  </url>`
  ).join("\n");

  const categoryUrls = CATEGORY_SLUGS.map(
    (slug) => `  <url>
    <loc>${BASE_URL}/category/${slug}</loc>
    <lastmod>${lastModDate}</lastmod>
  </url>`
  ).join("\n");

  const blogUrls = BLOG_SLUGS.map(
    (slug) => `  <url>
    <loc>${BASE_URL}/blog/${slug}</loc>
    <lastmod>${lastModDate}</lastmod>
  </url>`
  ).join("\n");

  const products = loadProductsFromDisk();
  const productUrls = products
    .filter((prod) => prod.productId && prod.name)
    .map((prod) => {
      const rawImg = prod.imageUrl || "";
      // Exclude Google Drive viewer links per Google Image Sitemap Guidelines
      const isValidImage = rawImg.startsWith("http") && !rawImg.includes("drive.google.com");
      const imgLink = isValidImage ? rawImg : (!rawImg.includes("drive.google.com") && rawImg ? `${BASE_URL}${rawImg}` : "");

      const rawLast = prod.lastUpdated as any;
      const prodLastMod = typeof rawLast === "string"
        ? rawLast.split("T")[0]
        : (rawLast instanceof Date ? rawLast.toISOString().split("T")[0] : lastModDate);

      return `  <url>
    <loc>${BASE_URL}/product/${encodeURIComponent(prod.productId)}</loc>
    <lastmod>${prodLastMod}</lastmod>${
        imgLink
          ? `
    <image:image>
      <image:loc>${imgLink}</image:loc>
      <image:title>${prod.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</image:title>
    </image:image>`
          : ""
      }
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls}
${categoryUrls}
${blogUrls}
${productUrls}
</urlset>`.trim();
}

export function generateRobotsTxt(): string {
  const disallows = `Disallow: /portal
Disallow: /employee-portal
Disallow: /employee-registration
Disallow: /employee/
Disallow: /ceo-authorize
Disallow: /ceo-authorization
Disallow: /ceo/
Disallow: /ceo-approval
Disallow: /cart
Disallow: /checkout
Disallow: /pay-invoice`;

  const groups = [
    "*",
    "Googlebot",
    "Googlebot-Image",
    "Storebot-Google",
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "PerplexityBot",
    "Google-Extended",
    "Amazonbot",
    "Meta-ExternalAgent",
    "Bytespider",
  ];

  const body = groups
    .map(
      (agent) => `User-agent: ${agent}
Allow: /
${disallows}`
    )
    .join("\n\n");

  return `${body}\n\nSitemap: ${BASE_URL}/sitemap.xml\n`.trim();
}

/**
 * /llms.txt — The standard AI & Answer Engine (AEO/GEO) manifest
 * Adheres strictly to the markdown link list specification (https://llmstxt.org).
 */
export function generateLlmsTxt(): string {
  return `# VOLAMP ELEKTRIKALS PRIVATE LIMITED
> B2B industrial electrical distribution platform in Ahmedabad, Gujarat, India, supplying certified power cables, switchgear, and earthing infrastructure nationwide across India.

Volamp Elektrikals Private Limited is an authorized distributor, channel partner, and stockist of genuine industrial cables and electrical equipment. Authorized channel partner and distributor for Polycab India, Finolex Cables, KEI Industries, Schneider Electric, L&T (Lauritz Knudsen), and Dowells. Family electrical business legacy since 1964; company incorporated in 2021 (CIN: U31900GJ2021PTC122730 | GSTIN: 24AAICV0754B1ZO | GeM Verified Reseller & Authorized Wholesale Distributor).

## Core Pages & Portals
- [Homepage](https://www.volampelektrikals.com): Corporate overview, brand portfolio, real-time cable estimator, and RFQ desk.
- [About VOLAMP](https://www.volampelektrikals.com/about-volamp): 4-generation lineage, engineering leadership by CEO Naimil Vipul Patel, and corporate governance.
- [Branch Locations & Warehouses](https://www.volampelektrikals.com/branch-locations): Corporate Sales Office (Khadia, Ahmedabad 380001) and Central Logistics Fulfillment Terminal (Aslali Highway, Ahmedabad 382427).
- [Products Catalog](https://www.volampelektrikals.com/products): 3,385+ verified active SKUs across power cables, switchgear, and earthing.
- [Manufacturer Price Lists](https://www.volampelektrikals.com/price-list): 2026 manufacturer price lists, contractor discount circulars, and CPRI test certificates.
- [Cable Sizing Calculator](https://www.volampelektrikals.com/calculator): Interactive engineering calculator for copper and aluminium cable voltage drop and current ratings.
- [Certifications & Compliance](https://www.volampelektrikals.com/certifications-and-awards): IS 7098 (Part 1 & 2), IS 1554, IS 694, and EN 50618 compliance reports.
- [Infrastructure Footprint](https://www.volampelektrikals.com/where-volamp-contributed): Regional and national electrical supply footprint across industrial manufacturing plants, commercial substations, and renewable corridors.
- [Project Sourcing & RFQ Desk](https://www.volampelektrikals.com/enquire): Direct BOM evaluation and project quotation by electrical engineers.
- [Customer Grievance Redressal Cell](https://www.volampelektrikals.com/complaints-cases): Official dispute, shortage, and escalation management portal.
- [Global Cable Export Desk](https://www.volampelektrikals.com/export): Direct export of IEC/BS certified power cables, solar DC cables, and switchgear via Mundra & Kandla deep-water ports.
- [Polycab Authorized Distributor Ahmedabad](https://www.volampelektrikals.com/dealers/polycab-ahmedabad): Authorized distributor and master stockist for Polycab LT/HT XLPE cables, solar DC wires, and flexible building wires in Ahmedabad & Gujarat.
- [Finolex Cables Authorized Channel Partner](https://www.volampelektrikals.com/dealers/finolex-cables-ahmedabad): Officially certified Authorized Channel Partner for Finolex pure electrolytic copper flexible wires and power cables.
- [KEI Cables Authorized Partner Gujarat](https://www.volampelektrikals.com/dealers/kei-cables-gujarat): Authorized industrial partner and star dealer for KEI heavy HT power cables, rubber trailing cables, and EHV transmission lines.
- [Schneider Electric Authorized Distributor](https://www.volampelektrikals.com/dealers/schneider-electric-ahmedabad): Authorized distributor of Acti9 MCBs, EasyPact MCCBs, and TeSys contactors in Ahmedabad.
- [Gujarat GIDC Industrial Supply](https://www.volampelektrikals.com/locations/industrial-gidc-hubs): Same-day 24h electrical delivery to Sanand, Vatva, Naroda, Changodar, Dahej, and Ankleshwar GIDC estates.

## Product Categories & Standards
- [Wires & Cables](https://www.volampelektrikals.com/category/wire-cables): LT/HT XLPE armoured power cables, control cables, and flexible copper wires (IS 7098 Part 1/2, IS 1554, IS 694).
- [Switchgear & Power Distribution](https://www.volampelektrikals.com/category/switch-gears): Air circuit breakers (ACB), MCCBs, MCBs, DBs, and contactors from Schneider Electric and L&T / Lauritz Knudsen.
- [Earthing & Lightning Protection](https://www.volampelektrikals.com/category/earthing-material): Copper-bonded rods (UL/CPRI certified), pure copper plates, chemical earthing compounds (BFC), and GI strips.
- [Solar & Renewable Cables](https://www.volampelektrikals.com/category/solar): 1500V DC solar PV cables (EN 50618 / IEC 62930), MC4 connectors, and solar array junction boxes.
- [Cable Lugs & Terminals](https://www.volampelektrikals.com/category/lugs): Dowells heavy-duty tinned copper crimping lugs and terminal ends.
- [Cable Glands & Conduits](https://www.volampelektrikals.com/category/conduit): Brass single and double compression cable glands and termination kits.

## Brand Portfolio & Core Lines
- [Polycab India](https://www.volampelektrikals.com/products?brand=Polycab): Authorized channel partner for industrial LT/HT power cables, solar DC cables, and FRLS wires.
- [Finolex Cables](https://www.volampelektrikals.com/products?brand=Finolex): Authorized channel partner for electrolytic copper building wires and industrial flexible cables.
- [KEI Industries](https://www.volampelektrikals.com/products?brand=KEI): Authorized partner and star dealer for heavy industrial power cables, rubber trailing cables, and HT distribution.
- [Schneider Electric](https://www.volampelektrikals.com/products?brand=Schneider): Authorized distributor for Acti9, EasyPact MCCBs, contactors, and industrial protection switchgear.
- [L&T / Lauritz Knudsen](https://www.volampelektrikals.com/products?brand=L%26T): Authorized distribution partner for dsine MCCBs, motor starters, and power distribution boards.
- [Dowells](https://www.volampelektrikals.com/products?brand=Dowells): Authorized channel partner for heavy-duty copper terminal lugs and crimping accessories.
- [Legrand](https://www.volampelektrikals.com/products?brand=Legrand): Protection switchgear and distribution enclosures.

## Operational Specifications & Verifiable Entity Data
- Legal Entity: VOLAMP ELEKTRIKALS PRIVATE LIMITED
- Incorporation Date: 2021-04-26 (Family business legacy in electrical supply since 1964)
- Corporate Identification Number (CIN): U31900GJ2021PTC122730
- GSTIN: 24AAICV0754B1ZO
- GeM Registration: Government e-Marketplace Verified Reseller & Wholesale Distributor
- Corporate Head Office: 1753, Dhobi's Pole Sir, Chinubhai Rd, Old City, Khadia, Ahmedabad, Gujarat 380001
- Central Logistics Stockyard: Aslali Highway Terminal, Ahmedabad, Gujarat 382427
- Dispatch Timelines: Same-day to 24-hour dispatch across Gujarat GIDC zones; express dispatch nationwide across India.
- Quality Verification: Original manufacturer Material Test Certificates (MTC) and routine factory test reports supplied upon request with order consignments.
- Official Communications: Phone/WhatsApp: +91 9512365582 | Inquiries: sales@volampelektrikals.com | Grievances: Grievances@volampelektrikals.com
- Social Profiles: LinkedIn: https://www.linkedin.com/company/volampelektrikals/ | YouTube: https://www.youtube.com/@cablezone | X: https://x.com/volampelektrik | Instagram: https://www.instagram.com/volampp | Facebook: https://www.facebook.com/profile.php?id=61587485305483 | Pinterest: https://www.pinterest.com/volampelektrikals/
`.trim();
}

export function generateLlmsFullTxt(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), 'dist/public/llms-full.txt'),
    path.resolve(process.cwd(), 'client/public/llms-full.txt'),
    path.resolve(import.meta.dirname, '../../client/public/llms-full.txt'),
    path.resolve(import.meta.dirname, '../client/public/llms-full.txt'),
  ];
  for (const p of possiblePaths) {
    try {
      if (fs.existsSync(p)) {
        return fs.readFileSync(p, 'utf-8');
      }
    } catch {}
  }
  return "# VOLAMP ELEKTRIKALS PRIVATE LIMITED\nOfficial AI Knowledge Manifest";
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
  app.get(["/llms.txt", "/.well-known/llms.txt"], (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(generateLlmsTxt());
  });

  app.get("/llms-full.txt", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(generateLlmsFullTxt());
  });
}

