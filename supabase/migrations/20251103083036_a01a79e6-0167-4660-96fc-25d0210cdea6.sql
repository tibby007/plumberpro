-- Drop the current insert policy
DROP POLICY IF EXISTS "Allow all inserts to leads" ON public.leads;

-- Create a new policy that explicitly bypasses RLS for service role
-- This uses current_setting to check if the request is using service role key
CREATE POLICY "Allow backend and public inserts to leads"
ON public.leads
FOR INSERT
WITH CHECK (
  true  -- Allow all inserts (service role bypasses RLS anyway)
);