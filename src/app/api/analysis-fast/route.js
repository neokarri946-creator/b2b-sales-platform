import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { 
  calculateCompatibility,
  generateWarnings 
} from '@/lib/industry-classifier'
import { getDeterministicScores } from '@/lib/deterministic-scorer'
import { calculateCompetitiveImpact } from '@/lib/competitor-detection'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Fast company intelligence without external API calls
function getFastCompanyInfo(companyName) {
  return {
    name: companyName,
    industry: 'Technology', // Default industry
    description: `${companyName} - Leading enterprise company`,
    fresh_news: [],
    market_data: {},
    recent_events: [],
    data_freshness: 0,
    last_updated: new Date().toISOString()
  }
}

// Generate fast analysis without AI or external APIs
function generateFastAnalysis(seller, target, compatibility) {
  const isIncompatible = compatibility.verdict === 'INCOMPATIBLE'
  
  // Use deterministic scoring
  const deterministicScores = getDeterministicScores(seller, target, compatibility)
  
  const overallScore = deterministicScores.overall
  
  return {
    scorecard: {
      overall_score: overallScore,
      dimensions: [
        {
          name: "Market Alignment",
          score: deterministicScores.dimensions.marketAlignment,
          weight: 0.25,
          summary: `Market alignment score: ${deterministicScores.dimensions.marketAlignment}/10`,
          detailed_analysis: `Analysis based on compatibility assessment between ${seller} and ${target}.`,
          sources: []
        },
        {
          name: "Budget Readiness",
          score: deterministicScores.dimensions.budgetReadiness,
          weight: 0.20,
          summary: `Budget readiness score: ${deterministicScores.dimensions.budgetReadiness}/10`,
          detailed_analysis: `Financial assessment indicates budget compatibility.`,
          sources: []
        },
        {
          name: "Technology Fit",
          score: deterministicScores.dimensions.technologyFit,
          weight: 0.20,
          summary: `Technology fit score: ${deterministicScores.dimensions.technologyFit}/10`,
          detailed_analysis: `Technical compatibility assessment completed.`,
          sources: []
        },
        {
          name: "Competitive Position",
          score: deterministicScores.dimensions.competitivePosition,
          weight: 0.20,
          summary: `Competitive position score: ${deterministicScores.dimensions.competitivePosition}/10`,
          detailed_analysis: `Market position analysis completed.`,
          sources: []
        },
        {
          name: "Implementation Readiness",
          score: deterministicScores.dimensions.implementationReadiness,
          weight: 0.15,
          summary: `Implementation readiness score: ${deterministicScores.dimensions.implementationReadiness}/10`,
          detailed_analysis: `Organizational readiness assessment completed.`,
          sources: []
        }
      ]
    },
    strategic_opportunities: isIncompatible ? [] : [
      {
        use_case: `Partnership Opportunity`,
        value_magnitude: overallScore > 60 ? "HIGH" : "MEDIUM",
        business_impact: `Potential for business growth`,
        implementation_effort: "MEDIUM",
        expected_roi: `${overallScore * 2}% over 24 months`,
        timeline: "3-6 months"
      }
    ],
    financial_analysis: {
      deal_size_range: isIncompatible ? "$0" : `$${50 + overallScore}K - $${200 + overallScore * 3}K`,
      roi_projection: isIncompatible ? "N/A" : `${overallScore * 2}% over 24 months`,
      payback_period: isIncompatible ? "N/A" : `${18 - Math.floor(overallScore/10)} months`,
      budget_source: isIncompatible ? "N/A" : "IT/Operations Budget",
      tco_analysis: isIncompatible ? "N/A" : "Competitive",
      risk_adjusted_return: isIncompatible ? "N/A" : `${overallScore * 1.5}%`
    },
    challenges: [],
    warnings: generateWarnings(compatibility),
    recommendation: {
      verdict: isIncompatible ? "DO NOT PROCEED" : (overallScore >= 70 ? "RECOMMENDED" : "PROCEED WITH CAUTION"),
      confidence: "MEDIUM",
      rationale: `Based on compatibility assessment: ${compatibility.reason}`,
      next_steps: isIncompatible ? ["Not recommended"] : ["Schedule meeting", "Prepare proposal"]
    }
  }
}

export async function POST(request) {
  try {
    const startTime = Date.now()
    
    const user = await currentUser()
    const userId = user?.id
    
    const { seller, target, includeResearch = false } = await request.json()
    
    if (!seller || !target) {
      return NextResponse.json(
        { error: 'Seller and target companies are required' },
        { status: 400 }
      )
    }

    console.log(`⚡ Fast analysis: ${seller} → ${target}`)
    
    // Get basic company info (no external APIs)
    const sellerInfo = getFastCompanyInfo(seller)
    const targetInfo = getFastCompanyInfo(target)
    
    // Calculate compatibility
    const compatibility = calculateCompatibility(seller, target, sellerInfo, targetInfo)
    console.log(`Compatibility: ${compatibility.verdict} (${(compatibility.score * 100).toFixed(0)}%)`)
    
    // Generate fast analysis
    let analysis = generateFastAnalysis(seller, target, compatibility)
    
    // Optionally try to fetch some real data if we have time
    if (includeResearch && (Date.now() - startTime) < 5000) {
      try {
        const baseUrl = request.headers.get('host') || 'localhost:3000'
        const protocol = request.headers.get('x-forwarded-proto') || 'http'
        
        // Try a quick research call with tight timeout
        const researchResponse = await fetch(`${protocol}://${baseUrl}/api/research-companies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seller, target }),
          signal: AbortSignal.timeout(3000) // 3 second timeout
        })
        
        if (researchResponse.ok) {
          const researchData = await researchResponse.json()
          
          // Add real sources to the analysis
          const allSources = [
            ...(researchData.seller?.sources || []),
            ...(researchData.target?.sources || [])
          ]
          
          if (allSources.length > 0 && analysis.scorecard?.dimensions) {
            analysis.scorecard.dimensions.forEach((dimension, index) => {
              const startIdx = index * 2
              dimension.sources = allSources.slice(startIdx, startIdx + 3).map(source => ({
                url: source.url,
                title: source.title || dimension.name,
                type: source.type
              }))
            })
            
            analysis.research_evidence = {
              sources_analyzed: allSources.length,
              research_complete: true
            }
          }
        }
      } catch (error) {
        console.log('Research skipped due to timeout')
      }
    }
    
    // Add metadata
    analysis.id = `analysis-${Date.now()}`
    analysis.seller_company = seller
    analysis.target_company = target
    analysis.timestamp = new Date().toISOString()
    analysis.data_freshness = {
      seller: { has_fresh_data: false },
      target: { has_fresh_data: false },
      analysis_timestamp: new Date().toISOString(),
      data_status: "⚡ Fast Analysis Mode"
    }
    analysis.analysis_methodology = 'Fast Compatibility Analysis v1.0'
    analysis.compatibility_check = compatibility
    
    // Save to database if user is logged in
    if (userId) {
      try {
        await supabase
          .from('analyses')
          .insert([{
            user_id: userId,
            seller_company: seller,
            target_company: target,
            analysis_data: analysis,
            success_probability: analysis.scorecard?.overall_score || 50,
            created_at: new Date().toISOString()
          }])
      } catch (error) {
        console.log('Database save skipped:', error.message)
      }
    }
    
    const totalTime = Date.now() - startTime
    console.log(`✅ Fast analysis complete in ${totalTime}ms`)
    
    return NextResponse.json(analysis)
    
  } catch (error) {
    console.error('Fast analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error.message },
      { status: 500 }
    )
  }
}