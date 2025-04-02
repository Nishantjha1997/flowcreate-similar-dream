
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const AccountSettings = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    marketingEmails: false,
    resumeAutosave: true,
    darkModeDefault: false,
  });

  const handleToggle = (setting: keyof typeof settings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting]
    });
  };

  const handleSaveSettings = () => {
    setIsUpdating(true);
    
    // This is a placeholder - in a real app, you would save settings to Supabase
    setTimeout(() => {
      toast({
        title: "Settings updated",
        description: "Your account settings have been saved successfully.",
      });
      setIsUpdating(false);
    }, 1000);
  };

  return (
    <div className="container max-w-6xl py-10">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how and when you receive notifications from FlowCreate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about your account activity and resume edits.
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle('emailNotifications')}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new features, tips, and special offers.
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={settings.marketingEmails}
              onCheckedChange={() => handleToggle('marketingEmails')}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resume Builder Settings</CardTitle>
          <CardDescription>
            Customize your resume building experience.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="resume-autosave">Auto-Save</Label>
              <p className="text-sm text-muted-foreground">
                Automatically save your resume changes as you work.
              </p>
            </div>
            <Switch
              id="resume-autosave"
              checked={settings.resumeAutosave}
              onCheckedChange={() => handleToggle('resumeAutosave')}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how FlowCreate looks for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode Default</Label>
              <p className="text-sm text-muted-foreground">
                Set dark mode as your default theme.
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={settings.darkModeDefault}
              onCheckedChange={() => handleToggle('darkModeDefault')}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} disabled={isUpdating}>
            {isUpdating ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccountSettings;
