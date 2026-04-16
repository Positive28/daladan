/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Readex Pro"', 'sans-serif'],
      },
      borderRadius: {
        ui: '4px',
      },
      colors: {
        // Light theme: soft greys + muted green accents (reference: marketplace screenshots)
        daladan: {
          primary: '#2f6d3f',
          accent: '#ffde82',
          accentMuted: '#caa74e',
          accentDark: '#907319',
          soft: '#ffffff',
          surface: '#ffffff',
          surfaceElevated: '#ffffff',
          border: '#e8e8e8',
          muted: '#707070',
          heading: '#3d3b4d',
          price: '#3d8b47',
          ink: '#1f2937',
        },
      },
    },
  },
  plugins: [],
}
