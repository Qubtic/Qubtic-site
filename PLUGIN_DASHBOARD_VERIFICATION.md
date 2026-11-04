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
