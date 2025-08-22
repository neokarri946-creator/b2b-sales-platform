// Detect if companies are competitors and adjust scoring accordingly

// Known competitor relationships
const KNOWN_COMPETITORS = [
  // Tech Giants
  ['microsoft', 'apple', 'google', 'amazon', 'meta', 'oracle'],
  
  // Cloud Providers
  ['aws', 'azure', 'gcp', 'google cloud', 'microsoft azure', 'amazon web services'],
  
  // CRM/Enterprise Software
  ['salesforce', 'hubspot', 'zoho', 'pipedrive', 'monday', 'dynamics'],
  
  // Social Media
  ['facebook', 'meta', 'twitter', 'x', 'linkedin', 'tiktok', 'snapchat'],
  
  // E-commerce
  ['amazon', 'walmart', 'target', 'ebay', 'alibaba'],
  
  // Streaming
  ['netflix', 'disney', 'hulu', 'hbo', 'paramount', 'peacock', 'apple tv'],
  
  // Payments
  ['paypal', 'stripe', 'square', 'adyen', 'worldpay'],
  
  // Ride-sharing
  ['uber', 'lyft', 'didi', 'grab'],
  
  // Food Delivery
  ['doordash', 'uber eats', 'grubhub', 'postmates'],
  
  // Airlines
  ['united', 'american', 'delta', 'southwest', 'jetblue'],
  
  // Automakers
  ['tesla', 'ford', 'gm', 'general motors', 'toyota', 'volkswagen', 'bmw', 'mercedes'],
  
  // Banks
  ['jpmorgan', 'chase', 'bank of america', 'wells fargo', 'citibank', 'goldman sachs'],
  
  // Consulting
  ['mckinsey', 'bain', 'bcg', 'deloitte', 'pwc', 'ey', 'kpmg', 'accenture']
]

// Industry mapping for companies
const COMPANY_INDUSTRIES = {
  // Tech/Software
  'microsoft': 'technology',
  'apple': 'technology', 
  'google': 'technology',
  'amazon': 'e-commerce/cloud',
  'meta': 'social-media',
  'oracle': 'enterprise-software',
  'salesforce': 'crm-software',
  'adobe': 'creative-software',
  'ibm': 'enterprise-technology',
  'cisco': 'networking',
  'intel': 'semiconductors',
  'nvidia': 'semiconductors',
  
  // E-commerce/Retail
  'walmart': 'retail',
  'target': 'retail',
  'ebay': 'e-commerce',
  'shopify': 'e-commerce-platform',
  'alibaba': 'e-commerce',
  
  // Finance
  'jpmorgan': 'banking',
  'goldman sachs': 'investment-banking',
  'visa': 'payments',
  'mastercard': 'payments',
  'paypal': 'payments',
  'stripe': 'payments',
  
  // Entertainment
  'netflix': 'streaming',
  'disney': 'entertainment',
  'spotify': 'music-streaming',
  
  // Transportation
  'uber': 'ride-sharing',
  'lyft': 'ride-sharing',
  'tesla': 'automotive',
  'ford': 'automotive',
  
  // Other
  'starbucks': 'food-service',
  'mcdonalds': 'food-service',
  'nike': 'apparel',
  'cocacola': 'beverages',
  'pepsi': 'beverages'
}

// Detect if two companies are competitors
export function areCompetitors(company1, company2) {
  const name1 = company1.toLowerCase().trim()
  const name2 = company2.toLowerCase().trim()
  
  // Check if in same competitor group
  for (const group of KNOWN_COMPETITORS) {
    const inGroup1 = group.some(c => name1.includes(c) || c.includes(name1))
    const inGroup2 = group.some(c => name2.includes(c) || c.includes(name2))
    
    if (inGroup1 && inGroup2) {
      return {
        areCompetitors: true,
        reason: 'Direct competitors in same market segment',
        severity: 'HIGH',
        group: group[0] // Return the group name
      }
    }
  }
  
  // Check if in same industry
  const industry1 = COMPANY_INDUSTRIES[name1]
  const industry2 = COMPANY_INDUSTRIES[name2]
  
  if (industry1 && industry2 && industry1 === industry2) {
    return {
      areCompetitors: true,
      reason: `Both operate in ${industry1} industry`,
      severity: 'MEDIUM'
    }
  }
  
  return {
    areCompetitors: false,
    reason: 'No competitive relationship detected',
    severity: 'NONE'
  }
}

