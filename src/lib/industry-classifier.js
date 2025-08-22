// Comprehensive industry classification and compatibility system

// Industry categories with risk levels and characteristics
export const INDUSTRY_CATEGORIES = {
  // High-risk industries (typically incompatible with enterprises)
  HIGH_RISK: {
    adult_entertainment: {
      keywords: ['adult', 'porn', 'pornography', 'xxx', 'escort', 'sex', 'erotic', 'nude', 'onlyfans', 'strip club', 'cam'],
      risk_level: 10,
      enterprise_compatible: false,
      government_compatible: false,
      description: 'Adult entertainment and related services'
    },
    gambling: {
      keywords: ['casino', 'gambling', 'betting', 'lottery', 'poker', 'sportsbook', 'wagering', 'bookmaker'],
      risk_level: 9,
      enterprise_compatible: false,
      government_compatible: false,
      description: 'Gambling and betting services'
    },
    cannabis: {
      keywords: ['cannabis', 'marijuana', 'weed', 'thc', 'cbd', 'dispensary', 'hemp'],
      risk_level: 8,
      enterprise_compatible: false,
      government_compatible: false,
      description: 'Cannabis and related products'
    },
    weapons: {
      keywords: ['weapons', 'firearms', 'guns', 'ammunition', 'explosives', 'military weapons', 'assault'],
      risk_level: 9,
      enterprise_compatible: false,
      government_compatible: false,
      description: 'Weapons and firearms'
    },
    tobacco: {
      keywords: ['tobacco', 'cigarette', 'cigar', 'smoking', 'nicotine', 'vaping', 'e-cigarette', 'juul'],
      risk_level: 7,
      enterprise_compatible: false,
      government_compatible: false,
      description: 'Tobacco and vaping products'
    },
    crypto_unregulated: {
      keywords: ['crypto scam', 'ponzi', 'pyramid', 'mlm', 'get rich quick', 'bitcoin mining scheme'],
      risk_level: 10,
      enterprise_compatible: false,
      government_compatible: false,
      description: 'Unregulated crypto and potential scams'
    }
  },
  
  // Medium-risk industries (limited compatibility)
  MEDIUM_RISK: {
    alcohol: {
      keywords: ['alcohol', 'liquor', 'beer', 'wine', 'spirits', 'brewery', 'distillery'],
      risk_level: 5,
      enterprise_compatible: 'limited',
      government_compatible: false,
      description: 'Alcohol production and distribution'
    },
    political: {
      keywords: ['political party', 'campaign', 'lobbying', 'political action'],
      risk_level: 6,
      enterprise_compatible: 'limited',
      government_compatible: 'limited',
      description: 'Political organizations and campaigns'
    },
    religious: {
      keywords: ['church', 'mosque', 'temple', 'religious', 'faith-based', 'ministry'],
      risk_level: 4,
      enterprise_compatible: 'limited',
      government_compatible: 'limited',
      description: 'Religious organizations'
    },
    dating: {
      keywords: ['dating', 'matchmaking', 'singles', 'romance', 'tinder', 'bumble', 'hinge'],
      risk_level: 5,
      enterprise_compatible: 'limited',
      government_compatible: false,
      description: 'Dating and matchmaking services'
    }
  },
  
  // Low-risk industries (generally compatible)
  LOW_RISK: {
    technology: {
      keywords: ['software', 'saas', 'tech', 'it', 'cloud', 'ai', 'machine learning', 'data'],
      risk_level: 1,
      enterprise_compatible: true,
      government_compatible: true,
      description: 'Technology and software companies'
    },
    consulting: {
      keywords: ['consulting', 'advisory', 'professional services', 'strategy', 'management'],
      risk_level: 1,
      enterprise_compatible: true,
      government_compatible: true,
      description: 'Consulting and professional services'
    },
    healthcare: {
      keywords: ['healthcare', 'medical', 'hospital', 'clinic', 'health', 'pharma', 'biotech'],
      risk_level: 2,
      enterprise_compatible: true,
      government_compatible: true,
      description: 'Healthcare and medical services'
    },
    finance: {
      keywords: ['bank', 'finance', 'investment', 'insurance', 'fintech', 'payment', 'lending'],
      risk_level: 2,
      enterprise_compatible: true,
      government_compatible: true,
      description: 'Financial services'
    },
    education: {
      keywords: ['education', 'university', 'school', 'training', 'learning', 'edtech'],
      risk_level: 1,
      enterprise_compatible: true,
      government_compatible: true,
      description: 'Education and training'
    },
    retail: {
      keywords: ['retail', 'ecommerce', 'shopping', 'store', 'marketplace', 'consumer goods'],
      risk_level: 2,
      enterprise_compatible: true,
      government_compatible: true,
      description: 'Retail and consumer goods'
    },
    manufacturing: {
      keywords: ['manufacturing', 'factory', 'production', 'industrial', 'supply chain'],
      risk_level: 2,
      enterprise_compatible: true,
      government_compatible: true,
      description: 'Manufacturing and industrial'
    }
  }
}

