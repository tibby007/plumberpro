-- Fix Critical Security Issues: Restrict leads and messages table access to authenticated plumbers only

-- 1. Remove public read access to leads table
DROP POLICY IF EXISTS "Allow public read access to leads" ON public.leads;

-- 2. Remove public update access to leads table  
DROP POLICY IF EXISTS "Allow public update to leads" ON public.leads;

-- 3. Remove public read access to messages table
DROP POLICY IF EXISTS "Allow public read access to messages" ON public.messages;

-- 4. Create new restricted policies for leads table
CREATE POLICY "Plumbers can view all leads" ON public.leads
  FOR SELECT
  USING (has_role(auth.uid(), 'plumber'::app_role));

CREATE POLICY "Plumbers can update leads" ON public.leads
  FOR UPDATE
  USING (has_role(auth.uid(), 'plumber'::app_role));

-- 5. Create new restricted policy for messages table
CREATE POLICY "Plumbers can view all messages" ON public.messages
  FOR SELECT
  USING (has_role(auth.uid(), 'plumber'::app_role));

-- Note: Public INSERT policies are kept for chat widget functionality