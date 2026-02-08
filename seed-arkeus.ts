// Seed Arkeus workspace and agents into Mission Control

import { getDb, closeDb } from './src/lib/db/index';
import { v4 as uuidv4 } from 'uuid';

const ARKEUS_AGENTS = [
  {
    name: 'Gateway',
    role: 'API & Routing',
    emoji: '🌐',
    desc: 'Core infrastructure server on port 8787, handles all API requests and routing',
    status: 'working' as const
  },
  {
    name: 'Brain (Thinker)',
    role: 'Strategic Thinking',
    emoji: '🧠',
    desc: 'Brain MCP - thinking, evaluation, model routing across 6 life domains',
    status: 'standby' as const
  },
  {
    name: 'Runner (Body)',
    role: 'Task Execution',
    emoji: '🏃',
    desc: 'Brain Body - Claude Code executor running 7x/day via claude -p',
    status: 'standby' as const
  },
  {
    name: 'Learner',
    role: 'Outcome Tracking',
    emoji: '📊',
    desc: 'Learning.db bridge - reads reflections/ICL before runs, records outcomes after',
    status: 'working' as const
  },
  {
    name: 'Briefer',
    role: 'Daily Rhythm',
    emoji: '📱',
    desc: 'Morning/afternoon/evening Telegram briefs at 8am, 2pm, 7pm',
    status: 'working' as const
  },
  {
    name: 'Consolidator',
    role: 'Memory Pruning',
    emoji: '🗂️',
    desc: 'Memory consolidation - pruning + weight adjustment at 3am daily',
    status: 'standby' as const
  }
];

async function seedArkeus() {
  console.log('🌱 Seeding Arkeus workspace...');

  const db = getDb();
  const now = new Date().toISOString();

  // Create Arkeus workspace
  const workspaceId = uuidv4();
  db.prepare(`
    INSERT INTO workspaces (id, name, slug, description, icon, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    workspaceId,
    'Arkeus Executive System',
    'arkeus',
    'Ryan\'s AI executive assistant with Brain/Body architecture',
    '🤖',
    now,
    now
  );

  console.log(`✅ Created workspace: Arkeus (${workspaceId})`);

  // Create Arkeus agents
  const agentIds: string[] = [];

  for (const agent of ARKEUS_AGENTS) {
    const agentId = uuidv4();
    agentIds.push(agentId);

    db.prepare(`
      INSERT INTO agents (id, name, role, description, avatar_emoji, status, is_master, workspace_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      agentId,
      agent.name,
      agent.role,
      agent.desc,
      agent.emoji,
      agent.status,
      0,
      workspaceId,
      now,
      now
    );

    console.log(`✅ Created agent: ${agent.name} (${agent.emoji})`);
  }

  // Create sample tasks from recent brain body actions
  const tasks = [
    {
      title: 'Review unread Gmail (15 messages)',
      status: 'inbox' as const,
      priority: 'normal' as const
    },
    {
      title: 'Process Apple Reminders due today',
      status: 'assigned' as const,
      priority: 'high' as const
    },
    {
      title: 'Analyze calendar conflicts for next 7 days',
      status: 'in_progress' as const,
      priority: 'high' as const
    },
    {
      title: 'Daily rhythm briefing - Morning',
      status: 'done' as const,
      priority: 'normal' as const
    }
  ];

  for (let i = 0; i < tasks.length; i++) {
    const taskId = uuidv4();
    const task = tasks[i];
    const assignedTo = task.status !== 'inbox' ? agentIds[i % agentIds.length] : null;

    db.prepare(`
      INSERT INTO tasks (id, title, status, priority, assigned_agent_id, workspace_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      taskId,
      task.title,
      task.status,
      task.priority,
      assignedTo,
      workspaceId,
      now,
      now
    );
  }

  console.log(`✅ Created ${tasks.length} sample tasks`);

  // Create system event
  db.prepare(`
    INSERT INTO events (id, type, message, created_at)
    VALUES (?, ?, ?, ?)
  `).run(
    uuidv4(),
    'system',
    'Arkeus workspace initialized',
    now
  );

  console.log('✅ Arkeus workspace seeded successfully!');
  console.log(`   Workspace ID: ${workspaceId}`);
  console.log(`   Agents: ${ARKEUS_AGENTS.length}`);
  console.log(`   Tasks: ${tasks.length}`);

  closeDb();
}

seedArkeus().catch(console.error);
