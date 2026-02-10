# Arkeus Marketing Agency Dashboard - Implementation Handoff

**Created**: February 8, 2026
**Status**: Ready for Phase 1 Implementation
**Research Complete**: 5 parallel agents (dashboard nav, content tracking, system monitoring, Neo4j, video/image tools)

---

## 🎯 Project Vision

Transform Mission Control into a **full-service marketing agency dashboard** powered by Arkeus cognitive OS. This is not just visualization - it's a production system that creates, distributes, and monitors content while tracking costs and learning from outcomes.

**Core Identity**: Ryan's marketing agency with his voice, his patterns, his decision-making - augmented by AI tools but filtered through the refraction lens.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  MISSION CONTROL - Arkeus Marketing Agency                      │
│  Modern UI · Real-time · Cognitive OS Integration               │
└─────────────────────────────────────────────────────────────────┘

Frontend Layer (Next.js 15 + React 19)
├── shadcn/ui + Tailwind CSS (dark mode, glassmorphism)
├── Zustand (client state) + React Query (server state)
├── SSE for real-time updates (30s refresh cycle)
└── Progressive loading (skeleton screens, virtual scrolling)

Backend Layer (FastAPI + SQLite + Neo4j)
├── Gateway Integration (port 8787) - existing endpoints
├── SQLite (operational data: costs, hot links, content status)
├── Neo4j (knowledge graph: 26K nodes, 323 clusters)
└── Cost Attribution (brain_body_actions.jsonl → model tracking)

Data Sources (Live Integration)
├── Arkeus Brain Body (7x/day runs, action logs)
├── Gateway APIs (calendar, email, tasks, metrics)
├── Notion DBs (Decisions, Tasks, Companies, Recruiters)
├── Learning.db (35 outcomes, 16 accepted)
└── Social Platform APIs (Buffer/Hootsuite patterns)
```

---

## 🎨 Left Navigation Structure

```
┌────────────────────────────────────────┐
│ 🏠 ARKEUS MARKETING AGENCY             │
├────────────────────────────────────────┤
│                                        │
│ 📊 DASHBOARD                           │
│   • Overview                           │
│   • Live Status                        │
│                                        │
│ ✍️ CONTENT STUDIO                      │
│   • Production Calendar                │
│   • Blog Posts                         │
│   • Video Projects                     │
│   • Social Posts                       │
│   • Content Pipeline (Kanban)          │
│                                        │
│ 📱 SOCIAL MONITORING                   │
│   • Real-time Feed                     │
│   • Engagement Dashboard               │
│   • Sentiment Analysis                 │
│   • Platform Status                    │
│                                        │
│ 🧠 ARKEUS SYSTEMS                      │
│   • Brain Mission Control              │
│   • Agent Topology                     │
│   • System Architecture                │
│   • Workflow Diagrams                  │
│   • Learning Outcomes                  │
│                                        │
│ 💰 COST TRACKING                       │
│   • API Spend Dashboard                │
│   • Budget Forecasting                 │
│   • Model Attribution                  │
│   • Anomaly Detection                  │
│                                        │
│ 🔗 KNOWLEDGE GRAPH                     │
│   • Neo4j Explorer (26K nodes)         │
│   • Cluster Navigation (323 clusters)  │
│   • Semantic Search                    │
│                                        │
│ 🔗 QUICK LINKS                         │
│   • Notion Dashboards                  │
│   • Google Docs                        │
│   • External Tools                     │
│   • Link Manager                       │
│                                        │
│ 🎨 AI TOOLS                            │
│   • Content Creation Workflow          │
│   • Video/Image Tools                  │
│   • Distribution Pipeline              │
│                                        │
└────────────────────────────────────────┘
```

**Nav Behavior**:
- Collapsible: 300px expanded → 64px collapsed (icon only)
- Grouped sections with expand/collapse
- Active page highlight with left border accent (purple/cyan gradient)
- Tooltips on collapsed icons
- Persist state in localStorage (`nav-collapsed: boolean`)

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2) ⚡ PARALLELIZABLE
**Goal**: Modern UI shell + live data integration

**Task 1A: Left Navigation Component** ⚡ PARALLEL TASK
- Create `src/components/layout/SideNav.tsx`
- Use shadcn/ui Sheet or custom collapsible
- 8 main sections with sub-items
- Icon + text (icons: lucide-react)
- Collapse/expand state (localStorage persistence)
- Active route highlighting (use Next.js `usePathname`)
- Tooltip on hover when collapsed

**Task 1B: Page Shell Creation (8 pages)** ⚡ PARALLEL TASK
- `src/app/dashboard/page.tsx` - Overview dashboard
- `src/app/content-studio/page.tsx` - Content production
- `src/app/social-monitoring/page.tsx` - Real-time social feed
- `src/app/arkeus-systems/page.tsx` - Architecture viz
- `src/app/cost-tracking/page.tsx` - API spend
- `src/app/knowledge-graph/page.tsx` - Neo4j explorer
- `src/app/quick-links/page.tsx` - Hot links manager
- `src/app/ai-tools/page.tsx` - Workflow docs

Each page: Basic layout with header, breadcrumbs, placeholder content

**Task 1C: Zustand State Management** ⚡ PARALLEL TASK
- Create `src/stores/contentStore.ts` - content production state
- Create `src/stores/costStore.ts` - API cost tracking state
- Create `src/stores/agentStore.ts` - daemon status state
- Create `src/stores/navStore.ts` - navigation state (collapsed, active)

**Task 1D: SSE Connection to Gateway** ⚡ PARALLEL TASK
- Create `src/lib/sse-client.ts` - EventSource connection manager
- Connect to `http://localhost:8787/stream` (or new endpoint)
- Auto-reconnect on disconnect
- Parse events: `system-status`, `cost-update`, `content-update`
- Update Zustand stores on events
- Fallback: Poll every 30s if SSE unavailable

