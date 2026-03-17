/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        daladan: {
          primary: '#2f6d3f',
          accent: '#f59e0b',
          soft: '#f4f8f4',
          ink: '#1f2937',
        },
      },
    },
  },
  plugins: [],
}

