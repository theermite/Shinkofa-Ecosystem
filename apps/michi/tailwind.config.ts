import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // Widgets from toolbox-theermite submodule
    '../toolbox-theermite/widgets/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      colors: {
        // Shinkofa brand colors - Charte Graphique V2.0
        shinkofa: {
          marine: '#1c3049', // Bleu Marine - Fond principal, confiance
          orange: '#e08f34', // Orange Chaleur - Accents, CTA
          yellow: '#f5cd3e', // Jaune Clarté - Highlights uniquement (JAMAIS texte)
          white: '#FFFFFF',  // Blanc Respiration
          'dark-bg': '#0d1420', // Mode sombre - Bleu marine très foncé
        },
        // Ermite Toolbox colors (for widgets)
        ermite: {
          primary: '#3dc3ff',
          'primary-hover': '#5fcfff',
          'primary-dark': '#0c2284',
          bg: '#192040',
          'bg-secondary': '#0f1629',
          card: '#1e2a4a',
          'card-hover': '#2a3a5e',
          text: '#ebebeb',
          'text-secondary': '#b8c0cc',
          border: '#2a3a5e',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#fb7185',
        },
        // Alias pour compatibilité
        primary: {
          DEFAULT: '#1c3049',
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d1dae5',
          300: '#a8bbcf',
          400: '#7894b4',
          500: '#57749c',
          600: '#445c81',
          700: '#384a6a',
          800: '#1c3049', // Bleu Marine principal
          900: '#152639',
        },
        secondary: {
          DEFAULT: '#e08f34',
          50: '#fef9f3',
          100: '#fcf2e6',
          200: '#f9e3c6',
          300: '#f4ce9c',
          400: '#edb165',
          500: '#e08f34', // Orange principal
          600: '#d17622',
          700: '#ae5f1c',
          800: '#8c4d1d',
          900: '#73411b',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

export default config
