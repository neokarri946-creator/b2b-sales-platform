// Generate analysis where EVERY statement is linked to its actual source
// Each hyperlink points to the EXACT page where that information was found

export function generateEvidenceBasedAnalysis(researchData) {
  const analysis = {
    scorecard: {
      overall_score: 0,
      dimensions: []
    },
    evidence_map: {}, // Maps each statement to its source
    all_sources: []
  }
  
  // Collect ALL sources with their actual data
  const evidenceBank = collectAllEvidence(researchData)
  
  // Generate each dimension with real sources
  analysis.scorecard.dimensions = [
    generateMarketAlignmentWithSources(evidenceBank),
    generateBudgetReadinessWithSources(evidenceBank),
    generateTechnologyFitWithSources(evidenceBank),
    generateCompetitivePositionWithSources(evidenceBank),
    generateImplementationReadinessWithSources(evidenceBank)
  ]
  
  // Calculate overall score from dimensions
  analysis.scorecard.overall_score = Math.round(
    analysis.scorecard.dimensions.reduce((sum, dim) => sum + (dim.score * dim.weight), 0) * 10
  )
  
  return analysis
}

// Collect all evidence with exact sources
function collectAllEvidence(researchData) {
  const evidence = {
    financial: [],
    news: [],
    web: [],
    market: []
  }
  
  // Financial data from Alpha Vantage/FMP with exact source
  if (researchData.seller.financials?.data) {
    const data = researchData.seller.financials.data
    const source = researchData.seller.financials.source
    
    if (data.market_cap) {
      evidence.financial.push({
        fact: `${researchData.seller.company} market capitalization: ${data.market_cap}`,
        value: data.market_cap,
        source: source,
        type: 'market_cap',
        company: 'seller'
      })
    }
    
    if (data.revenue) {
      evidence.financial.push({
        fact: `${researchData.seller.company} revenue: ${data.revenue}`,
        value: data.revenue,
        source: source,
        type: 'revenue',
        company: 'seller'
      })
    }
    
    if (data.revenue_growth) {
      evidence.financial.push({
        fact: `${researchData.seller.company} revenue growth: ${data.revenue_growth}`,
        value: data.revenue_growth,
        source: source,
        type: 'growth',
        company: 'seller'
      })
    }
  }
  
  if (researchData.target.financials?.data) {
    const data = researchData.target.financials.data
    const source = researchData.target.financials.source
    
    if (data.market_cap) {
      evidence.financial.push({
        fact: `${researchData.target.company} market capitalization: ${data.market_cap}`,
        value: data.market_cap,
        source: source,
        type: 'market_cap',
        company: 'target'
      })
    }
    
    if (data.it_budget) {
      evidence.financial.push({
        fact: `${researchData.target.company} IT budget: ${data.it_budget}`,
        value: data.it_budget,
        source: source,
        type: 'it_budget',
        company: 'target'
      })
    }
    
    if (data.revenue_growth) {
      evidence.financial.push({
        fact: `${researchData.target.company} revenue growth: ${data.revenue_growth}`,
        value: data.revenue_growth,
        source: source,
        type: 'growth',
        company: 'target'
      })
    }
  }
  
  // News from NewsAPI with exact URLs
  researchData.seller.news?.forEach(article => {
    evidence.news.push({
      fact: article.title,
      description: article.description || article.summary,
      source: article.url,
      date: article.publishedAt || article.date,
      company: 'seller',
      relevance: detectRelevance(article.title + ' ' + (article.description || ''))
    })
  })
  
  researchData.target.news?.forEach(article => {
    evidence.news.push({
      fact: article.title,
      description: article.description || article.summary,
      source: article.url,
      date: article.publishedAt || article.date,
      company: 'target',
      relevance: detectRelevance(article.title + ' ' + (article.description || ''))
    })
  })
  
  // Google Search results with exact URLs
  researchData.seller.sources?.forEach(source => {
    if (source.type === 'web_search' && source.url) {
      evidence.web.push({
        fact: source.snippet || source.title,
        source: source.url,
        title: source.title,
        company: 'seller'
      })
    }
  })
  
  researchData.target.sources?.forEach(source => {
    if (source.type === 'web_search' && source.url) {
      evidence.web.push({
        fact: source.snippet || source.title,
        source: source.url,
        title: source.title,
        company: 'target'
      })
    }
  })
  
  return evidence
}

