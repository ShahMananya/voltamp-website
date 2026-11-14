import type { Express, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { loadProductsFromDisk, getProductByProductId } from "./services/productService";
import { BLOG_POSTS_DATA, type BlogPost } from "../shared/blogData";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://www.volampelektrikals.com";

// Known static routes
const STATIC_ROUTES: Record<
  string,
  { title: string; description: string; h1: string; intro: string }
> = {
  "": {
    title: "Wires and Cables in Ahmedabad | Polycab, KEI & Finolex Distributor - Volamp",
    description:
      "Leading wires and industrial cables distributor in Ahmedabad, Gujarat. Wholesale distributor of Polycab, Finolex, KEI house wires, power cables & switchgear with MTC certificates. Fast dispatch.",
    h1: "Wires and Cables in Ahmedabad | Polycab, KEI & Finolex Distributor",
    intro:
      "Volamp Elektrikals Private Limited is Ahmedabad's premier wholesale distributor and supplier of electrical house wires and industrial cables. Supplies popular electrical house wire and cable brands like Polycab, Finolex, and KEI with a 60+ year family legacy established in 1964. Operating modern corporate distribution hubs in Khadia and Aslali, Ahmedabad, we supply genuine certified electrical materials with original Manufacturer Test Certificates (MTC) to EPC contractors, government utilities, solar developers, and industrial manufacturing plants across Gujarat and Western India.",
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
    title: "Projects & Footprint | Volamp Elektrikals",
    description:
      "Explore electrical infrastructure and industrial projects supplied by Volamp Elektrikals across Gujarat and India.",
    h1: "Electrical Infrastructure Projects & Supply Footprint",
    intro:
      "Volamp Elektrikals Private Limited supplies mission-critical electrical materials, HT/LT power cables, and switchgear to EPC contractors, renewable solar developers, and manufacturing plants across Gujarat and Western India. With our central logistics facility in Aslali, Ahmedabad, we provide verified test compliance, routine inspection reports, and timely material dispatch for electrical infrastructure.",
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
    title: "Terms and Conditions of Commercial Supply | Volamp Elektrikals",
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
    title: "Polycab Wires & Cables Wholesale Stockist Ahmedabad | Volamp",
    description:
      "Wholesale stockist & supplier of Polycab cables and wires in Ahmedabad, Gujarat. Ready stock of LT/HT XLPE power cables, flexible wires & solar cables.",
    h1: "Polycab Wires & Cables Wholesale Stockist in Ahmedabad",
    intro:
      "Volamp Elektrikals Private Limited is a wholesale stockist and supplier of Polycab India Ltd. wires and cables in Ahmedabad, Gujarat. Operating from our central logistics fulfillment terminal on Aslali Highway and corporate sales office in Khadia, we maintain ready inventory of Polycab 1.1kV LT XLPE aluminium and copper armoured cables (IS 7098 Part 1), 11kV to 33kV HT XLPE power cables (IS 7098 Part 2), 1500V DC solar PV cables (EN 50618), Green Wire building wires, and multi-core flexible control cables.",
  },
  "dealers/finolex-cables-ahmedabad": {
    title: "Finolex Wires & Cables Wholesale Stockist Ahmedabad | Volamp",
    description:
      "Wholesale stockist & supplier of Finolex wires and cables in Ahmedabad, Gujarat. Flame retardant industrial flexible wires, 3-core flat submersible cables.",
    h1: "Finolex Wires & Cables Wholesale Stockist in Ahmedabad",
    intro:
      "Volamp Elektrikals Private Limited is a wholesale stockist and supplier of Finolex Cables Ltd. products in Ahmedabad and across Gujarat. We supply commercial contractors and industrial builders with Finolex Flame Guard FRLS wires, 3-core flat submersible cables, and multi-conductor industrial flexible cables from our Ahmedabad facilities.",
  },
  "dealers/kei-cables-gujarat": {
    title: "KEI Cables Wholesale Stockist & Industrial Supplier Gujarat | Volamp",
    description:
      "Wholesale supplier of KEI Industries power cables in Ahmedabad & Gujarat. Heavy-duty HT power cables, rubber trailing cables, and control cables.",
    h1: "KEI Cables Wholesale Industrial Stockist in Gujarat",
    intro:
      "Volamp Elektrikals Private Limited is an industrial stockist and project supplier for KEI Industries Ltd. cables in Ahmedabad and throughout Gujarat. We supply KEI power and control cable lines including Extra High Voltage (EHV) cables, rubber EPR/CSP trailing cables, and industrial HT cables.",
  },
  "dealers/schneider-electric-ahmedabad": {
    title: "Schneider Electric Switchgear Wholesale Supplier Ahmedabad | Volamp",
    description:
      "Wholesale supplier of Schneider Electric low-voltage switchgear in Ahmedabad. Acti9 MCBs, EasyPact CVS/EZC MCCBs, and TeSys contactors.",
    h1: "Schneider Electric Switchgear Wholesale Supplier in Ahmedabad",
    intro:
      "Volamp Elektrikals Private Limited is a B2B wholesale distributor and supplier of Schneider Electric low-voltage switchgear in Ahmedabad, Gujarat. We supply project contractors, panel builders, and maintenance teams with Schneider protection switchgear including Acti9 MCBs, EasyPact MCCBs, and TeSys contactors.",
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
  "employee-registration",
  "employee/register",
  "employee-register",
  "ceo-authorize",
  "ceo-authorization",
  "ceo/authorize",
  "ceo/authorization",
  "ceo-approval",
  "ceo-approve",
  "ceo/approve",
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
    name: "Wires & Cables (LT / HT Armoured & Unarmoured Power Cables)",
    desc: "Complete range of IS:7098 and IS:1554 certified LT and HT XLPE armoured and unarmoured power cables, flexible copper building wires (IS:694), unarmoured control cables (1.5 sqmm to 1000 sqmm), submersible flat cables, and fire-survival cables from Polycab, KEI, and Finolex in Ahmedabad, Gujarat.",
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

function formatInlineMarkdown(str: string): string {
  return (str || "")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:13px;color:#c56718;">$1</code>');
}

function renderMarkdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlLines: string[] = [];
  let inTable = false;
  let tableHeaderDone = false;
  let inList = false;
  let listType: "ul" | "ol" | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Table row detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (/^\|(\s*[-:]+[-|\s:]*)\|$/.test(trimmed)) {
        tableHeaderDone = true;
        continue;
      }
      if (!inTable) {
        if (inList) {
          htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
          inList = false;
          listType = null;
        }
        inTable = true;
        tableHeaderDone = false;
        htmlLines.push('<div style="overflow-x:auto;margin:24px 0;"><table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #e2e8f0;">');
      }
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      if (!tableHeaderDone) {
        htmlLines.push('<thead><tr style="background:#f8fafc;border-bottom:2px solid #cbd5e1;">' +
          cells.map((c) => `<th style="padding:10px 14px;text-align:left;font-weight:700;color:#0f172a;border:1px solid #e2e8f0;">${formatInlineMarkdown(c)}</th>`).join("") +
          '</tr></thead><tbody>');
      } else {
        htmlLines.push('<tr style="border-bottom:1px solid #f1f5f9;">' +
          cells.map((c) => `<td style="padding:10px 14px;color:#334155;border:1px solid #e2e8f0;">${formatInlineMarkdown(c)}</td>`).join("") +
          '</tr>');
      }
      continue;
    } else if (inTable) {
      htmlLines.push('</tbody></table></div>');
      inTable = false;
      tableHeaderDone = false;
    }

    // List items
    if (/^[-*]\s+/.test(trimmed)) {
      if (!inList || listType !== "ul") {
        if (inList) htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
        inList = true;
        listType = "ul";
        htmlLines.push('<ul style="margin:16px 0;padding-left:24px;line-height:1.8;color:#334155;">');
      }
      const itemContent = trimmed.replace(/^[-*]\s+/, "");
      htmlLines.push(`<li>${formatInlineMarkdown(itemContent)}</li>`);
      continue;
    } else if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList || listType !== "ol") {
        if (inList) htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
        inList = true;
        listType = "ol";
        htmlLines.push('<ol style="margin:16px 0;padding-left:24px;line-height:1.8;color:#334155;">');
      }
      const itemContent = trimmed.replace(/^\d+\.\s+/, "");
      htmlLines.push(`<li>${formatInlineMarkdown(itemContent)}</li>`);
      continue;
    } else if (inList) {
      htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");
      inList = false;
      listType = null;
    }

    // Headers
    if (trimmed.startsWith("### ")) {
      htmlLines.push(`<h3 style="font-size:18px;font-weight:700;color:#0f172a;margin:28px 0 12px 0;">${formatInlineMarkdown(trimmed.slice(4))}</h3>`);
    } else if (trimmed.startsWith("## ")) {
      htmlLines.push(`<h2 style="font-size:22px;font-weight:700;color:#0f172a;margin:36px 0 16px 0;border-bottom:1px solid #e2e8f0;padding-bottom:8px;">${formatInlineMarkdown(trimmed.slice(3))}</h2>`);
    } else if (trimmed.startsWith("# ")) {
      htmlLines.push(`<h1 style="font-size:28px;font-weight:800;color:#0f172a;margin:20px 0 16px 0;">${formatInlineMarkdown(trimmed.slice(2))}</h1>`);
    } else if (trimmed === "---") {
      htmlLines.push('<hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" />');
    } else if (trimmed === "") {
      // blank line
    } else {
      htmlLines.push(`<p style="font-size:15px;line-height:1.75;color:#334155;margin:14px 0;">${formatInlineMarkdown(trimmed)}</p>`);
    }
  }

  if (inTable) htmlLines.push('</tbody></table></div>');
  if (inList) htmlLines.push(listType === "ul" ? "</ul>" : "</ol>");

  return htmlLines.join("\n");
}

