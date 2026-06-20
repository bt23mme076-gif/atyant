/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#0a0a0c', 2: '#141416', 3: '#1c1c20' },
        border: { DEFAULT: '#2c2c32', 2: '#3a3a42' },
        t: { 1: '#f2f2f4', 2: '#8e8e9a', 3: '#46464f' },
        signal: { DEFAULT: '#b6ff3c', dim: 'rgba(182,255,60,0.10)', bdr: 'rgba(182,255,60,0.28)' },
        background: 'hsl(var(--map-background))',
        foreground: 'hsl(var(--map-foreground))',
        muted: { DEFAULT: 'hsl(var(--map-muted))', foreground: 'hsl(var(--map-muted-foreground))' },
        popover: { DEFAULT: 'hsl(var(--map-popover))', foreground: 'hsl(var(--map-popover-foreground))' },
        accent: { DEFAULT: 'hsl(var(--map-accent))', foreground: 'hsl(var(--map-accent-foreground))' },
        ring: 'hsl(var(--map-ring))',
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['General Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        ticker: 'ticker 20s linear infinite',
        'pulse-dot': 'pulseDot 2.2s ease-in-out infinite',
        dot1: 'dotBounce 1.2s ease-in-out infinite',
        dot2: 'dotBounce 1.2s ease-in-out 0.2s infinite',
        dot3: 'dotBounce 1.2s ease-in-out 0.4s infinite',
      },
      keyframes: {
        ticker: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        pulseDot: { '0%, 100%': { opacity: '1', boxShadow: '0 0 8px #b6ff3c' }, '50%': { opacity: '0.4', boxShadow: 'none' } },
        dotBounce: { '0%, 80%, 100%': { transform: 'scale(0.5)', opacity: '0.3' }, '40%': { transform: 'scale(1)', opacity: '1' } }
      },
    }
  },
  plugins: [],
}
