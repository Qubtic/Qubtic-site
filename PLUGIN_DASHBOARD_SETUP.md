# Plugin dashboard deployment

Open the existing `/portfolio/admin` panel and select **Plugins & payments**. No second login is created. Only authenticated administrator roles can read configuration summaries or publish changes. Polar secrets are write-only, encrypted using AES-256-GCM with configuration-specific authenticated context, stored under RLS, and decrypted only on the server. Admin audit responses contain no credentials; bounded undo snapshots retain encrypted previous Polar secrets. Infrastructure credentials remain in Vercel ENV.

## Bootstrap ENV

Use `.env.bootstrap.example`. Keep `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SESSION_SECRET`, `PLUGIN_CONFIG_ENCRYPTION_KEY`, and `NEXT_PUBLIC_SITE_URL` in Vercel. Use `CRON_SECRET` if using scheduled jobs. Keep Cloudinary, Google OAuth and shared SMTP settings in Vercel using the names listed in the template. These are never edited or imported as dashboard credentials.

Generate the encryption key with `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. A local key has already been generated in the ignored `.env`; copy it to Vercel securely if importing with that key. Do not generate another key afterward: existing ciphertext needs the original key. Back up the key independently of Supabase. Do not reuse an API token as an encryption key. Key rotation requires decrypting and re-encrypting records before removing the previous key.

## Deployment order (preserves current live billing)

1. Apply `supabase/migrations/20261104092628_plugin_control.sql`, then `supabase/migrations/20261104095407_plugin_operations.sql` to the existing Supabase database after the existing billing migrations (skip migrations already applied). This creates service-role-only configuration/audit/notification tables and an atomic publish RPC. No existing accounts, purchases or entitlement rows are reset.
2. Keep the old local `.env` temporarily and run `node scripts/import-plugin-control.mjs --apply`. This imports available legacy production and sandbox Polar settings using encryption, plus non-secret team notification preferences; it skips already configured records. No credentials are printed. It creates no checkout or charge. Rotate the previously exposed Polar credentials first.
3. Set the bootstrap and SMTP variables above in Vercel, including the exact key used for import. Deploy the new code, then apply `supabase/migrations/20261104112717_smtp_credentials_to_vercel.sql` to remove obsolete database SMTP settings and their audit snapshots. Production requests now require database-managed configuration; there is no automatic ENV fallback when the database is unavailable.
4. In **Plugins & payments**, validate/publish each environment. Add developer account emails for every enabled sandbox plugin. The default empty developer list denies sandbox access. Edit manifests as JSON objects. Register future plugins with **Add plugin**; the dashboard discovers their names immediately. Keep existing identifiers unchanged for installed plugins and historical licenses.
5. Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` and `SMTP_FROM_EMAIL` in Vercel. In the dashboard, set only the team recipient and signup/signin/purchase preferences. Saving preferences does not contact SMTP or send mail. Account verification/reset emails use Vercel SMTP settings directly, independently of dashboard configuration; visitor storefront merchants retain their own separately configured SMTP credentials.
6. Remove only the old `POLAR_*` variables from Vercel after migration and acceptance. Keep shared `SMTP_*`, Cloudinary, Supabase and Google variables in Vercel. `TEAM_NOTIFICATION_EMAIL` remains an optional fallback recipient. Keep a protected temporary local backup until you have checked both environments, then remove the legacy Polar variables locally too. Keep SMTP and the other server integrations in your ignored local ENV for local development. The old templates/CLI are retained solely as migration references and must not manage the active catalog after this deployment.

## Production and local development together

Use the existing normal production plugin build for live billing. Use `build:sandbox` for development copies. These public routing hints choose an environment; they never contain credentials. Qubtic checks the verified account against that plugin's sandbox developer list. A live and development copy of the same plugin can run concurrently. Credentials, catalog publication, site entitlements and refund processing stay environment-specific.

Webhook registrations remain `/api/billing/webhook/production` and `/api/billing/webhook/sandbox`. Signing secrets are entered in the dashboard. Credential changes take effect on new requests without redeploying.

## Scheduled work and notifications

