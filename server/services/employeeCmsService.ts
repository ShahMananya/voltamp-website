import fs from "fs";
import path from "path";

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  excerpt: string;
  content: string;
  tags: string[];
  imageUrl?: string;
  createdAt: string;
}

export interface NewsletterDispatchItem {
  id: string;
  title: string;
  subject: string;
  targetAudience: string;
  content: string;
  dispatchedAt: string;
  recipientCount: number;
}

export interface PushedPriceListItem {
  id: string;
  brand: string;
  title: string;
  category: "power-cables" | "flexible-wires" | "switchgear" | "solar" | "accessories";
  docType: "Master Price List" | "Discount Circular" | "Technical Catalog" | "Specification Guide";
  effectiveDate: string;
  circularNo?: string;
  discountNote: string;
  fileFormat: "PDF" | "XLSX";
  fileSize: string;
  pages?: number;
  downloadUrl: string;
  isCustom: boolean;
  uploadedAt: string;
  description: string;
}

const DATA_DIR = path.resolve(process.cwd(), "server/data");
const BLOGS_FILE = path.join(DATA_DIR, "blogs_db.json");
const NEWSLETTERS_FILE = path.join(DATA_DIR, "newsletters_db.json");
const PRICE_LISTS_FILE = path.join(DATA_DIR, "price_lists_db.json");

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// -----------------------------------------------------------------------------
// Blogs Storage & API
// -----------------------------------------------------------------------------
const INITIAL_BLOGS: BlogPostItem[] = [
  {
    id: "blog-001",
    slug: "copper-vs-aluminium-armoured-cable-sizing-guide",
    title: "Copper vs. Aluminium Armoured Cables: Industrial Sizing & Voltage Drop Guide",
    category: "Technical Engineering",
    author: "Naimil Patel (CEO)",
    date: "October 20, 2026",
    readTime: "7 min read",
    excerpt: "Comprehensive conductivity breakdown, IS 7098 cross-section calculations, and 20-year lifecycle cost comparisons for industrial plants.",
    content: `When engineering modern manufacturing facilities and substations across Gujarat's industrial corridors, project directors frequently weigh the balance between initial procurement capex and long-term operating losses when choosing between copper and aluminium armoured cables.

### Key Engineering Criteria:
1. **Current Carrying Capacity (Ampacity):**
   - High-grade electrolytic copper offers 100% IACS conductivity.
   - EC-grade aluminium delivers roughly 61% conductivity, requiring approximately one standard gauge step higher cross-sectional area to carry equivalent load under identical installation derating factors.

2. **Thermal Expansion & Termination Integrity:**
   - Aluminium possesses a higher coefficient of thermal expansion than copper.
   - For high-vibration equipment, MCC switchgear feeder terminations, and VFD motor runs, bi-metallic friction-welded lugs with oxide-inhibiting paste must be specified to prevent galvanic corrosion and thermal loosening.

3. **Total Cost of Ownership (TCO):**
   - For long runs (> 150m) and heavy distribution (> 185 sqmm), aluminium armoured cables offer 40% to 55% lower material procurement cost, making them standard for utility feeder lines.
   - For short, compact control cabinets and indoor distribution boards, copper provides ease of bending and smaller conduit footprint.`,
    tags: ["Armoured Cable", "IS 7098", "Copper", "Aluminium", "Sizing"],
    imageUrl: "/products/cables.jpg",
    createdAt: new Date().toISOString(),
  },
  {
    id: "blog-002",
    slug: "solar-dc-cable-specifications-iec-62930",
    title: "Solar DC Cables Demystified: EN 50618 & IEC 62930 Compliance Standards",
    category: "Solar & Clean Energy",
    author: "Jinay Patel (Technical Sourcing)",
    date: "October 14, 2026",
    readTime: "5 min read",
    excerpt: "Why standard building wires fail in photovoltaic arrays: Electron-beam cross-linked polyolefin insulation and 25-year UV degradation immunity.",
    content: `Utility-scale solar farms and industrial rooftop arrays operate under severe climatic extremes—direct UV irradiation, thermal cycling between -40°C and +120°C, and damp heat.

### Essential Specifications for Solar DC Cables:
- **Tinned Copper Conductors:** Class 5 flexible stranded conductors with pure tin plating prevent copper oxidation over 25+ years of service.
- **XLPO Dual Insulation:** Electron-beam cross-linked halogen-free polyolefin ensures zero toxic gas emission during fire and extraordinary resistance to ozone degradation.
- **Direct Burial & Water Resistance:** Rated for AD8 continuous water submersion for ground-mount solar arrays in high water-table terrains.`,
    tags: ["Solar DC", "IEC 62930", "Photovoltaic", "Renewables"],
    imageUrl: "/products/solar.jpg",
    createdAt: new Date().toISOString(),
  },
  {
    id: "blog-003",
    slug: "lme-copper-aluminium-market-analysis-q4-2026",
    title: "Q4 2026 Live Metal Price Dynamics: How LME Trends Impact Cable Price Lists",
    category: "Commercial Insights",
    author: "Roshni Shroff (Commercial Desk)",
    date: "October 08, 2026",
    readTime: "6 min read",
    excerpt: "An inside look at London Metal Exchange (LME) copper and aluminium settlement rates and how manufacturer price circulars adjust in real-time.",
    content: `Raw conductor metal constitutes 60% to 75% of an industrial power cable's net manufacturing cost. Understanding LME spot settlements and domestic currency exchange rates enables EPC contractors to lock in forward procurement schedules ahead of monthly price circular hikes.

### Key Factors Shaping Current Prices:
1. Domestic refinery supply from Hindalco, Vedanta, and Nalco.
2. Renewable energy grid expansion driving global copper demand.
3. Volamp's forward-booking warehouse stock strategy in Ahmedabad, shielding our registered contractors from spot market volatility.`,
    tags: ["LME", "Copper", "Aluminium", "Price Trends", "Procurement"],
    imageUrl: "/products/switchgear.jpg",
    createdAt: new Date().toISOString(),
  },
];

