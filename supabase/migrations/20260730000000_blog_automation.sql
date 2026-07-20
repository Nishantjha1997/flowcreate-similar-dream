-- FlowCreate AI blog automation
--
-- The database owns scheduling through next_run_at. Workers atomically claim due
-- schedules with FOR UPDATE SKIP LOCKED, so overlapping cron invocations cannot
-- generate the same scheduled article twice.

BEGIN;

CREATE TABLE public.blog_automation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'weekly'
    CHECK (frequency IN ('daily', 'weekdays', 'weekly', 'biweekly', 'monthly')),
  publish_mode TEXT NOT NULL DEFAULT 'draft'
    CHECK (publish_mode IN ('draft', 'published')),
  category TEXT NOT NULL DEFAULT 'Resume Tips'
    CHECK (category IN ('Resume Tips', 'Career Advice', 'Job Search', 'Interview Tips', 'Industry Insights')),
  topic_prompt TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  author TEXT NOT NULL DEFAULT 'FlowCreate Team',
  time_zone TEXT NOT NULL DEFAULT 'UTC',
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  consecutive_failures INTEGER NOT NULL DEFAULT 0
    CHECK (consecutive_failures BETWEEN 0 AND 1000),
  max_failures SMALLINT NOT NULL DEFAULT 3
    CHECK (max_failures BETWEEN 1 AND 20),
  last_error TEXT,
  created_by UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT blog_automation_schedule_name_valid
    CHECK (name = btrim(name) AND char_length(name) BETWEEN 1 AND 120),
  CONSTRAINT blog_automation_topic_prompt_valid
    CHECK (topic_prompt = btrim(topic_prompt) AND char_length(topic_prompt) BETWEEN 5 AND 4000),
  CONSTRAINT blog_automation_author_valid
    CHECK (author = btrim(author) AND char_length(author) BETWEEN 1 AND 120),
  CONSTRAINT blog_automation_time_zone_valid
    CHECK (time_zone = btrim(time_zone) AND char_length(time_zone) BETWEEN 1 AND 100),
  CONSTRAINT blog_automation_keywords_limit CHECK (cardinality(keywords) <= 20),
  CONSTRAINT blog_automation_last_error_limit
    CHECK (last_error IS NULL OR char_length(last_error) <= 1000)
);

CREATE TABLE public.blog_automation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.blog_automation_schedules(id) ON DELETE SET NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'skipped')),
  trigger_source TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (trigger_source IN ('scheduled', 'manual')),
  attempt_count SMALLINT NOT NULL DEFAULT 0
    CHECK (attempt_count BETWEEN 0 AND 20),
  provider TEXT CHECK (provider IS NULL OR provider IN ('gemini', 'deepseek', 'openai')),
  generated_title TEXT,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  error_code TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT blog_automation_run_once UNIQUE (schedule_id, scheduled_for),
  CONSTRAINT blog_automation_generated_title_limit
    CHECK (generated_title IS NULL OR char_length(generated_title) <= 240),
  CONSTRAINT blog_automation_error_code_limit
    CHECK (error_code IS NULL OR char_length(error_code) <= 80),
  CONSTRAINT blog_automation_error_message_limit
    CHECK (error_message IS NULL OR char_length(error_message) <= 1000),
  CONSTRAINT blog_automation_run_timestamps_valid
    CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at)
);

CREATE INDEX idx_blog_automation_schedules_due
  ON public.blog_automation_schedules(next_run_at, id)
  WHERE is_enabled = true;

CREATE INDEX idx_blog_automation_schedules_created_by
  ON public.blog_automation_schedules(created_by)
  WHERE created_by IS NOT NULL;

CREATE INDEX idx_blog_automation_runs_schedule_created
  ON public.blog_automation_runs(schedule_id, created_at DESC);

CREATE INDEX idx_blog_automation_runs_status_created
  ON public.blog_automation_runs(status, created_at DESC);

CREATE UNIQUE INDEX idx_blog_automation_one_active_run_per_schedule
  ON public.blog_automation_runs(schedule_id)
  WHERE schedule_id IS NOT NULL AND status IN ('queued', 'running');

CREATE INDEX idx_blog_automation_runs_blog_post
  ON public.blog_automation_runs(blog_post_id)
  WHERE blog_post_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.validate_blog_automation_time_zone()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = NEW.time_zone) THEN
    RAISE EXCEPTION 'Unsupported blog automation time zone'
      USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_blog_automation_schedule_time_zone
  BEFORE INSERT OR UPDATE OF time_zone ON public.blog_automation_schedules
  FOR EACH ROW EXECUTE FUNCTION public.validate_blog_automation_time_zone();

