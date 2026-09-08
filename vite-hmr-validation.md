# Vite HMR WebSocket Validation

## Diagnosis

The development app is served through the Express HTTP server on port 3000, but Vite’s middleware-mode HMR client was using a standalone fallback port. The generated client initially exposed `localhost:5173`, and after the first partial configuration it exposed Vite’s default HMR port `24678`. Through the preview reverse proxy, this produced the browser error that the HMR WebSocket could not connect.

## Fix

`server/_core/vite.ts` now resolves a valid HMR client port from `PORT`, defaulting safely to 3000, and configures both the legacy `hmr` settings and current `ws` settings against the existing Express server. The configuration explicitly uses the same port for the server and client and enables strict-port behavior, preventing Vite from silently selecting a second internal port.

The served `/@vite/client` now reports:

```text
serverHost = "localhost:3000/"
hmrPort = 3000
directSocketHost = "localhost:3000/"
```

This removes the incorrect `localhost:5173` fallback path from the generated development client.

## Verification

The project was restarted after the configuration change. TypeScript passed, and all six Vitest tests passed across four test files, including the new `server/vite.hmr.test.ts` coverage for valid, missing, and invalid `PORT` values. The browser-console log contains only the earlier HMR errors from before the final restart; no new HMR failure was emitted after the client began advertising port 3000.
