/**
 * Shopping Page - Family Shopping Lists Management
 * © 2025 La Voie Shinkofa
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Plus, Trash2, CheckCircle2, Circle, Calendar } from 'lucide-react';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';

interface ShoppingList {
  id: string;
  week_start: string;
  status: 'planification' | 'finale' | 'courses_faites';
  location?: string;
  total_estimate?: number;
  created_by: string;
}

interface ShoppingItem {
  id: string;
  shopping_list_id: string;
  name: string;
  category: 'fruits' | 'legumes' | 'proteines' | 'produits_laitiers' | 'basiques' | 'autre';
  quantity?: string;
  unit?: 'piece' | 'kg' | 'g' | 'litre' | 'ml' | 'paquet' | 'autre';
  is_checked: boolean;
  priority: 'optionnel' | 'souhaite' | 'essentiel';
  price_estimate?: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const categoryOptions = [
  { value: 'fruits', label: '🍎 Fruits' },
  { value: 'legumes', label: '🥬 Légumes' },
  { value: 'proteines', label: '🍖 Protéines' },
  { value: 'produits_laitiers', label: '🥛 Produits Laitiers' },
  { value: 'basiques', label: '🥫 Basiques' },
  { value: 'autre', label: '📌 Autre' },
];

const priorityOptions = [
  { value: 'optionnel', label: 'Optionnel' },
  { value: 'souhaite', label: 'Souhaité' },
  { value: 'essentiel', label: 'Essentiel' },
];

function ShoppingPage() {
  const queryClient = useQueryClient();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [listFormData, setListFormData] = useState({
    week_start: '',
  });
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: 'autre' as ShoppingItem['category'],
    quantity: '',
    unit: 'piece' as ShoppingItem['unit'],
    priority: 'souhaite' as ShoppingItem['priority'],
  });

  // Fetch shopping lists
  const { data: listsData, isLoading: listsLoading } = useQuery({
    queryKey: ['shopping-lists'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/shopping/lists`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch shopping lists');
      const data = await response.json();
      return data.data as ShoppingList[];
    },
  });

  const lists = listsData || [];

  // Fetch items for selected list
  const { data: itemsData, isLoading: itemsLoading } = useQuery({
    queryKey: ['shopping-items', selectedListId],
    queryFn: async () => {
      if (!selectedListId) return [];
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}${API_PREFIX}/shopping/lists/${selectedListId}/items`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch shopping items');
      const data = await response.json();
      return data.data as ShoppingItem[];
    },
    enabled: !!selectedListId,
  });

  const items = itemsData || [];

  // Auto-select first list if none selected
  useEffect(() => {
    if (!selectedListId && lists.length > 0 && !listsLoading) {
      setSelectedListId(lists[0].id);
    }
  }, [selectedListId, lists, listsLoading]);

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: async (newList: typeof listFormData) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/shopping/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newList),
      });
      if (!response.ok) throw new Error('Failed to create shopping list');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      setSelectedListId(data.data.id);
      handleCloseListModal();
    },
  });

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (newItem: typeof itemFormData & { shopping_list_id: string }) => {
      const token = localStorage.getItem('authToken');
      // Don't send shopping_list_id in body - it's already in the URL
      const { shopping_list_id, ...itemData } = newItem;
      const response = await fetch(`${API_URL}${API_PREFIX}/shopping/lists/${shopping_list_id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(itemData),
      });
      if (!response.ok) throw new Error('Failed to create shopping item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items', selectedListId] });
      handleCloseItemModal();
    },
  });

  // Toggle item checked mutation
  const toggleItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/shopping/items/${itemId}/toggle`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to toggle item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items', selectedListId] });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/shopping/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items', selectedListId] });
    },
  });

  // Delete list mutation
  const deleteListMutation = useMutation({
    mutationFn: async (listId: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/shopping/lists/${listId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete list');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      setSelectedListId(null);
    },
  });

  const handleDeleteList = (listId: string) => {
    if (confirm('Supprimer cette liste et tous ses articles ?')) {
      deleteListMutation.mutate(listId);
    }
  };

  const handleOpenListModal = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);

    setListFormData({
      week_start: monday.toISOString().slice(0, 10),
    });
    setShowListModal(true);
  };

  const handleCloseListModal = () => {
    setShowListModal(false);
  };

  const handleOpenItemModal = () => {
    setItemFormData({
      name: '',
      category: 'autre',
      quantity: '',
      unit: 'piece',
      priority: 'souhaite',
    });
    setShowItemModal(true);
  };

  const handleCloseItemModal = () => {
    setShowItemModal(false);
  };

  const handleSubmitList = (e: React.FormEvent) => {
    e.preventDefault();
    createListMutation.mutate(listFormData);
  };

  const handleSubmitItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListId) return;
    createItemMutation.mutate({
      ...itemFormData,
      shopping_list_id: selectedListId,
    });
  };

  const handleToggleItem = (itemId: string) => {
    toggleItemMutation.mutate(itemId);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Supprimer cet article ?')) {
      deleteItemMutation.mutate(itemId);
    }
  };

  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const selectedList = lists.find((list) => list.id === selectedListId);
  const checkedCount = items.filter((item) => item.is_checked).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-shinkofa-blue-deep mb-2">
            Liste de Courses 🛒
          </h1>
          <p className="text-gray-600">Gérez vos courses hebdomadaires</p>
        </div>
        <button onClick={handleOpenListModal} className="btn btn-primary">
          + Nouvelle liste
        </button>
      </div>

      {/* Lists Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {listsLoading ? (
          <div className="text-gray-600">Chargement...</div>
        ) : lists.length === 0 ? (
          <div className="text-gray-600">
            Aucune liste. Créez votre première liste de courses !
          </div>
        ) : (
          lists.map((list) => {
            const weekDate = new Date(list.week_start);
            const formattedDate = weekDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            return (
              <div key={list.id} className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedListId(list.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                    selectedListId === list.id
                      ? 'bg-shinkofa-blue-royal text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Semaine du {formattedDate}
                  {list.status === 'courses_faites' && ' ✓'}
                </button>
                <button
                  onClick={() => handleDeleteList(list.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer la liste"
                  disabled={deleteListMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Progress Bar */}
      {selectedList && totalCount > 0 && (
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-shinkofa-blue-deep">Progression</span>
            <span className="text-sm text-gray-600">
              {checkedCount} / {totalCount} articles ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-shinkofa-emerald h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Add Item Button */}
      {selectedList && (
        <div className="mb-6">
          <button onClick={handleOpenItemModal} className="btn btn-success">
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un article
          </button>
        </div>
      )}

      {/* Items List */}
      {itemsLoading ? (
        <div className="card text-center py-12">
          <span className="spinner"></span>
          <p className="text-gray-600 mt-4">Chargement des articles...</p>
        </div>
      ) : !selectedList ? (
        <div className="card text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">
            Sélectionnez ou créez une liste de courses
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="card text-center py-12">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">Liste de courses vide</p>
          <button onClick={handleOpenItemModal} className="btn btn-primary mt-4">
            Ajouter des articles
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categoryOptions.map((category) => {
            const categoryItems = itemsByCategory[category.value] || [];
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.value} className="card">
                <h3 className="text-xl font-bold text-shinkofa-blue-deep mb-4 flex items-center gap-2">
                  <span>{category.label}</span>
                  <span className="text-sm text-gray-500">
                    ({categoryItems.filter((i) => i.is_checked).length}/{categoryItems.length})
                  </span>
                </h3>

                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        item.is_checked
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-white border-gray-300 hover:border-shinkofa-blue-royal'
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleItem(item.id)}
                        className="flex-shrink-0"
                        disabled={toggleItemMutation.isPending}
                      >
                        {item.is_checked ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 hover:text-shinkofa-blue-royal" />
                        )}
                      </button>

                      {/* Item Info */}
                      <div className="flex-1">
                        <span
                          className={`font-medium ${
                            item.is_checked
                              ? 'text-gray-500 line-through'
                              : 'text-gray-900'
                          }`}
                        >
                          {item.name}
                        </span>
                        {item.quantity && (
                          <span className="text-gray-500 ml-2">({item.quantity})</span>
                        )}
                        {item.priority === 'essentiel' && !item.is_checked && (
                          <span className="ml-2 text-red-600 font-bold">!</span>
                        )}
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={deleteItemMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create List Modal */}
      <Modal
        isOpen={showListModal}
        onClose={handleCloseListModal}
        title="Nouvelle liste de courses"
        size="md"
      >
        <form onSubmit={handleSubmitList} className="space-y-4">
          <FormField
            label="Semaine du (lundi)"
            name="week_start"
            type="date"
            value={listFormData.week_start}
            onChange={(e) =>
              setListFormData({ ...listFormData, week_start: e.target.value })
            }
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={handleCloseListModal} className="btn btn-outline">
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createListMutation.isPending}
            >
              {createListMutation.isPending ? 'Création...' : 'Créer la liste'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        isOpen={showItemModal}
        onClose={handleCloseItemModal}
        title="Ajouter un article"
        size="md"
      >
        <form onSubmit={handleSubmitItem} className="space-y-4">
          <FormField
            label="Nom de l'article"
            name="name"
            value={itemFormData.name}
            onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
            placeholder="Ex: Lait, Pain, Tomates..."
            required
          />

          <FormField
            label="Catégorie"
            name="category"
            type="select"
            value={itemFormData.category}
            onChange={(e) =>
              setItemFormData({
                ...itemFormData,
                category: e.target.value as ShoppingItem['category'],
              })
            }
            options={categoryOptions}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Quantité (optionnelle)"
              name="quantity"
              value={itemFormData.quantity}
              onChange={(e) => setItemFormData({ ...itemFormData, quantity: e.target.value })}
              placeholder="Ex: 1L, 500g, 3 pcs..."
            />

            <FormField
              label="Priorité"
              name="priority"
              type="select"
              value={itemFormData.priority}
              onChange={(e) =>
                setItemFormData({
                  ...itemFormData,
                  priority: e.target.value as ShoppingItem['priority'],
                })
              }
              options={priorityOptions}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={handleCloseItemModal} className="btn btn-outline">
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createItemMutation.isPending}
            >
              {createItemMutation.isPending ? 'Ajout...' : 'Ajouter l\'article'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ShoppingPage;
