# Implementation Guide: Content Production Dashboard

Research compiled: February 8, 2026

This guide provides technical implementation recommendations based on patterns from Buffer, Hootsuite, Later, CoSchedule, and ContentCal.

---

## Architecture Overview

### Tech Stack Recommendations

**Frontend**:
- **Framework**: React 18+ with TypeScript
- **State management**: Zustand or Jotai (lightweight) or Redux Toolkit (enterprise)
- **UI components**: shadcn/ui or Radix UI (accessible primitives)
- **Styling**: Tailwind CSS with custom design tokens
- **Date/time**: date-fns or Day.js (moment.js is deprecated)
- **Drag-and-drop**: @dnd-kit/core (modern, accessible)
- **Charts**: Recharts or Chart.js (for complex analytics)
- **Calendar**: React Big Calendar or custom implementation

**Backend**:
- **API**: FastAPI (Python) or Express (Node.js)
- **Database**: PostgreSQL for relational + Redis for caching
- **Real-time**: WebSockets (socket.io) or Server-Sent Events
- **Job queue**: Celery (Python) or Bull (Node.js) for scheduled publishing
- **File storage**: S3-compatible (AWS S3, Cloudflare R2, MinIO)

**Infrastructure**:
- **Deployment**: Docker containers on Kubernetes or fly.io
- **CDN**: Cloudflare for static assets and image optimization
- **Monitoring**: Sentry for errors, Datadog for metrics
- **Analytics**: PostHog or Plausible (privacy-friendly)

---

## Component Architecture

### Calendar View Component

```typescript
// CalendarView.tsx
interface CalendarPost {
  id: string;
  content_type: 'post' | 'video' | 'story' | 'carousel';
  platforms: ('instagram' | 'linkedin' | 'tiktok' | 'twitter')[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_time: Date;
  published_time?: Date;
  author_id: string;
  assignee_id?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  media_urls: string[];
  caption: string;
  hashtags: string[];
  metrics?: {
    impressions: number;
    reach: number;
    engagement: number;
    clicks: number;
  };
}

interface CalendarViewProps {
  view: 'week' | 'month';
  posts: CalendarPost[];
  onPostDrop: (postId: string, newDate: Date) => void;
  onPostClick: (post: CalendarPost) => void;
  onCreatePost: (date: Date) => void;
  selectedPlatforms: string[];
  selectedStatuses: string[];
}

const CalendarView: React.FC<CalendarViewProps> = ({
  view,
  posts,
  onPostDrop,
  onPostClick,
  onCreatePost,
  selectedPlatforms,
  selectedStatuses,
}) => {
  const filteredPosts = useMemo(() => {
    return posts.filter(post =>
      (selectedPlatforms.length === 0 || post.platforms.some(p => selectedPlatforms.includes(p))) &&
      (selectedStatuses.length === 0 || selectedStatuses.includes(post.status))
    );
  }, [posts, selectedPlatforms, selectedStatuses]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {view === 'week' ? (
        <WeekCalendar posts={filteredPosts} onPostClick={onPostClick} />
      ) : (
        <MonthCalendar posts={filteredPosts} onPostClick={onPostClick} />
      )}
    </DndContext>
  );
};
```

### Kanban Board Component

```typescript
// KanbanBoard.tsx
interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  post_count: number;
  color?: string;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  posts: CalendarPost[];
  onStatusChange: (postId: string, newStatus: string) => void;
  onPostClick: (post: CalendarPost) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  posts,
  onStatusChange,
  onPostClick,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const postsByStatus = useMemo(() => {
    return columns.reduce((acc, col) => {
      acc[col.status] = posts.filter(p => p.status === col.status);
      return acc;
    }, {} as Record<string, CalendarPost[]>);
  }, [columns, posts]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const postId = active.id as string;
    const newStatus = over.id as string;
    onStatusChange(postId, newStatus);
    setActiveId(null);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            posts={postsByStatus[column.status] || []}
            onPostClick={onPostClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId ? <PostCard post={posts.find(p => p.id === activeId)!} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
};

const KanbanColumn: React.FC<{
  column: KanbanColumn;
  posts: CalendarPost[];
  onPostClick: (post: CalendarPost) => void;
}> = ({ column, posts, onPostClick }) => {
  const { setNodeRef } = useDroppable({ id: column.status });

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {column.title}
        </h3>
        <span className="text-sm text-gray-500">{posts.length}</span>
      </div>
      <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
        {posts.map(post => (
          <SortablePostCard
            key={post.id}
            post={post}
            onClick={() => onPostClick(post)}
          />
        ))}
      </div>
    </div>
  );
};
```

