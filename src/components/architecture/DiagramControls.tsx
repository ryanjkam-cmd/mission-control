'use client';

import { ZoomIn, ZoomOut, Maximize2, Download, Tag, GitBranch } from 'lucide-react';
import { useReactFlow } from 'reactflow';
import { useState } from 'react';

interface DiagramControlsProps {
  showLabels?: boolean;
  showEdgeLabels?: boolean;
  onToggleLabels?: () => void;
  onToggleEdgeLabels?: () => void;
  onDownload?: () => void;
}

export default function DiagramControls({
  showLabels = true,
  showEdgeLabels = true,
  onToggleLabels,
  onToggleEdgeLabels,
  onDownload,
}: DiagramControlsProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Simple download using html-to-image would be added here
      alert('Download feature coming soon - will export diagram as PNG');
    }
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      {/* Zoom controls */}
      <div className="flex flex-col gap-1 bg-mc-bg-secondary border border-mc-border rounded-lg p-1">
        <button
          onClick={() => zoomIn()}
          className="p-2 rounded hover:bg-mc-bg-tertiary text-mc-text transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => zoomOut()}
          className="p-2 rounded hover:bg-mc-bg-tertiary text-mc-text transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => fitView({ padding: 0.2, duration: 300 })}
          className="p-2 rounded hover:bg-mc-bg-tertiary text-mc-text transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Toggle controls */}
      <div className="flex flex-col gap-1 bg-mc-bg-secondary border border-mc-border rounded-lg p-1">
        {onToggleLabels && (
          <button
            onClick={onToggleLabels}
            className={`p-2 rounded transition-colors ${
              showLabels
                ? 'bg-mc-accent/20 text-mc-accent'
                : 'hover:bg-mc-bg-tertiary text-mc-text-secondary'
            }`}
            title="Toggle Labels"
          >
            <Tag className="w-4 h-4" />
          </button>
        )}
        {onToggleEdgeLabels && (
          <button
            onClick={onToggleEdgeLabels}
            className={`p-2 rounded transition-colors ${
              showEdgeLabels
                ? 'bg-mc-accent/20 text-mc-accent'
                : 'hover:bg-mc-bg-tertiary text-mc-text-secondary'
            }`}
            title="Toggle Edge Labels"
          >
            <GitBranch className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={handleDownload}
          className="p-2 rounded hover:bg-mc-bg-tertiary text-mc-text transition-colors"
          title="Download as PNG"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
