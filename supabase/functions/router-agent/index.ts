import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    console.log("Incoming payload:", JSON.stringify(body));

    // Extract message text safely
    let rawMessage = "";
    if (body.message) {
      if (typeof body.message === "object" && body.message.body) {
        rawMessage = body.message.body;
      } else if (typeof body.message === "string") {
        rawMessage = body.message;
      } else {
        rawMessage = JSON.stringify(body.message);
      }
    }

    const message = (rawMessage || "").trim();

    const conversationId = body.conversation_id || body.conversationId || "";
    const contact = body.contact || {};
    const name = contact.name || body.full_name || "";
    const phone = contact.phone || "";
    const email = contact.email || "";

    // Intent classification
    const lowerMsg = message.toLowerCase();
    let intent = "general";

    if (lowerMsg.includes("quote") || lowerMsg.includes("estimate")) {
      intent = "quote";
    } else if (
      lowerMsg.includes("emergency") ||
      lowerMsg.includes("leak") ||
      lowerMsg.includes("burst")
    ) {
      intent = "emergency";
    } else if (
      lowerMsg.includes("book") ||
      lowerMsg.includes("appointment")
    ) {
      intent = "booking";
    }

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
          : intent === "quote"
          ? "Got it. I can help with that quote. Let's get your details."
          : intent === "booking"
          ? "Let's book your appointment. Please provide your availability."
          : "Thanks for reaching out. How can we help you today?",
    };

    console.log("Router Agent response:", responsePayload);

    return new Response(JSON.stringify(responsePayload), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Router Agent error:", error);
    return new Response(
      JSON.stringify({ status: "error", message: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
