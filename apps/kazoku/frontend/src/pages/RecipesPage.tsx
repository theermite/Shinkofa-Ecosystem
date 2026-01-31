/**
 * Recipes Page - Recipe Management with Shopping Integration
 * © 2025 La Voie Shinkofa
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Clock,
  Users,
  ChefHat,
  ShoppingCart,
  X,
  Check,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';

interface RecipeIngredient {
  id?: string;
  name: string;
  quantity?: string;
  unit: string;
  category: string;
  is_optional: boolean;
}

interface Recipe {
  id: string;
  name: string;
  description?: string;
  category: 'entree' | 'plat' | 'dessert' | 'snack' | 'boisson' | 'petit_dejeuner';
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  instructions?: string;
  image_url?: string;
  ingredients?: RecipeIngredient[];
  created_at: string;
  updated_at: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const categoryOptions = [
  { value: 'entree', label: 'Entree' },
  { value: 'plat', label: 'Plat principal' },
  { value: 'dessert', label: 'Dessert' },
  { value: 'snack', label: 'Snack' },
  { value: 'boisson', label: 'Boisson' },
  { value: 'petit_dejeuner', label: 'Petit-dejeuner' },
];

const difficultyOptions = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
];

const unitOptions = [
  { value: 'piece', label: 'piece(s)' },
  { value: 'kg', label: 'kg' },
  { value: 'g', label: 'g' },
  { value: 'litre', label: 'litre(s)' },
  { value: 'ml', label: 'ml' },
  { value: 'cl', label: 'cl' },
  { value: 'cuillere_soupe', label: 'c. a soupe' },
  { value: 'cuillere_cafe', label: 'c. a cafe' },
  { value: 'tasse', label: 'tasse(s)' },
  { value: 'pincee', label: 'pincee(s)' },
  { value: 'autre', label: 'autre' },
];

const ingredientCategoryOptions = [
  { value: 'fruits', label: 'Fruits' },
  { value: 'legumes', label: 'Legumes' },
  { value: 'proteines', label: 'Proteines' },
  { value: 'produits_laitiers', label: 'Produits laitiers' },
  { value: 'epicerie', label: 'Epicerie' },
  { value: 'surgeles', label: 'Surgeles' },
  { value: 'boissons', label: 'Boissons' },
  { value: 'autre', label: 'Autre' },
];

const categoryEmoji: Record<string, string> = {
  entree: '🥗',
  plat: '🍽️',
  dessert: '🍰',
  snack: '🍿',
  boisson: '🥤',
  petit_dejeuner: '🥐',
};

const difficultyColor: Record<string, string> = {
  facile: 'bg-green-100 text-green-800',
  moyen: 'bg-yellow-100 text-yellow-800',
  difficile: 'bg-red-100 text-red-800',
};

function RecipesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [selectedRecipes, setSelectedRecipes] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'plat' as Recipe['category'],
    prep_time_minutes: '',
    cook_time_minutes: '',
    servings: '4',
    difficulty: 'moyen' as Recipe['difficulty'],
    instructions: '',
    image_url: '',
  });

  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    unit: 'piece',
    category: 'autre',
    is_optional: false,
  });

  // Fetch recipes
  const { data: recipesData, isLoading } = useQuery({
    queryKey: ['recipes', filterCategory, searchTerm],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(
        `${API_URL}${API_PREFIX}/recipes?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch recipes');
      const data = await response.json();
      return data.data as Recipe[];
    },
  });

  const recipes = recipesData || [];

  // Fetch single recipe with ingredients
  const fetchRecipeDetails = async (id: string): Promise<Recipe> => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_URL}${API_PREFIX}/recipes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch recipe');
    const data = await response.json();
    return data.data;
  };

  // Create recipe mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData & { ingredients: RecipeIngredient[] }) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          prep_time_minutes: data.prep_time_minutes ? parseInt(data.prep_time_minutes) : null,
          cook_time_minutes: data.cook_time_minutes ? parseInt(data.cook_time_minutes) : null,
          servings: data.servings ? parseInt(data.servings) : 4,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erreur lors de la creation');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      handleCloseModal();
    },
    onError: (error: Error) => {
      alert(`Erreur: ${error.message}`);
    },
  });

  // Update recipe mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: typeof formData & { ingredients: RecipeIngredient[] };
    }) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/recipes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          prep_time_minutes: data.prep_time_minutes ? parseInt(data.prep_time_minutes) : null,
          cook_time_minutes: data.cook_time_minutes ? parseInt(data.cook_time_minutes) : null,
          servings: data.servings ? parseInt(data.servings) : 4,
        }),
      });
      if (!response.ok) throw new Error('Failed to update recipe');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      handleCloseModal();
    },
  });

  // Delete recipe mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete recipe');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
  });

  // Generate shopping list mutation
  const generateShoppingMutation = useMutation({
    mutationFn: async (recipeIds: string[]) => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}${API_PREFIX}/recipes/generate-shopping-list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipe_ids: recipeIds }),
      });
      if (!response.ok) throw new Error('Failed to generate shopping list');
      return response.json();
    },
    onSuccess: (data) => {
      alert(`${data.data.items_added} ingredients ajoutes a la liste de courses!`);
      setSelectedRecipes([]);
      setShowShoppingModal(false);
    },
  });

  const handleOpenModal = async (recipe?: Recipe) => {
    if (recipe) {
      // Fetch full recipe with ingredients
      const fullRecipe = await fetchRecipeDetails(recipe.id);
      setEditingRecipe(fullRecipe);
      setFormData({
        name: fullRecipe.name,
        description: fullRecipe.description || '',
        category: fullRecipe.category,
        prep_time_minutes: fullRecipe.prep_time_minutes?.toString() || '',
        cook_time_minutes: fullRecipe.cook_time_minutes?.toString() || '',
        servings: fullRecipe.servings?.toString() || '4',
        difficulty: fullRecipe.difficulty,
        instructions: fullRecipe.instructions || '',
        image_url: fullRecipe.image_url || '',
      });
      setIngredients(fullRecipe.ingredients || []);
    } else {
      setEditingRecipe(null);
      setFormData({
        name: '',
        description: '',
        category: 'plat',
        prep_time_minutes: '',
        cook_time_minutes: '',
        servings: '4',
        difficulty: 'moyen',
        instructions: '',
        image_url: '',
      });
      setIngredients([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRecipe(null);
    setIngredients([]);
  };

  const handleViewRecipe = async (recipe: Recipe) => {
    const fullRecipe = await fetchRecipeDetails(recipe.id);
    setViewingRecipe(fullRecipe);
    setShowViewModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingRecipe(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, ingredients };
    if (editingRecipe) {
      updateMutation.mutate({ id: editingRecipe.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Etes-vous sur de vouloir supprimer cette recette ?')) {
      deleteMutation.mutate(id);
    }
  };

  const addIngredient = () => {
    if (!newIngredient.name.trim()) return;
    setIngredients([...ingredients, { ...newIngredient }]);
    setNewIngredient({
      name: '',
      quantity: '',
      unit: 'piece',
      category: 'autre',
      is_optional: false,
    });
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const toggleRecipeSelection = (id: string) => {
    setSelectedRecipes((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '-';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-shinkofa-blue-deep mb-2">
            Recettes
          </h1>
          <p className="text-gray-600">
            Gerez vos recettes et generez des listes de courses
          </p>
        </div>
        <div className="flex gap-3">
          {selectedRecipes.length > 0 && (
            <button
              onClick={() => setShowShoppingModal(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Generer liste ({selectedRecipes.length})
            </button>
          )}
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle recette
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une recette..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input w-48"
        >
          <option value="">Toutes categories</option>
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Recipes Grid */}
      {isLoading ? (
        <div className="card text-center py-12">
          <span className="spinner"></span>
          <p className="text-gray-600 mt-4">Chargement des recettes...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="card text-center py-12">
          <ChefHat className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Aucune recette trouvee</p>
          <button
            onClick={() => handleOpenModal()}
            className="btn btn-primary mt-4"
          >
            Creer votre premiere recette
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className={`card hover:shadow-lg transition-shadow relative ${
                selectedRecipes.includes(recipe.id) ? 'ring-2 ring-shinkofa-emerald' : ''
              }`}
            >
              {/* Selection checkbox */}
              <button
                onClick={() => toggleRecipeSelection(recipe.id)}
                className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedRecipes.includes(recipe.id)
                    ? 'bg-shinkofa-emerald border-shinkofa-emerald text-white'
                    : 'border-gray-300 hover:border-shinkofa-emerald'
                }`}
              >
                {selectedRecipes.includes(recipe.id) && <Check className="w-4 h-4" />}
              </button>

              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{categoryEmoji[recipe.category] || '🍽️'}</span>
                <div className="flex-1 pr-8">
                  <h3 className="font-bold text-lg text-shinkofa-blue-deep">{recipe.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{recipe.category.replace('_', ' ')}</p>
                </div>
              </div>

              {recipe.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{recipe.description}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor[recipe.difficulty]}`}>
                  {recipe.difficulty}
                </span>
                {recipe.prep_time_minutes && (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Prep: {formatTime(recipe.prep_time_minutes)}
                  </span>
                )}
                {recipe.cook_time_minutes && (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Cuisson: {formatTime(recipe.cook_time_minutes)}
                  </span>
                )}
                {recipe.servings && (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {recipe.servings} pers.
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => handleViewRecipe(recipe)}
                  className="p-2 hover:bg-gray-100 rounded text-gray-600"
                  title="Voir details"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleOpenModal(recipe)}
                  className="p-2 hover:bg-blue-100 rounded text-blue-600"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(recipe.id)}
                  className="p-2 hover:bg-red-100 rounded text-red-600"
                  title="Supprimer"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Recipe Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        title="Details de la recette"
        size="lg"
      >
        {viewingRecipe && (
          <div className="space-y-6">
            <div className="bg-shinkofa-blue-deep text-white rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{categoryEmoji[viewingRecipe.category] || '🍽️'}</span>
                <div>
                  <h2 className="text-2xl font-bold">{viewingRecipe.name}</h2>
                  <p className="text-blue-100 capitalize">
                    {viewingRecipe.category.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </div>

            {viewingRecipe.description && (
              <p className="text-gray-700">{viewingRecipe.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Difficulte</p>
                <p className={`font-medium px-2 py-1 rounded-full text-sm inline-block mt-1 ${difficultyColor[viewingRecipe.difficulty]}`}>
                  {viewingRecipe.difficulty}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Preparation</p>
                <p className="font-medium text-gray-900">{formatTime(viewingRecipe.prep_time_minutes)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Cuisson</p>
                <p className="font-medium text-gray-900">{formatTime(viewingRecipe.cook_time_minutes)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Portions</p>
                <p className="font-medium text-gray-900">{viewingRecipe.servings || 4} pers.</p>
              </div>
            </div>

            {viewingRecipe.ingredients && viewingRecipe.ingredients.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" /> Ingredients
                </h3>
                <ul className="space-y-2">
                  {viewingRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>
                        {ing.quantity && `${ing.quantity} `}
                        {ing.unit !== 'piece' && `${unitOptions.find(u => u.value === ing.unit)?.label || ing.unit} `}
                        <strong>{ing.name}</strong>
                        {ing.is_optional && <span className="text-gray-400 ml-1">(optionnel)</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {viewingRecipe.instructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-3">Instructions</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{viewingRecipe.instructions}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button onClick={handleCloseViewModal} className="btn btn-outline">
                Fermer
              </button>
              <button
                onClick={() => {
                  handleCloseViewModal();
                  handleOpenModal(viewingRecipe);
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

      {/* Create/Edit Recipe Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingRecipe ? 'Modifier la recette' : 'Nouvelle recette'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nom de la recette"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Lasagnes bolognaise"
              required
            />
            <FormField
              label="Categorie"
              name="category"
              type="select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as Recipe['category'] })}
              options={categoryOptions}
              required
            />
          </div>

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Breve description de la recette..."
            rows={2}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField
              label="Prep (min)"
              name="prep_time_minutes"
              type="number"
              value={formData.prep_time_minutes}
              onChange={(e) => setFormData({ ...formData, prep_time_minutes: e.target.value })}
              placeholder="15"
            />
            <FormField
              label="Cuisson (min)"
              name="cook_time_minutes"
              type="number"
              value={formData.cook_time_minutes}
              onChange={(e) => setFormData({ ...formData, cook_time_minutes: e.target.value })}
              placeholder="30"
            />
            <FormField
              label="Portions"
              name="servings"
              type="number"
              value={formData.servings}
              onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
              placeholder="4"
            />
            <FormField
              label="Difficulte"
              name="difficulty"
              type="select"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as Recipe['difficulty'] })}
              options={difficultyOptions}
            />
          </div>

          {/* Ingredients Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Ingredients</h3>

            {/* Current ingredients list */}
            {ingredients.length > 0 && (
              <ul className="mb-4 space-y-2">
                {ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                    <span>
                      {ing.quantity && `${ing.quantity} `}
                      {ing.unit !== 'piece' && `${unitOptions.find(u => u.value === ing.unit)?.label || ing.unit} `}
                      <strong>{ing.name}</strong>
                      <span className="text-gray-400 text-sm ml-2">
                        ({ingredientCategoryOptions.find(c => c.value === ing.category)?.label || ing.category})
                      </span>
                      {ing.is_optional && <span className="text-gray-400 ml-1">(opt.)</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add new ingredient */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 items-end">
              <input
                type="text"
                placeholder="Ingredient"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                className="input col-span-2"
              />
              <input
                type="text"
                placeholder="Qte"
                value={newIngredient.quantity}
                onChange={(e) => setNewIngredient({ ...newIngredient, quantity: e.target.value })}
                className="input"
              />
              <select
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                className="input"
              >
                {unitOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <select
                value={newIngredient.category}
                onChange={(e) => setNewIngredient({ ...newIngredient, category: e.target.value })}
                className="input"
              >
                {ingredientCategoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={addIngredient}
                className="btn btn-secondary"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <FormField
            label="Instructions"
            name="instructions"
            type="textarea"
            value={formData.instructions}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
            placeholder="Etapes de preparation..."
            rows={6}
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={handleCloseModal} className="btn btn-outline">
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Enregistrement...'
                : editingRecipe
                ? 'Mettre a jour'
                : 'Creer la recette'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Generate Shopping List Modal */}
      <Modal
        isOpen={showShoppingModal}
        onClose={() => setShowShoppingModal(false)}
        title="Generer une liste de courses"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Vous allez generer une liste de courses avec les ingredients de {selectedRecipes.length} recette(s) selectionnee(s).
          </p>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Recettes selectionnees :</h4>
            <ul className="space-y-1">
              {selectedRecipes.map((id) => {
                const recipe = recipes.find((r) => r.id === id);
                return recipe ? (
                  <li key={id} className="flex items-center gap-2 text-gray-700">
                    <span>{categoryEmoji[recipe.category] || '🍽️'}</span>
                    {recipe.name}
                  </li>
                ) : null;
              })}
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setShowShoppingModal(false)}
              className="btn btn-outline"
            >
              Annuler
            </button>
            <button
              onClick={() => generateShoppingMutation.mutate(selectedRecipes)}
              className="btn btn-primary"
              disabled={generateShoppingMutation.isPending}
            >
              {generateShoppingMutation.isPending ? (
                <>
                  <span className="spinner mr-2"></span>
                  Generation...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Generer la liste
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default RecipesPage;
