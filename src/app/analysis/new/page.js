'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import CompanyAutocomplete from '@/components/CompanyAutocomplete'

export default function NewAnalysis() {
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingUsage, setCheckingUsage] = useState(true)
  const [usageData, setUsageData] = useState(null)
  const [formData, setFormData] = useState({
    seller: '',
    target: ''
  })

  useEffect(() => {
    checkUsage()
  }, [])

  const checkUsage = async () => {
    if (!user) {
      setCheckingUsage(false)
      return
    }

    try {
      const response = await fetch('/api/check-usage')
      const data = await response.json()
      setUsageData(data)
    } catch (error) {
      console.error('Error checking usage:', error)
      setUsageData({ canAnalyze: true, remaining: 1 })
    } finally {
      setCheckingUsage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please login to run analysis')
      router.push('/sign-in')
      return
    }

    // Check usage limit
    if (usageData && !usageData.canAnalyze) {
      toast.error('Monthly analysis limit reached. Please upgrade your plan.')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      const data = await response.json()
      
      // Store in localStorage for client-side access
      if (data.id) {
        localStorage.setItem(`analysis-${data.id}`, JSON.stringify(data))
        console.log('Stored analysis in localStorage:', `analysis-${data.id}`)
      }
      
      // Increment usage count
      try {
        await fetch('/api/increment-usage', {
          method: 'POST'
        })
      } catch (error) {
        console.log('Usage increment failed:', error)
      }
      
      toast.success('Analysis complete!')
      
      // Small delay to ensure localStorage write completes
      setTimeout(() => {
        router.push(`/analysis/${data.id}`)
      }, 100)
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (checkingUsage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              New Analysis
            </h1>
            <button
              onClick={() => router.push('/')}
              className="text-gray-900 hover:text-gray-900"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Usage Info */}
        {usageData && (
          <div className={`mb-6 p-4 rounded-lg ${
            usageData.canAnalyze ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <p className={`font-semibold ${usageData.canAnalyze ? 'text-green-800' : 'text-red-800'}`}>
                  {usageData.canAnalyze 
                    ? `${usageData.remaining} analysis${usageData.remaining !== 1 ? 'es' : ''} remaining this month`
                    : 'Monthly analysis limit reached'
                  }
                </p>
                <p className={`text-sm mt-1 ${usageData.canAnalyze ? 'text-green-600' : 'text-red-600'}`}>
                  {usageData.subscription === 'free' 
                    ? 'Free plan: 1 analysis per month'
                    : usageData.subscription === 'starter'
                    ? 'Starter plan: 50 analyses per month'
                    : 'Growth plan: Unlimited analyses'
                  }
                </p>
              </div>
              {!usageData.canAnalyze && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Analyze a B2B Sales Opportunity
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <CompanyAutocomplete
                value={formData.seller}
                onChange={(value) => setFormData({...formData, seller: value})}
                placeholder="Start typing to search..."
                label="Your Company (Seller)"
                required={true}
              />
              <p className="text-xs text-gray-900 mt-1">
                The company offering products/services
              </p>
            </div>
            
            <div>
              <CompanyAutocomplete
                value={formData.target}
                onChange={(value) => setFormData({...formData, target: value})}
                placeholder="Start typing to search..."
                label="Target Company (Buyer)"
                required={true}
              />
              <p className="text-xs text-gray-900 mt-1">
                The company you want to sell to
              </p>
            </div>
            
            {/* What You Get */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-3">
                Your Analysis Will Include:
              </h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>✓ Success probability score (0-100%)</li>
                <li>✓ Industry and company fit analysis</li>
                <li>✓ Budget and timing assessment</li>
                <li>✓ 4 personalized email templates</li>
                <li>✓ Key opportunities and challenges</li>
                <li>✓ Recommended approach strategy</li>
              </ul>
            </div>
            
            <button
              type="submit"
              disabled={loading || (usageData && !usageData.canAnalyze)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing...' : 
               (usageData && !usageData.canAnalyze) ? 'Limit Reached - Upgrade to Continue' :
               'Run Analysis →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}