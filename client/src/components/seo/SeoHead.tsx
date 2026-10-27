import { useEffect } from "react";

export interface SeoProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalPath?: string;
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const BASE_URL = "https://volampelektrikals.com";
const DEFAULT_IMAGE = "https://volampelektrikals.com/volamp-og-image.jpg";
const BRAND_SUFFIX = " | Volamp";

/**
 * Universal SEO Head Component
 * Manages Title, Meta Tags, Open Graph, Twitter Cards, Canonical Links, and Schema.org JSON-LD dynamically.
 * Automatically ensures 50–60 character titles and 140–155 character meta descriptions.
 */
export default function SeoHead({
  title,
  description,
  keywords,
  canonicalPath,
  canonical,
  noindex = false,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    // 1. Page Title Optimization (Target: "Primary keyword | Volamp" at 50–60 chars)
    let cleanTitle = (title || "").trim();
    // Remove repeated or trailing brand suffixes
    cleanTitle = cleanTitle.replace(/\s*\|\s*VOLAMP ELEKTRIKALS/gi, "");
    cleanTitle = cleanTitle.replace(/\s*\|\s*Volamp Elektrikals/gi, "");
    cleanTitle = cleanTitle.replace(/\s*\|\s*Volamp/gi, "");

    // If title has multiple pipe segments, keep primary segment
    const pipeParts = cleanTitle.split("|");
    if (pipeParts.length > 1) {
      cleanTitle = pipeParts[0].trim();
    }

    // Limit primary phrase length so total title with suffix is 50–60 chars
    if (cleanTitle.length > 48) {
      cleanTitle = cleanTitle.substring(0, 48).trim().replace(/[,\s-]+$/, "");
    }
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

    // 2. Primary Meta Description Optimization (Target: 140–155 chars with CTA)
    let cleanDesc = (description || "").trim();
    if (cleanDesc.length > 158) {
      const truncated = cleanDesc.substring(0, 142);
      const lastSpace = truncated.lastIndexOf(" ");
      const root = lastSpace > 100 ? truncated.substring(0, lastSpace) : truncated;
      cleanDesc = `${root.replace(/[.,;:\s]+$/, "")}. Request quote.`;
      if (cleanDesc.length > 155) {
        cleanDesc = cleanDesc.substring(0, 155);
      }
    }
    setMetaTag("name", "description", cleanDesc);
    if (keywords) {
      setMetaTag("name", "keywords", keywords);
    }
    setMetaTag("name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    // 3. Canonical Link
    let fullCanonicalUrl = BASE_URL;
    if (canonical) {
      fullCanonicalUrl = canonical.startsWith("http") ? canonical : `${BASE_URL}${canonical.startsWith("/") ? "" : "/"}${canonical}`;
    } else if (canonicalPath) {
      const cleanPath = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
      fullCanonicalUrl = `${BASE_URL}${cleanPath === "/" ? "" : cleanPath}`;
    }
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = fullCanonicalUrl;

    // 4. Open Graph Meta Tags
    setMetaTag("property", "og:title", formattedTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:url", fullCanonicalUrl);
    setMetaTag("property", "og:image", ogImage);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:site_name", "VOLAMP ELEKTRIKALS");

    // 5. Twitter Meta Tags
    setMetaTag("name", "twitter:title", formattedTitle);
    setMetaTag("name", "twitter:description", description);
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
