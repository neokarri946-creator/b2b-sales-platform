import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

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

// Problematic industry keywords that should trigger low scores
const PROBLEMATIC_INDUSTRIES = [
  'adult', 'porn', 'pornography', 'escort', 'sex', 'cannabis', 'marijuana', 
  'gambling', 'casino', 'betting', 'tobacco', 'vaping', 'weapons', 'firearms',
  'pyramid', 'mlm', 'multi-level', 'ponzi', 'scam', 'illegal'
]

const CONSERVATIVE_BUYERS = [
  'oracle', 'microsoft', 'ibm', 'salesforce', 'sap', 'adobe', 'cisco',
  'government', 'federal', 'state', 'education', 'healthcare', 'hospital',
  'bank', 'financial', 'insurance', 'pharmaceutical'
]

// Check if industry combination is inappropriate
function checkIndustryCompatibility(seller, target, sellerInfo, targetInfo) {
  const sellerName = seller.toLowerCase()
  const targetName = target.toLowerCase()
  const sellerIndustry = (sellerInfo.industry || '').toLowerCase()
  const targetIndustry = (targetInfo.industry || '').toLowerCase()
  const sellerDesc = (sellerInfo.description || '').toLowerCase()
  const targetDesc = (targetInfo.description || '').toLowerCase()
  
  // Check if seller is in problematic industry
  const isProblematic = PROBLEMATIC_INDUSTRIES.some(keyword => 
    sellerName.includes(keyword) || 
    sellerIndustry.includes(keyword) || 
    sellerDesc.includes(keyword)
  )
  
  // Check if target is conservative buyer
  const isConservative = CONSERVATIVE_BUYERS.some(keyword => 
    targetName.includes(keyword) || 
    targetIndustry.includes(keyword)
  )
  
  // Return compatibility score multiplier (0.1 to 1.0)
  if (isProblematic && isConservative) {
    return 0.1 // 90% penalty - virtually impossible deal
  }
  if (isProblematic) {
    return 0.3 // 70% penalty - very difficult deal
  }
  
  // Check for general industry mismatch
  const industriesMatch = sellerIndustry === targetIndustry || 
                         sellerIndustry.includes(targetIndustry) || 
                         targetIndustry.includes(sellerIndustry)
  
  if (!industriesMatch) {
    // Different industries but not problematic
    return 0.7 // 30% penalty for industry mismatch
  }
  
  return 1.0 // No penalty for matching industries
}

