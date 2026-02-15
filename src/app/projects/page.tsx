'use client';

import { useState, useEffect } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { Hammer, ChevronDown, ChevronRight, Clock, User } from 'lucide-react';
import type { ParsedProject, ProjectStatus, ProjectPhase } from '@/lib/types/projects';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  queued: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  research: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  planning: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  building: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  testing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  review: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  done: 'bg-green-500/20 text-green-400 border-green-500/30',
  paused: 'bg-red-500/20 text-red-400 border-red-500/30',
};

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[status]}`}
    >
      {status}
    </span>
  );
}

function PhaseProgress({ phases, currentPhase, totalPhases }: { phases: ProjectPhase[]; currentPhase: number; totalPhases: number }) {
  const pct = totalPhases > 0 ? ((currentPhase - 1) / totalPhases) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-mc-text-secondary">
        <span>Phase {currentPhase}/{totalPhases}</span>
        <span>{phases[currentPhase - 1]?.name || ''}</span>
      </div>
      <div className="w-full h-1.5 bg-mc-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all"
          style={{ width: `${Math.max(pct, 5)}%` }}
        />
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: ParsedProject }) {
  const [expanded, setExpanded] = useState(false);

  const currentPhase = project.phases[project.current_phase - 1];
  const nextStep = currentPhase?.steps?.find((s) => s.status === 'pending');
  const lastLog = project.work_log[project.work_log.length - 1];

  return (
    <div className="bg-mc-bg-secondary border border-mc-border rounded-lg overflow-hidden hover:border-mc-accent/30 transition-colors">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-mc-text truncate">
                {project.name}
              </h3>
              <StatusBadge status={project.status} />
            </div>
            {project.goal && (
              <p className="text-xs text-mc-text-secondary line-clamp-2">
                {project.goal}
              </p>
            )}
          </div>
          <div className="ml-2 flex-shrink-0">
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-mc-text-secondary" />
            ) : (
              <ChevronRight className="w-4 h-4 text-mc-text-secondary" />
            )}
          </div>
        </div>

        <PhaseProgress
          phases={project.phases}
          currentPhase={project.current_phase}
          totalPhases={project.total_phases}
        />

        <div className="mt-3 flex items-center gap-4 text-xs text-mc-text-secondary">
          {project.assigned_agent_name && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {project.assigned_agent_emoji} {project.assigned_agent_name}
            </span>
          )}
          {nextStep && (
            <span className="truncate">
              Next: {nextStep.desc}
            </span>
          )}
          {lastLog && (
            <span className="flex items-center gap-1 ml-auto flex-shrink-0">
              <Clock className="w-3 h-3" />
              {new Date(lastLog.timestamp).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Expanded: Work Log */}
      {expanded && project.work_log.length > 0 && (
        <div className="border-t border-mc-border p-4 bg-mc-bg">
          <h4 className="text-xs font-medium text-mc-text-secondary uppercase tracking-wider mb-3">
            Work Log
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...project.work_log].reverse().map((entry, i) => (
              <div
                key={i}
                className="flex gap-3 text-xs"
              >
                <span className="text-mc-text-secondary flex-shrink-0 w-32">
                  {new Date(entry.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <div>
                  <span className="text-mc-text font-medium">{entry.action}</span>
                  {entry.details && (
                    <span className="text-mc-text-secondary ml-1">
                      — {entry.details}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {expanded && project.work_log.length === 0 && (
        <div className="border-t border-mc-border p-4 bg-mc-bg">
          <p className="text-xs text-mc-text-secondary text-center">
            No work log entries yet. Runner will populate this as it works.
          </p>
        </div>
      )}

      {/* Target path */}
      {expanded && project.target_path && (
        <div className="border-t border-mc-border px-4 py-2 bg-mc-bg">
          <span className="text-xs text-mc-text-secondary">
            Target: <code className="text-mc-text">{project.target_path}</code>
          </span>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const { projects, loading, error, fetchProjects } = useProjectStore();
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchProjects(statusFilter || undefined);
  }, [fetchProjects, statusFilter]);

  const activeCount = projects.filter((p) =>
    ['research', 'planning', 'building', 'testing'].includes(p.status)
  ).length;
  const doneCount = projects.filter((p) => p.status === 'done').length;

  return (
    <div className="min-h-screen bg-mc-bg">
      {/* Header */}
      <header className="border-b border-mc-border bg-mc-bg-secondary">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Hammer className="w-6 h-6 text-mc-accent" />
                <h1 className="text-2xl font-bold">Build Projects</h1>
              </div>
              <p className="text-mc-text-secondary text-sm">
                Autonomous projects — Arkeus building itself
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-yellow-400">
                    {activeCount} active
                  </span>
                </div>
              )}
              <div className="text-sm text-mc-text-secondary">
                {doneCount}/{projects.length} done
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-mc-bg border border-mc-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-mc-accent"
              >
                <option value="">All Statuses</option>
                <option value="queued">Queued</option>
                <option value="research">Research</option>
                <option value="planning">Planning</option>
                <option value="building">Building</option>
                <option value="testing">Testing</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading && (
          <div className="text-center py-12 text-mc-text-secondary">
            Loading projects...
          </div>
        )}

        {error && (
          <div className="text-center py-12 text-red-400">
            Error: {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="text-center py-12 text-mc-text-secondary">
            No projects yet. Seed initial projects to get started.
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
