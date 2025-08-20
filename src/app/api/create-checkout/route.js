import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs/server'

export async function POST(request) {
  try {
    console.log('Checkout API called')
    const user = await currentUser()
    
    if (!user) {
      console.log('No user found - unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('User authenticated:', user.emailAddresses[0].emailAddress)

    const { priceId } = await request.json()
    
    if (!priceId) {
      console.log('No price ID provided')
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    console.log('Creating checkout for price:', priceId)
    
    // Initialize Stripe inside the function
    const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51RxTkk8DXZKwTJPNjz93dPNSomkzOvRUbLcJsLIhWq3jvS5k28Yh5YLYLT07KHfGQTBEd9heF7vaPcRaxXcGFWOY00Kw5q9JFA'
    console.log('Initializing Stripe with key starting:', stripeKey.substring(0, 20))
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(), // Use fetch instead of default
      maxNetworkRetries: 2
    })

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    
    console.log('Base URL for redirects:', baseUrl)
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      customer_email: user.emailAddresses[0].emailAddress,
      metadata: {
        userId: user.id,
        userEmail: user.emailAddresses[0].emailAddress
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          userEmail: user.emailAddresses[0].emailAddress
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto'
    })

    console.log('Checkout session created:', session.id)
    console.log('Checkout URL:', session.url)
    
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe error:', error)
    console.error('Error type:', error.type)
    console.error('Error message:', error.message)
    console.error('Full error:', JSON.stringify(error, null, 2))
    
    // More detailed error messages
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: `Invalid request: ${error.message}` },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}