import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createCollaborateSubmission, getCollaborateSubmissionById, getCollaborateSubmissions } from "./db";

describe("Collaboration & Partnership Form API", () => {
  it("submits a complete collaboration proposal and generates a unique application reference ID", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    const result = await caller.collaborate.submit({
      companyName: "Gujarat Power & Infrastructure Pvt Ltd",
      contactName: "Bhavin Patel",
      designation: "Managing Director",
      businessType: "Distributor / Dealer",
      collaborationTypes: [
        "Distribution / Dealership",
        "Project / EPC Partnership",
      ],
      opportunityDetails: "Looking to establish an exclusive regional distribution network for industrial cables in Central Gujarat.",
      partnershipStrengths: [
        "Existing Customer / Dealer Network",
        "Sales & Distribution Capability",
      ],
      expectedBusinessPotential: "₹1 - 5 Crore",
      expectedTimeline: "Immediate / Within 30 days",
      mobile: "+91 98250 12345",
      email: "bhavin@gujaratpower.com",
      cityCountry: "Vadodara, Gujarat, India",
      notes: "Ready to visit the Ahmedabad manufacturing plant for agreement signing.",
    });

    expect(result.success).toBe(true);
    expect(result.applicationId).toMatch(/^COL-\d{4}-\d{5}$/);
    expect(result.submission.companyName).toBe("Gujarat Power & Infrastructure Pvt Ltd");
    expect(result.submission.status).toBe("submitted");
  });

  it("can retrieve a submitted application by its unique applicationId", async () => {
    const created = await createCollaborateSubmission({
      companyName: "Apex Solar & EPC Solutions",
      contactName: "Sneha Nair",
      designation: "Procurement Lead",
      businessType: "EPC / Contractor",
      collaborationTypes: ["OEM / Private Label"],
      opportunityDetails: "Procurement of 100km Solar DC cables for utility scale solar park.",
      partnershipStrengths: ["Existing Projects", "Technical Expertise"],
      expectedBusinessPotential: "₹5 Crore+",
      expectedTimeline: "1 - 3 months",
      mobile: "+91 99000 54321",
      email: "sneha@apexsolar.com",
      cityCountry: "Bengaluru, Karnataka, India",
    });

    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    const retrieved = await caller.collaborate.getById({
      applicationId: created.applicationId,
    });

    expect(retrieved).not.toBeNull();
    expect(retrieved?.companyName).toBe("Apex Solar & EPC Solutions");
    expect(retrieved?.contactName).toBe("Sneha Nair");
  });

  it("fails when required fields are missing", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    await expect(
      caller.collaborate.submit({
        companyName: "",
        contactName: "",
        designation: "",
        businessType: "",
        collaborationTypes: [],
        opportunityDetails: "",
        partnershipStrengths: [],
        expectedBusinessPotential: "",
        expectedTimeline: "",
        mobile: "",
        email: "invalid-email",
        cityCountry: "",
      })
    ).rejects.toThrow();
  });
});
