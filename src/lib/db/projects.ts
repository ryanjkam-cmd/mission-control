/**
 * Database helper functions for Build Projects
 */

import { queryAll, queryOne, run } from './index';
import type {
  Project,
  ProjectStatus,
  ProjectPhase,
  WorkLogEntry,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types/projects';

export function createProject(data: CreateProjectRequest): string {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const phases = data.phases || [];
  const totalPhases = phases.length || 1;

  run(
    `INSERT INTO projects (id, name, goal, status, current_phase, total_phases, phases, assigned_agent_id, target_path, work_log, created_at, updated_at)
     VALUES (?, ?, ?, 'queued', 1, ?, ?, ?, ?, '[]', ?, ?)`,
    [
      id,
      data.name,
      data.goal || null,
      totalPhases,
      JSON.stringify(phases),
      data.assigned_agent_id || null,
      data.target_path || null,
      now,
      now,
    ]
  );
  return id;
}

export function getProject(id: string): Project | undefined {
  return queryOne<Project>(
    `SELECT p.*, a.name as assigned_agent_name, a.avatar_emoji as assigned_agent_emoji
     FROM projects p
     LEFT JOIN agents a ON p.assigned_agent_id = a.id
     WHERE p.id = ?`,
    [id]
  );
}

export function getProjects(filters?: {
  status?: string; // comma-separated statuses
  assigned_agent_id?: string;
}): Project[] {
  let sql = `
    SELECT p.*, a.name as assigned_agent_name, a.avatar_emoji as assigned_agent_emoji
    FROM projects p
    LEFT JOIN agents a ON p.assigned_agent_id = a.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (filters?.status) {
    const statuses = filters.status.split(',').map((s) => s.trim()).filter(Boolean);
    if (statuses.length === 1) {
      sql += ' AND p.status = ?';
      params.push(statuses[0]);
    } else if (statuses.length > 1) {
      sql += ` AND p.status IN (${statuses.map(() => '?').join(',')})`;
      params.push(...statuses);
    }
  }

  if (filters?.assigned_agent_id) {
    sql += ' AND p.assigned_agent_id = ?';
    params.push(filters.assigned_agent_id);
  }

  sql += ' ORDER BY p.created_at ASC';

  return queryAll<Project>(sql, params);
}

export function getActiveProject(): Project | undefined {
  return queryOne<Project>(
    `SELECT p.*, a.name as assigned_agent_name, a.avatar_emoji as assigned_agent_emoji
     FROM projects p
     LEFT JOIN agents a ON p.assigned_agent_id = a.id
     WHERE p.status IN ('research', 'planning', 'building', 'testing')
     ORDER BY p.created_at ASC
     LIMIT 1`,
    []
  );
}

export function updateProject(
  id: string,
  data: UpdateProjectRequest
): boolean {
  const sets: string[] = [];
  const params: unknown[] = [];

  if (data.status !== undefined) {
    sets.push('status = ?');
    params.push(data.status);
  }
  if (data.current_phase !== undefined) {
    sets.push('current_phase = ?');
    params.push(data.current_phase);
  }
  if (data.phases !== undefined) {
    sets.push('phases = ?');
    params.push(JSON.stringify(data.phases));
  }
  if (data.research_notes !== undefined) {
    sets.push('research_notes = ?');
    params.push(data.research_notes);
  }
  if (data.assigned_agent_id !== undefined) {
    sets.push('assigned_agent_id = ?');
    params.push(data.assigned_agent_id);
  }

  if (sets.length === 0) return false;

  sets.push("updated_at = datetime('now')");
  params.push(id);

  const result = run(
    `UPDATE projects SET ${sets.join(', ')} WHERE id = ?`,
    params
  );
  return result.changes > 0;
}

export function addWorkLogEntry(
  id: string,
  entry: Omit<WorkLogEntry, 'timestamp'>
): boolean {
  const project = queryOne<Project>('SELECT work_log FROM projects WHERE id = ?', [id]);
  if (!project) return false;

  const log: WorkLogEntry[] = JSON.parse(project.work_log || '[]');
  log.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });

  const result = run(
    `UPDATE projects SET work_log = ?, updated_at = datetime('now') WHERE id = ?`,
    [JSON.stringify(log), id]
  );
  return result.changes > 0;
}

export function advancePhase(id: string): { success: boolean; message: string } {
  const project = queryOne<Project>('SELECT * FROM projects WHERE id = ?', [id]);
  if (!project) return { success: false, message: 'Project not found' };

  const phases: ProjectPhase[] = JSON.parse(project.phases || '[]');
  const currentIdx = project.current_phase - 1;

  if (currentIdx >= 0 && currentIdx < phases.length) {
    phases[currentIdx].status = 'done';
  }

  if (project.current_phase >= project.total_phases) {
    // All phases complete
    run(
      `UPDATE projects SET status = 'review', phases = ?, updated_at = datetime('now') WHERE id = ?`,
      [JSON.stringify(phases), id]
    );
    return { success: true, message: 'All phases complete — moved to review' };
  }

  const nextIdx = project.current_phase; // 0-indexed next
  if (nextIdx < phases.length) {
    phases[nextIdx].status = 'active';
  }

  const nextStatus = phases[nextIdx]?.name?.toLowerCase().includes('research')
    ? 'research'
    : phases[nextIdx]?.name?.toLowerCase().includes('plan')
      ? 'planning'
      : phases[nextIdx]?.name?.toLowerCase().includes('test')
        ? 'testing'
        : 'building';

  run(
    `UPDATE projects SET current_phase = ?, status = ?, phases = ?, updated_at = datetime('now') WHERE id = ?`,
    [project.current_phase + 1, nextStatus, JSON.stringify(phases), id]
  );

  return {
    success: true,
    message: `Advanced to phase ${project.current_phase + 1}: ${phases[nextIdx]?.name || 'next'}`,
  };
}
