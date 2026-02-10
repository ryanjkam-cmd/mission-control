'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface GraphControlsProps {
  onSearchChange: (query: string) => void;
  onCategoryFilter: (categories: string[]) => void;
  onLayoutChange: (layout: 'concentric' | 'grid' | 'circle' | 'hierarchical') => void;
  onToggleLabels: (show: boolean) => void;
  onToggleEdges: (show: boolean) => void;
  categoryCounts: Record<string, number>;
}

const ALL_CATEGORIES = [
  { name: 'Identity', color: '#a855f7' },
  { name: 'Infrastructure', color: '#3b82f6' },
  { name: 'Strategy', color: '#06b6d4' },
  { name: 'Research', color: '#f97316' },
  { name: 'Meta', color: '#ec4899' },
  { name: 'Protocol', color: '#10b981' },
];

const LAYOUTS = [
  { value: 'concentric', label: 'Concentric' },
  { value: 'grid', label: 'Grid' },
  { value: 'circle', label: 'Circle' },
  { value: 'hierarchical', label: 'Hierarchical' },
] as const;

export default function GraphControls({
  onSearchChange,
  onCategoryFilter,
  onLayoutChange,
  onToggleLabels,
  onToggleEdges,
  categoryCounts,
}: GraphControlsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showLabels, setShowLabels] = useState(true);
  const [showEdges, setShowEdges] = useState(true);
  const [layout, setLayout] = useState<'concentric' | 'grid' | 'circle' | 'hierarchical'>('concentric');
  const [showFilters, setShowFilters] = useState(false);
  const [resultCount, setResultCount] = useState(0);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearchChange]);

  const handleCategoryToggle = (category: string) => {
    const updated = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updated);
    onCategoryFilter(updated);
  };

  const handleSelectAll = () => {
    setSelectedCategories(ALL_CATEGORIES.map((c) => c.name));
    onCategoryFilter(ALL_CATEGORIES.map((c) => c.name));
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    onCategoryFilter([]);
  };

  const handleLayoutChange = (newLayout: typeof layout) => {
    setLayout(newLayout);
    onLayoutChange(newLayout);
  };

  const handleToggleLabels = () => {
    const newValue = !showLabels;
    setShowLabels(newValue);
    onToggleLabels(newValue);
  };

  const handleToggleEdges = () => {
    const newValue = !showEdges;
    setShowEdges(newValue);
    onToggleEdges(newValue);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setResultCount(0);
  };

  return (
    <div className="absolute top-6 left-6 right-6 z-10 flex flex-col gap-3">
      {/* Top row: Search bar */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mc-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clusters and chunks..."
            className="w-full pl-10 pr-10 py-2 bg-mc-bg-secondary/80 backdrop-blur border border-mc-border rounded-lg text-mc-text placeholder:text-mc-text-secondary focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mc-text-secondary hover:text-mc-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
            showFilters || selectedCategories.length > 0
              ? 'bg-brand-purple border-brand-purple text-white'
              : 'bg-mc-bg-secondary/80 backdrop-blur border-mc-border text-mc-text hover:bg-mc-bg-tertiary'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {selectedCategories.length > 0 && (
            <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {selectedCategories.length}
            </span>
          )}
        </button>

        {/* Result count */}
        {searchQuery && resultCount > 0 && (
          <div className="px-4 py-2 bg-mc-bg-secondary/80 backdrop-blur border border-mc-border rounded-lg text-sm text-mc-text">
            {resultCount} results found
          </div>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-mc-bg-secondary/95 backdrop-blur border border-mc-border rounded-lg p-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category filters */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-mc-text">Categories</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-xs text-brand-cyan hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-mc-text-secondary">·</span>
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-mc-text-secondary hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {ALL_CATEGORIES.map((category) => (
                  <label
                    key={category.name}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.name)}
                      onChange={() => handleCategoryToggle(category.name)}
                      className="w-4 h-4 rounded border-mc-border bg-mc-bg-tertiary checked:bg-brand-purple checked:border-brand-purple focus:ring-brand-purple focus:ring-offset-0"
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-mc-text group-hover:text-white">
                      {category.name}
                    </span>
                    <span className="text-xs text-mc-text-secondary">
                      ({categoryCounts[category.name] || 0})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Layout selector */}
            <div>
              <h3 className="text-sm font-semibold text-mc-text mb-3">Layout</h3>
              <div className="space-y-2">
                {LAYOUTS.map((layoutOption) => (
                  <label
                    key={layoutOption.value}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="radio"
                      name="layout"
                      value={layoutOption.value}
                      checked={layout === layoutOption.value}
                      onChange={() => handleLayoutChange(layoutOption.value)}
                      className="w-4 h-4 border-mc-border bg-mc-bg-tertiary checked:bg-brand-purple checked:border-brand-purple focus:ring-brand-purple focus:ring-offset-0"
                    />
                    <span className="text-sm text-mc-text group-hover:text-white">
                      {layoutOption.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* View controls */}
            <div>
              <h3 className="text-sm font-semibold text-mc-text mb-3">Display</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={handleToggleLabels}
                    className="w-4 h-4 rounded border-mc-border bg-mc-bg-tertiary checked:bg-brand-purple checked:border-brand-purple focus:ring-brand-purple focus:ring-offset-0"
                  />
                  <span className="text-sm text-mc-text group-hover:text-white">
                    Show Labels
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showEdges}
                    onChange={handleToggleEdges}
                    className="w-4 h-4 rounded border-mc-border bg-mc-bg-tertiary checked:bg-brand-purple checked:border-brand-purple focus:ring-brand-purple focus:ring-offset-0"
                  />
                  <span className="text-sm text-mc-text group-hover:text-white">
                    Show Edges
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
