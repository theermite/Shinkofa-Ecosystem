/**
 * Team Availability Calendar - Visual calendar view of team members' availabilities
 * @author Jay "The Ermite" Goncalves - TAKUMI
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState, useEffect, useMemo } from 'react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui'
import { availabilityService } from '@/services/availabilityService'
import type { TeamMemberAvailability, DayOfWeek } from '@/types/availability'

const DAYS = [
  { value: 0, label: 'Dimanche', short: 'Dim' },
  { value: 1, label: 'Lundi', short: 'Lun' },
  { value: 2, label: 'Mardi', short: 'Mar' },
  { value: 3, label: 'Mercredi', short: 'Mer' },
  { value: 4, label: 'Jeudi', short: 'Jeu' },
  { value: 5, label: 'Vendredi', short: 'Ven' },
  { value: 6, label: 'Samedi', short: 'Sam' },
] as const

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8) // 8:00 - 23:00

export default function TeamAvailabilityCalendar() {
  const [availabilities, setAvailabilities] = useState<TeamMemberAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [teamOnly, setTeamOnly] = useState(true)
  const [error, setError] = useState('')
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Start on Monday
  )

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

  // Generate week days array
  const weekDays = useMemo(() => {
    return DAYS.map((day, index) => {
      const date = addDays(currentWeekStart, index)
      return { ...day, date }
    })
  }, [currentWeekStart])

  // Group availabilities by user
  const userAvailabilities = useMemo(() => {
    const grouped: Record<string, {
      userId: number
      username: string
      email: string
      availabilities: TeamMemberAvailability[]
    }> = {}

    availabilities.forEach(avail => {
      const key = `${avail.user_id}`
      if (!grouped[key]) {
        grouped[key] = {
          userId: avail.user_id,
          username: avail.username,
          email: avail.email,
          availabilities: []
        }
      }
      grouped[key].availabilities.push(avail)
    })

    return Object.values(grouped).sort((a, b) => a.username.localeCompare(b.username))
  }, [availabilities])

  // Check if a user is available for a specific day and time slot
  const isUserAvailable = (
    userAvails: TeamMemberAvailability[],
    dayOfWeek: number,
    hour: number,
    date: Date
  ): { available: boolean; reason?: string } => {
    // Check specific date availabilities first
    const specificDateStr = format(date, 'yyyy-MM-dd')
    const specificAvails = userAvails.filter(a => a.specific_date === specificDateStr && a.is_active)

    for (const avail of specificAvails) {
      const startHour = parseInt(avail.start_time.split(':')[0])
      const endHour = parseInt(avail.end_time.split(':')[0])
      const endMinute = parseInt(avail.end_time.split(':')[1])

      // If end minute > 0, the end hour slot is included
      const effectiveEndHour = endMinute > 0 ? endHour : endHour - 1

      if (hour >= startHour && hour <= effectiveEndHour) {
        return { available: true, reason: avail.notes || 'Disponible' }
      }
    }

    // Check recurring availabilities
    const recurringAvails = userAvails.filter(
      a => a.day_of_week === dayOfWeek && !a.specific_date && a.is_active
    )

    for (const avail of recurringAvails) {
      const startHour = parseInt(avail.start_time.split(':')[0])
      const endHour = parseInt(avail.end_time.split(':')[0])
      const endMinute = parseInt(avail.end_time.split(':')[1])

      const effectiveEndHour = endMinute > 0 ? endHour : endHour - 1

      if (hour >= startHour && hour <= effectiveEndHour) {
        return { available: true, reason: avail.notes || 'Disponible' }
      }
    }

    return { available: false }
  }

  const handlePreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7))
  }

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7))
  }

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <svg className="animate-spin h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Week navigation */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handlePreviousWeek} className="text-sm">
              ← Semaine précédente
            </Button>
            <Button variant="primary" onClick={handleToday} className="text-sm">
              Aujourd'hui
            </Button>
            <Button variant="outline" onClick={handleNextWeek} className="text-sm">
              Semaine suivante →
            </Button>
          </div>

          {/* Current week display */}
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {format(weekDays[0].date, 'd MMM', { locale: fr })} - {format(weekDays[6].date, 'd MMM yyyy', { locale: fr })}
            </p>
          </div>

          {/* Filter toggle */}
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
              Tous
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

      {userAvailabilities.length === 0 ? (
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-primary-600 dark:bg-primary-700 text-white font-bold px-4 py-3 text-left border-r-2 border-primary-700 dark:border-primary-600 min-w-[120px]">
                  Joueur
                </th>
                {weekDays.map(day => (
                  <th
                    key={day.value}
                    className={`bg-primary-600 dark:bg-primary-700 text-white font-bold px-2 py-3 text-center border-r border-primary-700 dark:border-primary-600 min-w-[100px] ${
                      isSameDay(day.date, new Date()) ? 'bg-primary-500 dark:bg-primary-600' : ''
                    }`}
                  >
                    <div className="text-sm">{day.short}</div>
                    <div className="text-xs font-normal text-primary-100">
                      {format(day.date, 'd MMM', { locale: fr })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userAvailabilities.map(user => (
                <tr key={user.userId} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-4 py-3 border-r-2 border-gray-300 dark:border-gray-600 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{user.username}</span>
                    </div>
                  </td>
                  {weekDays.map(day => {
                    // Count available slots for this day
                    const availableSlots = HOURS.filter(hour =>
                      isUserAvailable(user.availabilities, day.value, hour, day.date).available
                    ).length

                    const hasAvailability = availableSlots > 0

                    return (
                      <td
                        key={day.value}
                        className={`border-r border-gray-200 dark:border-gray-700 p-2 text-center ${
                          isSameDay(day.date, new Date()) ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        {hasAvailability ? (
                          <div className="space-y-1">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              ✓
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {availableSlots}h
                            </div>
                            {/* Time range preview */}
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {(() => {
                                const availHours = HOURS.filter(h =>
                                  isUserAvailable(user.availabilities, day.value, h, day.date).available
                                )
                                if (availHours.length > 0) {
                                  const min = Math.min(...availHours)
                                  const max = Math.max(...availHours)
                                  return `${min}h-${max + 1}h`
                                }
                                return ''
                              })()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-xl text-gray-300 dark:text-gray-700">
                            −
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          📖 Légende
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg text-green-600">✓</span>
            <span className="text-gray-700 dark:text-gray-300">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg text-gray-300 dark:text-gray-700">−</span>
            <span className="text-gray-700 dark:text-gray-300">Non disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded"></div>
            <span className="text-gray-700 dark:text-gray-300">Aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* Help */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
              Astuce
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
              Cette vue montre un résumé des disponibilités par joueur et par jour. Le nombre d'heures affiche combien de créneaux horaires (entre 8h et 23h) chaque joueur a marqué comme disponible.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
