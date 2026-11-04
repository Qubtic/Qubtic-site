> Historical analysis before implementation. See [POLAR_ENVIRONMENTS.md](POLAR_ENVIRONMENTS.md) for the implemented configuration and deployment steps.

# Polar sandbox and production isolation: analysis and implementation plan

Date: 2026-11-04. Scope: local source inspection; no deployment, provider configuration, payment, or database changes performed.

## Finding

The requested behavior is not implemented end to end. Qubtic supports either Polar environment, selected globally for the deployment, rather than selecting it separately for each plugin request. Adding a sandbox file alone will not isolate simultaneous sandbox and production traffic.

Polar itself isolates sandbox from production and requires separately created sandbox access tokens, accounts, and organizations: https://polar.sh/docs/integrate/sandbox

## Evidence from the current source

| Area | Existing behavior | Required change |
| --- | --- | --- |
| Server configuration | `src/lib/billing/core.ts` reads global `POLAR_ENVIRONMENT`, `POLAR_ACCESS_TOKEN`, and `POLAR_ORGANIZATION_ID`. | Resolve an immutable environment-specific configuration per request or background job. |
| Product configuration | `src/lib/billing/config.mjs` builds one catalog from the active environment and unprefixed product/benefit keys. | Build and validate catalogs independently for both environments. |
| Billing API | `src/app/api/billing/[action]/route.ts` chooses the global environment for catalog, status, checkout, resolve, refresh, portal, subscription operations, and reconciliation. | Carry one selected environment consistently through every operation. |
| Webhooks | `webhook()` verifies against one global webhook secret and records events under the global environment. | Separate signed webhook destinations and secrets; process events in their bound environment. |
| Licensing | `paidAccess()`, `src/lib/commerce-access.ts`, and Framer auth verify/entitlement routes use the global billing environment. | Apply environment selection to access verification as well as checkout. |
| Storage | Customers, memberships, catalogs, orders, subscriptions, events, and checkout locks already use environment separation in important keys or filters. | Reuse this design; audit every query, RPC, uniqueness constraint, and refund job for consistent separation. |
| Entitlements | Plugin/site entitlements reference customers; customer IDs are distinct for each environment. | Preserve environment separation through customer joins; no automatic wholesale entitlement-table rewrite is indicated. |
| Compatibility plan | `supabase/billing.sql` updates the shared `framer_users.plan` display projection during synchronization. | Prevent sandbox sync from changing production-facing plan displays; authorization must use environment-specific entitlements. |
| Plugin clients | WhatsApp Commerce, Telegram Commerce, Frame Drop, and Qube Auth send requests to the central billing API without an environment selector in the inspected clients. | Add a shared pattern for selecting the environment in each plugin build. |
| Checkout launcher | `public/billing-launch.js` resolves by channel, with no environment selector; URL validation currently accepts both environments. | Preserve environment through launch/resolve and restrict destinations to the selected environment. |
| Browser cache | Commerce billing cache keys use token/site without an environment; access caches also need review. | Namespace access, billing, pending checkout, and related cache state by environment. |
| Setup tooling | `scripts/configure-billing.mjs` checks/configures one global environment. | Require explicit environment selection and ensure only that catalog is changed. |

The local `.env` currently selects sandbox and contains a configured sandbox credential/catalog set. This does not establish the live deployment's configuration. Secret values were not printed or copied into this report.

## Proposed behavior

1. A development plugin sets `VITE_QUBTIC_BILLING_ENVIRONMENT=sandbox`.
2. Its account-access and billing requests send `X-Billing-Environment: sandbox`.
3. Qubtic resolves sandbox credentials, organization, catalog, customer identity, and entitlements for that request.
4. A plugin with no selector uses production. Explicit `production` is also accepted. Unknown or empty supplied values are rejected rather than silently redirected.
5. Missing configuration for either environment disables that environment's operation. There is no credential or provider fallback between environments.
6. Production and sandbox requests can execute concurrently without changing shared `process.env` or any mutable global current-environment variable.

The frontend flag is public configuration, not a secret or proof of a trusted development build. Selecting sandbox must never grant production access. Existing account authentication, plugin binding, and site binding remain required. If sandbox use should be restricted to developers, enforce that through a server-side account allowlist rather than a secret embedded in the plugin.

## Server configuration design

Use explicit namespaces to make accidental credential mixing harder:

