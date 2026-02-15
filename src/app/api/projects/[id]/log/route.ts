/**
 * POST /api/projects/[id]/log - Append work log entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { addWorkLogEntry } from '@/lib/db/projects';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      );
    }

    const success = addWorkLogEntry(id, {
      cycle: body.cycle || new Date().toISOString().slice(0, 16),
      action: body.action,
      details: body.details,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding work log:', error);
    return NextResponse.json(
      { error: 'Failed to add work log entry' },
      { status: 500 }
    );
  }
}
