import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerQuickOrderPdfRoute } from "../quickOrderPdfRoute";
import { registerGoogleMerchantRoutes } from "../googleMerchantFeed";
import { registerProductRestRoutes } from "../productRestRoutes";
import { registerSeoRoutes } from "../seoRoutes";
import { registerLiveMetalRoutes } from "../liveMetalRoutes";
import { securityHeadersMiddleware } from "../securityHeaders";
import { redirectsMiddleware } from "../redirects";
import { seoPrerenderMiddleware } from "../seoPrerender";
import { appRouter } from "../routers";
import { createContext } from "./context";

export function createExpressApp() {
  const app = express();

  // 1. Security Headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Staging Noindex)
  app.use(securityHeadersMiddleware);

  // 2. Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // 3. WordPress 301 Redirects & Query Cleaners
  app.use(redirectsMiddleware);

  // 4. Register all system routes
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerQuickOrderPdfRoute(app);
  registerGoogleMerchantRoutes(app);
  registerProductRestRoutes(app);
  registerSeoRoutes(app);
  registerLiveMetalRoutes(app);

  // 5. tRPC API - supports /api/trpc, /trpc, and catches Vercel rewritten paths
  const trpcHandler = createExpressMiddleware({
    router: appRouter,
    createContext,
  });

  app.use("/api/trpc", trpcHandler);
  app.use("/trpc", trpcHandler);

  // Catch any Vercel rewritten requests where /api or /api/trpc might have been forwarded directly
  app.use((req, res, next) => {
    const url = req.url || "";
    if (url.includes("products.") || url.includes("auth.") || url.includes("quotes.") || url.includes("cart.") || url.includes("orders.")) {
      return trpcHandler(req, res, next);
    }
    next();
  });

  // 6. Server-Side SEO Prerender & Real 404 handler for HTML routes
  app.use(seoPrerenderMiddleware);

  return app;
}
