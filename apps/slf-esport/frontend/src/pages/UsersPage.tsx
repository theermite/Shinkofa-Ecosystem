/**
 * Users Management Page - Super Admin only
 */

import { useState, useEffect } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardBody, Button, Badge } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import userService from '@/services/userService'
import type { User } from '@/types/user'
import { UserRole } from '@/types/user'
import UserEditModal from '@/components/admin/UserEditModal'

export default function UsersPage() {
  const { user: currentUser } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Check if user has permission (super admins and managers)
  const hasAccess = currentUser?.is_super_admin || currentUser?.role === UserRole.MANAGER

  if (!hasAccess) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-12">
          <Card>
            <CardBody>
              <div className="text-center">
                <span className="text-6xl mb-4">⚠️</span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Accès refusé
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Cette page est réservée aux managers et super admins.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </MainLayout>
    )
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchQuery, roleFilter, users])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const allUsers = await userService.getAllUsers()
      setUsers(allUsers)
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors du chargement des utilisateurs',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    // Filter by search query (name, username, email)
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        u =>
          u.full_name?.toLowerCase().includes(query) ||
          u.username.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      )
    }

    setFilteredUsers(filtered)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleUserUpdated = () => {
    setMessage({ type: 'success', text: 'Utilisateur mis à jour avec succès' })
    loadUsers()
    setIsEditModalOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      await userService.deleteUser(userId)
      setMessage({ type: 'success', text: 'Utilisateur supprimé avec succès' })
      loadUsers()
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erreur lors de la suppression',
      })
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return 'danger'
      case UserRole.COACH:
        return 'warning'
      case UserRole.JOUEUR:
        return 'primary'
      case UserRole.SUPER_ADMIN:
        return 'info'
      default:
        return 'primary'
    }
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.MANAGER:
        return 'Manager'
      case UserRole.COACH:
        return 'Coach'
      case UserRole.JOUEUR:
        return 'Joueur'
      case UserRole.SUPER_ADMIN:
        return 'Super Admin'
      default:
        return role
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">👥 Gestion des Utilisateurs</h1>
          <p className="text-purple-100">
            {currentUser?.is_super_admin
              ? 'Consulter et modifier les profils de tous les utilisateurs de la plateforme'
              : 'Consulter et modifier les profils des joueurs de votre équipe'}
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="text-2xl hover:opacity-70">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rechercher
                </label>
                <input
                  type="text"
                  placeholder="Nom, username ou email..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filtrer par rôle
                </label>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="JOUEUR">Joueurs</option>
                  <option value="COACH">Coachs</option>
                  <option value="MANAGER">Managers</option>
                  <option value="SUPER_ADMIN">Super Admins</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{users.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {users.filter(u => u.role === UserRole.JOUEUR).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Joueurs</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {users.filter(u => u.role === UserRole.COACH).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Coachs</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.role === UserRole.MANAGER).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Managers</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.is_super_admin).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Super Admins</div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader
            title={`Utilisateurs (${filteredUsers.length})`}
            subtitle="Cliquez sur un utilisateur pour modifier son profil"
          />
          <CardBody>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
                <p className="text-gray-600 dark:text-gray-400 mt-4">Chargement...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map(user => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => handleEditUser(user)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {user.avatar_url ? (
                              <img
                                src={user.avatar_url}
                                alt={user.username}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                                <span className="text-white font-semibold">
                                  {(user.full_name || user.username).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {user.full_name || user.username}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{user.email}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                            {user.is_super_admin && (
                              <Badge variant="info" size="sm">
                                👑 Super Admin
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            {user.is_active ? (
                              <Badge variant="success" size="sm">
                                Actif
                              </Badge>
                            ) : (
                              <Badge variant="danger" size="sm">
                                Inactif
                              </Badge>
                            )}
                            {user.is_verified && (
                              <Badge variant="info" size="sm">
                                Vérifié
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation()
                                handleEditUser(user)
                              }}
                            >
                              Modifier
                            </Button>
                            {user.id !== currentUser.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={e => {
                                  e.stopPropagation()
                                  handleDeleteUser(user.id)
                                }}
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                Supprimer
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Edit Modal */}
      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedUser(null)
          }}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </MainLayout>
  )
}
