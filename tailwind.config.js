/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C2430', muted: '#5B6573', line: '#E4E1DA', bg: '#F7F6F2',
        card: '#FFFFFF', brand: '#1F6F78', 'brand-soft': '#E3F0F1',
        cocok: '#2E7D4F', kurang: '#C9741F', 'kurang-soft': '#F6E7D5',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
