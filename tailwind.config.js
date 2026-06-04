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
        // LifeOS brand palette — dark, vibrant, premium
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6ff',
          300: '#a4b8ff',
          400: '#7c8eff',
          500: '#5a63f5',  // primary
          600: '#4445e8',
          700: '#3533cc',
          800: '#2c2aa6',
          900: '#292983',
        },
        accent: {
          yellow: '#f5c842',
          green:  '#22d98a',
          red:    '#ff4d6d',
          purple: '#bf5af2',
          orange: '#ff9f0a',
        },
        surface: {
          DEFAULT: '#0d0d14',
          card:    '#13131f',
          elevated:'#1a1a2e',
          border:  '#2a2a40',
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
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(90,99,245,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(90,99,245,0.7)' },
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
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #5a63f5 0%, #bf5af2 100%)',
        'gradient-surface': 'linear-gradient(180deg, #13131f 0%, #0d0d14 100%)',
        'gradient-card':    'linear-gradient(135deg, #1a1a2e 0%, #13131f 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(90,99,245,0.15) 50%, transparent 100%)',
      },
      backdropBlur: { xs: '2px' },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'brand':  '0 0 30px rgba(90,99,245,0.25)',
        'card':   '0 4px 24px rgba(0,0,0,0.4)',
        'glow-green':  '0 0 20px rgba(34,217,138,0.3)',
        'glow-yellow': '0 0 20px rgba(245,200,66,0.3)',
        'glow-red':    '0 0 20px rgba(255,77,109,0.3)',
      },
    },
  },
  plugins: [],
};
