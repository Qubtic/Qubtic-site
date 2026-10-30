# WhatsApp Commerce / Qubtic Auth

## FrameDrop analysis and resulting integration

FrameDrop opens `/auth/frame-drop?code=...`, renders `QubticFramerAuthPortal`, and signs up/signs in through `/api/framer-auth/otp` and `/api/framer-auth/session`. The server stores profiles in `framer_users` (unique `email, plugin_slug`) and plugin handshakes in `framer_pairing_sessions`. Password reset uses the shared reset-password route and existing branded email service. Admin management reads the same user table.

WhatsApp Commerce now renders that same portal at `/auth/whatsapp-commerce`, with its own name, icon, account namespace, email branding, and `WC-` connection code. The plugin keeps its `/api/whatsapp-commerce/pair`, `/access`, and `/signout` URLs as a transport adapter to shared Qubtic Auth. The former standalone `/auth` API returns HTTP 410; Supabase Auth OTP and `commerce_*` tables are no longer required by this flow.

Verified signups start Free, irrespective of client `plan` values or registration dates. Existing server-managed Pro/Enterprise plans are preserved. FrameDrop also starts Free; neither plugin receives promotional access. Feature gating and Polar fulfillment remain outside this authentication change.

## Database and deployment

1. On a fresh Supabase database, apply `supabase/framer_users.sql`, then `supabase/pairing_sessions.sql`.
2. Apply `supabase/whatsapp_commerce_shared_auth.sql` last. It closes the original public account/token policies and permits the server service role. All shared Qubtic Auth server routes must have `SUPABASE_SERVICE_ROLE_KEY` before this migration is applied; the change also protects FrameDrop's shared tables.
3. Configure `ADMIN_SESSION_SECRET` (or the server service-role key as signing fallback). Admin sessions now use signed, expiring cookies; existing admins must sign in again. The shared user-management API requires that session and omits bearer tokens and credential metadata.
4. Configure the existing Qubtic server Supabase and SMTP environment and deploy the Qubtic website plus the rebuilt WhatsApp Commerce plugin together. Keep keys server-side. The service-role client is marked `server-only`.
5. Existing standalone `wc_` sessions must sign in again. Existing `commerce_*` tables are retained; no users are silently deleted or granted Pro. Re-register through the shared portal to create the plugin-specific account, or perform a separately reviewed data migration if old accounts need transferring.
6. Apply `supabase/free_pro_only.sql` to clear old promotional grants and enforce Free/Pro in the shared database. Non-promotional Pro records are preserved; old Trial/Enterprise values become Free.
7. Confirm signup email delivery, verification, password sign-in/reset, plugin polling, Free access, admin filtering, and server-confirmed Pro in the deployed environment.

Shared portal sessions are stored per plugin in the browser. The plugin receives its token only through private device-code polling. Access checks reject other-plugin, pending, inactive, and suspended accounts and do not revive revoked tokens from pairing snapshots. In production WhatsApp Commerce access does not fall back to local account snapshots or issue accounts when database persistence fails.

## Local validation

`npm test` in Qubtic covers shared signup, Free plan enforcement, FrameDrop compatibility, password sign-in, pairing isolation, email-code isolation/consumption, sign-out, and the compatibility API. Email delivery and database calls are mocked; no actual messages or live records are created. The old standalone SQL tests remain available separately via `npm run test:commerce:legacy`.
