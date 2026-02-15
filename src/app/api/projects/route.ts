/**
 * API routes for Build Projects
 * GET /api/projects - List projects with optional filters
 * POST /api/projects - Create new project
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProjects, createProject } from '@/lib/db/projects';
import type { CreateProjectRequest, ParsedProject, ProjectPhase, WorkLogEntry } from '@/lib/types/projects';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || undefined;
    const assignedAgentId = searchParams.get('assigned_agent_id') || undefined;

    const projects = getProjects({ status, assigned_agent_id: assignedAgentId });

    // Parse JSON fields for client
    const parsed: ParsedProject[] = projects.map((p) => ({
      ...p,
      phases: JSON.parse(p.phases || '[]') as ProjectPhase[],
      work_log: JSON.parse(p.work_log || '[]') as WorkLogEntry[],
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectRequest = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    const id = createProject(body);

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
