/**
 * API routes for Action Queue
 * GET /api/queue - Fetch pending actions with filters
 * POST /api/queue - Create new action
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getActions,
  createAction,
  checkAutoApprove,
  incrementRuleTriggers,
} from '@/lib/db/queue';
import type {
  ActionType,
  ActionStatus,
  RiskLevel,
  CreateActionRequest,
} from '@/lib/types/queue';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as ActionStatus | null;
    const actionType = searchParams.get('action_type') as ActionType | null;
    const riskLevel = searchParams.get('risk_level') as RiskLevel | null;
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : undefined;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : undefined;

    const actions = getActions({
      status: status || undefined,
      action_type: actionType || undefined,
      risk_level: riskLevel || undefined,
      limit,
      offset,
    });

    // Parse JSON fields for client
    const parsed = actions.map((action) => ({
      ...action,
      action_data: JSON.parse(action.action_data),
      context_data: action.context_data
        ? JSON.parse(action.context_data)
        : null,
      edited_data: action.edited_data ? JSON.parse(action.edited_data) : null,
    }));

    return NextResponse.json({ actions: parsed });
  } catch (error) {
    console.error('Error fetching actions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateActionRequest = await request.json();

    // Validate required fields
    if (!body.action_type || !body.action_data || !body.risk_level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for auto-approve
    const autoApproveRule = checkAutoApprove(
      body.action_type,
      body.action_data
    );

    const actionId = createAction({
      ...body,
      action_data: body.action_data,
      context_data: body.context_data,
    });

    // If auto-approved, update status and increment rule counter
    if (autoApproveRule) {
      const { updateAction } = await import('@/lib/db/queue');
      updateAction(actionId, { status: 'auto_approved' });
      incrementRuleTriggers(autoApproveRule.id);
    }

    return NextResponse.json(
      {
        id: actionId,
        auto_approved: !!autoApproveRule,
        rule_id: autoApproveRule?.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating action:', error);
    return NextResponse.json(
      { error: 'Failed to create action' },
      { status: 500 }
    );
  }
}
