/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/renderer/**/*.{vue,ts,js,html}',
  ],
  theme: {
  	extend: {
  		borderColor: {
  			brand: '#793E94'
  		},
  		colors: {
  			brand: {
  				'100': '#E5D9EF',
  				'200': '#D4C2E5',
  				'300': '#C0A9D8',
  				'400': '#A68AC9',
  				'500': '#793E94',
  				'600': '#64327F',
  				'700': '#50276A',
  				'800': '#3B1B50',
  				hover: '#F5EDF7'
  			},
  			tertiary: {
  				'100': '#FFFFFF',
  				'200': '#FAFAFA',
  				'300': '#F8F8F8',
  				'400': '#F7F7F7',
  				'500': '#F5F5F5',
  				'600': '#F2F2F2',
  				'700': '#EBEBEB',
  				'800': '#E0E0E0',
  				'900': '#CCCCCC'
  			},
  			quatenary: {
  				'100': '#F2F3F4',
  				'200': '#E6E7E9',
  				'300': '#D9DBDD',
  				'400': '#CDD0D2',
  				'500': '#717680',
  				'600': '#646872',
  				'700': '#585C65',
  				'800': '#4D5159',
  				'900': '#41454D'
  			},
  			'gray-blue': {
  				'100': '#FFFFFF',
  				'200': '#FCFDFF',
  				'300': '#FBFBFF',
  				'400': '#FAFBFF',
  				'500': '#F8F9FC',
  				'600': '#E7E8EB',
  				'700': '#D6D8DB',
  				'800': '#C5C7CB',
  				'900': '#B4B7BB'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

