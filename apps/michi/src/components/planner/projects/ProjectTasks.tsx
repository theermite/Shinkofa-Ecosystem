/**
 * ProjectTasks Component - Display tasks for a specific project
 * Shinkofa Platform - Frontend
 */

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { TaskList } from '@/components/planner/tasks/TaskList'
import { TaskModal } from '@/components/planner/tasks/TaskModal'
import { useCreateTask } from '@/hooks/api/useTasks'
import type { Task } from '@/types/api'

interface ProjectTasksProps {
  projectId: string
  projectName: string
  onEditTask?: (task: Task) => void
}

export function ProjectTasks({ projectId, projectName, onEditTask }: ProjectTasksProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const createTaskMutation = useCreateTask()

  const handleCreateTask = async (taskData: any) => {
    try {
      // Inject project_id into task data
      const taskWithProject = {
        ...taskData,
        project_id: projectId
      }

      await createTaskMutation.mutateAsync(taskWithProject)
      console.log('✅ Tâche créée avec succès dans le projet !')
      setShowCreateModal(false)
    } catch (error: any) {
      console.error('❌ Erreur création tâche:', error)
      alert(`Erreur: ${error.message || 'Impossible de créer la tâche'}`)
    }
  }

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-3 px-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          📋 Tâches du projet
        </h4>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 font-medium shadow-sm"
        >
          <Plus size={16} />
          <span>Nouvelle Tâche</span>
        </button>
      </div>

      <TaskList
        filters={{ project_id: projectId }}
        onEditTask={onEditTask}
        emptyMessage={`Aucune tâche dans "${projectName}". Cliquez sur "Nouvelle Tâche" pour en créer une.`}
      />

      {/* Create Task Modal */}
      {showCreateModal && (
        <TaskModal
          task={{
            title: '',
            priority: 'p3',
            project_id: projectId
          }}
          onSave={handleCreateTask}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  )
}
