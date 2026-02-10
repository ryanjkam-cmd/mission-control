/**
 * API routes for Auto-Approve Rules
 * GET /api/rules - Fetch all auto-approve rules
 * POST /api/rules - Create new rule
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRules, createRule } from '@/lib/db/queue';
import type { ActionType, CreateRuleRequest } from '@/lib/types/queue';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const actionType = searchParams.get('action_type') as ActionType | null;
    const enabled = searchParams.get('enabled');

    const rules = getRules({
      action_type: actionType || undefined,
      enabled: enabled !== null ? enabled === 'true' : undefined,
    });

    // Parse conditions JSON
    const parsed = rules.map((rule) => ({
      ...rule,
      conditions: JSON.parse(rule.conditions),
    }));

    return NextResponse.json({ rules: parsed });
  } catch (error) {
    console.error('Error fetching rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateRuleRequest = await request.json();

    if (!body.action_type || !body.conditions || !Array.isArray(body.conditions)) {
      return NextResponse.json(
        { error: 'Missing required fields or invalid conditions' },
        { status: 400 }
      );
    }

    const ruleId = createRule(body);

    return NextResponse.json({ id: ruleId }, { status: 201 });
  } catch (error) {
    console.error('Error creating rule:', error);
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    );
  }
}
