import { NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with the secret key
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51RxTkk8DXZKwTJPNjz93dPNSomkzOvRUbLcJsLIhWq3jvS5k28Yh5YLYLT07KHfGQTBEd9heF7vaPcRaxXcGFWOY00Kw5q9JFA'
console.log('Test endpoint - Stripe key exists:', !!stripeKey)
console.log('Test endpoint - Stripe key starts with:', stripeKey.substring(0, 15))
console.log('Test endpoint - ENV check:', !!process.env.STRIPE_SECRET_KEY)

const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
  maxNetworkRetries: 3,
  timeout: 10000 // 10 second timeout
})

export async function GET() {
  try {
    console.log('Test checkout API called')
    
    const priceId = 'price_1Ry9X88DXZKwTJPNFL09VJym' // Starter plan
    
    console.log('Creating test checkout for price:', priceId)

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
      customer_email: 'test@example.com',
      metadata: {
        userId: 'test_user',
        userEmail: 'test@example.com'
      },
      subscription_data: {
        metadata: {
          userId: 'test_user',
          userEmail: 'test@example.com'
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto'
    })

    console.log('Checkout session created:', session.id)
    console.log('Checkout URL:', session.url)
    
    return NextResponse.json({ 
      success: true,
      url: session.url,
      sessionId: session.id 
    })
  } catch (error) {
    console.error('Stripe error:', error)
    console.error('Error type:', error.type)
    console.error('Error message:', error.message)
    
    return NextResponse.json(
      { 
        error: error.message,
        type: error.type,
        details: error.raw?.message || error.message
      },
      { status: 500 }
    )
  }
}