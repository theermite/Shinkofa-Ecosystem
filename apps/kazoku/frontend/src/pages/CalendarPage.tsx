/**
 * Calendar Page - Family Events Management
 * © 2025 La Voie Shinkofa
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Trash2, Edit2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';

interface Event {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  category: 'école' | 'anniversaire' | 'travail' | 'activité' | 'famille' | 'santé' | 'autre';
  color?: string;
  is_recurring?: boolean;
  recurrence_rule?: string;
  sync_status?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const categoryOptions = [
  { value: 'école', label: '🏫 École' },
  { value: 'anniversaire', label: '🎂 Anniversaire' },
  { value: 'travail', label: '💼 Travail' },
  { value: 'activité', label: '🎯 Activité' },
  { value: 'famille', label: '👨‍👩‍👧‍👦 Famille' },
  { value: 'santé', label: '🏥 Santé' },
  { value: 'autre', label: '📌 Autre' },
];

function CalendarPage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    category: 'autre' as Event['category'],
    color: '#4285f4',
  });

  // Fetch events
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      return data.data as Event[];
    },
  });

  const events = eventsData || [];

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: async (newEvent: typeof formData) => {
      const token = localStorage.getItem('authToken');
      // Convert datetime-local to ISO format
      const payload = {
        ...newEvent,
        start_time: new Date(newEvent.start_time).toISOString(),
        end_time: new Date(newEvent.end_time).toISOString(),
      };
      const response = await fetch(`${API_URL}${API_PREFIX}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      handleCloseModal();
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/events/${eventId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete event');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const handleOpenModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description || '',
        start_time: event.start_time.slice(0, 16),
        end_time: event.end_time.slice(0, 16),
        category: event.category,
        color: event.color || '#4285f4',
      });
    } else {
      setEditingEvent(null);
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setHours(11, 0, 0, 0);

      setFormData({
        title: '',
        description: '',
        start_time: tomorrow.toISOString().slice(0, 16),
        end_time: tomorrowEnd.toISOString().slice(0, 16),
        category: 'autre',
        color: '#4285f4',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleDelete = (eventId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      deleteMutation.mutate(eventId);
    }
  };

  // Filter events for current week
  const getWeekEvents = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    return events.filter((event) => {
      const eventStart = new Date(event.start_time);
      return eventStart >= startOfWeek && eventStart < endOfWeek;
    });
  };

  const weekEvents = viewMode === 'week' ? getWeekEvents() : events;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-shinkofa-blue-deep mb-2">
            Calendrier Familial 📅
          </h1>
          <p className="text-gray-600">
            Gérez vos événements et rendez-vous
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary"
        >
          + Nouvel événement
        </button>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex gap-4 items-center flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-shinkofa-blue-royal text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'month'
                ? 'bg-shinkofa-blue-royal text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mois
          </button>
        </div>

        <div className="flex gap-2 items-center">
          <button
            onClick={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - (viewMode === 'week' ? 7 : 30));
              setSelectedDate(prev);
            }}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
          >
            ←
          </button>
          <span className="px-4 font-medium text-shinkofa-blue-deep">
            {selectedDate.toLocaleDateString('fr-FR', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            onClick={() => {
              const next = new Date(selectedDate);
              next.setDate(next.getDate() + (viewMode === 'week' ? 7 : 30));
              setSelectedDate(next);
            }}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
          >
            →
          </button>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="px-4 py-2 rounded-lg bg-shinkofa-emerald text-white hover:bg-opacity-90 font-medium"
          >
            Aujourd'hui
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="card text-center py-12">
            <span className="spinner"></span>
            <p className="text-gray-600 mt-4">Chargement des événements...</p>
          </div>
        ) : weekEvents.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg">
              Aucun événement pour cette période
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary mt-4"
            >
              Créer un événement
            </button>
          </div>
        ) : (
          weekEvents.map((event) => {
            const startDate = new Date(event.start_time);
            const endDate = new Date(event.end_time);

            return (
              <div
                key={event.id}
                className="card border-l-4"
                style={{ borderLeftColor: event.color || '#4285f4' }}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold text-shinkofa-blue-deep">
                        {event.title}
                      </h3>
                      <span className="badge badge-info">
                        {categoryOptions.find((c) => c.value === event.category)?.label}
                      </span>
                      {event.is_recurring && (
                        <span className="badge badge-success">🔁 Récurrent</span>
                      )}
                    </div>

                    <div className="space-y-2 text-gray-600">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {startDate.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {startDate.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {endDate.toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </p>
                      {event.description && (
                        <p className="mt-2 text-gray-700 italic">{event.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(event)}
                      className="btn btn-outline text-sm flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
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
        title={editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Titre de l'événement"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ex: Rendez-vous médecin, Anniversaire Théo..."
            required
          />

          <FormField
            label="Catégorie"
            name="category"
            type="select"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value as Event['category'] })
            }
            options={categoryOptions}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Date et heure début"
              name="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              required
            />

            <FormField
              label="Date et heure fin"
              name="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
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
              disabled={createMutation.isPending}
            >
              {createMutation.isPending
                ? 'Enregistrement...'
                : editingEvent
                ? 'Mettre à jour'
                : 'Créer l\'événement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CalendarPage;