// Enterprise buyer types with their characteristics
export const BUYER_TYPES = {
  FORTUNE_500: {
    keywords: ['oracle', 'microsoft', 'amazon', 'google', 'apple', 'ibm', 'salesforce', 'adobe', 'cisco', 'intel', 'meta', 'walmart', 'jpmorgan', 'berkshire'],
    conservatism_level: 9,
    compliance_requirements: 'very_high',
    vendor_screening: 'strict',
    reputation_sensitivity: 10
  },
  GOVERNMENT: {
    keywords: ['federal', 'government', 'state', 'city', 'county', 'municipal', 'defense', 'military', 'pentagon', 'fbi', 'cia', 'nsa', 'dhs'],
    conservatism_level: 10,
    compliance_requirements: 'maximum',
    vendor_screening: 'maximum',
    reputation_sensitivity: 10
  },
  HEALTHCARE: {
    keywords: ['hospital', 'medical center', 'clinic', 'health system', 'kaiser', 'mayo clinic', 'cleveland clinic'],
    conservatism_level: 8,
    compliance_requirements: 'very_high',
    vendor_screening: 'strict',
    reputation_sensitivity: 9
  },
  FINANCIAL: {
    keywords: ['bank', 'capital', 'investment', 'insurance', 'goldman', 'morgan stanley', 'wells fargo', 'chase', 'citi'],
    conservatism_level: 9,
    compliance_requirements: 'very_high',
    vendor_screening: 'strict',
    reputation_sensitivity: 9
  },
  EDUCATION: {
    keywords: ['university', 'college', 'school', 'academy', 'institute', 'harvard', 'stanford', 'mit'],
    conservatism_level: 7,
    compliance_requirements: 'high',
    vendor_screening: 'moderate',
    reputation_sensitivity: 8
  },
  STARTUP: {
    keywords: ['startup', 'ventures', 'labs', 'innovation', 'disrupt'],
    conservatism_level: 3,
    compliance_requirements: 'low',
    vendor_screening: 'flexible',
    reputation_sensitivity: 4
  }
}

