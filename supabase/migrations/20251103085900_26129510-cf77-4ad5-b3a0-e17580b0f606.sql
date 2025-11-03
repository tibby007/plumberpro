-- Drop the existing insert policy
DROP POLICY IF EXISTS "allow_anonymous_and_authenticated_inserts" ON public.leads;

-- Create a policy that allows ALL inserts without any role restrictions
CREATE POLICY "public_insert_access" ON public.leads
FOR INSERT
WITH CHECK (true);