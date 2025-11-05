/**
 * Central Type Exports
 *
 * Re-export all types from database and domain-specific modules
 */

// Database types
export type { Database, Json, Tables, TablesInsert, TablesUpdate } from './database';

// Lead domain types
export type {
  // Base interfaces
  Lead,
  Conversation,
  Message,
  CallLog,
  Client,
  TeamMember,

  // Extended types
  LeadWithConversation,
  LeadWithMessages,
  LeadWithClient,
  LeadWithTeamMember,
  LeadDetails,

  // Input types
  CreateLeadInput,
  UpdateLeadStatusInput,
  CreateMessageInput,
  CreateConversationInput,

  // Filter/Query types
  LeadFilters,
  LeadSort,
  PaginationOptions,
  LeadQueryParams,

  // Response types
  LeadsResponse,
  LeadConversationResponse,
  DashboardStats,
  LeadsByStatus,

  // Utility types
  LeadMetadata,
  ConversationContext,
  MessageMetadata,
  FunctionCall,
  UrgencyScore,
  LeadScore,
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
// Legacy types (deprecated - kept for backward compatibility)
// ============================================================================

/**
 * @deprecated Use CreateMessageInput instead
 */
export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

/**
 * @deprecated Use LeadConversationResponse instead
 */
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
