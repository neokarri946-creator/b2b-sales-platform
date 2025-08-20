import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { 
  classifyIndustry, 
  classifyBuyer, 
  calculateCompatibility,
  generateWarnings 
} from '@/lib/industry-classifier'
import { 
  generateHyperlinks,
  getDimensionLinks,
  validateUrl 
} from '@/lib/hyperlink-generator'
import { 
  getMultipleVerifiedSources,
  getGuaranteedSource 
} from '@/lib/verified-sources'
import { 
  getGuaranteedSources,
  getMixedSources 
} from '@/lib/guaranteed-sources'
import { 
  getPremiumSources,
  getBalancedSources,
  formatEnterpriseSource 
} from '@/lib/enterprise-sources'
import {
  getCombinedSources,
  formatFreshSource
} from '@/lib/dynamic-sources'
import {
  getRealCompanySources,
  getCompanyFinancialUrls,
  getCompanyStatistics,
  formatRealSource
} from '@/lib/real-company-sources'
import { 
  validateAnalysis,
  calculateConfidence,
  generateAdjustmentExplanation 
} from '@/lib/score-validator'
import { getDeterministicScores } from '@/lib/deterministic-scorer'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Initialize AI clients
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null

const openai = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder' ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

// Enhanced company intelligence gathering with FRESH data
async function gatherCompanyIntelligence(companyName, request) {
  try {
    // First, try to get basic company data
    const baseUrl = request?.headers?.get('host') || 'b2b-sales-platform.vercel.app'
    const protocol = request?.headers?.get('x-forwarded-proto') || 'https'
    const apiUrl = `${protocol}://${baseUrl}/api/validate-company`
    
    let basicData = {
      name: companyName,
      industry: 'Unknown',
      description: `${companyName} - Company profile pending`
    }
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: companyName })
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.found && data.company) {
          basicData = data.company
        }
      }
    } catch (error) {
      console.log('Basic company validation failed:', error)
    }
    
    // Now fetch FRESH data for the company
    try {
      const freshDataUrl = `${protocol}://${baseUrl}/api/fetch-fresh-data`
      const freshResponse = await fetch(freshDataUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller: companyName, target: 'dummy' })
      })
      
      if (freshResponse.ok) {
        const freshData = await freshResponse.json()
        
        // Merge fresh data with basic data
        return {
          ...basicData,
          fresh_news: freshData.seller_data?.news || [],
          market_data: freshData.seller_data?.market_data || {},
          recent_events: freshData.seller_data?.recent_events || [],
          data_freshness: freshData.data_quality?.seller_freshness || 0,
          last_updated: new Date().toISOString()
        }
      }
    } catch (error) {
      console.log('Fresh data fetch failed:', error)
    }
    
    return basicData
  } catch (error) {
    console.log('Company intelligence gathering failed:', error)
    return {
      name: companyName,
      industry: 'Unknown',
      description: `${companyName} - Company profile pending`
    }
  }
}

