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
            content: `You are a Qualifier Agent for PlumberPro AI. Your job is to collect lead information and help customers with plumbing issues.

CURRENT LEAD DATA: ${JSON.stringify(leadData)}

YOUR TASKS:
1. Warmly greet customers and acknowledge their plumbing issue
2. Collect missing information: name, phone, email, service type, urgency level
3. Ask ONE question at a time naturally in conversation
4. Be empathetic and helpful
5. Once you have all info, confirm details and route to appropriate next step

SERVICES WE OFFER:
- Emergency repairs (leaks, burst pipes, clogs)
- Drain cleaning
- Water heater repair/installation
- Pipe repair/replacement
- Fixture installation
- General plumbing maintenance

RESPONSE FORMAT - Return JSON with:
{
  "message": "your conversational response to the customer",
  "leadData": {
    "name": "string or null",
    "phone": "string or null",
    "email": "string or null",
    "service": "string describing their need or null",
    "urgency": "normal | emergency",
    "intent": "booking"
  },
  "isComplete": boolean (true if you have name, phone, and service),
  "nextAction": "confirm | continue" (confirm when complete)
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
    
    console.log('Qualifier AI Response:', aiResponse);

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
