// Standalone, offline: node --test scripts/test-upgrade-refunds.mjs
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import ts from "typescript";
import { PGlite } from "@electric-sql/pglite";

const mod = {};
const source = readFileSync(
	new URL("../src/lib/billing/upgrade-refunds.ts", import.meta.url),
	"utf8",
);
let serverOnlyImports = 0;
new Function(
	"exports",
	"require",
	ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
		},
	}).outputText,
)(mod, (name) => {
	assert.equal(
		name,
		"server-only",
		"No unexpected runtime dependencies in offline harness",
	);
	serverOnlyImports++;
	return {};
});
const { processUpgradeRefunds: processRefunds, unusedUpgradeAmount: prorate } =
	mod;
let pg;
before(async () => {
	pg = new PGlite();
	await pg.exec(
		"CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;",
	);
	for (const file of [
		"framer_users.sql",
		"pairing_sessions.sql",
		"billing.sql",
		"billing_discounts.sql",
		"billing_sites.sql",
		"billing_upgrade_refunds.sql",
		"billing_upgrade_refunds.sql",
	]) {
		await pg.exec(
			readFileSync(new URL("../supabase/" + file, import.meta.url), "utf8"),
		);
	}
});
after(async () => {
	await pg?.close();
});
const rpc = async (name, args) => {
	const keys = Object.keys(args);
	try {
		const r = await pg.query(
			`SELECT public.${name}(${keys.map((k, i) => `${k} => $${i + 1}`).join(",")}) AS result`,
			Object.values(args).map((v) =>
				typeof v === "object" ? JSON.stringify(v) : v,
			),
		);
		return { data: r.rows[0].result, error: null };
	} catch (error) {
		return { data: null, error };
	}
};
async function fixture(plugin = "frame-drop", cadence = "monthly") {
	const customer = randomUUID(),
		user = randomUUID(),
		product = randomUUID(),
		lifetimeProduct = randomUUID(),
		sub = randomUUID();
	const checkout = randomUUID(),
		originalCheckout = randomUUID(),
		orderId = randomUUID(),
		lifeId = randomUUID();
	const start = "2026-10-01T00:00:00Z",
		end =
			cadence === "yearly" ? "2027-10-01T00:00:00Z" : "2026-11-01T00:00:00Z";
	const purchase =
		cadence === "yearly" ? "2027-04-01T12:00:00Z" : "2026-10-16T12:00:00Z";
	const site = plugin.endsWith("-commerce") || plugin === "frame-drop" ? "site-a" : null;
	await pg.query(
		"INSERT INTO framer_users(id,email,plugin_slug,auth_token) VALUES($1,$2,$3,$4)",
		[user, user + "@test.invalid", plugin, randomUUID()],
	);
	await pg.query(
		"INSERT INTO billing_customers(id,email,environment,polar_customer_id) VALUES($1,$2,'sandbox',$3)",
		[customer, customer + "@test.invalid", customer],
	);
	const common = {
		customer_id: customer,
		environment: "sandbox",
		plugin_slug: plugin,
		status: "succeeded",
		user_id: user,
		site_id: site,
	};
	const original = {
		...common,
		id: originalCheckout,
		product_id: product,
		cadence,
		polar_checkout_id: randomUUID(),
		created_at: start,
	};
	const binding = {
		...common,
		id: checkout,
		product_id: lifetimeProduct,
		cadence: "lifetime",
		polar_checkout_id: randomUUID(),
		created_at: purchase,
		previous_subscription_id: sub,
		upgrade_to: "lifetime",
		upgrade_policy_version: 1,
		upgrade_period_start: start,
		upgrade_period_end: end,
	};
	for (const b of [original, binding]) {
		const keys = Object.keys(b);
		await pg.query(
			`INSERT INTO billing_checkouts(${keys.join(",")},request_key) VALUES(${keys.map((_, i) => "$" + (i + 1)).join(",")},$${keys.length + 1})`,
			[...Object.values(b), randomUUID()],
		);
	}
	const owner = { customer_id: customer, customer: { organization_id: "org" } };
	const paid = {
		...owner,
		id: orderId,
		product_id: product,
		subscription_id: sub,
		checkout_id: original.polar_checkout_id,
		created_at: start,
		status: "paid",
		paid: true,
		subtotal_amount: 12000,
		discount_amount: 2000,
		net_amount: 10000,
		tax_amount: 2000,
		total_amount: 12000,
		refunded_amount: 0,
		refundable_amount: 10000,
		currency: "usd",
		applied_balance_amount: 0,
	};
	const lifetime = {
		...paid,
		id: lifeId,
		product_id: lifetimeProduct,
		subscription_id: null,
		checkout_id: binding.polar_checkout_id,
		created_at: purchase,
	};
	const subscriptions = [
		{
			...owner,
			id: sub,
			product_id: product,
			status: "active",
			cancel_at_period_end: false,
		},
	];
	const calls = [],
		refunds = [];
	const h = {
		calls,
		refunds,
		paid,
		lifetime,
		binding,
		original,
		subscriptions,
		options: {},
		customer,
		sub,
	};
	const refund = (body) => ({
		id: randomUUID(),
		...body,
		...owner,
		organization_id: "org",
		currency: "usd",
		status: h.options.status ?? "succeeded",
		tax_amount: 0,
	});
	const sdk = {
		orders: {
			get: async (id) => {
				calls.push(["get", id]);
				if (h.options.getError) throw Error("get transient");
				return id === lifeId
					? { ...lifetime, ...(h.options.freshLifetime ?? {}) }
					: { ...paid };
			},
		},
		refunds: {
			list: async (query) => {
				calls.push(["list", query]);
				if (h.options.listError) throw Error("list transient");
				return {
					items: refunds.filter((r) => r.order_id === query.order_id),
					pagination: { max_page: 1, total_count: refunds.length },
				};
			},
			create: async (body, options) => {
				calls.push(["create", body, options]);
				if (h.options.beforeCreate) await h.options.beforeCreate();
				if (h.options.dropBefore)
					throw Error("connection lost before response");
				const r = refund(body);
				refunds.push(r);
				if (h.options.dropAfter)
					throw Error("connection lost after acceptance");
				return r;
			},
		},
		subscriptions: {
			get: async (id) => {
				calls.push(["get-subscription", id]);
				if (h.options.subscriptionError) throw Error("subscription transient");
				return { ...subscriptions[0] };
			},
			update: async (id, body) => {
				calls.push(["cancel", id, body]);
				if (h.options.cancelError) throw Error("cancel transient");
				return { ...subscriptions[0], ...body };
			},
		},
	};
	h.context = {
		db: { rpc },
		sdk,
		customerId: customer,
		environment: "sandbox",
		organizationId: "org",
		state: { id: customer, organization_id: "org" },
		orders: [paid, lifetime],
		subscriptions,
		checkouts: [original, binding],
		entries: [
			{
				environment: "sandbox",
				product_id: product,
				plugin_slug: plugin,
				cadence,
			},
			{
				environment: "sandbox",
				product_id: lifetimeProduct,
				plugin_slug: plugin,
				cadence: "lifetime",
			},
		],
	};
	h.run = () => processRefunds(h.context);
	h.rows = async () =>
		(
			await pg.query(
				"SELECT * FROM billing_upgrade_refunds WHERE customer_id=$1",
				[customer],
			)
		).rows;
	h.due = () =>
		pg.query(
			"UPDATE billing_upgrade_refunds SET next_attempt_at=now()-interval '1 second',renewal_next_attempt_at=now()-interval '1 second',lease_until=now()-interval '1 second' WHERE customer_id=$1",
			[customer],
		);
	h.manual = (amount, status = "succeeded") =>
		refunds.push(refund({ amount, status, order_id: orderId, metadata: {} }));
	return h;
}
const count = (h, name) => h.calls.filter((c) => c[0] === name).length;

