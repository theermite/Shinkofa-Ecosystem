/**
 * User Edit Modal - Edit user profile (Super Admin only)
 */

import { useState, useEffect } from 'react'
import { Button, Badge } from '@/components/ui'
import userService from '@/services/userService'
import authService from '@/services/authService'
import type { User, UserUpdate } from '@/types/user'
import { UserRole } from '@/types/user'

interface UserEditModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onUserUpdated: () => void
}

export default function UserEditModal({ user, isOpen, onClose, onUserUpdated }: UserEditModalProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UserUpdate>({
    email: user.email,
    username: user.username,
    full_name: user.full_name || '',
    bio: user.bio || '',
    avatar_url: user.avatar_url || '',
    game_username: user.game_username || '',
    game_uid: user.game_uid || '',
    preferred_role: user.preferred_role || '',
    secondary_role: user.secondary_role || '',
    skill_level: user.skill_level || '',
    discord_username: user.discord_username || '',
    is_active: user.is_active,
  })
  const [selectedRole, setSelectedRole] = useState<string>(user.role)
  const [isSuperAdmin, setIsSuperAdmin] = useState(user.is_super_admin)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Load current user to check permissions
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Failed to load current user:', error)
      }
    }
    loadCurrentUser()
  }, [])

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: user.email,
        username: user.username,
        full_name: user.full_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || '',
        game_username: user.game_username || '',
        game_uid: user.game_uid || '',
        preferred_role: user.preferred_role || '',
        secondary_role: user.secondary_role || '',
        skill_level: user.skill_level || '',
        discord_username: user.discord_username || '',
        is_active: user.is_active,
      })
      setSelectedRole(user.role)
      setIsSuperAdmin(user.is_super_admin)
      setError(null)
    }
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Prepare update data - exclude username if not Super Admin
      const updateData = { ...formData }
      if (!currentUser?.is_super_admin) {
        delete updateData.username
      }

      // Update user profile
      await userService.updateUser(user.id, updateData)

      // Update role, super admin status, or active status if changed
      if (selectedRole !== user.role || isSuperAdmin !== user.is_super_admin || formData.is_active !== user.is_active) {
        await userService.changeUserRole(user.id, selectedRole, isSuperAdmin, formData.is_active)
      }

      onUserUpdated()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (!/\d/.test(newPassword)) {
      setError('Le mot de passe doit contenir au moins 1 chiffre')
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('Le mot de passe doit contenir au moins 1 lettre majuscule')
      return
    }

    if (!confirm(`Êtes-vous sûr de vouloir réinitialiser le mot de passe pour ${user.full_name || user.username} ?`)) {
      return
    }

    setIsLoading(true)

    try {
      await userService.resetUserPassword(user.id, newPassword)
      setShowResetPassword(false)
      setNewPassword('')
      setError(null)
      alert('✅ Mot de passe réinitialisé avec succès !')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la réinitialisation du mot de passe')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePermanentDelete = async () => {
    if (!confirm(`⚠️ ATTENTION ⚠️\n\nVoulez-vous vraiment SUPPRIMER DÉFINITIVEMENT cet utilisateur ?\n\nCette action est IRRÉVERSIBLE !\n\nUtilisateur : ${user.full_name || user.username} (@${user.username})`)) {
      return
    }

    if (!confirm('Êtes-vous ABSOLUMENT CERTAIN ? Cette suppression est permanente !')) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // permanent=true for hard delete
      await userService.deleteUser(user.id, true)
      onUserUpdated()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof UserUpdate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Validate email on change
    if (field === 'email') {
      if (value && !validateEmail(value)) {
        setEmailError('Format email invalide')
      } else {
        setEmailError(null)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-700 to-indigo-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Modifier l'utilisateur</h2>
              <p className="text-purple-100 mt-1">
                {user.full_name || user.username} (@{user.username})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informations de base
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                    emailError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                  }`}
                  placeholder="email@example.com"
                />
                {emailError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    ⚠️ {emailError}
                  </p>
                )}
              </div>

              {/* Username - Only editable by Super Admin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Username <span className="text-red-500">*</span>
                  {!currentUser?.is_super_admin && (
                    <span className="ml-2 text-xs text-gray-500">(Super Admin uniquement)</span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={e => handleChange('username', e.target.value)}
                  disabled={!currentUser?.is_super_admin}
                  className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    !currentUser?.is_super_admin
                      ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
                      : 'bg-white dark:bg-gray-700'
                  }`}
                  placeholder="username"
                />
                {!currentUser?.is_super_admin && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ℹ️ Seul un Super Admin peut modifier le username
                  </p>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom complet
              </label>
              <input
                type="text"
                value={formData.full_name || ''}
                onChange={e => handleChange('full_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Prénom Nom"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Biographie
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={e => handleChange('bio', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="À propos de cet utilisateur..."
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL Photo de profil
              </label>
              <input
                type="url"
                value={formData.avatar_url || ''}
                onChange={e => handleChange('avatar_url', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>

          {/* Gaming Profile */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🎮 Profil Gaming
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pseudo HOK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pseudo HOK
                </label>
                <input
                  type="text"
                  value={formData.game_username || ''}
                  onChange={e => handleChange('game_username', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="PseudoHOK"
                />
              </div>

              {/* UID HOK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  UID HOK (Player ID)
                </label>
                <input
                  type="text"
                  value={formData.game_uid || ''}
                  onChange={e => handleChange('game_uid', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rôle en jeu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rôle en jeu préféré
                </label>
                <select
                  value={formData.preferred_role || ''}
                  onChange={e => handleChange('preferred_role', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Roam/Support">Roam/Support</option>
                  <option value="ADC">ADC</option>
                  <option value="Jungle">Jungle</option>
                  <option value="Clash Lane">Clash Lane</option>
                  <option value="Mid Lane">Mid Lane</option>
                </select>
              </div>

              {/* Rôle secondaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rôle secondaire
                </label>
                <select
                  value={formData.secondary_role || ''}
                  onChange={e => handleChange('secondary_role', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Roam/Support">Roam/Support</option>
                  <option value="ADC">ADC</option>
                  <option value="Jungle">Jungle</option>
                  <option value="Clash Lane">Clash Lane</option>
                  <option value="Mid Lane">Mid Lane</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Niveau */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Niveau de compétence
                </label>
                <select
                  value={formData.skill_level || ''}
                  onChange={e => handleChange('skill_level', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Pseudo Discord */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pseudo Discord
              </label>
              <input
                type="text"
                value={formData.discord_username || ''}
                onChange={e => handleChange('discord_username', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="VotrePseudo#1234"
              />
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Rôle et Permissions
            </h3>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rôle <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={UserRole.JOUEUR}>Joueur</option>
                <option value={UserRole.COACH}>Coach</option>
                <option value={UserRole.MANAGER}>Manager</option>
                <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
              </select>
            </div>

            {/* Super Admin Flag */}
            <div className="flex items-start gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
              <input
                type="checkbox"
                id="is_super_admin"
                checked={isSuperAdmin}
                onChange={e => setIsSuperAdmin(e.target.checked)}
                className="mt-1 w-5 h-5 text-purple-600 focus:ring-purple-500 rounded"
              />
              <div>
                <label
                  htmlFor="is_super_admin"
                  className="block font-medium text-gray-900 dark:text-white cursor-pointer"
                >
                  👑 Super Admin
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Accorde tous les privilèges administrateur indépendamment du rôle. Permet de basculer
                  entre le dashboard de son rôle et le dashboard super admin.
                </p>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={e => handleChange('is_active', e.target.checked)}
                className="mt-1 w-5 h-5 text-green-600 focus:ring-green-500 rounded"
              />
              <div>
                <label
                  htmlFor="is_active"
                  className="block font-medium text-gray-900 dark:text-white cursor-pointer"
                >
                  Compte actif
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Désactiver pour empêcher l'utilisateur de se connecter
                </p>
              </div>
            </div>
          </div>

          {/* User Info Display */}
          <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informations système
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">ID:</span>
                <span className="ml-2 text-gray-900 dark:text-white font-mono">{user.id}</span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Vérifié:</span>
                <span className="ml-2">
                  {user.is_verified ? (
                    <Badge variant="success" size="sm">Oui</Badge>
                  ) : (
                    <Badge variant="danger" size="sm">Non</Badge>
                  )}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Créé le:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Modifié le:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {new Date(user.updated_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone - Permanent Delete */}
          {!user.is_active && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-2">
                  ⚠️ Compte Inactif
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-400 mb-3">
                  Ce compte est actuellement désactivé. Vous pouvez le réactiver ci-dessous.
                </p>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleChange('is_active', true)}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  ✅ Réactiver ce compte
                </Button>
              </div>
            </div>
          )}

          {/* Reset Password Section (Super Admin Only) */}
          {currentUser?.is_super_admin && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  🔒 Réinitialiser le mot de passe
                </h3>

                {!showResetPassword ? (
                  <>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
                      Définir un nouveau mot de passe pour cet utilisateur (Super Admin uniquement)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResetPassword(true)}
                      disabled={isLoading}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      🔑 Réinitialiser le mot de passe
                    </Button>
                  </>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 mb-3">
                      <p className="text-xs text-yellow-700 dark:text-yellow-400">
                        <strong>Exigences :</strong> Au moins 8 caractères, 1 chiffre, 1 majuscule
                      </p>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nouveau mot de passe <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nouveau mot de passe"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isLoading || !newPassword}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        💾 Enregistrer le nouveau mot de passe
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowResetPassword(false)
                          setNewPassword('')
                          setShowPassword(false)
                        }}
                        disabled={isLoading}
                      >
                        Annuler
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Danger Zone - Permanent Delete (Super Admin Only) */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                ⚠️ Zone Dangereuse
              </h3>
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                La suppression définitive est IRRÉVERSIBLE. Toutes les données de l'utilisateur seront perdues.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePermanentDelete}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                🗑️ Supprimer définitivement
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
