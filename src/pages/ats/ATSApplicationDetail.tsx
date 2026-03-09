import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, Mail, Phone, Linkedin, Calendar,
  FileText, Star, MessageSquare, Clock, Plus, Video, MapPin, Gift, DollarSign
} from 'lucide-react';
import Header from '@/components/Header';

interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  candidate_linkedin: string | null;
  status: string;
  ai_match_score: number | null;
  rating: number | null;
  resume_url: string | null;
  cover_letter: string | null;
  application_data: any;
  created_at: string;
  tags: string[] | null;
  current_stage_id: string | null;
  job: { id: string; title: string };
}

interface Interview {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  interview_type: string | null;
  status: string;
  location: string | null;
  meeting_link: string | null;
  notes: string | null;
  feedback: string | null;
}

interface Review {
  id: string;
  rating: number | null;
  feedback: string | null;
  recommendation: string | null;
  reviewer_id: string;
  created_at: string;
}

interface Offer {
  id: string;
  job_title: string;
  salary_amount: number;
  salary_currency: string;
  benefits: string | null;
  start_date: string | null;
  status: string;
  created_at: string;
  sent_at: string | null;
  expires_at: string | null;
}

const ATSApplicationDetail = () => {
  const { applicationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [application, setApplication] = useState<Application | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  
  // Interview scheduling
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    title: '', scheduled_at: '', duration_minutes: '60', interview_type: 'video', meeting_link: '', location: '', notes: '',
  });

  // Review
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, feedback: '', recommendation: 'neutral' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Offer
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [offerForm, setOfferForm] = useState({
    job_title: '', salary_amount: '', salary_currency: 'USD', benefits: '', start_date: '', expires_at: ''
  });

  useEffect(() => {
    if (!user) { navigate('/ats/login'); return; }
    loadApplication();
  }, [user, applicationId, navigate]);

  const loadApplication = async () => {
    if (!applicationId) return;
    try {
      const [appRes, intRes, revRes, offRes] = await Promise.all([
        supabase.from('job_applications').select('*, job:jobs(id, title)').eq('id', applicationId).single(),
        supabase.from('interviews').select('*').eq('application_id', applicationId).order('scheduled_at', { ascending: false }),
        supabase.from('application_reviews').select('*').eq('application_id', applicationId).order('created_at', { ascending: false }),
        supabase.from('job_offers').select('*').eq('application_id', applicationId).order('created_at', { ascending: false }),
      ]);

      if (appRes.error) throw appRes.error;
      setApplication(appRes.data);
      setRating(appRes.data.rating || 0);
      setInterviews(intRes.data || []);
      setReviews(revRes.data || []);
      setOffers(offRes.data || []);
      if (appRes.data.job) {
        setOfferForm(prev => ({ ...prev, job_title: appRes.data.job.title }));
      }
    } catch (error: any) {
      toast({ title: "Error loading application", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateRating = async (newRating: number) => {
    if (!applicationId) return;
    try {
      const { error } = await supabase.from('job_applications').update({ rating: newRating }).eq('id', applicationId);
      if (error) throw error;
      setRating(newRating);
      toast({ title: "Rating updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!applicationId) return;
    try {
      const { error } = await supabase.from('job_applications').update({ status: newStatus }).eq('id', applicationId);
      if (error) throw error;
      setApplication(prev => prev ? { ...prev, status: newStatus } : null);
      toast({ title: "Status updated", description: `Application status changed to ${newStatus}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const scheduleInterview = async () => {
    if (!applicationId || !user || !interviewForm.title || !interviewForm.scheduled_at) return;
    setIsScheduling(true);
    try {
      const { error } = await supabase.from('interviews').insert({
        application_id: applicationId, created_by: user.id,
        title: interviewForm.title, scheduled_at: interviewForm.scheduled_at,
        duration_minutes: parseInt(interviewForm.duration_minutes),
        interview_type: interviewForm.interview_type || null,
        meeting_link: interviewForm.meeting_link || null, location: interviewForm.location || null,
        notes: interviewForm.notes || null, status: 'scheduled',
      });
      if (error) throw error;
      toast({ title: "Interview scheduled!" });
      setIsScheduleOpen(false);
      setInterviewForm({ title: '', scheduled_at: '', duration_minutes: '60', interview_type: 'video', meeting_link: '', location: '', notes: '' });
      loadApplication();
    } catch (error: any) {
      toast({ title: "Error scheduling", description: error.message, variant: "destructive" });
    } finally { setIsScheduling(false); }
  };

  const submitReview = async () => {
    if (!applicationId || !user) return;
    setIsSubmittingReview(true);
    try {
      const { error } = await supabase.from('application_reviews').insert({
        application_id: applicationId, reviewer_id: user.id,
        rating: reviewForm.rating || null, feedback: reviewForm.feedback || null,
        recommendation: reviewForm.recommendation || null,
      });
      if (error) throw error;
      toast({ title: "Review submitted!" });
      setIsReviewOpen(false);
      setReviewForm({ rating: 0, feedback: '', recommendation: 'neutral' });
      loadApplication();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setIsSubmittingReview(false); }
  };

  const createOffer = async () => {
    if (!applicationId || !user || !offerForm.job_title || !offerForm.salary_amount) return;
    setIsCreatingOffer(true);
    try {
      const { error } = await supabase.from('job_offers').insert({
        application_id: applicationId, created_by: user.id,
        job_title: offerForm.job_title, salary_amount: parseInt(offerForm.salary_amount),
        salary_currency: offerForm.salary_currency, benefits: offerForm.benefits || null,
        start_date: offerForm.start_date || null, expires_at: offerForm.expires_at || null,
        status: 'draft',
      });
      if (error) throw error;
      toast({ title: "Offer created!" });
      setIsOfferOpen(false);
      loadApplication();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally { setIsCreatingOffer(false); }
  };

  const updateOfferStatus = async (offerId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'sent') updates.sent_at = new Date().toISOString();
      if (newStatus === 'accepted' || newStatus === 'declined') updates.responded_at = new Date().toISOString();
      const { error } = await supabase.from('job_offers').update(updates).eq('id', offerId);
      if (error) throw error;
      toast({ title: `Offer ${newStatus}` });
      loadApplication();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8"><p>Application not found</p></div>
      </div>
    );
  }

  const getOfferStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary' as const;
      case 'sent': return 'default' as const;
      case 'accepted': return 'default' as const;
      case 'declined': return 'destructive' as const;
      default: return 'secondary' as const;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{application.candidate_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-4">Applied for: {application.job.title}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${application.candidate_email}`} className="hover:underline">{application.candidate_email}</a>
                      </div>
                      {application.candidate_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${application.candidate_phone}`} className="hover:underline">{application.candidate_phone}</a>
                        </div>
                      )}
                      {application.candidate_linkedin && (
                        <div className="flex items-center gap-2">
                          <Linkedin className="h-4 w-4 text-muted-foreground" />
                          <a href={application.candidate_linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
                        </div>
                      )}
                    </div>
                  </div>
                  {application.ai_match_score && (
                    <Badge variant="outline" className="text-lg px-4 py-2">{application.ai_match_score}% Match</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm font-medium">Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => updateRating(star)}>
                      <Star className={`h-5 w-5 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400'}`} />
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Applied {new Date(application.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="application" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="application">Application</TabsTrigger>
                <TabsTrigger value="resume">Resume</TabsTrigger>
                <TabsTrigger value="interviews">Interviews ({interviews.length})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                <TabsTrigger value="offers">Offers ({offers.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="application" className="space-y-4">
                {application.cover_letter && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Cover Letter</CardTitle></CardHeader>
                    <CardContent><p className="whitespace-pre-wrap text-sm">{application.cover_letter}</p></CardContent>
                  </Card>
                )}
                {application.tags && application.tags.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Tags</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {application.tags.map((tag, i) => <Badge key={i} variant="secondary">{tag}</Badge>)}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resume">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Resume</CardTitle></CardHeader>
                  <CardContent>
                    {application.resume_url ? (
                      <Button asChild>
                        <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                          <FileText className="mr-2 h-4 w-4" /> View Resume
                        </a>
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">No resume uploaded</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="interviews" className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => { setInterviewForm({ ...interviewForm, title: `Interview - ${application.candidate_name}` }); setIsScheduleOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Schedule Interview
                  </Button>
                </div>
                {interviews.length === 0 ? (
                  <Card><CardContent className="py-8 text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No interviews scheduled yet</p>
                  </CardContent></Card>
                ) : (
                  interviews.map((interview) => (
                    <Card key={interview.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{interview.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(interview.scheduled_at).toLocaleString()}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{interview.duration_minutes} min</span>
                              {interview.interview_type && <span className="flex items-center gap-1"><Video className="h-3 w-3" />{interview.interview_type}</span>}
                            </div>
                            {interview.meeting_link && <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-1 block">Join Meeting</a>}
                            {interview.notes && <p className="text-sm text-muted-foreground mt-2">{interview.notes}</p>}
                          </div>
                          <Badge variant={interview.status === 'scheduled' ? 'default' : 'secondary'}>{interview.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => setIsReviewOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Review</Button>
                </div>
                {reviews.length === 0 ? (
                  <Card><CardContent className="py-8 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No reviews yet</p>
                  </CardContent></Card>
                ) : (
                  reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {review.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating! ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} />
                              ))}
                            </div>
                          )}
                          {review.recommendation && (
                            <Badge variant={review.recommendation === 'hire' ? 'default' : review.recommendation === 'reject' ? 'destructive' : 'secondary'}>
                              {review.recommendation}
                            </Badge>
                          )}
                        </div>
                        {review.feedback && <p className="text-sm">{review.feedback}</p>}
                        <p className="text-xs text-muted-foreground mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="offers" className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => setIsOfferOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create Offer</Button>
                </div>
                {offers.length === 0 ? (
                  <Card><CardContent className="py-8 text-center text-muted-foreground">
                    <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No offers created yet</p>
                  </CardContent></Card>
                ) : (
                  offers.map((offer) => (
                    <Card key={offer.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{offer.job_title}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{offer.salary_currency} {offer.salary_amount.toLocaleString()}</span>
                              {offer.start_date && <span>Start: {new Date(offer.start_date).toLocaleDateString()}</span>}
                            </div>
                            {offer.benefits && <p className="text-sm text-muted-foreground mt-2">{offer.benefits}</p>}
                          </div>
                          <Badge variant={getOfferStatusColor(offer.status)}>{offer.status}</Badge>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t">
                          {offer.status === 'draft' && (
                            <Button size="sm" onClick={() => updateOfferStatus(offer.id, 'sent')}>Send Offer</Button>
                          )}
                          {offer.status === 'sent' && (
                            <>
                              <Button size="sm" onClick={() => updateOfferStatus(offer.id, 'accepted')}>Mark Accepted</Button>
                              <Button size="sm" variant="outline" onClick={() => updateOfferStatus(offer.id, 'declined')}>Mark Declined</Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => window.open(`mailto:${application.candidate_email}`)}>
                  <Mail className="mr-2 h-4 w-4" /> Send Email
                </Button>
                <Button className="w-full" variant="outline" onClick={() => { setInterviewForm({ ...interviewForm, title: `Interview - ${application.candidate_name}` }); setIsScheduleOpen(true); }}>
                  <Calendar className="mr-2 h-4 w-4" /> Schedule Interview
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setIsReviewOpen(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Add Review
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setIsOfferOpen(true)}>
                  <Gift className="mr-2 h-4 w-4" /> Create Offer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Status</CardTitle></CardHeader>
              <CardContent>
                <Select value={application.status} onValueChange={updateStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="interviewing">Interviewing</SelectItem>
                    <SelectItem value="offered">Offered</SelectItem>
                    <SelectItem value="hired">Hired</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Schedule Interview Dialog */}
      <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
            <DialogDescription>Set up an interview with {application.candidate_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Title *</Label><Input value={interviewForm.title} onChange={(e) => setInterviewForm({ ...interviewForm, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Date & Time *</Label><Input type="datetime-local" value={interviewForm.scheduled_at} onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_at: e.target.value })} /></div>
              <div className="space-y-2"><Label>Duration</Label>
                <Select value={interviewForm.duration_minutes} onValueChange={(v) => setInterviewForm({ ...interviewForm, duration_minutes: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="30">30 min</SelectItem><SelectItem value="45">45 min</SelectItem><SelectItem value="60">60 min</SelectItem><SelectItem value="90">90 min</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Interview Type</Label>
              <Select value={interviewForm.interview_type} onValueChange={(v) => setInterviewForm({ ...interviewForm, interview_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="video">Video Call</SelectItem><SelectItem value="phone">Phone</SelectItem><SelectItem value="in-person">In Person</SelectItem><SelectItem value="technical">Technical</SelectItem><SelectItem value="panel">Panel</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Meeting Link</Label><Input placeholder="https://meet.google.com/..." value={interviewForm.meeting_link} onChange={(e) => setInterviewForm({ ...interviewForm, meeting_link: e.target.value })} /></div>
            <div className="space-y-2"><Label>Notes</Label><Textarea placeholder="Any additional notes..." value={interviewForm.notes} onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>Cancel</Button>
            <Button onClick={scheduleInterview} disabled={isScheduling || !interviewForm.title || !interviewForm.scheduled_at}>{isScheduling ? 'Scheduling...' : 'Schedule Interview'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Review</DialogTitle>
            <DialogDescription>Submit your evaluation of {application.candidate_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Rating</Label>
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })}>
                  <Star className={`h-6 w-6 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400'}`} />
                </button>
              ))}</div>
            </div>
            <div className="space-y-2"><Label>Recommendation</Label>
              <Select value={reviewForm.recommendation} onValueChange={(v) => setReviewForm({ ...reviewForm, recommendation: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="hire">Hire</SelectItem><SelectItem value="neutral">Neutral</SelectItem><SelectItem value="reject">Reject</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Feedback</Label><Textarea placeholder="Your detailed feedback..." value={reviewForm.feedback} onChange={(e) => setReviewForm({ ...reviewForm, feedback: e.target.value })} rows={4} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>Cancel</Button>
            <Button onClick={submitReview} disabled={isSubmittingReview}>{isSubmittingReview ? 'Submitting...' : 'Submit Review'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Offer Dialog */}
      <Dialog open={isOfferOpen} onOpenChange={setIsOfferOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Job Offer</DialogTitle>
            <DialogDescription>Create an offer for {application.candidate_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Job Title *</Label><Input value={offerForm.job_title} onChange={(e) => setOfferForm({ ...offerForm, job_title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Salary Amount *</Label><Input type="number" placeholder="80000" value={offerForm.salary_amount} onChange={(e) => setOfferForm({ ...offerForm, salary_amount: e.target.value })} /></div>
              <div className="space-y-2"><Label>Currency</Label>
                <Select value={offerForm.salary_currency} onValueChange={(v) => setOfferForm({ ...offerForm, salary_currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem><SelectItem value="INR">INR</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Benefits</Label><Textarea placeholder="Health insurance, 401k, PTO..." value={offerForm.benefits} onChange={(e) => setOfferForm({ ...offerForm, benefits: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={offerForm.start_date} onChange={(e) => setOfferForm({ ...offerForm, start_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Offer Expires</Label><Input type="datetime-local" value={offerForm.expires_at} onChange={(e) => setOfferForm({ ...offerForm, expires_at: e.target.value })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOfferOpen(false)}>Cancel</Button>
            <Button onClick={createOffer} disabled={isCreatingOffer || !offerForm.job_title || !offerForm.salary_amount}>{isCreatingOffer ? 'Creating...' : 'Create Offer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ATSApplicationDetail;
