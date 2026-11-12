import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import {
	billingSiteUrl,
	configuredCatalog,
	catalogMatches,
	configurationProblems,
	REQUIRED_SCOPES,
} from "../src/lib/billing/config.mjs";
function example() {
	return {
		POLAR_ENVIRONMENT: "sandbox",
		NEXT_PUBLIC_SITE_URL: "https://www.qubtic.tech",
		SUPABASE_URL: "https://example.supabase.co",
		SUPABASE_SERVICE_ROLE_KEY: "test-only",
		POLAR_ACCESS_TOKEN: "test-only",
		POLAR_ORGANIZATION_ID: randomUUID(),
		POLAR_WEBHOOK_SECRET: "test-only",
		BILLING_CRON_SECRET: "a".repeat(64),
		ADMIN_SESSION_SECRET: "b".repeat(64),
		SMTP_USER: "test-only",
		SMTP_PASS: "test-only",
		POLAR_WHATSAPP_COMMERCE_MONTHLY_PRODUCT_ID: randomUUID(),
		POLAR_WHATSAPP_COMMERCE_YEARLY_PRODUCT_ID: randomUUID(),
		POLAR_WHATSAPP_COMMERCE_LIFETIME_PRODUCT_ID: randomUUID(),
		POLAR_WHATSAPP_COMMERCE_PRO_BENEFIT_ID: randomUUID(),
	};
}
test("Telegram ENV supplies a separate three-plan catalog and rejects partial or shared-benefit configuration", () => {
	const env = example();
	env.POLAR_TELEGRAM_COMMERCE_MONTHLY_PRODUCT_ID = randomUUID();
	env.POLAR_TELEGRAM_COMMERCE_YEARLY_PRODUCT_ID = randomUUID();
	env.POLAR_TELEGRAM_COMMERCE_LIFETIME_PRODUCT_ID = randomUUID();
	env.POLAR_TELEGRAM_COMMERCE_PRO_BENEFIT_ID = randomUUID();
	const telegram = configuredCatalog(env).filter(
		(row) => row.plugin_slug === "telegram-commerce",
	);
	assert.equal(telegram.length, 3);
	assert.ok(
		telegram.every(
			(row) => row.benefit_id === env.POLAR_TELEGRAM_COMMERCE_PRO_BENEFIT_ID,
		),
	);
	const shared = {
		...env,
		POLAR_TELEGRAM_COMMERCE_PRO_BENEFIT_ID:
			env.POLAR_WHATSAPP_COMMERCE_PRO_BENEFIT_ID,
	};
	assert.throws(() => configuredCatalog(shared), /distinct Pro benefit/);
	delete env.POLAR_TELEGRAM_COMMERCE_YEARLY_PRODUCT_ID;
	assert.throws(
		() => configuredCatalog(env),
		/POLAR_TELEGRAM_COMMERCE_YEARLY_PRODUCT_ID/,
	);
});
test("central ENV supplies three distinct products with one reserved Pro benefit", () => {
	const env = example(),
		rows = configuredCatalog(env);
	assert.equal(rows.length, 3);
	assert.equal(new Set(rows.map((row) => row.product_id)).size, 3);
	assert.equal(new Set(rows.map((row) => row.benefit_id)).size, 1);
	assert.ok(rows.every((row) => row.environment === "sandbox"));
	assert.deepEqual(configurationProblems(env), []);
});
test("incomplete groups, wrong identifier types, and reused products fail before payment creation", () => {
	const env = example();
	delete env.POLAR_WHATSAPP_COMMERCE_YEARLY_PRODUCT_ID;
	assert.throws(() => configuredCatalog(env), /YEARLY_PRODUCT_ID/);
	env.POLAR_WHATSAPP_COMMERCE_YEARLY_PRODUCT_ID =
		"https://buy.polar.sh/example";
	assert.throws(() => configuredCatalog(env), /UUID/);
	env.POLAR_WHATSAPP_COMMERCE_YEARLY_PRODUCT_ID =
		env.POLAR_WHATSAPP_COMMERCE_MONTHLY_PRODUCT_ID;
	assert.throws(() => configuredCatalog(env), /unique/);
});
test("future plugins are configured centrally and cannot share another plugins benefit", () => {
	const env = example();
	const benefit = randomUUID();
	env.POLAR_EXTRA_CATALOG_JSON = JSON.stringify(
		["monthly", "yearly", "lifetime"].map((cadence) => ({
			plugin_slug: "future-plugin",
			cadence,
			product_id: randomUUID(),
			benefit_id: benefit,
		})),
	);
	assert.equal(configuredCatalog(env).length, 6);
	env.POLAR_EXTRA_CATALOG_JSON = env.POLAR_EXTRA_CATALOG_JSON.replaceAll(
		benefit,
		env.POLAR_WHATSAPP_COMMERCE_PRO_BENEFIT_ID,
	);
	assert.throws(() => configuredCatalog(env), /distinct Pro benefit/);
});
test("checkout return origin follows central ENV and rejects insecure production origins", () => {
	assert.equal(
		billingSiteUrl({
			NEXT_PUBLIC_SITE_URL: "https://www.qubtic.tech/",
			POLAR_ENVIRONMENT: "production",
		}),
		"https://www.qubtic.tech",
	);
	assert.equal(
		billingSiteUrl({
			NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
			POLAR_ENVIRONMENT: "sandbox",
		}),
		"http://localhost:3000",
	);
	for (const origin of [
		"http://example.test",
		"https://user:pass@example.test",
		"https://example.test/?token=secret",
		"https://example.test/path",
	])
		assert.throws(() =>
			billingSiteUrl({
				NEXT_PUBLIC_SITE_URL: origin,
				POLAR_ENVIRONMENT: "production",
			}),
		);
});
test("runtime catalog check ignores retired rows but detects missing or wrong active product mapping", () => {
	const rows = configuredCatalog(example());
	assert.equal(
		catalogMatches(
			[...rows, { ...rows[0], enabled: false, product_id: randomUUID() }],
			rows,
		),
		true,
	);
	assert.equal(catalogMatches(rows.slice(1), rows), false);
	assert.equal(
		catalogMatches(
			rows.map((row, i) => (i ? row : { ...row, product_id: randomUUID() })),
			rows,
		),
		false,
	);
});
test("missing credential checks reveal only names and enforce independent strong local secrets", () => {
	const env = example();
	delete env.POLAR_ACCESS_TOKEN;
	env.ADMIN_SESSION_SECRET = "short";
	const problems = configurationProblems(env).join(" ");
	assert.match(problems, /POLAR_ACCESS_TOKEN/);
	assert.match(problems, /ADMIN_SESSION_SECRET/);
	assert.ok(!problems.includes(env.SMTP_PASS));
	assert.ok(REQUIRED_SCOPES.includes("customer_sessions:write"));
});
test("single sanitized template is complete; example validation loads no real environment", () => {
	const file = readFileSync(
		new URL("../.env.example", import.meta.url),
		"utf8",
	);
	for (const key of [
		"CLOUDINARY_API_KEY",
		"CLOUDINARY_API_SECRET",

		"PLUGIN_CONFIG_ENCRYPTION_KEY",
        "ADMIN_SESSION_SECRET",
        "CRON_SECRET",
        "SUPABASE_SERVICE_ROLE_KEY",
		"SUPABASE_SERVICE_ROLE_KEY",
	])
		assert.match(file, new RegExp("^" + key + "=$", "m"));
	const child = spawnSync(
		process.execPath,
		["scripts/configure-billing.mjs", "--example"],
		{ cwd: new URL("..", import.meta.url), encoding: "utf8" },
	);
	assert.equal(child.status, 0, child.stderr);
	assert.match(child.stdout, /No credentials loaded/);
	assert.ok(!child.stdout.includes("test-only"));
});


