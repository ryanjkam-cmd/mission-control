/**
 * Social Event Card - Reusable card for social feed items
 */

import { Heart, MessageCircle, Share2, AtSign, ThumbsUp } from 'lucide-react';
import { SocialEvent, formatRelativeTime } from '@/lib/mock-social-data';

interface SocialEventCardProps {
  event: SocialEvent;
}

// Platform colors
const PLATFORM_COLORS = {
  linkedin: '#0A66C2',
  x: '#000000',
  substack: '#FF6719',
  instagram: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
};

// Action icons
const ACTION_ICONS = {
  like: ThumbsUp,
  comment: MessageCircle,
  share: Share2,
  mention: AtSign,
  reply: MessageCircle,
};

export function SocialEventCard({ event }: SocialEventCardProps) {
  const ActionIcon = ACTION_ICONS[event.action];
  const isInstagram = event.platform === 'instagram';

  return (
    <div className="flex items-start gap-4 p-3 rounded border border-mc-border bg-mc-bg-tertiary hover:bg-mc-bg-secondary transition-colors duration-card">
      {/* Avatar placeholder */}
      <div className="w-10 h-10 rounded-full bg-mc-border flex items-center justify-center text-mc-text-secondary font-semibold flex-shrink-0">
        {event.userName.split(' ').map(n => n[0]).join('')}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header: User + Action + Platform */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-medium text-mc-text">{event.userName}</span>
          <ActionIcon className="w-4 h-4 text-mc-text-secondary" />
          <span className="text-mc-text-secondary text-sm">{event.action}</span>

          {/* Platform badge */}
          <div
            className="px-2 py-0.5 rounded text-xs text-white font-medium flex-shrink-0"
            style={{
              background: isInstagram ? PLATFORM_COLORS[event.platform] : undefined,
              backgroundColor: !isInstagram ? PLATFORM_COLORS[event.platform] : undefined,
            }}
          >
            {event.platform === 'x' ? 'X' : event.platform.charAt(0).toUpperCase() + event.platform.slice(1)}
          </div>

          <span className="text-mc-text-secondary text-xs ml-auto">
            {formatRelativeTime(event.timestamp)}
          </span>
        </div>

        {/* Original post reference */}
        {event.originalPost && (
          <div className="text-mc-text-secondary text-xs mb-1 italic">
            on: &ldquo;{event.originalPost}&rdquo;
          </div>
        )}

        {/* Content preview */}
        <div className="text-mc-text text-sm line-clamp-2">
          {event.content}
        </div>
      </div>
    </div>
  );
}
