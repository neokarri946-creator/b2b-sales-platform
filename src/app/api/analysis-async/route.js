import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { seller, target } = await request.json()
    
    if (!seller || !target) {
      return NextResponse.json(
        { error: 'Seller and target companies are required' },
        { status: 400 }
      )
    }

    console.log(`🚀 Starting async analysis: ${seller} → ${target}`)
    
    const baseUrl = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    
    // Step 1: Start research (this can take 6+ seconds)
    console.log('📚 Starting research phase...')
    let researchData = null
    
    try {
      const researchResponse = await fetch(`${protocol}://${baseUrl}/api/research-companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller, target }),
        signal: AbortSignal.timeout(8500) // 8.5 second timeout
      })
      
      if (researchResponse.ok) {
        researchData = await researchResponse.json()
        console.log(`✅ Research complete: ${researchData.seller.sources.length + researchData.target.sources.length} sources`)
      }
    } catch (error) {
      console.error('Research timeout or error:', error.message)
      // Continue without research data
    }
    
    // Step 2: Generate analysis with whatever data we have
    console.log('🧮 Generating analysis...')
    
    // Call the v4 API with the research data
    const analysisResponse = await fetch(`${protocol}://${baseUrl}/api/analysis-v4`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        seller, 
        target,
        skipResearch: true, // Tell v4 to skip its own research
        researchData // Pass our research data if we have it
      }),
      signal: AbortSignal.timeout(9000) // 9 second timeout
    })
    
    if (!analysisResponse.ok) {
      throw new Error('Analysis generation failed')
    }
    
    const analysisData = await analysisResponse.json()
    
    // If we have research data, enhance the analysis with real sources
    if (researchData && researchData.seller && researchData.target) {
      // Extract all real sources from research
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
        has_financial_data: !!(researchData.seller.financials || researchData.target.financials),
        has_market_data: !!(researchData.seller.market_position || researchData.target.market_position),
        research_complete: true
      }
    } else {
      analysisData.research_evidence = {
        sources_analyzed: 0,
        news_articles: 0,
        has_financial_data: false,
        has_market_data: false,
        research_complete: false,
        note: 'Analysis completed without full research due to time constraints'
      }
    }
    
    console.log('✅ Analysis complete')
    
    return NextResponse.json(analysisData)
    
  } catch (error) {
    console.error('Async analysis error:', error)
    return NextResponse.json(
      { error: 'Analysis failed', details: error.message },
      { status: 500 }
    )
  }
}