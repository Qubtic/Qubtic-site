-- Central Qubtic billing. Apply shared auth migrations first; service role only.
BEGIN;
-- Shared account and pairing records are server-owned, including bearer credentials.

ALTER TABLE public.framer_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.framer_pairing_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Verify session by auth_token" ON public.framer_users;
DROP POLICY IF EXISTS "Allow anon insert/update via backend auth" ON public.framer_users;
DROP POLICY IF EXISTS "Allow pairing initiate" ON public.framer_pairing_sessions;
DROP POLICY IF EXISTS "Allow pairing poll by device_code" ON public.framer_pairing_sessions;
DROP POLICY IF EXISTS "Allow pairing confirm update" ON public.framer_pairing_sessions;
REVOKE ALL ON public.framer_users,public.framer_pairing_sessions FROM anon,authenticated;
GRANT ALL ON public.framer_users,public.framer_pairing_sessions TO service_role;


CREATE TABLE IF NOT EXISTS billing_customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), environment text NOT NULL CHECK(environment IN ('sandbox','production')),
 email text NOT NULL, polar_customer_id text, last_sync_started_at timestamptz, last_attempted_at timestamptz,
 UNIQUE(environment,email), UNIQUE(environment,polar_customer_id)
);
CREATE TABLE IF NOT EXISTS billing_memberships (
 user_id uuid NOT NULL REFERENCES framer_users(id) ON DELETE CASCADE, environment text NOT NULL,
 customer_id uuid NOT NULL REFERENCES billing_customers(id), plugin_slug text NOT NULL, PRIMARY KEY(user_id,environment)
);
CREATE TABLE IF NOT EXISTS billing_catalog (
 plugin_slug text NOT NULL, cadence text NOT NULL CHECK(cadence IN ('monthly','yearly','lifetime')),
 environment text NOT NULL CHECK(environment IN ('sandbox','production')),
 product_id uuid NOT NULL, benefit_id uuid NOT NULL, enabled boolean NOT NULL DEFAULT false,
 PRIMARY KEY(environment,product_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS billing_catalog_active_cadence ON billing_catalog(environment,plugin_slug,cadence) WHERE enabled;
CREATE TABLE IF NOT EXISTS billing_checkouts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES framer_users(id),
 customer_id uuid NOT NULL REFERENCES billing_customers(id), environment text NOT NULL,
 plugin_slug text NOT NULL, cadence text NOT NULL, product_id uuid NOT NULL,
 request_key uuid NOT NULL, polar_checkout_id text, checkout_url text, status text NOT NULL DEFAULT 'creating',
 created_at timestamptz NOT NULL DEFAULT now(), last_checked_at timestamptz, expires_at timestamptz NOT NULL DEFAULT now()+interval '10 minutes',
 UNIQUE(user_id,request_key)
);
CREATE UNIQUE INDEX IF NOT EXISTS billing_checkout_active ON billing_checkouts(user_id,environment) WHERE status IN ('creating','open');
CREATE TABLE IF NOT EXISTS billing_orders (
 environment text NOT NULL, polar_order_id text NOT NULL, customer_id uuid NOT NULL REFERENCES billing_customers(id),
 plugin_slug text NOT NULL, cadence text NOT NULL, product_id text NOT NULL, status text NOT NULL,
 amount bigint NOT NULL, refunded_amount bigint NOT NULL DEFAULT 0, currency text NOT NULL,
 purchased_at timestamptz NOT NULL, subscription_id text, PRIMARY KEY(environment,polar_order_id)
);
CREATE TABLE IF NOT EXISTS billing_subscriptions (
 environment text NOT NULL, polar_subscription_id text NOT NULL, customer_id uuid NOT NULL REFERENCES billing_customers(id),
 plugin_slug text NOT NULL, cadence text NOT NULL, status text NOT NULL,
 current_period_end timestamptz, cancel_at_period_end boolean NOT NULL DEFAULT false,
 PRIMARY KEY(environment,polar_subscription_id)
);
CREATE TABLE IF NOT EXISTS plugin_entitlements (
 customer_id uuid NOT NULL REFERENCES billing_customers(id), plugin_slug text NOT NULL,
 is_pro boolean NOT NULL DEFAULT false, verified_until timestamptz NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(customer_id,plugin_slug)
);
CREATE TABLE IF NOT EXISTS billing_webhook_events (
 environment text NOT NULL, event_id text NOT NULL, event_type text NOT NULL,
 payload jsonb NOT NULL, status text NOT NULL DEFAULT 'pending', attempts integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz, PRIMARY KEY(environment,event_id)
);
CREATE TABLE IF NOT EXISTS billing_rate_limits (bucket text PRIMARY KEY, count integer NOT NULL, resets_at timestamptz NOT NULL);
CREATE OR REPLACE FUNCTION billing_throttle(p_bucket text,p_limit integer,p_seconds integer) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE n integer;
BEGIN
 INSERT INTO billing_rate_limits VALUES(p_bucket,1,now()+make_interval(secs=>p_seconds))
 ON CONFLICT(bucket) DO UPDATE SET count=CASE WHEN billing_rate_limits.resets_at<now() THEN 1 ELSE billing_rate_limits.count+1 END,
 resets_at=CASE WHEN billing_rate_limits.resets_at<now() THEN now()+make_interval(secs=>p_seconds) ELSE billing_rate_limits.resets_at END RETURNING count INTO n;
 RETURN n<=p_limit;
END $$;
CREATE OR REPLACE FUNCTION billing_identity(p_user uuid,p_environment text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u framer_users; c uuid;
BEGIN
 SELECT * INTO STRICT u FROM framer_users WHERE id=p_user AND status='active' AND metadata->>'email_verified'='true';
 -- Only independently email-verified memberships share a billing identity.
 INSERT INTO billing_customers(environment,email) VALUES(p_environment,lower(trim(u.email)))
 ON CONFLICT(environment,email) DO UPDATE SET email=EXCLUDED.email RETURNING id INTO c;
 INSERT INTO billing_memberships(user_id,environment,customer_id,plugin_slug) VALUES(u.id,p_environment,c,u.plugin_slug)
 ON CONFLICT(user_id,environment) DO UPDATE SET customer_id=EXCLUDED.customer_id,plugin_slug=EXCLUDED.plugin_slug;
 RETURN c;
END $$;
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
  INSERT INTO billing_orders VALUES(c.environment,item->>'id',c.id,item->>'plugin_slug',item->>'cadence',item->>'product_id',item->>'status',
   (item->>'amount')::bigint,(item->>'refunded_amount')::bigint,item->>'currency',(item->>'created_at')::timestamptz,item->>'subscription_id')
  ON CONFLICT(environment,polar_order_id) DO UPDATE SET status=EXCLUDED.status,amount=EXCLUDED.amount,refunded_amount=EXCLUDED.refunded_amount;
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
CREATE OR REPLACE VIEW frame_drop_plugin_payments WITH(security_invoker=true) AS SELECT * FROM billing_orders WHERE plugin_slug='frame-drop';
CREATE OR REPLACE VIEW qube_auth_plugin_payments WITH(security_invoker=true) AS SELECT * FROM billing_orders WHERE plugin_slug='qube-auth';
CREATE OR REPLACE VIEW whatsapp_commerce_plugin_payments WITH(security_invoker=true) AS SELECT * FROM billing_orders WHERE plugin_slug='whatsapp-commerce';
DO $$ DECLARE t text; BEGIN
 FOREACH t IN ARRAY ARRAY['billing_customers','billing_memberships','billing_catalog','billing_checkouts','billing_orders','billing_subscriptions','plugin_entitlements','billing_webhook_events','billing_rate_limits'] LOOP
 EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY',t);
 EXECUTE format('REVOKE ALL ON %I FROM anon,authenticated',t);
 EXECUTE format('GRANT ALL ON %I TO service_role',t);
 EXECUTE format('DROP POLICY IF EXISTS billing_service_access ON %I',t);
 EXECUTE format('CREATE POLICY billing_service_access ON %I FOR ALL TO service_role USING(true) WITH CHECK(true)',t);
 END LOOP;
END $$;
REVOKE ALL ON frame_drop_plugin_payments,whatsapp_commerce_plugin_payments,qube_auth_plugin_payments FROM anon,authenticated;
GRANT SELECT ON frame_drop_plugin_payments,whatsapp_commerce_plugin_payments,qube_auth_plugin_payments TO service_role;
REVOKE ALL ON FUNCTION billing_identity(uuid,text),billing_throttle(text,integer,integer),billing_apply_snapshot(uuid,timestamptz,text,jsonb,jsonb,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION billing_identity(uuid,text),billing_throttle(text,integer,integer),billing_apply_snapshot(uuid,timestamptz,text,jsonb,jsonb,jsonb) TO service_role;
CREATE INDEX IF NOT EXISTS billing_orders_customer ON billing_orders(customer_id,purchased_at DESC);
CREATE INDEX IF NOT EXISTS billing_events_retry ON billing_webhook_events(status,created_at);
COMMIT;
-- Atomic one-time code verification across workers. Metadata stays server-only.
CREATE OR REPLACE FUNCTION auth_verify_code(p_email text,p_plugin text,p_code text,p_kind text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE u framer_users; prefix text; attempts integer; expiry numeric; expected text;
BEGIN
 IF p_kind NOT IN ('otp','reset') OR p_code !~ '^[0-9]{6}$' THEN RETURN false; END IF;
 SELECT * INTO u FROM framer_users WHERE email=lower(trim(p_email)) AND plugin_slug=p_plugin FOR UPDATE;
 IF NOT FOUND OR u.status IN ('suspended','inactive') THEN RETURN false; END IF;
 prefix=CASE WHEN p_kind='reset' THEN 'reset' ELSE 'otp' END;
 expected=u.metadata->>(prefix||'_code');expiry=(u.metadata->>(prefix||'_expires_at'))::numeric;
 attempts=COALESCE((u.metadata->>(prefix||'_attempts'))::integer,0)+1;
 IF expected IS NULL OR expiry IS NULL OR expiry<extract(epoch from now())*1000 OR attempts>5 THEN RETURN false; END IF;
 IF expected<>p_code THEN
 UPDATE framer_users SET metadata=jsonb_set(metadata,ARRAY[prefix||'_attempts'],to_jsonb(attempts)) WHERE id=u.id;
 RETURN false;
 END IF;
 UPDATE framer_users SET metadata=metadata-(prefix||'_code')-(prefix||'_expires_at')-(prefix||'_attempts') WHERE id=u.id;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION auth_verify_code(text,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION auth_verify_code(text,text,text,text) TO service_role;
