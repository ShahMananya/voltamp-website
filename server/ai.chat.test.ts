import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as llmModule from "./_core/llm";
import { getQuickOrderById } from "./db";

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

  it("answers general questions about Volamp and electrical calculations", async () => {
    const caller = appRouter.createCaller(context);
    const mockInvoke = vi.spyOn(llmModule, "invokeLLM").mockResolvedValueOnce({
      id: "mock-1",
      created: Date.now(),
      model: "mock-model",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Volamp was founded in 1964 by Soma Bhai Patel in Ahmedabad. We are currently in our fourth generation led by Nishit Patel.",
          },
          finish_reason: "stop",
        },
      ],
    });

    const response = await caller.ai.chat({
      messages: [{ role: "user", content: "Tell me about Volamp's history" }],
    });

    expect(response).toContain("Volamp was founded in 1964");
    expect(mockInvoke).toHaveBeenCalled();
    mockInvoke.mockRestore();
  });

  it("handles place_order tool call by registering a quick order and returning confirmation", async () => {
    const caller = appRouter.createCaller(context);
    
    // First call returns a tool_call to place_order
    // Second call returns the conversational confirmation
    const mockInvoke = vi
      .spyOn(llmModule, "invokeLLM")
      .mockResolvedValueOnce({
        id: "mock-tool-call",
        created: Date.now(),
        model: "mock-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "",
              tool_calls: [
                {
                  id: "call_order_123",
                  type: "function",
                  function: {
                    name: "place_order",
                    arguments: JSON.stringify({
                      customerName: "Vipul Mehta",
                      phone: "9825123456",
                      location: "Vadodara, Gujarat",
                      items: [
                        { name: "4 sqmm 3-Core Copper Armoured Cable", quantity: 500 },
                        { name: "2.5 sqmm FR House Wire", quantity: 10 },
                      ],
                      notes: "Need dispatch within 48 hours",
                    }),
                  },
                },
              ],
            },
            finish_reason: "tool_calls",
          },
        ],
      })
      .mockResolvedValueOnce({
        id: "mock-final-reply",
        created: Date.now(),
        model: "mock-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "### ⚡ Order Successfully Placed!\nYour order has been registered with reference ID **QO-2026-99999** for Vipul Mehta. We have forwarded it to the Ahmedabad supply desk.",
            },
            finish_reason: "stop",
          },
        ],
      });

    const response = await caller.ai.chat({
      messages: [
        {
          role: "user",
          content: "I want to place an order for 500m of 4 sqmm 3 core copper cable and 10 coils of 2.5 sqmm wire to Vadodara. My name is Vipul Mehta, phone 9825123456.",
        },
      ],
    });

    expect(response).toContain("Order Successfully Placed!");
    expect(mockInvoke).toHaveBeenCalledTimes(2);
    mockInvoke.mockRestore();
  });

  it("handles lookup_order tool call for an existing order", async () => {
    const caller = appRouter.createCaller(context);

    // Create a real quick order first
    const newOrder = await caller.quickOrder.submit({
      customerName: "Aakash Shah",
      phone: "9898989898",
      location: "Rajkot, Gujarat",
      items: [{ name: "10 sqmm Armoured Cable", quantity: 200 }],
    });

    const mockInvoke = vi
      .spyOn(llmModule, "invokeLLM")
      .mockResolvedValueOnce({
        id: "mock-lookup-call",
        created: Date.now(),
        model: "mock-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "",
              tool_calls: [
                {
                  id: "call_lookup_456",
                  type: "function",
                  function: {
                    name: "lookup_order",
                    arguments: JSON.stringify({
                      quickOrderId: newOrder.quickOrderId,
                    }),
                  },
                },
              ],
            },
            finish_reason: "tool_calls",
          },
        ],
      })
      .mockResolvedValueOnce({
        id: "mock-lookup-reply",
        created: Date.now(),
        model: "mock-model",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: `Your order **${newOrder.quickOrderId}** is currently **Submitted** and under review by our Ahmedabad dispatch team.`,
            },
            finish_reason: "stop",
          },
        ],
      });

    const response = await caller.ai.chat({
      messages: [
        {
          role: "user",
          content: `Can you check the status of my order ${newOrder.quickOrderId}?`,
        },
      ],
    });

    expect(response).toContain(newOrder.quickOrderId);
    expect(mockInvoke).toHaveBeenCalledTimes(2);
    mockInvoke.mockRestore();
  });
});
