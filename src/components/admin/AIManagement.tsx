import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAIApiKeys } from '@/hooks/useAIApiKeys';
import {
  Key,
  Plus,
  Trash2,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Star,
  Activity,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Shield,
  Wifi,
  WifiOff,
} from 'lucide-react';

const providerConfig = {
  openai: { name: 'OpenAI', color: 'bg-green-500', icon: '🤖', bgClass: 'bg-green-50 dark:bg-green-950', textClass: 'text-green-700 dark:text-green-300' },
  gemini: { name: 'Google Gemini', color: 'bg-blue-500', icon: '💎', bgClass: 'bg-blue-50 dark:bg-blue-950', textClass: 'text-blue-700 dark:text-blue-300' },
  deepseek: { name: 'DeepSeek', color: 'bg-purple-500', icon: '🧠', bgClass: 'bg-purple-50 dark:bg-purple-950', textClass: 'text-purple-700 dark:text-purple-300' },
};

export function AIManagement() {
  const {
    apiKeys,
    tokenUsage,
    isLoading,
    isLoadingUsage,
    error,
    refetch,
    addAPIKey,
    updateAPIKey,
    deleteAPIKey,
    setPrimary,
    setFallback,
    isAdding,
    isUpdating,
    isDeleting,
    isSettingPrimary,
    isSettingFallback,
    testAPIKey,
    testDraftKey,
    testingId,
    testStatuses,
    draftTestStatus,
    isTestingDraft,
  } = useAIApiKeys();

  const [newKey, setNewKey] = useState({ provider: '', name: '', key: '' });

  const handleAddAPIKey = async () => {
    if (!newKey.provider || !newKey.name || !newKey.key) return;
    addAPIKey(newKey);
    setNewKey({ provider: '', name: '', key: '' });
  };

  const handleTestDraft = () => {
    if (!newKey.provider || !newKey.key) return;
    testDraftKey(newKey.provider, newKey.key);
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
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>AI provider settings could not be loaded</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{error instanceof Error ? error.message : 'The secure provider service is unavailable.'}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI API Management
          </h2>
          <p className="text-muted-foreground">Manage API keys for AI features across the platform</p>
          <p className="text-sm text-muted-foreground mt-1">
            Keys added here power AI suggestions and PDF resume import. Scanned/image PDFs require a Gemini key.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="usage">Token Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="space-y-6">
          {/* Add New Key */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add New API Key
                </div>
                {draftTestStatus === 'success' && (
                  <Badge variant="outline" className="text-xs text-green-600 border-green-400 bg-green-50 dark:bg-green-950/30">
                    <Wifi className="w-3 h-3 mr-1" />Verified Connection OK
                  </Badge>
                )}
                {draftTestStatus === 'error' && (
                  <Badge variant="outline" className="text-xs text-red-600 border-red-400 bg-red-50 dark:bg-red-950/30">
                    <WifiOff className="w-3 h-3 mr-1" />Verification Failed
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Provider</Label>
                  <Select value={newKey.provider} onValueChange={(value) => setNewKey({ ...newKey, provider: value })}>
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
                    placeholder="e.g., Primary DeepSeek Key"
                    value={newKey.name}
                    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={newKey.key}
                    onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestDraft}
                  disabled={isTestingDraft || !newKey.provider || !newKey.key}
                  className={`flex-1 sm:flex-initial flex items-center justify-center transition-colors ${
                    draftTestStatus === 'success'
                      ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30 hover:bg-green-100'
                      : draftTestStatus === 'error'
                      ? 'border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100'
                      : ''
                  }`}
                >
                  {isTestingDraft ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Verifying Connection...</>
                  ) : draftTestStatus === 'success' ? (
                    <><Wifi className="w-4 h-4 mr-2 text-green-500" />Connection Verified ✓</>
                  ) : draftTestStatus === 'error' ? (
                    <><WifiOff className="w-4 h-4 mr-2 text-red-500" />Retry Test ✗</>
                  ) : (
                    <><Activity className="w-4 h-4 mr-2" />Test Connection (Connector)</>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleAddAPIKey}
                  disabled={isAdding || !newKey.provider || !newKey.name || !newKey.key}
                  className="flex-1"
                >
                  {isAdding ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Adding Key...</>
                  ) : (
                    <><Plus className="w-4 h-4 mr-2" />Save & Add API Key</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Keys */}
          <div className="space-y-4">
            {apiKeys.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Key className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No API Keys Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first API key above to enable AI features across the platform
                  </p>
                </CardContent>
              </Card>
            ) : (
              apiKeys.map((key) => {
                const testStatus = testStatuses[key.id] ?? 'idle';
                const isBusy = testingId === key.id;
                const isAnyTesting = testingId !== null;

                return (
                  <Card key={key.id} className={`border-l-4 transition-all hover:shadow-md ${
                    key.is_primary ? 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20' :
                    key.is_fallback ? 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20' :
                    'border-l-muted'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className={`w-12 h-12 rounded-lg ${providerConfig[key.provider as keyof typeof providerConfig]?.bgClass || 'bg-gray-100'} flex items-center justify-center text-2xl`}>
                            {providerConfig[key.provider as keyof typeof providerConfig]?.icon || '🤖'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="min-w-0 break-words font-semibold text-lg">{key.name}</h3>
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
                              {/* Live test status badge */}
                              {testStatus === 'success' && (
                                <Badge variant="outline" className="text-xs text-green-600 border-green-400 bg-green-50 dark:bg-green-950/30">
                                  <Wifi className="w-3 h-3 mr-1" />Connected
                                </Badge>
                              )}
                              {testStatus === 'error' && (
                                <Badge variant="outline" className="text-xs text-red-600 border-red-400 bg-red-50 dark:bg-red-950/30">
                                  <WifiOff className="w-3 h-3 mr-1" />Test Failed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {providerConfig[key.provider as keyof typeof providerConfig]?.name || key.provider} • Used {key.usage_count} times
                            </p>
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <code className="max-w-full break-all rounded-md bg-muted px-3 py-2 text-xs font-mono">
                                {key.key}
                              </code>
                              <Badge variant="outline" className="text-[10px]">Stored securely</Badge>
                            </div>
                            {key.last_used && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Last used: {new Date(key.last_used).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
                          {/* Test Connection / Connector */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testAPIKey(key.id)}
                            disabled={!key.is_active || isAnyTesting}
                            className={`flex items-center transition-colors ${
                              testStatus === 'success'
                                ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/30 hover:bg-green-100'
                                : testStatus === 'error'
                                ? 'border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100'
                                : ''
                            }`}
                          >
                            {isBusy ? (
                              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                            ) : testStatus === 'success' ? (
                              <Wifi className="w-3 h-3 mr-1 text-green-500" />
                            ) : testStatus === 'error' ? (
                              <WifiOff className="w-3 h-3 mr-1 text-red-500" />
                            ) : (
                              <Activity className="w-3 h-3 mr-1" />
                            )}
                            {isBusy ? 'Testing...' : testStatus === 'success' ? 'Connected ✓' : testStatus === 'error' ? 'Failed ✗' : 'Test connection'}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPrimary(key.id)}
                            disabled={key.is_primary || isSettingPrimary}
                            className="flex items-center"
                          >
                            {isSettingPrimary ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Star className="w-3 h-3 mr-1" />}
                            Set Primary
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFallback(key.id)}
                            disabled={key.is_fallback || isSettingFallback}
                            className="flex items-center"
                          >
                            {isSettingFallback ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Shield className="w-3 h-3 mr-1" />}
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
                                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
                                <AlertDialogAction
                                  onClick={() => deleteAPIKey(key.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {apiKeys.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">How API Key Selection Works</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>Primary keys</strong> are used first for all AI requests</li>
                      <li>• <strong>Fallback keys</strong> are used automatically if the primary key fails</li>
                      <li>• Use <strong>Test connection</strong> to verify a key is valid before setting it as primary</li>
                      <li>• Changes take effect immediately — no page refresh needed</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
                    <Badge variant="outline" className="text-xs">Active</Badge>
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
      </Tabs>
    </div>
  );
}
