import type { Config } from 'tailwindcss';
import { theming } from 'nativewind';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#2D2D2D',
        background: '#0A0A0A',
        surface: '#1A1A1A',
        text: '#FFFFFF',
        'text-muted': '#A0A0A0',
        success: '#4ADE80',
        error: '#EF4444',
        warning: '#FBBF24',
      },
      fontFamily: {
        sans: ['System', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;