### Post Card Component

```typescript
// PostCard.tsx
interface PostCardProps {
  post: CalendarPost;
  onClick: () => void;
  isDragging?: boolean;
  compact?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onClick,
  isDragging = false,
  compact = false
}) => {
  const statusColors = {
    draft: 'bg-gray-200 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    published: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-lg border border-gray-200 p-3 cursor-pointer",
        "hover:border-blue-400 hover:shadow-md transition-all",
        isDragging && "opacity-50 rotate-2"
      )}
    >
      {/* Platform badges */}
      <div className="flex gap-1 mb-2">
        {post.platforms.map(platform => (
          <PlatformBadge key={platform} platform={platform} size="sm" />
        ))}
      </div>

      {/* Media preview */}
      {post.media_urls.length > 0 && !compact && (
        <div className="relative h-32 mb-2 rounded overflow-hidden">
          <img
            src={post.media_urls[0]}
            alt="Post preview"
            className="w-full h-full object-cover"
          />
          {post.media_urls.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              +{post.media_urls.length - 1}
            </div>
          )}
        </div>
      )}

      {/* Caption preview */}
      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
        {post.caption}
      </p>

      {/* Metadata footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-1 rounded-full", statusColors[post.status])}>
            {post.status}
          </span>
          {post.scheduled_time && (
            <span>{format(post.scheduled_time, 'MMM d, h:mm a')}</span>
          )}
        </div>
        {post.assignee_id && (
          <UserAvatar userId={post.assignee_id} size="sm" />
        )}
      </div>

      {/* Metrics (if published) */}
      {post.status === 'published' && post.metrics && (
        <div className="flex gap-4 mt-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
          <span title="Impressions">{formatNumber(post.metrics.impressions)} views</span>
          <span title="Engagement">{formatNumber(post.metrics.engagement)} eng.</span>
        </div>
      )}
    </div>
  );
};
```

### Analytics Dashboard Component

```typescript
// AnalyticsDashboard.tsx
interface MetricCard {
  label: string;
  value: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
  sparklineData?: number[];
}

interface AnalyticsDashboardProps {
  dateRange: { start: Date; end: Date };
  comparisonPeriod: 'previous_period' | 'last_week' | 'last_month' | 'last_year';
  platforms: string[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  dateRange,
  comparisonPeriod,
  platforms,
}) => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['analytics', dateRange, comparisonPeriod, platforms],
    queryFn: () => fetchAnalytics({ dateRange, comparisonPeriod, platforms }),
  });

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  const topMetrics: MetricCard[] = [
    {
      label: 'Total Reach',
      value: metrics.reach,
      change: metrics.reachChange,
      trend: metrics.reachChange > 0 ? 'up' : 'down',
      sparklineData: metrics.reachHistory,
    },
    {
      label: 'Engagement Rate',
      value: metrics.engagementRate,
      change: metrics.engagementRateChange,
      trend: metrics.engagementRateChange > 0 ? 'up' : 'down',
      sparklineData: metrics.engagementHistory,
    },
    {
      label: 'Followers',
      value: metrics.followers,
      change: metrics.followerGrowth,
      trend: metrics.followerGrowth > 0 ? 'up' : 'down',
      sparklineData: metrics.followerHistory,
    },
    {
      label: 'Posts Published',
      value: metrics.postsPublished,
      change: metrics.postsPublishedChange,
      trend: 'neutral',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top-level KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetrics.map(metric => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      {/* Engagement over time chart */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <EngagementChart data={metrics.engagementTimeseries} />
        </CardContent>
      </Card>

      {/* Platform comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformBarChart data={metrics.platformComparison} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Type Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentTypePieChart data={metrics.contentTypeBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Top posts table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <TopPostsTable posts={metrics.topPosts} />
        </CardContent>
      </Card>
    </div>
  );
};

const MetricCard: React.FC<{ metric: MetricCard }> = ({ metric }) => {
  const trendIcon = {
    up: <TrendingUp className="h-4 w-4 text-green-600" />,
    down: <TrendingDown className="h-4 w-4 text-red-600" />,
    neutral: <Minus className="h-4 w-4 text-gray-400" />,
  };

  const changeColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-600">{metric.label}</p>
          {trendIcon[metric.trend]}
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-bold text-gray-900">
            {formatNumber(metric.value)}
          </p>
          <p className={cn("text-sm font-medium", changeColor[metric.trend])}>
            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
          </p>
        </div>
        {metric.sparklineData && (
          <div className="mt-4 h-12">
            <Sparkline data={metric.sparklineData} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

---

## Database Schema

### PostgreSQL Schema

```sql
-- Users and teams
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- owner, admin, member, viewer
  PRIMARY KEY (team_id, user_id)
);

