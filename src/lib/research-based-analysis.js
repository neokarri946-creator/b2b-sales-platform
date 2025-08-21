// Generate analysis based entirely on real research data
// Every conclusion must be traceable to actual scraped information

export function generateResearchBasedAnalysis(researchData) {
  const { seller: sellerData, target: targetData } = researchData
  
  // Extract real metrics from the research
  const realMetrics = extractRealMetrics(researchData)
  const newsSignals = analyzeNewsSignals(researchData)
  const financialHealth = analyzeFinancialHealth(researchData)
  const marketTrends = extractMarketTrends(researchData)
  
  return {
    success_probability: calculateRealSuccessProbability(realMetrics, newsSignals, financialHealth),
    compatibility: generateDataDrivenCompatibility(researchData),
    dimensions: generateDimensionsFromResearch(researchData, realMetrics, newsSignals),
    sources_used: compileSourcesUsed(researchData)
  }
}

// Calculate success probability from real data only
function calculateRealSuccessProbability(metrics, newsSignals, financialHealth) {
  let score = 50 // Base score
  
  // Adjust based on real financial data
  if (financialHealth.targetRevenuGrowth > 10) score += 10 // Growing companies buy more
  if (financialHealth.targetProfitMargin > 20) score += 8 // Profitable companies have budget
  if (financialHealth.sellerMarketCap > 10000000000) score += 5 // Large vendors are trusted
  
  // Adjust based on real news sentiment
  if (newsSignals.recentPartnership) score += 15 // Recent partnerships show openness
  if (newsSignals.technologyInvestment) score += 12 // Tech investment indicates budget
  if (newsSignals.expansionNews) score += 8 // Expanding companies need vendors
  
  // Negative signals from real data
  if (newsSignals.layoffs) score -= 20 // Layoffs mean budget cuts
  if (newsSignals.legalIssues) score -= 15 // Legal issues delay decisions
  if (financialHealth.targetRevenuGrowth < 0) score -= 10 // Declining companies don't buy
  
  return Math.max(5, Math.min(95, score)) // Keep between 5-95%
}

// Extract real metrics from research data
function extractRealMetrics(researchData) {
  const metrics = {
    // From financial APIs
    sellerMarketCap: parseFinancialValue(researchData.seller.financials?.data?.market_cap),
    sellerRevenue: parseFinancialValue(researchData.seller.financials?.data?.revenue),
    targetMarketCap: parseFinancialValue(researchData.target.financials?.data?.market_cap),
    targetRevenue: parseFinancialValue(researchData.target.financials?.data?.revenue),
    targetITBudget: parseFinancialValue(researchData.target.financials?.data?.it_budget),
    
    // From news analysis
    newsArticleCount: (researchData.seller.news?.length || 0) + (researchData.target.news?.length || 0),
    recentNewsDate: getMostRecentNewsDate(researchData),
    
    // From Google Search
    webPresenceScore: researchData.seller.sources?.filter(s => s.type === 'web_search').length || 0,
    
    // Calculated from real data
    relativeSize: null, // Will calculate below
    industryAlignment: null // Will determine from actual descriptions
  }
  
  // Calculate relative company sizes from real data
  if (metrics.sellerMarketCap && metrics.targetMarketCap) {
    metrics.relativeSize = metrics.sellerMarketCap / metrics.targetMarketCap
  }
  
  return metrics
}

// Analyze news for buying signals
function analyzeNewsSignals(researchData) {
  const allNews = [
    ...(researchData.seller.news || []),
    ...(researchData.target.news || [])
  ]
  
  const signals = {
    recentPartnership: false,
    technologyInvestment: false,
    expansionNews: false,
    layoffs: false,
    legalIssues: false,
    earningsGrowth: false
  }
  
  // Analyze each news article for signals
  allNews.forEach(article => {
    const text = (article.title + ' ' + article.summary).toLowerCase()
    
    // Positive signals
    if (text.includes('partner') || text.includes('collaboration')) signals.recentPartnership = true
    if (text.includes('invest') && text.includes('technology')) signals.technologyInvestment = true
    if (text.includes('expand') || text.includes('growth')) signals.expansionNews = true
    if (text.includes('earnings beat') || text.includes('revenue up')) signals.earningsGrowth = true
    
    // Negative signals
    if (text.includes('layoff') || text.includes('job cut')) signals.layoffs = true
    if (text.includes('lawsuit') || text.includes('investigation')) signals.legalIssues = true
  })
  
  return signals
}

