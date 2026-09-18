/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        pine: {
          DEFAULT: '#2B3A32',
          dark: '#1C2620',
          light: '#3F5346',
        },
        gold: {
          DEFAULT: '#C9A227',
          light: '#E4C555',
          dark: '#9C7D1B',
        },
        paper: {
          DEFAULT: '#F3EFE4',
          dark: '#E7E0CE',
        },
        ink: '#1F2620',
        vendido: {
          DEFAULT: '#B5482E',
          light: '#D9694A',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
