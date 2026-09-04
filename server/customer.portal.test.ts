import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = { user: undefined, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] } satisfies TrpcContext;

describe("customer.portal", () => {
  it("rejects unauthenticated portal access", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.customer.portal()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects unauthenticated profile writes", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.customer.saveProfile({ fullName: "Test Customer", customerType: "business", preferredCommunication: "email" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