// Analyze competition from news and search results - DEEP ANALYSIS
export function analyzeCompetitionFromResearch(researchData, sellerName = null, targetName = null) {
  const competitionSignals = []
  const seller = sellerName || researchData.seller?.company || ''
  const target = targetName || researchData.target?.company || ''
  
  // Enhanced competition keywords to detect ANY level of competition
  const competitionKeywords = [
    'compet', 'rival', 'versus', ' vs ', 'alternative', 'instead of',
    'better than', 'replaces', 'switch from', 'migrate from', 'compete',
    'market leader', 'market share', 'head to head', 'face off',
    'battle', 'challenge', 'threat', 'disrupt', 'cannibalize',
    'same space', 'similar offering', 'comparable', 'substitute'
  ]
  
  // Industry overlap keywords
  const industryOverlapKeywords = [
    'same industry', 'same market', 'same sector', 'same vertical',
    'same customers', 'target audience', 'customer base', 'overlap'
  ]
  
  // Product similarity keywords  
  const productSimilarityKeywords = [
    'similar product', 'similar service', 'similar solution', 'similar platform',
    'same problem', 'same use case', 'similar features', 'comparable offering'
  ]
  
  // Check news for competition mentions
  const allNews = [
    ...(researchData.seller.news || []),
    ...(researchData.target.news || [])
  ]
  
  allNews.forEach(article => {
    const text = (article.title + ' ' + (article.description || '') + ' ' + (article.summary || '')).toLowerCase()
    const sellerLower = seller.toLowerCase()
    const targetLower = target.toLowerCase()
    
    // Check for ANY competition keyword
    competitionKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        // Both companies mentioned together = HIGH signal
        if (text.includes(sellerLower) && text.includes(targetLower)) {
          competitionSignals.push({
            type: 'direct_competition',
            evidence: article.title,
            source: article.url,
            strength: 'HIGH',
            keyword: keyword,
            context: text.substring(Math.max(0, text.indexOf(keyword) - 50), Math.min(text.length, text.indexOf(keyword) + 100))
          })
        }
        // Single company with competition context = MEDIUM signal
        else if (text.includes(sellerLower) || text.includes(targetLower)) {
          competitionSignals.push({
            type: 'competition_context',
            evidence: article.title,
            source: article.url,
            strength: 'MEDIUM',
            keyword: keyword
          })
        }
      }
    })
    
    // Check for industry overlap
    industryOverlapKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        competitionSignals.push({
          type: 'industry_overlap',
          evidence: article.title,
          source: article.url,
          strength: 'MEDIUM',
          keyword: keyword
        })
      }
    })
    
    // Check for product similarity
    productSimilarityKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        competitionSignals.push({
          type: 'product_similarity',
          evidence: article.title,
          source: article.url,
          strength: 'MEDIUM',
          keyword: keyword
        })
      }
    })
  })
  
  // Check web search results with enhanced detection
  const allWebResults = [
    ...(researchData.seller.sources || []),
    ...(researchData.target.sources || [])
  ]
  
  allWebResults.forEach(result => {
    if (result.snippet || result.title) {
      const text = ((result.snippet || '') + ' ' + (result.title || '')).toLowerCase()
      const sellerLower = seller.toLowerCase()
      const targetLower = target.toLowerCase()
      
      // Direct competition mentions with both companies
      competitionKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          if (text.includes(sellerLower) && text.includes(targetLower)) {
            competitionSignals.push({
              type: 'web_competition',
              evidence: result.snippet || result.title,
              source: result.url,
              strength: 'HIGH',
              keyword: keyword
            })
          }
        }
      })
      
      // Check for comparison sites or articles
      if (text.includes('comparison') || text.includes('vs') || text.includes('versus') || 
          text.includes('review') || text.includes('alternative')) {
        if (text.includes(sellerLower) || text.includes(targetLower)) {
          competitionSignals.push({
            type: 'comparison_content',
            evidence: result.snippet || result.title,
            source: result.url,
            strength: 'HIGH'
          })
        }
      }
      
      // Check for "top competitors" or "alternatives" lists
      if (text.includes('top competitor') || text.includes('best alternative') || 
          text.includes('top 10') || text.includes('top 5')) {
        competitionSignals.push({
          type: 'competitor_list',
          evidence: result.snippet || result.title,
          source: result.url,
          strength: 'HIGH'
        })
      }
    }
  })
  
  // Analyze financial data for competitive indicators
  if (researchData.seller.financials && researchData.target.financials) {
    const sellerIndustry = researchData.seller.financials.data?.industry
    const targetIndustry = researchData.target.financials.data?.industry
    
    // Same industry = potential competitors
    if (sellerIndustry && targetIndustry && sellerIndustry === targetIndustry) {
      competitionSignals.push({
        type: 'same_industry',
        evidence: `Both operate in ${sellerIndustry}`,
        source: 'Financial data analysis',
        strength: 'HIGH'
      })
    }
    
    // Similar market cap = competing for same market segment
    const sellerCap = parseFinancialValue(researchData.seller.financials.data?.market_cap)
    const targetCap = parseFinancialValue(researchData.target.financials.data?.market_cap)
    
    if (sellerCap && targetCap) {
      const ratio = sellerCap / targetCap
      if (ratio > 0.5 && ratio < 2.0) {
        competitionSignals.push({
          type: 'similar_scale',
          evidence: 'Companies of similar size often compete',
          source: 'Market cap analysis',
          strength: 'MEDIUM'
        })
      }
    }
  }
  
  // Analyze technology stack for overlap
  if (researchData.seller.technology && researchData.target.technology) {
    const sellerTech = JSON.stringify(researchData.seller.technology.stack || {})
    const targetTech = JSON.stringify(researchData.target.technology.current_stack || {})
    
    // Check for technology overlap
    const techOverlap = ['cloud', 'saas', 'platform', 'api', 'enterprise'].filter(term => 
      sellerTech.toLowerCase().includes(term) && targetTech.toLowerCase().includes(term)
    )
    
    if (techOverlap.length > 2) {
      competitionSignals.push({
        type: 'technology_overlap',
        evidence: `Significant technology overlap in ${techOverlap.join(', ')}`,
        source: 'Technology stack analysis',
        strength: 'MEDIUM'
      })
    }
  }
  
  return competitionSignals
}