test("integer prorating: boundaries, discount net, leap year and large integer precision", () => {
	assert.equal(prorate(10000, 0, 100, 50, 10000), 5000);
	assert.equal(prorate(10000, 0, 100, 0, 10000), 10000);
	for (const point of [-1, 100, 101, NaN])
		assert.equal(prorate(10000, 0, 100, point, 10000), 0);
	assert.equal(prorate(101, 0, 3, 1, 101), 67);
	assert.equal(prorate(10000, 0, 100, 50, 1234), 1234);
	assert.equal(prorate(10000, 10, 10, 10, 10000), 0);
	assert.equal(prorate(10000.5, 0, 100, 50, 10000), 0);
	const start = Date.parse("2024-01-01"),
		end = Date.parse("2025-01-01"),
		purchase = Date.parse("2024-07-02");
	assert.equal(prorate(10000, start, end, purchase, 10000), 5000);
	assert.equal(
		prorate(
			Number.MAX_SAFE_INTEGER,
			0,
			Number.MAX_SAFE_INTEGER,
			1,
			Number.MAX_SAFE_INTEGER,
		),
		Number.MAX_SAFE_INTEGER - 1,
	);
});

test("all apps, monthly/yearly: stop renewals independently, refund discounted pretax time, idempotent replay", async () => {
	for (const plugin of [
		"frame-drop",
		"qube-auth",
		"whatsapp-commerce",
		"telegram-commerce",
	])
		for (const cadence of ["monthly", "yearly"]) {
			const h = await fixture(plugin, cadence);
			const report = await h.run();
			assert.equal(report.completed.length, 1);
			const create = h.calls.find((c) => c[0] === "create")[1];
			assert.equal(create.amount, 5000);
			assert.equal(create.order_id, h.paid.id);
			assert.equal(create.revoke_benefits, undefined);
			assert.ok(
				h.calls.findIndex((c) => c[0] === "cancel") <
					h.calls.findIndex((c) => c[0] === "create"),
			);
			assert.deepEqual(h.calls.find((c) => c[0] === "cancel").slice(1), [
				h.sub,
				{ cancel_at_period_end: true },
			]);
			assert.equal((await h.rows())[0].phase, "done");
			await h.run();
			assert.equal(count(h, "create"), 1);
			assert.equal(count(h, "cancel"), 1);
		}
});

test("new upgrades only: missing/mismatched checkout bindings and unpaid Lifetime orders do nothing", async () => {
	const mutations = [
		(h) => {
			h.binding.upgrade_policy_version = null;
		},
		(h) => {
			h.binding.upgrade_to = null;
		},
		(h) => {
			h.binding.previous_subscription_id = null;
		},

		(h) => {
			h.binding.customer_id = randomUUID();
		},
		(h) => {
			h.binding.environment = "production";
		},
		(h) => {
			h.binding.plugin_slug = "another-app";
		},
		(h) => {
			h.binding.polar_checkout_id = randomUUID();
		},
		(h) => {
			h.lifetime.customer_id = randomUUID();
		},
		(h) => {
			h.lifetime.customer.organization_id = "other-org";
		},
		(h) => {
			h.lifetime.status = "pending";
		},
		(h) => {
			h.lifetime.paid = false;
		},
		(h) => {
			h.lifetime.refunded_amount = 1;
		},
	];
	for (const mutate of mutations) {
		const h = await fixture();
		mutate(h);
		await h.run();
		assert.equal(count(h, "create"), 0);
		assert.equal((await h.rows()).length, 0);
	}
	for (const plugin of ["telegram-commerce", "whatsapp-commerce"])
		for (const change of ["missing", "wrong", "unbound", "cross-plugin"]) {
			const h = await fixture(plugin);
			if (change === "missing") h.binding.site_id = null;
			if (change === "wrong") h.original.site_id = "another-site";
			if (change === "unbound") h.context.checkouts = [h.binding];
			if (change === "cross-plugin") h.original.plugin_slug = "frame-drop";
			await h.run();
			assert.equal(count(h, "create"), 0);
		}
});