function buildDirectFactualDescription(
  product: any,
  fullDisplayName: string,
  specs: Record<string, any>,
  standardsText: string | null,
  catSlug: string
): string {
  const brand = product.brand || "Polycab";
  if (catSlug === "wire-cables") {
    const size = product.size ? `${product.size} ` : "";
    const cores = specs.cores ? `${specs.cores} ` : "";
    const conductor = product.material ? `${product.material} ` : "";
    const armour = specs.typeOfArmour ? `${specs.typeOfArmour.toLowerCase()} ` : "";
    const volt = specs.voltageRating ? `rated for ${specs.voltageRating} ` : "";
    const std = standardsText ? `conforming to ${standardsText}` : "conforming to applicable Indian standards";
    return `The ${brand} ${size}${cores}${conductor}${armour}cable is an industrial power and wiring solution ${volt}${std}. Sourced directly for industrial, commercial, and utility installations with verified material test certificates (MTC) and dispatch from our Aslali logistics terminal.`;
  }
  if (catSlug === "switch-gears") {
    const rating = specs.currentRatingA ? `${specs.currentRatingA.replace(/^ew\s+/i, "").trim()} ` : "";
    const poles = specs.polesPhase ? `${specs.polesPhase} ` : "";
    const breaking = specs.breakingCapacityKa ? `with ${specs.breakingCapacityKa} kA breaking capacity ` : "";
    const std = standardsText ? `tested to ${standardsText}` : "tested to IS/IEC 60947 standards";
    return `The ${brand} ${fullDisplayName} is an industrial switchgear unit rated at ${rating}${poles}${breaking}${std}. Engineered for dependable circuit isolation, overcurrent protection, and panel integration across commercial and industrial infrastructure.`;
  }
  if (catSlug === "glands") {
    const type = specs.compressionType ? `${specs.compressionType} ` : "";
    const od = specs.suitableCableOdMm ? `accommodating cable ODs of ${specs.suitableCableOdMm} mm ` : "";
    return `The ${brand} ${fullDisplayName} is a heavy-duty ${type}cable gland ${od}designed for secure mechanical termination and IP-grade ingress protection in industrial junction boxes and switchgear.`;
  }
  if (catSlug === "lugs") {
    const size = specs.sizeRange || product.size ? `for ${specs.sizeRange || product.size} conductors ` : "";
    const mat = product.material || specs.material ? `manufactured from ${product.material || specs.material} ` : "";
    return `The ${brand} ${fullDisplayName} is a heavy-duty terminal lug ${size}${mat}providing low-resistance, corrosion-resistant crimp terminations for industrial switchboards, transformers, and distribution panels.`;
  }
  return `The ${brand} ${fullDisplayName} is a genuine industrial electrical product supplied with verified manufacturer specifications, routine test compliance, and express wholesale dispatch from Volamp Elektrikals Ahmedabad.`;
}

function renderCategoryBuyerGuide(slug: string): string {
  if (slug === "wire-cables") {
    return `
      <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:28px;">
        <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:16px;">Power Cable Subtype Engineering Comparison</h2>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;">
            <thead>
              <tr style="background:#f8fafc;border-bottom:2px solid #cbd5e1;">
                <th style="padding:10px 14px;text-align:left;color:#0f172a;border:1px solid #e2e8f0;">Cable Type</th>
                <th style="padding:10px 14px;text-align:left;color:#0f172a;border:1px solid #e2e8f0;">Standard</th>
                <th style="padding:10px 14px;text-align:left;color:#0f172a;border:1px solid #e2e8f0;">Conductor Temp</th>
                <th style="padding:10px 14px;text-align:left;color:#0f172a;border:1px solid #e2e8f0;">Primary Application</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;">LT XLPE Armoured</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">IS 7098 (Part 1)</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">90°C continuous / 250°C short circuit</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">Direct underground burial, trenches, heavy factory feeders</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;">LT PVC Power Cable</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">IS 1554 (Part 1)</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">70°C continuous / 160°C short circuit</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">Indoor raceways, commercial risers, non-critical sub-feeders</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;">Flexible FRLS Wire</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">IS 694</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">70°C / Class 5 flexible copper</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">Concealed building conduits, panel internal wiring</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:28px 0 12px 0;">How to Choose: Engineering Sizing Checklist</h3>
        <ol style="margin:0 0 24px 0;padding-left:24px;font-size:14px;line-height:1.75;color:#334155;">
          <li><strong>Calculate Operating Current:</strong> Determine full load current using actual operating voltage (415V 3P or 230V 1P) and motor power factor.</li>
          <li><strong>Apply Grouping &amp; Thermal Derating:</strong> Derate continuous ampacity based on soil thermal resistivity (1.5 K·m/W) or ambient air tray layout per IS 7098.</li>
          <li><strong>Verify Voltage Drop Regulation:</strong> Confirm voltage drop stays within Central Electricity Authority (CEA) limits (3% for branch runs, 5% max overall).</li>
          <li><strong>Verify Short-Circuit Withstand:</strong> Calculate adiabatic thermal rating (k²S² ≥ I²t) to prevent insulation thermal melting during upstream breaker clearing times.</li>
        </ol>

        <div style="background:#f8fafc;padding:16px 20px;border-radius:10px;border:1px solid #e2e8f0;display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
          <span style="font-size:13px;font-weight:700;color:#0f172a;">Engineering Resources:</span>
          <a href="/calculator" style="color:#c56718;font-size:13px;font-weight:700;text-decoration:none;">Interactive Cable Sizing Calculator &rarr;</a>
          <a href="/blog/copper-vs-aluminium-armoured-cable-sizing-guide" style="color:#c56718;font-size:13px;font-weight:700;text-decoration:none;">Copper vs Aluminium Guide &rarr;</a>
          <a href="/enquire" style="color:#c56718;font-size:13px;font-weight:700;text-decoration:none;">Request Drum Cutting / RFQ &rarr;</a>
        </div>
      </section>
    `;
  }
  if (slug === "switch-gears") {
    return `
      <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:28px;">
        <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:16px;">Switchgear Subtype Comparison: MCB vs MCCB vs ACB</h2>
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:13px;border:1px solid #e2e8f0;">
            <thead>
              <tr style="background:#f8fafc;border-bottom:2px solid #cbd5e1;">
                <th style="padding:10px 14px;text-align:left;color:#0f172a;border:1px solid #e2e8f0;">Device Type</th>
                <th style="padding:10px 14px;text-align:left;color:#0f172a;border:1px solid #e2e8f0;">Rated Current (In)</th>
                <th style="padding:10px 14px;text-align:left;color:#0f172a;border:1px solid #e2e8f0;">Breaking Capacity (Icu)</th>
                <th style="padding:10px 14px;text-align:left;color:#0f172a;border:1px solid #e2e8f0;">Trip Characteristics</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;">MCB (Miniature Breaker)</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">0.5A to 63A</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">Up to 10 kA</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">Fixed thermal/magnetic (B, C, D curves)</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;">MCCB (Moulded Case Breaker)</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">16A to 1,600A</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">18 kA to 70 kA</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">Adjustable thermal-magnetic / microprocessor trip unit</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px 14px;border:1px solid #e2e8f0;font-weight:600;">ACB (Air Circuit Breaker)</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">630A to 6,300A</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">Up to 100 kA</td>
                <td style="padding:10px 14px;border:1px solid #e2e8f0;">Advanced digital protection (L-S-I-G) with bus communication</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin:28px 0 12px 0;">How to Choose: Switchgear Selection Checklist</h3>
        <ol style="margin:0 0 24px 0;padding-left:24px;font-size:14px;line-height:1.75;color:#334155;">
          <li><strong>Prospective Fault Level:</strong> Confirm substation transformer kVA and impedance to ensure breaker Icu exceeds prospective short-circuit kA.</li>
          <li><strong>Load Inrush Curve:</strong> Select C-curve for standard motors and D-curve for transformers or high-surge inductive loads.</li>
          <li><strong>Service Breaking Ratio (Ics vs Icu):</strong> In continuous industrial facilities, specify breakers where Ics = 100% Icu per IS/IEC 60947-2.</li>
          <li><strong>Enclosure &amp; Mounting:</strong> Confirm DIN-rail vs fixed vs drawout execution matching panel space.</li>
        </ol>

        <div style="background:#f8fafc;padding:16px 20px;border-radius:10px;border:1px solid #e2e8f0;display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
          <span style="font-size:13px;font-weight:700;color:#0f172a;">Engineering Resources:</span>
          <a href="/blog/mcb-vs-mccb-vs-acb-guide" style="color:#c56718;font-size:13px;font-weight:700;text-decoration:none;">MCB vs MCCB vs ACB Guide &rarr;</a>
          <a href="/blog/breaker-breaking-capacity-icu-vs-ics" style="color:#c56718;font-size:13px;font-weight:700;text-decoration:none;">Breaking Capacity Explained &rarr;</a>
          <a href="/enquire" style="color:#c56718;font-size:13px;font-weight:700;text-decoration:none;">Switchgear Quotations &rarr;</a>
        </div>
      </section>
    `;
  }
  if (slug === "glands" || slug === "lugs") {
    return `
      <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:28px;">
        <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:16px;">Cable Accessories Engineering Checklist</h2>
        <ol style="margin:0 0 24px 0;padding-left:24px;font-size:14px;line-height:1.75;color:#334155;">
          <li><strong>Measure True Cable OD:</strong> Match overall sheath diameter and under-armour diameter to gland range.</li>
          <li><strong>Verify Gland Compression Style:</strong> Use double compression brass glands for hazardous industrial zones requiring IP66 ingress protection and mechanical armour grip.</li>
          <li><strong>Select Correct Lug Barrel:</strong> Long barrel lugs for heavy vibration industrial motors; standard barrel for panel distribution boards.</li>
          <li><strong>Prevent Galvanic Corrosion:</strong> Use heavy electro-tinned copper lugs with contact grease when terminating aluminium cables to copper busbars.</li>
        </ol>
        <div style="background:#f8fafc;padding:16px 20px;border-radius:10px;border:1px solid #e2e8f0;display:flex;gap:16px;flex-wrap:wrap;align-items:center;">
          <span style="font-size:13px;font-weight:700;color:#0f172a;">Engineering Resources:</span>
          <a href="/blog/cable-gland-and-lug-size-selection-chart" style="color:#c56718;font-size:13px;font-weight:700;text-decoration:none;">Lug &amp; Gland Compatibility Chart &rarr;</a>
          <a href="/calculator" style="color:#c56718;font-size:13px;font-weight:700;text-decoration:none;">Cable Sizing Tool &rarr;</a>
        </div>
      </section>
    `;
  }
  return "";
}

