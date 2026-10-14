import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { registerQuickOrderPdfRoute } from "../quickOrderPdfRoute";
import { registerGoogleMerchantRoutes } from "../googleMerchantFeed";
import { registerProductRestRoutes } from "../productRestRoutes";
import { registerSeoRoutes } from "../seoRoutes";
import { appRouter } from "../routers";
import { createContext } from "./context";

export function createExpressApp() {
  const app = express();

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Register all system routes
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  registerQuickOrderPdfRoute(app);
  registerGoogleMerchantRoutes(app);
  registerProductRestRoutes(app);
  registerSeoRoutes(app);

  // tRPC API - supports both /api/trpc and /trpc (for Vercel rewrites)
  const trpcHandler = createExpressMiddleware({
    router: appRouter,
    createContext,
  });

  app.use("/api/trpc", trpcHandler);
  app.use("/trpc", trpcHandler);

  return app;
}
