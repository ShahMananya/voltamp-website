import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

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
        password: "Password123!",
      })
    ).rejects.toThrow(
      "Employee registration requires an official VOLAMP email address ending in @volampelektrikals.com."
    );
  });

  it("accepts employee registration with @volampelektrikals.com email", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.registerEmployee({
      name: "Rohan Patel",
      email: "rohan@volampelektrikals.com",
      password: "VolampPassword2026",
    });

    expect(result.success).toBe(true);
    expect(result.email).toBe("rohan@volampelektrikals.com");
    expect(result.devOtp).toMatch(/^\d{6}$/);

    // Verify email OTP
    const verifyResult = await caller.auth.verifyEmailOtp({
      email: "rohan@volampelektrikals.com",
      code: result.devOtp,
    });

    expect(verifyResult.success).toBe(true);
    expect(verifyResult.accountType).toBe("employee");
    expect(verifyResult.status).toBe("pending_approval");

    // Attempting login while pending approval must be rejected
    await expect(
      caller.auth.login({
        email: "rohan@volampelektrikals.com",
        password: "VolampPassword2026",
        expectedAccountType: "employee",
      })
    ).rejects.toThrow("pending administrator approval");
  });

  it("enforces server-side MFA for approved employee login", async () => {
    const { ctx, setCookies } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Login as approved admin employee
    const loginResult = await caller.auth.login({
      email: "admin@volampelektrikals.com",
      password: "Volamp@2026",
      expectedAccountType: "employee",
    });

    // Must require MFA
    expect(loginResult.mfaRequired).toBe(true);
    expect(loginResult.mfaPendingToken).toBeDefined();
    expect(loginResult.devOtp).toMatch(/^\d{6}$/);
    // Server must NOT have set the session cookie yet
    expect(setCookies).toHaveLength(0);

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
      code: loginResult.devOtp!,
    });

    expect(mfaResult.success).toBe(true);
    expect(mfaResult.user?.email).toBe("admin@volampelektrikals.com");
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]?.name).toBe(COOKIE_NAME);
  });

  it("allows customer registration with any valid email and logs in", async () => {
    const { ctx, setCookies } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const regResult = await caller.auth.registerCustomer({
      name: "Industrial Contractor",
      email: "contractor@megabuild.in",
      password: "ClientPassword2026",
    });

    expect(regResult.success).toBe(true);
    expect(regResult.email).toBe("contractor@megabuild.in");
    expect(regResult.devOtp).toMatch(/^\d{6}$/);

    // Verify email OTP
    const verifyResult = await caller.auth.verifyEmailOtp({
      email: "contractor@megabuild.in",
      code: regResult.devOtp,
    });

    expect(verifyResult.success).toBe(true);
    expect(verifyResult.status).toBe("active");
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]?.name).toBe(COOKIE_NAME);
  });
});
