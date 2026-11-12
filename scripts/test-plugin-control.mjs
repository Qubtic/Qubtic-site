import { createRequire } from "node:module";
import * as billingConfig from "../src/lib/billing/config.mjs";
const native = createRequire(import.meta.url);
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { randomBytes } from "node:crypto";
import { encryptSecrets, decryptSecrets } from "../src/lib/plugin-secrets.mjs";
import ts from "typescript";
function load(file, deps) {
	const exports = {};
	const code = ts.transpileModule(
		readFileSync(new URL("../" + file, import.meta.url), "utf8"),
		{
			compilerOptions: {
				module: ts.ModuleKind.CommonJS,
				target: ts.ScriptTarget.ES2022,
			},
		},
	).outputText;
	new Function("require", "exports", code)((name) => {
		return name in deps
			? deps[name]
			: name === "@/lib/billing/discounts"
				? load("src/lib/billing/discounts.ts", {})
				: native(name);
	}, exports);
	return exports;
}
const discounts = load("src/lib/billing/discounts.ts", {});
const validDiscount = () => ({
	id: "discount-id",
	code: "SAVE",
	organization_id: "org",
	starts_at: null,
	ends_at: null,
	max_redemptions: null,
	redemptions_count: 0,
	products: [],
});

test("admin dashboard source is valid UTF-8 for Turbopack", () => {
	const bytes = readFileSync(
		new URL("../src/components/admin/PluginDashboard.tsx", import.meta.url),
	);
	assert.doesNotThrow(() =>
		new TextDecoder("utf-8", { fatal: true }).decode(bytes),
	);
});

test("discount settings default, trim and reject malformed or incomplete selections", () => {
	assert.deepEqual(discounts.validateDiscountConfig(undefined), {
		code: "",
		cadences: [],
	});
	assert.deepEqual(
		discounts.validateDiscountConfig({ code: " SAVE ", cadences: ["monthly"] }),
		{ code: "SAVE", cadences: ["monthly"] },
	);
	assert.deepEqual(
		discounts.validateDiscountConfig({ code: " ", cadences: [] }),
		{ code: "", cadences: [] },
	);
	for (const value of [
		null,
		[],
		{},
		{ code: 1, cadences: [] },
		{ code: "x".repeat(129), cadences: ["monthly"] },
		{ code: "SAVE\n", cadences: ["monthly"] },
		{ code: "SA\u007fVE", cadences: ["monthly"] },
		{ code: "SAVE", cadences: ["weekly"] },
		{ code: "SAVE", cadences: ["monthly", "monthly"] },
		{ code: "SAVE", cadences: [] },
		{ code: "", cadences: ["yearly"] },
		{ code: "SAVE", cadences: "monthly" },
	])
		assert.throws(() => discounts.validateDiscountConfig(value));
});

test("discount resolution reads all pages, exact-matches codes and skips unselected plans", async () => {
	const calls = [];
	const sdk = {
		discounts: {
			list: async (query) => {
				calls.push(query);
				return {
					items:
						query.page === 1
							? [{ ...validDiscount(), code: "SAVE-MORE" }]
							: [validDiscount()],
					pagination: { max_page: 2 },
				};
			},
		},
	};
	const config = { code: " SAVE ", cadences: ["monthly"] };
	assert.equal(
		await discounts.resolveCheckoutDiscount(
			sdk,
			undefined,
			"monthly",
			"product",
			"org",
		),
		undefined,
	);
	assert.equal(
		await discounts.resolveCheckoutDiscount(
			sdk,
			config,
			"yearly",
			"product",
			"org",
		),
		undefined,
	);
	assert.equal(calls.length, 0);
	assert.equal(
		await discounts.resolveCheckoutDiscount(
			sdk,
			config,
			"monthly",
			"product",
			"org",
		),
		"discount-id",
	);
	assert.deepEqual(
		calls,
		[1, 2].map((page) => ({
			organization_id: "org",
			query: "SAVE",
			limit: 100,
			page,
		})),
	);
	sdk.discounts.list = async () => ({
		items: [validDiscount()],
		pagination: { max_page: 2 },
	});
	await assert.rejects(
		() =>
			discounts.resolveCheckoutDiscount(
				sdk,
				config,
				"monthly",
				"product",
				"org",
			),
		/exactly one/,
	);
});

