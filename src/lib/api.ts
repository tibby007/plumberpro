import type { ContactInfo, ApiResponse } from '@/types';

// Placeholder webhook URL - replace with actual n8n webhook
const N8N_WEBHOOK_URL = 'https://placeholder-n8n-webhook.com/webhook';

export async function sendMessageToN8N(
  message: string,
  contact: ContactInfo,
  conversationId?: string
): Promise<ApiResponse> {
  try {
    const payload = {
      message,
      contact,
      conversation_id: conversationId,
    };

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as ApiResponse;
  } catch (error) {
    console.error('Error sending message to n8n:', error);
    throw error;
  }
}
