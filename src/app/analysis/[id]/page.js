'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import AnalysisReport from '@/components/AnalysisReport'

export default function AnalysisResults() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedEmail, setCopiedEmail] = useState(null)
  const [showExportMenu, setShowExportMenu] = useState(false)

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

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.relative')) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  const copyEmail = (index) => {
    const template = analysis.email_templates[index]
    const text = `Subject: ${template.subject || template.to}\n\n${template.body}`
    navigator.clipboard.writeText(text)
    setCopiedEmail(index)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const generateTextReport = () => {
    let report = `B2B SALES ANALYSIS REPORT\n`
    report += `${'='.repeat(50)}\n\n`
    report += `Company Analysis: ${analysis.seller_company} → ${analysis.target_company}\n`
    report += `Generated: ${new Date(analysis.timestamp).toLocaleDateString()}\n`
    report += `Methodology: ${analysis.analysis_methodology}\n\n`

    // Overall Score
    report += `OVERALL SUCCESS PROBABILITY: ${analysis.success_probability}%\n\n`

    // Scorecard
    if (analysis.scorecard) {
      report += `SOLUTION AFFINITY SCORECARD\n`
      report += `${'-'.repeat(30)}\n`
      analysis.scorecard.dimensions?.forEach(dim => {
        report += `${dim.name}: ${dim.score}/10 (Weight: ${(dim.weight * 100).toFixed(0)}%)\n`
        report += `  Rationale: ${dim.rationale}\n\n`
      })
    }

    // Strategic Opportunities
    if (analysis.strategic_opportunities) {
      report += `STRATEGIC OPPORTUNITIES\n`
      report += `${'-'.repeat(20)}\n`
      analysis.strategic_opportunities.forEach((opp, i) => {
        report += `${i + 1}. ${opp.use_case} (${opp.value_magnitude} VALUE)\n`
        report += `   Impact: ${opp.business_impact}\n`
        report += `   Implementation: ${opp.implementation_effort}\n\n`
      })
    }

    // Financial Analysis
    if (analysis.financial_analysis) {
      report += `FINANCIAL ANALYSIS\n`
      report += `${'-'.repeat(17)}\n`
      report += `Deal Size Range: ${analysis.financial_analysis.deal_size_range}\n`
      report += `ROI Projection: ${analysis.financial_analysis.roi_projection}\n`
      report += `Payback Period: ${analysis.financial_analysis.payback_period}\n`
      report += `Budget Source: ${analysis.financial_analysis.budget_source}\n\n`
    }

    // Score Reasoning
    if (analysis.score_reasoning) {
      report += `SCORE REASONING & METHODOLOGY\n`
      report += `${'-'.repeat(32)}\n`
      report += `${analysis.score_reasoning.document_title}\n\n`
      report += `Methodology: ${analysis.score_reasoning.methodology}\n\n`
      
      if (analysis.score_reasoning.dimension_analysis) {
        analysis.score_reasoning.dimension_analysis.forEach(dim => {
          report += `${dim.dimension.toUpperCase()} (${dim.score}/10)\n`
          report += `Reasoning: ${dim.reasoning}\n`
          report += `Supporting Data: ${dim.supporting_data}\n`
          if (dim.sources) {
            report += `Sources:\n`
            dim.sources.forEach(source => {
              report += `  - ${source.title}: ${source.url}\n`
            })
          }
          report += `\n`
        })
      }
    }

    // Challenges
    if (analysis.challenges) {
      report += `KEY CHALLENGES\n`
      report += `${'-'.repeat(14)}\n`
      analysis.challenges.forEach((challenge, i) => {
        report += `${i + 1}. ${challenge}\n`
      })
      report += `\n`
    }

    // Email Templates
    if (analysis.email_templates) {
      report += `EMAIL TEMPLATES\n`
      report += `${'-'.repeat(14)}\n`
      analysis.email_templates.forEach((template, i) => {
        report += `Template ${i + 1}: ${template.to}\n`
        report += `Subject: ${template.subject}\n`
        report += `Body:\n${template.body}\n\n`
      })
    }

    return report
  }

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAsText = () => {
    const report = generateTextReport()
    const filename = `analysis-${analysis.seller_company}-${analysis.target_company}-${new Date().toISOString().split('T')[0]}.txt`
    downloadFile(report, filename, 'text/plain')
    setShowExportMenu(false)
  }

  const exportAsJSON = () => {
    const jsonData = JSON.stringify(analysis, null, 2)
    const filename = `analysis-${analysis.seller_company}-${analysis.target_company}-${new Date().toISOString().split('T')[0]}.json`
    downloadFile(jsonData, filename, 'application/json')
    setShowExportMenu(false)
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

  // Check if we have the enhanced analysis format
  const hasEnhancedFormat = analysis.scorecard?.dimensions?.[0]?.detailed_analysis || 
                            analysis.scorecard?.dimensions?.[0]?.summary

  // Use enhanced component if available
  if (hasEnhancedFormat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={() => router.push('/')}
              className="text-gray-900 hover:text-gray-900"
            >
              ← Back to Home
            </button>
          </div>
        </div>
        <AnalysisReport analysis={analysis} />
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
                  {Math.round(overallScore)}%
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
                      {Number(dimension.score).toFixed(1)}/10
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

        {/* Score Reasoning & Methodology */}
        {analysis.score_reasoning && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Score Reasoning & Methodology
            </h3>
            
            {/* Document Header */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">
                {analysis.score_reasoning.document_title}
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Methodology:</strong> {analysis.score_reasoning.methodology}
              </p>
              {analysis.score_reasoning.overall_score_explanation && (
                <p className="text-sm text-gray-700">
                  <strong>Overall Score:</strong> {analysis.score_reasoning.overall_score_explanation}
                </p>
              )}
            </div>

            {/* Dimension Analysis */}
            {analysis.score_reasoning.dimension_analysis && (
              <div className="space-y-6">
                <h4 className="font-semibold text-gray-900 mb-4">Detailed Score Analysis</h4>
                {analysis.score_reasoning.dimension_analysis.map((dimension, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-semibold text-gray-900">{dimension.dimension}</h5>
                      <span className="text-lg font-bold text-blue-600">{Number(dimension.score).toFixed(1)}/10</span>
                    </div>
                    
                    <p className="text-gray-900 mb-3">{dimension.reasoning}</p>
                    
                    <div className="bg-blue-50 p-3 rounded mb-3">
                      <p className="text-sm text-blue-800">
                        <strong>Supporting Data:</strong> {dimension.supporting_data}
                      </p>
                    </div>
                    
                    {dimension.sources && dimension.sources.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Sources:</p>
                        <ul className="space-y-1">
                          {dimension.sources.map((source, sourceIndex) => (
                            <li key={sourceIndex} className="text-sm">
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {source.title}
                              </a>
                              <span className="text-gray-600 ml-2">- {source.relevance}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Methodology Notes */}
            {analysis.score_reasoning.methodology_notes && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h5 className="font-semibold text-yellow-800 mb-2">Methodology Notes</h5>
                <ul className="space-y-1">
                  {analysis.score_reasoning.methodology_notes.map((note, index) => (
                    <li key={index} className="text-sm text-yellow-700">• {note}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            {analysis.score_reasoning.disclaimer && (
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <p className="text-xs text-gray-600 italic">
                  <strong>Disclaimer:</strong> {analysis.score_reasoning.disclaimer}
                </p>
              </div>
            )}
          </div>
        )}

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

        {/* Export Button - Bottom Left */}
        <div className="relative mt-8">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 shadow-lg"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export Report
          </button>
          
          {/* Export Menu */}
          {showExportMenu && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-lg shadow-lg border z-10">
              <div className="py-2">
                <button
                  onClick={exportAsText}
                  className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  Export as Text (.txt)
                </button>
                <button
                  onClick={exportAsJSON}
                  className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  Export as JSON (.json)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}