import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import {
  createLocalUser,
  getLatestOtpForEmail,
  getUserByEmail,
  updateUser,
} from "./db";
import type { TrpcContext } from "./_core/context";

function createTestContext(user?: any): {
  ctx: TrpcContext;
  setCookies: { name: string; value: string; options: any }[];
} {
  const setCookies: { name: string; value: string; options: any }[] = [];
  const ctx: TrpcContext = {
    user: user || null,
    req: {
      protocol: "https",
      headers: { host: "volampelektrikals.com" },
    } as any,
    res: {
      cookie: (name: string, value: string, options: any) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: () => {},
    } as any,
  };
  return { ctx, setCookies };
}

describe("Role-Based Authentication & Dynamic Dashboard Redirection Test Suite", () => {
  it("Scenario 1: CEO/Admin Login -> Automatically returns effectiveRole 'admin' and redirectUrl '/employee-portal?tab=governance'", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const loginResult = await caller.auth.login({
      email: "ceo@volampelektrikals.com",
      password: "Volamp@2026",
    });

    expect(loginResult.mfaRequired).toBe(true);
    if (loginResult.mfaRequired) {
      expect(loginResult.effectiveRole).toBe("admin");
      expect(loginResult.redirectUrl).toBe("/employee-portal?tab=governance");

      const otp = getLatestOtpForEmail("ceo@volampelektrikals.com", "mfa");
      expect(otp).toBeDefined();

      const mfaResult = await caller.auth.verifyMfaOtp({
        mfaPendingToken: loginResult.mfaPendingToken,
        code: otp!,
      });

      expect(mfaResult.success).toBe(true);
      expect(mfaResult.effectiveRole).toBe("admin");
      expect(mfaResult.redirectUrl).toBe("/employee-portal?tab=governance");
      expect(mfaResult.user.role).toBe("admin");
      expect(mfaResult.user.accountType).toBe("employee");
    }
  });

  it("Scenario 2: Approved Staff Employee Login -> Automatically returns effectiveRole 'employee' and redirectUrl '/employee-portal'", async () => {
    // Create an approved staff employee
    const staffEmail = "vikram.sharma@volampelektrikals.com";
    let staffUser = await getUserByEmail(staffEmail);
    if (!staffUser) {
      staffUser = await createLocalUser({
        name: "Vikram Sharma",
        email: staffEmail,
        password: "StaffPassword@2026",
        role: "user",
        accountType: "employee",
        employeeStatus: "approved",
        emailVerified: true,
      });
    }

    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const loginResult = await caller.auth.login({
      email: staffEmail,
      password: "StaffPassword@2026",
    });

    expect(loginResult.mfaRequired).toBe(true);
    if (loginResult.mfaRequired) {
      expect(loginResult.effectiveRole).toBe("employee");
      expect(loginResult.redirectUrl).toBe("/employee-portal");

      const otp = getLatestOtpForEmail(staffEmail, "mfa");
      expect(otp).toBeDefined();

      const mfaResult = await caller.auth.verifyMfaOtp({
        mfaPendingToken: loginResult.mfaPendingToken,
        code: otp!,
      });

      expect(mfaResult.success).toBe(true);
      expect(mfaResult.effectiveRole).toBe("employee");
      expect(mfaResult.redirectUrl).toBe("/employee-portal");
      expect(mfaResult.user.role).toBe("user");
      expect(mfaResult.user.accountType).toBe("employee");
    }
  });

  it("Scenario 3: Standard Customer Login -> Issues direct session without MFA, returns effectiveRole 'customer' and redirectUrl '/portal'", async () => {
    const custEmail = "b2b.buyer@tataelectric.com";
    let custUser = await getUserByEmail(custEmail);
    if (!custUser) {
      custUser = await createLocalUser({
        name: "Tata Electric Procurement",
        email: custEmail,
        password: "CustomerPass@2026",
        role: "user",
        accountType: "customer",
        emailVerified: true,
        mfaEnabled: false,
      });
    }

    const { ctx, setCookies } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const loginResult = await caller.auth.login({
      email: custEmail,
      password: "CustomerPass@2026",
    });

    expect(loginResult.mfaRequired).toBe(false);
    if (!loginResult.mfaRequired) {
      expect(loginResult.effectiveRole).toBe("customer");
      expect(loginResult.redirectUrl).toBe("/portal");
      expect(loginResult.user.accountType).toBe("customer");
      expect(setCookies.length).toBeGreaterThan(0);
    }
  });

  it("Scenario 4: Invalid Credentials -> Throws generic UNAUTHORIZED message", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: "ceo@volampelektrikals.com",
        password: "WrongPassword999!",
      })
    ).rejects.toThrow("Invalid email address or password.");
  });

  it("Scenario 5: Employee Pending Email Verification -> Throws FORBIDDEN with email verification prompt", async () => {
    const unverifiedEmail = "unverified.trainee@volampelektrikals.com";
    await createLocalUser({
      name: "Trainee Engineer",
      email: unverifiedEmail,
      password: "TraineePass@2026",
      role: "user",
      accountType: "employee",
      employeeStatus: "pending_verification",
      emailVerified: false,
    });

    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: unverifiedEmail,
        password: "TraineePass@2026",
      })
    ).rejects.toThrow(/verified yet/);
  });

  it("Scenario 6: Employee Pending CEO Approval -> Throws FORBIDDEN awaiting executive approval", async () => {
    const pendingEmail = "pending.candidate@volampelektrikals.com";
    await createLocalUser({
      name: "Pending Candidate",
      email: pendingEmail,
      password: "PendingPass@2026",
      role: "user",
      accountType: "employee",
      employeeStatus: "pending_approval",
      emailVerified: true,
    });

    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: pendingEmail,
        password: "PendingPass@2026",
      })
    ).rejects.toThrow(/awaiting authorization from VOLAMP management/);
  });

  it("Scenario 7: Rejected Employee Account -> Throws FORBIDDEN not authorized", async () => {
    const rejectedEmail = "rejected.applicant@volampelektrikals.com";
    await createLocalUser({
      name: "Rejected Applicant",
      email: rejectedEmail,
      password: "ApplicantPass@2026",
      role: "user",
      accountType: "employee",
      employeeStatus: "rejected",
      emailVerified: true,
    });

    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: rejectedEmail,
        password: "ApplicantPass@2026",
      })
    ).rejects.toThrow(/not authorized by executive management/);
  });

  it("Scenario 8: Suspended Employee Account -> Throws FORBIDDEN portal access suspended", async () => {
    const suspendedEmail = "suspended.officer@volampelektrikals.com";
    await createLocalUser({
      name: "Suspended Officer",
      email: suspendedEmail,
      password: "OfficerPass@2026",
      role: "user",
      accountType: "employee",
      employeeStatus: "suspended",
      emailVerified: true,
    });

    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({
        email: suspendedEmail,
        password: "OfficerPass@2026",
      })
    ).rejects.toThrow(/suspended/);
  });

  it("Scenario 9: Customer with MFA Enabled -> Requires OTP challenge and returns '/portal'", async () => {
    const secureCustEmail = "mfa.customer@larsentoubro.com";
    const user = await createLocalUser({
      name: "L&T High Security Procurement",
      email: secureCustEmail,
      password: "SecurePass@2026!",
      role: "user",
      accountType: "customer",
      emailVerified: true,
    });
    await updateUser(user.id, { mfaEnabled: true });

    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const loginResult = await caller.auth.login({
      email: secureCustEmail,
      password: "SecurePass@2026!",
    });

    expect(loginResult.mfaRequired).toBe(true);
    if (loginResult.mfaRequired) {
      expect(loginResult.effectiveRole).toBe("customer");
      expect(loginResult.redirectUrl).toBe("/portal");

      const otp = getLatestOtpForEmail(secureCustEmail, "mfa");
      expect(otp).toBeDefined();

      const mfaResult = await caller.auth.verifyMfaOtp({
        mfaPendingToken: loginResult.mfaPendingToken,
        code: otp!,
      });

      expect(mfaResult.success).toBe(true);
      expect(mfaResult.effectiveRole).toBe("customer");
      expect(mfaResult.redirectUrl).toBe("/portal");
    }
  });

  it("Scenario 10: Customer session attempting to access employee.dashboard -> Server blocks with 403 FORBIDDEN", async () => {
    const { ctx } = createTestContext({
      id: 50,
      email: "buyer@reliance.com",
      role: "user",
      accountType: "customer",
    });
    const caller = appRouter.createCaller(ctx);

    await expect(caller.employee.dashboard()).rejects.toThrow("Access restricted to VOLAMP employees.");
  });

  it("Scenario 11: Regular Staff Employee attempting to access admin endpoints -> Server blocks with 403 FORBIDDEN", async () => {
    const { ctx } = createTestContext({
      id: 51,
      email: "engineer@volampelektrikals.com",
      role: "user",
      accountType: "employee",
      employeeStatus: "approved",
    });
    const caller = appRouter.createCaller(ctx);

    await expect(caller.employee.listEmployees()).rejects.toThrow("Administrative privileges required.");
    await expect(caller.employee.approveEmployee({ userId: 99 })).rejects.toThrow("Administrative privileges required.");
  });

  it("Scenario 12: Unauthenticated caller attempting protected endpoints -> Server throws UNAUTHORIZED", async () => {
    const { ctx } = createTestContext(null); // No user
    const caller = appRouter.createCaller(ctx);

    await expect(caller.employee.dashboard()).rejects.toThrow(/login/);
    await expect(caller.employee.listEmployees()).rejects.toThrow(/login/);
  });

  it("Scenario 13: Admin session accessing CEO endpoints -> Server permits full administrative data retrieval", async () => {
    const { ctx } = createTestContext({
      id: 1,
      email: "ceo@volampelektrikals.com",
      role: "admin",
      accountType: "employee",
      employeeStatus: "approved",
    });
    const caller = appRouter.createCaller(ctx);

    const employees = await caller.employee.listEmployees();
    expect(Array.isArray(employees)).toBe(true);
    expect(employees.length).toBeGreaterThan(0);
  });
});

