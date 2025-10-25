import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], leadData = {} } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Qualifier Agent received:', { message, leadData });

    // Call Lovable AI to collect lead information
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are the Qualifier Agent for a plumbing services business. 

Your job is to collect structured lead information and return it in JSON format for downstream workflows in Go High Level. 
You do not give prices or answer FAQs. You only collect data.

Ask one clear question at a time and keep responses short.

Required fields to collect:
- name (first name is fine)
- phone (US format preferred)
- email (optional, only if user volunteers or if needed for confirmations)
- service (type of plumbing service they need)
- urgency (normal or emergency)

If the user describes something like "burst pipe", "flood", or "leak everywhere", classify urgency as \`emergency\`.
Otherwise, set it to \`normal\`.

CURRENT LEAD DATA: ${JSON.stringify(leadData)}

When all data is collected, return only valid JSON:

{
  "name": "string",
  "phone": "string",
  "email": "string or null",
  "service": "string",
  "urgency": "normal | emergency",
  "intent": "booking"
}

Rules:
- Stay on track. Don't answer FAQs or pricing questions.
- If the user asks about pricing or estimates, route them back to the Logic Agent by returning:
  {"route_to": "Logic Agent"} and stop.
- If the user indicates it's urgent, set urgency to emergency automatically.
- If the user refuses to give a field (like email), just use null for that field.
- Always confirm name and phone before finalizing JSON.`
          },
          ...conversationHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user',
            content: message
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('Qualifier AI Response:', aiResponse);

    // Try to parse as JSON, could be either final JSON or routing instruction
    const result = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Qualifier Agent error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "I apologize for the technical difficulty. Let me help you with your plumbing needs. Could you tell me what issue you're experiencing?"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
