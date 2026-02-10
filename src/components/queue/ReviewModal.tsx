'use client';

import { useState } from 'react';
import { X, CheckCircle2, XCircle, Edit2, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { TypeBadge } from './TypeBadge';
import { useQueueStore } from '@/stores/queueStore';
import type { BrainAction, RiskLevel } from '@/lib/types';

const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'text-green-400 bg-green-500/20 border-green-500/40',
  medium: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40',
  high: 'text-red-400 bg-red-500/20 border-red-500/40',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
};

export function ReviewModal() {
  const { selectedAction, isReviewModalOpen, closeReviewModal, approveAction, denyAction, editAction } =
    useQueueStore();

  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [feedback, setFeedback] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isReviewModalOpen || !selectedAction) return null;

  const action = selectedAction;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveAction(action.id, autoApprove);
      closeReviewModal();
    } catch (err) {
      alert('Failed to approve action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeny = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for denial');
      return;
    }

    setIsSubmitting(true);
    try {
      await denyAction(action.id, feedback);
      closeReviewModal();
    } catch (err) {
      alert('Failed to deny action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    setIsSubmitting(true);
    try {
      await editAction(action.id, editedData);
      setEditMode(false);
      setEditedData({});
    } catch (err) {
      alert('Failed to edit action');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEditMode = () => {
    if (!editMode) {
      setEditedData({
        action: action.action,
        details: action.details,
        parameters: action.parameters,
      });
    }
    setEditMode(!editMode);
  };

  const formattedTime = new Date(action.timestamp).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-mc-bg-secondary border border-mc-border rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-mc-bg-secondary border-b border-mc-border p-6 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TypeBadge type={action.type} />
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${RISK_COLORS[action.riskLevel]}`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{RISK_LABELS[action.riskLevel]}</span>
              </div>
            </div>
            <h2 className="text-xl font-semibold">
              {action.action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-mc-text-secondary">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formattedTime}
              </div>
              {action.confidence !== undefined && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  {Math.round(action.confidence * 100)}% confidence
                </div>
              )}
            </div>
          </div>
          <button
            onClick={closeReviewModal}
            className="p-2 hover:bg-mc-bg-tertiary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Action Details */}
          <div>
            <h3 className="text-sm font-semibold text-mc-text-secondary uppercase tracking-wider mb-3">
              Action Details
            </h3>
            <div className="bg-mc-bg-tertiary rounded-lg p-4 space-y-3">
              <div>
                <label className="text-xs text-mc-text-secondary font-medium">Tool</label>
                <p className="font-mono text-sm mt-1">{action.tool}</p>
              </div>
              <div>
                <label className="text-xs text-mc-text-secondary font-medium">Result</label>
                <p className="text-sm mt-1">{action.result}</p>
              </div>
              {action.details && (
                <div>
                  <label className="text-xs text-mc-text-secondary font-medium">Details</label>
                  {editMode ? (
                    <textarea
                      value={editedData.details || action.details}
                      onChange={(e) => setEditedData({ ...editedData, details: e.target.value })}
                      className="w-full bg-mc-bg border border-mc-border rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:border-mc-accent min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm mt-1 whitespace-pre-wrap">{action.details}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Parameters */}
          {action.parameters && Object.keys(action.parameters).length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-mc-text-secondary uppercase tracking-wider mb-3">
                Parameters
              </h3>
              <div className="bg-mc-bg-tertiary rounded-lg p-4">
                <pre className="text-xs font-mono overflow-x-auto">
                  {JSON.stringify(action.parameters, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Context */}
          {action.context && (
            <div>
              <h3 className="text-sm font-semibold text-mc-text-secondary uppercase tracking-wider mb-3">
                Context
              </h3>
              <div className="bg-mc-bg-tertiary rounded-lg p-4">
                <p className="text-sm whitespace-pre-wrap">{action.context}</p>
              </div>
            </div>
          )}

          {/* Confidence Bar */}
          {action.confidence !== undefined && (
            <div>
              <h3 className="text-sm font-semibold text-mc-text-secondary uppercase tracking-wider mb-3">
                Confidence Score
              </h3>
              <div className="space-y-2">
                <div className="w-full bg-mc-bg-tertiary rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-mc-accent to-cyan-400 transition-all"
                    style={{ width: `${action.confidence * 100}%` }}
                  />
                </div>
                <p className="text-sm text-mc-text-secondary">
                  {Math.round(action.confidence * 100)}% - Brain is{' '}
                  {action.confidence >= 0.8
                    ? 'very confident'
                    : action.confidence >= 0.6
                    ? 'moderately confident'
                    : 'less confident'}{' '}
                  in this action
                </p>
              </div>
            </div>
          )}

          {/* Feedback Section (for deny) */}
          {action.status === 'pending' && (
            <div>
              <h3 className="text-sm font-semibold text-mc-text-secondary uppercase tracking-wider mb-3">
                Feedback (Optional for Approval, Required for Denial)
              </h3>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback to help Brain learn..."
                className="w-full bg-mc-bg border border-mc-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-mc-accent min-h-[100px]"
              />
            </div>
          )}

          {/* Auto-approve checkbox */}
          {action.status === 'pending' && action.riskLevel === 'low' && (
            <div className="bg-mc-bg-tertiary rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoApprove}
                  onChange={(e) => setAutoApprove(e.target.checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">Auto-approve similar actions</div>
                  <p className="text-xs text-mc-text-secondary mt-1">
                    Create a rule to automatically approve similar low-risk actions in the future
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        {action.status === 'pending' && (
          <div className="sticky bottom-0 bg-mc-bg-secondary border-t border-mc-border p-6 flex items-center justify-between">
            <div className="flex gap-3">
              <button
                onClick={toggleEditMode}
                disabled={isSubmitting}
                className="px-4 py-2 bg-mc-bg-tertiary text-mc-text rounded-lg font-medium hover:bg-mc-accent/10 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Edit2 className="w-4 h-4" />
                {editMode ? 'Cancel Edit' : 'Edit'}
              </button>
              {editMode && (
                <button
                  onClick={handleEdit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                >
                  Save Changes
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeny}
                disabled={isSubmitting}
                className="px-6 py-2 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Deny
              </button>
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
            </div>
          </div>
        )}

        {/* Status indicator for non-pending actions */}
        {action.status !== 'pending' && (
          <div className="sticky bottom-0 bg-mc-bg-secondary border-t border-mc-border p-6">
            <div
              className={`text-center py-3 rounded-lg ${
                action.status === 'approved'
                  ? 'bg-green-500/20 text-green-400'
                  : action.status === 'denied'
                  ? 'bg-red-500/20 text-red-400'
                  : action.status === 'executed'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              <span className="font-medium">
                Status: {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
              </span>
              {action.feedback && (
                <p className="text-sm mt-2 opacity-75">Feedback: {action.feedback}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
