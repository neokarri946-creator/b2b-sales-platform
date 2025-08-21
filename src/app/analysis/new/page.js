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
    
    // Simulate progress while the async endpoint works
    const progressStages = [
      { progress: 10, stage: 'Searching financial databases...' },
      { progress: 25, stage: 'Fetching market data...' },
      { progress: 40, stage: 'Analyzing recent news...' },
      { progress: 55, stage: 'Evaluating compatibility...' },
      { progress: 70, stage: 'Calculating success probability...' },
      { progress: 85, stage: 'Generating comprehensive report...' },
      { progress: 95, stage: 'Adding verified source links...' }
    ]
    
    let currentStage = 0
    const progressInterval = setInterval(() => {
      if (currentStage < progressStages.length) {
        setAnalysisProgress(progressStages[currentStage].progress)
        setAnalysisStage(progressStages[currentStage].stage)
        currentStage++
      }
    }, 2500) // Update every 2.5 seconds
    
    try {
      // Try the new async endpoint that handles everything in one call
      const asyncResponse = await fetch('/api/analysis-async', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (asyncResponse.ok) {
        const data = await asyncResponse.json()
        
        // Clear progress interval
        clearInterval(progressInterval)
        
        // Analysis completed successfully
        setAnalysisProgress(100)
        setAnalysisStage('Analysis complete!')
        
        // Store in localStorage
        if (data.id) {
          localStorage.setItem(`analysis-${data.id}`, JSON.stringify(data))
          console.log('Stored analysis in localStorage:', `analysis-${data.id}`)
        }
        
        // Increment usage count
        await fetch('/api/increment-usage', { method: 'POST' })
        
        // Navigate to results
        toast.success('Analysis complete!')
        setTimeout(() => {
          router.push(`/analysis/${data.id}`)
        }, 500)
        
        setLoading(false)
        return
      }
      
      // If async endpoint fails, fall back to the job-based system
      console.log('Async endpoint failed, trying job-based system...')
      
      const startResponse = await fetch('/api/analysis-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!startResponse.ok) {
        // Final fallback to direct v4 API
        console.log('Job system failed, trying direct API...')
        const directResponse = await fetch('/api/analysis-v4', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (!directResponse.ok) {
          throw new Error('All analysis methods failed')
        }
        
        const data = await directResponse.json()
        setAnalysisProgress(100)
        setAnalysisStage('Analysis complete!')
        
        if (data.id) {
          localStorage.setItem(`analysis-${data.id}`, JSON.stringify(data))
        }
        
        await fetch('/api/increment-usage', { method: 'POST' })
        toast.success('Analysis complete!')
        
        setTimeout(() => {
          router.push(`/analysis/${data.id}`)
        }, 500)
        
        setLoading(false)
        return
      }
      
      const { jobId } = await startResponse.json()
      console.log('Analysis started with job ID:', jobId)
      
      // Step 2: Poll for results
      let attempts = 0
      const maxAttempts = 60 // Poll for up to 2 minutes
      let analysisComplete = false
      let analysisData = null
      
      const pollInterval = setInterval(async () => {
        attempts++
        
        try {
          const statusResponse = await fetch(`/api/analysis-status?jobId=${jobId}`)
          
          if (!statusResponse.ok) {
            console.error('Status check failed')
            if (attempts >= maxAttempts) {
              clearInterval(pollInterval)
              throw new Error('Analysis timeout')
            }
            return
          }
          
          const status = await statusResponse.json()
          
          // Update progress based on actual status
          if (status.progress) {
            setAnalysisProgress(status.progress)
          }
          
          if (status.currentStep) {
            setAnalysisStage(status.currentStep)
          }
          
          // Check if complete
          if (status.status === 'completed' && status.analysis) {
            analysisComplete = true
            analysisData = status.analysis
            clearInterval(pollInterval)
            
            // Process the completed analysis
            setAnalysisProgress(100)
            setAnalysisStage('Analysis complete!')
            
            // Store in localStorage for client-side access
            if (analysisData.id) {
              localStorage.setItem(`analysis-${analysisData.id}`, JSON.stringify(analysisData))
              console.log('Stored analysis in localStorage:', `analysis-${analysisData.id}`)
            }
            
            // Increment usage count
            await fetch('/api/increment-usage', { method: 'POST' })
            
            // Navigate to results
            toast.success('Analysis complete!')
            setTimeout(() => {
              router.push(`/analysis/${analysisData.id || jobId}`)
            }, 500)
            
            setLoading(false)
          } else if (status.status === 'failed') {
            clearInterval(pollInterval)
            throw new Error(status.error || 'Analysis failed')
          } else if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            
            // Final fallback: Try direct v4 API
            console.log('Timeout reached, trying direct API...')
            const response = await fetch('/api/analysis-v4', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            })
            
            if (!response.ok) {
              throw new Error('Analysis failed after timeout')
            }
            
            const data = await response.json()
            setAnalysisProgress(100)
            setAnalysisStage('Analysis complete!')
            
            if (data.id) {
              localStorage.setItem(`analysis-${data.id}`, JSON.stringify(data))
            }
            
            await fetch('/api/increment-usage', { method: 'POST' })
            toast.success('Analysis complete!')
            
            setTimeout(() => {
              router.push(`/analysis/${data.id}`)
            }, 500)
            
            setLoading(false)
          }
        } catch (error) {
          console.error('Polling error:', error)
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval)
            toast.error(error.message || 'Analysis failed. Please try again.')
            setLoading(false)
            setAnalysisProgress(0)
            setAnalysisStage('')
          }
        }
      }, 2000) // Poll every 2 seconds
      
    } catch (error) {
      clearInterval(progressInterval)
      console.error('Analysis error:', error)
      toast.error(error.message || 'Failed to run analysis. Please try again.')
      setLoading(false)
      setAnalysisProgress(0)
      setAnalysisStage('')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Toaster position="top-center" />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              New Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter two companies to analyze their B2B partnership potential
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            {checkingUsage ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">Checking usage limits...</p>
              </div>
            ) : (
              <>
                {usageData && !usageData.canAnalyze && (
                  <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      You&apos;ve reached your monthly analysis limit. Please upgrade your plan to continue.
                    </p>
                  </div>
                )}

                {usageData && usageData.canAnalyze && usageData.remaining <= 2 && (
                  <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-blue-800 dark:text-blue-200">
                      You have {usageData.remaining} {usageData.remaining === 1 ? 'analysis' : 'analyses'} remaining this month.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Seller Company
                    </label>
                    <CompanyAutocomplete
                      value={formData.seller}
                      onChange={(value) => setFormData({ ...formData, seller: value })}
                      placeholder="e.g., Salesforce, Microsoft, Oracle"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Target Company
                    </label>
                    <CompanyAutocomplete
                      value={formData.target}
                      onChange={(value) => setFormData({ ...formData, target: value })}
                      placeholder="e.g., Apple, Amazon, Nike"
                      disabled={loading}
                    />
                  </div>

                  {loading && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>{analysisStage}</span>
                        <span>{analysisProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${analysisProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !formData.seller || !formData.target || (usageData && !usageData.canAnalyze)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </span>
                    ) : (
                      'Run Analysis'
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Analysis uses real-time data from multiple sources</p>
            <p className="mt-1">Results include market research, financial data, and competitive intelligence</p>
          </div>
        </div>
      </div>
    </div>
  )
}