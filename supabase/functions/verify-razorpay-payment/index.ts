
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hmac } from "https://deno.land/x/hmac@v2.0.1/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, planType } = await req.json()

    console.log('Payment verification request:', { razorpay_payment_id, razorpay_order_id, planType })

    // Validate input
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error('Missing required parameters')
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpayKeySecret) {
      console.error('Razorpay secret not configured')
      return new Response(
        JSON.stringify({ error: 'Razorpay secret not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Verify signature
    const expectedSignature = hmac("sha256", razorpayKeySecret, `${razorpay_order_id}|${razorpay_payment_id}`, "utf8", "hex")
    
    if (expectedSignature !== razorpay_signature) {
      console.error('Payment verification failed - signature mismatch')
      return new Response(
        JSON.stringify({ error: 'Payment verification failed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log('Payment signature verified successfully')

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Derive caller from Authorization header (do not trust client body)
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

    // Get payment details from Razorpay
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    })

    if (!paymentResponse.ok) {
      console.error('Failed to fetch payment details from Razorpay')
      return new Response(
        JSON.stringify({ error: 'Failed to fetch payment details' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    const paymentData = await paymentResponse.json()
    console.log('Payment data from Razorpay:', paymentData)

    // Fetch order details to bind to user and plan
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      headers: { 'Authorization': `Basic ${auth}` }
    })
    if (!orderResponse.ok) {
      console.error('Failed to fetch order details from Razorpay')
      return new Response(JSON.stringify({ error: 'Failed to fetch order details' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
    }
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

    const effectivePlanType = orderData?.notes?.plan_type || planType || 'monthly'

    // Calculate subscription period based on effective plan type
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
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    console.log('Subscription updated successfully:', subscription)

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
      // Don't fail the entire process if payment recording fails
    }

    console.log('Payment verification completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified and subscription updated' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
