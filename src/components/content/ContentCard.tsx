/**
 * ContentCard Component
 * Draggable content card for calendar and kanban views
 */

import { useState } from 'react';
import { Clock, Edit2, Trash2, Copy, MoreVertical } from 'lucide-react';
import { ContentItem } from '@/types';
import { PlatformBadges } from './PlatformBadge';
import { format } from 'date-fns';

interface ContentCardProps {
  item: ContentItem;
  onEdit?: (item: ContentItem) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (item: ContentItem) => void;
  variant?: 'calendar' | 'kanban' | 'list';
}

export default function ContentCard({
  item,
  onEdit,
  onDelete,
  onDuplicate,
  variant = 'calendar',
}: ContentCardProps) {
  const [showActions, setShowActions] = useState(false);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this content item?')) {
      onDelete?.(item.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDuplicate?.(item);
  };

  const isKanban = variant === 'kanban';
  const isCalendar = variant === 'calendar';

  return (
    <div
      className="group relative bg-mc-bg-secondary border border-mc-border rounded-lg p-3 transition-all duration-200 hover:bg-mc-bg-tertiary hover:border-mc-accent/50 cursor-pointer"
      onClick={() => onEdit?.(item)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header: Platforms + Actions */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <PlatformBadges
          platforms={item.platform}
          status={item.status}
          size={isKanban ? 'sm' : 'md'}
        />

        {/* Actions menu */}
        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleEdit}
              className="p-1 rounded hover:bg-mc-bg-tertiary transition-colors"
              title="Edit"
            >
              <Edit2 size={14} className="text-mc-text-secondary hover:text-mc-accent" />
            </button>
            <button
              onClick={handleDuplicate}
              className="p-1 rounded hover:bg-mc-bg-tertiary transition-colors"
              title="Duplicate"
            >
              <Copy size={14} className="text-mc-text-secondary hover:text-mc-accent" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 rounded hover:bg-mc-bg-tertiary transition-colors"
              title="Delete"
            >
              <Trash2 size={14} className="text-mc-text-secondary hover:text-mc-accent-red" />
            </button>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-mc-text mb-1 line-clamp-2">
        {item.title}
      </h3>

      {/* Body preview (only in kanban) */}
      {isKanban && item.body && (
        <p className="text-xs text-mc-text-secondary line-clamp-2 mb-2">
          {item.body}
        </p>
      )}

      {/* Footer: Schedule time */}
      {item.scheduledDate && (
        <div className="flex items-center gap-1.5 text-xs text-mc-text-secondary mt-2 pt-2 border-t border-mc-border">
          <Clock size={12} />
          <span>
            {format(new Date(item.scheduledDate), 'MMM d, h:mm a')}
          </span>
        </div>
      )}

      {/* Metrics (if published) */}
      {item.status === 'published' && item.metrics && (
        <div className="flex items-center gap-3 text-xs text-mc-text-secondary mt-2 pt-2 border-t border-mc-border">
          {item.metrics.views && (
            <span>{item.metrics.views} views</span>
          )}
          {item.metrics.likes && (
            <span>{item.metrics.likes} likes</span>
          )}
        </div>
      )}
    </div>
  );
}
