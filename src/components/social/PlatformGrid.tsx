'use client';

/**
 * Platform Grid - Comparison table of platform metrics
 */

import { useState, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { PlatformStats, generatePlatformStats } from '@/lib/mock-social-data';

type SortKey = 'platform' | 'postsLive' | 'reach' | 'engagementRate';

// Platform icons (using emoji for simplicity)
const PLATFORM_ICONS = {
  linkedin: '💼',
  x: '✖️',
  substack: '📝',
  instagram: '📷',
};

const PLATFORM_COLORS = {
  linkedin: '#0A66C2',
  x: '#000000',
  substack: '#FF6719',
  instagram: '#E4405F',
};

export function PlatformGrid() {
  const [stats, setStats] = useState<PlatformStats[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('reach');
  const [sortAsc, setSortAsc] = useState(false);

  // Load platform stats
  useEffect(() => {
    setStats(generatePlatformStats());

    // Update every 30 seconds
    const interval = setInterval(() => {
      setStats(generatePlatformStats());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Sort handler
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  // Sort stats
  const sortedStats = [...stats].sort((a, b) => {
    let aVal: number | string = a[sortKey];
    let bVal: number | string = b[sortKey];

    if (sortKey === 'platform') {
      aVal = a.platform;
      bVal = b.platform;
      return sortAsc
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    aVal = aVal as number;
    bVal = bVal as number;
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  if (stats.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-mc-bg-tertiary rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-mc-text mb-3">Platform Comparison</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-mc-border">
              {/* Platform */}
              <th
                className="text-left py-3 px-4 text-mc-text-secondary font-medium cursor-pointer hover:text-mc-text transition-colors"
                onClick={() => handleSort('platform')}
              >
                <div className="flex items-center gap-2">
                  Platform
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>

              {/* Posts Live */}
              <th
                className="text-right py-3 px-4 text-mc-text-secondary font-medium cursor-pointer hover:text-mc-text transition-colors"
                onClick={() => handleSort('postsLive')}
              >
                <div className="flex items-center justify-end gap-2">
                  Posts Live
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>

              {/* Reach */}
              <th
                className="text-right py-3 px-4 text-mc-text-secondary font-medium cursor-pointer hover:text-mc-text transition-colors"
                onClick={() => handleSort('reach')}
              >
                <div className="flex items-center justify-end gap-2">
                  Reach
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>

              {/* Engagement Rate */}
              <th
                className="text-right py-3 px-4 text-mc-text-secondary font-medium cursor-pointer hover:text-mc-text transition-colors"
                onClick={() => handleSort('engagementRate')}
              >
                <div className="flex items-center justify-end gap-2">
                  Engagement Rate
                  <ArrowUpDown className="w-4 h-4" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedStats.map((stat) => (
              <tr
                key={stat.platform}
                className="border-b border-mc-border hover:bg-mc-bg-secondary transition-colors"
              >
                {/* Platform */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{PLATFORM_ICONS[stat.platform]}</span>
                    <span
                      className="font-medium capitalize"
                      style={{ color: PLATFORM_COLORS[stat.platform] }}
                    >
                      {stat.platform === 'x' ? 'X' : stat.platform}
                    </span>
                  </div>
                </td>

                {/* Posts Live */}
                <td className="py-3 px-4 text-right text-mc-text font-mono">
                  {stat.postsLive}
                </td>

                {/* Reach */}
                <td className="py-3 px-4 text-right text-mc-text font-mono">
                  {stat.reach.toLocaleString()}
                </td>

                {/* Engagement Rate */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-mc-text font-mono">{stat.engagementRate}%</span>
                    {/* Bar visualization */}
                    <div className="w-20 h-2 bg-mc-bg-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((stat.engagementRate / 10) * 100, 100)}%`,
                          backgroundColor: PLATFORM_COLORS[stat.platform],
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
