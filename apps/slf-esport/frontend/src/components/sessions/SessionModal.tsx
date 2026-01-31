/**
 * Session Modal - Create/Edit session with unified availability checking
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button, Input, Badge } from '@/components/ui'
import sessionService from '@/services/sessionService'
import { invitationService, availabilityService } from '@/services/availabilityService'
import userService from '@/services/userService'
import { useAuthStore } from '@/store/authStore'
import type { Session, SessionCreate, SessionType } from '@/types/session'
import { SESSION_TYPE_LABELS, SESSION_TYPE_EMOJIS } from '@/types/session'
import type { User } from '@/types/user'
import { UserRole } from '@/types/user'
import type { AvailablePlayer } from '@/types/availability'

interface SessionModalProps {
  session: Session
  isOpen: boolean
  onClose: () => void
}

export default function SessionModal({ session, isOpen, onClose }: SessionModalProps) {
  const { user } = useAuthStore()
  const [title, setTitle] = useState(session.title || '')
  const [description, setDescription] = useState(session.description || '')
  const [sessionType, setSessionType] = useState<SessionType>(session.session_type)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [meetingUrl, setMeetingUrl] = useState(session.meeting_url || '')
  const [notes, setNotes] = useState(session.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Invitation & Availability states
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [availablePlayers, setAvailablePlayers] = useState<AvailablePlayer[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingAvailable, setLoadingAvailable] = useState(false)

  const isEdit = session.id > 0
  const canInvite = user && (user.role === UserRole.COACH || user.role === UserRole.MANAGER)

  useEffect(() => {
    if (session.start_time) {
      // IMPORTANT: Backend returns dates in UTC but without 'Z' suffix
      // Force interpretation as UTC by adding 'Z' if missing
      const startStr = session.start_time.endsWith('Z') ? session.start_time : `${session.start_time}Z`
      const start = new Date(startStr)

      // Format as YYYY-MM-DDTHH:mm in LOCAL timezone for datetime-local input
      const year = start.getFullYear()
      const month = String(start.getMonth() + 1).padStart(2, '0')
      const day = String(start.getDate()).padStart(2, '0')
      const hours = String(start.getHours()).padStart(2, '0')
      const minutes = String(start.getMinutes()).padStart(2, '0')
      setStartTime(`${year}-${month}-${day}T${hours}:${minutes}`)
    }
    if (session.end_time) {
      // IMPORTANT: Backend returns dates in UTC but without 'Z' suffix
      // Force interpretation as UTC by adding 'Z' if missing
      const endStr = session.end_time.endsWith('Z') ? session.end_time : `${session.end_time}Z`
      const end = new Date(endStr)

      // Format as YYYY-MM-DDTHH:mm in LOCAL timezone for datetime-local input
      const year = end.getFullYear()
      const month = String(end.getMonth() + 1).padStart(2, '0')
      const day = String(end.getDate()).padStart(2, '0')
      const hours = String(end.getHours()).padStart(2, '0')
      const minutes = String(end.getMinutes()).padStart(2, '0')
      setEndTime(`${year}-${month}-${day}T${hours}:${minutes}`)
    }

    // Load all users if can invite (both create and edit)
    if (canInvite) {
      loadAllUsers()
    }

    // Pre-fill selectedUserIds with existing participants when editing
    if (isEdit && session.participants && session.participants.length > 0) {
      setSelectedUserIds(session.participants.map(p => p.user_id))
    }
  }, [session, isEdit, canInvite])

  // Auto-check availability when date/time changes
  useEffect(() => {
    if (canInvite && startTime && endTime) {
      const timeoutId = setTimeout(() => {
        loadAvailablePlayers()
      }, 500) // Debounce 500ms
      return () => clearTimeout(timeoutId)
    }
  }, [startTime, endTime, canInvite])

  const loadAllUsers = async () => {
    setLoadingUsers(true)
    try {
      // Get all players from API
      const users = await userService.getAllPlayers(0, 100)
      setAllUsers(users)
    } catch (err) {
      console.error('Failed to load users:', err)
      setError('Erreur lors du chargement des joueurs')
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadAvailablePlayers = async () => {
    if (!startTime || !endTime) return

    setLoadingAvailable(true)
    try {
      // IMPORTANT: Keep datetime-local as-is without UTC conversion
      // The backend expects local time to match availability time ranges
      // datetime-local format: "2026-01-10T18:00" → send as "2026-01-10T18:00:00"
      const startStr = startTime.length === 16 ? `${startTime}:00` : startTime
      const endStr = endTime.length === 16 ? `${endTime}:00` : endTime

      const players = await availabilityService.getAvailablePlayers(
        startStr,
        endStr,
        true // team_only
      )
      setAvailablePlayers(players)
      // Auto-select ONLY available players (is_available = true)
      const availablePlayerIds = players
        .filter(p => p.is_available)
        .map(p => p.user_id)
      setSelectedUserIds(availablePlayerIds)
    } catch (err) {
      console.error('Failed to load available players:', err)
    } finally {
      setLoadingAvailable(false)
    }
  }

  const handleInviteAll = () => {
    setSelectedUserIds(allUsers.map(u => u.id))
  }

  const handleInviteAvailable = () => {
    // Only select players who are actually available
    const availablePlayerIds = availablePlayers
      .filter(p => p.is_available)
      .map(p => p.user_id)
    setSelectedUserIds(availablePlayerIds)
  }

  const handleToggleUser = (userId: number) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess(false)

    try {
      // Convert local datetime-local input to proper ISO string
      const startDate = new Date(startTime)
      const endDate = new Date(endTime)

      const sessionData: SessionCreate = {
        title,
        description: description || undefined,
        session_type: sessionType,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        meeting_url: meetingUrl || undefined,
        notes: notes || undefined,
      }

      if (isEdit) {
        await sessionService.updateSession(session.id, sessionData)

        // Send invitations to newly added players
        if (canInvite && selectedUserIds.length > 0) {
          const existingParticipantIds = session.participants?.map(p => p.user_id) || []
          const newUserIds = selectedUserIds.filter(id => !existingParticipantIds.includes(id))

          if (newUserIds.length > 0) {
            await invitationService.invitePlayersToSession(session.id, newUserIds)
          }
        }
      } else {
        const createdSession = await sessionService.createSession(sessionData)

        // Send invitations if coach/manager and players selected
        if (canInvite && selectedUserIds.length > 0) {
          await invitationService.invitePlayersToSession(createdSession.id, selectedUserIds)
        }
      }

      setSuccess(true)
      setIsSubmitting(false)

      // Close modal after success
      setTimeout(() => {
        onClose()
      }, 1000)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la sauvegarde')
      console.error('Session creation error:', err)
      setIsSubmitting(false)
    }
  }

  // Calculate duration
  const duration = startTime && endTime ?
    Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60) : 0

  // Calculate available count dynamically
  const availableCount = availablePlayers.filter(p => p.is_available).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary text-white p-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {isEdit ? '✏️ Modifier la session' : '✨ Nouvelle session'}
              </h2>
              <p className="text-primary-100 text-sm">
                {isEdit ? 'Modifie les détails de la session' : 'Crée une session et vérifie les disponibilités avant de valider'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Messages */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg animate-slideIn">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-red-800 dark:text-red-300">Erreur</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-lg animate-slideIn">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="font-medium text-green-800 dark:text-green-300">Succès !</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Session {isEdit ? 'modifiée' : 'créée'} avec succès{!isEdit && selectedUserIds.length > 0 ? ` - ${selectedUserIds.length} invitation(s) envoyée(s)` : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Session Details */}
              <div className="space-y-6">
                {/* Section 1: Basic info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </span>
                    Informations de base
                  </h3>

                  <Input
                    label="Titre de la session *"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Entraînement macro gameplay"
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type de session *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(SESSION_TYPE_LABELS).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSessionType(key as SessionType)}
                          className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                            sessionType === key
                              ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-900 dark:text-primary-100 shadow-md'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:shadow text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <span className="text-lg">{SESSION_TYPE_EMOJIS[key as SessionType]}</span>
                          <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section 2: Date & Time */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </span>
                    Date et horaire
                  </h3>

                  <Input
                    label="Début *"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />

                  <Input
                    label="Fin *"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />

                  {/* Duration preview */}
                  {startTime && endTime && duration > 0 && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Durée: {Math.floor(duration / 60)}h {duration % 60}min
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            {startTime && format(new Date(startTime), "EEEE d MMMM 'à' HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </span>
                    Détails
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Objectifs de la session, focus, préparation nécessaire..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all"
                    />
                  </div>

                  <Input
                    label="Lien de réunion (optionnel)"
                    type="url"
                    value={meetingUrl}
                    onChange={(e) => setMeetingUrl(e.target.value)}
                    placeholder="https://discord.gg/... ou https://zoom.us/..."
                    helperText="Discord, Zoom, Google Meet, etc."
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes coach (optionnel)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes internes, préparation, matériel nécessaire..."
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Invitations & Availabilities */}
              {canInvite && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-bold text-sm">
                      4
                    </span>
                    Disponibilités & Invitations {isEdit && '(Édition)'}
                  </h3>

                  {!startTime || !endTime ? (
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Définis la date et l'horaire pour voir les disponibilités
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Quick actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleInviteAvailable}
                          disabled={loadingAvailable || availableCount === 0}
                          className="flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Disponibles ({availableCount})</span>
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleInviteAll}
                          className="flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Toute l'équipe</span>
                        </Button>
                      </div>

                      {/* Available players info */}
                      {loadingAvailable ? (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                            Vérification des disponibilités...
                          </p>
                        </div>
                      ) : availableCount > 0 ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                            ✅ {availableCount} joueur(s) disponible(s) pour ce créneau
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <p className="text-sm text-orange-800 dark:text-orange-200 font-medium">
                            ⚠️ Aucun joueur n'a indiqué être disponible pour ce créneau
                          </p>
                        </div>
                      )}

                      {/* User selection */}
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sélectionner les joueurs ({selectedUserIds.length} sélectionné{selectedUserIds.length > 1 ? 's' : ''})
                        </p>

                        {loadingUsers ? (
                          <div className="flex justify-center py-4">
                            <svg className="animate-spin h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {allUsers.map(user => {
                              const isSelected = selectedUserIds.includes(user.id)
                              const isAvailable = availablePlayers.some(p => p.user_id === user.id && p.is_available)

                              return (
                                <button
                                  key={user.id}
                                  type="button"
                                  onClick={() => handleToggleUser(user.id)}
                                  className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                                    isSelected
                                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 bg-white dark:bg-gray-800'
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected
                                      ? 'border-primary-600 bg-primary-600'
                                      : 'border-gray-300 dark:border-gray-600'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </div>

                                  <div className="flex-1 text-left min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                      {user.full_name || user.username}
                                    </p>
                                    {isAvailable && (
                                      <p className="text-xs text-green-600 dark:text-green-400">
                                        ✓ Disponible
                                      </p>
                                    )}
                                  </div>

                                  <Badge variant="primary" size="sm">
                                    ID {user.id}
                                  </Badge>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting || success}
                className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>En cours...</span>
                  </>
                ) : success ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Succès !</span>
                  </>
                ) : (
                  <span>
                    {isEdit ? 'Enregistrer les modifications' : `Créer ${!isEdit && canInvite && selectedUserIds.length > 0 ? `et inviter (${selectedUserIds.length})` : ''}`}
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}
