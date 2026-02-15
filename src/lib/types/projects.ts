/**
 * Type definitions for the Build Projects system
 * Tracks autonomous project work by the Runner (brain_body.sh)
 */

export type ProjectStatus =
  | 'queued'
  | 'research'
  | 'planning'
  | 'building'
  | 'testing'
  | 'review'
  | 'done'
  | 'paused';

export interface Project {
  id: string;
  name: string;
  goal?: string;
  status: ProjectStatus;
  current_phase: number;
  total_phases: number;
  phases?: string; // JSON string of ProjectPhase[]
  assigned_agent_id?: string;
  target_path?: string;
  research_notes?: string;
  work_log?: string; // JSON string of WorkLogEntry[]
  created_at: string;
  updated_at: string;
}

export interface ParsedProject extends Omit<Project, 'phases' | 'work_log'> {
  phases: ProjectPhase[];
  work_log: WorkLogEntry[];
  assigned_agent_name?: string;
  assigned_agent_emoji?: string;
}

export interface ProjectPhase {
  name: string;
  status: 'pending' | 'active' | 'done';
  steps: ProjectStep[];
}

export interface ProjectStep {
  desc: string;
  status: 'pending' | 'in_progress' | 'done' | 'failed';
  completed_at?: string;
}

export interface WorkLogEntry {
  timestamp: string;
  cycle: string;
  action: string;
  details?: string;
}

export interface CreateProjectRequest {
  name: string;
  goal?: string;
  phases?: ProjectPhase[];
  assigned_agent_id?: string;
  target_path?: string;
}

export interface UpdateProjectRequest {
  status?: ProjectStatus;
  current_phase?: number;
  phases?: ProjectPhase[];
  research_notes?: string;
  assigned_agent_id?: string;
}
