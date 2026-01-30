/**
 * Root Layout - Shinkofa Platform
 * Minimal wrapper for i18n routing
 * All app logic is in [locale]/layout.tsx
 */

import type { Metadata, Viewport } from 'next'
import './globals.css'

// Viewport configuration for mobile devices (iOS Safari + Android Chrome)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover', // Support notches (iPhone, Android)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1c3049' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1420' },
  ],
}

export const metadata: Metadata = {
  title: 'Shinkofa Platform',
  description: 'Plateforme holistique - Questionnaire holistique, Shizen AI Coach, Planner intelligent',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
