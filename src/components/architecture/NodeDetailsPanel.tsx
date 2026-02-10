'use client';

import { X } from 'lucide-react';
import { Node } from 'reactflow';

interface NodeDetailsPanelProps {
  node: Node | null;
  onClose: () => void;
  diagramType: 'brain' | 'agents' | 'system';
}

export default function NodeDetailsPanel({ node, onClose, diagramType }: NodeDetailsPanelProps) {
  if (!node) return null;

  const renderBrainNodeDetails = () => {
    const { label, description, status, pid, uptime } = node.data;
    return (
      <>
        <h3 className="text-lg font-semibold text-mc-text mb-4">{label}</h3>
        {description && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Description</p>
            <p className="text-sm text-mc-text">{description}</p>
          </div>
        )}
        {status && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                status === 'running' ? 'bg-green-500' :
                status === 'stopped' ? 'bg-red-500' :
                status === 'degraded' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`} />
              <span className="text-sm text-mc-text capitalize">{status}</span>
            </div>
          </div>
        )}
        {pid && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Process ID</p>
            <p className="text-sm text-mc-text font-mono">{pid}</p>
          </div>
        )}
        {uptime && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Uptime</p>
            <p className="text-sm text-mc-text">
              {Math.floor(uptime / 3600)}h {Math.floor((uptime % 3600) / 60)}m {uptime % 60}s
            </p>
          </div>
        )}
      </>
    );
  };

  const renderAgentNodeDetails = () => {
    const { label, schedule, alwaysOn, status, pid, uptime } = node.data;
    return (
      <>
        <h3 className="text-lg font-semibold text-mc-text mb-4">{label}</h3>
        {schedule && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Schedule</p>
            <p className="text-sm text-mc-text">{schedule}</p>
          </div>
        )}
        {alwaysOn && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Mode</p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-500/30">
              Always On
            </span>
          </div>
        )}
        {status && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                status === 'running' ? 'bg-green-500' :
                status === 'stopped' ? 'bg-red-500' :
                status === 'degraded' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`} />
              <span className="text-sm text-mc-text capitalize">{status}</span>
            </div>
          </div>
        )}
        {pid && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Process ID</p>
            <p className="text-sm text-mc-text font-mono">{pid}</p>
          </div>
        )}
        {uptime && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Uptime</p>
            <p className="text-sm text-mc-text">
              {Math.floor(uptime / 3600)}h {Math.floor((uptime % 3600) / 60)}m
            </p>
          </div>
        )}
      </>
    );
  };

  const renderSystemNodeDetails = () => {
    const { label, port, status, description } = node.data;
    return (
      <>
        <h3 className="text-lg font-semibold text-mc-text mb-4">{label}</h3>
        {description && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Description</p>
            <p className="text-sm text-mc-text">{description}</p>
          </div>
        )}
        {port && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Port</p>
            <p className="text-sm text-mc-text font-mono">{port}</p>
          </div>
        )}
        {status && (
          <div className="mb-3">
            <p className="text-sm text-mc-text-secondary font-medium mb-1">Health Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                status === 'healthy' ? 'bg-green-500' :
                status === 'unhealthy' ? 'bg-red-500' :
                'bg-gray-500'
              }`} />
              <span className="text-sm text-mc-text capitalize">{status}</span>
            </div>
          </div>
        )}
        <div className="mt-4 p-3 rounded bg-mc-bg-tertiary border border-mc-border">
          <p className="text-xs text-mc-text-secondary">
            Node ID: <span className="font-mono text-mc-text">{node.id}</span>
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-mc-bg-secondary border-l border-mc-border shadow-2xl z-50 animate-slide-in-right">
      <div className="flex items-center justify-between p-4 border-b border-mc-border">
        <h2 className="text-lg font-semibold text-mc-text">Node Details</h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-mc-bg-tertiary text-mc-text-secondary hover:text-mc-text transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 64px)' }}>
        {diagramType === 'brain' && renderBrainNodeDetails()}
        {diagramType === 'agents' && renderAgentNodeDetails()}
        {diagramType === 'system' && renderSystemNodeDetails()}
      </div>
    </div>
  );
}
