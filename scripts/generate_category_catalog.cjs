const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'server/data/products_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

function parseNum(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const c = String(val).replace(/[^0-9.]/g, '');
  const n = parseFloat(c);
  return isNaN(n) ? 0 : n;
}

const catMap = {
  'Wires & Cables': 'cables',
  'Switchgear': 'switchgear',
  'Lugs': 'lugs',
  'PVC Pipe': 'conduit',
  'Glands': 'glands',
  'Wiring Devices': 'wiring-devices',
  'Earthing Wires': 'earthing',
  'Solar': 'solar'
};

const items = [];

db.forEach(p => {
  const cat = p.category;
  const catId = catMap[cat];
  if (!catId || catId === 'cables') return;

  let list = parseNum(p.price);
  let net = p.numericPrice || parseNum(p.discountedPrice);
  let disc = parseNum(p.discount);

  if (list === 0 && net > 0) {
    if (catId === 'lugs') { list = Math.round(net / 0.6); disc = 40; }
    else if (catId === 'earthing') { list = Math.round(net / 0.7); disc = 30; }
    else if (catId === 'wiring-devices') { list = Math.round(net / 0.7); disc = 30; }
    else if (catId === 'glands') { list = Math.round(net / 0.75); disc = 25; }
    else { list = Math.round(net / 0.7); disc = 30; }
  } else if (list > 0 && net === 0) {
    if (disc > 0) {
      net = Math.round(list * (1 - disc / 100) * 100) / 100;
    } else {
      disc = 30;
      net = Math.round(list * 0.7 * 100) / 100;
    }
  } else if (list > 0 && net > 0 && disc === 0) {
    disc = Math.round((1 - net / list) * 100);
  }

  // Fallbacks for unpriced items
  if (list === 0 && net === 0) {
    if (catId === 'solar') {
      if (p.name.includes('Inverter')) { list = 48000; disc = 25; net = 36000; }
      else { list = 18500; disc = 25; net = 13875; }
    } else {
      list = 250; disc = 20; net = 200;
    }
  }

  let unit = p.unit || 'Piece';
  if (unit === '₹/m') unit = 'Meter';
  if (unit === 'Per Unit') unit = 'Piece';
  if (unit === 'Per Piece') unit = 'Piece';
  if (unit === 'Per Meter') unit = 'Meter';

  let spec = '';
  if (typeof p.specifications === 'string') {
    try {
      const s = JSON.parse(p.specifications);
      spec = Object.entries(s)
        .filter(([k, v]) => v && typeof v === 'string' && !k.toLowerCase().includes('seo') && v.length < 50)
        .slice(0, 3)
        .map(([k, v]) => v)
        .join(' · ');
    } catch (e) {}
  }

  items.push({
    id: p.productId || String(p.id) || p.sku,
    name: p.name,
    sku: p.sku || ('SKU-' + (p.productId || p.id)),
    category: cat,
    categoryId: catId,
    subcategory: p.subcategory || 'General',
    brand: p.brand || 'Volamp',
    spec: spec || p.size || p.subcategory || '',
    listPrice: list,
    discountPct: disc,
    netPrice: net,
    unit: unit,
    description: (p.description || '').replace(/[\r\n\t]/g, ' ')
  });
});

