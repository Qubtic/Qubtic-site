-- Retire promotional access. Shared Qubtic Auth accounts use Free or Pro only.
-- Review and apply after backing up existing records. This does not create billing tables.
BEGIN;
UPDATE public.framer_users
SET plan = CASE
      WHEN metadata->>'is_early_bird' = 'true' OR plan NOT IN ('free','pro') THEN 'free'
      ELSE plan
    END,
    metadata = COALESCE(metadata, '{}'::jsonb) - 'is_early_bird' - 'early_bird_granted_at' - 'early_bird_cutoff',
    updated_at = now();
ALTER TABLE public.framer_users DROP CONSTRAINT IF EXISTS framer_users_plan_free_pro;
ALTER TABLE public.framer_users ADD CONSTRAINT framer_users_plan_free_pro CHECK (plan IN ('free','pro'));
-- Historical handshake snapshots must not resurrect promotional tiers.
UPDATE public.framer_pairing_sessions p
SET user_data = jsonb_set(
  COALESCE(p.user_data, '{}'::jsonb) - 'is_early_bird' - 'early_bird_granted_at',
  '{plan}',
  to_jsonb(COALESCE((SELECT u.plan FROM public.framer_users u WHERE u.id::text = p.user_data->>'id' AND u.plugin_slug = p.plugin_slug), 'free'))
)
WHERE p.user_data IS NOT NULL;
COMMIT;
