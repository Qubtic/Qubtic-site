BEGIN;
-- Removal archives a stable identity. Customer records and historical billing rows stay intact.
ALTER TABLE public.plugin_registry ADD COLUMN archived_at timestamptz;
ALTER TABLE public.plugin_registry ADD COLUMN version integer NOT NULL DEFAULT 0;
ALTER TABLE public.plugin_registration_actions ADD COLUMN registry_version integer NOT NULL DEFAULT 0;
CREATE TABLE public.plugin_archive_actions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL REFERENCES public.plugin_registry(slug),
 actor text NOT NULL, prior_archived_at timestamptz, changed_version integer NOT NULL,
 config_audit_ids bigint[] NOT NULL DEFAULT '{}', config_revisions jsonb NOT NULL,
 orphan_catalog jsonb NOT NULL DEFAULT '[]', undo_until timestamptz NOT NULL, undone_at timestamptz
);
ALTER TABLE public.plugin_archive_actions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.plugin_archive_actions FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON public.plugin_archive_actions TO service_role;
CREATE POLICY plugin_archive_service_only ON public.plugin_archive_actions TO service_role USING(true) WITH CHECK(true);
CREATE OR REPLACE FUNCTION public.publish_plugin_control(p_id text,p_settings jsonb,p_secrets text,p_revision integer,p_actor text,p_catalog jsonb DEFAULT NULL) RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE current_revision integer; next_revision integer; env text; item jsonb; prior_settings jsonb; prior_secrets text; prior_catalog jsonb;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('plugin-registration'));
 PERFORM pg_advisory_xact_lock(hashtext('plugin-control:'||p_id));
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(p_settings->'plugins','[]'::jsonb)) p JOIN plugin_registry r ON r.slug=p->>'slug' WHERE r.archived_at IS NOT NULL AND p->>'enabled'='true') THEN RAISE EXCEPTION 'Restore the plugin before enabling plans'; END IF;
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
   IF EXISTS(SELECT 1 FROM plugin_registry WHERE slug=item->>'plugin_slug' AND archived_at IS NOT NULL) THEN RAISE EXCEPTION 'Restore the plugin before publishing products'; END IF;
   IF EXISTS(SELECT 1 FROM billing_catalog WHERE environment=env AND product_id=(item->>'product_id')::uuid AND (plugin_slug<>item->>'plugin_slug' OR cadence<>item->>'cadence')) THEN RAISE EXCEPTION 'A historical product cannot change plugin or cadence'; END IF;
   INSERT INTO billing_catalog(environment,plugin_slug,cadence,product_id,benefit_id,enabled) VALUES(env,item->>'plugin_slug',item->>'cadence',(item->>'product_id')::uuid,(item->>'benefit_id')::uuid,true)
   ON CONFLICT(environment,product_id) DO UPDATE SET enabled=true,plugin_slug=EXCLUDED.plugin_slug,cadence=EXCLUDED.cadence,benefit_id=EXCLUDED.benefit_id;
  END LOOP;
 END IF;
 INSERT INTO plugin_control(id,settings,secrets,revision,updated_at) VALUES(p_id,p_settings,p_secrets,next_revision,now()) ON CONFLICT(id) DO UPDATE SET settings=EXCLUDED.settings,secrets=EXCLUDED.secrets,revision=EXCLUDED.revision,updated_at=now();
 INSERT INTO plugin_control_audit(config_id,revision,actor,prior_settings,prior_secrets,prior_catalog,undo_until) VALUES(p_id,next_revision,p_actor,prior_settings,prior_secrets,prior_catalog,clock_timestamp()+interval '5 seconds');
 RETURN next_revision;
