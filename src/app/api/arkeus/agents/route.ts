import { NextResponse } from 'next/server';
import { getArkeusAgents } from '@/lib/arkeus-client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/arkeus/agents
 * Fetches live Arkeus agent statuses (running processes)
 */
export async function GET() {
  const result = await getArkeusAgents();

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
