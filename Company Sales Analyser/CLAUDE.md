# CLAUDE.md - B2B Sales Intelligence Platform Instructions

## Platform Overview

This is a **configurable B2B Sales Intelligence Platform** that helps companies analyze potential clients and create data-driven sales strategies. The platform is industry-agnostic and can be customized for any B2B company's specific products and services.

## Configuration System

The platform uses a client configuration file (`config/client_profile.json`) to customize all analyses for your specific company. Before running any analysis, ensure your client profile is properly configured with:

- Your company information
- Product/service offerings
- Value propositions
- Competitive advantages
- Custom scoring dimensions

## Mandatory Agent Guidelines

**IMPORTANT**: When using ANY agent in this project, you MUST include the following guidelines in every agent prompt to ensure consistency and quality.

### Core Guidelines for All Agents

1. **Client-Specific Focus**
   - Analyze companies for opportunities relevant to the configured client company
   - Focus on the client's specific products/services as defined in `config/client_profile.json`
   - Maintain industry-agnostic approach unless client specifies otherwise
   - All analyses should align with client's value propositions

2. **Citation Requirements**
   - EVERY claim must include proper citations
   - Use markdown footnotes format: `[1]`, `[2]`, etc.
   - Include a References section with validated, clickable links
   - Verify all links are working before including them

3. **Specific Use Cases**
   - Never use vague terms without explanation
   - Always explain HOW the client's solutions deliver value specifically
   - Quantify benefits wherever possible
   - Example: Instead of "AI-powered optimization", write "Machine learning algorithms that reduce processing time by 60%, saving 20 hours per week"

4. **Strategic Opportunities**
   - Always provide specific implementation scenarios
   - Focus on business outcomes, not technical features
   - Include ROI projections and timelines
   - Map opportunities to client's specific products/services

### Enforcement Instructions

When invoking any agent, append this to your prompt:
```
MANDATORY: Follow the guidelines in CLAUDE.md:
- Client-specific focus based on config/client_profile.json
- Include citations with markdown footnotes for every claim
- Provide specific, detailed use cases (not generic statements)
- Focus on client's unique value propositions and competitive advantages
- Quantify business impact and ROI wherever possible
```

### Agent-Specific Applications

- **Company Research Agents**: Focus on target company's needs that align with client solutions
- **Market Analysis Agents**: Cite all market data with validated sources
- **Sales Strategy Agents**: Provide specific client product implementations
- **Presentation Creation Agents**: Ensure all slides follow client branding and messaging
- **Quality Assurance Agents**: Verify alignment with client's value propositions

### Validation Checklist

Before accepting any agent output, verify:
- [ ] Focus aligns with client's products/services from config
- [ ] All claims have citation footnotes
- [ ] Use cases include specific "how" explanations
- [ ] Client's solutions are named specifically
- [ ] All links in references are validated
- [ ] ROI and business impact are quantified

## Automated Enforcement System

Guidelines are AUTOMATICALLY enforced through multiple mechanisms:

### 🤖 Automation Features

1. **Automatic Configuration Loading**: Client profile loaded for every analysis
2. **Automatic Validation**: All responses checked for compliance
3. **Automatic Customization**: Content tailored to client specifications
4. **Automatic Quality Control**: Ensures professional output

### 🚀 Quick Setup
```bash
# 1. Configure your client profile
cp config/client_profile.json config/active_client.json
# Edit config/active_client.json with your company details

# 2. Run setup
./setup-automation.sh

# 3. Analyze a company
./analyze_company.sh "Target Company Name"
```

## Project Context

This platform enables B2B sales teams to:
- Analyze any target company comprehensively
- Generate executive-ready presentations
- Calculate ROI and business impact
- Create data-driven sales strategies
- Maintain consistent, high-quality output

## MANDATORY COMPANY ANALYSIS STRUCTURE

**For ALL company analyses, create exactly 5 files:**

1. **`[company]_analysis_framework.md`**
   - **MUST START WITH**: Solution Affinity Scorecard table showing:
     - Company name and overall score (0-10)
     - 5 custom dimensions from client configuration
     - Table format with columns: DIMENSION | SCORE | RATIONALE | CLIENT VALUE PROP
   - Executive Summary
   - Company Overview with citations
   - Strategic Opportunities (5-6 use cases)
     - **MUST BE BUSINESS-FOCUSED**: Focus on business challenges and outcomes
     - Include value magnitude (HIGH/MEDIUM/LOW)
     - Map to specific client products/services
   - Financial Analysis and ROI calculations
   - Risk Mitigation Strategy
   - Success Metrics
   - References (all with clickable hyperlinks)

2. **`[company]_analysis_framework.json`**
   - JSON version following the framework schema
   - Automatically loaded to database for cross-company insights
   - Includes all scoring dimensions and opportunities

3. **`[company]_executive_presentation.md`**
   - 15-slide executive presentation format
   - Strategic narrative arc
   - Compelling headlines with 3 bullet points per slide
   - **MUST INCLUDE**: Slide narration (3 paragraphs, 3 sentences each)
   - **MUST INCLUDE**: Financial calculations appendix
   - Visual recommendations
   - Clear value propositions and ROI
   - Call to action

4. **`presentation_quality_assessment.md`**
   - Quality score (0-100)
   - Compliance assessment
   - Executive communication quality review
   - Business value communication score
   - Structure and flow analysis
   - Improvement recommendations

5. **`compliance_summary.md`**
   - Overall compliance verification
   - Checklist of guidelines adherence
   - Citation validation results
   - Key deliverables summary
   - Lessons learned

## Client Configuration Guide

### Setting Up Your Client Profile

1. Copy the template:
```bash
cp config/client_profile.json config/my_company.json
```

2. Edit with your company details:
- Company name, industry, website
- Products and services
- Value propositions
- Competitive advantages
- Custom scoring dimensions

3. Activate your profile:
```bash
cp config/my_company.json config/active_client.json
```

### Multi-Client Support

The platform supports multiple client profiles:
```
/config/
  client_profile.json     (template)
  techvision.json        (TechVision Solutions)
  acmecorp.json          (Acme Corporation)
  active_client.json     (Currently active)
```

Switch clients:
```bash
./switch_client.sh techvision
```

## Usage Examples

### Single Company Analysis
```bash
# Analyze a single company
./analyze_company.sh "Microsoft"
```

### Batch Analysis
```bash
# Analyze multiple companies
./batch_analyze.sh companies.txt
```

### Generate Presentation Only
```bash
# Create presentation from existing analysis
./generate_presentation.sh "Microsoft"
```

## Quality Standards

All outputs must meet these standards:
- **Professional**: Executive-ready language and formatting
- **Accurate**: All claims backed by citations
- **Specific**: Quantified benefits and clear use cases
- **Actionable**: Clear next steps and implementation paths
- **Customized**: Aligned with client's unique value propositions

## Support and Customization

For platform customization or support:
1. Review documentation in `/00_Documentation/`
2. Check configuration in `/config/`
3. Validate outputs with quality assessment tools
4. Use feedback system for continuous improvement

Remember: The platform's value is in its **methodology and automation**, providing consistent, high-quality sales intelligence for any B2B company.