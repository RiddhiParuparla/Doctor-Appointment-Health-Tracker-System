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
        primary: '#4F46E5', // Indigo
        secondary: '#10B981', // Emerald
        'soft-bg': '#F9FAFB',
        dark: '#0F172A',
        'health-green': '#22C55E',
        'health-yellow': '#F59E0B',
        'health-red': '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
