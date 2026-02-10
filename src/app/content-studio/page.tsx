'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Columns, List } from 'lucide-react';
import { useContentStore } from '@/stores/contentStore';
import ContentCalendar from '@/components/content/ContentCalendar';
import ContentModal from '@/components/content/ContentModal';
import ContentList from '@/components/content/ContentList';
import { ContentItem } from '@/types';

export default function ContentStudioPage() {
  const { items, view, setView, addItem, setItems } = useContentStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  // Load mock data on mount (only if no items exist)
  useEffect(() => {
    if (items.length === 0) {
      loadMockData();
    }
  }, []);

  const loadMockData = () => {
    const mockItems: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'AI sycophancy patterns in RLHF training',
        body: 'Recent research shows that RLHF creates structural sycophancy in AI models. 18-point gap between what users want vs what they say they want. Thread on findings...',
        platform: ['linkedin', 'x'],
        status: 'scheduled',
        scheduledDate: new Date('2026-02-10T09:00:00'),
      },
      {
        title: '5 findings from factorial testing',
        body: '1,110 API calls across 35 conditions, 3 models. Key insight: format compliance and reasoning quality diverge past a threshold. Full analysis...',
        platform: ['linkedin', 'substack'],
        status: 'draft',
        scheduledDate: null,
      },
      {
        title: 'The 18-point gap nobody talks about',
        body: 'Anthropic\'s own research reveals the alignment problem hiding in plain sight. Users want accuracy. They say they want agreement. Models optimize for what we say, not what we want.',
        platform: ['x', 'linkedin'],
        status: 'published',
        scheduledDate: new Date('2026-02-05T14:00:00'),
        metrics: { views: 12500, likes: 340, shares: 89, comments: 52 },
      },
      {
        title: 'Why AI agents fail 97.5% of the time',
        body: 'Scale AI\'s SWE-Bench: 2,294 GitHub issues, 97.5% failure rate. It\'s not the models. It\'s the architecture. Here\'s what works...',
        platform: ['linkedin'],
        status: 'scheduled',
        scheduledDate: new Date('2026-02-11T10:30:00'),
      },
      {
        title: 'Brain MCP architecture deep dive',
        body: 'How we built a self-learning cognitive OS: 6 domains, multi-model council, evaluation layer with cross-model verification. Technical walkthrough...',
        platform: ['substack'],
        status: 'draft',
        scheduledDate: null,
      },
      {
        title: 'Content creation workflow with refraction lens',
        body: 'What Ryan deletes from AI output is the strongest signal of his voice. Track deletions, additions, rewrites, rejections. Here\'s the system...',
        platform: ['linkedin', 'x'],
        status: 'scheduled',
        scheduledDate: new Date('2026-02-12T15:00:00'),
      },
      {
        title: 'Factorial test results visualization',
        body: 'Beautiful charts from 1,110 API calls. Persona anchor is S-tier across all models. Format vs reasoning divergence is real. Interactive dashboard...',
        platform: ['x'],
        status: 'draft',
        scheduledDate: null,
      },
      {
        title: 'OpenClaw security review',
        body: 'CVE-2026-25253: 1-click RCE via gateway token theft. Mitigated by loopback bind. ClawHub supply chain attack (11.9% malicious rate). What we learned...',
        platform: ['linkedin'],
        status: 'published',
        scheduledDate: new Date('2026-02-04T11:00:00'),
        metrics: { views: 8200, likes: 210, shares: 45, comments: 31 },
      },
      {
        title: 'Symbolic anchors performance analysis',
        body: 'Delta34 and quantum_mirror are S-tier. But original Claude-only rankings don\'t generalize. Model-specific tuning is essential.',
        platform: ['x', 'linkedin'],
        status: 'scheduled',
        scheduledDate: new Date('2026-02-13T09:30:00'),
      },
      {
        title: 'Building a marketing agency with cognitive OS',
        body: 'Mission Control dashboard: content calendar, social monitoring, cost tracking. All powered by Brain MCP. Live demo + architecture walkthrough.',
        platform: ['substack', 'linkedin'],
        status: 'draft',
        scheduledDate: null,
      },
      {
        title: 'Gateway rebuild: monolith to microservices',
        body: '5,260 lines → modular architecture. 4x throughput, 30% latency reduction. Docker containerization. Production-ready in 1.1 hours.',
        platform: ['linkedin'],
        status: 'scheduled',
        scheduledDate: new Date('2026-02-14T10:00:00'),
      },
      {
        title: 'ICL v2: semantic similarity search',
        body: 'Past decisions injected at inference time via embeddings. Sentence-transformers, 80MB model, runs locally. 0.90 similarity threshold.',
        platform: ['x'],
        status: 'published',
        scheduledDate: new Date('2026-01-31T16:00:00'),
        metrics: { views: 5400, likes: 145, shares: 28, comments: 19 },
      },
      {
        title: 'Cross-domain reasoning in Brain MCP',
        body: 'Stress impacts health. Work affects family. Life domains are connected. How we detect cascade effects and temporal trends.',
        platform: ['linkedin', 'x'],
        status: 'draft',
        scheduledDate: null,
      },
      {
        title: 'Daily rhythm system design',
        body: 'Morning, afternoon, evening briefs. All data sources merged. Family schedule iMessage. Contact reconnection. 1,300 tokens/day total.',
        platform: ['substack'],
        status: 'scheduled',
        scheduledDate: new Date('2026-02-15T14:30:00'),
      },
      {
        title: 'Neo4j knowledge graph: 26K nodes',
        body: '323 clusters, 933 relationships. Progressive loading strategy. Cytoscape.js for visualization. Query interface deep dive.',
        platform: ['linkedin'],
        status: 'published',
        scheduledDate: new Date('2026-02-02T13:00:00'),
        metrics: { views: 9800, likes: 270, shares: 61, comments: 44 },
      },
    ];

    mockItems.forEach((item) => {
      addItem(item);
    });
  };

  const handleNewPost = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditItem = (item: ContentItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    // Already handled in store
  };

  const handleDuplicateItem = (item: ContentItem) => {
    const { id, createdAt, updatedAt, ...rest } = item;
    addItem({
      ...rest,
      title: `${rest.title} (Copy)`,
      status: 'draft',
      scheduledDate: null,
    });
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-mc-text">Content Studio</h1>
            <p className="text-mc-text-secondary mt-1">
              Home &gt; Content Studio
            </p>
          </div>
          <button
            onClick={handleNewPost}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-brand rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            New Post
          </button>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setView('week')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            view === 'week'
              ? 'bg-brand-purple/20 text-brand-purple border-2 border-brand-purple'
              : 'bg-mc-bg-secondary text-mc-text-secondary border border-mc-border hover:bg-mc-bg-tertiary'
          }`}
        >
          <Calendar size={18} />
          Week
        </button>
        <button
          onClick={() => setView('month')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            view === 'month'
              ? 'bg-brand-purple/20 text-brand-purple border-2 border-brand-purple'
              : 'bg-mc-bg-secondary text-mc-text-secondary border border-mc-border hover:bg-mc-bg-tertiary'
          }`}
        >
          <Calendar size={18} />
          Month
        </button>
        <button
          onClick={() => setView('kanban')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            view === 'kanban'
              ? 'bg-brand-purple/20 text-brand-purple border-2 border-brand-purple'
              : 'bg-mc-bg-secondary text-mc-text-secondary border border-mc-border hover:bg-mc-bg-tertiary'
          }`}
        >
          <Columns size={18} />
          Kanban
        </button>
        <button
          onClick={() => setView('list' as any)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            view === ('list' as any)
              ? 'bg-brand-purple/20 text-brand-purple border-2 border-brand-purple'
              : 'bg-mc-bg-secondary text-mc-text-secondary border border-mc-border hover:bg-mc-bg-tertiary'
          }`}
        >
          <List size={18} />
          List
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {view === 'list' ? (
          <ContentList
            items={items}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onDuplicate={handleDuplicateItem}
          />
        ) : (
          <ContentCalendar
            view={view as 'week' | 'month' | 'kanban'}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
            onDuplicateItem={handleDuplicateItem}
          />
        )}
      </div>

      {/* Modal */}
      <ContentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        editItem={editingItem}
      />
    </div>
  );
}
