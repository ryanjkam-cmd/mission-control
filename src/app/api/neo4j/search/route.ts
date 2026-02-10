import { NextResponse } from 'next/server';
import { searchGraph } from '@/lib/neo4j';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
    }

    const results = await searchGraph(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching graph:', error);
    return NextResponse.json(
      { error: 'Failed to search graph', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
