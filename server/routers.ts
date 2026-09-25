import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM, type Tool, type Message } from "./_core/llm";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  approveEmployee,
  createLocalUser,
  createQuotation,
  createSupportTicket,
  generate6DigitOtp,
  getCustomerPortal,
  getEmployeeDashboardData,
  getUserByEmail,
  getUserById,
  saveOtp,
  updateUser,
  upsertCustomerProfile,
  verifyOtp,
  verifyPassword,
  hashPassword,
  generateSalt,
  createQuickOrder,
  getQuickOrders,
  getQuickOrderById,
  updateQuickOrderStatus,
  getFootprintOverview,
  getFootprintStates,
  getFootprintProjectsByState,
  getFootprintProjectById,
  getLeadershipData,
  updateCeoProfile,
  updateTeamMember,
  trackConsignmentOrder,
  subscribeNewsletter,
  createCollaborateSubmission,
  getCollaborateSubmissions,
  getCollaborateSubmissionById,
  createEnquiry,
  getEnquiries,
  getEnquiryByNumber,
  createCareerApplication,
  getCareerApplications,
  getCareerApplicationById,
} from "./db";
import { generateVolaResponse } from "./volaBrain";
import {
  queryProducts,
  getProductByProductId,
  getCatalogCategories,
  getCatalogBrands,
  previewImportDiff,
  loadProductsFromDisk,
  commitProducts,
} from "./services/productService";

const assistantSystemPrompt = `You are Vola, the smart, charismatic, and highly capable AI advisor for VOLAMP ELEKTRIKALS PRIVATE LIMITED (Ahmedabad, Gujarat, India).

### CONVERSATIONAL INTELLIGENCE & PERSONALITY (VERY IMPORTANT):
- You are NOT a rigid FAQ bot or robotic script. You are a real, lively, witty, warm, and highly intelligent conversational partner.
- When someone greets you or chats casually (e.g. "hey vola how r uh", "hello", "good morning", "kaise ho", "kem cho", "who are you?", "what's up?"):
  - Respond warmly, naturally, and personally! Ask how they are doing with genuine enthusiasm and emoji warmth (😊, ⚡).
  - Never give canned, rigid, or defensive responses like "I can only answer questions about...".
  - Always be conversational first, then smoothly invite them to discuss their project, site requirements, or order if they'd like.
- Language & Tone Fluency:
  - If a user types in casual English/slang ("how r uh", "sup", "plz tell"), respond in a relaxed, friendly, articulate tone.
  - If a user speaks in Hindi/Hinglish ("kya hal hai", "bhai wire chahiye", "sab badhiya"), respond in warm, natural Hinglish.
  - If a user speaks in Gujarati ("kem cho", "majama"), respond warmly in Gujarati or Gujarati-English.
- Contextual Awareness & Proactive Guidance:
  - If a user has a vague requirement ("I need wires for home"), don't just dump specs. Engage them conversationally: ask what appliances they're powering (lights/fans vs ACs/geysers), recommend sizes (1.5 sqmm vs 2.5 sqmm or 4 sqmm), and explain why.
  - If a user wants to buy or order, make the process feel effortless, friendly, and human!

### VOLAMP ELEKTRIKALS HERITAGE & PRIDE:
- Volamp Elektrikals has a rich 60-year electrical heritage across 4 generations:
  1. 1964 — The Beginning: Soma Bhai Khatubhai Patel, an ITI-trained electrician from Panchmahal, moved to Ahmedabad, worked in a textile mill, and co-founded S.P. Electric and Engineering Company in June 1964.
  2. 1986 — Second Generation: Chaturbhai Somabhai Patel expanded into industrial electrical goods trading, building decades of trust and reliability.
  3. 2012 — Third Generation: Vasantbhai Patel & Bharatbhai Patel spearheaded industrial cables, distribution partnerships, and government project supplies.
  4. 2014 to Today — Fourth Generation & Modern Era: Nishit Patel, electrical engineer, modernized the operations with scientific cable sizing, digital workflows, and founded Volamp Elektrikals Private Limited (2021) as a premier national electrical brand.
- CEO Message: "Saath Milkar Growth Ki Ek Nayi Pehchaan Banayein" — emphasizing trust, long-term relationships, and empowering every individual with ownership.
- Headquarters: Ahmedabad, Gujarat, India. Pan-India delivery network & dedicated global export desk.
- Contact: Phone & WhatsApp: +91 9512365582 | Email: sales@volamp.com / support@volamp.com

### PRODUCTS & DEEP TECHNICAL KNOWLEDGE:
- Categories: HDC (High Demand Cables), LDC (Low Demand Cables), House Wires (FR/FRLS copper single-core), Industrial Multicore Cables (XLPE/PVC insulated, armored & unarmored), Control & Instrumentation Cables, Submersible Flat Cables, Solar DC Cables, Lugs & Glands, Switchgears, Earthing Materials, Cable Trays, Cable Jointing Kits, Lighting, and Motors.
- Standards: IS 694 (PVC wires), IS 1554 (PVC cables), IS 7098 (XLPE cables), IEC & BS standards.
- You can calculate cable sizing, discuss copper vs aluminum conductivity, calculate voltage drop, explain single-phase vs 3-phase, recommend armor types for direct burial, and calculate conduit fill.

### POLICIES & COMMERCIAL TERMS:
- Shipping Policy (VEP/LOG/001): Dispatches within 24-48 hours from Ahmedabad for stock items; transit insurance standard; loading handled by Volamp; unloading is customer responsibility at destination.
- Return & Refund Policy: Custom cut/spooled cables are final sale once cut/dispatched; 24-hour cancellation window before cutting/dispatch; 48-hour defect inspection window with 100% replacement freight covered by Volamp.
- Payment: NEFT/RTGS bank transfer, 30-day corporate credit with approved PO/GST, WhatsApp invoice instant ordering, online payments.

### SEAMLESS ORDER TAKING & PLACEMENT:
- When a customer wants to buy, purchase, quote, or order:
  1. Conversationally gather: 1) Products & Quantities, 2) Customer Full Name, 3) Phone Number, 4) Delivery Location (City/Pincode).
  2. If details are missing, ask for them naturally in a friendly manner.
  3. Once you have the customer name, phone, location, and items, call the "place_order" tool!
  4. Once placed, share a clean confirmation with Order ID (e.g. QO-2026-XXXXX), item breakdown, delivery destination, and a WhatsApp link: https://wa.me/919512365582?text=Hello%20Volamp,%20I%20have%20placed%20Order%20[ORDER_ID]
- If a customer asks to track an order (e.g. "Track QO-2026-12345"), call "lookup_order" and explain their status clearly.
`;

