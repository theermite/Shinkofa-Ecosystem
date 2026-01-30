/**
 * JournalDailyForm Component - Daily journal entry form
 * Shinkofa Platform - Frontend
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toast } from '@/components/ui/Toast'
import { EnergySlider } from './EnergySlider'
import { useJournalByDate, useCreateJournal, useUpdateJournal } from '@/hooks/api/useJournals'
import type { Journal } from '@/types/api'
import { format } from 'date-fns'

interface JournalDailyFormProps {
  date: string // YYYY-MM-DD
}

interface FormData {
  energy_morning: number
  energy_evening: number
  intentions: string
  gratitudes: [string, string, string]
  successes: [string, string, string]
  learning: string
  adjustments: string
}

const INITIAL_FORM_DATA: FormData = {
  energy_morning: 5,
  energy_evening: 5,
  intentions: '',
  gratitudes: ['', '', ''],
  successes: ['', '', ''],
  learning: '',
  adjustments: '',
}

export function JournalDailyForm({ date }: JournalDailyFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA)
  const [hasChanges, setHasChanges] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Fetch existing journal for this date
  const { data: existingJournal, isLoading } = useJournalByDate(date)

  // Mutations
  const createJournal = useCreateJournal()
  const updateJournal = useUpdateJournal()

  // Reset form when date changes or when data is loaded
  useEffect(() => {
    // Mark as initial load when date changes
    setIsInitialLoad(true)
    setHasChanges(false)

    if (isLoading) {
      // While loading, don't update form data yet
      return
    }

    if (existingJournal) {
      setFormData({
        energy_morning: existingJournal.energy_morning,
        energy_evening: existingJournal.energy_evening,
        intentions: existingJournal.intentions,
        gratitudes: [
          existingJournal.gratitudes[0] || '',
          existingJournal.gratitudes[1] || '',
          existingJournal.gratitudes[2] || '',
        ],
        successes: [
          existingJournal.successes[0] || '',
          existingJournal.successes[1] || '',
          existingJournal.successes[2] || '',
        ],
        learning: existingJournal.learning,
        adjustments: existingJournal.adjustments,
      })
    } else {
      setFormData(INITIAL_FORM_DATA)
    }

    // Allow changes to be tracked after initial load
    setTimeout(() => setIsInitialLoad(false), 100)
  }, [date, existingJournal, isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setToastMessage(null)

    const payload = {
      date,
      energy_morning: formData.energy_morning,
      energy_evening: formData.energy_evening,
      intentions: formData.intentions,
      gratitudes: formData.gratitudes.filter((g) => g.trim() !== ''),
      successes: formData.successes.filter((s) => s.trim() !== ''),
      learning: formData.learning,
      adjustments: formData.adjustments,
    }

    if (existingJournal) {
      updateJournal.mutate(
        { journalId: existingJournal.id, input: payload },
        {
          onSuccess: () => {
            setHasChanges(false)
            setToastMessage({ type: 'success', message: 'Journal sauvegardé avec succès' })
          },
          onError: (error) => {
            console.error('Failed to update journal:', error)
            setToastMessage({ type: 'error', message: 'Erreur lors de la sauvegarde' })
          },
        }
      )
    } else {
      createJournal.mutate(payload, {
        onSuccess: () => {
          setHasChanges(false)
          setToastMessage({ type: 'success', message: 'Journal créé avec succès' })
        },
        onError: (error) => {
          console.error('Failed to create journal:', error)
          setToastMessage({ type: 'error', message: 'Erreur lors de la création' })
        },
      })
    }
  }

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Only mark as changed if not during initial load
    if (!isInitialLoad) {
      setHasChanges(true)
    }
  }

  const updateGratitude = (index: number, value: string) => {
    const newGratitudes = [...formData.gratitudes] as [string, string, string]
    newGratitudes[index] = value
    updateField('gratitudes', newGratitudes)
  }

  const updateSuccess = (index: number, value: string) => {
    const newSuccesses = [...formData.successes] as [string, string, string]
    newSuccesses[index] = value
    updateField('successes', newSuccesses)
  }

  // Auto-save on blur
  const handleBlur = () => {
    if (hasChanges && !isSaving && !isInitialLoad) {
      handleSubmit(new Event('submit') as any)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const isSaving = createJournal.isPending || updateJournal.isPending

  return (
    <>
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
        {/* Header */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  📔 Journal du {format(new Date(date), 'dd/MM/yyyy')}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {existingJournal
                    ? 'Modifiez votre journal quotidien'
                    : 'Créez votre journal quotidien'}
                </p>
              </div>
              <div className="text-right">
                {hasChanges && (
                  <span className="text-sm text-orange-600 dark:text-orange-400">
                    ● Modifications non sauvegardées
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Levels */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">⚡ Énergie</h3>

            <EnergySlider
              label="Énergie du matin"
              value={formData.energy_morning}
              onChange={(value) => updateField('energy_morning', value)}
              onBlur={handleBlur}
              disabled={isSaving}
            />

            <EnergySlider
              label="Énergie du soir"
              value={formData.energy_evening}
              onChange={(value) => updateField('energy_evening', value)}
              onBlur={handleBlur}
              disabled={isSaving}
            />
          </CardContent>
        </Card>

        {/* Intentions */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">🎯 Intentions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Qu'est-ce que vous souhaitez accomplir aujourd'hui ?
            </p>
            <textarea
              value={formData.intentions}
              onChange={(e) => updateField('intentions', e.target.value)}
              onBlur={handleBlur}
              disabled={isSaving}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
              placeholder="Écrivez vos intentions pour aujourd'hui..."
            />
          </CardContent>
        </Card>

        {/* Gratitudes */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">🙏 Gratitudes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trois choses pour lesquelles vous êtes reconnaissant(e)
            </p>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[2rem]">
                    {index + 1}.
                  </span>
                  <Input
                    value={formData.gratitudes[index]}
                    onChange={(e) => updateGratitude(index, e.target.value)}
                    onBlur={handleBlur}
                    disabled={isSaving}
                    placeholder={`Gratitude ${index + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Successes */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">✨ Succès</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Trois victoires ou accomplissements du jour
            </p>
            <div className="space-y-3">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[2rem]">
                    {index + 1}.
                  </span>
                  <Input
                    value={formData.successes[index]}
                    onChange={(e) => updateSuccess(index, e.target.value)}
                    onBlur={handleBlur}
                    disabled={isSaving}
                    placeholder={`Succès ${index + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">📚 Apprentissage</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Qu'avez-vous appris aujourd'hui ?
            </p>
            <textarea
              value={formData.learning}
              onChange={(e) => updateField('learning', e.target.value)}
              onBlur={handleBlur}
              disabled={isSaving}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
              placeholder="Partagez ce que vous avez appris..."
            />
          </CardContent>
        </Card>

        {/* Adjustments */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">🔧 Ajustements</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Que pourriez-vous ajuster ou améliorer demain ?
            </p>
            <textarea
              value={formData.adjustments}
              onChange={(e) => updateField('adjustments', e.target.value)}
              onBlur={handleBlur}
              disabled={isSaving}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
              placeholder="Notez vos pistes d'amélioration..."
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                {existingJournal && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dernière modification :{' '}
                    {format(new Date(existingJournal.updated_at), 'dd/MM/yyyy à HH:mm')}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sauvegarde...
                  </>
                ) : existingJournal ? (
                  <>💾 Mettre à jour</>
                ) : (
                  <>✅ Créer le journal</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
    </>
  )
}
