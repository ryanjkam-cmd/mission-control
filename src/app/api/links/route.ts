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

// GET /api/links - List all links (with optional category filter)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    const db = getDb();
    let query = 'SELECT * FROM quick_links';
    const params: string[] = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY clicks DESC, title ASC';

    const stmt = db.prepare(query);
    const links = stmt.all(...params) as QuickLink[];

    // Parse tags JSON
    const linksWithParsedTags = links.map(link => ({
      ...link,
      tags: link.tags ? JSON.parse(link.tags) : [],
    }));

    return NextResponse.json({
      success: true,
      data: linksWithParsedTags,
      count: linksWithParsedTags.length,
    });
  } catch (error) {
    console.error('[API] Error fetching links:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}

// POST /api/links - Create new link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, url, category, tags } = body;

    // Validation
    if (!title || !url || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, url, category' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format (must start with https://)' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['Notion', 'Google', 'External', 'Tool'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO quick_links (title, url, category, tags)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      url,
      category,
      tags ? JSON.stringify(tags) : null
    );

    const newLink = db.prepare('SELECT * FROM quick_links WHERE id = ?').get(result.lastInsertRowid) as QuickLink;

    return NextResponse.json({
      success: true,
      data: {
        ...newLink,
        tags: newLink.tags ? JSON.parse(newLink.tags) : [],
      },
    });
  } catch (error) {
    console.error('[API] Error creating link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create link' },
      { status: 500 }
    );
  }
}
