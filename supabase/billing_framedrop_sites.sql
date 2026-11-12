-- Apply AFTER billing_telegram_sites.sql and billing_discounted_orders.sql.
-- Existing explicit checkout site IDs are preserved. Unbound historical purchases stay unassigned.
BEGIN;
CREATE OR REPLACE VIEW frame_drop_plugin_payments WITH(security_invoker=true) AS SELECT * FROM billing_orders WHERE plugin_slug='frame-drop';
REVOKE ALL ON frame_drop_plugin_payments FROM PUBLIC,anon,authenticated;
GRANT SELECT ON frame_drop_plugin_payments TO service_role;
DROP INDEX IF EXISTS billing_checkout_active;
CREATE UNIQUE INDEX billing_checkout_active ON billing_checkouts(user_id,environment,plugin_slug,COALESCE(site_id,'')) WHERE status IN ('creating','open');
CREATE OR REPLACE FUNCTION billing_site_has_purchase(p_customer uuid,p_site text,p_plugin text) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE env text;
BEGIN
 SELECT environment INTO env FROM billing_customers WHERE id=p_customer;
 IF env IS NULL OR p_site IS NULL OR p_site='' OR p_plugin IS NULL OR p_plugin NOT IN ('whatsapp-commerce','telegram-commerce','frame-drop') THEN RETURN false; END IF;
 RETURN EXISTS(
  SELECT 1 FROM billing_subscriptions s
  JOIN billing_customers c ON c.id=s.customer_id AND c.environment=env
  WHERE s.plugin_slug=p_plugin AND s.site_id=p_site AND s.status='active' AND s.current_period_end>now()
 )
 OR EXISTS(
  SELECT 1 FROM billing_orders o
  JOIN billing_customers c ON c.id=o.customer_id AND c.environment=env
  WHERE o.plugin_slug=p_plugin AND o.site_id=p_site AND o.cadence='lifetime' AND billing_order_is_paid(o)
 );
