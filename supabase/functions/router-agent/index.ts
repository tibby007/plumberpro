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
    const body = await req.json();
    let message = body.message;

    // Normalize message input
    if (typeof message === "object" && message !== null) {
      message = message.text || message.body || JSON.stringify(message);
    }
    if (typeof message !== "string") {
      message = String(message || "");
    }
    message = message.trim();

    const conversationId = body.conversation_id || body.conversationId || null;
    const contact = body.contact || {};
    const name = contact.name || "";
    const phone = contact.phone || "";
    const email = contact.email || "";

    console.log('Router Agent received:', { message, conversationId, contact });

    // Simple intent classification
    let intent = "general_inquiry";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes("quote") || lowerMsg.includes("estimate") || lowerMsg.includes("price") || lowerMsg.includes("cost")) {
      intent = "quote_request";
    } else if (
      lowerMsg.includes("emergency") ||
      lowerMsg.includes("leak") ||
      lowerMsg.includes("burst") ||
      lowerMsg.includes("flood") ||
      lowerMsg.includes("urgent")
    ) {
      intent = "emergency";
    } else if (
      lowerMsg.includes("book") ||
      lowerMsg.includes("appointment") ||
      lowerMsg.includes("schedule")
    ) {
      intent = "booking";
    }

    console.log('Classified intent:', intent);

    // Response object for GHL
    const responsePayload = {
      status: "success",
      intent,
      message,
      conversation_id: conversationId,
      contact: {
        name,
        phone,
        email,
      },
      reply:
        intent === "emergency"
          ? "Emergency request received. A plumber will contact you right away."
          : intent === "quote_request"
          ? "Thanks, I've noted your request for a quote. A team member will follow up shortly."
          : intent === "booking"
          ? "Got it. We'll get your appointment set up."
          : "Thanks for reaching out! How can we help you today?",
    };

    return new Response(JSON.stringify(responsePayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Router Agent error:", error);
    return new Response(
      JSON.stringify({ status: "error", message: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
