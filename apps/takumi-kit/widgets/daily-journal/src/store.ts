/**
 * Daily Journal Store - Zustand state management
 * Standalone store for gratitude journal with mood check-ins
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'ermite_daily_journal_widget'
const API_BASE = '/api/v1/widget-data'
const WIDGET_SLUG = 'daily-journal'

// API Sync configuration
let apiConfig: { enabled: boolean; userId: string; token: string | null } = {
  enabled: false,
  userId: 'anonymous',
  token: null,
}

export const configureApiSync = (config: { enabled: boolean; userId: string; token?: string }) => {
  apiConfig = { ...apiConfig, ...config, token: config.token || null }
}

// API Helper functions
const syncToApi = async (data: { journals: Record<string, DailyJournal>; lastUpdated: string }) => {
  if (!apiConfig.enabled) {
    console.debug('[DailyJournal] API sync disabled')
    return
  }
  if (!apiConfig.token) {
    console.warn('[DailyJournal] API sync skipped: token not configured. Call configureApiSync() with a valid token.')
    return
  }

  try {
    const response = await fetch(`${API_BASE}/${WIDGET_SLUG}/${apiConfig.userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiConfig.token}`,
      },
      body: JSON.stringify({ data }),
    })
    if (!response.ok) {
      console.warn('Failed to sync to API:', response.statusText)
    }
  } catch (error) {
    console.warn('API sync failed:', error)
  }
}

export const loadFromApi = async (): Promise<{ journals: Record<string, DailyJournal>; lastUpdated: string } | null> => {
  if (!apiConfig.enabled || !apiConfig.token) return null

  try {
    const response = await fetch(`${API_BASE}/${WIDGET_SLUG}/${apiConfig.userId}`, {
      headers: {
        Authorization: `Bearer ${apiConfig.token}`,
      },
    })
    if (response.ok) {
      const result = await response.json()
      // API returns null when no data exists, or an object with .data property
      if (result && result.data) {
        return result.data
      }
      return null
    }
  } catch (error) {
    console.warn('Failed to load from API:', error)
  }
  return null
}

// Types
export interface MoodCheckIn {
  id: string
  timestamp: string
  physical: number // 0-10
  emotional: number // 0-10
  mental: number // 0-10
  note?: string
}

export interface DailyJournal {
  date: string // YYYY-MM-DD
  energyMorning: number // 0-10
  energyEvening: number // 0-10
  gratitudes: [string, string, string]
  successes: [string, string, string]
  learning: string
  adjustments: string
  moodCheckIns: MoodCheckIn[]
}

interface JournalStore {
  journals: Record<string, DailyJournal> // keyed by date
  lastUpdated: string

  // Journal actions
  getOrCreateJournal: (date: string) => DailyJournal
  updateJournal: (date: string, updates: Partial<DailyJournal>) => void

  // Mood check-in actions
  addMoodCheckIn: (date: string, checkIn: Omit<MoodCheckIn, 'id' | 'timestamp'>) => void
  deleteMoodCheckIn: (date: string, checkInId: string) => void

  // Utilities
  getTodayJournal: () => DailyJournal
  getJournalStats: (date: string) => {
    avgPhysical: number
    avgEmotional: number
    avgMental: number
    checkInsCount: number
  }
  exportJournal: (date: string) => string
  exportData: () => string
  importData: (json: string) => boolean
}

const createEmptyJournal = (date: string): DailyJournal => ({
  date,
  energyMorning: 5,
  energyEvening: 5,
  gratitudes: ['', '', ''],
  successes: ['', '', ''],
  learning: '',
  adjustments: '',
  moodCheckIns: [],
})

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0]
}

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      journals: {},
      lastUpdated: new Date().toISOString(),

      getOrCreateJournal: (date) => {
        const state = get()
        if (state.journals[date]) {
          return state.journals[date]
        }
        const newJournal = createEmptyJournal(date)
        const newState = {
          journals: { ...state.journals, [date]: newJournal },
          lastUpdated: new Date().toISOString(),
        }
        set(() => newState)
        syncToApi(newState)
        return newJournal
      },

      updateJournal: (date, updates) => {
        const now = new Date().toISOString()
        set((state) => {
          const existing = state.journals[date] || createEmptyJournal(date)
          const newState = {
            journals: {
              ...state.journals,
              [date]: { ...existing, ...updates },
            },
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      addMoodCheckIn: (date, checkInData) => {
        const now = new Date().toISOString()
        const newCheckIn: MoodCheckIn = {
          ...checkInData,
          id: `checkin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: now,
        }
        set((state) => {
          const existing = state.journals[date] || createEmptyJournal(date)
          const newState = {
            journals: {
              ...state.journals,
              [date]: {
                ...existing,
                moodCheckIns: [...existing.moodCheckIns, newCheckIn],
              },
            },
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      deleteMoodCheckIn: (date, checkInId) => {
        const now = new Date().toISOString()
        set((state) => {
          const existing = state.journals[date]
          if (!existing) return state
          const newState = {
            journals: {
              ...state.journals,
              [date]: {
                ...existing,
                moodCheckIns: existing.moodCheckIns.filter((c) => c.id !== checkInId),
              },
            },
            lastUpdated: now,
          }
          syncToApi(newState)
          return newState
        })
      },

      getTodayJournal: () => {
        const today = getTodayDate()
        return get().getOrCreateJournal(today)
      },

      getJournalStats: (date) => {
        const journal = get().journals[date]
        if (!journal || journal.moodCheckIns.length === 0) {
          return { avgPhysical: 0, avgEmotional: 0, avgMental: 0, checkInsCount: 0 }
        }
        const checkIns = journal.moodCheckIns
        const avgPhysical = checkIns.reduce((sum, c) => sum + c.physical, 0) / checkIns.length
        const avgEmotional = checkIns.reduce((sum, c) => sum + c.emotional, 0) / checkIns.length
        const avgMental = checkIns.reduce((sum, c) => sum + c.mental, 0) / checkIns.length
        return {
          avgPhysical: Math.round(avgPhysical * 10) / 10,
          avgEmotional: Math.round(avgEmotional * 10) / 10,
          avgMental: Math.round(avgMental * 10) / 10,
          checkInsCount: checkIns.length,
        }
      },

      exportJournal: (date) => {
        const journal = get().journals[date]
        if (!journal) return ''

        const stats = get().getJournalStats(date)
        const avgEnergy = (journal.energyMorning + journal.energyEvening) / 2
        const energyStatus = avgEnergy >= 7 ? 'high' : avgEnergy >= 4 ? 'medium' : 'low'
        const now = new Date()
        const dateObj = new Date(date)
        const formattedDate = dateObj.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')

        return `---
type: journal-quotidien
date: ${date}
tags:
  - journal
  - gratitude
  - ermite
  - energie/${energyStatus}
  - annee/${year}
  - mois/${year}-${month}
energie-matin: ${journal.energyMorning}
energie-soir: ${journal.energyEvening}
energie-moyenne: ${avgEnergy.toFixed(1)}
checkins-total: ${stats.checkInsCount}
checkins-physique-moy: ${stats.avgPhysical}
checkins-emotionnel-moy: ${stats.avgEmotional}
checkins-mental-moy: ${stats.avgMental}
created: ${now.toISOString()}
---

# Journal Quotidien - ${formattedDate}

---

## Energie Matin: ${journal.energyMorning}/10

---

## 3 Gratitudes

${journal.gratitudes[0] ? `1. ${journal.gratitudes[0]}` : '1. _Non renseigne_'}
${journal.gratitudes[1] ? `2. ${journal.gratitudes[1]}` : '2. _Non renseigne_'}
${journal.gratitudes[2] ? `3. ${journal.gratitudes[2]}` : '3. _Non renseigne_'}

## 3 Reussites

${journal.successes[0] ? `1. ${journal.successes[0]}` : '1. _Non renseigne_'}
${journal.successes[1] ? `2. ${journal.successes[1]}` : '2. _Non renseigne_'}
${journal.successes[2] ? `3. ${journal.successes[2]}` : '3. _Non renseigne_'}

## 1 Apprentissage

${journal.learning || '_Non renseigne_'}

## Ajustements pour Demain

${journal.adjustments || '_Non renseigne_'}

---

## Check-ins Emotionnels

${
  journal.moodCheckIns.length > 0
    ? journal.moodCheckIns
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((c) => {
          const time = new Date(c.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          const avg = ((c.physical + c.emotional + c.mental) / 3).toFixed(1)
          return `**${time}** - Moyenne: ${avg}/10
- Physique: ${c.physical}/10
- Emotionnel: ${c.emotional}/10
- Mental: ${c.mental}/10${c.note ? `\n- Note: _${c.note}_` : ''}`
        })
        .join('\n\n')
    : '_Aucun check-in enregistre_'
}

---

## Energie Soir: ${journal.energyEvening}/10

---

| Metrique | Valeur |
|----------|--------|
| Energie matin -> soir | ${journal.energyMorning} -> ${journal.energyEvening} |
| Gratitudes renseignees | ${journal.gratitudes.filter((g) => g.trim()).length}/3 |
| Reussites renseignees | ${journal.successes.filter((s) => s.trim()).length}/3 |
| Check-ins | ${stats.checkInsCount} |
${stats.checkInsCount > 0 ? `| Moyenne physique | ${stats.avgPhysical}/10 |\n| Moyenne emotionnelle | ${stats.avgEmotional}/10 |\n| Moyenne mentale | ${stats.avgMental}/10 |` : ''}

---

_Genere avec Ermite Toolbox - Daily Journal_
`
      },

      exportData: () => {
        const state = get()
        return JSON.stringify(
          {
            journals: state.journals,
            lastUpdated: state.lastUpdated,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        )
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json)
          if (data.journals) {
            const newState = {
              journals: data.journals,
              lastUpdated: new Date().toISOString(),
            }
            set(newState)
            syncToApi(newState)
            return true
          }
          return false
        } catch {
          return false
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        journals: state.journals,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
)
