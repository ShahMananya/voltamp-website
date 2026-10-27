import type { Request, Response, NextFunction } from "express";

/**
 * 301 Permanent Redirects for Migration from WordPress / WooCommerce
 * Addresses Launch Blocker 6: Preserves search engine rankings for 1,757 old URLs,
 * eliminates soft 404s, and redirects theme-demo junk.
 */

const STATIC_PAGE_REDIRECTS: Record<string, string> = {
  "/about-us": "/about-volamp",
  "/about": "/about-volamp",
  "/contact-us": "/enquire",
  "/contact": "/enquire",
  "/branches": "/branch-locations",
  "/our-branches": "/branch-locations",
  "/locations": "/branch-locations",
  "/certificates": "/certifications-and-awards",
  "/awards": "/certifications-and-awards",
  "/calculator-tool": "/calculator",
  "/cable-calculator": "/calculator",
  "/news": "/in-the-news",
  "/updates": "/in-the-news",
  "/privacy": "/privacy-policy",
  "/privacy-policy-2": "/privacy-policy",
  "/terms": "/terms-and-conditions",
  "/terms-of-service": "/terms-and-conditions",
  "/terms-and-condition": "/terms-and-conditions",
  "/complaints": "/complaints-cases",
  "/grievance": "/complaints-cases",
  "/grievances": "/complaints-cases",
  "/shop": "/products",
  "/store": "/products",
  "/catalogue": "/products",
  "/all-products": "/products",
  "/where-we-contribute": "/where-volamp-contributed",
  "/projects": "/where-volamp-contributed",
  "/category/switchgear": "/category/switch-gears",
  "/category/switchgears": "/category/switch-gears",
  "/category/cables": "/category/wire-cables",
  "/category/cable": "/category/wire-cables",
  "/category/wires-cables": "/category/wire-cables",
  "/category/industrial-automation": "/category/switch-gears",
  "/category/lighting-luminaires": "/category/wiring-device",
  "/category/substation-transmission": "/category/wire-cables",
  "/category/conduits-cable-management": "/category/conduit",
  "/category/earthing-lightning": "/category/earthing-material",
};

const CATEGORY_MAP: Record<string, string> = {
  "wires-cables": "wire-cables",
  "wires-and-cables": "wire-cables",
  "wire-cable": "wire-cables",
  "cables": "wire-cables",
  "cable": "wire-cables",
  "power-cables": "wire-cables",
  "armoured-cables": "wire-cables",
  "submersible-cables": "wire-cables",
  "control-cables": "wire-cables",
  "switchgear": "switch-gears",
  "switch-gear": "switch-gears",
  "switchgears": "switch-gears",
  "switch-gears": "switch-gears",
  "mcb": "switch-gears",
  "mccb": "switch-gears",
  "acb": "switch-gears",
  "distribution-boards": "switch-gears",
  "solar-cables": "solar",
  "solar": "solar",
  "solar-panels": "solar",
  "solar-accessories": "solar",
  "cable-lugs": "lugs",
  "lugs": "lugs",
  "terminal-ends": "lugs",
  "crimping-lugs": "lugs",
  "cable-glands": "glands",
  "glands": "glands",
  "brass-glands": "glands",
  "conduit-pipes": "conduit",
  "conduit": "conduit",
  "pvc-conduit": "conduit",
  "earthing-material": "earthing-material",
  "earthing": "earthing-material",
  "earthing-rods": "earthing-material",
  "lightning-protection": "earthing-material",
  "wiring-device": "wiring-device",
  "wiring-devices": "wiring-device",
  "switches-sockets": "wiring-device",
};

// Known demo junk from legacy WordPress install
const JUNK_WP_PATHS = [
  "/hello-world",
  "/pool-hot-tub-wiring",
  "/sample-page",
  "/uncategorized",
  "/elementor-",
  "/wp-login.php",
  "/xmlrpc.php",
];

export function redirectsMiddleware(req: Request, res: Response, next: NextFunction) {
  // Only process GET / HEAD requests for redirects
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }

  const rawPath = (req.path || "/").toLowerCase();
  // Strip trailing slashes for clean lookup, except root "/"
  const cleanPath = rawPath.length > 1 && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;

  // 1. Check WordPress query parameters (e.g. /?p=123, /?page_id=45)
  if (req.query && (req.query.p || req.query.page_id || req.query.post_type)) {
    return res.redirect(301, "/");
  }

  // 2. Direct static page mapping
  if (STATIC_PAGE_REDIRECTS[cleanPath]) {
    return res.redirect(301, STATIC_PAGE_REDIRECTS[cleanPath]);
  }

  // 3. WordPress RSS / feed redirects
  if (
    cleanPath === "/feed" ||
    cleanPath === "/rss" ||
    cleanPath === "/comments/feed" ||
    cleanPath.endsWith("/feed")
  ) {
    return res.redirect(301, "/google-merchant-feed.xml");
  }

  // 4. Old WordPress demo junk (301 to home so Google drops demo pages cleanly)
  if (JUNK_WP_PATHS.some((junk) => cleanPath.startsWith(junk))) {
    return res.redirect(301, "/");
  }

  // 5. WooCommerce category paths: /product-category/:slug
  if (cleanPath.startsWith("/product-category/")) {
    const slug = cleanPath.replace("/product-category/", "").replace(/\/.*$/, "").trim();
    if (slug) {
      const mapped = CATEGORY_MAP[slug];
      if (mapped) {
        return res.redirect(301, `/category/${mapped}`);
      }
      // If no exact category alias, search for it in products
      return res.redirect(301, `/products?search=${encodeURIComponent(slug.replace(/-/g, " "))}`);
    }
    return res.redirect(301, "/products");
  }

  // 6. WooCommerce /shop/* sub-paths
  if (cleanPath.startsWith("/shop/")) {
    return res.redirect(301, "/products");
  }

  // 7. Legacy WooCommerce product URLs: /product/:slug
  // Only redirect if it is NOT a modern catalog ID prefix (CAB-, SWG-, SOL-, LUG-, PVC-, GLD-, WD-, EAR-, VLP-)
  if (cleanPath.startsWith("/product/")) {
    const slug = cleanPath.replace("/product/", "").replace(/\/.*$/, "").trim();
    const upper = slug.toUpperCase();
    const isModernId = /^(CAB|SWG|SOL|LUG|PVC|GLD|WD|EAR|VLP)-/.test(upper);

    if (!isModernId && slug.length > 0) {
      // It's a legacy slug like 'polycab-3-5c-185-sqmm-armoured-cable'
      const searchPhrase = slug.replace(/[-_]+/g, " ");
      return res.redirect(301, `/products?search=${encodeURIComponent(searchPhrase)}`);
    }
  }

  next();
}
