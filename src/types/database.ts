/**
 * Database Type Definitions
 *
 * These types match the PlumberPro Supabase schema.
 * To regenerate from your actual database, run:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          business_name: string;
          owner_name: string;
          email: string;
          phone: string | null;
          address: string | null;
          service_area: Json | null;
          business_hours: Json | null;
          on_call_phone: string | null;
          plan_type: string;
          subscription_status: string;
          trial_ends_at: string | null;
          settings: Json;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          business_name: string;
          owner_name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          service_area?: Json | null;
          business_hours?: Json | null;
          on_call_phone?: string | null;
          plan_type?: string;
          subscription_status?: string;
          trial_ends_at?: string | null;
          settings?: Json;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          business_name?: string;
          owner_name?: string;
          email?: string;
          phone?: string | null;
          address?: string | null;
          service_area?: Json | null;
          business_hours?: Json | null;
          on_call_phone?: string | null;
          plan_type?: string;
          subscription_status?: string;
          trial_ends_at?: string | null;
          settings?: Json;
          user_id?: string;
        };
      };
      leads: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          client_id: string;
          conversation_id: string | null;
          customer_name: string;
          customer_phone: string | null;
          customer_email: string | null;
          customer_address: string | null;
          intent: string;
          issue_type: string | null;
          issue_description: string | null;
          urgency_score: number | null;
          urgency_level: string | null;
          lead_score: number;
          assigned_to: string | null;
          assigned_at: string | null;
          status: string;
          substatus: string | null;
          contacted_at: string | null;
          qualified_at: string | null;
          completed_at: string | null;
          source: string;
          device: string | null;
          referrer: string | null;
          utm_params: Json | null;
          notes: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          client_id: string;
          conversation_id?: string | null;
          customer_name: string;
          customer_phone?: string | null;
          customer_email?: string | null;
          customer_address?: string | null;
          intent: string;
          issue_type?: string | null;
          issue_description?: string | null;
          urgency_score?: number | null;
          urgency_level?: string | null;
          lead_score?: number;
          assigned_to?: string | null;
          assigned_at?: string | null;
          status?: string;
          substatus?: string | null;
          contacted_at?: string | null;
          qualified_at?: string | null;
          completed_at?: string | null;
          source: string;
          device?: string | null;
          referrer?: string | null;
          utm_params?: Json | null;
          notes?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          client_id?: string;
          conversation_id?: string | null;
          customer_name?: string;
          customer_phone?: string | null;
          customer_email?: string | null;
          customer_address?: string | null;
          intent?: string;
          issue_type?: string | null;
          issue_description?: string | null;
          urgency_score?: number | null;
          urgency_level?: string | null;
          lead_score?: number;
          assigned_to?: string | null;
          assigned_at?: string | null;
          status?: string;
          substatus?: string | null;
          contacted_at?: string | null;
          qualified_at?: string | null;
          completed_at?: string | null;
          source?: string;
          device?: string | null;
          referrer?: string | null;
          utm_params?: Json | null;
          notes?: string | null;
          metadata?: Json;
        };
      };
      conversations: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          client_id: string;
          lead_id: string | null;
          status: string;
          last_message_at: string | null;
          message_count: number;
          context: Json;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          client_id: string;
          lead_id?: string | null;
          status?: string;
          last_message_at?: string | null;
          message_count?: number;
          context?: Json;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          client_id?: string;
          lead_id?: string | null;
          status?: string;
          last_message_at?: string | null;
          message_count?: number;
          context?: Json;
          metadata?: Json;
        };
      };
      messages: {
        Row: {
          id: string;
          created_at: string;
          conversation_id: string;
          client_id: string;
          role: string;
          content: string;
          intent: string | null;
          confidence: number | null;
          function_call: Json | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          conversation_id: string;
          client_id: string;
          role: string;
          content: string;
          intent?: string | null;
          confidence?: number | null;
          function_call?: Json | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          conversation_id?: string;
          client_id?: string;
          role?: string;
          content?: string;
          intent?: string | null;
          confidence?: number | null;
          function_call?: Json | null;
          metadata?: Json;
        };
      };
      call_logs: {
        Row: {
          id: string;
          created_at: string;
          client_id: string;
          lead_id: string | null;
          call_sid: string | null;
          from_number: string;
          to_number: string;
          status: string | null;
          duration: number | null;
          recording_url: string | null;
          transcript: string | null;
          intent: string | null;
          urgency: string | null;
          sentiment: string | null;
          lead_created: boolean;
          call_outcome: string | null;
          first_response_time: number | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          client_id: string;
          lead_id?: string | null;
          call_sid?: string | null;
          from_number: string;
          to_number: string;
          status?: string | null;
          duration?: number | null;
          recording_url?: string | null;
          transcript?: string | null;
          intent?: string | null;
          urgency?: string | null;
          sentiment?: string | null;
          lead_created?: boolean;
          call_outcome?: string | null;
          first_response_time?: number | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          client_id?: string;
          lead_id?: string | null;
          call_sid?: string | null;
          from_number?: string;
          to_number?: string;
          status?: string | null;
          duration?: number | null;
          recording_url?: string | null;
          transcript?: string | null;
          intent?: string | null;
          urgency?: string | null;
          sentiment?: string | null;
          lead_created?: boolean;
          call_outcome?: string | null;
          first_response_time?: number | null;
          metadata?: Json;
        };
      };
      team_members: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          client_id: string;
          name: string;
          email: string | null;
          phone: string;
          role: string;
          is_available: boolean;
          current_load: number;
          max_load: number;
          specialties: string[] | null;
          service_area: Json | null;
          schedule: Json | null;
          last_assigned_at: string | null;
          total_leads_assigned: number;
          metadata: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          client_id: string;
          name: string;
          email?: string | null;
          phone: string;
          role: string;
          is_available?: boolean;
          current_load?: number;
          max_load?: number;
          specialties?: string[] | null;
          service_area?: Json | null;
          schedule?: Json | null;
          last_assigned_at?: string | null;
          total_leads_assigned?: number;
          metadata?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          client_id?: string;
          name?: string;
          email?: string | null;
          phone?: string;
          role?: string;
          is_available?: boolean;
          current_load?: number;
          max_load?: number;
          specialties?: string[] | null;
          service_area?: Json | null;
          schedule?: Json | null;
          last_assigned_at?: string | null;
          total_leads_assigned?: number;
          metadata?: Json;
        };
      };
      widget_settings: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          client_id: string;
          primary_color: string;
          greeting_message: string;
          company_logo_url: string | null;
          enable_text_widget: boolean;
          enable_voice_widget: boolean;
          show_hours: boolean;
          system_prompt: string | null;
          voice_persona: string;
          settings: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          client_id: string;
          primary_color?: string;
          greeting_message?: string;
          company_logo_url?: string | null;
          enable_text_widget?: boolean;
          enable_voice_widget?: boolean;
          show_hours?: boolean;
          system_prompt?: string | null;
          voice_persona?: string;
          settings?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          client_id?: string;
          primary_color?: string;
          greeting_message?: string;
          company_logo_url?: string | null;
          enable_text_widget?: boolean;
          enable_voice_widget?: boolean;
          show_hours?: boolean;
          system_prompt?: string | null;
          voice_persona?: string;
          settings?: Json;
        };
      };
      analytics: {
        Row: {
          id: string;
          date: string;
          client_id: string;
          total_leads: number;
          leads_by_intent: Json;
          leads_by_source: Json;
          leads_contacted: number;
          leads_qualified: number;
          leads_scheduled: number;
          leads_completed: number;
          leads_lost: number;
          avg_response_time: number | null;
          avg_lead_score: number | null;
          total_calls: number;
          avg_call_duration: number | null;
          calls_converted_to_leads: number;
          estimated_revenue: number | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          date: string;
          client_id: string;
          total_leads?: number;
          leads_by_intent?: Json;
          leads_by_source?: Json;
          leads_contacted?: number;
          leads_qualified?: number;
          leads_scheduled?: number;
          leads_completed?: number;
          leads_lost?: number;
          avg_response_time?: number | null;
          avg_lead_score?: number | null;
          total_calls?: number;
          avg_call_duration?: number | null;
          calls_converted_to_leads?: number;
          estimated_revenue?: number | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          date?: string;
          client_id?: string;
          total_leads?: number;
          leads_by_intent?: Json;
          leads_by_source?: Json;
          leads_contacted?: number;
          leads_qualified?: number;
          leads_scheduled?: number;
          leads_completed?: number;
          leads_lost?: number;
          avg_response_time?: number | null;
          avg_lead_score?: number | null;
          total_calls?: number;
          avg_call_duration?: number | null;
          calls_converted_to_leads?: number;
          estimated_revenue?: number | null;
          metadata?: Json;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
