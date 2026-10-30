import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin-session';
import { NextResponse } from 'next/server';
import { getFramerUsersList, deleteFramerUser } from '@/lib/framer-auth';

export async function GET(request: Request) {
  try {
    if (!verifyAdminSession((await cookies()).get('qubtic_admin_session')?.value)) return NextResponse.json({ success: false, message: 'Admin sign-in required.' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const plugin = searchParams.get('plugin') || undefined;

    const data = await getFramerUsersList(plugin);
    return NextResponse.json({ success: true, ...data, users: data.users.map(({ auth_token: _token, metadata: _metadata, ...profile }) => profile) }, { headers: { 'Cache-Control': 'no-store' } });
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
    if (!verifyAdminSession((await cookies()).get('qubtic_admin_session')?.value)) return NextResponse.json({ success: false, message: 'Admin sign-in required.' }, { status: 401 });
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
