import type { ContactInfo, ApiResponse } from '@/types';

// n8n webhook endpoint
const N8N_WEBHOOK_URL = 'https://n8n.srv998244.hstgr.cloud/webhook/plumberpro-chat';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export async function sendMessageToN8N(
  message: string,
  contact: ContactInfo,
  conversationId?: string,
  options: RetryOptions = {}
): Promise<ApiResponse> {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const payload = {
        message,
        customerName: contact.name,
        phone: contact.phone,
        email: contact.email,
        conversationId: conversationId,
      };

      console.log('Sending to n8n:', payload);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as ApiResponse;
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on AbortError or if it's the last attempt
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }

      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    lastError?.message || 'Failed to send message after multiple attempts'
  );
}
