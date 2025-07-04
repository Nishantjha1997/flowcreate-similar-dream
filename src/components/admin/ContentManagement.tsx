import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Globe, Image, Settings, Save, Plus } from 'lucide-react';

interface ContentSection {
  id: string;
  title: string;
  content: string;
  isVisible: boolean;
  lastUpdated: string;
}

export const ContentManagement = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [landingPageContent, setLandingPageContent] = useState({
    heroTitle: "Build Your Perfect Resume",
    heroSubtitle: "Create professional, ATS-optimized resumes that get you noticed by employers",
    ctaButtonText: "Start Building",
    featuresTitle: "Why Choose Our Resume Builder?",
    testimonialsTitle: "Success Stories"
  });

  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "Professional Resume Builder | Create ATS-Optimized Resumes",
    metaDescription: "Build professional resumes with our easy-to-use resume builder. Choose from ATS-optimized templates and get hired faster.",
    keywords: "resume builder, CV maker, professional resume, ATS resume, job application",
    ogTitle: "Professional Resume Builder",
    ogDescription: "Create stunning resumes that get you hired",
    ogImage: ""
  });

  const [contentSections, setContentSections] = useState<ContentSection[]>([
    {
      id: "1",
      title: "Privacy Policy",
      content: "Your privacy is important to us...",
      isVisible: true,
      lastUpdated: "2024-01-15"
    },
    {
      id: "2", 
      title: "Terms of Service",
      content: "By using our service, you agree to...",
      isVisible: true,
      lastUpdated: "2024-01-15"
    },
    {
      id: "3",
      title: "FAQ Section",
      content: "Frequently asked questions...",
      isVisible: true,
      lastUpdated: "2024-01-15"
    }
  ]);

  const handleSaveLandingPage = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: "Success", description: "Landing page content updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update content.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSEO = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: "Success", description: "SEO settings updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update SEO settings.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setContentSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, isVisible: !section.isVisible }
          : section
      )
    );
  };

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
          <TabsList className="grid w-full grid-cols-3">
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
            
            <Button onClick={handleSaveLandingPage} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save Landing Page"}
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
            
            <Button onClick={handleSaveSEO} disabled={isLoading}>
              <Globe className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save SEO Settings"}
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
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        <Badge variant={section.isVisible ? "default" : "secondary"}>
                          {section.isVisible ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.isVisible}
                          onCheckedChange={() => toggleSectionVisibility(section.id)}
                        />
                        <Button variant="outline" size="sm">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
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