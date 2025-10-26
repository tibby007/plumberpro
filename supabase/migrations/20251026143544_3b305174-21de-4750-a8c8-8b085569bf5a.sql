-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  intent TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'new',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  text TEXT NOT NULL,
  sender TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for leads (public read/write for now, can add auth later)
CREATE POLICY "Allow public read access to leads"
  ON public.leads
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to leads"
  ON public.leads
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to leads"
  ON public.leads
  FOR UPDATE
  USING (true);

-- Create policies for messages (public read/write for now, can add auth later)
CREATE POLICY "Allow public read access to messages"
  ON public.messages
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for both tables
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for leads
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();