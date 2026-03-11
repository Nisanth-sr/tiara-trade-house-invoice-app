import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Auth
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      req.session!.userId = user.id;
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session!.destroy((err) => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not logged in" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not logged in" });
    }
    res.json(user);
  });

  // Dashboard Stats
  app.get(api.dashboard.stats.path, async (req, res) => {
    const invoices = await storage.getInvoices();
    const expenses = await storage.getExpenses();
    const customers = await storage.getCustomers();
    const payments = await storage.getPayments();

    const revenue = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + Number(curr.grandTotal), 0);
    const outstanding = invoices.filter(i => i.status !== 'Paid' && i.status !== 'Draft').reduce((acc, curr) => acc + Number(curr.grandTotal), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const activeCustomers = customers.filter(c => c.status === 'active').length;

    // mock monthly data
    const monthlyRevenue = [
      { name: 'Jan', revenue: 4000, expenses: 2400 },
      { name: 'Feb', revenue: 3000, expenses: 1398 },
      { name: 'Mar', revenue: 2000, expenses: 9800 },
      { name: 'Apr', revenue: 2780, expenses: 3908 },
      { name: 'May', revenue: 1890, expenses: 4800 },
      { name: 'Jun', revenue: 2390, expenses: 3800 },
    ];

    const invoiceStatus = [
      { name: 'Paid', value: invoices.filter(i => i.status === 'Paid').length },
      { name: 'Unpaid', value: invoices.filter(i => i.status === 'Sent').length },
      { name: 'Overdue', value: invoices.filter(i => i.status === 'Overdue').length },
      { name: 'Draft', value: invoices.filter(i => i.status === 'Draft').length },
    ];

    res.json({
      revenue,
      outstanding,
      expenses: totalExpenses,
      activeCustomers,
      monthlyRevenue,
      invoiceStatus,
      recentPayments: payments.slice(0, 5).map(p => ({ date: p.date, amount: Number(p.amount) })),
      recentInvoices: invoices.slice(0, 5),
      topCustomers: customers.slice(0, 5), // simplified
      overdueInvoices: invoices.filter(i => i.status === 'Overdue')
    });
  });

  // Users
  app.get(api.users.list.path, async (req, res) => {
    res.json(await storage.getUsers());
  });
  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.put(api.users.update.path, async (req, res) => {
    try {
      const input = api.users.update.input.parse(req.body);
      const user = await storage.updateUser(Number(req.params.id), input);
      if (!user) return res.status(404).json({ message: "Not found" });
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Customers
  app.get(api.customers.list.path, async (req, res) => {
    res.json(await storage.getCustomers());
  });
  app.get(api.customers.get.path, async (req, res) => {
    const customer = await storage.getCustomer(Number(req.params.id));
    if (!customer) return res.status(404).json({ message: "Not found" });
    res.json(customer);
  });
  app.post(api.customers.create.path, async (req, res) => {
    try {
      const input = api.customers.create.input.parse(req.body);
      const customer = await storage.createCustomer(input);
      res.status(201).json(customer);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.put(api.customers.update.path, async (req, res) => {
    try {
      const input = api.customers.update.input.parse(req.body);
      const customer = await storage.updateCustomer(Number(req.params.id), input);
      if (!customer) return res.status(404).json({ message: "Not found" });
      res.json(customer);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    res.json(await storage.getProducts());
  });
  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.put(api.products.update.path, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) return res.status(404).json({ message: "Not found" });
      res.json(product);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Quotes
  app.get(api.quotes.list.path, async (req, res) => {
    res.json(await storage.getQuotes());
  });
  app.get(api.quotes.get.path, async (req, res) => {
    const quote = await storage.getQuote(Number(req.params.id));
    if (!quote) return res.status(404).json({ message: "Not found" });
    res.json(quote);
  });
  app.post(api.quotes.create.path, async (req, res) => {
    try {
      const { items, ...quoteData } = api.quotes.create.input.parse(req.body);
      const quote = await storage.createQuote(quoteData, items);
      res.status(201).json(quote);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.put(api.quotes.update.path, async (req, res) => {
    try {
      const { items, ...quoteData } = api.quotes.update.input.parse(req.body);
      const quote = await storage.updateQuote(Number(req.params.id), quoteData);
      if (!quote) return res.status(404).json({ message: "Not found" });
      res.json(quote);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Invoices
  app.get(api.invoices.list.path, async (req, res) => {
    res.json(await storage.getInvoices());
  });
  app.get(api.invoices.get.path, async (req, res) => {
    const invoice = await storage.getInvoice(Number(req.params.id));
    if (!invoice) return res.status(404).json({ message: "Not found" });
    res.json(invoice);
  });
  app.post(api.invoices.create.path, async (req, res) => {
    try {
      const { items, ...invoiceData } = api.invoices.create.input.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData, items);
      res.status(201).json(invoice);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.put(api.invoices.update.path, async (req, res) => {
    try {
      const { items, ...invoiceData } = api.invoices.update.input.parse(req.body);
      const invoice = await storage.updateInvoice(Number(req.params.id), invoiceData);
      if (!invoice) return res.status(404).json({ message: "Not found" });
      res.json(invoice);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.delete(api.invoices.delete.path, async (req, res) => {
    res.status(204).send();
  });

  // Payments
  app.get(api.payments.list.path, async (req, res) => {
    res.json(await storage.getPayments());
  });
  app.post(api.payments.create.path, async (req, res) => {
    try {
      const input = api.payments.create.input.parse(req.body);
      const payment = await storage.createPayment(input);
      res.status(201).json(payment);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Expenses
  app.get(api.expenses.list.path, async (req, res) => {
    res.json(await storage.getExpenses());
  });
  app.post(api.expenses.create.path, async (req, res) => {
    try {
      const input = api.expenses.create.input.parse(req.body);
      const expense = await storage.createExpense(input);
      res.status(201).json(expense);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });
  app.put(api.expenses.update.path, async (req, res) => {
    try {
      const input = api.expenses.update.input.parse(req.body);
      const expense = await storage.updateExpense(Number(req.params.id), input);
      if (!expense) return res.status(404).json({ message: "Not found" });
      res.json(expense);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  // Settings
  app.get(api.settings.get.path, async (req, res) => {
    res.json(await storage.getSettings());
  });
  app.put(api.settings.update.path, async (req, res) => {
    try {
      const input = api.settings.update.input.parse(req.body);
      const settings = await storage.updateSettings(input);
      res.json(settings);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const usersCount = await storage.getUsers();
  if (usersCount.length === 0) {
    await storage.createUser({ name: "Admin User", email: "admin@tiaratradehouse.com", password: "admin123", role: "admin", status: "active" });
    await storage.createUser({ name: "Sales Manager", email: "sales@tiaratradehouse.com", password: "sales123", role: "sales", status: "active" });
  }

  const customersCount = await storage.getCustomers();
  if (customersCount.length === 0) {
    await storage.createCustomer({ name: "Ahmed Al Maktoum", company: "Gulf Auto Spares", email: "ahmed@gulfauto.ae", phone: "0501234567", country: "UAE", currency: "AED", status: "active", address: "Dubai" });
    await storage.createCustomer({ name: "Sarah Jones", company: "Elite Mechanics", email: "sarah@elite.ae", phone: "0559876543", country: "UAE", currency: "AED", status: "active", address: "Abu Dhabi" });
  }

  const productsCount = await storage.getProducts();
  if (productsCount.length === 0) {
    await storage.createProduct({ name: "Synthetic Engine Oil 5W-40", sku: "LUB-001", category: "Lubricants & Engine Oils", unit: "Ltr", price: "45.00", taxRate: "5", status: "active", description: "High performance synthetic oil", stock: 50 });
    await storage.createProduct({ name: "Brake Pads - Toyota Camry", sku: "BRK-015", category: "Auto Spare Parts", unit: "Set", price: "120.00", taxRate: "5", status: "active", description: "Ceramic brake pads", stock: 30 });
    await storage.createProduct({ name: "Heavy Duty Degreaser", sku: "CLN-102", category: "Car Care Products", unit: "Pcs", price: "25.00", taxRate: "5", status: "active", description: "Industrial degreaser spray", stock: 100 });
  }

  const expensesCount = await storage.getExpenses();
  if (expensesCount.length === 0) {
    await storage.createExpense({ date: new Date().toISOString().split('T')[0], category: "Logistics & Shipping", amount: "500.00", vendor: "FedEx", description: "Monthly shipping bill" });
    await storage.createExpense({ date: new Date().toISOString().split('T')[0], category: "Office & Admin", amount: "150.00", vendor: "Stationery Mart", description: "Office supplies" });
  }
}
