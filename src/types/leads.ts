/**
 * Lead-specific Type Definitions
 *
 * Simple types that match the actual database schema
 */

import { Tables } from '@/integrations/supabase/types';

// ============================================================================
// Base Interfaces (from database tables)
// ============================================================================

/**
 * Lead type from database
 */
export interface Lead {
  id: string;
  created_at: string;
  updated_at: string | null;
  conversation_id: string;
  customer_name: string;
  phone: string;
  email: string;
  message: string;
  intent: string;
  priority: string;
  status: string;
  ai_response: string | null;
}

/**
 * Message type from database
 */
export interface Message {
  id: string;
  conversation_id: string;
  message: string;
  sender: string;
  timestamp: string | Date;
}

// ============================================================================
// Enums (for reference)
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
// Type Guards
// ============================================================================

export function isIntent(value: string): value is Intent {
  return Object.values(Intent).includes(value as Intent);
}

export function isLeadStatus(value: string): value is LeadStatus {
  return Object.values(LeadStatus).includes(value as LeadStatus);
}

export function isUrgencyLevel(value: string): value is UrgencyLevel {
  return Object.values(UrgencyLevel).includes(value as UrgencyLevel);
}

export function isEmergencyLead(lead: Lead): boolean {
  return lead.priority === 'high';
}

export function isUrgentLead(lead: Lead): boolean {
  return lead.priority === 'high' || lead.priority === 'medium';
}

export function needsFollowUp(lead: Lead): boolean {
  if (lead.status !== LeadStatus.NEW) return false;

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const createdAt = new Date(lead.created_at);

  return createdAt < twoHoursAgo;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getUrgencyLevel(priority: string): UrgencyLevel {
  if (priority === 'high') return UrgencyLevel.CRITICAL;
  if (priority === 'medium') return UrgencyLevel.HIGH;
  return UrgencyLevel.LOW;
}

export function getUrgencyEmoji(priority: string): string {
  if (priority === 'high') return '🚨';
  if (priority === 'medium') return '⚠️';
  return '📝';
}

export function formatPhoneNumber(phone: string | null): string | null {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
}

export function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (seconds < 3600) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

  const hours = Math.floor(seconds / 3600);
  if (seconds < 86400) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

  const days = Math.floor(seconds / 86400);
  if (seconds < 604800) return `${days} ${days === 1 ? 'day' : 'days'} ago`;

  return then.toLocaleDateString();
}

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