// Analyze financial health from real data
function analyzeFinancialHealth(researchData) {
  const health = {
    targetRevenuGrowth: 0,
    targetProfitMargin: 0,
    sellerMarketCap: 0,
    budgetAvailable: false
  }
  
  // Extract growth rate from real data
  const targetGrowth = researchData.target.financials?.data?.revenue_growth
  if (targetGrowth) {
    health.targetRevenuGrowth = parseFloat(targetGrowth.replace('%', ''))
  }
  
  // Extract profit margin from real data
  const targetMargin = researchData.target.financials?.data?.profit_margin
  if (targetMargin) {
    health.targetProfitMargin = parseFloat(targetMargin.replace('%', ''))
  }
  
  // Get seller market cap
  health.sellerMarketCap = parseFinancialValue(researchData.seller.financials?.data?.market_cap)
  
  // Determine budget availability from IT budget or cash reserves
  const itBudget = parseFinancialValue(researchData.target.financials?.data?.it_budget)
  const cashReserves = parseFinancialValue(researchData.target.financials?.data?.cash_reserves)
  health.budgetAvailable = (itBudget > 1000000000) || (cashReserves > 10000000000)
  
  return health
}

// Extract market trends from search results and news
function extractMarketTrends(researchData) {
  const trends = {
    marketGrowth: false,
    digitalTransformation: false,
    cloudAdoption: false,
    aiInvestment: false
  }
  
  // Analyze all text content for trends
  const allText = [
    ...researchData.seller.sources.map(s => s.snippet || ''),
    ...researchData.target.sources.map(s => s.snippet || ''),
    ...researchData.seller.news.map(n => n.title + ' ' + n.summary),
    ...researchData.target.news.map(n => n.title + ' ' + n.summary)
  ].join(' ').toLowerCase()
  
  // Detect trends from real content
  if (allText.includes('market growth') || allText.includes('growing')) trends.marketGrowth = true
  if (allText.includes('digital transformation')) trends.digitalTransformation = true
  if (allText.includes('cloud') || allText.includes('saas')) trends.cloudAdoption = true
  if (allText.includes('artificial intelligence') || allText.includes(' ai ')) trends.aiInvestment = true
  
  return trends
}

// Generate compatibility analysis from real data
function generateDataDrivenCompatibility(researchData) {
  const compatibility = {
    score: 50,
    factors: [],
    evidence: []
  }
  
  // Check industry alignment from real descriptions
  const sellerDesc = researchData.seller.financials?.data?.description || ''
  const targetDesc = researchData.target.financials?.data?.description || ''
  
  // Technology companies working together
  if (sellerDesc.includes('software') && targetDesc.includes('technology')) {
    compatibility.score += 15
    compatibility.factors.push('Both operate in technology sector')
    compatibility.evidence.push({
      source: researchData.seller.financials?.source,
      data: 'Industry classification shows technology alignment'
    })
  }
  
  // Size compatibility from real market caps
  const sellerCap = parseFinancialValue(researchData.seller.financials?.data?.market_cap)
  const targetCap = parseFinancialValue(researchData.target.financials?.data?.market_cap)
  
  if (sellerCap && targetCap) {
    const ratio = sellerCap / targetCap
    if (ratio > 0.1 && ratio < 10) {
      compatibility.score += 10
      compatibility.factors.push('Similar company sizes enable partnership')
      compatibility.evidence.push({
        source: 'Financial data',
        data: `Market cap ratio ${ratio.toFixed(2)} indicates compatible scale`
      })
    }
  }
  
  // Check for existing relationships in news
  const newsText = researchData.seller.news.map(n => n.title).join(' ')
  if (newsText.includes(researchData.target.company)) {
    compatibility.score += 20
    compatibility.factors.push('Previous business relationship found')
    compatibility.evidence.push({
      source: 'News analysis',
      data: 'News articles mention both companies together'
    })
  }
  
  return compatibility
}