-- Social media accounts
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- instagram, linkedin, tiktok, etc.
  account_name VARCHAR(255) NOT NULL,
  account_id VARCHAR(255) NOT NULL, -- platform-specific ID
  access_token TEXT, -- encrypted
  refresh_token TEXT, -- encrypted
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform, account_id)
);

-- Content posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- post, video, story, carousel
  status VARCHAR(50) NOT NULL, -- draft, scheduled, published, failed
  approval_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected

  -- Content
  caption TEXT,
  media_urls TEXT[], -- array of S3 URLs
  hashtags TEXT[],

  -- Scheduling
  scheduled_time TIMESTAMPTZ,
  published_time TIMESTAMPTZ,
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Ownership
  author_id UUID REFERENCES users(id),
  assignee_id UUID,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_team_status ON posts(team_id, status);
CREATE INDEX idx_posts_scheduled_time ON posts(scheduled_time) WHERE status = 'scheduled';

-- Platform-specific post data
CREATE TABLE post_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  social_account_id UUID REFERENCES social_accounts(id),

  -- Platform-specific fields
  platform_post_id VARCHAR(255), -- ID from Instagram, LinkedIn, etc.
  permalink TEXT,
  error_message TEXT,

  -- Metrics
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  video_views INTEGER DEFAULT 0,

  -- Sync
  last_synced_at TIMESTAMPTZ,

  UNIQUE(post_id, social_account_id)
);

CREATE INDEX idx_post_platforms_post ON post_platforms(post_id);
CREATE INDEX idx_post_platforms_account ON post_platforms(social_account_id);

-- Analytics snapshots (for historical tracking)
CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id UUID REFERENCES social_accounts(id),
  snapshot_date DATE NOT NULL,

  -- Account-level metrics
  followers INTEGER,
  following INTEGER,
  total_posts INTEGER,

  -- Aggregated metrics for the day
  impressions INTEGER,
  reach INTEGER,
  engagement INTEGER,
  profile_views INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(social_account_id, snapshot_date)
);

CREATE INDEX idx_snapshots_account_date ON analytics_snapshots(social_account_id, snapshot_date);

-- Comments and collaboration
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  parent_comment_id UUID REFERENCES post_comments(id), -- for threading

  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON post_comments(post_id);
```

### Redis Cache Structure

```
# Active sessions
session:{session_id} -> { user_id, expires_at, ... }

# Real-time metrics cache (15min TTL)
metrics:account:{account_id}:live -> { followers, impressions, ... }

# Post publishing queue
queue:publish:{post_id} -> { scheduled_time, platforms[], ... }

# Rate limit tracking
ratelimit:api:{platform}:{account_id} -> { calls, reset_at }

# Websocket connections
ws:connections:{user_id} -> set of connection IDs

# Recent activity feed (sorted set by timestamp)
activity:{team_id} -> [ { event, timestamp, user_id, ... } ]
```

---

## API Endpoints

### RESTful API Structure

```
GET    /api/posts                    # List posts with filters
POST   /api/posts                    # Create draft post
GET    /api/posts/:id                # Get post details
PATCH  /api/posts/:id                # Update post
DELETE /api/posts/:id                # Delete post

POST   /api/posts/:id/schedule       # Schedule post for publishing
POST   /api/posts/:id/publish        # Publish immediately
POST   /api/posts/:id/cancel         # Cancel scheduled post
POST   /api/posts/:id/approve        # Approve post (workflow)
POST   /api/posts/:id/reject         # Reject post (workflow)

GET    /api/analytics/overview       # Dashboard metrics
GET    /api/analytics/posts          # Post performance
GET    /api/analytics/accounts       # Account metrics
GET    /api/analytics/export         # Export report (CSV/PDF)

GET    /api/social-accounts          # List connected accounts
POST   /api/social-accounts          # Connect new account (OAuth)
DELETE /api/social-accounts/:id      # Disconnect account
POST   /api/social-accounts/:id/sync # Refresh metrics

