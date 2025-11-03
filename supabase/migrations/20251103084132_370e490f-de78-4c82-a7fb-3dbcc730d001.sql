-- Drop ALL policies on leads table
DROP POLICY IF EXISTS "Allow backend and public inserts to leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all inserts to leads" ON public.leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.leads;
DROP POLICY IF EXISTS "Plumbers can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Plumbers can update leads" ON public.leads;
DROP POLICY IF EXISTS "Plumbers can delete leads" ON public.leads;

-- Disable RLS temporarily
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- Re-enable with a fresh policy
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create one clean policy that allows all inserts (n8n workflow)
CREATE POLICY "allow_all_inserts" ON public.leads
FOR INSERT
WITH CHECK (true);

-- Recreate the plumber policies for viewing/updating/deleting
CREATE POLICY "Plumbers can view all leads" 
ON public.leads 
FOR SELECT 
USING (has_role(auth.uid(), 'plumber'::app_role));

CREATE POLICY "Plumbers can update leads" 
ON public.leads 
FOR UPDATE 
USING (has_role(auth.uid(), 'plumber'::app_role));

CREATE POLICY "Plumbers can delete leads" 
ON public.leads 
FOR DELETE 
USING (has_role(auth.uid(), 'plumber'::app_role));