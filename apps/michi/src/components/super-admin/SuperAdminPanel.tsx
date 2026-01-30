/**
 * Super Admin Panel
 * Control panel for super admin debugging features
 */

'use client'

import { useSuperAdmin } from '@/contexts/SuperAdminContext'
import { useState } from 'react'
import Link from 'next/link'

export function SuperAdminPanel() {
  const {
    isSuperAdmin,
    isActive,
    session,
    isPanelOpen,
    setPanelOpen,
    toggleMode,
    simulatePlan,
    setQuestionnaireOptional,
  } = useSuperAdmin()

  const [isChangingPlan, setIsChangingPlan] = useState(false)

  if (!isSuperAdmin || !isPanelOpen) return null

  async function handleToggleMode() {
    await toggleMode(!isActive)
  }

  async function handlePlanChange(plan: 'free' | 'samourai' | 'sensei' | null) {
    setIsChangingPlan(true)
    try {
      await simulatePlan(plan)
    } finally {
      setIsChangingPlan(false)
    }
  }

  async function handleQuestionnaireToggle() {
    await setQuestionnaireOptional(!session?.questionnaire_all_optional)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={() => setPanelOpen(false)}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900 text-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔧</span>
              <div>
                <h2 className="text-xl font-bold">Super Admin</h2>
                <p className="text-sm text-purple-100">Debug & Testing Mode</p>
              </div>
            </div>
            <button
              onClick={() => setPanelOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Admin Dashboard Link */}
          <Link
            href="/admin"
            className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <span className="text-xl">👥</span>
            <span>Dashboard Admin</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>

          {/* Activation Toggle */}
          <section className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span>🎮</span>
              <span>Mode Activation</span>
            </h3>
            <button
              onClick={handleToggleMode}
              className={`
                w-full px-6 py-3 rounded-lg font-semibold
                transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                }
              `}
            >
              {isActive ? '🛑 Désactiver Super Admin' : '✅ Activer Super Admin'}
            </button>
            {isActive && (
              <p className="text-sm text-green-400 mt-2 text-center">
                ✓ Mode actif depuis {session?.last_activated_at ? new Date(session.last_activated_at).toLocaleString('fr-FR') : 'maintenant'}
              </p>
            )}
          </section>

          {/* Plan Simulation */}
          {isActive && (
            <section className="bg-gray-800 rounded-lg p-4 border-2 border-purple-500">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>💎</span>
                <span>Simulation Plan</span>
              </h3>
              <div className="space-y-2">
                {[
                  { value: null, label: '🔄 Réel', desc: 'Utiliser mon vrai plan' },
                  { value: 'free', label: '🆓 Gratuit', desc: 'Fonctionnalités limitées' },
                  { value: 'samourai', label: '⚔️ Samouraï', desc: 'Accès intermédiaire' },
                  { value: 'sensei', label: '🥋 Sensei', desc: 'Accès premium complet' },
                ].map((plan) => (
                  <button
                    key={plan.label}
                    onClick={() => handlePlanChange(plan.value as any)}
                    disabled={isChangingPlan}
                    className={`
                      w-full text-left px-4 py-3 rounded-lg
                      transition-all duration-200
                      ${session?.simulated_plan === plan.value
                        ? 'bg-purple-600 border-2 border-purple-400 shadow-lg'
                        : 'bg-gray-700 border-2 border-gray-600 hover:bg-gray-600'
                      }
                      ${isChangingPlan ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="font-semibold">{plan.label}</div>
                    <div className="text-sm text-gray-300">{plan.desc}</div>
                  </button>
                ))}
              </div>
              {session?.simulated_plan && (
                <p className="text-xs text-purple-300 mt-3 text-center">
                  ⚠️ Les données réelles ne sont pas affectées
                </p>
              )}
            </section>
          )}

          {/* Questionnaire Overrides */}
          {isActive && (
            <section className="bg-gray-800 rounded-lg p-4 border-2 border-blue-500">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>📋</span>
                <span>Questionnaire</span>
              </h3>
              <button
                onClick={handleQuestionnaireToggle}
                className={`
                  w-full px-4 py-3 rounded-lg font-semibold
                  transition-all duration-200
                  ${session?.questionnaire_all_optional
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>Questions optionnelles</span>
                  <span className="text-2xl">
                    {session?.questionnaire_all_optional ? '✅' : '❌'}
                  </span>
                </div>
              </button>
              {session?.questionnaire_all_optional && (
                <p className="text-sm text-blue-300 mt-2">
                  ✓ Toutes les questions sont optionnelles<br/>
                  ✓ Navigation libre (avant/arrière)
                </p>
              )}
            </section>
          )}

          {/* Info Panel */}
          {isActive && session && (
            <section className="bg-gray-800 rounded-lg p-4 border-2 border-gray-700">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>ℹ️</span>
                <span>Informations</span>
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Session ID:</span>
                  <span className="font-mono text-xs">{session.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Créée:</span>
                  <span>{new Date(session.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Modifiée:</span>
                  <span>{new Date(session.updated_at).toLocaleTimeString('fr-FR')}</span>
                </div>
              </div>
            </section>
          )}

          {/* Warning */}
          {!isActive && (
            <section className="bg-yellow-900/30 border-2 border-yellow-600 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="text-sm">
                  <p className="font-semibold text-yellow-300 mb-1">Mode désactivé</p>
                  <p className="text-yellow-200">
                    Activez le mode Super Admin pour accéder aux fonctionnalités de test et debug.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
