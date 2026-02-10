'use client';

import { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, NodeSingular } from 'cytoscape';
// @ts-expect-error - no types available for cytoscape-fcose
import fcose from 'cytoscape-fcose';
import { Loader2 } from 'lucide-react';

// Register layout
if (typeof window !== 'undefined') {
  cytoscape.use(fcose);
}

interface Cluster {
  id: number;
  category: string;
  title?: string;
  member_count?: number;
}

interface Chunk {
  id: string;
  chunk_id: string;
  text_preview?: string;
  source?: string;
  domain?: string;
  cluster?: string;
}

interface CytoscapeGraphProps {
  clusters: Cluster[];
  onNodeClick?: (node: any) => void;
  onExpand?: (clusterId: number) => void;
  searchQuery?: string;
  selectedCategories?: string[];
  showLabels?: boolean;
  showEdges?: boolean;
  layout?: 'concentric' | 'grid' | 'circle' | 'hierarchical';
}

// Category color mapping
const CATEGORY_COLORS: Record<string, string> = {
  Identity: '#a855f7', // Purple
  Infrastructure: '#3b82f6', // Blue
  Strategy: '#06b6d4', // Cyan
  Research: '#f97316', // Orange
  Meta: '#ec4899', // Pink
  Protocol: '#10b981', // Green
};

