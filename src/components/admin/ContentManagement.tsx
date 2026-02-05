import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Globe, Settings, Save, Plus, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  isVisible: boolean;
  lastUpdated: string;
}

interface LandingPageContent {
  heroTitle: string;
  heroSubtitle: string;
  ctaButtonText: string;
  featuresTitle: string;
  testimonialsTitle: string;
}

interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

const defaultLandingPageContent: LandingPageContent = {
  heroTitle: "Build Your Perfect Resume",
  heroSubtitle: "Create professional, ATS-optimized resumes that get you noticed by employers",
  ctaButtonText: "Start Building",
  featuresTitle: "Why Choose Our Resume Builder?",
  testimonialsTitle: "Success Stories"
};

const defaultSeoSettings: SEOSettings = {
  metaTitle: "Professional Resume Builder | Create ATS-Optimized Resumes",
  metaDescription: "Build professional resumes with our easy-to-use resume builder. Choose from ATS-optimized templates and get hired faster.",
  keywords: "resume builder, CV maker, professional resume, ATS resume, job application",
  ogTitle: "Professional Resume Builder",
  ogDescription: "Create stunning resumes that get you hired",
  ogImage: ""
};

const defaultContentSections: ContentSection[] = [
  {
    id: "1",
    title: "Privacy Policy",
    content: "Your privacy is important to us...",
    isVisible: true,
    lastUpdated: new Date().toISOString().split('T')[0]
  },
  {
    id: "2", 
    title: "Terms of Service",
    content: "By using our service, you agree to...",
    isVisible: true,
    lastUpdated: new Date().toISOString().split('T')[0]
  },
  {
    id: "3",
    title: "FAQ Section",
    content: "Frequently asked questions...",
    isVisible: true,
    lastUpdated: new Date().toISOString().split('T')[0]
  }
];

