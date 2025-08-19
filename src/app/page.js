'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs'
import toast, { Toaster } from 'react-hot-toast'
import Navigation from '@/components/Navigation'

export default function HomePage() {
  const router = useRouter()
  const { user } = useUser()

  const handleGetStarted = () => {
    if (user) {
      router.push('/analysis/new')
    } else {
      router.push('/sign-up')
    }
  }

  return (
    <>
      <Toaster position="top-center" />
      
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Know If Your Deal Will Close
              <span className="text-blue-600"> Before Your First Call</span>
            </h1>
            <p className="text-xl text-gray-900 mb-8 max-w-3xl mx-auto">
              AI analyzes any B2B deal and predicts success probability,
              generates perfect emails, and monitors for buying signals.
            </p>


            {/* Call to Action */}
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl mx-auto">
              <SignedOut>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Start Your Free Analysis
                </h2>
                <p className="text-gray-900 mb-6">
                  Sign up now and get 1 free analysis every month. No credit card required.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => router.push('/sign-up')}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    Sign Up Free →
                  </button>
                  <button
                    onClick={() => router.push('/sign-in')}
                    className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50"
                  >
                    Already have an account? Sign In
                  </button>
                </div>
                <p className="text-xs text-gray-900 mt-4">
                  ✓ 1 free analysis per month • ✓ No credit card • ✓ Full report included
                </p>
              </SignedOut>
              
              <SignedIn>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Welcome back, {user?.firstName || 'there'}!
                </h2>
                <p className="text-gray-900 mb-6">
                  Ready to analyze your next B2B opportunity?
                </p>
                <button
                  onClick={() => router.push('/analysis/new')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Start New Analysis →
                </button>
                <p className="text-xs text-gray-900 mt-4">
                  You have access to AI-powered B2B sales analysis
                </p>
              </SignedIn>
            </div>

          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything You Need to Close More Deals
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Success Prediction</h3>
              <p className="text-gray-900">
                AI analyzes multiple factors to help predict sales success
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Sequences</h3>
              <p className="text-gray-900">
                Generate personalized emails that actually get responses
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Buying Signals</h3>
              <p className="text-gray-900">
                Real-time alerts when companies show buying intent
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Final Call to Action - Only show for signed out users */}
      <SignedOut>
        <div className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-white mb-4">
              Start Closing More Deals Today
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Free forever for 1 analysis/month • No credit card required
            </p>
            <button
              onClick={() => router.push('/sign-up')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100"
            >
              Get Started Free →
            </button>
          </div>
        </div>
      </SignedOut>
      
      {/* For signed-in users, show different CTA */}
      <SignedIn>
        <div className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready for Your Next Analysis?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              You're on the Free plan • 1 analysis per month
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => router.push('/analysis/new')}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100"
              >
                Start Analysis →
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="bg-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-400 border-2 border-white"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  )
}