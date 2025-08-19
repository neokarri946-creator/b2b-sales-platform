'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser()

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span 
              onClick={() => router.push('/')}
              className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700"
            >
              SalesAI
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className={pathname === '/' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}
            >
              Home
            </Link>
            <Link 
              href="/features" 
              className={pathname === '/features' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}
            >
              Features
            </Link>
            <Link 
              href="/pricing" 
              className={pathname === '/pricing' ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}
            >
              Pricing
            </Link>
            
            <SignedOut>
              <Link 
                href="/sign-in" 
                className="text-gray-700 hover:text-blue-600"
              >
                Login
              </Link>
              <button
                onClick={() => router.push('/sign-up')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Start Free
              </button>
            </SignedOut>
            
            <SignedIn>
              <button
                onClick={() => router.push('/analysis/new')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                New Analysis
              </button>
              <div className="flex items-center space-x-2">
                {user && (
                  <span className="text-sm text-gray-900">
                    Hi, {user.firstName || 'there'}!
                  </span>
                )}
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'h-8 w-8'
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  )
}