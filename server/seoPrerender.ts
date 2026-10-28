import type { Express, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadProductsFromDisk, getProductByProductId } from "./services/productService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://volampelektrikals.com";

// Known static routes
const STATIC_ROUTES: Record<
  string,
  { title: string; description: string; h1: string; intro: string }
> = {
  "": {
    title: "Industrial Cable & Electrical Distributor | Volamp",
    description:
      "Authorized wholesale distributor of Polycab, Finolex, KEI cables and Schneider, L&T switchgear in Ahmedabad, Gujarat. 3,385+ SKUs with test certificates.",
    h1: "Industrial Cable & Electrical Distributor in Ahmedabad",
    intro:
      "Volamp Elektrikals Private Limited is Gujarat's premier B2B master distributor and authorized wholesale stockist of industrial cables, HT/LT power cables, solar PV cables, switchgear, and earthing infrastructure. Backed by a 60+ year family legacy established in 1964 and modern corporate distribution hubs in Khadia and Aslali, Ahmedabad, we supply genuine certified electrical materials with original Manufacturer Test Certificates (MTC) to EPC contractors, government utilities, solar developers, and industrial manufacturing plants across 28 Indian states.",
  },
  "about-volamp": {
    title: "About Volamp Elektrikals | 60+ Years Electrical Legacy",
    description:
      "Learn about Volamp Elektrikals: 4 generations, 60+ years electrical legacy, leadership by CEO Naimil Vipul Patel, and industrial distribution across India.",
    h1: "About Volamp Elektrikals Private Limited",
    intro:
      "With roots dating back to 1964 established by Soma Bhai Khatubhai Patel in Ahmedabad's historical electrical market, Volamp Elektrikals has evolved over four generations into a trusted national distributor for mega infrastructure projects. Under the engineering leadership of CEO Naimil Vipul Patel, we combine deep technical specification expertise with state-of-the-art warehousing at Aslali Highway to deliver same-day dispatch and guaranteed test compliance.",
  },
  "where-volamp-contributed": {
    title: "Landmark Projects & Footprint | Volamp Elektrikals",
    description:
      "Explore major infrastructure projects powered by Volamp Elektrikals: 200MW West Bengal Solar Park, Punjab 66kV Grid, and AMC Stadium Ahmedabad.",
    h1: "Landmark Infrastructure Projects & National Footprint",
    intro:
      "From high-voltage utility substations to utility-scale renewable solar parks and municipal infrastructure, Volamp Elektrikals has supplied mission-critical electrical materials to over 140 landmark projects across India. Our project footprint includes the 200MW West Bengal Solar Park, 66kV transmission substations in Punjab, Ahmedabad Municipal Corporation sports complexes, and key GIDC industrial corridors.",
  },
  "business-segments": {
    title: "Industries & Business Segments Served | Volamp",
    description:
      "Electrical distribution solutions tailored for EPC contractors, solar power developers, industrial automation plants, and commercial infrastructure.",
    h1: "Business Segments & Industries Served",
    intro:
      "Volamp Elektrikals delivers end-to-end electrical procurement packages tailored to specific sector requirements: EPC infrastructure contractors requiring bulk HT armoured drum deliveries with CPRI type-test reports; solar developers needing 1500V DC UV-resistant PV cables; industrial manufacturing plants needing fast replacement switchgear; and commercial builders seeking IS:694 certified wiring.",
  },
  "branch-locations": {
    title: "Branch Locations & Central Warehouse | Volamp",
    description:
      "Visit Volamp Elektrikals offices in Khadia, Ahmedabad and our central logistics distribution warehouse on Aslali Highway. Pan-India dispatch corridors.",
    h1: "Branch Locations, Sales Desks & Distribution Terminals",
    intro:
      "Our operations are centered in Ahmedabad, Gujarat with strategic distribution access: Corporate Sales Office at 1753, Dhobi's Pole, Sir Chinubhai Road, Khadia, Ahmedabad 380001 (Gandhi Road Electrical Market Belt), and Central Logistics Fulfillment Terminal at Aslali Highway Terminal, NH-48 & SP Ring Road Junction, Ahmedabad 382427. Same-day dispatch to Vatva, Sanand, Naroda, and Changodar GIDC zones.",
  },
  "products": {
    title: "Industrial Electrical Products Catalog | Volamp",
    description:
      "Browse 3,385+ verified electrical products: LT/HT XLPE cables, solar DC wires, switchgear, MCBs, lugs, and earthing supplies. Instant BOM quotation.",
    h1: "Industrial Electrical & Power Cable Catalog",
    intro:
      "Explore over 3,385 active, genuine electrical SKUs from India's leading manufacturers: Polycab, Finolex, KEI Industries, Schneider Electric, L&T / Lauritz Knudsen, and Dowells. Every product is backed by full manufacturer warranties, IS/IEC standard compliance (IS 7098, IS 1554, IS 694, EN 50618, IEC 60947), and complete routine factory test reports delivered with every drum or carton.",
  },
  "price-list": {
    title: "Manufacturer Cable Price Lists 2026 | Volamp",
    description:
      "Download official 2026 manufacturer price lists and discount circulars for Polycab, Finolex, KEI cables and Schneider, L&T switchgear.",
    h1: "Official Manufacturer Price Lists & Circulars (2026)",
    intro:
      "Access the latest authorized 2026 price lists and project discount matrices for industrial cables and electrical equipment. We stock verified rate circulars from Polycab India, Finolex Cables, KEI Industries, Schneider Electric, and Dowells lugs, helping EPC contractors and estimators calculate accurate project bill-of-quantities (BOQ).",
  },
  "certifications-and-awards": {
    title: "Quality Certifications & IS Standards | Volamp",
    description:
      "View quality certifications and compliance standards for Volamp Elektrikals: IS 7098, IS 1554, IS 694, EN 50618, ISO 9001, and CPRI test reports.",
    h1: "Quality Certifications, Testing Standards & Compliance",
    intro:
      "Volamp Elektrikals maintains rigorous quality standards for all supplied materials. All LT and HT cables adhere strictly to Bureau of Indian Standards (BIS) specifications including IS 7098 (Part 1 & 2) for XLPE insulated cables, IS 1554 for PVC power cables, IS 694 for building wires, and EN 50618 / IEC 62930 for solar PV cables. Routine spark test, insulation resistance, and conductor resistance test certificates accompany all consignments.",
  },
  "calculator": {
    title: "Online Cable Sizing & Voltage Drop Calculator | Volamp",
    description:
      "Calculate cable size, current rating, and voltage drop for copper and aluminium cables. Compliant with IS 7098 and IEC standards.",
    h1: "Interactive Cable Sizing & Voltage Drop Calculator",
    intro:
      "Engineer your electrical runs with precision using Volamp's interactive cable sizing tool. Calculate required conductor cross-section (sqmm), current carrying capacity, and percentage voltage drop for 1-phase and 3-phase circuits across copper and aluminium conductors under standard ground and ambient temperature conditions according to IS 7098 derating factors.",
  },
  "collaborate": {
    title: "Partner & Collaborate With Volamp Elektrikals",
    description:
      "Partner with Volamp Elektrikals as an electrical contractor, institutional buyer, or vendor. Access volume pricing and priority project dispatch.",
    h1: "Contractor Partnerships & Institutional Supply Desk",
    intro:
      "Volamp Elektrikals partners with electrical contractors, project OEMs, panel builders, and corporate purchasing teams across India. Benefit from dedicated account managers, transparent wholesale pricing based on LME commodity indexing, structured credit terms for approved projects, and priority dispatch from our Aslali logistics terminal.",
  },
  "careers": {
    title: "Careers at Volamp Elektrikals | Join Our Team",
    description:
      "Explore career opportunities in electrical engineering, B2B sales, procurement, and logistics at Volamp Elektrikals in Ahmedabad, Gujarat.",
    h1: "Careers at Volamp Elektrikals Private Limited",
    intro:
      "Join a dynamic, fast-growing engineering distribution company that bridges traditional industrial excellence with modern digital supply chain technology. We are hiring electrical estimation engineers, B2B key account managers, logistics supervisors, and technical procurement specialists at our Ahmedabad facilities.",
  },
  "enquire": {
    title: "Request Quotation & Electrical RFQ Desk | Volamp",
    description:
      "Submit your project Bill of Materials (BOM) for competitive wholesale pricing on power cables, switchgear, and earthing supplies. 24h response.",
    h1: "Project Sourcing & Electrical BOM RFQ Desk",
    intro:
      "Submit your project requirements, single-line diagrams (SLD), or Bill of Quantities (BOQ) directly to Volamp Elektrikals' engineering estimation desk. Our team evaluates conductor specifications, derating criteria, and manufacturer delivery schedules to provide guaranteed competitive wholesale pricing within 24 hours.",
  },
  "in-the-news": {
    title: "News & Media Coverage | Volamp Elektrikals",
    description:
      "Latest industry news, market circulars, LME copper and aluminium commodity price updates, and company announcements from Volamp Elektrikals.",
    h1: "Company Announcements & Electrical Industry News",
    intro:
      "Stay informed with the latest updates from Volamp Elektrikals and the Indian electrical power infrastructure sector. Read our monthly analysis of London Metal Exchange (LME) copper and aluminium price movements, domestic tariff revisions, renewable energy tenders, and corporate milestones.",
  },
  "blog": {
    title: "Electrical Engineering Insights & Guides | Volamp",
    description:
      "Technical guides on cable sizing, IS 7098 standards, solar DC specifications, and LME copper trends by Volamp Elektrikals engineers.",
    h1: "Electrical Engineering Insights & Cable Selection Guides",
    intro:
      "Authoritative technical articles and practical engineering selection guides written by Volamp Elektrikals electrical engineers. Covering LT/HT power cable selection, copper versus aluminium economic trade-offs, solar DC cable sizing per IEC 62930, and switchgear protection coordination.",
  },
  "shipping-policy": {
    title: "Shipping & Project Logistics Policy | Volamp",
    description:
      "Review shipping, transit insurance, and delivery schedules for Volamp Elektrikals. Same-day Gujarat GIDC dispatch; pan-India freight.",
    h1: "Shipping, Freight & Project Delivery Policy",
    intro:
      "Volamp Elektrikals operates dedicated logistics operations to guarantee safe, on-schedule delivery of heavy industrial cable drums and switchgear consignments. Consignments are packed to export and CPWD transport standards with complete transit insurance coverage across 28 Indian states.",
  },
  "terms-and-conditions": {
    title: "Terms and Conditions of Supply | Volamp",
    description:
      "Terms of wholesale supply, quotation validity, inspection protocols, and payment policies for Volamp Elektrikals Private Limited.",
    h1: "Terms and Conditions of Commercial Supply",
    intro:
      "Commercial terms governing wholesale quotations, purchase orders, delivery terms, inspection protocols, and warranty claims between Volamp Elektrikals Private Limited and purchasers.",
  },
  "privacy-policy": {
    title: "Privacy Policy | Volamp Elektrikals Private Limited",
    description:
      "Privacy policy and data protection practices for Volamp Elektrikals Private Limited website, customer portal, and RFQ submissions.",
    h1: "Privacy & Data Protection Policy",
    intro:
      "Volamp Elektrikals Private Limited is committed to protecting the privacy, confidentiality, and security of all commercial, technical, and personal information shared across our web platform.",
  },
  "complaints-cases": {
    title: "Customer Redressal & Escalation Desk | Volamp",
    description:
      "Official customer grievance and dispute resolution portal for Volamp Elektrikals. Track resolution status and file shortage or defect reports.",
    h1: "Customer Grievance Redressal & Escalation Cell",
    intro:
      "Volamp Elektrikals maintains an ISO-aligned grievance resolution mechanism to address any shipment transit damage, quantity discrepancies, test certificate inquiries, or specification escalations with a guaranteed 48-hour investigation timeline.",
  },
  "export": {
    title: "Global Cable Export & International Supply Desk | Volamp",
    description:
      "Direct export of IEC & BS compliant power cables, solar DC cables, and switchgear from Mundra & Kandla ports. CIF & FOB terms for Middle East, Africa & Asia.",
    h1: "Global Cable Export & International Electrical Supply Desk",
    intro:
      "Volamp Elektrikals Private Limited is an international electrical procurement and export partner headquartered in Ahmedabad, Gujarat, India. Leveraging deep logistics proximity to India's premier western deep-water container ports (Mundra and Kandla, <350 km from our central Aslali stockyard), we supply certified HT/LT power cables, solar photovoltaic cables, switchgear, and earthing infrastructure to international EPC contractors, utility developers, and industrial projects across the Middle East, Africa, and Southeast Asia. All export drums comply with ISPM-15 phytosanitary heat-treatment standards, accompanied by SGS/Bureau Veritas pre-shipment inspection certificates and Letters of Credit (LC) facilitation.",
  },
  "dealers/polycab-ahmedabad": {
    title: "Polycab Dealer & Distributor Ahmedabad Gujarat | Volamp",
    description:
      "Authorized Polycab cables & wires distributor in Ahmedabad. LT/HT XLPE armoured power cables, solar DC cables, flexible wires with CPRI test reports.",
    h1: "Authorized Polycab Cable Dealer & Distributor in Ahmedabad, Gujarat",
    intro:
      "Volamp Elektrikals Private Limited is an authorized master distributor and wholesale stockist for Polycab India Ltd. in Ahmedabad, Gujarat. Operating from our central logistics fulfillment terminal on Aslali Highway and corporate sales office in Khadia, we maintain extensive ready inventory of Polycab 1.1kV LT XLPE aluminium and copper armoured cables (IS 7098 Part 1), 11kV to 33kV HT XLPE power cables (IS 7098 Part 2), 1500V DC solar PV cables (EN 50618), Green Wire FRLS building wires, and multi-core flexible control cables. Every reel and coil is guaranteed 100% original, backed by original manufacturer Material Test Certificates (MTC) and CPRI type-test reports.",
  },
  "dealers/finolex-cables-ahmedabad": {
    title: "Finolex Cables Dealer & Wholesale Stockist Ahmedabad | Volamp",
    description:
      "Authorized Finolex cables distributor in Ahmedabad, Gujarat. Flame retardant industrial flexible wires, 3-core flat submersible cables, and power cables.",
    h1: "Finolex Cables Dealer & Wholesale Stockist in Ahmedabad, Gujarat",
    intro:
      "Volamp Elektrikals Private Limited is a trusted authorized wholesale dealer and stockist for Finolex Cables Ltd. in Ahmedabad and across Gujarat. Renowned for 99.97% pure electrolytic grade copper conductors and proprietary in-house PVC compounding, Finolex wires deliver unmatched electrical conductivity, energy efficiency, and thermal longevity. We supply commercial contractors and industrial builders with Finolex Flame Guard FRLS wires, 3-core flat submersible cables, and multi-conductor industrial flexible cables.",
  },
  "dealers/kei-cables-gujarat": {
    title: "KEI Cables Distributor & Industrial Stockist Gujarat | Volamp",
    description:
      "Authorized KEI Industries distributor in Ahmedabad & Gujarat. Heavy-duty HT/EHV power cables, rubber trailing cables, instrumentation cables, and solar wires.",
    h1: "KEI Cables Industrial Distributor & Stockist in Gujarat",
    intro:
      "Volamp Elektrikals Private Limited is a specialized industrial distributor and project stockist for KEI Industries Ltd. in Ahmedabad and throughout Gujarat. Catering to heavy engineering, steel plants, chemical manufacturing, infrastructure EPCs, and utility distribution, we supply KEI's engineered cable solutions including Extra High Voltage (EHV) cables up to 220kV, rubber EPR/CSP trailing cables for mining and cranes, and fire-survival FS cables.",
  },
  "dealers/schneider-electric-ahmedabad": {
    title: "Schneider Electric Switchgear Distributor Ahmedabad | Volamp",
    description:
      "Authorized Schneider Electric distributor in Ahmedabad. Acti9 MCBs, EasyPact CVS/EZC MCCBs, TeSys contactors, and industrial power distribution boards.",
    h1: "Schneider Electric Switchgear Distributor in Ahmedabad, Gujarat",
    intro:
      "Volamp Elektrikals Private Limited is an authorized B2B distributor of Schneider Electric low-voltage switchgear and industrial automation components in Ahmedabad, Gujarat. We supply project contractors, OEM panel builders, and facility maintenance teams with authentic Schneider protection switchgear including Acti9 miniature circuit breakers (MCBs), EasyPact CVS and EZC molded case circuit breakers (MCCBs), TeSys D and TeSys F contactors, and motor protection circuit breakers (MPCBs).",
  },
  "locations/industrial-gidc-hubs": {
    title: "Industrial Electrical Supply across Gujarat GIDC Hubs | Volamp",
    description:
      "Same-day 24h electrical cable & switchgear delivery to Sanand, Vatva, Naroda, Changodar, Dahej, Ankleshwar GIDC estates from Aslali logistics terminal.",
    h1: "Express Industrial Electrical Supply across Gujarat GIDC Corridors",
    intro:
      "Volamp Elektrikals Private Limited operates a rapid-dispatch industrial supply network servicing major Gujarat Industrial Development Corporation (GIDC) estates. Centered at our modern logistics hub at the junction of NH-48 and SP Ring Road in Aslali, Ahmedabad, our delivery fleet provides guaranteed same-day to 24-hour turnaround for urgent maintenance, emergency breakdowns, and scheduled project installations across Sanand, Vatva, Naroda, Changodar, Dahej, Ankleshwar, and Jhagadia industrial belts.",
  },
  "customer-portal": {
    title: "Customer Account Portal | Volamp Elektrikals",
    description:
      "Access real-time quotation history, order tracking, dispatch LR notes, and GST invoices on the Volamp Elektrikals customer portal.",
    h1: "Volamp Customer Account & Order Portal",
    intro:
      "Manage your commercial electrical procurement account, view live dispatch statuses with transporter LR details, download manufacturer test certificates (MTC), and access approved GST invoices.",
  },
};

