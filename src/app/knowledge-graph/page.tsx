'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import CytoscapeGraph from '@/components/graph/CytoscapeGraph';
import GraphControls from '@/components/graph/GraphControls';
import GraphStats from '@/components/graph/GraphStats';
import GraphLegend from '@/components/graph/GraphLegend';
import MetadataPanel from '@/components/graph/MetadataPanel';

interface Cluster {
  id: number;
  category: string;
  title?: string;
  member_count?: number;
}

interface GraphStats {
  totalNodes: number;
  totalChunks: number;
  totalClusters: number;
  totalRelationships: number;
}

export default function KnowledgeGraphPage() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  // Graph state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [layout, setLayout] = useState<'concentric' | 'grid' | 'circle' | 'hierarchical'>(
    'concentric'
  );
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  // Fetch clusters and stats on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch real data
      const [clustersRes, statsRes] = await Promise.all([
        fetch('/api/neo4j/clusters'),
        fetch('/api/neo4j/stats'),
      ]);

      if (!clustersRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data from Neo4j');
      }

      const clustersData = await clustersRes.json();
      const statsData = await statsRes.json();

      setClusters(clustersData);
      setStats(statsData);
      setUseMockData(false);
    } catch (err) {
      console.error('Error fetching Neo4j data:', err);

      // Fallback to mock data
      const mockClusters = generateMockClusters(323);
      setClusters(mockClusters);
      setStats({
        totalNodes: 29107,
        totalChunks: 26187,
        totalClusters: 323,
        totalRelationships: 800138,
      });
      setUseMockData(true);
      setError(
        err instanceof Error ? err.message : 'Failed to connect to Neo4j. Using mock data.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock clusters for demo
  const generateMockClusters = (count: number): Cluster[] => {
    const categories = ['Identity', 'Infrastructure', 'Strategy', 'Research', 'Meta', 'Protocol'];

    return Array.from({ length: count }, (_, i) => {
      const category = categories[i % categories.length];
      return {
        id: i + 1,
        category,
        title: `${category} Cluster ${Math.floor(i / categories.length) + 1}`,
        member_count: Math.floor(Math.random() * 200) + 10,
      };
    });
  };

  // Calculate category counts
  const categoryCounts = clusters.reduce(
    (acc, cluster) => {
      acc[cluster.category] = (acc[cluster.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Filter clusters based on selected categories
  const filteredClusters =
    selectedCategories.length > 0
      ? clusters.filter((c) => selectedCategories.includes(c.category))
      : clusters;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-mc-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-mc-text-secondary">Loading knowledge graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-mc-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-mc-border bg-mc-bg-secondary flex-shrink-0 z-20">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-mc-text-secondary hover:text-mc-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔗</span>
              <div>
                <h1 className="text-xl font-bold">Knowledge Graph</h1>
                <p className="text-sm text-mc-text-secondary">
                  Neo4j Explorer · {stats?.totalClusters || 0} clusters · {stats?.totalChunks || 0}{' '}
                  chunks
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Connection error banner */}
      {useMockData && error && (
        <div className="bg-mc-accent-yellow/10 border-b border-mc-accent-yellow/30 px-6 py-3 flex items-center gap-3 flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-mc-accent-yellow flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-mc-text">
              <span className="font-semibold">Neo4j connection failed.</span> Displaying mock data
              for demonstration. Check that Neo4j is running on{' '}
              <code className="bg-mc-bg px-1.5 py-0.5 rounded text-xs">
                bolt://localhost:7687
              </code>
            </p>
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 bg-mc-accent-yellow text-mc-bg rounded-lg text-sm font-medium hover:bg-mc-accent-yellow/90 transition-colors flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats bar */}
      <GraphStats
        totalClusters={stats?.totalClusters || 0}
        totalChunks={stats?.totalChunks || 0}
        visibleClusters={filteredClusters.length}
        visibleChunks={0}
        selectedCategory={selectedCategories.length === 1 ? selectedCategories[0] : 'All categories'}
        searchResults={0}
      />

      {/* Main graph area */}
      <div className="flex-1 relative">
        {/* Graph controls overlay */}
        <GraphControls
          onSearchChange={setSearchQuery}
          onCategoryFilter={setSelectedCategories}
          onLayoutChange={setLayout}
          onToggleLabels={setShowLabels}
          onToggleEdges={setShowEdges}
          categoryCounts={categoryCounts}
        />

        {/* Graph canvas */}
        <CytoscapeGraph
          clusters={filteredClusters}
          onNodeClick={setSelectedNode}
          searchQuery={searchQuery}
          selectedCategories={selectedCategories}
          showLabels={showLabels}
          showEdges={showEdges}
          layout={layout}
        />

        {/* Legend */}
        <GraphLegend />
      </div>

      {/* Metadata panel */}
      {selectedNode && (
        <MetadataPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}
