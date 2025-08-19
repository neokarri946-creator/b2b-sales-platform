// Enhanced Company Analyzer with Full Framework Integration
// This integrates the Company Sales Analyser methodology into the website

import analysisFramework from '../../Company Sales Analyser/03_Agent_Configuration/analysis_framework.json'
import clientProfile from '../../Company Sales Analyser/config/client_profile.json'

export class EnhancedAnalyzer {
  constructor() {
    this.framework = analysisFramework
    this.clientProfile = clientProfile
  }

  // Generate comprehensive analysis prompt based on framework
  generateAnalysisPrompt(seller, target) {
    const dimensions = this.framework.analysis_structure.solution_affinity_scorecard.dimensions
    
    return `
    Perform a comprehensive B2B sales analysis for:
    - Seller: ${seller} (${this.clientProfile.company.description})
    - Target: ${target}
    
    Follow this EXACT framework structure:
    
    1. SOLUTION AFFINITY SCORECARD
    Create a detailed scoring table with these dimensions:
    ${dimensions.map(d => `
    - ${d.name} (Weight: ${d.weight * 100}%)
      Evaluate: ${d.scoring_criteria.join(', ')}
      Score: 0-10
      Provide specific rationale
    `).join('')}
    
    2. EXECUTIVE SUMMARY (${this.framework.analysis_structure.executive_summary.max_length} chars max)
    Include:
    - Opportunity overview
    - Strategic fit assessment
    - Success probability (0-100%)
    - Key value drivers (top 3)
    
    3. STRATEGIC OPPORTUNITIES (${this.framework.analysis_structure.strategic_opportunities.min_count}-${this.framework.analysis_structure.strategic_opportunities.max_count} opportunities)
    For each opportunity provide:
    - Specific use case
    - Value magnitude (HIGH/MEDIUM/LOW)
    - Quantified business impact
    - Implementation effort (LOW/MEDIUM/HIGH)
    - Time to value (in months)
    
    4. FINANCIAL ANALYSIS
    Include:
    - Deal size range (e.g., "$500K - $2M")
    - ROI projection (conservative and optimistic)
    - Payback period
    - TCO comparison vs alternatives
    - Likely budget source
    
    5. RISK ASSESSMENT (minimum ${this.framework.analysis_structure.risk_assessment.min_risks} risks)
    For each risk:
    - Category: ${this.framework.analysis_structure.risk_assessment.risk_categories.join(', ')}
    - Risk description
    - Impact level (HIGH/MEDIUM/LOW)
    - Mitigation strategy
    
    6. RECOMMENDED APPROACH
    Provide:
    - Sales strategy (land and expand, enterprise, etc.)
    - Key stakeholders to target (titles and departments)
    - Proof points needed (case studies, demos, POCs)
    - Next steps (specific actions)
    - Timeline (quarterly breakdown)
    
    7. EMAIL TEMPLATES (${this.framework.analysis_structure.email_templates.min_count} templates)
    Create personalized templates for:
    ${this.framework.analysis_structure.email_templates.template_types.join(', ')}
    
    Focus on ${this.clientProfile.company.name}'s:
    - Products: ${this.clientProfile.products.map(p => p.name).join(', ')}
    - Value Props: ${this.clientProfile.value_propositions.join(', ')}
    - Competitive Advantages: ${this.clientProfile.competitive_advantages.join(', ')}
    
    Return as structured JSON matching the framework schema.
    `
  }

  // Process and validate analysis response
  processAnalysisResponse(response) {
    try {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response
      
      // Validate required components
      const validated = this.validateAnalysis(parsed)
      
      // Calculate quality score
      const qualityScore = this.calculateQualityScore(validated)
      
      // Enhance with client-specific insights
      const enhanced = this.enhanceWithClientInsights(validated)
      
      return {
        ...enhanced,
        quality_score: qualityScore,
        framework_version: this.framework.framework_version,
        client_profile: this.clientProfile.company.name
      }
    } catch (error) {
      console.error('Error processing analysis:', error)
      return this.getFallbackAnalysis()
    }
  }

  // Validate analysis against framework requirements
  validateAnalysis(analysis) {
    const structure = this.framework.analysis_structure
    
    // Ensure all required sections exist
    const validated = {
      executive_summary: analysis.executive_summary || 'Analysis in progress',
      scorecard: analysis.scorecard || this.getDefaultScorecard(),
      opportunities: analysis.opportunities || this.getDefaultOpportunities(),
      financial_analysis: analysis.financial_analysis || this.getDefaultFinancials(),
      risks: analysis.risks || this.getDefaultRisks(),
      recommended_approach: analysis.recommended_approach || this.getDefaultApproach(),
      email_templates: analysis.email_templates || this.getDefaultTemplates()
    }
    
    // Validate scorecard dimensions
    if (validated.scorecard.dimensions) {
      validated.scorecard.dimensions = validated.scorecard.dimensions.map((dim, index) => ({
        ...dim,
        weight: structure.solution_affinity_scorecard.dimensions[index]?.weight || 0.2
      }))
    }
    
    return validated
  }

