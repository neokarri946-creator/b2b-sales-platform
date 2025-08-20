import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RxTkk8DXZKwTJPNjz93dPNSomkzOvRUbLcJsLIhWq3jvS5k28Yh5YLYLT07KHfGQTBEd9heF7vaPcRaxXcGFWOY00Kw5q9JFA', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient()
})

export async function POST(request) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    console.log('Updating subscription for user:', user.emailAddresses[0].emailAddress)
    console.log('Session ID:', sessionId)

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    // Determine the plan based on the amount
    let plan = 'free'
    if (session.amount_total === 4700) {
      plan = 'starter'
    } else if (session.amount_total === 19700) {
      plan = 'growth'
    }

    console.log('Detected plan:', plan)
    console.log('Amount paid:', session.amount_total)

    // First, update the users table
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        subscription_status: plan,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', user.id)

    if (userUpdateError) {
      console.error('Error updating user subscription:', userUpdateError)
    } else {
      console.log('Updated user subscription status to:', plan)
    }

    // Also create/update user_subscriptions table
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan: plan,
        status: 'active',
        current_period_start: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (subError) {
      console.error('Error creating subscription record:', subError)
    } else {
      console.log('Created/updated subscription record')
    }

    return NextResponse.json({ 
      success: true, 
      plan,
      message: `Subscription updated to ${plan}`
    })

  } catch (error) {
    console.error('Subscription update error:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}