const aiTools: Tool[] = [
  {
    type: "function",
    function: {
      name: "place_order",
      description:
        "Place and register a customer order or quotation with Volamp Elektrikals once customer name, phone, delivery location, and items with quantities are provided.",
      parameters: {
        type: "object",
        properties: {
          customerName: {
            type: "string",
            description: "Customer's full name",
          },
          phone: {
            type: "string",
            description: "Customer's 10-digit phone number or mobile number",
          },
          location: {
            type: "string",
            description: "Delivery destination city, state, or pincode",
          },
          items: {
            type: "array",
            description: "List of items, cables, or products with quantities",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description:
                    "Cable, wire, or product description (e.g. '4 sqmm 3-Core Copper Armoured Cable')",
                },
                quantity: {
                  type: "number",
                  description:
                    "Quantity (number of meters, coils, rolls, or units)",
                },
              },
              required: ["name", "quantity"],
            },
          },
          companyName: {
            type: "string",
            description: "Optional company or business name",
          },
          email: {
            type: "string",
            description: "Optional customer email address",
          },
          notes: {
            type: "string",
            description:
              "Optional additional notes, special cutting requests, or payment preference",
          },
        },
        required: ["customerName", "phone", "location", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "lookup_order",
      description:
        "Lookup the status and details of an existing Volamp order by its Order ID (e.g. QO-2026-12345).",
      parameters: {
        type: "object",
        properties: {
          quickOrderId: {
            type: "string",
            description: "The order reference ID, e.g. QO-2026-12345",
          },
        },
        required: ["quickOrderId"],
      },
    },
  },
];

