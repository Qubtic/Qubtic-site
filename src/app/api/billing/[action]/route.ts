import { billingSiteUrl, PLUGINS } from "@/lib/billing/config.mjs";
import { resolveCheckoutDiscount } from "@/lib/billing/discounts";
import { quotePlan } from "@/lib/billing/pricing";
import {
	actor,
	billingConfig,
	billingRequest,
	BillingError,
	billingHeaders,
	catalog,
	check,
	cronAuthorized,
	database,
	environment,
	identity,
	limit,
	paidAccess,
	paidOrder,
	polar,
	processEvent,
	safePolarUrl,
	siteId,
	synchronize,
	webhook,
	type Cadence,
} from "@/lib/billing/core";
import { randomUUID } from "node:crypto";
export const runtime = "nodejs";
export const maxDuration = 60;
type Context = { params: Promise<{ action: string }> };
function reply(body: unknown, status = 200) {
	return Response.json(body, { status, headers: billingHeaders });
}
function configuredDiscount(plugin: string) {
	const plugins = JSON.parse(billingConfig().MANAGED_PLUGINS || "[]") as {
		slug: string;
		discount?: unknown;
	}[];
	return plugins.find((item) => item.slug === plugin)?.discount;
}
async function handle(request: Request, { params }: Context) {
	if (request.method === "OPTIONS")
		return new Response(null, { status: 204, headers: billingHeaders });
	const { action } = await params;
	try {
		if (action === "webhook" && request.method === "POST") {
			await webhook(request);
			return reply({ received: true }, 202);
		}
		const db = database();
		const env = environment();
		if (action === "resolve" && request.method === "GET") {
			const urlObj = new URL(request.url);
			const channel = urlObj.searchParams.get("channel") || "";
			if (!/^[0-9a-f-]{36}$/i.test(channel))
				throw new BillingError("Invalid channel.", 400);
			await limit(`resolve:${channel}`, 30, 60);
			const { data: checkout, error } = await db
				.from("billing_checkouts")
				.select("checkout_url,status,expires_at")
				.eq("environment", env)
				.eq("request_key", channel)
				.maybeSingle();
			check(error);
			if (!checkout)
				return reply({ error: "No checkout exists for this link yet." }, 404);
			if (
				checkout.status === "open" &&
				checkout.checkout_url &&
				Date.parse(checkout.expires_at) > Date.now()
			) {
				return reply({ url: safePolarUrl(checkout.checkout_url) });
			}
			if (
				checkout.status === "creating" &&
				(!checkout.expires_at || Date.parse(checkout.expires_at) > Date.now())
			)
				return reply({ pending: true }, 202);
			throw new BillingError("Checkout is expired or unavailable.", 410);
		}
		if (action === "reconcile" && ["GET", "POST"].includes(request.method)) {
			if (!cronAuthorized(request))
				throw new BillingError("Unauthorized.", 401);
			// Bounded durable batches; oldest snapshots first. Failed events remain pending.
			const { data: events, error } = await db
				.from("billing_webhook_events")
				.select("event_id")
				.eq("environment", env)
				.eq("status", "pending")
				.lt("attempts", 20)
				.order("created_at")
				.limit(10);
			check(error);
			let failed = 0;
			for (const item of events || []) {
				try {
					await processEvent(item.event_id);
				} catch {
					failed++;
				}
			}
			const { data: customers, error: e } = await db
				.from("billing_customers")
				.select("id")
				.eq("environment", env)
				.not("polar_customer_id", "is", null)
				.order("last_attempted_at", { nullsFirst: true })
				.limit(10);
			check(e);
			for (const item of customers || []) {
				try {
					await synchronize(item.id);
				} catch {
					failed++;
				}
			}
			const { data: pending, error: pendingError } = await db
				.from("billing_checkouts")
				.select("customer_id")
				.eq("environment", env)
				.in("status", ["creating", "open"])
				.gt("expires_at", new Date().toISOString())
				.order("last_checked_at", { nullsFirst: true })
				.limit(10);
			check(pendingError);
			for (const id of new Set((pending || []).map((row) => row.customer_id))) {
				try {
					await synchronize(id);
				} catch {
					failed++;
				}
			}
			return reply(
				{
					processed: (events || []).length,
					reconciled: (customers || []).length,
					failed,
				},
				failed ? 503 : 200,
			);
		}
		const publicCatalog =
			action === "catalog" &&
			request.method === "GET" &&
			!request.headers.has("authorization");
		let plugin: string;
		if (publicCatalog) {
			// Prices are public in both environments; purchases and account data still require actor().
			const ip = (request.headers.get("x-forwarded-for") || "unknown")
				.split(",")[0]
				.trim();
			await limit(`catalog:${ip}`, 30, 60);
			const values = new URL(request.url).searchParams.getAll("plugin");
			if (
				values.length !== 1 ||
				!PLUGINS.some((item) => item.slug === values[0])
			)
				throw new BillingError("Provide a valid plugin query.", 400);
			plugin = values[0];
		} else {
			const user = await actor(request);
			await limit(`api:${user.id}`);
			plugin = user.plugin;
		}
		if (action === "catalog" && request.method === "GET")
			return catalogReply(plugin);
		const user = await actor(request);
		if (action === "manifest" && request.method === "GET") {
			const plugins = JSON.parse(billingConfig().MANAGED_PLUGINS || "[]");
			const plugin = plugins.find(
				(p: { slug: string }) => p.slug === user.plugin,
			);
			return reply({
				plugin: user.plugin,
				name: plugin?.name || user.plugin,
				logo: plugin?.logo || null,
				brandColor: plugin?.brandColor || null,
				manifest: JSON.parse(plugin?.manifest || "{}"),
			});
		}
		async function catalogReply(plugin: string) {
			const rows = (await catalog()).filter(
				(row) => row.plugin_slug === plugin,
			);
			const sdk = polar();
			const plans = await Promise.all(
				rows.map(async (row) => {
					try {
						return {
							cadence: row.cadence,
							...(await quotePlan(
								sdk,
								row,
								configuredDiscount(plugin),
								billingConfig().POLAR_ORGANIZATION_ID!,
							)),
						};
					} catch (error) {
						return {
							cadence: row.cadence,
							available: false,
							error:
								error instanceof Error && !("statusCode" in error)
									? error.message
									: "Unable to load the Polar price. Refresh billing to try again.",
						};
					}
				}),
			);
			return reply({ plans });
		}
		const customerId = await identity(user.id);
		const siteScoped =
			user.plugin === "whatsapp-commerce" ||
			user.plugin === "telegram-commerce";
		const site = siteScoped
			? siteId(request.headers.get("x-framer-site-id"))
			: null;
		if (action === "status" && request.method === "GET") {
			const orderQuery = db
				.from("billing_orders")
				.select(
					"polar_order_id,cadence,status,amount,subtotal_amount,discount_amount,discount_id,refunded_amount,currency,purchased_at,site_id,customer_id",
				)
				.eq("environment", env)
				.eq("plugin_slug", user.plugin)
				.order("purchased_at", { ascending: false })
				.limit(100);
			const { data: orders, error } = await (siteScoped && site
				? orderQuery.eq("site_id", site)
				: orderQuery.eq("customer_id", customerId));
			check(error);
			const subscriptionQuery = db
				.from("billing_subscriptions")
				.select(
					"cadence,status,current_period_end,cancel_at_period_end,site_id,customer_id",
				)
				.eq("environment", env)
				.eq("plugin_slug", user.plugin);
			const { data: subscriptions, error: e } = await (siteScoped && site
				? subscriptionQuery.eq("site_id", site)
				: subscriptionQuery.eq("customer_id", customerId));
			check(e);
			const { data: upgradeRefunds, error: refundError } = await db
				.from("billing_upgrade_refunds")
				.select("id,phase,renewal_status,reconciliation_required,payload")
				.eq("customer_id", customerId)
				.eq("environment", env)
				.eq("payload->>plugin_slug", user.plugin);
			check(refundError);
			let isPro = await paidAccess(user.id, user.plugin, site);
			const hasLife = (orders || []).some(
				(o) =>
					o.cadence === "lifetime" &&
					(!siteScoped || (!!site && o.site_id === site)) &&
					paidOrder(o),
			);
			if (!isPro && siteScoped && site) {
				const hasActiveSub = (subscriptions || []).some(
					(s) =>
						s.status === "active" &&
						Date.parse(s.current_period_end) > Date.now(),
				);
				if (hasLife || hasActiveSub) {
					try {
						await synchronize(customerId);
						isPro = await paidAccess(user.id, user.plugin, site);
					} catch {
						// Graceful fallback
					}
				}
			}
			return reply({
				plugin: user.plugin,
				upgrade_refunds: (upgradeRefunds || [])
					.filter((job) => !site || job.payload?.site_id === site)
					.map((job) => ({
						id: job.id,
						status:
							job.reconciliation_required ||
							job.phase === "manual_review" ||
							job.renewal_status === "manual_review"
								? "manual_review"
								: job.phase === "done" &&
									  job.renewal_status === "renewal_stopped"
									? "completed"
									: "pending",
						amount: job.payload?.amount,
						currency: job.payload?.currency,
					})),
				is_pro: isPro,
				has_lifetime: isPro && hasLife,
				orders: (orders || []).map((o) => ({
					polar_order_id: o.polar_order_id,
					cadence: o.cadence,
					status: o.status,
					amount: o.amount,
					subtotal_amount: o.subtotal_amount,
					discount_amount: o.discount_amount,
					refunded_amount: o.refunded_amount,
					currency: o.currency,
					purchased_at: o.purchased_at,
					site_id: o.site_id,
					is_payer: o.customer_id === customerId,
				})),
				subscriptions: (subscriptions || []).map((s) => ({
					cadence: s.cadence,
					status: s.status,
					current_period_end: s.current_period_end,
					cancel_at_period_end: s.cancel_at_period_end,
					site_id: s.site_id,
					is_payer: s.customer_id === customerId,
				})),
			});
		}
		if (action === "refresh" && request.method === "POST") {
			await limit(`refresh:${user.id}`, 6, 60);
			await synchronize(customerId);
			if (siteScoped && site) {
				const { data: recentSiteCheckouts } = await db
					.from("billing_checkouts")
					.select("customer_id")
					.eq("environment", env)
					.eq("plugin_slug", user.plugin)
					.eq("site_id", site)
					.order("created_at", { ascending: false })
					.limit(3);
				for (const c of recentSiteCheckouts || []) {
					if (c.customer_id && c.customer_id !== customerId) {
						try {
							await synchronize(c.customer_id);
						} catch {}
					}
				}
			}
			return reply({ is_pro: await paidAccess(user.id, user.plugin, site) });
		}
		if (action === "cancel" && request.method === "POST") {
			const raw = await request.text();
			const body = (() => {
				try {
					return JSON.parse(raw);
				} catch {
					return {};
				}
			})() as { cancel_at_period_end?: boolean };
			const cancelAtPeriodEnd = body.cancel_at_period_end !== false;
			const subQuery = db
				.from("billing_subscriptions")
				.select(
					"polar_subscription_id,cadence,status,current_period_end,cancel_at_period_end,customer_id",
				)
				.eq("environment", env)
				.eq("customer_id", customerId)
				.eq("plugin_slug", user.plugin)
				.eq("status", "active");
			const { data: sub, error: subError } = await (
				siteScoped ? subQuery.eq("site_id", site || "") : subQuery
			).maybeSingle();
			check(subError);
			if (!sub)
				throw new BillingError("No active recurring subscription found.", 404);
			try {
				await polar().subscriptions.update(sub.polar_subscription_id, {
					cancel_at_period_end: cancelAtPeriodEnd,
				});
			} catch {
				/* Authoritative state updated by synchronize */
			}
			await synchronize(customerId);
			return reply({
				success: true,
				cancel_at_period_end: cancelAtPeriodEnd,
				current_period_end: sub.current_period_end,
			});
		}
		if (action === "portal" && request.method === "POST") {
			const { data, error } = await db
				.from("billing_customers")
				.select("polar_customer_id")
				.eq("id", customerId)
				.single();
			check(error);
			if (!data?.polar_customer_id)
				throw new BillingError(
					"No purchases are linked to this account yet.",
					409,
				);
			const session = await polar().customerSessions.create({
				customer_id: data.polar_customer_id,
			});
			return reply({ url: safePolarUrl(session.customer_portal_url) });
		}
		if (action === "checkout" && request.method === "POST") {
			if (siteScoped && !site)
				throw new BillingError(
					"Open checkout from the Framer site you want to upgrade.",
					400,
				);
			await limit(`checkout:${user.id}`, 5, 300);
			const raw = await request.text();
			if (Buffer.byteLength(raw) > 4096)
				throw new BillingError("Request too large.", 413);
			const body = (() => {
				try {
					return JSON.parse(raw);
				} catch {
					return null;
				}
			})() as {
				cadence?: Cadence;
				request_id?: string;
				replace_previous?: boolean;
			} | null;
			if (
				!body ||
				(body.cadence &&
					!["monthly", "yearly", "lifetime"].includes(body.cadence)) ||
				!/^[0-9a-f-]{36}$/i.test(body.request_id || "")
			)
				throw new BillingError("Choose a valid billing period.", 400);

			const baseSubQuery = db
				.from("billing_subscriptions")
				.select(
					"polar_subscription_id,cadence,status,current_period_end,cancel_at_period_end,site_id,customer_id",
				)
				.eq("environment", env)
				.eq("plugin_slug", user.plugin)
				.eq("status", "active");
			const baseLifeQuery = db
				.from("billing_orders")
				.select(
					"polar_order_id,cadence,status,amount,subtotal_amount,discount_amount,discount_id,refunded_amount,currency,purchased_at,site_id,customer_id",
				)
				.eq("environment", env)
				.eq("plugin_slug", user.plugin)
				.eq("cadence", "lifetime")
				.in("status", ["paid", "partially_refunded"]);

			const [
				entries,
				alreadyPro,
				existingResult,
				activeSubsResult,
				lifeOrdersResult,
			] = await Promise.all([
				catalog(),
				paidAccess(user.id, user.plugin, site),
				db
					.from("billing_checkouts")
					.select("*")
					.eq("user_id", user.id)
					.eq("request_key", body.request_id)
					.eq("environment", env)
					.maybeSingle(),
				siteScoped && site
					? baseSubQuery.eq("site_id", site)
					: baseSubQuery.eq("customer_id", customerId),
				siteScoped && site
					? baseLifeQuery.eq("site_id", site)
					: baseLifeQuery.eq("customer_id", customerId),
			]);
			check(activeSubsResult.error);
			check(lifeOrdersResult.error);

			const activeSub = (activeSubsResult.data || []).find(
				(s) => Date.parse(s.current_period_end) > Date.now(),
			);
			const hasLifetime = (lifeOrdersResult.data || []).some(paidOrder);

			let isUpgrade = false;
			let upgradeFrom: Cadence | null = null;
			let upgradeTo: Cadence | null = null;

			if (alreadyPro || activeSub || hasLifetime) {
				if (hasLifetime) {
					throw new BillingError(
						"Pro Lifetime is already active for this " +
							(site ? "site" : "account") +
							".",
						409,
					);
				}
				if (activeSub) {
					if (activeSub.cadence === "yearly") {
						if (body.cadence === "lifetime") {
							isUpgrade = true;
							upgradeFrom = "yearly";
							upgradeTo = "lifetime";
						} else {
							throw new BillingError(
								"Pro is already active. Manage billing to change your plan.",
								409,
							);
						}
					} else if (activeSub.cadence === "monthly") {
						if (body.cadence === "yearly") {
							isUpgrade = true;
							upgradeFrom = "monthly";
							upgradeTo = "yearly";
						} else if (body.cadence === "lifetime") {
							isUpgrade = true;
							upgradeFrom = "monthly";
							upgradeTo = "lifetime";
						} else {
							throw new BillingError(
								"Pro is already active. Manage billing to change your plan.",
								409,
							);
						}
					} else {
						throw new BillingError(
							"Pro is already active. Manage billing to change your plan.",
							409,
						);
					}
				} else {
					throw new BillingError(
						"Pro is already active. Manage billing to change your plan.",
						409,
					);
				}
			}

			if (site && !isUpgrade) {
				const { data: hasPurchase, error: purchaseError } = await db.rpc(
					"billing_site_has_purchase",
					{
						p_customer: customerId,
						p_site: site,
						...(user.plugin === "telegram-commerce"
							? { p_plugin: user.plugin }
							: {}),
					},
				);
				check(purchaseError);
				if (hasPurchase === true)
					throw new BillingError(
						"This site already has a Pro purchase. Refresh billing or manage its existing subscription.",
						409,
					);
			}

			const rows = entries.filter((item) => item.plugin_slug === user.plugin);
			const checkoutOrder =
				user.plugin === "telegram-commerce"
					? ["monthly", "yearly", "lifetime"]
					: ["yearly", "monthly", "lifetime"];
			const selectable = checkoutOrder.map((cadence) =>
				rows.find((item) => item.cadence === cadence),
			);
			if (selectable.some((item) => !item))
				throw new BillingError(
					"Pro checkout is not fully configured yet.",
					409,
				);

			// Every checkout is bound to one selected plan; legacy callers default to Lifetime.
			const targetCadence =
				isUpgrade && upgradeTo ? upgradeTo : body.cadence || "lifetime";
			const targetRow =
				rows.find((item) => item.cadence === targetCadence) || selectable[0]!;
			const row = targetRow;

			const { data: existing, error: existingError } = existingResult;
			check(existingError);
			if (existing) {
				if (
					existing.environment !== env ||
					existing.product_id !== targetRow.product_id ||
					(existing.site_id || null) !== site ||
					(isUpgrade &&
						upgradeTo === "lifetime" &&
						(existing.upgrade_policy_version !== 1 ||
							existing.previous_subscription_id !==
								activeSub?.polar_subscription_id))
				)
					throw new BillingError("Checkout request does not match.", 409);
				if (
					existing.status !== "open" ||
					!existing.checkout_url ||
					Date.parse(existing.expires_at) <= Date.now()
				)
					throw new BillingError(
						"This checkout request is already processing or expired. Start a new checkout.",
						409,
					);
			}
			const sdk = polar();
			let refundBinding:
				| {
						previous_subscription_id: string;
						upgrade_policy_version: number;
						upgrade_to: string;
						upgrade_period_start: string;
						upgrade_period_end: string;
				  }
				| undefined;
			if (isUpgrade && upgradeTo === "lifetime" && activeSub) {
				if (activeSub.customer_id !== customerId) {
					throw new BillingError(
						"Only the subscription payer can upgrade this site to Lifetime.",
						403,
					);
				}
				const [{ data: customer, error: customerError }, subscription] =
					await Promise.all([
						db
							.from("billing_customers")
							.select("polar_customer_id")
							.eq("id", customerId)
							.eq("environment", env)
							.single(),
						sdk.subscriptions.get(activeSub.polar_subscription_id),
					]);
				check(customerError);
				const start = Date.parse(subscription.current_period_start);
				const end = Date.parse(subscription.current_period_end || "");
				const original = (await catalog(true)).find(
					(item) =>
						item.product_id === subscription.product_id &&
						item.plugin_slug === user.plugin &&
						item.cadence === activeSub.cadence,
				);
				if (
					!customer?.polar_customer_id ||
					subscription.customer_id !== customer.polar_customer_id ||
					subscription.customer.organization_id !==
						billingConfig().POLAR_ORGANIZATION_ID ||
					subscription.id !== activeSub.polar_subscription_id ||
					subscription.status !== "active" ||
					!original ||
					!Number.isFinite(start) ||
					!Number.isFinite(end) ||
					start > Date.now() ||
					end <= Date.now() ||
					end <= start
				) {
					throw new BillingError(
						"Refresh billing before upgrading this subscription to Lifetime.",
						409,
					);
				}
				refundBinding = {
					previous_subscription_id: subscription.id,
					upgrade_policy_version: 1,
					upgrade_to: "lifetime",
					upgrade_period_start: new Date(start).toISOString(),
					upgrade_period_end: new Date(end).toISOString(),
				};
			}
			await Promise.all(
				selectable.map(async (selected) => {
					const product = await sdk.products.get(selected!.product_id);
					if (
						product.organization_id !== billingConfig().POLAR_ORGANIZATION_ID ||
						product.is_archived ||
						!product.benefits.some((b) => b.id === row.benefit_id)
					)
						throw new BillingError("Plan configuration is invalid.");
					const prices = product.prices.filter((price) => !price.is_archived);
					if (
						!prices.length ||
						prices.some(
							(price) =>
								price.amount_type !== "fixed" ||
								!("price_amount" in price) ||
								typeof price.price_amount !== "number" ||
								price.price_amount <= 0,
						)
					)
						throw new BillingError(
							"Pro requires a configured fixed paid price.",
						);
					if (
						(selected!.cadence === "lifetime" && product.is_recurring) ||
						(selected!.cadence !== "lifetime" &&
							(!product.is_recurring ||
								product.recurring_interval !==
									(selected!.cadence === "monthly" ? "month" : "year")))
					)
						throw new BillingError("Plan billing interval does not match.");
				}),
			);

			let discountId: string | undefined;
			try {
				discountId = await resolveCheckoutDiscount(
					sdk,
					configuredDiscount(user.plugin),
					targetRow.cadence,
					targetRow.product_id,
					billingConfig().POLAR_ORGANIZATION_ID!,
				);
			} catch (error) {
				throw new BillingError(
					error instanceof Error
						? error.message
						: "Unable to validate this plan's discount.",
					409,
				);
			}
			// Calculate prorated discount for Monthly -> Yearly upgrade
			if (
				isUpgrade &&
				upgradeFrom === "monthly" &&
				upgradeTo === "yearly" &&
				activeSub
			) {
				const { data: subOrders, error: subOrdersErr } = await db
					.from("billing_orders")
					.select("amount,refunded_amount,currency,purchased_at")
					.eq("environment", env)
					.eq("customer_id", customerId)
					.eq("subscription_id", activeSub.polar_subscription_id)
					.in("status", ["paid", "partially_refunded"])
					.order("purchased_at", { ascending: false })
					.limit(1);
				check(subOrdersErr);

				let paidAmount = 0;
				let currency = "usd";
				let periodStart = 0;
				if (subOrders && subOrders.length > 0) {
					paidAmount = Math.max(
						0,
						subOrders[0].amount - subOrders[0].refunded_amount,
					);
					currency = subOrders[0].currency || "usd";
					periodStart = Date.parse(subOrders[0].purchased_at);
				} else {
					const monthlyRow = rows.find((r) => r.cadence === "monthly");
					if (monthlyRow) {
						try {
							const mProd = await sdk.products.get(monthlyRow.product_id);
							const mPrice = mProd.prices.find(
								(p) => !p.is_archived && p.amount_type === "fixed",
							);
							if (
								mPrice &&
								"price_amount" in mPrice &&
								typeof mPrice.price_amount === "number"
							) {
								paidAmount = mPrice.price_amount;
								currency =
									"price_currency" in mPrice &&
									typeof mPrice.price_currency === "string"
										? mPrice.price_currency
										: "usd";
							}
						} catch {
							/* Fallback to zero credit */
						}
					}
				}

				const periodEnd = Date.parse(activeSub.current_period_end);
				const remainingMs = Math.max(0, periodEnd - Date.now());
				const defaultCycleMs = 30 * 24 * 60 * 60 * 1000;
				const totalCycleMs =
					periodStart > 0 && periodEnd > periodStart
						? Math.max(defaultCycleMs, periodEnd - periodStart)
						: defaultCycleMs;
				const unusedRatio = Math.min(
					1,
					Math.max(0, remainingMs / totalCycleMs),
				);
				let unusedCreditCents = Math.round(paidAmount * unusedRatio);

				try {
					const yProd = await sdk.products.get(targetRow.product_id);
					const yPrice = yProd.prices.find(
						(p) => !p.is_archived && p.amount_type === "fixed",
					);
					if (
						yPrice &&
						"price_amount" in yPrice &&
						typeof yPrice.price_amount === "number"
					) {
						if (unusedCreditCents >= yPrice.price_amount) {
							unusedCreditCents = Math.max(0, yPrice.price_amount - 100);
						}
					}
				} catch {
					/* Keep unusedCreditCents */
				}

				if (unusedCreditCents > 0) {
					// shortcut: Polar accepts one discount; combined coupon/proration accounting needs a separate policy.
					if (discountId)
						throw new BillingError(
							"This upgrade has unused subscription credit and cannot combine it with the configured promotion. Contact billing support before upgrading.",
							409,
						);
					try {
						const discount = await sdk.discounts.create({
							organization_id: billingConfig().POLAR_ORGANIZATION_ID,
							name: `Prorated Monthly Credit ($${(unusedCreditCents / 100).toFixed(2)})`,
							type: "fixed",
							amount: unusedCreditCents,
							currency: currency.toLowerCase() as any,
							duration: "once",
							products: [targetRow.product_id],
							max_redemptions: 1,
						});
						discountId = discount.id;
					} catch {
						/* Continue without discount if discount creation is not available */
					}
				}
			}

			const { error: expiryError } = await db
				.from("billing_checkouts")
				.update({ status: "expired" })
				.eq("user_id", user.id)
				.eq("environment", env)
				.in("status", ["creating", "open"])
				.lt("expires_at", new Date().toISOString());
			check(expiryError);

			const targetProducts = [row.product_id];

			const openQuery = db
				.from("billing_checkouts")
				.select("*")
				.eq("user_id", user.id)
				.eq("environment", env)
				.in("status", ["creating", "open"]);
			const { data: openCheckout, error: openError } = await (
				siteScoped ? openQuery.eq("site_id", site) : openQuery
			).maybeSingle();
			check(openError);
			if (openCheckout) {
				if (
					!openCheckout.checkout_url ||
					!openCheckout.polar_checkout_id ||
					openCheckout.plugin_slug !== user.plugin
				)
					throw new BillingError(
						"Another checkout is still processing. Please try again shortly.",
						409,
					);
				const previous = await sdk.checkouts.get(
					openCheckout.polar_checkout_id,
				);
				if (previous.status !== "open")
					throw new BillingError(
						"Your previous checkout changed status. Refresh billing before starting another.",
						409,
					);
				const previousProducts = previous.products.map((item) => item.id);
				const available =
					user.plugin === "telegram-commerce"
						? previousProducts.join(",") === targetProducts.join(",")
						: previousProducts.sort().join(",") ===
							targetProducts.slice().sort().join(",");
				const discountMatches =
					(("discount_id" in previous ? previous.discount_id : null) ??
						null) === (discountId ?? null);
				const refundPolicyMatches =
					!refundBinding ||
					(openCheckout.upgrade_policy_version === 1 &&
						openCheckout.previous_subscription_id ===
							refundBinding.previous_subscription_id &&
						Date.parse(openCheckout.upgrade_period_start) ===
							Date.parse(refundBinding.upgrade_period_start) &&
						Date.parse(openCheckout.upgrade_period_end) ===
							Date.parse(refundBinding.upgrade_period_end));
				if (
					available &&
					discountMatches &&
					refundPolicyMatches &&
					body.replace_previous !== true
				) {
					// Rebind the polling fallback to this launch tab when reusing an open checkout.
					const { data: rebound, error: rebindError } = await db
						.from("billing_checkouts")
						.update({ request_key: body.request_id })
						.eq("id", openCheckout.id)
						.eq("status", "open")
						.select("id")
						.maybeSingle();
					check(rebindError);
					if (!rebound)
						throw new BillingError(
							"Checkout changed status. Refresh billing and try again.",
							409,
						);
					return reply({ url: safePolarUrl(openCheckout.checkout_url) });
				}
				if (body.replace_previous !== true)
					return reply(
						{
							error: isUpgrade
								? "An earlier checkout is still open. Continue it or start a new checkout to complete your upgrade."
								: "An earlier checkout is still open. Continue it or start a new Pro checkout to choose a plan.",
							previous_url: safePolarUrl(openCheckout.checkout_url),
							can_replace: true,
						},
						409,
					);
				const { error: replaceError } = await db
					.from("billing_checkouts")
					.update({ status: "superseded" })
					.eq("id", openCheckout.id)
					.eq("status", "open");
				check(replaceError);
			}
			const id = randomUUID();
			const tempExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
			const { error: insertError } = await db.from("billing_checkouts").insert({
				id,
				user_id: user.id,
				customer_id: customerId,
				environment: env,
				plugin_slug: user.plugin,
				cadence: targetRow.cadence,
				product_id: targetRow.product_id,
				request_key: body.request_id,
				site_id: site,
				status: "creating",
				expires_at: tempExpiresAt,
				...(refundBinding || {}),
			});
			check(insertError);
			// The account ID comes exclusively from verified database identity. No bearer tokens in URLs.
			const checkout = await sdk.checkouts.create({
				products: targetProducts,
				external_customer_id: customerId,
				customer_email: user.email,
				customer_name: user.name,
				allow_trial: false,
				allow_discount_codes: true,
				...(discountId ? { discount_id: discountId } : {}),
				success_url: `${billingSiteUrl(billingConfig())}/billing/return?plugin=${encodeURIComponent(user.plugin)}`,
				return_url: `${billingSiteUrl(billingConfig())}/billing/return?plugin=${encodeURIComponent(user.plugin)}`,
				metadata: {
					qubtic_checkout_id: id,
					plugin_slug: user.plugin,
					is_upgrade: isUpgrade ? "true" : "false",
					...(isUpgrade && activeSub
						? { previous_subscription_id: activeSub.polar_subscription_id }
						: {}),
					...(site ? { site_id: site } : {}),
				},
			});
			const url = safePolarUrl(checkout.url);
			const { error: updateError } = await db
				.from("billing_checkouts")
				.update({
					polar_checkout_id: checkout.id,
					checkout_url: url,
					status: "open",
					expires_at: checkout.expires_at,
				})
				.eq("id", id)
				.eq("status", "creating");
			check(updateError);
			return reply({ url });
		}
		throw new BillingError("Not found.", 404);
	} catch (error) {
		return reply(
			{
				error:
					error instanceof BillingError
						? error.message
						: "Billing service is unavailable. Please try again.",
			},
			error instanceof BillingError ? error.status : 503,
		);
	}
}
export function GET(request: Request, context: Context) {
	return billingRequest(request, () => handle(request, context));
}
export const POST = GET;
export const OPTIONS = GET;
