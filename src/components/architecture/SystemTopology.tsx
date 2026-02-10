'use client';

import { useEffect, useMemo, useState } from 'react';
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
  Monitor, Server, Database, GitMerge, Container, FolderOpen
} from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';

interface ServiceNodeData {
  label: string;
  icon: any;
  color: string;
  port?: number;
  status?: 'healthy' | 'unhealthy' | 'unknown';
  description?: string;
}

// Custom service node component
function ServiceNode({ data }: { data: ServiceNodeData }) {
  const Icon = data.icon;
  const statusColor = {
    healthy: 'bg-green-500',
    unhealthy: 'bg-red-500',
    unknown: 'bg-gray-500',
  }[data.status || 'unknown'];

  return (
    <div className={`relative px-6 py-4 rounded-lg border-2 ${data.color} backdrop-blur-sm transition-all hover:scale-105`}>
      <div className="flex flex-col items-center gap-2">
        <Icon className="w-6 h-6 text-mc-text" />
        <span className="text-sm font-semibold text-mc-text text-center">
          {data.label}
        </span>
        {data.port && (
          <span className="text-xs text-mc-text-secondary">:{data.port}</span>
        )}
      </div>
      {data.status && (
        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${statusColor} border-2 border-mc-bg`} />
      )}
      {data.description && (
        <div className="absolute opacity-0 hover:opacity-100 transition-opacity bg-mc-bg-secondary border border-mc-border rounded p-2 text-xs text-mc-text-secondary whitespace-nowrap z-50 mt-1">
          {data.description}
        </div>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  service: ServiceNode,
};

export default function SystemTopology() {
  const { gateway, neo4j, fetchStatus } = useAgentStore();
  const [healthStatus, setHealthStatus] = useState<any>(null);

  // Fetch health status
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8787';
        const apiKey = process.env.NEXT_PUBLIC_GATEWAY_API_KEY || '';

        const response = await fetch(`${gatewayUrl}/health/ready`, {
          headers: { 'X-API-Key': apiKey },
        });

        if (response.ok) {
          const data = await response.json();
          setHealthStatus(data);
        }
      } catch (err) {
        console.error('Health check failed:', err);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Define nodes in 3-tier layout
  const initialNodes: Node[] = useMemo(() => {
    // Tier 1: Frontend (top)
    const frontendY = 50;
    const frontendNodes = [
      {
        id: 'mission-control',
        label: 'Mission Control',
        icon: Monitor,
        color: 'border-purple-500 bg-purple-900/30',
        port: 3000,
        x: 200,
        status: 'healthy' as const,
        description: 'Marketing agency dashboard',
      },
      {
        id: 'dashboard',
        label: 'System Dashboard',
        icon: Monitor,
        color: 'border-purple-500 bg-purple-900/30',
        port: 8788,
        x: 500,
        status: 'healthy' as const,
        description: 'System status dashboard',
      },
    ];

    // Tier 2: Gateway (middle)
    const gatewayY = 250;
    const gatewayNodes = [
      {
        id: 'rest-gateway',
        label: 'REST Gateway',
        icon: Server,
        color: 'border-cyan-500 bg-cyan-900/30',
        port: 8787,
        x: 150,
        status: gateway.status,
        description: 'Main API gateway',
      },
      {
        id: 'mcp-gateway',
        label: 'MCP Gateway',
        icon: Server,
        color: 'border-cyan-500 bg-cyan-900/30',
        port: 8788,
        x: 350,
        status: healthStatus?.checks?.mcp?.status || 'unknown' as const,
        description: 'AI agent protocol',
      },
      {
        id: 'restricted-gateway',
        label: 'Restricted Gateway',
        icon: Server,
        color: 'border-cyan-500 bg-cyan-900/30',
        port: 8790,
        x: 550,
        status: 'healthy' as const,
        description: 'OpenClaw judge',
      },
    ];

    // Tier 3: Backend (bottom)
    const backendY = 450;
    const backendNodes = [
      {
        id: 'sqlite',
        label: 'SQLite',
        icon: Database,
        color: 'border-blue-500 bg-blue-900/30',
        x: 100,
        status: 'healthy' as const,
        description: 'Operational data',
      },
      {
        id: 'neo4j',
        label: 'Neo4j',
        icon: GitMerge,
        color: 'border-blue-500 bg-blue-900/30',
        port: 7687,
        x: 250,
        status: neo4j.status,
        description: 'Knowledge graph',
      },
      {
        id: 'docker',
        label: 'Docker',
        icon: Container,
        color: 'border-blue-500 bg-blue-900/30',
        x: 400,
        status: healthStatus?.checks?.docker?.status || 'unknown' as const,
        description: 'Containers',
      },
      {
        id: 'filesystem',
        label: 'File System',
        icon: FolderOpen,
        color: 'border-blue-500 bg-blue-900/30',
        x: 550,
        status: 'healthy' as const,
        description: '~/.arkeus/',
      },
    ];

    const nodes: Node[] = [];

    // Add frontend nodes
    frontendNodes.forEach(node => {
      nodes.push({
        id: node.id,
        type: 'service',
        position: { x: node.x, y: frontendY },
        data: {
          label: node.label,
          icon: node.icon,
          color: node.color,
          port: node.port,
          status: node.status,
          description: node.description,
        },
      });
    });

    // Add gateway nodes
    gatewayNodes.forEach(node => {
      nodes.push({
        id: node.id,
        type: 'service',
        position: { x: node.x, y: gatewayY },
        data: {
          label: node.label,
          icon: node.icon,
          color: node.color,
          port: node.port,
          status: node.status,
          description: node.description,
        },
      });
    });

    // Add backend nodes
    backendNodes.forEach(node => {
      nodes.push({
        id: node.id,
        type: 'service',
        position: { x: node.x, y: backendY },
        data: {
          label: node.label,
          icon: node.icon,
          color: node.color,
          port: node.port,
          status: node.status,
          description: node.description,
        },
      });
    });

    return nodes;
  }, [gateway, neo4j, healthStatus]);

  // Define edges (connections with port labels)
  const initialEdges: Edge[] = useMemo(() => {
    return [
      // Frontend → REST Gateway
      {
        id: 'mc-rest',
        source: 'mission-control',
        target: 'rest-gateway',
        label: '8787',
        style: { stroke: '#8b5cf6' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      },
      {
        id: 'dash-rest',
        source: 'dashboard',
        target: 'rest-gateway',
        label: '8787',
        style: { stroke: '#8b5cf6' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      },

      // REST Gateway → Backend
      {
        id: 'rest-sqlite',
        source: 'rest-gateway',
        target: 'sqlite',
        animated: true,
        style: { stroke: '#06b6d4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
      },
      {
        id: 'rest-neo4j',
        source: 'rest-gateway',
        target: 'neo4j',
        label: '7687',
        animated: true,
        style: { stroke: '#06b6d4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
      },
      {
        id: 'rest-docker',
        source: 'rest-gateway',
        target: 'docker',
        style: { stroke: '#06b6d4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
      },
      {
        id: 'rest-fs',
        source: 'rest-gateway',
        target: 'filesystem',
        style: { stroke: '#06b6d4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#06b6d4' },
      },

      // MCP Gateway ↔ AI Agents (shown as bidirectional to filesystem)
      {
        id: 'mcp-fs',
        source: 'mcp-gateway',
        target: 'filesystem',
        label: 'MCP Tools',
        style: { stroke: '#3b82f6', strokeDasharray: '5 5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      },

      // Restricted Gateway → Brain MCP
      {
        id: 'restricted-fs',
        source: 'restricted-gateway',
        target: 'filesystem',
        label: 'Judge',
        style: { stroke: '#f97316' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' },
      },
    ];
  }, []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Fetch status on mount
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Update nodes when status changes
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
            if (color.includes('cyan')) return '#06b6d4';
            if (color.includes('blue')) return '#3b82f6';
            return '#374151';
          }}
        />
      </ReactFlow>
    </div>
  );
}
