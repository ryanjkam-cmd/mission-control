/**
 * Database helper functions for Action Queue
 */

import { getDb, queryAll, queryOne, run, transaction } from './index';
import type {
  ActionQueueItem,
  ActionType,
  ActionStatus,
  RiskLevel,
  AutoApproveRule,
  QueueStats,
  CreateActionRequest,
  UpdateActionRequest,
  CreateRuleRequest,
  ParsedActionData,
} from '../types/queue';

// Action Queue Operations

export function createAction(data: CreateActionRequest): number {
  const result = run(
    `INSERT INTO action_queue (action_type, action_data, context_data, risk_level, confidence)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.action_type,
      JSON.stringify(data.action_data),
      data.context_data ? JSON.stringify(data.context_data) : null,
      data.risk_level,
      data.confidence ?? null,
    ]
  );
  return result.lastInsertRowid as number;
}

export function getAction(id: number): ActionQueueItem | undefined {
  return queryOne<ActionQueueItem>(
    'SELECT * FROM action_queue WHERE id = ?',
    [id]
  );
}

export function getActions(filters?: {
  status?: ActionStatus;
  action_type?: ActionType;
  risk_level?: RiskLevel;
  limit?: number;
  offset?: number;
}): ActionQueueItem[] {
  let sql = 'SELECT * FROM action_queue WHERE 1=1';
  const params: any[] = [];

  if (filters?.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.action_type) {
    sql += ' AND action_type = ?';
    params.push(filters.action_type);
  }

  if (filters?.risk_level) {
    sql += ' AND risk_level = ?';
    params.push(filters.risk_level);
  }

  sql += ' ORDER BY generated_at DESC';

  if (filters?.limit) {
    sql += ' LIMIT ?';
    params.push(filters.limit);
  }

  if (filters?.offset) {
    sql += ' OFFSET ?';
    params.push(filters.offset);
  }

  return queryAll<ActionQueueItem>(sql, params);
}

export function updateAction(id: number, updates: UpdateActionRequest): void {
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.status !== undefined) {
    fields.push('status = ?');
    params.push(updates.status);
    fields.push("reviewed_at = datetime('now')");
  }

  if (updates.user_feedback !== undefined) {
    fields.push('user_feedback = ?');
    params.push(updates.user_feedback);
  }

  if (updates.edited_data !== undefined) {
    fields.push('edited_data = ?');
    params.push(JSON.stringify(updates.edited_data));
  }

  if (fields.length === 0) return;

  params.push(id);
  run(
    `UPDATE action_queue SET ${fields.join(', ')} WHERE id = ?`,
    params
  );
}

export function markActionExecuted(id: number): void {
  run(
    "UPDATE action_queue SET executed_at = datetime('now') WHERE id = ?",
    [id]
  );
}

// Auto-Approve Rules Operations

export function createRule(data: CreateRuleRequest): number {
  const result = run(
    `INSERT INTO auto_approve_rules (action_type, conditions)
     VALUES (?, ?)`,
    [data.action_type, JSON.stringify(data.conditions)]
  );
  return result.lastInsertRowid as number;
}

export function getRule(id: number): AutoApproveRule | undefined {
  return queryOne<AutoApproveRule>(
    'SELECT * FROM auto_approve_rules WHERE id = ?',
    [id]
  );
}

export function getRules(filters?: {
  action_type?: ActionType;
  enabled?: boolean;
}): AutoApproveRule[] {
  let sql = 'SELECT * FROM auto_approve_rules WHERE 1=1';
  const params: any[] = [];

  if (filters?.action_type) {
    sql += ' AND action_type = ?';
    params.push(filters.action_type);
  }

  if (filters?.enabled !== undefined) {
    sql += ' AND enabled = ?';
    params.push(filters.enabled ? 1 : 0);
  }

  sql += ' ORDER BY created_at DESC';

  return queryAll<AutoApproveRule>(sql, params);
}

export function updateRule(
  id: number,
  updates: { enabled?: boolean; success_rate?: number }
): void {
  const fields: string[] = [];
  const params: any[] = [];

  if (updates.enabled !== undefined) {
    fields.push('enabled = ?');
    params.push(updates.enabled ? 1 : 0);
  }

  if (updates.success_rate !== undefined) {
    fields.push('success_rate = ?');
    params.push(updates.success_rate);
  }

  if (fields.length === 0) return;

  params.push(id);
  run(`UPDATE auto_approve_rules SET ${fields.join(', ')} WHERE id = ?`, params);
}

export function incrementRuleTriggers(id: number): void {
  run(
    'UPDATE auto_approve_rules SET times_triggered = times_triggered + 1 WHERE id = ?',
    [id]
  );
}

// Statistics

export function getQueueStats(): QueueStats {
  const total = queryOne<{ count: number }>(
    'SELECT COUNT(*) as count FROM action_queue',
    []
  )?.count ?? 0;

  const byStatus = queryAll<{ status: ActionStatus; count: number }>(
    'SELECT status, COUNT(*) as count FROM action_queue GROUP BY status',
    []
  );

  const byType = queryAll<{ action_type: ActionType; count: number }>(
    'SELECT action_type, COUNT(*) as count FROM action_queue GROUP BY action_type',
    []
  );

  const byRisk = queryAll<{ risk_level: RiskLevel; count: number }>(
    'SELECT risk_level, COUNT(*) as count FROM action_queue GROUP BY risk_level',
    []
  );

  const avgConfidence = queryOne<{ avg: number }>(
    'SELECT AVG(confidence) as avg FROM action_queue WHERE confidence IS NOT NULL',
    []
  )?.avg ?? 0;

  const statusCounts = {
    pending: 0,
    approved: 0,
    denied: 0,
    auto_approved: 0,
    edited: 0,
  };

  byStatus.forEach(({ status, count }) => {
    statusCounts[status] = count;
  });

  const approved = statusCounts.approved + statusCounts.auto_approved;
  const total_reviewed = approved + statusCounts.denied;
  const approval_rate = total_reviewed > 0 ? (approved / total_reviewed) * 100 : 0;

  const typeMap: Record<string, number> = {};
  byType.forEach(({ action_type, count }) => {
    typeMap[action_type] = count;
  });

  const riskMap: Record<string, number> = {};
  byRisk.forEach(({ risk_level, count }) => {
    riskMap[risk_level] = count;
  });

  return {
    total,
    ...statusCounts,
    approval_rate,
    avg_confidence: avgConfidence,
    by_type: typeMap as Record<ActionType, number>,
    by_risk: riskMap as Record<RiskLevel, number>,
  };
}

// Check if action should be auto-approved
export function checkAutoApprove(
  actionType: ActionType,
  actionData: ParsedActionData
): AutoApproveRule | null {
  const rules = getRules({ action_type: actionType, enabled: true });

  for (const rule of rules) {
    try {
      const conditions = JSON.parse(rule.conditions);
      let allMatch = true;

      for (const condition of conditions) {
        const fieldValue = actionData[condition.field];

        switch (condition.op) {
          case 'equals':
            if (fieldValue !== condition.value) allMatch = false;
            break;
          case 'contains':
            if (!String(fieldValue).includes(condition.value)) allMatch = false;
            break;
          case 'regex':
            if (!new RegExp(condition.value).test(String(fieldValue)))
              allMatch = false;
            break;
          case 'gt':
            if (!(Number(fieldValue) > condition.value)) allMatch = false;
            break;
          case 'lt':
            if (!(Number(fieldValue) < condition.value)) allMatch = false;
            break;
        }

        if (!allMatch) break;
      }

      if (allMatch) {
        return rule;
      }
    } catch (err) {
      console.error('Error evaluating rule', rule.id, err);
    }
  }

  return null;
}
