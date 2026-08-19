import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePaymentGatewayKeys, type PaymentGatewayKey } from '@/hooks/usePaymentGatewayKeys';
import {
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Save,
} from 'lucide-react';

const providerConfig = {
  razorpay: {
    name: 'Razorpay',
    icon: '💳',
    idLabel: 'Key ID',
    idPlaceholder: 'rzp_test_... or rzp_live_...',
    secretLabel: 'Key Secret',
    secretPlaceholder: 'Your Razorpay key secret',
    webhookLabel: 'Webhook Secret',
    webhookPlaceholder: 'From Razorpay Dashboard > Webhooks',
  },
  stripe: {
    name: 'Stripe',
    icon: '💰',
    idLabel: 'Publishable Key',
    idPlaceholder: 'pk_test_... or pk_live_...',
    secretLabel: 'Secret Key',
    secretPlaceholder: 'sk_test_... or sk_live_...',
    webhookLabel: 'Webhook Signing Secret',
    webhookPlaceholder: 'whsec_...',
  },
} as const;

function maskSecret(value: string | null) {
  if (!value) return '';
  if (value.length <= 8) return '••••••••';
  return value.substring(0, 4) + '•'.repeat(Math.max(4, value.length - 8)) + value.substring(value.length - 4);
}

function GatewayCard({
  provider,
  existing,
  onSave,
  isSaving,
  onToggleActive,
  onDelete,
  isDeleting,
}: {
  provider: 'razorpay' | 'stripe';
  existing?: PaymentGatewayKey;
  onSave: (input: { provider: 'razorpay' | 'stripe'; key_id?: string; key_secret?: string; webhook_secret?: string; is_live: boolean }) => void;
  isSaving: boolean;
  onToggleActive: (input: { id: string; is_active: boolean }) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const config = providerConfig[provider];
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isLive, setIsLive] = useState(existing?.is_live ?? false);
  const [showSecret, setShowSecret] = useState(false);

  // The card mounts before the async gateway query resolves. Keep the toggle
  // in sync when the existing record arrives or changes after a save.
  useEffect(() => {
    setIsLive(existing?.is_live ?? false);
  }, [existing?.id, existing?.is_live]);

  const handleSave = () => {
    onSave({
      provider,
      key_id: keyId || undefined,
      // Blank secrets intentionally mean "keep the server-side value". Never
      // send the masked placeholder back to the Edge Function.
      key_secret: keySecret || undefined,
      webhook_secret: webhookSecret || undefined,
      is_live: isLive,
    });
    setKeySecret('');
    setWebhookSecret('');
  };

  return (
    <Card className={`border-l-4 ${existing?.is_active ? 'border-l-green-500' : 'border-l-muted'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            {config.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {existing?.is_live ? (
              <Badge variant="destructive" className="text-xs">Live mode</Badge>
            ) : (
              <Badge variant="outline" className="text-xs">Test mode</Badge>
            )}
            {existing ? (
              existing.is_active ? (
                <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                  <CheckCircle className="w-3 h-3 mr-1" />Configured
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                  <AlertCircle className="w-3 h-3 mr-1" />Disabled
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="text-xs">Not configured</Badge>
            )}
          </div>
        </div>
        <CardDescription>
          {existing
            ? 'Update credentials below. Leave a field blank to keep its current value.'
            : `Add your ${config.name} credentials to enable payments without redeploying edge functions.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {existing?.key_id && (
          <div className="text-sm text-muted-foreground">
            Current {config.idLabel}: <code className="bg-muted px-2 py-1 rounded text-xs">{existing.key_id}</code>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{config.idLabel}</Label>
            <Input
              placeholder={config.idPlaceholder}
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
            />
          </div>
          <div>
            <Label>{config.secretLabel}</Label>
            <div className="flex items-center gap-2">
              <Input
                type={showSecret ? 'text' : 'password'}
                placeholder={existing?.key_secret ? maskSecret(existing.key_secret) : config.secretPlaceholder}
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
              />
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={() => setShowSecret((s) => !s)}>
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
        <div>
          <Label>{config.webhookLabel} (optional)</Label>
          <Input
            type={showSecret ? 'text' : 'password'}
            placeholder={existing?.webhook_secret ? maskSecret(existing.webhook_secret) : config.webhookPlaceholder}
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Live mode (uncheck for test keys)</span>
          <input
            type="checkbox"
            checked={isLive}
            onChange={(e) => setIsLive(e.target.checked)}
            className="rounded scale-125"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save {config.name} Keys
          </Button>
          {existing && (
            <>
              <Button
                variant="outline"
                onClick={() => onToggleActive({ id: existing.id, is_active: !existing.is_active })}
              >
                {existing.is_active ? 'Disable' : 'Enable'}
              </Button>
              <Button variant="destructive" size="sm" disabled={isDeleting} onClick={() => onDelete(existing.id)}>
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentGatewayManagement() {
  const { gatewayKeys, isLoading, error, refetch, saveKey, toggleActive, deleteKey, isSaving, isDeleting } = usePaymentGatewayKeys();

  const razorpay = gatewayKeys.find((k) => k.provider === 'razorpay');
  const stripe = gatewayKeys.find((k) => k.provider === 'stripe');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Payment settings could not be loaded</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{error instanceof Error ? error.message : 'The secure payment settings service is unavailable.'}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
              <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6" />
          Payment Gateway Management
        </h2>
        <p className="text-muted-foreground">
          Configure Razorpay and Stripe credentials here instead of setting edge function
          secrets manually. Changes take effect immediately - no redeploy needed.
        </p>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            If you don't set keys here, the payment functions fall back to the
            <code className="mx-1 bg-background px-1.5 py-0.5 rounded">RAZORPAY_KEY_ID</code> /
            <code className="mx-1 bg-background px-1.5 py-0.5 rounded">RAZORPAY_KEY_SECRET</code> /
            <code className="mx-1 bg-background px-1.5 py-0.5 rounded">STRIPE_SECRET_KEY</code> edge function
            secrets if those were set instead.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GatewayCard
          provider="razorpay"
          existing={razorpay}
          onSave={saveKey}
          isSaving={isSaving}
          onToggleActive={toggleActive}
          onDelete={deleteKey}
          isDeleting={isDeleting}
        />
        <GatewayCard
          provider="stripe"
          existing={stripe}
          onSave={saveKey}
          isSaving={isSaving}
          onToggleActive={toggleActive}
          onDelete={deleteKey}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
