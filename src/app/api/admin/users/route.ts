import { NextResponse } from 'next/server';
import { getAdminUsersDb } from '@/lib/store';

export async function GET() {
  try {
    const users = await getAdminUsersDb();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}
