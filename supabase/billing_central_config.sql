-- Apply after billing.sql. Central ENV is the desired catalog; retired products remain in history.
CREATE OR REPLACE FUNCTION billing_configure_catalog(p_environment text,p_rows jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE item jsonb; n integer;
BEGIN
 IF p_environment NOT IN ('sandbox','production') OR jsonb_typeof(p_rows)<>'array' OR jsonb_array_length(p_rows)=0 THEN RAISE EXCEPTION 'Invalid catalog configuration'; END IF;
 PERFORM pg_advisory_xact_lock(hashtext('qubtic-billing-catalog:'||p_environment));
 -- An existing product/benefit may never be reassigned to a different plugin.
 FOR item IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
  IF item->>'cadence' NOT IN ('monthly','yearly','lifetime') OR item->>'plugin_slug' IS NULL THEN RAISE EXCEPTION 'Invalid plan'; END IF;
  IF EXISTS(SELECT 1 FROM billing_catalog WHERE environment=p_environment AND product_id=(item->>'product_id')::uuid AND (plugin_slug<>item->>'plugin_slug' OR cadence<>item->>'cadence')) THEN RAISE EXCEPTION 'Product reassignment is forbidden'; END IF;
  IF EXISTS(SELECT 1 FROM billing_catalog WHERE environment=p_environment AND benefit_id=(item->>'benefit_id')::uuid AND plugin_slug<>item->>'plugin_slug') THEN RAISE EXCEPTION 'Benefit reassignment is forbidden'; END IF;
 END LOOP;
 UPDATE billing_catalog SET enabled=false WHERE environment=p_environment;
 FOR item IN SELECT value FROM jsonb_array_elements(p_rows) LOOP
  INSERT INTO billing_catalog(plugin_slug,cadence,environment,product_id,benefit_id,enabled)
  VALUES(item->>'plugin_slug',item->>'cadence',p_environment,(item->>'product_id')::uuid,(item->>'benefit_id')::uuid,true)
  ON CONFLICT(environment,product_id) DO UPDATE SET benefit_id=EXCLUDED.benefit_id,enabled=true;
 END LOOP;
 SELECT count(*) INTO n FROM billing_catalog WHERE environment=p_environment AND enabled;
 RETURN n;
END $$;
REVOKE ALL ON FUNCTION billing_configure_catalog(text,jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION billing_configure_catalog(text,jsonb) TO service_role;