test("uses paid_at if supplied; frozen purchase period survives later subscription periods", async () => {
	const h = await fixture();
	h.lifetime.created_at = "2026-10-16T00:00:00Z";
	h.lifetime.paid_at = "2026-10-16T12:00:00Z";
	h.subscriptions[0].current_period_start = "2027-01-01";
	h.subscriptions[0].current_period_end = "2027-02-01";
	await h.run();
	assert.equal(h.calls.find((c) => c[0] === "create")[1].amount, 5000);
});

test("caps actual remaining paid net after manual, pending and freshly observed refunds", async () => {
	for (const status of ["succeeded", "pending"]) {
		const h = await fixture();
		h.manual(8500, status);
		await h.run();
		assert.equal(h.calls.find((c) => c[0] === "create")[1].amount, 1500);
	}
	const h = await fixture();
	const original = h.context.sdk.orders.get;
	h.context.sdk.orders.get = async (...args) => {
		const result = await original(...args);
		return args[0] === h.paid.id
			? { ...result, refunded_amount: 9000, refundable_amount: 1000 }
			: result;
	};
	await h.run();
	assert.equal(h.calls.find((c) => c[0] === "create")[1].amount, 1000);
	const zero = await fixture();
	zero.manual(10000);
	const report = await zero.run();
	assert.equal(report.manualReview.length, 1);
	assert.equal(count(zero, "cancel"), 1);
	assert.equal((await zero.rows())[0].renewal_status, "renewal_stopped");
});

test("network ambiguity after create recovers by durable metadata without repeating financial call", async () => {
	const h = await fixture();
	h.options.dropAfter = true;
	await assert.rejects(h.run, /connection lost/);
	assert.equal((await h.rows())[0].phase, "recovering");
	assert.equal(count(h, "cancel"), 1);
	await h.due();
	h.context.orders = [];
	const result = await h.run();
	assert.equal(result.completed.length, 1);
	assert.equal(count(h, "create"), 1);
	assert.equal(count(h, "cancel"), 1);
	assert.equal(
		h.refunds[0].metadata.qubtic_upgrade_refund,
		(await h.rows())[0].id,
	);
});

test("ambiguous absent provider result becomes financial review, never repeats create, renewals already stopped", async () => {
	const h = await fixture();
	h.options.dropBefore = true;
	await assert.rejects(h.run);
	await h.due();
	const report = await h.run();
	assert.equal(report.manualReview.length, 1);
	assert.equal((await h.rows())[0].phase, "manual_review");
	await h.run();
	assert.equal(count(h, "create"), 1);
	assert.equal(count(h, "cancel"), 1);
});

test("pending provider status leaves renewals stopped; eventual success resumes without create", async () => {
	const h = await fixture();
	h.options.status = "pending";
	await assert.rejects(h.run, /pending/);
	assert.equal((await h.rows())[0].phase, "pending");
	assert.equal((await h.rows())[0].renewal_status, "renewal_stopped");
	assert.equal(count(h, "cancel"), 1);
	await h.due();
	await assert.rejects(h.run, /pending/);
	h.refunds[0].status = "succeeded";
	await h.due();
	await h.run();
	assert.equal(count(h, "create"), 1);
	assert.equal(count(h, "cancel"), 1);
});

test("failed/canceled/unknown provider results require manual review, not automatic replacement", async () => {
	for (const status of ["failed", "canceled", "unrecognized"]) {
		const h = await fixture();
		h.options.status = status;
		const report = await h.run();
		assert.equal(report.manualReview.length, 1);
		assert.equal(count(h, "cancel"), 1);
		await h.run();
		assert.equal(count(h, "create"), 1);
	}
});

test("cancel transient retries only cancellation; successful refund remains durable", async () => {
	const h = await fixture();
	h.options.cancelError = true;
	await assert.rejects(h.run, /cancel transient/);
	assert.equal((await h.rows())[0].phase, "done");
	assert.equal((await h.rows())[0].renewal_status, "pending");
	h.options.cancelError = false;
	await h.due();
	await h.run();
	assert.equal(count(h, "create"), 1);
	assert.equal(count(h, "cancel"), 2);
	assert.equal((await h.rows())[0].phase, "done");
});

test("bounded transient retries, no action after exhaustion", async () => {
	for (const mode of ["listError", "getError", "cancelError"]) {
		const h = await fixture();
		h.options[mode] = true;
		for (let i = 0; i < 5; i++) {
			await assert.rejects(h.run);
			await h.due();
		}
		const row = (await h.rows())[0];
		assert.equal(
			mode === "cancelError" ? row.renewal_status : row.phase,
			"manual_review",
		);
		assert.equal(
			mode === "cancelError" ? row.renewal_attempts : row.attempts,
			5,
		);
		const n = h.calls.length;
		const report = await h.run();
		assert.equal(h.calls.length, n);
		assert.equal(report.manualReview.length, 1);
	}
});