function renderCategorySpecRows(catSlug: string, p: any, specs: Record<string, any>, standardsText: string | null): string {
  const rows: Array<{ label: string; value: string }> = [];

  rows.push({ label: "Brand", value: p.brand || "Polycab" });
  if (p.size) rows.push({ label: "Size / Dimensions", value: p.size });

  if (catSlug === "wire-cables") {
    if (specs.cores) rows.push({ label: "Cores", value: specs.cores });
    if (p.material) rows.push({ label: "Conductor Material", value: p.material });
    if (specs.typeOfArmour) rows.push({ label: "Armour Type", value: specs.typeOfArmour });
    if (specs.insulationType) rows.push({ label: "Insulation Material", value: specs.insulationType });
    if (specs.innerSheathMaterial) rows.push({ label: "Inner Sheath", value: specs.innerSheathMaterial });
    if (specs.outerSheathMaterial) rows.push({ label: "Outer Sheath", value: specs.outerSheathMaterial });
    if (specs.voltageRating) rows.push({ label: "Voltage Rating", value: specs.voltageRating });
    if (specs.currentRatingAmp) rows.push({ label: "Current Rating", value: `${specs.currentRatingAmp} A` });
    if (specs.conductorClass) rows.push({ label: "Conductor Class", value: specs.conductorClass });
    if (specs.color) rows.push({ label: "Core Color", value: specs.color });
    if (standardsText) rows.push({ label: "Compliance Standard", value: standardsText });
  } else if (catSlug === "switch-gears") {
    if (specs.polesPhase) rows.push({ label: "Poles / Configuration", value: specs.polesPhase });
    if (specs.currentRatingA) rows.push({ label: "Current Rating (In)", value: specs.currentRatingA.replace(/^ew\s+/i, "").trim() });
    if (specs.breakingCapacityKa) rows.push({ label: "Breaking Capacity (Icu)", value: `${specs.breakingCapacityKa} kA` });
    if (specs.voltageRatingV) rows.push({ label: "Rated Operational Voltage (Ue)", value: specs.voltageRatingV });
    if (specs.tripCurve) rows.push({ label: "Tripping Curve", value: specs.tripCurve });
    if (specs.sensitivityMa) rows.push({ label: "Sensitivity / Residual Current", value: specs.sensitivityMa });
    if (specs.executionMounting) rows.push({ label: "Mounting Style", value: specs.executionMounting });
    if (specs.frameSize) rows.push({ label: "Frame Size", value: specs.frameSize });
    if (standardsText) rows.push({ label: "Standard", value: standardsText });
  } else if (catSlug === "glands") {
    if (specs.compressionType) rows.push({ label: "Gland Type", value: specs.compressionType });
    if (specs.sizeCode) rows.push({ label: "Size Code", value: specs.sizeCode });
    if (specs.sizeInch) rows.push({ label: "Thread Size (Inch)", value: specs.sizeInch });
    if (specs.suitableCableOdMm) rows.push({ label: "Suitable Cable OD Range", value: `${specs.suitableCableOdMm} mm` });
    if (specs.nippleThread) rows.push({ label: "Nipple Thread", value: specs.nippleThread });
    if (specs.packingPerBoxPcs) rows.push({ label: "Packaging Per Box", value: `${specs.packingPerBoxPcs} pcs` });
    if (standardsText) rows.push({ label: "Standard", value: standardsText });
  } else if (catSlug === "lugs") {
    if (specs.material || p.material) rows.push({ label: "Material & Plating", value: specs.material || p.material });
    if (specs.lugType) rows.push({ label: "Lug Design Type", value: specs.lugType });
    if (specs.barrelStyle) rows.push({ label: "Barrel Style", value: specs.barrelStyle });
    if (specs.sizeRange) rows.push({ label: "Conductor Size Range", value: specs.sizeRange });
    if (standardsText) rows.push({ label: "Standard", value: standardsText });
  } else if (catSlug === "solar") {
    if (specs.watt) rows.push({ label: "Rated Wattage", value: specs.watt });
    if (specs.efficiency) rows.push({ label: "Module / Cable Efficiency", value: specs.efficiency });
    if (specs.current60CAmp) rows.push({ label: "Max Current at 60°C", value: `${specs.current60CAmp} A` });
    if (specs.current40CAmp) rows.push({ label: "Max Current at 40°C", value: `${specs.current40CAmp} A` });
    if (p.material) rows.push({ label: "Conductor Material", value: p.material });
    if (standardsText) rows.push({ label: "Standard Conformance", value: standardsText });
  } else if (catSlug === "conduit") {
    if (specs.mechanicalStress) rows.push({ label: "Mechanical Duty", value: specs.mechanicalStress });
    if (specs.color) rows.push({ label: "Color", value: specs.color });
    if (specs.standardPack) rows.push({ label: "Standard Bundle Pack", value: specs.standardPack });
    if (standardsText) rows.push({ label: "Standard", value: standardsText });
  } else if (catSlug === "earthing-material") {
    if (p.material) rows.push({ label: "Material Composition", value: p.material });
    if (specs.primaryApplication) rows.push({ label: "Primary Application", value: specs.primaryApplication });
    if (standardsText) rows.push({ label: "Standard", value: standardsText });
  } else if (catSlug === "wiring-device") {
    if (specs.voltageRating) rows.push({ label: "Voltage Rating", value: specs.voltageRating });
    if (specs.currentRating) rows.push({ label: "Current Rating", value: specs.currentRating });
    if (specs.application) rows.push({ label: "Application Type", value: specs.application });
  } else {
    if (p.material) rows.push({ label: "Material", value: p.material });
    if (specs.voltageRating) rows.push({ label: "Voltage Rating", value: specs.voltageRating });
    if (standardsText) rows.push({ label: "Standard", value: standardsText });
  }

  if (p.moq) rows.push({ label: "Minimum Order Quantity", value: p.moq });
  rows.push({ label: "Dispatch Warehouse", value: "Aslali Logistics Hub, Ahmedabad (382427)" });

  return rows
    .map(
      (r) =>
        `<tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">${escapeXml(r.label)}</td><td style="padding:10px 0;font-weight:600;color:#0f172a;text-align:right;">${escapeXml(r.value)}</td></tr>`
    )
    .join("");
}

