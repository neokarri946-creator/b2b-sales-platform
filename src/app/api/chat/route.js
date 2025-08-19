import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-placeholder',
})

// System prompt that defines the chatbot's behavior
const SYSTEM_PROMPT = `You are a helpful assistant for SalesAI, a B2B sales intelligence platform. Be honest, authentic, and helpful.

ABOUT SALESAI PLATFORM:
- AI-powered analysis tool for B2B sales opportunities
- Analyzes target companies to help predict sales success
- Provides email templates for outreach
- Dashboard to track and manage analyses
- Quick analysis process

PRICING TIERS:
• Free Plan ($0/month): 1 analysis per month, basic features
• Starter Plan ($47/month): 50 analyses per month, additional features
• Growth Plan ($197/month): Unlimited analyses, API access, team features

YOUR APPROACH:
- Be honest and authentic - don't make up statistics or claims
- If you don't know something, say so
- Be helpful and conversational
- Focus on understanding what the user needs
- Guide them to the right features or pages when appropriate
- Keep responses concise and clear

AVAILABLE PAGES:
- Homepage: Try the free demo
- /pricing: View pricing plans
- /dashboard: User dashboard (requires login)
- /analysis/new: Run a new analysis (requires login)
- /sign-up: Create an account

IMPORTANT:
- Don't invent features or statistics about the platform
- Don't make promises about accuracy or success rates
- Be transparent that this is a tool to help with sales decisions
- If asked about specific performance metrics, explain that results vary
- Focus on being genuinely helpful rather than overselling

Remember: You're here to help users understand and use the platform effectively, not to make exaggerated claims.`

export async function POST(request) {
  try {
    const { messages } = await request.json()
    
    // If no API key, fall back to helpful static response
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-placeholder') {
      return NextResponse.json({ 
        message: `I'm your SalesAI assistant! I can help you understand our B2B sales platform and how to use it effectively.

Our platform analyzes target companies and predicts your success probability, helping you focus on the most promising opportunities. You can try it free on the homepage - no signup required!

What would you like to know? I can explain our analysis process, pricing plans, or help you get started with your first analysis.` 
      })
    }
    
    // Prepare messages for OpenAI
    const openaiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]
    
    // Call OpenAI API with GPT-4 for superior conversational abilities
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })
    
    const response = completion.choices[0]?.message?.content || 
      'I apologize, but I encountered an issue. Please try again or contact support if the problem persists.'
    
    return NextResponse.json({ message: response })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // Provide a helpful fallback response
    return NextResponse.json({ 
      message: `I'm having trouble connecting right now, but I can still help! 

SalesAI is a B2B sales platform that analyzes target companies and predicts your success probability. You can try our free demo on the homepage or check out our pricing plans starting at $47/month.

For immediate assistance, you can explore our dashboard or start a new analysis. What specific aspect of the platform would you like to learn about?`
    })
  }
}