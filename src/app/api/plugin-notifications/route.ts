import { cronAuthorized } from '@/lib/billing/core';
import { flushTeamEvents } from '@/lib/email-service';
export const runtime = 'nodejs';
export const maxDuration = 60;
export async function GET(request: Request) {
    if (!cronAuthorized(request))
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        await flushTeamEvents();
        return Response.json({ processed: true });
    }
    catch {
        return Response.json({ error: 'Notification worker unavailable' }, { status: 503 });
    }
}
