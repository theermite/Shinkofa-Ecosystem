/**
 * QuickPomodoro - Modal Pomodoro avec support minimisation
 * Shinkofa Platform - Next.js 15
 * V3.0 - Sons personnalisables et arrêtables
 */

'use client'

import { Timer, Play, Pause, RotateCcw, X, Minimize2, Volume2, VolumeX, Square, Music } from 'lucide-react'
import { usePomodoro, SOUND_OPTIONS } from '@/contexts/PomodoroContext'

export function QuickPomodoro() {
  const {
    timeLeft,
    isRunning,
    isBreak,
    soundEnabled,
    soundVolume,
    soundType,
    isSoundPlaying,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    minimizePomodoro,
    closePomodoro,
    setSoundEnabled,
    setSoundVolume,
    setSoundType,
    testSound,
    stopSound,
  } = usePomodoro()

  const handleToggle = () => {
    if (isRunning) {
      pausePomodoro()
    } else {
      startPomodoro()
    }
  }

  const handlePomodoroClick = () => {
    // Arrêter le son si en cours de lecture
    if (isSoundPlaying) {
      stopSound()
    }
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = isBreak
    ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
    : ((25 * 60 - timeLeft) / (25 * 60)) * 100

  return (
    <>
      {/* Backdrop - z-40 pour permettre clic */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={minimizePomodoro}
      />

      {/* Modal content - z-50 pour être au-dessus du backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-slide-up pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation()
            handlePomodoroClick()
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Timer size={24} className="text-orange-500" />
              Pomodoro {isBreak ? '☕ Pause' : '🍅 Focus'}
            </h3>
            <div className="flex items-center gap-2">
              {/* Bouton Minimiser */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  minimizePomodoro()
                }}
                className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-lg transition-all font-medium"
                title="Minimiser le timer (continue en arrière-plan)"
                aria-label="Minimiser Pomodoro"
              >
                <Minimize2 size={18} />
                <span className="text-sm">Réduire</span>
              </button>
              {/* Bouton Fermer */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closePomodoro()
                }}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors rounded-lg"
                title="Fermer et arrêter le timer"
                aria-label="Fermer Pomodoro"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Timer display */}
          <div className="text-center">
            <div
              className={`text-6xl font-bold text-gray-900 dark:text-white mb-4 ${isSoundPlaying ? 'cursor-pointer' : ''}`}
              title={isSoundPlaying ? 'Cliquer pour arrêter le son' : undefined}
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* Indicateur son en cours */}
            {isSoundPlaying && (
              <div className="flex items-center justify-center gap-2 mb-4 text-orange-500 animate-pulse">
                <Music size={16} />
                <span className="text-sm">Son en cours - cliquer pour arrêter</span>
              </div>
            )}

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
              <div
                className={`h-full transition-all duration-1000 ${
                  isBreak ? 'bg-green-500' : 'bg-orange-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isBreak
                ? 'Profite de ta pause, tu le mérites !'
                : 'Concentre-toi sur une seule tâche'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleToggle()
              }}
              className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                isRunning
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause size={20} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={20} />
                  Démarrer
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                resetPomodoro()
              }}
              className="px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:border-orange-500 transition-colors flex items-center gap-2"
              title="Réinitialiser"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Sound settings */}
          <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg" onClick={(e) => e.stopPropagation()}>
            {/* Toggle et Volume */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg transition-all ${
                  soundEnabled
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500'
                }`}
                title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                  Volume: {soundVolume}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(Number(e.target.value))}
                  disabled={!soundEnabled}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              {isSoundPlaying ? (
                <button
                  onClick={stopSound}
                  className="px-3 py-1.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all flex items-center gap-1"
                >
                  <Square size={12} />
                  Stop
                </button>
              ) : (
                <button
                  onClick={testSound}
                  disabled={!soundEnabled}
                  className="px-3 py-1.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tester
                </button>
              )}
            </div>

            {/* Sélecteur de son */}
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block flex items-center gap-1">
                <Music size={12} />
                Type de sonnerie
              </label>
              <div className="grid grid-cols-5 gap-1">
                {SOUND_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSoundType(option.value)}
                    disabled={!soundEnabled}
                    className={`px-2 py-1.5 text-xs rounded-lg transition-all disabled:opacity-50 ${
                      soundType === option.value
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                    title={option.description}
                  >
                    {option.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-1">💡 Conseil:</p>
            <p>
              {isBreak
                ? 'Lève-toi, étire-toi, respire profondément.'
                : 'Éteins les notifications, ferme les onglets inutiles.'}
            </p>
          </div>

          {/* Info minimisation */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700 rounded-lg p-3 text-sm text-orange-800 dark:text-orange-300">
            <p className="font-semibold mb-1">ℹ️ Astuce:</p>
            <p>
              Clique sur <strong>"Réduire"</strong> ou en dehors de la fenêtre pour minimiser.
              {isSoundPlaying && ' Clique n\'importe où pour arrêter le son.'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
