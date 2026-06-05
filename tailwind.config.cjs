/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './index.tsx',
    './App.tsx',
    './components/**/*.{js,ts,jsx,tsx}',
    './services/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
    './constants/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          50: '#f9f8f6',
          100: '#f2f0ec',
          200: '#e8e4de',
        },
        brand: {
          50: '#eef4f3',
          100: '#d6e4e2',
          200: '#b3ccc8',
          300: '#8fada8',
          400: '#759a95',
          500: '#6b8f8b',
          600: '#5a7c78',
          700: '#4a6663',
          800: '#3d5452',
          900: '#2f4240',
        },
      },
      boxShadow: {
        soft: '0 1px 3px rgba(45, 55, 72, 0.06), 0 4px 12px rgba(45, 55, 72, 0.04)',
        header: '0 1px 0 rgba(45, 55, 72, 0.06)',
      },
    },
  },
  plugins: [],
};
