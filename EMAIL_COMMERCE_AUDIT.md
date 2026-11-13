# Email Commerce audit — 13 November 2026

Scope: Qubtic account connection, signup team mail, plugin purchase billing, guest prices, Framer CMS components, merchant SMTP orders and post-payment synchronization. Application code was not changed during this audit.

## Evidence and limits

- Fresh local runs: 98/98 Email Commerce browser tests and 208/208 Qubtic backend tests passed.
- Browser, payment-provider and SMTP tests use mocks. They do not prove real email receipt, a real checkout or a real Framer canvas insertion.
- Read-only requests to deployed https://www.qubtic.tech returned:
  - GET /api/billing/catalog?plugin=whatsapp-commerce: HTTP 200, `{"plans":[]}` in production.
  - Same request with X-Billing-Environment: sandbox: HTTP 200; monthly USD 5, yearly USD 40 and lifetime USD 99.99, all marked available. These are API quotes, not final tax-inclusive checkout totals.
  - GET /api/email-commerce/config: HTTP 404.
  - GET /api/email-commerce/order and /api/email-commerce/test-smtp: HTTP 405. This confirms route availability, not successful POST behavior.
  - GET /auth/whatsapp-commerce: HTTP 200. This confirms the portal is reachable, not that a real signup succeeded.

## Requirement assessment

| Requirement | Assessment |
| --- | --- |
| Signup/sign-in through Qubtic | Implemented; shared email verification/password sign-in, reset, private pairing and plugin isolation pass local tests. Real signup not performed. The `whatsapp-commerce` identifier is intentionally retained for Email Commerce accounts. |
| Qubtic team email after signup | Implemented through sendNewUserTeamNotification → durable plugin_team_events → flushTeamEvents. It depends on enabled signup notifications, a team recipient, Qubtic mail credentials, the outbox migration and a retry worker. Actual delivery and hosted worker configuration were not verified. |
| Sandbox/live plugin purchase | Sandbox public catalog exists, but deployed plans differ from the new Lifetime-only implementation. Production public catalog is empty, so new live checkout is not ready. Neither a real sandbox nor live purchase was performed. |
| Pricing before signup | Fails in the plugin: BillingPanel exits before fetching catalog when there is no account token. The public backend API already supports this. |
| CMS insertion and merchant SMTP order email | CMS/import/insertion and mocked SMTP flows pass locally. The order route creates a transport from decrypted merchant SMTP settings, not Qubtic mail ENV. New secure setup is blocked in deployment by the missing config endpoint. Catalogs are snapshots that require library update/rebuild and Framer publication after CMS changes. |
| Payment sync back into plugin | Webhook reconciliation, refresh, site/environment scoping and polling are implemented and pass local tests. Optimistic cached Pro state can contradict current server access. Real paid activation was not performed. |

## Findings, ordered by priority

### P1 — Updated merchant SMTP setup is not deployed

`src/commerce/library.ts` requires POST https://www.qubtic.tech/api/email-commerce/config when SMTP is configured. The deployed config URL returns 404; the local source defines POST and OPTIONS, so an existing route would normally respond 405 to GET, as the adjacent routes do. This is strong evidence of deployment drift. Publishing a connected storefront with the updated plugin will fail unless the matching backend is released.

Deploy the config/order/test-smtp implementation together and configure a stable server-only EMAIL_COMMERCE_SECRET of at least 32 random characters. Rebuild and republish older storefronts. Rotate any SMTP credential previously published in plaintext. The old deployed order handler's POST behavior was not exercised, so its security properties were not assumed.

### P1 — Production has no Email Commerce price/product catalog

The deployed production catalog returns an empty plan list. A configured Lifetime product is required to display a real price and create checkout. Local checkout explicitly rejects incomplete configuration. Configure, validate and publish Email Commerce's live Lifetime Product UUID and Pro Benefit UUID in Qubtic, then verify the public catalog and complete an authorized live acceptance test.

Sandbox still exposes three plans while the local implementation offers Lifetime-only checkout. Align the hosted catalog and backend/plugin release before testing sandbox purchases.

### P2 — Guests cannot see current pricing

whatsapp-commerce/src/account/BillingPanel.tsx:172 returns immediately when token is absent, so no guest catalog request happens. Its price remains `Price at checkout` and the purchase button is disabled. AccountPage still mounts the panel, so this is a data-fetching gap rather than a missing page.

Fetch `/api/billing/catalog?plugin=whatsapp-commerce` without Authorization for guests, with the selected environment header. Request status/history only after login. Display unavailable-price errors and route the purchase CTA through signup/sign-in.

