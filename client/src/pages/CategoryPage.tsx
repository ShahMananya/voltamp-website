import { ArrowLeft, ArrowRight, Cable, FileText, Headphones, Search, ShieldCheck, Zap } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

function BrandMark() { return <div className="brand-mark" aria-label="VOLAMP home"><img src="/manus-storage/volamp-logo-corrected_263c7f84.png" alt="VOLAMP Powering Growth" /></div>; }

const categoryCatalog: Record<string, { name: string; description: string; items: string[]; icon: typeof Cable }> = {
  "hdc-heavy-duty-cable": { name: "HDC (Heavy Duty Cable)", description: "Armoured low- and high-tension cable systems for demanding electrical infrastructure.", items: ["LT Aluminium Arm Cable", "LT Copper Arm Cable", "HT Aluminium Arm Cable"], icon: Cable },
  "ldc-low-duty-cable": { name: "LDC (Low Duty Cable)", description: "Flexible, building, communication and signal cable for everyday project requirements.", items: ["Multi Core Flexible", "Single Core Flexible", "Wires-90", "Wires-Project", "Instrument Cable", "BMS Cable", "Braided Cable", "Flat", "CAT6", "Telephone Wire", "RG 6", "Speaker Wire"], icon: Cable },
  "lugs-gland": { name: "Lugs & Gland", description: "Terminations and cable-entry hardware. Product subsections will be added as the range is finalized.", items: [], icon: Cable },
  "switch-gears": { name: "Switch Gears", description: "Protection, control and distribution products for dependable electrical systems.", items: [], icon: ShieldCheck },
  "earthing-materials": { name: "Earthing Materials", description: "Grounding and electrical safety materials for project installations.", items: [], icon: ShieldCheck },
  "cable-trays": { name: "Cable Trays", description: "Cable routing and support systems for organized installations.", items: [], icon: Cable },
  "cable-jointing-kits": { name: "Cable Jointing Kits", description: "Jointing and termination solutions for cable installation work.", items: [], icon: Cable },
  "solar-products": { name: "Solar Products", description: "Products for solar and renewable-energy projects.", items: [], icon: Zap },
  "wiring-devices": { name: "Wiring Devices", description: "Everyday switches, sockets and wiring accessories.", items: [], icon: Cable },
  lighting: { name: "Lighting", description: "Commercial, industrial and project lighting.", items: [], icon: Zap },
  motors: { name: "Motors", description: "Motor products for industrial applications.", items: [], icon: ShieldCheck },
};

export default function CategoryPage() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug ?? "";
  const fallbackName = slug.split("-").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  const category = categoryCatalog[slug] ?? { name: fallbackName || "Category", description: "Explore this Volamp product subsection. Live records, specifications and availability will appear here when the approved product dataset is connected.", items: [], icon: Cable };
  const Icon = category.icon;

  return <div className="category-page"><header className="category-page-header"><Link href="/"><BrandMark /></Link><nav><Link href="/">Marketplace</Link><Link href="/#categories">All categories</Link><Link href="/portal">Customer portal</Link></nav><div className="category-page-actions"><ThemeToggle /><Link href="/?surface=inquiry"><Button>Request a quote <ArrowRight className="ml-2 size-4" /></Button></Link></div></header><main className="category-page-main"><Link href="/" className="category-back"><ArrowLeft className="size-4" /> Back to marketplace</Link><section className="category-hero"><div><span className="market-kicker">VOLAMP PRODUCT SECTION</span><h1>{category.name}</h1><p>{category.description}</p><div className="category-hero-actions"><Link href="/?surface=inquiry"><Button>Enquire about this category <ArrowRight className="ml-2 size-4" /></Button></Link><Link href="/?surface=chat" className="category-text-link"><Headphones className="size-4" /> Ask Vola</Link></div></div><div className="category-hero-art"><Icon className="size-24" /><span>{slug.toUpperCase()}</span></div></section><section className="category-products"><div className="category-section-heading"><div><span className="market-kicker">AVAILABLE RANGE</span><h2>{category.items.length ? `${category.items.length} subcategories` : "Range being prepared"}</h2></div><p>{category.items.length ? "Choose a subcategory to continue to product discovery, specifications, and quotation preparation." : "This category is live in the navigation. Subcategories will appear here as the product range is finalized."}</p></div>{category.items.length ? <div className="category-subcategory-grid">{category.items.map((item) => <Link key={item} href={`/category/${item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="category-subcategory-card"><div><Cable className="size-5" /><strong>{item}</strong></div><ArrowRight className="size-4" /></Link>)}</div> : <div className="category-empty"><Search className="size-6" /><strong>Product details will appear here</strong><span>Connect the approved product dataset to populate this category with live records.</span></div>}</section><section className="category-support"><div><FileText className="size-5" /><div><strong>Need a project recommendation?</strong><span>Share your quantity, specification, and delivery context with the Volamp supply desk.</span></div></div><Link href="/?surface=inquiry"><Button variant="outline">Start an enquiry <ArrowRight className="ml-2 size-4" /></Button></Link></section></main></div>;
}
