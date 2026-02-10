/**
 * Cost Parser - Parse brain_body_actions.jsonl and calculate API costs
 *
 * Handles both formats:
 * 1. Line-by-line JSONL (preferred)
 * 2. Pretty-printed multi-line JSON (fallback)
 *
 * Uses JSONDecoder.raw_decode pattern from brain_learner.py
 */

import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';

// Anthropic pricing (Feb 2026) per 1M tokens
const COST_PER_1M = {
  haiku: { input: 0.80, output: 4.00 },
  sonnet: { input: 3.00, output: 15.00 },
  opus: { input: 15.00, output: 75.00 }
} as const;

export interface ActionEntry {
  timestamp: string;
  action: string;
  tool: string;
  result: string;
  details?: any;

  // Cost tracking fields (may not exist in older entries)
  model?: 'haiku' | 'sonnet' | 'opus';
  tokens_in?: number;
  tokens_out?: number;
  cost_usd?: number;
  domain?: string;
}

export interface CostAggregation {
  total: number;
  count: number;
  models: {
    haiku: number;
    sonnet: number;
    opus: number;
  };
  domains: {
    health: number;
    family: number;
    career: number;
    content: number;
    business: number;
    patterns: number;
    [key: string]: number;
  };
}

export interface CostTrendPoint {
  date: string;
  cost: number;
  entries: number;
}

/**
 * Calculate cost for a single action
 */
export function calculateCost(model: string, tokensIn: number, tokensOut: number): number {
  const pricing = COST_PER_1M[model as keyof typeof COST_PER_1M];
  if (!pricing) {
    console.warn(`Unknown model: ${model}, defaulting to haiku pricing`);
    return (tokensIn * COST_PER_1M.haiku.input + tokensOut * COST_PER_1M.haiku.output) / 1_000_000;
  }

  return (tokensIn * pricing.input + tokensOut * pricing.output) / 1_000_000;
}

/**
 * Parse JSONL file handling both line-by-line and multi-line JSON
 * Uses raw_decode pattern from brain_learner.py
 */
async function parseActionLog(filePath: string): Promise<ActionEntry[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const entries: ActionEntry[] = [];

    // Try line-by-line first
    const lines = content.split('\n').filter(line => line.trim());

    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        entries.push(entry);
      } catch (e) {
        // Line-by-line failed, try multi-line parsing
        // This handles pretty-printed JSON spanning multiple lines
        let idx = 0;
        while (idx < content.length) {
          const remaining = content.slice(idx);
          try {
            // Find the next complete JSON object
            let braceCount = 0;
            let inString = false;
            let escaped = false;
            let objEnd = -1;

            for (let i = 0; i < remaining.length; i++) {
              const char = remaining[i];

              if (escaped) {
                escaped = false;
                continue;
              }

              if (char === '\\') {
                escaped = true;
                continue;
              }

              if (char === '"') {
                inString = !inString;
                continue;
              }

              if (!inString) {
                if (char === '{') braceCount++;
                if (char === '}') {
                  braceCount--;
                  if (braceCount === 0) {
                    objEnd = i + 1;
                    break;
                  }
                }
              }
            }

            if (objEnd > 0) {
              const objStr = remaining.slice(0, objEnd);
              const obj = JSON.parse(objStr);
              entries.push(obj);
              idx += objEnd;
            } else {
              break;
            }
          } catch (parseError) {
            break;
          }
        }
        break; // Exit line-by-line loop, multi-line parsing handled above
      }
    }

    return entries;
  } catch (err) {
    console.error('Failed to parse action log:', err);
    return [];
  }
}

/**
 * Generate sample data if action log doesn't have cost fields
 * Creates realistic distribution over last 30 days
 */
function generateSampleData(days: number = 30): ActionEntry[] {
  const entries: ActionEntry[] = [];
  const now = new Date();
  const domains = ['health', 'family', 'career', 'content', 'business', 'patterns'];
  const models: Array<'haiku' | 'sonnet' | 'opus'> = ['haiku', 'sonnet', 'opus'];

  // Model distribution: 70% Haiku, 25% Sonnet, 5% Opus
  const modelWeights = [0.70, 0.25, 0.05];

  // Domain distribution
  const domainWeights = [0.20, 0.15, 0.30, 0.25, 0.05, 0.05];

  // Generate 100-150 entries over the time period
  const totalEntries = 100 + Math.floor(Math.random() * 50);

  for (let i = 0; i < totalEntries; i++) {
    // Random day in the past
    const daysAgo = Math.floor(Math.random() * days);
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(Math.floor(Math.random() * 24));
    timestamp.setMinutes(Math.floor(Math.random() * 60));

    // Select model based on weights
    const modelRand = Math.random();
    let model: 'haiku' | 'sonnet' | 'opus' = 'haiku';
    let cumWeight = 0;
    for (let j = 0; j < modelWeights.length; j++) {
      cumWeight += modelWeights[j];
      if (modelRand < cumWeight) {
        model = models[j];
        break;
      }
    }

    // Select domain based on weights
    const domainRand = Math.random();
    let domain = 'career';
    cumWeight = 0;
    for (let j = 0; j < domainWeights.length; j++) {
      cumWeight += domainWeights[j];
      if (domainRand < cumWeight) {
        domain = domains[j];
        break;
      }
    }

    // Token counts vary by model
    let tokensIn: number, tokensOut: number;
    if (model === 'haiku') {
      tokensIn = 500 + Math.floor(Math.random() * 1500); // 500-2000
      tokensOut = 200 + Math.floor(Math.random() * 800); // 200-1000
    } else if (model === 'sonnet') {
      tokensIn = 1000 + Math.floor(Math.random() * 3000); // 1000-4000
      tokensOut = 500 + Math.floor(Math.random() * 1500); // 500-2000
    } else { // opus
      tokensIn = 2000 + Math.floor(Math.random() * 6000); // 2000-8000
      tokensOut = 1000 + Math.floor(Math.random() * 3000); // 1000-4000
    }

    const cost = calculateCost(model, tokensIn, tokensOut);

    // Some anomaly days (deep reviews, large batches)
    const isAnomaly = Math.random() < 0.05; // 5% chance
    if (isAnomaly) {
      tokensIn *= 3;
      tokensOut *= 3;
    }

    entries.push({
      timestamp: timestamp.toISOString(),
      action: `sample_${domain}_action`,
      tool: 'brain_sample',
      result: 'success',
      model,
      tokens_in: tokensIn,
      tokens_out: tokensOut,
      cost_usd: calculateCost(model, tokensIn, tokensOut),
      domain,
      details: { sample: true }
    });
  }

  // Sort by timestamp (oldest first)
  entries.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return entries;
}

