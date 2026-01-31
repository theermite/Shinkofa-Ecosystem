import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useAuthStore } from '@/store/authStore'
import { versionManager } from '@/services/versionManager'

// Pages
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DashboardRouter from '@/pages/dashboard/DashboardRouter'
import ExercisesPage from '@/pages/ExercisesPage'
import ExercisePage from '@/pages/exercises/ExercisePage'
import CalendarPage from '@/pages/CalendarPage'
import InvitationsPage from '@/pages/InvitationsPage'
import JournalPage from '@/pages/JournalPage'
import GoalsPage from '@/pages/GoalsPage'
import MediaPage from '@/pages/MediaPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import CoachingPage from '@/pages/CoachingPage'
import ProfilePage from '@/pages/ProfilePage'
import TeamManagementPage from '@/pages/TeamManagementPage'
import SettingsPage from '@/pages/SettingsPage'
import ReportsPage from '@/pages/ReportsPage'
import ReportViewerPage from '@/pages/ReportViewerPage'
import ContactSubmissionsPage from "@/pages/ContactSubmissionsPage"
import RecruitmentPage from "@/pages/RecruitmentPage"
import UsersPage from '@/pages/UsersPage'
import PeripheralVisionGame from '@/pages/games/PeripheralVisionGame'
import MultiTaskGame from '@/pages/games/MultiTaskGame'
import ReactionTimeGame from '@/pages/games/ReactionTimeGame'
import MemoryExercisePage from '@/pages/MemoryExercisePage'

// Components
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import MoralContractChecker from '@/components/auth/MoralContractChecker'
import UpdateNotification from '@/components/common/UpdateNotification'

// Create QueryClient for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  const { initialize } = useAuthStore()

  // Initialize auth state and version check on app load
  useEffect(() => {
    // Check version and run migrations if needed
    versionManager.checkVersion()

    // Initialize auth
    initialize()
  }, [initialize])

  return (
    <QueryClientProvider client={queryClient}>
      <MoralContractChecker>
        <UpdateNotification />
        <Router>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          {/* Redirect /register to landing (disabled public registration) */}
          <Route path="/register" element={<Navigate to="/" replace />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Exercises - Brain Training Cognitive Exercises */}
          <Route
            path="/exercises/:exerciseId"
            element={
              <ProtectedRoute>
                <ExercisePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exercises"
            element={
              <ProtectedRoute>
                <ExercisesPage />
              </ProtectedRoute>
            }
          />

          {/* Custom Mini-Games */}
          <Route
            path="/games/peripheral-vision"
            element={
              <ProtectedRoute>
                <PeripheralVisionGame />
              </ProtectedRoute>
            }
          />

          <Route
            path="/games/multi-task"
            element={
              <ProtectedRoute>
                <MultiTaskGame />
              </ProtectedRoute>
            }
          />

          <Route
            path="/games/reaction-time/:id"
            element={
              <ProtectedRoute>
                <ReactionTimeGame />
              </ProtectedRoute>
            }
          />

          <Route
            path="/games/memory/:exerciseId"
            element={
              <ProtectedRoute>
                <MemoryExercisePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />

          {/* Invitations - Session Invitations Management */}
          <Route
            path="/invitations"
            element={
              <ProtectedRoute>
                <InvitationsPage />
              </ProtectedRoute>
            }
          />

          {/* Coaching */}
          <Route
            path="/coaching"
            element={
              <ProtectedRoute>
                <CoachingPage />
              </ProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Team Management */}
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <TeamManagementPage />
              </ProtectedRoute>
            }
          />

          {/* Users Management (Super Admin only) */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/:id"
            element={
              <ProtectedRoute>
                <ReportViewerPage />
              </ProtectedRoute>
            }
          />

          {/* Contact Submissions (Coaches/Managers) */}
          <Route
            path="/contact-submissions"
            element={
              <ProtectedRoute>
                <ContactSubmissionsPage />
              </ProtectedRoute>
            }
          />

          {/* Recruitment (Coaches/Managers) */}
          <Route
            path="/recruitment"
            element={
              <ProtectedRoute>
                <RecruitmentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <JournalPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <GoalsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/media"
            element={
              <ProtectedRoute>
                <MediaPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                    Page non trouvée
                  </p>
                  <a
                    href="/"
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                  >
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            }
          />
          </Routes>
        </Router>
      </MoralContractChecker>
    </QueryClientProvider>
  )
}

export default App
