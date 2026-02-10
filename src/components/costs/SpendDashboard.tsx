'use client';

import { useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useCostStore } from '@/stores/costStore';

/**
 * SpendDashboard - Three main spend cards (Today, Week, Month)
 *
 * Features:
 * - Large USD amounts with 2 decimal places
 * - Top consuming domain
 * - Trend indicators
 * - Budget progress
 */

interface SpendCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trend?: {
    direction: 'up' | 'down';
    percentage: number;
  };
  subtitle?: string;
  loading?: boolean;
}

function SpendCard({ title, amount, icon, trend, subtitle, loading }: SpendCardProps) {
  return (
    <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-mc-text-secondary mb-1">{title}</h3>
          {loading ? (
            <div className="h-8 w-24 bg-mc-border animate-pulse rounded" />
          ) : (
            <div className="text-3xl font-bold">
              ${amount.toFixed(2)}
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-cyan-500/10">
          {icon}
        </div>
      </div>

      {trend && !loading && (
        <div className="flex items-center gap-2 text-sm">
          <span className={trend.direction === 'up' ? 'text-red-400' : 'text-green-400'}>
            {trend.direction === 'up' ? '↑' : '↓'} {trend.percentage.toFixed(1)}%
          </span>
          <span className="text-mc-text-secondary">vs last period</span>
        </div>
      )}

      {subtitle && !loading && (
        <div className="mt-2 text-sm text-mc-text-secondary">
          {subtitle}
        </div>
      )}
    </div>
  );
}

export default function SpendDashboard() {
  const { todaySpend, weekSpend, monthSpend, monthlyBudget, loading, updateSpend, projectedSpend, daysRemaining } = useCostStore();

  useEffect(() => {
    // Fetch costs on mount
    const fetchData = async () => {
      try {
        const [todayRes, weekRes, monthRes] = await Promise.all([
          fetch('/api/costs/summary?period=today'),
          fetch('/api/costs/summary?period=week'),
          fetch('/api/costs/summary?period=month')
        ]);

        const todayData = await todayRes.json();
        const weekData = await weekRes.json();
        const monthData = await monthRes.json();

        // Calculate days in month
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysElapsed = now.getDate();
        const daysRemaining = daysInMonth - daysElapsed;

        // Calculate projected spend
        const avgDailySpend = monthData.total / daysElapsed;
        const projectedSpend = monthData.total + (avgDailySpend * daysRemaining);

        updateSpend({
          todaySpend: todayData.total,
          weekSpend: weekData.total,
          monthSpend: monthData.total,
          breakdown: monthData.models,
          domainBreakdown: monthData.domains,
          projectedSpend,
          daysRemaining
        });
      } catch (err) {
        console.error('Failed to fetch spend data:', err);
      }
    };

    fetchData();
  }, [updateSpend, projectedSpend, daysRemaining]);

  // Calculate top domain
  const topDomain = useCostStore(state => {
    const domains = state.domainBreakdown;
    const entries = Object.entries(domains);
    if (entries.length === 0) return null;

    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted[0];
  });

  // Calculate average per day
  const avgPerDay = weekSpend / 7;

  // Calculate budget progress
  const budgetProgress = (monthSpend / monthlyBudget) * 100;
  const projectedProgress = ((projectedSpend || 0) / monthlyBudget) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Today Spend */}
      <SpendCard
        title="Today's Spend"
        amount={todaySpend}
        icon={<DollarSign className="w-6 h-6 text-purple-400" />}
        subtitle={topDomain ? `Top: ${topDomain[0]} ($${topDomain[1].toFixed(2)})` : undefined}
        loading={loading}
      />

      {/* Week Spend */}
      <SpendCard
        title="Last 7 Days"
        amount={weekSpend}
        icon={<TrendingUp className="w-6 h-6 text-cyan-400" />}
        subtitle={`Avg: $${avgPerDay.toFixed(2)}/day`}
        loading={loading}
      />

      {/* Month Spend */}
      <SpendCard
        title="This Month"
        amount={monthSpend}
        icon={<Calendar className="w-6 h-6 text-purple-400" />}
        subtitle={
          monthlyBudget > 0
            ? `${budgetProgress.toFixed(1)}% of $${monthlyBudget} budget`
            : undefined
        }
        loading={loading}
      />

      {/* Budget Progress Bar (spans full width on mobile, 2 cols on larger) */}
      {monthlyBudget > 0 && !loading && (
        <div className="col-span-full lg:col-span-2 rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-mc-text-secondary">
              Monthly Budget Progress
            </h3>
            <span className={`text-sm font-medium ${
              projectedProgress > 100 ? 'text-red-400' :
              projectedProgress > 80 ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              Projected: ${projectedSpend.toFixed(2)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 bg-mc-border rounded-full overflow-hidden">
            {/* Current spend */}
            <div
              className="absolute h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${Math.min(budgetProgress, 100)}%` }}
            />
            {/* Projected spend (lighter) */}
            <div
              className="absolute h-full bg-purple-500/30 transition-all duration-500"
              style={{ width: `${Math.min(projectedProgress, 100)}%` }}
            />
          </div>

          {/* Labels */}
          <div className="flex items-center justify-between mt-2 text-xs text-mc-text-secondary">
            <span>${monthSpend.toFixed(2)} spent</span>
            <span>{daysRemaining} days remaining</span>
          </div>

          {/* Alert if over budget */}
          {projectedProgress > 100 && (
            <div className="mt-3 p-2 rounded bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">
                Warning: Projected to exceed budget by ${(projectedSpend - monthlyBudget).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