test("discount resolution rejects inactive, exhausted, foreign or product-restricted discounts safely", async () => {
	const config = { code: "SAVE", cadences: ["monthly", "yearly", "lifetime"] };
	let items = [validDiscount()];
	const sdk = {
		discounts: { list: async () => ({ items, pagination: { max_page: 1 } }) },
	};
	for (const [patch, message] of [
		[{ starts_at: "2999-01-01T00:00:00Z" }, /not active/],
		[{ ends_at: "2000-01-01T00:00:00Z" }, /expired/],
		[{ starts_at: "invalid" }, /start time/],
		[{ ends_at: "invalid" }, /end time/],
		[{ max_redemptions: 2, redemptions_count: 2 }, /redemption limit/],
		[{ max_redemptions: 0 }, /redemption limit/],
		[{ organization_id: "other" }, /different organization/],
		[{ products: [{ id: "other" }] }, /product restrictions/],
	]) {
		items = [{ ...validDiscount(), ...patch }];
		await assert.rejects(
			() =>
				discounts.resolveCheckoutDiscount(
					sdk,
					config,
					"monthly",
					"product",
					"org",
				),
			message,
		);
	}
	items = [];
	await assert.rejects(
		() =>
			discounts.resolveCheckoutDiscount(
				sdk,
				config,
				"monthly",
				"product",
				"org",
			),
		/exactly one/,
	);
	items = [
		{
			...validDiscount(),
			starts_at: "2000-01-01T00:00:00Z",
			ends_at: "2999-01-01T00:00:00Z",
			max_redemptions: 2,
			redemptions_count: 1,
			products: [{ id: "product" }],
		},
	];
	for (const cadence of config.cadences)
		assert.equal(
			await discounts.resolveCheckoutDiscount(
				sdk,
				config,
				cadence,
				"product",
				"org",
			),
			"discount-id",
		);
	sdk.discounts.list = async () => {
		throw Error("secret-provider-response");
	};
	await assert.rejects(
		() =>
			discounts.resolveCheckoutDiscount(
				sdk,
				config,
				"monthly",
				"product",
				"org",
			),
		(error) =>
			error.message.includes("discounts:read") &&
			!error.message.includes("secret-provider-response"),
	);
});

