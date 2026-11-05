import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import {
  getLatestOtpForEmail,
  getLatestApprovalTokenForEmail,
  createEmployeeApprovalToken,
  getUserByEmail,
  getEmployeeAuditLogs,
} from "./db";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createTestContext(user: any = null): {
  ctx: TrpcContext;
  setCookies: CookieCall[];
  clearedCookies: any[];
} {
  const setCookies: CookieCall[] = [];
  const clearedCookies: any[] = [];

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {
        "x-forwarded-for": "192.168.1.100",
        "user-agent": "Vitest-Test-Runner/1.0",
      },
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, setCookies, clearedCookies };
}

describe("VOLTAMP Employee Registration & CEO Email Authorization Protocol", () => {
  // =========================================================================
  // 1. REGISTRATION VALIDATION & DOMAIN CHECKS
  // =========================================================================
  describe("1. Domain & Input Validation", () => {
    it("rejects personal email domains (gmail, yahoo, outlook, icloud, hotmail)", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const personalEmails = [
        "john.doe@gmail.com",
        "jane.smith@yahoo.com",
        "engineer@outlook.com",
        "technician@icloud.com",
        "contractor@hotmail.com",
        "vendor@externalcompany.in",
      ];

      for (const email of personalEmails) {
        await expect(
          caller.auth.registerEmployee({
            name: "Candidate Employee",
            email,
            department: "Engineering",
            designation: "Site Engineer",
            password: "SecurePass@2026",
            termsAccepted: true,
          })
        ).rejects.toThrow(
          "Employee registration requires an official VOLAMP corporate email address ending in @volampelektrikals.com"
        );
      }
    });

    it("rejects weak passwords failing security complexity guidelines", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const weakPasswords = [
        "short1!", // too short (< 8 chars)
        "alllowercase123!", // no uppercase
        "ALLUPPERCASE123!", // no lowercase
        "NoDigitsHereAtAll!", // no digits
        "NoSpecialChar1234", // no special char
      ];

      for (const pwd of weakPasswords) {
        await expect(
          caller.auth.registerEmployee({
            name: "Candidate Employee",
            email: "valid.candidate@volampelektrikals.com",
            department: "Design",
            designation: "Cad Designer",
            password: pwd,
            termsAccepted: true,
          })
        ).rejects.toThrow(/Password must/);
      }
    });

    it("requires acceptance of company terms and privacy policy", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.registerEmployee({
          name: "Candidate Employee",
          email: "candidate.terms@volampelektrikals.com",
          department: "Quality Assurance",
          designation: "QA Inspector",
          password: "SecurePass@2026",
          termsAccepted: false,
        })
      ).rejects.toThrow(/accept.*terms/i);
    });
  });

  // =========================================================================
  // 2. FULL EMPLOYEE REGISTRATION, OTP VERIFICATION & CEO NOTIFICATION
  // =========================================================================
  describe("2. Full Employee Lifecycle - Approval Flow", () => {
    const candidateEmail = "priya.sharma@volampelektrikals.com";
    const candidatePassword = "PriyaVoltamp@2026";
    let approveTokenStr = "";
    let rejectTokenStr = "";

    it("registers new employee, enters pending_verification, and dispatches OTP", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const regResult = await caller.auth.registerEmployee({
        name: "Priya Sharma",
        email: candidateEmail,
        department: "R&D High Voltage",
        designation: "Chief Transformer Designer",
        employeeId: "VLT-2026-RD042",
        password: candidatePassword,
        termsAccepted: true,
      });

      expect(regResult.success).toBe(true);
      expect(regResult.email).toBe(candidateEmail);
      expect(regResult.status).toBe("pending_verification");

      // Verify user in db has pending_verification
      const user = await getUserByEmail(candidateEmail);
      expect(user).toBeDefined();
      expect(user?.employeeStatus).toBe("pending_verification");
      expect(user?.department).toBe("R&D High Voltage");
      expect(user?.designation).toBe("Chief Transformer Designer");
      expect(user?.employeeId).toBe("VLT-2026-RD042");

      // Check OTP generated in DB
      const otp = getLatestOtpForEmail(candidateEmail, "email_verification");
      expect(otp).toBeDefined();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it("prevents duplicate registration with the same company email", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.registerEmployee({
          name: "Duplicate Priya",
          email: candidateEmail,
          department: "R&D",
          designation: "Engineer",
          password: candidatePassword,
          termsAccepted: true,
        })
      ).rejects.toThrow(/already exists/i);
    });

    it("rejects invalid email verification OTP", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.verifyEmailOtp({
          email: candidateEmail,
          code: "999999",
        })
      ).rejects.toThrow(/Invalid or expired verification code/);
    });

    it("verifies OTP, updates status to pending_approval, generates single-use CEO tokens, and returns exact spec message", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const validOtp = getLatestOtpForEmail(candidateEmail, "email_verification");
      expect(validOtp).toBeDefined();

      const verifyResult = await caller.auth.verifyEmailOtp({
        email: candidateEmail,
        code: validOtp!,
      });

      expect(verifyResult.success).toBe(true);
      expect(verifyResult.accountType).toBe("employee");
      expect(verifyResult.status).toBe("pending_approval");
      // Check required spec wording
      expect(verifyResult.message).toContain("Your employee registration has been successfully submitted and verified");
      expect(verifyResult.message).toContain("Your account is currently awaiting authorization from VOLAMP management");
      expect(verifyResult.message).toContain("You will receive an email once your registration is reviewed");

      // Check DB status
      const user = await getUserByEmail(candidateEmail);
      expect(user?.employeeStatus).toBe("pending_approval");

      // Retrieve CEO approval and rejection tokens generated
      const approveToken = await getLatestApprovalTokenForEmail(candidateEmail, "approve");
      const rejectToken = await getLatestApprovalTokenForEmail(candidateEmail, "reject");

      expect(approveToken).toBeDefined();
      expect(approveToken?.action).toBe("approve");
      expect(approveToken?.usedAt).toBeNull();
      approveTokenStr = approveToken!.token;

      expect(rejectToken).toBeDefined();
      expect(rejectToken?.action).toBe("reject");
      expect(rejectToken?.usedAt).toBeNull();
      rejectTokenStr = rejectToken!.token;
    });

    it("blocks employee login while status is pending_approval with the exact required copy", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: candidateEmail,
          password: candidatePassword,
        })
      ).rejects.toThrow(
        "Your employee registration has been successfully submitted and verified. Your account is currently awaiting authorization from VOLAMP management. You will receive an email once your registration is reviewed."
      );
    });

    it("validates CEO token info publicly via getApprovalRequestInfo without modifying account state", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const tokenInfo = await caller.employee.getApprovalRequestInfo({
        token: approveTokenStr,
      });

      expect(tokenInfo.valid).toBe(true);
      if (tokenInfo.valid) {
        expect(tokenInfo.action).toBe("approve");
        expect(tokenInfo.employee?.name).toBe("Priya Sharma");
        expect(tokenInfo.employee?.email).toBe(candidateEmail);
        expect(tokenInfo.employee?.department).toBe("R&D High Voltage");
        expect(tokenInfo.employee?.designation).toBe("Chief Transformer Designer");
        expect(tokenInfo.employee?.employeeId).toBe("VLT-2026-RD042");
        expect(tokenInfo.employee?.currentStatus).toBe("pending_approval");
      }

      // Ensure the account is STILL pending_approval (opening the link did NOT mutate state)
      const user = await getUserByEmail(candidateEmail);
      expect(user?.employeeStatus).toBe("pending_approval");
    });

    it("rejects unauthorized non-CEO callers trying to process CEO decision", async () => {
      // 1. Unauthenticated caller
      const { ctx: unauthCtx } = createTestContext(null);
      const unauthCaller = appRouter.createCaller(unauthCtx);

      await expect(
        unauthCaller.employee.processCeoDecision({
          token: approveTokenStr,
          decision: "approve",
        })
      ).rejects.toThrow();

      // 2. Standard customer caller
      const { ctx: customerCtx } = createTestContext({
        id: 99,
        email: "customer@gmail.com",
        role: "user",
        accountType: "customer",
      });
      const customerCaller = appRouter.createCaller(customerCtx);

      await expect(
        customerCaller.employee.processCeoDecision({
          token: approveTokenStr,
          decision: "approve",
        })
      ).rejects.toThrow(/Only the CEO \(ceo@volampelektrikals\.com\) or Executive Administrator can authorize/);
    });

    it("allows authenticated CEO to explicitly approve employee", async () => {
      // CEO authenticated session
      const { ctx: ceoCtx } = createTestContext({
        id: 1,
        email: "ceo@volampelektrikals.com",
        name: "Executive CEO",
        role: "admin",
        accountType: "employee",
      });
      const ceoCaller = appRouter.createCaller(ceoCtx);

      const decisionResult = await ceoCaller.employee.processCeoDecision({
        token: approveTokenStr,
        decision: "approve",
        reason: "Approved for R&D High Voltage Division. Welcome to VOLTAMP.",
      });

      expect(decisionResult.success).toBe(true);
      expect(decisionResult.decision).toBe("approve");
      expect(decisionResult.employeeName).toBe("Priya Sharma");
      expect(decisionResult.employeeEmail).toBe(candidateEmail);

      // Verify user in db is now approved
      const user = await getUserByEmail(candidateEmail);
      expect(user?.employeeStatus).toBe("approved");
      expect(user?.approvedBy).toBe("ceo@volampelektrikals.com");
      expect(user?.approvedAt).toBeDefined();

      // Verify token is now marked as used
      const tokenRecord = await getLatestApprovalTokenForEmail(candidateEmail, "approve");
      expect(tokenRecord?.usedAt).toBeDefined();
      expect(tokenRecord?.usedBy).toBe("ceo@volampelektrikals.com");
    });

    it("rejects re-use of the already used approval token (single-use enforcement)", async () => {
      const { ctx: ceoCtx } = createTestContext({
        id: 1,
        email: "ceo@volampelektrikals.com",
        role: "admin",
        accountType: "employee",
      });
      const ceoCaller = appRouter.createCaller(ceoCtx);

      await expect(
        ceoCaller.employee.processCeoDecision({
          token: approveTokenStr,
          decision: "approve",
        })
      ).rejects.toThrow(/This authorization token has already been processed and cannot be reused/);
    });

    it("allows the approved employee to log in with MFA and access the Employee Portal", async () => {
      const { ctx, setCookies } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Step 1: Login with credentials
      const loginResult = await caller.auth.login({
        email: candidateEmail,
        password: candidatePassword,
      });

      expect(loginResult.mfaRequired).toBe(true);
      expect(loginResult.mfaPendingToken).toBeDefined();
      expect(setCookies).toHaveLength(0); // Session cookie withheld until MFA

      // Step 2: Retrieve MFA OTP
      const mfaOtp = getLatestOtpForEmail(candidateEmail, "mfa");
      expect(mfaOtp).toBeDefined();
      expect(mfaOtp).toMatch(/^\d{6}$/);

      // Step 3: Complete MFA verification
      const mfaResult = await caller.auth.verifyMfaOtp({
        mfaPendingToken: loginResult.mfaPendingToken!,
        code: mfaOtp!,
      });

      expect(mfaResult.success).toBe(true);
      expect(mfaResult.user?.email).toBe(candidateEmail);
      expect(mfaResult.user?.accountType).toBe("employee");
      expect(mfaResult.user?.employeeStatus).toBe("approved");
      expect(setCookies).toHaveLength(1);
      expect(setCookies[0]?.name).toBe(COOKIE_NAME);
    });
  });

  // =========================================================================
  // 3. EMPLOYEE REJECTION FLOW
  // =========================================================================
  describe("3. Employee Lifecycle - Rejection Flow", () => {
    const candidateEmail = "vikram.singh@volampelektrikals.com";
    const candidatePassword = "VikramVoltamp@2026";
    let rejectTokenStr = "";

    it("registers candidate, completes email OTP, and creates pending_approval state", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await caller.auth.registerEmployee({
        name: "Vikram Singh",
        email: candidateEmail,
        department: "Procurement",
        designation: "Assistant Purchase Officer",
        password: candidatePassword,
        termsAccepted: true,
      });

      const otp = getLatestOtpForEmail(candidateEmail, "email_verification");
      expect(otp).toBeDefined();

      await caller.auth.verifyEmailOtp({
        email: candidateEmail,
        code: otp!,
      });

      const rejectToken = await getLatestApprovalTokenForEmail(candidateEmail, "reject");
      expect(rejectToken).toBeDefined();
      rejectTokenStr = rejectToken!.token;
    });

    it("allows CEO to reject registration with official reason", async () => {
      const { ctx: ceoCtx } = createTestContext({
        id: 1,
        email: "ceo@volampelektrikals.com",
        role: "admin",
        accountType: "employee",
      });
      const ceoCaller = appRouter.createCaller(ceoCtx);

      const decisionResult = await ceoCaller.employee.processCeoDecision({
        token: rejectTokenStr,
        decision: "reject",
        reason: "Position filled externally; candidate not on approved roster.",
      });

      expect(decisionResult.success).toBe(true);
      expect(decisionResult.decision).toBe("reject");

      // Verify db status is rejected and reason recorded
      const user = await getUserByEmail(candidateEmail);
      expect(user?.employeeStatus).toBe("rejected");
      expect(user?.rejectionReason).toContain("Position filled externally");
    });

    it("blocks login for rejected employees", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: candidateEmail,
          password: candidatePassword,
        })
      ).rejects.toThrow(/not authorized by executive management/);
    });
  });

  // =========================================================================
  // 4. TOKEN SECURITY & EXPIRATION HANDLING
  // =========================================================================
  describe("4. Token Security & Expiration Policies", () => {
    it("rejects invalid or forged authorization tokens", async () => {
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const info = await caller.employee.getApprovalRequestInfo({
        token: "completely_fake_and_invalid_token_1234567890",
      });

      expect(info.valid).toBe(false);
      if (!info.valid) {
        expect(info.error).toContain("invalid or could not be found");
      }
    });

    it("rejects expired authorization tokens (past 24h lifetime)", async () => {
      const testEmail = "expired.test@volampelektrikals.com";
      // Create an already-expired token directly
      const expiredToken = await createEmployeeApprovalToken({
        userId: 999,
        employeeEmail: testEmail,
        action: "approve",
        expiresInMs: -1000, // expired 1s ago
      });

      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const info = await caller.employee.getApprovalRequestInfo({
        token: expiredToken.token,
      });

      expect(info.valid).toBe(false);
      if (!info.valid) {
        expect(info.error).toContain("expired after 24 hours");
      }

      // Attempting to execute decision with expired token throws BAD_REQUEST
      const { ctx: ceoCtx } = createTestContext({
        id: 1,
        email: "ceo@volampelektrikals.com",
        role: "admin",
      });
      const ceoCaller = appRouter.createCaller(ceoCtx);

      await expect(
        ceoCaller.employee.processCeoDecision({
          token: expiredToken.token,
          decision: "approve",
        })
      ).rejects.toThrow(/This authorization token has expired/);
    });
  });

  // =========================================================================
  // 5. EMPLOYEE ACCOUNT LIFECYCLE MANAGEMENT (CEO GOVERNANCE)
  // =========================================================================
  describe("5. Account Lifecycle Management (CEO Governance)", () => {
    const candidateEmail = "priya.sharma@volampelektrikals.com";
    const candidatePassword = "PriyaVoltamp@2026";

    it("allows CEO to suspend an active employee account", async () => {
      const user = await getUserByEmail(candidateEmail);
      expect(user).toBeDefined();

      const { ctx: ceoCtx } = createTestContext({
        id: 1,
        email: "ceo@volampelektrikals.com",
        role: "admin",
      });
      const ceoCaller = appRouter.createCaller(ceoCtx);

      const suspendResult = await ceoCaller.employee.manageEmployeeStatus({
        userId: user!.id,
        action: "suspend",
        reason: "Temporary compliance review in progress",
      });

      expect(suspendResult.success).toBe(true);
      expect(suspendResult.action).toBe("suspend");

      // Verify db status
      const updatedUser = await getUserByEmail(candidateEmail);
      expect(updatedUser?.employeeStatus).toBe("suspended");

      // Attempting login while suspended must be blocked
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: candidateEmail,
          password: candidatePassword,
        })
      ).rejects.toThrow(/suspended/);
    });

    it("allows CEO to reactivate a suspended employee account", async () => {
      const user = await getUserByEmail(candidateEmail);
      expect(user).toBeDefined();

      const { ctx: ceoCtx } = createTestContext({
        id: 1,
        email: "ceo@volampelektrikals.com",
        role: "admin",
      });
      const ceoCaller = appRouter.createCaller(ceoCtx);

      const reactivateResult = await ceoCaller.employee.manageEmployeeStatus({
        userId: user!.id,
        action: "reactivate",
      });

      expect(reactivateResult.success).toBe(true);
      expect(reactivateResult.action).toBe("reactivate");

      // Verify db status
      const updatedUser = await getUserByEmail(candidateEmail);
      expect(updatedUser?.employeeStatus).toBe("approved");

      // Verify employee can now log in again
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const loginResult = await caller.auth.login({
        email: candidateEmail,
        password: candidatePassword,
      });
      expect(loginResult.mfaRequired).toBe(true);
    });

    it("allows CEO to deactivate an employee account", async () => {
      const user = await getUserByEmail(candidateEmail);
      expect(user).toBeDefined();

      const { ctx: ceoCtx } = createTestContext({
        id: 1,
        email: "ceo@volampelektrikals.com",
        role: "admin",
      });
      const ceoCaller = appRouter.createCaller(ceoCtx);

      const deactivateResult = await ceoCaller.employee.manageEmployeeStatus({
        userId: user!.id,
        action: "deactivate",
        reason: "Contract term concluded",
      });

      expect(deactivateResult.success).toBe(true);
      expect(deactivateResult.action).toBe("deactivate");

      // Verify db status
      const updatedUser = await getUserByEmail(candidateEmail);
      expect(updatedUser?.employeeStatus).toBe("deactivated");

      // Attempting login while deactivated must be blocked
      const { ctx } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.login({
          email: candidateEmail,
          password: candidatePassword,
        })
      ).rejects.toThrow(/deactivated/);
    });
  });

  // =========================================================================
  // 6. AUDIT TRAIL LOGGING INTEGRITY
  // =========================================================================
  describe("6. Complete Audit Trail Verification", () => {
    it("records chronological security audit logs for all employee actions", async () => {
      const { ctx: ceoCtx } = createTestContext({
        id: 1,
        email: "ceo@volampelektrikals.com",
        role: "admin",
      });
      const ceoCaller = appRouter.createCaller(ceoCtx);

      const logs = await ceoCaller.employee.listAuditLogs({ limit: 50 });
      expect(logs).toBeDefined();
      expect(logs.length).toBeGreaterThanOrEqual(5);

      const actionsLogged = logs.map((l) => l.action);

      // Verify expected security audit event types are present
      expect(actionsLogged).toContain("REGISTERED");
      expect(actionsLogged).toContain("EMAIL_VERIFIED");
      expect(actionsLogged).toContain("CEO_APPROVAL_DISPATCHED");
      expect(actionsLogged).toContain("CEO_APPROVED");
      expect(actionsLogged).toContain("CEO_REJECTED");
      expect(actionsLogged).toContain("EMPLOYEE_SUSPENDED");
      expect(actionsLogged).toContain("EMPLOYEE_REACTIVATED");
      expect(actionsLogged).toContain("EMPLOYEE_DEACTIVATED");
    });
  });

  // =========================================================================
  // 7. PORTAL ISOLATION: CUSTOMER VS EMPLOYEE
  // =========================================================================
  describe("7. Customer & Employee Experience Separation", () => {
    it("allows customer registration with non-corporate email without CEO intervention", async () => {
      const { ctx, setCookies } = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const custEmail = "adani.contractor@adaniinfra.com";
      const custResult = await caller.auth.registerCustomer({
        name: "Adani Infrastructure Procurement",
        email: custEmail,
        password: "CustomerSecure@2026",
      });

      expect(custResult.success).toBe(true);

      const otp = getLatestOtpForEmail(custEmail, "email_verification");
      expect(otp).toBeDefined();

      const verifyResult = await caller.auth.verifyEmailOtp({
        email: custEmail,
        code: otp!,
      });

      // Customer account activates immediately upon email verification
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.status).toBe("active");
      expect(verifyResult.accountType).toBe("customer");
      expect(setCookies).toHaveLength(1); // Customer logs in directly
    });

    it("prevents customer account from accessing CEO governance procedures", async () => {
      const { ctx: customerCtx } = createTestContext({
        id: 101,
        email: "adani.contractor@adaniinfra.com",
        role: "user",
        accountType: "customer",
      });
      const customerCaller = appRouter.createCaller(customerCtx);

      await expect(customerCaller.employee.listEmployees()).rejects.toThrow(
        /Administrative privileges required/
      );

      await expect(customerCaller.employee.listAuditLogs({ limit: 10 })).rejects.toThrow(
        /Administrative privileges required/
      );
    });
  });
});
