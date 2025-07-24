// uno.config.ts
import { defineConfig, presetUno, presetAttributify, presetWebFonts, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno({ dark: 'class' }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: 'JetBrains Mono:400,500,600',
      },
    }),
  ],
  // Ensure UnoCSS works well with other potential libraries
  safelist: ['prose', 'prose-sm', 'm-auto', 'text-left'],

  theme: {
    colors: {
      // Zinc palette (shadcn/ui style)
      zinc: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
        950: '#09090b',
      },

      // Primary colors (slate-based)
      primary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
      },

      // Border and background
      border: '#e2e8f0',
      input: '#ffffff',
      ring: '#64748b',
      background: '#ffffff',
      foreground: '#0f172a',

      // Semantic colors
      muted: {
        DEFAULT: '#f1f5f9',
        foreground: '#64748b',
      },
      accent: {
        DEFAULT: '#f1f5f9',
        foreground: '#0f172a',
      },
      destructive: {
        DEFAULT: '#ef4444',
        foreground: '#ffffff',
      },

      // Accent colors
      blue: '#3b82f6',
      green: '#10b981',
      yellow: '#f59e0b',
      red: '#ef4444',
      purple: '#8b5cf6',
      orange: '#f97316',
    },

    // Rounded corners (more generous)
    borderRadius: {
      none: '0px',
      sm: '0.375rem',
      DEFAULT: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      '2xl': '2rem',
      full: '9999px',
    },

    // Box shadows (softer)
    boxShadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      none: '0 0 #0000',
    },

    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },

    animation: {
      'fade-in': 'fadeIn 0.2s ease-in-out',
      'slide-up': 'slideUp 0.2s ease-out',
      'slide-down': 'slideDown 0.2s ease-out',
      'scale-in': 'scaleIn 0.2s ease-out',
    },
  },

  shortcuts: {
    // Modern button styles
    'btn-primary':
      'bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md',
    'btn-secondary':
      'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 px-4 py-2 rounded-lg font-medium transition-all duration-200',
    'btn-ghost':
      'hover:bg-zinc-100 text-zinc-700 px-4 py-2 rounded-lg font-medium transition-all duration-200',
    'btn-outline':
      'border border-zinc-300 hover:bg-zinc-50 text-zinc-700 px-4 py-2 rounded-lg font-medium transition-all duration-200',

    // Modern card styles
    'card': 'bg-white border border-zinc-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200',
    'card-hover': 'hover:border-zinc-300 hover:shadow-lg transition-all duration-200',

    // Modern input styles
    'input-field':
      'border border-zinc-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent transition-all duration-200',

    // Layout helpers
    'sidebar': 'bg-zinc-50 border-r border-zinc-200',
    'header': 'bg-white border-b border-zinc-200',
  },
})