// Calculate competitive impact on score with INTELLIGENT DETECTION
export function calculateCompetitiveImpact(seller, target, researchData) {
  // Check if known competitors
  const competitorCheck = areCompetitors(seller, target)
  
  // Analyze research for competition signals - DEEP ANALYSIS
  const competitionSignals = analyzeCompetitionFromResearch(researchData, seller, target)
  
  // Detect product/service overlap from descriptions
  const productOverlap = detectProductOverlap(researchData)
  
  // Detect customer base overlap
  const customerOverlap = detectCustomerOverlap(researchData)
  
  // Calculate impact
  let impact = {
    scoreReduction: 0,
    reasons: [],
    evidence: [],
    competitionType: 'NONE'
  }
  
  // Count different types of competition signals
  const directCompetitionSignals = competitionSignals.filter(s => 
    s.type === 'direct_competition' || s.type === 'web_competition'
  )
  const highSignals = competitionSignals.filter(s => s.strength === 'HIGH')
  const mediumSignals = competitionSignals.filter(s => s.strength === 'MEDIUM')
  
  // CRITICAL: If we find DIRECT evidence of competition
  if (directCompetitionSignals.length > 0) {
    impact.scoreReduction = 75 // Massive reduction
    impact.competitionType = 'DIRECT_COMPETITOR'
    impact.reasons.push(`Direct competitive relationship found between ${seller} and ${target}`)
    impact.evidence.push(...directCompetitionSignals)
  }
  // Multiple HIGH strength signals = likely competitors
  else if (highSignals.length >= 3) {
    impact.scoreReduction = 65
    impact.competitionType = 'STRONG_COMPETITOR'
    impact.reasons.push('Multiple strong competition indicators detected')
    impact.evidence.push(...highSignals)
  }
  // Some HIGH signals = probable competitors
  else if (highSignals.length > 0) {
    impact.scoreReduction = 55
    impact.competitionType = 'LIKELY_COMPETITOR'
    impact.reasons.push('Competition indicators found in market research')
    impact.evidence.push(...highSignals)
  }
  // Multiple MEDIUM signals = possible competitors
  else if (mediumSignals.length >= 4) {
    impact.scoreReduction = 45
    impact.competitionType = 'POSSIBLE_COMPETITOR'
    impact.reasons.push('Several competition factors detected')
    impact.evidence.push(...mediumSignals.slice(0, 4))
  }
  // Some competition signals
  else if (competitionSignals.length > 0) {
    impact.scoreReduction = 35
    impact.competitionType = 'INDIRECT_COMPETITOR'
    impact.reasons.push('Some competitive overlap detected')
    impact.evidence.push(...competitionSignals.slice(0, 3))
  }
  
  // Check known competitors list
  if (competitorCheck.areCompetitors) {
    if (competitorCheck.severity === 'HIGH') {
      impact.scoreReduction = Math.max(impact.scoreReduction, 70)
      impact.reasons.push(`${seller} and ${target} are known direct competitors`)
      impact.competitionType = 'KNOWN_COMPETITOR'
    } else {
      impact.scoreReduction = Math.max(impact.scoreReduction, 50)
      impact.reasons.push(`${seller} and ${target} compete in the same industry`)
      if (impact.competitionType === 'NONE') {
        impact.competitionType = 'INDUSTRY_COMPETITOR'
      }
    }
    impact.evidence.push({
      type: 'known_competitor',
      detail: competitorCheck.reason
    })
  }
  
  // Check for product overlap
  if (productOverlap.hasOverlap) {
    impact.scoreReduction = Math.max(impact.scoreReduction, productOverlap.severity * 10)
    impact.reasons.push(productOverlap.reason)
    impact.evidence.push({
      type: 'product_overlap',
      detail: productOverlap.details
    })
  }
  
  // Check for customer overlap
  if (customerOverlap.hasOverlap) {
    impact.scoreReduction = Math.max(impact.scoreReduction, customerOverlap.severity * 10)
    impact.reasons.push(customerOverlap.reason)
    impact.evidence.push({
      type: 'customer_overlap',
      detail: customerOverlap.details
    })
  }
  
  // Special cases for obvious competitors
  const obviousCompetitors = [
    ['microsoft', 'apple'],
    ['google', 'microsoft'],
    ['amazon', 'microsoft'],
    ['oracle', 'salesforce'],
    ['uber', 'lyft'],
    ['coca-cola', 'pepsi'],
    ['nike', 'adidas'],
    ['bmw', 'mercedes'],
    ['netflix', 'disney'],
    ['spotify', 'apple music'],
    ['zoom', 'teams'],
    ['slack', 'teams'],
    ['dropbox', 'google drive'],
    ['aws', 'azure'],
    ['stripe', 'paypal']
  ]
  
  const s = seller.toLowerCase()
  const t = target.toLowerCase()
  
  for (const [comp1, comp2] of obviousCompetitors) {
    if ((s.includes(comp1) && t.includes(comp2)) || 
        (s.includes(comp2) && t.includes(comp1))) {
      impact.scoreReduction = Math.max(impact.scoreReduction, 80)
      impact.reasons.push('Well-known industry rivals - partnership extremely unlikely')
      impact.competitionType = 'ARCH_RIVALS'
      break
    }
  }
  
  // Cap the reduction at 85% - leave some room for edge cases
  impact.scoreReduction = Math.min(85, impact.scoreReduction)
  
  return impact
}

