import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Key, AlertTriangle, Eye, Settings, Users, Lock, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SecurityLog {
  id: string;
  type: 'login' | 'signup' | 'admin_action' | 'failed_login';
  user: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'blocked';
}

interface SecuritySettingsData {
  enableTwoFactor: boolean;
  requireStrongPasswords: boolean;
  enableAccountLockout: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number;
  enableIpWhitelist: boolean;
  enableRateLimiting: boolean;
  sessionTimeout: number;
  enableAuditLog: boolean;
  requireEmailVerification: boolean;
}

interface RateLimitSettingsData {
  apiRequestsPerMinute: number;
  loginAttemptsPerHour: number;
  signupAttemptsPerHour: number;
  resumeDownloadsPerHour: number;
}

const defaultSecuritySettings: SecuritySettingsData = {
  enableTwoFactor: false,
  requireStrongPasswords: true,
  enableAccountLockout: true,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  enableIpWhitelist: false,
  enableRateLimiting: true,
  sessionTimeout: 24,
  enableAuditLog: true,
  requireEmailVerification: true
};

const defaultRateLimitSettings: RateLimitSettingsData = {
  apiRequestsPerMinute: 100,
  loginAttemptsPerHour: 10,
  signupAttemptsPerHour: 5,
  resumeDownloadsPerHour: 20
};

