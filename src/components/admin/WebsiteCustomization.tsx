
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Settings, FileText, Globe } from "lucide-react";

export function WebsiteCustomization() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const [siteSettings, setSiteSettings] = useState({
    siteName: "Resume Builder Pro",
    tagline: "Create professional resumes in minutes",
    heroTitle: "Build Your Perfect Resume",
    heroSubtitle: "Professional templates that get you hired",
    maintenanceMode: false,
    registrationEnabled: true,
  });

  const [colors, setColors] = useState({
    primaryColor: "#3b82f6",
    secondaryColor: "#64748b",
    accentColor: "#f59e0b",
  });

  const handleSaveSettings = async () => {
    setIsProcessing(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: "Settings saved", description: "Website settings updated successfully." });
    } catch (error: any) {
      toast({ 
        title: "Save failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Website Customization
        </CardTitle>
        <CardDescription>
          Customize your website appearance and settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={siteSettings.siteName}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={siteSettings.tagline}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, tagline: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Temporarily disable site access for maintenance
                  </div>
                </div>
                <Switch
                  checked={siteSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSiteSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow new users to register accounts
                  </div>
                </div>
                <Switch
                  checked={siteSettings.registrationEnabled}
                  onCheckedChange={(checked) => setSiteSettings(prev => ({ ...prev, registrationEnabled: checked }))}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={colors.primaryColor}
                    onChange={(e) => setColors(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={colors.primaryColor}
                    onChange={(e) => setColors(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={colors.secondaryColor}
                    onChange={(e) => setColors(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={colors.secondaryColor}
                    onChange={(e) => setColors(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    placeholder="#64748b"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={colors.accentColor}
                    onChange={(e) => setColors(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={colors.accentColor}
                    onChange={(e) => setColors(prev => ({ ...prev, accentColor: e.target.value }))}
                    placeholder="#f59e0b"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Hero Section Title</Label>
              <Input
                id="heroTitle"
                value={siteSettings.heroTitle}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, heroTitle: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Hero Section Subtitle</Label>
              <Textarea
                id="heroSubtitle"
                value={siteSettings.heroSubtitle}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                rows={3}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Feature toggles will be available in future updates
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end mt-6">
          <Button onClick={handleSaveSettings} disabled={isProcessing}>
            {isProcessing ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
