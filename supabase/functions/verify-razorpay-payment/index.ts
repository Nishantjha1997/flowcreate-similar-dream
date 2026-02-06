
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Server-side pricing constants (amounts in paise) - must match create-razorpay-order
const PLAN_PRICES: Record<string, number> = {
  monthly: 29900,
  yearly: 249900,
  lifetime: 499900,
} as const;

function validatePaymentInput(body: unknown): { valid: true; data: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string } } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body as Record<string, unknown>;

  if (typeof razorpay_payment_id !== 'string' || !/^pay_[a-zA-Z0-9]+$/.test(razorpay_payment_id)) {
    return { valid: false, error: 'Invalid payment ID format' };
  }
  if (typeof razorpay_order_id !== 'string' || !/^order_[a-zA-Z0-9]+$/.test(razorpay_order_id)) {
    return { valid: false, error: 'Invalid order ID format' };
  }
  if (typeof razorpay_signature !== 'string' || !/^[a-f0-9]{64}$/.test(razorpay_signature)) {
    return { valid: false, error: 'Invalid signature format' };
  }
  return { valid: true, data: { razorpay_payment_id, razorpay_order_id, razorpay_signature } };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const validation = validatePaymentInput(body)
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = validation.data

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpayKeySecret) {
      console.error('Razorpay secret not configured')
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Verify signature using Web Crypto API
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(razorpayKeySecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    )
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`))
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    
    if (expectedSignature !== razorpay_signature) {
      console.error('Payment verification failed - signature mismatch')
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Derive caller from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 })
    }
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabase.auth.getUser(token)
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 })
    }
    const callerUserId = userData.user.id

    // Rate limit: 10 verification attempts per user per 5 minutes
    const rl = checkRateLimit(`verify-payment:${callerUserId}`, 10, 5 * 60_000);
    if (!rl.allowed) {
      return rateLimitResponse(corsHeaders, rl.resetAt);
    }

    // Get payment and order details from Razorpay
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    
    const [paymentResponse, orderResponse] = await Promise.all([
      fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      }),
      fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
        headers: { 'Authorization': `Basic ${auth}` }
      })
    ])

    if (!paymentResponse.ok || !orderResponse.ok) {
      console.error('Failed to fetch payment/order details from Razorpay')
      return new Response(
        JSON.stringify({ error: 'Failed to verify payment details' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const paymentData = await paymentResponse.json()
    const orderData = await orderResponse.json()

    // Security checks
    if (paymentData.status !== 'captured') {
      return new Response(JSON.stringify({ error: 'Payment not captured' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
    }
    if (paymentData.order_id !== razorpay_order_id) {
      return new Response(JSON.stringify({ error: 'Payment/order mismatch' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 })
    }
    if ((orderData?.notes?.user_id || '') !== callerUserId) {
      return new Response(JSON.stringify({ error: 'Order not owned by caller' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 })
    }

    // Derive plan type from order notes (server-side truth)
    const effectivePlanType = orderData?.notes?.plan_type || 'monthly'

    // Validate payment amount matches expected plan price
    const expectedAmount = PLAN_PRICES[effectivePlanType]
    if (!expectedAmount || paymentData.amount !== expectedAmount) {
      console.error(`Amount mismatch: paid ${paymentData.amount}, expected ${expectedAmount} for plan ${effectivePlanType}`)
      return new Response(
        JSON.stringify({ error: 'Payment amount does not match plan price' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Calculate subscription period
    const currentDate = new Date()
    const endDate = new Date()
    if (effectivePlanType === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else if (effectivePlanType === 'lifetime') {
      endDate.setFullYear(endDate.getFullYear() + 100)
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Update or create subscription record
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: callerUserId,
        is_premium: true,
        plan_type: effectivePlanType,
        razorpay_customer_id: paymentData.customer_id,
        status: 'active',
        current_period_start: currentDate.toISOString(),
        current_period_end: endDate.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (subscriptionError) {
      console.error('Subscription update error:', subscriptionError)
      return new Response(
        JSON.stringify({ error: 'Failed to update subscription' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Record payment (idempotent on razorpay_payment_id)
    const { error: paymentError } = await supabase
      .from('payments')
      .upsert({
        user_id: callerUserId,
        subscription_id: subscription.id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        payment_method: paymentData.method
      }, { onConflict: 'razorpay_payment_id' })

    if (paymentError) {
      console.error('Payment record error:', paymentError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified and subscription updated' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
