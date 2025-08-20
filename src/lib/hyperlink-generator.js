// Intelligent hyperlink generation and validation system

// Authoritative sources by category
export const AUTHORITATIVE_SOURCES = {
  market_research: [
    {
      name: 'Gartner',
      base_url: 'https://www.gartner.com',
      paths: {
        general: '/en/insights',
        it_spending: '/en/information-technology/trends/it-spending',
        vendor_management: '/en/procurement-operations/trends/vendor-management',
        digital_transformation: '/en/information-technology/insights/digital-transformation',
        market_guide: '/en/research/markets'
      }
    },
    {
      name: 'Forrester',
      base_url: 'https://www.forrester.com',
      paths: {
        general: '/research',
        b2b_buying: '/reports/b2b-buying-study',
        technology_adoption: '/reports/technology-adoption',
        wave_reports: '/reports?type=wave',
        predictions: '/predictions'
      }
    },
    {
      name: 'IDC',
      base_url: 'https://www.idc.com',
      paths: {
        general: '/research',
        it_spending: '/research/it-spending-guide',
        industry_analysis: '/research/industry',
        technology_trends: '/research/technology-trends',
        market_forecast: '/research/forecasts'
      }
    },
    {
      name: 'McKinsey',
      base_url: 'https://www.mckinsey.com',
      paths: {
        general: '/featured-insights',
        b2b_sales: '/capabilities/growth-marketing-and-sales/our-insights',
        digital_strategy: '/capabilities/mckinsey-digital/our-insights',
        operations: '/capabilities/operations/our-insights',
        procurement: '/capabilities/operations/our-insights/procurement'
      }
    }
  ],
  
  technology: [
    {
      name: 'TechCrunch',
      base_url: 'https://techcrunch.com',
      paths: {
        enterprise: '/category/enterprise',
        startups: '/category/startups',
        funding: '/category/funding',
        ai: '/category/artificial-intelligence'
      }
    },
    {
      name: 'Wired',
      base_url: 'https://www.wired.com',
      paths: {
        business: '/category/business',
        enterprise: '/tag/enterprise',
        security: '/category/security'
      }
    },
    {
      name: 'ZDNet',
      base_url: 'https://www.zdnet.com',
      paths: {
        enterprise: '/topic/enterprise-software',
        cloud: '/topic/cloud',
        security: '/topic/security'
      }
    }
  ],
  
  business: [
    {
      name: 'Harvard Business Review',
      base_url: 'https://hbr.org',
      paths: {
        sales: '/topic/sales',
        strategy: '/topic/strategy',
        leadership: '/topic/leadership',
        operations: '/topic/operations',
        technology: '/topic/technology'
      }
    },
    {
      name: 'MIT Sloan Review',
      base_url: 'https://sloanreview.mit.edu',
      paths: {
        general: '/topic/strategy',
        digital: '/topic/digital-business',
        data: '/topic/data-and-analytics',
        innovation: '/topic/innovation'
      }
    },
    {
      name: 'Bloomberg',
      base_url: 'https://www.bloomberg.com',
      paths: {
        technology: '/technology',
        markets: '/markets',
        companies: '/quote/company',
        opinion: '/opinion'
      }
    }
  ],
  
  industry_specific: {
    finance: [
      {
        name: 'Financial Times',
        base_url: 'https://www.ft.com',
        paths: { companies: '/companies', technology: '/technology' }
      },
      {
        name: 'Wall Street Journal',
        base_url: 'https://www.wsj.com',
        paths: { business: '/news/business', tech: '/news/technology' }
      }
    ],
    healthcare: [
      {
        name: 'Healthcare IT News',
        base_url: 'https://www.healthcareitnews.com',
        paths: { general: '/' }
      },
      {
        name: 'Modern Healthcare',
        base_url: 'https://www.modernhealthcare.com',
        paths: { technology: '/technology' }
      }
    ],
    retail: [
      {
        name: 'Retail Dive',
        base_url: 'https://www.retaildive.com',
        paths: { trends: '/news' }
      },
      {
        name: 'NRF',
        base_url: 'https://nrf.com',
        paths: { research: '/research' }
      }
    ]
  },
  
  compliance_governance: [
    {
      name: 'ISACA',
      base_url: 'https://www.isaca.org',
      paths: {
        governance: '/resources/it-governance',
        risk: '/resources/risk-management',
        compliance: '/resources/compliance'
      }
    },
    {
      name: 'Deloitte Insights',
      base_url: 'https://www2.deloitte.com',
      paths: {
        risk: '/us/en/pages/risk/topics/risk-management.html',
        governance: '/us/en/pages/risk/topics/governance.html',
        compliance: '/us/en/pages/regulatory/topics/regulatory-compliance.html'
      }
    },
    {
      name: 'PwC',
      base_url: 'https://www.pwc.com',
      paths: {
        risk: '/gx/en/services/risk-assurance.html',
        governance: '/gx/en/services/governance.html'
      }
    }
  ],
  
  statistics: [
    {
      name: 'Statista',
      base_url: 'https://www.statista.com',
      paths: {
        technology: '/markets/418/technology',
        business: '/markets/408/e-commerce',
        software: '/markets/418/topic/1140/software'
      }
    },
    {
      name: 'Pew Research',
      base_url: 'https://www.pewresearch.org',
      paths: {
        technology: '/topic/internet-technology',
        business: '/topic/economy-work'
      }
    }
  ]
}