const KNOWN_STATIC_PATHS = new Set(Object.keys(STATIC_ROUTES));

// Other valid paths that render under client SPA
const OTHER_VALID_PATHS = new Set([
  "portal",
  "employee-portal",
  "cart",
  "checkout",
  "login",
  "register",
  "track",
  "pay-invoice",
]);

// 8 Master Categories + standard aliases
const CATEGORY_DATA: Record<string, { name: string; desc: string }> = {
  "wire-cables": {
    name: "Wires & Cables (LT / HT Armoured & Flexible)",
    desc: "Complete range of IS:7098 and IS:1554 certified LT and HT XLPE armoured power cables, flexible copper building wires (IS:694), control cables, submersible flat cables, and fire-survival cables.",
  },
  "switch-gears": {
    name: "Switchgear & Power Protection",
    desc: "Low-voltage and medium-voltage switchgear including Air Circuit Breakers (ACB), Molded Case Circuit Breakers (MCCB), Miniature Circuit Breakers (MCB), Residual Current Breakers (RCCB), and contactors.",
  },
  "switchgear": {
    name: "Switchgear & Power Protection",
    desc: "Low-voltage and medium-voltage switchgear including Air Circuit Breakers (ACB), Molded Case Circuit Breakers (MCCB), Miniature Circuit Breakers (MCB), Residual Current Breakers (RCCB), and contactors.",
  },
  "solar": {
    name: "Solar PV Cables & Renewable Balance of System",
    desc: "TÜV and EN 50618 / IEC 62930 certified 1500V DC solar photovoltaic cables, MC4 connectors, solar array junction boxes, and UV-resistant earthing conductors.",
  },
  "lugs": {
    name: "Cable Lugs & Crimping Terminals",
    desc: "Heavy-duty Dowells electrolytic tinned copper and aluminium crimping lugs, bi-metallic lugs, pin type terminals, and ring type terminal ends compliant with IS 8337.",
  },
  "glands": {
    name: "Cable Glands & Industrial Terminations",
    desc: "High-integrity brass single compression and double compression weatherproof cable glands, flameproof (FLP) cable glands, and heat-shrink termination kits up to 33kV.",
  },
  "conduit": {
    name: "Conduit Pipes & Cable Containment",
    desc: "Heavy-duty rigid PVC conduit pipes, GI flexible conduits, perforated cable trays, and containment accessories for industrial wiring protection.",
  },
  "earthing-material": {
    name: "Earthing Material & Lightning Protection",
    desc: "CPRI and UL certified copper bonded earthing rods, pure electrolytic copper plates, chemical backfill earthing compounds (BFC), and GI earthing flats.",
  },
  "wiring-device": {
    name: "Wiring Devices & Industrial Enclosures",
    desc: "Industrial plug sockets, junction boxes, weatherproof isolators, distribution boxes, and heavy-duty terminal blocks.",
  },
  "substation-transmission": {
    name: "Substation & Transmission Line Equipment",
    desc: "Medium and high-voltage transmission fittings, post insulators, surge arresters, busbar accessories, and disconnectors up to 66kV.",
  },
  "conduits-cable-management": {
    name: "Cable Management & Raceways",
    desc: "Ladder and perforated cable trays, cable ties, cleats, and flexible conduits for structured cable laying in industrial plants.",
  },
  "earthing-lightning": {
    name: "Earthing & Lightning Protection Systems",
    desc: "Maintenance-free chemical earthing electrodes, copper bonded rods, test links, and lightning arresters for industrial and renewable installations.",
  },
  "industrial-automation": {
    name: "Industrial Automation & Motor Controls",
    desc: "VFD drives, soft starters, PLC interface modules, auxiliary contactors, and motor protection circuit breakers (MPCB).",
  },
  "lighting-luminaires": {
    name: "Industrial Lighting & Luminaires",
    desc: "High-bay LED industrial lights, floodlights, cleanroom luminaires, and flameproof well glass fixtures for plant illumination.",
  },
};

