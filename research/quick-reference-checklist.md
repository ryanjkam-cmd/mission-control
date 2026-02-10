# Quick Reference Checklist

Fast reference for implementing content production dashboard patterns.

---

## Calendar View Essentials

### Display Elements
- [ ] Date/time slot grid
- [ ] Platform badges (Instagram, LinkedIn, TikTok, etc.)
- [ ] Status indicators (draft, scheduled, published, failed)
- [ ] Media thumbnails
- [ ] Caption preview (2-3 lines)
- [ ] View toggle (Week/Month/List)
- [ ] Filter dropdown (platforms, statuses)

### Interactions
- [ ] Click card → expand full details
- [ ] Drag card → move to different time slot
- [ ] Hover → show quick actions
- [ ] Right-click → context menu
- [ ] Double-click → edit inline

### Visual Design
- [ ] Platform brand colors for badges
- [ ] Green = published, Yellow = scheduled, Red = failed, Gray = draft
- [ ] White space between cards (minimum 8px)
- [ ] Card shadow on hover
- [ ] Smooth transitions (200-300ms)

---

## Kanban Board Essentials

### Column Structure
- [ ] Fixed or fluid width (300-350px recommended)
- [ ] Column header: Status name + card count + add button
- [ ] Vertical scroll within column
- [ ] Horizontal board scroll
- [ ] Subtle background tints per status

### Card Design
- [ ] Title (bold, 14-16px)
- [ ] Assignee avatar (top-right or bottom-right)
- [ ] Due date badge (with overdue indicator)
- [ ] Platform icons (small, 16x16px)
- [ ] Content type label (post, video, story, carousel)
- [ ] Comment count indicator

### Drag-and-Drop
- [ ] Ghost/placeholder while dragging
- [ ] Highlighted drop zones
- [ ] Smooth animation (200-300ms)
- [ ] Haptic feedback on mobile
- [ ] Undo option after drop

---

## Analytics Dashboard Essentials

### Top-Level KPI Cards
- [ ] Large number (36-48pt font)
- [ ] Change indicator (↑↓ arrow + percentage)
- [ ] Sparkline trend visualization
- [ ] Color coding (green = positive, red = negative)
- [ ] Comparison period selector

### Chart Types
- [ ] Line charts: Trends over time (2-5 series max)
- [ ] Bar charts: Platform/content type comparisons
- [ ] Pie/donut: Distribution breakdowns
- [ ] Heatmaps: Best posting times
- [ ] Tables: Top posts, detailed metrics

### Metric Categories
- [ ] **Reach**: Impressions, unique reach
- [ ] **Engagement**: Likes, comments, shares, saves
- [ ] **Growth**: Follower change, profile views
- [ ] **Performance**: Click-through rate, conversion rate

---

## Real-Time Monitoring Essentials

### Feed Aggregation
- [ ] Unified inbox (all platforms)
- [ ] Stream organization (mentions, DMs, comments)
- [ ] Smart filtering (sentiment, keyword, platform)
- [ ] Conversation threading
- [ ] Unread count indicators

### Alert Types
- [ ] Keyword alerts (brand mentions, competitor names)
- [ ] Sentiment threshold (negative spike detection)
- [ ] Volume spike (sudden increase in mentions)
- [ ] Geographic alerts (activity in specific regions)
- [ ] User activity (specific accounts mentioning brand)

### Notification Channels
- [ ] In-app (badge, sound, toast)
- [ ] Email (customizable frequency)
- [ ] Slack integration
- [ ] Mobile push
- [ ] SMS (critical only)

---

## Post Creation/Editing Essentials

### Form Fields
- [ ] Platform selector (multi-select checkboxes)
- [ ] Content type (post, video, story, carousel)
- [ ] Caption (textarea with character counter)
- [ ] Hashtag input (autocomplete suggestions)
- [ ] Media upload (drag-and-drop + file picker)
- [ ] Schedule picker (date + time + timezone)
- [ ] Assignee selector (team members)

### Media Handling
- [ ] Image preview (grid for multiple)
- [ ] Video preview with playback
- [ ] Aspect ratio validation per platform
- [ ] File size limits (platform-specific)
- [ ] Drag to reorder media
- [ ] Remove/replace media

