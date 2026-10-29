import type { Request, Response, NextFunction } from "express";

/**
 * Security headers & staging environment robot protection
 * Addresses Launch Blocker 8 & Launch Blocker 6
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction) {
  // 1. Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://*.google.com https://www.googletagmanager.com https://unpkg.com https://translate.google.com https://translate.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com https://www.gstatic.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  res.setHeader("Content-Security-Policy", csp);
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // 1.1 Cache Control: Immutable 1-year caching for hashed static assets
  if (req.path && (req.path.startsWith("/assets/") || /\.(js|css|woff2?|png|jpe?g|webp|svg|ico)$/i.test(req.path))) {
    if (!req.path.endsWith(".html")) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  }

  // 2. Prevent staging domain (e.g. *.vercel.app) from indexing into Google
  const host = (req.headers.host || "").toLowerCase();
  const isStaging = host.includes("vercel.app") || host.includes("onrender.com") || host.includes("localhost") === false && !host.includes("volampelektrikals.com");

  if (isStaging && !host.includes("volampelektrikals.com") && !host.includes("localhost")) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  }

  next();
}
