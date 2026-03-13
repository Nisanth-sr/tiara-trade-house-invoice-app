-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'sales',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    address TEXT,
    country TEXT,
    currency TEXT DEFAULT 'AED',
    payment_terms TEXT DEFAULT 'Net 30',
    notes TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 5.00,
    stock INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    quote_number TEXT NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    date TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    total_discount NUMERIC(12, 2) DEFAULT 0.00,
    total_vat NUMERIC(12, 2) NOT NULL,
    grand_total NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote Items Table
CREATE TABLE IF NOT EXISTS quote_items (
    id SERIAL PRIMARY KEY,
    quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    description TEXT,
    qty INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 5.00,
    discount NUMERIC(5, 2) DEFAULT 0.00,
    line_total NUMERIC(12, 2) NOT NULL
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number TEXT NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    quote_id INTEGER REFERENCES quotes(id) ON DELETE SET NULL,
    date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    reference TEXT,
    subtotal NUMERIC(12, 2) NOT NULL,
    total_discount NUMERIC(12, 2) DEFAULT 0.00,
    total_vat NUMERIC(12, 2) NOT NULL,
    grand_total NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id),
    description TEXT,
    qty INTEGER NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 5.00,
    discount NUMERIC(5, 2) DEFAULT 0.00,
    line_total NUMERIC(12, 2) NOT NULL
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    date TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    method TEXT NOT NULL,
    reference TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    date TEXT NOT NULL,
    category TEXT NOT NULL,
    vendor TEXT,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    vat_included BOOLEAN DEFAULT FALSE,
    payment_method TEXT,
    reference TEXT,
    notes TEXT,
    status TEXT DEFAULT 'Approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    company_name TEXT DEFAULT 'TIARA TRADE HOUSE FZ LLC',
    address TEXT DEFAULT 'United Arab Emirates',
    phone TEXT DEFAULT '054 482 2246',
    email TEXT DEFAULT 'contact@tiaratradehouse.com',
    website TEXT,
    default_currency TEXT DEFAULT 'AED',
    vat_number TEXT,
    tax_rate NUMERIC(5, 2) DEFAULT 5.00,
    invoice_prefix TEXT DEFAULT 'INV-',
    quote_prefix TEXT DEFAULT 'QT-',
    default_payment_terms TEXT DEFAULT 'Net 30',
    default_notes TEXT
);
