import "server-only";
import type { createPolar } from "@polar-sh/sdk/2026-10";

/** Server-only snapshot: complete provider lists scoped to customer AND organization,
 * plus server-loaded checkout bindings and current/historical catalog entries.
 * Only NEW policy-v1 upgrades qualify, never historical Lifetime purchases.
 * Apply Lifetime entitlements first; replay this outbox on webhook/cron retries.
 */
type Environment = "sandbox" | "production";
type SDK = ReturnType<typeof createPolar>;
type Owner = {
	customer_id: string;
	customer?: { organization_id: string };
	organization_id?: string;
};
export interface UpgradeOrder extends Owner {
	id: string;
	product_id: string | null;
	checkout_id: string | null;
	subscription_id: string | null;
	status: string;
	paid?: boolean;
	created_at: string;
	paid_at?: string | null;
	net_amount: number;
	subtotal_amount: number;
	discount_amount: number;
	refunded_amount: number;
	refundable_amount: number;
	currency: string;
	applied_balance_amount?: number;
}
export interface UpgradeSubscription extends Owner {
	id: string;
	product_id: string;
	status: string;
	cancel_at_period_end?: boolean;
	current_period_start?: string | null;
	current_period_end?: string | null;
}
export interface UpgradeCheckout {
	id: string;
	customer_id: string;
	environment: string;
	plugin_slug: string;
	cadence: string;
	product_id: string;
	polar_checkout_id: string | null;
	site_id?: string | null;
	created_at: string;
	previous_subscription_id?: string | null;
	upgrade_policy_version?: number | null;
	upgrade_to?: string | null;
	upgrade_period_start?: string | null;
	upgrade_period_end?: string | null;
}
export interface UpgradeRefundContext {
	db: {
		rpc(
			name: string,
			args: Record<string, unknown>,
		): PromiseLike<{ data: unknown; error: unknown }>;
	};
	sdk: {
		refunds: Pick<SDK["refunds"], "list" | "create">;
		subscriptions: Pick<SDK["subscriptions"], "get" | "update">;
		orders: Pick<SDK["orders"], "get">;
	};
	customerId: string;
	environment: Environment;
	organizationId: string;
	state: { id: string; organization_id: string; deleted_at?: string | null };
	orders: UpgradeOrder[];
	subscriptions: UpgradeSubscription[];
	checkouts: UpgradeCheckout[];
	entries: {
		environment: string;
		product_id: string;
		plugin_slug: string;
		cadence: string;
	}[];
}
interface Candidate {
	checkout_id: string;
	polar_checkout_id: string;
	lifetime_order_id: string;
	lifetime_product_id: string;
	subscription_id: string;
	order_id: string | null;
	product_id: string | null;
	plugin_slug: string;
	site_id: string | null;
	period_start: string | null;
	period_end: string | null;
	purchased_at: string;
	amount: number;
	net_amount: number;
	refunded_amount: number;
	currency: string;
	customer_id: string;
	organization_id: string;
	review_reason?: string | null;
	scope_verified?: boolean;
}
type Phase =
	| "ready"
	| "creating"
	| "recovering"
	| "pending"
	| "accepted"
	| "done"
	| "manual_review";
type Renewal = "pending" | "renewal_stopped" | "manual_review";
interface Job {
	id: string;
	claim_token: string;
	phase: Phase;
	attempts: number;
	payload: Candidate;
	provider_refund_id?: string;
	renewal_status: Renewal;
	renewal_attempts: number;
	refund_claimed: boolean;
	renewal_claimed: boolean;
	reconciliation_required: boolean;
}
export interface UpgradeRefundReport {
	completed: string[];
	manualReview: string[];
	skipped: string[];
}
const money = (n: unknown): n is number =>
	typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
const time = (s: string | null | undefined) => (s ? Date.parse(s) : NaN);
const commerce = (p: string) =>
	p === "whatsapp-commerce" || p === "telegram-commerce" || p === "frame-drop";