END $$;
-- Keep existing WhatsApp callers compatible; new callers must pass p_plugin.
CREATE OR REPLACE FUNCTION billing_site_has_purchase(p_customer uuid,p_site text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT billing_site_has_purchase(p_customer,p_site,'whatsapp-commerce');
$$;
CREATE OR REPLACE FUNCTION billing_guard_site_checkout() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.plugin_slug IN ('whatsapp-commerce','telegram-commerce','frame-drop') AND NEW.site_id IS NOT NULL THEN
  -- Serialize against webhook snapshots so a just-paid site cannot race a second purchase.
  PERFORM 1 FROM billing_customers WHERE id=NEW.customer_id FOR UPDATE;
  IF EXISTS(SELECT 1 FROM billing_orders o JOIN billing_customers c ON c.id=o.customer_id AND c.environment=NEW.environment WHERE o.plugin_slug=NEW.plugin_slug AND o.site_id=NEW.site_id AND o.cadence='lifetime' AND billing_order_is_paid(o)) THEN
   RAISE EXCEPTION 'This site already has a Pro purchase';
  END IF;
  IF EXISTS(SELECT 1 FROM billing_subscriptions s JOIN billing_customers c ON c.id=s.customer_id AND c.environment=NEW.environment WHERE s.plugin_slug=NEW.plugin_slug AND s.site_id=NEW.site_id AND s.status='active' AND s.current_period_end>now()) THEN
   IF EXISTS(SELECT 1 FROM billing_subscriptions s2 JOIN billing_customers c2 ON c2.id=s2.customer_id AND c2.environment=NEW.environment WHERE s2.plugin_slug=NEW.plugin_slug AND s2.site_id=NEW.site_id AND s2.status='active' AND s2.current_period_end>now() AND s2.cadence='yearly') THEN
    IF NEW.cadence<>'lifetime' THEN
     RAISE EXCEPTION 'This site already has a Pro purchase';
    END IF;
   ELSE
    IF NEW.cadence NOT IN ('yearly','lifetime') THEN
     RAISE EXCEPTION 'This site already has a Pro purchase';
    END IF;
   END IF;
  END IF;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS billing_checkout_site_purchase_guard ON billing_checkouts;
CREATE TRIGGER billing_checkout_site_purchase_guard BEFORE INSERT ON billing_checkouts FOR EACH ROW EXECUTE FUNCTION billing_guard_site_checkout();
CREATE OR REPLACE FUNCTION billing_apply_site_snapshot(p_customer uuid,p_started timestamptz,p_polar_id text,p_grants jsonb,p_orders jsonb,p_subscriptions jsonb,p_site_grants jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE item jsonb; applied boolean; env text;
BEGIN
 -- The original function locks the customer and rejects stale or foreign snapshots.
 SELECT billing_apply_snapshot(p_customer,p_started,p_polar_id,
  (SELECT COALESCE(jsonb_agg(value),'[]'::jsonb) FROM jsonb_array_elements(p_grants) WHERE value->>'plugin_slug' NOT IN ('whatsapp-commerce','telegram-commerce','frame-drop')),
  p_orders,p_subscriptions) INTO applied;
 IF NOT applied THEN RETURN false; END IF;
 SELECT environment INTO STRICT env FROM billing_customers WHERE id=p_customer;
 UPDATE billing_site_entitlements SET is_pro=false,verified_until=now(),updated_at=now() WHERE customer_id=p_customer;
 FOR item IN SELECT value FROM jsonb_array_elements(p_site_grants) LOOP
  IF item->>'plugin_slug' IS NULL OR item->>'plugin_slug' NOT IN ('whatsapp-commerce','telegram-commerce','frame-drop') THEN
   RAISE EXCEPTION 'Unknown site billing plugin';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM billing_checkouts WHERE customer_id=p_customer AND environment=env AND plugin_slug=item->>'plugin_slug' AND site_id=item->>'site_id' AND polar_checkout_id IS NOT NULL) THEN
   RAISE EXCEPTION 'Unknown checkout site';
  END IF;
  INSERT INTO billing_site_entitlements(customer_id,plugin_slug,site_id,is_pro,verified_until)
  VALUES(p_customer,item->>'plugin_slug',item->>'site_id',true,LEAST(now()+interval '1 hour',COALESCE((item->>'access_ends_at')::timestamptz,now()+interval '1 hour')))
  ON CONFLICT(customer_id,plugin_slug,site_id) DO UPDATE SET is_pro=true,verified_until=EXCLUDED.verified_until,updated_at=now();
 END LOOP;
 FOR item IN SELECT value FROM jsonb_array_elements(p_orders) LOOP
  UPDATE billing_orders SET site_id=item->>'site_id' WHERE environment=env AND customer_id=p_customer AND polar_order_id=item->>'id';
 END LOOP;
 FOR item IN SELECT value FROM jsonb_array_elements(p_subscriptions) LOOP
  UPDATE billing_subscriptions SET site_id=item->>'site_id' WHERE environment=env AND customer_id=p_customer AND polar_subscription_id=item->>'id';
 END LOOP;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION billing_site_access(uuid,text,text,text),billing_apply_site_snapshot(uuid,timestamptz,text,jsonb,jsonb,jsonb,jsonb),billing_lock_checkout_site() FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION billing_site_has_purchase(uuid,text),billing_site_has_purchase(uuid,text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION billing_guard_site_checkout() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION billing_site_has_purchase(uuid,text),billing_site_has_purchase(uuid,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION billing_site_access(uuid,text,text,text),billing_apply_site_snapshot(uuid,timestamptz,text,jsonb,jsonb,jsonb,jsonb) TO service_role;
-- Legacy account-wide display flags must not advertise a license on every site.
UPDATE plugin_entitlements SET is_pro=false,verified_until=now() WHERE plugin_slug='frame-drop';
UPDATE framer_users SET plan='free' WHERE plugin_slug='frame-drop';
-- A legacy shared fallback is not a real project; never let it unlock every installation.
UPDATE billing_site_entitlements SET is_pro=false,verified_until=now() WHERE plugin_slug='frame-drop' AND site_id='framedrop-project';
COMMIT;
