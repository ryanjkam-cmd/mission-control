# State Management & SSE Client - Usage Guide

**Phase 1, Task 1C.2-4 + 1D Complete**

## Files Created

### Zustand Stores
1. **Content Store** (`src/stores/contentStore.ts`) - Content production state management
2. **Cost Store** (`src/stores/costStore.ts`) - API cost tracking state management
3. **Agent Store** (`src/stores/agentStore.ts`) - Daemon & service status state management

### SSE Client
4. **SSE Client** (`src/lib/sse-client.ts`) - Real-time event stream connection manager

### Types
5. **Types** (`src/types/index.ts`) - Centralized type exports

---

## Content Store

### State
```typescript
{
  items: ContentItem[]           // All content items
  view: 'week' | 'month' | 'kanban'  // Current view mode
  loading: boolean              // Loading state
  error: string | null          // Error message
}
```

### Actions
```typescript
addItem(item)       // Add new content item
updateItem(id, updates)  // Update existing item
deleteItem(id)      // Delete item
setView(view)       // Change view mode
setItems(items)     // Set all items (SSE update)
setLoading(loading) // Set loading state
setError(error)     // Set error message
clearError()        // Clear error
```

### Usage Example
```typescript
import { useContentStore } from '@/stores/contentStore';

function ContentStudio() {
  const { items, view, loading, addItem, setView } = useContentStore();

  const handleCreate = () => {
    addItem({
      title: 'New Blog Post',
      body: 'Content here...',
      platform: ['linkedin', 'substack'],
      status: 'draft',
      scheduledDate: null,
    });
  };

  return (
    <div>
      <button onClick={() => setView('kanban')}>Kanban View</button>
      {loading ? <Spinner /> : <ContentCards items={items} />}
    </div>
  );
}
```

---

## Cost Store

### State
```typescript
{
  todaySpend: number           // Today's spend in USD
  weekSpend: number            // This week's spend
  monthSpend: number           // This month's spend
  breakdown: ModelBreakdown    // Spend by model (haiku, sonnet, opus)
  domainBreakdown: DomainBreakdown  // Spend by domain
  trends: CostTrend[]          // Historical trend data
  loading: boolean
  error: string | null
  lastUpdated: Date | null
  monthlyBudget: number        // Budget limit
  projectedSpend: number       // Projected month-end spend
  daysRemaining: number        // Days left in month
}
```

### Actions
```typescript
updateSpend(data)    // Update cost data
fetchCosts()         // Fetch from Gateway API
setLoading(loading)
setError(error)
setBudget(budget)    // Set monthly budget
```

### Usage Example
```typescript
import { useCostStore } from '@/stores/costStore';

function CostDashboard() {
  const {
    todaySpend,
    monthSpend,
    monthlyBudget,
    projectedSpend,
    fetchCosts
  } = useCostStore();

  useEffect(() => {
    fetchCosts();
  }, []);

  const isOverBudget = projectedSpend > monthlyBudget;

  return (
    <div>
      <h2>Today: ${todaySpend.toFixed(2)}</h2>
      <h2>Month: ${monthSpend.toFixed(2)} / ${monthlyBudget}</h2>
      {isOverBudget && <Alert>Projected to exceed budget!</Alert>}
    </div>
  );
}
```

---

## Agent Store

### State
```typescript
{
  daemons: DaemonInfo[]     // All daemons (brain, watchers, etc.)
  gateway: ServiceInfo      // Gateway service status
  neo4j: ServiceInfo        // Neo4j service status
  services: ServiceInfo[]   // Other services
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}
```

### Types
```typescript
DaemonInfo {
  name: string
  displayName: string
  pid: number | null
  status: 'running' | 'stopped' | 'degraded' | 'unknown'
  uptime: number           // seconds
  lastRun?: Date
  schedule?: string        // e.g., "7x/day at X:30"
  description?: string
  cost?: string            // e.g., "$0/mo (Max subscription)"
}

ServiceInfo {
  name: string
  displayName: string
  status: 'healthy' | 'unhealthy' | 'unknown'
  url?: string
  port?: number
  lastCheck?: Date
  responseTime?: number    // ms
  error?: string
}
```

### Actions
```typescript
updateDaemon(name, updates)   // Update specific daemon
updateService(name, updates)  // Update specific service
setDaemons(daemons)           // Set all daemons
setServices(services)         // Set all services
fetchStatus()                 // Fetch from Gateway API
```

### Usage Example
```typescript
import { useAgentStore } from '@/stores/agentStore';

function AgentTopology() {
  const { daemons, gateway, neo4j, fetchStatus } = useAgentStore();

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Gateway: {gateway.status === 'healthy' ? '✓' : '✗'}</h2>
      <h2>Neo4j: {neo4j.status === 'healthy' ? '✓' : '✗'}</h2>

      <h3>Daemons</h3>
      {daemons.map(daemon => (
        <div key={daemon.name}>
          {daemon.displayName}: {daemon.status}
          {daemon.schedule && <span> ({daemon.schedule})</span>}
        </div>
      ))}
    </div>
  );
}
```

---

## SSE Client

### Features
- Auto-connect on creation
- Exponential backoff reconnection (1s, 2s, 4s, 8s, 16s max)
- Automatic fallback to polling if SSE unavailable (30s interval)
- Parses 3 event types: `system-status`, `cost-update`, `content-update`
- Updates Zustand stores automatically on events

### Event Types

#### system-status
```json
{
  "daemons": [
    {
      "name": "brain-body",
      "displayName": "Brain Body",
      "status": "running",
      "pid": 12345,
      "uptime": 86400,
      "schedule": "7x/day at X:30"
    }
  ],
  "gateway": {
    "status": "healthy",
    "responseTime": 45
  },
  "neo4j": {
    "status": "healthy"
  }
}
```

