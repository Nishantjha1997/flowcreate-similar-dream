import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, MessageSquare, Plus, Clock, CheckCircle, AlertCircle, Loader2, Send, User, Shield } from 'lucide-react';
import { ScrollReveal } from '@/hooks/useScrollAnimation';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface HelpTicket {
  id: string;
  user_id: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_staff: boolean;
  created_at: string;
}

const statusConfig: Record<string, { icon: typeof AlertCircle; color: string; label: string }> = {
  open: { icon: AlertCircle, color: 'text-orange-500 bg-orange-50', label: 'Open' },
  in_progress: { icon: Clock, color: 'text-blue-500 bg-blue-50', label: 'In Progress' },
  resolved: { icon: CheckCircle, color: 'text-green-500 bg-green-50', label: 'Resolved' },
};

const HelpCenter = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [message, setMessage] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  usePageMeta({
    title: 'Help Center & Support',
    description: 'Get help with FlowCreate. Submit a support ticket, find answers to common questions, or contact our team.',
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['helpTickets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('help_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) { console.warn('help_tickets:', error.message); return []; }
      return data as HelpTicket[];
    },
    enabled: !!user?.id,
    retry: false,
  });

  const { data: ticketMessages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['ticketMessages', selectedTicketId],
    queryFn: async () => {
      if (!selectedTicketId) return [];
      const { data, error } = await supabase
        .from('help_ticket_messages')
        .select('*')
        .eq('ticket_id', selectedTicketId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as TicketMessage[];
    },
    enabled: !!selectedTicketId,
    retry: false,
  });

  const selectedTicket = tickets?.find(t => t.id === selectedTicketId);

  const createTicket = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not logged in');
      const { data: ticket, error } = await supabase.from('help_tickets').insert({
        user_id: user.id, subject, category, priority, status: 'open',
      }).select('id').single();
      if (error) throw error;
      const { error: msgError } = await supabase.from('help_ticket_messages').insert({
        ticket_id: ticket.id, sender_id: user.id, message, is_staff: false,
      });
      if (msgError) throw msgError;
    },
    onSuccess: () => {
      toast.success('Ticket submitted! We\'ll respond within 24 hours.');
      setShowForm(false); setSubject(''); setMessage('');
      queryClient.invalidateQueries({ queryKey: ['helpTickets'] });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to submit.'),
  });

  const sendUserReply = async () => {
    if (!replyText.trim() || !selectedTicketId || !user?.id) return;
    setSendingReply(true);
    try {
      const { error } = await supabase.from('help_ticket_messages').insert({
        ticket_id: selectedTicketId, sender_id: user.id, message: replyText.trim(), is_staff: false,
      });
      if (error) throw error;
      setReplyText('');
      refetchMessages();
      toast.success('Reply sent');
    } catch (err: unknown) {
      toast.error('Failed to send reply');
    } finally { setSendingReply(false); }
  };

  const selectedSc = selectedTicket ? (statusConfig[selectedTicket.status] || statusConfig.open) : null;
  const SelectedIcon = selectedSc?.icon;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">Help Center</h1>
            <p className="text-xl text-muted-foreground">Need help? Submit a ticket and our team will respond within 24 hours.</p>
          </div>
          </ScrollReveal>

          <div className="max-w-4xl mx-auto">
            {!user && (
              <div className="text-center mb-10">
                <p className="text-muted-foreground mb-2">Log in to submit and track support tickets.</p>
                <Link to="/login"><Button>Log In <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              </div>
            )}

            {user && !selectedTicketId && (
              <>
                {!showForm ? (
                  <div className="text-center mb-8">
                    <Button size="lg" onClick={() => setShowForm(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Submit a Ticket
                    </Button>
                  </div>
                ) : (
                  <ScrollReveal>
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Submit a Support Ticket</CardTitle>
                      <CardDescription>Describe your issue and we'll get back to you within 24 hours.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div><Label>Subject</Label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Category</Label>
                          <select className="w-full rounded-md border px-3 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="general">General</option><option value="billing">Billing</option><option value="technical">Technical Issue</option><option value="feature">Feature Request</option><option value="account">Account</option>
                          </select>
                        </div>
                        <div><Label>Priority</Label>
                          <select className="w-full rounded-md border px-3 py-2 text-sm" value={priority} onChange={e => setPriority(e.target.value as any)}>
                            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                          </select>
                        </div>
                      </div>
                      <div><Label>Message</Label><Textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Describe your issue in detail..." /></div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                        <Button onClick={() => createTicket.mutate()} disabled={!subject || !message || createTicket.isPending}>
                          {createTicket.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Submit Ticket
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  </ScrollReveal>
                )}

                {/* My Tickets List */}
                <ScrollReveal delay={100}>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5" /> My Tickets</h2>
                {isLoading ? <p className="text-center py-8 text-muted-foreground">Loading...</p> :
                 tickets && tickets.length > 0 ? (
                  <div className="space-y-2">
                    {tickets.map(ticket => {
                      const sc = statusConfig[ticket.status] || statusConfig.open;
                      const Icon = sc.icon;
                      return (
                        <Card key={ticket.id} className="hover:shadow-sm transition-shadow cursor-pointer"
                          onClick={() => setSelectedTicketId(ticket.id)}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{ticket.subject}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{ticket.category} · {new Date(ticket.created_at).toLocaleDateString()}</p>
                            </div>
                            <Badge className={`${sc.color} flex items-center gap-1`} variant="outline">
                              <Icon className="h-3 w-3" /> {sc.label}
                            </Badge>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : <p className="text-muted-foreground text-center py-8">No tickets yet. Submit one above if you need help.</p>}
                </ScrollReveal>
              </>
            )}

            {/* Ticket Detail View */}
            {user && selectedTicketId && selectedTicket && (
              <ScrollReveal>
              <div>
                <button onClick={() => setSelectedTicketId(null)}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
                  <ArrowLeft className="h-4 w-4" /> Back to My Tickets
                </button>

                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-xl">{selectedTicket.subject}</CardTitle>
                        <CardDescription className="mt-1">
                          {selectedTicket.category} · Priority: {selectedTicket.priority} · {new Date(selectedTicket.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      {selectedSc && <Badge className={`${selectedSc.color} flex items-center gap-1`} variant="outline">
                        <SelectedIcon className="h-3 w-3" /> {selectedSc.label}
                      </Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Message Thread */}
                    <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                      {ticketMessages.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No messages yet.</p>
                      ) : (
                        ticketMessages.map(msg => (
                          <div key={msg.id} className={`p-4 rounded-lg ${msg.is_staff ? 'bg-primary/5 border border-primary/20 ml-2' : 'bg-muted mr-2'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {msg.is_staff ? (
                                <Badge variant="outline" className="text-xs bg-primary/10 text-primary flex items-center gap-1">
                                  <Shield className="h-3 w-3" /> FlowCreate Support
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs flex items-center gap-1">
                                  <User className="h-3 w-3" /> You
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Reply Input (only if not resolved) */}
                    {selectedTicket.status !== 'resolved' && (
                      <div className="flex gap-2 pt-4 border-t">
                        <Textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                          placeholder="Type your reply..." rows={2} className="text-sm"
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendUserReply(); } }} />
                        <Button size="sm" className="flex-shrink-0" onClick={sendUserReply}
                          disabled={!replyText.trim() || sendingReply}>
                          {sendingReply ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              </ScrollReveal>
            )}

            {/* Bottom CTA */}
            <ScrollReveal delay={200}>
            <div className="mt-16 bg-[hsl(var(--surface-dark))] rounded-3xl p-10 text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Build Your Resume While You Wait</h2>
              <p className="text-white/70 mb-8">Create a professional resume in minutes — free.</p>
              <Link to="/resume-builder">
                <Button size="lg" variant="secondary" className="rounded-full px-8 h-12">
                  Start Building <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            </ScrollReveal>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
