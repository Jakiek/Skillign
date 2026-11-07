/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)', muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)', bg: 'rgb(var(--bg) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)', brand: 'rgb(var(--brand) / <alpha-value>)',
        'brand-soft': 'rgb(var(--brand-soft) / <alpha-value>)', cocok: 'rgb(var(--cocok) / <alpha-value>)',
        kurang: '#C9741F', warning: 'rgb(var(--warning) / <alpha-value>)',
        'kurang-soft': 'rgb(var(--kurang-soft) / <alpha-value>)',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'], display: ['Libre Baskerville', 'Georgia', 'serif'] },
    },
  },
  plugins: [],
};
