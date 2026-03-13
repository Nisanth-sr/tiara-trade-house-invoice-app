import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { 
  Customer, InsertCustomer, 
  Product, InsertProduct, 
  User, InsertUser,
  QuoteWithItems, InsertQuote,
  Invoice, InvoiceWithItems, InsertInvoice,
  Payment, InsertPayment,
  Expense, InsertExpense,
  Settings, InsertSettings
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export type InvoiceWithDue = InvoiceWithItems & { paidAmount: number, dueAmount: number };
export type InvoiceListWithDue = Invoice & { customer: Customer, paidAmount: number, dueAmount: number };

// Fetch Helper
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "include" });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "An error occurred");
  }
  return res.json();
}

// Customers
export function useCustomers() {
  return useQuery({ queryKey: [api.customers.list.path], queryFn: () => fetcher<Customer[]>(api.customers.list.path) });
}
export function useCreateCustomer() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: InsertCustomer) => fetcher<Customer>(api.customers.create.path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [api.customers.list.path] }); toast({ title: "Customer created" }); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });
}
export function useUpdateCustomer() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<InsertCustomer> }) => fetcher<Customer>(buildUrl(api.customers.update.path, { id }), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [api.customers.list.path] }); toast({ title: "Customer updated" }); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });
}

// Products
export function useProducts() {
  return useQuery({ queryKey: [api.products.list.path], queryFn: () => fetcher<Product[]>(api.products.list.path) });
}
export function useCreateProduct() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: InsertProduct) => fetcher<Product>(api.products.create.path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [api.products.list.path] }); toast({ title: "Product created" }); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });
}
export function useUpdateProduct() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<InsertProduct> }) => fetcher<Product>(buildUrl(api.products.update.path, { id }), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [api.products.list.path] }); toast({ title: "Product updated" }); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });
}

// Quotes
export function useQuotes() {
  return useQuery({ queryKey: [api.quotes.list.path], queryFn: () => fetcher<QuoteWithItems[]>(api.quotes.list.path) });
}
export function useCreateQuote() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: any) => fetcher<QuoteWithItems>(api.quotes.create.path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: [api.quotes.list.path] }); 
      qc.invalidateQueries({ queryKey: [api.products.list.path] }); 
      toast({ title: "Quote created" }); 
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });
}

// Invoices
export function useInvoices() {
  return useQuery({ queryKey: [api.invoices.list.path], queryFn: () => fetcher<InvoiceListWithDue[]>(api.invoices.list.path) });
}
export function useCreateInvoice() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: any) => fetcher<InvoiceWithDue>(api.invoices.create.path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: [api.invoices.list.path] }); 
      qc.invalidateQueries({ queryKey: [api.products.list.path] }); 
      toast({ title: "Invoice created" }); 
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });
}

// Payments
export function usePayments() {
  return useQuery({ queryKey: [api.payments.list.path], queryFn: () => fetcher<Payment[]>(api.payments.list.path) });
}
export function useCreatePayment() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: InsertPayment) => fetcher<Payment>(api.payments.create.path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: [api.payments.list.path] }); 
      qc.invalidateQueries({ queryKey: [api.invoices.list.path] }); 
      toast({ title: "Payment recorded" }); 
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });
}

// Expenses
export function useExpenses() {
  return useQuery({ queryKey: [api.expenses.list.path], queryFn: () => fetcher<Expense[]>(api.expenses.list.path) });
}
export function useCreateExpense() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: InsertExpense) => fetcher<Expense>(api.expenses.create.path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [api.expenses.list.path] }); toast({ title: "Expense created" }); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });
}

// Dashboard
export function useDashboardStats() {
  return useQuery({ queryKey: [api.dashboard.stats.path], queryFn: () => fetcher<any>(api.dashboard.stats.path) });
}

// Users
export function useUsers() {
  return useQuery({ queryKey: [api.users.list.path], queryFn: () => fetcher<User[]>(api.users.list.path) });
}

// Settings
export function useSettings() {
  return useQuery({ queryKey: [api.settings.get.path], queryFn: () => fetcher<Settings>(api.settings.get.path) });
}
export function useUpdateSettings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: InsertSettings) => fetcher<Settings>(api.settings.update.path, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [api.settings.get.path] }); toast({ title: "Settings updated" }); },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });
}
