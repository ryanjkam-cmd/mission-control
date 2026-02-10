/**
 * Type definitions for the Action Queue system
 */

export type ActionType =
  | 'email_reply'
  | 'imessage'
  | 'calendar_block'
  | 'health_suggestion'
  | 'trip_plan'
  | 'task_create'
  | 'reminder_create'
  | 'notion_update';

export type ActionStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'auto_approved'
  | 'edited';

export type RiskLevel = 'low' | 'medium' | 'high';

export interface ActionQueueItem {
  id: number;
  action_type: ActionType;
  status: ActionStatus;
  risk_level: RiskLevel;
  generated_at: string;
  reviewed_at?: string;
  action_data: string; // JSON string
  context_data?: string; // JSON string
  confidence?: number;
  user_feedback?: string;
  edited_data?: string; // JSON string
  executed_at?: string;
}

export interface ParsedActionData {
  // Email
  to?: string;
  subject?: string;
  body?: string;

  // iMessage
  recipient?: string;
  message?: string;

  // Calendar
  title?: string;
  start_time?: string;
  end_time?: string;
  description?: string;

  // Health
  suggestion_text?: string;
  category?: string;

  // Trip
  destination?: string;
  dates?: string;
  notes?: string;

  // Generic
  [key: string]: any;
}

export interface ParsedContextData {
  original_email?: any;
  calendar_conflicts?: any[];
  related_tasks?: any[];
  user_preferences?: any;
  [key: string]: any;
}

export interface AutoApproveRule {
  id: number;
  action_type: ActionType;
  conditions: string; // JSON string
  enabled: number; // SQLite boolean
  created_at: string;
  times_triggered: number;
  success_rate?: number;
}

export interface RuleCondition {
  field: string;
  op: 'equals' | 'contains' | 'regex' | 'gt' | 'lt';
  value: any;
}

export interface QueueStats {
  total: number;
  pending: number;
  approved: number;
  denied: number;
  auto_approved: number;
  edited: number;
  approval_rate: number;
  avg_confidence: number;
  by_type: Record<ActionType, number>;
  by_risk: Record<RiskLevel, number>;
}

export interface CreateActionRequest {
  action_type: ActionType;
  action_data: ParsedActionData;
  context_data?: ParsedContextData;
  risk_level: RiskLevel;
  confidence?: number;
}

export interface UpdateActionRequest {
  status?: ActionStatus;
  user_feedback?: string;
  edited_data?: ParsedActionData;
}

export interface CreateRuleRequest {
  action_type: ActionType;
  conditions: RuleCondition[];
}
