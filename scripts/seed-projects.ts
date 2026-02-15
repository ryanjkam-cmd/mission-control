/**
 * Seed script for Build Projects
 * Run with: npx tsx scripts/seed-projects.ts
 */

import { getDb } from '../src/lib/db/index';
import { createProject } from '../src/lib/db/projects';
import type { CreateProjectRequest, ProjectPhase } from '../src/lib/types/projects';

function makePhases(names: string[]): ProjectPhase[] {
  return names.map((name, i) => ({
    name,
    status: i === 0 ? 'active' as const : 'pending' as const,
    steps: [],
  }));
}

// Find Runner agent ID
const db = getDb();
const runner = db.prepare(
  "SELECT id FROM agents WHERE name LIKE '%Runner%' OR name LIKE '%Body%' LIMIT 1"
).get() as { id: string } | undefined;

const runnerAgentId = runner?.id || null;

if (runnerAgentId) {
  console.log(`Found Runner agent: ${runnerAgentId}`);
} else {
  console.log('No Runner agent found — projects will be unassigned');
}

const SEED_PROJECTS: CreateProjectRequest[] = [
  {
    name: 'Dashboard',
    goal: 'Build live system overview with service health, brain metrics, and recent activity',
    target_path: 'src/app/dashboard/page.tsx',
    assigned_agent_id: runnerAgentId || undefined,
    phases: makePhases(['Research', 'Plan', 'Build', 'Test']),
  },
  {
    name: 'Cost Tracking',
    goal: 'API spend dashboard reading brain_metrics.json with daily/weekly trends and model attribution',
    target_path: 'src/app/cost-tracking/page.tsx',
    assigned_agent_id: runnerAgentId || undefined,
    phases: makePhases(['Research', 'Plan', 'Build', 'Test']),
  },
  {
    name: 'Arkeus Systems',
    goal: 'Daemon health monitor showing launchd service status, brain cycle stats, and system architecture',
    target_path: 'src/app/arkeus-systems/page.tsx',
    assigned_agent_id: runnerAgentId || undefined,
    phases: makePhases(['Research', 'Plan', 'Build', 'Test']),
  },
  {
    name: 'Social Monitoring',
    goal: 'Substack analytics and engagement tracking with real-time feed',
    target_path: 'src/app/social-monitoring/page.tsx',
    assigned_agent_id: runnerAgentId || undefined,
    phases: makePhases(['Research', 'Plan', 'Build', 'Test']),
  },
  {
    name: 'AI Tools',
    goal: 'MCP tool browser showing available tools, usage stats, and recent invocations',
    target_path: 'src/app/ai-tools/page.tsx',
    assigned_agent_id: runnerAgentId || undefined,
    phases: makePhases(['Research', 'Plan', 'Build', 'Test']),
  },
  {
    name: 'Content Studio Enhancements',
    goal: 'Full production calendar with drag-drop, content pipeline visualization, and publishing workflow',
    target_path: 'src/app/content-studio/page.tsx',
    assigned_agent_id: runnerAgentId || undefined,
    phases: makePhases(['Research', 'Plan', 'Build', 'Test']),
  },
];

console.log('Seeding build projects...');

// Check for existing projects to avoid duplicates
const existing = db.prepare('SELECT name FROM projects').all() as { name: string }[];
const existingNames = new Set(existing.map((p) => p.name));

let created = 0;
for (const project of SEED_PROJECTS) {
  if (existingNames.has(project.name)) {
    console.log(`  Skipping "${project.name}" — already exists`);
    continue;
  }
  const id = createProject(project);
  console.log(`  Created "${project.name}" (${id})`);
  created++;
}

console.log(`Done. ${created} projects created, ${SEED_PROJECTS.length - created} skipped.`);
