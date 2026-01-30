/**
 * Tailwind CSS configuration for Shinkofa ecosystem
 * Design tokens Shinkofa (couleurs, spacing, etc.)
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        // Couleurs Shinkofa
        'bleu-profond': '#1e3a5f',
        'bleu-fonce': '#2c3e50',
        'beige-sable': '#f5f1e8',
        'blanc-pur': '#ffffff',
        'accent-lumineux': '#4a90e2',
        'accent-doux': '#7fb3d5',
        'dore-principal': '#d4af37',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'Georgia', 'serif'],
      },
      boxShadow: {
        'shinkofa': '0 4px 6px -1px rgba(30, 58, 95, 0.1), 0 2px 4px -1px rgba(30, 58, 95, 0.06)',
        'shinkofa-lg': '0 10px 15px -3px rgba(30, 58, 95, 0.1), 0 4px 6px -2px rgba(30, 58, 95, 0.05)',
      },
    },
  },
  plugins: [],
};
