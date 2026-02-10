'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface MetadataPanelProps {
  node: any | null;
  onClose: () => void;
}

export default function MetadataPanel({ node, onClose }: MetadataPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [relatedClusters, setRelatedClusters] = useState<any[]>([]);
  const [relatedChunks, setRelatedChunks] = useState<any[]>([]);

  // Fetch related data when node changes
  useEffect(() => {
    if (!node) return;

    if (node.type === 'cluster') {
      // Could fetch related clusters here
      setRelatedClusters([]);
    }

    if (node.type === 'chunk') {
      // Could fetch related chunks here
      setRelatedChunks([]);
    }
  }, [node]);

  if (!node) return null;

  const isCluster = node.type === 'cluster';
  const isChunk = node.type === 'chunk';

  // Category color
  const categoryColors: Record<string, string> = {
    Identity: '#a855f7',
    Infrastructure: '#3b82f6',
    Strategy: '#06b6d4',
    Research: '#f97316',
    Meta: '#ec4899',
    Protocol: '#10b981',
  };

  const categoryColor = isCluster ? categoryColors[node.category] || '#8b949e' : '#8b949e';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-[400px] bg-mc-bg-secondary border-l border-mc-border z-50 overflow-y-auto animate-slide-in-from-right">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-mc-text mb-2">
                {node.label}
              </h2>
              {isCluster && (
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${categoryColor}20`,
                    color: categoryColor,
                    border: `1px solid ${categoryColor}`,
                  }}
                >
                  {node.category}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-mc-text-secondary hover:text-mc-text transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cluster details */}
          {isCluster && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-mc-bg-tertiary rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-mc-text-secondary">Member Count</span>
                  <span className="text-lg font-semibold text-mc-text">
                    {node.memberCount || 0} chunks
                  </span>
                </div>
              </div>

              {/* Top keywords (placeholder) */}
              <div>
                <h3 className="text-sm font-semibold text-mc-text mb-3">Top Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {['architecture', 'decision', 'pattern', 'system', 'governance'].map(
                    (keyword) => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-mc-bg-tertiary rounded-full text-xs text-mc-text-secondary"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Related clusters */}
              {relatedClusters.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-mc-text mb-3">
                    Related Clusters
                  </h3>
                  <div className="space-y-2">
                    {relatedClusters.map((cluster) => (
                      <div
                        key={cluster.id}
                        className="p-3 bg-mc-bg-tertiary rounded-lg hover:bg-mc-bg cursor-pointer"
                      >
                        <div className="text-sm text-mc-text">{cluster.label}</div>
                        <div className="text-xs text-mc-text-secondary mt-1">
                          {cluster.category}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expand button */}
              <button className="w-full py-2 bg-brand-purple hover:bg-brand-purple/90 text-white rounded-lg font-medium transition-colors">
                Expand to View Chunks
              </button>
            </div>
          )}

          {/* Chunk details */}
          {isChunk && (
            <div className="space-y-6">
              {/* Content preview */}
              <div>
                <h3 className="text-sm font-semibold text-mc-text mb-3">Content</h3>
                <div className="bg-mc-bg-tertiary rounded-lg p-4">
                  <p
                    className={`text-sm text-mc-text-secondary leading-relaxed ${
                      !isExpanded ? 'line-clamp-6' : ''
                    }`}
                  >
                    {node.content || 'No content available'}
                  </p>
                  {node.content && node.content.length > 300 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="mt-2 text-sm text-brand-cyan hover:underline flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          Show less <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Read more <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-3">
                {node.domain && (
                  <div>
                    <span className="text-xs text-mc-text-secondary">Domain</span>
                    <div className="mt-1 text-sm text-mc-text">{node.domain}</div>
                  </div>
                )}

                {node.source && (
                  <div>
                    <span className="text-xs text-mc-text-secondary">Source</span>
                    <div className="mt-1 text-sm text-mc-text font-mono text-xs">
                      {node.source}
                    </div>
                  </div>
                )}

                {node.clusterId && (
                  <div>
                    <span className="text-xs text-mc-text-secondary">Parent Cluster</span>
                    <div className="mt-1 text-sm text-brand-cyan">Cluster {node.clusterId}</div>
                  </div>
                )}
              </div>

              {/* Links section */}
              <div>
                <h3 className="text-sm font-semibold text-mc-text mb-3">Links</h3>
                <div className="space-y-2">
                  {/* Notion link (if available) */}
                  <a
                    href="#"
                    className="flex items-center gap-2 p-3 bg-mc-bg-tertiary rounded-lg hover:bg-mc-bg transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-mc-text-secondary group-hover:text-brand-cyan" />
                    <span className="text-sm text-mc-text group-hover:text-brand-cyan">
                      View in Notion
                    </span>
                  </a>

                  {/* Transcript link */}
                  <a
                    href="#"
                    className="flex items-center gap-2 p-3 bg-mc-bg-tertiary rounded-lg hover:bg-mc-bg transition-colors group"
                  >
                    <ExternalLink className="w-4 h-4 text-mc-text-secondary group-hover:text-brand-cyan" />
                    <span className="text-sm text-mc-text group-hover:text-brand-cyan">
                      View Transcript
                    </span>
                  </a>
                </div>
              </div>

              {/* Related chunks */}
              {relatedChunks.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-mc-text mb-3">
                    Related Content
                  </h3>
                  <div className="space-y-2">
                    {relatedChunks.map((chunk, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-mc-bg-tertiary rounded-lg hover:bg-mc-bg cursor-pointer"
                      >
                        <div className="text-sm text-mc-text line-clamp-2">
                          {chunk.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