test("disabled or missing managed billing configuration fails before decrypting credentials", async () => {
	let row = null,
		reads = 0,
		decryptions = 0;
	const control = load("src/lib/plugin-control.ts", {
		"server-only": {},
		"./supabase": {
			supabase: {
				from: () => {
					const q = {
						select() {
							return q;
						},
						eq(_key, id) {
							assert.match(id, /^polar:(production|sandbox)$/);
							return q;
						},
						maybeSingle: async () => {
							reads++;
							return { data: row };
						},
					};
					return q;
				},
			},
		},
		"./plugin-secrets.mjs": {
			decryptSecrets: () => {
				decryptions++;
				throw Error("Must not decrypt disabled credentials");
			},
		},
	});
	for (const environment of ["production", "sandbox"]) {
		row = null;
		await assert.rejects(() => control.loadManagedBilling(environment), {
			code: "BILLING_ENVIRONMENT_NOT_CONFIGURED",
		});
		row = {
			id: "polar:" + environment,
			settings: { enabled: false },
			secrets: "encrypted",
		};
		await assert.rejects(() => control.loadManagedBilling(environment), {
			code: "BILLING_ENVIRONMENT_DISABLED",
		});
	}
	assert.equal(reads, 4);
	assert.equal(decryptions, 0);
});
test("credentials are encrypted, authenticated, bound to their row and fail closed with the wrong key", () => {
	const key = randomBytes(32).toString("base64");
	const secret = {
		accessToken: "private-token",
		webhookSecret: "private-signing-secret",
	};
	const cipher = encryptSecrets(secret, key, "polar:production");
	assert.ok(!cipher.includes("private"));
	assert.deepEqual(decryptSecrets(cipher, key, "polar:production"), secret);
	assert.throws(() => decryptSecrets(cipher, key, "polar:sandbox"));
	assert.throws(() =>
		decryptSecrets(
			cipher,
			randomBytes(32).toString("base64"),
			"polar:production",
		),
	);
	assert.throws(() => encryptSecrets(secret, "bad", "mail"));
});
test("publishing uses revisions and atomically preserves unrelated environments, audit and historical product ownership", async () => {
	const db = new PGlite();
	try {
		await db.exec(
			"create role anon;create role authenticated;create role service_role;create table billing_catalog(environment text,product_id text,plugin_slug text,cadence text,benefit_id text,enabled boolean,primary key(environment,product_id));",
		);
		await db.exec(
			readFileSync(
				new URL(
					"../supabase/migrations/20261104092628_plugin_control.sql",
					import.meta.url,
				),
				"utf8",
			),
		);
		const publish = (id, revision, rows) =>
			db.query("select publish_plugin_control($1,$2,$3,$4,$5,$6)", [
				id,
				JSON.stringify({ enabled: true }),
				"encrypted-only",
				revision,
				"admin",
				JSON.stringify(rows),
			]);
		const rows = [
			{
				product_id: "product",
				plugin_slug: "telegram-commerce",
				cadence: "yearly",
				benefit_id: "benefit",
			},
		];
		await publish("polar:production", 0, rows);
		await publish("polar:sandbox", 0, rows);
		await assert.rejects(() => publish("polar:production", 0, rows));
		await assert.rejects(() =>
			publish("polar:production", 1, [
				{ ...rows[0], plugin_slug: "other-plugin" },
			]),
		);
		assert.equal(
			(
				await db.query(
					"select revision from plugin_control where id='polar:production'",
				)
			).rows[0].revision,
			1,
		);
		assert.equal(
			(
				await db.query(
					"select count(*)::int as n from billing_catalog where enabled",
				)
			).rows[0].n,
			2,
		);
		assert.equal(
			(await db.query("select count(*)::int as n from plugin_control_audit"))
				.rows[0].n,
			2,
		);
		for (const role of ["anon", "authenticated"]) {
			assert.equal(
				(
					await db.query(
						"select has_table_privilege($1,'plugin_control','SELECT') as allowed",
						[role],
					)
				).rows[0].allowed,
				false,
			);
			assert.equal(
				(
					await db.query(
						"select has_function_privilege($1,'publish_plugin_control(text,jsonb,text,integer,text,jsonb)','EXECUTE') as allowed",
						[role],
					)
				).rows[0].allowed,
				false,
			);
		}
	} finally {
		await db.close();
	}
});
test("admin API denies unsigned users and cross-origin writes and never returns stored secrets", async () => {
	let session = null;
	const calls = [];
	const row = {
		id: "polar:production",
		settings: { enabled: false },
		secrets: "ciphertext",
		revision: 1,
	};
	const query = {
		select() {
			return query;
		},
		order() {
			return query;
		},
		limit() {
			return Promise.resolve({ data: [] });
		},
		then(resolve) {
			return Promise.resolve({ data: [row] }).then(resolve);
		},
	};
	const api = load("src/app/api/admin/plugins/route.ts", {
		"@/lib/managed-plugins": {
			registeredPlugins: async () =>
				Object.values(
					load("src/lib/plugins-registry.ts", {}).REGISTERED_PLUGINS,
				).filter((p, i, a) => a.findIndex((v) => v.slug === p.slug) === i),
		},
		"next/headers": {
			cookies: async () => ({ get: () => ({ value: "cookie" }) }),
		},
		"@/lib/admin-session": { verifyAdminSession: () => session },
		"@/lib/supabase": { supabase: { from: () => query } },
		"@/lib/plugin-control": {
			controlRecord: async () => row,
			recordSecrets: () => ({ accessToken: "never-return-this" }),
		},
		"@/lib/plugin-secrets.mjs": { encryptSecrets },
		"@/lib/billing/config.mjs": {},
		"@polar-sh/sdk/2026-10": {},
		nodemailer: {},
	});
	assert.equal((await api.GET()).status, 401);
	session = { id: "admin", role: "admin" };
	const response = await api.GET();
	const data = await response.json();
	assert.equal(data.records[0].secrets, undefined);
	assert.deepEqual(data.records[0].configuredSecrets, ["accessToken"]);
	assert.equal(
		new Set(data.plugins.map((p) => p.slug)).size,
		data.plugins.length,
	);
	assert.ok(!JSON.stringify(data).includes("never-return-this"));
	assert.equal(
		(
			await api.POST(
				new Request("https://site.test/api/admin/plugins", {
					method: "POST",
					headers: { origin: "https://attacker.test" },
					body: "{}",
				}),
			)
		).status,
		400,
	);
	assert.equal(calls.length, 0);
});

