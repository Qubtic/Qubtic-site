import { sendTeamEvent, queueFrameDropPurchase, flushTeamEvents } from '../email-service';
import { loadManagedMail, loadManagedBilling } from '../plugin-control';
import { configuredCatalog, catalogMatches, resolveBillingConfig, parseBillingEnvironment, type BillingEnvironment } from "./config.mjs";
import { processUpgradeRefunds } from "./upgrade-refunds";
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createPolar, webhooks, type models } from "@polar-sh/sdk/2026-10";
import { AsyncLocalStorage } from "node:async_hooks";
import { createHash, timingSafeEqual } from "node:crypto";

export type Cadence = "monthly" | "yearly" | "lifetime";
export interface Catalog {
	plugin_slug: string;
	cadence: Cadence;
	product_id: string;
	benefit_id: string;
	environment: string;
	enabled: boolean;
}
export class BillingError extends Error {
	constructor(
		message: string,
		public status = 503,
	) {
		super(message);
	}
}
export const billingHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	"Access-Control-Allow-Headers":
		"Content-Type, Authorization, X-Framer-Site-Id, X-Billing-Environment",
	"Cache-Control": "no-store",
};
export function siteId(value: unknown): string | null {
	return typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value)
		? value
		: null;
}
// AsyncLocalStorage keeps concurrent Vercel requests and nested refund/webhook work isolated.
const billingContext = new AsyncLocalStorage<ReturnType<typeof resolveBillingConfig>>();
export function billingConfig() {
    return billingContext.getStore() || resolveBillingConfig(process.env, "production");
}
export function environment(): BillingEnvironment {
    return billingConfig().POLAR_ENVIRONMENT as BillingEnvironment;
}
export function withBillingEnvironment<T>(selected: BillingEnvironment, callback: () => T): T {
    return billingContext.run(resolveBillingConfig(process.env, selected), callback);
}
export async function billingRequest(request: Request, callback: () => Promise<Response>): Promise<Response> {
    // Browser preflights contain header names, not the billing selector or account token.
    // Answer before loading configuration so a disabled environment cannot block CORS.
    if (request.method === "OPTIONS")
        return new Response(null, { status: 204, headers: billingHeaders });
    let selected: BillingEnvironment = "production";
    try {
        const url = new URL(request.url);
        const allowQuery = /^\/api\/billing\/(webhook|resolve|reconcile)$/.test(url.pathname);
        const query = allowQuery ? url.searchParams.get("environment") : null;
        const header = request.headers.get("x-billing-environment");
        if (query !== null && header !== null && query !== header)
            throw new BillingError("Conflicting billing environments.", 400);
        try { selected = parseBillingEnvironment(query ?? header); }
        catch { throw new BillingError("Invalid billing environment.", 400); }
        const config = await loadManagedBilling(selected);
        return await billingContext.run(config, callback);
    } catch (error) {
        let message = error instanceof BillingError ? error.message : "Billing service is unavailable.";
        // Only known configuration codes get public diagnostics; never expose DB or secret errors.
        if (error instanceof Error && "code" in error) {
            const label = selected === "sandbox" ? "Sandbox" : "Production";
            if (error.code === "BILLING_ENVIRONMENT_DISABLED")
                message = `${label} payments are disabled. Enable this payment environment in Qubtic → Plugins & payments and publish.`;
            if (error.code === "BILLING_ENVIRONMENT_NOT_CONFIGURED")
                message = `${label} payments are not configured. Configure this environment in Qubtic → Plugins & payments and publish.`;
        }
        return Response.json({ error: message },
            { status: error instanceof BillingError ? error.status : 503, headers: billingHeaders });
    }
}
export function database() {
	const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
	const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) throw new BillingError("Billing is not configured yet.");
	return createClient(url, key, {
		auth: { persistSession: false, autoRefreshToken: false },
	});
}
export function polar() {
	if (!billingConfig().POLAR_ACCESS_TOKEN || !billingConfig().POLAR_ORGANIZATION_ID)
		throw new BillingError("Billing is not configured yet.");
	return createPolar({
		accessToken: billingConfig().POLAR_ACCESS_TOKEN!,
		environment: environment(),
	});
}
export function check(error: unknown) {
	if (error)
		throw new BillingError("Billing service is temporarily unavailable.");
}
export async function actor(request: Request) {
	const token = request.headers
		.get("authorization")
		?.match(/^Bearer ([^\s]+)$/i)?.[1];
	if (!token)
		throw new BillingError("Sign in to your plugin account first.", 401);
	const { data, error } = await database()
		.from("framer_users")
		.select("id,email,plugin_slug,name,status,metadata")
		.eq("auth_token", token)
		.maybeSingle();
	check(error);
	if (
		!data ||
		data.status !== "active" ||
		data.metadata?.email_verified !== true
	)
		throw new BillingError(
			"Your account session is invalid or unverified.",
			401,
		);
    if(environment()==='sandbox' && billingConfig().managed==='true') {
      const plugins=JSON.parse(billingConfig().MANAGED_PLUGINS||'[]');
      const plugin=plugins.find((p:{slug:string})=>p.slug===data.plugin_slug);
      const allowed=(plugin?.testEmails||'').split(',').map((email:string)=>email.trim().toLowerCase());
      if(!plugin?.enabled || !allowed.includes(data.email.toLowerCase()))throw new BillingError('Sandbox billing is restricted to approved developer accounts.',403);
    }
	return {
		id: data.id as string,
		email: data.email as string,
		plugin: data.plugin_slug as string,
		name: data.name as string | undefined,
	};
}
export async function limit(key: string, max = 20, seconds = 60) {
	const bucket = createHash("sha256")
		.update(`${environment()}:${key}`)
		.digest("hex");
	const { data, error } = await database().rpc("billing_throttle", {
		p_bucket: bucket,
		p_limit: max,
		p_seconds: seconds,
	});
	check(error);
	if (!data)
		throw new BillingError(
			"Too many billing requests. Please try again shortly.",
			429,
		);
}
export async function identity(userId: string) {
	const { data, error } = await database().rpc("billing_identity", {
		p_user: userId,
		p_environment: environment(),
	});
	check(error);
	return data as string;
}
export async function catalog(all = false) {
	let desired: Catalog[];
	try {
		desired = billingConfig().managed === "true" ? [] : configuredCatalog(billingConfig());
	} catch (error) {
        // Configuration validation errors contain field names and rules, never credentials.
        const detail = error instanceof Error ? error.message.replaceAll("POLAR_", `POLAR_${environment().toUpperCase()}_`) : "Check the server billing variables.";
        throw new BillingError(`Central Polar product configuration is incomplete or invalid (${environment()}). ${detail}`);
	}
	if (!desired.length && !all && billingConfig().managed !== "true") return [];
	const query = database()
		.from("billing_catalog")
		.select("*")
		.eq("environment", environment());
	const { data, error } = await (all ? query : query.eq("enabled", true));
	check(error);
	const entries = (data || []) as Catalog[];
	if (billingConfig().managed !== "true" && !catalogMatches(entries, desired))
		throw new BillingError(
			`Billing catalog differs from central ENV (${environment()}). Run node scripts/configure-billing.mjs --environment ${environment()} --apply on Qubtic.`,
		);
	// One reserved Pro benefit per plugin; a benefit may never unlock another plugin.
	const benefits = new Map<string, string>();
	const plugins = new Map<string, string>();
	for (const row of entries) {
		if (
			(benefits.has(row.benefit_id) &&
				benefits.get(row.benefit_id) !== row.plugin_slug) ||
			(plugins.has(row.plugin_slug) &&
				plugins.get(row.plugin_slug) !== row.benefit_id)
		)
			throw new BillingError("Billing catalog configuration needs attention.");
		benefits.set(row.benefit_id, row.plugin_slug);
		plugins.set(row.plugin_slug, row.benefit_id);
	}
	return entries;
}
export function safePolarUrl(value: string) {
	const url = new URL(value);
	if (
		url.protocol !== "https:" ||
		!(environment() === "sandbox"
            ? ["sandbox.polar.sh", "sandbox-api.polar.sh", "sandbox.buy.polar.sh"]
            : ["polar.sh", "api.polar.sh", "buy.polar.sh"]).includes(url.hostname) ||
		url.username ||
		url.password
	)
		throw new BillingError("Invalid checkout destination.");
	return url.href;
}
const siteBillingPlugins = ["whatsapp-commerce", "telegram-commerce"];
export async function paidAccess(
	userId: string,
	plugin: string,
	site?: string | null,
) {
	// Access is a current server record, never a browser plan or a legacy auth flag.
	if (!billingConfig().POLAR_ORGANIZATION_ID) return false;
	if (siteBillingPlugins.includes(plugin)) {
		if (!siteId(site)) return false;
		const { data, error } = await database().rpc("billing_site_access", {
			p_user: userId,
			p_plugin: plugin,
			p_environment: environment(),
			p_site: site,
		});
		check(error);
		return data === true;
	}
	const { data: member, error } = await database()
		.from("billing_memberships")
		.select("customer_id")
		.eq("user_id", userId)
		.eq("environment", environment())
		.eq("plugin_slug", plugin)
		.maybeSingle();
	check(error);
	if (!member) return false;
	const { data, error: e } = await database()
		.from("plugin_entitlements")
		.select("is_pro,verified_until")
		.eq("customer_id", member.customer_id)
		.eq("plugin_slug", plugin)
		.maybeSingle();
	check(e);
	return data?.is_pro === true && Date.parse(data.verified_until) > Date.now();
}
interface SubscriptionSnapshot {
	id: string;
	product_id: string;
	status: string;
	current_period_start: string;
	current_period_end: string;
	cancel_at_period_end: boolean;
}
export function paidOrder(order: {
	status: string;
	amount: number;
	refunded_amount: number;
	subtotal_amount?: number | null;
	discount_amount?: number | null;
	discount_id?: string | null;
}) {
	return (
		(["paid", "partially_refunded"].includes(order.status) &&
			order.amount > order.refunded_amount) ||
		(order.status === "paid" &&
			order.amount === 0 &&
			order.refunded_amount === 0 &&
			Number.isSafeInteger(order.subtotal_amount) &&
			(order.subtotal_amount ?? 0) > 0 &&
			order.discount_amount === order.subtotal_amount &&
			!!order.discount_id)
	);
}
export function normalizeState(
	state: models.CustomerState,
	entries: Catalog[],
	orders: models.Order[],
	allSubscriptions: SubscriptionSnapshot[] = state.active_subscriptions,
) {
	if (state.organization_id !== billingConfig().POLAR_ORGANIZATION_ID)
		throw new BillingError("Customer organization mismatch.");
	const benefitGrants = state.deleted_at
		? []
		: [
				...new Set(
					entries
						.filter((row) =>
							state.granted_benefits.some(
								(g) => g.benefit_id === row.benefit_id,
							),
						)
						.map((row) => row.plugin_slug),
				),
			].map((plugin_slug) => ({ plugin_slug }));
	const mappedOrders = orders.flatMap((order) => {
		const row = entries.find((r) => r.product_id === order.product_id);
		if (!row) return [];
		if (
			order.customer_id !== state.id ||
			order.customer.organization_id !== state.organization_id
		)
			throw new BillingError("Order ownership mismatch.");
		return [
			{
				id: order.id,
				plugin_slug: row.plugin_slug,
				cadence: row.cadence,
				product_id: order.product_id,
				status: order.status,
				amount: order.total_amount,
				subtotal_amount: order.subtotal_amount,
				discount_amount: order.discount_amount,
				discount_id: order.discount_id,
				refunded_amount: order.refunded_amount,
				currency: order.currency,
				created_at: order.created_at,
				subscription_id: order.subscription_id,
				checkout_id: order.checkout_id,
			},
		];
	});
	const subscriptions = allSubscriptions.flatMap((sub) => {
		const row = entries.find((r) => r.product_id === sub.product_id);
		if (!row) return [];
		return [
			{
				id: sub.id,
				plugin_slug: row.plugin_slug,
				cadence: row.cadence,
				status: sub.status,
				current_period_start: sub.current_period_start,
				current_period_end: sub.current_period_end,
				cancel_at_period_end: sub.cancel_at_period_end,
			},
		];
	});
	const grants = benefitGrants.flatMap((grant) => {
		const lifetime = entries.some(
			(row) =>
				row.plugin_slug === grant.plugin_slug &&
				row.cadence === "lifetime" &&
				mappedOrders.some(
					(order) => order.product_id === row.product_id && paidOrder(order),
				),
		);
		const eligible = subscriptions.filter(
			(sub) =>
				sub.plugin_slug === grant.plugin_slug &&
				sub.status === "active" &&
				Date.parse(sub.current_period_end) > Date.now() &&
				mappedOrders.some(
					(order) =>
						order.subscription_id === sub.id &&
						paidOrder(order) &&
						Date.parse(order.created_at) >=
							Date.parse(sub.current_period_start),
				),
		);
		if (lifetime) return [{ ...grant, access_ends_at: null as string | null }];
		if (!eligible.length) return [];
		return [
			{
				...grant,
				access_ends_at: eligible
					.map((sub) => sub.current_period_end)
					.sort()
					.at(-1)!,
			},
		];
	});
	return { grants, orders: mappedOrders, subscriptions };
}
/** Site ownership comes from our saved checkout, never editable Polar/browser metadata. */
export function normalizeSiteState(
	state: models.CustomerState,
	entries: Catalog[],
	orders: models.Order[],
	subscriptions: SubscriptionSnapshot[],
	checkouts: {
		site_id: string | null;
		polar_checkout_id: string | null;
		plugin_slug: string;
	}[],
) {
	const bindings = new Map(
		checkouts
			.filter((c) => siteId(c.site_id) && c.polar_checkout_id)
			.map((c) => [c.polar_checkout_id!, c]),
	);
	const subscriptionSites = new Map<
		string,
		{ site_id: string | null; plugin_slug: string }
	>();
	for (const order of orders) {
		const binding = bindings.get(order.checkout_id || "");
		const row = entries.find((r) => r.product_id === order.product_id);
		if (
			!binding ||
			!row ||
			row.plugin_slug !== binding.plugin_slug ||
			!order.subscription_id
		)
			continue;
		const previous = subscriptionSites.get(order.subscription_id);
		if (
			previous &&
			(previous.site_id !== binding.site_id ||
				previous.plugin_slug !== binding.plugin_slug)
		)
			throw new BillingError("Subscription site assignment mismatch.");
		subscriptionSites.set(order.subscription_id, binding);
	}
	const orderSite = (order: models.Order) => {
		const binding = order.subscription_id
			? subscriptionSites.get(order.subscription_id)
			: bindings.get(order.checkout_id || "");
		return binding &&
			binding.plugin_slug ===
				entries.find((r) => r.product_id === order.product_id)?.plugin_slug
			? binding.site_id
			: null;
	};
	const snapshot = normalizeState(state, entries, orders, subscriptions);
	const siteGrants = [];
	for (const plugin of siteBillingPlugins) {
		const sites = [
			...new Set(
				checkouts
					.filter((c) => c.plugin_slug === plugin && siteId(c.site_id))
					.map((c) => c.site_id!),
			),
		];
		for (const site of sites) {
			const scoped = normalizeState(
				state,
				entries.filter((r) => r.plugin_slug === plugin),
				orders.filter((o) => orderSite(o) === site),
				subscriptions.filter((s) => {
					const binding = subscriptionSites.get(s.id);
					return binding?.plugin_slug === plugin && binding.site_id === site;
				}),
			);
			siteGrants.push(
				...scoped.grants.map((grant) => ({ ...grant, site_id: site })),
			);
		}
	}
	return {
		...snapshot,
		siteGrants,
		orders: snapshot.orders.map((o) => ({
			...o,
			site_id: orderSite(orders.find((raw) => raw.id === o.id)!),
		})),
		subscriptions: snapshot.subscriptions.map((s) => ({
			...s,
			site_id: subscriptionSites.get(s.id)?.site_id || null,
		})),
	};
}
export async function synchronize(customerId: string) {
	const db = database();
	const sdk = polar();
	const started = new Date().toISOString();
	const { data: customer, error } = await db
		.from("billing_customers")
		.select("*")
		.eq("id", customerId)
		.eq("environment", environment())
		.single();
	check(error);
	if (!customer) throw new BillingError("Customer not found.");
	const { error: attemptError } = await db
		.from("billing_customers")
		.update({ last_attempted_at: started })
		.eq("id", customer.id);
	check(attemptError);
	const { error: checkoutAttempt } = await db
		.from("billing_checkouts")
		.update({ last_checked_at: started })
		.eq("customer_id", customer.id)
		.in("status", ["creating", "open"]);
	check(checkoutAttempt);
	let state: models.CustomerState;
	try {
		// External-ID discovery also recovers purchases when the first webhook was missed.
		const id =
			customer.polar_customer_id ||
			(await sdk.customers.getExternal(customer.id)).id;
		state = await sdk.customers.getState(id);
	} catch (error) {
		if (
			error &&
			typeof error === "object" &&
			"statusCode" in error &&
			error.statusCode === 404
		) {
			if (customer.polar_customer_id) {
				const { error: revokeError } = await db.rpc(
					"billing_apply_site_snapshot",
					{
						p_customer: customer.id,
						p_started: started,
						p_polar_id: customer.polar_customer_id,
						p_grants: [],
						p_orders: [],
						p_subscriptions: [],
						p_site_grants: [],
					},
				);
				check(revokeError);
			}
			return;
		}
		throw error;
	}
	if (state.external_id !== customer.id)
		throw new BillingError("Customer identity mismatch.");
	const entries = await catalog(true);
	const orders: models.Order[] = [];
	// A complete snapshot is required; pagination is not silently truncated.
	for await (const order of sdk.orders.iterList({
		customer_id: state.id,
		organization_id: billingConfig().POLAR_ORGANIZATION_ID,
		limit: 100,
	}))
		orders.push(order);
	const subscriptions: models.Subscription[] = [];
	for await (const sub of sdk.subscriptions.iterList({
		customer_id: state.id,
		organization_id: billingConfig().POLAR_ORGANIZATION_ID,
		limit: 100,
	}))
		subscriptions.push(sub);
	const { data: checkouts, error: checkoutError } = await db
		.from("billing_checkouts")
		.select("*")
		.eq("customer_id", customer.id)
		.eq("environment", environment());
	check(checkoutError);
	const snapshot = normalizeSiteState(
		state,
		entries,
		orders,
		subscriptions,
		checkouts || [],
	);
	const { data: applied, error: applyError } = await db.rpc(
		"billing_apply_site_snapshot",
		{
			p_customer: customer.id,
			p_started: started,
			p_polar_id: state.id,
			p_grants: snapshot.grants,
			p_orders: snapshot.orders,
			p_subscriptions: snapshot.subscriptions,
			p_site_grants: snapshot.siteGrants,
		},
	);
	check(applyError);
	if (applied === false) return;
	await processUpgradeRefunds({
		db,
		sdk,
		customerId: customer.id,
		environment: environment(),
		organizationId: billingConfig().POLAR_ORGANIZATION_ID!,
		state,
		orders,
		subscriptions,
		checkouts: checkouts || [],
		entries,
	});
	for (const sub of snapshot.subscriptions) {
		if (
			sub.cadence === "monthly" &&
			sub.status === "active" &&
			(!siteBillingPlugins.includes(sub.plugin_slug) || sub.site_id)
		) {
			const subSite = sub.site_id;
			const upgraded = snapshot.subscriptions.some(
				(s) =>
					s.plugin_slug === sub.plugin_slug &&
					s.id !== sub.id &&
					s.cadence === "yearly" &&
					s.status === "active" &&
					Date.parse(s.current_period_end) > Date.now() &&
					s.site_id === subSite,
			);
			if (upgraded) {
				try {
					await sdk.subscriptions.revoke(sub.id);
				} catch {
					/* Obsolete subscription revoked */
				}
			}
		}
	}
}
export async function webhook(request: Request) {
	const secret = billingConfig().POLAR_WEBHOOK_SECRET;
	if (!secret) throw new BillingError("Webhook is not configured.");
	const raw = await request.text();
	if (Buffer.byteLength(raw) > 1_000_000)
		throw new BillingError("Payload too large.", 413);
	let event: Awaited<ReturnType<typeof webhooks.validateEvent>>;
	try {
		event = await webhooks.validateEvent(
			raw,
			Object.fromEntries(request.headers),
			secret,
		);
	} catch (error) {
		if (error instanceof webhooks.PolarWebhookUnknownTypeError) return;
		throw new BillingError("Invalid webhook signature or event.", 403);
	}
	const eventId = request.headers.get("webhook-id");
	if (!eventId) throw new BillingError("Missing event identifier.", 400);
	const db = database();
	const env = environment();
	const { error } = await db
		.from("billing_webhook_events")
		.upsert(
			{
				environment: env,
				event_id: eventId,
				event_type: event.type,
				payload: JSON.parse(raw),
			},
			{ onConflict: "environment,event_id", ignoreDuplicates: true },
		);
	check(error);
	await processEvent(eventId);
    // The outbox survives SMTP errors; the notification worker retries leased messages.
    if(event.type==='order.paid') { try { await flushTeamEvents(); } catch { /* Scheduled worker retries. */ } }

}
export async function processEvent(eventId: string) {
	const db = database();
	const { data: event, error } = await db
		.from("billing_webhook_events")
		.select("*")
		.eq("environment", environment())
		.eq("event_id", eventId)
		.single();
	check(error);
	if (!event || event.status === "processed") return;
	const { error: attemptError } = await db
		.from("billing_webhook_events")
		.update({ attempts: event.attempts + 1 })
		.eq("environment", environment())
		.eq("event_id", eventId);
	check(attemptError);
	const payload = event.payload as {
		type: string;
		data: {
			id?: string;
			customer_id?: string;
			order_id?: string;
			customer?: { id?: string };
		};
	};
	const type = payload.type;
	// All relevant events trigger a fresh authoritative customer snapshot, not a stale event patch.
	const relevant = [
		"customer.",
		"order.",
		"subscription.",
		"benefit_grant.",
		"refund.",
	].some((prefix) => type.startsWith(prefix));
	let polarCustomerId = type.startsWith("customer.")
		? payload.data.id
		: payload.data.customer_id || payload.data.customer?.id;
	if (type.startsWith("refund.") && !polarCustomerId && payload.data.order_id)
		polarCustomerId = (await polar().orders.get(payload.data.order_id))
			.customer_id;
	if (type === "customer.deleted" && polarCustomerId) {
		const { data: known, error: e } = await db
			.from("billing_customers")
			.select("id")
			.eq("polar_customer_id", polarCustomerId)
			.eq("environment", environment())
			.maybeSingle();
		check(e);
		if (known) {
			const { error: revokeError } = await db.rpc(
				"billing_apply_site_snapshot",
				{
					p_customer: known.id,
					p_started: new Date().toISOString(),
					p_polar_id: polarCustomerId,
					p_grants: [],
					p_orders: [],
					p_subscriptions: [],
					p_site_grants: [],
				},
			);
			check(revokeError);
		}
	} else if (relevant && polarCustomerId) {
		const customer = await polar().customers.get(polarCustomerId);
		if (customer.organization_id !== billingConfig().POLAR_ORGANIZATION_ID)
			throw new BillingError("Webhook organization mismatch.");
		if (customer.external_id) {
			const { data: known, error: e } = await db
				.from("billing_customers")
				.select("id,polar_customer_id")
				.eq("id", customer.external_id)
				.eq("environment", environment())
				.maybeSingle();
			check(e);
			if (known) {
				if (known.polar_customer_id && known.polar_customer_id !== customer.id)
					throw new BillingError("Webhook customer mismatch.");
				const { error: updateError } = await db
					.from("billing_customers")
					.update({ polar_customer_id: customer.id })
					.eq("id", known.id);
				check(updateError);
				await synchronize(known.id);
			}
		}
	}
  if (type === 'order.paid') {
    const paid = event.payload.data as { id?: string; checkout_id?: string; customer_id?: string; total_amount?: number; currency?: string; customer?: { email?: string; id?: string } };
    const { data: binding, error: bindingError } = await db.from('billing_checkouts').select('plugin_slug,customer_id').eq('environment',environment()).eq('polar_checkout_id',paid.checkout_id || '').maybeSingle();
    check(bindingError);
    if (binding?.plugin_slug === 'frame-drop') {
      const { data: account, error: accountError } = await db.from('billing_customers').select('email,polar_customer_id').eq('environment',environment()).eq('id',binding.customer_id).maybeSingle();
      check(accountError);
      if (!account?.email || account.polar_customer_id !== (paid.customer_id || paid.customer?.id) || !paid.id) throw new BillingError('Purchase notification account mismatch.');
      const mail = await loadManagedMail();
      await queueFrameDropPurchase({orderId:paid.id,environment:environment(),email:account.email,teamEmail:mail.teamEmail || '',amount:paid.total_amount,currency:paid.currency});
    } else if (binding && paid.customer?.email) {
      await sendTeamEvent('purchase',binding.plugin_slug,paid.customer.email,environment()+':'+(paid.id || eventId));
    }
  }

	const { error: done } = await db
		.from("billing_webhook_events")
		.update({
			status: "processed",
			processed_at: new Date().toISOString(),
			attempts: event.attempts + 1,
		})
		.eq("environment", environment())
		.eq("event_id", eventId);
	check(done);
}
export function cronAuthorized(request: Request) {
	const secrets = [process.env.BILLING_CRON_SECRET, process.env.CRON_SECRET].filter((value): value is string => Boolean(value));
	const received = request.headers.get("authorization") || "";
	return secrets.some(secret => {
        const a = Buffer.from(`Bearer ${secret}`), b = Buffer.from(received);
        return a.length === b.length && timingSafeEqual(a, b);
    });
}
