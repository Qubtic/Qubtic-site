BEGIN;
CREATE TABLE public.plugin_admin_actions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),actor text NOT NULL,action text NOT NULL,user_id uuid REFERENCES framer_users(id),before_data jsonb,changed_at timestamptz NOT NULL,undo_until timestamptz NOT NULL,undone_at timestamptz,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE plugin_admin_actions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON plugin_admin_actions FROM PUBLIC,anon,authenticated;
GRANT ALL ON plugin_admin_actions TO service_role;
CREATE POLICY operations_service_only ON plugin_admin_actions TO service_role USING(true) WITH CHECK(true);
ALTER TABLE plugin_team_events ADD COLUMN recipient text;
ALTER TABLE plugin_team_events ADD COLUMN subject text;
ALTER TABLE plugin_team_events ADD COLUMN body text;
ALTER TABLE plugin_team_events ADD COLUMN actor text;
ALTER TABLE plugin_team_events ADD COLUMN available_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE plugin_team_events ADD COLUMN cancelled_at timestamptz;
CREATE TABLE public.plugin_mail_log(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),email text NOT NULL,plugin text NOT NULL,event text NOT NULL,status text NOT NULL,created_at timestamptz NOT NULL DEFAULT now());
ALTER TABLE plugin_mail_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON plugin_mail_log FROM PUBLIC,anon,authenticated;
GRANT ALL ON plugin_mail_log TO service_role;
CREATE POLICY mail_log_service_only ON plugin_mail_log TO service_role USING(true) WITH CHECK(true);
CREATE INDEX plugin_mail_log_recent ON plugin_mail_log(created_at DESC);
CREATE INDEX plugin_operations_users ON framer_users(plugin_slug,created_at DESC);
CREATE OR REPLACE FUNCTION claim_plugin_team_events() RETURNS SETOF plugin_team_events LANGUAGE sql SECURITY INVOKER SET search_path=public AS $$
 UPDATE plugin_team_events SET lease_until=now()+interval '2 minutes',attempts=attempts+1 WHERE id IN (SELECT id FROM plugin_team_events WHERE delivered_at IS NULL AND cancelled_at IS NULL AND available_at<=now() AND attempts<10 AND (lease_until IS NULL OR lease_until<now()) ORDER BY created_at LIMIT 5 FOR UPDATE SKIP LOCKED) RETURNING *;
$$;
CREATE FUNCTION plugin_admin_mutate(p_action text,p_user uuid,p_patch jsonb,p_actor text) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE u framer_users; before_json jsonb; action_id uuid; changed timestamptz:=clock_timestamp();
BEGIN
 IF p_action NOT IN ('create','update','delete') THEN RAISE EXCEPTION 'Invalid action'; END IF;
 IF p_action='create' THEN
  INSERT INTO framer_users(email,name,company_name,website_url,plugin_slug,plugin_name,status,auth_token,metadata) VALUES(lower(trim(p_patch->>'email')),p_patch->>'name',p_patch->>'company_name',p_patch->>'website_url',p_patch->>'plugin_slug',p_patch->>'plugin_name','pending_verification',p_patch->>'auth_token','{"email_verified":false}') RETURNING * INTO u;
 ELSE
  SELECT * INTO STRICT u FROM framer_users WHERE id=p_user FOR UPDATE;
  IF p_patch->>'expected_updated_at' IS DISTINCT FROM u.updated_at::text AND (p_patch->>'expected_updated_at')::timestamptz IS DISTINCT FROM u.updated_at THEN RAISE EXCEPTION 'User changed. Reload before editing.'; END IF;
  before_json:=jsonb_build_object('name',u.name,'company_name',u.company_name,'website_url',u.website_url,'status',u.status);
 END IF;
 UPDATE framer_users SET name=CASE WHEN p_action='update' THEN p_patch->>'name' ELSE name END,company_name=CASE WHEN p_action='update' THEN p_patch->>'company_name' ELSE company_name END,website_url=CASE WHEN p_action='update' THEN p_patch->>'website_url' ELSE website_url END,status=CASE WHEN p_action='delete' THEN 'inactive' WHEN p_action='update' THEN p_patch->>'status' ELSE status END,updated_at=changed WHERE id=u.id RETURNING updated_at INTO changed;
 INSERT INTO plugin_admin_actions(actor,action,user_id,before_data,changed_at,undo_until) VALUES(p_actor,p_action,u.id,before_json,changed,clock_timestamp()+interval '5 seconds') RETURNING id INTO action_id;
 RETURN (SELECT jsonb_build_object('id',id,'undoUntil',undo_until) FROM plugin_admin_actions WHERE id=action_id);
