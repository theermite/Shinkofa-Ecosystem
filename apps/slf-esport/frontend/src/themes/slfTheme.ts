/**
 * SLF E-Sport Custom Theme for Brain Training Exercises
 *
 * This theme maps the brain-training package's theme interface to SLF's
 * Tailwind color palette, ensuring visual consistency across the platform.
 *
 * Colors reference from tailwind.config.js:
 * - Primary: #004225 (Vert principal La Salade de Fruits)
 * - Secondary: #FF9800 (Orange papaye)
 * - Accent: #FFD600 (Jaune mangue)
 * - Success: #3CB371 (Vert clair fruité)
 * - Danger: #E53935 (Rouge fraise)
 * - Info: #8E24AA (Violet myrtille)
 */

import type { Theme } from '@theermite/brain-training'

export const slfTheme: Theme = {
  variant: 'slf',

  colors: {
    // Primary colors - Vert SLF
    primary: 'bg-primary-900',                      // #004225 - Vert principal foncé
    primaryHover: 'hover:bg-primary-800',
    primaryLight: 'bg-primary-500',                 // #3CB371 - Vert clair
    primaryLightHover: 'hover:bg-primary-600',

    // Secondary/Accent colors - Orange & Jaune SLF
    accent: 'bg-secondary-500',                     // #FF9800 - Orange papaye
    accentHover: 'hover:bg-secondary-600',
    accentLight: 'bg-accent-500',                   // #FFD600 - Jaune mangue
    accentLightHover: 'hover:bg-accent-600',

    // Background colors
    background: 'bg-gray-900',                      // Fond sombre pour mode dark
    backgroundLight: 'bg-gray-50',                  // Fond clair pour mode light
    backgroundSecondary: 'bg-gray-800 dark:bg-gray-800',
    backgroundSecondaryLight: 'bg-gray-100 dark:bg-gray-800',

    // Card colors
    card: 'bg-white dark:bg-gray-800',
    cardHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
    cardBorder: 'border-gray-200 dark:border-gray-700',

    // Text colors
    text: 'text-gray-900 dark:text-white',
    textSecondary: 'text-gray-600 dark:text-gray-300',
    textMuted: 'text-gray-500 dark:text-gray-400',
    textOnPrimary: 'text-white',
    textOnAccent: 'text-gray-900',                  // Noir sur jaune pour contraste

    // Border colors
    border: 'border-gray-300 dark:border-gray-700',
    borderLight: 'border-gray-200 dark:border-gray-800',
    borderStrong: 'border-gray-400 dark:border-gray-600',

    // State colors - Palette SLF
    success: 'bg-success-500',                      // #3CB371 - Vert clair
    successHover: 'hover:bg-success-600',
    successText: 'text-success-700 dark:text-success-400',

    warning: 'bg-accent-500',                       // #FFD600 - Jaune mangue
    warningHover: 'hover:bg-accent-600',
    warningText: 'text-accent-700 dark:text-accent-400',

    error: 'bg-danger-500',                         // #E53935 - Rouge fraise
    errorHover: 'hover:bg-danger-600',
    errorText: 'text-danger-700 dark:text-danger-400',

    info: 'bg-info-600',                            // #8E24AA - Violet myrtille
    infoHover: 'hover:bg-info-700',
    infoText: 'text-info-700 dark:text-info-400',

    // Interactive elements
    interactive: 'bg-primary-600',
    interactiveHover: 'hover:bg-primary-700',
    interactiveActive: 'active:bg-primary-800',
    interactiveDisabled: 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50',

    // Focus states
    focusRing: 'focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',

    // Overlay colors
    overlay: 'bg-gray-900/50',
    overlayLight: 'bg-gray-900/30',
    overlayStrong: 'bg-gray-900/75',
  },

  // Border radius - Match SLF design
  borderRadius: {
    sm: 'rounded-lg',                               // 0.5rem
    md: 'rounded-xl',                               // 0.75rem
    lg: 'rounded-2xl',                              // 1rem
    xl: 'rounded-4xl',                              // 2rem
    full: 'rounded-full',
  },

  // Shadows - SLF custom shadows from tailwind.config
  shadows: {
    sm: 'shadow-soft',                              // Ombre douce
    md: 'shadow-medium',                            // Ombre moyenne
    lg: 'shadow-strong',                            // Ombre forte
    xl: 'shadow-strong',
    none: 'shadow-none',
  },

  // Typography - Oxanium font family
  fontFamily: 'font-sans',                          // Oxanium from tailwind.config

  // Font sizes
  fontSize: {
    xs: 'text-xs',                                  // 0.75rem
    sm: 'text-sm',                                  // 0.875rem
    base: 'text-base',                              // 1rem
    lg: 'text-lg',                                  // 1.125rem
    xl: 'text-xl',                                  // 1.25rem
    '2xl': 'text-2xl',                              // 1.5rem
    '3xl': 'text-3xl',                              // 1.875rem
    '4xl': 'text-4xl',                              // 2.25rem
  },

  // Spacing
  spacing: {
    xs: 'p-2',                                      // 0.5rem
    sm: 'p-3',                                      // 0.75rem
    md: 'p-4',                                      // 1rem
    lg: 'p-6',                                      // 1.5rem
    xl: 'p-8',                                      // 2rem
  },

  // Transitions
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-300',
    slow: 'transition-all duration-500',
  },

  // Animations - Use SLF custom animations
  animation: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up',
    slideDown: 'animate-slide-down',
    pulse: 'animate-pulse-slow',
  },
}

/**
 * Theme variant for high contrast mode (accessibility)
 */
export const slfThemeHighContrast: Theme = {
  ...slfTheme,
  variant: 'slf-high-contrast',

  colors: {
    ...slfTheme.colors,

    // Enhanced contrast for better accessibility
    primary: 'bg-primary-900',                      // Darker primary
    text: 'text-gray-950 dark:text-white',
    textSecondary: 'text-gray-700 dark:text-gray-200',
    border: 'border-gray-900 dark:border-gray-100',
  },
}

export default slfTheme
