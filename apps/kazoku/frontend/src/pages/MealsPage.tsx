/**
 * Meals Page - Weekly Meal Planning
 * © 2025 La Voie Shinkofa
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit2, Trash2, Plus, Eye } from 'lucide-react';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';

interface Meal {
  id: string;
  date: string;
  meal_type: 'petit_dej' | 'dejeuner' | 'gouter' | 'diner';
  dish_name?: string;
  assigned_cook?: string;
  ingredients?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const mealTypeOptions = [
  { value: 'petit_dej', label: '🥐 Petit-déjeuner' },
  { value: 'dejeuner', label: '🍽️ Déjeuner' },
  { value: 'gouter', label: '🍪 Goûter' },
  { value: 'diner', label: '🌙 Dîner' },
];

function MealsPage() {
  const queryClient = useQueryClient();
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingMeal, setViewingMeal] = useState<Meal | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    meal_type: 'dejeuner' as Meal['meal_type'],
    dish_name: '',
    assigned_cook: '',
    ingredients: '',
    notes: '',
  });

  // Fetch meals for the week
  const { data: mealsData, isLoading } = useQuery({
    queryKey: ['meals', selectedWeek.toISOString()],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const weekStart = selectedWeek.toISOString().split('T')[0];
      const response = await fetch(
        `${API_URL}${API_PREFIX}/meals?week_start=${weekStart}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch meals');
      const data = await response.json();
      return data.data as Meal[];
    },
  });

  const meals = mealsData || [];

  // Create meal mutation
  const createMutation = useMutation({
    mutationFn: async (newMeal: typeof formData) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newMeal),
      });
      if (!response.ok) throw new Error('Failed to create meal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      handleCloseModal();
    },
  });

  // Update meal mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/meals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update meal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
      handleCloseModal();
    },
  });

  // Delete meal mutation
  const deleteMutation = useMutation({
    mutationFn: async (mealId: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/meals/${mealId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete meal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meals'] });
    },
  });

  const mealTypes = [
    { key: 'petit_dej', label: 'Petit-déj', emoji: '🥐' },
    { key: 'dejeuner', label: 'Déjeuner', emoji: '🍽️' },
    { key: 'gouter', label: 'Goûter', emoji: '🍪' },
    { key: 'diner', label: 'Dîner', emoji: '🌙' },
  ] as const;

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const getMealForDayAndType = (dayIndex: number, mealType: string) => {
    const date = new Date(selectedWeek);
    date.setDate(date.getDate() + dayIndex);
    const dateStr = date.toISOString().split('T')[0];

    return meals.find((m) => {
      // Convert meal date to local date string for comparison
      const mealDate = new Date(m.date);
      const mealDateStr = mealDate.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
      return mealDateStr === dateStr && m.meal_type === mealType;
    });
  };

  const handleOpenModal = (dayIndex?: number, mealType?: string, existingMeal?: Meal) => {
    if (existingMeal) {
      setEditingMeal(existingMeal);
      // Convert ISO date to local YYYY-MM-DD format for the date input
      const mealDate = new Date(existingMeal.date);
      const dateStr = mealDate.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
      setFormData({
        date: dateStr,
        meal_type: existingMeal.meal_type,
        dish_name: existingMeal.dish_name || '',
        assigned_cook: existingMeal.assigned_cook || '',
        ingredients: existingMeal.ingredients || '',
        notes: existingMeal.notes || '',
      });
    } else {
      setEditingMeal(null);
      const date = new Date(selectedWeek);
      if (dayIndex !== undefined) {
        date.setDate(date.getDate() + dayIndex);
      }
      const dateStr = date.toISOString().split('T')[0];

      setFormData({
        date: dateStr,
        meal_type: (mealType as Meal['meal_type']) || 'dejeuner',
        dish_name: '',
        assigned_cook: '',
        ingredients: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMeal(null);
  };

  const handleViewMeal = (meal: Meal) => {
    setViewingMeal(meal);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingMeal(null);
  };

  const getMealTypeLabel = (type: string) => {
    const found = mealTypeOptions.find((opt) => opt.value === type);
    return found ? found.label : type;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMeal) {
      updateMutation.mutate({ id: editingMeal.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (mealId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
      deleteMutation.mutate(mealId);
    }
  };

  const goToPreviousWeek = () => {
    const prev = new Date(selectedWeek);
    prev.setDate(prev.getDate() - 7);
    setSelectedWeek(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(selectedWeek);
    next.setDate(next.getDate() + 7);
    setSelectedWeek(next);
  };

  const goToCurrentWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setSelectedWeek(monday);
  };

  const weekEnd = new Date(selectedWeek);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-shinkofa-blue-deep mb-2">
            Planning Repas 🍽️
          </h1>
          <p className="text-gray-600">
            Organisation des repas hebdomadaires
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Ajouter un repas
        </button>
      </div>

      {/* Week Navigation */}
      <div className="mb-6 flex gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <button
            onClick={goToPreviousWeek}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
          >
            ← Semaine précédente
          </button>
          <span className="px-4 font-medium text-shinkofa-blue-deep">
            Semaine du {selectedWeek.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au{' '}
            {weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <button
            onClick={goToNextWeek}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
          >
            Semaine suivante →
          </button>
          <button
            onClick={goToCurrentWeek}
            className="px-4 py-2 rounded-lg bg-shinkofa-emerald text-white hover:bg-opacity-90 font-medium"
          >
            Cette semaine
          </button>
        </div>

        <button className="btn btn-outline">📥 Exporter Obsidian</button>
      </div>

      {/* Meals Grid */}
      {isLoading ? (
        <div className="card text-center py-12">
          <span className="spinner"></span>
          <p className="text-gray-600 mt-4">Chargement du planning...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-shinkofa-blue-deep text-white">
                <th className="p-4 text-left font-bold w-32">Repas</th>
                {days.map((day, index) => {
                  const date = new Date(selectedWeek);
                  date.setDate(date.getDate() + index);
                  return (
                    <th key={day} className="p-4 text-center font-bold">
                      <div>{day}</div>
                      <div className="text-xs font-normal opacity-80">
                        {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {mealTypes.map(({ key, label, emoji }) => (
                <tr key={key} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-shinkofa-blue-deep">
                    {emoji} {label}
                  </td>
                  {days.map((day, dayIndex) => {
                    const meal = getMealForDayAndType(dayIndex, key);
                    return (
                      <td
                        key={`${day}-${key}`}
                        className="p-4 text-center border-l relative group"
                      >
                        {meal ? (
                          <div className="text-left relative">
                            <div className="flex justify-between items-start gap-2">
                              <div
                                className="flex-1 cursor-pointer hover:bg-gray-50 rounded p-1 -m-1"
                                onClick={() => handleViewMeal(meal)}
                                title="Cliquer pour voir les détails"
                              >
                                <p className="font-medium text-gray-900">
                                  {meal.dish_name || 'Non défini'}
                                </p>
                                {meal.assigned_cook && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    👨‍🍳 {meal.assigned_cook}
                                  </p>
                                )}
                                {meal.ingredients && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    🛒 {meal.ingredients.substring(0, 30)}
                                    {meal.ingredients.length > 30 ? '...' : ''}
                                  </p>
                                )}
                                {meal.notes && (
                                  <p className="text-xs text-gray-500 mt-1 italic">
                                    {meal.notes.substring(0, 30)}
                                    {meal.notes.length > 30 ? '...' : ''}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewMeal(meal);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                                  title="Voir les détails"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(dayIndex, key, meal);
                                  }}
                                  className="p-1 hover:bg-blue-100 rounded text-blue-600"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(meal.id);
                                  }}
                                  className="p-1 hover:bg-red-100 rounded text-red-600"
                                  title="Supprimer"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenModal(dayIndex, key)}
                            className="w-full h-full min-h-[60px] flex items-center justify-center text-gray-400 hover:text-shinkofa-blue-royal hover:bg-blue-50 rounded transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Details Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        title="Détails du repas"
        size="lg"
      >
        {viewingMeal && (
          <div className="space-y-6">
            {/* Header with meal type and date */}
            <div className="bg-shinkofa-blue-deep text-white rounded-lg p-4">
              <h2 className="text-2xl font-bold">
                {viewingMeal.dish_name || 'Repas non défini'}
              </h2>
              <p className="text-blue-100 mt-1">
                {getMealTypeLabel(viewingMeal.meal_type)} - {formatDate(viewingMeal.date)}
              </p>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viewingMeal.assigned_cook && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Cuisinier</h3>
                  <p className="text-lg text-gray-900 flex items-center gap-2">
                    <span>👨‍🍳</span> {viewingMeal.assigned_cook}
                  </p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Type de repas</h3>
                <p className="text-lg text-gray-900">
                  {getMealTypeLabel(viewingMeal.meal_type)}
                </p>
              </div>
            </div>

            {/* Ingredients */}
            {viewingMeal.ingredients && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
                  <span>🛒</span> Ingrédients
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{viewingMeal.ingredients}</p>
              </div>
            )}

            {/* Notes */}
            {viewingMeal.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <span>📝</span> Notes
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{viewingMeal.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCloseViewModal}
                className="btn btn-outline"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCloseViewModal();
                  const mealDate = new Date(viewingMeal.date);
                  const dayIndex = Math.floor(
                    (mealDate.getTime() - selectedWeek.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  handleOpenModal(dayIndex, viewingMeal.meal_type, viewingMeal);
                }}
                className="btn btn-primary"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Modifier
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingMeal ? 'Modifier le repas' : 'Ajouter un repas'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <FormField
              label="Type de repas"
              name="meal_type"
              type="select"
              value={formData.meal_type}
              onChange={(e) =>
                setFormData({ ...formData, meal_type: e.target.value as Meal['meal_type'] })
              }
              options={mealTypeOptions}
              required
            />
          </div>

          <FormField
            label="Nom du plat"
            name="dish_name"
            value={formData.dish_name}
            onChange={(e) => setFormData({ ...formData, dish_name: e.target.value })}
            placeholder="Ex: Lasagnes, Salade César..."
          />

          <FormField
            label="Cuisinier assigné"
            name="assigned_cook"
            value={formData.assigned_cook}
            onChange={(e) => setFormData({ ...formData, assigned_cook: e.target.value })}
            placeholder="Ex: Papa, Maman, Tous ensemble..."
          />

          <FormField
            label="Ingrédients"
            name="ingredients"
            type="textarea"
            value={formData.ingredients}
            onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
            placeholder="Liste des ingrédients nécessaires..."
            rows={3}
          />

          <FormField
            label="Notes"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Notes supplémentaires, allergies, préférences..."
            rows={2}
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
                : editingMeal
                ? 'Mettre à jour'
                : 'Ajouter le repas'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MealsPage;
