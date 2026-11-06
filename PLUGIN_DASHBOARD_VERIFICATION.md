# Plugin dashboard verification

## Commerce account transport repair (2026-11-07)

Read-only live checks now show both managed payment environments enabled (production revision 9, sandbox revision 5). Anonymous access/catalog requests return the expected 401 in both environments, and preflight returns 204. Email Commerce sandbox plans are enabled, but its approved developer email list is empty. The visible Email Commerce name correctly retains the canonical `whatsapp-commerce` account and API identity.

Reproduced a separate transport error with synthetic verified accounts: the Commerce access catch converted the sandbox actor's approved-developer 403 into a generic account-service 503. It now preserves controlled BillingError status/messages while hiding unexpected database details. Pairing, the retired auth response, signout and preflight bypass payment configuration; access continues to load the selected environment and validate current entitlements. No plan or entitlement fallback was added.

All 164 tests, typecheck and the Webpack production build passed. New regressions cover both Commerce plugins, approved-developer rejection before entitlement work, generic private-error handling, pairing/resolution and signout while billing is unavailable, revoked token verification, and retained failure for access. The patch requires deployment. The testing email must be explicitly entered and published by the administrator; no allowlist, account or credential was changed. Vercel runtime-log access returned 403, and the scoped CLI fallback had no stored credentials; its login prompt was cancelled. The exact authenticated request shown in the screenshot and real Framer sign-in remain unverified.

## Local plugin preflight repair (2026-11-07)

The deployed billing catalog/status/refresh and Commerce access preflights returned 503 with CORS headers because the shared billing wrapper loaded managed payment configuration before handling OPTIONS. Read-only live configuration checks showed production revision 8 and sandbox revision 4 both globally disabled, despite enabled Telegram production plans and Email Commerce sandbox plans. Sandbox developer lists were empty. No settings or credentials were changed.

The shared wrapper now returns 204 before configuration loading for preflight requests. Actual requests continue to fail closed and report safe environment-specific disabled/unconfigured messages. Unexpected database/decryption errors retain a generic response. No additional migration is required.

All 158 tests, typecheck and production builds (Turbopack and Webpack) passed. HTTP checks against the built local server confirmed 204 for catalog, status, refresh and both Commerce access routes with the browser's requested headers and `https://localhost:5173` origin. Chromium cross-origin fetches from a local test origin reached the real built catalog route in both environments and read the expected disabled-environment 503 JSON, rather than a CORS network failure. Verification used an invalid account token and created no checkout, payment, email or data mutation. The temporary test servers were stopped. The updated backend still needs deployment, dashboard activation and authenticated Framer checkout acceptance.

- Qubtic typecheck passed.
- 150 backend tests passed, including credential encryption/tamper protection, anonymous and cross-origin admin rejection, no secret readback, optimistic publication conflicts, database rollback, historical product ownership, RLS grants, and sandbox developer authorization.
- Browser preview verified live/sandbox/mail tabs, the plugin workspace, mobile overflow, and no authored inline CSS declarations. Preview uses mocked configuration and Qubtic's actual built Inter/Plus Jakarta Sans fonts; it does not represent live account state.
- Next.js production build passed with Webpack, including the admin API authorization proxy.

Not performed: applying the migration to live Supabase, importing live credentials, resetting a real admin password, deploying Vercel, sending real email, or making a real checkout. Follow PLUGIN_DASHBOARD_SETUP.md before production activation.

A local encryption key was generated in ignored .env without exposing it. Legacy local variables remain only to support the documented import; the deployed request path reads payment configuration from Supabase; shared SMTP delivery credentials read Vercel ENV directly.


## Operations extension

The additional migration `20261104095407_plugin_operations.sql` was tested in embedded PostgreSQL. Checks cover privacy-safe paginated snapshots, environment filtering, pending account creation, immutable licensing fields, deactivation/update snapshots, undo deadlines and conflicts, encrypted configuration rollback, mail cancellation, RLS privileges and administrator API authorization. The full suite now contains 150 passing tests.

A browser preview with synthetic records verified production default, sandbox switching, user edit/undo, delete confirmation, backend-driven registration controls, image-manager presence and responsive layout. Screenshots are in `test-results/plugin-operations/`. No real user was changed and no email was sent. Both dashboard migrations must be applied before deploying this extension.


## Vercel infrastructure ENV and compact layout update

Typecheck, all 150 backend/database tests and `npm run build -- --webpack` passed. New checks verify ENV-only SMTP transport/sender (without database credentials), rejection/redaction of legacy SMTP writes/readback, shared-benefit publication across all three provider products, removal of duplicate registry aliases, and migration cleanup of active/audit SMTP credentials. The cleanup trigger prevents undo or old writes from restoring SMTP secrets and retains RLS/grants.

The built `/portfolio/admin` page was inspected locally with synthetic API responses at 1920px and 390px. Checks verified full-width content with 16px desktop/10px mobile gutters, legacy shared-benefit loading, a single benefit control saving to all three plans, no SMTP credential controls, image manager, and no mobile horizontal overflow. Desktop/mobile captures are in `test-results/plugin-operations/admin-settings-*.png`. The standalone preview also checked dark mode and existing operations/undo controls.

