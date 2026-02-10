'use client';

import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Play, Scan, BookOpen, Megaphone, Archive,
  Server, MessageSquare
} from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';

interface AgentNodeData {
  label: string;
  icon: any;
  color: string;
  schedule?: string;
  alwaysOn?: boolean;
  status?: 'running' | 'stopped' | 'degraded' | 'unknown';
  pid?: number | null;
  uptime?: number;
}

// Custom agent node component
function AgentNode({ data }: { data: AgentNodeData }) {
  const Icon = data.icon;
  const statusColor = {
    running: 'bg-green-500',
    stopped: 'bg-red-500',
    degraded: 'bg-yellow-500',
    unknown: 'bg-gray-500',
  }[data.status || 'unknown'];

  const isCenter = data.label === 'Runner';

  return (
    <div
      className={`relative px-6 py-4 rounded-lg border-2 ${data.color} backdrop-blur-sm transition-all hover:scale-105 ${
        isCenter ? 'scale-110' : ''
      }`}
      style={{ minWidth: isCenter ? '140px' : '120px' }}
    >
      <div className="flex flex-col items-center gap-2">
        <Icon className={`${isCenter ? 'w-8 h-8' : 'w-6 h-6'} text-mc-text`} />
        <span className={`${isCenter ? 'text-base' : 'text-sm'} font-semibold text-mc-text text-center`}>
          {data.label}
        </span>
        {data.schedule && (
          <span className="text-xs text-mc-text-secondary text-center">
            {data.schedule}
          </span>
        )}
        {data.alwaysOn && (
          <span className="text-xs text-green-400 font-medium">Always On</span>
        )}
      </div>
      {data.status && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${statusColor} border-2 border-mc-bg`} />
      )}
      {/* Tooltip on hover */}
      <div className="absolute opacity-0 hover:opacity-100 transition-opacity bg-mc-bg-secondary border border-mc-border rounded p-2 text-xs text-mc-text-secondary whitespace-nowrap z-50 mt-1 left-0 top-full">
        <div>Status: {data.status || 'unknown'}</div>
        {data.pid && <div>PID: {data.pid}</div>}
        {data.uptime && <div>Uptime: {Math.floor(data.uptime / 3600)}h {Math.floor((data.uptime % 3600) / 60)}m</div>}
        {data.schedule && <div>Schedule: {data.schedule}</div>}
      </div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  agent: AgentNode,
};

export default function AgentTopology() {
  const { daemons, fetchStatus } = useAgentStore();

  // Define agent nodes in circular layout around Runner (center)
  const initialNodes: Node[] = useMemo(() => {
    const centerX = 400;
    const centerY = 300;
    const radius = 200;

    // Map daemons to agent info
    const findDaemon = (search: string) => daemons.find(d => d.name.toLowerCase().includes(search.toLowerCase()));

    const agents = [
      {
        id: 'runner',
        label: 'Runner',
        icon: Play,
        color: 'border-purple-500 bg-purple-900/30',
        schedule: '7x/day at X:30 (8am-8pm)',
        position: { x: centerX, y: centerY },
        daemon: findDaemon('brain-body'),
      },
      {
        id: 'scanner',
        label: 'Scanner',
        icon: Scan,
        color: 'border-blue-500 bg-blue-900/30',
        schedule: '1x/day evening',
        angle: 0,
        daemon: findDaemon('scanner'),
      },
      {
        id: 'learner',
        label: 'Learner',
        icon: BookOpen,
        color: 'border-green-500 bg-green-900/30',
        schedule: 'Bidirectional',
        angle: 60,
        daemon: findDaemon('learner'),
      },
      {
        id: 'briefer',
        label: 'Briefer',
        icon: Megaphone,
        color: 'border-cyan-500 bg-cyan-900/30',
        schedule: '3x/day (8am, 2pm, 7pm)',
        angle: 120,
        daemon: findDaemon('daily-rhythm'),
      },
      {
        id: 'consolidator',
        label: 'Consolidator',
        icon: Archive,
        color: 'border-orange-500 bg-orange-900/30',
        schedule: 'Daily 3am',
        angle: 180,
        daemon: findDaemon('consolidate'),
      },
      {
        id: 'gateway',
        label: 'Gateway',
        icon: Server,
        color: 'border-yellow-500 bg-yellow-900/30',
        alwaysOn: true,
        angle: 240,
        daemon: findDaemon('gateway'),
      },
      {
        id: 'imessage',
        label: 'iMessage Assistant',
        icon: MessageSquare,
        color: 'border-pink-500 bg-pink-900/30',
        alwaysOn: true,
        angle: 300,
        daemon: findDaemon('imessage'),
      },
    ];

    return agents.map(agent => {
      let position;
      if (agent.id === 'runner') {
        position = agent.position!;
      } else {
        const angle = (agent.angle! * Math.PI) / 180;
        position = {
          x: centerX + radius * Math.cos(angle) - 60,
          y: centerY + radius * Math.sin(angle) - 40,
        };
      }

      return {
        id: agent.id,
        type: 'agent',
        position,
        data: {
          label: agent.label,
          icon: agent.icon,
          color: agent.color,
          schedule: agent.schedule,
          alwaysOn: agent.alwaysOn,
          status: agent.daemon?.status,
          pid: agent.daemon?.pid,
          uptime: agent.daemon?.uptime,
        },
      };
    });
  }, [daemons]);

  // Define edges (connections)
  const initialEdges: Edge[] = useMemo(() => {
    return [
      // All agents → Gateway
      { id: 'scanner-gateway', source: 'scanner', target: 'gateway', label: 'API calls', style: { stroke: '#eab308' } },
      { id: 'learner-gateway', source: 'learner', target: 'gateway', label: 'API calls', style: { stroke: '#eab308' } },
      { id: 'briefer-gateway', source: 'briefer', target: 'gateway', label: 'API calls', style: { stroke: '#eab308' } },
      { id: 'consolidator-gateway', source: 'consolidator', target: 'gateway', label: 'API calls', style: { stroke: '#eab308' } },

      // Runner → Gateway → Actions
      {
        id: 'runner-gateway',
        source: 'runner',
        target: 'gateway',
        label: 'Actions',
        animated: true,
        style: { stroke: '#8b5cf6' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      },

      // Learner ↔ Runner (bidirectional feedback)
      {
        id: 'learner-runner-read',
        source: 'learner',
        target: 'runner',
        label: 'ICL',
        style: { stroke: '#10b981' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      },
      {
        id: 'runner-learner-write',
        source: 'runner',
        target: 'learner',
        label: 'Outcomes',
        style: { stroke: '#10b981', strokeDasharray: '5 5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      },

      // Scanner → Memory
      {
        id: 'scanner-patterns',
        source: 'scanner',
        target: 'runner',
        label: 'Patterns',
        style: { stroke: '#3b82f6' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      },

      // Briefer → Telegram
      {
        id: 'briefer-output',
        source: 'briefer',
        target: 'runner',
        label: 'Briefs',
        style: { stroke: '#06b6d4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
      },
    ];
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Fetch status on mount and every 30s
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Update nodes when daemons change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  return (
    <div className="w-full h-[600px] rounded-lg border border-mc-border bg-mc-bg-tertiary">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        className="bg-mc-bg-tertiary"
      >
        <Background color="#374151" gap={16} />
        <Controls className="bg-mc-bg-secondary border-mc-border" />
        <MiniMap
          className="bg-mc-bg-secondary border-mc-border"
          nodeColor={(node) => {
            const color = node.data.color || '';
            if (color.includes('purple')) return '#8b5cf6';
            if (color.includes('blue')) return '#3b82f6';
            if (color.includes('green')) return '#10b981';
            if (color.includes('cyan')) return '#06b6d4';
            if (color.includes('orange')) return '#f97316';
            if (color.includes('yellow')) return '#eab308';
            if (color.includes('pink')) return '#ec4899';
            return '#374151';
          }}
        />
      </ReactFlow>
    </div>
  );
}
