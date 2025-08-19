import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import Chatbot from '@/components/Chatbot'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <Chatbot />
        </body>
      </html>
    </ClerkProvider>
  )
}
