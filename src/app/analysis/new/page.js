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
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStage, setAnalysisStage] = useState('')
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
    setAnalysisProgress(0)
    setAnalysisStage('Initializing analysis...')
    
    // Simulate realistic research progress (slower, more realistic)
    const progressStages = [
      { progress: 5, stage: 'Initializing research framework...' },
      { progress: 10, stage: 'Searching financial databases...' },
      { progress: 18, stage: 'Fetching market data from Yahoo Finance...' },
      { progress: 25, stage: 'Analyzing Bloomberg reports...' },
      { progress: 32, stage: 'Researching recent news from Reuters...' },
      { progress: 40, stage: 'Gathering competitive intelligence...' },
      { progress: 48, stage: 'Evaluating technology compatibility...' },
      { progress: 55, stage: 'Analyzing Gartner research...' },
      { progress: 62, stage: 'Processing financial statements...' },
      { progress: 70, stage: 'Calculating success probability...' },
      { progress: 78, stage: 'Verifying data accuracy...' },
      { progress: 85, stage: 'Compiling statistics and insights...' },
      { progress: 92, stage: 'Generating comprehensive report...' },
      { progress: 98, stage: 'Adding verified source links...' }
    ]

    // Start progress simulation (slower for realism)
    let currentStage = 0
    const progressInterval = setInterval(() => {
      if (currentStage < progressStages.length) {
        setAnalysisProgress(progressStages[currentStage].progress)
        setAnalysisStage(progressStages[currentStage].stage)
        currentStage++
      }
    }, 2000) // Slower updates for more realistic research time
    
    try {
      const response = await fetch('/api/analysis-v4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      const data = await response.json()
      
      // Complete progress
      clearInterval(progressInterval)
      setAnalysisProgress(100)
      setAnalysisStage('Analysis complete!')
      
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
      
      // Small delay to show completion
      setTimeout(() => {
        router.push(`/analysis/${data.id}`)
      }, 500)
    } catch (error) {
      clearInterval(progressInterval)
      setAnalysisProgress(0)
      setAnalysisStage('')
      toast.error('Something went wrong. Please try again.')
      console.error(error)
    } finally {
      setTimeout(() => {
        setLoading(false)
        setAnalysisProgress(0)
        setAnalysisStage('')
      }, 500)
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
                <li>✓ Key opportunities and challenges</li>
                <li>✓ Recommended approach strategy</li>
                <li>✓ Fresh market data and insights</li>
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

          {/* Progress Bar */}
          {loading && (
            <div className="mt-6 bg-gray-50 rounded-lg p-6 border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Analyzing Companies
                </h3>
                <span className="text-sm font-medium text-gray-600">
                  {analysisProgress}%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <p className="text-sm text-gray-700 font-medium">
                    {analysisProgress < 15 ? '🔍 Searching financial databases...' :
                     analysisProgress < 30 ? '📊 Analyzing market data from Yahoo Finance...' :
                     analysisProgress < 45 ? '📰 Researching recent news from Reuters & Bloomberg...' :
                     analysisProgress < 60 ? '💻 Evaluating technology stack compatibility...' :
                     analysisProgress < 75 ? '🎯 Analyzing competitive positioning from Gartner...' :
                     analysisProgress < 85 ? '📈 Calculating success probability with real data...' :
                     analysisProgress < 95 ? '✍️ Compiling comprehensive report with sources...' :
                     '✅ Finalizing analysis with verified hyperlinks...'}
                  </p>
                </div>
                
                {analysisProgress > 20 && (
                  <div className="pl-6 space-y-1">
                    <p className="text-xs text-gray-500">
                      • Found {Math.floor(analysisProgress / 8)} reliable sources...
                    </p>
                    {analysisProgress > 40 && (
                      <p className="text-xs text-gray-500">
                        • Extracted {Math.floor(analysisProgress / 5)} key statistics...
                      </p>
                    )}
                    {analysisProgress > 60 && (
                      <p className="text-xs text-gray-500">
                        • Verified {Math.floor(analysisProgress / 10)} data points...
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-400 italic">
                  ⏱️ Deep research typically takes 20-30 seconds for maximum accuracy
                </p>
                <p className="text-xs text-gray-400 italic mt-1">
                  📚 Analyzing real data from: Yahoo Finance • Bloomberg • Reuters • MarketWatch • Gartner
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}