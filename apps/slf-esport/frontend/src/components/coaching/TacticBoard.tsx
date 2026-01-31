/**
 * Tactic Board Component - Coach strategy planning integrated in Coaching page
 */

import React, { useState, useEffect } from 'react'
import TacticCanvas from '@/pages/tactics/components/TacticCanvas'
import tacticalFormationService from '@/services/tacticalFormationService'
import type {
  TacticalFormation,
  FormationData,
} from '@/types/tacticalFormation'
import { MapType } from '@/types/tacticalFormation'

const TacticBoard: React.FC = () => {
  // Map selection
  const [selectedMapType, setSelectedMapType] = useState<MapType>(MapType.HOK_FULL)

  // Canvas state
  const [formationData, setFormationData] = useState<FormationData>({
    players: [
      { id: 1, role: 'top', x: 100, y: 100, color: 'blue' },
      { id: 2, role: 'jungle', x: 200, y: 200, color: 'blue' },
      { id: 3, role: 'mid', x: 400, y: 400, color: 'blue' },
      { id: 4, role: 'adc', x: 100, y: 700, color: 'blue' },
      { id: 5, role: 'support', x: 200, y: 700, color: 'blue' },
    ],
    enemies: [
      { id: 1, role: 'top', x: 700, y: 100, color: 'red' },
      { id: 2, role: 'jungle', x: 600, y: 200, color: 'red' },
      { id: 3, role: 'mid', x: 400, y: 400, color: 'red' },
      { id: 4, role: 'adc', x: 700, y: 700, color: 'red' },
      { id: 5, role: 'support', x: 600, y: 700, color: 'red' },
    ],
    drawings: [],
    timeline: [],
  })

  // Formations list
  const [formations, setFormations] = useState<TacticalFormation[]>([])
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Role visibility filters
  const [visiblePlayerRoles, setVisiblePlayerRoles] = useState<string[]>(['top', 'jungle', 'mid', 'adc', 'support'])
  const [visibleEnemyRoles, setVisibleEnemyRoles] = useState<string[]>(['top', 'jungle', 'mid', 'adc', 'support'])

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const fullscreenRef = React.useRef<HTMLDivElement>(null)

  // Load formations on mount
  useEffect(() => {
    loadFormations()
  }, [])

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    if (!fullscreenRef.current) return

    try {
      if (!document.fullscreenElement) {
        await fullscreenRef.current.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
    }
  }

  const loadFormations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await tacticalFormationService.getFormations()
      setFormations(data)
      console.log('Formations loaded:', data)
    } catch (err) {
      console.error('Failed to load formations:', err)
      setError('Erreur lors du chargement des formations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveFormation = async () => {
    const name = prompt('Nom de la formation:')
    if (!name) return

    const description = prompt('Description (optionnel):')

    try {
      setIsSaving(true)
      setError(null)

      if (selectedFormationId) {
        // Update existing
        const updated = await tacticalFormationService.updateFormation(selectedFormationId, {
          formation_data: formationData,
        })
        console.log('Formation updated:', updated)
        alert('✅ Formation mise à jour!')
      } else {
        // Create new
        const newFormation = await tacticalFormationService.createFormation({
          name,
          description: description || undefined,
          map_type: selectedMapType,
          formation_data: formationData,
          tags: [],
        })
        console.log('Formation created:', newFormation)
        setSelectedFormationId(newFormation.id)
        alert('✅ Formation sauvegardée!')
      }

      await loadFormations()
    } catch (err) {
      console.error('Failed to save formation:', err)
      setError('Erreur lors de la sauvegarde de la formation')
      alert('⚠️ Erreur lors de la sauvegarde. Vérifie la console pour plus de détails.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadFormation = async (formationId: number) => {
    try {
      setError(null)
      const formation = await tacticalFormationService.getFormation(formationId)
      console.log('Formation loaded:', formation)
      setFormationData(formation.formation_data)
      setSelectedFormationId(formation.id)
      setSelectedMapType(formation.map_type)
    } catch (err) {
      console.error('Failed to load formation:', err)
      setError('Erreur lors du chargement de la formation')
      alert('⚠️ Erreur lors du chargement')
    }
  }

  const handleNewFormation = () => {
    // Reset to default positions
    setFormationData({
      players: [
        { id: 1, role: 'top', x: 100, y: 100, color: 'blue' },
        { id: 2, role: 'jungle', x: 200, y: 200, color: 'blue' },
        { id: 3, role: 'mid', x: 400, y: 400, color: 'blue' },
        { id: 4, role: 'adc', x: 100, y: 700, color: 'blue' },
        { id: 5, role: 'support', x: 200, y: 700, color: 'blue' },
      ],
      enemies: [
        { id: 1, role: 'top', x: 700, y: 100, color: 'red' },
        { id: 2, role: 'jungle', x: 600, y: 200, color: 'red' },
        { id: 3, role: 'mid', x: 400, y: 400, color: 'red' },
        { id: 4, role: 'adc', x: 700, y: 700, color: 'red' },
        { id: 5, role: 'support', x: 600, y: 700, color: 'red' },
      ],
      drawings: [],
      timeline: [],
    })
    setSelectedFormationId(null)
    setSelectedMapType(MapType.HOK_FULL)
    setVisiblePlayerRoles(['top', 'jungle', 'mid', 'adc', 'support'])
    setVisibleEnemyRoles(['top', 'jungle', 'mid', 'adc', 'support'])
    setError(null)
  }

  const handleDeleteFormation = async (formationId: number) => {
    if (!confirm('Supprimer cette formation?')) return

    try {
      setError(null)
      await tacticalFormationService.deleteFormation(formationId)
      console.log('Formation deleted:', formationId)
      alert('✅ Formation supprimée')
      await loadFormations()

      if (selectedFormationId === formationId) {
        handleNewFormation()
      }
    } catch (err) {
      console.error('Failed to delete formation:', err)
      setError('Erreur lors de la suppression')
      alert('⚠️ Erreur lors de la suppression')
    }
  }

  const togglePlayerRole = (role: string) => {
    setVisiblePlayerRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const toggleEnemyRole = (role: string) => {
    setVisibleEnemyRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const roleLabels: Record<string, string> = {
    top: 'TOP',
    jungle: 'JUNGLE',
    mid: 'MID',
    adc: 'ADC',
    support: 'SUPPORT',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          🎯 Tableau Tactique
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Créez et partagez des formations tactiques avec votre équipe
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-300">⚠️ {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Formations List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              📋 Mes Formations
            </h3>

            <button
              onClick={handleNewFormation}
              className="w-full mb-4 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              ➕ Nouvelle Formation
            </button>

            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">Chargement...</p>
            ) : formations.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                Aucune formation sauvegardée
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {formations.map((formation) => (
                  <div
                    key={formation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedFormationId === formation.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 border-2 border-primary-600'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => handleLoadFormation(formation.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {formation.name}
                        </p>
                        {formation.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {formation.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteFormation(formation.id)
                        }}
                        className="ml-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas with Controls */}
        <div className="lg:col-span-3">
          <div
            ref={fullscreenRef}
            className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md ${
              isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedFormationId
                  ? formations.find((f) => f.id === selectedFormationId)?.name || 'Formation'
                  : 'Nouvelle Formation'}
              </h3>

              <div className="flex gap-3">
                <button
                  onClick={toggleFullscreen}
                  className="py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                  title={isFullscreen ? 'Quitter le plein écran (ESC)' : 'Mode plein écran'}
                >
                  {isFullscreen ? '🔙 Quitter' : '🖥️ Plein écran'}
                </button>
                <button
                  onClick={handleSaveFormation}
                  disabled={isSaving}
                  className={`py-2 px-6 rounded-lg font-medium transition-colors ${
                    isSaving
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isSaving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
                </button>
              </div>
            </div>

            {/* Map Selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🗺️ Sélectionner la carte
              </label>
              <select
                value={selectedMapType}
                onChange={(e) => setSelectedMapType(e.target.value as MapType)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              >
                <optgroup label="Honor of Kings">
                  <option value={MapType.HOK_FULL}>🌍 Carte Complète</option>
                  <option value={MapType.HOK_TOP_LANE}>⬆️ Top Lane</option>
                  <option value={MapType.HOK_MID_LANE}>➡️ Mid Lane</option>
                  <option value={MapType.HOK_BOT_LANE}>⬇️ Bot Lane</option>
                  <option value={MapType.HOK_BLUE_BUFF}>🔵 Blue Buff</option>
                  <option value={MapType.HOK_RED_BUFF}>🔴 Red Buff</option>
                  <option value={MapType.HOK_DRAKE}>🐉 Drake</option>
                  <option value={MapType.HOK_LORD}>👑 Lord</option>
                </optgroup>
                <optgroup label="Autres">
                  <option value={MapType.GENERIC}>📐 Grille Générique</option>
                </optgroup>
              </select>
            </div>

            {/* Canvas and Role Selection Layout */}
            <div className={isFullscreen ? 'flex h-[calc(100vh-140px)]' : 'grid grid-cols-1 lg:grid-cols-4 gap-4'}>
              {/* Role Selection - Sidebar */}
              <div
                className={
                  isFullscreen
                    ? 'w-64 bg-gray-900/95 backdrop-blur-sm rounded-lg p-4 space-y-4 overflow-y-auto'
                    : 'lg:col-span-1 space-y-4'
                }
              >
                {/* Blue Team Roles */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3">
                    🔵 Équipe Bleue
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(roleLabels).map(([role, label]) => (
                      <label key={`player-${role}`} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visiblePlayerRoles.includes(role)}
                          onChange={() => togglePlayerRole(role)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-200">{label}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setVisiblePlayerRoles(
                        visiblePlayerRoles.length === 5 ? [] : ['top', 'jungle', 'mid', 'adc', 'support']
                      )
                    }
                    className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {visiblePlayerRoles.length === 5 ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </button>
                </div>

                {/* Red Team Roles */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                  <h4 className="text-sm font-bold text-red-900 dark:text-red-300 mb-3">
                    🔴 Équipe Rouge
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(roleLabels).map(([role, label]) => (
                      <label key={`enemy-${role}`} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleEnemyRoles.includes(role)}
                          onChange={() => toggleEnemyRole(role)}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-200">{label}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setVisibleEnemyRoles(
                        visibleEnemyRoles.length === 5 ? [] : ['top', 'jungle', 'mid', 'adc', 'support']
                      )
                    }
                    className="mt-3 text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    {visibleEnemyRoles.length === 5 ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </button>
                </div>
              </div>

              {/* Canvas - Takes remaining space */}
              <div className={isFullscreen ? 'flex-1 ml-4' : 'lg:col-span-3'}>
                <TacticCanvas
                  formationData={formationData}
                  onFormationChange={setFormationData}
                  mapType={selectedMapType}
                  visiblePlayerRoles={visiblePlayerRoles}
                  visibleEnemyRoles={visibleEnemyRoles}
                  canvasWidth={isFullscreen ? window.innerWidth - 320 : 800}
                  canvasHeight={isFullscreen ? window.innerHeight - 160 : 800}
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Instructions:</strong> Déplacez les joueurs (bleus) et ennemis (rouges)
                en les faisant glisser sur la grille. Cliquez sur "💾 Sauvegarder" pour enregistrer
                vos positions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TacticBoard