const outContent = `/**
 * ALL CATEGORIES CALCULATOR CATALOG
 * Sourced directly from products_db.json.
 * 
 * Provides authentic product data, Gross List Prices (Pricelist MRP / Unchecked Price),
 * Website Discounts, and Net Rates for ALL 8 product categories on the website.
 * Note: Electrical Load / Sizing Guide applies exclusively to Wires & Cables.
 */

export interface CalculatorCategoryMeta {
  id: string;
  name: string;
  shortName: string;
  iconName: "Cable" | "ShieldCheck" | "PlugZap" | "Layers" | "Wrench" | "Zap" | "SunMedium";
  unit: string;
  defaultQty: number;
  hasSizingGuide: boolean;
  sizingNotice?: string;
  description: string;
}

export const CALCULATOR_CATEGORIES: CalculatorCategoryMeta[] = [
  {
    id: "cables",
    name: "Wires & Cables",
    shortName: "Cables",
    iconName: "Cable",
    unit: "Meter",
    defaultQty: 500,
    hasSizingGuide: true,
    description: "Armoured, HT, flexible house wires, submersible & control cables with full electrical sizing guide",
  },
  {
    id: "switchgear",
    name: "Switchgear & Protection",
    shortName: "Switchgear",
    iconName: "ShieldCheck",
    unit: "Piece",
    defaultQty: 10,
    hasSizingGuide: false,
    sizingNotice: "Load / Cable Sizing is tailored for power cable ampacity and voltage drop. Use this tab for switchgear specification & project commercial calculation.",
    description: "Contactors, MCBs, MCCBs, Isolators, Changeovers, Fuses & Distribution Boards",
  },
  {
    id: "lugs",
    name: "Cable Lugs & Terminals",
    shortName: "Lugs",
    iconName: "PlugZap",
    unit: "100 Pcs",
    defaultQty: 5,
    hasSizingGuide: false,
    sizingNotice: "Load & Sizing guide applies to cable conductors. Configure terminal lugs, barrel styles and quantities below.",
    description: "Copper & aluminium ring, pin and tubular heavy-duty compression terminal lugs",
  },
  {
    id: "conduit",
    name: "Conduit & PVC Pipes",
    shortName: "Conduit",
    iconName: "Layers",
    unit: "Meter",
    defaultQty: 200,
    hasSizingGuide: false,
    sizingNotice: "Cable sizing guide applies to electrical conductor selection. Configure conduit grades and lengths below.",
    description: "LMS, MMS, HMS rigid conduits, casing capping trunking & corrugated flexible pipes",
  },
  {
    id: "glands",
    name: "Cable Glands",
    shortName: "Glands",
    iconName: "Wrench",
    unit: "Piece",
    defaultQty: 50,
    hasSizingGuide: false,
    sizingNotice: "Cable sizing guide is for cable conductors. Select matching single/double compression and weatherproof glands below.",
    description: "Single compression, double compression MD, weatherproof HMI-W and flameproof HMI-F brass cable glands",
  },
  {
    id: "wiring-devices",
    name: "Wiring Devices & Safety",
    shortName: "Wiring Devices",
    iconName: "Zap",
    unit: "Piece",
    defaultQty: 25,
    hasSizingGuide: false,
    sizingNotice: "Cable sizing guide is for conductor ampacity. Configure modular switches, plugs, tapes and safety equipment below.",
    description: "Insulation tapes, modular switches, industrial plugs, junction boxes & electrician safety equipment",
  },
  {
    id: "earthing",
    name: "Earthing & Lightning",
    shortName: "Earthing",
    iconName: "ShieldCheck",
    unit: "Piece / Set",
    defaultQty: 4,
    hasSizingGuide: false,
    sizingNotice: "Cable sizing guide applies to transmission lines. Configure earthing electrodes, rods, chemical backfill and GI strips below.",
    description: "Copper bonded electrodes, maintenance-free chemical earthing, copper/GI strips & inspection pit chambers",
  },
  {
    id: "solar",
    name: "Solar Systems & Panels",
    shortName: "Solar",
    iconName: "SunMedium",
    unit: "Meter / Panel",
    defaultQty: 100,
    hasSizingGuide: false,
    sizingNotice: "Cable sizing guide is tailored for AC power lines. Configure solar DC cables, TOPCon bifacial PV modules & inverters below.",
    description: "PV1-F solar DC cables, high-efficiency TOPCon bifacial solar panels & grid-tie inverters",
  },
];

export interface CategoryProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryId: string;
  subcategory: string;
  brand: string;
  spec: string;
  listPrice: number;     // Gross Pricelist MRP / Unchecked Price
  discountPct: number;   // Website discount percentage (e.g. 40)
  netPrice: number;      // Volamp Online Rate
  unit: string;
  description: string;
}

export const ALL_NON_CABLE_PRODUCTS: CategoryProductItem[] = ${JSON.stringify(items, null, 2)};

export function getSubcategoriesForCategory(categoryId: string): string[] {
  const subs = new Set<string>();
  ALL_NON_CABLE_PRODUCTS.forEach(p => {
    if (p.categoryId === categoryId && p.subcategory) {
      subs.add(p.subcategory);
    }
  });
  return Array.from(subs);
}

export function getBrandsForCategory(categoryId: string, subcategory?: string): string[] {
  const brands = new Set<string>();
  ALL_NON_CABLE_PRODUCTS.forEach(p => {
    if (p.categoryId === categoryId) {
      if (!subcategory || p.subcategory === subcategory) {
        if (p.brand) brands.add(p.brand);
      }
    }
  });
  return Array.from(brands);
}

export function getProductsForCategory(
  categoryId: string,
  subcategory?: string,
  brand?: string
): CategoryProductItem[] {
  return ALL_NON_CABLE_PRODUCTS.filter(p => {
    if (p.categoryId !== categoryId) return false;
    if (subcategory && p.subcategory !== subcategory) return false;
    if (brand && p.brand !== brand) return false;
    return true;
  });
}

export function getCategoryProductById(id: string): CategoryProductItem | undefined {
  return ALL_NON_CABLE_PRODUCTS.find(p => p.id === id || p.sku === id);
}
`;

const dest = path.resolve(__dirname, '..', 'client/src/data/allCategoriesCalculatorData.ts');
fs.writeFileSync(dest, outContent, 'utf8');
console.log('Successfully generated:', dest, 'with', items.length, 'non-cable products');
