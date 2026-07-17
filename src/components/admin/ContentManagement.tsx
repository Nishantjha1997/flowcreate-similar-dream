import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Globe, Save, Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ContentSection {
  id: string; title: string; content: string;
  isVisible: boolean; lastUpdated: string;
}
interface LandingPageContent {
  heroTitle: string; heroSubtitle: string; ctaButtonText: string;
  featuresTitle: string; testimonialsTitle: string;
}
interface SEOSettings {
  metaTitle: string; metaDescription: string; keywords: string;
  ogTitle: string; ogDescription: string; ogImage: string;
}

const defaults = {
  landing: { heroTitle: "Build Your Perfect Resume", heroSubtitle: "Create professional, ATS-optimized resumes that get you noticed by employers", ctaButtonText: "Start Building", featuresTitle: "Why Choose Our Resume Builder?", testimonialsTitle: "Success Stories" } as LandingPageContent,
  seo: { metaTitle: "Professional Resume Builder | Create ATS-Optimized Resumes", metaDescription: "Build professional resumes with our easy-to-use resume builder. Choose from ATS-optimized templates and get hired faster.", keywords: "resume builder, CV maker, professional resume, ATS resume, job application", ogTitle: "Professional Resume Builder", ogDescription: "Create stunning resumes that get you hired", ogImage: "" } as SEOSettings,
  sections: [
    { id: "1", title: "Privacy Policy", content: "Your privacy is important to us. We do not sell or share your personal data.", isVisible: true, lastUpdated: new Date().toISOString().split('T')[0] },
    { id: "2", title: "Terms of Service", content: "By using FlowCreate, you agree to our terms of service.", isVisible: true, lastUpdated: new Date().toISOString().split('T')[0] },
    { id: "3", title: "FAQ Section", content: "Find answers to common questions about our resume builder.", isVisible: true, lastUpdated: new Date().toISOString().split('T')[0] },
  ] as ContentSection[]
};

