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
        background: 'var(--bg-color)', 
        surface: 'var(--surface-color)',     
        border: 'var(--border-color)',
        primary: {
          DEFAULT: '#3b82f6', // Bright blue
          hover: '#2563eb',
        },
        accent: {
          DEFAULT: '#10b981', // Emerald green
          warning: '#f59e0b', // Amber yellow
          danger: '#ef4444',  // Red
        },
        slate: {
          950: '#030712',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
          400: '#94a3b8',
          300: '#cbd5e1',
          200: '#e2e8f0',
          100: '#f1f5f9',
          50: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(59, 130, 246, 0.3)',
        'glow-accent': '0 0 15px rgba(16, 185, 129, 0.3)',
      }
    },
  },
  plugins: [],
}
