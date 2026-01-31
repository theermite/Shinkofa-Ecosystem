/**
 * Coach Dashboard - Coach view for managing players
 * Shows player list, assign exercises, view progress
 */

import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import userService from '@/services/userService'
import exerciseService from '@/services/exerciseService'
import assignmentService from '@/services/assignmentService'
import { User, UserRole } from '@/types/user'
import { Exercise } from '@/types/exercise'
import { ExerciseAssignmentCreate } from '@/types/assignment'
import AssignExerciseModal from '@/components/coaching/AssignExerciseModal'

const CoachDashboard: FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all')
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  // Fetch all users (players)
  const { data: users = [], isLoading } = useQuery<User[]>(
    'allUsers',
    () => userService.getAllUsers()
  )

  // Fetch exercises for assignment
  const { data: exercises = [] } = useQuery<Exercise[]>(
    'exercises',
    () => exerciseService.getExercises()
  )

  // Filter players
  const players = users.filter((user) => {
    const roleMatch = selectedRole === 'all' || user.role === selectedRole
    const searchMatch =
      !searchTerm ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    return roleMatch && searchMatch
  })

  // Handle assign exercise
  const handleAssignClick = (player: User) => {
    setSelectedPlayer(player)
    setIsAssignModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Joueurs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {users.filter((u) => u.role === UserRole.PLAYER).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {users.filter((u) => u.is_active).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exercices</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {exercises.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎮</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Coaches</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {users.filter((u) => u.role === UserRole.COACH).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Players Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gestion des Joueurs
          </h2>
          <button
            onClick={() => navigate('/users')}
            className="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
          >
            Gestion avancée →
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher un joueur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Tous les rôles</option>
            <option value={UserRole.PLAYER}>Joueurs</option>
            <option value={UserRole.COACH}>Coaches</option>
            <option value={UserRole.MANAGER}>Managers</option>
          </select>
        </div>

        {/* Players Table */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              Aucun utilisateur trouvé
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Joueur
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Rôle
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Statut
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.map((player) => (
                  <tr
                    key={player.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {player.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {player.email}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                        {player.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          player.is_active
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {player.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAssignClick(player)}
                          className="text-primary hover:text-primary-dark dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                        >
                          Assigner exercice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/calendar')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow text-left border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
        >
          <div className="text-3xl mb-3">📅</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Planifier Session
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Créer une nouvelle session d'entraînement
          </p>
        </button>

        <button
          onClick={() => navigate('/reports')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow text-left border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
        >
          <div className="text-3xl mb-3">📊</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Rapports
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Générer des rapports de progression
          </p>
        </button>

        <button
          onClick={() => navigate('/exercises')}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft p-6 hover:shadow-lg transition-shadow text-left border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary"
        >
          <div className="text-3xl mb-3">🎮</div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Exercices
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gérer la bibliothèque d'exercices
          </p>
        </button>
      </div>

      {/* Assign Exercise Modal */}
      {selectedPlayer && (
        <AssignExerciseModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false)
            setSelectedPlayer(null)
          }}
          player={selectedPlayer}
          exercises={exercises}
        />
      )}
    </div>
  )
}

export default CoachDashboard
