import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }
    
    // Check job status in database
    const { data: job, error } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single()
    
    if (error || !job) {
      // If job not found in DB, check if it's a recent job that might still be processing
      console.log('Job not found in database:', jobId)
      
      // Return a pending status for very recent jobs (within 30 seconds)
      const jobTimestamp = parseInt(jobId.split('-')[1])
      const jobAge = Date.now() - jobTimestamp
      
      if (jobAge < 30000) { // Less than 30 seconds old
        return NextResponse.json({
          jobId,
          status: 'pending',
          progress: 5,
          message: 'Analysis is starting...'
        })
      }
      
      return NextResponse.json(
        { error: 'Job not found', jobId },
        { status: 404 }
      )
    }
    
    // Return job status
    const response = {
      jobId: job.id,
      status: job.status,
      progress: job.progress || 0,
      currentStep: job.current_step,
      seller: job.seller_company,
      target: job.target_company,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    }
    
    // If completed, include the analysis data
    if (job.status === 'completed' && job.analysis_data) {
      response.analysis = job.analysis_data
      response.researchData = job.research_data
    }
    
    // If failed, include error
    if (job.status === 'failed' && job.error) {
      response.error = job.error
    }
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Failed to check status', details: error.message },
      { status: 500 }
    )
  }
}