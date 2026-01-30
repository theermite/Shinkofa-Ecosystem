/**
 * Analyze Button Component
 * Shinkofa Platform - Frontend
 *
 * Triggers holistic profile analysis and navigates to results
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuth, getAccessToken } from '@/contexts/AuthContext'

interface AnalyzeButtonProps {
  sessionId: string
  disabled?: boolean
}

const motivationalPhrases = [
  "🌟 Analyse de vos réponses en cours...",
  "✨ L'IA explore votre profil holistique...",
  "🔮 Interprétation des dimensions psychologiques...",
  "🌈 Synthèse de vos forces et opportunités...",
  "💫 Connexion des dimensions corps-esprit-âme...",
  "🎯 Identification de vos axes de développement...",
  "🌺 Harmonisation de votre profil énergétique...",
  "🧘‍♀️ Intégration des sagesses ancestrales...",
]

export function AnalyzeButton({ sessionId, disabled = false }: AnalyzeButtonProps) {
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentPhrase, setCurrentPhrase] = useState(0)
  const router = useRouter()
  const { user } = useAuth()

  const apiUrl = process.env.NEXT_PUBLIC_API_SHIZEN_URL || 'https://localhost:8001/api'

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setError(null)
    setProgress(0)
    setCurrentPhrase(0)

    // Verify authentication
    if (!user) {
      setError('Vous devez être connecté pour générer votre synthèse.')
      setAnalyzing(false)
      return
    }

    const token = getAccessToken()
    if (!token) {
      setError('Session expirée. Veuillez vous reconnecter.')
      setAnalyzing(false)
      return
    }

    // Progress simulation (phrase rotation every 8 seconds)
    const phraseInterval = setInterval(() => {
      setCurrentPhrase(prev => (prev + 1) % motivationalPhrases.length)
    }, 8000)

    // Progress bar animation (smooth progress over estimated 2-5 minutes)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev // Stop at 95% until real completion
        return prev + 1
      })
    }, 1500) // Increment every 1.5 seconds

    try {
      const response = await fetch(
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

      clearInterval(phraseInterval)
      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Analysis failed')
      }

      const profile = await response.json()

      // Complete progress
      setProgress(100)

      // Navigate to results page after brief delay
      setTimeout(() => {
        router.push(`/questionnaire/results/${sessionId}`)
      }, 500)
    } catch (error) {
      clearInterval(phraseInterval)
      clearInterval(progressInterval)
      console.error('Analysis error:', error)
      setError(error instanceof Error ? error.message : 'Analysis failed')
      setAnalyzing(false)
      setProgress(0)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        variant="primary"
        size="lg"
        onClick={handleAnalyze}
        disabled={disabled || analyzing}
        className="w-full text-lg py-6"
      >
        {analyzing ? (
          <>
            <span className="animate-spin mr-2 text-2xl">🔮</span>
            Génération de votre synthèse holistique...
          </>
        ) : (
          <>
            <span className="mr-2 text-2xl">✨</span>
            Générer ma Synthèse Holistique
          </>
        )}
      </Button>

      {analyzing && (
        <div className="text-center space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Percentage */}
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {progress}%
          </p>

          {/* Motivational Phrase */}
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300 animate-fade-in">
            {motivationalPhrases[currentPhrase]}
          </p>

          {/* Warning - Do not close */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 dark:bg-amber-800/50 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-900 dark:text-amber-200 text-base">
                  Ne fermez pas cette fenêtre !
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  L'analyse est en cours. Si la barre reste à 95%, c'est normal — l'IA finalise votre synthèse.
                </p>
              </div>
            </div>
          </div>

          {/* Info Text */}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Processus d'analyse en cours, cela peut prendre 2-5 minutes.<br />
            L'IA analyse toutes vos réponses et les interprète pour établir<br />
            la synthèse holistique de votre profil de manière approfondie.
          </p>

          {/* Animated Icons */}
          <div className="flex justify-center gap-2">
            <span className="animate-bounce text-2xl">📊</span>
            <span className="animate-bounce delay-100 text-2xl">🧠</span>
            <span className="animate-bounce delay-200 text-2xl">🌈</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-red-900 dark:text-red-100">Erreur d'analyse</h4>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
