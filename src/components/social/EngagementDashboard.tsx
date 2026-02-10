'use client';

/**
 * Engagement Dashboard - KPI cards with sparklines
 */

import { useState, useEffect } from 'react';
import { Eye, Heart, User, MousePointer, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { EngagementMetrics, generateEngagementMetrics } from '@/lib/mock-social-data';

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  sparklineData: number[];
  icon: React.ElementType;
  color: string;
}

function KPICard({ title, value, change, sparklineData, icon: Icon, color }: KPICardProps) {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  // Format sparkline data for recharts
  const chartData = sparklineData.map((value, index) => ({ value, index }));

  return (
    <div className="p-4 rounded-lg border border-mc-border bg-mc-bg-tertiary hover:bg-mc-bg-secondary transition-all duration-card group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-mc-text-secondary text-sm">{title}</span>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className="text-3xl font-bold text-mc-text">{value}</div>
      </div>

      {/* Change and sparkline */}
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-1">
          <TrendIcon
            className={`w-4 h-4 ${isPositive ? 'text-mc-accent-green' : 'text-mc-accent-red'}`}
          />
          <span
            className={`text-sm font-medium ${isPositive ? 'text-mc-accent-green' : 'text-mc-accent-red'}`}
          >
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
        </div>

        {/* Sparkline */}
        <div className="w-24 h-12 opacity-70 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function EngagementDashboard() {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);

  // Load metrics
  useEffect(() => {
    setMetrics(generateEngagementMetrics());

    // Update metrics every 30 seconds
    const interval = setInterval(() => {
      setMetrics(generateEngagementMetrics());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
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
        <h2 className="text-xl font-semibold text-mc-text">Engagement Dashboard</h2>
        <p className="text-mc-text-secondary text-sm mt-1">
          Platform metrics, reach, engagement rates, and trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reach */}
        <KPICard
          title="Total Reach"
          value={metrics.totalReach.toLocaleString()}
          change={metrics.trend.reach}
          sparklineData={metrics.sparklineData}
          icon={Eye}
          color="#58a6ff"
        />

        {/* Engagement Rate */}
        <KPICard
          title="Engagement Rate"
          value={`${metrics.engagementRate}%`}
          change={metrics.trend.engagement}
          sparklineData={metrics.sparklineData.map(v => v * 0.005)}
          icon={Heart}
          color="#f85149"
        />

        {/* Profile Visits */}
        <KPICard
          title="Profile Visits"
          value={metrics.profileVisits.toLocaleString()}
          change={metrics.trend.visits}
          sparklineData={metrics.sparklineData.map(v => v * 0.04)}
          icon={User}
          color="#a371f7"
        />

        {/* Link Clicks */}
        <KPICard
          title="Link Clicks"
          value={metrics.linkClicks.toLocaleString()}
          change={metrics.trend.clicks}
          sparklineData={metrics.sparklineData.map(v => v * 0.02)}
          icon={MousePointer}
          color="#3fb950"
        />
      </div>
    </div>
  );
}
