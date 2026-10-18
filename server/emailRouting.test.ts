import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import * as emailService from "./services/emailService";

describe("Transactional Email Routing & Ticket Generation", () => {
  it("submits a collaboration proposal, creates ticket, and dispatches to collab@volampelektrikals.com and applicant", async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      session: null as any,
    });

    const dispatchCollabSpy = vi.spyOn(emailService, "dispatchCollaborationEmails");

    const result = await caller.collaborate.submit({
      companyName: "Gujarat Infra Grid Ltd",
      contactName: "Praveen Mehta",
      designation: "Managing Director",
      businessType: "EPC Contractor",
      collaborationTypes: ["Direct Project Sourcing", "Distribution / Dealership"],
      opportunityDetails: "Solar substation cabling contract across Saurashtra region requiring 33kV HT XLPE cables.",
      partnershipStrengths: ["Existing EPC Tender Presence", "Strong Regional Warehouse Footprint"],
      expectedBusinessPotential: "50 Lakh - 2 Crore",
      expectedTimeline: "Within 30 days",
      mobile: "+91 98765 12345",
      email: "praveen.mehta@gujarat-infra.com",
      cityCountry: "Rajkot, Gujarat, India",
      notes: "Can share project BOQ upon signing NDA.",
    });

    expect(result.success).toBe(true);
    expect(result.applicationId).toMatch(/^COL-\d{4}-\d{5}$/);
    expect(dispatchCollabSpy).toHaveBeenCalledTimes(1);
    expect(dispatchCollabSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        applicationId: result.applicationId,
        email: "praveen.mehta@gujarat-infra.com",
        companyName: "Gujarat Infra Grid Ltd",
      })
    );

    dispatchCollabSpy.mockRestore();
  });

  it("submits a formal grievance, creates CASE ticket, and dispatches to Grievances@volampelektrikals.com and complainant", async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      session: null as any,
    });

    const dispatchGrievanceSpy = vi.spyOn(emailService, "dispatchGrievanceEmails");

    const result = await caller.complaints.submit({
      fullName: "Anand Verma",
      companyName: "Apex Electrotech",
      email: "anand.verma@apexelectrotech.in",
      phone: "+91 98220 54321",
      caseType: "Transit Drum Damage",
      orderRef: "VLP-INV-9021",
      urgency: "critical",
      details: "Wooden flange arrived splintered with outer outer PVC sheath abrasion on 240 sq mm 3.5C cable reel.",
    });

    expect(result.success).toBe(true);
    expect(result.caseId).toMatch(/^CASE-\d{4}-\d{5}$/);
    expect(dispatchGrievanceSpy).toHaveBeenCalledTimes(1);
    expect(dispatchGrievanceSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        caseId: result.caseId,
        email: "anand.verma@apexelectrotech.in",
        caseType: "Transit Drum Damage",
        urgency: "critical",
      })
    );

    dispatchGrievanceSpy.mockRestore();
  });

  it("submits a media inquiry, creates PRESS ticket, and dispatches to pr@volampelektrikals.com and journalist", async () => {
    const caller = appRouter.createCaller({
      user: null as any,
      session: null as any,
    });

    const dispatchPressSpy = vi.spyOn(emailService, "dispatchPressEmails");

    const result = await caller.press.submit({
      journalistName: "Vikram Sengupta",
      mediaOutlet: "Economic Infrastructure Daily",
      email: "vikram@econdaily.com",
      phone: "+91 97110 88990",
      inquiryType: "Executive Commentary / Interview",
      deadline: "Today (Within 6-8 Hours)",
      details: "Requesting comment from Volamp leadership on conductor raw material index movements and copper volatility.",
    });

    expect(result.success).toBe(true);
    expect(result.pressTicketId).toMatch(/^PRESS-\d{4}-\d{5}$/);
    expect(dispatchPressSpy).toHaveBeenCalledTimes(1);
    expect(dispatchPressSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        pressTicketId: result.pressTicketId,
        email: "vikram@econdaily.com",
        mediaOutlet: "Economic Infrastructure Daily",
      })
    );

    dispatchPressSpy.mockRestore();
  });
});
