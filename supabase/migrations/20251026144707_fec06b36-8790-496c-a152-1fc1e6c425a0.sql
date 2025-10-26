-- Add missing columns to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS conversation_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS ai_response TEXT;

-- Update conversation_id to be required (not null)
UPDATE public.leads SET conversation_id = id::text WHERE conversation_id IS NULL;
ALTER TABLE public.leads ALTER COLUMN conversation_id SET NOT NULL;

-- Add indexes to leads table
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON public.leads(created_at DESC);

-- Rename 'text' column to 'message' in messages table
ALTER TABLE public.messages RENAME COLUMN text TO message;

-- Add index to messages table
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);

-- Update intent values to match expected format (optional - for data consistency)
-- This ensures existing data uses the new format
UPDATE public.leads 
SET intent = CASE 
  WHEN intent = 'quote' THEN 'quote_request'
  WHEN intent = 'emergency' THEN 'emergency_repair'
  WHEN intent = 'booking' THEN 'scheduling'
  ELSE 'general_inquiry'
END
WHERE intent NOT IN ('emergency_repair', 'quote_request', 'general_inquiry', 'scheduling');