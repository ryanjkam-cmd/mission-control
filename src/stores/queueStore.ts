import { create } from 'zustand';
import type { BrainAction, ActionFilters, ActionStatus, ActionType, RiskLevel } from '@/lib/types';

interface QueueState {
  actions: BrainAction[];
  filters: ActionFilters;
  selectedAction: BrainAction | null;
  isReviewModalOpen: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  setActions: (actions: BrainAction[]) => void;
  setFilters: (filters: Partial<ActionFilters>) => void;
  setSelectedAction: (action: BrainAction | null) => void;
  setReviewModalOpen: (open: boolean) => void;
  fetchActions: () => Promise<void>;
  approveAction: (id: string, autoRule?: boolean) => Promise<void>;
  denyAction: (id: string, feedback: string) => Promise<void>;
  editAction: (id: string, editedData: any) => Promise<void>;
  openReviewModal: (action: BrainAction) => void;
  closeReviewModal: () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  // Initial state
  actions: [],
  filters: {
    status: 'pending',
    type: 'all',
    riskLevel: 'all',
  },
  selectedAction: null,
  isReviewModalOpen: false,
  loading: false,
  error: null,
  lastUpdated: null,

  // Actions
  setActions: (actions) => set({ actions }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setSelectedAction: (action) => set({ selectedAction: action }),

  setReviewModalOpen: (open) => set({ isReviewModalOpen: open }),

  fetchActions: async () => {
    set({ loading: true, error: null });

    try {
      const response = await fetch('/api/queue');

      if (!response.ok) {
        throw new Error('Failed to fetch actions');
      }

      const data = await response.json();

      // Map database fields to UI fields
      const mappedActions: BrainAction[] = (data.actions || []).map((action: any) => ({
        id: action.id.toString(),
        timestamp: action.generated_at,
        action: action.action_data?.action || action.action_type,
        tool: action.action_data?.tool || 'unknown',
        result: action.action_data?.result || '',
        details: action.action_data?.details || '',
        status: action.status,
        type: action.action_type,
        riskLevel: action.risk_level,
        confidence: action.confidence,
        context: action.context_data?.context || '',
        parameters: action.action_data?.parameters || {},
        feedback: action.user_feedback || '',
      }));

      set({
        actions: mappedActions,
        loading: false,
        lastUpdated: new Date(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch actions';
      set({
        error: errorMessage,
        loading: false,
      });
      console.error('Actions fetch error:', err);
    }
  },

  approveAction: async (id: string, autoRule?: boolean) => {
    try {
      const response = await fetch(`/api/queue/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ createRule: autoRule }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve action');
      }

      // Update local state
      set((state) => ({
        actions: state.actions.map((action) =>
          action.id === id ? { ...action, status: 'approved' as ActionStatus } : action
        ),
      }));

      // Refresh actions
      await get().fetchActions();
    } catch (err) {
      console.error('Approve action error:', err);
      throw err;
    }
  },

  denyAction: async (id: string, feedback: string) => {
    try {
      const response = await fetch(`/api/queue/${id}/deny`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback }),
      });

      if (!response.ok) {
        throw new Error('Failed to deny action');
      }

      // Update local state
      set((state) => ({
        actions: state.actions.map((action) =>
          action.id === id ? { ...action, status: 'denied' as ActionStatus, feedback } : action
        ),
      }));

      // Refresh actions
      await get().fetchActions();
    } catch (err) {
      console.error('Deny action error:', err);
      throw err;
    }
  },

  editAction: async (id: string, editedData: any) => {
    try {
      const response = await fetch(`/api/queue/${id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedData),
      });

      if (!response.ok) {
        throw new Error('Failed to edit action');
      }

      // Update local state
      set((state) => ({
        actions: state.actions.map((action) =>
          action.id === id ? { ...action, ...editedData, status: 'pending' as ActionStatus } : action
        ),
      }));

      // Refresh actions
      await get().fetchActions();
    } catch (err) {
      console.error('Edit action error:', err);
      throw err;
    }
  },

  openReviewModal: (action) => {
    set({
      selectedAction: action,
      isReviewModalOpen: true,
    });
  },

  closeReviewModal: () => {
    set({
      selectedAction: null,
      isReviewModalOpen: false,
    });
  },
}));
