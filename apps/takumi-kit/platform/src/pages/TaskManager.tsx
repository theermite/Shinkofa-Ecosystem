/**
 * TaskManager Page - Main task and project management
 * Extracted from Planner Shinkofa
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import { Download, Upload, Trash2, RotateCcw } from 'lucide-react'
import { TaskList, ProjectList } from '../components/TaskManager'
import { useTaskStore } from '../stores/taskStore'

type TabType = 'daily' | 'projects'

export default function TaskManagerPage() {
  const { exportData, importData, clearCompletedTasks, resetDailyTasks, tasks } = useTaskStore()
  const [activeTab, setActiveTab] = useState<TabType>('daily')
  const [showImportModal, setShowImportModal] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState('')

  const completedCount = tasks.filter((t) => t.completed).length

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `task-manager-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    setImportError('')
    if (!importText.trim()) {
      setImportError('Collez les données JSON à importer')
      return
    }

    const success = importData(importText)
    if (success) {
      setShowImportModal(false)
      setImportText('')
    } else {
      setImportError('Format JSON invalide. Vérifiez les données.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestionnaire de Tâches</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Organise tes projets et priorités quotidiennes
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Exporter les données"
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Importer des données"
              >
                <Upload size={20} />
              </button>
              {completedCount > 0 && (
                <button
                  onClick={clearCompletedTasks}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title={`Supprimer ${completedCount} tâche(s) terminée(s)`}
                >
                  <Trash2 size={20} />
                </button>
              )}
              <button
                onClick={resetDailyTasks}
                className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                title="Réinitialiser les tâches quotidiennes"
              >
                <RotateCcw size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'daily'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Priorités du Jour
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'projects'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Projets
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'daily' ? <TaskList /> : <ProjectList />}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Importer des données</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Collez le contenu JSON d'une sauvegarde précédente pour restaurer vos données.
            </p>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder='{"tasks": [...], "projects": [...]}'
              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white font-mono text-sm"
              rows={8}
            />

            {importError && <p className="mt-2 text-sm text-red-500">{importError}</p>}

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleImport}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Importer
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportText('')
                  setImportError('')
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg hover:border-blue-500 transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
