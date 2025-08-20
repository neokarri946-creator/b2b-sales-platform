// Multi-layer score validation and sanity checking system

import { calculateCompatibility } from './industry-classifier'

// Score validation rules
export const SCORE_RULES = {
  // Maximum allowed scores for different compatibility levels
  MAX_SCORES_BY_COMPATIBILITY: {
    INCOMPATIBLE: {
      overall: 20,
      dimensions: 3
    },
    CHALLENGING: {
      overall: 50,
      dimensions: 6
    },
    MODERATE: {
      overall: 75,
      dimensions: 8
    },
    COMPATIBLE: {
      overall: 100,
      dimensions: 10
    }
  },
  
  // Minimum scores to ensure realism
  MIN_SCORES: {
    overall: 5,
    dimensions: 1
  },
  
  // Score consistency rules
  CONSISTENCY: {
    // Overall score should be within 20% of weighted average
    overall_variance_allowed: 0.2,
    // No dimension should be more than 3 points from the average
    dimension_variance_allowed: 3
  }
}

// Validate and adjust a complete analysis
export function validateAnalysis(analysis, seller, target, sellerInfo, targetInfo) {
  // Step 1: Check industry compatibility
  const compatibility = calculateCompatibility(seller, target, sellerInfo, targetInfo)
  
  // Step 2: Create validation report
  const validationReport = {
    original_score: analysis.scorecard?.overall_score,
    adjusted_score: null,
    adjustments_made: [],
    warnings: [],
    compatibility: compatibility,
    confidence_level: 'HIGH'
  }
  
  // Step 3: Validate overall score against compatibility
  let adjustedAnalysis = { ...analysis }
  
  if (adjustedAnalysis.scorecard) {
    const maxAllowed = SCORE_RULES.MAX_SCORES_BY_COMPATIBILITY[compatibility.verdict]
    
    // Check if overall score exceeds maximum for compatibility level
    if (adjustedAnalysis.scorecard.overall_score > maxAllowed.overall) {
      validationReport.adjustments_made.push({
        field: 'overall_score',
        original: adjustedAnalysis.scorecard.overall_score,
        adjusted: maxAllowed.overall,
        reason: `Score exceeds maximum for ${compatibility.verdict} compatibility`
      })
      adjustedAnalysis.scorecard.overall_score = maxAllowed.overall
      validationReport.confidence_level = 'MEDIUM'
    }
    
    // Step 4: Validate dimension scores
    if (adjustedAnalysis.scorecard.dimensions) {
      adjustedAnalysis.scorecard.dimensions = adjustedAnalysis.scorecard.dimensions.map(dim => {
        if (dim.score > maxAllowed.dimensions) {
          validationReport.adjustments_made.push({
            field: `dimension_${dim.name}`,
            original: dim.score,
            adjusted: maxAllowed.dimensions,
            reason: `Dimension score exceeds maximum for ${compatibility.verdict} compatibility`
          })
          return {
            ...dim,
            score: maxAllowed.dimensions,
            validation_adjusted: true
          }
        }
        return dim
      })
    }
    
    // Step 5: Check score consistency
    const consistencyCheck = checkScoreConsistency(adjustedAnalysis.scorecard)
    if (!consistencyCheck.consistent) {
      validationReport.warnings.push({
        type: 'CONSISTENCY',
        message: consistencyCheck.message,
        details: consistencyCheck.details
      })
      validationReport.confidence_level = 'LOW'
    }
    
    // Step 6: Apply sanity checks
    const sanityCheck = performSanityChecks(adjustedAnalysis, seller, target)
    if (sanityCheck.issues.length > 0) {
      validationReport.warnings.push(...sanityCheck.issues)
      adjustedAnalysis = sanityCheck.correctedAnalysis
    }
  }
  
  // Step 7: Add compatibility warnings if needed
  if (compatibility.verdict === 'INCOMPATIBLE') {
    adjustedAnalysis.critical_warning = {
      level: 'CRITICAL',
      message: 'This partnership is fundamentally non-viable',
      details: compatibility.reason,
      recommendation: 'DO NOT PROCEED with this opportunity'
    }
  }
  
  validationReport.adjusted_score = adjustedAnalysis.scorecard?.overall_score
  adjustedAnalysis.validation_report = validationReport
  
  return adjustedAnalysis
}

// Check if scores are internally consistent
function checkScoreConsistency(scorecard) {
  if (!scorecard || !scorecard.dimensions) {
    return { consistent: false, message: 'Missing scorecard data' }
  }
  
  // Calculate weighted average
  let weightedSum = 0
  let totalWeight = 0
  
  scorecard.dimensions.forEach(dim => {
    const weight = dim.weight || 0.2
    weightedSum += dim.score * weight
    totalWeight += weight
  })
  
  const calculatedOverall = (weightedSum / totalWeight) * 10
  const actualOverall = scorecard.overall_score
  
  // Check if overall score matches weighted average (within tolerance)
  const variance = Math.abs(calculatedOverall - actualOverall) / actualOverall
  
  if (variance > SCORE_RULES.CONSISTENCY.overall_variance_allowed) {
    return {
      consistent: false,
      message: `Overall score (${actualOverall}) doesn't match weighted average (${calculatedOverall.toFixed(1)})`,
      details: {
        calculated: calculatedOverall,
        actual: actualOverall,
        variance: (variance * 100).toFixed(1) + '%'
      }
    }
  }
  
  // Check if dimension scores are reasonably distributed
  const avgDimensionScore = scorecard.dimensions.reduce((sum, dim) => sum + dim.score, 0) / scorecard.dimensions.length
  const maxVariance = Math.max(...scorecard.dimensions.map(dim => Math.abs(dim.score - avgDimensionScore)))
  
  if (maxVariance > SCORE_RULES.CONSISTENCY.dimension_variance_allowed) {
    return {
      consistent: false,
      message: 'Dimension scores have unrealistic variance',
      details: {
        average: avgDimensionScore.toFixed(1),
        max_variance: maxVariance.toFixed(1)
      }
    }
  }
  
  return { consistent: true }
}

