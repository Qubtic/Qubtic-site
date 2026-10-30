-- Shared account and pairing records are server-owned, including bearer credentials.
BEGIN;
ALTER TABLE public.framer_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framer_pairing_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Verify session by auth_token" ON public.framer_users;
DROP POLICY IF EXISTS "Allow anon insert/update via backend auth" ON public.framer_users;
DROP POLICY IF EXISTS "Allow pairing initiate" ON public.framer_pairing_sessions;
DROP POLICY IF EXISTS "Allow pairing poll by device_code" ON public.framer_pairing_sessions;
DROP POLICY IF EXISTS "Allow pairing confirm update" ON public.framer_pairing_sessions;
REVOKE ALL ON public.framer_users,public.framer_pairing_sessions FROM anon,authenticated;
GRANT ALL ON public.framer_users,public.framer_pairing_sessions TO service_role;
COMMIT;