const BLOG_POSTS: Record<string, { title: string; desc: string }> = {
  "copper-vs-aluminium-armoured-cable-sizing-guide": {
    title: "Copper vs Aluminium Armoured Cable Sizing Guide | Volamp",
    desc: "Technical comparison of copper vs aluminium conductors: ampacity, voltage drop, derating, and cost trade-offs under IS 7098 standards.",
  },
  "solar-dc-cable-specifications-iec-62930": {
    title: "Solar DC Cable Specifications: EN 50618 & IEC 62930 | Volamp",
    desc: "Engineering guide to 1500V solar PV cables: cross-linked insulation, halogen-free flame retardancy, and UV weather resistance criteria.",
  },
  "lme-copper-aluminium-market-analysis-q4-2026": {
    title: "LME Copper & Aluminium Market Analysis Q4 2026 | Volamp",
    desc: "In-depth market report on London Metal Exchange commodity trends, domestic Indian cable price circulars, and purchasing strategies.",
  },
  "is-7098-vs-is-1554-cable-difference-guide": {
    title: "IS 7098 vs IS 1554: XLPE vs PVC Cable Differences | Volamp",
    desc: "Comprehensive engineering breakdown between IS 7098 XLPE insulated cables and IS 1554 PVC cables: temperature limits and short-circuit ratings.",
  },
  "cable-gland-and-lug-size-selection-chart": {
    title: "Cable Gland & Lug Size Selection Chart | Volamp",
    desc: "Quick reference engineering chart matching armoured cable sizes to Dowells copper lugs and brass double compression cable glands.",
  },
};

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let _indexTemplateCache: string | null = null;

