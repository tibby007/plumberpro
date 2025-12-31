/**
 * Central Type Exports
 */

// Database types
export type { Json, Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Lead domain types
export type {
  Lead,
  Message,
} from './leads';

// Enums
export {
  Intent,
  UrgencyLevel,
  LeadStatus,
  LeadSubstatus,
  LeadSource,
  IssueType,
  MessageRole,
  ConversationStatus,
} from './leads';

// Helper functions
export {
  isIntent,
  isLeadStatus,
  isUrgencyLevel,
  isEmergencyLead,
  isUrgentLead,
  needsFollowUp,
  getUrgencyLevel,
  getUrgencyEmoji,
  formatPhoneNumber,
  getTimeAgo,
  getStatusColor,
} from './leads';

// ============================================================================
// Legacy types (for backward compatibility)
// ============================================================================

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
