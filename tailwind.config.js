/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./**/*.html",
    "./js/*.js"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6D9F71',
        'primary-light': '#8FBC8F',
        'primary-dark': '#4A7C59',
        secondary: '#FFB6C1',
        accent: '#FFD166',
        success: '#10b981',
        warning: '#f59e0b',
        info: '#3b82f6',
        error: '#ef4444',
        happy: '#FFEAA7',
        calm: '#A7E6FF',
        sad: '#D8C3FF',
        anxious: '#FFB8B8',
        energetic: '#C5FFB8',
        neutral: '#F0F0F0',
      },
      fontFamily: {
        'sans': ['Anuphan', 'Noto Sans Thai', 'sans-serif'],
      },
      animation: {
        'breathe-in': 'breatheIn 4s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'breathe-hold': 'breatheHold 7s ease-in-out infinite',
        'breathe-out': 'breatheOut 8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'notification-slide': 'notificationSlide 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        breatheIn: {
          '0%': {
            transform: 'scale(0.95)',
            opacity: '0.9'
          },
          '50%': {
            transform: 'scale(1.05)',
            opacity: '1'
          },
          '100%': {
            transform: 'scale(0.95)',
            opacity: '0.9'
          }
        },
        breatheHold: {
          '0%, 100%': {
            transform: 'scale(1.03)',
            filter: 'brightness(1.05)'
          },
          '50%': {
            transform: 'scale(1)',
            filter: 'brightness(0.95)'
          }
        },
        breatheOut: {
          '0%': {
            transform: 'scale(1.05)',
            opacity: '1'
          },
          '100%': {
            transform: 'scale(0.95)',
            opacity: '0.9'
          }
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(5, 148, 103, 0.2)'
          },
          '50%': {
            boxShadow: '0 0 30px rgba(5, 148, 103, 0.3)'
          }
        },
        notificationSlide: {
          '0%': {
            transform: 'translateX(100%) scale(0.8)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateX(0) scale(1)',
            opacity: '1'
          }
        },
        slideDown: {
          '0%': {
            transform: 'translateY(-8px)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1'
          }
        }
      }
    }
  },
  plugins: []
}
