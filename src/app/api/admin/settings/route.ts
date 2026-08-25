import { NextResponse } from 'next/server';
import { getSettingsDb, saveSettingsDb, SiteSettings } from '@/lib/store';

export async function GET() {
  try {
    const settings = await getSettingsDb();
    const safeSettings = {
      ...settings,
      adminPasswordHash: '••••••••',
    };
    return NextResponse.json(safeSettings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch site settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newSettings: Partial<SiteSettings> = await request.json();
    const currentSettings = await getSettingsDb();

    const updatePayload: Partial<SiteSettings> = {
      ...newSettings,
    };

    if (newSettings.adminPasswordHash && newSettings.adminPasswordHash !== '••••••••') {
      updatePayload.adminPasswordHash = newSettings.adminPasswordHash;
    } else {
      updatePayload.adminPasswordHash = currentSettings.adminPasswordHash;
    }

    const updated = await saveSettingsDb(updatePayload);
    return NextResponse.json({
      success: true,
      settings: {
        ...updated,
        adminPasswordHash: '••••••••',
      },
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json({ success: false, error: 'Failed to update site settings' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
