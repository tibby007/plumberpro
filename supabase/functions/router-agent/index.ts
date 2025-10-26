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
    const payload = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Parse GHL webhook payload
    const message = payload.message || '';
    const contact = payload.contact || {};
    const conversationId = payload.conversation_id || '';
    
    console.log('Router Agent received:', { message, contact, conversationId });

    // Validate required fields
    if (!message || message.trim() === '') {
      return new Response(
        JSON.stringify({ status: 'error', message: 'invalid input' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
            content: `Classify this message into ONE of these intents. Respond with ONLY the intent name:
- "quote_request" for pricing, estimates, or quote requests
- "emergency" for urgent issues like floods, burst pipes, water everywhere
- "booking" for appointment scheduling or service requests
- "general_inquiry" for questions about services, hours, warranty, etc.`
          },
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
    const intent = data.choices[0].message.content.trim().toLowerCase();
    
    console.log('Classified intent:', intent);

    // Generate confirmation reply based on intent
    const replies: Record<string, string> = {
      quote_request: "Thanks, I've noted your request for a quote. A team member will follow up shortly.",
      emergency: "Emergency request received. A plumber will contact you right away.",
      booking: "Got it. We'll get your appointment set up.",
      general_inquiry: "Thanks for reaching out! How can we help you today?"
    };

    const reply = replies[intent] || replies.general_inquiry;

    return new Response(
      JSON.stringify({
        status: 'success',
        intent: intent,
        reply: reply
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Router Agent error:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
