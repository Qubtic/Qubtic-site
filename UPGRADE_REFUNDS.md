# Subscription → Lifetime upgrade refunds (policy v1)

This is a central Qubtic billing policy for every catalog-backed app, including FrameDrop, Qube Auth, WhatsApp Commerce, Telegram Commerce, and future apps using `/api/billing/checkout`. Commerce licenses remain scoped to their original Framer site; other apps remain account-scoped. A separate external checkout link cannot opt an order into this policy.

## Behavior

- Lifetime is charged as a separate, full-price purchase. There is no unused-time discount at checkout, so a discount and refund cannot both reimburse the same credit.
- After server-confirmed Lifetime payment, stop the previous subscription's **future renewals**, whether the subscription was monthly or yearly. Cancellation is tracked independently of refund processing, so pending/failed refunds do not keep recurring charges enabled. This does not revoke Lifetime access or request an immediate benefit revocation.
- Calculate the eligible unused-time refund from the current subscription invoice's **pretax amount after discounts**, not the product's list price:

  `floor(net_paid_minor_units × unused_period_milliseconds ÷ total_period_milliseconds)`

  Cap it at the provider's refundable amount and the remaining paid net amount after previously completed or pending refunds. Use server/provider timestamps; no client-supplied dates, prices, subscription IDs, or plan flags authorize a refund. Bank settlement time is controlled by Polar/payment providers.
- Example: an annual invoice paid $43.99 after discount with exactly half the period left is eligible for $21.99, before any prior-refund caps. Tax accounting/adjustments and currency rounding must be checked against Polar in staging.
- Match the same billing customer, app, organization/environment, original subscription and saved checkout. For Commerce also require matching original checkout/site bindings. Purchasing Lifetime for another app or site never refunds this subscription.
- Checkout saves the previous subscription ID and current-period bounds. A checkout paid across a renewal boundary, multiple ambiguous period invoices, balance-funded payments, or unverifiable billing information goes to **manual financial review** rather than guessing a refund. A verified eligible Lifetime upgrade still stops renewals independently.
- Before any new refund or cancellation, re-fetch and validate the Lifetime payment. Reversed/unpaid/mismatched payments require reconciliation and cannot trigger automatic financial work from a stale job.

## Deployment

1. Back up the database and apply existing shared billing migrations (including `billing_telegram_sites.sql` where applicable).
2. Apply **`supabase/billing_upgrade_refunds.sql`** before deploying the new server code. It adds server-owned checkout bindings, a durable refund/cancellation ledger, and service-role-only worker RPCs. The migration is repeatable. It does not create refunds or backfill historical upgrades.
3. Give the server's Polar Organization Access Token `refunds:read`, `refunds:write`, and `subscriptions:write`, alongside the existing billing permissions. Never put the access token into a plugin, generated component, public variable, or client request. Read-only validation cannot prove write permissions.
4. Run `npm run billing:check -- --remote`, deploy Qubtic-site, and rebuild/reinstall Telegram Commerce for its new status/help messages. Other apps already using the shared billing API receive the central server policy without needing to implement their own refund logic.
5. Configure signed Polar webhook delivery to `/api/billing/webhook` and the existing scheduled `/api/billing/reconcile` job. Refund, order and subscription events, manual Refresh billing, and reconciliation all use the same durable worker. Keep reconciliation running even if a webhook exhausts its event retry limit.
6. Only **new Lifetime upgrade checkouts** created with `upgrade_policy_version = 1` qualify. Old open checkouts must be replaced through the plugin's checkout recovery flow. Earlier completed Lifetime purchases, including pre-policy test purchases, require a separately reviewed manual refund and cancellation in Polar. Do not fabricate bindings or backfill flags to force an automatic refund.

## Failure and recovery

`billing_upgrade_refunds` is the audit/outbox table, private to the service role:

- `phase` tracks financial work (`ready`, `creating`, `recovering`, `pending`, `accepted`, `done`, `manual_review`).
- `renewal_status` and `renewal_stopped_at` separately record whether future subscription renewals are confirmed off.
- `reconciliation_required` freezes a job whose qualifying Lifetime purchase or ownership changed.
- Unique keys prevent multiple refunds for the same original subscription or Lifetime order. Customer locks, leases and fenced claims prevent concurrent workers from spending the same credit twice.
- The provider refund receives a durable ledger key in metadata. If a create response is lost, list the provider's refunds and recover by that key. **Never blindly repeat a refund create** when its outcome is unknown. Missing/conflicting results require manual reconciliation.
- Transient failures retry within bounded budgets. Verified pending settlement polls are deferred 15 minutes without consuming the financial failure budget. Each invocation claims at most one due job. Cancellation has its own retry budget and continues during financial review. Monitor all manual-review/reconciliation rows.
- `/api/billing/status` exposes only the authenticated customer's app/site-filtered upgrade summaries, not raw provider diagnostics. Telegram and website billing panels show pending/completed/review messages; purchase history shows the actual provider-confirmed refunded amount after synchronization.

A support operator must check the Polar order/refund/subscription records before taking any manual action. Never reset a `creating`, `recovering`, or `manual_review` job to `ready` to force a retry: a refund may already exist.

## Acceptance checks

```sh
npm run typecheck
npm run test:billing
npm run billing:check -- --remote
```

Tests are offline/mocked with PGlite schema/permission checks. They do not establish live PostgreSQL multi-connection behavior, bank settlement, tax handling, or provider write permissions.

In a separate Sandbox account test monthly → Lifetime and yearly → Lifetime, discounts, partial/manual refunds, webhook replay, missed webhooks, pending settlement, cancellation failure, checkout spanning renewal, cross-app/site rejection, and a reversed Lifetime payment. Verify the bank/provider refund and confirmed renewal cancellation; opening the return page alone proves neither. Never manufacture real production payments for testing.
