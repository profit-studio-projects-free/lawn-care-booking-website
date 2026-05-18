/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      colors: {
        cream: {
          50: '#fbfaf6',
          100: '#f6f3eb',
          200: '#ece6d5',
        },
        sage: {
          50: '#f3f7f2',
          100: '#e5eee2',
          200: '#cbdcc4',
          300: '#a7c39d',
          400: '#7fa775',
          500: '#5e8c54',
          600: '#477040',
          700: '#395a35',
          800: '#2f4a2c',
          900: '#1a2e19',
        },
        forest: {
          50: '#f1f6f1',
          100: '#dfe9de',
          200: '#bcd1bb',
          300: '#8fb18d',
          400: '#5e8b5c',
          500: '#3f6d3e',
          600: '#2d5530',
          700: '#234526',
          800: '#1a3a1d',
          900: '#0f2611',
        },
        ink: {
          50: '#f6f6f5',
          100: '#e7e7e4',
          200: '#cdcdc8',
          300: '#a8a8a1',
          400: '#82827a',
          500: '#67675f',
          600: '#52524c',
          700: '#43433f',
          800: '#393936',
          900: '#1c1c1a',
        },
        lemon: {
          400: '#dde66d',
          500: '#c6d24f',
        },
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(15, 38, 17, 0.04), 0 4px 14px rgba(15, 38, 17, 0.06)',
        'card': '0 1px 2px rgba(15, 38, 17, 0.04), 0 12px 30px -8px rgba(15, 38, 17, 0.10)',
        'lift': '0 10px 40px -10px rgba(15, 38, 17, 0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'hero-grain': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'shimmer': 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
