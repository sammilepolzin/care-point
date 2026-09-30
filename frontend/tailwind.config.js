/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#2fa866', // মূল ব্র্যান্ড কালার
          600: '#268f56',
          700: '#1f7345',
          800: '#1a5c38',
          900: '#154b2e',
          950: '#0a2a19',
        },
        primary: {
          DEFAULT: '#2fa866',
          hover: '#268f56',
          dark: '#1f7345',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}