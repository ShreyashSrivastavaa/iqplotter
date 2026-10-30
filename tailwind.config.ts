import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
          subtle: 'var(--ink-subtle)',
        },
        line: 'var(--line)',
        outline: 'var(--outline)',
        card: 'var(--card)',
        pill: {
          bg: 'var(--pill-bg)',
          active: 'var(--pill-active)',
          border: 'var(--pill-border)',
        },
        accent: {
          orange: 'var(--accent-orange)',
        },
        danger: 'var(--danger)',
        warning: 'var(--warning)',
        success: 'var(--success)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'showcase-gradient': 'var(--gradient)',
      },
      boxShadow: {
        innerCard: 'var(--card-shadow, 0 8px 30px rgba(60, 40, 20, 0.08))',
      },
    },
  },
  plugins: [],
} satisfies Config;