The live Vercel ENV inventory returned 403 for this connection's project-team scope. No Vercel variables were changed, no production deployment or hosted migration was performed, and no email was sent. Apply the documented ENV/deployment/cleanup sequence before claiming this version live.


## Live catalog publication repair (2026-11-06)

Reproduced SQLSTATE 42883 (`uuid = text`) against the connected production schema. The old minimal publication test used text catalog IDs, so it missed the live type mismatch. The new regression loads the real billing schema with UUID columns, reproduces the old failure, applies the repair, and verifies publication, both undo branches, historical ownership, invalid UUID rollback, revision conflicts, environment isolation and denied public function access. All 151 tests passed.

Applied `plugin_catalog_uuid_publish` to the live Qubtic Supabase project and confirmed UUID casts plus service-only function grants. Validated the saved production organization, three Telegram products, shared benefit, cadence and positive fixed prices using Polar read requests. Published only the requested Telegram activation with unchanged stored credentials through the repaired CAS function (revision 4 to 5). Readback confirms Telegram monthly/yearly/lifetime rows enabled; the sandbox active row count remains three. No purchase, checkout or email was initiated.

The deployed production catalog route returns the expected anonymous 401 instead of a configuration failure. Authenticated Framer UI and a real checkout remain user-side acceptance checks. The currently open plugin must be reopened to fetch its catalog; its Refresh billing handler only refreshes access/status. Existing unrelated security advisor warnings were unchanged by this migration.


## Dashboard plugin registration (2026-11-06)

Added the administrator-only Add plugin dialog with automatic ID suggestion, duplicate/reserved-ID errors, permanent canonical IDs and five-second undo. Registrations merge with existing code-defined plugins, populate the user/payment filters and are accepted by payment publication. New plugins have no enabled plans until separately configured and published. Dynamic metadata supplies names to account creation, pairing, the `/auth/{id}` page and transactional email content. Existing installed aliases remain reserved.

All 154 tests passed, including actual UUID-schema registration/RLS checks, service-role RPC execution, anonymous/authenticated denial, invalid inputs, duplicate IDs, actor/deadline/use guards, metadata merging and dynamic billing/filter acceptance. Typecheck and the production Webpack build passed. The browser preview verified Add plugin, error feedback, repeated opening after undo, disabled initial plans, preserved unsaved configuration and responsive layouts. A modal reset race found during the final rerun was fixed by mounting a fresh registration form each time. Synthetic examples were never registered permanently in production.

Applied `supabase/migrations/20261106122130_dashboard_plugin_registry.sql` to the live Qubtic database. A service-role registration/undo verification ran in a rolled-back transaction. Readback shows five built-in registrations, zero custom examples, RLS enabled, denied public writes/function access and allowed service-role registration. Production revision 7 and three enabled production plans, plus zero active sandbox plans at the time of this migration, were unchanged. Existing unrelated advisor warnings were unchanged.

The new dashboard/server code still requires a Qubtic deployment before the live Add plugin button is available. Registration creates Qubtic identity/configuration; Framer client login, billing and paid-feature enforcement must use the same ID. No Framer Marketplace submission, real email or purchase was performed.


## Plugin removal and asset editor (2026-11-06)

Added a confirmation modal, five-second Undo, Active/Removed lists and restoration for built-in and dashboard-registered plugins. Removal disables new-purchase catalog rows and plan settings across both environments, preserving identity, credentials, customer/history records, subscriptions and verified paid access. A normal restore leaves plans off pending provider validation/publication. Historical filters retain removed plugins; account creation excludes them.

All 155 backend/database tests passed. New checks exercise real UUID catalogs in both environments, retained order/site-entitlement access, unrelated plugin preservation, service-role execution, actor/deadline/version guards, publication rejection for removed plugins, restoration and orphan catalog undo. The browser preview checked removal confirmation/cancellation, removal/undo, later restoration, disabled plan controls, full-logo containment, JSON formatting/object validation, existing registration/operations flows and mobile overflow.

The logo/manifest UI uses scoped external CSS and Qubtic tokens with dark/light styles. The existing media manager and server credentials are reused. The default image uploader elsewhere remains unchanged. Previews use synthetic data; no file was uploaded to the live media account.

Applied `supabase/migrations/20261106125605_plugin_archive_restore.sql` to the connected live database. A synthetic registration/removal/undo check ran as service_role inside a rolled-back transaction. Readback confirmed six existing registry rows, zero removed plugins, production revision 7 with three active plans and sandbox revision 3 with zero active plans, matching the pre-migration state. Archive audit RLS is enabled; public invocation/read access is denied. Existing unrelated advisor warnings were unchanged. No real plugin, user, subscription or payment was removed or cancelled.

Removal stops new checkout creation; existing Polar subscriptions continue billing and already-open checkouts may complete. Invalid or unsupported logo references show an unavailable preview rather than breaking the editor or sidebar. The updated app code must be deployed to Vercel before these controls and the asset editor appear live. Real provider cancellation/checkout flows were not exercised by this UI change.
