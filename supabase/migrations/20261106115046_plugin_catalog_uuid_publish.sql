BEGIN;
-- Catalog product/benefit columns are UUIDs; JSON extraction returns text.
-- Cast at every comparison/write, including the initial-configuration undo path.
CREATE OR REPLACE FUNCTION public.publish_plugin_control(p_id text,p_settings jsonb,p_secrets text,p_revision integer,p_actor text,p_catalog jsonb DEFAULT NULL) RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE current_revision integer; next_revision integer; env text; item jsonb; prior_settings jsonb; prior_secrets text; prior_catalog jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('plugin-control:'||p_id));
 SELECT revision INTO current_revision FROM plugin_control WHERE id=p_id FOR UPDATE;
 IF COALESCE(current_revision,0)<>p_revision THEN RAISE EXCEPTION 'Configuration changed. Reload before saving.'; END IF;
 SELECT settings,secrets INTO prior_settings,prior_secrets FROM plugin_control WHERE id=p_id;
 IF p_catalog IS NOT NULL THEN SELECT coalesce(jsonb_agg(to_jsonb(c)),'[]'::jsonb) INTO prior_catalog FROM billing_catalog c WHERE environment=split_part(p_id,':',2) AND enabled; END IF;
 next_revision:=COALESCE(current_revision,0)+1;
 IF p_catalog IS NOT NULL THEN
  env:=split_part(p_id,':',2);
  IF env NOT IN ('production','sandbox') THEN RAISE EXCEPTION 'Invalid environment'; END IF;
  UPDATE billing_catalog SET enabled=false WHERE environment=env;
  FOR item IN SELECT value FROM jsonb_array_elements(p_catalog) LOOP
   IF EXISTS(SELECT 1 FROM billing_catalog WHERE environment=env AND product_id=(item->>'product_id')::uuid AND (plugin_slug<>item->>'plugin_slug' OR cadence<>item->>'cadence')) THEN RAISE EXCEPTION 'A historical product cannot change plugin or cadence'; END IF;
   INSERT INTO billing_catalog(environment,plugin_slug,cadence,product_id,benefit_id,enabled) VALUES(env,item->>'plugin_slug',item->>'cadence',(item->>'product_id')::uuid,(item->>'benefit_id')::uuid,true)
   ON CONFLICT(environment,product_id) DO UPDATE SET enabled=true,plugin_slug=EXCLUDED.plugin_slug,cadence=EXCLUDED.cadence,benefit_id=EXCLUDED.benefit_id;
  END LOOP;
 END IF;
 INSERT INTO plugin_control(id,settings,secrets,revision,updated_at) VALUES(p_id,p_settings,p_secrets,next_revision,now()) ON CONFLICT(id) DO UPDATE SET settings=EXCLUDED.settings,secrets=EXCLUDED.secrets,revision=EXCLUDED.revision,updated_at=now();
 INSERT INTO plugin_control_audit(config_id,revision,actor,prior_settings,prior_secrets,prior_catalog,undo_until) VALUES(p_id,next_revision,p_actor,prior_settings,prior_secrets,prior_catalog,clock_timestamp()+interval '5 seconds');
 RETURN next_revision;
END $$;
CREATE OR REPLACE FUNCTION public.undo_plugin_control(p_id bigint,p_actor text) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE a plugin_control_audit; current_revision integer; item jsonb; env text;
BEGIN
 SELECT * INTO STRICT a FROM plugin_control_audit WHERE id=p_id FOR UPDATE;
 IF a.actor<>p_actor OR a.undone_at IS NOT NULL OR a.undo_until IS NULL OR clock_timestamp()>a.undo_until THEN RAISE EXCEPTION 'Undo expired'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('plugin-control:'||a.config_id));
 SELECT revision INTO current_revision FROM plugin_control WHERE id=a.config_id FOR UPDATE;
 IF current_revision IS DISTINCT FROM a.revision THEN RAISE EXCEPTION 'Configuration changed'; END IF;
 IF a.prior_settings IS NOT NULL THEN
  PERFORM publish_plugin_control(a.config_id,a.prior_settings,a.prior_secrets,current_revision,p_actor,a.prior_catalog);
 ELSE
  DELETE FROM plugin_control WHERE id=a.config_id;
  IF a.prior_catalog IS NOT NULL THEN
   env:=split_part(a.config_id,':',2);UPDATE billing_catalog SET enabled=false WHERE environment=env;
   FOR item IN SELECT value FROM jsonb_array_elements(a.prior_catalog) LOOP UPDATE billing_catalog SET enabled=true WHERE environment=env AND product_id=(item->>'product_id')::uuid; END LOOP;
  END IF;
 END IF;
 UPDATE plugin_control_audit SET undone_at=clock_timestamp() WHERE id=a.id;RETURN true;
END $$;
REVOKE ALL ON FUNCTION undo_plugin_control(bigint,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION undo_plugin_control(bigint,text) TO service_role;


REVOKE ALL ON FUNCTION public.publish_plugin_control(text,jsonb,text,integer,text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.publish_plugin_control(text,jsonb,text,integer,text,jsonb) TO service_role;
COMMIT;
