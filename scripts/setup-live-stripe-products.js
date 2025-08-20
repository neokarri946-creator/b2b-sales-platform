// Setup script to create LIVE Stripe products and prices
// IMPORTANT: This uses LIVE API keys - real money will be charged!
// Usage: STRIPE_LIVE_KEY=sk_live_YOUR_KEY node scripts/setup-live-stripe-products.js

const Stripe = require('stripe');

// Use environment variable for live key (never hardcode live keys!)
const LIVE_KEY = process.env.STRIPE_LIVE_KEY;

if (!LIVE_KEY) {
  console.error('❌ Error: Please provide your live Stripe key:');
  console.error('STRIPE_LIVE_KEY=sk_live_YOUR_KEY node scripts/setup-live-stripe-products.js');
  process.exit(1);
}

if (!LIVE_KEY.startsWith('sk_live_')) {
  console.error('❌ Error: This script requires a LIVE key (starting with sk_live_)');
  console.error('⚠️  WARNING: This will create real products that charge real money!');
  process.exit(1);
}

const stripe = new Stripe(LIVE_KEY, {
  apiVersion: '2023-10-16',
});

async function setupLiveProducts() {
  try {
    console.log('🚀 Setting up LIVE Stripe products...');
    console.log('⚠️  WARNING: These are LIVE products - real money will be charged!\n');

    // Create Starter Product
    console.log('Creating LIVE Starter product...');
    const starterProduct = await stripe.products.create({
      name: 'B2B Sales AI - Starter',
      description: '50 analyses per month with advanced AI insights',
      metadata: {
        plan: 'starter',
        analyses_limit: '50'
      }
    });
    console.log('✅ Starter product created:', starterProduct.id);

    // Create Starter Price
    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 4700, // $47.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'Starter Monthly',
      metadata: {
        plan: 'starter'
      }
    });
    console.log('✅ Starter price created:', starterPrice.id);

    // Create Growth Product
    console.log('\nCreating LIVE Growth product...');
    const growthProduct = await stripe.products.create({
      name: 'B2B Sales AI - Growth',
      description: 'Unlimited analyses with custom AI models and API access',
      metadata: {
        plan: 'growth',
        analyses_limit: 'unlimited'
      }
    });
    console.log('✅ Growth product created:', growthProduct.id);

    // Create Growth Price
    const growthPrice = await stripe.prices.create({
      product: growthProduct.id,
      unit_amount: 19700, // $197.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      nickname: 'Growth Monthly',
      metadata: {
        plan: 'growth'
      }
    });
    console.log('✅ Growth price created:', growthPrice.id);

    // Output the price IDs to use in your application
    console.log('\n' + '='.repeat(50));
    console.log('🎉 LIVE Setup complete! Add these to your environment variables:\n');
    console.log(`STRIPE_LIVE_PRICE_STARTER=${starterPrice.id}`);
    console.log(`STRIPE_LIVE_PRICE_GROWTH=${growthPrice.id}`);
    console.log('='.repeat(50));

    // Also save to a file for reference
    const fs = require('fs');
    const config = `# LIVE Stripe Price IDs (Generated on ${new Date().toISOString()})
# ⚠️ WARNING: These are LIVE price IDs - they will charge real money!

STRIPE_LIVE_PRICE_STARTER=${starterPrice.id}
STRIPE_LIVE_PRICE_GROWTH=${growthPrice.id}

# Product IDs (for reference)
STRIPE_LIVE_PRODUCT_STARTER=${starterProduct.id}
STRIPE_LIVE_PRODUCT_GROWTH=${growthProduct.id}

# IMPORTANT: Update these in Vercel:
# 1. Remove test keys
# 2. Add your live secret key as STRIPE_SECRET_KEY
# 3. Update price IDs in your code
`;
    
    fs.writeFileSync('stripe-live-config.txt', config);
    console.log('\n📄 Configuration saved to stripe-live-config.txt');
    console.log('\n⚠️  NEXT STEPS:');
    console.log('1. Update STRIPE_SECRET_KEY in Vercel to your live key');
    console.log('2. Update the price IDs in your code');
    console.log('3. Test with a real card (charges will be real!)');

  } catch (error) {
    console.error('❌ Error setting up LIVE Stripe products:', error.message);
    process.exit(1);
  }
}

// Run the setup
console.log('⚠️  FINAL WARNING: This will create LIVE products!');
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

setTimeout(() => {
  setupProducts();
}, 5000);