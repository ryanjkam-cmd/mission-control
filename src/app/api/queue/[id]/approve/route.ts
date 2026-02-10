/**
 * POST /api/queue/[id]/approve - Approve action and execute
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAction, updateAction, markActionExecuted } from '@/lib/db/queue';

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

    // Update status to approved
    updateAction(id, { status: 'approved' });

    // TODO: Execute action via MCP based on action_type
    // For now, we'll just mark as executed
    // In production, this would call appropriate MCP tools:
    // - email_reply -> Gmail MCP
    // - imessage -> AppleScript/shell
    // - calendar_block -> Calendar MCP
    // - etc.

    const actionData = JSON.parse(action.action_data);
    let executionResult = { success: false, message: 'Execution not implemented' };

    // Placeholder execution logic
    switch (action.action_type) {
      case 'email_reply':
        // TODO: Call Gmail MCP to send email
        console.log('Would send email:', actionData);
        executionResult = { success: true, message: 'Email sent (mock)' };
        break;
      case 'calendar_block':
        // TODO: Call Calendar MCP to create event
        console.log('Would create calendar event:', actionData);
        executionResult = { success: true, message: 'Event created (mock)' };
        break;
      case 'imessage':
        // TODO: Call iMessage handler
        console.log('Would send iMessage:', actionData);
        executionResult = { success: true, message: 'Message sent (mock)' };
        break;
      default:
        console.log('Unknown action type:', action.action_type);
    }

    if (executionResult.success) {
      markActionExecuted(id);
    }

    // TODO: Update learner with outcome
    // This would call brain_learner.py record_outcome with success/failure

    return NextResponse.json({
      success: true,
      execution: executionResult,
    });
  } catch (error) {
    console.error('Error approving action:', error);
    return NextResponse.json(
      { error: 'Failed to approve action' },
      { status: 500 }
    );
  }
}
