/**
 * Email Verification Page - Shinkofa Platform
 * Page de verification email internationalisee
 */

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'

type VerificationStatus = 'verifying' | 'success' | 'already_verified' | 'error'

// Force dynamic rendering (required for useSearchParams)
export const dynamic = 'force-dynamic'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('auth.verifyEmail')
  const [status, setStatus] = useState<VerificationStatus>('verifying')
  const [message, setMessage] = useState('')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      setMessage(t('errors.invalidToken'))
      return
    }

    // Verify email with backend
    async function verifyEmail() {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://alpha.shinkofa.com'}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (!response.ok) {
          setStatus('error')
          setMessage(data.detail || t('errors.verificationFailed'))
          return
        }

        // Check status from backend
        if (data.status === 'verified') {
          setStatus('success')
          setMessage(data.message || t('success'))

          // Start countdown to redirect
          const interval = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(interval)
                router.push('/auth/login')
                return 0
              }
              return prev - 1
            })
          }, 1000)

          return () => clearInterval(interval)
        } else if (data.status === 'already_verified') {
          setStatus('already_verified')
          setMessage(data.message || t('alreadyVerified'))
        } else {
          setStatus('error')
          setMessage(t('errors.unknownStatus'))
        }
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || t('errors.connectionError'))
      }
    }

    verifyEmail()
  }, [searchParams, router, t])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === 'verifying' && (
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-shinkofa-marine dark:border-secondary-400"></div>
            )}
            {status === 'success' && (
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {status === 'already_verified' && (
              <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-4">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {status === 'verifying' && t('verifying')}
            {status === 'success' && t('success')}
            {status === 'already_verified' && t('alreadyVerified')}
            {status === 'error' && t('error')}
          </h2>

          {/* Message */}
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {message || t('defaultMessage')}
          </p>

          {/* Countdown (success only) */}
          {status === 'success' && (
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('redirecting', { seconds: countdown, plural: countdown > 1 ? 's' : '' })}
              </p>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-shinkofa-marine dark:bg-secondary-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(5 - countdown) * 20}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {(status === 'success' || status === 'already_verified') && (
              <Link
                href="/auth/login"
                className="block w-full text-center py-3 px-4 bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange hover:from-primary-900 hover:to-secondary-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('loginNow')}
              </Link>
            )}

            {status === 'error' && (
              <>
                <Link
                  href="/auth/register"
                  className="block w-full text-center py-3 px-4 bg-gradient-to-r from-shinkofa-marine to-shinkofa-orange hover:from-primary-900 hover:to-secondary-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('createAccount')}
                </Link>
                <Link
                  href="/auth/login"
                  className="block w-full text-center py-3 px-4 border-2 border-shinkofa-marine dark:border-secondary-400 text-shinkofa-marine dark:text-secondary-300 font-semibold rounded-lg hover:bg-shinkofa-marine hover:text-white dark:hover:bg-secondary-400 dark:hover:text-gray-900 transition-all duration-300"
                >
                  {t('backToLogin')}
                </Link>
              </>
            )}

            <Link
              href="/"
              className="block w-full text-center py-3 px-4 text-gray-600 dark:text-gray-400 hover:text-shinkofa-marine dark:hover:text-secondary-300 font-medium transition-colors"
            >
              {t('backToHome')}
            </Link>
          </div>
        </div>

        {/* Help text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('needHelp')}{' '}
            <a href="mailto:support@shinkofa.com" className="text-shinkofa-marine dark:text-secondary-300 hover:underline">
              {t('contactSupport')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-shinkofa-marine dark:border-secondary-400"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