export const ContentManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [landingPageContent, setLandingPageContent] = useState<LandingPageContent>(defaultLandingPageContent);
  const [seoSettings, setSeoSettings] = useState<SEOSettings>(defaultSeoSettings);
  const [contentSections, setContentSections] = useState<ContentSection[]>(defaultContentSections);

  // Fetch landing page content
  const { data: savedLandingContent, isLoading: isLoadingLanding } = useQuery({
    queryKey: ['site-settings', 'landing_page_content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'landing_page_content')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.setting_value as unknown as LandingPageContent | null;
    }
  });

  // Fetch SEO settings
  const { data: savedSeoSettings, isLoading: isLoadingSeo } = useQuery({
    queryKey: ['site-settings', 'seo_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'seo_settings')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.setting_value as unknown as SEOSettings | null;
    }
  });

  // Fetch content sections
  const { data: savedContentSections, isLoading: isLoadingSections } = useQuery({
    queryKey: ['site-settings', 'content_sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'content_sections')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.setting_value as unknown as ContentSection[] | null;
    }
  });

  // Load saved data into state
  useEffect(() => {
    if (savedLandingContent) {
      setLandingPageContent({ ...defaultLandingPageContent, ...savedLandingContent });
    }
  }, [savedLandingContent]);

  useEffect(() => {
    if (savedSeoSettings) {
      setSeoSettings({ ...defaultSeoSettings, ...savedSeoSettings });
    }
  }, [savedSeoSettings]);

  useEffect(() => {
    if (savedContentSections) {
      setContentSections(savedContentSections);
    }
  }, [savedContentSections]);

  // Generic save mutation helper
  const createSaveMutation = (settingKey: string) => useMutation({
    mutationFn: async (settings: any) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', settingKey)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: settings, updated_at: new Date().toISOString() })
          .eq('setting_key', settingKey);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ setting_key: settingKey, setting_value: settings });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', settingKey] });
    }
  });

  // Mutations
  const saveLandingMutation = useMutation({
    mutationFn: async (content: LandingPageContent) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'landing_page_content')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: content as any, updated_at: new Date().toISOString() })
          .eq('setting_key', 'landing_page_content');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ setting_key: 'landing_page_content', setting_value: content as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'landing_page_content'] });
      toast({ title: "Success", description: "Landing page content updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update content.", variant: "destructive" });
    }
  });

  const saveSeoMutation = useMutation({
    mutationFn: async (settings: SEOSettings) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'seo_settings')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: settings as any, updated_at: new Date().toISOString() })
          .eq('setting_key', 'seo_settings');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ setting_key: 'seo_settings', setting_value: settings as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'seo_settings'] });
      toast({ title: "Success", description: "SEO settings updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update SEO settings.", variant: "destructive" });
    }
  });

  const saveSectionsMutation = useMutation({
    mutationFn: async (sections: ContentSection[]) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'content_sections')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: sections as any, updated_at: new Date().toISOString() })
          .eq('setting_key', 'content_sections');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ setting_key: 'content_sections', setting_value: sections as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'content_sections'] });
      toast({ title: "Success", description: "Content sections updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update content sections.", variant: "destructive" });
    }
  });

  const handleSaveLandingPage = () => {
    saveLandingMutation.mutate(landingPageContent);
  };

  const handleSaveSEO = () => {
    saveSeoMutation.mutate(seoSettings);
  };

  const toggleSectionVisibility = (sectionId: string) => {
    const updatedSections = contentSections.map(section => 
      section.id === sectionId 
        ? { ...section, isVisible: !section.isVisible, lastUpdated: new Date().toISOString().split('T')[0] }
        : section
    );
    setContentSections(updatedSections);
    saveSectionsMutation.mutate(updatedSections);
  };

  const isLoading = isLoadingLanding || isLoadingSeo || isLoadingSections;
  const isSaving = saveLandingMutation.isPending || saveSeoMutation.isPending || saveSectionsMutation.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading content settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Content Management
        </CardTitle>
        <CardDescription>
          Manage website content, SEO settings, and page visibility
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="landing" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="landing">Landing Page</TabsTrigger>
            <TabsTrigger value="seo">SEO Settings</TabsTrigger>
            <TabsTrigger value="pages">Page Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="landing" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hero Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={landingPageContent.heroTitle}
                    onChange={(e) => setLandingPageContent(prev => ({ ...prev, heroTitle: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ctaButtonText">CTA Button Text</Label>
                  <Input
                    id="ctaButtonText"
                    value={landingPageContent.ctaButtonText}
                    onChange={(e) => setLandingPageContent(prev => ({ ...prev, ctaButtonText: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                <Textarea
                  id="heroSubtitle"
                  value={landingPageContent.heroSubtitle}
                  onChange={(e) => setLandingPageContent(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="featuresTitle">Features Section Title</Label>
                  <Input
                    id="featuresTitle"
                    value={landingPageContent.featuresTitle}
                    onChange={(e) => setLandingPageContent(prev => ({ ...prev, featuresTitle: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testimonialsTitle">Testimonials Title</Label>
                  <Input
                    id="testimonialsTitle"
                    value={landingPageContent.testimonialsTitle}
                    onChange={(e) => setLandingPageContent(prev => ({ ...prev, testimonialsTitle: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            
            <Button onClick={handleSaveLandingPage} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {saveLandingMutation.isPending ? "Saving..." : "Save Landing Page"}
            </Button>
          </TabsContent>
          
          <TabsContent value="seo" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic SEO</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={seoSettings.metaTitle}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, metaTitle: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    {seoSettings.metaTitle.length}/60 characters (optimal: 50-60)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={seoSettings.metaDescription}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {seoSettings.metaDescription.length}/160 characters (optimal: 150-160)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Textarea
                    id="keywords"
                    value={seoSettings.keywords}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, keywords: e.target.value }))}
                    rows={2}
                    placeholder="Separate keywords with commas"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Open Graph (Social Sharing)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ogTitle">OG Title</Label>
                    <Input
                      id="ogTitle"
                      value={seoSettings.ogTitle}
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, ogTitle: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ogImage">OG Image URL</Label>
                    <Input
                      id="ogImage"
                      value={seoSettings.ogImage}
                      onChange={(e) => setSeoSettings(prev => ({ ...prev, ogImage: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ogDescription">OG Description</Label>
                  <Textarea
                    id="ogDescription"
                    value={seoSettings.ogDescription}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, ogDescription: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            </div>
            
            <Button onClick={handleSaveSEO} disabled={isSaving}>
              <Globe className="w-4 h-4 mr-2" />
              {saveSeoMutation.isPending ? "Saving..." : "Save SEO Settings"}
            </Button>
          </TabsContent>
          
          <TabsContent value="pages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Content Pages ({contentSections.length})</h3>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Page
              </Button>
            </div>
            
            <div className="space-y-4">
              {contentSections.map((section) => (
                <Card key={section.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-base text-foreground">{section.title}</CardTitle>
                        <Badge variant={section.isVisible ? "default" : "secondary"}>
                          {section.isVisible ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.isVisible}
                          onCheckedChange={() => toggleSectionVisibility(section.id)}
                          disabled={saveSectionsMutation.isPending}
                        />
                        <Button variant="outline" size="sm">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-muted-foreground">
                      Last updated: {section.lastUpdated}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {section.content}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
