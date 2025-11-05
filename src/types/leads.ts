/**
 * Lead-specific Type Definitions
 *
 * Domain-specific types for working with leads, conversations, and messages
 */

import { Tables, Json } from './database';

// ============================================================================
// Enums
// ============================================================================

export enum Intent {
  EMERGENCY_REPAIR = 'emergency_repair',
  QUOTE_REQUEST = 'quote_request',
  SCHEDULING = 'scheduling',
  GENERAL_INQUIRY = 'general_inquiry',
  PAYMENT_BILLING = 'payment_billing',
  COMPLAINT = 'complaint'
}

export enum UrgencyLevel {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  LOST = 'lost'
}

export enum LeadSubstatus {
  AWAITING_RESPONSE = 'awaiting_response',
  INFO_NEEDED = 'info_needed',
  QUOTE_SENT = 'quote_sent',
  APPOINTMENT_SET = 'appointment_set'
}

export enum LeadSource {
  WEBSITE_WIDGET = 'website_widget',
  PHONE_CALL = 'phone_call',
  PHONE_CALL_LIVE = 'phone_call_live',
  EMAIL = 'email',
  REFERRAL = 'referral'
}

export enum IssueType {
  WATER_HEATER = 'water_heater',
  DRAIN = 'drain',
  LEAK = 'leak',
  INSTALL = 'install',
  MAINTENANCE = 'maintenance',
  BURST_PIPE = 'burst_pipe',
  SEWAGE = 'sewage',
  NO_WATER = 'no_water',
  OTHER = 'other'
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export enum ConversationStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  ARCHIVED = 'archived'
}

// ============================================================================
// Base Interfaces (from database tables)
// ============================================================================

export interface Lead extends Tables<'leads'> {
  // Extends the database type with no additional fields
  // This ensures type safety with the database schema
}

export interface Conversation extends Tables<'conversations'> {
  // Extends the database type
}

export interface Message extends Tables<'messages'> {
  // Extends the database type
}

export interface CallLog extends Tables<'call_logs'> {
  // Extends the database type
}

export interface Client extends Tables<'clients'> {
  // Extends the database type
}

export interface TeamMember extends Tables<'team_members'> {
  // Extends the database type
}

// ============================================================================
// Extended/Joined Types
// ============================================================================

/**
 * Lead with full conversation history
 */
export interface LeadWithConversation extends Lead {
  conversation?: Conversation & {
    messages: Message[];
  };
}

/**
 * Lead with conversation messages (flattened)
 */
export interface LeadWithMessages extends Lead {
  messages?: Message[];
  message_count?: number;
  last_message_at?: string;
}

/**
 * Lead with client information
 */
export interface LeadWithClient extends Lead {
  client: Client;
}

/**
 * Lead with assigned team member
 */
export interface LeadWithTeamMember extends Lead {
  team_member?: TeamMember;
}

/**
 * Full lead details with all related data
 */
export interface LeadDetails extends Lead {
  conversation?: Conversation & {
    messages: Message[];
  };
  client: Client;
  team_member?: TeamMember;
  call_log?: CallLog;
}

// ============================================================================
// Input/Form Types
// ============================================================================

/**
 * Data required to create a new lead from chat widget
 */
export interface CreateLeadInput {
  client_id: string;
  conversation_id?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  intent: Intent | string;
  issue_type?: IssueType | string;
  issue_description?: string;
  urgency_score?: number;
  source: LeadSource | string;
  device?: string;
  referrer?: string;
  utm_params?: Record<string, string>;
  notes?: string;
  metadata?: Record<string, any>;
}

/**
 * Data for updating lead status
 */
export interface UpdateLeadStatusInput {
  status: LeadStatus | string;
  substatus?: LeadSubstatus | string;
  notes?: string;
  assigned_to?: string;
}

/**
 * Data for creating a message
 */