// Perform sanity checks on the analysis
function performSanityChecks(analysis, seller, target) {
  const issues = []
  let correctedAnalysis = { ...analysis }
  
  // Check 1: Porn/adult companies should never score high with enterprises
  const problematicKeywords = ['porn', 'adult', 'xxx', 'escort', 'cannabis', 'weed']
  const enterpriseKeywords = ['oracle', 'microsoft', 'ibm', 'government', 'federal']
  
  const sellerLower = seller.toLowerCase()
  const targetLower = target.toLowerCase()
  
  const isProblematicSeller = problematicKeywords.some(keyword => sellerLower.includes(keyword))
  const isEnterpriseBuyer = enterpriseKeywords.some(keyword => targetLower.includes(keyword))
  
  if (isProblematicSeller && isEnterpriseBuyer) {
    if (correctedAnalysis.scorecard?.overall_score > 20) {
      issues.push({
        type: 'SANITY_CHECK',
        message: `${seller} cannot have high scores with ${target}`,
        severity: 'CRITICAL'
      })
      
      // Force low scores
      if (correctedAnalysis.scorecard) {
        correctedAnalysis.scorecard.overall_score = 10
        if (correctedAnalysis.scorecard.dimensions) {
          correctedAnalysis.scorecard.dimensions = correctedAnalysis.scorecard.dimensions.map(dim => ({
            ...dim,
            score: Math.min(dim.score, 2),
            sanity_override: true
          }))
        }
      }
    }
  }
  
  // Check 2: Same company selling to itself should score very high
  if (seller.toLowerCase() === target.toLowerCase()) {
    if (correctedAnalysis.scorecard?.overall_score < 80) {
      issues.push({
        type: 'SANITY_CHECK',
        message: 'Same company partnerships should score very high',
        severity: 'MEDIUM'
      })
      
      if (correctedAnalysis.scorecard) {
        correctedAnalysis.scorecard.overall_score = 95
        if (correctedAnalysis.scorecard.dimensions) {
          correctedAnalysis.scorecard.dimensions = correctedAnalysis.scorecard.dimensions.map(dim => ({
            ...dim,
            score: Math.max(dim.score, 9),
            sanity_override: true
          }))
        }
      }
    }
  }
  
  // Check 3: Direct competitors should have lower scores
  const competitorPairs = [
    ['microsoft', 'google'],
    ['oracle', 'salesforce'],
    ['amazon', 'microsoft'],
    ['uber', 'lyft']
  ]
  
  const isCompetitor = competitorPairs.some(pair => 
    (sellerLower.includes(pair[0]) && targetLower.includes(pair[1])) ||
    (sellerLower.includes(pair[1]) && targetLower.includes(pair[0]))
  )
  
  if (isCompetitor && correctedAnalysis.scorecard?.overall_score > 60) {
    issues.push({
      type: 'SANITY_CHECK',
      message: 'Direct competitors typically have lower partnership scores',
      severity: 'MEDIUM'
    })
    
    if (correctedAnalysis.scorecard) {
      correctedAnalysis.scorecard.overall_score = Math.min(correctedAnalysis.scorecard.overall_score, 45)
    }
  }
  
  return {
    issues,
    correctedAnalysis
  }
}

// Calculate confidence level for the analysis
export function calculateConfidence(analysis, validationReport) {
  let confidenceScore = 100
  
  // Reduce confidence based on adjustments
  if (validationReport.adjustments_made.length > 0) {
    confidenceScore -= validationReport.adjustments_made.length * 10
  }
  
  // Reduce confidence based on warnings
  if (validationReport.warnings.length > 0) {
    confidenceScore -= validationReport.warnings.length * 5
  }
  
  // Reduce confidence for incompatible partnerships
  if (validationReport.compatibility.verdict === 'INCOMPATIBLE') {
    confidenceScore -= 30
  } else if (validationReport.compatibility.verdict === 'CHALLENGING') {
    confidenceScore -= 15
  }
  
  // Ensure confidence stays within bounds
  confidenceScore = Math.max(10, Math.min(100, confidenceScore))
  
  return {
    score: confidenceScore,
    level: confidenceScore >= 80 ? 'HIGH' : confidenceScore >= 50 ? 'MEDIUM' : 'LOW',
    factors: {
      adjustments: validationReport.adjustments_made.length,
      warnings: validationReport.warnings.length,
      compatibility: validationReport.compatibility.verdict
    }
  }
}

// Generate explanation for score adjustments
export function generateAdjustmentExplanation(validationReport) {
  if (validationReport.adjustments_made.length === 0) {
    return null
  }
  
  const explanations = []
  
  if (validationReport.compatibility.verdict === 'INCOMPATIBLE') {
    explanations.push(
      `Critical: Industry incompatibility detected. Scores have been adjusted to reflect the non-viable nature of this partnership.`
    )
  }
  
  validationReport.adjustments_made.forEach(adjustment => {
    explanations.push(
      `${adjustment.field}: Reduced from ${adjustment.original} to ${adjustment.adjusted} - ${adjustment.reason}`
    )
  })
  
  return {
    summary: `Scores have been validated and adjusted for accuracy.`,
    details: explanations,
    confidence: validationReport.confidence_level
  }
}