'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function AnalysisResults() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedEmail, setCopiedEmail] = useState(null)

  useEffect(() => {
    // For temporary IDs, get from localStorage
    if (params.id?.startsWith('temp-')) {
      const stored = localStorage.getItem(`analysis-${params.id}`)
      if (stored) {
        setAnalysis(JSON.parse(stored))
        setLoading(false)
      } else {
        router.push('/analysis/new')
      }
    } else {
      // TODO: Fetch from Supabase for real IDs
      setLoading(false)
    }
  }, [params.id, router])

  const copyEmail = (index) => {
    const template = analysis.email_templates[index]
    const text = `Subject: ${template.subject}\n\n${template.body}`
    navigator.clipboard.writeText(text)
    setCopiedEmail(index)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analysis...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Analysis not found</p>
          <button
            onClick={() => router.push('/analysis/new')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Run New Analysis
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analysis Results
              </h1>
              <p className="text-gray-600 mt-1">
                {analysis.seller_company} → {analysis.target_company}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success Score */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Success Probability</h2>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - analysis.success_probability / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-5xl font-bold text-gray-900">
                    {analysis.success_probability}%
                  </span>
                  <p className="text-gray-600 mt-1">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Industry Fit</h3>
            <p className="text-gray-700">{analysis.industry_fit}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Budget Signal</h3>
            <p className="text-gray-700">{analysis.budget_signal}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Timing</h3>
            <p className="text-gray-700">{analysis.timing}</p>
          </div>
        </div>

        {/* Opportunities & Challenges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Key Opportunities
            </h3>
            <ul className="space-y-2">
              {analysis.key_opportunities?.map((opp, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Potential Challenges
            </h3>
            <ul className="space-y-2">
              {analysis.challenges?.map((challenge, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-yellow-500 mr-2">!</span>
                  <span className="text-gray-700">{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Approach */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recommended Approach
          </h3>
          <p className="text-gray-700">{analysis.recommended_approach}</p>
        </div>

        {/* Email Templates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Email Templates
          </h3>
          <div className="space-y-6">
            {analysis.email_templates?.map((template, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">
                    Template {i + 1}
                  </h4>
                  <button
                    onClick={() => copyEmail(i)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {copiedEmail === i ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Subject:</strong> {template.subject}
                </p>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {template.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => router.push('/analysis/new')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Run Another Analysis
          </button>
          <button
            onClick={() => router.push('/')}
            className="bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}