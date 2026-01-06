# 💳 Payment System

## Overview
Premium subscriptions are handled via Razorpay (Indian payment gateway).

## Integration Components

### RazorpayProvider
**Location**: `src/components/RazorpayProvider.tsx`

Loads Razorpay checkout script and provides context.
```typescript
<RazorpayProvider>
  {/* App content */}
</RazorpayProvider>
```

### useRazorpayPayment Hook
**Location**: `src/hooks/useRazorpayPayment.tsx`

```typescript
const { initiatePayment, isLoading } = useRazorpayPayment();

// Initiate payment
await initiatePayment({
  planType: 'premium',
  amount: 499, // in INR
  onSuccess: () => { /* handle success */ },
  onError: (error) => { /* handle error */ },
});
```

## Payment Flow

```
1. User clicks "Upgrade to Premium"
          ↓
2. Frontend calls create-razorpay-order edge function
          ↓
3. Edge function creates order with Razorpay API
          ↓
4. Frontend opens Razorpay checkout modal
          ↓
5. User completes payment
          ↓
6. Frontend receives payment confirmation
          ↓
7. Frontend calls verify-razorpay-payment edge function
          ↓
8. Edge function verifies signature with Razorpay
          ↓
9. Edge function updates subscription in database
          ↓
10. User gains premium access
```

## Edge Functions

### create-razorpay-order
Creates a Razorpay order for payment.

**Secrets Required**:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

### verify-razorpay-payment
Verifies payment signature and activates subscription.

**Actions**:
1. Verify Razorpay signature
2. Create/update subscription record
3. Create payment record
4. Return success status

## Database Tables

### subscriptions
```sql
- user_id: UUID
- is_premium: BOOLEAN
- plan_type: TEXT ('monthly', 'yearly')
- status: TEXT ('active', 'cancelled', 'expired')
- current_period_start: TIMESTAMP
- current_period_end: TIMESTAMP
- razorpay_customer_id: TEXT
- razorpay_payment_id: TEXT
```

### payments
```sql
- user_id: UUID
- subscription_id: UUID
- razorpay_order_id: TEXT
- razorpay_payment_id: TEXT
- amount: NUMERIC
- currency: TEXT (default 'INR')
- status: TEXT ('success', 'failed', 'pending')
```

## Premium Status Check

### usePremiumStatus Hook
```typescript
const { isPremium, loading, subscription } = usePremiumStatus();

if (isPremium) {
  // Show premium features
} else {
  // Show upgrade prompt
}
```

## Premium Features

Features gated behind premium:
1. Premium resume templates
2. Unlimited resume exports
3. AI-powered suggestions
4. Advanced customization options
5. Remove watermark (if applicable)

## UI Components

### PremiumUpgradeButton
**Location**: `src/components/PremiumUpgradeButton.tsx`

Displays upgrade CTA and handles payment flow.

### Pricing Page
**Location**: `src/pages/Pricing.tsx`

Shows pricing plans with features comparison.

## Testing

### Test Mode
Razorpay supports test mode for development:
- Use test API keys
- Test card: 4111 1111 1111 1111
- Any future expiry and CVV

### Environment Variables
```
RAZORPAY_KEY_ID=rzp_test_xxxxx (test) or rzp_live_xxxxx (production)
RAZORPAY_KEY_SECRET=xxxxx
```
