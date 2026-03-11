import { z } from 'zod';
import { 
  insertUserSchema, users,
  insertCustomerSchema, customers,
  insertProductSchema, products,
  insertQuoteSchema, quotes,
  insertQuoteItemSchema, quoteItems,
  insertInvoiceSchema, invoices,
  insertInvoiceItemSchema, invoiceItems,
  insertPaymentSchema, payments,
  insertExpenseSchema, expenses,
  insertSettingsSchema, settings
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string()
  })
};

// Authentication requests
const loginRequest = z.object({ email: z.string().email(), password: z.string() });
const authResponse = z.custom<typeof users.$inferSelect>();

// Create schema with nested items
const createQuoteRequest = insertQuoteSchema.extend({
  items: z.array(insertQuoteItemSchema)
});

const createInvoiceRequest = insertInvoiceSchema.extend({
  items: z.array(insertInvoiceItemSchema)
});

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: loginRequest,
      responses: { 200: authResponse, 401: errorSchemas.unauthorized }
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout' as const,
      responses: { 200: z.object({ message: z.string() }) }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: { 200: authResponse, 401: errorSchemas.unauthorized }
    }
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          revenue: z.number(),
          outstanding: z.number(),
          expenses: z.number(),
          activeCustomers: z.number(),
          monthlyRevenue: z.array(z.object({ name: z.string(), revenue: z.number(), expenses: z.number() })),
          invoiceStatus: z.array(z.object({ name: z.string(), value: z.number() })),
          recentPayments: z.array(z.object({ date: z.string(), amount: z.number() })),
          recentInvoices: z.array(z.any()),
          topCustomers: z.array(z.any()),
          overdueInvoices: z.array(z.any())
        })
      }
    }
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      responses: { 200: z.array(z.custom<typeof users.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/users' as const,
      input: insertUserSchema,
      responses: { 201: z.custom<typeof users.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/users/:id' as const,
      input: insertUserSchema.partial(),
      responses: { 200: z.custom<typeof users.$inferSelect>(), 404: errorSchemas.notFound }
    }
  },
  customers: {
    list: {
      method: 'GET' as const,
      path: '/api/customers' as const,
      responses: { 200: z.array(z.custom<typeof customers.$inferSelect>()) }
    },
    get: {
      method: 'GET' as const,
      path: '/api/customers/:id' as const,
      responses: { 200: z.custom<typeof customers.$inferSelect>(), 404: errorSchemas.notFound }
    },
    create: {
      method: 'POST' as const,
      path: '/api/customers' as const,
      input: insertCustomerSchema,
      responses: { 201: z.custom<typeof customers.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/customers/:id' as const,
      input: insertCustomerSchema.partial(),
      responses: { 200: z.custom<typeof customers.$inferSelect>(), 404: errorSchemas.notFound }
    }
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      responses: { 200: z.array(z.custom<typeof products.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: insertProductSchema,
      responses: { 201: z.custom<typeof products.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id' as const,
      input: insertProductSchema.partial(),
      responses: { 200: z.custom<typeof products.$inferSelect>(), 404: errorSchemas.notFound }
    }
  },
  quotes: {
    list: {
      method: 'GET' as const,
      path: '/api/quotes' as const,
      responses: { 200: z.array(z.any()) } // z.any() used for simplicity to include joined data
    },
    get: {
      method: 'GET' as const,
      path: '/api/quotes/:id' as const,
      responses: { 200: z.any(), 404: errorSchemas.notFound }
    },
    create: {
      method: 'POST' as const,
      path: '/api/quotes' as const,
      input: createQuoteRequest,
      responses: { 201: z.any(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/quotes/:id' as const,
      input: createQuoteRequest.partial(),
      responses: { 200: z.any(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/quotes/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound }
    }
  },
  invoices: {
    list: {
      method: 'GET' as const,
      path: '/api/invoices' as const,
      responses: { 200: z.array(z.any()) }
    },
    get: {
      method: 'GET' as const,
      path: '/api/invoices/:id' as const,
      responses: { 200: z.any(), 404: errorSchemas.notFound }
    },
    create: {
      method: 'POST' as const,
      path: '/api/invoices' as const,
      input: createInvoiceRequest,
      responses: { 201: z.any(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/invoices/:id' as const,
      input: createInvoiceRequest.partial(),
      responses: { 200: z.any(), 404: errorSchemas.notFound }
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/invoices/:id' as const,
      responses: { 204: z.void(), 404: errorSchemas.notFound }
    }
  },
  payments: {
    list: {
      method: 'GET' as const,
      path: '/api/payments' as const,
      responses: { 200: z.array(z.any()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/payments' as const,
      input: insertPaymentSchema,
      responses: { 201: z.custom<typeof payments.$inferSelect>(), 400: errorSchemas.validation }
    }
  },
  expenses: {
    list: {
      method: 'GET' as const,
      path: '/api/expenses' as const,
      responses: { 200: z.array(z.custom<typeof expenses.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/expenses' as const,
      input: insertExpenseSchema,
      responses: { 201: z.custom<typeof expenses.$inferSelect>(), 400: errorSchemas.validation }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/expenses/:id' as const,
      input: insertExpenseSchema.partial(),
      responses: { 200: z.custom<typeof expenses.$inferSelect>(), 404: errorSchemas.notFound }
    }
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: { 200: z.custom<typeof settings.$inferSelect>() }
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settings' as const,
      input: insertSettingsSchema.partial(),
      responses: { 200: z.custom<typeof settings.$inferSelect>() }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
