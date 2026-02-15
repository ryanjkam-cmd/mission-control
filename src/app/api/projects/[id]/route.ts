/**
 * API routes for single Build Project
 * GET /api/projects/[id] - Get project by ID
 * PATCH /api/projects/[id] - Update project
 */

import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject } from '@/lib/db/projects';
import type { UpdateProjectRequest, ParsedProject, ProjectPhase, WorkLogEntry } from '@/lib/types/projects';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = getProject(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const parsed: ParsedProject = {
      ...project,
      phases: JSON.parse(project.phases || '[]') as ProjectPhase[],
      work_log: JSON.parse(project.work_log || '[]') as WorkLogEntry[],
    };

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body: UpdateProjectRequest = await request.json();

    const updated = updateProject(id, body);

    if (!updated) {
      return NextResponse.json(
        { error: 'Project not found or no changes' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}
