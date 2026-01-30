/**
 * User Management Modal
 * Modale complète pour gérer un utilisateur avec actions en boutons
 */

'use client'

import { useState } from 'react'

interface UserSubscription {
  id: string | null
  tier: string | null
  status: string | null
  amount: number | null
  current_period_end: string | null
  custom_badge: string | null
}

interface AdminUser {
  id: string
  email: string
  username: string
  is_active: boolean
  email_verified: boolean
  is_super_admin: boolean
  is_pioneer: boolean
  pioneer_number: number | null
  last_login_at: string | null
  suspended_until: string | null
  admin_notes: string | null
  created_at: string
  subscription: UserSubscription | null
}

interface UserManagementModalProps {
  user: AdminUser
  onClose: () => void
  onToggleActive: () => void
  onForceVerifyEmail: () => void
  onResetPassword: () => void
  onSuspend: () => void
  onImpersonate: () => void
  onUpdateNotes: (notes: string | null) => void
  onUpdateSubscription: (tier: string, customBadge?: string) => void
}

const TIER_CONFIG: Record<string, { name: string; icon: string; color: string }> = {
  musha: { name: 'Musha', icon: '🥋', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  samurai: { name: 'Samurai', icon: '⚔️', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  samurai_famille: { name: 'Samurai+', icon: '⚔️', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  sensei: { name: 'Sensei', icon: '🏯', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  sensei_famille: { name: 'Sensei+', icon: '🏯', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  founder: { name: 'Fondateur', icon: '👑', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  none: { name: 'Free', icon: '👤', color: 'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
}

export default function UserManagementModal({
  user,
  onClose,
  onToggleActive,
  onForceVerifyEmail,
  onResetPassword,
  onSuspend,
  onImpersonate,
  onUpdateNotes,
  onUpdateSubscription,
}: UserManagementModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'subscription' | 'notes'>('info')
  const [notes, setNotes] = useState(user.admin_notes || '')
  const [tier, setTier] = useState(user.subscription?.tier || 'musha')
  const [customBadge, setCustomBadge] = useState(user.subscription?.custom_badge || '')
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set())

  const tierKey = user.subscription?.tier || 'none'
  const tierConfig = TIER_CONFIG[tierKey] || TIER_CONFIG.none
  const isSuspended = user.suspended_until && new Date(user.suspended_until) > new Date()

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const toggleAction = (action: string) => {
    setPendingActions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(action)) {
        newSet.delete(action)
      } else {
        newSet.add(action)
      }
      return newSet
    })
  }

  const applyActions = () => {
    if (pendingActions.has('toggle')) {
      onToggleActive()
    }
    if (pendingActions.has('verify')) {
      onForceVerifyEmail()
    }
    if (pendingActions.has('impersonate')) {
      onImpersonate()
    }
    setPendingActions(new Set())
    onClose()
  }

  const handleSaveNotes = () => {
    onUpdateNotes(notes.trim() || null)
    onClose()
  }

  const handleSaveSubscription = () => {
    onUpdateSubscription(tier, customBadge || undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {user.username}
                </h2>
                {user.is_super_admin && (
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full font-medium">
                    Admin
                  </span>
                )}
                {user.is_pioneer && (
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                    Pioneer #{user.pioneer_number?.toString().padStart(3, '0')}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-6">
          {[
            { id: 'info', label: 'Informations', icon: '📋' },
            { id: 'subscription', label: 'Abonnement', icon: '💳' },
            { id: 'notes', label: 'Notes', icon: '📝' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${user.is_active ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Compte</span>
                  </div>
                  <p className={`font-semibold ${user.is_active ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </p>
                </div>

                <div className={`p-4 rounded-xl ${user.email_verified ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{user.email_verified ? '✓' : '○'}</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Email</span>
                  </div>
                  <p className={`font-semibold ${user.email_verified ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`}>
                    {user.email_verified ? 'Verifie' : 'Non verifie'}
                  </p>
                </div>

                <div className={`p-4 rounded-xl ${tierConfig.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span>{tierConfig.icon}</span>
                    <span className="text-xs font-medium uppercase opacity-70">Plan</span>
                  </div>
                  <p className="font-semibold">{tierConfig.name}</p>
                  {user.subscription?.custom_badge && (
                    <p className="text-xs mt-1 opacity-80">✨ {user.subscription.custom_badge}</p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span>📅</span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Inscription</span>
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>

              {/* Last Login & Suspension */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Derniere connexion</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    {user.last_login_at ? formatDate(user.last_login_at) : 'Jamais'}
                  </span>
                </div>

                {isSuspended && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      <span className="font-medium">⏸️ Suspendu</span> jusqu'au {formatDate(user.suspended_until)}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Actions rapides</h3>
                <div className="grid grid-cols-2 gap-3">
                  {/* Toggle Active */}
                  <button
                    onClick={() => toggleAction('toggle')}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      pendingActions.has('toggle')
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <span className="text-xl">{user.is_active ? '🚫' : '✅'}</span>
                    <div className="text-left">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {user.is_active ? 'Desactiver' : 'Activer'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.is_active ? 'Bloquer l\'acces' : 'Restaurer l\'acces'}
                      </p>
                    </div>
                    {pendingActions.has('toggle') && (
                      <span className="ml-auto text-red-500">✓</span>
                    )}
                  </button>

                  {/* Verify Email */}
                  <button
                    onClick={() => toggleAction('verify')}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      pendingActions.has('verify')
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <span className="text-xl">{user.email_verified ? '📧' : '✉️'}</span>
                    <div className="text-left">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {user.email_verified ? 'Revoquer email' : 'Verifier email'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user.email_verified ? 'Marquer non verifie' : 'Marquer comme verifie'}
                      </p>
                    </div>
                    {pendingActions.has('verify') && (
                      <span className="ml-auto text-blue-500">✓</span>
                    )}
                  </button>

                  {/* Reset Password */}
                  <button
                    onClick={onResetPassword}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500 transition-all"
                  >
                    <span className="text-xl">🔑</span>
                    <div className="text-left">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">Reset mot de passe</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Email ou temporaire</p>
                    </div>
                  </button>

                  {/* Suspend */}
                  <button
                    onClick={onSuspend}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-orange-300 dark:hover:border-orange-500 transition-all"
                  >
                    <span className="text-xl">{isSuspended ? '🔓' : '⏸️'}</span>
                    <div className="text-left">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {isSuspended ? 'Lever suspension' : 'Suspendre'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isSuspended ? 'Restaurer l\'acces' : 'Bloquer temporairement'}
                      </p>
                    </div>
                  </button>

                  {/* Impersonate */}
                  <button
                    onClick={() => toggleAction('impersonate')}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all col-span-2 ${
                      pendingActions.has('impersonate')
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-500'
                    }`}
                  >
                    <span className="text-xl">👤</span>
                    <div className="text-left flex-1">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        Impersonner cet utilisateur
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Se connecter en tant que {user.username}
                      </p>
                    </div>
                    {pendingActions.has('impersonate') && (
                      <span className="ml-auto text-purple-500">✓</span>
                    )}
                  </button>
                </div>

                {/* Apply Actions Button */}
                {pendingActions.size > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={applyActions}
                      className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <span>✓</span>
                      Appliquer les actions sélectionnées ({pendingActions.size})
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Plan d'abonnement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(TIER_CONFIG).filter(([key]) => key !== 'none').map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => setTier(key)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        tier === key
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{config.icon}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{config.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Titre special (optionnel)
                </label>
                <input
                  type="text"
                  value={customBadge}
                  onChange={(e) => setCustomBadge(e.target.value)}
                  placeholder="Ex: Maitre Shinkofa, Co-Fondatrice..."
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleSaveSubscription}
                className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
              >
                Enregistrer les modifications
              </button>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Notes administrateur
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes internes sur cet utilisateur (visible uniquement par les admins)..."
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                {user.admin_notes && (
                  <button
                    onClick={() => {
                      setNotes('')
                      onUpdateNotes(null)
                      onClose()
                    }}
                    className="flex-1 py-3 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                  >
                    Supprimer les notes
                  </button>
                )}
                <button
                  onClick={handleSaveNotes}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
