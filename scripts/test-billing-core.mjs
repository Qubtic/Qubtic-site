import * as billingConfiguration from "../src/lib/billing/config.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const native = createRequire(import.meta.url);
function harness() {
	process.env.POLAR_ENVIRONMENT = "sandbox";
	process.env.POLAR_ORGANIZATION_ID = "test-org";
	process.env.POLAR_ACCESS_TOKEN = "test-only";
	process.env.SUPABASE_URL = "https://example.supabase.co";
	process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only";
	const entries = ["whatsapp-commerce", "telegram-commerce"].flatMap((plugin) =>
		["monthly", "yearly", "lifetime"].map((cadence) => ({
			plugin_slug: plugin,
			cadence,
			product_id: `${plugin}-${cadence}`,
			benefit_id: plugin,
			environment: "sandbox",
			enabled: true,
		})),
	);
	const state = {
		id: "polar",
		external_id: "customer",
		organization_id: "test-org",
		deleted_at: null,
		granted_benefits: entries.map((e) => ({ benefit_id: e.benefit_id })),
		active_subscriptions: [],
	};
	const orders = [],
		checkouts = [],
		calls = [],
		revoked = [];
	let applied = true;
	const db = {
		rpc: async (name, args) => {
			calls.push({ name, args });
			return {
				data:
					name === "billing_site_access"
						? args.p_plugin === "telegram-commerce" && args.p_site === "site-a"
						: applied,
			};
		},
		from(table) {
			const q = {
				select() {
					return q;
				},
				eq() {
					return q;
				},
				in() {
					return q;
				},
				update() {
					return q;
				},
				single: async () => ({
					data: {
						id: "customer",
						environment: "sandbox",
						polar_customer_id: "polar",
					},
				}),
				then(resolve) {
					return Promise.resolve({
						data:
							table === "billing_catalog"
								? entries
								: table === "billing_checkouts"
									? checkouts
									: [],
						error: null,
					}).then(resolve);
				},
			};
			return q;
		},
	};
	const sdk = {
		customers: { getState: async () => state },
		orders: {
			iterList: async function* () {
				yield* orders;
			},
		},
		subscriptions: {
			iterList: async function* () {
				yield* state.active_subscriptions;
			},
			revoke: async (id) => {
				revoked.push(id);
			},
		},
	};
	const deps = {
		"./upgrade-refunds": {
			processUpgradeRefunds: async (context) => {
				calls.push({ name: "processUpgradeRefunds", context });
				return { completed: [], manualReview: [], skipped: [] };
			},
		},
		"server-only": {},
		'../email-service': { sendTeamEvent: async () => {} },
        "../plugin-control": { loadManagedBilling: async selected => billingConfiguration.resolveBillingConfig(process.env, selected) },
        "./config.mjs": {
            ...billingConfiguration,
			configuredCatalog: () => entries,
			catalogMatches: () => true,
		},
		"@supabase/supabase-js": { createClient: () => db },
		"@polar-sh/sdk/2026-10": { createPolar: () => sdk },
	};
	const core = {};
	const js = ts.transpileModule(
		readFileSync(
			new URL("../src/lib/billing/core.ts", import.meta.url),
			"utf8",
		),
		{
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2022,
			},
		},
	).outputText;
	new Function("require", "exports", js)(
		(name) => (name in deps ? deps[name] : native(name)),
		core,
	);
    for (const [key, value] of Object.entries(core)) {
        if (typeof value === "function" && !["BillingError", "withBillingEnvironment"].includes(key))
            core[key] = (...args) => core.withBillingEnvironment("sandbox", () => value(...args));
    }
	function purchase(plugin, site, cadence = "lifetime") {
		const id = `${plugin}-${site}-${cadence}`;
		const subscription_id = cadence === "lifetime" ? null : id;
		checkouts.push({
			site_id: site,
			plugin_slug: plugin,
			polar_checkout_id: id,
		});
		const order = {
			id,
			customer_id: "polar",
			customer: { organization_id: "test-org" },
			checkout_id: id,
			product_id: `${plugin}-${cadence}`,
			status: "paid",
			total_amount: 100,
			refunded_amount: 0,
			currency: "usd",
			created_at: new Date().toISOString(),
			subscription_id,
		};
		orders.push(order);
		if (subscription_id)
			state.active_subscriptions.push({
				id,
				product_id: order.product_id,
				status: "active",
				current_period_start: new Date(Date.now() - 60000).toISOString(),
				current_period_end: new Date(Date.now() + 3600000).toISOString(),
				cancel_at_period_end: true,
			});
		return order;
	}
	const snapshot = () =>
		core.normalizeSiteState(
			state,
			entries,
			orders,
			state.active_subscriptions,
			checkouts,
		);
	return {
		core,
		entries,
		state,
		orders,
		checkouts,
		calls,
		revoked,
		purchase,
		snapshot,
		setApplied: (value) => {
			applied = value;
		},
	};
}

