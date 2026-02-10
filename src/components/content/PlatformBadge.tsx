/**
 * PlatformBadge Component
 * Displays platform icons with status indicators
 * Supports LinkedIn, X/Twitter, Substack, Instagram
 */

import { Linkedin, Twitter, FileText, Instagram } from 'lucide-react';
import { ContentPlatform, ContentStatus } from '@/types';

interface PlatformBadgeProps {
  platform: ContentPlatform;
  status?: ContentStatus;
  variant?: 'icon-only' | 'with-text';
  size?: 'sm' | 'md' | 'lg';
}

const PLATFORM_CONFIG = {
  linkedin: {
    icon: Linkedin,
    color: '#0A66C2',
    name: 'LinkedIn',
  },
  x: {
    icon: Twitter,
    color: '#000000',
    name: 'X',
  },
  substack: {
    icon: FileText,
    color: '#FF6719',
    name: 'Substack',
  },
  instagram: {
    icon: Instagram,
    color: 'url(#instagram-gradient)',
    name: 'Instagram',
  },
} as const;

const STATUS_CONFIG = {
  draft: { color: '#8b949e', label: 'Draft' },
  scheduled: { color: '#d29922', label: 'Scheduled' },
  published: { color: '#3fb950', label: 'Published' },
  failed: { color: '#f85149', label: 'Failed' },
} as const;

const SIZE_CONFIG = {
  sm: { icon: 14, dot: 6 },
  md: { icon: 18, dot: 8 },
  lg: { icon: 22, dot: 10 },
} as const;

export default function PlatformBadge({
  platform,
  status,
  variant = 'icon-only',
  size = 'md',
}: PlatformBadgeProps) {
  const config = PLATFORM_CONFIG[platform];
  const Icon = config.icon;
  const sizeConfig = SIZE_CONFIG[size];

  const isInstagram = platform === 'instagram';

  return (
    <div className="relative inline-flex items-center gap-1.5">
      {/* Instagram gradient definition */}
      {isInstagram && (
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f09433', stopOpacity: 1 }} />
              <stop offset="25%" style={{ stopColor: '#e6683c', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#dc2743', stopOpacity: 1 }} />
              <stop offset="75%" style={{ stopColor: '#cc2366', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#bc1888', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* Platform icon */}
      <div
        className="inline-flex items-center justify-center rounded-md p-1.5 transition-all duration-200"
        style={{
          backgroundColor: isInstagram ? 'transparent' : `${config.color}15`,
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: isInstagram ? 'transparent' : `${config.color}40`,
        }}
      >
        {isInstagram ? (
          <div
            className="rounded-md p-1"
            style={{
              background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            }}
          >
            <Icon
              size={sizeConfig.icon}
              style={{ color: '#ffffff' }}
              strokeWidth={2}
            />
          </div>
        ) : (
          <Icon
            size={sizeConfig.icon}
            style={{ color: config.color }}
            strokeWidth={2}
          />
        )}
      </div>

      {/* Platform name (if with-text variant) */}
      {variant === 'with-text' && (
        <span
          className="text-sm font-medium"
          style={{ color: isInstagram ? '#bc1888' : config.color }}
        >
          {config.name}
        </span>
      )}

      {/* Status indicator dot */}
      {status && (
        <div
          className="absolute -top-1 -right-1 rounded-full border-2 border-mc-bg-secondary"
          style={{
            width: sizeConfig.dot,
            height: sizeConfig.dot,
            backgroundColor: STATUS_CONFIG[status].color,
          }}
          title={STATUS_CONFIG[status].label}
        />
      )}
    </div>
  );
}

// Multi-platform badges group
interface PlatformBadgesProps {
  platforms: ContentPlatform[];
  status?: ContentStatus;
  variant?: 'icon-only' | 'with-text';
  size?: 'sm' | 'md' | 'lg';
}

export function PlatformBadges({
  platforms,
  status,
  variant = 'icon-only',
  size = 'md',
}: PlatformBadgesProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {platforms.map((platform) => (
        <PlatformBadge
          key={platform}
          platform={platform}
          status={status}
          variant={variant}
          size={size}
        />
      ))}
    </div>
  );
}
