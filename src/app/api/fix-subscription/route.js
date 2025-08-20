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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = user.emailAddresses[0]?.emailAddress || ''
    console.log('Fixing subscription for:', userEmail)

    // Only fix for the specific account that already paid
    if (userEmail === 'neokarri946@gmail.com') {
      // Update the users table
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          subscription_status: 'starter',
          updated_at: new Date().toISOString()
        })
        .eq('clerk_id', user.id)

      if (userUpdateError) {
        console.error('Error updating user subscription:', userUpdateError)
      } else {
        console.log('Updated user subscription status to starter')
      }

      // Also create/update user_subscriptions table
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan: 'starter',
          status: 'active',
          current_period_start: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (subError) {
        console.error('Error creating subscription record:', subError)
      } else {
        console.log('Created/updated subscription record')
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Subscription fixed! You now have the Starter plan with 50 analyses per month.'
      })
    }

    return NextResponse.json({ 
      error: 'This endpoint is only for fixing the neokarri946@gmail.com subscription' 
    }, { status: 403 })

  } catch (error) {
    console.error('Fix subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to fix subscription' },
      { status: 500 }
    )
  }
}