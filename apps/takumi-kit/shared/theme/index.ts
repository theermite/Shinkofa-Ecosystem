/**
 * Ermite Toolbox - Unified Theme System
 * Single theme for all widgets
 * @author Jay "The Ermite" Goncalves
 * @copyright Jay The Ermite
 */

export interface ThemeColors {
  primary: string
  primaryHover: string
  accent: string
  accentHover: string
  background: string
  backgroundSecondary: string
  card: string
  cardHover: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
}

export interface Theme {
  name: string
  colors: ThemeColors
  borderRadius: string
  fontFamily: string
  shadows: string
}

/**
 * The Ermite Theme - Dark, mysterious, amber accents
 * Single unified theme for all widgets
 */
export const ermiteTheme: Theme = {
  name: 'ermite',
  colors: {
    primary: '#059669',      // emerald-600
    primaryHover: '#047857', // emerald-700
    accent: '#f59e0b',       // amber-500
    accentHover: '#d97706',  // amber-600
    background: '#020617',   // slate-950
    backgroundSecondary: '#0f172a', // slate-900
    card: '#1e293b',         // slate-800
    cardHover: '#334155',    // slate-700
    text: '#f3f4f6',         // gray-100
    textSecondary: '#9ca3af', // gray-400
    border: '#334155',       // slate-700
    success: '#10b981',      // emerald-500
    warning: '#f59e0b',      // amber-500
    error: '#f43f5e',        // rose-500
  },
  borderRadius: '0.75rem',   // rounded-xl equivalent
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  shadows: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
}

// CSS Variables generator for embedding
export function generateCSSVariables(theme: Theme = ermiteTheme): string {
  return `
    :host, .ermite-widget {
      --et-primary: ${theme.colors.primary};
      --et-primary-hover: ${theme.colors.primaryHover};
      --et-accent: ${theme.colors.accent};
      --et-accent-hover: ${theme.colors.accentHover};
      --et-bg: ${theme.colors.background};
      --et-bg-secondary: ${theme.colors.backgroundSecondary};
      --et-card: ${theme.colors.card};
      --et-card-hover: ${theme.colors.cardHover};
      --et-text: ${theme.colors.text};
      --et-text-secondary: ${theme.colors.textSecondary};
      --et-border: ${theme.colors.border};
      --et-success: ${theme.colors.success};
      --et-warning: ${theme.colors.warning};
      --et-error: ${theme.colors.error};
      --et-radius: ${theme.borderRadius};
      --et-font: ${theme.fontFamily};
      --et-shadow: ${theme.shadows};
    }
  `.trim()
}

export default ermiteTheme
