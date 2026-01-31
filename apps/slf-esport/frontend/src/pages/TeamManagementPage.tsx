/**
 * Team Management Page - Manage players (Coach/Manager only)
 */

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Button, Input } from '@/components/ui'
import userService from '@/services/userService'
import authService from '@/services/authService'
import type { User, UserCreate } from '@/types/user'
import { UserRole } from '@/types/user'

export default function TeamManagementPage() {
  const [players, setPlayers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // New player form state
  const [newPlayer, setNewPlayer] = useState<UserCreate>({
    email: '',
    username: '',
    password: '',
    full_name: '',
    bio: '',
    role: UserRole.JOUEUR,
    game_username: '',
    game_uid: '',
    preferred_role: '',
    skill_level: 'Débutant',
  })

  // Player details modal
  const [selectedPlayerDetails, setSelectedPlayerDetails] = useState<User | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    loadCurrentUser()
    loadPlayers()
  }, [])

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser()
      setCurrentUser(user)

      // Check if user has permission
      if (user.role !== UserRole.COACH && user.role !== UserRole.MANAGER) {
        setMessage({
          type: 'error',
          text: 'Accès refusé. Cette page est réservée aux coachs et managers.',
        })
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadPlayers = async () => {
    try {
      setIsLoading(true)
      const data = await userService.getAllPlayers()
      setPlayers(data)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors du chargement des joueurs',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      await authService.register(newPlayer)
      setMessage({ type: 'success', text: `Joueur ${newPlayer.username} créé avec succès` })
      setShowAddModal(false)

      // Reset form
      setNewPlayer({
        email: '',
        username: '',
        password: '',
        full_name: '',
        bio: '',
        role: UserRole.JOUEUR,
        game_username: '',
        game_uid: '',
        preferred_role: '',
        skill_level: 'Débutant',
      })

      // Reload players
      await loadPlayers()
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors de la création du joueur',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleBadge = (role: string | undefined) => {
    if (!role) return null

    const badges: { [key: string]: string } = {
      'Roam/Support': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'ADC': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Jungle': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Clash Lane': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Mid Lane': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    }

    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badges[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    )
  }

  const getSkillBadge = (level: string | undefined) => {
    if (!level) return null

    const badges: { [key: string]: string } = {
      'Débutant': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      'Intermédiaire': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Avancé': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Expert': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    }

    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badges[level] || 'bg-gray-100 text-gray-800'}`}>
        {level}
      </span>
    )
  }

  // Check permissions
  if (currentUser && currentUser.role !== UserRole.COACH && currentUser.role !== UserRole.MANAGER) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Accès refusé</h2>
            <p className="text-red-600 dark:text-red-400">
              Cette page est réservée aux coachs et managers.
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const handlePlayerClick = (player: User) => {
    setSelectedPlayerDetails(player)
    setShowDetailsModal(true)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">👥 Gestion de l'Équipe</h1>
            <p className="text-primary-100">Gérez les joueurs de La Salade de Fruits</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowAddModal(true)}
            className="bg-white text-primary-600 hover:bg-primary-50"
          >
            ➕ Ajouter un joueur
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Players List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Joueurs actuels ({players.length})
          </h2>
        </div>

        {players.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Aucun joueur dans l'équipe
            </p>
            <Button variant="primary" onClick={() => setShowAddModal(true)}>
              Ajouter le premier joueur
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {players.map((player) => (
              <div
                key={player.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                onClick={() => handlePlayerClick(player)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    {player.avatar_url ? (
                      <img
                        src={player.avatar_url}
                        alt={player.username}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary-600"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-2xl">
                          {(player.full_name || player.username).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {player.full_name || player.username}
                        </h3>
                        {player.preferred_role && getRoleBadge(player.preferred_role)}
                        {player.skill_level && getSkillBadge(player.skill_level)}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        @{player.username}
                        {player.game_username && ` • Pseudo HOK: ${player.game_username}`}
                        {player.game_uid && ` • UID: ${player.game_uid}`}
                      </p>

                      {player.bio && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {player.bio}
                        </p>
                      )}

                      {player.discord_username && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Discord: {player.discord_username}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Membre depuis {new Date(player.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-gray-400 dark:text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Player Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="bg-primary-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold">➕ Ajouter un joueur</h2>
            </div>

            <form onSubmit={handleAddPlayer} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email"
                  type="email"
                  value={newPlayer.email}
                  onChange={(e) => setNewPlayer({ ...newPlayer, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                />

                <Input
                  label="Nom d'utilisateur"
                  type="text"
                  value={newPlayer.username}
                  onChange={(e) => setNewPlayer({ ...newPlayer, username: e.target.value })}
                  placeholder="PseudoJoueur"
                  required
                />
              </div>

              <Input
                label="Mot de passe temporaire"
                type="password"
                value={newPlayer.password}
                onChange={(e) => setNewPlayer({ ...newPlayer, password: e.target.value })}
                placeholder="Minimum 8 caractères, 1 chiffre, 1 majuscule"
                helperText="Le joueur pourra le changer depuis son profil"
                required
              />

              <Input
                label="Nom complet"
                type="text"
                value={newPlayer.full_name || ''}
                onChange={(e) => setNewPlayer({ ...newPlayer, full_name: e.target.value })}
                placeholder="Prénom Nom"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Pseudo HOK (Honor of Kings)"
                  type="text"
                  value={newPlayer.game_username || ''}
                  onChange={(e) => setNewPlayer({ ...newPlayer, game_username: e.target.value })}
                  placeholder="PseudoHOK"
                />

                <Input
                  label="UID HOK (Player ID)"
                  type="text"
                  value={newPlayer.game_uid || ''}
                  onChange={(e) => setNewPlayer({ ...newPlayer, game_uid: e.target.value })}
                  placeholder="123456789"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rôle préféré
                  </label>
                  <select
                    value={newPlayer.preferred_role || ''}
                    onChange={(e) => setNewPlayer({ ...newPlayer, preferred_role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Roam/Support">Roam/Support</option>
                    <option value="ADC">ADC</option>
                    <option value="Jungle">Jungle</option>
                    <option value="Clash Lane">Clash Lane</option>
                    <option value="Mid Lane">Mid Lane</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Niveau
                  </label>
                  <select
                    value={newPlayer.skill_level || 'Débutant'}
                    onChange={(e) => setNewPlayer({ ...newPlayer, skill_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={newPlayer.bio || ''}
                  onChange={(e) => setNewPlayer({ ...newPlayer, bio: e.target.value })}
                  placeholder="Courte présentation du joueur..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  fullWidth
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting} fullWidth>
                  Créer le joueur
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Player Details Modal */}
      {showDetailsModal && selectedPlayerDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedPlayerDetails.avatar_url ? (
                    <img
                      src={selectedPlayerDetails.avatar_url}
                      alt={selectedPlayerDetails.username}
                      className="w-16 h-16 rounded-full border-4 border-white/30 object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {(selectedPlayerDetails.full_name || selectedPlayerDetails.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedPlayerDetails.full_name || selectedPlayerDetails.username}</h2>
                    <p className="text-primary-100">@{selectedPlayerDetails.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  📧 Informations de contact
                </h3>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Email:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{selectedPlayerDetails.email}</span>
                  </div>
                  {selectedPlayerDetails.discord_username && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Discord:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{selectedPlayerDetails.discord_username}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Gaming Profile */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🎮 Profil Gaming
                </h3>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  {selectedPlayerDetails.game_username && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Pseudo HOK:</span>
                      <span className="text-gray-900 dark:text-white font-medium">{selectedPlayerDetails.game_username}</span>
                    </div>
                  )}
                  {selectedPlayerDetails.game_uid && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">UID HOK:</span>
                      <span className="text-gray-900 dark:text-white font-mono font-medium">{selectedPlayerDetails.game_uid}</span>
                    </div>
                  )}
                  {selectedPlayerDetails.preferred_role && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Rôle en jeu:</span>
                      {getRoleBadge(selectedPlayerDetails.preferred_role)}
                    </div>
                  )}
                  {selectedPlayerDetails.skill_level && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Niveau:</span>
                      {getSkillBadge(selectedPlayerDetails.skill_level)}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {selectedPlayerDetails.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    💬 Biographie
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-700 dark:text-gray-300">{selectedPlayerDetails.bio}</p>
                  </div>
                </div>
              )}

              {/* System Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  ⚙️ Informations système
                </h3>
                <div className="space-y-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rôle plateforme:</span>
                    <span className="text-gray-900 dark:text-white font-medium">Joueur</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Membre depuis:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {new Date(selectedPlayerDetails.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Statut:</span>
                    <span className={`font-medium ${selectedPlayerDetails.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedPlayerDetails.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailsModal(false)}
                  fullWidth
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </MainLayout>
  )
}
