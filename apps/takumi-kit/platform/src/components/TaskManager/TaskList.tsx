/**
 * TaskList - Daily priority tasks list (KAIDA principle: max 2-3 tasks)
 * Extracted from Planner Shinkofa
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import { Plus, AlertCircle } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import TaskItem from './TaskItem'
import { useTaskStore, selectDailyTasksCount } from '../../stores/taskStore'

const MAX_DAILY_TASKS = 3

export default function TaskList() {
  const { addTask, reorderTasks, getDailyTasks } = useTaskStore()
  const dailyTasksCount = useTaskStore(selectDailyTasksCount)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showWarning, setShowWarning] = useState(false)

  const dailyTasks = getDailyTasks()
  const completedCount = dailyTasks.filter((t) => t.completed).length

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 15 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return

    if (dailyTasksCount >= MAX_DAILY_TASKS) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
      return
    }

    addTask({
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'p1',
      isDailyTask: true,
      order: dailyTasks.length,
    })
    setNewTaskTitle('')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = dailyTasks.findIndex((t) => t.id === active.id)
    const newIndex = dailyTasks.findIndex((t) => t.id === over.id)

    const reordered = arrayMove(dailyTasks, oldIndex, newIndex)
    reorderTasks(reordered.map((t) => t.id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Priorités du Jour</span>
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({completedCount}/{dailyTasks.length})
          </span>
        </h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {dailyTasksCount}/{MAX_DAILY_TASKS} max
        </div>
      </div>

      {showWarning && (
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-orange-500 flex-shrink-0" size={20} />
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Maximum {MAX_DAILY_TASKS} tâches recommandé (principe KAIDA). Complète ou supprime une tâche avant d'en ajouter.
          </p>
        </div>
      )}

      {/* Add new task */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Nouvelle tâche prioritaire..."
          className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white"
          maxLength={100}
        />
        <button
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim() || dailyTasksCount >= MAX_DAILY_TASKS}
          className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>

      {/* Task list */}
      {dailyTasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">Aucune tâche prioritaire</p>
          <p className="text-sm mt-2">
            Ajoute maximum {MAX_DAILY_TASKS} tâches pour rester focus
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={dailyTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {dailyTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* KAIDA explanation */}
      <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
        <strong>Principe KAIDA</strong> : Maximum 2-3 tâches/jour pour éviter la surcharge et favoriser la qualité sur la quantité.
      </div>
    </div>
  )
}
