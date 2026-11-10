import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";
import { getLatestOtpForEmail } from "./db";

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createTestContext(user: any = null): { ctx: TrpcContext; setCookies: CookieCall[]; clearedCookies: any[] } {
  const setCookies: CookieCall[] = [];
  const clearedCookies: any[] = [];

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
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

describe("Authentication and MFA Flow", () => {
  it("rejects employee registration with non-@volampelektrikals.com email", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.registerEmployee({
        name: "Test Employee",
        email: "someone@gmail.com",
        department: "Engineering",
        designation: "Engineer",
        password: "Password123!",
        termsAccepted: true,
      })
    ).rejects.toThrow(
      "Employee registration requires an official VOLAMP corporate email address ending in @volampelektrikals.com"
    );
  });

  it("accepts employee registration with @volampelektrikals.com email", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const empEmail = `rohan.${Date.now()}@volampelektrikals.com`;

    const result = await caller.auth.registerEmployee({
      name: "Rohan Patel",
      email: empEmail,
      department: "Engineering",
      designation: "Senior Cable Specialist",
      employeeId: "VLT-2026-ENG99",
      password: "VolampPassword2026!",
      termsAccepted: true,
    });

    expect(result.success).toBe(true);
    expect(result.email).toBe(empEmail);

    // Code is dispatched to email, verified from backend OTP storage
    const otp = getLatestOtpForEmail(empEmail, "email_verification");
    expect(otp).toBeDefined();
    expect(otp).toMatch(/^\d{6}$/);

    // Verify email OTP
    const verifyResult = await caller.auth.verifyEmailOtp({
      email: empEmail,
      code: otp!,
    });

    expect(verifyResult.success).toBe(true);
    expect(verifyResult.accountType).toBe("employee");
    expect(verifyResult.status).toBe("pending_approval");

    // Attempting login while pending approval must be rejected
    await expect(
      caller.auth.login({
        email: "rohan@volampelektrikals.com",
        password: "VolampPassword2026!",
      })
    ).rejects.toThrow("awaiting authorization from VOLAMP management");
  });

  it("enforces server-side MFA for approved employee login and returns dynamic redirection", async () => {
    const { ctx, setCookies } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Login as approved admin employee (no role passed by client)
    const loginResult = await caller.auth.login({
      email: "admin@volampelektrikals.com",
      password: "Volamp@2026",
    });

    // Must require MFA and resolve effectiveRole & redirectUrl automatically from DB
    expect(loginResult.mfaRequired).toBe(true);
    expect(loginResult.mfaPendingToken).toBeDefined();
    if (loginResult.mfaRequired) {
      expect(loginResult.effectiveRole).toBe("admin");
      expect(loginResult.redirectUrl).toBe("/employee-portal?tab=governance");
    }
    // Server must NOT have set the session cookie yet
    expect(setCookies).toHaveLength(0);

    const mfaOtp = getLatestOtpForEmail("admin@volampelektrikals.com", "mfa");
    expect(mfaOtp).toBeDefined();
    expect(mfaOtp).toMatch(/^\d{6}$/);

    // Entering an invalid code must fail
    await expect(
      caller.auth.verifyMfaOtp({
        mfaPendingToken: loginResult.mfaPendingToken!,
        code: "000000",
      })
    ).rejects.toThrow("Invalid or expired verification code");

    // Entering the valid 6-digit OTP completes MFA and sets session cookie
    const mfaResult = await caller.auth.verifyMfaOtp({
      mfaPendingToken: loginResult.mfaPendingToken!,
      code: mfaOtp!,
    });

    expect(mfaResult.success).toBe(true);
    expect(mfaResult.user?.email).toBe("admin@volampelektrikals.com");
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]?.name).toBe(COOKIE_NAME);
  });

  it("allows customer registration with any valid email and logs in", async () => {
    const { ctx, setCookies } = createTestContext();
    const caller = appRouter.createCaller(ctx);
    const custEmail = `contractor.${Date.now()}@megabuild.in`;

    const regResult = await caller.auth.registerCustomer({
      name: "Industrial Contractor",
      email: custEmail,
      password: "ClientPassword2026",
    });

    expect(regResult.success).toBe(true);
    expect(regResult.email).toBe(custEmail);

    const customerOtp = getLatestOtpForEmail(custEmail, "email_verification");
    expect(customerOtp).toBeDefined();
    expect(customerOtp).toMatch(/^\d{6}$/);

    // Verify email OTP
    const verifyResult = await caller.auth.verifyEmailOtp({
      email: custEmail,
      code: customerOtp!,
    });

    expect(verifyResult.success).toBe(true);
    expect(verifyResult.status).toBe("active");
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]?.name).toBe(COOKIE_NAME);
  });

  it("blocks customer from logging in when email is unverified and requires verification code", async () => {
    const { ctx, setCookies } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const testEmail = `unverified.${Date.now()}@sitebuild.com`;
    await caller.auth.registerCustomer({
      name: "Unverified Buyer",
      email: testEmail,
      password: "BuyerPassword2026",
    });

    // Attempting login directly without email verification
    const loginAttempt = await caller.auth.login({
      email: testEmail,
      password: "BuyerPassword2026",
    });

    expect(loginAttempt.emailVerificationRequired).toBe(true);
    expect(loginAttempt.mfaRequired).toBe(false);
    expect(setCookies).toHaveLength(0); // No session cookie issued!

    // Verify OTP dispatched
    const otp = getLatestOtpForEmail(testEmail, "email_verification");
    expect(otp).toBeDefined();

    // Verify email with OTP
    const verifyRes = await caller.auth.verifyEmailOtp({
      email: testEmail,
      code: otp!,
    });
    expect(verifyRes.success).toBe(true);
    expect(setCookies).toHaveLength(1);

    // Subsequent login now succeeds directly with session cookie
    const { ctx: ctx2, setCookies: setCookies2 } = createTestContext();
    const caller2 = appRouter.createCaller(ctx2);
    const subsequentLogin = await caller2.auth.login({
      email: testEmail,
      password: "BuyerPassword2026",
    });
    expect(subsequentLogin.emailVerificationRequired).toBe(false);
    expect(setCookies2).toHaveLength(1);
  });
});