function owned(row: Owner, c: UpgradeRefundContext) {
	return (
		row.customer_id === c.state.id &&
		(row.organization_id ?? row.customer?.organization_id) === c.organizationId
	);
}
function validMoney(o: UpgradeOrder) {
	return (
		[
			o.net_amount,
			o.subtotal_amount,
			o.discount_amount,
			o.refunded_amount,
			o.refundable_amount,
		].every(money) &&
		o.discount_amount <= o.subtotal_amount &&
		o.net_amount === o.subtotal_amount - o.discount_amount &&
		// Balance-funded invoices require an explicit cash-accounting policy.
		(o.applied_balance_amount ?? 0) === 0
	);
}
/** Integer minor units, rounded DOWN without floating-point multiplication overflow. */
export function unusedUpgradeAmount(
	net: number,
	start: number,
	end: number,
	purchase: number,
	remaining: number,
) {
	if (
		![net, remaining].every(money) ||
		![start, end, purchase].every(Number.isSafeInteger) ||
		end <= start ||
		purchase < start ||
		purchase >= end
	)
		return 0;
	return Math.min(
		remaining,
		Number(
			(BigInt(net) * (BigInt(end) - BigInt(purchase))) /
				(BigInt(end) - BigInt(start)),
		),
	);
}
function candidates(
	c: UpgradeRefundContext,
	report: UpgradeRefundReport,
): Candidate[] {
	const result: Candidate[] = [];
	for (const lifetime of c.orders) {
		if (
			lifetime.status !== "paid" ||
			lifetime.paid === false ||
			!owned(lifetime, c) ||
			lifetime.subscription_id ||
			lifetime.refunded_amount !== 0
		)
			continue;
		const entry = c.entries.find(
			(e) =>
				e.environment === c.environment &&
				e.product_id === lifetime.product_id &&
				e.cadence === "lifetime",
		);
		if (!entry) continue;
		const bindings = c.checkouts.filter(
			(b) =>
				b.polar_checkout_id === lifetime.checkout_id &&
				b.customer_id === c.customerId &&
				b.environment === c.environment &&
				b.product_id === lifetime.product_id &&
				b.plugin_slug === entry.plugin_slug &&
				b.cadence === "lifetime" &&
				b.upgrade_policy_version === 1 &&
				b.upgrade_to === "lifetime" &&
				b.previous_subscription_id,
		);
		if (bindings.length !== 1) {
			report.skipped.push(lifetime.id);
			continue;
		}
		const b = bindings[0],
			purchase = time(lifetime.paid_at ?? lifetime.created_at),
			start = time(b.upgrade_period_start),
			end = time(b.upgrade_period_end);
		if (
			!Number.isSafeInteger(purchase) ||
			!(time(b.created_at) <= purchase) ||
			(commerce(entry.plugin_slug) && !b.site_id)
		) {
			report.skipped.push(lifetime.id);
			continue;
		}
		const sub = c.subscriptions.find(
			(s) => s.id === b.previous_subscription_id && owned(s, c),
		);
		const originalEntry =
			sub &&
			c.entries.find(
				(e) =>
					e.environment === c.environment &&
					e.product_id === sub.product_id &&
					e.plugin_slug === entry.plugin_slug &&
					["monthly", "yearly"].includes(e.cadence),
			);
		const scopeVerified =
			!commerce(entry.plugin_slug) ||
			!!(
				sub &&
				originalEntry &&
				c.checkouts.some(
					(x) =>
						x.customer_id === c.customerId &&
						x.environment === c.environment &&
						x.plugin_slug === entry.plugin_slug &&
						x.cadence === originalEntry.cadence &&
						x.product_id === sub.product_id &&
						x.site_id === b.site_id &&
						c.orders.some(
							(o) =>
								owned(o, c) &&
								o.subscription_id === sub.id &&
								o.checkout_id === x.polar_checkout_id &&
								o.product_id === sub.product_id,
						),
				)
			);
		let review: string | null = null;
		// CheckoutCreate has no expiry. Do not guess a rollover from the original period or
		// silently lose cancellation: expired/missing periods get financial review instead.
		// This deliberately chooses manual review rather than accepting client-supplied periods.
		if (!(start <= purchase && purchase < end))
			review =
				"Purchase outside frozen checkout period; reconcile renewal-period invoice";
		else if (!sub || !originalEntry)
			review =
				"Original subscription snapshot unavailable or outside catalog scope";
		const paid =
			sub && originalEntry
				? c.orders.filter(
						(o) =>
							owned(o, c) &&
							o.subscription_id === sub.id &&
							o.product_id === sub.product_id &&
							["paid", "partially_refunded"].includes(o.status) &&
							o.paid !== false &&
							time(o.created_at) >= start &&
							time(o.created_at) <= purchase &&
							o.currency === lifetime.currency &&
							validMoney(o),
					)
				: [];
		if (paid.length !== 1)
			review ??= "No unique eligible paid invoice in purchase period";
		const order = paid.length === 1 ? paid[0] : undefined;
		const remaining = order
			? Math.min(
					order.refundable_amount,
					Math.max(0, order.net_amount - order.refunded_amount),
				)
			: 0;
		const amount =
			order && !review
				? unusedUpgradeAmount(order.net_amount, start, end, purchase, remaining)
				: 0;
		result.push({
			checkout_id: b.id,
			polar_checkout_id: b.polar_checkout_id!,
			lifetime_order_id: lifetime.id,
			lifetime_product_id: b.product_id,
			subscription_id: b.previous_subscription_id!,
			order_id: order?.id ?? null,
			product_id: originalEntry?.product_id ?? null,
			plugin_slug: entry.plugin_slug,
			site_id: b.site_id ?? null,
			period_start: b.upgrade_period_start ?? null,
			period_end: b.upgrade_period_end ?? null,
			purchased_at: new Date(purchase).toISOString(),
			amount,
			net_amount: order?.net_amount ?? 0,
			refunded_amount: order?.refunded_amount ?? 0,
			currency: order?.currency ?? lifetime.currency,
			customer_id: c.state.id,
			organization_id: c.organizationId,
			review_reason: review,
			scope_verified: scopeVerified,
		});
	}
	return result;
}
async function rpc(
	c: UpgradeRefundContext,
	name: string,
	args: Record<string, unknown>,
) {
	const r = await c.db.rpc(name, args);
	if (r.error)
		throw new Error(`Upgrade refund database failure: ${name}`, {
			cause: r.error,
		});
	return r.data;
}
async function save(
	c: UpgradeRefundContext,
	j: Job,
	phase: Phase,
	patch: Record<string, unknown> = {},
	release = false,
) {
	const ok = await rpc(c, "billing_finish_upgrade_refund", {
		p_id: j.id,
		p_token: j.claim_token,
		p_phase: phase,
		p_patch: patch,
		p_release: release,
	});
	if (ok !== true)
		throw new Error("Upgrade refund claim lost; retry reconciliation");
	j.phase = phase;
	if (patch.renewal_status) j.renewal_status = patch.renewal_status as Renewal;
	if (patch.reconciliation_required) j.reconciliation_required = true;
	if (patch.settlement_observed) {
		j.refund_claimed = false;
		j.attempts--;
	}
}
function validLifetime(c: UpgradeRefundContext, j: Job, o: UpgradeOrder) {
	return (
		o.id === j.payload.lifetime_order_id &&
		owned(o, c) &&
		o.customer_id === j.payload.customer_id &&
		o.status === "paid" &&
		o.paid === true &&
		o.refunded_amount === 0 &&
		!o.subscription_id &&
		o.product_id === j.payload.lifetime_product_id &&
		o.checkout_id === j.payload.polar_checkout_id &&
		time(o.paid_at ?? o.created_at) === time(j.payload.purchased_at)
	);
}
async function validateLifetime(c: UpgradeRefundContext, j: Job) {
	const o = await c.sdk.orders.get(j.payload.lifetime_order_id, {
		timeout: 20,
	});
	if (
		j.payload.organization_id !== c.organizationId ||
		!validLifetime(c, j, o)
	) {
		await reconcile(
			c,
			j,
			"Lifetime order reversed, unpaid, or identity/binding changed",
		);
		return false;
	}
	return true;
}
async function reconcile(c: UpgradeRefundContext, j: Job, reason: string) {
	// Preserve ambiguous financial intent for operator recovery. Never reset it to ready.
	await save(c, j, j.phase === "ready" ? "manual_review" : j.phase, {
		reconciliation_required: true,
		reconciliation_reason: reason,
	});
}
async function stopRenewals(c: UpgradeRefundContext, j: Job) {
	const sub = await c.sdk.subscriptions.get(j.payload.subscription_id, {
		timeout: 20,
	});
	const entry = c.entries.find(
		(e) =>
			e.environment === c.environment &&
			e.product_id === sub.product_id &&
			e.plugin_slug === j.payload.plugin_slug &&
			["monthly", "yearly"].includes(e.cadence),
	);
	if (
		sub.id !== j.payload.subscription_id ||
		!owned(sub, c) ||
		!entry ||
		(j.payload.product_id && sub.product_id !== j.payload.product_id) ||
		(commerce(j.payload.plugin_slug) && j.payload.scope_verified === false)
	) {
		await reconcile(
			c,
			j,
			"Original subscription ownership, product, or site requires reconciliation",
		);
		return;
	}
	// Revalidate immediately before the external action, not just from an old ready snapshot.
	if (!(await validateLifetime(c, j))) return;
	// Fence the claim again after provider reads, before any cancellation side effect.
	await save(c, j, j.phase);
	const stopped =
		sub.status === "canceled" || sub.cancel_at_period_end
			? sub
			: await c.sdk.subscriptions.update(
					j.payload.subscription_id,
					{ cancel_at_period_end: true },
					{ timeout: 20 },
				);
	if (
		stopped.id !== j.payload.subscription_id ||
		!owned(stopped, c) ||
		(!stopped.cancel_at_period_end && stopped.status !== "canceled")
	) {
		throw new Error(
			"Provider did not confirm subscription renewal cancellation",
		);
	}
	await save(c, j, j.phase, {
		renewal_status: "renewal_stopped",
		renewal_error: null,
	});
}
async function listRefunds(c: UpgradeRefundContext, j: Job) {
	const items: Awaited<ReturnType<SDK["refunds"]["list"]>>["items"] = [];
	for (let page = 1; page <= 100; page++) {
		const r = await c.sdk.refunds.list(
			{
				order_id: j.payload.order_id!,
				organization_id: c.organizationId,
				customer_id: c.state.id,
				page,
				limit: 100,
			},
			{ timeout: 20 },
		);
		if (
			!Array.isArray(r.items) ||
			!Number.isSafeInteger(r.pagination?.max_page) ||
			r.pagination.max_page > 100
		)
			throw new Error("Incomplete refund pagination");
		for (const item of r.items) {
			if (
				item.order_id !== j.payload.order_id ||
				item.customer_id !== c.state.id ||
				item.organization_id !== c.organizationId
			)
				throw new Error("Refund ownership mismatch");
			items.push(item);
		}
		if (page >= r.pagination.max_page) return items;
	}
	throw new Error("Refund pagination limit");
}
function matches(j: Job, r: Awaited<ReturnType<SDK["refunds"]["create"]>>) {
	return (
		r.order_id === j.payload.order_id &&
		r.customer_id === j.payload.customer_id &&
		r.organization_id === j.payload.organization_id &&
		r.amount === j.payload.amount &&
		r.currency === j.payload.currency &&
		(!j.provider_refund_id || r.id === j.provider_refund_id) &&
		r.metadata?.qubtic_upgrade_refund === j.id
	);
}
async function financial(c: UpgradeRefundContext, j: Job) {
	const manual = async (reason: string) => {
		await save(c, j, "manual_review", { error: reason });
	};
	if (j.phase === "accepted") {
		await save(c, j, "done");
		return;
	}
	if (j.phase === "ready" && j.payload.review_reason) {
		await manual(j.payload.review_reason);
		return;
	}
	if (j.phase === "ready" && j.payload.amount === 0) {
		await save(c, j, "done");
		return;
	}
	const refunds = await listRefunds(c, j);
	const found = refunds.filter(
		(r) => r.metadata?.qubtic_upgrade_refund === j.id,
	);
	if (found.length > 1) {
		await manual("Duplicate provider refund key");
		return;
	}
	let refund = found[0];
	if (!refund && j.phase !== "ready") {
		await manual(
			"Ambiguous create: no matching provider refund; do not recreate",
		);
		return;
	}
	if (!refund) {
		const fresh = await c.sdk.orders.get(j.payload.order_id!, { timeout: 20 });
		if (
			!owned(fresh, c) ||
			fresh.id !== j.payload.order_id ||
			fresh.subscription_id !== j.payload.subscription_id ||
			fresh.product_id !== j.payload.product_id ||
			fresh.currency !== j.payload.currency ||
			!validMoney(fresh) ||
			!fresh.paid ||
			!["paid", "partially_refunded"].includes(fresh.status) ||
			fresh.net_amount !== j.payload.net_amount
		) {
			await manual("Original order changed");
			return;
		}
		let reserved = 0;
		for (const r of refunds) {
			if (
				!["pending", "succeeded", "failed", "canceled"].includes(r.status) ||
				!money(r.amount)
			) {
				await manual("Unknown provider refund accounting");
				return;
			}
			if (r.status === "pending" || r.status === "succeeded")
				reserved += r.amount;
		}
		if (!money(reserved)) {
			await manual("Invalid refund totals");
			return;
		}
		const remaining = Math.min(
			fresh.refundable_amount,
			Math.max(0, fresh.net_amount - Math.max(fresh.refunded_amount, reserved)),
		);
		const amount = Math.min(j.payload.amount, remaining);
		if (!amount) {
			await manual("No eligible cash remaining");
			return;
		}
		if (!(await validateLifetime(c, j))) return;
		j.payload.amount = amount;
		await save(c, j, "creating", { payload: { amount } });
		// SDK 1.0.2 performs one fetch, no transport retries. Injected transports MUST be single-shot.
		// After any ambiguity this phase can ONLY recover by list metadata, never create again.
		refund = await c.sdk.refunds.create(
			{
				order_id: j.payload.order_id!,
				amount,
				reason: "other",
				comment: "Unused subscription time on Lifetime upgrade (policy v1)",
				metadata: { qubtic_upgrade_refund: j.id },
			},
			{ timeout: 20 },
		);
	}
	if (!matches(j, refund)) {
		await manual("Provider refund identity or amount mismatch");
		return;
	}
	if (refund.status === "pending") {
		await save(c, j, "pending", {
			provider_refund_id: refund.id,
			settlement_observed: true,
		});
		return;
	}
	if (refund.status !== "succeeded") {
		await manual(`Provider refund status: ${refund.status}`);
		return;
	}
	await save(c, j, "accepted", { provider_refund_id: refund.id });
	await save(c, j, "done");
}
async function run(
	c: UpgradeRefundContext,
	j: Job,
	report: UpgradeRefundReport,
) {
	let failure: unknown;
	// A failed Lifetime read must not authorize either action. Each independently claimed
	// branch retains its own failure reservation; a later cancellation is never gated on finance.
	try {
		if (!(await validateLifetime(c, j))) {
			await save(c, j, j.phase, {}, true);
			report.manualReview.push(j.id);
			return;
		}
	} catch (error) {
		const patch: Record<string, unknown> = {
			error: error instanceof Error ? error.message : "Lifetime read failed",
		};
		if (j.renewal_claimed) {
			patch.renewal_status =
				j.renewal_attempts >= 5 ? "manual_review" : "pending";
			patch.renewal_error = patch.error;
		}
		await save(
			c,
			j,
			j.refund_claimed && j.attempts >= 5 ? "manual_review" : j.phase,
			patch,
			true,
		);
		throw error;
	}
	if (j.renewal_claimed) {
		try {
			await stopRenewals(c, j);
		} catch (error) {
			failure = error;
			await save(c, j, j.phase, {
				renewal_status: j.renewal_attempts >= 5 ? "manual_review" : "pending",
				renewal_error:
					error instanceof Error ? error.message : "Cancellation failed",
			});
		}
	}
	if (j.refund_claimed && !j.reconciliation_required) {
		try {
			await financial(c, j);
		} catch (error) {
			failure ??= error;
			await save(
				c,
				j,
				j.attempts >= 5
					? "manual_review"
					: j.phase === "creating"
						? "recovering"
						: j.phase,
				{
					error:
						error instanceof Error
							? error.message
							: "Provider operation failed",
				},
			);
		}
	}
	await save(c, j, j.phase, {}, true);
	if (
		j.phase === "manual_review" ||
		j.renewal_status === "manual_review" ||
		j.reconciliation_required
	)
		report.manualReview.push(j.id);
	if (
		j.phase === "done" &&
		j.renewal_status === "renewal_stopped" &&
		!j.reconciliation_required
	)
		report.completed.push(j.id);
	if (failure) throw failure;
	if (
		!j.reconciliation_required &&
		(j.phase === "pending" || j.renewal_status === "pending")
	) {
		throw new Error(
			"Upgrade refund pending provider settlement or renewal cancellation; retry when due",
		);
	}
}
/** Durable ledger IDs in completed/manualReview; skipped contains unbound Lifetime order IDs.
 * One job per invocation, bounded provider pagination/timeouts. Pending financial settlement
 * polls every 15 minutes without consuming failures. Cancellation retries independently after
 * 30 seconds, even in financial manual_review. Each failure budget is capped at five.
 * Invalid/reversed Lifetime orders freeze BOTH workflows for reconciliation, not auto reversal.
 */
export async function processUpgradeRefunds(
	c: UpgradeRefundContext,
): Promise<UpgradeRefundReport> {
	if (
		!c.customerId ||
		!c.state.id ||
		c.state.organization_id !== c.organizationId ||
		c.state.deleted_at ||
		!["sandbox", "production"].includes(c.environment)
	)
		throw new Error("Invalid upgrade refund customer context");
	const report: UpgradeRefundReport = {
		completed: [],
		manualReview: [],
		skipped: [],
	};
	const claimed = (await rpc(c, "billing_claim_upgrade_refunds", {
		p_customer: c.customerId,
		p_environment: c.environment,
		p_candidates: candidates(c, report),
	})) as {
		jobs: Job[];
		blocked: number;
		manual_review?: string[];
	};
	report.manualReview.push(...(claimed.manual_review ?? []));
	for (const job of claimed.jobs) await run(c, job, report);
	report.manualReview = [...new Set(report.manualReview)];
	if (claimed.blocked)
		throw new Error(
			"Upgrade refund work leased or awaiting retry; keep webhook pending",
		);
	return report;
}
