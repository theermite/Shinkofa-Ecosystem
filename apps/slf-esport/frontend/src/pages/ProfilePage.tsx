/**
 * Profile Page - User profile management with invitations and availability
 */

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import MainLayout from '@/components/layout/MainLayout'
import { Button, Input, AvatarUpload } from '@/components/ui'
import userService from '@/services/userService'
import authService from '@/services/authService'
import notificationService from '@/services/notificationService'
import { invitationService, availabilityService } from '@/services/availabilityService'
import ExerciseStats from '@/components/exercises/ExerciseStats'
import type { User, UserUpdate, PasswordChange } from '@/types/user'
import type { NotificationPreferences, NotificationPreferencesUpdate } from '@/services/notificationService'
import type { Session } from '@/types/session'
import { SESSION_TYPE_EMOJIS, SESSION_TYPE_LABELS } from '@/types/session'
import type {
  PlayerAvailability,
  PlayerAvailabilityCreate,
  PlayerAvailabilityException,
  PlayerAvailabilityExceptionCreate,
  DayOfWeek
} from '@/types/availability'
import { UserRole } from '@/types/user'

const DAYS = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
] as const

type TabType = 'profile' | 'password' | 'notifications' | 'stats' | 'invitations'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Profile form state
  const [profileData, setProfileData] = useState<UserUpdate>({
    full_name: '',
    bio: '',
    avatar_url: '',
    game_username: '',
    game_uid: '',
    preferred_role: '',
    secondary_role: '',
    skill_level: '',
    discord_username: '',
  })

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    current_password: '',
    new_password: '',
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)

  // Invitations state
  const [invitations, setInvitations] = useState<Session[]>([])
  const [loadingInvitations, setLoadingInvitations] = useState(false)
  const [respondingTo, setRespondingTo] = useState<number | null>(null)

  // Availabilities state
  const [availabilities, setAvailabilities] = useState<PlayerAvailability[]>([])
  const [exceptions, setExceptions] = useState<PlayerAvailabilityException[]>([])
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(false)
  const [loadingExceptions, setLoadingExceptions] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showExceptionForm, setShowExceptionForm] = useState(false)
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(1)
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('22:00')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [exceptionDate, setExceptionDate] = useState('')
  const [exceptionStartTime, setExceptionStartTime] = useState('')
  const [exceptionEndTime, setExceptionEndTime] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(true)
  const [exceptionReason, setExceptionReason] = useState('')
  const [submittingException, setSubmittingException] = useState(false)
  const [error, setError] = useState('')

  // Load user profile
  useEffect(() => {
    loadProfile()
  }, [])

  // Load data when tabs are activated
  useEffect(() => {
    if (activeTab === 'notifications' && !notificationPreferences) {
      loadNotificationPreferences()
    }
    if (activeTab === 'invitations') {
      loadInvitations()
    }
  }, [activeTab])

  const loadProfile = async () => {
    try {
      setIsLoading(true)
      const userData = await authService.getCurrentUser()
      setUser(userData)

      setProfileData({
        full_name: userData.full_name || '',
        bio: userData.bio || '',
        avatar_url: userData.avatar_url || '',
        game_username: userData.game_username || '',
        game_uid: userData.game_uid || '',
        preferred_role: userData.preferred_role || '',
        secondary_role: userData.secondary_role || '',
        skill_level: userData.skill_level || '',
        discord_username: userData.discord_username || '',
      })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors du chargement du profil',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadInvitations = async () => {
    try {
      setLoadingInvitations(true)
      const data = await invitationService.getMyPendingInvitations()
      setInvitations(data)
    } catch (error) {
      console.error('Failed to load invitations:', error)
    } finally {
      setLoadingInvitations(false)
    }
  }

  const loadAvailabilities = async () => {
    try {
      setLoadingAvailabilities(true)
      const data = await availabilityService.getMyAvailabilities()
      setAvailabilities(data.sort((a, b) => a.day_of_week - b.day_of_week))
    } catch (err) {
      console.error('Failed to load availabilities:', err)
      setError('Erreur lors du chargement des disponibilités')
    } finally {
      setLoadingAvailabilities(false)
    }
  }

  const loadExceptions = async () => {
    try {
      setLoadingExceptions(true)
      const data = await availabilityService.getMyExceptions()
      setExceptions(data.sort((a, b) => new Date(a.exception_date).getTime() - new Date(b.exception_date).getTime()))
    } catch (err) {
      console.error('Failed to load exceptions:', err)
    } finally {
      setLoadingExceptions(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const updatedUser = await userService.updateMyProfile(profileData)
      setUser(updatedUser)
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors de la mise à jour',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    if (passwordData.new_password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' })
      setIsSaving(false)
      return
    }

    try {
      await userService.changePassword(passwordData)
      setMessage({ type: 'success', text: 'Mot de passe modifié avec succès' })
      setPasswordData({ current_password: '', new_password: '' })
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors du changement de mot de passe',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const loadNotificationPreferences = async () => {
    try {
      setIsLoadingNotifications(true)
      const preferences = await notificationService.getPreferences()
      setNotificationPreferences(preferences)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors du chargement des préférences',
      })
    } finally {
      setIsLoadingNotifications(false)
    }
  }

  const handleNotificationPreferenceToggle = async (key: keyof NotificationPreferencesUpdate) => {
    if (!notificationPreferences) return

    try {
      const updatedValue = !notificationPreferences[key as keyof NotificationPreferences]
      const update: NotificationPreferencesUpdate = { [key]: updatedValue }

      const updated = await notificationService.updatePreferences(update)
      setNotificationPreferences(updated)
      setMessage({ type: 'success', text: 'Préférences mises à jour' })
      setTimeout(() => setMessage(null), 2000)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors de la mise à jour',
      })
    }
  }

  const handleResetNotifications = async () => {
    if (!confirm('Réactiver toutes les notifications ?')) return

    try {
      setIsSaving(true)
      const reset = await notificationService.resetPreferences()
      setNotificationPreferences(reset)
      setMessage({ type: 'success', text: 'Toutes les notifications ont été réactivées' })
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors de la réinitialisation',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRespondToInvitation = async (sessionId: number, responseStatus: string, declineReason?: string) => {
    try {
      setRespondingTo(sessionId)
      await invitationService.respondToInvitation(sessionId, responseStatus, declineReason)
      await loadInvitations()
    } catch (error) {
      console.error('Failed to respond to invitation:', error)
      alert('Erreur lors de la réponse')
    } finally {
      setRespondingTo(null)
    }
  }

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const data: PlayerAvailabilityCreate = {
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        is_active: true,
        notes: notes || undefined,
      }

      await availabilityService.createAvailability(data)
      await loadAvailabilities()

      setShowAddForm(false)
      setStartTime('18:00')
      setEndTime('22:00')
      setNotes('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAvailability = async (id: number) => {
    if (!confirm('Supprimer cette disponibilité ?')) return

    try {
      await availabilityService.deleteAvailability(id)
      await loadAvailabilities()
    } catch (err) {
      console.error('Failed to delete availability:', err)
      alert('Erreur lors de la suppression')
    }
  }

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingException(true)
    setError('')

    try {
      const data: PlayerAvailabilityExceptionCreate = {
        exception_date: exceptionDate,
        start_time: !isUnavailable ? exceptionStartTime : undefined,
        end_time: !isUnavailable ? exceptionEndTime : undefined,
        is_unavailable: isUnavailable,
        reason: exceptionReason || undefined,
      }

      await availabilityService.createException(data)
      await loadExceptions()

      setShowExceptionForm(false)
      setExceptionDate('')
      setExceptionStartTime('')
      setExceptionEndTime('')
      setIsUnavailable(true)
      setExceptionReason('')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création de l\'exception')
    } finally {
      setSubmittingException(false)
    }
  }

  const handleDeleteException = async (id: number) => {
    if (!confirm('Supprimer cette exception ?')) return

    try {
      await availabilityService.deleteException(id)
      await loadExceptions()
    } catch (err) {
      console.error('Failed to delete exception:', err)
      alert('Erreur lors de la suppression')
    }
  }

  const getDayLabel = (dayOfWeek: DayOfWeek) => {
    const day = DAYS.find(d => d.value === dayOfWeek)
    return day ? day.label : `Jour ${dayOfWeek}`
  }

  const parseUTCDate = (dateStr: string): Date => {
    const utcStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`
    return new Date(utcStr)
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case UserRole.COACH:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return 'Manager'
      case UserRole.COACH:
        return 'Coach'
      default:
        return 'Joueur'
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    )
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">Erreur de chargement du profil</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-8 mb-8 shadow-lg">
        <div className="flex items-center gap-6">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.full_name || user.username}</h1>
            <p className="text-primary-100">@{user.username} • {user.email}</p>
            <div className="mt-2 flex gap-2">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
              {user.is_super_admin && (
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  👑 Super Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-shrink-0 px-4 py-4 font-medium transition-colors text-sm ${
              activeTab === 'profile'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            👤 Profil
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`flex-shrink-0 px-4 py-4 font-medium transition-colors text-sm ${
              activeTab === 'invitations'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            📨 Invitations
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`flex-shrink-0 px-4 py-4 font-medium transition-colors text-sm ${
              activeTab === 'password'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            🔒 Mot de passe
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-shrink-0 px-4 py-4 font-medium transition-colors text-sm ${
              activeTab === 'notifications'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            🔔 Notifications
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-shrink-0 px-4 py-4 font-medium transition-colors text-sm ${
              activeTab === 'stats'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            📊 Statistiques
          </button>
        </div>

        {/* Profile Tab - keeping existing implementation */}
        {activeTab === 'profile' && (
          <ProfileTabContent
            user={user}
            profileData={profileData}
            setProfileData={setProfileData}
            setUser={setUser}
            isSaving={isSaving}
            setMessage={setMessage}
            handleProfileUpdate={handleProfileUpdate}
            getRoleBadgeColor={getRoleBadgeColor}
            getRoleLabel={getRoleLabel}
          />
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <InvitationsTabContent
            invitations={invitations}
            loadingInvitations={loadingInvitations}
            respondingTo={respondingTo}
            handleRespondToInvitation={handleRespondToInvitation}
            parseUTCDate={parseUTCDate}
          />
        )}

        {/* Password Tab - keeping existing implementation */}
        {activeTab === 'password' && (
          <PasswordTabContent
            passwordData={passwordData}
            setPasswordData={setPasswordData}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showCurrentPassword={showCurrentPassword}
            setShowCurrentPassword={setShowCurrentPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            isSaving={isSaving}
            handlePasswordChange={handlePasswordChange}
          />
        )}

        {/* Notifications Tab - keeping existing implementation */}
        {activeTab === 'notifications' && (
          <NotificationsTabContent
            notificationPreferences={notificationPreferences}
            isLoadingNotifications={isLoadingNotifications}
            isSaving={isSaving}
            handleNotificationPreferenceToggle={handleNotificationPreferenceToggle}
            handleResetNotifications={handleResetNotifications}
          />
        )}

        {/* Statistics Tab - keeping existing implementation */}
        {activeTab === 'stats' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Statistiques des Exercices Cognitifs
            </h3>
            <ExerciseStats />
          </div>
        )}
      </div>
      </div>
    </MainLayout>
  )
}

// Separate components for each tab to keep code organized
function ProfileTabContent({user, profileData, setProfileData, setUser, isSaving, setMessage, handleProfileUpdate, getRoleBadgeColor, getRoleLabel}: any) {
  return (
    <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Informations personnelles
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Nom complet"
          type="text"
          value={profileData.full_name || ''}
          onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
          placeholder="Prénom Nom"
        />

        <Input
          label="Pseudo Discord"
          type="text"
          value={profileData.discord_username || ''}
          onChange={(e) => setProfileData({ ...profileData, discord_username: e.target.value })}
          placeholder="VotrePseudo#1234"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={profileData.bio || ''}
          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
          placeholder="Parlez-nous de vous..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Photo de profil
        </label>
        <AvatarUpload
          currentAvatar={profileData.avatar_url}
          onUploadSuccess={(avatarUrl) => {
            setProfileData({ ...profileData, avatar_url: avatarUrl })
            if (user) {
              setUser({ ...user, avatar_url: avatarUrl })
            }
          }}
          onUploadError={(error) => {
            setMessage({ type: 'error', text: error })
          }}
        />
      </div>

      {/* Gaming profile */}
      {(user.role === UserRole.JOUEUR || user.role === UserRole.COACH || user.role === UserRole.MANAGER) && (
        <>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-6">
            🎮 Profil Gaming
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Pseudo HOK (Honor of Kings)"
              type="text"
              value={profileData.game_username || ''}
              onChange={(e) => setProfileData({ ...profileData, game_username: e.target.value })}
              placeholder="VotrePseudoHOK"
            />

            <Input
              label="UID HOK (Player ID)"
              type="text"
              value={profileData.game_uid || ''}
              onChange={(e) => setProfileData({ ...profileData, game_uid: e.target.value })}
              placeholder="123456789"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rôle en jeu préféré
              </label>
              <select
                value={profileData.preferred_role || ''}
                onChange={(e) => setProfileData({ ...profileData, preferred_role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
              >
                <option value="">Sélectionner...</option>
                <option value="Roam/Support">Roam/Support</option>
                <option value="ADC">ADC</option>
                <option value="Jungle">Jungle</option>
                <option value="Clash Lane">Clash Lane</option>
                <option value="Mid Lane">Mid Lane</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rôle secondaire
              </label>
              <select
                value={profileData.secondary_role || ''}
                onChange={(e) => setProfileData({ ...profileData, secondary_role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Niveau de compétence
              </label>
              <select
                value={profileData.skill_level || ''}
                onChange={(e) => setProfileData({ ...profileData, skill_level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
              >
                <option value="">Sélectionner...</option>
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* System Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informations système
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Rôle plateforme:</span>
            <div className="mt-1">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Membre depuis:</span>
            <div className="mt-1 text-gray-900 dark:text-white font-medium">
              {new Date(user.created_at).toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button type="submit" variant="primary" isLoading={isSaving}>
          💾 Enregistrer les modifications
        </Button>
      </div>
    </form>
  )
}

// ========== Availabilities Tab ==========
function AvailabilitiesTabContent({
  availabilities,
  exceptions,
  loadingAvailabilities,
  loadingExceptions,
  showAddForm,
  setShowAddForm,
  showExceptionForm,
  setShowExceptionForm,
  dayOfWeek,
  setDayOfWeek,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  notes,
  setNotes,
  submitting,
  exceptionDate,
  setExceptionDate,
  exceptionStartTime,
  setExceptionStartTime,
  exceptionEndTime,
  setExceptionEndTime,
  isUnavailable,
  setIsUnavailable,
  exceptionReason,
  setExceptionReason,
  submittingException,
  error,
  handleAddAvailability,
  handleDeleteAvailability,
  handleAddException,
  handleDeleteException,
  getDayLabel,
  DAYS
}: any) {
  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!showAddForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              📅 Mes disponibilités récurrentes
            </h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              ➕ Ajouter
            </button>
          </div>

          {loadingAvailabilities ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : availabilities.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucune disponibilité configurée
            </p>
          ) : (
            <div className="space-y-3">
              {availabilities.map((avail: any) => (
                <div
                  key={avail.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getDayLabel(avail.day_of_week)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {avail.start_time} - {avail.end_time}
                      </span>
                      {!avail.is_active && (
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                          Inactif
                        </span>
                      )}
                    </div>
                    {avail.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {avail.notes}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteAvailability(avail.id)}
                    className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📅 Ajouter une disponibilité récurrente
          </h3>
          <form onSubmit={handleAddAvailability} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jour de la semaine
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(parseInt(e.target.value) as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                {DAYS.map((day: any) => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure de début
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure de fin
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Disponible sauf urgence"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <Button type="submit" variant="primary" isLoading={submitting}>
              ➕ Ajouter
            </Button>
          </div>
        </form>
        </div>
      )}

      {/* Exceptions Section */}
      {!showExceptionForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🚫 Exceptions (indisponibilités ponctuelles)
            </h3>
            <button
              onClick={() => setShowExceptionForm(true)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              ➕ Ajouter
            </button>
          </div>

          {loadingExceptions ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : exceptions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Aucune exception configurée
            </p>
          ) : (
            <div className="space-y-3">
              {exceptions.map((exc: any) => (
                <div
                  key={exc.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {format(new Date(exc.exception_date), 'PPP', { locale: fr })}
                      </span>
                      {exc.start_time && exc.end_time && (
                        <span className="text-gray-600 dark:text-gray-400">
                          {exc.start_time} - {exc.end_time}
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded ${
                        exc.is_unavailable
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {exc.is_unavailable ? 'Indisponible' : 'Disponible'}
                      </span>
                    </div>
                    {exc.reason && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {exc.reason}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteException(exc.id)}
                    className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🚫 Ajouter une exception
          </h3>
          <form onSubmit={handleAddException} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={exceptionDate}
                  onChange={(e) => setExceptionDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <div className="flex items-center gap-4 h-full">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={isUnavailable}
                      onChange={() => setIsUnavailable(true)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Indisponible toute la journée</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!isUnavailable}
                      onChange={() => setIsUnavailable(false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Plage horaire spécifique</span>
                  </label>
                </div>
              </div>
            </div>

            {!isUnavailable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={exceptionStartTime}
                    onChange={(e) => setExceptionStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={!isUnavailable}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={exceptionEndTime}
                    onChange={(e) => setExceptionEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required={!isUnavailable}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Raison (optionnel)
              </label>
              <input
                type="text"
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
                placeholder="Ex: Rendez-vous médical"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowExceptionForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <Button type="submit" variant="primary" isLoading={submittingException}>
                ➕ Ajouter exception
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// ========== Invitations Tab ==========
function InvitationsTabContent({
  invitations,
  loadingInvitations,
  respondingTo,
  handleRespondToInvitation,
  parseUTCDate
}: any) {
  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📨 Mes invitations
        </h3>
        {loadingInvitations ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : invitations.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Aucune invitation en attente
          </p>
        ) : (
          <div className="space-y-4">
            {invitations.map((session) => {
              const invitation = session.invitations?.[0]
              if (!invitation) return null

              return (
                <div
                  key={session.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {session.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {format(new Date(session.scheduled_at), 'PPP à p', { locale: fr })}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Durée: {session.duration} min
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invitation.status === 'ACCEPTED'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : invitation.status === 'DECLINED'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}>
                      {invitation.status === 'ACCEPTED' ? '✅ Acceptée' :
                       invitation.status === 'DECLINED' ? '❌ Refusée' :
                       '⏳ En attente'}
                    </span>
                  </div>

                  {session.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {session.description}
                    </p>
                  )}

                  {invitation.status === 'PENDING' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRespondToInvitation(session.id, 'ACCEPTED')}
                        isLoading={respondingTo === session.id}
                      >
                        ✅ Accepter
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const reason = window.prompt('Raison du refus (optionnel):')
                          handleRespondToInvitation(session.id, 'DECLINED', reason || undefined)
                        }}
                        isLoading={respondingTo === session.id}
                      >
                        ❌ Refuser
                      </Button>
                    </div>
                  )}

                  {invitation.status === 'DECLINED' && invitation.decline_reason && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      Raison: {invitation.decline_reason}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ========== Password Tab ==========
function PasswordTabContent({
  passwordData,
  setPasswordData,
  confirmPassword,
  setConfirmPassword,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  isSaving,
  handlePasswordChange
}: any) {
  return (
    <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔒 Changer le mot de passe
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showCurrentPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showNewPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" isLoading={isSaving}>
          🔐 Changer le mot de passe
        </Button>
      </div>
    </form>
  )
}

// ========== Notifications Tab ==========
function NotificationsTabContent({
  notificationPreferences,
  isLoadingNotifications,
  isSaving,
  handleNotificationPreferenceToggle,
  handleResetNotifications
}: any) {
  if (isLoadingNotifications) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!notificationPreferences) {
    return (
      <div className="p-6">
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Erreur de chargement des préférences
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔔 Préférences de notifications
        </h3>
        <div className="space-y-4">
          <NotificationToggle
            label="Invitations aux sessions"
            description="Recevoir un email quand vous êtes invité à une session"
            checked={notificationPreferences.session_invitations}
            onChange={() => handleNotificationPreferenceToggle('session_invitations')}
          />
          <NotificationToggle
            label="Rappels de session"
            description="Recevoir un rappel 24h avant une session"
            checked={notificationPreferences.session_reminders}
            onChange={() => handleNotificationPreferenceToggle('session_reminders')}
          />
          <NotificationToggle
            label="Nouveaux exercices"
            description="Être notifié quand de nouveaux exercices sont disponibles"
            checked={notificationPreferences.new_exercises}
            onChange={() => handleNotificationPreferenceToggle('new_exercises')}
          />
          <NotificationToggle
            label="Annonces de l'équipe"
            description="Recevoir les annonces importantes de l'équipe"
            checked={notificationPreferences.team_announcements}
            onChange={() => handleNotificationPreferenceToggle('team_announcements')}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleResetNotifications}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
          disabled={isSaving}
        >
          🔄 Réactiver toutes
        </button>
      </div>
    </div>
  )
}

// Helper component for notification toggles
function NotificationToggle({
  label,
  description,
  checked,
  onChange
}: {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          {label}
        </h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}