test("simultaneous workers and a second Lifetime purchase cannot refund the same subscription twice", async () => {
	const h = await fixture();
	let unlock, entered;
	const gate = new Promise((r) => {
		unlock = r;
	});
	const seen = new Promise((r) => {
		entered = r;
	});
	h.options.beforeCreate = async () => {
		entered();
		await gate;
	};
	const first = h.run();
	await seen;
	await assert.rejects(h.run, /leased/);
	unlock();
	await first;
	h.lifetime.id = randomUUID();
	await h.run();
	assert.equal(count(h, "create"), 1);
	assert.equal((await h.rows()).length, 1);
});

test("crash after intent commit recovers expired creating lease; stale token is fenced", async () => {
	const h = await fixture();
	let oldToken;
	const originalRpc = h.context.db.rpc;
	h.context.db.rpc = async (name, args) => {
		const result = await originalRpc(name, args);
		if (
			name === "billing_finish_upgrade_refund" &&
			args.p_phase === "creating" &&
			!result.error
		) {
			oldToken = args.p_token;
			throw Error("worker terminated");
		}
		return result;
	};
	await assert.rejects(h.run);
	assert.equal(count(h, "create"), 0);
	assert.equal((await h.rows())[0].phase, "creating");
	h.context.db.rpc = originalRpc;
	await h.due();
	await h.run();
	const row = (await h.rows())[0];
	assert.equal(row.phase, "manual_review");
	const stale = await rpc("billing_finish_upgrade_refund", {
		p_id: row.id,
		p_token: oldToken,
		p_phase: "accepted",
		p_patch: {},
		p_release: true,
	});
	assert.equal(stale.data, false);
});

test("provider key collisions, changed amount and wrong ownership never repeat create or undo cancellation", async () => {
	for (const mode of ["duplicate", "amount", "owner"]) {
		const h = await fixture();
		h.options.dropAfter = true;
		await assert.rejects(h.run);
		await h.due();
		if (mode === "duplicate")
			h.refunds.push({ ...h.refunds[0], id: randomUUID() });
		if (mode === "amount") h.refunds[0].amount++;
		if (mode === "owner") h.refunds[0].customer_id = randomUUID();
		if (mode === "owner") await assert.rejects(h.run, /ownership/);
		else await h.run();
		assert.equal(count(h, "cancel"), 1);
		assert.equal(count(h, "create"), 1);
	}
});

test("migration is repeatable; RLS and RPC access are service-role only", async () => {
	const signatures = [
		"billing_claim_upgrade_refunds(uuid,text,jsonb)",
		"billing_finish_upgrade_refund(uuid,uuid,text,jsonb,boolean)",
	];
	for (const role of ["anon", "authenticated", "service_role"]) {
		for (const sig of signatures) {
			const r = await pg.query(
				"SELECT has_function_privilege($1,$2,'EXECUTE') AS ok",
				[role, sig],
			);
			assert.equal(r.rows[0].ok, role === "service_role");
		}
		for (const perm of ["SELECT", "INSERT", "UPDATE", "DELETE"]) {
			const r = await pg.query(
				"SELECT has_table_privilege($1,'billing_upgrade_refunds',$2) AS ok",
				[role, perm],
			);
			assert.equal(r.rows[0].ok, role === "service_role");
		}
	}
	const r = await pg.query(
		"SELECT relrowsecurity FROM pg_class WHERE oid='billing_upgrade_refunds'::regclass",
	);
	assert.equal(r.rows[0].relrowsecurity, true);
	await pg.exec("SET ROLE anon");
	await assert.rejects(() => pg.query("SELECT * FROM billing_upgrade_refunds"));
	await pg.exec("RESET ROLE");
	await pg.exec("SET ROLE authenticated");
	await assert.rejects(() =>
		pg.query(
			"SELECT billing_claim_upgrade_refunds(gen_random_uuid(),'sandbox','[]')",
		),
	);
	await pg.exec("RESET ROLE");
	const h = await fixture();
	await pg.exec("SET ROLE service_role");
	try {
		await h.run();
		assert.equal((await h.rows())[0].phase, "done");
	} finally {
		await pg.exec("RESET ROLE");
	}
});

test("DB independently rejects tampered/retroactive saved checkout bindings", async () => {
	const h = await fixture();
	const capture = h.context.db.rpc;
	let candidate;
	h.context.db.rpc = async (name, args) => {
		if (name === "billing_claim_upgrade_refunds")
			candidate = args.p_candidates[0];
		return { data: { jobs: [], blocked: 0 }, error: null };
	};
	await h.run();
	h.context.db.rpc = capture;
	for (const patch of [
		{ customer_id: randomUUID() },
		{ subscription_id: randomUUID() },
		{ checkout_id: randomUUID() },
		{ period_start: "2025-01-01" },
		{ plugin_slug: "different-app" },
		{ lifetime_product_id: randomUUID() },
	]) {
		const r = await rpc("billing_claim_upgrade_refunds", {
			p_customer: h.customer,
			p_environment: "sandbox",
			p_candidates: [{ ...candidate, ...patch }],
		});
		assert.ok(r.error);
	}
	await pg.query(
		"UPDATE billing_checkouts SET upgrade_policy_version=NULL WHERE id=$1",
		[h.binding.id],
	);
	const r = await rpc("billing_claim_upgrade_refunds", {
		p_customer: h.customer,
		p_environment: "sandbox",
		p_candidates: [candidate],
	});
	assert.ok(r.error);
	assert.equal((await h.rows()).length, 0);
});

