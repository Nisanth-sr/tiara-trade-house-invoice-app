import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import {
  users, customers, products, quotes, quoteItems, invoices, invoiceItems, payments, expenses, settings,
  type User, type InsertUser,
  type Customer, type InsertCustomer,
  type Product, type InsertProduct,
  type Quote, type InsertQuote, type QuoteItem, type InsertQuoteItem,
  type Invoice, type InsertInvoice, type InvoiceItem, type InsertInvoiceItem,
  type Payment, type InsertPayment,
  type Expense, type InsertExpense,
  type Settings, type InsertSettings
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Customers
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined>;

  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;

  // Quotes
  getQuote(id: number): Promise<(Quote & { items: QuoteItem[] }) | undefined>;
  getQuotes(): Promise<(Quote & { customer: Customer })[]>;
  createQuote(quote: InsertQuote, items: InsertQuoteItem[]): Promise<Quote & { items: QuoteItem[] }>;
  updateQuote(id: number, updates: Partial<InsertQuote>): Promise<Quote | undefined>;

  // Invoices
  getInvoice(id: number): Promise<(Invoice & { items: InvoiceItem[] }) | undefined>;
  getInvoices(): Promise<(Invoice & { customer: Customer })[]>;
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice & { items: InvoiceItem[] }>;
  updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined>;

  // Payments
  getPayments(): Promise<(Payment & { invoice: Invoice, customer: Customer })[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Expenses
  getExpense(id: number): Promise<Expense | undefined>;
  getExpenses(): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense | undefined>;

  // Settings
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<InsertSettings>): Promise<Settings>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }
  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();
    return updated;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }
  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }
  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return updated;
  }

  async getQuote(id: number): Promise<(Quote & { items: QuoteItem[] }) | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    if (!quote) return undefined;
    const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, id));
    return { ...quote, items };
  }
  async getQuotes(): Promise<(Quote & { customer: Customer })[]> {
    const allQuotes = await db.select().from(quotes).orderBy(desc(quotes.createdAt));
    const allCustomers = await this.getCustomers();
    return allQuotes.map(q => ({
      ...q,
      customer: allCustomers.find(c => c.id === q.customerId)!
    }));
  }
  async createQuote(quote: InsertQuote, items: InsertQuoteItem[]): Promise<Quote & { items: QuoteItem[] }> {
    const [newQuote] = await db.insert(quotes).values(quote).returning();
    const newItems = await Promise.all(items.map(async (item) => {
      const [newItem] = await db.insert(quoteItems).values({ ...item, quoteId: newQuote.id }).returning();
      // Decrement product stock
      const product = await this.getProduct(item.productId);
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - item.qty);
        await db.update(products).set({ stock: newStock }).where(eq(products.id, item.productId));
      }
      return newItem;
    }));
    return { ...newQuote, items: newItems };
  }
  async updateQuote(id: number, updates: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updated] = await db.update(quotes).set(updates).where(eq(quotes.id, id)).returning();
    return updated;
  }

  async getInvoice(id: number): Promise<(Invoice & { items: InvoiceItem[] }) | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    return { ...invoice, items };
  }
  async getInvoices(): Promise<(Invoice & { customer: Customer })[]> {
    const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.createdAt));
    const allCustomers = await this.getCustomers();
    return allInvoices.map(i => ({
      ...i,
      customer: allCustomers.find(c => c.id === i.customerId)!
    }));
  }
  async createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice & { items: InvoiceItem[] }> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    
    // Update quote status to "Accepted" if invoice is created from a quote
    if (newInvoice.quoteId) {
      await db.update(quotes).set({ status: "Accepted" }).where(eq(quotes.id, newInvoice.quoteId));
    }
    
    const newItems = await Promise.all(items.map(async (item) => {
      const [newItem] = await db.insert(invoiceItems).values({ ...item, invoiceId: newInvoice.id }).returning();
      // Decrement product stock
      const product = await this.getProduct(item.productId);
      if (product) {
        const newStock = Math.max(0, (product.stock || 0) - item.qty);
        await db.update(products).set({ stock: newStock }).where(eq(products.id, item.productId));
      }
      return newItem;
    }));
    return { ...newInvoice, items: newItems };
  }
  async updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updated] = await db.update(invoices).set(updates).where(eq(invoices.id, id)).returning();
    
    // If status changes, update the related quote status
    if (updated && updated.quoteId && updates.status) {
      const quoteStatus = updates.status === "Paid" ? "Accepted" : "Accepted";
      await db.update(quotes).set({ status: quoteStatus }).where(eq(quotes.id, updated.quoteId));
    }
    
    return updated;
  }

  async getPayments(): Promise<(Payment & { invoice: Invoice, customer: Customer })[]> {
    const allPayments = await db.select().from(payments).orderBy(desc(payments.createdAt));
    const allInvoices = await db.select().from(invoices);
    const allCustomers = await this.getCustomers();
    
    return allPayments.map(p => ({
      ...p,
      invoice: allInvoices.find(i => i.id === p.invoiceId)!,
      customer: allCustomers.find(c => c.id === p.customerId)!
    }));
  }
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    
    // Update invoice status based on total payments
    const invoice = await this.getInvoice(payment.invoiceId);
    if (invoice) {
      const allPayments = await db.select().from(payments).where(eq(payments.invoiceId, payment.invoiceId));
      const totalPaid = allPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const invoiceGrandTotal = parseFloat(invoice.grandTotal);
      
      let newStatus = "Draft";
      if (totalPaid >= invoiceGrandTotal) {
        newStatus = "Paid";
      } else if (totalPaid > 0) {
        newStatus = "Partially Paid";
      }
      
      await db.update(invoices).set({ status: newStatus }).where(eq(invoices.id, payment.invoiceId));
    }
    
    return newPayment;
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.createdAt));
  }
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }
  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updated] = await db.update(expenses).set(updates).where(eq(expenses.id, id)).returning();
    return updated;
  }

  async getSettings(): Promise<Settings> {
    let [setting] = await db.select().from(settings).limit(1);
    if (!setting) {
      [setting] = await db.insert(settings).values({}).returning();
    }
    return setting;
  }
  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    const current = await this.getSettings();
    const [updated] = await db.update(settings).set(updates).where(eq(settings.id, current.id)).returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
