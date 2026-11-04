# Plugin dashboard verification

- Qubtic typecheck passed.
- 144 backend tests passed, including credential encryption/tamper protection, anonymous and cross-origin admin rejection, no secret readback, optimistic publication conflicts, database rollback, historical product ownership, RLS grants, and sandbox developer authorization.
- Browser preview verified live/sandbox/mail tabs, the plugin workspace, mobile overflow, and no authored inline CSS declarations. Preview uses mocked configuration and Qubtic's actual built Inter/Plus Jakarta Sans fonts; it does not represent live account state.
- Next.js production build passed with Webpack, including the admin API authorization proxy.

Not performed: applying the migration to live Supabase, importing live credentials, resetting a real admin password, deploying Vercel, sending real email, or making a real checkout. Follow PLUGIN_DASHBOARD_SETUP.md before production activation.

A local encryption key was generated in ignored .env without exposing it. Legacy local variables remain only to support the documented import; the deployed request path reads payment and shared SMTP configuration from Supabase.


## Operations extension

The additional migration `20261104095407_plugin_operations.sql` was tested in embedded PostgreSQL. Checks cover privacy-safe paginated snapshots, environment filtering, pending account creation, immutable licensing fields, deactivation/update snapshots, undo deadlines and conflicts, encrypted configuration rollback, mail cancellation, RLS privileges and administrator API authorization. The full suite now contains 146 passing tests.

A browser preview with synthetic records verified production default, sandbox switching, user edit/undo, delete confirmation, backend-driven registration controls, image-manager presence and responsive layout. Screenshots are in `test-results/plugin-operations/`. No real user was changed and no email was sent. Both dashboard migrations must be applied before deploying this extension.
