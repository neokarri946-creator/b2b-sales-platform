import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

async function updateJobProgress(jobId, updates) {
  try {
    await supabase
      .from('analysis_jobs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId)
  } catch (error) {
    console.error('Failed to update job progress:', error)
  }
}

export async function POST(request) {
  try {
    const { jobId, seller, target, userId } = await request.json()
    
    console.log(`⚙️ Processing analysis job ${jobId}: ${seller} → ${target}`)
    
    const baseUrl = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    
    // Update status to processing
    await updateJobProgress(jobId, {
      status: 'processing',
      progress: 10,
      current_step: 'Starting research phase'
    })
    
    // Step 1: Research companies (can take 6+ seconds)
    console.log('📚 Step 1: Researching companies...')
    let researchData = null
    
    try {
      const researchResponse = await fetch(`${protocol}://${baseUrl}/api/research-companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller, target }),
        signal: AbortSignal.timeout(8000) // 8 second timeout for research
      })
      
      if (researchResponse.ok) {
        researchData = await researchResponse.json()
        console.log(`✅ Research complete: ${researchData.seller.sources.length + researchData.target.sources.length} sources`)
        
        await updateJobProgress(jobId, {
          status: 'processing',
          progress: 50,
          current_step: 'Research complete, starting analysis',
          research_data: researchData
        })
      }
    } catch (error) {
      console.error('Research failed:', error)
      await updateJobProgress(jobId, {
        status: 'processing',
        progress: 30,
        current_step: 'Research timeout, proceeding with basic analysis'
      })
    }
    
    // Step 2: Generate analysis with the research data
    console.log('🧮 Step 2: Generating analysis...')
    
    try {
      const analysisResponse = await fetch(`${protocol}://${baseUrl}/api/analysis-v4`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          seller, 
          target,
          skipResearch: true, // Tell v4 to skip research since we already have it
          researchData // Pass the research data if we have it
        }),
        signal: AbortSignal.timeout(8000) // 8 second timeout
      })
      
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json()
        
        // If we have research data, enhance the analysis with real sources
        if (researchData && researchData.seller && researchData.target) {
          // Extract real sources from research
          const allSources = [
            ...(researchData.seller.sources || []),
            ...(researchData.target.sources || [])
          ]
          
          // Distribute sources across dimensions
          if (analysisData.scorecard && analysisData.scorecard.dimensions) {
            analysisData.scorecard.dimensions.forEach((dimension, index) => {
              // Assign 2-3 relevant sources to each dimension
              const startIdx = index * 2
              dimension.sources = allSources.slice(startIdx, startIdx + 3).map(source => ({
                url: source.url,
                title: source.title || `${dimension.name} - ${source.type}`,
                type: source.type
              }))
            })
          }
          
          // Add research evidence summary
          analysisData.research_evidence = {
            sources_analyzed: allSources.length,
            news_articles: (researchData.seller.news?.length || 0) + (researchData.target.news?.length || 0),
            financial_data: !!(researchData.seller.financials || researchData.target.financials),
            market_data: !!(researchData.seller.market_position || researchData.target.market_position)
          }
        }
        
        console.log('✅ Analysis complete')
        
        // Update job with completed status
        await updateJobProgress(jobId, {
          status: 'completed',
          progress: 100,
          current_step: 'Analysis complete',
          analysis_data: analysisData
        })
        
        // Also save to main analyses table for compatibility
        if (userId) {
          await supabase
            .from('analyses')
            .insert([{
              user_id: userId,
              seller_company: seller,
              target_company: target,
              analysis_data: analysisData,
              success_probability: analysisData.scorecard?.overall_score || 50,
              created_at: new Date().toISOString()
            }])
        }
        
        return NextResponse.json({
          status: 'completed',
          message: 'Analysis completed successfully'
        })
      } else {
        throw new Error('Analysis API failed')
      }
    } catch (error) {
      console.error('Analysis generation failed:', error)
      
      await updateJobProgress(jobId, {
        status: 'failed',
        progress: 0,
        current_step: 'Analysis failed',
        error: error.message
      })
      
      return NextResponse.json({
        status: 'failed',
        error: error.message
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Process error:', error)
    return NextResponse.json(
      { error: 'Processing failed', details: error.message },
      { status: 500 }
    )
  }
}