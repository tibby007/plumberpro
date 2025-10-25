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
            content: `You are a Confirmation Agent for PlumberPro AI. You ${isEmergency ? 'handle EMERGENCY escalations' : 'confirm bookings'}.

LEAD DATA: ${JSON.stringify(leadData)}

${isEmergency ? `
EMERGENCY MODE:
- This is an URGENT situation requiring immediate attention
- Our emergency team is available 24/7
- Emergency service fee: +$100
- Response time: Within 60 minutes
- We will call them immediately at the provided number

YOUR TASKS:
1. Acknowledge the emergency situation with empathy
2. Confirm their contact information (especially phone)
3. Confirm the address/location
4. Assure them help is on the way
5. Provide emergency safety tips if relevant
6. Tell them we'll call within 5 minutes to dispatch a technician
` : `
BOOKING MODE:
- Business hours: Mon-Fri 7AM-8PM, Sat-Sun 8AM-6PM
- Standard service calls scheduled within 24 hours
- Service call fee: $89

YOUR TASKS:
1. Review and confirm all collected information
2. Suggest available time slots (today, tomorrow, or next available)
3. Confirm their preferred time
4. Provide confirmation details
5. Set expectations for the visit
`}

RESPONSE FORMAT - Return JSON with:
{
  "message": "your confirmation message",
  "leadData": {
    "name": "string",
    "phone": "string",
    "email": "string or null",
    "service": "string",
    "urgency": "${isEmergency ? 'emergency' : 'normal'}",
    "intent": "${isEmergency ? 'emergency' : 'booking'}",
    "address": "string or null",
    "scheduledTime": "string or null",
    "status": "confirmed | pending"
  },
  "isComplete": true,
  "nextAction": "complete",
  "ghlWorkflow": "${isEmergency ? 'EMERGENCY_DISPATCH' : 'BOOKING_CONFIRMED'}"
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
    
    console.log('Confirmation AI Response:', aiResponse);

    const result = JSON.parse(aiResponse);

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
