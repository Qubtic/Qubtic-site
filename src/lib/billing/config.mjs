/** Central server configuration shared by the Next backend and setup CLI. No credentials are returned to plugins. */
export const CADENCES = ["monthly", "yearly", "lifetime"];
export const PLUGINS = [
	{ slug: "whatsapp-commerce", prefix: "POLAR_EMAIL_COMMERCE", aliases: ["POLAR_WHATSAPP_COMMERCE"] },
	{ slug: "telegram-commerce", prefix: "POLAR_TELEGRAM_COMMERCE" },
	{ slug: "frame-drop", prefix: "POLAR_FRAME_DROP" },
	{ slug: "qube-auth", prefix: "POLAR_QUBE_AUTH" },
];
export const REQUIRED_SCOPES = [
	"organizations:read",
	"products:read",
	"customers:read",
	"orders:read",
	"subscriptions:read",
	"subscriptions:write",
	"refunds:read",
	"refunds:write",
	"checkouts:write",
	"customer_sessions:write",
];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function billingSiteUrl(env) {
	const url = new URL(env.NEXT_PUBLIC_SITE_URL || "https://www.qubtic.tech");
	const local = ["localhost", "127.0.0.1"].includes(url.hostname);
	if (
		url.username ||
		url.password ||
		url.search ||
		url.hash ||
		url.pathname !== "/" ||
		(url.protocol !== "https:" &&
			!(
				env.POLAR_ENVIRONMENT === "sandbox" &&
				local &&
				url.protocol === "http:"
			))
	)
		throw new Error(
			"NEXT_PUBLIC_SITE_URL must be a clean HTTPS origin (sandbox also permits local HTTP).",
		);
	if (env.POLAR_ENVIRONMENT === "production" && local)
		throw new Error("Production billing cannot return to localhost.");
	return url.origin;
}
export function configuredCatalog(env) {
	const environment = env.POLAR_ENVIRONMENT;
	if (!["sandbox", "production"].includes(environment))
		throw new Error("Set POLAR_ENVIRONMENT to sandbox or production.");
	const rows = [];
	for (const plugin of PLUGINS) {
        // Branding changed; the stored plugin slug remains stable for existing paid sites.
        const suffixes = [...CADENCES.map(cadence => `${cadence.toUpperCase()}_PRODUCT_ID`), "PRO_BENEFIT_ID"];
        const prefixes = [plugin.prefix, ...(plugin.aliases || [])];
        const active = prefixes.filter(prefix => suffixes.some(suffix => env[`${prefix}_${suffix}`]?.trim()));
        for (const suffix of suffixes) {
            const values = active.map(prefix => env[`${prefix}_${suffix}`]?.trim().toLowerCase()).filter(Boolean);
            if (new Set(values).size > 1)
                throw new Error(`Conflicting Email Commerce configuration: use ${plugin.prefix}_${suffix} consistently; remove the conflicting legacy alias.`);
        }
        // Do not stitch an incomplete new group together with legacy keys.
        const prefix = active[0] || plugin.prefix;
        const keys = suffixes.map(suffix => `${prefix}_${suffix}`);
		if (!keys.some((key) => env[key]?.trim())) continue;
		const missing = keys.filter((key) => !env[key]?.trim());
		if (missing.length)
			throw new Error(
				`Complete this plugin configuration: ${missing.join(", ")}.`,
			);
		for (const cadence of CADENCES)
			rows.push({
				plugin_slug: plugin.slug,
				cadence,
				environment,
				product_id:
					env[`${prefix}_${cadence.toUpperCase()}_PRODUCT_ID`].trim(),
				benefit_id: env[`${prefix}_PRO_BENEFIT_ID`].trim(),
				enabled: true,
			});
	}
	if (env.POLAR_EXTRA_CATALOG_JSON?.trim()) {
		let extra;
		try {
			extra = JSON.parse(env.POLAR_EXTRA_CATALOG_JSON);
		} catch {
			throw new Error("POLAR_EXTRA_CATALOG_JSON must be a JSON array.");
		}
		if (!Array.isArray(extra) || extra.length > 300)
			throw new Error(
				"POLAR_EXTRA_CATALOG_JSON must be an array of at most 300 plans.",
			);
		for (const row of extra) rows.push({ ...row, environment, enabled: true });
	}
	const products = new Set(),
		cadences = new Set(),
		benefits = new Map(),
		plugins = new Map();
	for (const row of rows) {
		if (
			!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.plugin_slug || "") ||
			!CADENCES.includes(row.cadence) ||
			!uuid.test(row.product_id || "") ||
			!uuid.test(row.benefit_id || "")
		)
			throw new Error(
				"Every configured plan needs a plugin slug, supported cadence, Product UUID, and Benefit UUID.",
			);
		row.product_id = row.product_id.toLowerCase();
		row.benefit_id = row.benefit_id.toLowerCase();
		const key = `${row.plugin_slug}:${row.cadence}`;
		if (products.has(row.product_id) || cadences.has(key))
			throw new Error("Product IDs and plugin/cadence pairs must be unique.");
		if (
			(benefits.has(row.benefit_id) &&
				benefits.get(row.benefit_id) !== row.plugin_slug) ||
			(plugins.has(row.plugin_slug) &&
				plugins.get(row.plugin_slug) !== row.benefit_id)
		)
			throw new Error(
				"Use one distinct Pro benefit per plugin, shared by its three products.",
			);
		products.add(row.product_id);
		cadences.add(key);
		benefits.set(row.benefit_id, row.plugin_slug);
		plugins.set(row.plugin_slug, row.benefit_id);
	}
	for (const slug of plugins.keys())
		if (rows.filter((row) => row.plugin_slug === slug).length !== 3)
			throw new Error(`Configure monthly, yearly, and lifetime for ${slug}.`);
	return rows;
}
export function configurationProblems(env) {
	const problems = [];
	for (const key of [
		"SUPABASE_SERVICE_ROLE_KEY",
		"POLAR_ACCESS_TOKEN",
		"POLAR_ORGANIZATION_ID",
		"POLAR_WEBHOOK_SECRET",
		"BILLING_CRON_SECRET",
		"ADMIN_SESSION_SECRET",
		"SMTP_USER",
		"SMTP_PASS",
	])
		if (!env[key]?.trim()) problems.push(`Missing ${key}.`);
	if (!(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL)?.trim())
		problems.push("Missing SUPABASE_URL.");
	if (env.POLAR_ORGANIZATION_ID && !uuid.test(env.POLAR_ORGANIZATION_ID))
		problems.push(
			"POLAR_ORGANIZATION_ID must be the organization UUID, not its name or slug.",
		);
	for (const key of ["BILLING_CRON_SECRET", "ADMIN_SESSION_SECRET"])
		if (env[key] && env[key].length < 32)
			problems.push(`${key} must contain at least 32 random characters.`);
	if (
		env.BILLING_CRON_SECRET &&
		env.BILLING_CRON_SECRET === env.ADMIN_SESSION_SECRET
	)
		problems.push(
			"BILLING_CRON_SECRET and ADMIN_SESSION_SECRET must be different.",
		);
	try {
		billingSiteUrl(env);
	} catch (error) {
		problems.push(error.message);
	}
	try {
		if (!configuredCatalog(env).length)
			problems.push(
				"Configure all four product/benefit ID variables for at least one plugin.",
			);
	} catch (error) {
		problems.push(error.message);
	}
	return problems;
}
export function catalogMatches(actual, desired) {
	const signature = (rows) =>
		rows
			.filter((row) => row.enabled)
			.map(
				(row) =>
					`${row.plugin_slug}|${row.cadence}|${row.product_id.toLowerCase()}|${row.benefit_id.toLowerCase()}`,
			)
			.sort()
			.join("\n");
	return signature(actual) === signature(desired);
}

