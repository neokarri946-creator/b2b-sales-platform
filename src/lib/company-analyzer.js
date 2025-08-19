// Enhanced Company Analyzer based on B2B Sales Intelligence Framework
// Extracted from Company Sales Analyser methodology

export const analyzerFramework = {
  // Solution Affinity Scorecard Dimensions
  scoringDimensions: [
    {
      name: "Market Alignment",
      description: "How well the target aligns with our market focus",
      weight: 0.25
    },
    {
      name: "Budget Readiness", 
      description: "Financial capacity and budget availability signals",
      weight: 0.20
    },
    {
      name: "Technology Fit",
      description: "Compatibility with existing tech stack and needs",
      weight: 0.20
    },
    {
      name: "Competitive Position",
      description: "Our competitive advantage in this opportunity",
      weight: 0.20
    },
    {
      name: "Implementation Readiness",
      description: "Organizational readiness for change",
      weight: 0.15
    }
  ],

  // Analysis prompt template based on framework methodology
  getAnalysisPrompt: (seller, target) => `
    Perform a comprehensive B2B sales analysis following this exact framework:

    CONTEXT:
    - Seller Company: ${seller}
    - Target Company: ${target}

    REQUIRED OUTPUT STRUCTURE:

    1. SOLUTION AFFINITY SCORECARD
    Create a detailed scoring assessment with:
    - Overall Score (0-100)
    - Individual dimension scores for:
      * Market Alignment (0-10)
      * Budget Readiness (0-10)  
      * Technology Fit (0-10)
      * Competitive Position (0-10)
      * Implementation Readiness (0-10)
    - Brief rationale for each score
    - How seller's value prop addresses each dimension

    2. EXECUTIVE SUMMARY
    - 3-4 sentence overview of opportunity
    - Key strategic fit indicators
    - Primary value drivers
    - Overall recommendation

    3. STRATEGIC OPPORTUNITIES
    Identify 4-5 specific business use cases where seller can add value:
    - Focus on BUSINESS OUTCOMES not features
    - Include value magnitude (HIGH/MEDIUM/LOW)
    - Map to specific seller capabilities
    - Quantify impact where possible
    - Example: "Reduce manual data entry by 60% through automation, saving 20 hours/week"

    4. FINANCIAL ANALYSIS
    - Estimated deal size range
    - ROI projections (conservative and optimistic)
    - Payback period estimate
    - Key financial drivers

    5. RISK ASSESSMENT
    - Top 3 risks or obstacles
    - Mitigation strategies for each
    - Competitive threats
    - Implementation challenges

    6. RECOMMENDED APPROACH
    - Sales strategy and positioning
    - Key stakeholders to target
    - Proof points and case studies needed
    - Next steps and timeline

    7. EMAIL TEMPLATES
    Create 2 personalized outreach emails:
    - Initial executive outreach
    - Follow-up with value proposition
    - Focus on business impact, not product features
    - Include specific use cases relevant to target

    FORMAT AS JSON with this structure:
    {
      "scorecard": {
        "overall_score": 0-100,
        "dimensions": [
          {
            "name": "dimension",
            "score": 0-10,
            "rationale": "explanation",
            "value_prop": "how seller addresses this"
          }
        ]
      },
      "executive_summary": "summary text",
      "opportunities": [
        {
          "use_case": "specific business scenario",
          "value_magnitude": "HIGH/MEDIUM/LOW",
          "business_impact": "quantified outcome",
          "seller_capability": "matching product/service"
        }
      ],
      "financial_analysis": {
        "deal_size_range": "$X - $Y",
        "roi_conservative": "X%",
        "roi_optimistic": "Y%",
        "payback_period": "X months"
      },
      "risks": [
        {
          "risk": "description",
          "mitigation": "strategy"
        }
      ],
      "recommended_approach": {
        "strategy": "approach",
        "key_stakeholders": ["titles"],
        "next_steps": ["actions"]
      },
      "email_templates": [
        {
          "subject": "subject line",
          "body": "email content"
        }
      ]
    }

    Base your analysis on real B2B sales patterns and be specific about business value.
  `,

  // Process raw AI response into structured format
  processAnalysisResponse: (aiResponse) => {
    try {
      // Parse the JSON response
      const parsed = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse
      
      // Calculate success probability from scorecard
      const overallScore = parsed.scorecard?.overall_score || 50
      
      // Extract key insights
      const topOpportunity = parsed.opportunities?.[0] || {
        use_case: "Process optimization opportunity",
        business_impact: "Efficiency gains possible"
      }
      
      // Format for existing system
      return {
        success_probability: overallScore,
        
        // Executive summary becomes industry fit
        industry_fit: parsed.executive_summary || "Potential alignment identified",
        
        // Financial indicators as budget signal
        budget_signal: parsed.financial_analysis?.deal_size_range 
          ? `Deal potential: ${parsed.financial_analysis.deal_size_range}`
          : "Budget assessment needed",
        
        // Top opportunity as timing
        timing: topOpportunity.use_case || "Opportunity identified",
        
        // Map opportunities to key_opportunities
        key_opportunities: parsed.opportunities?.map(opp => 
          `${opp.use_case}: ${opp.business_impact}`
        ) || [
          "Strategic alignment opportunity",
          "Process improvement potential",
          "Competitive advantage possible"
        ],
        
        // Risks become challenges
        challenges: parsed.risks?.map(r => r.risk) || [
          "Initial relationship building needed",
          "Competitive evaluation likely"
        ],
        
        // Recommended approach
        recommended_approach: parsed.recommended_approach?.strategy || 
          "Build trust through value demonstration",
        
        // Email templates
        email_templates: parsed.email_templates || [
          {
            subject: "Partnership opportunity discussion",
            body: "Personalized outreach based on research"
          }
        ],
        
        // Add the full scorecard for detailed view
        scorecard: parsed.scorecard,
        
        // Add financial analysis
        financial_analysis: parsed.financial_analysis,
        
        // Add full strategic opportunities
        strategic_opportunities: parsed.opportunities
      }
    } catch (error) {
      console.error('Error processing analysis:', error)
      // Return basic structure if parsing fails
      return {
        success_probability: 50,
        industry_fit: "Analysis in progress",
        budget_signal: "Further research needed",
        timing: "Opportunity identified",
        key_opportunities: ["Potential value creation"],
        challenges: ["Initial assessment needed"],
        recommended_approach: "Exploratory conversation recommended",
        email_templates: [{
          subject: "Introduction",
          body: "Initial outreach"
        }]
      }
    }
  },

  // Generate executive presentation based on analysis
  generatePresentation: (analysis, seller, target) => {
    const slides = [
      {
        title: "Executive Summary",
        content: [
          `Opportunity Score: ${analysis.success_probability}%`,
          analysis.industry_fit,
          `Key Value Driver: ${analysis.strategic_opportunities?.[0]?.use_case || analysis.timing}`
        ]
      },
      {
        title: "Solution Affinity Scorecard",
        content: analysis.scorecard?.dimensions?.map(d => 
          `${d.name}: ${d.score}/10 - ${d.rationale}`
        ) || ["Comprehensive scoring completed"]
      },
      {
        title: "Strategic Opportunities",
        content: analysis.strategic_opportunities?.slice(0, 3).map(opp =>
          `${opp.use_case} (${opp.value_magnitude} impact)`
        ) || analysis.key_opportunities.slice(0, 3)
      },
      {
        title: "Financial Impact",
        content: [
          `Deal Size: ${analysis.financial_analysis?.deal_size_range || "TBD"}`,
          `ROI: ${analysis.financial_analysis?.roi_conservative || "20"}% - ${analysis.financial_analysis?.roi_optimistic || "50"}%`,
          `Payback: ${analysis.financial_analysis?.payback_period || "12-18 months"}`
        ]
      },
      {
        title: "Risk Mitigation",
        content: analysis.risks?.map(r => 
          `${r.risk}: ${r.mitigation}`
        ) || analysis.challenges.map(c => `Address: ${c}`)
      },
      {
        title: "Recommended Next Steps",
        content: analysis.recommended_approach?.next_steps || [
          "Schedule discovery call",
          "Prepare customized demo",
          "Develop business case"
        ]
      }
    ]
    
    return {
      slides,
      executive_summary: analysis.industry_fit,
      call_to_action: "Let's explore how we can drive value together"
    }
  }
}

