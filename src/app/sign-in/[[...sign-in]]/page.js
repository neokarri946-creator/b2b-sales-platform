import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-900">Sign in to continue your B2B analysis</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-white shadow-xl rounded-lg',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton: 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              footerActionLink: 'text-blue-600 hover:text-blue-700',
              identityPreviewText: 'text-gray-700',
              identityPreviewEditButton: 'text-blue-600 hover:text-blue-700',
              formFieldInput: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
              formFieldLabel: 'text-gray-700',
              dividerLine: 'bg-gray-200',
              dividerText: 'text-gray-500'
            },
            layout: {
              socialButtonsPlacement: 'top',
              socialButtonsVariant: 'blockButton',
              showOptionalFields: false
            },
            variables: {
              colorPrimary: '#2563eb'
            }
          }}
          signUpUrl="/sign-up"
          afterSignInUrl="/"
          redirectUrl="/"
        />
        <div className="text-center mt-6">
          <p className="text-sm text-gray-900">
            Don&apos;t have an account?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:underline font-semibold">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}