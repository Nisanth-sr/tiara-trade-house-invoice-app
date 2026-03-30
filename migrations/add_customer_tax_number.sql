-- Run once on existing databases (Supabase SQL editor or psql)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tax_number TEXT;
