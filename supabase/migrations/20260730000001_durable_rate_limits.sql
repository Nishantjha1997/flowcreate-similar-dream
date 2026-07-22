-- Durable, cross-isolate rate limiting and atomic AI usage metering.
-- Client roles receive no table access; Edge Functions call the SECURITY
-- DEFINER RPCs with the service-role key.

BEGIN;

CREATE TABLE public.rate_limits (
  key TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0 CHECK (request_count >= 0),
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT rate_limits_key_valid CHECK (char_length(key) BETWEEN 1 AND 512)
);

CREATE INDEX idx_rate_limits_reset_at ON public.rate_limits(reset_at);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_rate_limit(
  p_key TEXT,
  p_max INTEGER,
  p_window_ms BIGINT
)
RETURNS TABLE(allowed BOOLEAN, remaining INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
BEGIN
  IF p_key IS NULL OR btrim(p_key) = '' OR char_length(p_key) > 512 THEN
    RAISE EXCEPTION 'Rate-limit key must contain 1 to 512 characters';
  END IF;
  IF p_max < 1 OR p_window_ms < 1 THEN
    RAISE EXCEPTION 'Rate-limit maximum and window must be positive';
  END IF;

  RETURN QUERY
  WITH consumed AS (
    INSERT INTO public.rate_limits AS limits (
      key,
      request_count,
      window_started_at,
      reset_at,
      updated_at
    )
    VALUES (
      p_key,
      1,
      v_now,
      v_now + (p_window_ms * interval '1 millisecond'),
      v_now
    )
    ON CONFLICT (key) DO UPDATE
    SET
      request_count = CASE
        WHEN limits.reset_at <= v_now THEN 1
        ELSE LEAST(limits.request_count + 1, p_max + 1)
      END,
      window_started_at = CASE
        WHEN limits.reset_at <= v_now THEN v_now
        ELSE limits.window_started_at
      END,
      reset_at = CASE
        WHEN limits.reset_at <= v_now THEN v_now + (p_window_ms * interval '1 millisecond')
        ELSE limits.reset_at
      END,
      updated_at = v_now
    RETURNING limits.request_count, limits.reset_at
  )
  SELECT
    consumed.request_count <= p_max,
    GREATEST(p_max - consumed.request_count, 0),
    consumed.reset_at
  FROM consumed;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_ai_usage(
  p_user_id UUID,
  p_max INTEGER
)
RETURNS TABLE(allowed BOOLEAN, usage_count INTEGER, reset_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_usage INTEGER;
  v_reset_at TIMESTAMPTZ;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'AI usage requires a user id';
  END IF;
  IF p_max < -1 OR p_max = 0 THEN
    RAISE EXCEPTION 'AI usage maximum must be -1 or a positive integer';
  END IF;

  INSERT INTO public.usage_limits (user_id, ai_requests, last_reset_at, updated_at)
  VALUES (p_user_id, 0, v_now, v_now)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT ai_requests, last_reset_at + interval '30 days'
  INTO v_usage, v_reset_at
  FROM public.usage_limits
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_reset_at <= v_now THEN
    v_usage := 0;
    v_reset_at := v_now + interval '30 days';
    UPDATE public.usage_limits
    SET ai_requests = 0, last_reset_at = v_now, updated_at = v_now
    WHERE user_id = p_user_id;
  END IF;

  IF p_max <> -1 AND v_usage >= p_max THEN
    RETURN QUERY SELECT false, v_usage, v_reset_at;
    RETURN;
  END IF;

  UPDATE public.usage_limits
  SET ai_requests = ai_requests + 1, updated_at = v_now
  WHERE user_id = p_user_id
  RETURNING ai_requests, last_reset_at + interval '30 days'
  INTO v_usage, v_reset_at;

  RETURN QUERY SELECT true, v_usage, v_reset_at;
END;
$$;

REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, BIGINT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_ai_usage(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, BIGINT) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_ai_usage(UUID, INTEGER) TO service_role;

COMMIT;
