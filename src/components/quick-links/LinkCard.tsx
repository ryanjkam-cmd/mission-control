'use client';

import { ExternalLink, Edit2, Trash2, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface LinkCardProps {
  link: {
    id: number;
    title: string;
    url: string;
    category: string;
    tags: string[];
    clicks: number;
    last_accessed: string | null;
    created_at: string;
  };
  onEdit: (link: any) => void;
  onDelete: (id: number) => void;
  onTrackClick: (id: number) => Promise<void>;
}

const getCategoryColor = (category: string) => {
  const colors = {
    Notion: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    Google: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    External: 'bg-green-500/20 text-green-400 border-green-500/30',
    Tool: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  };
  return colors[category as keyof typeof colors] || colors.External;
};

export function LinkCard({ link, onEdit, onDelete, onTrackClick }: LinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    await onTrackClick(link.id);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(link);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${link.title}"?`)) {
      onDelete(link.id);
    }
  };

  const truncateUrl = (url: string, maxLength = 50) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };

  return (
    <div
      className="group relative rounded-lg border border-mc-border bg-mc-bg-secondary hover:bg-mc-bg-tertiary transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
      onClick={handleClick}
    >
      <div className="p-4">
        {/* Category Badge */}
        <div className="mb-3">
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(link.category)}`}>
            {link.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-mc-text mb-2 group-hover:text-mc-accent-purple transition-colors">
          {link.title}
        </h3>

        {/* URL */}
        <p className="text-sm text-mc-text-secondary mb-3 font-mono break-all">
          {truncateUrl(link.url)}
        </p>

        {/* Tags */}
        {link.tags && link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {link.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs bg-mc-bg-tertiary text-mc-text-secondary border border-mc-border"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-mc-text-secondary mb-3">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-mc-text">{link.clicks}</span>
            <span>clicks</span>
          </div>
          {link.last_accessed && (
            <div>
              Last: {formatDistanceToNow(new Date(link.last_accessed), { addSuffix: true })}
            </div>
          )}
        </div>

        {/* Actions (shown on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="p-2 rounded hover:bg-mc-bg text-mc-text-secondary hover:text-mc-accent-purple transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded hover:bg-mc-bg text-mc-text-secondary hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopyUrl}
            className="p-2 rounded hover:bg-mc-bg text-mc-text-secondary hover:text-mc-accent-cyan transition-colors"
            title={copied ? 'Copied!' : 'Copy URL'}
          >
            <Copy className="w-4 h-4" />
          </button>
          <div className="ml-auto">
            <ExternalLink className="w-4 h-4 text-mc-text-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
}
