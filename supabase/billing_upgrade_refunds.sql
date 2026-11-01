-- Apply after billing.sql / billing_sites.sql. Only NEW, explicitly bound upgrades qualify.
-- No backfill: historical Lifetime purchases must never generate automatic refunds.
BEGIN;
ALTER TABLE public.billing_checkouts
 ADD COLUMN IF NOT EXISTS previous_subscription_id text,
 ADD COLUMN IF NOT EXISTS upgrade_policy_version integer,
 ADD COLUMN IF NOT EXISTS upgrade_to text,
 ADD COLUMN IF NOT EXISTS upgrade_period_start timestamptz,
 ADD COLUMN IF NOT EXISTS upgrade_period_end timestamptz;

CREATE TABLE IF NOT EXISTS public.billing_upgrade_refunds (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 customer_id uuid NOT NULL REFERENCES public.billing_customers(id),
 environment text NOT NULL CHECK(environment IN ('sandbox','production')),
 subscription_id text NOT NULL,
 lifetime_order_id text NOT NULL,
 checkout_id uuid NOT NULL REFERENCES public.billing_checkouts(id),
 payload jsonb NOT NULL,
 phase text NOT NULL DEFAULT 'ready' CHECK(phase IN ('ready','creating','recovering','pending','accepted','done','manual_review')),
 attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 5),
 claim_token uuid, lease_until timestamptz, next_attempt_at timestamptz NOT NULL DEFAULT now(),
 provider_refund_id text, error text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(environment,subscription_id), UNIQUE(environment,lifetime_order_id)
);
-- Renewal cancellation is independent of every financial phase, including manual review.
ALTER TABLE public.billing_upgrade_refunds
 ADD COLUMN IF NOT EXISTS renewal_status text NOT NULL DEFAULT 'pending' CHECK(renewal_status IN ('pending','renewal_stopped','manual_review')),
 ADD COLUMN IF NOT EXISTS renewal_attempts integer NOT NULL DEFAULT 0 CHECK(renewal_attempts BETWEEN 0 AND 5),
 ADD COLUMN IF NOT EXISTS renewal_next_attempt_at timestamptz NOT NULL DEFAULT now(),
 ADD COLUMN IF NOT EXISTS renewal_stopped_at timestamptz,
 ADD COLUMN IF NOT EXISTS renewal_error text,
 ADD COLUMN IF NOT EXISTS reconciliation_required boolean NOT NULL DEFAULT false,
 ADD COLUMN IF NOT EXISTS reconciliation_reason text,
 ADD COLUMN IF NOT EXISTS refund_claimed boolean NOT NULL DEFAULT false,
 ADD COLUMN IF NOT EXISTS renewal_claimed boolean NOT NULL DEFAULT false;
ALTER TABLE public.billing_upgrade_refunds ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.billing_upgrade_refunds FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.billing_upgrade_refunds TO service_role;
DROP POLICY IF EXISTS billing_upgrade_refunds_service ON public.billing_upgrade_refunds;
CREATE POLICY billing_upgrade_refunds_service ON public.billing_upgrade_refunds TO service_role USING(true) WITH CHECK(true);
CREATE INDEX IF NOT EXISTS billing_upgrade_refunds_recovery ON public.billing_upgrade_refunds(customer_id,environment,next_attempt_at) WHERE phase NOT IN ('done','manual_review');
CREATE INDEX IF NOT EXISTS billing_upgrade_renewal_recovery ON public.billing_upgrade_refunds(customer_id,environment,renewal_next_attempt_at) WHERE renewal_status='pending' AND NOT reconciliation_required;

