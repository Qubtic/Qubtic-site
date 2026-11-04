import { POST as billing } from "../../[action]/route";
import { billingHeaders } from "@/lib/billing/core";
import { parseBillingEnvironment } from "@/lib/billing/config.mjs";

export const runtime = "nodejs";
export const maxDuration = 60;

/** The registered webhook URL binds the environment; its matching signature is still required. */
export async function POST(request: Request, context: { params: Promise<{ environment: string }> }) {
    const { environment } = await context.params;
    try { parseBillingEnvironment(environment); }
    catch { return Response.json({ error: "Invalid billing environment." }, { status: 400, headers: billingHeaders }); }
    const headers = new Headers(request.headers);
    headers.set("X-Billing-Environment", environment);
    return billing(new Request(request, { headers }), { params: Promise.resolve({ action: "webhook" }) });
}
