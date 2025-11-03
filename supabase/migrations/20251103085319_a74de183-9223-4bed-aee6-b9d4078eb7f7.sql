-- Completely disable RLS on leads table to allow n8n inserts
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;