test("sandbox is restricted to approved verified accounts while production is independent", async () => {
	const user = {
		id: "user",
		email: "tester@example.test",
		plugin_slug: "telegram-commerce",
		status: "active",
		metadata: { email_verified: true },
	};
	let allowed = "";
	const core = load("src/lib/billing/core.ts", {
		"server-only": {},
		"./config.mjs": billingConfig,
		"./upgrade-refunds": {},
		"../email-service": {},
		"../plugin-control": {
			loadManagedBilling: async (selected) => ({
				POLAR_ENVIRONMENT: selected,
				managed: "true",
				MANAGED_PLUGINS: JSON.stringify([
					{ slug: "telegram-commerce", enabled: true, testEmails: allowed },
				]),
			}),
		},
		"@supabase/supabase-js": {
			createClient: () => ({
				from: () => {
					const q = {
						select() {
							return q;
						},
						eq() {
							return q;
						},
						maybeSingle: async () => ({ data: user }),
					};
					return q;
				},
			}),
		},
		"@polar-sh/sdk/2026-10": {},
	});
	process.env.SUPABASE_URL = "https://example.supabase.co";
	process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only";
	const request = (selected) => {
		const req = new Request("https://example.test/api/billing/status", {
			headers: {
				Authorization: "Bearer test",
				"X-Billing-Environment": selected,
			},
		});
		return core.billingRequest(req, async () =>
			Response.json(await core.actor(req)),
		);
	};
	assert.equal((await request("sandbox")).status, 403);
	assert.equal((await request("production")).status, 200);
	allowed = "tester@example.test";
	assert.equal((await request("sandbox")).status, 200);
	user.metadata.email_verified = false;
	assert.equal((await request("sandbox")).status, 401);
});

test("SMTP delivery uses ENV without requiring database configuration or its encryption key", async () => {
	const keys = [
		"SMTP_HOST",
		"SMTP_PORT",
		"SMTP_SECURE",
		"SMTP_USER",
		"SMTP_PASS",
		"SMTP_FROM_EMAIL",
	];
	const original = Object.fromEntries(
		keys.map((key) => [key, process.env[key]]),
	);
	let options;
	try {
		Object.assign(process.env, {
			SMTP_HOST: "smtp.example.test",
			SMTP_PORT: "465",
			SMTP_USER: "env-user",
			SMTP_PASS: "env-password",
			SMTP_FROM_EMAIL: "sender@example.test",
		});
		const mail = load("src/lib/email-service.ts", {
            "./billing/purchase-notifications": load("src/lib/billing/purchase-notifications.ts"),
			"./plugin-control": {
				loadManagedMail: async () => {
					throw Error("Must not read DB for transport/sender");
				},
			},
			nodemailer: {
				default: {
					createTransport: (value) => {
						options = value;
						return { verify: async () => {} };
					},
				},
			},
			"./managed-plugins": {
				serverPluginMetadata: async () => ({ name: "Telegram Commerce" }),
			},
			"./logoAssets": {},
			"./plugins-registry": {
				getPluginMetadata: () => ({ name: "Telegram Commerce" }),
			},
		});
		await mail.getMailTransporter();
		assert.equal(options.host, "smtp.example.test");
		assert.equal(options.secure, true);
		assert.deepEqual(options.auth, { user: "env-user", pass: "env-password" });
		assert.equal(options.tls.rejectUnauthorized, true);
		assert.match(
			await mail.getSender("telegram-commerce"),
			/sender@example.test/,
		);
		delete process.env.SMTP_PASS;
		await assert.rejects(() => mail.getMailTransporter(), /not configured/);
	} finally {
		for (const key of keys) {
			if (original[key] === undefined) delete process.env[key];
			else process.env[key] = original[key];
		}
	}
});

