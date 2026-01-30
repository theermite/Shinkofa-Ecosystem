/**
 * Ermite Control Center - Main App
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Widgets from '@/pages/Widgets'
import WidgetDetail from '@/pages/WidgetDetail'
import Analytics from '@/pages/Analytics'
import Settings from '@/pages/Settings'
import TaskManager from '@/pages/TaskManager'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="widgets" element={<Widgets />} />
        <Route path="widgets/:widgetId" element={<WidgetDetail />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="tasks" element={<TaskManager />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
