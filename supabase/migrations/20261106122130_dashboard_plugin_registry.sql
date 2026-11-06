BEGIN;
-- Global plugin identities are separate from environment-specific payment settings.
CREATE TABLE public.plugin_registry(
 slug text PRIMARY KEY CHECK(length(slug)<=64 AND slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text NOT NULL CHECK(length(btrim(name)) BETWEEN 1 AND 80 AND name !~ '[[:cntrl:]<>"]'),
 builtin boolean NOT NULL DEFAULT false, created_by text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), registered_at timestamptz NOT NULL DEFAULT now(), cancelled_at timestamptz
);
CREATE TABLE public.plugin_registration_actions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL REFERENCES public.plugin_registry(slug),
 name text NOT NULL, actor text NOT NULL, changed_at timestamptz NOT NULL, undo_until timestamptz NOT NULL, undone_at timestamptz
);
ALTER TABLE public.plugin_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plugin_registration_actions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.plugin_registry,public.plugin_registration_actions FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE ON public.plugin_registry,public.plugin_registration_actions TO service_role;
CREATE POLICY registry_service_only ON public.plugin_registry TO service_role USING(true) WITH CHECK(true);
CREATE POLICY registration_audit_service_only ON public.plugin_registration_actions TO service_role USING(true) WITH CHECK(true);
INSERT INTO public.plugin_registry(slug,name,builtin,created_by) VALUES
 ('whatsapp-commerce','Email Commerce',true,'bootstrap'),('telegram-commerce','Telegram Commerce',true,'bootstrap'),
 ('qube-auth','Qube Auth',true,'bootstrap'),('frame-drop','Frame Drop',true,'bootstrap'),('key-vault','Key Vault',true,'bootstrap');

CREATE FUNCTION public.manage_plugin_registration(p_action text,p_slug text,p_name text,p_actor text,p_id uuid DEFAULT NULL)
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
  IF (SELECT count(*) FROM plugin_registry WHERE cancelled_at IS NULL)>=50 THEN RAISE EXCEPTION 'Plugin capacity reached'; END IF;
  stamp:=clock_timestamp();
  INSERT INTO plugin_registry(slug,name,created_by,registered_at) VALUES(p_slug,btrim(p_name),p_actor,stamp)
   ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name,created_by=EXCLUDED.created_by,registered_at=EXCLUDED.registered_at,cancelled_at=NULL;
  INSERT INTO plugin_registration_actions(slug,name,actor,changed_at,undo_until) VALUES(p_slug,btrim(p_name),p_actor,stamp,stamp+interval '5 seconds') RETURNING id INTO action_id;
  RETURN jsonb_build_object('id',action_id,'undoUntil',stamp+interval '5 seconds','slug',p_slug);
 ELSIF p_action='undo' THEN
  SELECT * INTO STRICT a FROM plugin_registration_actions WHERE id=p_id FOR UPDATE;
  IF a.actor<>p_actor OR a.undone_at IS NOT NULL OR clock_timestamp()>a.undo_until THEN RAISE EXCEPTION 'Undo expired'; END IF;
  SELECT * INTO STRICT registration FROM plugin_registry WHERE slug=a.slug FOR UPDATE;
  IF registration.builtin OR registration.registered_at<>a.changed_at OR registration.cancelled_at IS NOT NULL
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
REVOKE ALL ON FUNCTION public.manage_plugin_registration(text,text,text,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.manage_plugin_registration(text,text,text,text,uuid) TO service_role;
COMMIT;
