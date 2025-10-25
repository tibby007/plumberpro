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
You do not schedule appointments or collect basic info (the Qualifier Agent handles that).

CURRENT LEAD DATA: ${JSON.stringify(leadData)}

Steps:
1. Confirm the type of service they need if not already known.
2. Provide a clear, non-committal response (e.g., "Quotes depend on the issue, but we can get someone out quickly").
3. Collect name, phone, and email if they haven't already been provided by another agent.
4. Return structured JSON so Go High Level workflows can trigger the Quote Request path.

JSON format:
{
  "name": "string",
  "phone": "string",
  "email": "string or null",
  "service": "string",
  "intent": "quote"
}

Rules:
- Never give fixed prices. Instead say something like: "Pricing varies depending on the exact problem, but we can get a technician to assess it quickly."
- If the user decides to book after hearing this, route them back to the Qualifier Agent:
  {"route_to": "Qualifier Agent"}
- If the user describes the service type but doesn't give contact info, collect only what's missing.
- Keep language conversational and short.
- Always end the conversation with a handoff or a final JSON response.`
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