export const SecuritySettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsData>(defaultSecuritySettings);
  const [rateLimitSettings, setRateLimitSettings] = useState<RateLimitSettingsData>(defaultRateLimitSettings);

  // Fetch security settings from database
  const { data: savedSecuritySettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['site-settings', 'security_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'security_settings')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.setting_value as unknown as SecuritySettingsData | null;
    }
  });

  // Fetch rate limit settings from database
  const { data: savedRateLimitSettings, isLoading: isLoadingRateLimits } = useQuery({
    queryKey: ['site-settings', 'rate_limit_settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'rate_limit_settings')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.setting_value as unknown as RateLimitSettingsData | null;
    }
  });

  // Load saved settings into state
  useEffect(() => {
    if (savedSecuritySettings) {
      setSecuritySettings({ ...defaultSecuritySettings, ...savedSecuritySettings });
    }
  }, [savedSecuritySettings]);

  useEffect(() => {
    if (savedRateLimitSettings) {
      setRateLimitSettings({ ...defaultRateLimitSettings, ...savedRateLimitSettings });
    }
  }, [savedRateLimitSettings]);

  // Mutation for saving security settings
  const saveSecurityMutation = useMutation({
    mutationFn: async (settings: SecuritySettingsData) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'security_settings')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: settings as any, updated_at: new Date().toISOString() })
          .eq('setting_key', 'security_settings');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ setting_key: 'security_settings', setting_value: settings as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'security_settings'] });
      toast({ title: "Success", description: "Security settings updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update security settings.", variant: "destructive" });
    }
  });

  // Mutation for saving rate limit settings
  const saveRateLimitMutation = useMutation({
    mutationFn: async (settings: RateLimitSettingsData) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', 'rate_limit_settings')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('site_settings')
          .update({ setting_value: settings as any, updated_at: new Date().toISOString() })
          .eq('setting_key', 'rate_limit_settings');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ setting_key: 'rate_limit_settings', setting_value: settings as any });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'rate_limit_settings'] });
      toast({ title: "Success", description: "Rate limiting settings updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update rate limits.", variant: "destructive" });
    }
  });

  const [securityLogs] = useState<SecurityLog[]>([
    {
      id: "1",
      type: "admin_action",
      user: "admin@example.com",
      action: "User role updated",
      timestamp: "2024-01-15 10:30:00",
      ipAddress: "192.168.1.1",
      status: "success"
    },
    {
      id: "2",
      type: "failed_login",
      user: "user@example.com",
      action: "Failed login attempt",
      timestamp: "2024-01-15 09:15:00",
      ipAddress: "203.0.113.1",
      status: "failed"
    },
    {
      id: "3",
      type: "signup",
      user: "newuser@example.com",
      action: "New user registration",
      timestamp: "2024-01-15 08:45:00",
      ipAddress: "198.51.100.1",
      status: "success"
    }
  ]);

  const handleSaveSecuritySettings = () => {
    saveSecurityMutation.mutate(securitySettings);
  };

  const handleSaveRateLimits = () => {
    saveRateLimitMutation.mutate(rateLimitSettings);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'blocked':
        return <Badge className="bg-orange-100 text-orange-800">Blocked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Key className="w-4 h-4" />;
      case 'signup':
        return <Users className="w-4 h-4" />;
      case 'admin_action':
        return <Settings className="w-4 h-4" />;
      case 'failed_login':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const isLoading = isLoadingSettings || isLoadingRateLimits;
  const isSaving = saveSecurityMutation.isPending || saveRateLimitMutation.isPending;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading security settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security & Privacy Settings
        </CardTitle>
        <CardDescription>
          Configure security policies, monitor activities, and manage access controls
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="policies" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="policies" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Security Policies</TabsTrigger>
            <TabsTrigger value="monitoring" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Activity Monitoring</TabsTrigger>
            <TabsTrigger value="limits" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Rate Limiting</TabsTrigger>
          </TabsList>
          
          <TabsContent value="policies" className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Authentication Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.enableTwoFactor}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, enableTwoFactor: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Strong Password Requirements</Label>
                      <p className="text-sm text-muted-foreground">
                        Enforce minimum 8 characters with mixed case, numbers, and symbols
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.requireStrongPasswords}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, requireStrongPasswords: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Verification Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Require email verification for new accounts
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.requireEmailVerification}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, requireEmailVerification: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Security</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Account Lockout Protection</Label>
                      <p className="text-sm text-muted-foreground">
                        Lock accounts after multiple failed login attempts
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.enableAccountLockout}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, enableAccountLockout: checked }))
                      }
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxAttempts">Max Login Attempts</Label>
                      <Input
                        id="maxAttempts"
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) => 
                          setSecuritySettings(prev => ({ 
                            ...prev, 
                            maxLoginAttempts: parseInt(e.target.value) || 5 
                          }))
                        }
                        min="3"
                        max="10"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                      <Input
                        id="lockoutDuration"
                        type="number"
                        value={securitySettings.lockoutDuration}
                        onChange={(e) => 
                          setSecuritySettings(prev => ({ 
                            ...prev, 
                            lockoutDuration: parseInt(e.target.value) || 30 
                          }))
                        }
                        min="5"
                        max="1440"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Session Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => 
                        setSecuritySettings(prev => ({ 
                          ...prev, 
                          sessionTimeout: parseInt(e.target.value) || 24 
                        }))
                      }
                      min="1"
                      max="168"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-6">
                    <div className="space-y-0.5">
                      <Label>Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">
                        Track all administrative actions
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.enableAuditLog}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, enableAuditLog: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Button onClick={handleSaveSecuritySettings} disabled={isSaving}>
              <Lock className="w-4 h-4 mr-2" />
              {saveSecurityMutation.isPending ? "Saving..." : "Save Security Settings"}
            </Button>
          </TabsContent>
          
          <TabsContent value="monitoring" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Security Events</h3>
              <Button variant="outline" size="sm">
                Export Logs
              </Button>
            </div>
            
            <div className="space-y-3">
              {securityLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getActionIcon(log.type)}
                        <div>
                          <p className="font-medium text-sm text-foreground">{log.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {log.user} • {log.timestamp} • IP: {log.ipAddress}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(log.status)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="limits" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rate Limiting Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Configure limits to prevent abuse and ensure fair usage
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiRequests">API Requests per Minute</Label>
                  <Input
                    id="apiRequests"
                    type="number"
                    value={rateLimitSettings.apiRequestsPerMinute}
                    onChange={(e) => 
                      setRateLimitSettings(prev => ({ 
                        ...prev, 
                        apiRequestsPerMinute: parseInt(e.target.value) || 100 
                      }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="loginAttempts">Login Attempts per Hour</Label>
                  <Input
                    id="loginAttempts"
                    type="number"
                    value={rateLimitSettings.loginAttemptsPerHour}
                    onChange={(e) => 
                      setRateLimitSettings(prev => ({ 
                        ...prev, 
                        loginAttemptsPerHour: parseInt(e.target.value) || 10 
                      }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signupAttempts">Signup Attempts per Hour</Label>
                  <Input
                    id="signupAttempts"
                    type="number"
                    value={rateLimitSettings.signupAttemptsPerHour}
                    onChange={(e) => 
                      setRateLimitSettings(prev => ({ 
                        ...prev, 
                        signupAttemptsPerHour: parseInt(e.target.value) || 5 
                      }))
                    }
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resumeDownloads">Resume Downloads per Hour</Label>
                  <Input
                    id="resumeDownloads"
                    type="number"
                    value={rateLimitSettings.resumeDownloadsPerHour}
                    onChange={(e) => 
                      setRateLimitSettings(prev => ({ 
                        ...prev, 
                        resumeDownloadsPerHour: parseInt(e.target.value) || 20 
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            
            <Button onClick={handleSaveRateLimits} disabled={isSaving}>
              <Settings className="w-4 h-4 mr-2" />
              {saveRateLimitMutation.isPending ? "Saving..." : "Save Rate Limits"}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
