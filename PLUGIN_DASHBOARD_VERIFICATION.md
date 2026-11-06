# Plugin dashboard verification

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
