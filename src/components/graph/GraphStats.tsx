'use client';

interface GraphStatsProps {
  totalClusters: number;
  totalChunks: number;
  visibleClusters: number;
  visibleChunks: number;
  selectedCategory: string;
  searchResults: number;
}

export default function GraphStats({
  totalClusters,
  totalChunks,
  visibleClusters,
  visibleChunks,
  selectedCategory,
  searchResults,
}: GraphStatsProps) {
  return (
    <div className="bg-mc-bg-secondary/95 backdrop-blur border-b border-mc-border px-6 py-3">
      <div className="flex items-center gap-6 text-sm">
        {/* Visible nodes */}
        <div className="flex items-center gap-2">
          <span className="text-mc-text-secondary">Visible:</span>
          <span className="text-mc-text font-medium">
            {visibleClusters} clusters
            {visibleChunks > 0 && <>, {visibleChunks} chunks</>}
          </span>
        </div>

        {/* Total nodes */}
        <div className="flex items-center gap-2">
          <span className="text-mc-text-secondary">Total:</span>
          <span className="text-mc-text font-medium">
            {totalClusters} clusters, {totalChunks} chunks
          </span>
        </div>

        {/* Selected category */}
        {selectedCategory && (
          <div className="flex items-center gap-2">
            <span className="text-mc-text-secondary">Category:</span>
            <span className="text-brand-cyan font-medium">{selectedCategory}</span>
          </div>
        )}

        {/* Search results */}
        {searchResults > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-mc-text-secondary">Search results:</span>
            <span className="text-brand-purple font-medium">{searchResults} matches</span>
          </div>
        )}
      </div>
    </div>
  );
}