export default function CytoscapeGraph({
  clusters,
  onNodeClick,
  onExpand,
  searchQuery = '',
  selectedCategories = [],
  showLabels = true,
  showEdges = true,
  layout = 'concentric',
}: CytoscapeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [expandedClusters, setExpandedClusters] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: [
        {
          selector: 'node[type="cluster"]',
          style: {
            'background-color': 'data(color)',
            width: 'data(size)',
            height: 'data(size)',
            label: showLabels ? 'data(label)' : '',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '12px',
            color: '#c9d1d9',
            'text-outline-color': '#0d1117',
            'text-outline-width': 2,
            'border-width': 2,
            'border-color': '#30363d',
            'border-opacity': 0.5,
          },
        },
        {
          selector: 'node[type="cluster"]:selected',
          style: {
            'border-color': '#a855f7',
            'border-width': 3,
            'border-opacity': 1,
          },
        },
        {
          selector: 'node[type="cluster"].expanded',
          style: {
            'border-color': '#22d3ee',
            'border-width': 3,
            'border-opacity': 1,
            'background-opacity': 0.9,
          },
        },
        {
          selector: 'node[type="chunk"]',
          style: {
            'background-color': '#8b949e',
            width: 10,
            height: 10,
            label: '',
            'border-width': 1,
            'border-color': '#30363d',
            'border-opacity': 0.3,
          },
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-color': '#a855f7',
            'border-width': 4,
            'background-opacity': 1,
          },
        },
        {
          selector: 'node.dimmed',
          style: {
            opacity: 0.3,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1,
            'line-color': '#30363d',
            'target-arrow-color': '#30363d',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            opacity: showEdges ? 0.3 : 0,
          },
        },
        {
          selector: 'edge.highlighted',
          style: {
            'line-color': '#22d3ee',
            'target-arrow-color': '#22d3ee',
            width: 2,
            opacity: 0.8,
          },
        },
      ],
      wheelSensitivity: 0.2,
      minZoom: 0.1,
      maxZoom: 3,
    });

    cyRef.current = cy;

    // Click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const data = node.data();

      if (data.type === 'cluster' && !expandedClusters.has(data.id)) {
        // Expand cluster
        handleExpandCluster(data.id);
      }

      if (onNodeClick) {
        onNodeClick(data);
      }
    });

    setIsInitialized(true);

    return () => {
      cy.destroy();
    };
  }, []);

  // Update graph when clusters change
  useEffect(() => {
    if (!cyRef.current || !isInitialized) return;

    const cy = cyRef.current;

    // Clear existing elements
    cy.elements().remove();

    // Filter clusters by selected categories
    const filteredClusters = selectedCategories.length > 0
      ? clusters.filter((c) => selectedCategories.includes(c.category))
      : clusters;

    // Add cluster nodes
    const elements = filteredClusters.map((cluster) => ({
      data: {
        id: `cluster-${cluster.id}`,
        label: cluster.title || `Cluster ${cluster.id}`,
        type: 'cluster',
        clusterId: cluster.id,
        category: cluster.category,
        memberCount: cluster.member_count || 0,
        color: CATEGORY_COLORS[cluster.category] || '#8b949e',
        size: Math.max(30, Math.min(50, 30 + (cluster.member_count || 0) / 10)),
      },
    }));

    cy.add(elements);

    // Apply layout
    applyLayout();
  }, [clusters, isInitialized, selectedCategories]);

  // Update labels visibility
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    cy.style()
      .selector('node[type="cluster"]')
      .style({ label: showLabels ? 'data(label)' : '' })
      .update();
  }, [showLabels]);

  // Update edges visibility
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;
    cy.style()
      .selector('edge')
      .style({ opacity: showEdges ? 0.3 : 0 })
      .update();
  }, [showEdges]);

  // Handle search highlighting
  useEffect(() => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    // Remove previous highlighting
    cy.nodes().removeClass('highlighted dimmed');
    cy.edges().removeClass('highlighted');

    if (!searchQuery) return;

    const query = searchQuery.toLowerCase();
    const matchingNodes = cy.nodes().filter((node) => {
      const label = node.data('label')?.toLowerCase() || '';
      const category = node.data('category')?.toLowerCase() || '';
      return label.includes(query) || category.includes(query);
    });

    if (matchingNodes.length > 0) {
      // Highlight matching nodes
      matchingNodes.addClass('highlighted');

      // Dim non-matching nodes
      cy.nodes().difference(matchingNodes).addClass('dimmed');

      // Fit to matching nodes
      cy.fit(matchingNodes, 100);
    }
  }, [searchQuery]);

  // Apply layout based on selected type
  const applyLayout = () => {
    if (!cyRef.current) return;

    const cy = cyRef.current;

    let layoutConfig: any = {
      name: 'concentric',
      animate: true,
      animationDuration: 500,
      fit: true,
      padding: 50,
    };

    switch (layout) {
      case 'concentric':
        layoutConfig = {
          ...layoutConfig,
          name: 'concentric',
          concentric: (node: NodeSingular) => {
            const categories = ['Identity', 'Infrastructure', 'Strategy', 'Research', 'Meta', 'Protocol'];
            const category = node.data('category');
            return categories.indexOf(category) + 1;
          },
          levelWidth: () => 2,
        };
        break;

      case 'grid':
        layoutConfig = {
          ...layoutConfig,
          name: 'grid',
          rows: Math.ceil(Math.sqrt(cy.nodes().length)),
        };
        break;

      case 'circle':
        layoutConfig = {
          ...layoutConfig,
          name: 'circle',
        };
        break;

      case 'hierarchical':
        layoutConfig = {
          ...layoutConfig,
          name: 'breadthfirst',
          directed: true,
        };
        break;
    }

    cy.layout(layoutConfig).run();
  };

  // Re-apply layout when layout type changes
  useEffect(() => {
    if (isInitialized) {
      applyLayout();
    }
  }, [layout, isInitialized]);

  // Handle cluster expansion
  const handleExpandCluster = async (clusterId: number) => {
    if (expandedClusters.has(clusterId) || !cyRef.current) return;

    setIsLoading(true);

    try {
      // Fetch chunks from API
      const response = await fetch(`/api/neo4j/cluster/${clusterId}/chunks`);
      if (!response.ok) throw new Error('Failed to fetch chunks');

      const chunks: Chunk[] = await response.json();

      const cy = cyRef.current;
      const clusterNode = cy.$(`#cluster-${clusterId}`);

      // Add cluster to expanded set
      setExpandedClusters((prev) => new Set(prev).add(clusterId));
      clusterNode.addClass('expanded');

      // Add chunk nodes
      const chunkElements = chunks.map((chunk, idx) => ({
        data: {
          id: `chunk-${chunk.chunk_id}`,
          label: chunk.text_preview?.substring(0, 50) || '',
          type: 'chunk',
          chunkId: chunk.chunk_id,
          content: chunk.text_preview,
          source: chunk.source,
          domain: chunk.domain,
          clusterId,
        },
      }));

      // Add edges from chunks to cluster
      const edgeElements = chunks.map((chunk) => ({
        data: {
          id: `edge-${chunk.chunk_id}-${clusterId}`,
          source: `chunk-${chunk.chunk_id}`,
          target: `cluster-${clusterId}`,
          type: 'BELONGS_TO',
        },
      }));

      cy.add([...chunkElements, ...edgeElements]);

      // Position chunks around cluster (no full re-layout)
      const clusterPos = clusterNode.position();
      const radius = 150;
      chunks.forEach((chunk, idx) => {
        const angle = (idx / chunks.length) * 2 * Math.PI;
        const x = clusterPos.x + radius * Math.cos(angle);
        const y = clusterPos.y + radius * Math.sin(angle);
        cy.$(`#chunk-${chunk.chunk_id}`).position({ x, y });
      });

      // Fit to expanded cluster + chunks
      const expandedElements = cy
        .nodes()
        .filter((n) => n.id() === `cluster-${clusterId}` || n.data('clusterId') === clusterId);

      cy.animate({
        fit: { eles: expandedElements, padding: 100 },
        duration: 500,
      });

      if (onExpand) {
        onExpand(clusterId);
      }
    } catch (error) {
      console.error('Error expanding cluster:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    cy.zoom(cy.zoom() * 1.2);
    cy.center();
  };

  const handleZoomOut = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    cy.zoom(cy.zoom() * 0.8);
    cy.center();
  };

  const handleFit = () => {
    if (!cyRef.current) return;
    cyRef.current.fit(undefined, 50);
  };

  const handleReset = () => {
    if (!cyRef.current) return;
    const cy = cyRef.current;
    cy.zoom(1);
    cy.center();
    applyLayout();
  };

  return (
    <div className="relative w-full h-full">
      {/* Graph canvas */}
      <div ref={containerRef} className="w-full h-full bg-mc-bg" />

      {/* Zoom controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 rounded-lg bg-mc-bg-secondary border border-mc-border hover:bg-mc-bg-tertiary transition-colors flex items-center justify-center"
          title="Zoom in"
        >
          <span className="text-mc-text text-lg font-bold">+</span>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 rounded-lg bg-mc-bg-secondary border border-mc-border hover:bg-mc-bg-tertiary transition-colors flex items-center justify-center"
          title="Zoom out"
        >
          <span className="text-mc-text text-lg font-bold">−</span>
        </button>
        <button
          onClick={handleFit}
          className="w-10 h-10 rounded-lg bg-mc-bg-secondary border border-mc-border hover:bg-mc-bg-tertiary transition-colors flex items-center justify-center text-xs text-mc-text"
          title="Fit to view"
        >
          Fit
        </button>
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-lg bg-mc-bg-secondary border border-mc-border hover:bg-mc-bg-tertiary transition-colors flex items-center justify-center text-xs text-mc-text"
          title="Reset view"
        >
          Reset
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-mc-bg-secondary border border-mc-border rounded-lg px-4 py-2 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-brand-purple" />
          <span className="text-sm text-mc-text">Loading chunks...</span>
        </div>
      )}
    </div>
  );
}
