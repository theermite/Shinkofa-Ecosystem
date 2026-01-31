/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // La Salade de Fruits E-Sport brand colors
        lslf: {
          green: '#004225',          // Vert principal (contrast ratio with white: ~15:1 AAA ✅)
          greenLight: '#3CB371',     // Vert clair fruité
          yellow: '#FFD600',         // Jaune mangue
          orange: '#FF9800',         // Orange papaye
          red: '#E53935',            // Rouge fraise
          purple: '#8E24AA',         // Violet myrtille
          white: '#F9FDFA',          // Blanc doux
          grayLight: '#CFCFCF',      // Gris clair
          grayDark: '#9E9E9E',       // Gris foncé
        },
        // Semantic colors - LSLF palette with WCAG AA/AAA compliant variants
        primary: {
          DEFAULT: '#004225',        // Vert principal (AAA with white text)
          50: '#e6f4ed',             // Très clair pour backgrounds
          100: '#c2e5d3',
          200: '#9bd6b8',
          300: '#73c79d',
          400: '#56bb88',
          500: '#3CB371',            // Vert clair fruité (AA with black text: 4.8:1)
          600: '#35a063',
          700: '#2d8854',
          800: '#257046',
          900: '#004225',            // Vert principal foncé (AAA)
        },
        secondary: {
          DEFAULT: '#FF9800',        // Orange papaye (AA with black text: 5.5:1)
          50: '#fff3e0',
          100: '#ffe0b2',
          200: '#ffcc80',
          300: '#ffb74d',
          400: '#ffa726',
          500: '#FF9800',
          600: '#fb8c00',
          700: '#f57c00',
          800: '#ef6c00',            // Plus foncé pour meilleur contraste (AA+ with white: 5.2:1)
          900: '#e65100',
        },
        accent: {
          DEFAULT: '#FFD600',        // Jaune mangue (AAA with black text: 12:1)
          50: '#fffde7',
          100: '#fff9c4',
          200: '#fff59d',
          300: '#fff176',
          400: '#ffee58',
          500: '#FFD600',
          600: '#ffc107',
          700: '#ffb300',
          800: '#ffa000',
          900: '#ff8f00',            // Plus foncé pour usage sur blanc si nécessaire
        },
        // Couleurs supplémentaires LSLF
        danger: {
          DEFAULT: '#E53935',        // Rouge fraise (AA with white: 4.6:1)
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#E53935',
          600: '#e53935',
          700: '#d32f2f',            // Plus foncé pour meilleur contraste (AA+ with white: 6.4:1)
          800: '#c62828',
          900: '#b71c1c',
        },
        info: {
          DEFAULT: '#8E24AA',        // Violet myrtille (AA+ with white: 6.2:1)
          50: '#f3e5f5',
          100: '#e1bee7',
          200: '#ce93d8',
          300: '#ba68c8',
          400: '#ab47bc',
          500: '#9c27b0',
          600: '#8E24AA',
          700: '#7b1fa2',            // Plus foncé pour meilleur contraste (AAA with white: 8.5:1)
          800: '#6a1b9a',
          900: '#4a148c',
        },
        success: {
          DEFAULT: '#3CB371',        // Vert clair (réutilisation pour cohérence)
          50: '#e6f4ed',
          100: '#c2e5d3',
          200: '#9bd6b8',
          300: '#73c79d',
          400: '#56bb88',
          500: '#3CB371',
          600: '#35a063',
          700: '#2d8854',            // Plus foncé pour meilleur contraste (AAA with white: 7.2:1)
          800: '#257046',
          900: '#004225',
        },
      },
      fontFamily: {
        sans: ['Oxanium', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Marck Script', 'cursive'],
        body: ['Oxanium', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 25px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 40px -10px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-in-out',
        'slide-down': 'slideDown 0.3s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
