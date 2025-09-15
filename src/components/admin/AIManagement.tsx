import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
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
  Zap
} from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  provider: 'openai' | 'gemini' | 'deepseek';
  key: string;
  is_active: boolean;
  is_primary: boolean;
  is_fallback: boolean;
  created_at: string;
  usage_count: number;
  last_used: string | null;
}

interface TokenUsage {
  provider: string;
  total_tokens: number;
  tokens_today: number;
  tokens_this_month: number;
  cost_estimate: number;
}

const providerConfig = {
  openai: { name: 'OpenAI', color: 'bg-green-500', icon: '🤖' },
  gemini: { name: 'Google Gemini', color: 'bg-blue-500', icon: '💎' },
  deepseek: { name: 'DeepSeek', color: 'bg-purple-500', icon: '🧠' }
};

export function AIManagement() {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [newKey, setNewKey] = useState({ provider: '', name: '', key: '' });
  const [editingKey, setEditingKey] = useState<APIKey | null>(null);

  useEffect(() => {
    fetchAPIKeys();
    fetchTokenUsage();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_api_keys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: "Error",
        description: "Failed to fetch API keys",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_token_usage')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokenUsage(data || []);
    } catch (error) {
      console.error('Error fetching token usage:', error);
    }
  };

  const addAPIKey = async () => {
    if (!newKey.provider || !newKey.name || !newKey.key) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('ai_api_keys')
        .insert([{
          name: newKey.name,
          provider: newKey.provider,
          key: newKey.key,
          is_active: true,
          is_primary: apiKeys.length === 0,
          is_fallback: false
        }]);

      if (error) throw error;

      setNewKey({ provider: '', name: '', key: '' });
      fetchAPIKeys();
      toast({
        title: "Success",
        description: "API key added successfully"
      });
    } catch (error) {
      console.error('Error adding API key:', error);
      toast({
        title: "Error",
        description: "Failed to add API key",
        variant: "destructive"
      });
    }
  };

  const updateAPIKey = async (id: string, updates: Partial<APIKey>) => {
    try {
      const { error } = await supabase
        .from('ai_api_keys')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      fetchAPIKeys();
      toast({
        title: "Success",
        description: "API key updated successfully"
      });
    } catch (error) {
      console.error('Error updating API key:', error);
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive"
      });
    }
  };

  const deleteAPIKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_api_keys')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchAPIKeys();
      toast({
        title: "Success",
        description: "API key deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive"
      });
    }
  };

  const setPrimary = async (id: string) => {
    try {
      // First, remove primary status from all keys
      await supabase
        .from('ai_api_keys')
        .update({ is_primary: false })
        .neq('id', '');

      // Then set the selected key as primary
      await updateAPIKey(id, { is_primary: true, is_active: true });
    } catch (error) {
      console.error('Error setting primary key:', error);
    }
  };

  const setFallback = async (id: string) => {
    try {
      // First, remove fallback status from all keys
      await supabase
        .from('ai_api_keys')
        .update({ is_fallback: false })
        .neq('id', '');

      // Then set the selected key as fallback
      await updateAPIKey(id, { is_fallback: true, is_active: true });
    } catch (error) {
      console.error('Error setting fallback key:', error);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '***';
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  if (loading) {
    return <div className="text-center py-8">Loading AI management...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI API Management</h2>
          <p className="text-muted-foreground">
            Manage API keys for AI features across the platform
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {apiKeys.filter(k => k.is_active).length} Active Keys
        </Badge>
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
              <Button onClick={addAPIKey} className="w-full">
                Add API Key
              </Button>
            </CardContent>
          </Card>

          {/* Existing Keys */}
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <Card key={key.id} className={`border-l-4 ${key.is_primary ? 'border-l-green-500' : key.is_fallback ? 'border-l-orange-500' : 'border-l-gray-300'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${providerConfig[key.provider].color}`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{key.name}</h3>
                          {key.is_primary && <Badge variant="default" className="text-xs"><Star className="w-3 h-3 mr-1" />Primary</Badge>}
                          {key.is_fallback && <Badge variant="secondary" className="text-xs"><Shield className="w-3 h-3 mr-1" />Fallback</Badge>}
                          {key.is_active ? (
                            <Badge variant="outline" className="text-xs text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-red-600"><AlertCircle className="w-3 h-3 mr-1" />Inactive</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {providerConfig[key.provider].name} • Used {key.usage_count} times
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {showKey[key.id] ? key.key : maskKey(key.key)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showKey[key.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPrimary(key.id)}
                        disabled={key.is_primary}
                      >
                        Set Primary
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFallback(key.id)}
                        disabled={key.is_fallback}
                      >
                        Set Fallback
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAPIKey(key.id, { is_active: !key.is_active })}
                      >
                        {key.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{key.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteAPIKey(key.id)}>
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
              <Card key={usage.provider}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <span className="mr-2">{providerConfig[usage.provider as keyof typeof providerConfig]?.icon}</span>
                    {providerConfig[usage.provider as keyof typeof providerConfig]?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Today</span>
                      <span className="font-medium">{usage.tokens_today.toLocaleString()} tokens</span>
                    </div>
                    <Progress value={(usage.tokens_today / 10000) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>This Month</span>
                      <span className="font-medium">{usage.tokens_this_month.toLocaleString()} tokens</span>
                    </div>
                    <Progress value={(usage.tokens_this_month / 100000) * 100} className="h-2" />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Total Usage</span>
                      <span className="font-bold">{usage.total_tokens.toLocaleString()} tokens</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Est. Cost</span>
                      <span>${usage.cost_estimate.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Auto Fallback</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically switch to fallback API when primary fails
                </p>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">Enable auto fallback</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rate Limiting</Label>
                <p className="text-sm text-muted-foreground">
                  Limit API requests per user to manage costs
                </p>
                <Input placeholder="100" type="number" />
                <p className="text-xs text-muted-foreground">Requests per hour per user</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
