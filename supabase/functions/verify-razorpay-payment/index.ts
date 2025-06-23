
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
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, user_id, planType } = await req.json()

    console.log('Payment verification request:', { razorpay_payment_id, razorpay_order_id, user_id, planType })

    // Validate input
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !user_id) {
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

    // Calculate subscription period based on plan type
    const currentDate = new Date()
    const endDate = new Date()
    
    if (planType === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1)
    } else if (planType === 'lifetime') {
      endDate.setFullYear(endDate.getFullYear() + 100) // 100 years for lifetime
    } else {
      endDate.setMonth(endDate.getMonth() + 1)
    }

    // Update or create subscription record
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user_id,
        is_premium: true,
        plan_type: planType || 'monthly',
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

    // Record payment
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user_id,
        subscription_id: subscription.id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_order_id: razorpay_order_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.status,
        payment_method: paymentData.method
      })

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
