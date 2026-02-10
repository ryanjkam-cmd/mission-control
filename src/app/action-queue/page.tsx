'use client';

import { useState, useEffect } from 'react';
import { ActionQueueGrid } from '@/components/queue/ActionQueueGrid';
import { ReviewModal } from '@/components/queue/ReviewModal';
import { useQueueStore } from '@/stores/queueStore';
import { Filter, CheckCircle2, Settings } from 'lucide-react';
import Link from 'next/link';
import type { ActionStatus, ActionType, RiskLevel } from '@/lib/types';

const STATUS_OPTIONS: { value: ActionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'executed', label: 'Executed' },
  { value: 'failed', label: 'Failed' },
];

const TYPE_OPTIONS: { value: ActionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'email', label: 'Email' },
  { value: 'imessage', label: 'iMessage' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'task', label: 'Task' },
  { value: 'health', label: 'Health' },
  { value: 'trip', label: 'Trip' },
  { value: 'notification', label: 'Notification' },
];

const RISK_OPTIONS: { value: RiskLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Risk Levels' },
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' },
];

export default function ActionQueuePage() {
  const { filters, setFilters, actions, fetchActions } = useQueueStore();
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const pendingCount = actions.filter((a) => a.status === 'pending').length;
  const lowRiskCount = actions.filter((a) => a.status === 'pending' && a.riskLevel === 'low').length;

  return (
    <div className="min-h-screen bg-mc-bg">
      {/* Header */}
      <header className="border-b border-mc-border bg-mc-bg-secondary">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Action Queue</h1>
              <p className="text-mc-text-secondary text-sm">
                Review and approve actions proposed by Brain Body
              </p>
            </div>
            <div className="flex items-center gap-4">
              {pendingCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-yellow-400">
                    {pendingCount} pending
                  </span>
                  {lowRiskCount > 0 && (
                    <span className="text-xs text-mc-text-secondary">
                      ({lowRiskCount} low-risk)
                    </span>
                  )}
                </div>
              )}
              <Link
                href="/action-queue/rules"
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-mc-bg-tertiary text-mc-text hover:bg-mc-accent/10 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Auto-Approve Rules
              </Link>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters
                    ? 'bg-mc-accent text-mc-bg'
                    : 'bg-mc-bg-tertiary text-mc-text hover:bg-mc-accent/10'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-mc-bg-tertiary rounded-lg border border-mc-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-mc-text-secondary mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ status: e.target.value as ActionStatus | 'all' })
                    }
                    className="w-full bg-mc-bg border border-mc-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mc-accent"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <label className="block text-xs font-medium text-mc-text-secondary mb-2">
                    Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ type: e.target.value as ActionType | 'all' })}
                    className="w-full bg-mc-bg border border-mc-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mc-accent"
                  >
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Risk Level Filter */}
                <div>
                  <label className="block text-xs font-medium text-mc-text-secondary mb-2">
                    Risk Level
                  </label>
                  <select
                    value={filters.riskLevel}
                    onChange={(e) =>
                      setFilters({ riskLevel: e.target.value as RiskLevel | 'all' })
                    }
                    className="w-full bg-mc-bg border border-mc-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mc-accent"
                  >
                    {RISK_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <ActionQueueGrid />
      </main>

      {/* Review Modal */}
      <ReviewModal />
    </div>
  );
}
