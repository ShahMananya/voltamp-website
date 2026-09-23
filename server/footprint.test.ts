import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("Footprint 3D Global & Domestic Presence Router", () => {
  const caller = appRouter.createCaller({
    user: null,
    req: {} as any,
    res: {} as any,
  });

  it("returns dynamic footprint overview counters", async () => {
    const overview = await caller.footprint.overview();
    expect(overview).toHaveProperty("projectsCompleted");
    expect(overview).toHaveProperty("statesServed");
    expect(overview).toHaveProperty("majorProjects");
    expect(overview).toHaveProperty("yearsOfExperience");
    expect(overview.projectsCompleted).toMatch(/\d+\+/);
    expect(overview.statesServed).toMatch(/\d+\+/);
  });

  it("returns list of footprint states with structured metadata", async () => {
    const states = await caller.footprint.states();
    expect(Array.isArray(states)).toBe(true);
    expect(states.length).toBeGreaterThanOrEqual(10);

    const gujarat = states.find((s) => s.code === "GJ");
    expect(gujarat).toBeDefined();
    expect(gujarat?.name).toBe("Gujarat");
    expect(gujarat?.projectsCompleted).toBeGreaterThanOrEqual(20);
    expect(gujarat?.industry).toContain("Industrial");
    expect(gujarat?.customerQuote).toBeTruthy();
  });

  it("returns major projects for a specific state code", async () => {
    const gjProjects = await caller.footprint.stateProjects({ stateCode: "GJ" });
    expect(Array.isArray(gjProjects)).toBe(true);
    expect(gjProjects.length).toBeGreaterThanOrEqual(1);

    const first = gjProjects[0];
    expect(first.stateCode).toBe("GJ");
    expect(first.name).toBeTruthy();
    expect(first.volampContribution).toBeTruthy();
    expect(first.heritage).toBeTruthy();
  });

  it("returns individual project by id", async () => {
    const project = await caller.footprint.project({ id: 1 });
    expect(project).toBeDefined();
    expect(project.id).toBe(1);
    expect(project.name).toContain("Sanand");
    expect(project.volampContribution).toContain("66kV");
  });
});
