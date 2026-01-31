/**
 * Team Availabilities Tab - View team members' availabilities (coaches only)
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui'
import { availabilityService } from '@/services/availabilityService'
import type { TeamMemberAvailability, DayOfWeek } from '@/types/availability'

const DAYS = [
  { value: 0, label: 'Dimanche' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
] as const

export default function TeamAvailabilitiesTab() {
  const [availabilities, setAvailabilities] = useState<TeamMemberAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [teamOnly, setTeamOnly] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTeamAvailabilities()
  }, [teamOnly])

  const loadTeamAvailabilities = async () => {
    try {
      setLoading(true)
      const data = await availabilityService.getTeamAvailabilities(teamOnly)
      setAvailabilities(data)
    } catch (err: any) {
      console.error('Failed to load team availabilities:', err)
      setError(err.response?.data?.detail || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const getDayLabel = (dayOfWeek: DayOfWeek | null) => {
    if (dayOfWeek === null) return null
    const day = DAYS.find(d => d.value === dayOfWeek)
    return day ? day.label : `Jour ${dayOfWeek}`
  }

  // Group by user
  const groupedByUser: Record<string, TeamMemberAvailability[]> = {}
  availabilities.forEach(avail => {
    const key = `${avail.user_id}-${avail.username}`
    if (!groupedByUser[key]) {
      groupedByUser[key] = []
    }
    groupedByUser[key].push(avail)
  })

  return (
    <div className="space-y-6">
      {/* Filter toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrer par :
          </span>
          <div className="flex gap-2">
            <Button
              variant={teamOnly ? 'primary' : 'outline'}
              onClick={() => setTeamOnly(true)}
              className="text-sm"
            >
              Team uniquement
            </Button>
            <Button
              variant={!teamOnly ? 'primary' : 'outline'}
              onClick={() => setTeamOnly(false)}
              className="text-sm"
            >
              Tous les joueurs
            </Button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg">
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

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : Object.keys(groupedByUser).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
          <div className="text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Aucune disponibilité trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Aucun membre n'a encore défini ses disponibilités
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByUser)
            .sort(([keyA], [keyB]) => {
              const usernameA = keyA.split('-')[1]
              const usernameB = keyB.split('-')[1]
              return usernameA.localeCompare(usernameB)
            })
            .map(([key, userAvailabilities]) => {
              const [userId, username] = key.split('-')
              const recurringAvails = userAvailabilities.filter(a => !a.specific_date)
              const specificAvails = userAvailabilities.filter(a => a.specific_date)

              return (
                <div key={key} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                  {/* User header */}
                  <div className="bg-primary-600 dark:bg-primary-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-primary-600">
                          {username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">
                            {username}
                          </h2>
                          <p className="text-xs text-primary-100">
                            {userAvailabilities.length} disponibilité{userAvailabilities.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User availabilities */}
                  <div className="p-6">
                    {/* Recurring */}
                    {recurringAvails.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span>🔄</span>
                          <span>Régulières</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {recurringAvails
                            .sort((a, b) => (a.day_of_week ?? 0) - (b.day_of_week ?? 0))
                            .map(avail => (
                              <div
                                key={avail.id}
                                className={`p-2 rounded border text-sm ${
                                  avail.is_active
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{getDayLabel(avail.day_of_week)}</span>
                                  {!avail.is_active && (
                                    <span className="text-xs text-gray-500">Inactif</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  ⏰ {avail.start_time.substring(0, 5)} - {avail.end_time.substring(0, 5)}
                                </p>
                                {avail.notes && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    💬 {avail.notes}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Specific */}
                    {specificAvails.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <span>📅</span>
                          <span>Spécifiques</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {specificAvails
                            .sort((a, b) => (a.specific_date ?? '').localeCompare(b.specific_date ?? ''))
                            .map(avail => {
                              const dateObj = avail.specific_date ? new Date(avail.specific_date + 'T00:00:00') : null

                              return (
                                <div
                                  key={avail.id}
                                  className={`p-2 rounded border text-sm ${
                                    avail.is_active
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-60'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      {dateObj ? format(dateObj, 'EEE d MMM', { locale: fr }) : avail.specific_date}
                                    </span>
                                    {!avail.is_active && (
                                      <span className="text-xs text-gray-500">Inactif</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    ⏰ {avail.start_time.substring(0, 5)} - {avail.end_time.substring(0, 5)}
                                  </p>
                                  {avail.notes && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      💬 {avail.notes}
                                    </p>
                                  )}
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}

                    {/* No availabilities */}
                    {recurringAvails.length === 0 && specificAvails.length === 0 && (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
                        Aucune disponibilité définie
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
