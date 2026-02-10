'use client';

import { useState, useEffect } from 'react';
import { ReactFlowProvider, Node } from 'reactflow';
import ArchitectureTabs from '@/components/architecture/ArchitectureTabs';
import BrainDiagram from '@/components/architecture/BrainDiagram';
import AgentTopology from '@/components/architecture/AgentTopology';
import SystemTopology from '@/components/architecture/SystemTopology';
import DiagramControls from '@/components/architecture/DiagramControls';
import NodeDetailsPanel from '@/components/architecture/NodeDetailsPanel';

type TabId = 'brain' | 'agents' | 'system';

export default function ArkeusSystemsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('brain');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showEdgeLabels, setShowEdgeLabels] = useState(true);

  // Persist active tab to localStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('arkeus-systems-active-tab') as TabId;
    if (savedTab && ['brain', 'agents', 'system'].includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    localStorage.setItem('arkeus-systems-active-tab', tab);
    setSelectedNode(null); // Clear selection when switching tabs
  };

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-mc-text">Arkeus Systems</h1>
        <p className="text-mc-text-secondary mt-1">
          Home &gt; Arkeus Systems
        </p>
      </div>

      <ArchitectureTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <ReactFlowProvider>
        <div className="relative">
          {/* Diagram canvas */}
          <div className="min-h-[600px]">
            {activeTab === 'brain' && <BrainDiagram />}
            {activeTab === 'agents' && <AgentTopology />}
            {activeTab === 'system' && <SystemTopology />}
          </div>

          {/* Diagram controls overlay */}
          <DiagramControls
            showLabels={showLabels}
            showEdgeLabels={showEdgeLabels}
            onToggleLabels={() => setShowLabels(!showLabels)}
            onToggleEdgeLabels={() => setShowEdgeLabels(!showEdgeLabels)}
          />
        </div>

        {/* Node details panel */}
        <NodeDetailsPanel
          node={selectedNode}
          onClose={handleClosePanel}
          diagramType={activeTab}
        />
      </ReactFlowProvider>

      {/* Additional info cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
          <h3 className="text-lg font-semibold text-mc-text mb-2">Data Sources</h3>
          <p className="text-sm text-mc-text-secondary">
            7 integrated data sources feed into the Brain layer: Google Calendar, Gmail, iMessage,
            Apple Reminders, Google Tasks, Weather, and Reservations.
          </p>
        </div>

        <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
          <h3 className="text-lg font-semibold text-mc-text mb-2">Brain Pipeline</h3>
          <p className="text-sm text-mc-text-secondary">
            4-stage pipeline: Thinker gathers context → Evaluator validates proposals →
            Model Router selects model → Learner records outcomes for ICL feedback.
          </p>
        </div>

        <div className="rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
          <h3 className="text-lg font-semibold text-mc-text mb-2">System Architecture</h3>
          <p className="text-sm text-mc-text-secondary">
            3-tier architecture: Frontend (Mission Control, Dashboard) → Gateway (REST, MCP, Restricted) →
            Backend (SQLite, Neo4j, Docker, File System).
          </p>
        </div>
      </div>

      {/* Learning Outcomes section */}
      <div className="mt-8 rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h2 className="text-xl font-semibold text-mc-text mb-4">Learning Outcomes</h2>
        <p className="text-sm text-mc-text-secondary mb-4">
          Brain learning metrics tracked through Learner component. Real-time feedback loop
          informs future decisions via In-Context Learning (ICL).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Accepted Actions', value: '—', color: 'text-green-400' },
            { label: 'Rejected Actions', value: '—', color: 'text-red-400' },
            { label: 'Average Confidence', value: '—', color: 'text-blue-400' },
            { label: 'ICL Examples', value: '—', color: 'text-purple-400' },
          ].map((metric) => (
            <div key={metric.label} className="p-4 rounded border border-mc-border bg-mc-bg-tertiary">
              <p className="text-mc-text-secondary text-sm mb-2">{metric.label}</p>
              <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Status section */}
      <div className="mt-8 rounded-lg border border-mc-border bg-mc-bg-secondary p-6">
        <h2 className="text-xl font-semibold text-mc-text mb-4">Active Daemons</h2>
        <p className="text-sm text-mc-text-secondary mb-4">
          7 autonomous agents run on scheduled intervals. Click nodes in the Agent Topology
          diagram to view details.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Runner (Brain Body)', schedule: '7x/day at X:30' },
            { name: 'Scanner', schedule: '1x/day evening' },
            { name: 'Learner', schedule: 'Bidirectional' },
            { name: 'Briefer', schedule: '3x/day (8am, 2pm, 7pm)' },
            { name: 'Consolidator', schedule: 'Daily 3am' },
            { name: 'Gateway', schedule: 'Always On' },
            { name: 'iMessage Assistant', schedule: 'Always On' },
          ].map((agent) => (
            <div key={agent.name} className="p-4 rounded border border-mc-border bg-mc-bg-tertiary">
              <p className="text-mc-text text-sm font-medium mb-1">{agent.name}</p>
              <p className="text-mc-text-secondary text-xs">{agent.schedule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
