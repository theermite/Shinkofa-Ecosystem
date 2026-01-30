'use client'

/**
 * Questionnaire Complete Page
 * Shinkofa Platform - Chart Upload & Analysis
 */

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth, getAccessToken } from '@/contexts/AuthContext'
import { ChartUpload } from '@/components/questionnaire/ChartUpload'
import { AnalyzeButton } from '@/components/questionnaire/AnalyzeButton'
import { Card, CardContent } from '@/components/ui/Card'

function CompletePageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('questionnaire.complete')
  const { user } = useAuth()
  const sessionId = searchParams.get('sessionId')
  const [autoAnalyzing, setAutoAnalyzing] = useState(false)
  const [profileCheckDone, setProfileCheckDone] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_SHIZEN_URL || 'https://localhost:8001/api'

  // Auto-trigger profile generation if not already done
  useEffect(() => {
    if (!sessionId || !user || profileCheckDone) return

    const checkAndGenerateProfile = async () => {
      try {
        const token = getAccessToken()
        if (!token) return

        // Check if profile already exists
        const profileResponse = await fetch(
          `${apiUrl}/questionnaire/profile/${sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-User-ID': user.id,
            },
          }
        )

        if (profileResponse.ok) {
          // Profile exists, redirect to results
          router.push(`/questionnaire/results/${sessionId}`)
          return
        }

        // Profile doesn't exist, auto-generate it
        setAutoAnalyzing(true)

        const analyzeResponse = await fetch(
          `${apiUrl}/questionnaire/analyze/${sessionId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'X-User-ID': user.id,
            },
          }
        )

        if (analyzeResponse.ok) {
          // Wait 2 seconds for UI feedback, then redirect
          setTimeout(() => {
            router.push(`/questionnaire/results/${sessionId}`)
          }, 2000)
        } else {
          console.error('❌ Profile generation failed')
          setAutoAnalyzing(false)
          setProfileCheckDone(true)
        }
      } catch (error) {
        console.error('Error in auto-profile generation:', error)
        setAutoAnalyzing(false)
        setProfileCheckDone(true)
      }
    }

    checkAndGenerateProfile()
  }, [sessionId, user, apiUrl, router, profileCheckDone])

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-900">
          <div className="max-w-md mx-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">{t('errorTitle')}</h2>
                <p className="text-red-700 dark:text-red-300">{t('errorMissingSession')}</p>
              </div>
            </div>
          </div>
        </div>
    )
  }

  // Show auto-analyzing state
  if (autoAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center">
            <div className="text-6xl mb-6 animate-bounce">✨</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Génération automatique de votre profil holistique
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              L'IA analyse vos 144 réponses pour créer votre synthèse holistique personnalisée...
            </p>

            {/* Progress animation */}
            <div className="space-y-6">
              <div className="flex justify-center gap-3">
                <span className="animate-bounce text-3xl delay-0">🧠</span>
                <span className="animate-bounce text-3xl delay-100">💫</span>
                <span className="animate-bounce text-3xl delay-200">🌈</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-pulse rounded-full w-3/4" />
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Cela peut prendre 2-5 minutes. Ne fermez pas cette fenêtre.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Success Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 mb-8 text-center transform transition-all duration-300 hover:shadow-3xl">
            <div className="text-8xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {t('subtitle')}
            </p>
            <div className="inline-block bg-primary-100 dark:bg-primary-900/20 px-4 py-2 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('sessionId')}: <code className="font-mono text-shinkofa-marine dark:text-secondary-200">{sessionId}</code>
              </p>
            </div>
          </div>

          {/* Instructions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">📋</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('nextSteps')}
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-shinkofa-marine to-shinkofa-orange rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('step1Title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t('step1Desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-shinkofa-orange to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('step2Title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t('step2Desc')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-secondary-100 dark:bg-secondary-900/20 rounded-xl">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-secondary-500 to-shinkofa-marine rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('step3Title')}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {t('step3Desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Upload Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📤</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('uploadTitle')}
              </h2>
            </div>
            <ChartUpload sessionId={sessionId} />
          </div>

          {/* Analyze Button Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔮</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('analyzeTitle')}
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10">
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-center text-lg">
                {t('analyzePrompt')}
              </p>
              <AnalyzeButton sessionId={sessionId} />
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl shadow-xl p-8">
            <div className="flex items-start gap-4">
              <span className="text-4xl" aria-hidden="true">💡</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {t('infoTitle')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t('infoDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>{t('copyright')}</p>
          </div>
        </div>
      </div>
  )
}

export default function QuestionnaireCompletePage() {
  const t = useTranslations('questionnaire.complete')

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shinkofa-marine mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
          </div>
        </div>
      }
    >
      <CompletePageContent />
    </Suspense>
  )
}
