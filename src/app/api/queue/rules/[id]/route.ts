/**
 * Individual Auto-Approve Rule API
 *
 * PATCH /api/queue/rules/[id] - Update rule (enable/disable, success rate)
 * DELETE /api/queue/rules/[id] - Delete rule
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRule, updateRule } from '@/lib/db/queue';
import { run } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    const body = await request.json();

    const rule = getRule(id);
    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    const updates: Parameters<typeof updateRule>[1] = {};

    if ('enabled' in body) {
      updates.enabled = Boolean(body.enabled);
    }

    if ('success_rate' in body) {
      updates.success_rate = Number(body.success_rate);
    }

    updateRule(id, updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating rule:', error);
    return NextResponse.json(
      { error: 'Failed to update rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);

    const rule = getRule(id);
    if (!rule) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    run('DELETE FROM auto_approve_rules WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting rule:', error);
    return NextResponse.json(
      { error: 'Failed to delete rule' },
      { status: 500 }
    );
  }
}