// Detect product/service overlap from research data
function detectProductOverlap(researchData) {
  const overlap = {
    hasOverlap: false,
    severity: 0,
    reason: '',
    details: []
  }
  
  // Ensure researchData has the expected structure
  if (!researchData || !researchData.seller || !researchData.target) {
    return overlap
  }
  
  // Get product descriptions from sources
  const sellerProducts = []
  const targetProducts = []
  
  // Extract product mentions from all sources
  researchData.seller.sources?.forEach(source => {
    if (source.snippet) {
      const products = extractProductMentions(source.snippet)
      sellerProducts.push(...products)
    }
  })
  
  researchData.target.sources?.forEach(source => {
    if (source.snippet) {
      const products = extractProductMentions(source.snippet)
      targetProducts.push(...products)
    }
  })
  
  // Check for overlap
  const commonProducts = sellerProducts.filter(p => 
    targetProducts.some(tp => areSimilarProducts(p, tp))
  )
  
  if (commonProducts.length > 0) {
    overlap.hasOverlap = true
    overlap.severity = Math.min(8, commonProducts.length * 2)
    overlap.reason = `Both companies offer similar products/services`
    overlap.details = commonProducts
  }
  
  return overlap
}

// Detect customer base overlap
function detectCustomerOverlap(researchData) {
  const overlap = {
    hasOverlap: false,
    severity: 0,
    reason: '',
    details: []
  }
  
  // Ensure researchData has the expected structure
  if (!researchData || !researchData.seller || !researchData.target) {
    return overlap
  }
  
  // Check if they target the same customer segments
  const sellerCustomers = extractCustomerSegments(researchData.seller)
  const targetCustomers = extractCustomerSegments(researchData.target)
  
  const commonSegments = sellerCustomers.filter(s => 
    targetCustomers.includes(s)
  )
  
  if (commonSegments.length > 0) {
    overlap.hasOverlap = true
    overlap.severity = Math.min(7, commonSegments.length * 2.5)
    overlap.reason = `Both target the same customer segments: ${commonSegments.join(', ')}`
    overlap.details = commonSegments
  }
  
  return overlap
}