**Task 1E: Dark Mode + Styling** (Semi-parallel, depends on components)
- Tailwind dark mode configuration
- Glassmorphism utilities (backdrop-blur, bg-opacity)
- Purple/cyan gradient accents (brand colors)
- Typography scale (Inter font)
- Component variants for dark mode

**Deliverable**: Clickable navigation with live Gateway status, 8 page shells, state management wired

---

### Phase 2: Core Features (Week 3-4)
**Goal**: Content Studio + Social Monitoring + Cost Tracking

#### Content Studio

**Task 2A: Multi-View Calendar**
- Week view: 7 columns, hourly rows, content cards
- Month view: 30-day grid, compact content bubbles
- Kanban view: Draft → Review → Scheduled → Published → Live
- View toggle buttons (week/month/kanban)
- Component: `src/components/content/ContentCalendar.tsx`

**Task 2B: Drag-and-Drop Scheduling**
- Install `@dnd-kit/core`, `@dnd-kit/sortable`
- Drag content cards between days (calendar view)
- Drag cards between kanban columns (status change)
- Visual feedback: shadow, opacity change
- Update state on drop

**Task 2C: Platform Status Badges**
- LinkedIn (blue #0A66C2), X (black #000000), Substack (orange #FF6719), Instagram (pink gradient)
- Status colors: Draft (gray), Scheduled (yellow), Published (green), Failed (red)
- Badge component with icon + status dot

**Task 2D: Content Creation Modal**
- Form: Title, Body (textarea), Platform (multi-select), Schedule Date/Time
- Integration: POST to `/api/content/create` (new endpoint)
- Validation: Required fields, date must be future
- Preview mode for each platform

#### Social Monitoring

**Task 2E: Real-time Feed**
- SSE stream of social events (likes, comments, shares, mentions)
- Card layout: Avatar, Platform icon, Action, Content preview, Timestamp
- Auto-scroll to top on new event (with "New activity" badge)
- Filter by platform, action type

**Task 2F: Engagement Dashboard**
- 4 KPI cards: Total Reach, Engagement Rate, Profile Visits, Link Clicks
- Sparkline charts (last 7 days trend)
- Platform comparison grid (table with metrics per platform)
- Time range selector (24h, 7d, 30d)

**Task 2G: Sentiment Analysis**
- 6 emotion cards: Joy, Trust, Fear, Surprise, Sadness, Disgust
- Emoji + percentage + trend arrow
- Feed comments/replies through sentiment API (or local model)
- Color-coded emotion scales

#### Cost Tracking

**Task 2H: Parse Action Logs**
- Read `~/.arkeus/brain_body_actions.jsonl`
- Extract: `model`, `tokens_in`, `tokens_out`, `timestamp`, `domain`
- Calculate cost using Anthropic pricing:
  ```typescript
  const COST_PER_1M = {
    haiku: { input: 0.80, output: 4.00 },
    sonnet: { input: 3.00, output: 15.00 },
    opus: { input: 15.00, output: 75.00 }
  };
  ```
- Store in SQLite or in-memory cache
- API endpoint: `GET /api/costs/summary?period=today|week|month`

**Task 2I: Spend Dashboard**
- 3 cards: Today Spend, Week Spend, Month Spend (USD with 2 decimals)
- Trend chart (Recharts line): Last 30 days, daily spend
- Model breakdown (pie chart): % spend by Haiku/Sonnet/Opus
- Domain breakdown (bar chart): Spend by health/family/career/etc.

**Task 2J: Budget Forecasting**
- Monthly budget input (user setting, default $50)
- Current burn rate (avg daily spend × days remaining)
- Projected month-end total
- Alert if projected > budget (red badge)
- Anomaly detection: Highlight days with spend > 2σ above average

**Deliverable**: Functional dashboards with live data (content calendar, social feed, cost tracking)

---

### Phase 3: Advanced Features (Week 5-6)
**Goal**: Neo4j Explorer + Architecture Viz + AI Workflow

#### Neo4j Explorer

**Task 3A: Cytoscape.js Setup**
- Install `cytoscape`, `cytoscape-cola` (layout), `cytoscape-webgl` (renderer)
- Container: Full-page graph canvas
- Initial load: 323 clusters only (fast)
- Layout: Concentric rings by category (Identity, Infrastructure, Strategy, etc.)

**Task 3B: Progressive Expansion**
- Click cluster node → Load chunks (100-500 per cluster)
- API: `GET /api/neo4j/cluster/:id/chunks`
- Add chunk nodes without re-layout (maintain graph structure)
- Highlight path: Clicked cluster + its chunks (opacity change on other nodes)

**Task 3C: Search + Filter**
- Search bar: Text search across node titles
- Filter dropdown: Category (Identity, Infrastructure, Strategy, etc.)
- Highlight matching nodes (color change)
- Zoom to fit selected nodes

**Task 3D: Metadata Panel**
- Click node → Side panel with details
- Chunk: Full content, source (session transcript), timestamp
- Cluster: Member count, category, top keywords
- Links: Related Notion pages, Substack articles

#### Architecture Visualization

**Task 3E: Brain Mission Control Diagram**
- Use React Flow (`reactflow` package)
- 3 layers: Data → Brain → Body
- Nodes: Calendar, Email, iMessage, Tasks → Thinker, Evaluator → Dispatcher, Actions
- Live status indicators: Green (running), Red (stopped), Yellow (degraded)
- Real-time daemon status from Gateway

**Task 3F: Agent Topology**
- Network graph: Runner, Scanner, Learner, Briefer, Consolidator
- Edges: Data flow (Runner → Gateway → Dispatcher)
- Schedule annotations: "7x/day", "1x/day evening", "3am daily"
- PID + uptime display on hover

**Task 3G: System Topology**
- Layered diagram (3 tiers):
  1. Frontend: Mission Control (3000), Dashboard (8788)
  2. Gateway: REST (8787), MCP (8788), Restricted (8790)
  3. Backend: SQLite, Neo4j (7687), Docker
- Connection lines showing ports
- Health status per service

#### AI Content Workflow

**Task 3H: Quick Links Manager**
- SQLite schema:
  ```sql
  CREATE TABLE quick_links (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT, -- Notion, Google, External
    tags TEXT, -- JSON array
    clicks INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```
- CRUD UI: Add, Edit, Delete links
- Click tracking: Increment counter on link click
- Category grouping (3 sections)
- Search by title/tag

**Task 3I: AI Tools Pricing Comparison**
- Table: Tool, Pricing, Features, Best For
- 3 tiers: Free ($0), Starter ($35), Professional ($131)
- Highlight recommendation based on content volume
- Links to sign up pages

**Task 3J: Content Creation Workflow Docs**
- Step-by-step guide: Ideation → Creation → Distribution → Monitoring → Learning
- Integration with Arkeus skills: `/blog`, `/thread`, `/voice`, `/score`, `/distribute`
- Screenshots/diagrams of each step
- Example outputs

**Deliverable**: Full-featured marketing agency dashboard with advanced visualization and AI workflow integration

---

## 💾 Technology Stack

| Layer | Technology | Installation | Why |
|-------|-----------|--------------|-----|
| **Frontend** | Next.js 15 + React 19 | `npx create-next-app@latest` | Modern, performant, TypeScript |
| **UI Library** | shadcn/ui | `npx shadcn-ui@latest init` | 2024-2026 standard, accessible |
| **Styling** | Tailwind CSS | Included with shadcn/ui | Dark mode, responsive, utility-first |
| **State** | Zustand | `npm install zustand` | Simple, performant, no boilerplate |
| **Server State** | React Query | `npm install @tanstack/react-query` | Cache, refetch, SSE integration |
| **Real-time** | EventSource (native) | Built-in browser API | SSE client, auto-reconnect |
| **Charts** | Recharts | `npm install recharts` | Responsive, TypeScript-first |
| **Drag-Drop** | @dnd-kit/core | `npm install @dnd-kit/core @dnd-kit/sortable` | Modern, accessible, touch |
| **Graph Viz** | Cytoscape.js | `npm install cytoscape cytoscape-cola` | 26K nodes performance |
| **Architecture** | React Flow | `npm install reactflow` | Clean diagrams, interactive |
| **Icons** | lucide-react | `npm install lucide-react` | Clean, consistent, tree-shakeable |

---

## 📂 Project Structure

```
mission-control/
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with SideNav
│   │   ├── page.tsx                      # Redirect to /dashboard
│   │   ├── dashboard/page.tsx            # Overview dashboard
│   │   ├── content-studio/
│   │   │   ├── page.tsx                  # Production calendar
│   │   │   ├── blog/page.tsx             # Blog posts list
│   │   │   ├── video/page.tsx            # Video projects
│   │   │   └── social/page.tsx           # Social posts
│   │   ├── social-monitoring/page.tsx    # Real-time feed
│   │   ├── arkeus-systems/page.tsx       # Architecture viz
│   │   ├── cost-tracking/page.tsx        # API spend
│   │   ├── knowledge-graph/page.tsx      # Neo4j explorer
│   │   ├── quick-links/page.tsx          # Hot links manager
│   │   └── ai-tools/page.tsx             # Workflow docs
│   ├── components/
│   │   ├── layout/
│   │   │   ├── SideNav.tsx               # Left navigation
│   │   │   └── Header.tsx                # Top header with breadcrumbs
│   │   ├── content/
│   │   │   ├── ContentCalendar.tsx       # Multi-view calendar
│   │   │   ├── ContentCard.tsx           # Draggable content card
│   │   │   ├── KanbanBoard.tsx           # Status columns
│   │   │   └── ContentModal.tsx          # Create/edit form
│   │   ├── social/
│   │   │   ├── FeedItem.tsx              # Social event card
│   │   │   ├── EngagementGrid.tsx        # Platform metrics
│   │   │   └── SentimentCards.tsx        # 6 emotions
│   │   ├── costs/
│   │   │   ├── SpendCard.tsx             # Today/Week/Month
│   │   │   ├── TrendChart.tsx            # 30-day line chart
│   │   │   └── ModelBreakdown.tsx        # Pie chart
│   │   ├── graph/
│   │   │   ├── CytoscapeGraph.tsx        # Neo4j visualizer
│   │   │   └── MetadataPanel.tsx         # Node details
│   │   └── architecture/
│   │       ├── BrainDiagram.tsx          # React Flow
│   │       └── AgentTopology.tsx         # Network graph
│   ├── stores/
│   │   ├── contentStore.ts               # Content production state
│   │   ├── costStore.ts                  # API cost state
│   │   ├── agentStore.ts                 # Daemon status
│   │   └── navStore.ts                   # Nav collapsed state
│   ├── lib/
│   │   ├── sse-client.ts                 # EventSource manager
│   │   ├── gateway-api.ts                # Gateway API client
│   │   └── cost-calculator.ts            # Token → USD conversion
│   └── types/
│       ├── content.ts                    # Content types
│       ├── social.ts                     # Social event types
│       └── costs.ts                      # Cost breakdown types
├── public/
├── prisma/                               # If using Prisma for SQLite
│   └── schema.prisma
└── package.json
```

---

## 🔌 Gateway API Endpoints Needed

### Existing (Already Available)
- `GET /health` - Gateway health check
- `GET /api/status` - System status (Neo4j, Docker, etc.)
- `GET /api/agents` - Daemon list with status
- `GET /api/tasks` - Active tasks
- `GET /api/metrics` - Learning metrics

### New Endpoints to Create

**Content Management**
- `GET /api/content/calendar?start=2026-02-01&end=2026-02-28` - Content by date range
- `POST /api/content/create` - Create new content item
- `PATCH /api/content/:id` - Update content (status, schedule)
- `DELETE /api/content/:id` - Delete content

**Social Monitoring** (Future: integrate Buffer/Hootsuite APIs)
- `GET /api/social/feed?limit=50` - Recent social events
- `GET /api/social/metrics?platform=linkedin&period=7d` - Engagement metrics

**Cost Tracking**
- `GET /api/costs/summary?period=today|week|month` - Aggregated spend
- `GET /api/costs/breakdown?by=model|domain` - Spend breakdown
- `GET /api/costs/forecast` - Monthly projection

**Neo4j**
- `GET /api/neo4j/clusters` - 323 clusters (initial load)
- `GET /api/neo4j/cluster/:id/chunks` - Expand cluster to chunks
- `POST /api/neo4j/search` - Text search across nodes

**Quick Links**
- `GET /api/links` - All quick links
- `POST /api/links` - Create link
- `PATCH /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `POST /api/links/:id/click` - Track click

**SSE Stream** (Real-time updates)
- `GET /api/stream` - SSE connection
  - Events: `system-status`, `cost-update`, `content-update`, `social-event`

---

## 🎬 Content Production Workflow

```
IDEATION → CREATION → DISTRIBUTION → MONITORING → LEARNING
    ↓          ↓            ↓             ↓           ↓
  Brain     AI Tools    Arkeus Skills   Social      Learner
  Suggests  Generate    /distribute    Monitoring   Updates
            Content                                  Lens
```

### Integration with Arkeus Skills

**Content Creation**:
```bash
# Generate blog post
/blog "AI sycophancy patterns in RLHF training"

# Generate X thread
/thread "5 key findings from factorial testing"

# Apply voice filter
/voice "Draft in my voice" --profile thought-leadership

# Score authenticity
/score "Check voice match" --target 0.8

# Distribute across platforms
/distribute "LinkedIn, X, Substack" --schedule "2026-02-10 09:00"
```

**Workflow Steps**:
1. **Ideation**: Brain suggests topics based on patterns (signal history, trending domains)
2. **Draft**: `/blog` or `/thread` generates initial content using Sonnet
3. **Voice Check**: `/voice` applies refraction lens (deletions, additions, rewrites)
4. **Score**: `/score` rates authenticity (target >0.8, 40/30/30 weighting)
5. **Visual**: Leonardo.ai for featured image (API or manual)
6. **Video** (optional): Runway for b-roll, HeyGen for talking head
7. **Distribute**: `/distribute` schedules across platforms (creates entries in content calendar)
8. **Monitor**: Social dashboard tracks engagement (views, saves, shares, comments)
9. **Learn**: Learner records outcomes (accepted/rejected), updates lens if needed

---

## 💰 AI Content Tools - Tiered Pricing

### Option 1: Starter ($35/month)
**Best for**: Solo creator, 10-20 posts/month, image-focused content

| Tool | Price | Features |
|------|-------|----------|
| **Canva Pro** | $13/mo | 100M+ stock photos, brand kit, templates, remove bg |
| **Leonardo.ai** | $12/mo | 480 images/mo, API access, custom models |
| **Pika Labs** | $10/mo | 700 credits/mo, video generation, up to 3s clips |

**Total**: $35/month

---

### Option 2: Professional ($131/month)
**Best for**: Agency workflow, 50+ posts/month, video content production

| Tool | Price | Features |
|------|-------|----------|
| **Midjourney** | $30/mo | Unlimited images, max quality, commercial license |
| **Runway Gen-3** | $35/mo | 5 videos/mo at 10s each, 1280×768, watermark-free |
| **HeyGen** | $29/mo | AI avatars, 15 min video/mo, 1080p export |
| **Canva Pro** | $13/mo | Same as above |
| **Descript** | $24/mo | Video editing, transcription, AI voices, 10 hrs/mo |

**Total**: $131/month

---

### Option 3: Free Tier ($0/month)
**Best for**: Testing, low-volume experimentation, open-source tools

| Tool | Price | Features |
|------|-------|----------|
| **Leonardo.ai Free** | $0 | 150 images/mo, basic models |
| **Stable Diffusion** | $0 | Unlimited (local install), no API costs |
| **OBS Studio** | $0 | Screen recording, live streaming |
| **DaVinci Resolve** | $0 | Professional video editing, color grading |
| **Canva Free** | $0 | Limited templates, 5GB storage |

**Total**: $0/month (requires local compute power for Stable Diffusion)

---

### Recommendation
**Start with Starter tier** ($35/mo) for first month:
- Test content volume and engagement
- Evaluate need for video content
- Upgrade to Professional if producing 50+ posts/month with video

**Month 2-3**: Upgrade to Professional if:
- Creating 3+ videos/week
- Need AI avatars (HeyGen) for talking head videos
- Require advanced editing (Descript) for podcasts/interviews

---

## 🔐 Environment Variables

```bash
# Gateway connection
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8787
GATEWAY_API_KEY=<from macOS Keychain: arkeus-api-keys>

# Neo4j (for direct connections from frontend)
NEXT_PUBLIC_NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=<from env or keychain>

# Database (if using Prisma for SQLite)
DATABASE_URL=file:./dev.db

# Social platform APIs (Phase 2)
LINKEDIN_API_KEY=<future>
TWITTER_API_KEY=<future>
SUBSTACK_API_KEY=<future>

# AI content tools (Phase 3)
LEONARDO_API_KEY=<if using API>
RUNWAY_API_KEY=<if using API>
HEYGEN_API_KEY=<if using API>
```

---

## 🚨 Critical Constraints

### Disk Space (CRITICAL)
- User's Mac: **228GB drive at 97% capacity**
- Docker images: ~16GB (cleanup target)
- **DO NOT** install heavy dependencies: Grafana, Prometheus, Elasticsearch
- Use lightweight JSON dashboard reading from `~/.arkeus/*.json` files
- Avoid large node_modules bloat (review bundle size)

### API Costs (Important)
- Brain Body: $0/mo (uses Claude Max subscription)
- Current operational: ~$0.30/month
- **DO NOT** add expensive API polling (Sonnet calls every 30s)
- Use SSE for real-time updates (Gateway pushes, not client polls)
- Cache API responses (React Query with 5min staleTime)

### Performance (Important)
- Neo4j: 26K nodes - MUST use progressive loading (323 clusters first)
- Social feed: Virtual scrolling for 500+ items (react-virtual)
- Charts: Debounce resize events (300ms)
- Images: Next.js Image optimization, lazy loading

---

## ✅ Definition of Done (Phase 1)

**Navigation**:
- [ ] Left sidebar collapsible (300px ↔ 64px)
- [ ] 8 main sections with sub-items clickable
- [ ] Active route highlighted
- [ ] Collapsed state persists in localStorage
- [ ] Dark mode theme applied

**Pages**:
- [ ] 8 page shells created with basic layout
- [ ] Header with breadcrumbs on each page
- [ ] Placeholder content (skeleton screens or "Coming soon")

**State Management**:
- [ ] 4 Zustand stores created (content, costs, agents, nav)
- [ ] Test: Update store, verify component re-renders

**SSE Connection**:
- [ ] EventSource connects to Gateway on mount
- [ ] Auto-reconnect on disconnect (exponential backoff)
- [ ] Parse events and update Zustand stores
- [ ] Fallback: Poll Gateway every 30s if SSE fails

**Styling**:
- [ ] Dark mode working (toggle in header)
- [ ] Glassmorphism effects on cards (backdrop-blur)
- [ ] Purple/cyan gradient accents on active elements
- [ ] Responsive: Mobile (collapsed nav), Tablet, Desktop

**Testing**:
- [ ] All pages load without errors
- [ ] Navigation transitions smooth (150-300ms)
- [ ] SSE connection stable (check DevTools Network tab)
- [ ] No console errors

---

## 📚 Research Documents Reference

All research completed by parallel agents (Feb 8, 2026):

1. **Dashboard Navigation Patterns**
   - File: `dashboard-design-research-2024-2026.md` (1151 lines)
   - Key: shadcn/ui, collapsible nav, SSE vs WebSocket, 2-level depth max

2. **Content Tracking Dashboards**
   - Files: `research/` directory (5 documents, 389 lines README)
   - Key: Multi-view calendars, drag-and-drop, platform badges, 2026 trends

3. **System Monitoring**
   - File: `.arkeus/dashboard_research_findings.md` (859 lines)
   - Key: Lightweight JSON dashboard, zero disk usage, critical alerts

4. **Neo4j Integration**
   - File: `NEO4J_INTEGRATION_RESEARCH.md` (1151 lines)
   - Key: Cytoscape.js, progressive loading (323 clusters → chunks), polyglot persistence

5. **Video/Image Creation Tools**
   - File: `video-image-tools-research-2026.md` (200+ lines)
   - Key: 3 tiers ($0, $35, $131/mo), API costs, free alternatives

---

## 🤝 Handoff Checklist

**Before starting**:
- [ ] Read this document in full
- [ ] Review existing Mission Control codebase (`src/app/arkeus/page.tsx`)
- [ ] Verify Gateway running on port 8787 (`curl http://localhost:8787/health`)
- [ ] Verify Neo4j running on port 7687
- [ ] Check Node.js version (18+ required for Next.js 15)

**Phase 1 - Before coding**:
- [ ] Install dependencies: `npm install zustand @tanstack/react-query lucide-react`
- [ ] Install shadcn/ui: `npx shadcn-ui@latest init`
- [ ] Add shadcn components: `npx shadcn-ui@latest add sheet button card`
- [ ] Create Zustand stores first (state logic before UI)
- [ ] Create SSE client (connection before components)

**Phase 1 - During coding**:
- [ ] Start with navigation (most important, affects all pages)
- [ ] Create page shells (can be done in parallel with nav)
- [ ] Wire up SSE after nav + pages working
- [ ] Add styling last (functional first, pretty second)

**Phase 1 - After coding**:
- [ ] Test all navigation links work
- [ ] Test collapse/expand persists on refresh
- [ ] Test SSE connection in DevTools Network tab
- [ ] Test dark mode toggle
- [ ] Commit with clear message: "Phase 1: Foundation - Navigation + Page Shells + SSE + Dark Mode"

---

## 🔄 Parallel Execution Strategy

**These tasks can run in PARALLEL** (independent, no shared state):

**Parallel Group A** (Frontend Components):
1. Task 1A: Left Navigation Component
2. Task 1B: Page Shell Creation (8 pages)
3. Task 1E: Dark Mode + Styling (component variants)

**Parallel Group B** (State + API):
4. Task 1C: Zustand State Management (4 stores)
5. Task 1D: SSE Connection to Gateway

**Sequential Dependencies**:
- Task 1E (styling) needs 1A + 1B (components) to exist
- Task 1D (SSE) can run parallel to 1A/1B, but integration requires stores from 1C

**Optimal Parallel Strategy for Sonnet Agents**:
```
Agent 1: Navigation Component (1A) + Nav Store (1C.nav)
Agent 2: Page Shells 1-4 (1B, pages 1-4)
Agent 3: Page Shells 5-8 (1B, pages 5-8)
Agent 4: Content/Cost/Agent Stores (1C) + SSE Client (1D)
Agent 5: Dark Mode Setup + Tailwind Config (1E)
```

This gives 5 parallel agents, each with ~30-45 min of work, completing Phase 1 in ~1 hour total (vs 3-4 hours sequential).

---

## 📞 Contact & Questions

**Project Owner**: Ryan Kam
**Location**: `/Users/ryankam/arkeus-mesh/mission-control/`
**Research Date**: February 8, 2026
**Status**: Ready for implementation

**Next Action**: Begin Phase 1 (Foundation) with parallel agent execution strategy above.

---

**End of Handoff Document**
