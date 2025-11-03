-- Drop the existing restrictive insert policy
DROP POLICY IF EXISTS "Allow public insert to leads" ON public.leads;

-- Create a new permissive policy that allows all inserts
CREATE POLICY "Allow all inserts to leads"
ON public.leads
FOR INSERT
TO public, anon, authenticated, service_role
WITH CHECK (true);