test("mail API exposes only preferences and rejects database SMTP credential writes", async () => {
	let published;
	const row = {
		id: "mail",
		settings: {
			teamEmail: "team@example.test",
			signup: true,
			signin: false,
			purchase: true,
			host: "legacy-host",
			from: "old@example.test",
			password: "legacy-password",
		},
		secrets: "old-ciphertext",
		revision: 1,
	};
	const query = {
		select() {
			return query;
		},
		order() {
			return query;
		},
		eq() {
			return query;
		},
		limit: async () => ({ data: [] }),
		maybeSingle: async () => ({ data: null }),
		then(resolve) {
			return Promise.resolve({ data: [row] }).then(resolve);
		},
	};
	const api = load("src/app/api/admin/plugins/route.ts", {
		"@/lib/managed-plugins": { registeredPlugins: async () => [] },
		"next/headers": {
			cookies: async () => ({ get: () => ({ value: "cookie" }) }),
		},
		"@/lib/admin-session": {
			verifyAdminSession: () => ({ id: "admin", role: "admin" }),
		},
		"@/lib/supabase": {
			supabase: {
				from: () => query,
				rpc: async (name, args) => {
					published = args;
					return {};
				},
			},
		},
		"@/lib/plugin-control": {
			controlRecord: async () => row,
			recordSecrets: () => {
				throw Error("Mail secrets must not be decrypted");
			},
		},
		"@/lib/plugin-secrets.mjs": {
			encryptSecrets: () => {
				throw Error("No SMTP encryption needed");
			},
		},
		"@/lib/billing/config.mjs": {},
		"@polar-sh/sdk/2026-10": {},
	});
	const data = await (await api.GET()).json();
	assert.deepEqual(data.records[0].configuredSecrets, []);
	assert.deepEqual(data.records[0].settings, {
		teamEmail: "team@example.test",
		signup: true,
		signin: false,
		purchase: true,
	});
	assert.ok(!JSON.stringify(data).includes("legacy"));
	const request = (body) =>
		new Request("https://site.test/api/admin/plugins", {
			method: "POST",
			headers: { origin: "https://site.test" },
			body: JSON.stringify(body),
		});
	const settings = {
		teamEmail: "new@example.test",
		signup: false,
		signin: true,
		purchase: true,
	};
	assert.equal(
		(
			await api.POST(
				request({
					id: "mail",
					revision: 1,
					settings,
					secrets: { password: "forbidden" },
				}),
			)
		).status,
		400,
	);
	assert.equal(
		(
			await api.POST(
				request({
					id: "mail",
					revision: 1,
					settings: { ...settings, host: "forbidden" },
				}),
			)
		).status,
		400,
	);
	assert.equal(
		(
			await api.POST(
				request({ id: "mail", revision: 1, settings, secrets: {} }),
			)
		).status,
		200,
	);
	assert.equal(published.p_secrets, "");
	assert.deepEqual(published.p_settings, settings);
});

