/**
 * Tasks Page - Family Task Management
 * © 2025 La Voie Shinkofa
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Circle, Edit2, Trash2, User, Calendar, AlertCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';

interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'cuisine' | 'ménage' | 'linge' | 'courses' | 'enfants' | 'autre';
  status: 'ouverte' | 'assignée' | 'en_cours' | 'complétée' | 'archivée';
  priority: 'basse' | 'moyenne' | 'haute';
  assigned_to?: string;
  due_date?: string;
  points: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const categoryOptions = [
  { value: 'cuisine', label: '🍳 Cuisine' },
  { value: 'ménage', label: '🧹 Ménage' },
  { value: 'linge', label: '👕 Linge' },
  { value: 'courses', label: '🛒 Courses' },
  { value: 'enfants', label: '👶 Enfants' },
  { value: 'autre', label: '📌 Autre' },
];

const statusOptions = [
  { value: 'ouverte', label: 'Ouverte' },
  { value: 'assignée', label: 'Assignée' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'complétée', label: 'Complétée' },
  { value: 'archivée', label: 'Archivée' },
];

const priorityOptions = [
  { value: 'basse', label: 'Basse' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'haute', label: 'Haute' },
];

const statusColors: Record<Task['status'], string> = {
  ouverte: 'bg-gray-100 text-gray-800',
  assignée: 'bg-blue-100 text-blue-800',
  en_cours: 'bg-yellow-100 text-yellow-800',
  complétée: 'bg-green-100 text-green-800',
  archivée: 'bg-gray-200 text-gray-600',
};

const priorityColors: Record<Task['priority'], string> = {
  basse: 'bg-green-100 text-green-800',
  moyenne: 'bg-yellow-100 text-yellow-800',
  haute: 'bg-red-100 text-red-800',
};

function TasksPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'autre' as Task['category'],
    status: 'ouverte' as Task['status'],
    priority: 'moyenne' as Task['priority'],
    assigned_to: '',
    due_date: '',
    points: 10,
  });

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      return data.data as Task[];
    },
  });

  const tasks = tasksData || [];

  // Create task mutation
  const createMutation = useMutation({
    mutationFn: async (newTask: typeof formData) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error('Failed to create task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      handleCloseModal();
    },
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/tasks/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      handleCloseModal();
    },
  });

  // Delete task mutation
  const deleteMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        category: task.category,
        status: task.status,
        priority: task.priority,
        assigned_to: task.assigned_to || '',
        due_date: task.due_date ? task.due_date.slice(0, 10) : '',
        points: task.points,
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        category: 'autre',
        status: 'ouverte',
        priority: 'moyenne',
        assigned_to: '',
        due_date: '',
        points: 10,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateMutation.mutate({ id: editingTask.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      deleteMutation.mutate(taskId);
    }
  };

  const handleToggleComplete = (task: Task) => {
    const newStatus = task.status === 'complétée' ? 'en_cours' : 'complétée';
    updateMutation.mutate({ id: task.id, data: { status: newStatus } });
  };

  // Filter tasks by status
  const filteredTasks =
    selectedStatus === 'all'
      ? tasks
      : tasks.filter((task) => task.status === selectedStatus);

  // Group tasks by priority for sorting
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { haute: 0, moyenne: 1, basse: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-shinkofa-blue-deep mb-2">
            Gestion des Tâches ✅
          </h1>
          <p className="text-gray-600">
            Organisez et suivez les tâches familiales
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          + Nouvelle tâche
        </button>
      </div>

      {/* Status Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedStatus === 'all'
              ? 'bg-shinkofa-blue-royal text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Toutes ({tasks.length})
        </button>
        {statusOptions.map((status) => {
          const count = tasks.filter((t) => t.status === status.value).length;
          return (
            <button
              key={status.value}
              onClick={() => setSelectedStatus(status.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === status.value
                  ? 'bg-shinkofa-blue-royal text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="card text-center py-12">
            <span className="spinner"></span>
            <p className="text-gray-600 mt-4">Chargement des tâches...</p>
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg">
              Aucune tâche pour ce filtre
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary mt-4"
            >
              Créer une tâche
            </button>
          </div>
        ) : (
          sortedTasks.map((task) => {
            const isCompleted = task.status === 'complétée';
            const dueDate = task.due_date ? new Date(task.due_date) : null;
            const isOverdue = dueDate && dueDate < new Date() && !isCompleted;

            return (
              <div
                key={task.id}
                className={`card ${isCompleted ? 'opacity-75' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 flex-shrink-0"
                    disabled={updateMutation.isPending}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-shinkofa-blue-royal" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3
                        className={`text-xl font-bold ${
                          isCompleted
                            ? 'text-gray-500 line-through'
                            : 'text-shinkofa-blue-deep'
                        }`}
                      >
                        {task.title}
                      </h3>
                      <span className="text-shinkofa-emerald font-bold text-lg flex-shrink-0">
                        {task.points} pts
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="badge badge-info">
                        {categoryOptions.find((c) => c.value === task.category)?.label}
                      </span>
                      <span className={`badge ${statusColors[task.status]}`}>
                        {statusOptions.find((s) => s.value === task.status)?.label}
                      </span>
                      <span className={`badge ${priorityColors[task.priority]}`}>
                        Priorité: {task.priority}
                      </span>
                      {isOverdue && (
                        <span className="badge bg-red-100 text-red-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          En retard
                        </span>
                      )}
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-1 text-gray-600 text-sm">
                      {task.description && (
                        <p className="text-gray-700">{task.description}</p>
                      )}
                      {task.assigned_to && (
                        <p className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Assigné à: {task.assigned_to}</span>
                        </p>
                      )}
                      {task.due_date && dueDate && (
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                            Échéance:{' '}
                            {dueDate.toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleOpenModal(task)}
                      className="btn btn-outline text-sm flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="btn btn-danger text-sm flex items-center gap-2"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Titre de la tâche"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Faire la vaisselle, Lessive..."
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Catégorie"
              name="category"
              type="select"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as Task['category'] })
              }
              options={categoryOptions}
              required
            />

            <FormField
              label="Priorité"
              name="priority"
              type="select"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value as Task['priority'] })
              }
              options={priorityOptions}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Statut"
              name="status"
              type="select"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as Task['status'] })
              }
              options={statusOptions}
              required
            />

            <FormField
              label="Points"
              name="points"
              type="number"
              value={formData.points}
              onChange={(e) =>
                setFormData({ ...formData, points: parseInt(e.target.value) || 10 })
              }
              min={1}
              max={100}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Assigner à"
              name="assigned_to"
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              placeholder="Nom de la personne"
            />

            <FormField
              label="Date d'échéance"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <FormField
            label="Description (optionnelle)"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Détails supplémentaires..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="btn btn-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Enregistrement...'
                : editingTask
                ? 'Mettre à jour'
                : 'Créer la tâche'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TasksPage;
