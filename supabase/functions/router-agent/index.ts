import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const body = await req.json();

    // Log the raw incoming message for debugging
    console.log("Incoming payload:", JSON.stringify(body));

    let rawMessage = body.message;

    // Handle various shapes of incoming message
    if (rawMessage === null || rawMessage === undefined) {
      rawMessage = "";
    } else if (typeof rawMessage === "object") {
      // if it's an object, try to extract text or stringify
      rawMessage = rawMessage.text || JSON.stringify(rawMessage);
    } else if (Array.isArray(rawMessage)) {
      rawMessage = rawMessage.join(" ");
    } else if (typeof rawMessage !== "string") {
      rawMessage = String(rawMessage);
    }

    const message = rawMessage.trim();

    const conversationId = body.conversation_id || body.conversationId || "";
    const contact = body.contact || {};
    const name = contact.name || "";
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
