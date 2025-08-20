import { NextResponse } from 'next/server'

export async function GET() {
  // Get the base URL for redirects
  let baseUrl = 'https://b2b-sales-platform.vercel.app'
  
  if (process.env.NODE_ENV === 'development') {
    baseUrl = 'http://localhost:3000'
  } else if (process.env.NEXT_PUBLIC_URL) {
    baseUrl = process.env.NEXT_PUBLIC_URL
  } else if (process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`
  }
  
  // Ensure URL doesn't have trailing slash
  baseUrl = baseUrl.replace(/\/$/, '')
  
  const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${baseUrl}/pricing?canceled=true`
  
  return NextResponse.json({
    baseUrl,
    successUrl,
    cancelUrl,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      VERCEL_ENV: process.env.VERCEL_ENV
    }
  })
}