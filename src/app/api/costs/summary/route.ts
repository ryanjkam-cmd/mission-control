import { NextRequest, NextResponse } from 'next/server';
import { getCostsToday, getCostsWeek, getCostsMonth } from '@/lib/cost-parser';

/**
 * GET /api/costs/summary?period=today|week|month
 *
 * Returns aggregated cost data for the specified period
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    let data;
    if (period === 'today') {
      data = await getCostsToday();
    } else if (period === 'week') {
      data = await getCostsWeek();
    } else {
      data = await getCostsMonth();
    }

    return NextResponse.json({
      period,
      total: data.total,
      count: data.count,
      models: data.models,
      domains: data.domains,
    });
  } catch (error) {
    console.error('Cost summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost summary' },
      { status: 500 }
    );
  }
}
