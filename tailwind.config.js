/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // LifeOS brand palette — Sleek, clean, professional Slate/Blue
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // primary steel blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          yellow: '#eab308',
          green:  '#10b981',
          red:    '#ef4444',
          purple: '#6366f1',
          orange: '#f97316',
        },
        surface: {
          DEFAULT: '#09090b',  // Zinc 950
          card:    '#18181b',  // Zinc 900
          elevated:'#27272a',  // Zinc 800
          border:  '#2e2e33',  // Custom zinc border
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-down':  'slideDown 0.3s ease-out',
        'scale-in':    'scaleIn 0.3s ease-out',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'shimmer':     'shimmer 1.5s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
        'agent-ping':  'agentPing 1.5s ease-out infinite',
        'fade-slide-in': 'fadeSlideIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59,130,246,0.15)' },
          '50%':      { boxShadow: '0 0 35px rgba(59,130,246,0.4)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        agentPing: {
          '0%':   { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        fadeSlideIn: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
        'gradient-surface': 'linear-gradient(180deg, #18181b 0%, #09090b 100%)',
        'gradient-card':    'linear-gradient(135deg, #27272a 0%, #18181b 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.1) 50%, transparent 100%)',
      },
      backdropBlur: { xs: '2px' },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'brand':  '0 0 30px rgba(59,130,246,0.15)',
        'card':   '0 4px 24px rgba(0,0,0,0.5)',
        'glow-green':  '0 0 20px rgba(16,185,129,0.2)',
        'glow-yellow': '0 0 20px rgba(234,179,8,0.2)',
        'glow-red':    '0 0 20px rgba(239,68,68,0.2)',
      },
    },
  },
  plugins: [],
};
