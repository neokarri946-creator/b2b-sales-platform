'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default function FeaturesPage() {
  const router = useRouter()
  const [selectedFeature, setSelectedFeature] = useState(0)
  console.log(selectedFeature) // Using selectedFeature for future expansion

  const features = [
    {
      title: 'Solution Affinity Scorecard',
      icon: '📊',
      description: 'Comprehensive scoring across 5 critical dimensions',
      details: [
        'Market Alignment Analysis (25% weight)',
        'Budget Readiness Assessment (20% weight)',
        'Technology Fit Evaluation (20% weight)',
        'Competitive Position Analysis (20% weight)',
        'Implementation Readiness (15% weight)'
      ]
    },
    {
      title: 'AI-Powered Analysis',
      icon: '🤖',
      description: 'GPT-4 enhanced with proprietary B2B framework',
      details: [
        'Real-time company validation via Yahoo Finance',
        'Industry-specific insights and patterns',
        'Contextual analysis based on market data',
        'Quality scoring algorithm (0-100%)',
        'Fallback to web search for private companies'
      ]
    },
    {
      title: 'Financial Intelligence',
      icon: '💰',
      description: 'Data-driven deal size and ROI projections',
      details: [
        'Deal size range calculation',
        'Conservative & optimistic ROI projections',
        'Payback period estimation',
        'TCO comparison vs alternatives',
        'Budget source identification'
      ]
    },
    {
      title: 'Strategic Opportunities',
      icon: '🎯',
      description: 'Identify 4-5 high-impact business use cases',
      details: [
        'Business outcome focused recommendations',
        'Value magnitude assessment (HIGH/MEDIUM/LOW)',
        'Quantified business impact metrics',
        'Implementation effort estimation',
        'Time-to-value projections'
      ]
    },
    {
      title: 'Risk Assessment',
      icon: '⚠️',
      description: 'Proactive identification and mitigation strategies',
      details: [
        'Organizational risk analysis',
        'Technical integration challenges',
        'Competitive threat assessment',
        'Market timing considerations',
        'Mitigation strategy for each risk'
      ]
    },
    {
      title: 'Email Templates',
      icon: '✉️',
      description: 'Personalized outreach sequences that convert',
      details: [
        'Executive-level messaging',
        'Technical buyer approach',
        'Champion building templates',
        'Follow-up sequences',
        'Value-focused messaging'
      ]
    }
  ]

  const comparisonData = [
    { feature: 'AI-Powered Analysis', us: true, basic: false, enterprise: true },
    { feature: 'Solution Affinity Scorecard', us: true, basic: false, enterprise: false },
    { feature: 'Real-time Company Validation', us: true, basic: false, enterprise: false },
    { feature: 'Financial Projections', us: true, basic: true, enterprise: true },
    { feature: 'Strategic Opportunities', us: true, basic: false, enterprise: true },
    { feature: 'Risk Assessment', us: true, basic: false, enterprise: true },
    { feature: 'Email Templates', us: true, basic: true, enterprise: true },
    { feature: 'Quality Scoring', us: true, basic: false, enterprise: false },
    { feature: 'Framework Methodology', us: true, basic: false, enterprise: false },
    { feature: 'Stock Market Integration', us: true, basic: false, enterprise: false },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered B2B Sales Intelligence
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Combining advanced AI with proven B2B methodology to deliver 
            comprehensive sales analysis that actually drives results
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/analysis/new')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-lg"
            >
              Start Free Analysis
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 border-2 border-blue-600"
            >
              View Pricing
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">85%</div>
            <div className="text-gray-600">Accuracy Rate</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">2.5x</div>
            <div className="text-gray-600">Faster Analysis</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">$2.3B</div>
            <div className="text-gray-600">Deals Analyzed</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">12,847</div>
            <div className="text-gray-600">Weekly Analyses</div>
          </div>
        </div>

        {/* Core Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Comprehensive Analysis Framework
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedFeature(index)}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.slice(0, 3).map((detail, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm text-gray-700">{detail}</span>
                    </li>
                  ))}
                </ul>
                <button className="text-blue-600 text-sm font-semibold mt-4 hover:text-blue-700">
                  Learn more →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            How Our AI Analysis Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Input Companies</h3>
              <p className="text-sm text-gray-600">
                Enter seller and target companies with auto-validation
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Market Validation</h3>
              <p className="text-sm text-gray-600">
                Real-time verification via Yahoo Finance APIs
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-sm text-gray-600">
                GPT-4 + proprietary B2B framework processing
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Actionable Report</h3>
              <p className="text-sm text-gray-600">
                Comprehensive analysis with scoring and templates
              </p>
            </div>
          </div>
        </div>

        {/* Solution Affinity Scorecard Detail */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Solution Affinity Scorecard™
          </h2>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4">
                  5-Dimensional Analysis Framework
                </h3>
                <p className="mb-6">
                  Our proprietary scorecard evaluates opportunities across five critical dimensions, 
                  each weighted according to B2B sales success patterns from thousands of deals.
                </p>
                <div className="space-y-3">
                  {[
                    { name: 'Market Alignment', weight: 25, score: 8.5 },
                    { name: 'Budget Readiness', weight: 20, score: 7.2 },
                    { name: 'Technology Fit', weight: 20, score: 9.1 },
                    { name: 'Competitive Position', weight: 20, score: 6.8 },
                    { name: 'Implementation Readiness', weight: 15, score: 7.5 }
                  ].map((dim, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{dim.name}</span>
                        <span className="text-sm">{dim.weight}% | Score: {dim.score}/10</span>
                      </div>
                      <div className="bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white rounded-full h-2"
                          style={{ width: `${dim.score * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold mb-4">76%</div>
                  <div className="text-2xl mb-2">Overall Score</div>
                  <div className="text-lg opacity-90">High Probability Deal</div>
                  <button
                    onClick={() => router.push('/analysis/new')}
                    className="mt-6 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
                  >
                    Get Your Score
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our AI Analyzer?
          </h2>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-600">
                    Our AI Platform
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    Basic CRM
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-600">
                    Enterprise Solution
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{row.feature}</td>
                    <td className="px-6 py-4 text-center">
                      {row.us ? (
                        <span className="text-green-500 text-xl">✓</span>
                      ) : (
                        <span className="text-gray-300 text-xl">✗</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.basic ? (
                        <span className="text-green-500 text-xl">✓</span>
                      ) : (
                        <span className="text-gray-300 text-xl">✗</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.enterprise ? (
                        <span className="text-green-500 text-xl">✓</span>
                      ) : (
                        <span className="text-gray-300 text-xl">✗</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Perfect For Every Sales Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3">Startups</h3>
              <p className="text-gray-600 mb-4">
                Identify and qualify enterprise opportunities without a large sales team
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Quick market validation</li>
                <li>• Competitive positioning</li>
                <li>• Email templates that convert</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-3xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-3">Scale-ups</h3>
              <p className="text-gray-600 mb-4">
                Scale your sales process with data-driven insights and automation
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Deal prioritization</li>
                <li>• Financial projections</li>
                <li>• Risk assessment</li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="text-3xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold mb-3">Enterprises</h3>
              <p className="text-gray-600 mb-4">
                Enhance your sales intelligence with AI-powered strategic analysis
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Strategic opportunities</li>
                <li>• Comprehensive scoring</li>
                <li>• Executive reporting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="bg-gray-50 rounded-2xl p-12 mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Powered by Advanced Technology
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">AI Models</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <span className="text-blue-600">🤖</span>
                  </div>
                  <div>
                    <div className="font-semibold">GPT-4 & GPT-3.5 Turbo</div>
                    <div className="text-sm text-gray-600">Advanced language understanding</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <span className="text-green-600">📊</span>
                  </div>
                  <div>
                    <div className="font-semibold">Proprietary Scoring Algorithm</div>
                    <div className="text-sm text-gray-600">B2B-specific success patterns</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <span className="text-purple-600">🔍</span>
                  </div>
                  <div>
                    <div className="font-semibold">Quality Assessment Engine</div>
                    <div className="text-sm text-gray-600">0-100% accuracy scoring</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Data Sources</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                    <span className="text-yellow-600">📈</span>
                  </div>
                  <div>
                    <div className="font-semibold">Yahoo Finance API</div>
                    <div className="text-sm text-gray-600">Real-time market data</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-lg mr-3">
                    <span className="text-red-600">🌐</span>
                  </div>
                  <div>
                    <div className="font-semibold">Web Intelligence</div>
                    <div className="text-sm text-gray-600">Private company research</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                    <span className="text-indigo-600">💾</span>
                  </div>
                  <div>
                    <div className="font-semibold">Historical Analysis</div>
                    <div className="text-sm text-gray-600">Pattern recognition database</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Sales Process?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of sales teams using AI to identify, qualify, and close more deals
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/analysis/new')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-lg"
            >
              Start Free Analysis
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 border-2 border-blue-600"
            >
              View Pricing
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • 1 free analysis/month • Results in 60 seconds
          </p>
        </div>
      </div>
    </div>
  )
}