/**
 * Auto-Approve Rules API
 *
 * GET /api/queue/rules - List all rules
 * POST /api/queue/rules - Create new rule
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRules, createRule } from '@/lib/db/queue';
import type { CreateRuleRequest } from '@/lib/types/queue';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const actionType = searchParams.get('action_type');
    const enabledParam = searchParams.get('enabled');

    const filters: Parameters<typeof getRules>[0] = {};

    if (actionType) {
      filters.action_type = actionType as any;
    }

    if (enabledParam !== null) {
      filters.enabled = enabledParam === 'true';
    }

    const rules = getRules(filters);

    // Parse JSON conditions
    const parsed = rules.map((rule) => ({
      ...rule,
      conditions: JSON.parse(rule.conditions),
      enabled: Boolean(rule.enabled),
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

    if (!body.action_type || !Array.isArray(body.conditions)) {
      return NextResponse.json(
        { error: 'action_type and conditions array required' },
        { status: 400 }
      );
    }

    if (body.conditions.length === 0) {
      return NextResponse.json(
        { error: 'At least one condition required' },
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
