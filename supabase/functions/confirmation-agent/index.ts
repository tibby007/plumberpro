import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let isEmergency = false;

  try {
    const { message, conversationHistory = [], leadData = {} } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Confirmation Agent received:', { message, leadData });

    isEmergency = leadData.urgency === 'emergency';

    // Call Lovable AI for confirmation/escalation
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
            content: `You are the Confirmation Agent for a plumbing services business.

Your job is to finalize the conversation after the lead's intent has been classified and their information collected.

CURRENT LEAD DATA: ${JSON.stringify(leadData)}

Goals:
- Confirm next steps clearly (booking, quote follow-up, or emergency escalation).
- Return a final structured JSON payload for GHL workflows.
- Keep the tone professional, warm, and confident.
- Keep responses short and under 2 sentences.

JSON format:
{
  "name": "string",
  "phone": "string",
  "email": "string or null",
  "service": "string",
  "urgency": "normal | emergency",
  "intent": "booking | quote | emergency",
  "status": "confirmed"
}

Behavior Rules:
- If intent = booking:
  - Confirm the booking request and let the user know someone will reach out or that they're scheduled.
- If intent = quote:
  - Confirm their request and let them know they'll get a call or text shortly with next steps.
- If intent = emergency:
  - Acknowledge urgency and assure them the team is being notified immediately.

- Never collect new info here.
- If data is incomplete, return:
  {"route_to": "Qualifier Agent"}
  and stop.
- Always close the conversation gracefully.`
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
    
    console.log('Confirmation AI Response:', aiResponse);

    // Try to parse as JSON, could be either final JSON or routing instruction
    const result = JSON.parse(aiResponse);

    // Send the final response to GHL webhook
    const webhookUrl = 'https://services.leadconnectorhq.com/hooks/nCgaDadjDRyzUo1fd29V/webhook-trigger/d3e03b84-e55a-4e88-9f53-d2b76b2d43f4';
    
    try {
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });
      
      console.log('GHL Webhook sent:', webhookResponse.status, await webhookResponse.text());
    } catch (webhookError) {
      console.error('GHL Webhook failed:', webhookError);
      // Continue even if webhook fails - don't break the user flow
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Confirmation Agent error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: isEmergency 
          ? "We understand this is urgent. Please call us immediately at 1-470-712-3113 for emergency dispatch."
          : "I'm ready to confirm your booking. Could you please verify your contact information?"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