test("Email Commerce uses current keys while preserving existing paid-site identities and legacy configuration", () => {
 const legacy = example();
 const renamed = { ...legacy };
 for (const key of Object.keys(legacy)) {
  if (key.startsWith("POLAR_WHATSAPP_COMMERCE_")) {
   renamed[key.replace("WHATSAPP_COMMERCE", "EMAIL_COMMERCE")] = renamed[key];
   delete renamed[key];
  }
 }
 assert.deepEqual(configuredCatalog(renamed), configuredCatalog(legacy));
 assert.ok(configuredCatalog(renamed).every(row => row.plugin_slug === "whatsapp-commerce"));
 assert.deepEqual(configuredCatalog({ ...legacy, ...renamed }), configuredCatalog(legacy));
 const partial = { ...legacy, POLAR_EMAIL_COMMERCE_MONTHLY_PRODUCT_ID: legacy.POLAR_WHATSAPP_COMMERCE_MONTHLY_PRODUCT_ID };
 assert.throws(() => configuredCatalog(partial), /POLAR_EMAIL_COMMERCE_YEARLY_PRODUCT_ID/);
 assert.throws(() => configuredCatalog({ ...legacy, ...renamed, POLAR_EMAIL_COMMERCE_MONTHLY_PRODUCT_ID: randomUUID() }), /Conflicting Email Commerce/);
});


test("managed FrameDrop accepts one Lifetime product without weakening commerce catalogs", () => {
 const row = {plugin_slug:'frame-drop',cadence:'lifetime',product_id:randomUUID(),benefit_id:randomUUID()};
 assert.equal(configuredCatalog({POLAR_ENVIRONMENT:'sandbox',POLAR_EXTRA_CATALOG_JSON:JSON.stringify([row])}).length,1);
 for(const slug of ['telegram-commerce','whatsapp-commerce']) assert.throws(()=>configuredCatalog({POLAR_ENVIRONMENT:'sandbox',POLAR_EXTRA_CATALOG_JSON:JSON.stringify([{...row,plugin_slug:slug}])}),/Configure monthly/);
 assert.throws(()=>configuredCatalog({POLAR_ENVIRONMENT:'sandbox',POLAR_EXTRA_CATALOG_JSON:JSON.stringify([{...row,cadence:'monthly'}])}),/Configure monthly/);
});
