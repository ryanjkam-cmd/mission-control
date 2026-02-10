import { NextResponse } from 'next/server';
import { getGraphStats } from '@/lib/neo4j';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getGraphStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching graph stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
