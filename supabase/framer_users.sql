-- ==============================================================================
-- QUBTIC AUTH: FRAMER USERS TABLE SCHEMA
-- Production PostgreSQL DDL for Supabase
-- Handles external authentication and user records for all Qubtic Framer Plugins:
-- - Frame Drop (frame-drop)
-- - Qube Auth (qube-auth)
-- - Future marketplace plugins
-- ==============================================================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.framer_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    name TEXT,
    plugin_slug TEXT NOT NULL, -- e.g. 'frame-drop', 'qube-auth', etc.
    plugin_name TEXT,          -- human-readable plugin name
    framer_user_id TEXT,       -- optional Framer user/creator ID passed from plugin
    framer_project_id TEXT,    -- optional Framer canvas/document ID
    plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'trial', 'pro', 'enterprise'
    auth_token TEXT UNIQUE NOT NULL,   -- session token returned to Framer plugin
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive', 'suspended'
    metadata JSONB DEFAULT '{}'::jsonb,    -- custom client/plugin payload
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT framer_users_email_plugin_unique UNIQUE (email, plugin_slug)
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_framer_users_plugin_slug ON public.framer_users(plugin_slug);
CREATE INDEX IF NOT EXISTS idx_framer_users_email ON public.framer_users(email);
CREATE INDEX IF NOT EXISTS idx_framer_users_auth_token ON public.framer_users(auth_token);
CREATE INDEX IF NOT EXISTS idx_framer_users_created_at ON public.framer_users(created_at DESC);

-- 3. Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION public.handle_framer_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_framer_users_updated_at ON public.framer_users;
CREATE TRIGGER trg_framer_users_updated_at
    BEFORE UPDATE ON public.framer_users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_framer_users_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.framer_users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Service Role has full access (used by Qubtic API backend)
CREATE POLICY "Service role full access on framer_users"
    ON public.framer_users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy 2: Public / Anon can verify their own session with auth_token
CREATE POLICY "Verify session by auth_token"
    ON public.framer_users
    FOR SELECT
    TO anon, authenticated
    USING (auth_token = current_setting('request.headers', true)::json->>'x-framer-token');

-- Policy 3: Allow authenticated / anon app to upsert via Qubtic Auth endpoint
CREATE POLICY "Allow anon insert/update via backend auth"
    ON public.framer_users
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Helpful sample query to inspect users per plugin:
-- SELECT plugin_slug, count(*) AS total_users, count(CASE WHEN plan = 'pro' THEN 1 END) AS pro_users
-- FROM public.framer_users
-- GROUP BY plugin_slug;
