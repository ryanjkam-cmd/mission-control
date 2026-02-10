# Approval Queue Backend - Implementation Complete

## Overview

Built centralized action approval queue infrastructure for Mission Control to bridge Brain MCP output with user review and execution.

## Database Schema

Created two new tables in `mission-control.db`:

### `action_queue`
Stores all proposed actions from brain_body for user review:

```sql
CREATE TABLE action_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_type TEXT NOT NULL,           -- email_reply, imessage, calendar_block, etc.
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'auto_approved', 'edited')),
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  generated_at TEXT DEFAULT (datetime('now')),
  reviewed_at TEXT,
  action_data TEXT NOT NULL,           -- JSON: {to, subject, body} etc.
  context_data TEXT,                   -- JSON: {original_email, calendar_conflicts} etc.
  confidence REAL,                     -- 0.0-1.0 from brain
  user_feedback TEXT,                  -- why denied/edited
  edited_data TEXT,                    -- JSON: if status='edited', what changed
  executed_at TEXT
);
```

### `auto_approve_rules`
Defines conditions for automatic approval:

```sql
CREATE TABLE auto_approve_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action_type TEXT NOT NULL,
  conditions TEXT NOT NULL,            -- JSON: [{field, op, value}]
  enabled INTEGER DEFAULT 1,           -- SQLite boolean
  created_at TEXT DEFAULT (datetime('now')),
  times_triggered INTEGER DEFAULT 0,
  success_rate REAL                    -- % user didn't override
);
```

## API Routes

### Queue Management

#### `GET /api/queue`
Fetch actions with optional filters:
- Query params: `status`, `action_type`, `risk_level`, `limit`, `offset`
- Returns: `{ actions: ActionQueueItem[] }`

#### `POST /api/queue`
Create new action (called by brain_body integration):
- Body: `{ action_type, action_data, context_data?, risk_level, confidence? }`
- Checks for auto-approve rules
- Returns: `{ id, auto_approved?, rule_id? }`

#### `GET /api/queue/[id]`
Fetch single action with full context:
- Returns: `{ action: ActionQueueItem }` with parsed JSON fields

### Action Review

#### `POST /api/queue/[id]/approve`
Approve and execute action:
- Updates status to 'approved'
- Marks executed_at timestamp
- TODO: Execute via MCP (email, calendar, etc.)
- Returns: `{ success: true, execution: { success, message } }`

#### `POST /api/queue/[id]/deny`
Deny action with feedback:
- Body: `{ feedback: string }`
- Updates status to 'denied'
- Records user_feedback for learning
- Returns: `{ success: true, message }`

#### `POST /api/queue/[id]/edit`
Save edited version:
- Body: `{ edited_data: object, execute?: boolean }`
- Updates status to 'edited'
- Records edited_data for learning
- Optionally executes immediately
- Returns: `{ success: true, edited: true, execution? }`

### Rules Management

#### `GET /api/rules`
Fetch auto-approve rules:
- Query params: `action_type`, `enabled`
- Returns: `{ rules: AutoApproveRule[] }` with parsed conditions

#### `POST /api/rules`
Create new rule:
- Body: `{ action_type, conditions: [{field, op, value}] }`
- Returns: `{ id }`

#### `PATCH /api/rules/[id]`
Enable/disable rule:
- Body: `{ enabled: boolean }`
- Returns: `{ success: true, enabled }`

### Analytics

#### `GET /api/queue/stats`
Learning dashboard statistics (already exists):
- KPIs: total_reviewed, approval_rate, auto_approve_rate, avg_confidence
- Trends: approval over time, confidence by type
- Breakdowns: by action type, risk level
- Top denial patterns
- Rule effectiveness

## Database Helper Functions

Created `/Users/ryankam/arkeus-mesh/mission-control/src/lib/db/queue.ts`:

**Action Operations:**
- `createAction(data)` → number (ID)
- `getAction(id)` → ActionQueueItem | undefined
- `getActions(filters?)` → ActionQueueItem[]
- `updateAction(id, updates)` → void
- `markActionExecuted(id)` → void

**Rule Operations:**
- `createRule(data)` → number (ID)
- `getRule(id)` → AutoApproveRule | undefined
- `getRules(filters?)` → AutoApproveRule[]
- `updateRule(id, updates)` → void
- `incrementRuleTriggers(id)` → void

**Utilities:**
- `getQueueStats()` → QueueStats
- `checkAutoApprove(actionType, actionData)` → AutoApproveRule | null

## TypeScript Types

Created `/Users/ryankam/arkeus-mesh/mission-control/src/lib/types/queue.ts`:

