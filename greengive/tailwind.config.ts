import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#c9a84c',
          light: '#f0d080',
          dark: '#9a7a2e',
        },
        teal: {
          brand: '#00c9a7',
          dark: '#008f77',
        },
        ink: {
          DEFAULT: '#06060e',
          2: '#0f0f1a',
          3: '#1a1a2e',
        },
      },
      animation: {
        'drift': 'drift 8s ease-in-out infinite alternate',
        'pulse-dot': 'pulseDot 2s infinite',
        'fade-up': 'fadeUp 0.6s ease both',
        'ball-reveal': 'ballReveal 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        drift: {
          from: { transform: 'translate(0,0) scale(1)' },
          to: { transform: 'translate(30px,20px) scale(1.1)' },
        },
        pulseDot: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.4)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        ballReveal: {
          from: { opacity: '0', transform: 'scale(0.5) translateY(-20px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
export default config