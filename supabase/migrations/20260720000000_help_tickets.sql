-- ═══════════════════════════════════════════════════════════════
-- HELP CENTER TICKET SYSTEM
-- ═══════════════════════════════════════════════════════════════

-- Tickets table
CREATE TABLE IF NOT EXISTS public.help_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'billing', 'technical', 'feature', 'account')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ticket messages (conversation thread)
CREATE TABLE IF NOT EXISTS public.help_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.help_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_staff BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_help_tickets_user_id ON public.help_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_help_tickets_status ON public.help_tickets(status);
CREATE INDEX IF NOT EXISTS idx_help_ticket_messages_ticket_id ON public.help_ticket_messages(ticket_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_help_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_help_tickets_updated_at ON public.help_tickets;
CREATE TRIGGER trg_help_tickets_updated_at
  BEFORE UPDATE ON public.help_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_help_ticket_updated_at();

-- RLS Policies
ALTER TABLE public.help_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.help_tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON public.help_tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tickets (e.g., close them)
CREATE POLICY "Users can update own tickets" ON public.help_tickets
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets" ON public.help_tickets
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Admins can update any ticket
CREATE POLICY "Admins can update any ticket" ON public.help_tickets
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- Users can view messages on their tickets
CREATE POLICY "Users can view own ticket messages" ON public.help_ticket_messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.help_tickets WHERE id = ticket_id AND user_id = auth.uid())
  );

-- Users can create messages on their tickets
CREATE POLICY "Users can create messages on own tickets" ON public.help_ticket_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.help_tickets WHERE id = ticket_id AND user_id = auth.uid())
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all ticket messages" ON public.help_ticket_messages
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Admins can create staff messages
CREATE POLICY "Admins can create staff messages" ON public.help_ticket_messages
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
