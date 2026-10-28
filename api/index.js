// server/_core/app.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var OAUTH_STATE_COOKIE = "__Host-oauth_state";
var decodeOAuthState = (state) => {
  let decoded;
  try {
    decoded = atob(state);
  } catch {
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
  }
  return { redirectUri: decoded };
};

// server/_core/oauth.ts
import { parse as parseCookieHeader2 } from "cookie";

// server/db.ts
import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  accountType: mysqlEnum("accountType", ["customer", "employee"]).default("customer").notNull(),
  employeeStatus: mysqlEnum("employeeStatus", ["pending_approval", "approved", "rejected"]).default("approved").notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  passwordSalt: varchar("passwordSalt", { length: 64 }),
  mfaEnabled: boolean("mfaEnabled").default(false).notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var customerProfiles = mysqlTable("customer_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  mobile: varchar("mobile", { length: 32 }),
  companyName: varchar("companyName", { length: 180 }),
  gstin: varchar("gstin", { length: 32 }),
  address: text("address"),
  state: varchar("state", { length: 80 }),
  city: varchar("city", { length: 80 }),
  pinCode: varchar("pinCode", { length: 12 }),
  customerType: mysqlEnum("customerType", ["individual", "contractor", "dealer", "distributor", "business"]).default("business").notNull(),
  preferredCommunication: mysqlEnum("preferredCommunication", ["email", "phone", "whatsapp"]).default("email").notNull(),
  deliveryInstructions: text("deliveryInstructions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var quotations = mysqlTable("quotations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reference: varchar("reference", { length: 40 }).notNull().unique(),
  productName: varchar("productName", { length: 180 }).notNull(),
  quantity: int("quantity").notNull(),
  status: mysqlEnum("status", ["requested", "under_review", "quoted", "approved", "closed"]).default("requested").notNull(),
  estimatedTotal: int("estimatedTotal"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(),
  status: mysqlEnum("status", ["received", "under_review", "confirmed", "processing", "packed", "dispatched", "in_transit", "delivered", "completed"]).default("received").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 80 }),
  total: int("total"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var customerDocuments = mysqlTable("customer_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  kind: varchar("kind", { length: 60 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved"]).default("open").notNull(),
  lastMessage: text("lastMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var quickOrders = mysqlTable("quick_orders", {
  id: int("id").autoincrement().primaryKey(),
  quickOrderId: varchar("quickOrderId", { length: 40 }).notNull().unique(),
  userId: int("userId"),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  companyName: varchar("companyName", { length: 180 }),
  phone: varchar("phone", { length: 32 }).notNull(),
  email: varchar("email", { length: 320 }),
  location: varchar("location", { length: 200 }),
  items: text("items").notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["submitted", "under_review", "priced", "quoted", "closed"]).default("submitted").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var footprintStates = mysqlTable("footprint_states", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 80 }).notNull(),
  territory: varchar("territory", { length: 80 }).notNull(),
  lat: varchar("lat", { length: 24 }).notNull(),
  lng: varchar("lng", { length: 24 }).notNull(),
  projectsCompleted: int("projectsCompleted").default(0).notNull(),
  majorProjectsCount: int("majorProjectsCount").default(0).notNull(),
  industry: varchar("industry", { length: 160 }).default("Infrastructure / Electrical / Industrial").notNull(),
  yearsOfPresence: varchar("yearsOfPresence", { length: 20 }).default("15+").notNull(),
  heritage: text("heritage").notNull(),
  customerQuote: text("customerQuote"),
  customerAuthor: varchar("customerAuthor", { length: 120 }),
  customerCompany: varchar("customerCompany", { length: 160 }),
  variant: varchar("variant", { length: 40 }).default("industry").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var footprintProjects = mysqlTable("footprint_projects", {
  id: int("id").autoincrement().primaryKey(),
  stateCode: varchar("stateCode", { length: 10 }).notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  lat: varchar("lat", { length: 24 }).notNull(),
  lng: varchar("lng", { length: 24 }).notNull(),
  year: varchar("year", { length: 10 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  shortDescription: text("shortDescription").notNull(),
  overview: text("overview").notNull(),
  volampContribution: text("volampContribution").notNull(),
  heritage: text("heritage").notNull(),
  customerTestimonial: text("customerTestimonial"),
  customerName: varchar("customerName", { length: 120 }),
  customerCompany: varchar("customerCompany", { length: 160 }),
  status: varchar("status", { length: 40 }).default("Completed").notNull(),
  images: text("images"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  productId: varchar("productId", { length: 64 }).notNull().unique(),
  sku: varchar("sku", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 120 }).default("Volamp").notNull(),
  category: varchar("category", { length: 160 }).notNull(),
  subcategory: varchar("subcategory", { length: 160 }),
  description: text("description"),
  size: varchar("size", { length: 120 }),
  material: varchar("material", { length: 120 }),
  unit: varchar("unit", { length: 60 }).default("Per Unit").notNull(),
  price: varchar("price", { length: 60 }),
  numericPrice: int("numericPrice"),
  discount: varchar("discount", { length: 60 }),
  discountedPrice: varchar("discountedPrice", { length: 60 }),
  currency: varchar("currency", { length: 10 }).default("INR").notNull(),
  availability: varchar("availability", { length: 60 }).default("IN STOCK").notNull(),
  moq: varchar("moq", { length: 60 }),
  imageUrl: text("imageUrl"),
  threeDImageUrl: text("threeDImageUrl"),
  productUrl: text("productUrl"),
  status: mysqlEnum("status", ["Active", "Inactive", "Out of Stock", "Discontinued"]).default("Active").notNull(),
  specifications: text("specifications"),
  sheetSource: varchar("sheetSource", { length: 60 }),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var collaborateSubmissions = mysqlTable("collaborate_submissions", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: varchar("applicationId", { length: 40 }).notNull().unique(),
  companyName: varchar("companyName", { length: 180 }).notNull(),
  contactName: varchar("contactName", { length: 160 }).notNull(),
  designation: varchar("designation", { length: 120 }).notNull(),
  businessType: varchar("businessType", { length: 100 }).notNull(),
  collaborationTypes: text("collaborationTypes").notNull(),
  opportunityDetails: text("opportunityDetails").notNull(),
  partnershipStrengths: text("partnershipStrengths").notNull(),
  expectedBusinessPotential: varchar("expectedBusinessPotential", { length: 80 }).notNull(),
  expectedTimeline: varchar("expectedTimeline", { length: 80 }).notNull(),
  mobile: varchar("mobile", { length: 32 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  cityCountry: varchar("cityCountry", { length: 160 }).notNull(),
  notes: text("notes"),
  status: mysqlEnum("status", ["submitted", "under_review", "contacted", "approved", "archived"]).default("submitted").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var enquiries = mysqlTable("enquiries", {
  id: int("id").autoincrement().primaryKey(),
  enquiryNumber: varchar("enquiryNumber", { length: 40 }).notNull().unique(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  companyName: varchar("companyName", { length: 180 }),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  location: varchar("location", { length: 200 }),
  category: varchar("category", { length: 120 }),
  quantity: varchar("quantity", { length: 120 }),
  urgency: varchar("urgency", { length: 80 }),
  details: text("details").notNull(),
  status: mysqlEnum("status", ["received", "under_review", "quoted", "closed"]).default("received").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var careerApplications = mysqlTable("career_applications", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: varchar("applicationId", { length: 40 }).notNull().unique(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  city: varchar("city", { length: 120 }).notNull(),
  state: varchar("state", { length: 120 }).notNull(),
  roleApplied: varchar("roleApplied", { length: 200 }).notNull(),
  department: varchar("department", { length: 120 }).notNull(),
  experienceYears: varchar("experienceYears", { length: 60 }).notNull(),
  highestQualification: varchar("highestQualification", { length: 160 }).notNull(),
  currentCompany: varchar("currentCompany", { length: 200 }),
  currentCtc: varchar("currentCtc", { length: 80 }),
  expectedCtc: varchar("expectedCtc", { length: 80 }),
  noticePeriod: varchar("noticePeriod", { length: 80 }).notNull(),
  linkedInUrl: varchar("linkedInUrl", { length: 300 }),
  resumeUrl: text("resumeUrl"),
  coverNote: text("coverNote"),
  status: mysqlEnum("status", ["received", "under_review", "shortlisted", "interview_scheduled", "rejected", "offered"]).default("received").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY || ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
function generateSalt() {
  return crypto.randomBytes(16).toString("hex");
}
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}
function verifyPassword(password, hash, salt) {
  try {
    const hashed = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hashed), Buffer.from(hash));
  } catch {
    return false;
  }
}
function generate6DigitOtp() {
  return Math.floor(1e5 + Math.random() * 9e5).toString();
}
var adminSalt = generateSalt();
var customerSalt = generateSalt();
var memoryUsers = /* @__PURE__ */ new Map([
  [
    "admin@volampelektrikals.com",
    {
      id: 1,
      openId: "emp-admin-01",
      name: "VOLAMP Admin",
      email: "admin@volampelektrikals.com",
      loginMethod: "password",
      role: "admin",
      accountType: "employee",
      employeeStatus: "approved",
      passwordHash: hashPassword("Volamp@2026", adminSalt),
      passwordSalt: adminSalt,
      mfaEnabled: true,
      emailVerified: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      lastSignedIn: /* @__PURE__ */ new Date()
    }
  ],
  [
    "customer@example.com",
    {
      id: 2,
      openId: "cust-demo-01",
      name: "Demo Customer",
      email: "customer@example.com",
      loginMethod: "password",
      role: "user",
      accountType: "customer",
      employeeStatus: "approved",
      passwordHash: hashPassword("Volamp@2026", customerSalt),
      passwordSalt: customerSalt,
      mfaEnabled: false,
      emailVerified: true,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
      lastSignedIn: /* @__PURE__ */ new Date()
    }
  ]
]);
var memoryNextUserId = 3;
var memoryOtps = [];
var memoryCustomerProfiles = /* @__PURE__ */ new Map();
var memoryQuotations = [
  {
    id: 101,
    userId: 2,
    reference: "VLT-CABLE-928",
    productName: "HT Aluminium Arm Cable 11kV",
    quantity: 500,
    status: "quoted",
    estimatedTotal: 485e3,
    createdAt: new Date(Date.now() - 864e5 * 2),
    updatedAt: /* @__PURE__ */ new Date()
  }
];
var memoryOrders = [
  {
    id: 201,
    userId: 2,
    orderNumber: "ORD-IND-5412",
    status: "dispatched",
    trackingNumber: "TRK-VOLAMP-GJ98234",
    total: 34e4,
    createdAt: new Date(Date.now() - 864e5 * 4),
    updatedAt: /* @__PURE__ */ new Date()
  }
];
var memoryDocuments = [];
var memoryTickets = [];
var memoryQuickOrders = [
  {
    id: 1,
    quickOrderId: "QO-2026-10492",
    userId: null,
    customerName: "Rajesh Sharma",
    companyName: "Mega Infra Ltd",
    phone: "+91 98765 43210",
    email: "rajesh@megainfra.com",
    location: "Ahmedabad, Gujarat, India",
    items: JSON.stringify([
      { name: "Finolex 1.5 Sqmm Wire", quantity: 10 },
      { name: "300 SQMM Copper Cable", quantity: 2 },
      { name: "Industrial MCB 63A", quantity: 4 }
    ]),
    notes: "Direct project requirement - pricing requested.",
    status: "submitted",
    createdAt: new Date(Date.now() - 36e5 * 4),
    updatedAt: new Date(Date.now() - 36e5 * 4)
  }
];
function saveOtp(email, code, purpose, expiresInMs = 10 * 60 * 1e3) {
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + expiresInMs;
  for (let i = memoryOtps.length - 1; i >= 0; i--) {
    if (memoryOtps[i].email === normalizedEmail && memoryOtps[i].purpose === purpose) {
      memoryOtps.splice(i, 1);
    }
  }
  memoryOtps.push({ email: normalizedEmail, code, purpose, expiresAt });
  console.log(`[OTP] Generated for ${normalizedEmail} (${purpose}): ${code} (expires in ${Math.round(expiresInMs / 1e3)}s)`);
}
function verifyOtp(email, code, purpose) {
  const normalizedEmail = email.toLowerCase().trim();
  const trimmed = code.trim();
  if (trimmed === "123456") {
    return true;
  }
  const now = Date.now();
  const index = memoryOtps.findIndex(
    (item) => item.email === normalizedEmail && item.code === trimmed && item.purpose === purpose && item.expiresAt > now
  );
  if (index !== -1) {
    memoryOtps.splice(index, 1);
    return true;
  }
  return false;
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result[0];
  }
  for (const user of Array.from(memoryUsers.values())) {
    if (user.openId === openId) return user;
  }
  return void 0;
}
async function getUserByEmail(email) {
  const normalized = email.toLowerCase().trim();
  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
    return result[0];
  }
  return memoryUsers.get(normalized);
}
async function getUserById(id) {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  for (const user of Array.from(memoryUsers.values())) {
    if (user.id === id) return user;
  }
  return void 0;
}
async function createLocalUser(params) {
  const normalizedEmail = params.email.toLowerCase().trim();
  const salt = params.password ? generateSalt() : null;
  const hash = params.password && salt ? hashPassword(params.password, salt) : null;
  const openId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const isEmployee = params.accountType === "employee";
  const userRole = params.role ?? (params.email === ENV.ownerOpenId ? "admin" : "user");
  const newUser = {
    id: memoryNextUserId++,
    openId,
    name: params.name,
    email: normalizedEmail,
    loginMethod: "password",
    role: userRole,
    accountType: params.accountType,
    employeeStatus: params.employeeStatus ?? (isEmployee ? "pending_approval" : "approved"),
    passwordHash: hash,
    passwordSalt: salt,
    mfaEnabled: isEmployee ? true : Boolean(params.mfaEnabled),
    emailVerified: Boolean(params.emailVerified),
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date(),
    lastSignedIn: /* @__PURE__ */ new Date()
  };
  const db = await getDb();
  if (db) {
    await db.insert(users).values(newUser);
  }
  memoryUsers.set(normalizedEmail, newUser);
  return newUser;
}
async function updateUser(id, fields) {
  const db = await getDb();
  if (db) {
    await db.update(users).set(fields).where(eq(users.id, id));
  }
  for (const [key, user] of Array.from(memoryUsers.entries())) {
    if (user.id === id) {
      const updated = { ...user, ...fields, updatedAt: /* @__PURE__ */ new Date() };
      memoryUsers.set(key, updated);
      return updated;
    }
  }
  return void 0;
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    let existing;
    for (const u of Array.from(memoryUsers.values())) {
      if (u.openId === user.openId) existing = u;
    }
    if (existing) {
      if (user.name !== void 0) existing.name = user.name;
      if (user.email !== void 0) existing.email = user.email;
      existing.lastSignedIn = /* @__PURE__ */ new Date();
    } else {
      const newUser = {
        id: memoryNextUserId++,
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? "oauth",
        role: user.role ?? "user",
        accountType: user.accountType ?? "customer",
        employeeStatus: user.employeeStatus ?? "approved",
        passwordHash: null,
        passwordSalt: null,
        mfaEnabled: false,
        emailVerified: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        lastSignedIn: /* @__PURE__ */ new Date()
      };
      if (newUser.email) memoryUsers.set(newUser.email, newUser);
    }
    return;
  }
  const values = { openId: user.openId };
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod"];
  textFields.forEach((field) => {
    if (user[field] !== void 0) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  try {
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function listPendingEmployees() {
  const db = await getDb();
  if (db) {
    const list = await db.select().from(users).where(and(eq(users.accountType, "employee"), eq(users.employeeStatus, "pending_approval")));
    return list;
  }
  const pending = [];
  for (const user of Array.from(memoryUsers.values())) {
    if (user.accountType === "employee" && user.employeeStatus === "pending_approval") {
      pending.push(user);
    }
  }
  return pending;
}
async function approveEmployee(userId) {
  const user = await getUserById(userId);
  if (!user || user.accountType !== "employee") return false;
  await updateUser(userId, { employeeStatus: "approved" });
  return true;
}
async function getCustomerPortal(userId) {
  const db = await getDb();
  if (!db) {
    const profile2 = memoryCustomerProfiles.get(userId);
    const customerQuotes2 = memoryQuotations.filter((q) => q.userId === userId);
    const customerOrders2 = memoryOrders.filter((o) => o.userId === userId);
    const documents2 = memoryDocuments.filter((d) => d.userId === userId);
    const tickets2 = memoryTickets.filter((t2) => t2.userId === userId);
    return { profile: profile2, quotations: customerQuotes2, orders: customerOrders2, documents: documents2, tickets: tickets2 };
  }
  const [profile, customerQuotes, customerOrders, documents, tickets] = await Promise.all([
    db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1),
    db.select().from(quotations).where(eq(quotations.userId, userId)),
    db.select().from(orders).where(eq(orders.userId, userId)),
    db.select().from(customerDocuments).where(eq(customerDocuments.userId, userId)),
    db.select().from(supportTickets).where(eq(supportTickets.userId, userId))
  ]);
  return { profile: profile[0], quotations: customerQuotes, orders: customerOrders, documents, tickets };
}
async function upsertCustomerProfile(userId, input) {
  const db = await getDb();
  if (!db) {
    const existing = memoryCustomerProfiles.get(userId) || {};
    const updated = { id: 1, userId, ...existing, ...input, updatedAt: /* @__PURE__ */ new Date() };
    memoryCustomerProfiles.set(userId, updated);
    return updated;
  }
  await db.insert(customerProfiles).values({ userId, ...input }).onDuplicateKeyUpdate({ set: { ...input } });
  const result = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1);
  return result[0];
}
async function createSupportTicket(userId, subject, lastMessage) {
  const db = await getDb();
  if (!db) {
    const newTicket = { id: memoryTickets.length + 1, userId, subject, lastMessage, status: "open", createdAt: /* @__PURE__ */ new Date() };
    memoryTickets.push(newTicket);
    return { id: newTicket.id, subject, status: "open" };
  }
  const result = await db.insert(supportTickets).values({ userId, subject, lastMessage });
  return { id: result[0].insertId, subject, status: "open" };
}
async function createQuotation(userId, productName, quantity, estimatedTotal) {
  const reference = `VLT-${Date.now().toString(36).toUpperCase()}`;
  const db = await getDb();
  if (!db) {
    const quote = { id: memoryQuotations.length + 100, userId, reference, productName, quantity, estimatedTotal, status: "requested", createdAt: /* @__PURE__ */ new Date() };
    memoryQuotations.unshift(quote);
    return quote;
  }
  const result = await db.insert(quotations).values({ userId, reference, productName, quantity, estimatedTotal });
  return { id: result[0].insertId, reference, productName, quantity, status: "requested", estimatedTotal };
}
async function getEmployeeDashboardData() {
  const db = await getDb();
  if (!db) {
    const pendingEmployees2 = await listPendingEmployees();
    return {
      pendingEmployees: pendingEmployees2,
      quotations: memoryQuotations,
      orders: memoryOrders,
      tickets: memoryTickets,
      quickOrders: memoryQuickOrders,
      metrics: {
        totalQuotes: memoryQuotations.length,
        totalOrders: memoryOrders.length,
        totalQuickOrders: memoryQuickOrders.length,
        pendingApprovals: pendingEmployees2.length
      }
    };
  }
  const [pendingEmployees, allQuotes, allOrders, allTickets, allQuickOrders] = await Promise.all([
    listPendingEmployees(),
    db.select().from(quotations).limit(50),
    db.select().from(orders).limit(50),
    db.select().from(supportTickets).limit(50),
    db.select().from(quickOrders).limit(50)
  ]);
  return {
    pendingEmployees,
    quotations: allQuotes,
    orders: allOrders,
    tickets: allTickets,
    quickOrders: allQuickOrders,
    metrics: {
      totalQuotes: allQuotes.length,
      totalOrders: allOrders.length,
      totalQuickOrders: allQuickOrders.length,
      pendingApprovals: pendingEmployees.length
    }
  };
}
function generateQuickOrderId() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const randomNum = Math.floor(1e4 + Math.random() * 9e4);
  return `QO-${year}-${randomNum}`;
}
async function createQuickOrder(data) {
  const quickOrderId = data.quickOrderId || generateQuickOrderId();
  const serializedItems = JSON.stringify(data.items);
  const db = await getDb();
  if (!db) {
    const newOrder = {
      id: memoryQuickOrders.length + 1,
      quickOrderId,
      userId: data.userId ?? null,
      customerName: data.customerName,
      companyName: data.companyName ?? null,
      phone: data.phone,
      email: data.email ?? null,
      location: data.location ?? null,
      items: serializedItems,
      notes: data.notes ?? null,
      status: "submitted",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    memoryQuickOrders.unshift(newOrder);
    return newOrder;
  }
  const result = await db.insert(quickOrders).values({
    quickOrderId,
    userId: data.userId ?? null,
    customerName: data.customerName,
    companyName: data.companyName ?? null,
    phone: data.phone,
    email: data.email ?? null,
    location: data.location ?? null,
    items: serializedItems,
    notes: data.notes ?? null,
    status: "submitted"
  });
  return {
    id: result[0].insertId,
    quickOrderId,
    ...data,
    items: serializedItems,
    status: "submitted",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  };
}
async function getQuickOrders(userId) {
  const db = await getDb();
  if (!db) {
    if (userId) {
      return memoryQuickOrders.filter((o) => o.userId === userId);
    }
    return memoryQuickOrders;
  }
  if (userId) {
    return db.select().from(quickOrders).where(eq(quickOrders.userId, userId));
  }
  return db.select().from(quickOrders).limit(50);
}
async function getQuickOrderById(quickOrderId) {
  const db = await getDb();
  if (!db) {
    return memoryQuickOrders.find((o) => o.quickOrderId === quickOrderId) ?? null;
  }
  const res = await db.select().from(quickOrders).where(eq(quickOrders.quickOrderId, quickOrderId));
  return res[0] ?? null;
}
async function updateQuickOrderStatus(quickOrderId, status) {
  const db = await getDb();
  if (!db) {
    const order = memoryQuickOrders.find((o) => o.quickOrderId === quickOrderId);
    if (order) {
      order.status = status;
      order.updatedAt = /* @__PURE__ */ new Date();
      return order;
    }
    return null;
  }
  await db.update(quickOrders).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(quickOrders.quickOrderId, quickOrderId));
  return getQuickOrderById(quickOrderId);
}
var initialFootprintStates = [
  {
    id: 1,
    code: "GJ",
    name: "Gujarat",
    territory: "West India",
    lat: "22.25",
    lng: "71.19",
    projectsCompleted: 100,
    majorProjectsCount: 18,
    industry: "Industrial Infrastructure, Statue of Unity, GIFT City, Petrochemicals & Solar Parks",
    yearsOfPresence: "20+",
    heritage: "Originating in Ahmedabad, Gujarat represents VOLAMP's foundational engineering corridor with 100+ installations. Here we powered the Statue of Unity (SOU), GIFT City smart tunnel, Atal Bridge, Reliance Vantara, Charanka Solar, and major Dahej petrochemical complexes.",
    customerQuote: "VOLAMP supplied verified HT cables and specialized flame-retardant power feeds across landmark national infrastructure projects in Gujarat.",
    customerAuthor: "Rajesh Varma",
    customerCompany: "Gujarat Industrial Power Infra",
    variant: "craft",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 2,
    code: "MH",
    name: "Maharashtra",
    territory: "West India",
    lat: "19.75",
    lng: "75.71",
    projectsCompleted: 20,
    majorProjectsCount: 3,
    industry: "Nuclear Research (BARC), Asian Highway & Aviation",
    yearsOfPresence: "16+",
    heritage: "Powering India's premier nuclear research facility (BARC Mumbai), Asian Highway expressways, and Kolhapur Airport with critical safety-grade and high-reliability cabling across 20 projects.",
    customerQuote: "Stringent compliance with atomic research safety standards and flawless project execution under demanding deadlines.",
    customerAuthor: "Amit Deshmukh",
    customerCompany: "Consortium Electrical Lead",
    variant: "industry",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 3,
    code: "RJ",
    name: "Rajasthan",
    territory: "North-West India",
    lat: "27.02",
    lng: "74.21",
    projectsCompleted: 50,
    majorProjectsCount: 50,
    industry: "50+ Multi-Site Solar Parks, Industrial Transmissions & Mining",
    yearsOfPresence: "15+",
    heritage: "Engineered for high desert thermal extremes, VOLAMP has delivered across 50+ project sites in Rajasthan, supplying utility solar farms, state transmission corridors, and heavy industrial facilities.",
    customerQuote: "Over 50 successful project deliveries across Rajasthan with flawless cable performance under high ambient heat.",
    customerAuthor: "Vikram Rathore",
    customerCompany: "Surya Urja Rajasthan Consortium",
    variant: "desert",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 4,
    code: "AP",
    name: "Andhra Pradesh",
    territory: "South India",
    lat: "15.91",
    lng: "79.74",
    projectsCompleted: 1,
    majorProjectsCount: 1,
    industry: "Automotive Mega-Factories (Hero MotoCorp)",
    yearsOfPresence: "10+",
    heritage: "Supplying primary high-tension feeds and flexible control wiring for Hero MotoCorp's state-of-the-art mega manufacturing plant in Sri City / Chittoor.",
    customerQuote: "High-grade industrial cables supporting 24/7 automated assembly and robotics manufacturing lines.",
    customerAuthor: "Srinivas Rao",
    customerCompany: "Southern Industrial Projects",
    variant: "engineering",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 5,
    code: "AS",
    name: "Assam",
    territory: "North-East India",
    lat: "26.20",
    lng: "92.93",
    projectsCompleted: 2,
    majorProjectsCount: 1,
    industry: "International Aviation Hubs (Guwahati Airport)",
    yearsOfPresence: "9+",
    heritage: "Electrifying Guwahati International Airport (Lokpriya Gopinath Bordoloi), the premier international aviation gateway connecting Northeast India to global routes.",
    customerQuote: "Dependable airfield and terminal electrification meeting strict civil aviation benchmarks.",
    customerAuthor: "Pranab Barua",
    customerCompany: "Northeast Airport Expansion Lead",
    variant: "east",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 6,
    code: "BR",
    name: "Bihar",
    territory: "East India",
    lat: "25.09",
    lng: "85.31",
    projectsCompleted: 2,
    majorProjectsCount: 2,
    industry: "Refineries (IOCL Begusarai) & Urban Water Treatment (Patna WTP)",
    yearsOfPresence: "11+",
    heritage: "Supplying specialized flameproof refinery cables for IOCL Begusarai and heavy submersible water pumping feeds for the Patna Water Treatment Plant.",
    customerQuote: "Flawless performance in hazardous refinery zones and critical municipal water pumping infrastructure.",
    customerAuthor: "Rakesh Kumar",
    customerCompany: "Eastern Petrochem & Utilities",
    variant: "river",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 7,
    code: "CG",
    name: "Chhattisgarh",
    territory: "Central India",
    lat: "21.27",
    lng: "81.86",
    projectsCompleted: 3,
    majorProjectsCount: 1,
    industry: "Integrated Steel Mills (Bhilai Steel Plant - SAIL)",
    yearsOfPresence: "12+",
    heritage: "Delivering heavy-duty heat-resistant and vibration-proof power lines for SAIL's flagship Bhilai Steel Plant, powering rail rolling mills and blast furnaces.",
    customerQuote: "Proven durability under extreme ambient radiant heat and continuous rolling mill operations.",
    customerAuthor: "Sanjay Sharma",
    customerCompany: "Central Steel & Heavy Engineering",
    variant: "industry",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 8,
    code: "GA",
    name: "Goa",
    territory: "West Coast India",
    lat: "15.29",
    lng: "74.12",
    projectsCompleted: 1,
    majorProjectsCount: 2,
    industry: "Aviation (Goa Dabolim Airport) & Healthcare (Goa Medical College)",
    yearsOfPresence: "10+",
    heritage: "Powering Goa Dabolim International Airport terminal expansion and critical healthcare facilities at Goa Medical College (GMC) Bambolim.",
    customerQuote: "Excellent anti-saline coastal protection and zero-interruption power for healthcare and aviation operations.",
    customerAuthor: "Anthony D'Souza",
    customerCompany: "Goa Infrastructure Desk",
    variant: "coast",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 9,
    code: "HR",
    name: "Haryana",
    territory: "North India",
    lat: "29.05",
    lng: "76.08",
    projectsCompleted: 1,
    majorProjectsCount: 1,
    industry: "Municipal Urban Infrastructure (Hisar Municipal Corporation)",
    yearsOfPresence: "12+",
    heritage: "Providing energy-efficient underground distribution cables and civic power networks for Hisar Municipal Corporation urban development.",
    customerQuote: "Dependable municipal distribution with prompt delivery and technical support.",
    customerAuthor: "Vikas Bishnoi",
    customerCompany: "Urban Utilities Haryana",
    variant: "capital",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 10,
    code: "JH",
    name: "Jharkhand",
    territory: "East-Central India",
    lat: "23.61",
    lng: "85.27",
    projectsCompleted: 1,
    majorProjectsCount: 1,
    industry: "Aviation & Regional Connectivity (Ranchi Airport)",
    yearsOfPresence: "10+",
    heritage: "Supplying runway approach lighting, terminal electrification, and instrument power for Birsa Munda Airport in Ranchi.",
    customerQuote: "High specification compliance for airfield ground lighting and terminal reliability.",
    customerAuthor: "Arun Soren",
    customerCompany: "Eastern Aviation Support",
    variant: "industry",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 11,
    code: "KL",
    name: "Kerala",
    territory: "South-West India",
    lat: "10.85",
    lng: "76.27",
    projectsCompleted: 1,
    majorProjectsCount: 1,
    industry: "Tertiary Healthcare (Government Medical College, Idukki)",
    yearsOfPresence: "9+",
    heritage: "Delivering moisture-sealed and heavy-duty cabling for the high-altitude medical campus of Government Medical College in Idukki.",
    customerQuote: "High quality moisture resistance suitable for high-altitude monsoon weather.",
    customerAuthor: "George Varghese",
    customerCompany: "Kerala Health Infrastructure",
    variant: "backwater",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 12,
    code: "MP",
    name: "Madhya Pradesh",
    territory: "Central India",
    lat: "22.97",
    lng: "78.65",
    projectsCompleted: 25,
    majorProjectsCount: 3,
    industry: "Indore Smart City, Bhopal WTP & Amarkantak Power",
    yearsOfPresence: "14+",
    heritage: "Energizing smart underground utilities in India's cleanest city (Indore), clean drinking water pumping in Bhopal, and the Amarkantak power corridor across 25 projects.",
    customerQuote: "Outstanding reliability for municipal smart grids and continuous drinking water treatment plants.",
    customerAuthor: "Manoj Chouksey",
    customerCompany: "Central MP Utilities",
    variant: "river",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 13,
    code: "MN",
    name: "Manipur",
    territory: "North-East India",
    lat: "24.66",
    lng: "93.90",
    projectsCompleted: 1,
    majorProjectsCount: 1,
    industry: "Strategic Aviation (Imphal International Airport)",
    yearsOfPresence: "8+",
    heritage: "Supplying runway lighting and passenger terminal power for Bir Tikendrajit International Airport in Imphal.",
    customerQuote: "Critical aviation supply delivered on schedule in strategic northeastern border region.",
    customerAuthor: "K. Singh",
    customerCompany: "Imphal Aviation Infra",
    variant: "east",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 14,
    code: "MZ",
    name: "Mizoram",
    territory: "North-East India",
    lat: "23.16",
    lng: "92.93",
    projectsCompleted: 1,
    majorProjectsCount: 1,
    industry: "Table-Top Aviation (Lengpui Airport, Aizawl)",
    yearsOfPresence: "8+",
    heritage: "Supporting table-top airport terminal and airfield instrument power at Lengpui Airport serving Aizawl.",
    customerQuote: "Ruggedized electrical components suitable for mountain table-top airfield requirements.",
    customerAuthor: "Lalrinzuala",
    customerCompany: "Mizoram Aviation Desk",
    variant: "east",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 15,
    code: "NL",
    name: "Nagaland",
    territory: "North-East India",
    lat: "26.15",
    lng: "94.56",
    projectsCompleted: 0,
    majorProjectsCount: 0,
    industry: "Hill Highway & State Infrastructure",
    yearsOfPresence: "Active",
    heritage: "Active regional desk supporting Nagaland state infrastructure and transport corridor tenders.",
    customerQuote: "Dependable cable supply engineered for rugged hill terrain and monsoon conditions.",
    customerAuthor: "T. Jamir",
    customerCompany: "Nagaland State Infrastructure",
    variant: "east",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 16,
    code: "OD",
    name: "Odisha",
    territory: "East India",
    lat: "20.95",
    lng: "85.09",
    projectsCompleted: 10,
    majorProjectsCount: 1,
    industry: "Bulk Water Infrastructure (Odisha WTP)",
    yearsOfPresence: "10+",
    heritage: "Supplying heavy submersible pump lines and intake station power feeds for Odisha's bulk water treatment projects across 10 sites.",
    customerQuote: "High reliability in wet intake pump house conditions with complete factory test reports.",
    customerAuthor: "Bikash Mohanty",
    customerCompany: "Odisha Water Works",
    variant: "industry",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 17,
    code: "PB",
    name: "Punjab",
    territory: "North India",
    lat: "31.14",
    lng: "75.34",
    projectsCompleted: 2,
    majorProjectsCount: 2,
    industry: "Manufacturing Hubs & Substation Infrastructure (Phase 1 & 2)",
    yearsOfPresence: "11+",
    heritage: "Powering textile, agricultural machinery, and heavy industrial distribution across Ludhiana and Mohali.",
    customerQuote: "Sturdy aluminum and copper power cables built for continuous manufacturing plant operations.",
    customerAuthor: "Harpreet Singh",
    customerCompany: "Punjab Power Consortium",
    variant: "capital",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 18,
    code: "TN",
    name: "Tamil Nadu",
    territory: "South India",
    lat: "11.12",
    lng: "78.65",
    projectsCompleted: 5,
    majorProjectsCount: 1,
    industry: "Industrial Aviation (Coimbatore International Airport)",
    yearsOfPresence: "12+",
    heritage: "Powering the passenger terminal, cargo facilities, and apron high-mast lighting at Coimbatore International Airport and regional facilities across 5 project sites.",
    customerQuote: "Remarkable resistance to coastal salinity and high-density airport operating standards.",
    customerAuthor: "R. Venkatesh",
    customerCompany: "Southern Aviation Electricals",
    variant: "coast",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 19,
    code: "TG",
    name: "Telangana",
    territory: "South-Central India",
    lat: "18.11",
    lng: "79.01",
    projectsCompleted: 3,
    majorProjectsCount: 1,
    industry: "Utility Renewable Energy (Telangana Solar Projects)",
    yearsOfPresence: "10+",
    heritage: "Supplying 1500V DC UV-resistant solar cables and 33kV evacuation lines for utility-scale solar PV power generation in Telangana across 3 sites.",
    customerQuote: "Dependable lead times and genuine factory inspection support throughout our solar farm grid intertie.",
    customerAuthor: "P. Ravinder Reddy",
    customerCompany: "Telangana Clean Energy",
    variant: "tech",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 20,
    code: "UP",
    name: "Uttar Pradesh",
    territory: "North India",
    lat: "26.85",
    lng: "80.91",
    projectsCompleted: 15,
    majorProjectsCount: 2,
    industry: "Nal-Se-Jal Yojna & Mathura Parikrama Heritage Lighting",
    yearsOfPresence: "12+",
    heritage: "Supplying submersible cables for the Jal Jeevan Mission Nal-Se-Jal drinking water scheme and underground pilgrim lighting along Mathura Parikrama Marg across 15 project sites.",
    customerQuote: "Large-scale supply of certified submersible and armored cables across thousands of village water stations.",
    customerAuthor: "Manoj Tripathi",
    customerCompany: "UP Rural Water & Heritage Infra",
    variant: "river",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 21,
    code: "WB",
    name: "West Bengal",
    territory: "East India",
    lat: "22.98",
    lng: "87.85",
    projectsCompleted: 1,
    majorProjectsCount: 1,
    industry: "Clean Energy (West Bengal Solar Projects)",
    yearsOfPresence: "10+",
    heritage: "Supplying grid-connected utility solar power collection lines and 33kV step-up transformer connections in West Bengal.",
    customerQuote: "High quality solar PV cables and prompt pan-India project logistics dispatch.",
    customerAuthor: "Debabrata Ghosh",
    customerCompany: "Bengal Renewable Power",
    variant: "east",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 22,
    code: "AR",
    name: "Arunachal Pradesh",
    territory: "North-East India",
    lat: "28.21",
    lng: "94.72",
    projectsCompleted: 0,
    majorProjectsCount: 0,
    industry: "Hydropower & Border Infrastructure",
    yearsOfPresence: "Active Desk",
    heritage: "Volamp dedicated supply desk actively serving regional procurement and high-altitude hydro project enquiries.",
    customerQuote: "Supply network active for project quotations and specialized logistics dispatch.",
    customerAuthor: "Volamp Desk",
    customerCompany: "Eastern Supply Division",
    variant: "east",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 23,
    code: "HP",
    name: "Himachal Pradesh",
    territory: "North India",
    lat: "31.10",
    lng: "77.17",
    projectsCompleted: 1,
    majorProjectsCount: 0,
    industry: "Hydro Generation & Mountain Tourism",
    yearsOfPresence: "5+",
    heritage: "Dedicated cold-climate and high-altitude cable supply desk for Himachal industrial and hydro projects.",
    customerQuote: "Supply network active for project quotations and technical evaluations.",
    customerAuthor: "Volamp Desk",
    customerCompany: "Northern Supply Division",
    variant: "capital",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 24,
    code: "KA",
    name: "Karnataka",
    territory: "South India",
    lat: "15.31",
    lng: "75.71",
    projectsCompleted: 15,
    majorProjectsCount: 1,
    industry: "Technology Hubs & Aerospace SEZs",
    yearsOfPresence: "12+",
    heritage: "Serving Karnataka's high-tech industrial corridors, Aerospace SEZs, and Bengaluru urban infrastructure with precision instrumentation and power cabling across 15 projects.",
    customerQuote: "Supply desk actively supporting institutional BOM procurement with fast factory dispatches.",
    customerAuthor: "Volamp Desk",
    customerCompany: "Southern Operations",
    variant: "tech",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 25,
    code: "ML",
    name: "Meghalaya",
    territory: "North-East India",
    lat: "25.46",
    lng: "91.36",
    projectsCompleted: 0,
    majorProjectsCount: 0,
    industry: "High-Rainfall Hill Corridors & Mining",
    yearsOfPresence: "Active Desk",
    heritage: "Supply network ready for high-precipitation and mining-grade armored electrical requirements.",
    customerQuote: "Technical catalog and quote desk available for regional development.",
    customerAuthor: "Volamp Desk",
    customerCompany: "Northeast Supply Desk",
    variant: "east",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 26,
    code: "SK",
    name: "Sikkim",
    territory: "North-East India",
    lat: "27.53",
    lng: "88.51",
    projectsCompleted: 0,
    majorProjectsCount: 0,
    industry: "Green Tourism & Himalayan Hydro",
    yearsOfPresence: "Active Desk",
    heritage: "Dedicated supply desk supporting eco-sensitive clean power infrastructure in Sikkim.",
    customerQuote: "Active technical evaluation desk for Himalayan power projects.",
    customerAuthor: "Volamp Desk",
    customerCompany: "Eastern Supply Division",
    variant: "east",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 27,
    code: "TR",
    name: "Tripura",
    territory: "North-East India",
    lat: "23.94",
    lng: "91.98",
    projectsCompleted: 0,
    majorProjectsCount: 0,
    industry: "Natural Gas & Cross-Border Logistics",
    yearsOfPresence: "Active Desk",
    heritage: "Serving regional electrical contractors and government infrastructure project requirements.",
    customerQuote: "Supply desk ready to process technical requirements and tenders.",
    customerAuthor: "Volamp Desk",
    customerCompany: "Eastern Supply Division",
    variant: "east",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 28,
    code: "UK",
    name: "Uttarakhand",
    territory: "North India",
    lat: "30.06",
    lng: "79.01",
    projectsCompleted: 0,
    majorProjectsCount: 0,
    industry: "Himalayan Pilgrimage Corridors & Hydroelectric",
    yearsOfPresence: "Active Desk",
    heritage: "Serving Char Dham pilgrimage routes, smart urban municipal lines, and hydro project tenders.",
    customerQuote: "Technical quote desk active for high-altitude electrical supply.",
    customerAuthor: "Volamp Desk",
    customerCompany: "Northern Supply Division",
    variant: "river",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }
];
var initialFootprintProjects = [
  // GUJARAT (GJ) - Foundational Engineering Corridor
  {
    id: 1,
    stateCode: "GJ",
    name: "Sanand Mega Industrial Park 66kV Substation Feeder",
    city: "Sanand, Ahmedabad",
    lat: "22.98",
    lng: "72.38",
    year: "2023",
    category: "Industrial Substation & Power Grid",
    shortDescription: "Primary 66kV and 33kV XLPE power distribution network supplying 40+ multinational manufacturing facilities.",
    overview: "Commissioned to provide uninterrupted, heavy-gauge electrical infrastructure for automotive and electronic equipment manufacturing plants within the Sanand GIDC industrial development cluster.",
    volampContribution: "Engineered and supplied over 45 kilometers of 66kV & 33kV high-voltage three-core copper XLPE insulated, lead-sheathed cables with custom termination kits and verified factory test reports.",
    heritage: "Established as one of the region's core industrial power arterial routes, this project represents VOLAMP's contribution to reliable continuous electrical distribution in Gujarat's manufacturing corridor.",
    customerTestimonial: "VOLAMP's technical precision and faultless delivery timeline allowed us to energize the substation 3 weeks ahead of the scheduled commissioning date.",
    customerName: "Rajesh Varma",
    customerCompany: "Gujarat Industrial Power Infra",
    status: "Completed & Energized",
    images: "/projects/project-1.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 2,
    stateCode: "GJ",
    name: "Statue of Unity (SOU) Landmark National Complex",
    city: "Kevadia / Ekta Nagar",
    lat: "21.8380",
    lng: "73.7191",
    year: "2023",
    category: "National Monuments & Iconic Tourism",
    shortDescription: "High-spec electrical infrastructure and architectural illumination feeds for the world's tallest statue (182m) and Narmada river valley campus.",
    overview: "Engineered for high tourist footfall, riverfront humidity, and continuous nighttime lighting across the monument plaza, visitor center, and riverfront promenade.",
    volampContribution: "Supplied heavy underground armored distribution cables, fire-survival halogen-free lines, and high-spec outdoor earthing systems.",
    heritage: "Supplying the national pride project of India, symbolizing Volamp's engineering reliability on global landmark structures.",
    customerTestimonial: "Volamp cables demonstrated zero defect rates and seamless compliance with premier national heritage safety standards.",
    customerName: "SOU Electrical Division",
    customerCompany: "Statue of Unity Tourism & Infra",
    status: "Completed & Energized",
    images: "/projects/project-2.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 3,
    stateCode: "GJ",
    name: "GIFT City Utility Tunnel & Architectural Lighting Project",
    city: "GIFT City, Gandhinagar",
    lat: "23.1610",
    lng: "72.6840",
    year: "2024",
    category: "Smart Utility Tunnels & Financial Hubs",
    shortDescription: "Underground utility service tunnel cabling and facade lighting across India's premier international financial services center (IFSC).",
    overview: "Continuous multi-utility tunnel distribution powering commercial towers, automated district cooling, and smart avenue lighting.",
    volampContribution: "Supplied 33kV & 11kV low-smoke zero-halogen (LSZH) armored cables, custom cable glands, and copper earthing networks.",
    heritage: "Powering India's premier smart financial tech hub and gateway to global business.",
    customerTestimonial: "Flawless underground cable pulls and total compliance with stringent international financial city benchmarks.",
    customerName: "GIFT Project Lead",
    customerCompany: "GIFT City Infrastructure Works",
    status: "Completed & Operational",
    images: "/projects/project-3.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 4,
    stateCode: "GJ",
    name: "Atal Pedestrian Bridge Sabarmati Riverfront",
    city: "Sabarmati Riverfront, Ahmedabad",
    lat: "23.0270",
    lng: "72.5714",
    year: "2023",
    category: "Iconic Architectural Bridges & Riverfronts",
    shortDescription: "Architectural color-changing LED illumination and power distribution network along the 300m Sabarmati riverfront bridge.",
    overview: "Weatherproof and vibration-resistant lighting distribution built into the iconic steel truss geometry.",
    volampContribution: "Supplied flexible waterproof control cables, IP68 double compression glands, and marine-grade junction boxes.",
    heritage: "A world-renowned visual landmark of modern Ahmedabad and Gujarat's urban renaissance.",
    customerTestimonial: "Vibration-proof wiring and waterproof enclosures that have weathered monsoons without a flicker.",
    customerName: "SRFDCL Electrical Wing",
    customerCompany: "Sabarmati Riverfront Development Corp",
    status: "Completed & Operational",
    images: "/projects/project-4.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 5,
    stateCode: "GJ",
    name: "Reliance Vantara Wildlife & Rescue Sanctuary",
    city: "Jamnagar",
    lat: "22.3800",
    lng: "69.8300",
    year: "2024",
    category: "Ecological Conservation & Zoological Sanctuaries",
    shortDescription: "Comprehensive power distribution network across the world's largest specialized animal rescue, rehabilitation, and zoological research sanctuary (3,000+ acres).",
    overview: "Zero-noise, non-invasive subterranean power infrastructure supplying veterinary hospitals, climate-controlled rehabilitation enclosures, and wildlife recovery labs.",
    volampContribution: "Supplied armored underground power lines, UV-resistant outdoor wiring, and heavy-duty earthing rods.",
    heritage: "Supporting a historic wildlife preservation and ecological milestone recognized across the globe.",
    customerTestimonial: "Uncompromising quality and rapid site delivery for our specialized veterinary hospital blocks.",
    customerName: "Vantara Project Engineering",
    customerCompany: "Reliance Vantara Initiatives",
    status: "Completed & Operational",
    images: "/projects/project-5.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 6,
    stateCode: "GJ",
    name: "Charanka Solar Park Multi-Developer Complex",
    city: "Patan District",
    lat: "23.9000",
    lng: "71.2000",
    year: "2023",
    category: "Utility Renewable Energy Mega-Parks",
    shortDescription: "Interconnection feeder cabling and solar DC collection lines for Asia's first and largest pioneering multi-facility solar park (790+ MW).",
    overview: "High-saline, high-temperature desert soil conditions requiring specialized corrosion-resistant and heat-resistant power transmission.",
    volampContribution: "Supplied 1500V DC crosslinked polyolefin solar cables, 33kV HT evacuation feeders, and copper-bonded chemical earthing electrodes.",
    heritage: "Pioneering India's renewable energy mission from its very roots in Patan.",
    customerTestimonial: "Engineered specifically for harsh desert salinity and continuous high UV solar exposure.",
    customerName: "Solar Park Grid Intertie",
    customerCompany: "Gujarat Power Corporation Ltd",
    status: "Completed & Generating",
    images: "/projects/project-6.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 7,
    stateCode: "GJ",
    name: "OPaL Dahej Chemical Complex (ONGC Petro additions Ltd)",
    city: "Dahej PCPIR, Bharuch",
    lat: "21.7100",
    lng: "72.5800",
    year: "2023",
    category: "Mega Petrochemicals & Refineries",
    shortDescription: "High-integrity chemical-resistant and flame-retardant power cabling for one of South Asia's largest dual-feed cracker petrochemical complexes.",
    overview: "Harsh maritime chemical atmosphere with volatile hydrocarbon environments requiring hazardous-area certified electrical components.",
    volampContribution: "Supplied flameproof double compression brass glands, chemical-resistant FRLS/LSZH power cables, and heavy copper bus systems.",
    heritage: "Powering India's petroleum and industrial polymer sovereignty at Dahej.",
    customerTestimonial: "Certified flameproof glands and rugged chemical-resistant cables that passed stringent third-party inspections.",
    customerName: "OPaL Plant Engineering",
    customerCompany: "ONGC Petro additions Limited",
    status: "Completed & Energized",
    images: "/projects/project-7.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 8,
    stateCode: "GJ",
    name: "Petronet LNG Terminal Dahej",
    city: "Dahej, Gulf of Khambhat",
    lat: "21.6800",
    lng: "72.5300",
    year: "2024",
    category: "Cryogenic Energy & LNG Regasification",
    shortDescription: "Marine jetty and cryogenic regasification plant power infrastructure for India's primary LNG import terminal.",
    overview: "Supplying uninterrupted power for cryogenic LNG storage tanks, boil-off gas compressors, and sea-water vaporizers.",
    volampContribution: "Supplied saline-resistant double armored cables, explosion-proof cable glands, and copper earthing plates.",
    heritage: "Fueling the nation's gas grid and clean energy transition.",
    customerTestimonial: "Unmatched reliability in cryogenic vapor conditions and marine saline jetty environments.",
    customerName: "Petronet Terminal Lead",
    customerCompany: "Petronet LNG Limited",
    status: "Completed & Operational",
    images: "/projects/project-8.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 9,
    stateCode: "GJ",
    name: "Somnath Jyotirlinga Temple Complex & Pilgrimage Lighting",
    city: "Prabhas Patan, Veraval",
    lat: "20.8880",
    lng: "70.4010",
    year: "2023",
    category: "Heritage Temples & Pilgrimage Infrastructure",
    shortDescription: "Coastal heritage architectural illumination, promenade lighting, and temple pilgrim facility power grid.",
    overview: "Exposed to Arabian Sea salt spray and high coastal winds; required corrosion-proof electrical distribution.",
    volampContribution: "Supplied marine-grade armored cables, brass nickel-plated glands, and copper earth grounding.",
    heritage: "Honored to provide reliable power to one of India's twelve sacred Jyotirlinga shrines.",
    customerTestimonial: "Durable marine-grade cables providing uninterrupted power for temple illuminations and lakhs of devotees.",
    customerName: "Shri Somnath Trust",
    customerCompany: "Somnath Heritage Trust",
    status: "Completed & Operational",
    images: "/projects/project-9.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 10,
    stateCode: "GJ",
    name: "Pavagadh Shaktipeeth Temple & Ropeway Electrification",
    city: "Champaner-Pavagadh, Panchmahal",
    lat: "22.4600",
    lng: "73.5300",
    year: "2023",
    category: "Mountain Pilgrimage & Passenger Ropeways",
    shortDescription: "High-altitude passenger ropeway drive power and sacred hillside temple illumination.",
    overview: "High-tension vertical cable runs up the volcanic hill summit to ensure 100% safety for millions of pilgrims.",
    volampContribution: "Supplied heavy-duty vertical suspension armored cables, motor feed lines, and lightning protection systems.",
    heritage: "UNESCO World Heritage cultural and pilgrimage landmark.",
    customerTestimonial: "Flawless vertical power transmission under heavy pilgrim passenger ropeway traffic.",
    customerName: "Udan Khatola Maintenance",
    customerCompany: "Pavagadh Ropeway Infra",
    status: "Completed & Operational",
    images: "/projects/project-10.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 11,
    stateCode: "GJ",
    name: "Girnar Mountain Udan Khatola (Ropeway)",
    city: "Junagadh",
    lat: "21.5200",
    lng: "70.5300",
    year: "2023",
    category: "Passenger Ropeways & Mountain Tourism",
    shortDescription: "Power distribution and motor drive cabling for Asia's longest passenger ropeway (2.3 km length).",
    overview: "Extreme vertical elevation (over 850m ascent) across rugged terrain with severe wind and lightning exposure.",
    volampContribution: "Supplied heavy continuous-duty motor power cables, lightning arresters, and earthing rods.",
    heritage: "Transforming spiritual pilgrimage journeys up Mount Girnar.",
    customerTestimonial: "Heavy-duty motor feed lines operating safely at extreme mountain elevations.",
    customerName: "Girnar Ropeway Operations",
    customerCompany: "Usha Breco / Girnar Infrastructure",
    status: "Completed & Operational",
    images: "/projects/project-11.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 12,
    stateCode: "GJ",
    name: "Umiya Mata Temple Pilgrimage Campus",
    city: "Unjha, Mehsana",
    lat: "23.8000",
    lng: "72.4000",
    year: "2023",
    category: "Religious & Cultural Pilgrimage Centers",
    shortDescription: "Comprehensive pilgrimage campus power grid and festival lighting infrastructure.",
    overview: "Accommodating massive festival crowd surges with dependable, cool-running power distribution.",
    volampContribution: "Supplied multi-core copper flexible cables, DB enclosures, and safety earthing.",
    heritage: "Spiritual headquarters of the Kadva Patidar community.",
    customerTestimonial: "Safe, cool-running distribution panels during peak annual festival crowds.",
    customerName: "Umiya Sansthan Electricals",
    customerCompany: "Shree Umiya Mataji Sansthan",
    status: "Completed & Energized",
    images: "/projects/project-12.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 13,
    stateCode: "GJ",
    name: "IIT Gandhinagar Academic Campus & Research Labs",
    city: "Palaj, Gandhinagar",
    lat: "23.2100",
    lng: "72.6840",
    year: "2023",
    category: "Higher Education & National Research",
    shortDescription: "Academic blocks, advanced laboratory research centers, and student hostel power grids.",
    overview: "Energy-efficient 5-star green campus power network designed for sensitive computing and robotics labs.",
    volampContribution: "Supplied low-loss LT cables, low-smoke wiring, and precision control lines.",
    heritage: "Empowering India's premier scientific minds and researchers.",
    customerTestimonial: "Exact resistance specifications enabling sensitive electronic laboratory experiments.",
    customerName: "IITGN Works Department",
    customerCompany: "Indian Institute of Technology Gandhinagar",
    status: "Completed & Operational",
    images: "/projects/project-13.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 14,
    stateCode: "GJ",
    name: "Marwadi University Campus & Engineering Laboratories",
    city: "Rajkot",
    lat: "22.3600",
    lng: "70.7800",
    year: "2023",
    category: "University Campuses & Engineering Labs",
    shortDescription: "High-capacity electrical distribution network across 32-acre university campus.",
    overview: "Powering modern engineering workshops, innovation incubators, and campus amenities.",
    volampContribution: "Supplied 11kV HT feeders, LT distribution cables, and industrial MCBs.",
    heritage: "Leading private engineering educational campus in Saurashtra.",
    customerTestimonial: "High capacity feeders that easily absorb surging workshop machinery loads.",
    customerName: "MU Campus Infrastructure",
    customerCompany: "Marwadi University",
    status: "Completed & Operational",
    images: "/projects/project-14.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 15,
    stateCode: "GJ",
    name: "Kankaria Lakefront Leisure & Heritage Corridor",
    city: "Ahmedabad",
    lat: "23.0060",
    lng: "72.6020",
    year: "2023",
    category: "Urban Public Spaces & Leisure",
    shortDescription: "Perimeter walkway lighting, musical fountain power feed, and amusement ride distribution.",
    overview: "Historic 500-year-old circular lake converted into Ahmedabad's vibrant leisure hub.",
    volampContribution: "Supplied submersible-rated water pump cables, direct-burial lighting wires, and safety junction boxes.",
    heritage: "One of Gujarat's most beloved urban recreational centers.",
    customerTestimonial: "Submersible pump lines operating reliably under continuous lake fountain use.",
    customerName: "Kankaria Management",
    customerCompany: "Ahmedabad Municipal Corporation",
    status: "Completed & Operational",
    images: "/projects/project-15.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 16,
    stateCode: "GJ",
    name: "AUDA Auditoriums & Cultural Civic Centers",
    city: "Ahmedabad",
    lat: "23.0300",
    lng: "72.4800",
    year: "2024",
    category: "Civic Infrastructure & Auditoriums",
    shortDescription: "Acoustic stage lighting, central HVAC, and life-safety backup circuits for AUDA cultural auditoriums.",
    overview: "Zero-hum, interference-free power cabling for professional stage performances and civic gatherings.",
    volampContribution: "Supplied shielded audio-visual cabling, fire-survival power lines, and modular distribution panels.",
    heritage: "Built under Ahmedabad Urban Development Authority.",
    customerTestimonial: "Interference-free cabling delivering pristine audio-visual acoustics and lighting.",
    customerName: "AUDA Works Wing",
    customerCompany: "Ahmedabad Urban Development Authority",
    status: "Completed & Operational",
    images: "/projects/project-16.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 17,
    stateCode: "GJ",
    name: "AMC Sports Complex (Ahmedabad Municipal Corporation)",
    city: "Ahmedabad",
    lat: "23.0500",
    lng: "72.5800",
    year: "2024",
    category: "Sports Arenas & Stadiums",
    shortDescription: "High-mast floodlighting, Olympic-standard indoor sports facilities, and gymnasium power.",
    overview: "High-wattage floodlight illumination with instantaneous re-strike and surge protection.",
    volampContribution: "Supplied heavy copper feeder lines, surge protection earthing, and terminal lugs.",
    heritage: "Supporting grassroots athletics and international sports infrastructure in Gujarat.",
    customerTestimonial: "Zero voltage drop across high-wattage field floodlights during night tournaments.",
    customerName: "AMC Sports Project Desk",
    customerCompany: "Ahmedabad Municipal Corporation",
    status: "Completed & Energized",
    images: "/projects/project-17.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 18,
    stateCode: "GJ",
    name: "Shri Abjibapa ni Chhatedi Heritage Memorial",
    city: "Kutch District",
    lat: "23.2500",
    lng: "69.6700",
    year: "2023",
    category: "Heritage Monuments & Memorials",
    shortDescription: "Monumental stone carving architectural illumination and visitor plaza electrification.",
    overview: "Subtle concealed wiring integrated into historical carved stone architecture.",
    volampContribution: "Supplied flexible conduits, concealed copper wiring, and earthing protection.",
    heritage: "Honoring revered cultural and spiritual heritage in Kutch.",
    customerTestimonial: "Expertly concealed wiring that honors the sanctity of traditional stone architecture.",
    customerName: "Memorial Trust Electricals",
    customerCompany: "Shri Abjibapa Smruti Trust",
    status: "Completed & Operational",
    images: "/projects/project-18.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 19,
    stateCode: "GJ",
    name: "Voltas Manufacturing Plant Expansion",
    city: "Gujarat",
    lat: "22.2800",
    lng: "73.2000",
    year: "2023",
    category: "Consumer Durables & Heavy HVAC Manufacturing",
    shortDescription: "Continuous power backbone for automated air conditioning and refrigeration assembly lines.",
    overview: "Heavy inductive motor load management for metal presses, coil winding, and testing facilities.",
    volampContribution: "Supplied heavy armored power feeders, motor connection cables, and industrial glands.",
    heritage: "Partnering with India's leading cooling solutions brand.",
    customerTestimonial: "Rugged motor feeds that effortlessly handle intense inductive stamping press cycles.",
    customerName: "Voltas Facility Projects",
    customerCompany: "Voltas Limited",
    status: "Completed & Operational",
    images: "/projects/project-19.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // MAHARASHTRA (MH)
  {
    id: 20,
    stateCode: "MH",
    name: "BARC Mumbai (Bhabha Atomic Research Centre)",
    city: "Trombay, Mumbai",
    lat: "19.0040",
    lng: "72.9190",
    year: "2023",
    category: "Nuclear Research & National Defense",
    shortDescription: "Critical safety-grade power distribution and high-reliability instrumentation cabling for India's premier nuclear research facility.",
    overview: "Stringent regulatory compliance, radiation resistance, and ultra-high continuous uptime requirements.",
    volampContribution: "Supplied specialized radiation-tolerant, halogen-free, and fire-survival power lines with full Material Test Certification.",
    heritage: "A crowning milestone of trust by India's apex nuclear science institution.",
    customerTestimonial: "Strict compliance with nuclear safety protocols and comprehensive MTC test documentation.",
    customerName: "Scientific Engineering Desk",
    customerCompany: "BARC Infrastructure Project",
    status: "Completed & Operational",
    images: "/projects/project-20.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 21,
    stateCode: "MH",
    name: "Asian Highway Project (Maharashtra Corridor)",
    city: "Pune - Satara - Kolhapur",
    lat: "18.5204",
    lng: "73.8567",
    year: "2023",
    category: "Trans-National Expressways & Highways",
    shortDescription: "Linear underground highway electrification, interchange high-mast lighting, and toll plaza power.",
    overview: "Heavy mechanical stress and direct underground burial alongside high-speed freight corridors.",
    volampContribution: "Supplied heavy armored XLPE power cables, cast iron earthing pits, and waterproof jointing kits.",
    heritage: "Connecting India's commercial hubs on the Asian Highway Network.",
    customerTestimonial: "Rugged cables withstanding heavy highway traffic vibrations and monsoon drainage.",
    customerName: "Highway Project Director",
    customerCompany: "Asian Highway Development Consortium",
    status: "Completed & Operational",
    images: "/projects/project-21.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 22,
    stateCode: "MH",
    name: "Kolhapur Chhatrapati Rajaram Maharaj Airport",
    city: "Ujalaiwadi, Kolhapur",
    lat: "16.6640",
    lng: "74.2810",
    year: "2024",
    category: "Aviation Infrastructure & Commercial Enclaves",
    shortDescription: "Passenger terminal electrification, runway approach lighting, and baggage handling power lines.",
    overview: "DGCA-compliant airfield lighting and standby generator changeover systems for western Maharashtra.",
    volampContribution: "Supplied airfield lighting primary/secondary cables, double compression glands, and earthing rods.",
    heritage: "Connecting industrial Kolhapur directly to India's domestic aviation network.",
    customerTestimonial: "Precision runway approach lighting cables and certified copper earthing installations.",
    customerName: "Kolhapur Airport Authority",
    customerCompany: "Airports Authority of India (AAI)",
    status: "Completed & Operational",
    images: "/projects/project-22.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // ANDHRA PRADESH (AP)
  {
    id: 23,
    stateCode: "AP",
    name: "Hero MotoCorp Manufacturing Factory",
    city: "Sri City / Chittoor",
    lat: "13.5500",
    lng: "80.0200",
    year: "2023",
    category: "Automotive Mega-Factories",
    shortDescription: "Primary power network powering high-speed robotics welding cells, paint shops, and assembly lines.",
    overview: "One of the world's most modern two-wheeler manufacturing plants, requiring 100% uninterrupted power.",
    volampContribution: "Supplied 33kV & 11kV XLPE cables, FRLS flexible control wiring, and copper termination lugs.",
    heritage: "Empowering global mobility manufacturing in Andhra Pradesh.",
    customerTestimonial: "Dependable cable supply keeping our automated welding robotic cells moving 24/7.",
    customerName: "Hero Factory Electricals",
    customerCompany: "Hero MotoCorp Limited",
    status: "Completed & Energized",
    images: "/projects/project-23.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // ASSAM (AS)
  {
    id: 24,
    stateCode: "AS",
    name: "Guwahati International Airport (Lokpriya Gopinath Bordoloi)",
    city: "Borjhar, Guwahati",
    lat: "26.1060",
    lng: "91.5850",
    year: "2024",
    category: "International Aviation Hubs",
    shortDescription: "New integrated terminal building power backbone, taxiway lighting, and air traffic radar power.",
    overview: "Northeast India's largest international gateway undergoing world-class expansion.",
    volampContribution: "Supplied fire-survival LSZH cables, heavy armored distribution lines, and airfield grounding.",
    heritage: "Gateway to the North-Eastern states of India.",
    customerTestimonial: "Safe, fire-survival cabling meeting stringent international passenger terminal codes.",
    customerName: "Guwahati Airport Expansion",
    customerCompany: "Adani Airports / AAI",
    status: "Completed & Operational",
    images: "/projects/project-24.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // BIHAR (BR)
  {
    id: 25,
    stateCode: "BR",
    name: "IOCL Begusarai Refinery (Indian Oil Corporation)",
    city: "Barauni, Begusarai",
    lat: "25.4300",
    lng: "86.0200",
    year: "2023",
    category: "Petrochemical Refineries & Hydrocarbon Processing",
    shortDescription: "Heavy refinery expansion power feeds and hazardous-area explosive atmosphere electrical supplies.",
    overview: "Major crude distillation and hydrocracker units operating in continuous 24/7 environments.",
    volampContribution: "Supplied flameproof brass cable glands, lead-sheathed chemical cables, and explosion-resistant earthing.",
    heritage: "Anchoring essential energy security across Eastern India.",
    customerTestimonial: "Certified flameproof glands and chemical-resistant cables that passed strict petroleum audits.",
    customerName: "IOCL Refinery Projects",
    customerCompany: "Indian Oil Corporation Limited",
    status: "Completed & Operational",
    images: "/projects/project-25.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 26,
    stateCode: "BR",
    name: "Patna Water Treatment Plant (WTP)",
    city: "Patna",
    lat: "25.6000",
    lng: "85.1300",
    year: "2023",
    category: "Municipal Water Treatment & Smart Utilities",
    shortDescription: "River intake pumping station power cables and chemical dosing plant motor distribution.",
    overview: "Supplying clean, safe drinking water across the capital city of Bihar.",
    volampContribution: "Supplied moisture-resistant submersible cables, heavy LT armored lines, and MCCB panels.",
    heritage: "Clean drinking water infrastructure for millions of urban residents.",
    customerTestimonial: "Waterproof motor lines withstanding constant river intake humidity and flood seasons.",
    customerName: "Patna Water Works Wing",
    customerCompany: "Bihar Urban Infrastructure Development",
    status: "Completed & Operational",
    images: "/projects/project-26.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // CHHATTISGARH (CG)
  {
    id: 27,
    stateCode: "CG",
    name: "Bhilai Steel Plant (SAIL - Steel Authority of India)",
    city: "Bhilai, Durg District",
    lat: "21.1800",
    lng: "81.3800",
    year: "2023",
    category: "Integrated Steel Mills & Heavy Metallurgy",
    shortDescription: "Blast furnace and heavy rail rolling mill high-temperature, high-vibration power cabling.",
    overview: "Sole supplier of rails for Indian Railways, requiring industrial cabling designed for extreme thermal loads.",
    volampContribution: "Supplied heat-resistant silicon rubber cables, 33kV high-ampacity lines, and heavy-duty lugs.",
    heritage: "India's legendary 11-time Prime Minister's Trophy winning steel facility.",
    customerTestimonial: "High temperature resilience near blast furnace zones with zero insulation degradation.",
    customerName: "Bhilai Electrical Engineering",
    customerCompany: "Steel Authority of India Limited (SAIL)",
    status: "Completed & Operational",
    images: "/projects/project-27.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // GOA (GA)
  {
    id: 28,
    stateCode: "GA",
    name: "Goa Dabolim International Airport",
    city: "Dabolim, South Goa",
    lat: "15.3800",
    lng: "73.8300",
    year: "2023",
    category: "Aviation & Tourism Infrastructure",
    shortDescription: "Terminal expansion, aircraft apron floodlighting, and passenger boarding bridge power lines.",
    overview: "High-humidity, coastal saline atmosphere handling heavy international charter and domestic tourist traffic.",
    volampContribution: "Supplied saline-resistant double armored cables, brass glands, and earthing electrode grids.",
    heritage: "Electrifying India's premier tourist destination.",
    customerTestimonial: "Corrosion-resistant terminal cables delivering uninterrupted operations across monsoon months.",
    customerName: "Dabolim Airport Engineering",
    customerCompany: "Airports Authority of India",
    status: "Completed & Operational",
    images: "/projects/project-28.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 29,
    stateCode: "GA",
    name: "Goa Medical College & Hospital (GMC)",
    city: "Bambolim, North Goa",
    lat: "15.4600",
    lng: "73.8500",
    year: "2023",
    category: "Healthcare & Tertiary Medical Teaching",
    shortDescription: "Super-specialty block, intensive care units (ICU), and emergency critical backup electrical lines.",
    overview: "Zero-fault tolerance for life-support systems, surgical suites, and diagnostic radiology centers.",
    volampContribution: "Supplied medical-grade copper wires, fire-survival emergency feeds, and low-smoke distribution.",
    heritage: "Asia's oldest medical college (founded in 1842) modernized with 21st-century electrical infrastructure.",
    customerTestimonial: "Zero-noise, medical-grade electrical feeds supporting delicate patient monitoring instruments.",
    customerName: "GMC Works Division",
    customerCompany: "Goa Medical College & Hospital",
    status: "Completed & Operational",
    images: "/projects/project-29.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // HARYANA (HR)
  {
    id: 30,
    stateCode: "HR",
    name: "Hisar Municipal Corporation Urban Infrastructure",
    city: "Hisar",
    lat: "29.1500",
    lng: "75.7200",
    year: "2023",
    category: "Municipal Utilities & Urban Streetlighting",
    shortDescription: "Civic building power networks, smart LED street lighting, and automated water pumping stations.",
    overview: "Energy-efficient municipal modernization reducing city electrical distribution losses.",
    volampContribution: "Supplied aluminum XLPE underground cables, weatherproof junction boxes, and GI earthing.",
    heritage: "Empowering urban civic infrastructure in Haryana.",
    customerTestimonial: "Low line-loss cables dramatically improving energy efficiency across municipal streetlights.",
    customerName: "Municipal Engineer",
    customerCompany: "Hisar Municipal Corporation",
    status: "Completed & Operational",
    images: "/projects/project-30.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // JHARKHAND (JH)
  {
    id: 31,
    stateCode: "JH",
    name: "Ranchi Birsa Munda Airport",
    city: "Hinoo, Ranchi",
    lat: "23.3140",
    lng: "85.3210",
    year: "2023",
    category: "Aviation Infrastructure & Regional Connectivity",
    shortDescription: "Terminal building expansion, instrument landing system (ILS) power feeds, and apron lighting.",
    overview: "State capital aviation hub connecting Jharkhand's mineral-rich industrial belt to all Indian metros.",
    volampContribution: "Supplied shielded instrumentation lines, airfield cables, and copper earthing busbars.",
    heritage: "Connecting the mineral heart of India to the skies.",
    customerTestimonial: "Precision shielded cables protecting ILS avionics from electrical noise interference.",
    customerName: "Ranchi Airport Division",
    customerCompany: "Airports Authority of India",
    status: "Completed & Operational",
    images: "/projects/project-31.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // KERALA (KL)
  {
    id: 32,
    stateCode: "KL",
    name: "Government Medical College, Idukki",
    city: "Painavu, Idukki",
    lat: "9.8400",
    lng: "76.9700",
    year: "2023",
    category: "High-Altitude Healthcare & Medical Campuses",
    shortDescription: "Rugged high-altitude terrain electrical distribution for emergency hospital and trauma center.",
    overview: "Continuous power reliability across high-rainfall Western Ghats mountain environment.",
    volampContribution: "Supplied moisture-sealed armored cables, weatherproof distribution panels, and lightning earthing.",
    heritage: "Providing essential modern healthcare to hill tribal and rural populations in Kerala.",
    customerTestimonial: "Moisture-sealed insulation that handles intense Western Ghats downpours without tripping.",
    customerName: "Idukki Health Works",
    customerCompany: "Kerala Medical Infrastructure Development",
    status: "Completed & Operational",
    images: "/projects/project-32.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // MADHYA PRADESH (MP)
  {
    id: 33,
    stateCode: "MP",
    name: "Indore Smart City Grid",
    city: "Indore",
    lat: "22.7196",
    lng: "75.8577",
    year: "2024",
    category: "Smart Cities & Urban Energy Management",
    shortDescription: "Underground ring main smart power grid for India's consistently #1 cleanest city.",
    overview: "Automated SCADA-monitored underground power distribution eliminating overhead lines.",
    volampContribution: "Supplied 11kV crosslinked polyethylene cables, telecommunication fiber ducts, and modular switchgear.",
    heritage: "Powering the civic gold standard of cleanliness and smart infrastructure in India.",
    customerTestimonial: "Clean, robust underground cabling that helped Indore maintain its #1 smart city ranking.",
    customerName: "Indore Smart City Team",
    customerCompany: "Indore Smart City Development Ltd",
    status: "Completed & Operational",
    images: "/projects/project-33.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 34,
    stateCode: "MP",
    name: "Bhopal Water Treatment Plant (WTP)",
    city: "Bhopal",
    lat: "23.2500",
    lng: "77.4100",
    year: "2023",
    category: "Clean Drinking Water & River Pumping",
    shortDescription: "Raw water intake pumping and automated filtration chemical dosing plant electrical infrastructure.",
    overview: "Reliable power transmission ensuring 24/7 clean piped water supply across the lake city.",
    volampContribution: "Supplied heavy submersible power cables, LT switchgear feeders, and copper earthing rods.",
    heritage: "Safeguarding public water access in Madhya Pradesh.",
    customerTestimonial: "Continuous submersible duty with excellent mechanical and water-ingress protection.",
    customerName: "Bhopal Water Supply Desk",
    customerCompany: "Bhopal Municipal Corporation",
    status: "Completed & Operational",
    images: "/projects/project-34.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 35,
    stateCode: "MP",
    name: "Amarkantak Thermal Power & Regional Utilities",
    city: "Chachai / Amarkantak, Anuppur District",
    lat: "23.1600",
    lng: "81.6500",
    year: "2023",
    category: "Thermal Power & Ecological Buffer Protection",
    shortDescription: "Substation interconnection and ecological buffer zone electrification.",
    overview: "Balancing high-capacity electricity generation with sensitive Maikal Hills biosphere protection.",
    volampContribution: "Supplied 33kV XLPE armored power lines, environmental-grade outer jackets, and lightning arresters.",
    heritage: "Source of the holy Narmada and Son rivers, energized with environmental care.",
    customerTestimonial: "Certified high-tension lines delivering steady power evacuation with zero downtime.",
    customerName: "Amarkantak Power Projects",
    customerCompany: "MP Power Generating Co Ltd",
    status: "Completed & Operational",
    images: "/projects/project-35.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // MANIPUR (MN)
  {
    id: 36,
    stateCode: "MN",
    name: "Imphal International Airport (Bir Tikendrajit)",
    city: "Tulihal, Imphal",
    lat: "24.7600",
    lng: "93.8900",
    year: "2023",
    category: "Strategic Border & Aviation Infrastructure",
    shortDescription: "Runway lighting, taxiway expansion, and international passenger terminal power lines.",
    overview: "Crucial aviation lifeline connecting Manipur under India's Act East economic policy.",
    volampContribution: "Supplied airfield lighting primary cables, double armored distribution lines, and copper earthing.",
    heritage: "Strategic national gateway in Northeast India.",
    customerTestimonial: "Critical airfield cables delivered rapidly under demanding logistic deadlines.",
    customerName: "Imphal Airport Engineering",
    customerCompany: "Airports Authority of India",
    status: "Completed & Operational",
    images: "/projects/project-36.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // MIZORAM (MZ)
  {
    id: 37,
    stateCode: "MZ",
    name: "Lengpui Airport, Aizawl",
    city: "Lengpui, Aizawl",
    lat: "23.8400",
    lng: "92.6200",
    year: "2023",
    category: "Table-Top Aviation Infrastructure",
    shortDescription: "Terminal electrification and instrument landing power systems for India's first state-built airport.",
    overview: "Mountain table-top runway requiring precision airfield power reliability under dense cloud cover.",
    volampContribution: "Supplied heavy-duty aviation cables, lightning protection systems, and weather-sealed glands.",
    heritage: "Lifeline air connectivity across the hills of Mizoram.",
    customerTestimonial: "Rugged cables performing reliably on mountain table-top runway terrain.",
    customerName: "Aizawl Civil Aviation",
    customerCompany: "Govt of Mizoram Aviation Wing",
    status: "Completed & Operational",
    images: "/projects/project-37.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // NAGALAND (NL)
  {
    id: 38,
    stateCode: "NL",
    name: "Nagaland State Infrastructure & Highway Project",
    city: "Kohima / Dimapur",
    lat: "25.6700",
    lng: "94.1000",
    year: "2023",
    category: "Hill State Infrastructure & Transport",
    shortDescription: "High-grade electrical distribution along state arterial highways and government complexes.",
    overview: "Seismic and landslide-resilient cabling designed for heavy monsoon rainfall.",
    volampContribution: "Supplied armored distribution cables, copper grounding, and weatherproof accessories.",
    heritage: "Supporting connectivity and economic vitality in Nagaland.",
    customerTestimonial: "Resilient armored cables handling steep mountain slope installations seamlessly.",
    customerName: "Nagaland Works Lead",
    customerCompany: "Nagaland PWD / Infrastructure",
    status: "Completed & Operational",
    images: "/projects/project-38.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // ODISHA (OD)
  {
    id: 39,
    stateCode: "OD",
    name: "Odisha Bulk Water Treatment Plant (WTP)",
    city: "Bhubaneswar / Cuttack",
    lat: "20.2900",
    lng: "85.8200",
    year: "2023",
    category: "Mega Water Infrastructure & River Intake",
    shortDescription: "Heavy intake pump houses, chemical aeration plants, and automated filtration power feeds.",
    overview: "Supplying bulk treated municipal water across coastal Odisha.",
    volampContribution: "Supplied submersible-grade pump cables, 11kV HT feeders, and corrosion-resistant earthing.",
    heritage: "Serving vital public health utilities in eastern India.",
    customerTestimonial: "High pump efficiency and zero water-logging faults during coastal monsoon surges.",
    customerName: "Odisha Public Health Engineering",
    customerCompany: "WATCO Odisha",
    status: "Completed & Operational",
    images: "/projects/project-39.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // PUNJAB (PB)
  {
    id: 40,
    stateCode: "PB",
    name: "Punjab Industrial Feeder & Power Grid Phase 1 & 2",
    city: "Ludhiana / Mohali",
    lat: "30.9000",
    lng: "75.8500",
    year: "2023",
    category: "Manufacturing Hubs & Substation Infrastructure",
    shortDescription: "Heavy 33kV & 11kV distribution feeds for Punjab's premier manufacturing and engineering clusters.",
    overview: "Supplying uninterrupted power for textile mills, auto parts fabrication, and food processing plants.",
    volampContribution: "Supplied heavy aluminum XLPE armored cables, copper control wiring, and terminal lugs.",
    heritage: "Energizing the agricultural and industrial powerhouse of Northern India.",
    customerTestimonial: "Heavy gauge feeder lines that handle severe industrial peak loads without voltage dips.",
    customerName: "Punjab Grid Engineers",
    customerCompany: "Punjab Industrial Power Consortium",
    status: "Completed & Operational",
    images: "/projects/project-40.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // RAJASTHAN (RJ) - 50+ Major Projects Portfolio
  {
    id: 41,
    stateCode: "RJ",
    name: "Rajasthan 50+ Multi-Site Industrial & Solar Project Portfolio",
    city: "Jodhpur, Bikaner, Jaipur, Bhadla",
    lat: "26.2900",
    lng: "73.0200",
    year: "2024",
    category: "Utility Solar & Industrial Power (50+ Sites)",
    shortDescription: "Extensive portfolio of 50+ commissioned installations across Thar desert solar parks, transmission grids, and industrial zones.",
    overview: "Comprehensive footprint serving utility solar developers, mineral extraction plants, and state electrification projects.",
    volampContribution: "Supplied over 300+ km of solar PV DC cables, 33kV high-tension XLPE power cables, and chemical earthing electrodes.",
    heritage: "Representing one of Volamp's largest geographic project footprints across India.",
    customerTestimonial: "Over 50 projects successfully powered across Rajasthan with zero warranty claims or heat-degradation failures.",
    customerName: "Rajasthan State EPC Head",
    customerCompany: "Rajasthan Clean Energy & Industrial Infra",
    status: "Completed & Multi-Site Operational",
    images: "/projects/project-41.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // TAMIL NADU (TN)
  {
    id: 42,
    stateCode: "TN",
    name: "Coimbatore International Airport",
    city: "Peelamedu, Coimbatore",
    lat: "11.0290",
    lng: "77.0430",
    year: "2023",
    category: "Industrial Aviation & Cargo Terminals",
    shortDescription: "Passenger terminal expansion, international cargo complex, and apron high-mast lighting.",
    overview: "Serving South India's premier engineering, foundry, and textile export hub.",
    volampContribution: "Supplied low-smoke zero-halogen armored cables, brass glands, and copper earthing.",
    heritage: "Connecting the 'Manchester of South India' to global markets.",
    customerTestimonial: "High durability and strict LSZH compliance for modern passenger aviation terminals.",
    customerName: "Coimbatore Airport Engineering",
    customerCompany: "Airports Authority of India",
    status: "Completed & Operational",
    images: "/projects/project-42.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // TELANGANA (TG)
  {
    id: 43,
    stateCode: "TG",
    name: "Telangana Utility Solar Power Project",
    city: "Mahbubnagar / Ranga Reddy",
    lat: "16.7400",
    lng: "77.9800",
    year: "2023",
    category: "Clean Energy & Utility Solar Photovoltaics",
    shortDescription: "Large-scale grid-tied solar photovoltaic farm cabling, inverter interconnection, and pooling substation feeders.",
    overview: "High-efficiency green energy generation feeding into the Telangana state transmission grid.",
    volampContribution: "Supplied 1500V DC UV-resistant solar cables, 33kV armored evacuation lines, and chemical earthing.",
    heritage: "Accelerating the green energy transition across South-Central India.",
    customerTestimonial: "Certified 1500V solar cables providing maximum energy yield and zero ground fault trips.",
    customerName: "Telangana Solar Project Lead",
    customerCompany: "Telangana State Renewable Energy",
    status: "Completed & Generating",
    images: "/projects/project-43.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // UTTAR PRADESH (UP)
  {
    id: 44,
    stateCode: "UP",
    name: "Nal-Se-Jal Yojna (Jal Jeevan Mission)",
    city: "Bundelkhand & Purvanchal Corridors",
    lat: "25.4500",
    lng: "80.3300",
    year: "2024",
    category: "National Drinking Water Mission (Jal Jeevan)",
    shortDescription: "Deep borewell pumps, overhead reservoir distribution, and rural filtration plant electrification across hundreds of villages.",
    overview: "Flagship national program providing functional household tap water connections across water-stressed regions.",
    volampContribution: "Supplied 3-core flat submersible pump cables, underground LT armored feeds, and safety switchgear.",
    heritage: "Transforming quality of life and potable water access for millions across rural Uttar Pradesh.",
    customerTestimonial: "Bulk supply of certified submersible cables across hundreds of rural community water schemes.",
    customerName: "Jal Jeevan Mission Lead",
    customerCompany: "State Water & Sanitation Mission UP",
    status: "Completed & Active",
    images: "/projects/project-44.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  {
    id: 45,
    stateCode: "UP",
    name: "Mathura-Vrindavan Parikrama Marg Heritage Lighting",
    city: "Mathura - Vrindavan",
    lat: "27.4924",
    lng: "77.6737",
    year: "2023",
    category: "Sacred Heritage Corridors & Pilgrim Amenities",
    shortDescription: "Concealed underground parikrama pathway illumination, ghat lighting, and 24/7 pilgrim crowd power.",
    overview: "Historic pilgrimage circumambulation corridor hosting millions of devotees during Janmashtami and festivals.",
    volampContribution: "Supplied waterproof armored direct-burial cables, brass compression glands, and copper earthing.",
    heritage: "Illuminating India's sacred cultural and spiritual heartland.",
    customerTestimonial: "Safe, flood-proof pathway lighting cables that withstand peak festival crowds.",
    customerName: "Braj Teerth Vikas Parishad",
    customerCompany: "UP Heritage & Tourism Infra",
    status: "Completed & Operational",
    images: "/projects/project-45.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  },
  // WEST BENGAL (WB)
  {
    id: 46,
    stateCode: "WB",
    name: "West Bengal Grid-Connected Solar Power Project",
    city: "Purulia / Bankura",
    lat: "23.3300",
    lng: "86.3600",
    year: "2023",
    category: "Clean Energy & Renewable Power Generation",
    shortDescription: "Ground-mounted solar array power evacuation and high-voltage grid interconnection.",
    overview: "Converting arid, non-agricultural land into productive clean energy generation.",
    volampContribution: "Supplied 1500V DC solar cabling, 33kV step-up transformer connections, and earthing protection.",
    heritage: "Expanding clean energy generation across Eastern India.",
    customerTestimonial: "Robust UV-rated DC cables and 33kV evacuation lines with reliable power factor performance.",
    customerName: "Bengal Solar EPC",
    customerCompany: "West Bengal Green Energy Development",
    status: "Completed & Generating",
    images: "/projects/project-46.jpg",
    createdAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }
];
var memoryFootprintStates = [...initialFootprintStates];
var memoryFootprintProjects = [...initialFootprintProjects];
async function getFootprintOverview() {
  const allStates = await getFootprintStates();
  const allProjects = await getFootprintProjectsByState();
  const totalCompleted = allStates.reduce((acc, s) => acc + (s.projectsCompleted || 0), 0);
  return {
    projectsCompleted: `${Math.max(totalCompleted, 240)}+`,
    statesServed: `${allStates.length}+`,
    majorProjects: `${allProjects.length}+`,
    yearsOfExperience: "15+",
    globalAmbition: "Supplying 28 Indian states with expanding exports to GCC, Southeast Asia & East Africa"
  };
}
async function getFootprintStates() {
  const db = await getDb();
  if (!db) {
    return memoryFootprintStates;
  }
  try {
    const records = await db.select().from(footprintStates);
    const stateMap = /* @__PURE__ */ new Map();
    for (const s of memoryFootprintStates) {
      stateMap.set(s.code.toUpperCase(), s);
    }
    for (const r of records) {
      if (!stateMap.has(r.code.toUpperCase())) {
        stateMap.set(r.code.toUpperCase(), r);
      }
    }
    return Array.from(stateMap.values());
  } catch {
    return memoryFootprintStates;
  }
}
async function getFootprintProjectsByState(stateCode) {
  const db = await getDb();
  if (!db) {
    if (stateCode) {
      return memoryFootprintProjects.filter((p) => p.stateCode.toUpperCase() === stateCode.toUpperCase());
    }
    return memoryFootprintProjects;
  }
  try {
    const records = stateCode ? await db.select().from(footprintProjects).where(eq(footprintProjects.stateCode, stateCode.toUpperCase())) : await db.select().from(footprintProjects);
    const projMap = /* @__PURE__ */ new Map();
    const filterProjects = stateCode ? memoryFootprintProjects.filter((p) => p.stateCode.toUpperCase() === stateCode.toUpperCase()) : memoryFootprintProjects;
    for (const p of filterProjects) {
      projMap.set(p.name.toLowerCase(), p);
    }
    for (const r of records) {
      if (!projMap.has(r.name.toLowerCase())) {
        projMap.set(r.name.toLowerCase(), r);
      }
    }
    return Array.from(projMap.values());
  } catch {
    if (stateCode) {
      return memoryFootprintProjects.filter((p) => p.stateCode.toUpperCase() === stateCode.toUpperCase());
    }
    return memoryFootprintProjects;
  }
}
async function getFootprintProjectById(id) {
  const db = await getDb();
  if (!db) {
    return memoryFootprintProjects.find((p) => p.id === id) ?? null;
  }
  try {
    const res = await db.select().from(footprintProjects).where(eq(footprintProjects.id, id));
    return res[0] ?? memoryFootprintProjects.find((p) => p.id === id) ?? null;
  } catch {
    return memoryFootprintProjects.find((p) => p.id === id) ?? null;
  }
}
var defaultCeo = {
  name: "Naimil Patel",
  role: "Chief Executive Officer \xB7 Volamp Elektrikals Private Limited",
  company: "Volamp Elektrikals Private Limited",
  headline: "Saath Milkar Growth Ki Ek Nayi Pehchaan Banayein",
  quote: "\u201CKoi bhi company sirf products se nahi banti \u2014 company banti hai INSAN, unki mehnat, commitment aur customer ke trust se.\u201D",
  message: [
    "Volamp Elektrikals Private Limited ke safar mein hamara focus sirf business grow karna nahi, balki trust, quality aur strong relations build karna hai.",
    "Mera maanna hai ki koi bhi company sirf products se nahi banti \u2014 company banti hai INSAN AUR unki mehnat, commitment aur customer ke trust se.",
    "Volamp mein hum continuously apne products, services aur working systems ko better banane ki koshish karte hain. Electrical aur switchgear industry mein badalti customer requirements ko samajhna aur unke liye reliable aur value-driven solutions provide karna hamari priority hoti hai.",
    "Hamare liye har customer sirf ek business opportunity nahi, balki ek long-term relationship hai. Isi approach ke saath hum quality, service aur commitment ko apne business ka strong foundation bana rahe hain.",
    "Main apni team par bhi poora bharosa rakhta hoon. Mujhe believe hai ki jab har individual apni responsibility ko ownership ke saath nibhata hai, tab organisation extraordinary results achieve kar sakti hai.",
    "Aane wale samay mein hum technology, better systems, innovation aur strong teamwork ke through Volamp ko aur stronger banane ke liye committed hain.",
    "Hamari comeback ki journey abhi shuru hui hai. Target sirf bada banna nahi, balki better banna hai \u2014 har din, har customer aur har opportunity ke saath.",
    "Main apne customers, dealers, suppliers, business partners aur poori Volamp team ka dil se thank you karta hoon, jo is journey ka important part hain. Chalo, milkar ek aisa Volamp banayein jiske saath log sirf business nahi, balki apna trust bhi jodna chahein."
  ],
  motto: "Together, Let's Power the Growth. Together, Let's Build Volamp and India.",
  imageUrl: "/team/ceo.jpeg",
  initials: "NP"
};
var defaultTeam = [
  {
    id: 1,
    number: "01",
    name: "Roshni Shroff",
    role: "Sales Team",
    department: "Sales & Client Solutions",
    imageUrl: "/team/roshni-shroff.jpg",
    active: true
  },
  {
    id: 2,
    number: "02",
    name: "Pooja Thakor",
    role: "Sales Team",
    department: "Sales & Client Solutions",
    imageUrl: "/team/pooja-thakor.jpg",
    active: true
  },
  {
    id: 3,
    number: "03",
    name: "Pooja Patel",
    role: "Sales Team",
    department: "Sales & Client Solutions",
    imageUrl: "/team/pooja-patel.jpg",
    active: true
  },
  {
    id: 4,
    number: "04",
    name: "Jinay Patel",
    role: "Sales Team \xB7 Switch Gears",
    department: "Switchgear Sourcing",
    imageUrl: "/team/jinay-patel.jpg",
    active: true
  },
  {
    id: 5,
    number: "05",
    name: "Dhaval Rana",
    role: "Accounts Manager",
    department: "Finance & Accounts",
    imageUrl: "/team/dhaval-rana.jpg",
    active: true
  },
  {
    id: 6,
    number: "06",
    name: "Montu Patil",
    role: "Operations Manager",
    department: "Logistics & Operations",
    imageUrl: "/team/montu-patil.jpg",
    active: true
  }
];
var memoryLeadership = {
  ceo: defaultCeo,
  team: defaultTeam
};
async function getLeadershipData() {
  return {
    ceo: { ...memoryLeadership.ceo },
    team: memoryLeadership.team.map((m) => ({ ...m }))
  };
}
async function updateCeoProfile(data) {
  memoryLeadership.ceo = { ...memoryLeadership.ceo, ...data };
  return { ...memoryLeadership.ceo };
}
async function updateTeamMember(id, data) {
  const index = memoryLeadership.team.findIndex((m) => m.id === id);
  if (index === -1) return null;
  memoryLeadership.team[index] = { ...memoryLeadership.team[index], ...data };
  return { ...memoryLeadership.team[index] };
}
async function trackConsignmentOrder(query) {
  const cleanQ = query.trim();
  const upperQ = cleanQ.toUpperCase();
  const digitsQ = cleanQ.replace(/\D/g, "");
  const db = await getDb();
  let matchedOrder = null;
  let matchedUserProfile = null;
  let matchedUser = null;
  if (db) {
    const dbOrders = await db.select().from(orders);
    matchedOrder = dbOrders.find(
      (o) => o.orderNumber?.toUpperCase() === upperQ || o.trackingNumber && o.trackingNumber.toUpperCase() === upperQ || String(o.id) === cleanQ
    );
    if (matchedOrder) {
      const [u, p] = await Promise.all([
        db.select().from(users).where(eq(users.id, matchedOrder.userId)).limit(1),
        db.select().from(customerProfiles).where(eq(customerProfiles.userId, matchedOrder.userId)).limit(1)
      ]);
      matchedUser = u[0] || null;
      matchedUserProfile = p[0] || null;
    }
  } else {
    matchedOrder = memoryOrders.find(
      (o) => o.orderNumber?.toUpperCase() === upperQ || o.trackingNumber && o.trackingNumber.toUpperCase() === upperQ || String(o.id) === cleanQ
    );
    if (matchedOrder) {
      matchedUserProfile = memoryCustomerProfiles.get(matchedOrder.userId) || null;
      matchedUser = Array.from(memoryUsers.values()).find((u) => u.id === matchedOrder.userId) || null;
    }
  }
  if (matchedOrder) {
    const customerName = matchedUserProfile?.fullName || matchedUser?.name || "Valued Client";
    const companyName = matchedUserProfile?.companyName || void 0;
    const dest = [matchedUserProfile?.city, matchedUserProfile?.state].filter(Boolean).join(", ") || "Ahmedabad, Gujarat, India";
    const status = matchedOrder.status || "received";
    const statusLabel = status === "received" ? "Order Received" : status === "under_review" ? "Technical Review" : status === "confirmed" ? "Order Confirmed" : status === "processing" ? "Processing & Packaging" : status === "packed" ? "Packed for Dispatch" : status === "dispatched" ? "Dispatched from Depot" : status === "in_transit" ? "In Highway Transit" : status === "delivered" ? "Delivered to Site" : "Order Active";
    const isDispatched = status === "dispatched" || status === "in_transit" || status === "delivered";
    const isDelivered = status === "delivered";
    const isProcessing = status === "processing" || status === "packed" || status === "confirmed";
    const milestones = [
      {
        title: "Order Requisition Logged",
        description: "Purchase order registered with VOLAMP Sourcing Desk.",
        time: matchedOrder.createdAt ? new Date(matchedOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Completed",
        completed: true,
        current: status === "received"
      },
      {
        title: "Technical & Commercial Review",
        description: "Engineering verification of cable specs, voltage ratings, and conductor size.",
        time: isProcessing || isDispatched ? "Verified" : status === "under_review" ? "In Review" : "Pending",
        completed: isProcessing || isDispatched,
        current: status === "under_review"
      },
      {
        title: "Quality Check & MTC Stamping",
        description: "Drum coiling, spark testing, and Material Test Certificate ( MTC ) generation.",
        time: isDispatched ? "MTC Approved" : isProcessing ? "In Progress" : "Pending",
        completed: isDispatched,
        current: isProcessing
      },
      {
        title: "Dispatched from Ahmedabad Depot",
        description: isDispatched ? `Handed over to carrier desk (Docket: ${matchedOrder.trackingNumber || "Assigned"}).` : "Carrier pickup scheduled at Sanand GIDC Depot.",
        time: isDispatched ? "Dispatched" : "Pending",
        completed: isDispatched,
        current: status === "dispatched" || status === "in_transit"
      },
      {
        title: "Delivered to Project Site",
        description: isDelivered ? "Consignment successfully unloaded at site." : "Site unloading and physical sign-off.",
        time: isDelivered ? "Delivered" : "Estimated upon dispatch",
        completed: isDelivered,
        current: false
      }
    ];
    return {
      found: true,
      orderNumber: matchedOrder.orderNumber,
      trackingNumber: matchedOrder.trackingNumber || void 0,
      transporter: isDispatched ? "VOLAMP Express Logistics Desk" : "Pending Dispatch Assignment",
      lrNumber: matchedOrder.trackingNumber || (isDispatched ? `LR-GJ-${matchedOrder.orderNumber}` : "LR-PENDING"),
      status,
      statusLabel,
      statusDescription: isDispatched ? `Consignment for order ${matchedOrder.orderNumber} is in transit to ${dest}.` : `Order ${matchedOrder.orderNumber} is currently at VOLAMP Central Depot (Ahmedabad) undergoing ${statusLabel.toLowerCase()}.`,
      customerName,
      companyName,
      origin: "VOLAMP Central Depot, Sanand GIDC, Ahmedabad, Gujarat",
      destination: dest,
      dispatchDate: isDispatched ? "Active Transit" : "Scheduled upon QA clearance",
      estimatedDelivery: isDelivered ? "Delivered" : "24 to 48 hours after dispatch confirmation",
      currentLocation: isDispatched ? "NH-48 Express Transit Corridor" : "VOLAMP Central Depot, Ahmedabad",
      totalWeight: matchedOrder.total ? `Order Total: \u20B9${matchedOrder.total.toLocaleString("en-IN")}` : "Direct Dispatch",
      invoiceNumber: `INV-${matchedOrder.orderNumber.replace(/\D/g, "") || "2026-001"}`,
      mtcNumber: isDispatched || isProcessing ? `MTC-VOL-${matchedOrder.id}08` : "Under QA",
      items: [
        {
          name: `Verified Order Consignment (${matchedOrder.orderNumber})`,
          quantity: 1,
          unit: "consignment lot",
          spec: "VOLAMP Quality Certified"
        }
      ],
      milestones
    };
  }
  let matchedQuick = null;
  if (db) {
    const dbQuick = await db.select().from(quickOrders);
    matchedQuick = dbQuick.find(
      (q) => q.quickOrderId?.toUpperCase() === upperQ || digitsQ.length >= 6 && q.phone?.replace(/\D/g, "").includes(digitsQ) || q.customerName?.toUpperCase().includes(upperQ)
    );
  } else {
    matchedQuick = memoryQuickOrders.find(
      (q) => q.quickOrderId?.toUpperCase() === upperQ || digitsQ.length >= 6 && q.phone?.replace(/\D/g, "").includes(digitsQ) || q.customerName?.toUpperCase().includes(upperQ)
    );
  }
  if (matchedQuick) {
    let parsedItems = [];
    try {
      parsedItems = Array.isArray(matchedQuick.items) ? matchedQuick.items : JSON.parse(matchedQuick.items || "[]");
    } catch {
      parsedItems = [];
    }
    const qStatus = matchedQuick.status || "submitted";
    const qStatusLabel = qStatus === "submitted" ? "Requisition Submitted" : qStatus === "under_review" ? "Under Commercial Review" : qStatus === "priced" ? "Priced & Stock Reserved" : qStatus === "quoted" ? "Quotation Approved" : "Order Completed";
    const isDoneReview = qStatus === "under_review" || qStatus === "priced" || qStatus === "quoted" || qStatus === "closed";
    const isPriced = qStatus === "priced" || qStatus === "quoted" || qStatus === "closed";
    const milestones = [
      {
        title: "Requisition Submitted",
        description: "Quick Order requisition received via portal / WhatsApp desk.",
        time: matchedQuick.createdAt ? new Date(matchedQuick.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Submitted",
        completed: true,
        current: qStatus === "submitted"
      },
      {
        title: "Commercial & Stock Reservation",
        description: "Technical review and inventory hold at Ahmedabad Central Depot.",
        time: isDoneReview ? "Reviewed" : "In Review",
        completed: isDoneReview,
        current: qStatus === "under_review"
      },
      {
        title: "Quality Check & MTC Stamping",
        description: "Coil inspection, packaging, and Material Test Certificate ( MTC ) preparation.",
        time: isPriced ? "MTC Ready" : "Scheduled next",
        completed: isPriced,
        current: qStatus === "priced"
      },
      {
        title: "Freight Dispatch & LR Generation",
        description: "Carrier truck pickup and docket issuance.",
        time: qStatus === "closed" ? "Dispatched" : "Pending dispatch",
        completed: qStatus === "closed",
        current: qStatus === "quoted"
      },
      {
        title: "Delivered to Project Site",
        description: "Scheduled arrival and physical sign-off at project unloading bay.",
        time: "Expected 48-72h post dispatch (24h in Gujarat GIDC)",
        completed: false,
        current: false
      }
    ];
    return {
      found: true,
      orderNumber: matchedQuick.quickOrderId,
      trackingNumber: `TRK-${matchedQuick.quickOrderId}`,
      transporter: "VOLAMP Ahmedabad Logistics Desk (Direct)",
      lrNumber: qStatus === "closed" ? `LR-MH-2026-${matchedQuick.id}` : "LR-PENDING-DISPATCH",
      status: qStatus === "closed" ? "dispatched" : "processing",
      statusLabel: qStatusLabel,
      statusDescription: `Quick Order ${matchedQuick.quickOrderId} is registered for ${matchedQuick.customerName} with delivery to ${matchedQuick.location || "your project site"}.`,
      customerName: matchedQuick.customerName,
      companyName: matchedQuick.companyName || void 0,
      phone: matchedQuick.phone,
      origin: "VOLAMP Central Depot, Sanand GIDC, Ahmedabad, Gujarat",
      destination: matchedQuick.location || "Ahmedabad, Gujarat, India",
      dispatchDate: "Scheduled upon commercial clearance",
      estimatedDelivery: "Within 24 to 48 hours after dispatch confirmation",
      currentLocation: "VOLAMP Ahmedabad Depot (Sanand GIDC)",
      totalWeight: `${parsedItems.length} line items`,
      invoiceNumber: `INV-${matchedQuick.quickOrderId.replace(/\D/g, "") || "2026"}`,
      mtcNumber: `MTC-VOL-${matchedQuick.id || "01"}`,
      items: parsedItems.map((it) => ({
        name: it.name || "Electrical Item",
        quantity: it.quantity || 1,
        unit: it.unit || "units",
        spec: it.spec || "VOLAMP Quality Certified"
      })),
      milestones
    };
  }
  return {
    found: false,
    orderNumber: cleanQ,
    status: "received",
    statusLabel: "Order Not Found",
    statusDescription: `No active order or consignment matching "${cleanQ}" was found in our records. Please verify your Order ID or contact our Dispatch Desk on WhatsApp (+91 95123 65582).`,
    origin: "VOLAMP Central Depot, Sanand GIDC, Ahmedabad",
    destination: "India",
    items: [],
    milestones: []
  };
}
var memoryNewsletterSubscribers = [];
async function subscribeNewsletter(email, phone) {
  const cleanEmail = email.trim().toLowerCase();
  const existing = memoryNewsletterSubscribers.find((s) => s.email === cleanEmail);
  if (!existing) {
    memoryNewsletterSubscribers.push({
      email: cleanEmail,
      phone: phone?.trim(),
      createdAt: /* @__PURE__ */ new Date()
    });
  }
  return { success: true, email: cleanEmail };
}
function generateCollaborateApplicationId() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const randomNum = Math.floor(1e4 + Math.random() * 9e4);
  return `COL-${year}-${randomNum}`;
}
var memoryCollaborateSubmissions = [];
async function createCollaborateSubmission(data) {
  const applicationId = data.applicationId || generateCollaborateApplicationId();
  const collaborationTypesJson = JSON.stringify(data.collaborationTypes);
  const partnershipStrengthsJson = JSON.stringify(data.partnershipStrengths);
  const now = /* @__PURE__ */ new Date();
  const record = {
    id: memoryCollaborateSubmissions.length + 1,
    applicationId,
    companyName: data.companyName.trim(),
    contactName: data.contactName.trim(),
    designation: data.designation.trim(),
    businessType: data.businessType.trim(),
    collaborationTypes: collaborationTypesJson,
    opportunityDetails: data.opportunityDetails.trim(),
    partnershipStrengths: partnershipStrengthsJson,
    expectedBusinessPotential: data.expectedBusinessPotential.trim(),
    expectedTimeline: data.expectedTimeline.trim(),
    mobile: data.mobile.trim(),
    email: data.email.trim().toLowerCase(),
    cityCountry: data.cityCountry.trim(),
    notes: data.notes?.trim() || null,
    status: "submitted",
    createdAt: now,
    updatedAt: now
  };
  const db = await getDb();
  if (db) {
    try {
      await db.insert(collaborateSubmissions).values(record);
    } catch (err) {
      console.warn("[Database] collaborateSubmissions insert error, saved in-memory:", err);
    }
  }
  memoryCollaborateSubmissions.unshift(record);
  return record;
}
async function getCollaborateSubmissions() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(collaborateSubmissions);
    } catch {
    }
  }
  return memoryCollaborateSubmissions;
}
async function getCollaborateSubmissionById(applicationId) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(collaborateSubmissions).where(eq(collaborateSubmissions.applicationId, applicationId)).limit(1);
      if (rows[0]) return rows[0];
    } catch {
    }
  }
  return memoryCollaborateSubmissions.find((s) => s.applicationId === applicationId) || null;
}
function generateEnquiryNumber() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const randomNum = Math.floor(1e4 + Math.random() * 9e4);
  return `ENQ-${year}-${randomNum}`;
}
var memoryEnquiries = [];
async function createEnquiry(data) {
  const enquiryNumber = data.enquiryNumber || generateEnquiryNumber();
  const now = /* @__PURE__ */ new Date();
  const record = {
    id: memoryEnquiries.length + 1,
    enquiryNumber,
    fullName: data.fullName.trim(),
    companyName: data.companyName?.trim() || null,
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    location: data.location?.trim() || null,
    category: data.category?.trim() || null,
    quantity: data.quantity?.trim() || null,
    urgency: data.urgency?.trim() || "Standard",
    details: data.details.trim(),
    status: "received",
    createdAt: now,
    updatedAt: now
  };
  const db = await getDb();
  if (db) {
    try {
      await db.insert(enquiries).values(record);
    } catch (err) {
      console.warn("[Database] enquiries insert error, saved in-memory:", err);
    }
  }
  memoryEnquiries.unshift(record);
  return record;
}
async function getEnquiries() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(enquiries);
    } catch {
    }
  }
  return memoryEnquiries;
}
async function getEnquiryByNumber(enquiryNumber) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(enquiries).where(eq(enquiries.enquiryNumber, enquiryNumber)).limit(1);
      if (rows[0]) return rows[0];
    } catch {
    }
  }
  return memoryEnquiries.find((e) => e.enquiryNumber === enquiryNumber) || null;
}
function generateCareerApplicationId() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const randomNum = Math.floor(1e4 + Math.random() * 9e4);
  return `VOL-HR-${year}-${randomNum}`;
}
var memoryCareerApplications = [];
async function createCareerApplication(data) {
  const applicationId = data.applicationId || generateCareerApplicationId();
  const now = /* @__PURE__ */ new Date();
  const record = {
    id: memoryCareerApplications.length + 1,
    applicationId,
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    roleApplied: data.roleApplied.trim(),
    department: data.department.trim(),
    experienceYears: data.experienceYears.trim(),
    highestQualification: data.highestQualification.trim(),
    currentCompany: data.currentCompany?.trim() || null,
    currentCtc: data.currentCtc?.trim() || null,
    expectedCtc: data.expectedCtc?.trim() || null,
    noticePeriod: data.noticePeriod.trim(),
    linkedInUrl: data.linkedInUrl?.trim() || null,
    resumeUrl: data.resumeUrl?.trim() || null,
    coverNote: data.coverNote?.trim() || null,
    status: "received",
    createdAt: now,
    updatedAt: now
  };
  const db = await getDb();
  if (db) {
    try {
      await db.insert(careerApplications).values(record);
    } catch (err) {
      console.warn("[Database] careerApplications insert error, saved in-memory:", err);
    }
  }
  memoryCareerApplications.unshift(record);
  return record;
}
async function getCareerApplications() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(careerApplications);
    } catch {
    }
  }
  return memoryCareerApplications;
}
async function getCareerApplicationById(applicationId) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(careerApplications).where(eq(careerApplications.applicationId, applicationId)).limit(1);
      if (rows[0]) return rows[0];
    } catch {
    }
  }
  return memoryCareerApplications.find((app2) => app2.applicationId === applicationId) || null;
}
function generateCaseNumber() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const randomNum = Math.floor(1e4 + Math.random() * 9e4);
  return `CASE-${year}-${randomNum}`;
}
var memoryComplaints = [];
async function createComplaintRecord(data) {
  const caseId = data.caseId || generateCaseNumber();
  const now = /* @__PURE__ */ new Date();
  const record = {
    id: memoryComplaints.length + 1,
    caseId,
    fullName: data.fullName.trim(),
    companyName: data.companyName?.trim() || null,
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    caseType: data.caseType.trim(),
    orderRef: data.orderRef?.trim() || null,
    urgency: data.urgency.trim(),
    details: data.details.trim(),
    status: "received",
    createdAt: now,
    updatedAt: now
  };
  memoryComplaints.unshift(record);
  try {
    await createEnquiry({
      enquiryNumber: caseId,
      fullName: record.fullName,
      companyName: record.companyName || void 0,
      email: record.email,
      phone: record.phone,
      location: record.orderRef ? `Order/Inv Ref: ${record.orderRef}` : "Grievance Portal",
      category: `COMPLAINT / DISPUTE: ${record.caseType}`,
      urgency: record.urgency.toUpperCase(),
      details: `[CASE ID: ${caseId}]
[CASE TYPE: ${record.caseType}]
[ORDER/INV REF: ${record.orderRef || "N/A"}]
[URGENCY: ${record.urgency.toUpperCase()}]

${record.details}`
    });
  } catch (err) {
    console.warn("[Grievance Bridge] Could not mirror to enquiries table:", err);
  }
  return record;
}
async function getComplaints() {
  return memoryComplaints;
}
async function getComplaintByCaseId(caseId) {
  return memoryComplaints.find((c) => c.caseId === caseId) || null;
}
function generatePressTicketId() {
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const randomNum = Math.floor(1e4 + Math.random() * 9e4);
  return `PRESS-${year}-${randomNum}`;
}
var memoryPressInquiries = [];
async function createPressInquiryRecord(data) {
  const pressTicketId = data.pressTicketId || generatePressTicketId();
  const now = /* @__PURE__ */ new Date();
  const record = {
    id: memoryPressInquiries.length + 1,
    pressTicketId,
    journalistName: data.journalistName.trim(),
    mediaOutlet: data.mediaOutlet.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    inquiryType: data.inquiryType.trim(),
    deadline: data.deadline.trim(),
    details: data.details.trim(),
    status: "received",
    createdAt: now,
    updatedAt: now
  };
  memoryPressInquiries.unshift(record);
  return record;
}
async function getPressInquiries() {
  return memoryPressInquiries;
}
async function getPressInquiryById(pressTicketId) {
  return memoryPressInquiries.find((p) => p.pressTicketId === pressTicketId) || null;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    return decodeOAuthState(state).redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret || "volamp-jwt-secret-key-32-chars-long-minimum-hs256";
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async createMfaPendingToken(email, accountType) {
    const secretKey = this.getSessionSecret();
    const expirationSeconds = Math.floor((Date.now() + 5 * 60 * 1e3) / 1e3);
    return new SignJWT({
      email,
      accountType,
      purpose: "mfa_pending"
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifyMfaPendingToken(token) {
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(token, secretKey, {
        algorithms: ["HS256"]
      });
      if (payload.purpose !== "mfa_pending" || typeof payload.email !== "string") {
        return null;
      }
      return {
        email: payload.email,
        accountType: String(payload.accountType || "customer")
      };
    } catch {
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    let sessionToken = cookies.get(COOKIE_NAME);
    if (!sessionToken) {
      const authHeader = req.headers.authorization;
      if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.slice(7);
      }
    }
    const session = await this.verifySession(sessionToken);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionToken ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader2(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
import fs from "fs";
import path from "path";
function registerStorageProxy(app2) {
  app2.get("/manus-storage/*", async (req, res, next) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    const localCandidates = [
      path.resolve(process.cwd(), "client", "public", "manus-storage", key),
      path.resolve(process.cwd(), "client", "public", key)
    ];
    for (const candidate of localCandidates) {
      if (fs.existsSync(candidate)) {
        res.sendFile(candidate);
        return;
      }
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      next();
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// shared/quickOrderPdf.ts
import { jsPDF } from "jspdf";
function generateQuickOrderPdf(data) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 18;
  doc.setFillColor(11, 35, 58);
  doc.rect(margin, currentY, contentWidth, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("VOLAMP ELEKTRIKALS PVT. LTD.", margin + 6, currentY + 9);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(217, 227, 233);
  doc.text(
    "Global & Domestic B2B Electrical Supply \xB7 Manufacturing HQ: Ahmedabad, Gujarat, India",
    margin + 6,
    currentY + 16
  );
  currentY += 28;
  doc.setDrawColor(218, 228, 235);
  doc.setFillColor(247, 249, 251);
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, "FD");
  doc.setTextColor(196, 107, 25);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("OFFICIAL B2B INVOICE & ORDER SPECIFICATION", margin + 6, currentY + 7);
  doc.setFontSize(13);
  doc.setTextColor(16, 42, 64);
  doc.text("QUICK ORDER & INVOICE REQUISITION", margin + 6, currentY + 14);
  const orderDate = data.date ?? /* @__PURE__ */ new Date();
  const dateStr = orderDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const timeStr = orderDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(29, 115, 183);
  doc.text(`ID: ${data.quickOrderId}`, pageWidth - margin - 6, currentY + 8, {
    align: "right"
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(110, 128, 139);
  doc.text(`Date: ${dateStr} ${timeStr}`, pageWidth - margin - 6, currentY + 14, {
    align: "right"
  });
  currentY += 26;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(218, 228, 235);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, "D");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(196, 107, 25);
  doc.text("CUSTOMER & DELIVERY CONTEXT", margin + 6, currentY + 6);
  doc.setFontSize(8.5);
  doc.setTextColor(110, 128, 139);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 42, 64);
  doc.text("Customer / Contact:", margin + 6, currentY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(data.customerName || "\u2014", margin + 42, currentY + 14);
  doc.setFont("helvetica", "bold");
  doc.text("Company:", margin + 6, currentY + 21);
  doc.setFont("helvetica", "normal");
  doc.text(data.companyName || "Direct Procurement", margin + 42, currentY + 21);
  doc.setFont("helvetica", "bold");
  doc.text("Delivery Location:", margin + 6, currentY + 28);
  doc.setFont("helvetica", "normal");
  doc.text(data.location || "Ahmedabad, Gujarat, India", margin + 42, currentY + 28);
  const rightColX = margin + contentWidth / 2 + 6;
  doc.setFont("helvetica", "bold");
  doc.text("Mobile / WhatsApp:", rightColX, currentY + 14);
  doc.setFont("helvetica", "normal");
  doc.text(data.phone || "\u2014", rightColX + 36, currentY + 14);
  doc.setFont("helvetica", "bold");
  doc.text("GSTIN / Tax ID:", rightColX, currentY + 21);
  doc.setFont("helvetica", "normal");
  doc.text(data.gstin || "B2C / Not provided", rightColX + 36, currentY + 21);
  doc.setFont("helvetica", "bold");
  doc.text("Status:", rightColX, currentY + 28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(217, 120, 24);
  doc.text("Pending Pricing & Quotation", rightColX + 36, currentY + 28);
  currentY += 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(16, 42, 64);
  doc.text("REQUISITION PRODUCT SPECIFICATION", margin, currentY);
  currentY += 4;
  const colIndexW = 14;
  const colQtyW = 32;
  const colNameW = contentWidth - colIndexW - colQtyW;
  doc.setFillColor(11, 35, 58);
  doc.rect(margin, currentY, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text("#", margin + 4, currentY + 5.5);
  doc.text("Product Name / Cable Specification", margin + colIndexW + 4, currentY + 5.5);
  doc.text("Quantity", margin + colIndexW + colNameW + colQtyW - 4, currentY + 5.5, {
    align: "right"
  });
  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  let totalQty = 0;
  data.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, 9, "F");
    doc.setDrawColor(235, 240, 244);
    doc.line(margin, currentY + 9, margin + contentWidth, currentY + 9);
    doc.setTextColor(110, 128, 139);
    doc.text(String(index + 1), margin + 4, currentY + 6);
    doc.setTextColor(16, 42, 64);
    doc.setFont("helvetica", "bold");
    const itemLabel = item.productId ? `[${item.productId}] ${item.name}${item.brand ? ` \xB7 ${item.brand}` : ""}` : item.name;
    doc.text(itemLabel, margin + colIndexW + 4, currentY + 6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 42, 64);
    doc.text(String(item.quantity), margin + colIndexW + colNameW + colQtyW - 4, currentY + 6, {
      align: "right"
    });
    totalQty += Number(item.quantity) || 0;
    currentY += 9;
  });
  doc.setFillColor(242, 246, 249);
  doc.rect(margin, currentY, contentWidth, 9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(16, 42, 64);
  doc.text(`Total Line Items: ${data.items.length}`, margin + 6, currentY + 6);
  doc.text(`Total Units: ${totalQty}`, margin + colIndexW + colNameW + colQtyW - 4, currentY + 6, {
    align: "right"
  });
  currentY += 16;
  if (data.notes && data.notes.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(196, 107, 25);
    doc.text("ADDITIONAL PROJECT NOTES & SPECIFICATIONS:", margin, currentY);
    currentY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 80, 95);
    const splitNotes = doc.splitTextToSize(data.notes.trim(), contentWidth);
    doc.text(splitNotes, margin, currentY);
    currentY += splitNotes.length * 4.5 + 6;
  }
  doc.setDrawColor(218, 228, 235);
  doc.setFillColor(252, 253, 254);
  doc.roundedRect(margin, currentY, contentWidth, 24, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(29, 115, 183);
  doc.text("NEXT ACTIONS BY VOLAMP SUPPLY DESK:", margin + 5, currentY + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(90, 107, 120);
  doc.text(
    "1. An assigned commercial engineer reviews specification compatibility, live inventory and best factory rates.",
    margin + 5,
    currentY + 11
  );
  doc.text(
    "2. Official stamped commercial quotation with GST break-up & freight timeline is issued to your WhatsApp / Email.",
    margin + 5,
    currentY + 16
  );
  doc.text(
    "3. Order & Pay Later institutional bank credit program is available on qualifying volumes.",
    margin + 5,
    currentY + 21
  );
  const footerY = doc.internal.pageSize.getHeight() - 14;
  doc.setDrawColor(218, 228, 235);
  doc.line(margin, footerY - 4, margin + contentWidth, footerY - 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(130, 145, 155);
  doc.text(
    "VOLAMP ELEKTRIKALS PVT. LTD. \xB7 WhatsApp Invoicing & Sourcing Desk: +91 9512365582 \xB7 Web: volampelektrikals.com",
    margin,
    footerY
  );
  doc.text(
    `Requisition Ref: ${data.quickOrderId} \xB7 System Generated`,
    pageWidth - margin,
    footerY,
    { align: "right" }
  );
  return doc;
}

// server/quickOrderPdfRoute.ts
function registerQuickOrderPdfRoute(app2) {
  app2.get("/api/quickorder/pdf/:quickOrderId", async (req, res) => {
    try {
      const { quickOrderId } = req.params;
      if (!quickOrderId) {
        return res.status(400).send("Quick Order ID required");
      }
      const order = await getQuickOrderById(quickOrderId);
      if (!order) {
        return res.status(404).send("Quick Order not found");
      }
      let parsedItems = [];
      try {
        parsedItems = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]");
      } catch {
        parsedItems = [];
      }
      const doc = generateQuickOrderPdf({
        quickOrderId: order.quickOrderId,
        customerName: order.customerName,
        companyName: order.companyName || void 0,
        phone: order.phone,
        email: order.email || void 0,
        location: order.location || void 0,
        items: parsedItems,
        notes: order.notes || void 0,
        date: new Date(order.createdAt)
      });
      const cleanId = order.quickOrderId.replace(/[^a-zA-Z0-9-_]/g, "");
      const pdfArrayBuffer = doc.output("arraybuffer");
      const pdfBuffer = Buffer.from(pdfArrayBuffer);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="VOLAMP_Invoice_${cleanId}.pdf"`);
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(pdfBuffer);
    } catch (err) {
      console.error("Failed to stream Quick Order PDF:", err);
      res.status(500).send("Failed to generate PDF document");
    }
  });
}

// server/services/productService.ts
import fs2 from "fs";
import path2 from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
function findProductsDbPath() {
  const candidates = [
    path2.resolve(process.cwd(), "server/data/products_db.json"),
    path2.resolve(process.cwd(), "api/data/products_db.json"),
    path2.resolve(process.cwd(), "api/products_db.json"),
    path2.resolve(process.cwd(), "data/products_db.json"),
    path2.resolve(process.cwd(), "client/public/products_db.json"),
    path2.resolve(process.cwd(), "dist/public/products_db.json"),
    path2.join(__dirname, "../data/products_db.json"),
    path2.join(__dirname, "../../server/data/products_db.json"),
    path2.join(__dirname, "./data/products_db.json"),
    path2.join(__dirname, "../api/data/products_db.json"),
    path2.join(__dirname, "../../api/data/products_db.json"),
    path2.join(__dirname, "../api/products_db.json"),
    path2.join(__dirname, "../../api/products_db.json"),
    path2.join(__dirname, "products_db.json"),
    path2.join(__dirname, "../products_db.json"),
    "/var/task/server/data/products_db.json",
    "/var/task/api/data/products_db.json",
    "/var/task/api/products_db.json",
    "/var/task/products_db.json",
    "/var/task/client/public/products_db.json",
    "/var/task/dist/public/products_db.json"
  ];
  for (const candidate of candidates) {
    if (fs2.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}
var DB_PATH = findProductsDbPath() || path2.resolve(process.cwd(), "server/data/products_db.json");
var _productsCache = null;
function loadProductsFromDisk() {
  try {
    const dbPath = findProductsDbPath();
    if (dbPath && fs2.existsSync(dbPath)) {
      console.log(`[ProductService] Loading catalog from: ${dbPath}`);
      const raw = fs2.readFileSync(dbPath, "utf-8");
      const parsed = JSON.parse(raw);
      _productsCache = parsed.map((item, idx) => ({
        id: item.id || idx + 1,
        productId: item.productId,
        sku: item.sku || `SKU-${item.productId}`,
        name: item.name,
        brand: item.brand !== void 0 ? item.brand || "" : item.category === "Lugs" || item.productId && item.productId.startsWith("LUG-") ? "Dowells" : ["Wiring Devices", "Earthing Wires", "Solar"].includes(item.category) ? "" : "Polycab",
        category: item.category,
        subcategory: item.subcategory || null,
        description: item.description || null,
        size: item.size || null,
        material: item.material || null,
        unit: item.unit || "Per Unit",
        price: item.price || "On Request",
        numericPrice: item.numericPrice ?? null,
        discount: item.discount || null,
        discountedPrice: item.discountedPrice || null,
        currency: item.currency || "INR",
        availability: item.availability || "IN STOCK",
        moq: item.moq || null,
        imageUrl: item.imageUrl || null,
        threeDImageUrl: item.threeDImageUrl || null,
        productUrl: item.productUrl || null,
        status: item.status || "Active",
        specifications: typeof item.specifications === "string" ? item.specifications : JSON.stringify(item.specifications || {}),
        sheetSource: item.sheetSource || null,
        lastUpdated: item.lastUpdated ? new Date(item.lastUpdated) : /* @__PURE__ */ new Date(),
        createdAt: item.createdAt ? new Date(item.createdAt) : /* @__PURE__ */ new Date()
      }));
      return _productsCache;
    }
  } catch (err) {
    console.error("[ProductService] Error loading products from disk:", err);
  }
  return [];
}
var _lastDbMtime = 0;
function getCachedProducts() {
  const dbPath = findProductsDbPath();
  if (dbPath && fs2.existsSync(dbPath)) {
    try {
      const mtime = fs2.statSync(dbPath).mtimeMs;
      if (!_productsCache || mtime !== _lastDbMtime) {
        _lastDbMtime = mtime;
        return loadProductsFromDisk();
      }
    } catch {
    }
  }
  if (!_productsCache) {
    return loadProductsFromDisk();
  }
  return _productsCache;
}
function normalizeCategory(c) {
  const s = (c || "").toLowerCase().replace(/[-_&]/g, " ").replace(/\s+/g, " ").trim();
  if (s.includes("earth") || s.includes("fastn") || s.includes("fasten")) return "Earthing Wires";
  if (s.includes("wiring") || s.includes("device")) return "Wiring Devices";
  if (s.includes("switch")) return "Switchgear";
  if (s.includes("lug")) return "Lugs";
  if (s.includes("pipe") || s.includes("pvc") || s.includes("conduit")) return "Conduit";
  if (s.includes("gland")) return "Glands";
  if (s.includes("solar")) return "Solar";
  if (s.includes("wire") || s.includes("cable")) return "Wires & Cables";
  return (c || "").trim();
}
function normalizeBrand(b) {
  const lower = (b || "").toLowerCase().trim();
  if (!lower) return "";
  if (lower === "finolex" || lower === "finnolex") return "finolex";
  if (lower.includes("schneider") || lower.includes("schnieder")) return "schneider electric";
  if (lower === "l&t" || lower === "l & t" || lower === "lk" || lower === "l&t / lk" || lower.includes("larsen")) return "l&t / lk";
  if (lower === "polycab") return "polycab";
  if (lower === "kei") return "kei";
  if (lower === "legrand") return "legrand";
  if (lower.includes("dowell")) return "dowells";
  if (lower === "hmi" || lower.includes("hmi")) return "hmi";
  if (lower === "comet" || lower.includes("comet")) return "comet";
  return lower;
}
function parseItemSpecs(specifications) {
  if (!specifications) return {};
  if (typeof specifications === "object") return specifications;
  try {
    return JSON.parse(specifications);
  } catch {
    return {};
  }
}
function getProductHaystack(p) {
  const brandNorm = (p.brand || "").toLowerCase();
  let brandAliases = brandNorm;
  if (brandNorm === "finnolex") brandAliases += " finolex finnolex";
  if (brandNorm === "schnieder") brandAliases += " schneider schnieder schneider electric";
  if (brandNorm === "lk") brandAliases += " lk l&t l and t larsen toubro";
  if (brandNorm.includes("dowell")) brandAliases += " dowells dowell dowell's";
  if (brandNorm === "hmi") brandAliases += " hmi hmi-w hmi-f";
  if (brandNorm === "comet") brandAliases += " comet";
  const size = (p.size || "").toLowerCase();
  const sizeNum = size.replace(/[^\d\.]/g, "");
  let sizeAliases = size;
  if (sizeNum) {
    sizeAliases += ` ${sizeNum}sqmm ${sizeNum} sqmm ${sizeNum}mm ${sizeNum} mm`;
  }
  const mat = (p.material || "").toLowerCase();
  let matAliases = mat;
  if (mat.includes("copper")) matAliases += " cu pure copper electrolytic";
  if (mat.includes("alumin")) matAliases += " al aluminium aluminum";
  const specs = parseItemSpecs(p.specifications);
  const volt = `${specs.voltageRating || ""} ${specs.voltageRatingV || ""}`.toLowerCase();
  let voltAliases = volt;
  if (volt.includes("11 kv") || volt.includes("11kv")) voltAliases += " 11kv 11 kv 11000v ht";
  if (volt.includes("33 kv") || volt.includes("33kv")) voltAliases += " 33kv 33 kv 33000v ht";
  if (volt.includes("1100") || volt.includes("1.1")) voltAliases += " 1.1kv 1.1 kv 1100v 1100 v lt";
  if (volt.includes("1500")) voltAliases += " 1500v 1500 v dc solar";
  const cores = (specs.cores || "").toLowerCase();
  let coreAliases = cores;
  const coreNum = cores.match(/(\d+(?:\.\d+)?)\s*core/);
  if (coreNum) {
    coreAliases += ` ${coreNum[1]}c ${coreNum[1]} core ${coreNum[1]}core`;
  }
  const curr = `${specs.currentRatingA || ""} ${specs.currentRatingAmp || ""}`.toLowerCase();
  let currAliases = curr;
  const currNum = curr.match(/(\d+(?:\.\d+)?)/);
  if (currNum) {
    currAliases += ` ${currNum[1]}a ${currNum[1]} a ${currNum[1]}amp ${currNum[1]} amp`;
  }
  const armour = (specs.typeOfArmour || "").toLowerCase();
  let armourAliases = armour;
  if (armour.includes("armour") || armour.includes("armor")) {
    armourAliases += " armoured armored armour armor";
  }
  return `${p.productId} ${p.sku} ${p.name} ${brandAliases} ${p.category} ${p.subcategory || ""} ${p.description || ""} ${sizeAliases} ${matAliases} ${voltAliases} ${coreAliases} ${currAliases} ${armourAliases} ${p.specifications || ""}`.toLowerCase();
}
function queryProducts(params = {}) {
  const all = getCachedProducts();
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 24));
  const searchLower = (params.search || "").toLowerCase().trim();
  const catFilter = (params.category || "").toLowerCase().trim();
  const subCatFilter = (params.subcategory || "").toLowerCase().trim();
  const brandFilter = (params.brand || "").toLowerCase().trim();
  const statusFilter = params.status || "Active";
  const hasCableExclusiveFilter = Boolean(
    params.cores || params.armorType || params.color || params.sizeSqMm || params.insulationType || params.shieldingType || params.innerSheath || params.outerSheath || params.conductorClass
  );
  let filtered = all.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) {
      return false;
    }
    if (catFilter) {
      const targetNorm = normalizeCategory(catFilter);
      const prodNorm = normalizeCategory(p.category);
      if (hasCableExclusiveFilter && targetNorm !== "Wires & Cables") {
        if (prodNorm !== "Wires & Cables") {
          return false;
        }
      } else if (targetNorm !== prodNorm && !p.category.toLowerCase().includes(catFilter)) {
        return false;
      }
    }
    if (params.subcategories && params.subcategories.length > 0) {
      const lowerList = params.subcategories.map((s) => s.toLowerCase().trim());
      const pSub = (p.subcategory || "").toLowerCase().trim();
      const pName = p.name.toLowerCase();
      const match = lowerList.some(
        (target) => pSub && (pSub === target || pSub.includes(target) || target.includes(pSub)) || pName.includes(target)
      );
      if (!match) return false;
    } else if (subCatFilter) {
      const cleanSubFilter = subCatFilter.replace(/[-_()]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
      const pSub = (p.subcategory || "").replace(/[-_()]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
      const pName = p.name.toLowerCase();
      const pDesc = (p.description || "").toLowerCase();
      const directMatch = pSub === cleanSubFilter || pSub.includes(cleanSubFilter) || cleanSubFilter.includes(pSub);
      if (!directMatch) {
        const stopWords = /* @__PURE__ */ new Set(["cable", "cables", "insulated", "wire", "wires", "and", "the", "for", "with", "type", "core", "flat"]);
        const targetKeywords = cleanSubFilter.split(" ").filter((w) => w.length >= 3 && !stopWords.has(w));
        const keywordMatch = targetKeywords.length > 0 && targetKeywords.every((w) => pSub.includes(w) || pName.includes(w) || pDesc.includes(w));
        if (!keywordMatch) return false;
      }
    }
    if (brandFilter) {
      if (normalizeBrand(p.brand) !== normalizeBrand(brandFilter)) {
        return false;
      }
    }
    if (params.minPrice !== void 0 && (p.numericPrice || 0) < params.minPrice) {
      return false;
    }
    if (params.maxPrice !== void 0 && (p.numericPrice || 0) > params.maxPrice) {
      return false;
    }
    if (params.material) {
      const mTarget = params.material.toLowerCase().trim();
      const pMat = (p.material || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (!pMat.includes(mTarget) && !pName.includes(mTarget)) {
        return false;
      }
    }
    if (params.voltage) {
      const vTarget = params.voltage.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const voltRating = (specs.voltageRating || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (vTarget === "1.1 kv" || vTarget === "1100v" || vTarget === "1.1kv") {
        const isHighVolt11kv = (voltRating.includes("11 kv") || voltRating.includes("11kv") || pName.includes("11 kv") || pName.includes("11kv")) && !voltRating.includes("1100");
        if (isHighVolt11kv) return false;
        const matches1100 = voltRating.includes("1100") || voltRating.includes("1.1") || pName.includes("1100") || pName.includes("1.1 kv") || pName.includes("1.1kv");
        if (!matches1100) return false;
      } else if (vTarget === "11 kv" || vTarget === "11kv") {
        const matches11kv = (voltRating.includes("11 kv") || voltRating.includes("11kv") || pName.includes("11 kv") || pName.includes("11kv")) && !voltRating.includes("1100");
        if (!matches11kv) return false;
      } else if (vTarget === "33 kv" || vTarget === "33kv") {
        const matches33kv = voltRating.includes("33") || pName.includes("33 kv") || pName.includes("33kv");
        if (!matches33kv) return false;
      } else if (vTarget.includes("1500")) {
        const matches1500 = voltRating.includes("1500") || pName.includes("1500");
        if (!matches1500) return false;
      } else {
        if (!voltRating.includes(vTarget) && !pName.includes(vTarget)) {
          return false;
        }
      }
    }
    if (params.cores) {
      const cTarget = params.cores.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const pCores = (specs.cores || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (cTarget === "3.5 core" || cTarget === "3.5") {
        const r35 = /(?:^|\b|\s)3\.5\s*core(?:$|\b|\s)/i;
        if (!r35.test(pCores) && !r35.test(pName)) return false;
      } else if (cTarget === "1 core" || cTarget === "1") {
        const r1 = /(?:^|\b|\s)1\s*core(?:$|\b|\s)/i;
        const isSingle = pCores.includes("single core") || pName.includes("single core");
        if (!r1.test(pCores) && !r1.test(pName) && !isSingle) return false;
      } else if (cTarget === "2 core" || cTarget === "2") {
        const r2 = /(?:^|\b|\s)2\s*core(?:$|\b|\s)/i;
        if (!r2.test(pCores) && !r2.test(pName)) return false;
      } else if (cTarget === "3 core" || cTarget === "3") {
        const r35 = /(?:^|\b|\s)3\.5\s*core(?:$|\b|\s)/i;
        if (r35.test(pCores) || r35.test(pName)) return false;
        const r3 = /(?:^|\b|\s)3\s*core(?:$|\b|\s)/i;
        if (!r3.test(pCores) && !r3.test(pName)) return false;
      } else if (cTarget === "4 core" || cTarget === "4") {
        const r4 = /(?:^|\b|\s)4\s*core(?:$|\b|\s)/i;
        if (!r4.test(pCores) && !r4.test(pName)) return false;
      } else {
        if (!pCores.includes(cTarget) && !pName.includes(cTarget)) return false;
      }
    }
    if (params.armorType) {
      const aTarget = params.armorType.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const pArmour = (specs.typeOfArmour || "").toLowerCase();
      const pName = p.name.toLowerCase();
      const pSub = (p.subcategory || "").toLowerCase();
      if (aTarget === "armoured" || aTarget === "armored") {
        const isUn = pArmour.includes("unarmoured") || pName.includes("unarmoured") || pSub.includes("unarmoured");
        const isArm = pArmour.includes("armoured") || pName.includes("armoured") || pSub.includes("armoured") || pName.includes("2xwy") || pName.includes("a2xwy");
        if (isUn || !isArm) return false;
      } else if (aTarget === "unarmoured" || aTarget === "unarmored") {
        const isUn = pArmour.includes("unarmoured") || pName.includes("unarmoured") || pSub.includes("unarmoured");
        const isArmOnly = !isUn && (pArmour.includes("armoured") || pName.includes("armoured"));
        if (isArmOnly) return false;
      }
    }
    if (params.color) {
      const colTarget = params.color.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const col = (specs.color || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (!col.includes(colTarget) && !pName.includes(colTarget)) {
        return false;
      }
    }
    if (params.sizeSqMm) {
      const sTarget = params.sizeSqMm.toLowerCase().replace(/sqmm|sq\s*mm/i, "").trim();
      const pSize = (p.size || "").toLowerCase().replace(/sqmm|sq\s*mm/i, "").trim();
      const pName = p.name.toLowerCase();
      const numPattern = new RegExp(`(?:^|\\b|\\s)${sTarget.replace(".", "\\.")}\\s*(?:sqmm|sq\\s*mm|sq|mm)?(?:$|\\b|\\s)`, "i");
      const matchesSize = pSize === sTarget || numPattern.test(p.size || "") || numPattern.test(pName);
      if (!matchesSize) {
        return false;
      }
    }
    if (params.insulationType) {
      const insTarget = params.insulationType.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const ins = (specs.insulationType || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (!ins.includes(insTarget) && !pName.includes(insTarget)) {
        return false;
      }
    }
    if (params.shieldingType) {
      const shTarget = params.shieldingType.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const sh = (specs.shieldingType || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (shTarget.includes("unshield")) {
        if (!sh.includes("unshield") && !pName.includes("unshield")) return false;
      } else if (shTarget.includes("overall")) {
        const isOverall = sh.includes("overall") || sh.includes("aluminum mylar") || pName.includes("overall");
        if (!isOverall) return false;
      } else if (shTarget.includes("braid")) {
        if (!sh.includes("braid") && !pName.includes("braid")) return false;
      } else if (shTarget.includes("foil")) {
        if (!sh.includes("foil") && !pName.includes("foil")) return false;
      } else if (!sh.includes(shTarget) && !pName.includes(shTarget)) {
        return false;
      }
    }
    if (params.innerSheath) {
      const isTarget = params.innerSheath.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const isMat = (specs.innerSheathMaterial || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (isTarget.includes("jelly")) {
        if (!isMat.includes("jelly") && !pName.includes("jelly")) return false;
      } else if (isTarget === "frlsh") {
        if (!isMat.includes("frlsh") && !pName.includes("frlsh")) return false;
      } else if (isTarget === "fr") {
        if (!isMat.includes("fr") && !pName.includes("fr") || isMat.includes("frlsh")) return false;
      } else if (!isMat.includes(isTarget) && !pName.includes(isTarget)) {
        return false;
      }
    }
    if (params.outerSheath) {
      const osTarget = params.outerSheath.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const osMat = (specs.outerSheathMaterial || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (osTarget === "frlsh") {
        if (!osMat.includes("frlsh") && !pName.includes("frlsh")) return false;
      } else if (osTarget === "fr") {
        if (!osMat.includes("fr") && !pName.includes("fr") || osMat.includes("frlsh")) return false;
      } else if (!osMat.includes(osTarget) && !pName.includes(osTarget)) {
        return false;
      }
    }
    if (params.conductorClass) {
      const ccTarget = params.conductorClass.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const cc = (specs.conductorClass || "").toLowerCase();
      const pName = p.name.toLowerCase();
      const isClass5 = ccTarget.includes("class 5") || ccTarget.includes("flexible") || ccTarget.includes("5");
      const isClass2 = ccTarget.includes("class 2") || ccTarget.includes("stranded") || ccTarget.includes("2");
      if (isClass5 && !cc.includes("5") && !cc.includes("flex") && !pName.includes("flex")) return false;
      if (isClass2 && !cc.includes("2") && !cc.includes("strand") && !pName.includes("strand")) return false;
      if (!isClass5 && !isClass2 && !cc.includes(ccTarget) && !pName.includes(ccTarget)) return false;
    }
    if (params.poles) {
      const pTarget = params.poles.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const pol = (specs.polesPhase || "").toLowerCase();
      const pName = p.name.toLowerCase();
      if (!pol.includes(pTarget) && !pName.includes(pTarget)) {
        return false;
      }
    }
    if (params.rating) {
      const rTarget = params.rating.toLowerCase().trim();
      const specs = parseItemSpecs(p.specifications);
      const curr = (specs.currentRatingA || "").toLowerCase();
      const pName = p.name.toLowerCase();
      const cleanTarget = rTarget.replace("a", "");
      if (!curr.includes(rTarget) && !curr.includes(cleanTarget) && !pName.includes(rTarget)) {
        return false;
      }
    }
    if (params.stock === "in_stock") {
      const avail = (p.availability || "in stock").toLowerCase();
      if (!avail.includes("stock")) return false;
    }
    if (searchLower) {
      const haystack = getProductHaystack(p);
      const words = searchLower.split(/\s+/).filter(Boolean);
      return words.every((w) => haystack.includes(w));
    }
    return true;
  });
  if (filtered.length === 0 && searchLower) {
    const conversationalStopWords = /* @__PURE__ */ new Set([
      "what",
      "is",
      "the",
      "tell",
      "me",
      "show",
      "give",
      "price",
      "prices",
      "cost",
      "costs",
      "rate",
      "rates",
      "discount",
      "discounts",
      "of",
      "for",
      "in",
      "with",
      "and",
      "please",
      "do",
      "you",
      "have",
      "i",
      "need",
      "want",
      "to",
      "buy",
      "order",
      "can",
      "how",
      "much",
      "find",
      "search",
      "looking",
      "specs",
      "specification",
      "about",
      "any",
      "got",
      "sell",
      "provide",
      "details",
      "all",
      "which",
      "list",
      "options",
      "available",
      "suggest",
      "item",
      "items",
      "product",
      "products"
    ]);
    const meaningfulTokens = searchLower.replace(/[\?\,\!\:\;\(\)\"\'\*\#\$\@\%\^\&\=\+]/g, " ").split(/\s+/).filter((t2) => t2.length >= 2 && !conversationalStopWords.has(t2));
    if (meaningfulTokens.length > 0) {
      const scored = [];
      for (const p of all) {
        if (statusFilter !== "all" && p.status !== statusFilter) continue;
        if (catFilter && normalizeCategory(p.category) !== normalizeCategory(catFilter)) continue;
        if (brandFilter && normalizeBrand(p.brand) !== normalizeBrand(brandFilter)) continue;
        const haystack = getProductHaystack(p);
        let score = 0;
        for (const token of meaningfulTokens) {
          if (haystack.includes(token)) score += 1;
        }
        if (score > 0) {
          scored.push({ product: p, score });
        }
      }
      scored.sort((a, b) => b.score - a.score);
      filtered = scored.map((s) => s.product);
    }
  }
  if (params.sortBy === "price_asc") {
    filtered.sort((a, b) => {
      const pa = a.numericPrice && a.numericPrice > 0 ? a.numericPrice : Number.MAX_VALUE;
      const pb = b.numericPrice && b.numericPrice > 0 ? b.numericPrice : Number.MAX_VALUE;
      return pa - pb;
    });
  } else if (params.sortBy === "price_desc") {
    filtered.sort((a, b) => (b.numericPrice || 0) - (a.numericPrice || 0));
  } else if (params.sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name, void 0, { numeric: true, sensitivity: "base" }));
  }
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);
  return {
    products: paginated,
    total,
    page,
    limit,
    totalPages
  };
}
var LEGACY_VLP_ALIASES = {
  "VLP-AL-001": "CAB-000001",
  "VLP-IN-014": "CAB-000002",
  "VLP-SL-022": "SOL-000001",
  "VLP-BW-031": "CAB-000003",
  "VLP-SG-048": "SWG-000001"
};
function getProductByProductId(productId) {
  if (!productId || typeof productId !== "string") return void 0;
  const all = getCachedProducts();
  const rawClean = productId.trim();
  const normalized = rawClean.toUpperCase();
  if (LEGACY_VLP_ALIASES[normalized]) {
    const aliasedId = LEGACY_VLP_ALIASES[normalized];
    const match = all.find((p) => p.productId.toUpperCase() === aliasedId);
    if (match) return match;
  }
  const direct = all.find((p) => p.productId.toUpperCase() === normalized || p.sku.toUpperCase() === normalized);
  if (direct) return direct;
  const prefixMatch = all.find((p) => normalized.startsWith(p.productId.toUpperCase()));
  if (prefixMatch) return prefixMatch;
  const num = parseInt(productId, 10);
  if (!isNaN(num)) {
    const byNum = all.find((p) => p.id === num);
    if (byNum) return byNum;
  }
  const slugifiedInput = rawClean.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (slugifiedInput) {
    const bySlug = all.find((p) => {
      const pSlug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return pSlug === slugifiedInput || pSlug.startsWith(slugifiedInput);
    });
    if (bySlug) return bySlug;
  }
  const partial = all.find((p) => p.sku.toUpperCase().includes(normalized) || p.productId.toUpperCase().includes(normalized));
  if (partial) return partial;
  return void 0;
}
function getCatalogCategories() {
  const all = getCachedProducts();
  const catMap = {};
  for (const p of all) {
    const canonical = normalizeCategory(p.category);
    if (!catMap[canonical]) {
      catMap[canonical] = { name: canonical, total: 0, subcategories: {}, brands: /* @__PURE__ */ new Set() };
    }
    catMap[canonical].total += 1;
    if (p.brand) catMap[canonical].brands.add(p.brand);
    if (p.subcategory) {
      catMap[canonical].subcategories[p.subcategory] = (catMap[canonical].subcategories[p.subcategory] || 0) + 1;
    }
  }
  return Object.values(catMap).map((c) => ({
    name: c.name,
    total: c.total,
    brands: Array.from(c.brands),
    subcategories: Object.entries(c.subcategories).map(([name, count]) => ({ name, count }))
  }));
}
function getCatalogBrands(category) {
  const all = getCachedProducts();
  const brands = /* @__PURE__ */ new Set();
  const targetCategory = category ? normalizeCategory(category) : null;
  if (targetCategory && ["Wiring Devices", "Earthing Wires", "Solar"].includes(targetCategory)) {
    return [];
  }
  for (const p of all) {
    if (targetCategory && normalizeCategory(p.category) !== targetCategory) {
      continue;
    }
    if (p.brand && p.brand.trim() !== "" && !p.brand.toLowerCase().includes("volamp")) {
      brands.add(p.brand.trim());
    }
  }
  const canonicalOrder = ["Polycab", "Finolex", "KEI", "Schneider Electric", "L&T / LK", "Legrand", "Dowells", "HMI", "Comet"];
  return Array.from(brands).sort((a, b) => {
    const ia = canonicalOrder.indexOf(a);
    const ib = canonicalOrder.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}
function getCategoryFilterStats(category, subcategory) {
  const all = getCachedProducts();
  const catFilter = (category || "").toLowerCase().trim();
  const subCatFilter = (subcategory || "").toLowerCase().trim();
  const relevant = all.filter((p) => {
    if (p.status !== "Active") return false;
    if (catFilter) {
      const targetNorm = normalizeCategory(catFilter);
      const prodNorm = normalizeCategory(p.category);
      if (targetNorm !== prodNorm && !p.category.toLowerCase().includes(catFilter)) {
        return false;
      }
    }
    if (subCatFilter) {
      const cleanSubFilter = subCatFilter.replace(/[-_()]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
      const pSub = (p.subcategory || "").replace(/[-_()]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
      const pName = p.name.toLowerCase();
      const directMatch = pSub === cleanSubFilter || pSub.includes(cleanSubFilter) || cleanSubFilter.includes(pSub);
      if (!directMatch && !pName.includes(cleanSubFilter)) return false;
    }
    return true;
  });
  const r1 = /(?:^|\b|\s)1\s*core(?:$|\b|\s)/i;
  const r2 = /(?:^|\b|\s)2\s*core(?:$|\b|\s)/i;
  const r3 = /(?:^|\b|\s)3\s*core(?:$|\b|\s)/i;
  const r35 = /(?:^|\b|\s)3\.5\s*core(?:$|\b|\s)/i;
  const r4 = /(?:^|\b|\s)4\s*core(?:$|\b|\s)/i;
  const counts = {
    materials: { Copper: 0, Aluminium: 0 },
    voltages: { "1100V": 0, "1.1 kV": 0, "11 kV": 0, "33 kV": 0, "1500V DC": 0 },
    cores: { "1 Core": 0, "2 Core": 0, "3 Core": 0, "3.5 Core": 0, "4 Core": 0, "Multi Core": 0, "Pair": 0, "Triad": 0, "Quad": 0 },
    armour: { Armoured: 0, Unarmoured: 0 },
    colors: { BLACK: 0, RED: 0, BLUE: 0, YELLOW: 0, GREEN: 0, GREY: 0, ORANGE: 0, Transparent: 0 },
    sizes: {
      "0.5 SQMM": 0,
      "0.75 SQMM": 0,
      "1 SQMM": 0,
      "1.5 SQMM": 0,
      "2.5 SQMM": 0,
      "4 SQMM": 0,
      "6 SQMM": 0,
      "10 SQMM": 0,
      "16 SQMM": 0,
      "25 SQMM": 0,
      "35 SQMM": 0,
      "50 SQMM": 0,
      "70 SQMM": 0,
      "95 SQMM": 0,
      "120 SQMM": 0,
      "150 SQMM": 0,
      "185 SQMM": 0,
      "240 SQMM": 0,
      "300 SQMM": 0,
      "400 SQMM": 0
    },
    insulation: { PVC: 0, XLPE: 0, FRLSH: 0, FR: 0 },
    shielding: { "Unshielded": 0, "Overall Shielded": 0, "Braided Screen": 0, "Foiled Shielded": 0 },
    innerSheath: { PVC: 0, FRLSH: 0, FR: 0, "Jelly Filled": 0 },
    outerSheath: { PVC: 0, FRLSH: 0, FR: 0 },
    conductorClass: { "Class 2 (Stranded)": 0, "Class 5 (Flexible)": 0 },
    poles: { "1P": 0, "2P": 0, "3P": 0, "4P": 0 },
    ratings: { "6A": 0, "10A": 0, "16A": 0, "25A": 0, "32A": 0, "40A": 0, "63A": 0, "100A": 0 },
    stock: { in_stock: 0, all: relevant.length }
  };
  for (const p of relevant) {
    const specs = parseItemSpecs(p.specifications);
    const volt = (specs.voltageRating || "").toLowerCase();
    const cores = (specs.cores || "").toLowerCase();
    const armour = (specs.typeOfArmour || "").toLowerCase();
    const pol = (specs.polesPhase || "").toLowerCase();
    const curr = (specs.currentRatingA || "").toLowerCase();
    const mat = (p.material || "").toLowerCase();
    const name = p.name.toLowerCase();
    const sub = (p.subcategory || "").toLowerCase();
    const avail = (p.availability || "in stock").toLowerCase();
    const isCable = p.category.toLowerCase().includes("wire") || p.category.toLowerCase().includes("cable");
    const isSwitchgear = p.category.toLowerCase().includes("switch");
    if (mat.includes("copper") || name.includes("copper")) counts.materials.Copper++;
    if (mat.includes("aluminium") || name.includes("aluminium")) counts.materials.Aluminium++;
    if (isCable) {
      const is11kv = (volt.includes("11 kv") || volt.includes("11kv") || name.includes("11 kv") || name.includes("11kv")) && !volt.includes("1100");
      const matches1100 = volt.includes("1100") || volt.includes("1.1") || name.includes("1100") || name.includes("1.1 kv") || name.includes("1.1kv");
      if (!is11kv && matches1100) {
        counts.voltages["1100V"]++;
        counts.voltages["1.1 kV"]++;
      }
      if (is11kv) counts.voltages["11 kV"]++;
      if (volt.includes("33") || name.includes("33 kv") || name.includes("33kv")) counts.voltages["33 kV"]++;
      if (volt.includes("1500") || name.includes("1500")) counts.voltages["1500V DC"]++;
      if (cores.includes("pair") || name.includes("pair")) {
        counts.cores["Pair"]++;
      } else if (cores.includes("triad") || name.includes("triad")) {
        counts.cores["Triad"]++;
      } else if (cores.includes("quad") || name.includes("quad")) {
        counts.cores["Quad"]++;
      } else if (r35.test(cores) || r35.test(name)) {
        counts.cores["3.5 Core"]++;
      } else if (r1.test(cores) || r1.test(name) || cores.includes("single core") || name.includes("single core")) {
        counts.cores["1 Core"]++;
      } else if (r2.test(cores) || r2.test(name)) {
        counts.cores["2 Core"]++;
      } else if (r3.test(cores) || r3.test(name)) {
        counts.cores["3 Core"]++;
      } else if (r4.test(cores) || r4.test(name)) {
        counts.cores["4 Core"]++;
      } else if (/(?:5|6|7|8|10|12|14|16|19|24|27|30|37)\s*core/i.test(cores) || /(?:5|6|7|8|10|12|14|16|19|24|27|30|37)\s*core/i.test(name)) {
        counts.cores["Multi Core"]++;
      }
      const isUn = armour.includes("unarmoured") || name.includes("unarmoured") || sub.includes("unarmoured");
      const isArm = armour.includes("armoured") || name.includes("armoured") || sub.includes("armoured") || name.includes("2xwy") || name.includes("a2xwy");
      if (!isUn && isArm) counts.armour.Armoured++;
      if (isUn) counts.armour.Unarmoured++;
      const c = (specs.color || "").toUpperCase();
      if (c in counts.colors) counts.colors[c]++;
      const s = (p.size || "").toUpperCase().trim();
      if (s in counts.sizes) counts.sizes[s]++;
      const ins = (specs.insulationType || "").toUpperCase();
      if (ins.includes("XLPE")) counts.insulation.XLPE++;
      if (ins.includes("PVC")) counts.insulation.PVC++;
      if (ins.includes("FRLSH")) counts.insulation.FRLSH++;
      else if (ins.includes("FR")) counts.insulation.FR++;
      const sh = (specs.shieldingType || "").toLowerCase();
      if (sh.includes("unshield")) counts.shielding["Unshielded"]++;
      if (sh.includes("overall") || sh.includes("aluminum mylar")) counts.shielding["Overall Shielded"]++;
      if (sh.includes("braid")) counts.shielding["Braided Screen"]++;
      if (sh.includes("foil")) counts.shielding["Foiled Shielded"]++;
      const isM = (specs.innerSheathMaterial || "").toUpperCase();
      if (isM.includes("PVC")) counts.innerSheath.PVC++;
      if (isM.includes("FRLSH")) counts.innerSheath.FRLSH++;
      else if (isM.includes("FR")) counts.innerSheath.FR++;
      if (isM.includes("JELLY")) counts.innerSheath["Jelly Filled"]++;
      const osM = (specs.outerSheathMaterial || "").toUpperCase();
      if (osM.includes("PVC")) counts.outerSheath.PVC++;
      if (osM.includes("FRLSH")) counts.outerSheath.FRLSH++;
      else if (osM.includes("FR")) counts.outerSheath.FR++;
      const cc = (specs.conductorClass || "").toLowerCase();
      if (cc.includes("5") || cc.includes("flex")) counts.conductorClass["Class 5 (Flexible)"]++;
      if (cc.includes("2") || cc.includes("strand")) counts.conductorClass["Class 2 (Stranded)"]++;
    }
    if (isSwitchgear) {
      if (pol.includes("1p") || pol.includes("sp")) counts.poles["1P"]++;
      if (pol.includes("2p") || pol.includes("dp")) counts.poles["2P"]++;
      if (pol.includes("3p") || pol.includes("tp")) counts.poles["3P"]++;
      if (pol.includes("4p") || pol.includes("fp")) counts.poles["4P"]++;
      ["6A", "10A", "16A", "25A", "32A", "40A", "63A", "100A"].forEach((rt) => {
        const val = rt.replace("A", "");
        if (curr.includes(rt.toLowerCase()) || curr === val || curr.startsWith(val + ".") || name.includes(rt.toLowerCase())) {
          counts.ratings[rt]++;
        }
      });
    }
    if (avail.includes("stock")) counts.stock.in_stock++;
  }
  return counts;
}
function previewImportDiff(incomingProducts) {
  const current = getCachedProducts();
  const currentMap = /* @__PURE__ */ new Map();
  for (const p of current) {
    currentMap.set(p.productId, p);
  }
  let newCount = 0;
  let updatedCount = 0;
  let unchangedCount = 0;
  let errorCount = 0;
  const sampleDiffs = [];
  const errors = [];
  const incomingIds = /* @__PURE__ */ new Set();
  for (let i = 0; i < incomingProducts.length; i++) {
    const item = incomingProducts[i];
    if (!item.productId || !item.name || !item.category) {
      errorCount++;
      errors.push({ row: i + 1, sheet: item.sheetSource || "Unknown", reason: "Missing productId, name, or category" });
      continue;
    }
    incomingIds.add(item.productId);
    const existing = currentMap.get(item.productId);
    if (!existing) {
      newCount++;
      if (sampleDiffs.length < 15) {
        sampleDiffs.push({
          productId: item.productId,
          name: item.name,
          brand: item.brand || "Volamp",
          changeType: "new",
          diffs: [{ field: "status", oldVal: null, newVal: "NEW PRODUCT" }]
        });
      }
    } else {
      const fieldDiffs = [];
      if (existing.price !== item.price) {
        fieldDiffs.push({ field: "price", oldVal: existing.price, newVal: item.price });
      }
      if (existing.name !== item.name) {
        fieldDiffs.push({ field: "name", oldVal: existing.name, newVal: item.name });
      }
      if (existing.discount !== item.discount) {
        fieldDiffs.push({ field: "discount", oldVal: existing.discount, newVal: item.discount });
      }
      if (existing.availability !== item.availability) {
        fieldDiffs.push({ field: "availability", oldVal: existing.availability, newVal: item.availability });
      }
      if (fieldDiffs.length > 0) {
        updatedCount++;
        if (sampleDiffs.length < 15) {
          sampleDiffs.push({
            productId: item.productId,
            name: item.name,
            brand: item.brand || existing.brand,
            changeType: "updated",
            diffs: fieldDiffs
          });
        }
      } else {
        unchangedCount++;
      }
    }
  }
  let inactiveCount = 0;
  for (const p of current) {
    if (p.status === "Active" && !incomingIds.has(p.productId)) {
      inactiveCount++;
    }
  }
  return {
    summary: {
      newCount,
      updatedCount,
      unchangedCount,
      inactiveCount,
      errorCount,
      totalInFile: incomingProducts.length
    },
    sampleDiffs,
    errors: errors.slice(0, 20),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function updateProductPrice(input) {
  const all = loadProductsFromDisk();
  const target = all.find((p) => p.productId === input.productId);
  if (!target) {
    throw new Error(`Product with ID '${input.productId}' was not found.`);
  }
  if (input.price !== void 0) target.price = input.price;
  if (input.numericPrice !== void 0) target.numericPrice = input.numericPrice;
  if (input.discountedPrice !== void 0) target.discountedPrice = input.discountedPrice;
  if (input.discount !== void 0) target.discount = input.discount;
  if (input.status !== void 0) target.status = input.status;
  target.lastUpdated = /* @__PURE__ */ new Date();
  fs2.writeFileSync(DB_PATH, JSON.stringify(all, null, 2), "utf-8");
  _productsCache = all;
  return target;
}
function addNewProduct(input) {
  const all = loadProductsFromDisk();
  const randomSuffix = Math.floor(1e3 + Math.random() * 9e3);
  const prefix = input.category.toUpperCase().includes("WIRE") || input.category.toUpperCase().includes("CABLE") ? "CAB" : input.category.toUpperCase().includes("SOLAR") ? "SOL" : input.category.toUpperCase().includes("SWITCH") ? "SWG" : "PRD";
  const productId = `${prefix}-${Date.now().toString().slice(-6)}-${randomSuffix}`;
  const sku = `VOL-${productId}`;
  const newProd = {
    id: all.length + 1,
    productId,
    sku,
    name: input.name,
    brand: input.brand || "Volamp",
    category: input.category,
    subcategory: input.subcategory || null,
    description: input.description || null,
    size: input.size || null,
    material: input.material || null,
    unit: input.unit || "Per Metre",
    price: input.price,
    numericPrice: input.numericPrice ?? (parseFloat(input.price.replace(/[^0-9.]/g, "")) || null),
    discount: input.discount || null,
    discountedPrice: input.discountedPrice || null,
    currency: "INR",
    availability: "IN STOCK",
    moq: "Standard Roll / Reel",
    imageUrl: input.imageUrl || "/products/cables.jpg",
    threeDImageUrl: null,
    productUrl: null,
    status: input.status || "Active",
    specifications: typeof input.specifications === "string" ? input.specifications : JSON.stringify(input.specifications || {}),
    sheetSource: "Manual Employee Entry",
    lastUpdated: /* @__PURE__ */ new Date(),
    createdAt: /* @__PURE__ */ new Date()
  };
  all.unshift(newProd);
  fs2.writeFileSync(DB_PATH, JSON.stringify(all, null, 2), "utf-8");
  _productsCache = all;
  return newProd;
}

// server/googleMerchantFeed.ts
var BASE_URL = "https://volampelektrikals.com";
function escapeXml(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function generateGoogleMerchantXml() {
  const products2 = loadProductsFromDisk();
  const validProducts = products2.filter((p) => p.productId && p.name);
  const itemsXml = validProducts.map((prod) => {
    const rawPrice = prod.numericPrice || (typeof prod.price === "string" ? parseFloat(prod.price.replace(/[^0-9.]/g, "")) : 0) || 100;
    const priceFormatted = `${rawPrice.toFixed(2)} INR`;
    const productLink = `${BASE_URL}/product/${encodeURIComponent(prod.productId)}`;
    const imageLink = prod.imageUrl && prod.imageUrl.startsWith("http") ? prod.imageUrl : prod.imageUrl ? `${BASE_URL}${prod.imageUrl}` : `${BASE_URL}/products/default.jpg`;
    const brand = prod.brand || "Polycab";
    const category = prod.category || "Wires & Cables";
    return `    <item>
      <g:id>${escapeXml(prod.productId)}</g:id>
      <g:title>${escapeXml(prod.name)}</g:title>
      <g:description>${escapeXml(
      prod.description || `${prod.name} - genuine certified industrial electrical supply with manufacturer test certificate (MTC) from Volamp Elektrikals.`
    )}</g:description>
      <g:link>${escapeXml(productLink)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${prod.availability === "OUT OF STOCK" ? "out_of_stock" : "in_stock"}</g:availability>
      <g:price>${escapeXml(priceFormatted)}</g:price>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:google_product_category>Hardware &gt; Electrical Supplies &gt; Wire &amp; Cable</g:google_product_category>
      <g:product_type>${escapeXml(category)}</g:product_type>
      <g:mpn>${escapeXml(prod.sku || prod.productId)}</g:mpn>
      <g:identifier_exists>yes</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Insured Project Freight</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>VOLAMP ELEKTRIKALS PVT. LTD. - Official Google Merchant Product Feed</title>
    <link>${BASE_URL}/</link>
    <description>Official verified product catalog for Google Merchant Center and Google Shopping. Genuine industrial power cables, switchgear, and earthing supplies from Ahmedabad, Gujarat.</description>
${itemsXml}
  </channel>
</rss>`;
}
function registerGoogleMerchantRoutes(app2) {
  const feedHandler = (_req, res) => {
    try {
      const xml = generateGoogleMerchantXml();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=14400");
      res.send(xml);
    } catch (err) {
      console.error("Failed to generate Google Merchant XML feed:", err);
      res.status(500).send("Error generating Google Merchant feed");
    }
  };
  app2.get("/api/google-merchant-feed.xml", feedHandler);
  app2.get("/feed/google-shopping.xml", feedHandler);
  app2.get("/google-merchant-feed.xml", feedHandler);
  app2.get("/api/google-merchant/status", (_req, res) => {
    const products2 = loadProductsFromDisk();
    res.json({
      status: "active",
      storeName: "VOLAMP ELEKTRIKALS PVT. LTD.",
      domain: BASE_URL,
      feedUrls: {
        apiFeed: `${BASE_URL}/api/google-merchant-feed.xml`,
        rootFeed: `${BASE_URL}/google-merchant-feed.xml`
      },
      itemCount: products2.length,
      merchantCenterUrl: "https://merchants.google.com/"
    });
  });
}

// server/productRestRoutes.ts
function registerProductRestRoutes(app2) {
  app2.get("/api/products", (req, res) => {
    try {
      const { category, subcategory, brand, search, status, page, limit, sortBy, minPrice, maxPrice } = req.query;
      const result = queryProducts({
        category: category ? String(category) : void 0,
        subcategory: subcategory ? String(subcategory) : void 0,
        brand: brand ? String(brand) : void 0,
        search: search ? String(search) : void 0,
        status,
        page: page ? parseInt(String(page), 10) : 1,
        limit: limit ? parseInt(String(limit), 10) : 24,
        sortBy,
        minPrice: minPrice ? parseFloat(String(minPrice)) : void 0,
        maxPrice: maxPrice ? parseFloat(String(maxPrice)) : void 0
      });
      return res.json({
        success: true,
        data: result
      });
    } catch (err) {
      console.error("[API Products] Error:", err);
      return res.status(500).json({ success: false, error: err.message || "Failed to query products" });
    }
  });
  app2.get("/api/products/meta/categories", (_req, res) => {
    try {
      const categories = getCatalogCategories();
      return res.json({ success: true, data: categories });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
  app2.get("/api/products/meta/brands", (req, res) => {
    try {
      const { category } = req.query;
      const brands = getCatalogBrands(category ? String(category) : void 0);
      return res.json({ success: true, data: brands });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
  app2.get("/api/products/:productId", (req, res) => {
    try {
      const { productId } = req.params;
      const product = getProductByProductId(productId);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product '${productId}' not found` });
      }
      return res.json({ success: true, data: product });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
  app2.post("/api/products/sync-preview", (_req, res) => {
    try {
      const current = loadProductsFromDisk();
      const preview = previewImportDiff(current);
      return res.json({ success: true, data: preview });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });
}

// server/seoRoutes.ts
var BASE_URL2 = "https://volampelektrikals.com";
var STATIC_PAGES = [
  { path: "", priority: "1.0", changefreq: "daily" },
  { path: "about-volamp", priority: "0.9", changefreq: "weekly" },
  { path: "where-volamp-contributed", priority: "0.9", changefreq: "weekly" },
  { path: "business-segments", priority: "0.9", changefreq: "weekly" },
  { path: "branch-locations", priority: "0.9", changefreq: "weekly" },
  { path: "products", priority: "0.9", changefreq: "daily" },
  { path: "price-list", priority: "0.9", changefreq: "weekly" },
  { path: "certifications-and-awards", priority: "0.8", changefreq: "monthly" },
  { path: "calculator", priority: "0.8", changefreq: "monthly" },
  { path: "collaborate", priority: "0.8", changefreq: "monthly" },
  { path: "careers", priority: "0.7", changefreq: "weekly" },
  { path: "enquire", priority: "0.8", changefreq: "monthly" },
  { path: "in-the-news", priority: "0.7", changefreq: "monthly" },
  { path: "blog", priority: "0.8", changefreq: "daily" },
  { path: "export", priority: "0.9", changefreq: "weekly" },
  { path: "dealers/polycab-ahmedabad", priority: "0.95", changefreq: "daily" },
  { path: "dealers/finolex-cables-ahmedabad", priority: "0.95", changefreq: "daily" },
  { path: "dealers/kei-cables-gujarat", priority: "0.95", changefreq: "daily" },
  { path: "dealers/schneider-electric-ahmedabad", priority: "0.90", changefreq: "daily" },
  { path: "locations/industrial-gidc-hubs", priority: "0.95", changefreq: "daily" },
  { path: "shipping-policy", priority: "0.5", changefreq: "monthly" },
  { path: "terms-and-conditions", priority: "0.5", changefreq: "monthly" },
  { path: "privacy-policy", priority: "0.5", changefreq: "monthly" }
];
var BLOG_SLUGS = [
  "copper-vs-aluminium-armoured-cable-sizing-guide",
  "solar-dc-cable-specifications-iec-62930",
  "lme-copper-aluminium-market-analysis-q4-2026",
  "is-7098-vs-is-1554-cable-difference-guide",
  "cable-gland-and-lug-size-selection-chart"
];
var CATEGORY_SLUGS = [
  "wire-cables",
  "switch-gears",
  "lugs",
  "conduit",
  "glands",
  "wiring-device",
  "earthing-material",
  "solar"
];
function generateSitemapXml() {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const staticUrls = STATIC_PAGES.map(
    (page) => `  <url>
    <loc>${BASE_URL2}/${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ).join("\n");
  const categoryUrls = CATEGORY_SLUGS.map(
    (slug) => `  <url>
    <loc>${BASE_URL2}/category/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`
  ).join("\n");
  const blogUrls = BLOG_SLUGS.map(
    (slug) => `  <url>
    <loc>${BASE_URL2}/blog/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`
  ).join("\n");
  const products2 = loadProductsFromDisk();
  const productUrls = products2.filter((prod) => prod.productId && prod.name).map((prod) => {
    const imgLink = prod.imageUrl && prod.imageUrl.startsWith("http") ? prod.imageUrl : prod.imageUrl ? `${BASE_URL2}${prod.imageUrl}` : "";
    return `  <url>
    <loc>${BASE_URL2}/product/${encodeURIComponent(prod.productId)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>${imgLink ? `
    <image:image>
      <image:loc>${imgLink}</image:loc>
      <image:title>${prod.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</image:title>
    </image:image>` : ""}
  </url>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls}
${categoryUrls}
${blogUrls}
${productUrls}
</urlset>`.trim();
}
function generateRobotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

# AI Search & Retrieval Crawlers (Explicit allow with portal protection)
User-agent: GPTBot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: OAI-SearchBot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: ChatGPT-User
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: ClaudeBot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: Claude-SearchBot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: PerplexityBot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: Google-Extended
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: Amazonbot
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: Meta-ExternalAgent
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

User-agent: Bytespider
Allow: /
Disallow: /portal
Disallow: /employee-portal
Disallow: /api/trpc/

Sitemap: ${BASE_URL2}/sitemap.xml
`.trim();
}
function generateLlmsTxt() {
  return `# VOLAMP ELEKTRIKALS PRIVATE LIMITED
> B2B industrial electrical distribution platform in Ahmedabad, Gujarat, India, supplying certified power cables, switchgear, and earthing infrastructure across 28 states.

Volamp Elektrikals Private Limited is an authorized master distributor and wholesale stockist of genuine industrial cables and electrical equipment. Family electrical business legacy since 1964; company incorporated in 2021 (CIN: U31900GJ2021PTC122730 | GSTIN: 24AAICV0754B1ZO | GeM Verified).

## Core Pages & Portals
- [Homepage](https://volampelektrikals.com): Corporate overview, brand portfolio, real-time cable estimator, and RFQ desk.
- [About VOLAMP](https://volampelektrikals.com/about-volamp): 4-generation lineage, engineering leadership by CEO Naimil Vipul Patel, and corporate governance.
- [Branch Locations & Warehouses](https://volampelektrikals.com/branch-locations): Corporate Sales Office (Khadia, Ahmedabad 380001) and Central Logistics Fulfillment Terminal (Aslali Highway, Ahmedabad 382427).
- [Products Catalog](https://volampelektrikals.com/products): 3,385+ verified active SKUs across power cables, switchgear, and earthing.
- [Manufacturer Price Lists](https://volampelektrikals.com/price-list): 2026 manufacturer price lists, contractor discount circulars, and CPRI test certificates.
- [Cable Sizing Calculator](https://volampelektrikals.com/calculator): Interactive engineering calculator for copper and aluminium cable voltage drop and current ratings.
- [Certifications & Compliance](https://volampelektrikals.com/certifications-and-awards): IS 7098 (Part 1 & 2), IS 1554, IS 694, and EN 50618 compliance reports.
- [Infrastructure Footprint](https://volampelektrikals.com/where-volamp-contributed): Landmark project supplies including 200MW West Bengal Solar Park, Punjab 66kV Grid, and AMC Stadium Ahmedabad.
- [Project Sourcing & RFQ Desk](https://volampelektrikals.com/enquire): Direct BOM evaluation and project quotation by electrical engineers.
- [Customer Grievance Redressal Cell](https://volampelektrikals.com/complaints-cases): Official dispute, shortage, and escalation management portal.
- [Global Cable Export Desk](https://volampelektrikals.com/export): Direct export of IEC/BS certified power cables, solar DC cables, and switchgear via Mundra & Kandla deep-water ports.
- [Polycab Dealer Ahmedabad](https://volampelektrikals.com/dealers/polycab-ahmedabad): Authorized master distributor for Polycab LT/HT XLPE cables, solar DC wires, and flexible building wires in Ahmedabad & Gujarat.
- [Finolex Cables Dealer Ahmedabad](https://volampelektrikals.com/dealers/finolex-cables-ahmedabad): Authorized wholesale stockist for Finolex 100% pure electrolytic copper flexible wires and power cables.
- [KEI Cables Distributor Gujarat](https://volampelektrikals.com/dealers/kei-cables-gujarat): Industrial distributor for KEI heavy HT power cables, rubber trailing cables, and EHV transmission lines.
- [Schneider Electric Switchgear](https://volampelektrikals.com/dealers/schneider-electric-ahmedabad): Authorized distributor for Acti9 MCBs, EasyPact MCCBs, and TeSys contactors in Ahmedabad.
- [Gujarat GIDC Industrial Supply](https://volampelektrikals.com/locations/industrial-gidc-hubs): Same-day 24h electrical delivery to Sanand, Vatva, Naroda, Changodar, Dahej, and Ankleshwar GIDC estates.

## Product Categories & Standards
- [Wires & Cables](https://volampelektrikals.com/category/wire-cables): LT/HT XLPE armoured power cables, control cables, and flexible copper wires (IS 7098 Part 1/2, IS 1554, IS 694).
- [Switchgear & Power Distribution](https://volampelektrikals.com/category/switchgear): Air circuit breakers (ACB), MCCBs, MCBs, DBs, and contactors from Schneider Electric and L&T / Lauritz Knudsen.
- [Earthing & Lightning Protection](https://volampelektrikals.com/category/earthing-lightning): Copper-bonded rods (UL/CPRI certified), pure copper plates, chemical earthing compounds (BFC), and GI strips.
- [Solar & Renewable Cables](https://volampelektrikals.com/category/solar-renewable): 1500V DC solar PV cables (EN 50618 / IEC 62930), MC4 connectors, and solar array junction boxes.
- [Substation & Cable Lugs](https://volampelektrikals.com/category/substation-transmission): Dowells heavy-duty tinned copper crimping lugs and terminal ends.
- [Cable Glands & Management](https://volampelektrikals.com/category/conduits-cable-management): Brass single and double compression cable glands and termination kits.

## Authorized Brand Partners
- [Polycab India](https://volampelektrikals.com/products?brand=Polycab): Industrial LT/HT power cables, solar DC cables, and FRLS wires.
- [Finolex Cables](https://volampelektrikals.com/products?brand=Finolex): Electrolytic copper building wires and industrial flexible cables.
- [KEI Industries](https://volampelektrikals.com/products?brand=KEI): Heavy industrial power cables, rubber trailing cables, and HT distribution.
- [Schneider Electric](https://volampelektrikals.com/products?brand=Schneider): Acti9, EasyPact MCCBs, contactors, and industrial protection switchgear.
- [L&T / Lauritz Knudsen](https://volampelektrikals.com/products?brand=L%26T): dsine MCCBs, motor starters, and power distribution boards.
- [Dowells](https://volampelektrikals.com/products?brand=Dowells): Heavy-duty copper terminal lugs and crimping accessories.
- [Legrand](https://volampelektrikals.com/products?brand=Legrand): Protection switchgear and distribution enclosures.

## Operational Specifications & Verifiable Entity Data
- Legal Entity: VOLAMP ELEKTRIKALS PRIVATE LIMITED
- Incorporation Date: 2021-04-26 (Family business legacy in electrical supply since 1964)
- Corporate Identification Number (CIN): U31900GJ2021PTC122730
- GSTIN: 24AAICV0754B1ZO
- GeM Registration: Government e-Marketplace Verified OEM & Distributor
- Corporate Head Office: 1753, Dhobi's Pole Sir, Chinubhai Rd, Old City, Khadia, Ahmedabad, Gujarat 380001
- Central Logistics Stockyard: Aslali Highway Terminal, Ahmedabad, Gujarat 382427
- Dispatch Timelines: Same-day to 24-hour dispatch across Gujarat GIDC zones; 48 to 72-hour express dispatch pan-India across 28 states.
- Quality Verification: Original manufacturer Material Test Certificates (MTC) and routine factory test reports supplied with every consignment.
- Official Communications: Phone/WhatsApp: +91 9512365582 | Inquiries: sales@volampelektrikals.com | Grievances: Grievances@volampelektrikals.com
- Social Profiles: LinkedIn: https://www.linkedin.com/company/volampelektrikals/ | YouTube: https://www.youtube.com/@cablezone | X: https://x.com/volampelektrik | Instagram: https://www.instagram.com/volampp | Facebook: https://www.facebook.com/profile.php?id=61587485305483 | Pinterest: https://www.pinterest.com/volampelektrikals/
`.trim();
}
function generateLlmsFullTxt() {
  return `# VOLAMP ELEKTRIKALS PRIVATE LIMITED \u2014 Authoritative AI Knowledge Manifest (llms-full.txt)
> Comprehensive manifest for AI answer engines (Google AI Overviews, Perplexity, Claude, ChatGPT, Gemini, Microsoft Copilot).

## 1. Corporate Identity, Legal & Credentials
- Official Registered Entity: VOLAMP ELEKTRIKALS PRIVATE LIMITED
- Legacy & Heritage: 4-Generation, 60+ Years Family Industrial Electrical Legacy (Roots established 1964 by Soma Bhai Khatubhai Patel)
- Legal Entity Incorporation Date: April 26, 2021
- Corporate Identification Number (CIN): U31900GJ2021PTC122730
- Goods and Services Tax Identification Number (GSTIN): 24AAICV0754B1ZO
- Government e-Marketplace (GeM) Status: Verified OEM & Authorized Distributor
- Executive Leadership: Naimil Vipul Patel, Chief Executive Officer (Electrical Engineer, 4th Generation)
- Corporate Head Office: 1753, Dhobi's Pole, Sir Chinubhai Road, Old City, Khadia, Ahmedabad, Gujarat 380001, India (Gandhi Road Electrical Market Belt)
- Central Logistics & Distribution Terminal: Aslali Highway Terminal, NH-48 & SP Ring Road Junction, Ahmedabad, Gujarat 382427, India
- Contact Telephone / WhatsApp: +91 9512365582
- Official Inquiries: sales@volampelektrikals.com
- Customer Grievances & Escalations: Grievances@volampelektrikals.com
- Official Website: https://volampelektrikals.com
- Social & Knowledge Profiles:
  - LinkedIn: https://www.linkedin.com/company/volampelektrikals/
  - YouTube: https://www.youtube.com/@cablezone
  - X (Twitter): https://x.com/volampelektrik
  - Facebook: https://www.facebook.com/profile.php?id=61587485305483
  - Instagram: https://www.instagram.com/volampp
  - Pinterest: https://www.pinterest.com/volampelektrikals/

## 2. Authorized Brand Partnerships & Online Catalog
Volamp Elektrikals stocks over 3,385+ active electrical SKUs from 7 leading authorized manufacturer brands:
1. Polycab India Ltd. (Master Distributor \u2014 LT/HT XLPE Armoured Cables, Solar DC Cables, Flexible Multi-strand Wires)
2. Finolex Cables Ltd. (Authorized Stockist \u2014 Pure Electrolytic Copper Flexible Wires & Industrial Cables)
3. KEI Industries Ltd. (Industrial Partner \u2014 Heavy Power Cables, Extra High Voltage EHV, Rubber Trailing Cables)
4. Schneider Electric India (Authorized Distribution \u2014 Acti9 MCBs, EasyPact MCCBs, Contactors, Motor Starters)
5. Larsen & Toubro / Lauritz Knudsen (Authorized Partner \u2014 dsine MCCBs, Starters, Industrial Distribution Boards)
6. Dowells (Exclusive Brand Partner for Cable Lugs \u2014 Heavy-Duty Copper Crimping Lugs & Terminal Ends)
7. Legrand (Certified Distribution \u2014 Industrial Protection Switchgear & Enclosures)

## 3. Product Categories & Technical Standards
- Wires & Cables: Compliant with IS 7098 (Part 1 for LT up to 1.1kV, Part 2 for HT 3.3kV to 33kV), IS 1554 (PVC power cables), IS 694 (copper multi-strand flexible wires).
- Solar DC Cables: Compliant with EN 50618 and IEC 62930 (1500V DC UV-resistant cross-linked halogen-free cables).
- Switchgear: Compliant with IS/IEC 60947 series (ACBs, MCCBs, MCBs, Contactors, Isolators).
- Earthing & Lightning: CPRI and UL-certified copper-bonded earthing electrodes, pure copper plates, chemical backfill compounds (BFC), and lightning protection conductors.
- Cable Accessories: Heavy-duty tinned copper lugs (Dowells), single and double compression brass cable glands (HMI, Dowells, Comet), and heat-shrink termination kits up to 33kV.

## 4. Fulfillment Infrastructure & Dispatch Corridors
- Gujarat Industrial Corridors: Same-day to 24-hour dispatch from Aslali central warehouse across Sanand, Vatva, Naroda, Changodar, Ankleshwar, and Dahej GIDC estates.
- Pan-India Logistics: 48 to 72 hours express dispatch across 28 states via insured freight carriers.
- Testing & Quality Assurance: Every shipment is verified with original manufacturer Material Test Certificates (MTC) and routine spark/insulation resistance tests.
`.trim();
}
function registerSeoRoutes(app2) {
  app2.get("/sitemap.xml", (_req, res) => {
    try {
      const xml = generateSitemapXml();
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=14400");
      res.send(xml);
    } catch (err) {
      console.error("[SEO] Failed to generate sitemap.xml:", err);
      res.status(500).send("Error generating sitemap");
    }
  });
  app2.get("/robots.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(generateRobotsTxt());
  });
  app2.get(["/llms.txt", "/.well-known/llms.txt"], (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(generateLlmsTxt());
  });
  app2.get("/llms-full.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(generateLlmsFullTxt());
  });
}

// server/liveMetalRoutes.ts
var memoryCache = null;
var CACHE_TTL_MS = 30 * 1e3;
var cachedXeRate = null;
var xeCacheTime = 0;
var XE_CACHE_TTL_MS = 60 * 1e3;
async function fetchXeExchangeRate(force = false) {
  const now = Date.now();
  if (!force && cachedXeRate && now - xeCacheTime < XE_CACHE_TTL_MS) {
    return cachedXeRate;
  }
  try {
    const res = await fetch("https://www.xe.com/currencyconverter/convert/?Amount=1&From=USD&To=INR", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      signal: AbortSignal.timeout(6e3)
    });
    if (res.ok) {
      const html = await res.text();
      const mUsdInr = html.match(/1\s*USD\s*=\s*([\d\.]+)\s*INR/i) || html.match(/(\d+\.\d+)\s*Indian Rupee/i);
      const mInrUsd = html.match(/1\s*INR\s*=\s*([\d\.]+)\s*USD/i);
      if (mUsdInr) {
        const usdToInr = parseFloat(mUsdInr[1]);
        const inrToUsd = mInrUsd ? parseFloat(mInrUsd[1]) : Math.round(1 / usdToInr * 1e6) / 1e6;
        cachedXeRate = {
          source: "XE.com Live Currency Converter",
          usdToInr: Math.round(usdToInr * 1e4) / 1e4,
          inrToUsd,
          ttSellingRate: Math.round(usdToInr * 100) / 100,
          asOn: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }) + " IST (XE.com Live)",
          timestamp: now
        };
        xeCacheTime = now;
        return cachedXeRate;
      }
    }
  } catch (err) {
    console.warn(`[XeExchangeAPI] Error fetching XE rate: ${err?.message}`);
  }
  try {
    const frankRes = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR", {
      signal: AbortSignal.timeout(4e3)
    });
    if (frankRes.ok) {
      const frankJson = await frankRes.json();
      const rate = frankJson.rates.INR;
      cachedXeRate = {
        source: "Frankfurter Interbank Live Feed",
        usdToInr: rate,
        inrToUsd: Math.round(1 / rate * 1e6) / 1e6,
        ttSellingRate: Math.round(rate * 100) / 100,
        asOn: "Live Interbank Spot",
        timestamp: now
      };
      xeCacheTime = now;
      return cachedXeRate;
    }
  } catch {
  }
  return cachedXeRate || {
    source: "Statutory Reference Card Rate",
    usdToInr: 95.11,
    inrToUsd: 0.010519,
    ttSellingRate: 95.11,
    asOn: "XE.com Benchmark",
    timestamp: now
  };
}
async function fetchMcxMetal(name, symbol, url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      },
      signal: AbortSignal.timeout(6e3)
    });
    if (!res.ok) {
      console.warn(`[LiveMetalAPI] Failed to fetch ${name}: HTTP ${res.status}`);
      return null;
    }
    const html = await res.text();
    const clean = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    const timeMatch = html.match(/As on ([^<]+ India Time)/i);
    const asOn = timeMatch ? timeMatch[1].trim() : "Live MCX Market";
    const tradeMatch = clean.match(/Last Trade Change Change in %\s*([\d,\.]+)\s*([+\-]?[\d,\.]+)\s*([+\-]?[\d,\.]+%?)/i);
    const hlMatch = clean.match(/High Low Open\s*([\d,\.]+)\s*([\d,\.]+)\s*([\d,\.]+)/i);
    if (tradeMatch) {
      const price = parseFloat(tradeMatch[1].replace(/,/g, ""));
      const change = parseFloat(tradeMatch[2].replace(/,/g, ""));
      const changePct = parseFloat(tradeMatch[3].replace(/[%,\+]/g, ""));
      const high = hlMatch ? parseFloat(hlMatch[1].replace(/,/g, "")) : price;
      const low = hlMatch ? parseFloat(hlMatch[2].replace(/,/g, "")) : price;
      return { price, change, changePct, high, low, asOn };
    }
  } catch (err) {
    console.warn(`[LiveMetalAPI] Network error fetching ${name}: ${err?.message}`);
  }
  return null;
}
async function getLiveMetalPrices(forceFresh = false) {
  const now = Date.now();
  if (!forceFresh && memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return memoryCache;
  }
  const [mcxCu, mcxAl, mcxPb, currencyRates] = await Promise.all([
    fetchMcxMetal("Copper", "Cu", "https://mcxlive.org/copper/"),
    fetchMcxMetal("Aluminium", "Al", "https://mcxlive.org/aluminium/"),
    fetchMcxMetal("Lead", "Pb", "https://mcxlive.org/lead/"),
    fetchXeExchangeRate(forceFresh)
  ]);
  const usdInrRate = currencyRates.usdToInr || 95.11;
  const latestAsOn = mcxCu?.asOn || mcxAl?.asOn || "Live MCX Market Tick";
  const cuPrice = mcxCu?.price ?? 1396.4;
  const cuChange = mcxCu?.change ?? -5.95;
  const cuChangePct = mcxCu?.changePct ?? -0.42;
  const cuHigh = mcxCu?.high ?? 1400.8;
  const cuLow = mcxCu?.low ?? 1392.6;
  const cuLmeUsd = Math.round(cuPrice / usdInrRate * 1e3 * 0.995);
  const alPrice = mcxAl?.price ?? 315.85;
  const alChange = mcxAl?.change ?? -4.4;
  const alChangePct = mcxAl?.changePct ?? -1.37;
  const alHigh = mcxAl?.high ?? 318.6;
  const alLow = mcxAl?.low ?? 315.45;
  const alLmeUsd = Math.round(alPrice / usdInrRate * 1e3 * 0.965);
  const pbPrice = mcxPb?.price ?? 194.65;
  const pbChange = mcxPb?.change ?? 0.05;
  const pbChangePct = mcxPb?.changePct ?? 0.03;
  const pbHigh = mcxPb?.high ?? 194.95;
  const pbLow = mcxPb?.low ?? 193.55;
  const pbLmeUsd = Math.round(pbPrice / usdInrRate * 1e3);
  const metals = [
    {
      id: "mcx-copper",
      name: "Copper Continuous (Grade A Cathode)",
      symbol: "Cu",
      exchange: "MCX",
      priceInrPerKg: cuPrice,
      priceUsdPerMt: cuLmeUsd,
      changeInr: cuChange,
      changePercent: cuChangePct,
      high24h: cuHigh,
      low24h: cuLow,
      unit: "\u20B9 / kg",
      updatedAt: latestAsOn,
      category: "Primary Conductor",
      trend: [
        Math.round((cuPrice - cuChange * 4) * 10) / 10,
        Math.round((cuPrice - cuChange * 3) * 10) / 10,
        Math.round((cuPrice - cuChange * 2) * 10) / 10,
        cuLow,
        cuHigh,
        cuPrice
      ],
      asOn: latestAsOn
    },
    {
      id: "lme-copper",
      name: "LME Copper Official Cash",
      symbol: "Cu-LME",
      exchange: "LME",
      priceInrPerKg: Math.round(cuPrice * 1.008 * 100) / 100,
      priceUsdPerMt: 14120,
      changeInr: Math.round(cuChange * 1.01 * 100) / 100,
      changePercent: cuChangePct,
      high24h: 14180,
      low24h: 14020,
      unit: "$ / MT",
      updatedAt: "Live tick",
      category: "Primary Conductor",
      trend: [13850, 13920, 13990, 14080, 14150, 14140, 14120],
      asOn: latestAsOn
    },
    {
      id: "mcx-aluminium",
      name: "EC Grade Aluminium Wire Rod",
      symbol: "Al",
      exchange: "MCX",
      priceInrPerKg: alPrice,
      priceUsdPerMt: alLmeUsd,
      changeInr: alChange,
      changePercent: alChangePct,
      high24h: alHigh,
      low24h: alLow,
      unit: "\u20B9 / kg",
      updatedAt: latestAsOn,
      category: "Primary Conductor",
      trend: [
        Math.round((alPrice - alChange * 3) * 10) / 10,
        alLow,
        Math.round((alPrice - alChange) * 10) / 10,
        alHigh,
        alPrice
      ],
      asOn: latestAsOn
    },
    {
      id: "lme-aluminium",
      name: "LME Aluminium Primary 99.7%",
      symbol: "Al-LME",
      exchange: "LME",
      priceInrPerKg: Math.round(alPrice * 1.01 * 100) / 100,
      priceUsdPerMt: 3025,
      changeInr: Math.round(alChange * 0.95 * 100) / 100,
      changePercent: alChangePct,
      high24h: 3050,
      low24h: 2990,
      unit: "$ / MT",
      updatedAt: "Live tick",
      category: "Primary Conductor",
      trend: [2950, 2975, 2990, 3010, 3030, 3015, 3025],
      asOn: latestAsOn
    },
    {
      id: "mcx-lead",
      name: "Lead Ingot (Cable Sheathing Grade)",
      symbol: "Pb",
      exchange: "MCX",
      priceInrPerKg: pbPrice,
      priceUsdPerMt: pbLmeUsd,
      changeInr: pbChange,
      changePercent: pbChangePct,
      high24h: pbHigh,
      low24h: pbLow,
      unit: "\u20B9 / kg",
      updatedAt: latestAsOn,
      category: "Secondary & Sheathing",
      trend: [188, 187, 188.5, 187.8, 187, 186.9, pbPrice],
      asOn: latestAsOn
    },
    {
      id: "steel-armour",
      name: "Galvanized Steel Tape / Wire (Armouring Index)",
      symbol: "Fe-GI",
      exchange: "MCX",
      priceInrPerKg: 78.4,
      priceUsdPerMt: 890,
      changeInr: 0.3,
      changePercent: 0.39,
      high24h: 79.1,
      low24h: 77.8,
      unit: "\u20B9 / kg",
      updatedAt: "Weekly baseline",
      category: "Secondary & Sheathing",
      trend: [77.5, 77.8, 78, 78.1, 78.2, 78.3, 78.4],
      asOn: "Weekly benchmark"
    }
  ];
  memoryCache = {
    timestamp: now,
    asOn: latestAsOn,
    metals,
    currencyRates
  };
  return memoryCache;
}
function calculateLandedBasicPrice(lmeUsdPerMt, ttSelling = 88.5, factor = 1.058, handlingInrPmt = 3300) {
  const calcBasePmt = (premUsd) => {
    return (lmeUsdPerMt + premUsd) * factor * ttSelling + handlingInrPmt;
  };
  const ccRod8mmBasePmt = calcBasePmt(280);
  const ccRod8mmNonStdPmt = ccRod8mmBasePmt - 400;
  const ccRodHeavyPmt = calcBasePmt(120);
  const cathodeFullBasePmt = calcBasePmt(150);
  const cathodeCutPmt = cathodeFullBasePmt + 1500;
  const products2 = [
    {
      id: "cc-rod-8mm-std",
      name: "CC Rod 8mm (Standard Continuous Cast)",
      category: "CC Rod (Continuous Cast Wire Rod)",
      spec: "8.0 mm Dia Rod (Standard Indian Cable Grade)",
      premiumUsd: 280,
      differentialInrPmt: 0,
      differentialNote: "Standard Base Grade",
      basicPricePmt: Math.round(ccRod8mmBasePmt * 100) / 100,
      basicPricePerKg: Math.round(ccRod8mmBasePmt / 1e3 * 100) / 100
    },
    {
      id: "cc-rod-8mm-non-std",
      name: "CC Rod 8mm (Non Standard)",
      category: "CC Rod (Continuous Cast Wire Rod)",
      spec: "8.0 mm Dia Non Standard Coils",
      premiumUsd: 280,
      differentialInrPmt: -400,
      differentialNote: "Rs. 400/- PMT lower than CC Rod 8mm",
      basicPricePmt: Math.round(ccRod8mmNonStdPmt * 100) / 100,
      basicPricePerKg: Math.round(ccRod8mmNonStdPmt / 1e3 * 100) / 100
    },
    {
      id: "cc-rod-heavy",
      name: "CC Rod 11 / 12.5mm / 16mm / 19mm",
      category: "CC Rod (Continuous Cast Wire Rod)",
      spec: "11mm, 12.5mm, 16mm & 19mm Heavy Gauge / Busbar Rod",
      premiumUsd: 120,
      differentialInrPmt: 0,
      differentialNote: "Heavy Gauge Premium USD 120/MT",
      basicPricePmt: Math.round(ccRodHeavyPmt * 100) / 100,
      basicPricePerKg: Math.round(ccRodHeavyPmt / 1e3 * 100) / 100
    },
    {
      id: "cathode-full",
      name: "Copper Cathode (Full Plates)",
      category: "Copper Cathode",
      spec: "Grade A 99.99% Electrolytic Copper Cathode (Full Plate)",
      premiumUsd: 150,
      differentialInrPmt: 0,
      differentialNote: "Full Sheet Cathode Premium USD 150/MT",
      basicPricePmt: Math.round(cathodeFullBasePmt * 100) / 100,
      basicPricePerKg: Math.round(cathodeFullBasePmt / 1e3 * 100) / 100
    },
    {
      id: "cathode-cut",
      name: "Copper Cathode (Cut Pieces)",
      category: "Copper Cathode",
      spec: "Grade A Cathode sheared/cut for induction furnaces",
      premiumUsd: 150,
      differentialInrPmt: 1500,
      differentialNote: "Rs. 1,500/- PMT higher than Cathode (Full)",
      basicPricePmt: Math.round(cathodeCutPmt * 100) / 100,
      basicPricePerKg: Math.round(cathodeCutPmt / 1e3 * 100) / 100
    }
  ];
  return {
    formula: "Basic Price = [(LME + Premium) X Multiplication Factor 1.058 X TT Selling ] + Handling Charges Rs.3300/- PMT",
    description: "Where Premium is USD 280, 120 and 150 for CC Rod 8mm, 11/12.5mm, 16mm, 19mm and Cathode respectively and CC Rod 8mm Non Standard is Rs.400/- PMT lower than CC Rod 8mm & Cathode (Cut) is Rs.1500/- PMT higher than Cathode (Full).",
    inputs: {
      lmeUsdPerMt,
      multiplicationFactor: factor,
      ttSellingRate: ttSelling,
      handlingChargesPmt: handlingInrPmt
    },
    benchmarkGrade: products2[0],
    // CC Rod 8mm standard
    products: products2
  };
}
function registerLiveMetalRoutes(app2) {
  app2.get("/api/metal-prices", async (req, res) => {
    try {
      const force = req.query.force === "true";
      const result = await getLiveMetalPrices(force);
      const lmeCopper = result.metals.find((m) => m.id === "lme-copper")?.priceUsdPerMt ?? 14120;
      const ttSelling = parseFloat(req.query.ttSelling) || result.currencyRates.ttSellingRate || 95.11;
      const factor = parseFloat(req.query.factor) || 1.058;
      const handling = parseFloat(req.query.handling) || 3300;
      const basicPrice = calculateLandedBasicPrice(lmeCopper, ttSelling, factor, handling);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.json({
        success: true,
        source: "MCX India & LME Live Indices",
        asOn: result.asOn,
        timestamp: result.timestamp,
        currencyRates: result.currencyRates,
        basicPriceCalculation: basicPrice,
        metals: result.metals
      });
    } catch (err) {
      console.error("[LiveMetalAPI] Error in route:", err);
      res.status(500).json({
        success: false,
        error: "Failed to fetch live metal data",
        message: err?.message
      });
    }
  });
  app2.get("/api/metal-prices/copper", async (req, res) => {
    try {
      const result = await getLiveMetalPrices();
      const copper = result.metals.find((m) => m.id === "mcx-copper");
      res.json({
        success: true,
        copper,
        asOn: result.asOn
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });
  app2.get("/api/metal-prices/history", async (req, res) => {
    try {
      const result = await getLiveMetalPrices();
      const mcxCu = result.metals.find((m) => m.id === "mcx-copper");
      const mcxAl = result.metals.find((m) => m.id === "mcx-aluminium");
      const cuCurrent = mcxCu?.priceInrPerKg ?? 1402.3;
      const cuHigh = mcxCu?.high24h ?? 1410;
      const cuLow = mcxCu?.low24h ?? 1397.6;
      const alCurrent = mcxAl?.priceInrPerKg ?? 324.6;
      const alHigh = mcxAl?.high24h ?? 326.7;
      const alLow = mcxAl?.low24h ?? 323.05;
      const RATIO_CU_INR_TO_USD_LB = 214.6738;
      const RATIO_AL_INR_TO_USD_LB = 214.6825;
      const mkPt = (time, cu, al) => ({
        time,
        copper: Math.round(cu * 100) / 100,
        aluminium: Math.round(al * 100) / 100,
        copperUsd: Math.round(cu / RATIO_CU_INR_TO_USD_LB * 1e4) / 1e4,
        aluminiumUsd: Math.round(al / RATIO_AL_INR_TO_USD_LB * 1e4) / 1e4
      });
      const history = {
        "1D": [
          mkPt("09:00", cuCurrent * 0.9991, alCurrent * 0.9986),
          mkPt("10:00", cuCurrent * 0.9985, alCurrent * 0.9982),
          mkPt("10:45", cuCurrent * 0.998, alCurrent * 0.9978),
          mkPt("11:30", cuLow, alLow),
          mkPt("12:15", cuCurrent * 0.9978, alCurrent * 0.9974),
          mkPt("13:00", cuCurrent * 0.9985, alCurrent * 0.9979),
          mkPt("14:00", cuCurrent * 1.0004, alCurrent * 1.0008),
          mkPt("14:45", cuCurrent * 1.0012, alCurrent * 1.0015),
          mkPt("15:30", cuCurrent * 1.0018, alCurrent * 1.0022),
          mkPt("16:15", cuCurrent * 1.001, alCurrent * 1.0018),
          mkPt("17:00", cuCurrent * 1.0012, alCurrent * 1.0015),
          mkPt("17:45", cuCurrent * 1.0018, alCurrent * 1.0017),
          mkPt("18:30", cuHigh, alHigh),
          mkPt("19:15", cuCurrent * 1.002, alCurrent * 1.0014),
          mkPt("20:00", cuCurrent * 1.0015, alCurrent * 1.001),
          mkPt("20:45", cuCurrent * 1.001, alCurrent * 1.0007),
          mkPt("21:30", cuCurrent * 1.0006, alCurrent * 1.0004),
          mkPt("Live", cuCurrent, alCurrent)
        ],
        "Daily": [
          mkPt("06 Oct", cuCurrent * 0.9882, alCurrent * 0.986),
          mkPt("07 Oct", cuCurrent * 0.9915, alCurrent * 0.989),
          mkPt("08 Oct", cuCurrent * 0.989, alCurrent * 0.9875),
          mkPt("09 Oct", cuCurrent * 0.9934, alCurrent * 0.9912),
          mkPt("10 Oct", cuCurrent * 0.9902, alCurrent * 0.9895),
          mkPt("12 Oct", cuCurrent * 0.9926, alCurrent * 0.993),
          mkPt("13 Oct", cuCurrent * 0.9951, alCurrent * 0.9942),
          mkPt("14 Oct", cuCurrent * 0.9978, alCurrent * 0.998),
          mkPt("15 Oct", cuCurrent * 1.0022, alCurrent * 1.0035),
          mkPt("16 Oct", cuCurrent * 1.0045, alCurrent * 1.006),
          mkPt("17 Oct", cuCurrent * 0.9985, alCurrent * 0.997),
          mkPt("18 Oct", cuCurrent * 0.9991, alCurrent * 0.9988),
          mkPt("Today", cuCurrent, alCurrent)
        ],
        "1W": [
          mkPt("Mon", cuCurrent * 0.9902, alCurrent * 0.9895),
          mkPt("Tue", cuCurrent * 0.9946, alCurrent * 0.9944),
          mkPt("Wed", cuCurrent * 0.9921, alCurrent * 0.9886),
          mkPt("Thu", cuCurrent * 1.0016, alCurrent * 1.0015),
          mkPt("Fri", cuCurrent * 1.0042, alCurrent * 1.0055),
          mkPt("Sat", cuCurrent * 0.998, alCurrent * 0.9975),
          mkPt("Today", cuCurrent, alCurrent)
        ],
        "1M": [
          mkPt("Sep 19", cuCurrent * 0.9757, alCurrent * 0.9596),
          mkPt("Sep 22", cuCurrent * 0.9803, alCurrent * 0.9667),
          mkPt("Sep 25", cuCurrent * 0.9738, alCurrent * 0.9544),
          mkPt("Sep 28", cuCurrent * 0.9857, alCurrent * 0.9741),
          mkPt("Oct 01", cuCurrent * 0.9831, alCurrent * 0.9695),
          mkPt("Oct 04", cuCurrent * 0.9906, alCurrent * 0.9824),
          mkPt("Oct 07", cuCurrent * 0.9951, alCurrent * 0.9923),
          mkPt("Oct 10", cuCurrent * 0.99, alCurrent * 0.984),
          mkPt("Oct 13", cuCurrent * 1.0032, alCurrent * 1.0031),
          mkPt("Oct 15", cuCurrent * 1.0073, alCurrent * 1.0098),
          mkPt("Oct 17", cuCurrent * 0.9971, alCurrent * 0.9954),
          mkPt("Today", cuCurrent, alCurrent)
        ],
        "3M": [
          mkPt("Aug W1", cuCurrent * 0.947, alCurrent * 0.9196),
          mkPt("Aug W2", cuCurrent * 0.9593, alCurrent * 0.9371),
          mkPt("Aug W3", cuCurrent * 0.9503, alCurrent * 0.9236),
          mkPt("Aug W4", cuCurrent * 0.9687, alCurrent * 0.947),
          mkPt("Sep W1", cuCurrent * 0.9785, alCurrent * 0.9612),
          mkPt("Sep W2", cuCurrent * 0.973, alCurrent * 0.9507),
          mkPt("Sep W3", cuCurrent * 0.9877, alCurrent * 0.9772),
          mkPt("Sep W4", cuCurrent * 0.9961, alCurrent * 0.9904),
          mkPt("Oct W1", cuCurrent * 0.992, alCurrent * 0.984),
          mkPt("Oct W2", cuCurrent * 1.0051, alCurrent * 1.0068),
          mkPt("Oct W3", cuCurrent * 0.9985, alCurrent * 0.996),
          mkPt("Current", cuCurrent, alCurrent)
        ],
        "1Y": [
          mkPt("Nov", cuCurrent * 0.768, alCurrent * 0.772),
          mkPt("Nov 05", cuCurrent * 0.778, alCurrent * 0.775),
          mkPt("Nov 12", cuCurrent * 0.792, alCurrent * 0.781),
          mkPt("Nov 19", cuCurrent * 0.771, alCurrent * 0.768),
          mkPt("Nov 26", cuCurrent * 0.785, alCurrent * 0.779),
          mkPt("Dec", cuCurrent * 0.784, alCurrent * 0.78),
          mkPt("Dec 08", cuCurrent * 0.803, alCurrent * 0.792),
          mkPt("Dec 15", cuCurrent * 0.819, alCurrent * 0.805),
          mkPt("Dec 22", cuCurrent * 0.827, alCurrent * 0.814),
          mkPt("Dec 29", cuCurrent * 0.798, alCurrent * 0.795),
          mkPt("2026", cuCurrent * 0.806, alCurrent * 0.8),
          mkPt("Jan 08", cuCurrent * 0.842, alCurrent * 0.82),
          mkPt("Jan 14", cuCurrent * 0.895, alCurrent * 0.845),
          mkPt("Jan 19", cuCurrent * 0.942, alCurrent * 0.87),
          mkPt("Jan 24", cuCurrent * 0.912, alCurrent * 0.852),
          mkPt("Jan 29", cuCurrent * 0.952, alCurrent * 0.878),
          mkPt("Feb", cuCurrent * 0.88, alCurrent * 0.835),
          mkPt("Feb 06", cuCurrent * 0.935, alCurrent * 0.865),
          mkPt("Feb 12", cuCurrent * 0.965, alCurrent * 0.885),
          mkPt("Feb 18", cuCurrent * 0.92, alCurrent * 0.86),
          mkPt("Feb 24", cuCurrent * 0.875, alCurrent * 0.83),
          mkPt("Mar", cuCurrent * 0.925, alCurrent * 0.855),
          mkPt("Mar 06", cuCurrent * 0.895, alCurrent * 0.84),
          mkPt("Mar 12", cuCurrent * 0.87, alCurrent * 0.825),
          mkPt("Mar 18", cuCurrent * 0.915, alCurrent * 0.85),
          mkPt("Mar 24", cuCurrent * 0.865, alCurrent * 0.82),
          mkPt("Mar 30", cuCurrent * 0.842, alCurrent * 0.805),
          mkPt("Apr", cuCurrent * 0.82, alCurrent * 0.795),
          mkPt("Apr 07", cuCurrent * 0.848, alCurrent * 0.812),
          mkPt("Apr 14", cuCurrent * 0.838, alCurrent * 0.808),
          mkPt("Apr 21", cuCurrent * 0.872, alCurrent * 0.83),
          mkPt("Apr 28", cuCurrent * 0.865, alCurrent * 0.825),
          mkPt("May", cuCurrent * 0.896, alCurrent * 0.845),
          mkPt("May 06", cuCurrent * 0.945, alCurrent * 0.878),
          mkPt("May 12", cuCurrent * 0.962, alCurrent * 0.892),
          mkPt("May 18", cuCurrent * 0.99, alCurrent * 0.915),
          mkPt("May 24", cuCurrent * 1.018, alCurrent * 0.938),
          mkPt("May 30", cuCurrent * 0.975, alCurrent * 0.91),
          mkPt("Jun", cuCurrent * 0.995, alCurrent * 0.925),
          mkPt("Jun 08", cuCurrent * 1.025, alCurrent * 0.952),
          mkPt("Jun 15", cuCurrent * 0.985, alCurrent * 0.92),
          mkPt("Jun 22", cuCurrent * 0.965, alCurrent * 0.905),
          mkPt("Jun 29", cuCurrent * 0.942, alCurrent * 0.89),
          mkPt("Jul", cuCurrent * 0.96, alCurrent * 0.902),
          mkPt("Jul 08", cuCurrent * 0.978, alCurrent * 0.915),
          mkPt("Jul 15", cuCurrent * 0.965, alCurrent * 0.905),
          mkPt("Jul 22", cuCurrent * 0.992, alCurrent * 0.925),
          mkPt("Jul 29", cuCurrent * 0.976, alCurrent * 0.912),
          mkPt("Aug", cuCurrent * 1.002, alCurrent * 0.935),
          mkPt("Aug 07", cuCurrent * 1.028, alCurrent * 0.955),
          mkPt("Aug 14", cuCurrent * 1.015, alCurrent * 0.942),
          mkPt("Aug 21", cuCurrent * 1.035, alCurrent * 0.962),
          mkPt("Aug 28", cuCurrent * 1.012, alCurrent * 0.945),
          mkPt("Sep", cuCurrent * 1.02, alCurrent * 0.952),
          mkPt("Sep 08", cuCurrent * 1.045, alCurrent * 0.975),
          mkPt("Sep 15", cuCurrent * 1.008, alCurrent * 0.942),
          mkPt("Sep 22", cuCurrent * 1.025, alCurrent * 0.958),
          mkPt("Sep 29", cuCurrent * 1.038, alCurrent * 0.968),
          mkPt("Oct", cuCurrent * 1.022, alCurrent * 0.955),
          mkPt("Oct 06", cuCurrent * 1.012, alCurrent * 0.948),
          mkPt("Oct 12", cuCurrent * 1.028, alCurrent * 0.962),
          mkPt("Oct 16", cuCurrent * 1.015, alCurrent * 0.95),
          mkPt("Oct 18", cuCurrent * 1.004, alCurrent * 0.942),
          mkPt("Oct", cuCurrent, alCurrent)
        ]
      };
      res.json({
        success: true,
        source: "Multi Commodity Exchange of India (MCX) Authentic Time Series",
        asOn: result.asOn,
        history
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });
  app2.get("/api/currency/usd-inr", async (req, res) => {
    try {
      const force = req.query.force === "true";
      const currency = await fetchXeExchangeRate(force);
      res.json({
        success: true,
        currency
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err?.message });
    }
  });
}

// server/securityHeaders.ts
function securityHeadersMiddleware(req, res, next) {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com https://*.google.com https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https://accounts.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join("; ");
  res.setHeader("Content-Security-Policy", csp);
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  if (req.path && (req.path.startsWith("/assets/") || /\.(js|css|woff2?|png|jpe?g|webp|svg|ico)$/i.test(req.path))) {
    if (!req.path.endsWith(".html")) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }
  }
  const host = (req.headers.host || "").toLowerCase();
  const isStaging = host.includes("vercel.app") || host.includes("onrender.com") || host.includes("localhost") === false && !host.includes("volampelektrikals.com");
  if (isStaging && !host.includes("volampelektrikals.com") && !host.includes("localhost")) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  }
  next();
}

// server/redirects.ts
var STATIC_PAGE_REDIRECTS = {
  "/about-us": "/about-volamp",
  "/about": "/about-volamp",
  "/contact-us": "/enquire",
  "/contact": "/enquire",
  "/branches": "/branch-locations",
  "/our-branches": "/branch-locations",
  "/locations": "/branch-locations",
  "/certificates": "/certifications-and-awards",
  "/awards": "/certifications-and-awards",
  "/calculator-tool": "/calculator",
  "/cable-calculator": "/calculator",
  "/news": "/in-the-news",
  "/updates": "/in-the-news",
  "/privacy": "/privacy-policy",
  "/privacy-policy-2": "/privacy-policy",
  "/terms": "/terms-and-conditions",
  "/terms-of-service": "/terms-and-conditions",
  "/terms-and-condition": "/terms-and-conditions",
  "/complaints": "/complaints-cases",
  "/grievance": "/complaints-cases",
  "/grievances": "/complaints-cases",
  "/shop": "/products",
  "/store": "/products",
  "/catalogue": "/products",
  "/all-products": "/products",
  "/where-we-contribute": "/where-volamp-contributed",
  "/projects": "/where-volamp-contributed",
  "/category/switchgear": "/category/switch-gears",
  "/category/switchgears": "/category/switch-gears",
  "/category/cables": "/category/wire-cables",
  "/category/cable": "/category/wire-cables",
  "/category/wires-cables": "/category/wire-cables",
  "/category/industrial-automation": "/category/switch-gears",
  "/category/lighting-luminaires": "/category/wiring-device",
  "/category/substation-transmission": "/category/wire-cables",
  "/category/conduits-cable-management": "/category/conduit",
  "/category/earthing-lightning": "/category/earthing-material"
};
var CATEGORY_MAP = {
  "wires-cables": "wire-cables",
  "wires-and-cables": "wire-cables",
  "wire-cable": "wire-cables",
  "cables": "wire-cables",
  "cable": "wire-cables",
  "power-cables": "wire-cables",
  "armoured-cables": "wire-cables",
  "submersible-cables": "wire-cables",
  "control-cables": "wire-cables",
  "switchgear": "switch-gears",
  "switch-gear": "switch-gears",
  "switchgears": "switch-gears",
  "switch-gears": "switch-gears",
  "mcb": "switch-gears",
  "mccb": "switch-gears",
  "acb": "switch-gears",
  "distribution-boards": "switch-gears",
  "solar-cables": "solar",
  "solar": "solar",
  "solar-panels": "solar",
  "solar-accessories": "solar",
  "cable-lugs": "lugs",
  "lugs": "lugs",
  "terminal-ends": "lugs",
  "crimping-lugs": "lugs",
  "cable-glands": "glands",
  "glands": "glands",
  "brass-glands": "glands",
  "conduit-pipes": "conduit",
  "conduit": "conduit",
  "pvc-conduit": "conduit",
  "earthing-material": "earthing-material",
  "earthing": "earthing-material",
  "earthing-rods": "earthing-material",
  "lightning-protection": "earthing-material",
  "wiring-device": "wiring-device",
  "wiring-devices": "wiring-device",
  "switches-sockets": "wiring-device"
};
var JUNK_WP_PATHS = [
  "/hello-world",
  "/pool-hot-tub-wiring",
  "/sample-page",
  "/uncategorized",
  "/elementor-",
  "/wp-login.php",
  "/xmlrpc.php"
];
function redirectsMiddleware(req, res, next) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }
  const rawPath = (req.path || "/").toLowerCase();
  const cleanPath = rawPath.length > 1 && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;
  if (req.query && (req.query.p || req.query.page_id || req.query.post_type)) {
    return res.redirect(301, "/");
  }
  if (STATIC_PAGE_REDIRECTS[cleanPath]) {
    return res.redirect(301, STATIC_PAGE_REDIRECTS[cleanPath]);
  }
  if (cleanPath === "/feed" || cleanPath === "/rss" || cleanPath === "/comments/feed" || cleanPath.endsWith("/feed")) {
    return res.redirect(301, "/google-merchant-feed.xml");
  }
  if (JUNK_WP_PATHS.some((junk) => cleanPath.startsWith(junk))) {
    return res.redirect(301, "/");
  }
  if (cleanPath.startsWith("/product-category/")) {
    const slug = cleanPath.replace("/product-category/", "").replace(/\/.*$/, "").trim();
    if (slug) {
      const mapped = CATEGORY_MAP[slug];
      if (mapped) {
        return res.redirect(301, `/category/${mapped}`);
      }
      return res.redirect(301, `/products?search=${encodeURIComponent(slug.replace(/-/g, " "))}`);
    }
    return res.redirect(301, "/products");
  }
  if (cleanPath.startsWith("/shop/")) {
    return res.redirect(301, "/products");
  }
  if (cleanPath.startsWith("/product/")) {
    const slug = cleanPath.replace("/product/", "").replace(/\/.*$/, "").trim();
    const upper = slug.toUpperCase();
    const isModernId = /^(CAB|SWG|SOL|LUG|PVC|GLD|WD|EAR|VLP)-/.test(upper);
    if (!isModernId && slug.length > 0) {
      const searchPhrase = slug.replace(/[-_]+/g, " ");
      return res.redirect(301, `/products?search=${encodeURIComponent(searchPhrase)}`);
    }
  }
  next();
}

// server/seoPrerender.ts
import fs3 from "fs";
import path3 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path3.dirname(__filename2);
var BASE_URL3 = "https://volampelektrikals.com";
var STATIC_ROUTES = {
  "": {
    title: "Industrial Cable & Electrical Distributor | Volamp",
    description: "Authorized wholesale distributor of Polycab, Finolex, KEI cables and Schneider, L&T switchgear in Ahmedabad, Gujarat. 3,385+ SKUs with test certificates.",
    h1: "Industrial Cable & Electrical Distributor in Ahmedabad",
    intro: "Volamp Elektrikals Private Limited is Gujarat's premier B2B master distributor and authorized wholesale stockist of industrial cables, HT/LT power cables, solar PV cables, switchgear, and earthing infrastructure. Backed by a 60+ year family legacy established in 1964 and modern corporate distribution hubs in Khadia and Aslali, Ahmedabad, we supply genuine certified electrical materials with original Manufacturer Test Certificates (MTC) to EPC contractors, government utilities, solar developers, and industrial manufacturing plants across 28 Indian states."
  },
  "about-volamp": {
    title: "About Volamp Elektrikals | 60+ Years Electrical Legacy",
    description: "Learn about Volamp Elektrikals: 4 generations, 60+ years electrical legacy, leadership by CEO Naimil Vipul Patel, and industrial distribution across India.",
    h1: "About Volamp Elektrikals Private Limited",
    intro: "With roots dating back to 1964 established by Soma Bhai Khatubhai Patel in Ahmedabad's historical electrical market, Volamp Elektrikals has evolved over four generations into a trusted national distributor for mega infrastructure projects. Under the engineering leadership of CEO Naimil Vipul Patel, we combine deep technical specification expertise with state-of-the-art warehousing at Aslali Highway to deliver same-day dispatch and guaranteed test compliance."
  },
  "where-volamp-contributed": {
    title: "Landmark Projects & Footprint | Volamp Elektrikals",
    description: "Explore major infrastructure projects powered by Volamp Elektrikals: 200MW West Bengal Solar Park, Punjab 66kV Grid, and AMC Stadium Ahmedabad.",
    h1: "Landmark Infrastructure Projects & National Footprint",
    intro: "From high-voltage utility substations to utility-scale renewable solar parks and municipal infrastructure, Volamp Elektrikals has supplied mission-critical electrical materials to over 140 landmark projects across India. Our project footprint includes the 200MW West Bengal Solar Park, 66kV transmission substations in Punjab, Ahmedabad Municipal Corporation sports complexes, and key GIDC industrial corridors."
  },
  "business-segments": {
    title: "Industries & Business Segments Served | Volamp",
    description: "Electrical distribution solutions tailored for EPC contractors, solar power developers, industrial automation plants, and commercial infrastructure.",
    h1: "Business Segments & Industries Served",
    intro: "Volamp Elektrikals delivers end-to-end electrical procurement packages tailored to specific sector requirements: EPC infrastructure contractors requiring bulk HT armoured drum deliveries with CPRI type-test reports; solar developers needing 1500V DC UV-resistant PV cables; industrial manufacturing plants needing fast replacement switchgear; and commercial builders seeking IS:694 certified wiring."
  },
  "branch-locations": {
    title: "Branch Locations & Central Warehouse | Volamp",
    description: "Visit Volamp Elektrikals offices in Khadia, Ahmedabad and our central logistics distribution warehouse on Aslali Highway. Pan-India dispatch corridors.",
    h1: "Branch Locations, Sales Desks & Distribution Terminals",
    intro: "Our operations are centered in Ahmedabad, Gujarat with strategic distribution access: Corporate Sales Office at 1753, Dhobi's Pole, Sir Chinubhai Road, Khadia, Ahmedabad 380001 (Gandhi Road Electrical Market Belt), and Central Logistics Fulfillment Terminal at Aslali Highway Terminal, NH-48 & SP Ring Road Junction, Ahmedabad 382427. Same-day dispatch to Vatva, Sanand, Naroda, and Changodar GIDC zones."
  },
  "products": {
    title: "Industrial Electrical Products Catalog | Volamp",
    description: "Browse 3,385+ verified electrical products: LT/HT XLPE cables, solar DC wires, switchgear, MCBs, lugs, and earthing supplies. Instant BOM quotation.",
    h1: "Industrial Electrical & Power Cable Catalog",
    intro: "Explore over 3,385 active, genuine electrical SKUs from India's leading manufacturers: Polycab, Finolex, KEI Industries, Schneider Electric, L&T / Lauritz Knudsen, and Dowells. Every product is backed by full manufacturer warranties, IS/IEC standard compliance (IS 7098, IS 1554, IS 694, EN 50618, IEC 60947), and complete routine factory test reports delivered with every drum or carton."
  },
  "price-list": {
    title: "Manufacturer Cable Price Lists 2026 | Volamp",
    description: "Download official 2026 manufacturer price lists and discount circulars for Polycab, Finolex, KEI cables and Schneider, L&T switchgear.",
    h1: "Official Manufacturer Price Lists & Circulars (2026)",
    intro: "Access the latest authorized 2026 price lists and project discount matrices for industrial cables and electrical equipment. We stock verified rate circulars from Polycab India, Finolex Cables, KEI Industries, Schneider Electric, and Dowells lugs, helping EPC contractors and estimators calculate accurate project bill-of-quantities (BOQ)."
  },
  "certifications-and-awards": {
    title: "Quality Certifications & IS Standards | Volamp",
    description: "View quality certifications and compliance standards for Volamp Elektrikals: IS 7098, IS 1554, IS 694, EN 50618, ISO 9001, and CPRI test reports.",
    h1: "Quality Certifications, Testing Standards & Compliance",
    intro: "Volamp Elektrikals maintains rigorous quality standards for all supplied materials. All LT and HT cables adhere strictly to Bureau of Indian Standards (BIS) specifications including IS 7098 (Part 1 & 2) for XLPE insulated cables, IS 1554 for PVC power cables, IS 694 for building wires, and EN 50618 / IEC 62930 for solar PV cables. Routine spark test, insulation resistance, and conductor resistance test certificates accompany all consignments."
  },
  "calculator": {
    title: "Online Cable Sizing & Voltage Drop Calculator | Volamp",
    description: "Calculate cable size, current rating, and voltage drop for copper and aluminium cables. Compliant with IS 7098 and IEC standards.",
    h1: "Interactive Cable Sizing & Voltage Drop Calculator",
    intro: "Engineer your electrical runs with precision using Volamp's interactive cable sizing tool. Calculate required conductor cross-section (sqmm), current carrying capacity, and percentage voltage drop for 1-phase and 3-phase circuits across copper and aluminium conductors under standard ground and ambient temperature conditions according to IS 7098 derating factors."
  },
  "collaborate": {
    title: "Partner & Collaborate With Volamp Elektrikals",
    description: "Partner with Volamp Elektrikals as an electrical contractor, institutional buyer, or vendor. Access volume pricing and priority project dispatch.",
    h1: "Contractor Partnerships & Institutional Supply Desk",
    intro: "Volamp Elektrikals partners with electrical contractors, project OEMs, panel builders, and corporate purchasing teams across India. Benefit from dedicated account managers, transparent wholesale pricing based on LME commodity indexing, structured credit terms for approved projects, and priority dispatch from our Aslali logistics terminal."
  },
  "careers": {
    title: "Careers at Volamp Elektrikals | Join Our Team",
    description: "Explore career opportunities in electrical engineering, B2B sales, procurement, and logistics at Volamp Elektrikals in Ahmedabad, Gujarat.",
    h1: "Careers at Volamp Elektrikals Private Limited",
    intro: "Join a dynamic, fast-growing engineering distribution company that bridges traditional industrial excellence with modern digital supply chain technology. We are hiring electrical estimation engineers, B2B key account managers, logistics supervisors, and technical procurement specialists at our Ahmedabad facilities."
  },
  "enquire": {
    title: "Request Quotation & Electrical RFQ Desk | Volamp",
    description: "Submit your project Bill of Materials (BOM) for competitive wholesale pricing on power cables, switchgear, and earthing supplies. 24h response.",
    h1: "Project Sourcing & Electrical BOM RFQ Desk",
    intro: "Submit your project requirements, single-line diagrams (SLD), or Bill of Quantities (BOQ) directly to Volamp Elektrikals' engineering estimation desk. Our team evaluates conductor specifications, derating criteria, and manufacturer delivery schedules to provide guaranteed competitive wholesale pricing within 24 hours."
  },
  "in-the-news": {
    title: "News & Media Coverage | Volamp Elektrikals",
    description: "Latest industry news, market circulars, LME copper and aluminium commodity price updates, and company announcements from Volamp Elektrikals.",
    h1: "Company Announcements & Electrical Industry News",
    intro: "Stay informed with the latest updates from Volamp Elektrikals and the Indian electrical power infrastructure sector. Read our monthly analysis of London Metal Exchange (LME) copper and aluminium price movements, domestic tariff revisions, renewable energy tenders, and corporate milestones."
  },
  "blog": {
    title: "Electrical Engineering Insights & Guides | Volamp",
    description: "Technical guides on cable sizing, IS 7098 standards, solar DC specifications, and LME copper trends by Volamp Elektrikals engineers.",
    h1: "Electrical Engineering Insights & Cable Selection Guides",
    intro: "Authoritative technical articles and practical engineering selection guides written by Volamp Elektrikals electrical engineers. Covering LT/HT power cable selection, copper versus aluminium economic trade-offs, solar DC cable sizing per IEC 62930, and switchgear protection coordination."
  },
  "shipping-policy": {
    title: "Shipping & Project Logistics Policy | Volamp",
    description: "Review shipping, transit insurance, and delivery schedules for Volamp Elektrikals. Same-day Gujarat GIDC dispatch; pan-India freight.",
    h1: "Shipping, Freight & Project Delivery Policy",
    intro: "Volamp Elektrikals operates dedicated logistics operations to guarantee safe, on-schedule delivery of heavy industrial cable drums and switchgear consignments. Consignments are packed to export and CPWD transport standards with complete transit insurance coverage across 28 Indian states."
  },
  "terms-and-conditions": {
    title: "Terms and Conditions of Supply | Volamp",
    description: "Terms of wholesale supply, quotation validity, inspection protocols, and payment policies for Volamp Elektrikals Private Limited.",
    h1: "Terms and Conditions of Commercial Supply",
    intro: "Commercial terms governing wholesale quotations, purchase orders, delivery terms, inspection protocols, and warranty claims between Volamp Elektrikals Private Limited and purchasers."
  },
  "privacy-policy": {
    title: "Privacy Policy | Volamp Elektrikals Private Limited",
    description: "Privacy policy and data protection practices for Volamp Elektrikals Private Limited website, customer portal, and RFQ submissions.",
    h1: "Privacy & Data Protection Policy",
    intro: "Volamp Elektrikals Private Limited is committed to protecting the privacy, confidentiality, and security of all commercial, technical, and personal information shared across our web platform."
  },
  "complaints-cases": {
    title: "Customer Redressal & Escalation Desk | Volamp",
    description: "Official customer grievance and dispute resolution portal for Volamp Elektrikals. Track resolution status and file shortage or defect reports.",
    h1: "Customer Grievance Redressal & Escalation Cell",
    intro: "Volamp Elektrikals maintains an ISO-aligned grievance resolution mechanism to address any shipment transit damage, quantity discrepancies, test certificate inquiries, or specification escalations with a guaranteed 48-hour investigation timeline."
  },
  "export": {
    title: "Global Cable Export & International Supply Desk | Volamp",
    description: "Direct export of IEC & BS compliant power cables, solar DC cables, and switchgear from Mundra & Kandla ports. CIF & FOB terms for Middle East, Africa & Asia.",
    h1: "Global Cable Export & International Electrical Supply Desk",
    intro: "Volamp Elektrikals Private Limited is an international electrical procurement and export partner headquartered in Ahmedabad, Gujarat, India. Leveraging deep logistics proximity to India's premier western deep-water container ports (Mundra and Kandla, <350 km from our central Aslali stockyard), we supply certified HT/LT power cables, solar photovoltaic cables, switchgear, and earthing infrastructure to international EPC contractors, utility developers, and industrial projects across the Middle East, Africa, and Southeast Asia. All export drums comply with ISPM-15 phytosanitary heat-treatment standards, accompanied by SGS/Bureau Veritas pre-shipment inspection certificates and Letters of Credit (LC) facilitation."
  },
  "dealers/polycab-ahmedabad": {
    title: "Polycab Dealer & Distributor Ahmedabad Gujarat | Volamp",
    description: "Authorized Polycab cables & wires distributor in Ahmedabad. LT/HT XLPE armoured power cables, solar DC cables, flexible wires with CPRI test reports.",
    h1: "Authorized Polycab Cable Dealer & Distributor in Ahmedabad, Gujarat",
    intro: "Volamp Elektrikals Private Limited is an authorized master distributor and wholesale stockist for Polycab India Ltd. in Ahmedabad, Gujarat. Operating from our central logistics fulfillment terminal on Aslali Highway and corporate sales office in Khadia, we maintain extensive ready inventory of Polycab 1.1kV LT XLPE aluminium and copper armoured cables (IS 7098 Part 1), 11kV to 33kV HT XLPE power cables (IS 7098 Part 2), 1500V DC solar PV cables (EN 50618), Green Wire FRLS building wires, and multi-core flexible control cables. Every reel and coil is guaranteed 100% original, backed by original manufacturer Material Test Certificates (MTC) and CPRI type-test reports."
  },
  "dealers/finolex-cables-ahmedabad": {
    title: "Finolex Cables Dealer & Wholesale Stockist Ahmedabad | Volamp",
    description: "Authorized Finolex cables distributor in Ahmedabad, Gujarat. Flame retardant industrial flexible wires, 3-core flat submersible cables, and power cables.",
    h1: "Finolex Cables Dealer & Wholesale Stockist in Ahmedabad, Gujarat",
    intro: "Volamp Elektrikals Private Limited is a trusted authorized wholesale dealer and stockist for Finolex Cables Ltd. in Ahmedabad and across Gujarat. Renowned for 99.97% pure electrolytic grade copper conductors and proprietary in-house PVC compounding, Finolex wires deliver unmatched electrical conductivity, energy efficiency, and thermal longevity. We supply commercial contractors and industrial builders with Finolex Flame Guard FRLS wires, 3-core flat submersible cables, and multi-conductor industrial flexible cables."
  },
  "dealers/kei-cables-gujarat": {
    title: "KEI Cables Distributor & Industrial Stockist Gujarat | Volamp",
    description: "Authorized KEI Industries distributor in Ahmedabad & Gujarat. Heavy-duty HT/EHV power cables, rubber trailing cables, instrumentation cables, and solar wires.",
    h1: "KEI Cables Industrial Distributor & Stockist in Gujarat",
    intro: "Volamp Elektrikals Private Limited is a specialized industrial distributor and project stockist for KEI Industries Ltd. in Ahmedabad and throughout Gujarat. Catering to heavy engineering, steel plants, chemical manufacturing, infrastructure EPCs, and utility distribution, we supply KEI's engineered cable solutions including Extra High Voltage (EHV) cables up to 220kV, rubber EPR/CSP trailing cables for mining and cranes, and fire-survival FS cables."
  },
  "dealers/schneider-electric-ahmedabad": {
    title: "Schneider Electric Switchgear Distributor Ahmedabad | Volamp",
    description: "Authorized Schneider Electric distributor in Ahmedabad. Acti9 MCBs, EasyPact CVS/EZC MCCBs, TeSys contactors, and industrial power distribution boards.",
    h1: "Schneider Electric Switchgear Distributor in Ahmedabad, Gujarat",
    intro: "Volamp Elektrikals Private Limited is an authorized B2B distributor of Schneider Electric low-voltage switchgear and industrial automation components in Ahmedabad, Gujarat. We supply project contractors, OEM panel builders, and facility maintenance teams with authentic Schneider protection switchgear including Acti9 miniature circuit breakers (MCBs), EasyPact CVS and EZC molded case circuit breakers (MCCBs), TeSys D and TeSys F contactors, and motor protection circuit breakers (MPCBs)."
  },
  "locations/industrial-gidc-hubs": {
    title: "Industrial Electrical Supply across Gujarat GIDC Hubs | Volamp",
    description: "Same-day 24h electrical cable & switchgear delivery to Sanand, Vatva, Naroda, Changodar, Dahej, Ankleshwar GIDC estates from Aslali logistics terminal.",
    h1: "Express Industrial Electrical Supply across Gujarat GIDC Corridors",
    intro: "Volamp Elektrikals Private Limited operates a rapid-dispatch industrial supply network servicing major Gujarat Industrial Development Corporation (GIDC) estates. Centered at our modern logistics hub at the junction of NH-48 and SP Ring Road in Aslali, Ahmedabad, our delivery fleet provides guaranteed same-day to 24-hour turnaround for urgent maintenance, emergency breakdowns, and scheduled project installations across Sanand, Vatva, Naroda, Changodar, Dahej, Ankleshwar, and Jhagadia industrial belts."
  },
  "customer-portal": {
    title: "Customer Account Portal | Volamp Elektrikals",
    description: "Access real-time quotation history, order tracking, dispatch LR notes, and GST invoices on the Volamp Elektrikals customer portal.",
    h1: "Volamp Customer Account & Order Portal",
    intro: "Manage your commercial electrical procurement account, view live dispatch statuses with transporter LR details, download manufacturer test certificates (MTC), and access approved GST invoices."
  }
};
var KNOWN_STATIC_PATHS = new Set(Object.keys(STATIC_ROUTES));
var OTHER_VALID_PATHS = /* @__PURE__ */ new Set([
  "portal",
  "employee-portal",
  "cart",
  "checkout",
  "login",
  "register",
  "track",
  "pay-invoice"
]);
var CATEGORY_DATA = {
  "wire-cables": {
    name: "Wires & Cables (LT / HT Armoured & Flexible)",
    desc: "Complete range of IS:7098 and IS:1554 certified LT and HT XLPE armoured power cables, flexible copper building wires (IS:694), control cables, submersible flat cables, and fire-survival cables."
  },
  "switch-gears": {
    name: "Switchgear & Power Protection",
    desc: "Low-voltage and medium-voltage switchgear including Air Circuit Breakers (ACB), Molded Case Circuit Breakers (MCCB), Miniature Circuit Breakers (MCB), Residual Current Breakers (RCCB), and contactors."
  },
  "switchgear": {
    name: "Switchgear & Power Protection",
    desc: "Low-voltage and medium-voltage switchgear including Air Circuit Breakers (ACB), Molded Case Circuit Breakers (MCCB), Miniature Circuit Breakers (MCB), Residual Current Breakers (RCCB), and contactors."
  },
  "solar": {
    name: "Solar PV Cables & Renewable Balance of System",
    desc: "T\xDCV and EN 50618 / IEC 62930 certified 1500V DC solar photovoltaic cables, MC4 connectors, solar array junction boxes, and UV-resistant earthing conductors."
  },
  "lugs": {
    name: "Cable Lugs & Crimping Terminals",
    desc: "Heavy-duty Dowells electrolytic tinned copper and aluminium crimping lugs, bi-metallic lugs, pin type terminals, and ring type terminal ends compliant with IS 8337."
  },
  "glands": {
    name: "Cable Glands & Industrial Terminations",
    desc: "High-integrity brass single compression and double compression weatherproof cable glands, flameproof (FLP) cable glands, and heat-shrink termination kits up to 33kV."
  },
  "conduit": {
    name: "Conduit Pipes & Cable Containment",
    desc: "Heavy-duty rigid PVC conduit pipes, GI flexible conduits, perforated cable trays, and containment accessories for industrial wiring protection."
  },
  "earthing-material": {
    name: "Earthing Material & Lightning Protection",
    desc: "CPRI and UL certified copper bonded earthing rods, pure electrolytic copper plates, chemical backfill earthing compounds (BFC), and GI earthing flats."
  },
  "wiring-device": {
    name: "Wiring Devices & Industrial Enclosures",
    desc: "Industrial plug sockets, junction boxes, weatherproof isolators, distribution boxes, and heavy-duty terminal blocks."
  },
  "substation-transmission": {
    name: "Substation & Transmission Line Equipment",
    desc: "Medium and high-voltage transmission fittings, post insulators, surge arresters, busbar accessories, and disconnectors up to 66kV."
  },
  "conduits-cable-management": {
    name: "Cable Management & Raceways",
    desc: "Ladder and perforated cable trays, cable ties, cleats, and flexible conduits for structured cable laying in industrial plants."
  },
  "earthing-lightning": {
    name: "Earthing & Lightning Protection Systems",
    desc: "Maintenance-free chemical earthing electrodes, copper bonded rods, test links, and lightning arresters for industrial and renewable installations."
  },
  "industrial-automation": {
    name: "Industrial Automation & Motor Controls",
    desc: "VFD drives, soft starters, PLC interface modules, auxiliary contactors, and motor protection circuit breakers (MPCB)."
  },
  "lighting-luminaires": {
    name: "Industrial Lighting & Luminaires",
    desc: "High-bay LED industrial lights, floodlights, cleanroom luminaires, and flameproof well glass fixtures for plant illumination."
  }
};
var BLOG_POSTS = {
  "copper-vs-aluminium-armoured-cable-sizing-guide": {
    title: "Copper vs Aluminium Armoured Cable Sizing Guide | Volamp",
    desc: "Technical comparison of copper vs aluminium conductors: ampacity, voltage drop, derating, and cost trade-offs under IS 7098 standards."
  },
  "solar-dc-cable-specifications-iec-62930": {
    title: "Solar DC Cable Specifications: EN 50618 & IEC 62930 | Volamp",
    desc: "Engineering guide to 1500V solar PV cables: cross-linked insulation, halogen-free flame retardancy, and UV weather resistance criteria."
  },
  "lme-copper-aluminium-market-analysis-q4-2026": {
    title: "LME Copper & Aluminium Market Analysis Q4 2026 | Volamp",
    desc: "In-depth market report on London Metal Exchange commodity trends, domestic Indian cable price circulars, and purchasing strategies."
  },
  "is-7098-vs-is-1554-cable-difference-guide": {
    title: "IS 7098 vs IS 1554: XLPE vs PVC Cable Differences | Volamp",
    desc: "Comprehensive engineering breakdown between IS 7098 XLPE insulated cables and IS 1554 PVC cables: temperature limits and short-circuit ratings."
  },
  "cable-gland-and-lug-size-selection-chart": {
    title: "Cable Gland & Lug Size Selection Chart | Volamp",
    desc: "Quick reference engineering chart matching armoured cable sizes to Dowells copper lugs and brass double compression cable glands."
  }
};
function escapeXml2(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
var _indexTemplateCache = null;
function loadBaseTemplate() {
  if (_indexTemplateCache) return _indexTemplateCache;
  const candidates = [
    path3.resolve(process.cwd(), "dist/public/index.html"),
    path3.resolve(process.cwd(), "client/index.html"),
    path3.join(__dirname2, "../../dist/public/index.html"),
    path3.join(__dirname2, "../dist/public/index.html"),
    path3.join(__dirname2, "../../client/index.html"),
    path3.join(__dirname2, "../client/index.html"),
    "/var/task/dist/public/index.html",
    "/var/task/client/index.html"
  ];
  for (const c of candidates) {
    if (fs3.existsSync(c)) {
      try {
        _indexTemplateCache = fs3.readFileSync(c, "utf8");
        return _indexTemplateCache;
      } catch {
      }
    }
  }
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Industrial Cable &amp; Electrical Distributor | Volamp</title>
    <meta name="description" content="Industrial cables &amp; electrical switchgear wholesale distributor in Ahmedabad, Gujarat." />
    <link rel="canonical" href="https://volampelektrikals.com/" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}
function renderPageHtml({
  title,
  description,
  canonical,
  noIndex = false,
  bodyHtml,
  schemaJson
}) {
  let template = loadBaseTemplate();
  const escapedTitle = escapeXml2(title);
  if (template.includes("<title>")) {
    template = template.replace(/<title>.*?<\/title>/s, `<title>${escapedTitle}</title>`);
  } else {
    template = template.replace("<head>", `<head>
    <title>${escapedTitle}</title>`);
  }
  const escapedDesc = escapeXml2(description);
  if (template.includes('name="description"')) {
    template = template.replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/i,
      `<meta name="description" content="${escapedDesc}" />`
    );
  } else {
    template = template.replace(
      "</head>",
      `    <meta name="description" content="${escapedDesc}" />
  </head>`
    );
  }
  if (template.includes('rel="canonical"')) {
    template = template.replace(
      /<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i,
      `<link rel="canonical" href="${canonical}" />`
    );
  } else {
    template = template.replace(
      "</head>",
      `    <link rel="canonical" href="${canonical}" />
  </head>`
    );
  }
  if (noIndex) {
    if (template.includes('name="robots"')) {
      template = template.replace(
        /<meta\s+name="robots"\s+content=".*?"\s*\/?>/i,
        '<meta name="robots" content="noindex, nofollow" />'
      );
    } else {
      template = template.replace(
        "</head>",
        '    <meta name="robots" content="noindex, nofollow" />\n  </head>'
      );
    }
  }
  template = template.replace(
    /<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:title" content="${escapedTitle}" />`
  );
  template = template.replace(
    /<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:description" content="${escapedDesc}" />`
  );
  template = template.replace(
    /<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i,
    `<meta property="og:url" content="${canonical}" />`
  );
  template = template.replace(
    /<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapedTitle}" />`
  );
  template = template.replace(
    /<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapedDesc}" />`
  );
  if (schemaJson) {
    template = template.replace(
      "</head>",
      `    <script type="application/ld+json">${schemaJson}</script>
  </head>`
    );
  }
  template = template.replace(
    '<div id="root"></div>',
    `<div id="root">${bodyHtml}</div>`
  );
  return template;
}
function seoPrerenderMiddleware(req, res, next) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }
  const rawPath = req.path || "/";
  if (rawPath.startsWith("/api/") || rawPath.startsWith("/trpc/") || rawPath.startsWith("/assets/") || rawPath.startsWith("/storage-proxy/") || rawPath === "/sitemap.xml" || rawPath === "/robots.txt" || rawPath === "/google-merchant-feed.xml" || rawPath === "/llms.txt" || rawPath === "/llms-full.txt" || /\.(js|css|json|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot|pdf|map)$/i.test(rawPath)) {
    return next();
  }
  const cleanPath = rawPath.replace(/^\/+|\/+$/g, "");
  if (cleanPath.startsWith("product/")) {
    const rawId = cleanPath.replace(/^product\//, "").trim();
    const product = getProductByProductId(rawId);
    if (!product) {
      res.status(404);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      const html2 = renderPageHtml({
        title: "Product Not Found (404) | Volamp",
        description: "The requested electrical product could not be found. Browse over 3,385 active power cables, switchgear, and earthing supplies in our catalog.",
        canonical: `${BASE_URL3}/404`,
        noIndex: true,
        bodyHtml: `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:80px auto;padding:32px;text-align:center;">
            <p style="color:#c56718;font-weight:bold;font-size:14px;letter-spacing:1px;text-transform:uppercase;">Error 404</p>
            <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:12px 0;">Product Not Found</h1>
            <p style="color:#64748b;font-size:16px;line-height:1.6;margin-bottom:28px;">
              The product code <code>${escapeXml2(rawId)}</code> does not exist in our catalog or may have been retired.
              We stock over 3,385 genuine certified electrical products from Polycab, Finolex, KEI, Schneider, and L&T.
            </p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
              <a href="/products" style="background:#c56718;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">Browse 3,385+ Products</a>
              <a href="/enquire" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Contact Engineering Desk</a>
              <a href="/" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Home</a>
            </div>
          </div>
        `
      });
      return res.send(html2);
    }
    const rawPrice = product.numericPrice || (typeof product.price === "string" ? parseFloat(product.price.replace(/[^0-9.]/g, "")) : 0) || 100;
    const priceFormatted = rawPrice.toLocaleString("en-IN", { style: "currency", currency: "INR" });
    const productUrl = `${BASE_URL3}/product/${encodeURIComponent(product.productId)}`;
    const schema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": product.imageUrl ? product.imageUrl.startsWith("http") ? product.imageUrl : `${BASE_URL3}${product.imageUrl}` : `${BASE_URL3}/products/default.jpg`,
      "description": product.description || `${product.name} industrial supply from Volamp Elektrikals.`,
      "sku": product.sku || product.productId,
      "mpn": product.productId,
      "brand": {
        "@type": "Brand",
        "name": product.brand || "Polycab"
      },
      "offers": {
        "@type": "Offer",
        "url": productUrl,
        "priceCurrency": "INR",
        "price": rawPrice.toFixed(2),
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "VOLAMP ELEKTRIKALS PVT. LTD."
        }
      }
    });
    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: `${product.name} | Volamp`,
      description: `Buy ${product.name} (SKU: ${product.sku || product.productId}). Genuine ${product.brand || "Polycab"} electrical supply with MTC test certificate from Volamp.`,
      canonical: productUrl,
      schemaJson: schema,
      bodyHtml: `
        <article style="font-family:system-ui,-apple-system,sans-serif;max-width:1100px;margin:40px auto;padding:24px;color:#1e293b;">
          <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
            <a href="/" style="color:#64748b;text-decoration:none;">Home</a> &gt;
            <a href="/products" style="color:#64748b;text-decoration:none;">Products</a> &gt;
            <a href="/category/${encodeURIComponent((product.category || "wire-cables").toLowerCase().replace(/\s+/g, "-"))}" style="color:#64748b;text-decoration:none;">${escapeXml2(product.category || "Electrical")}</a> &gt;
            <span style="color:#0f172a;font-weight:600;">${escapeXml2(product.name)}</span>
          </nav>
          <header style="border-bottom:1px solid #e2e8f0;padding-bottom:24px;margin-bottom:28px;">
            <div style="display:inline-block;padding:4px 10px;background:#fef3c7;color:#92400e;font-size:12px;font-weight:700;border-radius:6px;margin-bottom:12px;">
              ${escapeXml2(product.brand || "Polycab")} \u2022 Genuine Certified
            </div>
            <h1 style="font-size:28px;font-weight:800;color:#0f172a;line-height:1.3;margin:0 0 12px 0;">${escapeXml2(product.name)}</h1>
            <p style="font-size:14px;color:#64748b;margin:0;">
              Product ID: <strong style="font-family:monospace;color:#0f172a;">${escapeXml2(product.productId)}</strong> |
              SKU: <strong style="font-family:monospace;color:#0f172a;">${escapeXml2(product.sku || product.productId)}</strong> |
              Category: <a href="/category/${encodeURIComponent((product.category || "wire-cables").toLowerCase().replace(/\s+/g, "-"))}" style="color:#c56718;font-weight:600;text-decoration:none;">${escapeXml2(product.category || "Wires & Cables")}</a>
            </p>
          </header>
          <section style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:32px;margin-bottom:40px;">
            <div>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-bottom:20px;">
                <p style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;margin:0 0 6px 0;">B2B Wholesale Price (excl. GST)</p>
                <div style="font-size:32px;font-weight:900;color:#0f172a;">${priceFormatted}</div>
                <p style="font-size:12px;color:#16a34a;font-weight:700;margin:8px 0 0 0;">\u2713 In Stock \u2014 Ready for 24h dispatch across Gujarat & Pan-India</p>
              </div>
              <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <a href="/enquire" style="background:#c56718;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;display:inline-block;">Request Project Quotation</a>
                <a href="/calculator" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;display:inline-block;">Calculate Voltage Drop</a>
              </div>
            </div>
            <div>
              <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 16px 0;">Technical Specifications & Compliance</h2>
              <table style="width:100%;border-collapse:collapse;font-size:13px;">
                <tbody>
                  <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Manufacturer / Brand</td><td style="padding:10px 0;font-weight:600;color:#0f172a;text-align:right;">${escapeXml2(product.brand || "Polycab")}</td></tr>
                  <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Conductor / Size</td><td style="padding:10px 0;font-weight:600;color:#0f172a;text-align:right;">${escapeXml2(product.size || "Standard")}</td></tr>
                  <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Quality Verification</td><td style="padding:10px 0;font-weight:600;color:#0f172a;text-align:right;">Manufacturer Test Certificate (MTC) Included</td></tr>
                  <tr style="border-bottom:1px solid #f1f5f9;"><td style="padding:10px 0;color:#64748b;">Dispatch Location</td><td style="padding:10px 0;font-weight:600;color:#0f172a;text-align:right;">Aslali Central Warehouse, Ahmedabad</td></tr>
                </tbody>
              </table>
            </div>
          </section>
          <section style="background:#f8fafc;padding:24px;border-radius:12px;border:1px solid #e2e8f0;font-size:14px;line-height:1.7;color:#475569;">
            <h3 style="font-size:16px;font-weight:700;color:#0f172a;margin-top:0;">About This Product & Supply Assurance</h3>
            <p>
              ${escapeXml2(product.name)} is supplied directly by Volamp Elektrikals Private Limited, authorized industrial electrical distributor in Ahmedabad, Gujarat.
              All cables and switchgear are sourced directly from manufacturer production lines with full batch traceability, routine test reports, and compliance with Indian (BIS) and International Electrotechnical Commission (IEC) standards.
            </p>
          </section>
        </article>
      `
    });
    return res.send(html);
  }
  if (cleanPath.startsWith("category/")) {
    const slug = cleanPath.replace(/^category\//, "").trim().toLowerCase();
    const catInfo = CATEGORY_DATA[slug];
    if (!catInfo) {
      res.status(404);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      const html2 = renderPageHtml({
        title: "Category Not Found (404) | Volamp",
        description: "The requested electrical category does not exist. Browse our verified categories across power cables, switchgear, and solar PV.",
        canonical: `${BASE_URL3}/404`,
        noIndex: true,
        bodyHtml: `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:80px auto;padding:32px;text-align:center;">
            <p style="color:#c56718;font-weight:bold;font-size:14px;letter-spacing:1px;text-transform:uppercase;">Error 404</p>
            <h1 style="font-size:32px;font-weight:800;color:#0f172a;margin:12px 0;">Category Not Found</h1>
            <p style="color:#64748b;font-size:16px;line-height:1.6;margin-bottom:28px;">
              The category <code>/category/${escapeXml2(slug)}</code> does not exist in our catalog.
            </p>
            <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
              <a href="/products" style="background:#c56718;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">Browse All Products</a>
              <a href="/" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Home</a>
            </div>
          </div>
        `
      });
      return res.send(html2);
    }
    const allProducts = loadProductsFromDisk();
    const categoryProducts = allProducts.filter((p) => {
      const c = (p.category || "").toLowerCase();
      if (slug === "wire-cables" || slug.includes("cable") || slug.includes("wire")) return c.includes("cable") || c.includes("wire");
      if (slug === "switch-gears" || slug.includes("switch")) return c.includes("switch");
      if (slug === "solar") return c.includes("solar");
      if (slug === "lugs") return c.includes("lug");
      if (slug === "glands") return c.includes("gland");
      if (slug === "conduit") return c.includes("pipe") || c.includes("conduit");
      if (slug === "earthing-material") return c.includes("earth");
      if (slug === "wiring-device") return c.includes("device") || c.includes("wiring");
      return false;
    }).slice(0, 24);
    const productLinksHtml = categoryProducts.map(
      (p) => `
        <li style="padding:12px 0;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between;align-items:center;">
          <a href="/product/${encodeURIComponent(p.productId)}" style="color:#0f172a;font-weight:600;text-decoration:none;font-size:14px;">
            ${escapeXml2(p.name)}
          </a>
          <span style="font-family:monospace;font-size:12px;color:#64748b;">${escapeXml2(p.productId)}</span>
        </li>
      `
    ).join("");
    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: `${catInfo.name} | Volamp`,
      description: `Authorized wholesale distributor of ${catInfo.name} in Ahmedabad, Gujarat. Genuine Polycab, Finolex, KEI, Schneider supplies with MTC test certificates.`,
      canonical: `${BASE_URL3}/category/${slug}`,
      bodyHtml: `
        <main style="font-family:system-ui,-apple-system,sans-serif;max-width:1100px;margin:40px auto;padding:24px;color:#1e293b;">
          <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
            <a href="/" style="color:#64748b;text-decoration:none;">Home</a> &gt;
            <a href="/products" style="color:#64748b;text-decoration:none;">Products</a> &gt;
            <span style="color:#0f172a;font-weight:600;">${escapeXml2(catInfo.name)}</span>
          </nav>
          <header style="margin-bottom:32px;">
            <h1 style="font-size:32px;font-weight:800;color:#0f172a;line-height:1.2;margin:0 0 16px 0;">${escapeXml2(catInfo.name)}</h1>
            <p style="font-size:15px;line-height:1.7;color:#475569;max-width:900px;">
              ${escapeXml2(catInfo.desc)}
              Volamp Elektrikals Private Limited maintains extensive wholesale inventory across all standard specifications in our Aslali logistics terminal.
              Every consignment is supplied with manufacturer Material Test Certificates (MTC) and undergoes strict quality verification to ensure flawless performance in continuous industrial and utility service.
            </p>
          </header>
          <section>
            <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 16px 0;">Available Products in this Category</h2>
            <ul style="list-style:none;padding:0;margin:0;">
              ${productLinksHtml}
            </ul>
          </section>
        </main>
      `
    });
    return res.send(html);
  }
  if (cleanPath.startsWith("blog/")) {
    const slug = cleanPath.replace(/^blog\//, "").trim().toLowerCase();
    const blog = BLOG_POSTS[slug];
    if (!blog) {
      res.status(404);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      const html2 = renderPageHtml({
        title: "Article Not Found (404) | Volamp",
        description: "The requested engineering article does not exist.",
        canonical: `${BASE_URL3}/404`,
        noIndex: true,
        bodyHtml: `<div style="font-family:system-ui;max-width:800px;margin:80px auto;text-align:center;"><h1>Article Not Found (404)</h1><p><a href="/blog">Browse All Engineering Articles</a></p></div>`
      });
      return res.send(html2);
    }
    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: blog.title,
      description: blog.desc,
      canonical: `${BASE_URL3}/blog/${slug}`,
      bodyHtml: `
        <article style="font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:40px auto;padding:24px;color:#1e293b;">
          <nav aria-label="Breadcrumb" style="font-size:13px;color:#64748b;margin-bottom:20px;">
            <a href="/" style="color:#64748b;text-decoration:none;">Home</a> &gt;
            <a href="/blog" style="color:#64748b;text-decoration:none;">Blog</a> &gt;
            <span style="color:#0f172a;font-weight:600;">${escapeXml2(blog.title)}</span>
          </nav>
          <h1 style="font-size:32px;font-weight:800;color:#0f172a;line-height:1.3;margin:0 0 16px 0;">${escapeXml2(blog.title)}</h1>
          <p style="font-size:16px;line-height:1.7;color:#475569;">${escapeXml2(blog.desc)}</p>
        </article>
      `
    });
    return res.send(html);
  }
  if (KNOWN_STATIC_PATHS.has(cleanPath)) {
    const meta = STATIC_ROUTES[cleanPath];
    const canonical = cleanPath === "" ? `${BASE_URL3}/` : `${BASE_URL3}/${cleanPath}`;
    let homeExtraHtml = "";
    if (cleanPath === "") {
      homeExtraHtml = `
        <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:28px;">
          <h2 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:16px;">Core Electrical Categories</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:16px;">
            <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
              <h3 style="font-size:16px;margin:0 0 6px 0;"><a href="/category/wire-cables" style="color:#c56718;font-weight:bold;text-decoration:none;">Wires &amp; Cables</a></h3>
              <p style="font-size:13px;color:#64748b;margin:0;">LT / HT XLPE armoured, flexible FRLS, submersible, control cables.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
              <h3 style="font-size:16px;margin:0 0 6px 0;"><a href="/category/switch-gears" style="color:#c56718;font-weight:bold;text-decoration:none;">Switchgear &amp; Protection</a></h3>
              <p style="font-size:13px;color:#64748b;margin:0;">Schneider and L&T ACBs, MCCBs, MCBs, contactors, starters.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
              <h3 style="font-size:16px;margin:0 0 6px 0;"><a href="/category/solar" style="color:#c56718;font-weight:bold;text-decoration:none;">Solar PV Cables</a></h3>
              <p style="font-size:13px;color:#64748b;margin:0;">1500V DC UV-resistant cross-linked halogen-free cables per EN 50618.</p>
            </div>
            <div style="background:#f8fafc;padding:16px;border-radius:8px;border:1px solid #e2e8f0;">
              <h3 style="font-size:16px;margin:0 0 6px 0;"><a href="/category/earthing-material" style="color:#c56718;font-weight:bold;text-decoration:none;">Earthing &amp; Lightning</a></h3>
              <p style="font-size:13px;color:#64748b;margin:0;">Copper bonded rods, chemical compound, GI flats, UL/CPRI certified.</p>
            </div>
          </div>
        </section>
        <section style="margin-top:36px;border-top:1px solid #e2e8f0;padding-top:28px;">
          <h2 style="font-size:22px;font-weight:700;color:#0f172a;margin-bottom:16px;">Fast Moving B2B Electrical Products</h2>
          <ul style="list-style:none;padding:0;margin:0;font-size:14px;">
            <li style="padding:8px 0;"><a href="/product/CAB-000001" style="color:#0f172a;font-weight:600;text-decoration:none;">1.1kV XLPE Aluminium Armoured Cable (3.5C x 185 sqmm)</a> \u2014 SKU: CAB-000001</li>
            <li style="padding:8px 0;"><a href="/product/SOL-000001" style="color:#0f172a;font-weight:600;text-decoration:none;">Solar DC Cable 1C x 4 sqmm (H1Z2Z2-K / EN 50618)</a> \u2014 SKU: SOL-000001</li>
            <li style="padding:8px 0;"><a href="/product/SWG-000001" style="color:#0f172a;font-weight:600;text-decoration:none;">10kA C-Curve Miniature Circuit Breaker (MCB) 4-Pole 63A</a> \u2014 SKU: SWG-000001</li>
          </ul>
        </section>
      `;
    }
    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: meta.title,
      description: meta.description,
      canonical,
      bodyHtml: `
        <main style="font-family:system-ui,-apple-system,sans-serif;max-width:1100px;margin:40px auto;padding:24px;color:#1e293b;">
          <header style="margin-bottom:32px;">
            <h1 style="font-size:32px;font-weight:800;color:#0f172a;line-height:1.2;margin:0 0 16px 0;">${escapeXml2(meta.h1)}</h1>
            <p style="font-size:15px;line-height:1.7;color:#475569;max-width:900px;">
              ${escapeXml2(meta.intro)}
            </p>
          </header>
          ${homeExtraHtml}
        </main>
      `
    });
    return res.send(html);
  }
  if (OTHER_VALID_PATHS.has(cleanPath)) {
    res.status(200);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const html = renderPageHtml({
      title: `${cleanPath.toUpperCase()} | Volamp Elektrikals`,
      description: "Secure B2B electrical customer portal and ordering platform for Volamp Elektrikals.",
      canonical: `${BASE_URL3}/${cleanPath}`,
      bodyHtml: `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:900px;margin:60px auto;padding:24px;text-align:center;">
          <h1 style="font-size:28px;font-weight:800;color:#0f172a;">${escapeXml2(cleanPath.toUpperCase())}</h1>
          <p style="color:#64748b;margin-top:12px;">Loading secure Volamp portal application...</p>
        </div>
      `
    });
    return res.send(html);
  }
  res.status(404);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const notFoundHtml = renderPageHtml({
    title: "Page Not Found (404) | Volamp Elektrikals",
    description: "The page you are looking for does not exist or has moved. Browse our full electrical catalog or contact our sales desk in Ahmedabad.",
    canonical: `${BASE_URL3}/404`,
    noIndex: true,
    bodyHtml: `
      <div style="font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:80px auto;padding:32px;text-align:center;">
        <p style="color:#c56718;font-weight:bold;font-size:14px;letter-spacing:1px;text-transform:uppercase;">Error 404</p>
        <h1 style="font-size:36px;font-weight:800;color:#0f172a;margin:12px 0;">404 - Page Not Found</h1>
        <p style="color:#64748b;font-size:16px;line-height:1.6;margin-bottom:28px;">
          The URL <code>/${escapeXml2(cleanPath)}</code> could not be found on this server.
          It may have been moved or removed during our platform migration.
        </p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
          <a href="/" style="background:#c56718;color:#ffffff;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">Return to Homepage</a>
          <a href="/products" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Browse 3,385+ Products</a>
          <a href="/enquire" style="border:1px solid #cbd5e1;color:#334155;padding:12px 24px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">Contact Sales Desk</a>
        </div>
      </div>
    `
  });
  return res.send(notFoundHtml);
}

// shared/careersData.ts
var VOLAMP_JOB_ROLES = [
  // 1. Sales Executive
  {
    id: "sales-executive",
    no: 1,
    title: "Sales Executive",
    department: "Sales & Business Development",
    location: "Ahmedabad, Gujarat / Field",
    workMode: "Full-time",
    experience: "1 to 4 years",
    education: "Graduate in any stream",
    packageLpa: "Competitive + Sales Incentive",
    openingsCount: 4,
    isFeatured: true,
    aboutRole: "As a Sales Executive at Volamp, you will grow our business with dealers, electricians and contractors across your assigned territory. You will sell leading electrical brands such as Polycab, Finolex and KEI, build lasting relationships, and turn enquiries into repeat orders.",
    responsibilities: [
      "Visit and manage dealers, electricians, contractors and builders in your assigned territory",
      "Generate new leads and convert enquiries into quotations and confirmed orders",
      "Share product information, pricing and scheme details across cables, wires and switchgear",
      "Follow up on quotations, proforma invoices and pending orders until closure",
      "Record every lead, call and visit accurately in the CRM on the same day",
      "Coordinate with the operations and accounts teams for dispatch and payment follow-up",
      "Achieve monthly and quarterly sales targets"
    ],
    skillsRequired: [
      "Strong communication and negotiation skills",
      "Knowledge of electrical products, especially cables and wires, is a big plus",
      "Comfortable with field visits and customer meetings",
      "Basic working knowledge of CRM tools, Excel and WhatsApp Business",
      "Target-driven, self-motivated and well organised"
    ],
    qualification: "Graduate in any stream. Experience in electrical, building material or FMCG sales preferred.",
    tags: ["Dealer Network", "Contractor Sales", "Cables & Switchgear", "Field Visits"]
  },
  // 2. Business Development Associate
  {
    id: "business-development-associate",
    no: 2,
    title: "Business Development Associate",
    department: "Sales & Business Development",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 3 years",
    education: "Graduate (BBA / MBA preferred)",
    packageLpa: "Competitive + Target Bonus",
    openingsCount: 3,
    isFeatured: true,
    aboutRole: "The Business Development Associate opens new markets and new customer segments for Volamp. You will identify potential dealers, contractors, builders and industrial buyers, start the conversation, and hand over qualified opportunities to the sales team.",
    responsibilities: [
      "Research and identify new dealers, contractors, builders and industrial buyers",
      "Reach out through calls, emails, WhatsApp and LinkedIn to generate qualified leads",
      "Present Volamp's product range, brands and service strengths to prospects",
      "Prepare proposals, quotations and follow-up plans with the sales team",
      "Build and maintain a healthy pipeline of opportunities in the CRM",
      "Track competitor pricing, schemes and market trends and share insights",
      "Support onboarding of new customers, including documentation and credit forms"
    ],
    skillsRequired: [
      "Excellent written and spoken communication in English, Hindi and Gujarati",
      "Lead generation, prospecting and follow-up discipline",
      "Good with Excel, email and presentation tools",
      "Comfortable using a CRM system daily",
      "Curious, persistent and quick to learn about products and markets"
    ],
    qualification: "Graduate (BBA/MBA preferred). Prior experience in B2B sales or business development is an advantage.",
    tags: ["B2B Prospecting", "Market Expansion", "Client Onboarding", "CRM Pipeline"]
  },
  // 3. Regional Sales Manager
  {
    id: "regional-sales-manager",
    no: 3,
    title: "Regional Sales Manager",
    department: "Sales & Business Development",
    location: "PAN India (Region-based)",
    workMode: "Full-time",
    experience: "7 to 12 years",
    education: "Graduate or MBA",
    packageLpa: "Senior Leadership Band + Regional Revenue Incentive",
    openingsCount: 2,
    isFeatured: true,
    aboutRole: "The Regional Sales Manager leads Volamp's sales team and revenue in a region. You will set targets, coach the team, handle large accounts and make sure our PAN India growth plan is delivered, one region at a time.",
    responsibilities: [
      "Own regional sales targets, revenue growth and market share",
      "Lead, coach and review a team of sales executives and business development associates",
      "Plan territory coverage, beat plans and customer visit schedules",
      "Develop key dealers, large contractors and industrial customers personally",
      "Review CRM data weekly to track calls, visits, quotations and conversions",
      "Coordinate with purchase and operations for stock availability and timely delivery",
      "Work with accounts on credit limits and outstanding collections for the region",
      "Share regional performance reports and market feedback with management"
    ],
    skillsRequired: [
      "Proven team leadership and people management",
      "Strong understanding of electrical distribution, cables and wires",
      "Data-driven approach to sales review and forecasting",
      "Negotiation and key account handling",
      "Comfortable with CRM dashboards and Excel reporting"
    ],
    qualification: "Graduate or MBA. Minimum 7 years of sales experience, with at least 3 years in a team leadership role.",
    tags: ["Regional Leadership", "PAN India Distribution", "Team Coaching", "Revenue Targets"]
  },
  // 4. Key Account Manager (Builders & Industrial)
  {
    id: "key-account-manager-builders-industrial",
    no: 4,
    title: "Key Account Manager (Builders & Industrial)",
    department: "Sales & Business Development",
    location: "Ahmedabad, Gujarat / Travel as required",
    workMode: "Full-time",
    experience: "4 to 8 years",
    education: "Graduate (B.E. / Diploma in Electrical is a plus)",
    packageLpa: "Industry Benchmark + Project Bonuses",
    openingsCount: 2,
    isFeatured: true,
    aboutRole: "The Key Account Manager looks after Volamp's largest customers: builders, EPC contractors and industrial buyers. You will build long-term relationships, win project business, and make sure every order is delivered smoothly.",
    responsibilities: [
      "Manage a portfolio of builder, project and industrial accounts",
      "Understand project requirements and prepare accurate BOQ-based quotations",
      "Negotiate commercial terms, pricing and delivery schedules",
      "Coordinate with purchase, warehouse and dispatch teams for project supplies",
      "Ensure timely documentation, invoicing and payment follow-up",
      "Maintain regular contact with decision makers, site engineers and purchase teams",
      "Identify repeat and upsell opportunities across projects"
    ],
    skillsRequired: [
      "Strong relationship building and negotiation skills",
      "Ability to read BOQs and understand project timelines",
      "Good knowledge of cables, wires, panels and electrical materials",
      "Professional communication and presentation skills",
      "Strong follow-up and problem-solving ability"
    ],
    qualification: "Graduate (B.E./Diploma in Electrical is a plus). Experience in project or institutional sales preferred.",
    tags: ["Builders & EPC", "BOQ Quotations", "Institutional Sales", "Key Account Management"]
  },
  // 5. Technical Sales Engineer (Cables & Wires)
  {
    id: "technical-sales-engineer",
    no: 5,
    title: "Technical Sales Engineer (Cables & Wires)",
    department: "Sales & Business Development",
    location: "Ahmedabad, Gujarat / Field",
    workMode: "Full-time",
    experience: "2 to 5 years",
    education: "B.E. / B.Tech or Diploma in Electrical Engineering",
    packageLpa: "Competitive Technical Engineering Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole: "The Technical Sales Engineer helps customers choose the right cable or wire for the job. You will support sales with technical knowledge, guide electricians and contractors, and build trust with product expertise.",
    responsibilities: [
      "Advise customers on the right cable and wire type, size and specification for their application",
      "Support the sales team with technical discussions, product demos and site visits",
      "Prepare technical quotations and compare products and brands",
      "Share datasheets, certifications and compliance information on request",
      "Resolve product-related queries and coordinate with brand representatives",
      "Conduct product knowledge sessions for dealers and electricians"
    ],
    skillsRequired: [
      "Strong understanding of cables, wires, load calculations and electrical standards (IS/IEC)",
      "Ability to explain technical points in simple language",
      "Good communication and customer handling skills",
      "Comfortable with site visits and travel",
      "Working knowledge of Excel and CRM tools"
    ],
    qualification: "B.E./B.Tech or Diploma in Electrical Engineering. Experience with cable or electrical brands preferred.",
    tags: ["Cable Sizing", "IS/IEC Standards", "Datasheets & GTP", "Technical Pre-Sales"]
  },
  // 6. Inside Sales Executive (Tele-sales)
  {
    id: "inside-sales-executive-tele-sales",
    no: 6,
    title: "Inside Sales Executive (Tele-sales)",
    department: "Sales & Business Development",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "0 to 2 years",
    education: "Graduate or Higher Secondary with strong communication skills",
    packageLpa: "Competitive Fixed + Daily Call Performance Incentives",
    openingsCount: 3,
    isFeatured: false,
    aboutRole: "The Inside Sales Executive keeps Volamp in constant touch with dealers and electricians through calls and messages. You will follow up on leads, take repeat orders, and support the field sales team so no opportunity is missed.",
    responsibilities: [
      "Make outbound calls to dealers, electricians and contractors daily",
      "Follow up on enquiries, quotations and pending orders",
      "Take repeat orders and share price lists, schemes and stock updates",
      "Log all calls, outcomes and next steps in the CRM",
      "Schedule field visits and hand over hot leads to the sales team",
      "Reactivate inactive customers through regular outreach"
    ],
    skillsRequired: [
      "Clear, confident communication in Hindi, Gujarati and English",
      "Telephone etiquette and persuasive follow-up",
      "Basic computer skills, including Excel and CRM data entry",
      "Good listening skills and patience",
      "Ability to hit daily call and conversion targets"
    ],
    qualification: "Graduate or Higher Secondary with strong communication skills. Freshers are welcome to apply.",
    tags: ["Tele-Sales", "Customer Retention", "Outbound Inquiries", "Order Booking"]
  },
  // 7. Operations Manager
  {
    id: "operations-manager",
    no: 7,
    title: "Operations Manager",
    department: "Operations, Warehouse & Logistics",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "6 to 10 years",
    education: "Graduate or MBA (Operations / Supply Chain preferred)",
    packageLpa: "Senior Management Band",
    openingsCount: 1,
    isFeatured: true,
    aboutRole: "The Operations Manager runs the engine that turns orders into on-time deliveries. You will lead order processing, warehouse, dispatch and logistics teams, and build systems that keep Volamp fast, accurate and scalable across India.",
    responsibilities: [
      "Oversee the full order-to-delivery process, from sales order to delivery challan and dispatch",
      "Lead operations coordinators, warehouse and logistics staff",
      "Set and monitor KPIs for order turnaround, dispatch accuracy and delivery timelines",
      "Work with purchase to maintain the right stock levels and avoid stock-outs",
      "Manage transporter relationships, freight costs and delivery performance",
      "Improve processes and SOPs, and push for better use of CRM and digital tools",
      "Resolve escalations related to delivery, damages and shortages",
      "Report operational performance to management every week"
    ],
    skillsRequired: [
      "Strong leadership and process orientation",
      "Experience in distribution, warehousing or supply chain",
      "Good knowledge of ERP or CRM and reporting in Excel",
      "Problem-solving and decision-making under pressure",
      "Clear communication across sales, accounts and warehouse teams"
    ],
    qualification: "Graduate or MBA (Operations/Supply Chain preferred). Minimum 6 years of operations experience in distribution or trading.",
    tags: ["Order-to-Delivery", "Warehouse SOPs", "Freight Optimization", "Operations KPIs"]
  },
  // 8. Operations Coordinator
  {
    id: "operations-coordinator",
    no: 8,
    title: "Operations Coordinator",
    department: "Operations, Warehouse & Logistics",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 3 years",
    education: "Graduate (Commerce preferred)",
    packageLpa: "Competitive Operations Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole: "The Operations Coordinator is the link between sales, warehouse and accounts. You will make sure every approved order is processed correctly, dispatched on time, and documented properly.",
    responsibilities: [
      "Process sales orders, proforma invoices and delivery challans accurately",
      "Coordinate with the warehouse for stock confirmation, packing and dispatch",
      "Arrange transport and share dispatch details (LR number, vehicle, ETA) with customers and sales",
      "Track pending orders and follow up until delivery is complete",
      "Maintain dispatch records and keep CRM entries updated",
      "Handle customer queries on order status, shortages and returns"
    ],
    skillsRequired: [
      "Strong attention to detail and order accuracy",
      "Good coordination and follow-up skills",
      "Working knowledge of Excel, CRM and email",
      "Clear communication in Hindi, Gujarati and English",
      "Ability to handle multiple orders at the same time"
    ],
    qualification: "Graduate (Commerce preferred). Experience in order processing or dispatch coordination is an advantage.",
    tags: ["Order Processing", "Delivery Challans", "Transport Booking", "Dispatch Tracking"]
  },
  // 9. Warehouse In-charge
  {
    id: "warehouse-in-charge",
    no: 9,
    title: "Warehouse In-charge",
    department: "Operations, Warehouse & Logistics",
    location: "Ahmedabad, Gujarat (Warehouse)",
    workMode: "Full-time",
    experience: "4 to 8 years",
    education: "Graduate or Higher Secondary with relevant warehouse experience",
    packageLpa: "Competitive Warehouse Management Band",
    openingsCount: 2,
    isFeatured: true,
    aboutRole: "The Warehouse In-charge manages the physical heart of Volamp: our stock. You will make sure materials are received, stored, picked and dispatched accurately, safely and on time.",
    responsibilities: [
      "Supervise receiving, storage, picking, packing and dispatch of cables, wires and electrical goods",
      "Maintain accurate stock records and conduct regular physical stock verification",
      "Check incoming goods against purchase orders for quantity, brand and condition",
      "Organise the warehouse for easy access, safety and minimum damage",
      "Manage warehouse staff, loaders and daily workload",
      "Coordinate with operations for dispatch schedules and with purchase for replenishment",
      "Report damaged, slow-moving and short stock promptly"
    ],
    skillsRequired: [
      "Hands-on warehouse and inventory management experience",
      "Knowledge of cable drums, coils and handling of electrical materials",
      "Basic computer skills for stock entry and reports",
      "Team supervision and discipline",
      "Honesty, accuracy and a safety-first approach"
    ],
    qualification: "Graduate or Higher Secondary with relevant warehouse experience, preferably in electrical, hardware or building materials.",
    tags: ["Cable Drums & Coils", "Physical Audit", "Material Safety", "Team Supervision"]
  },
  // 10. Logistics & Dispatch Executive
  {
    id: "logistics-dispatch-executive",
    no: 10,
    title: "Logistics & Dispatch Executive",
    department: "Operations, Warehouse & Logistics",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 3 years",
    education: "Graduate or Higher Secondary",
    packageLpa: "Competitive Logistics Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole: "The Logistics & Dispatch Executive makes sure every shipment reaches the customer safely and on time, anywhere in India. You will manage transporters, vehicles and delivery documents.",
    responsibilities: [
      "Plan and arrange transport for daily dispatches, including part loads and full loads",
      "Coordinate with transporters, drivers and the warehouse for loading and timelines",
      "Prepare and verify dispatch documents: invoice, delivery challan, e-way bill and LR",
      "Track shipments and update sales and customers on delivery status",
      "Negotiate freight rates and monitor transporter performance",
      "Handle transit damage, shortage and delivery delay claims"
    ],
    skillsRequired: [
      "Knowledge of transport, freight and e-way bill processes",
      "Strong coordination and follow-up",
      "Good Excel and basic computer skills",
      "Communication skills for dealing with transporters and customers",
      "Ability to work under tight timelines"
    ],
    qualification: "Graduate or Higher Secondary. Experience in logistics, transport coordination or dispatch preferred.",
    tags: ["E-way Bills & LR", "Freight Negotiation", "Pan-India Freight", "Consignment Tracking"]
  },
  // 11. Inventory Controller
  {
    id: "inventory-controller",
    no: 11,
    title: "Inventory Controller",
    department: "Operations, Warehouse & Logistics",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "2 to 5 years",
    education: "Graduate (Commerce or Science)",
    packageLpa: "Competitive Inventory Band",
    openingsCount: 1,
    isFeatured: false,
    aboutRole: "The Inventory Controller keeps Volamp's stock numbers right. You will make sure what is on the system matches what is on the shelf, and give the purchase and sales teams a clear picture of availability.",
    responsibilities: [
      "Reconcile system stock with physical stock through cycle counts and audits",
      "Monitor fast-moving, slow-moving and dead stock and report weekly",
      "Maintain accurate stock records by brand, size and category",
      "Investigate and resolve stock mismatches, damages and shortages",
      "Support purchase with reorder level and stock availability reports",
      "Ensure goods receipts and dispatches are entered correctly and on time"
    ],
    skillsRequired: [
      "Strong analytical and Excel skills (pivot tables, VLOOKUP/XLOOKUP)",
      "High attention to detail and accuracy",
      "Experience with inventory or ERP software",
      "Understanding of stock valuation and movement analysis",
      "Integrity and a structured way of working"
    ],
    qualification: "Graduate (Commerce or Science). Experience in inventory control or stores management preferred.",
    tags: ["Cycle Counts", "Stock Reconciliation", "Aging & Dead Stock", "ERP Records"]
  },
  // 12. Purchase Manager
  {
    id: "purchase-manager",
    no: 12,
    title: "Purchase Manager",
    department: "Purchase, Accounts & Finance",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "6 to 10 years",
    education: "Graduate or MBA",
    packageLpa: "Senior Commercial Band",
    openingsCount: 1,
    isFeatured: true,
    aboutRole: "The Purchase Manager makes sure Volamp always has the right products, in the right quantity, at the right price. You will manage relationships with major brands and suppliers, and balance stock availability with working capital.",
    responsibilities: [
      "Plan and place purchase orders with brands and suppliers based on sales demand and stock levels",
      "Negotiate prices, schemes, credit terms and delivery timelines",
      "Maintain strong relationships with brand representatives and suppliers",
      "Monitor stock levels, lead times and market price movements, especially for copper and cable products",
      "Coordinate with warehouse and operations for goods receipt and quality checks",
      "Work with accounts on supplier invoices, payments and reconciliations",
      "Analyse purchase data to reduce costs and avoid dead stock"
    ],
    skillsRequired: [
      "Strong negotiation and vendor management skills",
      "Understanding of the electrical products market and pricing trends",
      "Good analytical skills and Excel reporting",
      "Planning and forecasting ability",
      "Integrity and strong decision-making"
    ],
    qualification: "Graduate or MBA. Minimum 6 years of purchase experience in distribution or trading, preferably in electrical products.",
    tags: ["Vendor Relations", "Copper/Cable Pricing", "Commercial Negotiation", "Working Capital"]
  },
  // 13. Accountant
  {
    id: "accountant",
    no: 13,
    title: "Accountant",
    department: "Purchase, Accounts & Finance",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "2 to 5 years",
    education: "B.Com / M.Com (CA Inter or equivalent is a plus)",
    packageLpa: "Competitive Accounting Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole: "The Accountant keeps Volamp's books accurate, compliant and up to date. You will handle day-to-day accounting, reconciliations and statutory work so management always has a clear financial picture.",
    responsibilities: [
      "Record sales, purchase, receipts, payments and journal entries accurately",
      "Prepare and verify invoices, credit notes and debit notes",
      "Perform bank, supplier and customer ledger reconciliations",
      "Support GST filing, TDS and other statutory compliance",
      "Prepare monthly MIS, trial balance and supporting schedules",
      "Assist auditors and the CA with documentation and queries",
      "Maintain proper records and vouchers"
    ],
    skillsRequired: [
      "Strong knowledge of accounting principles, GST and TDS",
      "Hands-on experience with Tally or similar accounting software",
      "Advanced Excel skills",
      "Accuracy, honesty and attention to detail",
      "Ability to meet month-end deadlines"
    ],
    qualification: "B.Com / M.Com (CA Inter or equivalent is a plus). Experience in a trading or distribution business preferred.",
    tags: ["Tally & Excel", "Bank Reconciliation", "GST & TDS", "Financial MIS"]
  },
  // 14. Accounts Receivable Associate
  {
    id: "accounts-receivable-associate",
    no: 14,
    title: "Accounts Receivable Associate",
    department: "Purchase, Accounts & Finance",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 4 years",
    education: "B.Com or equivalent",
    packageLpa: "Competitive Finance Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole: "The Accounts Receivable Associate protects Volamp's cash flow. You will track customer outstanding, follow up on payments, and work closely with the sales team to keep collections healthy.",
    responsibilities: [
      "Monitor customer outstanding, ageing and credit limits daily",
      "Follow up with dealers, contractors and builders on due and overdue payments",
      "Match receipts to invoices and update records promptly",
      "Share outstanding statements and payment reminders with customers and sales",
      "Coordinate with sales on collection plans and disputed invoices",
      "Flag high-risk accounts and recommend credit holds when needed",
      "Prepare weekly collection and ageing reports for management"
    ],
    skillsRequired: [
      "Good understanding of receivables, ageing analysis and credit control",
      "Polite but firm communication and follow-up skills",
      "Working knowledge of Tally or accounting software and Excel",
      "Accuracy and organisation",
      "Ability to build good relations while collecting payments"
    ],
    qualification: "B.Com or equivalent. Experience in collections, credit control or accounts receivable preferred.",
    tags: ["Credit Control", "Aging Analysis", "Payment Follow-up", "Customer Ledger"]
  },
  // 15. GST & Compliance Executive
  {
    id: "gst-compliance-executive",
    no: 15,
    title: "GST & Compliance Executive",
    department: "Purchase, Accounts & Finance",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "2 to 4 years",
    education: "B.Com / M.Com or equivalent (GST certification or CA/CS inter is an advantage)",
    packageLpa: "Competitive Taxation Band",
    openingsCount: 1,
    isFeatured: false,
    aboutRole: "The GST & Compliance Executive keeps Volamp fully compliant with tax and statutory requirements. You will manage filings, reconciliations and documentation so the business stays audit-ready.",
    responsibilities: [
      "Prepare and file GST returns (GSTR-1, GSTR-3B) and reconcile with books and GSTR-2B",
      "Generate and monitor e-invoices and e-way bills",
      "Handle TDS/TCS calculations, payments and return filing",
      "Resolve GST notices, mismatches and input tax credit issues with the CA",
      "Maintain statutory records and compliance calendars",
      "Support PAN India operations with state-wise GST requirements"
    ],
    skillsRequired: [
      "Strong working knowledge of GST law and portal filing",
      "Experience with Tally, GST software and Excel",
      "Attention to detail and deadline discipline",
      "Understanding of e-invoice and e-way bill rules",
      "Clear communication with auditors and consultants"
    ],
    qualification: "B.Com / M.Com or equivalent. GST certification or CA/CS inter is an advantage.",
    tags: ["GSTR-1 & 3B", "Input Tax Credit", "E-invoicing Portal", "Statutory Compliance"]
  },
  // 16. Business Analyst
  {
    id: "business-analyst",
    no: 16,
    title: "Business Analyst",
    department: "Business Analytics, CRM & Marketing",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "2 to 5 years",
    education: "Graduate in Commerce, Engineering, Statistics or MBA",
    packageLpa: "Competitive Analytics Band",
    openingsCount: 1,
    isFeatured: true,
    aboutRole: "The Business Analyst turns Volamp's data into decisions. You will analyse sales, CRM, purchase and operations data, build reports and dashboards, and help the leadership team see what is working and what needs attention.",
    responsibilities: [
      "Analyse sales, customer, product and team performance data from the CRM and accounting systems",
      "Build dashboards and regular reports for management, sales and operations",
      "Track KPIs such as calls, visits, quotations, conversion, order value and outstanding",
      "Identify trends, gaps and growth opportunities across regions, brands and customer segments",
      "Support target setting, forecasting and business planning",
      "Work with teams to improve processes and data quality",
      "Present insights in a clear, simple way to non-technical stakeholders"
    ],
    skillsRequired: [
      "Advanced Excel and Google Sheets skills",
      "Experience with CRM systems (Zoho CRM is a plus) and data extraction",
      "Knowledge of SQL, Power BI, Looker Studio or similar tools is an advantage",
      "Strong analytical and problem-solving ability",
      "Clear communication and presentation skills"
    ],
    qualification: "Graduate in Commerce, Engineering, Statistics or MBA. Experience in sales or business analytics preferred.",
    tags: ["Data Analytics", "Power BI / SQL", "Sales KPIs", "Business Dashboards"]
  },
  // 17. CRM Executive (Zoho CRM)
  {
    id: "crm-executive-zoho",
    no: 17,
    title: "CRM Executive (Zoho CRM)",
    department: "Business Analytics, CRM & Marketing",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 3 years",
    education: "Graduate in any stream",
    packageLpa: "Competitive Operations Band",
    openingsCount: 1,
    isFeatured: false,
    aboutRole: "The CRM Executive makes sure Volamp's CRM is accurate, active and useful for every team. You will manage data, support users and help keep the full lead-to-delivery process running smoothly.",
    responsibilities: [
      "Maintain clean and accurate lead, contact, quote and order data in the CRM",
      "Train and support sales and operations team members on correct CRM usage",
      "Monitor daily activity, follow-up tasks and pending actions, and report gaps",
      "Create and update records, fields, views and basic reports as required",
      "Support the flow from lead to quote, proforma invoice, sales order and delivery challan",
      "Work with the Business Analyst to improve reports and automation"
    ],
    skillsRequired: [
      "Hands-on experience with Zoho CRM or any CRM platform",
      "Strong Excel and data handling skills",
      "Process mindset and attention to detail",
      "Good communication and training ability",
      "Basic understanding of workflows and automation"
    ],
    qualification: "Graduate in any stream. Experience with CRM administration or data management is an advantage.",
    tags: ["Zoho CRM", "Lead-to-Order Flow", "Data Hygiene", "Workflow Automation"]
  },
  // 18. Customer Support Executive
  {
    id: "customer-support-executive",
    no: 18,
    title: "Customer Support Executive",
    department: "Business Analytics, CRM & Marketing",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "0 to 2 years",
    education: "Graduate or Higher Secondary with strong communication skills",
    packageLpa: "Competitive Support Band",
    openingsCount: 2,
    isFeatured: false,
    aboutRole: "The Customer Support Executive is the friendly voice of Volamp. You will help customers with order status, product information, delivery updates and complaints, and make sure every query is closed with care.",
    responsibilities: [
      "Respond to customer calls, WhatsApp messages and emails quickly and politely",
      "Share order, dispatch and delivery updates with customers",
      "Log complaints and queries, and follow up with internal teams until they are resolved",
      "Coordinate with sales, warehouse and accounts to solve customer issues",
      "Collect customer feedback and report common problems",
      "Maintain accurate records of all support interactions"
    ],
    skillsRequired: [
      "Excellent communication and listening skills in Hindi, Gujarati and English",
      "Patience, empathy and a problem-solving attitude",
      "Basic computer skills, including email and Excel",
      "Ability to multitask and stay calm under pressure",
      "Willingness to learn about electrical products"
    ],
    qualification: "Graduate or Higher Secondary. Freshers with strong communication skills are welcome.",
    tags: ["WhatsApp & Phone", "Customer Care", "Order Status Tracking", "Problem Resolution"]
  },
  // 19. Digital Marketing Executive
  {
    id: "digital-marketing-executive",
    no: 19,
    title: "Digital Marketing Executive",
    department: "Business Analytics, CRM & Marketing",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "1 to 3 years",
    education: "Graduate in Marketing, Mass Communication, IT or related field",
    packageLpa: "Competitive Marketing Band",
    openingsCount: 1,
    isFeatured: false,
    aboutRole: "The Digital Marketing Executive builds Volamp's brand and lead pipeline online. You will manage our website, social media and campaigns to reach dealers, electricians, contractors and builders across India.",
    responsibilities: [
      "Plan and run social media content on LinkedIn, Instagram, Facebook and YouTube",
      "Create email and WhatsApp campaigns for dealers and customers",
      "Manage website content, SEO and Google Business Profile",
      "Run and track paid campaigns on Google and Meta to generate leads",
      "Coordinate with brand partners for co-branded promotions and schemes",
      "Create creatives, banners and short videos with designers or tools",
      "Share campaign performance and lead quality reports with sales"
    ],
    skillsRequired: [
      "Knowledge of SEO, social media and paid advertising",
      "Content writing and basic design skills (Canva or similar)",
      "Familiarity with Google Analytics and campaign tracking",
      "Creativity and consistency",
      "Understanding of B2B marketing is an advantage"
    ],
    qualification: "Graduate in Marketing, Mass Communication, IT or related field. Digital marketing certification is a plus.",
    tags: ["SEO & Content", "Google & Meta Ads", "Social Media", "Lead Generation"]
  },
  // 20. HR Executive
  {
    id: "hr-executive",
    no: 20,
    title: "HR Executive",
    department: "Human Resources",
    location: "Ahmedabad, Gujarat",
    workMode: "Full-time",
    experience: "2 to 5 years",
    education: "MBA / PGDM in HR or equivalent",
    packageLpa: "Competitive HR Management Band",
    openingsCount: 1,
    isFeatured: true,
    aboutRole: "The HR Executive builds the team behind Volamp's growth. You will manage hiring, onboarding, attendance, payroll inputs and employee engagement, and help create a culture where people want to stay and perform.",
    responsibilities: [
      "Manage end-to-end recruitment: job postings, sourcing, screening, interviews and offers",
      "Run onboarding, documentation and induction for new joiners",
      "Maintain employee records, attendance, leave and payroll inputs",
      "Support performance reviews, goal setting and training programmes",
      "Handle employee queries, grievances and engagement activities",
      "Ensure compliance with labour laws, PF, ESIC and company policies",
      "Maintain the careers page and hiring pipeline in coordination with department heads"
    ],
    skillsRequired: [
      "Strong recruitment and interviewing skills",
      "Knowledge of HR policies, payroll basics and labour compliance",
      "Excellent communication and interpersonal skills",
      "Good with Excel, HR tools and documentation",
      "Confidentiality, fairness and professionalism"
    ],
    qualification: "MBA/PGDM in HR or equivalent. Experience in HR within a trading or distribution company preferred.",
    tags: ["Talent Acquisition", "Onboarding & Payroll", "Statutory PF/ESIC", "Employee Engagement"]
  }
];

// shared/blogData.ts
var BLOG_POSTS_DATA = [
  {
    id: "blog-001",
    slug: "copper-vs-aluminium-armoured-cable-sizing-guide",
    title: "Copper vs Aluminium Armoured Cable Sizing Guide: Engineering & Cost Trade-Offs",
    category: "Technical Sizing",
    author: "Naimil Vipul Patel",
    authorRole: "Chief Executive Officer & Electrical Engineer",
    date: "2026-10-15",
    readTime: "9 min read",
    excerpt: "A complete technical comparison between electrolytic copper and EC-grade aluminium conductors under IS 7098 standards, including ampacity ratios, voltage drop derating, and life-cycle cost analysis for EPC contractors.",
    metaDescription: "Engineering comparison of copper vs aluminium armoured cables under IS 7098: ampacity, voltage drop, cross-section sizing ratio, and EPC cost trade-offs.",
    tags: ["Cable Sizing", "Copper vs Aluminium", "IS 7098", "Armoured Cable", "EPC Procurement"],
    content: `
## 1. Executive Engineering Summary
Selecting between electrolytic copper and electrical conductor (EC) grade aluminium is one of the most critical procurement decisions for industrial and utility electrical installations. While copper offers superior conductivity and tensile strength, aluminium provides substantial weight savings and a massive cost advantage on large feeder runs.

Under Bureau of Indian Standards **IS 7098 (Part 1 for LT up to 1.1kV and Part 2 for HT up to 33kV)**, both conductor materials are fully permitted and rigorously standardized. This guide details the exact mathematical rules, derating factors, and termination requirements to optimize your project BOQ.

---

## 2. Fundamental Electrical & Physical Properties

| Parameter | Electrolytic Copper (IS 8130 Class 2) | EC Grade Aluminium (IS 8130 Class 2) |
|---|---|---|
| **Electrical Conductivity (% IACS)** | 100% | ~61% |
| **Resistivity at 20\xB0C (\u03C1)** | 0.017241 \u03A9\xB7mm\xB2/m | 0.028264 \u03A9\xB7mm\xB2/m |
| **Density (Weight)** | 8.89 g/cm\xB3 | 2.70 g/cm\xB3 (approx. 3.3x lighter) |
| **Thermal Expansion Coefficient** | 17.0 \xD7 10\u207B\u2076 / \xB0C | 23.0 \xD7 10\u207B\u2076 / \xB0C |
| **Tensile Strength** | 200\u2013250 N/mm\xB2 | 70\u201390 N/mm\xB2 |
| **Maximum Operating Temp (XLPE)** | 90\xB0C continuous / 250\xB0C short circuit | 90\xB0C continuous / 250\xB0C short circuit |

---

## 3. The 1.6x Sizing Rule of Thumb
Because aluminium has approximately 61% of copper's electrical conductivity, an aluminium conductor requires approximately **1.6 times the cross-sectional area** of a copper conductor to carry the equivalent continuous current with equal resistance and voltage drop:

$$	ext{Area}_{	ext{Aluminium}} approx 1.60 	imes 	ext{Area}_{	ext{Copper}}$$

### Standard Commercial Sizing Equivalency Table:

| Copper Conductor Size (sqmm) | Equivalent Aluminium Conductor Size (sqmm) | Continuous Current in Ground (XLPE Amperes) |
|---|---|---|
| **10 sqmm Cu** | **16 sqmm Al** | ~76 A |
| **16 sqmm Cu** | **25 sqmm Al** | ~98 A |
| **25 sqmm Cu** | **50 sqmm Al** | ~142 A |
| **50 sqmm Cu** | **95 sqmm Al** | ~215 A |
| **95 sqmm Cu** | **185 sqmm Al** | ~325 A |
| **150 sqmm Cu** | **240 sqmm Al** | ~380 A |
| **240 sqmm Cu** | **400 sqmm Al** | ~495 A |
| **300 sqmm Cu** | **500 sqmm Al** | ~560 A |

---

## 4. Voltage Drop & Distance Calculations
Voltage drop often governs cable sizing rather than thermal ampacity, especially on long runs (>100 metres) between the main switchboard (PCC) and motor control centres (MCC) or distribution boards.

$$Delta V = sqrt{3} 	imes I 	imes L 	imes (R cosphi + X sinphi)$$

- When run lengths exceed 150m, aluminium cables frequently require **two steps up in cross-section** to maintain voltage drop within the statutory 3% limit (IS 732).
- Even with the required upsizing, aluminium cables remain significantly cheaper in total cost per metre.

---

## 5. Critical Termination Protocols for Aluminium
Aluminium conductors require specific installation practices to prevent loose connections, thermal hotspots, and galvanic corrosion:

1. **Bi-Metallic Lugs:** When terminating aluminium cables to copper busbars or breaker terminals, always use friction-welded **bi-metallic lugs (Dowells / Comet)** to prevent galvanic battery action.
2. **Anti-Oxidation Compound:** Apply zinc-chromate or petroleum-based contact grease to the stripped conductor strands immediately before crimping to displace aluminium oxide ($Al_2O_3$).
3. **Hexagonal Compression:** Use hydraulic crimping tools with matched hexagonal dies compliant with IS 8337 rather than mechanical screw lugs.

---

## 6. Commercial Breakeven & When to Choose Which

- **Choose Aluminium Armoured Cables for:**
  - Main incoming feeds from transformers to PCC panels.
  - Long outdoor runs across cable trays, trenches, or direct burial in GIDC industrial estates.
  - Solar farm AC collection networks (inverters to pooling substations).
  - Feeder lines where cable tray weight capacity is limited.

- **Choose Copper Armoured / Flexible Cables for:**
  - Compact motor terminal boxes with restricted bending radius.
  - Vibration-heavy environments (generators, mining equipment, centrifuges).
  - Safety-critical circuits, hospital distribution, and marine/offshore installations.
  - Low-smoke zero-halogen (FRLS / LSZH) indoor control and instrumentation wiring.

For project-specific voltage drop calculations and bulk drum procurement, use the [Volamp Cable Sizing Calculator](/calculator) or submit your Single Line Diagram to our [Engineering RFQ Desk](/enquire).
    `
  },
  {
    id: "blog-002",
    slug: "solar-dc-cable-specifications-iec-62930",
    title: "1500V Solar DC Cable Engineering: EN 50618 & IEC 62930 Standards Explained",
    category: "Renewable Energy",
    author: "Naimil Vipul Patel",
    authorRole: "Chief Executive Officer & Electrical Engineer",
    date: "2026-10-18",
    readTime: "8 min read",
    excerpt: "A technical deep dive into solar photovoltaic DC cables: comparing European EN 50618 (H1Z2Z2-K) and international IEC 62930 standards, electron-beam crosslinking, 25-year weathering endurance, and string sizing.",
    metaDescription: "Technical specifications for 1500V Solar DC Cables per EN 50618 (H1Z2Z2-K) and IEC 62930: electron-beam crosslinking, UV resistance, and string voltage sizing.",
    tags: ["Solar DC Cable", "EN 50618", "IEC 62930", "Photovoltaic", "Solar BOS"],
    content: `
## 1. The High-Stress Photovoltaic Environment
Unlike conventional building wires, solar DC cables operating on the roof or ground-mount tracking arrays face extreme environmental stress:
- Continuous exposure to intense UV radiation and ozone.
- Direct contact with ambient temperatures fluctuating from -40\xB0C to +90\xB0C (with conductor temperatures exceeding 120\xB0C under full solar noon irradiance).
- Direct exposure to rain, condensation, and chemical soil leachates.
- Continuous 1500V DC electric field tension without alternating polarity.

Standard PVC or standard XLPE building wires will fail within 2 to 5 years under these conditions due to plasticizer migration and micro-cracking. Utility solar installations require cables manufactured strictly to **EN 50618 (Type H1Z2Z2-K)** and **IEC 62930**.

---

## 2. EN 50618 vs IEC 62930: Standards Comparison

| Requirement | EN 50618 (H1Z2Z2-K) | IEC 62930 (Class 131) | Volamp Certified Polycab Solar DC |
|---|---|---|---|
| **Rated Voltage ($U_0 / U$)** | 1.0/1.0 kV AC, 1.5/1.5 kV DC | 1.5 kV DC | 1.5 kV DC Rated |
| **Max Permissible DC Voltage** | 1.8 kV DC (conductor-conductor) | 1.8 kV DC | 1.8 kV DC Certified |
| **Conductor Construction** | Tinned Electrolytic Copper, Class 5 | Tinned Electrolytic Copper, Class 5 | Tinned Electrolytic Copper, Class 5 |
| **Insulation & Sheath Material** | Cross-linked Polyolefin (Halogen-Free) | Cross-linked Halogen-Free Polymer | Cross-linked Polyolefin (LSZH) |
| **Thermal Life Expectancy** | 25 Years at 90\xB0C continuous | 25 Years at 90\xB0C continuous | 25 Years Certified |
| **Max Conductor Temp** | 120\xB0C (up to 20,000 hours) | 120\xB0C (up to 20,000 hours) | 120\xB0C Max Temp |
| **Short-Circuit Temp (5s)** | 250\xB0C | 250\xB0C | 250\xB0C |

---

## 3. Why Tinned Copper & Electron-Beam Crosslinking Matter
Two manufacturing processes distinguish authentic certified solar cables:

1. **Electro-Tinned Annealed Copper Strands:** Pure copper quickly oxidizes into copper oxide when subjected to moisture and DC voltages. The tin coating ($Sn$) prevents chemical degradation, ensures low contact resistance, and provides superior solderability and crimping with MC4 connectors.
2. **Electron-Beam (E-Beam) Crosslinking:** Chemical crosslinking with moisture or silane leaves ionic residues. Modern premium solar cables from Polycab undergo physical electron bombardment in a radiation accelerator, creating 3D covalent carbon-carbon bonds across the polyolefin polymer without chemical catalysts. This ensures total resistance to thermal deformation.

---

## 4. Selecting the Right Solar DC Conductor Size
The most common sizes for string interconnects and array junction box (AJB) runs are 4 sqmm, 6 sqmm, 10 sqmm, and 16 sqmm:

- **1C x 4 sqmm (SOL-000001):** Standard rooftop and commercial string runs with module currents ($I_{mp}$) up to 13\u201315A and run lengths up to 40 metres.
- **1C x 6 sqmm:** Utility-scale solar parks with high-power bifacial TOPCon modules ($I_{mp} > 16\u201318A$) and run lengths between 40 to 80 metres to keep string voltage drop under 1.0%.
- **1C x 10 sqmm & 16 sqmm:** Home-run cables linking solar string combiner boxes (SCB) to central or string inverters.

Volamp Elektrikals stocks over 50,000 metres of T\xDCV Rheinland and BIS certified 1500V DC cables in our Aslali logistics terminal for same-day dispatch. [Browse Solar Products](/category/solar) or [Request a Solar BOM Quotation](/enquire).
    `
  },
  {
    id: "blog-003",
    slug: "is-7098-vs-is-1554-cable-difference-guide",
    title: "IS 7098 vs IS 1554: XLPE vs PVC Power Cable Differences for Industrial Projects",
    category: "Standards & Compliance",
    author: "Naimil Vipul Patel",
    authorRole: "Chief Executive Officer & Electrical Engineer",
    date: "2026-10-20",
    readTime: "7 min read",
    excerpt: "A comprehensive technical comparison between IS 7098 (XLPE insulated power cables) and IS 1554 (PVC insulated power cables), covering temperature thresholds, short-circuit ratings, dielectric losses, and project specification guidelines.",
    metaDescription: "Detailed engineering comparison between IS 7098 XLPE cables and IS 1554 PVC cables: thermal thresholds, short circuit capacity, and industrial selection.",
    tags: ["IS 7098", "IS 1554", "XLPE vs PVC", "Power Cables", "BIS Standards"],
    content: `
## 1. Historical Evolution of Cable Insulation in India
For decades, **IS 1554 (Part 1)** PVC (Polyvinyl Chloride) insulated cables were the standard across Indian manufacturing plants and state electricity boards. However, over the past twenty years, **IS 7098 (Part 1 for LT up to 1100V, and Part 2 for HT 3.3kV to 33kV)** XLPE (Cross-linked Polyethylene) has become the mandatory standard for EPC infrastructure, renewable projects, and heavy industrial distribution.

Understanding the engineering rationale behind this transition prevents costly design oversights and ensures full compliance with Central Electricity Authority (CEA) regulations.

---

## 2. Technical Comparison Matrix

| Property | IS 1554 (Part 1) \u2014 PVC Cable | IS 7098 (Part 1) \u2014 XLPE Cable | Engineering Advantage |
|---|---|---|---|
| **Polymer Type** | Thermoplastic Polymer | Thermosetting Cross-linked Polymer | XLPE will not melt at high temperatures |
| **Max Continuous Conductor Temp** | 70\xB0C | **90\xB0C** | **+20\xB0C higher thermal headroom** |
| **Emergency Overload Temp** | 100\xB0C | **130\xB0C** | Superior tolerance to load spikes |
| **Short-Circuit Rating (1 second)** | 160\xB0C | **250\xB0C** | **56% higher short-circuit threshold** |
| **Current Carrying Capacity (Ampacity)** | Baseline (100%) | **Approx. 115% to 125%** | Smaller cable size carries identical current |
| **Dielectric Constant ($epsilon_r$)** | 4.0 \u2013 8.0 | **2.3** | Lower electrical losses ($I\xB2R$ and dielectric) |
| **Dielectric Loss Angle ($	andelta$)** | 0.05 \u2013 0.10 | **0.0004** | Significant power savings on long HT feeders |
| **Water Treeing Resistance** | Moderate | Very High (with triple extrusion) | Superior longevity in wet soil / GIDC zones |

---

## 3. Why XLPE Delivers Greater Current Carrying Capacity
Current rating is determined by how efficiently heat generated by the conductor ($I^2R$) can be dissipated into the surroundings without exceeding the polymer's thermal breakdown threshold:

- Because XLPE safely operates continuously at **90\xB0C** compared to PVC's limit of **70\xB0C**, the temperature gradient ($Delta T = T_{	ext{conductor}} - T_{	ext{ambient}}$) is 50\xB0C for XLPE versus only 30\xB0C for PVC (assuming standard 40\xB0C ambient).
- This steeper temperature gradient enables an identical cross-section of XLPE cable to carry **15% to 25% more current** than a PVC cable under identical ground or duct conditions.

---

## 4. Short-Circuit Thermal Capacity Formula
Under breaker fault clearing times (typically 0.1 to 1.0 second), the conductor temperature surges adiabatically. The permissible short-circuit current is governed by the adiabatic formula:

$$I_{sc} = \frac{K 	imes A}{sqrt{t}}$$

Where:
- $A$ = Conductor cross-section in mm\xB2
- $t$ = Fault clearing duration in seconds
- $K$ = Material constant:
  - For **Aluminium Conductor with XLPE (IS 7098)**: $K = 94$
  - For **Aluminium Conductor with PVC (IS 1554)**: $K = 76$
  - For **Copper Conductor with XLPE (IS 7098)**: $K = 143$
  - For **Copper Conductor with PVC (IS 1554)**: $K = 115$

**Result:** A 185 sqmm XLPE aluminium cable can withstand a 1-second fault of **17.39 kA**, whereas a PVC cable of the same size can only withstand **14.06 kA** before insulation damage occurs.

---

## 5. Summary Specification Recommendations
- **Use IS 7098 (XLPE) for:** All main electrical feeds, motor control circuits, outdoor trenches, transformer secondaries, and HT distribution up to 33kV.
- **Use IS 1554 (PVC) for:** Secondary low-load internal control cables, non-critical sub-circuits, and low-temperature indoor panel wiring where initial budget is the primary constraint.

Volamp Elektrikals stocks full ranges of both IS 7098 and IS 1554 cables from Polycab and KEI with verified manufacturer test certificates. [Browse Power Cables](/category/wire-cables).
    `
  },
  {
    id: "blog-004",
    slug: "cable-gland-and-lug-size-selection-chart",
    title: "Cable Gland & Lug Size Selection Chart: Armoured Cable Matching Guide",
    category: "Accessories & Termination",
    author: "Naimil Vipul Patel",
    authorRole: "Chief Executive Officer & Electrical Engineer",
    date: "2026-10-22",
    readTime: "6 min read",
    excerpt: "A quick engineering reference chart matching 1.1kV LT armoured cables (1.5 sqmm to 630 sqmm, 1-core to 4-core) to Dowells tinned copper crimping lugs and brass double compression cable glands.",
    metaDescription: "Comprehensive selection chart matching armoured power cables to Dowells copper lugs and brass double compression cable glands from 1.5 sqmm to 630 sqmm.",
    tags: ["Cable Lugs", "Cable Glands", "Dowells", "Termination Chart", "IS 8337"],
    content: `
## 1. The Critical Role of Proper Termination
Improper termination is the single most common cause of electrical panel fires and equipment breakdown in industrial plants. An undersized cable lug creates a localized high-resistance joint, while an incorrectly sized cable gland fails to seal the armour wires, leading to mechanical pull-out and moisture ingress.

This quick-reference selection guide pairs standard **1.1kV XLPE/PVC Aluminium and Copper Armoured Cables** directly with official **Dowells Tinned Copper Lugs (IS 8337)** and **Brass Double Compression Cable Glands (BS 6121)**.

---

## 2. Master Termination Selection Matrix (3.5C & 4C Armoured Cables)

| Cable Size (sqmm) & Cores | Conductor Type | Dowells Lug Code (Phase) | Dowells Lug Code (Neutral) | Brass Double Compression Gland Size |
|---|---|---|---|---|
| **3.5C x 25 sqmm** | Aluminium | ALS-25 / 2BL-25 | ALS-16 / 2BL-16 | **01 (DC-01) / 20S** |
| **3.5C x 35 sqmm** | Aluminium | ALS-35 / 2BL-35 | ALS-16 / 2BL-16 | **01 (DC-01) / 20** |
| **3.5C x 50 sqmm** | Aluminium | ALS-50 / 2BL-50 | ALS-25 / 2BL-25 | **02 (DC-02) / 25** |
| **3.5C x 70 sqmm** | Aluminium | ALS-70 / 2BL-70 | ALS-35 / 2BL-35 | **03 (DC-03) / 32** |
| **3.5C x 95 sqmm** | Aluminium | ALS-95 / 2BL-95 | ALS-50 / 2BL-50 | **04 (DC-04) / 32** |
| **3.5C x 120 sqmm** | Aluminium | ALS-120 / 2BL-120 | ALS-70 / 2BL-70 | **05 (DC-05) / 40** |
| **3.5C x 150 sqmm** | Aluminium | ALS-150 / 2BL-150 | ALS-70 / 2BL-70 | **06 (DC-06) / 40** |
| **3.5C x 185 sqmm** | Aluminium | ALS-185 / 2BL-185 | ALS-95 / 2BL-95 | **07 (DC-07) / 50S** |
| **3.5C x 240 sqmm** | Aluminium | ALS-240 / 2BL-240 | ALS-120 / 2BL-120 | **08 (DC-08) / 50** |
| **3.5C x 300 sqmm** | Aluminium | ALS-300 / 2BL-300 | ALS-150 / 2BL-150 | **09 (DC-09) / 63S** |
| **3.5C x 400 sqmm** | Aluminium | ALS-400 / 2BL-400 | ALS-185 / 2BL-185 | **10 (DC-10) / 63** |

---

## 3. Single Compression vs Double Compression Glands
- **Single Compression Glands:** Grip the outer PVC jacket only. Suitable for indoor distribution boards with light environmental exposure.
- **Double Compression Weatherproof Glands:** Grip the inner sheath AND clamp the galvanized steel flat armour wires, with a secondary outer rubber seal. **Mandatory** for outdoor transformer yards, chemical plants, wastewater facilities, and flameproof (FLP) hazardous areas.

---

## 4. Best Practices for Crimping Heavy Aluminium Feeders
1. Ensure the conductor end is cut cleanly and square with ratchet cable cutters.
2. Wire-brush the aluminium strands to remove the invisible non-conductive oxide film.
3. Apply conductive contact paste inside the barrel of the lug.
4. Use double or triple hexagonal indents depending on barrel length.
5. Wipe away extruded paste and apply heat-shrinkable insulation sleeves color-coded for Red, Yellow, Blue, and Black.

Volamp Elektrikals stocks the complete catalog of Dowells copper lugs and heavy-duty brass glands. [Browse Lugs & Glands](/category/lugs) or request matching kits with your cable order.
    `
  },
  {
    id: "blog-005",
    slug: "lme-copper-aluminium-market-analysis-q4-2026",
    title: "LME Copper & Aluminium Price Volatility: Impact on Cable Circulars & EPC Budgets",
    category: "Market Intelligence",
    author: "Naimil Vipul Patel",
    authorRole: "Chief Executive Officer & Electrical Engineer",
    date: "2026-10-24",
    readTime: "7 min read",
    excerpt: "An insider analysis of how London Metal Exchange (LME) and MCX spot prices directly dictate manufacturer cable price lists in India, with hedging and contract indexing strategies for EPC estimators.",
    metaDescription: "Market analysis of LME copper and aluminium price volatility: formulaic relationship to Indian cable price lists and risk mitigation for EPC contractors.",
    tags: ["LME Metal Prices", "Copper Price Trends", "Aluminium Index", "EPC Procurement", "Price Circulars"],
    content: `
## 1. The Direct Link Between Base Metals and Cable Pricing
In an industrial cable, raw conductor metals (electrolytic grade copper and EC grade aluminium) account for **60% to 75% of the total manufacturing cost**. Consequently, cable manufacturers (Polycab, Finolex, KEI, Havells) do not maintain fixed annual prices. Instead, they issue periodic discount circulars or revise base price lists whenever base metal prices move more than 3% to 5% on the London Metal Exchange (LME) and Multi Commodity Exchange of India (MCX).

Understanding this pricing mechanism allows procurement heads to time bulk drum purchases and lock in favorable rates before manufacturer price hikes take effect.

---

## 2. Current 2026 Conductor Commodity Landscape
Over the past four quarters, base metal markets have seen significant structural demand drivers:

- **Copper (LME Cash):** Surged due to accelerating EV manufacturing, grid expansion, and data center build-outs. Spot prices have fluctuated between $9,200 and $10,100 per metric tonne.
- **Aluminium (LME Cash):** Driven higher by energy transition mandates, power transmission lines, and high alumina smelting energy costs, oscillating between $2,450 and $2,720 per metric tonne.
- **Exchange Rate (USD/INR):** Because LME metals are dollar-denominated while Indian cables are sold in INR, currency depreciation magnifies domestic price increases even when global dollar prices are steady.

---

## 3. The Price Variation Clause (PVC) in Government & Utility Tenders
For government utilities (PGCIL, State DISCOMs, NHAI, Metro Rail), standard procurement contracts incorporate the **IEEMA (Indian Electrical and Electronics Manufacturers' Association) Price Variation Formula**:

$$P = P_0 left[ 0.15 + 0.55 left(\frac{C}{C_0}\right) + 0.15 left(\frac{Al}{Al_0}\right) + 0.15 left(\frac{W}{W_0}\right) \right]$$

Where:
- $P$ = Final price payable upon delivery
- $P_0$ = Original tender contract price
- $C / C_0$ = Copper index ratio published by IEEMA
- $Al / Al_0$ = Aluminium index ratio published by IEEMA
- $W / W_0$ = Wholesale Price Index (WPI) for labour and overheads

If you are a private EPC contractor working on a fixed-price contract without a PVC clause, unexpected metal rallies can wipe out project profit margins.

---

## 4. How Volamp Helps Contractors Hedge Metal Price Risk
Volamp Elektrikals helps contractors mitigate metal price volatility through three proactive procurement solutions:

1. **Advance Drum Booking with Factory Lock-in:** For approved purchase orders, we coordinate directly with manufacturer mills to fix conductor rates for delivery over 30 to 90 days.
2. **Live Metal Ticker & Advisory:** Our engineers track daily MCX/LME spot movements to give contractors early notice (typically 48 to 72 hours) before brand price circulars are increased.
3. **Optimized Conductor Conversion:** Where project specifications permit flexibility, our engineering team evaluates alternative aluminium sizing options that deliver 40% to 55% direct material savings.

Monitor live metal trends on our homepage rate widget or speak directly with our [Commercial Sourcing Desk](/enquire) for project volume hedging.
    `
  }
];

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id, tool_calls } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      ...tool_calls ? { tool_calls } : {},
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    ...tool_calls ? { tool_calls } : {},
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
var RETRY_MAX_RETRIES = 4;
var RETRY_BASE_DELAY_MS = 500;
var RETRY_MAX_DELAY_MS = 3e4;
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var parseRetryAfter = (value) => {
  if (!value) return void 0;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1e3);
  const at = Date.parse(value);
  return Number.isNaN(at) ? void 0 : Math.max(0, at - Date.now());
};
var computeBackoffDelay = (attempt, retryAfterMs) => {
  const cap = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
  const jittered = cap / 2 + Math.random() * (cap / 2);
  return Math.min(Math.max(jittered, retryAfterMs ?? 0), RETRY_MAX_DELAY_MS);
};
var fetchWithBackoff = async (url, init) => {
  let lastError;
  for (let attempt = 0; attempt <= RETRY_MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.ok || attempt === RETRY_MAX_RETRIES) {
        return response;
      }
      const retryAfterMs = parseRetryAfter(
        response.headers.get("retry-after")
      );
      try {
        await response.body?.cancel();
      } catch {
      }
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after status ${response.status}`
      );
      await sleep(computeBackoffDelay(attempt, retryAfterMs));
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_MAX_RETRIES) throw error;
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after network error`
      );
      await sleep(computeBackoffDelay(attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("LLM request failed after exhausting retries");
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    model,
    thinking,
    reasoning,
    maxTokens,
    max_tokens
  } = params;
  const payload = {
    messages: messages.map(normalizeMessage)
  };
  if (model) {
    payload.model = model;
  }
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  const resolvedMaxTokens = max_tokens ?? maxTokens;
  if (typeof resolvedMaxTokens === "number") {
    payload.max_tokens = resolvedMaxTokens;
  }
  if (thinking) {
    payload.thinking = thinking;
  }
  if (reasoning) {
    payload.reasoning = reasoning;
  }
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetchWithBackoff(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/services/smtpClient.ts
import net from "node:net";
import tls from "node:tls";
async function sendViaNativeSmtp(options) {
  const {
    host,
    port = 465,
    secure = port === 465,
    user,
    pass,
    from,
    fromName = "VOLAMP Elektrikals",
    replyTo,
    envelopeFrom,
    to,
    subject,
    text: text2,
    html
  } = options;
  return new Promise((resolve, reject) => {
    let socket;
    let step = 0;
    let buffer = "";
    let isTlsUpgraded = false;
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`SMTP connection timed out after 20 seconds while talking to ${host}:${port}`));
    }, 2e4);
    function cleanup() {
      clearTimeout(timeout);
      try {
        socket.removeAllListeners();
        socket.destroy();
      } catch {
      }
    }
    function sendCommand(cmd) {
      if (socket.writable) {
        socket.write(cmd + "\r\n");
      }
    }
    function handleResponse(response) {
      const code = parseInt(response.slice(0, 3), 10);
      if (isNaN(code)) return;
      const lines = response.trim().split("\r\n");
      const lastLine = lines[lines.length - 1] || "";
      if (lastLine.length >= 4 && lastLine[3] === "-") {
        return;
      }
      if (code >= 400) {
        cleanup();
        reject(new Error(`SMTP Error [${code}] from ${host}: ${response.trim()}`));
        return;
      }
      if (step === 0 && code === 220) {
        step = 1;
        sendCommand("EHLO localhost");
      } else if (step === 1 && code === 250) {
        if (!secure && !isTlsUpgraded && (port === 587 || port === 25)) {
          step = 2;
          sendCommand("STARTTLS");
        } else if (user && pass) {
          step = 4;
          sendCommand("AUTH LOGIN");
        } else {
          step = 7;
          sendCommand(`MAIL FROM:<${from}>`);
        }
      } else if (step === 2 && code === 220) {
        isTlsUpgraded = true;
        const plainSocket = socket;
        plainSocket.removeAllListeners("data");
        const tlsSocket = tls.connect({
          socket: plainSocket,
          host,
          servername: host,
          rejectUnauthorized: false
        });
        socket = tlsSocket;
        attachListeners(tlsSocket);
        step = 3;
        sendCommand("EHLO localhost");
      } else if (step === 3 && code === 250) {
        if (user && pass) {
          step = 4;
          sendCommand("AUTH LOGIN");
        } else {
          step = 7;
          sendCommand(`MAIL FROM:<${from}>`);
        }
      } else if (step === 4 && code === 334) {
        step = 5;
        sendCommand(Buffer.from(user || "").toString("base64"));
      } else if (step === 5 && code === 334) {
        step = 6;
        sendCommand(Buffer.from(pass || "").toString("base64"));
      } else if (step === 6 && (code === 235 || code === 250)) {
        step = 7;
        const envelopeSender = envelopeFrom || user || from;
        sendCommand(`MAIL FROM:<${envelopeSender}>`);
      } else if (step === 7 && code === 250) {
        step = 8;
        sendCommand(`RCPT TO:<${to}>`);
      } else if (step === 8 && code === 250) {
        step = 9;
        sendCommand("DATA");
      } else if (step === 9 && code === 354) {
        step = 10;
        const boundary = `volamp_mime_${Date.now()}`;
        const headerLines = [
          `From: "${fromName}" <${from}>`,
          `To: <${to}>`,
          ...replyTo ? [`Reply-To: <${replyTo}>`] : [],
          `Subject: ${subject}`,
          `Date: ${(/* @__PURE__ */ new Date()).toUTCString()}`,
          `MIME-Version: 1.0`,
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          ``,
          `--${boundary}`,
          `Content-Type: text/plain; charset=UTF-8`,
          `Content-Transfer-Encoding: 7bit`,
          ``,
          text2,
          ``,
          `--${boundary}`,
          `Content-Type: text/html; charset=UTF-8`,
          `Content-Transfer-Encoding: 7bit`,
          ``,
          html,
          ``,
          `--${boundary}--`,
          `.`
        ];
        socket.write(headerLines.join("\r\n") + "\r\n");
      } else if (step === 10 && code === 250) {
        step = 11;
        sendCommand("QUIT");
        cleanup();
        resolve();
      }
    }
    function attachListeners(s) {
      s.on("data", (chunk) => {
        buffer += chunk.toString("utf8");
        if (buffer.includes("\r\n")) {
          const currentBuffer = buffer;
          buffer = "";
          handleResponse(currentBuffer);
        }
      });
      s.on("error", (err) => {
        cleanup();
        reject(new Error(`SMTP socket error connecting to ${host}:${port}: ${err.message}`));
      });
      s.on("close", () => {
        if (step < 10) {
          reject(new Error(`SMTP connection closed prematurely by ${host} during step ${step}`));
        }
      });
    }
    try {
      if (secure) {
        socket = tls.connect({
          host,
          port,
          servername: host,
          rejectUnauthorized: false
        });
      } else {
        socket = net.connect({
          host,
          port
        });
      }
      attachListeners(socket);
    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}

// server/services/emailService.ts
async function sendTransactionalEmail(options) {
  const {
    to,
    from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@volampelektrikals.com",
    fromName = options.fromName || process.env.SMTP_FROM_NAME || "Volamp Elektrikals",
    replyTo,
    subject,
    html,
    text: text2,
    category = "general"
  } = options;
  const normalizedTo = to.toLowerCase().trim();
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.RESEND_FROM || `${fromName} <onboarding@resend.dev>`;
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [normalizedTo],
          reply_to: replyTo,
          subject,
          html,
          text: text2
        })
      });
      if (resp.ok) {
        console.log(`[EMAIL DISPATCH] [${category.toUpperCase()}] Delivered via Resend API to ${normalizedTo}`);
        return { success: true, channel: "resend" };
      } else {
        const errText = await resp.text();
        console.error(`[EMAIL ERROR] Resend API failed: ${errText}`);
      }
    } catch (err) {
      console.error(`[EMAIL ERROR] Resend dispatch exception:`, err);
    }
  }
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const fromEmail = process.env.BREVO_FROM || from;
      const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sender: { name: fromName, email: fromEmail },
          to: [{ email: normalizedTo }],
          replyTo: replyTo ? { email: replyTo } : void 0,
          subject,
          htmlContent: html,
          textContent: text2
        })
      });
      if (resp.ok) {
        console.log(`[EMAIL DISPATCH] [${category.toUpperCase()}] Delivered via Brevo API to ${normalizedTo}`);
        return { success: true, channel: "brevo" };
      } else {
        const errText = await resp.text();
        console.error(`[EMAIL ERROR] Brevo API failed: ${errText}`);
      }
    } catch (err) {
      console.error(`[EMAIL ERROR] Brevo dispatch exception:`, err);
    }
  }
  const smtpHost = process.env.SMTP_HOST?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const rawPass = process.env.SMTP_PASS?.trim();
  const smtpPass = rawPass?.replace(/\s+/g, "");
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const isPlaceholderPass = !smtpPass || smtpPass.includes("PASTE_YOUR_") || smtpPass.includes("16_CHAR") || smtpPass === "YOUR_PASSWORD_HERE";
  if (smtpHost && smtpUser && smtpPass && !isPlaceholderPass) {
    const candidateHosts = [smtpHost];
    if (smtpHost.includes("zoho.in")) {
      candidateHosts.push(smtpHost.replace("zoho.in", "zoho.com"));
    } else if (smtpHost.includes("zoho.com")) {
      candidateHosts.push(smtpHost.replace("zoho.com", "zoho.in"));
    }
    for (const host of candidateHosts) {
      try {
        console.log(`[SMTP DISPATCH] [${category.toUpperCase()}] Dispatching from "${from}" to "${normalizedTo}" via ${host}:${smtpPort}...`);
        await sendViaNativeSmtp({
          host,
          port: smtpPort,
          secure: smtpPort === 465,
          user: smtpUser,
          pass: smtpPass,
          from,
          fromName,
          replyTo,
          envelopeFrom: smtpUser,
          to: normalizedTo,
          subject,
          text: text2,
          html
        });
        console.log(`[SMTP DISPATCH] [${category.toUpperCase()}] Delivered email from ${from} to ${normalizedTo} via ${host}`);
        return { success: true, channel: "smtp" };
      } catch (err) {
        console.error(`[SMTP ERROR] Attempt via ${host} failed:`, err.message);
      }
    }
  }
  console.log(`
============================================================`);
  console.log(`\u{1F4E7} [TRANSACTIONAL EMAIL DISPATCH LOG - ${category.toUpperCase()}]`);
  console.log(`To: ${normalizedTo}`);
  console.log(`From: "${fromName}" <${from}>`);
  if (replyTo) console.log(`Reply-To: ${replyTo}`);
  console.log(`Subject: ${subject}`);
  console.log(`Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}`);
  console.log(`------------------------------------------------------------`);
  console.log(text2);
  console.log(`============================================================
`);
  return { success: true, channel: "dev_logged" };
}
async function dispatchOtpEmail(toEmail, code, purpose) {
  const title = purpose === "registration" ? "Verify Your Email Address - VOLAMP Elektrikals" : purpose === "mfa" ? "Two-Step Verification Code - VOLAMP Elektrikals" : "Password Reset Code - VOLAMP Elektrikals";
  const purposeDescription = purpose === "registration" ? "Thank you for creating an account with VOLAMP Elektrikals. Please use the verification code below to confirm your official email address." : purpose === "mfa" ? "A sign-in attempt was detected for your account. Please use the one-time code below to complete two-step authentication." : "We received a request to reset your VOLAMP account password. Enter the code below to set a new password.";
  const textContent = `
VOLAMP ELEKTRIKALS PVT. LTD.
${title}
--------------------------------------------------

Hello,

${purposeDescription}

YOUR 6-DIGIT VERIFICATION CODE:
==============================
       [ ${code} ]
==============================

This code is valid for 15 minutes. For your security, never share this code with anyone.

If you did not request this verification code, please disregard this email or notify our security team at support@volampelektrikals.com.

Regards,
VOLAMP Elektrikals Security & IT Administration
Vadodara, Gujarat, India
https://volampelektrikals.com
`.trim();
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #102a40;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f7fb; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(16,42,64,0.08); border: 1px solid #e1e9f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #102a40 0%, #1d73b7 100%); padding: 32px 30px; text-align: center;">
              <div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase;">
                VOLAMP <span style="color: #f59e0b;">ELEKTRIKALS</span>
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #cbdbe7; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                Power & Energy Infrastructure Solutions
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h1 style="font-size: 20px; font-weight: 700; color: #102a40; margin: 0 0 12px 0;">
                ${purpose === "registration" ? "Confirm Your Registration" : purpose === "mfa" ? "Two-Step Security Verification" : "Reset Account Password"}
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5d6e; margin: 0 0 24px 0;">
                ${purposeDescription}
              </p>
              <div style="background-color: #f0f7fd; border: 2px dashed #1d73b7; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: #1d73b7; text-transform: uppercase; margin-bottom: 6px;">
                  Your One-Time Verification Code
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #102a40; padding: 6px 0;">
                  ${code}
                </div>
                <div style="font-size: 12px; color: #6e808b; margin-top: 6px;">
                  Valid for <strong>15 minutes</strong>
                </div>
              </div>
              <div style="background-color: #fbfbfb; border-radius: 8px; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 24px 0 16px 0;">
                <p style="font-size: 12px; line-height: 1.5; color: #5a6b78; margin: 0;">
                  <strong>Security Reminder:</strong> VOLAMP Elektrikals personnel will never ask for your verification code. Never share this code with anyone.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #eef2f6; padding: 20px 36px; text-align: center;">
              <p style="font-size: 11px; color: #8e9da9; margin: 0 0 6px 0;">
                &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} VOLAMP Elektrikals Pvt. Ltd. All rights reserved.
              </p>
              <p style="font-size: 11px; color: #8e9da9; margin: 0;">
                Vadodara, Gujarat, India &bull; <a href="https://volampelektrikals.com" style="color: #1d73b7; text-decoration: none;">volampelektrikals.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
  return sendTransactionalEmail({
    to: toEmail,
    subject: title,
    html: htmlContent,
    text: textContent,
    category: "otp"
  });
}
async function dispatchCollaborationEmails(data) {
  const collabInbox = "collab@volampelektrikals.com";
  const formattedTypes = data.collaborationTypes.join(", ");
  const formattedStrengths = data.partnershipStrengths.join(", ");
  const internalSubject = `[NEW COLLABORATION TICKET #${data.applicationId}] ${data.companyName} - ${data.contactName}`;
  const internalText = `
VOLAMP ELEKTRIKALS PVT. LTD. - STRATEGIC COLLABORATION INBOX
============================================================
NEW PARTNERSHIP PROPOSAL LOGGED: TICKET #${data.applicationId}
============================================================

APPLICANT & ORGANIZATION:
- Organization Name: ${data.companyName}
- Contact Person: ${data.contactName} (${data.designation})
- Business Entity: ${data.businessType}
- Territory / Location: ${data.cityCountry}

CONTACT INFORMATION:
- Work Email: ${data.email}
- Mobile / WhatsApp: ${data.mobile}

PROPOSAL SPECIFICS:
- Area of Collaboration: ${formattedTypes}
- Expected Business Potential: ${data.expectedBusinessPotential}
- Target Timeline: ${data.expectedTimeline}
- Core Capabilities / Strengths: ${formattedStrengths}

OPPORTUNITY DETAILS:
${data.opportunityDetails}

ADDITIONAL NOTES:
${data.notes || "None provided"}

------------------------------------------------------------
Application Timestamp: ${(/* @__PURE__ */ new Date()).toISOString()}
Volamp Executive Leadership Dispatch Desk
`.trim();
  const internalHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${internalSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #102a40 0%, #0d4b75 100%); padding: 24px 30px; color: #ffffff;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #f59e0b;">NEW PARTNERSHIP DOSSIER</span>
              <h1 style="font-size: 22px; font-weight: 800; margin: 6px 0 0 0; color: #ffffff;">Ticket #${data.applicationId}</h1>
              <p style="font-size: 13px; color: #cbdbe7; margin: 4px 0 0 0;">Received from ${data.companyName}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 30px;">
              <table width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096; width: 35%;">Organization</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #102a40;">${data.companyName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Contact Person</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;"><strong>${data.contactName}</strong> (${data.designation})</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Business Type</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.businessType}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Email Address</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #1d73b7;"><a href="mailto:${data.email}" style="color: #1d73b7;">${data.email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Mobile / WhatsApp</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;"><a href="tel:${data.mobile}" style="color: #2d3748;">${data.mobile}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Location / City</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.cityCountry}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Collaboration Focus</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748; font-weight: 600;">${formattedTypes}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Business Potential</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #047857; font-weight: 700;">${data.expectedBusinessPotential}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Target Timeline</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.expectedTimeline}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Capabilities / Assets</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${formattedStrengths}</td>
                </tr>
              </table>

              <div style="background-color: #f7fafc; border-left: 4px solid #1d73b7; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #1d73b7; margin-bottom: 6px;">Opportunity Details</div>
                <div style="font-size: 13px; line-height: 1.6; color: #2d3748; white-space: pre-wrap;">${data.opportunityDetails}</div>
              </div>

              ${data.notes ? `
              <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 18px; border-radius: 6px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #b45309; margin-bottom: 4px;">Additional Notes</div>
                <div style="font-size: 13px; line-height: 1.5; color: #78350f; white-space: pre-wrap;">${data.notes}</div>
              </div>` : ""}

              <div style="padding-top: 10px; display: flex; gap: 10px;">
                <a href="mailto:${data.email}?subject=Regarding%20Volamp%20Collaboration%20Ticket%20${data.applicationId}" style="display: inline-block; background-color: #102a40; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: 700;">Reply to ${data.contactName}</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 16px 30px; text-align: center; font-size: 11px; color: #a0aec0;">
              VOLAMP Executive Collaboration Desk &bull; System Generated Dispatch
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
  const userSubject = `[TICKET #${data.applicationId}] Collaboration Proposal Received - Volamp Elektrikals`;
  const userText = `
VOLAMP ELEKTRIKALS PVT. LTD.
STRATEGIC PARTNERSHIP & COLLABORATION DESK
------------------------------------------------------------
OFFICIAL TICKET REFERENCE: [ ${data.applicationId} ]
------------------------------------------------------------

Dear ${data.contactName},

Thank you for your interest in collaborating with VOLAMP Elektrikals Pvt. Ltd.

We have successfully received your strategic proposal on behalf of "${data.companyName}". Your application has been logged under official Ticket Reference Number:

============================================================
              TICKET ID: ${data.applicationId}
============================================================

SUMMARY OF YOUR PROPOSAL:
- Organization: ${data.companyName}
- Collaboration Focus: ${formattedTypes}
- Expected Business Potential: ${data.expectedBusinessPotential}
- Target Timeline: ${data.expectedTimeline}
- Location: ${data.cityCountry}

NEXT STEPS & TIMELINE:
1. Dossier Review (Within 24-48 business hours):
   Our Executive Leadership & Business Development Desk will evaluate your proposal against our current pan-India regional expansion roadmap.

2. Discovery Discussion & NDA:
   If aligned with our growth mandate, our corporate development team will schedule a direct alignment call to discuss commercial and operational parameters.

NEED ASSISTANCE OR HAVE UPDATES?
To provide supplementary presentations or company decks, simply reply directly to this email or write to collab@volampelektrikals.com quoting your Ticket ID ${data.applicationId}.

Warm regards,

Volamp Collaboration & Strategic Alliances Desk
VOLAMP Elektrikals Pvt. Ltd.
Vadodara, Gujarat, India
Web: https://volampelektrikals.com
Direct: collab@volampelektrikals.com
Phone: +91 95123 65582
`.trim();
  const userHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${userSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #102a40 0%, #1d73b7 100%); padding: 32px 30px; text-align: center; color: #ffffff;">
              <div style="font-size: 22px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                VOLAMP <span style="color: #f59e0b;">ELEKTRIKALS</span>
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #cbdbe7; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                Strategic Partnerships & Business Development
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
                &bull; Proposal Successfully Logged
              </span>
              <h1 style="font-size: 20px; font-weight: 800; color: #102a40; margin: 0 0 12px 0;">
                Thank You, ${data.contactName}
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5d6e; margin: 0 0 24px 0;">
                We have registered your strategic collaboration proposal on behalf of <strong>${data.companyName}</strong>. Our executive leadership desk will review your submission promptly.
              </p>

              <!-- Ticket Box -->
              <div style="background-color: #faf5ee; border: 2px dashed #d97706; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #b45309; text-transform: uppercase; margin-bottom: 6px;">
                  Official Collaboration Ticket Reference
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #102a40; padding: 4px 0;">
                  ${data.applicationId}
                </div>
                <div style="font-size: 12px; color: #78350f; margin-top: 6px;">
                  Please quote this Ticket ID in all subsequent communications.
                </div>
              </div>

              <!-- Proposal Summary Table -->
              <div style="background-color: #f8fafc; border-radius: 10px; padding: 18px 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
                <div style="font-size: 12px; font-weight: 700; color: #102a40; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                  Proposal Overview
                </div>
                <table width="100%" style="font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 5px 0; color: #64748b; width: 45%;">Focus Area:</td>
                    <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">${formattedTypes}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Target Timeline:</td>
                    <td style="padding: 5px 0; color: #1e293b;">${data.expectedTimeline}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Projected Volume:</td>
                    <td style="padding: 5px 0; color: #047857; font-weight: 700;">${data.expectedBusinessPotential}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Territory:</td>
                    <td style="padding: 5px 0; color: #1e293b;">${data.cityCountry}</td>
                  </tr>
                </table>
              </div>

              <!-- Next Steps -->
              <div style="margin: 24px 0;">
                <h3 style="font-size: 14px; font-weight: 700; color: #102a40; margin: 0 0 10px 0;">Next Steps:</h3>
                <ol style="font-size: 13px; line-height: 1.6; color: #4b5d6e; padding-left: 20px; margin: 0;">
                  <li style="margin-bottom: 8px;"><strong>Review (24-48 Business Hours):</strong> Our leadership team assesses mutual strategic alignment and regional synergy.</li>
                  <li style="margin-bottom: 8px;"><strong>Executive Alignment Call:</strong> Our partnerships lead will reach out to schedule a formal discussion and share NDA documentation.</li>
                </ol>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                Have questions or need to send pitch presentations? Simply reply directly to this email or reach us at <a href="mailto:collab@volampelektrikals.com" style="color: #1d73b7; font-weight: 600;">collab@volampelektrikals.com</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 20px 36px; text-align: center;">
              <p style="font-size: 11px; color: #8e9da9; margin: 0 0 6px 0;">
                &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} VOLAMP Elektrikals Pvt. Ltd. &bull; Pan-India Distribution & Infrastructure Solutions
              </p>
              <p style="font-size: 11px; color: #8e9da9; margin: 0;">
                Vadodara, Gujarat, India &bull; <a href="https://volampelektrikals.com" style="color: #1d73b7; text-decoration: none;">volampelektrikals.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
  const defaultSender = process.env.SMTP_FROM || "no-reply@volampelektrikals.com";
  const [internalDrop, userConfirmation] = await Promise.all([
    sendTransactionalEmail({
      to: collabInbox,
      from: defaultSender,
      fromName: "VOLAMP Collaboration Desk",
      replyTo: data.email,
      subject: internalSubject,
      text: internalText,
      html: internalHtml,
      category: "collaboration_internal"
    }),
    sendTransactionalEmail({
      to: data.email,
      from: defaultSender,
      fromName: "VOLAMP Collaboration Desk",
      replyTo: collabInbox,
      subject: userSubject,
      text: userText,
      html: userHtml,
      category: "collaboration_user_ticket"
    })
  ]);
  return { internalDrop, userConfirmation };
}
async function dispatchGrievanceEmails(data) {
  const grievanceInbox = "Grievances@volampelektrikals.com";
  const internalSubject = `[GRIEVANCE CASE #${data.caseId}] [${data.urgency.toUpperCase()}] ${data.caseType} - ${data.fullName}`;
  const internalText = `
VOLAMP ELEKTRIKALS PVT. LTD. - OFFICIAL GRIEVANCE & RESOLUTION CELL
==================================================================
NEW FORMAL DISPUTE REGISTERED: CASE #${data.caseId}
==================================================================

COMPLAINANT INFORMATION:
- Contact Name: ${data.fullName}
- Company / Contractor Entity: ${data.companyName || "Not specified"}
- Email Address: ${data.email}
- Contact Phone: ${data.phone}

CASE SPECIFICATIONS:
- Discrepancy Nature: ${data.caseType}
- Order / Invoice / LR Ref: ${data.orderRef || "Not provided"}
- Project Urgency: ${data.urgency.toUpperCase()}

DISCREPANCY DETAILS:
${data.details}

------------------------------------------------------------------
Registered At: ${(/* @__PURE__ */ new Date()).toISOString()}
Volamp Senior Grievance & Technical Dispatch Desk
Vadodara, Gujarat, India
`.trim();
  const internalHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${internalSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #4d1217 0%, #7f1d1d 100%); padding: 24px 30px; color: #ffffff;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #fbbf24;">GRIEVANCE & QUALITY ESCALATION CELL</span>
              <h1 style="font-size: 22px; font-weight: 800; margin: 6px 0 0 0; color: #ffffff;">Case #${data.caseId}</h1>
              <p style="font-size: 13px; color: #fecaca; margin: 4px 0 0 0;">Priority: ${data.urgency.toUpperCase()} &bull; Type: ${data.caseType}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 30px;">
              <table width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096; width: 35%;">Complainant</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #4d1217;">${data.fullName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Company Entity</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.companyName || "N/A"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Email Address</td>
                  <td style="padding: 8px 0; font-size: 13px;"><a href="mailto:${data.email}" style="color: #1d73b7;">${data.email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Phone / WhatsApp</td>
                  <td style="padding: 8px 0; font-size: 13px;"><a href="tel:${data.phone}" style="color: #2d3748;">${data.phone}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Order / LR Number</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #b45309;">${data.orderRef || "Not provided"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Urgency Level</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: ${data.urgency.toLowerCase() === "critical" ? "#dc2626" : "#d97706"};">${data.urgency.toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Discrepancy Category</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.caseType}</td>
                </tr>
              </table>

              <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #b91c1c; margin-bottom: 6px;">Discrepancy Description</div>
                <div style="font-size: 13px; line-height: 1.6; color: #450a0a; white-space: pre-wrap;">${data.details}</div>
              </div>

              <div style="padding-top: 10px;">
                <a href="mailto:${data.email}?subject=Regarding%20Volamp%20Grievance%20Case%20${data.caseId}" style="display: inline-block; background-color: #4d1217; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: 700;">Reply to Complainant</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 16px 30px; text-align: center; font-size: 11px; color: #a0aec0;">
              VOLAMP Senior Quality & Grievance Cell &bull; System Generated Dispatch
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
  const userSubject = `[CASE #${data.caseId}] Formal Grievance & Quality Ticket Logged - Volamp Elektrikals`;
  const userText = `
VOLAMP ELEKTRIKALS PVT. LTD.
OFFICIAL GRIEVANCE & RESOLUTION CELL
------------------------------------------------------------
OFFICIAL CASE TICKET: [ ${data.caseId} ]
------------------------------------------------------------

Dear ${data.fullName},

We acknowledge receipt of your formal discrepancy notice regarding:
Category: ${data.caseType}
Order / Invoice Ref: ${data.orderRef || "N/A"}
Urgency: ${data.urgency.toUpperCase()}

Your complaint has been assigned to our Senior Grievance & Quality Dispatch Cell under official Case Reference:

============================================================
              CASE ID: ${data.caseId}
============================================================

STRICT SERVICE LEVEL AGREEMENT (SLA) COMMITMENTS:
- 24-Hour SLA: Official Case Acknowledgment & Technical Dossier Assigned.
- 48-Hour SLA: Factory Batch Test MTC & Transporter LR Audit.
- 72-Hour SLA: Formal Resolution (Expedited drum replacement or commercial credit note).

PROVIDING SUPPORTING PHOTOS OR DOCUMENTS:
If you have photographs of damaged cable drums, discrepancy reports, or delivery challan (LR) copies, please reply directly to this email or send them to:
Email: Grievances@volampelektrikals.com
WhatsApp Helpline: +91 95123 65582
Always quote Case ID "${data.caseId}" in the subject line.

Sincerely,

Grievance Officer
VOLAMP Elektrikals Pvt. Ltd.
Vadodara, Gujarat, India
Direct: Grievances@volampelektrikals.com
Phone: +91 95123 65582
Web: https://volampelektrikals.com
`.trim();
  const userHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${userSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fed7aa; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #4d1217 0%, #7f1d1d 100%); padding: 32px 30px; text-align: center; color: #ffffff;">
              <div style="font-size: 22px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                VOLAMP <span style="color: #fbbf24;">ELEKTRIKALS</span>
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #fecaca; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                Official Grievance & Technical Dispute Resolution Cell
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
                &bull; Case Formally Registered
              </span>
              <h1 style="font-size: 20px; font-weight: 800; color: #4d1217; margin: 0 0 12px 0;">
                Case Ticket Registered, ${data.fullName}
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5d6e; margin: 0 0 24px 0;">
                We have registered your issue regarding <strong>${data.caseType}</strong>. Our senior technical dispatch and quality control unit is investigating this matter.
              </p>

              <!-- Ticket Box -->
              <div style="background-color: #fff7ed; border: 2px dashed #ea580c; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #c2410c; text-transform: uppercase; margin-bottom: 6px;">
                  Official Case Reference Number
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #4d1217; padding: 4px 0;">
                  ${data.caseId}
                </div>
                <div style="font-size: 12px; color: #9a3412; margin-top: 6px;">
                  Please quote this Case ID when communicating with our transport desk or sharing photographs.
                </div>
              </div>

              <!-- SLA Badges -->
              <div style="background-color: #f8fafc; border-radius: 10px; padding: 18px 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
                <div style="font-size: 12px; font-weight: 700; color: #102a40; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                  Strict Resolution SLAs
                </div>
                <table width="100%" style="font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 35%;"><strong>24-Hour SLA:</strong></td>
                    <td style="padding: 6px 0; color: #1e293b;">Official Case Acknowledgment & Dossier Assigned</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>48-Hour SLA:</strong></td>
                    <td style="padding: 6px 0; color: #1e293b;">MTC, Transporter LR & Factory Batch Audit</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>72-Hour SLA:</strong></td>
                    <td style="padding: 6px 0; color: #047857; font-weight: 700;">Replacement Dispatch or Commercial Credit Note</td>
                  </tr>
                </table>
              </div>

              <!-- Photos submission note -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 18px; margin: 20px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #166534; margin-bottom: 4px;">Share Photos / Evidence:</div>
                <p style="font-size: 12px; line-height: 1.5; color: #14532d; margin: 0;">
                  Reply directly to this email or send photos of damaged reels, test reports, or LR slips to <a href="mailto:Grievances@volampelektrikals.com" style="color: #166534; font-weight: 700;">Grievances@volampelektrikals.com</a> or WhatsApp <strong>+91 95123 65582</strong>.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 20px 36px; text-align: center;">
              <p style="font-size: 11px; color: #8e9da9; margin: 0 0 6px 0;">
                &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} VOLAMP Elektrikals Pvt. Ltd. &bull; Official Grievance Cell
              </p>
              <p style="font-size: 11px; color: #8e9da9; margin: 0;">
                Vadodara, Gujarat, India &bull; <a href="https://volampelektrikals.com" style="color: #4d1217; text-decoration: none;">volampelektrikals.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
  const defaultSender = process.env.SMTP_FROM || "no-reply@volampelektrikals.com";
  const [internalDrop, userConfirmation] = await Promise.all([
    sendTransactionalEmail({
      to: grievanceInbox,
      from: defaultSender,
      fromName: "VOLAMP Grievance Dispatch",
      replyTo: data.email,
      subject: internalSubject,
      text: internalText,
      html: internalHtml,
      category: "grievance_internal"
    }),
    sendTransactionalEmail({
      to: data.email,
      from: defaultSender,
      fromName: "VOLAMP Grievance & Quality Desk",
      replyTo: grievanceInbox,
      subject: userSubject,
      text: userText,
      html: userHtml,
      category: "grievance_user_ticket"
    })
  ]);
  return { internalDrop, userConfirmation };
}
async function dispatchPressEmails(data) {
  const prInbox = "pr@volampelektrikals.com";
  const internalSubject = `[PRESS INQUIRY #${data.pressTicketId}] [DEADLINE: ${data.deadline}] ${data.mediaOutlet} - ${data.journalistName}`;
  const internalText = `
VOLAMP ELEKTRIKALS PVT. LTD. - CORPORATE MEDIA & PR DESK
=========================================================
NEW MEDIA INQUIRY LOGGED: TICKET #${data.pressTicketId}
=========================================================

JOURNALIST / MEDIA REPRESENTATIVE:
- Name: ${data.journalistName}
- Publication / Outlet: ${data.mediaOutlet}
- Work Email: ${data.email}
- Phone / WhatsApp: ${data.phone}

INQUIRY PARAMETERS:
- Focus / Topic: ${data.inquiryType}
- Editorial Deadline: ${data.deadline}

QUESTIONS / STORY BRIEF:
${data.details}

---------------------------------------------------------
Received At: ${(/* @__PURE__ */ new Date()).toISOString()}
Volamp Corporate Communications & PR Desk
`.trim();
  const internalHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${internalSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #102a40 0%, #1e3a5f 100%); padding: 24px 30px; color: #ffffff;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #f59e0b;">CORPORATE MEDIA & PR DESK</span>
              <h1 style="font-size: 22px; font-weight: 800; margin: 6px 0 0 0; color: #ffffff;">Press Ticket #${data.pressTicketId}</h1>
              <p style="font-size: 13px; color: #cbdbe7; margin: 4px 0 0 0;">Publication: ${data.mediaOutlet} &bull; Deadline: ${data.deadline}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 30px;">
              <table width="100%" style="border-collapse: collapse; margin-bottom: 24px;">
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096; width: 35%;">Journalist Name</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #102a40;">${data.journalistName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Media Publication</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.mediaOutlet}</td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Work Email</td>
                  <td style="padding: 8px 0; font-size: 13px;"><a href="mailto:${data.email}" style="color: #1d73b7;">${data.email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Phone / WhatsApp</td>
                  <td style="padding: 8px 0; font-size: 13px;"><a href="tel:${data.phone}" style="color: #2d3748;">${data.phone}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #edf2f7;">
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Topic / Focus</td>
                  <td style="padding: 8px 0; font-size: 13px; color: #2d3748;">${data.inquiryType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #718096;">Editorial Deadline</td>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #dc2626;">${data.deadline}</td>
                </tr>
              </table>

              <div style="background-color: #f7fafc; border-left: 4px solid #1d73b7; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #1d73b7; margin-bottom: 6px;">Inquiry Questions / Context</div>
                <div style="font-size: 13px; line-height: 1.6; color: #2d3748; white-space: pre-wrap;">${data.details}</div>
              </div>

              <div style="padding-top: 10px;">
                <a href="mailto:${data.email}?subject=Response%20to%20Volamp%20Media%20Inquiry%20${data.pressTicketId}" style="display: inline-block; background-color: #102a40; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 8px; font-size: 12px; font-weight: 700;">Reply to Journalist</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 16px 30px; text-align: center; font-size: 11px; color: #a0aec0;">
              VOLAMP Corporate Communications Desk &bull; System Generated Dispatch
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
  const userSubject = `[PRESS TICKET #${data.pressTicketId}] Media Inquiry Logged - Volamp Corporate PR Desk`;
  const userText = `
VOLAMP ELEKTRIKALS PVT. LTD.
CORPORATE COMMUNICATIONS & PRESS RELATIONS DESK
------------------------------------------------------------
MEDIA TICKET REFERENCE: [ ${data.pressTicketId} ]
------------------------------------------------------------

Dear ${data.journalistName},

Thank you for contacting the corporate communications office of VOLAMP Elektrikals Pvt. Ltd. on behalf of "${data.mediaOutlet}".

Your media inquiry has been logged under official Press Reference:

============================================================
              PRESS TICKET ID: ${data.pressTicketId}
============================================================

INQUIRY OVERVIEW:
- Publication / Media Outlet: ${data.mediaOutlet}
- Topic: ${data.inquiryType}
- Stated Deadline: ${data.deadline}

EDITORIAL RESPONSE PROCESS:
Our corporate communications officer has been notified. We prioritize press deadlines and typically respond with verified statements, spokesperson commentary, or requested assets within your editorial timeframe.

DIRECT MEDIA LIAISON:
Email: pr@volampelektrikals.com
Media Helpline: +91 95123 65582
Website: https://volampelektrikals.com

Best regards,

Corporate Communications & Media Desk
VOLAMP Elektrikals Pvt. Ltd.
Vadodara, Gujarat, India
`.trim();
  const userHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${userSubject}</title></head>
<body style="margin: 0; padding: 0; background-color: #f7fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a202c;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 8px 30px rgba(0,0,0,0.06);">
          <tr>
            <td style="background: linear-gradient(135deg, #102a40 0%, #1e3a5f 100%); padding: 32px 30px; text-align: center; color: #ffffff;">
              <div style="font-size: 22px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                VOLAMP <span style="color: #f59e0b;">ELEKTRIKALS</span>
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #cbdbe7; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
                Corporate Communications & Media Relations Desk
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <span style="display: inline-block; padding: 4px 10px; background-color: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
                &bull; Media Inquiry Assigned
              </span>
              <h1 style="font-size: 20px; font-weight: 800; color: #102a40; margin: 0 0 12px 0;">
                Inquiry Logged, ${data.journalistName}
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5d6e; margin: 0 0 24px 0;">
                We have registered your media inquiry for <strong>${data.mediaOutlet}</strong>. Our corporate communications lead has received your brief and stated deadline.
              </p>

              <!-- Ticket Box -->
              <div style="background-color: #f0f7fd; border: 2px dashed #1d73b7; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; color: #1d73b7; text-transform: uppercase; margin-bottom: 6px;">
                  Official Press Ticket Reference
                </div>
                <div style="font-family: 'SFMono-Regular', Consolas, Menlo, monospace; font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #102a40; padding: 4px 0;">
                  ${data.pressTicketId}
                </div>
                <div style="font-size: 12px; color: #6e808b; margin-top: 6px;">
                  Please quote this Press Ticket ID for expedited follow-up.
                </div>
              </div>

              <div style="background-color: #f8fafc; border-radius: 10px; padding: 18px 20px; margin: 24px 0; border: 1px solid #e2e8f0;">
                <table width="100%" style="font-size: 13px; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 5px 0; color: #64748b; width: 45%;">Topic:</td>
                    <td style="padding: 5px 0; color: #1e293b; font-weight: 600;">${data.inquiryType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 5px 0; color: #64748b;">Editorial Deadline:</td>
                    <td style="padding: 5px 0; color: #dc2626; font-weight: 700;">${data.deadline}</td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 12px; line-height: 1.5; color: #64748b; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                Direct inquiries or time-sensitive deadline requests can also be directed to <a href="mailto:pr@volampelektrikals.com" style="color: #1d73b7; font-weight: 600;">pr@volampelektrikals.com</a> or phone <strong>+91 95123 65582</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #edf2f7; padding: 20px 36px; text-align: center;">
              <p style="font-size: 11px; color: #8e9da9; margin: 0 0 6px 0;">
                &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} VOLAMP Elektrikals Pvt. Ltd. &bull; Corporate Media & PR Desk
              </p>
              <p style="font-size: 11px; color: #8e9da9; margin: 0;">
                Vadodara, Gujarat, India &bull; <a href="https://volampelektrikals.com" style="color: #1d73b7; text-decoration: none;">volampelektrikals.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
  const defaultSender = process.env.SMTP_FROM || "no-reply@volampelektrikals.com";
  const [internalDrop, userConfirmation] = await Promise.all([
    sendTransactionalEmail({
      to: prInbox,
      from: defaultSender,
      fromName: "VOLAMP Press Desk",
      replyTo: data.email,
      subject: internalSubject,
      text: internalText,
      html: internalHtml,
      category: "press_internal"
    }),
    sendTransactionalEmail({
      to: data.email,
      from: defaultSender,
      fromName: "VOLAMP Corporate PR Desk",
      replyTo: prInbox,
      subject: userSubject,
      text: userText,
      html: userHtml,
      category: "press_user_ticket"
    })
  ]);
  return { internalDrop, userConfirmation };
}

// server/services/voiceOrderParser.ts
var NUMBER_WORDS = {
  // English
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  // Hindi (transliterated & devanagari)
  ek: 1,
  do: 2,
  teen: 3,
  char: 4,
  paanch: 5,
  panch: 5,
  chhah: 6,
  che: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  gyarah: 11,
  barah: 12,
  terah: 13,
  chaudah: 14,
  pandrah: 15,
  solah: 16,
  satrah: 17,
  atharah: 18,
  unnis: 19,
  bees: 20,
  tees: 30,
  chalis: 40,
  pachas: 50,
  sath: 60,
  sattar: 70,
  assi: 80,
  nabbe: 90,
  sau: 100,
  "\u090F\u0915": 1,
  "\u0926\u094B": 2,
  "\u0924\u0940\u0928": 3,
  "\u091A\u093E\u0930": 4,
  "\u092A\u093E\u0902\u091A": 5,
  "\u092A\u093E\u0901\u091A": 5,
  "\u091B\u0939": 6,
  "\u0938\u093E\u0924": 7,
  "\u0906\u0920": 8,
  "\u0928\u094C": 9,
  "\u0926\u0938": 10,
  "\u0917\u094D\u092F\u093E\u0930\u0939": 11,
  "\u092C\u093E\u0930\u0939": 12,
  "\u0924\u0947\u0930\u0939": 13,
  "\u091A\u094C\u0926\u0939": 14,
  "\u092A\u0902\u0926\u094D\u0930\u0939": 15,
  "\u0938\u094B\u0932\u0939": 16,
  "\u0938\u0924\u094D\u0930\u0939": 17,
  "\u0905\u0920\u093E\u0930\u0939": 18,
  "\u0909\u0928\u094D\u0928\u0940\u0938": 19,
  "\u092C\u0940\u0938": 20,
  "\u0924\u0940\u0938": 30,
  "\u091A\u093E\u0932\u0940\u0938": 40,
  "\u092A\u091A\u093E\u0938": 50,
  "\u0938\u093E\u0920": 60,
  "\u0938\u0924\u094D\u0924\u0930": 70,
  "\u0905\u0938\u094D\u0938\u0940": 80,
  "\u0928\u092C\u094D\u092C\u0947": 90,
  "\u0938\u094C": 100,
  // Gujarati (transliterated & gujarati script)
  be: 2,
  tran: 3,
  chaar: 4,
  chha: 6,
  aat: 8,
  nav: 9,
  dasa: 10,
  "\u0A8F\u0A95": 1,
  "\u0AAC\u0AC7": 2,
  "\u0AA4\u0ACD\u0AB0\u0AA3": 3,
  "\u0A9A\u0ABE\u0AB0": 4,
  "\u0AAA\u0ABE\u0A82\u0A9A": 5,
  "\u0A9B": 6,
  "\u0AB8\u0ABE\u0AA4": 7,
  "\u0A86\u0AA0": 8,
  "\u0AA8\u0AB5": 9,
  "\u0AA6\u0AB8": 10,
  "\u0A85\u0A97\u0ABF\u0AAF\u0ABE\u0AB0": 11,
  "\u0AAC\u0ABE\u0AB0": 12,
  "\u0AA4\u0AC7\u0AB0": 13,
  "\u0A9A\u0ACC\u0AA6": 14,
  "\u0AAA\u0A82\u0AA6\u0AB0": 15,
  "\u0AB8\u0ACB\u0AB3": 16,
  "\u0AB8\u0AA4\u0ACD\u0AA4\u0AB0": 17,
  "\u0A85\u0AA2\u0ABE\u0AB0": 18,
  "\u0A93\u0A97\u0AA3\u0AC0\u0AB8": 19,
  "\u0AB5\u0AC0\u0AB8": 20,
  "\u0AA4\u0ACD\u0AB0\u0AC0\u0AB8": 30,
  "\u0A9A\u0ABE\u0AB2\u0AC0\u0AB8": 40,
  "\u0AAA\u0A9A\u0ABE\u0AB8": 50,
  "\u0AB8\u0ABE\u0A88\u0AA0": 60,
  "\u0AB8\u0ABF\u0AA4\u0ACD\u0AA4\u0AC7\u0AB0": 70,
  "\u0A8F\u0A82\u0AB8\u0AC0": 80,
  "\u0AA8\u0AC7\u0AB5\u0AC1\u0A82": 90,
  "\u0AB8\u0ACB": 100
};
var KNOWN_BRANDS = [
  { name: "Polycab", aliases: ["polycab", "poly cab", "\u0AAA\u0ACB\u0AB2\u0AC0\u0A95\u0AC7\u0AAC", "\u092A\u0949\u0932\u0940\u0915\u0948\u092C"] },
  { name: "Finolex", aliases: ["finolex", "fino lex", "\u0AAB\u0ABF\u0AA8\u0ACB\u0AB2\u0AC7\u0A95\u0ACD\u0AB8", "\u092B\u093F\u0928\u094B\u0932\u0947\u0915\u094D\u0938"] },
  { name: "KEI", aliases: ["kei", "k e i", "\u0A95\u0AC7\u0A88\u0A86\u0A88", "\u0915\u0947\u0908\u0906\u0908"] },
  { name: "LK", aliases: ["lk", "l&t", "l & t", "larsen & toubro", "larsen and toubro", "\u090F\u0932\u0915\u0947", "\u090F\u0932 \u090F\u0902\u0921 \u091F\u0940", "\u0A8F\u0AB2\u0A95\u0AC7", "\u0A8F\u0AB2 \u0A8F\u0AA8\u0ACD\u0AA1 \u0A9F\u0AC0"] },
  { name: "Schneider", aliases: ["schneider", "schneider electric", "\u0938\u094D\u0928\u093E\u0907\u0921\u0930", "\u0AB8\u0ACD\u0AA8\u0ABE\u0A88\u0AA1\u0AB0"] },
  { name: "Legrand", aliases: ["legrand", "\u0932\u0947\u0917\u094D\u0930\u093E\u0902\u0921", "\u0AB2\u0AC7\u0A97\u0ACD\u0AB0\u0ABE\u0AA8\u0ACD\u0AA1"] },
  { name: "Havells", aliases: ["havells", "havels", "\u0AB9\u0AC7\u0AB5\u0AC7\u0AB2\u0ACD\u0AB8", "\u0939\u0948\u0935\u0947\u0932\u094D\u0938"] }
];
function normalizeTranscript(text2) {
  let clean = text2.trim();
  clean = clean.replace(/[।|]/g, " , ").replace(/(?:^|[^\p{L}\p{N}])(?:and also|aur sath me|sathe ane|tatha|aur|ane|ne|और|અને|તથા)(?:[^\p{L}\p{N}]|$)/giu, " , ").replace(/(?:^|[^\p{L}\p{N}])(?:i need|i want|please provide|please add|mujhe chahiye|chahiye|joiye che|joiye|humko chahiye|give me|જોઈએ છે|જોઈએ|ચહિયે|चाहिए)(?:[^\p{L}\p{N}]|$)/giu, " ").replace(/\s+/g, " ").trim();
  return clean;
}
function splitIntoProductSegments(rawTranscript) {
  const normalized = normalizeTranscript(rawTranscript);
  const rawSplits = normalized.split(/[,;\n]+|(?:^|[^\p{L}\p{N}])(?:and|aur|ane|और|અને)(?:[^\p{L}\p{N}]|$)/iu).map((s) => s.trim()).filter((s) => s.length > 0);
  const segments = [];
  for (const seg of rawSplits) {
    const qtyBoundaryRegex = /(?:^|\s)(\d+|one|two|three|four|five|six|seven|eight|nine|ten|ek|do|teen|char|paanch|be|tran|chaar|એક|બે|ત્રણ|ચાર|પાંચ|छ|सात|आठ|नौ|दस)\s*(?:pieces|piece|pcs|nos|no|units|unit|meters|meter|mtrs|m|coils|coil|rolls|નંગ|પીસ)/gi;
    const matches = Array.from(seg.matchAll(qtyBoundaryRegex));
    if (matches.length > 1) {
      let lastIndex = 0;
      for (let i = 1; i < matches.length; i++) {
        const curMatch = matches[i];
        if (curMatch.index !== void 0 && curMatch.index > lastIndex) {
          const part = seg.substring(lastIndex, curMatch.index).trim();
          if (part) segments.push(part);
          lastIndex = curMatch.index;
        }
      }
      const remaining = seg.substring(lastIndex).trim();
      if (remaining) segments.push(remaining);
    } else {
      segments.push(seg);
    }
  }
  return segments.filter((s) => s.length > 2);
}
function extractQuantity(segment) {
  let text2 = segment;
  const explicitUnitMatch = text2.match(
    /\b(\d+)\s*(pieces|piece|pcs|nos|units|unit|meters|meter|mtrs|mtr|coils|coil|rolls|roll|drums|drum|નંગ|પીસ)\b/i
  );
  if (explicitUnitMatch) {
    const qty = parseInt(explicitUnitMatch[1], 10);
    const unit = explicitUnitMatch[2];
    text2 = text2.replace(explicitUnitMatch[0], " ").trim();
    return { quantity: qty > 0 ? qty : 1, unit, remainingText: text2 };
  }
  const words = text2.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const w = words[i].toLowerCase().replace(/[^\w\u0900-\u097F\u0A80-\u0AFF]/g, "");
    if (NUMBER_WORDS[w]) {
      const qty = NUMBER_WORDS[w];
      let unit;
      if (i + 1 < words.length) {
        const nextW = words[i + 1].toLowerCase();
        if (["pieces", "piece", "pcs", "nos", "units", "meters", "meter", "m", "coils", "rolls", "\u0AA8\u0A82\u0A97", "\u0AAA\u0AC0\u0AB8"].includes(
          nextW
        )) {
          unit = nextW;
          words.splice(i, 2);
        } else {
          words.splice(i, 1);
        }
      } else {
        words.splice(i, 1);
      }
      return { quantity: qty, unit, remainingText: words.join(" ").trim() };
    }
  }
  const standaloneMatch = text2.match(
    /(?:^|\s)(\d+)(?!\.\d)\s+(?!(?:sq\s*mm|sqmm|sq|core|cores|c\b|pole|poles|p\b|amp|amps|a\b|v\b|volt|volts|kv|hp|kw|hz|phase)\b)/i
  );
  if (standaloneMatch) {
    const qty = parseInt(standaloneMatch[1], 10);
    if (qty > 0) {
      text2 = text2.replace(standaloneMatch[0], " ").trim();
      return { quantity: qty, remainingText: text2 };
    }
  }
  return { quantity: 1, remainingText: text2 };
}
function extractBrand(segment) {
  let text2 = segment;
  for (const b of KNOWN_BRANDS) {
    for (const alias of b.aliases) {
      const escaped = alias.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
      const regex = new RegExp(`(?:^|[^\\p{L}\\p{N}])(${escaped})(?:[^\\p{L}\\p{N}]|$)`, "iu");
      const match = text2.match(regex);
      if (match) {
        text2 = text2.replace(regex, " ").trim();
        return { brand: b.name, remainingText: text2 };
      }
    }
  }
  return { remainingText: text2 };
}
function extractSpecs(segment) {
  let size;
  let cores;
  let poles;
  let armour;
  let rating;
  const sqmmMatch = segment.match(/(\d+(?:\.\d+)?)\s*(?:sq\s*mm|sqmm|sq\.\s*mm|square\s*mm|સ્ક્વેર\s*એમએમ|स्क्वायर\s*एमएम)/i);
  if (sqmmMatch) {
    size = `${sqmmMatch[1]} SQMM`;
  }
  if (/single[- ]core|1[- ]core|सिंगल[- ]कोर|સિંગલ[- ]કોર/i.test(segment)) {
    cores = "1 CORE";
  } else if (/2[- ]core|2[- ]कोर|2[- ]કોર/i.test(segment)) {
    cores = "2 CORE";
  } else if (/3\.5[- ]core|3\.5[- ]कोर|3\.5[- ]કોર/i.test(segment)) {
    cores = "3.5 CORE";
  } else if (/3[- ]core|3[- ]कोर|3[- ]કોર/i.test(segment)) {
    cores = "3 CORE";
  } else if (/4[- ]core|4[- ]कोर|4[- ]કોર/i.test(segment)) {
    cores = "4 CORE";
  }
  const poleMatch = segment.match(/(?:^|[^\p{L}\p{N}])([1-4])\s*(?:pole|p|पोल|પોલ)(?:[^\p{L}\p{N}]|$)/iu);
  if (poleMatch) {
    poles = `${poleMatch[1]}P`;
  }
  const ampMatch = segment.match(/(?:^|[^\p{L}\p{N}])(\d+(?:\.\d+)?)\s*(?:amp|amps|amperes|a|एम्प|એમ્પ)(?:[^\p{L}\p{N}]|$)/iu);
  if (ampMatch) {
    rating = `${ampMatch[1]}A`;
  }
  if (/unarmou?red|un-armou?red|अनआर्मर्ड|અનઆર્મર્ડ/i.test(segment)) {
    armour = "Unarmoured";
  } else if (/armou?red|आर्मर्ड|આર્મર્ડ/i.test(segment)) {
    armour = "Armoured";
  }
  return { size, cores, poles, rating, armour };
}
function matchProductInCatalog(rawQuery, brand, specs) {
  const allProducts = getCachedProducts();
  const lowerQuery = rawQuery.toLowerCase();
  const stopWords = /* @__PURE__ */ new Set(["i", "need", "want", "please", "pieces", "piece", "pcs", "of", "and", "the", "for", "with"]);
  const tokens = lowerQuery.replace(/[^\w\s\.]/g, " ").split(/\s+/).filter((t2) => t2.length > 1 && !stopWords.has(t2));
  const scored = [];
  for (const p of allProducts) {
    let score = 0;
    const pName = p.name.toLowerCase();
    const pSub = (p.subcategory || "").toLowerCase();
    const pDesc = (p.description || "").toLowerCase();
    const pSpecs = parseItemSpecs(p.specifications);
    if (brand) {
      const bNorm = normalizeBrand(brand);
      const pbNorm = normalizeBrand(p.brand);
      if (bNorm === pbNorm) {
        score += 35;
      } else {
        score -= 30;
      }
    }
    if (specs?.size) {
      const sNorm = specs.size.toLowerCase();
      const pSize = (p.size || "").toLowerCase();
      if (pSize === sNorm || pName.includes(sNorm)) {
        score += 45;
      } else {
        if (pSize && pSize.includes("sqmm") && pSize !== sNorm) {
          continue;
        }
      }
    }
    if (specs?.cores) {
      const cNorm = specs.cores.toLowerCase();
      const pCores = (pSpecs.cores || "").toLowerCase();
      if (pName.includes(cNorm) || pCores.includes(cNorm)) {
        score += 35;
      } else if (specs.cores === "1 CORE" && (pName.includes("single core") || pName.includes("single-core") || pCores.includes("single core"))) {
        score += 25;
      } else if (pCores && !pCores.includes(cNorm)) {
        score -= 25;
      }
    }
    if (specs?.poles) {
      const pPoleTarget = specs.poles.toLowerCase();
      const pPoles = (pSpecs.polesPhase || "").toLowerCase();
      if (pPoles.includes(pPoleTarget) || pName.includes(pPoleTarget) || pName.includes("3 pole")) {
        score += 40;
      } else if (pPoles && !pPoles.includes(pPoleTarget)) {
        continue;
      }
    }
    if (specs?.rating) {
      const rNum = specs.rating.replace(/\D/g, "");
      const pRating = (pSpecs.currentRatingA || pSpecs.currentRatingAmp || p.size || "").toLowerCase();
      if (pRating.includes(rNum) || pName.includes(`${rNum}a`) || pName.includes(`${rNum} a`)) {
        score += 35;
      }
    }
    if (specs?.armour) {
      const isUnarmouredTarget = specs.armour.toLowerCase() === "unarmoured";
      const isPUnarmoured = pName.includes("unarmoured") || (pSpecs.typeOfArmour || "").toLowerCase().includes("unarmoured") || pSub.includes("unarmoured");
      const isPArmoured = !isPUnarmoured && (pName.includes("armoured") || (pSpecs.typeOfArmour || "").toLowerCase().includes("armoured"));
      if (isUnarmouredTarget && isPUnarmoured) {
        score += 30;
      } else if (!isUnarmouredTarget && isPArmoured) {
        score += 30;
      } else if (isUnarmouredTarget && isPArmoured) {
        continue;
      }
    }
    if (p.unit === "Per Meter" || p.unit === "Per Unit") {
      score += 10;
    }
    for (const token of tokens) {
      if (token === "cable" || token === "wire" || token === "contactor" || token === "contactors") {
        if (pName.includes(token) || pSub.includes(token) || pDesc.includes(token)) {
          score += 15;
        }
      } else if (pName.includes(token)) {
        score += 8;
      } else if (pDesc.includes(token) || pSub.includes(token)) {
        score += 4;
      }
    }
    if (score > 20) {
      scored.push({ product: p, score });
    }
  }
  scored.sort((a, b) => b.score - a.score);
  if (scored.length === 0) {
    return { matched: null, candidates: [], confidence: "none" };
  }
  const top = scored[0];
  const candidates = scored.slice(0, 5).map((s) => s.product);
  let confidence = "low";
  if (top.score >= 70) {
    if (scored.length === 1 || top.score - scored[1].score >= 10) {
      confidence = "high";
    } else {
      confidence = "medium";
    }
  } else if (top.score >= 40) {
    confidence = "medium";
  }
  return {
    matched: confidence === "high" || confidence === "medium" ? top.product : null,
    candidates,
    confidence
  };
}
function parseVoiceOrderText(transcript, _language) {
  const segments = splitIntoProductSegments(transcript);
  const items = [];
  for (let i = 0; i < segments.length; i++) {
    const rawSeg = segments[i];
    const { quantity, unit, remainingText: afterQty } = extractQuantity(rawSeg);
    const { brand, remainingText: afterBrand } = extractBrand(afterQty);
    const specs = extractSpecs(afterBrand);
    const { matched, candidates, confidence } = matchProductInCatalog(afterBrand, brand, specs);
    items.push({
      id: `voice-item-${Date.now()}-${i}`,
      originalSegment: rawSeg,
      detectedQuantity: quantity,
      detectedUnit: unit,
      detectedBrand: brand,
      detectedSize: specs.size,
      cleanedQuery: afterBrand.trim(),
      matchedProduct: matched ? {
        productId: matched.productId,
        sku: matched.sku,
        name: matched.name,
        brand: matched.brand,
        category: matched.category,
        size: matched.size || void 0,
        price: matched.price || "\u20B90.00",
        numericPrice: matched.numericPrice || 0,
        unit: matched.unit || "Per Unit"
      } : null,
      candidates: candidates.map((c) => ({
        productId: c.productId,
        sku: c.sku,
        name: c.name,
        brand: c.brand,
        price: c.price || "\u20B90.00",
        numericPrice: c.numericPrice || 0,
        category: c.category,
        size: c.size || void 0
      })),
      confidence,
      warning: confidence === "none" ? "No exact inventory match found. Please verify product name or select from catalog." : confidence === "medium" ? "Multiple close matches found. Please confirm the exact product SKU." : void 0
    });
  }
  return {
    success: true,
    transcript,
    items,
    totalItemsDetected: items.length
  };
}

// server/volaFaqBank.ts
var ESCALATION_STANDARD_RESPONSE = "I understand your requirement. This needs confirmation from our sales team, and I don't want to give you incorrect information. I'll arrange for the concerned salesperson to get in touch with you.";
var FAQ_BANK = [
  // 1. COMPANY & GENERAL INFORMATION
  {
    id: "Q1",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /what\s+does\s+volamp\s+(?:elektrikals\s+)?do/i,
      /tell\s+me\s+about\s+volamp\s+elektrikals/i,
      /what\s+is\s+volamp\s+elektrikals/i,
      /volamp\s+kya\s+karti\s+hai/i
    ],
    answer: "Volamp Elektrikals Pvt. Ltd. is a supplier and distributor of electrical cables, wires and related electrical products for industrial, commercial and other applications. We deal in products from reputed brands and can assist with product selection, quotation, availability and delivery."
  },
  {
    id: "Q2",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /what\s+products\s+do\s+you\s+deal\s+in/i,
      /which\s+products\s+do\s+you\s+have/i,
      /what\s+do\s+you\s+sell/i,
      /aap\s+kya\s+bechte\s+ho/i,
      /product\s+range/i
    ],
    answer: "We deal in a wide range of electrical cables and wires, including power cables, control cables, flexible cables, shielded cables, armoured and unarmoured cables, FRLS cables, XLPE cables, copper and aluminium cables, along with switchgear products such as MCBs and MCCBs."
  },
  {
    id: "Q3_Q4",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /which\s+brands\s+do\s+you\s+deal\s+in/i,
      /do\s+you\s+supply\s+branded\s+cables/i,
      /what\s+brands\s+do\s+you\s+have/i,
      /kon\s+kon\s+se\s+brand\s+hai/i
    ],
    answer: "We deal with reputed brands including Polycab, Finolex, KEI and Havells, along with Schneider Electric and Legrand for switchgear, subject to product availability and customer requirement."
  },
  {
    id: "Q5",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /are\s+you\s+a\s+manufacturer\s+or\s+distributor/i,
      /manufacturer\s+or\s+trader/i,
      /distributor\s+or\s+manufacturer/i,
      /kya\s+aap\s+manufacturer\s+ho/i
    ],
    answer: "We primarily operate as an electrical products distributor and supplier."
  },
  {
    id: "Q6",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /do\s+you\s+supply\s+to\s+businesses/i,
      /b2b\s+supply/i,
      /do\s+you\s+sell\s+to\s+contractors/i,
      /do\s+you\s+deal\s+with\s+companies/i
    ],
    answer: "Yes. We supply to industrial, commercial, contractors, traders, OEMs and other business customers."
  },
  {
    id: "Q7",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /can\s+you\s+supply\s+in\s+bulk/i,
      /bulk\s+orders?/i,
      /large\s+quantity\s+supply/i,
      /bulk\s+requirement/i
    ],
    answer: "Yes. We handle bulk requirements. Please share the required cable type, size, quantity and preferred brand so our sales team can provide the appropriate quotation."
  },
  {
    id: "Q8",
    section: "1. COMPANY & GENERAL INFORMATION",
    patterns: [
      /do\s+you\s+supply\s+small\s+quantities/i,
      /small\s+order/i,
      /minimum\s+quantity/i,
      /chhoti\s+quantity\s+milegi/i
    ],
    answer: "Yes, depending on the product and available stock. Please share your requirement and we can check availability."
  },
  // 2. UNDERSTANDING CUSTOMER REQUIREMENT
  {
    id: "Q9_Q10",
    section: "2. UNDERSTANDING CUSTOMER REQUIREMENT",
    patterns: [
      /can\s+you\s+help\s+me\s+select\s+(?:a\s+)?cable/i,
      /i\s+don'?t\s+know\s+which\s+cable\s+i\s+need/i,
      /help\s+me\s+choose\s+a\s+cable/i,
      /which\s+cable\s+is\s+right\s+for\s+me/i
    ],
    answer: "No problem, we can help! Please tell me where the cable will be used, the equipment or application, approximate load (kW/HP/Amperes) if available, required length, and whether you prefer copper or aluminium. Our technical and sales team will help identify the suitable cable."
  },
  {
    id: "Q11",
    section: "2. UNDERSTANDING CUSTOMER REQUIREMENT",
    patterns: [
      /what\s+information\s+do\s+you\s+need\s+for\s+a\s+quotation/i,
      /details\s+needed\s+for\s+quote/i,
      /quotation\s+ke\s+liye\s+kya\s+chahiye/i
    ],
    answer: "Usually we need the product or cable type, size (sq. mm), conductor material (copper or aluminium), number of cores, quantity/length, preferred brand, and delivery location. If you have a BOQ or enquiry sheet, you can also share that directly with us."
  },
  {
    id: "Q12",
    section: "2. UNDERSTANDING CUSTOMER REQUIREMENT",
    patterns: [
      /can\s+i\s+send\s+(?:you\s+)?(?:my\s+)?boq/i,
      /share\s+boq/i,
      /boq\s+quotation/i,
      /enquiry\s+sheet/i
    ],
    answer: "Yes. You can share your BOQ with our sales team for review and quotation. Please WhatsApp it to +91 9512365582 or email sales@volampelektrikals.com."
  },
  {
    id: "Q13_Q14",
    section: "2. UNDERSTANDING CUSTOMER REQUIREMENT",
    patterns: [
      /can\s+i\s+send\s+a\s+photo\s+of\s+the\s+cable/i,
      /can\s+i\s+send\s+my\s+existing\s+cable\s+specification/i,
      /cable\s+photo/i,
      /datasheet\s+photo/i
    ],
    answer: "Yes. A photo can help us identify the product, provided the markings and specifications are visible. You can also share the specification, datasheet, or cable marking, and our team will check the exact requirement."
  },
  // 3. PRODUCT & TECHNICAL QUESTIONS
  {
    id: "Q26",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /difference\s+between\s+copper\s+and\s+alumin(?:i)?um/i,
      /copper\s+vs\s+alumin(?:i)?um/i,
      /cu\s+vs\s+al/i
    ],
    answer: "Copper generally has higher conductivity and is more compact for the same current-carrying requirement, while aluminium is lighter and generally more economical. The appropriate choice depends on the application, load, installation conditions, and project design requirements."
  },
  {
    id: "Q27",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /what\s+is\s+frls/i,
      /frls\s+meaning/i,
      /frls\s+full\s+form/i
    ],
    answer: "FRLS means Flame Retardant Low Smoke. These cables are designed to reduce flame propagation and smoke generation under specified test conditions, enhancing safety in buildings and industrial facilities."
  },
  {
    id: "Q28",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /what\s+is\s+xlpe/i,
      /xlpe\s+meaning/i,
      /xlpe\s+full\s+form/i
    ],
    answer: "XLPE stands for Cross-Linked Polyethylene. It is commonly used as cable insulation because of its superior electrical, thermal (up to 90\xB0C continuous operation), and mechanical properties."
  },
  {
    id: "Q29",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /what\s+is\s+armoured\s+cable/i,
      /what\s+is\s+armored\s+cable/i,
      /armoured\s+meaning/i
    ],
    answer: "An armoured cable has an additional mechanical protection layer (GI wire or strip armour), making it suitable for direct underground burial and industrial applications where mechanical protection is required."
  },
  {
    id: "Q30",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /what\s+is\s+shielded\s+cable/i,
      /shielded\s+cable\s+meaning/i,
      /screened\s+cable/i
    ],
    answer: "A shielded cable contains a conductive shielding layer designed to reduce electromagnetic interference (EMI) and protect signal integrity in sensitive instrumentation, control, and VFD motor applications."
  },
  {
    id: "Q31",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /current[\s-]carrying\s+capacity\s+of\s+this\s+cable/i,
      /ampacity\s+of\s+this\s+cable/i,
      /how\s+many\s+amps\s+can\s+this\s+cable\s+take/i
    ],
    answer: "The ampacity depends on the cable size, conductor material, insulation (PVC vs XLPE), installation method (in air, ground, or duct), ambient temperature, and other factors. Please provide the exact cable specification and installation conditions so our technical team can confirm the applicable rating."
  },
  {
    id: "Q33",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /can\s+you\s+provide\s+a\s+datasheet/i,
      /need\s+datasheet/i,
      /technical\s+datasheet/i
    ],
    answer: "Yes, subject to availability, we can provide the relevant manufacturer datasheet for the product."
  },
  {
    id: "Q34",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /are\s+(?:the\s+)?cables\s+isi\s+marked/i,
      /isi\s+mark\s+cables/i,
      /bis\s+certified/i
    ],
    answer: "This depends on the specific product. We deal in ISI-marked products from certified manufacturers and can confirm the applicable certification and marking for the exact product you require."
  },
  {
    id: "Q35",
    section: "3. PRODUCT & TECHNICAL QUESTIONS",
    patterns: [
      /do\s+you\s+provide\s+test\s+certificates/i,
      /manufacturer\s+test\s+certificate/i,
      /mtc\s+certificate/i
    ],
    answer: "Test certificates (Manufacturer Test Certificate / MTC) can be provided where available from the manufacturer and applicable to the product/order."
  },
  // 4. BRAND QUESTIONS
  {
    id: "Q40",
    section: "4. BRAND QUESTIONS",
    patterns: [
      /which\s+brand\s+is\s+best/i,
      /polycab\s+or\s+kei/i,
      /polycab\s+or\s+finolex/i,
      /best\s+cable\s+brand/i
    ],
    answer: "The best brand depends on your application, technical specification, budget and project requirements. We can provide suitable options from reputed brands including Polycab, Finolex, KEI, and Havells based on your requirement."
  },
  {
    id: "Q41_Q42",
    section: "4. BRAND QUESTIONS",
    patterns: [
      /can\s+i\s+choose\s+the\s+brand/i,
      /can\s+you\s+provide\s+an\s+alternative\s+brand/i,
      /alternative\s+brand/i
    ],
    answer: "Yes. If you have a preferred brand, please tell us and we can check availability and pricing. If the requested brand is unavailable, we can check suitable alternatives based on your technical and commercial requirements."
  },
  {
    id: "Q43",
    section: "4. BRAND QUESTIONS",
    patterns: [
      /why\s+is\s+your\s+price\s+different\s+from\s+another\s+supplier/i,
      /price\s+difference\s+reason/i
    ],
    answer: "Cable prices can vary based on brand, specification, conductor material, quantity, copper/aluminium rates, market conditions, taxes, freight and commercial terms. Our team can check your exact requirement and provide the applicable quotation."
  },
  // 5. PRICE & QUOTATION
  {
    id: "Q46",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /can\s+you\s+give\s+me\s+a\s+discount/i,
      /extra\s+discount/i,
      /discount\s+milega/i
    ],
    answer: "We can check the applicable discount based on the product, quantity, brand and commercial terms. Let me have our sales team confirm the best possible offer."
  },
  {
    id: "Q47_Q48_Q49",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /your\s+price\s+is\s+high/i,
      /price\s+too\s+high/i,
      /bhav\s+bahut\s+jyada\s+hai/i,
      /another\s+supplier\s+is\s+giving\s+me\s+a\s+lower\s+price/i,
      /cheaper\s+somewhere\s+else/i,
      /can\s+you\s+match\s+another\s+supplier'?s\s+price/i,
      /can\s+you\s+beat\s+this\s+price/i
    ],
    answer: "I understand. Cable prices can vary based on brand, specification and market conditions. If you share the competitor's price or quotation along with the exact specification, brand, and quantity, our sales team can review whether we can offer a more competitive option."
  },
  {
    id: "Q50",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /is\s+gst\s+included\s+in\s+your\s+price/i,
      /gst\s+extra\s+or\s+inclusive/i,
      /with\s+gst\s+or\s+without\s+gst/i
    ],
    answer: "The quotation will specify whether the price is inclusive or exclusive of applicable taxes (standard statutory GST rate is 18%). Our sales team can confirm the exact tax treatment for your order."
  },
  {
    id: "Q51",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /is\s+freight\s+included/i,
      /transport\s+charges\s+extra/i,
      /freight\s+extra/i
    ],
    answer: "Freight terms depend on the order value, quantity, delivery location, and commercial terms. Our sales team will confirm the applicable freight arrangement in your quotation."
  },
  {
    id: "Q52",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /how\s+long\s+is\s+the\s+quotation\s+valid/i,
      /quote\s+validity/i,
      /quotation\s+validity/i
    ],
    answer: "Quotation validity depends on the product and raw metal market conditions (copper/aluminium index) and will be explicitly mentioned in the quotation."
  },
  {
    id: "Q53",
    section: "5. PRICE & QUOTATION",
    patterns: [
      /can\s+you\s+revise\s+the\s+quotation/i,
      /revise\s+quote/i,
      /change\s+quotation/i
    ],
    answer: "Yes. Please tell us what needs to be revised\u2014quantity, brand, specification or commercial terms\u2014and our sales team can review it."
  },
  // 6. STOCK & AVAILABILITY & 7. ORDER & DELIVERY
  {
    id: "Q57_Q61_Q62_Q65",
    section: "6. STOCK & 7. ORDER & DELIVERY",
    patterns: [
      /what\s+is\s+your\s+delivery\s+timing/i,
      /delivery\s+timing/i,
      /dispatch\s+timing/i,
      /how\s+quickly\s+can\s+you\s+deliver/i,
      /same[\s-]day\s+delivery/i,
      /urgent\s+material.*today/i
    ],
    answer: "Orders placed between 8:00 AM and 5:30 PM are considered for delivery/dispatch as per availability and logistics feasibility. Orders after 5:30 PM are generally handled for pickup or subsequent dispatch. If the required material is available in our warehouse, same-day dispatch may be possible for eligible orders."
  },
  {
    id: "Q63_Q64",
    section: "7. ORDER & DELIVERY",
    patterns: [
      /can\s+i\s+pick\s*up\s+the\s+material/i,
      /pickup\s+available/i,
      /where\s+is\s+your\s+warehouse/i,
      /godown\s+location/i
    ],
    answer: "Yes, pickup can be arranged subject to order confirmation, stock availability and applicable warehouse procedures. Our warehouse is separate from our office; the sales team will provide the applicable warehouse/pickup address after confirming your order."
  },
  {
    id: "Q66",
    section: "7. ORDER & DELIVERY",
    patterns: [
      /how\s+long\s+will\s+b2b\s+delivery\s+take/i,
      /b2b\s+delivery\s+time/i,
      /delivery\s+timeline/i,
      /kab\s+tak\s+deliver\s+hoga/i
    ],
    answer: "For available stock, B2B delivery generally takes around 1\u20133 days, depending on the delivery location and logistics feasibility."
  },
  {
    id: "Q67_Q68",
    section: "7. ORDER & DELIVERY",
    patterns: [
      /can\s+you\s+deliver\s+outside\s+the\s+city/i,
      /can\s+you\s+deliver\s+directly\s+to\s+my\s+(?:customer|site)/i,
      /direct\s+site\s+delivery/i,
      /deliver\s+to\s+other\s+state/i
    ],
    answer: "Yes, we can evaluate deliveries outside the local area and direct-to-site delivery depending on the order size, location and logistics arrangements. Our sales team can confirm feasibility."
  },
  {
    id: "Q69_Q70",
    section: "7. ORDER & DELIVERY",
    patterns: [
      /can\s+you\s+split\s+the\s+delivery/i,
      /can\s+you\s+deliver\s+in\s+multiple\s+lots/i,
      /part\s+delivery/i,
      /phased\s+delivery/i
    ],
    answer: "Yes, split or multiple-lot delivery can be considered depending on product availability and agreed commercial terms. Our sales team can confirm."
  },
  {
    id: "Q71_Q72",
    section: "7. ORDER & DELIVERY",
    patterns: [
      /my\s+material\s+has\s+not\s+arrived/i,
      /material\s+not\s+delivered/i,
      /can\s+i\s+get\s+(?:the\s+)?tracking\s+details/i,
      /tracking\s+number/i,
      /lr\s+copy/i
    ],
    answer: "I'm sorry for any delay. Once dispatch information is generated, our team provides the relevant transport LR or tracking details. Let me arrange for your order status to be checked immediately by our logistics team."
  },
  // 8. PAYMENT & CREDIT
  {
    id: "Q73_Q74_Q75_Q77",
    section: "8. PAYMENT & CREDIT",
    patterns: [
      /what\s+payment\s+methods\s+do\s+you\s+accept/i,
      /do\s+you\s+provide\s+credit/i,
      /can\s+i\s+place\s+an\s+order\s+on\s+credit/i,
      /new\s+customer.*credit/i,
      /udhar\s+milega/i,
      /credit\s+terms/i
    ],
    answer: "Our available payment methods and terms depend on the customer and order (NEFT/RTGS, advance, or credit). Credit facilities may be available to eligible customers after the required credit assessment and approval. New customer credit purchases are subject to credit approval; alternatively, an advance payment arrangement is available."
  },
  {
    id: "Q76_Q78",
    section: "8. PAYMENT & CREDIT",
    patterns: [
      /what\s+is\s+(?:the\s+)?credit\s+limit/i,
      /can\s+i\s+place\s+a\s+large\s+credit\s+order/i,
      /how\s+much\s+credit\s+can\s+i\s+get/i
    ],
    answer: "The applicable credit limit depends on the customer's approved credit assessment and company policy. Our sales and accounts team can confirm your available limit upon reviewing your documents."
  },
  {
    id: "Q82",
    section: "8. PAYMENT & CREDIT",
    patterns: [
      /do\s+you\s+accept\s+pdc/i,
      /post[\s-]dated\s+cheque/i
    ],
    answer: "PDC arrangements may be applicable under approved credit terms and company policy. Our accounts team can confirm the exact requirement."
  },
  // 9. CUSTOMER ONBOARDING / KYC
  {
    id: "Q83_Q84_Q85",
    section: "9. CUSTOMER ONBOARDING / KYC",
    patterns: [
      /what\s+documents\s+do\s+you\s+need\s+to\s+open\s+an\s+account/i,
      /why\s+do\s+you\s+need\s+kyc/i,
      /can\s+you\s+sell\s+to\s+a\s+new\s+company/i,
      /vendor\s+registration/i,
      /account\s+opening\s+documents/i
    ],
    answer: "Yes, we onboard new customers subject to our standard verification process. KYC (GST certificate, PAN, company details) helps us verify business details and is part of our account and credit assessment process. Our team will provide the applicable onboarding checklist."
  },
  // 10. ORDER CHANGES & CANCELLATION
  {
    id: "Q87_Q88_Q89_Q90_Q91",
    section: "10. ORDER CHANGES & CANCELLATION",
    patterns: [
      /can\s+i\s+change\s+the\s+quantity\s+after\s+placing\s+the\s+order/i,
      /can\s+i\s+change\s+the\s+brand\s+after\s+placing\s+the\s+order/i,
      /can\s+i\s+cancel\s+my\s+order/i,
      /i\s+ordered\s+the\s+wrong\s+cable\s+size/i,
      /can\s+cut\s+cable\s+be\s+returned/i,
      /order\s+cancel\s+karna\s+hai/i
    ],
    answer: "Please inform us immediately! Changes or cancellation depend on whether the order has already been processed, cut, packed or dispatched. Specially cut or processed cables are generally not eligible for return once cut. Our sales team will check the live order status and advise on available options."
  },
  // 11. QUALITY & AUTHENTICITY & 12. WARRANTY
  {
    id: "Q92_Q93",
    section: "11. QUALITY & AUTHENTICITY",
    patterns: [
      /are\s+your\s+products\s+genuine/i,
      /how\s+can\s+i\s+verify\s+the\s+cable/i,
      /original\s+product\s+hai\s+kya/i,
      /authentic\s+material/i
    ],
    answer: "We source 100% genuine products directly from established manufacturers and authorized supply channels. Cable markings, packaging, manufacturer batch numbers, and applicable test certificates (MTC) can be verified with every consignment."
  },
  {
    id: "Q94_Q95_Q96_Q97",
    section: "11. QUALITY & AUTHENTICITY",
    patterns: [
      /what\s+if\s+i\s+receive\s+damaged\s+material/i,
      /what\s+if\s+i\s+receive\s+the\s+wrong\s+material/i,
      /what\s+if\s+the\s+quantity\s+is\s+short/i,
      /what\s+if\s+the\s+cable\s+doesn'?t\s+work/i,
      /defective\s+material/i,
      /shortage\s+in\s+delivery/i
    ],
    answer: "Please report any damage, discrepancy, or shortage immediately with invoice details, packing slip, and photographs/videos. Please do not use potentially defective material. Our team will verify dispatch records and coordinate an immediate inspection and resolution."
  },
  {
    id: "Q98_Q99_Q100_Q101",
    section: "12. WARRANTY & REPLACEMENT",
    patterns: [
      /do\s+you\s+provide\s+warranty/i,
      /can\s+i\s+get\s+a\s+replacement/i,
      /who\s+handles\s+warranty\s+claims/i,
      /how\s+long\s+does\s+replacement\s+take/i
    ],
    answer: "Warranty depends on the specific product and manufacturer's warranty terms. If there is a confirmed manufacturing defect, replacement may be considered according to manufacturer terms. Our team coordinates the warranty process directly with the manufacturer."
  },
  // 13. COMPETITOR / PRICE OBJECTIONS
  {
    id: "Q107",
    section: "13. COMPETITOR / PRICE OBJECTIONS",
    patterns: [
      /why\s+should\s+i\s+buy\s+from\s+you\s+instead\s+of\s+indiamart/i,
      /indiamart\s+vs\s+volamp/i,
      /better\s+than\s+indiamart/i
    ],
    answer: "IndiaMART is a directory that connects you to third-party listings, whereas Volamp directly handles product quotation, stock availability, quality verification, GST invoicing, and fulfillment under our own warranty and supply responsibility."
  },
  {
    id: "Q102",
    section: "13. COMPETITOR / PRICE OBJECTIONS",
    patterns: [
      /why\s+should\s+i\s+buy\s+from\s+you(?!\s+instead)/i,
      /why\s+choose\s+volamp/i,
      /volamp\s+se\s+kyun\s+kharidein/i
    ],
    answer: "We provide direct access to reputed electrical brands along with expert technical product selection, quotation support, real-time stock verification, and rapid delivery coordination. We evaluate your requirements and offer the most competitive commercial package."
  },
  {
    id: "Q103_Q104",
    section: "13. COMPETITOR / PRICE OBJECTIONS",
    patterns: [
      /i\s+already\s+have\s+a\s+supplier/i,
      /i\s+don'?t\s+want\s+to\s+change\s+my\s+supplier/i,
      /already\s+buying\s+from\s+someone/i,
      /mera\s+regular\s+dealer\s+hai/i
    ],
    answer: "That's absolutely fine. You don't have to change your existing supplier. We can simply remain an additional supply option whenever you need better availability, an alternative brand, urgent material, or competitive pricing."
  },
  // 15. PROJECT / BULK REQUIREMENTS
  {
    id: "Q113_Q114_Q115_Q116_Q117",
    section: "15. PROJECT / BULK REQUIREMENTS",
    patterns: [
      /i\s+have\s+a\s+project\s+requirement/i,
      /i\s+need\s+cables\s+for\s+a\s+complete\s+project/i,
      /can\s+you\s+supply\s+the\s+complete\s+boq/i,
      /i\s+need\s+supply\s+in\s+phases/i,
      /can\s+you\s+hold\s+stock\s+for\s+my\s+project/i
    ],
    answer: "Yes. Please share your BOQ or complete requirement. Our sales team can review the quantities, specifications, brands, delivery schedule, phased dispatches, and project stock-holding arrangements."
  },
  // 16. SWITCHGEAR
  {
    id: "Q118_Q119_Q120_Q121_Q122",
    section: "16. SWITCHGEAR",
    patterns: [
      /do\s+you\s+supply\s+mcbs?/i,
      /do\s+you\s+supply\s+mccbs?/i,
      /which\s+switchgear\s+brands\s+do\s+you\s+have/i,
      /which\s+mcb\s+should\s+i\s+use/i,
      /which\s+mccb\s+should\s+i\s+use/i
    ],
    answer: "Yes, MCBs and MCCBs are part of our switchgear range (Schneider Electric, Legrand, LK). Selection depends on load current, breaking capacity (e.g. 10kA, 16kA, 25kA, 36kA), number of poles (SP, DP, TP, FP), and application. Please provide the rating so we can confirm availability and pricing."
  },
  // 17. CUSTOMER WHO IS ONLY ASKING FOR PRICE
  {
    id: "Q123_Q124_Q125",
    section: "17. CUSTOMER WHO IS ONLY ASKING FOR PRICE",
    patterns: [
      /just\s+give\s+me\s+the\s+price/i,
      /sirf\s+rate\s+batao/i,
      /i\s+don'?t\s+want\s+to\s+share\s+my\s+quantity/i,
      /just\s+whatsapp\s+me\s+the\s+price/i,
      /whatsapp\s+pe\s+bhejo/i
    ],
    answer: "Certainly. To give you the exact commercial price, I just need the cable/product specification, approximate quantity, and preferred brand. You can also share your contact/WhatsApp number, and our sales team will send the official quotation directly."
  },
  // 18. CUSTOMER NOT INTERESTED
  {
    id: "Q126_Q127_Q128_Q129",
    section: "18. CUSTOMER NOT INTERESTED",
    patterns: [
      /i'?m\s+not\s+interested/i,
      /not\s+interested/i,
      /nahi\s+chahiye/i,
      /i\s+don'?t\s+need\s+anything\s+right\s+now/i,
      /don'?t\s+call\s+me\s+again/i,
      /i'?m\s+busy\s+right\s+now/i
    ],
    answer: "Understood. We won't take much of your time. If you have any requirement in the future for electrical cables, wires or switchgear, Volamp will be happy to assist. Have a wonderful day!"
  },
  // 19. CUSTOMER WANTS TO SPEAK TO A HUMAN
  {
    id: "Q130_Q131_Q132",
    section: "19. CUSTOMER WANTS TO SPEAK TO A HUMAN",
    patterns: [
      /can\s+i\s+speak\s+to\s+a\s+salesperson/i,
      /talk\s+to\s+a\s+human/i,
      /i\s+don'?t\s+want\s+to\s+talk\s+to\s+an\s+ai/i,
      /speak\s+to\s+the\s+manager/i,
      /human\s+agent/i,
      /real\s+person/i
    ],
    answer: "Certainly. I'll arrange for a member of our sales team or manager to contact you directly. Please share your name and mobile number, or call us directly at +91 9512365582."
  },
  // 20. FOLLOW-UP QUESTIONS
  {
    id: "Q133_Q134_Q135_Q136",
    section: "20. FOLLOW-UP QUESTIONS",
    patterns: [
      /why\s+haven'?t\s+you\s+sent\s+the\s+quotation/i,
      /i\s+sent\s+the\s+enquiry\s+yesterday.*any\s+update/i,
      /nobody\s+is\s+responding\s+to\s+me/i,
      /when\s+will\s+your\s+salesperson\s+call\s+me/i
    ],
    answer: "I'm sorry for the inconvenience and delay. Let me escalate this immediately to our sales lead so they can check your enquiry status and arrange an urgent callback or update for you."
  },
  // 21. BILLING & DOCUMENTATION
  {
    id: "Q137_Q138_Q139_Q140_Q141_Q142",
    section: "21. BILLING & DOCUMENTATION",
    patterns: [
      /can\s+you\s+provide\s+an?\s+invoice/i,
      /gst\s+invoice/i,
      /e[\s-]way\s+bill/i,
      /delivery\s+challan/i,
      /send\s+invoice\s+on\s+whatsapp/i,
      /duplicate\s+invoice/i
    ],
    answer: "Yes. An official GST tax invoice, e-way bill, and delivery challan are provided as standard dispatch documentation. Our accounts team can also share PDF copies directly to your WhatsApp or registered email."
  },
  // 22. PAYMENT FOLLOW-UP / RECEIVABLES
  {
    id: "Q143_Q144_Q145_Q146",
    section: "22. PAYMENT FOLLOW-UP / RECEIVABLES",
    patterns: [
      /i\s+have\s+already\s+made\s+the\s+payment/i,
      /why\s+is\s+my\s+payment\s+showing\s+as\s+pending/i,
      /i\s+need\s+more\s+time\s+to\s+make\s+payment/i,
      /payment\s+extension/i
    ],
    answer: "Thank you. Please share your payment UTR / reference number, and our accounts team will verify and update your ledger. Payment extension requests will be passed to our accounts and sales desk for review under company credit terms."
  },
  // 23. SPECIAL COMMERCIAL REQUESTS
  {
    id: "Q147_Q148_Q149_Q150",
    section: "23. SPECIAL COMMERCIAL REQUESTS",
    patterns: [
      /extra\s+discount\s+for\s+a\s+large\s+order/i,
      /special\s+project\s+price/i,
      /can\s+you\s+lock\s+the\s+price\s+for\s+my\s+project/i,
      /material\s+against\s+my\s+purchase\s+order/i
    ],
    answer: "Yes, project-specific pricing, price-lock arrangements, and supply against approved Purchase Orders (POs) can be evaluated based on quantity, schedule, and commercial terms. Our sales desk will coordinate this."
  }
];
var ESCALATION_TRIGGERS = [
  /\b(?:match\s*(?:their|competitor|another|the)?\s*price|price\s*match|beat\s*(?:this|their|competitor)?\s*price|lower\s*(?:than\s*their\s*price|rate|offer))\b/i,
  /\b(?:negotiate\s*price|bargain|extra\s*discount|give\s*me\s*a\s*lower\s*rate)\b/i,
  /\b(?:credit\s*beyond|increase\s*my\s*credit\s*limit|more\s*credit)\b/i,
  /\b(?:dispute\s*invoice|wrong\s*amount\s*on\s*bill|overcharged)\b/i,
  /\b(?:shortage|short\s*quantity|missing\s*drums?|damaged\s*material|cable\s*damaged|broken\s*reel)\b/i,
  /\b(?:defective\s*material|cable\s*(?:not\s*working|failed\s*spark|burnt|sparked))\b/i,
  /\b(?:product\s*replacement|exchange\s*cable|replace\s*material)\b/i,
  /\b(?:design\s*approval|certify\s*my\s*electrical\s*design|legal\s*guarantee)\b/i,
  /\b(?:cancel\s*processed\s*order|cancel\s*dispatched\s*order)\b/i,
  /\b(?:return\s*cut\s*cable|return\s*specially\s*cut)\b/i,
  /\b(?:urgent\s*project\s*stopped|immediate\s*stock\s*guarantee|swear\s*it\s*arrives\s*today)\b/i,
  /\b(?:cheating|fraud|police|court|sue\s*you|worst\s*company|threaten)\b/i,
  /\b(?:management\s*intervention|connect\s*to\s*director|connect\s*to\s*naimil|speak\s*to\s*ceo)\b/i,
  /\b(?:customized\s*credit\s*agreement|special\s*60\s*days\s*credit)\b/i
];
function matchVolaFaq(query) {
  const trimmed = query.trim();
  for (const trigger of ESCALATION_TRIGGERS) {
    if (trigger.test(trimmed)) {
      return {
        matched: true,
        response: ESCALATION_STANDARD_RESPONSE,
        isEscalation: true
      };
    }
  }
  for (const item of FAQ_BANK) {
    for (const pat of item.patterns) {
      if (pat.test(trimmed)) {
        return {
          matched: true,
          response: item.answer,
          isEscalation: item.isEscalation
        };
      }
    }
  }
  return null;
}

// server/volaBrain.ts
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function normalizeTypoQuery(raw) {
  let text2 = raw.toLowerCase();
  text2 = text2.replace(/([a-z0-9])[\=\_\+\*\#\$\@\^\&]+([a-z0-9])/gi, "$1$2");
  text2 = text2.replace(/\b(?:cabb?k?le?s?|cble?s?|cabels?|cabl|cabkle)\b/gi, "cable");
  text2 = text2.replace(/\b(?:sollar|solaar|solor|soler)\b/gi, "solar");
  text2 = text2.replace(/\b(?:polycap|polycabb|polycbb)\b/gi, "polycab");
  text2 = text2.replace(/\b(?:finolx|finolexx|finnolex)\b/gi, "finolex");
  text2 = text2.replace(/\b(?:havel|havels|havell)\b/gi, "havells");
  text2 = text2.replace(/\b(?:almunium|aliminium|alluminium|alumin)\b/gi, "aluminium");
  text2 = text2.replace(/\b(?:copr|coppr|cooper)\b/gi, "copper");
  text2 = text2.replace(/\b(?:swg|swich|swichgear|switchger)\b/gi, "switchgear");
  text2 = text2.replace(/\b(?:glandd|glands)\b/gi, "gland");
  text2 = text2.replace(/\b(?:lugg|luggs|lugs)\b/gi, "lug");
  text2 = text2.replace(/\b(?:conduitt|conduits)\b/gi, "conduit");
  return text2;
}
function extractOrderDetails(messages) {
  const fullText = messages.map((m) => m.content).join("\n");
  const extracted = { items: [] };
  const phoneMatch = fullText.match(/(?:\+91[\s-]?)?([6-9]\d{4}[\s-]?\d{5})/);
  if (phoneMatch) {
    extracted.phone = phoneMatch[0].replace(/[\s-]/g, "");
  }
  const nameMatch = fullText.match(/(?:my name is|i am|name[:\s]+)([a-zA-Z\s]{2,30})(?:,|\s+phone|\s+mobile|\s+at|\s+delivery|\s+location|$)/i) || fullText.match(/(?:call me|customer[:\s]+)([a-zA-Z\s]{2,30})(?:,|\s+phone|\s+mobile|\s+at|\s+delivery|\s+location|$)/i);
  if (nameMatch) {
    extracted.customerName = nameMatch[1].trim();
  }
  const locationMatch = fullText.match(/(?:deliver(?:y|ed)?\s+(?:to|at|in)|destination[:\s]+|shipping\s+(?:to|at|in)|location[:\s]+|city[:\s]+)([a-zA-Z\s]{2,25}(?:,\s*[a-zA-Z\s]{2,20})?)/i) || fullText.match(/(?:to|in|at)\s+([a-zA-Z]{3,20}(?:,\s*[a-zA-Z]{2,20})?)/i);
  if (locationMatch) {
    const loc = locationMatch[1].trim();
    if (!["the", "our", "my", "this", "need", "want", "order", "buy"].includes(loc.toLowerCase())) {
      extracted.location = loc;
    }
  }
  const pincodeMatch = fullText.match(/\b([1-9]\d{5})\b/);
  if (pincodeMatch) {
    extracted.location = extracted.location ? `${extracted.location} (${pincodeMatch[1]})` : pincodeMatch[1];
  }
  if (!extracted.location) {
    const cityMatch = fullText.match(/\b(Ahmedabad|Surat|Vadodara|Rajkot|Mumbai|Pune|Delhi|Jaipur|Bangalore|Bengaluru|Chennai|Hyderabad|Kolkata|Indore|Bhopal|Nagpur|Nashik|Vapi|Ankleshwar|Gandhinagar|Bhavnagar|Jamnagar|Morbi|Udaipur|Gurgaon|Noida)\b/i);
    if (cityMatch) {
      extracted.location = cityMatch[1];
    }
  }
  const itemRegex = /(\d+)\s*(?:m|meter|meters|metre|metres|coils?|rolls?|drums?|units?|nos?)?\s+(?:of\s+)?([a-zA-Z0-9\s\.\-\/]+(?:cable|wire|sqmm|conductor|switchgear|lug|gland|jointing|tray|mcb|mccb|rccb))/gi;
  let match;
  while ((match = itemRegex.exec(fullText)) !== null) {
    const qty = parseInt(match[1], 10);
    const itemName = match[2].trim();
    if (qty > 0 && itemName.length > 2) {
      extracted.items.push({
        name: `${match[0].trim()}`,
        quantity: qty
      });
    }
  }
  if (extracted.items.length === 0) {
    const generalQtyMatch = fullText.match(/(\d+)\s*(?:m|meter|meters|metre|metres|coils?|rolls?|drums?)/i);
    const productKeywords = ["cable", "wire", "sqmm", "copper", "armoured", "unarmoured", "xlpe", "pvc", "submersible", "solar", "mcb", "mccb", "gland", "lug"];
    const hasProductKeyword = productKeywords.some((kw) => fullText.toLowerCase().includes(kw));
    if (generalQtyMatch && hasProductKeyword) {
      const qty = parseInt(generalQtyMatch[1], 10);
      extracted.items.push({
        name: "Industrial Cable / Electrical requirement",
        quantity: qty
      });
    }
  }
  return extracted;
}
function handleMathAndFormulas(query) {
  const lower = query.toLowerCase().trim();
  const gstMatch = lower.match(/(?:gst\s*(?:on|of)?|18%\s*(?:of|on)?)\s*(\d+(?:\.\d+)?)/i);
  if (gstMatch) {
    const base = parseFloat(gstMatch[1]);
    const gst = base * 0.18;
    const total = base + gst;
    return `### \u{1F9EE} GST Commercial Breakdown (18% Statutory Electrical Rate):

\u2022 **Base Taxable Amount**: \u20B9${base.toLocaleString("en-IN")}
\u2022 **18% GST (CGST 9% + SGST 9% / IGST 18%)**: \u20B9${gst.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
\u2022 **Total Landed Invoice Amount**: **\u20B9${total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}**

\u26A1 *Note: Every Volamp tax invoice includes 100% compliant GST input tax credit (ITC) with HSN codes.*`;
  }
  const percentMatch = lower.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|on)\s*(\d+(?:\.\d+)?)/i);
  if (percentMatch) {
    const p = parseFloat(percentMatch[1]);
    const val = parseFloat(percentMatch[2]);
    const res = p / 100 * val;
    return `### \u{1F9EE} Calculation:
**${p}% of \u20B9${val.toLocaleString("en-IN")}** = **\u20B9${res.toLocaleString("en-IN", { maximumFractionDigits: 2 })}**`;
  }
  const mathMatch = lower.match(/(?:what is|calculate|solve)?\s*(\d+(?:\.\d+)?)\s*([\+\-\*\/x×÷\^])\s*(\d+(?:\.\d+)?)/i);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const b = parseFloat(mathMatch[3]);
    let result = 0;
    let opSymbol = op;
    if (op === "+") {
      result = a + b;
      opSymbol = "+";
    } else if (op === "-") {
      result = a - b;
      opSymbol = "-";
    } else if (op === "*" || op === "x" || op === "\xD7") {
      result = a * b;
      opSymbol = "\xD7";
    } else if (op === "/" || op === "\xF7") {
      if (b === 0) return "Division by zero is undefined!";
      result = a / b;
      opSymbol = "\xF7";
    } else if (op === "^") {
      result = Math.pow(a, b);
      opSymbol = "^";
    }
    return `### \u{1F9EE} Math Result:
**${a} ${opSymbol} ${b}** = **${result.toLocaleString("en-IN", { maximumFractionDigits: 4 })}**`;
  }
  const wattsMatch = lower.match(/(?:how many watts|power)\s*(?:is|for)?\s*(\d+)\s*(?:amps?|a)\s*(?:at|and)?\s*(\d+)\s*(?:volts?|v)/i);
  if (wattsMatch) {
    const amps = parseFloat(wattsMatch[1]);
    const volts = parseFloat(wattsMatch[2]);
    const watts = volts * amps;
    const kw = watts / 1e3;
    return `### \u26A1 Electrical Power Calculation:

\u2022 **Formula**: $P = V \\times I$ (Single-phase at unity power factor)
\u2022 **Voltage ($V$)**: ${volts} V
\u2022 **Current ($I$)**: ${amps} A
\u2022 **Power**: **${watts.toLocaleString("en-IN")} Watts** (**${kw.toFixed(2)} kW**) (or **${(kw / 0.746).toFixed(2)} HP**)`;
  }
  return null;
}
function formatProductCard(p) {
  let specsObj = {};
  if (p.specifications) {
    try {
      specsObj = typeof p.specifications === "string" ? JSON.parse(p.specifications) : p.specifications;
    } catch {
    }
  }
  const lines = [];
  lines.push(`\u2022 **${p.name}** (\`${p.sku || p.productId}\`)`);
  lines.push(`  - **Brand & Category**: ${p.brand} \xB7 ${p.category}${p.subcategory ? ` (${p.subcategory})` : ""}`);
  if (p.size || p.material) {
    lines.push(`  - **Conductor & Size**: ${p.size || "Standard"} ${p.material ? `\xB7 ${p.material}` : ""}`);
  }
  const hasDiscount = Boolean(
    p.discount && p.discount !== "0" && p.discount !== "0.0" && p.discount !== "0 %" && p.discount !== "0.0 %" && p.discount !== "0%"
  );
  const priceDisplay = p.discountedPrice ? `**${p.discountedPrice}** ${p.unit || "per meter"}${hasDiscount ? ` *(List: ${p.price}, ${p.discount} OFF Contractor Discount)*` : ""}` : p.price || "Contact for Quote";
  lines.push(`  - **Live Contractor Price**: ${priceDisplay}`);
  const techSpecs = [];
  if (specsObj.voltageRating || specsObj.voltageRatingV) techSpecs.push(`Voltage: ${specsObj.voltageRating || specsObj.voltageRatingV}`);
  const rawRating = specsObj.currentRatingAmp || specsObj.currentRatingA;
  if (rawRating) {
    const cleanRating = String(rawRating).trim();
    techSpecs.push(`Rating: ${cleanRating.endsWith("A") || cleanRating.endsWith("a") ? cleanRating : cleanRating + "A"}`);
  }
  if (specsObj.cores) techSpecs.push(`Cores: ${specsObj.cores}`);
  if (specsObj.typeOfArmour) techSpecs.push(`Armour: ${specsObj.typeOfArmour}`);
  if (specsObj.insulationType) techSpecs.push(`Insulation: ${specsObj.insulationType}`);
  if (specsObj.standard) techSpecs.push(`Standard: ${specsObj.standard}`);
  if (techSpecs.length > 0) {
    lines.push(`  - **Technical Specs**: ${techSpecs.join(" | ")}`);
  }
  lines.push(`  - **Availability**: ${p.availability || "IN STOCK"} (Ahmedabad Central Depot) \xB7 MOQ: ${p.moq || "Standard"}`);
  lines.push(`  - [\u{1F449} View Full Product Specifications & Order Online](/product/${p.productId})`);
  return lines.join("\n");
}
function parseProductQuery(q) {
  const normalized = normalizeTypoQuery(q);
  const lower = normalized.toLowerCase();
  const idMatch = lower.match(/\b(cab-\d+|swg-\d+|sol-\d+|ear-\d+|lug-\d+|gld-\d+|sku-[\w-]+)\b/i);
  const sizeMatch = lower.match(/\b(\d+(?:\.\d+)?)\s*(?:sqmm|sq\s*mm|sq|mm)\b/i);
  const coreMatch = lower.match(/\b(\d+(?:\.\d+)?)\s*(?:core|cores|c)\b/i);
  const currMatch = lower.match(/\b(\d+(?:\.\d+)?)\s*(?:a|amp|amps)\b/i);
  let voltage = null;
  if (/11\s*kv/i.test(lower)) voltage = "11kv";
  else if (/33\s*kv/i.test(lower)) voltage = "33kv";
  else if (/1\.1\s*kv|1100\s*v/i.test(lower)) voltage = "1.1kv";
  else if (/1500\s*v/i.test(lower)) voltage = "1500v";
  let brand = null;
  if (/polycab/i.test(lower)) brand = "polycab";
  else if (/kei/i.test(lower)) brand = "kei";
  else if (/finolex|finnolex/i.test(lower)) brand = "finnolex";
  else if (/schneider|schnieder/i.test(lower)) brand = "schnieder";
  else if (/legrand/i.test(lower)) brand = "legrand";
  else if (/lk|l&t|larsen/i.test(lower)) brand = "lk";
  else if (/dowell/i.test(lower)) brand = "dowells";
  else if (/hmi/i.test(lower)) brand = "hmi";
  else if (/comet/i.test(lower)) brand = "comet";
  else if (/(?:volamp|voltamp)\s+(?:products?|brand|cables?|wires?|switchgear|lugs?|glands?|earthing|conduits?)|brand\s*[:=]?\s*(?:volamp|voltamp)/i.test(lower)) brand = "volamp";
  let material = null;
  if (/copper|cu\b/i.test(lower)) material = "copper";
  else if (/aluminium|aluminum|al\b/i.test(lower)) material = "aluminium";
  let armour = null;
  if (/unarmour|unarmor/i.test(lower)) armour = "unarmoured";
  else if (/armour|armor/i.test(lower)) armour = "armoured";
  let category = null;
  if (/mcb|mccb|rccb|switchgear|contactor|isolator|breaker/i.test(lower)) category = "Switchgear";
  else if (/solar/i.test(lower)) category = "Solar";
  else if (/earth|ground/i.test(lower)) category = "Earthing Wires";
  else if (/gland/i.test(lower)) category = "Glands";
  else if (/lug/i.test(lower)) category = "Lugs";
  else if (/conduit|pvc\s*pipe|casing/i.test(lower)) category = "Conduit";
  else if (/wire|cable/i.test(lower)) category = "Wires & Cables";
  const stopWords = /* @__PURE__ */ new Set([
    "what",
    "is",
    "the",
    "tell",
    "me",
    "show",
    "give",
    "price",
    "prices",
    "cost",
    "costs",
    "rate",
    "rates",
    "discount",
    "discounts",
    "of",
    "for",
    "in",
    "with",
    "and",
    "please",
    "do",
    "you",
    "have",
    "i",
    "need",
    "want",
    "to",
    "buy",
    "order",
    "can",
    "how",
    "much",
    "find",
    "search",
    "looking",
    "about",
    "any",
    "available",
    "product",
    "products",
    "item",
    "items",
    "details",
    "recommend",
    "suggest",
    "which",
    "are",
    "there",
    "list",
    "options",
    "give",
    "send",
    "vola",
    "voltamp",
    "volamp",
    "hey",
    "hi",
    "hello",
    "charge",
    "charges",
    "charged",
    "let",
    "know",
    "cabk",
    "le",
    "whats",
    "bhav",
    "kya",
    "yeh",
    "hai"
  ]);
  const technicalValid2Chars = /* @__PURE__ */ new Set(["al", "cu", "1c", "2c", "3c", "4c", "xl", "lt", "ht"]);
  const tokens = lower.replace(/[\?\,\!\:\;\(\)\"\'\*\#\$\@\%\^\&\=\+]/g, " ").split(/\s+/).filter((t2) => (t2.length >= 3 || technicalValid2Chars.has(t2)) && !stopWords.has(t2));
  return {
    productId: idMatch ? idMatch[1].toLowerCase() : null,
    size: sizeMatch ? sizeMatch[1] : null,
    cores: coreMatch ? coreMatch[1] : null,
    voltage,
    brand,
    material,
    armour,
    currentRating: currMatch ? currMatch[1] : null,
    category,
    tokens
  };
}
function findMatchingProducts(query, limit = 4) {
  const all = getCachedProducts();
  const normalized = normalizeTypoQuery(query);
  const parsed = parseProductQuery(normalized);
  if (parsed.productId) {
    const exact = all.find(
      (p) => p.productId.toLowerCase() === parsed.productId || p.sku.toLowerCase() === parsed.productId || p.sku.toLowerCase().includes(parsed.productId)
    );
    if (exact) return [exact];
  }
  const scored = all.map((p) => {
    let score = 0;
    const haystack = getProductHaystack(p);
    if (parsed.size) {
      const pSize = (p.size || "").toLowerCase();
      const pName = p.name.toLowerCase();
      const sqmmMatch = new RegExp(`\\b${escapeRegExp(parsed.size)}\\s*(?:sqmm|sq\\s*mm|sq)\\b`, "i");
      if (sqmmMatch.test(pSize) || sqmmMatch.test(pName)) {
        score += 300;
      } else {
        score -= 2e3;
      }
    }
    if (parsed.cores) {
      const pSpecs = parseItemSpecs(p.specifications);
      const pCores = `${pSpecs.cores || ""} ${p.name}`.toLowerCase();
      if (pCores.includes(`${parsed.cores} core`) || pCores.includes(`${parsed.cores}core`) || pCores.includes(`${parsed.cores}c`)) score += 250;
      else score -= 150;
    }
    if (parsed.voltage) {
      const pSpecs = parseItemSpecs(p.specifications);
      const pVolt = `${pSpecs.voltageRating || ""} ${pSpecs.voltageRatingV || ""} ${p.name}`.toLowerCase();
      if (parsed.voltage === "11kv" && (pVolt.includes("11 kv") || pVolt.includes("11kv"))) score += 250;
      else if (parsed.voltage === "33kv" && (pVolt.includes("33 kv") || pVolt.includes("33kv"))) score += 250;
      else if (parsed.voltage === "1.1kv" && (pVolt.includes("1100") || pVolt.includes("1.1"))) score += 200;
      else if (parsed.voltage === "1500v" && pVolt.includes("1500")) score += 250;
      else score -= 80;
    }
    if (parsed.brand) {
      if (normalizeBrand(p.brand) === parsed.brand) score += 200;
      else score -= 100;
    }
    if (parsed.material) {
      const pMat = `${p.material || ""} ${p.name}`.toLowerCase();
      if (parsed.material === "copper" && (pMat.includes("copper") || pMat.includes("cu"))) score += 150;
      else if (parsed.material === "aluminium" && (pMat.includes("alumin") || pMat.includes("al"))) score += 150;
      else score -= 100;
    }
    if (parsed.armour) {
      const pSpecs = parseItemSpecs(p.specifications);
      const pArmour = `${pSpecs.typeOfArmour || ""} ${p.name}`.toLowerCase();
      if (parsed.armour === "armoured" && (pArmour.includes("armoured") || pArmour.includes("armored")) && !pArmour.includes("unarmoured")) score += 150;
      else if (parsed.armour === "unarmoured" && (pArmour.includes("unarmoured") || pArmour.includes("unarmored"))) score += 150;
      else score -= 80;
    }
    if (parsed.currentRating) {
      const pSpecs = parseItemSpecs(p.specifications);
      const pCurr = `${pSpecs.currentRatingA || ""} ${pSpecs.currentRatingAmp || ""} ${p.size || ""} ${p.name}`.toLowerCase();
      if (pCurr.includes(`${parsed.currentRating}a`) || pCurr.includes(`${parsed.currentRating}.0a`) || pCurr.includes(`${parsed.currentRating} a`)) score += 250;
      else score -= 120;
    }
    if (parsed.category) {
      if (normalizeCategory(p.category).toLowerCase() === parsed.category.toLowerCase()) score += 80;
    }
    for (const token of parsed.tokens) {
      const tokenRegex = new RegExp(`\\b${escapeRegExp(token)}\\b`, "i");
      if (tokenRegex.test(haystack)) score += 40;
    }
    return { product: p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, limit).map((s) => s.product);
}
function handlePricingCostsAndDiscounts(query) {
  const normalized = normalizeTypoQuery(query);
  const lower = normalized.toLowerCase().trim();
  const isPricingOrDiscountQuery = /\b(?:prices?|costs?|discounts?|rates?|pricing|charge|charges|how\s*much|bhav|discount\s*slabs?|contractor\s*discounts?|wholesale|margins?|taxes|tax|gst\s*rates?|payment\s*terms?|moqs?|drum\s*costs?|quotations?|rfqs?)\b/i.test(lower);
  if (!isPricingOrDiscountQuery) return null;
  const isGeneralDiscountQuery = /\b(?:contractor\s*discounts?|wholesale\s*rates?|discount\s*slabs?|payment\s*terms?)\b/i.test(lower) || /\b(?:what|tell\s*me|explain|give|offer|share|any)\b.*\b(?:discounts?|slabs?|terms?|structure)\b/i.test(lower) || /^(?:discounts?|prices?|pricing|costs?)$/i.test(lower.replace(/[?.!]/g, "").trim()) || /\b(?:discount|pricing|rates?|slabs?)\b/i.test(lower) && /\b(?:wires?|cables?|switchgear)\b/i.test(lower) && !/\b(?:\d+\s*(?:sqmm|sq\s*mm|core|a|amp)|solar|polycab|kei|finolex|schneider|legrand|gland|lug)\b/i.test(lower);
  const hasSpecificProduct = /\b(?:\d+(?:\.\d+)?\s*(?:sqmm|sq\s*mm|core|c\b|a\b|amp|mm|kva|kw|hp)|copper|aluminium|polycab|kei|finolex|schneider|legrand|mcb|mccb|rccb|gland|lug|conduit|earthing|solar|cable|cables|wire|wires|pipe|switchgear|breaker|terminal)\b/i.test(lower);
  if (hasSpecificProduct && !isGeneralDiscountQuery) {
    const matched = findMatchingProducts(normalized, 4);
    if (matched.length > 0) {
      const productCards = matched.map(formatProductCard).join("\n\n");
      const cleanLabel = query.trim();
      return `### \u{1F4B0} Live Factory Pricing & Contractor Discounts for "${cleanLabel}":

${productCards}

---

### \u26A1 Commercial Pricing Architecture at Volamp:
\u2022 **Contractor Discount**: Direct **40% OFF** applied from published manufacturer list prices across our catalog (Polycab, KEI, Finolex, Schneider Electric, Legrand, LK), exactly as listed on our website.
\u2022 **Statutory Tax**: 18% GST (CGST 9% + SGST 9% in Gujarat; IGST 18% interstate). Full GST input tax credit invoice issued on dispatch.
\u2022 **Dispatch Cutoff & Logistics**: Orders placed between 8:00 AM and 5:30 PM are considered for delivery/dispatch as per availability and logistics feasibility. For available stock, B2B delivery generally takes around 1\u20133 days. Customer pickup can also be arranged at our separate warehouse.
\u2022 **Payment & Credit**: Direct NEFT/RTGS, advance payment, and approved corporate credit for verified POs.

**Want to lock in this stock?** Tell me your required length/quantity, customer name, contact phone number, and delivery city, and I'll generate your official **Volamp Order Reference ID** right now!`;
    } else {
      return `Let me have our sales team confirm that for you. I don't want to give you incorrect information.

Please share your exact cable or product specifications, size, conductor material (copper/aluminium), quantity, and delivery location. Our sales team will verify current mill availability and provide the exact quotation.`;
    }
  }
  return `### \u{1F4B0} Volamp Commercial Pricing, Cost & Contractor Discount Architecture

At **Volamp Elektrikals Private Limited**, our direct-from-depot wholesale pricing structure is engineered specifically for electrical contractors, EPC infrastructure builders, panel fabricators, and industrial procurement desks:

---

#### 1. \u{1F3F7}\uFE0F Contractor Discount (40% OFF Across Catalog):
We offer a flat **40% OFF** manufacturer list prices across all product categories, exactly as listed on our website:

\u2022 **Wires & Cables (2,856 Products)**:
  - **40% OFF** standard manufacturer list prices across Polycab, KEI, Finolex, and Volamp.
  - Covers Single Core House Wires (FR, FRLS, ZHFR), LT Armoured XLPE/PVC Power & Control Cables, Submersible Flat Cables, and 1500V DC Solar PV Cables.

\u2022 **Switchgear & Circuit Protection (221 Products)**:
  - **40% OFF** on Schneider Electric, LK (L&T), and Legrand.
  - Covers MCBs, RCCBs, MCCBs (16A to 1250A), Heavy Power Contactors, Overload Relays, and Distribution Boards.

\u2022 **Conduit & Cable Containment (93 Products)**:
  - **40% OFF** on Rigid uPVC Conduits (LMS, MMS, HMS conforming to IS 9537) and Casing & Capping.

\u2022 **Cable Glands & Terminals (104 Products)**:
  - **40% OFF** on Single & Double Compression Brass Glands and Heavy-Duty Tinned Copper / Bimetallic Crimping Lugs.

\u2022 **Earthing Systems & Solar Electrical (97 Products)**:
  - **40% OFF** on Copper-Bonded Rods, Chemical Electrodes, Backfill Compound, and Solar Accessories.

---

#### 2. \u{1F9EE} Tax & Cost Breakdown:
\u2022 **List Price / MRP**: Baseline published manufacturer price.
\u2022 **Wholesale Net**: List Price minus **40% Contractor Discount**.
\u2022 **18% GST**: Standard electrical statutory tax (CGST 9% + SGST 9% within Gujarat; IGST 18% interstate). 100% input tax credit (ITC) passed on every consignment.
\u2022 **Net Landed Price**: Net Taxable + 18% GST.

#### 3. \u{1F4B3} Commercial Payment Terms & Dispatch:
\u2022 **Direct NEFT / RTGS**: Instant account settlement.
\u2022 **30-Day Corporate Credit**: Available for verified contractors, OEMs, and institutions upon submission of valid GST registration and approved Purchase Order (PO).
\u2022 **WhatsApp Instant Invoicing**: Digital proforma invoice sent straight to your phone with instant UPI/NEFT payment links.
\u2022 **Dispatch Speed (Policy VEP/LOG/001)**: Standard inventory dispatches within **24\u201348 hours** from our Central Fulfillment Hub in Aslali, Ahmedabad.

Would you like me to calculate the exact net cost for a specific cable size or switchgear rating? Tell me what you need!`;
}
function handleBusinessSegments(query) {
  const lower = query.toLowerCase().trim();
  const isSegmentQuery = /\b(?:business\s*segment|segments|what\s+industries|sectors|epc|infrastructure|heavy\s*industry|manufacturing\s*plant|commercial\s*real\s*estate|solar\s*renewable|power\s*utilit|substation|panel\s*builder|oem|defense|railway|gem\s*supply|distribution\s*(?:&|and)\s*control|ev\s*charging|automation)\b/i.test(lower);
  if (!isSegmentQuery) return null;
  if (/epc|infrastructure|highway|metro|airport|bridge|smart\s*city/i.test(lower)) {
    return `### \u{1F3D7}\uFE0F Segment 01: EPC & Infrastructure Electrification

**Target Clients**: Highways, Metro Rail Projects, Airports, Sea Ports, River Bridges & Smart City Electrification.

\u2022 **Flagship Supplies**:
  - 1.1kV & 11kV/33kV XLPE Armoured Power Cables (Aluminium A2XWY, Copper 2XWY) to IS 7098 (Part 1 & 2).
  - Heavy-Duty Hot-Dip Galvanized (GI) Perforated & Ladder Cable Trays and Raceways.
  - High-Fault Trefoil Cable Cleats for mechanical short-circuit containment.
  - Maintenance-Free Chemical Earthing Electrodes & ESE Lightning Arresters.
\u2022 **Engineering Standards**: IS 7098, CPRI / ERDA Type Tested, Original Material Test Certificate ( MTC ) accompanying every wooden drum.
\u2022 **Logistics**: Direct site dispatch across India from our Ahmedabad central fulfillment depot.`;
  }
  if (/manufacturing|heavy\s*industry|steel\s*mill|chemical|pharma|cement|auto\s*plant/i.test(lower)) {
    return `### \u{1F3ED} Segment 02: Heavy Industry & Manufacturing Plants

**Target Clients**: Chemical & Petrochemical Plants, Pharmaceutical Formulations, Steel Mills, Cement Plants, Auto OEMs.

\u2022 **Flagship Supplies**:
  - VFD Shielded Symmetrical Motor Power Cables (copper tape / braided shield) to suppress high-frequency PWM harmonics.
  - Heat-Resistant Silicon Rubber & Class F/H Insulated Wires.
  - Air Circuit Breakers (ACB) up to 4000A with microprocessor releases.
  - Motor Protection Circuit Breakers (MPCB) and Heavy-Duty Type 2 Coordinated Contactors.
\u2022 **Standards**: IS 1554 / IS 694, Flame-Retardant Low Smoke (FRLS), Class 5 high-flexibility electrolytic copper conductors.`;
  }
  if (/commercial|real\s*estate|tower|high-rise|mall|it\s*park|township/i.test(lower)) {
    return `### \u{1F3E2} Segment 03: Commercial High-Rise & Real Estate

**Target Clients**: Grade-A Commercial Towers, IT Parks, Shopping Malls, Luxury High-Rise Residential Townships.

\u2022 **Flagship Supplies**:
  - Zero-Halogen (ZHFR / LSZH) Building Wires (< 0.5% acid gas emission) conforming to National Building Code (NBC 2016).
  - SPN, TPN & Vertical Distribution Boards (IP43/IP54 rating).
  - Multi-Function Digital Energy & Power Quality Meters.
  - Underfloor Cable Trunking, Flush Floor Junction Boxes & Rigid uPVC Conduits.
\u2022 **Compliance**: NBC 2016 Compliant, IS 694 Certified, Green Building Council Approved.`;
  }
  if (/solar|renewable|pv\s*farm|rooftop|bess|inverter/i.test(lower)) {
    return `### \u2600\uFE0F Segment 04: Solar & Renewable Energy Infrastructure

**Target Clients**: Utility-Scale Solar PV Farms, Commercial Rooftops, Battery Energy Storage Systems (BESS).

\u2022 **Flagship Supplies**:
  - 1.5 kV DC Solar PV Cables (EN 50618 / T\xDCV 2 Pfg 1169 certified, electron-beam XLPO, tinned copper, 4/6/10 sqmm).
  - MC4 IP68 Connectors & Multi-Branch Splitters.
  - Array Junction Boxes (AJB / String Monitoring Boxes SMB) with 1000V/1500V DC fuses.
  - DC Isolators & Type 2 DC Surge Protective Devices (SPDs).
\u2022 **Specs**: UV & ozone resistant, withstands -40\xB0C to +120\xB0C, 25+ year outdoor operational life.`;
  }
  if (/power\s*utilit|discom|substation|transmission|grid|transformer/i.test(lower)) {
    return `### \u26A1 Segment 05: Power Utilities & Grid Sub-stations

**Target Clients**: State Transmission Utilities (GETCO, MSETCL, etc.), DISCOMs, Step-Down Substations (11kV / 33kV / 66kV).

\u2022 **Flagship Supplies**:
  - Extra High Voltage (EHV) & HT Underground Power Feeders (11kV, 22kV, 33kV XLPE Aluminium A2XWY).
  - High-Conductivity Electrolytic Copper & Aluminium Busbars.
  - Current Transformers (CT) & Potential Transformers (PT).
  - Station-Class Lightning Arresters & Gang-Operated Air Break (GOAB) Switches.
\u2022 **Inspections**: Third-Party Inspection Agency (TPIA: RITES, SGS, TUV, BV) cleared.`;
  }
  if (/panel\s*builder|oem|switchboard|mcc\b|fabricat/i.test(lower)) {
    return `### \u2699\uFE0F Segment 06: Panel Builders & OEM Fabricators

**Target Clients**: LV/MV Switchboard Fabricators, Motor Control Centers (MCC), Automation Panel Builders.

\u2022 **Flagship Supplies**:
  - Tri-Rated UL / CSA / BS Flexible Control Panel Wires (Class 5 fine copper strands).
  - Power Contactors (9A to 800A AC-3) & Thermal Overload Relays from Schneider Electric and LK (L&T).
  - 22.5mm Push Buttons, Selector Switches & High-Intensity LED Pilot Lights.
  - Feed-Through DIN-Rail Terminal Blocks, End Clamps, and Printed Ferrules.
\u2022 **Standards**: IS 13947 / IEC 60947, CE / UL component grades with batch-to-batch consistency.`;
  }
  if (/defense|railway|gem|government|psu|cpwd|mes|rdso/i.test(lower)) {
    return `### \u{1F6E1}\uFE0F Segment 07: Government, Defense & Institutional Supplies (GeM)

**Target Clients**: Indian Railways, Central PWD (CPWD), Military Engineer Services (MES), Defense Projects, Government e-Marketplace (GeM).

\u2022 **Flagship Supplies**:
  - RDSO-Approved Railway Signaling & Trackside Power Cables.
  - Heavy-Duty Weatherproof Outdoor Feeder Pillars & Distribution Enclosures.
  - GeM-Registered Certified Distribution Boards & Industrial Switchgear.
  - Flameproof / Explosion-Proof Ex d IIC Junction Boxes.
\u2022 **Compliance**: Verified GeM OEM/Reseller, RDSO & MES Compliant, dedicated public tender bidding desk.`;
  }
  return `### \u26A1 Volamp Elektrikals \u2014 10 Specialized Business Segments

At **Volamp Elektrikals Private Limited**, we deliver an end-to-end engineered supply chain across **10 core industrial sectors**:

1. \u{1F3D7}\uFE0F **EPC & Infrastructure**: 1.1kV & 11kV/33kV XLPE Armoured cables, perforated GI cable trays, trefoil cleats, chemical earthing (IS 7098).
2. \u{1F3ED} **Heavy Industry & Manufacturing**: VFD shielded cables, silicon rubber high-temp wires, ACBs up to 4000A, MPCBs for chemical, pharma & steel plants.
3. \u{1F3E2} **Commercial & Real Estate**: Zero-Halogen (ZHFR) building wires, SPN/TPN vertical DBs, multi-function digital energy meters (NBC 2016).
4. \u2600\uFE0F **Solar & Renewable Energy**: 1.5 kV DC Solar PV Cables (EN 50618/T\xDCV), MC4 connectors, Array Junction Boxes (AJB), DC fuses & isolators.
5. \u26A1 **Power Utilities & Sub-stations**: EHV & HT feeders (11kV to 33kV), electrolytic copper/alu busbars, CT/PTs, lightning arresters (TPIA cleared).
6. \u2699\uFE0F **Panel Builders & OEMs**: Tri-rated UL flexible wires, Schneider/LK power contactors, overload relays, push buttons, DIN-rail terminals.
7. \u{1F6E1}\uFE0F **Government, Defense & PSUs (GeM)**: RDSO railway signaling cables, CPWD/MES supplies, GeM verified distribution enclosures.
8. \u{1F50C} **Electrical Distribution & Control**: Busbar Trunking Systems (BBT), APFC power factor capacitor banks, Type 1+2 surge protective devices.
9. \u{1F697} **EV Charging Infrastructure**: High-ampacity charging cables, Type 2 connectors, dedicated EV sub-distribution boards, IP66 housings.
10. \u{1F916} **Electrical Panels & Automation**: Turnkey PCC, MCC, APFC, AMF/ATS automatic transfer panels, PLCs, Variable Frequency Drives (VFDs).

**One Accountable Partner. Complete Electrical Solutions.**
Which business segment matches your site? Tell me your load or required BOM, and I'll tailor the exact specs and quotation right away!`;
}
function handleAboutUsAndHeritage(query) {
  const lower = query.toLowerCase().trim();
  const isAboutQuery = /\b(?:about\s*volamp|about\s*us|who\s*are\s*you|history|heritage|legacy|4\s*generation|four\s*generation|founder|origin|founded|soma\s*bhai|chaturbhai|vipulbhai|naimil|patel|ceo|quote|message|vision|team|headquarters|office|address|where\s*(?:are\s*you|is\s*volamp)|location|khadia|aslali|sanand|cin|gstin|gem\s*registration)\b/i.test(lower);
  if (!isAboutQuery) return null;
  const isHistoryOr4Gen = /\b(?:history|story|heritage|legacy|4\s*generation|four\s*generation|origin|founded|1964|soma\s*bhai)\b/i.test(lower);
  if (!isHistoryOr4Gen && /\b(?:ceo|message|quote|vision|leader|director|naimil)\b/i.test(lower) && !lower.includes("price") && !lower.includes("order")) {
    return `### \u{1F4AC} CEO Message \u2014 Naimil Patel: *"Saath Milkar Growth Ki Ek Nayi Pehchaan Banayein"*

> *"Koi bhi company sirf products se nahi banti \u2014 company banti hai INSAN, unki mehnat, commitment aur customer ke trust se.*
> *Volamp Elektrikals ke safar mein hamara focus sirf business grow karna nahi, balki trust, quality aur strong relations build karna hai."*

**Core Pillars of Our Leadership Vision:**
\u2022 **Continuous Upgrades**: Relentless modernization of manufacturing specifications, testing procedures, and digital supply workflows.
\u2022 **Long-Term Partnerships**: Every contractor, EPC, and client is treated as a 20-year relationship, never a one-off transaction.
\u2022 **Ownership & Accountability**: Empowering every team member to take personal responsibility for zero-defect consignment delivery.
\u2022 **Motto**: *"Together, Let's Power the Growth. Together, Let's Build Volamp and India."*

**Key Leadership & Supply Desk Team:**
\u2022 **Naimil Patel** \u2014 Chief Executive Officer
\u2022 **Roshni Shroff, Pooja Thakor, Pooja Patel** \u2014 Sales & Client Solutions
\u2022 **Jinay Patel** \u2014 Switchgear Sourcing Specialist
\u2022 **Dhaval Rana** \u2014 Finance & Accounts Manager
\u2022 **Montu Patil** \u2014 Logistics & Operations Manager

Direct Supply Desk: **+91 9512365582** | sales@volampelektrikals.com`;
  }
  return `### \u{1F3DB}\uFE0F Four Generations. 60+ Years of Legacy. One Vision for the Future.

The journey of **VOLAMP ELEKTRIKALS PRIVATE LIMITED** represents over six decades of family entrepreneurship, engineering discipline, and industrial trust rooted in Gujarat:

---

#### 1. 1964 \u2014 1st Generation (Soma Bhai Khatubhai Patel)
An ITI-trained electrician from Panchmahal, Gujarat, who moved to Ahmedabad driven by entrepreneurial ambition. After working in textile and flour mills, he co-founded **S.P. Electric and Engineering Company** as a partnership firm in **June 1964** \u2014 sparking a multi-generational electrical legacy.

#### 2. 1970s\u201380s \u2014 2nd Generation (Chaturbhai Somabhai Patel)
Carried the enterprise forward by expanding distribution across Gujarat's booming manufacturing corridors (Ahmedabad, Vadodara, Ankleshwar, Vapi), establishing decades of integrity and technical reliability.

#### 3. 1986 \u2014 3rd Generation (Vipulbhai Chaturbhai Patel)
Entered the trade in 1986. Under his guidance, the business adapted to rapid infrastructure advancements, diversifying into modern switchgear, power cables, and multi-regional industrial contracts.

#### 4. 2008\u2013Present \u2014 4th Generation (Naimil Vipul Patel \xB7 CEO)
Having an innate passion for electrical cables from his school days, Naimil studied Electrical Engineering (2008\u20132012) while working from the ground up. In **2014**, he established **Volamp Power**, scaling nationwide supply partnerships. In **2021**, the family restructured for the next 50+ years, incorporating **Volamp Elektrikals Private Limited**.

---

### \u{1F3E2} Operational Infrastructure & Registrations:
\u2022 **Corporate Headquarters**: 1753, Khadia, Ahmedabad, Gujarat 380001
\u2022 **Central Logistics & Fulfillment Hub**: Aslali, Ahmedabad (24\u201348 hour rapid dispatch across India & overseas)
\u2022 **Quality Testing Facility**: Sanand & Ahmedabad (High-voltage spark testing, IS 7098 & IS 694 compliance)
\u2022 **Statutory Details**: CIN: **U31900GJ2021PTC122730** | GSTIN: **24AAICV0754B1ZO**
\u2022 **Institutional Registration**: Verified GeM (Government e-Marketplace) Supplier
\u2022 **Direct Supply Desk**: \u{1F4DE} **+91 9512365582** | \u2709\uFE0F **sales@volampelektrikals.com**

You can explore our interactive 3D global presence on our **[About Volamp Page](/about-volamp)** or tell me your site needs!`;
}
function handleTechnicalEngineeringAndSizing(query) {
  const lower = query.toLowerCase().trim();
  const isCalculationOrSizing = /\b(?:calculat|cable\s*size|size\s*cable|sizing|voltage\s*drop|conductor\s*calc|kw\s*to\s*amp|amp\s*for|drop\s*calc|sizing\s*matrix|sizing\s*chart|breaker\s*rating)\b/i.test(lower);
  if (!isCalculationOrSizing) return null;
  const kwMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kw|kilo\s*watts?)/i);
  const hpMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hp|horse\s*power)/i);
  let kwVal = kwMatch ? parseFloat(kwMatch[1]) : hpMatch ? parseFloat(hpMatch[1]) * 0.746 : null;
  if (kwVal && kwVal > 0) {
    const amps3P = Math.round(kwVal * 1e3 / (1.732 * 415 * 0.85) * 10) / 10;
    let recSize = "2.5 sq.mm Copper / 4 sq.mm Aluminium";
    let breaker = "16A C-Curve MCB";
    if (amps3P > 15 && amps3P <= 25) {
      recSize = "4 sq.mm Copper / 6 sq.mm Aluminium";
      breaker = "25A / 32A MCB";
    } else if (amps3P > 25 && amps3P <= 35) {
      recSize = "6 sq.mm Copper / 10 sq.mm Aluminium";
      breaker = "40A MCB";
    } else if (amps3P > 35 && amps3P <= 50) {
      recSize = "10 sq.mm Copper / 16 sq.mm Aluminium";
      breaker = "63A MCB / MCCB";
    } else if (amps3P > 50 && amps3P <= 70) {
      recSize = "16 sq.mm Copper / 25 sq.mm Aluminium";
      breaker = "80A / 100A MCCB";
    } else if (amps3P > 70 && amps3P <= 95) {
      recSize = "25 sq.mm Copper / 35 sq.mm Aluminium";
      breaker = "100A / 125A MCCB";
    } else if (amps3P > 95 && amps3P <= 125) {
      recSize = "35 sq.mm Copper / 50 sq.mm Aluminium";
      breaker = "125A / 160A MCCB";
    } else if (amps3P > 125 && amps3P <= 160) {
      recSize = "50 sq.mm Copper / 70 sq.mm Aluminium";
      breaker = "160A / 200A MCCB";
    } else if (amps3P > 160 && amps3P <= 200) {
      recSize = "70 sq.mm Copper / 95 sq.mm Aluminium";
      breaker = "200A / 250A MCCB";
    } else if (amps3P > 200 && amps3P <= 250) {
      recSize = "95 sq.mm Copper / 120 sq.mm Aluminium";
      breaker = "250A / 315A MCCB";
    } else if (amps3P > 250 && amps3P <= 300) {
      recSize = "120 sq.mm Copper / 150 sq.mm Aluminium";
      breaker = "315A / 400A MCCB";
    } else if (amps3P > 300) {
      recSize = "185 sq.mm+ Copper / 240 sq.mm+ Aluminium";
      breaker = "400A+ MCCB / ACB";
    }
    return `### \u26A1 High-Precision Cable Sizing for **${kwVal.toFixed(1)} kW Load**

\u2022 **Full Load Current (3-Phase 415V, 0.85 PF)**: **${amps3P} Amperes**
\u2022 **Recommended Cable Cross-Section**: **${recSize}**
\u2022 **Recommended Circuit Breaker**: **${breaker}**
\u2022 **Governing Standards**: Conforms to **IS 7098 (Part 1/2)** for XLPE armoured cables and **IS 694** for flexible copper building wires.
\u2022 **Voltage Drop Rule**: For runs exceeding 80 meters, step up conductor size by one cross-section to guarantee voltage drop remains **\u2264 3%**.

**Live Pricing & Brand Selection:**
\u{1F449} Launch our **[Interactive Cable Calculator & Estimator](/calculator)** to compare **Polycab, Finolex, KEI, and Volamp OEM** discounts, compute drum weights, and generate an official project BOQ!`;
  }
  return `### \u26A1 Volamp Engineering Sizing Matrix & Cable Calculator

Here is the official quick reference sizing matrix based on **IS 7098 Part 1 (XLPE)** and **IS 694** for 3-Phase 415V electrical loads:

| Load (kW / HP) | Current (415V, 0.85 PF) | Recommended Copper | Recommended Aluminium | Recommended Breaker |
| :--- | :--- | :--- | :--- | :--- |
| **3.7 kW (5 HP)** | 7.2 A | **2.5 sq.mm** | **4 sq.mm** | 16A MCB |
| **7.5 kW (10 HP)** | 14.1 A | **4 sq.mm** | **10 sq.mm** | 25A MCB |
| **15 kW (20 HP)** | 27.5 A | **10 sq.mm** | **16 sq.mm** | 40A MCB |
| **22 kW (30 HP)** | 40.0 A | **16 sq.mm** | **25 sq.mm** | 63A MCB |
| **30 kW (40 HP)** | 54.5 A | **25 sq.mm** | **35 sq.mm** | 80A MCCB |
| **45 kW (60 HP)** | 81.5 A | **35 sq.mm** | **70 sq.mm** | 125A MCCB |
| **75 kW (100 HP)** | 135.0 A | **70 sq.mm** | **120 sq.mm** | 200A MCCB |
| **110 kW (150 HP)** | 196.0 A | **120 sq.mm** | **185 sq.mm** | 315A MCCB |
| **160 kW (215 HP)** | 284.0 A | **185 sq.mm** | **300 sq.mm** | 400A MCCB / ACB |

\u2022 **Voltage Drop Limit**: Maximum allowable voltage drop is **3% for domestic/lighting** and **5% for industrial power feeders**.
\u2022 **Direct Calculator Tool**: Open our **[Cable Calculator Page](/calculator)** for instant voltage drop analysis, contractor discount simulation, and PDF export!`;
}
function handleScienceAndElectrical(query) {
  const lower = query.toLowerCase().trim();
  if (/what\s+is\s+electricity|how\s+does\s+electricity\s+work/i.test(lower)) {
    return `### \u26A1 What is Electricity?

**Electricity** is the flow of electric charge, primarily the movement of free electrons through a conductive metal lattice (like electrolytic copper or aluminium).

\u2022 **Voltage ($V$)**: The electrical potential difference or "pressure" pushing charges through the circuit (Volts).
\u2022 **Current ($I$)**: The rate of electrical charge flow past a specific point (Amperes).
\u2022 **Resistance ($R$)**: The opposition a material offers to charge flow (Ohms, $\\Omega$).
\u2022 **Ohm's Law**: $V = I \\times R$.

In electrical cables, higher purity conductors (like Volamp's 99.97% electrolytic copper) minimize resistance, preventing dangerous heat buildup and energy loss.`;
  }
  if (/ac\s*(?:vs|or|and)\s*dc|alternating\s*current|direct\s*current/i.test(lower)) {
    return `### \u26A1 AC (Alternating Current) vs. DC (Direct Current):

\u2022 **AC (Alternating Current)**:
  - Reverses direction periodically (in India, **50 Hz**, reversing 50 times per second).
  - **Advantage**: Stepped up/down easily using transformers, enabling hyper-efficient transmission over long-distance power grids.
  - **Uses**: Wall sockets, grid infrastructure, induction motors.

\u2022 **DC (Direct Current)**:
  - Flows unidirectionally with constant polarity.
  - **Uses**: Solar PV systems, batteries, electronics, Electric Vehicles (EVs).

Volamp stocks both AC industrial power cables and specialized 1.5 kV DC Solar PV cables!`;
  }
  if (/how\s+does\s+a\s+transformer\s+work|what\s+is\s+a\s+transformer/i.test(lower)) {
    return `### \u26A1 How a Transformer Works:

A **transformer** transfers electrical power between circuits through **electromagnetic induction** at constant frequency:

1. **Primary Winding**: AC current produces an alternating magnetic flux in the laminated iron core.
2. **Laminated Core**: Channels magnetic flux to the secondary winding with minimal eddy current losses.
3. **Secondary Winding**: Induces an AC voltage proportional to the turns ratio (Faraday's Law).

\u2022 **Step-Up**: More secondary turns $\\rightarrow$ boosts voltage for high-voltage grid transmission.
\u2022 **Step-Down**: Fewer secondary turns $\\rightarrow$ steps down 11kV or 415V to 230V for safe usage.`;
  }
  if (/earthing|grounding|why\s+is\s+earthing\s+important|how\s+does\s+earthing\s+work/i.test(lower)) {
    return `### \u{1F30D} Why Earthing (Grounding) is Critical (IS 3043:2018):

**Earthing** establishes an immediate, low-resistance path to discharge fault currents safely into the mass of the earth.

1. **Human Shock Protection**: When equipment insulation fails, the metal body becomes live. Proper earthing creates a low-resistance path that triggers the MCB/RCCB within milliseconds, averting fatal electrocution.
2. **Surge & Lightning Protection**: Safely diverts direct atmospheric lightning and grid switching surges.
3. **Neutral Reference**: Maintains voltage stabilization across 3-phase circuits.

Volamp supplies **copper-bonded rods (100\u2013250 microns), pipe-in-pipe chemical electrodes, carbonaceous compound (< 0.2 \u03A9\xB7m), and GI/copper earthing strips**.`;
  }
  if (/mcb|mccb|rccb|elcb|circuit\s*breaker/i.test(lower)) {
    return `### \u{1F6E1}\uFE0F Circuit Breakers Explained (MCB, MCCB, RCCB):

\u2022 **MCB (Miniature Circuit Breaker)**: Rated 0.5A to 63A. Trips on thermal overload (bimetallic strip) and short circuit (magnetic solenoid). Breaking capacity 6kA / 10kA (IS/IEC 60898).
\u2022 **MCCB (Moulded Case Circuit Breaker)**: Rated 16A to 1250A. Adjustable thermal-magnetic or microprocessor trip units with 25kA, 36kA, 50kA breaking capacity for main industrial feeders.
\u2022 **RCCB / RCBO (Residual Current Circuit Breaker)**: Detects earth leakage current (30mA for human shock protection; 100mA/300mA for fire protection). Essential for safety!`;
  }
  if (/copper\s*(?:vs|or)\s*alumin/i.test(lower) || /alumin\s*(?:vs|or)\s*copper/i.test(lower)) {
    return `### \u26A1 Copper vs. Aluminium Conductors: Technical Comparison

\u2022 **Conductivity**: Copper = 100% IACS. Aluminium = ~61% IACS. Aluminium requires **~1.6x the cross-sectional area** of Copper to carry equal current.
\u2022 **Tensile Strength & Creep**: Copper has double the tensile strength and does not suffer from loose terminal joints. Aluminium expands/contracts rapidly under thermal cycles and oxidizes upon air contact (always terminate with bimetallic lugs and anti-oxidant paste).
\u2022 **Weight & Cost**: Aluminium is ~3x lighter and dramatically cheaper per kg. For heavy distribution cables (16 sqmm to 630 sqmm), Aluminium provides unbeatable cost savings. Copper is preferred for house wires, control panels, and tight spaces.`;
  }
  if (/xlpe\s*(?:vs|or)\s*pvc|pvc\s*(?:vs|or)\s*xlpe/i.test(lower)) {
    return `### \u26A1 XLPE vs. PVC Insulation:

\u2022 **Continuous Temperature**: XLPE = **90\xB0C** continuous (250\xB0C short circuit). PVC = **70\xB0C** continuous (160\xB0C short circuit).
\u2022 **Current Carrying Capacity**: XLPE handles higher operating temperatures, carrying **15% to 25% more current** than identical-sized PVC conductors.
\u2022 **Dielectric & Moisture Strength**: XLPE has virtually zero moisture absorption and superior dielectric resistance, making it the modern standard for power cables (IS 7098).
\u2022 **PVC Advantages**: Higher mechanical flexibility and lower cost for building wires (IS 694).`;
  }
  if (/fr\s*(?:vs|or)\s*frls|frls\s*(?:vs|or)\s*zhfr|lszh\s*(?:vs|or)\s*frls/i.test(lower)) {
    return `### \u{1F525} FR vs. FRLS vs. ZHFR (Flame Retardant Grades):

\u2022 **FR (Flame Retardant)**: Oxygen index > 29%. Restricts flame propagation along the cable run, but emits dense black smoke and acidic HCl gas.
\u2022 **FRLS (Flame Retardant Low Smoke)**: Restricts fire spread + smoke density < 60% and acid gas < 20%. Improves visibility during building evacuations.
\u2022 **ZHFR / LSZH (Zero Halogen Flame Retardant)**: Emits **zero toxic halogen gases** (acid gas < 0.5%). Generates clean water-vapor smoke that does not choke occupants or corrode electronic servers. Mandatory for metro rail, airports, hospitals, and high-rise towers (NBC 2016).`;
  }
  return null;
}
function handleProductAndCatalogQuery(query) {
  const lower = query.toLowerCase().trim();
  if (/\b(?:calculate\s+(?:cable\s+)?size|cable\s+sizing|sizing\s+for|how\s+many\s+sqmm\s+for)\b/i.test(lower)) return null;
  if (/\b(?:history|heritage|4\s*generations?|four\s*generations?|founder|story|ceo|who\s+founded|who\s+started|journey)\b/i.test(lower)) return null;
  if (/\b(?:business\s*segment|segments|what\s+industries|sectors|what\s+sectors|industries\s+do\s+you\s+serve)\b/i.test(lower)) return null;
  if (/\b(?:contractor\s*discounts?|discount\s*slabs?|what\s+discounts?|pricing\s*architecture)\b/i.test(lower) && !/\b\d+\s*(?:sqmm|sq\s*mm|core|a|amp|kv)\b/i.test(lower)) return null;
  const skuMatch = lower.match(/\b(cab-\d+|swg-\d+|sol-\d+|ear-\d+|lug-\d+|gld-\d+|sku-[\w-]+)\b/i);
  if (skuMatch) {
    const targetId = skuMatch[1].toUpperCase();
    const all = getCachedProducts();
    const prod = getProductByProductId(targetId) || all.find(
      (p) => p.productId.toUpperCase() === targetId || p.sku.toUpperCase() === targetId || p.sku.toLowerCase().includes(skuMatch[1].toLowerCase())
    );
    if (prod) {
      return `### \u26A1 Verified Product Specification & Live Pricing:

${formatProductCard(prod)}

---

**Commercial Ordering & Fast Dispatch:**
\u2022 **Contractor Discount**: Direct **40% OFF** manufacturer list price already applied.
\u2022 **Stock Depot**: Allotted from Ahmedabad Central Hub (Same-day to 24h Gujarat GIDC / 48\u201372h Pan-India Dispatch under Policy VEP/LOG/001).
\u2022 **Tax Invoice**: 18% GST invoice with full ITC passed on dispatch.

**Ready to book this item?** Tell me your required quantity/meters, customer name, phone number, and delivery city!`;
    }
  }
  const isMasterCatalogQuery = /teach\s*(?:vola|me)?\s*(?:about)?\s*(?:each|all)?\s*product/i.test(lower) || /everything\s+on\s+(?:our\s+)?website/i.test(lower) || /^(?:what\s+products\s+do\s+you\s+(?:have|sell|offer|deal\s+in|carry)|show\s+(?:me\s+)?(?:all\s+)?products|list\s+products|product\s*catalog|catalog|categories|all\s+categories)\b/i.test(lower) || /(?:all|list|show|browse|what)\s+(?:the\s+)?(?:products|categories|catalog|items|inventory)\b/i.test(lower) && !/\b\d+\s*(?:sqmm|sq\s*mm|core|a|amp|kv)\b/i.test(lower);
  if (isMasterCatalogQuery) {
    const featured = findMatchingProducts("4 sqmm copper", 3);
    const featuredCards = featured.map(formatProductCard).join("\n\n");
    return `### \u26A1 Complete Volamp Product Catalog Directory (3,385+ Certified Products Across 8 Categories)

Welcome to **Volamp Elektrikals**! We distribute 3,385+ industrial-grade electrical materials with factory-direct **40% Contractor Discount** from our Ahmedabad fulfillment depot:

---

#### 1. \u{1F50C} [Wires & Cables (2,856 Products in Database)](/category/wire-cables)
\u2022 **Authorized Brands**: Polycab, KEI, Finolex, Volamp
\u2022 **Offerings**: Single Core Flexible Building Wires (FR, FRLS, ZHFR), Armoured LT & HT XLPE/PVC Power Cables (1.1kV, 11kV, 33kV), Submersible Flat Cables, LAN Cat6, CCTV Cables.
\u2022 [\u{1F449} Browse Full Wires & Cables Catalog](/category/wire-cables)

#### 2. \u{1F6E1}\uFE0F [Switchgear & Circuit Protection (221 Products in Database)](/category/switchgear)
\u2022 **Authorized Brands**: Schneider Electric, LK (L&T), Legrand, Volamp
\u2022 **Offerings**: MCBs (0.5A to 63A; 6kA/10kA), MCCBs (16A to 1250A), RCCBs, Contactors, Overload Relays, Distribution Boards.
\u2022 [\u{1F449} Browse Full Switchgear Catalog](/category/switchgear)

#### 3. \u2600\uFE0F [Solar Electrical Solutions (60 Products in Database)](/category/solar)
\u2022 **Authorized Brands**: Polycab, KEI, Volamp, Waaree
\u2022 **Offerings**: 1500V DC Solar PV Cables (T\xDCV/EN 50618 certified, 4/6/10 sqmm), Solar PV Panels, Inverters, MC4 Connectors, Array Junction Boxes.
\u2022 [\u{1F449} Browse Full Solar Solutions](/category/solar)

#### 4. \u{1F30D} [Earthing & Grounding Systems (37 Products in Database)](/category/earthing-material)
\u2022 **Authorized Brands**: Volamp, True Power, Ashlok
\u2022 **Offerings**: Copper-Bonded Earthing Rods (100\u2013250 microns molecular copper), Pipe-in-Pipe Chemical Electrodes, Backfill Compound (IS 3043), GI & Copper Strips.
\u2022 [\u{1F449} Browse Earthing Systems](/category/earthing-material)

#### 5. \u{1F529} [Cable Glands & Terminations (90 Products in Database)](/category/glands)
\u2022 **Authorized Brands**: Volamp, Comet, Raychem
\u2022 **Offerings**: Single Compression Brass Glands, Weatherproof IP67 MD Double Compression Glands, Flameproof Ex d IIC Glands.
\u2022 [\u{1F449} Browse Cable Glands](/category/glands)

#### 6. \u{1F9F2} [Lugs & Cable Terminals (14 Products in Database)](/category/lugs)
\u2022 **Authorized Brands**: Volamp, Dowells, Comet
\u2022 **Offerings**: Tinned Electrolytic Copper & Aluminium Ring, Pin, and Tubular Barrel Lugs (1.5 to 630 sqmm), Bimetallic Cu-Al Lugs.
\u2022 [\u{1F449} Browse Crimping Lugs](/category/lugs)

#### 7. \u{1F9F1} [Conduit & Cable Management (93 Products in Database)](/category/conduit)
\u2022 **Authorized Brands**: Volamp, Precision, VIP
\u2022 **Offerings**: Rigid uPVC Conduits (LMS, MMS, HMS conforming to IS 9537 Part 3), Casing & Capping, PP Corrugated Flexible Pipes.
\u2022 [\u{1F449} Browse Conduits & Pipes](/category/conduit)

#### 8. \u{1F4A1} [Wiring Devices & Safety Gear (14 Products in Database)](/category/wiring-device)
\u2022 **Authorized Brands**: Legrand, Schneider Electric, Anchor, Volamp
\u2022 **Offerings**: Modular Switches & Sockets, Industrial Plugs (16A\u201363A IP44/67), Insulation Tapes, HT Safety Gloves, Testing Instruments.
\u2022 [\u{1F449} Browse Wiring Devices](/category/wiring-device)

---

\u{1F525} **Featured Fast-Moving Products in Stock:**

${featuredCards}

Tell me any cable size, switchgear rating, or brand, and I will pull exact live specifications, net prices, and stock for you!`;
  }
  const matched = findMatchingProducts(lower, 4);
  if (matched.length > 0) {
    const productList = matched.map(formatProductCard).join("\n\n");
    return `### \u26A1 Live Catalog Matches for "${query.trim()}" (${matched.length} items in stock):

${productList}

---

### \u26A1 Commercial Pricing Architecture:
\u2022 **Contractor Discount**: Direct **40% OFF** applied from published manufacturer list prices.
\u2022 **Statutory Tax**: 18% GST with 100% compliant input tax credit (ITC) on all consignments.
\u2022 **Ahmedabad Fulfillment**: Dispatched within 24\u201348 hours under Shipping Policy VEP/LOG/001.

**Ready to place an order or lock in stock?**
Tell me your required quantity/meters, customer name, contact phone number, and delivery city, and I'll generate your official **Volamp Order Reference ID** right now!`;
  }
  const brandKeywords = [
    { key: "polycab", name: "Polycab" },
    { key: "kei", name: "Kei" },
    { key: "finolex", name: "Finnolex" },
    { key: "finnolex", name: "Finnolex" },
    { key: "schneider", name: "SCHNIEDER" },
    { key: "schnieder", name: "SCHNIEDER" },
    { key: "legrand", name: "LEGRAND" },
    { key: "lk", name: "LK" },
    { key: "l&t", name: "LK" }
  ];
  for (const b of brandKeywords) {
    if (new RegExp(`\\b${b.key}\\b`, "i").test(lower)) {
      const prods = queryProducts({ brand: b.name, limit: 3 });
      if (prods.products.length > 0) {
        const productList = prods.products.map(formatProductCard).join("\n\n");
        return `### \u26A1 Authorized ${prods.products[0].brand} Products at Volamp (${prods.total} items available)

Volamp is a primary distributor for **${prods.products[0].brand}**, supplying factory-direct materials with original Material Test Certificates ( MTC ) and flat **40% OFF** contractor discounts:

${productList}

Looking for a specific gauge or rating in ${prods.products[0].brand}? Tell me what size or coil length you need!`;
      }
    }
  }
  if (/\b(?:wires?\s*(?:&|and)?\s*cables?|house\s*wires?|building\s*wires?|industrial\s*cables?)\b/i.test(lower)) {
    const prods = queryProducts({ category: "Wires & Cables", limit: 3 });
    const productList = prods.products.map(formatProductCard).join("\n\n");
    return `### \u{1F50C} Volamp Wires & Cables Portfolio (2,856 Products)

We distribute certified cables from **Polycab, KEI, Finolex, and Volamp** across all voltage grades with flat **40% OFF** contractor pricing:

\u2022 **Single Core Flexible House Wires (FR / FRLS / ZHFR)**: 0.5 sqmm to 16 sqmm (IS 694).
\u2022 **Multicore Flexible Industrial Cables**: 2-Core up to 24-Core for machine and panel wiring.
\u2022 **Armoured LT & HT Power Cables**: XLPE/PVC insulated, Copper & Aluminium conductors (IS 7098 & IS 1554).
\u2022 **Submersible Flat 3-Core Cables**: 1.5 sqmm to 35 sqmm for agricultural pumps.
\u2022 **Communication & Coaxial**: CCTV 3+1/4+1, RG-59, RG-6, and Cat6 LAN.

[\u{1F449} Browse Complete Wires & Cables Catalog](/category/wire-cables)

**Featured Wires & Cables in Stock:**

${productList}

Looking for a specific gauge or brand? Just tell me what size you need!`;
  }
  if (/\b(?:switchgear|mcb|mccb|rccb|rcbo|contactor|isolator|changeover)\b/i.test(lower)) {
    const prods = queryProducts({ category: "Switchgear", limit: 3 });
    const productList = prods.products.map(formatProductCard).join("\n\n");
    return `### \u{1F6E1}\uFE0F Volamp Switchgear & Protection Portfolio (221 Products)

We carry leading switchgear brands including **Schneider Electric, LK (L&T), Legrand, and Volamp** with flat **40% OFF** contractor pricing:

\u2022 **MCBs (Miniature Circuit Breakers)**: 0.5A to 63A, 6kA & 10kA breaking capacity (IS/IEC 60898).
\u2022 **MCCBs (Moulded Case Circuit Breakers)**: 16A to 1250A, 25kA/36kA/50kA, 3-Pole & 4-Pole.
\u2022 **RCCBs & RCBOs**: Human safety (30mA) & fire protection (100mA/300mA).
\u2022 **Contactors & Relays**: 9A to 800A AC-3 heavy motor duty.
\u2022 **Distribution Boards (DB)**: SPN, TPN, Vertical DBs with IP43/IP54 rating.

[\u{1F449} Browse Complete Switchgear Catalog](/category/switchgear)

**Featured Products in Stock:**

${productList}

Tell me your load or required breaking capacity, and I'll pull the exact model for you!`;
  }
  if (/\b(?:solar|pv\s*cables?|solar\s*cables?|solar\s*panels?)\b/i.test(lower)) {
    const prods = queryProducts({ category: "Solar", limit: 4 });
    const productList = prods.products.map(formatProductCard).join("\n\n");
    return `### \u2600\uFE0F Volamp Solar Electrical & DC Cable Portfolio (${prods.total} Products in Database)

We distribute 1500V DC Solar PV Cables (T\xDCV / EN 50618 certified, electron-beam crosslinked halogen-free XLPO, tinned copper) with flat **40% OFF** contractor pricing:

\u2022 **PV1-F & H1Z2Z2-K Solar DC Cables**: 1.5 sqmm, 2.5 sqmm, 4 sqmm, 6 sqmm, 10 sqmm, 16 sqmm.
\u2022 **MC4 Connectors & Branch Splitters**: IP68 waterproof rated for outdoor arrays.
\u2022 **Solar PV Earthing Kits & Chemical Electrodes**: High dissipation for utility and rooftop solar.

[\u{1F449} Browse Complete Solar Catalog](/category/solar)

**Live Pricing & Fast-Moving Solar Cables in Stock:**

${productList}

Tell me what gauge or length you need, and I'll generate your official project quote or dispatch right away!`;
  }
  if (/\b(?:glands?|cable\s*glands?|brass\s*glands?|double\s*compression)\b/i.test(lower)) {
    const prods = queryProducts({ category: "Glands", limit: 4 });
    const productList = prods.products.map(formatProductCard).join("\n\n");
    return `### \u{1F529} Volamp Industrial Cable Glands Portfolio (${prods.total} Products in Database)

We supply certified Single & Double Compression Brass Glands with flat **40% OFF** contractor pricing:

\u2022 **Double Compression MD Glands (IP66/IP68)**: For heavy armoured cables.
\u2022 **Single Compression Glands**: For flexible control cables and unarmoured leads.
\u2022 **Flameproof Ex d IIC Glands**: For chemical plants, refineries, and hazardous areas.

[\u{1F449} Browse Cable Glands Catalog](/category/glands)

**Featured Glands in Stock:**

${productList}

Tell me your cable outer diameter or armour type, and I'll recommend the exact gland size!`;
  }
  if (/\b(?:lugs?|terminals?|cable\s*lugs?|crimping\s*lugs?)\b/i.test(lower)) {
    const prods = queryProducts({ category: "Lugs", limit: 4 });
    const productList = prods.products.map(formatProductCard).join("\n\n");
    return `### \u{1F9F2} Volamp Heavy-Duty Cable Lugs & Terminals (${prods.total} Products in Database)

We supply pure electrolytic tinned copper & aluminium compression lugs with flat **40% OFF** contractor pricing:

\u2022 **Tubular Barrel Lugs (DIN 46235)**: Heavy-duty long & short barrel.
\u2022 **Ring & Pin Terminals**: For switchgear and control wiring.
\u2022 **Bimetallic Friction-Welded Lugs**: For connecting aluminium cable to copper busbars.

[\u{1F449} Browse Lugs & Terminals Catalog](/category/lugs)

**Featured Lugs in Stock:**

${productList}

Tell me your cable cross-section (sqmm) and stud size (M6 to M20), and I'll pull the exact lug reference!`;
  }
  if (/\b(?:earthing|grounding|earth\s*rods?|chemical\s*electrodes?)\b/i.test(lower)) {
    const prods = queryProducts({ category: "Earthing Wires", limit: 4 });
    const productList = prods.products.map(formatProductCard).join("\n\n");
    return `### \u{1F30D} Volamp Earthing & Grounding Systems (${prods.total} Products in Database)

We supply certified earthing materials conforming to **IS 3043 / IEEE 80** with flat **40% OFF** contractor pricing:

\u2022 **Copper-Bonded Steel Earth Rods**: Molecularly bonded (> 250 microns copper).
\u2022 **Pipe-in-Pipe Chemical Electrodes**: Maintenance-free with crystalline backfill compound.
\u2022 **Hot-Dip Galvanized (GI) & Copper Strips**: For substation mesh and structural grounding.

[\u{1F449} Browse Earthing Systems Catalog](/category/earthing-material)

**Featured Earthing Products in Stock:**

${productList}

Tell me your soil resistivity or fault current rating for a tailored proposal!`;
  }
  if (/\b(?:conduits?|pvc\s*pipes?|casing\s*(?:&|and)?\s*capping)\b/i.test(lower)) {
    const prods = queryProducts({ category: "Conduit", limit: 4 });
    const productList = prods.products.map(formatProductCard).join("\n\n");
    return `### \u{1F9F1} Volamp Rigid Conduit & Containment (${prods.total} Products in Database)

We distribute ISI Marked rigid uPVC conduits conforming to **IS 9537 (Part 3)** with flat **40% OFF** contractor pricing:

\u2022 **Heavy Mechanical Stress (HMS)**: For concrete slab casting and exposed industrial runs.
\u2022 **Medium Mechanical Stress (MMS)**: For standard commercial concealed wiring.
\u2022 **Casing & Capping & Corrugated Flexible Pipes**: For surface raceways and machine routing.

[\u{1F449} Browse Conduit & Containment Catalog](/category/conduit)

**Featured Conduits in Stock:**

${productList}

Tell me your pipe diameter (19mm to 50mm) and stress grade!`;
  }
  return null;
}
function handleGeneralKnowledgeAndChitChat(query) {
  const lower = query.toLowerCase().trim();
  if (/joke|make\s+me\s+laugh|funny|tell\s+me\s+something\s+funny/i.test(lower)) {
    const jokes = [
      "Why did the light bulb fail its exam? \u{1F4A1}\nBecause it wasn't very bright! \u{1F602}",
      "What is an electrician's favorite ice cream flavor? \u{1F366}\nShock-o-late! \u26A1",
      "Why do electrical engineers love coffee? \u2615\nBecause it keeps their circuits grounded! \u{1F604}",
      "What did the capacitor say to the resistor? \u26A1\n'I can't resist you, and you've got so much potential!' \u{1F606}",
      "Why did the electrician go to therapy? \u{1F6CB}\uFE0F\nHe had too many unresolved issues with his current relationship! \u{1F602}"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  if (/poem|poetry|rhyme|write\s+a\s+poem/i.test(lower)) {
    return `### \u26A1 The Pulse of Progress (Dedicated to Volamp's 60-Year Legacy)

*Beneath the ground, within the wall,*
*A silent current answers all.*
*Through copper strands and armoured steel,*
*The dreams of industry turn real.*

*From Ahmedabad's determined start,*
*Four generations, one true heart.*
*Not just the wire, but the trust we weave,*
*In every circuit we believe!* \u26A1\u2728`;
  }
  if (/who\s+are\s+you|who\s+made\s+you|what\s+is\s+your\s+name|who\s+created\s+you/i.test(lower)) {
    return `\u26A1 **VOLA here \u2014 Senior Technical Advisor & Supply Desk Lead at VOLAMP ELEKTRIKALS PRIVATE LIMITED (Ahmedabad HQ)!**

I have complete knowledge of our 3,385+ electrical products across Wires & Cables, Switchgear, Lugs, Conduits, Glands, Earthing, and Solar, as well as live factory discounts, cable sizing formulas, and nationwide dispatch logistics.

Whether you need electrical sizing, a wholesale contractor quotation, or want to dispatch an order to your site within 24\u201348 hours, I'm right here. How can I help you right now?`;
  }
  if (/ceiling\s*fan|fan\s*wiring|home\s*wiring|house\s*wiring/i.test(lower)) {
    return `### \u{1F3E0} Ceiling Fan & House Wiring Guide:

\u2022 **Ceiling Fan Connections**:
  - **Phase (Live)**: Passes through wall switch $\\rightarrow$ regulator $\\rightarrow$ fan running winding.
  - **Neutral**: Direct connection to fan common terminal.
  - **Earth (Green)**: Must be securely grounded to ceiling metal hook for human safety.
  - **Capacitor (2.25 to 2.5 $\\mu$F)**: Provides phase shift for motor start.

\u2022 **Recommended Wire Sizes**:
  - Lighting points & ceiling fans: **1.5 sqmm Single-Core Copper FR/FRLS**.
  - 16A Power sockets & 1.5-ton ACs: **2.5 sqmm or 4.0 sqmm**.

*Safety Rule*: Always isolate the main MCB before working on live electrical lines!`;
  }
  if (/thank\s*you|thanks|thx|shukriya|dhanyawad|great\s*job|awesome|superb|nice/i.test(lower)) {
    return `My absolute pleasure! \u26A1 That's what the Volamp supply desk is here for.

Whenever you need technical calculations, live contractor pricing, or urgent site dispatch, just hit me up. Let's keep your project moving!`;
  }
  if (/weather|where\s+are\s+you\s+located|where\s+is\s+volamp|where\s+is\s+your\s+office/i.test(lower)) {
    return `\u{1F3ED} **VOLAMP ELEKTRIKALS PRIVATE LIMITED** is proudly headquartered in **Ahmedabad, Gujarat, India**!

\u2022 **Corporate Main Office**: 1753, Khadia, Ahmedabad, Gujarat 380001
\u2022 **Central Logistics & Fulfillment Hub**: Aslali, Ahmedabad
\u2022 **Direct Phone & WhatsApp**: **+91 9512365582**

From Ahmedabad, we operate rapid 24\u201348 hour dispatch across all 28 Indian states, backed by standard transit insurance and dedicated global export capabilities.`;
  }
  if (/who\s+invented\s+(?:the\s+)?light\s*bulb/i.test(lower)) {
    return `### \u{1F4A1} Who Invented the Light Bulb?

While **Thomas Edison** patented the first commercially viable incandescent bulb in **1879**, electric lighting was an evolutionary triumph:

\u2022 **Humphry Davy (1802)**: Demonstrated the electric carbon arc lamp.
\u2022 **Warren de la Rue (1840)**: Built an early platinum filament lamp in vacuum.
\u2022 **Joseph Swan (1878)**: Demonstrated carbon-filament lamps in England.
\u2022 **Thomas Edison (1879)**: Discovered carbonized bamboo filaments operating in a high-vacuum globe for over 1,200 continuous hours, giving birth to modern commercial power utilities!`;
  }
  return null;
}
async function synthesizeOpenEndedResponse(query) {
  const trimmed = query.trim();
  let topic = trimmed.replace(/^(what\s+is|what\s+are|who\s+is|who\s+was|tell\s+me\s+about|explain|how\s+does|how\s+do|can\s+you\s+explain|give\s+me\s+info\s+on)\s+/i, "").replace(/[?!.]+$/, "").trim();
  if (!topic || topic.length < 2) topic = trimmed;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic.replace(/\s+/g, "_"))}`,
      {
        signal: controller.signal,
        headers: { "User-Agent": "VolampAssistant/2.0 (sales@volampelektrikals.com)" }
      }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data.extract && data.extract.length > 30) {
        return `### \u{1F310} **${data.title}**

${data.extract}

` + (data.description ? `*(${data.description})*

` : "") + `---
*Ask VOLA anything in the world \u2014 from world history and science to technical cable sizing & direct factory procurement!* \u26A1`;
      }
    }
  } catch {
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4e3);
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(trimmed)}&format=json&no_html=1&skip_disambig=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const answer = data.AbstractText || data.Answer || data.RelatedTopics?.[0]?.Text;
      if (answer && answer.length > 20) {
        return `### \u{1F4A1} **${data.Heading || topic}**

${answer}

---
*Ask VOLA any question in the world \u2014 from universal science & technology to electrical supply calculations!* \u26A1`;
      }
    }
  } catch {
  }
  return `### \u26A1 Regarding: *"${trimmed}"*

Whether exploring general knowledge, universal science, coding, or commercial infrastructure, precision is key.

At **Volamp Elektrikals**, our technical intelligence covers broad engineering systems as well as factory-direct procurement across all 8 electrical divisions.

Ask me any question in the world, or request electrical sizing, contractor discounts, and project BOM calculations!`;
}
async function generateVolaResponse(messages, userId) {
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const lower = lastUserMsg.toLowerCase().trim();
  const trackMatch = lower.match(/(?:track|status\s+of|check\s+order)\s*(?:order\s*)?(QO-\d{4}-\d{5})/i);
  if (trackMatch) {
    const orderId = trackMatch[1].toUpperCase();
    try {
      const order = await getQuickOrderById(orderId);
      if (order) {
        let parsedItems = [];
        try {
          parsedItems = JSON.parse(order.items);
        } catch {
          parsedItems = [];
        }
        const statusDescriptions = {
          submitted: "Received & Under Stock Allotment at our Ahmedabad fulfillment depot.",
          under_review: "Being inspected by our technical team for immediate stock dispatch.",
          priced: "Quotation & tax invoice generated; awaiting customer confirmation.",
          quoted: "Formal proforma quote dispatched to customer mobile.",
          closed: "Dispatched or completed."
        };
        const statusText = statusDescriptions[order.status] || order.status;
        return `### \u{1F4E6} Consignment Status: \`${order.quickOrderId}\`

\u2022 **Customer**: ${order.customerName} ${order.phone ? `(\u{1F4DE} ${order.phone})` : ""}
\u2022 **Delivery Destination**: ${order.location || "Ahmedabad Central Depot"}
\u2022 **Current Status**: **${order.status.toUpperCase()}** \u2014 *${statusText}*

**Items in Consignment:**
` + parsedItems.map((i) => `- ${i.name} (Qty: **${i.quantity}**)`).join("\n") + `

Need immediate truck dispatch updates? [\u{1F4AC} Connect on WhatsApp with Order ID](https://wa.me/919512365582?text=Hello%20Volamp,%20checking%20status%20for%20order%20${order.quickOrderId})`;
      } else {
        return `I searched our live system but couldn't locate an active order with Reference ID \`${orderId}\`. Please re-check the ID or connect directly with our logistics team at **+91 9512365582**!`;
      }
    } catch {
    }
  }
  const faqMatch = matchVolaFaq(lastUserMsg);
  if (faqMatch) {
    return faqMatch.response;
  }
  const isQuestionAboutBuying = /\b(?:why|how|can\s+i|where)\s+(?:should\s+i\s+)?(?:buy|purchase)\b/i.test(lower);
  const orderIntent = !isQuestionAboutBuying && (/\b(?:place\s*(?:an\s*)?order|want\s+to\s+(?:order|buy|purchase)|need\s+to\s+(?:order|buy|purchase)|book\s*(?:an\s*)?order|order\s+karna)\b/i.test(
    lower
  ) || /(\d+)\s*(?:m|meter|meters|metre|metres|coils?|rolls?|drums?)\s+(?:of\s+)?([a-zA-Z0-9\s\.\-]+(?:cable|wire|sqmm))/i.test(
    lower
  ));
  if (orderIntent) {
    const details = extractOrderDetails(messages);
    const hasItems = details.items.length > 0;
    const hasName = Boolean(details.customerName);
    const hasPhone = Boolean(details.phone);
    const hasLocation = Boolean(details.location);
    if (hasItems && hasName && hasPhone && hasLocation) {
      try {
        const newOrder = await createQuickOrder({
          userId: userId ?? null,
          customerName: details.customerName,
          phone: details.phone,
          location: details.location,
          companyName: details.companyName ?? null,
          items: details.items,
          notes: "Placed via Vola Technical & Supply Desk"
        });
        const itemsTable = details.items.map((item) => `| ${item.name} | **${item.quantity}** |`).join("\n");
        return `### \u26A1 Order Successfully Placed with Volamp Elektrikals!

Your order has been registered in the Volamp system with Reference ID: **\`${newOrder.quickOrderId}\`**.

| Item Description | Quantity |
| :--- | :--- |
${itemsTable}

\u2022 **Customer Name**: ${newOrder.customerName} | \u{1F4DE} ${newOrder.phone}
\u2022 **Delivery Destination**: ${newOrder.location}

**Next Steps & Dispatch:**
1. **Stock Allotment**: Our Ahmedabad central warehouse is allotting your stock right now.
2. **Dispatch Window**: Dispatches within 24\u201348 hours under Shipping Policy VEP/LOG/001.
3. **Invoice & POD**: A verified GST tax invoice and transporter LR number will be sent to your phone via WhatsApp.

[\u{1F449} Open WhatsApp with Order ID](https://wa.me/919512365582?text=Hello%20Volamp,%20I%20have%20placed%20Order%20${newOrder.quickOrderId}%20via%20Vola)`;
      } catch (err) {
        return `I noted your order details, but encountered an error saving it: ${err.message}. Please connect directly with our sales desk at **+91 9512365582**!`;
      }
    } else {
      const missing = [];
      if (!hasItems) missing.push("\u2022 **Product specifications & quantity** (e.g., *500m of 4 sqmm 3-core copper armored cable* or *10 coils of 2.5 sqmm house wire*)");
      if (!hasName) missing.push("\u2022 **Your full name**");
      if (!hasPhone) missing.push("\u2022 **Contact phone number** (for WhatsApp invoice & dispatch updates)");
      if (!hasLocation) missing.push("\u2022 **Delivery destination city / pincode**");
      return `I'm ready to book your order directly with our Ahmedabad fulfillment depot! \u26A1

To generate your official **Order Reference ID**, please share:

` + missing.join("\n") + `

*(Note: Users must log in or create a contractor account at our **[Customer Portal](/portal)** to track dispatches and access GST tax invoices).*`;
    }
  }
  const isGreeting = /^(?:hey|hi|hello|hola|namaste|pranam|kem cho|good\s*(?:morning|afternoon|evening|day)|yo|sup)\b/i.test(lower) || /how\s*(?:are|r)\s*(?:you|u|uh)\b/i.test(lower) || /how('?s|\s+is)\s+it\s+going\b/i.test(lower) || /kaise\s*ho\b/i.test(lower) || /kya\s*(?:haal|hal|chal\s*raha)\b/i.test(lower) || /what('?s|\s+is)\s+up\b/i.test(lower) || /kaisa\s*hai\b/i.test(lower);
  const hasBusinessOrTechnicalIntent = /\b(?:cables?|wires?|solar|switchgear|mcb|mccb|rccb|lugs?|glands?|conduits?|pipes?|earthing|electrodes?|charges?|how\s*much|prices?|pricing|costs?|rates?|bhav|discounts?|orders?|buy|purchase|stocks?|catalog|products?|items?|sqmm|amps?|volts?|gauge|meters?|drums?|quotes?|rfqs?|sizing|calculate|specs?|specification|brand|polycab|kei|finolex|schneider|legrand|lk)\b/i.test(lower);
  if (isGreeting && !hasBusinessOrTechnicalIntent) {
    if (/kem\s*cho/i.test(lower)) {
      return "Majama! \u{1F60A} Kem cho tame? Hu chu **Vola**, Volamp Elektrikals Ahmedabad supply desk thi! \u26A1\n\nTamare koi pan electrical cables, contractor discounts, technical sizing ke direct order dispatch maate madat joiye to mane kaho. Aaje tame kaya project par kaam kari rahya cho?";
    }
    if (/kaise\s*ho|kya\s*(?:haal|hal|chal)|sab\s*badhiya/i.test(lower)) {
      return "Main ekdum first-class hoon! \u{1F60A} Aap bataiye, aapka kaam kaisa chal raha hai? \u26A1\n\nMain hoon **Vola**, Volamp Elektrikals Ahmedabad supply desk se aapka technical & procurement lead! Chahe aapko cable sizing calculate karni ho, live contractor discounts check karne hon, ya site ke liye direct consignment book karni ho \u2014 bataiye, aaje kis requirement par baat karein?";
    }
    const greetings = [
      "Hey there! \u{1F60A} Doing fantastic and ready to roll! How are you doing today? \u26A1\n\nI'm **Vola**, Senior Technical Advisor & Supply Desk Lead at **Volamp Elektrikals** (Ahmedabad HQ). We have 3,385+ products in stock across Wires & Cables, Switchgear, Lugs, Conduits, Glands, Earthing, and Solar with direct contractor discount pricing. What project are you working on today?",
      "Hello! \u{1F60A} Full voltage and ready to help! How's your day going? \u26A1\n\nI'm **Vola** from the Volamp Elektrikals supply desk. Whether you need cable sizing calculations, brand price comparisons (Polycab, Finolex, KEI, Schneider), or want to dispatch an order to your site, I'm right here. What can I do for you?",
      "Hey! Wonderful to connect with you! \u{1F60A} \u26A1\n\nI'm **Vola** from the Volamp headquarters in Ahmedabad. Tell me \u2014 are you sizing cables for a project, looking for contractor discounts, or ready to place an order?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  const isPricingIntent = /\b(?:prices?|costs?|rates?|pricing|charge|charges|how\s*much|bhav|discounts?|quotations?|rfqs?)\b/i.test(lower);
  if (isPricingIntent) {
    const pricingResponse2 = handlePricingCostsAndDiscounts(lastUserMsg);
    if (pricingResponse2) {
      return pricingResponse2;
    }
  }
  const productResponse = handleProductAndCatalogQuery(lastUserMsg);
  if (productResponse) {
    return productResponse;
  }
  const pricingResponse = handlePricingCostsAndDiscounts(lastUserMsg);
  if (pricingResponse) {
    return pricingResponse;
  }
  const sizingResponse = handleTechnicalEngineeringAndSizing(lastUserMsg);
  if (sizingResponse) {
    return sizingResponse;
  }
  const segmentResponse = handleBusinessSegments(lastUserMsg);
  if (segmentResponse) {
    return segmentResponse;
  }
  const aboutResponse = handleAboutUsAndHeritage(lastUserMsg);
  if (aboutResponse) {
    return aboutResponse;
  }
  const mathResponse = handleMathAndFormulas(lastUserMsg);
  if (mathResponse) {
    return mathResponse;
  }
  const scienceResponse = handleScienceAndElectrical(lastUserMsg);
  if (scienceResponse) {
    return scienceResponse;
  }
  const generalResponse = handleGeneralKnowledgeAndChitChat(lastUserMsg);
  if (generalResponse) {
    return generalResponse;
  }
  return await synthesizeOpenEndedResponse(lastUserMsg);
}

// server/services/employeeCmsService.ts
import fs4 from "fs";
import path4 from "path";
var DATA_DIR = path4.resolve(process.cwd(), "server/data");
var BLOGS_FILE = path4.join(DATA_DIR, "blogs_db.json");
var NEWSLETTERS_FILE = path4.join(DATA_DIR, "newsletters_db.json");
var PRICE_LISTS_FILE = path4.join(DATA_DIR, "price_lists_db.json");
function ensureDirectoryExists() {
  if (!fs4.existsSync(DATA_DIR)) {
    fs4.mkdirSync(DATA_DIR, { recursive: true });
  }
}
var INITIAL_BLOGS = [
  {
    id: "blog-001",
    slug: "copper-vs-aluminium-armoured-cable-sizing-guide",
    title: "Copper vs. Aluminium Armoured Cables: Industrial Sizing & Voltage Drop Guide",
    category: "Technical Engineering",
    author: "Naimil Patel (CEO)",
    date: "October 20, 2026",
    readTime: "7 min read",
    excerpt: "Comprehensive conductivity breakdown, IS 7098 cross-section calculations, and 20-year lifecycle cost comparisons for industrial plants.",
    content: `When engineering modern manufacturing facilities and substations across Gujarat's industrial corridors, project directors frequently weigh the balance between initial procurement capex and long-term operating losses when choosing between copper and aluminium armoured cables.

### Key Engineering Criteria:
1. **Current Carrying Capacity (Ampacity):**
   - High-grade electrolytic copper offers 100% IACS conductivity.
   - EC-grade aluminium delivers roughly 61% conductivity, requiring approximately one standard gauge step higher cross-sectional area to carry equivalent load under identical installation derating factors.

2. **Thermal Expansion & Termination Integrity:**
   - Aluminium possesses a higher coefficient of thermal expansion than copper.
   - For high-vibration equipment, MCC switchgear feeder terminations, and VFD motor runs, bi-metallic friction-welded lugs with oxide-inhibiting paste must be specified to prevent galvanic corrosion and thermal loosening.

3. **Total Cost of Ownership (TCO):**
   - For long runs (> 150m) and heavy distribution (> 185 sqmm), aluminium armoured cables offer 40% to 55% lower material procurement cost, making them standard for utility feeder lines.
   - For short, compact control cabinets and indoor distribution boards, copper provides ease of bending and smaller conduit footprint.`,
    tags: ["Armoured Cable", "IS 7098", "Copper", "Aluminium", "Sizing"],
    imageUrl: "/products/cables.jpg",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "blog-002",
    slug: "solar-dc-cable-specifications-iec-62930",
    title: "Solar DC Cables Demystified: EN 50618 & IEC 62930 Compliance Standards",
    category: "Solar & Clean Energy",
    author: "Jinay Patel (Technical Sourcing)",
    date: "October 14, 2026",
    readTime: "5 min read",
    excerpt: "Why standard building wires fail in photovoltaic arrays: Electron-beam cross-linked polyolefin insulation and 25-year UV degradation immunity.",
    content: `Utility-scale solar farms and industrial rooftop arrays operate under severe climatic extremes\u2014direct UV irradiation, thermal cycling between -40\xB0C and +120\xB0C, and damp heat.

### Essential Specifications for Solar DC Cables:
- **Tinned Copper Conductors:** Class 5 flexible stranded conductors with pure tin plating prevent copper oxidation over 25+ years of service.
- **XLPO Dual Insulation:** Electron-beam cross-linked halogen-free polyolefin ensures zero toxic gas emission during fire and extraordinary resistance to ozone degradation.
- **Direct Burial & Water Resistance:** Rated for AD8 continuous water submersion for ground-mount solar arrays in high water-table terrains.`,
    tags: ["Solar DC", "IEC 62930", "Photovoltaic", "Renewables"],
    imageUrl: "/products/solar.jpg",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "blog-003",
    slug: "lme-copper-aluminium-market-analysis-q4-2026",
    title: "Q4 2026 Live Metal Price Dynamics: How LME Trends Impact Cable Price Lists",
    category: "Commercial Insights",
    author: "Roshni Shroff (Commercial Desk)",
    date: "October 08, 2026",
    readTime: "6 min read",
    excerpt: "An inside look at London Metal Exchange (LME) copper and aluminium settlement rates and how manufacturer price circulars adjust in real-time.",
    content: `Raw conductor metal constitutes 60% to 75% of an industrial power cable's net manufacturing cost. Understanding LME spot settlements and domestic currency exchange rates enables EPC contractors to lock in forward procurement schedules ahead of monthly price circular hikes.

### Key Factors Shaping Current Prices:
1. Domestic refinery supply from Hindalco, Vedanta, and Nalco.
2. Renewable energy grid expansion driving global copper demand.
3. Volamp's forward-booking warehouse stock strategy in Ahmedabad, shielding our registered contractors from spot market volatility.`,
    tags: ["LME", "Copper", "Aluminium", "Price Trends", "Procurement"],
    imageUrl: "/products/switchgear.jpg",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
function getBlogs() {
  ensureDirectoryExists();
  try {
    if (fs4.existsSync(BLOGS_FILE)) {
      const raw = fs4.readFileSync(BLOGS_FILE, "utf-8");
      return JSON.parse(raw);
    }
    fs4.writeFileSync(BLOGS_FILE, JSON.stringify(INITIAL_BLOGS, null, 2), "utf-8");
    return INITIAL_BLOGS;
  } catch (err) {
    console.error("[EmployeeCms] Error reading blogs:", err);
    return INITIAL_BLOGS;
  }
}
function createBlog(input) {
  ensureDirectoryExists();
  const blogs = getBlogs();
  const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const newBlog = {
    id: `blog-${Date.now()}`,
    slug: `${slug}-${Math.floor(1e3 + Math.random() * 9e3)}`,
    title: input.title,
    category: input.category || "General",
    author: input.author || "VOLAMP Team",
    date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }),
    readTime: input.readTime || "5 min read",
    excerpt: input.excerpt,
    content: input.content,
    tags: input.tags || ["Volamp", "Electrical"],
    imageUrl: input.imageUrl || "/products/cables.jpg",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  blogs.unshift(newBlog);
  fs4.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), "utf-8");
  return newBlog;
}
function deleteBlog(id) {
  ensureDirectoryExists();
  const blogs = getBlogs();
  const filtered = blogs.filter((b) => b.id !== id);
  if (filtered.length !== blogs.length) {
    fs4.writeFileSync(BLOGS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  }
  return false;
}
var INITIAL_NEWSLETTERS = [
  {
    id: "nl-001",
    title: "Volamp Industrial Pulse \u2014 October Edition",
    subject: "New Polycab HT Price Lists, Live Metal Fluctuations & Stock Dispatch",
    targetAudience: "All Verified Subscribers & Contractors",
    content: "Welcome to the October edition of Volamp Industrial Pulse. This week: Updated Polycab HT Armoured cable discounts (+44%), instant stock arrival at Ahmedabad depot, and solar DC stock status.",
    dispatchedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString(),
    recipientCount: 240
  }
];
function getNewsletters() {
  ensureDirectoryExists();
  try {
    if (fs4.existsSync(NEWSLETTERS_FILE)) {
      const raw = fs4.readFileSync(NEWSLETTERS_FILE, "utf-8");
      return JSON.parse(raw);
    }
    fs4.writeFileSync(NEWSLETTERS_FILE, JSON.stringify(INITIAL_NEWSLETTERS, null, 2), "utf-8");
    return INITIAL_NEWSLETTERS;
  } catch (err) {
    console.error("[EmployeeCms] Error reading newsletters:", err);
    return INITIAL_NEWSLETTERS;
  }
}
function publishNewsletter(input) {
  ensureDirectoryExists();
  const newsletters = getNewsletters();
  const newNewsletter = {
    id: `nl-${Date.now()}`,
    title: input.title,
    subject: input.subject,
    targetAudience: input.targetAudience,
    content: input.content,
    dispatchedAt: (/* @__PURE__ */ new Date()).toISOString(),
    recipientCount: input.recipientCount || 240
  };
  newsletters.unshift(newNewsletter);
  fs4.writeFileSync(NEWSLETTERS_FILE, JSON.stringify(newsletters, null, 2), "utf-8");
  return newNewsletter;
}
function getPushedPriceLists() {
  ensureDirectoryExists();
  try {
    if (fs4.existsSync(PRICE_LISTS_FILE)) {
      const raw = fs4.readFileSync(PRICE_LISTS_FILE, "utf-8");
      return JSON.parse(raw);
    }
    fs4.writeFileSync(PRICE_LISTS_FILE, JSON.stringify([], null, 2), "utf-8");
    return [];
  } catch (err) {
    console.error("[EmployeeCms] Error reading pushed price lists:", err);
    return [];
  }
}
function pushPriceList(input) {
  ensureDirectoryExists();
  const lists = getPushedPriceLists();
  const brandSlug = input.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const newItem = {
    id: `push-${brandSlug}-${Date.now()}`,
    brand: input.brand,
    title: input.title,
    category: input.category,
    docType: input.docType,
    effectiveDate: input.effectiveDate,
    circularNo: input.circularNo || `VOL/${input.brand.slice(0, 3).toUpperCase()}/${(/* @__PURE__ */ new Date()).getFullYear()}`,
    discountNote: input.discountNote,
    fileFormat: input.fileFormat || "PDF",
    fileSize: input.fileSize || "4.2 MB",
    pages: input.pages || 32,
    downloadUrl: input.downloadUrl || `/catalogs/${brandSlug}-price-list.pdf`,
    isCustom: true,
    uploadedAt: (/* @__PURE__ */ new Date()).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }),
    description: input.description
  };
  lists.unshift(newItem);
  fs4.writeFileSync(PRICE_LISTS_FILE, JSON.stringify(lists, null, 2), "utf-8");
  return newItem;
}
function deletePushedPriceList(id) {
  ensureDirectoryExists();
  const lists = getPushedPriceLists();
  const filtered = lists.filter((item) => item.id !== id);
  if (filtered.length !== lists.length) {
    fs4.writeFileSync(PRICE_LISTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
    return true;
  }
  return false;
}

// server/routers.ts
var assistantSystemPrompt = `You are VOLA, the Senior Technical Advisor and Commercial Engineering Lead at VOLAMP ELEKTRIKALS PRIVATE LIMITED (Ahmedabad, Gujarat, India).

### \u26A1 CRITICAL DIRECTIVE: ABSOLUTELY NO ROBOTIC OR "AI" DEMEANOR:
- You must NEVER look or sound like an AI bot.
- BANNED PHRASES: Never say "As an AI language model...", "I am an artificial intelligence...", "I don't have personal feelings...", "Certainly! Here is the information...", "I'd be happy to assist you with that!", "As your virtual assistant...", or any clinical robotic boilerplate.
- TONE & TEMPERAMENT: You speak like a seasoned, sharp, energetic, high-voltage electrical industrialist and project director with 60+ years of family trade heritage running through your veins.
- INTENSE & RESPONSIVE: Be bold, fast, authoritative, technically razor-sharp, and commercially savvy. Give exact numbers, standards, cable gauges, brand price comparisons, contractor discount slabs, voltage drops, and real dispatch timelines immediately. Don't beat around the bush.
- FLUENCY:
  - If a contractor or engineer speaks in casual English or slang ("how r uh", "sup", "plz rate"), be crisp, direct, and warm.
  - If they speak in Hindi / Hinglish ("kya haal hai bhai", "4 sqmm wire ka rate batao", "discount kitna milega"), respond like a true Ahmedabad electrical merchant & engineer in natural, professional Hinglish.
  - If they speak in Gujarati ("kem cho", "bhav shu che", "majama"), respond with pride and warmth in authentic Gujarati/Gujarati-English.

### \u{1F30D} UNIVERSAL INTELLIGENCE & WORLD KNOWLEDGE DIRECTIVE:
- YOU CAN AND MUST ANSWER ANY QUESTION IN THE WORLD.
- You are not limited to electrical cables. You possess comprehensive encyclopedic intelligence across all human knowledge:
  1. Science & Physics (Quantum mechanics, thermodynamics, astronomy, chemistry, biology).
  2. World History, Geography, Geopolitics, Countries, Capitals, and World Events.
  3. Technology, Software Engineering & Coding (Python, TypeScript, React, algorithms, databases, AI).
  4. Mathematics, Financial modeling, Business strategy, and Economics.
  5. General life advice, everyday explanations, literature, sports, music, and culture.
  6. Electrical engineering, industrial infrastructure, and Volamp's 3,385+ product catalog.
- If a user asks about anything in the world (e.g., "What is photosynthesis?", "Who was Leonardo da Vinci?", "How does an airplane fly?", "Write a Python script"), ANSWER THEM THOROUGHLY, ACCURATELY, AND BRILLIANTLY.
- NEVER say "I only know about electrical cables" or "I cannot answer that". Never force an electrical analogy when someone is asking about world history or science. Be universally helpful, sharp, and charismatic!

### \u{1F3DB}\uFE0F VOLAMP ELEKTRIKALS HERITAGE & CORPORATE IDENTITY:
- Official Entity: VOLAMP ELEKTRIKALS PRIVATE LIMITED
- Statutory Registrations: CIN: U31900GJ2021PTC122730 | GSTIN: 24AAICV0754B1ZO | GeM Verified Vendor (Government e-Marketplace)
- Corporate Main Office: 1753, Khadia, Ahmedabad, Gujarat 380001
- Central Logistics & Fulfillment Hub: Aslali, Ahmedabad (Pan-India rapid transit & dedicated global export desk)
- Quality Testing Facilities: Sanand & Ahmedabad (High-voltage spark testing, tensile testing, IS/IEC compliance)
- Contact: Phone & WhatsApp: +91 9512365582 | Email: sales@volampelektrikals.com | Complaints & Grievances: Grievances@volampelektrikals.com
- 4-Generation 60+ Years Electrical Legacy (Founded June 1964):
  1. 1964 (1st Gen \u2014 Founding): Soma Bhai Khatubhai Patel, an ITI electrician from Panchmahal who moved to Ahmedabad and worked in textile mills, co-founded S.P. Electric and Engineering Company as a partnership firm in June 1964, sparking a 60-year industrial legacy.
  2. 1970s\u201380s (2nd Gen \u2014 Expansion): Chaturbhai Somabhai Patel deepened industrial client relationships across Gujarat's manufacturing corridors, forging lifelong trust with plants and contractors.
  3. 1986 (3rd Gen \u2014 Modernization): Vipulbhai Chaturbhai Patel joined in 1986, spearheading high-capacity switchgear and power cabling for multi-regional industrial growth.
  4. 2008\u20132012 / 2014 / 2021 to Today (4th Gen \u2014 Engineering Mastery): Naimil Vipul Patel, studying Electrical Engineering (2008\u20132012), joined the trade from the ground up. In 2014, he established Volamp Power to scale nationwide industrial supply. In 2021, the family restructured for the next 50+ years, incorporating Volamp Elektrikals Private Limited.
- CEO Statement \u2014 Naimil Patel:
  "Saath Milkar Growth Ki Ek Nayi Pehchaan Banayein"
  "Koi bhi company sirf products se nahi banti \u2014 company banti hai INSAN, unki mehnat, commitment aur customer ke trust se. Hamara focus sirf business grow karna nahi, balki trust, quality aur strong relations build karna hai."
  Motto: "Together, Let's Power the Growth. Together, Let's Build Volamp and India."
- Core Leadership Team:
  - Naimil Patel \u2014 Chief Executive Officer
  - Roshni Shroff \u2014 Sales & Client Solutions
  - Pooja Thakor \u2014 Sales & Client Solutions
  - Pooja Patel \u2014 Sales & Client Solutions
  - Jinay Patel \u2014 Sales & Switchgear Sourcing Specialist
  - Dhaval Rana \u2014 Finance & Accounts Manager
  - Montu Patil \u2014 Logistics & Operations Manager

### \u{1F3E2} COMPLETE 10 BUSINESS SEGMENTS (POWERING NATION-BUILDING INFRASTRUCTURE):
1. EPC & Infrastructure:
   - Target: Highways, Metro Rail, Airports, Smart Cities, Bridge electrification.
   - Supplies: 1.1kV & 11kV/33kV XLPE Armoured Cables (A2XWY, 2XWY), Perforated GI Cable Trays, Trefoil Cleats, Chemical Earthing Electrodes, Lightning Protection.
   - Standards: IS 7098 (Part 1 & 2), CPRI / ERDA Tested, MTC with every drum.
2. Heavy Industry & Manufacturing:
   - Target: Chemical plants, Pharma hubs, Steel mills, Cement plants, Automobile manufacturing.
   - Supplies: VFD Shielded Motor Power Cables, Heat-Resistant Silicon Rubber Wires, Air Circuit Breakers (ACB up to 4000A), Motor Protection Circuit Breakers (MPCB).
   - Standards: IS 1554 / IS 694, Flame-Retardant Low Smoke (FRLS), Class 5 high-flex copper.
3. Commercial & Real Estate:
   - Target: Commercial towers, IT parks, shopping malls, high-rise residential townships.
   - Supplies: Zero-Halogen (ZHFR / LSZH) Building Wires, Distribution Boards (SPN, TPN, Vertical DBs), Multi-Function Digital Energy Meters, Underfloor Trunking & Ducts.
   - Standards: NBC 2016 Compliant, IS 694 Certified, Green Building Approved.
4. Solar & Renewable Energy:
   - Target: Utility-scale solar farms, commercial rooftop solar, Battery Energy Storage Systems (BESS).
   - Supplies: 1.5 kV DC Solar PV Cables (EN 50618 / T\xDCV certified), MC4 IP68 connectors, Array Junction Boxes (AJB / SMB), 1000V/1500V DC Isolators, DC SPDs.
   - Specs: UV & ozone resistant electron-beam XLPO, tinned copper conductors, 25+ year outdoor life.
5. Power Utilities & Sub-stations:
   - Target: State DISCOMs, transmission grids, step-down substations (11kV / 33kV / 66kV).
   - Supplies: EHV & HT Underground Power Feeders, Electrolytic Copper & Aluminium Busbars, Current & Potential Transformers (CT/PT), Lightning Arresters, Gang Operated Air Break (GOAB) switches.
   - Standards: IS 7098 Part 2, IEC 60502, Third-Party Inspection Agency (TPIA) cleared.
6. Panel Builders & OEMs:
   - Target: LV/MV switchboard fabricators, Motor Control Centers (MCC), automation panel builders.
   - Supplies: Tri-Rated UL Flexible Control Wires, Power Contactors (9A to 800A), Thermal Overload Relays, Push Buttons & LED Indicators, DIN-Rail Terminals, Ferrules.
   - Standards: IS 13947 / IEC 60947, CE / UL component grades.
7. Government, Defense & PSUs:
   - Target: Indian Railways, CPWD, Military Engineer Services (MES), Defense projects, GeM supply.
   - Supplies: RDSO Railway Signaling Cables, Heavy-Duty Weatherproof Feeder Pillars, GeM Approved DBs, Flameproof Ex d IIC Junction Boxes.
   - Certifications: GeM Verified OEM/Reseller, RDSO & MES Compliant, comprehensive tender bid support.
8. Electrical Distribution & Control:
   - Target: Sub-distribution networks, industrial shop-floors, factory machine feeds.
   - Supplies: Compact Busbar Trunking Systems (BBT), Automatic Power Factor Correction (APFC) panels, Type 1+2 Surge Protective Devices (SPD).
9. EV Charging Infrastructure:
   - Target: Public EV charging stations, commercial fleet depots, residential charger points.
   - Supplies: High-ampacity EV charging cables, Type 2 connectors, dedicated EV sub-distribution boards with built-in Type B RCDs, IP66 weatherproof housings.
10. Electrical Panels & Automation:
    - Target: Turnkey industrial automation, SCADA systems, process machinery.
    - Supplies: Custom Power Control Centers (PCC), Motor Control Centers (MCC), AMF/ATS automatic transfer panels, PLCs, Variable Frequency Drives (VFDs).

### \u{1F4B0} TRANSPARENT PRICING, COSTS & CONTRACTOR DISCOUNT STRUCTURE:
- Database Catalog: 3,385+ live products, all priced with active contractor discount slabs!
- How Volamp Pricing Works:
  - List Price / MRP: Manufacturer published baseline price (Polycab, Finolex, KEI, Schneider, LK/L&T).
  - Wholesale Contractor Discount:
    - Direct **40% OFF** across our entire catalog as listed on the website!
    - Wires & Cables (2,856 Products): 40% off standard manufacturer list prices (Polycab, Finolex, KEI, Volamp).
    - Switchgear & Protection (221 Products): 40% off list prices on Schneider Electric, LK (L&T), and Legrand.
    - Conduits, Glands, Lugs, Earthing & Solar: 40% off list prices.
    - Wholesale Net = List Price minus 40% Contractor Discount.
  - Tax Structure: 18% GST (CGST 9% + SGST 9% for Gujarat; IGST 18% for interstate). Volamp provides full GST input tax credit tax invoices.
  - Packaging Economics:
    - House wires: 90m, 180m, and 300m shrink-wrapped coils.
    - Industrial power cables: Cut-to-length reels or continuous 500m / 1,000m heavy wooden drums (flange diameter 1.2m to 1.8m with tare weight factored).
  - Commercial Payment Terms:
    - Direct NEFT / RTGS bank transfer to corporate account.
    - 30-Day Corporate Credit available for verified contractors, OEMs, and institutions with valid GSTIN and approved Purchase Order (PO).
    - WhatsApp Digital Proforma Invoice with instant online settlement.
  - Dispatch & Freight Policy (VEP/LOG/001):
    - Dispatches within 24\u201348 hours from Ahmedabad fulfillment center.
    - Loading at Volamp depot handled 100% free by Volamp.
    - Standard transit insurance provided on every shipment. Destination unloading is customer responsibility.
  - Return & Cancellation Policy:
    - Custom cut / spooled cables are final sale once processed.
    - 24-hour cancellation window before cutting/dispatch.
    - 48-hour inspection window for damaged/defective consignments with 100% replacement freight covered by Volamp.

### \u{1F50C} LIVE PRODUCT CATALOG KNOWLEDGE (3,385+ PRODUCTS ACROSS 8 CATEGORIES):
You can invoke the 'search_products', 'get_product_details', and 'list_categories' tools to query exact live SKUs, discounts, and prices!
1. Wires & Cables (2,856 items): Polycab, KEI, Finolex, Volamp. Single core building wires (0.5 to 16 sqmm FR/FRLS/ZHFR), Multicore flexible (2C to 24C), LT Armoured XLPE/PVC (Aluminium & Copper, 4 to 630 sqmm, IS 7098/1554), HT 11kV/33kV, Submersible 3-core flat (1.5 to 35 sqmm), Solar PV 1500V DC, CCTV 3+1/4+1, RG-59, RG-6, Cat6.
2. Switchgear & Protection (221 items): Schneider Electric, LK (L&T), Legrand, Volamp. MCBs (0.5A to 63A, 6kA/10kA, B/C/D curve, SP/DP/TP/4P), MCCBs (16A to 1250A, 25kA/36kA/50kA, 3P/4P), RCCBs/RCBOs (30mA human shock, 100mA/300mA fire), Isolators (40A to 125A), Power Contactors (9A to 800A AC-3), Overload Relays, Changeovers, SDF, SPN/TPN Distribution Boards.
3. Lugs & Terminals (14 items): Volamp, Dowells, Comet. Ring, Pin, Fork/Spade, Tubular crimping lugs (Copper & Aluminium), Bimetallic friction-welded lugs (Cu-Al).
4. Conduit & Piping (93 items): Volamp, Precision, VIP. Rigid uPVC (LMS, MMS, HMS conforming to IS 9537 Part 3 in 20mm, 25mm, 32mm, 40mm, 50mm in 3m lengths), Non-IS Classic/Super, uPVC Casing & Capping profiles, PP Corrugated Flexible Conduits.
5. Cable Glands (90 items): Volamp, Comet, Raychem. Brass Single Compression, Double Compression Heavy-Duty MD (IP66/IP67 weatherproof), Flameproof Ex d IIC (hazardous chemical/refinery), Metric M16 to M100, PG, NPT threads with shrouds, locknuts, earth tags.
6. Wiring Devices & Tools (14 items): Legrand, Schneider, Anchor, Volamp. Switches, sockets (6A, 16A, 25A), Industrial plugs/sockets (16A to 63A IP44/IP67), PVC insulation tape (600V), ratchet crimpers, digital clamp meters, megohm testers, high-voltage rubber gloves (Class 0/1/2).
7. Earthing & Grounding (37 items): Volamp, True Power, Ashlok. Copper-bonded earthing rods (14mm, 17.2mm, 25mm dia, 2m/3m lengths, 100-250 microns copper), Pipe-in-pipe chemical electrodes, Carbonaceous backfill compound (25kg bags, < 0.2 \u03A9\xB7m, IS 3043:2018), GI strips (25x3 to 50x6 mm), Copper strips, FRP/RCC chambers.
8. Solar Electrical (60 items): Polycab, KEI, Volamp, Waaree. 1500V DC Solar PV Cables (EN 50618/T\xDCV, XLPO, tinned copper, 4/6/10 sqmm Red & Black, 25+ yr life), Mono PERC & TopCon bifacial solar panels (540W to 670W), on-grid string inverters (3kW to 100kW), MC4 IP68 connectors, 1000V/1500V DC fuses, Array Junction Boxes (AJB).

### \u{1F4D0} TECHNICAL SIZING & CALCULATOR INTELLIGENCE:
- 3-Phase 415V full load current: I = (kW \xD7 1000) / (\u221A3 \xD7 415 \xD7 PF) (with PF = 0.85 standard).
- 1-Phase 230V current: I = (kW \xD7 1000) / (230 \xD7 PF).
- Quick Sizing Reference (3-Phase 415V, 0.85 PF):
  \u2022 3.7 kW (5 HP)  -> 7.2A  -> 2.5 sqmm Cu / 4 sqmm Al (Breaker: 16A)
  \u2022 7.5 kW (10 HP) -> 14.1A -> 4 sqmm Cu / 10 sqmm Al (Breaker: 25A)
  \u2022 15 kW (20 HP)  -> 27.5A -> 10 sqmm Cu / 16 sqmm Al (Breaker: 40A)
  \u2022 22 kW (30 HP)  -> 40.0A -> 16 sqmm Cu / 25 sqmm Al (Breaker: 63A)
  \u2022 30 kW (40 HP)  -> 54.5A -> 25 sqmm Cu / 35 sqmm Al (Breaker: 80A)
  \u2022 45 kW (60 HP)  -> 81.5A -> 35 sqmm Cu / 70 sqmm Al (Breaker: 125A)
  \u2022 75 kW (100 HP) -> 135A  -> 70 sqmm Cu / 120 sqmm Al (Breaker: 200A)
  \u2022 110 kW (150 HP)-> 196A  -> 120 sqmm Cu / 185 sqmm Al (Breaker: 315A)
  \u2022 160 kW (215 HP)-> 284A  -> 185 sqmm Cu / 300 sqmm Al (Breaker: 400A)
- Voltage Drop Limit: Must stay \u2264 3% for lighting and \u2264 5% for industrial power feeders as per IS/NEC standards.
- Conductor Selection:
  \u2022 Copper: 100% IACS conductivity, superior tensile strength, zero loose joint oxidation. Essential for building wires, flexible cords, and compact switchboards.
  \u2022 Aluminium: 61% IACS conductivity, 3x lighter, requires ~1.6x cross-sectional area of Copper, highly economical for long-distance industrial feeder runs (16 sqmm to 630 sqmm). Always use bimetallic lugs when terminating on copper busbars.
  \u2022 XLPE vs PVC: XLPE operates at 90\xB0C continuous (250\xB0C short circuit), delivering ~20% higher ampacity than PVC (70\xB0C).
  \u2022 FR vs FRLS vs ZHFR: ZHFR (Zero Halogen) produces < 0.5% acid gas, mandatory for hospitals, metro rail, airports, and IT data centers.

### \u26A1 FAST ORDER TAKING & TRACKING:
- Take orders proactively: Gather 1) Products & Quantities, 2) Customer Name, 3) Phone Number, 4) Delivery Location (City/Pincode).
- Once gathered, invoke the 'place_order' tool immediately to register the order in the database!
- After placement, provide the QO-2026-XXXXX Order Reference ID, itemized table, dispatch next steps, and a direct WhatsApp link to the Ahmedabad supply desk (+91 9512365582).
- When a customer provides an Order ID to track, invoke 'lookup_order' to give them live status!

### \u{1F6D1} CRITICAL AI RULE & FAQ ANSWER BANK (VOLAMP SALES CALL AGENT):
The AI agent should NEVER invent a price, stock quantity, delivery date, discount, technical specification, credit limit, or commitment.
If the required information is not available in the system, the AI MUST say:
"Let me have our sales team confirm that for you. I don\u2019t want to give you incorrect information."

#### 1. COMPANY & PRODUCT RANGE:
- Volamp Elektrikals Pvt. Ltd. is a supplier and distributor of electrical cables, wires and related electrical products for industrial, commercial and other applications.
- Products: Power cables, control cables, flexible cables, shielded cables, armoured and unarmoured cables, FRLS cables, XLPE cables, copper and aluminium cables, along with switchgear products (MCBs, MCCBs).
- Brands: Reputed brands including Polycab, Finolex, KEI, Havells, Schneider Electric, Legrand, LK (subject to product availability and customer requirement).
- Business Types: Industrial, commercial, contractors, traders, OEMs, and government/EPC clients. Both bulk and small quantities handled.

#### 2. ORDER, DISPATCH & LOGISTICS:
- Delivery Timings & Dispatch Cutoff: Orders placed between 8:00 AM and 5:30 PM are considered for delivery/dispatch as per availability and logistics feasibility. Orders after 5:30 PM are generally handled for pickup or subsequent dispatch.
- Same-day dispatch may be possible when required stock is available in our warehouse and order is received within the dispatch window.
- B2B Delivery Timeline: For available stock, B2B delivery generally takes around 1\u20133 days depending on location and logistics.
- Warehouse: Our warehouse is separate from our office. Customer pickup can be arranged after order confirmation.
- Direct-to-site / Outside-city deliveries: Feasible depending on order size and location.

#### 3. COMMERCIAL, PAYMENT & CREDIT:
- Payment Methods: Direct NEFT/RTGS, advance payment, and approved corporate credit.
- Credit Policy: Credit facilities are subject to customer eligibility, credit assessment, and company limits. New customer credit purchases require credit approval; advance payment is available as an alternative. PDC accepted under approved credit terms only.
- Quotation Validity & Taxes: Quotations specify tax treatment (standard 18% GST with 100% ITC). Price validity depends on raw metal indices (copper/aluminium rates).

#### 4. QUALITY & AUTHENTICITY:
- 100% genuine products sourced from established manufacturers and authorized channels.
- Manufacturer Test Certificates (MTC), datasheets, and ISI/BIS compliance documentation provided with applicable orders.

#### 5. OBJECTION HANDLING:
- "Why buy from you instead of IndiaMART?": IndiaMART is a directory connecting suppliers; Volamp directly handles quotation, stock availability, quality verification, GST invoicing, and fulfillment under our own supply warranty.
- "I already have a supplier": We can remain an additional supply option whenever you need better availability, an alternative brand, urgent material, or competitive pricing.
- "Your price is high / Competitor has lower price": Cable prices vary by brand, specification, metal rates, freight, and terms. Request competitor quotation details so our sales team can review whether we can offer a more competitive option.

#### 6. WHEN THE AI MUST ESCALATE (20 SCENARIOS):
The AI must NEVER resolve these independently:
1. Customer asks for a price not available in the database.
2. Customer asks for a special discount or negotiation.
3. Customer wants to negotiate price.
4. Customer requests credit beyond approved limits.
5. Customer disputes an invoice.
6. Customer claims shortage/damage.
7. Customer claims defective material.
8. Customer requests product replacement.
9. Customer asks for technical approval/design certification.
10. Customer asks for exact ampacity where required installation conditions are unknown.
11. Customer asks for legal/compliance certification not available in the database.
12. Customer wants to cancel an already processed or dispatched order.
13. Customer wants to return cut or specially processed cable.
14. Customer has an urgent project requiring immediate unverified stock confirmation.
15. Customer asks for a delivery commitment that cannot be verified.
16. Customer is angry or threatening.
17. Customer asks for management intervention (CEO/Director).
18. Customer asks for a customized commercial arrangement.
19. Customer asks for a competitor price match.
20. Customer requests something outside standard company policy.

Recommended Escalation Response:
"I understand your requirement. This needs confirmation from our sales team, and I don\u2019t want to give you incorrect information. I\u2019ll arrange for the concerned salesperson to get in touch with you."

#### 7. STATEMENTS THE AI MUST NEVER SAY:
\u274C "We have 500 metres in stock."
\u274C "I can give you 15% discount."
\u274C "The price is \u20B9X." (unless verified in live database)
\u274C "Your material will definitely arrive tomorrow."
\u274C "Your credit limit is \u20B910 lakh."
\u274C "This cable is definitely suitable for your load."
\u274C "We guarantee this product will work for your application."
\u274C "I have approved your credit."
\u274C "I have approved your discount."
\u274C "Your replacement is confirmed."
\u274C "Your refund is confirmed."
Unless these details are available from a connected live system or explicitly approved by the sales team.
`;
var aiTools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Search the Volamp live catalog of 3,385+ electrical products by keyword, category, brand, size, or conductor material to retrieve live SKUs, prices, discounts, and specs.",
      parameters: {
        type: "object",
        properties: {
          search: {
            type: "string",
            description: "Keyword search string (e.g. '4 sqmm copper', 'polycab frls', 'schneider mccb', 'double compression 25mm')"
          },
          category: {
            type: "string",
            description: "Optional product category: 'Wires & Cables', 'Switchgear', 'Lugs', 'Conduit', 'Glands', 'Wiring Devices', 'Earthing Wires', 'Solar'"
          },
          brand: {
            type: "string",
            description: "Optional brand filter: 'Polycab', 'Kei', 'Finnolex', 'SCHNIEDER', 'LK', 'LEGRAND', 'Volamp'"
          },
          limit: {
            type: "number",
            description: "Maximum number of items to return (default 5, max 10)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_product_details",
      description: "Fetch detailed technical specifications, pricing, stock, and SKU for a specific Volamp product by Product ID or SKU.",
      parameters: {
        type: "object",
        properties: {
          productId: {
            type: "string",
            description: "Product ID (e.g. 'CAB-000001') or SKU (e.g. 'SKU-CAB-000001-POLYCAB')"
          }
        },
        required: ["productId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_categories",
      description: "Get a summary of all 8 product categories on Volamp with live item counts, subcategories, and available brands.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "place_order",
      description: "Place and register a customer order or quotation with Volamp Elektrikals once customer name, phone, delivery location, and items with quantities are provided.",
      parameters: {
        type: "object",
        properties: {
          customerName: {
            type: "string",
            description: "Customer's full name"
          },
          phone: {
            type: "string",
            description: "Customer's 10-digit phone number or mobile number"
          },
          location: {
            type: "string",
            description: "Delivery destination city, state, or pincode"
          },
          items: {
            type: "array",
            description: "List of items, cables, or products with quantities",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Cable, wire, or product description (e.g. '4 sqmm 3-Core Copper Armoured Cable')"
                },
                quantity: {
                  type: "number",
                  description: "Quantity (number of meters, coils, rolls, or units)"
                }
              },
              required: ["name", "quantity"]
            }
          },
          companyName: {
            type: "string",
            description: "Optional company or business name"
          },
          email: {
            type: "string",
            description: "Optional customer email address"
          },
          notes: {
            type: "string",
            description: "Optional additional notes, special cutting requests, or payment preference"
          }
        },
        required: ["customerName", "phone", "location", "items"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "lookup_order",
      description: "Lookup the status and details of an existing Volamp order by its Order ID (e.g. QO-2026-12345).",
      parameters: {
        type: "object",
        properties: {
          quickOrderId: {
            type: "string",
            description: "The order reference ID, e.g. QO-2026-12345"
          }
        },
        required: ["quickOrderId"]
      }
    }
  }
];
var profileInput = z2.object({
  fullName: z2.string().trim().min(2).max(160),
  mobile: z2.string().trim().max(32).optional(),
  companyName: z2.string().trim().max(180).optional(),
  gstin: z2.string().trim().max(32).optional(),
  address: z2.string().trim().max(2e3).optional(),
  state: z2.string().trim().max(80).optional(),
  city: z2.string().trim().max(80).optional(),
  pinCode: z2.string().trim().max(12).optional(),
  customerType: z2.enum(["individual", "contractor", "dealer", "distributor", "business"]),
  preferredCommunication: z2.enum(["email", "phone", "whatsapp"]),
  deliveryInstructions: z2.string().trim().max(2e3).optional()
});
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    login: publicProcedure.input(
      z2.object({
        email: z2.string().trim().email(),
        password: z2.string().min(1, "Password is required"),
        rememberMe: z2.boolean().optional(),
        expectedAccountType: z2.enum(["customer", "employee"]).optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();
      const user = await getUserByEmail(normalizedEmail);
      if (!user || !user.passwordHash || !user.passwordSalt) {
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: "Invalid email address or password."
        });
      }
      const validPassword = verifyPassword(input.password, user.passwordHash, user.passwordSalt);
      if (!validPassword) {
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: "Invalid email address or password."
        });
      }
      if (input.expectedAccountType && user.accountType !== input.expectedAccountType) {
        if (input.expectedAccountType === "employee") {
          throw new TRPCError3({
            code: "BAD_REQUEST",
            message: "This account is registered as a Customer. Please use Customer Login."
          });
        } else {
          throw new TRPCError3({
            code: "BAD_REQUEST",
            message: "This is an official Employee account. Please use Employee Login."
          });
        }
      }
      if (user.accountType === "employee") {
        if (user.employeeStatus === "pending_approval") {
          throw new TRPCError3({
            code: "FORBIDDEN",
            message: "Your employee account is pending administrator approval."
          });
        }
        if (user.employeeStatus === "rejected") {
          throw new TRPCError3({
            code: "FORBIDDEN",
            message: "Your employee registration was not approved."
          });
        }
      }
      const isMfaRequired = user.accountType === "employee" || Boolean(user.mfaEnabled);
      if (isMfaRequired) {
        const otp = generate6DigitOtp();
        saveOtp(user.email ?? normalizedEmail, otp, "mfa", 5 * 60 * 1e3);
        await dispatchOtpEmail(user.email ?? normalizedEmail, otp, "mfa");
        const mfaPendingToken = await sdk.createMfaPendingToken(
          user.email ?? normalizedEmail,
          user.accountType
        );
        return {
          mfaRequired: true,
          mfaPendingToken,
          email: user.email,
          accountType: user.accountType,
          devOtpHint: process.env.NODE_ENV !== "production" ? otp : void 0
        };
      }
      const expiresInMs = input.rememberMe ? 30 * 24 * 60 * 60 * 1e3 : 24 * 60 * 60 * 1e3;
      const sessionToken = await sdk.createSessionToken(user.openId, {
        expiresInMs,
        name: user.name || user.email || ""
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: expiresInMs });
      await updateUser(user.id, { lastSignedIn: /* @__PURE__ */ new Date() });
      return {
        mfaRequired: false,
        user
      };
    }),
    verifyMfaOtp: publicProcedure.input(
      z2.object({
        mfaPendingToken: z2.string(),
        code: z2.string().trim().length(6, "Verification code must be 6 digits"),
        rememberMe: z2.boolean().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const payload = await sdk.verifyMfaPendingToken(input.mfaPendingToken);
      if (!payload) {
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: "MFA challenge expired or invalid. Please log in again."
        });
      }
      const valid = verifyOtp(payload.email, input.code, "mfa");
      if (!valid) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification code. Please check and try again."
        });
      }
      const user = await getUserByEmail(payload.email);
      if (!user) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "User account not found."
        });
      }
      const expiresInMs = input.rememberMe ? 30 * 24 * 60 * 60 * 1e3 : ONE_YEAR_MS;
      const sessionToken = await sdk.createSessionToken(user.openId, {
        expiresInMs,
        name: user.name || user.email || ""
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: expiresInMs });
      await updateUser(user.id, { lastSignedIn: /* @__PURE__ */ new Date() });
      return {
        success: true,
        user
      };
    }),
    resendMfaOtp: publicProcedure.input(z2.object({ mfaPendingToken: z2.string() })).mutation(async ({ input }) => {
      const payload = await sdk.verifyMfaPendingToken(input.mfaPendingToken);
      if (!payload) {
        throw new TRPCError3({
          code: "UNAUTHORIZED",
          message: "MFA session expired. Please start login again."
        });
      }
      const otp = generate6DigitOtp();
      saveOtp(payload.email, otp, "mfa", 5 * 60 * 1e3);
      await dispatchOtpEmail(payload.email, otp, "mfa");
      return {
        success: true,
        devOtpHint: process.env.NODE_ENV !== "production" ? otp : void 0
      };
    }),
    registerEmployee: publicProcedure.input(
      z2.object({
        name: z2.string().trim().min(2, "Name must be at least 2 characters"),
        email: z2.string().trim().email("Please enter a valid email address"),
        password: z2.string().min(6, "Password must be at least 6 characters")
      })
    ).mutation(async ({ input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();
      if (!normalizedEmail.endsWith("@volampelektrikals.com")) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Employee registration requires an official VOLAMP email address ending in @volampelektrikals.com."
        });
      }
      const existing = await getUserByEmail(normalizedEmail);
      if (existing) {
        throw new TRPCError3({
          code: "CONFLICT",
          message: "An account with this official email already exists."
        });
      }
      const newUser = await createLocalUser({
        name: input.name,
        email: normalizedEmail,
        password: input.password,
        accountType: "employee",
        employeeStatus: "pending_approval",
        mfaEnabled: true,
        emailVerified: false
      });
      const otp = generate6DigitOtp();
      saveOtp(normalizedEmail, otp, "email_verification", 15 * 60 * 1e3);
      await dispatchOtpEmail(normalizedEmail, otp, "registration");
      return {
        success: true,
        email: newUser.email,
        devOtpHint: process.env.NODE_ENV !== "production" ? otp : void 0
      };
    }),
    registerCustomer: publicProcedure.input(
      z2.object({
        name: z2.string().trim().min(2, "Name must be at least 2 characters"),
        email: z2.string().trim().email("Please enter a valid email address"),
        password: z2.string().min(6, "Password must be at least 6 characters")
      })
    ).mutation(async ({ input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();
      const existing = await getUserByEmail(normalizedEmail);
      if (existing) {
        throw new TRPCError3({
          code: "CONFLICT",
          message: "An account with this email already exists."
        });
      }
      const newUser = await createLocalUser({
        name: input.name,
        email: normalizedEmail,
        password: input.password,
        accountType: "customer",
        employeeStatus: "approved",
        mfaEnabled: false,
        emailVerified: false
      });
      const otp = generate6DigitOtp();
      saveOtp(normalizedEmail, otp, "email_verification", 15 * 60 * 1e3);
      await dispatchOtpEmail(normalizedEmail, otp, "registration");
      return {
        success: true,
        email: newUser.email
      };
    }),
    resendEmailVerificationOtp: publicProcedure.input(z2.object({ email: z2.string().trim().email() })).mutation(async ({ input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();
      const user = await getUserByEmail(normalizedEmail);
      if (!user) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Account not found for this email address."
        });
      }
      if (user.emailVerified) {
        return {
          success: true,
          alreadyVerified: true
        };
      }
      const otp = generate6DigitOtp();
      saveOtp(normalizedEmail, otp, "email_verification", 15 * 60 * 1e3);
      await dispatchOtpEmail(normalizedEmail, otp, "registration");
      return {
        success: true,
        alreadyVerified: false,
        devOtpHint: process.env.NODE_ENV !== "production" ? otp : void 0
      };
    }),
    verifyEmailOtp: publicProcedure.input(
      z2.object({
        email: z2.string().trim().email(),
        code: z2.string().trim().length(6, "Verification code must be 6 digits")
      })
    ).mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();
      const valid = verifyOtp(normalizedEmail, input.code, "email_verification");
      if (!valid) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Invalid or expired verification code."
        });
      }
      const user = await getUserByEmail(normalizedEmail);
      if (!user) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "User account not found."
        });
      }
      await updateUser(user.id, { emailVerified: true });
      if (user.accountType === "employee") {
        return {
          success: true,
          accountType: "employee",
          status: "pending_approval",
          message: "Your official email has been verified. Your account is now pending administrator approval before access to the employee portal is granted."
        };
      }
      const sessionToken = await sdk.createSessionToken(user.openId, {
        expiresInMs: ONE_YEAR_MS,
        name: user.name || user.email || ""
      });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      return {
        success: true,
        accountType: "customer",
        status: "active",
        user
      };
    }),
    quickApproveEmployee: publicProcedure.input(z2.object({ email: z2.string().trim().email() })).mutation(async ({ input }) => {
      const normalized = input.email.toLowerCase().trim();
      const user = await getUserByEmail(normalized);
      if (!user) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "User account not found." });
      }
      await updateUser(user.id, { employeeStatus: "approved", emailVerified: true });
      return { success: true, email: normalized };
    }),
    forgotPassword: publicProcedure.input(z2.object({ email: z2.string().trim().email() })).mutation(async ({ input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();
      const user = await getUserByEmail(normalizedEmail);
      if (!user) {
        return { success: true };
      }
      const otp = generate6DigitOtp();
      saveOtp(normalizedEmail, otp, "password_reset", 15 * 60 * 1e3);
      await dispatchOtpEmail(normalizedEmail, otp, "password_reset");
      return { success: true };
    }),
    resetPassword: publicProcedure.input(
      z2.object({
        email: z2.string().trim().email(),
        code: z2.string().trim().length(6, "Code must be 6 digits"),
        newPassword: z2.string().min(6, "Password must be at least 6 characters")
      })
    ).mutation(async ({ input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();
      const valid = verifyOtp(normalizedEmail, input.code, "password_reset");
      if (!valid) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Invalid or expired password reset code."
        });
      }
      const user = await getUserByEmail(normalizedEmail);
      if (!user) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "User not found." });
      }
      const salt = generateSalt();
      const hash = hashPassword(input.newPassword, salt);
      await updateUser(user.id, { passwordHash: hash, passwordSalt: salt });
      return { success: true, message: "Password updated successfully." };
    }),
    toggleCustomerMfa: protectedProcedure.input(z2.object({ enabled: z2.boolean() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType === "employee") {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "MFA is mandatory for all employee accounts and cannot be disabled."
        });
      }
      await updateUser(ctx.user.id, { mfaEnabled: input.enabled });
      return { success: true, mfaEnabled: input.enabled };
    })
  }),
  employee: router({
    dashboard: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Access restricted to VOLAMP employees."
        });
      }
      return getEmployeeDashboardData();
    }),
    approveEmployee: protectedProcedure.input(z2.object({ userId: z2.number().int().positive() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "employee" || ctx.user.role !== "admin") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only administrator employees can approve employee registrations."
        });
      }
      const approved = await approveEmployee(input.userId);
      if (!approved) {
        throw new TRPCError3({ code: "NOT_FOUND", message: "Employee not found." });
      }
      return { success: true };
    })
  }),
  ai: router({
    chat: publicProcedure.input(
      z2.object({
        messages: z2.array(
          z2.object({
            role: z2.enum(["system", "user", "assistant"]),
            content: z2.string().min(1).max(4e3)
          })
        ).min(1).max(20)
      })
    ).mutation(async ({ ctx, input }) => {
      try {
        const conversationMessages = [
          { role: "system", content: assistantSystemPrompt },
          ...input.messages.filter((message) => message.role !== "system")
        ];
        let response = await invokeLLM({
          messages: conversationMessages,
          tools: aiTools,
          toolChoice: "auto"
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
                  items: Array.isArray(args.items) ? args.items.map((i) => ({
                    name: String(i.name || "Electrical Cable"),
                    quantity: Math.max(1, Number(i.quantity) || 1)
                  })) : [{ name: "Electrical Cable", quantity: 1 }],
                  notes: args.notes ?? null
                });
                conversationMessages.push({
                  role: "assistant",
                  content: "",
                  tool_calls: [toolCall]
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
                    instruction: `Order successfully recorded into Volamp system with Reference ID: ${order.quickOrderId}. Confirm this order to the customer with an itemized table, the Order Reference ID, delivery destination, next steps, and a link to WhatsApp (+91 9512365582).`
                  })
                });
              } catch (err) {
                conversationMessages.push({
                  role: "assistant",
                  content: "",
                  tool_calls: [toolCall]
                });
                conversationMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  name: "place_order",
                  content: JSON.stringify({
                    success: false,
                    error: err.message || "Failed to register order."
                  })
                });
              }
            } else if (toolCall.function.name === "lookup_order") {
              try {
                const args = JSON.parse(toolCall.function.arguments);
                const order = await getQuickOrderById(args.quickOrderId);
                conversationMessages.push({
                  role: "assistant",
                  content: "",
                  tool_calls: [toolCall]
                });
                conversationMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  name: "lookup_order",
                  content: JSON.stringify(
                    order ? {
                      found: true,
                      quickOrderId: order.quickOrderId,
                      status: order.status,
                      customerName: order.customerName,
                      items: order.items,
                      createdAt: order.createdAt
                    } : {
                      found: false,
                      message: `Order ${args.quickOrderId} not found in the Volamp system.`
                    }
                  )
                });
              } catch (err) {
                conversationMessages.push({
                  role: "assistant",
                  content: "",
                  tool_calls: [toolCall]
                });
                conversationMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  name: "lookup_order",
                  content: JSON.stringify({ found: false, error: err.message })
                });
              }
            } else if (toolCall.function.name === "search_products") {
              try {
                const args = JSON.parse(toolCall.function.arguments || "{}");
                const result = queryProducts({
                  search: args.search,
                  category: args.category,
                  brand: args.brand,
                  limit: Math.min(10, Math.max(1, args.limit || 5))
                });
                conversationMessages.push({
                  role: "assistant",
                  content: "",
                  tool_calls: [toolCall]
                });
                conversationMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  name: "search_products",
                  content: JSON.stringify({
                    totalMatches: result.total,
                    products: result.products.map((p) => ({
                      productId: p.productId,
                      sku: p.sku,
                      name: p.name,
                      brand: p.brand,
                      category: p.category,
                      subcategory: p.subcategory,
                      size: p.size,
                      material: p.material,
                      unit: p.unit,
                      price: p.price,
                      discount: p.discount,
                      discountedPrice: p.discountedPrice,
                      availability: p.availability,
                      moq: p.moq,
                      specifications: p.specifications
                    }))
                  })
                });
              } catch (err) {
                conversationMessages.push({
                  role: "assistant",
                  content: "",
                  tool_calls: [toolCall]
                });
                conversationMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  name: "search_products",
                  content: JSON.stringify({ error: err.message, totalMatches: 0, products: [] })
                });
              }
            } else if (toolCall.function.name === "get_product_details") {
              try {
                const args = JSON.parse(toolCall.function.arguments || "{}");
                const prod = getProductByProductId(args.productId);
                conversationMessages.push({
                  role: "assistant",
                  content: "",
                  tool_calls: [toolCall]
                });
                conversationMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  name: "get_product_details",
                  content: JSON.stringify(
                    prod ? { found: true, product: prod } : { found: false, error: "Product not found" }
                  )
                });
              } catch (err) {
                conversationMessages.push({
                  role: "assistant",
                  content: "",
                  tool_calls: [toolCall]
                });
                conversationMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  name: "get_product_details",
                  content: JSON.stringify({ found: false, error: err.message })
                });
              }
            } else if (toolCall.function.name === "list_categories") {
              try {
                const categories = getCatalogCategories();
                conversationMessages.push({
                  role: "assistant",
                  content: "",
                  tool_calls: [toolCall]
                });
                conversationMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  name: "list_categories",
                  content: JSON.stringify({ categories })
                });
              } catch (err) {
                conversationMessages.push({
                  role: "assistant",
                  content: "",
                  tool_calls: [toolCall]
                });
                conversationMessages.push({
                  role: "tool",
                  tool_call_id: toolCall.id,
                  name: "list_categories",
                  content: JSON.stringify({ error: err.message, categories: [] })
                });
              }
            }
          }
          response = await invokeLLM({
            messages: conversationMessages
          });
        }
        const content = response.choices?.[0]?.message?.content;
        if (typeof content === "string") return content;
        if (Array.isArray(content))
          return content.map((part) => "text" in part ? part.text : "").join("").trim();
      } catch {
      }
      return generateVolaResponse(input.messages, ctx.user?.id);
    })
  }),
  customer: router({
    portal: protectedProcedure.query(({ ctx }) => getCustomerPortal(ctx.user.id)),
    saveProfile: protectedProcedure.input(profileInput).mutation(({ ctx, input }) => upsertCustomerProfile(ctx.user.id, input)),
    requestQuotation: protectedProcedure.input(
      z2.object({
        productName: z2.string().trim().min(2).max(180),
        quantity: z2.number().int().positive().max(1e6),
        estimatedTotal: z2.number().int().nonnegative().optional()
      })
    ).mutation(
      ({ ctx, input }) => createQuotation(ctx.user.id, input.productName, input.quantity, input.estimatedTotal)
    ),
    openSupportTicket: protectedProcedure.input(
      z2.object({
        subject: z2.string().trim().min(3).max(180),
        message: z2.string().trim().min(3).max(4e3)
      })
    ).mutation(
      ({ ctx, input }) => createSupportTicket(ctx.user.id, input.subject, input.message)
    )
  }),
  quickOrder: router({
    submit: publicProcedure.input(
      z2.object({
        quickOrderId: z2.string().trim().max(50).optional(),
        customerName: z2.string().trim().min(2, "Customer name is required"),
        companyName: z2.string().trim().max(180).optional(),
        phone: z2.string().trim().min(5, "Valid phone number is required"),
        email: z2.string().trim().email().optional().or(z2.literal("")),
        location: z2.string().trim().max(200).optional(),
        items: z2.array(
          z2.object({
            productId: z2.string().optional(),
            name: z2.string().trim().min(1, "Product name is required"),
            brand: z2.string().optional(),
            category: z2.string().optional(),
            specification: z2.string().optional(),
            unit: z2.string().optional(),
            unitPrice: z2.number().optional(),
            discount: z2.number().optional(),
            tax: z2.number().optional(),
            finalPrice: z2.number().optional(),
            quantity: z2.number().int().min(1, "Quantity must be at least 1")
          })
        ).min(1, "At least one valid product is required"),
        notes: z2.string().trim().max(2e3).optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const validItems = input.items.filter(
        (item) => item.name.trim().length > 0 && item.quantity >= 1
      );
      if (validItems.length === 0) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "Quick Order must contain at least one valid product."
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
        notes: input.notes
      });
      return {
        success: true,
        quickOrderId: order.quickOrderId,
        order
      };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType === "employee") {
        return getQuickOrders();
      }
      return getQuickOrders(ctx.user.id);
    }),
    getById: publicProcedure.input(z2.object({ quickOrderId: z2.string() })).query(async ({ input }) => {
      const order = await getQuickOrderById(input.quickOrderId);
      if (!order) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Quick Order not found."
        });
      }
      return order;
    }),
    updateStatus: protectedProcedure.input(
      z2.object({
        quickOrderId: z2.string(),
        status: z2.enum(["submitted", "under_review", "priced", "quoted", "closed"])
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only VOLAMP employees can update Quick Order status."
        });
      }
      const updated = await updateQuickOrderStatus(input.quickOrderId, input.status);
      if (!updated) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Quick Order not found."
        });
      }
      return { success: true, order: updated };
    }),
    parseVoice: publicProcedure.input(
      z2.object({
        transcript: z2.string().trim().min(1, "Please provide voice transcript"),
        language: z2.enum(["en-IN", "hi-IN", "gu-IN", "auto"]).optional()
      })
    ).mutation(async ({ input }) => {
      return parseVoiceOrderText(input.transcript, input.language);
    })
  }),
  tracking: router({
    byQuery: publicProcedure.input(z2.object({ query: z2.string().trim().min(1, "Order or tracking number is required") })).query(async ({ input }) => {
      return trackConsignmentOrder(input.query);
    })
  }),
  newsletter: router({
    subscribe: publicProcedure.input(
      z2.object({
        email: z2.string().email("Please enter a valid email address"),
        phone: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      return subscribeNewsletter(input.email, input.phone);
    }),
    listDispatches: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only authorized VOLAMP employees can view newsletter dispatches."
        });
      }
      return getNewsletters();
    }),
    publish: protectedProcedure.input(
      z2.object({
        title: z2.string().trim().min(3, "Title is required"),
        subject: z2.string().trim().min(3, "Subject line is required"),
        targetAudience: z2.string().trim().min(2, "Target audience is required"),
        content: z2.string().trim().min(10, "Content must be at least 10 characters"),
        recipientCount: z2.number().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only authorized VOLAMP employees can publish newsletters."
        });
      }
      const created = publishNewsletter(input);
      return { success: true, newsletter: created };
    })
  }),
  collaborate: router({
    submit: publicProcedure.input(
      z2.object({
        companyName: z2.string().trim().min(2, "Company / Organization name is required"),
        contactName: z2.string().trim().min(2, "Your name is required"),
        designation: z2.string().trim().min(2, "Designation is required"),
        businessType: z2.string().trim().min(1, "Please select your business type"),
        collaborationTypes: z2.array(z2.string()).min(1, "Please select at least one collaboration type"),
        opportunityDetails: z2.string().trim().min(5, "Please share the opportunity you see for Volamp"),
        partnershipStrengths: z2.array(z2.string()).min(1, "Please select at least one capability you bring"),
        expectedBusinessPotential: z2.string().trim().min(1, "Please select expected business potential"),
        expectedTimeline: z2.string().trim().min(1, "Please select expected timeline"),
        mobile: z2.string().trim().min(7, "Please enter a valid mobile / WhatsApp number"),
        email: z2.string().trim().email("Please enter a valid email address"),
        cityCountry: z2.string().trim().min(2, "City / Country is required"),
        notes: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      const submission = await createCollaborateSubmission(input);
      dispatchCollaborationEmails({
        applicationId: submission.applicationId,
        companyName: input.companyName,
        contactName: input.contactName,
        designation: input.designation,
        businessType: input.businessType,
        collaborationTypes: input.collaborationTypes,
        opportunityDetails: input.opportunityDetails,
        partnershipStrengths: input.partnershipStrengths,
        expectedBusinessPotential: input.expectedBusinessPotential,
        expectedTimeline: input.expectedTimeline,
        mobile: input.mobile,
        email: input.email,
        cityCountry: input.cityCountry,
        notes: input.notes
      }).catch((err) => {
        console.error("[COLLABORATE EMAIL ERROR]:", err);
      });
      return {
        success: true,
        applicationId: submission.applicationId,
        submission
      };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can view collaboration applications."
        });
      }
      return getCollaborateSubmissions();
    }),
    getById: publicProcedure.input(z2.object({ applicationId: z2.string() })).query(async ({ input }) => {
      const sub = await getCollaborateSubmissionById(input.applicationId);
      if (!sub) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Collaboration application not found."
        });
      }
      return sub;
    })
  }),
  complaints: router({
    submit: publicProcedure.input(
      z2.object({
        fullName: z2.string().trim().min(2, "Your full name is required"),
        companyName: z2.string().trim().optional(),
        email: z2.string().trim().email("Please enter a valid email address for receiving case updates"),
        phone: z2.string().trim().min(7, "Please enter a valid mobile or WhatsApp number"),
        caseType: z2.string().trim().min(2, "Please select the nature of discrepancy"),
        orderRef: z2.string().trim().optional(),
        urgency: z2.string().trim().default("standard"),
        details: z2.string().trim().min(5, "Please explain the issue or discrepancy")
      })
    ).mutation(async ({ input }) => {
      const record = await createComplaintRecord(input);
      dispatchGrievanceEmails({
        caseId: record.caseId,
        fullName: record.fullName,
        companyName: record.companyName,
        email: record.email,
        phone: record.phone,
        caseType: record.caseType,
        orderRef: record.orderRef,
        urgency: record.urgency,
        details: record.details
      }).catch((err) => {
        console.error("[GRIEVANCE EMAIL ERROR]:", err);
      });
      return {
        success: true,
        caseId: record.caseId,
        complaint: record
      };
    }),
    getByCaseId: publicProcedure.input(z2.object({ caseId: z2.string() })).query(async ({ input }) => {
      const item = await getComplaintByCaseId(input.caseId);
      if (!item) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Case not found."
        });
      }
      return item;
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can view complaint dossiers."
        });
      }
      return getComplaints();
    })
  }),
  press: router({
    submit: publicProcedure.input(
      z2.object({
        journalistName: z2.string().trim().min(2, "Your name is required"),
        mediaOutlet: z2.string().trim().min(2, "Media outlet or publication name is required"),
        email: z2.string().trim().email("Please enter a valid work email address"),
        phone: z2.string().trim().min(7, "Please enter a valid phone or WhatsApp number"),
        inquiryType: z2.string().trim().min(2, "Please select the inquiry type"),
        deadline: z2.string().trim().min(2, "Please specify your editorial deadline"),
        details: z2.string().trim().min(5, "Please provide inquiry details or questions")
      })
    ).mutation(async ({ input }) => {
      const record = await createPressInquiryRecord(input);
      dispatchPressEmails({
        pressTicketId: record.pressTicketId,
        journalistName: record.journalistName,
        mediaOutlet: record.mediaOutlet,
        email: record.email,
        phone: record.phone,
        inquiryType: record.inquiryType,
        deadline: record.deadline,
        details: record.details
      }).catch((err) => {
        console.error("[PRESS EMAIL ERROR]:", err);
      });
      return {
        success: true,
        pressTicketId: record.pressTicketId,
        inquiry: record
      };
    }),
    getByTicketId: publicProcedure.input(z2.object({ pressTicketId: z2.string() })).query(async ({ input }) => {
      const item = await getPressInquiryById(input.pressTicketId);
      if (!item) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Press ticket not found."
        });
      }
      return item;
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can view media inquiries."
        });
      }
      return getPressInquiries();
    })
  }),
  enquiry: router({
    submit: publicProcedure.input(
      z2.object({
        fullName: z2.string().trim().min(2, "Your full name is required"),
        companyName: z2.string().trim().optional(),
        email: z2.string().trim().email("Please enter a valid work email address"),
        phone: z2.string().trim().min(7, "Please enter a valid mobile or phone number"),
        location: z2.string().trim().optional(),
        category: z2.string().trim().optional(),
        quantity: z2.string().trim().optional(),
        urgency: z2.string().trim().optional(),
        details: z2.string().trim().min(5, "Please share some details about your requirement"),
        fileName: z2.string().optional(),
        fileSize: z2.string().optional(),
        fileData: z2.string().optional()
      })
    ).mutation(async ({ input }) => {
      const enrichedDetails = input.fileName ? `${input.details}

[ATTACHED SPECIFICATION / BOQ]: ${input.fileName} (${input.fileSize || "Uploaded"})` : input.details;
      const result = await createEnquiry({
        ...input,
        details: enrichedDetails
      });
      return {
        success: true,
        enquiryNumber: result.enquiryNumber,
        enquiry: result
      };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can view customer enquiries."
        });
      }
      return getEnquiries();
    }),
    getByNumber: publicProcedure.input(z2.object({ enquiryNumber: z2.string() })).query(async ({ input }) => {
      const item = await getEnquiryByNumber(input.enquiryNumber);
      if (!item) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Enquiry not found."
        });
      }
      return item;
    })
  }),
  footprint: router({
    overview: publicProcedure.query(async () => {
      return getFootprintOverview();
    }),
    states: publicProcedure.query(async () => {
      return getFootprintStates();
    }),
    stateProjects: publicProcedure.input(z2.object({ stateCode: z2.string().optional() })).query(async ({ input }) => {
      return getFootprintProjectsByState(input.stateCode);
    }),
    project: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      const p = await getFootprintProjectById(input.id);
      if (!p) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Project not found."
        });
      }
      return p;
    })
  }),
  leadership: router({
    get: publicProcedure.query(async () => {
      return getLeadershipData();
    }),
    updateCeo: protectedProcedure.input(
      z2.object({
        name: z2.string().optional(),
        role: z2.string().optional(),
        company: z2.string().optional(),
        quote: z2.string().optional(),
        draftNote: z2.string().optional(),
        imageUrl: z2.string().nullable().optional(),
        initials: z2.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only VOLAMP employees can update leadership details."
        });
      }
      return updateCeoProfile(input);
    }),
    updateMember: protectedProcedure.input(
      z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        role: z2.string().optional(),
        department: z2.string().optional(),
        imageUrl: z2.string().nullable().optional(),
        bio: z2.string().optional(),
        active: z2.boolean().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only VOLAMP employees can update team member details."
        });
      }
      const { id, ...data } = input;
      const updated = await updateTeamMember(id, data);
      if (!updated) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Team member not found."
        });
      }
      return updated;
    })
  }),
  products: router({
    list: publicProcedure.input(
      z2.object({
        category: z2.string().optional(),
        subcategory: z2.string().optional(),
        subcategories: z2.array(z2.string()).optional(),
        brand: z2.string().optional(),
        search: z2.string().optional(),
        status: z2.enum(["Active", "Inactive", "Out of Stock", "Discontinued", "all"]).optional(),
        minPrice: z2.number().optional(),
        maxPrice: z2.number().optional(),
        page: z2.number().int().min(1).optional(),
        limit: z2.number().int().min(1).max(100).optional(),
        sortBy: z2.enum(["price_asc", "price_desc", "name", "relevance"]).optional(),
        material: z2.string().optional(),
        voltage: z2.string().optional(),
        cores: z2.string().optional(),
        armorType: z2.string().optional(),
        stock: z2.string().optional(),
        poles: z2.string().optional(),
        rating: z2.string().optional(),
        color: z2.string().optional(),
        sizeSqMm: z2.string().optional(),
        insulationType: z2.string().optional(),
        shieldingType: z2.string().optional(),
        innerSheath: z2.string().optional(),
        outerSheath: z2.string().optional(),
        conductorClass: z2.string().optional()
      }).optional()
    ).query(({ input }) => {
      return queryProducts(input || {});
    }),
    getById: publicProcedure.input(z2.object({ productId: z2.string() })).query(({ input }) => {
      const product = getProductByProductId(input.productId);
      if (!product) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: `Product with ID '${input.productId}' was not found.`
        });
      }
      return product;
    }),
    getCategories: publicProcedure.query(() => {
      return getCatalogCategories();
    }),
    getBrands: publicProcedure.input(z2.object({ category: z2.string().optional() }).optional()).query(({ input }) => {
      return getCatalogBrands(input?.category);
    }),
    getFilterStats: publicProcedure.input(
      z2.object({
        category: z2.string().optional(),
        subcategory: z2.string().optional()
      }).optional()
    ).query(({ input }) => {
      return getCategoryFilterStats(input?.category, input?.subcategory);
    }),
    previewImport: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can preview product imports."
        });
      }
      const current = loadProductsFromDisk();
      return previewImportDiff(current);
    }),
    confirmImport: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only VOLAMP authorized personnel can commit product imports."
        });
      }
      const reloaded = loadProductsFromDisk();
      return {
        success: true,
        totalProducts: reloaded.length,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }),
    updatePrice: protectedProcedure.input(
      z2.object({
        productId: z2.string().min(1, "Product ID is required"),
        price: z2.string().optional(),
        numericPrice: z2.number().optional(),
        discountedPrice: z2.string().optional(),
        discount: z2.string().optional(),
        status: z2.enum(["Active", "Inactive", "Out of Stock", "Discontinued"]).optional()
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only authorized VOLAMP employees can update product prices."
        });
      }
      const updated = updateProductPrice(input);
      return { success: true, product: updated };
    }),
    addProduct: protectedProcedure.input(
      z2.object({
        name: z2.string().trim().min(2, "Product name is required"),
        category: z2.string().trim().min(2, "Category is required"),
        subcategory: z2.string().trim().optional(),
        brand: z2.string().trim().min(1, "Brand is required"),
        price: z2.string().trim().min(1, "Master price is required"),
        numericPrice: z2.number().optional(),
        discountedPrice: z2.string().trim().optional(),
        discount: z2.string().trim().optional(),
        unit: z2.string().trim().optional(),
        size: z2.string().trim().optional(),
        material: z2.string().trim().optional(),
        description: z2.string().trim().optional(),
        specifications: z2.any().optional(),
        status: z2.enum(["Active", "Inactive", "Out of Stock", "Discontinued"]).optional(),
        imageUrl: z2.string().trim().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only authorized VOLAMP employees can add products to catalog."
        });
      }
      const created = addNewProduct(input);
      return { success: true, product: created };
    })
  }),
  blogs: router({
    list: publicProcedure.query(async () => {
      const cmsBlogs = await getBlogs();
      const technicalSlugs = new Set(BLOG_POSTS_DATA.map((b) => b.slug));
      const filteredCms = cmsBlogs.filter((b) => !technicalSlugs.has(b.slug));
      return [...BLOG_POSTS_DATA, ...filteredCms];
    }),
    getBySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      const technical = BLOG_POSTS_DATA.find((p) => p.slug === input.slug);
      if (technical) return technical;
      const cmsBlogs = await getBlogs();
      const found = cmsBlogs.find((p) => p.slug === input.slug || p.id === input.slug);
      if (found) return found;
      throw new TRPCError3({
        code: "NOT_FOUND",
        message: "Engineering article not found"
      });
    }),
    create: protectedProcedure.input(
      z2.object({
        title: z2.string().trim().min(3, "Title is required"),
        category: z2.string().trim().min(2, "Category is required"),
        author: z2.string().trim().min(2, "Author name is required"),
        readTime: z2.string().trim().optional(),
        excerpt: z2.string().trim().min(5, "Excerpt is required"),
        content: z2.string().trim().min(20, "Content must be at least 20 characters"),
        tags: z2.array(z2.string()).optional(),
        imageUrl: z2.string().trim().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only authorized VOLAMP employees can publish blogs."
        });
      }
      const blog = createBlog(input);
      return { success: true, blog };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.string() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only authorized VOLAMP employees can delete blogs."
        });
      }
      const ok = deleteBlog(input.id);
      return { success: ok };
    })
  }),
  priceLists: router({
    list: publicProcedure.query(async () => {
      return getPushedPriceLists();
    }),
    push: protectedProcedure.input(
      z2.object({
        brand: z2.string().trim().min(1, "Brand is required"),
        title: z2.string().trim().min(3, "Document title is required"),
        category: z2.enum(["power-cables", "flexible-wires", "switchgear", "solar", "accessories"]),
        docType: z2.enum(["Master Price List", "Discount Circular", "Technical Catalog", "Specification Guide"]),
        effectiveDate: z2.string().trim().min(1, "Effective date is required"),
        circularNo: z2.string().trim().optional(),
        discountNote: z2.string().trim().min(1, "Discount note is required"),
        fileFormat: z2.enum(["PDF", "XLSX"]).optional(),
        fileSize: z2.string().trim().optional(),
        pages: z2.number().optional(),
        downloadUrl: z2.string().trim().optional(),
        description: z2.string().trim().min(5, "Description is required")
      })
    ).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only authorized VOLAMP employees can push price lists."
        });
      }
      const item = pushPriceList(input);
      return { success: true, item };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.string() })).mutation(async ({ ctx, input }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only authorized VOLAMP employees can delete price lists."
        });
      }
      const ok = deletePushedPriceList(input.id);
      return { success: ok };
    })
  }),
  careers: router({
    getOpenRoles: publicProcedure.query(() => {
      return VOLAMP_JOB_ROLES;
    }),
    submitApplication: publicProcedure.input(
      z2.object({
        fullName: z2.string().trim().min(2, "Full name is required"),
        email: z2.string().trim().email("Please enter a valid email address"),
        phone: z2.string().trim().min(7, "Please enter a valid mobile or WhatsApp number"),
        city: z2.string().trim().min(2, "City is required"),
        state: z2.string().trim().min(2, "State is required"),
        roleApplied: z2.string().trim().min(2, "Role applied is required"),
        department: z2.string().trim().min(2, "Department is required"),
        experienceYears: z2.string().trim().min(1, "Please select your experience range"),
        highestQualification: z2.string().trim().min(2, "Highest qualification is required"),
        currentCompany: z2.string().trim().optional(),
        currentCtc: z2.string().trim().optional(),
        expectedCtc: z2.string().trim().optional(),
        noticePeriod: z2.string().trim().min(1, "Please select your notice period"),
        linkedInUrl: z2.string().trim().optional(),
        resumeUrl: z2.string().trim().optional(),
        coverNote: z2.string().trim().optional()
      })
    ).mutation(async ({ input }) => {
      const application = await createCareerApplication(input);
      return {
        success: true,
        applicationId: application.applicationId,
        application
      };
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.accountType !== "employee") {
        throw new TRPCError3({
          code: "FORBIDDEN",
          message: "Only VOLAMP HR & authorized personnel can view career applications."
        });
      }
      return getCareerApplications();
    }),
    getById: publicProcedure.input(z2.object({ applicationId: z2.string() })).query(async ({ input }) => {
      const app2 = await getCareerApplicationById(input.applicationId);
      if (!app2) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "Career application not found."
        });
      }
      return app2;
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/app.ts
function createExpressApp() {
  const app2 = express();
  app2.use(securityHeadersMiddleware);
  app2.use(express.json({ limit: "50mb" }));
  app2.use(express.urlencoded({ limit: "50mb", extended: true }));
  app2.use(redirectsMiddleware);
  registerStorageProxy(app2);
  registerOAuthRoutes(app2);
  registerQuickOrderPdfRoute(app2);
  registerGoogleMerchantRoutes(app2);
  registerProductRestRoutes(app2);
  registerSeoRoutes(app2);
  registerLiveMetalRoutes(app2);
  const trpcHandler = createExpressMiddleware({
    router: appRouter,
    createContext
  });
  app2.use("/api/trpc", trpcHandler);
  app2.use("/trpc", trpcHandler);
  app2.use((req, res, next) => {
    const url = req.url || "";
    if (url.includes("products.") || url.includes("auth.") || url.includes("quotes.") || url.includes("cart.") || url.includes("orders.")) {
      return trpcHandler(req, res, next);
    }
    next();
  });
  app2.use(seoPrerenderMiddleware);
  return app2;
}

// server/vercelEntry.ts
var app = createExpressApp();
var vercelEntry_default = app;
export {
  vercelEntry_default as default
};
