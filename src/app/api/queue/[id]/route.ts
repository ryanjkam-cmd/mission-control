/**
 * API routes for individual action
 * GET /api/queue/[id] - Fetch single action with full context
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAction } from '@/lib/db/queue';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid action ID' }, { status: 400 });
    }

    const action = getAction(id);

    if (!action) {
      return NextResponse.json({ error: 'Action not found' }, { status: 404 });
    }

    // Parse JSON fields
    const parsed = {
      ...action,
      action_data: JSON.parse(action.action_data),
      context_data: action.context_data
        ? JSON.parse(action.context_data)
        : null,
      edited_data: action.edited_data ? JSON.parse(action.edited_data) : null,
    };

    return NextResponse.json({ action: parsed });
  } catch (error) {
    console.error('Error fetching action:', error);
    return NextResponse.json(
      { error: 'Failed to fetch action' },
      { status: 500 }
    );
  }
}
