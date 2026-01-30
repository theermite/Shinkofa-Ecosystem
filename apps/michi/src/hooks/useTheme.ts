/**
 * useTheme Hook - Dark/Light mode management
 * Shinkofa Platform - Frontend
 */

'use client'

import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // Set mounted to true after hydration to avoid SSR mismatch
  useEffect(() => {
    setMounted(true)

    try {
      // Get theme from localStorage or system preference
      const stored = localStorage.getItem('theme') as Theme | null
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

      const initialTheme = stored || systemPreference
      setTheme(initialTheme)
      applyTheme(initialTheme)
    } catch (error) {
      // localStorage may be unavailable or corrupted - use system preference
      console.warn('Failed to read theme from localStorage:', error)
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      setTheme(systemPreference)
      applyTheme(systemPreference)
    }
  }, [])

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement

    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    try {
      localStorage.setItem('theme', newTheme)
    } catch (error) {
      // localStorage may be full or unavailable - ignore silently
      console.warn('Failed to save theme to localStorage:', error)
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  // Set specific theme
  const setSpecificTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  return {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    mounted, // To avoid hydration mismatch
  }
}
