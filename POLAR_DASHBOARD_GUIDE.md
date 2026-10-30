# Polar dashboard setup — one Qubtic server ENV for every plugin

The only billing configuration template is **`Qubtic/.env.example`**. Copy its settings into the Qubtic website's existing `.env`/`.env.local` or your hosting provider's server Environment Variables. Do not overwrite an existing real environment file. Next.js loads `.env.local` before `.env`; avoid setting the same key differently in both files.

The plugin and Qubtic account page show one Purchase Pro button. Qubtic creates an account-linked Polar Checkout Session with monthly, yearly, and lifetime products. The buyer selects a product and enters an eligible discount code on Polar. Polar's paid order supplies the final charged amount, subtotal, and discount for payment history after `billing_discounts.sql` is applied. A static `/checkout-links/.../redirect` URL is not used for plugin Pro access because it does not carry Qubtic's verified account and checkout mapping.

FrameDrop, WhatsApp Commerce, and Qube Auth do not need Polar environment files. They call `https://www.qubtic.tech/api/billing/*` with their Qubtic account session. The website holds provider credentials, selects products, verifies payments, and supplies access/history. `commerce.env.example` is now a deprecated pointer, not another configuration file.

## 1. Start in Polar sandbox

Open [Polar Sandbox](https://sandbox.polar.sh), sign in, and create/select a sandbox organization. Polar sandbox uses a separate account/organization and separate credentials from production. Set `POLAR_ENVIRONMENT=sandbox` in Qubtic.

Use one organization for your plugin business. You do not need a separate token, webhook secret, or backend for each plugin. Use separate sandbox and production deployments/environments; never combine sandbox product IDs with a production token.

Source: [Polar sandbox documentation](https://polar.sh/docs/integrate/sandbox).

## 2. Create the Organization Access Token

In the selected organization, open **Settings → Access Tokens → Create token**. Name it `Qubtic Plugin Billing — Sandbox`, choose an expiration/rotation schedule, and enable these scopes:

| Scope | Used for |
|---|---|
| `organizations:read` | Setup command confirms the organization |
| `products:read` | Validate products, prices, billing periods, and benefits |
| `customers:read` | Resolve the linked customer and current benefit state |
| `orders:read` | Verify payments/refunds and synchronize history |
| `subscriptions:read` | Synchronize recurring access and cancellation dates |
| `checkouts:write` | Create hosted checkout sessions |
| `customer_sessions:write` | Open the customer's billing/invoice portal |

Copy the generated token directly into the server's `POLAR_ACCESS_TOKEN`. Never paste it into a plugin, screenshot, chat, browser `NEXT_PUBLIC_*` variable, or `VITE_*` variable. This integration uses an Organization Access Token, not an OAuth client ID/client secret or Stripe key.

Find the organization UUID in the organization's settings/identifier details. If the dashboard does not expose a copy control, first set only the token and environment, then run this read-only helper from Qubtic:

```powershell
npm run billing:organization
```

It prints `POLAR_ORGANIZATION_ID=<organization UUID>` for the token's organization. Store that UUID in the server ENV; it is different from the organization name, slug, and user ID. The helper does not print the token.

Sources: [Organization Access Tokens](https://polar.sh/docs/integrate/oat), [organization lookup](https://polar.sh/docs/api-reference/organizations/list), [customer-session scope](https://polar.sh/docs/api-reference/customer-portal/sessions/create).

## 3. Create one Pro benefit per plugin

Open **Benefits → + New Benefit**, choose **Feature Flag**, and create:

- `WhatsApp Commerce Pro Access`
- `FrameDrop Pro Access`
- `Qube Auth Pro Access`

Open each benefit's details/actions and copy its **Benefit ID (UUID)**. Store it in the matching `POLAR_<PLUGIN>_PRO_BENEFIT_ID` variable. If the UI does not show Copy ID, use the benefit UUID shown in its details/page URL or Polar's Benefits API. Do not copy a grant ID, feature name, license key, or benefit URL into an ID field.

Each plugin uses its own benefit. Its monthly/yearly/lifetime products share that one benefit. No manual license key is required: access is linked to the signed-in Qubtic account. A Feature Flag is a good fit for this model and supports both subscriptions and lifetime one-time purchases.

Source: [Polar Feature Flag benefits](https://polar.sh/docs/features/benefits/feature-flags).

## 4. Create three fixed-price products per plugin

Open **Products** and create the following products. Use your own prices and currency; do not choose Free, Pay What You Want, metered, or seat pricing for these plugin plans.

| Product | Billing | Attach benefit |
|---|---|---|
| WhatsApp Commerce Pro Monthly | Recurring, every 1 month | WhatsApp Commerce Pro Access |
| WhatsApp Commerce Pro Yearly | Recurring, every 1 year | WhatsApp Commerce Pro Access |
| WhatsApp Commerce Pro Lifetime | One-time | WhatsApp Commerce Pro Access |
| FrameDrop Pro Monthly | Recurring, every 1 month | FrameDrop Pro Access |
| FrameDrop Pro Yearly | Recurring, every 1 year | FrameDrop Pro Access |
| FrameDrop Pro Lifetime | One-time | FrameDrop Pro Access |
| Qube Auth Pro Monthly | Recurring, every 1 month | Qube Auth Pro Access |
| Qube Auth Pro Yearly | Recurring, every 1 year | Qube Auth Pro Access |
| Qube Auth Pro Lifetime | One-time | Qube Auth Pro Access |

Disable trials. Lifetime has no scheduled expiration. In subscription settings, use immediate benefit revocation after failed payment for this release; the backend does not grant payment-failure grace access. All three options include identical Pro features.

Copy each **Product ID (UUID)** from the product's details/actions (the product row's menu may expose Copy Product ID) into the corresponding ENV key. The backend uses Product IDs, not Price IDs or checkout-link URLs. You do not need to create static checkout links: Qubtic creates authenticated sessions itself.

For example, the four WhatsApp Commerce keys are:

```dotenv
POLAR_WHATSAPP_COMMERCE_MONTHLY_PRODUCT_ID=
POLAR_WHATSAPP_COMMERCE_YEARLY_PRODUCT_ID=
POLAR_WHATSAPP_COMMERCE_LIFETIME_PRODUCT_ID=
POLAR_WHATSAPP_COMMERCE_PRO_BENEFIT_ID=
```

Use `POLAR_FRAME_DROP_*` and `POLAR_QUBE_AUTH_*` for the other two plugins. Leaving all four keys blank keeps that plugin's checkout unavailable. Partially filled groups are rejected. To enable all three plugins, fill all twelve ID variables. Future plugins can use `POLAR_EXTRA_CATALOG_JSON`, with three entries per plugin, as described in `.env.example`.

Source: [Polar products and billing cycles](https://polar.sh/docs/features/products).

## 5. Create the webhook endpoint and secret

In **Settings → Webhooks → Add Endpoint**:

1. Enter `https://www.qubtic.tech/api/billing/webhook`, or your sandbox Qubtic deployment's equivalent URL.
2. Set delivery format to **Raw** (JSON), not Slack/Discord.
3. Generate/copy the endpoint signing secret into `POLAR_WEBHOOK_SECRET` on that same deployment. This is different from your access token.
4. Subscribe to the available events used by the pinned API: `customer.state_changed`, `customer.deleted`, `order.paid`, `order.updated`, `order.refunded`, `subscription.updated`, benefit-grant created/updated/revoked events, and refund created/updated events. Use the exact event names offered by your dashboard. Customer-state changes are the central access signal; order/refund events keep history current.
5. Redeploy/restart after saving the secret. Check webhook delivery status in Polar after a sandbox purchase. The handler must receive the original signed body.

For local development, use Polar's webhook forwarding CLI or a HTTPS tunnel to the local `/api/billing/webhook` route. A Polar webhook cannot reach your computer through the public production URL unless that URL forwards to it.

Source: [Polar webhook setup](https://polar.sh/docs/integrate/webhooks/endpoints).

## 6. Fill the remaining central server settings

| ENV key | Where it comes from |
|---|---|
| `POLAR_ENVIRONMENT` | Set yourself: `sandbox` first, `production` when ready |
| `POLAR_ACCESS_TOKEN` | Polar Organization Access Token |
| `POLAR_ORGANIZATION_ID` | Polar organization UUID / `billing:organization` helper |
| `POLAR_WEBHOOK_SECRET` | Signing secret for this deployment's webhook endpoint |
| Twelve product/benefit ID keys | Polar products and benefits created above |
| `NEXT_PUBLIC_SITE_URL` | Public Qubtic website origin; used for checkout returns and auth pairing |
| `SUPABASE_URL` | Your shared Qubtic Supabase project's URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase server-only service-role credential |
| `ADMIN_SESSION_SECRET` | Generate a new random secret yourself |
| `BILLING_CRON_SECRET` | Generate a different random secret yourself |
| `SMTP_HOST/PORT/SECURE/USER/PASS/FROM_EMAIL` | Your verified email provider, used for Qubtic signup/reset |

To generate each random secret separately:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Run it twice and store the outputs directly in the server environment. Do not reuse a Polar access token or webhook secret as an admin/cron secret. `NEXT_PUBLIC_SITE_URL` is intentionally public because it is a website address; every credential remains unprefixed/server-only. Existing Cloudinary settings in the same template belong to website media, not Polar.

## 7. Apply migrations and connect ENV to the database

Use the existing shared Qubtic database. Back it up first. On a fresh database only, apply `framer_users.sql` and `pairing_sessions.sql`. Then apply:

1. `supabase/free_pro_only.sql`
2. `supabase/billing.sql`
3. `supabase/billing_central_config.sql`
4. `supabase/billing_discounts.sql` (stores confirmed order subtotal, discount amount, and final charged amount in the plugin payment views)

From `D:\VS Code\App\Qubtic`, with the real settings in `.env.local`/`.env` or the process environment:

```powershell
npm run billing:check
npm run billing:configure
npm run billing:check -- --remote
```

- `billing:check` checks local configuration and reports missing variable NAMES, never secret values. It does not access Polar or mutate the database.
- `billing:configure` validates resource read permissions, organization, each product/benefit/price, and then atomically synchronizes **your ENV IDs** into `billing_catalog` using the server-only RPC. Old products are disabled for new checkout but retained for historical purchases.
- `billing:check -- --remote` validates the live provider and confirms the database matches ENV without writing it. It does not create a checkout, customer, or payment, and does not send email. Checkout/customer-session write scopes must be selected in the dashboard and verified by the sandbox acceptance test; OAuth authorization is not an OAT scope-inspection endpoint.

The runtime refuses checkout if ENV and the active database catalog differ. A token alone is insufficient: the IDs, organization, environment, and synced catalog must match. Run configure again whenever the desired product mapping changes. Run it in a process with the same environment values as the website deployment, not against a different local Supabase project.

Local Next.js and these commands load `.env.local`/`.env` using Next's environment loader. In production, configure the same keys in your host's server Environment Variables and redeploy. The plugin bundles contain only Qubtic endpoint URLs and the user's own account session, not Polar secrets. Keep sandbox deployments isolated from production data/ENV.

The current plugin builds call `https://www.qubtic.tech`. Changing the website's local ENV or return origin does not redirect those plugin requests to localhost or a staging host. To test through those builds, the configured backend must be deployed at that domain. An isolated staging setup requires plugin builds explicitly configured for the staging backend, along with matching authentication pairing and allowed origins.

## 8. Schedule reconciliation and prove the full connection

Configure an HTTP scheduler to POST to `https://www.qubtic.tech/api/billing/reconcile` every minute, with `Authorization: Bearer <your BILLING_CRON_SECRET>`. The scheduler must support POST and secret headers. Increase batch capacity/frequency as your customer base grows so reconciliation completes within the one-hour entitlement lease.

Then test with a Polar sandbox account:

1. Sign up/sign in through a plugin and confirm Free access.
2. Click a monthly/yearly/lifetime purchase option. Confirm checkout shows the intended plugin/product/price.
3. Complete a sandbox payment using Polar's test-payment instructions.
4. Confirm the Polar webhook delivery succeeds (2xx), the matching payment/history row appears, and the plugin changes to Pro after refreshing.
5. Verify the same account remains Free in another plugin until that plugin is purchased.
6. Test refunds, cancellation at period end, and a missed webhook recovered by Refresh billing/reconciliation.

These acceptance checks are required to confirm actual end-to-end delivery. Local tests and configuration checks cannot prove real webhooks, SMTP, or the external scheduler work. Sandbox customer emails are restricted to organization members; use a member email when testing email delivery.

To launch production, repeat the Polar dashboard setup in production, replace the token, organization/product/benefit IDs and webhook secret together, set `POLAR_ENVIRONMENT=production`, sync the catalog for that environment, redeploy, and repeat acceptance with an authorized production transaction. Do not test by sharing live secrets in chat or screenshots.

## Credential exposure

The former `.env.example`/screenshot contained what appeared to be a Cloudinary API secret. It has been replaced with placeholders in the template. If real, rotate that credential in Cloudinary and update the private server environment; removing it from a file does not revoke the old value. Do not commit real `.env` or `.env.local` files.