Keep the existing bounded billing reconciliation jobs for each environment. Add a separate authenticated GET job at `/api/plugin-notifications` to drain up to five team alerts per invocation. Vercel supplies `Authorization: Bearer CRON_SECRET`. Use a frequency supported by your plan (for example every five minutes with an eligible plan). Provider failures retain leases for retry, up to ten attempts. Inspect undelivered rows in `plugin_team_events` if attempts are exhausted. Notifications are at-least-once: SMTP acceptance followed by a database outage can cause a duplicate on retry.

Signup/signin alerts are enqueued through the existing account dispatcher. Paid-order webhook alerts use unique environment/event references. Disabled events are skipped. Emails contain event metadata, never credentials or full payment payloads.

## Security and acceptance

- A database dump alone does not reveal credentials; the external encryption key is required. RLS alone is not encryption.
- Protect Vercel/Supabase administrator access. The service role necessarily bypasses RLS and never belongs in the browser.
- Admin writes require a signed, unexpired administrator cookie and same-origin request. Publish uses an optimistic revision check and commits settings/catalog/audit together.
- Publish validates enabled products against the matching Polar organization, benefits, cadence and positive fixed prices. Retired catalog rows are retained for historical subscriptions/refunds.
- Verify an ordinary user cannot access the admin endpoint, and a non-allowlisted account cannot use sandbox. Test production and sandbox concurrently, verify webhooks and refresh site access. A real production purchase is a separate acceptance step.

Live schema application, data import, deployment and real email/payment delivery have not been performed by this change. Complete the migration and ENV prerequisites before deployment.


## Admin login upgrade

The old login accepted built-in fallback passwords. They have been removed. Before deploying, ensure your `admin_users` row has a real SHA-256 legacy hash or a `scrypt:salt:hash` password hash (plain passwords are no longer accepted), and the expected admin role. Legacy SHA-256 hashes are upgraded after a successful login. Rotate `ADMIN_SESSION_SECRET` on deployment to invalidate previously issued sessions. A minimum 32-character secret is required.

Run `node scripts/set-admin-password.mjs` locally to set a new password for your existing database admin. It prompts for the email and a hidden password; it never creates a new administrator or prints the password/hash. This command changes that account's password immediately. Then rotate `ADMIN_SESSION_SECRET` in Vercel to revoke existing cookies. Database failure rejects login instead of falling back to a built-in password.


## User operations, payment analytics and logos

Apply `supabase/migrations/20261104095407_plugin_operations.sql` after the original plugin control migration and before deploying this version. It adds service-role-only user-action snapshots, mail history, cancellation windows and atomic configuration restoration. It does not delete payment history or existing accounts.

The default **Users, payments & growth** workspace loads production payments. Switch to Sandbox testing to inspect test transactions. Accounts and account email history are shared identities; their signup numbers are not falsely attributed to a payment environment. Plugin filters merge the built-in registry with administrator-created Supabase registrations. Use **Add plugin** to register a permanent ID and display name; existing installed plugin identifiers and aliases remain reserved. Product credentials, manifests and logos remain editable in the dashboard. Logo upload/browsing reuses the existing Cloudinary image manager and ENV credentials. Supabase stores the asset reference; no new image-provider keys are required.

User actions include creating unverified pending accounts, editing profile/status fields, deactivation with confirmation, details including stored Framer IDs, and composing plain-text email to an existing account. An admin cannot change verified email ownership, forge a purchase, overwrite a password/session token, or grant Pro through these profile edits. Deactivation preserves orders, subscriptions and audit records. It does not cancel recurring Polar billing; manage subscription cancellation in Polar or the existing billing flow. Reactivation is possible later through the status editor; the immediate restoration modal offers five seconds.

The five-second undo deadline is enforced in PostgreSQL, belongs to the acting admin, and rejects a restore if another edit has changed the record. Credentials/configuration publication stores encrypted prior secrets and prior catalog state for that same bounded restore. Manual email becomes eligible for delivery only after its five-second cancellation window. Cancellation checks the database clock and refuses mail already claimed for delivery. Sent email and provider-side actions cannot be recalled. Media-manager deletion of an actual Cloudinary asset is an external operation and is not included in database undo; changing/removing the logo reference is reversible through configuration undo.

