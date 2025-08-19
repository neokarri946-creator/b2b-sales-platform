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
    console.log('Looking for analysis with ID:', params.id)
    
    // For temporary IDs, get from localStorage
    if (params.id?.startsWith('temp-') || params.id?.startsWith('analysis-')) {
      const storageKey = `analysis-${params.id}`
      console.log('Checking localStorage key:', storageKey)
      
      const stored = localStorage.getItem(storageKey)
      console.log('Found in localStorage:', !!stored)
      
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          console.log('Successfully parsed analysis:', parsed.id)
          setAnalysis(parsed)
        } catch (error) {
          console.error('Failed to parse stored analysis:', error)
        }
      } else {
        console.log('No analysis found in localStorage')
        // Check all localStorage keys for debugging
        console.log('All localStorage keys:', Object.keys(localStorage))
      }
      setLoading(false)
    } else {
      // TODO: Fetch from Supabase for real IDs
      console.log('ID does not match expected pattern')
      setLoading(false)
    }
  }, [params.id])

  const copyEmail = (index) => {
    const template = analysis.email_templates[index]
    const text = `Subject: ${template.subject || template.to}\n\n${template.body}`
    navigator.clipboard.writeText(text)
    setCopiedEmail(index)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-900">Analyzing companies...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-900">Analysis not found</p>
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

  // Calculate overall score if we have scorecard
  const overallScore = analysis.scorecard?.overall_score || analysis.success_probability || 65

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                B2B Sales Analysis Report
              </h1>
              <p className="text-gray-900 mt-1">
                {analysis.seller_company} → {analysis.target_company}
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Methodology: {analysis.analysis_methodology || 'Solution Affinity Scorecard'}
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="text-gray-900 hover:text-gray-900"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Solution Affinity Scorecard */}
        {analysis.scorecard && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Solution Affinity Scorecard
            </h2>
            
            {/* Overall Score */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Overall Score</h3>
                  <p className="text-sm text-gray-700">Weighted average across all dimensions</p>
                </div>
                <div className="text-4xl font-bold text-blue-600">
                  {overallScore}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-1000 ${
                    overallScore >= 70 ? 'bg-green-500' :
                    overallScore >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </div>

            {/* Individual Dimensions */}
            <div className="space-y-4">
              {analysis.scorecard.dimensions?.map((dimension, index) => (
                <div key={index} className="border-t pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {dimension.name}
                        <span className="ml-2 text-sm text-gray-600">
                          (Weight: {(dimension.weight * 100).toFixed(0)}%)
                        </span>
                      </h4>
                      <p className="text-sm text-gray-700 mt-1">{dimension.rationale}</p>
                    </div>
                    <div className="ml-4 text-2xl font-bold text-gray-900">
                      {dimension.score}/10
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        dimension.score >= 7 ? 'bg-green-500' :
                        dimension.score >= 5 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${dimension.score * 10}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Opportunities */}
        {analysis.strategic_opportunities && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Strategic Opportunities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.strategic_opportunities.map((opp, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{opp.use_case}</h4>
                    <span className={`px-2 py-1 text-xs rounded ${
                      opp.value_magnitude === 'HIGH' ? 'bg-green-100 text-green-800' :
                      opp.value_magnitude === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {opp.value_magnitude} VALUE
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{opp.business_impact}</p>
                  <p className="text-xs text-gray-600">
                    Implementation Effort: {opp.implementation_effort}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Analysis */}
        {analysis.financial_analysis && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">
              Financial Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Deal Size Range</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {analysis.financial_analysis.deal_size_range}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">ROI Projection</h4>
                <p className="text-2xl font-bold text-green-600">
                  {analysis.financial_analysis.roi_projection}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Payback Period</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {analysis.financial_analysis.payback_period}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Budget Source</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {analysis.financial_analysis.budget_source}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Market Alignment</h3>
            <p className="text-gray-900">{analysis.industry_fit}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Budget Readiness</h3>
            <p className="text-gray-900">{analysis.budget_signal}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Timing</h3>
            <p className="text-gray-900">{analysis.timing}</p>
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
                  <span className="text-gray-900">{opp}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Challenges to Address
            </h3>
            <ul className="space-y-2">
              {analysis.challenges?.map((challenge, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-yellow-500 mr-2">⚠</span>
                  <span className="text-gray-900">{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommended Approach */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Recommended Sales Approach
          </h3>
          <p className="text-gray-900 mb-4">
            {typeof analysis.recommended_approach === 'string' 
              ? analysis.recommended_approach 
              : analysis.recommended_approach?.strategy}
          </p>
          {analysis.recommended_approach?.stakeholders && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Target Stakeholders:</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.recommended_approach.stakeholders.map((stakeholder, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {stakeholder}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis.recommended_approach?.next_steps && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Next Steps:</h4>
              <ol className="list-decimal list-inside space-y-1">
                {analysis.recommended_approach.next_steps.map((step, i) => (
                  <li key={i} className="text-gray-900">{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Email Templates */}
        {analysis.email_templates && analysis.email_templates.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Email Templates
            </h3>
            <div className="space-y-4">
              {analysis.email_templates.map((template, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {template.to || `Template ${i + 1}`}
                      </h4>
                      <p className="text-sm text-gray-700">
                        Subject: {template.subject}
                      </p>
                    </div>
                    <button
                      onClick={() => copyEmail(i)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {copiedEmail === i ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 bg-gray-50 p-3 rounded">
                    {template.body}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

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
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}