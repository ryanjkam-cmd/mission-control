import { NextResponse } from 'next/server';
import { getArkeusLearning } from '@/lib/arkeus-client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/arkeus/learning
 * Fetches learning outcomes from learner DB
 */
export async function GET() {
  const result = await getArkeusLearning();

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
