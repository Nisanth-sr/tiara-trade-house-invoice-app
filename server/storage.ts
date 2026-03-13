import { supabase } from "./supabase";
import {
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
  getInvoice(id: number): Promise<(Invoice & { items: InvoiceItem[], paidAmount: number, dueAmount: number }) | undefined>;
  getInvoices(): Promise<(Invoice & { customer: Customer, paidAmount: number, dueAmount: number })[]>;
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice & { items: InvoiceItem[] }>;
  updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<void>;

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
    const { data: user } = await supabase.from('users').select('*').eq('id', id).single();
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    return user || undefined;
  }
  
  async getUsers(): Promise<User[]> {
    const { data: users = [] } = await supabase.from('users').select('*');
    return users || [];
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const { data: user, error } = await supabase.from('users').insert(insertUser).select().single();
    if (error) throw error;
    return user;
  }
  
  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const { data: user, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error && error.code !== 'PGRST116') throw error;
    return user || undefined;
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const { data: customer } = await supabase.from('customers').select('*').eq('id', id).single();
    return customer || undefined;
  }
  
  async getCustomers(): Promise<Customer[]> {
    const { data: customers = [] } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    return customers || [];
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const payload = {
        name: customer.name,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        whatsapp: customer.whatsapp,
        address: customer.address,
        country: customer.country,
        currency: customer.currency,
        payment_terms: customer.paymentTerms,
        notes: customer.notes,
        status: customer.status
    };
    const { data: newCustomer, error } = await supabase.from('customers').insert(payload).select().single();
    if (error) throw error;
    return {
        ...newCustomer,
        paymentTerms: newCustomer.payment_terms,
        createdAt: newCustomer.created_at
    };
  }
  
  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.company !== undefined) payload.company = updates.company;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.whatsapp !== undefined) payload.whatsapp = updates.whatsapp;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.country !== undefined) payload.country = updates.country;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.paymentTerms !== undefined) payload.payment_terms = updates.paymentTerms;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.status !== undefined) payload.status = updates.status;
    const { data: updated, error } = await supabase.from('customers').update(payload).eq('id', id).select().single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!updated) return undefined;
    return {
        ...updated,
        paymentTerms: updated.payment_terms,
        createdAt: updated.created_at
    };
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
    return product || undefined;
  }
  
  async getProducts(): Promise<Product[]> {
    const { data: products = [] } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    return products || [];
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const payload = {
        name: product.name,
        sku: product.sku,
        category: product.category,
        description: product.description,
        unit: product.unit,
        price: product.price,
        tax_rate: product.taxRate,
        stock: product.stock,
        status: product.status
    };
    const { data: newProduct, error } = await supabase.from('products').insert(payload).select().single();
    if (error) throw error;
    return {
        ...newProduct,
        taxRate: newProduct.tax_rate,
        createdAt: newProduct.created_at
    };
  }
  
  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.sku !== undefined) payload.sku = updates.sku;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.unit !== undefined) payload.unit = updates.unit;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.taxRate !== undefined) payload.tax_rate = updates.taxRate;
    if (updates.stock !== undefined) payload.stock = updates.stock;
    if (updates.status !== undefined) payload.status = updates.status;
    const { data: updated, error } = await supabase.from('products').update(payload).eq('id', id).select().single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!updated) return undefined;
    return {
        ...updated,
        taxRate: updated.tax_rate,
        createdAt: updated.created_at
    };
  }

  async getQuote(id: number): Promise<(Quote & { items: QuoteItem[] }) | undefined> {
    const { data: quote } = await supabase.from('quotes').select('*').eq('id', id).single();
    if (!quote) return undefined;
    
    // Convert snake_case to camelCase
    const mappedQuote = {
        ...quote,
        quoteNumber: quote.quote_number,
        customerId: quote.customer_id,
        expiryDate: quote.expiry_date,
        totalDiscount: quote.total_discount,
        totalVat: quote.total_vat,
        grandTotal: quote.grand_total,
        createdAt: quote.created_at
    };
    
    const { data: items = [] } = await supabase.from('quote_items').select('*').eq('quote_id', id);
    const mappedItems = items?.map((i: any) => ({
       ...i,
       quoteId: i.quote_id,
       productId: i.product_id,
       unitPrice: i.unit_price,
       taxRate: i.tax_rate,
       lineTotal: i.line_total
    })) || [];
    
    return { ...mappedQuote, items: mappedItems };
  }
  
  async getQuotes(): Promise<(Quote & { customer: Customer })[]> {
    const { data: quotes = [] } = await supabase.from('quotes').select('*, customers(*)').order('created_at', { ascending: false });
    
    return (quotes || []).map((q: any) => {
        const mappedQuote = {
            ...q,
            quoteNumber: q.quote_number,
            customerId: q.customer_id,
            expiryDate: q.expiry_date,
            totalDiscount: q.total_discount,
            totalVat: q.total_vat,
            grandTotal: q.grand_total,
            createdAt: q.created_at
        };
        const customer = q.customers;
        delete mappedQuote.customers;
        return {
            ...mappedQuote,
            customer
        };
    });
  }
  
  async createQuote(quote: InsertQuote, items: InsertQuoteItem[]): Promise<Quote & { items: QuoteItem[] }> {
    const quotePayload = {
        quote_number: quote.quoteNumber,
        customer_id: quote.customerId,
        date: quote.date,
        expiry_date: quote.expiryDate,
        subtotal: quote.subtotal,
        total_discount: quote.totalDiscount,
        total_vat: quote.totalVat,
        grand_total: quote.grandTotal,
        notes: quote.notes,
        status: quote.status
    };
    
    const { data: newQuote, error: quoteError } = await supabase.from('quotes').insert(quotePayload).select().single();
    if (quoteError) throw quoteError;
    
    const mappedQuote = {
        ...newQuote,
        quoteNumber: newQuote.quote_number,
        customerId: newQuote.customer_id,
        expiryDate: newQuote.expiry_date,
        totalDiscount: newQuote.total_discount,
        totalVat: newQuote.total_vat,
        grandTotal: newQuote.grand_total,
        createdAt: newQuote.created_at
    };

    const itemsPayload = items.map(item => ({
        quote_id: newQuote.id,
        product_id: item.productId,
        description: item.description,
        qty: item.qty,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate,
        discount: item.discount,
        line_total: item.lineTotal
    }));
    
    const { data: newItems, error: itemsError } = await supabase.from('quote_items').insert(itemsPayload).select();
    if (itemsError) throw itemsError;
    
    // Decrement product stock
    for (const item of items) {
       const product = await this.getProduct(item.productId);
       if (product) {
         const newStock = Math.max(0, (product.stock || 0) - item.qty);
         await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
       }
    }
    
    const mappedItems = (newItems || []).map((i: any) => ({
       ...i,
       quoteId: i.quote_id,
       productId: i.product_id,
       unitPrice: i.unit_price,
       taxRate: i.tax_rate,
       lineTotal: i.line_total
    }));

    return { ...mappedQuote, items: mappedItems };
  }
  
  async updateQuote(id: number, updates: Partial<InsertQuote>): Promise<Quote | undefined> {
    const updatePayload: any = {};
    if (updates.quoteNumber !== undefined) updatePayload.quote_number = updates.quoteNumber;
    if (updates.customerId !== undefined) updatePayload.customer_id = updates.customerId;
    if (updates.date !== undefined) updatePayload.date = updates.date;
    if (updates.expiryDate !== undefined) updatePayload.expiry_date = updates.expiryDate;
    if (updates.subtotal !== undefined) updatePayload.subtotal = updates.subtotal;
    if (updates.totalDiscount !== undefined) updatePayload.total_discount = updates.totalDiscount;
    if (updates.totalVat !== undefined) updatePayload.total_vat = updates.totalVat;
    if (updates.grandTotal !== undefined) updatePayload.grand_total = updates.grandTotal;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes;
    if (updates.status !== undefined) updatePayload.status = updates.status;
    
    const { data: updated, error } = await supabase.from('quotes').update(updatePayload).eq('id', id).select().single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!updated) return undefined;
    
    return {
        ...updated,
        quoteNumber: updated.quote_number,
        customerId: updated.customer_id,
        expiryDate: updated.expiry_date,
        totalDiscount: updated.total_discount,
        totalVat: updated.total_vat,
        grandTotal: updated.grand_total,
        createdAt: updated.created_at
    };
  }

  async getInvoice(id: number): Promise<(Invoice & { items: InvoiceItem[], paidAmount: number, dueAmount: number }) | undefined> {
    const { data: invoice } = await supabase.from('invoices').select('*').eq('id', id).single();
    if (!invoice) return undefined;
    
    const mappedInvoice = {
        ...invoice,
        invoiceNumber: invoice.invoice_number,
        customerId: invoice.customer_id,
        quoteId: invoice.quote_id,
        dueDate: invoice.due_date,
        totalDiscount: invoice.total_discount,
        totalVat: invoice.total_vat,
        grandTotal: invoice.grand_total,
        createdAt: invoice.created_at
    };

    const { data: items = [] } = await supabase.from('invoice_items').select('*').eq('invoice_id', id);
    const mappedItems = items?.map((i: any) => ({
       ...i,
       invoiceId: i.invoice_id,
       productId: i.product_id,
       unitPrice: i.unit_price,
       taxRate: i.tax_rate,
       lineTotal: i.line_total
    })) || [];
    
    const { data: invoicePayments = [] } = await supabase.from('payments').select('amount').eq('invoice_id', id);
    const paidAmount = (invoicePayments || []).reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
    const dueAmount = parseFloat(invoice.grand_total) - paidAmount;

    return { ...mappedInvoice, items: mappedItems, paidAmount, dueAmount: Math.max(0, dueAmount) };
  }
  
  async getInvoices(): Promise<(Invoice & { customer: Customer, paidAmount: number, dueAmount: number })[]> {
    const { data: invoices = [] } = await supabase.from('invoices').select('*, customers(*), payments(amount)').order('created_at', { ascending: false });

    return (invoices || []).map((i: any) => {
      const invoicePayments = i.payments || [];
      const paidAmount = invoicePayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
      const dueAmount = parseFloat(i.grand_total) - paidAmount;

      const mappedInvoice = {
        ...i,
        invoiceNumber: i.invoice_number,
        customerId: i.customer_id,
        quoteId: i.quote_id,
        dueDate: i.due_date,
        totalDiscount: i.total_discount,
        totalVat: i.total_vat,
        grandTotal: i.grand_total,
        createdAt: i.created_at
      };
      
      const customer = i.customers;
      delete mappedInvoice.customers;
      delete mappedInvoice.payments;

      return {
        ...mappedInvoice,
        customer,
        paidAmount,
        dueAmount: Math.max(0, dueAmount)
      };
    });
  }
  
  async createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice & { items: InvoiceItem[] }> {
    const invoicePayload = {
        invoice_number: invoice.invoiceNumber,
        customer_id: invoice.customerId,
        quote_id: invoice.quoteId,
        date: invoice.date,
        due_date: invoice.dueDate,
        reference: invoice.reference,
        subtotal: invoice.subtotal,
        total_discount: invoice.totalDiscount,
        total_vat: invoice.totalVat,
        grand_total: invoice.grandTotal,
        notes: invoice.notes,
        status: invoice.status
    };
    
    const { data: newInvoice, error: invoiceError } = await supabase.from('invoices').insert(invoicePayload).select().single();
    if (invoiceError) throw invoiceError;
    
    const mappedInvoice = {
        ...newInvoice,
        invoiceNumber: newInvoice.invoice_number,
        customerId: newInvoice.customer_id,
        quoteId: newInvoice.quote_id,
        dueDate: newInvoice.due_date,
        totalDiscount: newInvoice.total_discount,
        totalVat: newInvoice.total_vat,
        grandTotal: newInvoice.grand_total,
        createdAt: newInvoice.created_at
    };

    if (newInvoice.quote_id) {
      await supabase.from('quotes').update({ status: "Accepted" }).eq('id', newInvoice.quote_id);
    }
    
    const itemsPayload = items.map(item => ({
        invoice_id: newInvoice.id,
        product_id: item.productId,
        description: item.description,
        qty: item.qty,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate,
        discount: item.discount,
        line_total: item.lineTotal
    }));

    const { data: newItems, error: itemsError } = await supabase.from('invoice_items').insert(itemsPayload).select();
    if (itemsError) throw itemsError;
    
    const mappedItems = (newItems || []).map((i: any) => ({
       ...i,
       invoiceId: i.invoice_id,
       productId: i.product_id,
       unitPrice: i.unit_price,
       taxRate: i.tax_rate,
       lineTotal: i.line_total
    }));

    for (const item of items) {
       const product = await this.getProduct(item.productId);
       if (product) {
         const newStock = Math.max(0, (product.stock || 0) - item.qty);
         await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
       }
    }
    
    return { ...mappedInvoice, items: mappedItems };
  }
  
  async updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const updatePayload: any = {};
    if (updates.invoiceNumber !== undefined) updatePayload.invoice_number = updates.invoiceNumber;
    if (updates.customerId !== undefined) updatePayload.customer_id = updates.customerId;
    if (updates.quoteId !== undefined) updatePayload.quote_id = updates.quoteId;
    if (updates.date !== undefined) updatePayload.date = updates.date;
    if (updates.dueDate !== undefined) updatePayload.due_date = updates.dueDate;
    if (updates.reference !== undefined) updatePayload.reference = updates.reference;
    if (updates.subtotal !== undefined) updatePayload.subtotal = updates.subtotal;
    if (updates.totalDiscount !== undefined) updatePayload.total_discount = updates.totalDiscount;
    if (updates.totalVat !== undefined) updatePayload.total_vat = updates.totalVat;
    if (updates.grandTotal !== undefined) updatePayload.grand_total = updates.grandTotal;
    if (updates.notes !== undefined) updatePayload.notes = updates.notes;
    if (updates.status !== undefined) updatePayload.status = updates.status;

    const { data: updated, error } = await supabase.from('invoices').update(updatePayload).eq('id', id).select().single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!updated) return undefined;
    
    if (updated.quote_id && updates.status) {
      const quoteStatus = updates.status === "Paid" ? "Accepted" : "Accepted";
      await supabase.from('quotes').update({ status: quoteStatus }).eq('id', updated.quote_id);
    }
    
    return {
        ...updated,
        invoiceNumber: updated.invoice_number,
        customerId: updated.customer_id,
        quoteId: updated.quote_id,
        dueDate: updated.due_date,
        totalDiscount: updated.total_discount,
        totalVat: updated.total_vat,
        grandTotal: updated.grand_total,
        createdAt: updated.created_at
    };
  }

  async deleteInvoice(id: number): Promise<void> {
     await supabase.from('invoice_items').delete().eq('invoice_id', id);
     await supabase.from('payments').delete().eq('invoice_id', id);
     await supabase.from('invoices').delete().eq('id', id);
  }

  async getPayments(): Promise<(Payment & { invoice: Invoice, customer: Customer })[]> {
    const { data: payments = [] } = await supabase.from('payments').select('*, invoices(*), customers(*)').order('created_at', { ascending: false });
    
    return (payments || []).map((p: any) => {
        const mappedPayment = {
            ...p,
            invoiceId: p.invoice_id,
            customerId: p.customer_id,
            createdAt: p.created_at
        };
        const invoice = {
            ...p.invoices,
            invoiceNumber: p.invoices.invoice_number,
            customerId: p.invoices.customer_id,
            quoteId: p.invoices.quote_id,
            dueDate: p.invoices.due_date,
            totalDiscount: p.invoices.total_discount,
            totalVat: p.invoices.total_vat,
            grandTotal: p.invoices.grand_total,
            createdAt: p.invoices.created_at
        };
        const customer = p.customers;
        delete mappedPayment.invoices;
        delete mappedPayment.customers;
        
        return {
            ...mappedPayment,
            invoice,
            customer
        };
    });
  }
  
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const paymentPayload = {
        invoice_id: payment.invoiceId,
        customer_id: payment.customerId,
        date: payment.date,
        amount: payment.amount,
        method: payment.method,
        reference: payment.reference,
        notes: payment.notes,
        status: payment.status
    };
    const { data: newPayment, error } = await supabase.from('payments').insert(paymentPayload).select().single();
    if (error) throw error;
    
    const mappedPayment = {
        ...newPayment,
        invoiceId: newPayment.invoice_id,
        customerId: newPayment.customer_id,
        createdAt: newPayment.created_at
    };

    const invoice = await this.getInvoice(payment.invoiceId);
    if (invoice) {
      const { data: allPayments = [] } = await supabase.from('payments').select('amount').eq('invoice_id', payment.invoiceId);
      const totalPaid = (allPayments || []).reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
      const invoiceGrandTotal = parseFloat(invoice.grandTotal as unknown as string);
      
      let newStatus = "Draft";
      if (totalPaid >= invoiceGrandTotal) {
        newStatus = "Paid";
      } else if (totalPaid > 0) {
        newStatus = "Partially Paid";
      }
      
      await supabase.from('invoices').update({ status: newStatus }).eq('id', payment.invoiceId);
    }
    
    return mappedPayment;
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const { data: expense } = await supabase.from('expenses').select('*').eq('id', id).single();
    if (!expense) return undefined;
    return {
        ...expense,
        vatIncluded: expense.vat_included,
        paymentMethod: expense.payment_method,
        createdAt: expense.created_at
    };
  }
  
  async getExpenses(): Promise<Expense[]> {
    const { data: expenses = [] } = await supabase.from('expenses').select('*').order('created_at', { ascending: false });
    return (expenses || []).map((e: any) => ({
        ...e,
        vatIncluded: e.vat_included,
        paymentMethod: e.payment_method,
        createdAt: e.created_at
    }));
  }
  
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const payload = {
        date: expense.date,
        category: expense.category,
        vendor: expense.vendor,
        description: expense.description,
        amount: expense.amount,
        vat_included: expense.vatIncluded,
        payment_method: expense.paymentMethod,
        reference: expense.reference,
        notes: expense.notes,
        status: expense.status
    };
    const { data: newExpense, error } = await supabase.from('expenses').insert(payload).select().single();
    if (error) throw error;
    return {
        ...newExpense,
        vatIncluded: newExpense.vat_included,
        paymentMethod: newExpense.payment_method,
        createdAt: newExpense.created_at
    };
  }
  
  async updateExpense(id: number, updates: Partial<InsertExpense>): Promise<Expense | undefined> {
    const payload: any = {};
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.vendor !== undefined) payload.vendor = updates.vendor;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.amount !== undefined) payload.amount = updates.amount;
    if (updates.vatIncluded !== undefined) payload.vat_included = updates.vatIncluded;
    if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
    if (updates.reference !== undefined) payload.reference = updates.reference;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data: updated, error } = await supabase.from('expenses').update(payload).eq('id', id).select().single();
    if (error && error.code !== 'PGRST116') throw error;
    if (!updated) return undefined;
    return {
        ...updated,
        vatIncluded: updated.vat_included,
        paymentMethod: updated.payment_method,
        createdAt: updated.created_at
    };
  }

  async getSettings(): Promise<Settings> {
    let { data: setting } = await supabase.from('settings').select('*').limit(1).single();
    if (!setting) {
      const { data: newSetting, error } = await supabase.from('settings').insert({}).select().single();
      if (error) throw error;
      setting = newSetting;
    }
    return {
        ...setting,
        companyName: setting.company_name,
        defaultCurrency: setting.default_currency,
        vatNumber: setting.vat_number,
        taxRate: setting.tax_rate,
        invoicePrefix: setting.invoice_prefix,
        quotePrefix: setting.quote_prefix,
        defaultPaymentTerms: setting.default_payment_terms,
        defaultNotes: setting.default_notes
    };
  }
  
  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    const current = await this.getSettings();
    const payload: any = {};
    if (updates.companyName !== undefined) payload.company_name = updates.companyName;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.website !== undefined) payload.website = updates.website;
    if (updates.defaultCurrency !== undefined) payload.default_currency = updates.defaultCurrency;
    if (updates.vatNumber !== undefined) payload.vat_number = updates.vatNumber;
    if (updates.taxRate !== undefined) payload.tax_rate = updates.taxRate;
    if (updates.invoicePrefix !== undefined) payload.invoice_prefix = updates.invoicePrefix;
    if (updates.quotePrefix !== undefined) payload.quote_prefix = updates.quotePrefix;
    if (updates.defaultPaymentTerms !== undefined) payload.default_payment_terms = updates.defaultPaymentTerms;
    if (updates.defaultNotes !== undefined) payload.default_notes = updates.defaultNotes;

    const { data: updated, error } = await supabase.from('settings').update(payload).eq('id', current.id).select().single();
    if (error) throw error;
    return {
        ...updated,
        companyName: updated.company_name,
        defaultCurrency: updated.default_currency,
        vatNumber: updated.vat_number,
        taxRate: updated.tax_rate,
        invoicePrefix: updated.invoice_prefix,
        quotePrefix: updated.quote_prefix,
        defaultPaymentTerms: updated.default_payment_terms,
        defaultNotes: updated.default_notes
    };
  }
}

export const storage = new DatabaseStorage();
