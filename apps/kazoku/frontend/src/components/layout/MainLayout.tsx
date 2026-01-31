/**
 * Main Layout Component - Sidebar Navigation + Content Area
 * © 2025 La Voie Shinkofa
 */

import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X } from 'lucide-react';

function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Tableau de bord', path: '/dashboard', icon: '🏠' },
    { name: 'Calendrier', path: '/calendar', icon: '📅' },
    { name: 'Tâches', path: '/tasks', icon: '✓' },
    { name: 'Repas', path: '/meals', icon: '🍽️' },
    { name: 'Recettes', path: '/recipes', icon: '📖' },
    { name: 'Courses', path: '/shopping', icon: '🛒' },
    { name: 'Suivi Bébés', path: '/baby', icon: '👶' },
    { name: 'Protocoles Crise', path: '/crisis', icon: '🆘' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-shinkofa-cream">
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between bg-shinkofa-blue-deep text-white px-4 h-14 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg hover:bg-shinkofa-blue-royal transition-colors"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold">Family Hub</h1>
        <Link to="/profile" className="flex-shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: user?.avatar_color || '#0bb1f9' }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        </Link>
      </div>

      {/* Overlay (mobile only) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-shinkofa-blue-deep text-white flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto
        `}
      >
        <div className="p-6 border-b border-shinkofa-blue-royal flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Family Hub</h1>
            <p className="text-sm text-gray-300 mt-1">La Voie Shinkofa</p>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1 rounded-lg hover:bg-shinkofa-blue-royal transition-colors md:hidden"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-shinkofa-blue-royal">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: user?.avatar_color || '#0bb1f9' }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="font-medium text-white">{user?.name || 'Utilisateur'}</p>
              <p className="text-xs text-gray-300">{user?.role || 'viewer'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 custom-scrollbar overflow-y-auto">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-shinkofa-blue-royal text-white'
                      : 'text-gray-300 hover:bg-shinkofa-blue-royal hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-shinkofa-blue-royal">
          <Link
            to="/profile"
            onClick={closeSidebar}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-shinkofa-blue-royal hover:text-white transition-colors mb-2"
          >
            <span className="text-xl">👤</span>
            <span className="font-medium">Profil</span>
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-shinkofa-bordeaux hover:text-white transition-colors"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
