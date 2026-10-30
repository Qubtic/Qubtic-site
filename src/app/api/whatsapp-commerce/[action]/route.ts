import { commerceRequest } from '@/lib/commerce-access';
export const runtime = 'nodejs';
type Context = { params: Promise<{ action: string }> };
async function handle(request: Request, context: Context) {
  const { action } = await context.params;
  return commerceRequest(request, action);
}
export const GET = handle;
export const POST = handle;
export const OPTIONS = handle;