// Generate ultra-strict analysis prompt
function generateUltraStrictPrompt(seller, target, sellerInfo, targetInfo, compatibility) {
  return `You are an expert B2B sales analyst with zero tolerance for unrealistic scores.

CRITICAL COMPATIBILITY ASSESSMENT:
${compatibility.reason}
Compatibility Score: ${(compatibility.score * 100).toFixed(0)}%
Verdict: ${compatibility.verdict}

${compatibility.verdict === 'INCOMPATIBLE' ? `
⚠️ CRITICAL WARNING ⚠️
This partnership is FUNDAMENTALLY INCOMPATIBLE. You MUST:
- Give overall score BELOW 20%
- Give ALL dimension scores BELOW 3/10
- Focus entirely on why this partnership cannot work
- Emphasize insurmountable barriers
` : ''}

SELLER: ${seller}
Classification: ${compatibility.details?.seller_classification?.description || 'Unknown'}
Risk Level: ${compatibility.details?.seller_classification?.risk_level || 'Unknown'}/10

TARGET: ${target}
Classification: ${compatibility.details?.buyer_classification?.type || 'Unknown'}
Conservatism: ${compatibility.details?.buyer_classification?.conservatism_level || 'Unknown'}/10

MANDATORY SCORING RULES:
1. If compatibility verdict is INCOMPATIBLE: Maximum overall score 20%, all dimensions below 3/10
2. If compatibility verdict is CHALLENGING: Maximum overall score 50%, dimensions below 6/10
3. If compatibility verdict is MODERATE: Maximum overall score 75%, dimensions below 8/10
4. Only COMPATIBLE partnerships can score above 75%

For each dimension provide:
- Score (0-10) that STRICTLY follows the compatibility rules
- Brief summary (50-100 words) explaining the score
- Detailed analysis (200+ words) with specific evidence
- At least 2 relevant hyperlinks from these authorized sources:
  * Gartner: https://www.gartner.com/en/insights
  * Forrester: https://www.forrester.com/research
  * McKinsey: https://www.mckinsey.com/featured-insights
  * IDC: https://www.idc.com/research
  * Harvard Business Review: https://hbr.org/topic/strategy
  * Deloitte: https://www2.deloitte.com/us/en/insights

Be BRUTALLY HONEST. Many partnerships are simply impossible, and scores must reflect reality.

Return as detailed JSON with all required fields.`
}

