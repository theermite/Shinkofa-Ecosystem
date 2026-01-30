/**
 * Locale Layout - Shinkofa Platform
 * Main layout with i18n, providers, and global components
 */

import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Locale } from '@/i18n/config'
import { Providers } from '@/components/Providers'
import { Navbar } from '@/components/layout/Navbar'
import { BackToTop } from '@/components/layout/BackToTop'
import { QuickActionsMenu } from '@/components/quick-actions/QuickActionsMenu'
import { OnboardingTour } from '@/components/onboarding/OnboardingTour'
import { SuperAdminComponents } from '@/components/super-admin/SuperAdminComponents'
import { MaintenanceBanner } from '@/components/layout/MaintenanceBanner'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  // Validate locale
  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  // Enable static rendering
  setRequestLocale(locale)

  // Load messages for this locale
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Prevent dark mode flash - Execute before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const theme = stored || systemPreference;
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <MaintenanceBanner />
            <Navbar />
            {children}
            <QuickActionsMenu />
            <OnboardingTour />
            <SuperAdminComponents />
          </Providers>
          <BackToTop />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
