/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        ui: '8px',
      },
      colors: {
        daladan: {
          primary: '#2f6d3f',
          accent: '#ffde82',
          accentMuted: '#caa74e',
          accentDark: '#907319',
          soft: '#f0fdf2',
          ink: '#1f2937',
        },
      },
    },
  },
  plugins: [],
}