The existing authenticated `/api/plugin-notifications` worker dispatches eligible emails. The dashboard distinguishes queued, cancelled, SMTP-accepted and exhausted-retry states. SMTP acceptance is not proof of inbox delivery. Account verification, reset and invitation delivery logs contain metadata only, never OTPs, reset links or credentials. Tracking begins after deployment; historical emails that were never logged cannot be reconstructed.

Growth charts show daily UTC signups over the past 30 days, total/new/active account counts, and payments/net amounts grouped by currency. Amounts remain in provider minor units until displayed. Search and pagination execute in the database; customer PII remains under administrator-only endpoints with RLS and service-role permissions.


## Infrastructure credentials stay in Vercel

Cloudinary uploads, Supabase access, Google sign-in and shared SMTP delivery read server environment variables. The dashboard manages Polar configuration, plugin metadata, one shared Pro benefit UUID per plugin per environment, and notification recipients/events. It never returns or accepts infrastructure passwords. `.env.bootstrap.example` and `.env.example` list all required variable names with blank secret values. Use Vercel Secret type for private values. Environment changes require a new deployment; dashboard metadata changes take effect on new requests.

For an existing database that previously stored SMTP credentials, deploy this version only after copying the working SMTP values to Vercel. Apply the `supabase/migrations/20261104112717_smtp_credentials_to_vercel.sql` after the two dashboard migrations to remove obsolete mail ciphertext and delivery settings from active and audit records. It preserves the team recipient, event preferences, Polar settings, users and purchases. Database backups can retain older encrypted data under their normal retention policy.


## Catalog publish UUID repair (2026-11-06)

Apply `supabase/migrations/20261106115046_plugin_catalog_uuid_publish.sql` after the plugin operations migration on databases that have not received this repair. It replaces only the publish/undo functions, preserving service-only access, revision checks, atomic audit/catalog writes and historical ownership. JSON product/benefit IDs are explicitly converted to the catalog's UUID types. No credentials, accounts, purchases or subscriptions are changed by the migration itself.

The repair was applied to the connected live Qubtic database on 2026-11-06. The saved Telegram production organization and all three products were checked against Polar before publishing the requested Telegram enablement at revision 5. No checkout, charge or email was created. A website redeployment is not required for this database repair. Reload the admin panel to see the saved revision. Close and reopen an already-open Telegram plugin: its current Refresh billing handler refreshes access/status without re-fetching a previously empty catalog.


## Register another Framer plugin in Qubtic

1. In **Plugins & payments**, click **Add plugin**. Enter its display name and permanent lowercase, hyphenated ID (for example `my-plugin`). The ID must match the Framer plugin's login/billing integration. Built-in IDs, aliases and duplicate active IDs cannot be reused.
2. Click **Register plugin**. The five-second undo window lets the acting admin cancel an unused registration. A registration already referenced by accounts, pairing, payment history or published configuration cannot be undone. Undo preserves audit records and never deletes customer/payment data.
3. Select the new plugin under **Credentials & plugin settings**. It starts with plans disabled in both environments. Add its logo through the existing image manager, manifest JSON, monthly/yearly/lifetime product UUIDs and one shared Pro benefit UUID. For sandbox, add verified developer emails. Enable plans and **Validate & publish** when ready. Organization credentials remain separate for each environment.
4. Connect the Framer plugin's login/pairing and billing requests using that exact permanent ID. Development builds request sandbox; live builds use production. Registration supplies identity and dashboard configuration; the plugin client must still implement the shared login, checkout and server entitlement checks. New site-specific license policies require their own server integration; the existing site policy explicitly covers the two Commerce plugins.

Once this dashboard version is deployed, registering future plugins requires no backend edit or redeployment. Built-in plugins stay supported by the code registry. Dynamic names are used by user records, the `/auth/{plugin-id}` page and transactional email subjects/content. Plugin credentials are validated server-side before catalog publication. Registrations and registration audit rows are protected by RLS and service-role-only access; administrator writes require the existing signed session and same-origin check.

Before deploying this feature, apply `supabase/migrations/20261106122130_dashboard_plugin_registry.sql` after the plugin operations and UUID publication repairs. The migration creates the registry/audit and registration RPC, seeds existing built-in IDs, and leaves production/sandbox settings and catalogs unchanged. It contains no provider credentials.

The Brand color editor has been removed from plugin settings. Cloudinary, Supabase, Google and SMTP credentials remain managed through Vercel ENV.