function loadBaseTemplate(): string {
  if (_indexTemplateCache) return _indexTemplateCache;

  const candidates = [
    path.resolve(process.cwd(), "dist/public/index.html"),
    path.resolve(process.cwd(), "client/index.html"),
    path.join(__dirname, "../../dist/public/index.html"),
    path.join(__dirname, "../dist/public/index.html"),
    path.join(__dirname, "../../client/index.html"),
    path.join(__dirname, "../client/index.html"),
    "/var/task/dist/public/index.html",
    "/var/task/client/index.html",
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        _indexTemplateCache = fs.readFileSync(c, "utf8");
        return _indexTemplateCache;
      } catch {
        // try next
      }
    }
  }

  // Fallback minimal HTML shell if file cannot be read
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Industrial Cable &amp; Electrical Distributor | Volamp</title>
    <meta name="description" content="Industrial cables &amp; electrical switchgear wholesale distributor in Ahmedabad, Gujarat." />
    <link rel="canonical" href="https://volampelektrikals.com/" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

/**
 * Builds the pre-rendered HTML document with page-specific SEO tags and semantic body content.
 */
function renderPageHtml({
  title,
  description,
  canonical,
  noIndex = false,
  bodyHtml,
  schemaJson,
}: {
  title: string;
  description: string;
  canonical: string;
  noIndex?: boolean;
  bodyHtml: string;
  schemaJson?: string;
}): string {
  let template = loadBaseTemplate();

  // 1. Replace <title>
  const escapedTitle = escapeXml(title);
  if (template.includes("<title>")) {
    template = template.replace(/<title>.*?<\/title>/s, `<title>${escapedTitle}</title>`);
  } else {
    template = template.replace("<head>", `<head>\n    <title>${escapedTitle}</title>`);
  }

  // 2. Replace meta description
  const escapedDesc = escapeXml(description);
  if (template.includes('name="description"')) {
    template = template.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${escapedDesc}" />`
    );
  } else {
    template = template.replace(
      "</head>",
      `    <meta name="description" content="${escapedDesc}" />\n  </head>`
    );
  }

  // 3. Replace or inject canonical
  if (template.includes('rel="canonical"')) {
    template = template.replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
      `<link rel="canonical" href="${canonical}" />`
    );
  } else {
    template = template.replace(
      "</head>",
      `    <link rel="canonical" href="${canonical}" />\n  </head>`
    );
  }

  // 4. Update robots tag if noIndex is true
  if (noIndex) {
    if (template.includes('name="robots"')) {
      template = template.replace(
        /<meta\s+name="robots"\s+content=".*?"\s*\/?>/i,
        '<meta name="robots" content="noindex, nofollow" />'
      );
    } else {
      template = template.replace(
        "</head>",
        '    <meta name="robots" content="noindex, nofollow" />\n  </head>'
      );
    }
  }

  // 5. OpenGraph & Twitter tags update
  template = template.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${escapedTitle}" />`
  );
  template = template.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${escapedDesc}" />`
  );
  template = template.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${canonical}" />`
  );
  template = template.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapedTitle}" />`
  );
  template = template.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapedDesc}" />`
  );

  // 6. Inject Schema JSON-LD if provided
  if (schemaJson) {
    template = template.replace(
      "</head>",
      `    <script type="application/ld+json">${schemaJson}</script>\n  </head>`
    );
  }

  // 7. Inject semantic pre-rendered HTML into <div id="root">
  // React createRoot will hydrate / replace this when client JS mounts!
  template = template.replace(
    '<div id="root"></div>',
    `<div id="root">${bodyHtml}</div>`
  );

  return template;
}

