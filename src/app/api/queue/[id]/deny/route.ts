/**
 * POST /api/queue/[id]/deny - Deny action with feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAction, updateAction } from '@/lib/db/queue';

interface DenyRequest {
  feedback: string;
}

export async function POST(
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

    if (action.status !== 'pending') {
      return NextResponse.json(
        { error: 'Action already reviewed' },
        { status: 400 }
      );
    }

    const body: DenyRequest = await request.json();

    // Update status to denied with feedback
    updateAction(id, {
      status: 'denied',
      user_feedback: body.feedback || 'Denied without feedback',
    });

    // TODO: Update learner with negative feedback
    // This would call brain_learner.py to record the denial reason
    // for future learning (why user rejected this type of action)

    return NextResponse.json({
      success: true,
      message: 'Action denied',
    });
  } catch (error) {
    console.error('Error denying action:', error);
    return NextResponse.json(
      { error: 'Failed to deny action' },
      { status: 500 }
    );
  }
}
