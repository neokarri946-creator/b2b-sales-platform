'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (sessionId && user) {
      // Update the subscription in the database
      updateSubscription(sessionId)
    } else if (!sessionId) {
      setLoading(false)
    }
  }, [searchParams, user])

  const updateSubscription = async (sessionId) => {
    try {
      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })

      const data = await response.json()
      
      if (data.success) {
        setSessionData({
          success: true,
          plan: data.plan
        })
        console.log('Subscription updated:', data.message)
      } else {
        console.error('Failed to update subscription')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-900">Confirming your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg 
              className="h-10 w-10 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          
          <p className="text-gray-700 mb-6">
            Welcome to your new plan! Your subscription is now active.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h3>
            <ul className="text-sm text-blue-800 space-y-1 text-left">
              <li>• Your plan is now active</li>
              <li>• You can start running analyses immediately</li>
              <li>• Check your email for the receipt</li>
              <li>• Manage your subscription in account settings</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/analysis/new')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Start Your First Analysis
            </button>
            
            <button
              onClick={() => router.push('/pricing?refresh=true')}
              className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200"
            >
              View Your Plan
            </button>
          </div>

          <p className="text-xs text-gray-600 mt-6">
            Need help? Contact support at support@b2bsalesai.com
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}