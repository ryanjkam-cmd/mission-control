/**
 * Mission Control - Type Definitions
 * Centralized type exports for all stores and components
 */

// Re-export all types from stores
export type {
  ContentPlatform,
  ContentStatus,
  ContentView,
  ContentItem,
} from '@/stores/contentStore';

export type {
  ModelBreakdown,
  DomainBreakdown,
  CostTrend,
} from '@/stores/costStore';

export type {
  DaemonStatus,
  ServiceStatus,
  DaemonInfo,
  ServiceInfo,
} from '@/stores/agentStore';

// Additional shared types
export interface GatewayResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}
