import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(req) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')

  let evt

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    console.error('Secret exists:', !!process.env.CLERK_WEBHOOK_SECRET)
    console.error('Headers:', { svix_id, svix_timestamp, svix_signature })
    return new Response(JSON.stringify({ 
      error: 'Webhook verification failed',
      message: err.message 
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Handle the webhook events
  const eventType = evt.type
  
  if (eventType === 'user.created') {
    // User was created in Clerk, save to Supabase
    const { id, email_addresses, first_name, last_name, created_at, image_url, primary_email_address_id } = evt.data
    
    // Handle test webhooks that might not have email
    const email = email_addresses && email_addresses[0]?.email_address 
      ? email_addresses[0].email_address 
      : `${id}@placeholder.com`  // Fallback for test webhooks

    try {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('clerk_id', id)
        .single()

      if (!existingUser) {
        // Insert new user
        const { error } = await supabaseAdmin
          .from('users')
          .insert([
            {
              id: crypto.randomUUID(),  // Generate UUID for id
              clerk_id: id,
              email: email,
              first_name: first_name || '',
              last_name: last_name || '',
              full_name: `${first_name || ''} ${last_name || ''}`.trim(),
              avatar_url: image_url || '',
              created_at: new Date(created_at).toISOString(),
              updated_at: new Date().toISOString(),
              subscription_status: 'free',
              analyses_count: 0,
              monthly_analyses_used: 0
            }
          ])

        if (error) {
          console.error('Error inserting user:', error)
          return new Response('Database error', { status: 500 })
        }

        console.log('User created in Supabase:', email)
      }
    } catch (error) {
      console.error('Error handling user creation:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    // User was updated in Clerk, update in Supabase
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    const email = email_addresses && email_addresses[0]?.email_address 
      ? email_addresses[0].email_address 
      : `${id}@placeholder.com`

    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          email: email,
          first_name: first_name || '',
          last_name: last_name || '',
          full_name: `${first_name || ''} ${last_name || ''}`.trim(),
          avatar_url: image_url || '',
          updated_at: new Date().toISOString()
        })
        .eq('clerk_id', id)

      if (error) {
        console.error('Error updating user:', error)
        return new Response('Database error', { status: 500 })
      }

      console.log('User updated in Supabase:', email)
    } catch (error) {
      console.error('Error handling user update:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    // User was deleted in Clerk, mark as deleted in Supabase (soft delete)
    const { id } = evt.data

    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          deleted_at: new Date().toISOString(),
          subscription_status: 'cancelled'
        })
        .eq('clerk_id', id)

      if (error) {
        console.error('Error deleting user:', error)
        return new Response('Database error', { status: 500 })
      }

      console.log('User marked as deleted in Supabase')
    } catch (error) {
      console.error('Error handling user deletion:', error)
      return new Response('Database error', { status: 500 })
    }
  }

  if (eventType === 'session.created') {
    // Track user login
    const { user_id } = evt.data

    try {
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          last_login_at: new Date().toISOString()
        })
        .eq('clerk_id', user_id)

      if (error) {
        console.error('Error updating last login:', error)
      }
    } catch (error) {
      console.error('Error tracking login:', error)
    }
  }

  return new Response('Webhook processed successfully', { status: 200 })
}

// Handle other HTTP methods
export async function GET() {
  return new Response('Clerk webhook endpoint', { status: 200 })
}