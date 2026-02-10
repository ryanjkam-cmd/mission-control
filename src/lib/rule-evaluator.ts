/**
 * Rule Evaluation Engine
 *
 * Evaluates actions against auto-approve rules.
 * Returns first matching rule or null.
 */

import type { QueueAction, AutoApproveRule, Condition } from './queue-types';
import { getNestedValue } from './queue-types';

/**
 * Evaluate a single condition against action data
 */
function evaluateCondition(condition: Condition, data: Record<string, unknown>): boolean {
  const fieldValue = getNestedValue(data, condition.field);

  if (fieldValue === undefined || fieldValue === null) {
    return false;
  }

  const condValue = condition.value;

  switch (condition.operator) {
    case 'equals':
      return fieldValue === condValue;

    case 'not_equals':
      return fieldValue !== condValue;

    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(condValue).toLowerCase());

    case 'startsWith':
      return String(fieldValue).toLowerCase().startsWith(String(condValue).toLowerCase());

    case 'endsWith':
      return String(fieldValue).toLowerCase().endsWith(String(condValue).toLowerCase());

    case 'lt':
      return Number(fieldValue) < Number(condValue);

    case 'gt':
      return Number(fieldValue) > Number(condValue);

    case 'in':
      if (Array.isArray(condValue)) {
        return condValue.includes(fieldValue);
      }
      // For comma-separated string values
      const values = String(condValue).split(',').map(v => v.trim());
      return values.includes(String(fieldValue));

    default:
      return false;
  }
}

/**
 * Evaluate all rules against an action
 * Returns first matching enabled rule with success_rate >= 0.8
 */
export function evaluateRules(
  action: Partial<QueueAction>,
  rules: AutoApproveRule[]
): AutoApproveRule | null {
  if (!action.action_type || !action.action_data) {
    return null;
  }

  for (const rule of rules) {
    // Skip disabled rules
    if (!rule.enabled) {
      continue;
    }

    // Skip if action type doesn't match
    if (rule.action_type !== action.action_type) {
      continue;
    }

    // Skip rules with low success rate (require at least 80% success)
    if (rule.success_rate !== null && rule.success_rate < 0.8) {
      continue;
    }

    // Evaluate all conditions (AND logic)
    const allConditionsMet = rule.conditions.every(condition =>
      evaluateCondition(condition, action.action_data as Record<string, unknown>)
    );

    if (allConditionsMet) {
      return rule;
    }
  }

  return null;
}

/**
 * Generate plain English description of a rule
 */
export function describeRule(rule: AutoApproveRule): string {
  const parts: string[] = [];

  parts.push(rule.action_type.replace(/_/g, ' '));

  if (rule.conditions.length === 0) {
    return parts[0];
  }

  const conditionDescriptions = rule.conditions.map(cond => {
    const field = cond.field.replace(/_/g, ' ');
    const operator = operatorToText(cond.operator);
    return `${field} ${operator} "${cond.value}"`;
  });

  parts.push('where', conditionDescriptions.join(' AND '));

  return parts.join(' ');
}

function operatorToText(operator: string): string {
  const map: Record<string, string> = {
    equals: '=',
    not_equals: '≠',
    contains: 'contains',
    startsWith: 'starts with',
    endsWith: 'ends with',
    lt: '<',
    gt: '>',
    in: 'in'
  };
  return map[operator] || operator;
}

/**
 * Update rule success rate after user override
 */
export function updateSuccessRate(
  rule: AutoApproveRule,
  wasSuccessful: boolean
): number {
  const triggered = rule.times_triggered || 0;
  const currentSuccessRate = rule.success_rate || 1.0;

  if (triggered === 0) {
    return wasSuccessful ? 1.0 : 0.0;
  }

  // Running average
  const totalSuccess = currentSuccessRate * triggered;
  const newSuccess = totalSuccess + (wasSuccessful ? 1 : 0);
  const newTriggered = triggered + 1;

  return newSuccess / newTriggered;
}
