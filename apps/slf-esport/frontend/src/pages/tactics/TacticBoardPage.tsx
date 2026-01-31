/**
 * Tactic Board Page - Coach strategy planning tool
 * MVP: Canvas with drag & drop + Save/Load formations
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TacticCanvas from './components/TacticCanvas'
import tacticalFormationService from '@/services/tacticalFormationService'
import type {
  TacticalFormation,
  FormationData,
  PlayerPosition,
  MapType,
  FormationCategory,
} from '@/types/tacticalFormation'

const TacticBoardPage: React.FC = () => {
  const navigate = useNavigate()

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
      { id: 1, role: 'enemy', x: 700, y: 100, color: 'red' },
      { id: 2, role: 'enemy', x: 600, y: 200, color: 'red' },
      { id: 3, role: 'enemy', x: 400, y: 400, color: 'red' },
      { id: 4, role: 'enemy', x: 700, y: 700, color: 'red' },
      { id: 5, role: 'enemy', x: 600, y: 700, color: 'red' },
    ],
    drawings: [],
    timeline: [],
  })

  // Formations list
  const [formations, setFormations] = useState<TacticalFormation[]>([])
  const [selectedFormationId, setSelectedFormationId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load formations on mount
  useEffect(() => {
    loadFormations()
  }, [])

  const loadFormations = async () => {
    try {
      setIsLoading(true)
      const data = await tacticalFormationService.getFormations()
      setFormations(data)
    } catch (error) {
      console.error('Failed to load formations:', error)
      alert('Erreur lors du chargement des formations')
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

      if (selectedFormationId) {
        // Update existing
        await tacticalFormationService.updateFormation(selectedFormationId, {
          formation_data: formationData,
        })
        alert('✅ Formation mise à jour!')
      } else {
        // Create new
        const newFormation = await tacticalFormationService.createFormation({
          name,
          description: description || undefined,
          map_type: 'generic' as MapType,
          formation_data: formationData,
          tags: [],
        })
        setSelectedFormationId(newFormation.id)
        alert('✅ Formation sauvegardée!')
      }

      await loadFormations()
    } catch (error) {
      console.error('Failed to save formation:', error)
      alert('⚠️ Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadFormation = async (formationId: number) => {
    try {
      const formation = await tacticalFormationService.getFormation(formationId)
      setFormationData(formation.formation_data)
      setSelectedFormationId(formation.id)
    } catch (error) {
      console.error('Failed to load formation:', error)
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
        { id: 1, role: 'enemy', x: 700, y: 100, color: 'red' },
        { id: 2, role: 'enemy', x: 600, y: 200, color: 'red' },
        { id: 3, role: 'enemy', x: 400, y: 400, color: 'red' },
        { id: 4, role: 'enemy', x: 700, y: 700, color: 'red' },
        { id: 5, role: 'enemy', x: 600, y: 700, color: 'red' },
      ],
      drawings: [],
      timeline: [],
    })
    setSelectedFormationId(null)
  }

  const handleDeleteFormation = async (formationId: number) => {
    if (!confirm('Supprimer cette formation?')) return

    try {
      await tacticalFormationService.deleteFormation(formationId)
      alert('✅ Formation supprimée')
      await loadFormations()

      if (selectedFormationId === formationId) {
        handleNewFormation()
      }
    } catch (error) {
      console.error('Failed to delete formation:', error)
      alert('⚠️ Erreur lors de la suppression')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-2"
          >
            ← Retour au dashboard
          </button>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🎯 Tactic Board
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Créez et partagez des formations tactiques avec votre équipe
          </p>
        </div>

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
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  Aucune formation sauvegardée
                </p>
              ) : (
                <div className="space-y-2">
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
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formation.name}
                          </p>
                          {formation.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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

          {/* Main Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedFormationId
                    ? formations.find((f) => f.id === selectedFormationId)?.name || 'Formation'
                    : 'Nouvelle Formation'}
                </h3>

                <div className="flex gap-3">
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

              <TacticCanvas formationData={formationData} onFormationChange={setFormationData} />

              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Instructions:</strong> Déplacez les joueurs (bleus) et ennemis (rouges)
                  en les faisant glisser sur la grille. Les positions sont sauvegardées
                  automatiquement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TacticBoardPage
