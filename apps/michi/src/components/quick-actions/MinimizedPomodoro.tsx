/**
 * MinimizedPomodoro - Widget flottant ultra-compact avec timer visible
 * Shinkofa Platform - Next.js 15
 * V2.1 - Design horizontal minimaliste
 */

'use client'

import { Maximize2, X } from 'lucide-react'
import { usePomodoro } from '@/contexts/PomodoroContext'

export function MinimizedPomodoro() {
  const { timeLeft, isRunning, isBreak, maximizePomodoro, closePomodoro } = usePomodoro()

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = isBreak
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-slide-up">
      {/* Widget horizontal compact */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-orange-500 dark:border-orange-400 overflow-hidden">
        {/* Progress bar en haut */}
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className={`h-full transition-all duration-1000 ${isBreak ? 'bg-green-500' : 'bg-orange-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Contenu horizontal */}
        <div className="flex items-center gap-3 px-3 py-2">
          {/* Status indicator + Label */}
          <div className="flex items-center gap-2 min-w-[70px]">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isBreak ? 'bg-green-500' : 'bg-orange-500'}`} />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">
              {isBreak ? '☕ Pause' : '🍅 Focus'}
            </span>
          </div>

          {/* Timer - Large et central */}
          <div className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums min-w-[90px] text-center">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          {/* Running indicator (optionnel, très discret) */}
          {isRunning && (
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
          )}

          {/* Boutons action */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={maximizePomodoro}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors rounded"
              title="Agrandir"
              aria-label="Agrandir Pomodoro"
            >
              <Maximize2 size={14} />
            </button>
            <button
              onClick={closePomodoro}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors rounded"
              title="Fermer"
              aria-label="Fermer Pomodoro"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
