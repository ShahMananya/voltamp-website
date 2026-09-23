import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
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

export const quickOrders = mysqlTable("quick_orders", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const footprintStates = mysqlTable("footprint_states", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const footprintProjects = mysqlTable("footprint_projects", {
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const products = mysqlTable("products", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type InsertCustomerProfile = typeof customerProfiles.$inferInsert;
export type Quotation = typeof quotations.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type CustomerDocument = typeof customerDocuments.$inferSelect;
export type SupportTicket = typeof supportTickets.$inferSelect;
export type QuickOrder = typeof quickOrders.$inferSelect;
export type InsertQuickOrder = typeof quickOrders.$inferInsert;
export type FootprintStateRecord = typeof footprintStates.$inferSelect;
export type InsertFootprintStateRecord = typeof footprintStates.$inferInsert;
export type FootprintProjectRecord = typeof footprintProjects.$inferSelect;
export type InsertFootprintProjectRecord = typeof footprintProjects.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export interface QuotedProductSnapshot {
  productId: string;
  sku?: string;
  name: string;
  brand: string;
  category?: string;
  specification?: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
  discount?: number;
  tax?: number;
  finalPrice?: number;
  currency?: string;
  timestamp?: string;
}