GET    /api/media                    # List media library
POST   /api/media                    # Upload media file
DELETE /api/media/:id                # Delete media

POST   /api/media/upload-url         # Get presigned S3 URL
POST   /api/media/complete-upload    # Confirm upload complete

WS     /api/ws                        # WebSocket for real-time updates
```

### FastAPI Implementation Example

```python
# main.py
from fastapi import FastAPI, Depends, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

app = FastAPI(title="Content Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
from pydantic import BaseModel

class PostCreate(BaseModel):
    content_type: str
    platforms: List[str]
    caption: str
    media_urls: List[str]
    hashtags: List[str] = []
    scheduled_time: Optional[datetime] = None

class PostUpdate(BaseModel):
    caption: Optional[str] = None
    media_urls: Optional[List[str]] = None
    hashtags: Optional[List[str]] = None
    scheduled_time: Optional[datetime] = None
    assignee_id: Optional[str] = None

class PostResponse(BaseModel):
    id: str
    team_id: str
    content_type: str
    status: str
    approval_status: str
    caption: str
    media_urls: List[str]
    hashtags: List[str]
    scheduled_time: Optional[datetime]
    published_time: Optional[datetime]
    author_id: str
    assignee_id: Optional[str]
    created_at: datetime
    platforms: List[dict]  # platform-specific data
    metrics: dict

# Endpoints
@app.get("/api/posts", response_model=List[PostResponse])
async def list_posts(
    status: Optional[str] = None,
    platform: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    query = db.query(Post).filter(Post.team_id == current_user.team_id)

    if status:
        query = query.filter(Post.status == status)
    if start_date:
        query = query.filter(Post.scheduled_time >= start_date)
    if end_date:
        query = query.filter(Post.scheduled_time <= end_date)

    posts = query.order_by(Post.scheduled_time.desc()).offset(offset).limit(limit).all()
    return [serialize_post(p) for p in posts]

@app.post("/api/posts", response_model=PostResponse)
async def create_post(
    post_data: PostCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    post = Post(
        team_id=current_user.team_id,
        author_id=current_user.id,
        content_type=post_data.content_type,
        status='draft',
        caption=post_data.caption,
        media_urls=post_data.media_urls,
        hashtags=post_data.hashtags,
        scheduled_time=post_data.scheduled_time,
    )
    db.add(post)
    db.commit()

    # Create platform associations
    for platform in post_data.platforms:
        account = get_account_for_platform(db, current_user.team_id, platform)
        post_platform = PostPlatform(
            post_id=post.id,
            social_account_id=account.id,
        )
        db.add(post_platform)
    db.commit()

    # Broadcast via WebSocket
    await broadcast_event(current_user.team_id, {
        'type': 'post.created',
        'post': serialize_post(post),
    })

    return serialize_post(post)

@app.post("/api/posts/{post_id}/schedule")
async def schedule_post(
    post_id: str,
    scheduled_time: datetime,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    post.scheduled_time = scheduled_time
    post.status = 'scheduled'
    db.commit()

    # Queue for publishing
    await queue_post_for_publishing(post)

    return {"success": True}

@app.get("/api/analytics/overview")
async def get_analytics_overview(
    start_date: datetime,
    end_date: datetime,
    platforms: Optional[List[str]] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    # Check cache first
    cache_key = f"analytics:{current_user.team_id}:{start_date}:{end_date}"
    cached = await redis.get(cache_key)
    if cached:
        return json.loads(cached)

    # Compute metrics
    metrics = compute_analytics_overview(
        db,
        current_user.team_id,
        start_date,
        end_date,
        platforms
    )

    # Cache for 15 minutes
    await redis.setex(cache_key, 900, json.dumps(metrics))

    return metrics
```

---

## Background Job Processing

### Celery Task Example (Python)

```python
# tasks.py
from celery import Celery
from datetime import datetime
import requests

celery = Celery('tasks', broker='redis://localhost:6379/0')

@celery.task
def publish_scheduled_posts():
    """Run every minute to check for posts to publish"""
    now = datetime.utcnow()
    posts = db.query(Post).filter(
        Post.status == 'scheduled',
        Post.scheduled_time <= now
    ).all()

    for post in posts:
        publish_post.delay(post.id)

@celery.task(bind=True, max_retries=3)
def publish_post(self, post_id: str):
    """Publish a post to all platforms"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return

    results = []
    for platform in post.platforms:
        try:
            result = publish_to_platform(post, platform)
            results.append({
                'platform': platform.platform,
                'success': True,
                'post_id': result['id'],
                'permalink': result['permalink'],
            })
        except Exception as e:
            results.append({
                'platform': platform.platform,
                'success': False,
                'error': str(e),
            })

            # Retry if transient error
            if is_retryable_error(e):
                raise self.retry(exc=e, countdown=60)

    # Update post status
    if all(r['success'] for r in results):
        post.status = 'published'
        post.published_time = datetime.utcnow()
    else:
        post.status = 'failed'

    db.commit()

    # Broadcast update
    broadcast_event(post.team_id, {
        'type': 'post.published',
        'post_id': post.id,
        'results': results,
    })

@celery.task
def sync_analytics():
    """Run hourly to sync metrics from platforms"""
    accounts = db.query(SocialAccount).filter(
        SocialAccount.is_active == True
    ).all()

    for account in accounts:
        try:
            metrics = fetch_platform_metrics(account)
            update_account_metrics(account, metrics)
        except Exception as e:
            logger.error(f"Failed to sync {account.platform}: {e}")
```

---

## Real-Time Updates with WebSocket

```python
# websocket.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, team_id: str):
        await websocket.accept()
        if team_id not in self.active_connections:
            self.active_connections[team_id] = set()
        self.active_connections[team_id].add(websocket)

    def disconnect(self, websocket: WebSocket, team_id: str):
        self.active_connections[team_id].remove(websocket)

    async def broadcast(self, team_id: str, message: dict):
        if team_id not in self.active_connections:
            return

        dead_connections = set()
        for connection in self.active_connections[team_id]:
            try:
                await connection.send_json(message)
            except:
                dead_connections.add(connection)

        # Clean up dead connections
        for conn in dead_connections:
            self.active_connections[team_id].remove(conn)

manager = ConnectionManager()

@app.websocket("/api/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
):
    user = verify_token(token)
    await manager.connect(websocket, user.team_id)

    try:
        while True:
            # Keep connection alive (client should send ping)
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.team_id)
```

---

## Frontend State Management (Zustand)

```typescript
// stores/postsStore.ts
import { create } from 'zustand';
import { CalendarPost } from '../types';

interface PostsState {
  posts: CalendarPost[];
  selectedPost: CalendarPost | null;
  filters: {
    platforms: string[];
    statuses: string[];
    dateRange: { start: Date; end: Date };
  };
  view: 'calendar' | 'kanban' | 'list';

  // Actions
  setPosts: (posts: CalendarPost[]) => void;
  addPost: (post: CalendarPost) => void;
  updatePost: (id: string, updates: Partial<CalendarPost>) => void;
  deletePost: (id: string) => void;
  selectPost: (post: CalendarPost | null) => void;
  setFilters: (filters: Partial<PostsState['filters']>) => void;
  setView: (view: PostsState['view']) => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  selectedPost: null,
  filters: {
    platforms: [],
    statuses: [],
    dateRange: {
      start: startOfMonth(new Date()),
      end: endOfMonth(new Date()),
    },
  },
  view: 'calendar',

  setPosts: (posts) => set({ posts }),

  addPost: (post) => set((state) => ({
    posts: [...state.posts, post],
  })),

  updatePost: (id, updates) => set((state) => ({
    posts: state.posts.map(p => p.id === id ? { ...p, ...updates } : p),
  })),

  deletePost: (id) => set((state) => ({
    posts: state.posts.filter(p => p.id !== id),
  })),

  selectPost: (post) => set({ selectedPost: post }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  setView: (view) => set({ view }),
}));

// WebSocket integration
export const initializeWebSocket = (teamId: string, token: string) => {
  const ws = new WebSocket(`ws://localhost:8000/api/ws?token=${token}`);

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case 'post.created':
        usePostsStore.getState().addPost(message.post);
        break;
      case 'post.updated':
        usePostsStore.getState().updatePost(message.post.id, message.post);
        break;
      case 'post.deleted':
        usePostsStore.getState().deletePost(message.post_id);
        break;
      case 'post.published':
        usePostsStore.getState().updatePost(message.post_id, {
          status: 'published',
          published_time: new Date(),
        });
        break;
    }
  };

  // Keep alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send('ping');
    }
  }, 30000);

  ws.onclose = () => {
    clearInterval(pingInterval);
    // Reconnect after 5s
    setTimeout(() => initializeWebSocket(teamId, token), 5000);
  };

  return ws;
};
```

---

## Testing Strategies

### Frontend Unit Tests (Vitest + React Testing Library)

```typescript
// PostCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PostCard } from './PostCard';

describe('PostCard', () => {
  const mockPost: CalendarPost = {
    id: '123',
    content_type: 'post',
    platforms: ['instagram', 'linkedin'],
    status: 'scheduled',
    scheduled_time: new Date('2026-02-10T10:00:00Z'),
    caption: 'Test post caption',
    media_urls: ['https://example.com/image.jpg'],
    hashtags: ['test', 'content'],
    author_id: 'user1',
  };

  it('renders post content correctly', () => {
    render(<PostCard post={mockPost} onClick={() => {}} />);

    expect(screen.getByText('Test post caption')).toBeInTheDocument();
    expect(screen.getByText('scheduled')).toBeInTheDocument();
  });

  it('displays platform badges', () => {
    render(<PostCard post={mockPost} onClick={() => {}} />);

    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<PostCard post={mockPost} onClick={handleClick} />);

    fireEvent.click(screen.getByRole('article'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows media preview when media_urls exist', () => {
    render(<PostCard post={mockPost} onClick={() => {}} />);

    const image = screen.getByAltText('Post preview');
    expect(image).toHaveAttribute('src', mockPost.media_urls[0]);
  });
});
```

### Backend API Tests (pytest)

```python
# test_posts.py
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta
from main import app

client = TestClient(app)

@pytest.fixture
def auth_headers(test_user):
    token = create_access_token(test_user.id)
    return {"Authorization": f"Bearer {token}"}

def test_create_post(auth_headers):
    response = client.post(
        "/api/posts",
        json={
            "content_type": "post",
            "platforms": ["instagram"],
            "caption": "Test post",
            "media_urls": ["https://example.com/image.jpg"],
            "hashtags": ["test"],
        },
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["caption"] == "Test post"
    assert data["status"] == "draft"

def test_schedule_post(auth_headers, test_post):
    scheduled_time = (datetime.utcnow() + timedelta(hours=2)).isoformat()

    response = client.post(
        f"/api/posts/{test_post.id}/schedule",
        json={"scheduled_time": scheduled_time},
        headers=auth_headers,
    )
    assert response.status_code == 200

    # Verify post status changed
    get_response = client.get(f"/api/posts/{test_post.id}", headers=auth_headers)
    assert get_response.json()["status"] == "scheduled"

def test_list_posts_with_filters(auth_headers, multiple_posts):
    response = client.get(
        "/api/posts",
        params={"status": "scheduled", "platform": "instagram"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    posts = response.json()
    assert all(p["status"] == "scheduled" for p in posts)
```

---

## Performance Optimization Checklist

### Frontend
- [ ] Implement virtual scrolling for long lists (react-window)
- [ ] Lazy load images with progressive enhancement
- [ ] Code-split routes (React.lazy + Suspense)
- [ ] Debounce search/filter inputs (300ms)
- [ ] Memoize expensive computations (useMemo)
- [ ] Use React Query for data fetching + caching
- [ ] Optimize bundle size (analyze with webpack-bundle-analyzer)
- [ ] Implement service worker for offline support
- [ ] Compress images before upload (client-side)
- [ ] Use WebP format with fallbacks

### Backend
- [ ] Database indexing on filtered columns
- [ ] Connection pooling (pgbouncer for PostgreSQL)
- [ ] Redis caching for frequently accessed data
- [ ] Rate limiting per user/IP
- [ ] Background jobs for heavy processing (Celery)
- [ ] Batch database queries (avoid N+1)
- [ ] Compress API responses (gzip/brotli)
- [ ] CDN for static assets
- [ ] Database query optimization (EXPLAIN ANALYZE)
- [ ] Implement pagination for large datasets

### Infrastructure
- [ ] Horizontal scaling (multiple app servers)
- [ ] Load balancing (nginx/Cloudflare)
- [ ] Database read replicas for analytics
- [ ] S3 + CloudFront for media delivery
- [ ] Monitor with APM tools (Datadog, New Relic)
- [ ] Set up alerts for errors/performance degradation
- [ ] Implement circuit breakers for external APIs
- [ ] Use database connection pooling
- [ ] Regular database vacuuming (PostgreSQL)
- [ ] Log aggregation (Elasticsearch/Loki)

---

This implementation guide provides a comprehensive foundation for building a production-ready content production and social media monitoring dashboard based on industry-leading patterns.
