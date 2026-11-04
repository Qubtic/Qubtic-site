> **Environment update:** Follow [POLAR_ENVIRONMENTS.md](POLAR_ENVIRONMENTS.md) for simultaneous sandbox/production setup. Global environment-switching instructions below describe the legacy configuration; use explicit `--environment sandbox` or `--environment production` with setup commands.

# Telegram Commerce billing

Telegram Commerce uses the shared Qubtic Polar integration. Each monthly, yearly, or lifetime purchase applies to one Framer project, independently of WhatsApp Commerce.

## Server environment

Add these optional Telegram settings to the existing central `.env` and to the matching Vercel environment. Use real Polar UUIDs, not checkout links. Leave these blank if Telegram billing is not being enabled.

```dotenv
POLAR_TELEGRAM_COMMERCE_MONTHLY_PRODUCT_ID=
POLAR_TELEGRAM_COMMERCE_YEARLY_PRODUCT_ID=
POLAR_TELEGRAM_COMMERCE_LIFETIME_PRODUCT_ID=
POLAR_TELEGRAM_COMMERCE_PRO_BENEFIT_ID=
```

Attach that same dedicated Telegram Pro benefit to all three products. Additional benefits, such as license keys, can remain attached. Never reuse WhatsApp's Pro benefit. All IDs and the access token must belong to the selected `POLAR_ENVIRONMENT`. Sandbox products cannot accept live payments; production needs its own products, benefit, token, webhook secret, and database catalog configuration.

This document supplies the optional Telegram environment template alongside `.env.example`; `billing:check -- --example` validates both without loading credentials.

## Deployment order

1. Back up the database. Existing prerequisites are `supabase/billing.sql`, `supabase/billing_discounts.sql`, `supabase/billing_sites.sql`, and `supabase/billing_central_config.sql`.
2. Apply **`supabase/billing_telegram_sites.sql`** in the Supabase SQL Editor. It is repeatable and retains WhatsApp support. Do not reapply the older `billing_sites.sql` afterward; it would restore WhatsApp-only functions. Existing purchases without saved checkout/site bindings are not assigned to arbitrary projects.
3. Run `npm run billing:check -- --remote`, then `npm run billing:configure` to validate Polar products and synchronize the enabled catalog to the database. This does not create a checkout or payment. Catalog synchronization uses all configured products; review the complete environment before running it.
4. Deploy the updated Qubtic-site code to Vercel. Environment changes alone do not deploy this integration. Use matching environment values locally and in Vercel. Telegram's existing plugin already sends the account token and `X-Framer-Site-Id`; no button or static checkout-link edit is needed.
5. Reopen the plugin or sign out/in so its catalog reloads. A verified session plus three successfully loaded billing plans enables Purchase Pro.

## Checkout links and fulfillment

**Do not paste a static checkout link into the plugin or `.env`.** Clicking Purchase Pro calls `/api/billing/checkout`. The server uses the private Polar organization access token and product UUIDs to create an account-linked checkout and returns its temporary URL. The existing launcher opens that URL. Keep `POLAR_ACCESS_TOKEN` server-only.

The server sets the success and return URLs automatically to `/billing/return?plugin=telegram-commerce` on `NEXT_PUBLIC_SITE_URL`. The return page is only navigation: it does not grant Pro.

Configure Polar's webhook destination as:

```text
https://www.qubtic.tech/api/billing/webhook
```

Use the exact canonical origin configured in `NEXT_PUBLIC_SITE_URL` for your deployment. Match its signing secret to `POLAR_WEBHOOK_SECRET`. Keep the existing billing reconciliation job configured as described in `POLAR_DASHBOARD_GUIDE.md`.

Signed webhooks retrieve authoritative Polar state and match saved account, product, and project bindings before granting access. Refresh billing can recover missed webhooks. Other sites and other plugins remain Free unless separately purchased. A checkout redirect alone never confirms payment.

## Acceptance checks

```sh
npm run typecheck
npm run test:billing
npm run billing:check -- --remote
```

Complete one sandbox purchase from Site A, return to Framer and refresh billing, then confirm Site A becomes Pro and Site B remains Free. Test a renewal, full refund, cancellation, upgrade, and missed webhook recovery before enabling production. Local/mock tests do not establish real payment or webhook delivery.