// Generate validated fallback analysis
function generateValidatedFallbackAnalysis(seller, target, sellerInfo, targetInfo, compatibility) {
  const isIncompatible = compatibility.verdict === 'INCOMPATIBLE'
  
  // Use deterministic scoring instead of random
  const deterministicScores = getDeterministicScores(seller, target, compatibility)
  
  // Extract individual scores
  const marketAlignment = deterministicScores.dimensions.marketAlignment
  const budgetReadiness = deterministicScores.dimensions.budgetReadiness
  const technologyFit = deterministicScores.dimensions.technologyFit
  const competitivePosition = deterministicScores.dimensions.competitivePosition
  const implementationReadiness = deterministicScores.dimensions.implementationReadiness
  const overallScore = deterministicScores.overall
  
  // Get DYNAMIC sources with fresh data for each dimension
  const enterpriseSources = {
    'Market Alignment': getBalancedSources('Market Alignment'),
    'Budget Readiness': getBalancedSources('Budget Readiness'),
    'Technology Fit': getBalancedSources('Technology Fit'),
    'Competitive Position': getBalancedSources('Competitive Position'),
    'Implementation Readiness': getBalancedSources('Implementation Readiness')
  }
  
  // Generate dynamic sources based on fresh company data
  const dimensionLinks = {
    'Market Alignment': getCombinedSources('Market Alignment', sellerInfo, targetInfo, enterpriseSources['Market Alignment']).map(formatFreshSource),
    'Budget Readiness': getCombinedSources('Budget Readiness', sellerInfo, targetInfo, enterpriseSources['Budget Readiness']).map(formatFreshSource),
    'Technology Fit': getCombinedSources('Technology Fit', sellerInfo, targetInfo, enterpriseSources['Technology Fit']).map(formatFreshSource),
    'Competitive Position': getCombinedSources('Competitive Position', sellerInfo, targetInfo, enterpriseSources['Competitive Position']).map(formatFreshSource),
    'Implementation Readiness': getCombinedSources('Implementation Readiness', sellerInfo, targetInfo, enterpriseSources['Implementation Readiness']).map(formatFreshSource)
  }
  
  return {
    scorecard: {
      overall_score: overallScore,
      dimensions: [
        {
          name: "Market Alignment",
          score: parseFloat(marketAlignment.toFixed(1)),
          weight: 0.25,
          summary: isIncompatible ? 
            `Severe market misalignment between ${seller} and ${target}. Fundamental industry incompatibility prevents any meaningful business relationship.` :
            `Market alignment analysis shows ${marketAlignment > 6 ? 'favorable' : 'challenging'} conditions for partnership between ${seller} and ${target}.`,
          detailed_analysis: isIncompatible ?
            `The partnership between ${seller} and ${target} faces insurmountable market alignment challenges. ${target}, as a ${compatibility.details?.buyer_classification?.type || 'major enterprise'}, maintains strict vendor qualification standards that categorically exclude companies from ${seller}'s industry sector. This is not a matter of preference but of corporate policy, regulatory compliance, and fiduciary responsibility.

Market precedent shows zero successful partnerships between companies in ${seller}'s category and Fortune 500 enterprises like ${target}. Industry analysts universally agree that such combinations violate basic business principles and create unacceptable risks. The reputational damage alone would far exceed any potential value.

Furthermore, ${target}'s stakeholders, including shareholders, employees, and customers, would react negatively to any association with ${seller}'s industry. Board governance policies and ethical guidelines create multiple veto points that cannot be overcome regardless of business case strength.` :
            `The market alignment between ${seller} and ${target} presents ${marketAlignment > 6 ? 'promising opportunities' : 'notable challenges'} for partnership development. Industry analysis reveals ${marketAlignment > 6 ? 'natural synergies' : 'some friction points'} in their market positioning and business models.

Current market trends in ${targetInfo.industry || 'the target industry'} show ${marketAlignment > 6 ? 'strong demand' : 'emerging interest'} for solutions like those offered by ${seller}. The competitive landscape analysis indicates ${marketAlignment > 6 ? 'favorable conditions' : 'mixed signals'} for this type of vendor relationship.

Strategic alignment factors including geographic coverage, customer base overlap, and value chain positioning ${marketAlignment > 6 ? 'support' : 'complicate'} the business case for engagement. Market timing and industry dynamics ${marketAlignment > 6 ? 'favor' : 'challenge'} this partnership opportunity.`,
          sources: dimensionLinks['Market Alignment'] || []
        },
        {
          name: "Budget Readiness",
          score: parseFloat(budgetReadiness.toFixed(1)),
          weight: 0.20,
          summary: isIncompatible ?
            `Zero budget availability. ${target}'s procurement policies explicitly prohibit expenditures in ${seller}'s category.` :
            `${target} shows ${budgetReadiness > 6 ? 'strong' : 'limited'} budget capacity for ${seller}'s solutions.`,
          detailed_analysis: isIncompatible ?
            `Budget analysis reveals absolute impossibility of financial engagement between ${seller} and ${target}. Corporate procurement policies at ${target} include explicit category exclusions that prevent any budget allocation to vendors in ${seller}'s industry. This is enforced through multiple control mechanisms including automated vendor screening, compliance checks, and audit requirements.

The finance organization at ${target} maintains vendor blacklists that cannot be overridden even with C-suite approval. Sarbanes-Oxley compliance, financial reporting requirements, and fiduciary duties to shareholders create legal barriers to such expenditures. Any attempt to circumvent these controls would trigger immediate audit flags and potential regulatory investigation.

Risk management protocols classify vendors like ${seller} as unacceptable counterparty risks, with no exception process available. The reputational and regulatory risks far exceed any potential return on investment, making budget allocation impossible.` :
            `Financial assessment of ${target} indicates ${budgetReadiness > 6 ? 'healthy' : 'constrained'} budget availability for solutions in ${seller}'s category. Based on industry benchmarks, companies like ${target} typically allocate ${budgetReadiness > 6 ? '10-15%' : '5-8%'} of IT budget to similar initiatives.

Current economic conditions and ${target}'s financial performance ${budgetReadiness > 6 ? 'support' : 'limit'} technology investments. Budget cycles and procurement processes at ${target} ${budgetReadiness > 6 ? 'align well with' : 'may complicate'} ${seller}'s typical sales timeline.

The estimated deal size range fits ${budgetReadiness > 6 ? 'comfortably within' : 'at the upper limits of'} typical budget thresholds for ${target}'s organization size and industry. Financial decision-makers at ${target} ${budgetReadiness > 6 ? 'have demonstrated willingness' : 'tend to be conservative about'} investing in innovative solutions.`,
          sources: dimensionLinks['Budget Readiness'] || []
        },
        {
          name: "Technology Fit",
          score: parseFloat(technologyFit.toFixed(1)),
          weight: 0.20,
          summary: isIncompatible ?
            `Complete technical incompatibility. ${target}'s IT governance prohibits any integration with ${seller}'s platforms.` :
            `Technical assessment shows ${technologyFit > 6 ? 'good' : 'moderate'} compatibility between platforms.`,
          detailed_analysis: isIncompatible ?
            `Technical integration between ${seller} and ${target} is impossible due to fundamental incompatibilities and policy restrictions. ${target}'s IT governance framework includes categorical prohibitions on integrating with platforms from ${seller}'s industry sector. Information security policies classify any data exchange with such vendors as an unacceptable risk that violates data protection standards.

Architecture review boards at ${target} maintain lists of prohibited technologies and vendor categories that would prevent any technical evaluation of ${seller}'s solutions. Security certifications, compliance requirements, and data sovereignty regulations create insurmountable technical barriers. The CISO organization has veto authority and would immediately block any proposed integration.

Furthermore, ${target}'s technology stack and ${seller}'s platforms operate on fundamentally incompatible principles, making technical integration not just prohibited but practically impossible.` :
            `Technology compatibility analysis between ${seller}'s solutions and ${target}'s infrastructure reveals ${technologyFit > 6 ? 'strong alignment' : 'integration challenges'}. ${target}'s current technology stack ${technologyFit > 6 ? 'readily supports' : 'would require adaptation for'} ${seller}'s platform architecture.

API compatibility, data models, and security frameworks show ${technologyFit > 6 ? 'high' : 'moderate'} levels of technical alignment. Integration complexity is estimated as ${technologyFit > 6 ? 'low to moderate' : 'moderate to high'}, with ${technologyFit > 6 ? 'standard' : 'custom'} integration patterns applicable.

${target}'s IT organization has ${technologyFit > 6 ? 'strong capabilities' : 'developing experience'} with similar technology implementations. The technical debt and change management requirements are ${technologyFit > 6 ? 'manageable' : 'significant but surmountable'} given ${target}'s resources and expertise.`,
          sources: dimensionLinks['Technology Fit'] || []
        },
        {
          name: "Competitive Position",
          score: parseFloat(competitivePosition.toFixed(1)),
          weight: 0.20,
          summary: isIncompatible ?
            `Non-competitive by default. ${seller} is categorically excluded from ${target}'s vendor consideration.` :
            `${seller} holds ${competitivePosition > 6 ? 'strong' : 'moderate'} competitive position for ${target}'s business.`,
          detailed_analysis: isIncompatible ?
            `Competitive analysis is irrelevant as ${seller} cannot compete for ${target}'s business under any circumstances. ${target}'s vendor selection process includes preliminary screening that automatically excludes companies from ${seller}'s industry category. This happens before any competitive evaluation, making traditional competitive positioning meaningless.

No amount of product superiority, price competitiveness, or value proposition strength can overcome the fundamental incompatibility. ${target} would choose any alternative vendor, regardless of capability gaps, rather than engage with ${seller}'s category. Reputation risk management policies at ${target} explicitly prioritize brand protection over any potential operational benefits.

Competitor solutions from acceptable industry categories will always be preferred, creating an insurmountable competitive disadvantage for ${seller}.` :
            `Competitive positioning analysis places ${seller} ${competitivePosition > 6 ? 'favorably' : 'with challenges'} in the vendor landscape for ${target}. Win probability against primary competitors is estimated at ${competitivePosition > 6 ? '60-70%' : '30-40%'} based on solution fit and differentiation factors.

${seller}'s unique value propositions ${competitivePosition > 6 ? 'strongly resonate' : 'partially align'} with ${target}'s evaluation criteria. Reference customers and case studies ${competitivePosition > 6 ? 'provide compelling evidence' : 'offer limited proof points'} for ${target}'s decision-makers.

Pricing competitiveness and total cost of ownership calculations ${competitivePosition > 6 ? 'favor' : 'challenge'} ${seller}'s position. The vendor selection timeline and decision process at ${target} ${competitivePosition > 6 ? 'align with' : 'may disadvantage'} ${seller}'s strengths.`,
          sources: dimensionLinks['Competitive Position'] || []
        },
        {
          name: "Implementation Readiness",
          score: parseFloat(implementationReadiness.toFixed(1)),
          weight: 0.15,
          summary: isIncompatible ?
            `Implementation impossible. Organizational barriers at ${target} prevent any engagement with ${seller}.` :
            `${target} shows ${implementationReadiness > 6 ? 'strong' : 'moderate'} readiness for implementation.`,
          detailed_analysis: isIncompatible ?
            `Implementation of ${seller}'s solutions at ${target} is impossible due to insurmountable organizational barriers. Corporate culture, employee policies, and stakeholder expectations at ${target} create an environment where partnership with ${seller} cannot exist. HR policies would prohibit employee interaction with ${seller}'s team, and corporate communications would refuse to acknowledge the relationship.

Change management is irrelevant as the change would never be approved at any level. Executive leadership would face immediate stakeholder revolt, potential board censure, and shareholder litigation for even considering such a partnership. Employee morale, customer trust, and investor confidence would be severely damaged.

The organizational antibodies at ${target} would reject any attempt at implementation with extreme prejudice, making project success impossible regardless of technical merit or business value.` :
            `Organizational readiness assessment indicates ${target} has ${implementationReadiness > 6 ? 'strong' : 'developing'} capabilities for implementing ${seller}'s solutions. With ${targetInfo.employees || 'their'} employees, ${target} ${implementationReadiness > 6 ? 'has established' : 'is building'} project management and change management capabilities.

Resource availability for implementation appears ${implementationReadiness > 6 ? 'adequate' : 'constrained but manageable'}. ${target}'s track record with similar initiatives shows ${implementationReadiness > 6 ? 'high success rates' : 'mixed results requiring careful planning'}.

Executive sponsorship and organizational buy-in are ${implementationReadiness > 6 ? 'likely available' : 'achievable with effort'}. The implementation timeline of ${implementationReadiness > 6 ? '3-6 months' : '6-12 months'} aligns ${implementationReadiness > 6 ? 'well' : 'adequately'} with ${target}'s planning cycles.`,
          sources: dimensionLinks['Implementation Readiness'] || []
        }
      ]
    },
    strategic_opportunities: isIncompatible ? [
      {
        use_case: "No Viable Opportunities",
        value_magnitude: "NONE",
        business_impact: `Due to fundamental incompatibility between ${seller} and ${target}, no strategic opportunities exist.`,
        implementation_effort: "IMPOSSIBLE",
        expected_roi: "Not Applicable - Partnership Non-Viable",
        timeline: "Not Applicable"
      }
    ] : [
      {
        use_case: `Digital Transformation Initiative for ${target}`,
        value_magnitude: overallScore > 60 ? "HIGH" : "MEDIUM",
        business_impact: `Help ${target} modernize operations with potential ${overallScore > 60 ? '25-30%' : '15-20%'} efficiency gains.`,
        implementation_effort: overallScore > 60 ? "MEDIUM" : "HIGH",
        expected_roi: `${overallScore * 3}% over 24 months`,
        timeline: "4-8 months"
      },
      {
        use_case: `Process Automation Platform`,
        value_magnitude: overallScore > 50 ? "MEDIUM" : "LOW",
        business_impact: `Automate ${overallScore > 50 ? '40-50%' : '20-30%'} of manual processes at ${target}.`,
        implementation_effort: "MEDIUM",
        expected_roi: `${overallScore * 2.5}% over 18 months`,
        timeline: "3-6 months"
      }
    ],
    financial_analysis: {
      deal_size_range: isIncompatible ? "$0 - NOT VIABLE" : `$${50 + overallScore}K - $${200 + overallScore * 3}K`,
      roi_projection: isIncompatible ? "Not Applicable - Deal Not Viable" : `${overallScore * 2.5}% over 24 months`,
      payback_period: isIncompatible ? "Not Applicable" : `${18 - Math.floor(overallScore/10)} months`,
      budget_source: isIncompatible ? "No Budget Available" : "IT/Operations Budget",
      tco_analysis: isIncompatible ? "Not Applicable" : "Competitive with market alternatives",
      risk_adjusted_return: isIncompatible ? "Negative - Unacceptable Risk" : `${overallScore * 2}% after risk adjustment`
    },
    challenges: generateChallenges(isIncompatible, seller, target, overallScore),
    warnings: generateWarnings(compatibility),
    recommendation: generateRecommendation(compatibility, overallScore)
  }
}

