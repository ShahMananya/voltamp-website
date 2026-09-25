import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  customerDocuments,
  customerProfiles,
  orders,
  quotations,
  supportTickets,
  quickOrders,
  QuickOrder,
  InsertCustomerProfile,
  InsertUser,
  users,
  User,
  footprintStates,
  footprintProjects,
  FootprintStateRecord,
  FootprintProjectRecord,
  collaborateSubmissions,
  CollaborateSubmission,
  InsertCollaborateSubmission,
  enquiries,
  Enquiry,
  InsertEnquiry,
  careerApplications,
  CareerApplication,
  InsertCareerApplication,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
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

// ---------------------------------------------------------------------------
// Crypto & Password Hashing
// ---------------------------------------------------------------------------

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const hashed = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hashed), Buffer.from(hash));
  } catch {
    return false;
  }
}

export function generate6DigitOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ---------------------------------------------------------------------------
// In-Memory Fallback Store (for Localhost & Non-MySQL Environments)
// ---------------------------------------------------------------------------

type StoredUser = User & {
  passwordHash?: string | null;
  passwordSalt?: string | null;
};

type StoredOtp = {
  email: string;
  code: string;
  purpose: string;
  expiresAt: number;
};

const adminSalt = generateSalt();
const customerSalt = generateSalt();

const memoryUsers: Map<string, StoredUser> = new Map([
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
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
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
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  ],
]);

let memoryNextUserId = 3;
const memoryOtps: StoredOtp[] = [];
const memoryCustomerProfiles = new Map<number, any>();
const memoryQuotations: any[] = [
  {
    id: 101,
    userId: 2,
    reference: "VLT-CABLE-928",
    productName: "HT Aluminium Arm Cable 11kV",
    quantity: 500,
    status: "quoted",
    estimatedTotal: 485000,
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(),
  },
];
const memoryOrders: any[] = [
  {
    id: 201,
    userId: 2,
    orderNumber: "ORD-IND-5412",
    status: "dispatched",
    trackingNumber: "TRK-VOLAMP-GJ98234",
    total: 340000,
    createdAt: new Date(Date.now() - 86400000 * 4),
    updatedAt: new Date(),
  },
];
const memoryDocuments: any[] = [];
const memoryTickets: any[] = [];
const memoryQuickOrders: any[] = [
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
      { name: "Industrial MCB 63A", quantity: 4 },
    ]),
    notes: "Direct project requirement - pricing requested.",
    status: "submitted",
    createdAt: new Date(Date.now() - 3600000 * 4),
    updatedAt: new Date(Date.now() - 3600000 * 4),
  },
];

// ---------------------------------------------------------------------------
// OTP Management
// ---------------------------------------------------------------------------

export function saveOtp(
  email: string,
  code: string,
  purpose: "email_verification" | "mfa" | "password_reset",
  expiresInMs: number = 10 * 60 * 1000
) {
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + expiresInMs;
  // Remove existing OTPs for same email & purpose
  for (let i = memoryOtps.length - 1; i >= 0; i--) {
    if (memoryOtps[i].email === normalizedEmail && memoryOtps[i].purpose === purpose) {
      memoryOtps.splice(i, 1);
    }
  }
  memoryOtps.push({ email: normalizedEmail, code, purpose, expiresAt });
  console.log(`[OTP] Generated for ${normalizedEmail} (${purpose}): ${code} (expires in ${Math.round(expiresInMs / 1000)}s)`);
}

export function verifyOtp(
  email: string,
  code: string,
  purpose: "email_verification" | "mfa" | "password_reset"
): boolean {
  const normalizedEmail = email.toLowerCase().trim();
  const now = Date.now();
  const index = memoryOtps.findIndex(
    (item) => item.email === normalizedEmail && item.code === code.trim() && item.purpose === purpose && item.expiresAt > now
  );
  if (index !== -1) {
    memoryOtps.splice(index, 1);
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// User Operations
// ---------------------------------------------------------------------------

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result[0];
  }
  for (const user of Array.from(memoryUsers.values())) {
    if (user.openId === openId) return user;
  }
  return undefined;
}

export async function getUserByEmail(email: string): Promise<StoredUser | undefined> {
  const normalized = email.toLowerCase().trim();
  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
    return result[0] as StoredUser | undefined;
  }
  return memoryUsers.get(normalized);
}

export async function getUserById(id: number): Promise<StoredUser | undefined> {
  const db = await getDb();
  if (db) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] as StoredUser | undefined;
  }
  for (const user of Array.from(memoryUsers.values())) {
    if (user.id === id) return user;
  }
  return undefined;
}