-- A customer lock serializes insertion/claims. Claim ONE job, with independent due flags
-- and independent failure budgets. Crashed workers consume their reserved budget slots.
CREATE OR REPLACE FUNCTION public.billing_claim_upgrade_refunds(p_customer uuid,p_environment text,p_candidates jsonb DEFAULT '[]')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE c billing_customers; candidate jsonb; job billing_upgrade_refunds; jobs jsonb='[]'; blocked integer=0; refund_due boolean; renewal_due boolean;
BEGIN
 SELECT * INTO STRICT c FROM billing_customers WHERE id=p_customer AND environment=p_environment FOR UPDATE;
 FOR candidate IN SELECT value FROM jsonb_array_elements(p_candidates) LOOP
  IF c.polar_customer_id IS NULL OR c.polar_customer_id IS DISTINCT FROM candidate->>'customer_id' THEN
   RAISE EXCEPTION 'Provider customer mismatch';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM billing_checkouts b WHERE b.id=(candidate->>'checkout_id')::uuid
   AND b.customer_id=c.id AND b.environment=c.environment AND b.upgrade_policy_version=1
   AND b.upgrade_to='lifetime' AND b.cadence='lifetime'
   AND b.previous_subscription_id=candidate->>'subscription_id'
   AND b.plugin_slug=candidate->>'plugin_slug' AND b.polar_checkout_id=candidate->>'polar_checkout_id'
   AND b.product_id::text=candidate->>'lifetime_product_id'
   AND (b.plugin_slug NOT IN ('whatsapp-commerce','telegram-commerce') OR
    (NULLIF(to_jsonb(b)->>'site_id','') IS NOT NULL AND to_jsonb(b)->>'site_id'=candidate->>'site_id'))
   -- Keep the ORIGINAL server-saved period immutable. A checkout has no provider expiry:
   -- payment outside this interval is allowed ONLY as financial manual review, not a guessed rollover.
   AND b.upgrade_period_start IS NOT DISTINCT FROM (candidate->>'period_start')::timestamptz
   AND b.upgrade_period_end IS NOT DISTINCT FROM (candidate->>'period_end')::timestamptz
   AND (COALESCE(b.upgrade_period_start<=(candidate->>'purchased_at')::timestamptz
    AND (candidate->>'purchased_at')::timestamptz<b.upgrade_period_end,false)
    OR NULLIF(candidate->>'review_reason','') IS NOT NULL)
   AND b.created_at<=(candidate->>'purchased_at')::timestamptz)
  THEN RAISE EXCEPTION 'Invalid server upgrade binding'; END IF;
  INSERT INTO billing_upgrade_refunds(customer_id,environment,subscription_id,lifetime_order_id,checkout_id,payload,phase,error)
   VALUES(c.id,c.environment,candidate->>'subscription_id',candidate->>'lifetime_order_id',(candidate->>'checkout_id')::uuid,candidate,
    CASE WHEN NULLIF(candidate->>'review_reason','') IS NOT NULL THEN 'manual_review' ELSE 'ready' END,candidate->>'review_reason')
   ON CONFLICT DO NOTHING;
 END LOOP;
 FOR job IN SELECT * FROM billing_upgrade_refunds WHERE customer_id=c.id AND environment=c.environment
  AND NOT reconciliation_required AND (phase NOT IN ('done','manual_review') OR renewal_status='pending')
  ORDER BY LEAST(next_attempt_at,renewal_next_attempt_at),created_at,id FOR UPDATE LOOP
  IF job.lease_until>now() THEN blocked=blocked+1; CONTINUE; END IF;
  IF job.attempts>=5 AND job.phase NOT IN ('done','manual_review') THEN
   UPDATE billing_upgrade_refunds SET phase='manual_review',error='Refund retry limit exhausted',updated_at=now() WHERE id=job.id RETURNING * INTO job;
  END IF;
  IF job.renewal_attempts>=5 AND job.renewal_status='pending' THEN
   UPDATE billing_upgrade_refunds SET renewal_status='manual_review',renewal_error='Cancellation retry limit exhausted',updated_at=now() WHERE id=job.id RETURNING * INTO job;
  END IF;
  refund_due=job.phase NOT IN ('done','manual_review') AND job.next_attempt_at<=now();
  renewal_due=job.renewal_status='pending' AND job.renewal_next_attempt_at<=now();
  IF NOT refund_due AND NOT renewal_due THEN
   IF job.phase NOT IN ('done','manual_review') OR job.renewal_status='pending' THEN blocked=blocked+1; END IF;
   CONTINUE;
  END IF;
  IF jsonb_array_length(jobs)>=1 THEN blocked=blocked+1; CONTINUE; END IF;
  UPDATE billing_upgrade_refunds SET phase=CASE WHEN phase='creating' THEN 'recovering' ELSE phase END,
   claim_token=gen_random_uuid(),lease_until=now()+interval '2 minutes',
   refund_claimed=refund_due,renewal_claimed=renewal_due,
   attempts=attempts+CASE WHEN refund_due THEN 1 ELSE 0 END,
   renewal_attempts=renewal_attempts+CASE WHEN renewal_due THEN 1 ELSE 0 END,updated_at=now()
   WHERE id=job.id RETURNING * INTO job;
  jobs=jobs||jsonb_build_array(to_jsonb(job));
 END LOOP;
 RETURN jsonb_build_object('jobs',jobs,'blocked',blocked,'manual_review',
  COALESCE((SELECT jsonb_agg(id) FROM billing_upgrade_refunds WHERE customer_id=c.id AND environment=c.environment
   AND (phase='manual_review' OR renewal_status='manual_review' OR reconciliation_required)),'[]'::jsonb));