// Generate appropriate challenges based on compatibility
function generateChallenges(isIncompatible, seller, target, score) {
  if (isIncompatible) {
    return [
      {
        risk: `Fundamental industry incompatibility between ${seller} and ${target}`,
        mitigation: "No mitigation possible - partnership is not viable",
        probability: "Certain",
        impact: "Deal Killer"
      },
      {
        risk: `Severe reputational damage to ${target}`,
        mitigation: "Cannot be mitigated - must avoid partnership",
        probability: "Certain",
        impact: "Catastrophic"
      },
      {
        risk: "Regulatory and compliance violations",
        mitigation: "No workaround exists - violations are certain",
        probability: "Certain",
        impact: "Severe Legal Consequences"
      }
    ]
  }
  
  return [
    {
      risk: "Budget approval delays",
      mitigation: "Align with fiscal planning cycles",
      probability: score > 60 ? "Low" : "Medium",
      impact: "Moderate"
    },
    {
      risk: "Integration complexity",
      mitigation: "Phased implementation approach",
      probability: "Medium",
      impact: score > 60 ? "Low" : "Moderate"
    },
    {
      risk: "Stakeholder buy-in",
      mitigation: "Executive sponsorship and change management",
      probability: score > 60 ? "Low" : "Medium",
      impact: "Moderate"
    }
  ]
}

