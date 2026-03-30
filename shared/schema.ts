import { z } from "zod";

// --- USERS ---
export const insertUserSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(), // email is sometimes optional depending on usage, but let's keep it as was in original Drizzle schema: notNull() -> string()
  password: z.string(),
  role: z.string().default("sales"),
  status: z.string().default("active"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InsertUser & {
  id: number;
  createdAt: string | Date | null;
  email: string; // Ensure email is guaranteed on User type
};

// --- CUSTOMERS ---
export const insertCustomerSchema = z.object({
  name: z.string(),
  company: z.string(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  whatsapp: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  currency: z.string().default("AED").nullable().optional(),
  paymentTerms: z.string().default("Net 30").nullable().optional(),
  /** Customer TRN / VAT / tax registration number (shown on quotes & invoices) */
  taxNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.string().default("active").nullable().optional(),
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = InsertCustomer & {
  id: number;
  createdAt: string | Date | null;
};

// --- PRODUCTS ---
export const insertProductSchema = z.object({
  name: z.string(),
  sku: z.string(),
  category: z.string(),
  description: z.string().nullable().optional(),
  unit: z.string(), // Standard codes: see shared/product-units.ts (e.g. EA, PC, L, KG)
  /** Cost / purchase from dealer (used for profit; not shown on customer documents as line default) */
  dealerPrice: z.union([z.string(), z.number()]).default("0"),
  /** Customer selling price (used on quotes & invoices when picking this product) */
  price: z.string().or(z.number()),
  taxRate: z.string().or(z.number()).default('5'),
  stock: z.number().default(0),
  status: z.string().default("active").nullable().optional(),
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = InsertProduct & {
  id: number;
  createdAt: string | Date | null;
};

// --- QUOTES ---
export const insertQuoteSchema = z.object({
  quoteNumber: z.string(),
  customerId: z.number(),
  date: z.string(), // YYYY-MM-DD
  expiryDate: z.string(), // YYYY-MM-DD
  subtotal: z.string().or(z.number()),
  totalDiscount: z.string().or(z.number()).default('0'),
  totalVat: z.string().or(z.number()),
  grandTotal: z.string().or(z.number()),
  notes: z.string().nullable().optional(),
  status: z.string().default("Draft").nullable().optional(), 
});

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = InsertQuote & {
  id: number;
  createdAt: string | Date | null;
};

export const insertQuoteItemSchema = z.object({
  productId: z.number(),
  description: z.string().nullable().optional(),
  qty: z.number(),
  unitPrice: z.string().or(z.number()),
  taxRate: z.string().or(z.number()),
  discount: z.string().or(z.number()).optional(),
  lineTotal: z.string().or(z.number())
});

export type InsertQuoteItem = z.infer<typeof insertQuoteItemSchema>;
export type QuoteItem = InsertQuoteItem & {
  id: number;
  quoteId: number;
};
export type QuoteWithItems = Quote & { items: QuoteItem[] };


// --- INVOICES ---
export const insertInvoiceSchema = z.object({
  invoiceNumber: z.string(),
  customerId: z.number(),
  quoteId: z.number().nullable().optional(),
  date: z.string(),
  dueDate: z.string(),
  reference: z.string().nullable().optional(),
  subtotal: z.string().or(z.number()),
  totalDiscount: z.string().or(z.number()).default('0'),
  totalVat: z.string().or(z.number()),
  grandTotal: z.string().or(z.number()),
  notes: z.string().nullable().optional(),
  status: z.string().default("Draft").nullable().optional(), // Draft, Sent, Paid, Partially Paid, Overdue
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = InsertInvoice & {
  id: number;
  createdAt: string | Date | null;
};

export const insertInvoiceItemSchema = z.object({
  productId: z.number(),
  description: z.string().nullable().optional(),
  qty: z.number(),
  unitPrice: z.string().or(z.number()),
  taxRate: z.string().or(z.number()),
  discount: z.string().or(z.number()).optional(),
  lineTotal: z.string().or(z.number())
});

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = InsertInvoiceItem & {
  id: number;
  invoiceId: number;
};

export type InvoiceWithItems = Invoice & { items: InvoiceItem[] };

// --- PAYMENTS ---
export const insertPaymentSchema = z.object({
  invoiceId: z.number(),
  customerId: z.number(),
  date: z.string(),
  amount: z.string().or(z.number()),
  method: z.string(), // Bank Transfer, Cash, Cheque, Online
  reference: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.string().default("Completed").nullable().optional(),
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = InsertPayment & {
  id: number;
  createdAt: string | Date | null;
};

// --- EXPENSES ---
export const insertExpenseSchema = z.object({
  date: z.string(),
  category: z.string(),
  vendor: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  amount: z.string().or(z.number()),
  vatIncluded: z.boolean().default(false).nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  reference: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.string().default("Approved").nullable().optional(), // Pending, Approved, Rejected
});
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = InsertExpense & {
  id: number;
  createdAt: string | Date | null;
};

// --- SETTINGS ---
export const insertSettingsSchema = z.object({
  companyName: z.string().default("TIARA TRADE HOUSE FZ LLC").nullable().optional(),
  address: z.string().default("United Arab Emirates").nullable().optional(),
  phone: z.string().default("054 482 2246").nullable().optional(),
  email: z.string().default("contact@tiaratradehouse.com").nullable().optional(),
  website: z.string().nullable().optional(),
  defaultCurrency: z.string().default("AED").nullable().optional(),
  vatNumber: z.string().nullable().optional(),
  taxRate: z.string().or(z.number()).default('5').nullable().optional(),
  invoicePrefix: z.string().default("INV-").nullable().optional(),
  quotePrefix: z.string().default("QT-").nullable().optional(),
  defaultPaymentTerms: z.string().default("Net 30").nullable().optional(),
  defaultNotes: z.string().nullable().optional(),
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = InsertSettings & {
  id: number;
};
