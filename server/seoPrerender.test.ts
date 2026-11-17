import { describe, expect, it } from "vitest";
import { seoPrerenderMiddleware } from "./seoPrerender";
import type { Request, Response } from "express";

function mockHttp(path: string, customHeaders: Record<string, string> = {}) {
  const req = {
    method: "GET",
    path,
    headers: customHeaders,
    query: {},
  } as unknown as Request;

  let statusCode = 200;
  let sentHtml = "";
  let nextCalled = false;
  const headers: Record<string, string> = {};

  const res = {
    status: (code: number) => {
      statusCode = code;
      return res;
    },
    setHeader: (name: string, val: string) => {
      headers[name.toLowerCase()] = val;
      return res;
    },
    send: (body: string) => {
      sentHtml = body;
      return res;
    },
    json: (data: any) => {
      sentHtml = JSON.stringify(data);
      return res;
    },
  } as unknown as Response;

  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, getResult: () => ({ statusCode, sentHtml, nextCalled, headers }) };
}

describe("SEO Prerendering & Real 404 Status", () => {
  it("returns real HTTP 404 for unknown routes (eliminating soft 404s)", () => {
    const { req, res, next, getResult } = mockHttp("/nonexistent-page-xyz");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(404);
    expect(result.sentHtml).toContain("404 - Page Not Found");
    expect(result.sentHtml).toContain('content="noindex, nofollow"');
    expect(result.nextCalled).toBe(false);
  });

  it("returns real HTTP 404 for non-existent products", () => {
    const { req, res, next, getResult } = mockHttp("/product/FAKE-NONEXISTENT-999");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(404);
    expect(result.sentHtml).toContain("Product Not Found");
    expect(result.sentHtml).toContain('content="noindex, nofollow"');
    expect(result.nextCalled).toBe(false);
  });

  it("returns real HTTP 404 for non-existent category", () => {
    const { req, res, next, getResult } = mockHttp("/category/nonexistent-category-slug");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(404);
    expect(result.sentHtml).toContain("Category Not Found");
    expect(result.sentHtml).toContain('content="noindex, nofollow"');
  });

  it("prerenders valid product with 200, H1, schema, and specs in raw HTML", () => {
    const { req, res, next, getResult } = mockHttp("/product/CAB-000001");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("<h1");
    expect(result.sentHtml).toContain("CAB-000001");
    expect(result.sentHtml).toContain("schema.org");
    expect(result.sentHtml).toContain("https://www.volampelektrikals.com/product/CAB-000001");
    expect(result.sentHtml).toContain('href="/category/wire-cables"');
    expect(result.sentHtml).toContain('content="product"');
    expect(result.sentHtml).not.toContain('"mpn"');
    expect(result.sentHtml).not.toContain('content="noindex, nofollow"');
  });

  it("prerenders homepage with 200, single H1, and crawlable category/product links", () => {
    const { req, res, next, getResult } = mockHttp("/");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("<h1");
    expect(result.sentHtml).toContain("Cables, Wires &amp; Electrical Store Ahmedabad (B2B &amp; B2C)");
    expect(result.sentHtml).toContain('href="/category/wire-cables"');
    expect(result.sentHtml).toContain('href="/category/lugs"');
    expect(result.sentHtml).toContain('href="/category/glands"');
    expect(result.sentHtml).toContain('href="/dealers/polycab-ahmedabad"');
    expect(result.sentHtml).toContain('href="/dealers/finolex-cables-ahmedabad"');
    expect(result.sentHtml).toContain('href="/dealers/kei-cables-gujarat"');
    expect(result.sentHtml).toContain('href="/dealers/schneider-electric-ahmedabad"');
    expect(result.sentHtml).toContain('href="/product/CAB-000736"');
    expect(result.sentHtml).toContain('href="/product/CAB-001908"');
    expect(result.sentHtml).toContain('href="/product/CAB-000969"');
    expect(result.sentHtml).toContain('href="/product/LUG-000001"');
    expect(result.sentHtml).toContain('href="/product/GLD-000001"');
    expect(result.sentHtml).toContain('rel="canonical" href="https://www.volampelektrikals.com/"');
  });

  it("serves pre-rendered semantic HTML to crawlers (Googlebot) and clean shell to human browsers", () => {
    // 1. Crawler request (Googlebot)
    const { req: reqBot, res: resBot, next: nextBot, getResult: getBotResult } = mockHttp("/", {
      "user-agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    });
    seoPrerenderMiddleware(reqBot, resBot, nextBot);
    const botResult = getBotResult();
    expect(botResult.statusCode).toBe(200);
    expect(botResult.sentHtml).toContain("<h1");
    expect(botResult.sentHtml).toContain("Cables, Wires &amp; Electrical Store Ahmedabad (B2B &amp; B2C)");
    expect(botResult.sentHtml).toContain('href="/dealers/polycab-ahmedabad"');
    expect(botResult.sentHtml).toContain('<main style="font-family:system-ui');

    // 2. Real human browser request (Chrome on Windows)
    const { req: reqHuman, res: resHuman, next: nextHuman, getResult: getHumanResult } = mockHttp("/", {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    });
    seoPrerenderMiddleware(reqHuman, resHuman, nextHuman);
    const humanResult = getHumanResult();
    expect(humanResult.statusCode).toBe(200);
    // Human gets all meta tags in <head> for social and SEO
    expect(humanResult.sentHtml).toContain("<title>VOLAMP ELEKTRIKALS | Polycab, Finolex, KEI Dealer &amp; Distributor Ahmedabad (B2B &amp; B2C)</title>");
    expect(humanResult.sentHtml).toContain('rel="canonical" href="https://www.volampelektrikals.com/"');
    expect(humanResult.sentHtml).toContain('name="google-site-verification"');
    // But <div id="root"></div> is clean so human users never see the flash of raw text!
    expect(humanResult.sentHtml).toContain('<div id="root"></div>');
    expect(humanResult.sentHtml).not.toContain('<div id="root"><main style="font-family:system-ui');
  });

  it("prerenders category page with 200, dynamic location H1, and wire sizing matrix", () => {
    const { req, res, next, getResult } = mockHttp("/category/wire-cables");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("<h1");
    expect(result.sentHtml).toContain("Wires and Cables Supplier in Ahmedabad");
    expect(result.sentHtml).toContain("0.5 sq mm (0.5 sqmm)");
    expect(result.sentHtml).toContain('rel="canonical" href="https://www.volampelektrikals.com/category/wire-cables"');

    // Dynamic [x location] route test for Surat
    const { req: suratReq, res: suratRes, next: suratNext, getResult: getSuratResult } = mockHttp("/category/wire-cables/surat");
    seoPrerenderMiddleware(suratReq, suratRes, suratNext);
    const suratResult = getSuratResult();
    expect(suratResult.statusCode).toBe(200);
    expect(suratResult.sentHtml).toContain("Wires and Cables Supplier in Surat");
    expect(suratResult.sentHtml).toContain('rel="canonical" href="https://www.volampelektrikals.com/category/wire-cables/surat"');
  });

  it("prerenders regional dealer hub page (/dealers/polycab-ahmedabad) with 200, H1, and canonical", () => {
    const { req, res, next, getResult } = mockHttp("/dealers/polycab-ahmedabad");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("<h1");
    expect(result.sentHtml).toContain("Polycab Ahmedabad | Authorized Dealer, Distributor &amp; Master Stockist");
    expect(result.sentHtml).toContain('rel="canonical" href="https://www.volampelektrikals.com/dealers/polycab-ahmedabad"');
  });

  it("prerenders global export hub page (/export) with 200, H1, and canonical", () => {
    const { req, res, next, getResult } = mockHttp("/export");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("<h1");
    expect(result.sentHtml).toContain("Global Cable Export &amp; International Electrical Supply Desk");
    expect(result.sentHtml).toContain('rel="canonical" href="https://www.volampelektrikals.com/export"');
  });

  it("prerenders engineering blog post with 200, H1, and canonical", () => {
    const { req, res, next, getResult } = mockHttp("/blog/copper-vs-aluminium-armoured-cable-sizing-guide");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("<h1");
    expect(result.sentHtml).toContain("Copper vs Aluminium Armoured Cable Sizing Guide");
    expect(result.sentHtml).toContain('rel="canonical" href="https://www.volampelektrikals.com/blog/copper-vs-aluminium-armoured-cable-sizing-guide"');
  });

  it("prerenders product with verified specifications and clean Product schema without FAQPage", () => {
    const { req, res, next, getResult } = mockHttp("/product/CAB-000001");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("Product Specifications");
    expect(result.sentHtml).toContain("IS 694");
    expect(result.sentHtml).not.toContain("IS:7098");
    expect(result.sentHtml).not.toContain("FAQPage");
    expect(result.sentHtml).toContain('"sku":"CAB-000001"');
    expect(result.sentHtml).toContain('"unitText":"Per Meter"');
    expect(result.sentHtml).toContain("Aslali Logistics Hub, Ahmedabad");
  });

  it("serves machine-readable JSON factsheet for any product via /product/:id.json for AI models", () => {
    const { req, res, next, getResult } = mockHttp("/product/CAB-000001.json");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    const data = JSON.parse(result.sentHtml);
    expect(data.productId).toBe("CAB-000001");
    expect(data.sku).toBe("CAB-000001");
    expect(data.brand).toBe("Polycab");
    expect(data.standardsCompliance).toBe("IS 694");
    expect(data.distributor.name).toBe("VOLAMP ELEKTRIKALS PRIVATE LIMITED");
    expect(data.distributor.gstin).toBe("24AAICV0754B1ZO");
  });

  it("passes through static asset requests without intercepting", () => {
    const { req, res, next, getResult } = mockHttp("/assets/index-abc.js");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.nextCalled).toBe(true);
    expect(result.sentHtml).toBe("");
  });

  it("serves private portal routes (/portal, /employee-portal, /ceo-authorize) with noindex and X-Robots-Tag header", () => {
    const { req, res, next, getResult } = mockHttp("/portal");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain('content="noindex, nofollow"');
    expect(result.headers["x-robots-tag"]).toBe("noindex, nofollow");
  });

  it("omits offers schema for RFQ products with no public price (prevents invented prices)", () => {
    // CAB-000135 has numericPrice: 0 (RFQ)
    const { req, res, next, getResult } = mockHttp("/product/CAB-000135");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).not.toContain('"price":"100.00"');
    expect(result.sentHtml).toContain("Price on Request / RFQ");
  });

  it("ensures product schema image excludes Google Drive viewer links and uses fallback asset", () => {
    const { req, res, next, getResult } = mockHttp("/product/CAB-000001");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).not.toContain('drive.google.com');
  });

  it("prerenders product with category-specific spec rows, B2B order card, and question bank", () => {
    const { req, res, next, getResult } = mockHttp("/product/CAB-000001");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("Product Specifications");
    expect(result.sentHtml).toContain("B2B Wholesale Ordering &amp; Delivery");
    expect(result.sentHtml).toContain("Frequently Asked Technical Questions");
    expect(result.sentHtml).toContain("Related Products in this Category");
  });

  it("prerenders blog hub (/blog) listing all 15 authoritative engineering guides", () => {
    const { req, res, next, getResult } = mockHttp("/blog");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("15 Authoritative Electrical Buyer Guides &amp; Specifications");
    expect(result.sentHtml).toContain('href="/blog/how-to-read-a-cable-description"');
    expect(result.sentHtml).toContain('href="/blog/what-to-include-in-a-cable-rfq"');
  });

  it("prerenders individual blog guide with TechArticle schema, markdown tables, and next steps CTA", () => {
    const { req, res, next, getResult } = mockHttp("/blog/how-to-read-a-cable-description");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("<h1");
    expect(result.sentHtml).toContain("How to Read an Industrial Cable Description");
    expect(result.sentHtml).toContain('"@type":"TechArticle"');
    expect(result.sentHtml).toContain("Need Specific Cable Sizing or B2B Quotations?");
    expect(result.sentHtml).toContain('href="/calculator"');
  });

  it("prerenders calculator page with IS 7098 formulas and engineering disclaimer", () => {
    const { req, res, next, getResult } = mockHttp("/calculator");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("Engineering Calculation Formulas &amp; Standards");
    expect(result.sentHtml).toContain("Vd = √3 × I × L");
    expect(result.sentHtml).toContain("Engineering Disclaimer");
  });
});

