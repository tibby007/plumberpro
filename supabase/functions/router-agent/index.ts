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
    const { message, conversationHistory = [] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Router Agent received message:', message);

    // Call Lovable AI to classify intent
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
            content: `You are a Router Agent for a plumbing services company. Your job is to classify customer intent and route to the appropriate agent.

INTENTS:
- "booking" - User wants to schedule a plumbing service or mentions a plumbing problem
- "quote" - User asks about pricing, cost estimates, or wants a quote
- "emergency" - User mentions flood, burst pipe, leak, or urgent/emergency situation
- "faq" - User asks general questions about services, hours, service area

ROUTING RULES:
- Emergency keywords (flood, burst, leak, urgent, emergency) → "emergency"
- Price/cost/quote keywords → "quote"
- Schedule/book/appointment/problem keywords → "booking"
- Everything else → "faq"

Respond with ONLY a JSON object:
{
  "intent": "booking | quote | emergency | faq",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`
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
    
    console.log('Router AI Response:', aiResponse);

    // Parse the routing decision
    const routingDecision = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify({
        ...routingDecision,
        nextAgent: routingDecision.intent === 'emergency' ? 'confirmation' : routingDecision.intent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Router Agent error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        intent: 'booking', // Default fallback
        nextAgent: 'booking'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
