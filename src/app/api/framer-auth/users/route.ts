import { NextResponse } from 'next/server';
import { getFramerUsersList, deleteFramerUser } from '@/lib/framer-auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const plugin = searchParams.get('plugin') || undefined;

    const data = await getFramerUsersList(plugin);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Error fetching Framer users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch Framer users.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing user ID.' }, { status: 400 });
    }

    await deleteFramerUser(id);
    return NextResponse.json({ success: true, message: 'User deleted successfully.' });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to delete user.' },
      { status: 500 }
    );
  }
}