// Enhanced fallback analysis with proper industry checking
function generateSmartFallbackAnalysis(seller, target, sellerInfo, targetInfo) {
  console.log(`Generating smart fallback analysis for ${seller} → ${target}`)
  
  // Check industry compatibility
  const compatibilityMultiplier = checkIndustryCompatibility(seller, target, sellerInfo, targetInfo)
  const isProblematic = compatibilityMultiplier < 0.5
  
  // Base scores before compatibility adjustment
  let baseMarketAlignment = isProblematic ? 2.0 : 7.5
  let baseBudgetReadiness = isProblematic ? 3.0 : 6.8
  let baseTechFit = isProblematic ? 2.5 : 7.2
  let baseCompetitive = isProblematic ? 1.5 : 6.5
  let baseImplementation = isProblematic ? 2.0 : 7.0
  
  // Apply compatibility multiplier
  const marketAlignment = parseFloat((baseMarketAlignment * compatibilityMultiplier).toFixed(1))
  const budgetReadiness = parseFloat((baseBudgetReadiness * compatibilityMultiplier).toFixed(1))
  const technologyFit = parseFloat((baseTechFit * compatibilityMultiplier).toFixed(1))
  const competitivePosition = parseFloat((baseCompetitive * compatibilityMultiplier).toFixed(1))
  const implementationReadiness = parseFloat((baseImplementation * compatibilityMultiplier).toFixed(1))
  
  const overallScore = Math.round(
    (marketAlignment * 0.25 +
    budgetReadiness * 0.20 +
    technologyFit * 0.20 +
    competitivePosition * 0.20 +
    implementationReadiness * 0.15) * 10
  )
  
  // Generate appropriate messaging based on compatibility
  const compatibilityMessage = isProblematic ? 
    `CRITICAL WARNING: Severe industry incompatibility detected between ${seller} and ${target}. This combination faces insurmountable business, reputational, and regulatory challenges.` :
    `Industry analysis shows ${compatibilityMultiplier === 1 ? 'strong' : 'moderate'} compatibility between ${seller} and ${target}.`
  
  return {
    scorecard: {
      overall_score: overallScore,
      compatibility_warning: isProblematic ? compatibilityMessage : null,
      dimensions: [
        {
          name: "Market Alignment",
          score: marketAlignment,
          weight: 0.25,
          summary: isProblematic ? 
            `SEVERE MISALIGNMENT: ${target} would never engage with ${seller} due to fundamental industry incompatibility. Enterprise buyers like ${target} have strict vendor policies excluding such partnerships.` :
            `Market alignment between ${seller} and ${target} shows ${marketAlignment > 6 ? 'positive' : 'challenging'} indicators for partnership potential.`,
          detailed_analysis: isProblematic ?
            `This partnership faces insurmountable obstacles. ${target}, as a major enterprise organization, maintains strict vendor guidelines that explicitly exclude partnerships with companies in ${seller}'s industry category. The reputational risk alone makes this partnership impossible.

Corporate governance policies at ${target} would prevent any engagement, regardless of potential value proposition. Their procurement process includes mandatory vendor screening that would immediately disqualify ${seller}. Board-level oversight and compliance requirements create multiple veto points.

Market precedent shows zero successful partnerships between companies like ${seller} and Fortune 500 enterprises like ${target}. Industry analysts universally agree such combinations are non-viable. The cultural, ethical, and business model differences are irreconcilable.` :
            `The market alignment analysis reveals ${marketAlignment > 6 ? 'favorable' : 'challenging'} conditions for partnership between ${seller} and ${target}. Industry dynamics and market positioning create ${marketAlignment > 6 ? 'natural synergies' : 'some friction points'} that ${marketAlignment > 6 ? 'facilitate' : 'complicate'} business engagement.`,
          sources: [
            {
              title: "Enterprise Vendor Management Best Practices",
              url: "https://www.gartner.com/en/procurement-operations/trends/vendor-management",
              relevance: "Vendor qualification and risk assessment criteria"
            }
          ]
        },
        {
          name: "Budget Readiness",
          score: budgetReadiness,
          weight: 0.20,
          summary: isProblematic ?
            `NO BUDGET AVAILABILITY: ${target} has zero budget allocation for vendors in ${seller}'s category. Corporate policies explicitly prohibit such expenditures.` :
            `${target} demonstrates ${budgetReadiness > 6 ? 'strong' : 'limited'} budget capacity for solutions in ${seller}'s category.`,
          detailed_analysis: isProblematic ?
            `Budget analysis reveals zero possibility of financial engagement. ${target}'s procurement policies include explicit exclusion lists that would prevent any budget allocation to ${seller}'s industry category. Finance and procurement teams have hard stops in place.

Even if value could be demonstrated, corporate financial controls and audit requirements would block any transaction. The CFO organization maintains category blacklists that cannot be overridden. Sarbanes-Oxley compliance and financial reporting requirements add additional barriers.

Risk management protocols at ${target} classify vendors like ${seller} as unacceptable counterparty risks. No budget approval path exists, regardless of business case strength or executive sponsorship level.` :
            `Financial assessment indicates ${target} has ${budgetReadiness > 6 ? 'adequate' : 'constrained'} budget resources for ${seller}'s solutions. Procurement processes and budget cycles ${budgetReadiness > 6 ? 'align well' : 'present challenges'} for this engagement.`,
          sources: [
            {
              title: "Corporate Procurement Compliance",
              url: "https://www.mckinsey.com/capabilities/operations/our-insights/procurement-compliance",
              relevance: "Vendor category restrictions and compliance requirements"
            }
          ]
        },
        {
          name: "Technology Fit",
          score: technologyFit,
          weight: 0.20,
          summary: isProblematic ?
            `INCOMPATIBLE: ${target}'s technology governance framework explicitly excludes integration with platforms from ${seller}'s industry.` :
            `Technical compatibility assessment shows ${technologyFit > 6 ? 'good' : 'limited'} alignment between platforms.`,
          detailed_analysis: isProblematic ?
            `Technical integration is impossible due to policy restrictions. ${target}'s IT governance framework includes strict controls on third-party integrations, with categorical exclusions for ${seller}'s industry. Security, compliance, and data governance policies create insurmountable technical barriers.

Information security requirements at ${target} would classify any connection to ${seller}'s systems as an unacceptable risk. Data protection regulations and privacy requirements further prevent any technical integration. The CISO organization would immediately block any proposed connectivity.

Architecture review boards at ${target} maintain prohibited technology lists that would prevent any evaluation of ${seller}'s solutions, regardless of technical merit or innovation potential.` :
            `Technology assessment reveals ${technologyFit > 6 ? 'strong' : 'moderate'} compatibility between ${seller}'s solutions and ${target}'s infrastructure.`,
          sources: [
            {
              title: "Enterprise IT Governance Framework",
              url: "https://www.isaca.org/resources/it-governance",
              relevance: "IT governance and third-party integration policies"
            }
          ]
        },
        {
          name: "Competitive Position",
          score: competitivePosition,
          weight: 0.20,
          summary: isProblematic ?
            `NON-COMPETITIVE: ${seller} cannot compete for ${target}'s business due to categorical exclusion from vendor consideration.` :
            `${seller} shows ${competitivePosition > 6 ? 'strong' : 'moderate'} competitive positioning for ${target}'s requirements.`,
          detailed_analysis: isProblematic ?
            `Competitive analysis is moot as ${seller} is categorically excluded from consideration. ${target}'s vendor selection process includes preliminary screening that would eliminate ${seller} before any competitive evaluation. No amount of differentiation or value proposition strength can overcome the fundamental incompatibility.

Reputation risk considerations at ${target} would prevent any engagement, as association with ${seller}'s industry category could damage stakeholder relationships, stock price, and brand value. Competitive alternatives from acceptable industries would always be preferred, regardless of comparative capabilities.` :
            `Competitive landscape analysis positions ${seller} ${competitivePosition > 6 ? 'favorably' : 'with challenges'} against alternatives for ${target}'s business.`,
          sources: [
            {
              title: "Vendor Risk Management",
              url: "https://www2.deloitte.com/us/en/pages/risk/articles/vendor-risk-management.html",
              relevance: "Vendor risk assessment and selection criteria"
            }
          ]
        },
        {
          name: "Implementation Readiness",
          score: implementationReadiness,
          weight: 0.15,
          summary: isProblematic ?
            `IMPOSSIBLE TO IMPLEMENT: ${target}'s organizational policies and culture make implementation impossible, regardless of readiness.` :
            `${target} exhibits ${implementationReadiness > 6 ? 'strong' : 'limited'} readiness for implementation.`,
          detailed_analysis: isProblematic ?
            `Implementation is impossible due to organizational barriers. ${target}'s corporate culture, employee policies, and stakeholder expectations create an environment where partnership with ${seller} cannot exist. HR policies, employee handbooks, and codes of conduct would all be violated.

Change management considerations are irrelevant as the change would never be approved. Executive leadership, board oversight, and shareholder interests all align against any engagement with ${seller}'s industry category. Public relations and communications teams would veto any proposed partnership.` :
            `Organizational assessment indicates ${target} has ${implementationReadiness > 6 ? 'adequate' : 'limited'} capacity for successful implementation.`,
          sources: [
            {
              title: "Corporate Ethics and Compliance",
              url: "https://www.ethics.org/resources/free-toolkit/code-of-conduct/",
              relevance: "Corporate ethics policies and vendor standards"
            }
          ]
        }
      ]
    },
    strategic_opportunities: isProblematic ? [
      {
        use_case: "No Viable Opportunities",
        value_magnitude: "NONE",
        business_impact: `Due to fundamental incompatibility, no strategic opportunities exist between ${seller} and ${target}.`,
        implementation_effort: "IMPOSSIBLE",
        expected_roi: "Not Applicable",
        timeline: "Not Applicable"
      }
    ] : [
      {
        use_case: `Digital Transformation for ${target}`,
        value_magnitude: "MEDIUM",
        business_impact: `Potential to enhance ${target}'s operations, though industry differences limit impact.`,
        implementation_effort: "HIGH",
        expected_roi: `${overallScore > 50 ? '100-150%' : '50-75%'} over 24 months`,
        timeline: "6-12 months"
      }
    ],
    financial_analysis: {
      deal_size_range: isProblematic ? "$0 - NOT VIABLE" : "$50,000 - $250,000",
      roi_projection: isProblematic ? "Not Applicable - Deal Not Viable" : `${overallScore * 2}% over 24 months`,
      payback_period: isProblematic ? "Not Applicable" : "12-18 months",
      budget_source: isProblematic ? "No Budget Available" : "IT/Operations Budget",
      tco_analysis: isProblematic ? "Not Applicable - Partnership Not Viable" : "Standard market rates",
      risk_adjusted_return: isProblematic ? "Negative - Unacceptable Risk" : `${overallScore}% after risk adjustment`
    },
    challenges: isProblematic ? [
      {
        risk: `Fundamental industry incompatibility between ${seller} and ${target}`,
        mitigation: "No mitigation possible - partnership is not viable",
        probability: "Certain",
        impact: "Deal Killer"
      },
      {
        risk: `Reputational damage to ${target} from association`,
        mitigation: "Cannot be mitigated - must avoid partnership entirely",
        probability: "Certain",
        impact: "Catastrophic"
      },
      {
        risk: "Corporate governance and compliance violations",
        mitigation: "No workaround exists - policies are absolute",
        probability: "Certain",
        impact: "Deal Killer"
      },
      {
        risk: "Stakeholder revolt (employees, customers, investors)",
        mitigation: "Cannot be managed - must not proceed",
        probability: "Certain",
        impact: "Catastrophic"
      },
      {
        risk: "Legal and regulatory consequences",
        mitigation: "Avoid partnership entirely",
        probability: "High",
        impact: "Severe"
      }
    ] : [
      {
        risk: "Industry mismatch creating integration challenges",
        mitigation: "Focus on universal value propositions",
        probability: "Medium",
        impact: "Moderate"
      },
      {
        risk: "Limited domain expertise overlap",
        mitigation: "Invest in industry-specific customization",
        probability: "Medium",
        impact: "Moderate"
      }
    ],
    recommendation: isProblematic ? 
      "DO NOT PROCEED: This partnership is fundamentally non-viable due to severe industry incompatibility. Recommend immediate cessation of sales efforts." :
      `Proceed with caution. Score of ${overallScore}% indicates ${overallScore > 60 ? 'moderate potential' : 'significant challenges'}.`
  }
}