test("Telegram paidAccess requires a valid site and never uses account-wide entitlements", async () => {
	const h = harness();
	for (const site of [null, undefined, "", "bad site"])
		assert.equal(
			await h.core.paidAccess("user", "telegram-commerce", site),
			false,
		);
	assert.equal(h.calls.length, 0);
	assert.equal(
		await h.core.paidAccess("user", "telegram-commerce", "site-a"),
		true,
	);
	assert.equal(
		await h.core.paidAccess("user", "telegram-commerce", "site-b"),
		false,
	);
	assert.ok(
		h.calls.every(
			(c) =>
				c.name === "billing_site_access" &&
				c.args.p_plugin === "telegram-commerce",
		),
	);
});

test("both commerce plugins project independently on identical and different sites", () => {
	const h = harness();
	h.purchase("whatsapp-commerce", "site-a");
	h.purchase("telegram-commerce", "site-b");
	assert.deepEqual(
		h.snapshot().siteGrants.map((g) => [g.plugin_slug, g.site_id]),
		[
			["whatsapp-commerce", "site-a"],
			["telegram-commerce", "site-b"],
		],
	);
	h.purchase("telegram-commerce", "site-a");
	assert.equal(h.snapshot().siteGrants.length, 3);
	h.orders.find(
		(o) => o.id === "telegram-commerce-site-b-lifetime",
	).refunded_amount = 100;
	assert.deepEqual(
		h.snapshot().siteGrants.map((g) => [g.plugin_slug, g.site_id]),
		[
			["whatsapp-commerce", "site-a"],
			["telegram-commerce", "site-a"],
		],
	);
	h.state.deleted_at = new Date().toISOString();
	assert.deepEqual(h.snapshot().siteGrants, []);
});

test("unbound purchases and mismatched plugin bindings never grant site access", () => {
	const h = harness();
	const order = h.purchase("telegram-commerce", "site-a");
	h.checkouts[0].plugin_slug = "whatsapp-commerce";
	assert.deepEqual(h.snapshot().siteGrants, []);
	assert.equal(h.snapshot().orders[0].site_id, null);
	h.checkouts.length = 0;
	order.metadata = { site_id: "site-a" };
	assert.deepEqual(h.snapshot().siteGrants, []);
});

test("Telegram renewals inherit their saved subscription site and require a paid current period", () => {
	const h = harness();
	const original = h.purchase("telegram-commerce", "site-a", "monthly");
	original.created_at = "2020-01-01T00:00:00Z";
	assert.deepEqual(h.snapshot().siteGrants, []);
	h.orders.push({
		...original,
		id: "renewal",
		checkout_id: null,
		created_at: new Date().toISOString(),
	});
	assert.equal(h.snapshot().siteGrants[0].site_id, "site-a");
	assert.equal(h.snapshot().orders[1].site_id, "site-a");
	h.orders[1].refunded_amount = 100;
	assert.deepEqual(h.snapshot().siteGrants, []);
});

test("subscription upgrades cannot revoke another site or another plugin", async () => {
	const h = harness();
	h.purchase("telegram-commerce", "site-a", "monthly");
	h.purchase("whatsapp-commerce", "site-a", "lifetime");
	h.purchase("telegram-commerce", "site-b", "yearly");
	await h.core.synchronize("customer");
	assert.deepEqual(h.revoked, []);
	h.purchase("telegram-commerce", "site-a", "yearly");
	await h.core.synchronize("customer");
	assert.deepEqual(h.revoked, ["telegram-commerce-site-a-monthly"]);
	const applied = h.calls.find((c) => c.name === "billing_apply_site_snapshot");
	assert.ok(
		applied.args.p_site_grants.some(
			(g) => g.plugin_slug === "telegram-commerce" && g.site_id === "site-a",
		),
	);
});

test("Lifetime refunds are delegated centrally before any subscription is revoked", async () => {
	const h = harness();
	h.purchase("telegram-commerce", "site-a", "yearly");
	h.purchase("telegram-commerce", "site-a", "lifetime");
	await h.core.synchronize("customer");
	const delegated = h.calls.find((c) => c.name === "processUpgradeRefunds");
	assert.equal(delegated.context.customerId, "customer");
	assert.equal(delegated.context.environment, "sandbox");
	assert.equal(delegated.context.orders.length, 2);
	assert.equal(delegated.context.checkouts.length, 2);
	assert.deepEqual(h.revoked, []);
});

test("stale snapshots and unassigned historical subscriptions never trigger upgrade revocation", async () => {
	const h = harness();
	h.purchase("telegram-commerce", "site-a", "monthly");
	h.purchase("telegram-commerce", "site-a", "lifetime");
	h.setApplied(false);
	await h.core.synchronize("customer");
	assert.deepEqual(h.revoked, []);
	h.setApplied(true);
	h.checkouts.length = 0;
	await h.core.synchronize("customer");
	assert.deepEqual(h.revoked, []);
});
