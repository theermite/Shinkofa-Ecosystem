/**
 * Crisis Page - Neurodiversity Crisis Protocols (COMPLETE VERSION)
 * © 2025 La Voie Shinkofa
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';

interface CrisisProtocol {
  id: string;
  person_name: string;
  design_human_type?: string;
  crisis_type: 'frustration' | 'surcharge' | 'transition' | 'rejet' | 'colère' | 'peur' | 'autre';
  trigger_recognition?: string;
  immediate_response?: string;
  escalation_step1?: string;
  escalation_step2?: string;
  escalation_step3?: string;
  support_needs?: string;
  tools_available?: string;
  what_to_avoid?: string;
  recovery?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const personOptions = [
  { value: 'Jay', label: 'Jay' },
  { value: 'Angélique', label: 'Angélique' },
  { value: 'Gautier', label: 'Gautier' },
  { value: 'Lyam', label: 'Lyam' },
  { value: 'Théo', label: 'Théo' },
  { value: 'Evy', label: 'Evy' },
  { value: 'Nami', label: 'Nami' },
];

const crisisTypeOptions = [
  { value: 'frustration', label: '😤 Frustration' },
  { value: 'surcharge', label: '🔊 Surcharge' },
  { value: 'transition', label: '🔄 Transition' },
  { value: 'rejet', label: '😔 Rejet' },
  { value: 'colère', label: '😡 Colère' },
  { value: 'peur', label: '😨 Peur' },
  { value: 'autre', label: '📌 Autre' },
];

function CrisisPage() {
  const queryClient = useQueryClient();
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<CrisisProtocol | null>(null);

  const [formData, setFormData] = useState({
    person_name: '',
    crisis_type: 'frustration' as CrisisProtocol['crisis_type'],
    trigger_recognition: '',
    immediate_response: '',
    escalation_step1: '',
    escalation_step2: '',
    escalation_step3: '',
    support_needs: '',
    tools_available: '',
    what_to_avoid: '',
    recovery: '',
    notes: '',
  });

  // Fetch crisis protocols
  const { data: protocolsData, isLoading } = useQuery({
    queryKey: ['crisis-protocols'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/crisis`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch crisis protocols');
      const data = await response.json();
      return data.data as CrisisProtocol[];
    },
  });

  const protocols = protocolsData || [];

  // Create protocol mutation
  const createMutation = useMutation({
    mutationFn: async (newProtocol: typeof formData) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/crisis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newProtocol),
      });
      if (!response.ok) throw new Error('Failed to create protocol');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crisis-protocols'] });
      handleCloseModal();
    },
  });

  // Update protocol mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/crisis/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update protocol');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crisis-protocols'] });
      handleCloseModal();
    },
  });

  // Delete protocol mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/crisis/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete protocol');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crisis-protocols'] });
    },
  });

  const handleOpenModal = (protocol?: CrisisProtocol) => {
    if (protocol) {
      setEditingProtocol(protocol);
      setFormData({
        person_name: protocol.person_name,
        crisis_type: protocol.crisis_type,
        trigger_recognition: protocol.trigger_recognition || '',
        immediate_response: protocol.immediate_response || '',
        escalation_step1: protocol.escalation_step1 || '',
        escalation_step2: protocol.escalation_step2 || '',
        escalation_step3: protocol.escalation_step3 || '',
        support_needs: protocol.support_needs || '',
        tools_available: protocol.tools_available || '',
        what_to_avoid: protocol.what_to_avoid || '',
        recovery: protocol.recovery || '',
        notes: protocol.notes || '',
      });
    } else {
      setEditingProtocol(null);
      setFormData({
        person_name: '',
        crisis_type: 'frustration',
        trigger_recognition: '',
        immediate_response: '',
        escalation_step1: '',
        escalation_step2: '',
        escalation_step3: '',
        support_needs: '',
        tools_available: '',
        what_to_avoid: '',
        recovery: '',
        notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProtocol(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProtocol) {
      updateMutation.mutate({ id: editingProtocol.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce protocole ?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter protocols
  const filteredProtocols = protocols.filter((protocol) => {
    if (selectedPerson !== 'all' && protocol.person_name !== selectedPerson) {
      return false;
    }
    if (selectedTrigger !== 'all' && protocol.crisis_type !== selectedTrigger) {
      return false;
    }
    return true;
  });

  const triggerTypes = {
    surcharge: { label: 'Surcharge', emoji: '🔊', color: 'bg-red-100 border-red-300' },
    frustration: { label: 'Frustration', emoji: '😤', color: 'bg-yellow-100 border-yellow-300' },
    transition: { label: 'Transition', emoji: '🔄', color: 'bg-orange-100 border-orange-300' },
    rejet: { label: 'Rejet', emoji: '😔', color: 'bg-indigo-100 border-indigo-300' },
    colère: { label: 'Colère', emoji: '😡', color: 'bg-red-200 border-red-400' },
    peur: { label: 'Peur', emoji: '😨', color: 'bg-purple-100 border-purple-300' },
    autre: { label: 'Autre', emoji: '📌', color: 'bg-gray-100 border-gray-300' },
  } as const;

  const personNames = Array.from(new Set(protocols.map((p) => p.person_name)));

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-shinkofa-blue-deep mb-2">
            Protocoles de Crise 🆘
          </h1>
          <p className="text-gray-600">
            Procédures d'urgence neurodiversité
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Ajouter un protocole
        </button>
      </div>

      {/* Emergency Banner */}
      <div className="card bg-red-50 border-2 border-red-500 mb-8">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🆘</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-red-800 mb-2">
              EN CAS D'URGENCE
            </h2>
            <p className="text-red-700 mb-3">
              Si la situation est incontrôlable ou dangereuse, contactez immédiatement les services d'urgence espagnols.
            </p>
            <div className="flex gap-4 flex-wrap">
              <div className="bg-white px-4 py-2 rounded-lg border border-red-300">
                <p className="text-sm text-gray-600">Emergencias</p>
                <p className="text-2xl font-bold text-red-600">112</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg border border-red-300">
                <p className="text-sm text-gray-600">Urgencias Sanitarias</p>
                <p className="text-2xl font-bold text-red-600">061</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg border border-red-300">
                <p className="text-sm text-gray-600">Policia Nacional</p>
                <p className="text-2xl font-bold text-red-600">091</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg border border-red-300">
                <p className="text-sm text-gray-600">Policia Local</p>
                <p className="text-2xl font-bold text-red-600">092</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div>
          <label className="label text-sm">Personne</label>
          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-shinkofa-blue-royal"
          >
            <option value="all">Toutes les personnes</option>
            {personNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label text-sm">Type de déclencheur</label>
          <select
            value={selectedTrigger}
            onChange={(e) => setSelectedTrigger(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-shinkofa-blue-royal"
          >
            <option value="all">Tous les types</option>
            {Object.entries(triggerTypes).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Protocols List */}
      {isLoading ? (
        <div className="card text-center py-12">
          <span className="spinner"></span>
          <p className="text-gray-600 mt-4">Chargement des protocoles...</p>
        </div>
      ) : filteredProtocols.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 text-lg mb-4">
            Aucun protocole trouvé
          </p>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            Créer un protocole
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProtocols.map((protocol) => {
            const triggerInfo = triggerTypes[protocol.crisis_type] || triggerTypes.autre;

            return (
              <div
                key={protocol.id}
                className={`card border-2 ${triggerInfo.color}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{triggerInfo.emoji}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-shinkofa-blue-deep">
                        {protocol.person_name}
                      </h3>
                      <p className="text-gray-600 font-medium">
                        {triggerInfo.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(protocol)}
                      className="btn btn-outline text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(protocol.id)}
                      className="btn btn-danger text-sm"
                      disabled={deleteMutation.isPending}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                {protocol.trigger_recognition && (
                  <div className="mb-4 p-4 bg-white rounded-lg">
                    <h4 className="font-bold text-shinkofa-blue-deep mb-2">
                      🎯 Reconnaissance du déclencheur
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {protocol.trigger_recognition}
                    </p>
                  </div>
                )}

                {protocol.immediate_response && (
                  <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <h4 className="font-bold text-red-800 mb-2">
                      🚨 Réponse immédiate
                    </h4>
                    <p className="text-gray-900 whitespace-pre-wrap font-medium">
                      {protocol.immediate_response}
                    </p>
                  </div>
                )}

                {(protocol.escalation_step1 || protocol.escalation_step2 || protocol.escalation_step3) && (
                  <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-800 mb-2">
                      📊 Étapes d'escalade
                    </h4>
                    {protocol.escalation_step1 && (
                      <p className="text-gray-700 mb-2">
                        <strong>Étape 1:</strong> {protocol.escalation_step1}
                      </p>
                    )}
                    {protocol.escalation_step2 && (
                      <p className="text-gray-700 mb-2">
                        <strong>Étape 2:</strong> {protocol.escalation_step2}
                      </p>
                    )}
                    {protocol.escalation_step3 && (
                      <p className="text-gray-700">
                        <strong>Étape 3:</strong> {protocol.escalation_step3}
                      </p>
                    )}
                  </div>
                )}

                {protocol.recovery && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">
                      🌱 Récupération
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {protocol.recovery}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingProtocol ? 'Modifier le protocole' : 'Nouveau protocole'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Personne concernée"
              name="person_name"
              type="select"
              value={formData.person_name}
              onChange={(e) => setFormData({ ...formData, person_name: e.target.value })}
              options={personOptions}
              required
            />

            <FormField
              label="Type de crise"
              name="crisis_type"
              type="select"
              value={formData.crisis_type}
              onChange={(e) => setFormData({ ...formData, crisis_type: e.target.value as CrisisProtocol['crisis_type'] })}
              options={crisisTypeOptions}
              required
            />
          </div>

          <FormField
            label="Reconnaissance du déclencheur"
            name="trigger_recognition"
            type="textarea"
            value={formData.trigger_recognition}
            onChange={(e) => setFormData({ ...formData, trigger_recognition: e.target.value })}
            placeholder="Comment reconnaître les signes avant-coureurs..."
            rows={3}
          />

          <FormField
            label="Réponse immédiate"
            name="immediate_response"
            type="textarea"
            value={formData.immediate_response}
            onChange={(e) => setFormData({ ...formData, immediate_response: e.target.value })}
            placeholder="Que faire immédiatement..."
            rows={3}
          />

          <div className="space-y-2">
            <label className="label">Étapes d'escalade</label>
            <FormField
              label="Étape 1"
              name="escalation_step1"
              type="textarea"
              value={formData.escalation_step1}
              onChange={(e) => setFormData({ ...formData, escalation_step1: e.target.value })}
              rows={2}
            />
            <FormField
              label="Étape 2"
              name="escalation_step2"
              type="textarea"
              value={formData.escalation_step2}
              onChange={(e) => setFormData({ ...formData, escalation_step2: e.target.value })}
              rows={2}
            />
            <FormField
              label="Étape 3"
              name="escalation_step3"
              type="textarea"
              value={formData.escalation_step3}
              onChange={(e) => setFormData({ ...formData, escalation_step3: e.target.value })}
              rows={2}
            />
          </div>

          <FormField
            label="Récupération"
            name="recovery"
            type="textarea"
            value={formData.recovery}
            onChange={(e) => setFormData({ ...formData, recovery: e.target.value })}
            placeholder="Comment aider à la récupération après la crise..."
            rows={3}
          />

          <FormField
            label="Notes additionnelles"
            name="notes"
            type="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                : editingProtocol
                ? 'Mettre à jour'
                : 'Créer le protocole'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default CrisisPage;