// Generate relevant hyperlinks based on context
export function generateHyperlinks(context) {
  const links = []
  const { dimension, industry, topic, companies } = context
  
  // Select sources based on dimension
  switch(dimension) {
    case 'Market Alignment':
      links.push(
        selectLink(AUTHORITATIVE_SOURCES.market_research[0], 'market_guide'),
        selectLink(AUTHORITATIVE_SOURCES.market_research[1], 'predictions'),
        selectLink(AUTHORITATIVE_SOURCES.business[0], 'strategy')
      )
      break
      
    case 'Budget Readiness':
      links.push(
        selectLink(AUTHORITATIVE_SOURCES.market_research[0], 'it_spending'),
        selectLink(AUTHORITATIVE_SOURCES.market_research[2], 'it_spending'),
        selectLink(AUTHORITATIVE_SOURCES.business[2], 'markets')
      )
      break
      
    case 'Technology Fit':
      links.push(
        selectLink(AUTHORITATIVE_SOURCES.market_research[1], 'technology_adoption'),
        selectLink(AUTHORITATIVE_SOURCES.technology[0], 'enterprise'),
        selectLink(AUTHORITATIVE_SOURCES.market_research[0], 'digital_transformation')
      )
      break
      
    case 'Competitive Position':
      links.push(
        selectLink(AUTHORITATIVE_SOURCES.market_research[1], 'wave_reports'),
        selectLink(AUTHORITATIVE_SOURCES.market_research[3], 'b2b_sales'),
        selectLink(AUTHORITATIVE_SOURCES.business[0], 'sales')
      )
      break
      
    case 'Implementation Readiness':
      links.push(
        selectLink(AUTHORITATIVE_SOURCES.compliance_governance[0], 'governance'),
        selectLink(AUTHORITATIVE_SOURCES.market_research[3], 'operations'),
        selectLink(AUTHORITATIVE_SOURCES.business[1], 'digital')
      )
      break
      
    default:
      // General business links
      links.push(
        selectLink(AUTHORITATIVE_SOURCES.market_research[0], 'general'),
        selectLink(AUTHORITATIVE_SOURCES.business[0], 'strategy')
      )
  }
  
  // Add industry-specific links if applicable
  if (industry) {
    const industryLinks = getIndustryLinks(industry)
    links.push(...industryLinks)
  }
  
  // Add company-specific links if provided
  if (companies?.target) {
    links.push(generateCompanyLink(companies.target))
  }
  
  return links.filter(link => link !== null)
}

// Select a specific link from a source
function selectLink(source, pathKey) {
  if (!source || !source.paths[pathKey]) return null
  
  return {
    title: `${source.name} - ${formatTitle(pathKey)}`,
    url: `${source.base_url}${source.paths[pathKey]}`,
    relevance: getRelevanceDescription(pathKey),
    source: source.name
  }
}

