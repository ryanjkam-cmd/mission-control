'use client';

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

/**
 * ModelBreakdown - Pie chart showing spend by model
 *
 * Features:
 * - 3 slices: Haiku (blue), Sonnet (purple), Opus (orange)
 * - Legend with percentages
 * - Center label with total cost
 * - Click to filter (future enhancement)
 */

const COLORS = {
  haiku: '#3b82f6',    // blue
  sonnet: '#a855f7',   // purple
  opus: '#f97316'      // orange
};

interface ChartData {
  name: string;
  value: number;
  color: string;
  displayName: string;
}

export default function ModelBreakdown() {
  const [data, setData] = useState<ChartData[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreakdown = async () => {
      try {
        const res = await fetch('/api/costs/summary?period=month');
        const responseData = await res.json();

        const chartData: ChartData[] = [
          {
            name: 'haiku',
            value: responseData.models.haiku,
            color: COLORS.haiku,
            displayName: 'Haiku'
          },
          {
            name: 'sonnet',
            value: responseData.models.sonnet,
            color: COLORS.sonnet,
            displayName: 'Sonnet'
          },
          {
            name: 'opus',
            value: responseData.models.opus,
            color: COLORS.opus,
            displayName: 'Opus'
          }
        ];

        // Filter out zero values
        const filtered = chartData.filter(d => d.value > 0);

        const totalCost = filtered.reduce((sum, d) => sum + d.value, 0);

        setData(filtered);
        setTotal(totalCost);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch model breakdown:', err);
        setLoading(false);
      }
    };

    fetchBreakdown();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h3 className="text-lg font-semibold mb-4">Model Breakdown</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-mc-text-secondary">Loading breakdown...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0 || total === 0) {
    return (
      <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h3 className="text-lg font-semibold mb-4">Model Breakdown</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-mc-text-secondary">No model data available</div>
        </div>
      </div>
    );
  }

  const CustomLabel = ({ cx, cy }: { cx: number; cy: number }) => (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-mc-text"
    >
      <tspan x={cx} dy="-0.5em" fontSize="24" fontWeight="bold">
        ${total.toFixed(2)}
      </tspan>
      <tspan x={cx} dy="1.5em" fontSize="12" className="fill-mc-text-secondary">
        Total Spend
      </tspan>
    </text>
  );

  return (
    <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
      <h3 className="text-lg font-semibold mb-4">Model Breakdown (This Month)</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              padding: '0.75rem'
            }}
            formatter={(value: number | undefined) => {
              const percentage = ((((value || 0)) / total) * 100).toFixed(1);
              return [`$${(value || 0).toFixed(2)} (${percentage}%)`, 'Cost'];
            }}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => {
              const item = data.find(d => d.name === value);
              if (!item) return value;
              const percentage = ((item.value / total) * 100).toFixed(1);
              return `${item.displayName}: ${percentage}%`;
            }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Model details */}
      <div className="mt-4 space-y-2">
        {data.map(item => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-mc-text-secondary">{item.displayName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-mc-text">${item.value.toFixed(2)}</span>
                <span className="text-mc-text-secondary w-12 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