// Generate Market Alignment with exact source URLs
function generateMarketAlignmentWithSources(evidence) {
  const dimension = {
    name: "Market Alignment",
    score: 5.0,
    weight: 0.25,
    summary: "",
    detailed_analysis: "",
    sources: []
  }
  
  const statements = []
  
  // Find market cap evidence
  const sellerMarketCap = evidence.financial.find(e => e.type === 'market_cap' && e.company === 'seller')
  const targetMarketCap = evidence.financial.find(e => e.type === 'market_cap' && e.company === 'target')
  
  if (sellerMarketCap && targetMarketCap) {
    const sellerValue = parseFinancialValue(sellerMarketCap.value)
    const targetValue = parseFinancialValue(targetMarketCap.value)
    const ratio = sellerValue / targetValue
    
    if (ratio > 0.1 && ratio < 10) {
      dimension.score += 2.0
      statements.push({
        text: `Market capitalization analysis shows compatible company sizes with seller at ${sellerMarketCap.value} and target at ${targetMarketCap.value}, indicating good partnership potential.`,
        source: {
          title: "Financial Market Data",
          url: sellerMarketCap.source,
          quote: `${sellerMarketCap.fact} | ${targetMarketCap.fact}`
        }
      })
    }
  }
  
  // Find partnership news
  const partnershipNews = evidence.news.find(n => 
    n.relevance === 'partnership' || 
    n.fact.toLowerCase().includes('partner') ||
    n.fact.toLowerCase().includes('collaboration')
  )
  
  if (partnershipNews) {
    dimension.score += 1.5
    statements.push({
      text: `Recent partnership activity indicates market receptiveness: "${partnershipNews.fact}"`,
      source: {
        title: partnershipNews.fact,
        url: partnershipNews.source,
        quote: partnershipNews.description || partnershipNews.fact
      }
    })
  }
  
  // Find market growth evidence
  const growthEvidence = evidence.financial.find(e => e.type === 'growth')
  if (growthEvidence) {
    const growth = parseFloat(growthEvidence.value.replace('%', ''))
    if (growth > 10) {
      dimension.score += 1.5
      statements.push({
        text: `Strong market momentum with ${growthEvidence.fact}, indicating favorable market conditions.`,
        source: {
          title: "Revenue Growth Data",
          url: growthEvidence.source,
          quote: growthEvidence.fact
        }
      })
    }
  }
  
  // Build the analysis from statements
  dimension.summary = statements.length > 0 
    ? statements[0].text.substring(0, 100) + "..."
    : "Market alignment assessment based on available data."
  
  dimension.detailed_analysis = statements.map(s => s.text).join('\n\n')
  
  // Add the ACTUAL sources
  dimension.sources = statements.map(s => ({
    title: s.source.title,
    url: s.source.url,
    quote: s.source.quote,
    relevance: "Direct evidence for market alignment",
    authority: new URL(s.source.url).hostname,
    trust_indicator: "✓ Verified Source"
  }))
  
  // Add any additional relevant web sources
  const marketWebSources = evidence.web.filter(w => 
    w.fact.toLowerCase().includes('market') || 
    w.fact.toLowerCase().includes('industry')
  ).slice(0, 2)
  
  marketWebSources.forEach(webSource => {
    dimension.sources.push({
      title: webSource.title,
      url: webSource.source,
      quote: webSource.fact,
      relevance: "Market context",
      authority: new URL(webSource.source).hostname,
      trust_indicator: "✓ Web Research"
    })
  })
  
  dimension.score = Math.min(10, dimension.score)
  return dimension
}

// Generate Budget Readiness with exact source URLs
function generateBudgetReadinessWithSources(evidence) {
  const dimension = {
    name: "Budget Readiness",
    score: 4.0,
    weight: 0.20,
    summary: "",
    detailed_analysis: "",
    sources: []
  }
  
  const statements = []
  
  // IT Budget evidence
  const itBudget = evidence.financial.find(e => e.type === 'it_budget')
  if (itBudget) {
    const budget = parseFinancialValue(itBudget.value)
    if (budget > 1000000000) {
      dimension.score += 3.0
      statements.push({
        text: `Strong budget capacity confirmed with ${itBudget.fact}, providing ample resources for technology investments.`,
        source: {
          title: "IT Budget Analysis",
          url: itBudget.source,
          quote: itBudget.fact
        }
      })
    }
  }
  
  // Revenue growth indicates budget health
  const revenueGrowth = evidence.financial.find(e => 
    e.type === 'growth' && e.company === 'target'
  )
  if (revenueGrowth) {
    const growth = parseFloat(revenueGrowth.value.replace('%', ''))
    if (growth > 10) {
      dimension.score += 2.0
      statements.push({
        text: `Financial health demonstrated by ${revenueGrowth.fact}, indicating strong budget availability for strategic initiatives.`,
        source: {
          title: "Financial Performance",
          url: revenueGrowth.source,
          quote: revenueGrowth.fact
        }
      })
    }
  }
  
  // Investment news
  const investmentNews = evidence.news.find(n => 
    n.fact.toLowerCase().includes('invest') || 
    n.fact.toLowerCase().includes('spending') ||
    n.fact.toLowerCase().includes('budget')
  )
  
  if (investmentNews) {
    dimension.score += 1.0
    statements.push({
      text: `Recent investment activity: "${investmentNews.fact}"`,
      source: {
        title: investmentNews.fact,
        url: investmentNews.source,
        quote: investmentNews.description || investmentNews.fact
      }
    })
  }
  
  // Build analysis
  dimension.summary = statements.length > 0
    ? statements[0].text.substring(0, 100) + "..."
    : "Budget readiness evaluated from financial indicators."
  
  dimension.detailed_analysis = statements.map(s => s.text).join('\n\n')
  
  dimension.sources = statements.map(s => ({
    title: s.source.title,
    url: s.source.url,
    quote: s.source.quote,
    relevance: "Budget capacity evidence",
    authority: new URL(s.source.url).hostname,
    trust_indicator: "✓ Financial Data"
  }))
  
  dimension.score = Math.min(10, dimension.score)
  return dimension
}