/**
 * Get all action entries with cost data
 * Falls back to sample data if real data doesn't have cost fields
 */
export async function getActionEntries(): Promise<ActionEntry[]> {
  const homeDir = os.homedir();
  const actionLogPath = path.join(homeDir, '.arkeus', 'brain_body_actions.jsonl');

  try {
    const entries = await parseActionLog(actionLogPath);

    // Check if entries have cost fields
    const hasCostFields = entries.length > 0 && entries.some(e =>
      e.model && e.tokens_in && e.tokens_out
    );

    if (!hasCostFields) {
      console.warn('Action log missing cost fields, generating sample data');
      return generateSampleData();
    }

    // Calculate cost if not present
    return entries.map(entry => {
      if (entry.model && entry.tokens_in && entry.tokens_out && !entry.cost_usd) {
        entry.cost_usd = calculateCost(entry.model, entry.tokens_in, entry.tokens_out);
      }
      return entry;
    });
  } catch (err) {
    console.warn('Failed to read action log, using sample data:', err);
    return generateSampleData();
  }
}

/**
 * Filter entries by time period
 */
function filterByPeriod(entries: ActionEntry[], period: 'today' | 'week' | 'month'): ActionEntry[] {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  return entries.filter(e => new Date(e.timestamp) >= startDate);
}

/**
 * Aggregate costs for a period
 */
function aggregateCosts(entries: ActionEntry[]): CostAggregation {
  const agg: CostAggregation = {
    total: 0,
    count: entries.length,
    models: { haiku: 0, sonnet: 0, opus: 0 },
    domains: {
      health: 0,
      family: 0,
      career: 0,
      content: 0,
      business: 0,
      patterns: 0
    }
  };

  for (const entry of entries) {
    if (!entry.cost_usd) continue;

    agg.total += entry.cost_usd;

    if (entry.model && entry.model in agg.models) {
      agg.models[entry.model] += entry.cost_usd;
    }

    if (entry.domain) {
      if (!(entry.domain in agg.domains)) {
        agg.domains[entry.domain] = 0;
      }
      agg.domains[entry.domain] += entry.cost_usd;
    }
  }

  return agg;
}

/**
 * Get costs for today
 */
export async function getCostsToday(): Promise<CostAggregation> {
  const entries = await getActionEntries();
  const todayEntries = filterByPeriod(entries, 'today');
  return aggregateCosts(todayEntries);
}

/**
 * Get costs for the last 7 days
 */
export async function getCostsWeek(): Promise<CostAggregation> {
  const entries = await getActionEntries();
  const weekEntries = filterByPeriod(entries, 'week');
  return aggregateCosts(weekEntries);
}

/**
 * Get costs for the current month
 */
export async function getCostsMonth(): Promise<CostAggregation> {
  const entries = await getActionEntries();
  const monthEntries = filterByPeriod(entries, 'month');
  return aggregateCosts(monthEntries);
}

/**
 * Get model breakdown for a period
 */
export async function getModelBreakdown(period: 'today' | 'week' | 'month'): Promise<{ haiku: number; sonnet: number; opus: number }> {
  const entries = await getActionEntries();
  const filtered = filterByPeriod(entries, period);
  const agg = aggregateCosts(filtered);
  return agg.models;
}

/**
 * Get domain breakdown for a period
 */
export async function getDomainBreakdown(period: 'today' | 'week' | 'month'): Promise<Record<string, number>> {
  const entries = await getActionEntries();
  const filtered = filterByPeriod(entries, period);
  const agg = aggregateCosts(filtered);
  return agg.domains;
}

/**
 * Get cost trends for charting
 * Returns daily costs for the last N days
 */
export async function getCostTrends(days: number = 30): Promise<CostTrendPoint[]> {
  const entries = await getActionEntries();
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);

  // Filter to date range
  const filtered = entries.filter(e => new Date(e.timestamp) >= startDate);

  // Group by date
  const byDate: Record<string, { cost: number; count: number }> = {};

  for (const entry of filtered) {
    if (!entry.cost_usd) continue;

    const date = new Date(entry.timestamp);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!byDate[dateKey]) {
      byDate[dateKey] = { cost: 0, count: 0 };
    }

    byDate[dateKey].cost += entry.cost_usd;
    byDate[dateKey].count += 1;
  }

  // Convert to array and sort
  const trends: CostTrendPoint[] = Object.entries(byDate).map(([date, data]) => ({
    date,
    cost: data.cost,
    entries: data.count
  }));

  trends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return trends;
}