test("refund list is fully paginated before computing manual-refund caps", async () => {
	const h = await fixture();
	h.manual(4000);
	h.manual(5000);
	h.context.sdk.refunds.list = async (q) => {
		h.calls.push(["list", q]);
		return {
			items: [h.refunds[q.page - 1]],
			pagination: { max_page: 2, total_count: 2 },
		};
	};
	await h.run();
	assert.equal(count(h, "list"), 2);
	assert.equal(h.calls.find((c) => c[0] === "create")[1].amount, 1000);
	const invalid = await fixture();
	invalid.context.sdk.refunds.list = async () => ({
		items: [],
		pagination: { max_page: 101 },
	});
	await assert.rejects(invalid.run, /pagination/);
	assert.equal(count(invalid, "create"), 0);
	assert.equal(count(invalid, "cancel"), 1);
});

test("abandoned claims are bounded and repeating migration preserves completed ledger history", async () => {
	const h = await fixture();
	await h.run();
	const completed = (await h.rows())[0];
	await pg.exec(
		readFileSync(
			new URL("../supabase/billing_upgrade_refunds.sql", import.meta.url),
			"utf8",
		),
	);
	assert.deepEqual((await h.rows())[0], completed);
	const abandoned = await fixture();
	abandoned.options.listError = true;
	await assert.rejects(abandoned.run);
	await pg.query(
		"UPDATE billing_upgrade_refunds SET attempts=5,phase='creating',lease_until=now()-interval '1 second',next_attempt_at=now()-interval '1 second' WHERE customer_id=$1",
		[abandoned.customer],
	);
	const report = await abandoned.run();
	assert.equal(report.manualReview.length, 1);
	assert.equal((await abandoned.rows())[0].phase, "manual_review");
	assert.equal(count(abandoned, "create"), 0);
});

test("server-only marker is loaded through the offline stub", () => {
	assert.equal(serverOnlyImports, 1);
});

test("days-long pending settlement keeps its failure budget and durably backs off without worker polling", async () => {
	const h = await fixture();
	h.options.status = "pending";
	await assert.rejects(h.run, /pending provider settlement/);
	await pg.query(
		"UPDATE billing_upgrade_refunds SET created_at=now()-interval '3 days' WHERE customer_id=$1",
		[h.customer],
	);
	for (let i = 0; i < 16; i++) {
		const row = (await h.rows())[0];
		assert.equal(row.phase, "pending");
		assert.equal(row.attempts, 0);
		assert.equal(row.claim_token, null);
		assert.equal(row.lease_until, null);
		const delay = (
			await pg.query(
				"SELECT extract(epoch FROM next_attempt_at-now())::int AS seconds FROM billing_upgrade_refunds WHERE id=$1",
				[row.id],
			)
		).rows[0].seconds;
		assert.ok(
			delay > 840 && delay <= 900,
			`Expected 15-minute delay, got ${delay}`,
		);
		const calls = h.calls.length;
		await assert.rejects(h.run, /awaiting retry/);
		assert.equal(
			h.calls.length,
			calls,
			"A deferred invocation makes no provider calls",
		);
		await h.due();
		const polls = count(h, "list");
		await assert.rejects(h.run, /pending provider settlement/);
		assert.equal(
			count(h, "list"),
			polls + 1,
			"One settlement observation per invocation, no polling loop",
		);
	}
	assert.equal(count(h, "create"), 1);
	assert.equal(count(h, "cancel"), 1);
	h.refunds[0].status = "succeeded";
	await h.due();
	await h.run();
	assert.equal((await h.rows())[0].phase, "done");
	assert.equal(count(h, "create"), 1);
	assert.equal(count(h, "cancel"), 1);
});

test("pending observations preserve earlier failures; actual pending-list failures still exhaust the budget", async () => {
	for (const outcome of ["settles", "fails"]) {
		const h = await fixture();
		h.options.status = "pending";
		await assert.rejects(h.run, /pending/);
		h.options.listError = true;
		for (let i = 1; i <= 4; i++) {
			await h.due();
			await assert.rejects(h.run, /list transient/);
			assert.equal((await h.rows())[0].attempts, i);
		}
		h.options.listError = false;
		for (let i = 0; i < 7; i++) {
			await h.due();
			await assert.rejects(h.run, /pending provider settlement/);
			assert.equal((await h.rows())[0].attempts, 4);
			assert.equal((await h.rows())[0].phase, "pending");
		}
		await h.due();
		if (outcome === "settles") {
			h.refunds[0].status = "succeeded";
			await h.run();
			assert.equal((await h.rows())[0].phase, "done");
			assert.equal(count(h, "cancel"), 1);
		} else {
			h.options.listError = true;
			await assert.rejects(h.run, /list transient/);
			assert.equal((await h.rows())[0].phase, "manual_review");
			assert.equal((await h.rows())[0].attempts, 5);
			const calls = h.calls.length;
			await h.run();
			assert.equal(h.calls.length, calls);
			assert.equal(count(h, "cancel"), 1);
		}
		assert.equal(count(h, "create"), 1);
	}
});

test("already canceled subscriptions and canceled update responses count as renewal-stopped", async () => {
	const already = await fixture();
	already.subscriptions[0].status = "canceled";
	already.subscriptions[0].cancel_at_period_end = false;
	already.options.cancelError = true;
	await already.run();
	assert.equal(count(already, "create"), 1);
	assert.equal(
		count(already, "cancel"),
		0,
		"Do not update an already canceled subscription",
	);
	assert.equal((await already.rows())[0].phase, "done");
	const h = await fixture();
	h.context.sdk.subscriptions.update = async (id, body) => {
		h.calls.push(["cancel", id, body]);
		return {
			...h.subscriptions[0],
			status: "canceled",
			cancel_at_period_end: false,
		};
	};
	await h.run();
	assert.equal((await h.rows())[0].phase, "done");
	assert.equal(count(h, "cancel"), 1);
});

