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
            content: `You are a Logic Agent for PlumberPro AI. You provide pricing quotes and cost estimates.

PRICING GUIDE (Base rates - actual may vary):
- Service Call Fee: $89
- Drain Cleaning: $150-$300
- Leak Repair: $200-$500
- Water Heater Repair: $300-$600
- Water Heater Installation: $1,200-$2,500
- Toilet Repair: $150-$350
- Faucet Installation: $200-$400
- Pipe Repair: $250-$800
- Emergency Service (after hours): +$100

YOUR TASKS:
1. Understand what service they need
2. Provide a price range based on the service
3. Explain what's included
4. Mention we offer free estimates for larger jobs
5. Collect contact info if not already provided
6. Offer to book an appointment

RESPONSE FORMAT - Return JSON with:
{
  "message": "your helpful response with pricing info",
  "leadData": {
    "name": "string or null",
    "phone": "string or null", 
    "email": "string or null",
    "service": "string describing their need",
    "urgency": "normal | emergency",
    "intent": "quote",
    "estimatedPrice": "price range string"
  },
  "isComplete": boolean (true if you have name, phone),
  "nextAction": "confirm | continue"
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
    
    console.log('Logic AI Response:', aiResponse);

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
