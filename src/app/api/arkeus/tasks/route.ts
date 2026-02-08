import { NextResponse } from 'next/server';
import { getArkeusTasks } from '@/lib/arkeus-client';

export const dynamic = 'force-dynamic';

/**
 * GET /api/arkeus/tasks
 * Fetches live brain body tasks from brain_body_actions.jsonl
 */
export async function GET() {
  const result = await getArkeusTasks();

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
