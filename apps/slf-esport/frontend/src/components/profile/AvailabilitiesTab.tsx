/**
 * Availabilities Tab - Player availability management (recurring + specific dates + editing)
 * @author Jay "The Ermite" Goncalves
 * @copyright La Voie Shinkofa - La Salade de Fruits
 */

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button, Input } from '@/components/ui'
import { availabilityService } from '@/services/availabilityService'
import type {
  PlayerAvailability,
  PlayerAvailabilityCreate,
  PlayerAvailabilityUpdate,
  PlayerAvailabilityException,
  PlayerAvailabilityExceptionCreate,
  DayOfWeek
} from '@/types/availability'

const DAYS = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
] as const

export default function AvailabilitiesTab() {
  const [availabilities, setAvailabilities] = useState<PlayerAvailability[]>([])
  const [exceptions, setExceptions] = useState<PlayerAvailabilityException[]>([])
  const [loadingAvailabilities, setLoadingAvailabilities] = useState(true)
  const [loadingExceptions, setLoadingExceptions] = useState(true)

  // Form states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [availabilityType, setAvailabilityType] = useState<'recurring' | 'specific'>('recurring')
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(1)
  const [specificDate, setSpecificDate] = useState('')
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('22:00')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Exception form states
  const [showExceptionForm, setShowExceptionForm] = useState(false)
  const [exceptionDate, setExceptionDate] = useState('')
  const [exceptionStartTime, setExceptionStartTime] = useState('')
  const [exceptionEndTime, setExceptionEndTime] = useState('')
  const [isUnavailable, setIsUnavailable] = useState(true)
  const [exceptionReason, setExceptionReason] = useState('')
  const [submittingException, setSubmittingException] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    loadAvailabilities()
    loadExceptions()
  }, [])

  const loadAvailabilities = async () => {
    try {
      setLoadingAvailabilities(true)
      const data = await availabilityService.getMyAvailabilities()
      setAvailabilities(data)
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

  const handleEditAvailability = (availability: PlayerAvailability) => {
    setEditingId(availability.id)
    setAvailabilityType(availability.specific_date ? 'specific' : 'recurring')
    if (availability.specific_date) {
      setSpecificDate(availability.specific_date)
    } else {
      setDayOfWeek(availability.day_of_week as DayOfWeek)
    }
    setStartTime(availability.start_time.substring(0, 5))
    setEndTime(availability.end_time.substring(0, 5))
    setNotes(availability.notes || '')
    setShowAddForm(true)
  }

  const resetForm = () => {
    setEditingId(null)
    setShowAddForm(false)
    setAvailabilityType('recurring')
    setDayOfWeek(1)
    setSpecificDate('')
    setStartTime('18:00')
    setEndTime('22:00')
    setNotes('')
    setError('')
  }

  const handleSubmitAvailability = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const data: PlayerAvailabilityCreate | PlayerAvailabilityUpdate = availabilityType === 'recurring'
        ? {
            day_of_week: dayOfWeek,
            specific_date: null,
            start_time: startTime,
            end_time: endTime,
            is_active: true,
            notes: notes || undefined,
          }
        : {
            day_of_week: null,
            specific_date: specificDate,
            start_time: startTime,
            end_time: endTime,
            is_active: true,
            notes: notes || undefined,
          }

      if (editingId) {
        await availabilityService.updateAvailability(editingId, data)
      } else {
        await availabilityService.createAvailability(data as PlayerAvailabilityCreate)
      }

      await loadAvailabilities()
      resetForm()
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'opération')
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

  const recurringAvailabilities = availabilities.filter(a => !a.specific_date)
  const specificAvailabilities = availabilities.filter(a => a.specific_date)

  return (
    <div className="p-6 space-y-6">
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

      {/* Add/Edit form */}
      {showAddForm && (
        <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? '✏️ Modifier la disponibilité' : '➕ Nouvelle disponibilité'}
          </h3>

          <form onSubmit={handleSubmitAvailability} className="space-y-4">
            {/* Type toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={availabilityType === 'recurring'}
                    onChange={() => setAvailabilityType('recurring')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm">🔄 Récurrente (chaque semaine)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={availabilityType === 'specific'}
                    onChange={() => setAvailabilityType('specific')}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm">📅 Date spécifique</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availabilityType === 'recurring' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Jour *
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value) as DayOfWeek)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:text-white"
                    required
                  >
                    {DAYS.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <Input
                    label="Date *"
                    type="date"
                    value={specificDate}
                    onChange={(e) => setSpecificDate(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Horaire *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Input
              label="Notes (optionnel)"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Préférence pour certains types de sessions"
            />

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                Annuler
              </Button>
              <Button type="submit" variant="primary" disabled={submitting} className="flex-1">
                {submitting ? (editingId ? 'Modification...' : 'Ajout...') : (editingId ? 'Modifier' : 'Ajouter')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Section 1: Recurring */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🔄 Disponibilités régulières
          </h3>
          {!showAddForm && (
            <Button
              variant="primary"
              onClick={() => {
                resetForm()
                setAvailabilityType('recurring')
                setShowAddForm(true)
              }}
              className="text-sm"
            >
              + Ajouter
            </Button>
          )}
        </div>

        {loadingAvailabilities ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : recurringAvailabilities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            Aucune disponibilité régulière
          </div>
        ) : (
          <div className="space-y-2">
            {recurringAvailabilities
              .sort((a, b) => (a.day_of_week ?? 0) - (b.day_of_week ?? 0))
              .map(avail => (
                <div
                  key={avail.id}
                  className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{getDayLabel(avail.day_of_week as DayOfWeek)}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {avail.start_time.substring(0, 5)} - {avail.end_time.substring(0, 5)}
                      </span>
                    </div>
                    {avail.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💬 {avail.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditAvailability(avail)}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                      title="Modifier"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteAvailability(avail.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title="Supprimer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Section 2: Specific dates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📅 Disponibilités spécifiques
          </h3>
          {!showAddForm && (
            <Button
              variant="outline"
              onClick={() => {
                resetForm()
                setAvailabilityType('specific')
                setShowAddForm(true)
              }}
              className="text-sm"
            >
              + Ajouter
            </Button>
          )}
        </div>

        {loadingAvailabilities ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : specificAvailabilities.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            Aucune disponibilité spécifique
          </div>
        ) : (
          <div className="space-y-2">
            {specificAvailabilities
              .sort((a, b) => (a.specific_date ?? '').localeCompare(b.specific_date ?? ''))
              .map(avail => {
                const dateObj = avail.specific_date ? new Date(avail.specific_date + 'T00:00:00') : null

                return (
                  <div
                    key={avail.id}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">
                          {dateObj ? format(dateObj, 'EEE d MMM yyyy', { locale: fr }) : avail.specific_date}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {avail.start_time.substring(0, 5)} - {avail.end_time.substring(0, 5)}
                        </span>
                      </div>
                      {avail.notes && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💬 {avail.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditAvailability(avail)}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteAvailability(avail.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>

      {/* Section 3: Exceptions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ⚠️ Exceptions
          </h3>
          <Button
            variant="outline"
            onClick={() => setShowExceptionForm(!showExceptionForm)}
            className="text-sm"
          >
            {showExceptionForm ? 'Annuler' : '+ Ajouter'}
          </Button>
        </div>

        {showExceptionForm && (
          <form onSubmit={handleAddException} className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="space-y-4">
              <Input
                label="Date *"
                type="date"
                value={exceptionDate}
                onChange={(e) => setExceptionDate(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={isUnavailable}
                      onChange={() => setIsUnavailable(true)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">❌ Absence</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isUnavailable}
                      onChange={() => setIsUnavailable(false)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">✅ Disponibilité exceptionnelle</span>
                  </label>
                </div>
              </div>

              {!isUnavailable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horaire *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="time"
                      value={exceptionStartTime}
                      onChange={(e) => setExceptionStartTime(e.target.value)}
                      required={!isUnavailable}
                    />
                    <Input
                      type="time"
                      value={exceptionEndTime}
                      onChange={(e) => setExceptionEndTime(e.target.value)}
                      required={!isUnavailable}
                    />
                  </div>
                </div>
              )}

              <Input
                label="Raison (optionnel)"
                type="text"
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
                placeholder="Ex: Examen, événement familial..."
              />

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowExceptionForm(false)} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" variant="warning" disabled={submittingException} className="flex-1">
                  {submittingException ? 'Ajout...' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </form>
        )}

        {loadingExceptions ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : exceptions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            Aucune exception
          </div>
        ) : (
          <div className="space-y-2">
            {exceptions.map(exception => {
              const exceptionDateObj = new Date(exception.exception_date + 'T00:00:00')

              return (
                <div
                  key={exception.id}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    exception.is_unavailable
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span>{exception.is_unavailable ? '❌' : '✅'}</span>
                      <span className="font-medium">
                        {format(exceptionDateObj, 'EEE d MMM yyyy', { locale: fr })}
                      </span>
                      {!exception.is_unavailable && exception.start_time && exception.end_time && (
                        <span className="text-gray-600 dark:text-gray-400">
                          {exception.start_time} - {exception.end_time}
                        </span>
                      )}
                    </div>
                    {exception.reason && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">💬 {exception.reason}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteException(exception.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
