import { NextResponse } from 'next/server';
import { getClusterChunks } from '@/lib/neo4j';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clusterId = parseInt(id, 10);

    if (isNaN(clusterId)) {
      return NextResponse.json({ error: 'Invalid cluster ID' }, { status: 400 });
    }

    const chunks = await getClusterChunks(clusterId);
    return NextResponse.json(chunks);
  } catch (error) {
    console.error('Error fetching cluster chunks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chunks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
