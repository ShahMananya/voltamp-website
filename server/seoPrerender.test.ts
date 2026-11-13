import { describe, expect, it } from "vitest";
import { seoPrerenderMiddleware } from "./seoPrerender";
import type { Request, Response } from "express";

function mockHttp(path: string) {
  const req = {
    method: "GET",
    path,
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
    expect(result.sentHtml).not.toContain('content="noindex, nofollow"');
  });

  it("prerenders homepage with 200, single H1, and crawlable category/product links", () => {
    const { req, res, next, getResult } = mockHttp("/");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("<h1");
    expect(result.sentHtml).toContain("Wires and Cables in Ahmedabad");
    expect(result.sentHtml).toContain('href="/category/wire-cables"');
    expect(result.sentHtml).toContain('href="/product/CAB-000001"');
    expect(result.sentHtml).toContain('rel="canonical" href="https://www.volampelektrikals.com/"');
  });

  it("prerenders category page with 200 and H1", () => {
    const { req, res, next, getResult } = mockHttp("/category/wire-cables");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("<h1");
    expect(result.sentHtml).toContain("Wires &amp; Cables");
    expect(result.sentHtml).toContain('rel="canonical" href="https://www.volampelektrikals.com/category/wire-cables"');
  });

  it("prerenders regional dealer hub page (/dealers/polycab-ahmedabad) with 200, H1, and canonical", () => {
    const { req, res, next, getResult } = mockHttp("/dealers/polycab-ahmedabad");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("<h1");
    expect(result.sentHtml).toContain("Authorized Polycab Cable Dealer &amp; Distributor in Ahmedabad, Gujarat");
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

  it("prerenders product with AEO Procurement Q&A and FAQPage schema for answer engines", () => {
    const { req, res, next, getResult } = mockHttp("/product/CAB-000001");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    expect(result.sentHtml).toContain("Procurement &amp; Engineering Q&amp;A (AEO Verified)");
    expect(result.sentHtml).toContain("FAQPage");
    expect(result.sentHtml).toContain("Manufacturer Test Certificate (MTC)");
    expect(result.sentHtml).toContain("Aslali Central Stockyard, Ahmedabad");
  });

  it("serves machine-readable JSON factsheet for any product via /product/:id.json for AI models", () => {
    const { req, res, next, getResult } = mockHttp("/product/CAB-000001.json");
    seoPrerenderMiddleware(req, res, next);
    const result = getResult();
    expect(result.statusCode).toBe(200);
    const data = JSON.parse(result.sentHtml);
    expect(data.productId).toBe("CAB-000001");
    expect(data.mtcCertified).toBe(true);
    expect(data.aeoProcurementQa).toBeDefined();
    expect(data.aeoProcurementQa.length).toBe(3);
    expect(data.distributor.name).toBe("VOLAMP ELEKTRIKALS PRIVATE LIMITED");
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
});

