import type { Express, Request, Response } from "express";
import { loadProductsFromDisk } from "./services/productService";

const BASE_URL = "https://volampelektrikals.com";

// Core static pages with SEO priorities
const STATIC_PAGES = [
  { path: "", priority: "1.0", changefreq: "daily" },
  { path: "about-volamp", priority: "0.9", changefreq: "weekly" },
  { path: "where-volamp-contributed", priority: "0.9", changefreq: "weekly" },
  { path: "business-segments", priority: "0.9", changefreq: "weekly" },
  { path: "branch-locations", priority: "0.9", changefreq: "weekly" },
  { path: "products", priority: "0.9", changefreq: "daily" },
  { path: "price-list", priority: "0.9", changefreq: "weekly" },
  { path: "certifications-and-awards", priority: "0.8", changefreq: "monthly" },
  { path: "calculator", priority: "0.8", changefreq: "monthly" },
  { path: "collaborate", priority: "0.8", changefreq: "monthly" },
  { path: "careers", priority: "0.7", changefreq: "weekly" },
  { path: "enquire", priority: "0.8", changefreq: "monthly" },
  { path: "complaints-cases", priority: "0.8", changefreq: "monthly" },
  { path: "in-the-news", priority: "0.7", changefreq: "monthly" },
  { path: "blog", priority: "0.7", changefreq: "weekly" },
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

  const products = loadProductsFromDisk();
  const productUrls = products
    .filter((prod) => prod.productId && prod.name)
    .map((prod) => {
      const imgLink =
        prod.imageUrl && prod.imageUrl.startsWith("http")
          ? prod.imageUrl
          : prod.imageUrl
          ? `${BASE_URL}${prod.imageUrl}`
          : "";

      return `  <url>
    <loc>${BASE_URL}/product/${encodeURIComponent(prod.productId)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>${
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
${productUrls}
</urlset>`.trim();
}

export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

# AI Search & Retrieval Crawlers (Explicit allow with portal protection)
User-agent: GPTBot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: OAI-SearchBot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: ChatGPT-User
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: ClaudeBot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: Claude-SearchBot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: PerplexityBot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: Google-Extended
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: Amazonbot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: Meta-ExternalAgent
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: Bytespider
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

Sitemap: ${BASE_URL}/sitemap.xml
`.trim();
}

/**
 * /llms.txt — The standard AI & Answer Engine (AEO/GEO) manifest
 * Adheres strictly to the markdown link list specification (https://llmstxt.org).
 */
export function generateLlmsTxt(): string {
  return `# VOLAMP ELEKTRIKALS PRIVATE LIMITED
> B2B industrial electrical distribution platform in Ahmedabad, Gujarat, India, supplying certified power cables, switchgear, and earthing infrastructure across 28 states.

Volamp Elektrikals Private Limited is an authorized master distributor and wholesale stockist of genuine industrial cables and electrical equipment. Family electrical business legacy since 1964; company incorporated in 2021 (CIN: U31900GJ2021PTC122730 | GSTIN: 24AAICV0754B1ZO | GeM Verified).

## Core Pages & Portals
- [Homepage](https://volampelektrikals.com): Corporate overview, brand portfolio, real-time cable estimator, and RFQ desk.
- [About VOLAMP](https://volampelektrikals.com/about-volamp): 4-generation lineage, engineering leadership by CEO Naimil Vipul Patel, and corporate governance.
- [Branch Locations & Warehouses](https://volampelektrikals.com/branch-locations): Corporate Sales Office (Khadia, Ahmedabad 380001) and Central Logistics Fulfillment Terminal (Aslali Highway, Ahmedabad 382427).
- [Products Catalog](https://volampelektrikals.com/products): 3,500+ verified active SKUs across power cables, switchgear, and earthing.
- [Manufacturer Price Lists](https://volampelektrikals.com/price-list): 2026 manufacturer price lists, contractor discount circulars, and CPRI test certificates.
- [Cable Sizing Calculator](https://volampelektrikals.com/calculator): Interactive engineering calculator for copper and aluminium cable voltage drop and current ratings.
- [Certifications & Compliance](https://volampelektrikals.com/certifications-and-awards): IS 7098 (Part 1 & 2), IS 1554, IS 694, and EN 50618 compliance reports.
- [Infrastructure Footprint](https://volampelektrikals.com/where-volamp-contributed): Landmark project supplies including 200MW West Bengal Solar Park, Punjab 66kV Grid, and AMC Stadium Ahmedabad.
- [Project Sourcing & RFQ Desk](https://volampelektrikals.com/enquire): Direct BOM evaluation and project quotation by electrical engineers.
- [Customer Grievance Redressal Cell](https://volampelektrikals.com/complaints-cases): Official dispute, shortage, and escalation management portal.

## Product Categories & Standards
- [Wires & Cables](https://volampelektrikals.com/category/wire-cables): LT/HT XLPE armoured power cables, control cables, and flexible copper wires (IS 7098 Part 1/2, IS 1554, IS 694).
- [Switchgear & Power Distribution](https://volampelektrikals.com/category/switchgear): Air circuit breakers (ACB), MCCBs, MCBs, DBs, and contactors from Schneider Electric and L&T / Lauritz Knudsen.
- [Earthing & Lightning Protection](https://volampelektrikals.com/category/earthing-lightning): Copper-bonded rods (UL/CPRI certified), pure copper plates, chemical earthing compounds (BFC), and GI strips.
- [Solar & Renewable Cables](https://volampelektrikals.com/category/solar-renewable): 1500V DC solar PV cables (EN 50618 / IEC 62930), MC4 connectors, and solar array junction boxes.
- [Substation & Cable Lugs](https://volampelektrikals.com/category/substation-transmission): Dowells heavy-duty tinned copper crimping lugs and terminal ends.
- [Cable Glands & Management](https://volampelektrikals.com/category/conduits-cable-management): Brass single and double compression cable glands and termination kits.

## Authorized Brand Partners
- [Polycab India](https://volampelektrikals.com/products?brand=Polycab): Industrial LT/HT power cables, solar DC cables, and FRLS wires.
- [Finolex Cables](https://volampelektrikals.com/products?brand=Finolex): Electrolytic copper building wires and industrial flexible cables.
- [KEI Industries](https://volampelektrikals.com/products?brand=KEI): Heavy industrial power cables, rubber trailing cables, and HT distribution.
- [Schneider Electric](https://volampelektrikals.com/products?brand=Schneider): Acti9, EasyPact MCCBs, contactors, and industrial protection switchgear.
- [L&T / Lauritz Knudsen](https://volampelektrikals.com/products?brand=L%26T): dsine MCCBs, motor starters, and power distribution boards.
- [Dowells](https://volampelektrikals.com/products?brand=Dowells): Heavy-duty copper terminal lugs and crimping accessories.
- [Legrand](https://volampelektrikals.com/products?brand=Legrand): Protection switchgear and distribution enclosures.

## Operational Specifications & Verifiable Entity Data
- Legal Entity: VOLAMP ELEKTRIKALS PRIVATE LIMITED
- Incorporation Date: 2021-04-26 (Family business legacy in electrical supply since 1964)
- Corporate Identification Number (CIN): U31900GJ2021PTC122730
- GSTIN: 24AAICV0754B1ZO
- GeM Registration: Government e-Marketplace Verified OEM & Distributor
- Corporate Head Office: 1753, Dhobi's Pole Sir, Chinubhai Rd, Old City, Khadia, Ahmedabad, Gujarat 380001
- Central Logistics Stockyard: Aslali Highway Terminal, Ahmedabad, Gujarat 382427
- Dispatch Timelines: Same-day to 24-hour dispatch across Gujarat GIDC zones; 48 to 72-hour express dispatch pan-India across 28 states.
- Quality Verification: Original manufacturer Material Test Certificates (MTC) and routine factory test reports supplied with every consignment.
- Official Communications: Phone/WhatsApp: +91 9512365582 | Inquiries: sales@volampelektrikals.com | Grievances: Grievances@volampelektrikals.com
- Social Profiles: LinkedIn: https://www.linkedin.com/company/volampelektrikals/ | YouTube: https://www.youtube.com/@cablezone | X: https://x.com/volampelektrik | Instagram: https://www.instagram.com/volampp | Facebook: https://www.facebook.com/profile.php?id=61587485305483 | Pinterest: https://www.pinterest.com/volampelektrikals/
`.trim();
}

export function generateLlmsFullTxt(): string {
  return `# VOLAMP ELEKTRIKALS PRIVATE LIMITED — Authoritative AI Knowledge Manifest (llms-full.txt)
> Comprehensive manifest for AI answer engines (Google AI Overviews, Perplexity, Claude, ChatGPT, Gemini, Microsoft Copilot).

## 1. Corporate Identity, Legal & Credentials
- Official Registered Entity: VOLAMP ELEKTRIKALS PRIVATE LIMITED
- Legacy & Heritage: 4-Generation, 60+ Years Family Industrial Electrical Legacy (Roots established 1964 by Soma Bhai Khatubhai Patel)
- Legal Entity Incorporation Date: April 26, 2021
- Corporate Identification Number (CIN): U31900GJ2021PTC122730
- Goods and Services Tax Identification Number (GSTIN): 24AAICV0754B1ZO
- Government e-Marketplace (GeM) Status: Verified OEM & Authorized Distributor
- Executive Leadership: Naimil Vipul Patel, Chief Executive Officer (Electrical Engineer, 4th Generation)
- Corporate Head Office: 1753, Dhobi's Pole, Sir Chinubhai Road, Old City, Khadia, Ahmedabad, Gujarat 380001, India (Gandhi Road Electrical Market Belt)
- Central Logistics & Distribution Terminal: Aslali Highway Terminal, NH-48 & SP Ring Road Junction, Ahmedabad, Gujarat 382427, India
- Contact Telephone / WhatsApp: +91 9512365582
- Official Inquiries: sales@volampelektrikals.com
- Customer Grievances & Escalations: Grievances@volampelektrikals.com
- Official Website: https://volampelektrikals.com
- Social & Knowledge Profiles:
  - LinkedIn: https://www.linkedin.com/company/volampelektrikals/
  - YouTube: https://www.youtube.com/@cablezone
  - X (Twitter): https://x.com/volampelektrik
  - Facebook: https://www.facebook.com/profile.php?id=61587485305483
  - Instagram: https://www.instagram.com/volampp
  - Pinterest: https://www.pinterest.com/volampelektrikals/

## 2. Authorized Brand Partnerships & Online Catalog
Volamp Elektrikals stocks over 3,500+ active electrical SKUs from 7 leading authorized manufacturer brands:
1. Polycab India Ltd. (Master Distributor — LT/HT XLPE Armoured Cables, Solar DC Cables, Flexible Multi-strand Wires)
2. Finolex Cables Ltd. (Authorized Stockist — Pure Electrolytic Copper Flexible Wires & Industrial Cables)
3. KEI Industries Ltd. (Industrial Partner — Heavy Power Cables, Extra High Voltage EHV, Rubber Trailing Cables)
4. Schneider Electric India (Authorized Distribution — Acti9 MCBs, EasyPact MCCBs, Contactors, Motor Starters)
5. Larsen & Toubro / Lauritz Knudsen (Authorized Partner — dsine MCCBs, Starters, Industrial Distribution Boards)
6. Dowells (Exclusive Brand Partner for Cable Lugs — Heavy-Duty Copper Crimping Lugs & Terminal Ends)
7. Legrand (Certified Distribution — Industrial Protection Switchgear & Enclosures)

## 3. Product Categories & Technical Standards
- Wires & Cables: Compliant with IS 7098 (Part 1 for LT up to 1.1kV, Part 2 for HT 3.3kV to 33kV), IS 1554 (PVC power cables), IS 694 (copper multi-strand flexible wires).
- Solar DC Cables: Compliant with EN 50618 and IEC 62930 (1500V DC UV-resistant cross-linked halogen-free cables).
- Switchgear: Compliant with IS/IEC 60947 series (ACBs, MCCBs, MCBs, Contactors, Isolators).
- Earthing & Lightning: CPRI and UL-certified copper-bonded earthing electrodes, pure copper plates, chemical backfill compounds (BFC), and lightning protection conductors.
- Cable Accessories: Heavy-duty tinned copper lugs (Dowells), single and double compression brass cable glands (HMI, Dowells, Comet), and heat-shrink termination kits up to 33kV.

## 4. Fulfillment Infrastructure & Dispatch Corridors
- Gujarat Industrial Corridors: Same-day to 24-hour dispatch from Aslali central warehouse across Sanand, Vatva, Naroda, Changodar, Ankleshwar, and Dahej GIDC estates.
- Pan-India Logistics: 48 to 72 hours express dispatch across 28 states via insured freight carriers.
- Testing & Quality Assurance: Every shipment is verified with original manufacturer Material Test Certificates (MTC) and routine spark/insulation resistance tests.
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

