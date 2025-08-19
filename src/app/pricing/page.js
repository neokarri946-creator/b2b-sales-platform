'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import Navigation from '@/components/Navigation'

export default function Pricing() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState('')
  const [currentPlan, setCurrentPlan] = useState('free') // Default to free plan

  // Get user's current plan when component mounts
  useEffect(() => {
    if (user) {
      // In a real app, you'd fetch this from your subscription service
      // For now, we'll assume all logged-in users are on the free plan
      // TODO: Fetch actual subscription status from Stripe/Supabase
      setCurrentPlan('free')
    }
  }, [user])

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
      priceId: 'price_starter',
      popular: true
    },
    {
      name: 'Growth',
      price: '$197',
      period: '/month',
      features: [
        'Unlimited analyses',
        'Custom AI models',
        'API access',
        'Team collaboration',
        'Priority support',
        'Custom integrations'
      ],
      cta: 'Get Started',
      priceId: 'price_growth'
    }
  ]

  const handleSubscribe = async (priceId) => {
    if (!user) {
      router.push('/sign-up')
      return
    }

    if (!priceId) {
      router.push('/analysis/new')
      return
    }

    setLoading(priceId)
    
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId })
      })
      
      const { url } = await response.json()
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      toast.error('Something went wrong')
      console.error(error)
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-blue-500 text-white text-center py-2 text-sm font-semibold">
                  MOST POPULAR
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
                
{user && currentPlan.toLowerCase() === plan.name.toLowerCase() ? (
                  // Show current plan status
                  <div className="w-full py-3 rounded-lg font-semibold text-center bg-green-100 text-green-800 border-2 border-green-200">
                    ✓ Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => plan.name === 'Free' && !user ? router.push('/sign-up') : handleSubscribe(plan.priceId)}
                    disabled={loading === plan.priceId || (!user && plan.name !== 'Free')}
                    className={`w-full py-3 rounded-lg font-semibold ${
                      plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
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
          </div>
        </div>
      </div>
    </div>
  )
}