/**
 * Checkout Success Page - Shinkofa Platform
 * Page de confirmation apres paiement Stripe reussi
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('checkout.success')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const session_id = searchParams.get('session_id')
    setSessionId(session_id)

    // Verifier que la session existe (optionnel)
    if (session_id) {
      setTimeout(() => {
        setIsVerifying(false)
      }, 2000)
    } else {
      setIsVerifying(false)
    }
  }, [searchParams])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-shinkofa-marine dark:border-secondary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('verifying')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center">
          {/* Success Icon */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('subtitle')}
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
              {t('emailNotice.title')}
            </h2>
            <p className="text-sm text-blue-800 dark:text-blue-300">
              {t('emailNotice.message')}
              <br />
              {t('emailNotice.spamNote')}
            </p>
          </div>

          {/* Next Steps */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('nextSteps.title')}
            </h3>
            <ol className="text-left space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-shinkofa-marine text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>{t('nextSteps.step1').split(' ')[0]}</strong> {t('nextSteps.step1').split(' ').slice(1).join(' ')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-shinkofa-marine text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>{t('nextSteps.step2').split(' ')[0]}</strong> {t('nextSteps.step2').split(' ').slice(1).join(' ')}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-shinkofa-marine text-white rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </span>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>{t('nextSteps.step3').split(' ')[0]}</strong> {t('nextSteps.step3').split(' ').slice(1).join(' ')}
                </span>
              </li>
            </ol>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange hover:from-primary-900 hover:to-secondary-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {t('login')}
            </Link>
            <Link
              href="/"
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
            >
              {t('backToHome')}
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('needHelp')}{' '}
              <Link href="/contact" className="text-shinkofa-marine dark:text-secondary-300 hover:underline font-semibold">
                {t('contactSupport')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Page wrapper avec Suspense boundary (requis Next.js 15)
export default function CheckoutSuccessPage() {
  const t = useTranslations('checkout.success')

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-shinkofa-marine dark:border-secondary-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('verifying')}</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