function renderProductQuestionBank(p: any, specs: Record<string, any>, catSlug: string, standardsText: string | null): string {
  const qas: Array<{ q: string; a: string }> = [];

  if (catSlug === "wire-cables") {
    if (standardsText) {
      qas.push({
        q: `Which standard does ${p.brand || "this"} ${p.name} comply with?`,
        a: `This cable is manufactured and certified in compliance with ${standardsText}. Consignments include original Manufacturer Test Certificates (MTC) verifying conductor resistance, insulation tensile strength, and spark test compliance.`,
      });
    }
    if (specs.voltageRating) {
      qas.push({
        q: `What is the voltage grade for this cable?`,
        a: `This cable is rated for operational service at ${specs.voltageRating}, suitable for industrial distribution boards, motor feeders, and utility grid connections.`,
      });
    }
    if (p.material && specs.typeOfArmour) {
      qas.push({
        q: `What conductor material and armouring are specified?`,
        a: `It features high-conductivity ${p.material} conductor with ${specs.typeOfArmour} mechanical protection, designed for continuous installation in trays, ducts, or direct underground burial.`,
      });
    }
    if (specs.currentRatingAmp) {
      qas.push({
        q: `What is the continuous current rating?`,
        a: `The rated continuous current capacity is ${specs.currentRatingAmp} A under standard installation conditions. Actual operating ampacity depends on ambient temperature, burial depth, and grouping derating factors.`,
      });
    }
  } else if (catSlug === "switch-gears") {
    if (specs.breakingCapacityKa && specs.currentRatingA) {
      qas.push({
        q: `What is the breaking capacity and operational current of this switchgear?`,
        a: `This switchgear is rated at ${specs.currentRatingA.replace(/^ew\s+/i, "").trim()} with a short-circuit breaking capacity of ${specs.breakingCapacityKa} kA (Icu per IS/IEC 60947-2), providing high-fault thermal protection.`,
      });
    }
    if (specs.polesPhase) {
      qas.push({
        q: `How many poles does this unit feature?`,
        a: `This unit is configured with ${specs.polesPhase} isolation, suitable for 3-phase commercial and industrial distribution boards.`,
      });
    }
  } else if (catSlug === "glands") {
    if (specs.suitableCableOdMm) {
      qas.push({
        q: `What cable outer diameter (OD) does this gland accommodate?`,
        a: `This gland accommodates cable outer diameters from ${specs.suitableCableOdMm} mm, providing secure IP-grade ingress protection and mechanical strain relief.`,
      });
    }
  } else if (catSlug === "lugs") {
    if (specs.sizeRange || p.size) {
      qas.push({
        q: `What cable cross-section does this lug fit?`,
        a: `This lug is engineered for ${specs.sizeRange || p.size} conductors, manufactured from high-conductivity electrolytic copper with heavy tin plating to prevent galvanic corrosion.`,
      });
    }
  } else if (catSlug === "solar") {
    if (standardsText) {
      qas.push({
        q: `Which solar PV standards does this product meet?`,
        a: `It meets ${standardsText} (e.g. EN 50618 / IEC 62930) for 1500V DC solar installations with halogen-free flame retardancy and UV ozone resistance.`,
      });
    }
  }

  qas.push({
    q: `How can contractors and industrial buyers request a quotation or purchase?`,
    a: `Submit an RFQ online via our quotation desk, call +91 9512365582, or email sales@volampelektrikals.com with your BOM. Volamp Elektrikals dispatches wholesale orders directly from our central Aslali terminal in Ahmedabad with complete tax invoice and MTC documentation.`,
  });

  const qasHtml = qas
    .map(
      (item) => `
      <div style="margin-bottom:20px;padding:16px 20px;background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;">
        <h3 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 8px 0;">${escapeXml(item.q)}</h3>
        <p style="font-size:13.5px;line-height:1.65;color:#475569;margin:0;">${escapeXml(item.a)}</p>
      </div>
    `
    )
    .join("");

  return `
    <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:28px;">
      <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin-bottom:16px;">Frequently Asked Technical Questions</h2>
      ${qasHtml}
    </section>
  `;
}

function renderHowToOrderBlock(productName: string, moq: string | null | undefined): string {
  return `
    <section style="margin-top:32px;background:#fff8f1;border:1px solid #fed7aa;border-radius:12px;padding:24px;">
      <h2 style="font-size:18px;font-weight:700;color:#9a3412;margin:0 0 12px 0;">B2B Wholesale Ordering &amp; Delivery</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:16px;font-size:13px;line-height:1.6;color:#431407;">
        <div>
          <strong>1. RFQ &amp; Quotations:</strong>
          <p style="margin:4px 0 0 0;">Upload or send your Bill of Materials (BOM) to <a href="mailto:sales@volampelektrikals.com" style="color:#c56718;font-weight:bold;text-decoration:none;">sales@volampelektrikals.com</a> for project pricing and manufacturer test certificate (MTC) confirmation.</p>
        </div>
        <div>
          <strong>2. Instant WhatsApp / Phone Desk:</strong>
          <p style="margin:4px 0 0 0;">Call or message our sales team at <a href="tel:+919512365582" style="color:#c56718;font-weight:bold;text-decoration:none;">+91 9512365582</a> for instant stock status and cut-length drum availability.</p>
        </div>
        <div>
          <strong>3. Packing &amp; Dispatch:</strong>
          <p style="margin:4px 0 0 0;">Standard MOQ: <strong>${escapeXml(moq || "Standard Wholesale Packing")}</strong>. Same-day dispatch to Ahmedabad GIDC hubs (Vatva, Naroda, Sanand, Changodar) and express freight across Gujarat and India.</p>
        </div>
      </div>
    </section>
  `;
}

function renderRelatedProducts(allProducts: any[], currentProduct: any): string {
  const currentCat = (currentProduct.category || "").toLowerCase();
  const related = allProducts
    .filter((p) => p.productId !== currentProduct.productId && (p.category || "").toLowerCase() === currentCat)
    .slice(0, 3);

  if (related.length === 0) return "";

  const itemsHtml = related
    .map(
      (p) => `
      <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
        <h4 style="font-size:14px;margin:0 0 6px 0;font-weight:700;"><a href="/product/${encodeURIComponent(p.productId)}" style="color:#0f172a;text-decoration:none;">${escapeXml(p.name)}</a></h4>
        <p style="font-size:12px;color:#64748b;margin:0 0 8px 0;">Brand: ${escapeXml(p.brand || "Polycab")} • ${escapeXml(p.size || "")}</p>
        <a href="/product/${encodeURIComponent(p.productId)}" style="color:#c56718;font-size:12px;font-weight:700;text-decoration:none;">View Specifications &rarr;</a>
      </div>
    `
    )
    .join("");

  return `
    <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:28px;">
      <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin-bottom:16px;">Related Products in this Category</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:16px;">
        ${itemsHtml}
      </div>
    </section>
  `;
}

function escapeXml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getCanonicalCategorySlug(category?: string): string {
  const norm = (category || "").toLowerCase();
  if (norm.includes("wire") || norm.includes("cable")) return "wire-cables";
  if (norm.includes("switch")) return "switch-gears";
  if (norm.includes("solar")) return "solar";
  if (norm.includes("lug")) return "lugs";
  if (norm.includes("gland")) return "glands";
  if (norm.includes("conduit") || norm.includes("pipe")) return "conduit";
  if (norm.includes("earth")) return "earthing-material";
  if (norm.includes("device") || norm.includes("wiring")) return "wiring-device";
  return "wire-cables";
}

