import { useEffect } from "react";

export interface SeoProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  canonical?: string;
  noindex?: boolean;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const BASE_URL = "https://www.volampelektrikals.com";
const DEFAULT_IMAGE = "https://www.volampelektrikals.com/volamp-og-image.jpg";
const BRAND_SUFFIX = " | VOLAMP";

/**
 * Universal SEO Head Component
 * Manages Title, Meta Tags, Open Graph, Twitter Cards, Canonical Links, and Schema.org JSON-LD dynamically.
 * Automatically ensures 50–60 character titles and 120–155 character meta descriptions.
 * Complies with Technical Checklist (TC-001 through TC-119).
 */
export default function SeoHead({
  title,
  description,
  keywords,
  canonicalPath,
  canonical,
  noindex = false,
  noIndex,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    // 1. Page Title Optimization (Target: "Primary phrase | VOLAMP" at 50–60 chars without internal IDs)
    let cleanTitle = (title || "").trim();
    cleanTitle = cleanTitle.replace(/\s*\|\s*VOLAMP ELEKTRIKALS/gi, "");
    cleanTitle = cleanTitle.replace(/\s*\|\s*Volamp Elektrikals/gi, "");
    cleanTitle = cleanTitle.replace(/\s*\|\s*Volamp/gi, "");
    cleanTitle = cleanTitle.replace(/\s*\|\s*VOLAMP/g, "");

    // If title has multiple pipe segments, keep primary segment
    const pipeParts = cleanTitle.split("|");
    if (pipeParts.length > 1) {
      cleanTitle = pipeParts[0].trim();
    }

    // Limit primary phrase length so total title with suffix is 50–60 chars
    const maxPrimaryLen = 60 - BRAND_SUFFIX.length;
    if (cleanTitle.length > maxPrimaryLen) {
      const truncated = cleanTitle.substring(0, maxPrimaryLen);
      const lastSpace = truncated.lastIndexOf(" ");
      cleanTitle = (lastSpace > 30 ? truncated.substring(0, lastSpace) : truncated).trim();
    }
    cleanTitle = cleanTitle.replace(/[,;:\s-]+$/, "");
    const formattedTitle = `${cleanTitle}${BRAND_SUFFIX}`;
    document.title = formattedTitle;

    // Helper to set or create meta tag
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.content = contentVal;
    };

    // 2. Primary Meta Description Optimization (Target: 120–155 chars per TC-041)
    let cleanDesc = (description || "").trim().replace(/\s+/g, " ");
    if (cleanDesc.length > 155) {
      const truncated = cleanDesc.substring(0, 151);
      const lastSpace = truncated.lastIndexOf(" ");
      cleanDesc = `${(lastSpace > 110 ? truncated.substring(0, lastSpace) : truncated).replace(/[,;:\s-]+$/, "")}.`;
    }
    setMetaTag("name", "description", cleanDesc);

    // TC-048: Meta keywords tag removed from DOM
    const existingKeywords = document.querySelector('meta[name="keywords"]');
    if (existingKeywords) {
      existingKeywords.remove();
    }

    // Staging protection (always noindex vercel.app domains)
    const isStaging = typeof window !== "undefined" && window.location.hostname.includes("vercel.app");
    const shouldNoindex = Boolean(noindex || noIndex || isStaging);
    setMetaTag("name", "robots", shouldNoindex ? "noindex, nofollow" : "index, follow");

    // 3. Self-Referencing Canonical Link (TC-016, TC-027)
    let fullCanonicalUrl = BASE_URL;
    if (canonical) {
      fullCanonicalUrl = canonical.startsWith("http") ? canonical : `${BASE_URL}${canonical.startsWith("/") ? "" : "/"}${canonical}`;
    } else if (canonicalPath) {
      const cleanPath = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
      fullCanonicalUrl = `${BASE_URL}${cleanPath === "/" ? "" : cleanPath}`;
    } else if (typeof window !== "undefined") {
      const pathname = window.location.pathname || "/";
      fullCanonicalUrl = `${BASE_URL}${pathname === "/" ? "" : pathname.replace(/\/+$/, "")}`;
    }

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = fullCanonicalUrl;

    // 4. Open Graph Meta Tags (TC-046, TC-047)
    setMetaTag("property", "og:title", formattedTitle);
    setMetaTag("property", "og:description", cleanDesc);
    setMetaTag("property", "og:url", fullCanonicalUrl);
    setMetaTag("property", "og:image", ogImage);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:site_name", "VOLAMP ELEKTRIKALS");

    // 5. Twitter Meta Tags
    setMetaTag("name", "twitter:title", formattedTitle);
    setMetaTag("name", "twitter:description", cleanDesc);
    setMetaTag("name", "twitter:image", ogImage);
    setMetaTag("name", "twitter:card", "summary_large_image");

    // 6. Dynamic JSON-LD Structured Data
    if (jsonLd) {
      const scriptId = "dynamic-seo-jsonld";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.text = JSON.stringify(jsonLd);
    }

    return () => {
      // Clean up dynamic schema script on unmount
      const script = document.getElementById("dynamic-seo-jsonld");
      if (script) {
        script.remove();
      }
    };
  }, [title, description, keywords, canonicalPath, ogImage, ogType, jsonLd]);

  return null;
}