// Quality assessment based on framework standards
export const assessAnalysisQuality = (analysis) => {
  let score = 0
  const maxScore = 100
  const assessment = {
    completeness: 0,
    specificity: 0,
    business_focus: 0,
    quantification: 0,
    actionability: 0
  }
  
  // Check completeness (25 points)
  if (analysis.success_probability !== undefined) assessment.completeness += 5
  if (analysis.scorecard) assessment.completeness += 10
  if (analysis.strategic_opportunities?.length > 2) assessment.completeness += 5
  if (analysis.financial_analysis) assessment.completeness += 5
  
  // Check specificity (25 points)
  if (analysis.industry_fit?.length > 50) assessment.specificity += 10
  if (analysis.key_opportunities?.some(o => o.includes(":"))) assessment.specificity += 10
  if (analysis.email_templates?.length > 0) assessment.specificity += 5
  
  // Check business focus (20 points)
  const businessTerms = ["ROI", "efficiency", "revenue", "cost", "growth", "productivity"]
  const hasBusinessFocus = analysis.key_opportunities?.some(opp => 
    businessTerms.some(term => opp.toLowerCase().includes(term.toLowerCase()))
  )
  if (hasBusinessFocus) assessment.business_focus = 20
  
  // Check quantification (20 points)
  const hasNumbers = analysis.key_opportunities?.some(opp => /\d+/.test(opp))
  if (hasNumbers) assessment.quantification += 10
  if (analysis.financial_analysis?.roi_conservative) assessment.quantification += 10
  
  // Check actionability (10 points)
  if (analysis.recommended_approach) assessment.actionability += 5
  if (analysis.email_templates?.length > 0) assessment.actionability += 5
  
  // Calculate total score
  score = Object.values(assessment).reduce((a, b) => a + b, 0)
  
  return {
    score,
    maxScore,
    percentage: Math.round((score / maxScore) * 100),
    assessment,
    recommendations: score < 70 ? [
      "Add more specific business outcomes",
      "Include quantified impact metrics", 
      "Provide detailed scorecard analysis"
    ] : ["High quality analysis completed"]
  }
}

export default analyzerFramework