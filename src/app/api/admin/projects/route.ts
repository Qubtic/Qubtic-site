import { NextResponse } from 'next/server';
import { getProjectsDb, saveProjectDb, deleteProjectDb, ProjectItem } from '@/lib/store';

export async function GET() {
  try {
    const projects = await getProjectsDb();
    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const project: ProjectItem = await request.json();
    if (!project.slug || !project.title) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    const saved = await saveProjectDb(project);
    return NextResponse.json({ success: true, project: saved });
  } catch (error) {
    console.error('Error saving project:', error);
    return NextResponse.json({ success: false, error: 'Failed to save project' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug is required' }, { status: 400 });
    }

    const success = await deleteProjectDb(slug);
    return NextResponse.json({ success, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 500 });
  }
}