function extractVerifiedStandards(product: { description?: string | null; specifications?: string | null }): string | null {
  const text = `${product.description || ""} ${product.specifications || ""}`;
  const found: string[] = [];

  if (/IS[\s:]*7098\s*\(?Part\s*2\)?/i.test(text)) {
    found.push("IS 7098 (Part 2)");
  } else if (/IS[\s:]*7098\s*\(?Part\s*1\)?/i.test(text) || (/IS[\s:]*7098/i.test(text) && /XLPE/i.test(text))) {
    found.push("IS 7098 (Part 1)");
  } else if (/IS[\s:]*7098/i.test(text)) {
    found.push("IS 7098");
  }

  if (/IS[\s:]*1554/i.test(text)) {
    found.push("IS 1554 (Part 1)");
  }

  if (/IS[\s:]*694/i.test(text)) {
    found.push("IS 694");
  }

  if (/EN[\s:]*50618/i.test(text) || /IEC[\s:]*62930/i.test(text)) {
    found.push("EN 50618 / IEC 62930");
  }

  if (/IEC[\s:]*60947/i.test(text)) {
    found.push("IEC 60947-2");
  }

  if (/IS[\s:]*8337/i.test(text) || /DIN[\s:]*46235/i.test(text)) {
    found.push("IS 8337 / DIN 46235");
  }

  if (/BS[\s:]*6121/i.test(text) || /EN[\s:]*50262/i.test(text)) {
    found.push("BS 6121 / EN 50262");
  }

  if (/IS[\s:]*3043/i.test(text)) {
    found.push("IS 3043");
  }

  if (/IS[\s:]*9537/i.test(text)) {
    found.push("IS 9537");
  }

  return found.length > 0 ? found.join(", ") : null;
}

let _indexTemplateCache: string | null = null;

