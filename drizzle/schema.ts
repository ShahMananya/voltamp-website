import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const customerProfiles = mysqlTable("customer_profiles", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const quotations = mysqlTable("quotations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reference: varchar("reference", { length: 40 }).notNull().unique(),
  productName: varchar("productName", { length: 180 }).notNull(),
  quantity: int("quantity").notNull(),
  status: mysqlEnum("status", ["requested", "under_review", "quoted", "approved", "closed"]).default("requested").notNull(),
  estimatedTotal: int("estimatedTotal"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  orderNumber: varchar("orderNumber", { length: 40 }).notNull().unique(),
  status: mysqlEnum("status", ["received", "under_review", "confirmed", "processing", "packed", "dispatched", "in_transit", "delivered", "completed"]).default("received").notNull(),
  trackingNumber: varchar("trackingNumber", { length: 80 }),
  total: int("total"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const customerDocuments = mysqlTable("customer_documents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  kind: varchar("kind", { length: 60 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const supportTickets = mysqlTable("support_tickets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 180 }).notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved"]).default("open").notNull(),
  lastMessage: text("lastMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type InsertCustomerProfile = typeof customerProfiles.$inferInsert;
export type Quotation = typeof quotations.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type CustomerDocument = typeof customerDocuments.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
