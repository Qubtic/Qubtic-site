import { NextResponse } from 'next/server';
import { getServicesDb, saveServiceDb, deleteServiceDb, ServiceItem } from '@/lib/store';

export async function GET() {
  try {
    const services = await getServicesDb();
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const service: ServiceItem = await request.json();
    if (!service.slug || !service.title) {
      return NextResponse.json({ success: false, error: 'Title and slug are required' }, { status: 400 });
    }

    const saved = await saveServiceDb(service);
    return NextResponse.json({ success: true, service: saved });
  } catch (error) {
    console.error('Error saving service:', error);
    return NextResponse.json({ success: false, error: 'Failed to save service' }, { status: 500 });
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

    const success = await deleteServiceDb(slug);
    return NextResponse.json({ success, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete service' }, { status: 500 });
  }
}
