
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit, rateLimitResponse } from '../_shared/rateLimiter.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const VALID_ROLES = ['admin', 'moderator', 'user'] as const;

function validateCreateUserInput(body: unknown): { valid: true; data: { email: string; password: string; firstName: string; lastName: string; role: string; isPremium: boolean } } | { valid: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  const { email, password, firstName, lastName, role, isPremium } = body as Record<string, unknown>;

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 100) {
    return { valid: false, error: 'Password must be 8-100 characters' };
  }
  if (typeof firstName !== 'string' || firstName.length < 1 || firstName.length > 50 || !/^[a-zA-Z\s'\-]+$/.test(firstName)) {
    return { valid: false, error: 'Invalid first name (1-50 chars, letters only)' };
  }
  if (typeof lastName !== 'string' || lastName.length < 1 || lastName.length > 50 || !/^[a-zA-Z\s'\-]+$/.test(lastName)) {
    return { valid: false, error: 'Invalid last name (1-50 chars, letters only)' };
  }
  if (typeof role !== 'string' || !VALID_ROLES.includes(role as typeof VALID_ROLES[number])) {
    return { valid: false, error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` };
  }
  if (typeof isPremium !== 'boolean') {
    return { valid: false, error: 'isPremium must be a boolean' };
  }

  return { valid: true, data: { email: email.trim(), password, firstName: firstName.trim(), lastName: lastName.trim(), role, isPremium } };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user is admin
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!userRole) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Rate limit: 10 user creations per admin per hour
    const rl = checkRateLimit(`admin-create-user:${user.id}`, 10, 60 * 60_000);
    if (!rl.allowed) {
      return rateLimitResponse(corsHeaders, rl.resetAt);
    }

    // Validate input
    const body = await req.json()
    const validation = validateCreateUserInput(body)
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    const { email, password, firstName, lastName, role, isPremium } = validation.data

    // Create user using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      },
      email_confirm: true
    })

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (authData.user) {
      // Add role if not default user
      if (role !== "user") {
        await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: role
          })
      }

      // Add premium subscription if selected
      if (isPremium) {
        await supabaseAdmin
          .from("subscriptions")
          .insert({
            user_id: authData.user.id,
            is_premium: true
          })
      }

      return new Response(JSON.stringify({ 
        success: true, 
        user: { id: authData.user.id, email: authData.user.email }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Failed to create user' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