// Get industry-specific links
function getIndustryLinks(industry) {
  const links = []
  const industryLower = industry.toLowerCase()
  
  if (industryLower.includes('finance') || industryLower.includes('bank')) {
    const financeSource = AUTHORITATIVE_SOURCES.industry_specific.finance[0]
    links.push({
      title: 'Financial Times - Technology in Finance',
      url: `${financeSource.base_url}${financeSource.paths.technology}`,
      relevance: 'Financial industry technology trends',
      source: 'Financial Times'
    })
  }
  
  if (industryLower.includes('health') || industryLower.includes('medical')) {
    const healthSource = AUTHORITATIVE_SOURCES.industry_specific.healthcare[0]
    links.push({
      title: 'Healthcare IT News',
      url: healthSource.base_url,
      relevance: 'Healthcare technology and IT insights',
      source: 'Healthcare IT News'
    })
  }
  
  if (industryLower.includes('retail') || industryLower.includes('commerce')) {
    const retailSource = AUTHORITATIVE_SOURCES.industry_specific.retail[0]
    links.push({
      title: 'Retail Dive - Industry Trends',
      url: `${retailSource.base_url}${retailSource.paths.trends}`,
      relevance: 'Retail industry trends and analysis',
      source: 'Retail Dive'
    })
  }
  
  return links
}

// Generate company-specific research link
function generateCompanyLink(companyName) {
  // Clean company name for URL
  const cleanName = companyName.replace(/[^\w\s]/g, '').replace(/\s+/g, '-').toLowerCase()
  
  return {
    title: `Company Research - ${companyName}`,
    url: `https://www.crunchbase.com/organization/${cleanName}`,
    relevance: `${companyName} company profile and funding data`,
    source: 'Crunchbase'
  }
}

// Format path key to readable title
function formatTitle(pathKey) {
  return pathKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Get relevance description based on path key
function getRelevanceDescription(pathKey) {
  const descriptions = {
    general: 'General industry insights and trends',
    it_spending: 'IT budget allocation and spending patterns',
    vendor_management: 'Vendor selection and management best practices',
    digital_transformation: 'Digital transformation strategies and frameworks',
    market_guide: 'Market analysis and competitive landscape',
    b2b_buying: 'B2B purchasing behavior and decision processes',
    technology_adoption: 'Technology adoption rates and patterns',
    wave_reports: 'Vendor comparison and capability analysis',
    predictions: 'Industry predictions and future trends',
    b2b_sales: 'B2B sales strategies and best practices',
    digital_strategy: 'Digital business strategy insights',
    operations: 'Operational excellence and efficiency',
    procurement: 'Procurement best practices and strategies',
    sales: 'Sales methodologies and techniques',
    strategy: 'Business strategy and planning',
    governance: 'IT governance and compliance frameworks',
    risk: 'Risk management and mitigation strategies',
    compliance: 'Regulatory compliance and standards'
  }
  
  return descriptions[pathKey] || 'Industry insights and analysis'
}

// Validate that a URL is likely to work
export function validateUrl(url) {
  try {
    const urlObj = new URL(url)
    
    // Check if it's a known good domain
    const knownDomains = [
      'gartner.com', 'forrester.com', 'idc.com', 'mckinsey.com',
      'hbr.org', 'bloomberg.com', 'deloitte.com', 'pwc.com',
      'isaca.org', 'mit.edu', 'wired.com', 'techcrunch.com',
      'wsj.com', 'ft.com', 'crunchbase.com', 'statista.com'
    ]
    
    const domain = urlObj.hostname.replace('www.', '').replace('www2.', '')
    const isKnownDomain = knownDomains.some(known => domain.includes(known))
    
    return {
      valid: true,
      trusted: isKnownDomain,
      domain: domain,
      protocol: urlObj.protocol
    }
  } catch (error) {
    return {
      valid: false,
      trusted: false,
      error: error.message
    }
  }
}

// Generate citation text for a hyperlink
export function generateCitation(link, year = new Date().getFullYear()) {
  return `${link.source} (${year}). ${link.title}. Retrieved from ${link.url}`
}

// Get contextual links for each analysis dimension
export function getDimensionLinks(dimensionName, sellerIndustry, targetIndustry) {
  const context = {
    dimension: dimensionName,
    industry: targetIndustry || sellerIndustry,
    topic: dimensionName.toLowerCase().replace(' ', '_')
  }
  
  const links = generateHyperlinks(context)
  
  // Ensure we have at least 2 relevant links
  if (links.length < 2) {
    // Add fallback general links
    links.push(
      selectLink(AUTHORITATIVE_SOURCES.market_research[0], 'general'),
      selectLink(AUTHORITATIVE_SOURCES.business[0], 'strategy')
    )
  }
  
  // Validate all links
  return links.filter(link => link && validateUrl(link.url).valid)
}