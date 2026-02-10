'use client';

/**
 * Platform Status - Connection status for all platforms
 */

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { PlatformStats, generatePlatformStats, formatRelativeTime } from '@/lib/mock-social-data';

const STATUS_CONFIG = {
  active: {
    icon: CheckCircle2,
    color: '#3fb950',
    bgColor: '#3fb95020',
    label: 'Active',
  },
  degraded: {
    icon: AlertCircle,
    color: '#d29922',
    bgColor: '#d2992220',
    label: 'Degraded',
  },
  error: {
    icon: XCircle,
    color: '#f85149',
    bgColor: '#f8514920',
    label: 'Error',
  },
};

const PLATFORM_DISPLAY = {
  linkedin: { name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
  x: { name: 'X', icon: '✖️', color: '#000000' },
  substack: { name: 'Substack', icon: '📝', color: '#FF6719' },
  instagram: { name: 'Instagram', icon: '📷', color: '#E4405F' },
};

export function PlatformStatus() {
  const [platforms, setPlatforms] = useState<PlatformStats[]>([]);

  // Load platform stats
  useEffect(() => {
    setPlatforms(generatePlatformStats());

    // Update every 30 seconds
    const interval = setInterval(() => {
      setPlatforms(generatePlatformStats());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (platforms.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-mc-bg-tertiary rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-mc-text">Platform Status</h2>
        <p className="text-mc-text-secondary text-sm mt-1">
          Connection status for LinkedIn, X, Substack, Instagram
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => {
          const statusConfig = STATUS_CONFIG[platform.status];
          const StatusIcon = statusConfig.icon;
          const platformInfo = PLATFORM_DISPLAY[platform.platform];

          return (
            <div
              key={platform.platform}
              className="p-4 rounded-lg border border-mc-border bg-mc-bg-tertiary hover:bg-mc-bg-secondary transition-all duration-card"
            >
              {/* Header: Platform name + status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{platformInfo.icon}</span>
                  <span className="font-medium text-mc-text">{platformInfo.name}</span>
                </div>

                {/* Status badge */}
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                  style={{
                    color: statusConfig.color,
                    backgroundColor: statusConfig.bgColor,
                  }}
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mc-text-secondary">Posts Live</span>
                  <span className="text-mc-text font-mono">{platform.postsLive}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-mc-text-secondary">Last Posted</span>
                  <span className="text-mc-text">{formatRelativeTime(platform.lastPosted)}</span>
                </div>

                {/* Progress bar for engagement */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-mc-text-secondary">Engagement</span>
                    <span className="text-mc-text font-mono">{platform.engagementRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-mc-bg rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((platform.engagementRate / 10) * 100, 100)}%`,
                        backgroundColor: platformInfo.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
