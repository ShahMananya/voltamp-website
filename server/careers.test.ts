import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createCareerApplication, getCareerApplicationById, getCareerApplications } from "./db";

describe("Careers & Talent Acquisition API", () => {
  it("retrieves open job positions with complete details and specifications", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    const roles = await caller.careers.getOpenRoles();
    expect(roles).toBeDefined();
    expect(roles.length).toBeGreaterThanOrEqual(8);

    const htLtRole = roles.find((r) => r.id === "ht-lt-cable-design-engineer");
    expect(htLtRole).toBeDefined();
    expect(htLtRole?.department).toBe("Engineering & R&D");
    expect(htLtRole?.location).toContain("Ahmedabad");
    expect(htLtRole?.responsibilities.length).toBeGreaterThan(0);
    expect(htLtRole?.requirements.length).toBeGreaterThan(0);
  });

  it("submits a job application successfully and generates a unique VOL-HR application ID", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    const result = await caller.careers.submitApplication({
      fullName: "Aniket Joshi",
      email: "aniket.joshi@example.com",
      phone: "+91 98765 43210",
      city: "Ahmedabad",
      state: "Gujarat",
      roleApplied: "Senior HT / LT Power Cable Design Engineer",
      department: "Engineering & R&D",
      experienceYears: "4-8 Years",
      highestQualification: "B.E. / B.Tech (Electrical)",
      currentCompany: "Leading Cable Manufacturer",
      currentCtc: "₹10 LPA",
      expectedCtc: "₹13 LPA",
      noticePeriod: "30 Days",
      linkedInUrl: "https://linkedin.com/in/aniket-joshi-electrical",
      resumeUrl: "https://drive.google.com/file/d/test-resume",
      coverNote: "Experienced in 33kV XLPE compounding and CPRI type testing.",
    });

    expect(result.success).toBe(true);
    expect(result.applicationId).toMatch(/^VOL-HR-\d{4}-\d{5}$/);
    expect(result.application.fullName).toBe("Aniket Joshi");
    expect(result.application.roleApplied).toBe("Senior HT / LT Power Cable Design Engineer");
    expect(result.application.status).toBe("received");
  });

  it("retrieves a submitted job application by its applicationId", async () => {
    const created = await createCareerApplication({
      fullName: "Pooja Patel",
      email: "pooja.patel@example.com",
      phone: "+91 91234 56789",
      city: "Vadodara",
      state: "Gujarat",
      roleApplied: "Graduate Engineer Trainee (GET) – Electrical (Batch 2026)",
      department: "Early Careers",
      experienceYears: "Fresh Graduate (0-1 Yrs)",
      highestQualification: "B.E. / B.Tech (Electrical)",
      noticePeriod: "Immediate",
    });

    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    const retrieved = await caller.careers.getById({
      applicationId: created.applicationId,
    });

    expect(retrieved).toBeDefined();
    expect(retrieved?.fullName).toBe("Pooja Patel");
    expect(retrieved?.department).toBe("Early Careers");
    expect(retrieved?.status).toBe("received");
  });

  it("rejects application when mandatory fields are missing", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    await expect(
      caller.careers.submitApplication({
        fullName: "",
        email: "not-an-email",
        phone: "",
        city: "",
        state: "",
        roleApplied: "",
        department: "",
        experienceYears: "",
        highestQualification: "",
        noticePeriod: "",
      })
    ).rejects.toThrow();
  });
});