// Classify a company's industry
export function classifyIndustry(companyName, description = '') {
  const searchText = `${companyName} ${description}`.toLowerCase()
  
  // Check high-risk industries first
  for (const [category, details] of Object.entries(INDUSTRY_CATEGORIES.HIGH_RISK)) {
    if (details.keywords.some(keyword => searchText.includes(keyword))) {
      return {
        category,
        risk_level: details.risk_level,
        risk_category: 'HIGH_RISK',
        ...details
      }
    }
  }
  
  // Check medium-risk industries
  for (const [category, details] of Object.entries(INDUSTRY_CATEGORIES.MEDIUM_RISK)) {
    if (details.keywords.some(keyword => searchText.includes(keyword))) {
      return {
        category,
        risk_level: details.risk_level,
        risk_category: 'MEDIUM_RISK',
        ...details
      }
    }
  }
  
  // Check low-risk industries
  for (const [category, details] of Object.entries(INDUSTRY_CATEGORIES.LOW_RISK)) {
    if (details.keywords.some(keyword => searchText.includes(keyword))) {
      return {
        category,
        risk_level: details.risk_level,
        risk_category: 'LOW_RISK',
        ...details
      }
    }
  }
  
  // Industry-specific classifications for common companies
  const companyLower = companyName.toLowerCase()
  
  // Oil & Gas vs Green Tech (opposites)
  if (companyLower.includes('exxon') || companyLower.includes('chevron') || companyLower.includes('shell') || 
      companyLower.includes('bp') || searchText.includes('oil') || searchText.includes('petroleum')) {
    return {
      category: 'oil_gas',
      risk_level: 6,
      risk_category: 'MEDIUM_RISK',
      enterprise_compatible: true,
      government_compatible: 'limited',
      description: 'Oil and gas industry'
    }
  }
  
  if (companyLower.includes('tesla') || companyLower.includes('rivian') || searchText.includes('electric vehicle') ||
      searchText.includes('solar') || searchText.includes('renewable')) {
    return {
      category: 'green_tech',
      risk_level: 2,
      risk_category: 'LOW_RISK',
      enterprise_compatible: true,
      government_compatible: true,
      description: 'Green technology and clean energy'
    }
  }
  
  // Traditional Retail vs E-commerce
  if (companyLower.includes('walmart') || companyLower.includes('target') || companyLower.includes('kroger') ||
      companyLower.includes('costco') || companyLower.includes('home depot')) {
    return {
      category: 'traditional_retail',
      risk_level: 3,
      risk_category: 'LOW_RISK',
      enterprise_compatible: true,
      government_compatible: true,
      description: 'Traditional retail and brick-and-mortar'
    }
  }
  
  if (companyLower.includes('amazon') || companyLower.includes('shopify') || companyLower.includes('etsy') ||
      companyLower.includes('ebay') || searchText.includes('e-commerce')) {
    return {
      category: 'ecommerce',
      risk_level: 2,
      risk_category: 'LOW_RISK',
      enterprise_compatible: true,
      government_compatible: true,
      description: 'E-commerce and online retail'
    }
  }
  
  // Fast Food vs Health Food
  if (companyLower.includes('mcdonald') || companyLower.includes('burger king') || companyLower.includes('kfc') ||
      companyLower.includes('taco bell') || searchText.includes('fast food')) {
    return {
      category: 'fast_food',
      risk_level: 4,
      risk_category: 'MEDIUM_RISK',
      enterprise_compatible: true,
      government_compatible: 'limited',
      description: 'Fast food and quick service restaurants'
    }
  }
  
  if (companyLower.includes('whole foods') || companyLower.includes('sweetgreen') || searchText.includes('organic') ||
      searchText.includes('health food') || searchText.includes('vegan')) {
    return {
      category: 'health_food',
      risk_level: 2,
      risk_category: 'LOW_RISK',
      enterprise_compatible: true,
      government_compatible: true,
      description: 'Health food and organic products'
    }
  }
  
  // Default to unknown/neutral - be more conservative
  return {
    category: 'unknown',
    risk_level: 5, // Increased risk for unknown
    risk_category: 'UNKNOWN',
    enterprise_compatible: 'limited',
    government_compatible: 'limited',
    description: 'Unclassified industry - requires review'
  }
}

// Classify buyer type
export function classifyBuyer(companyName, description = '') {
  const searchText = `${companyName} ${description}`.toLowerCase()
  
  for (const [type, details] of Object.entries(BUYER_TYPES)) {
    if (details.keywords.some(keyword => searchText.includes(keyword))) {
      return {
        type,
        ...details
      }
    }
  }
  
  // Default to standard enterprise
  return {
    type: 'STANDARD',
    conservatism_level: 5,
    compliance_requirements: 'moderate',
    vendor_screening: 'standard',
    reputation_sensitivity: 5
  }
}

// Define opposite/incompatible industry pairs
const INCOMPATIBLE_PAIRS = [
  ['oil_gas', 'green_tech'],
  ['fast_food', 'health_food'],
  ['tobacco', 'healthcare'],
  ['gambling', 'education'],
  ['adult_entertainment', 'education'],
  ['weapons', 'education'],
  ['traditional_retail', 'ecommerce'] // Competitive tension
]

function areIndustriesOpposite(industry1, industry2) {
  return INCOMPATIBLE_PAIRS.some(pair => 
    (pair.includes(industry1) && pair.includes(industry2))
  )
}