  // Calculate quality score based on framework criteria
  calculateQualityScore(analysis) {
    const weights = this.framework.quality_criteria.scoring_weights
    let score = 0
    
    // Completeness (25%)
    const requiredFields = ['executive_summary', 'scorecard', 'opportunities', 'financial_analysis', 'risks']
    const completedFields = requiredFields.filter(field => analysis[field] && analysis[field] !== '').length
    score += (completedFields / requiredFields.length) * weights.completeness * 100
    
    // Specificity (25%)
    const hasSpecificData = 
      (analysis.opportunities?.some(o => o.business_impact?.includes('%') || o.business_impact?.includes('$'))) ||
      (analysis.financial_analysis?.deal_size_range?.includes('$'))
    score += hasSpecificData ? weights.specificity * 100 : weights.specificity * 50
    
    // Business Focus (20%)
    const businessTerms = ['ROI', 'revenue', 'cost', 'efficiency', 'productivity', 'growth']
    const hasBusinessFocus = analysis.opportunities?.some(o => 
      businessTerms.some(term => o.use_case?.toLowerCase().includes(term.toLowerCase()))
    )
    score += hasBusinessFocus ? weights.business_focus * 100 : weights.business_focus * 50
    
    // Quantification (20%)
    const hasNumbers = analysis.opportunities?.some(o => /\d+/.test(o.business_impact || ''))
    score += hasNumbers ? weights.quantification * 100 : weights.quantification * 50
    
    // Actionability (10%)
    const hasNextSteps = analysis.recommended_approach?.next_steps?.length > 0
    score += hasNextSteps ? weights.actionability * 100 : weights.actionability * 50
    
    return Math.round(score)
  }

  // Enhance analysis with client-specific insights
  enhanceWithClientInsights(analysis) {
    const enhanced = { ...analysis }
    
    // Add client's value propositions to opportunities
    if (enhanced.opportunities) {
      enhanced.opportunities = enhanced.opportunities.map(opp => ({
        ...opp,
        client_solution: this.mapOpportunityToProduct(opp.use_case)
      }))
    }
    
    // Add competitive advantages to approach
    if (enhanced.recommended_approach) {
      enhanced.recommended_approach.competitive_edges = this.clientProfile.competitive_advantages
    }
    
    return enhanced
  }

  // Map opportunity to client's products
  mapOpportunityToProduct(useCase) {
    // Simple keyword matching - can be enhanced with ML
    const products = this.clientProfile.products
    
    for (const product of products) {
      const benefits = product.key_benefits.join(' ').toLowerCase()
      if (useCase?.toLowerCase().includes(product.category.toLowerCase()) ||
          benefits.includes(useCase?.toLowerCase())) {
        return product.name
      }
    }
    
    return products[0]?.name || 'Our Solution'
  }

  // Default scorecard if analysis fails
  getDefaultScorecard() {
    return {
      overall_score: 65,
      dimensions: this.framework.analysis_structure.solution_affinity_scorecard.dimensions.map(dim => ({
        name: dim.name,
        score: 6,
        weight: dim.weight,
        rationale: 'Assessment pending'
      }))
    }
  }

  // Default opportunities
  getDefaultOpportunities() {
    return this.clientProfile.products.slice(0, 3).map(product => ({
      use_case: `Implement ${product.name}`,
      value_magnitude: 'MEDIUM',
      business_impact: product.key_benefits[0],
      implementation_effort: 'MEDIUM',
      time_to_value: '3-6 months'
    }))
  }

  // Default financial analysis
  getDefaultFinancials() {
    return {
      deal_size_range: '$100K - $500K',
      roi_projection: '200-300%',
      payback_period: '12-18 months',
      tco_comparison: 'Competitive with alternatives',
      budget_source: 'IT/Operations budget'
    }
  }

  // Default risks
  getDefaultRisks() {
    return [
      {
        category: 'Organizational',
        risk: 'Change management resistance',
        impact: 'MEDIUM',
        mitigation: 'Phased rollout with champion program'
      },
      {
        category: 'Technical',
        risk: 'Integration complexity',
        impact: 'LOW',
        mitigation: 'Professional services support'
      },
      {
        category: 'Competitive',
        risk: 'Incumbent vendor lock-in',
        impact: 'MEDIUM',
        mitigation: 'ROI-focused displacement strategy'
      }
    ]
  }

  // Default approach
  getDefaultApproach() {
    return {
      sales_strategy: 'Land and expand',
      key_stakeholders: ['VP Sales', 'CTO', 'CFO'],
      proof_points_needed: ['ROI calculator', 'Customer case studies', 'Product demo'],
      next_steps: ['Discovery call', 'Technical assessment', 'Business case development'],
      timeline: 'Q1: Discovery, Q2: Evaluation, Q3: Decision'
    }
  }

  // Default email templates
  getDefaultTemplates() {
    return [
      {
        type: 'executive_outreach',
        subject: `${this.clientProfile.company.name} - Strategic Partnership Opportunity`,
        body: `Dear [Executive Name],\n\nI've been following [Target Company]'s impressive growth trajectory...\n\n${this.clientProfile.value_propositions[0]}\n\nWould you be open to a brief conversation?\n\nBest regards`
      },
      {
        type: 'technical_buyer',
        subject: 'Technical Innovation for [Target Company]',
        body: `Hi [Name],\n\nI noticed your team is working on [initiative]...\n\n${this.clientProfile.products[0].key_benefits[0]}\n\nCould we schedule a technical discussion?\n\nThanks`
      }
    ]
  }

  // Get fallback analysis if everything fails
  getFallbackAnalysis() {
    return {
      success_probability: 60,
      executive_summary: 'Opportunity identified - detailed analysis pending',
      scorecard: this.getDefaultScorecard(),
      opportunities: this.getDefaultOpportunities(),
      financial_analysis: this.getDefaultFinancials(),
      risks: this.getDefaultRisks(),
      recommended_approach: this.getDefaultApproach(),
      email_templates: this.getDefaultTemplates(),
      quality_score: 50,
      framework_version: this.framework.framework_version
    }
  }
}

// Export singleton instance
export default new EnhancedAnalyzer()