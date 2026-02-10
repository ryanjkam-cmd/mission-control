import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST /api/links/[id]/click - Track click (increment counter)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // Check if link exists
    const existing = db.prepare('SELECT * FROM quick_links WHERE id = ?').get(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    // Increment clicks and update last_accessed
    const stmt = db.prepare(`
      UPDATE quick_links
      SET clicks = clicks + 1,
          last_accessed = datetime('now')
      WHERE id = ?
    `);
    stmt.run(id);

    // Fetch updated link
    const updated = db.prepare('SELECT * FROM quick_links WHERE id = ?').get(id);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('[API] Error tracking click:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track click' },
      { status: 500 }
    );
  }
}
