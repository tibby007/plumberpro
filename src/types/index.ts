export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  conversation_id?: string;
}

export interface Lead {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  intent: string;
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in_progress' | 'completed';
  message: string;
  created_at: string;
  updated_at?: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

export interface ApiResponse {
  reply: string;
  intent: string;
  conversation_id: string;
  status?: string;
}
