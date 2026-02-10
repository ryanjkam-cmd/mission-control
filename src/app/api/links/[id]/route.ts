import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface QuickLink {
  id: number;
  title: string;
  url: string;
  category: 'Notion' | 'Google' | 'External' | 'Tool';
  tags: string;
  clicks: number;
  last_accessed: string | null;
  created_at: string;
  updated_at: string;
}

// PATCH /api/links/[id] - Update link
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, url, category, tags } = body;

    const db = getDb();

    // Check if link exists
    const existing = db.prepare('SELECT * FROM quick_links WHERE id = ?').get(id) as QuickLink | undefined;
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Link not found' },
        { status: 404 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (url !== undefined) {
      // Validate URL format
      try {
        new URL(url);
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid URL format' },
          { status: 400 }
        );
      }
      updates.push('url = ?');
      values.push(url);
    }
    if (category !== undefined) {
      const validCategories = ['Notion', 'Google', 'External', 'Tool'];
      if (!validCategories.includes(category)) {
        return NextResponse.json(
          { success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }
      updates.push('category = ?');
      values.push(category);
    }
    if (tags !== undefined) {
      updates.push('tags = ?');
      values.push(tags ? JSON.stringify(tags) : null);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updates.push("updated_at = datetime('now')");

    values.push(id);

    const stmt = db.prepare(`
      UPDATE quick_links
      SET ${updates.join(', ')}
      WHERE id = ?
    `);
    stmt.run(...values);

    // Fetch updated link
    const updated = db.prepare('SELECT * FROM quick_links WHERE id = ?').get(id) as QuickLink;

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        tags: updated.tags ? JSON.parse(updated.tags) : [],
      },
    });
  } catch (error) {
    console.error('[API] Error updating link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update link' },
      { status: 500 }
    );
  }
}

// DELETE /api/links/[id] - Delete link
export async function DELETE(
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

    const stmt = db.prepare('DELETE FROM quick_links WHERE id = ?');
    stmt.run(id);

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully',
    });
  } catch (error) {
    console.error('[API] Error deleting link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}
