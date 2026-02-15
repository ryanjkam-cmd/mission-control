/**
 * POST /api/projects/[id]/advance - Advance project to next phase
 */

import { NextRequest, NextResponse } from 'next/server';
import { advancePhase } from '@/lib/db/projects';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = advancePhase(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error advancing phase:', error);
    return NextResponse.json(
      { error: 'Failed to advance phase' },
      { status: 500 }
    );
  }
}