END $$;
CREATE OR REPLACE FUNCTION public.manage_plugin_registration(p_action text,p_slug text,p_name text,p_actor text,p_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE a plugin_registration_actions; registration plugin_registry; stamp timestamptz; action_id uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('plugin-registration'));
 IF p_actor IS NULL OR btrim(p_actor)='' THEN RAISE EXCEPTION 'Administrator required'; END IF;
 IF p_action='create' THEN
  IF p_slug IS NULL OR length(p_slug)>64 OR p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR p_name IS NULL OR length(btrim(p_name)) NOT BETWEEN 1 AND 80 OR p_name ~ '[[:cntrl:]<>"]'
   OR p_slug IN ('email-commerce','framedrop','plugin','framedrop-auth','keyvault') THEN RAISE EXCEPTION 'Invalid registration'; END IF;
  SELECT * INTO registration FROM plugin_registry WHERE slug=p_slug FOR UPDATE;
  IF FOUND AND (registration.builtin OR registration.cancelled_at IS NULL) THEN RAISE EXCEPTION 'Plugin ID already registered' USING ERRCODE='23505'; END IF;
  IF (SELECT count(*) FROM plugin_registry WHERE cancelled_at IS NULL AND archived_at IS NULL)>=50 THEN RAISE EXCEPTION 'Plugin capacity reached'; END IF;
  stamp:=clock_timestamp();
  INSERT INTO plugin_registry(slug,name,created_by,registered_at) VALUES(p_slug,btrim(p_name),p_actor,stamp)
   ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,created_by=EXCLUDED.created_by,registered_at=EXCLUDED.registered_at,cancelled_at=NULL,archived_at=NULL,version=plugin_registry.version+1;
  INSERT INTO plugin_registration_actions(slug,name,actor,changed_at,registry_version,undo_until) VALUES(p_slug,btrim(p_name),p_actor,stamp,(SELECT version FROM plugin_registry WHERE slug=p_slug),stamp+interval '5 seconds') RETURNING id INTO action_id;
  RETURN jsonb_build_object('id',action_id,'undoUntil',stamp+interval '5 seconds','slug',p_slug);
 ELSIF p_action='undo' THEN
  SELECT * INTO STRICT a FROM plugin_registration_actions WHERE id=p_id FOR UPDATE;
  IF a.actor<>p_actor OR a.undone_at IS NOT NULL OR clock_timestamp()>a.undo_until THEN RAISE EXCEPTION 'Undo expired'; END IF;
  SELECT * INTO STRICT registration FROM plugin_registry WHERE slug=a.slug FOR UPDATE;
  IF registration.builtin OR registration.archived_at IS NOT NULL OR registration.version<>a.registry_version OR registration.registered_at<>a.changed_at OR registration.cancelled_at IS NOT NULL
   OR EXISTS(SELECT 1 FROM framer_users WHERE plugin_slug=a.slug)
   OR EXISTS(SELECT 1 FROM framer_pairing_sessions WHERE plugin_slug=a.slug)
   OR EXISTS(SELECT 1 FROM billing_catalog WHERE plugin_slug=a.slug)
   OR EXISTS(SELECT 1 FROM plugin_control c CROSS JOIN LATERAL jsonb_array_elements(coalesce(c.settings->'plugins','[]'::jsonb)) p WHERE p->>'slug'=a.slug)
   THEN RAISE EXCEPTION 'Plugin is already in use'; END IF;
  -- Keep the identity and audit row; an undo never deletes customer or billing records.
  UPDATE plugin_registry SET cancelled_at=clock_timestamp() WHERE slug=a.slug;
  UPDATE plugin_registration_actions SET undone_at=clock_timestamp() WHERE id=a.id;
  RETURN jsonb_build_object('success',true);
 END IF;
 RAISE EXCEPTION 'Unsupported registration action';
END $$;

CREATE OR REPLACE FUNCTION public.undo_plugin_control(p_id bigint,p_actor text) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE a plugin_control_audit; current_revision integer; item jsonb; env text;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('plugin-registration'));
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



