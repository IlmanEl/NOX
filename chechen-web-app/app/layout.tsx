import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BottomNavigation } from '@/components/bottom-navigation'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
})

/**
 * Root Layout
 *
 * Mobile-first layout with bottom navigation
 * PWA-ready with proper viewport and metadata
 */

export const metadata: Metadata = {
  title: 'Chechen Language App',
  description: 'Learn Chechen language from A1 to advanced level',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Chechen App',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${inter.variable} safe-top safe-bottom flex min-h-full flex-col font-sans antialiased`}
        suppressHydrationWarning
      >
        {/* Mobile Shell - max width like phone screen */}
        <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col bg-gradient-to-b from-white to-gray-50">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto px-4 pb-24 pt-6">
            {children}
          </main>

          {/* Bottom Navigation */}
          <BottomNavigation />
        </div>
      </body>
    </html>
  )
}
