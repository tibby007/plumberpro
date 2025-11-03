-- Drop ALL policies on leads table
DROP POLICY IF EXISTS "public_insert_access" ON public.leads;
DROP POLICY IF EXISTS "Plumbers can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Plumbers can update leads" ON public.leads;
DROP POLICY IF EXISTS "Plumbers can delete leads" ON public.leads;

-- Completely disable RLS
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;