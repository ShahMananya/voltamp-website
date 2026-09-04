import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context = {
  user: undefined,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
} satisfies TrpcContext;

describe("ai.chat", () => {
  it("rejects an empty message list before reaching the model", async () => {
    const caller = appRouter.createCaller(context);
    await expect(caller.ai.chat({ messages: [] })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
