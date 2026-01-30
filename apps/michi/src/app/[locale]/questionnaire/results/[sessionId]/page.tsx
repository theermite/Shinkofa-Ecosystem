'use client'

/**
 * Questionnaire Results Page
 * Shinkofa Platform - Display Holistic Profile & Synthesis (Professional UI)
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { PsychologicalCard } from '@/components/profile/PsychologicalCard'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'
import { NeurodivergenceCard } from '@/components/profile/NeurodivergenceCard'
import { ShinkofaCard } from '@/components/profile/ShinkofaCard'
import { DesignHumanCard } from '@/components/profile/DesignHumanCard'
import { AstrologyCard } from '@/components/profile/AstrologyCard'
import { NumerologyCard } from '@/components/profile/NumerologyCard'
import { useAuth, getAccessToken } from '@/contexts/AuthContext'

interface HolisticProfile {
  id: string
  user_id: string
  session_id: string
  psychological_analysis: any
  neurodivergence_analysis: any
  shinkofa_analysis: any
  design_human: any
  astrology_western: any
  astrology_chinese: any
  numerology: any
  synthesis: string
  recommendations: any
  generated_at: string
}

export default function QuestionnaireResultsPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  const { user } = useAuth()

  const [profile, setProfile] = useState<HolisticProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_SHIZEN_URL || 'http://localhost:8001'

  useEffect(() => {
    if (!user?.id) return
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  async function loadProfile() {
    try {
      setLoading(true)
      setError(null)

      // Verify authentication
      if (!user) {
        throw new Error('Vous devez être connecté pour voir votre profil.')
      }

      const token = getAccessToken()
      if (!token) {
        throw new Error('Session expirée. Veuillez vous reconnecter.')
      }

      const response = await fetch(
        `${apiUrl}/questionnaire/profile/${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-User-ID': user.id,
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Échec du chargement du profil')
      }

      const data = await response.json()
      setProfile(data)
    } catch (err) {
      console.error('Load profile error:', err)
      setError(err instanceof Error ? err.message : 'Échec du chargement du profil')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900">
        <div className="text-center">
          <div className="text-8xl mb-6 animate-bounce">🔮</div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-shinkofa-marine mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
            Chargement de votre profil holistique...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-900">
        <div className="max-w-md mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">Erreur</h2>
              <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
              <button
                onClick={loadProfile}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No profile found
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-yellow-900">
        <div className="max-w-md mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-8xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-100 mb-4">
              Profil non généré
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 text-lg">
              Aucun profil trouvé pour cette session. Avez-vous déclenché l'analyse ?
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-shinkofa-dark-bg dark:via-shinkofa-marine dark:to-gray-900 py-8 px-4">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl shadow-2xl p-10 text-center text-white relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 text-8xl">✨</div>
            <div className="absolute bottom-10 right-10 text-8xl">🌟</div>
            <div className="absolute top-1/2 left-1/4 text-6xl">💫</div>
            <div className="absolute top-1/4 right-1/4 text-6xl">⭐</div>
          </div>

          <div className="relative z-10">
            <div className="text-7xl mb-4 animate-pulse">🎉</div>
            <h1 className="text-5xl font-bold mb-4">
              Félicitations ! Votre Profil Holistique est Prêt
            </h1>
            <p className="text-xl text-white/90 mb-6 max-w-3xl mx-auto">
              Découvrez une analyse complète et unique qui combine psychologie, neurodivergences,
              philosophie Shinkofa, Design Humain, astrologie et numérologie.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <span className="text-2xl">📅</span>
                <span>Généré le {new Date(profile.generated_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {/* Synthesis Section */}
        {profile.synthesis && (
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl shadow-2xl p-10 mb-8 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-shinkofa-marine to-shinkofa-orange rounded-full flex items-center justify-center text-4xl shadow-lg">
                🌟
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Synthèse Holistique Personnalisée
              </h2>
            </div>
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-purple-300 dark:border-purple-700">
              <MarkdownRenderer
                content={profile.synthesis}
                className="text-gray-800 dark:text-gray-200 leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* Profile Components */}
        {profile.psychological_analysis && (
          <PsychologicalCard data={profile.psychological_analysis} />
        )}

        {profile.neurodivergence_analysis && (
          <NeurodivergenceCard data={profile.neurodivergence_analysis} />
        )}

        {profile.shinkofa_analysis && (
          <ShinkofaCard data={profile.shinkofa_analysis} />
        )}

        {profile.design_human && (
          <DesignHumanCard data={profile.design_human} />
        )}

        {(profile.astrology_western && profile.astrology_chinese) && (
          <AstrologyCard western={profile.astrology_western} chinese={profile.astrology_chinese} />
        )}

        {profile.numerology && (
          <NumerologyCard data={profile.numerology} />
        )}

        {/* Recommendations */}
        {profile.recommendations && (
          <div className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-2xl shadow-2xl p-10 mb-8 border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-4xl shadow-lg">
                💡
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Recommandations Personnalisées
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profile.recommendations.task_organization && profile.recommendations.task_organization.length > 0 && (
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-green-300 dark:border-green-700">
                  <h3 className="text-xl font-bold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📋</span> Organisation des Tâches
                  </h3>
                  <div className="space-y-4">
                    {profile.recommendations.task_organization.map((rec: any, idx: number) => (
                      <div key={idx} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                          {rec.recommendation}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rec.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {profile.recommendations.growth_areas && profile.recommendations.growth_areas.length > 0 && (
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-teal-300 dark:border-teal-700">
                  <h3 className="text-xl font-bold text-teal-700 dark:text-teal-400 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🌱</span> Axes de Croissance
                  </h3>
                  <div className="space-y-4">
                    {profile.recommendations.growth_areas.map((rec: any, idx: number) => (
                      <div key={idx} className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border-l-4 border-teal-500">
                        <p className="font-semibold text-gray-900 dark:text-white mb-2">
                          {rec.recommendation}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {rec.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA to Full Profile */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-2xl shadow-2xl p-10 mb-8 text-center text-white">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-3xl font-bold mb-4">
            Explorez Votre Profil Holistique Complet
          </h2>
          <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            Accédez à votre profil détaillé avec visualisations interactives, analyses approfondies
            et outils de développement personnel.
          </p>
          <Link
            href="/profile/holistic"
            className="inline-block px-8 py-4 bg-white text-purple-600 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🔍 Voir mon profil holistique complet
          </Link>
        </div>

        {/* Info Footer */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Profil généré le <strong>{new Date(profile.generated_at).toLocaleString('fr-FR')}</strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            © 2026 La Voie Shinkofa - Questionnaire Holistique Révolutionnaire
          </p>
        </div>
      </main>
    </div>
  )
}
