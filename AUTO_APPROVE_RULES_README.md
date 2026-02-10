# Auto-Approve Rules System

Automated rule-based approval system for the Mission Control action queue. Rules evaluate incoming actions and automatically approve those matching defined conditions with high success rates.

## Architecture

```
Action Creation → Rule Evaluation → Auto-Approve or Manual Review
                      ↓
                 [Condition Engine]
                      ↓
              Match Found (≥80% success)
                      ↓
               Status: auto_approved
                      ↓
            Increment Rule Triggers
```

## Components

### 1. Backend (API Routes)

**`/api/queue/route.ts`**
- `GET /api/queue` - List actions with filters (status, action_type, limit)
- `POST /api/queue` - Create action with auto-approve check

**`/api/queue/rules/route.ts`**
- `GET /api/queue/rules` - List all rules (filters: action_type, enabled)
- `POST /api/queue/rules` - Create new rule

**`/api/queue/rules/[id]/route.ts`**
- `PATCH /api/queue/rules/[id]` - Update rule (enable/disable, success_rate)
- `DELETE /api/queue/rules/[id]` - Delete rule

### 2. Database (Migration 006)

**`action_queue` table:**
- `id` - Auto-increment primary key
- `action_type` - Type of action (email_reply, imessage, etc.)
- `status` - pending | approved | denied | auto_approved | edited
- `risk_level` - low | medium | high
- `action_data` - JSON string with action details
- `context_data` - JSON string with context
- `confidence` - AI confidence score (0-1)
- `generated_at` - Timestamp
- `reviewed_at` - Approval/denial timestamp
- `executed_at` - Execution timestamp
- `user_feedback` - Denial reason or comments
- `edited_data` - JSON string if user edited before approval

**`auto_approve_rules` table:**
- `id` - Auto-increment primary key
- `action_type` - Type of action this rule applies to
- `conditions` - JSON array of conditions (AND logic)
- `enabled` - Boolean (1/0 in SQLite)
- `created_at` - Timestamp
- `times_triggered` - Counter for rule usage
- `success_rate` - 0-1 float (null if never overridden)

### 3. Rule Evaluation Engine (`/lib/rule-evaluator.ts`)

**`evaluateRules(action, rules)`**
- Iterates through enabled rules for action type
- Skips rules with success_rate < 0.8
- Evaluates all conditions (AND logic)
- Returns first matching rule or null

**Condition Operators:**
- `equals` - Exact match
- `not_equals` - Not equal
- `contains` - String contains (case-insensitive)
- `startsWith` - String starts with
- `endsWith` - String ends with
- `lt` - Less than (numeric)
- `gt` - Greater than (numeric)
- `in` - Value in array or comma-separated list
- `regex` - Regular expression match

**`describeRule(rule)`**
- Generates plain English description
- Example: "email reply where recipient = "recruiter@company.com" AND body_length < 200"

**`updateSuccessRate(rule, wasSuccessful)`**
- Running average calculation
- Triggered when user overrides auto-approval

### 4. UI Components

**`AutoApproveRules.tsx`**
- Active rules list with cards showing:
  - Rule description
  - Enabled/disabled toggle
  - Times triggered counter
  - Success rate percentage (color-coded)
  - Edit/Delete buttons
- "Create New Rule" button → opens modal
- Real-time rule effectiveness stats

**`RuleBuilderModal.tsx`**
- 3-step wizard:
  - Step 1: Select action type
  - Step 2: Add conditions (multiple allowed)
  - Step 3: Preview rule in plain English
- Validates at least one condition required
- Saves via POST /api/queue/rules

**`ConditionBuilder.tsx`**
- Single condition row component
- Field dropdown (dynamic per action type)
- Operator dropdown
- Value input
- Remove button
- Supports chaining multiple conditions

### 5. Pages

**`/action-queue`** - Main queue page
- Filter by status, type, risk level
- Bulk approve low-risk actions
- Link to "Auto-Approve Rules" settings

**`/action-queue/rules`** - Rules management
- AutoApproveRules component
- Back link to queue

## Field Options by Action Type

```typescript
email_reply: ['recipient', 'subject', 'body_length', 'has_attachment', 'tone']
imessage: ['recipient', 'message_length', 'contains_keyword', 'time_of_day']
calendar_block: ['title', 'duration_minutes', 'time_of_day', 'day_of_week']
health_suggestion: ['suggestion_type', 'text_length', 'priority']
trip_plan: ['destination', 'duration_days', 'budget', 'has_flights']
task_create: ['title', 'priority', 'assigned_to']
reminder_create: ['title', 'priority', 'due_date']
notion_update: ['database', 'property', 'value']
```

## Usage Examples

### Example 1: Auto-approve short recruiter emails

**Rule:**
- Action Type: `email_reply`
- Conditions:
  - `recipient contains "recruiter"`
  - `body_length < 200`

