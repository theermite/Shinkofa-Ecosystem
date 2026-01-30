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
        // Couleurs Shinkofa
        'bleu-profond': '#1c3049',
        'accent-lumineux': '#e08f34',
        'dore-principal': '#f5cd3e',
        'blanc-pur': '#FFFFFF',
        'beige-sable': '#f8f6f0',
        'accent-doux': '#f2b366',
        'bleu-fonce': '#0f1c2e',
      },
      fontFamily: {
        sans: ['Atkinson Hyperlegible', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'shinkofa-sm': '8px',
        'shinkofa-md': '12px',
        'shinkofa-lg': '20px',
        'shinkofa-full': '50px',
      },
      boxShadow: {
        'shinkofa-sm': '0 2px 8px rgba(28, 48, 73, 0.1)',
        'shinkofa-md': '0 8px 24px rgba(28, 48, 73, 0.15)',
        'shinkofa-lg': '0 16px 40px rgba(28, 48, 73, 0.2)',
      },
    },
  },
  plugins: [],
}
