import { create } from 'zustand';
import type { ParsedProject, CreateProjectRequest, UpdateProjectRequest } from '@/lib/types/projects';

interface ProjectState {
  projects: ParsedProject[];
  activeProject: ParsedProject | null;
  loading: boolean;
  error: string | null;

  fetchProjects: (status?: string) => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<string>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<void>;
  addLogEntry: (id: string, action: string, details?: string) => Promise<void>;
  advancePhase: (id: string) => Promise<{ success: boolean; message: string }>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  loading: false,
  error: null,

  fetchProjects: async (status?: string) => {
    set({ loading: true, error: null });
    try {
      const url = status
        ? `/api/projects?status=${encodeURIComponent(status)}`
        : '/api/projects';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch projects');
      const projects: ParsedProject[] = await res.json();

      const active = projects.find((p) =>
        ['research', 'planning', 'building', 'testing'].includes(p.status)
      ) || null;

      set({ projects, activeProject: active, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch projects',
        loading: false,
      });
    }
  },

  createProject: async (data: CreateProjectRequest) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create project');
    const { id } = await res.json();
    await get().fetchProjects();
    return id;
  },

  updateProject: async (id: string, data: UpdateProjectRequest) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update project');
    await get().fetchProjects();
  },

  addLogEntry: async (id: string, action: string, details?: string) => {
    const res = await fetch(`/api/projects/${id}/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, details }),
    });
    if (!res.ok) throw new Error('Failed to add log entry');
    await get().fetchProjects();
  },

  advancePhase: async (id: string) => {
    const res = await fetch(`/api/projects/${id}/advance`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to advance phase');
    const result = await res.json();
    await get().fetchProjects();
    return result;
  },
}));