### Validation
- [ ] Caption length per platform (Twitter 280, Instagram 2200, etc.)
- [ ] Required fields (at least one platform, media or caption)
- [ ] Schedule time must be future
- [ ] Hashtag limits (Instagram 30 max)
- [ ] Media format validation

---

## Status Indicators

### Visual Conventions
```
Draft      → Gray circle or badge
Scheduled  → Blue circle with clock icon
Published  → Green checkmark
Failed     → Red X with error tooltip
Pending    → Yellow circle (approval workflow)
Approved   → Green checkmark (workflow)
Rejected   → Red X (workflow)
```

### Platform Badges
```
Instagram  → Purple/pink gradient icon
LinkedIn   → Blue icon
TikTok     → Black/cyan icon
Twitter/X  → Black icon
Facebook   → Blue icon
YouTube    → Red icon
Pinterest  → Red icon
```

---

## Mobile Responsive Breakpoints

### Desktop (≥1024px)
- [ ] Full calendar/kanban layout
- [ ] Sidebar navigation
- [ ] Multi-column analytics
- [ ] Hover interactions enabled

### Tablet (768px - 1023px)
- [ ] Simplified calendar (fewer hours visible)
- [ ] Single column kanban with horizontal scroll
- [ ] Stacked analytics cards
- [ ] Bottom navigation bar

### Mobile (≤767px)
- [ ] List view default (not calendar grid)
- [ ] Accordion-style kanban
- [ ] One metric card per row
- [ ] Bottom sheet modals (not centered)
- [ ] Swipe gestures for navigation
- [ ] Large tap targets (44x44pt min)

---

## Accessibility Checklist

### Color & Contrast
- [ ] WCAG AA compliance (4.5:1 for text)
- [ ] Don't rely solely on color for status
- [ ] High contrast mode support
- [ ] Color-blind friendly palettes

### Keyboard Navigation
- [ ] Tab order follows visual flow
- [ ] Focus indicators clearly visible
- [ ] Keyboard shortcuts (Cmd+N for new post)
- [ ] Escape closes modals

### Screen Readers
- [ ] ARIA labels on interactive elements
- [ ] Semantic HTML (button, not div)
- [ ] Alt text for images
- [ ] Status announcements for updates

### Motion
- [ ] Respect prefers-reduced-motion
- [ ] Pause/stop controls for carousels
- [ ] No flashing content
- [ ] Smooth scroll option

---

## Performance Optimization

### Frontend
- [ ] Virtual scrolling for long lists
- [ ] Lazy load images (Intersection Observer)
- [ ] Code-split routes (React.lazy)
- [ ] Debounce search inputs (300ms)
- [ ] Memoize expensive computations
- [ ] React Query for data caching
- [ ] Compress images before upload

### Backend
- [ ] Database indexes on filtered columns
- [ ] Connection pooling
- [ ] Redis caching (15min TTL for analytics)
- [ ] Rate limiting (100 req/min per user)
- [ ] Background jobs for publishing
- [ ] Batch database queries (no N+1)
- [ ] Compress API responses (gzip)

### Infrastructure
- [ ] CDN for static assets
- [ ] Database read replicas for analytics
- [ ] Horizontal scaling (multiple servers)
- [ ] Load balancing
- [ ] Monitor with APM tools
- [ ] Set up error alerts

---

## Database Schema Quick Reference

### Core Tables
```sql
users                 -- User accounts
teams                 -- Team/organization
team_members          -- User-team associations
social_accounts       -- Connected platform accounts
posts                 -- Content posts
post_platforms        -- Platform-specific post data
analytics_snapshots   -- Daily metric snapshots
post_comments         -- Collaboration comments
```

### Key Indexes
```sql
idx_posts_team_status         ON posts(team_id, status)
idx_posts_scheduled_time      ON posts(scheduled_time) WHERE status = 'scheduled'
idx_post_platforms_post       ON post_platforms(post_id)
idx_snapshots_account_date    ON analytics_snapshots(social_account_id, snapshot_date)
```

---

## API Endpoints Quick Reference

### Posts
```
GET    /api/posts              List with filters
POST   /api/posts              Create draft
GET    /api/posts/:id          Get details
PATCH  /api/posts/:id          Update
DELETE /api/posts/:id          Delete
POST   /api/posts/:id/schedule Schedule
POST   /api/posts/:id/publish  Publish now
```

