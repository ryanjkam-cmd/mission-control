// Queue and Auto-Approve Rules Types

export type ActionType =
  | 'email_reply'
  | 'imessage'
  | 'calendar_block'
  | 'health_suggestion'
  | 'trip_plan';

export type ActionStatus =
  | 'pending'
  | 'approved'
  | 'denied'
  | 'auto_approved'
  | 'edited';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ConditionOperator =
  | 'equals'
  | 'contains'
  | 'lt'
  | 'gt'
  | 'startsWith'
  | 'endsWith'
  | 'not_equals'
  | 'in';

export interface Condition {
  field: string;
  operator: ConditionOperator;
  value: string | number;
}

export interface AutoApproveRule {
  id: number;
  action_type: ActionType;
  conditions: Condition[];
  enabled: boolean;
  created_at: string;
  times_triggered: number;
  success_rate: number | null;
}

export interface QueueAction {
  id: number;
  action_type: ActionType;
  status: ActionStatus;
  risk_level: RiskLevel;
  generated_at: string;
  reviewed_at: string | null;
  action_data: Record<string, unknown>;
  context_data: Record<string, unknown> | null;
  confidence: number | null;
  user_feedback: string | null;
  edited_data: Record<string, unknown> | null;
  executed_at: string | null;
  rule_id?: number | null;
}

// Field options per action type
export const FIELD_OPTIONS: Record<ActionType, string[]> = {
  email_reply: ['recipient', 'subject', 'body_length', 'has_attachment', 'tone'],
  imessage: ['recipient', 'message_length', 'contains_keyword', 'time_of_day'],
  calendar_block: ['title', 'duration_minutes', 'time_of_day', 'day_of_week'],
  health_suggestion: ['suggestion_type', 'text_length', 'priority'],
  trip_plan: ['destination', 'duration_days', 'budget', 'has_flights']
};

// Helper to get nested value from object
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
