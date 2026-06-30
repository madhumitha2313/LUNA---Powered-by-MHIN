/**
 * LUNA — "Moonlight Serenity" design token system.
 *
 * Single source of truth for the Tailwind theme. Every color, font, radius and
 * shadow used across the app must come from here (or the matching CSS variables
 * in src/index.css) — never hardcode a hex value or font-family per component.
 *
 * Colors are wired to CSS variables so a future light-mode alternate can swap
 * the variable values without touching component code.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)',
        },
        accent: {
          primary: 'var(--accent-primary)',
          secondary: 'var(--accent-secondary)',
          ai: 'var(--accent-ai)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        subtle: 'var(--border)',
      },
      fontFamily: {
        // Headings: General Sans. Body: Inter. Numbers/stats: Manrope.
        heading: ['"General Sans"', 'Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        stat: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Type scale from the spec.
        hero: ['3rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }], // 48px
        section: ['2rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }], // 32px
        body: ['1rem', { lineHeight: '1.65' }], // 16px
        caption: ['0.8125rem', { lineHeight: '1.5' }], // 13px
      },
      borderRadius: {
        // 24px on cards is the house default.
        card: '1.5rem',
        pill: '999px',
      },
      boxShadow: {
        // Soft, diffuse — never hard drop-shadows.
        soft: '0 8px 30px rgba(0, 0, 0, 0.25)',
        lift: '0 18px 50px rgba(0, 0, 0, 0.35)',
        glow: '0 0 60px rgba(217, 123, 168, 0.25)',
        'glow-ai': '0 0 60px rgba(167, 139, 250, 0.22)',
      },
      backdropBlur: {
        nav: '18px',
      },
      transitionTimingFunction: {
        // House easing — used by the 250ms transitions throughout.
        luna: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        250: '250ms',
      },
      keyframes: {
        // Idle "breathing" pulse for the voice button.
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.06)', opacity: '1' },
        },
        // Concentric ripple rings radiating from the idle voice button.
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '0.5' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        // Soft entrance for cards / sections on mount + scroll.
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Extraction chips popping in during voice capture.
        'chip-in': {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.92)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        // Slow drift for background stars / moon glow.
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        breathe: 'breathe 4s ease-in-out infinite',
        ripple: 'ripple 3s ease-out infinite',
        'fade-up': 'fade-up 250ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'chip-in': 'chip-in 250ms cubic-bezier(0.4, 0, 0.2, 1) both',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}
