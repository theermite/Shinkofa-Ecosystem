/**
 * Baby Tracking Page - Baby Care Logs (Evy & Nami)
 * © 2025 La Voie Shinkofa
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';

type Enfant = 'Evy' | 'Nami';

interface RepasLog {
  id: string;
  date: string;
  time: string;
  enfant: Enfant;
  type: 'biberon' | 'repas';
  quantite_ml?: number;
  taille_assiette?: 'petite' | 'moyenne' | 'grande';
  duration_minutes?: number;
  notes?: string;
  created_at: string;
}

interface CoucheLog {
  id: string;
  date: string;
  time: string;
  enfant: Enfant;
  type: 'pipi' | 'caca' | 'mixte';
  notes?: string;
  created_at: string;
}

interface BienEtreLog {
  id: string;
  date: string;
  enfant: Enfant;
  category: 'sante' | 'sommeil' | 'comportement' | 'developpement' | 'humeur' | 'allergie' | 'autre';
  observation: string;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

function BabyTrackingPage() {
  const queryClient = useQueryClient();
  const [selectedBaby, setSelectedBaby] = useState<Enfant>('Evy');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal states
  const [showRepasModal, setShowRepasModal] = useState(false);
  const [showCoucheModal, setShowCoucheModal] = useState(false);
  const [showBienEtreModal, setShowBienEtreModal] = useState(false);

  // Form data states
  const [repasForm, setRepasForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    enfant: 'Evy' as Enfant,
    type: 'biberon' as 'biberon' | 'repas',
    quantite_ml: '',
    taille_assiette: '' as '' | 'petite' | 'moyenne' | 'grande',
    duration_minutes: '',
    notes: '',
  });

  const [coucheForm, setCoucheForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    enfant: 'Evy' as Enfant,
    type: 'pipi' as 'pipi' | 'caca' | 'mixte',
    notes: '',
  });

  const [bienEtreForm, setBienEtreForm] = useState({
    date: new Date().toISOString().split('T')[0],
    enfant: 'Evy' as Enfant,
    category: 'sante' as BienEtreLog['category'],
    observation: '',
  });

  const dateStr = selectedDate.toISOString().split('T')[0];

  // Fetch repas logs
  const { data: repasData, isLoading: isLoadingRepas } = useQuery({
    queryKey: ['repas-logs', selectedBaby, dateStr],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}${API_PREFIX}/baby/repas?enfant=${selectedBaby}&date=${dateStr}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch repas logs');
      const data = await response.json();
      return data.data as RepasLog[];
    },
  });

  // Fetch couche logs
  const { data: coucheData, isLoading: isLoadingCouche } = useQuery({
    queryKey: ['couche-logs', selectedBaby, dateStr],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}${API_PREFIX}/baby/couches?enfant=${selectedBaby}&date=${dateStr}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch couche logs');
      const data = await response.json();
      return data.data as CoucheLog[];
    },
  });

  // Fetch bien-être logs
  const { data: bienEtreData, isLoading: isLoadingBienEtre } = useQuery({
    queryKey: ['bien-etre-logs', selectedBaby, dateStr],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}${API_PREFIX}/baby/bien-etre?enfant=${selectedBaby}&date=${dateStr}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch bien-être logs');
      const data = await response.json();
      return data.data as BienEtreLog[];
    },
  });

  const repasLogs = repasData || [];
  const coucheLogs = coucheData || [];
  const bienEtreLogs = bienEtreData || [];

  const isLoading = isLoadingRepas || isLoadingCouche || isLoadingBienEtre;

  // Create mutations
  const createRepasMutation = useMutation({
    mutationFn: async (newRepas: typeof repasForm) => {
      const token = localStorage.getItem('authToken');
      const payload = {
        ...newRepas,
        quantite_ml: newRepas.quantite_ml ? Number(newRepas.quantite_ml) : undefined,
        duration_minutes: newRepas.duration_minutes ? Number(newRepas.duration_minutes) : undefined,
        taille_assiette: newRepas.taille_assiette || undefined,
      };
      const response = await fetch(`${API_URL}${API_PREFIX}/baby/repas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create repas log');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repas-logs'] });
      setShowRepasModal(false);
      setRepasForm({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        enfant: selectedBaby,
        type: 'biberon',
        quantite_ml: '',
        taille_assiette: '',
        duration_minutes: '',
        notes: '',
      });
    },
  });

  const createCoucheMutation = useMutation({
    mutationFn: async (newCouche: typeof coucheForm) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/baby/couches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCouche),
      });
      if (!response.ok) throw new Error('Failed to create couche log');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couche-logs'] });
      setShowCoucheModal(false);
      setCoucheForm({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        enfant: selectedBaby,
        type: 'pipi',
        notes: '',
      });
    },
  });

  const createBienEtreMutation = useMutation({
    mutationFn: async (newBienEtre: typeof bienEtreForm) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/baby/bien-etre`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBienEtre),
      });
      if (!response.ok) throw new Error('Failed to create bien-être log');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bien-etre-logs'] });
      setShowBienEtreModal(false);
      setBienEtreForm({
        date: new Date().toISOString().split('T')[0],
        enfant: selectedBaby,
        category: 'sante',
        observation: '',
      });
    },
  });

  // Delete mutations
  const deleteRepasMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/baby/repas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete repas log');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repas-logs'] });
    },
  });

  const deleteCoucheMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/baby/couches/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete couche log');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couche-logs'] });
    },
  });

  const deleteBienEtreMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/baby/bien-etre/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete bien-être log');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bien-etre-logs'] });
    },
  });

  const handleDeleteRepas = (id: string) => {
    if (confirm('Supprimer ce repas ?')) {
      deleteRepasMutation.mutate(id);
    }
  };

  const handleDeleteCouche = (id: string) => {
    if (confirm('Supprimer ce changement ?')) {
      deleteCoucheMutation.mutate(id);
    }
  };

  const handleDeleteBienEtre = (id: string) => {
    if (confirm('Supprimer cette note ?')) {
      deleteBienEtreMutation.mutate(id);
    }
  };

  // Modal handlers
  const handleOpenRepasModal = () => {
    setRepasForm({
      ...repasForm,
      date: selectedDate.toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      enfant: selectedBaby,
    });
    setShowRepasModal(true);
  };

  const handleOpenCoucheModal = () => {
    setCoucheForm({
      ...coucheForm,
      date: selectedDate.toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      enfant: selectedBaby,
    });
    setShowCoucheModal(true);
  };

  const handleOpenBienEtreModal = () => {
    setBienEtreForm({
      ...bienEtreForm,
      date: selectedDate.toISOString().split('T')[0],
      enfant: selectedBaby,
    });
    setShowBienEtreModal(true);
  };

  // Form submit handlers
  const handleRepasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRepasMutation.mutate(repasForm);
  };

  const handleCoucheSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCoucheMutation.mutate(coucheForm);
  };

  const handleBienEtreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBienEtreMutation.mutate(bienEtreForm);
  };

  const babyColors = {
    Evy: 'bg-pink-100 border-pink-300',
    Nami: 'bg-purple-100 border-purple-300',
  };

  const typeEmojis = {
    biberon: '🍼',
    repas: '🍽️',
    pipi: '💧',
    caca: '💩',
    mixte: '💧💩',
  };

  const categoryEmojis: Record<string, string> = {
    sante: '🏥',
    sommeil: '😴',
    comportement: '😊',
    developpement: '📈',
    humeur: '💭',
    allergie: '⚠️',
    autre: '📌',
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-shinkofa-blue-deep mb-2">
            Suivi Bébés 👶
          </h1>
          <p className="text-gray-600">
            Repas, couches et bien-être d'Evy & Nami
          </p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleOpenRepasModal} className="btn btn-primary">+ Ajouter repas</button>
          <button onClick={handleOpenCoucheModal} className="btn btn-primary">+ Ajouter couche</button>
          <button onClick={handleOpenBienEtreModal} className="btn btn-secondary">+ Note bien-être</button>
        </div>
      </div>

      {/* Baby Selection */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setSelectedBaby('Evy')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            selectedBaby === 'Evy'
              ? 'bg-pink-500 text-white shadow-lg scale-105'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          👧 Evy
        </button>
        <button
          onClick={() => setSelectedBaby('Nami')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            selectedBaby === 'Nami'
              ? 'bg-purple-500 text-white shadow-lg scale-105'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          👧 Nami
        </button>
      </div>

      {/* Date Navigation */}
      <div className="mb-6 flex gap-4 items-center">
        <button
          onClick={() => {
            const prev = new Date(selectedDate);
            prev.setDate(prev.getDate() - 1);
            setSelectedDate(prev);
          }}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
        >
          ← Jour précédent
        </button>
        <span className="px-4 font-medium text-shinkofa-blue-deep">
          {selectedDate.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <button
          onClick={() => {
            const next = new Date(selectedDate);
            next.setDate(next.getDate() + 1);
            setSelectedDate(next);
          }}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 font-medium"
        >
          Jour suivant →
        </button>
        <button
          onClick={() => setSelectedDate(new Date())}
          className="px-4 py-2 rounded-lg bg-shinkofa-emerald text-white hover:bg-opacity-90 font-medium"
        >
          Aujourd'hui
        </button>
        <button className="btn btn-outline ml-auto">
          📥 Exporter Obsidian
        </button>
      </div>

      {/* Logs Sections */}
      {isLoading ? (
        <div className="card text-center py-12">
          <span className="spinner"></span>
          <p className="text-gray-600 mt-4">Chargement des logs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Repas Logs */}
          <div className={`card border-2 ${babyColors[selectedBaby]}`}>
            <h2 className="text-2xl font-bold text-shinkofa-blue-deep mb-4 flex items-center gap-2">
              🍼 Repas ({repasLogs.length})
            </h2>

            {repasLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun repas enregistré
              </p>
            ) : (
              <div className="space-y-3">
                {repasLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{typeEmojis[log.type]}</span>
                        <span className="font-bold text-shinkofa-blue-deep">
                          {log.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {log.type === 'biberon' ? 'Biberon' : 'Repas'}
                        </span>
                        <button
                          onClick={() => handleDeleteRepas(log.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                          disabled={deleteRepasMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700">
                      {log.type === 'biberon' && log.quantite_ml && (
                        <p>Quantité: {log.quantite_ml}ml</p>
                      )}
                      {log.type === 'repas' && log.taille_assiette && (
                        <p>Assiette: {log.taille_assiette}</p>
                      )}
                      {log.duration_minutes && (
                        <p>Durée: {log.duration_minutes} min</p>
                      )}
                      {log.notes && (
                        <p className="mt-2 italic text-gray-600">{log.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Couche Logs */}
          <div className={`card border-2 ${babyColors[selectedBaby]}`}>
            <h2 className="text-2xl font-bold text-shinkofa-blue-deep mb-4 flex items-center gap-2">
              🧷 Couches ({coucheLogs.length})
            </h2>

            {coucheLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun changement enregistré
              </p>
            ) : (
              <div className="space-y-3">
                {coucheLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{typeEmojis[log.type]}</span>
                        <span className="font-bold text-shinkofa-blue-deep">
                          {log.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 capitalize">
                          {log.type}
                        </span>
                        <button
                          onClick={() => handleDeleteCouche(log.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                          disabled={deleteCoucheMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {log.notes && (
                      <p className="text-sm italic text-gray-600">{log.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bien-être Logs */}
          <div className={`card border-2 lg:col-span-2 ${babyColors[selectedBaby]}`}>
            <h2 className="text-2xl font-bold text-shinkofa-blue-deep mb-4 flex items-center gap-2">
              📝 Notes Bien-être ({bienEtreLogs.length})
            </h2>

            {bienEtreLogs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucune note enregistrée
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bienEtreLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{categoryEmojis[log.category]}</span>
                        <span className="font-bold text-shinkofa-blue-deep capitalize">
                          {log.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteBienEtre(log.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                        disabled={deleteBienEtreMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-700">{log.observation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Repas Modal */}
      <Modal
        isOpen={showRepasModal}
        onClose={() => setShowRepasModal(false)}
        title="Ajouter un repas"
        size="lg"
      >
        <form onSubmit={handleRepasSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Date"
              name="date"
              type="date"
              value={repasForm.date}
              onChange={(e) => setRepasForm({ ...repasForm, date: e.target.value })}
              required
            />

            <FormField
              label="Heure"
              name="time"
              type="time"
              value={repasForm.time}
              onChange={(e) => setRepasForm({ ...repasForm, time: e.target.value })}
              required
            />
          </div>

          <FormField
            label="Enfant"
            name="enfant"
            type="select"
            value={repasForm.enfant}
            onChange={(e) => setRepasForm({ ...repasForm, enfant: e.target.value as Enfant })}
            options={[
              { value: 'Evy', label: '👧 Evy' },
              { value: 'Nami', label: '👧 Nami' },
            ]}
            required
          />

          <FormField
            label="Type"
            name="type"
            type="select"
            value={repasForm.type}
            onChange={(e) => setRepasForm({ ...repasForm, type: e.target.value as 'biberon' | 'repas' })}
            options={[
              { value: 'biberon', label: '🍼 Biberon' },
              { value: 'repas', label: '🍽️ Repas' },
            ]}
            required
          />

          {repasForm.type === 'biberon' && (
            <FormField
              label="Quantité (ml)"
              name="quantite_ml"
              type="number"
              value={repasForm.quantite_ml}
              onChange={(e) => setRepasForm({ ...repasForm, quantite_ml: e.target.value })}
              placeholder="Ex: 180"
              min="0"
              step="10"
            />
          )}

          {repasForm.type === 'repas' && (
            <FormField
              label="Taille assiette"
              name="taille_assiette"
              type="select"
              value={repasForm.taille_assiette}
              onChange={(e) => setRepasForm({ ...repasForm, taille_assiette: e.target.value as 'petite' | 'moyenne' | 'grande' })}
              options={[
                { value: '', label: '-- Sélectionner --' },
                { value: 'petite', label: 'Petite' },
                { value: 'moyenne', label: 'Moyenne' },
                { value: 'grande', label: 'Grande' },
              ]}
            />
          )}

          <FormField
            label="Durée (minutes)"
            name="duration_minutes"
            type="number"
            value={repasForm.duration_minutes}
            onChange={(e) => setRepasForm({ ...repasForm, duration_minutes: e.target.value })}
            placeholder="Ex: 15"
            min="0"
            step="1"
          />

          <FormField
            label="Notes (optionnelles)"
            name="notes"
            type="textarea"
            value={repasForm.notes}
            onChange={(e) => setRepasForm({ ...repasForm, notes: e.target.value })}
            placeholder="Ex: A bien mangé, refus des légumes..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowRepasModal(false)}
              className="btn btn-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createRepasMutation.isPending}
            >
              {createRepasMutation.isPending ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Couche Modal */}
      <Modal
        isOpen={showCoucheModal}
        onClose={() => setShowCoucheModal(false)}
        title="Ajouter un changement de couche"
        size="md"
      >
        <form onSubmit={handleCoucheSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Date"
              name="date"
              type="date"
              value={coucheForm.date}
              onChange={(e) => setCoucheForm({ ...coucheForm, date: e.target.value })}
              required
            />

            <FormField
              label="Heure"
              name="time"
              type="time"
              value={coucheForm.time}
              onChange={(e) => setCoucheForm({ ...coucheForm, time: e.target.value })}
              required
            />
          </div>

          <FormField
            label="Enfant"
            name="enfant"
            type="select"
            value={coucheForm.enfant}
            onChange={(e) => setCoucheForm({ ...coucheForm, enfant: e.target.value as Enfant })}
            options={[
              { value: 'Evy', label: '👧 Evy' },
              { value: 'Nami', label: '👧 Nami' },
            ]}
            required
          />

          <FormField
            label="Type"
            name="type"
            type="select"
            value={coucheForm.type}
            onChange={(e) => setCoucheForm({ ...coucheForm, type: e.target.value as 'pipi' | 'caca' | 'mixte' })}
            options={[
              { value: 'pipi', label: '💧 Pipi' },
              { value: 'caca', label: '💩 Caca' },
              { value: 'mixte', label: '💧💩 Mixte' },
            ]}
            required
          />

          <FormField
            label="Notes (optionnelles)"
            name="notes"
            type="textarea"
            value={coucheForm.notes}
            onChange={(e) => setCoucheForm({ ...coucheForm, notes: e.target.value })}
            placeholder="Ex: Couche très mouillée, selles molles..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowCoucheModal(false)}
              className="btn btn-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createCoucheMutation.isPending}
            >
              {createCoucheMutation.isPending ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Bien-être Modal */}
      <Modal
        isOpen={showBienEtreModal}
        onClose={() => setShowBienEtreModal(false)}
        title="Ajouter une note bien-être"
        size="md"
      >
        <form onSubmit={handleBienEtreSubmit} className="space-y-4">
          <FormField
            label="Date"
            name="date"
            type="date"
            value={bienEtreForm.date}
            onChange={(e) => setBienEtreForm({ ...bienEtreForm, date: e.target.value })}
            required
          />

          <FormField
            label="Enfant"
            name="enfant"
            type="select"
            value={bienEtreForm.enfant}
            onChange={(e) => setBienEtreForm({ ...bienEtreForm, enfant: e.target.value as Enfant })}
            options={[
              { value: 'Evy', label: '👧 Evy' },
              { value: 'Nami', label: '👧 Nami' },
            ]}
            required
          />

          <FormField
            label="Catégorie"
            name="category"
            type="select"
            value={bienEtreForm.category}
            onChange={(e) => setBienEtreForm({ ...bienEtreForm, category: e.target.value as typeof bienEtreForm.category })}
            options={[
              { value: 'sante', label: '🏥 Santé' },
              { value: 'sommeil', label: '😴 Sommeil' },
              { value: 'comportement', label: '😊 Comportement' },
              { value: 'developpement', label: '📈 Développement' },
              { value: 'humeur', label: '💭 Humeur' },
              { value: 'allergie', label: '⚠️ Allergie' },
              { value: 'autre', label: '📌 Autre' },
            ]}
            required
          />

          <FormField
            label="Observation"
            name="observation"
            type="textarea"
            value={bienEtreForm.observation}
            onChange={(e) => setBienEtreForm({ ...bienEtreForm, observation: e.target.value })}
            placeholder="Ex: Température élevée, bonne humeur toute la journée..."
            rows={4}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowBienEtreModal(false)}
              className="btn btn-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createBienEtreMutation.isPending}
            >
              {createBienEtreMutation.isPending ? 'Enregistrement...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default BabyTrackingPage;
