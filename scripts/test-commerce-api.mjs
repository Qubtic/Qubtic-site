import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const nativeRequire = createRequire(import.meta.url);
const root = new URL("../", import.meta.url);
function load(file, dependencies) {
	const source = readFileSync(new URL(file, root), "utf8");
	const js = ts.transpileModule(source, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ES2022,
			esModuleInterop: true,
		},
	}).outputText;
	const exports = {};
	new Function("require", "exports", js)(
		(name) => (name in dependencies ? dependencies[name] : nativeRequire(name)),
		exports,
	);
	return exports;
}
function harness() {
	const tables = { framer_users: [], framer_pairing_sessions: [] };
	const files = new Map();
	const messages = [];
	const supabase = {
		from(table) {
			const filters = [];
			let operation = "select";
			let payload;
			const query = {
				select() {
					return query;
				},
				eq(k, v) {
					filters.push((row) => row[k] === v);
					return query;
				},
				or(value) {
					const terms = value.split(",").map((term) => term.split(".eq."));
					filters.push((row) => terms.some(([k, v]) => row[k] === v));
					return query;
				},
				insert(value) {
					operation = "insert";
					payload = value;
					return query;
				},
				update(value) {
					operation = "update";
					payload = value;
					return query;
				},
				order() {
					return query;
				},
				async maybeSingle() {
					const r = await query;
					return { ...r, data: r.data?.[0] || null };
				},
				async single() {
					return query.maybeSingle();
				},
				then(resolve) {
					let rows = tables[table].filter((row) =>
						filters.every((filter) => filter(row)),
					);
					if (operation === "insert") {
						const row = {
							id: crypto.randomUUID(),
							...structuredClone(payload),
						};
						tables[table].push(row);
						rows = [row];
					}
					if (operation === "update")
						for (const row of rows)
							Object.assign(row, structuredClone(payload));
					return Promise.resolve({
						data: structuredClone(rows),
						error: null,
					}).then(resolve);
				},
			};
			return query;
		},
	};
	const registry = load("src/lib/plugins-registry.ts", {});
	const passwords = load("src/lib/passwords.ts", { "server-only": {} });
	const auth = load("src/lib/framer-auth.ts", {
		"./passwords": passwords,
		"./supabase": { supabase },
		"./plugins-registry": registry,
        "./managed-plugins": {serverPluginMetadata:async slug=>registry.getPluginMetadata(slug)},
		fs: {
			existsSync: (file) => files.has(file),
			mkdirSync() {},
			readFileSync: (file) => files.get(file),
			writeFileSync: (file, data) => files.set(file, data),
		},
		"./email-service": {
			sendVerificationEmail: async (...args) => messages.push(args),
			sendPasswordResetEmail: async (...args) => messages.push(args),
			sendNewUserTeamNotification: async () => {},
		},
	});
	const api = load("src/lib/commerce-access.ts", {
		"server-only": {},
		"./framer-auth": auth,
		"./billing/core": { environment: () => "production", actor: async () => ({}), paidAccess: async () => false, billingConfig: () => ({}), billingRequest: (_request, callback) => callback() },
		"./supabase": { supabase },
	});
	const next = {
		NextResponse: { json: (data, options) => Response.json(data, options) },
	};
	const route = (file) =>
		load(`src/app/api/framer-auth/${file}/route.ts`, {
			"next/server": next,
			"@/lib/framer-auth": auth,
			"@/lib/plugins-registry": registry,
			"@/lib/email-service": { sendTeamInviteEmail: async () => {} },
			"@/lib/passwords": passwords,
			"@/lib/auth-rate-limit": { authRateLimit: async () => true },
		});
	const request = (body, token) =>
		new Request("https://www.qubtic.tech/test", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			body: JSON.stringify(body),
		});
	return { auth, api, registry, tables, messages, route, request };
}
for (const product of ["whatsapp-commerce", "telegram-commerce"]) {
	const productName =
		product === "telegram-commerce" ? "Telegram Commerce" : "Email Commerce";
	async function signup(h, email = "owner@example.test") {
		await h.auth.sendAuthOtpCode(email, product);
		const code = h.messages.at(-1)[1];
		const response = await h
			.route("otp")
			.POST(
				h.request({
					action: "verify-signup",
					email,
					code,
					password: "secure-password",
					plugin: product,
					mode: "signup",
					plan: "pro",
					name: "Store Owner",
					company_name: "Studio",
				}),
			);
		assert.equal(response.status, 200);
		return response.json();
	}
	test("shared signup creates verified Free Email Commerce account even when the browser requests Pro", async () => {
		const h = harness();
		const result = await signup(h);
		assert.equal(result.user.plugin_slug, product);
		assert.equal(result.user.plugin_name, productName);
		assert.equal(result.user.plan, "free");
		assert.match(
			result.token,
			new RegExp(`^qbt_fr_${product.split("-")[0]}_[a-f0-9]{48}$`),
		);
		const user = await h.auth.verifyFramerSessionToken(result.token, product);
		assert.equal(user.metadata.email_verified, true);
		assert.equal(user.is_early_bird, false);
		assert.equal(h.tables.framer_users.length, 1);
		assert.equal(user.company_name, "Studio");
	});
	test("FrameDrop starts Free and keeps a separate account row", async () => {
		const h = harness();
		await signup(h);
		const drop = await h.auth.createOrUpdateFramerUser({
			email: "owner@example.test",
			pluginSlug: "frame-drop",
		});
		assert.equal(drop.user.plugin_name, "Frame Drop");
		assert.equal(h.tables.framer_users.length, 2);
		assert.equal(drop.user.is_early_bird, false);
		assert.equal(drop.user.plan, "free");
	});
	test("pairing uses shared tables and WhatsApp branding; another plugin cannot confirm it", async () => {
		const h = harness();
		const result = await signup(h);
		const pair = await h.auth.initiatePairingSession({
			pluginSlug: product,
			pluginName: "Frame Drop",
		});
		assert.match(pair.user_code, /^WC-/);
		assert.equal(
			new URL(pair.verification_uri_complete).pathname,
			`/auth/${product}`,
		);
		assert.equal(h.tables.framer_pairing_sessions[0].plugin_name, productName);
		const drop = await h.auth.createOrUpdateFramerUser({
			email: "owner@example.test",
			pluginSlug: "frame-drop",
		});
		assert.equal(
			(await h.auth.confirmPairingSession(pair.user_code, drop.user)).status,
			403,
		);
		const user = await h.auth.verifyFramerSessionToken(result.token, product);
		assert.equal(
			(await h.auth.confirmPairingSession(pair.user_code, user)).success,
			true,
		);
		const resolved = await h.auth.resolvePairingSession(pair.device_code);
		assert.equal(resolved.auth_token, result.token);
		assert.equal(resolved.user.plan, "free");
	});
	test("email codes are isolated by plugin and consumed after verification", async () => {
		const h = harness();
		await h.auth.sendAuthOtpCode("same@example.test", "frame-drop");
		const code = h.messages.at(-1)[1];
		assert.equal(
			(await h.auth.verifyAuthOtpCode("same@example.test", code, product))
				.valid,
			false,
		);
		assert.equal(
			(await h.auth.verifyAuthOtpCode("same@example.test", code, "frame-drop"))
				.valid,
			true,
		);
		assert.equal(
			(await h.auth.verifyAuthOtpCode("same@example.test", code, "frame-drop"))
				.valid,
			false,
		);
	});
	test("pending accounts, passwordless signin, forged plans, and team-switch cannot issue Commerce access", async () => {
		const h = harness();
		await h.auth.sendAuthOtpCode("pending@example.test", product);
		const pending = h.tables.framer_users[0];
		assert.equal(
			await h.auth.verifyFramerSessionToken(pending.auth_token, product),
			null,
		);
		const r = await h
			.route("session")
			.POST(
				h.request({
					email: pending.email,
					password: "whatever",
					plugin: product,
					mode: "signin",
				}),
			);
		assert.equal(r.status, 401);
		const teams = await h
			.route("teams")
			.POST(h.request({ email: pending.email, plugin: product, plan: "pro" }));
		assert.equal(teams.status, 403);
	});
	test("signin preserves server plan, rejects wrong passwords, and cannot replace password via metadata", async () => {
		const h = harness();
		const result = await signup(h);
		const original = h.tables.framer_users[0].metadata.password_hash;
		const route = h.route("session");
		assert.equal(
			(
				await route.POST(
					h.request({
						email: result.user.email,
						plugin: product,
						mode: "signin",
						password: "wrong-password",
					}),
				)
			).status,
			401,
		);
		const response = await route.POST(
			h.request({
				email: result.user.email,
				plugin: product,
				mode: "signin",
				password: "secure-password",
				plan: "pro",
				metadata: { password_hash: "attacker", is_early_bird: true },
			}),
		);
		assert.equal(response.status, 200);
		assert.equal((await response.json()).user.plan, "free");
		assert.equal(h.tables.framer_users[0].metadata.password_hash, original);
	});
	test("access adapter rechecks live server state and signout cannot be undone by a pairing snapshot", async () => {
		const h = harness();
		const result = await signup(h);
		const pair = await h.auth.initiatePairingSession({ pluginSlug: product });
		await h.auth.confirmPairingSession(
			pair.user_code,
			await h.auth.verifyFramerSessionToken(result.token, product),
		);
		await h.auth.resolvePairingSession(pair.device_code);
		const access = await h.api.commerceRequest(
			new Request("https://example.test/access", {
				headers: { Authorization: `Bearer ${result.token}` },
			}),
			"access",
			product,
		);
		assert.equal((await access.json()).is_pro, false);
		await h.auth.revokeCommerceSession(result.token);
		assert.equal(
			await h.auth.verifyFramerSessionToken(result.token, product),
			null,
		);
	});
	test("Commerce adapter refuses FrameDrop tokens and retires its separate signup API", async () => {
		const h = harness();
		const drop = await h.auth.createOrUpdateFramerUser({
			email: "drop@example.test",
			pluginSlug: "frame-drop",
		});
		assert.equal(
			(
				await h.api.commerceRequest(
					new Request("https://example.test/access", {
						headers: { Authorization: `Bearer ${drop.token}` },
					}),
					"access",
				)
			).status,
			401,
		);
		assert.equal(
			(await h.api.commerceRequest(h.request({}), "auth")).status,
			410,
		);
	});

	test("admin sessions reject tampering, unsigned legacy cookies, and expired cookies", () => {
		const previous = process.env.ADMIN_SESSION_SECRET;
		process.env.ADMIN_SESSION_SECRET = "local-test-signing-secret-at-least-32-characters";
		try {
			const admin = load("src/lib/admin-session.ts", { "server-only": {} });
			const token = admin.createAdminSession({
				id: "admin",
				name: "Admin",
				email: "admin@example.test",
				role: "admin",
			});
			assert.equal(admin.verifyAdminSession(token).id, "admin");
			assert.equal(
				admin.verifyAdminSession(
					Buffer.from(
						JSON.stringify({ email: "attacker@example.test" }),
					).toString("base64"),
				),
				null,
			);
			assert.equal(admin.verifyAdminSession(token + "tampered"), null);
			const body = Buffer.from(
				JSON.stringify({
					id: "admin",
					email: "admin@example.test",
					role: "admin",
					expiresAt: 1,
				}),
			).toString("base64url");
			const signature = nativeRequire("node:crypto")
				.createHmac("sha256", process.env.ADMIN_SESSION_SECRET)
				.update(body)
				.digest("base64url");
			assert.equal(admin.verifyAdminSession(`${body}.${signature}`), null);
		} finally {
			if (previous === undefined) delete process.env.ADMIN_SESSION_SECRET;
			else process.env.ADMIN_SESSION_SECRET = previous;
		}
	});
	test("shared admin user management requires a verified session and omits credentials", async () => {
		const route = (authenticated) =>
			load("src/app/api/framer-auth/users/route.ts", {
				"next/server": {
					NextResponse: {
						json: (data, options) => Response.json(data, options),
					},
				},
				"next/headers": {
					cookies: async () => ({ get: () => ({ value: "cookie" }) }),
				},
				"@/lib/admin-session": {
					verifyAdminSession: () => (authenticated ? { id: "admin" } : null),
				},
				"@/lib/framer-auth": {
					getFramerUsersList: async () => ({
						users: [
							{
								id: "user",
								email: "owner@example.test",
								plugin_slug: product,
								auth_token: "private-token",
								metadata: { password_hash: "private-hash" },
							},
						],
						stats: {},
					}),
					deleteFramerUser: async () => true,
				},
			});
		assert.equal(
			(
				await route(false).GET(
					new Request("https://example.test/api/framer-auth/users"),
				)
			).status,
			401,
		);
		assert.equal(
			(
				await route(false).DELETE(
					new Request("https://example.test/api/framer-auth/users?id=user"),
				)
			).status,
			401,
		);
		const response = await route(true).GET(
			new Request("https://example.test/api/framer-auth/users"),
		);
		const body = await response.json();
		assert.equal(body.users[0].plugin_slug, product);
		assert.equal(body.users[0].auth_token, undefined);
		assert.equal(body.users[0].metadata, undefined);
	});

	test("password reset stays within its plugin, consumes the code, and preserves Free access", async () => {
		const h = harness();
		const user = await signup(h);
		await h.auth.createOrUpdateFramerUser({
			email: user.user.email,
			pluginSlug: "frame-drop",
		});
		await h.auth.requestAuthPasswordReset(user.user.email, "frame-drop");
		const dropCode = h.messages.at(-1)[1];
		assert.equal(
			(
				await h.auth.resetAuthUserPassword(
					user.user.email,
					dropCode,
					"new-password",
					product,
				)
			).success,
			false,
		);
		await h.auth.requestAuthPasswordReset(user.user.email, product);
		const code = h.messages.at(-1)[1];
		const reset = await h.auth.resetAuthUserPassword(
			user.user.email,
			code,
			"new-password",
			product,
		);
		assert.equal(reset.success, true);
		assert.equal(reset.user.plan, "free");
		assert.equal(
			(
				await h.auth.resetAuthUserPassword(
					user.user.email,
					code,
					"another-password",
					product,
				)
			).success,
			false,
		);
		assert.equal(
			(
				await h
					.route("session")
					.POST(
						h.request({
							email: user.user.email,
							password: "new-password",
							plugin: product,
							mode: "signin",
						}),
					)
			).status,
			200,
		);
	});

	test("shared policy revokes legacy promotional Pro and ignores dates and requested signup plans", async () => {
		const h = harness();
		const account = await h.auth.createOrUpdateFramerUser({
			email: "drop@example.test",
			pluginSlug: "frame-drop",
			plan: "pro",
		});
		assert.equal(account.user.plan, "free");
		const row = h.tables.framer_users[0];
		row.plan = "pro";
		row.metadata.is_early_bird = true;
		assert.equal(
			(await h.auth.verifyFramerSessionToken(account.token, "frame-drop")).plan,
			"free",
		);
		row.metadata.is_early_bird = false;
		assert.equal(
			(await h.auth.verifyFramerSessionToken(account.token, "frame-drop")).plan,
			"pro",
		);
	});

	test(`${product} transport isolates pairing, access, and signout from the other Commerce plugin`, async () => {
		const h = harness();
		const other =
			product === "telegram-commerce"
				? "whatsapp-commerce"
				: "telegram-commerce";
		const result = await signup(h);
		const pairResponse = await h.api.commerceRequest(
			h.request({ action: "initiate" }),
			"pair",
			product,
		);
		assert.equal(pairResponse.status, 200);
		const pair = await pairResponse.json();
		assert.equal(
			new URL(pair.verification_uri_complete).pathname,
			`/auth/${product}`,
		);
		const resolve = await h.api.commerceRequest(
			h.request({ action: "resolve", device_code: pair.device_code }),
			"pair",
			other,
		);
		assert.equal(resolve.status, 400);
		const access = await h.api.commerceRequest(
			h.request({}, result.token),
			"access",
			other,
		);
		assert.equal(access.status, 401);
		const signout = await h.api.commerceRequest(
			h.request({}, result.token),
			"signout",
			other,
		);
		assert.equal(signout.status, 401);
		assert.ok(await h.auth.verifyFramerSessionToken(result.token, product));
		assert.equal(
			(
				await h.api.commerceRequest(
					h.request({}, result.token),
					"signout",
					product,
				)
			).status,
			200,
		);
		assert.equal(
			await h.auth.verifyFramerSessionToken(result.token, product),
			null,
		);
	});
}