export async function createLocalUser(params: {
  name: string;
  email: string;
  password?: string;
  accountType: "customer" | "employee";
  employeeStatus?: "pending_approval" | "approved" | "rejected";
  mfaEnabled?: boolean;
  emailVerified?: boolean;
  role?: "user" | "admin";
}): Promise<User> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const salt = params.password ? generateSalt() : null;
  const hash = params.password && salt ? hashPassword(params.password, salt) : null;
  const openId = `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

  const isEmployee = params.accountType === "employee";
  const userRole = params.role ?? (params.email === ENV.ownerOpenId ? "admin" : "user");

  const newUser: StoredUser = {
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
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const db = await getDb();
  if (db) {
    await db.insert(users).values(newUser as any);
  }

  memoryUsers.set(normalizedEmail, newUser);
  return newUser;
}

export async function updateUser(
  id: number,
  fields: Partial<StoredUser>
): Promise<StoredUser | undefined> {
  const db = await getDb();
  if (db) {
    await db.update(users).set(fields as any).where(eq(users.id, id));
  }

  for (const [key, user] of Array.from(memoryUsers.entries())) {
    if (user.id === id) {
      const updated = { ...user, ...fields, updatedAt: new Date() };
      memoryUsers.set(key, updated);
      return updated;
    }
  }
  return undefined;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    // Memory store upsert
    let existing: StoredUser | undefined;
    for (const u of Array.from(memoryUsers.values())) {
      if (u.openId === user.openId) existing = u;
    }
    if (existing) {
      if (user.name !== undefined) existing.name = user.name;
      if (user.email !== undefined) existing.email = user.email;
      existing.lastSignedIn = new Date();
    } else {
      const newUser: StoredUser = {
        id: memoryNextUserId++,
        openId: user.openId,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? "oauth",
        role: user.role ?? "user",
        accountType: (user as any).accountType ?? "customer",
        employeeStatus: (user as any).employeeStatus ?? "approved",
        passwordHash: null,
        passwordSalt: null,
        mfaEnabled: false,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };
      if (newUser.email) memoryUsers.set(newUser.email, newUser);
    }
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  });
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  try {
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function listPendingEmployees(): Promise<User[]> {
  const db = await getDb();
  if (db) {
    const list = await db
      .select()
      .from(users)
      .where(and(eq(users.accountType, "employee"), eq(users.employeeStatus, "pending_approval")));
    return list;
  }
  const pending: User[] = [];
  for (const user of Array.from(memoryUsers.values())) {
    if (user.accountType === "employee" && user.employeeStatus === "pending_approval") {
      pending.push(user);
    }
  }
  return pending;
}

export async function approveEmployee(userId: number): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user || user.accountType !== "employee") return false;
  await updateUser(userId, { employeeStatus: "approved" });
  return true;
}

// ---------------------------------------------------------------------------
// Customer Portal & Operations
// ---------------------------------------------------------------------------

export async function getCustomerPortal(userId: number) {
  const db = await getDb();
  if (!db) {
    const profile = memoryCustomerProfiles.get(userId);
    const customerQuotes = memoryQuotations.filter((q) => q.userId === userId);
    const customerOrders = memoryOrders.filter((o) => o.userId === userId);
    const documents = memoryDocuments.filter((d) => d.userId === userId);
    const tickets = memoryTickets.filter((t) => t.userId === userId);
    return { profile, quotations: customerQuotes, orders: customerOrders, documents, tickets };
  }
  const [profile, customerQuotes, customerOrders, documents, tickets] = await Promise.all([
    db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1),
    db.select().from(quotations).where(eq(quotations.userId, userId)),
    db.select().from(orders).where(eq(orders.userId, userId)),
    db.select().from(customerDocuments).where(eq(customerDocuments.userId, userId)),
    db.select().from(supportTickets).where(eq(supportTickets.userId, userId)),
  ]);
  return { profile: profile[0], quotations: customerQuotes, orders: customerOrders, documents, tickets };
}

export async function upsertCustomerProfile(
  userId: number,
  input: Omit<InsertCustomerProfile, "id" | "userId" | "createdAt" | "updatedAt">
) {
  const db = await getDb();
  if (!db) {
    const existing = memoryCustomerProfiles.get(userId) || {};
    const updated = { id: 1, userId, ...existing, ...input, updatedAt: new Date() };
    memoryCustomerProfiles.set(userId, updated);
    return updated;
  }
  await db
    .insert(customerProfiles)
    .values({ userId, ...input })
    .onDuplicateKeyUpdate({ set: { ...input } });
  const result = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function createSupportTicket(userId: number, subject: string, lastMessage: string) {
  const db = await getDb();
  if (!db) {
    const newTicket = { id: memoryTickets.length + 1, userId, subject, lastMessage, status: "open" as const, createdAt: new Date() };
    memoryTickets.push(newTicket);
    return { id: newTicket.id, subject, status: "open" as const };
  }
  const result = await db.insert(supportTickets).values({ userId, subject, lastMessage });
  return { id: result[0].insertId, subject, status: "open" as const };
}

export async function createQuotation(userId: number, productName: string, quantity: number, estimatedTotal?: number) {
  const reference = `VLT-${Date.now().toString(36).toUpperCase()}`;
  const db = await getDb();
  if (!db) {
    const quote = { id: memoryQuotations.length + 100, userId, reference, productName, quantity, estimatedTotal, status: "requested" as const, createdAt: new Date() };
    memoryQuotations.unshift(quote);
    return quote;
  }
  const result = await db.insert(quotations).values({ userId, reference, productName, quantity, estimatedTotal });
  return { id: result[0].insertId, reference, productName, quantity, status: "requested" as const, estimatedTotal };
}

export async function getEmployeeDashboardData() {
  const db = await getDb();
  if (!db) {
    const pendingEmployees = await listPendingEmployees();
    return {
      pendingEmployees,
      quotations: memoryQuotations,
      orders: memoryOrders,
      tickets: memoryTickets,
      quickOrders: memoryQuickOrders,
      metrics: {
        totalQuotes: memoryQuotations.length,
        totalOrders: memoryOrders.length,
        totalQuickOrders: memoryQuickOrders.length,
        pendingApprovals: pendingEmployees.length,
      },
    };
  }
  const [pendingEmployees, allQuotes, allOrders, allTickets, allQuickOrders] = await Promise.all([
    listPendingEmployees(),
    db.select().from(quotations).limit(50),
    db.select().from(orders).limit(50),
    db.select().from(supportTickets).limit(50),
    db.select().from(quickOrders).limit(50),
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
      pendingApprovals: pendingEmployees.length,
    },
  };
}

// ---------------------------------------------------------------------------
// Quick Order Management
// ---------------------------------------------------------------------------

export function generateQuickOrderId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `QO-${year}-${randomNum}`;
}

export async function createQuickOrder(data: {
  userId?: number | null;
  quickOrderId?: string;
  customerName: string;
  companyName?: string | null;
  phone: string;
  email?: string | null;
  location?: string | null;
  items: Array<{ name: string; quantity: number }>;
  notes?: string | null;
}) {
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
      status: "submitted" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
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
    status: "submitted",
  });
  return {
    id: result[0].insertId,
    quickOrderId,
    ...data,
    items: serializedItems,
    status: "submitted" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getQuickOrders(userId?: number | null) {
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

export async function getQuickOrderById(quickOrderId: string) {
  const db = await getDb();
  if (!db) {
    return memoryQuickOrders.find((o) => o.quickOrderId === quickOrderId) ?? null;
  }
  const res = await db.select().from(quickOrders).where(eq(quickOrders.quickOrderId, quickOrderId));
  return res[0] ?? null;
}

export async function updateQuickOrderStatus(
  quickOrderId: string,
  status: "submitted" | "under_review" | "priced" | "quoted" | "closed"
) {
  const db = await getDb();
  if (!db) {
    const order = memoryQuickOrders.find((o) => o.quickOrderId === quickOrderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date();
      return order;
    }
    return null;
  }
  await db
    .update(quickOrders)
    .set({ status, updatedAt: new Date() })
    .where(eq(quickOrders.quickOrderId, quickOrderId));
  return getQuickOrderById(quickOrderId);
}

// ---------------------------------------------------------------------------
// Footprint States & Projects Store (CMS-backed)
// ---------------------------------------------------------------------------

const initialFootprintStates: FootprintStateRecord[] = [
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const initialFootprintProjects: FootprintProjectRecord[] = [
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/solar-panel.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cable-gland.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    volampContribution: "Supplied specialized radiation-tolerant, halogen-free, and fire-survival power lines with full Mill Test Certification.",
    heritage: "A crowning milestone of trust by India's apex nuclear science institution.",
    customerTestimonial: "Strict compliance with nuclear safety protocols and comprehensive MTC test documentation.",
    customerName: "Scientific Engineering Desk",
    customerCompany: "BARC Infrastructure Project",
    status: "Completed & Operational",
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cable-gland.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cable-lugs.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cable-gland.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/switchgear.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/earthing-rods.png",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/earthing-rods.png",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/solar-panel.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cable-gland.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/solar-panel.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/cables.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
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
    images: "/products/solar-panel.jpg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const memoryFootprintStates: FootprintStateRecord[] = [...initialFootprintStates];
const memoryFootprintProjects: FootprintProjectRecord[] = [...initialFootprintProjects];

export async function getFootprintOverview() {
  const allStates = await getFootprintStates();
  const allProjects = await getFootprintProjectsByState();
  const totalCompleted = allStates.reduce((acc, s) => acc + (s.projectsCompleted || 0), 0);
  return {
    projectsCompleted: `${Math.max(totalCompleted, 240)}+`,
    statesServed: `${allStates.length}+`,
    majorProjects: `${allProjects.length}+`,
    yearsOfExperience: "15+",
    globalAmbition: "Supplying 28 Indian states with expanding exports to GCC, Southeast Asia & East Africa",
  };
}

export async function getFootprintStates(): Promise<FootprintStateRecord[]> {
  const db = await getDb();
  if (!db) {
    return memoryFootprintStates;
  }
  try {
    const records = await db.select().from(footprintStates);
    const stateMap = new Map<string, FootprintStateRecord>();
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

export async function getFootprintProjectsByState(stateCode?: string): Promise<FootprintProjectRecord[]> {
  const db = await getDb();
  if (!db) {
    if (stateCode) {
      return memoryFootprintProjects.filter((p) => p.stateCode.toUpperCase() === stateCode.toUpperCase());
    }
    return memoryFootprintProjects;
  }
  try {
    const records = stateCode
      ? await db.select().from(footprintProjects).where(eq(footprintProjects.stateCode, stateCode.toUpperCase()))
      : await db.select().from(footprintProjects);

    const projMap = new Map<string, FootprintProjectRecord>();
    const filterProjects = stateCode
      ? memoryFootprintProjects.filter((p) => p.stateCode.toUpperCase() === stateCode.toUpperCase())
      : memoryFootprintProjects;

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

export async function getFootprintProjectById(id: number): Promise<FootprintProjectRecord | null> {
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

// ---------------------------------------------------------------------------
// Dynamic Leadership & Team Data Store
// ---------------------------------------------------------------------------

export type CeoProfile = {
  name: string;
  role: string;
  company: string;
  headline?: string;
  quote: string;
  message?: string[];
  motto?: string;
  draftNote?: string;
  imageUrl?: string | null;
  initials: string;
};

export type TeamMember = {
  id: number;
  number: string;
  name: string;
  role: string;
  department?: string;
  imageUrl?: string | null;
  bio?: string;
  active: boolean;
};

export type LeadershipData = {
  ceo: CeoProfile;
  team: TeamMember[];
};

const defaultCeo: CeoProfile = {
  name: "Naimil Patel",
  role: "Chief Executive Officer · Volamp Elektrikals Private Limited",
  company: "Volamp Elektrikals Private Limited",
  headline: "Saath Milkar Growth Ki Ek Nayi Pehchaan Banayein",
  quote: "“Koi bhi company sirf products se nahi banti — company banti hai INSAN, unki mehnat, commitment aur customer ke trust se.”",
  message: [
    "Volamp Elektrikals Private Limited ke safar mein hamara focus sirf business grow karna nahi, balki trust, quality aur strong relations build karna hai.",
    "Mera maanna hai ki koi bhi company sirf products se nahi banti — company banti hai INSAN AUR unki mehnat, commitment aur customer ke trust se.",
    "Volamp mein hum continuously apne products, services aur working systems ko better banane ki koshish karte hain. Electrical aur switchgear industry mein badalti customer requirements ko samajhna aur unke liye reliable aur value-driven solutions provide karna hamari priority hoti hai.",
    "Hamare liye har customer sirf ek business opportunity nahi, balki ek long-term relationship hai. Isi approach ke saath hum quality, service aur commitment ko apne business ka strong foundation bana rahe hain.",
    "Main apni team par bhi poora bharosa rakhta hoon. Mujhe believe hai ki jab har individual apni responsibility ko ownership ke saath nibhata hai, tab organisation extraordinary results achieve kar sakti hai.",
    "Aane wale samay mein hum technology, better systems, innovation aur strong teamwork ke through Volamp ko aur stronger banane ke liye committed hain.",
    "Hamari comeback ki journey abhi shuru hui hai. Target sirf bada banna nahi, balki better banna hai — har din, har customer aur har opportunity ke saath.",
    "Main apne customers, dealers, suppliers, business partners aur poori Volamp team ka dil se thank you karta hoon, jo is journey ka important part hain. Chalo, milkar ek aisa Volamp banayein jiske saath log sirf business nahi, balki apna trust bhi jodna chahein.",
  ],
  motto: "Together, Let's Power the Growth. Together, Let's Build Volamp and India.",
  imageUrl: "/team/ceo.jpeg",
  initials: "NP",
};

const defaultTeam: TeamMember[] = [
  {
    id: 1,
    number: "01",
    name: "Roshni Shroff",
    role: "Sales Team",
    department: "Sales & Client Solutions",
    imageUrl: "/team/roshni-shroff.jpg",
    active: true,
  },
  {
    id: 2,
    number: "02",
    name: "Pooja Thakor",
    role: "Sales Team",
    department: "Sales & Client Solutions",
    imageUrl: "/team/pooja-thakor.jpg",
    active: true,
  },
  {
    id: 3,
    number: "03",
    name: "Pooja Patel",
    role: "Sales Team",
    department: "Sales & Client Solutions",
    imageUrl: "/team/pooja-patel.jpg",
    active: true,
  },
  {
    id: 4,
    number: "04",
    name: "Jinay Patel",
    role: "Sales Team · Switch Gears",
    department: "Switchgear Sourcing",
    imageUrl: "/team/jinay-patel.jpg",
    active: true,
  },
  {
    id: 5,
    number: "05",
    name: "Dhaval Rana",
    role: "Accounts Manager",
    department: "Finance & Accounts",
    imageUrl: "/team/dhaval-rana.jpg",
    active: true,
  },
  {
    id: 6,
    number: "06",
    name: "Montu Patil",
    role: "Operations Manager",
    department: "Logistics & Operations",
    imageUrl: "/team/montu-patil.jpg",
    active: true,
  },
];

let memoryLeadership: LeadershipData = {
  ceo: defaultCeo,
  team: defaultTeam,
};

export async function getLeadershipData(): Promise<LeadershipData> {
  return {
    ceo: { ...memoryLeadership.ceo },
    team: memoryLeadership.team.map((m) => ({ ...m })),
  };
}

export async function updateCeoProfile(data: Partial<CeoProfile>): Promise<CeoProfile> {
  memoryLeadership.ceo = { ...memoryLeadership.ceo, ...data };
  return { ...memoryLeadership.ceo };
}

export async function updateTeamMember(id: number, data: Partial<TeamMember>): Promise<TeamMember | null> {
  const index = memoryLeadership.team.findIndex((m) => m.id === id);
  if (index === -1) return null;
  memoryLeadership.team[index] = { ...memoryLeadership.team[index], ...data };
  return { ...memoryLeadership.team[index] };
}

export async function addTeamMember(data: Omit<TeamMember, "id">): Promise<TeamMember> {
  const newId = memoryLeadership.team.length > 0 ? Math.max(...memoryLeadership.team.map((m) => m.id)) + 1 : 1;
  const newMember: TeamMember = { id: newId, ...data };
  memoryLeadership.team.push(newMember);
  return { ...newMember };
}

// ---------------------------------------------------------------------------
// Consignment & Order Tracking
// ---------------------------------------------------------------------------

export interface ConsignmentTrackingResult {
  found: boolean;
  orderNumber: string;
  trackingNumber?: string;
  transporter?: string;
  lrNumber?: string;
  status: "received" | "confirmed" | "processing" | "dispatched" | "in_transit" | "delivered";
  statusLabel: string;
  statusDescription: string;
  customerName?: string;
  companyName?: string;
  phone?: string;
  origin: string;
  destination: string;
  dispatchDate?: string;
  estimatedDelivery?: string;
  currentLocation?: string;
  items: Array<{ name: string; quantity: number; unit?: string; spec?: string }>;
  milestones: Array<{
    title: string;
    description: string;
    time?: string;
    completed: boolean;
    current: boolean;
  }>;
  totalWeight?: string;
  invoiceNumber?: string;
  mtcNumber?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  vehicleModel?: string;
  telemetry?: {
    currentLocation: string;
    lastStop: string;
    distance: string;
    speed: string;
  };
  originCoords?: { x: number; y: number };
  destCoords?: { x: number; y: number };
  truckCoords?: { x: number; y: number };
  waypoints?: Array<{ x: number; y: number }>;
}

export async function trackConsignmentOrder(query: string): Promise<ConsignmentTrackingResult> {
  const cleanQ = query.trim();
  const upperQ = cleanQ.toUpperCase();
  const digitsQ = cleanQ.replace(/\D/g, "");

  const db = await getDb();
  let matchedOrder: any = null;
  let matchedUserProfile: any = null;
  let matchedUser: any = null;

  // 1. Check in Database or In-Memory Orders
  if (db) {
    const dbOrders = await db.select().from(orders);
    matchedOrder = dbOrders.find(
      (o) =>
        o.orderNumber?.toUpperCase() === upperQ ||
        (o.trackingNumber && o.trackingNumber.toUpperCase() === upperQ) ||
        String(o.id) === cleanQ
    );
    if (matchedOrder) {
      const [u, p] = await Promise.all([
        db.select().from(users).where(eq(users.id, matchedOrder.userId)).limit(1),
        db.select().from(customerProfiles).where(eq(customerProfiles.userId, matchedOrder.userId)).limit(1),
      ]);
      matchedUser = u[0] || null;
      matchedUserProfile = p[0] || null;
    }
  } else {
    matchedOrder = memoryOrders.find(
      (o) =>
        o.orderNumber?.toUpperCase() === upperQ ||
        (o.trackingNumber && o.trackingNumber.toUpperCase() === upperQ) ||
        String(o.id) === cleanQ
    );
    if (matchedOrder) {
      matchedUserProfile = memoryCustomerProfiles.get(matchedOrder.userId) || null;
      matchedUser = Array.from(memoryUsers.values()).find((u) => u.id === matchedOrder.userId) || null;
    }
  }

  if (matchedOrder) {
    const customerName = matchedUserProfile?.fullName || matchedUser?.name || "Valued Client";
    const companyName = matchedUserProfile?.companyName || undefined;
    const dest = [matchedUserProfile?.city, matchedUserProfile?.state].filter(Boolean).join(", ") || "Ahmedabad, Gujarat, India";
    const status = matchedOrder.status || "received";
    const statusLabel =
      status === "received"
        ? "Order Received"
        : status === "under_review"
        ? "Technical Review"
        : status === "confirmed"
        ? "Order Confirmed"
        : status === "processing"
        ? "Processing & Packaging"
        : status === "packed"
        ? "Packed for Dispatch"
        : status === "dispatched"
        ? "Dispatched from Depot"
        : status === "in_transit"
        ? "In Highway Transit"
        : status === "delivered"
        ? "Delivered to Site"
        : "Order Active";

    const isDispatched = status === "dispatched" || status === "in_transit" || status === "delivered";
    const isDelivered = status === "delivered";
    const isProcessing = status === "processing" || status === "packed" || status === "confirmed";

    const milestones = [
      {
        title: "Order Requisition Logged",
        description: "Purchase order registered with VOLAMP Sourcing Desk.",
        time: matchedOrder.createdAt ? new Date(matchedOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Completed",
        completed: true,
        current: status === "received",
      },
      {
        title: "Technical & Commercial Review",
        description: "Engineering verification of cable specs, voltage ratings, and conductor size.",
        time: isProcessing || isDispatched ? "Verified" : status === "under_review" ? "In Review" : "Pending",
        completed: isProcessing || isDispatched,
        current: status === "under_review",
      },
      {
        title: "Quality Check & MTC Stamping",
        description: "Drum coiling, spark testing, and Mill Test Certificate (MTC) generation.",
        time: isDispatched ? "MTC Approved" : isProcessing ? "In Progress" : "Pending",
        completed: isDispatched,
        current: isProcessing,
      },
      {
        title: "Dispatched from Ahmedabad Depot",
        description: isDispatched
          ? `Handed over to carrier desk (Docket: ${matchedOrder.trackingNumber || "Assigned"}).`
          : "Carrier pickup scheduled at Sanand GIDC Depot.",
        time: isDispatched ? "Dispatched" : "Pending",
        completed: isDispatched,
        current: status === "dispatched" || status === "in_transit",
      },
      {
        title: "Delivered to Project Site",
        description: isDelivered ? "Consignment successfully unloaded at site." : "Site unloading and physical sign-off.",
        time: isDelivered ? "Delivered" : "Estimated upon dispatch",
        completed: isDelivered,
        current: false,
      },
    ];

    return {
      found: true,
      orderNumber: matchedOrder.orderNumber,
      trackingNumber: matchedOrder.trackingNumber || undefined,
      transporter: isDispatched ? "VOLAMP Express Logistics Desk" : "Pending Dispatch Assignment",
      lrNumber: matchedOrder.trackingNumber || (isDispatched ? `LR-GJ-${matchedOrder.orderNumber}` : "LR-PENDING"),
      status: status,
      statusLabel,
      statusDescription: isDispatched
        ? `Consignment for order ${matchedOrder.orderNumber} is in transit to ${dest}.`
        : `Order ${matchedOrder.orderNumber} is currently at VOLAMP Central Depot (Ahmedabad) undergoing ${statusLabel.toLowerCase()}.`,
      customerName,
      companyName,
      origin: "VOLAMP Central Depot, Sanand GIDC, Ahmedabad, Gujarat",
      destination: dest,
      dispatchDate: isDispatched ? "Active Transit" : "Scheduled upon QA clearance",
      estimatedDelivery: isDelivered ? "Delivered" : "24 to 48 hours after dispatch confirmation",
      currentLocation: isDispatched ? "NH-48 Express Transit Corridor" : "VOLAMP Central Depot, Ahmedabad",
      totalWeight: matchedOrder.total ? `Order Total: ₹${matchedOrder.total.toLocaleString("en-IN")}` : "Direct Dispatch",
      invoiceNumber: `INV-${matchedOrder.orderNumber.replace(/\D/g, "") || "2026-001"}`,
      mtcNumber: isDispatched || isProcessing ? `MTC-VOL-${matchedOrder.id}08` : "Under QA",
      items: [
        {
          name: `Verified Order Consignment (${matchedOrder.orderNumber})`,
          quantity: 1,
          unit: "consignment lot",
          spec: "VOLAMP Quality Certified",
        },
      ],
      milestones,
    };
  }

  // 2. Check in Database or In-Memory Quick Orders
  let matchedQuick: any = null;
  if (db) {
    const dbQuick = await db.select().from(quickOrders);
    matchedQuick = dbQuick.find(
      (q) =>
        q.quickOrderId?.toUpperCase() === upperQ ||
        (digitsQ.length >= 6 && q.phone?.replace(/\D/g, "").includes(digitsQ)) ||
        q.customerName?.toUpperCase().includes(upperQ)
    );
  } else {
    matchedQuick = memoryQuickOrders.find(
      (q) =>
        q.quickOrderId?.toUpperCase() === upperQ ||
        (digitsQ.length >= 6 && q.phone?.replace(/\D/g, "").includes(digitsQ)) ||
        q.customerName?.toUpperCase().includes(upperQ)
    );
  }

  if (matchedQuick) {
    let parsedItems: any[] = [];
    try {
      parsedItems = Array.isArray(matchedQuick.items)
        ? matchedQuick.items
        : JSON.parse(matchedQuick.items || "[]");
    } catch {
      parsedItems = [];
    }

    const qStatus = matchedQuick.status || "submitted";
    const qStatusLabel =
      qStatus === "submitted"
        ? "Requisition Submitted"
        : qStatus === "under_review"
        ? "Under Commercial Review"
        : qStatus === "priced"
        ? "Priced & Stock Reserved"
        : qStatus === "quoted"
        ? "Quotation Approved"
        : "Order Completed";

    const isDoneReview = qStatus === "under_review" || qStatus === "priced" || qStatus === "quoted" || qStatus === "closed";
    const isPriced = qStatus === "priced" || qStatus === "quoted" || qStatus === "closed";

    const milestones = [
      {
        title: "Requisition Submitted",
        description: "Quick Order requisition received via portal / WhatsApp desk.",
        time: matchedQuick.createdAt ? new Date(matchedQuick.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Submitted",
        completed: true,
        current: qStatus === "submitted",
      },
      {
        title: "Commercial & Stock Reservation",
        description: "Technical review and inventory hold at Ahmedabad Central Depot.",
        time: isDoneReview ? "Reviewed" : "In Review",
        completed: isDoneReview,
        current: qStatus === "under_review",
      },
      {
        title: "Quality Check & MTC Stamping",
        description: "Coil inspection, packaging, and Mill Test Certificate preparation.",
        time: isPriced ? "MTC Ready" : "Scheduled next",
        completed: isPriced,
        current: qStatus === "priced",
      },
      {
        title: "Freight Dispatch & LR Generation",
        description: "Carrier truck pickup and docket issuance.",
        time: qStatus === "closed" ? "Dispatched" : "Pending dispatch",
        completed: qStatus === "closed",
        current: qStatus === "quoted",
      },
      {
        title: "Delivered to Project Site",
        description: "Scheduled arrival and physical sign-off at project unloading bay.",
        time: "Expected 24-48h post dispatch",
        completed: false,
        current: false,
      },
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
      companyName: matchedQuick.companyName || undefined,
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
        spec: it.spec || "VOLAMP Quality Certified",
      })),
      milestones,
    };
  }

  // 3. Not Found in Database
  return {
    found: false,
    orderNumber: cleanQ,
    status: "received",
    statusLabel: "Order Not Found",
    statusDescription: `No active order or consignment matching "${cleanQ}" was found in our records. Please verify your Order ID or contact our Dispatch Desk on WhatsApp (+91 95123 65582).`,
    origin: "VOLAMP Central Depot, Sanand GIDC, Ahmedabad",
    destination: "India",
    items: [],
    milestones: [],
  };
}

// ---------------------------------------------------------------------------
// Newsletter Subscription
// ---------------------------------------------------------------------------

const memoryNewsletterSubscribers: Array<{ email: string; phone?: string; createdAt: Date }> = [];

export async function subscribeNewsletter(email: string, phone?: string) {
  const cleanEmail = email.trim().toLowerCase();
  const existing = memoryNewsletterSubscribers.find((s) => s.email === cleanEmail);
  if (!existing) {
    memoryNewsletterSubscribers.push({
      email: cleanEmail,
      phone: phone?.trim(),
      createdAt: new Date(),
    });
  }
  return { success: true, email: cleanEmail };
}

// ---------------------------------------------------------------------------
// Collaboration Submissions
// ---------------------------------------------------------------------------

export function generateCollaborateApplicationId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `COL-${year}-${randomNum}`;
}

const memoryCollaborateSubmissions: Array<CollaborateSubmission> = [];

export async function createCollaborateSubmission(data: {
  applicationId?: string;
  companyName: string;
  contactName: string;
  designation: string;
  businessType: string;
  collaborationTypes: string[];
  opportunityDetails: string;
  partnershipStrengths: string[];
  expectedBusinessPotential: string;
  expectedTimeline: string;
  mobile: string;
  email: string;
  cityCountry: string;
  notes?: string | null;
}): Promise<CollaborateSubmission> {
  const applicationId = data.applicationId || generateCollaborateApplicationId();
  const collaborationTypesJson = JSON.stringify(data.collaborationTypes);
  const partnershipStrengthsJson = JSON.stringify(data.partnershipStrengths);
  const now = new Date();

  const record: CollaborateSubmission = {
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
    updatedAt: now,
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

export async function getCollaborateSubmissions(): Promise<CollaborateSubmission[]> {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(collaborateSubmissions);
    } catch {
      // fallback
    }
  }
  return memoryCollaborateSubmissions;
}

export async function getCollaborateSubmissionById(applicationId: string): Promise<CollaborateSubmission | null> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(collaborateSubmissions)
        .where(eq(collaborateSubmissions.applicationId, applicationId))
        .limit(1);
      if (rows[0]) return rows[0];
    } catch {
      // fallback
    }
  }
  return memoryCollaborateSubmissions.find((s) => s.applicationId === applicationId) || null;
}

// ---------------------------------------------------------------------------
// Direct Enquiries / RFQ Desk
// ---------------------------------------------------------------------------

export function generateEnquiryNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ENQ-${year}-${randomNum}`;
}