**Result:** All email replies to recruiters under 200 chars auto-approved

### Example 2: Auto-approve low-risk calendar blocks

**Rule:**
- Action Type: `calendar_block`
- Conditions:
  - `title contains "Focus Time"`
  - `duration_minutes = 90`

**Result:** All 90-minute focus time blocks auto-approved

### Example 3: Auto-approve health suggestions

**Rule:**
- Action Type: `health_suggestion`
- Conditions:
  - `suggestion_type = "hydration"`

**Result:** All hydration reminders auto-approved

## Success Rate Logic

**Initial state:**
- New rules have `success_rate = null`
- Treated as 100% for first trigger

**After user override:**
- If user approves auto-approved action → success increases
- If user denies auto-approved action → success decreases
- Running average: `(current_success * times_triggered + new_result) / (times_triggered + 1)`

**Auto-approve threshold:**
- Rules with `success_rate >= 0.8` (80%) are active
- Rules below 80% are skipped (user must review)

## API Usage

### Create Action (with auto-approve check)

```bash
curl -X POST http://localhost:3000/api/queue \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "email_reply",
    "action_data": {
      "recipient": "recruiter@company.com",
      "subject": "Re: Senior CMO Role",
      "body": "Thanks for reaching out. Not interested at this time.",
      "body_length": 58
    },
    "risk_level": "low",
    "confidence": 0.85
  }'
```

**Response:**
```json
{
  "id": 42,
  "auto_approved": true,
  "rule_id": 3
}
```

### Create Rule

```bash
curl -X POST http://localhost:3000/api/queue/rules \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "email_reply",
    "conditions": [
      { "field": "recipient", "op": "contains", "value": "recruiter" },
      { "field": "body_length", "op": "lt", "value": 200 }
    ]
  }'
```

### Toggle Rule

```bash
curl -X PATCH http://localhost:3000/api/queue/rules/3 \
  -H "Content-Type: application/json" \
  -d '{ "enabled": false }'
```

### Delete Rule

```bash
curl -X DELETE http://localhost:3000/api/queue/rules/3
```

## Integration with Brain Body

Brain Body creates actions via `POST /api/queue`. The evaluator runs automatically:

```typescript
// In Brain Body action creation
const action = {
  action_type: 'email_reply',
  action_data: { recipient, subject, body, body_length: body.length },
  risk_level: 'low',
  confidence: 0.85
};

// POST to /api/queue
// If rule matches → status = 'auto_approved'
// If no match → status = 'pending' (human review)
```

## Success Criteria

- ✅ Rule builder creates rules via API
- ✅ Rule evaluator correctly matches actions to rules
- ✅ Auto-approve happens on queue creation if rule matches
- ✅ Success rate updates when user overrides
- ✅ Active rules list shows effectiveness stats
- ✅ Enable/disable toggle works
- ✅ Field options dynamic per action type
- ✅ Plain English rule descriptions
- ✅ 3-step wizard with validation
- ✅ AND logic for multiple conditions

## Future Enhancements

1. **OR logic support** - Allow conditions with OR instead of only AND
2. **Time-based rules** - "Auto-approve only during work hours"
3. **Rule priority** - Order rules by priority for conflict resolution
4. **Rule templates** - Pre-built rules for common patterns
5. **A/B testing** - Test new rules on 10% of actions before full rollout
6. **Rule analytics** - Track which rules save the most time
7. **Bulk rule operations** - Enable/disable multiple rules at once
8. **Rule versioning** - Track changes to rules over time

## Files Created

### Backend
- `/src/app/api/queue/rules/route.ts` (68 lines)
- `/src/app/api/queue/rules/[id]/route.ts` (65 lines)
- `/src/lib/rule-evaluator.ts` (151 lines)
- `/src/lib/queue-types.ts` (44 lines)

### Frontend
- `/src/components/queue/AutoApproveRules.tsx` (168 lines)
- `/src/components/queue/RuleBuilderModal.tsx` (256 lines)
- `/src/components/queue/ConditionBuilder.tsx` (68 lines)
- `/src/app/action-queue/rules/page.tsx` (33 lines)

### Database
- Migration 006 already existed with tables

**Total:** 853 lines of new code

## Testing

```bash
# Start dev server
npm run dev

# Navigate to
http://localhost:3000/action-queue/rules

# Create a test rule
1. Click "Create New Rule"
2. Select action type: "email_reply"
3. Add condition: recipient contains "test"
4. Add condition: body_length < 100
5. Save

# Test auto-approve
curl -X POST http://localhost:3000/api/queue \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "email_reply",
    "action_data": {
      "recipient": "test@example.com",
      "body_length": 50
    },
    "risk_level": "low"
  }'

# Should return auto_approved: true
```

## Location

All code is in `/Users/ryankam/arkeus-mesh/mission-control/`
