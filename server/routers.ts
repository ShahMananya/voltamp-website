import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { z } from "zod";

const assistantSystemPrompt = `You are Volt, the friendly VOLTAMP assistant for VOLTAMP ELEKTRIKALS PVT. LTD. in Ahmedabad, Gujarat, India.
Only answer questions about VOLTAMP, its public product categories (house wires, industrial cables, and control & data), product selection at a high level, quotation requests, customer portal basics, company information, and how to reach human support.
Never invent prices, certifications, testimonials, stock, delivery promises, technical compliance claims, customer records, or order status. If a question requires a formal quotation, account lookup, engineering approval, or information not provided, explain that a human VOLTAMP specialist should confirm it and offer escalation.
Keep answers warm, concise, and practical. Use Indian rupee notation only when discussing the estimate shown in the interface, and clarify that estimates are not official quotes.`;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  ai: router({
    chat: publicProcedure
      .input(z.object({ messages: z.array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string().min(1).max(4000) })).min(1).max(20) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: assistantSystemPrompt },
            ...input.messages.filter((message) => message.role !== "system"),
          ],
        });
        const content = response.choices?.[0]?.message?.content;
        if (typeof content === "string") return content;
        if (Array.isArray(content)) return content.map((part) => "text" in part ? part.text : "").join("").trim();
        return "I’m not quite sure yet. Please connect with human support so we can give you an accurate answer.";
      }),
  }),
});

export type AppRouter = typeof appRouter;
