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
import { ArrowRight, MessageSquare, Plus, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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
      if (error) {
        // Table may not exist yet
        console.warn('help_tickets table not available:', error.message);
        return [];
      }
      return data as HelpTicket[];
    },
    enabled: !!user?.id,
    retry: false,
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not logged in');
      // Create the ticket first
      const { data: ticket, error } = await supabase.from('help_tickets').insert({
        user_id: user.id,
        subject,
        category,
        priority,
        status: 'open',
      }).select('id').single();
      if (error) throw error;
      // Insert the initial message
      const { error: msgError } = await supabase.from('help_ticket_messages').insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        message,
        is_staff: false,
      });
      if (msgError) throw msgError;
    },
    onSuccess: () => {
      toast.success('Ticket submitted! We\'ll respond within 24 hours.');
      setShowForm(false);
      setSubject('');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['helpTickets'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to submit ticket. Please try again.');
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16">
        <div className="container mx-auto px-4">
          <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
              Help Center
            </h1>
            <p className="text-xl text-muted-foreground">
              Need help? Submit a ticket and our team will respond within 24 hours.
            </p>
          </div>
          </ScrollReveal>

          <div className="max-w-3xl mx-auto">
            {/* Create Ticket Button */}
            {!showForm && (
              <div className="text-center mb-10">
                <Button size="lg" onClick={() => setShowForm(true)} disabled={!user}>
                  <Plus className="mr-2 h-4 w-4" />
                  {user ? 'Submit a Ticket' : 'Log in to Submit a Ticket'}
                </Button>
                {!user && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <Link to="/login" className="text-primary underline">Log in</Link> to submit a support ticket.
                  </p>
                )}
              </div>
            )}

            {/* New Ticket Form */}
            {showForm && (
              <ScrollReveal>
              <Card className="mb-10">
                <CardHeader>
                  <CardTitle>Submit a Support Ticket</CardTitle>
                  <CardDescription>Describe your issue and we'll get back to you within 24 hours.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of your issue" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select className="w-full rounded-md border px-3 py-2 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="general">General</option>
                        <option value="billing">Billing</option>
                        <option value="technical">Technical Issue</option>
                        <option value="feature">Feature Request</option>
                        <option value="account">Account</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <select className="w-full rounded-md border px-3 py-2 text-sm" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe your issue in detail..." rows={5} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    <Button onClick={() => createTicket.mutate()} disabled={!subject || !message || createTicket.isPending}>
                      {createTicket.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Submit Ticket
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </ScrollReveal>
            )}

            {/* My Tickets */}
            {user && (
              <ScrollReveal delay={100}>
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" /> My Tickets
                </h2>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : tickets && tickets.length > 0 ? (
                  <div className="space-y-3">
                    {tickets.map((ticket) => {
                      const sc = statusConfig[ticket.status] || statusConfig.open;
                      const StatusIcon = sc.icon;
                      return (
                        <Card key={ticket.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">{ticket.subject}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {ticket.category} · {new Date(ticket.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={`${sc.color} flex items-center gap-1`} variant="outline">
                              <StatusIcon className="h-3 w-3" /> {sc.label}
                            </Badge>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No tickets yet. {!showForm && 'Submit one above if you need help.'}
                  </p>
                )}
              </div>
              </ScrollReveal>
            )}

            {/* CTA */}
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
