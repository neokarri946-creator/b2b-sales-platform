import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { EnhancedAnalyzer } from '@/lib/enhanced-analyzer'

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
})

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Initialize Enhanced Analyzer
const analyzer = new EnhancedAnalyzer()

export async function POST(request) {
  try {
    // Get current user
    const user = await currentUser()
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'anonymous@example.com'
    
    // Get request data
    const { seller, target, useEnhanced = true } = await request.json()
    
    if (!seller || !target) {
      return NextResponse.json(
        { error: 'Seller and target companies are required' },
        { status: 400 }
      )
    }

    let analysisResult
    
    // Use enhanced analyzer if requested
    if (useEnhanced) {
      try {
        // Generate comprehensive prompt using framework
        const enhancedPrompt = analyzer.generateAnalysisPrompt(seller, target)
        
        // Get AI analysis with enhanced prompt
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder') {
          const completion = await openai.chat.completions.create({
            model: 'gpt-4',  // Use GPT-4 for enhanced analysis
            messages: [
              {
                role: 'system',
                content: 'You are an expert B2B sales intelligence analyst. Follow the framework exactly and provide detailed, quantified analysis.'
              },
              {
                role: 'user',
                content: enhancedPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 3000,
            response_format: { type: "json_object" }
          })
          
          const aiResponse = completion.choices[0]?.message?.content || '{}'
          
          // Process with enhanced analyzer
          analysisResult = analyzer.processAnalysisResponse(aiResponse)
        } else {
          // Use enhanced fallback
          analysisResult = analyzer.getFallbackAnalysis()
        }
        
        // Add enhanced flag
        analysisResult.enhanced = true
        analysisResult.framework_version = analyzer.framework.framework_version
        
      } catch (error) {
        console.error('Enhanced analysis error:', error.message)
        analysisResult = analyzer.getFallbackAnalysis()
      }
    } else {
      // Use basic analysis (existing logic)
      analysisResult = await getBasicAnalysis(seller, target)
    }
    
    // Format for compatibility with existing frontend
    const finalAnalysis = {
      id: `analysis-${Date.now()}`,
      success_probability: analysisResult.success_probability || analysisResult.scorecard?.overall_score || 65,
      industry_fit: analysisResult.executive_summary || analysisResult.industry_fit || "Analysis complete",
      budget_signal: analysisResult.financial_analysis?.deal_size_range || "Budget assessment needed",
      timing: analysisResult.financial_analysis?.payback_period || "12-18 months",
      
      // Map enhanced opportunities to existing format
      key_opportunities: analysisResult.opportunities?.map(opp => 
        typeof opp === 'string' ? opp : `${opp.use_case}: ${opp.business_impact}`
      ) || ["Opportunity identified"],
      
      // Map enhanced risks to challenges
      challenges: analysisResult.risks?.map(risk => 
        typeof risk === 'string' ? risk : `${risk.risk}: ${risk.mitigation}`
      ) || analysisResult.challenges || ["Risk assessment needed"],
      
      recommended_approach: typeof analysisResult.recommended_approach === 'string' 
        ? analysisResult.recommended_approach 
        : analysisResult.recommended_approach?.sales_strategy || "Strategic approach recommended",
      
      email_templates: analysisResult.email_templates || [],
      
      // Include enhanced data if available
      enhanced_data: useEnhanced ? {
        scorecard: analysisResult.scorecard,
        financial_analysis: analysisResult.financial_analysis,
        risks: analysisResult.risks,
        quality_score: analysisResult.quality_score,
        framework_version: analysisResult.framework_version
      } : null,
      
      seller_company: seller,
      target_company: target
    }
    
    // Try to save to database
    try {
      const { data } = await supabase
        .from('analyses')
        .insert([{
          user_email: userEmail,
          seller_company: seller,
          target_company: target,
          success_probability: finalAnalysis.success_probability,
          industry_fit: finalAnalysis.industry_fit,
          budget_signal: finalAnalysis.budget_signal,
          timing: finalAnalysis.timing,
          key_opportunities: finalAnalysis.key_opportunities,
          challenges: finalAnalysis.challenges,
          recommended_approach: finalAnalysis.recommended_approach,
          email_templates: finalAnalysis.email_templates,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (data) {
        finalAnalysis.id = data.id
      }
    } catch (dbError) {
      console.log('Database save optional:', dbError.message)
    }
    
    return NextResponse.json(finalAnalysis)
    
  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json(
      { error: 'Analysis failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Basic analysis function (existing logic)
async function getBasicAnalysis(seller, target) {
  try {
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-placeholder') {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a B2B sales analyst. Provide concise, actionable insights.'
          },
          {
            role: 'user',
            content: `Analyze sales opportunity between ${seller} and ${target}. Return JSON with: success_probability, industry_fit, key_opportunities (array), challenges (array), email_templates (array).`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
      
      return JSON.parse(completion.choices[0]?.message?.content || '{}')
    }
  } catch (error) {
    console.error('Basic analysis error:', error)
  }
  
  // Fallback
  return {
    success_probability: 60,
    industry_fit: "Potential synergy identified",
    key_opportunities: ["Process improvement", "Cost reduction", "Growth acceleration"],
    challenges: ["Competition", "Budget approval"],
    email_templates: [{
      subject: `${seller} - Partnership for ${target}`,
      body: "Let's discuss how we can help your business grow."
    }]
  }
}