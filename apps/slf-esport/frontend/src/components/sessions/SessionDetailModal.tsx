/**
 * Session Detail Modal - View session details and manage participation
 */

import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button, Badge } from '@/components/ui'
import sessionService from '@/services/sessionService'
import { useAuthStore } from '@/store/authStore'
import type { Session, SessionParticipant } from '@/types/session'
import {
  SESSION_TYPE_LABELS,
  SESSION_TYPE_EMOJIS,
  SESSION_TYPE_COLORS,
  SESSION_STATUS_LABELS,
  SESSION_STATUS_COLORS,
  RESPONSE_STATUS_LABELS,
  RESPONSE_STATUS_COLORS,
} from '@/types/session'

interface SessionDetailModalProps {
  session: Session
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
}

// Helper function to parse backend dates (UTC without 'Z' suffix) correctly
function parseUTCDate(dateStr: string): Date {
  // Backend returns dates in UTC but without 'Z' suffix
  // Force interpretation as UTC by adding 'Z' if missing
  const utcStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`
  return new Date(utcStr)
}

// Helper function to get participant display name
function getParticipantDisplayName(participant: SessionParticipant): string {
  if (participant.game_username) {
    return participant.game_username
  }
  if (participant.full_name) {
    return participant.full_name
  }
  if (participant.username) {
    return participant.username
  }
  return `Joueur #${participant.user_id}`
}

export default function SessionDetailModal({
  session,
  isOpen,
  onClose,
  onEdit,
}: SessionDetailModalProps) {
  const { user } = useAuthStore()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isResponding, setIsResponding] = useState(false)

  const myParticipation = session.participants?.find((p) => p.user_id === user?.id)
  const isParticipant = !!myParticipation
  const isCoachOrManager = user?.role === 'COACH' || user?.role === 'MANAGER'
  const isCreator = session.created_by_id === user?.id

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) return

    setIsDeleting(true)
    try {
      await sessionService.deleteSession(session.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete session:', error)
      alert('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleJoin = async () => {
    if (!user) return

    try {
      await sessionService.addParticipant(session.id, user.id)
      onClose()
    } catch (error) {
      console.error('Failed to join session:', error)
      alert('Erreur lors de l\'inscription')
    }
  }

  const handleLeave = async () => {
    if (!user) return
    if (!confirm('Êtes-vous sûr de vouloir quitter cette session ?')) return

    try {
      await sessionService.removeParticipant(session.id, user.id)
      onClose()
    } catch (error) {
      console.error('Failed to leave session:', error)
      alert('Erreur lors du départ')
    }
  }

  const handleRespondToInvitation = async (responseStatus: 'confirmed' | 'maybe' | 'declined') => {
    if (!user) return

    setIsResponding(true)
    try {
      await sessionService.respondToInvitation(session.id, responseStatus)
      onClose() // Close and refresh
    } catch (error) {
      console.error('Failed to respond to invitation:', error)
      alert('Erreur lors de la réponse')
    } finally {
      setIsResponding(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{SESSION_TYPE_EMOJIS[session.session_type]}</span>
                <Badge className={SESSION_TYPE_COLORS[session.session_type]}>
                  {SESSION_TYPE_LABELS[session.session_type]}
                </Badge>
                <Badge className={SESSION_STATUS_COLORS[session.status]}>
                  {SESSION_STATUS_LABELS[session.status]}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold">{session.title}</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {format(parseUTCDate(session.start_time), 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Horaire</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {format(parseUTCDate(session.start_time), 'HH:mm', { locale: fr })} -{' '}
                {format(parseUTCDate(session.end_time), 'HH:mm', { locale: fr })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Durée</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {session.duration_minutes} minutes
              </p>
            </div>
          </div>

          {/* Description */}
          {session.description && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Description</p>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {session.description}
              </p>
            </div>
          )}

          {/* Meeting URL */}
          {session.meeting_url && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Lien de réunion</p>
              <a
                href={session.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline"
              >
                {session.meeting_url}
              </a>
            </div>
          )}

          {/* Participants */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Participants ({session.participants?.length || 0})
            </p>
            {session.participants && session.participants.length > 0 ? (
              <div className="space-y-2">
                {session.participants.map((participant) => {
                  const displayName = getParticipantDisplayName(participant)
                  const statusLabel = RESPONSE_STATUS_LABELS[participant.response_status] || participant.response_status
                  const statusColor = RESPONSE_STATUS_COLORS[participant.response_status] || 'bg-gray-100 text-gray-800'
                  const initials = displayName.substring(0, 2).toUpperCase()

                  return (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                            {initials}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {displayName}
                          </p>
                          <Badge className={`text-xs ${statusColor}`}>
                            {statusLabel}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Aucun participant inscrit
              </p>
            )}
          </div>

          {/* Coach Notes (coaches/managers only) */}
          {isCoachOrManager && session.notes && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
                📝 Notes coach
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                {session.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Invitation response for invited players */}
            {!isCoachOrManager &&
             session.status !== 'completed' &&
             session.status !== 'cancelled' &&
             myParticipation &&
             myParticipation.response_status === 'pending' && (
              <div className="flex gap-2 w-full">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 w-full">
                  Vous êtes invité à cette session. Confirmez-vous votre présence ?
                </div>
                <Button
                  variant="primary"
                  onClick={() => handleRespondToInvitation('confirmed')}
                  isLoading={isResponding}
                  className="flex-1"
                >
                  ✓ Confirmer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRespondToInvitation('maybe')}
                  isLoading={isResponding}
                  className="flex-1"
                >
                  ? Peut-être
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleRespondToInvitation('declined')}
                  isLoading={isResponding}
                  className="flex-1"
                >
                  ✗ Décliner
                </Button>
              </div>
            )}

            {/* Join/Leave for players (not invited or already responded) */}
            {!isCoachOrManager &&
             session.status !== 'completed' &&
             session.status !== 'cancelled' &&
             (!myParticipation || myParticipation.response_status !== 'pending') && (
              <>
                {isParticipant ? (
                  <Button variant="danger" onClick={handleLeave}>
                    Quitter la session
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleJoin}>
                    S'inscrire
                  </Button>
                )}
              </>
            )}

            {/* Edit/Delete for coaches/managers */}
            {isCoachOrManager && (isCreator || user?.role === 'MANAGER') && (
              <>
                {onEdit && (
                  <Button variant="primary" onClick={onEdit}>
                    ✏️ Modifier
                  </Button>
                )}
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                >
                  🗑️ Supprimer
                </Button>
              </>
            )}

            <Button variant="outline" onClick={onClose} className="ml-auto">
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
