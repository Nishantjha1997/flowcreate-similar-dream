-- Add trigger for job applications to notify job creator

CREATE OR REPLACE FUNCTION public.notify_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_title TEXT;
  v_created_by UUID;
BEGIN
  -- Get the job details
  SELECT title, created_by INTO v_job_title, v_created_by
  FROM public.jobs
  WHERE id = NEW.job_id;

  -- Insert notification for the job creator
  IF v_created_by IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      body,
      action_url
    ) VALUES (
      v_created_by,
      'application_submitted',
      'New application',
      NEW.candidate_name || ' applied for ' || v_job_title,
      '/ats/applications/' || NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_job_application_created ON public.job_applications;
CREATE TRIGGER on_job_application_created
  AFTER INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_application();
