-- Drop conversation_id unique constraint if exists
ALTER TABLE public.leads 
DROP CONSTRAINT IF EXISTS leads_conversation_id_key;