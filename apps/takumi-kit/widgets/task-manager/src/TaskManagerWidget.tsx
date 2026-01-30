/**
 * Task Manager Widget - Main component
 * Standalone task and project manager
 *
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { useState } from 'react'
import {
  Plus,
  FolderOpen,
  CheckSquare,
  Download,
  Upload,
  Trash2,
  RotateCcw,
  AlertCircle,
  Edit2,
  Check,
  X,
  GripVertical,
  Star,
  StarOff,
  ChevronDown,
  ChevronUp,
  Circle,
  CheckCircle,
} from 'lucide-react'
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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  useTaskStore,
  selectActiveProjects,
  selectCompletedProjects,
  selectArchivedProjects,
  selectDailyTasksCount,
  type Task,
  type Project,
  type TaskDifficultyLevel,
  type ProjectStatus,
} from './store'

const MAX_DAILY_TASKS = 3

const difficultyConfig: Record<TaskDifficultyLevel, { label: string; emoji: string; color: string; bgColor: string }> = {
  quick: { label: 'Rapide', emoji: '⚡', color: 'text-green-400', bgColor: 'bg-green-900/30' },
  medium: { label: 'Moyenne', emoji: '📝', color: 'text-blue-400', bgColor: 'bg-blue-900/30' },
  complex: { label: 'Complexe', emoji: '🧠', color: 'text-purple-400', bgColor: 'bg-purple-900/30' },
  long: { label: 'Longue', emoji: '⏰', color: 'text-orange-400', bgColor: 'bg-orange-900/30' },
}

const PRESET_COLORS = ['#1e3a5f', '#e08f34', '#f5cd3e', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6']
const PRESET_ICONS = ['📂', '🎯', '💼', '🎨', '🏠', '💪', '📚', '🌟', '🚀', '💡', '🔧', '🎮']

// Sortable Task Item
function SortableTaskItem({ task, onPromote }: { task: Task; onPromote?: () => void }) {
  const { toggleTask, updateTask, deleteTask, demoteFromDailyTask } = useTaskStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      updateTask(task.id, { title: editTitle.trim() })
    }
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="p-3 bg-slate-700 border-2 border-blue-500 rounded-lg flex gap-2">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
          className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm"
          autoFocus
        />
        <button onClick={handleSaveEdit} className="p-1 text-green-400 hover:text-green-300">
          <Check size={16} />
        </button>
        <button onClick={() => setIsEditing(false)} className="p-1 text-red-400 hover:text-red-300">
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg border transition-all ${
        task.completed
          ? 'bg-green-900/20 border-green-800'
          : 'bg-slate-700 border-slate-600 hover:border-slate-500'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-2">
        <button
          className="p-1 text-slate-400 hover:text-blue-400 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>

        <button onClick={() => toggleTask(task.id)} className="flex-shrink-0">
          {task.completed ? (
            <CheckCircle size={18} className="text-green-500" />
          ) : (
            <Circle size={18} className="text-slate-400" />
          )}
        </button>

        <span className={`flex-1 text-sm ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
          {task.title}
        </span>

        {task.difficultyLevel && (
          <span className={`text-xs ${difficultyConfig[task.difficultyLevel].color}`}>
            {difficultyConfig[task.difficultyLevel].emoji}
          </span>
        )}

        {task.isDailyTask && (
          <span className="px-1.5 py-0.5 bg-orange-900/30 text-orange-400 text-xs rounded">KAIDA</span>
        )}

        {task.isDailyTask ? (
          <button onClick={() => demoteFromDailyTask(task.id)} className="p-1 text-orange-400 hover:text-orange-300">
            <StarOff size={14} />
          </button>
        ) : onPromote ? (
          <button onClick={onPromote} className="p-1 text-slate-400 hover:text-orange-400">
            <Star size={14} />
          </button>
        ) : null}

        <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-blue-400">
          <Edit2 size={14} />
        </button>

        <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-400">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Difficulty selector */}
      <div className="mt-2 flex flex-wrap gap-1">
        {(Object.keys(difficultyConfig) as TaskDifficultyLevel[]).map((level) => {
          const config = difficultyConfig[level]
          const isSelected = task.difficultyLevel === level
          return (
            <button
              key={level}
              onClick={() => updateTask(task.id, { difficultyLevel: level })}
              className={`px-2 py-0.5 rounded text-xs transition-all ${
                isSelected
                  ? `${config.bgColor} ${config.color} ring-1 ring-current`
                  : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
              }`}
            >
              {config.emoji} {config.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Daily Tasks List
function DailyTasksList() {
  const { addTask, reorderTasks, getDailyTasks } = useTaskStore()
  const dailyTasksCount = useTaskStore(selectDailyTasksCount)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showWarning, setShowWarning] = useState(false)

  const dailyTasks = getDailyTasks()
  const completedCount = dailyTasks.filter((t) => t.completed).length

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 15 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    if (dailyTasksCount >= MAX_DAILY_TASKS) {
      setShowWarning(true)
      setTimeout(() => setShowWarning(false), 3000)
      return
    }
    addTask({ title: newTaskTitle.trim(), completed: false, priority: 'p1', isDailyTask: true, order: dailyTasks.length })
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
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <CheckSquare size={20} />
          Priorités du Jour
          <span className="text-sm font-normal text-slate-400">({completedCount}/{dailyTasks.length})</span>
        </h2>
        <span className="text-sm text-slate-400">{dailyTasksCount}/{MAX_DAILY_TASKS} max</span>
      </div>

      {showWarning && (
        <div className="p-3 bg-orange-900/20 border border-orange-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-orange-400" size={16} />
          <span className="text-sm text-orange-300">Maximum {MAX_DAILY_TASKS} tâches (KAIDA)</span>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Nouvelle tâche prioritaire..."
          className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim() || dailyTasksCount >= MAX_DAILY_TASKS}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
        </button>
      </div>

      {dailyTasks.length === 0 ? (
        <p className="text-center py-8 text-slate-400">Aucune tâche prioritaire</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={dailyTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {dailyTasks.map((task) => (
                <SortableTaskItem key={task.id} task={task} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <p className="text-xs text-slate-500">
        <strong>KAIDA</strong> : Max 2-3 tâches/jour pour la qualité sur la quantité
      </p>
    </div>
  )
}

// Project Modal
function ProjectModal({ project, onSave, onClose }: { project?: Project; onSave: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void; onClose: () => void }) {
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [color, setColor] = useState(project?.color || PRESET_COLORS[0])
  const [icon, setIcon] = useState(project?.icon || '📂')
  const [status, setStatus] = useState<ProjectStatus>(project?.status || 'active')

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), description: description.trim() || undefined, color, icon, status })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{project ? 'Modifier' : 'Nouveau'} projet</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du projet"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={2}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white resize-none"
          />

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Icône</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-8 h-8 rounded border ${icon === emoji ? 'border-blue-500 bg-blue-900/30' : 'border-slate-600'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Couleur</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded ${color === c ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            {(['active', 'completed', 'archived'] as ProjectStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex-1 py-2 rounded text-sm ${
                  status === s
                    ? s === 'active' ? 'bg-green-600 text-white' : s === 'completed' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {s === 'active' ? 'En cours' : s === 'completed' ? 'Terminé' : 'Archivé'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={handleSave} disabled={!name.trim()} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50">
            {project ? 'Enregistrer' : 'Créer'}
          </button>
          <button onClick={onClose} className="flex-1 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
            Annuler
          </button>
        </div>
      </div>
    </div>
  )
}

// Project Card
function ProjectCard({ project }: { project: Project }) {
  const { updateProject, deleteProject, toggleTask, addTask, assignTaskToProject, getTasksByProject, getUnassignedTasks, getProjectProgress, promoteToDailyTask, reorderTasks } = useTaskStore()
  const dailyTasksCount = useTaskStore(selectDailyTasksCount)

  const [isExpanded, setIsExpanded] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const projectTasks = getTasksByProject(project.id)
  const unassignedTasks = getUnassignedTasks()
  const { completed, total, percentage } = getProjectProgress(project.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 15 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return
    addTask({ title: newTaskTitle.trim(), completed: false, priority: 'p1', projectId: project.id, order: projectTasks.length })
    setNewTaskTitle('')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = projectTasks.findIndex((t) => t.id === active.id)
    const newIndex = projectTasks.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(projectTasks, oldIndex, newIndex)
    reorderTasks(reordered.map((t) => t.id))
  }

  const handlePromote = (taskId: string) => {
    if (dailyTasksCount >= MAX_DAILY_TASKS) {
      alert('Maximum 3 tâches prioritaires')
      return
    }
    promoteToDailyTask(taskId)
  }

  return (
    <>
      <div className="bg-slate-800 rounded-lg border-l-4 overflow-hidden" style={{ borderLeftColor: project.color }}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {project.icon && <span>{project.icon}</span>}
              <span className="font-medium text-white">{project.name}</span>
              <span className={`px-2 py-0.5 text-xs rounded ${
                project.status === 'active' ? 'bg-green-900/30 text-green-400' :
                project.status === 'completed' ? 'bg-blue-900/30 text-blue-400' : 'bg-slate-700 text-slate-400'
              }`}>
                {project.status === 'active' ? 'En cours' : project.status === 'completed' ? 'Terminé' : 'Archivé'}
              </span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setShowEditModal(true)} className="p-1 text-slate-400 hover:text-blue-400">
                <Edit2 size={14} />
              </button>
              <button onClick={() => deleteProject(project.id)} className="p-1 text-slate-400 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {project.description && <p className="text-sm text-slate-400 mb-2">{project.description}</p>}

          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{completed}/{total} tâches</span>
              <span style={{ color: project.color }}>{percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full">
              <div className="h-full rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: project.color }} />
            </div>
          </div>

          <button onClick={() => setIsExpanded(!isExpanded)} className="w-full flex items-center justify-center gap-1 py-1 text-sm text-slate-400 hover:text-white">
            {isExpanded ? <><ChevronUp size={14} /> Masquer</> : <><ChevronDown size={14} /> Voir ({total})</>}
          </button>
        </div>

        {isExpanded && (
          <div className="border-t border-slate-700 p-4 space-y-2">
            {projectTasks.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-2">Aucune tâche</p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={projectTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  {projectTasks.map((task) => (
                    <SortableTaskItem key={task.id} task={task} onPromote={() => handlePromote(task.id)} />
                  ))}
                </SortableContext>
              </DndContext>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-700">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                placeholder="Nouvelle tâche..."
                className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white"
              />
              <button onClick={handleAddTask} disabled={!newTaskTitle.trim()} className="px-2 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50">
                <Plus size={16} />
              </button>
            </div>

            {unassignedTasks.length > 0 && (
              <details className="pt-2">
                <summary className="text-sm text-blue-400 cursor-pointer">+ Ajouter existante ({unassignedTasks.length})</summary>
                <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {unassignedTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => assignTaskToProject(task.id, project.id)}
                      className="w-full text-left p-2 text-sm text-slate-300 hover:bg-slate-700 rounded"
                    >
                      {task.title}
                    </button>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {showEditModal && (
        <ProjectModal
          project={project}
          onSave={(data) => { updateProject(project.id, data); setShowEditModal(false) }}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  )
}

// Projects List
function ProjectsList() {
  const { addProject } = useTaskStore()
  const activeProjects = useTaskStore(selectActiveProjects)
  const completedProjects = useTaskStore(selectCompletedProjects)
  const archivedProjects = useTaskStore(selectArchivedProjects)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const hasProjects = activeProjects.length > 0 || completedProjects.length > 0 || archivedProjects.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FolderOpen size={20} />
          Projets
        </h2>
        <button onClick={() => setShowCreateModal(true)} className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 flex items-center gap-1">
          <Plus size={16} /> Nouveau
        </button>
      </div>

      {!hasProjects ? (
        <div className="text-center py-8 text-slate-400">
          <FolderOpen size={32} className="mx-auto mb-2 opacity-50" />
          <p>Aucun projet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeProjects.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm text-slate-400">En cours ({activeProjects.length})</h3>
              {activeProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}
          {completedProjects.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm text-slate-400">Terminés ({completedProjects.length})</h3>
              {completedProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          )}
          {archivedProjects.length > 0 && (
            <details>
              <summary className="text-sm text-slate-500 cursor-pointer">Archivés ({archivedProjects.length})</summary>
              <div className="space-y-2 mt-2">
                {archivedProjects.map((p) => <ProjectCard key={p.id} project={p} />)}
              </div>
            </details>
          )}
        </div>
      )}

      {showCreateModal && <ProjectModal onSave={(data) => { addProject(data); setShowCreateModal(false) }} onClose={() => setShowCreateModal(false)} />}
    </div>
  )
}

// Main Widget
export default function TaskManagerWidget() {
  const { exportData, importData, clearCompletedTasks, resetDailyTasks, tasks } = useTaskStore()
  const [activeTab, setActiveTab] = useState<'daily' | 'projects'>('daily')
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')

  const completedCount = tasks.filter((t) => t.completed).length

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    if (importData(importText)) {
      setShowImport(false)
      setImportText('')
    } else {
      alert('Format invalide')
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Task Manager</h1>
            <div className="flex gap-1">
              <button onClick={handleExport} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded" title="Exporter">
                <Download size={18} />
              </button>
              <button onClick={() => setShowImport(true)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded" title="Importer">
                <Upload size={18} />
              </button>
              {completedCount > 0 && (
                <button onClick={clearCompletedTasks} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded" title="Supprimer terminées">
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={resetDailyTasks} className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded" title="Reset quotidiennes">
                <RotateCcw size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('daily')}
              className={`flex-1 py-2 rounded text-sm ${activeTab === 'daily' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              Priorités
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-2 rounded text-sm ${activeTab === 'projects' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              Projets
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'daily' ? <DailyTasksList /> : <ProjectsList />}

        {/* Import Modal */}
        {showImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold mb-4">Importer</h2>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Collez le JSON..."
                rows={6}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white font-mono text-sm"
              />
              <div className="flex gap-2 mt-4">
                <button onClick={handleImport} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Importer</button>
                <button onClick={() => { setShowImport(false); setImportText('') }} className="flex-1 py-2 bg-slate-700 text-white rounded-lg">Annuler</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
