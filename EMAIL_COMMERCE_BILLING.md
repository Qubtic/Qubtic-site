# Email Commerce Lifetime billing

Email Commerce uses the existing `whatsapp-commerce` account and billing identity so existing purchases remain attached to their sites. New checkout offers Lifetime only, through the same Qubtic hosted checkout and server verification used by Frame Drop. Existing subscriptions and receipts remain available for management.

## Configure sandbox and live

In Qubtic admin → Plugins & payments, select Sandbox, enable Email Commerce, and enter its Lifetime Product UUID and distinct Pro Benefit UUID. Configure that environment’s Polar organization, access token, webhook secret, and approved developer accounts, then validate and publish the configuration. Repeat for Production with live Polar credentials and live product/benefit IDs. Never reuse sandbox credentials or product IDs in production.

For environment-variable configuration, Email Commerce now accepts just `POLAR_EMAIL_COMMERCE_LIFETIME_PRODUCT_ID` and `POLAR_EMAIL_COMMERCE_PRO_BENEFIT_ID` within the selected environment; monthly and yearly product IDs are no longer required. Existing complete catalogs remain readable for historical subscriptions. Refer to BILLING_SETUP.md for database, webhook, and reconciliation setup.

## Plugin builds and verification

From `whatsapp-commerce`, use `npm run dev:sandbox` or `npm run build:sandbox` for sandbox; use `npm run build` with the public billing selector omitted or set to `production` for live. Provider secrets stay on Qubtic. Checkout, portal, and recovery destinations must match the plugin build environment.

For local routing tests run `npx playwright test tests/billing-environment.spec.ts`. In PowerShell, set `$env:BILLING_TEST_SANDBOX='1'` before the same command to exercise the sandbox build. These tests mock provider responses; they do not prove a real payment.

Before releasing, complete a sandbox checkout from a Framer site, return and refresh billing, verify Lifetime access on that site, confirm another site stays Free, and check refunds revoke access after provider synchronization. A live transaction has not been performed by the local test suite.

## SMTP storefront ordering

Email Commerce now uses the same storefront component structure, paginated catalog, shopping bag, modal checkout and grouped Framer controls as Telegram Commerce. Email requests are dispatched by Qubtic over SMTP. This flow requests an order/payment arrangement; it does not charge a card or reserve stock.

Set a stable, randomly generated `EMAIL_COMMERCE_SECRET` of at least 32 characters on the Qubtic server before deploying the plugin. Keep this key private and stable: changing it invalidates published checkout tokens until stores are rebuilt and republished. The authenticated `/api/email-commerce/config` endpoint verifies the merchant’s SMTP connection and encrypts the settings and catalog snapshot. Published code contains only this opaque token, public display settings and the product catalog. The public order endpoint validates SKU quantities and calculates totals from the authenticated snapshot, checks the site’s Pro access and applies request throttling.

Deploy Qubtic’s config/order/test-smtp endpoints before releasing the plugin. Existing storefronts containing older plaintext SMTP settings must be rebuilt from the updated plugin and republished. Rotate any SMTP password that was previously published. No new database migration is required.

Merchants connect SMTP using ports 465, 587 or 2525, select the product CMS collection or import CSV/XLSX into a new Framer collection, review and publish drafts, insert components, then publish their Framer site. Use **Update storefront library** after CMS changes; use **Rebuild all libraries** to update installed components without reinserting them. Catalogs are published snapshots, and request totals remain subject to seller confirmation. Prismic is not integrated; this plugin targets Framer CMS.

The server sends plain-text itemized emails, preserving currency formatting and customer contact details without injecting buyer content into HTML. A failed customer receipt does not turn a successfully submitted merchant request into a failed order. Retry coalescing is currently per server instance; it is not durable exactly-once delivery across server restarts. SMTP acceptance is not inbox delivery or payment confirmation.

## Audit fixes and production release

Guest prices now load through the public catalog; buying still requires Qubtic sign-in. Plugin authorization uses current server `is_pro` decisions and rejects responses for a changed account/site. Persisted receipts never grant Pro in the UI. A changed Framer site revalidates on focus.

Order delivery now uses atomic, durable claims in the private Supabase Storage bucket `email-commerce-orders` (JSON only, 16 KiB maximum). Claims store hashes, order references and delivery outcomes, not customer contact details or SMTP credentials. Keep the bucket private, without public policies, and do not delete claims while retries could occur. A second instance reads the existing result and never resends SMTP. Pending or uncertain delivery requires contacting the seller; it is not automatically retried. Customer receipt failure does not resend the merchant order. This replaces the earlier per-instance retry protection described above.

Before dispatch, a false access check triggers a bounded provider reconciliation through the published billing environment, then checks access again. A revoked or refunded license remains denied. `vercel.json` now schedules each environment's reconciliation and team-notification retry every five minutes. Configure Vercel `CRON_SECRET` (the endpoint also accepts `BILLING_CRON_SECRET`) and use a hosting plan that supports this frequency.

Release checklist:

1. Review `node scripts/repair-email-commerce.mjs` without `--apply`. Its plan preserves USD 99.99 Lifetime pricing and retains historical recurring products without offering them for new purchases.
2. With explicit approval for the hosted changes, run `node scripts/repair-email-commerce.mjs --apply`. It atomically publishes the appropriate catalog in each environment, provisions a distinct live product/benefit when missing, and creates the private order ledger bucket. It never charges a customer or sends email.
3. Add the stable `EMAIL_COMMERCE_SECRET` and `CRON_SECRET` from local secure configuration to Vercel's encrypted environment settings. These files are excluded from source uploads by `.vercelignore`.
4. Authenticate Vercel, run the checks, then deploy the matching backend. `npm run build` selects the verified Webpack build because the local Turbopack CSS worker crashes.
5. Verify GET `/api/email-commerce/config` responds HTTP 200 with `{ "ready": true, "version": 2, "service": "email-commerce" }`, and verify exactly one Lifetime plan is offered by each environment's public catalog.
6. Rebuild and republish installed storefront components. Complete authorized real signup/team inbox, sandbox payment/plugin activation, and merchant SMTP delivery checks.

The hosted repair and deployment were not performed when automatic approval review required explicit authorization and no Vercel login was available. Local test success does not certify a deployed release.
