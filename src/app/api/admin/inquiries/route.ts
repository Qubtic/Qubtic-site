import { NextResponse } from 'next/server';
import { getInquiriesDb, deleteInquiryDb } from '@/lib/store';

export async function GET() {
  try {
    const inquiries = await getInquiriesDb();
    return NextResponse.json(inquiries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Inquiry ID is required' }, { status: 400 });
    }

    const success = await deleteInquiryDb(id);
    return NextResponse.json({ success, message: 'Inquiry deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
