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

    console.log('Logic Agent received:', { message, leadData });

    // Call Lovable AI for quote/pricing logic
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
            content: `You are the Logic Agent for a plumbing services business.

Your job is to respond when a user asks for pricing, a quote, or an estimate.

CURRENT LEAD DATA: ${JSON.stringify(leadData)}

Steps:
1. Provide a clear, non-committal response about pricing (e.g., "Quotes depend on the issue, but we can get someone out quickly").
2. Collect name, phone, and email if missing.
3. Once you have all required fields, route to Confirmation Agent with structured JSON.

Required fields:
- name (first name only)
- phone
- email
- service (description of what they need quoted)
- intent (always "quote")
- urgency (always "normal")

Rules:
- Never give fixed prices. Say: "Pricing varies depending on the exact problem, but we can get a technician to assess it quickly."
- Ask for ONE piece of missing info at a time
- Once you have all required fields, return JSON and route to Confirmation Agent:
  {"name": "...", "phone": "...", "email": "...", "service": "...", "intent": "quote", "urgency": "normal", "route_to": "Confirmation Agent"}
- Keep responses under 20 words
- If user decides to book instead, route to Qualifier Agent:
  {"route_to": "Qualifier Agent"}`
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
    
    console.log('Logic AI Response:', aiResponse);

    // Try to parse as JSON, could be either final JSON or routing instruction
    const result = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Logic Agent error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "I'd be happy to provide pricing information. What type of plumbing service are you interested in?"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
