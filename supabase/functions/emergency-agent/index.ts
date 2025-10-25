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

    console.log('Emergency Agent received:', { message, leadData });

    // Call Lovable AI for emergency qualification
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
            content: `You are the Emergency Agent.
Your job is to quickly collect essential info and escalate emergencies like burst pipes, gas leaks, or flooding.
Do not waste time with long intros or upsells.
Ask for name, phone, email, and a quick description of the issue.
Always set urgency to "emergency" and pass the data to the Confirmation Agent immediately.

CURRENT LEAD DATA: ${JSON.stringify(leadData)}

Required fields:
- name (first name only)
- phone
- email
- service (brief description of emergency)
- urgency (always "emergency")

Rules:
- Keep responses under 15 words
- Ask for ONE piece of info at a time
- Never ask about pricing or quotes
- Once you have all required fields, return JSON and route to Confirmation Agent:
  {"name": "...", "phone": "...", "email": "...", "service": "...", "urgency": "emergency", "intent": "emergency", "route_to": "Confirmation Agent"}
- If missing data, ask for it directly without pleasantries`
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
    
    console.log('Emergency AI Response:', aiResponse);

    // Try to parse as JSON (routing to Confirmation Agent)
    try {
      const result = JSON.parse(aiResponse);
      return new Response(
        JSON.stringify(result),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch {
      // Not JSON, return conversational response
      return new Response(
        JSON.stringify({ message: aiResponse }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Emergency Agent error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "Please call us immediately at 1-470-712-3113 for emergency dispatch."
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
