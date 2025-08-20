import { NextResponse } from 'next/server'

export async function GET() {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  
  return NextResponse.json({
    hasKey: !!stripeKey,
    keyStart: stripeKey ? stripeKey.substring(0, 20) + '...' : 'NO KEY',
    keyLength: stripeKey ? stripeKey.length : 0,
    isTestKey: stripeKey ? stripeKey.startsWith('sk_test_') : false,
    env: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  })
}