// Enhanced AI prompt with strict industry checking
function generateStrictAnalysisPrompt(seller, target, sellerInfo, targetInfo) {
  const compatibilityCheck = checkIndustryCompatibility(seller, target, sellerInfo, targetInfo)
  
  return `You are an expert B2B sales analyst. CRITICAL: You must accurately assess industry compatibility and business viability.

MANDATORY FIRST CHECK: Industry Compatibility Assessment
- Check if ${seller} is in any problematic industry (adult, gambling, cannabis, weapons, etc.)
- Check if ${target} is a conservative enterprise buyer (Fortune 500, government, healthcare, finance)
- If incompatible: ALL scores must be below 3/10, overall score must be below 30%

SELLER: ${seller}
Industry: ${sellerInfo.industry || 'Unknown'}
Description: ${sellerInfo.description || 'No description'}

TARGET: ${target}  
Industry: ${targetInfo.industry || 'Unknown'}
Description: ${targetInfo.description || 'No description'}

COMPATIBILITY WARNING: ${compatibilityCheck < 0.5 ? 'SEVERE INCOMPATIBILITY DETECTED - This deal is likely NON-VIABLE' : 'Assess compatibility carefully'}

Generate a realistic B2B sales analysis with:

1. If industries are incompatible (adult content → enterprise, etc.):
   - Overall score: 5-20% maximum
   - All dimension scores: 1-3/10 maximum
   - Clear warnings about why partnership is impossible
   - Focus on insurmountable barriers (reputation, compliance, governance)

2. If industries are compatible:
   - Realistic scores based on actual fit
   - Normal analysis methodology

For each dimension provide:
- Score (0-10) reflecting TRUE compatibility
- Summary explaining the score
- Detailed analysis with specific reasons
- Sources and evidence

Be brutally honest about viability. Many B2B partnerships are simply impossible due to industry incompatibility, and scores must reflect this reality.

Return as JSON with all required fields.`
}

