import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST(request) {
  try {
    const user = await currentUser()
    const userId = user?.id
    
    const { seller, target } = await request.json()
    
    if (!seller || !target) {
      return NextResponse.json(
        { error: 'Seller and target companies are required' },
        { status: 400 }
      )
    }

    console.log(`🚀 Starting async analysis: ${seller} → ${target}`)
    
    // Create a unique job ID
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Store the initial job in the database
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .insert([{
        id: jobId,
        user_id: userId,
        seller_company: seller,
        target_company: target,
        status: 'pending',
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (jobError) {
      console.error('Failed to create job:', jobError)
      // If table doesn't exist, create it
      if (jobError.code === '42P01') {
        console.log('Creating analysis_jobs table...')
        
        // Create the table
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS analysis_jobs (
              id TEXT PRIMARY KEY,
              user_id TEXT,
              seller_company TEXT NOT NULL,
              target_company TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'pending',
              progress INTEGER DEFAULT 0,
              current_step TEXT,
              research_data JSONB,
              analysis_data JSONB,
              error TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            
            CREATE INDEX IF NOT EXISTS idx_analysis_jobs_user_id ON analysis_jobs(user_id);
            CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON analysis_jobs(status);
          `
        }).catch(async () => {
          // If exec_sql doesn't work, try direct insert and let it create the table
          console.log('Attempting direct table creation via insert...')
          return { data: null, error: null }
        })
        
        // Try inserting again
        const { data: retryJob, error: retryError } = await supabase
          .from('analysis_jobs')
          .insert([{
            id: jobId,
            user_id: userId,
            seller_company: seller,
            target_company: target,
            status: 'pending',
            progress: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single()
        
        if (retryError) {
          // If still failing, just return the job ID and process in background
          console.log('Proceeding without database storage')
        }
      }
    }
    
    // Start the background processing
    const baseUrl = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    
    // Fire and forget - start processing in background
    fetch(`${protocol}://${baseUrl}/api/analysis-process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, seller, target, userId })
    }).catch(error => {
      console.error('Failed to start background processing:', error)
    })
    
    return NextResponse.json({
      jobId,
      status: 'started',
      message: 'Analysis started. Poll /api/analysis-status with the jobId to check progress.',
      seller,
      target
    })
    
  } catch (error) {
    console.error('Analysis start error:', error)
    return NextResponse.json(
      { error: 'Failed to start analysis', details: error.message },
      { status: 500 }
    )
  }
}