END $$;

-- A shared fenced lease protects both independently persisted sub-workflows.
CREATE OR REPLACE FUNCTION public.billing_finish_upgrade_refund(p_id uuid,p_token uuid,p_phase text,p_patch jsonb DEFAULT '{}',p_release boolean DEFAULT true)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE job billing_upgrade_refunds; observed boolean=COALESCE((p_patch->>'settlement_observed')::boolean,false);
BEGIN
 SELECT * INTO job FROM billing_upgrade_refunds WHERE id=p_id AND claim_token=p_token AND lease_until>now() FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;
 IF NOT ((job.phase='ready' AND p_phase IN ('creating','done','manual_review'))
  OR (job.phase IN ('creating','recovering','pending') AND p_phase IN ('recovering','pending','accepted','manual_review'))
  OR (job.phase='accepted' AND p_phase IN ('accepted','done','manual_review'))
  OR job.phase=p_phase) THEN RAISE EXCEPTION 'Invalid refund transition'; END IF;
 IF observed AND (p_phase<>'pending' OR NOT job.refund_claimed OR NULLIF(p_patch->>'provider_refund_id','') IS NULL) THEN
  RAISE EXCEPTION 'Invalid pending settlement observation';
 END IF;
 IF job.provider_refund_id IS NOT NULL AND p_patch->>'provider_refund_id' IS NOT NULL
  AND job.provider_refund_id IS DISTINCT FROM p_patch->>'provider_refund_id' THEN
  RAISE EXCEPTION 'Provider refund identity changed';
 END IF;
 IF p_patch ? 'renewal_status' AND (NOT job.renewal_claimed OR job.renewal_status<>'pending') THEN
  RAISE EXCEPTION 'Cancellation not claimed';
 END IF;
 UPDATE billing_upgrade_refunds SET phase=p_phase,
  attempts=CASE WHEN observed THEN greatest(attempts-1,0) ELSE attempts END,
  refund_claimed=CASE WHEN p_release OR observed THEN false ELSE refund_claimed END,
  renewal_claimed=CASE WHEN p_release THEN false ELSE renewal_claimed END,
  payload=payload||COALESCE(p_patch->'payload','{}'::jsonb),
  provider_refund_id=COALESCE(p_patch->>'provider_refund_id',provider_refund_id),
  error=CASE WHEN p_patch ? 'error' THEN p_patch->>'error' ELSE error END,
  renewal_status=COALESCE(p_patch->>'renewal_status',renewal_status),
  renewal_error=CASE WHEN p_patch ? 'renewal_error' THEN p_patch->>'renewal_error' ELSE renewal_error END,
  renewal_stopped_at=CASE WHEN p_patch->>'renewal_status'='renewal_stopped' THEN now() ELSE renewal_stopped_at END,
  renewal_next_attempt_at=CASE WHEN p_patch ? 'renewal_status' THEN now()+interval '30 seconds' ELSE renewal_next_attempt_at END,
  reconciliation_required=reconciliation_required OR COALESCE((p_patch->>'reconciliation_required')::boolean,false),
  reconciliation_reason=COALESCE(p_patch->>'reconciliation_reason',reconciliation_reason),
  updated_at=now(),claim_token=CASE WHEN p_release THEN NULL ELSE claim_token END,
  lease_until=CASE WHEN p_release THEN NULL ELSE lease_until END,
  next_attempt_at=CASE WHEN observed THEN now()+interval '15 minutes'
   WHEN p_release AND refund_claimed THEN now()+CASE WHEN p_phase='pending' THEN interval '15 minutes' ELSE interval '30 seconds' END
   ELSE next_attempt_at END
 WHERE id=job.id;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.billing_claim_upgrade_refunds(uuid,text,jsonb),public.billing_finish_upgrade_refund(uuid,uuid,text,jsonb,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.billing_claim_upgrade_refunds(uuid,text,jsonb),public.billing_finish_upgrade_refund(uuid,uuid,text,jsonb,boolean) TO service_role;
COMMIT;
