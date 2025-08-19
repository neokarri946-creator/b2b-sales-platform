import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function POST() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    // Get current usage
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('monthly_analyses_used, monthly_reset_date')
      .eq('clerk_id', user.id)
      .single()

    if (fetchError || !userData) {
      console.error('Error fetching user data:', fetchError)
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Check if we need to reset monthly count
    const resetDate = userData.monthly_reset_date ? new Date(userData.monthly_reset_date) : new Date()
    const now = new Date()
    const shouldReset = !userData.monthly_reset_date || 
      (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear())

    const newCount = shouldReset ? 1 : (userData.monthly_analyses_used || 0) + 1
    const newResetDate = shouldReset ? now.toISOString() : userData.monthly_reset_date

    // Increment usage count
    const { error: updateError } = await supabase
      .from('users')
      .update({
        monthly_analyses_used: newCount,
        monthly_reset_date: newResetDate,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', user.id)

    if (updateError) {
      console.error('Error updating usage:', updateError)
      return NextResponse.json({ 
        error: 'Failed to update usage' 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      newCount,
      resetDate: newResetDate
    })

  } catch (error) {
    console.error('Increment usage error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}