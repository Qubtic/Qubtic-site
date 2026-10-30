-- Apply after billing.sql to store Polar-confirmed discount amounts on each order.
BEGIN;
ALTER TABLE public.billing_orders ADD COLUMN IF NOT EXISTS subtotal_amount bigint;
ALTER TABLE public.billing_orders ADD COLUMN IF NOT EXISTS discount_amount bigint NOT NULL DEFAULT 0;
ALTER TABLE public.billing_orders ADD COLUMN IF NOT EXISTS discount_id text;
UPDATE public.billing_orders SET subtotal_amount=amount WHERE subtotal_amount IS NULL;
ALTER TABLE public.billing_orders ALTER COLUMN subtotal_amount SET NOT NULL;
CREATE OR REPLACE VIEW frame_drop_plugin_payments WITH(security_invoker=true) AS SELECT * FROM billing_orders WHERE plugin_slug='frame-drop';
CREATE OR REPLACE VIEW qube_auth_plugin_payments WITH(security_invoker=true) AS SELECT * FROM billing_orders WHERE plugin_slug='qube-auth';
CREATE OR REPLACE VIEW whatsapp_commerce_plugin_payments WITH(security_invoker=true) AS SELECT * FROM billing_orders WHERE plugin_slug='whatsapp-commerce';
CREATE OR REPLACE FUNCTION billing_apply_snapshot(p_customer uuid,p_started timestamptz,p_polar_id text,p_grants jsonb,p_orders jsonb,p_subscriptions jsonb)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c billing_customers; item jsonb;
BEGIN
 SELECT * INTO STRICT c FROM billing_customers WHERE id=p_customer FOR UPDATE;
 IF c.last_sync_started_at IS NOT NULL AND c.last_sync_started_at>=p_started THEN RETURN false; END IF;
 IF c.polar_customer_id IS NOT NULL AND c.polar_customer_id<>p_polar_id THEN RAISE EXCEPTION 'Customer mismatch'; END IF;
 UPDATE billing_customers SET polar_customer_id=p_polar_id,last_sync_started_at=p_started WHERE id=c.id;
 UPDATE plugin_entitlements SET is_pro=false,verified_until=now()+interval '1 hour',updated_at=now() WHERE customer_id=c.id;
 FOR item IN SELECT value FROM jsonb_array_elements(p_grants) LOOP
  IF NOT EXISTS(SELECT 1 FROM billing_catalog WHERE environment=c.environment AND plugin_slug=item->>'plugin_slug') THEN RAISE EXCEPTION 'Unknown plugin'; END IF;
  INSERT INTO plugin_entitlements VALUES(c.id,item->>'plugin_slug',true,LEAST(now()+interval '1 hour',COALESCE((item->>'access_ends_at')::timestamptz,now()+interval '1 hour')),now())
  ON CONFLICT(customer_id,plugin_slug) DO UPDATE SET is_pro=true,verified_until=EXCLUDED.verified_until,updated_at=now();
 END LOOP;
 FOR item IN SELECT value FROM jsonb_array_elements(p_orders) LOOP
  INSERT INTO billing_orders(environment,polar_order_id,customer_id,plugin_slug,cadence,product_id,status,amount,refunded_amount,currency,purchased_at,subscription_id,subtotal_amount,discount_amount,discount_id) VALUES(c.environment,item->>'id',c.id,item->>'plugin_slug',item->>'cadence',item->>'product_id',item->>'status',
   (item->>'amount')::bigint,(item->>'refunded_amount')::bigint,item->>'currency',(item->>'created_at')::timestamptz,item->>'subscription_id',
   COALESCE((item->>'subtotal_amount')::bigint,(item->>'amount')::bigint),COALESCE((item->>'discount_amount')::bigint,0),item->>'discount_id')
  ON CONFLICT(environment,polar_order_id) DO UPDATE SET status=EXCLUDED.status,amount=EXCLUDED.amount,refunded_amount=EXCLUDED.refunded_amount,subtotal_amount=EXCLUDED.subtotal_amount,discount_amount=EXCLUDED.discount_amount,discount_id=EXCLUDED.discount_id;
  UPDATE billing_checkouts SET status='succeeded' WHERE environment=c.environment AND polar_checkout_id=item->>'checkout_id' AND item->>'status' IN ('paid','refunded','partially_refunded');
 END LOOP;
 DELETE FROM billing_subscriptions WHERE customer_id=c.id;
 FOR item IN SELECT value FROM jsonb_array_elements(p_subscriptions) LOOP
  INSERT INTO billing_subscriptions VALUES(c.environment,item->>'id',c.id,item->>'plugin_slug',item->>'cadence',item->>'status',
   (item->>'current_period_end')::timestamptz,(item->>'cancel_at_period_end')::boolean);
 END LOOP;
 -- Compatibility display projection only: APIs still authorize against plugin_entitlements.
 UPDATE framer_users u SET plan=CASE WHEN e.is_pro AND e.verified_until>now() THEN 'pro' ELSE 'free' END
 FROM billing_memberships m LEFT JOIN plugin_entitlements e ON e.customer_id=m.customer_id AND e.plugin_slug=m.plugin_slug
 WHERE m.customer_id=c.id AND m.environment=c.environment AND m.user_id=u.id;
 RETURN true;
END $$;
COMMIT;