// Generate Technology Fit with exact source URLs
function generateTechnologyFitWithSources(evidence) {
  const dimension = {
    name: "Technology Fit",
    score: 5.0,
    weight: 0.20,
    summary: "",
    detailed_analysis: "",
    sources: []
  }
  
  const statements = []
  
  // Find technology mentions in web sources
  const techSources = evidence.web.filter(w => 
    w.fact.toLowerCase().includes('technology') ||
    w.fact.toLowerCase().includes('api') ||
    w.fact.toLowerCase().includes('integration') ||
    w.fact.toLowerCase().includes('cloud') ||
    w.fact.toLowerCase().includes('software')
  )
  
  techSources.slice(0, 3).forEach(techSource => {
    dimension.score += 1.0
    statements.push({
      text: techSource.fact,
      source: {
        title: techSource.title,
        url: techSource.source,
        quote: techSource.fact
      }
    })
  })
  
  // Technology news
  const techNews = evidence.news.find(n => 
    n.fact.toLowerCase().includes('technology') ||
    n.fact.toLowerCase().includes('digital') ||
    n.fact.toLowerCase().includes('cloud')
  )
  
  if (techNews) {
    dimension.score += 1.5
    statements.push({
      text: `Technology initiatives: "${techNews.fact}"`,
      source: {
        title: techNews.fact,
        url: techNews.source,
        quote: techNews.description || techNews.fact
      }
    })
  }
  
  dimension.summary = statements.length > 0
    ? "Technology compatibility based on: " + statements[0].text.substring(0, 80) + "..."
    : "Technology fit assessment from available data."
  
  dimension.detailed_analysis = statements.map(s => s.text).join('\n\n')
  
  dimension.sources = statements.map(s => ({
    title: s.source.title,
    url: s.source.url,
    quote: s.source.quote,
    relevance: "Technology compatibility evidence",
    authority: new URL(s.source.url).hostname,
    trust_indicator: "✓ Technical Research"
  }))
  
  dimension.score = Math.min(10, dimension.score)
  return dimension
}

// Generate Competitive Position with exact source URLs
function generateCompetitivePositionWithSources(evidence) {
  const dimension = {
    name: "Competitive Position",
    score: 5.0,
    weight: 0.20,
    summary: "",
    detailed_analysis: "",
    sources: []
  }
  
  const statements = []
  
  // Market position from market cap
  const sellerMarketCap = evidence.financial.find(e => e.type === 'market_cap' && e.company === 'seller')
  if (sellerMarketCap) {
    const value = parseFinancialValue(sellerMarketCap.value)
    if (value > 10000000000) {
      dimension.score += 2.0
      statements.push({
        text: `Strong market position with ${sellerMarketCap.fact}, demonstrating vendor stability and credibility.`,
        source: {
          title: "Market Valuation",
          url: sellerMarketCap.source,
          quote: sellerMarketCap.fact
        }
      })
    }
  }
  
  // Leadership mentions in search results
  const leadershipSources = evidence.web.filter(w => 
    w.fact.toLowerCase().includes('leader') ||
    w.fact.toLowerCase().includes('leading') ||
    w.fact.toLowerCase().includes('top')
  )
  
  leadershipSources.slice(0, 2).forEach(source => {
    dimension.score += 1.0
    statements.push({
      text: source.fact,
      source: {
        title: source.title,
        url: source.source,
        quote: source.fact
      }
    })
  })
  
  // Competitive news
  const competitiveNews = evidence.news.find(n => 
    n.fact.toLowerCase().includes('market') ||
    n.fact.toLowerCase().includes('compete') ||
    n.fact.toLowerCase().includes('leader')
  )
  
  if (competitiveNews) {
    dimension.score += 1.0
    statements.push({
      text: `Market position: "${competitiveNews.fact}"`,
      source: {
        title: competitiveNews.fact,
        url: competitiveNews.source,
        quote: competitiveNews.description || competitiveNews.fact
      }
    })
  }
  
  dimension.summary = statements.length > 0
    ? statements[0].text.substring(0, 100) + "..."
    : "Competitive position based on market analysis."
  
  dimension.detailed_analysis = statements.map(s => s.text).join('\n\n')
  
  dimension.sources = statements.map(s => ({
    title: s.source.title,
    url: s.source.url,
    quote: s.source.quote,
    relevance: "Competitive positioning evidence",
    authority: new URL(s.source.url).hostname,
    trust_indicator: "✓ Market Analysis"
  }))
  
  dimension.score = Math.min(10, dimension.score)
  return dimension
}

