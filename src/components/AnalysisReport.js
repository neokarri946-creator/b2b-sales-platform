'use client'

import { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

export default function AnalysisReport({ analysis }) {
  const [expandedSections, setExpandedSections] = useState({})
  const [expandedDimensions, setExpandedDimensions] = useState({})

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const toggleDimension = (dimension) => {
    setExpandedDimensions(prev => ({
      ...prev,
      [dimension]: !prev[dimension]
    }))
  }

  // Calculate overall score
  const overallScore = analysis.scorecard?.overall_score || analysis.success_probability || 65

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 mb-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              B2B Sales Analysis Report
            </h1>
            <p className="text-xl opacity-90">
              {analysis.seller_company} → {analysis.target_company}
            </p>
            <p className="text-sm mt-2 opacity-80">
              Generated: {new Date(analysis.timestamp).toLocaleDateString()}
            </p>
            <p className="text-sm opacity-80">
              Methodology: {analysis.analysis_methodology || 'Enhanced Solution Affinity Scorecard v3.0'}
            </p>
            {analysis.data_freshness && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm opacity-90">
                  {analysis.data_freshness.data_status || '🔄 Live Data'}
                </span>
                <span className="text-xs opacity-80">
                  ({analysis.data_freshness.seller.news_count + analysis.data_freshness.target.news_count} fresh articles)
                </span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">
              {Math.round(overallScore)}%
            </div>
            <div className="text-sm opacity-90 mt-1">Success Probability</div>
          </div>
        </div>
      </div>

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

          {/* Individual Dimensions with Expandable Details */}
          <div className="space-y-6">
            {/* Expand/Collapse All Button */}
            {analysis.scorecard.dimensions?.some(d => d.detailed_analysis) && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    const allExpanded = analysis.scorecard.dimensions.every(d => 
                      expandedDimensions[d.name]
                    )
                    const newState = {}
                    analysis.scorecard.dimensions.forEach(d => {
                      if (d.detailed_analysis) {
                        newState[d.name] = !allExpanded
                      }
                    })
                    setExpandedDimensions(newState)
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  {analysis.scorecard.dimensions.every(d => expandedDimensions[d.name]) ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4 mr-1" />
                      Collapse All
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4 mr-1" />
                      Expand All
                    </>
                  )}
                </button>
              </div>
            )}
            
            {analysis.scorecard.dimensions?.map((dimension, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {dimension.name}
                      </h4>
                      <span className="ml-2 text-sm text-gray-600">
                        (Weight: {(dimension.weight * 100).toFixed(0)}%)
                      </span>
                    </div>
                    
                    {/* Summary - Always visible */}
                    <p className="text-sm text-gray-700 mt-2">
                      {dimension.summary || dimension.rationale}
                    </p>
                    
                    {/* View More/Less Button */}
                    {dimension.detailed_analysis && (
                      <button
                        onClick={() => toggleDimension(dimension.name)}
                        className={`mt-3 text-sm font-medium flex items-center px-2 py-1 rounded transition-colors ${
                          expandedDimensions[dimension.name] 
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        {expandedDimensions[dimension.name] ? (
                          <>
                            <ChevronUpIcon className="h-4 w-4 mr-1" />
                            Collapse
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="h-4 w-4 mr-1" />
                            View Detailed Analysis
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Detailed Analysis - Expandable */}
                    {expandedDimensions[dimension.name] && dimension.detailed_analysis && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-semibold text-gray-900 mb-2">Detailed Analysis</h5>
                        <p className="text-gray-700 whitespace-pre-wrap mb-4">
                          {dimension.detailed_analysis}
                        </p>
                        
                        {/* Enterprise-Grade Sources with Quotes */}
                        {dimension.sources && dimension.sources.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h6 className="font-semibold text-gray-900 text-sm mb-3 flex items-center">
                              Sources & Evidence
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Enterprise Verified
                              </span>
                            </h6>
                            <div className="space-y-3">
                              {dimension.sources.map((source, idx) => (
                                <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <a 
                                        href={source.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-800 hover:text-blue-900 underline font-semibold text-sm inline-flex items-center"
                                      >
                                        {source.title}
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                      </a>
                                    </div>
                                    {source.trust_indicator && (
                                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                                        source.trust_indicator.includes('Fresh') ? 
                                        'bg-blue-100 text-blue-700' : 
                                        'bg-green-100 text-green-700'
                                      }`}>
                                        {source.trust_indicator}
                                      </span>
                                    )}
                                  </div>
                                  
                                  {(source.display || source.quote) && (
                                    <div className="bg-white bg-opacity-70 rounded p-3 mb-2">
                                      <blockquote className="text-gray-800 text-sm leading-relaxed">
                                        {source.display || `"${source.quote}"`}
                                      </blockquote>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="text-gray-600">
                                      <span className="font-medium">Relevance:</span> {source.relevance}
                                    </div>
                                    {source.authority && (
                                      <div className="text-gray-500">
                                        Source: {source.authority}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {source.citation && (
                                    <div className="mt-2 pt-2 border-t border-blue-200">
                                      <p className="text-xs text-gray-500 font-mono">
                                        {source.citation}
                                        {source.freshness && (
                                          <span className="ml-2 text-blue-600 font-sans font-medium">
                                            • {source.freshness}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {Number(dimension.score).toFixed(1)}/10
                    </div>
                    <div className={`text-xs font-semibold mt-1 ${
                      dimension.score >= 7 ? 'text-green-600' :
                      dimension.score >= 5 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {dimension.score >= 7 ? 'STRONG' :
                       dimension.score >= 5 ? 'MODERATE' :
                       'WEAK'}
                    </div>
                  </div>
                </div>
                
                {/* Score Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Strategic Opportunities
            </h2>
            <button
              onClick={() => toggleSection('opportunities')}
              className="text-blue-600 hover:text-blue-800"
            >
              {expandedSections.opportunities ? (
                <ChevronUpIcon className="h-6 w-6" />
              ) : (
                <ChevronDownIcon className="h-6 w-6" />
              )}
            </button>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
            expandedSections.opportunities ? '' : 'max-h-96 overflow-hidden'
          }`}>
            {analysis.strategic_opportunities.map((opp, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900">{opp.use_case}</h4>
                  <span className={`px-2 py-1 text-xs rounded font-semibold ${
                    opp.value_magnitude === 'HIGH' ? 'bg-green-100 text-green-800' :
                    opp.value_magnitude === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {opp.value_magnitude} VALUE
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{opp.business_impact}</p>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Implementation:</span>
                    <span className="font-semibold">{opp.implementation_effort}</span>
                  </div>
                  {opp.expected_roi && (
                    <div className="flex justify-between">
                      <span>Expected ROI:</span>
                      <span className="font-semibold text-green-600">{opp.expected_roi}</span>
                    </div>
                  )}
                  {opp.timeline && (
                    <div className="flex justify-between">
                      <span>Timeline:</span>
                      <span className="font-semibold">{opp.timeline}</span>
                    </div>
                  )}
                </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Deal Size Range</h4>
              <p className="text-2xl font-bold text-blue-600">
                {analysis.financial_analysis.deal_size_range}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">ROI Projection</h4>
              <p className="text-2xl font-bold text-green-600">
                {analysis.financial_analysis.roi_projection}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Payback Period</h4>
              <p className="text-2xl font-bold text-purple-600">
                {analysis.financial_analysis.payback_period}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Budget Source</h4>
              <p className="text-lg font-semibold text-gray-900">
                {analysis.financial_analysis.budget_source}
              </p>
            </div>
            {analysis.financial_analysis.tco_analysis && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">TCO Analysis</h4>
                <p className="text-lg font-semibold text-gray-900">
                  {analysis.financial_analysis.tco_analysis}
                </p>
              </div>
            )}
            {analysis.financial_analysis.risk_adjusted_return && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Risk-Adjusted Return</h4>
                <p className="text-lg font-semibold text-orange-600">
                  {analysis.financial_analysis.risk_adjusted_return}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Challenges & Mitigation */}
      {analysis.challenges && analysis.challenges.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Key Challenges & Mitigation Strategies
          </h2>
          <div className="space-y-4">
            {analysis.challenges.map((challenge, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-800 text-sm font-semibold">
                      {index + 1}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {typeof challenge === 'string' ? challenge : challenge.risk}
                    </h4>
                    {challenge.mitigation && (
                      <p className="text-sm text-gray-700 mb-2">
                        <span className="font-semibold">Mitigation:</span> {challenge.mitigation}
                      </p>
                    )}
                    {challenge.probability && challenge.impact && (
                      <div className="flex space-x-4 text-xs">
                        <span className={`px-2 py-1 rounded ${
                          challenge.probability === 'High' ? 'bg-red-100 text-red-800' :
                          challenge.probability === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Probability: {challenge.probability}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          challenge.impact === 'High' ? 'bg-red-100 text-red-800' :
                          challenge.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          Impact: {challenge.impact}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}