```dotenv
# Backend only: production
POLAR_PRODUCTION_ACCESS_TOKEN=
POLAR_PRODUCTION_ORGANIZATION_ID=
POLAR_PRODUCTION_WEBHOOK_SECRET=
POLAR_PRODUCTION_EMAIL_COMMERCE_MONTHLY_PRODUCT_ID=
POLAR_PRODUCTION_EMAIL_COMMERCE_YEARLY_PRODUCT_ID=
POLAR_PRODUCTION_EMAIL_COMMERCE_LIFETIME_PRODUCT_ID=
POLAR_PRODUCTION_EMAIL_COMMERCE_PRO_BENEFIT_ID=

# Backend only: sandbox
POLAR_SANDBOX_ACCESS_TOKEN=
POLAR_SANDBOX_ORGANIZATION_ID=
POLAR_SANDBOX_WEBHOOK_SECRET=
POLAR_SANDBOX_EMAIL_COMMERCE_MONTHLY_PRODUCT_ID=
POLAR_SANDBOX_EMAIL_COMMERCE_YEARLY_PRODUCT_ID=
POLAR_SANDBOX_EMAIL_COMMERCE_LIFETIME_PRODUCT_ID=
POLAR_SANDBOX_EMAIL_COMMERCE_PRO_BENEFIT_ID=
```

Apply the same namespace pattern to Telegram Commerce, Frame Drop, Qube Auth, and extra catalog configuration. Preserve the current product/benefit semantics. The plugin receives no Polar token, webhook secret, organization secret, or private API key; hosted checkout does not need a Polar publishable key here.

Provide sanitized `.env.sandbox.example` and production templates. Keep real files ignored. If a real local `.env.sandbox` is desired, load it explicitly once at server startup with a documented precedence policy, allowing only sandbox-prefixed billing keys. Never switch files per request or treat `.env.sandbox` as Next.js's automatic environment selection. In hosting, configure both namespaces as server environment variables in the same deployment.

Keep existing unprefixed variables supported during migration only for the environment explicitly declared by legacy `POLAR_ENVIRONMENT`. In particular, the currently configured sandbox variables must never become a production fallback. New explicit namespaced configuration takes precedence; an incomplete explicit configuration must fail rather than borrowing values from the legacy set.

## Implementation sequence

1. Add and test pure environment parsing and configuration resolution. Pass an explicit immutable context through billing helpers and refund processing. Do not mutate process globals per request.
2. Update billing, commerce-access, Framer auth verification/entitlement, and CORS handling. Preserve production behavior for clients that omit the selector after production is configured.
3. Bind checkout creation, reuse, launch links, resolve polling, and customer portal destinations to the same environment. Validate persisted ownership and environment on all reused records.
4. Add environment-specific webhook routes, for example `/api/billing/webhook/production` and `/api/billing/webhook/sandbox`. Verify each using only its matching secret and organization. Preserve the legacy webhook endpoint's declared-environment behavior during migration until its provider registration is moved.
5. Run reconciliation for each configured environment with bounded independent batches. One environment's failure must not skip the other's work. Bind refund retries and subscription mutations to saved records and matching provider clients.
6. Audit SQL and add only necessary migrations. Review checkout request-key uniqueness, shared plan projections, and cross-environment joins. Do not rerun broad entitlement-reset migrations as a shortcut.
7. Add build-time configuration and environment-aware requests/caches to the four plugin clients and the Qubtic billing UI. Carry the selector through verification and launch flows. Release builds omit the sandbox flag; local development builds opt in explicitly.
8. Extend setup commands with `--environment sandbox` and `--environment production`, validate each catalog independently, and document local/hosted configuration and migration.

## Verification and rollout

- Run simultaneous sandbox and production requests and assert matching provider credentials, organization, products, customer identity, and entitlement results.
- Test omitted selector, invalid selector, incomplete configuration, and legacy sandbox-only configuration. Never fall back across environments.
- Prove a sandbox purchase cannot unlock production for the same account/site, and sandbox refund, cancellation, or synchronization cannot alter production billing records or plan displays.
- Test webhook signature separation, duplicate event IDs across environments, checkout launch polling, cache separation, portal URLs, refund retries, and independent reconciliation failure handling.
- Run applicable `npm run typecheck`, `npm test`, and `npm run build` checks for changed projects. Keep all CSS external if UI changes are needed.
- Populate and validate both server configurations, synchronize catalogs separately, register both webhook destinations, then deploy the compatible backend before releasing sandbox-enabled plugin builds.
- Complete a sandbox purchase/webhook/access test while independently checking production catalog/status behavior. Any production purchase test needs an explicitly authorized real transaction.

No implementation or verification commands have been run for a change in this analysis phase. Live credentials, database migrations, plugin publication states, webhook registrations, and deployed behavior remain unverified.
