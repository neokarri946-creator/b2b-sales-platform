import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

export async function POST(req) {
  console.log('Debug webhook received')
  
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  // Get and verify the webhook
  const payload = await req.json()
  const body = JSON.stringify(payload)
  
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '')
  
  let evt
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    })
  } catch (err) {
    return new Response('Verification failed', { status: 400 })
  }

  console.log('Webhook verified successfully')
  console.log('Event type:', evt.type)

  // Try to insert a simple test record
  if (evt.type === 'user.created') {
    const { id, first_name, last_name } = evt.data
    
    // Test Supabase connection
    console.log('Testing Supabase connection...')
    console.log('URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      )
      
      // Try a simple insert with minimal fields
      const testData = {
        id: crypto.randomUUID(), // Generate UUID for id
        clerk_id: id || 'test_' + Date.now(),
        email: `${id || 'test'}@test.com`,
        first_name: first_name || 'Test',
        last_name: last_name || 'User',
        full_name: `${first_name || 'Test'} ${last_name || 'User'}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      console.log('Attempting to insert:', testData)
      
      const { data, error } = await supabase
        .from('users')
        .insert([testData])
        .select()
      
      if (error) {
        console.error('Supabase error:', error)
        return new Response(JSON.stringify({
          error: 'Database error',
          details: error.message,
          code: error.code,
          hint: error.hint
        }), { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      console.log('Success! Inserted:', data)
      return new Response(JSON.stringify({
        success: true,
        message: 'User created',
        data: data
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
      
    } catch (err) {
      console.error('Unexpected error:', err)
      return new Response(JSON.stringify({
        error: 'Unexpected error',
        message: err.message
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
  
  return new Response('Event type not handled', { status: 200 })
}