function loadBaseTemplate(): string {
  if (_indexTemplateCache) return _indexTemplateCache;

  const isDev = process.env.NODE_ENV !== "production";
  const candidates = isDev
    ? [
        path.resolve(process.cwd(), "client/index.html"),
        path.join(__dirname, "../../client/index.html"),
        path.join(__dirname, "../client/index.html"),
        path.resolve(process.cwd(), "dist/public/index.html"),
      ]
    : [
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
  ogImage,
  ogType,
}: {
  title: string;
  description: string;
  canonical: string;
  noIndex?: boolean;
  bodyHtml: string;
  schemaJson?: string;
  ogImage?: string;
  ogType?: string;
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
  if (ogType) {
    template = template.replace(
      /<meta\s+property="og:type"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:type" content="${escapeXml(ogType)}" />`
    );
  }
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

  // If a verified direct image URL is provided (e.g. non-Google Drive CDN asset), replace OG image
  if (ogImage) {
    const escapedImg = escapeXml(ogImage);
    template = template.replace(
      /<meta\s+property="og:image"\s+content=".*?"\s*\/?>/i,
      `<meta property="og:image" content="${escapedImg}" />`
    );
    template = template.replace(
      /<meta\s+name="twitter:image"\s+content=".*?"\s*\/?>/i,
      `<meta name="twitter:image" content="${escapedImg}" />`
    );
  }

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
    /<div id="root">[\s\S]*?<\/div>(?=\s*(?:<script|<\/body>))/,
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

  const rawPath = (req.originalUrl ? req.originalUrl.split("?")[0] : req.path) || "/";

  // Skip static assets, TRPC, and API routes
  if (
    rawPath.startsWith("/api/") ||
    rawPath.startsWith("/trpc/") ||
    rawPath.startsWith("/assets/") ||
    rawPath.startsWith("/videos/") ||
    rawPath.startsWith("/storage-proxy/") ||
    rawPath === "/sitemap.xml" ||
    rawPath === "/robots.txt" ||
    rawPath === "/google-merchant-feed.xml" ||
    rawPath === "/llms.txt" ||
    rawPath === "/llms-full.txt" ||
    (!rawPath.startsWith("/product/") && /\.(js|css|json|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|pdf|map|mp4|webm|mov|m4v|ogg)$/i.test(rawPath))
  ) {
    return next();
  }

  const cleanPath = rawPath.replace(/^\/+|\/+$/g, ""); // "" for home, "products" for /products

  // AEO / GEO Discovery Header: Announce authoritative machine knowledge manifest to AI engines
  res.setHeader(
    "Link",
    '<https://www.volampelektrikals.com/llms-full.txt>; rel="describedby", <https://www.volampelektrikals.com/llms.txt>; rel="help"'
  );

  // =========================================================================
  // 1. DYNAMIC ROUTE: /product/:id (HTML) and /product/:id.json (AEO/GEO Feed)
  // =========================================================================
  if (cleanPath.startsWith("product/")) {
    const isJsonFeed = cleanPath.endsWith(".json");
    const rawId = cleanPath.replace(/^product\//, "").replace(/\.json$/, "").trim();
    const product = getProductByProductId(rawId);

    if (!product) {
      if (isJsonFeed) {
        return res.status(404).json({ success: false, error: `Product '${rawId}' not found in Volamp catalog.` });
      }
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
    let parsedSpecs: Record<string, any> = {};
    try {
      if (typeof product.specifications === "string") {
        parsedSpecs = JSON.parse(product.specifications || "{}");
      } else if (product.specifications) {
        parsedSpecs = product.specifications as Record<string, any>;
      }
    } catch (e) {
      parsedSpecs = {};
    }

    const brandPrefix = product.brand && !product.name.toLowerCase().includes(product.brand.toLowerCase()) ? `${product.brand} ` : "";
    const sizeSuffix = product.size && !product.name.toLowerCase().includes(product.size.toLowerCase()) ? ` (${product.size})` : "";
    let fullName = `${brandPrefix}${product.name}${sizeSuffix}`.trim();

    // Collect verified distinguishing attributes (Color, Poles, Current, Sensitivity, Voltage)
    const distinguishingAttrs: string[] = [];
    if (parsedSpecs.color && !fullName.toLowerCase().includes(parsedSpecs.color.toLowerCase())) {
      distinguishingAttrs.push(parsedSpecs.color.toUpperCase());
    }
    if (parsedSpecs.currentRatingA && !fullName.toLowerCase().includes(parsedSpecs.currentRatingA.toLowerCase())) {
      const cleanAmp = parsedSpecs.currentRatingA.replace(/^ew\s+/i, "").trim();
      if (cleanAmp) distinguishingAttrs.push(cleanAmp);
    }
    if (parsedSpecs.sensitivityMa && !fullName.toLowerCase().includes(parsedSpecs.sensitivityMa.toLowerCase())) {
      distinguishingAttrs.push(parsedSpecs.sensitivityMa);
    }
    if (parsedSpecs.polesPhase && !fullName.toLowerCase().includes(parsedSpecs.polesPhase.toLowerCase())) {
      distinguishingAttrs.push(parsedSpecs.polesPhase);
    }
    if (parsedSpecs.voltageRating && !fullName.toLowerCase().includes(parsedSpecs.voltageRating.toLowerCase())) {
      distinguishingAttrs.push(parsedSpecs.voltageRating);
    }

    const fullDisplayName = distinguishingAttrs.length > 0
      ? `${fullName} - ${distinguishingAttrs.join(", ")}`
      : fullName;

    // Unique page title including verified product ID (resolves duplicate title groups)
    const uniquePageTitle = `${fullDisplayName} (${product.productId}) | Volamp Elektrikals Ahmedabad`;

    // Filter out Google Drive HTML viewer links for valid image representation
    const rawImg = product.imageUrl || "";
    const isDriveImg = rawImg.includes("drive.google.com");
    const validImgUrl = (rawImg && !isDriveImg)
      ? (rawImg.startsWith("http") ? rawImg : `${BASE_URL}${rawImg}`)
      : `${BASE_URL}/volamp-og-image.jpg`;

    const rawPrice =
      product.numericPrice ||
      (typeof product.price === "string" ? parseFloat(product.price.replace(/[^0-9.]/g, "")) : 0);
    const hasPrice = rawPrice > 0;
    const priceFormatted = hasPrice
      ? rawPrice.toLocaleString("en-IN", { style: "currency", currency: "INR" })
      : "Price on Request / RFQ";
    const productUrl = `${BASE_URL}/product/${encodeURIComponent(product.productId)}`;

    // Verified standards and canonical category slug
    const standardsText = extractVerifiedStandards(product);
    const canonicalCatSlug = getCanonicalCategorySlug(product.category);
    const isInStock = Boolean(product.availability && /in stock|available/i.test(product.availability));

    // Dedicated Machine-Readable JSON Feed for AI Search Engines & Bots (/product/:id.json)
    if (isJsonFeed) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.json({
        "@context": "https://schema.org",
        "@type": "Product",
        entity: "Volamp Electrical Product Factsheet",
        productId: product.productId,
        sku: product.productId,
        name: fullDisplayName,
        brand: product.brand || "Polycab",
        category: product.category || "Wires & Cables",
        subcategory: product.subcategory || "Industrial Cable",
        size: product.size || undefined,
        material: product.material || undefined,
        voltageRating: parsedSpecs.voltageRating || undefined,
        unit: product.unit || undefined,
        moq: product.moq || undefined,
        priceInr: rawPrice > 0 ? rawPrice : "Price on Request / RFQ",
        availability: isInStock ? "In Stock - Aslali Central Hub, Ahmedabad" : "Available on Order",
        standardsCompliance: standardsText || undefined,
        distributor: {
          name: "VOLAMP ELEKTRIKALS PRIVATE LIMITED",
          cin: "U31900GJ2021PTC122730",
          gstin: "24AAICV0754B1ZO",
          legacy: "Family electrical legacy established in 1964; incorporated 2021",
          corporateOffice: "1753, Dhobi's Pole Sir, Chinubhai Rd, Old City, Khadia, Ahmedabad, Gujarat 380001",
          centralWarehouse: "Near NH-48 & SP Ring Road Junction, Aslali, Ahmedabad, Gujarat 382427",
          contactPhone: "+91 9512365582",
          rfqEmail: "sales@volampelektrikals.com"
        },
        canonicalUrl: productUrl,
        rfqUrl: `${BASE_URL}/enquire?product=${encodeURIComponent(fullDisplayName)}`
      });
    }

    // Product Schema Entity (Clean, standards-compliant, unit-specified, zero invented fields)
    const productEntity: Record<string, any> = {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${productUrl}#product`,
      "name": fullDisplayName,
      "image": validImgUrl,
      "description": product.description || `${fullDisplayName} industrial electrical supply from Volamp Elektrikals Ahmedabad.`,
      "sku": product.productId,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "Polycab",
      },
    };

    const additionalProps: Array<{ "@type": "PropertyValue"; name: string; value: string }> = [];
    if (product.size) additionalProps.push({ "@type": "PropertyValue", name: "Size", value: product.size });
    if (product.material) additionalProps.push({ "@type": "PropertyValue", name: "Conductor Material", value: product.material });
    if (parsedSpecs.voltageRating) additionalProps.push({ "@type": "PropertyValue", name: "Voltage Rating", value: parsedSpecs.voltageRating });
    if (standardsText) additionalProps.push({ "@type": "PropertyValue", name: "Compliance Standard", value: standardsText });
    if (product.unit) additionalProps.push({ "@type": "PropertyValue", name: "Unit", value: product.unit });
    if (product.moq) additionalProps.push({ "@type": "PropertyValue", name: "MOQ", value: product.moq });

    if (additionalProps.length > 0) {
      productEntity.additionalProperty = additionalProps;
    }

    // Omit offers schema if there is no public price (P1 guardrail: no invented prices)
    if (hasPrice) {
      productEntity.offers = {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "INR",
        "price": rawPrice.toFixed(2),
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": rawPrice.toFixed(2),
          "priceCurrency": "INR",
          "unitText": product.unit || "Per Meter"
        },
        "availability": isInStock ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
        "itemCondition": "https://schema.org/NewCondition",
        "priceValidUntil": "2027-12-31",
        "seller": {
          "@type": "Organization",
          "name": "VOLAMP ELEKTRIKALS PRIVATE LIMITED",
          "url": BASE_URL,
          "telephone": "+919512365582"
        }
      };
    }

    const schema = JSON.stringify(productEntity);

    const allProducts = loadProductsFromDisk();
    const directFactualDescription = buildDirectFactualDescription(product, fullDisplayName, parsedSpecs, standardsText, canonicalCatSlug);
    const specRowsHtml = renderCategorySpecRows(canonicalCatSlug, product, parsedSpecs, standardsText);
    const qasHtml = renderProductQuestionBank(product, parsedSpecs, canonicalCatSlug, standardsText);
    const howToOrderHtml = renderHowToOrderBlock(fullDisplayName, product.moq);
    const relatedHtml = renderRelatedProducts(allProducts, product);

    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: uniquePageTitle,
      description: `Buy ${fullDisplayName} (${product.productId}). Genuine ${product.brand || "Polycab"} industrial electrical supply with verified specifications. Wholesale dispatch from Ahmedabad across India.`,
      canonical: productUrl,
      schemaJson: schema,
      ogImage: validImgUrl,
      ogType: "product",
      bodyHtml: `
        <article style="font-family:system-ui,-apple-system,sans-serif;max-width:1100px;margin:40px auto;padding:24px;color:#1e293b;">
          <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
            <a href="/" style="color:#64748b;text-decoration:none;">Home</a> &gt;
            <a href="/products" style="color:#64748b;text-decoration:none;">Products</a> &gt;
            <a href="/category/${canonicalCatSlug}" style="color:#64748b;text-decoration:none;">${escapeXml(product.category || "Wires & Cables")}</a> &gt;
            <span style="color:#0f172a;font-weight:600;">${escapeXml(fullDisplayName)}</span>
          </nav>
          <header style="border-bottom:1px solid #e2e8f0;padding-bottom:24px;margin-bottom:28px;">
            <div style="display:inline-block;padding:4px 10px;background:#fef3c7;color:#92400e;font-size:12px;font-weight:700;border-radius:6px;margin-bottom:12px;">
              ${escapeXml(product.brand || "Polycab")} • Wholesale Stock
            </div>
            <h1 style="font-size:28px;font-weight:800;color:#0f172a;line-height:1.3;margin:0 0 12px 0;">${escapeXml(fullDisplayName)} (${escapeXml(product.productId)})</h1>
            <p style="font-size:14px;color:#64748b;margin:0 0 16px 0;">
              Product ID: <strong style="font-family:monospace;color:#0f172a;">${escapeXml(product.productId)}</strong> |
              SKU: <strong style="font-family:monospace;color:#0f172a;">${escapeXml(product.sku || product.productId)}</strong> |
              Category: <a href="/category/${canonicalCatSlug}" style="color:#c56718;font-weight:600;text-decoration:none;">${escapeXml(product.category || "Wires & Cables")}</a>
            </p>
            <p style="font-size:15px;line-height:1.7;color:#334155;margin:0;max-width:920px;">
              ${escapeXml(directFactualDescription)}
            </p>
          </header>
          <section style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:32px;margin-bottom:36px;">
            <div>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:20px;">
                <p style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;margin:0 0 6px 0;">B2B Wholesale Price (excl. GST)</p>
                <div style="font-size:32px;font-weight:900;color:#0f172a;">
                  ${priceFormatted} ${product.unit ? `<span style="font-size:14px;color:#64748b;font-weight:600;">/ ${escapeXml(product.unit)}</span>` : ""}
                </div>
                <p style="font-size:12px;color:${isInStock ? "#16a34a" : "#d97706"};font-weight:700;margin:8px 0 0 0;">
                  ${isInStock ? "✓ In Stock" : "Available on Order"} — Aslali Warehouse, Ahmedabad
                </p>
              </div>
              <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <a href="/enquire?product=${encodeURIComponent(fullDisplayName)}" style="background:#c56718;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;display:inline-block;">Request Quotation</a>
                <a href="/calculator" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;display:inline-block;">Calculate Voltage Drop</a>
              </div>
            </div>
            <div>
              <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 16px 0;">Product Specifications</h2>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tbody>
                  ${specRowsHtml}
                </tbody>
              </table>
            </div>
          </section>

          <!-- B2B Ordering & Delivery Card (Step 35) -->
          ${howToOrderHtml}

          <!-- Product Technical Question Bank (Steps 36-37) -->
          ${qasHtml}

          <!-- Related Category Products (Step 34) -->
          ${relatedHtml}

          <!-- Corporate Entity & Sourcing Assurance -->
          <section style="background:#f8fafc;padding:24px;border-radius:12px;border:1px solid #e2e8f0;margin-top:36px;font-size:13px;line-height:1.7;color:#475569;">
            <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin-top:0;">Supplied by Volamp Elektrikals Private Limited</h3>
            <p style="margin:0 0 10px 0;">
              ${escapeXml(fullDisplayName)} is supplied by <strong>VOLAMP ELEKTRIKALS PRIVATE LIMITED</strong> (CIN: U31900GJ2021PTC122730 | GSTIN: 24AAICV0754B1ZO | GeM Verified). Family electrical business legacy dating to 1964 in Ahmedabad.
            </p>
            <p style="margin:0;">
              Corporate office: <strong>1753 Khadia, Old City, Ahmedabad 380001</strong> | Central logistics terminal: <strong>Aslali Highway Terminal 382427</strong>. For project quotations or B2B commercial contracts, contact our sales desk at <a href="tel:+919512365582" style="color:#c56718;font-weight:bold;text-decoration:none;">+91 9512365582</a> or email <a href="mailto:sales@volampelektrikals.com" style="color:#c56718;font-weight:bold;text-decoration:none;">sales@volampelektrikals.com</a>.
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
          ${renderCategoryBuyerGuide(slug)}
          ${
            slug === "wire-cables"
              ? `
          <section style="background:#f8fafc;padding:24px;border-radius:12px;border:1px solid #e2e8f0;margin-top:36px;font-size:14px;line-height:1.7;color:#475569;">
            <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin-top:0;">Armoured &amp; Unarmoured Power Cable Suppliers in Ahmedabad</h2>
            <p>
              Volamp Elektrikals Private Limited is a leading wholesale distributor and supplier of LT XLPE and PVC insulated copper and aluminium unarmoured power cables (1.5 sqmm to 1000 sqmm) and heavy armoured cables in Ahmedabad, Gujarat. Sourcing directly from premier manufacturers including Polycab, Finolex, and KEI Industries, our unarmoured power and control cables conform to IS:694, IS:1554, and IS:7098 standards with original Manufacturer Test Certificates (MTC) and routine test reports. Express same-day dispatch to Vatva, Sanand, Naroda, and Changodar GIDC industrial zones, and 48–72h delivery across India from our Aslali logistics terminal.
            </p>
          </section>
              `
              : ""
          }
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
    const blog = BLOG_POSTS_DATA.find((p) => p.slug === slug);

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
    const blogArticleHtml = renderMarkdownToHtml(blog.content);

    const articleSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": blog.title,
      "description": blog.metaDescription || blog.excerpt,
      "author": {
        "@type": "Person",
        "name": blog.author,
        "jobTitle": blog.authorRole,
      },
      "publisher": {
        "@type": "Organization",
        "name": "VOLAMP ELEKTRIKALS PRIVATE LIMITED",
        "url": BASE_URL,
      },
      "datePublished": blog.date,
      "dateModified": blog.date,
      "mainEntityOfPage": `${BASE_URL}/blog/${slug}`,
    });

    const html = renderPageHtml({
      title: `${blog.title} | Volamp`,
      description: blog.metaDescription || blog.excerpt,
      canonical: `${BASE_URL}/blog/${slug}`,
      schemaJson: articleSchema,
      bodyHtml: `
        <article style="font-family:system-ui,-apple-system,sans-serif;max-width:920px;margin:40px auto;padding:24px;color:#1e293b;">
          <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
            <a href="/" style="color:#64748b;text-decoration:none;">Home</a> &gt;
            <a href="/blog" style="color:#64748b;text-decoration:none;">Blog</a> &gt;
            <span style="color:#0f172a;font-weight:600;">${escapeXml(blog.title)}</span>
          </nav>
          <header style="border-bottom:1px solid #e2e8f0;padding-bottom:24px;margin-bottom:32px;">
            <div style="display:inline-block;padding:4px 10px;background:#f1f5f9;color:#334155;font-size:12px;font-weight:700;border-radius:6px;margin-bottom:12px;">
              ${escapeXml(blog.category)} • ${escapeXml(blog.readTime)}
            </div>
            <h1 style="font-size:32px;font-weight:800;color:#0f172a;line-height:1.25;margin:0 0 16px 0;">${escapeXml(blog.title)}</h1>
            <p style="font-size:16px;line-height:1.7;color:#475569;margin:0 0 16px 0;">${escapeXml(blog.excerpt)}</p>
            <div style="font-size:13px;color:#64748b;">
              By <strong style="color:#0f172a;">${escapeXml(blog.author)}</strong> (${escapeXml(blog.authorRole)}) • Published ${escapeXml(blog.date)}
            </div>
          </header>

          <div class="article-content" style="font-size:15px;line-height:1.75;color:#334155;">
            ${blogArticleHtml}
          </div>

          <!-- Step 85: Next Steps Block (RFQ, Calculator, Contact) -->
          <section style="margin-top:48px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:28px;">
            <h3 style="font-size:18px;font-weight:700;color:#0f172a;margin-top:0;">Need Specific Cable Sizing or B2B Quotations?</h3>
            <p style="font-size:14px;line-height:1.6;color:#475569;margin-bottom:20px;">
              Volamp Elektrikals supplies genuine certified cables and switchgear conforming to IS 7098, IS 1554, and IEC standards from our central Aslali warehouse in Ahmedabad.
            </p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <a href="/calculator" style="background:#c56718;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">Calculate Voltage Drop</a>
              <a href="/enquire" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Request Project RFQ</a>
              <a href="tel:+919512365582" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Call +91 9512365582</a>
            </div>
          </section>
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
              <p style="font-size:13px;color:#64748b;margin:0;">LT / HT XLPE armoured &amp; unarmoured power cables (1.5 to 1000 sqmm), flexible FRLS building wires, control cables.</p>
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
            <li style="padding:8px 0;"><a href="/product/CAB-000736" style="color:#0f172a;font-weight:600;text-decoration:none;">1.1kV XLPE Aluminium Armoured Cable (3.5C x 185 sqmm)</a> — SKU: CAB-000736</li>
            <li style="padding:8px 0;"><a href="/product/SOL-000001" style="color:#0f172a;font-weight:600;text-decoration:none;">Solar DC Cable 1C x 4 sqmm (H1Z2Z2-K / EN 50618)</a> — SKU: SOL-000001</li>
            <li style="padding:8px 0;"><a href="/product/SWG-000001" style="color:#0f172a;font-weight:600;text-decoration:none;">10kA C-Curve Miniature Circuit Breaker (MCB) 4-Pole 63A</a> — SKU: SWG-000001</li>
          </ul>
        </section>
      `;
    } else if (cleanPath === "calculator") {
      homeExtraHtml = `
        <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:28px;">
          <h2 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:16px;">Engineering Calculation Formulas &amp; Standards (IS 7098 &amp; CEA)</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:20px;font-size:14px;line-height:1.7;color:#334155;">
            <div style="background:#f8fafc;padding:20px;border-radius:10px;border:1px solid #e2e8f0;">
              <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin-top:0;">3-Phase AC Voltage Drop Formula</h3>
              <p style="font-family:monospace;background:#ffffff;padding:8px 12px;border-radius:6px;border:1px solid #cbd5e1;font-weight:bold;color:#0f172a;">
                Vd = √3 × I × L × (R cos φ + X sin φ) / 1000
              </p>
              <p style="font-size:12px;color:#64748b;margin-bottom:0;">Where: I = Full Load Current (A), L = Length of run in meters, R = AC resistance (Ω/km at 90°C), X = Reactance (Ω/km), cos φ = Power factor (default 0.85).</p>
            </div>
            <div style="background:#f8fafc;padding:20px;border-radius:10px;border:1px solid #e2e8f0;">
              <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin-top:0;">1-Phase AC Voltage Drop Formula</h3>
              <p style="font-family:monospace;background:#ffffff;padding:8px 12px;border-radius:6px;border:1px solid #cbd5e1;font-weight:bold;color:#0f172a;">
                Vd = 2 × I × L × (R cos φ + X sin φ) / 1000
              </p>
              <p style="font-size:12px;color:#64748b;margin-bottom:0;">Per Central Electricity Authority (CEA) guidelines, maximum allowable voltage drop is 3% for branch circuits and 5% from transformer to remote sub-panels.</p>
            </div>
          </div>
          <div style="margin-top:20px;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:20px;">
            <h4 style="font-size:15px;font-weight:700;color:#991b1b;margin-top:0;">Engineering Disclaimer</h4>
            <p style="font-size:13px;line-height:1.65;color:#7f1d1d;margin-bottom:0;">
              Calculations provided by this tool are indicative preliminary engineering estimates based on IS 7098 (Part 1 &amp; 2) and IS 1554 reference data (standard 40°C air / 30°C ground ambient). Final conductor cross-sections, short-circuit ratings, grouping derating, and soil thermal resistivity factors must be verified by a licensed electrical design engineer for critical industrial installations.
            </p>
          </div>
        </section>
      `;
    } else if (cleanPath === "blog") {
      const articlesHtml = BLOG_POSTS_DATA.map(
        (b) => `
        <article style="background:#ffffff;padding:24px;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:8px;">
            <span style="font-size:12px;font-weight:700;background:#f1f5f9;color:#334155;padding:4px 10px;border-radius:6px;">${escapeXml(b.category)}</span>
            <span style="font-size:12px;color:#64748b;">${escapeXml(b.readTime)} • ${escapeXml(b.date)}</span>
          </div>
          <h2 style="font-size:20px;font-weight:800;color:#0f172a;margin:0 0 10px 0;">
            <a href="/blog/${b.slug}" style="color:#0f172a;text-decoration:none;">${escapeXml(b.title)}</a>
          </h2>
          <p style="font-size:14px;line-height:1.65;color:#475569;margin:0 0 16px 0;">
            ${escapeXml(b.excerpt)}
          </p>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:#64748b;">By <strong>${escapeXml(b.author)}</strong> (${escapeXml(b.authorRole)})</span>
            <a href="/blog/${b.slug}" style="color:#c56718;font-weight:700;font-size:13px;text-decoration:none;">Read Technical Guide &rarr;</a>
          </div>
        </article>
      `
      ).join("");

      homeExtraHtml = `
        <section style="margin-top:36px;">
          <h2 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:20px;">15 Authoritative Electrical Buyer Guides &amp; Specifications</h2>
          ${articlesHtml}
        </section>
      `;
    }

    // Structured LocalBusiness / Organization Schema for Home & Locations
    let pageSchemaJson: string | undefined = undefined;
    if (cleanPath === "") {
      pageSchemaJson = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": ["ElectricalSupplyStore", "WholesaleStore", "LocalBusiness"],
            "@id": "https://www.volampelektrikals.com/#organization",
            "name": "Volamp Elektrikals Private Limited",
            "alternateName": [
              "VOLAMP",
              "Volamp Elektrikals",
              "Volamp Wires and Cables Ahmedabad",
              "Volamp Switchgear & Lugs"
            ],
            "url": "https://www.volampelektrikals.com",
            "logo": "https://www.volampelektrikals.com/volamp-logo.png",
            "image": "https://www.volampelektrikals.com/team/volamp-khadia-storefront.jpg",
            "description": "Leading authorized distributor and wholesale supplier of industrial wires, power cables, switchgear, lugs, glands and earthing materials in Ahmedabad, Gujarat. Authorized distributor and channel partner for Polycab, Finolex, KEI, Schneider Electric, L&T, and Dowells.",
            "telephone": "+919512365582",
            "email": "sales@volampelektrikals.com",
            "priceRange": "$$",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "1753, Dhobi's Pole Sir, Chinubhai Rd, Old City, Khadia",
              "addressLocality": "Ahmedabad",
              "addressRegion": "Gujarat",
              "postalCode": "380001",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 23.0225,
              "longitude": 72.5950
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                "opens": "09:30",
                "closes": "19:30"
              }
            ],
            "hasMap": "https://maps.app.goo.gl/FPiAvDJEKCsxTLgT8?g_st=iw",
            "areaServed": [
              { "@type": "City", "name": "Ahmedabad" },
              { "@type": "State", "name": "Gujarat" },
              { "@type": "Country", "name": "India" }
            ],
            "sameAs": [
              "https://maps.app.goo.gl/FPiAvDJEKCsxTLgT8?g_st=iw",
              "https://maps.app.goo.gl/WgS6fp3TaEsH2GBU7",
              "https://www.linkedin.com/company/volampelektrikals/",
              "https://www.youtube.com/@cablezone",
              "https://x.com/volampelektrik",
              "https://www.instagram.com/volampp",
              "https://www.facebook.com/profile.php?id=61587485305483",
              "https://www.pinterest.com/volampelektrikals/"
            ],
            "knowsAbout": [
              "Armoured Cables",
              "Unarmoured Cables",
              "LT XLPE Power Cables",
              "HT XLPE Power Cables",
              "IS 7098",
              "IS 1554",
              "IS 694",
              "Polycab India",
              "Finolex Cables",
              "KEI Industries",
              "Schneider Electric"
            ],
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "reviewCount": "84",
              "bestRating": "5",
              "worstRating": "1"
            },
            "brand": [
              { "@type": "Brand", "name": "Polycab" },
              { "@type": "Brand", "name": "Finolex" },
              { "@type": "Brand", "name": "KEI Industries" },
              { "@type": "Brand", "name": "Schneider Electric" },
              { "@type": "Brand", "name": "L&T Switchgear" },
              { "@type": "Brand", "name": "Dowells" }
            ],
            "department": [
              {
                "@type": "Warehouse",
                "name": "Volamp Elektrikals - Central Warehouse & Dispatch Hub",
                "telephone": "+919512365582",
                "email": "logistics@volampelektrikals.com",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Near NH-48 & SP Ring Road Junction, Aslali",
                  "addressLocality": "Ahmedabad",
                  "addressRegion": "Gujarat",
                  "postalCode": "382427",
                  "addressCountry": "IN"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 22.9064,
                  "longitude": 72.5878
                },
                "openingHours": "Mo-Sa 08:00-20:00",
                "hasMap": "https://maps.app.goo.gl/WgS6fp3TaEsH2GBU7"
              }
            ]
          }
        ]
      });
    } else if (cleanPath === "branch-locations") {
      pageSchemaJson = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "LocalBusiness",
            "name": "Volamp Elektrikals Private Limited - Corporate Office",
            "telephone": "+919512365582",
            "email": "sales@volampelektrikals.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "1753, Dhobi's Pole Sir, Chinubhai Rd, Old City, Khadia",
              "addressLocality": "Ahmedabad",
              "addressRegion": "Gujarat",
              "postalCode": "380001",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 23.0225,
              "longitude": 72.5950
            },
            "openingHours": "Mo-Sa 09:30-19:30",
            "hasMap": "https://maps.app.goo.gl/FPiAvDJEKCsxTLgT8?g_st=iw"
          },
          {
            "@type": "Warehouse",
            "name": "Volamp Elektrikals - Aslali Central Fulfillment Hub",
            "telephone": "+919512365582",
            "email": "logistics@volampelektrikals.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Near NH-48 & SP Ring Road Junction, Aslali",
              "addressLocality": "Ahmedabad",
              "addressRegion": "Gujarat",
              "postalCode": "382427",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 22.9064,
              "longitude": 72.5878
            },
            "openingHours": "Mo-Sa 08:00-20:00",
            "hasMap": "https://maps.app.goo.gl/WgS6fp3TaEsH2GBU7"
          }
        ]
      });
    } else if (cleanPath.startsWith("dealers/")) {
      pageSchemaJson = JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": canonical,
            "url": canonical,
            "name": meta.title,
            "description": meta.description,
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": BASE_URL
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Dealers & Hubs",
                  "item": `${BASE_URL}/dealers`
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": meta.h1,
                  "item": canonical
                }
              ]
            },
            "provider": {
              "@type": ["ElectricalSupplyStore", "WholesaleStore", "LocalBusiness"],
              "@id": "https://www.volampelektrikals.com/#organization",
              "name": "Volamp Elektrikals Private Limited",
              "telephone": "+919512365582",
              "email": "sales@volampelektrikals.com",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "1753, Dhobi's Pole Sir, Chinubhai Rd, Old City, Khadia",
                "addressLocality": "Ahmedabad",
                "addressRegion": "Gujarat",
                "postalCode": "380001",
                "addressCountry": "IN"
              }
            }
          }
        ]
      });
    }

    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: meta.title,
      description: meta.description,
      canonical,
      schemaJson: pageSchemaJson,
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
  if (
    OTHER_VALID_PATHS.has(cleanPath) ||
    cleanPath.startsWith("employee-registration") ||
    cleanPath.startsWith("employee/register") ||
    cleanPath.startsWith("employee-register") ||
    cleanPath.startsWith("ceo-authorize") ||
    cleanPath.startsWith("ceo-authorization") ||
    cleanPath.startsWith("ceo/authorize") ||
    cleanPath.startsWith("ceo-approval") ||
    cleanPath.startsWith("ceo-approve")
  ) {
    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    let pageTitle = `${cleanPath.toUpperCase()} | Volamp Elektrikals`;
    let pageDesc = "Secure B2B electrical customer portal and ordering platform for Volamp Elektrikals.";
    if (
      cleanPath.startsWith("employee-registration") ||
      cleanPath.startsWith("employee/register") ||
      cleanPath.startsWith("employee-register")
    ) {
      pageTitle = "Official Employee Registration | Volamp Elektrikals";
      pageDesc = "Corporate employee onboarding and portal registration portal for VOLTAMP ELEKTRIKALS PVT. LTD.";
    } else if (
      cleanPath.startsWith("ceo-authorize") ||
      cleanPath.startsWith("ceo-authorization") ||
      cleanPath.startsWith("ceo/authorize") ||
      cleanPath.startsWith("ceo-approval") ||
      cleanPath.startsWith("ceo-approve")
    ) {
      pageTitle = "Executive CEO Authorization Desk | Volamp Elektrikals";
      pageDesc = "Executive email authorization and digital signing desk for VOLTAMP ELEKTRIKALS PVT. LTD.";
    }

    const html = renderPageHtml({
      title: pageTitle,
      description: pageDesc,
      canonical: `${BASE_URL}/${cleanPath}`,
      noIndex: true,
      bodyHtml: `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:60px auto;padding:24px;text-align:center;">
          <h1 style="font-size:28px;font-weight:800;color:#0f172a;">${escapeXml(pageTitle)}</h1>
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
