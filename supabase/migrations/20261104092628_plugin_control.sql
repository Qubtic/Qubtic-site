BEGIN;
CREATE TABLE public.plugin_control(id text PRIMARY KEY, settings jsonb NOT NULL DEFAULT '{}', secrets text NOT NULL DEFAULT '', revision integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE public.plugin_control_audit(id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, config_id text NOT NULL, revision integer NOT NULL, actor text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE plugin_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_control_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON plugin_control,plugin_control_audit FROM PUBLIC,anon,authenticated;
GRANT ALL ON plugin_control,plugin_control_audit TO service_role;
GRANT USAGE,SELECT ON SEQUENCE plugin_control_audit_id_seq TO service_role;
CREATE POLICY service_only ON plugin_control TO service_role USING(true) WITH CHECK(true);
CREATE POLICY audit_service_only ON plugin_control_audit TO service_role USING(true) WITH CHECK(true);
CREATE FUNCTION public.publish_plugin_control(p_id text,p_settings jsonb,p_secrets text,p_revision integer,p_actor text,p_catalog jsonb DEFAULT NULL) RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE current_revision integer; next_revision integer; env text; item jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('plugin-control:'||p_id));
 SELECT revision INTO current_revision FROM plugin_control WHERE id=p_id FOR UPDATE;
 IF COALESCE(current_revision,0)<>p_revision THEN RAISE EXCEPTION 'Configuration changed. Reload before saving.'; END IF;
 next_revision:=COALESCE(current_revision,0)+1;
 IF p_catalog IS NOT NULL THEN
  env:=split_part(p_id,':',2);
  IF env NOT IN ('production','sandbox') THEN RAISE EXCEPTION 'Invalid environment'; END IF;
  UPDATE billing_catalog SET enabled=false WHERE environment=env;
  FOR item IN SELECT value FROM jsonb_array_elements(p_catalog) LOOP
   IF EXISTS(SELECT 1 FROM billing_catalog WHERE environment=env AND product_id=item->>'product_id' AND (plugin_slug<>item->>'plugin_slug' OR cadence<>item->>'cadence')) THEN RAISE EXCEPTION 'A historical product cannot change plugin or cadence'; END IF;
   INSERT INTO billing_catalog(environment,plugin_slug,cadence,product_id,benefit_id,enabled) VALUES(env,item->>'plugin_slug',item->>'cadence',item->>'product_id',item->>'benefit_id',true)
   ON CONFLICT(environment,product_id) DO UPDATE SET enabled=true,plugin_slug=EXCLUDED.plugin_slug,cadence=EXCLUDED.cadence,benefit_id=EXCLUDED.benefit_id;
  END LOOP;
 END IF;
 INSERT INTO plugin_control VALUES(p_id,p_settings,p_secrets,next_revision,now()) ON CONFLICT(id) DO UPDATE SET settings=EXCLUDED.settings,secrets=EXCLUDED.secrets,revision=EXCLUDED.revision,updated_at=now();
 INSERT INTO plugin_control_audit(config_id,revision,actor) VALUES(p_id,next_revision,p_actor);
 RETURN next_revision;
END $$;
REVOKE ALL ON FUNCTION publish_plugin_control(text,jsonb,text,integer,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION publish_plugin_control(text,jsonb,text,integer,text,jsonb) TO service_role;
CREATE TABLE public.plugin_team_events(id text PRIMARY KEY,event text NOT NULL,plugin text NOT NULL,email text NOT NULL,delivered_at timestamptz,lease_until timestamptz,attempts integer NOT NULL DEFAULT 0,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE plugin_team_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON plugin_team_events FROM PUBLIC,anon,authenticated;
GRANT ALL ON plugin_team_events TO service_role;
CREATE POLICY team_service_only ON plugin_team_events TO service_role USING(true) WITH CHECK(true);
CREATE FUNCTION claim_plugin_team_events() RETURNS SETOF plugin_team_events LANGUAGE sql SECURITY INVOKER SET search_path=public AS $$
 UPDATE plugin_team_events SET lease_until=now()+interval '2 minutes',attempts=attempts+1 WHERE id IN (SELECT id FROM plugin_team_events WHERE delivered_at IS NULL AND attempts<10 AND (lease_until IS NULL OR lease_until<now()) ORDER BY created_at LIMIT 5 FOR UPDATE SKIP LOCKED) RETURNING *;
$$;
REVOKE ALL ON FUNCTION claim_plugin_team_events() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION claim_plugin_team_events() TO service_role;
COMMIT;
