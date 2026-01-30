/**
 * Utility functions
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export const widgetCategories: Record<string, { label: string; color: string }> = {
  memory: { label: 'Memory', color: 'text-purple-400' },
  focus: { label: 'Focus', color: 'text-blue-400' },
  reaction: { label: 'Reaction', color: 'text-yellow-400' },
  moba: { label: 'MOBA Training', color: 'text-red-400' },
  productivity: { label: 'Productivity', color: 'text-emerald-400' },
  wellness: { label: 'Wellness', color: 'text-pink-400' },
  misc: { label: 'Miscellaneous', color: 'text-gray-400' },
}

export const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  development: 'bg-yellow-500/20 text-yellow-400',
  testing: 'bg-blue-500/20 text-blue-400',
  production: 'bg-green-500/20 text-green-400',
  deprecated: 'bg-red-500/20 text-red-400',
}

export const priorityColors = {
  low: 'bg-gray-500/20 text-gray-400',
  medium: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
} as const

export const featureStatusColors = {
  idea: 'bg-purple-500/20 text-purple-400',
  planned: 'bg-blue-500/20 text-blue-400',
  in_progress: 'bg-yellow-500/20 text-yellow-400',
  done: 'bg-green-500/20 text-green-400',
} as const