DROP TRIGGER IF EXISTS update_blog_automation_schedules_updated_at
  ON public.blog_automation_schedules;
CREATE TRIGGER update_blog_automation_schedules_updated_at
  BEFORE UPDATE ON public.blog_automation_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_automation_runs_updated_at
  ON public.blog_automation_runs;
CREATE TRIGGER update_blog_automation_runs_updated_at
  BEFORE UPDATE ON public.blog_automation_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.blog_automation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_automation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY blog_automation_schedules_admin_all
  ON public.blog_automation_schedules
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY blog_automation_runs_admin_select
  ON public.blog_automation_runs
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

REVOKE ALL ON public.blog_automation_schedules FROM anon;
REVOKE ALL ON public.blog_automation_runs FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_automation_schedules TO authenticated;
GRANT SELECT ON public.blog_automation_runs TO authenticated;
GRANT ALL ON public.blog_automation_schedules TO service_role;
GRANT ALL ON public.blog_automation_runs TO service_role;

-- Advance one frequency interval at a time until the result is in the future.
-- This intentionally skips missed periods after downtime instead of publishing a
-- burst of stale articles. next_run_at remains the sole scheduling authority.
CREATE OR REPLACE FUNCTION public.next_blog_automation_run(
  p_current TIMESTAMPTZ,
  p_frequency TEXT,
  p_now TIMESTAMPTZ DEFAULT now(),
  p_time_zone TEXT DEFAULT 'UTC'
)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_next TIMESTAMPTZ := p_current;
  v_next_local TIMESTAMP;
  v_guard INTEGER := 0;
BEGIN
  IF p_current IS NULL OR p_now IS NULL THEN
    RAISE EXCEPTION 'Schedule timestamps are required';
  END IF;

  IF p_frequency NOT IN ('daily', 'weekdays', 'weekly', 'biweekly', 'monthly') THEN
    RAISE EXCEPTION 'Unsupported blog automation frequency';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = p_time_zone) THEN
    RAISE EXCEPTION 'Unsupported blog automation time zone';
  END IF;

  v_next_local := p_current AT TIME ZONE p_time_zone;

  LOOP
    CASE p_frequency
      WHEN 'daily' THEN
        v_next_local := v_next_local + INTERVAL '1 day';
      WHEN 'weekdays' THEN
        v_next_local := v_next_local + INTERVAL '1 day';
        WHILE EXTRACT(ISODOW FROM v_next_local) IN (6, 7) LOOP
          v_next_local := v_next_local + INTERVAL '1 day';
        END LOOP;
      WHEN 'weekly' THEN
        v_next_local := v_next_local + INTERVAL '7 days';
      WHEN 'biweekly' THEN
        v_next_local := v_next_local + INTERVAL '14 days';
      WHEN 'monthly' THEN
        v_next_local := v_next_local + INTERVAL '1 month';
    END CASE;

    v_next := v_next_local AT TIME ZONE p_time_zone;

    EXIT WHEN v_next > p_now;

    v_guard := v_guard + 1;
    IF v_guard > 4000 THEN
      RAISE EXCEPTION 'Unable to advance blog automation schedule';
    END IF;
  END LOOP;

  RETURN v_next;
END;
$$;