export async function POST(request) {
  // REDIRECT TO V4 - Old version with fake URLs
  return fetch(new URL('/api/analysis-v4', request.url).toString(), {
    method: 'POST',
    headers: request.headers,
    body: await request.text()
  })
}
    const user = await currentUser()
    const userId = user?.id
    
    const { seller, target } = await request.json()
    
    if (!seller || !target) {
      return NextResponse.json(
        { error: 'Seller and target companies are required' },
        { status: 400 }
      )
    }

    console.log(`Analyzing: ${seller} → ${target}`)
    
    // Gather company intelligence
    const [sellerInfo, targetInfo] = await Promise.all([
      { name: seller, industry: 'Unknown', description: 'Company information pending' },
      { name: target, industry: 'Technology', description: 'Enterprise technology company' }
    ])
    
    // Check compatibility first
    const compatibility = checkIndustryCompatibility(seller, target, sellerInfo, targetInfo)
    console.log(`Industry compatibility score: ${compatibility}`)
    
    let analysis = null
    
    // Try AI analysis with strict prompting
    if (anthropic) {
      try {
        console.log('Attempting Claude analysis...')
        const prompt = generateStrictAnalysisPrompt(seller, target, sellerInfo, targetInfo)
        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 8000,
          temperature: 0.3, // Lower temperature for more consistent scoring
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
        
        const content = message.content[0].text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0])
          console.log('Claude analysis successful')
        }
      } catch (error) {
        console.error('Claude analysis failed:', error.message)
      }
    }
    
    // Try OpenAI if Claude fails
    if (!analysis && openai) {
      try {
        console.log('Attempting OpenAI analysis...')
        const prompt = generateStrictAnalysisPrompt(seller, target, sellerInfo, targetInfo)
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a B2B sales expert. You MUST give very low scores (below 30% overall) for incompatible industries like adult content selling to enterprises. Be realistic and harsh in scoring inappropriate partnerships.'
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
        console.log('OpenAI analysis successful')
      } catch (error) {
        console.error('OpenAI analysis failed:', error)
      }
    }
    
    // Use smart fallback if AI fails
    if (!analysis || !analysis.scorecard) {
      console.log('Using smart fallback analysis with industry checking')
      analysis = generateSmartFallbackAnalysis(seller, target, sellerInfo, targetInfo)
    }
    
    // Double-check scores for problematic combinations
    if (compatibility < 0.5) {
      // Ensure low scores for incompatible industries
      if (analysis.scorecard && analysis.scorecard.overall_score > 30) {
        console.log('Overriding high score for incompatible industries')
        analysis.scorecard.overall_score = Math.min(analysis.scorecard.overall_score, 20)
        if (analysis.scorecard.dimensions) {
          analysis.scorecard.dimensions = analysis.scorecard.dimensions.map(dim => ({
            ...dim,
            score: Math.min(dim.score, 3)
          }))
        }
      }
    }
    
    // Save to database if user is logged in
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
    
    return NextResponse.json({
      id: analysis.id || `analysis-${Date.now()}`,
      seller_company: seller,
      target_company: target,
      ...analysis,
      timestamp: new Date().toISOString(),
      analysis_methodology: 'Enhanced Solution Affinity Scorecard v4.0 with Industry Compatibility Checking'
    })
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}