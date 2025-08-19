import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    // Get user's usage data from Supabase
    const { data: userData, error } = await supabase
      .from('users')
      .select('subscription_status, monthly_analyses_used, monthly_reset_date')
      .eq('clerk_id', user.id)
      .single()

    if (error || !userData) {
      // User not in database yet, create them
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: crypto.randomUUID(),
          clerk_id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          full_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          subscription_status: 'free',
          monthly_analyses_used: 0,
          monthly_reset_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (insertError) {
        console.error('Error creating user:', insertError)
        return NextResponse.json({ 
          canAnalyze: true,
          remaining: 1,
          subscription: 'free'
        })
      }

      return NextResponse.json({
        canAnalyze: true,
        remaining: 1,
        used: 0,
        subscription: 'free',
        resetDate: newUser.monthly_reset_date
      })
    }

    // Check if month has reset
    const resetDate = userData.monthly_reset_date ? new Date(userData.monthly_reset_date) : new Date()
    const now = new Date()
    const shouldReset = !userData.monthly_reset_date || 
      (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear())

    if (shouldReset) {
      // Reset monthly usage
      const { error: updateError } = await supabase
        .from('users')
        .update({
          monthly_analyses_used: 0,
          monthly_reset_date: now.toISOString()
        })
        .eq('clerk_id', user.id)

      if (!updateError) {
        userData.monthly_analyses_used = 0
      }
    }

    // Determine limits based on subscription
    const limits = {
      free: 1,
      starter: 50,
      growth: 999999 // Unlimited
    }

    const limit = limits[userData.subscription_status] || 1
    const used = userData.monthly_analyses_used || 0
    const canAnalyze = used < limit

    return NextResponse.json({
      canAnalyze,
      remaining: Math.max(0, limit - used),
      used,
      limit,
      subscription: userData.subscription_status,
      resetDate: userData.monthly_reset_date
    })

  } catch (error) {
    console.error('Usage check error:', error)
    return NextResponse.json({ 
      canAnalyze: true,
      remaining: 1,
      subscription: 'free'
    })
  }
}