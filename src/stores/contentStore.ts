import { create } from 'zustand';

/**
 * Content Store - State management for content production
 * Manages content items across platforms (LinkedIn, X, Substack, Instagram)
 */

export type ContentPlatform = 'linkedin' | 'x' | 'substack' | 'instagram';
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed';
export type ContentView = 'week' | 'month' | 'kanban' | 'list';

export interface ContentItem {
  id: string;
  title: string;
  body: string;
  platform: ContentPlatform[];
  status: ContentStatus;
  scheduledDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author?: string;
  tags?: string[];
  metrics?: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
  };
}

interface ContentState {
  // State
  items: ContentItem[];
  view: ContentView;
  loading: boolean;
  error: string | null;

  // Actions
  addItem: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<ContentItem>) => void;
  deleteItem: (id: string) => void;
  setView: (view: ContentView) => void;
  setItems: (items: ContentItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useContentStore = create<ContentState>((set) => ({
  // Initial state
  items: [],
  view: 'week',
  loading: false,
  error: null,

  // Actions
  addItem: (item) => set((state) => ({
    items: [
      ...state.items,
      {
        ...item,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  })),

  updateItem: (id, updates) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id
        ? { ...item, ...updates, updatedAt: new Date() }
        : item
    ),
  })),

  deleteItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),

  setView: (view) => set({ view }),

  setItems: (items) => set({ items }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),
}));
