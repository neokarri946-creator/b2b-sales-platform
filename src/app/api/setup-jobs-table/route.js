import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase with service key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
)

export async function GET() {
  try {
    // Create the analysis_jobs table
    const { error } = await supabase.from('analysis_jobs').select('count').limit(1)
    
    if (error && error.code === '42P01') {
      // Table doesn't exist, create it
      console.log('Creating analysis_jobs table...')
      
      // Use raw SQL to create the table
      const { data, error: createError } = await supabase.rpc('create_analysis_jobs_table', {})
        .catch(async () => {
          // If RPC doesn't exist, return null
          return { data: null, error: 'RPC not available' }
        })
      
      if (createError || !data) {
        // Alternative: Try to create via insert (Supabase will auto-create table)
        const { error: insertError } = await supabase
          .from('analysis_jobs')
          .insert([{
            id: 'test-job',
            seller_company: 'Test',
            target_company: 'Test',
            status: 'pending',
            progress: 0
          }])
        
        if (!insertError) {
          // Delete the test record
          await supabase.from('analysis_jobs').delete().eq('id', 'test-job')
          
          return NextResponse.json({
            success: true,
            message: 'Table created via auto-creation'
          })
        }
        
        return NextResponse.json({
          success: false,
          message: 'Could not create table',
          error: insertError?.message
        })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Table created successfully'
      })
    } else if (!error) {
      // Table already exists
      return NextResponse.json({
        success: true,
        message: 'Table already exists'
      })
    } else {
      // Some other error
      return NextResponse.json({
        success: false,
        message: 'Error checking table',
        error: error.message
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Setup failed',
      error: error.message
    }, { status: 500 })
  }
}