### P2 — Cached or historical receipts can override a server Free result in the UI

BillingPanel's initial cache search matches a token suffix without selecting the current site. BillingPanel and AccountProvider also derive Pro from cached or historical orders/subscriptions even when current `is_pro` is false. A site switch, expired verification or revoked access can therefore show Pro or disable purchasing while protected operations are denied by the server.

Read caches only after resolving the exact site, bind them to account/site/environment, and keep cached presentation separate from current authorization. Reconcile with Qubtic and honor its boolean result before updating access. Mutation checks already revalidate server access; this finding does not establish an unauthorized CMS-write bypass.

### P2 — Order retries are not durably idempotent

Qubtic/src/app/api/email-commerce/order/route.ts uses an in-memory Map. The same request can be delivered again on a different serverless instance or after a restart. A connection timeout after SMTP acceptance is also ambiguous. Current tests prove coalescing in one loaded instance only.

Persist the store/environment/request-ID and request fingerprint with atomic claim/status transitions, a stable order reference and delivery attempts. Keep an uncertain-delivery state and avoid automatic SMTP retries that may duplicate an accepted message. SMTP itself cannot guarantee exactly-once inbox delivery.

### P2 — Storefront orders depend on the one-hour billing reconciliation lease

The order handler calls paidAccess and immediately rejects false; it does not perform the self-healing synchronization used by the plugin access endpoint. SQL billing_site_entitlements expire after one hour. If the externally scheduled reconciliation worker stops or cannot refresh all customers in time, a valid Lifetime store can stop receiving order requests even while its merchant is offline.

Verify and monitor the external POST reconciliation schedule in both environments, size its batch capacity to refresh customers within the lease, and consider bounded server-side reconciliation before rejecting a store solely because its verification lease expired. Preserve real refund/revocation checks. Hosted scheduler status was not inspected; this is a concrete failure mode, not a claim that the scheduler is currently absent.

## SMTP ownership and order semantics

The local order/config/test-smtp handlers use smtpTransport(settings), which reads the merchant's host, user, password and port from their settings. There is no Qubtic SMTP fallback. Qubtic hosts the dispatch API and encrypts the settings; the outgoing SMTP connection belongs to the merchant. Signup/team/account mail remains a separate Qubtic mail flow.

The merchant mail is an order/payment request. A successful SMTP response does not prove inbox delivery, payment, inventory reservation or seller acceptance. Customer receipt failure does not resubmit a merchant request. Server totals use the encrypted catalog snapshot, not visitor-supplied prices. Live merchant SMTP delivery remains an acceptance check.

## Recommended release sequence

1. Deploy the matching Qubtic endpoints and stable encryption key.
2. Publish and verify Lifetime catalogs separately in sandbox and production.
3. Fix guest pricing and server-authoritative/site-scoped billing UI.
4. Add durable order-request tracking; verify reconciliation and notification workers.
5. Run an authorized real signup and verify Qubtic team inbox delivery.
6. Complete a sandbox purchase, return to the same Framer site, and verify activation; verify another site stays Free and refunds revoke access.
7. Insert a CMS-backed component, publish a test Framer site, submit an order through the merchant's SMTP, and verify merchant inbox/optional customer copy without a payment-complete claim.
8. Perform a live purchase only as an explicitly authorized live acceptance test.

## Remediation after the audit

Implemented and verified locally: public guest Lifetime pricing with a working sign-in CTA; server-authoritative account/site billing state; same-site refund revalidation; private durable SMTP request claims across instances and restarts; bounded reconciliation before rejecting expired access; published managed-environment selection for storefront dispatch; authenticated merchant-SMTP configuration and privacy-safe readiness checks; active reconciliation/team-notification cron configuration; and a reproducible Lifetime catalog repair/provisioning script.

Final verification: 103 browser tests, 214 backend tests, both typechecks and both production builds passed. The sandbox build routing test also passed with mocked provider responses. `npm run build` now selects the verified Webpack path for Qubtic. Live checkout and real SMTP/inbox delivery were not performed.

Outstanding hosted changes are deliberately unapplied: automatic approval review rejected the operation that would create/enable the USD 99.99 production Lifetime product, change the sandbox catalog to Lifetime-only, and provision the private order ledger bucket, requiring explicit authorization for those exact production changes. The Vercel CLI also has no active login. No deployment or hosted billing/storage mutation was performed during remediation. See EMAIL_COMMERCE_BILLING.md for the reviewed release sequence and required server environment variables.
