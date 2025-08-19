'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in')
      } else if (user.firstName && user.firstName !== '') {
        // User already has a name, skip onboarding
        router.push('/')
      } else {
        // Pre-fill if any data exists
        setFirstName(user.firstName || '')
        setLastName(user.lastName || '')
      }
    }
  }, [isLoaded, user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!firstName.trim()) {
      toast.error('Please enter your first name')
      return
    }

    setLoading(true)

    try {
      // Update user profile in Clerk
      await user.update({
        firstName: firstName.trim(),
        lastName: lastName.trim()
      })

      toast.success(`Welcome, ${firstName}!`)
      
      // Redirect to home or wherever they were trying to go
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile. Please try again.')
      setLoading(false)
    }
  }

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to SalesAI! 👋
            </h1>
            <p className="text-gray-600">
              Let&apos;s personalize your experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What should we call you? *
              </label>
              <input
                type="text"
                placeholder="Your first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                This is how we&apos;ll greet you in the app
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last name (optional)
              </label>
              <input
                type="text"
                placeholder="Your last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !firstName.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Continue →'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              You can update this anytime in your profile settings
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}