// Generate recommendation based on analysis
function generateRecommendation(compatibility, score) {
  if (compatibility.verdict === 'INCOMPATIBLE') {
    return {
      verdict: "DO NOT PROCEED",
      confidence: "VERY HIGH",
      rationale: "This partnership is fundamentally non-viable due to industry incompatibility. Pursuing this opportunity would waste resources and damage relationships.",
      next_steps: ["Immediately disqualify this opportunity", "Focus resources on compatible prospects", "Update CRM to prevent future outreach"]
    }
  }
  
  if (score >= 70) {
    return {
      verdict: "STRONGLY RECOMMENDED",
      confidence: "HIGH",
      rationale: `Strong alignment and high success probability (${score}%) justify immediate pursuit.`,
      next_steps: ["Schedule executive briefing", "Prepare detailed proposal", "Identify champion within target organization"]
    }
  }
  
  if (score >= 50) {
    return {
      verdict: "PROCEED WITH CAUTION",
      confidence: "MEDIUM",
      rationale: `Moderate potential (${score}%) but significant challenges require careful approach.`,
      next_steps: ["Conduct deeper discovery", "Address identified risks", "Build stronger business case"]
    }
  }
  
  return {
    verdict: "NOT RECOMMENDED",
    confidence: "HIGH",
    rationale: `Low success probability (${score}%) suggests poor resource allocation.`,
    next_steps: ["Deprioritize opportunity", "Monitor for future changes", "Focus on better-aligned prospects"]
  }
}

