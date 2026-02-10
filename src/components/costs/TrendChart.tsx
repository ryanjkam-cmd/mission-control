'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

/**
 * TrendChart - 30-day cost trend visualization
 *
 * Features:
 * - Line chart with gradient fill
 * - 7-day moving average (dotted line)
 * - Hover tooltip with exact amounts
 * - Vertical line marking today
 * - Dark mode themed
 */

interface ChartDataPoint {
  date: string;
  cost: number;
  avg?: number;
  displayDate: string;
}

export default function TrendChart() {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await fetch('/api/costs/trends?days=30');
        const responseData = await res.json();

        // Merge trends with moving average
        const merged = responseData.trends.map((trend: any) => {
          const avg = responseData.movingAverage.find((ma: any) => ma.date === trend.date);
          const date = new Date(trend.date);
          const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return {
            date: trend.date,
            cost: trend.cost,
            avg: avg?.cost,
            displayDate
          };
        });

        setData(merged);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch trends:', err);
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h3 className="text-lg font-semibold mb-4">30-Day Spend Trend</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-mc-text-secondary">Loading trend data...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h3 className="text-lg font-semibold mb-4">30-Day Spend Trend</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-mc-text-secondary">No trend data available</div>
        </div>
      </div>
    );
  }

  // Find today's date for marking
  const today = new Date().toISOString().split('T')[0];
  const todayIndex = data.findIndex(d => d.date === today);

  return (
    <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">30-Day Spend Trend</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" />
            <span className="text-mc-text-secondary">Daily Spend</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-purple-400" />
            <span className="text-mc-text-secondary">7-day Average</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />

          <XAxis
            dataKey="displayDate"
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
            itemStyle={{ color: '#a855f7' }}
            formatter={(value: number | undefined) => [`$${(value || 0).toFixed(2)}`, 'Cost']}
            cursor={{ stroke: '#6b7280', strokeDasharray: '3 3' }}
          />

          {/* Area fill with gradient */}
          <Area
            type="monotone"
            dataKey="cost"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#costGradient)"
          />

          {/* 7-day moving average line */}
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#a855f7"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
          />

          {/* Mark today with vertical line */}
          {todayIndex >= 0 && (
            <Line
              type="monotone"
              dataKey={() => null}
              stroke="#06b6d4"
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Today marker */}
      {todayIndex >= 0 && (
        <div className="mt-2 text-xs text-center text-cyan-400">
          ← Today: ${data[todayIndex].cost.toFixed(2)}
        </div>
      )}
    </div>
  );
}
