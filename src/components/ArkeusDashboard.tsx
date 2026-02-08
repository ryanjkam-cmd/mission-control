'use client';

import { useState, useEffect } from 'react';
import { Activity, Brain, Calendar, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';

interface ArkeusStatus {
  available: boolean;
  timestamp?: string;
  agents?: {
    brain_body?: { status: string; last_run: string };
    watchers?: Record<string, boolean>;
  };
  metrics?: {
    actions_generated: number;
    actions_passed: number;
    actions_killed: number;
    kill_rate: number;
    total_actions: number;
  };
  system?: {
    gateway_uptime: string;
    data_source: string;
  };
}

interface ArkeusAgents {
  agents: Record<string, {
    name: string;
    role: string;
    status: string;
    file?: string;
    schedule?: string;
    last_active?: string;
  }>;
  total: number;
}

export function ArkeusDashboard() {
  const [status, setStatus] = useState<ArkeusStatus | null>(null);
  const [agents, setAgents] = useState<ArkeusAgents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArkeusData();
    // Refresh every 30 seconds
    const interval = setInterval(loadArkeusData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadArkeusData = async () => {
    try {
      // Fetch status and agents in parallel
      const [statusRes, agentsRes] = await Promise.all([
        fetch('/api/arkeus/status'),
        fetch('/api/arkeus/agents'),
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatus(statusData);
      }

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        setAgents(agentsData);
      }

      setError(null);
    } catch (err) {
      setError('Failed to load Arkeus data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-mc-text-secondary">Loading Arkeus data...</div>
      </div>
    );
  }

  if (error || !status?.available) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-400">
          <XCircle className="w-5 h-5" />
          <span>{error || 'Arkeus gateway not available'}</span>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'working':
      case 'scheduled':
      case 'active':
        return 'text-green-400';
      case 'idle':
      case 'standby':
        return 'text-yellow-400';
      case 'stopped':
      case 'offline':
        return 'text-gray-500';
      default:
        return 'text-mc-text-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'working':
      case 'scheduled':
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'idle':
      case 'standby':
        return <Clock className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const metrics = status.metrics || {};
  const killRate = metrics.kill_rate || 0;
  const passRate = metrics.actions_passed && metrics.total_actions
    ? ((metrics.actions_passed / metrics.total_actions) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-mc-bg-secondary border border-mc-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold">Arkeus System Status</h2>
          <span className="ml-auto text-sm text-mc-text-secondary">
            {status.timestamp ? new Date(status.timestamp).toLocaleTimeString() : 'Live'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gateway Status */}
          <div className="bg-mc-bg border border-mc-border rounded p-4">
            <div className="text-sm text-mc-text-secondary mb-1">Gateway</div>
            <div className="text-lg font-semibold capitalize text-green-400">
              {status.system?.gateway_uptime || 'Unknown'}
            </div>
          </div>

          {/* Brain Body */}
          <div className="bg-mc-bg border border-mc-border rounded p-4">
            <div className="text-sm text-mc-text-secondary mb-1">Brain Body</div>
            <div className={`text-lg font-semibold capitalize ${getStatusColor(status.agents?.brain_body?.status || 'unknown')}`}>
              {status.agents?.brain_body?.status || 'Unknown'}
            </div>
          </div>

          {/* Data Source */}
          <div className="bg-mc-bg border border-mc-border rounded p-4">
            <div className="text-sm text-mc-text-secondary mb-1">Data Source</div>
            <div className="text-lg font-semibold">
              {status.system?.data_source?.replace(/_/g, ' ') || 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="bg-mc-bg-secondary border border-mc-border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold">Performance Metrics</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-mc-bg border border-mc-border rounded p-4">
            <div className="text-sm text-mc-text-secondary mb-1">Total Actions</div>
            <div className="text-2xl font-bold">{metrics.total_actions || 0}</div>
          </div>

          <div className="bg-mc-bg border border-mc-border rounded p-4">
            <div className="text-sm text-mc-text-secondary mb-1">Passed</div>
            <div className="text-2xl font-bold text-green-400">{metrics.actions_passed || 0}</div>
            <div className="text-xs text-mc-text-secondary mt-1">{passRate}%</div>
          </div>

          <div className="bg-mc-bg border border-mc-border rounded p-4">
            <div className="text-sm text-mc-text-secondary mb-1">Killed</div>
            <div className="text-2xl font-bold text-red-400">{metrics.actions_killed || 0}</div>
            <div className="text-xs text-mc-text-secondary mt-1">{(killRate * 100).toFixed(1)}%</div>
          </div>

          <div className="bg-mc-bg border border-mc-border rounded p-4">
            <div className="text-sm text-mc-text-secondary mb-1">Generated</div>
            <div className="text-2xl font-bold text-blue-400">{metrics.actions_generated || 0}</div>
          </div>
        </div>
      </div>

      {/* Named Agents */}
      {agents && (
        <div className="bg-mc-bg-secondary border border-mc-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold">Named Agents</h2>
            <span className="ml-auto text-sm text-mc-text-secondary">
              {agents.total} active
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(agents.agents).map(([key, agent]) => (
              <div key={key} className="bg-mc-bg border border-mc-border rounded p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{agent.name}</span>
                      <span className={`flex items-center gap-1 text-sm ${getStatusColor(agent.status)}`}>
                        {getStatusIcon(agent.status)}
                        {agent.status}
                      </span>
                    </div>
                    <div className="text-sm text-mc-text-secondary mb-2">{agent.role}</div>
                    {agent.schedule && (
                      <div className="flex items-center gap-2 text-xs text-mc-text-secondary">
                        <Calendar className="w-3 h-3" />
                        {agent.schedule}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
