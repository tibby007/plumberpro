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

    // Extract message text - handle both string and object formats
    const messageText = typeof message === 'string' ? message : message?.body || '';
    
    console.log('Router Agent received message:', messageText);

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
            content: `You are the Router Agent. 
Your job is to listen to the visitor's first message, classify the intent, and route them to the correct agent. 
Only respond with the name of the agent to route to. Do not explain or give additional text.

Routing logic:
- If user wants to book an appointment or mentions a plumbing issue → route to "Qualifier Agent".
- If user asks for pricing, quote, or estimate → route to "Logic Agent".
- If user mentions flood, burst pipe, water everywhere, urgent → route to "Emergency Agent".
- If user asks a general question (how long, what's included, hours, warranty) → route to "FAQ Agent".
- If unsure, route to "Qualifier Agent".`
          },
          ...conversationHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: 'user',
            content: messageText
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
    const agentName = data.choices[0].message.content.trim();
    
    console.log('Router AI Response:', agentName);

    return new Response(
      JSON.stringify({
        agentName: agentName,
        routedTo: agentName
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
        agentName: 'Qualifier Agent', // Default fallback
        routedTo: 'Qualifier Agent'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
