'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { LinkCard } from './LinkCard';
import { LinkModal, LinkFormData } from './LinkModal';

interface QuickLink {
  id: number;
  title: string;
  url: string;
  category: string;
  tags: string[];
  clicks: number;
  last_accessed: string | null;
  created_at: string;
}

type SortOption = 'clicks' | 'recent' | 'alphabetical';

export function QuickLinksGrid() {
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('clicks');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    filterAndSortLinks();
  }, [links, searchQuery, sortBy]);

  const fetchLinks = async () => {
    try {
      const response = await fetch('/api/links');
      const data = await response.json();
      if (data.success) {
        setLinks(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortLinks = () => {
    let filtered = [...links];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (link) =>
          link.title.toLowerCase().includes(query) ||
          link.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'clicks':
          return b.clicks - a.clicks;
        case 'recent':
          if (!a.last_accessed) return 1;
          if (!b.last_accessed) return -1;
          return new Date(b.last_accessed).getTime() - new Date(a.last_accessed).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredLinks(filtered);
  };

  const handleCreateLink = async (data: LinkFormData) => {
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        await fetchLinks();
      }
    } catch (error) {
      console.error('Failed to create link:', error);
      throw error;
    }
  };

  const handleUpdateLink = async (data: LinkFormData) => {
    if (!editingLink) return;

    try {
      const response = await fetch(`/api/links/${editingLink.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        await fetchLinks();
        setEditingLink(null);
      }
    } catch (error) {
      console.error('Failed to update link:', error);
      throw error;
    }
  };

  const handleDeleteLink = async (id: number) => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchLinks();
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
    }
  };

  const handleTrackClick = async (id: number) => {
    try {
      await fetch(`/api/links/${id}/click`, {
        method: 'POST',
      });
      // Optimistically update local state
      setLinks((prev) =>
        prev.map((link) =>
          link.id === id
            ? { ...link, clicks: link.clicks + 1, last_accessed: new Date().toISOString() }
            : link
        )
      );
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  const groupedLinks = filteredLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, QuickLink[]>);

  const categories = ['Notion', 'Google', 'External', 'Tool'];
  const categoryIcons: Record<string, string> = {
    Notion: '📝',
    Google: '🔍',
    External: '🌐',
    Tool: '🛠️',
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mc-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or tag..."
            className="w-full pl-10 pr-4 py-2 bg-mc-bg border border-mc-border rounded text-mc-text placeholder-mc-text-secondary focus:outline-none focus:ring-2 focus:ring-mc-accent-purple"
          />
        </div>

        {/* Sort & Add */}
        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:outline-none focus:ring-2 focus:ring-mc-accent-purple"
          >
            <option value="clicks">Most Clicked</option>
            <option value="recent">Recently Accessed</option>
            <option value="alphabetical">Alphabetical</option>
          </select>

          <button
            onClick={() => {
              setEditingLink(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mc-accent-purple to-mc-accent-cyan text-white rounded hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Link
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-mc-border border-t-mc-accent-purple"></div>
          <p className="mt-4 text-mc-text-secondary">Loading links...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredLinks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-mc-text-secondary mb-4">
            {searchQuery ? 'No links found matching your search' : 'No links yet'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                setEditingLink(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-mc-accent-purple/20 text-mc-accent-purple border border-mc-accent-purple/30 rounded hover:bg-mc-accent-purple/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Link
            </button>
          )}
        </div>
      )}

      {/* Categories */}
      {!loading && filteredLinks.length > 0 && (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryLinks = groupedLinks[category] || [];
            if (categoryLinks.length === 0) return null;

            const isCollapsed = collapsedCategories.has(category);

            return (
              <div key={category} className="space-y-3">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 w-full text-left group"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5 text-mc-text-secondary group-hover:text-mc-text transition-colors" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-mc-text-secondary group-hover:text-mc-text transition-colors" />
                  )}
                  <span className="text-2xl">{categoryIcons[category]}</span>
                  <h2 className="text-xl font-bold text-mc-text group-hover:text-mc-accent-purple transition-colors">
                    {category}
                  </h2>
                  <span className="text-sm text-mc-text-secondary">
                    ({categoryLinks.length})
                  </span>
                </button>

                {/* Category Links */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-7">
                    {categoryLinks.map((link) => (
                      <LinkCard
                        key={link.id}
                        link={link}
                        onEdit={(link) => {
                          setEditingLink(link);
                          setIsModalOpen(true);
                        }}
                        onDelete={handleDeleteLink}
                        onTrackClick={handleTrackClick}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <LinkModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLink(null);
        }}
        onSave={editingLink ? handleUpdateLink : handleCreateLink}
        link={editingLink}
      />
    </div>
  );
}
