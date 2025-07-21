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
      // Основная палитра (ч/б стиль с акцентами)
      primary: {
        50: '#f8f9fa',
        100: '#f1f3f4',
        200: '#e8eaed',
        300: '#dadce0',
        400: '#bdc1c6',
        500: '#9aa0a6',
        600: '#80868b',
        700: '#5f6368',
        800: '#3c4043',
        900: '#202124',
      },

      // Акцентные цвета
      accent: {
        blue: '#1a73e8',
        green: '#34a853',
        yellow: '#fbbc04',
        red: '#ea4335',
        purple: '#9c27b0',
        orange: '#ff9800',
      },

      // Семантические цвета
      success: '#34a853',
      warning: '#fbbc04',
      error: '#ea4335',
      info: '#1a73e8',
    },

    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },

    animation: {
      'fade-in': 'fadeIn 0.3s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'slide-down': 'slideDown 0.3s ease-out',
    },
  },

  shortcuts: {
    // Утилиты для быстрой стилизации
    'btn-primary':
      'bg-primary-900 hover:bg-primary-800 text-white px-4 py-2 rounded-lg font-medium transition-colors',
    'btn-secondary':
      'bg-primary-100 hover:bg-primary-200 text-primary-900 px-4 py-2 rounded-lg font-medium transition-colors',
    card: 'bg-white dark:bg-primary-800 border border-primary-200 dark:border-primary-700 rounded-xl shadow-sm',
    input:
      'border border-primary-300 dark:border-primary-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent-blue',
  },
})
