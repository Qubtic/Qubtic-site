# Telegram live billing repair and Email Commerce rename

Checked on 2026-11-04 using the configured Polar organizations and Supabase project. No provider secrets or customer records are included here.

## What was repaired

- Telegram's production products, benefits, billing intervals, prices, and token read permissions validated against Polar. Supabase had no production catalog records. The existing catalog RPC synchronized its three production plans.
- Email Commerce's new `EMAIL_COMMERCE` env keys were ignored by the old billing loader. The loader now prefers these keys and accepts complete old `WHATSAPP_COMMERCE` groups for compatibility. Conflicting aliases and incomplete new groups are rejected with actionable variable names.
- Sandbox had enabled Telegram test plans despite no Telegram sandbox configuration. Its catalog now enables only the three configured Email Commerce plans; previous Telegram sandbox rows remain stored as retired history. Production Telegram rows remain enabled independently.
- Public backend product/pairing names and the payment-return page now say Email Commerce. The `email-commerce` auth alias resolves to the existing account/pairing identity. Existing `whatsapp-commerce` account IDs, tokens, URLs, purchase bindings, and site entitlements are intentionally retained. No account/billing-table rename is required.
- Billing configuration errors now identify the selected environment and invalid/missing variable names rather than hiding every cause behind a generic error. No credential values are returned.
- Duplicate local Polar assignments were consolidated without changing their effective values.

## What you must do in Vercel

The local CLI's saved token is invalid. Use `vercel login` if you want CLI access, or use the existing Qubtic project's dashboard.

1. Set these keys under **Production** in that project's Environment Variables. This is Vercel's deployment scope; it must contain both Polar namespaces when one deployed server serves both modes.

```dotenv
# Live Telegram payments
POLAR_PRODUCTION_ACCESS_TOKEN=
POLAR_PRODUCTION_ORGANIZATION_ID=
POLAR_PRODUCTION_WEBHOOK_SECRET=
POLAR_PRODUCTION_TELEGRAM_COMMERCE_MONTHLY_PRODUCT_ID=
POLAR_PRODUCTION_TELEGRAM_COMMERCE_YEARLY_PRODUCT_ID=
POLAR_PRODUCTION_TELEGRAM_COMMERCE_LIFETIME_PRODUCT_ID=
POLAR_PRODUCTION_TELEGRAM_COMMERCE_PRO_BENEFIT_ID=

# Email Commerce development payments
POLAR_SANDBOX_ACCESS_TOKEN=
POLAR_SANDBOX_ORGANIZATION_ID=
POLAR_SANDBOX_WEBHOOK_SECRET=
POLAR_SANDBOX_EMAIL_COMMERCE_MONTHLY_PRODUCT_ID=
POLAR_SANDBOX_EMAIL_COMMERCE_YEARLY_PRODUCT_ID=
POLAR_SANDBOX_EMAIL_COMMERCE_LIFETIME_PRODUCT_ID=
POLAR_SANDBOX_EMAIL_COMMERCE_PRO_BENEFIT_ID=
```

Copy the matching values from your updated local `.env`; the blank entries here are a template. Keep the production and sandbox tokens, organizations, products, benefits, and webhook secrets in their matching namespaces. Keep entire unused product groups blank. Do not split one group across the Email and WhatsApp names.

2. Deploy the changed Qubtic code after saving the variables. Environment changes apply to a new deployment, not an existing function instance. Do not use the old global `POLAR_ENVIRONMENT=sandbox` setting to route development plugin requests.
3. Install a normal production build of Telegram Commerce (`npm run build`, then package/install that build). Ensure no build-time `.env`, `.env.local`, `.env.production`, or hosting variable forces `VITE_QUBTIC_BILLING_ENVIRONMENT=sandbox`. The live plugin's billing requests should omit `X-Billing-Environment` or explicitly send `production`. Development Email builds use `npm run build:sandbox` and send `sandbox`.
4. In Polar's production dashboard, register `https://www.qubtic.tech/api/billing/webhook/production`; set its signing secret as `POLAR_PRODUCTION_WEBHOOK_SECRET`. Register the separate `/api/billing/webhook/sandbox` endpoint in Polar sandbox with its matching secret.
5. Open Telegram Commerce on the intended Framer site, select Refresh billing, then open checkout. If an error persists, inspect the failing `/api/billing/catalog`, `/status`, or `/checkout` response and the Vercel runtime log for that request. The revised error names the environment and configuration field/rule without printing secrets.

Vercel reference: https://vercel.com/docs/environment-variables

## Supabase status

The catalog repairs above have already been applied using the existing service-role RPC. Do not manually insert duplicate products or rename `whatsapp-commerce` rows to `email-commerce`.

This correction needs no new schema migration. If the earlier dual-environment migration was never applied to this database, follow the existing instructions for `supabase/billing_environments.sql`; that migration handles checkout request-key isolation and production-only shared plan projections. Its deployed status was not inferred merely from the catalog repair.

Read-only verification query for the SQL editor (no credentials or customer information):

```sql
select environment, plugin_slug, cadence, enabled
from public.billing_catalog
where enabled
order by environment, plugin_slug, cadence;
```

Expected enabled rows: production `telegram-commerce` monthly/yearly/lifetime; sandbox `whatsapp-commerce` monthly/yearly/lifetime. The latter is the preserved internal identity of Email Commerce.

## Verification performed

- Qubtic typecheck passed.
- Qubtic production build passed with Webpack.
- All 140 backend tests passed, including Email/WhatsApp configuration compatibility, partial/conflicting aliases, canonical account/pairing identity, site isolation, refunds, and simultaneous sandbox/production routing.
- Both environment catalog synchronizations passed remote Polar and Supabase validation after repair.

These checks did not create a checkout, charge a card, change a subscription, verify a newly deployed Vercel function, or prove webhook delivery. Production write permissions and the actual installed plugin's request headers remain acceptance checks after deployment.
