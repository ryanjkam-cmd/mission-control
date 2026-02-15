/**
 * Database Schema for Mission Control
 * 
 * This defines the current desired schema state.
 * For existing databases, migrations handle schema updates.
 * 
 * IMPORTANT: When adding new tables or columns:
 * 1. Add them here for new databases
 * 2. Create a migration in migrations.ts for existing databases
 */

export const schema = `
-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '📁',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  avatar_emoji TEXT DEFAULT '🤖',
  status TEXT DEFAULT 'standby' CHECK (status IN ('standby', 'working', 'offline')),
  is_master INTEGER DEFAULT 0,
  workspace_id TEXT DEFAULT 'default' REFERENCES workspaces(id),
  soul_md TEXT,
  user_md TEXT,
  agents_md TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Tasks table (Mission Queue)
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'inbox' CHECK (status IN ('planning', 'inbox', 'assigned', 'in_progress', 'testing', 'review', 'done')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_agent_id TEXT REFERENCES agents(id),
  created_by_agent_id TEXT REFERENCES agents(id),
  workspace_id TEXT DEFAULT 'default' REFERENCES workspaces(id),
  business_id TEXT DEFAULT 'default',
  due_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Planning questions table
CREATE TABLE IF NOT EXISTS planning_questions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'text', 'yes_no')),
  options TEXT,
  answer TEXT,
  answered_at TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Planning specs table (locked specifications)
CREATE TABLE IF NOT EXISTS planning_specs (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL UNIQUE REFERENCES tasks(id) ON DELETE CASCADE,
  spec_markdown TEXT NOT NULL,
  locked_at TEXT NOT NULL,
  locked_by TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Conversations table (agent-to-agent or task-related)
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT,
  type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'task')),
  task_id TEXT REFERENCES tasks(id),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Conversation participants
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
  joined_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (conversation_id, agent_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
  sender_agent_id TEXT REFERENCES agents(id),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'task_update', 'file')),
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Events table (for live feed)
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  agent_id TEXT REFERENCES agents(id),
  task_id TEXT REFERENCES tasks(id),
  message TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Businesses/Workspaces table (legacy - kept for compatibility)
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- OpenClaw session mapping
CREATE TABLE IF NOT EXISTS openclaw_sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  openclaw_session_id TEXT NOT NULL,
  channel TEXT,
  status TEXT DEFAULT 'active',
  session_type TEXT DEFAULT 'persistent',
  task_id TEXT REFERENCES tasks(id),
  ended_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Task activities table (for real-time activity log)
CREATE TABLE IF NOT EXISTS task_activities (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agents(id),
  activity_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Task deliverables table (files, URLs, artifacts)
CREATE TABLE IF NOT EXISTS task_deliverables (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  deliverable_type TEXT NOT NULL,
  title TEXT NOT NULL,
  path TEXT,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Quick links table (hot links manager)
CREATE TABLE IF NOT EXISTS quick_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Notion', 'Google', 'External', 'Tool')),
  tags TEXT,
  clicks INTEGER DEFAULT 0,
  last_accessed TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Action queue table (approval system)
CREATE TABLE IF NOT EXISTS action_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'auto_approved', 'edited')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  generated_at TEXT DEFAULT (datetime('now')),
  reviewed_at TEXT,
  action_data TEXT NOT NULL,
  context_data TEXT,
  confidence REAL,
  user_feedback TEXT,
  edited_data TEXT,
  executed_at TEXT
);

-- Auto-approve rules table
CREATE TABLE IF NOT EXISTS auto_approve_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_type TEXT NOT NULL,
  conditions TEXT NOT NULL,
  enabled INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  times_triggered INTEGER DEFAULT 0,
  success_rate REAL
);

-- Build Projects table (autonomous project tracking)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  goal TEXT,
  status TEXT DEFAULT 'queued' CHECK (status IN ('queued','research','planning','building','testing','review','done','paused')),
  current_phase INTEGER DEFAULT 1,
  total_phases INTEGER DEFAULT 1,
  phases TEXT,
  assigned_agent_id TEXT REFERENCES agents(id),
  target_path TEXT,
  research_notes TEXT,
  work_log TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_agents_workspace ON agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_activities_task ON task_activities(task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deliverables_task ON task_deliverables(task_id);
CREATE INDEX IF NOT EXISTS idx_openclaw_sessions_task ON openclaw_sessions(task_id);
CREATE INDEX IF NOT EXISTS idx_planning_questions_task ON planning_questions(task_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_quick_links_category ON quick_links(category);
CREATE INDEX IF NOT EXISTS idx_quick_links_clicks ON quick_links(clicks DESC);
CREATE INDEX IF NOT EXISTS idx_action_queue_status ON action_queue(status);
CREATE INDEX IF NOT EXISTS idx_action_queue_type ON action_queue(action_type);
CREATE INDEX IF NOT EXISTS idx_action_queue_generated ON action_queue(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_auto_approve_rules_type ON auto_approve_rules(action_type);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_assigned ON projects(assigned_agent_id);
`;