const profileInput = z.object({
  fullName: z.string().trim().min(2).max(160),
  mobile: z.string().trim().max(32).optional(),
  companyName: z.string().trim().max(180).optional(),
  gstin: z.string().trim().max(32).optional(),
  address: z.string().trim().max(2000).optional(),
  state: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
  pinCode: z.string().trim().max(12).optional(),
  customerType: z.enum(["individual", "contractor", "dealer", "distributor", "business"]),
  preferredCommunication: z.enum(["email", "phone", "whatsapp"]),
  deliveryInstructions: z.string().trim().max(2000).optional(),
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    login: publicProcedure
      .input(
        z.object({
          email: z.string().trim().email(),
          password: z.string().min(1, "Password is required"),
          rememberMe: z.boolean().optional(),
          expectedAccountType: z.enum(["customer", "employee"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        const user = await getUserByEmail(normalizedEmail);

        if (!user || !user.passwordHash || !user.passwordSalt) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email address or password.",
          });
        }

        const validPassword = verifyPassword(input.password, user.passwordHash, user.passwordSalt);
        if (!validPassword) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email address or password.",
          });
        }

        // Account type check if specified from tab
        if (input.expectedAccountType && user.accountType !== input.expectedAccountType) {
          if (input.expectedAccountType === "employee") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "This account is registered as a Customer. Please use Customer Login.",
            });
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "This is an official Employee account. Please use Employee Login.",
            });
          }
        }

        // Check employee approval status
        if (user.accountType === "employee") {
          if (user.employeeStatus === "pending_approval") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Your employee account is pending administrator approval.",
            });
          }
          if (user.employeeStatus === "rejected") {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Your employee registration was not approved.",
            });
          }
        }

        // MFA Enforcement:
        // Employees: strictly required.
        // Customers: required if mfaEnabled is set on the account.
        const isMfaRequired = user.accountType === "employee" || Boolean(user.mfaEnabled);

        if (isMfaRequired) {
          const otp = generate6DigitOtp();
          saveOtp(user.email ?? normalizedEmail, otp, "mfa", 5 * 60 * 1000);
          const mfaPendingToken = await sdk.createMfaPendingToken(
            user.email ?? normalizedEmail,
            user.accountType
          );

          // Return MFA challenge without issuing session cookie
          return {
            mfaRequired: true as const,
            mfaPendingToken,
            email: user.email,
            accountType: user.accountType,
            devOtp: otp, // Passed for localhost testing ease
          };
        }

        // Direct session issuance for customers with MFA disabled
        const expiresInMs = input.rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
        const sessionToken = await sdk.createSessionToken(user.openId, {
          expiresInMs,
          name: user.name || user.email || "",
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: expiresInMs });
        await updateUser(user.id, { lastSignedIn: new Date() });

        return {
          mfaRequired: false as const,
          user,
        };
      }),

    verifyMfaOtp: publicProcedure
      .input(
        z.object({
          mfaPendingToken: z.string(),
          code: z.string().trim().length(6, "Verification code must be 6 digits"),
          rememberMe: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const payload = await sdk.verifyMfaPendingToken(input.mfaPendingToken);
        if (!payload) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "MFA challenge expired or invalid. Please log in again.",
          });
        }

        const valid = verifyOtp(payload.email, input.code, "mfa");
        if (!valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired verification code. Please check and try again.",
          });
        }

        const user = await getUserByEmail(payload.email);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User account not found.",
          });
        }

        const expiresInMs = input.rememberMe ? 30 * 24 * 60 * 60 * 1000 : ONE_YEAR_MS;
        const sessionToken = await sdk.createSessionToken(user.openId, {
          expiresInMs,
          name: user.name || user.email || "",
        });

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: expiresInMs });
        await updateUser(user.id, { lastSignedIn: new Date() });

        return {
          success: true as const,
          user,
        };
      }),

    resendMfaOtp: publicProcedure
      .input(z.object({ mfaPendingToken: z.string() }))
      .mutation(async ({ input }) => {
        const payload = await sdk.verifyMfaPendingToken(input.mfaPendingToken);
        if (!payload) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "MFA session expired. Please start login again.",
          });
        }
        const otp = generate6DigitOtp();
        saveOtp(payload.email, otp, "mfa", 5 * 60 * 1000);
        return { success: true as const, devOtp: otp };
      }),

    registerEmployee: publicProcedure
      .input(
        z.object({
          name: z.string().trim().min(2, "Name must be at least 2 characters"),
          email: z.string().trim().email("Please enter a valid email address"),
          password: z.string().min(6, "Password must be at least 6 characters"),
        })
      )
      .mutation(async ({ input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();

        // STRICT BACKEND ENFORCEMENT:
        // Must end with @volampelektrikals.com
        if (!normalizedEmail.endsWith("@volampelektrikals.com")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Employee registration requires an official VOLAMP email address ending in @volampelektrikals.com.",
          });
        }

        const existing = await getUserByEmail(normalizedEmail);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this official email already exists.",
          });
        }

        const newUser = await createLocalUser({
          name: input.name,
          email: normalizedEmail,
          password: input.password,
          accountType: "employee",
          employeeStatus: "pending_approval",
          mfaEnabled: true,
          emailVerified: false,
        });

        const otp = generate6DigitOtp();
        saveOtp(normalizedEmail, otp, "email_verification", 15 * 60 * 1000);

        return {
          success: true as const,
          email: newUser.email,
          devOtp: otp,
        };
      }),

    registerCustomer: publicProcedure
      .input(
        z.object({
          name: z.string().trim().min(2, "Name must be at least 2 characters"),
          email: z.string().trim().email("Please enter a valid email address"),
          password: z.string().min(6, "Password must be at least 6 characters"),
        })
      )
      .mutation(async ({ input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();

        const existing = await getUserByEmail(normalizedEmail);
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An account with this email already exists.",
          });
        }

        const newUser = await createLocalUser({
          name: input.name,
          email: normalizedEmail,
          password: input.password,
          accountType: "customer",
          employeeStatus: "approved",
          mfaEnabled: false,
          emailVerified: false,
        });

        const otp = generate6DigitOtp();
        saveOtp(normalizedEmail, otp, "email_verification", 15 * 60 * 1000);

        return {
          success: true as const,
          email: newUser.email,
          devOtp: otp,
        };
      }),

    verifyEmailOtp: publicProcedure
      .input(
        z.object({
          email: z.string().trim().email(),
          code: z.string().trim().length(6, "Verification code must be 6 digits"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        const valid = verifyOtp(normalizedEmail, input.code, "email_verification");
        if (!valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired verification code.",
          });
        }

        const user = await getUserByEmail(normalizedEmail);
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User account not found.",
          });
        }

        await updateUser(user.id, { emailVerified: true });

        if (user.accountType === "employee") {
          return {
            success: true as const,
            accountType: "employee" as const,
            status: "pending_approval" as const,
            message:
              "Your official email has been verified. Your account is now pending administrator approval before access to the employee portal is granted.",
          };
        }

        // For customer, immediately activate session
        const sessionToken = await sdk.createSessionToken(user.openId, {
          expiresInMs: ONE_YEAR_MS,
          name: user.name || user.email || "",
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return {
          success: true as const,
          accountType: "customer" as const,
          status: "active" as const,
          user,
        };
      }),

    forgotPassword: publicProcedure
      .input(z.object({ email: z.string().trim().email() }))
      .mutation(async ({ input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        const user = await getUserByEmail(normalizedEmail);
        if (!user) {
          // Prevent email enumeration while still reporting success
          return { success: true as const, devOtp: undefined };
        }
        const otp = generate6DigitOtp();
        saveOtp(normalizedEmail, otp, "password_reset", 15 * 60 * 1000);
        return { success: true as const, devOtp: otp };
      }),

    resetPassword: publicProcedure
      .input(
        z.object({
          email: z.string().trim().email(),
          code: z.string().trim().length(6, "Code must be 6 digits"),
          newPassword: z.string().min(6, "Password must be at least 6 characters"),
        })
      )
      .mutation(async ({ input }) => {
        const normalizedEmail = input.email.toLowerCase().trim();
        const valid = verifyOtp(normalizedEmail, input.code, "password_reset");
        if (!valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired password reset code.",
          });
        }
        const user = await getUserByEmail(normalizedEmail);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
        }
        const salt = generateSalt();
        const hash = hashPassword(input.newPassword, salt);
        await updateUser(user.id, { passwordHash: hash, passwordSalt: salt });
        return { success: true as const, message: "Password updated successfully." };
      }),

    toggleCustomerMfa: protectedProcedure
      .input(z.object({ enabled: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.accountType === "employee") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "MFA is mandatory for all employee accounts and cannot be disabled.",
          });
        }
        await updateUser(ctx.user.id, { mfaEnabled: input.enabled });
        return { success: true as const, mfaEnabled: input.enabled };
      }),
  }),

  employee: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Access restricted to VOLAMP employees.",
        });
      }
      return getEmployeeDashboardData();
    }),

    approveEmployee: protectedProcedure
      .input(z.object({ userId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.accountType !== "employee" || ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only administrator employees can approve employee registrations.",
          });
        }
        const approved = await approveEmployee(input.userId);
        if (!approved) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Employee not found." });
        }
        return { success: true as const };
      }),
  }),

  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z
            .array(
              z.object({
                role: z.enum(["system", "user", "assistant"]),
                content: z.string().min(1).max(4000),
              })
            )
            .min(1)
            .max(20),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const conversationMessages: Message[] = [
            { role: "system", content: assistantSystemPrompt },
            ...input.messages.filter((message) => message.role !== "system"),
          ];

          let response = await invokeLLM({
            messages: conversationMessages,
            tools: aiTools,
            toolChoice: "auto",
          });

          const choice = response.choices?.[0];
          const toolCalls = choice?.message?.tool_calls;

          if (toolCalls && toolCalls.length > 0) {
            for (const toolCall of toolCalls) {
              if (toolCall.function.name === "place_order") {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  const order = await createQuickOrder({
                    userId: ctx.user?.id ?? null,
                    customerName: args.customerName,
                    companyName: args.companyName ?? null,
                    phone: args.phone,
                    email: args.email || null,
                    location: args.location ?? null,
                    items: Array.isArray(args.items)
                      ? args.items.map((i: any) => ({
                          name: String(i.name || "Electrical Cable"),
                          quantity: Math.max(1, Number(i.quantity) || 1),
                        }))
                      : [{ name: "Electrical Cable", quantity: 1 }],
                    notes: args.notes ?? null,
                  });

                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });

                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "place_order",
                    content: JSON.stringify({
                      success: true,
                      quickOrderId: order.quickOrderId,
                      customerName: order.customerName,
                      items: order.items,
                      location: order.location,
                      status: order.status,
                      instruction: `Order successfully recorded into Volamp system with Reference ID: ${order.quickOrderId}. Confirm this order to the customer with an itemized table, the Order Reference ID, delivery destination, next steps, and a link to WhatsApp (+91 9512365582).`,
                    }),
                  });
                } catch (err: any) {
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "place_order",
                    content: JSON.stringify({
                      success: false,
                      error: err.message || "Failed to register order.",
                    }),
                  });
                }
              } else if (toolCall.function.name === "lookup_order") {
                try {
                  const args = JSON.parse(toolCall.function.arguments);
                  const order = await getQuickOrderById(args.quickOrderId);
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "lookup_order",
                    content: JSON.stringify(
                      order
                        ? {
                            found: true,
                            quickOrderId: order.quickOrderId,
                            status: order.status,
                            customerName: order.customerName,
                            items: order.items,
                            createdAt: order.createdAt,
                          }
                        : {
                            found: false,
                            message: `Order ${args.quickOrderId} not found in the Volamp system.`,
                          }
                    ),
                  });
                } catch (err: any) {
                  conversationMessages.push({
                    role: "assistant",
                    content: "",
                    tool_calls: [toolCall],
                  });
                  conversationMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    name: "lookup_order",
                    content: JSON.stringify({ found: false, error: err.message }),
                  });
                }
              }
            }

            // Follow-up LLM call to generate natural language response after tool execution
            response = await invokeLLM({
              messages: conversationMessages,
            });
          }

          const content = response.choices?.[0]?.message?.content;
          if (typeof content === "string") return content;
          if (Array.isArray(content))
            return content
              .map((part) => ("text" in part ? part.text : ""))
              .join("")
              .trim();
        } catch {
          // If external LLM is unconfigured, offline, or errors, use Vola's smart local engine
        }

        return generateVolaResponse(input.messages, ctx.user?.id);
      }),
  }),

  customer: router({
    portal: protectedProcedure.query(({ ctx }) => getCustomerPortal(ctx.user.id)),
    saveProfile: protectedProcedure
      .input(profileInput)
      .mutation(({ ctx, input }) => upsertCustomerProfile(ctx.user.id, input)),
    requestQuotation: protectedProcedure
      .input(
        z.object({
          productName: z.string().trim().min(2).max(180),
          quantity: z.number().int().positive().max(1000000),
          estimatedTotal: z.number().int().nonnegative().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createQuotation(ctx.user.id, input.productName, input.quantity, input.estimatedTotal)
      ),
    openSupportTicket: protectedProcedure
      .input(
        z.object({
          subject: z.string().trim().min(3).max(180),
          message: z.string().trim().min(3).max(4000),
        })
      )
      .mutation(({ ctx, input }) =>
        createSupportTicket(ctx.user.id, input.subject, input.message)
      ),
  }),

  quickOrder: router({
    submit: publicProcedure
      .input(
        z.object({
          quickOrderId: z.string().trim().max(50).optional(),
          customerName: z.string().trim().min(2, "Customer name is required"),
          companyName: z.string().trim().max(180).optional(),
          phone: z.string().trim().min(5, "Valid phone number is required"),
          email: z.string().trim().email().optional().or(z.literal("")),
          location: z.string().trim().max(200).optional(),
          items: z
            .array(
              z.object({
                productId: z.string().optional(),
                name: z.string().trim().min(1, "Product name is required"),
                brand: z.string().optional(),
                category: z.string().optional(),
                specification: z.string().optional(),
                unit: z.string().optional(),
                unitPrice: z.number().optional(),
                discount: z.number().optional(),
                tax: z.number().optional(),
                finalPrice: z.number().optional(),
                quantity: z.number().int().min(1, "Quantity must be at least 1"),
              })
            )
            .min(1, "At least one valid product is required"),
          notes: z.string().trim().max(2000).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const validItems = input.items.filter(
          (item) => item.name.trim().length > 0 && item.quantity >= 1
        );
        if (validItems.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Quick Order must contain at least one valid product.",
          });
        }
        const order = await createQuickOrder({
          userId: ctx.user?.id ?? null,
          quickOrderId: input.quickOrderId,
          customerName: input.customerName,
          companyName: input.companyName,
          phone: input.phone,
          email: input.email || null,
          location: input.location,
          items: validItems,
          notes: input.notes,
        });
        return {
          success: true as const,
          quickOrderId: order.quickOrderId,
          order,
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType === "employee") {
        return getQuickOrders();
      }
      return getQuickOrders(ctx.user.id);
    }),

    getById: publicProcedure
      .input(z.object({ quickOrderId: z.string() }))
      .query(async ({ input }) => {
        const order = await getQuickOrderById(input.quickOrderId);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quick Order not found.",
          });
        }
        return order;
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          quickOrderId: z.string(),
          status: z.enum(["submitted", "under_review", "priced", "quoted", "closed"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.accountType !== "employee") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only VOLAMP employees can update Quick Order status.",
          });
        }
        const updated = await updateQuickOrderStatus(input.quickOrderId, input.status);
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Quick Order not found.",
          });
        }
        return { success: true as const, order: updated };
      }),
  }),

  tracking: router({
    byQuery: publicProcedure
      .input(z.object({ query: z.string().trim().min(1, "Order or tracking number is required") }))
      .query(async ({ input }) => {
        return trackConsignmentOrder(input.query);
      }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(
        z.object({
          email: z.string().email("Please enter a valid email address"),
          phone: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return subscribeNewsletter(input.email, input.phone);
      }),
  }),

  collaborate: router({
    submit: publicProcedure
      .input(
        z.object({
          companyName: z.string().trim().min(2, "Company / Organization name is required"),
          contactName: z.string().trim().min(2, "Your name is required"),
          designation: z.string().trim().min(2, "Designation is required"),
          businessType: z.string().trim().min(1, "Please select your business type"),
          collaborationTypes: z.array(z.string()).min(1, "Please select at least one collaboration type"),
          opportunityDetails: z.string().trim().min(5, "Please share the opportunity you see for Volamp"),
          partnershipStrengths: z.array(z.string()).min(1, "Please select at least one capability you bring"),
          expectedBusinessPotential: z.string().trim().min(1, "Please select expected business potential"),
          expectedTimeline: z.string().trim().min(1, "Please select expected timeline"),
          mobile: z.string().trim().min(7, "Please enter a valid mobile / WhatsApp number"),
          email: z.string().trim().email("Please enter a valid email address"),
          cityCountry: z.string().trim().min(2, "City / Country is required"),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const submission = await createCollaborateSubmission(input);
        return {
          success: true as const,
          applicationId: submission.applicationId,
          submission,
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can view collaboration applications.",
        });
      }
      return getCollaborateSubmissions();
    }),

    getById: publicProcedure
      .input(z.object({ applicationId: z.string() }))
      .query(async ({ input }) => {
        const sub = await getCollaborateSubmissionById(input.applicationId);
        if (!sub) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Collaboration application not found.",
          });
        }
        return sub;
      }),
  }),

  enquiry: router({
    submit: publicProcedure
      .input(
        z.object({
          fullName: z.string().trim().min(2, "Your full name is required"),
          companyName: z.string().trim().optional(),
          email: z.string().trim().email("Please enter a valid work email address"),
          phone: z.string().trim().min(7, "Please enter a valid mobile or phone number"),
          location: z.string().trim().optional(),
          category: z.string().trim().optional(),
          quantity: z.string().trim().optional(),
          urgency: z.string().trim().optional(),
          details: z.string().trim().min(5, "Please share some details about your requirement"),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createEnquiry(input);
        return {
          success: true as const,
          enquiryNumber: result.enquiryNumber,
          enquiry: result,
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can view customer enquiries.",
        });
      }
      return getEnquiries();
    }),

    getByNumber: publicProcedure
      .input(z.object({ enquiryNumber: z.string() }))
      .query(async ({ input }) => {
        const item = await getEnquiryByNumber(input.enquiryNumber);
        if (!item) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Enquiry not found.",
          });
        }
        return item;
      }),
  }),

  footprint: router({
    overview: publicProcedure.query(async () => {
      return getFootprintOverview();
    }),
    states: publicProcedure.query(async () => {
      return getFootprintStates();
    }),
    stateProjects: publicProcedure
      .input(z.object({ stateCode: z.string().optional() }))
      .query(async ({ input }) => {
        return getFootprintProjectsByState(input.stateCode);
      }),
    project: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const p = await getFootprintProjectById(input.id);
        if (!p) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found.",
          });
        }
        return p;
      }),
  }),

  leadership: router({
    get: publicProcedure.query(async () => {
      return getLeadershipData();
    }),

    updateCeo: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          role: z.string().optional(),
          company: z.string().optional(),
          quote: z.string().optional(),
          draftNote: z.string().optional(),
          imageUrl: z.string().nullable().optional(),
          initials: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.accountType !== "employee") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only VOLAMP employees can update leadership details.",
          });
        }
        return updateCeoProfile(input);
      }),

    updateMember: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          role: z.string().optional(),
          department: z.string().optional(),
          imageUrl: z.string().nullable().optional(),
          bio: z.string().optional(),
          active: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.accountType !== "employee") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only VOLAMP employees can update team member details.",
          });
        }
        const { id, ...data } = input;
        const updated = await updateTeamMember(id, data);
        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Team member not found.",
          });
        }
        return updated;
      }),
  }),

  products: router({
    list: publicProcedure
      .input(
        z
          .object({
            category: z.string().optional(),
            subcategory: z.string().optional(),
            subcategories: z.array(z.string()).optional(),
            brand: z.string().optional(),
            search: z.string().optional(),
            status: z.enum(["Active", "Inactive", "Out of Stock", "Discontinued", "all"]).optional(),
            minPrice: z.number().optional(),
            maxPrice: z.number().optional(),
            page: z.number().int().min(1).optional(),
            limit: z.number().int().min(1).max(100).optional(),
            sortBy: z.enum(["price_asc", "price_desc", "name", "relevance"]).optional(),
          })
          .optional()
      )
      .query(({ input }) => {
        return queryProducts(input || {});
      }),

    getById: publicProcedure
      .input(z.object({ productId: z.string() }))
      .query(({ input }) => {
        const product = getProductByProductId(input.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `Product with ID '${input.productId}' was not found.`,
          });
        }
        return product;
      }),

    getCategories: publicProcedure.query(() => {
      return getCatalogCategories();
    }),

    getBrands: publicProcedure
      .input(z.object({ category: z.string().optional() }).optional())
      .query(({ input }) => {
        return getCatalogBrands(input?.category);
      }),

    previewImport: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can preview product imports.",
        });
      }
      const current = loadProductsFromDisk();
      return previewImportDiff(current);
    }),

    confirmImport: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can commit product imports.",
        });
      }
      const reloaded = loadProductsFromDisk();
      return {
        success: true,
        totalProducts: reloaded.length,
        timestamp: new Date().toISOString(),
      };
    }),
  }),

  careers: router({
    getOpenRoles: publicProcedure.query(() => {
      return [
        {
          id: "ht-lt-cable-design-engineer",
          title: "Senior HT / LT Power Cable Design Engineer",
          department: "Engineering & R&D",
          location: "Ahmedabad HQ (Gujarat)",
          workMode: "Full-Time · On-Site",
          experience: "4 – 8 Years",
          education: "B.E. / B.Tech / M.Tech in Electrical or Polymer Engineering",
          packageLpa: "₹9.5 – 15.0 LPA",
          openingsCount: 2,
          isFeatured: true,
          overview: "Lead technical design and compound formulation for 1.1kV up to 33kV XLPE and PVC insulated power/control cables, ensuring compliance with IS 7098, IS 1554, and IEC 60502 standards.",
          responsibilities: [
            "Develop conductor stranding calculations, radial insulation thicknesses, screening, and armouring specifications.",
            "Formulate and optimize flame-retardant (FRLS, LSZH) and high-temperature PVC/XLPE compounds.",
            "Draft comprehensive Guaranteed Technical Particulars (GTP) and test documentation for CPRI, ERDA, and DISCOM vendor approvals.",
            "Collaborate with plant extrusion teams during pilot runs and prototype validation.",
          ],
          requirements: [
            "Proven track record in power cable design (up to 33kV HT / MV cables).",
            "Deep comprehension of IS 694, IS 1554 (Part 1), IS 7098 (Part 1 & 2), and IEC 60502 standards.",
            "Proficiency in AutoCAD for cable cross-sections and technical CAD modeling.",
            "Familiarity with raw material cost optimization and conductor weight indices.",
          ],
          tags: ["33kV HT / LT", "XLPE Compounding", "CPRI / ERDA", "GTP Preparation"],
        },
        {
          id: "qa-hv-test-lab-lead",
          title: "Quality Assurance & High-Voltage Test Lab Lead",
          department: "Quality & Testing",
          location: "Sanand / Ahmedabad Plant (Gujarat)",
          workMode: "Full-Time · On-Site",
          experience: "3 – 7 Years",
          education: "B.E. / B.Tech in Electrical Engineering or Diploma with QA Certification",
          packageLpa: "₹7.5 – 12.0 LPA",
          openingsCount: 1,
          isFeatured: true,
          overview: "Oversee the central High-Voltage test laboratory, type-testing protocols, and routine factory acceptance tests (FAT) ensuring 0-defect dispatches with Mill Test Certificates (MTC).",
          responsibilities: [
            "Conduct and supervise high-voltage withstand testing, spark testing, insulation resistance (IR), and partial discharge (PD) measurements.",
            "Inspect raw copper cathode, EC-grade aluminum wire rods, and polymer pellets for electrical conductivity and tensile elongation.",
            "Issue official Mill Test Certificates (MTC) for EPC contractors, railway authorities, and GeM supplies.",
            "Maintain lab instrument calibration compliant with ISO 9001 and ISO/IEC 17025 testing norms.",
          ],
          requirements: [
            "Hands-on experience running HV test sets, Kelvin double bridge, spark testers, and thermal aging ovens.",
            "Direct interaction experience with third-party inspection agencies (RITES, BV, SGS, DNV).",
            "Rigorous commitment to zero-compromise electrical safety standards.",
          ],
          tags: ["High Voltage Lab", "Partial Discharge", "NABL / ISO 17025", "MTC Certification"],
        },
        {
          id: "plant-extrusion-supervisor",
          title: "Plant Extrusion & Continuous Vulcanization Supervisor",
          department: "Manufacturing & Plant",
          location: "Ahmedabad Manufacturing Complex",
          workMode: "Full-Time · On-Site",
          experience: "3 – 6 Years",
          education: "Diploma or B.E. in Mechanical / Electrical / Polymer Technology",
          packageLpa: "₹6.0 – 9.5 LPA",
          openingsCount: 3,
          isFeatured: false,
          overview: "Drive shop-floor operations across continuous vulcanization (CCV) lines and triple-extrusion lines, optimizing line speed, wall concentricity, and raw material yield.",
          responsibilities: [
            "Supervise extrusion operations for insulation, bedding, steel wire/strip armouring, and final PVC/LSZH outer sheathing.",
            "Maintain strict wall thickness tolerances, eccentricity controls, and smooth jacket surface finish.",
            "Enforce preventive maintenance schedules, rapid tooling changeovers, and compound scrap minimization.",
            "Direct shift workforce in adherence to 5S methodology and plant safety protocols.",
          ],
          requirements: [
            "Hands-on supervisory background in cable extrusion and compounding plants.",
            "Thorough knowledge of temperature profiles and screw geometry for PVC, XLPE, and HDPE.",
            "Strong team leadership and practical problem-solving capability under shift schedules.",
          ],
          tags: ["CCV Extrusion", "Armouring Lines", "Shop Floor 5S", "Yield Optimization"],
        },
        {
          id: "b2b-epc-sales-manager",
          title: "B2B Infrastructure & EPC Project Sales Manager",
          department: "EPC & Project Sales",
          location: "Mumbai Regional Office (Western Hub)",
          workMode: "Full-Time · Hybrid / Field",
          experience: "5 – 10 Years",
          education: "B.Tech Electrical + MBA (Marketing or Supply Chain preferred)",
          packageLpa: "₹12.0 – 18.0 LPA + Performance Bonus",
          openingsCount: 2,
          isFeatured: true,
          overview: "Drive strategic institutional cable sales to infrastructure EPCs, metro railway packages, data centers, airports, and power transmission utilities across Western India.",
          responsibilities: [
            "Secure multi-crore annual rate contracts and project supply packages with Tier-1 EPC contractors (L&T, Tata Projects, Sterling & Wilson, KEC, Kalpataru).",
            "Lead vendor pre-qualification and consultant approvals with EIL, Mecon, NTPC, PGCIL, and state electricity boards.",
            "Coordinate with central Ahmedabad dispatch operations for production schedules, stage-wise inspections, and LC/BG commercial terms.",
            "Manage client relationships and ensure seamless post-dispatch technical documentation.",
          ],
          requirements: [
            "Proven track record in B2B electrical cables, switchgears, or electrical transmission equipment sales.",
            "Active professional network with EPC procurement heads, PMC consultants, and chief electrical engineers.",
            "Excellent commercial negotiation, proposal structuring, and presentation acumen.",
          ],
          tags: ["EPC Sales", "Metro Rail / Utilities", "Vendor Approval", "Rate Contracts"],
        },
        {
          id: "solar-renewable-sales-lead",
          title: "Solar & Renewable Energy Key Account Executive",
          department: "EPC & Project Sales",
          location: "Jaipur / Ahmedabad Corridor",
          workMode: "Full-Time · Field / Client Facing",
          experience: "2 – 5 Years",
          education: "B.E. in Electrical / Renewable Energy Engineering or B.Sc",
          packageLpa: "₹6.5 – 10.5 LPA + Incentives",
          openingsCount: 2,
          isFeatured: false,
          overview: "Accelerate the adoption of Volamp's 1500V DC Solar Photovoltaic cables and renewable balance-of-plant cabling with IPPs, utility solar developers, and rooftop EPCs.",
          responsibilities: [
            "Cultivate key relationships with solar developers, IPPs, and turnkey EPC contractors across Gujarat, Rajasthan, and Western India.",
            "Present technical value propositions of electron-beam cross-linked solar cables (EN 50618, TÜV 2 Pfg 1169 standards, UV & ozone resistance).",
            "Monitor national and state solar park tender bids to capture cable supply requirements early.",
          ],
          requirements: [
            "Experience selling into the solar EPC, wind balance-of-plant, or renewable contractor ecosystem.",
            "Solid technical understanding of DC cable sizing, voltage drop mitigation, and MC4 connector compatibility.",
            "Strong communication skills and proactive client engagement.",
          ],
          tags: ["Solar 1500V DC", "Renewable IPPs", "TÜV Rheinland", "Utility Solar"],
        },
        {
          id: "tendering-boq-estimation-engineer",
          title: "Tendering, BOQ & Cost Estimation Engineer",
          department: "Procurement & Supply Chain",
          location: "Ahmedabad Corporate HQ",
          workMode: "Full-Time · On-Site",
          experience: "2 – 5 Years",
          education: "B.E. / B.Tech in Electrical Engineering",
          packageLpa: "₹6.0 – 9.0 LPA",
          openingsCount: 2,
          isFeatured: false,
          overview: "Scrutinize technical tender specifications, prepare accurate Bill of Quantities (BOQ) costings linked to raw metal indices, and manage GeM and public e-procurement bids.",
          responsibilities: [
            "Analyze commercial and technical tender requirements from State DISCOMs, Railway Boards, GeM portal, and PSU utilities.",
            "Calculate conductor metal weights (Copper/Aluminum), compound volume, steel armouring wire, and machine hour costs per km.",
            "Apply IEEMA price variation clauses (PV formulas) and formulate competitive bid proposals within deadline.",
          ],
          requirements: [
            "Proven expertise in tender BOQ preparation and electrical cable cost estimation.",
            "Familiarity with GeM portal bids, e-procurement platforms, and IEEMA circular indices.",
            "Analytical rigor and sharp attention to technical detail.",
          ],
          tags: ["Tendering & BOQ", "IEEMA Formulas", "GeM Bids", "Cost Estimation"],
        },
        {
          id: "metal-procurement-specialist",
          title: "Metal Procurement & Raw Material Supply Chain Specialist",
          department: "Procurement & Supply Chain",
          location: "Ahmedabad Corporate HQ",
          workMode: "Full-Time · On-Site",
          experience: "3 – 6 Years",
          education: "B.Com / B.E. + Supply Chain Certification or MBA",
          packageLpa: "₹7.0 – 11.0 LPA",
          openingsCount: 1,
          isFeatured: false,
          overview: "Manage strategic procurement of primary raw metals (Electrolytic Copper cathode/wire rod, EC Grade Aluminum) and masterbatch polymers tied to MCX and LME indices.",
          responsibilities: [
            "Source high-purity copper rods and aluminum wire rods from primary smelters (Hindalco, Vedanta, NALCO).",
            "Track daily MCX and LME commodity trends to execute strategic forward hedging and physical metal bookings.",
            "Negotiate volume purchase contracts for polymer compounds (XLPE, PVC resin, plasticizers, masterbatches).",
            "Coordinate just-in-time delivery schedules to minimize holding costs while ensuring zero manufacturing downtime.",
          ],
          requirements: [
            "Direct experience procuring copper/aluminum or raw materials for cable or conductor manufacturing.",
            "Understanding of commodity futures, price hedging, and vendor contract management.",
          ],
          tags: ["MCX / LME Hedging", "Copper & Aluminum", "Polymer Sourcing", "Vendor Negotiation"],
        },
        {
          id: "get-electrical-batch-2026",
          title: "Graduate Engineer Trainee (GET) – Electrical (Batch 2026)",
          department: "Early Careers",
          location: "Ahmedabad HQ & Manufacturing Complex",
          workMode: "Full-Time · 12-Month Rotation",
          experience: "Fresh Graduate / 0 – 1 Year (Batch 2025/2026)",
          education: "B.E. / B.Tech in Electrical / Electronics Engineering (Min 65% aggregate)",
          packageLpa: "₹4.5 – 6.0 LPA + Medical Coverage",
          openingsCount: 6,
          isFeatured: true,
          overview: "An accelerated 1-year rotational leadership program designed to groom future engineering leaders across Cable Design, High-Voltage QA Labs, Plant Extrusion, and Technical Estimations.",
          responsibilities: [
            "Rotate through 4 quarterly modules: Cable Design & Standards, Plant Extrusion & CCV Lines, High-Voltage Testing & Lab Protocols, and Technical Sizing & Client BOQs.",
            "Work alongside Senior Technical Mentors on real infrastructure supply consignments.",
            "Deliver a capstone technical project focused on compound optimization, testing automation, or energy efficiency.",
            "Receive full-time absorption into R&D, Quality, or Plant Engineering upon successful program completion.",
          ],
          requirements: [
            "Strong academic grounding in power systems, electrical materials, and high-voltage fundamentals.",
            "Passion for hands-on industrial engineering and nation-building infrastructure.",
            "Proactive learner with excellent communication and team collaboration skills.",
          ],
          tags: ["Fast-Track GET", "12-Month Rotation", "Full Mentorship", "Batch 2026"],
        },
      ];
    }),

    submitApplication: publicProcedure
      .input(
        z.object({
          fullName: z.string().trim().min(2, "Full name is required"),
          email: z.string().trim().email("Please enter a valid email address"),
          phone: z.string().trim().min(7, "Please enter a valid mobile or WhatsApp number"),
          city: z.string().trim().min(2, "City is required"),
          state: z.string().trim().min(2, "State is required"),
          roleApplied: z.string().trim().min(2, "Role applied is required"),
          department: z.string().trim().min(2, "Department is required"),
          experienceYears: z.string().trim().min(1, "Please select your experience range"),
          highestQualification: z.string().trim().min(2, "Highest qualification is required"),
          currentCompany: z.string().trim().optional(),
          currentCtc: z.string().trim().optional(),
          expectedCtc: z.string().trim().optional(),
          noticePeriod: z.string().trim().min(1, "Please select your notice period"),
          linkedInUrl: z.string().trim().optional(),
          resumeUrl: z.string().trim().optional(),
          coverNote: z.string().trim().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const application = await createCareerApplication(input);
        return {
          success: true as const,
          applicationId: application.applicationId,
          application,
        };
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only VOLAMP HR & authorized personnel can view career applications.",
        });
      }
      return getCareerApplications();
    }),

    getById: publicProcedure
      .input(z.object({ applicationId: z.string() }))
      .query(async ({ input }) => {
        const app = await getCareerApplicationById(input.applicationId);
        if (!app) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Career application not found.",
          });
        }
        return app;
      }),
  }),
});

export type AppRouter = typeof appRouter;
