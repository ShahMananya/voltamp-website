import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createEnquiry, getEnquiryByNumber } from "./db";

describe("Direct Enquire Now Form API", () => {
  it("submits a project enquiry and generates a unique ENQ-YYYY-XXXXX reference ID", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    const result = await caller.enquiry.submit({
      fullName: "Rajesh Sharma",
      companyName: "Metro Rail EPC Contractors Ltd",
      email: "rajesh.sharma@metrorail.in",
      phone: "+91 98765 43210",
      location: "Surat, Gujarat, India",
      category: "Wire & Cables",
      quantity: "3,500 meters",
      urgency: "Immediate / Within 1 week",
      details: "Need 1.1kV 3.5C x 185 sqmm Aluminium XLPE Armoured cable with IS 7098 (Part 1) test reports for tunnel electrification.",
    });

    expect(result.success).toBe(true);
    expect(result.enquiryNumber).toMatch(/^ENQ-\d{4}-\d{5}$/);
    expect(result.enquiry.fullName).toBe("Rajesh Sharma");
    expect(result.enquiry.companyName).toBe("Metro Rail EPC Contractors Ltd");
    expect(result.enquiry.status).toBe("received");
  });

  it("retrieves a submitted enquiry by its reference number", async () => {
    const created = await createEnquiry({
      fullName: "Anand Verma",
      companyName: "Verma Electricals",
      email: "anand@vermaelectricals.com",
      phone: "+91 98111 22334",
      location: "Indore, Madhya Pradesh",
      category: "Switchgear & Distribution",
      quantity: "24 units",
      urgency: "Standard (1-2 weeks)",
      details: "400A 4P MCCB 36kA microprocessor trip units required.",
    });

    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    const found = await caller.enquiry.getByNumber({ enquiryNumber: created.enquiryNumber });
    expect(found).not.toBeNull();
    expect(found?.fullName).toBe("Anand Verma");
    expect(found?.category).toBe("Switchgear & Distribution");
  });

  it("rejects invalid email or short details with validation errors", async () => {
    const caller = appRouter.createCaller({
      req: {} as any,
      res: { cookie: () => {}, clearCookie: () => {} } as any,
      user: null,
    });

    await expect(
      caller.enquiry.submit({
        fullName: "R",
        email: "not-an-email",
        phone: "123",
        details: "Hi",
      })
    ).rejects.toThrow();
  });
});