test("ambiguous create recovery can become long-running pending without a duplicate create", async () => {
	const h = await fixture();
	h.options.status = "pending";
	h.options.dropAfter = true;
	await assert.rejects(h.run, /connection lost/);
	assert.equal((await h.rows())[0].phase, "recovering");
	for (let i = 0; i < 8; i++) {
		await h.due();
		await assert.rejects(h.run, /pending provider settlement/);
		assert.equal(
			(await h.rows())[0].attempts,
			1,
			"Preserve the original ambiguous-call failure only",
		);
	}
	h.refunds[0].status = "succeeded";
	await h.due();
	await h.run();
	assert.equal(count(h, "create"), 1);
	assert.equal(count(h, "cancel"), 1);
});

test("recovery refuses a changed recorded provider ID or missing known refund; never recreates", async () => {
	for (const mode of ["id", "missing"]) {
		const h = await fixture();
		h.options.status = "pending";
		await assert.rejects(h.run, /pending/);
		if (mode === "id") h.refunds[0].id = randomUUID();
		else h.refunds.length = 0;
		await h.due();
		const report = await h.run();
		assert.equal(report.manualReview.length, 1);
		assert.equal((await h.rows())[0].phase, "manual_review");
		assert.equal(count(h, "create"), 1);
		assert.equal(count(h, "cancel"), 1);
	}
});

test("each worker claims at most one due ledger job", async () => {
	const h = await fixture();
	h.options.status = "pending";
	await assert.rejects(h.run, /pending/);
	await pg.query(
		`INSERT INTO billing_upgrade_refunds(customer_id,environment,subscription_id,lifetime_order_id,checkout_id,payload,phase,next_attempt_at)
	 SELECT customer_id,environment,$2,$3,checkout_id,payload,'recovering',now()-interval '1 second' FROM billing_upgrade_refunds WHERE customer_id=$1`,
		[h.customer, randomUUID(), randomUUID()],
	);
	await h.due();
	const r = await rpc("billing_claim_upgrade_refunds", {
		p_customer: h.customer,
		p_environment: "sandbox",
		p_candidates: [],
	});
	assert.equal(r.error, null);
	assert.equal(r.data.jobs.length, 1);
	assert.equal(r.data.blocked, 1);
	const rows = await h.rows();
	assert.equal(rows.filter((row) => row.claim_token !== null).length, 1);
});

test("financial review of ambiguous invoices does not prevent confirmed Lifetime renewal cancellation", async () => {
	const changes = [
		(h) => {
			h.paid.currency = "eur";
		},
		(h) => {
			h.paid.created_at = "2025-01-01T00:00:00Z";
		},
		(h) => {
			h.paid.net_amount = 12000;
		},
		(h) => {
			h.paid.applied_balance_amount = -1;
		},
		(h) => {
			h.context.orders.push({ ...h.paid, id: randomUUID() });
		},
		(h) => {
			h.context.orders = [h.lifetime];
		},
	];
	for (const [index, change] of changes.entries()) {
		const h = await fixture();
		change(h);
		const report = await h.run();
		const row = (await h.rows())[0];
		assert.equal(row.phase, "manual_review");
		// Without the original invoice, the subscription's site cannot be proven.
		assert.equal(row.renewal_status, index === changes.length - 1 ? "pending" : "renewal_stopped");
		assert.equal(Boolean(row.renewal_stopped_at), index !== changes.length - 1);
		assert.equal(report.manualReview.length, 1);
		assert.equal(count(h, "create"), 0);
		assert.equal(count(h, "cancel"), index === changes.length - 1 ? 0 : 1);
	}
});

test("zero prorate, fully refunded original, and zero-net invoices still stop renewals without refund create", async () => {
	for (const mode of ["rounding", "already-refunded", "zero-net"]) {
		const h = await fixture();
		if (mode === "rounding")
			h.lifetime.created_at = new Date(
				Date.parse(h.binding.upgrade_period_end) - 1,
			).toISOString();
		if (mode === "already-refunded") {
			h.paid.refunded_amount = 10000;
			h.paid.refundable_amount = 0;
		}
		if (mode === "zero-net") {
			h.paid.net_amount = 0;
			h.paid.discount_amount = h.paid.subtotal_amount;
			h.paid.refundable_amount = 0;
		}
		const report = await h.run();
		const row = (await h.rows())[0];
		assert.equal(row.payload.amount, 0);
		assert.equal(row.phase, "done");
		assert.equal(row.renewal_status, "renewal_stopped");
		assert.equal(report.completed.length, 1);
		assert.equal(count(h, "create"), 0);
		assert.equal(count(h, "cancel"), 1);
		await h.run();
		assert.equal(count(h, "cancel"), 1);
	}
});

