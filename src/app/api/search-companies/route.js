import { NextResponse } from 'next/server'

// Cache for company searches (expires after 30 minutes)
const searchCache = new Map()

// Popular companies with pre-loaded data for instant results
const popularCompanies = [
  { symbol: 'AAPL', name: 'Apple Inc.', marketCap: '3.5T', revenue: '383.3B', employees: '164,000', industry: 'Technology', description: 'Consumer electronics & services' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', marketCap: '3.1T', revenue: '211.9B', employees: '221,000', industry: 'Software', description: 'Software & cloud services' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', marketCap: '2.2T', revenue: '307.4B', employees: '182,000', industry: 'Internet', description: 'Search, advertising & cloud' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', marketCap: '1.9T', revenue: '574.8B', employees: '1,500,000', industry: 'E-Commerce', description: 'E-commerce & cloud computing' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', marketCap: '3.4T', revenue: '60.9B', employees: '29,600', industry: 'Semiconductors', description: 'Graphics processors & AI chips' },
  { symbol: 'META', name: 'Meta Platforms Inc.', marketCap: '1.5T', revenue: '134.9B', employees: '67,000', industry: 'Social Media', description: 'Social networking platforms' },
  { symbol: 'TSLA', name: 'Tesla Inc.', marketCap: '1.3T', revenue: '96.8B', employees: '140,000', industry: 'Automotive', description: 'Electric vehicles & energy' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', marketCap: '1.0T', revenue: '364.5B', employees: '383,000', industry: 'Conglomerate', description: 'Diversified investments' },
  { symbol: 'WMT', name: 'Walmart Inc.', marketCap: '665B', revenue: '648.1B', employees: '2,100,000', industry: 'Retail', description: 'Retail chain stores' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', marketCap: '680B', revenue: '158.1B', employees: '309,000', industry: 'Banking', description: 'Financial services & banking' },
  { symbol: 'V', name: 'Visa Inc.', marketCap: '600B', revenue: '32.7B', employees: '28,000', industry: 'Payments', description: 'Payment processing network' },
  { symbol: 'UNH', name: 'UnitedHealth Group', marketCap: '520B', revenue: '371.6B', employees: '440,000', industry: 'Healthcare', description: 'Health insurance & services' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', marketCap: '900B', revenue: '34.1B', employees: '43,000', industry: 'Pharmaceuticals', description: 'Pharmaceutical products' },
  { symbol: 'ORCL', name: 'Oracle Corporation', marketCap: '520B', revenue: '52.9B', employees: '143,000', industry: 'Software', description: 'Database & enterprise software' },
  { symbol: 'CRM', name: 'Salesforce Inc.', marketCap: '310B', revenue: '34.9B', employees: '79,000', industry: 'Software', description: 'CRM & cloud software' },
  { symbol: 'NFLX', name: 'Netflix Inc.', marketCap: '240B', revenue: '33.7B', employees: '13,000', industry: 'Entertainment', description: 'Streaming entertainment' },
  { symbol: 'DIS', name: 'The Walt Disney Company', marketCap: '200B', revenue: '88.9B', employees: '220,000', industry: 'Entertainment', description: 'Entertainment & media' },
  { symbol: 'NKE', name: 'Nike Inc.', marketCap: '120B', revenue: '51.2B', employees: '79,000', industry: 'Apparel', description: 'Athletic footwear & apparel' },
  { symbol: 'BA', name: 'Boeing Company', marketCap: '150B', revenue: '77.8B', employees: '171,000', industry: 'Aerospace', description: 'Aircraft manufacturing' },
  { symbol: 'IBM', name: 'IBM Corporation', marketCap: '215B', revenue: '61.9B', employees: '282,000', industry: 'Technology', description: 'IT services & consulting' }
]

export async function POST(request) {
  try {
    const { query } = await request.json()
    
    if (!query || query.length < 1) {
      return NextResponse.json({ suggestions: [] })
    }

    const searchTerm = query.toLowerCase().trim()
    
    // Check cache first
    const cacheKey = `search-${searchTerm}`
    if (searchCache.has(cacheKey)) {
      const cached = searchCache.get(cacheKey)
      if (cached.timestamp > Date.now() - 1800000) { // 30 minutes
        return NextResponse.json({ suggestions: cached.data })
      }
    }

    let suggestions = []

    // First, check popular companies for instant results
    const popularMatches = popularCompanies.filter(company => 
      company.name.toLowerCase().includes(searchTerm) ||
      company.symbol.toLowerCase().includes(searchTerm) ||
      company.industry.toLowerCase().includes(searchTerm)
    ).slice(0, 5)

    suggestions.push(...popularMatches)

    // If we need more results, try Alpha Vantage API
    if (suggestions.length < 5) {
      try {
        const apiKey = process.env.ALPHA_VANTAGE_KEY || 'demo'
        const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${apiKey}`
        
        const response = await fetch(searchUrl, { 
          signal: AbortSignal.timeout(3000),
          next: { revalidate: 1800 } // Cache for 30 minutes
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.bestMatches && Array.isArray(data.bestMatches)) {
            // Process Alpha Vantage results
            const apiSuggestions = data.bestMatches.slice(0, 10).map(match => {
              // Try to get additional data from our popular companies list
              const popularData = popularCompanies.find(c => c.symbol === match['1. symbol'])
              
              return {
                symbol: match['1. symbol'],
                name: match['2. name'],
                type: match['3. type'],
                region: match['4. region'],
                marketOpen: match['5. marketOpen'],
                marketClose: match['6. marketClose'],
                currency: match['8. currency'],
                matchScore: parseFloat(match['9. matchScore']),
                // Add financial data if available
                marketCap: popularData?.marketCap || 'N/A',
                revenue: popularData?.revenue || 'N/A',
                employees: popularData?.employees || 'N/A',
                industry: popularData?.industry || match['3. type'],
                description: popularData?.description || `${match['3. type']} company in ${match['4. region']}`
              }
            })

            // Merge with popular matches, avoiding duplicates
            const existingSymbols = new Set(suggestions.map(s => s.symbol))
            const newSuggestions = apiSuggestions.filter(s => !existingSymbols.has(s.symbol))
            suggestions.push(...newSuggestions)
          }
        }
      } catch (error) {
        console.log('Alpha Vantage search failed:', error.message)
      }
    }

    // Try to fetch real-time data for top results (using free Yahoo Finance alternative)
    if (suggestions.length > 0 && suggestions.length <= 3) {
      try {
        // For the top 3 results, try to get more detailed info
        const enhancedSuggestions = await Promise.all(
          suggestions.slice(0, 3).map(async (company) => {
            try {
              // Try to fetch from Yahoo Finance summary (free tier)
              const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${company.symbol}`
              const yahooResponse = await fetch(yahooUrl, { 
                signal: AbortSignal.timeout(2000),
                headers: {
                  'User-Agent': 'Mozilla/5.0'
                }
              })
              
              if (yahooResponse.ok) {
                const yahooData = await yahooResponse.json()
                const result = yahooData.chart?.result?.[0]
                const meta = result?.meta
                
                if (meta) {
                  return {
                    ...company,
                    currentPrice: meta.regularMarketPrice ? `$${meta.regularMarketPrice.toFixed(2)}` : company.currentPrice,
                    dayChange: meta.regularMarketPrice && meta.previousClose 
                      ? `${((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2)}%`
                      : 'N/A',
                    marketCap: meta.marketCap 
                      ? formatMarketCap(meta.marketCap)
                      : company.marketCap,
                    fiftyTwoWeekRange: meta.fiftyTwoWeekLow && meta.fiftyTwoWeekHigh
                      ? `$${meta.fiftyTwoWeekLow.toFixed(2)} - $${meta.fiftyTwoWeekHigh.toFixed(2)}`
                      : 'N/A'
                  }
                }
              }
            } catch (err) {
              // If Yahoo fails, return original company data
              return company
            }
            return company
          })
        )
        
        // Replace top suggestions with enhanced versions
        suggestions = [
          ...enhancedSuggestions,
          ...suggestions.slice(3)
        ]
      } catch (error) {
        console.log('Enhanced data fetch failed:', error.message)
      }
    }

    // Sort by match score if available, otherwise by popularity
    suggestions.sort((a, b) => {
      if (a.matchScore && b.matchScore) {
        return b.matchScore - a.matchScore
      }
      // Prioritize companies with more data
      const aDataPoints = [a.marketCap, a.revenue, a.employees].filter(d => d && d !== 'N/A').length
      const bDataPoints = [b.marketCap, b.revenue, b.employees].filter(d => d && d !== 'N/A').length
      return bDataPoints - aDataPoints
    })

    // Limit to top 8 results
    suggestions = suggestions.slice(0, 8)

    // Cache the results
    searchCache.set(cacheKey, {
      data: suggestions,
      timestamp: Date.now()
    })

    // Clean old cache entries
    if (searchCache.size > 100) {
      const oldestKey = searchCache.keys().next().value
      searchCache.delete(oldestKey)
    }

    return NextResponse.json({ 
      suggestions,
      query,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Company search error:', error)
    
    // Return popular companies as fallback
    return NextResponse.json({ 
      suggestions: popularCompanies.slice(0, 5),
      error: 'Search service temporarily unavailable',
      fallback: true
    })
  }
}

// Helper function to format market cap
function formatMarketCap(value) {
  if (!value) return 'N/A'
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (num >= 1e12) {
    return `${(num / 1e12).toFixed(1)}T`
  } else if (num >= 1e9) {
    return `${(num / 1e9).toFixed(1)}B`
  } else if (num >= 1e6) {
    return `${(num / 1e6).toFixed(1)}M`
  } else {
    return `${(num / 1e3).toFixed(1)}K`
  }
}