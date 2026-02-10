/**
 * PATCH /api/rules/[id] - Enable/disable auto-approve rule
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRule, updateRule } from '@/lib/db/queue';

interface UpdateRuleRequest {
  enabled?: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid rule ID' }, { status: 400 });
    }

    const rule = getRule(id);
    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const body: UpdateRuleRequest = await request.json();

    if (body.enabled === undefined) {
      return NextResponse.json(
        { error: 'Missing enabled field' },
        { status: 400 }
      );
    }

    updateRule(id, { enabled: body.enabled });

    return NextResponse.json({
      success: true,
      enabled: body.enabled,
    });
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json(
      { error: 'Failed to update rule' },
      { status: 500 }
    );
  }
}