// Calculate compatibility score
export function calculateCompatibility(seller, target, sellerInfo = {}, targetInfo = {}) {
  const sellerClass = classifyIndustry(seller, sellerInfo.description)
  const buyerClass = classifyBuyer(target, targetInfo.description)
  const targetClass = classifyIndustry(target, targetInfo.description) // Also classify target as industry
  
  // Check for opposite industries
  if (areIndustriesOpposite(sellerClass.category, targetClass.category)) {
    return {
      score: 0.15, // 15% - very low compatibility
      verdict: 'INCOMPATIBLE',
      reason: `${seller} (${sellerClass.description}) and ${target} (${targetClass.description}) represent opposing industry philosophies and values, making partnership extremely challenging.`,
      details: {
        seller_industry: sellerClass.category,
        target_industry: targetClass.category,
        blocking_factors: ['Opposing industry values', 'Conflicting business models', 'Brand reputation risk']
      }
    }
  }
  
  // Immediate disqualifiers
  if (sellerClass.risk_level >= 8 && buyerClass.conservatism_level >= 7) {
    return {
      score: 0.05, // 5% - virtually impossible
      verdict: 'INCOMPATIBLE',
      reason: `${seller} (${sellerClass.description}) is fundamentally incompatible with ${target} due to industry restrictions and compliance requirements.`,
      details: {
        seller_risk: sellerClass.risk_level,
        buyer_conservatism: buyerClass.conservatism_level,
        blocking_factors: ['Industry incompatibility', 'Compliance violations', 'Reputation risk']
      }
    }
  }
  
  // Calculate base compatibility
  let compatibilityScore = 1.0
  
  // Apply risk penalties
  if (sellerClass.risk_level > 5) {
    compatibilityScore *= (10 - sellerClass.risk_level) / 10
  }
  
  // Apply conservatism penalties
  if (buyerClass.conservatism_level > 5 && sellerClass.risk_level > 3) {
    compatibilityScore *= (10 - buyerClass.conservatism_level) / 10
  }
  
  // Check specific compatibility flags
  if (buyerClass.type === 'GOVERNMENT' && !sellerClass.government_compatible) {
    compatibilityScore *= 0.1
  }
  
  if (buyerClass.type === 'FORTUNE_500' && !sellerClass.enterprise_compatible) {
    compatibilityScore *= 0.2
  }
  
  // Determine verdict
  let verdict = 'COMPATIBLE'
  let reason = 'Companies are compatible for business engagement'
  
  if (compatibilityScore < 0.3) {
    verdict = 'INCOMPATIBLE'
    reason = `Severe compatibility issues between ${seller} and ${target}`
  } else if (compatibilityScore < 0.6) {
    verdict = 'CHALLENGING'
    reason = `Significant barriers exist but partnership is possible with effort`
  } else if (compatibilityScore < 0.8) {
    verdict = 'MODERATE'
    reason = `Some compatibility challenges but generally viable`
  }
  
  return {
    score: compatibilityScore,
    verdict,
    reason,
    details: {
      seller_classification: sellerClass,
      buyer_classification: buyerClass,
      compatibility_factors: {
        industry_match: sellerClass.risk_level <= 3,
        compliance_match: buyerClass.compliance_requirements !== 'maximum' || sellerClass.risk_level <= 2,
        reputation_safe: buyerClass.reputation_sensitivity < 8 || sellerClass.risk_level <= 3
      }
    }
  }
}

// Validate and adjust scores based on compatibility
export function validateScores(scores, compatibility) {
  if (compatibility.score < 0.3) {
    // Force low scores for incompatible partnerships
    return {
      overall: Math.min(scores.overall, 20),
      dimensions: scores.dimensions?.map(dim => ({
        ...dim,
        score: Math.min(dim.score, 3),
        adjusted: true,
        adjustment_reason: 'Industry incompatibility override'
      }))
    }
  }
  
  if (compatibility.score < 0.6) {
    // Apply moderate penalty for challenging partnerships
    return {
      overall: Math.min(scores.overall, scores.overall * compatibility.score * 1.5),
      dimensions: scores.dimensions?.map(dim => ({
        ...dim,
        score: Math.min(dim.score, dim.score * compatibility.score * 1.5),
        adjusted: true,
        adjustment_reason: 'Compatibility challenges adjustment'
      }))
    }
  }
  
  // No adjustment needed for compatible partnerships
  return scores
}

// Generate warning messages
export function generateWarnings(compatibility) {
  const warnings = []
  
  if (compatibility.verdict === 'INCOMPATIBLE') {
    warnings.push({
      level: 'CRITICAL',
      message: 'This partnership is fundamentally non-viable due to industry incompatibility.',
      details: compatibility.reason
    })
  }
  
  if (compatibility.details?.seller_classification?.risk_level >= 7) {
    warnings.push({
      level: 'SEVERE',
      message: 'Seller operates in a high-risk industry category that most enterprises avoid.',
      details: `Risk level: ${compatibility.details.seller_classification.risk_level}/10`
    })
  }
  
  if (compatibility.details?.buyer_classification?.conservatism_level >= 8) {
    warnings.push({
      level: 'HIGH',
      message: 'Buyer has extremely strict vendor requirements and compliance standards.',
      details: `Conservatism level: ${compatibility.details.buyer_classification.conservatism_level}/10`
    })
  }
  
  if (!compatibility.details?.compatibility_factors?.compliance_match) {
    warnings.push({
      level: 'HIGH',
      message: 'Compliance requirements mismatch detected.',
      details: 'Buyer compliance standards exceed seller industry norms.'
    })
  }
  
  if (!compatibility.details?.compatibility_factors?.reputation_safe) {
    warnings.push({
      level: 'MEDIUM',
      message: 'Potential reputation risk for buyer.',
      details: 'Partnership could impact buyer brand perception.'
    })
  }
  
  return warnings
}