// Setup script to create Stripe products and prices
// Run this script once to set up your Stripe products
// Usage: node scripts/setup-stripe-products.js

const Stripe = require('stripe');

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51RxTkk8DXZKwTJPNjz93dPNSomkzOvRUbLcJsLIhWq3jvS5k28Yh5YLYLT07KHfGQTBEd9heF7vaPcRaxXcGFWOY00Kw5q9JFA', {
  apiVersion: '2023-10-16',
});

async function setupProducts() {
  try {
    console.log('🚀 Setting up Stripe products and prices...\n');

    // Create Starter Product
    console.log('Creating Starter product...');
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
    console.log('\nCreating Growth product...');
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
    console.log('🎉 Setup complete! Add these to your environment variables:\n');
    console.log(`STRIPE_PRICE_STARTER=${starterPrice.id}`);
    console.log(`STRIPE_PRICE_GROWTH=${growthPrice.id}`);
    console.log('='.repeat(50));

    // Also save to a file for reference
    const fs = require('fs');
    const config = `# Stripe Price IDs (Generated on ${new Date().toISOString()})
STRIPE_PRICE_STARTER=${starterPrice.id}
STRIPE_PRICE_GROWTH=${growthPrice.id}

# Product IDs (for reference)
STRIPE_PRODUCT_STARTER=${starterProduct.id}
STRIPE_PRODUCT_GROWTH=${growthProduct.id}
`;
    
    fs.writeFileSync('stripe-config.txt', config);
    console.log('\n📄 Configuration saved to stripe-config.txt');

  } catch (error) {
    console.error('❌ Error setting up Stripe products:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupProducts();