import { NextResponse } from 'next/server'

// Cache for validated companies (expires after 1 hour)
const validationCache = new Map()

export async function POST(request) {
  try {
    const { query } = await request.json()
    
    if (!query || query.length < 2) {
      return NextResponse.json({ found: false, company: null })
    }

    const searchTerm = query.trim()
    
    // Check cache first
    const cacheKey = `validate-${searchTerm.toLowerCase()}`
    if (validationCache.has(cacheKey)) {
      const cached = validationCache.get(cacheKey)
      if (cached.timestamp > Date.now() - 3600000) { // 1 hour
        return NextResponse.json(cached.data)
      }
    }

    // Try to find the company using Yahoo Finance search
    try {
      // First, search for the ticker symbol using Yahoo's search
      const searchUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(searchTerm)}&quotesCount=1&newsCount=0`
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      })

      if (!searchResponse.ok) {
        throw new Error('Yahoo search failed')
      }

      const searchData = await searchResponse.json()
      
      if (!searchData.quotes || searchData.quotes.length === 0) {
        // No exact match found
        return NextResponse.json({ 
          found: false, 
          company: null,
          message: 'Company not found in stock market database'
        })
      }

      // Get the first (best) match
      const match = searchData.quotes[0]
      const symbol = match.symbol

      // Now get detailed quote data
      const quoteUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
      
      const quoteResponse = await fetch(quoteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      })

      let companyData = {
        symbol: symbol,
        name: match.longname || match.shortname || searchTerm,
        exchange: match.exchange,
        quoteType: match.quoteType,
        industry: match.industry || 'N/A',
        sector: match.sector || 'N/A'
      }

      if (quoteResponse.ok) {
        const quoteData = await quoteResponse.json()
        const result = quoteData.chart?.result?.[0]
        const meta = result?.meta

        if (meta) {
          // Add real-time market data
          companyData = {
            ...companyData,
            name: meta.longName || meta.shortName || companyData.name,
            currentPrice: meta.regularMarketPrice ? `$${meta.regularMarketPrice.toFixed(2)}` : 'N/A',
            dayChange: meta.regularMarketPrice && meta.previousClose 
              ? `${((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2)}%`
              : 'N/A',
            marketCap: formatMarketCap(meta.marketCap),
            fiftyTwoWeekRange: meta.fiftyTwoWeekLow && meta.fiftyTwoWeekHigh
              ? `$${meta.fiftyTwoWeekLow.toFixed(2)} - $${meta.fiftyTwoWeekHigh.toFixed(2)}`
              : 'N/A',
            volume: meta.regularMarketVolume ? formatNumber(meta.regularMarketVolume) : 'N/A',
            avgVolume: meta.averageDailyVolume3Month ? formatNumber(meta.averageDailyVolume3Month) : 'N/A',
            peRatio: meta.trailingPE ? meta.trailingPE.toFixed(2) : 'N/A',
            dividendYield: meta.dividendYield ? `${(meta.dividendYield * 100).toFixed(2)}%` : 'N/A'
          }
        }
      }

      // Try to get additional company info from Yahoo Finance profile
      try {
        const profileUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=assetProfile,financialData`
        const profileResponse = await fetch(profileUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(3000)
        })

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          const profile = profileData.quoteSummary?.result?.[0]
          
          if (profile?.assetProfile) {
            companyData.sector = profile.assetProfile.sector || companyData.sector
            companyData.industry = profile.assetProfile.industry || companyData.industry
            companyData.employees = profile.assetProfile.fullTimeEmployees || 'N/A'
            companyData.description = profile.assetProfile.longBusinessSummary 
              ? profile.assetProfile.longBusinessSummary.substring(0, 150) + '...'
              : `${companyData.sector} company`
          }

          if (profile?.financialData) {
            companyData.revenue = profile.financialData.totalRevenue 
              ? formatMarketCap(profile.financialData.totalRevenue.raw)
              : 'N/A'
            companyData.profitMargin = profile.financialData.profitMargins
              ? `${(profile.financialData.profitMargins.raw * 100).toFixed(1)}%`
              : 'N/A'
          }
        }
      } catch (profileError) {
        console.log('Profile fetch failed, using basic data')
      }

      // Cache the successful result
      const result = { found: true, company: companyData }
      validationCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })

      // Clean old cache entries
      if (validationCache.size > 100) {
        const oldestKey = validationCache.keys().next().value
        validationCache.delete(oldestKey)
      }

      return NextResponse.json(result)

    } catch (error) {
      console.log('Yahoo Finance validation failed:', error.message)
      
      // Return not found but allow user to continue
      return NextResponse.json({ 
        found: false, 
        company: null,
        message: 'Unable to validate company. You can still proceed.',
        allowContinue: true
      })
    }

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json({ 
      found: false, 
      company: null,
      message: 'Validation service error',
      allowContinue: true
    })
  }
}

// Helper function to format market cap
function formatMarketCap(value) {
  if (!value) return 'N/A'
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (num >= 1e12) {
    return `$${(num / 1e12).toFixed(1)}T`
  } else if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(1)}B`
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(1)}M`
  } else {
    return `$${(num / 1e3).toFixed(1)}K`
  }
}

// Helper function to format numbers
function formatNumber(value) {
  if (!value) return 'N/A'
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}