/**
 * Mock Social Data Generator
 * Creates realistic social monitoring data for demo purposes
 */

export type SocialPlatform = 'linkedin' | 'x' | 'substack' | 'instagram';
export type SocialAction = 'like' | 'comment' | 'share' | 'mention' | 'reply';

export interface SocialEvent {
  id: string;
  platform: SocialPlatform;
  action: SocialAction;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: Date;
  originalPost?: string;
}

export interface EngagementMetrics {
  totalReach: number;
  engagementRate: number;
  profileVisits: number;
  linkClicks: number;
  trend: {
    reach: number;
    engagement: number;
    visits: number;
    clicks: number;
  };
  sparklineData: number[];
}

export interface PlatformStats {
  platform: SocialPlatform;
  postsLive: number;
  reach: number;
  engagementRate: number;
  lastPosted: Date;
  status: 'active' | 'degraded' | 'error';
}

// Sample user names for variety
const SAMPLE_USERS = [
  'Sarah Chen', 'Michael Rodriguez', 'David Kim', 'Emily Johnson',
  'Chris Anderson', 'Jessica Martinez', 'Ryan Lee', 'Amanda Wilson',
  'James Taylor', 'Lisa Brown', 'Kevin Nguyen', 'Maria Garcia',
  'Tom Harris', 'Jennifer Clark', 'Alex Thompson', 'Nicole White'
];

// Sample comments with different sentiments
const SAMPLE_COMMENTS = [
  'This is exactly what I needed to read today! Great insights.',
  'Interesting perspective. I agree with most points here.',
  'Not sure I fully agree with this approach, but worth considering.',
  'Wow, this is eye-opening! Thank you for sharing.',
  'I have some concerns about this strategy...',
  'Brilliant analysis! Sharing with my team.',
  'Could you elaborate on the third point?',
  'This reminds me of a similar situation we had last year.',
  'Love this! Bookmarking for later reference.',
  'Disappointing take. Expected more depth.',
  'Excellent breakdown of the problem space.',
  'I\'m worried this might backfire in practice.',
  'Amazing work! Looking forward to the next post.',
  'This is terrible advice for beginners.',
  'Helpful summary. Can you share more resources?',
];

// Sample post titles
const SAMPLE_POSTS = [
  'AI sycophancy patterns in RLHF training',
  'Why AI agents fail 97.5% of the time',
  'The alignment nobody did',
  'Give me the 9th component',
  'Factorial testing reveals protocol effectiveness',
];

/**
 * Generate a random social event
 */
export function generateSocialEvent(): SocialEvent {
  const platforms: SocialPlatform[] = ['linkedin', 'x', 'substack', 'instagram'];
  const actions: SocialAction[] = ['like', 'comment', 'share', 'mention', 'reply'];

  const platform = platforms[Math.floor(Math.random() * platforms.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const userName = SAMPLE_USERS[Math.floor(Math.random() * SAMPLE_USERS.length)];

  // Comments and replies have content, others have shortened messages
  let content = '';
  if (action === 'comment' || action === 'reply') {
    content = SAMPLE_COMMENTS[Math.floor(Math.random() * SAMPLE_COMMENTS.length)];
  } else if (action === 'like') {
    content = 'liked your post';
  } else if (action === 'share') {
    content = 'shared your post';
  } else if (action === 'mention') {
    content = 'mentioned you in a post';
  }

  const originalPost = (action === 'comment' || action === 'reply')
    ? SAMPLE_POSTS[Math.floor(Math.random() * SAMPLE_POSTS.length)]
    : undefined;

  return {
    id: crypto.randomUUID(),
    platform,
    action,
    userName,
    content,
    timestamp: new Date(),
    originalPost,
  };
}

/**
 * Generate batch of social events (for initial load)
 */
export function generateSocialEvents(count: number): SocialEvent[] {
  const events: SocialEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const event = generateSocialEvent();
    // Spread events over last 24 hours
    const hoursAgo = Math.random() * 24;
    event.timestamp = new Date(now - hoursAgo * 60 * 60 * 1000);
    events.push(event);
  }

  // Sort by timestamp (newest first)
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

/**
 * Generate mock engagement metrics
 */
export function generateEngagementMetrics(): EngagementMetrics {
  // Generate sparkline data (last 7 days)
  const sparklineData = Array.from({ length: 7 }, () =>
    Math.floor(Math.random() * 1000) + 500
  );

  return {
    totalReach: 8234,
    engagementRate: 4.3,
    profileVisits: 342,
    linkClicks: 156,
    trend: {
      reach: 12.3,
      engagement: -2.1,
      visits: 8.7,
      clicks: 15.2,
    },
    sparklineData,
  };
}

/**
 * Generate platform statistics
 */
export function generatePlatformStats(): PlatformStats[] {
  const now = Date.now();

  return [
    {
      platform: 'linkedin',
      postsLive: 12,
      reach: 3245,
      engagementRate: 5.2,
      lastPosted: new Date(now - 4 * 60 * 60 * 1000), // 4 hours ago
      status: 'active' as const,
    },
    {
      platform: 'x',
      postsLive: 28,
      reach: 2834,
      engagementRate: 3.8,
      lastPosted: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'active' as const,
    },
    {
      platform: 'substack',
      postsLive: 11,
      reach: 1842,
      engagementRate: 6.1,
      lastPosted: new Date(now - 18 * 60 * 60 * 1000), // 18 hours ago
      status: 'active' as const,
    },
    {
      platform: 'instagram',
      postsLive: 8,
      reach: 313,
      engagementRate: 2.4,
      lastPosted: new Date(now - 36 * 60 * 60 * 1000), // 36 hours ago
      status: 'degraded' as const,
    },
  ];
}

/**
 * Format timestamp as relative time (e.g., "2m ago", "3h ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}
