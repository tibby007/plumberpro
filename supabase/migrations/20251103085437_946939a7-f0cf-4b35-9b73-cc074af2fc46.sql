-- Re-enable RLS on leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Drop the old policy
DROP POLICY IF EXISTS "allow_all_inserts" ON public.leads;

-- Create a policy that allows inserts for both authenticated and anonymous users
CREATE POLICY "allow_anonymous_and_authenticated_inserts" ON public.leads
FOR INSERT
TO public, anon, authenticated
WITH CHECK (true);

-- Keep the plumber policies for viewing/updating/deleting
-- (they should already exist from previous migration)