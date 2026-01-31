/**
 * Coaching Page - Unified coaching interface with player/coach views
 */

import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/user'
import MainLayout from '@/components/layout/MainLayout'
import PlayerDashboard from '@/components/coaching/PlayerDashboard'
import CoachDashboard from '@/components/coaching/CoachDashboard'
import TacticBoard from '@/components/coaching/TacticBoard'

const CoachingPage: FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'player' | 'coach' | 'tactics'>('player')

  // Determine if user has coaching privileges
  const isCoach = user?.role === UserRole.COACH || user?.role === UserRole.MANAGER

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary rounded-xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">🎯 Espace Coaching</h1>
          <p className="text-primary-100">
            {isCoach
              ? 'Gérez vos joueurs et suivez leur progression'
              : 'Suivez vos exercices assignés et votre progression'}
          </p>
        </div>

        {/* Tabs for coaches */}
        {isCoach && (
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('player')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'player'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Ma Progression
            </button>
            <button
              onClick={() => setActiveTab('coach')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'coach'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Gestion Coaching
            </button>
            <button
              onClick={() => setActiveTab('tactics')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'tactics'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🎯 Tableau Tactique
            </button>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'player' && <PlayerDashboard />}
        {activeTab === 'coach' && <CoachDashboard />}
        {activeTab === 'tactics' && <TacticBoard />}
      </div>
    </MainLayout>
  )
}

export default CoachingPage
