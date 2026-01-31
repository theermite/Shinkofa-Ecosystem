/**
 * TypeScript Type Definitions
 * © 2025 La Voie Shinkofa
 */

import { Request } from 'express';

// ======================
// USER TYPES
// ======================

export type UserRole = 'admin' | 'contributor' | 'viewer';

export type DesignHumanType =
  | 'Projecteur'
  | 'Générateur'
  | 'Générateur-Manifesteur'
  | 'Manifesteur'
  | 'Réflecteur';

export type Authority =
  | 'Splénique'
  | 'Sacrale'
  | 'Émotionnelle'
  | 'Ego'
  | 'Environnement'
  | 'Lune'
  | 'Aucune';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: UserRole;
  avatar_color: string;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
  is_active: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  design_human_type: DesignHumanType;
  profile_line: string | null;
  authority: Authority | null;
  strategy: string | null;
  focus_hours_per_day: number;
  break_pattern: string;
  recovery_needs: string | null;
  special_needs: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// ======================
// EVENT TYPES
// ======================

export type EventCategory =
  | 'école'
  | 'anniversaire'
  | 'travail'
  | 'activité'
  | 'famille'
  | 'santé'
  | 'autre';

export type SyncStatus = 'synced' | 'pending' | 'error' | 'local_only';

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  start_time: Date;
  end_time: Date;
  category: EventCategory;
  color: string;
  is_recurring: boolean;
  recurrence_rule: string | null;
  google_calendar_id: string | null;
  sync_status: SyncStatus;
  sync_error: string | null;
  created_at: Date;
  updated_at: Date;
}

// ======================
// TASK TYPES
// ======================

export type TaskCategory =
  | 'cuisine'
  | 'ménage'
  | 'linge'
  | 'courses'
  | 'enfants'
  | 'autre';

export type TaskFrequency =
  | 'ponctuelle'
  | 'quotidienne'
  | 'hebdo'
  | 'mensuelle';

export type TaskStatus =
  | 'ouverte'
  | 'assignée'
  | 'en_cours'
  | 'complétée'
  | 'archivée';

export type TaskPriority = 'basse' | 'moyenne' | 'haute';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  assigned_to: string | null;
  frequency: TaskFrequency;
  due_date: Date | null;
  status: TaskStatus;
  priority: TaskPriority;
  points: number;
  completed_at: Date | null;
  completed_by: string | null;
  notes: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// ======================
// MEAL TYPES
// ======================

export type MealType = 'petit_déj' | 'déjeuner' | 'goûter' | 'dîner';

export interface Meal {
  id: string;
  date: Date;
  meal_type: MealType;
  dish_name: string | null;
  assigned_cook: string | null;
  notes: string | null;
  ingredients: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// ======================
// SHOPPING TYPES
// ======================

export type ShoppingStatus = 'planification' | 'finale' | 'courses_faites';

export type ShoppingLocation = 'Torre del Mar' | 'Vélez-Málaga' | 'autre';

export type ShoppingUnit = 'pièce' | 'kg' | 'g' | 'litre' | 'ml' | 'paquet' | 'autre';

export type ShoppingCategory =
  | 'fruits'
  | 'légumes'
  | 'protéines'
  | 'produits_laitiers'
  | 'basiques'
  | 'autre';

export type ShoppingPriority = 'optionnel' | 'souhaité' | 'essentiel';

export interface ShoppingList {
  id: string;
  week_start: Date;
  status: ShoppingStatus;
  location: ShoppingLocation;
  total_estimate: number | null;
  completed_by: string | null;
  completed_at: Date | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface ShoppingItem {
  id: string;
  shopping_list_id: string;
  name: string;
  quantity: string | null;
  unit: ShoppingUnit;
  category: ShoppingCategory;
  priority: ShoppingPriority;
  is_checked: boolean;
  price_estimate: number | null;
  added_by: string;
  created_at: Date;
  updated_at: Date;
}

// ======================
// BABY TRACKING TYPES
// ======================

export type Enfant = 'Evy' | 'Nami';

export type RepasType = 'biberon' | 'repas';

export type TailleAssiette = 'petite' | 'moyenne' | 'grande';

export type CoucheType = 'pipi' | 'caca' | 'mixte';

export interface RepasLog {
  id: string;
  date: Date;
  time: string;
  enfant: Enfant;
  type: RepasType;
  quantite_ml: number | null;
  taille_assiette: TailleAssiette | null;
  duration_minutes: number | null;
  notes: string | null;
  logged_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface CoucheLog {
  id: string;
  date: Date;
  time: string;
  enfant: Enfant;
  type: CoucheType;
  changed_by: string;
  notes: string | null;
  created_at: Date;
}

export type BienEtreEnfant = 'Lyam' | 'Théo' | 'Evy' | 'Nami';

export type BienEtreCategory =
  | 'santé'
  | 'sommeil'
  | 'comportement'
  | 'développement'
  | 'humeur'
  | 'allergie'
  | 'autre';

export interface BienEtreLog {
  id: string;
  date: Date;
  enfant: BienEtreEnfant;
  category: BienEtreCategory;
  observation: string;
  added_by: string;
  created_at: Date;
}

// ======================
// CRISIS TYPES
// ======================

export type CrisisPerson =
  | 'Jay'
  | 'Angélique'
  | 'Gautier'
  | 'Lyam'
  | 'Théo'
  | 'Evy'
  | 'Nami';

export type CrisisType =
  | 'frustration'
  | 'surcharge'
  | 'transition'
  | 'rejet'
  | 'colère'
  | 'peur'
  | 'autre';

export interface CrisisProtocol {
  id: string;
  person_name: CrisisPerson;
  design_human_type: string | null;
  crisis_type: CrisisType;
  trigger_recognition: string | null;
  immediate_response: string | null;
  escalation_step1: string | null;
  escalation_step2: string | null;
  escalation_step3: string | null;
  support_needs: string | null;
  tools_available: string | null;
  what_to_avoid: string | null;
  recovery: string | null;
  notes: string | null;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// ======================
// AUTH TYPES
// ======================

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

// ======================
// API RESPONSE TYPES
// ======================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ======================
// VALIDATION TYPES
// ======================

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
