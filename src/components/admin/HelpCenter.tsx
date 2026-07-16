import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  MessageSquare, AlertCircle, Clock, CheckCircle, 
  ChevronDown, ChevronUp, Send, RefreshCw, Loader2 
} from 'lucide-react';

interface HelpTicket {
  id: string;
  user_id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  messages?: HelpTicketMessage[];
  user_email?: string;
}

interface HelpTicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_staff: boolean;
  created_at: string;
}

const statusConfig: Record<string, { icon: typeof AlertCircle; color: string; label: string }> = {
  open: { icon: AlertCircle, color: 'text-orange-600 bg-orange-100', label: 'Open' },
  in_progress: { icon: Clock, color: 'text-blue-600 bg-blue-100', label: 'In Progress' },
  resolved: { icon: CheckCircle, color: 'text-green-600 bg-green-100', label: 'Resolved' },
};

const priorityConfig: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

interface HelpCenterProps {
  isAdmin?: boolean;
}

export function HelpCenter({ isAdmin = false }: HelpCenterProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sendingReply, setSendingReply] = useState<string | null>(null);

  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ['adminHelpTickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('help_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as HelpTicket[];
    },
    enabled: isAdmin,
    retry: false,
    refetchInterval: 30000,
  });

  const { data: ticketMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['adminHelpTicketMessages', expandedId],
    queryFn: async () => {
      if (!expandedId) return [];
      const { data, error } = await supabase
        .from('help_ticket_messages')
        .select('*')
        .eq('ticket_id', expandedId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as HelpTicketMessage[];
    },
    enabled: !!expandedId,
    retry: false,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('help_tickets').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Status updated' });
      queryClient.invalidateQueries({ queryKey: ['adminHelpTickets'] });
    },
    onError: (err: Error) => toast({ title: 'Failed', description: err.message, variant: 'destructive' }),
  });

  const sendReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    setSendingReply(ticketId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('help_ticket_messages').insert({
        ticket_id: ticketId,
        sender_id: user.id,
        message: replyText.trim(),
        is_staff: true,
      });
      if (error) throw error;
      setReplyText('');
      refetchMessages();
      toast({ title: 'Reply sent' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      toast({ title: 'Failed to send', description: message, variant: 'destructive' });
    } finally {
      setSendingReply(null);
    }
  };

  const filtered = statusFilter === 'all' ? tickets : tickets.filter(t => t.status === statusFilter);
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;

  if (!isAdmin) return null;

  return (
    <GlassCard variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> Help Center Tickets
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {openCount} open · {inProgressCount} in progress · {tickets.length} total
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'open', 'in_progress', 'resolved'].map(s => (
          <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm"
            onClick={() => setStatusFilter(s)} className="text-xs capitalize">
            {s.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No tickets found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket) => {
            const sc = statusConfig[ticket.status] || statusConfig.open;
            const StatusIcon = sc.icon;
            const isExpanded = expandedId === ticket.id;
            return (
              <div key={ticket.id} className="border rounded-lg">
                <button
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                  onClick={() => { setExpandedId(isExpanded ? null : ticket.id); setReplyText(''); }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${sc.color} flex items-center gap-1`} variant="outline">
                        <StatusIcon className="h-3 w-3" /> {sc.label}
                      </Badge>
                      <Badge className={priorityConfig[ticket.priority]} variant="outline">
                        {ticket.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground capitalize">{ticket.category}</span>
                    </div>
                    <h4 className="font-medium text-sm truncate">{ticket.subject}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(ticket.created_at).toLocaleString()}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 flex-shrink-0 ml-2" /> : <ChevronDown className="h-4 w-4 flex-shrink-0 ml-2" />}
                </button>

                {isExpanded && (
                  <div className="border-t p-4 space-y-4">
                    {/* Status Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant={ticket.status === 'open' ? 'default' : 'outline'}
                        onClick={() => updateStatus.mutate({ id: ticket.id, status: 'open' })}>Open</Button>
                      <Button size="sm" variant={ticket.status === 'in_progress' ? 'default' : 'outline'}
                        onClick={() => updateStatus.mutate({ id: ticket.id, status: 'in_progress' })}>In Progress</Button>
                      <Button size="sm" variant={ticket.status === 'resolved' ? 'default' : 'outline'}
                        onClick={() => updateStatus.mutate({ id: ticket.id, status: 'resolved' })}>Resolved</Button>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {ticketMessages?.map((msg) => (
                        <div key={msg.id} className={`p-3 rounded-lg text-sm ${msg.is_staff ? 'bg-primary/5 ml-4' : 'bg-muted mr-4'}`}>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {msg.is_staff ? 'Staff' : 'User'} · {new Date(msg.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      {(!ticketMessages || ticketMessages.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">No messages yet.</p>
                      )}
                    </div>

                    {/* Reply Input */}
                    <div className="flex gap-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        rows={2}
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendReply(ticket.id);
                          }
                        }}
                      />
                      <Button size="sm" className="flex-shrink-0"
                        onClick={() => sendReply(ticket.id)}
                        disabled={!replyText.trim() || sendingReply === ticket.id}>
                        {sendingReply === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
