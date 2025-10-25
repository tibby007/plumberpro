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
    const testPayload = {
      "name": "Test Lead",
      "phone": "4705551234",
      "email": "testlead@email.com",
      "service": "leak repair",
      "urgency": "normal",
      "intent": "booking",
      "status": "confirmed"
    };

    const webhookUrl = 'https://services.leadconnectorhq.com/hooks/nCgaDadjDRyzUo1fd29V/webhook-trigger/0cbcc274-1500-49af-a4a2-93f4f543e005';
    
    console.log('Sending test webhook to GHL...', testPayload);
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    const responseText = await webhookResponse.text();
    console.log('GHL Webhook response:', webhookResponse.status, responseText);

    return new Response(
      JSON.stringify({
        success: true,
        webhookStatus: webhookResponse.status,
        webhookResponse: responseText,
        sentPayload: testPayload
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Test webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
