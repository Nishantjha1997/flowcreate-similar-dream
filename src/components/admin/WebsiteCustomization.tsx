
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Palette, FileText, Plus, Edit, Trash2, Globe, Users, Shield, Sparkles } from "lucide-react";
import { useDesignMode } from "@/hooks/useDesignMode";

interface Feature {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  icon: string;
  category: string;
}

export function WebsiteCustomization() {
  const { toast } = useToast();
  const { designMode, setDesignMode, isNeoBrutalism } = useDesignMode();
  const [isLoading, setIsLoading] = useState(false);
  const [showAddFeatureDialog, setShowAddFeatureDialog] = useState(false);
  
  // Website settings state
  const [websiteSettings, setWebsiteSettings] = useState({
    siteName: "Resume Builder Pro",
    tagline: "Create professional resumes in minutes",
    primaryColor: "#2563eb",
    secondaryColor: "#64748b",
    logoUrl: "",
    faviconUrl: "",
    metaDescription: "Professional resume builder with ATS-optimized templates",
    metaKeywords: "resume, CV, job application, career",
  });

  // About section state
  const [aboutContent, setAboutContent] = useState({
    heroTitle: "Build Your Perfect Resume",
    heroSubtitle: "Create professional, ATS-optimized resumes that get you noticed by employers",
    aboutTitle: "About Resume Builder Pro",
    aboutDescription: "We help job seekers create outstanding resumes that stand out in today's competitive job market. Our platform combines modern design with proven hiring practices.",
    missionStatement: "Our mission is to empower every job seeker with the tools they need to land their dream job.",
    teamDescription: "Our team consists of HR professionals, designers, and developers who understand what employers look for.",
  });

  // Features state
  const [features, setFeatures] = useState<Feature[]>([
    {
      id: "1",
      name: "ATS-Optimized Templates",
      description: "Templates designed to pass through Applicant Tracking Systems",
      isEnabled: true,
      icon: "Layout",
      category: "Core"
    },
    {
      id: "2", 
      name: "AI Resume Assistant",
      description: "Smart suggestions to improve your content",
      isEnabled: true,
      icon: "Bot",
      category: "AI"
    },
    {
      id: "3",
      name: "Easy Customization", 
      description: "Intuitive drag-and-drop editor",
      isEnabled: true,
      icon: "Edit3",
      category: "Editor"
    },
    {
      id: "4",
      name: "Multiple Formats",
      description: "Download as PDF, DOCX, or TXT files",
      isEnabled: true,
      icon: "FileText",
      category: "Export"
    },
    {
      id: "5",
      name: "Privacy Protected",
      description: "Your data is encrypted and never shared",
      isEnabled: true,
      icon: "Shield",
      category: "Security"
    },
    {
      id: "6",
      name: "Real-time Collaboration",
      description: "Share and collaborate on resumes",
      isEnabled: false,
      icon: "Users",
      category: "Collaboration"
    }
  ]);

  const [newFeature, setNewFeature] = useState({
    name: "",
    description: "",
    icon: "Star",
    category: "Core",
    isEnabled: true
  });

  const handleSaveWebsiteSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: "Settings saved", description: "Website settings updated successfully." });
    } catch (error) {
      toast({ title: "Save failed", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAboutContent = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: "Content saved", description: "About section updated successfully." });
    } catch (error) {
      toast({ title: "Save failed", description: "Failed to save content.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(f => 
      f.id === featureId ? { ...f, isEnabled: !f.isEnabled } : f
    ));
    toast({ title: "Feature updated", description: "Feature status changed successfully." });
  };

  const handleAddFeature = () => {
    if (!newFeature.name || !newFeature.description) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const feature: Feature = {
      ...newFeature,
      id: (features.length + 1).toString()
    };

    setFeatures(prev => [...prev, feature]);
    setNewFeature({ name: "", description: "", icon: "Star", category: "Core", isEnabled: true });
    setShowAddFeatureDialog(false);
    toast({ title: "Feature added", description: "New feature created successfully." });
  };

  const handleDeleteFeature = (featureId: string) => {
    setFeatures(prev => prev.filter(f => f.id !== featureId));
    toast({ title: "Feature deleted", description: "Feature removed successfully." });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Website Customization
        </CardTitle>
        <CardDescription>
          Customize your website appearance, content, and features
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="design" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>
          
          {/* Design Mode Tab - NEW */}
          <TabsContent value="design" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Neo-Brutalism Design Mode
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Transform your entire website with bold, high-contrast neo-brutalism aesthetics featuring thick borders, hard shadows, and vibrant colors.
                  </p>
                </div>
                <Switch
                  checked={isNeoBrutalism}
                  onCheckedChange={(checked) => {
                    setDesignMode(checked ? 'neo-brutalism' : 'default');
                    toast({
                      title: checked ? "Neo-Brutalism Enabled" : "Default Design Restored",
                      description: checked 
                        ? "Your website now features bold neo-brutalism styling!" 
                        : "Website restored to classic modern design."
                    });
                  }}
                />
              </div>
              
              {/* Design Mode Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div 
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    !isNeoBrutalism ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground'
                  }`}
                  onClick={() => setDesignMode('default')}
                >
                  <h4 className="font-semibold mb-2">Default Modern</h4>
                  <p className="text-sm text-muted-foreground mb-4">Clean, professional design with subtle shadows and rounded corners.</p>
                  <div className="space-y-2">
                    <div className="h-8 bg-primary rounded-md"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
                
                <div 
                  className={`p-6 cursor-pointer transition-all ${
                    isNeoBrutalism 
                      ? 'border-[3px] border-foreground ring-2 ring-primary/20' 
                      : 'border-2 border-border hover:border-muted-foreground rounded-lg'
                  }`}
                  style={isNeoBrutalism ? { boxShadow: '5px 5px 0px 0px black' } : {}}
                  onClick={() => setDesignMode('neo-brutalism')}
                >
                  <h4 className="font-bold mb-2 uppercase tracking-wide">Neo-Brutalism</h4>
                  <p className="text-sm text-muted-foreground mb-4">Bold, high-contrast with thick borders and hard shadows.</p>
                  <div className="space-y-2">
                    <div className="h-8 bg-yellow-400 border-2 border-foreground" style={{ boxShadow: '3px 3px 0px 0px black' }}></div>
                    <div className="h-4 bg-purple-400 border border-foreground w-3/4"></div>
                    <div className="h-4 bg-cyan-400 border border-foreground w-1/2"></div>
                  </div>
                </div>
              </div>
              
              {isNeoBrutalism && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-none" style={{ boxShadow: '4px 4px 0px 0px hsl(51 100% 40%)' }}>
                  <h4 className="font-bold uppercase text-yellow-800 dark:text-yellow-200">Neo-Brutalism Active</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    All pages will display with bold borders, hard shadows, and vibrant accent colors. The change is applied site-wide instantly.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={websiteSettings.siteName}
                    onChange={(e) => setWebsiteSettings(prev => ({ ...prev, siteName: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={websiteSettings.tagline}
                    onChange={(e) => setWebsiteSettings(prev => ({ ...prev, tagline: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={websiteSettings.metaDescription}
                    onChange={(e) => setWebsiteSettings(prev => ({ ...prev, metaDescription: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={websiteSettings.logoUrl}
                    onChange={(e) => setWebsiteSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="faviconUrl">Favicon URL</Label>
                  <Input
                    id="faviconUrl"
                    value={websiteSettings.faviconUrl}
                    onChange={(e) => setWebsiteSettings(prev => ({ ...prev, faviconUrl: e.target.value }))}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Textarea
                    id="metaKeywords"
                    value={websiteSettings.metaKeywords}
                    onChange={(e) => setWebsiteSettings(prev => ({ ...prev, metaKeywords: e.target.value }))}
                    rows={3}
                    placeholder="resume, CV, job application"
                  />
                </div>
              </div>
            </div>
            
            <Button onClick={handleSaveWebsiteSettings} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save General Settings"}
            </Button>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Hero Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <Input
                      id="heroTitle"
                      value={aboutContent.heroTitle}
                      onChange={(e) => setAboutContent(prev => ({ ...prev, heroTitle: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <Textarea
                      id="heroSubtitle"
                      value={aboutContent.heroSubtitle}
                      onChange={(e) => setAboutContent(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                      rows={2}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">About Section</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aboutTitle">About Title</Label>
                    <Input
                      id="aboutTitle"
                      value={aboutContent.aboutTitle}
                      onChange={(e) => setAboutContent(prev => ({ ...prev, aboutTitle: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aboutDescription">About Description</Label>
                    <Textarea
                      id="aboutDescription"
                      value={aboutContent.aboutDescription}
                      onChange={(e) => setAboutContent(prev => ({ ...prev, aboutDescription: e.target.value }))}
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="missionStatement">Mission Statement</Label>
                    <Textarea
                      id="missionStatement"
                      value={aboutContent.missionStatement}
                      onChange={(e) => setAboutContent(prev => ({ ...prev, missionStatement: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="teamDescription">Team Description</Label>
                    <Textarea
                      id="teamDescription"
                      value={aboutContent.teamDescription}
                      onChange={(e) => setAboutContent(prev => ({ ...prev, teamDescription: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Button onClick={handleSaveAboutContent} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Content Settings"}
            </Button>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Website Features ({features.length})</h3>
              
              <Dialog open={showAddFeatureDialog} onOpenChange={setShowAddFeatureDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Feature</DialogTitle>
                    <DialogDescription>
                      Add a new feature to showcase on your website
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="featureName">Feature Name</Label>
                      <Input
                        id="featureName"
                        value={newFeature.name}
                        onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Advanced Analytics"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="featureDescription">Description</Label>
                      <Textarea
                        id="featureDescription"
                        value={newFeature.description}
                        onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this feature and its benefits"
                        rows={3}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="featureCategory">Category</Label>
                      <Input
                        id="featureCategory"
                        value={newFeature.category}
                        onChange={(e) => setNewFeature(prev => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g., Analytics, Core, AI"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setShowAddFeatureDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddFeature}>
                        Add Feature
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {features.map((feature) => (
                    <TableRow key={feature.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{feature.name}</div>
                          <div className="text-sm text-muted-foreground">{feature.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{feature.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={feature.isEnabled}
                            onCheckedChange={() => handleToggleFeature(feature.id)}
                          />
                          <span className="text-sm">
                            {feature.isEnabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteFeature(feature.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="branding" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Color Scheme
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={websiteSettings.primaryColor}
                        onChange={(e) => setWebsiteSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-16"
                      />
                      <Input
                        value={websiteSettings.primaryColor}
                        onChange={(e) => setWebsiteSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={websiteSettings.secondaryColor}
                        onChange={(e) => setWebsiteSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-16"
                      />
                      <Input
                        value={websiteSettings.secondaryColor}
                        onChange={(e) => setWebsiteSettings(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        placeholder="#64748b"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Color Preview</h3>
                <div className="border rounded-lg p-4 space-y-4">
                  <div 
                    className="h-16 rounded"
                    style={{ backgroundColor: websiteSettings.primaryColor }}
                  >
                    <div className="p-4 text-white font-semibold">Primary Color</div>
                  </div>
                  <div 
                    className="h-16 rounded"
                    style={{ backgroundColor: websiteSettings.secondaryColor }}
                  >
                    <div className="p-4 text-white font-semibold">Secondary Color</div>
                  </div>
                </div>
              </div>
            </div>
            
            <Button onClick={handleSaveWebsiteSettings} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Branding Settings"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