-- Atomically claim at most three due schedules. Row locks prevent overlapping
-- workers from claiming the same schedule, and the unique constraint is a
-- second idempotency barrier.
CREATE OR REPLACE FUNCTION public.claim_due_blog_automation_runs(p_limit INTEGER DEFAULT 3)
RETURNS TABLE (
  run_id UUID,
  schedule_id UUID,
  scheduled_for TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_limit INTEGER := LEAST(GREATEST(COALESCE(p_limit, 3), 1), 3);
  v_now TIMESTAMPTZ := clock_timestamp();
  v_stale_run_id UUID;
BEGIN
  -- Recover invocations that died after claiming work. This releases the
  -- active-run guard and counts the failure exactly once.
  FOR v_stale_run_id IN
    SELECT r.id
    FROM public.blog_automation_runs AS r
    WHERE r.status = 'running'
      AND r.started_at < v_now - INTERVAL '20 minutes'
    ORDER BY r.started_at
    FOR UPDATE SKIP LOCKED
    LIMIT 20
  LOOP
    PERFORM public.fail_blog_automation_run(
      v_stale_run_id,
      'worker_timeout',
      'The blog worker stopped before completing this run'
    );
  END LOOP;

  RETURN QUERY
  WITH due AS MATERIALIZED (
    SELECT s.id, s.next_run_at
    FROM public.blog_automation_schedules AS s
    WHERE s.is_enabled = true
      AND s.next_run_at <= v_now
      AND s.consecutive_failures < s.max_failures
    ORDER BY s.next_run_at, s.id
    FOR UPDATE SKIP LOCKED
    LIMIT v_limit
  ),
  inserted AS (
    INSERT INTO public.blog_automation_runs (
      schedule_id,
      scheduled_for,
      status,
      attempt_count,
      started_at
    )
    SELECT d.id, d.next_run_at, 'running', 1, v_now
    FROM due AS d
    ON CONFLICT DO NOTHING
    RETURNING id, blog_automation_runs.schedule_id, blog_automation_runs.scheduled_for
  ),
  advanced AS (
    UPDATE public.blog_automation_schedules AS s
    SET last_run_at = v_now,
        next_run_at = public.next_blog_automation_run(i.scheduled_for, s.frequency, v_now, s.time_zone),
        updated_at = v_now
    FROM inserted AS i
    WHERE s.id = i.schedule_id
    RETURNING s.id
  )
  SELECT i.id, i.schedule_id, i.scheduled_for
  FROM inserted AS i
  INNER JOIN advanced AS a ON a.id = i.schedule_id;
END;
$$;

-- Idempotent completion helpers keep run state and failure counters in one
-- transaction. A failed run can increment its schedule only once.
CREATE OR REPLACE FUNCTION public.complete_blog_automation_run(
  p_run_id UUID,
  p_blog_post_id UUID,
  p_provider TEXT,
  p_generated_title TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_schedule_id UUID;
  v_now TIMESTAMPTZ := clock_timestamp();
BEGIN
  IF p_provider NOT IN ('gemini', 'deepseek', 'openai') THEN
    RAISE EXCEPTION 'Unsupported AI provider';
  END IF;

  UPDATE public.blog_automation_runs
  SET status = 'succeeded',
      provider = p_provider,
      generated_title = left(p_generated_title, 240),
      blog_post_id = p_blog_post_id,
      error_code = NULL,
      error_message = NULL,
      completed_at = v_now,
      updated_at = v_now
  WHERE id = p_run_id
    AND status IN ('queued', 'running')
  RETURNING schedule_id INTO v_schedule_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_schedule_id IS NOT NULL THEN
    UPDATE public.blog_automation_schedules
    SET consecutive_failures = 0,
        last_success_at = v_now,
        last_error = NULL,
        updated_at = v_now
    WHERE id = v_schedule_id;
  END IF;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.fail_blog_automation_run(
  p_run_id UUID,
  p_error_code TEXT,
  p_error_message TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_schedule_id UUID;
  v_now TIMESTAMPTZ := clock_timestamp();
BEGIN
  UPDATE public.blog_automation_runs
  SET status = 'failed',
      error_code = left(COALESCE(NULLIF(btrim(p_error_code), ''), 'generation_failed'), 80),
      error_message = left(COALESCE(NULLIF(btrim(p_error_message), ''), 'Article generation failed'), 1000),
      completed_at = v_now,
      updated_at = v_now
  WHERE id = p_run_id
    AND status IN ('queued', 'running')
  RETURNING schedule_id INTO v_schedule_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_schedule_id IS NOT NULL THEN
    UPDATE public.blog_automation_schedules
    SET consecutive_failures = consecutive_failures + 1,
        is_enabled = CASE
          WHEN consecutive_failures + 1 >= max_failures THEN false
          ELSE is_enabled
        END,
        last_error = left(COALESCE(NULLIF(btrim(p_error_message), ''), 'Article generation failed'), 1000),
        updated_at = v_now
    WHERE id = v_schedule_id;
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.next_blog_automation_run(TIMESTAMPTZ, TEXT, TIMESTAMPTZ, TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.validate_blog_automation_time_zone()
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_due_blog_automation_runs(INTEGER)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.complete_blog_automation_run(UUID, UUID, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.fail_blog_automation_run(UUID, TEXT, TEXT)
  FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.next_blog_automation_run(TIMESTAMPTZ, TEXT, TIMESTAMPTZ, TEXT)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_due_blog_automation_runs(INTEGER)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.complete_blog_automation_run(UUID, UUID, TEXT, TEXT)
  TO service_role;
GRANT EXECUTE ON FUNCTION public.fail_blog_automation_run(UUID, TEXT, TEXT)
  TO service_role;

COMMENT ON TABLE public.blog_automation_schedules IS
  'Admin-owned AI blog schedules. next_run_at is the authoritative next execution time.';
COMMENT ON TABLE public.blog_automation_runs IS
  'Idempotent execution ledger for scheduled and manual AI blog generation.';
COMMENT ON FUNCTION public.claim_due_blog_automation_runs(INTEGER) IS
  'Service-role worker claim: locks due schedules, creates unique run rows, and advances next_run_at.';

COMMIT;
