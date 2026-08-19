// Deterministic payment-flow guards. These checks keep a successful Razorpay
// callback from granting access when its financial ledger write fails.
import { readFileSync } from 'node:fs';

const verifyPayment = readFileSync(new URL('../supabase/functions/verify-razorpay-payment/index.ts', import.meta.url), 'utf8');
const verifySubscription = readFileSync(new URL('../supabase/functions/verify-razorpay-subscription/index.ts', import.meta.url), 'utf8');
const stripeWebhook = readFileSync(new URL('../supabase/functions/stripe-webhook/index.ts', import.meta.url), 'utf8');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  /if \(paymentError\)\s*\{[\s\S]{0,500}return new Response/.test(verifyPayment),
  'one-time Razorpay verification must fail when the payment ledger write fails',
);
assert(
  verifyPayment.includes("onConflict: 'razorpay_payment_id'"),
  'one-time Razorpay verification must be idempotent by payment ID',
);
assert(
  verifySubscription.includes("onConflict: 'razorpay_payment_id'"),
  'recurring Razorpay verification must be idempotent by payment ID',
);
assert(
  verifySubscription.includes('razorpay_subscription_checkouts'),
  'recurring Razorpay verification must correlate to the server checkout ledger',
);
assert(
  (stripeWebhook.match(/if \(payError\) throw payError/g) || []).length >= 2,
  'Stripe webhook payment writes must fail the event so the provider retries safely',
);

console.log('payment flow smoke checks passed');
