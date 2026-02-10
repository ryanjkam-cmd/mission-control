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
  Calendar, Mail, MessageCircle, CheckSquare, ListTodo,
  Cloud, Plane, Brain, CheckCircle, GitBranch, BookOpen,
  Send, CalendarPlus, MailPlus, BellPlus, Database
} from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';

interface CustomNodeData {
  label: string;
  icon: any;
  color?: string;
  status?: 'running' | 'stopped' | 'degraded' | 'unknown';
  description?: string;
  pid?: number | null;
  uptime?: number;
}

// Custom node component with status indicator
function CustomNode({ data }: { data: CustomNodeData }) {
  const Icon = data.icon;
  const statusColor = {
    running: 'bg-green-500',
    stopped: 'bg-red-500',
    degraded: 'bg-yellow-500',
    unknown: 'bg-gray-500',
  }[data.status || 'unknown'];

  const bgColor = data.color || 'bg-mc-bg-tertiary';

  return (
    <div className={`relative px-4 py-3 rounded-lg border border-mc-border ${bgColor} backdrop-blur-sm`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-mc-text" />
        <span className="text-sm font-medium text-mc-text">{data.label}</span>
      </div>
      {data.status && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${statusColor} border-2 border-mc-bg`} />
      )}
      {data.description && (
        <div className="absolute opacity-0 hover:opacity-100 transition-opacity bg-mc-bg-secondary border border-mc-border rounded p-2 text-xs text-mc-text-secondary whitespace-nowrap z-50 mt-1">
          {data.description}
          {data.pid && <div>PID: {data.pid}</div>}
          {data.uptime && <div>Uptime: {Math.floor(data.uptime / 60)}m</div>}
        </div>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export default function BrainDiagram() {
  const { daemons, fetchStatus } = useAgentStore();

  // Define initial nodes
  const initialNodes: Node[] = useMemo(() => {
    // Layer 1: Data Sources (top row)
    const dataSourceY = 50;
    const dataSourceSpacing = 150;
    const dataSources = [
      { id: 'calendar', label: 'Google Calendar', icon: Calendar, desc: '7 days' },
      { id: 'gmail', label: 'Gmail', icon: Mail, desc: '15 unread' },
      { id: 'imessage', label: 'iMessage', icon: MessageCircle, desc: '4h, 15 msgs' },
      { id: 'reminders', label: 'Apple Reminders', icon: CheckSquare, desc: 'Today' },
      { id: 'tasks', label: 'Google Tasks', icon: ListTodo, desc: 'Open' },
      { id: 'weather', label: 'Weather', icon: Cloud, desc: 'Home Assistant' },
      { id: 'reservations', label: 'Reservations', icon: Plane, desc: 'Flights/Hotels' },
    ];

    // Layer 2: Brain (middle row)
    const brainY = 250;
    const brainSpacing = 200;
    const brainNodes = [
      { id: 'thinker', label: 'Thinker', icon: Brain, color: 'bg-purple-900/30', status: 'running' },
      { id: 'evaluator', label: 'Evaluator', icon: CheckCircle, color: 'bg-cyan-900/30', status: 'running' },
      { id: 'router', label: 'Model Router', icon: GitBranch, color: 'bg-blue-900/30', status: 'running' },
      { id: 'learner', label: 'Learner', icon: BookOpen, color: 'bg-green-900/30', status: 'running' },
    ];

    // Layer 3: Body (bottom row)
    const bodyY = 450;
    const bodySpacing = 160;
    const bodyNodes = [
      { id: 'dispatcher', label: 'Dispatcher', icon: Send, color: 'bg-orange-900/30', status: 'running' },
      { id: 'calendar-action', label: 'Calendar Actions', icon: CalendarPlus, desc: 'Create events' },
      { id: 'email-action', label: 'Email Actions', icon: MailPlus, desc: 'Draft emails' },
      { id: 'reminder-action', label: 'Reminder Actions', icon: BellPlus, desc: 'Create reminders' },
      { id: 'memory-action', label: 'Memory Actions', icon: Database, desc: 'Store insights' },
    ];

    const nodes: Node[] = [];

    // Add data source nodes
    dataSources.forEach((source, i) => {
      nodes.push({
        id: source.id,
        type: 'custom',
        position: { x: 100 + i * dataSourceSpacing, y: dataSourceY },
        data: {
          label: source.label,
          icon: source.icon,
          description: source.desc,
        },
      });
    });

    // Add brain nodes with daemon status
    brainNodes.forEach((node, i) => {
      const daemon = daemons.find(d => d.name.includes(node.label.toLowerCase()));
      nodes.push({
        id: node.id,
        type: 'custom',
        position: { x: 200 + i * brainSpacing, y: brainY },
        data: {
          label: node.label,
          icon: node.icon,
          color: node.color,
          status: daemon?.status || 'unknown',
          pid: daemon?.pid,
          uptime: daemon?.uptime,
          description: daemon?.description,
        },
      });
    });

    // Add body nodes
    bodyNodes.forEach((node, i) => {
      const daemon = daemons.find(d => d.name.includes('dispatcher'));
      nodes.push({
        id: node.id,
        type: 'custom',
        position: { x: 150 + i * bodySpacing, y: bodyY },
        data: {
          label: node.label,
          icon: node.icon,
          color: node.color,
          status: i === 0 ? (daemon?.status || 'unknown') : undefined,
          description: node.desc,
        },
      });
    });

    return nodes;
  }, [daemons]);

  // Define edges
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];

    // Data sources → Thinker
    ['calendar', 'gmail', 'imessage', 'reminders', 'tasks', 'weather', 'reservations'].forEach(source => {
      edges.push({
        id: `${source}-thinker`,
        source,
        target: 'thinker',
        animated: true,
        style: { stroke: '#8b5cf6' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      });
    });

    // Thinker → Evaluator
    edges.push({
      id: 'thinker-evaluator',
      source: 'thinker',
      target: 'evaluator',
      label: 'proposals',
      animated: true,
      style: { stroke: '#06b6d4' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
    });

    // Evaluator → Learner
    edges.push({
      id: 'evaluator-learner',
      source: 'evaluator',
      target: 'learner',
      label: 'outcomes',
      style: { stroke: '#10b981' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    });

    // Learner → Thinker (feedback)
    edges.push({
      id: 'learner-thinker',
      source: 'learner',
      target: 'thinker',
      label: 'ICL feedback',
      style: { stroke: '#10b981', strokeDasharray: '5 5' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    });

    // Thinker → Router
    edges.push({
      id: 'thinker-router',
      source: 'thinker',
      target: 'router',
      label: 'routing',
      style: { stroke: '#3b82f6' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    });

    // Router → Dispatcher
    edges.push({
      id: 'router-dispatcher',
      source: 'router',
      target: 'dispatcher',
      label: 'actions',
      animated: true,
      style: { stroke: '#f97316' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
    });

    // Dispatcher → Action nodes
    ['calendar-action', 'email-action', 'reminder-action', 'memory-action'].forEach(action => {
      edges.push({
        id: `dispatcher-${action}`,
        source: 'dispatcher',
        target: action,
        style: { stroke: '#f97316' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
      });
    });

    return edges;
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
            if (node.data.color) return node.data.color;
            return '#374151';
          }}
        />
      </ReactFlow>
    </div>
  );
}
