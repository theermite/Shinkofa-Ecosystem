/**
 * User service - Profile management and password change
 */

import api from './api'
import type { User, UserUpdate, PasswordChange } from '@/types/user'

class UserService {
  /**
   * Get current user profile
   */
  async getMyProfile(): Promise<User> {
    const response = await api.get<User>('/users/me')
    return response.data
  }

  /**
   * Update current user profile
   */
  async updateMyProfile(userData: UserUpdate): Promise<User> {
    const response = await api.put<User>('/users/me', userData)

    // Update stored user in localStorage
    localStorage.setItem('user', JSON.stringify(response.data))

    return response.data
  }

  /**
   * Change password
   */
  async changePassword(passwordData: PasswordChange): Promise<void> {
    await api.post('/users/me/change-password', passwordData)
  }

  /**
   * Get all users (Coach/Manager only)
   */
  async getAllUsers(skip = 0, limit = 100, role?: string): Promise<User[]> {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    if (role) params.append('role', role)

    const response = await api.get<User[]>(`/users/?${params.toString()}`)
    return response.data
  }

  /**
   * Get user by ID (Coach/Manager only)
   */
  async getUserById(userId: number): Promise<User> {
    const response = await api.get<User>(`/users/${userId}`)
    return response.data
  }

  /**
   * Get all players (Coach/Manager only)
   */
  async getAllPlayers(skip = 0, limit = 100): Promise<User[]> {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() })
    const response = await api.get<User[]>(`/users/joueurs/?${params.toString()}`)
    return response.data
  }

  /**
   * Update user profile (Manager/Super Admin only)
   */
  async updateUser(userId: number, userData: UserUpdate): Promise<User> {
    const response = await api.put<User>(`/users/${userId}`, userData)
    return response.data
  }

  /**
   * Delete user (Manager/Super Admin only)
   */
  async deleteUser(userId: number, permanent: boolean = false): Promise<void> {
    await api.delete(`/users/${userId}`, {
      params: { permanent }
    })
  }

  /**
   * Change user role and status (Super Admin only)
   */
  async changeUserRole(userId: number, newRole: string, isSuperAdmin: boolean, isActive?: boolean): Promise<User> {
    const payload: any = {
      new_role: newRole,
      is_super_admin: isSuperAdmin
    }

    if (isActive !== undefined) {
      payload.is_active = isActive
    }

    const response = await api.patch<User>(`/users/${userId}/role`, payload)
    return response.data
  }

  /**
   * Reset user password (Super Admin only)
   */
  async resetUserPassword(userId: number, newPassword: string): Promise<void> {
    await api.post(`/users/${userId}/reset-password`, {
      new_password: newPassword
    })
  }
}

export default new UserService()
