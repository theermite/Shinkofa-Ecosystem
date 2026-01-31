/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette Shinkofa
        'shinkofa-blue-deep': '#192040',
        'shinkofa-blue-royal': '#0c2284',
        'shinkofa-blue-light': '#0bb1f9',
        'shinkofa-cream': '#eaeaeb',
        'shinkofa-emerald': '#008080',
        'shinkofa-mustard': '#d4a044',
        'shinkofa-bordeaux': '#800020',
        // Couleurs membres famille
        'jay': '#4285f4',
        'angelique': '#9c27b0',
        'gautier': '#4caf50',
        'family': '#ff9800',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
