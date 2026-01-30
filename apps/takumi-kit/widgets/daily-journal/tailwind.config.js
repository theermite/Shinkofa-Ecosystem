/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
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
      },
    },
  },
  plugins: [],
}
