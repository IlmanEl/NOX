import type { Metadata, Viewport } from 'next'
import './globals.css'

/**
 * Root Layout
 *
 * This layout wraps all pages in the application.
 * PWA-ready with proper viewport and metadata.
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
    <html lang="en">
      <body className="safe-top safe-bottom min-h-screen">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  )
}