export const ContentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [landing, setLanding] = useState(defaults.landing);
  const [seo, setSeo] = useState(defaults.seo);
  const [sections, setSections] = useState(defaults.sections);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [newSection, setNewSection] = useState({ title: '', content: '' });
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { isLoading: l1, data: savedLanding } = useQuery({
    queryKey: ['site-settings', 'landing_page_content'],
    queryFn: async () => { const { data, error } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'landing_page_content').single(); if (error && error.code !== 'PGRST116') throw error; return data?.setting_value as unknown as LandingPageContent | null; }
  });
  const { isLoading: l2, data: savedSeo } = useQuery({
    queryKey: ['site-settings', 'seo_settings'],
    queryFn: async () => { const { data, error } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'seo_settings').single(); if (error && error.code !== 'PGRST116') throw error; return data?.setting_value as unknown as SEOSettings | null; }
  });
  const { isLoading: l3, data: savedSections } = useQuery({
    queryKey: ['site-settings', 'content_sections'],
    queryFn: async () => { const { data, error } = await supabase.from('site_settings').select('setting_value').eq('setting_key', 'content_sections').single(); if (error && error.code !== 'PGRST116') throw error; return data?.setting_value as unknown as ContentSection[] | null; }
  });

  useEffect(() => { if (savedLanding) setLanding({ ...defaults.landing, ...savedLanding }); }, [savedLanding]);
  useEffect(() => { if (savedSeo) setSeo({ ...defaults.seo, ...savedSeo }); }, [savedSeo]);
  useEffect(() => { if (savedSections) setSections(savedSections); }, [savedSections]);

  const saveMutation = (key: string) => useMutation({
    mutationFn: async (value: any) => {
      const { data: ex } = await supabase.from('site_settings').select('id').eq('setting_key', key).single();
      if (ex) await supabase.from('site_settings').update({ setting_value: value, updated_at: new Date().toISOString() }).eq('setting_key', key);
      else await supabase.from('site_settings').insert({ setting_key: key, setting_value: value });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['site-settings', key] }); toast({ title: "Saved" }); },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const saveLanding = saveMutation('landing_page_content');
  const saveSeo = saveMutation('seo_settings');
  const saveSections = saveMutation('content_sections');

  const toggleSection = (id: string) => {
    const updated = sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible, lastUpdated: new Date().toISOString().split('T')[0] } : s);
    setSections(updated); saveSections.mutate(updated);
  };
  const addSection = () => {
    if (!newSection.title.trim()) return;
    const updated = [...sections, { id: Date.now().toString(), title: newSection.title.trim(), content: newSection.content, isVisible: true, lastUpdated: new Date().toISOString().split('T')[0] }];
    setSections(updated); saveSections.mutate(updated);
    setNewSection({ title: '', content: '' }); setShowAddDialog(false);
  };
  const updateSection = () => {
    if (!editingSection) return;
    const updated = sections.map(s => s.id === editingSection.id ? { ...editingSection, lastUpdated: new Date().toISOString().split('T')[0] } : s);
    setSections(updated); saveSections.mutate(updated); setEditingSection(null);
  };
  const deleteSection = (id: string) => {
    const updated = sections.filter(s => s.id !== id);
    setSections(updated); saveSections.mutate(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />Content Management</CardTitle>
        <CardDescription>Manage landing page content, SEO settings, and content pages.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="landing">
          <TabsList>
            <TabsTrigger value="landing">Landing Page</TabsTrigger>
            <TabsTrigger value="seo">SEO Settings</TabsTrigger>
            <TabsTrigger value="pages">Page Management</TabsTrigger>
          </TabsList>
          <TabsContent value="landing" className="space-y-6">
            {l1 ? <Loader2 className="h-6 w-6 animate-spin mx-auto my-8" /> : (<>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Hero Title</Label><Input value={landing.heroTitle} onChange={e => setLanding(p => ({ ...p, heroTitle: e.target.value }))} /></div>
                <div><Label>CTA Button Text</Label><Input value={landing.ctaButtonText} onChange={e => setLanding(p => ({ ...p, ctaButtonText: e.target.value }))} /></div>
              </div>
              <div><Label>Hero Subtitle</Label><Textarea value={landing.heroSubtitle} onChange={e => setLanding(p => ({ ...p, heroSubtitle: e.target.value }))} rows={2} /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Features Title</Label><Input value={landing.featuresTitle} onChange={e => setLanding(p => ({ ...p, featuresTitle: e.target.value }))} /></div>
                <div><Label>Testimonials Title</Label><Input value={landing.testimonialsTitle} onChange={e => setLanding(p => ({ ...p, testimonialsTitle: e.target.value }))} /></div>
              </div>
              <Button onClick={() => saveLanding.mutate(landing)} disabled={saveLanding.isPending}><Save className="w-4 h-4 mr-2" />{saveLanding.isPending ? "Saving..." : "Save Landing Page"}</Button>
            </>)}
          </TabsContent>
          <TabsContent value="seo" className="space-y-6">
            {l2 ? <Loader2 className="h-6 w-6 animate-spin mx-auto my-8" /> : (<>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label>Meta Title ({seo.metaTitle.length}/60)</Label><Input value={seo.metaTitle} onChange={e => setSeo(p => ({ ...p, metaTitle: e.target.value }))} /></div>
                <div><Label>Keywords</Label><Textarea value={seo.keywords} onChange={e => setSeo(p => ({ ...p, keywords: e.target.value }))} rows={2} /></div>
              </div>
              <div><Label>Meta Description ({seo.metaDescription.length}/160)</Label><Textarea value={seo.metaDescription} onChange={e => setSeo(p => ({ ...p, metaDescription: e.target.value }))} rows={3} /></div>
              <div className="space-y-3"><h3 className="font-semibold">Open Graph</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>OG Title</Label><Input value={seo.ogTitle} onChange={e => setSeo(p => ({ ...p, ogTitle: e.target.value }))} /></div>
                  <div><Label>OG Image URL</Label><Input value={seo.ogImage} onChange={e => setSeo(p => ({ ...p, ogImage: e.target.value }))} /></div>
                </div>
                <div><Label>OG Description</Label><Textarea value={seo.ogDescription} onChange={e => setSeo(p => ({ ...p, ogDescription: e.target.value }))} rows={2} /></div>
              </div>
              <Button onClick={() => saveSeo.mutate(seo)} disabled={saveSeo.isPending}><Globe className="w-4 h-4 mr-2" />{saveSeo.isPending ? "Saving..." : "Save SEO Settings"}</Button>
            </>)}
          </TabsContent>
          <TabsContent value="pages" className="space-y-6">
            {l3 ? <Loader2 className="h-6 w-6 animate-spin mx-auto my-8" /> : (<>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Content Pages ({sections.length})</h3>
                <Button onClick={() => setShowAddDialog(true)}><Plus className="w-4 h-4 mr-2" />Add New Page</Button>
              </div>
              {sections.length === 0 && <p className="text-muted-foreground text-center py-8">No pages yet.</p>}
              {sections.map(s => (
                <Card key={s.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><CardTitle className="text-base">{s.title}</CardTitle><Badge variant={s.isVisible ? "default" : "secondary"}>{s.isVisible ? "Published" : "Draft"}</Badge></div>
                      <div className="flex items-center gap-2">
                        <Switch checked={s.isVisible} onCheckedChange={() => toggleSection(s.id)} disabled={saveSections.isPending} />
                        <Button variant="outline" size="sm" onClick={() => setEditingSection(s)}><Edit className="w-3 h-3" /></Button>
                        <Button variant="outline" size="sm" onClick={() => { if (confirm('Delete this section?')) deleteSection(s.id); }}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                      </div>
                    </div>
                    <CardDescription>Updated: {s.lastUpdated}</CardDescription>
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground line-clamp-2">{s.content}</p></CardContent>
                </Card>
              ))}
            </>)}
          </TabsContent>
        </Tabs>
      </CardContent>
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent><DialogHeader><DialogTitle>Add New Page</DialogTitle></DialogHeader>
          <div className="space-y-3"><div><Label>Title</Label><Input value={newSection.title} onChange={e => setNewSection(p => ({ ...p, title: e.target.value }))} /></div>
          <div><Label>Content</Label><Textarea value={newSection.content} onChange={e => setNewSection(p => ({ ...p, content: e.target.value }))} rows={5} /></div></div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button><Button onClick={addSection} disabled={!newSection.title.trim()}><Plus className="w-4 h-4 mr-1" />Add Page</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent><DialogHeader><DialogTitle>Edit Page</DialogTitle></DialogHeader>
          {editingSection && (<><div className="space-y-3">
            <div><Label>Title</Label><Input value={editingSection.title} onChange={e => setEditingSection(p => p ? { ...p, title: e.target.value } : null)} /></div>
            <div><Label>Content</Label><Textarea value={editingSection.content} onChange={e => setEditingSection(p => p ? { ...p, content: e.target.value } : null)} rows={6} /></div>
            <div className="flex items-center gap-2"><Label>Visible</Label><Switch checked={editingSection.isVisible} onCheckedChange={v => setEditingSection(p => p ? { ...p, isVisible: v } : null)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditingSection(null)}>Cancel</Button><Button onClick={updateSection}><Save className="w-4 h-4 mr-1" />Save Changes</Button></DialogFooter></>)}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