- `ActionType` - 8 types supported
- `ActionStatus` - 5 statuses
- `RiskLevel` - low/medium/high
- `ActionQueueItem` - Full action record
- `AutoApproveRule` - Rule record
- `ParsedActionData` - Typed action data
- `QueueStats` - Dashboard metrics

## Migration

Added migration #006 to `/Users/ryankam/arkeus-mesh/mission-control/src/lib/db/migrations.ts`:

```typescript
{
  id: '006',
  name: 'add_approval_queue',
  up: (db) => {
    // Creates both tables + indexes
  }
}
```

## Testing

All endpoints verified with curl:

```bash
# Create action
curl -X POST http://localhost:3000/api/queue \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "email_reply",
    "action_data": {"to": "test@test.com", "body": "Hello"},
    "risk_level": "low",
    "confidence": 0.85
  }'

# Approve action
curl -X POST http://localhost:3000/api/queue/1/approve

# Deny action
curl -X POST http://localhost:3000/api/queue/2/deny \
  -H "Content-Type: application/json" \
  -d '{"feedback": "Too risky"}'

# Get stats
curl http://localhost:3000/api/queue/stats
```

## Integration Points

### Brain Body → Queue
Brain body will POST to `/api/queue` with each proposed action:

```bash
curl -X POST http://localhost:8788/api/queue \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "email_reply",
    "action_data": {
      "to": "recruiter@company.com",
      "subject": "Re: Opportunity",
      "body": "Thank you, not interested at this time."
    },
    "context_data": {
      "original_email": {...},
      "user_preference": "Always draft replies, never auto-send"
    },
    "risk_level": "medium",
    "confidence": 0.82
  }'
```

### Queue → Learner
When action is approved/denied/edited, call brain_learner.py:

```python
# In approve/deny/edit handlers (TODO)
from subprocess import run
run([
  'python3',
  '~/arkeus-mesh/memory/proactive/brain_learner.py',
  'record',
  json.dumps({
    'action_type': action.action_type,
    'outcome': 'approved' | 'denied' | 'edited',
    'confidence': action.confidence,
    'user_feedback': action.user_feedback,
    'edited_diff': diff(action.action_data, action.edited_data)
  })
])
```

### Queue → MCP Execution
When action approved, execute via appropriate MCP:

```typescript
// In approve handler (TODO)
switch (action.action_type) {
  case 'email_reply':
    await gmailMCP.send({ to, subject, body });
    break;
  case 'calendar_block':
    await calendarMCP.create({ title, start, end });
    break;
  case 'imessage':
    await exec(`osascript -e 'tell application "Messages"...'`);
    break;
}
```

## Files Created

1. `/Users/ryankam/arkeus-mesh/mission-control/src/lib/db/queue.ts` (338 lines)
2. `/Users/ryankam/arkeus-mesh/mission-control/src/lib/types/queue.ts` (122 lines)
3. `/Users/ryankam/arkeus-mesh/mission-control/src/app/api/queue/route.ts` (98 lines)
4. `/Users/ryankam/arkeus-mesh/mission-control/src/app/api/queue/[id]/route.ts` (37 lines)
5. `/Users/ryankam/arkeus-mesh/mission-control/src/app/api/queue/[id]/approve/route.ts` (85 lines)
6. `/Users/ryankam/arkeus-mesh/mission-control/src/app/api/queue/[id]/deny/route.ts` (49 lines)
7. `/Users/ryankam/arkeus-mesh/mission-control/src/app/api/queue/[id]/edit/route.ts` (68 lines)
8. `/Users/ryankam/arkeus-mesh/mission-control/src/app/api/rules/route.ts` (58 lines)
9. `/Users/ryankam/arkeus-mesh/mission-control/src/app/api/rules/[id]/route.ts` (51 lines)

Updated:
- `/Users/ryankam/arkeus-mesh/mission-control/src/lib/db/migrations.ts` (added migration #006)
- `/Users/ryankam/arkeus-mesh/mission-control/src/lib/db/schema.ts` (added tables + indexes)

## Success Criteria

- ✅ All tables created with proper constraints
- ✅ All API routes return proper TypeScript types
- ✅ Database helper exports type-safe functions
- ✅ API routes have error handling
- ✅ Tested with curl - all CRUD operations work
- ✅ Auto-approve rule matching implemented
- ✅ Stats endpoint provides learning metrics
- ✅ Next.js 15 compatibility (Promise params)

## Next Steps

1. Build React frontend for approval queue UI
2. Wire up MCP execution in approve handler
3. Add learner integration in approve/deny/edit handlers
4. Add webhook for brain_body to push actions
5. Build real-time SSE updates for new actions
6. Add confidence threshold auto-approval
7. Add batch operations (approve/deny multiple)
