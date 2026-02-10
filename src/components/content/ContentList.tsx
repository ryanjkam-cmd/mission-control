/**
 * ContentList Component
 * Table view for content with sorting and filtering
 */

import { useState, useMemo } from 'react';
import { ArrowUpDown, Edit2, Trash2, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentItem, ContentPlatform, ContentStatus } from '@/types';
import { PlatformBadges } from './PlatformBadge';
import { format } from 'date-fns';

interface ContentListProps {
  items: ContentItem[];
  onEdit?: (item: ContentItem) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (item: ContentItem) => void;
}

type SortField = 'title' | 'platform' | 'status' | 'scheduledDate';
type SortDirection = 'asc' | 'desc';

const STATUS_LABELS: Record<ContentStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  published: 'Published',
  failed: 'Failed',
};

const STATUS_COLORS: Record<ContentStatus, string> = {
  draft: 'bg-mc-text-secondary/20 text-mc-text-secondary',
  scheduled: 'bg-mc-accent-yellow/20 text-mc-accent-yellow',
  published: 'bg-mc-accent-green/20 text-mc-accent-green',
  failed: 'bg-mc-accent-red/20 text-mc-accent-red',
};

export default function ContentList({
  items,
  onEdit,
  onDelete,
  onDuplicate,
}: ContentListProps) {
  const [sortField, setSortField] = useState<SortField>('scheduledDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterPlatform, setFilterPlatform] = useState<ContentPlatform | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Sort and filter items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...items];

    // Filter by platform
    if (filterPlatform !== 'all') {
      filtered = filtered.filter((item) => item.platform.includes(filterPlatform));
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle platform array
      if (sortField === 'platform') {
        aVal = a.platform[0] || '';
        bVal = b.platform[0] || '';
      }

      // Handle dates
      if (sortField === 'scheduledDate') {
        aVal = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
        bVal = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, sortField, sortDirection, filterPlatform, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this content item?')) {
      onDelete?.(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-mc-bg-secondary border border-mc-border rounded-lg">
        <div className="flex items-center gap-2">
          <label className="text-sm text-mc-text-secondary">Platform:</label>
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value as ContentPlatform | 'all')}
            className="px-3 py-1.5 bg-mc-bg-tertiary border border-mc-border rounded-lg text-mc-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
          >
            <option value="all">All Platforms</option>
            <option value="linkedin">LinkedIn</option>
            <option value="x">X</option>
            <option value="substack">Substack</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-mc-text-secondary">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ContentStatus | 'all')}
            className="px-3 py-1.5 bg-mc-bg-tertiary border border-mc-border rounded-lg text-mc-text text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-mc-text-secondary">
          {filteredAndSortedItems.length} items
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-mc-border rounded-lg">
        <table className="w-full">
          <thead className="bg-mc-bg-secondary border-b border-mc-border">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center gap-2 text-sm font-medium text-mc-text hover:text-brand-purple transition-colors"
                >
                  Title
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('platform')}
                  className="flex items-center gap-2 text-sm font-medium text-mc-text hover:text-brand-purple transition-colors"
                >
                  Platform
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center gap-2 text-sm font-medium text-mc-text hover:text-brand-purple transition-colors"
                >
                  Status
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('scheduledDate')}
                  className="flex items-center gap-2 text-sm font-medium text-mc-text hover:text-brand-purple transition-colors"
                >
                  Scheduled
                  <ArrowUpDown size={14} />
                </button>
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-mc-text">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mc-border">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-mc-text-secondary">
                  No content items found
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-mc-bg-secondary transition-colors cursor-pointer"
                  onClick={() => onEdit?.(item)}
                >
                  <td className="px-4 py-3">
                    <div className="text-sm text-mc-text font-medium line-clamp-1">
                      {item.title}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PlatformBadges platforms={item.platform} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_COLORS[item.status]
                      }`}
                    >
                      {STATUS_LABELS[item.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-mc-text-secondary">
                      {item.scheduledDate
                        ? format(new Date(item.scheduledDate), 'MMM d, yyyy h:mm a')
                        : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit?.(item);
                        }}
                        className="p-1.5 rounded hover:bg-mc-bg-tertiary transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={14} className="text-mc-text-secondary hover:text-mc-accent" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate?.(item);
                        }}
                        className="p-1.5 rounded hover:bg-mc-bg-tertiary transition-colors"
                        title="Duplicate"
                      >
                        <Copy size={14} className="text-mc-text-secondary hover:text-mc-accent" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-1.5 rounded hover:bg-mc-bg-tertiary transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-mc-text-secondary hover:text-mc-accent-red" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-mc-bg-secondary border border-mc-border rounded-lg">
          <div className="text-sm text-mc-text-secondary">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-mc-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} className="text-mc-text-secondary" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-mc-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} className="text-mc-text-secondary" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