CREATE FUNCTION public.manage_plugin_archive(p_action text,p_slug text,p_actor text,p_version integer,p_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE registration plugin_registry; a plugin_archive_actions; c plugin_control; next_settings jsonb; rows jsonb;
 audit_ids bigint[]:='{}'; audit_id bigint; revisions jsonb; orphans jsonb:='[]'; item jsonb;
 next_revision integer; stamp timestamptz; action_id uuid;
BEGIN
 PERFORM pg_advisory_xact_lock(hashtext('plugin-registration'));
 IF p_actor IS NULL OR btrim(p_actor)='' THEN RAISE EXCEPTION 'Administrator required'; END IF;
 IF p_action='undo-archive' THEN
  SELECT * INTO STRICT a FROM plugin_archive_actions WHERE id=p_id FOR UPDATE;
  IF a.actor<>p_actor OR a.undone_at IS NOT NULL OR clock_timestamp()>a.undo_until THEN RAISE EXCEPTION 'Undo expired'; END IF;
  SELECT * INTO STRICT registration FROM plugin_registry WHERE slug=a.slug FOR UPDATE;
  SELECT coalesce(jsonb_object_agg(id,revision),'{}'::jsonb) INTO revisions FROM plugin_control WHERE id IN ('polar:production','polar:sandbox');
  IF registration.version<>a.changed_version OR revisions<>a.config_revisions THEN RAISE EXCEPTION 'Configuration changed'; END IF;
  UPDATE plugin_registry SET archived_at=a.prior_archived_at,version=version+1 WHERE slug=a.slug;
  FOREACH audit_id IN ARRAY a.config_audit_ids LOOP PERFORM undo_plugin_control(audit_id,p_actor); END LOOP;
  FOR item IN SELECT value FROM jsonb_array_elements(a.orphan_catalog) LOOP
   UPDATE billing_catalog SET enabled=true WHERE environment=item->>'environment' AND product_id=(item->>'product_id')::uuid AND plugin_slug=a.slug AND benefit_id=(item->>'benefit_id')::uuid;
   IF NOT FOUND THEN RAISE EXCEPTION 'Historical catalog changed'; END IF;
  END LOOP;
  UPDATE plugin_archive_actions SET undone_at=clock_timestamp() WHERE id=a.id;
  RETURN jsonb_build_object('success',true,'slug',a.slug);
 END IF;
 IF p_action NOT IN ('archive','restore') THEN RAISE EXCEPTION 'Invalid archive action'; END IF;
 SELECT * INTO STRICT registration FROM plugin_registry WHERE slug=p_slug AND cancelled_at IS NULL FOR UPDATE;
 IF p_version IS DISTINCT FROM registration.version OR (p_action='archive' AND registration.archived_at IS NOT NULL) OR (p_action='restore' AND registration.archived_at IS NULL) THEN RAISE EXCEPTION 'Plugin changed'; END IF;
 stamp:=clock_timestamp();
 UPDATE plugin_registry SET archived_at=CASE WHEN p_action='archive' THEN stamp ELSE NULL END,version=version+1 WHERE slug=p_slug;
 IF p_action='archive' THEN
  FOR c IN SELECT * FROM plugin_control WHERE id IN ('polar:production','polar:sandbox') ORDER BY id FOR UPDATE LOOP
   IF EXISTS(SELECT 1 FROM jsonb_array_elements(coalesce(c.settings->'plugins','[]'::jsonb)) p WHERE p->>'slug'=p_slug)
      OR EXISTS(SELECT 1 FROM billing_catalog WHERE environment=split_part(c.id,':',2) AND plugin_slug=p_slug AND enabled) THEN
    SELECT jsonb_set(c.settings,'{plugins}',coalesce(jsonb_agg(CASE WHEN p->>'slug'=p_slug THEN jsonb_set(p,'{enabled}','false'::jsonb) ELSE p END ORDER BY ord),'[]'::jsonb),true)
      INTO next_settings FROM jsonb_array_elements(coalesce(c.settings->'plugins','[]'::jsonb)) WITH ORDINALITY AS x(p,ord);
    SELECT coalesce(jsonb_agg(to_jsonb(b)),'[]'::jsonb) INTO rows FROM billing_catalog b WHERE environment=split_part(c.id,':',2) AND enabled AND plugin_slug<>p_slug;
    SELECT publish_plugin_control(c.id,next_settings,c.secrets,c.revision,p_actor,rows) INTO next_revision;
    SELECT id INTO audit_id FROM plugin_control_audit WHERE config_id=c.id AND revision=next_revision AND actor=p_actor ORDER BY id DESC LIMIT 1;
    audit_ids:=array_append(audit_ids,audit_id);
   END IF;
  END LOOP;
  SELECT coalesce(jsonb_agg(to_jsonb(b)),'[]'::jsonb) INTO orphans FROM billing_catalog b WHERE plugin_slug=p_slug AND enabled AND NOT EXISTS(SELECT 1 FROM plugin_control WHERE id='polar:'||b.environment);
  UPDATE billing_catalog b SET enabled=false WHERE plugin_slug=p_slug AND enabled AND NOT EXISTS(SELECT 1 FROM plugin_control WHERE id='polar:'||b.environment);
 END IF;
 SELECT coalesce(jsonb_object_agg(id,revision),'{}'::jsonb) INTO revisions FROM plugin_control WHERE id IN ('polar:production','polar:sandbox');
 INSERT INTO plugin_archive_actions(slug,actor,prior_archived_at,changed_version,config_audit_ids,config_revisions,orphan_catalog,undo_until)
 VALUES(p_slug,p_actor,registration.archived_at,registration.version+1,audit_ids,revisions,orphans,stamp+interval '5 seconds') RETURNING id INTO action_id;
 RETURN jsonb_build_object('id',action_id,'slug',p_slug,'undoUntil',stamp+interval '5 seconds');
END $$;
REVOKE ALL ON FUNCTION public.manage_plugin_archive(text,text,text,integer,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.manage_plugin_archive(text,text,text,integer,uuid) TO service_role;
COMMIT;