/**
 * Express middleware for server-side SEO prerendering and real HTTP 404 responses.
 * Directly resolves Launch Blockers 1 & 2.
 */
export function seoPrerenderMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only process GET / HEAD requests
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }

  const rawPath = req.path || "/";

  // Skip static assets, TRPC, and API routes
  if (
    rawPath.startsWith("/api/") ||
    rawPath.startsWith("/trpc/") ||
    rawPath.startsWith("/assets/") ||
    rawPath.startsWith("/storage-proxy/") ||
    rawPath === "/sitemap.xml" ||
    rawPath === "/robots.txt" ||
    rawPath === "/google-merchant-feed.xml" ||
    rawPath === "/llms.txt" ||
    rawPath === "/llms-full.txt" ||
    /\.(js|css|json|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|pdf|map)$/i.test(rawPath)
  ) {
    return next();
  }

  const cleanPath = rawPath.replace(/^\/+|\/+$/g, ""); // "" for home, "products" for /products

  // =========================================================================
  // 1. DYNAMIC ROUTE: /product/:id
  // =========================================================================
  if (cleanPath.startsWith("product/")) {
    const rawId = cleanPath.replace(/^product\//, "").trim();
    const product = getProductByProductId(rawId);

    if (!product) {
      // REAL HTTP 404 STATUS FOR NON-EXISTENT PRODUCTS (Launch Blocker 2)
      res.status(404);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      const html = renderPageHtml({
        title: "Product Not Found (404) | Volamp",
        description: "The requested electrical product could not be found. Browse over 3,385 active power cables, switchgear, and earthing supplies in our catalog.",
        canonical: `${BASE_URL}/404`,
        noIndex: true,
        bodyHtml: `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:80px auto;padding:32px;text-align:center;">
            <p style="color:#c56718;font-weight:bold;font-size:14px;letter-spacing:1px;text-transform:uppercase;">Error 404</p>
            <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:12px 0;">Product Not Found</h1>
            <p style="color:#64748b;font-size:16px;line-height:1.6;margin-bottom:28px;">
              The product code <code>${escapeXml(rawId)}</code> does not exist in our catalog or may have been retired.
              We stock over 3,385 genuine certified electrical products from Polycab, Finolex, KEI, Schneider, and L&T.
            </p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
              <a href="/products" style="background:#c56718;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">Browse 3,385+ Products</a>
              <a href="/enquire" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Contact Engineering Desk</a>
              <a href="/" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Home</a>
            </div>
          </div>
        `,
      });
      return res.send(html);
    }

    // PRODUCT FOUND -> Server-side rendered with semantic H1, Specs, Links, and Schema (Launch Blocker 1)
    const rawPrice =
      product.numericPrice ||
      (typeof product.price === "string" ? parseFloat(product.price.replace(/[^0-9.]/g, "")) : 0) ||
      100;
    const priceFormatted = rawPrice.toLocaleString("en-IN", { style: "currency", currency: "INR" });
    const productUrl = `${BASE_URL}/product/${encodeURIComponent(product.productId)}`;

    const schema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.imageUrl ? (product.imageUrl.startsWith("http") ? product.imageUrl : `${BASE_URL}${product.imageUrl}`) : `${BASE_URL}/products/default.jpg`,
      "description": product.description || `${product.name} industrial supply from Volamp Elektrikals.`,
      "sku": product.sku || product.productId,
      "mpn": product.productId,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "Polycab",
      },
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "INR",
        "price": rawPrice.toFixed(2),
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "VOLAMP ELEKTRIKALS PVT. LTD.",
        },
      },
    });

    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: `${product.name} | Volamp`,
      description: `Buy ${product.name} (SKU: ${product.sku || product.productId}). Genuine ${product.brand || "Polycab"} electrical supply with MTC test certificate from Volamp.`,
      canonical: productUrl,
      schemaJson: schema,
      bodyHtml: `
        <article style="font-family:system-ui,-apple-system,sans-serif;max-width:1100px;margin:40px auto;padding:24px;color:#1e293b;">
          <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
            <a href="/" style="color:#64748b;text-decoration:none;">Home</a> &gt;
            <a href="/products" style="color:#64748b;text-decoration:none;">Products</a> &gt;
            <a href="/category/${encodeURIComponent((product.category || "wire-cables").toLowerCase().replace(/\s+/g, "-"))}" style="color:#64748b;text-decoration:none;">${escapeXml(product.category || "Electrical")}</a> &gt;
            <span style="color:#0f172a;font-weight:600;">${escapeXml(product.name)}</span>
          </nav>
          <header style="border-bottom:1px solid #e2e8f0;padding-bottom:24px;margin-bottom:28px;">
            <div style="display:inline-block;padding:4px 10px;background:#fef3c7;color:#92400e;font-size:12px;font-weight:700;border-radius:6px;margin-bottom:12px;">
              ${escapeXml(product.brand || "Polycab")} • Genuine Certified
            </div>
            <h1 style="font-size:28px;font-weight:800;color:#0f172a;line-height:1.3;margin:0 0 12px 0;">${escapeXml(product.name)}</h1>
            <p style="font-size:14px;color:#64748b;margin:0;">
              Product ID: <strong style="font-family:monospace;color:#0f172a;">${escapeXml(product.productId)}</strong> |
              SKU: <strong style="font-family:monospace;color:#0f172a;">${escapeXml(product.sku || product.productId)}</strong> |
              Category: <a href="/category/${encodeURIComponent((product.category || "wire-cables").toLowerCase().replace(/\s+/g, "-"))}" style="color:#c56718;font-weight:600;text-decoration:none;">${escapeXml(product.category || "Wires & Cables")}</a>
            </p>
          </header>
          <section style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:32px;margin-bottom:40px;">
            <div>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:20px;">
                <p style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;margin:0 0 6px 0;">B2B Wholesale Price (excl. GST)</p>
                <div style="font-size:32px;font-weight:900;color:#0f172a;">${priceFormatted}</div>
                <p style="font-size:12px;color:#16a34a;font-weight:700;margin:8px 0 0 0;">✓ In Stock — Ready for 24h dispatch across Gujarat & Pan-India</p>
              </div>
              <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <a href="/enquire" style="background:#c56718;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;display:inline-block;">Request Project Quotation</a>
                <a href="/calculator" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;display:inline-block;">Calculate Voltage Drop</a>
              </div>
            </div>
            <div>
              <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 16px 0;">Technical Specifications & Compliance</h2>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tbody>
                  <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Manufacturer / Brand</td><td style="padding:10px 0;font-weight:600;color:#0f172a;text-align:right;">${escapeXml(product.brand || "Polycab")}</td></tr>
                  <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Conductor / Size</td><td style="padding:10px 0;font-weight:600;color:#0f172a;text-align:right;">${escapeXml(product.size || "Standard")}</td></tr>
                  <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Quality Verification</td><td style="padding:10px 0;font-weight:600;color:#0f172a;text-align:right;">Manufacturer Test Certificate (MTC) Included</td></tr>
                  <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Dispatch Location</td><td style="padding:10px 0;font-weight:600;color:#0f172a;text-align:right;">Aslali Central Warehouse, Ahmedabad</td></tr>
                </tbody>
              </table>
            </div>
          </section>
          <section style="background:#f8fafc;padding:24px;border-radius:12px;border:1px solid #e2e8f0;font-size:14px;line-height:1.7;color:#475569;">
            <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin-top:0;">About This Product & Supply Assurance</h3>
            <p>
              ${escapeXml(product.name)} is supplied directly by Volamp Elektrikals Private Limited, authorized industrial electrical distributor in Ahmedabad, Gujarat.
              All cables and switchgear are sourced directly from manufacturer production lines with full batch traceability, routine test reports, and compliance with Indian (BIS) and International Electrotechnical Commission (IEC) standards.
            </p>
          </section>
        </article>
      `,
    });
    return res.send(html);
  }

  // =========================================================================
  // 2. DYNAMIC ROUTE: /category/:slug
  // =========================================================================
  if (cleanPath.startsWith("category/")) {
    const slug = cleanPath.replace(/^category\//, "").trim().toLowerCase();
    const catInfo = CATEGORY_DATA[slug];

    if (!catInfo) {
      // REAL HTTP 404 STATUS FOR NON-EXISTENT CATEGORY (Launch Blocker 2)
      res.status(404);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      const html = renderPageHtml({
        title: "Category Not Found (404) | Volamp",
        description: "The requested electrical category does not exist. Browse our verified categories across power cables, switchgear, and solar PV.",
        canonical: `${BASE_URL}/404`,
        noIndex: true,
        bodyHtml: `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:80px auto;padding:32px;text-align:center;">
            <p style="color:#c56718;font-weight:bold;font-size:14px;letter-spacing:1px;text-transform:uppercase;">Error 404</p>
            <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:12px 0;">Category Not Found</h1>
            <p style="color:#64748b;font-size:16px;line-height:1.6;margin-bottom:28px;">
              The category <code>/category/${escapeXml(slug)}</code> does not exist in our catalog.
            </p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
              <a href="/products" style="background:#c56718;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">Browse All Products</a>
              <a href="/" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Home</a>
            </div>
          </div>
        `,
      });
      return res.send(html);
    }

    // CATEGORY FOUND -> Prerender with H1, 150-word intro copy, and crawlable product links (Launch Blocker 1 & 4)
    const allProducts = loadProductsFromDisk();
    const categoryProducts = allProducts.filter((p) => {
      const c = (p.category || "").toLowerCase();
      if (slug === "wire-cables" || slug.includes("cable") || slug.includes("wire")) return c.includes("cable") || c.includes("wire");
      if (slug === "switch-gears" || slug.includes("switch")) return c.includes("switch");
      if (slug === "solar") return c.includes("solar");
      if (slug === "lugs") return c.includes("lug");
      if (slug === "glands") return c.includes("gland");
      if (slug === "conduit") return c.includes("pipe") || c.includes("conduit");
      if (slug === "earthing-material") return c.includes("earth");
      if (slug === "wiring-device") return c.includes("device") || c.includes("wiring");
      return false; // Prevent catalog leaking into unverified categories
    }).slice(0, 24);

    const productLinksHtml = categoryProducts
      .map(
        (p) => `
        <li style="padding:12px 0;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;">
          <a href="/product/${encodeURIComponent(p.productId)}" style="color:#0f172a;font-weight:600;text-decoration:none;font-size:14px;">
            ${escapeXml(p.name)}
          </a>
          <span style="font-family:monospace;font-size:12px;color:#64748b;">${escapeXml(p.productId)}</span>
        </li>
      `
      )
      .join("");

    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: `${catInfo.name} | Volamp`,
      description: `Authorized wholesale distributor of ${catInfo.name} in Ahmedabad, Gujarat. Genuine Polycab, Finolex, KEI, Schneider supplies with MTC test certificates.`,
      canonical: `${BASE_URL}/category/${slug}`,
      bodyHtml: `
        <main style="font-family:system-ui,-apple-system,sans-serif;max-width:1100px;margin:40px auto;padding:24px;color:#1e293b;">
          <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
            <a href="/" style="color:#64748b;text-decoration:none;">Home</a> &gt;
            <a href="/products" style="color:#64748b;text-decoration:none;">Products</a> &gt;
            <span style="color:#0f172a;font-weight:600;">${escapeXml(catInfo.name)}</span>
          </nav>
          <header style="margin-bottom:32px;">
            <h1 style="font-size:32px;font-weight:800;color:#0f172a;line-height:1.2;margin:0 0 16px 0;">${escapeXml(catInfo.name)}</h1>
            <p style="font-size:15px;line-height:1.7;color:#475569;max-width:900px;">
              ${escapeXml(catInfo.desc)}
              Volamp Elektrikals Private Limited maintains extensive wholesale inventory across all standard specifications in our Aslali logistics terminal.
              Every consignment is supplied with manufacturer Material Test Certificates (MTC) and undergoes strict quality verification to ensure flawless performance in continuous industrial and utility service.
            </p>
          </header>
          <section>
            <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 16px 0;">Available Products in this Category</h2>
            <ul style="list-style:none;padding:0;margin:0;">
              ${productLinksHtml}
            </ul>
          </section>
        </main>
      `,
    });
    return res.send(html);
  }

  // =========================================================================
  // 3. DYNAMIC ROUTE: /blog/:slug
  // =========================================================================
  if (cleanPath.startsWith("blog/")) {
    const slug = cleanPath.replace(/^blog\//, "").trim().toLowerCase();
    const blog = BLOG_POSTS[slug];

    if (!blog) {
      res.status(404);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      const html = renderPageHtml({
        title: "Article Not Found (404) | Volamp",
        description: "The requested engineering article does not exist.",
        canonical: `${BASE_URL}/404`,
        noIndex: true,
        bodyHtml: `<div style="font-family:system-ui;max-width:800px;margin:80px auto;text-align:center;"><h1>Article Not Found (404)</h1><p><a href="/blog">Browse All Engineering Articles</a></p></div>`,
      });
      return res.send(html);
    }

    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: blog.title,
      description: blog.desc,
      canonical: `${BASE_URL}/blog/${slug}`,
      bodyHtml: `
        <article style="font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:40px auto;padding:24px;color:#1e293b;">
          <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
            <a href="/" style="color:#64748b;text-decoration:none;">Home</a> &gt;
            <a href="/blog" style="color:#64748b;text-decoration:none;">Blog</a> &gt;
            <span style="color:#0f172a;font-weight:600;">${escapeXml(blog.title)}</span>
          </nav>
          <h1 style="font-size:32px;font-weight:800;color:#0f172a;line-height:1.3;margin:0 0 16px 0;">${escapeXml(blog.title)}</h1>
          <p style="font-size:16px;line-height:1.7;color:#475569;">${escapeXml(blog.desc)}</p>
        </article>
      `,
    });
    return res.send(html);
  }

  // =========================================================================
  // 4. STATIC KNOWN ROUTES (Home, About, Products, etc.)
  // =========================================================================
  if (KNOWN_STATIC_PATHS.has(cleanPath)) {
    const meta = STATIC_ROUTES[cleanPath];
    const canonical = cleanPath === "" ? `${BASE_URL}/` : `${BASE_URL}/${cleanPath}`;

    // For Home, embed crawlable category links & featured products
    let homeExtraHtml = "";
    if (cleanPath === "") {
      homeExtraHtml = `
        <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:28px;">
          <h2 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:16px;">Core Electrical Categories</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:16px;">
            <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
              <h3 style="font-size:16px;margin:0 0 6px 0;"><a href="/category/wire-cables" style="color:#c56718;font-weight:bold;text-decoration:none;">Wires &amp; Cables</a></h3>
              <p style="font-size:13px;color:#64748b;margin:0;">LT / HT XLPE armoured, flexible FRLS, submersible, control cables.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
              <h3 style="font-size:16px;margin:0 0 6px 0;"><a href="/category/switch-gears" style="color:#c56718;font-weight:bold;text-decoration:none;">Switchgear &amp; Protection</a></h3>
              <p style="font-size:13px;color:#64748b;margin:0;">Schneider and L&T ACBs, MCCBs, MCBs, contactors, starters.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
              <h3 style="font-size:16px;margin:0 0 6px 0;"><a href="/category/solar" style="color:#c56718;font-weight:bold;text-decoration:none;">Solar PV Cables</a></h3>
              <p style="font-size:13px;color:#64748b;margin:0;">1500V DC UV-resistant cross-linked halogen-free cables per EN 50618.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
              <h3 style="font-size:16px;margin:0 0 6px 0;"><a href="/category/earthing-material" style="color:#c56718;font-weight:bold;text-decoration:none;">Earthing &amp; Lightning</a></h3>
              <p style="font-size:13px;color:#64748b;margin:0;">Copper bonded rods, chemical compound, GI flats, UL/CPRI certified.</p>
            </div>
          </div>
        </section>
        <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:28px;">
          <h2 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:16px;">Fast Moving B2B Electrical Products</h2>
          <ul style="list-style:none;padding:0;margin:0;font-size:14px;">
            <li style="padding:8px 0;"><a href="/product/CAB-000001" style="color:#0f172a;font-weight:600;text-decoration:none;">1.1kV XLPE Aluminium Armoured Cable (3.5C x 185 sqmm)</a> — SKU: CAB-000001</li>
            <li style="padding:8px 0;"><a href="/product/SOL-000001" style="color:#0f172a;font-weight:600;text-decoration:none;">Solar DC Cable 1C x 4 sqmm (H1Z2Z2-K / EN 50618)</a> — SKU: SOL-000001</li>
            <li style="padding:8px 0;"><a href="/product/SWG-000001" style="color:#0f172a;font-weight:600;text-decoration:none;">10kA C-Curve Miniature Circuit Breaker (MCB) 4-Pole 63A</a> — SKU: SWG-000001</li>
          </ul>
        </section>
      `;
    }

    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: meta.title,
      description: meta.description,
      canonical,
      bodyHtml: `
        <main style="font-family:system-ui,-apple-system,sans-serif;max-width:1100px;margin:40px auto;padding:24px;color:#1e293b;">
          <header style="margin-bottom:32px;">
            <h1 style="font-size:32px;font-weight:800;color:#0f172a;line-height:1.2;margin:0 0 16px 0;">${escapeXml(meta.h1)}</h1>
            <p style="font-size:15px;line-height:1.7;color:#475569;max-width:900px;">
              ${escapeXml(meta.intro)}
            </p>
          </header>
          ${homeExtraHtml}
        </main>
      `,
    });
    return res.send(html);
  }

  // =========================================================================
  // 5. OTHER VALID CLIENT PORTAL / UTILITY ROUTES (portal, cart, etc.)
  // =========================================================================
  if (OTHER_VALID_PATHS.has(cleanPath)) {
    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: `${cleanPath.toUpperCase()} | Volamp Elektrikals`,
      description: "Secure B2B electrical customer portal and ordering platform for Volamp Elektrikals.",
      canonical: `${BASE_URL}/${cleanPath}`,
      bodyHtml: `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:60px auto;padding:24px;text-align:center;">
          <h1 style="font-size:28px;font-weight:800;color:#0f172a;">${escapeXml(cleanPath.toUpperCase())}</h1>
          <p style="color:#64748b;margin-top:12px;">Loading secure Volamp portal application...</p>
        </div>
      `,
    });
    return res.send(html);
  }

  // =========================================================================
  // 6. UNKNOWN ROUTE -> REAL HTTP 404 STATUS (Launch Blocker 2)
  // =========================================================================
  res.status(404);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const notFoundHtml = renderPageHtml({
    title: "Page Not Found (404) | Volamp Elektrikals",
    description: "The page you are looking for does not exist or has moved. Browse our full electrical catalog or contact our sales desk in Ahmedabad.",
    canonical: `${BASE_URL}/404`,
    noIndex: true,
    bodyHtml: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:80px auto;padding:32px;text-align:center;">
        <p style="color:#c56718;font-weight:bold;font-size:14px;letter-spacing:1px;text-transform:uppercase;">Error 404</p>
        <h1 style="font-size:36px;font-weight:800;color:#0f172a;margin:12px 0;">404 - Page Not Found</h1>
        <p style="color:#64748b;font-size:16px;line-height:1.6;margin-bottom:28px;">
          The URL <code>/${escapeXml(cleanPath)}</code> could not be found on this server.
          It may have been moved or removed during our platform migration.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <a href="/" style="background:#c56718;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">Return to Homepage</a>
          <a href="/products" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Browse 3,385+ Products</a>
          <a href="/enquire" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Contact Sales Desk</a>
        </div>
      </div>
    `,
  });
  return res.send(notFoundHtml);
}