export function getBlogs(): BlogPostItem[] {
  ensureDirectoryExists();
  try {
    if (fs.existsSync(BLOGS_FILE)) {
      const raw = fs.readFileSync(BLOGS_FILE, "utf-8");
      return JSON.parse(raw);
    }
    // Seed initial blogs
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(INITIAL_BLOGS, null, 2), "utf-8");
    return INITIAL_BLOGS;
  } catch (err) {
    console.error("[EmployeeCms] Error reading blogs:", err);
    return INITIAL_BLOGS;
  }
}

export function createBlog(input: {
  title: string;
  category: string;
  author: string;
  readTime?: string;
  excerpt: string;
  content: string;
  tags?: string[];
  imageUrl?: string;
}): BlogPostItem {
  ensureDirectoryExists();
  const blogs = getBlogs();
  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const newBlog: BlogPostItem = {
    id: `blog-${Date.now()}`,
    slug: `${slug}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: input.title,
    category: input.category || "General",
    author: input.author || "VOLAMP Team",
    date: new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    readTime: input.readTime || "5 min read",
    excerpt: input.excerpt,
    content: input.content,
    tags: input.tags || ["Volamp", "Electrical"],
    imageUrl: input.imageUrl || "/products/cables.jpg",
    createdAt: new Date().toISOString(),
  };

  blogs.unshift(newBlog);
  fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf-8");
  return newBlog;
}

export function deleteBlog(id: string): boolean {
  ensureDirectoryExists();
  const blogs = getBlogs();
  const filtered = blogs.filter((b) => b.id !== id);
  if (filtered.length !== blogs.length) {
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  }
  return false;
}

// -----------------------------------------------------------------------------
// Newsletters Storage & API
// -----------------------------------------------------------------------------
const INITIAL_NEWSLETTERS: NewsletterDispatchItem[] = [
  {
    id: "nl-001",
    title: "Volamp Industrial Pulse — October Edition",
    subject: "New Polycab HT Price Lists, Live Metal Fluctuations & Stock Dispatch",
    targetAudience: "All Verified Subscribers & Contractors",
    content: "Welcome to the October edition of Volamp Industrial Pulse. This week: Updated Polycab HT Armoured cable discounts (+44%), instant stock arrival at Ahmedabad depot, and solar DC stock status.",
    dispatchedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    recipientCount: 240,
  },
];

export function getNewsletters(): NewsletterDispatchItem[] {
  ensureDirectoryExists();
  try {
    if (fs.existsSync(NEWSLETTERS_FILE)) {
      const raw = fs.readFileSync(NEWSLETTERS_FILE, "utf-8");
      return JSON.parse(raw);
    }
    fs.writeFileSync(NEWSLETTERS_FILE, JSON.stringify(INITIAL_NEWSLETTERS, null, 2), "utf-8");
    return INITIAL_NEWSLETTERS;
  } catch (err) {
    console.error("[EmployeeCms] Error reading newsletters:", err);
    return INITIAL_NEWSLETTERS;
  }
}

export function publishNewsletter(input: {
  title: string;
  subject: string;
  targetAudience: string;
  content: string;
  recipientCount?: number;
}): NewsletterDispatchItem {
  ensureDirectoryExists();
  const newsletters = getNewsletters();
  const newNewsletter: NewsletterDispatchItem = {
    id: `nl-${Date.now()}`,
    title: input.title,
    subject: input.subject,
    targetAudience: input.targetAudience,
    content: input.content,
    dispatchedAt: new Date().toISOString(),
    recipientCount: input.recipientCount || 240,
  };

  newsletters.unshift(newNewsletter);
  fs.writeFileSync(NEWSLETTERS_FILE, JSON.stringify(newsletters, null, 2), "utf-8");
  return newNewsletter;
}

// -----------------------------------------------------------------------------
// Pushed Price Lists Storage & API
// -----------------------------------------------------------------------------
export function getPushedPriceLists(): PushedPriceListItem[] {
  ensureDirectoryExists();
  try {
    if (fs.existsSync(PRICE_LISTS_FILE)) {
      const raw = fs.readFileSync(PRICE_LISTS_FILE, "utf-8");
      return JSON.parse(raw);
    }
    fs.writeFileSync(PRICE_LISTS_FILE, JSON.stringify([], null, 2), "utf-8");
    return [];
  } catch (err) {
    console.error("[EmployeeCms] Error reading pushed price lists:", err);
    return [];
  }
}

export function pushPriceList(input: {
  brand: string;
  title: string;
  category: "power-cables" | "flexible-wires" | "switchgear" | "solar" | "accessories";
  docType: "Master Price List" | "Discount Circular" | "Technical Catalog" | "Specification Guide";
  effectiveDate: string;
  circularNo?: string;
  discountNote: string;
  fileFormat?: "PDF" | "XLSX";
  fileSize?: string;
  pages?: number;
  downloadUrl?: string;
  description: string;
}): PushedPriceListItem {
  ensureDirectoryExists();
  const lists = getPushedPriceLists();
  const brandSlug = input.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const newItem: PushedPriceListItem = {
    id: `push-${brandSlug}-${Date.now()}`,
    brand: input.brand,
    title: input.title,
    category: input.category,
    docType: input.docType,
    effectiveDate: input.effectiveDate,
    circularNo: input.circularNo || `VOL/${input.brand.slice(0, 3).toUpperCase()}/${new Date().getFullYear()}`,
    discountNote: input.discountNote,
    fileFormat: input.fileFormat || "PDF",
    fileSize: input.fileSize || "4.2 MB",
    pages: input.pages || 32,
    downloadUrl: input.downloadUrl || `/catalogs/${brandSlug}-price-list.pdf`,
    isCustom: true,
    uploadedAt: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    description: input.description,
  };

  lists.unshift(newItem);
  fs.writeFileSync(PRICE_LISTS_FILE, JSON.stringify(lists, null, 2), "utf-8");
  return newItem;
}

export function deletePushedPriceList(id: string): boolean {
  ensureDirectoryExists();
  const lists = getPushedPriceLists();
  const filtered = lists.filter((item) => item.id !== id);
  if (filtered.length !== lists.length) {
    fs.writeFileSync(PRICE_LISTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  }
  return false;
}
