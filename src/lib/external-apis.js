// External API integrations for real company data
// These provide actual, verifiable data for B2B analysis

// Alpha Vantage - Real financial data
export async function getCompanyFinancials(symbol) {
  if (!process.env.ALPHA_VANTAGE_API_KEY) {
    return null;
  }
  
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data.Symbol) {
      return {
        source: `https://finance.yahoo.com/quote/${symbol}`,
        marketCap: data.MarketCapitalization,
        revenue: data.RevenueTTM,
        profitMargin: data.ProfitMargin,
        peRatio: data.PERatio,
        eps: data.EPS,
        dividendYield: data.DividendYield,
        beta: data.Beta,
        weekHigh52: data['52WeekHigh'],
        weekLow52: data['52WeekLow'],
        description: data.Description,
        industry: data.Industry,
        sector: data.Sector,
        employees: data.FullTimeEmployees,
        fiscalYearEnd: data.FiscalYearEnd
      };
    }
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
  }
  
  return null;
}

// NewsAPI - Recent company news
export async function getCompanyNews(companyName) {
  if (!process.env.NEWS_API_KEY) {
    return [];
  }
  
  try {
    const query = encodeURIComponent(`"${companyName}" AND (business OR technology OR partnership OR earnings)`);
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&language=en&pageSize=5&apiKey=${process.env.NEWS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.articles) {
      return data.articles.map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        relevance: 'Recent company news'
      }));
    }
  } catch (error) {
    console.error('NewsAPI error:', error);
  }
  
  return [];
}

// Financial Modeling Prep - Detailed financials
export async function getDetailedFinancials(symbol) {
  if (!process.env.FMP_API_KEY) {
    return null;
  }
  
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${process.env.FMP_API_KEY}`
    );
    const data = await response.json();
    
    if (data && data[0]) {
      const company = data[0];
      return {
        source: company.website || `https://finance.yahoo.com/quote/${symbol}`,
        price: company.price,
        marketCap: company.mktCap,
        revenue: company.revenue,
        beta: company.beta,
        avgVolume: company.volAvg,
        changes: company.changes,
        ceo: company.ceo,
        industry: company.industry,
        sector: company.sector,
        country: company.country,
        employees: company.fullTimeEmployees,
        description: company.description,
        exchange: company.exchange,
        ipoDate: company.ipoDate
      };
    }
  } catch (error) {
    console.error('FMP API error:', error);
  }
  
  return null;
}

// Google Custom Search - Find relevant company pages
export async function searchCompanyInfo(companyName, searchType = 'general') {
  if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_ENGINE_ID) {
    return [];
  }
  
  try {
    const queries = {
      general: `${companyName} company profile revenue employees`,
      technology: `${companyName} technology stack API integration`,
      financial: `${companyName} earnings revenue financial results`,
      news: `${companyName} latest news announcements partnerships`
    };
    
    const query = encodeURIComponent(queries[searchType] || queries.general);
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${query}&key=${process.env.GOOGLE_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}`
    );
    const data = await response.json();
    
    if (data.items) {
      return data.items.slice(0, 3).map(item => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        source: new URL(item.link).hostname
      }));
    }
  } catch (error) {
    console.error('Google Search API error:', error);
  }
  
  return [];
}

// Clearbit - Company enrichment (if available)
export async function getCompanyEnrichment(domain) {
  if (!process.env.CLEARBIT_API_KEY) {
    return null;
  }
  
  try {
    const response = await fetch(
      `https://company.clearbit.com/v2/companies/find?domain=${domain}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLEARBIT_API_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      return {
        name: data.name,
        legalName: data.legalName,
        domain: data.domain,
        industry: data.industry,
        employees: data.metrics?.employees,
        employeesRange: data.metrics?.employeesRange,
        estimatedRevenue: data.metrics?.estimatedAnnualRevenue,
        fiscalYearEnd: data.fiscalYearEnd,
        foundedYear: data.foundedYear,
        description: data.description,
        techStack: data.tech,
        tags: data.tags,
        location: data.location
      };
    }
  } catch (error) {
    console.error('Clearbit API error:', error);
  }
  
  return null;
}

// Helper to get ticker symbol
export function getTickerSymbol(companyName) {
  const tickers = {
    'apple': 'AAPL',
    'microsoft': 'MSFT',
    'google': 'GOOGL',
    'alphabet': 'GOOGL',
    'amazon': 'AMZN',
    'meta': 'META',
    'facebook': 'META',
    'salesforce': 'CRM',
    'oracle': 'ORCL',
    'ibm': 'IBM',
    'cisco': 'CSCO',
    'intel': 'INTC',
    'adobe': 'ADBE',
    'netflix': 'NFLX',
    'tesla': 'TSLA',
    'nvidia': 'NVDA',
    'paypal': 'PYPL',
    'zoom': 'ZM',
    'shopify': 'SHOP',
    'spotify': 'SPOT',
    'uber': 'UBER',
    'airbnb': 'ABNB',
    'walmart': 'WMT',
    'jpmorgan': 'JPM',
    'berkshire': 'BRK-B',
    'visa': 'V',
    'mastercard': 'MA',
    'disney': 'DIS',
    'netflix': 'NFLX',
    'boeing': 'BA',
    'nike': 'NKE',
    'starbucks': 'SBUX',
    'mcdonalds': 'MCD',
    'cocacola': 'KO',
    'pepsi': 'PEP'
  };
  
  const clean = companyName.toLowerCase().replace(/[^a-z]/g, '');
  return tickers[clean] || null;
}

// Helper to get company domain
export function getCompanyDomain(companyName) {
  const domains = {
    'apple': 'apple.com',
    'microsoft': 'microsoft.com',
    'google': 'google.com',
    'amazon': 'amazon.com',
    'meta': 'meta.com',
    'salesforce': 'salesforce.com',
    'oracle': 'oracle.com',
    'ibm': 'ibm.com',
    'cisco': 'cisco.com',
    'adobe': 'adobe.com'
  };
  
  const clean = companyName.toLowerCase().replace(/[^a-z]/g, '');
  return domains[clean] || `${clean}.com`;
}

// Master function to gather all available data
export async function gatherAllCompanyData(companyName) {
  const ticker = getTickerSymbol(companyName);
  const domain = getCompanyDomain(companyName);
  
  const results = {
    company: companyName,
    ticker,
    domain,
    financials: null,
    news: [],
    enrichment: null,
    searchResults: [],
    sources: []
  };
  
  // Fetch all data in parallel
  const [financials, news, enrichment, searchResults] = await Promise.all([
    ticker ? getCompanyFinancials(ticker) : null,
    getCompanyNews(companyName),
    domain ? getCompanyEnrichment(domain) : null,
    searchCompanyInfo(companyName)
  ]);
  
  results.financials = financials;
  results.news = news;
  results.enrichment = enrichment;
  results.searchResults = searchResults;
  
  // Compile sources
  if (financials?.source) {
    results.sources.push({
      url: financials.source,
      type: 'financial',
      title: `${companyName} Financial Data`
    });
  }
  
  news.forEach(article => {
    if (article.url) {
      results.sources.push({
        url: article.url,
        type: 'news',
        title: article.title
      });
    }
  });
  
  searchResults.forEach(result => {
    if (result.url) {
      results.sources.push({
        url: result.url,
        type: 'research',
        title: result.title
      });
    }
  });
  
  return results;
}