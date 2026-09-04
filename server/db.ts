import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { customerDocuments, customerProfiles, orders, quotations, supportTickets, InsertCustomerProfile, InsertUser, users } from "../drizzle/schema";
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  });
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  try { await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet }); }
  catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomerPortal(userId: number) {
  const db = await getDb();
  if (!db) return { profile: undefined, quotations: [], orders: [], documents: [], tickets: [] };
  const [profile, customerQuotes, customerOrders, documents, tickets] = await Promise.all([
    db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1),
    db.select().from(quotations).where(eq(quotations.userId, userId)),
    db.select().from(orders).where(eq(orders.userId, userId)),
    db.select().from(customerDocuments).where(eq(customerDocuments.userId, userId)),
    db.select().from(supportTickets).where(eq(supportTickets.userId, userId)),
  ]);
  return { profile: profile[0], quotations: customerQuotes, orders: customerOrders, documents, tickets };
}

export async function upsertCustomerProfile(userId: number, input: Omit<InsertCustomerProfile, "id" | "userId" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(customerProfiles).values({ userId, ...input }).onDuplicateKeyUpdate({ set: { ...input } });
  const result = await db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1);
  return result[0];
}

export async function createSupportTicket(userId: number, subject: string, lastMessage: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.insert(supportTickets).values({ userId, subject, lastMessage });
  return { id: result[0].insertId, subject, status: "open" as const };
}

export async function createQuotation(userId: number, productName: string, quantity: number, estimatedTotal?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const reference = `VLT-${Date.now().toString(36).toUpperCase()}`;
  const result = await db.insert(quotations).values({ userId, reference, productName, quantity, estimatedTotal });
  return { id: result[0].insertId, reference, productName, quantity, status: "requested" as const, estimatedTotal };
}