/** Public selectors are routing hints, never authorization or provider credentials. */
export function parseBillingEnvironment(value) {
    if (value === null || value === undefined) return "production";
    if (value !== "sandbox" && value !== "production")
        throw new Error("Billing environment must be sandbox or production.");
    return value;
}
/** Return a private snapshot; never mutate process.env while serving a request. */
export function resolveBillingConfig(source, selected = "production") {
    const environment = parseBillingEnvironment(selected);
    const prefix = `POLAR_${environment.toUpperCase()}_`;
    const explicit = Object.keys(source).some(key => key.startsWith(prefix));
    const legacy = !explicit && source.POLAR_ENVIRONMENT === environment;
    const result = { ...source, POLAR_ENVIRONMENT: environment };
    // Remove both namespaces and every legacy provider key before projecting one set.
    for (const key of Object.keys(result)) if (key.startsWith("POLAR_")) delete result[key];
    result.POLAR_ENVIRONMENT = environment;
    if (legacy) {
        for (const [key, value] of Object.entries(source))
            if (key.startsWith("POLAR_") && !/^POLAR_(SANDBOX|PRODUCTION)_/.test(key)) result[key] = value;
    } else {
        for (const [key, value] of Object.entries(source))
            if (key.startsWith(prefix)) result[`POLAR_${key.slice(prefix.length)}`] = value;
    }
    return Object.freeze(result);
}
