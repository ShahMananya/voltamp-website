const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://volampelektrikals.com';
const today = new Date().toISOString().split('T')[0];

const STATIC_PAGES = [
  { path: '', priority: '1.0', changefreq: 'daily' },
  { path: 'about-volamp', priority: '0.9', changefreq: 'weekly' },
  { path: 'where-volamp-contributed', priority: '0.9', changefreq: 'weekly' },
  { path: 'business-segments', priority: '0.9', changefreq: 'weekly' },
  { path: 'branch-locations', priority: '0.9', changefreq: 'weekly' },
  { path: 'products', priority: '0.9', changefreq: 'daily' },
  { path: 'price-list', priority: '0.9', changefreq: 'weekly' },
  { path: 'certifications-and-awards', priority: '0.8', changefreq: 'monthly' },
  { path: 'calculator', priority: '0.8', changefreq: 'monthly' },
  { path: 'collaborate', priority: '0.8', changefreq: 'monthly' },
  { path: 'careers', priority: '0.7', changefreq: 'weekly' },
  { path: 'enquire', priority: '0.8', changefreq: 'monthly' },
  { path: 'complaints-cases', priority: '0.8', changefreq: 'monthly' },
  { path: 'in-the-news', priority: '0.7', changefreq: 'monthly' },
  { path: 'blog', priority: '0.7', changefreq: 'weekly' },
  { path: 'pay-invoice', priority: '0.7', changefreq: 'monthly' },
  { path: 'track', priority: '0.7', changefreq: 'monthly' },
  { path: 'shipping-policy', priority: '0.6', changefreq: 'monthly' },
  { path: 'refund-policy', priority: '0.6', changefreq: 'monthly' },
  { path: 'terms-and-conditions', priority: '0.6', changefreq: 'monthly' },
  { path: 'privacy-policy', priority: '0.6', changefreq: 'monthly' },
];

const CATEGORY_SLUGS = [
  'wire-cables', 'switchgear', 'earthing-lightning', 'solar-renewable',
  'substation-transmission', 'industrial-automation', 'lighting-luminaires',
  'conduits-cable-management', 'capacitors-power-quality', 'safety-ppe-tools', 'fire-safety-cables'
];

const staticUrls = STATIC_PAGES.map(p => `  <url>
    <loc>${BASE_URL}/${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

const categoryUrls = CATEGORY_SLUGS.map(s => `  <url>
    <loc>${BASE_URL}/category/${s}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`).join('\n');

const raw = fs.readFileSync(path.resolve(__dirname, '../client/public/products_db.json'), 'utf8');
const products = JSON.parse(raw);
const productUrls = products
  .filter(p => p.productId && p.name)
  .map(p => `  <url>
    <loc>${BASE_URL}/product/${encodeURIComponent(p.productId)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${categoryUrls}
${productUrls}
</urlset>`.trim();

const outPath = path.resolve(__dirname, '../client/public/sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log('Successfully generated client/public/sitemap.xml with', products.length, 'products. File size:', (xml.length / 1024).toFixed(1), 'KB');

function escapeXml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const validProducts = products.filter(p => p.productId && p.name);
const itemsXml = validProducts.map(prod => {
  const rawPrice = prod.numericPrice || (typeof prod.price === 'string' ? parseFloat(prod.price.replace(/[^0-9.]/g, '')) : 0) || 100;
  const priceFormatted = `${rawPrice.toFixed(2)} INR`;
  const productLink = `${BASE_URL}/product/${encodeURIComponent(prod.productId)}`;
  const imageLink = prod.imageUrl && prod.imageUrl.startsWith('http')
    ? prod.imageUrl
    : (prod.imageUrl ? `${BASE_URL}${prod.imageUrl}` : `${BASE_URL}/products/default.jpg`);
  const brand = prod.brand || 'Polycab';
  const category = prod.category || 'Wires & Cables';
  const desc = prod.description || `${prod.name} - genuine certified industrial electrical supply with manufacturer test certificate (MTC) from Volamp Elektrikals.`;

  return `    <item>
      <g:id>${escapeXml(prod.productId)}</g:id>
      <g:title>${escapeXml(prod.name)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(productLink)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${prod.availability === 'OUT OF STOCK' ? 'out_of_stock' : 'in_stock'}</g:availability>
      <g:price>${escapeXml(priceFormatted)}</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:google_product_category>Hardware &gt; Electrical Supplies &gt; Wire &amp; Cable</g:google_product_category>
      <g:product_type>${escapeXml(category)}</g:product_type>
      <g:mpn>${escapeXml(prod.sku || prod.productId)}</g:mpn>
      <g:identifier_exists>yes</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Insured Project Freight</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
}).join('\n');

const merchantXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>VOLAMP ELEKTRIKALS PVT. LTD. - Official Google Merchant Product Feed</title>
    <link>${BASE_URL}/</link>
    <description>Official verified product catalog for Google Merchant Center and Google Shopping. Genuine industrial power cables, switchgear, and earthing supplies from Ahmedabad, Gujarat.</description>
${itemsXml}
  </channel>
</rss>`;

const merchantPath = path.resolve(__dirname, '../client/public/google-merchant-feed.xml');
fs.writeFileSync(merchantPath, merchantXml, 'utf8');
console.log(`Successfully generated client/public/google-merchant-feed.xml with ${validProducts.length} items. File size: ${(fs.statSync(merchantPath).size / 1024).toFixed(1)} KB`);

