'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * DomainBreakdown - Bar chart showing spend by domain
 *
 * Features:
 * - 6 domains: health, family, career, content, business, patterns
 * - Bars with gradient (purple to cyan)
 * - Sortable by cost or alphabetical
 * - Hover tooltip with details
 */

interface ChartData {
  domain: string;
  cost: number;
  displayName: string;
}

const DOMAIN_LABELS: Record<string, string> = {
  health: 'Health',
  family: 'Family',
  career: 'Career',
  content: 'Content',
  business: 'Business',
  patterns: 'Patterns'
};

export default function DomainBreakdown() {
  const [data, setData] = useState<ChartData[]>([]);
  const [sortBy, setSortBy] = useState<'cost' | 'name'>('cost');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreakdown = async () => {
      try {
        const res = await fetch('/api/costs/summary?period=month');
        const responseData = await res.json();

        const chartData: ChartData[] = Object.entries(responseData.domains)
          .filter(([_, cost]) => (cost as number) > 0)
          .map(([domain, cost]) => ({
            domain,
            cost: cost as number,
            displayName: DOMAIN_LABELS[domain] || domain
          }));

        setData(chartData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch domain breakdown:', err);
        setLoading(false);
      }
    };

    fetchBreakdown();
  }, []);

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'cost') {
      return b.cost - a.cost; // Descending by cost
    } else {
      return a.displayName.localeCompare(b.displayName); // Alphabetical
    }
  });

  if (loading) {
    return (
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h3 className="text-lg font-semibold mb-4">Domain Breakdown</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-mc-text-secondary">Loading breakdown...</div>
        </div>
      </div>
    );
  }

  if (sortedData.length === 0) {
    return (
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h3 className="text-lg font-semibold mb-4">Domain Breakdown</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-mc-text-secondary">No domain data available</div>
        </div>
      </div>
    );
  }

  // Gradient colors for bars
  const getBarColor = (index: number, total: number) => {
    const ratio = index / Math.max(total - 1, 1);
    // Interpolate between purple and cyan
    const r = Math.round(168 + (6 - 168) * ratio);
    const g = Math.round(85 + (182 - 85) * ratio);
    const b = Math.round(247 + (212 - 247) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Domain Breakdown (This Month)</h3>

        {/* Sort toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('cost')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              sortBy === 'cost'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-mc-border text-mc-text-secondary hover:bg-mc-border/80'
            }`}
          >
            By Cost
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              sortBy === 'name'
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-mc-border text-mc-text-secondary hover:bg-mc-border/80'
            }`}
          >
            A-Z
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={sortedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />

          <XAxis
            dataKey="displayName"
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={{ stroke: '#374151' }}
          />

          <YAxis
            stroke="#9ca3af"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            tickLine={{ stroke: '#374151' }}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              padding: '0.75rem'
            }}
            labelStyle={{ color: '#e5e7eb', marginBottom: '0.5rem' }}
            formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, 'Cost']}
            cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
          />

          <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index, sortedData.length)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Domain details table */}
      <div className="mt-4 space-y-2">
        {sortedData.map((item, index) => (
          <div key={item.domain} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: getBarColor(index, sortedData.length) }}
              />
              <span className="text-mc-text-secondary">{item.displayName}</span>
            </div>
            <span className="text-mc-text font-medium">${item.cost.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
