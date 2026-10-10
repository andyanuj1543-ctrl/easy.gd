/** @type {import('tailwindcss').Config} */
export default {
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
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
          950: '#090d16',
        }
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8', boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)' },
          '50%': { transform: 'scale(1.05)', opacity: '1', boxShadow: '0 0 25px rgba(34, 197, 94, 0.8)' },
        },
        soundWave: {
          '0%, 100%': { height: '8px' },
          '50%': { height: '28px' },
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'sound-wave': 'soundWave 1.2s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
