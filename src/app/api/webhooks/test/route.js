export async function POST(req) {
  console.log('Test webhook received')
  
  // Log environment variables (without exposing secrets)
  console.log('Has CLERK_WEBHOOK_SECRET:', !!process.env.CLERK_WEBHOOK_SECRET)
  console.log('Secret starts with:', process.env.CLERK_WEBHOOK_SECRET?.substring(0, 10))
  
  // Get headers
  const headers = Object.fromEntries(req.headers.entries())
  console.log('Headers received:', Object.keys(headers))
  
  // Get body
  try {
    const body = await req.json()
    console.log('Body type received:', body.type)
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Test webhook received',
      hasSecret: !!process.env.CLERK_WEBHOOK_SECRET,
      eventType: body.type || 'unknown'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to parse body',
      error: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function GET() {
  return new Response(JSON.stringify({
    message: 'Test webhook endpoint is working',
    hasSecret: !!process.env.CLERK_WEBHOOK_SECRET,
    secretPrefix: process.env.CLERK_WEBHOOK_SECRET?.substring(0, 7)
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}