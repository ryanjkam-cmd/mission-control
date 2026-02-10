/**
 * Anomaly Detector - Detect unusual spending patterns
 *
 * Uses 2σ (2 standard deviations) above mean to flag anomalies
 */

import { getCostTrends, CostTrendPoint } from './cost-parser';

export interface Anomaly {
  date: string;
  cost: number;
  multiplier: number; // How many times above average
  reason?: string;
}

/**
 * Calculate mean and standard deviation
 */
function calculateStats(values: number[]): { mean: number; stdDev: number } {
  if (values.length === 0) {
    return { mean: 0, stdDev: 0 };
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;

  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
}

/**
 * Detect anomalies in spending patterns
 * Returns days where spend is > 2σ above mean
 */
export async function detectAnomalies(days: number = 30): Promise<Anomaly[]> {
  const trends = await getCostTrends(days);

  if (trends.length < 3) {
    return []; // Need at least 3 days of data
  }

  const costs = trends.map(t => t.cost);
  const { mean, stdDev } = calculateStats(costs);

  const threshold = mean + (2 * stdDev);

  const anomalies: Anomaly[] = [];

  for (const trend of trends) {
    if (trend.cost > threshold && mean > 0) {
      const multiplier = trend.cost / mean;

      // Guess reason based on multiplier
      let reason = 'Unknown spike';
      if (multiplier > 10) {
        reason = 'Major operation (deep review or large batch)';
      } else if (multiplier > 5) {
        reason = 'Elevated activity (evaluator tests or council review)';
      } else if (multiplier > 3) {
        reason = 'Above normal usage';
      }

      anomalies.push({
        date: trend.date,
        cost: trend.cost,
        multiplier,
        reason
      });
    }
  }

  // Sort by cost descending
  anomalies.sort((a, b) => b.cost - a.cost);

  return anomalies;
}

/**
 * Calculate 7-day moving average
 */
export async function getMovingAverage(days: number = 30): Promise<CostTrendPoint[]> {
  const trends = await getCostTrends(days);

  if (trends.length < 7) {
    return trends; // Not enough data for 7-day average
  }

  const movingAvg: CostTrendPoint[] = [];

  for (let i = 6; i < trends.length; i++) {
    const slice = trends.slice(i - 6, i + 1);
    const avgCost = slice.reduce((sum, t) => sum + t.cost, 0) / 7;

    movingAvg.push({
      date: trends[i].date,
      cost: avgCost,
      entries: 0 // Not applicable for moving average
    });
  }

  return movingAvg;
}
