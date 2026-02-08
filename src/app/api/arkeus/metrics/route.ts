import { NextRequest, NextResponse } from 'next/server';
import { getArkeusMetrics } from '@/lib/arkeus-client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/arkeus/metrics?hours=24
 * Fetches brain metrics history
 */
export async function GET(request: NextRequest) {
  const hours = parseInt(request.nextUrl.searchParams.get('hours') || '24');

  const result = await getArkeusMetrics(hours);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
