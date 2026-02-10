'use client';

import { useEffect } from 'react';
import { ActionCard } from './ActionCard';
import { useQueueStore } from '@/stores/queueStore';
import { CheckCircle2 } from 'lucide-react';

interface ActionQueueGridProps {
  className?: string;
}

export function ActionQueueGrid({ className = '' }: ActionQueueGridProps) {
  const {
    actions,
    filters,
    loading,
    error,
    fetchActions,
    openReviewModal,
    approveAction,
  } = useQueueStore();

  useEffect(() => {
    fetchActions();

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchActions();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchActions]);

  // Filter actions
  const filteredActions = actions.filter((action) => {
    if (filters.status !== 'all' && action.status !== filters.status) return false;
    if (filters.type !== 'all' && action.type !== filters.type) return false;
    if (filters.riskLevel !== 'all' && action.riskLevel !== filters.riskLevel) return false;
    return true;
  });

  // Bulk approve low-risk actions
  const handleBulkApproveLowRisk = async () => {
    const lowRiskPending = filteredActions.filter(
      (a) => a.status === 'pending' && a.riskLevel === 'low'
    );

    if (lowRiskPending.length === 0) return;

    const confirmed = window.confirm(
      `Approve ${lowRiskPending.length} low-risk action${lowRiskPending.length > 1 ? 's' : ''}?`
    );

    if (!confirmed) return;

    try {
      await Promise.all(lowRiskPending.map((action) => approveAction(action.id)));
    } catch (err) {
      console.error('Bulk approve failed:', err);
      alert('Failed to approve some actions. Check console for details.');
    }
  };

  const lowRiskPendingCount = filteredActions.filter(
    (a) => a.status === 'pending' && a.riskLevel === 'low'
  ).length;

  if (loading && actions.length === 0) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-mc-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-mc-text-secondary">Loading actions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="text-center">
          <p className="text-mc-accent-red mb-2">Error loading actions</p>
          <p className="text-sm text-mc-text-secondary">{error}</p>
          <button
            onClick={() => fetchActions()}
            className="mt-4 px-4 py-2 bg-mc-accent text-mc-bg rounded-lg font-medium hover:bg-mc-accent/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (filteredActions.length === 0) {
    return (
      <div className={`flex items-center justify-center py-16 ${className}`}>
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-mc-text-secondary mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No actions found</h3>
          <p className="text-sm text-mc-text-secondary">
            {filters.status !== 'all' || filters.type !== 'all' || filters.riskLevel !== 'all'
              ? 'Try adjusting your filters'
              : 'Brain has not proposed any actions yet'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Bulk Actions */}
      {lowRiskPendingCount > 0 && (
        <div className="mb-4 flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="text-sm">
            <span className="font-medium text-green-400">{lowRiskPendingCount}</span>
            <span className="text-mc-text-secondary ml-2">
              low-risk action{lowRiskPendingCount > 1 ? 's' : ''} pending
            </span>
          </div>
          <button
            onClick={handleBulkApproveLowRisk}
            className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve All Low-Risk
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredActions.map((action) => (
          <ActionCard key={action.id} action={action} onClick={() => openReviewModal(action)} />
        ))}
      </div>
    </div>
  );
}
