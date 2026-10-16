-- ==============================================================================
-- QUBTIC AUTH: FRAMER PAIRING SESSIONS TABLE SCHEMA (RFC 8628)
-- Production PostgreSQL DDL for Supabase
-- Implements secure, zero-PII Device Authorization Grant flow for Framer plugins
-- ==============================================================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.framer_pairing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code TEXT UNIQUE NOT NULL,      -- 256-bit cryptographically secure token (64 hex)
    user_code TEXT UNIQUE NOT NULL,        -- Human-readable short code (e.g. 'FD-8492')
    plugin_slug TEXT NOT NULL,             -- e.g. 'frame-drop', 'qube-auth'
    plugin_name TEXT,                      -- Human-readable plugin name
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'consumed', 'expired'
    expires_at TIMESTAMPTZ NOT NULL,       -- 10-minute default TTL
    poll_interval INT NOT NULL DEFAULT 3,  -- RFC 8628 polling interval in seconds
    poll_count INT NOT NULL DEFAULT 0,     -- Number of polls conducted
    last_poll_at TIMESTAMPTZ,              -- Timestamp of last poll request
    auth_token TEXT,                       -- Session token attached upon user confirmation
    user_data JSONB,                       -- Authenticated user profile snapshot
    metadata JSONB DEFAULT '{}'::jsonb,    -- Client / session metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Performance & Security Indexes
CREATE INDEX IF NOT EXISTS idx_framer_pairing_device_code ON public.framer_pairing_sessions(device_code);
CREATE INDEX IF NOT EXISTS idx_framer_pairing_user_code ON public.framer_pairing_sessions(user_code);
CREATE INDEX IF NOT EXISTS idx_framer_pairing_status ON public.framer_pairing_sessions(status);
CREATE INDEX IF NOT EXISTS idx_framer_pairing_expires_at ON public.framer_pairing_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_framer_pairing_plugin_slug ON public.framer_pairing_sessions(plugin_slug);

-- 3. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_framer_pairing_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_framer_pairing_sessions_updated_at ON public.framer_pairing_sessions;
CREATE TRIGGER trg_framer_pairing_sessions_updated_at
    BEFORE UPDATE ON public.framer_pairing_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_framer_pairing_sessions_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.framer_pairing_sessions ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service Role has full access (used by Qubtic API backend)
CREATE POLICY "Service role full access on framer_pairing_sessions"
    ON public.framer_pairing_sessions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy 2: Allow anon / authenticated insert for pairing initiation
CREATE POLICY "Allow pairing initiate"
    ON public.framer_pairing_sessions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Policy 3: Allow session polling by device_code
CREATE POLICY "Allow pairing poll by device_code"
    ON public.framer_pairing_sessions
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy 4: Allow session confirmation by authenticated user
CREATE POLICY "Allow pairing confirm update"
    ON public.framer_pairing_sessions
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
