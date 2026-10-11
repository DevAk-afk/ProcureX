/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50: '#F0FBF9',
          100: '#D2F5F0',
          200: '#A7EAE1',
          300: '#6FDCD0',
          400: '#38CAB9',
          500: '#16B5A5', // Primary teal
          600: '#119A8D', // Dark teal
          700: '#0E7E73',
          800: '#0B635B',
          900: '#094C46',
        },
        procure: {
          bg: '#F3F6F7',
          card: '#FFFFFF',
          border: '#E3E9EB',
          text: '#202B31',
          muted: '#718087',
          teal: '#16B5A5',
          darkTeal: '#119A8D',
          success: '#1C9B73',
          warning: '#E7A83E',
          danger: '#D9535D',
          info: '#5C9BA5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        cardHover: '0 4px 12px 0 rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'card': '14px',
      }
    },
  },
  plugins: [],
}
