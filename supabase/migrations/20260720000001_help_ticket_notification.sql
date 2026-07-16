-- ═══════════════════════════════════════════════════════════════
-- HELP TICKET NOTIFICATION TRIGGER
-- Notifies admins when a new help ticket is created
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.notify_new_help_ticket()
RETURNS TRIGGER AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Insert a notification for each admin user
  FOR admin_record IN
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, metadata, action_url)
    VALUES (
      admin_record.user_id,
      'help_ticket',
      'New Support Ticket',
      'Subject: ' || NEW.subject || ' (Priority: ' || NEW.priority || ')',
      jsonb_build_object('ticket_id', NEW.id, 'category', NEW.category, 'priority', NEW.priority),
      '/admin'
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_new_help_ticket ON public.help_tickets;
CREATE TRIGGER trg_notify_new_help_ticket
  AFTER INSERT ON public.help_tickets
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_help_ticket();