// Generate dimension scores from real research
function generateDimensionsFromResearch(researchData, metrics, signals) {
  return {
    marketAlignment: {
      score: calculateMarketAlignmentFromData(researchData, metrics),
      evidence: extractMarketEvidence(researchData),
      sources: researchData.seller.sources.filter(s => s.url.includes('market') || s.url.includes('finance'))
    },
    budgetReadiness: {
      score: calculateBudgetReadinessFromData(researchData, metrics),
      evidence: extractBudgetEvidence(researchData),
      sources: researchData.target.sources.filter(s => s.url.includes('finance') || s.url.includes('earnings'))
    },
    technologyFit: {
      score: calculateTechFitFromData(researchData),
      evidence: extractTechEvidence(researchData),
      sources: researchData.seller.sources.filter(s => s.snippet?.includes('technology') || s.snippet?.includes('API'))
    },
    competitivePosition: {
      score: calculateCompetitivePositionFromData(researchData, metrics),
      evidence: extractCompetitiveEvidence(researchData),
      sources: researchData.seller.sources.filter(s => s.snippet?.includes('market share') || s.snippet?.includes('leader'))
    },
    implementationReadiness: {
      score: calculateImplementationReadinessFromData(researchData, signals),
      evidence: extractImplementationEvidence(researchData),
      sources: researchData.target.sources.filter(s => s.snippet?.includes('implementation') || s.snippet?.includes('deploy'))
    }
  }
}

// Calculate market alignment from real data
function calculateMarketAlignmentFromData(researchData, metrics) {
  let score = 5.0 // Base score
  
  // Industry match from real data
  const sellerIndustry = researchData.seller.financials?.data?.industry
  const targetIndustry = researchData.target.financials?.data?.industry
  
  if (sellerIndustry && targetIndustry) {
    if (sellerIndustry === targetIndustry) score += 2.0
    else if (isRelatedIndustry(sellerIndustry, targetIndustry)) score += 1.0
  }
  
  // Market position from real market cap
  if (metrics.sellerMarketCap > 10000000000) score += 1.5 // $10B+ vendor
  if (metrics.targetMarketCap > 50000000000) score += 1.0 // $50B+ buyer
  
  // News sentiment
  if (metrics.newsArticleCount > 5) score += 0.5 // Active in news
  
  return Math.min(10, score)
}

