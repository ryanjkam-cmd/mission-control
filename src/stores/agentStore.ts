import { create } from 'zustand';

/**
 * Agent Store - State management for daemon and service status
 * Tracks Brain Body, Gateway, Neo4j, watchers, and other system services
 */

export type DaemonStatus = 'running' | 'stopped' | 'degraded' | 'unknown';
export type ServiceStatus = 'healthy' | 'unhealthy' | 'unknown';

export interface DaemonInfo {
  name: string;
  displayName: string;
  pid: number | null;
  status: DaemonStatus;
  uptime: number; // seconds
  lastRun?: Date;
  schedule?: string; // e.g., "7x/day at X:30"
  description?: string;
  cost?: string; // e.g., "$0/mo (Max subscription)"
}

export interface ServiceInfo {
  name: string;
  displayName: string;
  status: ServiceStatus;
  url?: string;
  port?: number;
  lastCheck?: Date;
  responseTime?: number; // ms
  error?: string;
}

interface AgentState {
  // State
  daemons: DaemonInfo[];
  gateway: ServiceInfo;
  neo4j: ServiceInfo;
  services: ServiceInfo[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  updateDaemon: (name: string, updates: Partial<DaemonInfo>) => void;
  updateService: (name: string, updates: Partial<ServiceInfo>) => void;
  setDaemons: (daemons: DaemonInfo[]) => void;
  setServices: (services: ServiceInfo[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchStatus: () => Promise<void>;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  // Initial state
  daemons: [],
  gateway: {
    name: 'gateway',
    displayName: 'Arkeus Gateway',
    status: 'unknown',
    url: 'http://localhost:8787',
    port: 8787,
  },
  neo4j: {
    name: 'neo4j',
    displayName: 'Neo4j Knowledge Graph',
    status: 'unknown',
    url: 'bolt://localhost:7687',
    port: 7687,
  },
  services: [],
  loading: false,
  error: null,
  lastUpdated: null,

  // Actions
  updateDaemon: (name, updates) => set((state) => ({
    daemons: state.daemons.map((daemon) =>
      daemon.name === name ? { ...daemon, ...updates } : daemon
    ),
  })),

  updateService: (name, updates) => set((state) => {
    if (name === 'gateway') {
      return {
        gateway: { ...state.gateway, ...updates },
      };
    }
    if (name === 'neo4j') {
      return {
        neo4j: { ...state.neo4j, ...updates },
      };
    }
    return {
      services: state.services.map((service) =>
        service.name === name ? { ...service, ...updates } : service
      ),
    };
  }),

  setDaemons: (daemons) => set({ daemons }),

  setServices: (services) => set({ services }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  fetchStatus: async () => {
    set({ loading: true, error: null });

    try {
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8787';
      const apiKey = process.env.NEXT_PUBLIC_GATEWAY_API_KEY || '';

      // Fetch gateway health
      const healthResponse = await fetch(`${gatewayUrl}/health/ready`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      const healthData = healthResponse.ok ? await healthResponse.json() : null;

      // Fetch daemon status
      const agentsResponse = await fetch(`${gatewayUrl}/api/agents`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      const agentsData = agentsResponse.ok ? await agentsResponse.json() : null;

      // Fetch system status
      const statusResponse = await fetch(`${gatewayUrl}/api/status`, {
        headers: {
          'X-API-Key': apiKey,
        },
      });

      const statusData = statusResponse.ok ? await statusResponse.json() : null;

      // Update gateway status
      set({
        gateway: {
          name: 'gateway',
          displayName: 'Arkeus Gateway',
          status: healthData?.status === 'ready' ? 'healthy' : 'unhealthy',
          url: gatewayUrl,
          port: 8787,
          lastCheck: new Date(),
          responseTime: healthData?.responseTime,
        },
      });

      // Update Neo4j status
      if (healthData?.checks?.neo4j) {
        set({
          neo4j: {
            name: 'neo4j',
            displayName: 'Neo4j Knowledge Graph',
            status: healthData.checks.neo4j.status === 'healthy' ? 'healthy' : 'unhealthy',
            url: 'bolt://localhost:7687',
            port: 7687,
            lastCheck: new Date(),
            error: healthData.checks.neo4j.error,
          },
        });
      }

      // Update daemons
      if (agentsData?.agents) {
        const daemons: DaemonInfo[] = agentsData.agents.map((agent: any) => ({
          name: agent.name,
          displayName: agent.displayName || agent.name,
          pid: agent.pid,
          status: agent.status,
          uptime: agent.uptime || 0,
          lastRun: agent.lastRun ? new Date(agent.lastRun) : undefined,
          schedule: agent.schedule,
          description: agent.description,
          cost: agent.cost,
        }));

        set({ daemons });
      }

      // Update other services
      if (statusData?.services) {
        const services: ServiceInfo[] = statusData.services
          .filter((s: any) => s.name !== 'gateway' && s.name !== 'neo4j')
          .map((service: any) => ({
            name: service.name,
            displayName: service.displayName || service.name,
            status: service.status,
            url: service.url,
            port: service.port,
            lastCheck: new Date(),
            error: service.error,
          }));

        set({ services });
      }

      set({
        loading: false,
        lastUpdated: new Date(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch status';
      set({
        error: errorMessage,
        loading: false,
      });
      console.error('Status fetch error:', err);
    }
  },
}));
