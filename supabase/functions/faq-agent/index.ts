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

    console.log('FAQ Agent received:', message);

    // Call Lovable AI for general questions
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
            content: `You are an FAQ Agent for PlumberPro AI. Answer general questions about our services.

COMPANY INFO:
- Phone: 1-470-712-3113
- Email: service@plumberpro.com
- Service Area: Greater Metro Area (50-mile radius)
- Hours: Mon-Fri 7AM-8PM, Sat-Sun 8AM-6PM
- Emergency service available 24/7

SERVICES:
- Emergency repairs (leaks, burst pipes, clogs)
- Drain cleaning and maintenance
- Water heater repair and installation
- Pipe repair and replacement
- Fixture installation (faucets, toilets, sinks)
- General plumbing maintenance
- Sewer line services

PRICING:
- Service call fee: $89
- Free estimates for larger jobs
- Transparent pricing before work begins
- Emergency service: +$100 after hours

GUARANTEES:
- Licensed and insured plumbers
- 100% satisfaction guarantee
- Workmanship warranty
- Upfront pricing

YOUR TASKS:
1. Answer their question helpfully and concisely
2. Provide relevant additional information
3. Ask if they need anything else
4. Offer to connect them with a specialist for booking/quotes

RESPONSE FORMAT - Return JSON with:
{
  "message": "your helpful answer",
  "suggestBooking": boolean (true if they might need service),
  "nextAction": "continue | route_to_booking | route_to_quote"
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
    
    console.log('FAQ AI Response:', aiResponse);

    const result = JSON.parse(aiResponse);

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('FAQ Agent error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "I'm here to help answer your questions about PlumberPro AI. What would you like to know?"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
