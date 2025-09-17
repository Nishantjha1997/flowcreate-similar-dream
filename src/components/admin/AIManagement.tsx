import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAIApiKeys } from '@/hooks/useAIApiKeys';
import { 
  Key, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Settings, 
  BarChart3, 
  CheckCircle, 
  AlertCircle,
  Star,
  Shield,
  Zap,
  Activity,
  DollarSign,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const providerConfig = {
  openai: { name: 'OpenAI', color: 'bg-green-500', icon: '🤖', bgClass: 'bg-green-50', textClass: 'text-green-700' },
  gemini: { name: 'Google Gemini', color: 'bg-blue-500', icon: '💎', bgClass: 'bg-blue-50', textClass: 'text-blue-700' },
  deepseek: { name: 'DeepSeek', color: 'bg-purple-500', icon: '🧠', bgClass: 'bg-purple-50', textClass: 'text-purple-700' }
};

export function AIManagement() {
  const {
    apiKeys,
    tokenUsage,
    isLoading,
    isLoadingUsage,
    addAPIKey,
    updateAPIKey,
    deleteAPIKey,
    setPrimary,
    setFallback,
    isAdding,
    isUpdating,
    isDeleting,
    isSettingPrimary,
    isSettingFallback
  } = useAIApiKeys();

  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [newKey, setNewKey] = useState({ provider: '', name: '', key: '' });

  const handleAddAPIKey = async () => {
    if (!newKey.provider || !newKey.name || !newKey.key) {
      return;
    }
    addAPIKey(newKey);
    setNewKey({ provider: '', name: '', key: '' });
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '***';
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  if (isLoading || isLoadingUsage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI API Management
          </h2>
          <p className="text-muted-foreground">
            Manage API keys for AI features across the platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-sm flex items-center">
            <Activity className="w-3 h-3 mr-1" />
            {apiKeys.filter(k => k.is_active).length} Active Keys
          </Badge>
          <Badge variant="secondary" className="text-sm flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {tokenUsage.reduce((sum, usage) => sum + usage.tokens_today, 0).toLocaleString()} tokens today
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Keys</p>
                <p className="text-2xl font-bold">{apiKeys.length}</p>
              </div>
              <Key className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Keys</p>
                <p className="text-2xl font-bold">{apiKeys.filter(k => k.is_active).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Usage</p>
                <p className="text-2xl font-bold">{tokenUsage.reduce((sum, usage) => sum + usage.tokens_today, 0).toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Est. Cost</p>
                <p className="text-2xl font-bold">${tokenUsage.reduce((sum, usage) => sum + usage.cost_estimate, 0).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Token Usage</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          {/* Add New Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add New API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Provider</Label>
                  <Select value={newKey.provider} onValueChange={(value) => setNewKey({...newKey, provider: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">🤖 OpenAI</SelectItem>
                      <SelectItem value="gemini">💎 Google Gemini</SelectItem>
                      <SelectItem value="deepseek">🧠 DeepSeek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Name</Label>
                  <Input
                    placeholder="e.g., Primary OpenAI Key"
                    value={newKey.name}
                    onChange={(e) => setNewKey({...newKey, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={newKey.key}
                    onChange={(e) => setNewKey({...newKey, key: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddAPIKey} disabled={isAdding} className="w-full">
                {isAdding ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add API Key
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Keys */}
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <Card key={key.id} className={`border-l-4 transition-all hover:shadow-md ${
                key.is_primary ? 'border-l-green-500 bg-green-50/50' : 
                key.is_fallback ? 'border-l-orange-500 bg-orange-50/50' : 
                'border-l-gray-300'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg ${providerConfig[key.provider as keyof typeof providerConfig]?.bgClass || 'bg-gray-100'} flex items-center justify-center text-2xl`}>
                        {providerConfig[key.provider as keyof typeof providerConfig]?.icon || '🤖'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{key.name}</h3>
                          {key.is_primary && (
                            <Badge variant="default" className="text-xs bg-green-500">
                              <Star className="w-3 h-3 mr-1" />Primary
                            </Badge>
                          )}
                          {key.is_fallback && (
                            <Badge variant="secondary" className="text-xs bg-orange-500 text-white">
                              <Shield className="w-3 h-3 mr-1" />Fallback
                            </Badge>
                          )}
                          {key.is_active ? (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" />Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                              <AlertCircle className="w-3 h-3 mr-1" />Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {providerConfig[key.provider as keyof typeof providerConfig]?.name || key.provider} • Used {key.usage_count} times
                        </p>
                        <div className="flex items-center space-x-2">
                          <code className="text-xs bg-muted px-3 py-2 rounded-md font-mono">
                            {showKey[key.id] ? key.key : maskKey(key.key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="h-8 w-8 p-0"
                          >
                            {showKey[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                        {key.last_used && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last used: {new Date(key.last_used).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimary(key.id)}
                        disabled={key.is_primary || isSettingPrimary}
                        className="flex items-center"
                      >
                        {isSettingPrimary ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Star className="w-3 h-3 mr-1" />
                        )}
                        Set Primary
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFallback(key.id)}
                        disabled={key.is_fallback || isSettingFallback}
                        className="flex items-center"
                      >
                        {isSettingFallback ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Shield className="w-3 h-3 mr-1" />
                        )}
                        Set Fallback
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAPIKey({ id: key.id, updates: { is_active: !key.is_active } })}
                        disabled={isUpdating}
                        className="flex items-center"
                      >
                        {isUpdating ? (
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        ) : key.is_active ? (
                          <AlertCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {key.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" disabled={isDeleting}>
                            {isDeleting ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{key.name}"? This action cannot be undone and may affect AI functionality.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteAPIKey(key.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tokenUsage.map((usage) => (
              <Card key={usage.provider} className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-16 h-16 ${providerConfig[usage.provider as keyof typeof providerConfig]?.bgClass || 'bg-gray-100'} opacity-20 transform translate-x-4 -translate-y-4 rotate-12`} />
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg ${providerConfig[usage.provider as keyof typeof providerConfig]?.bgClass || 'bg-gray-100'} flex items-center justify-center text-xl mr-3`}>
                        {providerConfig[usage.provider as keyof typeof providerConfig]?.icon}
                      </div>
                      {providerConfig[usage.provider as keyof typeof providerConfig]?.name}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Today</p>
                      <p className="text-lg font-bold">{usage.tokens_today.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">tokens</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">This Month</p>
                      <p className="text-lg font-bold">{usage.tokens_this_month.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">tokens</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Daily Usage</span>
                      <span className="font-medium">{((usage.tokens_today / 10000) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(usage.tokens_today / 10000) * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">Daily limit: 10,000 tokens</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Monthly Usage</span>
                      <span className="font-medium">{((usage.tokens_this_month / 100000) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(usage.tokens_this_month / 100000) * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground mt-1">Monthly limit: 100,000 tokens</p>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">Total Usage</p>
                        <p className="text-lg font-bold">{usage.total_tokens.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Est. Cost</p>
                        <p className="text-lg font-bold text-green-600">${usage.cost_estimate.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {tokenUsage.length === 0 && (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center space-y-4">
                <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                <div>
                  <h3 className="text-lg font-semibold">No Usage Data</h3>
                  <p className="text-muted-foreground">Token usage will appear here once API keys are used</p>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  AI Configuration
                </CardTitle>
                <CardDescription>
                  Configure global AI settings for all users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Auto Fallback</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically switch to fallback API when primary fails
                  </p>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Enable auto fallback</span>
                    <input type="checkbox" defaultChecked className="rounded scale-125" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">
                    Limit API requests per user to manage costs
                  </p>
                  <div className="space-y-2">
                    <Input placeholder="100" type="number" className="text-center" />
                    <p className="text-xs text-muted-foreground text-center">Requests per hour per user</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Model Selection</Label>
                  <p className="text-sm text-muted-foreground">
                    Default AI model for new requests
                  </p>
                  <Select defaultValue="gpt-4">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage API security and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Key Rotation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically rotate API keys for enhanced security
                  </p>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Auto-rotate keys (30 days)</span>
                    <input type="checkbox" className="rounded scale-125" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Usage Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when usage thresholds are exceeded
                  </p>
                  <div className="space-y-2">
                    <Input placeholder="80" type="number" className="text-center" />
                    <p className="text-xs text-muted-foreground text-center">Alert threshold (% of daily limit)</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Access Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all API key usage for audit purposes
                  </p>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Enable access logging</span>
                    <input type="checkbox" defaultChecked className="rounded scale-125" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Performance Optimization
              </CardTitle>
              <CardDescription>
                Configure AI performance and caching settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Response Caching</Label>
                  <p className="text-sm text-muted-foreground">
                    Cache similar requests to reduce API calls
                  </p>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Enable caching</span>
                    <input type="checkbox" defaultChecked className="rounded scale-125" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Request Timeout</Label>
                  <p className="text-sm text-muted-foreground">
                    Maximum wait time for API responses
                  </p>
                  <div className="space-y-2">
                    <Input placeholder="30" type="number" className="text-center" />
                    <p className="text-xs text-muted-foreground text-center">Seconds</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Retry Attempts</Label>
                  <p className="text-sm text-muted-foreground">
                    Number of retries for failed requests
                  </p>
                  <div className="space-y-2">
                    <Input placeholder="3" type="number" className="text-center" />
                    <p className="text-xs text-muted-foreground text-center">Attempts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
