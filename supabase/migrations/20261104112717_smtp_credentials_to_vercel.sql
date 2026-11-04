BEGIN;
-- SMTP transport and sender credentials now live only in Vercel ENV.
-- Keep team preferences, and prevent old writes or undo snapshots restoring SMTP secrets.
CREATE FUNCTION public.sanitize_plugin_mail_preferences() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path=public AS $$
DECLARE preferences jsonb;
BEGIN
 IF TG_TABLE_NAME='plugin_control' THEN
  IF NEW.id<>'mail' THEN RETURN NEW; END IF;
  preferences:=NEW.settings;
  NEW.settings:=jsonb_build_object('teamEmail',preferences->'teamEmail','signup',preferences->'signup','signin',preferences->'signin','purchase',preferences->'purchase');
  NEW.secrets:='';
 ELSE
  IF NEW.config_id<>'mail' THEN RETURN NEW; END IF;
  preferences:=NEW.prior_settings;
  IF preferences IS NOT NULL THEN
   NEW.prior_settings:=jsonb_build_object('teamEmail',preferences->'teamEmail','signup',preferences->'signup','signin',preferences->'signin','purchase',preferences->'purchase');
  END IF;
  NEW.prior_secrets:=NULL;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.sanitize_plugin_mail_preferences() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.sanitize_plugin_mail_preferences() TO service_role;
CREATE TRIGGER plugin_mail_preferences_only BEFORE INSERT OR UPDATE ON public.plugin_control
FOR EACH ROW EXECUTE FUNCTION public.sanitize_plugin_mail_preferences();
CREATE TRIGGER plugin_mail_audit_preferences_only BEFORE INSERT OR UPDATE ON public.plugin_control_audit
FOR EACH ROW EXECUTE FUNCTION public.sanitize_plugin_mail_preferences();
UPDATE public.plugin_control SET secrets='',revision=revision+1,updated_at=now() WHERE id='mail';
UPDATE public.plugin_control_audit SET prior_secrets=NULL WHERE config_id='mail';
COMMIT;
