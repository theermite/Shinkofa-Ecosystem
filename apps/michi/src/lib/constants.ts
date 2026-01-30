/**
 * Constants - Shinkofa Platform
 */

// ==================
// API CONFIGURATION
// ==================

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://localhost:8001'

export const API_TIMEOUT = 300000 // 300 seconds (5 minutes) - for long analysis

// ==================
// PRIORITY LEVELS
// ==================

export const PRIORITY_LABELS: Record<string, string> = {
  p0: 'Critical',
  p1: 'High',
  p2: 'Medium-High',
  p3: 'Normal',
  p4: 'Low',
  p5: 'Lowest',
}

export const PRIORITY_COLORS: Record<string, string> = {
  p0: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  p1: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  p2: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  p3: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  p4: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  p5: 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

// ==================
// DIFFICULTY LEVELS
// ==================

export const DIFFICULTY_LABELS: Record<string, string> = {
  quick: '< 30 min',
  medium: '30 min - 2h',
  complex: '2h - 1 day',
  long: '> 1 day',
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  quick: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  complex: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  long: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
}

// ==================
// PROJECT STATUS
// ==================

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
}

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
}

// ==================
// RITUAL CATEGORIES
// ==================

export const RITUAL_CATEGORY_LABELS: Record<string, string> = {
  morning: 'Morning',
  evening: 'Evening',
  daily: 'Daily',
  custom: 'Custom',
}

export const RITUAL_CATEGORY_COLORS: Record<string, string> = {
  morning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  evening: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  daily: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  custom: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

// ==================
// ENERGY LEVELS
// ==================

export const ENERGY_LABELS: Record<number, string> = {
  0: 'Exhausted',
  1: 'Very Low',
  2: 'Low',
  3: 'Below Average',
  4: 'Slightly Low',
  5: 'Normal',
  6: 'Slightly High',
  7: 'Good',
  8: 'Very Good',
  9: 'Excellent',
  10: 'Peak Performance',
}

export const ENERGY_COLORS: Record<number, string> = {
  0: 'bg-red-500',
  1: 'bg-red-400',
  2: 'bg-orange-500',
  3: 'bg-orange-400',
  4: 'bg-yellow-500',
  5: 'bg-yellow-300',
  6: 'bg-lime-400',
  7: 'bg-green-400',
  8: 'bg-green-500',
  9: 'bg-emerald-500',
  10: 'bg-emerald-600',
}

// ==================
// THEME
// ==================

export const SHINKOFA_GRADIENT =
  'bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900 dark:to-blue-900'

export const SHINKOFA_COLORS = {
  primary: {
    green: '#10b981', // emerald-500
    blue: '#3b82f6', // blue-500
    purple: '#8b5cf6', // violet-500
  },
  light: {
    bg: '#f9fafb', // gray-50
    text: '#111827', // gray-900
  },
  dark: {
    bg: '#111827', // gray-900
    bgElevated: '#1f2937', // gray-800
    text: '#f9fafb', // gray-50
  },
}
