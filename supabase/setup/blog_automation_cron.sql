-- FlowCreate blog automation dispatcher
-- Run this AFTER creating these two Supabase Vault secrets:
--   flowcreate_project_url  = https://<project-ref>.supabase.co
--   blog_scheduler_secret   = same value as the BLOG_SCHEDULER_SECRET
--                              Edge Function secret
-- No secret value is stored in this file or in cron.job.

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

DO $setup$
DECLARE
  existing_job_id bigint;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets WHERE name = 'flowcreate_project_url'
  ) OR NOT EXISTS (
    SELECT 1 FROM vault.decrypted_secrets WHERE name = 'blog_scheduler_secret'
  ) THEN
    RAISE EXCEPTION
      'Create Vault secrets flowcreate_project_url and blog_scheduler_secret before installing this cron job.';
  END IF;

  SELECT jobid
    INTO existing_job_id
    FROM cron.job
   WHERE jobname = 'flowcreate-blog-scheduler'
   LIMIT 1;

  IF existing_job_id IS NOT NULL THEN
    PERFORM cron.unschedule(existing_job_id);
  END IF;

  PERFORM cron.schedule(
    'flowcreate-blog-scheduler',
    '*/5 * * * *',
    $cron$
      SELECT net.http_post(
        url := (
          SELECT decrypted_secret
          FROM vault.decrypted_secrets
          WHERE name = 'flowcreate_project_url'
        ) || '/functions/v1/blog-scheduler',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-blog-scheduler-secret', (
            SELECT decrypted_secret
            FROM vault.decrypted_secrets
            WHERE name = 'blog_scheduler_secret'
          )
        ),
        body := '{"action":"tick"}'::jsonb
      );
    $cron$
  );
END
$setup$;

-- Verify:
-- SELECT jobid, jobname, schedule, active FROM cron.job
-- WHERE jobname = 'flowcreate-blog-scheduler';