### Analytics
```
GET    /api/analytics/overview     Dashboard metrics
GET    /api/analytics/posts        Post performance
GET    /api/analytics/accounts     Account metrics
GET    /api/analytics/export       Export CSV/PDF
```

### Social Accounts
```
GET    /api/social-accounts        List connected
POST   /api/social-accounts        Connect (OAuth)
DELETE /api/social-accounts/:id    Disconnect
POST   /api/social-accounts/:id/sync  Refresh
```

---

## Component Naming Conventions

### Calendar Components
```
CalendarView          Main calendar container
WeekCalendar          Week view layout
MonthCalendar         Month view layout
CalendarDay           Single day cell
CalendarTimeSlot      Time slot within day
PostCard              Individual post card
```

### Kanban Components
```
KanbanBoard           Main board container
KanbanColumn          Status column
KanbanCard            Post card within column
SortableCard          Draggable card wrapper
ColumnHeader          Column title + count
AddPostButton         New post in column
```

### Analytics Components
```
AnalyticsDashboard    Main dashboard
MetricCard            KPI card with sparkline
EngagementChart       Line chart for trends
PlatformBarChart      Platform comparison
ContentTypePieChart   Distribution chart
TopPostsTable         Best performing posts
```

---

## Color Palette Reference

### Status Colors
```
Draft:       #6B7280 (gray-500)
Scheduled:   #3B82F6 (blue-500)
Published:   #10B981 (green-500)
Failed:      #EF4444 (red-500)
Pending:     #F59E0B (amber-500)
```

### Platform Colors
```
Instagram:   #E4405F (pink-red)
LinkedIn:    #0A66C2 (blue)
TikTok:      #000000 (black)
Twitter/X:   #000000 (black)
Facebook:    #1877F2 (blue)
YouTube:     #FF0000 (red)
Pinterest:   #E60023 (red)
```

### Sentiment Colors
```
Positive:    #10B981 (green-500)
Neutral:     #6B7280 (gray-500)
Negative:    #EF4444 (red-500)
```

---

## Common Formulas

### Engagement Rate
```
(Likes + Comments + Shares + Saves) / Reach × 100
```

### Click-Through Rate
```
Clicks / Impressions × 100
```

### Follower Growth Rate
```
(New Followers - Unfollows) / Previous Followers × 100
```

### Average Engagement per Post
```
Total Engagement / Total Posts
```

### Video Completion Rate
```
Views to End / Total Views × 100
```

---

## Error Messages Best Practices

### User-Friendly
```
❌ "Invalid input"
✅ "Caption must be between 1 and 2,200 characters"

❌ "Error 500"
✅ "We couldn't publish your post. Please try again in a few minutes."

❌ "Network error"
✅ "You appear to be offline. Your changes will sync when reconnected."
```

### Actionable
```
Include:
- What went wrong (clear, specific)
- Why it happened (if helpful)
- What to do next (action button)
- Who to contact (if unrecoverable)
```

---

## Testing Checklist

### Unit Tests
- [ ] Component rendering
- [ ] User interactions (click, drag)
- [ ] State updates
- [ ] Edge cases (empty, error states)
- [ ] Accessibility (keyboard, screen reader)

### Integration Tests
- [ ] API endpoint responses
- [ ] Database queries
- [ ] Authentication flows
- [ ] File upload/download
- [ ] WebSocket connections

### End-to-End Tests
- [ ] Login flow
- [ ] Create post workflow
- [ ] Schedule and publish
- [ ] Analytics loading
- [ ] Filter and search

### Performance Tests
- [ ] Page load time (Lighthouse)
- [ ] Large dataset handling (1000+ posts)
- [ ] Concurrent user load
- [ ] Database query performance
- [ ] Memory leaks

---

## Launch Day Checklist

### Pre-Launch
- [ ] Production environment setup
- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] CDN/caching configured
- [ ] SSL certificates installed
- [ ] Error monitoring active (Sentry)
- [ ] Analytics tracking configured
- [ ] Backup strategy tested

### Day 1
- [ ] Deploy to production
- [ ] Smoke test critical paths
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] User feedback collection ready
- [ ] Support team briefed

### Week 1
- [ ] Daily error review
- [ ] Performance monitoring
- [ ] User feedback analysis
- [ ] Quick bug fixes
- [ ] Usage analytics review
- [ ] Identify top pain points

---

**Quick reference created for Arkeus Mission Control**
**Last updated: February 8, 2026**
