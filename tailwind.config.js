/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/**/*.{vue,ts,js,html}',
  ],
  theme: {
    extend: {
      borderColor: {
        'brand': '#793E94',
      },
      colors: {
        brand: {
          100: '#E5D9EF', // Shifted from old 200
          200: '#D4C2E5', // Shifted from old 300
          300: '#C0A9D8', // Shifted from old 400
          400: '#A68AC9', // Shifted from old 500
          500: '#793E94', // New 500 (was old 600)
          600: '#64327F', // Shifted from old 700
          700: '#50276A', // Shifted from old 800
          800: '#3B1B50', // Shifted from old 900
          'hover': '#F5EDF7', // Keep the hover color as is
        },
        tertiary: {
          100: '#FFFFFF',
          200: '#FAFAFA',
          300: '#F8F8F8',
          400: '#F7F7F7',
          500: '#F5F5F5',
          600: '#F2F2F2',
          700: '#EBEBEB',
          800: '#E0E0E0',
          900: '#CCCCCC',
        },
        quatenary: {
          100: '#F2F3F4',
          200: '#E6E7E9',
          300: '#D9DBDD',
          400: '#CDD0D2',
          500: '#717680',
          600: '#646872',
          700: '#585C65',
          800: '#4D5159',
          900: '#41454D',
        },
        'gray-blue': {
          100: '#FFFFFF',
          200: '#FCFDFF',
          300: '#FBFBFF',
          400: '#FAFBFF',
          500: '#F8F9FC',
          600: '#E7E8EB',
          700: '#D6D8DB',
          800: '#C5C7CB',
          900: '#B4B7BB',
        },
      },
    },
  },
  plugins: [],
}