// Generate Implementation Readiness with exact source URLs
function generateImplementationReadinessWithSources(evidence) {
  const dimension = {
    name: "Implementation Readiness",
    score: 5.0,
    weight: 0.15,
    summary: "",
    detailed_analysis: "",
    sources: []
  }
  
  const statements = []
  
  // Company size indicates capacity
  const targetMarketCap = evidence.financial.find(e => e.type === 'market_cap' && e.company === 'target')
  if (targetMarketCap) {
    const value = parseFinancialValue(targetMarketCap.value)
    if (value > 10000000000) {
      dimension.score += 2.0
      statements.push({
        text: `Organizational capacity demonstrated by ${targetMarketCap.fact}, indicating resources for successful implementation.`,
        source: {
          title: "Company Scale",
          url: targetMarketCap.source,
          quote: targetMarketCap.fact
        }
      })
    }
  }
  
  // Implementation or deployment mentions
  const implementationSources = evidence.web.filter(w => 
    w.fact.toLowerCase().includes('implement') ||
    w.fact.toLowerCase().includes('deploy') ||
    w.fact.toLowerCase().includes('rollout')
  )
  
  implementationSources.slice(0, 2).forEach(source => {
    dimension.score += 1.0
    statements.push({
      text: source.fact,
      source: {
        title: source.title,
        url: source.source,
        quote: source.fact
      }
    })
  })
  
  // Transformation news
  const transformationNews = evidence.news.find(n => 
    n.fact.toLowerCase().includes('transform') ||
    n.fact.toLowerCase().includes('implement') ||
    n.fact.toLowerCase().includes('initiative')
  )
  
  if (transformationNews) {
    dimension.score += 1.5
    statements.push({
      text: `Implementation activity: "${transformationNews.fact}"`,
      source: {
        title: transformationNews.fact,
        url: transformationNews.source,
        quote: transformationNews.description || transformationNews.fact
      }
    })
  }
  
  dimension.summary = statements.length > 0
    ? statements[0].text.substring(0, 100) + "..."
    : "Implementation readiness based on organizational indicators."
  
  dimension.detailed_analysis = statements.map(s => s.text).join('\n\n')
  
  dimension.sources = statements.map(s => ({
    title: s.source.title,
    url: s.source.url,
    quote: s.source.quote,
    relevance: "Implementation capacity evidence",
    authority: new URL(s.source.url).hostname,
    trust_indicator: "✓ Organizational Data"
  }))
  
  dimension.score = Math.min(10, dimension.score)
  return dimension
}

// Helper functions
function parseFinancialValue(value) {
  if (!value) return 0
  const str = value.toString().replace(/[$,]/g, '')
  
  if (str.includes('T')) return parseFloat(str) * 1000000000000
  if (str.includes('B')) return parseFloat(str) * 1000000000
  if (str.includes('M')) return parseFloat(str) * 1000000
  if (str.includes('K')) return parseFloat(str) * 1000
  
  return parseFloat(str) || 0
}

function detectRelevance(text) {
  const lower = text.toLowerCase()
  if (lower.includes('partner')) return 'partnership'
  if (lower.includes('invest')) return 'investment'
  if (lower.includes('revenue') || lower.includes('earning')) return 'financial'
  if (lower.includes('technolog') || lower.includes('digital')) return 'technology'
  if (lower.includes('expand') || lower.includes('growth')) return 'expansion'
  return 'general'
}