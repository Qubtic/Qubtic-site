-- Apply after billing_discounts.sql, billing_telegram_sites.sql and billing_environments.sql.
-- Repeatable; replaces only payment predicates/guards, never historical site assignments.
-- Do not reapply older billing migrations afterwards; they restore the old predicates.
BEGIN;
CREATE OR REPLACE FUNCTION billing_order_is_paid(o billing_orders) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path=public AS $$
 SELECT COALESCE(
  (o.status IN ('paid','partially_refunded') AND o.amount>o.refunded_amount)
  OR (o.status='paid' AND o.amount=0 AND o.refunded_amount=0
      AND o.subtotal_amount>0 AND o.discount_amount=o.subtotal_amount AND o.discount_id IS NOT NULL),
  false);
$$;
REVOKE ALL ON FUNCTION billing_order_is_paid(billing_orders) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION billing_order_is_paid(billing_orders) TO service_role;

CREATE OR REPLACE FUNCTION billing_site_has_purchase(p_customer uuid,p_site text,p_plugin text) RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE env text;
BEGIN
 SELECT environment INTO env FROM billing_customers WHERE id=p_customer;
 IF env IS NULL OR p_site IS NULL OR p_site='' OR p_plugin IS NULL OR p_plugin NOT IN ('whatsapp-commerce','telegram-commerce') THEN RETURN false; END IF;
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
CREATE OR REPLACE FUNCTION billing_site_has_purchase(p_customer uuid,p_site text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT billing_site_has_purchase(p_customer,p_site,'whatsapp-commerce');
$$;
CREATE OR REPLACE FUNCTION billing_guard_site_checkout() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.plugin_slug IN ('whatsapp-commerce','telegram-commerce') AND NEW.site_id IS NOT NULL THEN
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
REVOKE ALL ON FUNCTION billing_site_has_purchase(uuid,text),billing_site_has_purchase(uuid,text,text),billing_guard_site_checkout() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION billing_site_has_purchase(uuid,text),billing_site_has_purchase(uuid,text,text) TO service_role;
COMMIT;