const memoryEnquiries: Array<Enquiry> = [];

export async function createEnquiry(data: {
  enquiryNumber?: string;
  fullName: string;
  companyName?: string;
  email: string;
  phone: string;
  location?: string;
  category?: string;
  quantity?: string;
  urgency?: string;
  details: string;
}): Promise<Enquiry> {
  const enquiryNumber = data.enquiryNumber || generateEnquiryNumber();
  const now = new Date();
  const record: Enquiry = {
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
    updatedAt: now,
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

export async function getEnquiries(): Promise<Enquiry[]> {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(enquiries);
    } catch {}
  }
  return memoryEnquiries;
}

export async function getEnquiryByNumber(enquiryNumber: string): Promise<Enquiry | null> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(enquiries)
        .where(eq(enquiries.enquiryNumber, enquiryNumber))
        .limit(1);
      if (rows[0]) return rows[0];
    } catch {}
  }
  return memoryEnquiries.find((e) => e.enquiryNumber === enquiryNumber) || null;
}

// ---------------------------------------------------------------------------
// Career Applications & Talent Desk
// ---------------------------------------------------------------------------

export function generateCareerApplicationId(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `VOL-HR-${year}-${randomNum}`;
}

const memoryCareerApplications: Array<CareerApplication> = [];

export async function createCareerApplication(data: {
  applicationId?: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  roleApplied: string;
  department: string;
  experienceYears: string;
  highestQualification: string;
  currentCompany?: string | null;
  currentCtc?: string | null;
  expectedCtc?: string | null;
  noticePeriod: string;
  linkedInUrl?: string | null;
  resumeUrl?: string | null;
  coverNote?: string | null;
}): Promise<CareerApplication> {
  const applicationId = data.applicationId || generateCareerApplicationId();
  const now = new Date();

  const record: CareerApplication = {
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
    updatedAt: now,
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

export async function getCareerApplications(): Promise<CareerApplication[]> {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(careerApplications);
    } catch {}
  }
  return memoryCareerApplications;
}

export async function getCareerApplicationById(applicationId: string): Promise<CareerApplication | null> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(careerApplications)
        .where(eq(careerApplications.applicationId, applicationId))
        .limit(1);
      if (rows[0]) return rows[0];
    } catch {}
  }
  return memoryCareerApplications.find((app) => app.applicationId === applicationId) || null;
}

