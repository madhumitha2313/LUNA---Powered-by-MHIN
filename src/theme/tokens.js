/**
 * JS mirror of the "Moonlight Serenity" design tokens.
 *
 * Use these when a value is needed in JavaScript (canvas/SVG drawing, inline
 * style interpolation, animation libraries) where a Tailwind class or CSS var
 * isn't reachable. Keep this in lockstep with src/index.css and
 * tailwind.config.js — they are the same token set expressed three ways.
 */

export const colors = {
  bg: {
    primary: '#0D1117',
    secondary: '#171C28',
    card: '#1E2433',
  },
  accent: {
    primary: '#D97BA8',
    secondary: '#F5C6D6',
    ai: '#A78BFA',
  },
  success: '#6EE7B7',
  warning: '#FBBF24',
  danger: '#FB7185',
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    muted: '#94A3B8',
  },
  border: 'rgba(255,255,255,0.08)',
}

export const typography = {
  fonts: {
    heading: '"General Sans", Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
    stat: 'Manrope, Inter, system-ui, sans-serif',
  },
  sizes: {
    hero: '48px',
    section: '32px',
    body: '16px',
    caption: '13px',
  },
}

export const motion = {
  // House timing — 250ms ease-in-out everywhere.
  duration: 250,
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
}

export const radius = {
  card: '24px',
  pill: '999px',
}

export default { colors, typography, motion, radius }
