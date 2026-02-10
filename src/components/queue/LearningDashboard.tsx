'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface QueueStats {
  kpis: {
    total_reviewed: number;
    approval_rate: number;
    auto_approve_rate: number;
    avg_confidence: number;
  };
  approval_trends: Array<{
    date: string;
    approved: number;
    denied: number;
    edited: number;
    auto_approved: number;
  }>;
  confidence_trends: Array<{
    date: string;
    email_reply?: number;
    imessage?: number;
    calendar_block?: number;
    health_suggestion?: number;
    trip_plan?: number;
  }>;
  type_breakdown: Array<{
    action_type: string;
    approved: number;
    denied: number;
    edited: number;
    auto_approved: number;
  }>;
  top_denied_patterns: Array<{
    action_type: string;
    pattern: string;
    count: number;
    example: any;
  }>;
  rule_effectiveness: Array<{
    rule_id: number;
    description: string;
    times_triggered: number;
    success_rate: number;
    last_triggered: string;
  }>;
}

export default function LearningDashboard() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/queue/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch queue stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Failed to load dashboard data</div>
      </div>
    );
  }

  const { kpis, approval_trends, confidence_trends, type_breakdown, top_denied_patterns, rule_effectiveness } = stats;

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex justify-end gap-2">
        {(['7d', '30d', '90d', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              dateRange === range
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {range === 'all' ? 'All time' : range.toUpperCase()}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Actions Reviewed"
          value={kpis.total_reviewed.toLocaleString()}
          subtitle="All-time"
        />
        <KPICard
          title="Overall Approval Rate"
          value={`${(kpis.approval_rate * 100).toFixed(1)}%`}
          subtitle="Approved actions"
          sparkline={approval_trends.map(t => t.approved)}
        />
        <KPICard
          title="Auto-Approve Rate"
          value={`${(kpis.auto_approve_rate * 100).toFixed(1)}%`}
          subtitle="Zero touch needed"
          trend="up"
        />
        <KPICard
          title="Average Confidence"
          value={`${(kpis.avg_confidence * 100).toFixed(0)}`}
          subtitle="Out of 100"
          progress={kpis.avg_confidence}
        />
      </div>

      {/* Approval Rate Trends Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Approval Rate Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={approval_trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="approved"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              name="Approved"
            />
            <Area
              type="monotone"
              dataKey="auto_approved"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              name="Auto-Approved"
            />
            <Area
              type="monotone"
              dataKey="edited"
              stackId="1"
              stroke="#F59E0B"
              fill="#F59E0B"
              name="Edited"
            />
            <Area
              type="monotone"
              dataKey="denied"
              stackId="1"
              stroke="#EF4444"
              fill="#EF4444"
              name="Denied"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence Evolution Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Confidence Evolution by Action Type</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={confidence_trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis domain={[0, 1]} stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
              formatter={(value: number | undefined) => value?.toFixed(2) ?? 'N/A'}
            />
            <Legend />
            <Line type="monotone" dataKey="email_reply" stroke="#8B5CF6" name="Email Reply" />
            <Line type="monotone" dataKey="imessage" stroke="#10B981" name="iMessage" />
            <Line type="monotone" dataKey="calendar_block" stroke="#3B82F6" name="Calendar Block" />
            <Line type="monotone" dataKey="health_suggestion" stroke="#F59E0B" name="Health" />
            <Line type="monotone" dataKey="trip_plan" stroke="#EC4899" name="Trip Plan" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Action Type Breakdown */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Action Type Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={type_breakdown}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="action_type" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend />
            <Bar dataKey="approved" fill="#10B981" name="Approved" />
            <Bar dataKey="auto_approved" fill="#3B82F6" name="Auto-Approved" />
            <Bar dataKey="edited" fill="#F59E0B" name="Edited" />
            <Bar dataKey="denied" fill="#EF4444" name="Denied" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Denied Patterns */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Denied Patterns</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-3 text-gray-400 font-medium">Action Type</th>
                <th className="pb-3 text-gray-400 font-medium">Pattern</th>
                <th className="pb-3 text-gray-400 font-medium text-right">Count</th>
                <th className="pb-3 text-gray-400 font-medium">Example</th>
              </tr>
            </thead>
            <tbody>
              {top_denied_patterns.map((pattern, idx) => (
                <tr key={idx} className="border-b border-gray-700/50">
                  <td className="py-3 text-gray-300">{pattern.action_type}</td>
                  <td className="py-3 text-gray-300">{pattern.pattern}</td>
                  <td className="py-3 text-gray-300 text-right">{pattern.count}</td>
                  <td className="py-3 text-gray-400 text-sm font-mono max-w-xs truncate">
                    {JSON.stringify(pattern.example)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Auto-Approve Rule Effectiveness */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Auto-Approve Rule Effectiveness</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="pb-3 text-gray-400 font-medium">Rule Description</th>
                <th className="pb-3 text-gray-400 font-medium text-right">Times Triggered</th>
                <th className="pb-3 text-gray-400 font-medium text-right">Success Rate</th>
                <th className="pb-3 text-gray-400 font-medium">Last Triggered</th>
              </tr>
            </thead>
            <tbody>
              {rule_effectiveness.map((rule) => (
                <tr key={rule.rule_id} className="border-b border-gray-700/50">
                  <td className="py-3 text-gray-300">{rule.description}</td>
                  <td className="py-3 text-gray-300 text-right">{rule.times_triggered}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        rule.success_rate >= 90
                          ? 'bg-green-900/30 text-green-400'
                          : rule.success_rate >= 75
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {rule.success_rate}%
                    </span>
                  </td>
                  <td className="py-3 text-gray-400 text-sm">
                    {rule.last_triggered ? new Date(rule.last_triggered).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({
  title,
  value,
  subtitle,
  sparkline,
  trend,
  progress,
}: {
  title: string;
  value: string;
  subtitle: string;
  sparkline?: number[];
  trend?: 'up' | 'down';
  progress?: number;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="text-gray-400 text-sm mb-2">{title}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-gray-500 text-sm">{subtitle}</div>

      {sparkline && (
        <div className="mt-4 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline.map((v, i) => ({ value: v }))}>
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {trend && (
        <div className="mt-4">
          {trend === 'up' ? (
            <span className="text-green-400 text-sm">↑ Trending up</span>
          ) : (
            <span className="text-red-400 text-sm">↓ Trending down</span>
          )}
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
