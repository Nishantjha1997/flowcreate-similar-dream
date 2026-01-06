# ⚡ Edge Functions

## Overview
Supabase Edge Functions provide serverless backend logic. Written in TypeScript/Deno.

## Location
`supabase/functions/`

## Deployed Functions

### 1. admin-create-user
**Path**: `/supabase/functions/admin-create-user/index.ts`
**Purpose**: Allow admins to create new users

**Request**:
```typescript
POST /functions/v1/admin-create-user
{
  email: string;
  password: string;
  role?: 'admin' | 'moderator' | 'user';
}
```

### 2. create-razorpay-order
**Path**: `/supabase/functions/create-razorpay-order/index.ts`
**Purpose**: Create Razorpay payment order for subscriptions

**Request**:
```typescript
POST /functions/v1/create-razorpay-order
{
  amount: number;
  plan_type: string;
}
```

**Response**:
```typescript
{
  order_id: string;
  amount: number;
  currency: string;
}
```

### 3. verify-razorpay-payment
**Path**: `/supabase/functions/verify-razorpay-payment/index.ts`
**Purpose**: Verify Razorpay payment and activate subscription

**Request**:
```typescript
POST /functions/v1/verify-razorpay-payment
{
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan_type: string;
}
```

### 4. extract-resume-data
**Path**: `/supabase/functions/extract-resume-data/index.ts`
**Purpose**: Parse PDF resume and extract structured data using AI

**Request**:
```typescript
POST /functions/v1/extract-resume-data
Content-Type: multipart/form-data
{
  file: File (PDF)
}
```

**Response**:
```typescript
{
  personal: { name, email, phone, ... };
  experience: [...];
  education: [...];
  skills: [...];
}
```

**Dependencies**:
- Requires `GEMINI_API_KEY` secret
- Uses Gemini AI for parsing

### 5. gemini-suggest
**Path**: `/supabase/functions/gemini-suggest/index.ts`
**Purpose**: Generate AI suggestions for resume content

**Request**:
```typescript
POST /functions/v1/gemini-suggest
{
  type: 'summary' | 'experience' | 'skills';
  context: {
    currentContent?: string;
    jobTitle?: string;
    industry?: string;
  };
}
```

**Response**:
```typescript
{
  suggestion: string;
}
```

## Shared Utilities

### AI Key Manager
**Path**: `/supabase/functions/_shared/aiKeyManager.ts`

Manages multiple AI API keys with rotation:
```typescript
export async function getActiveAIKey(provider: string): Promise<string>;
export async function recordKeyUsage(keyId: string): Promise<void>;
```

## Required Secrets

| Secret Name | Purpose |
|-------------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations |
| `RAZORPAY_KEY_ID` | Razorpay public key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `GEMINI_API_KEY` | Google Gemini AI |
| `OPENAI_API_KEY` | OpenAI (optional fallback) |

## Calling Edge Functions from Frontend

```typescript
import { supabase } from '@/integrations/supabase/client';

// With authentication
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { /* request body */ }
});

// Handle response
if (error) {
  console.error('Function error:', error);
} else {
  console.log('Response:', data);
}
```

## CORS Configuration
Edge functions include CORS headers for browser requests:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

## Error Handling Pattern
```typescript
try {
  // Function logic
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
} catch (error) {
  return new Response(JSON.stringify({ error: error.message }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 500,
  });
}
```

## Deployment
Edge functions are automatically deployed when code is pushed. No manual deployment needed in Lovable.

## Local Development
```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve

# Test function
curl -X POST http://localhost:54321/functions/v1/function-name \
  -H "Authorization: Bearer <anon_key>" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```
