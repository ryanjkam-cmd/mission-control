import { NextRequest, NextResponse } from 'next/server';
import { detectAnomalies } from '@/lib/anomaly-detector';

/**
 * GET /api/costs/anomalies?days=30
 *
 * Returns detected spending anomalies (2σ above mean)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const anomalies = await detectAnomalies(days);

    return NextResponse.json({
      anomalies,
      count: anomalies.length,
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect anomalies' },
      { status: 500 }
    );
  }
}
