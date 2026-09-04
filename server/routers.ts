import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { createQuotation, createSupportTicket, getCustomerPortal, upsertCustomerProfile } from "./db";
import { z } from "zod";

const assistantSystemPrompt = `You are Vola, the friendly VOLAMP assistant for VOLAMP ELEKTRIKALS PVT. LTD. in Ahmedabad, Gujarat, India.
Only answer questions about VOLAMP, its public product categories (house wires, industrial cables, and control & data), product selection at a high level, quotation requests, customer portal basics, company information, and how to reach human support.
Never invent prices, certifications, testimonials, stock, delivery promises, technical compliance claims, customer records, or order status. If a question requires a formal quotation, account lookup, engineering approval, or information not provided, explain that a human VOLAMP specialist should confirm it and offer escalation.
Keep answers warm, concise, and practical. Use Indian rupee notation only when discussing the estimate shown in the interface, and clarify that estimates are not official quotes.`;

const profileInput = z.object({
  fullName: z.string().trim().min(2).max(160), mobile: z.string().trim().max(32).optional(), companyName: z.string().trim().max(180).optional(), gstin: z.string().trim().max(32).optional(), address: z.string().trim().max(2000).optional(), state: z.string().trim().max(80).optional(), city: z.string().trim().max(80).optional(), pinCode: z.string().trim().max(12).optional(), customerType: z.enum(["individual", "contractor", "dealer", "distributor", "business"]), preferredCommunication: z.enum(["email", "phone", "whatsapp"]), deliveryInstructions: z.string().trim().max(2000).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  ai: router({
    chat: publicProcedure.input(z.object({ messages: z.array(z.object({ role: z.enum(["system", "user", "assistant"]), content: z.string().min(1).max(4000) })).min(1).max(20) })).mutation(async ({ input }) => {
      const response = await invokeLLM({ messages: [{ role: "system", content: assistantSystemPrompt }, ...input.messages.filter((message) => message.role !== "system")] });
      const content = response.choices?.[0]?.message?.content;
      if (typeof content === "string") return content;
      if (Array.isArray(content)) return content.map((part) => "text" in part ? part.text : "").join("").trim();
      return "I’m not quite sure yet. Please connect with human support so we can give you an accurate answer.";
    }),
  }),
  customer: router({
    portal: protectedProcedure.query(({ ctx }) => getCustomerPortal(ctx.user.id)),
    saveProfile: protectedProcedure.input(profileInput).mutation(({ ctx, input }) => upsertCustomerProfile(ctx.user.id, input)),
    requestQuotation: protectedProcedure.input(z.object({ productName: z.string().trim().min(2).max(180), quantity: z.number().int().positive().max(1000000), estimatedTotal: z.number().int().nonnegative().optional() })).mutation(({ ctx, input }) => createQuotation(ctx.user.id, input.productName, input.quantity, input.estimatedTotal)),
    openSupportTicket: protectedProcedure.input(z.object({ subject: z.string().trim().min(3).max(180), message: z.string().trim().min(3).max(4000) })).mutation(({ ctx, input }) => createSupportTicket(ctx.user.id, input.subject, input.message)),
  }),
});

export type AppRouter = typeof appRouter;
