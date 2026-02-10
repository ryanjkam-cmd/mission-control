import { NextRequest, NextResponse } from 'next/server';
import { getCostTrends } from '@/lib/cost-parser';
import { getMovingAverage } from '@/lib/anomaly-detector';

/**
 * GET /api/costs/trends?days=30
 *
 * Returns daily cost trends for charting
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const [trends, movingAvg] = await Promise.all([
      getCostTrends(days),
      getMovingAverage(days)
    ]);

    return NextResponse.json({
      trends,
      movingAverage: movingAvg,
    });
  } catch (error) {
    console.error('Cost trends error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost trends' },
      { status: 500 }
    );
  }
}
