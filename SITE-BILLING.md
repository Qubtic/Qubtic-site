> **Environment update:** Follow [POLAR_ENVIRONMENTS.md](POLAR_ENVIRONMENTS.md) for simultaneous sandbox/production setup. Global environment-switching instructions below describe the legacy configuration; use explicit `--environment sandbox` or `--environment production` with setup commands.

# Commerce plugins: one site per purchase

WhatsApp Commerce and Telegram Commerce Pro are scoped to `(billing customer, plugin, Framer project ID)`.
Monthly, yearly, and lifetime purchases each unlock only the site used to start checkout.
Other Qubtic plugins retain their existing billing policy.

The plugin reads `framer.getProjectInfo().id` for each access/billing request and sends
`X-Framer-Site-Id`. Checkout saves that site in Qubtic before creating the Polar session.
Webhooks recover the site from that saved checkout, including for later renewals with
no checkout ID. Editable Polar metadata and account-wide plan flags grant no site access.
Missing site IDs fail closed. Existing active purchases block another checkout on that
site even when the short-lived entitlement verification has expired.

## Deploy in order

1. Back up the database. Apply `supabase/billing.sql`, then
   `supabase/billing_discounts.sql` if not already installed.
2. Apply `supabase/billing_sites.sql`. This is repeatable and service-role-only.
3. Apply `supabase/billing_telegram_sites.sql` after the older billing migrations to support both commerce plugins. Do not reapply `billing_sites.sql` afterward. See `TELEGRAM_BILLING.md` for catalog configuration and checkout behavior.
4. Deploy Qubtic's site-aware API/webhook code and rebuild/reinstall commerce plugins as needed.
   Older plugin builds do not send site IDs and will remain Free.
5. Refresh billing and run an account-linked sandbox purchase on Site A. Confirm
   purchase history and Pro there, then open Site B with the same account and confirm
   it remains Free. Test renewals, full refunds, expiry, and a missed webhook followed
   by Refresh billing. No real payment has been tested by local/mock verification.

## Existing purchases

Historical checkouts without `site_id` deliberately unlock no site. Do not assign them
to whichever project opens first. After independently confirming the customer's desired
Framer project, an administrator can assign that ID to the customer's original saved
checkout where `site_id IS NULL`, then synchronize that customer. The original checkout
and order must be present. Site assignments already populated are immutable; moving a
subscription to a different site is not a self-service operation.

The project ID is host context, not a server-verifiable Framer ownership attestation.
The account session authorizes access; no bearer credentials enter checkout metadata
or generated storefront components.