#### cost-update
```json
{
  "todaySpend": 0.05,
  "weekSpend": 0.35,
  "monthSpend": 1.20,
  "breakdown": {
    "haiku": 0.80,
    "sonnet": 0.35,
    "opus": 0.05
  },
  "projectedSpend": 3.60,
  "daysRemaining": 20
}
```

#### content-update
```json
{
  "action": "create",
  "item": {
    "id": "abc123",
    "title": "New Blog Post",
    "platform": ["linkedin"],
    "status": "draft",
    "scheduledDate": "2026-02-10T09:00:00Z"
  }
}
```

### Usage

#### Basic Setup (App-level)
```typescript
// src/app/layout.tsx or providers component
'use client';

import { useEffect } from 'react';
import { createSSEClient, closeSSEClient } from '@/lib/sse-client';

export function SSEProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const client = createSSEClient({
      onConnect: () => console.log('SSE connected'),
      onDisconnect: () => console.log('SSE disconnected'),
      onError: (err) => console.error('SSE error:', err),
    });

    client.connect();

    return () => {
      closeSSEClient();
    };
  }, []);

  return <>{children}</>;
}
```

#### Manual Control
```typescript
import { createSSEClient, getSSEClient, closeSSEClient } from '@/lib/sse-client';

// Create and connect
const client = createSSEClient();
client.connect();

// Check connection status
const isConnected = client.getIsConnected();

// Disconnect
client.disconnect();

// Get existing instance
const existing = getSSEClient();
if (existing) {
  console.log('Already connected');
}

// Close singleton
closeSSEClient();
```

---

## Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Gateway SSE Endpoint                                       │
│  http://localhost:8787/stream                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ EventSource connection
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  SSE Client (src/lib/sse-client.ts)                        │
│  - Auto-reconnect with exponential backoff                  │
│  - Fallback to polling (30s) if SSE unavailable            │
│  - Parse events: system-status, cost-update, content-update │
└─────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  Agent Store     │ │  Cost Store      │ │  Content Store   │
│  (daemons,       │ │  (spend, budget, │ │  (items, view,   │
│   services)      │ │   breakdown)     │ │   status)        │
└──────────────────┘ └──────────────────┘ └──────────────────┘
           │                  │                  │
           └──────────────────┼──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  React Components                                           │
│  - Dashboard (overview)                                     │
│  - Content Studio (production calendar)                     │
│  - Cost Tracking (spend dashboard)                          │
│  - Arkeus Systems (agent topology)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Gateway Endpoints Required

### SSE Stream
- **GET /stream** - Real-time event stream (SSE)
  - Events: `system-status`, `cost-update`, `content-update`
  - Accepts `?api_key=` query param for auth (EventSource doesn't support headers)

### Agent Status
- **GET /health/ready** - Gateway readiness probe (includes Neo4j, Notion, Google checks)
- **GET /api/agents** - Daemon list with PIDs, uptime, schedule
- **GET /api/status** - System status (services, health checks)

### Cost Tracking
- **GET /api/costs/summary?period=today|week|month** - Aggregated spend
- **GET /api/costs/breakdown?by=model|domain** - Spend breakdown
- **GET /api/costs/forecast** - Monthly projection

### Content Management
- **GET /api/content/calendar?start=2026-02-01&end=2026-02-28** - Content by date range
- **POST /api/content/create** - Create new content item
- **PATCH /api/content/:id** - Update content
- **DELETE /api/content/:id** - Delete content

---

## Next Steps (Phase 1 Completion)

1. **Navigation Component** (Task 1A) - Use `agentStore` for daemon status badges
2. **Page Shells** (Task 1B) - Wire up stores in each page
3. **SSE Integration** (Task 1D) - Add SSEProvider to root layout
4. **Dark Mode** (Task 1E) - Add theme support to stores if needed

---

## Notes

- All stores use Zustand (installed via `npm install zustand`)
- SSE client is a singleton - only one instance per app
- Stores are reactive - components re-render on state changes
- Gateway endpoints are placeholders - need implementation in Gateway
- API key authentication via environment variable or query param
- Fallback polling ensures data updates even if SSE fails
- TypeScript types are fully defined for all stores and SSE events

---

## Testing

### Content Store
```typescript
import { useContentStore } from '@/stores/contentStore';

// In component or test
const store = useContentStore.getState();

store.addItem({
  title: 'Test Post',
  body: 'Content',
  platform: ['linkedin'],
  status: 'draft',
  scheduledDate: null,
});

console.log(store.items.length); // 1
```

### Cost Store
```typescript
import { useCostStore } from '@/stores/costStore';

const store = useCostStore.getState();

await store.fetchCosts(); // Fetch from Gateway

console.log(store.todaySpend); // 0.05
console.log(store.breakdown.haiku); // 0.80
```

### Agent Store
```typescript
import { useAgentStore } from '@/stores/agentStore';

const store = useAgentStore.getState();

await store.fetchStatus(); // Fetch from Gateway

console.log(store.gateway.status); // 'healthy'
console.log(store.daemons.length); // 7
```

### SSE Client
```typescript
import { createSSEClient } from '@/lib/sse-client';

const client = createSSEClient({
  onConnect: () => console.log('Connected'),
  onDisconnect: () => console.log('Disconnected'),
  onError: (err) => console.error(err),
});

client.connect();

// Wait for events to arrive and update stores automatically
setTimeout(() => {
  console.log('Is connected:', client.getIsConnected());
}, 1000);
```

---

**Status**: Phase 1, Tasks 1C.2-4 + 1D Complete
**Files**: 5 files created (3 stores, 1 SSE client, 1 types file)
**Dependencies**: zustand (installed)
**Ready for**: UI component integration
