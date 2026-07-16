-- Comprehensive RLS + schema fixes from Phase 11 audit

-- 1. Fix admin staff message policy: verify sender_id matches auth.uid()
DROP POLICY IF EXISTS "Admins can create staff messages" ON public.help_ticket_messages;
CREATE POLICY "Admins can create staff messages" ON public.help_ticket_messages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
    AND sender_id = auth.uid()
  );

-- 2. Add admin DELETE policy for help_tickets (currently missing)
CREATE POLICY "Admins can delete tickets" ON public.help_tickets
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 3. Add updated_at trigger for help_ticket_messages
ALTER TABLE public.help_ticket_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE OR REPLACE FUNCTION public.update_ticket_message_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ticket_messages_updated_at ON public.help_ticket_messages;
CREATE TRIGGER trg_ticket_messages_updated_at
  BEFORE UPDATE ON public.help_ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_ticket_message_updated_at();

-- 4. Fix blog_posts RLS: use consistent admin check pattern with is_admin() function
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
CREATE POLICY "Admins can manage all posts" ON public.blog_posts
  FOR ALL USING (public.is_admin())
  WITH CHECK (public.is_admin());
