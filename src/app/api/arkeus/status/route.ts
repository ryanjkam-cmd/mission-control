import { NextResponse } from 'next/server';
import { getArkeusStatus, checkGatewayHealth } from '@/lib/arkeus-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Check if gateway is available
  const isHealthy = await checkGatewayHealth();

  if (!isHealthy) {
    return NextResponse.json({
      available: false,
      error: 'Arkeus gateway not responding',
    }, { status: 503 });
  }

  const result = await getArkeusStatus();

  if (result.error) {
    return NextResponse.json({
      available: false,
      error: result.error,
    }, { status: 500 });
  }

  return NextResponse.json({
    available: true,
    ...(result.data || {}),
  });
}
