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

    const { action, targetPlan, currentPlan } = await request.json()
    
    console.log('Managing subscription for:', user.emailAddresses[0].emailAddress)
    console.log('Action:', action, 'From:', currentPlan, 'To:', targetPlan)

    // Handle different actions
    if (action === 'cancel' || targetPlan === 'free') {
      // Cancel subscription (downgrade to free)
      return await cancelSubscription(user)
    } else if (action === 'downgrade') {
      // Downgrade from Growth to Starter
      return await downgradeSubscription(user, targetPlan)
    } else if (action === 'upgrade') {
      // This would redirect to checkout (handled by existing checkout flow)
      return NextResponse.json({ 
        action: 'redirect_to_checkout',
        message: 'Please use the checkout flow for upgrades' 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Subscription management error:', error)
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    )
  }
}

async function cancelSubscription(user) {
  try {
    // Get the user's Stripe subscription ID from database
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .single()

    if (subscription?.stripe_subscription_id) {
      try {
        // Cancel the Stripe subscription
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
        console.log('Cancelled Stripe subscription:', subscription.stripe_subscription_id)
      } catch (stripeError) {
        console.log('Stripe cancellation error (may already be cancelled):', stripeError.message)
      }
    }

    // Update database to free plan
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        subscription_status: 'free',
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', user.id)

    if (userUpdateError) {
      console.error('Error updating user subscription:', userUpdateError)
    }

    // Update or delete subscription record
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        plan: 'free',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (subError) {
      console.error('Error updating subscription record:', subError)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully downgraded to Free plan',
      newPlan: 'free'
    })

  } catch (error) {
    console.error('Cancel subscription error:', error)
    throw error
  }
}

async function downgradeSubscription(user, targetPlan) {
  try {
    // For downgrading from Growth to Starter, we need to:
    // 1. Cancel current subscription
    // 2. Create new subscription at lower tier
    
    // Get current subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (subscription?.stripe_subscription_id) {
      try {
        // Cancel current subscription
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
        console.log('Cancelled current subscription for downgrade')
      } catch (error) {
        console.log('Error cancelling for downgrade:', error.message)
      }
    }

    // Update database to new plan
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        subscription_status: targetPlan,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', user.id)

    if (userUpdateError) {
      console.error('Error updating user subscription:', userUpdateError)
    }

    // Update subscription record
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        plan: targetPlan,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (subError) {
      console.error('Error updating subscription record:', subError)
    }

    return NextResponse.json({ 
      success: true,
      message: `Successfully downgraded to ${targetPlan} plan`,
      newPlan: targetPlan,
      note: 'Please complete checkout to activate the new plan'
    })

  } catch (error) {
    console.error('Downgrade subscription error:', error)
    throw error
  }
}