// Calculate budget readiness from real financial data
function calculateBudgetReadinessFromData(researchData, metrics) {
  let score = 3.0 // Base score
  
  // IT Budget from real data
  if (metrics.targetITBudget) {
    if (metrics.targetITBudget > 5000000000) score += 3.0 // $5B+ IT budget
    else if (metrics.targetITBudget > 1000000000) score += 2.0 // $1B+ IT budget
    else if (metrics.targetITBudget > 100000000) score += 1.0 // $100M+ IT budget
  }
  
  // Revenue growth indicates budget availability
  const growth = parseFloat(researchData.target.financials?.data?.revenue_growth?.replace('%', '') || '0')
  if (growth > 15) score += 2.0
  else if (growth > 5) score += 1.0
  
  // Cash reserves
  const cash = parseFinancialValue(researchData.target.financials?.data?.cash_reserves)
  if (cash > 50000000000) score += 2.0 // $50B+ cash
  
  return Math.min(10, score)
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

function getMostRecentNewsDate(researchData) {
  const allDates = [
    ...researchData.seller.news.map(n => new Date(n.date || n.publishedAt)),
    ...researchData.target.news.map(n => new Date(n.date || n.publishedAt))
  ].filter(d => !isNaN(d))
  
  return allDates.length > 0 ? Math.max(...allDates) : null
}

function isRelatedIndustry(industry1, industry2) {
  const related = {
    'Software': ['Technology', 'Cloud Services', 'SaaS'],
    'Technology': ['Software', 'Hardware', 'Semiconductors'],
    'Financial': ['Banking', 'Insurance', 'Fintech']
  }
  
  return related[industry1]?.includes(industry2) || related[industry2]?.includes(industry1)
}

// Extract evidence from real sources
function extractMarketEvidence(researchData) {
  const evidence = []
  
  // From financial data
  if (researchData.seller.financials?.data?.market_cap) {
    evidence.push({
      type: 'financial',
      data: `Seller market cap: ${researchData.seller.financials.data.market_cap}`,
      source: researchData.seller.financials.source
    })
  }
  
  // From news
  researchData.seller.news.slice(0, 2).forEach(article => {
    evidence.push({
      type: 'news',
      data: article.title,
      source: article.url
    })
  })
  
  // From search results
  researchData.seller.sources
    .filter(s => s.type === 'web_search')
    .slice(0, 2)
    .forEach(result => {
      evidence.push({
        type: 'web',
        data: result.snippet,
        source: result.url
      })
    })
  
  return evidence
}

function extractBudgetEvidence(researchData) {
  const evidence = []
  
  if (researchData.target.financials?.data?.revenue_growth) {
    evidence.push({
      type: 'financial',
      data: `Revenue growth: ${researchData.target.financials.data.revenue_growth}`,
      source: researchData.target.financials.source
    })
  }
  
  if (researchData.target.financials?.data?.it_budget) {
    evidence.push({
      type: 'financial',
      data: `IT Budget: ${researchData.target.financials.data.it_budget}`,
      source: researchData.target.financials.source
    })
  }
  
  return evidence
}

function extractTechEvidence(researchData) {
  const evidence = []
  
  // Look for technology mentions in sources
  researchData.seller.sources.forEach(source => {
    if (source.snippet && (source.snippet.includes('API') || source.snippet.includes('integration'))) {
      evidence.push({
        type: 'technical',
        data: source.snippet,
        source: source.url
      })
    }
  })
  
  return evidence
}

function extractCompetitiveEvidence(researchData) {
  const evidence = []
  
  // Market position from sources
  researchData.seller.sources.forEach(source => {
    if (source.snippet && (source.snippet.includes('leader') || source.snippet.includes('market share'))) {
      evidence.push({
        type: 'competitive',
        data: source.snippet,
        source: source.url
      })
    }
  })
  
  return evidence
}

function extractImplementationEvidence(researchData) {
  const evidence = []
  
  // Company size indicates implementation capacity
  if (researchData.target.statistics?.it_staff) {
    evidence.push({
      type: 'organizational',
      data: `IT Staff: ${researchData.target.statistics.it_staff}`,
      source: 'Company data'
    })
  }
  
  return evidence
}

function calculateTechFitFromData(researchData) {
  let score = 5.0
  
  // Look for technology compatibility mentions
  const techMentions = researchData.seller.sources.filter(s => 
    s.snippet?.includes('API') || 
    s.snippet?.includes('integration') ||
    s.snippet?.includes('compatible')
  ).length
  
  score += Math.min(3, techMentions * 0.5)
  
  // Check if both use cloud
  const sellerCloud = researchData.seller.sources.some(s => s.snippet?.includes('cloud'))
  const targetCloud = researchData.target.sources.some(s => s.snippet?.includes('cloud'))
  
  if (sellerCloud && targetCloud) score += 2.0
  
  return Math.min(10, score)
}

function calculateCompetitivePositionFromData(researchData, metrics) {
  let score = 5.0
  
  // Market cap indicates market position
  if (metrics.sellerMarketCap > 50000000000) score += 2.0 // $50B+ strong position
  else if (metrics.sellerMarketCap > 10000000000) score += 1.0 // $10B+ good position
  
  // Leadership mentions
  const leaderMentions = researchData.seller.sources.filter(s => 
    s.snippet?.includes('leader') || s.snippet?.includes('leading')
  ).length
  
  score += Math.min(2, leaderMentions * 0.5)
  
  // Customer satisfaction from news
  const satisfactionNews = researchData.seller.news.some(n => 
    n.title.includes('customer') && n.title.includes('satisfaction')
  )
  if (satisfactionNews) score += 1.0
  
  return Math.min(10, score)
}

function calculateImplementationReadinessFromData(researchData, signals) {
  let score = 5.0
  
  // Positive signals increase readiness
  if (signals.technologyInvestment) score += 2.0
  if (signals.expansionNews) score += 1.5
  if (!signals.layoffs) score += 1.0 // No layoffs is good
  
  // Company size indicates capacity
  const employees = researchData.target.statistics?.it_staff
  if (employees > 5000) score += 1.5
  else if (employees > 1000) score += 1.0
  
  return Math.min(10, score)
}

function compileSourcesUsed(researchData) {
  return {
    financial_sources: [
      ...researchData.seller.sources.filter(s => s.type === 'financial'),
      ...researchData.target.sources.filter(s => s.type === 'financial')
    ],
    news_sources: [
      ...researchData.seller.news.map(n => ({ url: n.url, title: n.title })),
      ...researchData.target.news.map(n => ({ url: n.url, title: n.title }))
    ],
    web_sources: [
      ...researchData.seller.sources.filter(s => s.type === 'web_search'),
      ...researchData.target.sources.filter(s => s.type === 'web_search')
    ]
  }
}