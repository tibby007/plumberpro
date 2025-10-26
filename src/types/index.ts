export interface Message {
  id: string;
  conversation_id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface Lead {
  id: string;
  conversation_id: string;
  customer_name: string;
  phone: string;
  email: string;
  intent: 'emergency_repair' | 'quote_request' | 'general_inquiry' | 'scheduling';
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in_progress' | 'completed';
  message: string;
  ai_response?: string;
  created_at: string;
  updated_at?: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

export interface ApiResponse {
  id?: string;
  reply?: string;
  message?: string;
  intent?: string;
  conversation_id: string;
  sender?: string;
  timestamp?: string;
  status?: string;
}
