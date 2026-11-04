# Polar environments on Vercel and Supabase

One Qubtic deployment serves production and sandbox at the same time. Requests without a selector use production. Development plugins explicitly send `X-Billing-Environment: sandbox`. The selector is public routing configuration; it never grants access by itself. Accounts remain shared, while payment customers, purchases, entitlements, webhooks, and refunds remain environment-specific.

## Configure the backend

Keep both sets of credentials in the same Vercel project's server environment variables. They both need to be available in Vercel's **Production deployment environment** if that deployed server serves both live and development plugins. Vercel's Preview/Production deployment scopes are separate from Polar's sandbox/production modes.

- Use `.env.production.example` for `POLAR_PRODUCTION_*` keys.
- Use `.env.sandbox.example` for `POLAR_SANDBOX_*` keys.
- Set each environment's access token, organization UUID, webhook secret, and the product/benefit UUIDs of its enabled plugins.
- Leave all product/benefit keys empty for disabled plugins. Complete all four product/benefit keys for each enabled plugin.
- Keep Supabase URL/service role, auth, SMTP, and site-origin settings shared. Never expose Polar secrets or the Supabase service role through `NEXT_PUBLIC_*` or `VITE_*`.
- Locally, merge both credential namespaces into Qubtic's `.env` or `.env.local`. Backend `.env.sandbox.example` is a template, not an automatically loaded Next.js mode file. Vercel injects credentials directly; no runtime filesystem switching is used.

The existing local provider values were moved into their declared environment's namespace. Blank keys were added for the other environment and disabled plugins. No production credentials were invented. Keep real env files out of Git.

Legacy unprefixed `POLAR_*` keys are accepted only when `POLAR_ENVIRONMENT` explicitly names their matching environment and no explicit namespace exists for it. Never relabel sandbox credentials as production. Explicit namespaces do not borrow missing values from legacy keys. `POLAR_ENVIRONMENT` no longer switches the deployment's default request routing.

Validate/configure each environment independently after updating values:

```powershell
npm run billing:check -- --environment sandbox
npm run billing:check -- --environment production
npm run billing:check -- --environment sandbox --remote
npm run billing:check -- --environment production --remote
npm run billing:configure -- --environment sandbox
npm run billing:configure -- --environment production
```

Configuration commands use a Supabase service role and validate the matching Polar organization/products before catalog synchronization. They affect only the selected catalog. `--remote` is read-only; `billing:configure` writes the catalog.

## Apply the Supabase migration

After the existing billing, discounts, site billing, Telegram site billing, central configuration, and refund migrations, run `supabase/billing_environments.sql` in the Supabase SQL editor or your migration pipeline. It is repeatable, preserves billing records and entitlements, permits the same checkout retry key in different environments, and prevents sandbox synchronization from changing the shared production-facing plan display. Its one-time display repair derives plans from production memberships only; site-scoped APIs still authorize through site entitlements.

Do not rerun older entitlement-reset migrations to enable this feature. Existing environment-qualified billing records can coexist in the same Supabase database; a second Supabase project is not required.

## Register Polar webhooks

Configure these two destinations in their respective Polar dashboards:

```text
Production: https://www.qubtic.tech/api/billing/webhook/production
Sandbox:    https://www.qubtic.tech/api/billing/webhook/sandbox
```

Each route validates the signature with only its matching environment's secret, then processes provider data using that environment's client and organization. Register the same event types as the existing billing integration. The legacy `/api/billing/webhook` defaults to production; the query form `/api/billing/webhook?environment=sandbox` also works during migration. Move any existing sandbox webhook registration to its explicit sandbox URL when deploying.

## Background reconciliation

Both GET (Vercel Cron) and POST (external schedulers) are supported:

```text
/api/billing/reconcile/production
/api/billing/reconcile/sandbox
```

Use separate scheduler invocations so a sandbox provider failure does not consume production's execution budget. Configure Vercel `CRON_SECRET`; Vercel sends its bearer authorization automatically. Existing external jobs may continue using `BILLING_CRON_SECRET`. Never put either secret in a URL. Routes reject unauthenticated calls.

`vercel.cron.example.json` contains staggered ten-minute schedules. Merge its entries into `vercel.json` only if your Vercel plan supports that frequency; otherwise use an external scheduler at an appropriate frequency. Do not rely on a once-daily job for one-hour entitlement verification leases. Each invocation retains the existing bounded batches and durable retry behavior; monitor backlogs and tune frequency for traffic. Webhooks and explicit refresh remain active independently.

Vercel reference: https://vercel.com/docs/cron-jobs/manage-cron-jobs

## Build plugins

WhatsApp Commerce, Telegram Commerce, Frame Drop, and Qube Auth now support:

```powershell
# Development build: explicitly selects sandbox mode
npm run dev:sandbox
npm run build:sandbox

# Live build: defaults to production when the flag is absent
npm run build
```

The public flag is `VITE_QUBTIC_BILLING_ENVIRONMENT=sandbox`. The sandbox scripts also select sandbox through Vite mode, so a fresh checkout cannot silently send a sandbox build to production if its ignored local file is absent. A conflicting production flag in sandbox mode stops the plugin. Do not put it in a general `.env` when you want normal builds to remain production. `.env.sandbox.example` is the tracked plugin template; recreate ignored `.env.sandbox` from it in a fresh checkout. Use `build:sandbox` before packaging a development plugin; pack scripts that invoke normal `build` will regenerate production assets. The shared Qubtic website's billing UI remains production by default.

Access, billing, and user-display caches are namespaced by environment. Pairing establishes identity, then the plugin fetches environment-specific entitlement instead of granting access from a shared profile's plan. Checkout launch URLs preserve sandbox routing through polling; a sandbox checkout cannot reuse a production destination. Selecting sandbox is not proof of a trusted developer build; production access checks must omit the sandbox selector. Restrict sandbox to developer accounts separately if that policy is desired.

## Release order and acceptance

1. Populate both Vercel namespaces and apply the new Supabase migration.
2. Validate/synchronize both catalogs using explicit environment arguments.
3. Deploy Qubtic and update webhook destinations together. Existing live plugins without a selector use production.
4. Configure reconciliation for both environments.
5. Install a sandbox plugin build and complete a sandbox purchase. Check webhook processing, refresh, and Pro on the intended site.
6. Verify that the same account/site remains Free in production until it has its own production purchase, and existing production purchases remain active while sandbox purchases/refunds/cancellations are tested.

Local automated tests use mocked Polar calls and an embedded PostgreSQL test database. They do not prove live Vercel configuration, Supabase deployment, webhook delivery, or a real purchase. Polar requires independent sandbox tokens and organizations: https://polar.sh/docs/integrate/sandbox
