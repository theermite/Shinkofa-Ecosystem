'use client'

import { useAuth } from '@/hooks/useAuth'
import { getAccessToken } from '@/contexts/AuthContext'
import { useHolisticProfileByUser, useDeleteHolisticProfile } from '@/hooks/api/useHolisticProfile'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { PsychologicalCard } from '@/components/profile/PsychologicalCard'
import { NeurodivergenceCard } from '@/components/profile/NeurodivergenceCard'
import { ShinkofaCard } from '@/components/profile/ShinkofaCard'
import { DesignHumanCard } from '@/components/profile/DesignHumanCard'
import { AstrologyCard } from '@/components/profile/AstrologyCard'
import { NumerologyCard } from '@/components/profile/NumerologyCard'
import { NameAnalysisCard } from '@/components/profile/NameAnalysisCard'
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer'
import { HolisticProfileWarning } from '@/components/profile/HolisticProfileWarning'
import { ShizenEnrichButton } from '@/components/profile/ShizenEnrichButton'

type TabType = 'synthesis' | 'psychological' | 'neurodivergence' | 'shinkofa' | 'design_human' | 'astrology' | 'numerology' | 'name_analysis' | 'recommendations'

export default function HolisticProfilePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { userId, isInitialized } = useAuth()
  const { data: profile, isLoading, error, refetch } = useHolisticProfileByUser(userId || '', !!userId)
  const deleteProfileMutation = useDeleteHolisticProfile()
  const [activeTab, setActiveTab] = useState<TabType>('synthesis')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteQuestionnaire, setDeleteQuestionnaire] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_SHIZEN_URL || 'https://app.shinkofa.com/api'

  const handleRegenerateProfile = async () => {
    if (!profile?.session_id || !userId) {
      alert('Session introuvable. Veuillez refaire le questionnaire.')
      return
    }

    if (!confirm('Régénérer le profil holistique ? Cela peut prendre 2-5 minutes.')) {
      return
    }

    setIsRegenerating(true)
    try {
      const token = getAccessToken()
      if (!token) {
        alert('Session expirée. Veuillez vous reconnecter.')
        return
      }

      // Call the analyze endpoint to regenerate
      const response = await fetch(
        `${apiUrl}/questionnaire/analyze/${profile.session_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-User-ID': userId,
          },
        }
      )

      if (response.ok) {
        // Invalidate cache and refetch
        queryClient.invalidateQueries({ queryKey: ['holistic-profiles'] })
        await refetch()
        alert('✅ Profil régénéré avec succès !')
      } else {
        const error = await response.json()
        throw new Error(error.detail || 'Échec de la régénération')
      }
    } catch (error) {
      console.error('Failed to regenerate profile:', error)
      alert(`Erreur: ${error instanceof Error ? error.message : 'Échec de la régénération'}`)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleDeleteProfile = async () => {
    if (!userId) return

    setIsDeleting(true)
    try {
      await deleteProfileMutation.mutateAsync({
        userId,
        deleteQuestionnaire,
      })
      setShowDeleteModal(false)
      // Redirect to questionnaire page after successful deletion
      router.push('/questionnaire')
    } catch (error) {
      console.error('Failed to delete profile:', error)
      alert('Erreur lors de la suppression du profil. Veuillez réessayer.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Chargement de ton profil holistique...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-2xl">
          <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">
            📋 Profil Holistique non disponible
          </h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Tu n'as pas encore complété le questionnaire holistique Shinkofa. Découvre ton profil complet en répondant aux questions !
          </p>
          <Link
            href="/questionnaire"
            className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
          >
            📝 Commencer le questionnaire
          </Link>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'synthesis' as TabType, label: 'Synthèse', icon: '✨', available: !!profile.synthesis },
    { id: 'psychological' as TabType, label: 'Psychologie', icon: '🧠', available: !!profile.psychological_analysis },
    { id: 'neurodivergence' as TabType, label: 'Neurodivergence', icon: '🌈', available: !!profile.neurodivergence_analysis },
    { id: 'shinkofa' as TabType, label: 'Shinkofa', icon: '🌟', available: !!profile.shinkofa_analysis },
    { id: 'design_human' as TabType, label: 'Design Humain', icon: '⚡', available: !!profile.design_human },
    { id: 'astrology' as TabType, label: 'Astrologie', icon: '♈', available: !!(profile.astrology_western && profile.astrology_chinese) },
    { id: 'numerology' as TabType, label: 'Numérologie', icon: '🔢', available: !!profile.numerology },
    { id: 'name_analysis' as TabType, label: 'Nom & Prénom', icon: '📛', available: !!(profile.numerology?.active && profile.numerology?.hereditary) },
    { id: 'recommendations' as TabType, label: 'Recommandations', icon: '💡', available: !!profile.recommendations },
  ].filter(tab => tab.available)

  return (
    <>
      {/* Warning Modal - First time only */}
      <HolisticProfileWarning />

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 mb-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl">🌟</span> Mon Profil Holistique Shinkofa
              </h1>
              <p className="text-white/90 text-sm sm:text-base lg:text-lg">
                Généré le {new Date(profile.generated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} à {new Date(profile.generated_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={handleRegenerateProfile}
                disabled={isRegenerating}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-green-500/80 hover:bg-green-600 border border-green-300 text-white rounded-lg transition text-sm sm:text-base font-medium disabled:opacity-50 flex items-center gap-1.5 sm:gap-2"
              >
                {isRegenerating ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Régénération...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>🔄 <span className="hidden sm:inline">Régénérer</span></>
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-red-500/80 hover:bg-red-600 border border-red-300 text-white rounded-lg transition text-sm sm:text-base font-medium"
              >
                🗑️ <span className="hidden sm:inline">Supprimer</span>
              </button>
              <Link
                href="/profile"
                className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white/20 hover:bg-white/30 border border-white text-white rounded-lg transition text-sm sm:text-base font-medium"
              >
                ← <span className="hidden sm:inline">Retour au profil</span><span className="sm:hidden">Profil</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6 p-2">
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'synthesis' && profile.synthesis && (
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl shadow-2xl p-10 mb-8 border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl shadow-lg">
                    ✨
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Synthèse Holistique Personnalisée
                  </h2>
                </div>
                <ShizenEnrichButton
                  sectionId="synthesis"
                  sectionLabel="Synthèse"
                  profileId={profile.id}
                  onEnrichmentComplete={() => refetch()}
                />
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-purple-300 dark:border-purple-700">
                <MarkdownRenderer
                  content={profile.synthesis}
                  className="text-gray-800 dark:text-gray-200 leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === 'psychological' && profile.psychological_analysis && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <ShizenEnrichButton
                  sectionId="psychological"
                  sectionLabel="Psychologie"
                  profileId={profile.id}
                  onEnrichmentComplete={() => refetch()}
                />
              </div>
              <PsychologicalCard data={profile.psychological_analysis} />
            </div>
          )}

          {activeTab === 'neurodivergence' && profile.neurodivergence_analysis && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <ShizenEnrichButton
                  sectionId="neurodivergence"
                  sectionLabel="Neurodivergence"
                  profileId={profile.id}
                  onEnrichmentComplete={() => refetch()}
                />
              </div>
              <NeurodivergenceCard data={profile.neurodivergence_analysis} />
            </div>
          )}

          {activeTab === 'shinkofa' && profile.shinkofa_analysis && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <ShizenEnrichButton
                  sectionId="shinkofa"
                  sectionLabel="Shinkofa"
                  profileId={profile.id}
                  onEnrichmentComplete={() => refetch()}
                />
              </div>
              <ShinkofaCard data={profile.shinkofa_analysis} />
            </div>
          )}

          {activeTab === 'design_human' && profile.design_human && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <ShizenEnrichButton
                  sectionId="design_human"
                  sectionLabel="Design Humain"
                  profileId={profile.id}
                  onEnrichmentComplete={() => refetch()}
                />
              </div>
              <DesignHumanCard data={profile.design_human} />
            </div>
          )}

          {activeTab === 'astrology' && profile.astrology_western && profile.astrology_chinese && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <ShizenEnrichButton
                  sectionId="astrology"
                  sectionLabel="Astrologie"
                  profileId={profile.id}
                  onEnrichmentComplete={() => refetch()}
                />
              </div>
              <AstrologyCard western={profile.astrology_western} chinese={profile.astrology_chinese} />
            </div>
          )}

          {activeTab === 'numerology' && profile.numerology && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <ShizenEnrichButton
                  sectionId="numerology"
                  sectionLabel="Numérologie"
                  profileId={profile.id}
                  onEnrichmentComplete={() => refetch()}
                />
              </div>
              <NumerologyCard data={profile.numerology} />
            </div>
          )}

          {activeTab === 'name_analysis' && profile.numerology?.active !== undefined && profile.numerology?.hereditary !== undefined && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <ShizenEnrichButton
                  sectionId="name_analysis"
                  sectionLabel="Analyse du Nom"
                  profileId={profile.id}
                  onEnrichmentComplete={() => refetch()}
                />
              </div>
              <NameAnalysisCard data={{
                active: profile.numerology.active,
                hereditary: profile.numerology.hereditary,
                first_name: profile.numerology.first_name,
                last_name: profile.numerology.last_name,
                first_name_analysis: profile.numerology.first_name_analysis,
                last_name_analysis: profile.numerology.last_name_analysis,
                name_holistic_analysis: profile.numerology.name_holistic_analysis,
                interpretations: {
                  active: profile.numerology.interpretations?.active || { keyword: 'unknown', traits: [] },
                  hereditary: profile.numerology.interpretations?.hereditary || { keyword: 'unknown', traits: [] },
                },
              }} />
            </div>
          )}

          {activeTab === 'recommendations' && profile.recommendations && (
            <div className="space-y-6">
              {/* Enrich Button */}
              <div className="flex justify-end">
                <ShizenEnrichButton
                  sectionId="recommendations"
                  sectionLabel="Recommandations"
                  profileId={profile.id}
                  onEnrichmentComplete={() => refetch()}
                />
              </div>
              {/* Header Section */}
              <div className="bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 rounded-2xl shadow-2xl p-10 border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center text-4xl shadow-lg">
                    💡
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Recommandations Personnalisées
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Basées sur votre profil holistique complet Shinkofa
                    </p>
                  </div>
                </div>
                <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>🎯</span> Comment utiliser ces recommandations
                  </h3>
                  <div className="space-y-3 text-gray-700 dark:text-gray-300">
                    <p>
                      Ces recommandations ont été générées en croisant les multiples dimensions de votre profil : votre Design Humain, votre astrologie, votre numérologie, votre psychologie, et vos analyses neurodivergentes. Elles sont spécifiquement adaptées à qui vous êtes dans votre unicité.
                    </p>
                    <p>
                      <strong>Important :</strong> Ces recommandations ne sont pas des règles rigides à suivre aveuglément. Elles sont des pistes de réflexion et d'expérimentation basées sur votre design unique. Testez-les, observez ce qui résonne, et ajustez selon votre propre expérience et vos besoins du moment.
                    </p>
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">
                      💡 Astuce : Commencez par une ou deux recommandations qui vous parlent particulièrement, plutôt que d'essayer de tout appliquer en même temps. L'intégration progressive est plus durable que le changement radical.
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Recommendations */}
              <div className="grid grid-cols-1 gap-6">
                {profile.recommendations.task_organization && profile.recommendations.task_organization.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border-2 border-green-300 dark:border-green-700 shadow-lg">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                        <span className="text-3xl">📋</span> Organisation des Tâches & Productivité
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Ces recommandations sont adaptées à votre type énergétique, votre fonctionnement cognitif unique, et votre manière naturelle d'aborder le travail et les responsabilités. Elles prennent en compte votre besoin d'autonomie ou de collaboration, votre rythme naturel, et vos forces cognitives.
                      </p>
                    </div>
                    <div className="space-y-5">
                      {profile.recommendations.task_organization.map((rec: any, idx: number) => (
                        <div key={idx} className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-l-4 border-green-600 shadow-md">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-2xl mt-1">✓</span>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                              {rec.recommendation}
                            </h4>
                          </div>
                          <div className="ml-11 space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">Pourquoi cette recommandation ?</p>
                              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                {rec.rationale}
                              </p>
                            </div>
                            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">💡 Conseils pratiques d'application :</p>
                              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• Commencez progressivement - intégrez cette recommandation sur 1-2 semaines</li>
                                <li>• Observez comment cela impacte votre énergie, votre productivité et votre bien-être</li>
                                <li>• Ajustez selon votre propre rythme et vos contraintes réelles</li>
                                <li>• Notez ce qui fonctionne et ce qui ne fonctionne pas pour vous personnellement</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profile.recommendations.growth_areas && profile.recommendations.growth_areas.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border-2 border-teal-300 dark:border-teal-700 shadow-lg">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-teal-700 dark:text-teal-400 mb-3 flex items-center gap-2">
                        <span className="text-3xl">🌱</span> Axes de Croissance & Développement Personnel
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Ces axes de croissance ont été identifiés en analysant les patterns de votre profil complet. Ils représentent des domaines où vous avez un potentiel de développement important qui peut transformer significativement votre expérience de vie. Chaque recommandation est ancrée dans la compréhension profonde de votre design unique.
                      </p>
                    </div>
                    <div className="space-y-5">
                      {profile.recommendations.growth_areas.map((rec: any, idx: number) => (
                        <div key={idx} className="p-6 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border-l-4 border-teal-600 shadow-md">
                          <div className="flex items-start gap-3 mb-3">
                            <span className="text-2xl mt-1">🎯</span>
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                              {rec.recommendation}
                            </h4>
                          </div>
                          <div className="ml-11 space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-teal-700 dark:text-teal-400 mb-1">Pourquoi travailler sur cet axe ?</p>
                              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                                {rec.rationale}
                              </p>
                            </div>
                            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">🌟 Approche recommandée :</p>
                              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <li>• <strong>Conscience</strong> : Commencez simplement par observer ce pattern dans votre vie</li>
                                <li>• <strong>Expérimentation</strong> : Testez de petits ajustements sans pression de perfection</li>
                                <li>• <strong>Patience</strong> : La croissance authentique prend du temps - soyez bienveillant avec vous-même</li>
                                <li>• <strong>Support</strong> : Considérez de travailler cet axe avec un coach, thérapeute ou groupe de soutien si nécessaire</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lifestyle & Bien-être Section - Based on Human Design */}
              {profile.design_human && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border-2 border-rose-300 dark:border-rose-700 shadow-lg">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                      <span className="text-3xl">🌸</span> Lifestyle & Bien-être
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Ces conseils sont issus de votre Design Humain et vous guident vers un mode de vie aligné avec votre nature profonde : alimentation, environnement, couleurs et rythme de vie.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Digestion - Alimentation */}
                    {profile.design_human.variable && profile.design_human.variable.length >= 7 && (
                      <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl border-l-4 border-rose-500">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">🍽️</span>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">Alimentation Idéale</h4>
                        </div>
                        <div className="space-y-3 text-gray-700 dark:text-gray-300">
                          {profile.design_human.variable[5] === 'L' ? (
                            <>
                              <p className="font-medium text-rose-700 dark:text-rose-400">🎯 Digestion Sélective</p>
                              <ul className="text-sm space-y-2">
                                <li>• <strong>Un type d'aliment à la fois</strong> — évitez les mélanges complexes</li>
                                <li>• <strong>Environnement calme</strong> — mangez sans distractions (TV, téléphone)</li>
                                <li>• <strong>Horaires réguliers</strong> — votre corps aime la routine alimentaire</li>
                                <li>• <strong>Petites portions</strong> — qualité plutôt que quantité</li>
                                <li>• <strong>Aliments simples</strong> — préférez les plats mono-ingrédient</li>
                              </ul>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-rose-700 dark:text-rose-400">🌈 Digestion Ouverte</p>
                              <ul className="text-sm space-y-2">
                                <li>• <strong>Variété d'aliments</strong> — mélangez les saveurs et textures</li>
                                <li>• <strong>Stimulation pendant les repas</strong> — conversation, musique, lecture</li>
                                <li>• <strong>Flexibilité horaire</strong> — mangez quand vous avez faim</li>
                                <li>• <strong>Contextes variés</strong> — restaurants, pique-niques, repas sociaux</li>
                                <li>• <strong>Exploration culinaire</strong> — nouvelles cuisines et recettes</li>
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Environnement - Lieu de vie */}
                    {profile.design_human.variable && profile.design_human.variable.length >= 7 && (
                      <div className="p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border-l-4 border-violet-500">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl">🏠</span>
                          <h4 className="font-bold text-lg text-gray-900 dark:text-white">Environnement Idéal</h4>
                        </div>
                        <div className="space-y-3 text-gray-700 dark:text-gray-300">
                          {profile.design_human.variable[6] === 'L' ? (
                            <>
                              <p className="font-medium text-violet-700 dark:text-violet-400">🎯 Environnement Sélectif</p>
                              <ul className="text-sm space-y-2">
                                <li>• <strong>Espace personnel défini</strong> — bureau dédié, coin à vous</li>
                                <li>• <strong>Contrôle de l'ambiance</strong> — lumière, température, bruit</li>
                                <li>• <strong>Peu de changements</strong> — stabilité dans votre cadre de vie</li>
                                <li>• <strong>Choix intentionnel</strong> — chaque objet a sa place et son sens</li>
                                <li>• <strong>Limites claires</strong> — séparez espaces de travail et détente</li>
                              </ul>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-violet-700 dark:text-violet-400">🌈 Environnement Ouvert</p>
                              <ul className="text-sm space-y-2">
                                <li>• <strong>Espaces partagés</strong> — coworking, cafés, bibliothèques</li>
                                <li>• <strong>Mouvement et vie</strong> — gens qui passent, animation</li>
                                <li>• <strong>Changement régulier</strong> — réaménagez, déplacez-vous</li>
                                <li>• <strong>Multi-usage</strong> — même espace pour différentes activités</li>
                                <li>• <strong>Stimulation visuelle</strong> — couleurs, plantes, art</li>
                              </ul>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Couleurs énergétiques basées sur le Type */}
                    <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border-l-4 border-amber-500">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🎨</span>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">Couleurs & Énergies</h4>
                      </div>
                      <div className="space-y-3 text-gray-700 dark:text-gray-300">
                        {(() => {
                          const type = profile.design_human.type?.toLowerCase()
                          if (type?.includes('generator') || type?.includes('générateur')) {
                            return (
                              <>
                                <p className="font-medium text-amber-700 dark:text-amber-400">⚡ Énergies du Générateur</p>
                                <ul className="text-sm space-y-2">
                                  <li>• <strong>Couleurs chaudes</strong> — orange, rouge, jaune (énergie sacrale)</li>
                                  <li>• <strong>Vert nature</strong> — pour la régénération</li>
                                  <li>• <strong>Évitez</strong> — trop de gris/noir qui éteignent votre vitalité</li>
                                </ul>
                              </>
                            )
                          } else if (type?.includes('projector') || type?.includes('projecteur')) {
                            return (
                              <>
                                <p className="font-medium text-amber-700 dark:text-amber-400">🔮 Énergies du Projecteur</p>
                                <ul className="text-sm space-y-2">
                                  <li>• <strong>Bleu profond</strong> — sagesse et reconnaissance</li>
                                  <li>• <strong>Violet/mauve</strong> — intuition et guidance</li>
                                  <li>• <strong>Blanc/crème</strong> — clarté et réceptivité</li>
                                </ul>
                              </>
                            )
                          } else if (type?.includes('manifestor') || type?.includes('manifesteur')) {
                            return (
                              <>
                                <p className="font-medium text-amber-700 dark:text-amber-400">🔥 Énergies du Manifesteur</p>
                                <ul className="text-sm space-y-2">
                                  <li>• <strong>Rouge/bordeaux</strong> — pouvoir d'initiation</li>
                                  <li>• <strong>Noir élégant</strong> — mystère et impact</li>
                                  <li>• <strong>Or/bronze</strong> — leadership naturel</li>
                                </ul>
                              </>
                            )
                          } else if (type?.includes('reflector') || type?.includes('réflecteur')) {
                            return (
                              <>
                                <p className="font-medium text-amber-700 dark:text-amber-400">🌙 Énergies du Réflecteur</p>
                                <ul className="text-sm space-y-2">
                                  <li>• <strong>Argent/gris perle</strong> — reflet de la lune</li>
                                  <li>• <strong>Toutes les couleurs</strong> — selon le cycle lunaire</li>
                                  <li>• <strong>Couleurs changeantes</strong> — variez selon votre humeur</li>
                                </ul>
                              </>
                            )
                          }
                          return (
                            <p className="text-sm italic">Couleurs basées sur votre type énergétique</p>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Rythme de vie basé sur la Stratégie */}
                    <div className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-xl border-l-4 border-cyan-500">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⏰</span>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">Rythme de Vie</h4>
                      </div>
                      <div className="space-y-3 text-gray-700 dark:text-gray-300">
                        <p className="font-medium text-cyan-700 dark:text-cyan-400">📅 Votre tempo naturel</p>
                        <ul className="text-sm space-y-2">
                          {profile.design_human.strategy && (
                            <li>• <strong>Stratégie</strong> : {profile.design_human.strategy}</li>
                          )}
                          {profile.design_human.authority && (
                            <li>• <strong>Décisions</strong> : Écoutez votre {profile.design_human.authority.toLowerCase().includes('emotional') ? 'vague émotionnelle (attendez la clarté)' : profile.design_human.authority.toLowerCase().includes('sacral') ? 'réponse sacrale (oui/non viscéral)' : profile.design_human.authority.toLowerCase().includes('splenic') ? 'intuition splénique (instant présent)' : 'autorité intérieure'}</li>
                          )}
                          {profile.design_human.signature && (
                            <li>• <strong>Quand aligné</strong> : Vous ressentez {profile.design_human.signature.toLowerCase()}</li>
                          )}
                          {profile.design_human.not_self && (
                            <li>• <strong>Signal d'alerte</strong> : {profile.design_human.not_self}</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-rose-100/50 dark:bg-rose-900/20 rounded-lg">
                    <p className="text-sm text-rose-800 dark:text-rose-200 italic">
                      💡 Ces conseils lifestyle sont basés sur votre Design Humain. Pour un approfondissement, consultez l'onglet "Design Humain" de votre profil où vous trouverez les détails de votre Variable (4 flèches PHS).
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Guidance Section */}
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-xl p-8 border-2 border-amber-200 dark:border-amber-800">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">🧭</span> Naviguer votre Chemin de Développement
                </h3>
                <div className="space-y-4 text-gray-700 dark:text-gray-300">
                  <p>
                    Votre profil holistique Shinkofa est un outil puissant de connaissance de soi, mais c'est vous qui êtes l'expert de votre propre vie. Ces recommandations sont des invitations à explorer, pas des obligations à suivre rigidement.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                      <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-2">✅ Faites :</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Expérimenter avec curiosité et ouverture</li>
                        <li>• Ajuster selon votre intuition et vos besoins</li>
                        <li>• Célébrer les petits progrès et victoires</li>
                        <li>• Revenir régulièrement à ces recommandations</li>
                        <li>• Partager vos découvertes avec des personnes de confiance</li>
                      </ul>
                    </div>
                    <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4">
                      <h4 className="font-bold text-red-700 dark:text-red-400 mb-2">❌ Évitez :</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• De vous juger si vous ne suivez pas "parfaitement"</li>
                        <li>• D'essayer de tout changer d'un coup</li>
                        <li>• De vous forcer dans ce qui ne résonne pas</li>
                        <li>• De comparer votre chemin à celui des autres</li>
                        <li>• D'utiliser ces recommandations comme arme contre vous-même</li>
                      </ul>
                    </div>
                  </div>
                  <p className="italic text-sm text-gray-600 dark:text-gray-400 mt-4">
                    💫 Rappelez-vous : Vous êtes unique, votre chemin est unique, et votre timing est parfait. Ces recommandations sont là pour vous soutenir, pas pour vous contraindre. Utilisez-les comme des outils d'exploration et de découverte de vous-même, avec douceur et bienveillance.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to Profile Button */}
        <div className="flex justify-center mt-8">
          <Link
            href="/profile"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            ← Retour à mon profil
          </Link>
        </div>
      </div>

      {/* Regenerating Overlay */}
      {isRegenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-lg w-full mx-4 text-center">
            <div className="text-6xl mb-6 animate-bounce">✨</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Régénération en cours...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              L'IA analyse à nouveau vos réponses pour créer un nouveau profil holistique personnalisé.
            </p>
            <div className="flex justify-center gap-3 mb-4">
              <span className="animate-bounce text-3xl" style={{ animationDelay: '0ms' }}>🧠</span>
              <span className="animate-bounce text-3xl" style={{ animationDelay: '100ms' }}>💫</span>
              <span className="animate-bounce text-3xl" style={{ animationDelay: '200ms' }}>🌈</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 animate-pulse rounded-full w-3/4" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              Cela peut prendre 2-5 minutes. Ne fermez pas cette fenêtre.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-3xl">
                ⚠️
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Supprimer le profil holistique ?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Cette action est irréversible
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                En supprimant ton profil holistique, tu pourras en générer un nouveau à partir du questionnaire.
              </p>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={deleteQuestionnaire}
                    onChange={(e) => setDeleteQuestionnaire(e.target.checked)}
                    className="mt-1 h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                  <div>
                    <span className="font-semibold text-amber-800 dark:text-amber-300 block">
                      Supprimer aussi les réponses du questionnaire
                    </span>
                    <span className="text-sm text-amber-700 dark:text-amber-400">
                      Si coché, tu devras re-remplir le questionnaire complet (144 questions). Sinon, seul le profil sera supprimé et tu pourras relancer l'analyse.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteQuestionnaire(false)
                }}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Suppression...
                  </>
                ) : (
                  <>🗑️ Confirmer la suppression</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