test("one shared Pro benefit is validated against every plan and expanded into the catalog", async () => {
	let published;
	const checked = [],
		discountChecks = [];
	let providerDiscount = validDiscount();
	const benefit = "319ad5dd-6194-4ba7-9f57-b955a4390dd4",
		organization = "d43e5d7d-6f92-4a84-a9cc-65e8c8efc786";
	const plans = ["monthly", "yearly", "lifetime"].map((cadence, i) => ({
		cadence,
		productId: `d5876f82-cbd2-4189-b25a-e8367ff852e${i}`,
		benefitId: "",
	}));
	const query = {
		select() {
			return query;
		},
		eq() {
			return query;
		},
		limit: async () => ({}),
		maybeSingle: async () => ({ data: null }),
	};
	const api = load("src/app/api/admin/plugins/route.ts", {
		"@/lib/managed-plugins": {
			registeredPlugins: async () => [
				{ slug: "telegram-commerce", name: "Telegram Commerce" },
				{ slug: "new-tool", name: "New Tool" },
			],
		},
		"next/headers": {
			cookies: async () => ({ get: () => ({ value: "cookie" }) }),
		},
		"@/lib/admin-session": {
			verifyAdminSession: () => ({ id: "admin", role: "admin" }),
		},
		"@/lib/supabase": {
			supabase: {
				from: () => query,
				rpc: async (name, args) => {
					published = args;
					return {};
				},
			},
		},
		"@/lib/plugin-control": {
			controlRecord: async () => null,
			recordSecrets: () => ({}),
		},
		"@/lib/plugin-secrets.mjs": { encryptSecrets: () => "encrypted" },
		"@/lib/billing/config.mjs": billingConfig,
		"@polar-sh/sdk/2026-10": {
			createPolar: () => ({
				discounts: {
					list: async (query) => {
						discountChecks.push(query);
						return {
							items: [{ ...providerDiscount, organization_id: organization }],
							pagination: { max_page: 1 },
						};
					},
				},
				organizations: { get: async () => ({ id: organization }) },
				products: {
					get: async (id) => {
						checked.push(id);
						const cadence = plans.find((p) => p.productId === id).cadence;
						return {
							organization_id: organization,
							is_archived: false,
							benefits: [{ id: benefit }],
							is_recurring: cadence !== "lifetime",
							recurring_interval: cadence === "monthly" ? "month" : "year",
							recurring_interval_count: 1,
							prices: [
								{ is_archived: false, amount_type: "fixed", price_amount: 100 },
							],
						};
					},
				},
			}),
		},
	});
	const plugin = {
		slug: "telegram-commerce",
		enabled: true,
		manifest: "{}",
		testEmails: "",
		benefitId: benefit,
		plans,
	};
	const body = {
		id: "polar:production",
		revision: 0,
		settings: {
			enabled: true,
			organizationId: organization,
			plugins: [plugin],
		},
		secrets: { accessToken: "test-only", webhookSecret: "test-only" },
	};
	const response = await api.POST(
		new Request("https://site.test/api/admin/plugins", {
			method: "POST",
			headers: { origin: "https://site.test" },
			body: JSON.stringify(body),
		}),
	);
	assert.equal(response.status, 200, JSON.stringify(await response.json()));
	assert.equal(checked.length, 3);
	assert.equal(published.p_catalog.length, 3);
	assert.ok(published.p_catalog.every((row) => row.benefit_id === benefit));
	assert.ok(
		published.p_settings.plugins[0].plans.every(
			(plan) => plan.benefitId === benefit,
		),
	);
	plugin.slug = "new-tool";
	assert.equal(
		(
			await api.POST(
				new Request("https://site.test/api/admin/plugins", {
					method: "POST",
					headers: { origin: "https://site.test" },
					body: JSON.stringify(body),
				}),
			)
		).status,
		200,
	);
	assert.equal(published.p_settings.plugins[0].name, "New Tool");
	assert.ok(published.p_catalog.every((row) => row.plugin_slug === "new-tool"));

	const post = () =>
		api.POST(
			new Request("https://site.test/api/admin/plugins", {
				method: "POST",
				headers: { origin: "https://site.test" },
				body: JSON.stringify(body),
			}),
		);
	assert.deepEqual(published.p_settings.plugins[0].discount, {
		code: "",
		cadences: [],
	});
	plugin.discount = { code: " SAVE ", cadences: ["monthly", "lifetime"] };
	for (const environment of ["production", "sandbox"]) {
		body.id = "polar:" + environment;
		assert.equal((await post()).status, 200);
		assert.deepEqual(published.p_settings.plugins[0].discount, {
			code: "SAVE",
			cadences: ["monthly", "lifetime"],
		});
		assert.equal(published.p_id, body.id);
	}
	assert.equal(discountChecks.length, 4);
	providerDiscount.products = [{ id: plans[0].productId }];
	const lastPublished = published;
	assert.equal((await post()).status, 400);
	assert.equal(published, lastPublished);
	const beforeDisabled = discountChecks.length;
	plugin.enabled = false;
	assert.equal((await post()).status, 200);
	assert.equal(discountChecks.length, beforeDisabled);
	assert.deepEqual(published.p_settings.plugins[0].discount, {
		code: "SAVE",
		cadences: ["monthly", "lifetime"],
	});
	plugin.discount.cadences = [];
	assert.equal((await post()).status, 400);
	plugin.enabled = true;
	delete plugin.discount;
	body.id = "polar:production";
	plugin.slug = "unregistered-tool";
	assert.equal(
		(
			await api.POST(
				new Request("https://site.test/api/admin/plugins", {
					method: "POST",
					headers: { origin: "https://site.test" },
					body: JSON.stringify(body),
				}),
			)
		).status,
		400,
	);
	plugin.slug = "new-tool";
	delete plugin.benefitId;
	plugin.plans[0].benefitId = benefit;
	plugin.plans[1].benefitId = organization;
	assert.equal(
		(
			await api.POST(
				new Request("https://site.test/api/admin/plugins", {
					method: "POST",
					headers: { origin: "https://site.test" },
					body: JSON.stringify(body),
				}),
			)
		).status,
		400,
	);
});
