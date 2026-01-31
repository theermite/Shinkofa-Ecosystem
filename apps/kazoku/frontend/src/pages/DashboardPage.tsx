/**
 * Dashboard Page - Main Hub Overview
 * © 2025 La Voie Shinkofa
 */

import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, CheckCircle, ShoppingCart, Clock, ChefHat } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

function DashboardPage() {
  const { user } = useAuth();

  // Get current week dates
  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
  };

  const { monday, sunday } = getWeekDates();

  // Fetch events for this week
  const { data: eventsData } = useQuery({
    queryKey: ['dashboard-events'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const start = monday.toISOString().split('T')[0];
      const end = sunday.toISOString().split('T')[0];
      const response = await fetch(
        `${API_URL}${API_PREFIX}/events?start_date=${start}&end_date=${end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 60000,
  });

  // Fetch tasks in progress
  const { data: tasksData } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}${API_PREFIX}/tasks?status=pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 60000,
  });

  // Fetch shopping items
  const { data: shoppingData } = useQuery({
    queryKey: ['dashboard-shopping'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}${API_PREFIX}/shopping/lists`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) return { lists: [], items: 0 };
      const data = await response.json();
      const lists = data.data || [];
      // Get the most recent active list
      const activeList = lists.find((l: any) => l.status !== 'courses_faites');
      if (!activeList) return { lists, items: 0 };

      // Fetch items for active list
      const itemsResponse = await fetch(
        `${API_URL}${API_PREFIX}/shopping/lists/${activeList.id}/items`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!itemsResponse.ok) return { lists, items: 0 };
      const itemsData = await itemsResponse.json();
      const uncheckedItems = (itemsData.data || []).filter((i: any) => !i.is_checked);
      return { lists, items: uncheckedItems.length };
    },
    staleTime: 60000,
  });

  // Fetch meals for this week
  const { data: mealsData } = useQuery({
    queryKey: ['dashboard-meals'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const weekStart = monday.toISOString().split('T')[0];
      const response = await fetch(
        `${API_URL}${API_PREFIX}/meals?week_start=${weekStart}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 60000,
  });

  // Fetch recipes count
  const { data: recipesData } = useQuery({
    queryKey: ['dashboard-recipes'],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${API_URL}${API_PREFIX}/recipes`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 60000,
  });

  const eventsCount = eventsData?.length || 0;
  const tasksCount = tasksData?.length || 0;
  const shoppingItemsCount = shoppingData?.items || 0;
  const mealsPlanned = mealsData?.length || 0;
  const recipesCount = recipesData?.length || 0;

  const modules = [
    {
      name: 'Calendrier',
      path: '/calendar',
      icon: '📅',
      description: 'Evenements et rendez-vous familiaux',
      color: 'bg-blue-100 border-blue-300 hover:border-blue-500',
    },
    {
      name: 'Taches Menageres',
      path: '/tasks',
      icon: '✓',
      description: 'Suivi et assignation des taches',
      color: 'bg-green-100 border-green-300 hover:border-green-500',
    },
    {
      name: 'Planning Repas',
      path: '/meals',
      icon: '🍽️',
      description: 'Organisation des repas hebdomadaires',
      color: 'bg-yellow-100 border-yellow-300 hover:border-yellow-500',
    },
    {
      name: 'Recettes',
      path: '/recipes',
      icon: '📖',
      description: 'Gestion des recettes familiales',
      color: 'bg-orange-100 border-orange-300 hover:border-orange-500',
    },
    {
      name: 'Liste de Courses',
      path: '/shopping',
      icon: '🛒',
      description: 'Gestion des achats alimentaires',
      color: 'bg-purple-100 border-purple-300 hover:border-purple-500',
    },
    {
      name: 'Suivi Bebes',
      path: '/baby',
      icon: '👶',
      description: 'Repas, couches et bien-etre (Evy & Nami)',
      color: 'bg-pink-100 border-pink-300 hover:border-pink-500',
    },
    {
      name: 'Protocoles Crise',
      path: '/crisis',
      icon: '🆘',
      description: 'Procedures urgence neurodiversite',
      color: 'bg-red-100 border-red-300 hover:border-red-500',
    },
  ];

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-shinkofa-blue-deep mb-2">
          Bonjour, {user?.name || 'Utilisateur'}
        </h1>
        <p className="text-gray-600 text-lg">
          Bienvenue sur votre Family Hub
        </p>
        {user?.design_humain_type && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-shinkofa-emerald bg-opacity-10 border border-shinkofa-emerald rounded-lg">
            <span className="font-medium text-shinkofa-blue-deep">
              Design Humain:
            </span>
            <span className="text-shinkofa-emerald font-bold">
              {user.design_humain_type}
            </span>
            {user.design_humain_autorite && (
              <span className="text-gray-600">
                - {user.design_humain_autorite}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-5 gap-4">
        <Link to="/calendar" className="card bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-shinkofa-blue-royal">{eventsCount}</p>
              <p className="text-xs text-gray-500">Evenements</p>
            </div>
          </div>
        </Link>

        <Link to="/tasks" className="card bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-shinkofa-emerald">{tasksCount}</p>
              <p className="text-xs text-gray-500">Taches</p>
            </div>
          </div>
        </Link>

        <Link to="/meals" className="card bg-gradient-to-br from-yellow-50 to-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{mealsPlanned}</p>
              <p className="text-xs text-gray-500">Repas planifies</p>
            </div>
          </div>
        </Link>

        <Link to="/recipes" className="card bg-gradient-to-br from-orange-50 to-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChefHat className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{recipesCount}</p>
              <p className="text-xs text-gray-500">Recettes</p>
            </div>
          </div>
        </Link>

        <Link to="/shopping" className="card bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{shoppingItemsCount}</p>
              <p className="text-xs text-gray-500">A acheter</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Modules Grid */}
      <h2 className="text-xl font-bold text-shinkofa-blue-deep mb-4">Modules</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link
            key={module.path}
            to={module.path}
            className={`card border-2 transition-all duration-200 ${module.color}`}
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{module.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-shinkofa-blue-deep mb-2">
                  {module.name}
                </h3>
                <p className="text-gray-600">{module.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DashboardPage;
