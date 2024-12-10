import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',

        card: 'var(--card)',
        'card-foreground--placeholder': 'var(--card-foreground--placeholder)'
      }
    }
  },

  plugins: [typography]
} as Config;
