import { describe, expect, it } from "vitest";
import { resolveHmrClientPort } from "./_core/vite";

describe("resolveHmrClientPort", () => {
  it("uses the exposed application port when PORT is valid", () => {
    expect(resolveHmrClientPort("3000")).toBe(3000);
    expect(resolveHmrClientPort("4173")).toBe(4173);
  });

  it("falls back to the application default for missing or invalid values", () => {
    expect(resolveHmrClientPort(undefined)).toBe(3000);
    expect(resolveHmrClientPort("")).toBe(3000);
    expect(resolveHmrClientPort("5173abc")).toBe(3000);
    expect(resolveHmrClientPort("0")).toBe(3000);
  });
});
