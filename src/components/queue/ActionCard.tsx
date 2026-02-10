import { TypeBadge } from './TypeBadge';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import type { BrainAction, RiskLevel } from '@/lib/types';

interface ActionCardProps {
  action: BrainAction;
  onClick: () => void;
}

const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-red-400',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
};

export function ActionCard({ action, onClick }: ActionCardProps) {
  const previewText = action.details || action.result;
  const preview = previewText.length > 200 ? `${previewText.slice(0, 200)}...` : previewText;

  const formattedTime = new Date(action.timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div
      onClick={onClick}
      className="bg-mc-bg-secondary border border-mc-border rounded-lg p-4 hover:border-mc-accent/50 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <TypeBadge type={action.type} />
          <div className={`flex items-center gap-1 ${RISK_COLORS[action.riskLevel]}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{RISK_LABELS[action.riskLevel]}</span>
          </div>
        </div>
        {action.confidence !== undefined && (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-mc-text-secondary" />
            <span className="text-xs text-mc-text-secondary">{Math.round(action.confidence * 100)}%</span>
          </div>
        )}
      </div>

      {/* Action Preview */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-mc-text mb-1 group-hover:text-mc-accent transition-colors">
          {action.action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </h3>
        <p className="text-sm text-mc-text-secondary line-clamp-2">{preview}</p>
      </div>

      {/* Confidence Bar */}
      {action.confidence !== undefined && (
        <div className="mb-3">
          <div className="w-full bg-mc-bg-tertiary rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-mc-accent to-cyan-400 transition-all"
              style={{ width: `${action.confidence * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-mc-text-secondary">
        <div className="flex items-center gap-2">
          <span className="font-mono">{action.tool}</span>
          <span>•</span>
          <span>{formattedTime}</span>
        </div>
        <div className={`px-2 py-0.5 rounded-full ${
          action.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
          action.status === 'approved' ? 'bg-green-500/20 text-green-400' :
          action.status === 'denied' ? 'bg-red-500/20 text-red-400' :
          action.status === 'executed' ? 'bg-blue-500/20 text-blue-400' :
          'bg-gray-500/20 text-gray-400'
        }`}>
          {action.status}
        </div>
      </div>
    </div>
  );
}
