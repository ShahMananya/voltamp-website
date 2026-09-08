import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export function resolveHmrClientPort(rawPort: string | undefined): number {
  const parsedPort = Number(rawPort);
  return Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 3000;
}

export async function setupVite(app: Express, server: Server) {
  const hmrClientPort = resolveHmrClientPort(process.env.PORT);
  const serverOptions = {
    middlewareMode: true as const,
    port: hmrClientPort,
    strictPort: true as const,
    // The app is served through the Express HTTP server on the exposed port.
    // Explicitly bind Vite's WebSocket transport to that same server and port
    // so the client never falls back to the standalone localhost:5173 socket.
    hmr: { server, port: hmrClientPort, clientPort: hmrClientPort },
    ws: { server, port: hmrClientPort, clientPort: hmrClientPort },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    // Vite exposes different server option unions for standalone and
    // middleware mode; this object is intentionally the middleware shape.
    server: serverOptions as any,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
