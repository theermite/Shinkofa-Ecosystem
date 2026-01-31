/**
 * User types and enums
 */

export enum UserRole {
  JOUEUR = 'JOUEUR',
  COACH = 'COACH',
  MANAGER = 'MANAGER',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export interface User {
  id: number
  email: string
  username: string
  full_name?: string
  bio?: string
  avatar_url?: string
  role: UserRole
  is_super_admin: boolean
  is_active: boolean
  game_username?: string
  game_uid?: string
  preferred_role?: string
  secondary_role?: string
  skill_level?: string
  discord_username?: string
  discord_id?: string
  moral_contract_accepted: boolean
  moral_contract_accepted_at?: string
  created_at: string
  updated_at?: string
  is_verified?: boolean
}

export interface UserCreate {
  email: string
  username: string
  password: string
  full_name?: string
  bio?: string
  role?: UserRole
  game_username?: string
  game_uid?: string
  preferred_role?: string
  secondary_role?: string
  skill_level?: string
  discord_username?: string
  energy_type?: string
  peak_hours?: string
}

export interface UserUpdate {
  email?: string
  username?: string
  full_name?: string
  bio?: string
  avatar_url?: string
  game_username?: string
  game_uid?: string
  preferred_role?: string
  secondary_role?: string
  skill_level?: string
  discord_username?: string
  is_active?: boolean
  energy_type?: string
  peak_hours?: string
}

export interface PasswordChange {
  current_password: string
  new_password: string
}
