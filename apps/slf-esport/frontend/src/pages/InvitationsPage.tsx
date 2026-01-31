/**
 * Invitations Page - Manage session invitations
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { invitationService } from '@/services/availabilityService'
import { Button } from '@/components/ui'
import PageLayout from '@/components/layout/PageLayout'
import type { Session } from '@/types/session'
import { SESSION_TYPE_EMOJIS, SESSION_TYPE_LABELS } from '@/types/session'
import { INVITATION_STATUS_LABELS, INVITATION_STATUS_COLORS } from '@/types/availability'

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<number | null>(null)

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      setIsLoading(true)
      const data = await invitationService.getMyPendingInvitations()
      setInvitations(data)
    } catch (error) {
      console.error('Failed to load invitations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async (sessionId: number, responseStatus: string, declineReason?: string) => {
    try {
      setRespondingTo(sessionId)
      await invitationService.respondToInvitation(sessionId, responseStatus, declineReason)
      // Reload invitations to update the list
      await loadInvitations()
    } catch (error) {
      console.error('Failed to respond to invitation:', error)
      alert('Erreur lors de la réponse')
    } finally {
      setRespondingTo(null)
    }
  }

  // Helper to parse UTC dates correctly
  const parseUTCDate = (dateStr: string): Date => {
    const utcStr = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`
    return new Date(utcStr)
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Mes invitations
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos invitations aux sessions d'entraînement
        </p>
      </div>

      {invitations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Aucune invitation en attente
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Vous n'avez pas d'invitations aux sessions pour le moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitations.map((session) => {
            const startDate = parseUTCDate(session.start_time)
            const endDate = parseUTCDate(session.end_time)
            const isResponding = respondingTo === session.id

            return (
              <div
                key={session.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{SESSION_TYPE_EMOJIS[session.session_type]}</span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {session.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm px-3 py-1 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 font-semibold">
                        {SESSION_TYPE_LABELS[session.session_type]}
                      </span>
                    </div>
                  </div>
                </div>

                {session.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {session.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">📅 Date</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {format(startDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">⏰ Horaire</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {format(startDate, 'HH:mm', { locale: fr })} - {format(endDate, 'HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">⏱️ Durée</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {session.duration_minutes} minutes
                    </p>
                  </div>
                </div>

                {session.meeting_url && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">🔗 Lien</p>
                    <a
                      href={session.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
                    >
                      {session.meeting_url}
                    </a>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    onClick={() => handleRespond(session.id, 'confirmed')}
                    disabled={isResponding}
                    className="flex-1 sm:flex-none"
                  >
                    {isResponding ? 'En cours...' : '✅ Je serai présent'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRespond(session.id, 'maybe')}
                    disabled={isResponding}
                    className="flex-1 sm:flex-none"
                  >
                    🤔 Peut-être
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      const reason = prompt('Raison de votre absence (optionnel) :')
                      handleRespond(session.id, 'declined', reason || undefined)
                    }}
                    disabled={isResponding}
                    className="flex-1 sm:flex-none"
                  >
                    ❌ Je ne peux pas
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      </div>
    </PageLayout>
  )
}
