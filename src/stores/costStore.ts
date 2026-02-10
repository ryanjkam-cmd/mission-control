import { create } from 'zustand';

/**
 * Cost Store - State management for API cost tracking
 * Tracks spend across Anthropic models (Haiku, Sonnet, Opus)
 */

export interface ModelBreakdown {
  haiku: number;
  sonnet: number;
  opus: number;
}

export interface DomainBreakdown {
  health: number;
  family: number;
  career: number;
  content: number;
  business: number;
  patterns: number;
  [key: string]: number;
}

export interface CostTrend {
  date: string;
  spend: number;
}

interface CostState {
  // State
  todaySpend: number;
  weekSpend: number;
  monthSpend: number;
  breakdown: ModelBreakdown;
  domainBreakdown: DomainBreakdown;
  trends: CostTrend[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Budget tracking
  monthlyBudget: number;
  projectedSpend: number;
  daysRemaining: number;

  // Actions
  updateSpend: (data: {
    todaySpend?: number;
    weekSpend?: number;
    monthSpend?: number;
    breakdown?: ModelBreakdown;
    domainBreakdown?: DomainBreakdown;
    trends?: CostTrend[];
    projectedSpend?: number;
    daysRemaining?: number;
  }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setBudget: (budget: number) => void;
  fetchCosts: () => Promise<void>;
}

export const useCostStore = create<CostState>((set, get) => ({
  // Initial state
  todaySpend: 0,
  weekSpend: 0,
  monthSpend: 0,
  breakdown: {
    haiku: 0,
    sonnet: 0,
    opus: 0,
  },
  domainBreakdown: {
    health: 0,
    family: 0,
    career: 0,
    content: 0,
    business: 0,
    patterns: 0,
  },
  trends: [],
  loading: false,
  error: null,
  lastUpdated: null,
  monthlyBudget: 50, // Default $50/month
  projectedSpend: 0,
  daysRemaining: 0,

  // Actions
  updateSpend: (data) => set((state) => ({
    ...state,
    ...data,
    lastUpdated: new Date(),
  })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setBudget: (budget) => set({ monthlyBudget: budget }),

  fetchCosts: async () => {
    set({ loading: true, error: null });

    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8787';
      const apiKey = process.env.NEXT_PUBLIC_GATEWAY_API_KEY || '';

      // Fetch today's costs
      const todayResponse = await fetch(`${gatewayUrl}/api/costs/summary?period=today`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      if (!todayResponse.ok) {
        throw new Error(`Failed to fetch today costs: ${todayResponse.statusText}`);
      }

      const todayData = await todayResponse.json();

      // Fetch week costs
      const weekResponse = await fetch(`${gatewayUrl}/api/costs/summary?period=week`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      const weekData = weekResponse.ok ? await weekResponse.json() : null;

      // Fetch month costs
      const monthResponse = await fetch(`${gatewayUrl}/api/costs/summary?period=month`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      const monthData = monthResponse.ok ? await monthResponse.json() : null;

      // Fetch model breakdown
      const breakdownResponse = await fetch(`${gatewayUrl}/api/costs/breakdown?by=model`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      const breakdownData = breakdownResponse.ok ? await breakdownResponse.json() : null;

      // Fetch domain breakdown
      const domainResponse = await fetch(`${gatewayUrl}/api/costs/breakdown?by=domain`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      const domainData = domainResponse.ok ? await domainResponse.json() : null;

      // Fetch forecast
      const forecastResponse = await fetch(`${gatewayUrl}/api/costs/forecast`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;

      // Update store with fetched data
      set({
        todaySpend: todayData?.total || 0,
        weekSpend: weekData?.total || 0,
        monthSpend: monthData?.total || 0,
        breakdown: breakdownData?.models || {
          haiku: 0,
          sonnet: 0,
          opus: 0,
        },
        domainBreakdown: domainData?.domains || {
          health: 0,
          family: 0,
          career: 0,
          content: 0,
          business: 0,
          patterns: 0,
        },
        trends: monthData?.trends || [],
        projectedSpend: forecastData?.projected || 0,
        daysRemaining: forecastData?.daysRemaining || 0,
        loading: false,
        lastUpdated: new Date(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch costs';
      set({
        error: errorMessage,
        loading: false,
      });
      console.error('Cost fetch error:', err);
    }
  },
}));
