import { describe, expect, it } from "vitest";
import { redirectsMiddleware } from "./redirects";
import type { Request, Response } from "express";

function mockReqRes(path: string, query: Record<string, string> = {}) {
  const req = {
    method: "GET",
    path,
    query,
  } as unknown as Request;

  let redirectedStatus: number | null = null;
  let redirectedUrl: string | null = null;
  let nextCalled = false;

  const res = {
    redirect: (statusOrUrl: any, url?: string) => {
      if (typeof statusOrUrl === "number") {
        redirectedStatus = statusOrUrl;
        redirectedUrl = url || "";
      } else {
        redirectedStatus = 302;
        redirectedUrl = statusOrUrl;
      }
    },
  } as unknown as Response;

  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, getRedirect: () => ({ status: redirectedStatus, url: redirectedUrl, nextCalled }) };
}

describe("WordPress Migration 301 Redirects", () => {
  it("redirects legacy WooCommerce category URLs", () => {
    const { req, res, next, getRedirect } = mockReqRes("/product-category/wires-and-cables");
    redirectsMiddleware(req, res, next);
    expect(getRedirect().status).toBe(301);
    expect(getRedirect().url).toBe("/category/wire-cables");
  });

  it("redirects legacy WooCommerce switchgear category", () => {
    const { req, res, next, getRedirect } = mockReqRes("/product-category/switchgear");
    redirectsMiddleware(req, res, next);
    expect(getRedirect().status).toBe(301);
    expect(getRedirect().url).toBe("/category/switch-gears");
  });

  it("redirects legacy slug-based product URLs to search", () => {
    const { req, res, next, getRedirect } = mockReqRes("/product/polycab-3c-185-sqmm-cable");
    redirectsMiddleware(req, res, next);
    expect(getRedirect().status).toBe(301);
    expect(getRedirect().url).toBe("/products?search=polycab%203c%20185%20sqmm%20cable");
  });

  it("does NOT redirect modern catalog product IDs", () => {
    const { req, res, next, getRedirect } = mockReqRes("/product/CAB-000001");
    redirectsMiddleware(req, res, next);
    expect(getRedirect().status).toBeNull();
    expect(getRedirect().nextCalled).toBe(true);
  });

  it("redirects legacy /shop and /shop/* to /products", () => {
    const { req, res, next, getRedirect } = mockReqRes("/shop/page/2");
    redirectsMiddleware(req, res, next);
    expect(getRedirect().status).toBe(301);
    expect(getRedirect().url).toBe("/products");
  });

  it("redirects demo junk like /hello-world to home", () => {
    const { req, res, next, getRedirect } = mockReqRes("/hello-world");
    redirectsMiddleware(req, res, next);
    expect(getRedirect().status).toBe(301);
    expect(getRedirect().url).toBe("/");
  });

  it("redirects old static pages like /about-us and /contact-us", () => {
    const { req, res, next, getRedirect } = mockReqRes("/about-us");
    redirectsMiddleware(req, res, next);
    expect(getRedirect().status).toBe(301);
    expect(getRedirect().url).toBe("/about-volamp");
  });

  it("redirects old query parameters like /?p=123", () => {
    const { req, res, next, getRedirect } = mockReqRes("/", { p: "123" });
    redirectsMiddleware(req, res, next);
    expect(getRedirect().status).toBe(301);
    expect(getRedirect().url).toBe("/");
  });

  it("redirects legacy category aliases like /category/switchgear and empty categories", () => {
    const { req, res, next, getRedirect } = mockReqRes("/category/switchgear");
    redirectsMiddleware(req, res, next);
    expect(getRedirect().status).toBe(301);
    expect(getRedirect().url).toBe("/category/switch-gears");

    const { req: req2, res: res2, next: next2, getRedirect: getRedirect2 } = mockReqRes("/category/industrial-automation");
    redirectsMiddleware(req2, res2, next2);
    expect(getRedirect2().status).toBe(301);
    expect(getRedirect2().url).toBe("/category/switch-gears");
  });
});

