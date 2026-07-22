/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0B0B',
        card: '#171717',
        border: '#292929',
        primary: '#FFFFFF',
        secondary: '#A1A1AA',
        muted: '#71717A',
        bronze: '#9A6B32',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      borderRadius: {
        card: '12px',
        button: '10px',
        input: '10px',
      },
      fontFamily: {
        sans: ['Geist', 'IBM Plex Sans', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