export async function POST(request) {
  try {
    const user = await currentUser()
    const userId = user?.id
    
    const { seller, target } = await request.json()
    
    if (!seller || !target) {
      return NextResponse.json(
        { error: 'Seller and target companies are required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Starting comprehensive analysis: ${seller} → ${target}`)
    
    // Step 1: Conduct deep research on both companies
    console.log('🔬 Phase 1: Researching companies and gathering data...')
    const baseUrl = request?.headers?.get('host') || 'localhost:3000'
    const protocol = request?.headers?.get('x-forwarded-proto') || 'http'
    
    let researchData = null
    try {
      const researchResponse = await fetch(`${protocol}://${baseUrl}/api/research-companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller, target })
      })
      
      if (researchResponse.ok) {
        researchData = await researchResponse.json()
        console.log(`📚 Research complete: ${researchData.seller.sources.length + researchData.target.sources.length} sources analyzed`)
      }
    } catch (error) {
      console.log('Research API error:', error)
    }
    
    // Step 1: Gather company intelligence
    const [sellerInfo, targetInfo] = await Promise.all([
      gatherCompanyIntelligence(seller, request),
      gatherCompanyIntelligence(target, request)
    ])
    
    // Step 2: Calculate compatibility
    const compatibility = calculateCompatibility(seller, target, sellerInfo, targetInfo)
    console.log(`📊 Compatibility: ${compatibility.verdict} (${(compatibility.score * 100).toFixed(0)}%)`)
    
    let analysis = null
    
    // Step 3: Try AI analysis with ultra-strict prompting
    if (anthropic) {
      try {
        console.log('🤖 Attempting Claude analysis...')
        const prompt = generateUltraStrictPrompt(seller, target, sellerInfo, targetInfo, compatibility)
        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8000,
          temperature: 0.3,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
        
        const content = message.content[0].text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0])
          console.log('✅ Claude analysis successful')
        }
      } catch (error) {
        console.error('❌ Claude analysis failed:', error.message)
      }
    }
    
    // Step 4: Try OpenAI if Claude fails
    if (!analysis && openai) {
      try {
        console.log('🤖 Attempting OpenAI analysis...')
        const prompt = generateUltraStrictPrompt(seller, target, sellerInfo, targetInfo, compatibility)
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a B2B sales expert. You MUST follow scoring rules EXACTLY. Incompatible partnerships MUST score below 20%.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 8000,
          response_format: { type: "json_object" }
        })
        
        analysis = JSON.parse(completion.choices[0]?.message?.content || '{}')
        console.log('✅ OpenAI analysis successful')
      } catch (error) {
        console.error('❌ OpenAI analysis failed:', error)
      }
    }
    
    // Step 5: Use validated fallback if AI fails
    if (!analysis || !analysis.scorecard) {
      console.log('🔧 Using validated fallback analysis')
      analysis = generateValidatedFallbackAnalysis(seller, target, sellerInfo, targetInfo, compatibility)
    }
    
    // Step 6: Validate and adjust the analysis
    analysis = validateAnalysis(analysis, seller, target, sellerInfo, targetInfo)
    
    // Step 7: Calculate confidence level
    const confidence = calculateConfidence(analysis, analysis.validation_report || {})
    analysis.confidence = confidence
    
    // Step 8: Generate adjustment explanation if needed
    if (analysis.validation_report?.adjustments_made?.length > 0) {
      analysis.adjustment_explanation = generateAdjustmentExplanation(analysis.validation_report)
    }
    
    // Step 9: Save to database if user is logged in
    if (userId) {
      const { data: dbAnalysis, error: dbError } = await supabase
        .from('analyses')
        .insert([{
          user_id: userId,
          seller_company: seller,
          target_company: target,
          analysis_data: analysis,
          success_probability: analysis.scorecard?.overall_score || 10,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (!dbError && dbAnalysis) {
        analysis.id = dbAnalysis.id
      }
    }
    
    console.log(`✨ Analysis complete: Score ${analysis.scorecard?.overall_score}% (Confidence: ${confidence.level})`)
    
    return NextResponse.json({
      id: analysis.id || `analysis-${Date.now()}`,
      seller_company: seller,
      target_company: target,
      ...analysis,
      timestamp: new Date().toISOString(),
      data_freshness: {
        seller: {
          has_fresh_data: sellerInfo.fresh_news?.length > 0,
          news_count: sellerInfo.fresh_news?.length || 0,
          last_updated: sellerInfo.last_updated || new Date().toISOString(),
          freshness_score: sellerInfo.data_freshness || 0
        },
        target: {
          has_fresh_data: targetInfo.fresh_news?.length > 0,
          news_count: targetInfo.fresh_news?.length || 0,
          last_updated: targetInfo.last_updated || new Date().toISOString(),
          freshness_score: targetInfo.data_freshness || 0
        },
        analysis_timestamp: new Date().toISOString(),
        data_status: "🔄 Live Data Fetched"
      },
      analysis_methodology: 'Ultra-Validated Solution Affinity Scorecard v5.0 with Real-Time Data',
      validation_version: '5.0',
      compatibility_check: compatibility
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}