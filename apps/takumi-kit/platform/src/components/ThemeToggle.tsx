/**
 * Theme Toggle - Dark/Light mode switch
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md'
}

export default function ThemeToggle({ className, size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  const buttonSize = size === 'sm' ? 'p-2' : 'p-3'

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        buttonSize,
        'rounded-lg transition-colors touch-manipulation',
        'bg-ermite-card dark:bg-ermite-card light:bg-gray-100',
        'hover:bg-ermite-card-hover dark:hover:bg-ermite-card-hover light:hover:bg-gray-200',
        'text-ermite-text-secondary dark:text-ermite-text-secondary light:text-gray-700',
        'hover:text-ermite-primary',
        'border border-ermite-border dark:border-ermite-border light:border-gray-300',
        className
      )}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {isDark ? (
        <Sun className={iconSize} />
      ) : (
        <Moon className={iconSize} />
      )}
    </button>
  )
}