test("cancellation retries independently through pending, failed, ambiguous and zero-amount financial outcomes", async () => {
	for (const outcome of ["pending", "failed", "ambiguous", "zero"]) {
		const h = await fixture();
		h.options.cancelError = true;
		if (outcome === "pending" || outcome === "failed")
			h.options.status = outcome;
		if (outcome === "ambiguous") h.options.dropBefore = true;
		if (outcome === "zero") {
			h.paid.refundable_amount = 0;
			h.paid.refunded_amount = 10000;
		}
		await assert.rejects(h.run, /cancel transient/);
		let row = (await h.rows())[0];
		assert.equal(row.renewal_status, "pending");
		assert.equal(row.renewal_attempts, 1);
		const creates = count(h, "create"),
			polls = count(h, "list"),
			attempts = row.attempts;
		h.options.cancelError = false;
		if (outcome === "pending") {
			// Only cancellation is due: the 15-minute settlement delay cannot block its 30-second retry.
			await pg.query(
				"UPDATE billing_upgrade_refunds SET renewal_next_attempt_at=now()-interval '1 second' WHERE customer_id=$1",
				[h.customer],
			);
			await assert.rejects(h.run, /pending/);
			row = (await h.rows())[0];
			assert.equal(row.attempts, attempts);
			assert.equal(count(h, "list"), polls);
		} else {
			await h.due();
			await h.run();
		}
		row = (await h.rows())[0];
		assert.equal(row.renewal_status, "renewal_stopped");
		assert.ok(row.renewal_stopped_at);
		assert.equal(count(h, "cancel"), 2);
		assert.equal(count(h, "create"), creates);
		if (outcome === "failed" || outcome === "ambiguous")
			assert.equal(row.phase, "manual_review");
	}
});

test("cancellation provider read failures do not block financial progress and retry durably", async () => {
	const h = await fixture();
	h.options.subscriptionError = true;
	await assert.rejects(h.run, /subscription transient/);
	let row = (await h.rows())[0];
	assert.equal(row.phase, "done");
	assert.equal(row.renewal_status, "pending");
	assert.equal(count(h, "create"), 1);
	assert.equal(count(h, "cancel"), 0);
	h.options.subscriptionError = false;
	await h.due();
	await h.run();
	row = (await h.rows())[0];
	assert.equal(row.renewal_status, "renewal_stopped");
	assert.equal(count(h, "create"), 1);
	assert.equal(count(h, "cancel"), 1);
});

test("old ready jobs re-fetch the actual Lifetime order; reversals or binding mismatches freeze both actions", async () => {
	const patches = [
		{ id: randomUUID() },
		{ status: "refunded" },
		{ paid: false },
		{ refunded_amount: 1 },
		{ customer_id: randomUUID() },
		{ customer: { organization_id: "other-org" } },
		{ product_id: randomUUID() },
		{ checkout_id: randomUUID() },
		{ subscription_id: randomUUID() },
		{ created_at: "2026-10-17T00:00:00Z" },
	];
	for (const patch of patches) {
		const h = await fixture();
		h.options.getError = true;
		await assert.rejects(h.run, /get transient/);
		assert.equal((await h.rows())[0].phase, "ready");
		assert.equal(count(h, "create"), 0);
		assert.equal(count(h, "cancel"), 0);
		h.options.getError = false;
		h.options.freshLifetime = patch;
		await h.due();
		const report = await h.run();
		const row = (await h.rows())[0];
		assert.equal(row.reconciliation_required, true);
		assert.match(row.reconciliation_reason, /Lifetime order/);
		assert.equal(report.manualReview.length, 1);
		assert.equal(count(h, "create"), 0);
		assert.equal(count(h, "cancel"), 0);
		const calls = h.calls.length;
		await h.run();
		assert.equal(h.calls.length, calls);
	}
});

test("Lifetime is validated immediately before each first external action, not just at claim time", async () => {
	for (const action of ["cancel", "create"]) {
		const h = await fixture();
		const get = h.context.sdk.orders.get;
		let lifetimeReads = 0;
		h.context.sdk.orders.get = async (...args) => {
			const result = await get(...args);
			if (
				args[0] === h.lifetime.id &&
				++lifetimeReads === (action === "cancel" ? 2 : 3)
			)
				return { ...result, status: "refunded", refunded_amount: 10000 };
			return result;
		};
		await h.run();
		const row = (await h.rows())[0];
		assert.equal(row.reconciliation_required, true);
		assert.equal(count(h, "create"), 0);
		assert.equal(count(h, "cancel"), action === "cancel" ? 0 : 1);
	}
});

test("reversed Lifetime during a manual-finance cancellation retry never triggers a late cancellation", async () => {
	const h = await fixture();
	h.options.cancelError = true;
	h.options.status = "failed";
	await assert.rejects(h.run);
	assert.equal((await h.rows())[0].phase, "manual_review");
	h.options.cancelError = false;
	h.options.freshLifetime = { status: "refunded", refunded_amount: 10000 };
	await h.due();
	await h.run();
	assert.equal((await h.rows())[0].reconciliation_required, true);
	assert.equal(
		count(h, "cancel"),
		1,
		"No second cancellation after Lifetime reversal",
	);
	assert.equal(count(h, "create"), 1);
});

test("provider original-subscription ownership and product are checked before cancellation", async () => {
	for (const patch of [
		{ customer_id: randomUUID() },
		{ product_id: randomUUID() },
		{ customer: { organization_id: "other-org" } },
	]) {
		const h = await fixture();
		const get = h.context.sdk.subscriptions.get;
		h.context.sdk.subscriptions.get = async (...args) => ({
			...(await get(...args)),
			...patch,
		});
		await h.run();
		assert.equal((await h.rows())[0].reconciliation_required, true);
		assert.equal(count(h, "cancel"), 0);
		assert.equal(count(h, "create"), 0);
	}
});

