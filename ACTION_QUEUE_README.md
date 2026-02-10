# Action Queue - Mission Control

## Overview

The Action Queue is a human-in-the-loop approval system for AI-proposed actions from Brain Body. It provides a visual interface for reviewing, approving, denying, or editing actions before they are executed.

## Features

### 1. Action Queue Grid (`/action-queue`)
- View all pending actions from Brain Body
- Filter by status, type, and risk level
- Real-time updates (polling every 30s)
- Bulk approve low-risk actions
- Click any action to open review modal

### 2. Review Modal
- Full action details with context
- Type-specific previews (email, iMessage, calendar, etc.)
- Risk level indicator (low/medium/high)
- Confidence score visualization
- Edit mode for modifying action parameters
- Approve/Deny/Edit actions
- Auto-approve checkbox (creates rule for similar actions)
- Feedback textarea for learning loop

### 3. Action Types
- **Email**: Draft email replies (never auto-send per preferences)
- **iMessage**: Send messages to contacts
- **Calendar**: Block focus time, create events
- **Reminder**: Create Apple Reminders
- **Task**: Create Notion tasks
- **Health**: Workout suggestions, health reminders
- **Trip**: Travel research and planning
- **Notification**: System notifications

### 4. Risk Levels
- **Low**: Routine actions, minimal impact (e.g., calendar blocks, health reminders)
- **Medium**: Moderate impact, requires review (e.g., iMessages to family, trip planning)
- **High**: Significant impact, always requires approval (e.g., work commitments, external communication)

## Components

### Pages
- `src/app/action-queue/page.tsx` - Main queue page with filters

### Components
- `src/components/queue/ActionQueueGrid.tsx` - Grid of action cards
- `src/components/queue/ActionCard.tsx` - Individual action card
- `src/components/queue/ReviewModal.tsx` - Full-screen review modal
- `src/components/queue/TypeBadge.tsx` - Action type badge with icon

### State Management
- `src/stores/queueStore.ts` - Zustand store for queue state

### API Endpoints
- `GET /api/queue` - Fetch actions with filters
- `POST /api/queue` - Create new action (auto-approve check)
- `POST /api/queue/[id]/approve` - Approve action
- `POST /api/queue/[id]/deny` - Deny action with feedback
- `PUT /api/queue/[id]/edit` - Edit action parameters
- `GET /api/queue/stats` - Queue statistics
- `GET /api/queue/rules` - Auto-approve rules

### Database
- Table: `action_queue` (SQLite)
- Schema: See `mission-control.db`

## Usage

### View Pending Actions
1. Navigate to `/action-queue` in Mission Control
2. See all pending actions in grid view
3. Use filters to narrow by status, type, or risk level

### Review an Action
1. Click on any action card
2. Review full details, context, and parameters
3. Choose to:
   - **Approve**: Execute the action as proposed
   - **Deny**: Reject with feedback (feeds learner)
   - **Edit**: Modify parameters and resubmit

### Bulk Approve
1. Filter for pending actions
2. Click "Approve All Low-Risk" button
3. Confirm bulk approval

### Create Auto-Approve Rule
1. Review a low-risk action
2. Check "Auto-approve similar actions"
3. Approve action
4. Future similar actions will be auto-approved

## Development

### Seed Test Data
```bash
npx tsx scripts/seed-queue.ts
```

### Run Dev Server
```bash
npm run dev
```

### Database Queries
```bash
# View all actions
sqlite3 mission-control.db "SELECT * FROM action_queue;"

# View pending actions
sqlite3 mission-control.db "SELECT id, action_type, risk_level FROM action_queue WHERE status='pending';"

# Clear queue
sqlite3 mission-control.db "DELETE FROM action_queue;"
```

## Integration with Brain Body

Brain Body (`~/arkeus-mesh/memory/brain_body.sh`) generates actions during its 7x/day cycles. Instead of executing directly, it can propose actions to the queue:

```typescript
// In Brain Body cycle
const action = {
  action_type: 'email_reply',
  risk_level: 'low',
  confidence: 0.85,
  action_data: {
    to: 'recruiter@example.com',
    subject: 'Re: Job opportunity',
    body: 'Thank you for reaching out...',
  },
  context_data: {
    context: 'User preference: never auto-send emails',
  },
};

// POST to /api/queue
const response = await fetch('/api/queue', {
  method: 'POST',
  body: JSON.stringify(action),
});
```

## Future Enhancements

- [ ] Real-time SSE updates (replace polling)
- [ ] Action execution from UI (currently manual)
- [ ] Analytics dashboard (approval rate, common patterns)
- [ ] Rule management UI
- [ ] Action history and audit trail
- [ ] Undo recently approved actions
- [ ] Group similar actions for batch review
- [ ] Smart notifications (Telegram, macOS)
- [ ] Learning feedback loop visualization
- [ ] Export queue data to CSV
