/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        muted: 'var(--color-muted)',
        bronze: 'var(--color-bronze)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
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
