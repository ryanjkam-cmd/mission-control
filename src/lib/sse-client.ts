/**
 * SSE Client - Real-time event stream from Arkeus Gateway
 *
 * Connects to Gateway SSE endpoint and updates Zustand stores on events.
 * Features:
 * - Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, 16s max)
 * - Fallback polling if SSE unavailable
 * - Event parsing for system-status, cost-update, content-update
 */

import { useContentStore } from '@/stores/contentStore';
import { useCostStore } from '@/stores/costStore';
import { useAgentStore } from '@/stores/agentStore';

// Reconnection backoff configuration
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 16000; // 16 seconds
const BACKOFF_MULTIPLIER = 2;
const POLL_INTERVAL = 30000; // 30 seconds fallback polling

interface SSEClientConfig {
  url?: string;
  apiKey?: string;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export class SSEClient {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private config: Required<SSEClientConfig>;
  private isConnected = false;
  private shouldReconnect = true;

  constructor(config: SSEClientConfig = {}) {
    this.config = {
      url: config.url || `${process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8787'}/stream`,
      apiKey: config.apiKey || process.env.NEXT_PUBLIC_GATEWAY_API_KEY || '',
      onConnect: config.onConnect || (() => {}),
      onDisconnect: config.onDisconnect || (() => {}),
      onError: config.onError || ((err) => console.error('SSE Error:', err)),
    };
  }

  /**
   * Connect to SSE stream
   */
  connect(): void {
    if (this.eventSource) {
      console.warn('SSE already connected');
      return;
    }

    this.shouldReconnect = true;
    this.createEventSource();
  }

  /**
   * Create EventSource connection
   */
  private createEventSource(): void {
    try {
      // EventSource doesn't support custom headers, so append API key as query param
      const url = new URL(this.config.url);
      if (this.config.apiKey) {
        url.searchParams.set('api_key', this.config.apiKey);
      }

      this.eventSource = new EventSource(url.toString());

      this.eventSource.addEventListener('open', this.handleOpen.bind(this));
      this.eventSource.addEventListener('error', this.handleError.bind(this));
      this.eventSource.addEventListener('system-status', this.handleSystemStatus.bind(this));
      this.eventSource.addEventListener('cost-update', this.handleCostUpdate.bind(this));
      this.eventSource.addEventListener('content-update', this.handleContentUpdate.bind(this));

    } catch (err) {
      console.error('Failed to create EventSource:', err);
      this.fallbackToPolling();
    }
  }

  /**
   * Handle connection open
   */
  private handleOpen(): void {
    console.log('SSE connection established');
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.config.onConnect();

    // Stop polling if active
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Handle connection error
   */
  private handleError(event: Event): void {
    console.error('SSE connection error:', event);
    this.isConnected = false;
    this.config.onDisconnect();

    if (this.shouldReconnect) {
      this.reconnect();
    }
  }

  /**
   * Reconnect with exponential backoff
   */
  private reconnect(): void {
    if (this.reconnectTimeout) {
      return; // Already scheduled
    }

    const delay = Math.min(
      INITIAL_RETRY_DELAY * Math.pow(BACKOFF_MULTIPLIER, this.reconnectAttempts),
      MAX_RETRY_DELAY
    );

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.reconnectTimeout = null;

      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }

      // Try SSE again, fall back to polling if it fails repeatedly
      if (this.reconnectAttempts >= 3) {
        console.warn('SSE reconnection failed 3 times, falling back to polling');
        this.fallbackToPolling();
      } else {
        this.createEventSource();
      }
    }, delay);
  }

  /**
   * Fallback to polling when SSE unavailable
   */
  private fallbackToPolling(): void {
    if (this.pollInterval) {
      return; // Already polling
    }

    console.log('Starting fallback polling every 30s');

    // Poll immediately, then every 30s
    this.pollData();
    this.pollInterval = setInterval(() => {
      this.pollData();
    }, POLL_INTERVAL);
  }

  /**
   * Poll all endpoints
   */
  private async pollData(): Promise<void> {
    try {
      // Fetch all data in parallel
      await Promise.all([
        useAgentStore.getState().fetchStatus(),
        useCostStore.getState().fetchCosts(),
        // Content polling not implemented yet - would need /api/content/calendar endpoint
      ]);
    } catch (err) {
      console.error('Polling error:', err);
      this.config.onError(err instanceof Error ? err : new Error('Polling failed'));
    }
  }

  /**
   * Handle system-status event
   */
  private handleSystemStatus(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      // Update agent store
      if (data.daemons) {
        useAgentStore.getState().setDaemons(data.daemons);
      }

      if (data.gateway) {
        useAgentStore.getState().updateService('gateway', data.gateway);
      }

      if (data.neo4j) {
        useAgentStore.getState().updateService('neo4j', data.neo4j);
      }

      if (data.services) {
        useAgentStore.getState().setServices(data.services);
      }
    } catch (err) {
      console.error('Failed to parse system-status event:', err);
    }
  }

  /**
   * Handle cost-update event
   */
  private handleCostUpdate(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      // Update cost store
      useCostStore.getState().updateSpend({
        todaySpend: data.todaySpend,
        weekSpend: data.weekSpend,
        monthSpend: data.monthSpend,
        breakdown: data.breakdown,
        domainBreakdown: data.domainBreakdown,
        trends: data.trends,
        projectedSpend: data.projectedSpend,
        daysRemaining: data.daysRemaining,
      });
    } catch (err) {
      console.error('Failed to parse cost-update event:', err);
    }
  }

  /**
   * Handle content-update event
   */
  private handleContentUpdate(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);

      // Update content store
      if (data.items) {
        useContentStore.getState().setItems(data.items);
      }

      if (data.item) {
        // Single item update
        const { item, action } = data;

        if (action === 'create') {
          useContentStore.getState().addItem(item);
        } else if (action === 'update') {
          useContentStore.getState().updateItem(item.id, item);
        } else if (action === 'delete') {
          useContentStore.getState().deleteItem(item.id);
        }
      }
    } catch (err) {
      console.error('Failed to parse content-update event:', err);
    }
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    this.shouldReconnect = false;

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    this.isConnected = false;
    this.config.onDisconnect();
  }

  /**
   * Check if connected
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let sseClient: SSEClient | null = null;

/**
 * Create or return existing SSE client
 */
export function createSSEClient(config?: SSEClientConfig): SSEClient {
  if (!sseClient) {
    sseClient = new SSEClient(config);
  }
  return sseClient;
}

/**
 * Close SSE client
 */
export function closeSSEClient(): void {
  if (sseClient) {
    sseClient.disconnect();
    sseClient = null;
  }
}

/**
 * Get current SSE client
 */
export function getSSEClient(): SSEClient | null {
  return sseClient;
}
