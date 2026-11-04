import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { createClient } from "@supabase/supabase-js";
import { createPolar } from "@polar-sh/sdk/2026-10";
import { readFileSync } from "node:fs";
import {
	configuredCatalog,
    resolveBillingConfig,
    parseBillingEnvironment,
	configurationProblems,
	billingSiteUrl,
	catalogMatches,
	PLUGINS,
	CADENCES,
} from "../src/lib/billing/config.mjs";
const args = new Set(process.argv.slice(2));
const rawArgs = process.argv.slice(2);
const envIndex = rawArgs.indexOf("--environment");
let selected;
try {
    if (envIndex < 0 && !args.has("--example")) throw new Error("Pass --environment sandbox or --environment production explicitly.");
    selected = parseBillingEnvironment(envIndex < 0 ? null : rawArgs[envIndex + 1] ?? "");
} catch (error) { console.error(error.message); process.exit(1); }
if (!args.has("--example")) loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
const config = resolveBillingConfig(process.env, selected);

if (args.has("--organization")) {
	if (
		!config.POLAR_ACCESS_TOKEN ||
		!["sandbox", "production"].includes(config.POLAR_ENVIRONMENT)
	) {
		console.error(`Set POLAR_${selected.toUpperCase()}_ACCESS_TOKEN first.`);
		process.exitCode = 1;
	} else {
		try {
			const client = createPolar({
				accessToken: config.POLAR_ACCESS_TOKEN,
				environment: config.POLAR_ENVIRONMENT,
				timeout: 20,
			});
			const result = await client.organizations.list({ limit: 2 });
			if (result.items.length !== 1 || result.pagination.total_count !== 1)
				throw new Error(
					"Expected exactly one accessible organization. Copy your organization UUID from Polar settings.",
				);
			console.log(`POLAR_${selected.toUpperCase()}_ORGANIZATION_ID=${result.items[0].id}`);
		} catch {
			console.error(
				"Could not resolve the organization. Check your Organization Access Token and environment.",
			);
			process.exitCode = 1;
		}
	}
} else if (args.has("--example")) {
	const example =
		readFileSync(new URL("../.env.example", import.meta.url), "utf8") +
		"\n" +
		readFileSync(new URL("../TELEGRAM_BILLING.md", import.meta.url), "utf8");
	const keys = new Set(
		[...example.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((match) => match[1]),
	);
    const required = ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','ADMIN_SESSION_SECRET','PLUGIN_CONFIG_ENCRYPTION_KEY','NEXT_PUBLIC_SITE_URL'];
	const missing = required.filter((key) => !keys.has(key));
	if (missing.length) {
		console.error("Missing template keys: " + missing.join(", "));
		process.exitCode = 1;
	} else
		console.log(
			"Bootstrap ENV template includes every required control-plane setting. No credentials loaded and no network requests made.",
		);
} else {
	const problems = configurationProblems(config);
	if (problems.length) {
		for (const problem of problems) console.error(problem.replaceAll("POLAR_", `POLAR_${selected.toUpperCase()}_`));
		process.exitCode = 1;
	} else {
		const rows = configuredCatalog(config),
			origin = billingSiteUrl(config);
		console.log(
			`Local configuration valid: ${rows.length} plans; ${config.POLAR_ENVIRONMENT}. Values and secrets are hidden.`,
		);
		console.log(`Webhook: ${origin}/api/billing/webhook/${selected}`);
		if (args.has("--remote") || args.has("--apply")) {
			try {
				const db = createClient(
					process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
					process.env.SUPABASE_SERVICE_ROLE_KEY,
					{ auth: { persistSession: false, autoRefreshToken: false } },
				);
				const polar = createPolar({
					accessToken: config.POLAR_ACCESS_TOKEN,
					environment: config.POLAR_ENVIRONMENT,
					timeout: 20,
				});
				// OATs use resource APIs; OAuth authorize requires an OAuth client and cannot inspect OAT scopes.
				const organizations = await polar.organizations.list({ limit: 2 });
				if (
					organizations.items.length !== 1 ||
					organizations.pagination.total_count !== 1 ||
					organizations.items[0].id !== config.POLAR_ORGANIZATION_ID
				)
					throw new Error(
						"Use an Organization Access Token belonging to POLAR_ORGANIZATION_ID.",
					);
				for (const service of [
					polar.customers,
					polar.orders,
					polar.subscriptions,
				])
					await service.list({
						organization_id: config.POLAR_ORGANIZATION_ID,
						limit: 1,
					});
				const org = await polar.organizations.get(
					config.POLAR_ORGANIZATION_ID,
				);
				if (org.id !== config.POLAR_ORGANIZATION_ID)
					throw new Error("Organization mismatch.");
				for (const row of rows) {
					const product = await polar.products.get(row.product_id);
					if (
						product.organization_id !== org.id ||
						product.is_archived ||
						!product.benefits.some((benefit) => benefit.id === row.benefit_id)
					)
						throw new Error(
							`${row.plugin_slug}/${row.cadence}: product or attached Pro benefit is invalid.`,
						);
					if (
						row.cadence === "lifetime"
							? product.is_recurring
							: !product.is_recurring ||
								product.recurring_interval !==
									(row.cadence === "monthly" ? "month" : "year") ||
								product.recurring_interval_count !== 1
					)
						throw new Error(
							`${row.plugin_slug}/${row.cadence}: billing interval does not match.`,
						);
					const prices = product.prices.filter((price) => !price.is_archived);
					if (
						!prices.length ||
						prices.some(
							(price) =>
								price.amount_type !== "fixed" ||
								typeof price.price_amount !== "number" ||
								price.price_amount <= 0,
						)
					)
						throw new Error(
							`${row.plugin_slug}/${row.cadence}: configure a positive fixed price.`,
						);
				}
				const { data: current, error } = await db
					.from("billing_catalog")
					.select("*")
					.eq("environment", config.POLAR_ENVIRONMENT);
				if (error)
					throw new Error(
						"Billing schema is unavailable. Apply the billing migrations first.",
					);
				if (rows.some((row) => row.plugin_slug === "telegram-commerce")) {
					const { error: siteError } = await db.rpc(
						"billing_site_has_purchase",
						{ p_customer: null, p_site: "", p_plugin: "telegram-commerce" },
					);
					if (siteError)
						throw new Error(
							"Telegram site billing schema is unavailable. Apply supabase/billing_telegram_sites.sql before deploying Telegram billing.",
						);
				}
				const { error: refundSchemaError } = await db
					.from("billing_upgrade_refunds")
					.select("id")
					.limit(0);
				if (refundSchemaError)
					throw new Error(
						"Upgrade refund schema is unavailable. Apply supabase/billing_upgrade_refunds.sql before deploying the refund worker.",
					);
				await polar.refunds.list({
					organization_id: config.POLAR_ORGANIZATION_ID,
					limit: 1,
				});
				if (args.has("--apply")) {
                    const {data:managed}=await db.from('plugin_control').select('id').eq('id','polar:'+selected).maybeSingle();
                    if(managed)throw new Error('This environment is managed by Plugins & payments. Publish through the dashboard.');
					const { data, error: applyError } = await db.rpc(
						"billing_configure_catalog",
						{ p_environment: config.POLAR_ENVIRONMENT, p_rows: rows },
					);
					if (applyError)
						throw new Error(
							"Catalog synchronization failed. Apply billing_central_config.sql and check server-role permissions.",
						);
					console.log(
						`Synced ${data} enabled plans from central ENV. Retired rows were retained for purchase history.`,
					);
				} else if (!catalogMatches(current || [], rows))
					throw new Error(
						"Database catalog differs from ENV. Run npm run billing:configure after reviewing your settings.",
					);
				console.log(
					"Remote checks passed: resource read permissions, organization, products, benefits, prices, and database catalog. Checkout, refund, subscription-update, and customer-session write permissions require the sandbox acceptance test. No checkout or payment was created.",
				);
				console.log(
					"Webhook delivery and cron execution still require the sandbox acceptance test in POLAR_DASHBOARD_GUIDE.md.",
				);
			} catch (error) {
				console.error(
					error instanceof Error && error.message && !("statusCode" in error)
						? error.message
						: "Remote validation failed. Check credentials, token scopes, environment, and connectivity. Provider payloads are hidden.",
				);
				process.exitCode = 1;
			}
		}
	}
}
