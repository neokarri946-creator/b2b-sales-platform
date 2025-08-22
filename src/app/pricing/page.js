'use client'

import { useState, useEffect, Suspense } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import Navigation from '@/components/Navigation'

function PricingContent() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState('')
  const [currentPlan, setCurrentPlan] = useState('free') // Default to free plan
  const [loadingPlan, setLoadingPlan] = useState(true)

  // Get user's current plan when component mounts
  useEffect(() => {
    if (user) {
      fetchCurrentPlan()
    } else {
      setLoadingPlan(false)
    }
    
    // Check if coming back from payment
    if (searchParams.get('refresh') === 'true' && user) {
      setTimeout(() => {
        fetchCurrentPlan()
      }, 1000) // Give database time to update
    }
  }, [user, searchParams])

  const fetchCurrentPlan = async () => {
    try {
      const response = await fetch('/api/check-usage')
      const data = await response.json()
      
      if (data.subscription) {
        // Convert subscription name to match plan names
        if (data.subscription === 'unlimited_dev') {
          setCurrentPlan('free') // Show as free for unlimited dev
        } else {
          setCurrentPlan(data.subscription)
        }
      }
    } catch (error) {
      console.error('Error fetching plan:', error)
    } finally {
      setLoadingPlan(false)
    }
  }

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        '1 analysis per month',
        'Basic insights',
        'Email templates',
        'Community support'
      ],
      cta: 'Start Free',
      priceId: null
    },
    {
      name: 'Starter',
      price: '$47',
      period: '/month',
      features: [
        '50 analyses per month',
        'Advanced AI insights',
        'Priority email templates',
        'Buying signal alerts',
        'Email support'
      ],
      cta: 'Get Started',
      priceId: 'price_1Ry9X88DXZKwTJPNFL09VJym', // Real Stripe price ID
      popular: true
    },
    {
      name: 'Growth',
      price: '$197',
      period: '/month',
      features: [
        '150 analyses per month',  // Reduced from unlimited
        'Advanced AI insights',
        'API access',
        'Team collaboration (5 users)',
        'Priority support',
        'CRM integrations'
      ],
      cta: 'Get Started',
      priceId: 'price_1Ry9X98DXZKwTJPNxra81ItP' // Real Stripe price ID
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'profit share',
      features: [
        'Unlimited analyses',
        'Dedicated AI models',
        'White-label option',
        'Unlimited team members',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom integrations',
        'Success-based pricing (% of closed deals)'
      ],
      cta: 'Contact Sales',
      priceId: null,
      enterprise: true,
      contactEmail: 'enterprise@b2bsalesplatform.com' // Change this to your email
    }
  ]

  const handleSubscribe = async (priceId, plan) => {
    if (!user) {
      router.push('/sign-up')
      return
    }

    // Handle Enterprise plan - open email client
    if (plan.enterprise) {
      const subject = encodeURIComponent('Enterprise Plan Inquiry - B2B Sales Platform')
      const body = encodeURIComponent(`Hi,

I'm interested in the Enterprise plan with profit-sharing pricing for my company.

Company Name: [Your Company]
Your Name: ${user.firstName || ''} ${user.lastName || ''}
Email: ${user.emailAddresses?.[0]?.emailAddress || ''}
Current Monthly Deal Volume: [Estimated number of deals]
Average Deal Size: [Typical deal value]

I'd like to learn more about:
- The profit-sharing model and percentage
- Implementation timeline
- Dedicated support options
- Custom AI model training

Please schedule a call at your earliest convenience.

Best regards,
${user.firstName || 'User'}`)
      
      window.location.href = `mailto:${plan.contactEmail}?subject=${subject}&body=${body}`
      return
    }

    if (!priceId) {
      // Free plan - only go to analysis if not currently on a paid plan
      if (currentPlan === 'free') {
        router.push('/analysis/new')
      }
      return
    }

    setLoading(priceId)
    
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }
      
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
      console.error('Checkout error:', error)
    } finally {
      setLoading('')
    }
  }

  const handleCancelPlan = async () => {
    const confirmMessage = 'Are you sure you want to cancel your subscription? You will lose access to premium features and be reverted to the Free plan.'
    
    if (!confirm(confirmMessage)) {
      return
    }

    setLoading('cancel')
    
    try {
      const response = await fetch('/api/manage-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          targetPlan: 'free',
          currentPlan
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }
      
      toast.success('Successfully cancelled subscription. You have been reverted to the Free plan.')
      
      // Refresh the page to show updated plan
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
      console.error('Cancel error:', error)
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      <Navigation />

      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 text-center">
            Choose Your Plan
          </h1>
          <p className="text-center text-gray-900 mt-3 text-lg">
            Choose the perfect plan for your sales team
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-500' : 
                plan.enterprise ? 'ring-2 ring-purple-500 transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}
              {plan.enterprise && (
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-2 text-sm font-semibold">
                  PERFORMANCE-BASED PRICING
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-900">{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-900">{feature}</span>
                    </li>
                  ))}
                </ul>
                
{loadingPlan && user ? (
                  // Show loading state while fetching plan
                  <div className="w-full py-3 rounded-lg font-semibold text-center bg-gray-100 text-gray-600">
                    <div className="animate-pulse">Loading...</div>
                  </div>
                ) : user && currentPlan.toLowerCase() === plan.name.toLowerCase() && plan.name !== 'Free' ? (
                  // Show cancel button for current paid plan
                  <button
                    onClick={handleCancelPlan}
                    disabled={loading === 'cancel'}
                    className="w-full py-3 rounded-lg font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading === 'cancel' ? 'Cancelling...' : 'Cancel Plan'}
                  </button>
                ) : user && currentPlan.toLowerCase() === plan.name.toLowerCase() && plan.name === 'Free' ? (
                  // Show current plan for free tier
                  <div className="w-full py-3 rounded-lg font-semibold text-center bg-green-100 text-green-800 border-2 border-green-200">
                    ✓ Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => plan.name === 'Free' && !user ? router.push('/sign-up') : handleSubscribe(plan.priceId, plan)}
                    disabled={loading === plan.priceId || loading === 'cancel' || (!user && plan.name !== 'Free')}
                    className={`w-full py-3 rounded-lg font-semibold ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : plan.enterprise
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                        : plan.name === 'Free' && !user
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } disabled:opacity-50 ${
                      !user && plan.name !== 'Free' ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    {loading === plan.priceId
                      ? 'Loading...' 
                      : !user && plan.name === 'Free' 
                      ? 'Sign Up Free'
                      : !user && plan.name !== 'Free'
                      ? 'Sign In Required'
                      : plan.cta
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-900">
                You can upgrade, downgrade, or cancel your subscription at any time.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Is there really a free plan?</h3>
              <p className="text-gray-900">
                Yes! You get 1 free analysis every month with our free plan.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-900">
                We accept all major credit cards through Stripe.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">How does the Enterprise profit-sharing model work?</h3>
              <p className="text-gray-900">
                Instead of a fixed monthly fee, Enterprise customers pay a percentage of successful deals closed using our platform. This aligns our incentives with your success - we only succeed when you do. Contact our sales team to discuss custom terms based on your deal volume.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Pricing() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}