import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RxTkk8DXZKwTJPNjz93dPNSomkzOvRUbLcJsLIhWq3jvS5k28Yh5YLYLT07KHfGQTBEd9heF7vaPcRaxXcGFWOY00Kw5q9JFA', {
  apiVersion: '2023-10-16'
})

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // You'll need a service key for this
)

// Stripe webhook secret (you'll get this from Stripe dashboard)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  let event

  try {
    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } else {
      // For testing without webhook secret (not recommended for production)
      event = JSON.parse(body)
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
      
      // Update user's subscription in database
      if (session.metadata?.userId) {
        try {
          // Determine the plan based on the price
          let plan = 'free'
          if (session.amount_total === 4700) {
            plan = 'starter'
          } else if (session.amount_total === 19700) {
            plan = 'growth'
          }

          // Update user subscription in Supabase
          const { error } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: session.metadata.userId,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              plan: plan,
              status: 'active',
              current_period_start: new Date(session.created * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            })

          if (error) {
            console.error('Failed to update subscription:', error)
          } else {
            console.log(`Subscription updated for user ${session.metadata.userId}`)
          }
        } catch (error) {
          console.error('Error updating subscription:', error)
        }
      }
      break

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object
      
      // Update subscription status
      if (subscription.metadata?.userId) {
        try {
          const status = subscription.status === 'active' ? 'active' : 'canceled'
          
          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              status: status,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id)

          if (!error) {
            console.log(`Subscription ${status} for ${subscription.metadata.userId}`)
          }
        } catch (error) {
          console.error('Error updating subscription status:', error)
        }
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}