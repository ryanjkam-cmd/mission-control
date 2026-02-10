/**
 * POST /api/queue/[id]/edit - Save edited version of action
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAction, updateAction, markActionExecuted } from '@/lib/db/queue';
import type { ParsedActionData } from '@/lib/types/queue';

interface EditRequest {
  edited_data: ParsedActionData;
  execute?: boolean; // Execute immediately after editing
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

    const body: EditRequest = await request.json();

    if (!body.edited_data) {
      return NextResponse.json(
        { error: 'Missing edited_data' },
        { status: 400 }
      );
    }

    // Update status to edited
    updateAction(id, {
      status: 'edited',
      edited_data: body.edited_data,
    });

    let executionResult = null;

    // Execute if requested
    if (body.execute) {
      // TODO: Execute the edited action
      console.log('Would execute edited action:', body.edited_data);
      markActionExecuted(id);
      executionResult = { success: true, message: 'Executed (mock)' };
    }

    // TODO: Update learner with edit diff
    // Compare original action_data with edited_data to see what user changed
    // This is valuable learning signal for future actions

    return NextResponse.json({
      success: true,
      edited: true,
      execution: executionResult,
    });
  } catch (error) {
    console.error('Error editing action:', error);
    return NextResponse.json(
      { error: 'Failed to edit action' },
      { status: 500 }
    );
  }
}
