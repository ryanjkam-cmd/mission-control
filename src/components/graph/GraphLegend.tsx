'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES = [
  { name: 'Identity', color: '#a855f7' },
  { name: 'Infrastructure', color: '#3b82f6' },
  { name: 'Strategy', color: '#06b6d4' },
  { name: 'Research', color: '#f97316' },
  { name: 'Meta', color: '#ec4899' },
  { name: 'Protocol', color: '#10b981' },
];

export default function GraphLegend() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="absolute bottom-6 left-6 bg-mc-bg-secondary/95 backdrop-blur border border-mc-border rounded-lg overflow-hidden shadow-xl">
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-2 flex items-center justify-between hover:bg-mc-bg-tertiary/50 transition-colors"
      >
        <span className="text-sm font-semibold text-mc-text">Legend</span>
        {isCollapsed ? (
          <ChevronUp className="w-4 h-4 text-mc-text-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-mc-text-secondary" />
        )}
      </button>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4 pt-0 space-y-4">
          {/* Category colors */}
          <div>
            <h4 className="text-xs font-semibold text-mc-text-secondary mb-2">
              Categories
            </h4>
            <div className="space-y-1.5">
              {CATEGORIES.map((category) => (
                <div key={category.name} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-mc-border"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-xs text-mc-text">{category.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Node types */}
          <div>
            <h4 className="text-xs font-semibold text-mc-text-secondary mb-2">Node Types</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-mc-accent-purple border-2 border-mc-border" />
                <span className="text-xs text-mc-text">Cluster (large)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-mc-text-secondary border border-mc-border" />
                <span className="text-xs text-mc-text">Chunk (small)</span>
              </div>
            </div>
          </div>

          {/* Edge meaning */}
          <div>
            <h4 className="text-xs font-semibold text-mc-text-secondary mb-2">Edges</h4>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-mc-border" />
                <span className="text-xs text-mc-text">Belongs to</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-brand-cyan" />
                <span className="text-xs text-mc-text">Related to</span>
              </div>
            </div>
          </div>

          {/* Interactions */}
          <div>
            <h4 className="text-xs font-semibold text-mc-text-secondary mb-2">
              Interactions
            </h4>
            <div className="text-xs text-mc-text-secondary space-y-1">
              <div>• Click cluster to expand</div>
              <div>• Drag to pan</div>
              <div>• Scroll to zoom</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