export interface CreateMessageInput {
  conversation_id: string;
  client_id: string;
  role: MessageRole | string;
  content: string;
  intent?: string;
  confidence?: number;
  function_call?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Data for creating a conversation
 */
export interface CreateConversationInput {
  client_id: string;
  lead_id?: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

// ============================================================================
// Filter/Query Types
// ============================================================================

/**
 * Filters for querying leads
 */
export interface LeadFilters {
  status?: LeadStatus | LeadStatus[];
  intent?: Intent | Intent[];
  urgency_level?: UrgencyLevel | UrgencyLevel[];
  urgency_score_min?: number;
  urgency_score_max?: number;
  source?: LeadSource | LeadSource[];
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
  search?: string; // Search in name, phone, email, description
}

/**
 * Sort options for leads
 */
export interface LeadSort {
  field: 'created_at' | 'updated_at' | 'urgency_score' | 'lead_score' | 'customer_name';
  direction: 'asc' | 'desc';
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Query parameters for fetching leads
 */
export interface LeadQueryParams {
  filters?: LeadFilters;
  sort?: LeadSort;
  pagination?: PaginationOptions;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Paginated leads response
 */
export interface LeadsResponse {
  data: Lead[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Lead with conversation response
 */
export interface LeadConversationResponse {
  lead: Lead;
  conversation: Conversation;
  messages: Message[];
}

/**
 * Dashboard summary statistics
 */
export interface DashboardStats {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  urgent_leads: number;
  leads_today: number;
  avg_lead_score: number;
  completed_leads: number;
  conversion_rate: number;
}

/**
 * Leads grouped by status (for Kanban board)
 */
export interface LeadsByStatus {
  [LeadStatus.NEW]: Lead[];
  [LeadStatus.CONTACTED]: Lead[];
  [LeadStatus.QUALIFIED]: Lead[];
  [LeadStatus.SCHEDULED]: Lead[];
  [LeadStatus.COMPLETED]: Lead[];
  [LeadStatus.CLOSED]: Lead[];
  [LeadStatus.LOST]: Lead[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Lead metadata structure
 */
export interface LeadMetadata {
  user_agent?: string;
  ip_address?: string;
  page_url?: string;
  session_id?: string;
  [key: string]: any;
}

/**
 * Conversation context structure
 */
export interface ConversationContext {
  has_name?: boolean;
  has_contact?: boolean;
  has_address?: boolean;
  has_service_type?: boolean;
  has_urgency?: boolean;
  collected_info?: Record<string, any>;
  [key: string]: any;
}

/**
 * Message metadata structure
 */
export interface MessageMetadata {
  model?: string;
  tokens_used?: number;
  processing_time_ms?: number;
  [key: string]: any;
}

/**
 * Function call structure for AI messages
 */
export interface FunctionCall {
  name: string;
  arguments: Record<string, any>;
  result?: any;
}

/**
 * Urgency score range (1-10)
 */
export type UrgencyScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * Lead score range (0-100)
 */
export type LeadScore = number; // 0-100

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a string is a valid Intent
 */
export function isIntent(value: string): value is Intent {
  return Object.values(Intent).includes(value as Intent);
}

/**
 * Check if a string is a valid LeadStatus
 */
export function isLeadStatus(value: string): value is LeadStatus {
  return Object.values(LeadStatus).includes(value as LeadStatus);
}

/**
 * Check if a string is a valid UrgencyLevel
 */
export function isUrgencyLevel(value: string): value is UrgencyLevel {
  return Object.values(UrgencyLevel).includes(value as UrgencyLevel);
}

/**
 * Check if lead is emergency (urgency score >= 8)
 */
export function isEmergencyLead(lead: Lead): boolean {
  return (lead.urgency_score ?? 0) >= 8;
}

/**
 * Check if lead is urgent (urgency score >= 5)
 */
export function isUrgentLead(lead: Lead): boolean {
  return (lead.urgency_score ?? 0) >= 5;
}

/**
 * Check if lead needs follow-up (new and not contacted within 2 hours)
 */
export function needsFollowUp(lead: Lead): boolean {
  if (lead.status !== LeadStatus.NEW) return false;
  if (lead.contacted_at) return false;

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const createdAt = new Date(lead.created_at);

  return createdAt < twoHoursAgo;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate urgency level from urgency score
 */
export function getUrgencyLevel(score: number): UrgencyLevel {
  if (score >= 8) return UrgencyLevel.CRITICAL;
  if (score >= 5) return UrgencyLevel.HIGH;
  if (score >= 3) return UrgencyLevel.MEDIUM;
  return UrgencyLevel.LOW;
}

/**
 * Get urgency emoji based on score
 */
export function getUrgencyEmoji(score: number): string {
  if (score >= 8) return '🚨';
  if (score >= 5) return '⚠️';
  if (score >= 3) return '📋';
  return '📝';
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string | null): string | null {
  if (!phone) return null;

  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX for 10-digit US numbers
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Return as-is if not 10 digits
  return phone;
}

/**
 * Get time ago string (e.g., "2 hours ago")
 */
export function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return then.toLocaleDateString();
}

/**
 * Get status badge color
 */
export function getStatusColor(status: LeadStatus | string): string {
  switch (status) {
    case LeadStatus.NEW:
      return 'blue';
    case LeadStatus.CONTACTED:
      return 'yellow';
    case LeadStatus.QUALIFIED:
      return 'purple';
    case LeadStatus.SCHEDULED:
      return 'indigo';
    case LeadStatus.COMPLETED:
      return 'green';
    case LeadStatus.CLOSED:
      return 'gray';
    case LeadStatus.LOST:
      return 'red';
    default:
      return 'gray';
  }
}
