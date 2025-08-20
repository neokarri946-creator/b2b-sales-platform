// Stripe configuration
// This file manages test vs live mode

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const USE_LIVE_STRIPE = process.env.USE_LIVE_STRIPE === 'true'

// Determine which keys to use
export const STRIPE_MODE = USE_LIVE_STRIPE ? 'live' : 'test'

// Price IDs - these will need to be updated when you create live products
export const STRIPE_PRICES = {
  test: {
    starter: 'price_1Ry9X88DXZKwTJPNFL09VJym',
    growth: 'price_1Ry9X98DXZKwTJPNxra81ItP'
  },
  live: {
    // These will be filled in after you run the live setup script
    starter: process.env.STRIPE_LIVE_PRICE_STARTER || '',
    growth: process.env.STRIPE_LIVE_PRICE_GROWTH || ''
  }
}

// Get the correct price IDs based on mode
export function getStripePrices() {
  return STRIPE_PRICES[STRIPE_MODE]
}

// Get the correct secret key based on mode
export function getStripeSecretKey() {
  if (USE_LIVE_STRIPE) {
    // In live mode, use the live key from environment
    return process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY
  }
  // In test mode, use the test key
  return process.env.STRIPE_SECRET_KEY || 'sk_test_51RxTkk8DXZKwTJPNjz93dPNSomkzOvRUbLcJsLIhWq3jvS5k28Yh5YLYLT07KHfGQTBEd9heF7vaPcRaxXcGFWOY00Kw5q9JFA'
}

// Check if we're ready for live mode
export function isLiveModeReady() {
  if (!USE_LIVE_STRIPE) return false
  
  const hasLiveKey = !!process.env.STRIPE_LIVE_SECRET_KEY
  const hasLivePrices = !!STRIPE_PRICES.live.starter && !!STRIPE_PRICES.live.growth
  
  return hasLiveKey && hasLivePrices
}