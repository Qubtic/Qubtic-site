# Local verification — 2026-11-04

| Project | Result |
| --- | --- |
| Qubtic | Typecheck passed; 138 backend tests passed; Next.js production build passed with Webpack. |
| WhatsApp Commerce | Typecheck/build passed; existing 87 browser tests passed; new production and sandbox routing checks passed separately. |
| Telegram Commerce | Typecheck/build passed; 112 browser checks passed in the standard HTTPS run; the two remaining portal tests passed after repairing their stale import adapter. Sandbox routing check passed separately. |
| Qube Auth | Typecheck/build passed; 42 tests passed, including environment separation and shared-profile entitlement checks. |
| Frame Drop | Typecheck/build passed; 157 tests passed. |
| Configuration | Local sandbox configuration validates three plans; sanitized dual-environment templates pass completeness validation. |

The tests cover concurrent requests using separate tokens, provider environments, and entitlement RPCs; invalid/conflicting selectors; missing credentials without fallback; environment-specific webhook secrets; immutable webhook path routing and signed body preservation; checkout launcher routing; environment-specific frontend cache keys; explicit sandbox Vite mode; and a repeatable PostgreSQL migration proving sandbox sync cannot change production plan displays or collide with production checkout retry keys.

The initial sandboxed runner could not access localhost sockets or fetch Google fonts. Network-enabled verification completed the build and browser checks. WhatsApp browser checks used a temporary local HTTP configuration; Telegram's full run and repaired portal checks used its standard HTTPS configuration. The temporary verification configurations and command logs were removed after recording results. Existing bundle-size warnings remain.

No Vercel deployment, live Supabase migration, Polar catalog update, webhook registration, or real purchase was performed. Follow [POLAR_ENVIRONMENTS.md](POLAR_ENVIRONMENTS.md) to activate the implementation after filling the matching credentials.