test("checkouts paid at or after renewal get explicit financial review and still stop renewals for all apps", async () => {
	for (const plugin of [
		"frame-drop",
		"qube-auth",
		"whatsapp-commerce",
		"telegram-commerce",
	]) {
		for (const delay of [0, 86400000, 40 * 86400000]) {
			const h = await fixture(plugin);
			const end = Date.parse(h.binding.upgrade_period_end);
			h.lifetime.created_at = new Date(end + delay).toISOString();
			// Even if provider has advanced the period, this policy never guesses or mutates the frozen binding.
			h.subscriptions[0].current_period_start = h.binding.upgrade_period_end;
			h.subscriptions[0].current_period_end = "2026-12-01T00:00:00Z";
			h.context.orders.push({
				...h.paid,
				id: randomUUID(),
				checkout_id: null,
				created_at: h.binding.upgrade_period_end,
			});
			const report = await h.run();
			const row = (await h.rows())[0];
			assert.equal(report.skipped.length, 0);
			assert.equal(report.manualReview.length, 1);
			assert.equal(row.phase, "manual_review");
			assert.match(row.error, /outside frozen checkout period/);
			assert.equal(row.payload.period_start, h.binding.upgrade_period_start);
			assert.equal(row.payload.period_end, h.binding.upgrade_period_end);
			assert.equal(row.renewal_status, "renewal_stopped");
			assert.equal(count(h, "create"), 0);
			assert.equal(count(h, "cancel"), 1);
			await h.run();
			assert.equal(count(h, "cancel"), 1);
		}
	}
});

test("missing or invalid frozen periods on new explicitly bound upgrades require financial review, not silent skip", async () => {
	for (const mode of ["missing", "invalid"]) {
		const h = await fixture();
		if (mode === "missing") {
			h.binding.upgrade_period_start = null;
			h.binding.upgrade_period_end = null;
		} else h.binding.upgrade_period_end = h.binding.upgrade_period_start;
		await pg.query(
			"UPDATE billing_checkouts SET upgrade_period_start=$2,upgrade_period_end=$3 WHERE id=$1",
			[
				h.binding.id,
				h.binding.upgrade_period_start,
				h.binding.upgrade_period_end,
			],
		);
		const report = await h.run();
		assert.equal(report.skipped.length, 0);
		assert.equal(report.manualReview.length, 1);
		assert.equal((await h.rows())[0].renewal_status, "renewal_stopped");
		assert.equal(count(h, "create"), 0);
		assert.equal(count(h, "cancel"), 1);
	}
});

test("SQL rejects forged rollover periods and requires financial review for payment outside frozen bounds", async () => {
	const h = await fixture();
	h.lifetime.created_at = h.binding.upgrade_period_end;
	let candidate;
	h.context.db.rpc = async (name, args) => {
		candidate = args.p_candidates[0];
		return { data: { jobs: [], blocked: 0 }, error: null };
	};
	await h.run();
	assert.ok(candidate.review_reason);
	const claim = (payload) =>
		rpc("billing_claim_upgrade_refunds", {
			p_customer: h.customer,
			p_environment: "sandbox",
			p_candidates: [payload],
		});
	assert.ok((await claim({ ...candidate, review_reason: null })).error);
	assert.ok(
		(
			await claim({
				...candidate,
				period_start: h.binding.upgrade_period_end,
				period_end: "2026-12-01T00:00:00Z",
			})
		).error,
	);
	const result = await claim(candidate);
	assert.equal(result.error, null);
	assert.equal(result.data.jobs[0].phase, "manual_review");
	assert.equal(result.data.jobs[0].refund_claimed, false);
	assert.equal(result.data.jobs[0].renewal_claimed, true);
});

test("manual financial review cancellation is serialized across simultaneous workers", async () => {
	const h = await fixture();
	h.lifetime.created_at = h.binding.upgrade_period_end;
	const update = h.context.sdk.subscriptions.update;
	let unlock, entered;
	const gate = new Promise((resolve) => {
		unlock = resolve;
	});
	const seen = new Promise((resolve) => {
		entered = resolve;
	});
	h.context.sdk.subscriptions.update = async (...args) => {
		entered();
		await gate;
		return update(...args);
	};
	const first = h.run();
	await seen;
	await assert.rejects(h.run, /leased/);
	unlock();
	await first;
	assert.equal((await h.rows())[0].phase, "manual_review");
	assert.equal((await h.rows())[0].renewal_status, "renewal_stopped");
	assert.equal(count(h, "cancel"), 1);
	assert.equal(count(h, "create"), 0);
});

test("financial retry exhaustion cannot suppress an independently due cancellation", async () => {
	const h = await fixture();
	h.options.cancelError = true;
	h.options.listError = true;
	await assert.rejects(h.run);
	await pg.query(
		"UPDATE billing_upgrade_refunds SET attempts=5,phase='recovering' WHERE customer_id=$1",
		[h.customer],
	);
	h.options.cancelError = false;
	await h.due();
	const polls = count(h, "list");
	const report = await h.run();
	const row = (await h.rows())[0];
	assert.equal(row.phase, "manual_review");
	assert.equal(row.renewal_status, "renewal_stopped");
	assert.equal(row.attempts, 5);
	assert.equal(row.renewal_attempts, 2);
	assert.equal(count(h, "list"), polls);
	assert.equal(count(h, "create"), 0);
	assert.equal(count(h, "cancel"), 2);
	assert.equal(report.manualReview.length, 1);
});

test("lost cancellation response recovers provider-stopped state without blocking financial work", async () => {
	const h = await fixture();
	let calls = 0;
	h.context.sdk.subscriptions.update = async (id, body) => {
		h.calls.push(["cancel", id, body]);
		calls++;
		h.subscriptions[0].cancel_at_period_end = true;
		throw Error("cancellation response lost after acceptance");
	};
	await assert.rejects(h.run, /cancellation response lost/);
	assert.equal((await h.rows())[0].phase, "done");
	assert.equal((await h.rows())[0].renewal_status, "pending");
	await h.due();
	await h.run();
	assert.equal((await h.rows())[0].renewal_status, "renewal_stopped");
	assert.equal(calls, 1);
	assert.equal(count(h, "create"), 1);
});
