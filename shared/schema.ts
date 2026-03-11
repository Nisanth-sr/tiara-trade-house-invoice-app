import { pgTable, text, serial, integer, boolean, timestamp, numeric, date, uuid, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- USERS ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("sales"), // 'admin' or 'sales'
  status: text("status").notNull().default("active"), // 'active' or 'inactive'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// --- CUSTOMERS ---
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  country: text("country"),
  currency: text("currency").default("AED"),
  paymentTerms: text("payment_terms").default("Net 30"),
  notes: text("notes"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

// --- PRODUCTS ---
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  unit: text("unit").notNull(), // Pcs, Ltr, Kg, Box, Set
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default('5'),
  stock: integer("stock").default(0),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// --- QUOTES ---
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteNumber: text("quote_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
  expiryDate: text("expiry_date").notNull(), // YYYY-MM-DD
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  totalDiscount: numeric("total_discount", { precision: 12, scale: 2 }).default('0'),
  totalVat: numeric("total_vat", { precision: 12, scale: 2 }).notNull(),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  status: text("status").default("Draft"), // Draft, Sent, Accepted, Declined, Expired
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true, createdAt: true });
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;

export const quoteItems = pgTable("quote_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").notNull(),
  productId: integer("product_id").notNull(),
  description: text("description"),
  qty: integer("qty").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default('5'),
  discount: numeric("discount", { precision: 5, scale: 2 }).default('0'),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
});

export const insertQuoteItemSchema = createInsertSchema(quoteItems).omit({ id: true }).extend({
  unitPrice: z.string(),
  taxRate: z.string(),
  discount: z.string().optional(),
  lineTotal: z.string()
});
export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = z.infer<typeof insertQuoteItemSchema>;

export type QuoteWithItems = Quote & { items: QuoteItem[] };

// --- INVOICES ---
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerId: integer("customer_id").notNull(),
  date: text("date").notNull(),
  dueDate: text("due_date").notNull(),
  reference: text("reference"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
  totalDiscount: numeric("total_discount", { precision: 12, scale: 2 }).default('0'),
  totalVat: numeric("total_vat", { precision: 12, scale: 2 }).notNull(),
  grandTotal: numeric("grand_total", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  status: text("status").default("Draft"), // Draft, Sent, Paid, Partially Paid, Overdue
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  productId: integer("product_id").notNull(),
  description: text("description"),
  qty: integer("qty").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default('5'),
  discount: numeric("discount", { precision: 5, scale: 2 }).default('0'),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true, invoiceId: true }).extend({
  unitPrice: z.string(),
  taxRate: z.string(),
  discount: z.string().optional(),
  lineTotal: z.string()
});
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

export type InvoiceWithItems = Invoice & { items: InvoiceItem[] };

// --- PAYMENTS ---
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  customerId: integer("customer_id").notNull(),
  date: text("date").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: text("method").notNull(), // Bank Transfer, Cash, Cheque, Online
  reference: text("reference"),
  notes: text("notes"),
  status: text("status").default("Completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// --- EXPENSES ---
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  category: text("category").notNull(),
  vendor: text("vendor"),
  description: text("description"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  vatIncluded: boolean("vat_included").default(false),
  paymentMethod: text("payment_method"),
  reference: text("reference"),
  notes: text("notes"),
  status: text("status").default("Approved"), // Pending, Approved, Rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

// --- SETTINGS ---
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").default("TIARA TRADE HOUSE FZ LLC"),
  address: text("address").default("United Arab Emirates"),
  phone: text("phone").default("054 482 2246"),
  email: text("email").default("contact@tiaratradehouse.com"),
  website: text("website"),
  defaultCurrency: text("default_currency").default("AED"),
  vatNumber: text("vat_number"),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default('5'),
  invoicePrefix: text("invoice_prefix").default("INV-"),
  quotePrefix: text("quote_prefix").default("QT-"),
  defaultPaymentTerms: text("default_payment_terms").default("Net 30"),
  defaultNotes: text("default_notes"),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
