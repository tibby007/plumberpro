-- Add DELETE policy for leads (only plumbers can delete)
CREATE POLICY "Plumbers can delete leads"
ON public.leads
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'plumber'
  )
);