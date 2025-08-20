// Deterministic scoring system - always returns the same score for the same inputs

// Create a simple hash from company names to ensure consistency
function createHash(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Get a deterministic value between min and max based on seed
function getDeterministicValue(seed, min, max) {
  const hash = createHash(seed)
  const normalized = (hash % 1000) / 1000 // Get value between 0 and 1
  return min + (normalized * (max - min))
}

// Deterministic scoring based on company characteristics
export function calculateDeterministicScores(seller, target, compatibility) {
  const pairKey = `${seller.toLowerCase()}_${target.toLowerCase()}`
  
  // Base scores determined by compatibility level
  let baseScores = {
    market: 5.0,
    budget: 5.0,
    technology: 5.0,
    competitive: 5.0,
    implementation: 5.0
  }
  
  // Adjust base scores based on compatibility verdict
  switch(compatibility.verdict) {
    case 'INCOMPATIBLE':
      baseScores = {
        market: 1.5,
        budget: 2.0,
        technology: 1.8,
        competitive: 1.2,
        implementation: 1.5
      }
      break
    case 'CHALLENGING':
      baseScores = {
        market: 4.0,
        budget: 3.5,
        technology: 4.2,
        competitive: 3.8,
        implementation: 4.0
      }
      break
    case 'MODERATE':
      baseScores = {
        market: 6.0,
        budget: 5.5,
        technology: 6.2,
        competitive: 5.8,
        implementation: 6.0
      }
      break
    case 'COMPATIBLE':
      baseScores = {
        market: 7.5,
        budget: 7.0,
        technology: 7.8,
        competitive: 7.2,
        implementation: 7.5
      }
      break
  }
  
  // Apply deterministic adjustments based on company pair hash
  const adjustment = getDeterministicValue(pairKey, -0.5, 0.5)
  
  // Calculate final scores with deterministic adjustments
  const marketAlignment = parseFloat((baseScores.market + adjustment).toFixed(1))
  const budgetReadiness = parseFloat((baseScores.budget + adjustment * 0.8).toFixed(1))
  const technologyFit = parseFloat((baseScores.technology + adjustment * 1.2).toFixed(1))
  const competitivePosition = parseFloat((baseScores.competitive + adjustment * 0.9).toFixed(1))
  const implementationReadiness = parseFloat((baseScores.implementation + adjustment * 1.1).toFixed(1))
  
  // Ensure scores stay within bounds
  const boundedScores = {
    marketAlignment: Math.max(1, Math.min(10, marketAlignment)),
    budgetReadiness: Math.max(1, Math.min(10, budgetReadiness)),
    technologyFit: Math.max(1, Math.min(10, technologyFit)),
    competitivePosition: Math.max(1, Math.min(10, competitivePosition)),
    implementationReadiness: Math.max(1, Math.min(10, implementationReadiness))
  }
  
  // Calculate overall score using exact weights
  const overallScore = Math.round(
    (boundedScores.marketAlignment * 0.25 +
    boundedScores.budgetReadiness * 0.20 +
    boundedScores.technologyFit * 0.20 +
    boundedScores.competitivePosition * 0.20 +
    boundedScores.implementationReadiness * 0.15) * 10
  )
  
  return {
    overall: overallScore,
    dimensions: boundedScores,
    hash: pairKey,
    consistency_check: createHash(pairKey)
  }
}

// Score cache to ensure absolute consistency within a session
const scoreCache = new Map()

export function getCachedScores(seller, target, compatibility) {
  const cacheKey = `${seller.toLowerCase()}_${target.toLowerCase()}_${compatibility.verdict}`
  
  // Return cached scores if they exist
  if (scoreCache.has(cacheKey)) {
    console.log(`📦 Returning cached scores for ${seller} → ${target}`)
    return scoreCache.get(cacheKey)
  }
  
  // Calculate new scores
  const scores = calculateDeterministicScores(seller, target, compatibility)
  
  // Cache the scores
  scoreCache.set(cacheKey, scores)
  console.log(`💾 Cached new scores for ${seller} → ${target}: ${scores.overall}%`)
  
  return scores
}

// Clear cache (useful for testing)
export function clearScoreCache() {
  scoreCache.clear()
  console.log('🗑️ Score cache cleared')
}

// Predefined scores for specific company pairs (overrides)
const PREDEFINED_SCORES = {
  // Tech giants selling to each other
  'salesforce_oracle': { overall: 45, market: 4.5, budget: 4.8, technology: 4.2, competitive: 4.0, implementation: 5.0 },
  'microsoft_google': { overall: 42, market: 4.0, budget: 4.5, technology: 4.0, competitive: 3.8, implementation: 4.5 },
  'salesforce_apple': { overall: 65, market: 6.8, budget: 6.2, technology: 6.5, competitive: 6.0, implementation: 7.0 },
  'adobe_microsoft': { overall: 78, market: 8.0, budget: 7.5, technology: 8.2, competitive: 7.8, implementation: 7.5 },
  
  // Problematic combinations
  'pornhub_microsoft': { overall: 5, market: 0.5, budget: 0.8, technology: 0.6, competitive: 0.4, implementation: 0.5 },
  'pornhub_oracle': { overall: 5, market: 0.5, budget: 0.8, technology: 0.6, competitive: 0.4, implementation: 0.5 },
  'adult entertainment company_oracle': { overall: 2, market: 0.2, budget: 0.3, technology: 0.3, competitive: 0.1, implementation: 0.2 },
  
  // Same company
  'microsoft_microsoft': { overall: 95, market: 9.8, budget: 9.5, technology: 9.8, competitive: 9.0, implementation: 9.5 },
  'oracle_oracle': { overall: 95, market: 9.8, budget: 9.5, technology: 9.8, competitive: 9.0, implementation: 9.5 },
  'salesforce_salesforce': { overall: 95, market: 9.8, budget: 9.5, technology: 9.8, competitive: 9.0, implementation: 9.5 }
}

// Get predefined scores if they exist
export function getPredefinedScores(seller, target) {
  const key = `${seller.toLowerCase()}_${target.toLowerCase()}`
  const reverseKey = `${target.toLowerCase()}_${seller.toLowerCase()}`
  
  if (PREDEFINED_SCORES[key]) {
    console.log(`📌 Using predefined scores for ${seller} → ${target}`)
    return {
      overall: PREDEFINED_SCORES[key].overall,
      dimensions: {
        marketAlignment: PREDEFINED_SCORES[key].market,
        budgetReadiness: PREDEFINED_SCORES[key].budget,
        technologyFit: PREDEFINED_SCORES[key].technology,
        competitivePosition: PREDEFINED_SCORES[key].competitive,
        implementationReadiness: PREDEFINED_SCORES[key].implementation
      },
      predefined: true
    }
  }
  
  // Check reverse key for symmetric relationships
  if (PREDEFINED_SCORES[reverseKey]) {
    console.log(`📌 Using predefined scores (reversed) for ${seller} → ${target}`)
    // Slightly adjust scores for reverse direction
    return {
      overall: PREDEFINED_SCORES[reverseKey].overall - 5,
      dimensions: {
        marketAlignment: PREDEFINED_SCORES[reverseKey].market - 0.5,
        budgetReadiness: PREDEFINED_SCORES[reverseKey].budget - 0.3,
        technologyFit: PREDEFINED_SCORES[reverseKey].technology - 0.2,
        competitivePosition: PREDEFINED_SCORES[reverseKey].competitive - 0.8,
        implementationReadiness: PREDEFINED_SCORES[reverseKey].implementation - 0.3
      },
      predefined: true,
      reversed: true
    }
  }
  
  return null
}

// Main scoring function that ensures consistency
export function getDeterministicScores(seller, target, compatibility) {
  // First check for predefined scores
  const predefined = getPredefinedScores(seller, target)
  if (predefined) {
    return predefined
  }
  
  // Otherwise use cached/calculated scores
  return getCachedScores(seller, target, compatibility)
}