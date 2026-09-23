import type { Express, Request, Response } from "express";

export interface GoogleMerchantProduct {
  id: string;
  title: string;
  description: string;
  link: string;
  imageLink: string;
  price: string; // e.g. "118.00 INR"
  availability: "in_stock" | "out_of_stock" | "preorder";
  condition: "new";
  brand: string;
  category: string;
  googleProductCategory: string;
  mpn: string;
}

export const GOOGLE_MERCHANT_PRODUCTS: GoogleMerchantProduct[] = [
  // Core published products
  {
    id: "VLP-LV-001",
    title: "VOLAMP LV Power Cable (IS:7098 / IS:1554)",
    description: "Low-voltage power cable options for dependable building and plant distribution. Conductor 100% Electrolytic Copper / Aluminium.",
    link: "https://volampelektrikals.com/category/wire-cables",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "118.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Wires & Cables > Power Cables",
    googleProductCategory: "Hardware > Electrical Supplies > Wire & Cable",
    mpn: "VLP-LV-001",
  },
  {
    id: "VLP-IN-014",
    title: "VOLAMP Instrumentation Shielded Cable",
    description: "Shielded signal cabling for control rooms, process environments and automation systems with high EMI protection.",
    link: "https://volampelektrikals.com/category/wire-cables",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "142.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Wires & Cables > Instrumentation Cables",
    googleProductCategory: "Hardware > Electrical Supplies > Wire & Cable",
    mpn: "VLP-IN-014",
  },
  {
    id: "VLP-SL-022",
    title: "VOLAMP Solar DC Cable (1500V UV & Ozone Resistant)",
    description: "Purpose-built solar PV DC cable with cross-linked polyolefin insulation, EN 50618 certified for rooftop and utility solar plants.",
    link: "https://volampelektrikals.com/category/solar-renewable",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "76.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Renewable Energy > Solar Cables",
    googleProductCategory: "Hardware > Electrical Supplies > Wire & Cable",
    mpn: "VLP-SL-022",
  },
  {
    id: "VLP-BW-031",
    title: "VOLAMP Building Wire (FRLS Copper Single Core)",
    description: "Everyday flame retardant low smoke (FRLS) wiring for residential, commercial and contractor requirements.",
    link: "https://volampelektrikals.com/category/wire-cables",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "42.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Wires & Cables > Building Wires",
    googleProductCategory: "Hardware > Electrical Supplies > Wire & Cable",
    mpn: "VLP-BW-031",
  },
  {
    id: "VLP-CD-048",
    title: "VOLAMP Control & Data Cable (CCTV, LAN, Coaxial)",
    description: "Clear transmission connections for CCTV, LAN Cat6, telephone, and industrial automation networks.",
    link: "https://volampelektrikals.com/category/wire-cables",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "68.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Wires & Cables > Communication & Data Cables",
    googleProductCategory: "Hardware > Electrical Supplies > Wire & Cable",
    mpn: "VLP-CD-048",
  },

  // Wires & Cables subcategories
  {
    id: "VLP-SUB-FRLS-01",
    title: "VOLAMP Industrial Flexible FRLS Insulated Cable",
    description: "High-flexibility flame retardant low smoke copper multi-strand cable for industrial machinery and control panels.",
    link: "https://volampelektrikals.com/category/wire-cables",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "85.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Wires & Cables > Flexible Cables",
    googleProductCategory: "Hardware > Electrical Supplies > Wire & Cable",
    mpn: "VLP-FRLS-FLX",
  },
  {
    id: "VLP-SUB-SUBM-02",
    title: "VOLAMP 3 Core Flat Submersible Pump Cable",
    description: "Heavy-duty water-resistant flat submersible pump cable designed for continuous deep-well and agricultural submersible motors.",
    link: "https://volampelektrikals.com/category/wire-cables",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "165.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Wires & Cables > Submersible Cables",
    googleProductCategory: "Hardware > Electrical Supplies > Wire & Cable",
    mpn: "VLP-SUBM-3C",
  },
  {
    id: "VLP-SUB-CCTV-03",
    title: "VOLAMP CCTV Composite Video & Power Cable",
    description: "Shielded composite surveillance cable with power cores for crystal-clear security camera video feeds. Available in 90m, 180m, 300m coils.",
    link: "https://volampelektrikals.com/category/wire-cables",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "32.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Wires & Cables > CCTV Cables",
    googleProductCategory: "Hardware > Electrical Supplies > Wire & Cable",
    mpn: "VLP-CCTV-COMP",
  },
  {
    id: "VLP-SUB-COAX-04",
    title: "VOLAMP Low-Loss Co-Axial Cable (RG-59 / RG-6 / RG-11)",
    description: "Precision impedance RF coaxial cables for satellite TV, MATV, CATV, and telecommunication feeds.",
    link: "https://volampelektrikals.com/category/wire-cables",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "24.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Wires & Cables > Coaxial Cables",
    googleProductCategory: "Hardware > Electrical Supplies > Wire & Cable",
    mpn: "VLP-COAX-RG",
  },
  {
    id: "VLP-SUB-HTARM-05",
    title: "VOLAMP HT Armoured Power Cable (11kV / 33kV XLPE)",
    description: "Heavy-duty steel wire / strip armoured XLPE power distribution cable for underground sub-stations and heavy industrial plants.",
    link: "https://volampelektrikals.com/category/wire-cables",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "480.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Wires & Cables > Armoured Cables",
    googleProductCategory: "Hardware > Electrical Supplies > Wire & Cable",
    mpn: "VLP-HT-ARM",
  },

  // Switchgears
  {
    id: "VLP-SW-MCB-10",
    title: "VOLAMP Miniature Circuit Breakers (MCB 1P / 2P / 3P / 4P)",
    description: "IS/IEC 60898 compliant 10kA miniature circuit breakers for overload and short-circuit protection.",
    link: "https://volampelektrikals.com/category/switchgears",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "340.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Switchgear > Miniature Circuit Breakers",
    googleProductCategory: "Hardware > Electrical Supplies > Circuit Breakers",
    mpn: "VLP-SW-MCB",
  },
  {
    id: "VLP-SW-MCCB-11",
    title: "VOLAMP Moulded Case Circuit Breakers (MCCB 16A - 800A)",
    description: "Adjustable thermal-magnetic and microprocessor MCCBs for main distribution panels and industrial feeder boards.",
    link: "https://volampelektrikals.com/category/switchgears",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "2850.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Switchgear > Moulded Case Circuit Breakers",
    googleProductCategory: "Hardware > Electrical Supplies > Circuit Breakers",
    mpn: "VLP-SW-MCCB",
  },
  {
    id: "VLP-SW-RCCB-12",
    title: "VOLAMP Residual Current Circuit Breaker (RCCB / ELCB 30mA / 100mA)",
    description: "High-sensitivity earth leakage circuit breakers protecting human life from electrocution and preventing fire risks.",
    link: "https://volampelektrikals.com/category/switchgears",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "1850.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Switchgear > RCCB & Earth Leakage",
    googleProductCategory: "Hardware > Electrical Supplies > Circuit Breakers",
    mpn: "VLP-SW-RCCB",
  },

  // Earthing & Lightning
  {
    id: "VLP-EARTH-ROD-20",
    title: "VOLAMP Copper Bonded Earth Rod (250 Micron UL Listed)",
    description: "High molecularly bonded copper coated ground rod with high tensile carbon steel core for long-lasting corrosion resistance.",
    link: "https://volampelektrikals.com/category/earthing-lightning",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "850.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Earthing & Lightning > Earth Rods",
    googleProductCategory: "Hardware > Electrical Supplies > Earthing",
    mpn: "VLP-ER-CB250",
  },
  {
    id: "VLP-EARTH-CHEM-21",
    title: "VOLAMP Chemical Earthing Compound (Backfill Material 25kg)",
    description: "Highly conductive moisture-retaining chemical backfill compound compliant with IEEE-80 standards for low earth pit resistance.",
    link: "https://volampelektrikals.com/category/earthing-lightning",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "550.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Earthing & Lightning > Backfill Compound",
    googleProductCategory: "Hardware > Electrical Supplies > Earthing",
    mpn: "VLP-ER-CHEM25",
  },
  {
    id: "VLP-LIGHT-ARR-22",
    title: "VOLAMP Early Streamer Emission (ESE) Lightning Arrester",
    description: "Advanced active ESE lightning protection terminal for large-scale industrial plants, commercial towers, and substations.",
    link: "https://volampelektrikals.com/category/earthing-lightning",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "14500.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Earthing & Lightning > Lightning Arresters",
    googleProductCategory: "Hardware > Electrical Supplies > Earthing",
    mpn: "VLP-LA-ESE",
  },

  // Lugs & Glands
  {
    id: "VLP-LUG-CU-30",
    title: "VOLAMP Heavy Duty Copper Cable Lugs (1.5 sq mm to 1000 sq mm)",
    description: "Electrolytic tin-plated copper crimping terminal lugs for vibration-proof and low-resistance electrical connections.",
    link: "https://volampelektrikals.com/category/lugs-glands",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "18.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Lugs & Glands > Copper Cable Lugs",
    googleProductCategory: "Hardware > Electrical Supplies > Cable Terminals",
    mpn: "VLP-LG-CULUG",
  },
  {
    id: "VLP-GLAND-BR-31",
    title: "VOLAMP Brass Double Compression Cable Gland (Weatherproof & Flameproof)",
    description: "Precision nickel-plated brass double compression cable gland with neoprene rubber seals for armoured cables in hazardous areas.",
    link: "https://volampelektrikals.com/category/lugs-glands",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "165.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Lugs & Glands > Cable Glands",
    googleProductCategory: "Hardware > Electrical Supplies > Cable Glands",
    mpn: "VLP-LG-BRDC",
  },

  // Industrial Electricals
  {
    id: "VLP-IND-PLUG-40",
    title: "VOLAMP Industrial Plug & Socket IP67 (16A / 32A / 63A)",
    description: "Heavy-duty waterproof and dustproof pin-and-sleeve industrial connector for construction sites and plant machinery.",
    link: "https://volampelektrikals.com/category/industrial-electricals",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "420.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Industrial Electricals > Plugs & Sockets",
    googleProductCategory: "Hardware > Electrical Supplies > Plugs & Outlets",
    mpn: "VLP-IE-IP67",
  },
  {
    id: "VLP-IND-CONTR-41",
    title: "VOLAMP Industrial 3-Pole Power Contactor with Thermal Overload",
    description: "Heavy-duty AC3 duty power contactor for electric motor starting, DOL starters, and industrial automation panels.",
    link: "https://volampelektrikals.com/category/industrial-electricals",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "1250.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Industrial Electricals > Contactors & Relays",
    googleProductCategory: "Hardware > Electrical Supplies > Contactors",
    mpn: "VLP-IE-CONTR",
  },

  // Solar & Renewable
  {
    id: "VLP-SOL-MC4-50",
    title: "VOLAMP Solar MC4 Connectors Male & Female Pair (IP68 1500V DC)",
    description: "TUV certified weatherproof MC4 solar panel wire connectors with snap-in lock for solar PV array installations.",
    link: "https://volampelektrikals.com/category/solar-renewable",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "48.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Solar & Renewable > Solar Connectors",
    googleProductCategory: "Hardware > Electrical Supplies > Solar Supplies",
    mpn: "VLP-SOL-MC4",
  },
  {
    id: "VLP-SOL-ACDB-51",
    title: "VOLAMP Solar ACDB & DCDB Distribution Box",
    description: "Polycarbonate IP65 waterproof solar junction box with SPD type II surge protection and DC/AC circuit breakers.",
    link: "https://volampelektrikals.com/category/solar-renewable",
    imageLink: "https://volampelektrikals.com/volamp-logo.png",
    price: "3400.00 INR",
    availability: "in_stock",
    condition: "new",
    brand: "VOLAMP ELEKTRIKALS",
    category: "Solar & Renewable > Solar Distribution Boxes",
    googleProductCategory: "Hardware > Electrical Supplies > Solar Supplies",
    mpn: "VLP-SOL-ACDB",
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateGoogleMerchantXml(): string {
  const itemsXml = GOOGLE_MERCHANT_PRODUCTS.map((prod) => {
    return `    <item>
      <g:id>${escapeXml(prod.id)}</g:id>
      <g:title>${escapeXml(prod.title)}</g:title>
      <g:description>${escapeXml(prod.description)}</g:description>
      <g:link>${escapeXml(prod.link)}</g:link>
      <g:image_link>${escapeXml(prod.imageLink)}</g:image_link>
      <g:condition>${prod.condition}</g:condition>
      <g:availability>${prod.availability}</g:availability>
      <g:price>${escapeXml(prod.price)}</g:price>
      <g:brand>${escapeXml(prod.brand)}</g:brand>
      <g:google_product_category>${escapeXml(prod.googleProductCategory)}</g:google_product_category>
      <g:product_type>${escapeXml(prod.category)}</g:product_type>
      <g:mpn>${escapeXml(prod.mpn)}</g:mpn>
      <g:identifier_exists>yes</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Project Freight &amp; Delivery</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>VOLAMP ELEKTRIKALS PVT. LTD. - Google Merchant Product Feed</title>
    <link>https://volampelektrikals.com/</link>
    <description>Official product catalog for Google Merchant Center and Google Shopping. High-performance industrial wires, cables, switchgears, earthing, and electrical essentials.</description>
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
      res.setHeader("Cache-Control", "public, max-age=3600"); // cache 1 hour
      res.send(xml);
    } catch (err: any) {
      console.error("Failed to generate Google Merchant XML feed:", err);
      res.status(500).send("Error generating Google Merchant feed");
    }
  };

  app.get("/api/google-merchant-feed.xml", feedHandler);
  app.get("/feed/google-shopping.xml", feedHandler);
  app.get("/google-merchant-feed.xml", feedHandler);

  // Status & JSON endpoint for easy diagnostics
  app.get("/api/google-merchant/status", (_req: Request, res: Response) => {
    res.json({
      status: "active",
      storeName: "VOLAMP ELEKTRIKALS PVT. LTD.",
      domain: "https://volampelektrikals.com",
      feedUrls: {
        apiFeed: "https://volampelektrikals.com/api/google-merchant-feed.xml",
        rootFeed: "https://volampelektrikals.com/google-merchant-feed.xml",
      },
      itemCount: GOOGLE_MERCHANT_PRODUCTS.length,
      merchantCenterUrl: "https://merchants.google.com/",
      instructions: [
        "1. Log in to Google Merchant Center (https://merchants.google.com/)",
        "2. Verify and claim your website: https://volampelektrikals.com using the HTML verification meta tag in index.html",
        "3. Go to Products > Feeds > Add primary feed",
        "4. Choose Scheduled Fetch, name it 'VOLAMP Product Feed', and enter the feed URL: https://volampelektrikals.com/api/google-merchant-feed.xml",
        "5. Google will automatically import your products and display them on Google Search & Google Shopping."
      ]
    });
  });
}