END $$;
CREATE FUNCTION undo_plugin_admin_action(p_id uuid,p_actor text) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE a plugin_admin_actions;
BEGIN
 SELECT * INTO STRICT a FROM plugin_admin_actions WHERE id=p_id FOR UPDATE;
 IF a.actor<>p_actor OR a.undone_at IS NOT NULL OR clock_timestamp()>a.undo_until THEN RAISE EXCEPTION 'Undo window has expired.'; END IF;
 PERFORM 1 FROM framer_users WHERE id=a.user_id AND updated_at=a.changed_at FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'User changed. Undo was not applied.'; END IF;
 IF a.action='create' THEN UPDATE framer_users SET status='inactive',updated_at=clock_timestamp() WHERE id=a.user_id;
 ELSE UPDATE framer_users SET name=a.before_data->>'name',company_name=a.before_data->>'company_name',website_url=a.before_data->>'website_url',status=a.before_data->>'status',updated_at=clock_timestamp() WHERE id=a.user_id; END IF;
 UPDATE plugin_admin_actions SET undone_at=clock_timestamp() WHERE id=a.id;
 RETURN true;
END $$;
CREATE FUNCTION plugin_operations_snapshot(p_environment text,p_plugin text DEFAULT '',p_search text DEFAULT '',p_page integer DEFAULT 0) RETURNS jsonb LANGUAGE sql STABLE SECURITY INVOKER SET search_path=public AS $$
WITH selected_users AS (SELECT * FROM framer_users WHERE (p_plugin='' OR plugin_slug=p_plugin) AND (p_search='' OR position(lower(p_search) in lower(email||' '||coalesce(name,'')||' '||coalesce(framer_user_id,'')))>0)),
selected_orders AS (SELECT o.*,c.email FROM billing_orders o JOIN billing_customers c ON c.id=o.customer_id WHERE o.environment=p_environment AND (p_plugin='' OR o.plugin_slug=p_plugin) AND (p_search='' OR position(lower(p_search) in lower(c.email||' '||o.polar_order_id))>0)),
user_page AS (SELECT id,email,name,company_name,website_url,plugin_slug,plugin_name,status,framer_user_id,framer_project_id,created_at,last_login_at,updated_at,coalesce((metadata->>'email_verified')::boolean,false) AS email_verified,metadata->>'authMode' AS signup_method,metadata->>'origin' AS signup_origin,metadata->>'framerSiteUrl' AS framer_site_url,metadata->>'avatar_url' AS avatar_url,(SELECT count(*) FROM billing_orders o JOIN billing_memberships m ON m.customer_id=o.customer_id AND m.environment=o.environment AND m.plugin_slug=o.plugin_slug WHERE m.user_id=selected_users.id AND o.environment=p_environment AND o.plugin_slug=selected_users.plugin_slug) AS purchases FROM selected_users ORDER BY created_at DESC,id LIMIT 25 OFFSET greatest(0,least(p_page,10000))*25),
order_page AS (SELECT polar_order_id,plugin_slug,cadence,status,amount,refunded_amount,currency,purchased_at,site_id,email FROM selected_orders ORDER BY purchased_at DESC LIMIT 25 OFFSET greatest(0,least(p_page,10000))*25),
mail_page AS (SELECT id,email,recipient,plugin,event,subject,body,created_at,delivered_at,cancelled_at,attempts,available_at FROM plugin_team_events WHERE (p_plugin='' OR plugin=p_plugin) AND (p_search='' OR position(lower(p_search) in lower(email))>0) ORDER BY created_at DESC LIMIT 25 OFFSET greatest(0,least(p_page,10000))*25),
daily AS (SELECT day::date AS date,(SELECT count(*) FROM selected_users u WHERE u.created_at>=day AND u.created_at<day+interval '1 day') AS signups FROM generate_series(date_trunc('day',now())-interval '29 days',date_trunc('day',now()),interval '1 day') day)
SELECT jsonb_build_object('users',coalesce((SELECT jsonb_agg(user_page) FROM user_page),'[]'),'orders',coalesce((SELECT jsonb_agg(order_page) FROM order_page),'[]'),'mail',coalesce((SELECT jsonb_agg(mail_page) FROM mail_page),'[]'),
'mailLog',coalesce((SELECT jsonb_agg(x) FROM (SELECT email,plugin,event,status,created_at FROM plugin_mail_log WHERE (p_plugin='' OR plugin=p_plugin) AND (p_search='' OR position(lower(p_search) in lower(email))>0) ORDER BY created_at DESC LIMIT 25 OFFSET greatest(0,least(p_page,10000))*25)x),'[]'),
'daily',(SELECT jsonb_agg(daily) FROM daily),'totalUsers',(SELECT count(*) FROM selected_users),'totalOrders',(SELECT count(*) FROM selected_orders),'newUsers',(SELECT count(*) FROM selected_users WHERE created_at>now()-interval '7 days'),'activeUsers',(SELECT count(*) FROM selected_users WHERE last_login_at>now()-interval '7 days'),
'revenue',coalesce((SELECT jsonb_agg(r) FROM (SELECT currency,sum(amount-refunded_amount) AS net FROM selected_orders WHERE status IN ('paid','partially_refunded') GROUP BY currency)r),'[]'));
$$;
REVOKE ALL ON FUNCTION plugin_admin_mutate(text,uuid,jsonb,text),undo_plugin_admin_action(uuid,text),plugin_operations_snapshot(text,text,text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION plugin_admin_mutate(text,uuid,jsonb,text),undo_plugin_admin_action(uuid,text),plugin_operations_snapshot(text,text,text,integer) TO service_role;

ALTER TABLE plugin_control_audit ADD COLUMN prior_settings jsonb;
ALTER TABLE plugin_control_audit ADD COLUMN prior_secrets text;
ALTER TABLE plugin_control_audit ADD COLUMN prior_catalog jsonb;
ALTER TABLE plugin_control_audit ADD COLUMN undo_until timestamptz;
ALTER TABLE plugin_control_audit ADD COLUMN undone_at timestamptz;
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
   IF EXISTS(SELECT 1 FROM billing_catalog WHERE environment=env AND product_id=item->>'product_id' AND (plugin_slug<>item->>'plugin_slug' OR cadence<>item->>'cadence')) THEN RAISE EXCEPTION 'A historical product cannot change plugin or cadence'; END IF;
   INSERT INTO billing_catalog(environment,plugin_slug,cadence,product_id,benefit_id,enabled) VALUES(env,item->>'plugin_slug',item->>'cadence',item->>'product_id',item->>'benefit_id',true)
   ON CONFLICT(environment,product_id) DO UPDATE SET enabled=true,plugin_slug=EXCLUDED.plugin_slug,cadence=EXCLUDED.cadence,benefit_id=EXCLUDED.benefit_id;
  END LOOP;
 END IF;
 INSERT INTO plugin_control VALUES(p_id,p_settings,p_secrets,next_revision,now()) ON CONFLICT(id) DO UPDATE SET settings=EXCLUDED.settings,secrets=EXCLUDED.secrets,revision=EXCLUDED.revision,updated_at=now();
 INSERT INTO plugin_control_audit(config_id,revision,actor,prior_settings,prior_secrets,prior_catalog,undo_until) VALUES(p_id,next_revision,p_actor,prior_settings,prior_secrets,prior_catalog,clock_timestamp()+interval '5 seconds');
 RETURN next_revision;
END $$;
CREATE FUNCTION undo_plugin_control(p_id bigint,p_actor text) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
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
   FOR item IN SELECT value FROM jsonb_array_elements(a.prior_catalog) LOOP UPDATE billing_catalog SET enabled=true WHERE environment=env AND product_id=item->>'product_id'; END LOOP;
  END IF;
 END IF;
 UPDATE plugin_control_audit SET undone_at=clock_timestamp() WHERE id=a.id;RETURN true;
END $$;
REVOKE ALL ON FUNCTION undo_plugin_control(bigint,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION undo_plugin_control(bigint,text) TO service_role;

CREATE INDEX plugin_operations_orders ON billing_orders(environment,plugin_slug,purchased_at DESC);
CREATE INDEX plugin_team_events_pending ON plugin_team_events(available_at,created_at) WHERE delivered_at IS NULL AND cancelled_at IS NULL;
CREATE FUNCTION cancel_plugin_admin_mail(p_id text,p_actor text) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
BEGIN
 UPDATE plugin_team_events SET cancelled_at=clock_timestamp() WHERE id=p_id AND actor=p_actor AND event='manual' AND delivered_at IS NULL AND cancelled_at IS NULL AND lease_until IS NULL AND available_at>clock_timestamp();
 IF NOT FOUND THEN RAISE EXCEPTION 'Email cancellation window expired'; END IF;RETURN true;
END $$;
REVOKE ALL ON FUNCTION cancel_plugin_admin_mail(text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION cancel_plugin_admin_mail(text,text) TO service_role;
COMMIT;