// Helper function to extract product mentions
function extractProductMentions(text) {
  const products = []
  const productKeywords = [
    'platform', 'software', 'solution', 'service', 'product',
    'tool', 'system', 'application', 'suite', 'cloud'
  ]
  
  const lower = text.toLowerCase()
  productKeywords.forEach(keyword => {
    if (lower.includes(keyword)) {
      // Extract context around the keyword
      const startIdx = Math.max(0, lower.indexOf(keyword) - 20)
      const endIdx = Math.min(text.length, lower.indexOf(keyword) + 30)
      products.push(text.substring(startIdx, endIdx).trim())
    }
  })
  
  return products
}

// Helper function to check if products are similar
function areSimilarProducts(product1, product2) {
  const p1 = product1.toLowerCase()
  const p2 = product2.toLowerCase()
  
  // Check for common product terms
  const commonTerms = [
    'crm', 'erp', 'analytics', 'cloud', 'storage', 'compute',
    'database', 'security', 'payment', 'messaging', 'collaboration',
    'marketing', 'sales', 'support', 'finance', 'hr'
  ]
  
  return commonTerms.some(term => p1.includes(term) && p2.includes(term))
}

// Helper function to extract customer segments
function extractCustomerSegments(companyData) {
  const segments = []
  
  // Check sources for customer mentions
  companyData.sources?.forEach(source => {
    const text = (source.snippet || '').toLowerCase()
    
    if (text.includes('enterprise')) segments.push('enterprise')
    if (text.includes('smb') || text.includes('small business')) segments.push('SMB')
    if (text.includes('startup')) segments.push('startups')
    if (text.includes('fortune 500')) segments.push('Fortune 500')
    if (text.includes('government')) segments.push('government')
    if (text.includes('healthcare')) segments.push('healthcare')
    if (text.includes('financial')) segments.push('financial services')
    if (text.includes('retail')) segments.push('retail')
  })
  
  return [...new Set(segments)] // Remove duplicates
}

// Helper function to parse financial values
function parseFinancialValue(value) {
  if (!value) return 0
  const str = value.toString().replace(/[$,]/g, '')
  
  if (str.includes('T')) return parseFloat(str) * 1000000000000
  if (str.includes('B')) return parseFloat(str) * 1000000000
  if (str.includes('M')) return parseFloat(str) * 1000000
  if (str.includes('K')) return parseFloat(str) * 1000
  
  return parseFloat(str) || 0
}